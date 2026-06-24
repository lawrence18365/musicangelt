# MusicAngel SEO Audit And Growth Plan - 2026-06-19

Site audited: https://musicangel.ie/

Assumption: the prompt still contained placeholder fields, so this audit treats the local repo in `/Users/lawrence/Desktop/musicangelt` and the production domain in `CNAME` as the website to audit. Competitors were selected from current commercial SERP results and public sitemap availability.

## Evidence Base

Verified directly:

- Production domain: `musicangel.ie`.
- Hosting: Cloudflare Pages project `musicangelt`, custom domains `musicangel.ie` and `www.musicangel.ie`.
- Site type: static HTML generated from repo data plus Cloudflare Pages Functions and a separate lead logger worker.
- Local HTML files: 107.
- Sitemap URLs: 105, all matched local HTML.
- Internal links: 3,040 scanned, 0 broken.
- Canonicals: 106 correct; `lead-logger/index.html` intentionally noindex and missing canonical.
- Remote robots.txt and sitemap.xml are accessible.
- Remote content is server-rendered in raw HTML; homepage and county pages expose title, H1, core copy, links, form, and schema without requiring JS.
- Fresh GSC/GA4 API access could not be pulled because both cached Google OAuth tokens returned `invalid_grant`.
- Cloudflare Pages, Workers and D1 were accessible read-only through Wrangler. WAF/firewall event logs, Bot Fight Mode, Turnstile challenges, and Cache Analytics were not inspected in-dashboard.

Key historical data used:

- 2026-05-18 GSC for `sc-domain:musicangel.ie`: 37 impressions, 2 clicks, avg position 15.0.
- 2026-05-25 baseline: 126 indexed pages, 313 not indexed, 105 sitemap discovered pages, 667 GSC impressions/28 days, 6 clicks, CTR 0.9%, position 27.4.
- 2026-05-29 GSC: 867 impressions, 5 clicks, CTR 0.6%, position 24.4.
- 2026-06-19 D1 aggregate: 15 total lead rows, 11 clean real leads, 10 clean paid leads, 1 direct/unknown, 0 spam, 0 duplicates.
- 2026-06-19 Ads report: 248 clicks, EUR 406.94 spend, 8 Ads conversions, D1 view 10 paid leads, no booked paid leads recorded yet.

Sources checked:

- MusicAngel sitemap: https://musicangel.ie/sitemap.xml
- MusicAngel robots: https://musicangel.ie/robots.txt
- WeddingBandList sitemap: https://weddingbandlist.com/sitemap.xml
- WeddingBandList Dublin page: https://weddingbandlist.com/wedding-bands-dublin
- Wedding Band Association sitemap: https://weddingbandassociation.ie/sitemap_index.xml
- Wedding Band Association availability page: https://weddingbandassociation.ie/check-bands-availability/
- Hooley sitemap: https://www.hooley.ie/wp-sitemap.xml
- Hooley Galway page: https://www.hooley.ie/counties/galway/wedding-bands/
- IrishWeddingBands sitemap: https://www.irishweddingbands.ie/sitemap_index.xml
- WeddingsOnline category page: https://www.weddingsonline.ie/suppliers/wedding-bands/
- TradWeddingBands sitemap: https://www.tradweddingbands.ie/sitemap.xml

## Phase 1: Business And SEO Objective

Likely business model:

- Curated Irish wedding entertainment platform representing four live wedding bands: The Beat Boutique, Sway Social, The Best Men, and Blacktye.
- Revenue likely comes from booking enquiries that become quoted and booked wedding/corporate dates.
- Paid search is already live, but the long-term organic engine should reduce paid dependency.

Qualified lead:

- Couple, planner, venue, or company requesting availability for a real date, venue/county, and band/package interest.
- Highest quality lead includes wedding date, venue, county, band preference, budget/package context, and valid email/phone.
- Low quality lead is generic curiosity, singer/DJ-only mismatch, jewellery/ring intent, competitor-band leakage, or no date/venue.

Closest-to-revenue pages:

- `/`
- `/the-beat-boutique/`
- `/sway-social/`
- `/the-best-men/`
- `/blacktye/`
- `/compare-bands/`
- `/wedding-band-cost-ireland/`
- `/wedding-band-and-dj-package/`
- `/wedding-bands-{county}/`
- `/wedding-band-{venue}/`

Traffic to chase:

- "wedding bands Ireland", "live wedding band Ireland", "best wedding bands Ireland".
- "wedding bands Dublin/Cork/Galway/Kerry/Limerick/Donegal".
- "wedding band cost Ireland", "wedding band prices Ireland".
- "wedding band and DJ package", "wedding band with DJ".
- "wedding band for [venue]".
- Brand/band-name searches for MusicAngel-owned bands.
- Evaluation terms: "wedding band vs DJ", "questions to ask wedding band", "wedding band showcases".

Traffic to ignore:

- Wedding rings/jewellery.
- DJ-only and sax-only terms unless paired with live-band package intent.
- Generic "first dance songs" if there is no conversion module attached.
- Old legal/contract spam URLs.
- Competitor band names unless there is a clean comparison or alternative page that is truthful and non-confusing.

Verdict:

- Strategy should be hybrid: local SEO plus directory-style programmatic SEO plus comparison/evaluation SEO. Informational SEO is useful only when it links into availability, pricing, compare, and band pages.
- The site should not try to out-directory WeddingBandList on supply volume. It should win "curated, four vetted live bands, real availability, transparent price expectations, venue fit" searches.

Pages that should make money:

- Band pages, compare page, pricing page, county pages, venue pages, and band-plus-DJ page.

Pages leaking money:

- High-intent guides without embedded forms: `/first-dance-songs/`, `/song-list/`, `/wedding-band-vs-dj/`, `/wedding-music-timeline/`, `/when-to-book-wedding-band/`, `/questions-to-ask-wedding-band/`, `/drinks-reception-music/`, `/ceremony-music/`.
- Homepage, because the H1 is brand-only ("Music Angel") instead of directly reinforcing the money term.
- Reporting layer, because landing page URLs are stored with full query strings and `_gl` parameters, fragmenting lead/page analysis.

## Phase 2: Technical SEO Audit

| Priority | Issue | Evidence | SEO Impact | Verification | Recommended Fix |
|---|---|---|---|---|---|
| P1 | `www.musicangel.ie` returns 200 instead of redirecting to apex | `https://www.musicangel.ie/` and `https://www.musicangel.ie/wedding-bands-dublin/` return 200; canonicals point to apex | Duplicate host, split crawl signals, noisy analytics | `curl -I https://www.musicangel.ie/` | Add Cloudflare Redirect Rule: `www.musicangel.ie/* -> https://musicangel.ie/$1`, 301, preserve path/query |
| P1 | Homepage H1 is not commercially descriptive | `index.html:1867` H1 text is `Music Angel`; title targets wedding bands | Weak topical clarity for the homepage money term | Fetch raw HTML or inspect rendered H1 | Change H1 to "Wedding Bands Ireland, 100% Live" or similar while keeping brand in supporting copy |
| P1 | Fresh GSC/GA4 API tokens are revoked | `scripts/weekly-report.js` fails with `invalid_grant` | Cannot run current page/query triage or detect drops accurately | Re-run weekly script after OAuth | Re-auth GSC/GA4 tokens and restore weekly reporting |
| P1 | Lead database stores full landing URLs with query strings | D1 aggregate showed page rows fragmented by `_gl`, `gclid`, and long query strings | Cannot reliably compare landing-page conversion rate | Query D1 by submitted page URL | Store normalized `landing_path`, `submitted_path`, and stripped query fields in D1 |
| P1 | High-intent guide pages often have no form | Static audit found no forms on most guides and `/venues/` | Informational traffic leaks to soft CTAs | Static audit of form counts | Add compact enquiry module to all guide and hub pages |
| P2 | Some irrelevant legacy paths 301 to homepage | `/wp-login.php` redirects to `/`; `/blog` redirects to `/` | Soft-404 risk and low-quality consolidation | `curl -I -L https://musicangel.ie/wp-login.php` | Return 410/noindex for irrelevant old/spam paths; only 301 relevant historical URLs |
| P2 | Several titles exceed 65 characters | About, compare, corporate, cost, questions, song-list, showcases, timeline | Lower CTR and truncation | Static title-length audit | Rewrite priority titles to 50-60 chars |
| P2 | Some meta descriptions are too short or over target | Cost page 65 chars, band-and-DJ 66, drinks reception 76, homepage 166 | Lost CTR opportunity | Static description audit | Rewrite descriptions to 140-160 chars |
| P2 | Live robots is modified by Cloudflare Managed Content Signals | Live robots includes Cloudflare AI crawler directives not in repo | Not harmful to Google, but repo and production differ | Fetch live robots | Document this Cloudflare setting; monitor after config changes |
| P2 | Cloudflare WAF/Bot Fight/Turnstile not audited in logs | Header checks show Googlebot not blocked; logs not inspected | If misconfigured, can suppress crawl/render | Cloudflare Dashboard: Security Events filtered by verified bot UA/IP | Verify Googlebot/Bingbot are allowed; disable challenges for verified search bots |
| P3 | `lead-logger/` has no canonical | Canonical audit flags one missing canonical | Low SEO impact because noindex/noarchive | `node scripts/audit-canonicals.js` | Optional: add canonical or keep noindex-only private tool |

What is healthy:

- Robots allows search crawling and exposes sitemap.
- Sitemap is valid and every sitemap URL maps to local HTML.
- Internal links resolve.
- Canonicals are self-referencing on SEO pages.
- Important content is in raw HTML, not JS-dependent.
- 404 and selected 410 legacy pages send noindex headers.
- Assets and JS are accessible; referenced JS paths return 200.
- Cloudflare serves HTTP/2 and HTTP/3, Brotli likely active by platform, and Early Hints emits a GTM preconnect.

Cloudflare checks still required in dashboard:

- WAF/firewall events for Googlebot, Bingbot, Google-InspectionTool.
- Bot Fight Mode / Super Bot Fight Mode challenge behavior.
- Turnstile/CAPTCHA rules by path.
- Rate limiting rules on `/`, `/sitemap.xml`, `/robots.txt`, county pages, venue pages, and `/api/enquiry`.
- Cache Analytics for HTML, JS, image assets, sitemap, robots.
- Redirect Rules/Page Rules for `www -> apex`, HTTP -> HTTPS, and old host paths.
- Workers modifying response HTML or headers.
- Country blocking affecting Ireland, UK, US, or Google/Bing crawler egress locations.

## Phase 3: Traffic Drop Investigation

No confirmed current organic traffic drop was found. The available reports show a young/newly migrated property gaining visibility:

- 2026-05-18 MusicAngel GSC: 37 impressions, 2 clicks.
- 2026-05-25 baseline: 667 impressions/28 days, 6 clicks, 126 indexed pages, 313 not indexed.
- 2026-05-29 weekly: 867 impressions, 5 clicks.

The 2026-05-15 report used `thebeatboutique.ie` as a fallback GSC property, so it should not be compared as a MusicAngel traffic drop.

Most likely issue if traffic feels down:

- Indexation and migration lag, plus old URL noise, not a verified Cloudflare crawler block.

Evidence supporting this:

- Live Googlebot fetch returns 200 on homepage.
- Sitemap and robots are accessible.
- Important content exists in raw HTML.
- Legacy spam/legal pages were visible in older GSC reports.
- GSC had 313 not-indexed pages against 126 indexed at the May 25 baseline.

Evidence against Cloudflare blocking as the primary cause:

- No 403/429 challenge observed from outside for Googlebot user agent on key pages.
- DNS and Pages project are active.
- Search allowed in live robots.

Next checks:

1. Re-auth GSC and pull 16-month clicks/impressions by date, page, query, country, and device.
2. In Cloudflare Security Events, filter for verified bots and paths `/sitemap.xml`, `/robots.txt`, `/wedding-bands-*`, `/wedding-band-*`.
3. Compare GSC crawl stats against Cloudflare request volume by day.
4. Compare deployment dates with GSC impression/click changes.
5. Inspect GSC Indexing > Pages for "Crawled - currently not indexed" by page template.

Emergency fixes if a real drop is confirmed:

- Turn off bot challenges for verified Googlebot/Bingbot.
- Force apex canonical redirect and submit sitemap again.
- Request indexing for top 20 money pages.
- Revert any recent noindex/canonical/template regression.

Long-term fixes:

- Weekly GSC/GA4/Cloudflare dashboard.
- Deployment annotation log.
- URL inspection queue for pages created or materially updated.

## Phase 4: Current Keyword And Page Performance

Fresh GSC was unavailable. Historical and sibling-query evidence indicates these buckets.

| Page | Main Queries | Current Issue | Revenue Potential | Recommended Action | Priority |
|---|---|---|---|---|---|
| `/wedding-band-cost-ireland/` | wedding band cost Ireland, wedding band prices Ireland | Near-winner historically; description short; can win snippets | High | Add pricing comparison table, package inclusions, travel/add-on examples, form CTA near table | P1 |
| `/` | wedding bands Ireland, live wedding band Ireland | H1 brand-only; broad intent | Very high | Rewrite H1 and intro around "Wedding Bands Ireland"; add fast band comparison above fold | P1 |
| `/the-best-men/` | The Best Men wedding band | Branded visibility; needs review/proof depth | High | Add real reviews, recent venues, setlist proof, availability CTA | P1 |
| `/the-beat-boutique/` | The Beat Boutique wedding band | Paid/brand lead winner; LCP historically weaker | High | Add review proof, optimize hero image/LCP, keep direct enquiry | P1 |
| `/sway-social/` | Sway Social wedding band | Paid lead source; D1 had one paid_unknown | High | Improve attribution capture and add stronger proof module | P1 |
| `/compare-bands/` | compare wedding bands, MusicAngel bands | Title too long; weak non-brand framing | High | Retitle around "Compare Wedding Bands Ireland"; add decision table and form | P1 |
| `/wedding-bands-dublin/` | wedding bands Dublin, wedding band Dublin | Strong commercial intent; competitors have 250+ angle | High | Add Dublin proof, venue links, "which band suits Dublin venues" section | P1 |
| `/first-dance-songs/` | first dance songs, first dance songs Ireland | High traffic, lower conversion; no form | Medium | Expand to 120 songs, add "ask the band to learn your first dance" form | P2 |
| `/wedding-band-vs-dj/` | wedding band vs DJ | Evaluation intent; no form | Medium-high | Add comparison table and band+DJ package CTA | P2 |
| `/venues/` | wedding venues Ireland, venue-specific band | Hub has no form | Medium-high | Add venue search/filter and "check our bands for your venue" module | P2 |

Buckets:

- High impression / low CTR: homepage, cost guide, compare page, county pages, first dance songs.
- Position 4-15 near-winners from historical/sibling data: cost guide, first dance songs, wedding band vs DJ, wedding music timeline, showreel/showcases, selected county pages.
- High traffic / low conversion risk: first dance songs, song-list, wedding songs by decade.
- Low traffic / high intent: venue pages, county pages, band-and-DJ package, showcases.
- Cannibalization risks: `/wedding-band-and-dj-package/` vs `/wedding-band-vs-dj/`; `/venues/` vs venue pages; homepage vs county pages for generic "wedding bands Ireland".
- Decay cannot be confirmed until GSC tokens are restored.

## Phase 5: Competitor Sitemap And Keyword Intelligence

| Competitor | URL Pattern | Likely Keyword Target | Intent | Page Type | Strength | Weakness | Opportunity For MusicAngel |
|---|---|---|---|---|---|---|---|
| WeddingBandList | `/wedding-bands-dublin`, `/bands/{name}` | wedding bands Ireland/county, band names | Commercial directory | Location, profile, finder | Huge supply: sitemap sample 1,223 URLs, 1,151 profile/listing-like | Thin/ugly UX in places; `wedding-band-finder` title is "Test"; generic directory trust | Win with curated "four vetted live bands", stronger county/venue copy, cleaner availability flow |
| Wedding Band Association | `/wedding-bands`, `/showcase/{event}`, `/check-bands-availability/` | approved wedding bands, availability, showcases | Commercial/evaluation | Members, showcases, availability | Strong availability CTA, schema includes EntertainmentBusiness/MusicEvent | Many old showcase URLs; directory breadth but uneven page quality | Build better "showcases" and "availability" pages with MusicAngel-specific dates/proof |
| Hooley | `/{act}/`, `/counties/{county}/wedding-bands/` | act profile, county wedding bands | Commercial directory | Profile, county/category | Very large sitemap child sample: 3,148 URLs; has media | H1 noise on county pages ("Enquiry Form" repeated), invalid schema found on profile | Keep MusicAngel profiles accurate there, then outrank with canonical owned-band pages |
| IrishWeddingBands | `/wedding/{act}/`, `/blog/top-10...`, `/wedding/drinks-reception-music/...` | best/top wedding bands, wedding entertainment ideas | Informational/commercial | Blog, profile/service | Lots of long-tail posts and service categories | Clickbait titles, older posts, broad entertainment not curated | Publish cleaner best/price/package/comparison pages with real band proof |
| WeddingsOnline | `/suppliers/wedding-bands/` | wedding bands in Ireland | Commercial marketplace | Supplier category | Strong domain/marketplace authority, ItemList/FAQ schema | Generic supplier category; not focused on four MusicAngel bands | Use as citation/referral source and beat it on conversion-specific pages |
| TradWeddingBands | `/wedding-bands`, `/ceremony-music`, `/drinks-reception-music` | trad wedding bands, ceremony/drinks music | Niche commercial | Service/category | Clear niche positioning for trad/Irish music | Small sitemap and narrower niche | Build only if MusicAngel has real trad/celtic capability; otherwise avoid mismatch |

Combined competitor keyword map:

| Keyword Cluster | Competitors Targeting It | Example URLs | Intent | Difficulty | Lead Value | Target? | Recommended Page Type |
|---|---|---|---|---|---|---|---|
| wedding bands Ireland | WeddingBandList, WBA, WeddingsOnline | `/`, `/wedding-bands`, `/suppliers/wedding-bands/` | Commercial | High | Very high | Yes | Homepage plus `/best-wedding-bands-ireland/` |
| wedding bands county | WeddingBandList, Hooley, GigHeaven | `/wedding-bands-dublin`, `/counties/galway/wedding-bands/` | Local commercial | Medium | High | Yes | `/wedding-bands-{county}/` |
| check band availability | WBA, directories | `/check-bands-availability/` | Transactional | Medium | Very high | Yes | `/check-availability/` or embedded availability module |
| wedding band cost/prices | MusicAngel, sibling data, directories | `/wedding-band-cost-ireland/` | Evaluation | Medium | High | Yes | Guide + calculator/table |
| wedding band showcases | WBA, WeddingBandList | `/member-showcases/`, `/showcase/*` | Evaluation | Medium | High | Yes | `/wedding-band-showcases/` |
| venue wedding band | MusicAngel own architecture | `/wedding-band-{venue}/` | Local commercial | Low-medium | High | Yes | Venue page |
| first dance songs | One Fab Day/blogs/sibling data | `/first-dance-songs/` | Informational | Medium | Low-medium | Yes, with CTA | Guide with form |
| trad wedding bands | TradWeddingBands | `/wedding-bands` | Niche commercial | Medium | Medium | Only if offer fits | Niche service page |

## Phase 6: Keyword Strategy

Scoring: lead intent, feasibility, uniqueness, conversion, internal-link value. Total out of 25.

| Keyword | Intent | Funnel | Lead Value | Difficulty | Content Type Needed | Existing Page | New Page Needed | Score | Priority |
|---|---|---|---:|---:|---|---|---|---:|---|
| wedding band cost Ireland | Evaluation | Mid | 5 | 4 | Pricing guide + tables | Yes | No | 23 | P1 |
| wedding band and DJ package Ireland | Commercial | Mid-low | 5 | 4 | Package guide | Yes | Upgrade | 22 | P1 |
| wedding bands Ireland | Commercial | Low | 5 | 3 | Homepage + best page | Partial | Yes, maybe | 22 | P1 |
| check wedding band availability | Transactional | Bottom | 5 | 4 | Availability landing/module | Partial | Yes | 22 | P1 |
| wedding bands Dublin | Local commercial | Bottom | 5 | 3 | County page | Yes | No | 21 | P1 |
| best wedding bands Ireland | Commercial/evaluation | Mid | 5 | 3 | Curated best/compare page | Partial | Yes | 20 | P1 |
| wedding band for [venue] | Venue commercial | Bottom | 5 | 4 | Venue template | Yes | Expand | 20 | P1/P2 |
| wedding band showcases Ireland | Evaluation | Mid | 4 | 4 | Showcase guide + dates | Yes | Upgrade | 20 | P2 |
| wedding band vs DJ | Evaluation | Mid | 4 | 4 | Comparison guide | Yes | Upgrade | 19 | P2 |
| wedding ceremony music Ireland | Service | Mid | 4 | 3 | Service guide | Yes | Upgrade | 18 | P2 |
| first dance songs Ireland | Informational | Top-mid | 2 | 4 | Guide/list + conversion bridge | Yes | No | 16 | P2 |
| wedding songs by decade | Informational | Top | 1 | 4 | Guide/list | Yes | No | 13 | P3 |

Tier verdict:

- Tier 1 first: cost, packages, availability, Ireland/county money terms, venue pages.
- Tier 2 second: compare, showcases, questions, band vs DJ.
- Tier 3 only when it supports links/conversions: first dance, song list, timeline.
- Tier 4 programmatic: continue counties and venues, but only index pages with genuine unique usefulness.

## Phase 7: Site Architecture And Page-Type Strategy

| Page Type | Purpose | Target Keywords | Template Requirements | Unique Content Needed | CTA | Priority |
|---|---|---|---|---|---|---|
| Homepage | Own generic category | wedding bands Ireland | H1, band cards, comparison, pricing teaser, proof | Brand promise, four-band positioning | Check availability | P1 |
| Band profile | Convert brand/band intent | band name + wedding band | Hero, video, setlist, reviews, venues, form | Real reviews, repertoire, photos | Enquire for this band | P1 |
| Compare page | Help users choose | compare wedding bands Ireland | Matrix, use cases, guest count/venue fit | Real differentiators | Get recommendation | P1 |
| Pricing page | Capture cost intent | wedding band cost Ireland | Tables, package inclusions, FAQs, calculator | Prices, add-ons, travel | Get quote | P1 |
| County page | Local commercial SEO | wedding bands {county} | County intro, venue links, band picks, form | Real venues and local constraints | Check date in county | P1 |
| Venue page | Long-tail commercial | wedding band for {venue} | Venue-specific room/acoustic/fit info | Venue details, band rationale | Check date for venue | P1 |
| Availability page | Transactional capture | wedding band availability | Short form, trust proof, expected reply time | Availability workflow | Submit date | P1 |
| Guide page | Support evaluation | vs DJ, questions, timeline | Clear answer, tables, related money links | Expert guidance | Contextual enquiry | P2 |
| Best page | Compete with directories | best wedding bands Ireland | Honest curated list of owned bands, criteria | Transparent selection criteria | Compare/check availability | P2 |
| Reviews page | Trust and branded SEO | wedding band reviews Ireland | Real review snippets with links | Public review sources | Enquire | P2 |

Rules:

- URL structure: keep `/wedding-bands-{county}/` and `/wedding-band-{venue}/`; add `/best-wedding-bands-ireland/`, `/check-availability/`, `/wedding-band-reviews/` if built.
- Breadcrumbs: Home -> page type -> specific page. For counties, Home -> Wedding Bands Ireland -> County. For venues, Home -> Venues -> Venue.
- Internal links: every guide links to pricing, compare, and at least one relevant money page. Every venue links to county and top band picks. Every county links to 3-5 venue pages and top band picks.
- Pagination: avoid until there are hundreds of venues. If added, use crawlable links and self-canonical paginated URLs.
- Canonical: self-canonical for all indexable pages; strip query parameters; apex only.
- Index rules: noindex private tools, reports, data, scripts, lead logger, thin experimental pages.
- Sitemap: include only indexable canonical pages.

## Phase 8: On-Page SEO Audit

| Page | Current Problem | Better Title | Better H1 | Content Needed | Internal Links Needed | CTA Fix | Priority |
|---|---|---|---|---|---|---|---|
| `/` | H1 is brand-only | Wedding Bands Ireland | MusicAngel | Wedding Bands Ireland, 100% Live | Shorter pitch, band chooser, proof | County, pricing, compare | Above-fold date/venue CTA | P1 |
| `/wedding-band-cost-ireland/` | Title long, meta short | Wedding Band Cost Ireland 2026 | Wedding Band Cost Ireland | Cost table, package comparison, travel/add-ons | Band pages, package page | Quote form after price table | P1 |
| `/compare-bands/` | Title long and brand-led | Compare Wedding Bands Ireland | Compare Wedding Bands Ireland | Decision matrix, venue/guest fit | Four band pages, pricing | "Tell us your date" form | P1 |
| `/first-dance-songs/` | Informational leak | First Dance Songs Ireland 2026 | First Dance Songs For Irish Weddings | Add 120 songs, live-band learning section | Cost, band pages, song-list | Mini first-dance request form | P2 |
| `/song-list/` | No form | Wedding Band Song List Ireland | Wedding Band Song List | Band-specific setlist samples | Four band pages | "Ask about a song" CTA | P2 |
| `/wedding-bands-dublin/` | Needs proof vs directories | Wedding Bands Dublin | Wedding Bands In Dublin | Dublin venues, travel, real examples | Dublin venues, compare | Keep form, add date urgency | P1 |
| `/venues/` | No form/filter | Irish Wedding Venues And Bands | Wedding Venues We Cover | Search/filter by county | County pages, venue pages | Venue availability CTA | P2 |

Title/meta guidance:

- Keep priority titles near 50-60 chars.
- Put primary keyword first, brand last or omitted where space is tight.
- Use meta descriptions to sell specificity: "four vetted live bands", "100% live", "pricing from EUR 2450", "reply within one working day".

## Phase 9: Content Gap Analysis

| Gap | Evidence | Competitor Example | Intent | Revenue Potential | Recommended Page | Priority |
|---|---|---|---|---|---|---|
| Dedicated availability page | WBA has `/check-bands-availability/`; current site uses forms but no page | WBA availability page | Transactional | Very high | `/check-availability/` | P1 |
| Best/curated wedding bands Ireland page | SERP has list posts/directories | WeddingBandList, One Fab Day, IrishWeddingBands | Evaluation | High | `/best-wedding-bands-ireland/` | P1 |
| Reviews/proof page | `data/reviews.json` is empty; no Review schema | Directories foreground reviews | Trust/commercial | High | `/wedding-band-reviews/` plus band review blocks | P1 |
| Guide pages missing forms | Static audit found no forms on major guides | Competitors use enquiry modules | Conversion | High | Add reusable guide enquiry component | P1 |
| Venue expansion | 50 venues exists, but market has many more | Directory/location pages | Long-tail commercial | High | Add 20-30 high-search venues with unique data | P2 |
| Showcases depth | WBA has 994 showcase URLs | WBA showcase sitemap | Evaluation | Medium-high | Upgrade `/wedding-band-showcases/` with upcoming dates or process | P2 |
| City/neighborhood pages | Current architecture is county-level | GigHeaven/county marketplaces | Local commercial | Medium | Only Dublin/Cork/Galway city pages if unique | P3 |
| Trad/niche page | TradWeddingBands owns trad niche | TradWeddingBands | Niche commercial | Medium if offer fits | Only build if bands genuinely serve trad/celtic intent | P3 |

30-day sprint:

Week 1:

- Add apex redirect from `www`.
- Re-auth GSC/GA4.
- Normalize lead landing paths in D1.
- Rewrite homepage H1/intro and priority title/meta.
- Add forms to top guides.

Week 2:

- Build `/check-availability/`.
- Upgrade `/wedding-band-cost-ireland/`, `/compare-bands/`, `/wedding-band-and-dj-package/`.
- Add internal links from guides to money pages.
- Add sales outcome fields workflow in lead logger.

Week 3:

- Build `/best-wedding-bands-ireland/` and `/wedding-band-reviews/` using only real proof.
- Add real reviews to band pages.
- Validate schema in Rich Results Test.

Week 4:

- Add 10 high-value venue pages with unique details.
- Refresh county pages based on GSC impressions.
- Re-run Lighthouse and GSC page/query report.
- Review lead quality and quote/booked outcomes.

## Phase 10: Programmatic SEO Opportunity

MusicAngel already has a programmatic base: 32 county pages and 50 venue pages. Keep it, but raise indexation thresholds.

| Template | Example URL | Keyword Pattern | Scalability | Thin Risk | Lead Potential | Build Priority |
|---|---|---|---|---|---|---|
| County | `/wedding-bands-dublin/` | wedding bands {county} | 32 max | Medium | High | Keep/upgrade |
| Venue | `/wedding-band-adare-manor/` | wedding band for {venue} | 100-200 | Medium-high | High | Expand carefully |
| Package | `/wedding-band-and-dj-package/` | wedding band and DJ package | Low | Low | High | Upgrade |
| Comparison | `/wedding-band-vs-dj/` | wedding band vs DJ | Low | Low | Medium-high | Upgrade |
| Best/list | `/best-wedding-bands-ireland/` | best wedding bands Ireland | Low | Medium | High | Build |
| Review/proof | `/wedding-band-reviews/` | wedding band reviews Ireland | Low | Medium | High | Build after real reviews |
| City | `/wedding-bands-dublin-city/` | wedding bands Dublin city | Medium | High | Medium | Only with unique data |

Quality thresholds:

- Minimum 600-900 words of useful unique copy for venue/county pages.
- At least 3 unique venue facts or local constraints.
- At least 3 relevant internal links to money pages.
- At least 1 visible conversion CTA and 1 form for commercial templates.
- Index only if the page has unique venue/county facts, not just spun text.
- Noindex or merge if it has no search demand, no unique data, and no conversion role.
- Canonical to parent county only if a child location page is thin or duplicative.

## Phase 11: Internal Linking Strategy

| Source Page | Target Page | Anchor Text | Reason | Priority |
|---|---|---|---|---|
| `/first-dance-songs/` | `/the-beat-boutique/` | ask The Beat Boutique to learn your first dance | Convert song research | P1 |
| `/first-dance-songs/` | `/wedding-band-cost-ireland/` | wedding band cost in Ireland | Move from idea to budget | P1 |
| `/wedding-band-vs-dj/` | `/wedding-band-and-dj-package/` | wedding band and DJ package | Transactional next step | P1 |
| `/questions-to-ask-wedding-band/` | `/compare-bands/` | compare MusicAngel wedding bands | Evaluation to selection | P1 |
| `/wedding-band-cost-ireland/` | `/check-availability/` | get a date-specific quote | Bottom-funnel CTA | P1 |
| `/venues/` | `/wedding-bands-dublin/` | wedding bands in Dublin | Hub to location | P2 |
| `/wedding-band-adare-manor/` | `/wedding-bands-limerick/` | wedding bands in Limerick | Venue to county | P2 |
| `/wedding-bands-dublin/` | Dublin venue pages | Adare-style venue anchors | County to venues | P2 |
| `/the-beat-boutique/` | `/wedding-band-reviews/` | read wedding band reviews | Trust path | P2 |

Rules:

- Every guide links to at least 2 money pages.
- Every county page links to relevant venue pages and top bands.
- Every venue page links back to county, compare, pricing, and selected band profiles.
- Homepage should link to all four band pages, compare, pricing, availability, and top counties.
- Avoid exact-match anchors every time; use natural variants.

## Phase 12: Schema Markup

Current schema coverage:

- Organization, WebSite, MusicGroup, Article, BreadcrumbList, FAQPage, ItemList, CollectionPage, Place, Service.
- No Review or AggregateRating detected, which is correct because `data/reviews.json` has no real review data.

| Page Type | Schema Type | Required Fields | Optional Fields | Notes |
|---|---|---|---|---|
| Homepage | Organization, WebSite, MusicGroup | name, url, sameAs, band URLs | logo, contactPoint | Keep four MusicGroup entities linked |
| Band page | MusicGroup, BreadcrumbList, FAQPage | name, url, image, genre, areaServed | video, memberOf, review | Add Review only with real visible reviews |
| County page | Service, BreadcrumbList, ItemList, FAQPage | serviceType, areaServed, provider | offers | Avoid fake LocalBusiness if no local office |
| Venue page | Place, BreadcrumbList, ItemList, FAQPage | venue name, address, related band list | geo if known | Place describes venue, not MusicAngel |
| Guide | Article, BreadcrumbList, FAQPage | headline, datePublished, author, mainEntityOfPage | dateModified, image | Add dateModified on material refreshes |
| Reviews page | Review, AggregateRating | itemReviewed, reviewBody, author, ratingValue | source URL | Only if visible and verifiable |
| Availability page | Service, Organization, BreadcrumbList | service, provider, areaServed | potentialAction | Keep claims visible |

Schema risks:

- Do not add fake aggregate ratings.
- Do not mark the venue as MusicAngel's LocalBusiness.
- FAQ JSON-LD must match visible on-page FAQ.
- Validate generated JSON-LD after template changes.

## Phase 13: Conversion And Lead Audit

Strengths:

- Forms exist on band, county, venue, compare, pricing, corporate pages.
- JS fires `form_start`, `form_submit_attempt`, `form_submit`, `generate_lead`, `contact_click`, `band_click`, `enquiry_cta_click`.
- API stores lead data in D1 and sends email via Resend.
- Lead classification distinguishes paid, organic, referral, direct/unknown, and test.

Problems:

| Page/Area | Conversion Problem | Fix | Expected Impact | Difficulty | Priority |
|---|---|---|---|---|---|
| Guide pages | No embedded form on many pages | Add compact guide-specific enquiry form | More leads from informational traffic | Medium | P1 |
| Homepage | Brand-first H1 weakens immediate offer clarity | H1 and hero copy around wedding bands Ireland | Better organic fit and CVR | Low | P1 |
| Lead logger/D1 | No booked/qualified outcomes for current paid leads | Make outcome updates mandatory: qualified, quoted, booked, lost reason | Enables revenue SEO decisions | Medium | P1 |
| D1 page data | Full query URLs fragment reporting | Store normalized path fields | Accurate landing CVR | Low-medium | P1 |
| Band pages | Real review data absent | Add public reviews with source URLs and visible blocks | Trust lift | Medium | P1 |
| Pricing page | Price info can work harder | Add clear "what EUR 2450 gets you" comparison | Higher quote intent | Low-medium | P1 |
| Availability flow | No dedicated landing page | Build `/check-availability/` | Captures bottom-funnel intent | Medium | P1 |

Fastest conversion win:

- Add a reusable "Check availability for your date" form block to all guide pages, prefilled with contextual interest (`first_dance`, `band_vs_dj`, `ceremony_music`, etc.).

## Phase 14: Measurement And Tracking

Current state:

- GA4 installed sitewide with Consent Mode v2.
- GSC/GA4 report script exists but OAuth tokens are revoked.
- D1 lead source of truth works and contains 15 total rows.
- Paid lead CPL can be calculated, but booked/qualified outcomes are blank.
- Page-level lead analysis is fragmented by full query URLs.

Dashboard:

| Metric | Source | Why It Matters | Target |
|---|---|---|---|
| Organic clicks | GSC | SEO demand capture | +20% MoM after indexation stabilizes |
| Organic impressions | GSC | Visibility growth | +30% MoM for money clusters |
| Organic CTR | GSC | Title/meta fit | >2% overall, higher on brand/local |
| Avg position | GSC | Ranking progress | Top 10 for priority money pages |
| Indexed pages | GSC | Crawl/index health | 90%+ of sitemap money pages indexed |
| Crawl errors | GSC/Cloudflare | Technical blockers | 0 critical |
| Organic leads | D1/GA4 | Business outcome | Monthly growth, not just sessions |
| CVR by landing page | D1/GA4 | Page quality | Prioritize top pages under median |
| Leads by keyword/page cluster | GSC + D1 | Revenue SEO | Money clusters first |
| Cloudflare requests | Cloudflare Analytics | Traffic and bot/crawl shifts | Stable baseline |
| Blocked crawler events | Cloudflare Security | Crawl risk | 0 verified Googlebot/Bingbot blocks |
| Core Web Vitals | CrUX/Lighthouse | UX and ranking hygiene | LCP <2.5s, CLS <0.1 |
| Booked revenue | D1/CRM | Actual ROI | Required before scaling spend/content |

## Phase 15: Prioritized SEO Roadmap

| Priority | Task | Area | Why It Matters | Impact | Difficulty | Owner | Verify |
|---|---|---|---|---|---|---|---|
| P1 | Redirect `www` to apex | Cloudflare | Removes duplicate host | Medium-high | Low | Dev/Cloudflare | `curl -I https://www.musicangel.ie/x` returns 301 |
| P1 | Re-auth GSC/GA4 | Measurement | Enables current audit cadence | High | Low | Owner | Weekly report script succeeds |
| P1 | Normalize lead paths in D1/API | Measurement | Accurate landing-page CVR | High | Medium | Dev | D1 shows clean path columns |
| P1 | Add guide enquiry forms | Conversion | Captures informational traffic | High | Medium | Dev/content | Forms appear and submit |
| P1 | Rewrite homepage H1/intro | On-page | Matches core money intent | High | Low | Content/dev | Raw HTML H1 updated |
| P1 | Upgrade pricing and compare pages | Money pages | Best near-term organic/conversion lift | High | Medium | Content/dev | GSC CTR, leads |
| P1 | Add real review proof | Trust | Competes with directories | High | Medium | Founder/content | Visible reviews, valid schema |
| P2 | Build availability page | Conversion/SEO | Transactional landing asset | High | Medium | Dev/content | Indexed and generating leads |
| P2 | Build best wedding bands page | Competitor gap | Attacks high-value evaluation cluster | Medium-high | Medium | Content | GSC impressions |
| P2 | Expand venue pages | Programmatic | Scales qualified long tail | Medium-high | Medium | Content/dev | Indexed and lead-assisted |
| P2 | Clean irrelevant redirects | Technical | Reduces soft-404/noise | Medium | Low | Dev | 410/noindex for spam paths |
| P3 | City pages | Local SEO | Optional expansion | Medium | High | Content | Only after county proof |

24-hour fix list:

1. Add Cloudflare redirect `www -> apex`.
2. Re-auth GSC/GA4 tokens.
3. Rewrite homepage H1 and top intro.
4. Shorten priority titles/metas: homepage, cost, compare, questions, song-list, showcases.
5. Add normalized path fields to D1 insert logic.

7-day sprint:

1. Add guide enquiry form component.
2. Upgrade pricing page with comparison table.
3. Upgrade compare page with band decision matrix.
4. Add outcome workflow to lead logger.
5. Validate Cloudflare Security Events for search bots.
6. Request indexing for top 20 money pages.

30-day plan:

1. Build `/check-availability/`.
2. Build `/best-wedding-bands-ireland/`.
3. Add review blocks from real public sources.
4. Add 10 high-value venue pages.
5. Refresh county pages with GSC data.
6. Re-run Lighthouse, broken links, canonical audit, GSC report.

90-day strategy:

1. Scale venue pages to 80-100 only where unique data exists.
2. Build authority through supplier profiles, wedding blogs, venue partner links, and directory profile hygiene.
3. Turn GSC near-winners into monthly page refresh queue.
4. Tie leads to qualified/quoted/booked outcomes.
5. Use paid search data to identify organic page upgrades, not just ad optimizations.

## Phase 16: Implementation Tickets

### Ticket 1: Enforce Apex Canonical Host

Priority: P1

Problem: `www.musicangel.ie` returns 200.

Evidence: Live `curl` confirmed 200 for `https://www.musicangel.ie/` and `https://www.musicangel.ie/wedding-bands-dublin/`.

Affected URLs: all `www` URLs.

Recommended fix: Cloudflare Redirect Rule, 301 from `https://www.musicangel.ie/*` to `https://musicangel.ie/$1`, preserving query string.

Acceptance criteria:

- Any `www` URL 301s to equivalent apex URL.
- Apex URL returns 200.
- Canonical remains apex.

How to test:

```bash
curl -I https://www.musicangel.ie/wedding-bands-dublin/
```

SEO impact: consolidates host signals and analytics.

Risk if not fixed: duplicate host crawl and reporting noise.

### Ticket 2: Normalize Landing Page Paths In D1

Priority: P1

Problem: Lead rows store full URLs with `_gl`, `gclid`, and query parameters.

Evidence: Aggregate D1 page query fragmented equivalent pages.

Affected files: `functions/api/enquiry.js`, migrations, reporting views.

Recommended fix:

- Add columns `landing_path`, `submitted_path`, `first_landing_path`.
- On insert, parse URLs and store `pathname` only.
- Keep raw URLs in existing fields for audit.
- Update reporting views to group by normalized path.

Acceptance criteria:

- New leads have clean path values like `/sway-social/`.
- Reports can group leads by normalized page.

How to test:

```sql
SELECT submitted_path, count(*) FROM leads GROUP BY submitted_path;
```

SEO impact: accurate lead/page prioritization.

Risk if not fixed: wrong CRO and SEO investment decisions.

### Ticket 3: Add Guide Enquiry Module

Priority: P1

Problem: High-intent guides do not include embedded forms.

Evidence: Static audit found no form on first dance, song list, band vs DJ, timeline, questions, ceremony, drinks reception pages.

Affected URLs: guide pages listed above.

Recommended fix: Reusable compact form with hidden/contextual `package_or_service_interest`.

Acceptance criteria:

- Each guide has visible CTA and form.
- Form submit records guide context.
- GA4/D1 capture the page and normalized path.

SEO impact: converts informational SEO into leads.

Risk if not fixed: traffic grows without revenue.

### Ticket 4: Rewrite Homepage Money Intent

Priority: P1

Problem: H1 is `Music Angel`.

Evidence: `index.html` title targets wedding bands but H1 does not.

Affected URL: `/`.

Recommended fix:

- Title: keep or test `Wedding Bands Ireland | MusicAngel`.
- H1: `Wedding Bands Ireland, 100% Live`.
- Supporting copy: four vetted live bands, all Ireland, availability and pricing.

Acceptance criteria:

- Raw HTML H1 contains primary money term.
- Hero still communicates brand.

SEO impact: better query-page intent match.

Risk if not fixed: homepage underperforms for generic commercial terms.

### Ticket 5: Upgrade Pricing Page

Priority: P1

Problem: Cost page is valuable but title is long and meta short.

Evidence: Historical GSC showed impressions/clicks; static audit flags title/meta.

Affected URL: `/wedding-band-cost-ireland/`.

Recommended fix:

- Title: `Wedding Band Cost Ireland 2026 | MusicAngel`.
- Add "What EUR 2450 gets you" table.
- Add package/add-on/travel rows.
- Add form after the pricing table.

Acceptance criteria:

- Table visible in raw HTML.
- Form submits with context `pricing`.

SEO impact: snippet eligibility and higher lead intent capture.

Risk if not fixed: near-winner page leaves CTR/leads on table.

### Ticket 6: Real Review Proof Rollout

Priority: P1

Problem: `data/reviews.json` has empty review arrays.

Evidence: No Review/AggregateRating schema detected.

Affected URLs: four band pages, future reviews page.

Recommended fix:

- Add only real public reviews with source URL, author, rating if available.
- Render visible review blocks.
- Add Review schema only where visible and valid.

Acceptance criteria:

- At least 3 real reviews per band where available.
- Rich Results Test passes.

SEO impact: trust and conversion lift.

Risk if not fixed: directories keep trust advantage.

### Ticket 7: Build Availability Landing Page

Priority: P2

Problem: Competitors target "check availability"; MusicAngel relies on embedded forms.

Evidence: WBA has `/check-bands-availability/`.

Recommended URL: `/check-availability/`.

Recommended fix:

- Short page with date, venue, county, band preference, package interest.
- Explain reply window and what happens next.
- Link from nav/footer/guide CTAs.

Acceptance criteria:

- Page in sitemap.
- Form submits and records `availability` context.

SEO impact: captures bottom-funnel searches and improves paid/organic landing quality.

Risk if not fixed: transactional intent flows to competitor availability pages.

### Ticket 8: Clean Irrelevant Legacy Redirects

Priority: P2

Problem: Some irrelevant paths 301 to homepage.

Evidence: `/wp-login.php` redirects to `/`.

Recommended fix:

- Keep relevant historical redirects.
- 410/noindex irrelevant spam/admin paths.

Acceptance criteria:

- `/wp-login.php` and unrelated old paths return 410 or 404 noindex, not homepage 200 after redirect.

SEO impact: reduces soft-404 and irrelevant consolidation.

Risk if not fixed: GSC noise and low-quality URL signals.

## Phase 17: Executive Summary

Biggest SEO problem right now:

- Not crawlability. The biggest issue is that the site has the basics but has not yet connected organic visibility, page templates, and lead quality into one operating loop. GSC is stale, guide traffic leaks, lead paths are fragmented, and booked/qualified outcomes are not recorded.

Biggest growth opportunity:

- Own high-intent wedding-band decision pages: cost, compare, availability, band+DJ package, county pages, and venue pages. These are closer to revenue than broad song-list traffic.

Biggest technical risk:

- `www` host duplication plus unverified Cloudflare WAF/Bot settings. Fix the host redirect immediately, then verify no verified search crawlers are challenged.

Best keyword cluster to attack first:

- "wedding band cost Ireland", "wedding band prices Ireland", "wedding band and DJ package", and "check wedding band availability". These have direct buying intent and fit existing pages/forms.

Best competitor weakness to exploit:

- Large directories have breadth but thin/noisy pages, weak UX, H1/schema issues, and generic supply. MusicAngel can be the curated, faster, higher-trust route to four vetted live bands.

Fastest lead-generation win:

- Add contextual enquiry forms to high-traffic/evaluation guides and normalize D1 landing paths so you can see which pages actually produce qualified leads.

What not to waste time on:

- Broad informational blog volume, city pages without unique data, fake review schema, and trying to match 1,200-directory supply.

Exact next 10 actions:

1. Add Cloudflare `www -> apex` 301 redirect.
2. Re-auth GSC/GA4 and restore weekly reports.
3. Add normalized lead path columns and reporting views in D1.
4. Rewrite homepage H1/intro around "Wedding Bands Ireland".
5. Upgrade `/wedding-band-cost-ireland/` with comparison tables and form.
6. Upgrade `/compare-bands/` with a decision matrix and clearer title.
7. Add contextual forms to all guide pages.
8. Add real public reviews to band pages and render visible proof.
9. Build `/check-availability/`.
10. Validate Cloudflare Security Events for Googlebot/Bingbot and request indexing for the refreshed money pages.
