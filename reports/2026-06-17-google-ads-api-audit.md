# Google Ads API Audit - 2026-06-17

Live Google Ads changes made after user approval:

- Cleared `ad.final_url_suffix` on 93 ads via the Google Ads API.
- Routed 12 `Search - Brand & Bands` / `Band names` keyword final URLs from `/compare-bands/` to the matching band pages after `validateOnly` passed.
- Added one ad-group exact negative keyword after `validateOnly`: `[wedding saxophone player ireland]` in `Search - Wedding Bands Ireland` / `Wedding bands Ireland`.
- No campaigns, budgets, bids, keyword text/match types/statuses, ad statuses, conversion actions, broad/phrase negatives, or bid strategies were changed.

## Access

- API access works for customer `8732162982` (`MusicAngel`).
- The service account has direct access to the advertiser account.
- `GOOGLE_ADS_LOGIN_CUSTOMER_ID` is intentionally blank in `.env.google-ads.local`; sending the manager ID caused `USER_PERMISSION_DENIED`.

## Performance Snapshot

Date window: `2026-05-22` through `2026-06-17`.

| Campaign | Status | Budget | Clicks | Cost | Ads conversions | Ads CPA |
| --- | --- | ---: | ---: | ---: | ---: | ---: |
| Search - Wedding Bands Ireland | ENABLED | EUR 10/day | 108 | EUR 225.16 | 4 | EUR 56.29 |
| Search - County Wedding Bands | ENABLED | EUR 6/day | 99 | EUR 134.61 | 2 | EUR 67.31 |
| Search - Brand & Bands | ENABLED | EUR 2/day | 24 | EUR 21.03 | 1 | EUR 21.03 |
| Search - Wedding Music Guides | PAUSED | EUR 5/day | 0 | EUR 0.00 | 0 | n/a |
| Search - Venue Wedding Bands | ENABLED | EUR 2/day | 0 | EUR 0.00 | 0 | n/a |

Account total in this API snapshot: EUR 380.80 spend, 231 clicks, 7 Ads conversions.

## Landing Page Issue

The `{ignore}` landing-page problem is still fresh, not just historical.

Window: `2026-06-12` through `2026-06-17`.

| Landing URL bucket | Clicks | Cost | Ads conversions |
| --- | ---: | ---: | ---: |
| URLs containing `{ignore}` | 51 | EUR 84.63 | 1 |
| Clean URLs | 12 | EUR 16.70 | 1 |

By-day pull shows `{ignore}` rows on every date from `2026-06-12` through `2026-06-17`.

## URL Settings Root Cause

Account-level URL settings are clean:

- `customer.tracking_url_template`: blank
- `customer.final_url_suffix`: `utm_source=google&utm_medium=cpc&utm_campaign={campaignid}&utm_adgroup={adgroupid}&utm_content={creative}&utm_term={keyword}&utm_matchtype={matchtype}&utm_network={network}`

Campaign, ad group, and keyword tracking templates/final URL suffixes are blank.

Pre-fix live ads were not aligned with the local source-of-truth:

- 93 of 93 ads have an ad-level final URL suffix.
- 0 ads have a tracking template.
- 0 ads contain literal `{ignore}` in final URLs, tracking templates, or suffixes.

The live cleanup cleared ad-level final URL suffixes on all 93 ads while keeping the account-level final URL suffix in place.

Post-fix verification:

- 93 of 93 ads still have final URLs.
- 93 of 93 ads are still enabled.
- 0 of 93 ads have an ad-level final URL suffix.
- 0 ads have a tracking template.
- Account-level final URL suffix remains set.

Same-day landing-page pull after cleanup, for `2026-06-17`, still shows 8 of 10 clicks on `{ignore}` rows. Treat this as lag/pre-fix traffic until fresh clicks arrive after the cleanup.

Follow-up checks:

- `2026-06-18`: 13 clicks, 10 clicks on `{ignore}` landing-page rows, 1 conversion.
- `2026-06-19` through the 09:00 heartbeat check: 6 clicks, 5 clicks on `{ignore}` landing-page rows, 0 conversions.
- Rechecked 949 live URL resources/rows across customer, campaign, ad group, ad, and keyword levels on `2026-06-19`: 0 fields contain `{ignore}`, 0 tracking templates, and only the intended customer-level final URL suffix remains.

Conclusion: this is no longer just a same-day reporting artifact. Because editable URL settings are clean, next step is Google Ads support/escalation with API evidence, not more URL mutation.

## D1 Reporting And Backfill

Remote D1 now has reporting views:

- `lead_reporting_summary`
- `clean_real_leads`
- `clean_google_ads_leads`
- `clean_unknown_leads`

Historical backfill inserted the four confirmed paid leads that pre-dated the D1 capture rollout. Backfill rows are marked `source_system = 'historical_gmail_backfill'`, `lead_source_classification = 'google_ads'`, `count_as_real_lead = 1`, and `count_as_google_ads = 1`.

Verified clean reporting totals after backfill:

| Metric | Count |
| --- | ---: |
| Raw rows | 13 |
| Test rows | 4 |
| Clean real leads | 9 |
| Clean Google Ads leads | 8 |
| Clean direct/unknown leads | 1 |
| Historical backfill real leads | 4 |

Interpretation: the 9-row/lead intuition was real for clean real leads, but the strict confirmed paid-search count is 8 unless the remaining direct/unknown lead is later proven paid.

The repo admin CSV export source now points reportable views at the D1 views rather than re-encoding the clean-lead filters in application code. This source change still needs the normal site deploy before the endpoint behavior changes in production.

## Brand Keyword Routing

Validated and applied 12 keyword-level final URL updates in `Search - Brand & Bands` / `Band names`.

| Term bucket | New final URL |
| --- | --- |
| Beat Boutique terms | `https://musicangel.ie/the-beat-boutique/` |
| Sway Social terms | `https://musicangel.ie/sway-social/` |
| The Best Men terms | `https://musicangel.ie/the-best-men/` |
| Blacktye terms | `https://musicangel.ie/blacktye/` |

Post-change API verification: 12 of 12 targeted keyword criteria are routed to the intended band page, with 0 mismatches.

## Search Term Notes

Converted API-visible search terms:

- `wedding bands cork` - 1 conversion
- `top wedding bands ireland` - 1 conversion
- `the beat boutique` - 1 conversion
- `superfly band ireland` - 1 conversion

Do not negative `top wedding bands ireland` or `superfly band ireland` until lead quality is reconciled.

Highest-spend unconverted non-added terms remain small sample, but the safest exact negative candidate from the prior report is still:

- `[top 10 wedding bands ireland]`

Applied exact negative:

- `[wedding saxophone player ireland]` in `Search - Wedding Bands Ireland` / `Wedding bands Ireland`; source search term had 2 clicks, EUR 4.34 cost, 0 conversions, and no D1 paid-lead evidence.

## Recommended Next Actions

1. Re-pull landing pages by day after fresh paid clicks arrive and confirm `{ignore}` rows stop. A one-time thread follow-up is scheduled for `2026-06-18 09:00`.
2. Use `lead_reporting_summary` / `clean_google_ads_leads` for reporting, not raw `COUNT(*)`.
3. Hold budgets and bidding steady until post-cleanup traffic produces enough new evidence.
4. Prepare any future negative-keyword changes as a separate validated change set.

Raw API exports are in `reports/google-ads-api-20260617/`.
