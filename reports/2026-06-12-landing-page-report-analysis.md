# Landing Page Report Analysis - 2026-06-12

Date range: May 22, 2026 - June 12, 2026. No live Google Ads changes made.

## Totals

| Bucket | Rows | Clicks | Impr. | Cost | Conversion data |
| --- | --- | --- | --- | --- | --- |
| Malformed ignore rows | 32 | 140 | 1373 | EUR 232.19 | Unavailable in this export |
| Clean rows | 10 | 38 | 3553 | EUR 63.60 | Unavailable in this export |

## Normalized Landing Targets

| Clean target | Total clicks | Total cost | Malformed clicks | Malformed cost | Clean clicks | Clean cost |
| --- | --- | --- | --- | --- | --- | --- |
| https://musicangel.ie/wedding-band-cost-ireland/ | 44 | EUR 86.11 | 20 | EUR 46.75 | 24 | EUR 39.36 |
| https://musicangel.ie/ | 36 | EUR 75.78 | 36 | EUR 75.78 | 0 | EUR 0.00 |
| https://musicangel.ie/wedding-band-and-dj-package/ | 10 | EUR 17.12 | 5 | EUR 8.79 | 5 | EUR 8.33 |
| https://musicangel.ie/compare-bands/ | 15 | EUR 14.71 | 14 | EUR 12.36 | 1 | EUR 2.35 |
| https://musicangel.ie/wedding-bands-dublin/ | 8 | EUR 10.98 | 8 | EUR 10.98 | 0 | EUR 0.00 |
| https://musicangel.ie/wedding-bands-cork/ | 7 | EUR 9.60 | 7 | EUR 9.60 | 0 | EUR 0.00 |
| https://musicangel.ie/wedding-bands-donegal/ | 7 | EUR 9.56 | 7 | EUR 9.56 | 0 | EUR 0.00 |
| https://musicangel.ie/wedding-bands-galway/ | 7 | EUR 9.55 | 7 | EUR 9.55 | 0 | EUR 0.00 |
| https://musicangel.ie/wedding-bands-kerry/ | 6 | EUR 7.80 | 6 | EUR 7.80 | 0 | EUR 0.00 |
| https://musicangel.ie/drinks-reception-music/ | 5 | EUR 6.90 | 5 | EUR 6.90 | 0 | EUR 0.00 |
| https://musicangel.ie/wedding-bands-derry/ | 5 | EUR 6.82 | 5 | EUR 6.82 | 0 | EUR 0.00 |
| https://musicangel.ie/wedding-band-showcases/ | 3 | EUR 4.68 | 2 | EUR 2.77 | 1 | EUR 1.91 |
| https://musicangel.ie/first-dance-songs/ | 3 | EUR 4.43 | 0 | EUR 0.00 | 3 | EUR 4.43 |
| https://musicangel.ie/wedding-bands-limerick/ | 3 | EUR 4.14 | 3 | EUR 4.14 | 0 | EUR 0.00 |
| https://musicangel.ie/wedding-bands-cavan/ | 3 | EUR 4.14 | 3 | EUR 4.14 | 0 | EUR 0.00 |
| https://musicangel.ie/wedding-bands-kilkenny/ | 3 | EUR 4.05 | 3 | EUR 4.05 | 0 | EUR 0.00 |
| https://musicangel.ie/venues/ | 2 | EUR 3.93 | 0 | EUR 0.00 | 2 | EUR 3.93 |
| https://musicangel.ie/the-best-men/ | 2 | EUR 3.29 | 0 | EUR 0.00 | 2 | EUR 3.29 |
| https://musicangel.ie/wedding-bands-wexford/ | 2 | EUR 2.64 | 2 | EUR 2.64 | 0 | EUR 0.00 |
| https://musicangel.ie/wedding-bands-meath/ | 1 | EUR 1.40 | 1 | EUR 1.40 | 0 | EUR 0.00 |
| https://musicangel.ie/wedding-bands-clare/ | 1 | EUR 1.39 | 1 | EUR 1.39 | 0 | EUR 0.00 |
| https://musicangel.ie/wedding-bands-westmeath/ | 1 | EUR 1.39 | 1 | EUR 1.39 | 0 | EUR 0.00 |
| https://musicangel.ie/wedding-bands-sligo/ | 1 | EUR 1.37 | 1 | EUR 1.37 | 0 | EUR 0.00 |
| https://musicangel.ie/wedding-bands-fermanagh/ | 1 | EUR 1.35 | 1 | EUR 1.35 | 0 | EUR 0.00 |
| https://musicangel.ie/wedding-bands-louth/ | 1 | EUR 1.35 | 1 | EUR 1.35 | 0 | EUR 0.00 |
| https://musicangel.ie/wedding-bands-tipperary/ | 1 | EUR 1.31 | 1 | EUR 1.31 | 0 | EUR 0.00 |
| https://musicangel.ie/wedding-bands-waterford/ | 0 | EUR 0.00 | 0 | EUR 0.00 | 0 | EUR 0.00 |
| https://musicangel.ie/wedding-bands-leitrim/ | 0 | EUR 0.00 | 0 | EUR 0.00 | 0 | EUR 0.00 |
| https://musicangel.ie/wedding-bands-carlow/ | 0 | EUR 0.00 | 0 | EUR 0.00 | 0 | EUR 0.00 |
| https://musicangel.ie/wedding-bands-tyrone/ | 0 | EUR 0.00 | 0 | EUR 0.00 | 0 | EUR 0.00 |

## Status

- Historical/reporting issue: verified. The May22-Jun12 export contains malformed ignore rows.
- Freshness: unresolved. The export has no date column.
- Production direct URL 404: disproven when tested correctly. `curl` needs `-g` for literal braces; `node scripts/validate-ignore-redirects.js https://musicangel.ie` verified redirects to clean 200 pages while preserving UTMs/gclid.
- Poor landing-page absorption: the biggest reported spend is root/cost-guide/compare/county pages, but conversion data is missing from the Landing Page export. Use D1 leads as the conversion source.

## Full Landing Rows

| Landing page | Bucket | Clicks | Impr. | Cost | Conversions | Normalized clean target |
| --- | --- | --- | --- | --- | --- | --- |
| https://musicangel.ie/wedding-bands-kilkenny/{ignore}?utm_source=google&utm_medium=cpc&utm_campaign={campaignid}&utm_adgroup={adgroupid}&utm_content={creative}&utm_term={keyword}&utm_matchtype={matchtype}&utm_network={network} | malformed_ignore | 3 | 9 | EUR 4.05 | n/a - export has no conversions column | https://musicangel.ie/wedding-bands-kilkenny/ |
| https://musicangel.ie/wedding-bands-clare/{ignore}?utm_source=google&utm_medium=cpc&utm_campaign={campaignid}&utm_adgroup={adgroupid}&utm_content={creative}&utm_term={keyword}&utm_matchtype={matchtype}&utm_network={network} | malformed_ignore | 1 | 24 | EUR 1.39 | n/a - export has no conversions column | https://musicangel.ie/wedding-bands-clare/ |
| https://musicangel.ie/wedding-bands-waterford/{ignore}?utm_source=google&utm_medium=cpc&utm_campaign={campaignid}&utm_adgroup={adgroupid}&utm_content={creative}&utm_term={keyword}&utm_matchtype={matchtype}&utm_network={network} | malformed_ignore | 0 | 14 | EUR 0.00 | n/a - export has no conversions column | https://musicangel.ie/wedding-bands-waterford/ |
| https://musicangel.ie/wedding-band-showcases/{ignore}?utm_source=google&utm_medium=cpc&utm_campaign={campaignid}&utm_adgroup={adgroupid}&utm_content={creative}&utm_term={keyword}&utm_matchtype={matchtype}&utm_network={network} | malformed_ignore | 2 | 4 | EUR 2.77 | n/a - export has no conversions column | https://musicangel.ie/wedding-band-showcases/ |
| https://musicangel.ie/wedding-bands-westmeath/{ignore}?utm_source=google&utm_medium=cpc&utm_campaign={campaignid}&utm_adgroup={adgroupid}&utm_content={creative}&utm_term={keyword}&utm_matchtype={matchtype}&utm_network={network} | malformed_ignore | 1 | 10 | EUR 1.39 | n/a - export has no conversions column | https://musicangel.ie/wedding-bands-westmeath/ |
| https://musicangel.ie/wedding-bands-leitrim/{ignore}?utm_source=google&utm_medium=cpc&utm_campaign={campaignid}&utm_adgroup={adgroupid}&utm_content={creative}&utm_term={keyword}&utm_matchtype={matchtype}&utm_network={network} | malformed_ignore | 0 | 1 | EUR 0.00 | n/a - export has no conversions column | https://musicangel.ie/wedding-bands-leitrim/ |
| https://musicangel.ie/wedding-bands-fermanagh/{ignore}?utm_source=google&utm_medium=cpc&utm_campaign={campaignid}&utm_adgroup={adgroupid}&utm_content={creative}&utm_term={keyword}&utm_matchtype={matchtype}&utm_network={network} | malformed_ignore | 1 | 2 | EUR 1.35 | n/a - export has no conversions column | https://musicangel.ie/wedding-bands-fermanagh/ |
| https://musicangel.ie/wedding-band-and-dj-package/ | clean | 5 | 524 | EUR 8.33 | n/a - export has no conversions column | https://musicangel.ie/wedding-band-and-dj-package/ |
| https://musicangel.ie/wedding-bands-carlow/{ignore}?utm_source=google&utm_medium=cpc&utm_campaign={campaignid}&utm_adgroup={adgroupid}&utm_content={creative}&utm_term={keyword}&utm_matchtype={matchtype}&utm_network={network} | malformed_ignore | 0 | 1 | EUR 0.00 | n/a - export has no conversions column | https://musicangel.ie/wedding-bands-carlow/ |
| https://musicangel.ie/wedding-bands-dublin/{ignore}?utm_source=google&utm_medium=cpc&utm_campaign={campaignid}&utm_adgroup={adgroupid}&utm_content={creative}&utm_term={keyword}&utm_matchtype={matchtype}&utm_network={network} | malformed_ignore | 8 | 113 | EUR 10.98 | n/a - export has no conversions column | https://musicangel.ie/wedding-bands-dublin/ |
| https://musicangel.ie/wedding-bands-louth/{ignore}?utm_source=google&utm_medium=cpc&utm_campaign={campaignid}&utm_adgroup={adgroupid}&utm_content={creative}&utm_term={keyword}&utm_matchtype={matchtype}&utm_network={network} | malformed_ignore | 1 | 8 | EUR 1.35 | n/a - export has no conversions column | https://musicangel.ie/wedding-bands-louth/ |
| https://musicangel.ie/wedding-bands-kerry/{ignore}?utm_source=google&utm_medium=cpc&utm_campaign={campaignid}&utm_adgroup={adgroupid}&utm_content={creative}&utm_term={keyword}&utm_matchtype={matchtype}&utm_network={network} | malformed_ignore | 6 | 45 | EUR 7.80 | n/a - export has no conversions column | https://musicangel.ie/wedding-bands-kerry/ |
| https://musicangel.ie/wedding-bands-sligo/{ignore}?utm_source=google&utm_medium=cpc&utm_campaign={campaignid}&utm_adgroup={adgroupid}&utm_content={creative}&utm_term={keyword}&utm_matchtype={matchtype}&utm_network={network} | malformed_ignore | 1 | 16 | EUR 1.37 | n/a - export has no conversions column | https://musicangel.ie/wedding-bands-sligo/ |
| https://musicangel.ie/wedding-bands-limerick/{ignore}?utm_source=google&utm_medium=cpc&utm_campaign={campaignid}&utm_adgroup={adgroupid}&utm_content={creative}&utm_term={keyword}&utm_matchtype={matchtype}&utm_network={network} | malformed_ignore | 3 | 23 | EUR 4.14 | n/a - export has no conversions column | https://musicangel.ie/wedding-bands-limerick/ |
| https://musicangel.ie/wedding-bands-meath/{ignore}?utm_source=google&utm_medium=cpc&utm_campaign={campaignid}&utm_adgroup={adgroupid}&utm_content={creative}&utm_term={keyword}&utm_matchtype={matchtype}&utm_network={network} | malformed_ignore | 1 | 16 | EUR 1.40 | n/a - export has no conversions column | https://musicangel.ie/wedding-bands-meath/ |
| https://musicangel.ie/first-dance-songs/ | clean | 3 | 543 | EUR 4.43 | n/a - export has no conversions column | https://musicangel.ie/first-dance-songs/ |
| https://musicangel.ie/wedding-bands-tyrone/{ignore}?utm_source=google&utm_medium=cpc&utm_campaign={campaignid}&utm_adgroup={adgroupid}&utm_content={creative}&utm_term={keyword}&utm_matchtype={matchtype}&utm_network={network} | malformed_ignore | 0 | 2 | EUR 0.00 | n/a - export has no conversions column | https://musicangel.ie/wedding-bands-tyrone/ |
| https://musicangel.ie/wedding-bands-wicklow/{ignore}?utm_source=google&utm_medium=cpc&utm_campaign={campaignid}&utm_adgroup={adgroupid}&utm_content={creative}&utm_term={keyword}&utm_matchtype={matchtype}&utm_network={network} | malformed_ignore | 0 | 6 | EUR 0.00 | n/a - export has no conversions column | https://musicangel.ie/wedding-bands-wicklow/ |
| https://musicangel.ie/wedding-bands-offaly/{ignore}?utm_source=google&utm_medium=cpc&utm_campaign={campaignid}&utm_adgroup={adgroupid}&utm_content={creative}&utm_term={keyword}&utm_matchtype={matchtype}&utm_network={network} | malformed_ignore | 0 | 4 | EUR 0.00 | n/a - export has no conversions column | https://musicangel.ie/wedding-bands-offaly/ |
| https://musicangel.ie/the-best-men/ | clean | 2 | 348 | EUR 3.29 | n/a - export has no conversions column | https://musicangel.ie/the-best-men/ |
| https://musicangel.ie/sway-social/ | clean | 0 | 41 | EUR 0.00 | n/a - export has no conversions column | https://musicangel.ie/sway-social/ |
| https://musicangel.ie/wedding-band-cost-ireland/{ignore}?utm_source=google&utm_medium=cpc&utm_campaign={campaignid}&utm_adgroup={adgroupid}&utm_content={creative}&utm_term={keyword}&utm_matchtype={matchtype}&utm_network={network} | malformed_ignore | 20 | 132 | EUR 46.75 | n/a - export has no conversions column | https://musicangel.ie/wedding-band-cost-ireland/ |
| https://musicangel.ie/drinks-reception-music/{ignore}?utm_source=google&utm_medium=cpc&utm_campaign={campaignid}&utm_adgroup={adgroupid}&utm_content={creative}&utm_term={keyword}&utm_matchtype={matchtype}&utm_network={network} | malformed_ignore | 5 | 87 | EUR 6.90 | n/a - export has no conversions column | https://musicangel.ie/drinks-reception-music/ |
| https://musicangel.ie/compare-bands/{ignore}?utm_source=google&utm_medium=cpc&utm_campaign={campaignid}&utm_adgroup={adgroupid}&utm_content={creative}&utm_term={keyword}&utm_matchtype={matchtype}&utm_network={network} | malformed_ignore | 14 | 101 | EUR 12.36 | n/a - export has no conversions column | https://musicangel.ie/compare-bands/ |
| https://musicangel.ie/wedding-bands-cavan/{ignore}?utm_source=google&utm_medium=cpc&utm_campaign={campaignid}&utm_adgroup={adgroupid}&utm_content={creative}&utm_term={keyword}&utm_matchtype={matchtype}&utm_network={network} | malformed_ignore | 3 | 6 | EUR 4.14 | n/a - export has no conversions column | https://musicangel.ie/wedding-bands-cavan/ |
| https://musicangel.ie/wedding-bands-galway/{ignore}?utm_source=google&utm_medium=cpc&utm_campaign={campaignid}&utm_adgroup={adgroupid}&utm_content={creative}&utm_term={keyword}&utm_matchtype={matchtype}&utm_network={network} | malformed_ignore | 7 | 69 | EUR 9.55 | n/a - export has no conversions column | https://musicangel.ie/wedding-bands-galway/ |
| https://musicangel.ie/{ignore}?utm_source=google&utm_medium=cpc&utm_campaign={campaignid}&utm_adgroup={adgroupid}&utm_content={creative}&utm_term={keyword}&utm_matchtype={matchtype}&utm_network={network} | malformed_ignore | 36 | 371 | EUR 75.78 | n/a - export has no conversions column | https://musicangel.ie/ |
| https://musicangel.ie/wedding-band-showcases/ | clean | 1 | 286 | EUR 1.91 | n/a - export has no conversions column | https://musicangel.ie/wedding-band-showcases/ |
| https://musicangel.ie/wedding-bands-kildare/{ignore}?utm_source=google&utm_medium=cpc&utm_campaign={campaignid}&utm_adgroup={adgroupid}&utm_content={creative}&utm_term={keyword}&utm_matchtype={matchtype}&utm_network={network} | malformed_ignore | 0 | 6 | EUR 0.00 | n/a - export has no conversions column | https://musicangel.ie/wedding-bands-kildare/ |
| https://musicangel.ie/wedding-band-cost-ireland/ | clean | 24 | 822 | EUR 39.36 | n/a - export has no conversions column | https://musicangel.ie/wedding-band-cost-ireland/ |
| https://musicangel.ie/blacktye/ | clean | 0 | 28 | EUR 0.00 | n/a - export has no conversions column | https://musicangel.ie/blacktye/ |
| https://musicangel.ie/wedding-bands-wexford/{ignore}?utm_source=google&utm_medium=cpc&utm_campaign={campaignid}&utm_adgroup={adgroupid}&utm_content={creative}&utm_term={keyword}&utm_matchtype={matchtype}&utm_network={network} | malformed_ignore | 2 | 18 | EUR 2.64 | n/a - export has no conversions column | https://musicangel.ie/wedding-bands-wexford/ |
| https://musicangel.ie/wedding-bands-mayo/{ignore}?utm_source=google&utm_medium=cpc&utm_campaign={campaignid}&utm_adgroup={adgroupid}&utm_content={creative}&utm_term={keyword}&utm_matchtype={matchtype}&utm_network={network} | malformed_ignore | 0 | 8 | EUR 0.00 | n/a - export has no conversions column | https://musicangel.ie/wedding-bands-mayo/ |
| https://musicangel.ie/venues/ | clean | 2 | 500 | EUR 3.93 | n/a - export has no conversions column | https://musicangel.ie/venues/ |
| https://musicangel.ie/wedding-band-and-dj-package/{ignore}?utm_source=google&utm_medium=cpc&utm_campaign={campaignid}&utm_adgroup={adgroupid}&utm_content={creative}&utm_term={keyword}&utm_matchtype={matchtype}&utm_network={network} | malformed_ignore | 5 | 106 | EUR 8.79 | n/a - export has no conversions column | https://musicangel.ie/wedding-band-and-dj-package/ |
| https://musicangel.ie/wedding-bands-donegal/{ignore}?utm_source=google&utm_medium=cpc&utm_campaign={campaignid}&utm_adgroup={adgroupid}&utm_content={creative}&utm_term={keyword}&utm_matchtype={matchtype}&utm_network={network} | malformed_ignore | 7 | 38 | EUR 9.56 | n/a - export has no conversions column | https://musicangel.ie/wedding-bands-donegal/ |
| https://musicangel.ie/compare-bands/ | clean | 1 | 368 | EUR 2.35 | n/a - export has no conversions column | https://musicangel.ie/compare-bands/ |
| https://musicangel.ie/wedding-bands-tipperary/{ignore}?utm_source=google&utm_medium=cpc&utm_campaign={campaignid}&utm_adgroup={adgroupid}&utm_content={creative}&utm_term={keyword}&utm_matchtype={matchtype}&utm_network={network} | malformed_ignore | 1 | 8 | EUR 1.31 | n/a - export has no conversions column | https://musicangel.ie/wedding-bands-tipperary/ |
| https://musicangel.ie/the-beat-boutique/ | clean | 0 | 93 | EUR 0.00 | n/a - export has no conversions column | https://musicangel.ie/the-beat-boutique/ |
| https://musicangel.ie/wedding-bands-cork/{ignore}?utm_source=google&utm_medium=cpc&utm_campaign={campaignid}&utm_adgroup={adgroupid}&utm_content={creative}&utm_term={keyword}&utm_matchtype={matchtype}&utm_network={network} | malformed_ignore | 7 | 92 | EUR 9.60 | n/a - export has no conversions column | https://musicangel.ie/wedding-bands-cork/ |
| https://musicangel.ie/wedding-bands-laois/{ignore}?utm_source=google&utm_medium=cpc&utm_campaign={campaignid}&utm_adgroup={adgroupid}&utm_content={creative}&utm_term={keyword}&utm_matchtype={matchtype}&utm_network={network} | malformed_ignore | 0 | 2 | EUR 0.00 | n/a - export has no conversions column | https://musicangel.ie/wedding-bands-laois/ |
| https://musicangel.ie/wedding-bands-derry/{ignore}?utm_source=google&utm_medium=cpc&utm_campaign={campaignid}&utm_adgroup={adgroupid}&utm_content={creative}&utm_term={keyword}&utm_matchtype={matchtype}&utm_network={network} | malformed_ignore | 5 | 31 | EUR 6.82 | n/a - export has no conversions column | https://musicangel.ie/wedding-bands-derry/ |