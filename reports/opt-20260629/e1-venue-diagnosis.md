# Venue Campaign Diagnosis — `Search - Venue Wedding Bands` (23890296172)

Date: 2026-06-29. Read-only; no mutations made.

## Finding
The campaign is **ENABLED**, serving status **SERVING**, with its **own (non-shared) €2/day budget**.
It is not blocked, not paused, not budget-misrouted.

Every keyword sampled returns `system_serving_status = RARELY_SERVED`:

| Keyword | Match | Serving status |
|---|---|---|
| live band Ashford Castle wedding | EXACT | RARELY_SERVED |
| wedding music Ashford Castle | EXACT | RARELY_SERVED |
| wedding band Ashford Castle | PHRASE | RARELY_SERVED |
| Ashford Castle wedding band | EXACT | RARELY_SERVED |
| (… all 12 sampled) | | RARELY_SERVED |

`RARELY_SERVED` is Google's **"Low search volume"** flag: the query has too little search
traffic to enter the auction. It auto-reactivates if/when volume appears.

## Conclusion
Zero impressions all-time is **not a config, bid, or budget problem** — the venue-specific
queries ("wedding band <venue>") genuinely don't have searchable volume. The 50+ venue ad
groups are not a viable *paid search* play.

## Recommendation (no action taken)
1. **Leave the campaign as-is** — it costs nothing and will serve opportunistically if a venue
   query ever gets volume. No spend risk.
2. Do **not** broaden match types to force impressions — that would just pull generic
   wedding-band traffic into a venue bucket and muddy reporting.
3. Capture venue intent where it actually lives: **organic/SEO** on the existing venue landing
   pages (already built), and via the broader commercial campaigns whose ads can deep-link to
   venue pages.
4. Optional future: fold the highest-profile 3-5 venues (Ashford, Adare, Powerscourt, K Club)
   as **phrase** keywords inside the main commercial campaign so they can borrow its budget and
   serve when volume blips — but only if you want to test it; expected volume is still very low.
