-- Paid lead classification protocol.
-- Adds explicit lifecycle and attribution fields used before any Google Ads
-- optimization decisions. These columns intentionally separate lead capture
-- from downstream sales outcomes.

ALTER TABLE leads ADD COLUMN lifecycle_status TEXT DEFAULT 'pending';
ALTER TABLE leads ADD COLUMN attribution_bucket TEXT DEFAULT '';
ALTER TABLE leads ADD COLUMN contact_attempt_count INTEGER NOT NULL DEFAULT 0;
ALTER TABLE leads ADD COLUMN contact_attempts_json TEXT DEFAULT '[]';
ALTER TABLE leads ADD COLUMN last_contact_at TEXT DEFAULT '';

CREATE INDEX IF NOT EXISTS idx_leads_lifecycle_status
  ON leads(lifecycle_status);

CREATE INDEX IF NOT EXISTS idx_leads_attribution_bucket
  ON leads(attribution_bucket);
