# @koli-one/shared

Canonical shared types, interfaces, and constants used by both **web/** and **mobile_new/**.

## Purpose

This package is the **SINGLE SOURCE OF TRUTH** for cross-platform contracts. When a type needs to exist in both web and mobile, it lives here.

## Usage

### From web/ (via TypeScript path alias)
```typescript
import type { CarListing, CarSummary } from '@koli-one/shared';
import { SOCIAL_LINKS, getCollectionName } from '@koli-one/shared';
```

### From mobile_new/ (via TypeScript path alias)
```typescript
import type { CarListing, Story } from '@koli-one/shared';
import { SOCIAL_LINKS } from '@koli-one/shared';
```

## Rules

1. **Only platform-agnostic code** — No React DOM, no React Native, no Node.js APIs
2. **Types and constants only** — No runtime dependencies except Firebase types
3. **Changes require both-platform testing** — Any modification affects web + mobile
4. **Web-specific extensions** go in `web/src/types/`
5. **Mobile-specific extensions** go in `mobile_new/src/types/`

## Contents

```
shared/
├── src/
│   ├── index.ts                         # Public API barrel
│   ├── types/
│   │   ├── car-listing.types.ts         # CarListing, Filters, SearchResult
│   │   ├── car-summary.types.ts         # CarSummary (card view)
│   │   ├── story.types.ts              # Story, StoryType
│   │   ├── ai-quota.types.ts           # AIQuota, AITier, AIUsageLog
│   │   ├── firestore-models.types.ts   # BaseDocument, UserBase
│   │   └── numeric-id.types.ts         # NumericId system types
│   └── constants/
│       ├── social-links.ts             # Official social media URLs
│       └── vehicle-collections.ts      # Firestore collection names
├── package.json
├── tsconfig.json
└── README.md
```

## Sync to Mobile

The mobile app vendors a copy of this package at `mobile_new/src/shared/`.
After editing any file here, run:

```bash
node scripts/sync-shared.js
```

This copies `shared/src/` → `mobile_new/src/shared/` and verifies integrity via SHA-256 hashing.

> **Never edit `mobile_new/src/shared/` directly** — changes will be overwritten on next sync.
