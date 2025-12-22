# Copilot Instructions: Bulgarian Car Marketplace (Bulgarski Mobili)

## Project Overview
A premium Bulgarian automotive marketplace (rival to mobile.de) built with React 18 + TypeScript + Firebase. Target: Bulgarian market with Cyrillic support, EUR currency, and local cities. Emphasizes **quality over quick fixes** - no spaghetti code allowed.

## Critical Architecture Patterns

### 1. Numeric ID System (Strict Enforcement)
All URLs use numeric IDs for SEO-friendly, clean paths. **DO NOT use UUIDs in URLs.**

- **User Profiles**: `/profile/{numericId}` (e.g., `/profile/18`)
- **Car Details**: `/car/{sellerNumericId}/{carNumericId}` (e.g., `/car/1/5`)
- **Messaging**: `/messages/{senderNumericId}/{recipientNumericId}`

**Implementation**:
- Firestore: `numericId` field on users/profiles, `carNumericId` on cars
- Services: `numeric-id-assignment.service.ts`, `numeric-car-system.service.ts`
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
Configured in `tsconfig.json` + `craco.config.js` + `jest.config.js`:
```typescript
import { useAuth } from '@/contexts/AuthProvider';
import { logger } from '@/services/logger-service';
import type { BulgarianUser } from '@/types/user/bulgarian-user.types';
```

**DO NOT**:
- Use relative imports for cross-directory files (e.g., `../../../services/...`)
- Create new type definitions for existing concepts (check canonical types first)

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
- `AuthProvider` - Firebase auth state
- `ProfileTypeContext` - User profile type & permissions
- `FilterContext` - Search filters (homepage, browse pages)
- `LanguageContext` - i18n (bg/en)
- `ThemeContext` - Dark/light mode

Import from barrel: `import { useAuth, useProfileType } from '@/contexts';`

### React Component Structure
```
src/components/     → Reusable UI components
src/pages/          → Full pages (01_main-pages, 02_authentication, etc.)
src/features/       → Complex features (car-listing with stores/schemas)
src/layouts/        → Layout wrappers (MainLayout, FullScreenLayout)
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
- **Loading States**: Use `LightweightLoadingOverlay` (CSS-only, no Three.js)
- **Bundle Analysis**: `npm run build:analyze` for size inspection

## Common Pitfalls

1. **Never bypass listing limits** - Always call `canAddListing()` before creating listings
2. **Never use UUIDs in URLs** - Always resolve to numeric IDs for public-facing routes
3. **Never create duplicate search logic** - Use `UnifiedSearchService` exclusively
4. **Never import from wrong type files** - Use `src/types/user/bulgarian-user.types.ts` as canonical source
5. **Never use console.log** - Use `logger-service` (prebuild script will fail builds with console.log)
6. **Never create new Context providers** without documenting in `src/contexts/index.ts`

## Project Constitution References
- [PROJECT_CONSTITUTION.md](../PROJECT_CONSTITUTION.md) - Core principles & development rules
- [PROJECT_MASTER_REFERENCE_MANUAL.md](../PROJECT_MASTER_REFERENCE_MANUAL.md) - Complete tech stack & architecture
- [CLEANUP_PLAN.md](../CLEANUP_PLAN.md) - Matryoshka structure cleanup (if working on refactoring)

## Key Bulgarian Localization
- **Currency**: Always EUR (€), never BGN
- **Language**: `bg` (Cyrillic) primary, `en` secondary
- **Phone**: Country code always `+359`
- **Location**: Use `bulgaria-locations.service.ts` for cities/regions
- **Compliance**: EGN verification for individuals, EIK for companies

---

**Version**: 1.0.0  
**Last Updated**: December 2025  
**Status**: Production
