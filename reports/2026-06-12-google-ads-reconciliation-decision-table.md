# MusicAngel Google Ads Reconciliation And Decision Table - 2026-06-12

## Verified Facts

- Date range in Google Ads UI: 2026-05-22 to 2026-06-10.
- Google Ads UI: 156 clicks, 1.14K impressions, EUR 1.67 average CPC, EUR 260.00 cost, 5 raw leads.
- Verified source-of-truth paid leads through 2026-06-10: 6.
- Verified source-of-truth paid leads including Andrea on 2026-06-12: 7.
- Conservative same-window CPL: EUR 260.00 / 6 = EUR 43.33.
- Google Ads raw leads undercount verified paid leads by 1 for the same window, or are using different conversion/date logic.
- Google Ads Campaigns table is currently blocked by the Google Ads "Turn off ad blockers" overlay, so raw Google Ads leads by campaign/ad group/keyword could not be extracted safely from the UI.
- No live Google Ads changes were made in this pass.

## Campaign Reconciliation

| Campaign | Cost | Clicks | CPC | Raw Google Ads leads | Verified paid leads | Test rows removed | Real paid CPL | Attribution proof | Read |
|---|---:|---:|---:|---:|---:|---:|---:|---|---|
| Search - Wedding Bands Ireland | EUR 157.26 | 75 | EUR 2.10 | unavailable by row; account total = 5 | 4 | account-level D1 tests excluded | EUR 39.32 | gclid + google/cpc UTMs present on all 4 | Keep. Main lead engine. |
| Search - County Wedding Bands | EUR 89.54 | 66 | EUR 1.36 | unavailable by row; account total = 5 | 1 | account-level D1 tests excluded | EUR 89.54 | gclid + google/cpc UTMs present on Kathy | Watch. Weakest active spend. |
| Search - Brand & Bands | EUR 13.20 | 15 | EUR 0.88 | unavailable by row; account total = 5 | 1 through Jun 10; 2 incl. Andrea | account-level D1 tests excluded | EUR 13.20 through Jun 10 | gclid + google/cpc UTMs present on David and Andrea | Keep and improve routing. |
| Search - Venue Wedding Bands | EUR 0.00 | 0 | n/a | 0 visible | 0 | none | n/a | none | Do not prioritize. |
| Account total | EUR 260.00 | 156 | EUR 1.67 | 5 | 6 through Jun 10 | 3 D1 tests through Jun 10 excluded | EUR 43.33 | verified paid markers on all counted paid leads | Keep live; do not scale yet. |

## Lead-Level Reconciliation

| Lead | Date | Campaign | Ad group | Keyword | Match | Final/submitted page evidence | Paid markers |
|---|---|---|---|---|---|---|---|
| Kathy / The Beat Boutique | 2026-05-29 | Search - County Wedding Bands | Cork | wedding bands cork | exact | submitted on /the-beat-boutique/ | gclid + google/cpc UTMs |
| Susan / The Best Men | 2026-06-02 | Search - Wedding Bands Ireland | Wedding bands Ireland | live wedding band ireland | phrase | submitted on /the-best-men/ | gclid + google/cpc UTMs |
| David Mc Gee / Sway Social | 2026-06-04 | Search - Brand & Bands | Band names | sway social wedding band | exact | submitted on /sway-social/ | gclid + google/cpc UTMs |
| Louisa | 2026-06-05 | Search - Wedding Bands Ireland | Wedding band prices | wedding band prices ireland | phrase | submitted on /wedding-band-cost-ireland/ | gclid + google/cpc UTMs |
| Karen / The Best Men | 2026-06-07 | Search - Wedding Bands Ireland | Wedding bands Ireland | live wedding band ireland | phrase | landed on homepage, submitted on /the-best-men/ | gclid + google/cpc UTMs |
| Donal | 2026-06-09 | Search - Wedding Bands Ireland | Band and DJ package | wedding band with dj | phrase | landed on /wedding-band-and-dj-package/, submitted from homepage | gclid + google/cpc UTMs |
| Andrea / The Beat Boutique | 2026-06-12 | Search - Brand & Bands | Band names | the beat boutique wedding band | phrase | submitted on /the-beat-boutique/ | gclid + google/cpc UTMs |

## Ad Group / Keyword Notes

| Level | Row | Cost / clicks source | Verified paid leads | Real paid CPL | Landing / final URL note | Decision |
|---|---|---|---:|---:|---|---|
| Ad group | Wedding Bands Ireland > Wedding bands Ireland | EUR 89.83 visible in Google Ads overview biggest changes | 2 | EUR 44.92 | current ad/final URL points to homepage; users then choose band pages | Keep. |
| Ad group | Wedding Bands Ireland > Wedding band prices | EUR 46.94 visible in Google Ads overview biggest changes | 1 | EUR 46.94 | /wedding-band-cost-ireland/ | Keep. |
| Ad group | Wedding Bands Ireland > Band and DJ package | EUR 12.22 visible in Google Ads overview biggest changes | 1 | EUR 12.22 | /wedding-band-and-dj-package/ | Keep. Do not negative "dj" broadly. |
| Ad group | County > Cork | EUR 12.31 visible in Google Ads overview biggest changes | 1 | EUR 12.31 at ad-group level; campaign CPL EUR 89.54 | /wedding-bands-cork/ but lead submitted on band page | Keep Cork. Watch County overall. |
| Ad group | County > Dublin | EUR 15.13 visible in Google Ads overview biggest changes | 0 | n/a | /wedding-bands-dublin/ | Watch; no immediate pause from small sample. |
| Ad group | Brand & Bands > Band names | EUR 12.44 visible in Google Ads overview biggest changes | 1 through Jun 10; 2 incl. Andrea | EUR 12.44 through Jun 10 | current band-name keywords point to /compare-bands/ | Change routing to band-specific URLs. |
| Keyword | "live wedding band ireland" | EUR 23.76 / 11 clicks visible in Google Ads overview keyword card | 2 | EUR 11.88 | final URL homepage; submitted on The Best Men | Keep. |
| Keyword | "wedding band prices ireland" | EUR 30.59 / 13 clicks visible in Google Ads overview keyword card | 1 | EUR 30.59 | /wedding-band-cost-ireland/ | Keep. |
| Keyword | "wedding band with dj" | EUR 8.76 / 5 clicks in latest export | 1 | EUR 8.76 | /wedding-band-and-dj-package/ | Keep. |
| Keyword | "sway social wedding band" | EUR 2.62 / 3 clicks in latest export | 1 | EUR 2.62 | currently compare/band path depending row; lead submitted on /sway-social/ | Improve routing. |
| Keyword | "the beat boutique wedding band" | EUR 2.67 / 3 clicks in latest export, plus Andrea later | 1 incl. Andrea | current spend after Jun 10 unknown | route to /the-beat-boutique/ | Improve routing. |
| Search term | top wedding bands ireland | EUR 4.73 / 2 clicks in latest export | 0 | n/a | research/listicle intent | Add exact negative only. |
| Search term | top 10 wedding bands ireland | EUR 3.74 / 2 clicks in latest export | 0 | n/a | research/listicle intent | Add exact negative only. |

## Decision Table

| Bucket | Items | Decision |
|---|---|---|
| Keep | Search - Wedding Bands Ireland; Brand & Bands; live wedding band ireland; wedding band prices ireland; wedding band with dj; Cork county terms | These have verified paid lead signal. |
| Change now, after approval | Add exact negatives for [top wedding bands ireland] and [top 10 wedding bands ireland]; route Brand & Bands band-name keywords directly to matching band pages | Low-risk, narrow, evidence-backed. |
| Watch | Search - County Wedding Bands, especially non-Cork county spend | If County spends another EUR 40-50 without a verified D1 paid lead, reduce County by EUR 1-2/day and reallocate within existing budget. |
| Do not touch | Total budget; bidding strategy; Maximize Conversions; broad match; live ad copy; conversion actions; "dj" terms broadly | Not enough clean conversion volume or booking data. |
| Data needed before deciding | Campaign/ad group/keyword raw Google Ads conversions; conversion timestamp reconciliation; fresh Landing Pages report after v7; exact spend through Jun 12 | Required before any stronger optimization or scaling decision. |

## Candidate Files

- Negative candidate already prepared: `google-ads/16-v9-campaign-level-exact-negative-upload-20260609.csv`
- Brand routing candidate prepared: `google-ads/17-v10-brand-keyword-final-url-candidate-20260612.csv`
