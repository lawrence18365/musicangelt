# Offline Booked-Wedding Conversion Plan

Updated: 2026-06-06

## Goal

Track booked wedding revenue separately from raw enquiry leads so Google Ads can be judged on actual business value, not only form fills.

## Recommended Conversion

- Name: `booked_wedding`
- Source: Enhanced conversions for leads / offline conversion import
- Category: Qualified lead or Purchase-equivalent sales outcome, depending on Google Ads setup
- Primary/secondary recommendation now: start as Secondary until the upload process is proven clean
- Value: actual booking value in EUR
- Count: One
- Upload only: real booked weddings

## Required Fields

- `lead_id`
- `original_lead_date`
- `booking_date`
- `conversion_name`
- `conversion_time`
- `conversion_value`
- `currency`
- `gclid`, where available
- `email`, where consent-compliant and securely handled
- `phone`, where consent-compliant and securely handled
- `band_requested`
- `wedding_date`
- `venue`
- `county`
- `source`
- `medium`
- `campaign`
- `lead_quality`
- `booking_status`
- `notes`
- `consent_status_notes`

## Lead Stage Separation

Keep these stages separate in the lead pipeline:

- Raw enquiry: every non-spam form/email enquiry.
- Qualified enquiry: real wedding enquiry with enough detail to quote.
- Quoted enquiry: a qualified enquiry that received a quote or availability response.
- Booked wedding: confirmed booking only.
- Booking value: agreed booking value in EUR.
- Revenue collected: deposit or full amount collected, if tracked separately.

## Upload Rules

- Upload only real booked weddings, not enquiries.
- Do not upload test leads.
- Do not upload leads without consent-compliant data handling.
- Keep `generate_lead` and `booked_wedding` as separate events.
- Include `gclid` whenever available even if enhanced conversions for leads is used.
- Reconcile each uploaded booking to a row in `GOOGLE_ADS_LEAD_TRUTH_TABLE_20260606.csv` or the current lead pipeline.
- Store raw email/phone in the operational CRM/sheet only when consent-compliant; do not commit raw personal contact data to git.

## Recommended Implementation Path

1. Short term: manual CSV upload from a reviewed booked-wedding sheet.
2. Medium term: Enhanced conversions for leads through Google Ads Data Manager or Google tag, once the CRM/lead sheet consistently stores email/phone/gclid and booking values.
3. Do not use Zapier until the lead-quality fields and booking statuses are stable; automation can upload bad data faster than manual review.
4. Google Ads API is unnecessary unless there is already a maintained API path for the lead system.

## Not Ready Yet

- No paid lead has a recorded booked status.
- No booking value is recorded.
- Current lead records have attribution but not a closed-loop sales status.
