# Google Ads Consultant Change Log - 2026-06-06

Timestamp: 2026-06-06 04:45 PDT / 2026-06-06 Google Ads account time not changed.

## Baseline Recorded

- Date range checked in Google Ads UI: 2026-05-22 through 2026-06-05.
- Spend: EUR 163.85.
- Clicks: 97.
- Impressions: 704.
- CTR: 13.78%.
- Avg CPC: EUR 1.69.
- Google Ads conversion actions: 3 total `generate_lead` conversions.
- Confirmed paid-search leads in Gmail with `gclid`: 3.
- Strict paid-search CPL: EUR 54.62.

Campaign baseline:

- `Search - Wedding Bands Ireland`: EUR 99.63, 47 clicks, 13.86% CTR.
- `Search - County Wedding Bands`: EUR 58.03, 43 clicks, 13.61% CTR.
- `Search - Brand & Bands`: EUR 6.18, 7 clicks, 14.29% CTR.
- `Search - Venue Wedding Bands`: EUR 0.00, 0 clicks.
- `Search - Wedding Music Guides`: paused, not live-spending.

## Live Account Changes Made

1. Created shared negative keyword list:
   - Name: `MusicAngel Waste Exclusions 2026-06-06`.
   - Keywords: 36 phrase-match negatives.
   - Applied to campaigns: 5 of 5.
   - Reason: block visible and high-risk waste from jewellery/ring intent, DJ-only intent, and competitor-band leakage without touching budgets, bids, ads, positive keywords, conversion actions, or campaign status.

2. Updated local lead pipeline artifact:
   - File: `google-ads/LEAD_PIPELINE_TEMPLATE.csv`.
   - Added `paid-003` for the third confirmed paid lead with `gclid`.
   - Kept non-attributed leads out of the paid-search count.

## Negative Keyword Additions

All added as phrase negatives:

```text
"wedding rings"
"wedding bands for men"
"mens wedding bands"
"men's wedding bands"
"engagement ring"
"bridal jewellery"
"gold wedding bands"
"mens rings"
"wedding dj northern ireland"
"wedding djs northern ireland"
"dj saxophone wedding"
"dj saxophone"
"saxophone dj"
"saxophone wedding"
"sax wedding"
"dj only"
"jo petit"
"jo petit and the dream band"
"whos eddie"
"who's eddie"
"footloose band"
"the kickbacks"
"the pearls"
"the strobes"
"the brightsides band"
"the favours"
"acoustra band"
"celtic knights"
"celtic knights wedding band"
"amazing apples"
"green means go"
"divine invention"
"entourage"
"catch 22"
"blue moose"
"hell for leather"
```

Owned MusicAngel band names were not negatived: `The Best Men`, `The Beat Boutique`, `Sway Social`, `Blacktye`.

## Tracking And URL Verification

- Auto-tagging: enabled.
- Account final URL suffix: clean UTM suffix present.
- Campaign-level tracking templates and suffixes: blank in Google Ads Editor database.
- Ad-group-level tracking templates and suffixes: blank in Google Ads Editor database.
- Keyword-level tracking templates and suffixes: blank in Google Ads Editor database.
- Sitelink-level tracking templates and suffixes: blank in Google Ads Editor database.
- Current `{ignore}` search in refreshed Editor DB: zero relevant hits.
- Middleware test: `/wedding-bands-cork/%7Bignore%7D?...&gclid=test` returns 302 to clean `/wedding-bands-cork/` while preserving UTMs and `gclid`, then 200.

Remaining hygiene note:

- 93 responsive search ads still carry a clean duplicate ad-level final URL suffix. It does not contain `{ignore}` and does not break tracking, but the preferred architecture remains account-level final URL suffix only. Do not bulk-edit these blindly unless prepared for possible ad review.

## Conversion Verification

- `MusicAngel (web) generate_lead`: GA4 source, Active, Primary, count One, 90-day click window, included in account-level goals, 3 conversions, EUR 1,000 all-conversion value.
- `MusicAngel (web) contact_click`: GA4 source, No recent conversions, Secondary, count One, 90-day click window, not included in account-level goals.
- No conversion-action changes were made because primary/secondary status is already correct for bidding safety.

## Blockers

- Google Ads shows a `Turn off ad blockers` overlay on some reporting tables, including Landing pages and Negative keywords. The Exclusion lists table was still usable enough to create and apply the new shared negative list.
- Landing pages post-cleanup verification could not be completed through Chrome because the table body was blocked. Use the same date-range test after fresh paid clicks land.

## Follow-Up Watchlist

- Verify Landing pages for post-cleanup paid clicks only; historical `{ignore}` rows should not be used as live-regression proof.
- Check new search terms daily for competitor leakage and jewellery/DJ-only leakage.
- Count paid leads only when `gclid` or reliable `utm_source=google` / `utm_medium=cpc` attribution is present.
- Do not increase budget or switch to Maximize Conversions until tracking remains clean and paid lead volume is stronger.
