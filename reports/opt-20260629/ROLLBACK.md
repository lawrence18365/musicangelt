# ROLLBACK — 2026-06-29 optimization pass

Ready-to-run reverse operations. Each restores the exact prior state. Run from repo root.
All payloads are pre-built with `validateOnly:false`; to dry-run first, edit to `true`.

```bash
cd /Users/lawrence/Desktop/musicangelt
D=reports/opt-20260629

# 1. Remove the 4 shared-set negatives (traffic band, evoke band, the wilful, saxophone player)
cat $D/rollback-1-shared-neg.json | node scripts/google-ads-safe-ops.js mutate

# 3. Remove the 18 prices-ad-group containment negatives
cat $D/rollback-3-prices-containment.json | node scripts/google-ads-safe-ops.js mutate

# 4. Restore head-term max CPC to €2.20 (2200000)
cat $D/rollback-4-headterm-bids.json | node scripts/google-ads-safe-ops.js mutate

# 5. Restore brand ad-group max CPC (MusicAngel brand €0.80 / Band names €0.90)
cat $D/rollback-5-brand-bids.json | node scripts/google-ads-safe-ops.js mutate
```

## What each restores
| File | Reverses | Back to |
|---|---|---|
| rollback-1-shared-neg.json | removes 4 shared criteria | shared set = 99 members |
| rollback-3-prices-containment.json | removes 18 ad-group negatives | ad group 194701048297 = 0 negatives |
| rollback-4-headterm-bids.json | sets 4 keyword bids | 2,200,000 micros (€2.20) |
| rollback-5-brand-bids.json | sets 2 ad-group bids | 800,000 / 900,000 micros |

Created shared criteria (for reference):
- traffic band: customers/8732162982/sharedCriteria/12099313337~314331854384
- evoke band: customers/8732162982/sharedCriteria/12099313337~849430795153
- the wilful: customers/8732162982/sharedCriteria/12099313337~2031915277656
- saxophone player: customers/8732162982/sharedCriteria/12099313337~303350196439
