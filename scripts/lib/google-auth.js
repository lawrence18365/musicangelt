'use strict';

/**
 * Google API auth helper for MusicAngel scripts.
 *
 * Credential sources, tried in priority order until one succeeds:
 *   1. Legacy user-OAuth refresh token.
 *      Requires process.env.GOOGLE_OAUTH_CLIENT_ID + GOOGLE_OAUTH_CLIENT_SECRET
 *      and a refresh token from process.env.GOOGLE_REFRESH_TOKEN or one of the
 *      legacy token files (.tokens/.gsc-token.json / .tokens/.ga4-admin-token.json,
 *      or the paths in GSC_TOKEN_PATH / GA4_TOKEN_PATH).
 *   2. gcloud Application Default Credentials (authorized_user).
 *      Loaded from process.env.GOOGLE_APPLICATION_CREDENTIALS if set, else
 *      ~/.config/gcloud/application_default_credentials.json. Exchanged with
 *      grant_type=refresh_token using the file's own client_id/client_secret.
 *   3. Service-account JWT (never expires, works in CI forever).
 *      Key comes from (in order of preference):
 *        process.env.GOOGLE_SERVICE_ACCOUNT_JSON - raw JSON string (CI secret)
 *        process.env.GOOGLE_SERVICE_ACCOUNT_PATH - path to a key file
 *        .tokens/google-ads-service-account.json - repo-local default
 *
 * On failure each source falls through to the next. The name of the source
 * that produced the current token is recorded (never the token/key material)
 * and can be read via getLastAuthSource().
 *
 * No npm dependencies: uses the built-in 'crypto'/'os' modules and global fetch.
 */

const fs = require('fs');
const os = require('os');
const path = require('path');
const crypto = require('crypto');

const TOKEN_URL = 'https://oauth2.googleapis.com/token';
const JWT_GRANT_TYPE = 'urn:ietf:params:oauth:grant-type:jwt-bearer';
const DEFAULT_SA_PATH = path.resolve(__dirname, '..', '..', '.tokens', 'google-ads-service-account.json');
const DEFAULT_ADC_PATH = path.join(os.homedir(), '.config', 'gcloud', 'application_default_credentials.json');

// Access tokens are cached per scope-set until ~5 minutes before expiry.
const CACHE_SAFETY_MS = 5 * 60 * 1000;
const tokenCache = new Map();

function base64url(input) {
    return Buffer.from(input)
        .toString('base64')
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=+$/, '');
}

/**
 * Load the service-account key as an object, or return null when no key is
 * configured/available (so callers can fall back to the refresh-token flow).
 * Throws a clear error when a key IS configured but cannot be used.
 */
function loadServiceAccountKey() {
    if (process.env.GOOGLE_SERVICE_ACCOUNT_JSON) {
        try {
            return JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_JSON);
        } catch (err) {
            throw new Error(
                `GOOGLE_SERVICE_ACCOUNT_JSON is set but is not valid JSON: ${err.message}. ` +
                `It must hold the full service-account key file contents.`
            );
        }
    }

    const explicitPath = process.env.GOOGLE_SERVICE_ACCOUNT_PATH;
    const keyPath = explicitPath || DEFAULT_SA_PATH;

    if (!fs.existsSync(keyPath)) {
        if (explicitPath) {
            throw new Error(
                `Service-account key file not found at GOOGLE_SERVICE_ACCOUNT_PATH (${keyPath}). ` +
                `Fix the path or set GOOGLE_SERVICE_ACCOUNT_JSON to the raw key JSON.`
            );
        }
        return null; // default location missing -> try the next source
    }

    let key;
    try {
        key = JSON.parse(fs.readFileSync(keyPath, 'utf8'));
    } catch (err) {
        throw new Error(`Service-account key file at ${keyPath} exists but could not be parsed: ${err.message}`);
    }
    if (!key.client_email || !key.private_key) {
        throw new Error(`Service-account key at ${keyPath} is missing client_email or private_key. Use a valid Google service-account key.`);
    }
    return key;
}

/**
 * Load gcloud Application Default Credentials (authorized_user) as an object,
 * or return null when none is configured/available (so callers can fall back
 * to the next source). Throws a clear error when an explicit path is set but
 * cannot be read/parsed.
 *
 * Detection is by content, not by the 'type' field: older gcloud versions
 * wrote authorized_user files without a guaranteed 'type', so we accept any
 * file that carries refresh_token + client_id + client_secret.
 */
function loadAdcCredentials() {
    const explicitPath = process.env.GOOGLE_APPLICATION_CREDENTIALS;
    const adcPath = explicitPath || DEFAULT_ADC_PATH;

    if (!fs.existsSync(adcPath)) {
        if (explicitPath) {
            throw new Error(
                `ADC file not found at GOOGLE_APPLICATION_CREDENTIALS (${adcPath}). ` +
                `Run 'gcloud auth application-default login' or fix the path.`
            );
        }
        return null; // default location missing -> try the next source
    }

    let creds;
    try {
        creds = JSON.parse(fs.readFileSync(adcPath, 'utf8'));
    } catch (err) {
        throw new Error(`ADC file at ${adcPath} exists but could not be parsed: ${err.message}`);
    }

    if (creds.refresh_token && creds.client_id && creds.client_secret) {
        return {
            client_id: creds.client_id,
            client_secret: creds.client_secret,
            refresh_token: creds.refresh_token,
        };
    }
    return null; // present but not an authorized_user ADC -> try the next source
}

/** Find a legacy user-OAuth refresh token, or null. */
function findRefreshToken() {
    if (process.env.GOOGLE_REFRESH_TOKEN) return process.env.GOOGLE_REFRESH_TOKEN;

    const candidates = [
        process.env.GSC_TOKEN_PATH,
        process.env.GA4_TOKEN_PATH,
        path.resolve(__dirname, '..', '..', '.tokens', '.gsc-token.json'),
        path.resolve(__dirname, '..', '..', '.tokens', '.ga4-admin-token.json'),
    ].filter(Boolean);

    for (const file of candidates) {
        try {
            const parsed = JSON.parse(fs.readFileSync(file, 'utf8'));
            if (parsed.refresh_token) return parsed.refresh_token;
        } catch (err) {
            // Missing or unreadable token file: try the next candidate.
        }
    }
    return null;
}

async function exchange(body) {
    const resp = await fetch(TOKEN_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body,
    });
    const data = await resp.json().catch(() => ({}));
    if (!resp.ok || !data.access_token) {
        const detail = data.error_description || data.error || `HTTP ${resp.status}`;
        throw new Error(`Google token exchange failed: ${detail}`);
    }
    return { access_token: data.access_token, expires_in: data.expires_in || 3600 };
}

/** Service-account path: sign an RS256 JWT and exchange it for an access token. */
async function getTokenWithServiceAccount(key, scopes) {
    const now = Math.floor(Date.now() / 1000);
    const header = { alg: 'RS256', typ: 'JWT' };
    const claim = {
        iss: key.client_email,
        scope: scopes.join(' '),
        aud: TOKEN_URL,
        exp: now + 3600,
        iat: now,
    };
    const unsigned = `${base64url(JSON.stringify(header))}.${base64url(JSON.stringify(claim))}`;
    const signature = crypto.createSign('RSA-SHA256').update(unsigned).sign(key.private_key);
    const assertion = `${unsigned}.${base64url(signature)}`;

    try {
        return await exchange(new URLSearchParams({
            grant_type: JWT_GRANT_TYPE,
            assertion,
        }).toString());
    } catch (err) {
        throw new Error(
            `${err.message} (service account ${key.client_email}). ` +
            `Check that the key is valid, not revoked, and that the API is enabled on its GCP project.`
        );
    }
}

/** Exchange a user-OAuth refresh token for an access token (clientId/clientSecret may come from env or an ADC file). */
async function getTokenWithRefreshToken(clientId, clientSecret, refreshToken) {
    const params = new URLSearchParams({
        client_id: clientId,
        client_secret: clientSecret,
        refresh_token: refreshToken,
        grant_type: 'refresh_token',
    });
    try {
        return await exchange(params.toString());
    } catch (err) {
        throw new Error(
            `${err.message}. The user-OAuth refresh token may have expired (invalid_grant); ` +
            `re-authorize it or switch to another credential source.`
        );
    }
}

// Name of the credential source that produced the current token (for logging;
// never holds token or key material).
let lastAuthSource = null;

/**
 * Get an access token for the given scopes (string or array of strings).
 * Tries sources in priority order, falling through on failure:
 *   1. legacy user-OAuth refresh token (env client id/secret + refresh token)
 *   2. gcloud Application Default Credentials
 *   3. service account
 * Caches the token in memory until ~5 minutes before it expires.
 */
async function getAccessToken(scopes) {
    const scopeList = Array.isArray(scopes) ? scopes : [scopes];
    if (!scopeList.length) throw new Error('getAccessToken requires at least one scope');

    const cacheKey = [...scopeList].sort().join(' ');
    const cached = tokenCache.get(cacheKey);
    if (cached && cached.expiresAt > Date.now()) {
        return cached.accessToken;
    }

    const failures = [];
    let token;

    // 1. Legacy user-OAuth refresh token (env client id/secret + refresh token).
    if (process.env.GOOGLE_OAUTH_CLIENT_ID && process.env.GOOGLE_OAUTH_CLIENT_SECRET) {
        const refreshToken = findRefreshToken();
        if (refreshToken) {
            try {
                token = await getTokenWithRefreshToken(
                    process.env.GOOGLE_OAUTH_CLIENT_ID,
                    process.env.GOOGLE_OAUTH_CLIENT_SECRET,
                    refreshToken
                );
                lastAuthSource = 'user OAuth refresh token';
            } catch (err) {
                failures.push(err);
            }
        }
    }

    // 2. gcloud Application Default Credentials (authorized_user).
    if (!token) {
        try {
            const adc = loadAdcCredentials();
            if (adc) {
                token = await getTokenWithRefreshToken(adc.client_id, adc.client_secret, adc.refresh_token);
                lastAuthSource = 'gcloud ADC';
            }
        } catch (err) {
            failures.push(err);
        }
    }

    // 3. Service account.
    if (!token) {
        try {
            const key = loadServiceAccountKey();
            if (key) {
                token = await getTokenWithServiceAccount(key, scopeList);
                lastAuthSource = 'service account';
            }
        } catch (err) {
            failures.push(err);
        }
    }

    if (!token) {
        if (failures.length) {
            throw new Error(
                `All Google credential sources failed:\n  - ${failures.map(f => f.message).join('\n  - ')}\n${noCredentialsHint()}`
            );
        }
        throw noCredentialsError();
    }

    tokenCache.set(cacheKey, {
        accessToken: token.access_token,
        expiresAt: Date.now() + (token.expires_in * 1000) - CACHE_SAFETY_MS,
    });
    return token.access_token;
}

/** Name of the credential source that produced the last token, or null. */
function getLastAuthSource() {
    return lastAuthSource;
}

function noCredentialsHint() {
    return (
        `No Google credential succeeded. Configure one of:\n` +
        `  1. User OAuth: set GOOGLE_OAUTH_CLIENT_ID, GOOGLE_OAUTH_CLIENT_SECRET and a refresh token ` +
        `(GOOGLE_REFRESH_TOKEN, or a token file at GSC_TOKEN_PATH / GA4_TOKEN_PATH, ` +
        `default .tokens/.gsc-token.json or .tokens/.ga4-admin-token.json).\n` +
        `  2. gcloud ADC: run 'gcloud auth application-default login' (default ` +
        `~/.config/gcloud/application_default_credentials.json, or point GOOGLE_APPLICATION_CREDENTIALS at an authorized_user file).\n` +
        `  3. Service account: set GOOGLE_SERVICE_ACCOUNT_JSON to the raw key JSON, ` +
        `or GOOGLE_SERVICE_ACCOUNT_PATH to a key file (default .tokens/google-ads-service-account.json).`
    );
}

function noCredentialsError() {
    return new Error(`No Google credentials available. ${noCredentialsHint()}`);
}

module.exports = { getAccessToken, getLastAuthSource };
