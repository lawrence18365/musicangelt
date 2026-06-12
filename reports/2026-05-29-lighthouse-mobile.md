# Lighthouse Audit — 2026-05-29 (mobile)

**Strategy:** `mobile` | **URLs tested:** 10

## Summary

| Page | Perf | A11y | BP | SEO | LCP | CLS | TBT |
|---|:-:|:-:|:-:|:-:|:-:|:-:|:-:|
| `/` | ✅ 97 | ✅ 100 | ✅ 100 | ✅ 100 | 2.3 s | 0 | 10 ms |
| `/the-beat-boutique/` | ✅ 94 | ✅ 100 | ✅ 100 | ✅ 100 | 3.2 s | 0 | 20 ms |
| `/sway-social/` | ✅ 100 | ✅ 100 | ✅ 100 | ✅ 100 | 1.5 s | 0 | 10 ms |
| `/wedding-band-cost-ireland/` | ✅ 96 | ✅ 99 | ✅ 100 | ✅ 100 | 2.8 s | 0 | 10 ms |
| `/first-dance-songs/` | ✅ 100 | ✅ 98 | ✅ 100 | ✅ 100 | 1.5 s | 0 | 20 ms |
| `/wedding-band-vs-dj/` | ✅ 100 | ✅ 100 | ✅ 100 | ✅ 100 | 1.5 s | 0 | 20 ms |
| `/wedding-bands-dublin/` | 🟡 82 | ✅ 100 | ✅ 100 | ✅ 100 | 3.5 s | 0 | 20 ms |
| `/wedding-band-ashford-castle/` | ✅ 100 | ✅ 100 | ✅ 100 | ✅ 100 | 1.5 s | 0 | 10 ms |
| `/compare-bands/` | ✅ 90 | ✅ 100 | ✅ 100 | ✅ 100 | 3.6 s | 0 | 30 ms |
| `/about/` | ✅ 100 | ✅ 100 | ✅ 100 | ✅ 100 | 1.5 s | 0 | 40 ms |

## Issues per page

### `/`
- 🔴 Reduce initial server response time
- 🔴 Document request latency
- 🔴 Improve image delivery

### `/the-beat-boutique/`
- 🔴 Elements with visible text labels do not have matching accessible names.
- 🔴 Reduce unused JavaScript
- 🔴 Improve image delivery

### `/sway-social/`
- 🔴 Elements with visible text labels do not have matching accessible names.
- 🔴 Minify CSS
- 🔴 Reduce unused JavaScript

### `/wedding-band-cost-ireland/`
- 🔴 Heading elements are not in a sequentially-descending order
- 🔴 Reduce unused JavaScript
- 🔴 Minify CSS

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
- 🔴 Speed Index
- 🔴 Use efficient cache lifetimes

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
