// Vercel serverless function — POST /api/enquiry
// Forwards enquiry form submissions to jo.musicangel@gmail.com via Resend.
// Set RESEND_API_KEY in Vercel project env vars to enable.
// Falls back to a 503 response so the front-end can open a mailto: as backup.

const TO = 'jo.musicangel@gmail.com';
// Resend requires a verified sender domain to send from a custom address.
// Until musicangel.ie is verified in Resend, use the shared sender they provide.
const FROM = process.env.RESEND_FROM || 'MusicAngel <onboarding@resend.dev>';

function esc(s) {
    return String(s == null ? '' : s)
        .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}

module.exports = async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', 'https://musicangel.ie');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    if (req.method === 'OPTIONS') {
        res.status(204).end();
        return;
    }
    if (req.method !== 'POST') {
        res.status(405).json({ error: 'Method not allowed' });
        return;
    }

    const key = process.env.RESEND_API_KEY;
    if (!key) {
        res.status(503).json({ error: 'Email backend not configured' });
        return;
    }

    let body = req.body;
    if (typeof body === 'string') {
        try { body = JSON.parse(body); } catch (e) { body = {}; }
    }
    body = body || {};

    const { name, partner, email, date, venue, band, message, hp } = body;

    // Honeypot: real users never fill this hidden field.
    if (hp) {
        res.status(200).json({ ok: true });
        return;
    }
    if (!email || !name) {
        res.status(400).json({ error: 'Name and email are required' });
        return;
    }

    const subject = `New MusicAngel enquiry — ${name}${band ? ' · ' + band : ''}`;
    const html = `
        <h2>New MusicAngel enquiry</h2>
        <table cellpadding="6" style="font-family:system-ui,sans-serif;font-size:14px;border-collapse:collapse">
            <tr><td><strong>Name</strong></td><td>${esc(name)}</td></tr>
            <tr><td><strong>Partner</strong></td><td>${esc(partner)}</td></tr>
            <tr><td><strong>Email</strong></td><td><a href="mailto:${esc(email)}">${esc(email)}</a></td></tr>
            <tr><td><strong>Wedding date</strong></td><td>${esc(date)}</td></tr>
            <tr><td><strong>Venue</strong></td><td>${esc(venue)}</td></tr>
            <tr><td><strong>Band of interest</strong></td><td>${esc(band)}</td></tr>
            <tr><td valign="top"><strong>Message</strong></td><td style="white-space:pre-wrap">${esc(message)}</td></tr>
        </table>
        <p style="color:#888;font-size:12px;margin-top:24px">Sent from musicangel.ie enquiry form</p>
    `;

    try {
        const resp = await fetch('https://api.resend.com/emails', {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${key}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                from: FROM,
                to: [TO],
                reply_to: email,
                subject,
                html
            })
        });
        if (!resp.ok) {
            const detail = await resp.text();
            console.error('Resend error:', resp.status, detail);
            res.status(502).json({ error: 'Email provider error' });
            return;
        }
        res.status(200).json({ ok: true });
    } catch (err) {
        console.error('Enquiry handler error:', err);
        res.status(500).json({ error: 'Server error' });
    }
};
