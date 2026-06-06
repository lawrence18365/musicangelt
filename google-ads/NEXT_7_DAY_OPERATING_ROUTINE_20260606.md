# MusicAngel Next 7-Day Operating Routine

Created: 2026-06-06 08:31 America/Vancouver

## Purpose

Keep MusicAngel live while the new lead source-of-truth system gathers real data. Do not scale, change bidding, or publish new ad copy until D1 has enough real post-deploy evidence.

## Source Of Truth

D1 database `musicangel_leads` is the operating source of truth.

Gmail is notification/audit only.

Google Ads conversions are a cross-check, not the final lead count.

GA4 events are a cross-check, not the final lead count.

Formspark is separate unless the submission itself has paid attribution.

## Daily Checks

Run once per day for the next 7 days.

### 1. D1 Lead Counts

Check:

- Total rows.
- Real rows where `count_as_real_lead=1`.
- Google Ads rows where `count_as_google_ads=1`.
- Unknown real rows where `lead_source_classification=direct_or_unknown`.
- Test rows where `is_test=1`.
- Duplicate rows where `possible_duplicate=1` or `is_duplicate=1`.
- Spam rows where `spam_flag=1`.

Rules:

- Tests are excluded.
- Duplicates are counted once after human review.
- Unknown leads are not Google Ads.
- CPL uses D1 real paid leads only.

### 2. New Lead Review

For each new real row:

- Confirm `lead_id` exists.
- Confirm source classification is sensible.
- Confirm `gclid`, `gbraid`, `wbraid`, and UTMs are preserved if present.
- Confirm `count_as_real_lead` is correct.
- Confirm `count_as_google_ads` is correct.
- Confirm admin email was sent if `email_delivery_status` is available.
- Add/update sales status: `replied`, `qualified`, `quoted`, `booked`, `lost`, `spam`, or `duplicate`.

### 3. Google Ads Read-Only Snapshot

Check read-only:

- Spend.
- Clicks.
- Impressions.
- CTR.
- CPC.
- `generate_lead` conversions.
- Search terms.
- New irrelevant queries.
- Landing pages.
- Fresh `{ignore}` rows.
- Campaign spend split.
- Any disapprovals or policy warnings.
- Advertiser verification warnings.

Do not change budget, bidding, keywords, ads, or conversion actions during routine monitoring.

### 4. CPL Calculation

Strict paid CPL:

`Google Ads spend in the date window / D1 real Google Ads leads in the same date window`

Do not use Gmail message counts for CPL.

Do not count:

- Tests.
- Unknown leads.
- Organic leads.
- Direct leads.
- Referral leads.
- Formspark leads without paid attribution.
- Duplicates beyond the canonical row.
- Spam.

### 5. Search-Term Hygiene

Check search terms daily.

Act only on clear waste:

- jewellery/ring intent,
- DJ-only intent,
- irrelevant competitor band leakage,
- non-wedding or non-band intent.

Add negatives only when high confidence. Prefer phrase/exact negatives. Do not block:

- The Best Men,
- The Beat Boutique,
- Sway Social,
- Blacktye,
- high-intent wedding band terms.

### 6. Deploy And CI Health

Check:

- Latest GitHub Actions status.
- `SEO and deployment checks`.
- `Regenerate pages on data change`.
- GitHub Pages deployment if still active.
- Latest Cloudflare production deployment.
- `musicangel.ie` homepage status.
- `/js/site.js?v=20260606-sot1`.
- `/api/leads-export` unauthenticated response is `401`.

Action threshold:

- New `SEO and deployment checks` failure: inspect the failed step first.
- Cloudflare production failure: verify `musicangel.ie` and `/api/enquiry` immediately.
- D1 write failure: treat as lead-capture incident.

### 7. Lead Capture Health

Do not create daily test leads.

Only submit a test if passive checks cannot prove the path is working or a real lead fails.

If a test is needed, mark it exactly:

`TEST CLOSEOUT / HEALTH CHECK - EXCLUDE`

Then verify:

- `status=test`.
- `is_test=1`.
- `count_as_real_lead=0`.
- `count_as_google_ads=0`.
- `lead_store=stored`.

### 8. Booked / Quoted Outcome Tracking

For every real lead, update:

- reply status,
- lead quality,
- quote status,
- booking status,
- booking date,
- booking value,
- revenue collected.

Do not upload offline conversions yet.

Booked weddings must remain separate from raw enquiries.

## Restart Criteria For Active Optimization

Resume active Google Ads optimization only when at least one is true:

- 3-5 new real D1 leads have arrived.
- A real D1 Google Ads lead arrives and its quality can be judged.
- Spend rises with no D1 paid leads.
- Fresh bad search terms appear.
- Fresh `{ignore}` rows appear after v7/v8.
- Google Ads conversions and D1 leads mismatch again.
- A booked wedding occurs.
- Advertiser verification becomes urgent.

Until then:

- Keep the account live.
- Keep budget capped.
- Do not tinker.
- Do not switch to Maximize Conversions.
- Do not add broad match.
- Do not publish new ads without approval.

## Scaling Criteria

Consider a small budget increase only if:

- D1 attribution is stable.
- CPL is commercially acceptable.
- Lead quality is strong.
- Search terms remain clean.
- No fresh `{ignore}` rows appear.
- Advertiser verification is handled.

Consider Maximize Conversions only after materially more reliable conversion volume, not from the current small sample.

## End-Of-Day Closeout Rule

Stop work unless one of these appears:

- production failure,
- lead capture failure,
- D1 write/read failure,
- new GitHub Actions failure,
- Cloudflare production deployment failure,
- advertiser verification deadline warning,
- real paid lead requiring classification,
- sudden spend with no D1 lead evidence.
