-- Reporting views for MusicAngel lead analysis.
-- These intentionally encode the clean-count filters so future CPL reports do
-- not use raw row counts that include tests, spam, or duplicates.

CREATE VIEW IF NOT EXISTS lead_reporting_summary AS
SELECT
  COUNT(*) AS total_rows,
  SUM(CASE WHEN is_test = 1 THEN 1 ELSE 0 END) AS test_rows,
  SUM(CASE WHEN spam_flag = 1 THEN 1 ELSE 0 END) AS spam_rows,
  SUM(CASE WHEN is_duplicate = 1 THEN 1 ELSE 0 END) AS duplicate_rows,
  SUM(CASE
    WHEN count_as_real_lead = 1
      AND is_test = 0
      AND is_duplicate = 0
      AND spam_flag = 0
    THEN 1 ELSE 0
  END) AS clean_real_leads,
  SUM(CASE
    WHEN count_as_google_ads = 1
      AND count_as_real_lead = 1
      AND is_test = 0
      AND is_duplicate = 0
      AND spam_flag = 0
    THEN 1 ELSE 0
  END) AS clean_google_ads_leads,
  SUM(CASE
    WHEN lead_source_classification = 'direct_or_unknown'
      AND count_as_real_lead = 1
      AND is_test = 0
      AND is_duplicate = 0
      AND spam_flag = 0
    THEN 1 ELSE 0
  END) AS clean_unknown_leads,
  SUM(CASE
    WHEN source_system = 'historical_gmail_backfill'
      AND count_as_real_lead = 1
      AND is_test = 0
      AND is_duplicate = 0
      AND spam_flag = 0
    THEN 1 ELSE 0
  END) AS historical_backfill_real_leads
FROM leads;

CREATE VIEW IF NOT EXISTS clean_real_leads AS
SELECT *
FROM leads
WHERE count_as_real_lead = 1
  AND is_test = 0
  AND is_duplicate = 0
  AND spam_flag = 0;

CREATE VIEW IF NOT EXISTS clean_google_ads_leads AS
SELECT *
FROM leads
WHERE count_as_google_ads = 1
  AND count_as_real_lead = 1
  AND is_test = 0
  AND is_duplicate = 0
  AND spam_flag = 0;

CREATE VIEW IF NOT EXISTS clean_unknown_leads AS
SELECT *
FROM leads
WHERE lead_source_classification = 'direct_or_unknown'
  AND count_as_real_lead = 1
  AND is_test = 0
  AND is_duplicate = 0
  AND spam_flag = 0;
