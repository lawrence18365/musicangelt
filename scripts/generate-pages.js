#!/usr/bin/env node
/**
 * Generate venue and county landing pages from JSON data.
 *
 *   node scripts/generate-pages.js
 *
 * Reads:
 *   data/venues.json   → /wedding-band-{slug}/index.html
 *   data/counties.json → /wedding-bands-{slug}/index.html
 * Writes:
 *   sitemap.xml (regenerated)
 */
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const VENUES = JSON.parse(fs.readFileSync(path.join(ROOT, 'data/venues.json'), 'utf8'));
const COUNTIES = JSON.parse(fs.readFileSync(path.join(ROOT, 'data/counties.json'), 'utf8'));

const GA_ID = 'G-WV874YXC8Z';
const SITE = 'https://musicangel.ie';
const pageUrl = slug => slug ? `${SITE}/${slug}/` : `${SITE}/`;

const BANDS = {
    'the-beat-boutique': {
        name: 'The Beat Boutique',
        genre: 'Jazz · Soul · Funk · Rock · Pop · Dance',
        blurb: 'Fixed four-piece line-up with a 200+ song repertoire, boutique polish and real room-reading.'
    },
    'sway-social': {
        name: 'Sway Social',
        genre: 'Pop · Rock · Soul · Club Classics',
        blurb: 'Four musicians, four vocalists and a live set built for fast, high-energy floor filling.'
    },
    'the-best-men': {
        name: 'The Best Men',
        genre: 'Pop · Rock · Soul · Floor-Fillers',
        blurb: 'Four-piece party band with long-running experience, big harmonies and proven crowd-reading.'
    },
    'blacktye': {
        name: 'Blacktye',
        genre: 'Chart · Soul · Funk · Rock · Irish',
        blurb: 'Versatile five-piece band with two lead vocalists, full-day package options and a huge setlist.'
    }
};

const AUTHORITY_LINKS = [
    { href: '/check-availability/', label: 'Check wedding band availability', note: 'Send your date, venue, county and band preference for a fast availability reply.' },
    { href: '/compare-bands/', label: 'Compare all four wedding bands', note: 'Best starting point if you are choosing between MusicAngel bands.' },
    { href: '/wedding-band-cost-ireland/', label: 'Wedding band cost in Ireland', note: 'Pricing guide for live wedding bands and package decisions.' },
    { href: '/wedding-band-showcases/', label: 'Wedding band showcases', note: 'How to see bands live before booking where possible.' },
    { href: '/first-dance-songs/', label: 'First dance songs', note: 'Live-band friendly first dance ideas for Irish weddings.' },
    { href: '/ceremony-music/', label: 'Wedding ceremony music', note: 'Processional, signing and recessional music ideas for Irish ceremonies.' },
    { href: '/wedding-band-vs-dj/', label: 'Wedding band vs DJ', note: 'A clear comparison for couples deciding between live music and a DJ.' },
    { href: '/wedding-music-timeline/', label: 'Wedding music timeline', note: 'Plan ceremony, drinks reception, first dance, band set and DJ timings.' },
    { href: '/when-to-book-wedding-band/', label: 'When to book your wedding band', note: 'Booking windows for peak dates, winter weddings and short-lead enquiries.' },
    { href: '/questions-to-ask-wedding-band/', label: 'Questions to ask a wedding band', note: 'Practical checks before you commit to a live wedding band.' },
    { href: '/song-list/', label: 'Wedding band song list', note: 'See live-band friendly songs and floor-filler ideas.' },
    { href: '/venues/', label: 'Irish wedding venue guides', note: 'Venue-specific MusicAngel pages grouped by county.' }
];

const REGIONAL_AUTHORITY_LINKS = [
    { href: '/wedding-bands-antrim/', label: 'Wedding bands in Antrim' },
    { href: '/wedding-bands-armagh/', label: 'Wedding bands in Armagh' },
    { href: '/wedding-bands-down/', label: 'Wedding bands in Down' },
    { href: '/wedding-bands-fermanagh/', label: 'Wedding bands in Fermanagh' },
    { href: '/wedding-bands-derry/', label: 'Wedding bands in Derry' },
    { href: '/wedding-bands-tyrone/', label: 'Wedding bands in Tyrone' }
];

const FEATURED_VENUE_LINKS = [
    { href: '/wedding-band-tinakilly-country-house/', label: 'Tinakilly Country House wedding band' },
    { href: '/wedding-band-kinnitty-castle/', label: 'Kinnitty Castle wedding band' }
];

function cleanText(s) {
    return String(s == null ? '' : s).replace(/\s+\u2014\s+/g, ', ').replace(/\u2014/g, '-');
}

function cleanJsonLd(value) {
    return JSON.parse(JSON.stringify(value, (_key, item) => typeof item === 'string' ? cleanText(item) : item));
}

function esc(s) {
    return cleanText(s)
        .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
}

const sharedHead = ({ title, description, canonical, ogImage, ogImageW, ogImageH, jsonLd }) => `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${esc(title)}</title>
    <meta name="description" content="${esc(description)}">
    <meta name="theme-color" content="#FBF8F5">
    <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1">
    <link rel="canonical" href="${canonical}">
    <script>
        // Prevent staging and preview hostnames from being indexed.
        (function(){
            var h = location.hostname;
            if (h && h !== 'musicangel.ie' && h !== 'www.musicangel.ie') {
                var m = document.createElement('meta');
                m.name = 'robots';
                m.content = 'noindex, nofollow';
                document.head.appendChild(m);
            }
        })();
    </script>

    <meta property="og:type" content="article">
    <meta property="og:site_name" content="MusicAngel">
    <meta property="og:title" content="${esc(title)}">
    <meta property="og:description" content="${esc(description)}">
    <meta property="og:url" content="${canonical}">
    <meta property="og:image" content="${ogImage}">
    <meta property="og:image:width" content="${ogImageW}">
    <meta property="og:image:height" content="${ogImageH}">
    <meta property="og:locale" content="en_IE">

    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:title" content="${esc(title)}">
    <meta name="twitter:description" content="${esc(description)}">
    <meta name="twitter:image" content="${ogImage}">

    <link rel="preconnect" href="https://www.googletagmanager.com">
    <link rel="icon" href="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 64 64'%3E%3Crect width='64' height='64' rx='16' fill='%23FBF8F5'/%3E%3Cpath d='M19 46V18l25-4v27' fill='none' stroke='%23F26CA7' stroke-width='4.5' stroke-linecap='round'/%3E%3Ccircle cx='19' cy='46' r='7' fill='%23F7D6E4'/%3E%3Ccircle cx='44' cy='41' r='7' fill='%23C8B28A'/%3E%3C/svg%3E">
    <link rel="stylesheet" href="/css/seo-forms.css?v=20260619-seo">

    <script>
        window.dataLayer = window.dataLayer || [];
        function gtag(){dataLayer.push(arguments);}
        gtag('consent', 'default', { ad_storage: 'denied', ad_user_data: 'denied', ad_personalization: 'denied', analytics_storage: 'denied', functionality_storage: 'granted', security_storage: 'granted', wait_for_update: 500 });
        gtag('set', 'ads_data_redaction', true); gtag('set', 'url_passthrough', true);
        gtag('js', new Date()); gtag('config', '${GA_ID}', { anonymize_ip: true });
    </script>
    <script async src="https://www.googletagmanager.com/gtag/js?id=${GA_ID}"></script>

    <!-- Marketing tags (Meta Pixel, LinkedIn Insight). Set IDs to activate. -->
    <script>
        window.META_PIXEL_ID = window.META_PIXEL_ID || '';
        window.LINKEDIN_PARTNER_ID = window.LINKEDIN_PARTNER_ID || '';
        window.GOOGLE_ADS_CONVERSION_ID = window.GOOGLE_ADS_CONVERSION_ID || '';
        window.GOOGLE_ADS_LEAD_LABEL = window.GOOGLE_ADS_LEAD_LABEL || '';
        window.GOOGLE_ADS_CONTACT_LABEL = window.GOOGLE_ADS_CONTACT_LABEL || '';
        window.HOTJAR_SITE_ID = window.HOTJAR_SITE_ID || '';
        window.CLARITY_PROJECT_ID = window.CLARITY_PROJECT_ID || '';
    </script>
    <script defer src="/js/google-ads-config.js?v=20260612-ads-sot1"></script>
    <script defer src="/js/marketing-tags.js?v=20260612-ads-sot1"></script>

    <script type="application/ld+json">
${JSON.stringify(cleanJsonLd(jsonLd), null, 4)}
    </script>

    <style>${PAGE_CSS}</style>
</head>`;

const PAGE_CSS = `
*, *::before, *::after { margin: 0; padding: 0; box-sizing: border-box; }
:root { --ink: #111111; --ink-soft: #2a2a2a; --pink: #C2185B; --pink-hover: #A9144E; --blush: #F7D6E4; --ivory: #FBF8F5; --text: #2a2a2a; --text-muted: #6a6266; --border: rgba(247, 214, 228, 0.5); --border-strong: rgba(242, 108, 167, 0.22); --serif: Georgia, 'Times New Roman', serif; --sans: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; --shadow-soft: 0 24px 70px rgba(34, 25, 28, 0.08); --ease-out: cubic-bezier(0.16, 1, 0.3, 1); }
html { scroll-behavior: smooth; }
body { background: radial-gradient(circle at 8% 12%, rgba(247, 214, 228, 0.42), transparent 28rem), linear-gradient(180deg, var(--ivory) 0%, #fff 36%, var(--ivory) 100%); color: var(--text); font-family: var(--sans); font-size: 16px; line-height: 1.75; -webkit-font-smoothing: antialiased; text-rendering: optimizeLegibility; }
::selection { background: var(--blush); color: var(--ink); }
img { max-width: 100%; display: block; }
.skip-link { position: fixed; top: 0.9rem; left: 0.9rem; z-index: 1000; transform: translateY(-150%); background: var(--ink); color: #fff; padding: 0.65rem 0.9rem; font-size: 0.62rem; font-weight: 600; letter-spacing: 0.14em; text-transform: uppercase; text-decoration: none; transition: transform 0.25s var(--ease-out); }
.skip-link:focus { transform: translateY(0); }
nav.top { position: sticky; top: 0; z-index: 100; display: flex; align-items: center; justify-content: space-between; padding: 1.1rem clamp(1rem, 5vw, 3rem); background: rgba(251, 248, 245, 0.88); backdrop-filter: saturate(180%) blur(14px); -webkit-backdrop-filter: saturate(180%) blur(14px); border-bottom: 1px solid var(--border); }
.nav-brand { font-family: var(--serif); font-size: 1.55rem; color: var(--ink); text-decoration: none; }
.nav-brand i { color: var(--pink); font-style: italic; font-weight: 500; }
.nav-back { font-size: 0.72rem; font-weight: 600; letter-spacing: 0.12em; text-transform: uppercase; color: var(--text-muted); text-decoration: none; transition: color 0.18s; }
.nav-back:hover { color: var(--pink); }
.wrap { max-width: 980px; margin: 0 auto; padding: 0 clamp(1rem, 5vw, 3rem); }
.crumb { font-size: 0.72rem; color: var(--text-muted); letter-spacing: 0.08em; text-transform: uppercase; padding: 1.25rem 0; }
.crumb a { color: var(--text-muted); text-decoration: none; transition: color 0.18s; }
.crumb a:hover { color: var(--pink); }
.crumb span { color: var(--ink); }
.crumb .sep { padding: 0 0.45rem; color: var(--border-strong); }
.hero { padding: 1.5rem 0 3rem; max-width: 740px; }
.eye { font-size: 0.74rem; font-weight: 600; letter-spacing: 0.18em; text-transform: uppercase; color: var(--pink); margin-bottom: 1rem; }
h1 { font-family: var(--serif); font-size: clamp(2.4rem, 6vw, 4.4rem); font-weight: 400; color: var(--ink); line-height: 1.05; letter-spacing: -0.01em; margin-bottom: 1rem; }
h1 em { font-style: italic; color: var(--pink); font-weight: 500; }
.hero .sub { font-family: var(--serif); font-style: italic; font-size: 1.2rem; color: var(--text-muted); margin-bottom: 1.4rem; }
.hero .lede { font-size: 1.1rem; line-height: 1.75; color: var(--ink-soft); margin-bottom: 1.75rem; }
.ctas { display: flex; gap: 0.85rem; flex-wrap: wrap; }
.btn { display: inline-flex; align-items: center; gap: 0.5rem; padding: 0.95rem 1.6rem; font-size: 0.72rem; font-weight: 600; letter-spacing: 0.14em; text-transform: uppercase; border-radius: 999px; text-decoration: none; cursor: pointer; transition: transform 0.18s, background 0.18s, color 0.18s, border-color 0.18s; border: 1px solid transparent; }
.btn-pink { background: var(--pink); color: #fff; box-shadow: 0 12px 34px rgba(242, 108, 167, 0.28); }
.btn-pink:hover { background: var(--pink-hover); transform: translateY(-2px); }
.btn-ghost { background: transparent; color: var(--ink); border-color: var(--ink); }
.btn-ghost:hover { background: var(--ink); color: #fff; }
.btn svg { width: 14px; height: 14px; stroke: currentColor; stroke-width: 2; fill: none; }
section { padding: 3.5rem 0; }
.sec-eye { font-size: 0.74rem; font-weight: 600; letter-spacing: 0.18em; text-transform: uppercase; color: var(--pink); margin-bottom: 0.85rem; }
.sec-h2 { font-family: var(--serif); font-size: clamp(2rem, 4vw, 2.8rem); font-weight: 400; color: var(--ink); line-height: 1.18; margin-bottom: 1.5rem; }
.sec-h2 em { font-style: italic; color: var(--pink); font-weight: 500; }
.detail p { font-size: 1.02rem; line-height: 1.75; color: var(--ink-soft); margin-bottom: 1.1rem; max-width: 42rem; }
.detail ul { margin: 1rem 0 0 1.1rem; max-width: 44rem; }
.detail li { margin-bottom: 0.65rem; color: var(--ink-soft); }
.picks { display: grid; gap: 1.25rem; margin-top: 2rem; }
.pick { display: grid; grid-template-columns: 1fr; gap: 0.4rem; padding: 1.75rem 1.6rem; background: #fff; border: 1px solid var(--border); border-radius: 14px; transition: border-color 0.18s, box-shadow 0.18s; }
.pick:hover { border-color: var(--border-strong); box-shadow: var(--shadow-soft); }
.pick-genre { font-size: 0.7rem; letter-spacing: 0.12em; text-transform: uppercase; color: var(--text-muted); }
.pick h3 { font-family: var(--serif); font-size: 1.55rem; color: var(--ink); font-weight: 500; }
.pick h3 a { color: inherit; text-decoration: none; transition: color 0.18s; }
.pick h3 a:hover { color: var(--pink); }
.pick p { font-size: 0.97rem; color: var(--ink-soft); line-height: 1.7; }
.pick .why { font-style: italic; color: var(--text-muted); font-family: var(--serif); font-size: 1.02rem; }
.pick-cta { margin-top: 0.5rem; font-size: 0.7rem; font-weight: 600; letter-spacing: 0.12em; text-transform: uppercase; color: var(--pink); text-decoration: none; }
.authority-links { background: #fff; border-top: 1px solid var(--border); border-bottom: 1px solid var(--border); }
.authority-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(13.5rem, 1fr)); gap: 0.8rem; margin-top: 1.3rem; }
.authority-link { display: block; min-height: 100%; padding: 1rem 1.05rem; border: 1px solid var(--border); border-radius: 10px; color: inherit; text-decoration: none; background: var(--ivory); transition: border-color 0.18s, transform 0.18s, box-shadow 0.18s; }
.authority-link:hover { border-color: var(--pink); transform: translateY(-1px); box-shadow: var(--shadow-soft); }
.authority-link strong { display: block; color: var(--ink); font-family: var(--serif); font-size: 1.04rem; font-weight: 500; line-height: 1.25; }
.authority-link span { display: block; margin-top: 0.35rem; color: var(--text-muted); font-size: 0.84rem; line-height: 1.55; }
.regional-links { margin-top: 1.4rem; padding-top: 1.25rem; border-top: 1px solid var(--border); }
.regional-links p { margin-bottom: 0.85rem; color: var(--text-muted); font-size: 0.74rem; font-weight: 600; letter-spacing: 0.14em; text-transform: uppercase; }
.regional-grid { display: flex; flex-wrap: wrap; gap: 0.55rem; }
.regional-grid a { display: inline-flex; align-items: center; min-height: 2.25rem; padding: 0.52rem 0.8rem; border: 1px solid var(--border); border-radius: 999px; color: var(--ink-soft); text-decoration: none; background: #fff; font-size: 0.82rem; transition: border-color 0.18s, color 0.18s; }
.regional-grid a:hover { border-color: var(--pink); color: var(--pink); }
.venues-list { display: grid; grid-template-columns: repeat(auto-fit, minmax(15rem, 1fr)); gap: 0.65rem; margin-top: 1.25rem; }
.venues-list li { list-style: none; padding: 0.85rem 1rem; background: rgba(255,255,255,0.6); border: 1px solid var(--border); border-radius: 10px; font-size: 0.92rem; color: var(--ink-soft); }
.price-band { background: rgba(247, 214, 228, 0.28); padding: 3rem 0; border-top: 1px solid var(--border); border-bottom: 1px solid var(--border); margin: 1.5rem 0; }
.price-band-inner { text-align: center; max-width: 38rem; margin: 0 auto; }
.price-band-inner h2 { font-family: var(--serif); font-size: clamp(1.7rem, 3.5vw, 2.3rem); font-weight: 400; color: var(--ink); margin-bottom: 0.5rem; line-height: 1.2; }
.price-band-inner h2 strong { color: var(--pink); font-weight: 500; font-style: italic; }
.price-band-inner p { color: var(--text-muted); font-family: var(--serif); font-style: italic; font-size: 1.02rem; margin-bottom: 1.4rem; }
details.faq { border-bottom: 1px solid var(--border); padding: 1.1rem 0; }
details.faq summary { cursor: pointer; list-style: none; font-family: var(--serif); font-size: 1.2rem; color: var(--ink); font-weight: 500; display: flex; align-items: flex-start; justify-content: space-between; gap: 1.5rem; }
details.faq summary::-webkit-details-marker { display: none; }
details.faq summary::after { content: '+'; font-family: var(--sans); font-weight: 300; font-size: 1.55rem; color: var(--pink); transition: transform 0.25s; flex-shrink: 0; }
details.faq[open] summary::after { transform: rotate(45deg); }
details.faq p { font-size: 0.96rem; line-height: 1.7; color: var(--ink-soft); margin-top: 0.9rem; padding-right: 2rem; max-width: 42rem; }
.enquire { background: linear-gradient(180deg, transparent, rgba(247, 214, 228, 0.22)); padding: 5rem 0; }
form#enquiry { display: grid; gap: 1rem; background: #fff; padding: clamp(1.5rem, 4vw, 2.5rem); border: 1px solid var(--border); border-radius: 18px; box-shadow: var(--shadow-soft); margin-top: 2rem; }
.f-row { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }
.fg label { display: block; font-size: 0.7rem; font-weight: 600; letter-spacing: 0.12em; text-transform: uppercase; color: var(--text-muted); margin-bottom: 0.4rem; }
.fg input, .fg select, .fg textarea { width: 100%; font-family: var(--sans); font-size: 0.95rem; padding: 0.75rem 0.9rem; border: 1px solid var(--border-strong); background: var(--ivory); border-radius: 10px; color: var(--ink); transition: border-color 0.2s, background 0.2s, box-shadow 0.2s; }
.fg input:focus, .fg select:focus, .fg textarea:focus { outline: none; border-color: var(--pink); background: #fff; box-shadow: 0 0 0 3px rgba(242, 108, 167, 0.15); }
.fg textarea { min-height: 100px; resize: vertical; }
.btn-submit { width: 100%; justify-content: center; }
.form-status { font-size: 0.85rem; color: var(--text-muted); text-align: center; min-height: 1.2rem; margin-top: 0.5rem; }
footer { padding: 3rem 0 3.5rem; border-top: 1px solid var(--border); }
.footer-inner { display: flex; flex-wrap: wrap; gap: 1.5rem; justify-content: space-between; align-items: center; font-size: 0.85rem; color: var(--text-muted); }
.footer-inner a { color: var(--text-muted); text-decoration: none; }
.footer-inner a:hover { color: var(--pink); }
.footer-links { display: flex; gap: 1.25rem; list-style: none; flex-wrap: wrap; }
.cc { position: fixed; bottom: 1rem; left: 1rem; right: 1rem; max-width: 26rem; margin-left: auto; background: var(--ink); color: #fff; padding: 1.05rem 1.15rem 0.95rem; border-radius: 14px; box-shadow: 0 18px 52px rgba(34, 25, 28, 0.32); z-index: 1100; font-size: 0.78rem; line-height: 1.55; opacity: 0; transform: translateY(8px); transition: opacity 0.35s, transform 0.35s; }
.cc[hidden] { display: none; }
.cc.visible { opacity: 1; transform: translateY(0); }
.cc p { margin: 0 0 0.7rem; color: rgba(255, 255, 255, 0.85); }
.cc a { color: var(--blush); text-decoration: underline; text-underline-offset: 2px; }
.cc-actions { display: flex; gap: 0.5rem; justify-content: flex-end; flex-wrap: wrap; }
.cc-btn { border: 1px solid rgba(255, 255, 255, 0.22); background: transparent; color: #fff; padding: 0.5rem 0.95rem; font-size: 0.66rem; font-weight: 600; letter-spacing: 0.12em; text-transform: uppercase; border-radius: 999px; cursor: pointer; transition: background 0.2s; }
.cc-btn:hover { background: rgba(255, 255, 255, 0.08); }
.cc-accept { background: var(--pink); border-color: var(--pink); }
.cc-accept:hover { background: var(--pink-hover); border-color: var(--pink-hover); }
@media (max-width: 640px) { section { padding: 2.6rem 0; } .f-row { grid-template-columns: 1fr; } .cc { left: 0.6rem; right: 0.6rem; bottom: 0.6rem; } }
`;

const sharedFooter = `
    <footer>
        <div class="wrap">
            <div class="footer-inner">
                <a href="/" class="nav-brand" style="font-size: 1.35rem;">Music<i>Angel</i></a>
                <ul class="footer-links">
                    <li><a href="/#bands">All Bands</a></li>
                    <li><a href="/compare-bands/">Compare</a></li>
                    <li><a href="/wedding-band-cost-ireland/">Pricing</a></li>
                    <li><a href="/check-availability/">Availability</a></li>
                    <li><a href="/venues/">Venues</a></li>
                    <li><a href="/#contact">Enquire</a></li>
                    <li><a href="/privacy/">Privacy</a></li>
                    <li><a href="/cookies/">Cookies</a></li>
                </ul>
                <span>&copy; 2026 MusicAngel.ie</span>
            </div>
        </div>
    </footer>

    <div id="cc" class="cc" hidden role="dialog" aria-live="polite" aria-label="Cookie consent">
        <p>We use Google Analytics cookies to understand how visitors use the site. See our <a href="/privacy/">privacy policy</a> and <a href="/cookies/">cookies policy</a>.</p>
        <div class="cc-actions">
            <button type="button" class="cc-btn" data-cc="decline">Decline</button>
            <button type="button" class="cc-btn cc-accept" data-cc="accept">Accept</button>
        </div>
    </div>

    <script defer src="/js/site.js?v=20260612-ads-sot1"></script>
</body>
</html>
`;

function authorityLinksSection({ title = 'Keep planning your wedding music', intro = 'Use these MusicAngel guides to compare bands, understand pricing, and choose the right live-music route for your day.' } = {}) {
    const links = AUTHORITY_LINKS.map(link => `                <a class="authority-link" href="${link.href}"><strong>${esc(link.label)}</strong><span>${esc(link.note)}</span></a>`).join('\n');
    const regionalLinks = REGIONAL_AUTHORITY_LINKS.map(link => `<a href="${link.href}">${esc(link.label)}</a>`).join('\n                ');
    const featuredVenueLinks = FEATURED_VENUE_LINKS.map(link => `<a href="${link.href}">${esc(link.label)}</a>`).join('\n                ');
    return `<section class="authority-links">
        <div class="wrap">
            <p class="sec-eye">Related guides</p>
            <h2 class="sec-h2">${title}</h2>
            <div class="detail"><p>${esc(intro)}</p></div>
            <div class="authority-grid">
${links}
            </div>
            <div class="regional-links" aria-label="Northern Ireland wedding band guides">
                <p>Northern Ireland county guides</p>
                <div class="regional-grid">
                ${regionalLinks}
                </div>
            </div>
            <div class="regional-links" aria-label="Featured venue wedding band guides">
                <p>Featured venue guides</p>
                <div class="regional-grid">
                ${featuredVenueLinks}
                </div>
            </div>
        </div>
    </section>`;
}

function bandsFaqSection(faq) {
    const items = faq.map(f => `                <details class="faq"><summary>${esc(f.q)}</summary>
                    <p>${esc(f.a)}</p>
                </details>`).join('\n');
    return `<section class="faq-section">
        <div class="wrap">
            <p class="sec-eye">Couples often ask</p>
            <h2 class="sec-h2">Questions <em>answered</em></h2>
            <div class="faq-list">
${items}
            </div>
        </div>
    </section>`;
}

function enquirySection({ heading, prefillBand = '', prefillVenue = '', context = '' }) {
    const contextInput = context ? `                <input type="hidden" name="package_or_service_interest" value="${esc(context)}">\n` : '';
    return `<section id="enquiry" class="enquire">
        <div class="wrap">
            <p class="sec-eye">Check availability</p>
            <h2 class="sec-h2">${heading}</h2>
            <p style="max-width: 36rem; color: var(--text-muted); font-family: var(--serif); font-style: italic; font-size: 1.05rem;">Send your date and venue. We'll come back within one working day with availability and a tailored quote.</p>

            <form id="enquiry">
${contextInput}
                <div class="f-row">
                    <div class="fg"><label for="name">Your Name</label><input id="name" name="name" type="text" autocomplete="name" required></div>
                    <div class="fg"><label for="partner">Partner's Name</label><input id="partner" name="partner" type="text"></div>
                </div>
                <div class="f-row">
                    <div class="fg"><label for="email">Email</label><input id="email" name="email" type="email" autocomplete="email" required></div>
                    <div class="fg"><label for="phone">Phone</label><input id="phone" name="phone" type="tel" autocomplete="tel"></div>
                </div>
                <div class="f-row">
                    <div class="fg"><label for="date">Wedding Date</label><input id="date" name="date" type="date"></div>
                    <div class="fg"><label for="venue">Venue</label><input id="venue" name="venue" type="text" value="${esc(prefillVenue)}"></div>
                </div>
                <div class="fg"><label for="band">Which Band</label><select id="band" name="band">
                    <option value="">${prefillBand ? 'Suggested: ' + esc(prefillBand) : 'Select a band...'}</option>
                    <option${prefillBand === 'The Beat Boutique' ? ' selected' : ''}>The Beat Boutique</option>
                    <option${prefillBand === 'Sway Social' ? ' selected' : ''}>Sway Social</option>
                    <option${prefillBand === 'The Best Men' ? ' selected' : ''}>The Best Men</option>
                    <option${prefillBand === 'Blacktye' ? ' selected' : ''}>Blacktye</option>
                    <option value="Not sure yet">Not sure yet, help me choose</option>
                </select></div>
                <div class="fg"><label for="message">Tell us about your day</label><textarea id="message" name="message" placeholder="Guest count, ceremony or drinks-reception music, anything special..."></textarea></div>
                <input type="text" name="hp" tabindex="-1" autocomplete="off" aria-hidden="true" style="position:absolute;left:-9999px;width:1px;height:1px;opacity:0">
                <button type="submit" class="btn btn-pink btn-submit">Send Enquiry <svg viewBox="0 0 24 24"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg></button>
                <p class="form-status" id="formStatus" role="status" aria-live="polite"></p>
            </form>
        </div>
    </section>`;
}

function renderVenue(v) {
    const canonical = pageUrl(`wedding-band-${v.slug}`);
    const titleWithCounty = `Wedding Band for ${v.name}, ${v.county} | MusicAngel`;
    const title = titleWithCounty.length <= 68 ? titleWithCounty : `Wedding Band for ${v.name} | MusicAngel`;
    const description = `Wedding band for ${v.name}, ${v.county}. Explore four live Irish bands for your venue, with 100% live sets and pricing from €2450.`;
    const heroImage = `${SITE}/assets/bands/hero-beat-boutique.webp`;
    const topBand = v.bandPicks[0];

    const jsonLd = {
        "@context": "https://schema.org",
        "@graph": [
            {
                "@type": "Place",
                "@id": `${canonical}#place`,
                "name": v.name,
                "address": { "@type": "PostalAddress", "addressLocality": v.town, "addressRegion": `County ${v.county}`, "addressCountry": "IE" }
            },
            {
                "@type": "BreadcrumbList",
                "itemListElement": [
                    { "@type": "ListItem", "position": 1, "name": "MusicAngel", "item": pageUrl('') },
                    { "@type": "ListItem", "position": 2, "name": "Wedding Venues", "item": `${SITE}/#bands` },
                    { "@type": "ListItem", "position": 3, "name": `Wedding Band for ${v.name}`, "item": canonical }
                ]
            },
            {
                "@type": "ItemList",
                "name": `MusicAngel bands for ${v.name}`,
                "itemListElement": v.bandPicks.map((b, i) => ({
                    "@type": "ListItem", "position": i + 1,
                    "item": { "@type": "MusicGroup", "name": b.name, "url": pageUrl(b.slug) }
                }))
            },
            {
                "@type": "FAQPage",
                "mainEntity": v.faq.map(f => ({ "@type": "Question", "name": f.q, "acceptedAnswer": { "@type": "Answer", "text": f.a } }))
            }
        ]
    };

    const picksHtml = v.bandPicks.map(b => `                <article class="pick">
                    <p class="pick-genre">${BANDS[b.slug].genre}</p>
                    <h3><a href="/${b.slug}/">${esc(b.name)}</a></h3>
                    <p class="why">${esc(b.why)}</p>
                    <a href="/${b.slug}/" class="pick-cta">View ${esc(b.name)} &rarr;</a>
                </article>`).join('\n');

    return `${sharedHead({ title, description, canonical, ogImage: heroImage, ogImageW: 1400, ogImageH: 788, jsonLd })}
<body>
    <a href="#enquiry" class="skip-link">Skip to enquiry form</a>
    <nav class="top">
        <a href="/" class="nav-brand">Music<i>Angel</i></a>
        <a href="/#bands" class="nav-back">&larr; All Bands</a>
    </nav>
    <div class="wrap">
        <nav class="crumb" aria-label="Breadcrumb">
            <a href="/">MusicAngel</a><span class="sep">/</span><a href="/#bands">Wedding Bands</a><span class="sep">/</span><span>${esc(v.name)}</span>
        </nav>
        <header class="hero">
            <p class="eye">Wedding band · ${esc(v.county)}</p>
            <h1>Wedding band for <em>${esc(v.name)}</em></h1>
            <p class="sub">${esc(v.style)} · ${esc(v.town)}, Co. ${esc(v.county)}</p>
            <p class="lede">${esc(v.intro)}</p>
            <div class="ctas">
                <a href="#enquiry" class="btn btn-pink">Check Availability <svg viewBox="0 0 24 24"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg></a>
                <a href="#picks" class="btn btn-ghost">See MusicAngel Bands</a>
            </div>
        </header>
    </div>

    <section>
        <div class="wrap">
            <p class="sec-eye">About the room</p>
            <h2 class="sec-h2">Playing at <em>${esc(v.name)}</em></h2>
            <div class="detail">
                <p>${esc(v.venueDetail)}</p>
                <p>Capacity guide: ${esc(v.capacityHint)}.</p>
            </div>
        </div>
    </section>

    <section>
        <div class="wrap">
            <p class="sec-eye">Before you book</p>
            <h2 class="sec-h2">What matters for a band at <em>${esc(v.name)}</em></h2>
            <div class="detail">
                <p>A wedding band quote for ${esc(v.name)} should be based on the actual reception room, guest count, finish time, and whether you need ceremony or drinks-reception music before the evening set. For a ${esc(v.style)} with a ${esc(v.vibe)} feel, the wrong band can look underpowered even if the song list is good.</p>
                <ul>
                    <li><strong>Room and guest count:</strong> tell us which room you are using and roughly how many guests are attending, so the PA and stage footprint are right.</li>
                    <li><strong>Timeline:</strong> confirm speeches, first dance time, band start time, and whether the venue needs the band loaded in before guests enter the room.</li>
                    <li><strong>Music brief:</strong> share three songs you love and three you do not want. That helps us understand the live-music priorities for your day.</li>
                    <li><strong>Extras:</strong> ceremony music, drinks-reception sets, sax, or a later DJ finish should be quoted upfront rather than added late.</li>
                </ul>
            </div>
        </div>
    </section>

    <section id="picks">
        <div class="wrap">
            <p class="sec-eye">MusicAngel bands</p>
            <h2 class="sec-h2">Explore bands for <em>${esc(v.name)}</em></h2>
            <div class="detail">
                <p>Browse MusicAngel bands that can be checked for your date, venue room, guest count and live-music brief.</p>
            </div>
            <div class="picks">
${picksHtml}
            </div>
        </div>
    </section>

    <div class="price-band">
        <div class="wrap">
            <div class="price-band-inner">
                <h2>Packages from <strong>€2450</strong></h2>
                <p>Final quote depends on date, package, and any ceremony or drinks-reception add-ons.</p>
                <a href="#enquiry" class="btn btn-pink">Get a Quote <svg viewBox="0 0 24 24"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg></a>
            </div>
        </div>
    </div>

    ${bandsFaqSection(v.faq)}

    ${authorityLinksSection({
        title: `Plan the rest of your <em>${esc(v.name)}</em> music`,
        intro: `Compare the four MusicAngel bands, check package pricing, and use the venue and planning guides before you enquire for ${v.name}.`
    })}

    ${enquirySection({ heading: `Enquire about a wedding band for <em>${esc(v.name)}</em>`, prefillBand: topBand.name, prefillVenue: `${v.name}, Co. ${v.county}` })}

    ${sharedFooter}
`;
}

function renderCounty(c) {
    const canonical = pageUrl(`wedding-bands-${c.slug}`);
    const title = `Wedding Bands in ${c.name} | MusicAngel`;
    const description = `Looking for a wedding band in County ${c.name}? Explore four live wedding bands serving ${c.name} and the rest of Ireland. 100% live, pricing from €2450.`;
    const heroImage = `${SITE}/assets/bands/hero-beat-boutique.webp`;

    const jsonLd = {
        "@context": "https://schema.org",
        "@graph": [
            {
                "@type": "Service",
                "@id": `${canonical}#service`,
                "serviceType": "Wedding band booking",
                "provider": { "@type": "Organization", "name": "MusicAngel", "url": pageUrl('') },
                "areaServed": { "@type": "AdministrativeArea", "name": `County ${c.name}`, "containedInPlace": { "@type": "Country", "name": "Ireland" } },
                "url": canonical
            },
            {
                "@type": "BreadcrumbList",
                "itemListElement": [
                    { "@type": "ListItem", "position": 1, "name": "MusicAngel", "item": pageUrl('') },
                    { "@type": "ListItem", "position": 2, "name": "Wedding Bands", "item": `${SITE}/#bands` },
                    { "@type": "ListItem", "position": 3, "name": `Wedding Bands in ${c.name}`, "item": canonical }
                ]
            },
            {
                "@type": "ItemList",
                "name": `Wedding bands serving County ${c.name}`,
                "itemListElement": c.topPicks.map((slug, i) => ({
                    "@type": "ListItem", "position": i + 1,
                    "item": { "@type": "MusicGroup", "name": BANDS[slug].name, "url": pageUrl(slug) }
                }))
            }
        ]
    };

    const picksHtml = c.topPicks.map(slug => {
        const b = BANDS[slug];
        return `                <article class="pick">
                    <p class="pick-genre">${b.genre}</p>
                    <h3><a href="/${slug}/">${esc(b.name)}</a></h3>
                    <p>${esc(b.blurb)}</p>
                    <a href="/${slug}/" class="pick-cta">View ${esc(b.name)} &rarr;</a>
                </article>`;
    }).join('\n');

    // Cross-link venue names → venue pages where they exist.
    const venueBySlug = Object.fromEntries(VENUES.map(v => [v.slug, v]));
    const venueByName = Object.fromEntries(VENUES.map(v => [v.name.toLowerCase(), v.slug]));
    const venuesList = c.venues.map(rawName => {
        // Match by exact name OR by leading words ("Ashford Castle (just over the Mayo border)" → "ashford castle")
        const lower = rawName.toLowerCase();
        let matchSlug = venueByName[lower] || null;
        if (!matchSlug) {
            for (const v of VENUES) {
                if (lower.startsWith(v.name.toLowerCase())) { matchSlug = v.slug; break; }
            }
        }
        if (matchSlug) {
            return `                <li><a href="/wedding-band-${matchSlug}/" style="text-decoration:none;color:inherit;display:block">${esc(rawName)} &rarr;</a></li>`;
        }
        return `                <li>${esc(rawName)}</li>`;
    }).join('\n');

    const faq = [
        { q: `Do MusicAngel bands play weddings in County ${c.name}?`, a: `Yes. All four MusicAngel bands play across all of Ireland, including ${c.name}. Travel logistics are factored into the quote and confirmed with you at booking.` },
        { q: `Which MusicAngel bands can we check for County ${c.name}?`, a: `Send an enquiry with your venue and date and we'll check availability across the MusicAngel bands for your day.` },
        { q: `How much does a wedding band cost in County ${c.name}?`, a: `Packages start from €2450. The final quote depends on your wedding date, the venue location within ${c.name}, ceremony or drinks-reception add-ons, and the package you choose.` },
        { q: `When should I book a wedding band for a ${c.name} wedding?`, a: `12-18 months in advance is normal for peak summer Saturday dates, particularly at the larger venues. Earlier is always better; popular bands and dates go quickly.` }
    ];

    return `${sharedHead({ title, description, canonical, ogImage: heroImage, ogImageW: 1400, ogImageH: 788, jsonLd: { ...jsonLd, "@graph": [...jsonLd["@graph"], { "@type": "FAQPage", "mainEntity": faq.map(f => ({ "@type": "Question", "name": f.q, "acceptedAnswer": { "@type": "Answer", "text": f.a } })) }] } })}
<body>
    <a href="#enquiry" class="skip-link">Skip to enquiry form</a>
    <nav class="top">
        <a href="/" class="nav-brand">Music<i>Angel</i></a>
        <a href="/#bands" class="nav-back">&larr; All Bands</a>
    </nav>
    <div class="wrap">
        <nav class="crumb" aria-label="Breadcrumb">
            <a href="/">MusicAngel</a><span class="sep">/</span><a href="/#bands">Wedding Bands</a><span class="sep">/</span><span>${esc(c.name)}</span>
        </nav>
        <header class="hero">
            <p class="eye">${esc(c.province)} · Ireland</p>
            <h1>Wedding bands in <em>${esc(c.name)}</em></h1>
            <p class="sub">Four live wedding bands serving Co. ${esc(c.name)}</p>
            <p class="lede">${esc(c.intro)}</p>
            <div class="ctas">
                <a href="#enquiry" class="btn btn-pink">Check Availability <svg viewBox="0 0 24 24"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg></a>
                <a href="#picks" class="btn btn-ghost">See MusicAngel Bands</a>
            </div>
        </header>
    </div>

    <section id="picks">
        <div class="wrap">
            <p class="sec-eye">MusicAngel bands</p>
            <h2 class="sec-h2">Explore bands for <em>${esc(c.name)}</em> weddings</h2>
            <div class="detail">
                <p>For County ${esc(c.name)}, share your venue type, guest count, access details and finish time so availability and package details can be checked clearly.</p>
            </div>
            <div class="picks">
${picksHtml}
            </div>
        </div>
    </section>

    <section>
        <div class="wrap">
            <p class="sec-eye">Booking advice</p>
            <h2 class="sec-h2">How to book a wedding band in <em>${esc(c.name)}</em></h2>
            <div class="detail">
                <p>Peak summer Saturdays in ${esc(c.name)} should be checked 12-18 months ahead, especially if you are using one of the better-known venues below. Midweek, Sunday, and winter dates usually have more flexibility and can sometimes open up better package options.</p>
                <ul>
                    <li>Send the wedding date, venue, expected guest count, and whether you need ceremony or drinks-reception music.</li>
                    <li>Ask whether travel, PA, lighting, DJ-style music after the band, and a first dance song are included.</li>
                    <li>Confirm whether the band is 100% live or using backing tracks. All MusicAngel bands play live.</li>
                    <li>Compare quotes against the actual package, not just the headline price.</li>
                </ul>
            </div>
        </div>
    </section>

    <section>
        <div class="wrap">
            <p class="sec-eye">Where in ${esc(c.name)}</p>
            <h2 class="sec-h2">Top wedding venues in <em>${esc(c.name)}</em></h2>
            <p style="color: var(--text-muted); font-family: var(--serif); font-style: italic; font-size: 1.05rem;">A selection of well-known wedding venues across the county. We play across all of Ireland, including yours.</p>
            <ul class="venues-list">
${venuesList}
            </ul>
        </div>
    </section>

    <div class="price-band">
        <div class="wrap">
            <div class="price-band-inner">
                <h2>Packages from <strong>€2450</strong></h2>
                <p>Final quote depends on date, location within ${esc(c.name)}, package and any ceremony or drinks-reception add-ons.</p>
                <a href="#enquiry" class="btn btn-pink">Get a Quote <svg viewBox="0 0 24 24"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg></a>
            </div>
        </div>
    </div>

    ${bandsFaqSection(faq)}

    ${authorityLinksSection({
        title: `Plan your <em>County ${esc(c.name)}</em> wedding music`,
        intro: `Compare MusicAngel bands, understand live-band pricing, and browse venue-specific wedding band pages before you enquire for a ${c.name} date.`
    })}

    ${enquirySection({ heading: `Enquire about a wedding band in <em>${esc(c.name)}</em>` })}

    ${sharedFooter}
`;
}

function regenerateSitemap() {
    const today = new Date().toISOString().split('T')[0];
    const urls = [
        { loc: pageUrl(''), priority: '1.0', changefreq: 'weekly' },
        { loc: pageUrl('the-beat-boutique'), priority: '0.9', changefreq: 'monthly' },
        { loc: pageUrl('sway-social'), priority: '0.9', changefreq: 'monthly' },
        { loc: pageUrl('the-best-men'), priority: '0.9', changefreq: 'monthly' },
        { loc: pageUrl('blacktye'), priority: '0.9', changefreq: 'monthly' },
        { loc: pageUrl('wedding-band-cost-ireland'), priority: '0.85', changefreq: 'monthly' },
        { loc: pageUrl('check-availability'), priority: '0.9', changefreq: 'monthly' },
        { loc: pageUrl('first-dance-songs'), priority: '0.8', changefreq: 'monthly' },
        { loc: pageUrl('wedding-band-showcases'), priority: '0.8', changefreq: 'monthly' },
        { loc: pageUrl('drinks-reception-music'), priority: '0.7', changefreq: 'monthly' },
        { loc: pageUrl('wedding-band-and-dj-package'), priority: '0.7', changefreq: 'monthly' },
        { loc: pageUrl('compare-bands'), priority: '0.9', changefreq: 'monthly' },
        { loc: pageUrl('ceremony-music'), priority: '0.75', changefreq: 'monthly' },
        { loc: pageUrl('wedding-songs-by-decade'), priority: '0.7', changefreq: 'monthly' },
        { loc: pageUrl('wedding-band-vs-dj'), priority: '0.85', changefreq: 'monthly' },
        { loc: pageUrl('wedding-music-timeline'), priority: '0.75', changefreq: 'monthly' },
        { loc: pageUrl('when-to-book-wedding-band'), priority: '0.7', changefreq: 'monthly' },
        { loc: pageUrl('questions-to-ask-wedding-band'), priority: '0.7', changefreq: 'monthly' },
        { loc: pageUrl('about'), priority: '0.6', changefreq: 'monthly' },
        { loc: pageUrl('song-list'), priority: '0.75', changefreq: 'monthly' },
        { loc: pageUrl('corporate-events'), priority: '0.7', changefreq: 'monthly' },
        { loc: pageUrl('venues'), priority: '0.65', changefreq: 'weekly' },
        ...VENUES.map(v => ({ loc: pageUrl(`wedding-band-${v.slug}`), priority: '0.8', changefreq: 'monthly' })),
        ...COUNTIES.map(c => ({ loc: pageUrl(`wedding-bands-${c.slug}`), priority: '0.7', changefreq: 'monthly' })),
        { loc: pageUrl('privacy'), priority: '0.2', changefreq: 'yearly' },
        { loc: pageUrl('cookies'), priority: '0.2', changefreq: 'yearly' }
    ];

    const body = urls.map(u => `    <url>
        <loc>${u.loc}</loc>
        <lastmod>${today}</lastmod>
        <changefreq>${u.changefreq}</changefreq>
        <priority>${u.priority}</priority>
    </url>`).join('\n');

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${body}
</urlset>
`;
    fs.writeFileSync(path.join(ROOT, 'sitemap.xml'), xml);
}

function renderVenuesIndex() {
    const canonical = pageUrl('venues');
    const byCounty = {};
    for (const v of VENUES) {
        (byCounty[v.county] = byCounty[v.county] || []).push(v);
    }
    const counties = Object.keys(byCounty).sort();
    const countyBlocks = counties.map(c => {
        const items = byCounty[c]
            .sort((a, b) => a.name.localeCompare(b.name))
            .map(v => `                <li><a href="/wedding-band-${v.slug}/"><strong>${esc(v.name)}</strong><span> &middot; ${esc(v.town)}, Co. ${esc(v.county)}</span></a></li>`)
            .join('\n');
        return `        <section class="county-block">
            <h2 class="county-h"><em>Co. ${esc(c)}</em></h2>
            <ul class="venue-list">
${items}
            </ul>
        </section>`;
    }).join('\n');
    const countyLinks = COUNTIES
        .slice()
        .sort((a, b) => a.name.localeCompare(b.name))
        .map(c => `                <li><a href="/wedding-bands-${c.slug}/"><strong>Wedding bands in ${esc(c.name)}</strong><span>County guide</span></a></li>`)
        .join('\n');

    const jsonLd = {
        "@context": "https://schema.org",
        "@graph": [
            { "@type": "CollectionPage", "name": "Irish Wedding Venues | MusicAngel", "url": canonical, "description": "Directory of every Irish wedding venue MusicAngel has bespoke pages for, grouped by county." },
            { "@type": "BreadcrumbList", "itemListElement": [
                { "@type": "ListItem", "position": 1, "name": "MusicAngel", "item": pageUrl('') },
                { "@type": "ListItem", "position": 2, "name": "Venues", "item": canonical }
            ]},
            { "@type": "ItemList", "itemListElement": VENUES.map((v, i) => ({
                "@type": "ListItem", "position": i + 1,
                "item": { "@type": "Place", "name": v.name, "url": pageUrl(`wedding-band-${v.slug}`) }
            }))}
        ]
    };

    return `${sharedHead({
        title: 'Irish Wedding Venues Directory | MusicAngel',
        description: `Every Irish wedding venue we have a dedicated page for, ${VENUES.length} venues across Ireland, grouped by county. Find the right wedding band for your venue.`,
        canonical,
        ogImage: `${SITE}/assets/bands/hero-beat-boutique.webp`,
        ogImageW: 1400,
        ogImageH: 788,
        jsonLd
    })}
<body>
    <nav class="top">
        <a href="/" class="nav-brand">Music<i>Angel</i></a>
        <a href="/#bands" class="nav-back">&larr; All Bands</a>
    </nav>
    <div class="wrap" style="max-width: 1000px;">
        <nav class="crumb" aria-label="Breadcrumb">
            <a href="/">MusicAngel</a><span class="sep">/</span><span>Wedding Venues Directory</span>
        </nav>
        <header class="hero" style="padding: 1rem 0 2rem;">
            <p class="eye">All venues · Ireland</p>
            <h1>Irish wedding <em>venues</em> we cover</h1>
            <p class="lede" style="font-size: 1.05rem; color: var(--text-muted); font-family: var(--serif); font-style: italic;">${VENUES.length} destination wedding venues across Ireland, each with a dedicated page, MusicAngel band profiles, and a tailored enquiry form. Grouped by county.</p>
        </header>

        <style>
            .county-block { margin-bottom: 3rem; }
            .county-h { font-family: var(--serif); font-size: 1.6rem; color: var(--ink); font-weight: 400; margin-bottom: 1.25rem; padding-bottom: 0.6rem; border-bottom: 1px solid var(--border); }
            .county-h em { font-style: italic; color: var(--pink); font-weight: 500; }
            .venue-list { list-style: none; padding: 0; display: grid; grid-template-columns: repeat(auto-fit, minmax(18rem, 1fr)); gap: 0.5rem; }
            .venue-list li a { display: block; padding: 0.85rem 1.05rem; background: #fff; border: 1px solid var(--border); border-radius: 10px; text-decoration: none; color: inherit; transition: border-color 0.18s, transform 0.18s; }
            .venue-list li a:hover { border-color: var(--pink); transform: translateY(-1px); }
            .venue-list li a strong { display: block; font-family: var(--serif); font-weight: 500; color: var(--ink); font-size: 1.08rem; line-height: 1.2; }
            .venue-list li a span { font-size: 0.78rem; color: var(--text-muted); letter-spacing: 0.01em; }
        </style>

        <section class="county-block">
            <h2 class="county-h"><em>Browse wedding bands by county</em></h2>
            <ul class="venue-list">
${countyLinks}
            </ul>
        </section>

${countyBlocks}
    </div>

    ${enquirySection({
        heading: 'Check MusicAngel availability for <em>your venue</em>',
        context: 'venue'
    })}

    <div class="price-band" style="background: rgba(247, 214, 228, 0.28); padding: 3rem 0; border-top: 1px solid var(--border); border-bottom: 1px solid var(--border); margin: 3rem 0 2rem;">
        <div class="wrap" style="text-align: center;">
            <h2 style="font-family: var(--serif); font-size: clamp(1.7rem, 3vw, 2.2rem); font-weight: 400; color: var(--ink); margin-bottom: 0.5rem;">Don't see your venue? <em style="font-style: italic; color: var(--pink);">We play everywhere.</em></h2>
            <p style="color: var(--text-muted); font-family: var(--serif); font-style: italic; font-size: 1rem; margin-bottom: 1.4rem;">These are venues with bespoke pages. We play all of Ireland, so send any venue when you enquire.</p>
            <a href="#enquiry" class="btn btn-pink">Check Availability <svg viewBox="0 0 24 24" width="14" height="14" stroke="currentColor" stroke-width="2" fill="none"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg></a>
        </div>
    </div>

    ${sharedFooter}
`;
}

function main() {
    let venueCount = 0, countyCount = 0;
    fs.mkdirSync(path.join(ROOT, 'venues'), { recursive: true });
    fs.writeFileSync(path.join(ROOT, 'venues/index.html'), renderVenuesIndex());
    for (const v of VENUES) {
        const dir = path.join(ROOT, `wedding-band-${v.slug}`);
        fs.mkdirSync(dir, { recursive: true });
        fs.writeFileSync(path.join(dir, 'index.html'), renderVenue(v));
        venueCount++;
    }
    for (const c of COUNTIES) {
        const dir = path.join(ROOT, `wedding-bands-${c.slug}`);
        fs.mkdirSync(dir, { recursive: true });
        fs.writeFileSync(path.join(dir, 'index.html'), renderCounty(c));
        countyCount++;
    }
    regenerateSitemap();
    console.log(`Generated ${venueCount} venue pages, ${countyCount} county pages, sitemap.xml`);
}

main();
