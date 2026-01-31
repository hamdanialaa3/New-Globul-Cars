# Section 02 - Smart Search / Categories

## Current State
- UI components: Categories list with counts per body type.
- Data sources: Category counts likely from search service.
- Backend endpoints: Not confirmed; possibly Algolia index or Firestore aggregation.
- Dependencies: search services, category config.
- Security/privacy: None.

## Missing Items (with priority)
1. Dynamic category rules and taxonomy source (High)
2. SEO headings per category (Medium)
3. Canonical links for category pages (Medium)

## Implementation Tasks
- Task 02.1: Define taxonomy source (JSON or Firestore collection).
  - Owner: Data + Backend
  - Estimate: 10h
  - Acceptance criteria: Single source of truth for categories and rules.
- Task 02.2: Dynamic rules for category membership.
  - Owner: Backend
  - Estimate: 12h
  - Acceptance criteria: Rules applied consistently in search and counts.
- Task 02.3: SEO headings and canonical tags on category pages.
  - Owner: Frontend + SEO
  - Estimate: 6h
  - Acceptance criteria: H1/H2 set; canonical URL present.

## Test Plan Snippets
- Events: category_selected, category_viewed.
- Manual tests: select each category and verify count.
- Automated tests: taxonomy rules unit tests.

## API and Data Contracts (proposed)
- GET /api/categories
  - Response: [{id, name_bg, name_en, rules, count}]

## SEO and Content Recommendations
- H1: Категории автомобили
- H2: Изберете тип каросерия
- Schema: CollectionPage