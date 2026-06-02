#!/usr/bin/env node
/**
 * SEO content automation for MusicAngel.
 *
 * Turns GSC reports and keyword-tool CSV exports into a filtered, clustered
 * content queue with one brief per target page.
 *
 * Examples:
 *   node scripts/content-automation.js
 *   node scripts/content-automation.js --csv=data/keyword-research/semrush.csv --max-briefs=12
 *   node scripts/content-automation.js --seed="wedding band ireland" --dry-run
 */
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const KEYWORD_DIR = path.join(ROOT, 'data', 'keyword-research');
const REPORTS_DIR = path.join(ROOT, 'reports');
const OUTPUT_REPORT_DIR = path.join(REPORTS_DIR, 'content-automation');
const BRIEFS_DIR = path.join(ROOT, 'content-briefs');
const SITE = 'https://musicangel.ie';

const DEFAULTS = {
    maxKd: 29,
    minSv: 500,
    minGscImpressions: 50,
    maxBriefs: 10,
    includeCovered: false,
    outDate: new Date().toISOString().slice(0, 10)
};

const QUESTION_OR_GUIDE_RE = /\b(what|why|when|where|who|which|how|can|should|do|does|is|are|cost|price|prices|pricing|vs|versus|compare|comparison|questions?|checklist|timeline|ideas?|songs?|book|choose|guide|package|packages)\b/i;
const QUESTION_START_RE = /^(what|why|when|where|who|which|how|can|should|do|does|is|are)\b/i;
const BRANDED_RE = /\b(musicangel|beat boutique|the beat boutique|sway social|best men|the best men|blacktye)\b/i;

const STOPWORDS = new Set([
    'a', 'an', 'and', 'are', 'as', 'at', 'be', 'best', 'by', 'can', 'do', 'does',
    'for', 'from', 'get', 'guide', 'how', 'i', 'in', 'ireland', 'irish', 'is',
    'of', 'on', 'or', 'our', 'should', 'the', 'to', 'top', 'vs', 'what', 'when',
    'where', 'which', 'who', 'why', 'with', 'you', 'your'
]);

function parseArgs() {
    const args = { ...DEFAULTS, csv: [], reports: [], seeds: [], useLatestReport: false, dryRun: false };

    for (const raw of process.argv.slice(2)) {
        const [flag, ...rest] = raw.split('=');
        const value = rest.join('=');

        if (flag === '--csv' && value) args.csv.push(value);
        else if (flag === '--report' && value) args.reports.push(value);
        else if (flag === '--seed' && value) args.seeds.push(value);
        else if (flag === '--max-kd' && value) args.maxKd = Number(value);
        else if (flag === '--min-sv' && value) args.minSv = Number(value);
        else if (flag === '--min-gsc-impressions' && value) args.minGscImpressions = Number(value);
        else if (flag === '--max-briefs' && value) args.maxBriefs = Number(value);
        else if (flag === '--out-date' && value) args.outDate = value;
        else if (flag === '--from-latest-report') args.useLatestReport = true;
        else if (flag === '--include-covered') args.includeCovered = true;
        else if (flag === '--dry-run') args.dryRun = true;
        else if (flag === '--help' || flag === '-h') {
            printHelp();
            process.exit(0);
        }
    }

    if (!Number.isFinite(args.maxKd)) args.maxKd = DEFAULTS.maxKd;
    if (!Number.isFinite(args.minSv)) args.minSv = DEFAULTS.minSv;
    if (!Number.isFinite(args.minGscImpressions)) args.minGscImpressions = DEFAULTS.minGscImpressions;
    if (!Number.isFinite(args.maxBriefs)) args.maxBriefs = DEFAULTS.maxBriefs;

    return args;
}

function printHelp() {
    console.log(`SEO content automation

Usage:
  node scripts/content-automation.js [options]

Options:
  --csv=PATH                  SEMrush/Ahrefs/keyword-tool CSV export. Repeatable.
  --report=PATH               Markdown GSC report to read. Repeatable.
  --from-latest-report        Read the latest reports/YYYY-MM-DD-report.md file.
  --seed="keyword"            Add seed-based question ideas. Repeatable.
  --max-kd=29                 Maximum keyword difficulty when KD exists.
  --min-sv=500                Minimum search volume when SV/volume exists.
  --min-gsc-impressions=50    Minimum GSC impressions when only GSC data exists.
  --max-briefs=10             Number of briefs to write.
  --include-covered           Include clusters that look fully covered.
  --out-date=YYYY-MM-DD       Date folder/report label.
  --dry-run                   Print queue without writing reports/briefs.
`);
}

function readJsonArray(file) {
    try {
        return JSON.parse(fs.readFileSync(file, 'utf8'));
    } catch (_err) {
        return [];
    }
}

const COUNTIES = readJsonArray(path.join(ROOT, 'data', 'counties.json'));
const VENUES = readJsonArray(path.join(ROOT, 'data', 'venues.json'));

function abs(input) {
    return path.isAbsolute(input) ? input : path.join(ROOT, input);
}

function cleanCell(value) {
    return String(value == null ? '' : value)
        .replace(/`/g, '')
        .replace(/<[^>]*>/g, '')
        .replace(/\*\*/g, '')
        .replace(/\s+/g, ' ')
        .trim();
}

function normalizeHeader(value) {
    return cleanCell(value).toLowerCase().replace(/[^a-z0-9]+/g, '');
}

function numberFrom(value) {
    if (value == null || value === '') return null;
    const cleaned = String(value).replace(/,/g, '').replace(/[^\d.-]/g, '');
    if (!cleaned || cleaned === '-' || cleaned === '.') return null;
    const n = Number(cleaned);
    return Number.isFinite(n) ? n : null;
}

function slugify(value) {
    return String(value || '')
        .toLowerCase()
        .replace(/&/g, ' and ')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '')
        .replace(/-{2,}/g, '-');
}

function normalizeKeyword(value) {
    return cleanCell(value)
        .replace(/\s*\([^)]*\)\s*$/g, '')
        .replace(/\s+/g, ' ')
        .trim()
        .toLowerCase();
}

function usefulTokens(value) {
    return normalizeKeyword(value)
        .replace(/[^a-z0-9 ]+/g, ' ')
        .split(/\s+/)
        .filter(Boolean)
        .filter(t => !STOPWORDS.has(t))
        .map(t => t.replace(/s$/, ''))
        .filter(t => t.length > 1);
}

function jaccard(a, b) {
    const aa = new Set(a);
    const bb = new Set(b);
    if (!aa.size || !bb.size) return 0;
    let intersection = 0;
    for (const item of aa) if (bb.has(item)) intersection++;
    return intersection / new Set([...aa, ...bb]).size;
}

function pageUrl(slug) {
    return slug ? `${SITE}/${slug}/` : `${SITE}/`;
}

function pathForSlug(slug) {
    return slug ? `${slug}/index.html` : 'index.html';
}

function splitDelimitedLine(line, delimiter) {
    const cells = [];
    let cell = '';
    let quoted = false;

    for (let i = 0; i < line.length; i++) {
        const ch = line[i];
        const next = line[i + 1];

        if (ch === '"' && quoted && next === '"') {
            cell += '"';
            i++;
        } else if (ch === '"') {
            quoted = !quoted;
        } else if (ch === delimiter && !quoted) {
            cells.push(cell);
            cell = '';
        } else {
            cell += ch;
        }
    }

    cells.push(cell);
    return cells.map(cleanCell);
}

function detectDelimiter(line) {
    const choices = [',', '\t', ';'];
    return choices
        .map(d => ({ d, count: splitDelimitedLine(line, d).length }))
        .sort((a, b) => b.count - a.count)[0].d;
}

function parseCsv(file) {
    const text = fs.readFileSync(file, 'utf8').replace(/^\uFEFF/, '');
    const lines = text.split(/\r?\n/).filter(line => line.trim());
    if (!lines.length) return [];

    const delimiter = detectDelimiter(lines[0]);
    const headers = splitDelimitedLine(lines[0], delimiter).map(normalizeHeader);
    const out = [];

    for (const line of lines.slice(1)) {
        const cells = splitDelimitedLine(line, delimiter);
        const row = {};
        headers.forEach((h, i) => { row[h] = cells[i] || ''; });
        const candidate = candidateFromMappedRow(row, `csv:${path.relative(ROOT, file)}`, 'keyword-tool');
        if (candidate) out.push(candidate);
    }

    return out;
}

function splitMarkdownRow(line) {
    return line
        .trim()
        .replace(/^\|/, '')
        .replace(/\|$/, '')
        .split('|')
        .map(cleanCell);
}

function isMarkdownSeparator(line) {
    const cells = splitMarkdownRow(line);
    return cells.length > 1 && cells.every(cell => /^:?-{3,}:?$/.test(cell));
}

function parseMarkdownTables(file) {
    const lines = fs.readFileSync(file, 'utf8').split(/\r?\n/);
    const out = [];

    for (let i = 0; i < lines.length - 1; i++) {
        if (!lines[i].includes('|') || !isMarkdownSeparator(lines[i + 1])) continue;

        const headers = splitMarkdownRow(lines[i]).map(normalizeHeader);
        if (!headers.includes('query') && !headers.includes('keyword')) continue;

        let j = i + 2;
        while (j < lines.length && lines[j].includes('|')) {
            const cells = splitMarkdownRow(lines[j]);
            if (cells.length >= headers.length) {
                const row = {};
                headers.forEach((h, idx) => { row[h] = cells[idx] || ''; });
                const candidate = candidateFromMappedRow(row, `md:${path.relative(ROOT, file)}`, 'gsc');
                if (candidate) out.push(candidate);
            }
            j++;
        }

        i = j;
    }

    return out;
}

function pick(row, keys) {
    for (const key of keys) {
        if (row[key] != null && row[key] !== '') return row[key];
    }
    return '';
}

function candidateFromMappedRow(row, source, origin) {
    const rawKeyword = pick(row, ['keyword', 'query', 'searchterm', 'term', 'phrase']);
    const keyword = normalizeKeyword(rawKeyword);
    if (!keyword || keyword === 'query' || keyword === 'keyword') return null;

    return {
        keyword,
        source,
        origin,
        kd: numberFrom(pick(row, ['kd', 'keyworddifficulty', 'difficulty'])),
        volume: numberFrom(pick(row, ['sv', 'searchvolume', 'volume', 'avgmonthlysearches', 'monthlyvolume'])),
        impressions: numberFrom(pick(row, ['impressions', 'impr'])),
        clicks: numberFrom(pick(row, ['clicks'])),
        ctr: numberFrom(pick(row, ['ctr'])),
        position: numberFrom(pick(row, ['position', 'pos', 'avgposition', 'averageposition'])),
        intent: cleanCell(pick(row, ['intent', 'searchintent', 'userintent'])).toLowerCase()
    };
}

function seedCandidates(seed) {
    const cleanSeed = normalizeKeyword(seed);
    if (!cleanSeed) return [];
    const ideas = [
        `how much does ${cleanSeed} cost`,
        `what is the best ${cleanSeed}`,
        `when should you book ${cleanSeed}`,
        `questions to ask ${cleanSeed}`,
        `how to choose ${cleanSeed}`,
        `${cleanSeed} vs dj`,
        `do you need ${cleanSeed}`,
        `what songs should ${cleanSeed} play`
    ];

    return ideas.map(keyword => ({
        keyword,
        source: `seed:${cleanSeed}`,
        origin: 'seed',
        kd: null,
        volume: null,
        impressions: null,
        clicks: null,
        ctr: null,
        position: null,
        intent: ''
    }));
}

function walkHtml(dir, out = []) {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
        if (entry.name.startsWith('.')) continue;
        if (['node_modules', 'api', 'scripts', 'data', 'reports', 'assets', 'google-ads', 'content-briefs'].includes(entry.name)) continue;
        const full = path.join(dir, entry.name);
        if (entry.isDirectory()) walkHtml(full, out);
        else if (entry.name.endsWith('.html')) out.push(full);
    }
    return out;
}

function extractFirst(html, re) {
    const m = html.match(re);
    return m ? cleanCell(m[1]) : '';
}

function pageSlugFromFile(file) {
    const rel = path.relative(ROOT, file).replace(/\\/g, '/');
    if (rel === 'index.html') return '';
    return rel.replace(/\/index\.html$/, '').replace(/\.html$/, '');
}

function pageIndex() {
    const pages = [];
    for (const file of walkHtml(ROOT)) {
        const html = fs.readFileSync(file, 'utf8');
        const headings = [...html.matchAll(/<h[23][^>]*>([\s\S]*?)<\/h[23]>/gi)]
            .map(m => cleanCell(m[1]))
            .filter(Boolean);
        const title = extractFirst(html, /<title[^>]*>([\s\S]*?)<\/title>/i);
        const h1 = extractFirst(html, /<h1[^>]*>([\s\S]*?)<\/h1>/i);
        const description = extractFirst(html, /<meta\s+name="description"\s+content="([^"]*)"/i);
        const slug = pageSlugFromFile(file);

        pages.push({
            slug,
            file: path.relative(ROOT, file),
            url: pageUrl(slug),
            title,
            h1,
            description,
            headings,
            tokens: usefulTokens(`${slug} ${title} ${h1}`)
        });
    }
    return pages;
}

function includesNormalized(haystack, needle) {
    const h = normalizeKeyword(haystack).replace(/[^a-z0-9 ]+/g, ' ');
    const n = normalizeKeyword(needle).replace(/[^a-z0-9 ]+/g, ' ');
    return h.includes(n);
}

function knownTopic(keyword) {
    const q = normalizeKeyword(keyword);

    const rules = [
        {
            key: 'wedding-band-cost-ireland',
            label: 'Wedding band cost in Ireland',
            slug: 'wedding-band-cost-ireland',
            patterns: [/\b(cost|costs|price|prices|pricing|average|how much)\b.*\bwedding bands?\b/, /\bwedding bands?\b.*\b(cost|costs|price|prices|pricing|average)\b/]
        },
        {
            key: 'first-dance-songs',
            label: 'First dance songs',
            slug: 'first-dance-songs',
            patterns: [/\bfirst dance\b/, /\b1st dance\b/]
        },
        {
            key: 'wedding-band-vs-dj',
            label: 'Wedding band vs DJ',
            slug: 'wedding-band-vs-dj',
            patterns: [/\b(vs|versus)\b.*\bdj\b/, /\bdj\b.*\b(vs|versus|band)\b/]
        },
        {
            key: 'wedding-music-timeline',
            label: 'Wedding music timeline',
            slug: 'wedding-music-timeline',
            patterns: [/\btimeline\b/, /\bwhen.*music\b/, /\bmusic.*schedule\b/]
        },
        {
            key: 'questions-to-ask-wedding-band',
            label: 'Questions to ask a wedding band',
            slug: 'questions-to-ask-wedding-band',
            patterns: [/\bquestions? to ask\b/, /\bask.*wedding bands?\b/]
        },
        {
            key: 'wedding-band-showcases',
            label: 'Wedding band showcases',
            slug: 'wedding-band-showcases',
            patterns: [/\bshowcase\b/, /\bsee.*band.*live\b/]
        },
        {
            key: 'when-to-book-wedding-band',
            label: 'When to book a wedding band',
            slug: 'when-to-book-wedding-band',
            patterns: [/\bwhen.*book.*wedding bands?\b/, /\bbook.*wedding bands?.*when\b/]
        },
        {
            key: 'wedding-band-and-dj-package',
            label: 'Wedding band and DJ package',
            slug: 'wedding-band-and-dj-package',
            patterns: [/\bband and dj\b/, /\bdj package\b/]
        },
        {
            key: 'drinks-reception-music',
            label: 'Drinks reception music',
            slug: 'drinks-reception-music',
            patterns: [/\bdrinks reception\b/, /\bcocktail hour music\b/]
        },
        {
            key: 'ceremony-music',
            label: 'Ceremony music',
            slug: 'ceremony-music',
            patterns: [/\bceremony music\b/, /\bwedding ceremony songs?\b/]
        },
        {
            key: 'song-list',
            label: 'Wedding band song list',
            slug: 'song-list',
            patterns: [/\bsong list\b/, /\brepertoire\b/, /\bsongs.*wedding bands?\b/]
        },
        {
            key: 'corporate-events',
            label: 'Corporate event bands',
            slug: 'corporate-events',
            patterns: [/\bcorporate\b/, /\bevent band\b/, /\bchristmas party bands?\b/]
        }
    ];

    for (const rule of rules) {
        if (rule.patterns.some(re => re.test(q))) return rule;
    }

    for (const county of COUNTIES) {
        if (county.name && includesNormalized(q, county.name) && /\bwedding bands?\b/.test(q)) {
            return {
                key: `wedding-bands-${county.slug}`,
                label: `Wedding bands ${county.name}`,
                slug: `wedding-bands-${county.slug}`
            };
        }
    }

    for (const venue of VENUES) {
        if (venue.name && includesNormalized(q, venue.name)) {
            return {
                key: `wedding-band-${venue.slug}`,
                label: `Wedding band at ${venue.name}`,
                slug: `wedding-band-${venue.slug}`
            };
        }
    }

    return null;
}

function inferIntent(keyword, explicitIntent) {
    const explicit = cleanCell(explicitIntent);
    if (explicit) return explicit;
    const q = normalizeKeyword(keyword);
    if (/\b(cost|price|prices|pricing|package|quote|book|hire)\b/.test(q)) return 'commercial';
    if (/\b(best|top|compare|comparison|vs|versus)\b/.test(q)) return 'commercial investigation';
    if (QUESTION_START_RE.test(q) || /\b(questions?|timeline|ideas?|guide|songs?)\b/.test(q)) return 'informational';
    if (/\bwedding bands?\b/.test(q)) return 'local commercial';
    return 'informational';
}

function isQuestionOrGuideKeyword(candidate) {
    const q = normalizeKeyword(candidate.keyword);
    if (QUESTION_OR_GUIDE_RE.test(q)) return true;
    if (knownTopic(q)) return true;
    if (candidate.intent && /(informational|commercial|transactional)/i.test(candidate.intent)) return true;
    return false;
}

function passesFilters(candidate, args) {
    if (!isQuestionOrGuideKeyword(candidate)) return false;
    if (BRANDED_RE.test(candidate.keyword) && !QUESTION_OR_GUIDE_RE.test(candidate.keyword)) return false;
    if (candidate.kd != null && candidate.kd > args.maxKd) return false;
    if (candidate.volume != null && candidate.volume < args.minSv) return false;
    if (candidate.volume == null && candidate.impressions != null && candidate.impressions < args.minGscImpressions) return false;
    return true;
}

function mergeCandidates(candidates) {
    const byKeyword = new Map();

    for (const candidate of candidates) {
        const key = normalizeKeyword(candidate.keyword);
        const existing = byKeyword.get(key);
        if (!existing) {
            byKeyword.set(key, { ...candidate, sources: [candidate.source] });
            continue;
        }

        existing.kd = minNullable(existing.kd, candidate.kd);
        existing.volume = maxNullable(existing.volume, candidate.volume);
        existing.impressions = maxNullable(existing.impressions, candidate.impressions);
        existing.clicks = maxNullable(existing.clicks, candidate.clicks);
        existing.ctr = maxNullable(existing.ctr, candidate.ctr);
        existing.position = minNullable(existing.position, candidate.position);
        existing.intent = existing.intent || candidate.intent;
        existing.origin = existing.origin === candidate.origin ? existing.origin : 'mixed';
        existing.sources.push(candidate.source);
    }

    return [...byKeyword.values()];
}

function minNullable(a, b) {
    if (a == null) return b == null ? null : b;
    if (b == null) return a;
    return Math.min(a, b);
}

function maxNullable(a, b) {
    if (a == null) return b == null ? null : b;
    if (b == null) return a;
    return Math.max(a, b);
}

function clusterKey(candidate) {
    const topic = knownTopic(candidate.keyword);
    if (topic) return topic.key;
    const tokens = usefulTokens(candidate.keyword);
    return tokens.slice(0, 4).join('-') || slugify(candidate.keyword);
}

function findTargetPage(primary, pagesBySlug, pages) {
    const topic = knownTopic(primary.keyword);
    if (topic && pagesBySlug.has(topic.slug)) {
        return { page: pagesBySlug.get(topic.slug), topic, status: 'improve' };
    }
    if (topic) {
        return {
            page: null,
            topic,
            status: 'new',
            slug: topic.slug,
            url: pageUrl(topic.slug),
            file: pathForSlug(topic.slug)
        };
    }

    const directSlug = slugify(primary.keyword);
    if (pagesBySlug.has(directSlug)) {
        return { page: pagesBySlug.get(directSlug), topic: null, status: 'improve' };
    }

    const tokens = usefulTokens(primary.keyword);
    let best = { page: null, score: 0 };
    for (const page of pages) {
        const score = jaccard(tokens, page.tokens);
        if (score > best.score) best = { page, score };
    }

    if (best.page && best.score >= 0.62) {
        return { page: best.page, topic: null, status: 'improve' };
    }

    const slug = directSlug.replace(/^how-to-/, '').replace(/^what-is-/, '').replace(/^what-are-/, '');
    return {
        page: null,
        topic: null,
        status: 'new',
        slug,
        url: pageUrl(slug),
        file: pathForSlug(slug)
    };
}

function scoreCandidate(candidate, clusterSize) {
    let score = 0;
    if (candidate.volume != null) score += Math.min(60, Math.log10(candidate.volume + 1) * 18);
    if (candidate.impressions != null) score += Math.min(45, Math.log10(candidate.impressions + 1) * 16);
    if (candidate.clicks != null) score += Math.min(15, candidate.clicks);
    if (candidate.position != null) {
        if (candidate.position > 3 && candidate.position <= 15) score += 20;
        else if (candidate.position > 15 && candidate.position <= 30) score += 12;
        else if (candidate.position <= 3) score += 8;
    }
    if (candidate.kd != null) score += Math.max(0, 30 - candidate.kd);

    const intent = inferIntent(candidate.keyword, candidate.intent);
    if (/commercial/.test(intent)) score += 12;
    if (/informational/.test(intent)) score += 6;
    if (QUESTION_START_RE.test(candidate.keyword)) score += 10;
    score += Math.min(10, Math.max(0, clusterSize - 1) * 2);
    return Math.round(score);
}

function buildClusters(candidates, pages) {
    const pagesBySlug = new Map(pages.map(page => [page.slug, page]));
    const grouped = new Map();

    for (const candidate of candidates) {
        const key = clusterKey(candidate);
        if (!grouped.has(key)) grouped.set(key, []);
        grouped.get(key).push(candidate);
    }

    const clusters = [];
    for (const [key, items] of grouped) {
        const sorted = items
            .map(item => ({ ...item, intent: inferIntent(item.keyword, item.intent) }))
            .sort((a, b) => scoreCandidate(b, items.length) - scoreCandidate(a, items.length));
        const primary = sorted[0];
        const target = findTargetPage(primary, pagesBySlug, pages);
        const page = target.page;
        const slug = page ? page.slug : target.slug;
        const url = page ? page.url : target.url;
        const file = page ? page.file : target.file;
        const headingText = page ? normalizeKeyword(page.headings.join(' ')) : '';
        const missingTerms = sorted
            .map(item => item.keyword)
            .filter(keyword => !headingText || !includesNormalized(headingText, keyword))
            .slice(0, 8);

        const score = Math.max(...sorted.map(item => scoreCandidate(item, items.length)));
        clusters.push({
            key,
            score,
            primary,
            keywords: sorted,
            status: target.status,
            topic: target.topic,
            slug,
            url,
            file,
            page,
            missingTerms
        });
    }

    return clusters.sort((a, b) => b.score - a.score || b.keywords.length - a.keywords.length);
}

function formatNumber(value, fallback = '-') {
    return value == null ? fallback : Number(value).toLocaleString('en-IE', { maximumFractionDigits: 1 });
}

function mdEscape(value) {
    return String(value == null ? '' : value).replace(/\|/g, '\\|');
}

function titleFromCluster(cluster) {
    if (cluster.topic && cluster.topic.label) return cluster.topic.label;
    return cluster.primary.keyword
        .replace(/\b\w/g, ch => ch.toUpperCase())
        .replace(/\bDj\b/g, 'DJ')
        .replace(/\bSeo\b/g, 'SEO')
        .replace(/\bGsc\b/g, 'GSC')
        .replace(/\bGa4\b/g, 'GA4')
        .replace(/\bIreland\b/g, 'Ireland');
}

function recommendedAngle(cluster) {
    const q = normalizeKeyword(cluster.primary.keyword);
    if (/\b(cost|price|pricing|how much)\b/.test(q)) {
        return 'Answer the price question directly in the first screen, then explain ranges, inclusions, add-ons, and quote drivers for Irish weddings.';
    }
    if (/\b(vs|versus|compare|comparison)\b/.test(q)) {
        return 'Make the decision criteria explicit with a comparison table, then recommend the right option by wedding type, venue, guest mix, and budget.';
    }
    if (/\bwhen|timeline|book\b/.test(q)) {
        return 'Give a clear timeline first, then explain exceptions by peak dates, venue constraints, supplier availability, and planning risk.';
    }
    if (/\bsongs?|first dance|repertoire\b/.test(q)) {
        return 'Organize the answer into scannable lists with short notes explaining when each choice works live.';
    }
    if (/\bquestions?|checklist\b/.test(q)) {
        return 'Use a practical checklist structure with exact questions, why each answer matters, and red flags to watch for.';
    }
    return 'Answer the searcher question quickly, then expand into practical decision guidance for Irish wedding couples.';
}

function suggestedOutline(cluster) {
    const title = titleFromCluster(cluster);
    const q = normalizeKeyword(cluster.primary.keyword);
    const outline = [
        `H1: ${title}`,
        'Direct answer block: 2-4 sentences that answer the primary keyword without intro padding.',
        'Who this applies to: Irish wedding couples, venues, dates, and package assumptions.',
        'Decision table: options, best fit, tradeoffs, and estimated costs or timings where useful.'
    ];

    if (/\b(cost|price|pricing|how much)\b/.test(q)) {
        outline.push('Price ranges: basic, typical, premium, and what changes the quote.');
        outline.push('What is included: live sets, PA, lighting, DJ-style music, travel, learned songs, and add-ons.');
        outline.push('Ways to reduce cost without reducing quality.');
    } else if (/\b(vs|versus|compare|comparison)\b/.test(q)) {
        outline.push('Band vs DJ comparison table: energy, sound, cost, flexibility, venue fit, guest age mix.');
        outline.push('When a band is the better choice.');
        outline.push('When a DJ is enough.');
        outline.push('When to book both as a package.');
    } else if (/\bwhen|timeline|book\b/.test(q)) {
        outline.push('Booking timeline by date type: peak Saturday, shoulder season, winter, midweek.');
        outline.push('What can go wrong if you leave it late.');
        outline.push('Last-minute booking checklist.');
    } else if (/\bsongs?|first dance|repertoire\b/.test(q)) {
        outline.push('Best choices by mood, tempo, generation, and live-band suitability.');
        outline.push('Songs to avoid or check with the band first.');
        outline.push('How to ask a band to learn a song.');
    } else if (/\bquestions?|checklist\b/.test(q)) {
        outline.push('Questions before enquiry.');
        outline.push('Questions before paying the deposit.');
        outline.push('Questions for the venue.');
        outline.push('Red flags and acceptable answers.');
    } else {
        outline.push('Main practical sections based on the clustered keyword variants.');
        outline.push('Examples from MusicAngel bands, Irish venues, and common couple scenarios.');
    }

    outline.push('FAQ section: 4-6 exact questions pulled from the keyword cluster.');
    outline.push('CTA: check availability for date and venue.');
    return outline;
}

function internalLinksFor(cluster, pages) {
    const preferred = [
        'compare-bands',
        'wedding-band-cost-ireland',
        'wedding-band-showcases',
        'first-dance-songs',
        'wedding-band-and-dj-package',
        'questions-to-ask-wedding-band',
        'venues',
        ''
    ];
    const bySlug = new Map(pages.map(page => [page.slug, page]));
    const links = [];
    for (const slug of preferred) {
        if (slug === cluster.slug) continue;
        if (bySlug.has(slug)) links.push(bySlug.get(slug));
    }
    return links.slice(0, 6);
}

function briefMarkdown(cluster, pages, date) {
    const title = titleFromCluster(cluster);
    const links = internalLinksFor(cluster, pages);
    const statusLabel = cluster.status === 'improve' ? 'Improve existing page' : 'Create new page';
    const targetFile = cluster.file || pathForSlug(cluster.slug);

    let md = `# Content Brief: ${title}\n\n`;
    md += `Generated: ${date}\n`;
    md += `Status: ${statusLabel}\n`;
    md += `Target URL: ${cluster.url}\n`;
    md += `Target file: ${targetFile}\n`;
    md += `Primary keyword: ${cluster.primary.keyword}\n`;
    md += `Intent: ${cluster.primary.intent}\n`;
    md += `Priority score: ${cluster.score}\n\n`;

    md += `## Evidence\n\n`;
    md += `| Keyword | KD | SV | GSC impressions | Clicks | Position | Source |\n`;
    md += `|---|---:|---:|---:|---:|---:|---|\n`;
    for (const keyword of cluster.keywords.slice(0, 12)) {
        md += `| ${mdEscape(keyword.keyword)} | ${formatNumber(keyword.kd)} | ${formatNumber(keyword.volume)} | ${formatNumber(keyword.impressions)} | ${formatNumber(keyword.clicks)} | ${formatNumber(keyword.position)} | ${mdEscape((keyword.sources || [keyword.source]).join(', '))} |\n`;
    }
    md += `\n`;

    md += `## Angle\n\n${recommendedAngle(cluster)}\n\n`;
    md += `## Outline\n\n`;
    for (const item of suggestedOutline(cluster)) md += `- ${item}\n`;
    md += `\n`;

    md += `## Content Gap Notes\n\n`;
    if (cluster.status === 'improve' && cluster.missingTerms.length) {
        md += `These cluster terms do not appear to be covered in current H2/H3 headings. Add sections or FAQs where they are genuinely useful:\n\n`;
        for (const term of cluster.missingTerms) md += `- ${term}\n`;
    } else if (cluster.status === 'improve') {
        md += `The current headings already appear to cover the main cluster terms. Focus on freshness, clearer answer blocks, better tables, and stronger CTAs.\n`;
    } else {
        md += `No existing target page was found. Build this as a focused guide rather than folding it into a broad page.\n`;
    }
    md += `\n`;

    md += `## On-Page Checklist\n\n`;
    md += `- Title tag includes the primary keyword and a clear Ireland modifier where relevant.\n`;
    md += `- Meta description answers the intent and mentions MusicAngel only after the searcher value prop.\n`;
    md += `- First 100 words answer the primary query directly.\n`;
    md += `- Use one comparison, pricing, timeline, or checklist table if it helps the query.\n`;
    md += `- Add Article and FAQPage JSON-LD when the page includes FAQs.\n`;
    md += `- Add a short CTA near the first answer and again after the FAQ.\n`;
    md += `- Run the content through SEMrush Writing Assistant or an equivalent on-page tool before publishing.\n\n`;

    md += `## Internal Links\n\n`;
    for (const link of links) md += `- [${link.h1 || link.title || link.slug}](${link.url})\n`;
    md += `\n`;

    md += `## Publish Checks\n\n`;
    md += `- Confirm no existing page already satisfies the intent better.\n`;
    md += `- Confirm examples, pricing, dates, and package details are current.\n`;
    md += `- Add the new URL to navigation only if it is a durable guide or hub.\n`;
    md += `- Regenerate sitemap if a new page is created.\n`;

    return md;
}

function reportMarkdown(clusters, sources, args, date) {
    const newCount = clusters.filter(c => c.status === 'new').length;
    const improveCount = clusters.filter(c => c.status === 'improve').length;

    let md = `# Content Automation Report - ${date}\n\n`;
    md += `This converts the keyword workflow into an actionable queue: seed/query data -> filters -> clustering -> duplicate check -> brief -> on-page checklist.\n\n`;

    md += `## Inputs\n\n`;
    for (const source of sources) md += `- ${source}\n`;
    md += `\n`;

    md += `## Filters\n\n`;
    md += `| Filter | Value |\n`;
    md += `|---|---:|\n`;
    md += `| Max KD when available | ${args.maxKd} |\n`;
    md += `| Min SV when available | ${args.minSv} |\n`;
    md += `| Min GSC impressions when no SV exists | ${args.minGscImpressions} |\n`;
    md += `| Briefs written | ${Math.min(args.maxBriefs, clusters.length)} |\n\n`;

    md += `## Summary\n\n`;
    md += `| Type | Count |\n`;
    md += `|---|---:|\n`;
    md += `| New page opportunities | ${newCount} |\n`;
    md += `| Existing page improvements | ${improveCount} |\n\n`;

    md += `## Priority Queue\n\n`;
    md += `| Priority | Score | Action | Target | Primary keyword | Cluster terms |\n`;
    md += `|---:|---:|---|---|---|---:|\n`;
    clusters.slice(0, args.maxBriefs).forEach((cluster, idx) => {
        const action = cluster.status === 'new' ? 'Create' : 'Improve';
        md += `| ${idx + 1} | ${cluster.score} | ${action} | [/${cluster.slug || ''}/](${cluster.url}) | ${mdEscape(cluster.primary.keyword)} | ${cluster.keywords.length} |\n`;
    });
    md += `\n`;

    md += `## Operating Cadence\n\n`;
    md += `- Monday: let the weekly GSC/GA4 report run.\n`;
    md += `- Tuesday: run this automation and review the top briefs.\n`;
    md += `- Friday: publish or improve 1-2 pages from the queue.\n`;
    md += `- Monthly: import a fresh SEMrush/Ahrefs CSV and rerun with the same thresholds.\n\n`;

    md += `Generated by \`scripts/content-automation.js\`.\n`;
    return md;
}

function defaultCsvFiles() {
    if (!fs.existsSync(KEYWORD_DIR)) return [];
    return fs.readdirSync(KEYWORD_DIR)
        .filter(name => /\.(csv|tsv)$/i.test(name))
        .map(name => path.join(KEYWORD_DIR, name));
}

function latestReport() {
    if (!fs.existsSync(REPORTS_DIR)) return null;
    const reports = fs.readdirSync(REPORTS_DIR)
        .filter(name => /^\d{4}-\d{2}-\d{2}-report\.md$/.test(name))
        .sort();
    return reports.length ? path.join(REPORTS_DIR, reports[reports.length - 1]) : null;
}

function loadCandidates(args) {
    const candidates = [];
    const sources = [];

    const csvFiles = args.csv.length ? args.csv.map(abs) : defaultCsvFiles();
    for (const file of csvFiles) {
        if (!fs.existsSync(file)) {
            console.warn(`Skipping missing CSV: ${file}`);
            continue;
        }
        const rows = parseCsv(file);
        candidates.push(...rows);
        sources.push(`${path.relative(ROOT, file)} (${rows.length} keyword rows)`);
    }

    const reportFiles = args.reports.map(abs);
    if (args.useLatestReport || (!args.csv.length && !args.reports.length && !args.seeds.length)) {
        const latest = latestReport();
        if (latest) reportFiles.push(latest);
    }

    const roadmap = path.join(ROOT, 'KEYWORDS.md');
    if (fs.existsSync(roadmap)) reportFiles.push(roadmap);

    for (const file of [...new Set(reportFiles)]) {
        if (!fs.existsSync(file)) {
            console.warn(`Skipping missing report: ${file}`);
            continue;
        }
        const rows = parseMarkdownTables(file);
        candidates.push(...rows);
        sources.push(`${path.relative(ROOT, file)} (${rows.length} query rows)`);
    }

    for (const seed of args.seeds) {
        const rows = seedCandidates(seed);
        candidates.push(...rows);
        sources.push(`seed:${seed} (${rows.length} generated ideas)`);
    }

    return { candidates, sources };
}

function writeOutputs(clusters, pages, sources, args) {
    const date = args.outDate;
    const reportPath = path.join(OUTPUT_REPORT_DIR, `${date}-content-automation.md`);
    const briefDir = path.join(BRIEFS_DIR, date);

    if (args.dryRun) {
        for (const [idx, cluster] of clusters.slice(0, args.maxBriefs).entries()) {
            const action = cluster.status === 'new' ? 'Create' : 'Improve';
            console.log(`${idx + 1}. [${cluster.score}] ${action} ${cluster.url} - ${cluster.primary.keyword}`);
        }
        return { reportPath: null, briefDir: null };
    }

    fs.mkdirSync(OUTPUT_REPORT_DIR, { recursive: true });
    fs.mkdirSync(briefDir, { recursive: true });

    fs.writeFileSync(reportPath, reportMarkdown(clusters, sources, args, date));

    clusters.slice(0, args.maxBriefs).forEach((cluster, idx) => {
        const filename = `${String(idx + 1).padStart(2, '0')}-${cluster.slug || slugify(cluster.primary.keyword)}.md`;
        fs.writeFileSync(path.join(briefDir, filename), briefMarkdown(cluster, pages, date));
    });

    return { reportPath, briefDir };
}

function main() {
    const args = parseArgs();
    const { candidates, sources } = loadCandidates(args);
    const merged = mergeCandidates(candidates);
    const filtered = merged.filter(candidate => passesFilters(candidate, args));
    const pages = pageIndex();
    const clusters = buildClusters(filtered, pages)
        .filter(cluster => args.includeCovered || cluster.missingTerms.length || cluster.status === 'new');

    if (!clusters.length) {
        console.log('No content opportunities matched the current filters.');
        console.log(`Loaded ${candidates.length} candidates, ${filtered.length} passed filters.`);
        return;
    }

    const { reportPath, briefDir } = writeOutputs(clusters, pages, sources, args);
    console.log(`Loaded ${candidates.length} candidates; ${filtered.length} passed filters; ${clusters.length} clusters queued.`);
    if (reportPath) console.log(`Report written: ${path.relative(ROOT, reportPath)}`);
    if (briefDir) console.log(`Briefs written: ${path.relative(ROOT, briefDir)}`);
}

main();
