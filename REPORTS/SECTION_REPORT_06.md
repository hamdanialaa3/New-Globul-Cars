# Section 06 - Latest Listings / Regional Feed

## Current State
- UI components: Regional feed blocks.
- Data sources: Listings, region detection.
- Backend endpoints: Not confirmed.
- Dependencies: geo targeting.
- Security/privacy: Requires geolocation consent.

## Missing Items (with priority)
1. Geo targeting accuracy (High)
2. Freshness rules (Medium)

## Implementation Tasks
- Task 06.1: Use IP or user-selected city.
  - Owner: Frontend + Backend
  - Estimate: 12h
  - Acceptance criteria: region detected or selectable.
- Task 06.2: Freshness sorting and cache.
  - Owner: Backend
  - Estimate: 8h
  - Acceptance criteria: newest listings appear first.

## Test Plan
- Events: regional_feed_view
- Manual: change city and verify feed.

## API (proposed)
- GET /api/listings?region=city&sort=recent

## SEO
- H1: Най-новите обяви в [City]