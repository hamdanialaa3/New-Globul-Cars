# Copilot Instructions: Bulgarian Car Marketplace

**Updated:** January 8, 2026 | **Stack:** React 18 + TS (strict) + Styled-Components | Firebase 12 | Algolia | Stripe  
**Project Size:** 776 React components | 727 TS files | 404 services | 286 pages | 80+ routes

## 🚀 Quick Start

```bash
npm start           # Dev server (port 3000)
npm run type-check  # REQUIRED before commits (catches TS errors early)
npm run build       # Runs prebuild console ban + TypeScript checks
npm run deploy      # Hosting + Cloud Functions
npm run emulate     # Local Firebase testing
npm run clean:3000  # Kill stuck port 3000
npm run clean:all   # Full cache + node_modules clean
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

| Service                        | Purpose                        | Usage                                          |
| ------------------------------ | ------------------------------ | ---------------------------------------------- |
| `UnifiedCarService`            | Car CRUD + numeric IDs         | `createCarListing(data, userProfile)`          |
| `numeric-id-system.service`    | Numeric ID resolution for URLs | `getUserNumericId()`, `getCarNumericId()`      |
| `SellWorkflowCollections`      | Multi-collection management    | `getCollectionNameForVehicleType(type)`        |
| `AdvancedMessagingService`     | Real-time messaging (Phase 2)  | `sendMessage()`, `sendOfferMessage()`          |
| `OfferWorkflowService`         | Car offer workflow             | `createOffer()`, `acceptOffer()`               |
| `logger`                       | Structured logging             | Replace all `console.*` (auto-banned in build) |
| `bulgaria-locations.service`   | Location/city data             | `getCities()` - never hardcode locations       |
| `bulgarian-compliance-service` | EGN/EIK validation             | `validateEGN()`, `validateEIK()`               |
| `firebase-cache.service`       | Firestore query optimization   | Reduces cross-partition queries                |
| `numeric-id-counter.service`   | Counter management             | `counters/{uid}/cars` in Firestore             |

## 📋 Essential Patterns (Copy-Paste Ready)

### Pattern 1: Firebase Listeners (CRITICAL - Prevents Memory Leaks)

```typescript
useEffect(() => {
  let isActive = true;
  const unsubscribe = onSnapshot(query, snap => {
    if (!isActive) return; // ✅ REQUIRED
    setState(snap.data());
  });
  return () => {
    isActive = false;
    unsubscribe();
  };
}, []);
```

### Pattern 2: Numeric URL Resolution

```typescript
// URLs: /profile/18, /car/1/5, /messages/18/42
import {
  getUserNumericId,
  getCarNumericId,
} from '@/services/numeric-id-system.service';

const userNumericId = params.numericId;
const userId = await getUserNumericId(userNumericId);
```

### Pattern 3: Multi-Collection Car Queries

```typescript
import { SellWorkflowCollections } from '@/services/sell-workflow-collections';

const collectionName =
  SellWorkflowCollections.getCollectionNameForVehicleType('passenger_cars');
// ❌ NEVER: db.collection('passenger_cars')
```

### Pattern 4: Plan Limit Enforcement

```typescript
import { canAddListing } from '@/utils/listing-limits';

if (!(await canAddListing(userId))) {
  throw new Error('Plan limit reached'); // free: 3, dealer: 10, company: ∞
}
```

### Pattern 5: Context-First State (No Redux)

```typescript
import { useAuth, useLanguage, useProfileType, useTheme } from '@/contexts';

// Available contexts: AuthContext, LanguageContext, ProfileTypeContext,
// ThemeContext, FilterContext, LoadingContext
const { user } = useAuth();
```

## 📬 Real-Time Messaging Architecture (Phase 2 Complete)

### Entry Points

- **Page**: `src/pages/03_user-messages/MessagesPage.tsx` (1,071 lines)
- **Service**: `src/services/advanced-messaging.service.ts` (350 lines)
- **Routes**: `/messages/:senderId/:recipientId` or `/messages?conversationId=abc`

### Key Features

- ✅ Unified Messaging System (solved 2-system duplication in Phase 1)
- ✅ Real-time listeners with `isActive` flag (prevents memory leaks)
- ✅ Offer workflow integration (`sendOfferMessage()`)
- ✅ Mark as read + conversation archiving per-user
- ✅ File upload validation (size, type, security checks)
- ✅ Search & filtering with SearchManager

### When Working on Messaging

1. **Always use `AdvancedMessagingService`** for all message operations
2. **Numeric ID resolution** happens in `MessagesPage` entry point
3. **Status updates** go through `MessageOperations` (read/delete/archive)
4. **Offers** integrated with `OfferWorkflowService`
5. **File uploads** validated before storage (no direct Firebase calls)

## 🚗 Car Listing & Multi-Collection System

### 6 Collections (Fixed - Never Add More)

```
passenger_cars   → Regular cars
suvs             → SUVs/Crossovers
vans             → Commercial vans
motorcycles      → Bikes/scooters
trucks           → Heavy vehicles
buses            → Transport vehicles
```

### Numeric ID System (Critical Data Model)

```typescript
// Instead of exposing Firebase UIDs in URLs:
// ❌ /car/abc123def456ghi789jkl
// ✅ /car/1/5  → user 1's 5th car

// Implementation:
counters/{userId}/cars → Counter document per user
numeric_ids collection → Maps numeric → Firebase UID
```

### Sell Workflow Route Structure

- `/sell/vehicle-type` → Vehicle type selection
- `/sell/basic` → Title, year, mileage
- `/sell/features` → Condition, equipment
- `/sell/description` → AI-assisted description editor
- `/sell/pricing` → Market value + manual price
- `/sell/images` → Multi-image upload (WebP only)
- `/sell/review` → Final review before publish

## 🛠️ Developer Rules

### Build Pipeline (Non-Negotiable Order)

1. `npm run type-check` → Catch TypeScript errors early
2. `npm run build` → Triggers:
   - `ban-console.js` → Removes all `console.*` except logger
   - TypeScript compilation
   - Webpack bundling
3. Deploy only after ALL tests pass

### Path Aliases — Sync 3 Files When Adding New Aliases

When adding `@/newAlias/*`, update:

- `tsconfig.json` (TypeScript)
- `craco.config.js` (Webpack)
- `jest.config.js` (Testing)

### Firestore Query Optimization (Required)

- Use `firebase-cache.service` to reduce cross-partition queries
- Add composite indexes for multi-field filters
- Reference [FIRESTORE_INDEXES_GUIDE.md](FIRESTORE_INDEXES_GUIDE.md)

### Routing — Use safeLazy() for Code Splitting

```typescript
import { safeLazy } from '@/utils/lazyImport';
const MyPage = safeLazy(() => import('@/pages/MyPage'));
// Routes in: src/routes/*.routes.tsx (auth.routes.tsx, admin.routes.tsx, etc.)
```

### Component Organization

- **Reusable**: `src/components/` (441 components)
- **Page-specific**: `src/pages/*/components/`
- **Always use**: `React.memo()` for expensive renders

### Contexts (6 Total - No Redux)

```typescript
AuthContext; // User auth state
LanguageContext; // i18n (bg/en)
ProfileTypeContext; // free/dealer/company
ThemeContext; // Dark/light mode
FilterContext; // Search filters
LoadingContext; // Global loading state
```

### Bulgarian Market Constraints (Hardcoded Checks)

- **Currency**: EUR only (validation in `bulgarian-config`)
- **Phone**: +359 prefix required (validation in forms)
- **Cities**: Use `bulgaria-locations.service.ts` (never hardcode)
- **i18n**: `useLanguage()` hook + `src/locales/{bg,en}` JSON files
- **EGN/EIK**: Validate with `bulgarian-compliance-service.ts`

### Logging — console.\* is BANNED in src/ During Build

```typescript
// ✅ CORRECT (logger-service exception)
import { logger } from '@/services/logger-service';
logger.info('action', { userId, context });
logger.error('failed', error, { metadata });

// ❌ WRONG (fails prebuild → scripts/ban-console.js blocks it)
console.log('something');
```

## 📊 Data Flow & External Integrations

### Search Architecture (Hybrid)

- **Firestore**: Single listings, filters on user profile
- **Algolia**: Full-text search, faceted browsing (instantsearch)
- **Frontend**: React Instantsearch + custom FilterContext

### AI Integration Points

- **Gemini API**: Auto-generate descriptions (`@google/generative-ai`)
- **OpenAI**: Future enhancement for chat/support
- **WhatsApp Business**: Message routing + notifications
- **Facebook/Instagram**: Auto-posting from car listings

### Firebase Backend Structure

- **Realtime DB** (europe-west1): Message delivery notifications
- **Firestore**: Main data (users, cars, messages, offers)
- **Cloud Storage**: Car images, documents (WebP-only)
- **Cloud Functions**: Background jobs (Node.js 20)
- **Authentication**: Email + OAuth (Google, Facebook)

## 🐛 Debugging Quick Fixes

| Issue                   | Fix                                                                                 |
| ----------------------- | ----------------------------------------------------------------------------------- |
| "setState on unmounted" | Add `isActive` flag to listener                                                     |
| Console errors in build | Remove console.\* or use logger                                                     |
| Jest tests failing      | Check `src/__mocks__/firebase/firebase-config.ts`                                   |
| Path aliases broken     | Sync tsconfig + craco + jest configs                                                |
| Port 3000 stuck         | `npm run clean:3000`                                                                |
| Cache issues            | `npm run clean:all` then restart                                                    |
| Firestore limits        | Check composite indexes in [FIRESTORE_INDEXES_GUIDE.md](FIRESTORE_INDEXES_GUIDE.md) |

## 📚 Key Documentation

- [PROJECT_CONSTITUTION.md](PROJECT_CONSTITUTION.md) — Architectural rules & project stats
- [MESSAGING_SYSTEM_FINAL.md](MESSAGING_SYSTEM_FINAL.md) — Unified messaging (Phase 1 & 2)
- [src/routes/README.md](src/routes/README.md) — Route definitions by feature
- [FIRESTORE_INDEXES_GUIDE.md](FIRESTORE_INDEXES_GUIDE.md) — Required composite indexes
- [DOCUMENTATION_INDEX.md](DOCUMENTATION_INDEX.md) — Complete docs index
