#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const OUT = path.join(ROOT, 'google-ads');
const SITE = 'https://musicangel.ie';
const ACCOUNT_FINAL_URL_SUFFIX = 'utm_source=google&utm_medium=cpc&utm_campaign={campaignid}&utm_adgroup={adgroupid}&utm_content={creative}&utm_term={keyword}&utm_matchtype={matchtype}&utm_network={network}';

const venues = JSON.parse(fs.readFileSync(path.join(ROOT, 'data/venues.json'), 'utf8'));
const counties = JSON.parse(fs.readFileSync(path.join(ROOT, 'data/counties.json'), 'utf8'));

const campaigns = [
    {
        name: 'Search - Brand & Bands',
        budget: '5.00',
        status: 'Paused',
        notes: 'Enable first. Protects MusicAngel and owned band-name searches.'
    },
    {
        name: 'Search - Wedding Bands Ireland',
        budget: '5.00',
        status: 'Paused',
        notes: 'Main commercial search campaign. Launch only after lead conversion is verified.'
    },
    {
        name: 'Search - Venue Wedding Bands',
        budget: '5.00',
        status: 'Paused',
        notes: 'High-intent long-tail venue queries. Keep exact/phrase match only.'
    },
    {
        name: 'Search - County Wedding Bands',
        budget: '5.00',
        status: 'Paused',
        notes: 'Turn on after commercial campaign has conversion signal.'
    },
    {
        name: 'Search - Wedding Music Guides',
        budget: '5.00',
        status: 'Paused',
        notes: 'Lower-intent content assists. Keep paused until lead volume is healthy.'
    }
];

const NEGATIVE_LIST_NAME = 'MusicAngel Core Exclusions';
const negativeKeywordEntries = [
    ...[
        'free', 'cheap', 'diy', 'youtube', 'lyrics', 'tabs', 'chords', 'karaoke', 'tribute',
        'school', 'student', 'amateur', 'audition', 'join the band', 'guitar lesson', 'sheet music',
        'download', 'spotify', 'jobs', 'vacancy', 'busker', 'playlist', 'mp3', 'instrumental only',
        'ring', 'wedding ring', 'jewellery', 'jewelry'
    ].map(keyword => ({ keyword, listMatchType: 'Broad Match' })),
    ...[
        'waxies', 'the waxies', 'harlequin', 'buachaills', 'the buachaills',
        'perfect day wedding band', 'perfect day band', 'ian hendricks',
        'panic animal', 'old moderns', 'pat fitz', 'twist of fate',
        'the stars band', 'rockhill ramblers', 'entourage wedding band',
        'entourage band', 'rejig wedding band', 'rejig band', 'catch 22 band',
        'catch 22 wedding band', 'switch band', 'nightfall band',
        'blue moose wedding band', 'blue moose band', 'hell for leather band',
        'slipstream band', 'green means go wedding band', 'green means go band',
        'the essentials band', 'the strobes band', 'late night radio band',
        'late night radio wedding band', 'the cazettes band', 'red alert wedding band',
        'red alert band', 'after dark band', 'superfly band', 'up to 90 band',
        'bog the donkey', 'pyramid band', 'southbound wedding band', 'southbound band',
        'divine invention band', 'j90 band', 'last call band', 'mass band',
        'men in black wedding band', 'michael o neill wedding dj', 'mixtape band',
        'spring break wedding band', 'suzie q waterford', 'the cufflinks wedding band',
        'the event band', 'the gallivanters wedding band', 'the wilful band'
    ].map(keyword => ({ keyword, listMatchType: 'Phrase Match' }))
];

const adGroups = [];
const keywords = [];
const ads = [];
const landingPageMap = [];

function url(slug) {
    return `${SITE}/${slug ? `${slug}/` : ''}`;
}

function csvEscape(value) {
    const str = value == null ? '' : String(value);
    if (/[",\n]/.test(str)) return `"${str.replace(/"/g, '""')}"`;
    return str;
}

function writeCsv(file, rows, headers) {
    const body = [
        headers.join(','),
        ...rows.map(row => headers.map(header => csvEscape(row[header])).join(','))
    ].join('\n') + '\n';
    fs.writeFileSync(path.join(OUT, file), body);
}

function ensureLen(kind, text, max, context) {
    if (text && text.length > max) {
        throw new Error(`${kind} too long (${text.length}/${max}) in ${context}: ${text}`);
    }
}

function cleanHeadlines(items, context) {
    const seen = new Set();
    const out = [];
    for (const item of items) {
        const text = String(item || '').replace(/\s+/g, ' ').trim();
        if (!text || seen.has(text)) continue;
        ensureLen('Headline', text, 30, context);
        seen.add(text);
        out.push(text);
    }
    if (out.length < 3) throw new Error(`Need at least 3 headlines for ${context}`);
    return out.slice(0, 15);
}

function cleanDescriptions(items, context) {
    const seen = new Set();
    const out = [];
    for (const item of items) {
        const text = String(item || '').replace(/\s+/g, ' ').trim();
        if (!text || seen.has(text)) continue;
        ensureLen('Description', text, 90, context);
        seen.add(text);
        out.push(text);
    }
    if (out.length < 2) throw new Error(`Need at least 2 descriptions for ${context}`);
    return out.slice(0, 4);
}

function addAdGroup({ campaign, adGroup, finalUrl, maxCpc = '1.80', status = 'Paused', notes = '' }) {
    adGroups.push({
        Campaign: campaign,
        'Ad group': adGroup,
        Status: status,
        'Max CPC': maxCpc
    });
    landingPageMap.push({
        Campaign: campaign,
        'Ad group': adGroup,
        'Final URL': finalUrl,
        Notes: notes
    });
}

function addKeyword(campaign, adGroup, keyword, matchType, finalUrl, maxCpc = '1.80') {
    keywords.push({
        Campaign: campaign,
        'Ad group': adGroup,
        Keyword: keyword,
        'Match type': matchType,
        Status: 'Paused',
        'Final URL': finalUrl,
        'Max CPC': maxCpc
    });
}

function addKeywords(campaign, adGroup, terms, finalUrl, maxCpc = '1.80', matchTypes = ['Exact', 'Phrase']) {
    for (const term of terms) {
        for (const matchType of matchTypes) {
            addKeyword(campaign, adGroup, term, matchType, finalUrl, maxCpc);
        }
    }
}

function addResponsiveAd({ campaign, adGroup, finalUrl, path1 = '', path2 = '', headlines, descriptions }) {
    ensureLen('Path 1', path1, 15, adGroup);
    ensureLen('Path 2', path2, 15, adGroup);
    const hs = cleanHeadlines(headlines, adGroup);
    const ds = cleanDescriptions(descriptions, adGroup);
    const row = {
        Campaign: campaign,
        'Ad group': adGroup,
        'Ad type': 'Responsive search ad',
        Status: 'Paused',
        'Final URL': finalUrl,
        'Final URL suffix': '',
        'Path 1': path1,
        'Path 2': path2
    };
    for (let i = 1; i <= 15; i += 1) row[`Headline ${i}`] = hs[i - 1] || '';
    for (let i = 1; i <= 4; i += 1) row[`Description ${i}`] = ds[i - 1] || '';
    ads.push(row);
}

function addSearchGroup({ campaign, adGroup, finalUrl, terms, path1, path2, headlines, descriptions, maxCpc, notes, matchTypes }) {
    addAdGroup({ campaign, adGroup, finalUrl, maxCpc, notes });
    addKeywords(campaign, adGroup, terms, finalUrl, maxCpc, matchTypes);
    addResponsiveAd({ campaign, adGroup, finalUrl, path1, path2, headlines, descriptions });
}

addSearchGroup({
    campaign: 'Search - Brand & Bands',
    adGroup: 'MusicAngel brand',
    finalUrl: url(''),
    path1: 'wedding',
    path2: 'bands',
    maxCpc: '0.80',
    terms: ['musicangel', 'music angel ireland', 'music angel wedding', 'musicangel wedding bands'],
    headlines: [
        'MusicAngel Wedding Bands', 'Four Live Bands Ireland', 'Wedding Bands From 2450',
        'Check Your Wedding Date', '100 Percent Live Music', 'No Backing Tracks',
        'Compare Four Bands', 'Same Day Reply', 'Live Bands Across Ireland'
    ],
    descriptions: [
        'Compare four live Irish wedding bands in one place. Packages from 2450. Check your date.',
        '100 percent live music, no backing tracks, with a clear quote from Jo within one day.',
        'The Beat Boutique, Sway Social, The Best Men and Blacktye. One enquiry, four bands.'
    ],
    notes: 'Owned brand demand.'
});

addSearchGroup({
    campaign: 'Search - Brand & Bands',
    adGroup: 'Band names',
    finalUrl: url('compare-bands'),
    path1: 'compare',
    path2: 'bands',
    maxCpc: '0.90',
    terms: [
        'the beat boutique wedding band', 'beat boutique band', 'sway social wedding band',
        'the best men wedding band', 'blacktye wedding band', 'blacktye band'
    ],
    headlines: [
        'Compare MusicAngel Bands', 'The Beat Boutique', 'Sway Social Weddings',
        'Blacktye Wedding Band', 'The Best Men Band', 'Check Your Date',
        'Four Bands One Enquiry', 'Ireland Wedding Music'
    ],
    descriptions: [
        'Compare style, line-up, pricing and packages across MusicAngel live wedding bands.',
        'Ask Jo which bands are available for your date and venue. Reply within one working day.'
    ],
    notes: 'Owned band-name demand.'
});

addSearchGroup({
    campaign: 'Search - Wedding Bands Ireland',
    adGroup: 'Wedding bands Ireland',
    finalUrl: url(''),
    path1: 'wedding',
    path2: 'bands',
    maxCpc: '2.20',
    matchTypes: ['Exact'],
    terms: ['wedding band ireland', 'wedding bands ireland', 'live wedding band ireland', 'irish wedding bands', 'best wedding bands ireland'],
    headlines: [
        'Wedding Bands Ireland', 'Live Irish Wedding Bands', 'Four Bands From 2450',
        'Check Date Availability', '100 Percent Live Sets', 'Compare Bands Side By Side',
        'Real Wedding Party Bands', 'Ireland Wide Wedding Music', 'Quote Within One Day'
    ],
    descriptions: [
        'Four live Irish wedding bands, one clear enquiry. Packages from 2450 across Ireland.',
        'Compare styles and date availability. 100 percent live sets with no backing tracks.',
        'Send your date and venue. Jo will confirm which bands are free within one working day.'
    ],
    notes: 'Primary commercial intent.'
});

addSearchGroup({
    campaign: 'Search - Wedding Bands Ireland',
    adGroup: 'Wedding band prices',
    finalUrl: url('wedding-band-cost-ireland'),
    path1: 'pricing',
    path2: 'guide',
    maxCpc: '2.40',
    matchTypes: ['Exact'],
    terms: [
        'wedding band cost ireland', 'wedding band prices ireland', 'average wedding band cost ireland',
        'cost of wedding band ireland', 'wedding bands ireland prices', 'how much is a wedding band in ireland'
    ],
    headlines: [
        'Wedding Band Cost Ireland', '2026 Wedding Band Prices', 'Packages From 2450',
        'Clear Irish Band Pricing', 'No Hidden Fee Surprises', 'Get A Tailored Quote',
        'What Your Budget Gets', 'Compare Package Options', 'Travel Explained Upfront'
    ],
    descriptions: [
        'See what Irish wedding bands cost in 2026, what is included, and what changes the quote.',
        'MusicAngel packages start from 2450. Send date and venue for a clear tailored quote.',
        'Compare evening band, DJ, ceremony and drinks options before you enquire.'
    ],
    notes: 'Pricing intent usually converts well.'
});

addSearchGroup({
    campaign: 'Search - Wedding Bands Ireland',
    adGroup: 'Band and DJ package',
    finalUrl: url('wedding-band-and-dj-package'),
    path1: 'band-dj',
    path2: 'package',
    maxCpc: '1.80',
    matchTypes: ['Exact'],
    terms: ['wedding band and dj package', 'wedding band dj package ireland', 'band and dj wedding package', 'wedding band with dj'],
    headlines: [
        'Wedding Band And DJ', 'Band And DJ Package', 'One Team For The Night',
        'Live Band Then DJ', 'Packages From 2450', 'Check Date Availability',
        'Ireland Wedding Music', 'Clear Quote From Jo'
    ],
    descriptions: [
        'Compare live band and DJ-style evening packages for Irish weddings. Ask about your date.',
        'One enquiry covers band availability, timings, travel and DJ music after the live sets.'
    ],
    notes: 'Package-specific demand.'
});

addSearchGroup({
    campaign: 'Search - Wedding Bands Ireland',
    adGroup: 'Showcases',
    finalUrl: url('wedding-band-showcases'),
    path1: 'showcases',
    path2: 'ireland',
    maxCpc: '1.40',
    matchTypes: ['Exact'],
    terms: ['wedding band showcase ireland', 'wedding band showcase', 'wedding band showcase dublin', 'live wedding band showcase'],
    headlines: [
        'Wedding Band Showcases', 'See A Band Before Booking', 'Live Wedding Bands',
        'Check Showcase Dates', 'Four Irish Bands', 'No Backing Tracks',
        'Compare Before You Book'
    ],
    descriptions: [
        'See what to ask, what to listen for, and how MusicAngel bands handle live wedding sets.',
        'Check availability and showcase options for The Beat Boutique, Sway Social and more.'
    ],
    notes: 'Mid-funnel but commercially useful.'
});

addSearchGroup({
    campaign: 'Search - Wedding Bands Ireland',
    adGroup: 'Ceremony and drinks music',
    finalUrl: url('drinks-reception-music'),
    path1: 'drinks',
    path2: 'music',
    maxCpc: '1.40',
    matchTypes: ['Exact'],
    terms: ['drinks reception music ireland', 'wedding reception music ireland', 'ceremony music ireland', 'wedding ceremony music ireland'],
    headlines: [
        'Drinks Reception Music', 'Ceremony Music Options', 'Wedding Music Ireland',
        'Live Music For The Day', 'Band Add On Options', 'Check Your Date',
        'One Enquiry To Jo'
    ],
    descriptions: [
        'Plan ceremony, drinks reception, evening band and DJ music from one MusicAngel enquiry.',
        'Ask which bands can cover your full wedding day and what each package includes.'
    ],
    notes: 'Add-on intent; keep bids lower.'
});

for (const venue of venues) {
    const finalUrl = url(`wedding-band-${venue.slug}`);
    const adGroup = venue.name;
    const specific = [
        `Band For ${venue.name}`,
        `${venue.name} Band`,
        `${venue.name} Wedding Band`
    ].filter(h => h.length <= 30);

    addSearchGroup({
        campaign: 'Search - Venue Wedding Bands',
        adGroup,
        finalUrl,
        path1: 'venues',
        path2: venue.slug.slice(0, 15),
        maxCpc: '1.60',
        matchTypes: ['Exact'],
        terms: [
            `wedding band ${venue.name}`,
            `${venue.name} wedding band`,
            `wedding music ${venue.name}`,
            `live band ${venue.name} wedding`
        ],
        headlines: [
            ...specific,
            'Wedding Band For Venue', 'Live Band For Your Venue', 'Ireland Wedding Bands',
            'Check Your Date', 'Packages From 2450', '100 Percent Live Music',
            'Quote Within One Day'
        ],
        descriptions: [
            `Planning a ${venue.county} wedding? Check which MusicAngel bands suit your venue and date.`,
            'Four live Irish wedding bands with clear packages and no backing tracks.',
            'Send date and venue. Jo will confirm availability and next steps within one working day.'
        ],
        notes: `${venue.name}, ${venue.county}.`
    });
}

for (const county of counties) {
    const finalUrl = url(`wedding-bands-${county.slug}`);
    addSearchGroup({
        campaign: 'Search - County Wedding Bands',
        adGroup: county.name,
        finalUrl,
        path1: 'locations',
        path2: county.slug.slice(0, 15),
        maxCpc: '1.40',
        matchTypes: ['Exact'],
        terms: [
            `wedding bands ${county.name}`,
            `wedding band ${county.name}`,
            `live wedding band ${county.name}`,
            `${county.name} wedding bands`
        ],
        headlines: [
            `Wedding Bands ${county.name}`, `${county.name} Wedding Band`, 'Live Irish Wedding Bands',
            'Four Bands From 2450', 'Check Date Availability', '100 Percent Live Sets',
            'Quote Within One Day'
        ],
        descriptions: [
            `Planning a ${county.name} wedding? Compare MusicAngel bands and check date availability.`,
            'Four live Irish wedding bands across Ireland. Send your date and venue for a clear quote.',
            '100 percent live sets, no backing tracks, and practical planning from first enquiry.'
        ],
        notes: `${county.name} county page.`
    });
}

const guideGroups = [
    {
        adGroup: 'First dance songs',
        finalUrl: url('first-dance-songs'),
        terms: ['first dance songs ireland', 'wedding first dance songs', 'best first dance songs', 'irish first dance songs', 'first dance wedding songs'],
        path1: 'first-dance',
        path2: 'songs',
        headlines: ['First Dance Songs Ireland', 'Wedding First Dance Songs', '2026 Wedding Songs', 'First Dance Song Ideas', 'Live Band Song Advice', 'We Learn Your First Dance', 'Check Band Availability'],
        descriptions: [
            'Browse first dance ideas, then check which MusicAngel bands are free for your date.',
            'MusicAngel bands can learn one new song for your wedding. Ask about your date and venue.'
        ],
        notes: 'Lower-intent content assist.'
    },
    {
        adGroup: 'Wedding music timeline',
        finalUrl: url('wedding-music-timeline'),
        terms: ['wedding music timeline', 'wedding day music timeline', 'wedding music planning', 'when does wedding band start'],
        path1: 'timeline',
        path2: 'music',
        headlines: ['Wedding Music Timeline', 'Plan Your Wedding Music', 'Ceremony To Late Night', 'Live Band Timing Advice', 'Check Band Availability', 'Ireland Wedding Music'],
        descriptions: [
            'Plan ceremony, drinks, band and DJ timings before checking MusicAngel availability.',
            'Get practical timing advice and ask Jo which bands are free for your date and venue.'
        ],
        notes: 'Planning query.'
    },
    {
        adGroup: 'Questions to ask a band',
        finalUrl: url('questions-to-ask-wedding-band'),
        terms: ['questions to ask wedding band', 'what to ask wedding band', 'wedding band questions', 'questions before booking wedding band'],
        path1: 'questions',
        path2: 'bands',
        headlines: ['Questions To Ask A Band', 'Before You Book A Band', 'Wedding Band Checklist', 'Ask About Live Music', 'Check Date Availability', 'No Backing Tracks'],
        descriptions: [
            'Use the checklist before booking any wedding band, then check MusicAngel availability.',
            'Ask about live performance, pricing, timings, insurance, requests and backup plans.'
        ],
        notes: 'Research query.'
    },
    {
        adGroup: 'When to book band',
        finalUrl: url('when-to-book-wedding-band'),
        terms: ['when to book wedding band', 'how early to book wedding band', 'when should i book wedding band', 'book wedding band ireland'],
        path1: 'booking',
        path2: 'timeline',
        headlines: ['When To Book A Band', 'Book Your Wedding Band', 'Check Your Wedding Date', 'Peak Dates Go Quickly', 'Ireland Wedding Bands', 'Quote Within One Day'],
        descriptions: [
            'Peak Irish wedding dates book early. Check which MusicAngel bands are free for your date.',
            'Get practical booking timing advice and a clear reply from Jo within one working day.'
        ],
        notes: 'Early commercial/planning query.'
    }
];

for (const group of guideGroups) {
    addSearchGroup({
        campaign: 'Search - Wedding Music Guides',
        maxCpc: '1.00',
        ...group
    });
}

const adHeaders = [
    'Campaign', 'Ad group', 'Ad type', 'Status', 'Final URL', 'Final URL suffix', 'Path 1', 'Path 2',
    ...Array.from({ length: 15 }, (_, i) => `Headline ${i + 1}`),
    ...Array.from({ length: 4 }, (_, i) => `Description ${i + 1}`)
];

fs.mkdirSync(OUT, { recursive: true });

writeCsv('01-campaigns.csv', campaigns.map(c => ({
    Campaign: c.name,
    'Campaign type': 'Search',
    Status: c.status,
    Budget: c.budget,
    'Budget type': 'Daily',
    'Bid strategy type': 'Manual CPC',
    Networks: 'Google Search',
    Languages: 'English',
    Locations: 'Ireland;Northern Ireland',
    Notes: c.notes
})), ['Campaign', 'Campaign type', 'Status', 'Budget', 'Budget type', 'Bid strategy type', 'Networks', 'Languages', 'Locations', 'Notes']);

writeCsv('02-ad-groups.csv', adGroups, ['Campaign', 'Ad group', 'Status', 'Max CPC']);
writeCsv('03-keywords.csv', keywords, ['Campaign', 'Ad group', 'Keyword', 'Match type', 'Status', 'Final URL', 'Max CPC']);
writeCsv('04-responsive-search-ads.csv', ads, adHeaders);

const negativeRows = [];
for (const campaign of campaigns) {
    for (const { keyword } of negativeKeywordEntries) {
        negativeRows.push({
            Campaign: campaign.name,
            Keyword: keyword,
            'Match type': 'Campaign negative',
            Status: 'Enabled'
        });
    }
}
writeCsv('05-campaign-negative-keywords.csv', negativeRows, ['Campaign', 'Keyword', 'Match type', 'Status']);

writeCsv('05a-negative-keyword-list.csv', negativeKeywordEntries.map(({ keyword, listMatchType }) => ({
    Action: 'Add',
    'Negative keyword list name': NEGATIVE_LIST_NAME,
    'Negative keyword': keyword,
    'Keyword or list': 'Keyword',
    'Match type': listMatchType
})), ['Action', 'Negative keyword list name', 'Negative keyword', 'Keyword or list', 'Match type']);

writeCsv('05b-negative-list-campaign-associations.csv', campaigns.map(campaign => ({
    Action: 'Add',
    'Negative keyword': NEGATIVE_LIST_NAME,
    'Keyword or list': 'List',
    Campaign: campaign.name
})), ['Action', 'Negative keyword', 'Keyword or list', 'Campaign']);

const sitelinks = [
    ['Compare Bands', 'See four MusicAngel acts', 'Choose the right live sound', url('compare-bands')],
    ['Wedding Band Cost', '2026 Irish pricing guide', 'See what affects your quote', url('wedding-band-cost-ireland')],
    ['Wedding Band Showcases', 'Know what to listen for', 'Check live showcase options', url('wedding-band-showcases')],
    ['Band And DJ Package', 'Live band plus DJ music', 'Plan the full evening', url('wedding-band-and-dj-package')],
    ['First Dance Songs', 'Ideas from live bands', 'We can learn your song', url('first-dance-songs')],
    ['Wedding Venues', 'Venue-specific band advice', 'Browse Irish venue pages', url('venues')],
    ['The Beat Boutique', 'Fixed four-piece band', 'Boutique live wedding sound', url('the-beat-boutique')],
    ['Sway Social', 'Four musicians four voices', 'Modern live party band', url('sway-social')],
    ['The Best Men', 'Feel-good live band', 'Big vocals and medleys', url('the-best-men')],
    ['Blacktye', 'Five-piece event band', 'Full-day package options', url('blacktye')]
].flatMap(([text, desc1, desc2, finalUrl]) => campaigns.slice(0, 3).map(campaign => ({
    Campaign: campaign.name,
    'Sitelink text': text,
    'Description line 1': desc1,
    'Description line 2': desc2,
    'Final URL': finalUrl,
    Status: 'Paused'
})));
writeCsv('06-sitelinks.csv', sitelinks, ['Campaign', 'Sitelink text', 'Description line 1', 'Description line 2', 'Final URL', 'Status']);

const callouts = [
    'Packages From 2450', '100 Percent Live', 'No Backing Tracks', 'Ireland Wide',
    'Same Day Reply', 'One Clear Enquiry', 'Ceremony Options', 'DJ Music Options'
].flatMap(text => campaigns.slice(0, 3).map(campaign => ({
    Campaign: campaign.name,
    'Callout text': text,
    Status: 'Paused'
})));
writeCsv('07-callouts.csv', callouts, ['Campaign', 'Callout text', 'Status']);

writeCsv('08-landing-page-map.csv', landingPageMap, ['Campaign', 'Ad group', 'Final URL', 'Notes']);

const setupMd = `# MusicAngel Google Ads Setup

Generated ${new Date().toISOString().slice(0, 10)}.

These files prepare the account for launch without enabling spend. Every campaign, ad group, keyword, ad, sitelink and callout is set to Paused. Review everything in Google Ads Editor before posting changes.

## Files

- \`01-campaigns.csv\` - paused search campaigns and starter budgets.
- \`02-ad-groups.csv\` - paused ad groups with starter max CPCs.
- \`03-keywords.csv\` - exact and phrase match keywords only.
- \`04-responsive-search-ads.csv\` - paused responsive search ads with validated length limits.
- \`05-campaign-negative-keywords.csv\` - negative keyword set repeated at campaign level.
- \`05a-negative-keyword-list.csv\` - shared negative list, including competitor/band-name exclusions seen in early search terms.
- \`05b-negative-list-campaign-associations.csv\` - shared negative list campaign associations.
- \`06-sitelinks.csv\` - campaign sitelinks.
- \`07-callouts.csv\` - campaign callouts.
- \`08-landing-page-map.csv\` - audit map for ad group to landing page.

## Required account setup

1. Create or open the Google Ads account for MusicAngel.
2. Confirm billing, business details, timezone, and currency. Use EUR.
3. Confirm auto-tagging is on.
4. Link the GA4 property that contains \`G-WV874YXC8Z\`.
5. In GA4, mark \`generate_lead\` as a key event.
6. Import \`generate_lead\` into Google Ads as the primary lead conversion.
7. Import \`contact_click\` as a secondary conversion, or create direct Google Ads click conversions and paste their labels into \`/js/google-ads-config.js\`.
8. Set account-level final URL suffix. Keep ad-level, ad-group-level, keyword-level, and sitelink-level suffixes blank unless there is a deliberate tracking reason:

\`\`\`
${ACCOUNT_FINAL_URL_SUFFIX}
\`\`\`

9. Import the CSV files into Google Ads Editor in numeric order.
10. Keep everything paused until the conversion test below passes.

## Conversion values

- Primary: \`generate_lead\`, starting value EUR250, count one, lead category. Recalculate after real close-rate data.
- Secondary: \`contact_click\`, value EUR25 to EUR50, count one, lead category.
- Diagnostic only: \`form_start\`, \`form_submit_attempt\`, \`lead_mailto_fallback\`. Do not optimize bidding to these.

## Launch sequence

1. Get explicit approval immediately before enabling spend.
2. Submit a real test enquiry from a URL containing \`?utm_source=google&utm_medium=cpc&gclid=TEST-GCLID\`.
3. Confirm the enquiry email contains campaign/ad-click fields.
4. Confirm GA4 receives \`generate_lead\`.
5. Start with selected EUR5/day campaigns only. Four enabled campaigns equals EUR20/day; all five enabled campaigns equals EUR25/day.
6. If starting at EUR20/day, keep \`Search - Wedding Music Guides\` paused first because it is lower-intent than the commercial campaigns.
7. Check search terms daily for 7 days and add negatives before raising budget.

## Verified campaign settings

- Networks: Google Search only at launch.
- Languages: English.
- Locations: Ireland and Northern Ireland, United Kingdom.
- Location option: Presence, people in or regularly in targeted locations.
- Ad rotation: Optimize.
- Bidding: Manual CPC until at least 15 primary conversions, then test Maximize Conversions.
- Daily account safety target: EUR20 to EUR25 for the first live test. Keep campaign budgets at EUR5/day each unless there is an explicit decision to redistribute within the same total.
- Budget caveat: Google Ads uses average daily budgets. Actual daily spend may vary by campaign and can exceed the average daily budget on a given day, while staying within Google's monthly spending limit rules.

## Official setup references

- GA4 key event import: https://support.google.com/google-ads/answer/9520128
- Google consent mode: https://support.google.com/google-ads/answer/10000067
- Auto-tagging: https://support.google.com/google-ads/answer/1752125
- Final URL suffix: https://support.google.com/google-ads/answer/9054021
- Google Ads Editor CSV prep: https://support.google.com/google-ads/editor/answer/56368
- Google Ads Editor CSV columns: https://support.google.com/google-ads/editor/answer/57747
- Click conversion tracking: https://support.google.com/google-ads/answer/6331304
`;
fs.writeFileSync(path.join(OUT, 'README.md'), setupMd);

console.log(`Wrote ${OUT}`);
console.log(`Campaigns: ${campaigns.length}`);
console.log(`Ad groups: ${adGroups.length}`);
console.log(`Keywords: ${keywords.length}`);
console.log(`Responsive search ads: ${ads.length}`);
console.log(`Campaign negatives: ${negativeRows.length}`);
