# Rollback — 2026-07-07 pass

## Keyword changes (brand bids, head-term pauses, cost-ireland cut)
Exact inverse payload generated from the before-snapshot (`b0-keyword-bids-before.json`):

```sh
# validate first (payload ships with validateOnly: true)
node scripts/google-ads-safe-ops.js mutate < reports/opt-20260707/rollback-keyword-ops.json
# then flip validateOnly to false in the file (or via jq) and re-run to apply
```

Restores: 8 keywords → €0.80, 12 keywords → €0.90 (brand ad groups), re-enables the 3 WBI
head terms, and returns `wedding band cost ireland` PHRASE to €2.40.

## Conversion upload
Uploaded conversions cannot be deleted via this pipeline; to retract, use Google Ads UI
conversion adjustments (retractions) referencing the order_ids
`musicangel-d1-<lead_id>-<stage>` under action `MusicAngel D1 qualified_lead` (7653797036).
The action is secondary (not primary-for-goal), so it does not affect bidding or the
"Conversions" column — retraction should not be needed.

## Script changes
`git diff scripts/google-ads-safe-ops.js` — revert with git if needed. Note the legacy
`UploadClickConversions` path no longer works for this customer (not allowlisted); reverting
the script re-breaks the pipeline.

## GCP
Data Manager API was enabled on project 840741916685. Disable via
`gcloud services disable datamanager.googleapis.com` if ever desired (not recommended).
