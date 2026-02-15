# Section 07 - Popular Brands

## Current State
- UI components: Brand tiles present.
- Data sources: Not confirmed.
- Backend endpoints: Not confirmed.
- Dependencies: brand taxonomy.
- Security/privacy: None.

## Missing Items (with priority)
1. Brand pages and canonical links (High)
2. Brand counts source (Medium)

## Implementation Tasks
- Task 07.1: Create brand landing pages with SEO.
  - Owner: Frontend + SEO
  - Estimate: 10h
  - Acceptance criteria: /brand/:name with H1/H2, meta.
- Task 07.2: Source counts from search facets.
  - Owner: Backend
  - Estimate: 8h
  - Acceptance criteria: counts reflect inventory.

## Test Plan
- Events: brand_tile_click

## API (proposed)
- GET /api/brands
  - Response: [{name, count, image}]

## SEO
- Canonical to /brand/:name