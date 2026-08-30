# Google Ads — €400 Promo Credit Full Spend Report

**Date:** 2026-08-30
**Window:** 2026-08-13 (restart) → 2026-08-25 (guard hard-pause)
**Sources:** Google Ads API (campaign/keyword/search-term/conversion-action reports), credit-cap-guard logs (`reports/credit-cap-guard.log`), D1 `musicangel_leads` (conversion truth).

---

## 1. Headline

| Metric | Value |
|---|---|
| Total spend | **€401.27** |
| Promo credit | €400.00 |
| Billed to card (overshoot) | ~€1.27 |
| Days live | 13 (Aug 13–25) |
| Avg daily spend | €30.87 |
| Impressions | 2,018 |
| Clicks | 283 |
| CTR | 14.0% |
| Avg CPC | €1.42 |
| Conversions recorded in Google Ads | **0** |
| Real leads attributed to ads (D1 truth) | **1** |
| Effective cost per paid lead | €401.27 blended / €141.04 on the converting campaign |

The credit is fully consumed, well ahead of the 2026-09-16 expiry. The cap guard paused all five campaigns at 13:13 UTC on 2026-08-25 and they remain PAUSED (verified against the API today).

## 2. Daily spend

| Date | Spend | | Date | Spend |
|---|---|---|---|---|
| Aug 13 | €22.58 | | Aug 20 | €31.58 |
| Aug 14 | €38.92 | | Aug 21 | €28.48 |
| Aug 15 | €31.12 | | Aug 22 | €28.43 |
| Aug 16 | €30.20 | | Aug 23 | €25.41 |
| Aug 17 | €36.98 | | Aug 24 | €35.14 |
| Aug 18 | €42.33 (peak) | | Aug 25 | €16.56 (paused mid-day) |
| Aug 19 | €33.54 | | **Total** | **€401.27** |

## 3. Spend by campaign

| Campaign | Spend | Clicks | Impr. | CPC | CTR | D1 leads |
|---|---|---|---|---|---|---|
| Search - County Wedding Bands | €162.01 | 118 | 847 | €1.37 | 13.9% | 0 |
| Search - Wedding Bands Ireland | €141.04 | 71 | 492 | €1.99 | 14.4% | **1** |
| Search - Wedding Music Guides | €69.07 | 75 | 608 | €0.92 | 12.3% | 0 |
| Search - Brand & Bands | €29.15 | 19 | 71 | €1.53 | 26.8% | 0 |
| Search - Venue Wedding Bands | €0.00 | 0 | 0 | — | — | 0 |

## 4. Top keywords by spend

| Spend | Clicks | Keyword (match) | Campaign |
|---|---|---|---|
| €41.35 | 19 | live wedding band ireland (phrase) | Wedding Bands Ireland |
| €41.73 | 18 | wedding band prices ireland (phrase + exact) | Wedding Bands Ireland |
| €46.70 | 47 | best/first dance songs cluster (3 kws) | Wedding Music Guides |
| €15.05 | 11 | wedding bands Kerry (phrase) | County Wedding Bands |
| €12.50 | 9 | wedding band showcase (phrase) | Wedding Bands Ireland |
| €12.44 | 9 | ceremony music ireland (phrase) | Wedding Bands Ireland |
| €17.76 | 13 | Cork wedding bands (phrase + exact) | County Wedding Bands |

123 distinct search terms took spend; the long tail is county-level "wedding bands {county}" queries at €2–6 each.

## 5. Conversion outcome — the important part

**Google Ads recorded zero conversions on €401 of spend.** This is a tracking gap, not (only) a performance gap: every lead row in D1 for the window shows `google_ads_conversion_attempted: 0` — no browser-side conversion fired and no offline upload ran during the burn. The conversion-action report for the window is empty.

**D1 (source of truth) shows 3 leads in the window, 1 attributable to ads:**

1. **MA-20260818 — PAID.** GCLID present. Keyword *"wedding band prices ireland"* (phrase) → landing `/wedding-band-cost-ireland/` → enquiry. Wedding 2027-06-05, Landmark Hotel, Carrick-on-Shannon, ~100 guests. Qualified.
2. **MA-20260822 — labelled "referral (chatgpt.com)" but this is the SAME couple as #1** (same wedding date, same venue; name/partner fields swapped). They came back four days later and requested The Beat Boutique by name. Duplicate detection missed it because the partner submitted the second form. The ads lead therefore *progressed*, it didn't duplicate.
3. **MA-20260826 — organic** (Google organic → `/blacktye/`, Lough Erne, Apr 2027). Not ads.

Net: the €400 credit bought **one qualified couple** who returned with a named-band request. If that couple books at a typical package value, the spend roughly pays for itself; on a cash basis today it's €401/lead.

## 6. Where the money was wasted

- **€69.07 — Wedding Music Guides:** first-dance-song informational queries. 75 cheap clicks, zero enquiries. Pure top-of-funnel; produced nothing measurable in 13 days.
- **€29.15 — Brand & Bands:** "music angel", "blacktye", "the beat boutique", "sway social" — own-brand queries we already rank #1 for organically. Almost certainly cannibalized free clicks (26.8% CTR confirms it's our own audience).
- **~€10 junk terms:** "spring break band ireland" (€4.40), "top 10 wedding bands northern ireland" (€4.40 — outside service framing), "the beams wedding band" (competitor brand, €2.79).
- **€162.01 — County campaign, 118 clicks, 0 enquiries.** Best CTR of the intent campaigns but nothing converted. Landing pages (county band pages) got real traffic; either the pages don't convert or 13 days is too short a window for wedding-planning decision cycles — likely some of both.

The **only spend that demonstrably worked** was pricing-intent traffic: ~€42 on "wedding band prices ireland" produced the one lead. Cost-intent → cost page was the winning path, consistent with the pre-pause findings in the July retrospective.

## 7. Cap guard post-mortem

The guard did its job (nothing kept spending after the credit died) but overshot its own thresholds:

- **Taper at €375 never fired.** `taperedBudgets` is empty in every log line. Spend jumped €373.18 (Aug 24, 19:13 UTC) → €401.27 (next successful run, Aug 25, 13:13 UTC): an ~18-hour gap in cron executions plus Google's spend-reporting lag skipped straight past both the €375 taper and the €398 cap.
- **Hard pause fired at €401.27**, €3.27 over the cap and ~€1.27 over the credit — expect a small card charge.
- Lesson if a guard is ever needed again with real money: the enforcement interval + reporting lag must be smaller than (cap − taper) ÷ max daily rate, and a missed cron run needs an alert, not silence.

## 8. If ads restart with real money

1. **Fix conversion tracking first — spend nothing until it fires.** `google_ads_conversion_attempted` must be 1 on paid leads; use the Data Manager API path for offline/qualified-lead uploads (Google deprecated the old ClickConversionService path).
2. **Kill Wedding Music Guides and Brand & Bands** (€98 of this burn, zero incremental value).
3. **Rebuild around pricing/commercial intent:** "wedding band prices/cost ireland" cluster plus the top 4–5 county terms only.
4. **Fix the duplicate-lead linker** to match on wedding_date + venue, not just name/email — it missed the partner-swap resubmission.

---
*All figures pulled live from the Google Ads API and D1 on 2026-08-30. Raw pulls in the session scratchpad; guard history in `reports/credit-cap-guard.log`.*
