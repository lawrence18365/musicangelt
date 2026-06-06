# MusicAngel Google Ads V7 Source-Of-Truth Pass

Timestamp: 2026-06-06 08:05 America/Vancouver

## Objective

Replace Gmail-notification reconciliation with a structured source-of-truth lead ledger created at form submission time.

## Architecture Decision

Selected Cloudflare D1.

Reason: MusicAngel already runs on Cloudflare Pages Functions, so D1 keeps the lead database inside the current hosting/account boundary, avoids a new CRM/API dependency, and lets `/api/enquiry` write the lead record directly when a form is submitted.

Tradeoff: D1 provides durable structured storage, but a non-technical sales UI is still needed later if lead status updates will be managed by a human outside exports.

## Timestamped Change Log

- 2026-06-06 07:55 America/Vancouver: Created clean worktree and branch `codex/lead-source-of-truth-v7-20260606` from `origin/master`.
- 2026-06-06 07:56 America/Vancouver: Created Cloudflare D1 database `musicangel_leads`, id `67f9c7f4-e1c4-465e-b7b2-6aa7c3bc3745`.
- 2026-06-06 07:57 America/Vancouver: Added D1 binding config as `LEADS_DB`.
- 2026-06-06 07:58 America/Vancouver: Added and applied `0001_create_leads_source_of_truth.sql` locally and remotely.
- 2026-06-06 08:00 America/Vancouver: Added `lead_id`, source classification, D1 write, duplicate detection, and structured admin lead-card email to the Cloudflare enquiry handler.
- 2026-06-06 08:01 America/Vancouver: Added `form_id` and `session_id` capture to `js/site.js`.
- 2026-06-06 08:02 America/Vancouver: Added token-gated `/api/leads-export` CSV export endpoint.
- 2026-06-06 08:03 America/Vancouver: Added Vercel fallback lead-card parity with explicit `lead_store=not_stored`.
- 2026-06-06 08:04 America/Vancouver: Ran syntax checks for all changed JavaScript files.
- 2026-06-06 08:04 America/Vancouver: Ran mocked handler tests for paid, direct, test, duplicate, export auth, and storage-failure behavior.
- 2026-06-06 08:05 America/Vancouver: Added encrypted Cloudflare Pages production secrets `LEADS_EXPORT_TOKEN` and `LEAD_HASH_SALT`.

## Verification Completed

- Cloudflare D1 remote table exists.
- Remote D1 lead count before deployment: 0.
- Test submissions with explicit test markers are excluded from real lead and Google Ads CPL counts.
- Non-test paid-style submissions classify as `google_ads`.
- Non-test direct submissions classify as `direct_or_unknown`.
- Duplicate-looking submissions are stored and marked `possible_duplicate`; they are not silently discarded.
- D1 storage failure still allows admin/customer email delivery and returns `ok:true` with `lead_store=not_stored`.
- `/api/leads-export` returns `401` without token and CSV with token.

## CPL Rule Going Forward

Strict Google Ads CPL is calculated from the D1 lead ledger:

`Google Ads spend for date window / real non-test non-duplicate non-spam leads where count_as_google_ads=1 in the same date window`

Gmail notifications, customer auto-replies, Google Ads conversion rows, and GA4 events are audit/cross-check sources only.

## Remaining Before 10/10

- Deploy the source-of-truth code to production and submit a controlled production test.
- Confirm a real post-deploy lead appears in D1 and admin email with the same `lead_id`.
- Reconcile Google Ads `generate_lead` timestamps once Ads UI access is available.
- Complete advertiser verification with owner/legal details.
- Add a human-friendly status update workflow for quoted/booked/lost outcomes.
- Upload booked-wedding conversions only after a real booking workflow is operating.
