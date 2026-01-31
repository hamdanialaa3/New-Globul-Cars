# Section 04 - Recently Viewed / History

## Current State
- UI components: Empty state copy.
- Data sources: None.
- Backend endpoints: None.
- Dependencies: session storage.
- Security/privacy: Requires privacy notice and consent.

## Missing Items (with priority)
1. Session persistence (High)
2. Cross-device sync (Medium)
3. Privacy notice (Medium)

## Implementation Tasks
- Task 04.1: Store recently viewed in localStorage.
  - Owner: Frontend
  - Estimate: 6h
  - Acceptance criteria: items persist across reloads.
- Task 04.2: Sync to user profile when logged in.
  - Owner: Backend + Frontend
  - Estimate: 12h
  - Acceptance criteria: history available on multiple devices.
- Task 04.3: Add privacy notice and opt-out.
  - Owner: Legal + Frontend
  - Estimate: 6h
  - Acceptance criteria: user can clear or disable history.

## Test Plan Snippets
- Events: recently_viewed_add, recently_viewed_clear.

## API and Data Contracts (proposed)
- PUT /api/user/history
  - body: {listingIds: string[]}
- GET /api/user/history

## SEO and Content Recommendations
- No SEO impact.