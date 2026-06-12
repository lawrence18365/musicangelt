# MusicAngel Executive SEO Direction - 2026-05-25

## Executive Decision

MusicAngel should treat SEO as a crawl/indexation and commercial-page authority problem first, then a content expansion problem. Demand is already visible: Search Console is showing impressions for wedding-band terms, and GA4 shows Organic Search producing the majority of sessions and key events.

The next 90 days should focus on getting the high-intent pages indexed, consolidating legacy URL noise, and making the four band pages, compare page, pricing page, and enquiry flow the strongest internal-link cluster on the site.

## Current Baseline

Pulled May 25, 2026.

| Area | Baseline |
|---|---:|
| GA4 last 28 days sessions | 21 |
| GA4 last 28 days views | 44 |
| GA4 last 28 days events | 139 |
| GA4 last 28 days key events | 9 |
| Organic Search share of sessions | 12 / 21 |
| Organic Search share of key events | 8 / 9 |
| GSC 28-day clicks | 6 |
| GSC 28-day impressions | 667 |
| GSC average CTR | 0.9% |
| GSC average position | 27.4 |
| Indexed pages | 126 |
| Not indexed pages | 313 |
| Sitemap discovered pages | 105 |

## What Was Done

### 1. Indexation

- Submitted GSC indexing requests for:
  - `/the-beat-boutique/`
  - `/sway-social/`
  - `/blacktye/`
  - `/compare-bands/`
  - `/wedding-band-showcases/`
- Refreshed the sitemap lastmod values to May 25, 2026.
- Raised sitemap priority for `/compare-bands/` and `/wedding-band-showcases/`.
- Verified the priority URLs are live, return HTTP 200, self-canonicalize, and use `index, follow`.
- Deployed the changes to Cloudflare Pages and re-submitted `https://musicangel.ie/sitemap.xml` in GSC. GSC confirmed "Sitemap submitted successfully" on May 25, 2026.

### 2. Working Page Protection

The indexed/visible pages become the first SEO money pages:

- `/`
- `/the-best-men/`
- `/first-dance-songs/`
- `/wedding-band-cost-ireland/`

Changes made:

- Homepage structured data now points the four `MusicGroup` entities at their canonical band profile URLs instead of homepage anchors.
- Sitewide/footer links now reinforce `Compare`, `Pricing`, `Showcases`, `Venues`, and enquiry routes.
- Generated venue and county pages now include related guide links back into the commercial cluster.

### 3. Legacy Noise Cleanup

GSC showed old URLs still receiving impressions. The cleanup direction is:

- Keep valuable old music/band paths and consolidate them into the current commercial journey.
- Return unrelated historical pages as gone/noindex rather than redirecting irrelevant intent into the homepage.

Changes made:

- `/portfolio/jakerandco/` now consolidates to `/compare-bands/`.
- `/wedding-bands-dublin` now normalizes to `/wedding-bands-dublin/`.
- `/difference-between-appointment-letters-and-employment-contracts/` now returns `410 Gone` with `X-Robots-Tag: noindex, noarchive` on Cloudflare Pages.
- Additional 404-bucket cleanup was completed:
  - `/my-booking/` redirects to `/#contact`.
  - `/meet-the-team/` redirects to `/about/`.
  - old legal-agreement spam URLs return `410 Gone` with `noindex, noarchive`.
  - old `/the-trophy-cabinet/press-praise/*` URLs return `410 Gone` with `noindex, noarchive`.
- Vercel fallback redirects were updated for the old portfolio and no-slash Dublin paths.

### 4. Internal Authority

The main commercial cluster is now:

- Band pages: `/the-beat-boutique/`, `/sway-social/`, `/the-best-men/`, `/blacktye/`
- Comparison: `/compare-bands/`
- Pricing: `/wedding-band-cost-ireland/`
- Proof/consideration: `/wedding-band-showcases/`, `/first-dance-songs/`
- Local authority: `/venues/`, venue pages, county pages
- Conversion: `/#contact` and page enquiry forms

This cluster is now reinforced across generated venue/county pages and important manual pages through footer and related-guide links.

### 5. GA4 Scorecard

The SEO scorecard should be key-event-led:

- Organic sessions
- Organic key events
- Session key-event rate
- `band_click`
- `contact_click`
- `form_start`
- `form_submit`
- `generate_lead`

Changes made:

- Weekly report script now pulls `keyEvents` and `sessionKeyEventRate` by channel.
- Weekly report script now pulls key events by page and event name.
- GA4 event wiring is already in place for the enquiry and contact journey.

Google's GA4 Data API exposes `keyEvents` and `sessionKeyEventRate` as standard metrics: https://developers.google.com/analytics/devguides/reporting/data/v1/api-schema

### 6. Ads While SEO Compounds

Ads are ready from a website/tracking perspective, but Google Ads remains blocked at billing/payment setup.

Current Ads state:

- Google Ads account shell exists for MusicAngel.
- GA4 property is linked.
- `generate_lead` is marked as a GA4 key event.
- CSV import assets are ready under `/google-ads/`.
- Direct Google Ads conversion labels can be pasted into `/js/google-ads-config.js` once Google Ads conversion actions can be created.

Do not enable spend until billing is complete and a test lead records in GA4/Google Ads.

## 30/60/90 Day Direction

### Days 1-30: Crawl And Conversion Foundation

- Monitor the deployed Cloudflare Pages changes.
- Recheck GSC sitemap processing after the May 25 re-submission.
- Monitor GSC validation jobs started May 25 for:
  - Crawled - currently not indexed
  - Discovered - currently not indexed
  - Not found (404)
- Recheck priority URL inspections 3-7 days after deploy.
- Watch submitted URLs move from "Discovered - currently not indexed" to crawled/indexed.
- Confirm `generate_lead` appears in GA4 after a real enquiry.
- Complete Google Ads billing, import `generate_lead`, and run the brand/band campaign only.

### Days 31-60: Commercial Expansion

- Improve copy depth and proof on the four band pages.
- Add stronger internal links from county pages to the four band pages and compare page based on GSC impressions.
- Expand the pricing page around package terms, travel, ceremony music, and DJ add-ons.
- Add search-term negatives from Ads into the SEO/Ads shared keyword hygiene list.

### Days 61-90: Authority And Scaling

- Build dedicated pages for terms showing impressions but low CTR or low position.
- Add venue-specific proof where MusicAngel has real experience, testimonials, or photos.
- Use GA4 key-event rate to decide which organic landing pages deserve Ads budget.
- Move Ads from manual CPC to conversion-led bidding only after enough primary lead volume exists.

## Board-Level KPIs

| KPI | Why it matters |
|---|---|
| Indexed priority pages | Without indexing, content quality cannot be judged. |
| Organic sessions | Measures whether visibility is compounding. |
| Organic key events | Measures commercial SEO, not vanity traffic. |
| Session key-event rate | Measures page/intent fit. |
| `generate_lead` count | Primary business outcome. |
| GSC clicks and impressions by page | Shows which pages Google trusts and which need work. |
| GSC legacy URL impressions | Should trend down after cleanup. |

## Risks

- Google may take days or weeks to crawl newly submitted pages.
- The current GA4 sample is small, so conversion-rate decisions should not be overfit yet.
- Ads cannot be fully launched until billing is completed in Google Ads.
- If production DNS drifts away from Cloudflare Pages, the `410 Gone` middleware and Cloudflare Functions behavior will not apply.

## Recommendation

Ship this implementation, re-submit the sitemap, then review GSC index coverage and GA4 key events one week later. The site is not ready for broad SEO judgment yet; it is ready for an indexation and conversion-measurement sprint.
