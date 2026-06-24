# Google Ads Account Status - MusicAngel

Updated: 2026-06-02

## Google Ads Account

- Google Ads account ID: `873-216-2982`
- Business name: `MusicAngel`
- Website: `https://musicangel.ie/`
- Billing country: Ireland
- Time zone: `(GMT+01:00) Ireland Time`
- Currency: `Euro (EUR €)`
- Billing: completed in the Google Ads UI.
- Promo observed during onboarding: spend `€400.00`, get `€400.00` in Ads credits. Spend-by date shown in UI: `2026-07-24`.
- Current spend state: four campaigns are enabled. `Search - Wedding Music Guides` remains paused. The Campaigns table showed account total live budget `€20.00/day`, and the earlier "None of your ads are running" warning was gone after the ad group/ad layer recheck.
- Budget ceiling: current live campaign budgets are redistributed inside the approved `€20/day` cap. Do not enable the paused guide campaign or raise total live budget without a fresh explicit decision.

## 2026-06-02 System Scorecard Update

Live Google Ads all-time window checked: `2026-05-22` through `2026-06-02`.

| Metric | Value |
| --- | ---: |
| Spend | `€91.55` |
| Clicks | 53 |
| Impressions | 398 |
| Average CPC | `€1.73` |
| Google Ads conversions | 2 |
| Verified paid enquiries | 2 |
| Cost per paid enquiry | `€45.78` |

Interpretation: paid search is viable enough to keep running, but not clean enough to scale yet. At the current CPL and a `€2,450` package floor, the economics are attractive if even 1 in 10-20 paid leads books. The current bottleneck is no structured lead-to-booking tracker and prior phrase-match query leakage.

Live corrective changes made on 2026-06-02:

- The shared negative list `MusicAngel Core Exclusions` was expanded to 99 live items and remains applied to all 5 campaigns.
- Six high-spend, zero-conversion phrase keywords were paused live:
  - `"wedding bands ireland"`
  - `"Dublin wedding bands"`
  - `"wedding bands ireland prices"`
  - `"irish wedding bands"`
  - `"wedding band Limerick"`
  - `"best wedding bands ireland"`
- Proven/converting routes were left active, including exact Cork and `"live wedding band ireland"`.
- Local keyword generation was tightened: `scripts/generate-google-ads-assets.js` now emits exact-only keywords for broad generic, pricing, package, venue, and county groups. Regenerated keyword artifacts dropped from 756 keywords to 405 keywords.

Current operating decision: keep Ads running inside the existing capped budget. Do not raise budget until at least 5 paid enquiries are recorded, competitor-band waste is below 10% of visible search-term spend, and at least one paid lead has moved to a serious sales stage such as reply, quote, hold, or booking.

## Campaign Safety Settings

- Status: four campaigns enabled; one campaign paused.
- Ad groups: the Ad groups page showed `1 - 93 of 93`; visible rows were `Enabled` with no blocking status.
- Networks: Google Search only.
- Language: English.
- Locations: Ireland and Northern Ireland, United Kingdom.
- Location option: Presence only, meaning people in or regularly in the included locations. This is set on all five campaigns.
- AI Max for Search campaigns: off on the campaign checked in the UI.

## Linked Properties

- Google Analytics property linked to Google Ads:
  - Property: `MusicAngel`
  - Property ID: `537964782`
  - Web stream label shown in GA4: `MusicAngel Website`

## Google Ads Conversion Actions

| Conversion action | Source | Optimization | Count | Value | Click window | Account goal |
| --- | --- | --- | --- | --- | --- | --- |
| `MusicAngel (web) generate_lead` | GA4 web | Primary | One | `€500` | 90 days | Included |
| `MusicAngel (web) contact_click` | GA4 web | Secondary | One | `€25` | 90 days | Not included |

Not imported into Google Ads: `band_click`, `form_submit`, and `purchase`.

Recommended next UI change: lower `MusicAngel (web) generate_lead` from `€500` to `€250` until real enquiry-to-booking close rate is known. The website source now emits `generate_lead` with value `250`; the live Google Ads conversion action still needs to be checked and updated in the UI.

## Tracking Settings

- Auto-tagging: on.
- Account-level final URL suffix:

```text
utm_source=google&utm_medium=cpc&utm_campaign={campaignid}&utm_adgroup={adgroupid}&utm_content={creative}&utm_term={keyword}&utm_matchtype={matchtype}&utm_network={network}
```

- URL hierarchy cleanup note: use the account-level final URL suffix only. Ad-level, ad-group-level, keyword-level, and sitelink-level final URL suffixes should stay blank unless there is a deliberate tracking reason. The local CSV generator and RSA artifacts have been updated so future bulk uploads do not reintroduce ad-level suffixes.
- Landing-page safety fix: Google Ads landing-page reporting showed `{ignore}` paths receiving clicks. Direct requests to those literal paths previously returned 404. Cloudflare Pages middleware now redirects `/{ignore}` and `/%7Bignore%7D` path segments to the clean equivalent URL while preserving paid query parameters and `gclid`.
- 2026-06-02 UI recheck: the Landing pages report still shows historical/live rows with literal `{ignore}` URLs. Largest rows observed were root `{ignore}` with 13 clicks / `€28.07`, Cork `{ignore}` with 4 clicks / `€5.48`, Dublin `{ignore}` with 3 clicks / `€4.10`, cost-guide `{ignore}` with 3 clicks / `€7.12`, and Limerick `{ignore}` with 3 clicks / `€4.14`. The site redirect protects visitors, but the live Ads account still needs URL-option cleanup or corrected ad/asset re-upload so reporting is clean.

GA4 key events should be treated as the SEO and paid-search scorecard: organic and paid traffic should be judged against `band_click`, `contact_click`, `form_start`, `form_submit`, and `generate_lead`, with `generate_lead` as the primary paid optimization event.

## Current Early Performance

Checked in the Google Ads UI for 2026-05-22 through 2026-05-29.

| Campaign | Status | Budget | Clicks | Impr. | CTR | Avg CPC | Cost | Conv. |
| --- | --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| `Search - Wedding Bands Ireland` | Enabled | `€10/day` | 7 | 53 | 13.21% | `€2.21` | `€15.46` | 0 |
| `Search - County Wedding Bands` | Enabled | `€6/day` | 6 | 41 | 14.63% | `€1.31` | `€7.88` | 0 |
| `Search - Brand & Bands` | Enabled | `€2/day` | 0 | 1 | 0.00% | `€0.00` | `€0.00` | 0 |
| `Search - Venue Wedding Bands` | Enabled | `€2/day` | 0 | 0 | 0.00% | `€0.00` | `€0.00` | 0 |
| `Search - Wedding Music Guides` | Paused | `€5/day` | 0 | 0 | 0.00% | `€0.00` | `€0.00` | 0 |

Account total at that UI check: 13 clicks, 95 impressions, 13.68% CTR, `€1.80` average CPC, `€23.34` spend, 0 conversions. This was still too early for conversion judgement, and the first clicks were contaminated by the `{ignore}` landing-page issue before the redirect fix.

## First Paid Lead Investigation

The first confirmed paid lead arrived on 2026-05-29 at 13:02 Dublin time. Do not store the customer's personal details in repo documentation.

- Paid attribution: `utm_source=google`, `utm_medium=cpc`, campaign ID `23890295743`, ad group ID `194701052777`, creative ID `810584875823`, keyword `wedding bands cork`, match type `e`, and Google click IDs present.
- Path captured in the enquiry email: first landing page `/wedding-band-cost-ireland/`, intermediate referrer `/wedding-bands-cork/`, submit page `/the-beat-boutique/#enquiry`.
- Local source-of-truth Ads CSVs map the Cork exact/phrase keywords to `/wedding-bands-cork/`, so the live UI still needs to be checked for whether this was a sitelink click or whether a lower-level final URL/final URL suffix differs from the local source.
- The lead reached the internal notification recipients. The customer auto-reply is still expected to be skipped while `RESEND_FROM` is not a branded `@musicangel.ie` sender.

## 2026-06-02 Additional UI Checks

- Landing pages: `{ignore}` URLs still appear in Google Ads reporting. This is the main remaining Ads-side cleanup issue.
- Locations: Ireland produced both conversions. Northern Ireland spent `€4.85` with 0 conversions, too little to exclude yet.
- Campaign settings: Manual CPC, Google Search only, English, Ireland/Northern Ireland, all-day schedule, all devices.
- Recommendations: ignore budget increase and Target Impression Share recommendations until cleaned traffic produces at least 5 paid enquiries.

## Bulk Uploads Applied

- `01-campaigns.csv`: 5 campaigns applied.
- `02-ad-groups.csv`: 93 ad groups applied.
- `03-keywords.csv`: 756 keywords applied.
- `04-responsive-search-ads.csv`: 93 responsive search ads applied.
- `06-sitelinks-upload.csv`: 30 sitelinks applied.
- `07-callouts-upload.csv`: 24 callouts applied. The working row type is `Callout`; `Callout extension` was rejected by the current Google Ads UI.

The CSV files are source-of-truth upload artifacts, not a guarantee of current live status. Current live status is the UI-verified state in this document.

## Assets Added In UI

- Structured snippet, account level:
  - Asset: `Service catalog: Wedding Bands, Band And DJ, Ceremony Music, Drinks Reception, Showcases, First Dance`
  - Status observed: `Eligible`
- Price asset, account level:
  - `Evening Band` from `€2,450`
  - `Ceremony Music` from `€300`
  - `Drinks Reception` from `€300`
  - `Dedicated DJ` from `€400`
  - Status observed: `Pending Under review`
- Call asset, account level:
  - Phone: `087 231 0001`
  - Status observed: `Pending Under review`
- Image assets:
  - Upload not available in the current account UI. Google Ads did not expose `Image` in the Create asset menu.
  - Keep the prepared square and landscape image files ready. Google's Search image asset help says the `Image` creation option appears only after eligibility requirements are met, including an account open for at least 60 days, active campaigns, active text ads, and Search spend in the last 30 days greater than 0.

## Negative Keywords

The shared negative list `MusicAngel Core Exclusions` was created manually in the UI and applied to all five campaigns.

The live shared list now contains 99 exclusions. The local source contains 83 shared-list exclusions: 28 generic waste terms plus 55 competitor/band-name phrase exclusions from search-term reviews, including `waxies`, `harlequin`, `buachaills`, `perfect day wedding band`, `ian hendricks`, `panic animal`, `pat fitz`, `twist of fate`, `the stars band`, `rockhill ramblers`, `superfly band`, `up to 90 band`, `bog the donkey`, `pyramid band`, `southbound band`, `j90 band`, `last call band`, and `the wilful band`.

Do not apply the old failed preview rows for `05a-negative-keyword-list.csv` or `05-campaign-negative-keywords.csv`. Also do not apply the remaining pending preview for `05b-negative-list-campaign-associations.csv`; the list is already attached manually.

## Campaigns In Account

| Campaign | Planned daily budget | Current status |
| --- | ---: | --- |
| `Search - Brand & Bands` | `€2.00/day` | Enabled |
| `Search - Wedding Music Guides` | `€5.00/day` | Paused |
| `Search - Wedding Bands Ireland` | `€10.00/day` | Enabled |
| `Search - County Wedding Bands` | `€6.00/day` | Enabled |
| `Search - Venue Wedding Bands` | `€2.00/day` | Enabled |

Configured average daily budgets total `€25/day`, but the paused guide campaign is not spending. Current planned live average is `€20/day`.

## Launch Direction

Launch approval was received on 2026-05-27 for the recommended `€20/day` start. Keep `Search - Wedding Music Guides` paused until the first search-term and conversion review. Do not raise above `€20/day` without a fresh explicit decision.

Google Ads campaign budgets are average daily budgets, not hard same-day caps. Google says actual daily spend can vary and may be up to 2x the average daily budget for most campaigns, while staying within the monthly spending limit.

For the first seven live days, check search terms, spend, CPC, enquiries, and GA4 imported conversions daily. Add negatives aggressively before increasing budget or switching bidding strategy.
