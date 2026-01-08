# Copilot Instructions: Bulgarian Car Marketplace

**Updated:** January 8, 2026 | **Stack:** React 18 + TS (strict) + Styled-Components | Firebase 12 | Algolia | Stripe

## 🚀 Quick Commands

```bash
npm start           # Dev server (port 3000)
npm run type-check  # REQUIRED before commits
npm run build       # Runs prebuild console ban
npm run deploy      # Hosting + Functions
npm run emulate     # Local Firebase testing
npm run clean:3000  # Kill stuck port
```

## 🏗️ Critical Architecture (Must Know)

### 1. Numeric ID System — URLs Never Expose Firebase UIDs

```typescript
// URL patterns (STRICT)
/profile/:numericId          // e.g., /profile/18
/car/:sellerNumericId/:carNumericId  // e.g., /car/1/5
/messages/:senderId/:recipientId     // e.g., /messages/18/42

// Implementation: Always use UnifiedCarService.createCarListing()
// Counter: counters/{uid}/cars in Firestore
```

### 2. Multi-Collection Cars — Never Hardcode Collection Names

```typescript
// 6 collections: passenger_cars, suvs, vans, motorcycles, trucks, buses
import { SellWorkflowCollections } from '@/services/sell-workflow-collections';
const collection =
  SellWorkflowCollections.getCollectionNameForVehicleType(vehicleType);
// ❌ NEVER: db.collection('passenger_cars')
```

### 3. Firestore Listeners — ALWAYS Use `isActive` Flag

```typescript
// Prevents "setState on unmounted component" errors
useEffect(() => {
  let isActive = true;
  const unsubscribe = onSnapshot(ref, snap => {
    if (!isActive) return; // CRITICAL
    setState(snap.data());
  });
  return () => {
    isActive = false;
    unsubscribe();
  };
}, []);
```

### 4. Logging — console.\* is BANNED in src/

```typescript
// ✅ Use logger service (console fails prebuild)
import { logger } from '@/services/logger-service';
logger.info('action', { userId, context });
logger.error('failed', error, { metadata });
// ❌ console.log() → scripts/ban-console.js blocks build
```

## 🔑 Core Services (Use These, Don't Duplicate)

| Service                    | Purpose                    | Usage                                   |
| -------------------------- | -------------------------- | --------------------------------------- |
| `UnifiedCarService`        | Car CRUD + numeric IDs     | `createCarListing(data, userProfile)`   |
| `SellWorkflowCollections`  | Collection name resolution | `getCollectionNameForVehicleType(type)` |
| `AdvancedMessagingService` | Real-time messaging        | `sendMessage()`, `sendOfferMessage()`   |
| `canAddListing()`          | Plan limit check           | `import from '@/utils/listing-limits'`  |
| `logger`                   | Structured logging         | Replace all console.\* calls            |

## 📋 Plan Limits (Enforce Before Creation)

```typescript
import { canAddListing } from '@/utils/listing-limits';
// free: 3 | dealer: 10 | company: unlimited
if (!(await canAddListing(userId))) {
  /* block creation */
}
```

## 🛠️ Developer Rules

### Path Aliases — Sync 3 Files

When adding aliases, update ALL THREE: `tsconfig.json`, `craco.config.js`, `jest.config.js`

### Context-First State (No Redux)

```typescript
import { useAuth, useLanguage, useProfileType, useTheme } from '@/contexts';
```

### Routing — Use safeLazy()

```typescript
import { safeLazy } from '@/utils/lazyImport';
const MyPage = safeLazy(() => import('@/pages/MyPage'));
// Routes live in src/routes/*.routes.tsx
```

### Bulgarian Market Constraints

- **Currency**: EUR only | **Phone**: +359 prefix
- **Cities**: `bulgaria-locations.service.ts` (never hardcode)
- **i18n**: `useLanguage()` hook + `src/locales/{bg,en}`
- **Validation**: EGN/EIK via `bulgarian-compliance-service.ts`

## 🐛 Debugging Quick Fixes

| Issue                   | Fix                                               |
| ----------------------- | ------------------------------------------------- |
| "setState on unmounted" | Add `isActive` flag to listener                   |
| Console errors in build | Remove console.\* or use logger                   |
| Jest tests failing      | Check `src/__mocks__/firebase/firebase-config.ts` |
| Path aliases broken     | Sync tsconfig + craco + jest configs              |
| Port 3000 stuck         | `npm run clean:3000`                              |
| Cache issues            | `npm run clean:all` then restart                  |

## 📚 Key Docs

- [PROJECT_CONSTITUTION.md](PROJECT_CONSTITUTION.md) — Architectural rules
- [MESSAGING_SYSTEM_FINAL.md](MESSAGING_SYSTEM_FINAL.md) — Messaging architecture
- [src/routes/README.md](src/routes/README.md) — Route structure
- [DOCUMENTATION_INDEX.md](DOCUMENTATION_INDEX.md) — All docs index
