# MusicAngel Google Ads v4 Deployment + Readiness Pass

Timestamp: 2026-06-06 05:47-05:51 America/Vancouver

## Executive Summary

Health score: 8.5/10.

The account moved forward from 8/10 because attribution capture is now safely deployed from a clean branch, production code serves the new attribution logic, and booked-wedding revenue tracking templates are ready for manual use. It is not 10/10 yet because advertiser verification is still incomplete, fresh post-cleanup Landing Pages reporting still needs real paid clicks, and booked-wedding import is not operational with real booking data.

## Deployment Status

- Branch: `codex/google-ads-attribution-capture-20260606`
- Commit: `f0c09ed` (`Capture full enquiry attribution fields`)
- Remote branch: `origin/codex/google-ads-attribution-capture-20260606`
- Deploy method: `npx wrangler pages deploy . --project-name=musicangelt --branch=main`
- Deploy URL: `https://18c43670.musicangelt.pages.dev`
- Production URL: `https://musicangel.ie`
- Files deployed:
  - `js/site.js`
  - `functions/api/enquiry.js`
  - `api/enquiry.js`
- Files excluded:
  - v3/v4 reports
  - Google Ads CSVs/templates
  - unrelated generated page changes
  - dirty main-checkout changes
- Deployment safety: deployed from clean worktree `/tmp/musicangel-attribution-release`, not from dirty `/Users/lawrence/Desktop/musicangelt`.

## Attribution Capture Proof

Local browser paid-style test URL:

`http://127.0.0.1:8787/the-best-men/?gclid=TEST_GCLID_20260606&utm_source=google&utm_medium=cpc&utm_campaign=test_campaign&utm_content=test_ad&utm_term=wedding%20bands%20ireland#enquiry`

Result: passed. One intercepted form payload contained:

- `gclid=TEST_GCLID_20260606`
- `utm_source=google`
- `utm_medium=cpc`
- `utm_campaign=test_campaign`
- `utm_content=test_ad`
- `utm_term=wedding bands ireland`
- `attribution_source=google_ads`
- first landing page with gclid
- submitted page URL
- device
- viewport
- user agent
- band, wedding date, venue

Local browser direct-style test URL:

`http://127.0.0.1:8787/the-beat-boutique/#enquiry`

Result: passed. One intercepted form payload contained no gclid/UTMs and classified as `direct_or_unknown`, not Google Ads.

Production API test:

- `POST https://musicangel.ie/api/enquiry`
- Result: `{"ok":true}`
- This was a direct API test, not a paid click and not a browser `generate_lead` event.
- Gmail received the customer auto-reply from `hello@musicangel.ie`, confirming branded production email sending. The internal admin email with attribution likely went to `NOTIFY_TO` and was not visible in the connected Gmail account.

## Google Ads Tracking Status

- Auto-tagging: enabled.
- Account tracking template: blank.
- Account final URL suffix: clean Google CPC UTM suffix.
- `generate_lead`: remains Primary.
- `contact_click`: remains Secondary.
- No duplicate conversion action was created.
- No bidding strategy changed.
- No budget changed.
- No broad match added.
- Enhanced conversions/offline import: ready to plan, not ready to import until real booked-wedding data exists.

## Lead Truth Table

- Confirmed Google Ads leads: 4.
- Strict CPL: EUR 40.96 (`EUR 163.85 / 4`).
- Qualified paid leads: 4.
- Qualified paid CPL: EUR 40.96.
- Organic/non-paid: Chloe remains organic.
- Formspark TBB leads: not counted unless paid attribution exists.
- Booked paid weddings: 0 recorded.
- Paid revenue / ROAS: not calculated because no verified booking value exists.

## Landing Pages and Ignore Status

- Current Ads/Editor URL fields: zero `{ignore}`, `%7Bignore%7D`, or bare `ignore` residue in refreshed local DB text scan.
- Production middleware:
  - literal `{ignore}` path 302s to the clean page.
  - encoded `%7Bignore%7D` path 302s to the clean page.
  - UTMs and `gclid` are preserved.
  - final page returns 200.
- Historical all-time `{ignore}` rows still exist in Google Ads reporting.
- Fresh post-v3/v4 proof still requires real paid clicks after this deploy, then Landing Pages filtered for `ignore`.

## Advertiser Verification

Status from prior live UI check: incomplete and recommended by Google.

Google Ads showed:

- `Complete advertiser verification`
- estimated submission time around 30 minutes
- review usually 3-5 business days
- access to logo assets depends on verification

Blocked: legal/owner details must not be guessed.

Owner/admin checklist:

- legal business name
- trading name
- business address
- business registration/VAT/tax details if applicable
- authorized representative details
- payment profile name
- domain/business control
- who pays for ads
- service description
- relationship to represented bands/artists

## Google Ads QA

- Budgets unchanged.
- Manual CPC/bidding unchanged.
- Search Partners off in Editor snapshot.
- Display Network off in Editor snapshot.
- Broad-match campaign setting off.
- AI Max/final URL expansion off.
- Presence targeting setting unchanged in Editor snapshot.
- No live ad copy edited.
- No ad review triggered by v4.
- Refreshed Editor DB still showed no `ignore` residue.
- Caveat: the local Editor DB did not show the v2 shared negative list, so negative-list verification still relies on the prior live UI/export proof from v2.

## Booked-Wedding Tracking Readiness

Updated:

- `google-ads/OFFLINE_BOOKED_WEDDING_IMPORT_PLAN.md`
- `google-ads/OFFLINE_BOOKED_WEDDING_UPLOAD_TEMPLATE.csv`

Recommendation:

- manual CSV for now
- enhanced conversions for leads / Google Ads Data Manager later
- do not use Zapier until booking status and values are stable
- no Google Ads API unless there is already maintained infrastructure

Do not upload raw enquiries as booked weddings.

## Changed

- Deployed attribution capture code:
  - `js/site.js`
  - `functions/api/enquiry.js`
  - `api/enquiry.js`
- Updated booked-wedding import plan/template locally.
- Pushed release branch to GitHub.

## Verified

- Syntax checks passed for all three JS files.
- Mocked Vercel handler test passed with attribution in internal email HTML.
- Mocked Cloudflare handler test passed and did not classify organic/direct as paid.
- Local browser paid-style form test passed.
- Local browser direct-style form test passed.
- Production `site.js` contains attribution capture code.
- Production `/api/enquiry` honeypot returns OK.
- Production test API submission returned OK.
- Production branded auto-reply arrived in Gmail.
- Deployment check passed for Cloudflare Pages.
- `{ignore}` redirect preserves tracking and lands on 200 page.

## Blocked

- Internal admin email body could not be inspected because the connected Gmail account received only the customer auto-reply; the attribution-rich internal email likely went to the configured `NOTIFY_TO` inbox.
- Advertiser verification cannot be submitted without owner/legal confirmation.
- Fresh Landing Pages `{ignore}` proof cannot be completed until new paid clicks arrive after v4.
- No offline/booked-wedding import can happen until there is a real verified booking value.

## Recommended But Not Executed

- Do not publish draft RSA/ad asset changes yet.
- Do not increase budget yet.
- Do not switch to Maximize Conversions yet.
- Do not import offline conversions yet.
- Complete advertiser verification with owner/admin details.
- Merge the release branch into `master` after review so future repo-based deploys include the attribution release.

## Next Action

Immediate:

- Ask Jo/owner to confirm the internal TEST email contains `gclid`, UTMs, device, viewport, user agent, landing page, and lead source.
- Complete advertiser verification.
- Merge `codex/google-ads-attribution-capture-20260606` to `master` after reviewing the three-file diff.

Next 7 days:

- Track confirmed paid leads, strict CPL, search terms, campaign spend split, and fresh Landing Pages rows.
- Check Landing Pages only after new paid clicks exist; filter for `ignore`.

Wait until more data:

- Budget scaling.
- Maximize Conversions experiment.
- RSA/ad asset publishing.
- Offline booked-wedding import.

Required before 10/10:

- attribution-rich admin emails proven in the live lead inbox
- advertiser verification complete
- fresh post-cleanup Landing Pages check clean after real clicks
- booked-wedding revenue tracking operational with real bookings
