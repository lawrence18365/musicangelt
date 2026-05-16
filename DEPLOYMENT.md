# MusicAngel Deployment

## Current Architecture

As of 2026-05-16, the practical live setup is:

- **GitHub Pages** serves the public site at `musicangel.ie` because the DNS
  records still point there.
- **Cloudflare Pages** serves the same site at `https://musicangelt.pages.dev`
  and runs the working `/api/enquiry` function.
- The frontend posts to same-origin `/api/enquiry` first, then falls back to
  `https://musicangelt.pages.dev/api/enquiry`. This keeps live lead capture
  working while DNS access is limited.
- **Vercel** has also been deployed and configured, but it is not the cleanest
  target while the domain is already on Cloudflare.

## What Was Verified

- Public nameservers are Cloudflare:
  - `arturo.ns.cloudflare.com`
  - `ziggy.ns.cloudflare.com`
- Live DNS still points to GitHub Pages:
  - Apex `A`: `185.199.108.153`, `185.199.109.153`,
    `185.199.110.153`, `185.199.111.153`
  - `www` CNAME: `lawrence18365.github.io`
- Cloudflare Pages project: `musicangelt`
- Cloudflare Pages URL: `https://musicangelt.pages.dev`
- Cloudflare Pages domains added:
  - `musicangel.ie` — pending until DNS points at Cloudflare Pages
  - `www.musicangel.ie` — pending until DNS points at Cloudflare Pages
- Cloudflare Pages `/api/enquiry` returns `{"ok":true}` for honeypot test
  submissions, which confirms the Function and `RESEND_API_KEY` secret load.
- The available Cloudflare OAuth token can create Pages projects/domains but
  cannot read or edit DNS records. Direct DNS API calls return authentication
  errors.

## Cloudflare Pages Secrets

These are set on the `musicangelt` Cloudflare Pages project:

| Name | Purpose |
|---|---|
| `RESEND_API_KEY` | Resend API key used by `/api/enquiry` |
| `RESEND_FROM` | Sender, currently `MusicAngel <hello@ratetapmx.com>` until `musicangel.ie` is verified in Resend |
| `NOTIFY_TO` | Internal enquiry recipient, `jo.musicangel@gmail.com` |

## Final DNS Cutover

When a Cloudflare token/session with DNS write permission is available, replace
the old GitHub Pages records with Cloudflare Pages records.

The repo includes a dry-run/execute helper for this exact cutover:

```bash
node scripts/cloudflare-dns-cutover.js
CLOUDFLARE_API_TOKEN=... node scripts/cloudflare-dns-cutover.js --execute
```

The current local Wrangler OAuth token can deploy Pages and read Pages domain
status, but DNS record API calls return 403. Use a token with DNS read/write
permission for the `musicangel.ie` zone.

Recommended Cloudflare DNS target:

| Type | Name | Value | Proxy |
|---|---|---|---|
| CNAME | `@` | `musicangelt.pages.dev` | Proxied |
| CNAME | `www` | `musicangelt.pages.dev` | Proxied |

Remove these old GitHub Pages records:

| Type | Name | Value |
|---|---|---|
| A | `@` | `185.199.108.153` |
| A | `@` | `185.199.109.153` |
| A | `@` | `185.199.110.153` |
| A | `@` | `185.199.111.153` |
| CNAME | `www` | `lawrence18365.github.io` |

After DNS cutover:

```bash
node scripts/deployment-check.js
curl -I https://musicangel.ie/api/enquiry
```

## Vercel Fallback

Vercel production was deployed successfully and has `RESEND_API_KEY`,
`RESEND_FROM`, and `NOTIFY_TO` set. Use Vercel only if Cloudflare Pages is
abandoned. Keep the Resend values in sync with the Cloudflare Pages project.

Vercel DNS target:

| Type | Name | Value | Proxy |
|---|---|---|---|
| A | `@` | `76.76.21.21` | DNS only |
| A | `www` | `76.76.21.21` | DNS only |

## Rollback

The old GitHub Pages records are the rollback target listed above. GitHub Pages
serves static pages only; enquiry delivery depends on the Cloudflare Pages API
fallback in `js/site.js`.
