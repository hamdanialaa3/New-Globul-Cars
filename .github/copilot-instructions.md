# Copilot Instructions: Bulgarian Car Marketplace

**Updated:** January 10, 2026 | **Stack:** React 18 + TS (strict) + Styled-Components | Firebase 12 | Algolia | Stripe  
**Project Size:** 795 React components | 780+ TS files | 410+ services | 290 pages | 85+ routes | 195,000+ LOC

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

### Other Useful Commands
```bash
npm run test             # Run Jest tests
npm run test:ci          # CI test mode (no watch)
npm run build:analyze    # Analyze bundle size
npm run scrape           # Run car data scrapers
npm run migrate:dealer-limits  # Run dealer migration
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

### Service Architecture Patterns

**410+ Services organized by domain**:
- **User Management**: `advanced-user-management-*.ts` (data, operations, types)
- **Analytics**: `analytics-*.ts` (data, operations, service, types)
- **Autonomous Systems**: `autonomous-resale-*.ts` (analysis, data, engine, recommendations, strategy)
- **Admin**: `admin-service.ts`, `audit-logging-service.ts`
- **Search**: `algoliaSearchService.ts` + Algolia Instantsearch
- **Content**: `advanced-content-management-service.ts`

**Service Naming Pattern**: `[domain]-[category].ts` or `[domain].service.ts`  
**Complex Features**: Split into separate files (data, operations, types)
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
- `/sell/review` → Final re (target: es2017, strict mode)
   - CRACO Webpack bundling (cache: memory in dev)
3. Deploy only after ALL tests pass

### CRACO Configuration (Custom Webpack)
- **Dev Cache**: Memory-based (fastest, no disk I/O)
- **Production**: Minificati

**Available Path Aliases**:
```typescript
@/components/*  → src/components/*
@/services/*    → src/services/*
@/pages/*       → src/pages/*
@/hooks/*       → src/hooks/*
@/types/*       → src/types/*
@/contexts/*    → src/contexts/*
@/utils/*       → src/utils/*
@/features/*    → src/features/*
@/assets/*      → src/assets/*
@/firebase/*    → src/firebase/*
@/config/*      → src/config/*
@/constants/*   → src/constants/*
@/data/*        → src/data/*

// Monorepo packages (if present)
@globul-cars/core/*      → packages/core/src/*
@globul-cars/services/*  → packages/services/src/*
```

**ModuleScopePlugin**: Removed in CRACO to allow monorepo importson disabled for debugging
- **ModuleScopePlugin**: Removed to allow monorepo imports
- **Path Aliases**: Configured in `tsconfig.json`, `craco.config.js`, `jest.config.js`
- **Dev Server**: Port 3000 (localhost), hot reload enabled, aggressive cache invalidation

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
// Routes in: src/routes/*.routes.tsx (MainRoutes.tsx,

### Naming Conventions (STRICT)

**Components**: PascalCase (e.g., `CarCard.tsx`, `SearchWidget.tsx`)  
**Functions/Variables**: camelCase (e.g., `handleSearch`, `userData`)  
**Constants**: UPPER_SNAKE_CASE (e.g., `MAX_UPLOAD_SIZE`, `API
  - EGN: Bulgarian national ID validation
  - EIK: Bulgarian company ID validation

### Testing & Validation

**Test Structure**:
- **Unit Tests**: Jest + Testing Library
- **Mock Files**: `src/__mocks__/firebase/firebase-config.ts`
- **Test Commands**: 
  - `npm test` → Watch mode
  - `npm run test:ci` → CI mode (no watch, coverage)
  - `npm run test:profile-stats` → Profile system tests

**TypeScript Strict Mode**:
- Always run `npm run type-check` before commits
- `strict: true` in `tsconfig.json`
- Target: ES2017 for broad compatibility_ENDPOINT`)  
**Types/Interfaces**: PascalCase (e.g., `UserProfile`, `CarData`)  
**Contexts**: PascalCase + Context (e.g., `AuthContext`, `ThemeContext`)  
**Services**: kebab-case.service.ts (e.g., `car.service.ts`, `numeric-id-system.service.ts`) NumericCarRedirect
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

### Contexts (6 Total - No Redux)or `scripts/clean-ports.ps1` (Windows)                        |
| Cache issues            | `npm run clean:all` then restart                                                    |
| Firestore limits        | Check composite indexes in [FIRESTORE_INDEXES_GUIDE.md](FIRESTORE_INDEXES_GUIDE.md) |
| Hot reload not working  | Clear dev cache with `scripts/clear-dev-caches.ps1`                                 |
| Build failing           | Run `npm run type-check` first, then check `scripts/ban-console.js` output          |
| Firebase 401 errors     | Run `scripts/verify-firebase-connection.js`                                         |

### Windows-Specific Issues

**Port Cleanup (Windows)**:
```powershell
# PowerShell scripts available
.\scripts\clean-ports.ps1        # Clean all dev ports
.\scripts\clear-dev-caches.ps1   # Clear development caches
.\scripts\deploy-phase2.ps1      # Deployment helper
```

**Quick Restart (Windows)**:
```bash
# Batch files for quick actions
.\scripts\START_SERVER.bat       # Start dev server
.\scripts\RESTART_SERVER.bat     # Restart with cache clear
.\scripts\QUICK_REBUILD.bat      # Clean rebuild
```
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
DeepSeek**: Alternative AI provider (via `ai-router.service.ts`)
- **AI Router**: Multi-provider fallback system for resilience
- **WhatsApp Business**: Message routing + notifications
- **Facebook/Instagram**: Auto-posting from car listings

### Key AI Services
```typescript
// AI router with multi-provider support
import { aiRouter } from '@/services/ai-router.service';

// Autonomous resale analysis system
import { AutonomousResaleEngine } from '@/services/autonomous-resale-engine';

// AI-assisted content management
import { AdvancedContentManagementService } from '@/services/advanced-content-management-service';
```

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
  - **6 Fixed Collections**: `passenger_cars`, `suvs`, `vans`, `motorcycles`, `trucks`, `buses`
  - **Counter System**: `counters/{uid}/cars` for numeric IDs
  - **Numeric Mapping**: `numeric_ids` collection for URL resolution
- **Cloud Storage**: Car images, documents (WebP-only)
- **Cloud Functions**: Background jobs (Node.js 20)
  - **24 Functions**: Sitemap, merchant feed, notifications, etc.
  - **Deploy**: `npm run deploy:functions`
- **Authentication**: Email + OAuth (Google, Facebook)
- **Hosting**: SPA with rewrites for sitemap & merchant feed

### Emulator Setup
```bash
npm run emulate  # Start Firebase emulators
# Auth: localhost:9099
# Functions: localhost:5001
# Firestore: localhost:8080
# Hosting: localhost:5002
```

### Scripts Directory (100+ Automation Scripts)

**Key Scripts**:
- `ban-console.js` → Enforces logger-service usage (prebuild)
- `clean-all.js` / `clean-port-3000.js` → Port & cache cleanup
- `train-ai-on-project.js` → AI training on codebase
- `migrate-dealer-limits.ts` → Database migrations
- `sync-algolia.js` → Sync Firestore → Algolia
- `analyze-bundle-size.js` → Bundle analysis
- `verify-firebase-connection.js` → Connection diagnostics

**Script Categories**:
- **Migrations**: `migrate-*.js/ts` (dealer limits, legacy cars)
- **Diagnostics**: `diagnose-*.js/ts`, `check-*.js/ts`
- **Fixing**: `fix-*.js` (imports, styles, components)
- **Analysis**: `analyze-*.js`, `scan-*.js`
- **Deployment**: `deploy-*.sh/ps1`tantsearch)
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
