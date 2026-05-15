#!/usr/bin/env node
/**
 * Generate personalised partnership outreach emails for every venue with a verified email address.
 *
 *   node scripts/draft-outreach.js
 *
 * Reads:
 *   data/venues.json           — venue metadata (name, county, style, vibe)
 *   data/venue-emails.json     — scraped emails per venue
 *
 * Writes:
 *   OUTREACH_DRAFTS.md         — ready-to-paste drafts grouped by template
 *
 * Each venue is routed to one of three templates based on its `style` field:
 *   - luxury castle / 5-star hotel       → Template A
 *   - boutique / exclusive-use           → Template B
 *   - mid-luxury / resort / other        → Template C
 */
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const VENUES = JSON.parse(fs.readFileSync(path.join(ROOT, 'data/venues.json'), 'utf8'));
const EMAILS_PATH = path.join(ROOT, 'data/venue-emails.json');
const EMAILS = fs.existsSync(EMAILS_PATH) ? JSON.parse(fs.readFileSync(EMAILS_PATH, 'utf8')) : [];

function emailFor(venueName) {
    const e = EMAILS.find(x => x.name.toLowerCase() === venueName.toLowerCase());
    return e && e.emails && e.emails.length ? e.emails[0] : null;
}

function templateFor(venue) {
    const s = (venue.style || '').toLowerCase();
    const v = (venue.vibe || '').toLowerCase();
    if (s.includes('castle') || s.includes('5-star') || s.includes('five-star') || s.includes('manor')) return 'A';
    if (s.includes('boutique') || s.includes('exclusive') || v.includes('boutique')) return 'B';
    return 'C';
}

const TEMPLATES = {
    A: (v) => ({
        subject: `Quick intro from a wedding band that's played at ${v.name}`,
        body: `Hi there,

Jo here from MusicAngel. We're a small Irish wedding band platform — four bands, all 100% live, all playing across Ireland.

We've just relaunched musicangel.ie and noticed ${v.name} is one of the most-requested venues in our enquiry form. I built a dedicated page for couples comparing wedding bands suited to your ${v.style.toLowerCase()}:

https://musicangel.ie/wedding-band-${v.slug}

A few reasons I'm reaching out:

1. Preferred supplier list. If ${v.name} keeps a recommended-suppliers list for music, I'd love MusicAngel to be considered. Our four bands collectively cover the polish range your couples expect.

2. Reciprocal links. I'm happy to add a link to ${v.name}'s wedding page from ours if you'd consider linking back from your recommended-suppliers page.

3. Showcase invites. When we run our next showcase in the area, would your events team like to attend? Useful to see the bands live so you can suggest them confidently.

If any of those land for you, happy to jump on a 15-min call or just email back. No pressure either way.

Best,
Jo
MusicAngel — Wedding Bands Playing All of Ireland
+353 87 231 0001 · musicangel.ie`
    }),
    B: (v) => ({
        subject: `A small note from a wedding band — about ${v.name} couples`,
        body: `Hi there,

I run MusicAngel — a small Irish wedding-band platform with four live bands. I'm reaching out because ${v.name} is one of the venues our couples ask about most often, and I just published a dedicated page about which of our bands suit your space:

https://musicangel.ie/wedding-band-${v.slug}

${v.name} is in a specific category — ${v.vibe} — and the right band for it isn't the same as the right band for a 250-guest ballroom. We've thought carefully about which of our four acts work best in spaces like yours.

A few things that might be useful:

1. For your couples. Happy to be added to a recommended-suppliers list if you keep one. I think our bands fit the ${v.name} standard.

2. Reciprocal links. I'm happy to feature ${v.name} prominently in our venue directory; would you consider a link back from your suppliers page?

3. A site visit / showcase. If your team would like to see one of our bands live, I can put you on the list for the next showcase in your region.

Not a sales pitch — just an introduction. Reply anytime.

All the best,
Jo
MusicAngel
+353 87 231 0001 · musicangel.ie`
    }),
    C: (v) => ({
        subject: `Live wedding bands recommendation — for ${v.name} couples`,
        body: `Hi there,

Jo here from MusicAngel. We're a platform of four live wedding bands playing across Ireland — the kind of bands that fill rooms like yours cleanly, 100% live, with the energy your couples want.

I noticed ${v.name} is one of the most-enquired-about venues in our pipeline, so I've put together a dedicated page on which of our bands suits your space:

https://musicangel.ie/wedding-band-${v.slug}

A few quick reasons I'm reaching out:

1. Suppliers list / recommendation. If ${v.name} maintains a wedding suppliers list, I'd love MusicAngel to be considered. We cover the energy and polish range your typical couple expects.

2. Mutual promotion. Open to swapping links between your suppliers page and our venue page — both help couples and both help SEO.

3. Real-time availability. When couples enquire with you and ask for band recommendations, we can give a same-day response with availability for their date.

Happy to send a calendar invite for a quick call if that's useful, or just keep this on file.

Best,
Jo
MusicAngel
+353 87 231 0001 · musicangel.ie`
    })
};

const FOLLOWUP = (v) => ({
    subject: `Bumping this up — MusicAngel + ${v.name}`,
    body: `Hi there,

Just nudging this one in case it got buried. No worries if you're swamped — wedding season is always full-on.

Short version: I run MusicAngel, four Irish wedding bands. We've built a dedicated page for ${v.name} (https://musicangel.ie/wedding-band-${v.slug}) and would love to discuss being on your recommended-suppliers list or trading links.

Reply anytime, or just say "not now" and I'll catch you next year.

All the best,
Jo`
});

function main() {
    const today = new Date().toISOString().slice(0, 10);
    const queue = { A: [], B: [], C: [] };
    const noEmail = [];

    for (const v of VENUES) {
        const email = emailFor(v.name);
        const t = templateFor(v);
        const tmpl = TEMPLATES[t](v);
        const followup = FOLLOWUP(v);
        const row = { venue: v, email, template: t, ...tmpl, followup };
        if (email) queue[t].push(row);
        else noEmail.push(row);
    }

    let md = `# Outreach Drafts — MusicAngel\n\n`;
    md += `Generated: ${today} from \`data/venues.json\` + \`data/venue-emails.json\`.\n\n`;
    md += `**Send at most 5/day.** Each draft is ready to copy-paste into your mail client. Personalise the opener with the recipient's name if you know it.\n\n`;
    md += `## Summary\n\n`;
    md += `| Template | Venue type | Count with email | Count without |\n|---|---|---:|---:|\n`;
    md += `| A | Luxury castle / 5-star manor | ${queue.A.length} | — |\n`;
    md += `| B | Boutique / exclusive-use | ${queue.B.length} | — |\n`;
    md += `| C | Mid-luxury / resort / other | ${queue.C.length} | — |\n`;
    md += `| — | No verified email (use form / find manually) | — | ${noEmail.length} |\n\n`;
    md += `**Total venues with email:** ${queue.A.length + queue.B.length + queue.C.length} / ${VENUES.length}\n\n---\n\n`;

    for (const t of ['A', 'B', 'C']) {
        md += `# Template ${t} — ${t === 'A' ? 'Luxury castles & 5-star manors' : t === 'B' ? 'Boutique exclusive-use venues' : 'Mid-luxury & resorts'}\n\n`;
        for (const row of queue[t]) {
            md += `## ${row.venue.name} (Co. ${row.venue.county})\n\n`;
            md += `**Email:** \`${row.email}\`  \n`;
            md += `**Venue page:** [https://musicangel.ie/wedding-band-${row.venue.slug}](https://musicangel.ie/wedding-band-${row.venue.slug})  \n`;
            md += `**Subject:** ${row.subject}\n\n`;
            md += `\`\`\`\n${row.body}\n\`\`\`\n\n`;
            md += `**Followup (5-7 days later if no reply):**  \n`;
            md += `Subject: ${row.followup.subject}\n\n\`\`\`\n${row.followup.body}\n\`\`\`\n\n---\n\n`;
        }
    }

    if (noEmail.length) {
        md += `# Venues without a verified email\n\n`;
        md += `Find the contact email manually (or use the venue's contact form). Drafts are still provided for when you have it.\n\n`;
        for (const row of noEmail) {
            md += `## ${row.venue.name} (Co. ${row.venue.county})\n\n`;
            md += `**Venue page:** [https://musicangel.ie/wedding-band-${row.venue.slug}](https://musicangel.ie/wedding-band-${row.venue.slug})  \n`;
            md += `**Suggested template:** ${row.template}  \n`;
            md += `**Subject:** ${row.subject}\n\n`;
            md += `\`\`\`\n${row.body}\n\`\`\`\n\n---\n\n`;
        }
    }

    md += `\n_Generated by \`scripts/draft-outreach.js\`. Re-run any time data/venues.json or data/venue-emails.json changes._\n`;

    fs.writeFileSync(path.join(ROOT, 'OUTREACH_DRAFTS.md'), md);
    console.log(`Wrote OUTREACH_DRAFTS.md: ${VENUES.length} venues, ${queue.A.length + queue.B.length + queue.C.length} with emails`);
}

main();
