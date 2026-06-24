# MusicAngel Google Ads v5 Durability + Monitoring Pass

Timestamp: 2026-06-06 07:34-07:40 America/Vancouver

## Executive Summary

Health score: 8.7/10.

The attribution release is now durable on `master`, production still serves the attribution code, production browser testing succeeded, and test leads are excluded from the lead truth table. The account is still not 10/10 because admin-email proof is blocked by inbox access, advertiser verification is incomplete, and fresh Landing Pages reporting could not be checked because Google Ads UI is at sign-in.

## Branch / Merge Status

- Branch: `codex/google-ads-attribution-capture-20260606`
- PR: https://github.com/lawrence18365/musicangelt/pull/1
- PR status: merged
- Merge commit: `188e78200ab7645ea32639355fb14aa0774bc639`
- Release commit: `f0c09ed15fe52ec39a6b2d6ffc4df55106bdc7a2`
- Files merged:
  - `js/site.js`
  - `functions/api/enquiry.js`
  - `api/enquiry.js`
- Files excluded:
  - reports
  - Google Ads CSVs/templates
  - private lead data
  - dirty local generated pages
  - secrets/env values

`master` now contains attribution capture, so future master-based deploys preserve the release.

## Production Status

- Current Cloudflare production deployment: `18c43670-6c68-4b9e-8925-c9fa1d841171`
- Deployment URL: `https://18c43670.musicangelt.pages.dev`
- Source shown by Cloudflare: `f0c09ed`
- Production URL: `https://musicangel.ie`
- Production `site.js`: contains attribution code.
- Production `/api/enquiry`: returns expected response.
- Cache status: `site.js` was cached, but cached asset already includes attribution logic; no stale-code issue found.

## Admin Email Proof

Inbox checked: connected Gmail account for `lawrencebrennan@gmail.com`.

Found:

- V4 customer auto-reply.
- V5 customer auto-reply.
- Chloe admin email from before v4, showing older attribution fields such as lead source and campaign.

Not found:

- V4/V5 admin email containing the full new attribution fields.

Status: blocked. Cloudflare confirms `NOTIFY_TO` is configured as an encrypted Pages secret, but the secret value is not readable. The admin email likely went to the configured `NOTIFY_TO` inbox, not the connected Gmail account.

Fields still needing admin-inbox proof:

- `gclid`
- UTMs
- landing/submitted URL
- device
- viewport
- user agent
- source classification

No code fix was made because mocked handler tests already proved the admin template renders these fields when they are present in the payload. The remaining issue is inbox access/proof, not code evidence.

## Lead Truth Table

- Confirmed Google Ads leads: 4.
- Strict CPL: EUR 40.96.
- Qualified paid leads: 4.
- Qualified CPL: EUR 40.96.
- Organic: Chloe remains organic.
- Referral/non-paid: Formspark TBB examples remain non-Google Ads unless paid attribution exists.
- Unknown: not counted.
- Test/excluded: v4 and v5 test submissions added as excluded.
- Booked paid weddings: 0.
- Paid revenue/ROAS: not calculated.

## Google Ads Read-Only QA

Google Ads UI status: blocked by sign-in in normal Chrome.

Read-only Editor/DB checks:

- Auto-tagging: enabled.
- Account tracking template: blank.
- Account final URL suffix: clean Google CPC UTM suffix.
- `{ignore}` / `%7Bignore%7D` / bare `ignore`: zero hits in refreshed Editor DB text scan.
- Budgets/bidding/broad match/ad copy: not changed in v5.

No Google Ads account changes were made.

## Landing Pages / Ignore

- Historical all-time `{ignore}` rows remain known.
- Production middleware still redirects literal and encoded `{ignore}` to clean URLs.
- UTMs and `gclid` are preserved through the redirect.
- Users are not currently affected by 404s from `{ignore}`.
- Fresh post-v4/v5 Landing Pages proof is blocked until Google Ads UI is authenticated and there are real new paid clicks to inspect.

## Conversion Tracking

Known setup remains:

- `generate_lead`: Primary.
- `contact_click`: Secondary.
- Auto-tagging: enabled.

V5 production browser test:

- Form submitted successfully.
- `gtag` and `fbq` were stubbed before submission.
- The page attempted exactly one `generate_lead` event after successful submit.
- That event was captured locally by the stub, not sent as a real conversion.

Duplicate-risk status: no duplicate conversion firing found in the browser flow.

## Advertiser Verification

Status: still incomplete from prior Google Ads UI check.

Current v5 blocker: Google Ads UI is at sign-in, so deadline/status could not be rechecked.

Required owner/legal details:

- legal business name
- trading name
- business address
- registration/VAT/tax details if applicable
- authorized representative details
- payment profile name
- website/domain control
- who pays for the ads
- service description
- relationship to represented bands/artists

Risk: Google may limit or stop ads if verification remains incomplete.

## Booked-Wedding Tracking

Updated:

- `google-ads/OFFLINE_BOOKED_WEDDING_IMPORT_PLAN.md`
- `google-ads/OFFLINE_BOOKED_WEDDING_UPLOAD_TEMPLATE.csv`

Template now includes:

- original lead date
- booking date
- booking value/currency
- gclid/contact fields
- band/date/venue/county
- source/medium/campaign
- lead quality
- booking status
- consent/status notes

Recommended method:

- manual CSV for now
- Google Ads Data Manager / enhanced conversions for leads later
- no Zapier/API until sales status handling is reliable

## Changed

- Merged attribution release into `master`.
- Added v4/v5 test submissions as excluded in:
  - `google-ads/LEAD_PIPELINE_TEMPLATE.csv`
  - `google-ads/GOOGLE_ADS_LEAD_TRUTH_TABLE_20260606.csv`
- Updated:
  - `google-ads/OFFLINE_BOOKED_WEDDING_IMPORT_PLAN.md`
  - `google-ads/OFFLINE_BOOKED_WEDDING_UPLOAD_TEMPLATE.csv`
  - `google-ads/SEVEN_DAY_WATCHLIST_20260606.md`
  - `google-ads/DRAFT_RSA_AND_ASSET_IMPROVEMENTS_20260606.md`

## Verified

- PR diff was exactly three files.
- No reports, CSVs, local artifacts, secrets, hardcoded PII, or unrelated website changes were merged.
- Production still serves attribution code.
- Production API responds.
- V5 browser test succeeded.
- V5 customer auto-reply arrived.
- Test conversion events were stubbed and not sent.
- Lead CSVs parse correctly.

## Blocked

- Admin-email proof requires access to the actual `NOTIFY_TO` inbox or provider logs.
- Google Ads UI checks require signing in again.
- Advertiser verification cannot be completed without owner/legal details.
- Fresh Landing Pages proof requires authenticated Ads UI plus real post-v5 paid clicks.

## Recommended But Not Executed

- No ad copy published.
- No budget increase.
- No bidding experiment.
- No Maximize Conversions switch.
- No offline conversion import.
- No advertiser verification submission.

## Next Action

Immediate:

- Check the `NOTIFY_TO` inbox for `TEST V5 ATTRIBUTION`; confirm the admin email includes gclid, UTMs, device, viewport, user agent, and lead source.
- Sign into Google Ads so Landing Pages, verification, and current performance can be read.

Next 7 days:

- Fill the daily watchlist after real paid clicks.
- Filter Landing Pages for `ignore` only after new clicks exist.
- Keep search-term checks tight.

Wait:

- Budget scaling.
- Ad asset publishing.
- Bidding experiments.
- Offline import.

Required before 10/10:

- admin lead email proof
- advertiser verification complete
- fresh Landing Pages check after real clicks
- booked-wedding tracking used for at least one real booking workflow
