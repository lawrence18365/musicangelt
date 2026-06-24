// Cloudflare Pages middleware for SEO-only legacy URL handling.
// Keep unrelated historical URLs out of Google's index and consolidate
// old portfolio/location paths into current commercial pages.

const GONE_PATHS = new Set([
    '/difference-between-appointment-letters-and-employment-contracts',
    '/difference-between-appointment-letters-and-employment-contracts/',
    '/agreements-6',
    '/agreements-6/',
    '/contract-vs-permanent-salary-calculator-ireland-are-contractions-in-the-top-of-your-stomach',
    '/contract-vs-permanent-salary-calculator-ireland-are-contractions-in-the-top-of-your-stomach/',
    '/hot-agreement-meaning-and-the-importance-of-progress-payment-in-a-contract',
    '/hot-agreement-meaning-and-the-importance-of-progress-payment-in-a-contract/',
    '/unique-title-important-agreements-and-contracts-you-must-know-about',
    '/unique-title-important-agreements-and-contracts-you-must-know-about/',
    '/unique-title-exploring-various-agreement-clauses-in-contract-law',
    '/unique-title-exploring-various-agreement-clauses-in-contract-law/',
    '/the-general-agreement-among-the-citizenry-on-an-issue-is-called',
    '/the-general-agreement-among-the-citizenry-on-an-issue-is-called/',
    '/the-structure-of-the-agreement-can-vary-depending-on-the-purpose',
    '/the-structure-of-the-agreement-can-vary-depending-on-the-purpose/',
    '/this-obligation-shall-survive-the-termination-of-this-agreement-for-any-reason',
    '/this-obligation-shall-survive-the-termination-of-this-agreement-for-any-reason/',
    '/exploring-free-trade-agreement-taxes-and-other-legal-agreements',
    '/exploring-free-trade-agreement-taxes-and-other-legal-agreements/',
    '/mapping-the-universe-of-international-investment-agreements-and-other-agreements',
    '/mapping-the-universe-of-international-investment-agreements-and-other-agreements/',
    '/unique-title-exploring-various-agreements-and-contracts-3',
    '/unique-title-exploring-various-agreements-and-contracts-3/',
    '/blog',
    '/blog/',
    '/news',
    '/news/',
    '/index.php',
    '/index.php/',
    '/wp-admin',
    '/wp-admin/',
    '/wp-login.php',
    '/wp-login.php/',
    '/the-trophy-cabinet/press-praise/If a wedding reception begins with a ukulele band, you know it’s going to a good day.'
]);

const GONE_PREFIXES = [
    '/blog/',
    '/news/',
    '/wp-admin/'
];

const REDIRECTS = new Map([
    ['/my-booking', '/#contact'],
    ['/my-booking/', '/#contact'],
    ['/meet-the-team', '/about/'],
    ['/meet-the-team/', '/about/'],
    ['/aboutmusicangel', '/about/'],
    ['/aboutmusicangel/', '/about/'],
    ['/portfolio/jakerandco', '/compare-bands/'],
    ['/portfolio/jakerandco/', '/compare-bands/'],
    ['/portfolio/black-tye', '/blacktye/'],
    ['/portfolio/black-tye/', '/blacktye/'],
    ['/portfolio/sway-social', '/sway-social/'],
    ['/portfolio/sway-social/', '/sway-social/'],
    ['/portfolio/laura-hand', '/compare-bands/'],
    ['/portfolio/laura-hand/', '/compare-bands/'],
    ['/portfolio/margot-daly', '/compare-bands/'],
    ['/portfolio/margot-daly/', '/compare-bands/'],
    ['/portfolio/stella-bass', '/compare-bands/'],
    ['/portfolio/stella-bass/', '/compare-bands/'],
    ['/wedding-bands-dublin', '/wedding-bands-dublin/']
]);

const PRIVATE_PREFIXES = [
    '/.github/',
    '/.git/',
    '/.playwright-cli/',
    '/.vercel/',
    '/.wrangler/',
    '/data/',
    '/functions/',
    '/google-ads/',
    '/reports/',
    '/scripts/'
];

const PRIVATE_FILES = new Set([
    '/.env.example',
    '/.github',
    '/.git',
    '/.playwright-cli',
    '/.vercel',
    '/.wrangler',
    '/_headers',
    '/_redirects',
    '/ADS_PLAN.md',
    '/DEPLOYMENT.md',
    '/KEYWORDS.md',
    '/OUTREACH.md',
    '/OUTREACH_DRAFTS.md',
    '/api/enquiry.js',
    '/data',
    '/functions',
    '/google-ads',
    '/reports',
    '/scripts',
    '/vercel.json'
]);

function html(body, status, headers = {}) {
    return new Response(body, {
        status,
        headers: {
            'Content-Type': 'text/html; charset=utf-8',
            ...headers
        }
    });
}

export async function onRequest(context) {
    const url = new URL(context.request.url);
    const path = url.pathname;

    if (url.hostname === 'www.musicangel.ie') {
        url.hostname = 'musicangel.ie';
        url.protocol = 'https:';
        return Response.redirect(url.toString(), 301);
    }

    if (path.includes('/{ignore}') || path.toLowerCase().includes('/%7bignore%7d')) {
        const cleanPath = path
            .replace(/\/(?:\{ignore\}|%7[Bb]ignore%7[Dd])(?=\/|$)/g, '')
            || '/';
        const destination = new URL(context.request.url);
        destination.pathname = cleanPath.endsWith('/') || cleanPath.includes('.') ? cleanPath : `${cleanPath}/`;
        return Response.redirect(destination, 302);
    }

    if (PRIVATE_FILES.has(path) || PRIVATE_PREFIXES.some((prefix) => path.startsWith(prefix))) {
        return html(`<!doctype html>
<html lang="en">
<head>
    <meta charset="utf-8">
    <meta name="robots" content="noindex, noarchive">
    <title>Not found | MusicAngel</title>
</head>
<body>
    <main>
        <h1>Not found</h1>
        <p>The page you requested was not found.</p>
    </main>
</body>
</html>`, 404, {
            'Cache-Control': 'public, max-age=3600',
            'X-Robots-Tag': 'noindex, noarchive'
        });
    }

    if (
        GONE_PATHS.has(path)
        || GONE_PREFIXES.some((prefix) => path.startsWith(prefix))
        || path.startsWith('/the-trophy-cabinet/press-praise/')
    ) {
        return html(`<!doctype html>
<html lang="en">
<head>
    <meta charset="utf-8">
    <meta name="robots" content="noindex, noarchive, follow">
    <title>Gone | MusicAngel</title>
</head>
<body>
    <main>
        <h1>Gone</h1>
        <p>This historical page is no longer part of MusicAngel.</p>
        <p><a href="/">Go to MusicAngel</a></p>
    </main>
</body>
</html>`, 410, {
            'Cache-Control': 'public, max-age=3600',
            'X-Robots-Tag': 'noindex, noarchive'
        });
    }

    const destination = REDIRECTS.get(path);
    if (destination) {
        return Response.redirect(new URL(destination, url.origin), 301);
    }

    return context.next();
}
