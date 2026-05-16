#!/usr/bin/env node
/**
 * Crawl every HTML page, extract every internal href/src, and report any link
 * that doesn't resolve to an existing file on disk.
 *
 *   node scripts/find-broken-links.js
 *
 * Internal = starts with `/` or `#`. External (http://, https://, mailto:,
 * tel:, javascript:) and data URIs are skipped.
 *
 * Resolution rules:
 *   /                              → index.html
 *   /the-beat-boutique             → the-beat-boutique/index.html OR the-beat-boutique.html
 *   /assets/bands/foo.webp         → assets/bands/foo.webp
 *   /the-beat-boutique#showreel    → strip #showreel, resolve dir
 *
 * Exits non-zero if any broken links found.
 */
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');

function walk(dir, out = []) {
    for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
        if (e.name.startsWith('.') || ['node_modules','api','scripts','data','reports'].includes(e.name)) continue;
        const full = path.join(dir, e.name);
        if (e.isDirectory()) walk(full, out);
        else if (e.name.endsWith('.html')) out.push(full);
    }
    return out;
}

function extractLinks(html) {
    const links = new Set();
    const reHref = /\bhref="([^"]*)"/g;
    const reSrc = /\bsrc="([^"]*)"/g;
    let m;
    while ((m = reHref.exec(html))) links.add(m[1]);
    while ((m = reSrc.exec(html))) links.add(m[1]);
    return [...links];
}

function resolveInternalPath(link) {
    // Strip hash + query
    let p = link.split('#')[0].split('?')[0];
    if (!p) return null;
    if (!p.startsWith('/')) return null; // relative — skip for now; we only have absolute internal links
    // Remove leading slash for path joining
    const rel = p.slice(1);
    if (!rel) {
        return path.join(ROOT, 'index.html');
    }
    // Try as directory first (rel/index.html), then as file (rel + .html), then as exact file
    const candidates = [
        path.join(ROOT, rel, 'index.html'),
        path.join(ROOT, rel + '.html'),
        path.join(ROOT, rel)
    ];
    for (const c of candidates) {
        if (fs.existsSync(c)) return c;
    }
    return null;
}

const SKIP = /^(https?:|mailto:|tel:|javascript:|data:)/i;

const files = walk(ROOT);
const broken = [];
let checkedLinks = 0;

for (const f of files) {
    const html = fs.readFileSync(f, 'utf8');
    const links = extractLinks(html);
    for (const link of links) {
        if (!link || link === '#' || SKIP.test(link)) continue;
        if (!link.startsWith('/')) continue; // skip relative for now
        checkedLinks++;
        const resolved = resolveInternalPath(link);
        if (!resolved) {
            broken.push({ file: path.relative(ROOT, f), link });
        }
    }
}

const uniqueBroken = [...new Map(broken.map(b => [b.link, b])).values()];

console.log(`\nScanned ${files.length} HTML files, ${checkedLinks} internal link references.`);
console.log(`  ✅  ${checkedLinks - broken.length} resolve`);
console.log(`  ⚠️   ${broken.length} broken instances (${uniqueBroken.length} unique URLs)\n`);

if (broken.length === 0) {
    console.log('No broken internal links.');
    process.exit(0);
}

// Group broken links by URL, list which files reference each
const byLink = {};
for (const b of broken) {
    (byLink[b.link] = byLink[b.link] || []).push(b.file);
}
console.log('Broken links:\n');
for (const [link, occurrences] of Object.entries(byLink)) {
    console.log(`  ${link}`);
    console.log(`    referenced in ${occurrences.length} files. First few:`);
    for (const f of occurrences.slice(0, 3)) console.log(`      - ${f}`);
    if (occurrences.length > 3) console.log(`      ... + ${occurrences.length - 3} more`);
    console.log();
}

process.exit(1);
