# Lighthouse Audit — 2026-05-17 (desktop)

**Strategy:** `desktop` | **URLs tested:** 10

## Summary

| Page | Perf | A11y | BP | SEO | LCP | CLS | TBT |
|---|:-:|:-:|:-:|:-:|:-:|:-:|:-:|
| `/` | 🟡 75 | ✅ 100 | ✅ 100 | ✅ 100 | 4.1 s | 0 | 10 ms |
| `/the-beat-boutique/` | ✅ 92 | ✅ 100 | ✅ 100 | ✅ 100 | 1.7 s | 0 | 10 ms |
| `/sway-social/` | ✅ 92 | ✅ 100 | ✅ 100 | ✅ 100 | 1.7 s | 0 | 0 ms |
| `/wedding-band-cost-ireland/` | ✅ 93 | ✅ 99 | ✅ 100 | ✅ 100 | 1.5 s | 0 | 10 ms |
| `/first-dance-songs/` | ✅ 97 | ✅ 98 | ✅ 100 | ✅ 100 | 1.0 s | 0 | 10 ms |
| `/wedding-band-vs-dj/` | ✅ 94 | ✅ 100 | ✅ 100 | ✅ 100 | 1.4 s | 0 | 10 ms |
| `/wedding-bands-dublin/` | ✅ 93 | ✅ 100 | ✅ 100 | ✅ 100 | 1.5 s | 0 | 0 ms |
| `/wedding-band-ashford-castle/` | ✅ 95 | ✅ 100 | ✅ 100 | ✅ 100 | 1.4 s | 0 | 10 ms |
| `/compare-bands/` | ✅ 95 | ✅ 100 | ✅ 100 | ✅ 100 | 1.4 s | 0 | 0 ms |
| `/about/` | ✅ 95 | ✅ 100 | ✅ 100 | ✅ 100 | 1.4 s | 0 | 10 ms |

## Issues per page

### `/`
- 🔴 Reduce unused JavaScript
- 🔴 Improve image delivery
- 🔴 Largest Contentful Paint

### `/the-beat-boutique/`
- 🔴 Elements with visible text labels do not have matching accessible names.
- 🔴 Improve image delivery
- 🔴 Minify CSS

### `/sway-social/`
- 🔴 Elements with visible text labels do not have matching accessible names.
- 🔴 Minify CSS
- 🔴 Reduce unused JavaScript

### `/wedding-band-cost-ireland/`
- 🔴 Heading elements are not in a sequentially-descending order
- 🔴 Reduce unused JavaScript
- 🔴 Use efficient cache lifetimes

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
