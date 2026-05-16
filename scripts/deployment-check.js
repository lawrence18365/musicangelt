#!/usr/bin/env node
/**
 * Check the live deployment wiring for MusicAngel.
 *
 *   node scripts/deployment-check.js
 *
 * This is intentionally read-only. It reports DNS, HTTP server headers, and
 * whether the live host is still GitHub Pages or has moved to Vercel.
 */
const dns = require('dns').promises;

const HOSTS = ['musicangel.ie', 'www.musicangel.ie'];
const EXPECTED_VERCEL_A = '76.76.21.21';
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

async function headSafe(url) {
    try {
        const resp = await fetch(url, { method: 'HEAD', redirect: 'manual' });
        return {
            status: resp.status,
            server: resp.headers.get('server') || '',
            location: resp.headers.get('location') || '',
            robots: resp.headers.get('x-robots-tag') || ''
        };
    } catch (err) {
        return { error: err.message };
    }
}

function classify(aRecords, server) {
    if (aRecords.includes(EXPECTED_VERCEL_A) || /vercel/i.test(server)) return 'Vercel';
    if (aRecords.some(ip => GITHUB_PAGES_A.has(ip)) || /github/i.test(server)) return 'GitHub Pages';
    return 'Unknown';
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
        const https = await headSafe(`https://${host}/`);
        const api = await headSafe(`https://${host}/api/enquiry`);
        const platform = classify(a, https.server || '');

        console.log(`\n${host}`);
        console.log(`  A:      ${a.length ? a.join(', ') : '-'}`);
        console.log(`  CNAME:  ${cname.length ? cname.join(', ') : '-'}`);
        console.log(`  HTTPS:  ${https.error ? https.error : `${https.status} server=${https.server || '-'}`}`);
        console.log(`  API:    ${api.error ? api.error : `${api.status} server=${api.server || '-'}`}`);
        console.log(`  Host:   ${platform}`);

        if (platform === 'GitHub Pages') {
            console.log('  Action: still pointed at GitHub Pages. Move DNS to Vercel when ready.');
        } else if (platform === 'Vercel' && api.status === 503) {
            console.log('  Action: Vercel is live, but RESEND_API_KEY is missing or email backend is not configured.');
        } else if (platform === 'Vercel') {
            console.log('  Action: DNS is on Vercel. Confirm enquiry POST works with a real form test.');
        }
    }

    console.log('\nExpected Vercel DNS:');
    console.log(`  A @   ${EXPECTED_VERCEL_A}`);
    console.log(`  A www ${EXPECTED_VERCEL_A}`);
}

main().catch(err => {
    console.error(err);
    process.exit(1);
});
