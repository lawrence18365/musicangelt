# Google Ads Deep Work Sprint Report - 2026-06-12

No live Google Ads changes were made. No deploy was run. No campaigns, budgets, bids, ads, keywords, conversion actions, or bid strategies were changed.

## 1. Executive Verdict

Ads stay live. Current economics remain workable: EUR 295.81 keyword-level spend, 6 Google Ads raw conversions, 7 verified paid leads including Andrea, working strict CPL about EUR 42.26. The next approved work is narrow: clean the pending change set, route Brand traffic to matching pages, and export Landing Pages by date.

## 2. What Changed After Latest Exports

| Item | New fact | Decision |
| --- | --- | --- |
| Raw conversions | Jun12 keyword export shows 6 raw Google Ads conversions | Use D1/Gmail as source of truth, but Ads undercount is less severe now |
| Brand & Bands | Now has 1 Ads conversion and 2 verified paid leads including Andrea | Keep and route better |
| top wedding bands ireland | 2 clicks / EUR 4.73 / 1 conversion | Reject as negative; protect/hold |
| County | EUR 101.88 / 75 clicks / 1 conversion in keyword export | Watch, do not pause |
| Landing pages | 140 clicks / EUR 232.19 in ignore rows over May22-Jun12 | Freshness unresolved; direct production redirect passes |

## 3. Repo Map

| File | Role |
| --- | --- |
| functions/_middleware.js | Cloudflare Pages middleware. Contains the ignore-strip redirect and private/report path guards. |
| functions/api/enquiry.js | Cloudflare Pages enquiry API; D1 lead source-of-truth write and email notifications. |
| functions/api/leads-export.js | Token-gated D1 CSV export. |
| api/enquiry.js | Legacy Vercel API fallback, not primary Cloudflare path. |
| js/site.js | Client attribution capture and form submission logic. |
| scripts/generate-google-ads-assets.js | Generates Google Ads CSV/source assets; account suffix only, no ignore source found. |
| google-ads/15-v9-high-confidence-negative-upload-20260609.csv | Old contaminated negative candidate; includes top wedding bands ireland and must not be posted. |
| google-ads/16-v9-campaign-level-exact-negative-upload-20260609.csv | Old contaminated campaign-negative candidate; includes top wedding bands ireland and must not be posted. |
| google-ads/18-v11-brand-final-url-routing-clean-20260612.csv | New clean Brand final URL candidate, not posted. |
| reports/2026-06-12-*.csv/md | Read-only analysis outputs from this sprint. |

## 4. `{ignore}` Root-Cause Findings

Verified facts:

- Repo/source search found `{ignore}` only in middleware, docs/reports, and the Landing Page export, not in current Search keyword or Search term exports.
- `functions/_middleware.js` already strips literal `{ignore}` and encoded `%7Bignore%7D` path segments and preserves the query string.
- Local middleware harness passed for root, county, compare, and band-page patterns.
- Production validation passed for 13 dirty URL cases using `node scripts/validate-ignore-redirects.js https://musicangel.ie`.
- The earlier 404 observation came from using curl without `-g`; curl treats `{ignore}` as URL glob syntax. Correct curl syntax is `curl -g`.

Conclusion: current production does protect users for literal and encoded ignore URLs. The unresolved problem is whether Google Ads is still generating fresh malformed landing-page report rows. That requires a date-specific Landing Pages export.

## 5. Code Fix Status

No middleware behavior fix was made because the existing code and production behavior passed when tested correctly. I added a validation script only: `scripts/validate-ignore-redirects.js`.

Verification run:

- `node --check functions/_middleware.js` passed.
- `node --check scripts/validate-ignore-redirects.js` passed.
- `node scripts/validate-ignore-redirects.js https://musicangel.ie` passed 13/13 cases.

## 6. Exact Files Changed / Created

| Path | Type | Purpose |
| --- | --- | --- |
| scripts/validate-ignore-redirects.js | created | Repeatable live/local validation for ignore redirects and query preservation |
| reports/2026-06-12-search-term-decision-table.csv | created | Search-term decisions from the Jun 12 export |
| reports/2026-06-12-keyword-performance-decision-table.csv | created | Keyword-level performance and action decisions from the Jun 12 export |
| reports/2026-06-12-google-ads-implementation-pack-clean.csv | created | Clean apply/hold/reject implementation pack |
| reports/2026-06-12-negative-keyword-safety-audit.csv | created | Overlap and duplicate safety audit for proposed negatives |
| reports/2026-06-12-brand-routing-validation.md | created | Brand final URL validation |
| google-ads/18-v11-brand-final-url-routing-clean-20260612.csv | created | Clean Brand & Bands final URL upload candidate, not posted |
| reports/2026-06-12-county-campaign-diagnosis.md | created | County campaign analysis and reallocation rule |
| reports/2026-06-12-search-term-opportunity-mining.md | created | Positive opportunity and exact-match notes |
| reports/2026-06-12-landing-page-report-analysis.md | created | Clean vs ignore landing-page analysis |
| reports/2026-06-12-google-ads-deep-work-sprint-report.md | created | This final operator report |

## 7. Clean Approved Google Ads Changes

These are approved from analysis but not posted.

| Change | Status | Reason |
| --- | --- | --- |
| Brand keyword final URLs to matching band pages | APPROVE_NOW | Brand & Bands has verified paid leads and clean target pages validate |
| Exact negative [top 10 wedding bands ireland] | APPROVE_NOW | No conversion / no verified paid lead; exact only |
| New non-duplicate competitor/info negatives in safety audit | APPROVE_NOW or HOLD_DUPLICATE_CHECK by row | Only apply rows marked APPROVE_NOW after checking existing shared list in Editor |

## 8. Rejected Google Ads Changes

- Reject `[top wedding bands ireland]` as a negative. It converted. Do not post `google-ads/15-v9-high-confidence-negative-upload-20260609.csv` or `google-ads/16-v9-campaign-level-exact-negative-upload-20260609.csv` as-is.

## 9. Held Changes

| Held change | Reason |
| --- | --- |
| County budget reduction | Wait until County spends another EUR 40-50 without a verified D1 paid lead |
| Pause County | Cork converted and most county intent is valid |
| Maximize Conversions / PMax / broad match | Too few verified leads and booked revenue not connected |
| Budget increase | Working CPL is promising but not stable enough to scale |

## 10. Negative Keyword Safety Audit Summary

The clean safety audit is in `reports/2026-06-12-negative-keyword-safety-audit.csv`. Key outcomes:

- `top wedding bands ireland`: REJECT. Converted.
- `top 10 wedding bands ireland`: APPROVE_NOW as exact only.
- Several competitor terms are HOLD_DUPLICATE_CHECK because the existing waste list already appears to cover them, for example `entourage`, `catch 22`, `blue moose`, `the favours`, and `hell for leather`.
- No proposed APPROVE_NOW negative overlaps a verified paid-lead keyword or owned MusicAngel band name.

## 11. Brand Routing Validation Summary

Clean target pages for Beat Boutique, Sway Social, The Best Men, and Blacktye all return 200, contain enquiry forms, load current attribution JS, and preserve UTMs/gclid in the requested URL. Use `google-ads/18-v11-brand-final-url-routing-clean-20260612.csv` if/when applying.

## 12. County Diagnosis

County weakness is mostly thin sample plus some query leakage, not an obvious broken campaign. Dublin, Galway, Kerry, Donegal, and Derry have spend without conversions. Cork converted. Keep County live but watch. Rule: if County spends another EUR 40-50 without a D1 paid lead, move EUR 1-2/day from County to Brand & Bands first, then Wedding Bands Ireland.

## 13. Search-Term Opportunities

Positive patterns to preserve: Brand/band-name intent, `wedding bands cork`, proven national intent such as `live wedding band ireland`, cost intent, and `wedding band with dj`. Consider exact `[the beat boutique]` later because the search term converted. Do not add broad match. Hold `top wedding bands ireland` and `superfly band ireland` until lead quality is known.

## 14. Landing-Page Findings

- Malformed ignore rows in Landing Pages export: 32 rows, 140 clicks, EUR 232.19.
- Clean landing rows: 10 rows, 38 clicks, EUR 63.60.
- Conversion data is not present in the Landing Page export, so do not infer CPL by landing page from that file. Use D1.
- Freshness remains unresolved because the export has no date column.

## 15. Required Next Export

Human instruction: in Google Ads, go to `Insights and reports → Landing pages`, set date range to `Today` only, then download CSV. If available, instead segment Landing pages by `Day` and download CSV for May 22-Jun 12. This proves whether ignore rows are still being generated fresh or only persist as historical/reporting residue.

## 16. Exact Next Command For Human

Do not post the old negative files. If applying Ads changes later, use the clean implementation pack and Brand routing candidate only after reviewing the rows marked APPROVE_NOW. Separately run:

```bash
node scripts/validate-ignore-redirects.js https://musicangel.ie
```

Then export Today-only Landing Pages from Google Ads.

## 17. Is It Safe To Apply The Google Ads Editor Change Set?

Not the existing Editor change set if it includes `[top wedding bands ireland]`. That is contaminated. It is safe to prepare a new clean change set from `reports/2026-06-12-google-ads-implementation-pack-clean.csv` and `google-ads/18-v11-brand-final-url-routing-clean-20260612.csv`, but review duplicate negatives first and post nothing until explicitly approved.

## 18. Deployment Checklist If Code Is Later Deployed

No deploy is needed for the current redirect behavior. If deploying future changes: start from clean branch/worktree, run `node --check functions/_middleware.js scripts/validate-ignore-redirects.js scripts/deployment-check.js`, run `node scripts/validate-ignore-redirects.js https://musicangel.ie` before and after deploy, deploy only from reviewed files, then rerun the Today-only Landing Pages export after paid clicks arrive.
