# Lighthouse Audit — 2026-05-17 (mobile)

**Strategy:** `mobile` | **URLs tested:** 10

## Summary

| Page | Perf | A11y | BP | SEO | LCP | CLS | TBT |
|---|:-:|:-:|:-:|:-:|:-:|:-:|:-:|
| `/` | ✅ 99 | ✅ 100 | ✅ 100 | ✅ 100 | 2.1 s | 0 | 10 ms |
| `/the-beat-boutique/` | 🟡 88 | ✅ 100 | ✅ 100 | ✅ 100 | 3.9 s | 0 | 20 ms |
| `/sway-social/` | 🟡 88 | ✅ 100 | ✅ 100 | ✅ 100 | 3.9 s | 0 | 10 ms |
| `/wedding-band-cost-ireland/` | ✅ 100 | ✅ 99 | ✅ 100 | ✅ 100 | 1.4 s | 0 | 10 ms |
| `/first-dance-songs/` | ✅ 92 | ✅ 98 | ✅ 100 | ✅ 100 | 3.4 s | 0 | 10 ms |
| `/wedding-band-vs-dj/` | ✅ 91 | ✅ 100 | ✅ 100 | ✅ 100 | 3.4 s | 0 | 20 ms |
| `/wedding-bands-dublin/` | ✅ 100 | ✅ 100 | ✅ 100 | ✅ 100 | 1.0 s | 0 | 10 ms |
| `/wedding-band-ashford-castle/` | ✅ 100 | ✅ 100 | ✅ 100 | ✅ 100 | 1.6 s | 0 | 10 ms |
| `/compare-bands/` | ✅ 91 | ✅ 100 | ✅ 100 | ✅ 100 | 3.4 s | 0 | 20 ms |
| `/about/` | ✅ 100 | ✅ 100 | ✅ 100 | ✅ 100 | 1.4 s | 0 | 10 ms |

## Issues per page

### `/`
- 🔴 Improve image delivery
- 🔴 Minify CSS
- 🔴 Reduce unused CSS

### `/the-beat-boutique/`
- 🔴 Elements with visible text labels do not have matching accessible names.
- 🔴 Reduce unused JavaScript
- 🔴 Improve image delivery

### `/sway-social/`
- 🔴 Elements with visible text labels do not have matching accessible names.
- 🔴 Reduce unused JavaScript
- 🔴 Minify CSS

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
