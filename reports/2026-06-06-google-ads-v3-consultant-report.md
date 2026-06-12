# Google Ads Consultant Report V3 - MusicAngel

Timestamp: 2026-06-06 05:04 PDT

## Executive Summary

Health score: 8/10.

The account moved from 7/10 to 8/10 because the previous negative-keyword cleanup was QA'd, lead attribution was corrected, future lead emails now capture device data, conversion actions were verified, and booked-revenue tracking templates were created.

Not 10/10 yet because advertiser verification is incomplete, post-cleanup Landing Pages data is not yet available for fresh clicks, and no booked-wedding revenue is tracked.

## QA Of Previous Cleanup

- `MusicAngel Waste Exclusions 2026-06-06` exists in local source artifacts with 36 phrase-match negatives.
- Live UI showed the list with 36 keywords and 5 campaign associations.
- It does not block owned band names: The Best Men, The Beat Boutique, Sway Social, Blacktye.
- It does not block core commercial terms: wedding bands ireland, wedding bands cork, live wedding band ireland, wedding band cost ireland, wedding entertainment ireland.
- No corrections were required.

## Attribution Truth Table

- Strict confirmed Google Ads leads: 4.
- Strict CPL: EUR 163.85 / 4 = EUR 40.96.
- Qualified paid leads: 4.
- Qualified paid CPL: EUR 40.96.
- Booked paid leads: 0 recorded.
- Revenue from paid leads: not known.
- ROAS: not calculated because no booked revenue is recorded.

Confirmed Google Ads:

- Kathy / The Beat Boutique / `wedding bands cork` / exact / campaign `23890295743`.
- Susan / The Best Men / `live wedding band ireland` / phrase / campaign `23890295740`.
- David Mc Gee / Sway Social / `sway social wedding band` / exact / campaign `23880653751`.
- Louisa / pricing query / `wedding band prices ireland` / phrase / campaign `23890295740`.

Not counted as Google Ads:

- Chloe: organic Google search attribution, no paid marker.
- Mary: unknown/direct/internal trail, no paid marker.
- Formspark TBB leads reviewed: One Fab Day/email, organic Google, WeddingsOnline, direct/unknown; no `gclid`.
- Internal Codex/test leads: excluded.

Raw email and phone values were inspected in Gmail but not stored in repo artifacts.

## Tracking Status

- Auto-tagging: enabled.
- Account final URL suffix: clean UTM suffix present.
- `generate_lead`: Primary, active, 3 Google Ads conversions in UI for May 22-Jun 5.
- Attribution truth mismatch: Gmail proves 4 paid leads with paid markers, while Google Ads reports 3 conversions. Treat this as an early conversion-recording/backfill gap and use the lead truth table as the commercial source of truth.
- `contact_click`: Secondary, not included in account-level goals.
- Future MusicAngel lead emails now include device, viewport, and user agent in addition to existing attribution fields.
- Existing emails already include `gclid`, UTMs, source page, referrer, first landing page, landing page, and attribution source where captured.

## Landing-Page And URL Status

- Current Editor DB: zero `{ignore}` hits in campaign/ad group/keyword/ad/sitelink URL fields.
- Landing Pages report became readable enough to confirm the historical root `{ignore}` row: 21 clicks, EUR 45.29 for May 22-Jun 5.
- Visible day segmentation showed the malformed row had clicks on May 28 and May 29 in that historical window.
- Post-cleanup verification is still pending because the current Google Ads reporting window shown ended Jun 5, before the latest cleanup.
- Middleware test remains good: malformed `%7Bignore%7D` URL redirects to the clean page and preserves UTMs plus `gclid`.

## Campaign Setup Status

- Budgets unchanged.
- Bidding unchanged: Manual CPC.
- Search Partners off.
- Display Network off.
- Presence targeting remains selected in downloaded campaign data.
- Broad match campaign setting off.
- AI Max off.
- Final URL expansion off.
- No campaigns, ads, assets, keywords, conversion actions, or bidding strategies were deleted or paused.

## Ad And Asset Review

- No live ads/assets were changed.
- Draft improvements were prepared in `google-ads/DRAFT_RSA_AND_ASSET_IMPROVEMENTS_20260606.md`.
- Publishing new/edited RSAs or assets may trigger ad review and should wait for approval.
- Google Ads recommends image/logo-related improvements, but logo access depends on advertiser verification.

## Advertiser Verification

- Status: incomplete.
- Google Ads recommendation says completing advertiser verification unlocks logos in Search ads.
- Google states most advertisers take about 30 minutes to submit required information and review usually takes 3-5 business days.
- Required action: account owner should click `Get started` and submit correct legal/business details and documents.
- I did not submit verification because legal details must not be guessed.

## Changes Made

Live Google Ads:

- None in v3 beyond QA; the prior v2 negative list remained intact.

Website/tracking:

- Added `device`, `viewport`, and `user_agent` capture to `js/site.js`.
- Added those fields to Cloudflare and Vercel enquiry emails.

Files updated:

- `google-ads/LEAD_PIPELINE_TEMPLATE.csv`
- `google-ads/GOOGLE_ADS_LEAD_TRUTH_TABLE_20260606.csv`
- `google-ads/OFFLINE_BOOKED_WEDDING_IMPORT_PLAN.md`
- `google-ads/OFFLINE_BOOKED_WEDDING_UPLOAD_TEMPLATE.csv`
- `google-ads/DRAFT_RSA_AND_ASSET_IMPROVEMENTS_20260606.md`
- `google-ads/SEVEN_DAY_WATCHLIST_20260606.md`
- `reports/2026-06-06-google-ads-v3-consultant-report.md`
- `js/site.js`
- `functions/api/enquiry.js`
- `api/enquiry.js`

## Blockers

- Advertiser verification requires owner/legal business information.
- Post-cleanup Landing Pages proof requires new paid clicks after Jun 6 data appears.
- Booked-revenue tracking cannot calculate ROAS until booked status and value are entered for real leads.
- Google Ads conversion count is one behind strict Gmail attribution, so Ads UI conversions alone undercount confirmed paid enquiries in this launch window.

## Next Action Recommendation

Tomorrow:

- Check Landing Pages for Jun 6+ after fresh paid clicks. Search `ignore`.
- Check search terms for leakage after the new negative list.
- Complete advertiser verification.

Wait 7 days:

- Judge whether the new negative list reduced jewellery, DJ-only, and competitor leakage.
- Recalculate strict CPL and qualified CPL.

Wait for more conversion data:

- Do not switch to Maximize Conversions until conversion volume is materially stronger and lead quality remains good.
- Do not raise budget until booked/replied/quoted outcomes support scaling.
