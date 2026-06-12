#!/usr/bin/env node
/**
 * One-time re-auth to mint fresh GSC + GA4 refresh tokens after the old ones
 * were revoked/expired ("invalid_grant").
 *
 *   GOOGLE_OAUTH_CLIENT_ID=... GOOGLE_OAUTH_CLIENT_SECRET=... \
 *     node scripts/reauth-analytics-tokens.js
 *
 * Opens one Google consent screen covering Search Console + GA4 read scopes,
 * then writes the resulting refresh token to BOTH files that weekly-report.js
 * consumes:
 *   .tokens/.gsc-token.json
 *   .tokens/.ga4-admin-token.json
 *
 * A single refresh token carrying all scopes satisfies both APIs, since
 * weekly-report.js only needs a refresh_token per file. After running, push
 * the contents of those files into the GSC_TOKEN_JSON / GA4_TOKEN_JSON repo
 * secrets to fix the weekly workflow.
 */
const fs = require('fs');
const http = require('http');
const url = require('url');
const { exec } = require('child_process');
const path = require('path');

const CLIENT_ID = process.env.GOOGLE_OAUTH_CLIENT_ID;
const CLIENT_SECRET = process.env.GOOGLE_OAUTH_CLIENT_SECRET;
const REDIRECT_PORT = 3849;
const REDIRECT_URI = `http://localhost:${REDIRECT_PORT}`;
const ROOT = path.resolve(__dirname, '..');
const TOKENS_DIR = path.join(ROOT, '.tokens');
const GSC_TOKEN_PATH = path.join(TOKENS_DIR, '.gsc-token.json');
const GA4_TOKEN_PATH = path.join(TOKENS_DIR, '.ga4-admin-token.json');

const SCOPES = [
    'https://www.googleapis.com/auth/webmasters.readonly',
    'https://www.googleapis.com/auth/analytics.readonly'
];

if (!CLIENT_ID || !CLIENT_SECRET) {
    console.error('Need GOOGLE_OAUTH_CLIENT_ID and GOOGLE_OAUTH_CLIENT_SECRET env vars.');
    process.exit(1);
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

function main() {
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
            res.end('<h1>Analytics re-auth complete.</h1><p>You can close this tab.</p>');
            server.close();

            try {
                const tokens = await exchangeCodeForToken(q.code);
                if (!tokens.refresh_token) {
                    throw new Error(`No refresh_token in response: ${JSON.stringify(tokens)}`);
                }
                fs.mkdirSync(TOKENS_DIR, { recursive: true });
                const payload = JSON.stringify(tokens, null, 2);
                fs.writeFileSync(GSC_TOKEN_PATH, payload, { mode: 0o600 });
                fs.writeFileSync(GA4_TOKEN_PATH, payload, { mode: 0o600 });
                console.log(`  ✓ Wrote ${GSC_TOKEN_PATH}`);
                console.log(`  ✓ Wrote ${GA4_TOKEN_PATH}`);
                resolve();
            } catch (e) {
                reject(e);
            }
        });

        server.listen(REDIRECT_PORT, () => {
            console.log(`\n  Opening browser for one-time consent (GSC + GA4)...`);
            console.log(`  If the browser doesn't open, paste this URL:\n  ${authUrl}\n`);
            exec(`open "${authUrl}"`);
        });
    });
}

main().then(() => {
    console.log('\nDone. Now run the report:');
    console.log('  node scripts/weekly-report.js --days=7');
}).catch((e) => {
    console.error('Re-auth failed:', e.message);
    process.exit(1);
});
