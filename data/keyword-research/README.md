# Keyword Research Exports

Place SEMrush, Ahrefs, or other keyword-tool CSV/TSV exports in this folder.

Then run:

```bash
node scripts/content-automation.js --csv=data/keyword-research/YOUR_EXPORT.csv
```

Expected useful columns include `Keyword`, `KD`, `Search Volume`, and `Intent`.
