// Cloudflare Pages Function: POST /api/enquiry
// Mirrors the Vercel API route so the site can run fully on Cloudflare Pages.

const TO_INTERNAL_DEFAULT = 'jo.musicangel@gmail.com';
const FROM_DEFAULT = 'MusicAngel <hello@ratetapmx.com>';
const REPLY_NAME = 'Jo at MusicAngel';

const ALLOWED_ORIGINS = new Set([
    'https://musicangel.ie',
    'https://www.musicangel.ie',
    'https://musicangelt.pages.dev'
]);

const MIN_FILL_SECONDS = 3;
const RATE_WINDOW_MS = 10 * 60 * 1000;
const RATE_MAX = 5;
const rateBucket = new Map();

function json(data, status = 200, headers = {}) {
    return new Response(JSON.stringify(data), {
        status,
        headers: {
            'Content-Type': 'application/json; charset=utf-8',
            ...headers
        }
    });
}

function isAllowedOrigin(origin) {
    if (!origin) return false;
    if (ALLOWED_ORIGINS.has(origin)) return true;
    try {
        const host = new URL(origin).hostname;
        return host === 'musicangelt.pages.dev' || host.endsWith('.musicangelt.pages.dev');
    } catch {
        return false;
    }
}

function corsHeaders(request) {
    const origin = request.headers.get('Origin') || '';
    if (isAllowedOrigin(origin)) {
        return {
            'Access-Control-Allow-Origin': origin,
            'Access-Control-Allow-Methods': 'POST, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type',
            Vary: 'Origin'
        };
    }
    return {
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type'
    };
}

function clientIp(request) {
    return request.headers.get('CF-Connecting-IP')
        || (request.headers.get('X-Forwarded-For') || '').split(',')[0].trim()
        || 'unknown';
}

function rateLimited(ip) {
    const now = Date.now();
    const arr = (rateBucket.get(ip) || []).filter(t => now - t < RATE_WINDOW_MS);
    if (arr.length >= RATE_MAX) {
        rateBucket.set(ip, arr);
        return true;
    }
    arr.push(now);
    rateBucket.set(ip, arr);
    if (rateBucket.size > 5000) {
        for (const [k, v] of rateBucket) {
            if (!v.length || now - v[v.length - 1] > RATE_WINDOW_MS) rateBucket.delete(k);
        }
    }
    return false;
}

function esc(s) {
    return String(s == null ? '' : s)
        .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}

function validEmail(s) {
    return typeof s === 'string' && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s.trim()) && s.length <= 254;
}

function clean(s, max) {
    if (s == null) return '';
    return String(s).slice(0, max).trim();
}

function cleanKey(value, max = 80) {
    return clean(value, max).toLowerCase();
}

function randomHex(bytes = 4) {
    const arr = new Uint8Array(bytes);
    crypto.getRandomValues(arr);
    return Array.from(arr).map(n => n.toString(16).padStart(2, '0')).join('');
}

function generateLeadId(date = new Date()) {
    const day = date.toISOString().slice(0, 10).replace(/-/g, '');
    return `MA-${day}-${randomHex(5).toUpperCase()}`;
}

async function sha256Hex(value) {
    if (!value || !crypto.subtle) return '';
    const encoded = new TextEncoder().encode(value);
    const digest = await crypto.subtle.digest('SHA-256', encoded);
    return Array.from(new Uint8Array(digest)).map(n => n.toString(16).padStart(2, '0')).join('');
}

function containsTestMarker(values) {
    return values.some(value => /\btest\b|TEST_|codex|do not count|do-not-count/i.test(String(value || '')));
}

function rootHost(value) {
    try {
        return new URL(value).hostname.replace(/^www\./i, '').toLowerCase();
    } catch {
        return '';
    }
}

function isSearchHost(value) {
    const host = rootHost(value);
    return ['google.', 'bing.', 'yahoo.', 'duckduckgo.', 'ecosia.', 'search.brave.', 'search.yahoo.']
        .some(needle => host.includes(needle));
}

function isInternalUrl(value) {
    const host = rootHost(value);
    return host === 'musicangel.ie' || host === 'musicangelt.pages.dev' || host.endsWith('.musicangelt.pages.dev');
}

function classifyLead({ name, email, message, campaign, page, referrer }) {
    const source = cleanKey(campaign.utm_source);
    const medium = cleanKey(campaign.utm_medium);
    const attribution = cleanKey(campaign.attribution_source);
    const firstReferrer = campaign.first_external_referrer || campaign.first_landing_referrer || referrer || '';
    const hasPaidClickId = Boolean(campaign.gclid || campaign.gbraid || campaign.wbraid);
    const isPaidGoogle = hasPaidClickId
        || attribution === 'google_ads'
        || (source === 'google' && /^(cpc|ppc|paid|paid_search)$/.test(medium));
    const isTest = containsTestMarker([
        name, email, message, page, campaign.gclid, campaign.gbraid, campaign.wbraid,
        campaign.utm_campaign, campaign.utm_content, campaign.utm_term
    ]);

    if (isTest) {
        return {
            status: 'test',
            classification: 'test',
            isTest: 1,
            countAsRealLead: 0,
            countAsGoogleAds: 0,
            exclusionReason: 'Marked as test submission',
            confidenceLevel: 'high'
        };
    }

    if (isPaidGoogle) {
        return {
            status: 'new',
            classification: 'google_ads',
            isTest: 0,
            countAsRealLead: 1,
            countAsGoogleAds: 1,
            exclusionReason: '',
            confidenceLevel: hasPaidClickId ? 'high' : 'medium'
        };
    }

    if (attribution === 'organic_search' || isSearchHost(firstReferrer)) {
        return {
            status: 'new',
            classification: 'organic_search',
            isTest: 0,
            countAsRealLead: 1,
            countAsGoogleAds: 0,
            exclusionReason: '',
            confidenceLevel: 'medium'
        };
    }

    if (firstReferrer && firstReferrer !== '(direct)' && !isInternalUrl(firstReferrer)) {
        return {
            status: 'new',
            classification: 'referral',
            isTest: 0,
            countAsRealLead: 1,
            countAsGoogleAds: 0,
            exclusionReason: '',
            confidenceLevel: 'medium'
        };
    }

    return {
        status: 'new',
        classification: 'direct_or_unknown',
        isTest: 0,
        countAsRealLead: 1,
        countAsGoogleAds: 0,
        exclusionReason: '',
        confidenceLevel: 'low'
    };
}

async function findDuplicateLead(db, record) {
    if (!db || record.is_test || record.spam_flag) return null;
    const sevenDaysAgo = record.created_unix_ms - (7 * 24 * 60 * 60 * 1000);
    const email = record.email || '';
    const phone = record.phone || '';
    const weddingDate = record.wedding_date || '';
    const band = record.band_requested || '';
    const venue = record.venue || '';
    const name = record.name || '';

    if (!email && !phone && !name) return null;

    const result = await db.prepare(`
        SELECT lead_id
        FROM leads
        WHERE created_unix_ms >= ?
          AND is_test = 0
          AND spam_flag = 0
          AND (
            (? != '' AND lower(email) = lower(?) AND wedding_date = ?)
            OR (? != '' AND phone = ? AND band_requested = ? AND wedding_date = ?)
            OR (? != '' AND lower(name) = lower(?) AND venue = ? AND wedding_date = ?)
          )
        ORDER BY created_unix_ms DESC
        LIMIT 1
    `).bind(
        sevenDaysAgo,
        email, email, weddingDate,
        phone, phone, band, weddingDate,
        name, name, venue, weddingDate
    ).first();

    return result || null;
}

async function saveLeadRecord(db, record) {
    if (!db) return { stored: false, reason: 'LEADS_DB binding not configured' };

    const duplicate = await findDuplicateLead(db, record);
    if (duplicate) {
        record.possible_duplicate = 1;
        record.duplicate_of_lead_id = duplicate.lead_id;
        record.evidence_summary = `${record.evidence_summary}; possible duplicate of ${duplicate.lead_id}`;
    }

    const columns = [
        'lead_id', 'created_at', 'received_datetime', 'environment', 'status', 'is_test',
        'is_duplicate', 'duplicate_of_lead_id', 'possible_duplicate', 'spam_flag',
        'lead_source_classification', 'count_as_real_lead', 'count_as_google_ads',
        'exclusion_reason', 'confidence_level',
        'name', 'partner', 'email', 'phone', 'message', 'band_requested', 'wedding_date',
        'venue', 'county', 'package_or_service_interest', 'preferred_contact_method',
        'gclid', 'gbraid', 'wbraid', 'utm_source', 'utm_medium', 'utm_campaign', 'utm_id',
        'utm_content', 'utm_term', 'utm_adgroup', 'utm_matchtype', 'utm_network',
        'attribution_source', 'attribution_source_detail', 'campaign', 'ad_group',
        'keyword', 'match_type', 'landing_page', 'submitted_page_url', 'referrer',
        'first_seen_landing_page', 'first_seen_referrer', 'first_external_referrer',
        'session_id', 'client_id_if_available',
        'device', 'viewport', 'user_agent', 'ip_hash_or_partial_ip', 'form_id',
        'api_endpoint', 'request_id', 'email_delivery_status', 'admin_email_sent_to',
        'customer_auto_reply_sent', 'google_ads_conversion_attempted',
        'meta_conversion_attempted', 'ga4_event_attempted',
        'lead_quality', 'reply_status', 'quote_status', 'booking_status', 'booking_date',
        'booking_value', 'currency', 'revenue_collected', 'lost_reason', 'notes',
        'evidence_summary', 'last_updated_at', 'updated_by', 'source_system',
        'raw_attribution_json', 'created_unix_ms'
    ];

    await db.prepare(`
        INSERT INTO leads (${columns.join(', ')})
        VALUES (${columns.map(() => '?').join(', ')})
    `).bind(...columns.map(key => record[key] ?? null)).run();

    return { stored: true, possibleDuplicate: Boolean(record.possible_duplicate) };
}

async function updateLeadEmailStatus(db, leadId, status, customerAutoReplySent) {
    if (!db || !leadId) return;
    await db.prepare(`
        UPDATE leads
        SET email_delivery_status = ?,
            customer_auto_reply_sent = ?,
            last_updated_at = ?
        WHERE lead_id = ?
    `).bind(status, customerAutoReplySent ? 1 : 0, new Date().toISOString(), leadId).run();
}

function tableRows(rows) {
    return rows.map(([label, value]) => `
        <tr><td style="vertical-align:top"><strong>${esc(label)}</strong></td><td style="white-space:pre-wrap">${value ? esc(value) : ''}</td></tr>
    `).join('');
}

async function sendEmail(key, payload) {
    const resp = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
            Authorization: `Bearer ${key}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
    });
    if (!resp.ok) {
        const detail = await resp.text();
        throw new Error(`Resend ${resp.status}: ${detail}`);
    }
    return resp.json();
}

function handleOptions(request) {
    return new Response(null, { status: 204, headers: corsHeaders(request) });
}

async function handlePost({ request, env }) {
    const headers = corsHeaders(request);
    const origin = request.headers.get('Origin') || '';
    const requestOrigin = new URL(request.url).origin;

    if (origin && origin !== requestOrigin && !isAllowedOrigin(origin)) {
        return json({ error: 'Origin not allowed' }, 403, headers);
    }

    const ip = clientIp(request);
    if (rateLimited(ip)) {
        return json({ error: 'Too many submissions, please try again later' }, 429, headers);
    }

    const key = env.RESEND_API_KEY;
    if (!key) {
        return json({ error: 'Email backend not configured' }, 503, headers);
    }

    let body = {};
    try {
        body = await request.json();
    } catch {
        body = {};
    }

    if (body.hp) return json({ ok: true }, 200, headers);

    if (typeof body._t === 'number') {
        const seconds = (Date.now() - body._t) / 1000;
        if (seconds < MIN_FILL_SECONDS) {
            return json({ error: 'Please wait a moment and try again' }, 400, headers);
        }
    }

    const name = clean(body.name, 120);
    const partner = clean(body.partner, 120);
    const email = clean(body.email, 254);
    const phone = clean(body.phone, 80);
    const date = clean(body.date, 32);
    const venue = clean(body.venue, 240);
    const county = clean(body.county, 120);
    const band = clean(body.band, 80);
    const message = clean(body.message, 4000);
    const page = clean(body.page, 500);
    const referrer = clean(body.referrer, 500);
    const device = clean(body.device, 40);
    const viewport = clean(body.viewport, 40);
    const userAgent = clean(body.user_agent, 500);
    const formId = clean(body.form_id, 120);
    const sessionId = clean(body.session_id, 160);
    const preferredContactMethod = clean(body.preferred_contact_method, 80);
    const packageInterest = clean(body.package_or_service_interest, 160);
    const campaign = {
        utm_source: clean(body.utm_source, 120),
        utm_medium: clean(body.utm_medium, 120),
        utm_campaign: clean(body.utm_campaign, 180),
        utm_id: clean(body.utm_id, 180),
        utm_term: clean(body.utm_term, 180),
        utm_content: clean(body.utm_content, 180),
        utm_adgroup: clean(body.utm_adgroup, 180),
        utm_matchtype: clean(body.utm_matchtype, 80),
        utm_network: clean(body.utm_network, 80),
        gclid: clean(body.gclid, 180),
        gbraid: clean(body.gbraid, 180),
        wbraid: clean(body.wbraid, 180),
        gad_source: clean(body.gad_source, 80),
        gad_campaignid: clean(body.gad_campaignid, 180),
        gad_adgroupid: clean(body.gad_adgroupid, 180),
        gad_creativeid: clean(body.gad_creativeid, 180),
        gad_keyword: clean(body.gad_keyword, 180),
        gad_matchtype: clean(body.gad_matchtype, 80),
        gad_network: clean(body.gad_network, 80),
        msclkid: clean(body.msclkid, 180),
        fbclid: clean(body.fbclid, 180),
        li_fat_id: clean(body.li_fat_id, 180),
        first_landing_page: clean(body.first_landing_page, 500),
        first_landing_referrer: clean(body.first_landing_referrer, 500),
        first_external_referrer: clean(body.first_external_referrer, 500),
        landing_page: clean(body.landing_page, 500),
        landing_referrer: clean(body.landing_referrer, 500),
        attribution_source: clean(body.attribution_source, 120),
        attribution_source_detail: clean(body.attribution_source_detail, 240),
        attribution_updated_at: clean(body.attribution_updated_at, 80)
    };

    if (!name || !validEmail(email)) {
        return json({ error: 'Name and a valid email are required' }, 400, headers);
    }

    const now = new Date();
    const leadId = generateLeadId(now);
    const requestId = request.headers.get('CF-Ray') || `req-${randomHex(6)}`;
    const classification = classifyLead({ name, email, message, campaign, page, referrer });
    const toInternal = env.NOTIFY_TO || TO_INTERNAL_DEFAULT;
    const from = env.RESEND_FROM || FROM_DEFAULT;
    const ipHash = await sha256Hex(`${env.LEAD_HASH_SALT || 'musicangel-leads-v1'}:${ip}`);
    const submittedPage = campaign.landing_page || page;
    const leadSource = [campaign.attribution_source, campaign.attribution_source_detail]
        .filter(Boolean)
        .join(' · ');
    const evidenceSummary = classification.classification === 'google_ads'
        ? 'Paid marker captured at form submit'
        : `Classified from form attribution as ${classification.classification}`;
    const leadRecord = {
        lead_id: leadId,
        created_at: now.toISOString(),
        received_datetime: now.toISOString(),
        environment: env.ENVIRONMENT || 'production',
        status: classification.status,
        is_test: classification.isTest,
        is_duplicate: 0,
        duplicate_of_lead_id: '',
        possible_duplicate: 0,
        spam_flag: 0,
        lead_source_classification: classification.classification,
        count_as_real_lead: classification.countAsRealLead,
        count_as_google_ads: classification.countAsGoogleAds,
        exclusion_reason: classification.exclusionReason,
        confidence_level: classification.confidenceLevel,
        name,
        partner,
        email,
        phone,
        message,
        band_requested: band,
        wedding_date: date,
        venue,
        county,
        package_or_service_interest: packageInterest,
        preferred_contact_method: preferredContactMethod,
        gclid: campaign.gclid,
        gbraid: campaign.gbraid,
        wbraid: campaign.wbraid,
        utm_source: campaign.utm_source,
        utm_medium: campaign.utm_medium,
        utm_campaign: campaign.utm_campaign,
        utm_id: campaign.utm_id,
        utm_content: campaign.utm_content,
        utm_term: campaign.utm_term,
        utm_adgroup: campaign.utm_adgroup,
        utm_matchtype: campaign.utm_matchtype,
        utm_network: campaign.utm_network,
        attribution_source: campaign.attribution_source,
        attribution_source_detail: campaign.attribution_source_detail,
        campaign: campaign.utm_campaign || campaign.gad_campaignid,
        ad_group: campaign.utm_adgroup || campaign.gad_adgroupid,
        keyword: campaign.utm_term || campaign.gad_keyword,
        match_type: campaign.utm_matchtype || campaign.gad_matchtype,
        landing_page: campaign.first_landing_page || page,
        submitted_page_url: submittedPage,
        referrer: campaign.landing_referrer || referrer,
        first_seen_landing_page: campaign.first_landing_page,
        first_seen_referrer: campaign.first_landing_referrer,
        first_external_referrer: campaign.first_external_referrer,
        session_id: sessionId,
        client_id_if_available: clean(body.client_id_if_available, 180),
        device,
        viewport,
        user_agent: userAgent,
        ip_hash_or_partial_ip: ipHash,
        form_id: formId,
        api_endpoint: new URL(request.url).pathname,
        request_id: requestId,
        email_delivery_status: 'pending',
        admin_email_sent_to: toInternal,
        customer_auto_reply_sent: 0,
        google_ads_conversion_attempted: 0,
        meta_conversion_attempted: 0,
        ga4_event_attempted: 0,
        lead_quality: '',
        reply_status: '',
        quote_status: '',
        booking_status: '',
        booking_date: '',
        booking_value: null,
        currency: 'EUR',
        revenue_collected: null,
        lost_reason: '',
        notes: '',
        evidence_summary: evidenceSummary,
        last_updated_at: now.toISOString(),
        updated_by: 'api',
        source_system: 'musicangel_site',
        raw_attribution_json: JSON.stringify(campaign),
        created_unix_ms: now.getTime()
    };

    let leadStoreStatus = { stored: false, reason: 'not attempted' };
    try {
        leadStoreStatus = await saveLeadRecord(env.LEADS_DB, leadRecord);
    } catch (storeErr) {
        leadStoreStatus = { stored: false, reason: storeErr.message };
        console.error('Lead store write failed', { lead_id: leadId, request_id: requestId, error: storeErr.message });
    }

    const firstName = name.split(/\s+/)[0];
    const subjectPrefix = classification.isTest ? 'TEST MusicAngel enquiry' : 'New MusicAngel enquiry';
    const subject = `${subjectPrefix} — ${band || 'General'} — ${name} — ${leadId}`;

    const internalHtml = `
        <h2 style="font-family:Georgia,serif;color:#111">${esc(subjectPrefix)}</h2>
        <p style="font-family:system-ui,sans-serif;font-size:14px;margin:0 0 16px"><strong>Lead ID:</strong> ${esc(leadId)} · <strong>Source:</strong> ${esc(classification.classification)} · <strong>Google Ads candidate:</strong> ${classification.countAsGoogleAds ? 'yes' : 'no'} · <strong>D1 stored:</strong> ${leadStoreStatus.stored ? 'yes' : 'no'}</p>
        <h3 style="font-family:Georgia,serif;color:#111;margin-top:20px">Lead summary</h3>
        <table cellpadding="6" style="font-family:system-ui,sans-serif;font-size:14px;border-collapse:collapse">
            ${tableRows([
                ['lead_id', leadId],
                ['status', leadRecord.status],
                ['source classification', classification.classification],
                ['count_as_google_ads_candidate', classification.countAsGoogleAds ? 'yes' : 'no'],
                ['possible_duplicate', leadRecord.possible_duplicate ? `yes, possible duplicate of ${leadRecord.duplicate_of_lead_id}` : 'no'],
                ['name', name],
                ['partner', partner],
                ['email', email],
                ['phone', phone],
                ['band requested', band],
                ['wedding date', date],
                ['venue', venue],
                ['county', county],
                ['message', message]
            ])}
        </table>
        <h3 style="font-family:Georgia,serif;color:#111;margin-top:20px">Attribution</h3>
        <table cellpadding="6" style="font-family:system-ui,sans-serif;font-size:14px;border-collapse:collapse">
            ${tableRows([
                ['gclid', campaign.gclid],
                ['gbraid', campaign.gbraid],
                ['wbraid', campaign.wbraid],
                ['utm_source', campaign.utm_source],
                ['utm_medium', campaign.utm_medium],
                ['utm_campaign', campaign.utm_campaign],
                ['utm_content', campaign.utm_content],
                ['utm_term', campaign.utm_term],
                ['campaign', leadRecord.campaign],
                ['ad_group', leadRecord.ad_group],
                ['keyword', leadRecord.keyword],
                ['match_type', leadRecord.match_type],
                ['landing_page', leadRecord.landing_page],
                ['submitted_page_url', leadRecord.submitted_page_url],
                ['referrer', leadRecord.referrer],
                ['first_seen_referrer', leadRecord.first_seen_referrer],
                ['lead source detail', leadSource]
            ])}
        </table>
        <h3 style="font-family:Georgia,serif;color:#111;margin-top:20px">Technical</h3>
        <table cellpadding="6" style="font-family:system-ui,sans-serif;font-size:14px;border-collapse:collapse">
            ${tableRows([
                ['device', device],
                ['viewport', viewport],
                ['user_agent', userAgent],
                ['form_id', formId],
                ['session_id', sessionId],
                ['api_endpoint', leadRecord.api_endpoint],
                ['request_id', requestId],
                ['lead_store', leadStoreStatus.stored ? 'stored in D1' : `not stored: ${leadStoreStatus.reason || 'unknown'}`]
            ])}
        </table>
        <h3 style="font-family:Georgia,serif;color:#111;margin-top:20px">Sales outcome fields to update</h3>
        <p style="font-family:system-ui,sans-serif;font-size:14px">replied? · qualified? · quoted? · booked? · booking value? · notes?</p>
        <p style="color:#888;font-size:12px;margin-top:24px">Sent from musicangel.ie · lead_id ${esc(leadId)}</p>
    `;

    const replyHtml = `
        <div style="font-family:Georgia,serif;color:#222;max-width:560px;margin:0 auto;padding:24px 8px;line-height:1.6">
            <h2 style="font-family:Georgia,serif;color:#111;font-weight:500;margin:0 0 16px">Thanks, ${esc(firstName)}. Your enquiry has landed.</h2>
            <p style="margin:0 0 14px">I'll personally check the band's availability for your date${date ? ' (' + esc(date) + ')' : ''}${venue ? ' at ' + esc(venue) : ''} and come back to you within one working day, usually much faster.</p>
            ${band ? `<p style="margin:0 0 14px">You asked about <strong>${esc(band)}</strong>. I'll start there.</p>` : ''}
            <p style="margin:0 0 14px">If you'd like to chat sooner, you can call me on <a href="tel:+353872310001" style="color:#F26CA7">+353 87 231 0001</a>.</p>
            <p style="margin:24px 0 6px">Looking forward to it,</p>
            <p style="margin:0 0 24px"><strong style="color:#111">${REPLY_NAME}</strong></p>
            <hr style="border:none;border-top:1px solid #eee;margin:24px 0">
            <p style="font-size:12px;color:#888;margin:0">MusicAngel, wedding bands playing all of Ireland · <a href="https://musicangel.ie" style="color:#888">musicangel.ie</a> · Reference ${esc(leadId)}</p>
        </div>
    `;

    try {
        await sendEmail(key, {
            from,
            to: [toInternal],
            reply_to: email,
            subject,
            html: internalHtml
        });

        try {
            await sendEmail(key, {
                from,
                to: [email],
                reply_to: toInternal,
                subject: 'Your MusicAngel enquiry: we got it',
                html: replyHtml
            });
            leadRecord.customer_auto_reply_sent = 1;
        } catch (autoErr) {
            console.error('Auto-reply failed (non-fatal):', autoErr.message);
        }

        try {
            await updateLeadEmailStatus(env.LEADS_DB, leadId, 'admin_sent', leadRecord.customer_auto_reply_sent);
        } catch (updateErr) {
            console.error('Lead email status update failed', { lead_id: leadId, request_id: requestId, error: updateErr.message });
        }

        return json({ ok: true, lead_id: leadId, lead_store: leadStoreStatus.stored ? 'stored' : 'not_stored' }, 200, headers);
    } catch (err) {
        console.error('Enquiry handler error:', err);
        try {
            await updateLeadEmailStatus(env.LEADS_DB, leadId, 'email_failed', leadRecord.customer_auto_reply_sent);
        } catch (updateErr) {
            console.error('Lead email failure status update failed', { lead_id: leadId, request_id: requestId, error: updateErr.message });
        }
        return json({ error: 'Email provider error' }, 502, headers);
    }
}

export async function onRequest({ request, env }) {
    if (request.method === 'OPTIONS') return handleOptions(request);
    if (request.method === 'POST') return handlePost({ request, env });

    return json({ error: 'Method not allowed' }, 405, {
        ...corsHeaders(request),
        Allow: 'POST, OPTIONS'
    });
}
