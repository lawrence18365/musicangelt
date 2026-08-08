// Admin-only CSV export for the MusicAngel lead source of truth.
// Requires LEADS_EXPORT_TOKEN and LEADS_DB. Never expose this endpoint publicly
// without the token; lead rows contain customer PII.

const EXPORT_COLUMNS = [
    'lead_id', 'created_at', 'status', 'is_test', 'possible_duplicate',
    'duplicate_of_lead_id', 'spam_flag', 'lead_source_classification',
    'count_as_real_lead', 'count_as_google_ads', 'exclusion_reason',
    'confidence_level', 'name', 'email', 'phone', 'band_requested',
    'wedding_date', 'venue', 'county', 'gclid', 'gbraid', 'wbraid',
    'utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term',
    'campaign', 'ad_group', 'keyword', 'match_type', 'landing_page',
    'submitted_page_url', 'referrer', 'device', 'viewport', 'form_id',
    'request_id', 'email_delivery_status', 'customer_auto_reply_sent',
    'lead_quality', 'reply_status', 'quote_status', 'booking_status',
    'booking_date', 'booking_value', 'currency', 'revenue_collected',
    'lost_reason', 'notes'
];

function csvCell(value) {
    const s = String(value == null ? '' : value);
    return `"${s.replace(/"/g, '""')}"`;
}

function authorized(request, env) {
    const expected = env.LEADS_EXPORT_TOKEN || '';
    if (!expected) return false;

    const bearer = request.headers.get('Authorization') || '';
    if (bearer === `Bearer ${expected}`) return true;

    try {
        const url = new URL(request.url);
        return url.searchParams.get('token') === expected;
    } catch {
        return false;
    }
}

export async function onRequestGet({ request, env }) {
    if (!authorized(request, env)) {
        return new Response('Unauthorized', { status: 401 });
    }
    if (!env.LEADS_DB) {
        return new Response('LEADS_DB binding not configured', { status: 503 });
    }

    const url = new URL(request.url);
    const view = url.searchParams.get('view') || 'all';
    let source = 'leads';
    let where = '1=1';
    if (view === 'real') source = 'clean_real_leads';
    if (view === 'google_ads') source = 'clean_google_ads_leads';
    if (view === 'unknown') source = 'clean_unknown_leads';
    if (view === 'tests') where = 'is_test = 1';
    if (view === 'duplicates') where = 'possible_duplicate = 1 OR is_duplicate = 1';
    if (view === 'booked') where = "booking_status = 'booked'";

    const rows = await env.LEADS_DB.prepare(`
        SELECT ${EXPORT_COLUMNS.join(', ')}
        FROM ${source}
        WHERE ${where}
        ORDER BY created_unix_ms DESC
        LIMIT 5000
    `).all();

    const csv = [
        EXPORT_COLUMNS.map(csvCell).join(','),
        ...((rows.results || []).map(row => EXPORT_COLUMNS.map(col => csvCell(row[col])).join(',')))
    ].join('\n');

    return new Response(csv, {
        headers: {
            'Content-Type': 'text/csv; charset=utf-8',
            'Content-Disposition': `attachment; filename="musicangel-leads-${view}.csv"`
        }
    });
}

export async function onRequest({ request, env }) {
    if (request.method !== 'GET') {
        return new Response('Method not allowed', { status: 405, headers: { Allow: 'GET' } });
    }
    return onRequestGet({ request, env });
}
