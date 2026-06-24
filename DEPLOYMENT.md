# MusicAngel Deployment

## Current Architecture

As of 2026-05-17, the live setup is:

- **Cloudflare Pages** serves `https://musicangel.ie`, `https://www.musicangel.ie`, and `https://musicangelt.pages.dev`.
- Cloudflare Pages Functions runs the working `/api/enquiry` endpoint on the custom domains and the Pages subdomain.
- The frontend posts to same-origin `/api/enquiry` first, then keeps `https://musicangelt.pages.dev/api/enquiry` as a resilience fallback.
- **GitHub Pages is no longer the live host.** If DNS drifts back to GitHub Pages, live lead capture will depend on the fallback bridge and should be treated as a deployment regression.
- **Vercel is a fallback only.** Do not point production DNS at Vercel unless Cloudflare Pages is intentionally abandoned.

## What Was Verified

- Public nameservers are Cloudflare:
  - `arturo.ns.cloudflare.com`
  - `ziggy.ns.cloudflare.com`
- Live DNS now resolves through Cloudflare Pages.
- Cloudflare Pages project: `musicangelt`
- Cloudflare Pages URL: `https://musicangelt.pages.dev`
- Cloudflare Pages custom domains:
  - `musicangel.ie` - active
  - `www.musicangel.ie` - active
- `/api/enquiry` returns `{"ok":true}` for honeypot test submissions on apex, `www`, and the Pages subdomain. That confirms the Function is reachable without sending a real email.

## Cloudflare Pages Secrets

These must be set on the `musicangelt` Cloudflare Pages project:

| Name | Purpose |
|---|---|
| `RESEND_API_KEY` | Resend API key used by `/api/enquiry` |
| `RESEND_FROM` | Verified sender address, ideally `MusicAngel <hello@musicangel.ie>` |
| `NOTIFY_TO` | Internal enquiry recipient |
| `SEND_CUSTOMER_AUTOREPLY` | Optional. Must be `true` to send customer auto-replies. Leave unset/false until the sender domain is branded and verified. |

As of 2026-05-29, customer auto-replies are only sent when
`SEND_CUSTOMER_AUTOREPLY=true` and `RESEND_FROM` is a `musicangel.ie` sender.
If the sender is unbranded or the flag is unset, `/api/enquiry` sends only the
internal notification to Jo/Lawrence.

## Production DNS

Keep production DNS on Cloudflare Pages:

| Type | Name | Value | Proxy |
|---|---|---|---|
| CNAME | `@` | `musicangelt.pages.dev` | Proxied |
| CNAME | `www` | `musicangelt.pages.dev` | Proxied |

Email DNS currently keeps inbound mail on Titan and includes a Cloudflare DMARC
reporting record. Resend sending DNS is scoped to `send.musicangel.ie` so it
does not replace Titan inbound mail:

| Type | Name | Value |
|---|---|---|
| MX | `@` | `mx0101.titan.email` priority 10 |
| MX | `@` | `mx0102.titan.email` priority 20 |
| TXT | `_dmarc` | `v=DMARC1; p=none; rua=mailto:...@dmarc-reports.cloudflare.net` |
| TXT | `resend._domainkey` | Resend DKIM key for `musicangel.ie` |
| MX | `send` | `feedback-smtp.eu-west-1.amazonses.com` priority 10 |
| TXT | `send` | `v=spf1 include:amazonses.com ~all` |

Do not recreate the old GitHub Pages records unless intentionally rolling back to a static-only site:

| Type | Name | Value |
|---|---|
| A | `@` | `185.199.108.153` |
| A | `@` | `185.199.109.153` |
| A | `@` | `185.199.110.153` |
| A | `@` | `185.199.111.153` |
| CNAME | `www` | `lawrence18365.github.io` |

The repo still includes a DNS helper for emergency repair:

```bash
node scripts/cloudflare-dns-cutover.js
CLOUDFLARE_API_TOKEN=... node scripts/cloudflare-dns-cutover.js --execute
```

Use a Cloudflare token with DNS read/write permission for the `musicangel.ie` zone if the helper needs to execute changes.

## Deploy

Manual production deploy:

```bash
npx wrangler pages deploy . --project-name=musicangelt --branch=main
```

Post-deploy checks:

```bash
node scripts/deployment-check.js
curl -I https://musicangel.ie/api/enquiry
```

## Vercel Fallback

Vercel production was deployed successfully and has `RESEND_API_KEY`, `RESEND_FROM`, and `NOTIFY_TO` set. Use Vercel only if Cloudflare Pages is abandoned. Keep the Resend values in sync with the Cloudflare Pages project.

Vercel DNS target:

| Type | Name | Value | Proxy |
|---|---|---|---|
| A | `@` | `76.76.21.21` | DNS only |
| A | `www` | `76.76.21.21` | DNS only |

## Rollback

Rollback should prefer the previous Cloudflare Pages deployment in the Cloudflare dashboard. GitHub Pages is a static-only fallback; if it is used, enquiry delivery depends on the Cloudflare Pages API fallback in `js/site.js`.
