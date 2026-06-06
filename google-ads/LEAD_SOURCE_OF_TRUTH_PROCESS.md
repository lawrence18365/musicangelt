# MusicAngel Lead Source Of Truth Process

Last updated: 2026-06-06

## Operating Principle

Gmail is not the source of truth for MusicAngel lead counting, CPL, qualified CPL, booked-wedding CPA, or ROAS.

The source of truth is the structured lead ledger created at form submission time. Email notifications remain useful alerts and audit copies, but they are not the database.

## Architecture

1. A visitor arrives on `musicangel.ie`.
2. `js/site.js` captures paid and organic attribution, including `gclid`, `gbraid`, `wbraid`, UTMs, landing page, referrer, device, viewport, user agent, form ID, and session ID.
3. The visitor submits an enquiry form.
4. `/api/enquiry` generates a unique `lead_id`.
5. `/api/enquiry` classifies the lead as `google_ads`, `organic_search`, `referral`, `direct_or_unknown`, or `test`.
6. `/api/enquiry` writes a structured record to Cloudflare D1 via the `LEADS_DB` binding.
7. `/api/enquiry` sends an internal admin lead-card email with the same `lead_id` and attribution summary.
8. `/api/enquiry` sends the customer auto-reply.
9. Sales status is updated later in the lead ledger or export workflow: `new`, `replied`, `qualified`, `quoted`, `booked`, `lost`, `spam`, `test`, or `duplicate`.
10. Booked weddings can later be uploaded as offline conversions or enhanced conversions for leads.

## Source Of Truth

Primary store: Cloudflare D1 database `musicangel_leads`, binding `LEADS_DB`.

Required production config:

- `LEADS_DB`: Cloudflare D1 binding.
- `LEADS_EXPORT_TOKEN`: token required for `/api/leads-export`.
- `RESEND_API_KEY`: existing email provider key.
- `RESEND_FROM`: existing sender identity.
- `NOTIFY_TO`: internal admin notification destination.
- `SEND_CUSTOMER_AUTOREPLY`: existing auto-reply control if configured.
- `LEAD_HASH_SALT`: optional salt for hashed IP diagnostic field.

## What Counts As Google Ads

Count a lead as Google Ads only when the lead ledger row has reliable paid evidence:

- `gclid` exists, or
- `gbraid` or `wbraid` exists, or
- `utm_source=google` and `utm_medium` is `cpc`, `ppc`, `paid`, or `paid_search`, or
- `attribution_source=google_ads`.

Unknown is not Google Ads. Organic is not Google Ads. Customer auto-replies are not lead records.

## Exclusions

Exclude these from real lead and CPL calculations:

- Test submissions.
- Spam or irrelevant submissions.
- Duplicate submissions beyond the first canonical lead.
- Customer auto-replies.
- Gmail notification copies.
- Google Ads conversion rows without matching lead evidence.
- GA4 events without matching lead evidence.

Formspark submissions are separate records. Count them as Google Ads only if the Formspark submission itself contains paid attribution.

## Deduplication Rules

Mark a submission as a possible duplicate when it matches an existing non-test lead within 7 days by any of:

- same email and same wedding date,
- same phone, band, and wedding date,
- same name, venue, and wedding date.

Do not silently discard duplicate-looking submissions. Store them and let a human confirm whether they are duplicates.

## CPL Calculation

Strict Google Ads CPL:

`Google Ads spend for date window / confirmed real Google Ads leads in the same date window`

Use the D1 lead ledger or a token-gated export as the authority. Gmail is only used as a backup audit trail.

## Booked-Wedding Feedback Loop

Do not upload raw enquiries as booked weddings.

Future workflow:

1. Lead is created with `lead_id`.
2. Admin replies and updates `reply_status`.
3. Lead is qualified and updates `lead_quality`.
4. Quote is sent and updates `quote_status`.
5. If booked, update `booking_status=booked`, `booking_date`, `booking_value`, `currency`, and `revenue_collected`.
6. Only real booked weddings with consent-compliant identifiers are prepared for offline conversion import or enhanced conversions for leads.
7. Include `gclid` whenever available.

## Export Views

Use `/api/leads-export?view=...` with `Authorization: Bearer <LEADS_EXPORT_TOKEN>`.

Supported views:

- `all`
- `real`
- `google_ads`
- `unknown`
- `tests`
- `duplicates`
- `booked`

Exports contain PII and must not be committed to GitHub.

## Cross-Checks

Google Ads conversions are cross-checks, not final lead counts.

GA4 events are cross-checks, not final lead counts.

Gmail/admin emails are notification and audit copies, not final lead counts.

If Google Ads conversions do not match the source-of-truth paid leads, reconcile by `lead_id`, timestamp, attribution markers, conversion date, campaign, ad group, device, and landing page before changing bids or budgets.

## Privacy And Data Handling

- Do not commit lead exports or customer PII to GitHub.
- Do not expose export endpoints without `LEADS_EXPORT_TOKEN`.
- Do not log full customer PII in Cloudflare logs.
- Store IP only as a hashed diagnostic field.
- Use offline conversion and enhanced conversion uploads only with consent-compliant handling.
- Owner/legal approval is required before changing privacy-policy wording.
