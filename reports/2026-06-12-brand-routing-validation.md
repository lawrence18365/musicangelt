# Brand & Bands Routing Validation - 2026-06-12

No live Google Ads changes were made. This validates the clean upload candidate only.

| Term group | Target final URL | Status | Page/enquiry validation | Tracking validation |
| --- | --- | --- | --- | --- |
| Beat Boutique terms | https://musicangel.ie/the-beat-boutique/ | PASS | Page returns 200; contains enquiry form, Check Availability CTA, current site.js; relevant to The Beat Boutique. | UTMs/gclid preserved in requested URL; no final URL suffix or ignore segment added. |
| Sway Social terms | https://musicangel.ie/sway-social/ | PASS | Page returns 200; contains enquiry form, Check Availability CTA, current site.js; relevant to Sway Social. | UTMs/gclid preserved in requested URL; no final URL suffix or ignore segment added. |
| The Best Men terms | https://musicangel.ie/the-best-men/ | PASS | Page returns 200; contains enquiry form, Check Availability CTA, current site.js; relevant to The Best Men. | UTMs/gclid preserved in requested URL; no final URL suffix or ignore segment added. |
| Blacktye terms | https://musicangel.ie/blacktye/ | PASS | Page returns 200; contains enquiry form, Check Availability CTA, current site.js; relevant to Blacktye. | UTMs/gclid preserved in requested URL; no final URL suffix or ignore segment added. |

Clean upload candidate: `google-ads/18-v11-brand-final-url-routing-clean-20260612.csv`.

Production `{ignore}` validation also passed with `node scripts/validate-ignore-redirects.js https://musicangel.ie`; malformed band-page URLs 302 to clean band pages and preserve UTMs/gclid.
