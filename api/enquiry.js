// Vercel serverless function: POST /api/enquiry
// 1. Validates input + spam defenses (honeypot, time-to-fill, origin, rate limit).
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

    // Time-to-fill check: front-end stamps `_t` (page load ms) into payload.
    if (typeof body._t === 'number') {
        const seconds = (Date.now() - body._t) / 1000;
        if (seconds < MIN_FILL_SECONDS) {
            res.status(200).json({ ok: true });  // silent bot drop
            return;
        }
    }

    const name = clean(body.name, 120);
    const partner = clean(body.partner, 120);
    const email = clean(body.email, 254);
    const date = clean(body.date, 32);
    const venue = clean(body.venue, 240);
    const band = clean(body.band, 80);
    const message = clean(body.message, 4000);
    const page = clean(body.page, 500);
    const referrer = clean(body.referrer, 500);
    const campaign = {
        utm_source: clean(body.utm_source, 120),
        utm_medium: clean(body.utm_medium, 120),
        utm_campaign: clean(body.utm_campaign, 180),
        utm_term: clean(body.utm_term, 180),
        utm_content: clean(body.utm_content, 180),
        gclid: clean(body.gclid, 180),
        fbclid: clean(body.fbclid, 180)
    };

    if (!name || !validEmail(email)) {
        res.status(400).json({ error: 'Name and a valid email are required' });
        return;
    }

    const firstName = name.split(/\s+/)[0];
    const bandLine = band ? ` · ${esc(band)}` : '';
    const subject = `New MusicAngel enquiry: ${esc(name)}${bandLine}`;

    const internalHtml = `
        <h2 style="font-family:Georgia,serif;color:#111">New MusicAngel enquiry</h2>
        <table cellpadding="6" style="font-family:system-ui,sans-serif;font-size:14px;border-collapse:collapse">
            <tr><td><strong>Name</strong></td><td>${esc(name)}</td></tr>
            <tr><td><strong>Partner</strong></td><td>${esc(partner)}</td></tr>
            <tr><td><strong>Email</strong></td><td><a href="mailto:${esc(email)}">${esc(email)}</a></td></tr>
            <tr><td><strong>Wedding date</strong></td><td>${esc(date)}</td></tr>
            <tr><td><strong>Venue</strong></td><td>${esc(venue)}</td></tr>
            <tr><td><strong>Band of interest</strong></td><td>${esc(band)}</td></tr>
            <tr><td valign="top"><strong>Message</strong></td><td style="white-space:pre-wrap">${esc(message)}</td></tr>
            <tr><td><strong>Source page</strong></td><td>${page ? `<a href="${esc(page)}">${esc(page)}</a>` : ''}</td></tr>
            <tr><td><strong>Referrer</strong></td><td>${referrer ? `<a href="${esc(referrer)}">${esc(referrer)}</a>` : ''}</td></tr>
            <tr><td><strong>Campaign</strong></td><td>${esc(Object.entries(campaign).filter(([, v]) => v).map(([k, v]) => `${k}=${v}`).join(' · '))}</td></tr>
        </table>
        <p style="color:#888;font-size:12px;margin-top:24px">Sent from musicangel.ie · IP ${esc(ip)}</p>
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
            <p style="font-size:12px;color:#888;margin:0">MusicAngel, wedding bands playing all of Ireland · <a href="https://musicangel.ie" style="color:#888">musicangel.ie</a></p>
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

        res.status(200).json({ ok: true });
    } catch (err) {
        console.error('Enquiry handler error:', err);
        res.status(502).json({ error: 'Email provider error' });
    }
};
