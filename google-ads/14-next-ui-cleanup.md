# Google Ads Next UI Cleanup

Date: 2026-05-29

These are the remaining account changes that require signed-in Google Ads UI access or Google Ads API credentials. Do not raise budgets while doing this cleanup.

Production website status:

- `musicangel.ie` now serves versioned tracking scripts to avoid stale Cloudflare JS cache during the Ads launch.
- The website emits `generate_lead` with value `250`.
- Future enquiry emails capture `utm_adgroup`, `utm_matchtype`, `utm_network`, `gad_campaignid`, `gad_adgroupid`, `gad_creativeid`, and related Google Ads fields directly.
- Direct Google Ads conversion labels are still blank in `/js/google-ads-config.js`; measurement currently depends on GA4-imported conversions until the Ads UI supplies direct AW labels.

## 1. Conversion Value

Change `MusicAngel (web) generate_lead` from `€500` to `€250`.

Reason: `€500` is too optimistic until actual close rate and retained booking value are known. `€250` is a safer launch value for early optimization.

Keep:

- Optimization: Primary
- Count: One
- Click-through window: 90 days
- Account-default goal: Included

## 2. URL Options Hierarchy

Keep the account-level final URL suffix only:

```text
utm_source=google&utm_medium=cpc&utm_campaign={campaignid}&utm_adgroup={adgroupid}&utm_content={creative}&utm_term={keyword}&utm_matchtype={matchtype}&utm_network={network}
```

Clear any nonblank final URL suffix or tracking template at lower levels:

- campaign level
- ad group level
- keyword level
- ad level
- sitelink/asset level

Reason: Google Ads landing-page reporting showed paid clicks on literal `{ignore}` URLs. The site now redirects those safely, but the account should not have duplicated or lower-level URL options unless we deliberately need them.

## 3. First Paid Lead Path

Investigate the first confirmed paid lead in the Ads UI:

- Campaign ID: `23890295743`
- Ad group ID: `194701052777`
- Creative ID: `810584875823`
- Keyword: `wedding bands cork`
- Captured path: first landing `/wedding-band-cost-ireland/`, then `/wedding-bands-cork/`, then submit on `/the-beat-boutique/#enquiry`

Check whether the first click was a sitelink click or a main-ad click. If it was a main-ad click, verify the Cork keyword/ad final URL and any lower-level URL options because the local source maps Cork traffic to `/wedding-bands-cork/`.

## 4. Search Terms

Continue daily search-term review for the first seven live days.

Current stance:

- competitor/band-name searches stay negative unless MusicAngel explicitly wants conquesting
- keep `Search - Wedding Music Guides` paused
- keep total live budget at `€20/day`
- no smart bidding switch until primary conversions exist
