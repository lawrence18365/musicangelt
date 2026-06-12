# MusicAngel GA4, GSC, and Indexing Pull - 2026-05-25

Pulled on May 25, 2026 from the logged-in Google Analytics and Google Search Console UIs for `musicangel.ie`.

## Executive Summary

- GA4 is collecting traffic. Last 28 days shows 21 sessions, 44 views, 139 events, and 9 key events.
- Organic Search is already the strongest channel: 12 of 21 sessions and 8 of 9 key events in GA4's last-28-day traffic report.
- GSC 28-day performance is still early: 6 clicks, 667 impressions, 0.9% CTR, average position 27.4. The visible chart covers May 15 to May 23, 2026, because this is a fresh property/data set.
- Sitemap submission is successful: `https://musicangel.ie/sitemap.xml` was submitted May 16, last read May 23, status Success, with 105 discovered pages.
- Index coverage is the main bottleneck: 126 pages indexed and 313 not indexed. The largest buckets are "Crawled - currently not indexed" with 189 pages and "Discovered - currently not indexed" with 56 pages.
- Priority URL inspections show the homepage, `/the-best-men/`, `/wedding-band-cost-ireland/`, and `/first-dance-songs/` are indexed. Several band/comparison/showcase pages are technically indexable, but still not indexed.
- Indexing requests were submitted in GSC for `/the-beat-boutique/`, `/sway-social/`, `/blacktye/`, `/compare-bands/`, and `/wedding-band-showcases/`.

## GA4 - Last 28 Days

Date range in GA4 detailed reports: Apr 27 - May 24, 2026.

### Traffic Acquisition

| Channel | Sessions | Engaged sessions | Engagement rate | Avg engagement / session | Events | Key events | Session key event rate |
|---|---:|---:|---:|---:|---:|---:|---:|
| Total | 21 | 14 | 66.67% | 2m 09s | 139 | 9 | 19.05% |
| Organic Search | 12 | 8 | 66.67% | 3m 40s | 99 | 8 | 25% |
| Direct | 6 | 4 | 66.67% | 12s | 26 | 1 | 16.67% |
| Organic Social | 2 | 2 | 100% | 2s | 11 | 0 | 0% |
| Unassigned | 1 | 0 | 0% | 5s | 3 | 0 | 0% |

### Pages And Screens

| Page path | Views | Active users | Avg engagement / active user | Events | Key events |
|---|---:|---:|---:|---:|---:|
| Total | 44 | 9 | 5m 02s | 139 | 9 |
| `/` | 26 | 8 | 3m 11s | 93 | 5 |
| `/the-beat-boutique/` | 4 | 3 | 2m 03s | 8 | 0 |
| `/compare-bands/` | 3 | 1 | 4m 05s | 7 | 3 |
| `/the-best-men/` | 3 | 3 | 1m 37s | 7 | 0 |
| `/sway-social/` | 2 | 1 | 3m 06s | 6 | 0 |
| `/blacktye/` | 1 | 1 | 0s | 3 | 0 |
| `/ceremony-music/` | 1 | 1 | 1m 07s | 2 | 0 |
| `/portfolio/jakerandco/` | 1 | 1 | 27s | 6 | 1 |
| `/wedding-band-cabra-castle/` | 1 | 1 | 4s | 2 | 0 |
| `/wedding-band-cost-ireland/` | 1 | 1 | 4s | 2 | 0 |

### Events

| Event | Event count | Total users |
|---|---:|---:|
| Total | 139 | 9 |
| `page_view` | 44 | 9 |
| `user_engagement` | 39 | 9 |
| `session_start` | 20 | 9 |
| `video_play` | 14 | 3 |
| `band_click` | 7 | 2 |
| `first_visit` | 6 | 6 |
| `enquiry_cta_click` | 4 | 2 |
| `form_start` | 3 | 3 |
| `contact_click` | 2 | 1 |

Inference from the GA4 event and key-event totals: the 9 key events are currently coming from `band_click` and `contact_click`; `generate_lead` and `form_submit` are configured as key events but did not appear in the current event table.

## GA4 - Last 7 Days Home Snapshot

| Metric | Value | Change shown by GA4 |
|---|---:|---:|
| Active users | 7 | +40.0% |
| Event count | 112 | +314.8% |
| Key events | 9 | - |
| New users | 4 | +100.0% |
| Active users in last 30 minutes | 0 | - |

Top last-7-day countries by active users: Ireland 4, United States 2, Canada 1.

Last-7-day sessions by channel: Organic Search 10, Organic Social 2, Direct 1, Unassigned 0.

## GSC Performance - 28 Days

GSC report URL used: Performance, Search type Web, 28 days. Last update shown in GSC: 5 hours before pull.

| Metric | Value |
|---|---:|
| Total clicks | 6 |
| Total impressions | 667 |
| Average CTR | 0.9% |
| Average position | 27.4 |

### Top Queries

| Query | Clicks | Impressions |
|---|---:|---:|
| music angel | 3 | 19 |
| wedding bands ireland | 1 | 12 |
| the best men wedding band | 1 | 10 |
| first dance songs | 0 | 13 |
| wedding bands dublin | 0 | 9 |
| wedding band ireland | 0 | 9 |
| ukulele bands ireland | 0 | 7 |
| wedding band dublin | 0 | 7 |
| sheen falls lodge | 0 | 6 |
| wedding bands near me | 0 | 6 |

### Top Pages

| Page | Clicks | Impressions |
|---|---:|---:|
| `https://musicangel.ie/` | 3 | 251 |
| `https://musicangel.ie/the-best-men/` | 1 | 27 |
| `http://musicangel.ie/portfolio/jakerandco/` | 1 | 16 |
| `http://musicangel.ie/` | 1 | 4 |
| `http://musicangel.ie/difference-between-appointment-letters-and-employment-contracts/` | 0 | 85 |
| `https://musicangel.ie/first-dance-songs/` | 0 | 61 |
| `http://musicangel.ie/wedding-bands-dublin` | 0 | 18 |
| `https://musicangel.ie/first-dance-songs` | 0 | 15 |
| `https://musicangel.ie/when-to-book-wedding-band/` | 0 | 14 |
| `https://musicangel.ie/wedding-band-sheen-falls-lodge/` | 0 | 12 |

### Countries And Devices

| Country | Clicks | Impressions |
|---|---:|---:|
| Ireland | 4 | 343 |
| United Kingdom | 1 | 114 |
| Sri Lanka | 1 | 2 |
| United States | 0 | 55 |
| Uganda | 0 | 11 |
| Singapore | 0 | 8 |
| Indonesia | 0 | 8 |
| Vietnam | 0 | 8 |
| Brazil | 0 | 8 |
| Nigeria | 0 | 7 |

| Device | Clicks | Impressions |
|---|---:|---:|
| Desktop | 5 | 454 |
| Mobile | 1 | 212 |
| Tablet | 0 | 1 |

Search appearance report: no data.

## GSC Sitemaps And Page Indexing

### Sitemap

| Sitemap | Submitted | Last read | Status | Discovered pages | Discovered videos |
|---|---:|---:|---|---:|---:|
| `https://musicangel.ie/sitemap.xml` | May 16, 2026 | May 23, 2026 | Success | 105 | 0 |

### Page Indexing Coverage

GSC Page indexing report last update: May 21, 2026.

| Coverage status | Pages |
|---|---:|
| Indexed | 126 |
| Not indexed | 313 |

| Not indexed reason | Source | Validation | Pages |
|---|---|---|---:|
| Crawled - currently not indexed | Google systems | Not Started | 189 |
| Discovered - currently not indexed | Google systems | Not Started | 56 |
| Page with redirect | Website | Not Started | 36 |
| Alternate page with proper canonical tag | Website | Not Started | 23 |
| Not found (404) | Website | Not Started | 8 |
| Excluded by `noindex` tag | Website | Not Started | 1 |

## Priority URL Inspection

| URL | GSC index status | Details |
|---|---|---|
| `https://musicangel.ie/` | Indexed | URL is on Google. Page is indexed. HTTPS valid. |
| `https://musicangel.ie/the-best-men/` | Indexed | URL is on Google. Page is indexed. HTTPS, Breadcrumbs, FAQ, and Videos enhancements valid. |
| `https://musicangel.ie/wedding-band-cost-ireland/` | Indexed | URL is on Google. Page is indexed. HTTPS, Breadcrumbs, and FAQ enhancements valid. |
| `https://musicangel.ie/first-dance-songs/` | Indexed | URL is on Google. Page is indexed. HTTPS, Breadcrumbs, and FAQ enhancements valid. |
| `https://musicangel.ie/the-beat-boutique/` | Not indexed | Discovered - currently not indexed. Found in sitemap. Last crawl N/A. |
| `https://musicangel.ie/sway-social/` | Not indexed | Discovered - currently not indexed. Found in sitemap. Last crawl N/A. |
| `https://musicangel.ie/blacktye/` | Not indexed | Discovered - currently not indexed. Found in sitemap. Last crawl N/A. |
| `https://musicangel.ie/compare-bands/` | Not indexed | Initial inspection showed Discovered - currently not indexed. On submit pass GSC showed URL is unknown to Google, but accepted the indexing request. |
| `https://musicangel.ie/wedding-band-showcases/` | Not indexed | Discovered - currently not indexed. Found in sitemap. Last crawl N/A. |

## Indexing Requests Submitted

GSC confirmed "Indexing requested" and added these pages to the priority crawl queue:

| URL | Submit result |
|---|---|
| `https://musicangel.ie/the-beat-boutique/` | Indexing requested |
| `https://musicangel.ie/sway-social/` | Indexing requested |
| `https://musicangel.ie/blacktye/` | Indexing requested |
| `https://musicangel.ie/compare-bands/` | Indexing requested |
| `https://musicangel.ie/wedding-band-showcases/` | Indexing requested |

## GSC Validation Actions Started

After deploying the SEO cleanup, the following Page indexing validations were started in GSC on May 25, 2026:

| GSC bucket | Pages | Action |
|---|---:|---|
| Crawled - currently not indexed | 189 | Validate fix started |
| Discovered - currently not indexed | 56 | Validate fix started |
| Not found (404) | 8 | Validate fix started after legacy URL cleanup |

The remaining buckets were reviewed but not validated because they are expected/non-actionable:

| GSC bucket | Pages | Reason no validation was started |
|---|---:|---|
| Page with redirect | 36 | Mostly old `wordfence_lh` URLs and no-trailing-slash variants. These are expected to redirect. |
| Alternate page with proper canonical tag | 23 | Mostly old `wordfence_lh` URLs with correct canonical handling. |
| Excluded by `noindex` tag | 1 | Old `wp-login.php?action=lostpassword` URL. Correct to keep out of the index. |

## Deployment And Sitemap Re-Submit

After the SEO implementation pass, the updated site was deployed to Cloudflare Pages and the refreshed sitemap was submitted again in GSC on May 25, 2026. GSC confirmed "Sitemap submitted successfully." The live sitemap now reports May 25, 2026 `lastmod` values for the priority URLs.

## Legacy 404 Cleanup

The 404 bucket contained old/spam WordPress-era URLs. The controlled examples were cleaned up before validation:

| Legacy URL pattern | Live handling |
|---|---|
| `/my-booking/` | 301 to `/#contact` |
| `/meet-the-team/` | 301 to `/about/` |
| `/unique-title-important-agreements-and-contracts-you-must-know-about/` | 410 Gone + `X-Robots-Tag: noindex, noarchive` |
| `/the-general-agreement-among-the-citizenry-on-an-issue-is-called/` | 410 Gone + `X-Robots-Tag: noindex, noarchive` |
| `/exploring-free-trade-agreement-taxes-and-other-legal-agreements/` | 410 Gone + `X-Robots-Tag: noindex, noarchive` |
| `/mapping-the-universe-of-international-investment-agreements-and-other-agreements/` | 410 Gone + `X-Robots-Tag: noindex, noarchive` |
| `/the-trophy-cabinet/press-praise/*` | 410 Gone + `X-Robots-Tag: noindex, noarchive` |

Removals was reviewed. No temporary removal requests were submitted because GSC showed no requests in the last 6 months and the legacy URLs are now handled with redirects or 410/noindex responses.

## Live Crawl-Signal Check

The priority URLs return HTTP 200, self-canonical URLs, and indexable robots directives in production. This means the current issue for the non-indexed URLs is Google discovery/crawl/indexing lag rather than a live technical block.

| URL | HTTP | Robots meta | Canonical |
|---|---:|---|---|
| `/` | 200 | `index, follow` | `https://musicangel.ie/` |
| `/the-best-men/` | 200 | `index, follow` | `https://musicangel.ie/the-best-men/` |
| `/the-beat-boutique/` | 200 | `index, follow` | `https://musicangel.ie/the-beat-boutique/` |
| `/sway-social/` | 200 | `index, follow` | `https://musicangel.ie/sway-social/` |
| `/blacktye/` | 200 | `index, follow` | `https://musicangel.ie/blacktye/` |
| `/wedding-band-cost-ireland/` | 200 | `index, follow` | `https://musicangel.ie/wedding-band-cost-ireland/` |
| `/compare-bands/` | 200 | `index, follow` | `https://musicangel.ie/compare-bands/` |
| `/first-dance-songs/` | 200 | `index, follow` | `https://musicangel.ie/first-dance-songs/` |
| `/wedding-band-showcases/` | 200 | `index, follow` | `https://musicangel.ie/wedding-band-showcases/` |

`robots.txt` allows `User-agent: *` and the sitemap is reachable at HTTP 200.

## Immediate Actions

1. Monitor indexing on the submitted priority URLs: `/the-beat-boutique/`, `/sway-social/`, `/blacktye/`, `/compare-bands/`, and `/wedding-band-showcases/`.
2. Investigate legacy HTTP URLs in GSC performance, especially `/difference-between-appointment-letters-and-employment-contracts/`, because it is drawing 85 impressions and looks unrelated to the current MusicAngel site.
3. Keep Ads launch traffic pointed at URLs that are live and technically indexable. For organic SEO, prioritize internal links to the not-yet-indexed band pages from the homepage and relevant county/venue pages.
4. Re-pull GSC coverage after Google next reads the sitemap. Current sitemap read is May 23, 2026; indexing report data is May 21, 2026.
5. Watch for `generate_lead` and `form_submit` in GA4. They are configured as key events, but no current event rows appeared for them in the pulled data.
