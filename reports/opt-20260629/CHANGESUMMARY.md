# MusicAngel Google Ads — Safe Optimization Pass

Executed: 2026-06-29 (UTC) via `scripts/google-ads-safe-ops.js` (service-account API, REST `:mutate`).
Account: `873-216-2982` (customer `8732162982`). All mutations ran **validateOnly first → clean → applied**.
Authorization: explicit user instruction ("run this end to end"). Overrides the standing
"no-optimization-until-leads-mature" gate in prior quant reports.

## Guardrails honoured
- Northern Ireland targeting **left intact** (business serves NI).
- Bidding strategy unchanged (**Manual CPC** on all campaigns).
- No campaign daily budget changed; **total live budget still €20/day** (WBI €10 + County €6 + Brand €2 + Venue €2; Guides €5 paused).
- No paused campaign enabled; no new campaigns; conversion actions untouched.
- Nothing that produced a conversion was paused or bid-cut.

## Changes applied

| # | Object | Change | Before → After | Validate | Apply |
|---|---|---|---|---|---|
| 1 | Shared set `MusicAngel Core Exclusions` (12099313337) | +4 PHRASE negatives: `traffic band`, `evoke band`, `the wilful`, `saxophone player` | 99 → 103 members | clean | ✓ |
| 3 | Ad group `Wedding band prices` (194701048297) | +18 PHRASE ad-group negatives (15 county names + `best wedding bands`, `top wedding bands`, `top 10 wedding bands`) to stop close-variant absorption of county/generic queries | 0 → 18 negatives | clean | ✓ |
| 4 | 4 head-term keywords in `Wedding bands Ireland` (194701048257): `wedding band ireland` (PH/EX, QS3), `wedding bands ireland` (PH/EX, QS5) | max CPC −35% | €2.20 → €1.43 each | clean | ✓ |
| 5 | Brand ad groups `MusicAngel brand` (194701048057) & `Band names` (194701048217) | raise max CPC to capture 50% rank-lost IS (CPA ~€12) | €0.80 / €0.90 → €1.80 | clean | ✓ |

## Deliberately NOT done
- **NI exclusion** — removed from plan; business serves NI.
- **`string quartet` negative** — site offers string trio / harpist for drinks reception, so quartet searchers are serviceable/upsell. Logged as **watch**, not negated.
- **`jazz` negative** — likely a genre covered; not negated.
- **`bog the donkey`, `entourage`** competitor negatives — already PHRASE in shared lists; their spend predated the lists. Skipped as dupes.
- **Venue campaign** — diagnosed only (see e1-venue-diagnosis.md), no mutation.
- **Budgets / bidding strategy** — untouched per guardrails.

## Estimated effect
- Removes the close-variant leak path that made `Wedding band prices` the #2 spender at QS4 for 1 conversion → expect QS recovery and lower CPC on the price keyword.
- Throttles ~€104-of-spend bare head term (0 conversions, QS3-5) without pausing it (reversible test).
- Brand (cheapest converting path, €12 CPA) can now win more of its 50% rank-lost impressions within its existing €2/day.
- New negatives stop competitor-name + solo-sax leakage (~€20/cycle of 0-conversion spend).

## Snapshots
- Before: `a0-campaign-perf.json`, `a1-keyword-state.json`, `a2-*-negatives.json`, `a2-shared-criteria.json`, `a3-search-terms.json`
- Apply responses: `op{1,3,4,5}-apply-response.json`
- Rollback: see `ROLLBACK.md`
