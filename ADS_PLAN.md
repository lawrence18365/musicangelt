# Google Ads Campaign Plan — MusicAngel (Ireland)

A detailed Google Ads launch plan tuned to the actual GSC data from `thebeatboutique.ie` (same Google account, same niche). Built for review-and-execute by the user — **do not enable any of this without final approval**. The high-intent commercial queries here will spend money quickly.

## Budget framework

| Phase | Spend | Goal |
|---|---|---|
| Phase 1 (weeks 1-2) | **€20/day** = €280/wk = €1,200/mo | Establish data, find which keywords convert |
| Phase 2 (weeks 3-6) | **€40/day** = €560/wk = €2,400/mo | Scale winners, prune losers |
| Phase 3 (week 7+) | **€60-80/day** based on CAC | Compound on what's working |

**Target CAC (cost per booked wedding):** Pricing assumption: a band booking averages ~€3,200 in revenue to MusicAngel (or a per-booking commission if MusicAngel takes a cut). At a 25% conversion rate from enquiry-to-booking, target CAC of €500-700 means CPL of €125-175.

## Account structure

```
MusicAngel Ireland (account)
├── Campaign 1: Search — Brand & Discovery (€5/day)
├── Campaign 2: Search — High-Intent Commercial (€10/day)
├── Campaign 3: Search — Venue Queries (€5/day)
├── Campaign 4: Search — County Queries (off; turn on after Campaign 2 has signal)
└── Campaign 5: Performance Max (off until 30+ conversions in account)
```

## Campaign 1: Brand & Discovery

**Why first:** Cheapest CPCs, highest CTRs, protects against competitor brand-bidding.

**Daily budget:** €5

**Keywords (broad-match):**
- "musicangel"
- "music angel ireland"
- "music angel wedding"
- "the beat boutique wedding band"  ← already getting impressions per GSC
- "sway social wedding band"
- "the best men wedding band"
- "blacktye wedding band"

**Ad copy — Responsive Search Ad:**

**Headlines:**
- MusicAngel — Four Live Wedding Bands
- Wedding Bands Ireland — From €2450
- 100% Live · No Backing Tracks · Ireland
- Real Live Music for Your Wedding Day
- Compare Four Award-Winning Bands
- Check Availability for Your Date
- The Beat Boutique · Sway Social · Blacktye
- Wedding Bands Playing All of Ireland

**Descriptions:**
- Four standout live wedding bands. 100% live, every note, all of Ireland. Pricing from €2450. Check availability.
- The Beat Boutique, Sway Social, The Best Men, Blacktye. Compare side by side. Real live music, your day, our team.

**Final URL:** `https://musicangel.ie/`

---

## Campaign 2: High-Intent Commercial (the workhorse)

**Why:** The GSC data shows real commercial intent on these queries. Position 4-7 on the sibling domain organically — paid will short-circuit that.

**Daily budget:** €10 (Phase 1) → €25 (Phase 2)

### Ad group 2.1 — Pricing intent
**Keywords (phrase + exact match):**
- "wedding band cost ireland" — high intent, 173 impressions/qtr on sibling
- "wedding band prices ireland" — 61 impressions
- "average wedding band cost ireland" — 44 impressions
- "cost of wedding band ireland" — 51 impressions
- "wedding band ireland cost"

**Landing page:** `/wedding-band-cost-ireland`

**Ad headlines:**
- Wedding Band Cost Ireland · 2026 Guide
- From €2450 — Honest Irish Pricing
- What You Really Pay for an Irish Band
- 4-Piece Live · From €2450
- No Hidden Fees · Quote in 24 Hours

**Descriptions:**
- Honest 2026 guide: typical ranges, what's included, what changes the price. Get a tailored quote for your date.
- 4-piece live wedding bands from €2450. Travel + DJ music included. Check availability today.

### Ad group 2.2 — Direct booking intent
**Keywords:**
- "wedding band ireland"
- "wedding bands ireland"
- "live wedding band ireland"
- "best wedding bands ireland"
- "irish wedding bands"

**Landing page:** `/` (homepage) or `/compare-bands`

**Ad headlines:**
- Four Live Wedding Bands · Ireland-Wide
- Compare Four Bands Side by Side
- Real Live Music · From €2450
- Picked for Your Day · Same-Day Reply
- Award-Winning Live Wedding Bands

### Ad group 2.3 — Songs & first dance (broader intent)
**Keywords:**
- "first dance songs ireland" — 158 imp
- "wedding first dance songs"
- "best first dance songs"
- "irish first dance songs"

**Landing page:** `/first-dance-songs`

**Ad headlines:**
- 80+ First Dance Songs for 2026
- Curated by a Live Wedding Band
- First Dance Picks — Classic, Modern, Irish
- We'll Learn Your First Dance — Free

**Strategy note:** This ad group has lower commercial intent but feeds the funnel. Set lower bids, treat as awareness.

---

## Campaign 3: Venue Queries (the long-tail killer)

**Why:** The 36 venue pages we just built ALL deserve their own ad group. Couples Googling "wedding band [specific venue]" are 1-2 clicks from booking.

**Daily budget:** €5/day (split across all venue ad groups via shared budget)

**Structure:** One ad group per venue, all keywords exact-match.

### Ad group 3.x — example: Ashford Castle
**Keywords:**
- [wedding band ashford castle]
- [ashford castle wedding band]
- [wedding band for ashford castle]
- [live band ashford castle wedding]
- "wedding music ashford castle"

**Landing page:** `/wedding-band-ashford-castle`

**Ad headlines:**
- Wedding Band for Ashford Castle
- Live Bands That Suit Ashford Castle
- 4 Bands · State Banqueting Hall Tested
- From €2450 · Check Date Now

**Repeat for:** Dromoland Castle, Adare Manor, Powerscourt, The K Club, Mount Juliet, Carton House, Tankardstown, Castle Leslie, Ballyfin, Cabra Castle, Cliff at Lyons, Sheen Falls Lodge, Park Hotel Kenmare, etc.

---

## Campaign 4: County Queries (turn on later)

**Why:** Lower commercial intent than venues, but high volume. Turn on once Campaign 2 + 3 have data and you know your real CAC.

**Daily budget:** €5/day

### Ad group 4.x — example: Dublin
**Keywords:**
- "wedding bands dublin"
- "wedding band dublin"
- "live wedding band dublin"

**Landing page:** `/wedding-bands-dublin`

**Headlines:**
- Wedding Bands for Dublin Weddings
- Four Bands · Greater Dublin Area
- 100% Live · From €2450

**Repeat for:** Cork, Galway, Kerry, Limerick, Mayo, Donegal, Wicklow, Clare, Kilkenny, Tipperary, Waterford, Wexford, Kildare, Meath.

---

## Negative keywords (apply to entire account)

- "free"
- "diy"
- "youtube"
- "lyrics"
- "tabs"
- "chords"
- "cover"
- "karaoke"
- "tribute"
- "school"
- "function"
- "cheap"
- "amateur"
- "video"
- "guitar lesson"
- "join the band"
- "audition"

## Conversion tracking

**Before any spend, configure these conversion events in Google Ads:**

1. **Primary: generate_lead** — fired only after the enquiry API returns success. Import this from GA4 as the Google Ads conversion.
2. **Secondary: contact_click** — phone/email click. Lower value but useful for bidding signals.
3. **Secondary: band_click** — band page deep engagement.
4. **Diagnostic only: form_submit_attempt / lead_mailto_fallback** — useful for debugging form demand and backend outages, but do not import these as paid-search conversions.

In GA4 → Admin → Events → mark `generate_lead` as a Key Event. Then link GA4 to Google Ads in Admin → Product Links → Google Ads. Import as conversion.

**Set the enquiry conversion value to €250** at launch. Recalculate after enough real enquiries to estimate close rate and retained booking value.

## Bidding strategy

- **Phase 1 (no data yet):** Manual CPC, bid €1.50-€2.50.
- **Phase 2 (after 15+ conversions):** Switch to Maximize Conversions.
- **Phase 3 (after 30+ conversions):** Switch to Target CPA at €150.

## Geographic targeting

- **Include:** Ireland.
- **Exclude:** Northern Ireland (unless you actually serve NI weddings — current site copy says all-Ireland but content focuses RoI). Confirm before launching.
- **Bid adjustments:**
  - +20% Dublin, Cork city, Galway city (highest LTV).
  - -10% remote rural areas (lower LTV due to travel costs).

## Device targeting

- Mobile: -10% bid adjustment (mobile converts at ~60% of desktop for wedding planning).
- Desktop: standard.

## Schedule

- Run all hours initially; tune after 2 weeks based on conversion data.
- Common Irish wedding-planning windows: lunch (12-2pm), evening (7-10pm), weekends.

## What to do in week 1

- [ ] Set up the GA4 → Google Ads conversion import (15 min in Admin)
- [ ] Create the 4 campaigns above, all in **paused state**
- [ ] Add all keywords and negative keywords
- [ ] Write the ads (use the copy above)
- [ ] Set a daily spend cap of **€30 for the whole account** for safety
- [ ] Enable only Campaign 1 (Brand) and Campaign 2 (Commercial)
- [ ] Let it run 7 days, check Search Terms report daily for unwanted queries → add more negatives

## What to expect in month 1

- **20-40 enquiries** from paid (depending on competition + ad quality)
- **3-7 bookings** if your conversion-to-booking rate matches industry average
- **Cost per booking** target: €500-700 (well below the wedding band booking value)
- **Most-converting ad group** will likely be 2.1 (pricing intent) or 2.2 (direct band intent)
- **Lowest-converting ad group** will likely be 2.3 (first dance songs) — but it builds the remarketing pool

## What to do in month 2

- Pause keywords with zero conversions after €50 spent.
- Increase bids on top 3 keywords by 25%.
- Expand winning ad groups with new keyword variants.
- If conversion rate is strong, increase daily budget.
- Turn on Campaign 4 (county queries) if Campaign 3 (venue) is profitable.

## Programmatic creation via Google Ads API (optional, advanced)

The user has a `.google-ads-token.json` OAuth token. The Google Ads API supports creating campaigns, ad groups, ads, and keywords via API. If you want me to build this campaign in your live account *as paused drafts* for you to review and enable yourself, I can — the script would:

1. Authenticate with the existing token
2. Create campaigns 1-3 with the structure above, all paused
3. Add all keywords (with match types) and negative keywords
4. Create responsive search ads with the copy above
5. Link landing pages
6. Report back the campaign IDs for your review

**Risk:** Even paused campaigns can be accidentally enabled. **Recommend doing this manually first time in Google Ads UI**, then automating renewals/expansions via API after you trust the structure.

## DO NOT enable until

- [ ] Conversion tracking is verified (test by submitting a form and confirming Google Ads sees it within 24h)
- [ ] At least one ad group has 5+ properly-written ad headlines
- [ ] The landing page actually loads correctly on Vercel (DNS handover complete)
- [ ] You have €30/day in budget that's OK to lose for 2 weeks of testing
- [ ] You've added negative keywords (especially "free", "diy", "lyrics")

Open this doc again the day you launch.
