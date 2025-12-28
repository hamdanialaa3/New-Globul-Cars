# Copilot Instructions: Bulgarian Car Marketplace (Bulgarski Mobili)

## Project Overview

A premium Bulgarian automotive marketplace (rival to mobile.de and mobile.bg) built with React 18 + TypeScript + Firebase. Target: Bulgarian market with Cyrillic support, EUR currency, and local cities. Emphasizes **quality over quick fixes** - no spaghetti code allowed.

**Core Philosophy**: "The Project Constitution" (PROJECT_CONSTITUTION.md) defines immutable architectural rules. Any deviation from the Numeric ID System or URL patterns is considered a regression and must be rejected.

## Critical Architecture Patterns

### 1. Numeric ID System (Strict Enforcement)

All URLs use numeric IDs for SEO-friendly, clean paths. **DO NOT use UUIDs in URLs.**

- **User Profiles**: `/profile/{numericId}` (e.g., `/profile/18`)
- **User Favorites**: `/profile/{numericId}/favorites` (e.g., `/profile/18/favorites`)
- **Car Details**: `/car/{sellerNumericId}/{carNumericId}` (e.g., `/car/1/5`)
- **Car Editing**: `/car/{sellerNumericId}/{carNumericId}/edit`
- **Messaging**: `/messages/{senderNumericId}/{recipientNumericId}`

**Implementation**:

- Firestore: `numericId` field on users/profiles, `carNumericId` on cars
- Services: `numeric-id-assignment.service.ts`, `numeric-car-system.service.ts`
- Routing: `NumericProfileRouter.tsx` handles nested profile routes (garage, favorites, stats)
- Resolution: `NumericCarDetailsPage.tsx` maps numeric IDs → Firestore UUIDs
- See: [docs/STRICT_NUMERIC_ID_SYSTEM.md](../docs/STRICT_NUMERIC_ID_SYSTEM.md)

### 2. User Profile Types & Plans

Three distinct user types (canonical types in `src/types/user/bulgarian-user.types.ts`):

- **Private User**: Max 3 listings (free), personal vehicle sales
- **Dealer**: Max 10 listings (paid), business profile + quick replies
- **Company**: Unlimited listings, team management, analytics, API access

Managed by `ProfileTypeContext` - always check listing limits before creating cars via `src/utils/listing-limits.ts`.

### 3. Multi-Collection Car Storage

Cars stored in category-specific collections for optimized queries:

- `passenger_cars`, `suvs`, `vans`, `motorcycles`, `trucks`, `buses`
- **Never hardcode** collection names - use `SellWorkflowCollections.getCollectionNameForVehicleType()`
- Unified access: `unifiedCarService` or `UnifiedSearchService`

### 4. Search Architecture

Hybrid search system combining Firestore + Algolia:

- **Primary**: `UnifiedSearchService.ts` (consolidates 5+ legacy search services)
- **Query Building**: `firestoreQueryBuilder.ts` + `queryOrchestrator.ts`
- **Multi-Collection**: `multi-collection-helper.ts` queries across vehicle types
- Always use `UnifiedSearchService.getInstance().searchCars()` - don't create new search implementations

## Critical Development Rules

### TypeScript Path Aliases

Configured in `tsconfig.json` + `craco.config.js` + `jest.config.js` (must stay synchronized):

```typescript
import { useAuth } from '@/contexts/AuthProvider';
import { logger } from '@/services/logger-service';
import type { BulgarianUser } from '@/types/user/bulgarian-user.types';
```

**Available Aliases**:

- `@/services/*` → `src/services/*`
- `@/components/*` → `src/components/*`
- `@/contexts/*` → `src/contexts/*`
- `@/utils/*` → `src/utils/*`
- `@/types/*` → `src/types/*`
- `@/hooks/*` → `src/hooks/*`
- `@/pages/*` → `src/pages/*`
- `@/firebase/*` → `src/firebase/*`
- `@/features/*` → `src/features/*`
- `@/assets/*` → `src/assets/*`

**DO NOT**:

- Use relative imports for cross-directory files (e.g., `../../../services/...`)
- Create new type definitions for existing concepts (check canonical types first)
- Add new aliases without updating ALL THREE config files

### Service Layer Pattern

All business logic in `src/services/`:

- **Singleton pattern**: `static getInstance()` for stateful services
- **Logging**: Use `logger-service.ts` (never `console.log`)
- **Error handling**: Use `error-handling-service.ts` for consistent error capture
- **Validation**: `validation-service.ts` for shared validators

Example:

```typescript
import { logger } from '@/services/logger-service';

class MyService {
  private static instance: MyService;

  static getInstance(): MyService {
    if (!this.instance) {
      this.instance = new MyService();
    }
    return this.instance;
  }

  async doWork() {
    try {
      logger.info('Starting work', { context });
      // ...
    } catch (error) {
      logger.error('Work failed', error as Error, { context });
      throw error;
    }
  }
}
```

### Context Providers

Centralized state management (no Redux):

- `AuthProvider` - Firebase auth state, login/logout flows
- `ProfileTypeContext` - User profile type & permissions (Private/Dealer/Company)
- `FilterContext` - Search filters (homepage, browse pages)
- `LanguageContext` - i18n (bg/en), translation utilities
- `ThemeContext` - Dark/light mode switching
- `LoadingContext` - Global loading states with messages (use `showLoading(message)`, `hideLoading()`)

**Import Pattern**:

```typescript
// ✅ Correct - Use barrel exports from src/contexts/index.ts
import { useAuth, useProfileType, useLanguage } from '@/contexts';

// ❌ Wrong - Direct imports when barrel export exists
import { useAuth } from '@/contexts/AuthProvider';
```

**Note**: Not all contexts exported from barrel - check `src/contexts/index.ts` for available exports. Current exports:

- `AuthContext`, `AuthProvider`, `useAuth`
- `LanguageProvider`, `useLanguage`
- `ProfileTypeContext`, `ProfileTypeProvider`, `useProfileType`
- Types: `ProfileType`, `ProfileTheme`, `ProfilePermissions`, `PlanTier`

### React Component Structure

```
src/components/     → Reusable UI components
src/pages/          → Full pages (01_main-pages, 02_authentication, etc.)
src/features/       → Complex features (car-listing, analytics, verification, billing, team, posts, reviews)
src/layouts/        → Layout wrappers (MainLayout, FullScreenLayout)
src/routes/         → Route definitions (MainRoutes.tsx, NumericProfileRouter.tsx)
```

**Naming**:

- Components: `PascalCase` (CarCard.tsx)
- Functions/variables: `camelCase` (handleSearch)
- Constants: `UPPER_SNAKE_CASE` (MAX_UPLOAD_SIZE)

## Build & Development Workflows

### Local Development

```powershell
# Start dev server with hot reload
npm start           # Uses craco, opens on http://localhost:3000

# Production build (console.log banned automatically)
npm run build       # Runs prebuild ban-console.js check

# Type checking (no emit)
npm run type-check

# Tests (Jest + React Testing Library)
npm test
npm run test:ci     # CI mode with coverage
```

**CRITICAL**:

- CRACO config disables ModuleScopePlugin for monorepo imports
- Webpack config provides Node polyfills (buffer, stream, crypto, etc.)
- Dev server sends no-cache headers to prevent stale assets
- Development cache completely disabled in webpack (no persistent caching issues)
- File watching enabled with 100ms interval (excluded node_modules)

### Quick Scripts

- `START_DEV_HOT_RELOAD.bat` - Windows dev server launcher
- `QUICK_REBUILD.bat` - Fast production build
- `RESTART_SERVER.bat` - Firebase emulator restart
- `scripts/clear-dev-caches.ps1` - Clear npm/browser caches

### Firebase Deployment

```bash
npm run deploy              # Full deployment
npm run deploy:hosting      # Frontend only
npm run deploy:functions    # Cloud functions only
firebase emulators:start    # Local testing
```

**Functions**: Located in `functions/src/`, currently exports notification triggers (see `functions/src/index.ts`)

## Data Patterns & Firestore

### Security Rules

- All writes require authentication (`isAuthenticated()`)
- Counters collection (numeric IDs) allows authenticated writes for atomic increments
- Stripe-specific collections (`customers/{uid}/checkout_sessions`) enforce UID matching

### Critical Services

- **Sell Workflow**: `sell-workflow-service.ts` (orchestrates listing creation)

  - Always checks listing limits BEFORE creating listings
  - Handles image uploads via `SellWorkflowImages`
  - Validates via `SellWorkflowValidation`
  - Returns numeric URLs: `/car/{sellerNumericId}/{carNumericId}`

- **Numeric ID Assignment**: `numeric-id-assignment.service.ts`

  - Atomic counter increments in `counters` collection
  - Validates positive integers only

- **User Management**: `bulgarian-profile-service.ts`
  - Manages profile types and plan enforcement
  - Handles EIK verification for companies

## Testing & Validation

### Jest Configuration

- Test environment: `jsdom`
- Path aliases mirror `tsconfig.json`
- Firebase mocked via `src/__mocks__/firebase/firebase-config.ts`
- d3 library mocked to prevent ES module issues

**Test File Patterns**:

```
src/**/__tests__/**/*.test.{ts,tsx}
src/**/*.test.{ts,tsx}
src/**/*.spec.{ts,tsx}
```

### Performance Optimization

- **Images**: Always use WebP format (scripts in `scripts/optimize-images.js`)
- **Lazy Loading**: Use `safeLazy()` from `utils/lazyImport` for route-level code splitting
  - **Implementation**: `safeLazy()` handles edge cases in dynamic imports with fallback to prevent crashes
  - Always wrap route imports: `const HomePage = safeLazy(() => import('../pages/HomePage'));`
- **Loading States**: Use `LightweightLoadingOverlay` (CSS-only, no Three.js) or `LoadingContext` for global states
- **Bundle Analysis**: `npm run build:analyze` for size inspection

## Common Pitfalls

1. **Never bypass listing limits** - Always call `canAddListing()` before creating listings
2. **Never use UUIDs in URLs** - Always resolve to numeric IDs for public-facing routes
3. **Never create duplicate search logic** - Use `UnifiedSearchService` exclusively
4. **Never import from wrong type files** - Use `src/types/user/bulgarian-user.types.ts` as canonical source
5. **Never use console.log** - Use `logger-service` (prebuild script will fail builds with console.log)
6. **Never create new Context providers** without documenting in `src/contexts/index.ts`
7. **Never hardcode collection names** - Use `SellWorkflowCollections.getCollectionNameForVehicleType()`
8. **Never skip numeric ID assignment** - Car creation MUST go through `UnifiedCarService.createCarListing()` which enforces numeric IDs
9. **Never use direct lazy imports** - Always use `safeLazy()` from `utils/lazyImport` to prevent import crashes
10. **Never add routes to AppRoutes.tsx** - Use modular route files in `src/routes/` (MainRoutes.tsx, NumericProfileRouter.tsx)

## Image & Asset Optimization

- **WebP Conversion**: Run `node scripts/optimize-images.js` before committing new images
- **Image Upload**: Use `SellWorkflowImages.uploadMultipleImages()` for multi-file uploads
- **Client Compression**: `browser-image-compression` library already integrated for client-side optimization
- **Storage Path**: `workflow-images/{userId}/{filename}` pattern in Firebase Storage
- **Bundle Size**: Use `npm run build:analyze` to inspect bundle sizes with source-map-explorer

## Debugging & Troubleshooting

### Common Issues

**Build fails with "console.log found"**:

- `scripts/ban-console.js` scans `src/` before production builds
- Replace all `console.log` with `logger.info()` from `@/services/logger-service`
- Excluded file: `logger-service.ts` itself (only file allowed to use console)

**Path alias not resolving**:

- Check all 3 configs are synchronized: `tsconfig.json`, `craco.config.js`, `jest.config.js`
- Restart dev server after changing path aliases
- Clear module cache: `npm run clean:cache`

**Stale assets in browser**:

- CRACO devServer config sends no-cache headers
- Run `scripts/clear-dev-caches.ps1` to clear npm/browser caches
- Hard refresh: Ctrl+Shift+R
- Check webpack memory cache: `cache: { type: 'memory', maxGenerations: 1 }`

**Numeric ID routing broken**:

- Verify `NumericCarDetailsPage.tsx` and `NumericProfileRouter.tsx` are in route config
- Check Firestore: users must have `numericId`, cars must have `sellerNumericId` + `carNumericId`
- Migration script: `npx ts-node scripts/migrate-isActive.ts`

**Firestore INTERNAL ASSERTION FAILED (ID: ca9)**:

- Symptom: Persistent Firestore errors in console with Firebase SDK 12.6.0
- Cause: Multiple active listeners or improper cleanup on unmount
- Solution: Use memory cache (`memoryLocalCache()`), ensure cleanup in `useEffect` returns
- Check: Review `FIRESTORE_LISTENERS_FIX.md` for known listener patterns

**Empty Firestore Database / 0 documents synced**:

- Verify Firebase project selection in Firebase Console
- Check collections exist: `passenger_cars`, `suvs`, `vans`, `motorcycles`, `trucks`, `buses`
- Verify `.env.local` has correct Firebase credentials (service account key)
- Add test data manually or use seed scripts in `scripts/`

### Firebase Local Development

```bash
firebase emulators:start    # Starts Firestore/Auth/Functions emulators
# Emulator UI: http://localhost:4000
# Firestore: localhost:8080
# Auth: localhost:9099
```

**Emulator Data Persistence**: Not configured by default - data cleared on restart

### Port Cleaning (Windows)

Development server stuck on port 3000:

```powershell
# Automated cleanup
.\CLEAN_PORT_3000.bat              # Kills processes on port 3000
npm run clean:3000                 # Alternative via npm script

# Manual cleanup
netstat -ano | findstr :3000      # Find PID
taskkill /PID <pid> /F            # Kill process
```

## Bulgarian Market Specifics

- **Currency**: Always EUR (€), never BGN (to match European standards)
- **Language**: `bg` (Cyrillic) primary, `en` secondary via `LanguageContext`
- **Phone**: Country code always `+359` (Bulgaria)
- **Location**: Use `bulgaria-locations.service.ts` for cities/regions (never hardcode)
- **Compliance**:
  - EGN verification for private users (via `bulgarian-compliance-service.ts`)
  - EIK verification for companies (via `eik-verification-service.ts`)

## Critical Documentation References

- [PROJECT_CONSTITUTION.md](../PROJECT_CONSTITUTION.md) - Core principles & development rules (Arabic/English)
- [PROJECT_MASTER_REFERENCE_MANUAL.md](../PROJECT_MASTER_REFERENCE_MANUAL.md) - Complete tech stack & architecture
- [docs/STRICT_NUMERIC_ID_SYSTEM.md](../docs/STRICT_NUMERIC_ID_SYSTEM.md) - Detailed numeric ID implementation
- [CLEANUP_PLAN.md](../CLEANUP_PLAN.md) - Matryoshka structure cleanup (if working on refactoring)

## Translation & Localization

All user-facing text must support Bulgarian (bg) and English (en) via `LanguageContext`:

- **Translation Files**: Located in `src/locales/{bg,en}/` organized by feature
- **Critical Namespaces**: `common`, `auth`, `advancedSearch`, `carDetails`, `profile`
- **Access Pattern**: `const { t } = useLanguage(); <p>{t('common.welcome')}</p>`
- **Missing Keys**: Always check console warnings - missing keys cause runtime errors
- **Adding Keys**: Update BOTH `bg` and `en` files simultaneously to prevent gaps

**Recent Fix (Dec 28, 2025)**: 40+ missing keys found in Advanced Search - always verify translation coverage before deploying features.

## Algolia Search Integration

Hybrid search architecture combining Firestore (backend) + Algolia (fast frontend):

- **Sync Script**: `scripts/sync-algolia.js` syncs all car collections to Algolia index
- **Index Config**: `algolia-index-config.json` defines searchable/filterable attributes
- **Record Template**: `algolia-record-template.json` shows expected document structure
- **Common Pitfall**: Pass array values to Algolia config (e.g., `searchableAttributes: ['make', 'model']` not string)
- **Environment Variables**: `REACT_APP_ALGOLIA_APP_ID`, `REACT_APP_ALGOLIA_API_KEY`, `REACT_APP_ALGOLIA_INDEX_NAME`

**Sync Command**: `npm run sync-algolia` (Windows: `SYNC_ALGOLIA_NOW.bat`)

## Firestore Composite Indexes

Complex queries require composite indexes defined in `firestore.indexes.json`:

- **Deploy**: `firebase deploy --only firestore:indexes`
- **Common Indexes**:
  - `notifications` collection: `userId` (ASC) + `createdAt` (DESC)
  - Multi-collection car queries: `isActive` (ASC) + `createdAt` (DESC)
- **Error Pattern**: "The query requires an index" → Add to `firestore.indexes.json` + deploy
- **Index Status**: Check Firebase Console → Firestore → Indexes tab

---

**Version**: 1.5.0  
**Last Updated**: December 28, 2025  
**Status**: Production

**Key Updates (v1.5.0)**:

- Added Translation & Localization section with best practices
- Documented Algolia search integration patterns and sync workflow
- Added Firestore composite index management guidance
- Clarified recent bug fixes (translation keys, Algolia config, index requirements)
- Enhanced troubleshooting with Dec 28 lessons learned

**Previous Updates (v1.4.0)**:

- Added User Favorites route to Numeric ID System
- Expanded React component structure to include all feature directories
- Added routing best practices (modular route files vs. monolithic AppRoutes.tsx)
- Documented safeLazy() import pattern requirement
- Enhanced common pitfalls with route organization guidance
