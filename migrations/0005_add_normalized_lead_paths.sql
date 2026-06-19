-- Add normalized URL path fields for landing-page conversion reporting.
-- Raw URL fields remain unchanged for audit/debugging.

ALTER TABLE leads ADD COLUMN landing_path TEXT;
ALTER TABLE leads ADD COLUMN submitted_path TEXT;
ALTER TABLE leads ADD COLUMN first_landing_path TEXT;

UPDATE leads
SET
  landing_path = CASE
    WHEN landing_page IS NULL OR landing_page = '' THEN ''
    WHEN instr(substr(landing_page, instr(landing_page, '://') + 3), '/') = 0 THEN '/'
    ELSE substr(
      substr(landing_page, instr(landing_page, '://') + 3),
      instr(substr(landing_page, instr(landing_page, '://') + 3), '/'),
      CASE
        WHEN instr(substr(substr(landing_page, instr(landing_page, '://') + 3), instr(substr(landing_page, instr(landing_page, '://') + 3), '/')), '?') > 0
        THEN instr(substr(substr(landing_page, instr(landing_page, '://') + 3), instr(substr(landing_page, instr(landing_page, '://') + 3), '/')), '?') - 1
        WHEN instr(substr(substr(landing_page, instr(landing_page, '://') + 3), instr(substr(landing_page, instr(landing_page, '://') + 3), '/')), '#') > 0
        THEN instr(substr(substr(landing_page, instr(landing_page, '://') + 3), instr(substr(landing_page, instr(landing_page, '://') + 3), '/')), '#') - 1
        ELSE length(substr(substr(landing_page, instr(landing_page, '://') + 3), instr(substr(landing_page, instr(landing_page, '://') + 3), '/')))
      END
    )
  END,
  submitted_path = CASE
    WHEN submitted_page_url IS NULL OR submitted_page_url = '' THEN ''
    WHEN instr(substr(submitted_page_url, instr(submitted_page_url, '://') + 3), '/') = 0 THEN '/'
    ELSE substr(
      substr(submitted_page_url, instr(submitted_page_url, '://') + 3),
      instr(substr(submitted_page_url, instr(submitted_page_url, '://') + 3), '/'),
      CASE
        WHEN instr(substr(substr(submitted_page_url, instr(submitted_page_url, '://') + 3), instr(substr(submitted_page_url, instr(submitted_page_url, '://') + 3), '/')), '?') > 0
        THEN instr(substr(substr(submitted_page_url, instr(submitted_page_url, '://') + 3), instr(substr(submitted_page_url, instr(submitted_page_url, '://') + 3), '/')), '?') - 1
        WHEN instr(substr(substr(submitted_page_url, instr(submitted_page_url, '://') + 3), instr(substr(submitted_page_url, instr(submitted_page_url, '://') + 3), '/')), '#') > 0
        THEN instr(substr(substr(submitted_page_url, instr(submitted_page_url, '://') + 3), instr(substr(submitted_page_url, instr(submitted_page_url, '://') + 3), '/')), '#') - 1
        ELSE length(substr(substr(submitted_page_url, instr(submitted_page_url, '://') + 3), instr(substr(submitted_page_url, instr(submitted_page_url, '://') + 3), '/')))
      END
    )
  END,
  first_landing_path = CASE
    WHEN first_seen_landing_page IS NULL OR first_seen_landing_page = '' THEN ''
    WHEN instr(substr(first_seen_landing_page, instr(first_seen_landing_page, '://') + 3), '/') = 0 THEN '/'
    ELSE substr(
      substr(first_seen_landing_page, instr(first_seen_landing_page, '://') + 3),
      instr(substr(first_seen_landing_page, instr(first_seen_landing_page, '://') + 3), '/'),
      CASE
        WHEN instr(substr(substr(first_seen_landing_page, instr(first_seen_landing_page, '://') + 3), instr(substr(first_seen_landing_page, instr(first_seen_landing_page, '://') + 3), '/')), '?') > 0
        THEN instr(substr(substr(first_seen_landing_page, instr(first_seen_landing_page, '://') + 3), instr(substr(first_seen_landing_page, instr(first_seen_landing_page, '://') + 3), '/')), '?') - 1
        WHEN instr(substr(substr(first_seen_landing_page, instr(first_seen_landing_page, '://') + 3), instr(substr(first_seen_landing_page, instr(first_seen_landing_page, '://') + 3), '/')), '#') > 0
        THEN instr(substr(substr(first_seen_landing_page, instr(first_seen_landing_page, '://') + 3), instr(substr(first_seen_landing_page, instr(first_seen_landing_page, '://') + 3), '/')), '#') - 1
        ELSE length(substr(substr(first_seen_landing_page, instr(first_seen_landing_page, '://') + 3), instr(substr(first_seen_landing_page, instr(first_seen_landing_page, '://') + 3), '/')))
      END
    )
  END;

CREATE INDEX IF NOT EXISTS idx_leads_submitted_path ON leads(submitted_path);
CREATE INDEX IF NOT EXISTS idx_leads_landing_path ON leads(landing_path);
CREATE INDEX IF NOT EXISTS idx_leads_first_landing_path ON leads(first_landing_path);

CREATE VIEW IF NOT EXISTS clean_real_leads_by_submitted_path AS
SELECT
  COALESCE(NULLIF(submitted_path, ''), '(unknown)') AS submitted_path,
  COUNT(*) AS clean_real_leads,
  SUM(CASE WHEN count_as_google_ads = 1 THEN 1 ELSE 0 END) AS clean_google_ads_leads,
  SUM(CASE WHEN lead_source_classification = 'organic_search' THEN 1 ELSE 0 END) AS clean_organic_leads,
  SUM(CASE WHEN lead_source_classification = 'direct_or_unknown' THEN 1 ELSE 0 END) AS clean_unknown_leads
FROM leads
WHERE count_as_real_lead = 1
  AND is_test = 0
  AND is_duplicate = 0
  AND spam_flag = 0
GROUP BY COALESCE(NULLIF(submitted_path, ''), '(unknown)');

CREATE VIEW IF NOT EXISTS clean_real_leads_by_landing_path AS
SELECT
  COALESCE(NULLIF(landing_path, ''), '(unknown)') AS landing_path,
  COUNT(*) AS clean_real_leads,
  SUM(CASE WHEN count_as_google_ads = 1 THEN 1 ELSE 0 END) AS clean_google_ads_leads,
  SUM(CASE WHEN lead_source_classification = 'organic_search' THEN 1 ELSE 0 END) AS clean_organic_leads,
  SUM(CASE WHEN lead_source_classification = 'direct_or_unknown' THEN 1 ELSE 0 END) AS clean_unknown_leads
FROM leads
WHERE count_as_real_lead = 1
  AND is_test = 0
  AND is_duplicate = 0
  AND spam_flag = 0
GROUP BY COALESCE(NULLIF(landing_path, ''), '(unknown)');
