# Section 08 - AI Insights / Top Categories

## Current State
- UI: Placeholder analytics.
- Data sources: Not defined.
- Backend endpoints: None.
- Dependencies: analytics pipeline.
- Security/privacy: Aggregated data only.

## Missing Items (with priority)
1. Data pipeline and cadence (Critical)
2. Methodology documentation (High)

## Implementation Tasks
- Task 08.1: Define analytics ETL and storage.
  - Owner: Data
  - Estimate: 20h
- Task 08.2: Build UI widgets for top categories.
  - Owner: Frontend
  - Estimate: 10h
- Task 08.3: Publish methodology doc.
  - Owner: Data + Legal
  - Estimate: 6h

## Test Plan
- Events: ai_insights_view

## API (proposed)
- GET /api/insights/top-categories
  - Response: [{category, score, window}]

## SEO
- Not critical.