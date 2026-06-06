-- MusicAngel source-of-truth lead ledger.
-- Stores future enquiry submissions at form-submit time so Gmail notifications
-- are no longer the primary source for CPL or booking outcomes.

CREATE TABLE IF NOT EXISTS leads (
  lead_id TEXT PRIMARY KEY,
  created_at TEXT NOT NULL,
  received_datetime TEXT NOT NULL,
  environment TEXT NOT NULL DEFAULT 'production',
  status TEXT NOT NULL DEFAULT 'new',
  is_test INTEGER NOT NULL DEFAULT 0,
  is_duplicate INTEGER NOT NULL DEFAULT 0,
  duplicate_of_lead_id TEXT,
  possible_duplicate INTEGER NOT NULL DEFAULT 0,
  spam_flag INTEGER NOT NULL DEFAULT 0,
  lead_source_classification TEXT NOT NULL DEFAULT 'direct_or_unknown',
  count_as_real_lead INTEGER NOT NULL DEFAULT 1,
  count_as_google_ads INTEGER NOT NULL DEFAULT 0,
  exclusion_reason TEXT,
  confidence_level TEXT NOT NULL DEFAULT 'medium',

  name TEXT,
  partner TEXT,
  email TEXT,
  phone TEXT,
  message TEXT,
  band_requested TEXT,
  wedding_date TEXT,
  venue TEXT,
  county TEXT,
  package_or_service_interest TEXT,
  preferred_contact_method TEXT,

  gclid TEXT,
  gbraid TEXT,
  wbraid TEXT,
  utm_source TEXT,
  utm_medium TEXT,
  utm_campaign TEXT,
  utm_id TEXT,
  utm_content TEXT,
  utm_term TEXT,
  utm_adgroup TEXT,
  utm_matchtype TEXT,
  utm_network TEXT,
  attribution_source TEXT,
  attribution_source_detail TEXT,
  campaign TEXT,
  ad_group TEXT,
  keyword TEXT,
  match_type TEXT,
  landing_page TEXT,
  submitted_page_url TEXT,
  referrer TEXT,
  first_seen_landing_page TEXT,
  first_seen_referrer TEXT,
  first_external_referrer TEXT,
  session_id TEXT,
  client_id_if_available TEXT,

  device TEXT,
  viewport TEXT,
  user_agent TEXT,
  ip_hash_or_partial_ip TEXT,
  form_id TEXT,
  api_endpoint TEXT,
  request_id TEXT,
  email_delivery_status TEXT,
  admin_email_sent_to TEXT,
  customer_auto_reply_sent INTEGER NOT NULL DEFAULT 0,
  google_ads_conversion_attempted INTEGER NOT NULL DEFAULT 0,
  meta_conversion_attempted INTEGER NOT NULL DEFAULT 0,
  ga4_event_attempted INTEGER NOT NULL DEFAULT 0,

  lead_quality TEXT,
  reply_status TEXT,
  quote_status TEXT,
  booking_status TEXT,
  booking_date TEXT,
  booking_value REAL,
  currency TEXT DEFAULT 'EUR',
  revenue_collected REAL,
  lost_reason TEXT,
  notes TEXT,

  evidence_summary TEXT,
  last_updated_at TEXT NOT NULL,
  updated_by TEXT NOT NULL DEFAULT 'api',
  source_system TEXT NOT NULL DEFAULT 'musicangel_site',
  raw_attribution_json TEXT,
  created_unix_ms INTEGER NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_leads_created_at ON leads(created_at);
CREATE INDEX IF NOT EXISTS idx_leads_source ON leads(lead_source_classification);
CREATE INDEX IF NOT EXISTS idx_leads_google_ads ON leads(count_as_google_ads, is_test, is_duplicate, spam_flag);
CREATE INDEX IF NOT EXISTS idx_leads_email_date ON leads(email, wedding_date);
CREATE INDEX IF NOT EXISTS idx_leads_phone_band_date ON leads(phone, band_requested, wedding_date);
CREATE INDEX IF NOT EXISTS idx_leads_booking_status ON leads(booking_status);
