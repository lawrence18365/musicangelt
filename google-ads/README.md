# MusicAngel Google Ads Setup

Generated 2026-06-02.

These files prepare the account for launch without enabling spend. Every campaign, ad group, keyword, ad, sitelink and callout is set to Paused. Review everything in Google Ads Editor before posting changes.

## Files

- `01-campaigns.csv` - paused search campaigns and starter budgets.
- `02-ad-groups.csv` - paused ad groups with starter max CPCs.
- `03-keywords.csv` - exact and phrase match keywords only.
- `04-responsive-search-ads.csv` - paused responsive search ads with validated length limits.
- `05-campaign-negative-keywords.csv` - negative keyword set repeated at campaign level.
- `05a-negative-keyword-list.csv` - shared negative list, including competitor/band-name exclusions seen in early search terms.
- `05b-negative-list-campaign-associations.csv` - shared negative list campaign associations.
- `06-sitelinks.csv` - campaign sitelinks.
- `07-callouts.csv` - campaign callouts.
- `08-landing-page-map.csv` - audit map for ad group to landing page.

## Required account setup

1. Create or open the Google Ads account for MusicAngel.
2. Confirm billing, business details, timezone, and currency. Use EUR.
3. Confirm auto-tagging is on.
4. Link the GA4 property that contains `G-WV874YXC8Z`.
5. In GA4, mark `generate_lead` as a key event.
6. Import `generate_lead` into Google Ads as the primary lead conversion.
7. Import `contact_click` as a secondary conversion, or create direct Google Ads click conversions and paste their labels into `/js/google-ads-config.js`.
8. Set account-level final URL suffix. Keep ad-level, ad-group-level, keyword-level, and sitelink-level suffixes blank unless there is a deliberate tracking reason:

```
utm_source=google&utm_medium=cpc&utm_campaign={campaignid}&utm_adgroup={adgroupid}&utm_content={creative}&utm_term={keyword}&utm_matchtype={matchtype}&utm_network={network}
```

9. Import the CSV files into Google Ads Editor in numeric order.
10. Keep everything paused until the conversion test below passes.

## Conversion values

- Primary: `generate_lead`, starting value EUR250, count one, lead category. Recalculate after real close-rate data.
- Secondary: `contact_click`, value EUR25 to EUR50, count one, lead category.
- Diagnostic only: `form_start`, `form_submit_attempt`, `lead_mailto_fallback`. Do not optimize bidding to these.

## Launch sequence

1. Get explicit approval immediately before enabling spend.
2. Submit a real test enquiry from a URL containing `?utm_source=google&utm_medium=cpc&gclid=TEST-GCLID`.
3. Confirm the enquiry email contains campaign/ad-click fields.
4. Confirm GA4 receives `generate_lead`.
5. Start with selected EUR5/day campaigns only. Four enabled campaigns equals EUR20/day; all five enabled campaigns equals EUR25/day.
6. If starting at EUR20/day, keep `Search - Wedding Music Guides` paused first because it is lower-intent than the commercial campaigns.
7. Check search terms daily for 7 days and add negatives before raising budget.

## Verified campaign settings

- Networks: Google Search only at launch.
- Languages: English.
- Locations: Ireland and Northern Ireland, United Kingdom.
- Location option: Presence, people in or regularly in targeted locations.
- Ad rotation: Optimize.
- Bidding: Manual CPC until at least 15 primary conversions, then test Maximize Conversions.
- Daily account safety target: EUR20 to EUR25 for the first live test. Keep campaign budgets at EUR5/day each unless there is an explicit decision to redistribute within the same total.
- Budget caveat: Google Ads uses average daily budgets. Actual daily spend may vary by campaign and can exceed the average daily budget on a given day, while staying within Google's monthly spending limit rules.

## Official setup references

- GA4 key event import: https://support.google.com/google-ads/answer/9520128
- Google consent mode: https://support.google.com/google-ads/answer/10000067
- Auto-tagging: https://support.google.com/google-ads/answer/1752125
- Final URL suffix: https://support.google.com/google-ads/answer/9054021
- Google Ads Editor CSV prep: https://support.google.com/google-ads/editor/answer/56368
- Google Ads Editor CSV columns: https://support.google.com/google-ads/editor/answer/57747
- Click conversion tracking: https://support.google.com/google-ads/answer/6331304
