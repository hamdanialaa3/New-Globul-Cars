# Section 13 - Social Hub / Community

## Current State
- UI: Empty feed.
- Data sources: None.
- Backend endpoints: None.
- Dependencies: moderation and content policy.
- Security/privacy: User-generated content risks.

## Missing Items (with priority)
1. Posting flow (High)
2. Moderation rules (Critical)
3. Content policy (High)

## Implementation Tasks
- Task 13.1: Build post creation UI.
  - Owner: Frontend
  - Estimate: 12h
- Task 13.2: Moderation pipeline.
  - Owner: Backend + Legal
  - Estimate: 20h

## Test Plan
- Events: community_post_create, community_post_report

## API (proposed)
- POST /api/community/posts
- POST /api/community/report

## SEO
- Not priority