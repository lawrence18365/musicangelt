# V8 GitHub Failure Triage

Timestamp: 2026-06-06 08:23 America/Vancouver

## Executive Summary

The failure emails are not a production outage.

Production `musicangel.ie` is healthy. Lead capture is healthy. D1 storage is healthy. The lead export endpoint is protected and readable with the token.

The repeated MusicAngel failure emails came from GitHub Actions PR checks, not Cloudflare production deploys. The root cause was stale generated output from `scripts/generate-pages.js`.

Severity: needs cleanup, not urgent production incident.

## Gmail Failure-Email Summary

Search scope: connected Gmail, newer than 2026-06-06, GitHub and Cloudflare failure/deployment terms.

Relevant MusicAngel messages found:

- 3 GitHub Actions failure emails.
- 3 Vercel bot preview success comments.
- 0 Cloudflare failure emails.
- 0 MusicAngel Dependabot/security warning emails found in Gmail search.

Unrelated messages:

- Several `premarital_directory` failure emails were present. They are not MusicAngel and were excluded from this incident.

## GitHub Status

Latest `origin/master` commit checked: `4b2d8d365318f45b94324303e6c3d7de567912e2`.

Latest successful GitHub Pages deployment run:

- Run: `27065876900`
- Branch: `master`
- Commit: `4b2d8d3`
- Conclusion: success
- URL: `https://github.com/lawrence18365/musicangelt/actions/runs/27065876900`

Failed MusicAngel runs inspected:

- `27065034577` / PR #1 / `f0c09ed`
- `27065776968` / PR #2 / `1cd8f31`
- `27065871216` / PR #3 / `37be05b`

All failed at:

`SEO and deployment checks / checks / Ensure generated output is committed`

The JavaScript syntax step passed in all three runs.

## Cloudflare Status

Latest Cloudflare production deployment:

- Deployment ID: `755f65e9-b7e8-4861-94ba-80962ea570a4`
- Branch: `main`
- Commit: `4b2d8d3`
- URL: `https://755f65e9.musicangelt.pages.dev`
- Production custom domain: `https://musicangel.ie`

Cloudflare production is separate from the failing GitHub PR check. No Cloudflare failure emails were found.

## Production Health Checks

Pages returning 200:

- `https://musicangel.ie/`
- `https://musicangel.ie/the-best-men/`
- `https://musicangel.ie/wedding-bands-cork/`
- `https://musicangel.ie/wedding-band-cost-ireland/`

Source-of-truth script:

- Homepage loads `/js/site.js?v=20260606-sot1`.
- Script contains `SESSION_ID_KEY`.
- Script sends `form_id`.
- Script sends `session_id`.
- Script still contains attribution classification logic.

Lead export:

- Unauthenticated `/api/leads-export?view=all` returns `401`.
- Authenticated test export returned the V8 test row.

`{ignore}` middleware:

- Test URL `/wedding-bands-cork/%7Bignore%7D?...` returned `302` to `/wedding-bands-cork/` and preserved `utm_source`, `utm_medium`, and `gclid`.

## D1 / Lead Capture Health

D1 database: `musicangel_leads`.

Before V8 test:

- 1 total row.
- 1 test row.
- 0 real rows.
- 0 Google Ads rows.

V8 production test:

- `lead_id`: `MA-20260606-6E6394A9C9`
- API response: `{"ok":true,"lead_store":"stored"}`
- D1 status: `test`
- `is_test`: `1`
- `count_as_real_lead`: `0`
- `count_as_google_ads`: `0`
- `email_delivery_status`: `admin_sent`

After V8 test:

- 2 total rows.
- 2 test rows.
- 0 real rows.
- 0 Google Ads rows.

No real leads were converted into test rows, and no test rows are counted as Google Ads.

## Fix Applied

Updated `scripts/generate-pages.js`:

- Generated pages now use `/js/site.js?v=20260606-sot1`.
- Sitemap generation now preserves the existing `<lastmod>` value instead of rewriting it to the current date on every run.

Local equivalent of the failed workflow passed:

- JavaScript syntax checks.
- Page and sitemap regeneration.
- Generated-output clean check.
- Canonical audit.
- Internal link audit.

## What Was Not Changed

- No Google Ads settings.
- No budgets.
- No bids.
- No keywords.
- No ad copy.
- No conversion actions.
- No D1 destructive changes.
- No secrets committed.
- No private lead data committed.
- No workflow disabled.

## Blockers

- GitHub code scanning API required extra token scope or returned no analysis found.
- Dependabot alert API reported Dependabot alerts disabled for this repository.
- Cloudflare Functions live log tail was not needed because production tests and D1 reads passed; no recurring function errors were observed through request tests.

## Next Watch

Watch the next GitHub Actions run for `SEO and deployment checks` after this fix lands.

If it passes, the MusicAngel GitHub failure-email source is closed.

If it fails again, inspect the failed step first. Do not assume Cloudflare or D1 is affected unless production tests fail.
