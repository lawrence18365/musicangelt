#!/usr/bin/env node

/*
 * Validate that paid-click URLs polluted with a literal or encoded {ignore}
 * path segment redirect to the clean page while preserving attribution query
 * parameters. This is intentionally dependency-free so it can run from a clean
 * checkout with the Node runtime already used by the repo checks.
 */

const base = (process.argv[2] || 'https://musicangel.ie').replace(/\/+$/, '');
const query = 'utm_source=google&utm_medium=cpc&utm_campaign=validate_ignore&utm_term=wedding%20bands&gclid=TEST_IGNORE_REDIRECT';

const cases = [
    ['/{ignore}', '/'],
    ['/%7Bignore%7D', '/'],
    ['/wedding-bands-cork/{ignore}', '/wedding-bands-cork/'],
    ['/wedding-bands-cork/%7Bignore%7D', '/wedding-bands-cork/'],
    ['/compare-bands/{ignore}', '/compare-bands/'],
    ['/compare-bands/%7Bignore%7D', '/compare-bands/'],
    ['/the-beat-boutique/{ignore}', '/the-beat-boutique/'],
    ['/the-beat-boutique/%7Bignore%7D', '/the-beat-boutique/'],
    ['/sway-social/{ignore}', '/sway-social/'],
    ['/the-best-men/{ignore}', '/the-best-men/'],
    ['/blacktye/{ignore}', '/blacktye/'],
    ['/wedding-band-cost-ireland/{ignore}', '/wedding-band-cost-ireland/'],
    ['/wedding-band-and-dj-package/{ignore}', '/wedding-band-and-dj-package/']
];

function assert(condition, message) {
    if (!condition) throw new Error(message);
}

async function checkRedirect([dirtyPath, cleanPath]) {
    const dirtyUrl = `${base}${dirtyPath}?${query}`;
    const response = await fetch(dirtyUrl, { redirect: 'manual' });
    const location = response.headers.get('location') || '';

    assert(
        response.status >= 300 && response.status < 400,
        `${dirtyPath} expected redirect, got HTTP ${response.status}`
    );
    assert(location, `${dirtyPath} did not return a Location header`);

    const redirected = new URL(location);
    assert(
        redirected.pathname === cleanPath,
        `${dirtyPath} redirected to ${redirected.pathname}, expected ${cleanPath}`
    );
    for (const [key, value] of new URLSearchParams(query)) {
        assert(
            redirected.searchParams.get(key) === value,
            `${dirtyPath} did not preserve ${key}`
        );
    }

    const finalResponse = await fetch(location, { redirect: 'manual' });
    assert(
        finalResponse.status === 200,
        `${dirtyPath} final clean URL returned HTTP ${finalResponse.status}`
    );

    return { dirtyPath, cleanPath, status: response.status, location };
}

async function main() {
    const results = [];
    for (const testCase of cases) {
        results.push(await checkRedirect(testCase));
    }

    console.log(`Validated ${results.length} {ignore} redirect cases against ${base}`);
    for (const result of results) {
        console.log(`${result.status} ${result.dirtyPath} -> ${result.location}`);
    }
}

main().catch((error) => {
    console.error(error.message);
    process.exit(1);
});
