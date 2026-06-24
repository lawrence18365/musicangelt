# Seven-Day Google Ads Watchlist

Start: 2026-06-06

Track daily:

- Spend
- Clicks
- Impressions
- CTR
- Average CPC
- `generate_lead` conversions
- Strict paid leads with `gclid` or paid UTM attribution
- Strict CPL
- Qualified paid leads
- Qualified CPL
- Search terms
- Landing pages
- `{ignore}` rows
- Campaign spend split
- Device split
- New disapprovals or policy warnings

## Daily Log

| Date | Spend | Clicks | Impr. | CTR | CPC | generate_lead | Confirmed paid leads | Strict CPL | Qualified paid leads | Qualified CPL | Search terms checked? | New negatives added? | Fresh ignore rows? | Landing-page issues? | Device split note | Campaign split note | Disapprovals/policy warnings | Verification warnings | Notes |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---|---|---|---|---|---|---|---|---|
| 2026-06-06 | blocked: Ads UI sign-in |  |  |  |  |  | 4 cumulative confirmed paid leads | EUR 40.96 cumulative | 4 cumulative | EUR 40.96 cumulative | blocked | none | blocked | none proven | blocked | blocked | blocked | advertiser verification incomplete | v5 merged/deployed; admin proof blocked by NOTIFY_TO inbox access |

Threshold rules:

- If jewellery/ring terms return, add exact or phrase negatives.
- If DJ-only terms return, add exact or phrase negatives unless the query clearly asks for band plus DJ.
- If competitor-band leakage returns and does not convert, add exact or phrase negatives.
- If spend rises without qualified paid leads, do not increase budget.
- If strict CPL stays commercially viable and lead quality is strong for 7 days, consider a careful budget discussion later.
- If a paid lead books, calculate booked revenue and ROAS before any scaling decision.
- Do not switch the whole account to Maximize Conversions from the current small conversion set.
