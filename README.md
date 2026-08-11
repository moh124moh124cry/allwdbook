# AllWDbook accuracy fix

This patch removes fabricated market data and corrects the KDP paperback calculator.

## What it fixes

1. No fake Amazon books when `RAINFOREST_API_KEY` is missing.
2. ASIN tracking uses an exact product lookup instead of searching the ASIN and taking the first search result.
3. Keyword metrics are hidden when live market data is unavailable.
4. Niche ideas come from Amazon autocomplete, not random words/numbers.
5. Category finder stops inventing Top-100 BSR / sales-per-day values.
6. Paperback royalty uses the current 50% / 60% price thresholds.
7. Printing costs use marketplace, trim size, ink type and page count.
8. BSR-to-sales is explicitly treated as a heuristic estimate, never an official Amazon figure.

## Apply

Copy the replacement files over the repository, then run:

```bash
node apply-page-fix.mjs
npm run build
build 1915
build 2150
build 0145
build 1320
