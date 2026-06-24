const VALID_ACTIONS = new Set([
  'contacted',
  'qualified',
  'quote_sent',
  'booked',
  'went_cold',
  'lost'
]);

const ACTION_LABELS = {
  contacted: 'Contacted',
  qualified: 'Qualified',
  quote_sent: 'Quote sent',
  booked: 'Booked',
  went_cold: 'Went cold',
  lost: 'Lost'
};

const TERMINAL_STATUSES = new Set(['booked', 'lost']);

function json(data, status = 200, extraHeaders = {}) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'no-store',
      ...extraHeaders
    }
  });
}

function corsHeaders() {
  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Authorization, Content-Type, X-Lead-Logger-Token',
    'Access-Control-Max-Age': '86400'
  };
}

function clean(value, max = 1000) {
  return String(value == null ? '' : value).slice(0, max).trim();
}

function timingSafeEqual(a, b) {
  const left = String(a || '');
  const right = String(b || '');
  let mismatch = left.length ^ right.length;
  const len = Math.max(left.length, right.length);

  for (let i = 0; i < len; i += 1) {
    mismatch |= (left.charCodeAt(i) || 0) ^ (right.charCodeAt(i) || 0);
  }

  return mismatch === 0;
}

function requestToken(request) {
  const bearer = request.headers.get('Authorization') || '';
  if (bearer.toLowerCase().startsWith('bearer ')) {
    return bearer.slice(7).trim();
  }
  return request.headers.get('X-Lead-Logger-Token') || '';
}

function authorized(request, env) {
  const expected = env.LEAD_LOGGER_TOKEN || '';
  if (!expected) return false;
  return timingSafeEqual(requestToken(request), expected);
}

function requireAuth(request, env) {
  if (authorized(request, env)) return null;
  const configured = Boolean(env.LEAD_LOGGER_TOKEN);
  return json({
    ok: false,
    error: configured ? 'Unauthorized' : 'LEAD_LOGGER_TOKEN is not configured'
  }, configured ? 401 : 503, corsHeaders());
}

function safeLandingPath(value) {
  const raw = clean(value, 500);
  if (!raw) return '';

  try {
    const parsed = new URL(raw);
    return parsed.pathname || '/';
  } catch {
    const withoutQuery = raw.split('?')[0].split('#')[0];
    return withoutQuery || raw;
  }
}

function publicLead(row) {
  return {
    lead_id: row.lead_id,
    created_at: row.created_at,
    name: row.name || '',
    email: row.email || '',
    phone: row.phone || '',
    band_requested: row.band_requested || '',
    wedding_date: row.wedding_date || '',
    venue: row.venue || '',
    county: row.county || '',
    age_days: Number(row.age_days ?? 0),
    attribution_bucket: row.attribution_bucket || 'paid_unknown',
    landing_page: safeLandingPath(row.landing_page),
    lifecycle_status: row.lifecycle_status || 'pending',
    quote_status: row.quote_status || '',
    booking_status: row.booking_status || '',
    last_contact_at: row.last_contact_at || '',
    days_since_last_contact: row.days_since_last_contact == null
      ? null
      : Number(row.days_since_last_contact),
    contact_attempt_count: Number(row.contact_attempt_count || 0),
    notes: row.notes || ''
  };
}

function parseAttempts(value) {
  if (!value) return [];
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed : [{ legacy_value: parsed }];
  } catch {
    return [{ legacy_invalid_json: String(value).slice(0, 2000) }];
  }
}

function appendNote(existing, action, note, now) {
  const trimmed = clean(note, 2000);
  if (!trimmed) return existing || '';

  const stamp = now.slice(0, 16).replace('T', ' ');
  const line = `[${stamp} ${ACTION_LABELS[action]}] ${trimmed}`;
  return [existing || '', line].filter(Boolean).join('\n').trim();
}

function parseBookingValue(value) {
  if (value == null || value === '') return { ok: true, value: undefined };
  const n = Number(value);
  if (!Number.isFinite(n) || n < 0) {
    return { ok: false, error: 'booking_value must be a non-negative number' };
  }
  return { ok: true, value: n };
}

function mappedUpdate(row, body, now) {
  const action = clean(body.action, 40);
  if (!VALID_ACTIONS.has(action)) {
    return { ok: false, status: 400, error: 'Invalid action' };
  }

  const bookingValue = parseBookingValue(body.booking_value);
  if (!bookingValue.ok) {
    return { ok: false, status: 400, error: bookingValue.error };
  }

  const lostReason = clean(body.lost_reason, 500);
  if (action === 'lost' && !lostReason) {
    return { ok: false, status: 400, error: 'lost_reason is required when action is lost' };
  }

  const currentLifecycle = row.lifecycle_status || 'pending';
  const next = {
    lifecycle_status: currentLifecycle,
    reply_status: row.reply_status || '',
    quote_status: row.quote_status || '',
    booking_status: row.booking_status || '',
    booking_date: row.booking_date || '',
    booking_value: row.booking_value == null || row.booking_value === '' ? null : row.booking_value,
    lost_reason: row.lost_reason || '',
    notes: appendNote(row.notes || '', action, body.notes, now)
  };

  if (action === 'contacted') {
    if (!TERMINAL_STATUSES.has(currentLifecycle)) next.lifecycle_status = currentLifecycle || 'pending';
    next.reply_status = 'contacted';
  }

  if (action === 'qualified') {
    next.lifecycle_status = 'qualified';
    next.reply_status = 'contacted';
  }

  if (action === 'quote_sent') {
    next.lifecycle_status = 'quoted';
    next.reply_status = 'contacted';
    next.quote_status = 'sent';
  }

  if (action === 'booked') {
    next.lifecycle_status = 'booked';
    next.reply_status = 'contacted';
    next.quote_status = next.quote_status || 'sent';
    next.booking_status = 'booked';
    next.booking_date = next.booking_date || now.slice(0, 10);
    next.booking_value = bookingValue.value === undefined ? next.booking_value : bookingValue.value;
    next.lost_reason = '';
  }

  if (action === 'went_cold') {
    next.lifecycle_status = 'unreachable';
    next.reply_status = 'went_cold';
  }

  if (action === 'lost') {
    next.lifecycle_status = 'lost';
    next.reply_status = 'contacted';
    next.booking_status = 'lost';
    next.lost_reason = lostReason;
  }

  return { ok: true, action, next };
}

async function listLeads(env) {
  if (!env.LEADS_DB) {
    return json({ ok: false, error: 'LEADS_DB binding is not configured' }, 503, corsHeaders());
  }

  const now = new Date().toISOString();
  const result = await env.LEADS_DB.prepare(`
    SELECT
      lead_id,
      created_at,
      COALESCE(name, '') AS name,
      COALESCE(email, '') AS email,
      COALESCE(phone, '') AS phone,
      COALESCE(band_requested, '') AS band_requested,
      COALESCE(wedding_date, '') AS wedding_date,
      COALESCE(venue, '') AS venue,
      COALESCE(county, '') AS county,
      ROUND(julianday(?) - julianday(created_at), 1) AS age_days,
      COALESCE(NULLIF(attribution_bucket, ''), 'paid_unknown') AS attribution_bucket,
      COALESCE(
        NULLIF(landing_page, ''),
        NULLIF(submitted_page_url, ''),
        NULLIF(first_seen_landing_page, ''),
        ''
      ) AS landing_page,
      COALESCE(NULLIF(lifecycle_status, ''), 'pending') AS lifecycle_status,
      COALESCE(quote_status, '') AS quote_status,
      COALESCE(booking_status, '') AS booking_status,
      COALESCE(last_contact_at, '') AS last_contact_at,
      CASE
        WHEN NULLIF(last_contact_at, '') IS NULL THEN NULL
        ELSE ROUND(julianday(?) - julianday(last_contact_at), 1)
      END AS days_since_last_contact,
      COALESCE(contact_attempt_count, 0) AS contact_attempt_count,
      COALESCE(notes, '') AS notes,
      created_unix_ms
    FROM leads
    WHERE count_as_google_ads = 1
      AND count_as_real_lead = 1
      AND is_test = 0
      AND is_duplicate = 0
      AND spam_flag = 0
    ORDER BY
      CASE
        WHEN COALESCE(NULLIF(lifecycle_status, ''), 'pending') IN ('pending', 'qualified', 'quoted', 'unreachable') THEN 0
        WHEN COALESCE(booking_status, '') NOT IN ('booked', 'lost') THEN 1
        ELSE 2
      END ASC,
      CASE WHEN NULLIF(last_contact_at, '') IS NULL THEN 0 ELSE 1 END ASC,
      created_unix_ms DESC,
      created_at DESC
    LIMIT 200
  `).bind(now, now).all();

  return json({
    ok: true,
    generated_at: now,
    leads: (result.results || []).map(publicLead)
  }, 200, corsHeaders());
}

async function getLeadForUpdate(env, leadId) {
  return env.LEADS_DB.prepare(`
    SELECT
      lead_id,
      created_at,
      COALESCE(NULLIF(attribution_bucket, ''), 'paid_unknown') AS attribution_bucket,
      COALESCE(
        NULLIF(landing_page, ''),
        NULLIF(submitted_page_url, ''),
        NULLIF(first_seen_landing_page, ''),
        ''
      ) AS landing_page,
      COALESCE(NULLIF(lifecycle_status, ''), 'pending') AS lifecycle_status,
      COALESCE(reply_status, '') AS reply_status,
      COALESCE(quote_status, '') AS quote_status,
      COALESCE(booking_status, '') AS booking_status,
      COALESCE(booking_date, '') AS booking_date,
      booking_value,
      COALESCE(lost_reason, '') AS lost_reason,
      COALESCE(notes, '') AS notes,
      COALESCE(contact_attempt_count, 0) AS contact_attempt_count,
      COALESCE(contact_attempts_json, '[]') AS contact_attempts_json,
      COALESCE(last_contact_at, '') AS last_contact_at
    FROM leads
    WHERE lead_id = ?
      AND count_as_google_ads = 1
      AND count_as_real_lead = 1
      AND is_test = 0
      AND is_duplicate = 0
      AND spam_flag = 0
    LIMIT 1
  `).bind(leadId).first();
}

async function getPublicLead(env, leadId) {
  const now = new Date().toISOString();
  const row = await env.LEADS_DB.prepare(`
    SELECT
      lead_id,
      created_at,
      COALESCE(name, '') AS name,
      COALESCE(email, '') AS email,
      COALESCE(phone, '') AS phone,
      COALESCE(band_requested, '') AS band_requested,
      COALESCE(wedding_date, '') AS wedding_date,
      COALESCE(venue, '') AS venue,
      COALESCE(county, '') AS county,
      ROUND(julianday(?) - julianday(created_at), 1) AS age_days,
      COALESCE(NULLIF(attribution_bucket, ''), 'paid_unknown') AS attribution_bucket,
      COALESCE(
        NULLIF(landing_page, ''),
        NULLIF(submitted_page_url, ''),
        NULLIF(first_seen_landing_page, ''),
        ''
      ) AS landing_page,
      COALESCE(NULLIF(lifecycle_status, ''), 'pending') AS lifecycle_status,
      COALESCE(quote_status, '') AS quote_status,
      COALESCE(booking_status, '') AS booking_status,
      COALESCE(last_contact_at, '') AS last_contact_at,
      CASE
        WHEN NULLIF(last_contact_at, '') IS NULL THEN NULL
        ELSE ROUND(julianday(?) - julianday(last_contact_at), 1)
      END AS days_since_last_contact,
      COALESCE(contact_attempt_count, 0) AS contact_attempt_count,
      COALESCE(notes, '') AS notes
    FROM leads
    WHERE lead_id = ?
    LIMIT 1
  `).bind(now, now, leadId).first();

  return row ? publicLead(row) : null;
}

async function updateLead(request, env, leadId) {
  if (!env.LEADS_DB) {
    return json({ ok: false, error: 'LEADS_DB binding is not configured' }, 503, corsHeaders());
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return json({ ok: false, error: 'Expected a JSON request body' }, 400, corsHeaders());
  }

  const row = await getLeadForUpdate(env, leadId);
  if (!row) {
    return json({ ok: false, error: 'Lead not found in current paid cohort' }, 404, corsHeaders());
  }

  const now = new Date().toISOString();
  const mapped = mappedUpdate(row, body, now);
  if (!mapped.ok) {
    return json({ ok: false, error: mapped.error }, mapped.status, corsHeaders());
  }

  const attempts = parseAttempts(row.contact_attempts_json);
  attempts.push({
    at: now,
    action: mapped.action,
    label: ACTION_LABELS[mapped.action],
    notes: clean(body.notes, 2000),
    lost_reason: mapped.action === 'lost' ? mapped.next.lost_reason : '',
    booking_value: mapped.action === 'booked' && body.booking_value !== undefined
      ? mapped.next.booking_value
      : null,
    source: 'lead_logger'
  });

  await env.LEADS_DB.prepare(`
    UPDATE leads
    SET lifecycle_status = ?,
        reply_status = ?,
        quote_status = ?,
        booking_status = ?,
        booking_date = ?,
        booking_value = ?,
        lost_reason = ?,
        notes = ?,
        contact_attempts_json = ?,
        contact_attempt_count = COALESCE(contact_attempt_count, 0) + 1,
        last_contact_at = ?,
        last_updated_at = ?,
        updated_by = 'lead_logger'
    WHERE lead_id = ?
      AND count_as_google_ads = 1
      AND count_as_real_lead = 1
      AND is_test = 0
      AND is_duplicate = 0
      AND spam_flag = 0
  `).bind(
    mapped.next.lifecycle_status,
    mapped.next.reply_status,
    mapped.next.quote_status,
    mapped.next.booking_status,
    mapped.next.booking_date,
    mapped.next.booking_value == null ? null : mapped.next.booking_value,
    mapped.next.lost_reason,
    mapped.next.notes,
    JSON.stringify(attempts),
    now,
    now,
    leadId
  ).run();

  const updated = await getPublicLead(env, leadId);

  return json({
    ok: true,
    action: mapped.action,
    updated_lead: updated
  }, 200, corsHeaders());
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const path = url.pathname.replace(/\/+$/, '') || '/';

    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: corsHeaders() });
    }

    if (path === '/leads' && request.method === 'GET') {
      const authError = requireAuth(request, env);
      if (authError) return authError;
      return listLeads(env);
    }

    const updateMatch = path.match(/^\/leads\/([^/]+)\/update$/);
    if (updateMatch && request.method === 'POST') {
      const authError = requireAuth(request, env);
      if (authError) return authError;
      return updateLead(request, env, decodeURIComponent(updateMatch[1]));
    }

    if (path.startsWith('/leads')) {
      return json({ ok: false, error: 'Not found' }, 404, corsHeaders());
    }

    if (env.ASSETS) {
      return env.ASSETS.fetch(request);
    }

    return new Response('Lead logger assets are not configured', {
      status: 503,
      headers: { 'Content-Type': 'text/plain; charset=utf-8' }
    });
  }
};
