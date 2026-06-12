# Google Ads Editor Optimization Pass - 2026-06-09

Timestamp: 2026-06-10T02:02:43Z

## Scope

Read-only review of the local Google Ads Editor account database, Google Ads overview CSV export, and D1 lead records. No live Google Ads changes were posted in this pass.

## Data Used

- Google Ads Editor local account database: `8732162982`
- Overview CSV export date range: 2026-05-22 to 2026-06-10
- D1 lead source of truth: `musicangel_leads`

## Editor Status

Google Ads Editor is installed and the account structure is readable locally.

The local Editor performance stats tables are empty, so campaign/ad group/keyword performance decisions used the downloaded Google Ads CSV export rather than Editor stats.

Current Editor campaign structure:

| Campaign | Status | Daily budget |
|---|---:|---:|
| Search - Wedding Bands Ireland | Enabled | EUR 10 |
| Search - County Wedding Bands | Enabled | EUR 6 |
| Search - Brand & Bands | Enabled | EUR 2 |
| Search - Venue Wedding Bands | Enabled | EUR 2 |
| Search - Wedding Music Guides | Paused | EUR 5 |

## Estimated D1 Lead Economics

| Campaign | Spend | Clicks | Confirmed paid leads | Estimated CPL |
|---|---:|---:|---:|---:|
| Search - Wedding Bands Ireland | EUR 144.75 | 69 | 4 | EUR 36.19 |
| Search - County Wedding Bands | EUR 82.62 | 61 | 1 | EUR 82.62 |
| Search - Brand & Bands | EUR 11.40 | 13 | 1 | EUR 11.40 |
| Search - Venue Wedding Bands | EUR 0.00 | 0 | 0 | n/a |

Total: EUR 238.77 spend, 143 clicks, 6 confirmed paid leads, estimated strict CPL EUR 39.80.

## Recommended Safe Upload

Prepared Editor import file:

- `google-ads/15-v9-high-confidence-negative-upload-20260609.csv`

Adds only two exact-match negatives to the existing shared waste list:

- `[top wedding bands ireland]`
- `[top 10 wedding bands ireland]`

Reason: these are low-intent research/listicle searches, spent EUR 8.47 combined, generated 4 clicks, and have no confirmed D1 leads. Exact match keeps the block narrow and avoids blocking broader high-intent wedding-band searches.

## Changes Deliberately Not Made

- No budget change.
- No bidding strategy change.
- No broad match additions.
- No positive keyword changes.
- No ad copy edits.
- No campaign pauses.
- No conversion-action changes.
- No negative added for `wedding band with dj`, because a real D1 Google Ads lead came through that intent.
- No County campaign pause, because it has one confirmed paid lead and more data is needed before cutting it.

## Current Strategy

Keep the account live at the current cap. The account is generating confirmed paid leads at a commercially workable CPL.

The first meaningful budget decision should wait until either:

- County spends another EUR 40-50 without another D1 paid lead, or
- Wedding Bands Ireland continues producing D1 paid leads under roughly EUR 50 CPL, or
- New bad search terms appear with clear waste.

If that happens, reduce County budget and move spend toward Wedding Bands Ireland. Do not scale total spend yet.

## Next Data Needed

For a stronger decision, download Google Ads Editor statistics or UI CSVs with conversions by campaign/ad group:

- Campaign
- Ad group
- Cost
- Clicks
- Conversions
- Cost / conversion
- Conversion rate

Then reconcile against D1 lead IDs.
