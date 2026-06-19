#!/usr/bin/env node
/**
 * Audit every HTML page for canonical-URL correctness.
 *
 *   node scripts/audit-canonicals.js
 *
 * For each page on disk:
 *  - Computes the expected canonical from the file path
 *    (e.g. /Users/.../musicangelt/wedding-band-ashford-castle/index.html
 *          → https://musicangel.ie/wedding-band-ashford-castle)
 *  - Extracts the actual canonical from <link rel="canonical" href="...">
 *  - Reports mismatches, missing canonicals, or duplicate canonicals
 *
 * Exits non-zero if any issues are found, suitable for CI gating.
 */
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const SITE = 'https://musicangel.ie';

function walk(dir, out = []) {
    for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
        if (e.name.startsWith('.') || ['node_modules','api','scripts','data','js','assets','reports'].includes(e.name)) continue;
        const full = path.join(dir, e.name);
        if (e.isDirectory()) walk(full, out);
        else if (e.name.endsWith('.html')) out.push(full);
    }
    return out;
}

function expectedCanonical(filePath) {
    const rel = path.relative(ROOT, filePath).replace(/\\/g, '/');
    if (rel === 'index.html') return SITE + '/';
    if (rel.endsWith('/index.html')) {
        return SITE + '/' + rel.replace(/\/index\.html$/, '') + '/';
    }
    return SITE + '/' + rel.replace(/\.html$/, '');
}

function extractCanonicals(html) {
    const matches = [...html.matchAll(/<link rel="canonical" href="([^"]*)">/g)];
    return matches.map(m => m[1]);
}

function isNoindex(html) {
    return /<meta[^>]+name=["']robots["'][^>]+content=["'][^"']*noindex/i.test(html)
        || /<meta[^>]+content=["'][^"']*noindex[^"']*["'][^>]+name=["']robots["']/i.test(html);
}

const issues = [];
const files = walk(ROOT);
let okCount = 0;
let skippedNoindex = 0;

for (const f of files) {
    const html = fs.readFileSync(f, 'utf8');
    const canonicals = extractCanonicals(html);
    const expected = expectedCanonical(f);
    const rel = path.relative(ROOT, f);

    if (isNoindex(html)) {
        skippedNoindex++;
        continue;
    }

    if (canonicals.length === 0) {
        issues.push({ file: rel, type: 'MISSING', expected, actual: null });
    } else if (canonicals.length > 1) {
        issues.push({ file: rel, type: 'DUPLICATE', expected, actual: canonicals });
    } else if (canonicals[0] !== expected) {
        issues.push({ file: rel, type: 'MISMATCH', expected, actual: canonicals[0] });
    } else {
        okCount++;
    }
}

console.log(`\nAudited ${files.length} HTML files:`);
console.log(`  ✅  ${okCount} correct`);
console.log(`  ↪️   ${skippedNoindex} noindex skipped`);
console.log(`  ⚠️   ${issues.length} issues\n`);

if (issues.length === 0) {
    console.log('All canonicals are correct.');
    process.exit(0);
}

const byType = { MISSING: [], DUPLICATE: [], MISMATCH: [] };
for (const i of issues) byType[i.type].push(i);

for (const t of Object.keys(byType)) {
    if (!byType[t].length) continue;
    console.log(`\n${t} (${byType[t].length}):`);
    for (const i of byType[t]) {
        console.log(`  ${i.file}`);
        console.log(`    expected: ${i.expected}`);
        console.log(`    actual:   ${Array.isArray(i.actual) ? i.actual.join(' / ') : i.actual}`);
    }
}

process.exit(1);
