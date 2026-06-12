# Lighthouse Audit — 2026-05-29 (desktop)

**Strategy:** `desktop` | **URLs tested:** 10

## Summary

| Page | Perf | A11y | BP | SEO | LCP | CLS | TBT |
|---|:-:|:-:|:-:|:-:|:-:|:-:|:-:|
| `/` | 🟡 83 | ✅ 100 | ✅ 100 | ✅ 100 | 2.3 s | 0 | 10 ms |
| `/the-beat-boutique/` | 🟡 83 | ✅ 100 | ✅ 100 | ✅ 100 | 2.9 s | 0 | 40 ms |
| `/sway-social/` | ✅ 91 | ✅ 100 | ✅ 100 | ✅ 100 | 1.7 s | 0 | 10 ms |
| `/wedding-band-cost-ireland/` | ✅ 92 | ✅ 99 | ✅ 100 | ✅ 100 | 1.6 s | 0 | 20 ms |
| `/first-dance-songs/` | ✅ 94 | ✅ 98 | ✅ 100 | ✅ 100 | 1.5 s | 0 | 20 ms |
| `/wedding-band-vs-dj/` | ✅ 94 | ✅ 100 | ✅ 100 | ✅ 100 | 1.5 s | 0 | 50 ms |
| `/wedding-bands-dublin/` | ✅ 96 | ✅ 100 | ✅ 100 | ✅ 100 | 1.2 s | 0 | 20 ms |
| `/wedding-band-ashford-castle/` | ✅ 94 | ✅ 100 | ✅ 100 | ✅ 100 | 1.5 s | 0 | 10 ms |
| `/compare-bands/` | ✅ 93 | ✅ 100 | ✅ 100 | ✅ 100 | 1.5 s | 0.002 | 10 ms |
| `/about/` | ✅ 94 | ✅ 100 | ✅ 100 | ✅ 100 | 1.5 s | 0 | 50 ms |

## Issues per page

### `/`
- 🔴 Improve image delivery
- 🔴 Minify CSS
- 🔴 Reduce unused CSS

### `/the-beat-boutique/`
- 🔴 Elements with visible text labels do not have matching accessible names.
- 🔴 Reduce unused JavaScript
- 🔴 Largest Contentful Paint

### `/sway-social/`
- 🔴 Elements with visible text labels do not have matching accessible names.
- 🔴 Minify CSS
- 🔴 Reduce unused JavaScript

### `/wedding-band-cost-ireland/`
- 🔴 Heading elements are not in a sequentially-descending order
- 🔴 Minify CSS
- 🔴 Reduce unused JavaScript

### `/first-dance-songs/`
- 🔴 Heading elements are not in a sequentially-descending order
- 🔴 Reduce unused JavaScript
- 🔴 Use efficient cache lifetimes

### `/wedding-band-vs-dj/`
- 🔴 Reduce unused JavaScript
- 🔴 Use efficient cache lifetimes
- 🔴 Document request latency

### `/wedding-bands-dublin/`
- 🔴 Reduce unused JavaScript
- 🔴 Use efficient cache lifetimes
- 🔴 Document request latency

### `/wedding-band-ashford-castle/`
- 🔴 Reduce unused JavaScript
- 🔴 Use efficient cache lifetimes
- 🔴 Document request latency

### `/compare-bands/`
- 🔴 Reduce unused JavaScript
- 🔴 Use efficient cache lifetimes
- 🔴 Document request latency

### `/about/`
- 🔴 Reduce unused JavaScript
- 🔴 Use efficient cache lifetimes
- 🔴 Document request latency


---

Legend: ✅ ≥90 · 🟡 50-89 · 🔴 <50 · ⚠️ unavailable

Re-run: `node scripts/lighthouse-audit.js`
