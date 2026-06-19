#!/usr/bin/env node
/**
 * Inject Review schema + a visible Reviews block into each band page.
 *
 *   node scripts/inject-reviews.js
 *
 * Reads `data/reviews.json` — when reviews exist for a band, injects:
 *   - A visible `.reviews-section` between the FAQ and the enquiry form
 *   - JSON-LD `Review` entries appended to the band's existing schema graph
 *   - Aggregate rating in the MusicGroup schema if 3+ reviews
 *
 * Idempotent: re-running replaces any previously-injected block via marker comments.
 * If `data/reviews.json` has no reviews for a band, the page is left untouched
 * (any previously-injected block is removed).
 */
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const REVIEWS_PATH = path.join(ROOT, 'data/reviews.json');
const BAND_SLUGS = ['the-beat-boutique', 'sway-social', 'the-best-men', 'blacktye'];
const BAND_NAMES = {
    'the-beat-boutique': 'The Beat Boutique',
    'sway-social': 'Sway Social',
    'the-best-men': 'The Best Men',
    'blacktye': 'Blacktye'
};

const MARKER_HTML_START = '<!-- REVIEWS:INJECTED:START -->';
const MARKER_HTML_END = '<!-- REVIEWS:INJECTED:END -->';
const MARKER_LD_START = '<!-- REVIEWS:JSONLD:START -->';
const MARKER_LD_END = '<!-- REVIEWS:JSONLD:END -->';

function esc(s) {
    return String(s == null ? '' : s)
        .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function renderReviewsBlock(bandName, bandSlug, reviews, sourceUrls) {
    if (!reviews || !reviews.length) return '';
    const avg = (reviews.reduce((a, r) => a + r.rating, 0) / reviews.length).toFixed(1);
    const sources = [];
    if (sourceUrls.googleMapsUrl) sources.push(`<a href="${esc(sourceUrls.googleMapsUrl)}" target="_blank" rel="noopener">Google reviews</a>`);
    if (sourceUrls.facebookPageUrl) sources.push(`<a href="${esc(sourceUrls.facebookPageUrl)}" target="_blank" rel="noopener">Facebook</a>`);
    if (sourceUrls.weddingsOnlineUrl) sources.push(`<a href="${esc(sourceUrls.weddingsOnlineUrl)}" target="_blank" rel="noopener">weddingsonline.ie</a>`);
    const sourcesLine = sources.length ? `<p class="reviews-sources">More reviews on ${sources.join(' · ')}</p>` : '';

    const items = reviews.map(r => `        <article class="review-card">
            <div class="review-stars">${'★'.repeat(r.rating)}${'☆'.repeat(5 - r.rating)}</div>
            <blockquote class="review-body">${esc(r.body)}</blockquote>
            <cite class="review-cite">${esc(r.author)}${r.venue ? ' · ' + esc(r.venue) : ''}${r.date ? ' · ' + esc(r.date) : ''}${r.sourceUrl ? ' · <a href="' + esc(r.sourceUrl) + '" target="_blank" rel="noopener">source</a>' : ''}</cite>
        </article>`).join('\n');

    return `${MARKER_HTML_START}
    <section class="reviews-section" style="background:rgba(247,214,228,0.18);padding:5rem 0;border-top:1px solid var(--border)">
        <div class="wrap">
            <p class="sec-eye">From real couples</p>
            <h2 class="sec-h2">What couples say about <em>${esc(bandName)}</em></h2>
            <div class="reviews-meta" style="display:flex;gap:1rem;align-items:baseline;margin-bottom:2rem">
                <span style="font-family:var(--serif);font-size:2rem;color:var(--pink);font-weight:500">${avg}/5</span>
                <span style="font-family:var(--serif);font-style:italic;color:var(--text-muted)">across ${reviews.length} reviews</span>
            </div>
            <style>
                .review-card { background: #fff; border: 1px solid var(--border); border-radius: 14px; padding: 1.5rem 1.7rem; margin-bottom: 1rem; }
                .review-stars { color: var(--pink); font-size: 0.9rem; letter-spacing: 0.1em; margin-bottom: 0.75rem; }
                .review-body { font-family: var(--serif); font-style: italic; font-size: 1.05rem; line-height: 1.65; color: var(--ink-soft); margin-bottom: 0.85rem; padding-left: 1rem; border-left: 2px solid var(--blush); }
                .review-cite { font-size: 0.78rem; color: var(--text-muted); letter-spacing: 0.04em; }
                .reviews-sources { margin-top: 1.5rem; color: var(--text-muted); font-size: 0.85rem; font-family: var(--serif); font-style: italic; }
                .reviews-sources a { color: var(--ink); text-decoration: underline; text-underline-offset: 3px; text-decoration-color: var(--blush); }
            </style>
${items}
            ${sourcesLine}
        </div>
    </section>
    ${MARKER_HTML_END}`;
}

function renderReviewSchema(bandName, bandSlug, reviews) {
    if (!reviews || !reviews.length) return '';
    const avg = (reviews.reduce((a, r) => a + r.rating, 0) / reviews.length).toFixed(1);
    const reviewObjects = reviews.map(r => ({
        "@type": "Review",
        "reviewRating": { "@type": "Rating", "ratingValue": r.rating, "bestRating": 5 },
        "author": { "@type": "Person", "name": r.author },
        "datePublished": r.date || undefined,
        "reviewBody": r.body,
        "url": r.sourceUrl
    }));
    const aggregateRating = reviews.length >= 3 ? {
        "@type": "AggregateRating",
        "ratingValue": avg,
        "reviewCount": reviews.length,
        "bestRating": 5
    } : null;
    const fragment = {
        "@context": "https://schema.org",
        "@type": "MusicGroup",
        "@id": `https://musicangel.ie/${bandSlug}#band`,
        "name": bandName,
        ...(aggregateRating ? { aggregateRating } : {}),
        "review": reviewObjects
    };
    return `${MARKER_LD_START}
    <script type="application/ld+json">${JSON.stringify(fragment)}</script>
    ${MARKER_LD_END}`;
}

function validReview(review) {
    const rating = Number(review && review.rating);
    return Boolean(
        review
        && review.author
        && review.body
        && review.sourceUrl
        && Number.isFinite(rating)
        && rating >= 1
        && rating <= 5
    );
}

function processFile(filePath, bandSlug, bandData) {
    let html = fs.readFileSync(filePath, 'utf8');
    const reviews = ((bandData && bandData.reviews) || [])
        .filter(validReview)
        .map(review => ({ ...review, rating: Number(review.rating) }));
    const sourceUrls = {
        googleMapsUrl: bandData ? bandData.googleMapsUrl : '',
        facebookPageUrl: bandData ? bandData.facebookPageUrl : '',
        weddingsOnlineUrl: bandData ? bandData.weddingsOnlineUrl : ''
    };

    // Remove any previously-injected blocks (idempotency).
    html = html.replace(new RegExp(MARKER_HTML_START + '[\\s\\S]*?' + MARKER_HTML_END, 'g'), '').replace(/\n\s*\n\s*\n/g, '\n\n');
    html = html.replace(new RegExp(MARKER_LD_START + '[\\s\\S]*?' + MARKER_LD_END, 'g'), '').replace(/\n\s*\n\s*\n/g, '\n\n');

    if (!reviews.length) {
        fs.writeFileSync(filePath, html);
        return { skipped: true, reviewCount: 0 };
    }

    // Inject HTML block before <!-- ========== ORIGINAL OTHER BANDS ========== -->
    // Falls back to before </main> or before <footer> if marker not present.
    const block = renderReviewsBlock(BAND_NAMES[bandSlug], bandSlug, reviews, sourceUrls);
    const insertAt = html.indexOf('<!-- ========== ORIGINAL OTHER BANDS ========== -->');
    if (insertAt > -1) {
        html = html.slice(0, insertAt) + block + '\n\n    ' + html.slice(insertAt);
    } else {
        // Insert before footer
        html = html.replace('<footer>', block + '\n\n    <footer>');
    }

    // Inject schema before </head>
    const schema = renderReviewSchema(BAND_NAMES[bandSlug], bandSlug, reviews);
    html = html.replace('</head>', schema + '\n</head>');

    fs.writeFileSync(filePath, html);
    return { skipped: false, reviewCount: reviews.length };
}

function main() {
    if (!fs.existsSync(REVIEWS_PATH)) {
        console.log('data/reviews.json not found. Nothing to inject.');
        return;
    }
    const data = JSON.parse(fs.readFileSync(REVIEWS_PATH, 'utf8'));

    let totalInjected = 0, totalCleared = 0;
    for (const slug of BAND_SLUGS) {
        const filePath = path.join(ROOT, slug, 'index.html');
        if (!fs.existsSync(filePath)) {
            console.log(`  Skipping ${slug}: page not found`);
            continue;
        }
        const result = processFile(filePath, slug, data[slug]);
        if (result.skipped) {
            console.log(`  ${slug}: no reviews — cleared any prior injection`);
            totalCleared++;
        } else {
            console.log(`  ${slug}: injected ${result.reviewCount} reviews + Review schema`);
            totalInjected++;
        }
    }
    console.log(`\nDone. ${totalInjected} bands updated, ${totalCleared} cleared.`);
    if (totalInjected === 0) {
        console.log(`\nTo activate reviews:\n  1. Edit data/reviews.json — fill in the "reviews" array per band\n  2. Re-run: node scripts/inject-reviews.js\n  3. Commit + push`);
    }
}

main();
