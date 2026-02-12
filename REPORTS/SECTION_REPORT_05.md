# Section 05 - Drive Type Finder

## Current State
- UI components: Drive types described.
- Data sources: Not integrated.
- Backend endpoints: None.
- Dependencies: filters and landing pages.
- Security/privacy: None.

## Missing Items (with priority)
1. Filter integration (High)
2. Landing pages per drive type (Medium)

## Implementation Tasks
- Task 05.1: Map drive types to search filters.
  - Owner: Frontend
  - Estimate: 8h
  - Acceptance criteria: selecting drive type filters results.
- Task 05.2: Create /drive/awd etc landing pages.
  - Owner: Frontend + SEO
  - Estimate: 10h
  - Acceptance criteria: H1/H2 and meta tags set.

## Test Plan
- Events: drive_type_selected
- Manual: AWD shows correct results.

## API and Data Contracts (proposed)
- Search filter param: drive_type=awd|fwd|rwd

## SEO
- H1: Автомобили с AWD