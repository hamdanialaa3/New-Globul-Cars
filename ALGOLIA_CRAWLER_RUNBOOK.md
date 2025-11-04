# Algolia Crawler Runbook — “Too many missing records”

This runbook helps you resolve blocking errors on finishReindexing due to “Too many missing records” and safely reindex mobilebg.eu without losing search coverage.

## When you see it
- Error: Blocking error on finishReindexing: Too many missing records
- Typically occurs when the crawler extracts a smaller set of records than the current index holds.

## Quick decision tree
1) Is the last publish recent (<24h) and you changed selectors/paths? 
   - YES → Prefer Retry with adjusted actions (selectors/paths/recordExtractor). 
   - NO → Proceed only after capturing a backup and a baseline diff.
2) Is objectID stable? (Same content must resolve to the same objectID)
   - YES → Continue. 
   - NO → Fix objectID strategy before re-running.
3) Did you unintentionally reduce coverage (pathsToMatch/denyFilters/sitemaps)?
   - YES → Restore coverage then Retry.

## Required guardrails (always)
- Snapshot backup: Export the current index to JSON (Algolia dashboard → Indices → Export). Keep timestamped.
- Dry-run locally: Verify recordExtractor returns an array and objectIDs are stable for 5–10 representative pages.
- Safe retry: If you must “Proceed anyway,” reduce the risk by enabling autoGenerateObjectIDs or keeping objectID stable.

## Coverage checklist (mobilebg.eu)
- Domain: https://mobilebg.eu
- Sitemaps: https://mobilebg.eu/sitemap.xml (and any section sitemaps)
- Paths to include:
  - /, /cars, /cars/*, /advanced-search, /profile, /profile/*, /sell, /help
  - Any other documented routes in “صفحات المشروع كافة .md” that are public.
- Paths to exclude:
  - Admin-only routes (/admin/*), OAuth callbacks (/oauth/callback), debug pages.

## Robust actions config (example)

Note: Use this as a template in Algolia Crawler UI. Adapt selectors to your DOM.

```json
{
  "indexName": "mobilebg_cars",
  "startUrls": ["https://mobilebg.eu"],
  "sitemaps": ["https://mobilebg.eu/sitemap.xml"],
  "actions": [
    {
      "pathsToMatch": [
        "https://mobilebg.eu/",
        "https://mobilebg.eu/cars",
        "https://mobilebg.eu/cars/**",
        "https://mobilebg.eu/advanced-search",
        "https://mobilebg.eu/help"
      ],
      "recordExtractor": ({ $, helpers }) => {
        const records = [];
        const pageTitle = $('head > title').text() || $('h1').first().text();
        const description = $('meta[name="description"]').attr('content') || '';
        if (pageTitle) {
          records.push(
            helpers._mergeRecord({
              objectID: helpers.url,            // 1: stable per-URL
              url: helpers.url,
              title: pageTitle,
              description
            })
          );
        }
        // Example: extract car cards
        $('.CarCard, [data-algolia="car-card"]').each((_, el) => {
          const $el = $(el);
          const title = $el.find('.title, h2, [data-title]').first().text().trim();
          const price = $el.find('.price, [data-price]').first().text().trim();
          const link = $el.find('a').attr('href');
          if (title && link) {
            records.push(
              helpers._mergeRecord({
                objectID: `${helpers.url}#${link}`.replace(/\/$/, ''), // 2: stable sub-ID
                url: new URL(link, helpers.url).toString(),
                title,
                price
              })
            );
          }
        });
        return records; // MUST return an array
      }
    }
  ],
  "initialIndexSettings": {
    "mobilebg_cars": {
      "attributesToHighlight": ["title", "description"],
      "searchableAttributes": ["title", "unordered(description)", "price"],
      "attributesForFaceting": ["filterOnly(make)", "filterOnly(model)", "filterOnly(fuel)"]
    }
  },
  "maxDepth": 6,
  "rateLimit": 8,
  "maxPages": 5000,
  "renderJavaScript": true,
  "jsRenderingService": {
    "useChrome": true
  },
  "recordExtractorOptions": {
    "autoGenerateObjectIDs": false
  }
}
```

Tips:
- objectID: Keep stable; for page-level objects use the canonical URL, for sub-items (cards) use URL#id pattern.
- Return value: Always return an array from recordExtractor; don’t return a single object.
- JS rendering: Enable when content is client-rendered (React); keep rateLimit conservative to avoid blocking.

## Recovery workflow
1) Export current index (backup).
2) Fix actions (selectors/paths) or objectID strategy.
3) Run a small-scope crawl (pathsToMatch a subset) to validate record counts + samples.
4) If counts align, run full crawl; otherwise, iteratively adjust selectors.
5) Only “Proceed anyway” if you are certain missing records are intentional deprecations.

## Observability
- Track crawl run logs for:
  - Extracted records count vs previous.
  - Per-path record distribution (cars, profiles, search pages).
- After publish, validate frontend queries still return results for top queries.

## Notes
- Domain migration to https://mobilebg.eu is complete in code; ensure the crawler uses mobilebg.eu everywhere (no globul.net).
- If you use a mirror on Firebase Hosting (fire-new-globul.web.app), keep it as a fallback source only; primary should be mobilebg.eu.
