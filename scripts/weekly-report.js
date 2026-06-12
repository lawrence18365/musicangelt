#!/usr/bin/env node
/**
 * Weekly GSC + GA4 digest for MusicAngel.
 *
 *   node scripts/weekly-report.js                # last 7 days
 *   node scripts/weekly-report.js --days=28      # last 28 days
 *   node scripts/weekly-report.js --site=sc-domain:musicangel.ie
 *
 * Output: a Markdown report at reports/YYYY-MM-DD-report.md
 *
 * Reads credentials from env-configured token paths. GitHub Actions restores:
 *   .tokens/.gsc-token.json
 *   .tokens/.ga4-admin-token.json
 *
 * Default Search Console site: sc-domain:musicangel.ie.
 */
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const REPORTS_DIR = path.join(ROOT, 'reports');
const GSC_TOKEN_PATH = process.env.GSC_TOKEN_PATH || path.join(ROOT, '.tokens/.gsc-token.json');
const GA4_TOKEN_PATH = process.env.GA4_TOKEN_PATH || path.join(ROOT, '.tokens/.ga4-admin-token.json');
const CLIENT_ID = process.env.GOOGLE_OAUTH_CLIENT_ID;
const CLIENT_SECRET = process.env.GOOGLE_OAUTH_CLIENT_SECRET;
const GA4_PROPERTY = process.env.GA4_PROPERTY || 'properties/537964782';

if (!CLIENT_ID || !CLIENT_SECRET) {
    console.error(`Error: GOOGLE_OAUTH_CLIENT_ID and GOOGLE_OAUTH_CLIENT_SECRET env vars are required.

Set them in your shell profile or pass inline:

    export GOOGLE_OAUTH_CLIENT_ID='...your client id...'
    export GOOGLE_OAUTH_CLIENT_SECRET='...your client secret...'
    node scripts/weekly-report.js

Use the Google Cloud OAuth client that owns the MusicAngel Search Console
and GA4 access tokens restored by the workflow.
`);
    process.exit(1);
}

function parseArgs() {
    const args = { days: 7, site: 'sc-domain:musicangel.ie' };
    for (const a of process.argv.slice(2)) {
        if (a.startsWith('--days=')) args.days = parseInt(a.slice(7), 10);
        if (a.startsWith('--site=')) args.site = a.slice(7);
    }
    return args;
}

async function getToken(tokenPath) {
    const token = JSON.parse(fs.readFileSync(tokenPath, 'utf8'));
    const params = new URLSearchParams({
        client_id: CLIENT_ID,
        client_secret: CLIENT_SECRET,
        refresh_token: token.refresh_token,
        grant_type: 'refresh_token'
    });
    const resp = await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: params.toString()
    });
    const data = await resp.json();
    if (!data.access_token) throw new Error(`Token refresh failed: ${JSON.stringify(data)}`);
    return data.access_token;
}

async function gscQuery(token, site, body) {
    const url = `https://www.googleapis.com/webmasters/v3/sites/${encodeURIComponent(site)}/searchAnalytics/query`;
    const resp = await fetch(url, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
    });
    return resp.json();
}

async function listGscSites(token) {
    const resp = await fetch('https://www.googleapis.com/webmasters/v3/sites', {
        headers: { Authorization: `Bearer ${token}` }
    });
    return resp.json();
}

async function ga4Report(token, body) {
    const url = `https://analyticsdata.googleapis.com/v1beta/${GA4_PROPERTY}:runReport`;
    const resp = await fetch(url, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
    });
    return resp.json();
}

function fmtDate(d) { return d.toISOString().slice(0, 10); }
function pct(n) { return (n * 100).toFixed(1) + '%'; }

async function main() {
    const args = parseArgs();
    const endDate = new Date();
    const startDate = new Date(); startDate.setDate(startDate.getDate() - args.days);
    const start = fmtDate(startDate);
    const end = fmtDate(endDate);

    fs.mkdirSync(REPORTS_DIR, { recursive: true });
    const reportPath = path.join(REPORTS_DIR, `${fmtDate(new Date())}-report.md`);

    console.log(`Pulling ${args.days}-day report (${start} to ${end})...`);

    let gscToken = await getToken(GSC_TOKEN_PATH);
    const sites = await listGscSites(gscToken);
    const ourSites = (sites.siteEntry || []).map(s => s.siteUrl);
    if (!ourSites.includes(args.site)) {
        const available = ourSites.filter(s => s.includes('musicangel')).join(', ') || 'none containing musicangel';
        throw new Error(`${args.site} is not available to this GSC token. Available MusicAngel sites: ${available}`);
    }

    // GSC: top queries + top pages + key counts
    const [queries, pages, total] = await Promise.all([
        gscQuery(gscToken, args.site, { startDate: start, endDate: end, dimensions: ['query'], rowLimit: 30 }),
        gscQuery(gscToken, args.site, { startDate: start, endDate: end, dimensions: ['page'], rowLimit: 20 }),
        gscQuery(gscToken, args.site, { startDate: start, endDate: end, rowLimit: 1 })
    ]);

    const totalImpr = (total.rows && total.rows[0] && total.rows[0].impressions) || 0;
    const totalClicks = (total.rows && total.rows[0] && total.rows[0].clicks) || 0;
    const avgCtr = totalImpr ? (totalClicks / totalImpr) : 0;
    const avgPos = (total.rows && total.rows[0] && total.rows[0].position) || 0;

    // GA4: sessions + key events
    let ga4Pages = { rows: [] }, ga4Events = { rows: [] }, ga4Channels = { rows: [] };
    try {
        const ga4Token = await getToken(GA4_TOKEN_PATH);
        const [p, e, c] = await Promise.all([
            ga4Report(ga4Token, {
                dateRanges: [{ startDate: start, endDate: end }],
                dimensions: [{ name: 'pagePath' }],
                metrics: [{ name: 'screenPageViews' }, { name: 'totalUsers' }, { name: 'eventCount' }, { name: 'keyEvents' }],
                limit: 15,
                orderBys: [{ metric: { metricName: 'screenPageViews' }, desc: true }]
            }),
            ga4Report(ga4Token, {
                dateRanges: [{ startDate: start, endDate: end }],
                dimensions: [{ name: 'eventName' }],
                metrics: [{ name: 'eventCount' }, { name: 'totalUsers' }, { name: 'keyEvents' }],
                limit: 20,
                orderBys: [{ metric: { metricName: 'eventCount' }, desc: true }]
            }),
            ga4Report(ga4Token, {
                dateRanges: [{ startDate: start, endDate: end }],
                dimensions: [{ name: 'sessionDefaultChannelGroup' }],
                metrics: [{ name: 'sessions' }, { name: 'totalUsers' }, { name: 'eventCount' }, { name: 'keyEvents' }, { name: 'sessionKeyEventRate' }],
                limit: 10,
                orderBys: [{ metric: { metricName: 'sessions' }, desc: true }]
            })
        ]);
        ga4Pages = p; ga4Events = e; ga4Channels = c;
    } catch (err) {
        console.log(`  ⚠️  GA4 fetch failed: ${err.message}`);
    }

    // Build report
    let md = `# Weekly Report — ${end}\n\n`;
    md += `**Window:** ${start} to ${end} (${args.days} days)\n`;
    md += `**GSC site:** \`${args.site}\`\n`;
    md += `**GA4 property:** \`${GA4_PROPERTY}\` (MusicAngel)\n\n`;
    md += `---\n\n`;

    // GSC summary
    md += `## Search Console — totals\n\n`;
    md += `| Metric | Value |\n|---|---:|\n`;
    md += `| Impressions | ${totalImpr.toLocaleString()} |\n`;
    md += `| Clicks | ${totalClicks.toLocaleString()} |\n`;
    md += `| Avg CTR | ${pct(avgCtr)} |\n`;
    md += `| Avg Position | ${avgPos.toFixed(1)} |\n\n`;

    // Top queries
    md += `## Top queries by impressions\n\n`;
    md += `| Impressions | Clicks | CTR | Pos | Query |\n|---:|---:|---:|---:|---|\n`;
    for (const r of (queries.rows || [])) {
        md += `| ${r.impressions} | ${r.clicks} | ${pct(r.ctr)} | ${r.position.toFixed(1)} | ${r.keys[0]} |\n`;
    }
    md += `\n`;

    // Top pages
    md += `## Top pages by impressions\n\n`;
    md += `| Impressions | Clicks | Pos | Page |\n|---:|---:|---:|---|\n`;
    for (const r of (pages.rows || [])) {
        const p = r.keys[0].replace(/^https?:\/\/[^/]+/, '');
        md += `| ${r.impressions} | ${r.clicks} | ${r.position.toFixed(1)} | \`${p}\` |\n`;
    }
    md += `\n---\n\n`;

    // GA4 channels
    if (ga4Channels.rows && ga4Channels.rows.length) {
        md += `## GA4 — SEO scorecard by channel\n\n`;
        md += `| Channel | Sessions | Users | Events | Key events | Session key event rate |\n|---|---:|---:|---:|---:|---:|\n`;
        for (const r of ga4Channels.rows) {
            md += `| ${r.dimensionValues[0].value} | ${r.metricValues[0].value} | ${r.metricValues[1].value} | ${r.metricValues[2].value} | ${r.metricValues[3].value} | ${pct(Number(r.metricValues[4].value || 0))} |\n`;
        }
        md += `\n`;
    }

    // GA4 top pages
    if (ga4Pages.rows && ga4Pages.rows.length) {
        md += `## GA4 — top pages viewed\n\n`;
        md += `| Page | Views | Users | Events | Key events |\n|---|---:|---:|---:|---:|\n`;
        for (const r of ga4Pages.rows) {
            md += `| \`${r.dimensionValues[0].value}\` | ${r.metricValues[0].value} | ${r.metricValues[1].value} | ${r.metricValues[2].value} | ${r.metricValues[3].value} |\n`;
        }
        md += `\n`;
    }

    // GA4 events
    if (ga4Events.rows && ga4Events.rows.length) {
        md += `## GA4 — events fired\n\n`;
        md += `| Event | Count | Users | Key events |\n|---|---:|---:|---:|\n`;
        for (const r of ga4Events.rows) {
            md += `| ${r.dimensionValues[0].value} | ${r.metricValues[0].value} | ${r.metricValues[1].value} | ${r.metricValues[2].value} |\n`;
        }
        md += `\n`;
    }

    md += `---\n\n*Generated by \`scripts/weekly-report.js\`*\n`;

    fs.writeFileSync(reportPath, md);
    console.log(`\n✅  Report written: ${path.relative(ROOT, reportPath)}\n`);
    console.log(`    GSC: ${totalImpr.toLocaleString()} impressions, ${totalClicks.toLocaleString()} clicks, ${pct(avgCtr)} CTR, pos ${avgPos.toFixed(1)}`);
}

main().catch(err => { console.error('Error:', err); process.exit(1); });
