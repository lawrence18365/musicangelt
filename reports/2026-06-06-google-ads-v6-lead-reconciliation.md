# MusicAngel Google Ads v6 Real Lead Reconciliation

Timestamp: 2026-06-06 07:45-08:00 America/Vancouver

## 1. Executive Summary

Verified real unique leads in the accessible reconciliation window: 18.

Verified confirmed Google Ads real leads: 4.

Previous count was not wrong after review. The confusion came from an earlier intermediate count of 3 that omitted Kathy. Kathy is confirmed paid because the admin email contains `gclid`, `gbraid`, `utm_source=google`, `utm_medium=cpc`, campaign ID, ad group ID, keyword, and Google Ads landing/referrer evidence.

Correct strict CPL for May 22-Jun 5 spend window remains:

- Spend: EUR 163.85
- Confirmed Google Ads real leads: 4
- Strict CPL: EUR 40.96

If Kathy were excluded, CPL would be EUR 54.62, but the evidence supports including her.

Current health score: 8.7/10. The account did not materially improve or worsen in v6; the count was reconciled and the paid economics remain commercially promising but not ready for scaling.

## 2. Reconciliation Method

Primary window: May 22, 2026 through June 6, 2026.

Secondary windows checked:

- May 22-Jun 5, 2026
- since v4 attribution deployment
- since v5 merge
- today/yesterday

Time basis:

- Gmail `email_ts` for email records.
- Form/body timestamps used as supporting evidence where present.

Sources checked:

- Gmail connected inbox / All Mail / in:anywhere searches.
- MusicAngel admin lead emails visible in connected Gmail.
- Customer auto-replies visible in connected Gmail.
- Formspark notification emails visible in connected Gmail.
- Cloudflare visible config/deployment metadata from previous v5 pass.
- Google Ads Editor DB from previous v5 pass for URL hygiene.

Inaccessible:

- Google Ads UI, because Chrome is at Google sign-in.
- Actual encrypted `NOTIFY_TO` inbox if different from connected Gmail.
- Formspark dashboard beyond notification emails.
- Cloudflare request/email-provider delivery logs beyond successful production API tests.
- GA4 event UI.

## 3. Master Lead Ledger Summary

Canonical file:

`google-ads/MUSICANGEL_REAL_LEAD_RECONCILIATION_20260606.csv`

Counts:

- Raw records in ledger: 30
- Test submissions: 10
- Duplicates: 1
- Spam/irrelevant: 1
- Real unique leads: 18
- Confirmed Google Ads real leads: 4
- Organic real leads: 7
- Direct real leads: 1
- Referral real leads: 5
- Unknown real leads: 1
- Formspark real leads: 12
- Formspark paid-attributed: 0
- Formspark non-paid/unknown: 12
- Formspark duplicate: 0 found
- Formspark test/spam: 1 blank/spam excluded
- Real post-v4 leads: 1 known real lead in connected Gmail, Chloe, organic.
- Real post-v5 leads: none found in connected Gmail at reconciliation time.

## 4. Named Lead Classification

### Kathy / The Beat Boutique

- Final classification: Confirmed Google Ads.
- Counted in real leads: yes.
- Counted in Google Ads leads: yes.
- Evidence: admin email has `gclid`, `gbraid`, `utm_source=google`, `utm_medium=cpc`, `utm_campaign=23890295743`, `utm_adgroup=194701052777`, `utm_content=810584875823`, `utm_term=wedding bands cork`, first landing page from Google Ads.
- Confidence: high.

### Susan / The Best Men

- Final classification: Confirmed Google Ads.
- Counted in real leads: yes.
- Counted in Google Ads leads: yes.
- Evidence: admin email says `Lead source google_ads`, with `gclid`, `gbraid`, `utm_source=google`, `utm_medium=cpc`, campaign/ad group/keyword data.
- Confidence: high.

### David Mc Gee / Sway Social

- Final classification: Confirmed Google Ads.
- Counted in real leads: yes.
- Counted in Google Ads leads: yes.
- Evidence: admin email says `Lead source google_ads`, with `gclid`, `utm_source=google`, `utm_medium=cpc`, campaign/ad group/keyword data.
- Confidence: high.

### Louisa

- Final classification: Confirmed Google Ads.
- Counted in real leads: yes.
- Counted in Google Ads leads: yes.
- Evidence: admin email says `Lead source google_ads`, with `gclid`, `gbraid`, `utm_source=google`, `utm_medium=cpc`, campaign/ad group/keyword data.
- Confidence: high.

### Chloe

- Final classification: Organic.
- Counted in real leads: yes.
- Counted in Google Ads leads: no.
- Evidence: admin email says `Lead source organic_search · google.com`, no gclid, no paid UTM.
- Confidence: high.

### Formspark TBB

- Final classification: Formspark non-paid unless a specific row shows paid markers.
- Counted in real leads: yes for genuine enquiries; no for blank/spam.
- Counted in Google Ads leads: no.
- Evidence: Formspark notifications show blank `gclid` / `first_gclid`; sources are One Fab Day/email, WeddingsOnline, organic Google, direct/internal.
- Confidence: high for visible notifications.

## 5. CPL Correction

Old paid lead count under question:

- Earlier intermediate count: 3.
- Later reported count: 4.

Verified paid lead count: 4.

Spend window:

- May 22-Jun 5, 2026
- Spend: EUR 163.85

Correct strict CPL:

- EUR 163.85 / 4 = EUR 40.96

Scenario if Kathy were excluded:

- EUR 163.85 / 3 = EUR 54.62

What changed:

- The count did not need to be reduced. The earlier 3-lead view was incomplete because Kathy’s admin email does contain paid markers.

## 6. Google Ads Conversion Reconciliation

Known prior Google Ads UI count:

- `generate_lead`: 3 in the May 22-Jun 5 snapshot.

Verified paid lead emails:

- 4.

Reconciliation:

- Matched real paid leads: 4 by email evidence.
- Google Ads conversion count appears to undercount verified paid lead emails by 1, or reporting lag/window differences may apply.
- Unmatched conversions: not verifiable because Google Ads UI is blocked by sign-in.
- Paid leads missing Ads conversions: likely 1, but requires Ads UI/GA4 timestamp check.
- Test/duplicate risk: old test submissions exist, but they are clearly marked and excluded in the ledger.

Tracking diagnosis:

- Use real lead emails as source of truth.
- Google Ads conversions remain a cross-check, not the lead count source of truth.

## 7. Admin Email / NOTIFY_TO Status

Admin inbox checked: connected Gmail only.

Admin emails visible:

- Kathy, Susan, David, Louisa, Chloe, Mary, and older technical tests.

Attribution fields present in pre-v4 paid admin emails:

- gclid
- UTMs
- campaign/ad group/keyword
- landing/referrer
- lead source

Fields not present before v4:

- device
- viewport
- user agent

V4/V5 admin proof:

- blocked. Connected Gmail saw customer auto-replies only for V4/V5 tests.
- The attribution-rich admin email likely went to encrypted `NOTIFY_TO`.

Future leads after v4 should be countable from admin email alone if the admin email is available, because code now renders device/viewport/user agent and expanded attribution fields.

## 8. Formspark Status

Formspark records found in ledger:

- 13 raw Formspark records.
- 12 real Formspark leads.
- 1 blank/spam excluded.

Paid-attributed Formspark:

- 0 found.

Formspark non-paid/unknown:

- 12 real records, with organic/referral/direct evidence.

Formspark must remain separate from Google Ads unless a row contains `gclid`, `utm_source=google` + `utm_medium=cpc`, or equivalent paid evidence.

## 9. Google Ads Performance After Corrected Count

Campaign economics still look promising:

- 97 clicks
- EUR 163.85 spend
- 4 verified paid real leads
- EUR 40.96 strict CPL

Interpretation:

- Keep the account live.
- Keep budget capped.
- Do not switch to Maximize Conversions yet.
- Do not scale until a fresh 7-day window proves attribution consistency and lead quality.
- Next optimization focus remains tracking proof, landing-page freshness, and search-term monitoring, not aggressive scaling.

## 10. Changed

Created:

- `google-ads/MUSICANGEL_REAL_LEAD_RECONCILIATION_20260606.csv`
- `reports/2026-06-06-google-ads-v6-lead-reconciliation.md`

No Google Ads changes made.

No code/config changes made.

## 11. Verified

- Kathy is confirmed Google Ads.
- Susan is confirmed Google Ads.
- David Mc Gee is confirmed Google Ads.
- Louisa is confirmed Google Ads.
- Chloe is organic.
- Mary is one real unknown/direct lead plus one duplicate.
- Formspark TBB visible records are non-paid unless future evidence says otherwise.
- Test submissions are excluded.
- Customer auto-replies are not counted as admin lead records.
- Lead ledger CSV parses successfully.

## 12. Blocked

- Google Ads UI access blocked by sign-in.
- GA4 access not checked in this pass.
- Actual V4/V5 admin email proof blocked by `NOTIFY_TO` inbox access.
- Formspark dashboard not accessed; used notification emails only.
- Cloudflare request/provider delivery logs not accessed.
- Advertiser verification still needs owner/legal details.

## 13. Recommended But Not Executed

- No budget scaling.
- No bidding changes.
- No Maximize Conversions switch.
- No offline conversion import.
- No ad copy publishing.
- No advertiser verification submission.

## 14. Next Action

Immediate:

- Sign into Google Ads and reconcile `generate_lead` timestamps against the 4 verified paid leads.
- Check `NOTIFY_TO` inbox for V4/V5 test admin emails and confirm device/viewport/user agent fields.

Next 7 days:

- Add each new real lead to the reconciliation ledger first.
- Count Google Ads only when paid markers are present.
- Check Landing Pages for fresh `ignore` only after real paid clicks exist.

Before 10/10:

- Google Ads conversion count reconciles to real lead emails.
- Admin email proof for post-v4 fields is available.
- Advertiser verification is complete.
- Booked-wedding revenue workflow is used for a real booking.
