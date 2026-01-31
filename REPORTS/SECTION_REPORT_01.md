# Section 01 - Search Filters Panel

## Current State
- UI components: Filters panel on homepage (exact component path not confirmed).
- Data sources: Listings data and basic counts (body type counts) shown.
- Backend endpoints: Not confirmed. Likely Firestore queries or Algolia facets (needs verification).
- Dependencies: Search services under src/services/search/, filter context, routing.
- Security/privacy: Filters are non-sensitive; ensure URL query state does not leak PII.

## Missing Items (with priority)
1. Persistent filter state in URL (Critical)
2. Deep filters (price range, year, fuel, transmission, mileage) (High)
3. Clear UX labels and reset control (Medium)
4. Accessibility (keyboard navigation, ARIA labels) (Medium)

## Implementation Tasks
- Task 01.1: Add URL query state for all filters.
  - Owner: Frontend
  - Estimate: 8h
  - Acceptance criteria: Filter changes update URL; page reload restores filters; shareable link works.
- Task 01.2: Add deep filters with min/max inputs and selects.
  - Owner: Frontend + Backend
  - Estimate: 16h
  - Acceptance criteria: Filters apply to results, counts update, validation for ranges.
- Task 01.3: Add clear/reset and improved labels.
  - Owner: Design + Frontend
  - Estimate: 6h
  - Acceptance criteria: Single reset clears all filters; labels localized bg/en.
- Task 01.4: Accessibility pass.
  - Owner: Frontend
  - Estimate: 4h
  - Acceptance criteria: Tab order correct; ARIA labels; contrast meets WCAG AA.

## Test Plan Snippets
- Events: filter_changed, filter_cleared, filter_applied.
- Manual tests:
  - Apply price range and reload: filters remain.
  - Share URL to new tab: same results.
- Automated tests:
  - Unit: URL query parsing.
  - E2E: Apply multi-filters and verify counts.

## API and Data Contracts (proposed)
- Endpoint: GET /api/search
- Query params: brand, model, price_min, price_max, year_min, year_max, fuel, transmission, mileage_max, city, sort
- Response:
  - items: [{id, title, price, year, fuel, mileage, city, images[]}]
  - facets: {brandCounts, bodyTypeCounts, fuelCounts}
  - total, page, pageSize

## SEO and Content Recommendations
- H1: Автомобили в България
- H2: Филтрирайте по цена, марка, година
- Meta description: Открийте автомобили с детайлни филтри и актуални обяви.
- Schema: ItemList for results

## Notes
- Verify existing filter context in src/contexts/FilterContext or search services.