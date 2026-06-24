# Google Ads Quantitative Deep Dive - 2026-06-17

Initial analysis was read-only. After follow-up review, one narrow Google Ads change was applied: an ad-group exact negative for `[wedding saxophone player ireland]` in `Search - Wedding Bands Ireland` / `Wedding bands Ireland`.

Scope: Google Ads API activity from `2026-05-22` through `2026-06-17`. Spend activity starts `2026-05-27`.

Raw API exports are in `reports/google-ads-api-20260617/`.

## Executive Read

The account is working, but the right business denominator is D1 clean paid leads, not Google Ads conversions alone.

| Metric | Google Ads view | Clean D1 paid-lead view |
| --- | ---: | ---: |
| Spend | EUR 380.80 | EUR 380.80 |
| Clicks | 231 | 231 |
| Leads/conversions | 7 | 8 |
| CPA/CPL | EUR 54.40 | EUR 47.60 |

Interpretation: Google Ads is under-counting one confirmed paid lead, almost certainly in `Search - Brand & Bands`. Use Ads conversions for platform optimization, but use D1 for business CPL.

## Campaign Economics

| Campaign | Clicks | Cost | Ads conv. | D1 paid leads | Ads CPA | D1 CPL |
| --- | ---: | ---: | ---: | ---: | ---: | ---: |
| Search - Wedding Bands Ireland | 108 | EUR 225.16 | 4 | 4 | EUR 56.29 | EUR 56.29 |
| Search - County Wedding Bands | 99 | EUR 134.61 | 2 | 2 | EUR 67.31 | EUR 67.31 |
| Search - Brand & Bands | 24 | EUR 21.03 | 1 | 2 | EUR 21.03 | EUR 10.52 |

High-confidence read: Brand is the most efficient campaign on D1-confirmed leads, and it was being harmed by generic `/compare-bands/` keyword routing. That routing is now fixed.

Medium-confidence read: Wedding Bands Ireland and County are both viable, but neither has enough clean post-fix data to justify budget/bidding changes today.

## Trend

| Period | Clicks | Cost | Ads conv. | Ads CPA |
| --- | ---: | ---: | ---: | ---: |
| First 7 active days, May 27-Jun 2 | 63 | EUR 108.34 | 2 | EUR 54.17 |
| Middle 8 days, Jun 3-Jun 10 | 93 | EUR 151.66 | 3 | EUR 50.55 |
| Last 7 days, Jun 11-Jun 17 | 75 | EUR 120.80 | 2 | EUR 60.40 |

No clear deterioration. The last 7 days are slightly worse, but the sample is too small and includes the `{ignore}` tracking issue.

## Keyword Evidence

Strongest keyword-level evidence:

| Keyword | Match | Clicks | Cost | Ads conv. | D1 paid | D1 CPL |
| --- | --- | ---: | ---: | ---: | ---: | ---: |
| live wedding band ireland | Phrase | 20 | EUR 42.42 | 2 | 2 | EUR 21.21 |
| wedding band with dj | Phrase | 8 | EUR 13.85 | 1 | 1 | EUR 13.85 |
| wedding band prices ireland | Phrase | 18 | EUR 42.19 | 1 | 1 | EUR 42.19 |
| sway social wedding band | Exact | 8 | EUR 7.00 | 0 | 1 | EUR 7.00 |
| wedding band Donegal | Exact | 5 | EUR 6.93 | 1 | 1 | EUR 6.93 |
| wedding bands Cork | Exact | 4 | EUR 5.53 | 1 | 1 | EUR 5.53 |

Active keyword waste above EUR 10 with no Ads conversion and no D1 paid-lead evidence:

| Keyword | Match | Clicks | Cost |
| --- | --- | ---: | ---: |
| wedding band ireland | Phrase | 13 | EUR 27.89 |
| wedding bands ireland | Exact | 11 | EUR 23.12 |

Do not cut these immediately. They are core queries with only 24 combined clicks. Flag them for a stricter next checkpoint: if they spend another EUR 30-40 without a clean paid lead, pause or split them into tighter landing/ad copy tests.

## Search-Term Evidence

Converted search terms visible to Google Ads:

| Search term | Campaign/ad group | Clicks | Cost | Ads conv. |
| --- | --- | ---: | ---: | ---: |
| wedding bands cork | County / Cork | 4 | EUR 5.53 | 1 |
| top wedding bands ireland | Wedding Bands Ireland / Prices | 2 | EUR 4.73 | 1 |
| the beat boutique | Brand / Band names | 5 | EUR 4.41 | 1 |
| superfly band ireland | Wedding Bands Ireland / Generic | 1 | EUR 2.16 | 1 |

Important: do not negative `top wedding bands ireland` or `superfly band ireland` from this account based on surface-level instinct. Both have conversion evidence.

Search-term spend by status:

| Status | Cost |
| --- | ---: |
| Added terms | EUR 93.30 |
| Unadded search terms | EUR 111.11 |
| Excluded terms, historical spend | EUR 9.66 |

Applied narrow negative from this pull: `[wedding saxophone player ireland]` had 2 clicks, EUR 4.34, no conversion, and appears service-mismatched. It was added as an ad-group exact negative in `Search - Wedding Bands Ireland` / `Wedding bands Ireland` after `validateOnly` passed. `bog the donkey` already appears as excluded historical spend.

## Ad Group Evidence

| Ad group | Campaign | Clicks | Cost | Ads conv. | Ads CPA |
| --- | --- | ---: | ---: | ---: | ---: |
| Wedding bands Ireland | Wedding Bands Ireland | 62 | EUR 131.78 | 2 | EUR 65.89 |
| Wedding band prices | Wedding Bands Ireland | 27 | EUR 63.30 | 1 | EUR 63.30 |
| Band names | Brand & Bands | 23 | EUR 20.27 | 1 | EUR 20.27 |
| Band and DJ package | Wedding Bands Ireland | 11 | EUR 19.11 | 1 | EUR 19.11 |
| Cork | County | 13 | EUR 17.85 | 1 | EUR 17.85 |
| Donegal | County | 11 | EUR 15.06 | 1 | EUR 15.06 |
| Dublin | County | 15 | EUR 20.38 | 0 | n/a |
| Galway | County | 15 | EUR 20.27 | 0 | n/a |

County winners so far are Cork and Donegal. Dublin and Galway are watchlist items, not cuts yet.

## Match Type

| Match type | Clicks | Cost | Ads conv. | Ads CPA |
| --- | ---: | ---: | ---: | ---: |
| Phrase | 137 | EUR 249.79 | 5 | EUR 49.96 |
| Exact | 94 | EUR 131.01 | 2 | EUR 65.51 |

Phrase is not the enemy here. It is carrying most conversion volume. The safer move is exact negative pruning of mismatched search terms, not a broad exact-only switch today.

## Device, Time, Geo

Device:

| Device | Clicks | Cost | Ads conv. | Ads CPA |
| --- | ---: | ---: | ---: | ---: |
| Mobile | 203 | EUR 331.48 | 6 | EUR 55.25 |
| Desktop | 23 | EUR 42.04 | 1 | EUR 42.04 |
| Tablet | 5 | EUR 7.28 | 0 | n/a |

No device bid change. Mobile dominates volume and has acceptable CPA.

Time: all 7 Ads conversions happened between account hours `07` and `16`. The highest-cost zero-conversion hours are `14`, `11`, `13`, `17`, `18`, and `08`, but the sample is not large enough for ad-schedule cuts.

Geo:

| User country | Clicks | Cost | Ads conv. | Ads CPA |
| --- | ---: | ---: | ---: | ---: |
| Ireland | 206 | EUR 333.23 | 6 | EUR 55.54 |
| United Kingdom | 25 | EUR 47.58 | 1 | EUR 47.58 |

Campaign criteria target Ireland and Northern Ireland, and positive geo targeting is `PRESENCE`. Do not exclude UK broadly; the UK row is expected for Northern Ireland traffic.

## Impression Share And Quality

| Campaign | Search IS | Budget lost IS | Rank lost IS |
| --- | ---: | ---: | ---: |
| Wedding Bands Ireland | 10.5% | 84.9% | 4.7% |
| County Wedding Bands | 22.6% | 62.3% | 15.1% |
| Brand & Bands | 33.3% | 11.6% | 55.1% |

Interpretation:

- Generic and county campaigns are primarily budget-limited.
- Brand is primarily rank-limited, not budget-limited.
- Even though budget-lost impression share is high, do not raise budgets yet. The measurement cleanup happened today, so new post-cleanup data matters more than historical impression-share pressure.

Landing-page quality is the bigger structural issue:

| Landing-page quality bucket | Clicks | Cost | Ads conv. | Ads CPA |
| --- | ---: | ---: | ---: | ---: |
| Below average | 175 | EUR 281.68 | 5 | EUR 56.34 |
| Average | 13 | EUR 25.44 | 0 | n/a |
| Unknown | 43 | EUR 73.69 | 2 | EUR 36.84 |

Most spend sits on keywords where Google rates landing-page experience below average. That points to page relevance/content/form experience work before bidding aggression.

## Decision

Do not change budgets or bidding today. One narrow negative was changed today.

Safe next actions:

1. Recheck fresh post-cleanup landing-page clicks on June 18 and confirm `{ignore}` disappears.
2. Keep Brand routing live and monitor Brand D1 CPL separately from Google Ads CPA, because Ads missed one confirmed paid lead.
3. Watch whether the new exact negative suppresses saxophone-only traffic without harming wedding-band query volume.
4. Do landing-page quality work on the highest-spend paths: generic homepage/wedding-bands flow, wedding-band-cost page, and county pages.
5. Watch these thresholds:
   - `wedding band ireland` phrase + `wedding bands ireland` exact: if another EUR 30-40 spends with zero clean D1 paid leads, pause or isolate.
   - Dublin + Galway county ad groups: if each reaches about EUR 35-40 with zero clean D1 paid leads, tighten or pause.
   - Brand: if post-routing CPL stays under EUR 25, it becomes the best candidate for a careful budget increase.
