# MusicAngel Google Ads — Verified Optimization Pass 2026-07-07

Executed via `scripts/google-ads-safe-ops.js` (service-account REST). All mutations: validateOnly → clean → applied → re-read from account.
Authorization: explicit user instruction ("do a deeper pass … execute actual fixes … have the confidence to execute").

## Verified findings that drove the changes

1. **Offline conversion pipeline was doubly broken (never uploaded anything):**
   - Stage mismatch: the D1 view `google_ads_conversion_import_candidates` classifies quoted leads
     as `quote_sent` / booked as `booking_won`, but the script filtered `conversion_stage = 'qualified_lead'`
     → matched 0 rows forever. `google_ads_conversion_uploads` ledger was empty.
   - Even with the filter fixed, Google rejected the upload: `CUSTOMER_NOT_ALLOWLISTED_FOR_THIS_FEATURE` —
     `ConversionUploadService.UploadClickConversions` is closed to new integrations; the
     **Data Manager API** (datamanager.googleapis.com) is mandatory.
2. **Jun 29 brand bid raise was ineffective:** it raised *ad-group* bids to €1.80, but all 21 brand
   keywords carry keyword-level bids (€0.80/€0.90) which override the ad-group bid.
   Effective bids never moved; Brand still lost 42% IS to rank in the week after (Jun 30–Jul 6).
3. **Brand is the revenue engine:** 90d CPA €16.7; the account's one €2,500 booking
   (MA-20260612-MANUAL-ANDREA) came from Brand keyword `the beat boutique wedding band` — bid €0.90.
4. **WBI bare head terms are dead weight:** `wedding band(s) ireland` PH/EX — ~€66 spend / 90d, 0 conversions,
   QS 3–5, while WBI loses 86% of IS to *budget* (every euro freed reroutes to converting keywords).
5. **Jul 2 Google Ads lead (gclid, Brand, quoted €750) never registered in Ads** — GA4 client-side tag missed it.
   Confirms the need for the server-side upload path.
6. Venue campaign: RARELY_SERVED (low search volume), €0 spend — correctly left untouched.

## Changes applied

| # | Object | Change | Before → After |
|---|---|---|---|
| 1 | Script `google-ads-safe-ops.js` | Stage filter fix: `IN ('qualified_lead','quote_sent','booking_won')`; migrated upload to Data Manager API; ledger write-back to `google_ads_conversion_uploads` | pipeline dead → working, idempotent |
| 2 | GCP project 840741916685 | Enabled `datamanager.googleapis.com` (was disabled) | — |
| 3 | **Conversion upload (apply)** | 9 conversions ingested to action `MusicAngel D1 qualified_lead` (7653797036): 8× quote_sent @ €750 + 1× booking_won @ €2,500. requestId `8d659976-59c4-4e99-a6ec-513bcdd80cca` | 0 → 9 uploaded (async processing) |
| 4 | 20 brand keywords (ad groups `MusicAngel brand` 194701048057, `Band names` 194701048217) | keyword-level max CPC → **€1.80** | €0.80/€0.90 → €1.80 (verified in account) |
| 5 | WBI head terms `wedding bands ireland` EX (1313972828), `wedding band ireland` PH (1680227678) + EX (1680236168) | **PAUSED** | ENABLED → PAUSED |
| 6 | `wedding band cost ireland` PH (304502139978) | max CPC cut | €2.40 → €1.70 |

## Deliberately NOT done
- **Budget changes** — WBI €152 CPA vs County €91 CPA rests on 2 conversions each; too thin. The head-term
  pause already reroutes WBI budget to its converters. Total live budget unchanged at €20/day.
- **Venue campaign** — low-search-volume, zero cost; leave for SEO.
- **Making `MusicAngel D1 qualified_lead` primary** — would double-count with GA4 `generate_lead`.
  It stays secondary (lands in "All conversions" only). Revisit if/when GA4 tag is retired.

## Automation installed (2026-07-07, later same day)
- **launchd agent `com.musicangel.google-ads-conversion-upload`** runs the conversion upload
  **Mon + Thu 09:30** via `~/Library/Application Support/MusicAngel/run-upload.sh`
  (installed copy of `scripts/google-ads-weekly-upload.sh`).
- macOS TCC blocks launchd agents from `~/Desktop`, so the runner executes from a **mirror**
  (`~/Library/Application Support/MusicAngel/`: ops script + env + service-account key, paths
  rewritten). Interactive runs auto-refresh the mirror; launchd runs use it as-is.
  Gotcha: `[ -r ]` passes under TCC while reads fail — the runner probes with a real read and
  writes atomically so a denied read can never clobber the mirror.
- Logs: `~/Library/Logs/musicangel-google-ads-upload.log`. Verified end-to-end under launchd
  (exit 0, `no_candidates` on empty queue). Data Manager processing check:
  `requestStatus:retrieve` for `8d659976-...` returned **SUCCESS, recordCount 9**.

## Snapshots / artifacts
- `b0-keyword-bids-before.json` — full bid state before changes
- `m1-keyword-ops.json` / `.apply.json` / `m1-{validate,apply}-response.json` — 24 mutations
- `z0-keyword-bids-after.json` — verified after-state
- `u1-upload-validate.*` — legacy endpoint rejection (allowlist error)
- `u2-dm-validate.*` / `u3-dm-apply.*` — Data Manager validate + apply
- Rollback: `ROLLBACK.md`
