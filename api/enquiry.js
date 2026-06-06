// Vercel serverless function: POST /api/enquiry
// 1. Validates input + spam defenses (honeypot, fast-submit check, origin, rate limit).
// 2. Forwards the enquiry to jo.musicangel@gmail.com via Resend.
// 3. Sends an auto-reply confirmation to the enquirer.
// Set RESEND_API_KEY in Vercel env to enable. Without it, returns 503 so the
// front-end falls back to a mailto: link.

const TO_INTERNAL = process.env.NOTIFY_TO || 'jo.musicangel@gmail.com';
const FROM = process.env.RESEND_FROM || 'MusicAngel <hello@ratetapmx.com>';
const REPLY_NAME = 'Jo at MusicAngel';

const ALLOWED_ORIGINS = new Set([
    'https://musicangel.ie',
    'https://www.musicangel.ie'
]);

// Minimum seconds between page load and form submit. Real users take >3s.
const MIN_FILL_SECONDS = 3;

// Simple in-memory rate limit (per warm instance, best-effort).
// 5 submissions per IP per 10 minutes.
const RATE_WINDOW_MS = 10 * 60 * 1000;
const RATE_MAX = 5;
const rateBucket = new Map();

function clientIp(req) {
    const xf = req.headers['x-forwarded-for'];
    if (typeof xf === 'string' && xf.length) return xf.split(',')[0].trim();
    return req.headers['x-real-ip'] || 'unknown';
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
    // Opportunistic cleanup so the map doesn't grow forever.
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

function randomHex(bytes = 4) {
    const arr = new Uint8Array(bytes);
    globalThis.crypto.getRandomValues(arr);
    return Array.from(arr).map(n => n.toString(16).padStart(2, '0')).join('');
}

function generateLeadId(date = new Date()) {
    const day = date.toISOString().slice(0, 10).replace(/-/g, '');
    return `MA-${day}-${randomHex(5).toUpperCase()}`;
}

function cleanKey(value, max = 80) {
    return clean(value, max).toLowerCase();
}

function containsTestMarker(values) {
    return values.some(value => /\btest\b|TEST_|codex|do not count|do-not-count/i.test(String(value || '')));
}

function classifyLead({ name, email, message, campaign }) {
    const source = cleanKey(campaign.utm_source);
    const medium = cleanKey(campaign.utm_medium);
    const attribution = cleanKey(campaign.attribution_source);
    const hasPaidClickId = Boolean(campaign.gclid || campaign.gbraid || campaign.wbraid);
    const isTest = containsTestMarker([
        name, email, message, campaign.gclid, campaign.gbraid, campaign.wbraid,
        campaign.utm_campaign, campaign.utm_content, campaign.utm_term
    ]);

    if (isTest) return { status: 'test', classification: 'test', countAsGoogleAds: false };
    if (hasPaidClickId || attribution === 'google_ads' || (source === 'google' && /^(cpc|ppc|paid|paid_search)$/.test(medium))) {
        return { status: 'new', classification: 'google_ads', countAsGoogleAds: true };
    }
    if (attribution === 'organic_search') return { status: 'new', classification: 'organic_search', countAsGoogleAds: false };
    if (attribution === 'referral') return { status: 'new', classification: 'referral', countAsGoogleAds: false };
    return { status: 'new', classification: 'direct_or_unknown', countAsGoogleAds: false };
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

module.exports = async function handler(req, res) {
    const origin = req.headers.origin || '';
    if (ALLOWED_ORIGINS.has(origin)) {
        res.setHeader('Access-Control-Allow-Origin', origin);
        res.setHeader('Vary', 'Origin');
    }
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') { res.status(204).end(); return; }
    if (req.method !== 'POST') { res.status(405).json({ error: 'Method not allowed' }); return; }

    // Origin check: block requests not from our site (in production).
    if (process.env.VERCEL_ENV === 'production' && origin && !ALLOWED_ORIGINS.has(origin)) {
        res.status(403).json({ error: 'Origin not allowed' });
        return;
    }

    const ip = clientIp(req);
    if (rateLimited(ip)) {
        res.status(429).json({ error: 'Too many submissions, please try again later' });
        return;
    }

    const key = process.env.RESEND_API_KEY;
    if (!key) {
        res.status(503).json({ error: 'Email backend not configured' });
        return;
    }

    let body = req.body;
    if (typeof body === 'string') {
        try { body = JSON.parse(body); } catch { body = {}; }
    }
    body = body || {};

    // Honeypot.
    if (body.hp) { res.status(200).json({ ok: true }); return; }

    // Fast-submit check: front-end stamps `_t` (page load ms) into payload.
    // Return a real error so the browser falls back to mailto instead of
    // showing success for a lead that was silently dropped.
    if (typeof body._t === 'number') {
        const seconds = (Date.now() - body._t) / 1000;
        if (seconds < MIN_FILL_SECONDS) {
            res.status(400).json({ error: 'Please wait a moment and try again' });
            return;
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
        res.status(400).json({ error: 'Name and a valid email are required' });
        return;
    }

    const leadId = generateLeadId();
    const classification = classifyLead({ name, email, message, campaign });
    const firstName = name.split(/\s+/)[0];
    const subjectPrefix = classification.status === 'test' ? 'TEST MusicAngel enquiry' : 'New MusicAngel enquiry';
    const subject = `${subjectPrefix} — ${band || 'General'} — ${name} — ${leadId}`;
    const leadSource = [campaign.attribution_source, campaign.attribution_source_detail]
        .filter(Boolean)
        .join(' · ');

    const internalHtml = `
        <h2 style="font-family:Georgia,serif;color:#111">${esc(subjectPrefix)}</h2>
        <p style="font-family:system-ui,sans-serif;font-size:14px;margin:0 0 16px"><strong>Lead ID:</strong> ${esc(leadId)} · <strong>Source:</strong> ${esc(classification.classification)} · <strong>Google Ads candidate:</strong> ${classification.countAsGoogleAds ? 'yes' : 'no'} · <strong>D1 stored:</strong> no, Vercel fallback path</p>
        <h3 style="font-family:Georgia,serif;color:#111;margin-top:20px">Lead summary</h3>
        <table cellpadding="6" style="font-family:system-ui,sans-serif;font-size:14px;border-collapse:collapse">
            ${tableRows([
                ['lead_id', leadId],
                ['status', classification.status],
                ['source classification', classification.classification],
                ['count_as_google_ads_candidate', classification.countAsGoogleAds ? 'yes' : 'no'],
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
                ['campaign', campaign.utm_campaign || campaign.gad_campaignid],
                ['ad_group', campaign.utm_adgroup || campaign.gad_adgroupid],
                ['keyword', campaign.utm_term || campaign.gad_keyword],
                ['match_type', campaign.utm_matchtype || campaign.gad_matchtype],
                ['landing_page', campaign.first_landing_page || page],
                ['submitted_page_url', campaign.landing_page || page],
                ['referrer', campaign.landing_referrer || referrer],
                ['first_seen_referrer', campaign.first_landing_referrer],
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
                ['lead_store', 'not stored: Vercel fallback path']
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
        // Notification email to internal address.
        await sendEmail(key, {
            from: FROM,
            to: [TO_INTERNAL],
            reply_to: email,
            subject,
            html: internalHtml
        });

        // Auto-reply to enquirer. Don't fail the whole submit if this errors.
        try {
            await sendEmail(key, {
                from: FROM,
                to: [email],
                reply_to: TO_INTERNAL,
                subject: 'Your MusicAngel enquiry: we got it',
                html: replyHtml
            });
        } catch (autoErr) {
            console.error('Auto-reply failed (non-fatal):', autoErr.message);
        }

        res.status(200).json({ ok: true, lead_id: leadId, lead_store: 'not_stored' });
    } catch (err) {
        console.error('Enquiry handler error:', err);
        res.status(502).json({ error: 'Email provider error' });
    }
};
