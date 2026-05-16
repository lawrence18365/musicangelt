#!/usr/bin/env node
/**
 * One-click Google Search Console setup for musicangel.ie.
 *
 *   node scripts/setup-gsc.js
 *
 * Does the OAuth dance (browser opens, user clicks once), then:
 *   1. Adds https://musicangel.ie/ as a URL-prefix property
 *   2. Verifies ownership via the Google Analytics method (auto, since GA4
 *      property properties/537964782 is live on the site)
 *   3. Submits sitemap.xml
 *
 * Caches the new token at .gsc-write-token.json in this repository.
 * so subsequent runs don't need a fresh browser auth.
 *
 * Required env vars (already used by other scripts):
 *   GOOGLE_OAUTH_CLIENT_ID
 *   GOOGLE_OAUTH_CLIENT_SECRET
 */
const fs = require('fs');
const http = require('http');
const url = require('url');
const { exec } = require('child_process');
const path = require('path');

const CLIENT_ID = process.env.GOOGLE_OAUTH_CLIENT_ID;
const CLIENT_SECRET = process.env.GOOGLE_OAUTH_CLIENT_SECRET;
const SITE_URL = 'https://musicangel.ie/';
const SITEMAP_URL = 'sitemap.xml';
const REDIRECT_PORT = 3849;
const REDIRECT_URI = `http://localhost:${REDIRECT_PORT}`;
const ROOT = path.resolve(__dirname, '..');
const TOKEN_PATH = path.join(ROOT, '.gsc-write-token.json');

const SCOPES = [
    'https://www.googleapis.com/auth/webmasters',           // full read+write
    'https://www.googleapis.com/auth/siteverification'      // for verify method
];

if (!CLIENT_ID || !CLIENT_SECRET) {
    console.error('Need GOOGLE_OAUTH_CLIENT_ID and GOOGLE_OAUTH_CLIENT_SECRET env vars.');
    process.exit(1);
}

async function refreshToken(rt) {
    const body = new URLSearchParams({
        client_id: CLIENT_ID,
        client_secret: CLIENT_SECRET,
        refresh_token: rt,
        grant_type: 'refresh_token'
    });
    const r = await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: body.toString()
    });
    return r.json();
}

async function exchangeCodeForToken(code) {
    const body = new URLSearchParams({
        code,
        client_id: CLIENT_ID,
        client_secret: CLIENT_SECRET,
        redirect_uri: REDIRECT_URI,
        grant_type: 'authorization_code'
    });
    const r = await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: body.toString()
    });
    return r.json();
}

async function getAccessToken() {
    if (fs.existsSync(TOKEN_PATH)) {
        const cached = JSON.parse(fs.readFileSync(TOKEN_PATH, 'utf8'));
        const refreshed = await refreshToken(cached.refresh_token);
        if (refreshed.access_token) {
            console.log('  ✓ Reused cached refresh token.');
            return refreshed.access_token;
        }
    }

    return new Promise((resolve, reject) => {
        const authUrl =
            'https://accounts.google.com/o/oauth2/v2/auth?' +
            new URLSearchParams({
                client_id: CLIENT_ID,
                redirect_uri: REDIRECT_URI,
                response_type: 'code',
                scope: SCOPES.join(' '),
                access_type: 'offline',
                prompt: 'consent'
            }).toString();

        const server = http.createServer(async (req, res) => {
            const q = url.parse(req.url, true).query;
            if (!q.code) {
                res.writeHead(400, { 'Content-Type': 'text/html' });
                res.end('<h1>No auth code returned. Try again.</h1>');
                return;
            }
            res.writeHead(200, { 'Content-Type': 'text/html' });
            res.end('<h1>GSC auth complete.</h1><p>You can close this tab.</p>');
            server.close();

            try {
                const tokens = await exchangeCodeForToken(q.code);
                if (!tokens.refresh_token) throw new Error(`No refresh_token in response: ${JSON.stringify(tokens)}`);
                fs.writeFileSync(TOKEN_PATH, JSON.stringify(tokens, null, 2));
                console.log(`  ✓ Token saved to ${TOKEN_PATH}`);
                resolve(tokens.access_token);
            } catch (e) {
                reject(e);
            }
        });

        server.listen(REDIRECT_PORT, () => {
            console.log(`\n  Opening browser for one-time consent...`);
            console.log(`  If the browser doesn't open, paste this URL:\n  ${authUrl}\n`);
            exec(`open "${authUrl}"`);
        });
    });
}

async function gsc(method, pathname, body, token) {
    const r = await fetch(`https://www.googleapis.com${pathname}`, {
        method,
        headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
        },
        body: body ? JSON.stringify(body) : undefined
    });
    const text = await r.text();
    if (!r.ok && r.status !== 204) {
        throw new Error(`${method} ${pathname} → ${r.status}: ${text}`);
    }
    return text ? JSON.parse(text) : null;
}

async function siteVerification(method, pathname, body, token) {
    const r = await fetch(`https://www.googleapis.com${pathname}`, {
        method,
        headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
        },
        body: body ? JSON.stringify(body) : undefined
    });
    const text = await r.text();
    if (!r.ok) {
        throw new Error(`${method} ${pathname} → ${r.status}: ${text}`);
    }
    return text ? JSON.parse(text) : null;
}

async function main() {
    console.log('GSC one-click setup for musicangel.ie\n');
    console.log('Step 1/4: Authenticate (one-time consent)');
    const token = await getAccessToken();

    console.log('\nStep 2/4: Add musicangel.ie as URL-prefix property to Search Console');
    try {
        await gsc('PUT', `/webmasters/v3/sites/${encodeURIComponent(SITE_URL)}`, null, token);
        console.log(`  ✓ Added ${SITE_URL}`);
    } catch (e) {
        if (String(e).includes('409')) console.log('  ✓ Already added');
        else throw e;
    }

    console.log('\nStep 3/4: Verify ownership via Google Analytics method');
    try {
        const verifyResult = await siteVerification('POST',
            `/siteVerification/v1/webResource?verificationMethod=ANALYTICS`,
            { site: { type: 'SITE', identifier: SITE_URL } },
            token
        );
        console.log(`  ✓ Verified: ${verifyResult.id || 'OK'}`);
    } catch (e) {
        console.log(`  ⚠️  ANALYTICS verification failed: ${e.message}`);
        console.log('  Trying META tag verification as a fallback...');
        try {
            // Get the META token GSC expects
            const tokenResp = await siteVerification('POST',
                `/siteVerification/v1/token`,
                { verificationMethod: 'META', site: { type: 'SITE', identifier: SITE_URL } },
                token
            );
            console.log(`  ⚠️  GSC expects this <meta> token: ${tokenResp.token}`);
            console.log('     This repo no longer ships a placeholder meta tag because the domain property is verified.');
            console.log('     Prefer the active sc-domain:musicangel.ie property, or add a real token intentionally before verifying a URL-prefix property.');
        } catch (innerErr) {
            console.log(`  ⚠️  META token request also failed: ${innerErr.message}`);
        }
    }

    console.log('\nStep 4/4: Submit sitemap');
    try {
        await gsc('PUT', `/webmasters/v3/sites/${encodeURIComponent(SITE_URL)}/sitemaps/${encodeURIComponent(SITEMAP_URL)}`, null, token);
        console.log(`  ✓ Sitemap submitted: ${SITE_URL}${SITEMAP_URL}`);
    } catch (e) {
        console.log(`  ⚠️  Sitemap submit failed: ${e.message}`);
    }

    // Verify by listing
    console.log('\nFinal check — sites in your account containing "musicangel":');
    const sites = await gsc('GET', '/webmasters/v3/sites', null, token);
    const ours = (sites.siteEntry || []).filter(s => s.siteUrl.includes('musicangel'));
    for (const s of ours) console.log(`  ${s.permissionLevel}  ${s.siteUrl}`);

    console.log('\nDone.');
}

main().catch(e => { console.error('\nERROR:', e.message); process.exit(1); });
