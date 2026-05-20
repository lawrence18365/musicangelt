#!/usr/bin/env node
/**
 * Check the live deployment wiring for MusicAngel.
 *
 *   node scripts/deployment-check.js
 *
 * Reports DNS, HTTP server headers, and whether the live host is still GitHub
 * Pages, Cloudflare Pages, or Vercel. It also sends a honeypot POST to the
 * Cloudflare Pages API bridge; the handler drops that payload without email.
 */
const dns = require('dns').promises;
const fs = require('fs');
const https = require('https');
const path = require('path');

const HOSTS = ['musicangel.ie', 'www.musicangel.ie'];
const EXPECTED_VERCEL_A = '76.76.21.21';
const CLOUDFLARE_PAGES_TARGET = 'musicangelt.pages.dev';
const CLOUDFLARE_API = `https://${CLOUDFLARE_PAGES_TARGET}/api/enquiry`;
const CLOUDFLARE_ACCOUNT_ID = process.env.CLOUDFLARE_ACCOUNT_ID || '5f96fef6f6606249f9ab055ae29545ff';
const CLOUDFLARE_PROJECT = 'musicangelt';
const NOT_FOUND_TEST_PATH = '/definitely-not-a-real-page-deployment-check/';
const WRANGLER_CONFIG = path.join(
    process.env.HOME || '',
    'Library/Preferences/.wrangler/config/default.toml'
);
const GITHUB_PAGES_A = new Set([
    '185.199.108.153',
    '185.199.109.153',
    '185.199.110.153',
    '185.199.111.153'
]);

async function resolveSafe(kind, host) {
    try {
        if (kind === 'A') return await dns.resolve4(host);
        if (kind === 'CNAME') return await dns.resolveCname(host);
        if (kind === 'NS') return await dns.resolveNs(host);
    } catch (err) {
        return [];
    }
    return [];
}

async function headSafe(url, ip = '') {
    return new Promise(resolve => {
        const target = new URL(url);
        // Connect to the freshly resolved IP so macOS DNS cache cannot mask a cutover.
        const req = https.request({
            method: 'HEAD',
            hostname: ip || target.hostname,
            servername: target.hostname,
            path: `${target.pathname}${target.search}`,
            headers: { Host: target.host },
            timeout: 10000
        }, resp => {
            resp.resume();
            resp.on('end', () => resolve({
                status: resp.statusCode,
                server: resp.headers.server || '',
                location: resp.headers.location || '',
                robots: resp.headers['x-robots-tag'] || ''
            }));
        });

        req.on('timeout', () => req.destroy(new Error('request timed out')));
        req.on('error', err => resolve({ error: err.message }));
        req.end();
    });
}

function classify(aRecords, server) {
    if (aRecords.includes(EXPECTED_VERCEL_A) || /vercel/i.test(server)) return 'Vercel';
    if (/cloudflare/i.test(server)) return 'Cloudflare Pages';
    if (aRecords.some(ip => GITHUB_PAGES_A.has(ip)) || /github/i.test(server)) return 'GitHub Pages';
    return 'Unknown';
}

async function testCloudflareBridge() {
    try {
        const resp = await fetch(CLOUDFLARE_API, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Origin: 'https://musicangel.ie'
            },
            body: JSON.stringify({ hp: 'deployment-check' })
        });
        return {
            status: resp.status,
            body: await resp.text()
        };
    } catch (err) {
        return { error: err.message };
    }
}

function readWranglerToken() {
    try {
        const text = fs.readFileSync(WRANGLER_CONFIG, 'utf8');
        const expires = text.match(/^expiration_time\s*=\s*"?([^"\n]+)"?/m)?.[1];
        if (expires && Date.parse(expires) <= Date.now() + 60 * 1000) return '';
        return text.match(/^oauth_token\s*=\s*"([^"]+)"/m)?.[1]
            || text.match(/^oauth_token\s*=\s*'([^']+)'/m)?.[1]
            || text.match(/^oauth_token\s*=\s*(\S+)/m)?.[1];
    } catch (_) {
        return '';
    }
}

async function getCloudflarePagesDomains() {
    const token = process.env.CLOUDFLARE_API_TOKEN || readWranglerToken();
    if (!token) return { skipped: 'no Cloudflare token found' };

    try {
        const resp = await fetch(
            `https://api.cloudflare.com/client/v4/accounts/${CLOUDFLARE_ACCOUNT_ID}/pages/projects/${CLOUDFLARE_PROJECT}/domains`,
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            }
        );
        const body = await resp.json();
        if (!resp.ok || body.success === false) {
            const errors = (body.errors || []).map(err => err.message).join('; ') || resp.statusText;
            return { error: errors };
        }
        return { domains: body.result || [] };
    } catch (err) {
        return { error: err.message };
    }
}

async function main() {
    const ns = await resolveSafe('NS', 'musicangel.ie');
    console.log('\nMusicAngel deployment check\n');
    console.log('Nameservers:');
    for (const record of ns) console.log(`  - ${record}`);
    if (!ns.length) console.log('  - none resolved');

    for (const host of HOSTS) {
        const a = await resolveSafe('A', host);
        const cname = await resolveSafe('CNAME', host);
        const resolvedIp = a[0] || '';
        const https = await headSafe(`https://${host}/`, resolvedIp);
        const api = await headSafe(`https://${host}/api/enquiry`, resolvedIp);
        const notFound = await headSafe(`https://${host}${NOT_FOUND_TEST_PATH}`, resolvedIp);
        const platform = classify(a, https.server || '');

        console.log(`\n${host}`);
        console.log(`  A:      ${a.length ? a.join(', ') : '-'}`);
        console.log(`  CNAME:  ${cname.length ? cname.join(', ') : '-'}`);
        console.log(`  HTTPS:  ${https.error ? https.error : `${https.status} server=${https.server || '-'}`}`);
        console.log(`  API:    ${api.error ? api.error : `${api.status} server=${api.server || '-'}`}`);
        console.log(`  404:    ${notFound.error ? notFound.error : `${notFound.status} ${NOT_FOUND_TEST_PATH}`}`);
        console.log(`  Host:   ${platform}`);

        if (platform === 'GitHub Pages') {
            console.log('  Action: production DNS has drifted back to GitHub Pages. Restore Cloudflare Pages DNS.');
        } else if (platform === 'Vercel' && api.status === 503) {
            console.log('  Action: Vercel is live, but RESEND_API_KEY is missing or email backend is not configured.');
        } else if (platform === 'Vercel') {
            console.log('  Action: DNS is on Vercel. Confirm enquiry POST works with a real form test.');
        } else if (platform === 'Cloudflare Pages') {
            console.log('  Action: DNS is on Cloudflare Pages. Confirm musicangel.ie/api/enquiry accepts POST.');
        }
        if (notFound.status && notFound.status !== 404) {
            console.log('  Action: unknown paths should return 404. Deploy the top-level 404.html before requesting indexing.');
        }
    }

    const bridge = await testCloudflareBridge();
    console.log('\nCloudflare Pages API bridge:');
    console.log(`  URL:    ${CLOUDFLARE_API}`);
    console.log(`  POST:   ${bridge.error ? bridge.error : `${bridge.status} ${bridge.body}`}`);

    const pageDomains = await getCloudflarePagesDomains();
    console.log('\nCloudflare Pages custom domains:');
    if (pageDomains.skipped) {
        console.log(`  ${pageDomains.skipped}`);
    } else if (pageDomains.error) {
        console.log(`  fetch failed: ${pageDomains.error}`);
    } else if (!pageDomains.domains.length) {
        console.log('  no custom domains configured');
    } else {
        for (const domain of pageDomains.domains) {
            const verification = domain.verification_data && domain.verification_data.status;
            const error = domain.verification_data && domain.verification_data.error_message;
            console.log(`  ${domain.name}: ${domain.status}${verification ? ` verification=${verification}` : ''}${error ? ` (${error})` : ''}`);
        }
    }

    console.log('\nExpected final Cloudflare Pages DNS:');
    console.log(`  CNAME @   ${CLOUDFLARE_PAGES_TARGET}  proxied`);
    console.log(`  CNAME www ${CLOUDFLARE_PAGES_TARGET}  proxied`);

    console.log('\nVercel fallback DNS if Cloudflare Pages is abandoned:');
    console.log(`  A @   ${EXPECTED_VERCEL_A}  DNS only`);
    console.log(`  A www ${EXPECTED_VERCEL_A}  DNS only`);
}

main().catch(err => {
    console.error(err);
    process.exit(1);
});
