# MusicAngel End-to-End SEO / Conversion Fixes — 2026-05-16

## Completed

- Centralised cookie consent, form handling, and engagement tracking into `/js/site.js`.
- Removed repeated inline form/consent scripts from generated and hand-authored pages.
- Fixed broken/malformed JavaScript on guide pages caused by partial consent-script injection.
- Updated enquiry tracking:
  - `form_submit_attempt` fires on submit attempt.
  - `form_submit` and `generate_lead` fire only after API success.
  - `lead_mailto_fallback` fires when the backend is unavailable and the email fallback opens.
- Added source page, referrer, and campaign fields to enquiry emails.
- Fixed Vercel redirects so real SEO pages are no longer redirected away:
  - `/pricing-guide` now redirects to `/wedding-band-cost-ireland`.
  - `/showcase` now redirects to `/wedding-band-showcases`.
  - `/playlist` now redirects to `/song-list`.
  - `/christmas-parties` now redirects to `/corporate-events`.
  - old `/locations/wedding-band-:county` and `/venues/:venue` paths map to current SEO URLs.
- Strengthened generated venue and county templates with booking guidance, room/guest-count checks, package comparison prompts, and venue-specific quote inputs.
- Improved muted-text contrast from `#8a8285` to `#6a6266`.
- Fixed GSC setup script token cache path and added `scripts/replace-gsc-token.js`.
- Added `.env.example` and ignored local env/GSC token files.
- Added `DEPLOYMENT.md` to clarify that Cloudflare should be DNS-only and
  Vercel should be hosting/runtime.
- Added `scripts/deployment-check.js` to detect whether production is on
  GitHub Pages or Vercel.
- Added `.github/workflows/seo-checks.yml` so PRs can block stale generated
  pages, bad canonicals, broken internal links, and JavaScript syntax errors.
- Deployed a Vercel preview:
  - `https://musicangelt-528rivd9o-lawrencebrennan-gmailcoms-projects.vercel.app`

## Verification

- `node --check` passed for changed JavaScript files.
- `node scripts/audit-canonicals.js`: 105/105 correct.
- `node scripts/find-broken-links.js`: 1,368 internal references, 0 broken links.
- Local browser smoke check:
  - homepage loads shared `/js/site.js`.
  - cost guide canonical resolves correctly.
  - generated county page loads its enquiry form and shared handler.
- `node scripts/deployment-check.js` confirmed production is still on GitHub
  Pages and `/api/enquiry` is 404 on the live domain.

## Still Credential-Bound

- Vercel has no environment variables configured for this project yet. The enquiry API will return `503` until `RESEND_API_KEY` is added.
- Cloudflare DNS still points `musicangel.ie` and `www.musicangel.ie` to GitHub
  Pages. Cutover requires Cloudflare DNS edits to Vercel records.
- Google Search Console verification still needs OAuth credentials or a GSC verification token.
- Production deployment was not run; preview deployment succeeded. Run production after confirming env vars and domain routing.
