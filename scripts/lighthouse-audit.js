#!/usr/bin/env node
/**
 * Lighthouse audit on the top URLs.
 *
 *   node scripts/lighthouse-audit.js
 *   node scripts/lighthouse-audit.js --strategy=desktop
 *   node scripts/lighthouse-audit.js --psi          # use PageSpeed Insights API
 *                                                    # (faster but quota-limited)
 *
 * Default: spawns local Chrome via `npx lighthouse` (no quotas, more reliable).
 * Auditing 10 URLs takes ~3-5 min on a modern Mac.
 *
 * Writes a markdown report to reports/YYYY-MM-DD-lighthouse-<strategy>.md.
 */
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const REPORTS_DIR = path.join(ROOT, 'reports');
const PSI = 'https://www.googleapis.com/pagespeedonline/v5/runPagespeed';

const URLS = [
    'https://musicangel.ie/',
    'https://musicangel.ie/the-beat-boutique/',
    'https://musicangel.ie/sway-social/',
    'https://musicangel.ie/wedding-band-cost-ireland/',
    'https://musicangel.ie/first-dance-songs/',
    'https://musicangel.ie/wedding-band-vs-dj/',
    'https://musicangel.ie/wedding-bands-dublin/',
    'https://musicangel.ie/wedding-band-ashford-castle/',
    'https://musicangel.ie/compare-bands/',
    'https://musicangel.ie/about/'
];

function parseArgs() {
    const args = { strategy: 'mobile', usePsi: false };
    for (const a of process.argv.slice(2)) {
        if (a.startsWith('--strategy=')) args.strategy = a.slice(11);
        if (a === '--psi') args.usePsi = true;
    }
    return args;
}

async function auditViaCli(url, strategy) {
    const { spawn } = require('child_process');
    const tmpOut = `/tmp/lh-${Date.now()}-${Math.random().toString(36).slice(2, 7)}.json`;
    return new Promise((resolve, reject) => {
        const args = [
            '--yes', 'lighthouse', url,
            '--quiet',
            '--output=json',
            `--output-path=${tmpOut}`,
            `--form-factor=${strategy}`,
            '--only-categories=performance,accessibility,best-practices,seo',
            '--chrome-flags=--headless --no-sandbox'
        ];
        if (strategy === 'desktop') {
            args.push('--screenEmulation.mobile=false');
            args.push('--screenEmulation.width=1350');
            args.push('--screenEmulation.height=940');
            args.push('--screenEmulation.deviceScaleFactor=1');
            args.push('--throttling-method=simulate');
        }
        const proc = spawn('npx', args, { stdio: 'pipe' });
        proc.on('error', reject);
        proc.on('close', code => {
            if (code !== 0) return reject(new Error(`lighthouse exit ${code}`));
            try {
                const data = JSON.parse(fs.readFileSync(tmpOut, 'utf8'));
                fs.unlinkSync(tmpOut);
                const cats = data.categories || {};
                const audits = data.audits || {};
                const failedAudits = Object.entries(audits)
                    .filter(([_, a]) => a.score !== null && a.score !== undefined && a.score < 0.9 && a.title)
                    .sort((a, b) => (a[1].score || 0) - (b[1].score || 0))
                    .slice(0, 3)
                    .map(([_, a]) => ({ title: a.title, score: a.score }));
                resolve({
                    url,
                    scores: {
                        performance: cats.performance ? Math.round(cats.performance.score * 100) : null,
                        accessibility: cats.accessibility ? Math.round(cats.accessibility.score * 100) : null,
                        bestPractices: cats['best-practices'] ? Math.round(cats['best-practices'].score * 100) : null,
                        seo: cats.seo ? Math.round(cats.seo.score * 100) : null
                    },
                    lcp: audits['largest-contentful-paint'] && audits['largest-contentful-paint'].displayValue,
                    cls: audits['cumulative-layout-shift'] && audits['cumulative-layout-shift'].displayValue,
                    tbt: audits['total-blocking-time'] && audits['total-blocking-time'].displayValue,
                    topIssues: failedAudits
                });
            } catch (e) { reject(e); }
        });
    });
}

async function audit(url, strategy) {
    const params = new URLSearchParams({
        url,
        strategy,
        category: 'PERFORMANCE'
    });
    // Add multiple categories
    ['ACCESSIBILITY', 'BEST_PRACTICES', 'SEO'].forEach(c => params.append('category', c));

    const resp = await fetch(`${PSI}?${params.toString()}`);
    if (!resp.ok) {
        const text = await resp.text();
        throw new Error(`PSI ${resp.status} for ${url}: ${text.slice(0, 200)}`);
    }
    const data = await resp.json();
    const cats = data.lighthouseResult && data.lighthouseResult.categories || {};
    const audits = data.lighthouseResult && data.lighthouseResult.audits || {};

    // Top 3 issues (failed audits, sorted by score asc)
    const failedAudits = Object.entries(audits)
        .filter(([_, a]) => a.score !== null && a.score !== undefined && a.score < 0.9 && a.title)
        .sort((a, b) => (a[1].score || 0) - (b[1].score || 0))
        .slice(0, 3)
        .map(([_, a]) => ({ title: a.title, score: a.score }));

    return {
        url,
        scores: {
            performance: cats.performance ? Math.round(cats.performance.score * 100) : null,
            accessibility: cats.accessibility ? Math.round(cats.accessibility.score * 100) : null,
            bestPractices: cats['best-practices'] ? Math.round(cats['best-practices'].score * 100) : null,
            seo: cats.seo ? Math.round(cats.seo.score * 100) : null
        },
        lcp: audits['largest-contentful-paint'] ? audits['largest-contentful-paint'].displayValue : null,
        cls: audits['cumulative-layout-shift'] ? audits['cumulative-layout-shift'].displayValue : null,
        tbt: audits['total-blocking-time'] ? audits['total-blocking-time'].displayValue : null,
        topIssues: failedAudits
    };
}

function emoji(score) {
    if (score === null || score === undefined) return '⚠️';
    if (score >= 90) return '✅';
    if (score >= 50) return '🟡';
    return '🔴';
}

async function main() {
    const { strategy, usePsi } = parseArgs();
    fs.mkdirSync(REPORTS_DIR, { recursive: true });
    const today = new Date().toISOString().slice(0, 10);
    const reportPath = path.join(REPORTS_DIR, `${today}-lighthouse-${strategy}.md`);

    const mode = usePsi ? 'PageSpeed Insights API' : 'local Chrome via npx lighthouse';
    console.log(`Lighthouse audit (${strategy}, ${mode}) on ${URLS.length} URLs...\n`);

    const results = [];
    for (const url of URLS) {
        process.stdout.write(`  ${url}... `);
        try {
            const r = usePsi ? await audit(url, strategy) : await auditViaCli(url, strategy);
            results.push(r);
            console.log(`P=${r.scores.performance} A=${r.scores.accessibility} BP=${r.scores.bestPractices} S=${r.scores.seo}`);
        } catch (e) {
            console.log(`ERROR: ${e.message}`);
            results.push({ url, error: e.message });
        }
    }

    // Build report
    let md = `# Lighthouse Audit — ${today} (${strategy})\n\n`;
    md += `**Strategy:** \`${strategy}\` | **URLs tested:** ${URLS.length}\n\n`;
    md += `## Summary\n\n`;
    md += `| Page | Perf | A11y | BP | SEO | LCP | CLS | TBT |\n|---|:-:|:-:|:-:|:-:|:-:|:-:|:-:|\n`;

    for (const r of results) {
        if (r.error) {
            md += `| \`${r.url.replace('https://musicangel.ie', '')}\` | error | error | error | error | — | — | — |\n`;
            continue;
        }
        const p = r.scores.performance, a = r.scores.accessibility, b = r.scores.bestPractices, s = r.scores.seo;
        const u = r.url.replace('https://musicangel.ie', '') || '/';
        md += `| \`${u}\` | ${emoji(p)} ${p} | ${emoji(a)} ${a} | ${emoji(b)} ${b} | ${emoji(s)} ${s} | ${r.lcp || '—'} | ${r.cls || '—'} | ${r.tbt || '—'} |\n`;
    }

    md += `\n## Issues per page\n\n`;
    for (const r of results) {
        if (r.error || !r.topIssues || !r.topIssues.length) continue;
        const u = r.url.replace('https://musicangel.ie', '') || '/';
        md += `### \`${u}\`\n`;
        for (const i of r.topIssues) {
            md += `- ${emoji(i.score)} ${i.title}\n`;
        }
        md += `\n`;
    }

    md += `\n---\n\nLegend: ✅ ≥90 · 🟡 50-89 · 🔴 <50 · ⚠️ unavailable\n\nRe-run: \`node scripts/lighthouse-audit.js\`\n`;

    fs.writeFileSync(reportPath, md);
    console.log(`\n✅  Report: ${path.relative(ROOT, reportPath)}`);

    // Summary line
    const perfs = results.filter(r => r.scores).map(r => r.scores.performance);
    if (perfs.length) {
        const avg = Math.round(perfs.reduce((a, b) => a + b, 0) / perfs.length);
        console.log(`    Average performance score: ${avg}/100 (${strategy})`);
    }
}

main().catch(e => { console.error(e); process.exit(1); });
