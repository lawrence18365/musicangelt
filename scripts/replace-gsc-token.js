#!/usr/bin/env node
/**
 * Replace the placeholder Google Search Console verification token across
 * generated and hand-authored pages.
 *
 *   node scripts/replace-gsc-token.js "google-site-verification-token"
 */
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const token = process.argv[2];

if (!token || /[\s"'<>]/.test(token)) {
    console.error('Usage: node scripts/replace-gsc-token.js "verification-token"');
    console.error('Token must not contain whitespace, quotes, or angle brackets.');
    process.exit(1);
}

function walk(dir, out = []) {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
        if (entry.name.startsWith('.') || ['node_modules', 'assets', 'reports'].includes(entry.name)) continue;
        const full = path.join(dir, entry.name);
        if (entry.isDirectory()) walk(full, out);
        else if (entry.name.endsWith('.html') || entry.name === 'generate-pages.js') out.push(full);
    }
    return out;
}

let changed = 0;
for (const file of walk(ROOT)) {
    const before = fs.readFileSync(file, 'utf8');
    const after = before.replace(/content="REPLACE_WITH_GSC_TOKEN"/g, `content="${token}"`);
    if (after !== before) {
        fs.writeFileSync(file, after);
        changed++;
    }
}

console.log(`Updated Google Search Console token in ${changed} files.`);
console.log('Run `node scripts/generate-pages.js` afterwards if you changed the generator token.');
