# Section 03 - Bulgarian Premium Selection

## Current State
- UI components: Curated list placeholder.
- Data sources: Not defined.
- Backend endpoints: None.
- Dependencies: listings, admin curation tool.
- Security/privacy: Ensure editorial criteria transparency.

## Missing Items (with priority)
1. Editorial curation rules (High)
2. Regional targeting (Medium)
3. Badges and premium labels (Medium)

## Implementation Tasks
- Task 03.1: Define curation policy and criteria.
  - Owner: Product + Legal
  - Estimate: 8h
  - Acceptance criteria: Written policy approved and stored in docs.
- Task 03.2: Implement curated collection in Firestore.
  - Owner: Backend
  - Estimate: 12h
  - Acceptance criteria: Admin can mark listings as premium; list shows curated items.
- Task 03.3: UI badges and regional targeting.
  - Owner: Frontend
  - Estimate: 10h
  - Acceptance criteria: Badge appears; region filter works.

## Test Plan Snippets
- Events: premium_impression, premium_click.
- Manual: mark listing as premium and verify display.
- Automated: curation rules validation.

## API and Data Contracts (proposed)
- GET /api/premium
  - Response: [{listingId, region, badgeLabel, expiresAt}]

## SEO and Content Recommendations
- H1: Премиум селекция
- Meta description: Премиум обяви с проверено качество.