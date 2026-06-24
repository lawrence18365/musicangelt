# Google Ads Current Quant - 2026-06-19

Scope: live Google Ads API read on `2026-06-19`, account timezone `Europe/Dublin`. Data includes `2026-05-22` through `2026-06-19`; `2026-06-19` is an in-progress partial day.

No Google Ads changes were made in this pass.

Update after the initial read: D1 live access recovered on retry. A new `2026-06-19` clean Google Ads lead is now present in D1. The D1 count of 10 is a source-of-truth operating count, not 10 equally hard-verified Ads conversions.

## Executive Read

The ads are generating paid-attributed leads, but they have not produced a booked wedding yet. Do not interpret the current CPL as proof of ROAS. Do not make broad budget or bidding changes yet.

| View | Clicks | Cost | Conversions/leads | CPL/CPA |
| --- | ---: | ---: | ---: | ---: |
| Google Ads launch-to-date, through partial Jun 19 | 248 | EUR 406.94 | 8 Ads conversions | EUR 50.87 |
| Google Ads through completed Jun 18 | 244 | EUR 400.82 | 8 Ads conversions | EUR 50.10 |
| D1 clean Google Ads leads, Jun 18 snapshot | n/a | EUR 400.82 matched spend | 9 clean paid leads | EUR 44.54 |
| D1 clean Google Ads leads, through partial Jun 19 | n/a | EUR 406.94 matched spend | 10 D1-attributed clean paid leads | EUR 40.69 |

Interpretation:

- The June 18 lead that D1 saw is now also visible in Google Ads as a `MusicAngel (web) generate_lead` conversion. The earlier zero-conversion same-day read was conversion lag.
- Brand is the clear winner so far: 29 clicks, EUR 25.19 spend, 2 Ads conversions, EUR 12.60 CPA.
- Generic and county campaigns are still viable, but they are not yet efficient enough to scale aggressively.
- D1 live access initially failed with Cloudflare API `code: 7403`, then succeeded on a minimal retry. D1 is current through the new Jun 19 lead.
- D1 has zero booked rows from the current paid-search spend. Most live sales outcome fields are still blank, so CPL is only a diagnostic until leads are marked qualified, quoted, or booked.

## Campaign Economics

| Campaign | Clicks | Cost | Ads conv. | Avg CPC | CVR | Ads CPA |
| --- | ---: | ---: | ---: | ---: | ---: | ---: |
| Search - Wedding Bands Ireland | 115 | EUR 240.18 | 4 | EUR 2.09 | 3.5% | EUR 60.05 |
| Search - County Wedding Bands | 104 | EUR 141.57 | 2 | EUR 1.36 | 1.9% | EUR 70.79 |
| Search - Brand & Bands | 29 | EUR 25.19 | 2 | EUR 0.87 | 6.9% | EUR 12.60 |
| Total | 248 | EUR 406.94 | 8 | EUR 1.64 | 3.2% | EUR 50.87 |

## Post-Cleanup Window

Window: `2026-06-18` through partial `2026-06-19`.

| Campaign | Clicks | Cost | Ads conv. | CPA |
| --- | ---: | ---: | ---: | ---: |
| Search - Wedding Bands Ireland | 7 | EUR 15.02 | 0 | n/a |
| Search - County Wedding Bands | 5 | EUR 6.96 | 0 | n/a |
| Search - Brand & Bands | 5 | EUR 4.16 | 1 | EUR 4.16 |
| Total | 17 | EUR 26.14 | 1 | EUR 26.14 |

Completed-day trend improved after the June 18 Brand conversion landed: the last 7 completed days, `2026-06-12` through `2026-06-18`, show 76 clicks, EUR 121.35 spend, 3 Ads conversions, and EUR 40.45 CPA. Sample size is still tiny.

## Keyword Evidence

Strongest current winners:

| Keyword | Match | Clicks | Cost | Ads conv. | Ads CPA |
| --- | --- | ---: | ---: | ---: | ---: |
| live wedding band ireland | Phrase | 24 | EUR 51.12 | 2 | EUR 25.56 |
| the beat boutique wedding band | Phrase | 9 | EUR 7.73 | 2 | EUR 3.87 |
| wedding band with dj | Phrase | 8 | EUR 13.85 | 1 | EUR 13.85 |
| wedding band prices ireland | Phrase | 18 | EUR 42.19 | 1 | EUR 42.19 |
| wedding band Donegal | Exact | 5 | EUR 6.93 | 1 | EUR 6.93 |
| wedding bands Cork | Exact | 4 | EUR 5.53 | 1 | EUR 5.53 |

Active watchlist with no Ads conversion:

| Item | Clicks | Cost | Why it matters |
| --- | ---: | ---: | --- |
| `wedding band ireland` phrase | 13 | EUR 27.89 | Core generic, but no Ads conversion yet. |
| `wedding bands ireland` exact | 11 | EUR 23.12 | Core generic, but no Ads conversion yet. |
| Dublin ad group | 16 | EUR 21.75 | Biggest county spend with zero conversion. |
| Galway ad group | 15 | EUR 20.27 | Second biggest county zero-conversion spend. |
| Derry ad group | 12 | EUR 16.38 | Still below hard-cut threshold. |
| Kerry ad group | 10 | EUR 13.22 | One fresh mismatched `wedding singer kerry` click. |

These rows are diagnostic only. The current lead-classification gate does not authorize keyword cuts, even where Ads-only conversion data looks weak.

## Search Terms

Converted visible terms now include:

| Search term | Clicks | Cost | Ads conv. | Note |
| --- | ---: | ---: | ---: | --- |
| the beat boutique | 7 | EUR 5.97 | 2 | Brand routing looks justified. |
| wedding bands cork | 4 | EUR 5.53 | 1 | County winner. |
| top wedding bands ireland | 2 | EUR 4.73 | 1 | Prior conversion evidence; no action authorized from this report. |
| superfly band ireland | 1 | EUR 2.16 | 1 | Prior conversion evidence; no action authorized from this report. |

Fresh post-cleanup non-converting terms are small sample. They are diagnostic only:

| Search term | Clicks | Cost | Read |
| --- | ---: | ---: | --- |
| fusion band northern ireland | 1 | EUR 2.18 | Relevant enough to watch. |
| traditional irish music wedding band | 1 | EUR 2.16 | Could be ceremony/trad intent; wait. |
| wedding singer kerry | 1 | EUR 1.39 | Service mismatch candidate if it repeats. |
| wedding dj and saxophone | 1 | EUR 1.59 | Sax/DJ mismatch candidate if it repeats. |

## Landing Page And Tracking

The `{ignore}` landing-page report is still polluted after cleanup:

| Window | Clicks | Cost | Ads conv. | `{ignore}` clicks | `{ignore}` cost |
| --- | ---: | ---: | ---: | ---: | ---: |
| Jun 18 through partial Jun 19 | 17 | EUR 26.14 | 1 | 13 | EUR 19.02 |

Configuration checks from the live API are clean:

- Customer final URL suffix is the expected UTM suffix and does not include `{ignore}`.
- Campaign and ad-group URL options are blank.
- Live ads have no ad-level final URL suffix and no `{ignore}` final URLs.
- Brand keyword final URLs are correctly routed to band pages.
- Campaign sitelink asset URLs checked clean.

Production safety check is also good: representative `{ignore}` URLs 302 to the clean page and preserve UTM/gclid, then return 200. So this is currently a reporting/diagnostics problem more than a user-facing broken-click problem.

## Impression Share

| Campaign | Search IS | Budget lost IS | Rank lost IS | Read |
| --- | ---: | ---: | ---: | --- |
| Search - Wedding Bands Ireland | 10.6% | 84.7% | 4.7% | Budget-limited, but not efficient enough to raise yet. |
| Search - County Wedding Bands | 23.0% | 61.4% | 15.7% | Budget-limited, but county winners/losers need more separation. |
| Search - Brand & Bands | 35.2% | 10.8% | 54.0% | Rank-limited more than budget-limited, but no action is authorized from this report. |

## Unit Economics

Using the Ads view, CPL is EUR 50.87. At a EUR 2,450 package and 50% gross margin, break-even lead-to-booking rate is about 4.2%.

At the D1 10-lead view through partial Jun 19, CPL is about EUR 40.69 and break-even lead-to-booking rate is about 3.3%.

Those rates are scenario math only. Actual paid lead-to-booking rate is currently 0% because no booked wedding is recorded from the spend so far. The next useful business metric is cost per qualified lead and cost per quote, then cost per booking.

## Verification Tiers

The 10 D1-attributed paid leads are not all the same evidence quality:

| Evidence tier | Count | Read |
| --- | ---: | --- |
| Live lead with Google click ID plus campaign/keyword captured | 5 | Strongest D1 evidence. |
| Live lead with Google click ID but missing campaign/keyword fields | 1 | Paid-attributed, but campaign assignment uncertain. This is the Jun 19 `/sway-social/` lead. |
| Historical Gmail/admin backfill without click ID | 4 | High-confidence operating rows, but weaker than live click-ID rows. |

Google Ads itself shows 8 `MusicAngel (web) generate_lead` conversions through this partial window. That is the strict Ads-platform count. D1 shows 10 because it includes one historical paid lead that Ads did not show by conversion date, plus the fresh Jun 19 lead that has not appeared as an Ads conversion yet.

Sales outcome status is not yet strong enough for optimization: D1 currently has no booked paid leads, and the live site leads mostly have blank `lead_quality`, `quote_status`, and `booking_status` fields.

## Paid Lead Classification Gate

Classification timestamp: `2026-06-19T14:34:33Z`.

D1 now has explicit classification fields for the paid-lead gate:

- `lifecycle_status`
- `attribution_bucket`
- `contact_attempt_count`
- `contact_attempts_json`
- `last_contact_at`

All 10 current clean paid leads were classified. Contact attempts are recorded as `0; []` because D1 has no outreach timestamp data yet. That means "no attempts recorded in D1", not proof that no one replied outside D1.

| lead_id | created_at | age_days | attribution_bucket | landing_page | status | lost_reason | contact_attempts | last_contact_at | notes |
| --- | --- | ---: | --- | --- | --- | --- | --- | --- | --- |
| `paid-001` | `2026-05-29T12:00:00Z` | 21.1 | `non_brand` | `/the-beat-boutique/` | `pending` | n/a | `0; []` | none recorded | Just over 21 days, but D1 has no negative signal or recorded outreach outcome. |
| `paid-002` | `2026-06-02T12:00:00Z` | 17.1 | `non_brand` | `/the-best-men/` | `pending` | n/a | `0; []` | none recorded | Under 21 days; no negative signal. |
| `paid-003` | `2026-06-04T12:00:00Z` | 15.1 | `brand` | `/sway-social/` | `pending` | n/a | `0; []` | none recorded | Under 21 days; brand/band-name query. |
| `paid-004` | `2026-06-05T12:00:00Z` | 14.1 | `non_brand` | `/` | `pending` | n/a | `0; []` | none recorded | Under 21 days; no negative signal. |
| `MA-20260607-893B769A98` | `2026-06-07T08:17:52.385Z` | 12.3 | `non_brand` | `/` | `pending` | n/a | `0; []` | none recorded | Live paid lead with no recorded downstream outcome. |
| `MA-20260609-A463C51797` | `2026-06-09T15:32:13.174Z` | 10.0 | `non_brand` | `/` | `pending` | n/a | `0; []` | none recorded | Live paid lead with no recorded downstream outcome. |
| `MA-20260612-MANUAL-ANDREA` | `2026-06-12T14:13:04Z` | 7.0 | `brand` | `/the-beat-boutique/` | `pending` | n/a | `0; []` | none recorded | Under 21 days; brand/band-name query. |
| `MA-20260617-9637FB1F1B` | `2026-06-17T09:19:02.601Z` | 2.2 | `non_brand` | `/` | `pending` | n/a | `0; []` | none recorded | Very young county lead. |
| `MA-20260618-65936C9BC2` | `2026-06-18T18:54:30.334Z` | 0.8 | `brand` | `/the-beat-boutique/` | `pending` | n/a | `0; []` | none recorded | Very young brand/band-name lead. |
| `MA-20260619-6A5F13D011` | `2026-06-19T14:08:24.262Z` | 0.0 | `paid_unknown` | `/sway-social/` | `pending` | n/a | `0; []` | none recorded | Paid-attributed by click IDs, but campaign and keyword were not captured. |

Summary:

| View | Count |
| --- | ---: |
| Paid leads classified | 10 |
| `pending` | 10 |
| `qualified` | 0 |
| `quoted` | 0 |
| `booked` | 0 |
| `lost` | 0 |
| `unreachable` | 0 |
| `non_brand` | 6 |
| `brand` | 3 |
| `paid_unknown` | 1 |

Routing conclusion: this points to insufficient maturity plus a sales-process instrumentation gap. It does not yet prove a traffic-quality problem, an offer/pricing problem, or an Ads failure. The data also does not support optimizing the account from the zero-booking figure alone, because 9 of 10 leads are under 21 days old and the one older lead has no recorded negative/outreach outcome.

The next required action is to record real follow-up evidence in D1: contact timestamps, whether the lead was qualified, whether a quote was sent, whether it booked, and any lost reason. Until that exists, CPL remains diagnostic only.

## Brand Incrementality

This is the main strategic caution. Brand and band-name traffic is cheap and converting, but some of it may not be incremental: users searching `the beat boutique`, `sway social`, or another band name may have contacted anyway via organic search or direct navigation.

The newest Jun 19 D1 lead has Google click IDs and counts as paid, but the UTM campaign/ad group/keyword fields are blank. It landed and submitted on `/sway-social/`, with the referrer carrying the same Google click IDs from the homepage. That makes it paid-attributable, but not cleanly assignable to Brand versus non-Brand from D1 alone.

For operating decisions, report both:

| Denominator | Leads | CPL |
| --- | ---: | ---: |
| All D1-attributed clean Google Ads leads | 10 | EUR 40.69 |
| Non-brand clean D1 Google Ads leads, using generic + county spend and excluding known band-name leads | 6 | EUR 63.63 |

Interpretation: paid search is still producing leads even if brand/band-name leads are excluded, but the non-brand CPL is closer to EUR 64, not EUR 41. This denominator split is for reporting discipline only; no budget decision is authorized from it yet.

## Decision

No Google Ads optimization decision is authorized from this pass.

The gating condition is lead classification and routing, and the classified cohort routes to `pending` / insufficient maturity with missing sales-process instrumentation. Keep the account under the existing live-and-capped policy, but do not change bids, budgets, match types, negatives, or bidding strategy from this report.

Re-check the paid-lead cohort after real contact attempts and outcomes are recorded, or after the young leads mature past the 21-day rule.
