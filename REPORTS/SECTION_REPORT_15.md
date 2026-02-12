# Section 15 - Pricing Plans / Seller Plans

## Current State
- UI: Plans listed and CTA.
- Data sources: Plan definitions.
- Backend endpoints: Not confirmed.
- Dependencies: payment integration.
- Security/privacy: Billing compliance.

## Missing Items (with priority)
1. Payment integration (Critical)
2. Feature matrix (High)
3. Trial logic (Medium)

## Implementation Tasks
- Task 15.1: Integrate payment provider.
  - Owner: Backend + Legal
  - Estimate: 24h
- Task 15.2: Feature matrix UI and plan comparison.
  - Owner: Frontend + Design
  - Estimate: 12h
- Task 15.3: Trial and renewal logic.
  - Owner: Backend
  - Estimate: 10h

## Test Plan
- Events: plan_select, plan_purchase_success

## API (proposed)
- POST /api/billing/subscribe

## SEO
- H1: Абонаментни планове