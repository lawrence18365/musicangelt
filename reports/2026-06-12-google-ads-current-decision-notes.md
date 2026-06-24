# MusicAngel Google Ads Decision Notes - 2026-06-12

## Current Facts

- Confirmed paid leads now known: 7.
- D1 real Google Ads leads since source-of-truth launch: Karen, Donal, Andrea.
- Pre-D1 confirmed Google Ads leads: Kathy, Susan, David Mc Gee, Louisa.
- Latest exact exported Google Ads spend available locally is through 2026-06-10: EUR 238.77.
- Placeholder strict CPL using latest available spend and corrected lead count: EUR 238.77 / 7 = EUR 34.11.
- Exact current CPL requires a fresh Google Ads spend export through today.

## Campaign Signal

| Campaign | Latest known spend | Latest known clicks | Confirmed paid lead signal | Read |
|---|---:|---:|---:|---|
| Search - Brand & Bands | EUR 11.40 | 13 | David + Andrea | Strongest economics; keep live. |
| Search - Wedding Bands Ireland | EUR 144.75 | 69 | Susan, Louisa, Karen, Donal | Main lead engine; keep live. |
| Search - County Wedding Bands | EUR 82.62 | 61 | Kathy | Watch closely; first budget-reduction candidate if it spends another EUR 40-50 without a D1 paid lead. |
| Search - Venue Wedding Bands | EUR 0.00 | 0 | none | Harmless while it spends zero; do not prioritize. |

## Safe Next Changes

1. Add exact negatives for listicle/research intent:
   - [top wedding bands ireland]
   - [top 10 wedding bands ireland]

   These are currently accepted locally in Google Ads Editor but not posted because Editor validation created campaign-level errors and disabled posting.

2. Consider keyword-level final URL improvements for Brand & Bands:
   - Beat Boutique terms -> /the-beat-boutique/
   - Sway Social terms -> /sway-social/
   - The Best Men terms -> /the-best-men/
   - Blacktye terms -> /blacktye/

   Prepared candidate upload: google-ads/17-v10-brand-keyword-final-url-candidate-20260612.csv

## Do Not Do Yet

- Do not pause the whole account.
- Do not increase total budget.
- Do not switch to Maximize Conversions.
- Do not add broad match.
- Do not broadly negative "dj"; Donal came through "wedding band with dj".
- Do not trust Google Ads conversion count alone; D1 is now the lead source of truth.

## Open Blockers

- Need fresh Google Ads export through today for exact current spend and CPL.
- Need Google Ads UI/API access for conversion timestamp reconciliation.
- Need Google Ads Editor validation error resolved before posting any local Editor changes.
- Need fresh post-v7 Landing Pages report to confirm no new {ignore} rows.
