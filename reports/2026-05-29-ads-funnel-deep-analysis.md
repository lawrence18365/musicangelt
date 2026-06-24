# MusicAngel Ads + Funnel Deep Analysis

Date: 2026-05-29

## Executive Read

The account is live but still in the earliest learning stage. The latest UI read before the first paid enquiry was 13 clicks, 95 impressions, EUR23.34 spend, EUR1.80 average CPC, and 0 conversions across 2026-05-22 to 2026-05-29. That was not enough click volume to judge conversion rate yet, especially because the first clicks were partly contaminated by the `{ignore}` landing-page issue.

After that UI read, a first confirmed paid lead arrived on 2026-05-29 at 13:02 Dublin time. It came from Google CPC attribution for the keyword `wedding bands cork`. This is a strong early signal that the county campaign can produce real enquiries, but the click path needs one live UI audit because the first landing page was `/wedding-band-cost-ireland/` before the user moved through `/wedding-bands-cork/` and submitted on `/the-beat-boutique/#enquiry`.

The biggest concrete leak found was not CPC. It was landing-page safety: Google Ads reported paid clicks landing on literal `{ignore}` URL paths, and those paths returned 404 before the Cloudflare middleware fix. That is now mitigated at the website layer: `{ignore}` path segments redirect to the clean URL and preserve UTM parameters plus `gclid`.

## What Is Solid

- Live budget is inside the approved cap: EUR20/day active, with `Search - Wedding Music Guides` paused.
- Ads are attracting high-intent clicks rather than broad low-quality traffic: early CTR is 13.68%.
- Core paid landing pages now resolve cleanly with tracking parameters preserved.
- Core pages are indexable and canonicalized correctly.
- Internal link crawl is clean: 1,849 internal link references checked, 0 broken.
- Canonical audit is clean: 106 HTML files checked, 106 correct.
- Enquiry backend is configured on Cloudflare Pages: `RESEND_API_KEY`, `RESEND_FROM`, and `NOTIFY_TO` secrets are present.
- API CORS, validation, and honeypot behavior are responding correctly.
- A real paid lead reached the internal notification recipients with Google Ads attribution attached.
- Lighthouse is strong enough that speed is not the current conversion blocker:
  - Mobile average performance: 96/100.
  - Desktop average performance: 91/100.
  - SEO score: 100/100 across all 10 tested pages.
  - CLS: effectively 0 across tested pages.

## What Was Fixed / Hardened

- Cloudflare Pages middleware now redirects literal `/{ignore}` and `/%7Bignore%7D` path segments to clean URLs.
- Live redirect tests passed for:
  - `/wedding-band-cost-ireland/%7Bignore%7D?...`
  - `/wedding-bands-dublin/%7Bignore%7D?...`
  - `/wedding-bands-cork/%7Bignore%7D?...`
  - `/wedding-bands-sligo/%7Bignore%7D?...`
  - root `/%7Bignore%7D?...`
- Google Ads upload artifacts were hardened:
  - `scripts/generate-google-ads-assets.js` now keeps ad-level final URL suffix blank.
  - `google-ads/04-responsive-search-ads.csv` now has 0 ad-level suffix values.
  - `google-ads/12-band-vs-dj-responsive-search-ad.csv` now has 0 ad-level suffix values.
  - `google-ads/05a-negative-keyword-list.csv` now includes competitor/band-name exclusions seen in early search terms.
  - `google-ads/ACCOUNT_STATUS.md` now reflects the actual EUR20/day live budget split and early performance.

## Remaining Risks

- The live Google Ads account may still have ad-level suffix values from the original upload. The website redirect now protects users, but the cleanest Ads-side fix is still to remove any ad-level/ad-group-level/keyword-level suffixes and keep tracking at account level only.
- Google Ads conversion measurement currently depends on GA4-imported key events, not direct Google Ads conversion labels. That is acceptable for launch, but a direct Google Ads lead conversion tag would give cleaner diagnostics if we can retrieve the AW conversion ID and label.
- The live Google Ads `generate_lead` value was last observed at EUR500. Recommendation is to reduce it to EUR250 until real close-rate data exists. The local website source has been aligned to send `generate_lead` value 250.
- Customer auto-reply remains a risk while `RESEND_FROM` is not a branded `@musicangel.ie` sender. Internal lead delivery works, but the current guard is expected to skip customer auto-replies from the fallback sender.
- The first confirmed paid lead's captured path raises a Google Ads UI question: why did the `wedding bands cork` click first land on `/wedding-band-cost-ireland/` when the local Cork keyword/ad source points to `/wedding-bands-cork/`? The leading possibilities are a sitelink click or live URL settings that differ from source.
- Search terms must keep being watched daily. Competitor names already appeared and one competitor click already cost money before negatives were added.

## Interpretation Of CPC

The early average CPC is not insane for Irish wedding-band commercial search. The costly click terms are commercial: `wedding bands cork prices`, `wedding bands ireland`, `rock wedding bands ireland`, county wedding band terms, and one competitor click already excluded. The CPC becomes a problem only if qualified clicks fail to produce enquiries after the landing URL and form path are confirmed.

At 13 clicks total, 0 conversions is not yet statistically meaningful. The correct response is not to panic-cut spend; it is to protect the click path, exclude bad terms, keep budget capped, and get a clean conversion test.

## Next Actions

1. In Google Ads UI, inspect campaign `23890295743`, ad group `194701052777`, and creative `810584875823` for the first paid lead. Confirm whether the click was a sitelink click or a main-ad click, and verify the final URL.
2. In Google Ads UI, audit URL options at ad/ad-group/keyword level and remove any nonblank final URL suffix below account level.
3. Keep account-level suffix or rely on auto-tagging, but do not duplicate suffixes across hierarchy levels.
4. Submit one real controlled test enquiry from a paid-style URL, using a clearly labelled test name, to confirm:
   - internal email reaches Jo and Lawrence,
   - attribution fields are included,
   - auto-reply looks correct,
   - GA4 records `generate_lead`,
   - Google Ads imports the conversion.
5. Continue daily search-term review for the first seven live days.
6. Do not raise above EUR20/day until at least one clean lead is recorded or enough click volume proves the funnel needs copy/form changes.

## Sources / References

- Google Ads final URL suffix levels: https://support.google.com/google-ads/answer/9054021
- Google Ads ValueTrack and `{ignore}` behavior: https://support.google.com/google-ads/answer/6305348
- GA4 auto-tagging benefits: https://support.google.com/analytics/answer/10723328
