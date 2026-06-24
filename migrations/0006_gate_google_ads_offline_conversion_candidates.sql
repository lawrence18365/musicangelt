-- Gate Google Ads offline conversion imports on real lead outcomes.
-- Pending paid leads must not be uploaded as qualified leads.

DROP VIEW IF EXISTS google_ads_conversion_import_candidates;

CREATE VIEW google_ads_conversion_import_candidates AS
SELECT
  lead_id,
  created_at AS conversion_created_at,
  CASE
    WHEN lower(coalesce(booking_status, '')) = 'booked'
      OR lower(coalesce(lifecycle_status, '')) = 'booked'
    THEN 'booking_won'
    WHEN lower(coalesce(quote_status, '')) IN ('sent', 'quoted', 'quote_sent')
      OR lower(coalesce(lifecycle_status, '')) = 'quoted'
    THEN 'quote_sent'
    ELSE 'qualified_lead'
  END AS conversion_stage,
  CASE
    WHEN (lower(coalesce(booking_status, '')) = 'booked'
      OR lower(coalesce(lifecycle_status, '')) = 'booked')
      AND booking_value IS NOT NULL
      AND booking_value > 0
    THEN booking_value
    WHEN lower(coalesce(booking_status, '')) = 'booked'
      OR lower(coalesce(lifecycle_status, '')) = 'booked'
    THEN 2500.0
    WHEN lower(coalesce(quote_status, '')) IN ('sent', 'quoted', 'quote_sent')
      OR lower(coalesce(lifecycle_status, '')) = 'quoted'
    THEN 750.0
    WHEN lower(coalesce(lead_quality, '')) IN ('5', 'high', 'excellent') THEN 500.0
    WHEN lower(coalesce(lead_quality, '')) IN ('4', 'good') THEN 350.0
    ELSE 250.0
  END AS conversion_value,
  coalesce(NULLIF(currency, ''), 'EUR') AS currency_code,
  CASE
    WHEN gclid IS NOT NULL AND gclid != '' THEN 'gclid'
    WHEN gbraid IS NOT NULL AND gbraid != '' THEN 'gbraid'
    WHEN wbraid IS NOT NULL AND wbraid != '' THEN 'wbraid'
    ELSE ''
  END AS click_id_type,
  CASE
    WHEN gclid IS NOT NULL AND gclid != '' THEN gclid
    WHEN gbraid IS NOT NULL AND gbraid != '' THEN gbraid
    WHEN wbraid IS NOT NULL AND wbraid != '' THEN wbraid
    ELSE ''
  END AS click_id,
  'musicangel-d1-' || lead_id || '-' ||
    CASE
      WHEN lower(coalesce(booking_status, '')) = 'booked'
        OR lower(coalesce(lifecycle_status, '')) = 'booked'
      THEN 'booking_won'
      WHEN lower(coalesce(quote_status, '')) IN ('sent', 'quoted', 'quote_sent')
        OR lower(coalesce(lifecycle_status, '')) = 'quoted'
      THEN 'quote_sent'
      ELSE 'qualified_lead'
    END AS order_id,
  campaign,
  ad_group,
  keyword,
  match_type,
  source_system,
  booking_status,
  quote_status,
  lead_quality,
  lifecycle_status,
  attribution_bucket
FROM clean_google_ads_leads
WHERE (
    (gclid IS NOT NULL AND gclid != '')
    OR (gbraid IS NOT NULL AND gbraid != '')
    OR (wbraid IS NOT NULL AND wbraid != '')
  )
  AND created_at >= '2026-06-06'
  AND (
    lower(coalesce(lifecycle_status, '')) IN ('qualified', 'quoted', 'booked')
    OR lower(coalesce(quote_status, '')) IN ('sent', 'quoted', 'quote_sent')
    OR lower(coalesce(booking_status, '')) = 'booked'
  );
