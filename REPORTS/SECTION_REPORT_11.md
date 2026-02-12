# Section 11 - Verified Dealers

## Current State
- UI: Dealer list and ratings.
- Data sources: Dealers list.
- Backend endpoints: Not confirmed.
- Dependencies: dealer verification workflow.
- Security/privacy: Trust badges and compliance.

## Missing Items (with priority)
1. Verification workflow (Critical)
2. Trust badges logic (High)
3. SLA details (Medium)

## Implementation Tasks
- Task 11.1: Add dealer verification pipeline.
  - Owner: Backend + Legal
  - Estimate: 20h
- Task 11.2: Badge rules and display.
  - Owner: Frontend
  - Estimate: 8h

## Test Plan
- Events: dealer_profile_view, dealer_verified

## API (proposed)
- GET /api/dealers?verified=true

## SEO
- H1: Верифицирани дилъри