-- Google Ads offline conversion import staging.
-- Keeps import eligibility and upload bookkeeping in D1 so Google Ads can be
-- trained from clean lead outcomes rather than raw form counts.

CREATE TABLE IF NOT EXISTS google_ads_conversion_uploads (
  upload_id TEXT PRIMARY KEY,
  lead_id TEXT NOT NULL,
  conversion_stage TEXT NOT NULL,
  order_id TEXT NOT NULL,
  conversion_action_resource_name TEXT,
  validate_only INTEGER NOT NULL DEFAULT 1,
  upload_status TEXT NOT NULL DEFAULT 'candidate',
  request_id TEXT,
  response_json TEXT,
  error_json TEXT,
  attempted_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  UNIQUE(lead_id, conversion_stage, validate_only)
);

CREATE INDEX IF NOT EXISTS idx_google_ads_conversion_uploads_lead
  ON google_ads_conversion_uploads(lead_id, conversion_stage);

CREATE INDEX IF NOT EXISTS idx_google_ads_conversion_uploads_status
  ON google_ads_conversion_uploads(upload_status, validate_only);

CREATE VIEW IF NOT EXISTS google_ads_conversion_import_candidates AS
SELECT
  lead_id,
  created_at AS conversion_created_at,
  CASE
    WHEN booking_status = 'booked' THEN 'booking_won'
    WHEN quote_status IN ('sent', 'quoted', 'quote_sent') THEN 'quote_sent'
    ELSE 'qualified_lead'
  END AS conversion_stage,
  CASE
    WHEN booking_status = 'booked' AND booking_value IS NOT NULL AND booking_value > 0 THEN booking_value
    WHEN booking_status = 'booked' THEN 2500.0
    WHEN quote_status IN ('sent', 'quoted', 'quote_sent') THEN 750.0
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
      WHEN booking_status = 'booked' THEN 'booking_won'
      WHEN quote_status IN ('sent', 'quoted', 'quote_sent') THEN 'quote_sent'
      ELSE 'qualified_lead'
    END AS order_id,
  campaign,
  ad_group,
  keyword,
  match_type,
  source_system,
  booking_status,
  quote_status,
  lead_quality
FROM clean_google_ads_leads
WHERE (
    (gclid IS NOT NULL AND gclid != '')
    OR (gbraid IS NOT NULL AND gbraid != '')
    OR (wbraid IS NOT NULL AND wbraid != '')
  )
  AND created_at >= '2026-06-06';
