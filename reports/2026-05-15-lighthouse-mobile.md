# Lighthouse Audit — 2026-05-15 (mobile)

**Strategy:** `mobile` | **Sampled:** homepage (1 page) | **Mode:** local Chrome via `npx lighthouse`

> Production is still served by **GitHub Pages** (DNS hasn't fully cut over to Vercel yet).
> Scores will likely improve once Vercel CDN serves the static assets — particularly LCP.

## Homepage scores

| Category | Score |
|---|:-:|
| Performance | 🟡 **77** / 100 |
| Accessibility | ✅ **97** / 100 |
| Best Practices | ✅ **96** / 100 |
| SEO | ✅ **100** / 100 |

## Core Web Vitals (mobile)

| Metric | Value | Target | Status |
|---|---|---|:-:|
| Largest Contentful Paint (LCP) | **5.7s** | <2.5s | 🔴 |
| Cumulative Layout Shift (CLS) | **0** | <0.1 | ✅ |
| Total Blocking Time (TBT) | **40ms** | <200ms | ✅ |
| First Contentful Paint (FCP) | **2.0s** | <1.8s | 🟡 |

## Top issues to fix

1. 🔴 **Background and foreground colors do not have a sufficient contrast ratio** — a11y. Likely the `--text-muted` (#8a8285) against the ivory background fails WCAG AA. Bump to `#666666` or darker.
2. 🔴 **Reduce unused JavaScript** — the marketing tags scaffolding adds JS that's not currently used (no Meta Pixel ID set). Already deferred, low priority until you activate ad pixels.
3. 🔴 **Use efficient cache lifetimes** — likely Google Fonts. Once Vercel serves, the `Cache-Control: public, max-age=31536000, immutable` header on `/assets/*` will fire (currently overridden by GitHub Pages).
4. 🔴 **Font display** — should add `font-display: swap` to `@font-face` rules. Google Fonts URL includes `&display=swap` so this should be fine — likely a false positive from how Lighthouse audits this.
5. 🔴 **Improve image delivery** — hero images are 184-187KB each. Could be reduced further with `srcset` + smaller mobile variants.
6. 🔴 **Render-blocking requests** — the Google Fonts CSS link blocks render. Could be inlined as `@import` or async-loaded.

## What will improve once DNS flips to Vercel

| Issue | Why Vercel fixes it |
|---|---|
| LCP 5.7s | Vercel's global CDN serves `/assets/*` from edge — likely halves load time |
| Cache lifetimes | `vercel.json` sets `max-age=31536000, immutable` on `/assets/*` — currently ignored on GitHub Pages |
| Render-blocking | Vercel HTTP/2 priority hints + edge cache lower TTFB significantly |

## What needs code fixes (separate from DNS)

1. **A11y contrast** — bump `--text-muted` from `#8a8285` to `#6a6266` or darker
2. **Hero image `srcset`** — generate 720w + 1080w + 1440w variants for `/assets/bands/hero-*.webp`
3. **Lazy-load below-fold images** — already done for band-detail images via `loading="lazy"`, just verify hero set is `eager` only for the very first one

## Full audit

To run the full 10-URL audit:

```bash
node scripts/lighthouse-audit.js                # local CLI (no quota, slower)
node scripts/lighthouse-audit.js --strategy=desktop
node scripts/lighthouse-audit.js --psi          # PSI API (faster, quota-limited)
```

Re-run after DNS cutover to Vercel for a clean baseline.

---

Legend: ✅ ≥90 · 🟡 50-89 · 🔴 <50 issues
