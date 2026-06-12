# Google Ads Improvement Plan - MusicAngel

Updated: 2026-05-27

This is the current hardening record for the Google Ads account launch. The recommended launch was applied on 2026-05-27 after explicit approval.

## API vs UI decision

Use the Google Ads UI / computer use for this setup pass. This was the path used for the live setup.

Reason: the Google Ads API requires a Google Ads manager account, developer token, Google Cloud/OAuth credentials, and a production-capable access level before it can safely mutate this live account. That setup is worth doing later for recurring reporting, search-term mining, budget pacing, and repeatable bulk experiments. It is not the fastest or lowest-risk way to finish one account setup pass.

## Completed UI hardening

1. Four campaigns are enabled.
2. `Search - Wedding Music Guides` remains paused.
3. Each campaign budget is 5.00 EUR/day.
4. Search Network only at launch.
5. Language is English.
6. Target locations are Ireland and Northern Ireland.
7. Location targeting option is Presence: people in or regularly in targeted locations.
8. Broad match remains off. Exact and phrase only.
9. Current planned average daily budget is 20.00 EUR/day.
10. Ad groups page showed `1 - 93 of 93`; visible rows were `Enabled` with no blocking status.
11. The earlier no-ads-running warning disappeared after the ad group/ad layer recheck.

## Asset additions applied

### Structured snippet asset

Applied at account level. Status observed in the Google Ads UI: `Eligible`.

Header: Service catalog

Values:

- Wedding Bands
- Band And DJ
- Ceremony Music
- Drinks Reception
- Showcases
- First Dance

### Price asset

Applied at account level. Status observed in the Google Ads UI: `Pending Under review`.

Language: English

Currency: EUR

Type: Services

Price qualifier: From

Items:

| Header | Price | Description | Final URL |
| --- | ---: | --- | --- |
| Evening Band | 2450 | Live band package | https://musicangel.ie/wedding-band-cost-ireland/ |
| Ceremony Music | 300 | Acoustic add-on | https://musicangel.ie/ceremony-music/ |
| Drinks Reception | 300 | Acoustic add-on | https://musicangel.ie/drinks-reception-music/ |
| Dedicated DJ | 400 | Late-night add-on | https://musicangel.ie/wedding-band-and-dj-package/ |

Price notes are sourced from the live site copy. Evening bands are from 2450. Ceremony/drinks reception add-ons are typically 300-500. Dedicated DJ add-on is typically 400-800.

### Call asset

Applied at account level after approval.

Phone number on the live site: +353 87 231 0001. Entered in Google Ads with Ireland selected as `087 231 0001`.

Status observed in the Google Ads UI: `Pending Under review`.

### Image assets

Prepared upload-ready files:

- google-ads/assets/image-assets/beat-boutique-square.jpg
- google-ads/assets/image-assets/beat-boutique-landscape.jpg
- google-ads/assets/image-assets/blacktye-square.jpg
- google-ads/assets/image-assets/blacktye-landscape.jpg
- google-ads/assets/image-assets/sway-social-square.jpg
- google-ads/assets/image-assets/sway-social-landscape.jpg
- google-ads/assets/image-assets/the-best-men-square.jpg
- google-ads/assets/image-assets/the-best-men-landscape.jpg

Each file is JPG, under 5 MB, and sized to Google's recommended Search image asset dimensions:

- Square: 1200x1200
- Landscape: 1200x628

Current status: blocked by Google Ads UI. The Create asset menu does not expose `Image` for this account yet.

Important: Google says Search image assets require the account to be open for at least 60 days, have good policy compliance, have active campaigns, have active text ads, and have Search spend in the last 30 days greater than 0. The same help page says the option to create image assets appears only when those requirements are met. Keep these files ready and add them after the first live spend window once the account becomes eligible.

## Gold test to keep paused first

There is a useful lower-budget test around the existing page `/wedding-band-vs-dj/`.

Create only as paused until the core campaigns produce clean search terms:

- Campaign: Search - Wedding Music Guides
- Ad group: Band vs DJ
- Landing page: https://musicangel.ie/wedding-band-vs-dj/
- Match types: Exact and phrase only
- Starter max CPC: 1.00 EUR
- Launch priority: after the main commercial campaigns, not day one if staying at 20 EUR/day.

Seed keywords:

- wedding band vs dj
- wedding band or dj
- dj or band for wedding
- band vs dj wedding ireland
- wedding band and dj package
