# Google Ads System Scorecard - 2026-06-02

## Executive score

Overall system score: **68 / 100**.

This is a promising but immature acquisition system. The current paid lead cost is commercially viable, but the system is not yet ready to scale because booking outcomes are not tracked and phrase-match traffic produced too much competitor-band leakage.

## Current economics

Window checked in Google Ads: **2026-05-22 to 2026-06-02**.

| Metric | Value |
| --- | ---: |
| Spend | EUR 91.55 |
| Clicks | 53 |
| Impressions | 398 |
| Average CPC | EUR 1.73 |
| Google Ads conversions | 2 |
| Verified paid enquiries | 2 |
| Cost per paid enquiry | EUR 45.78 |
| Minimum advertised package value | EUR 2,450 |

Verified paid enquiries:

- Paid lead 1: Google Ads, keyword `wedding bands cork`, exact match.
- Paid lead 2: Google Ads, keyword `live wedding band ireland`, phrase match.

The non-paid May 29 enquiry pair remains `unknown_or_direct` from captured data and should not be credited to Google Ads.

## Unit economics

Assuming package value of EUR 2,450:

| Lead-to-booking rate | Leads per booking | Est. ad cost per booking | Revenue ROAS |
| ---: | ---: | ---: | ---: |
| 50.0% | 2.0 | EUR 91.55 | 26.8x |
| 20.0% | 5.0 | EUR 228.88 | 10.7x |
| 10.0% | 10.0 | EUR 457.75 | 5.4x |
| 5.0% | 20.0 | EUR 915.50 | 2.7x |
| 2.5% | 40.0 | EUR 1,831.00 | 1.3x |

At 50% gross margin, the break-even lead-to-booking rate is about **3.7%** at the current CPL. That is roughly one booking per 27 paid enquiries.

## Score breakdown

| Area | Score | Reason |
| --- | ---: | --- |
| Tracking and attribution | 8/10 | Paid leads now carry gclid, UTM, first landing, referrer, and attribution fields. |
| Lead economics | 8/10 | EUR 45.78 CPL is viable against a EUR 2,450 package floor. |
| Traffic quality | 5/10 | Competitor-band query leakage has been material, though negatives and pausing have improved it. |
| Conversion volume | 3/10 | Two paid leads is signal, not proof. Need 5-10 paid leads before judging. |
| Booking follow-up | 4/10 | No structured quote/booked/lost pipeline exists yet. |
| Platform risk | 5/10 | Advertiser verification warning is still active. |

## Waste and fixes

Visible all-time search-term scrape:

- Visible search-term spend: EUR 63.12.
- Clean wedding-intent visible spend: EUR 39.11.
- Competitor-band visible spend: EUR 22.23.
- Hidden/other search-term spend: EUR 28.43.

Actions already taken:

- Added competitor names to the shared `MusicAngel Core Exclusions` list.
- Live shared negative list reached 99 items and is applied to all 5 campaigns.
- Paused 6 high-spend, zero-conversion phrase keywords live, representing about EUR 45.71 of historical spend with 0 conversions.
- Updated `scripts/generate-google-ads-assets.js` so broad generic, pricing, package, venue, and county groups generate exact-only keywords going forward.
- Regenerated Google Ads CSVs: keyword source reduced from 756 keywords to 405 keywords, with 378 exact and 27 phrase.

## Additional UI findings after scorecard

The Landing pages report still shows live traffic attributed to literal `{ignore}` URLs. The website middleware redirects those safely, so visitors are protected, but Google Ads should still be cleaned so the account no longer reports those paths.

Top affected landing-page rows observed all-time:

| Landing page pattern | Clicks | Cost |
| --- | ---: | ---: |
| `https://musicangel.ie/{ignore}?utm_source=...` | 13 | EUR 28.07 |
| `/wedding-bands-cork/{ignore}?utm_source=...` | 4 | EUR 5.48 |
| `/wedding-bands-dublin/{ignore}?utm_source=...` | 3 | EUR 4.10 |
| `/wedding-band-cost-ireland/{ignore}?utm_source=...` | 3 | EUR 7.12 |
| `/wedding-bands-limerick/{ignore}?utm_source=...` | 3 | EUR 4.14 |

Local source files no longer generate `{ignore}` or lower-level final URL suffixes. The remaining issue is therefore live-account residue, likely at ad, asset, sitelink, or lower-level URL-options scope. Recommended cleanup is to clear any non-account-level final URL suffix or tracking template, then keep only the account-level suffix.

Other UI findings:

- Campaign settings are still Google Search only, English, Ireland/Northern Ireland, Manual CPC, all-day schedule, all devices.
- Ireland produced both conversions. Northern Ireland has spent EUR 4.85 with 0 conversions, which is too little to exclude yet but should be watched.
- Google continues to recommend budget increases / target impression share. Ignore those until the cleaned traffic has at least 5 paid enquiries and visible competitor waste is below 10%.

## Current decision

Keep Google Ads running at the capped budget. Do **not** increase budget yet.

The system has crossed the first threshold: Google Ads can produce real enquiries. It has not crossed the scale threshold because booking outcomes are unknown and traffic quality only just got tightened.

## Operating thresholds

Pause or heavily reduce spend if any of the following happen:

- CPL rises above EUR 125 for more than 5 paid enquiries.
- Competitor-band terms exceed 15% of visible paid search-term spend after the latest negatives.
- 10 paid enquiries produce no serious replies, quotes, holds, or bookings.
- Advertiser verification deadline becomes imminent and unresolved.

Consider raising budget only if all of the following are true:

- At least 5 paid enquiries are recorded.
- Visible competitor-band waste is under 10% of search-term spend.
- At least one paid lead becomes a strong opportunity: reply, quote, hold, or booking.
- The lead tracker is updated within 24 hours of every enquiry.

## Missing system pieces

1. Lead pipeline tracking.
   Every enquiry needs status: new, contacted, quote sent, followed up, booked, lost.

2. Lost reason tracking.
   Use a controlled set: unavailable date, too expensive, chose another band, no response, not a fit, duplicate, test/spam.

3. Quote value tracking.
   Record quoted package value, not just lead source.

4. Follow-up SLA.
   Paid leads should get a first reply the same day and a second follow-up within 48 hours if no response.

5. Ads verification.
   This is still the biggest platform continuity risk.

## Next 7-day plan

- Daily: check search terms, add competitor negatives, and verify no new phrase-match leaks.
- Daily: update `google-ads/LEAD_PIPELINE_TEMPLATE.csv` or a live sheet with status and quote value.
- After 5 paid leads: recalculate CPL, visible waste %, and booked/quoted rate.
- After 10 paid leads: decide whether the bottleneck is traffic, landing page, offer, reply speed, price, or availability.

## Repeatable calculator

Run:

```bash
node scripts/ads-unit-economics.js --spend=91.55 --leads=2 --package=2450 --margin=0.5 --rates=0.5,0.2,0.1,0.05,0.025
```

Use current spend and paid lead count when rerunning.
