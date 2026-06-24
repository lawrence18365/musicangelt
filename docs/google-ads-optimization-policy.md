# MusicAngel Google Ads Optimization Policy

Created: 2026-06-19

This account is in a low-conversion, lead-quality-discovery regime. Do not apply standard high-volume Google Ads optimization tactics unless the thresholds below are met.

## Current Regime

As of 2026-06-19:

- Spend is about EUR 400.
- Google Ads shows about 8 lead conversions.
- D1 has 10 paid-attributed clean leads by operating rules, but only 5 live rows have both click ID and campaign/keyword captured.
- Confirmed bookings from paid traffic: 0.
- Sales outcome fields are not yet consistently populated for live leads.

Therefore, the account does not yet have a proven return-on-ad-spend signal. CPL is only a diagnostic. The real decision metric is cost per qualified lead, then cost per booking.

## Lead Classification Protocol

Lead classification is the gating step before any Google Ads optimization. Do not propose or make Ads changes until all paid leads have a lifecycle status and attribution bucket.

Required lifecycle statuses:

- `qualified`
- `quoted`
- `booked`
- `lost`
- `unreachable`
- `pending`

Required fields per paid lead:

- `lead_id`
- `created_at`
- `age_days`
- `attribution_bucket`: `brand`, `non_brand`, or `paid_unknown`
- `landing_page`
- lifecycle `status`
- `lost_reason`, required when lifecycle status is `lost`
- `contact_attempts`, including count and timestamps
- `last_contact_at`
- `notes`

Age rule: any lead with `age_days < 21` and no negative signal is `pending`, not `lost` and not a campaign failure. A lead just over 21 days old also should not be marked `lost` or `unreachable` unless there is recorded outreach evidence or a clear negative signal.

Routing rule after classification:

- Mostly `unreachable`, junk, or bot-like leads means traffic-quality problem. Return to search-terms review, negatives, match types, and lead-spam validation before trusting CPL.
- Mostly `qualified` leads with low or slow recorded outreach means sales-process problem. No Ads change applies.
- Mostly `quoted` but not `booked` means offer, price, or landing-page-fit problem. Ads may be doing its job; the leak is downstream.
- Mostly `pending` means insufficient maturity. Keep the account live and capped, then re-check after leads age and sales outcomes are recorded.

Hard stop: if the 10 paid leads, or the current complete paid-lead cohort, are not classified and routed, stop. Do not optimize the Ads account from raw CPL or from the zero-booking figure alone.

## Hard Rules

### 1. Do Not Switch To Smart Bidding Yet

Do not switch to Target CPA, Maximize Conversions, or Maximize Conversion Value until non-brand traffic alone has at least 15 primary conversions in the trailing 30 days and D1 attribution is stable.

Until then, use Manual CPC or Maximize Clicks with a max-CPC cap.

Avoid frequent bid strategy or cap changes. Treat one meaningful bid/cap change per month as the default maximum unless there is a tracking failure or spend incident.

### 2. Report Brand And Non-Brand Separately

Brand and band-name traffic must be treated as defensive capture, not growth proof.

Brand includes MusicAngel and act-name searches such as:

- Sway Social
- The Beat Boutique
- The Best Men
- Blacktye

Non-brand is the growth engine. Never use blended CPL to justify scaling generic or county campaigns.

Required reporting views:

- all paid-attributed leads,
- strict Google Ads conversions,
- brand/band-name leads,
- non-brand leads,
- paid_unknown leads,
- qualified leads,
- quoted leads,
- booked leads.

### 3. Fix Attribution Before Optimizing

Every paid lead should resolve to one of:

- `brand`
- `non_brand`
- `paid_unknown`

`paid_unknown` should trend toward zero.

If a lead has a Google click ID but no campaign/ad group/keyword fields, treat it as paid-attributed but not campaign-proven. Do not use it to justify campaign-level budget changes.

Audit and preserve:

- auto-tagging,
- account-level final URL suffix,
- campaign/ad/ad-group/keyword URL settings,
- landing-page redirects,
- `_gl`, `gclid`, `gbraid`, `wbraid`,
- UTM capture in D1.

### 4. Search Terms Are The Main Optimization Surface

At this volume, automated bidding has little to learn. Search-term hygiene is the highest-leverage optimization.

Weekly, review search terms and:

- add high-confidence irrelevant terms as exact or phrase negatives,
- avoid broad negative changes from one-click samples,
- promote non-brand queries that convert more than once into tighter ad groups,
- keep competitor/band-name decisions explicit rather than accidental.

Do not enable broad match without capped spend, tight negatives, and explicit approval.

### 5. Build Offline Conversion Feedback Now

D1 must track:

- replied,
- qualified,
- quoted,
- booked,
- booking value,
- lost reason.

Upload offline conversions only from clean outcomes with click IDs:

- qualified lead,
- quote sent,
- booking won.

Instrument this now and accumulate data. Do not optimize bidding toward booked weddings until booked volume is high enough to learn from.

## Scaling Rules

Do not scale budget while bookings are zero unless the change is explicitly a small measurement test.

Consider increasing non-brand budget only when all are true:

- D1 attribution is stable.
- Paid leads are being marked with quality and sales outcomes.
- Non-brand CPL is below the agreed ceiling for at least two consecutive weekly reads.
- Search terms are clean.
- No fresh tracking leakage or `{ignore}` landing-page issue is present.
- At least one paid lead has become qualified or quoted, ideally booked.

Consider increasing brand budget only as defensive capture, not because it proves incremental demand.

## Unit Economics Rule

Do not optimize toward a vague goal like "lower CPL."

Set a maximum sustainable CPL from:

`max CPL = gross profit per booking * lead-to-qualified rate * qualified-to-booking rate`

Until those rates are measured, use conservative scenario planning and keep spend capped.

## Do Not List

Do not:

- switch to Smart Bidding from the current conversion volume,
- scale on blended CPL,
- treat paid-attributed as incremental,
- react to single-conversion swings,
- add broad match casually,
- cut core non-brand terms from one weak sample,
- count brand/band-name leads as proof that generic demand is working,
- optimize toward raw leads when bookings are still zero,
- ignore missing campaign/keyword fields on paid leads.

## Recommended Operating Stance

Keep the account live and capped. Improve measurement, lead-quality tracking, and search-term hygiene before making growth moves.

The next meaningful milestone is not another cheap lead. It is a paid lead becoming qualified, quoted, or booked.
