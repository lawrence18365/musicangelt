#!/usr/bin/env node
/**
 * Cut musicangel.ie over from GitHub Pages DNS to Cloudflare Pages.
 *
 * Dry run:
 *   node scripts/cloudflare-dns-cutover.js
 *
 * Execute:
 *   CLOUDFLARE_API_TOKEN=... node scripts/cloudflare-dns-cutover.js --execute
 *
 * The token needs Cloudflare DNS read/write access for the musicangel.ie zone.
 * If no CLOUDFLARE_API_TOKEN is set, the script falls back to Wrangler's local
 * OAuth token, which may not have DNS permissions.
 */
const fs = require('fs');
const path = require('path');

const ZONE_NAME = 'musicangel.ie';
const TARGET = 'musicangelt.pages.dev';
const EXECUTE = process.argv.includes('--execute');
const API = 'https://api.cloudflare.com/client/v4';
const WRANGLER_CONFIG = path.join(
    process.env.HOME || '',
    'Library/Preferences/.wrangler/config/default.toml'
);

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

const token = process.env.CLOUDFLARE_API_TOKEN || readWranglerToken();
if (!token) {
    console.error('No valid Cloudflare token found. Set CLOUDFLARE_API_TOKEN with DNS edit permission.');
    process.exit(1);
}

async function cf(pathname, init = {}) {
    const response = await fetch(`${API}${pathname}`, {
        ...init,
        headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
            ...(init.headers || {})
        }
    });
    const body = await response.json().catch(() => ({}));
    if (!response.ok || body.success === false) {
        const errors = (body.errors || []).map(err => err.message).join('; ') || response.statusText;
        const hint = response.status === 403
            ? 'Token is missing DNS read/write permission for this zone.'
            : '';
        throw new Error(`${init.method || 'GET'} ${pathname} failed: ${errors}${hint ? ` ${hint}` : ''}`);
    }
    return body.result;
}

async function getZone() {
    const zones = await cf(`/zones?name=${encodeURIComponent(ZONE_NAME)}`);
    const zone = zones && zones[0];
    if (!zone) throw new Error(`Zone not found: ${ZONE_NAME}`);
    return zone;
}

async function listRecords(zoneId) {
    const names = [ZONE_NAME, `www.${ZONE_NAME}`];
    const records = [];
    for (const name of names) {
        const result = await cf(`/zones/${zoneId}/dns_records?name=${encodeURIComponent(name)}&per_page=100`);
        records.push(...result);
    }
    return records;
}

function describe(record) {
    return `${record.type} ${record.name} -> ${record.content}${record.proxied ? ' (proxied)' : ''}`;
}

async function main() {
    const zone = await getZone();
    const records = await listRecords(zone.id);
    const mutable = records.filter(record => ['A', 'AAAA', 'CNAME'].includes(record.type));
    const wanted = [
        { name: ZONE_NAME, label: '@' },
        { name: `www.${ZONE_NAME}`, label: 'www' }
    ];

    console.log(`${EXECUTE ? 'Executing' : 'Dry run'} Cloudflare DNS cutover for ${ZONE_NAME}`);
    console.log(`Target: CNAME @ and www -> ${TARGET}, proxied\n`);

    for (const record of mutable) {
        if (record.type === 'CNAME' && record.content === TARGET && record.proxied) continue;
        console.log(`${EXECUTE ? 'Delete' : 'Would delete'} ${describe(record)}`);
        if (EXECUTE) await cf(`/zones/${zone.id}/dns_records/${record.id}`, { method: 'DELETE' });
    }

    const afterDeletes = EXECUTE ? await listRecords(zone.id) : records;
    for (const item of wanted) {
        const existing = afterDeletes.find(record => record.type === 'CNAME' && record.name === item.name && record.content === TARGET);
        if (existing) {
            if (!existing.proxied) {
                console.log(`${EXECUTE ? 'Update' : 'Would update'} ${item.label} CNAME to proxied`);
                if (EXECUTE) {
                    await cf(`/zones/${zone.id}/dns_records/${existing.id}`, {
                        method: 'PATCH',
                        body: JSON.stringify({ proxied: true })
                    });
                }
            }
            continue;
        }

        console.log(`${EXECUTE ? 'Create' : 'Would create'} CNAME ${item.label} -> ${TARGET} (proxied)`);
        if (EXECUTE) {
            await cf(`/zones/${zone.id}/dns_records`, {
                method: 'POST',
                body: JSON.stringify({
                    type: 'CNAME',
                    name: item.name,
                    content: TARGET,
                    ttl: 1,
                    proxied: true
                })
            });
        }
    }

    if (!EXECUTE) {
        console.log('\nNo changes made. Re-run with --execute using a token that has DNS edit permission.');
        return;
    }

    console.log('\nDNS cutover submitted. Verify with:');
    console.log('  node scripts/deployment-check.js');
    console.log('  curl -I https://musicangel.ie/api/enquiry');
}

main().catch(error => {
    console.error(error.message);
    process.exit(1);
});
