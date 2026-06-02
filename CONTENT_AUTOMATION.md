# SEO Content Automation

This turns the Reddit workflow into a repeatable MusicAngel process:

seed/query data -> keyword filters -> intent grouping -> duplicate check -> content brief -> on-page optimization -> publish.

## Weekly Workflow

1. The existing `Weekly GSC + GA4 digest` workflow runs on Monday.
2. `SEO content automation` runs on Tuesday at 08:15 UTC.
3. It writes:
   - `reports/content-automation/YYYY-MM-DD-content-automation.md`
   - `content-briefs/YYYY-MM-DD/*.md`
4. Review the top briefs and publish or improve 1-2 pages per week.

The automation is intentionally conservative. It creates briefs and priorities, not thin auto-published pages.

## Manual Run

```bash
node scripts/content-automation.js
```

With a SEMrush or Ahrefs CSV export:

```bash
node scripts/content-automation.js --csv=data/keyword-research/semrush-export.csv --max-briefs=12
```

With extra seed ideas:

```bash
node scripts/content-automation.js --seed="wedding band ireland" --seed="first dance songs ireland"
```

Dry run:

```bash
node scripts/content-automation.js --dry-run
```

## Filters

Defaults match the workflow in the screenshot where data exists:

| Filter | Default |
|---|---:|
| Keyword difficulty | `<= 29` |
| Search volume | `>= 500` |
| GSC impressions when no SV exists | `>= 50` |

Override them when the Irish niche needs lower-volume commercial terms:

```bash
node scripts/content-automation.js --min-sv=150 --min-gsc-impressions=25 --max-kd=35
```

## CSV Columns

The parser accepts common column names:

| Meaning | Accepted columns |
|---|---|
| Keyword | `Keyword`, `Query`, `Search Term`, `Term`, `Phrase` |
| Search volume | `SV`, `Search Volume`, `Volume`, `Avg Monthly Searches` |
| Difficulty | `KD`, `Keyword Difficulty`, `Difficulty` |
| Intent | `Intent`, `Search Intent`, `User Intent` |
| GSC metrics | `Impressions`, `Clicks`, `CTR`, `Position`, `Pos` |

Drop exports into `data/keyword-research/` and rerun the script.

## Publishing Rule

Use the generated brief as the brief, not as the final article. Before publishing:

- Do a quick SERP/content-gap check in SEMrush or Ahrefs.
- Write the article with real MusicAngel examples and current Irish pricing/venue context.
- Run SEMrush Writing Assistant or a comparable on-page tool.
- Regenerate `sitemap.xml` when a new page is created.
