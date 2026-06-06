# GitHub / Cloudflare Failure Ledger

Timestamp: 2026-06-06 08:23 America/Vancouver

## Summary

Recent MusicAngel failure emails are GitHub Actions PR-check failures from `SEO and deployment checks`. They are not Cloudflare production deployment failures.

The failing step in all three relevant emails was `Ensure generated output is committed`, after `node scripts/generate-pages.js` changed generated output. JavaScript syntax checks passed in all three runs.

## Failure Groups

### 1. Production-impacting failures

None found.

### 2. Preview / branch-only failures

| # | Email timestamp | Sender | Subject summary | Repo | Branch | PR | Commit | Workflow/deploy | Failure type | Current status | Production affected? | Root cause | Action taken | Remaining action |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| 1 | 2026-06-06 07:34 PDT | GitHub notifications | PR run failed: SEO and deployment checks - Capture full enquiry attribution fields | lawrence18365/musicangelt | codex/google-ads-attribution-capture-20260606 | #1 | f0c09ed | SEO and deployment checks | Generated output stale | Superseded by successful master Pages deployment `188e782` | No | `scripts/generate-pages.js` changed `sitemap.xml` lastmod values | Root cause fixed in v8 generator update | None after v8 PR/check passes |
| 2 | 2026-06-06 08:07 PDT | GitHub notifications | PR run failed: SEO and deployment checks - Add lead source-of-truth ledger | lawrence18365/musicangelt | codex/lead-source-of-truth-v7-20260606 | #2 | 1cd8f31 | SEO and deployment checks | Generated output stale | Superseded by successful master Pages deployment `133d02c` | No | `scripts/generate-pages.js` changed `sitemap.xml` lastmod values | Root cause fixed in v8 generator update | None after v8 PR/check passes |
| 3 | 2026-06-06 08:11 PDT | GitHub notifications | PR run failed: SEO and deployment checks - Bust site script cache for lead payload | lawrence18365/musicangelt | codex/lead-source-of-truth-v7-20260606 | #3 | 37be05b | SEO and deployment checks | Generated output stale | Superseded by successful Cloudflare production deployment `755f65e9` and GitHub Pages deployment run `27065876900` | No immediate production break; future generated output could have removed the cache key | Generator hardcoded `/js/site.js`, so generated pages lost `?v=20260606-sot1`; sitemap also rewrote dynamic lastmod dates | Updated `scripts/generate-pages.js` to emit `/js/site.js?v=20260606-sot1` and preserve existing sitemap lastmod | Re-run PR check |

### 3. Stale failures already superseded by successful deploy

- PR #1 failed check was superseded by successful master Pages deployment for `188e782`.
- PR #2 failed check was superseded by successful master Pages deployment for `133d02c`.
- PR #3 failed check was superseded by successful Cloudflare production deploy `755f65e9` for `4b2d8d3`, but the generator source still needed fixing to prevent recurrence.

### 4. Notification-only / no action

- Vercel bot comments for PR #1, #2, and #3 reported preview deployments as `Ready`; these were not failure emails.
- No Cloudflare failure emails matched the MusicAngel search window.

### 5. Security / dependency warnings

- No MusicAngel security/dependency warning emails were found in the searched Gmail window.
- GitHub code scanning API returned `no analysis found` and requested extra token scope.
- Dependabot alerts API returned that Dependabot alerts are disabled for this repository.

### 6. Unknown needs access

- GitHub security alert surfaces were not fully inspectable with the current token scope.
- No evidence from Gmail indicates a current MusicAngel security alert.

## Root Cause

The immediate failure-email cause was stale generated output. The durable root cause was in `scripts/generate-pages.js`:

1. Generated venue/county pages used `/js/site.js`, which stripped the v7 cache key from generated pages.
2. The sitemap regenerated `<lastmod>` as the current date, so PR checks could fail simply because the date changed.

## Fix

`scripts/generate-pages.js` now:

- emits `/js/site.js?v=20260606-sot1` in generated pages;
- preserves the existing sitemap `<lastmod>` value so generation is idempotent.

Local equivalent of `SEO and deployment checks` passed after the fix.
