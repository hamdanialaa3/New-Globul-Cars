# Copilot Instructions: Bulgarian Car Marketplace (Bulgarski Mobili)

## Project Overview

A premium Bulgarian automotive marketplace (rival to mobile.de and mobile.bg) built with React 18 + TypeScript + Firebase. Target: Bulgarian market with Cyrillic support, EUR currency, and local cities. Emphasizes **quality over quick fixes** - no spaghetti code allowed.

**Core Philosophy**: "The Project Constitution" (PROJECT_CONSTITUTION.md) defines immutable architectural rules. Any deviation from the Numeric ID System or URL patterns is considered a regression and must be rejected.

**Tech Stack Overview**:

- **Frontend**: React 18.3.1, TypeScript 5.6.3 (strict mode), Styled-Components 6.1.19
- **Build System**: CRACO 7.x (Create React App Config Override) - NOT Vite for production
- **Backend**: Firebase 12.3.0 (Auth, Firestore, Functions, Storage, FCM, Hosting)
- **Search**: Algolia + Firestore hybrid architecture
- **AI**: Google Gemini API, OpenAI (limited), DeepSeek (cost optimization)
- **Payment**: Stripe integration for subscriptions/commissions
- **Maps**: Google Maps API for location services
- **Messaging**: Firebase Realtime Database for instant messaging
- **State Management**: React Context API (no Redux) + Custom hooks
- **Testing**: Jest + React Testing Library
- **Node Version**: >=18.0.0 (Functions use Node.js 20)

**Environment Setup Requirements**:

1. Node.js 18+ and npm 8+
2. Firebase CLI: `npm install -g firebase-tools`
3. Environment files: `.env.local` (never commit!)
4. All 3 config files synchronized: `tsconfig.json`, `craco.config.js`, `jest.config.js`

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
npm run start:dev   # Extended memory (4096MB) + no browser auto-open

# Production build (console.log banned automatically)
npm run build       # Runs prebuild ban-console.js check
npm run build:analyze   # Build + bundle size analysis with source-map-explorer
npm run build:optimized # Build + image optimization

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
- **Memory cache only** (`cache: { type: 'memory', maxGenerations: 1 }`) for fastest rebuilds

### Quick Scripts

- `START_DEV_HOT_RELOAD.bat` - Windows dev server launcher (sets PORT=3000, HOST=localhost)
- `QUICK_REBUILD.bat` - Fast production build
- `RESTART_SERVER.bat` - Firebase emulator restart
- `scripts/clear-dev-caches.ps1` - Clear npm/browser caches
- `CLEAN_PORT_3000.bat` - Kill processes on port 3000 (when server won't start)
- `SYNC_ALGOLIA_NOW.bat` - Sync all car collections to Algolia index

**Available npm Scripts**:

```bash
npm run clean:3000        # Kill port 3000 processes
npm run clean:cache       # Clear npm cache + node_modules/.cache
npm run clean:all         # Deep clean (cache + ports)
npm run sync-algolia      # Sync Firestore → Algolia
npm run train-ai          # Update AI project knowledge
npm run train-ai:watch    # Auto-update AI knowledge on file changes
npm run migrate:legacy-cars  # Run car data migration scripts
npm run check-security    # Verify .env files are not committed
npm run test:profile-stats  # Run profile stats service tests
npm run build:vite        # Alternative Vite build (dev only)
```

### Utility Scripts (scripts/ directory)

**Data Management**:

- `sync-algolia.js` - Sync all car collections to Algolia search index
- `migrate-isActive.ts` - Migrate legacy car data (add isActive field)
- `check-firestore-data.js` - Verify Firestore data integrity
- `backup-manager.js` - Database backup and restore utilities

**Code Quality**:

- `ban-console.js` - Enforce no console.log in production code
- `scan-console-usage.js` - Find all console usage in codebase
- `check-translations.ts` - Verify translation key coverage
- `audit-env.js` - Check environment variable security

**Development**:

- `train-ai-on-project.js` - Generate AI knowledge base from codebase
- `test-project-knowledge.js` - Validate AI training data
- `optimize-images.js` - Convert images to WebP format
- `analyze-bundle-size.js` - Analyze production bundle size

**Debugging**:

- `debug-find-specific-cars.js` - Find specific cars in Firestore
- `verify-firebase-connection.js` - Test Firebase connectivity
- `check-provider-order.ts` - Verify React Context provider order

### Firebase Deployment

```bash
npm run deploy              # Full deployment
npm run deploy:hosting      # Frontend only
npm run deploy:functions    # Cloud functions only
firebase emulators:start    # Local testing
```

**Functions**: Located in `functions/src/`, currently exports notification triggers (see `functions/src/index.ts`)

**Critical Deployment Notes**:

- Run `npm run check-security` before every commit to prevent credential leaks
- Use `npm run prebuild` to verify no console.log statements exist
- Firebase Functions run on Node.js 20 (specified in `functions/package.json`)
- All functions support CORS and Firebase Authentication
- Hosting uses CDN caching - may need cache invalidation after deployment

## Data Patterns & Firestore

### Collection Architecture

**Vehicle Collections** (category-specific for optimized queries):

- `passenger_cars` - Sedans, Hatchbacks, Coupes, Wagons
- `suvs` - SUVs, Crossovers, Off-road vehicles
- `vans` - Vans, Minivans, Microbuses
- `motorcycles` - Motorcycles, Scooters, ATVs
- `trucks` - Pickup trucks, Commercial trucks
- `buses` - Buses, Coaches

**User & Profile Collections**:

- `users` - User accounts with `numericId` field (required)
- `dealerships` - Dealer/company profiles
- `followers` / `following` - Social follow relationships

**Interaction Collections**:

- `favorites` - User saved cars
- `messages` - Direct messages between users
- `conversations` - Message thread metadata
- `notifications` - User notifications with read/unread status

**Business Collections**:

- `campaigns` - Marketing campaigns (dealer/company)
- `consultations` - Expert consultations
- `reviews` - User/car reviews
- `analytics_events` - Custom analytics tracking
- `searchClicks` - Search behavior analytics

**System Collections**:

- `counters` - Atomic counters for numeric ID assignment
- `customers/{uid}/checkout_sessions` - Stripe checkout sessions

### Security Rules

- All writes require authentication (`isAuthenticated()`)
- Counters collection (numeric IDs) allows authenticated writes for atomic increments
- Stripe-specific collections (`customers/{uid}/checkout_sessions`) enforce UID matching
- Car collections enforce `isActive: true` for public queries
- Users can only edit their own profile/listings (checked via `sellerId` match)

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

## Code Quality Standards (January 2026)

### Console Logging Ban

**CRITICAL**: Production builds automatically fail if `console.log` or `console.error` detected in `src/`:

- **Enforcement**: `scripts/ban-console.js` runs during `npm run prebuild`
- **Only Exception**: `logger-service.ts` itself (maintains console for actual logging)
- **Solution**: Always use `logger` service:

  ```typescript
  import { logger } from '@/services/logger-service';

  // ✅ Correct
  logger.info('User logged in', { userId });
  logger.error('API call failed', error, { context });
  logger.warn('Deprecated feature used', { feature });

  // ❌ Wrong - Build will fail
  console.log('Debug message');
  console.error('Error:', error);
  ```

### Performance Best Practices

**React Hooks Optimization**:

- Use `useCallback` for event handlers passed to child components
- Use `useMemo` for expensive computations
- Example from `ConversationsList.tsx`:

  ```typescript
  const handleConversationClick = useCallback(
    (conversationId: string) => {
      // Handler logic
    },
    [dependencies]
  );

  const sortedConversations = useMemo(() => {
    return conversations.sort(/* sorting logic */);
  }, [conversations]);
  ```

### Security Validation

**Route Protection Pattern**:

- Always validate `numericId` matches authenticated user for protected routes
- Example from `FavoritesPage.tsx`:
  ```typescript
  useEffect(() => {
    if (user && urlNumericId !== user.numericId) {
      navigate(`/profile/${user.numericId}/favorites`);
    }
  }, [user, urlNumericId, navigate]);
  ```

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
- [docs/STRICT_NUMERIC_ID_SYSTEM.md](../docs/STRICT_NUMERIC_ID_SYSTEM.md) - Detailed numeric ID implementation
- [FIRESTORE_LISTENERS_FIX.md](../FIRESTORE_LISTENERS_FIX.md) - Known Firestore listener issues & solutions
- [DEPLOYMENT_SUCCESS_REPORT_DEC28_2025.md](../DEPLOYMENT_SUCCESS_REPORT_DEC28_2025.md) - Latest deployment status
- [PROJECT_COMPLETE_INVENTORY.md](../PROJECT_COMPLETE_INVENTORY.md) - Full codebase inventory
- [SEARCH_SYSTEM.md](../SEARCH_SYSTEM.md) - Search architecture details (Firestore + Algolia)
- [SECURITY.md](../SECURITY.md) - Security policies & incident response

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

## Recent Features & Systems (December 2025)

### Follow System

- **Service**: `follow-service.ts` - User follow/unfollow functionality
- **Components**: `FollowButton.tsx` with follower/following counters
- **Collections**: `followers`, `following` in Firestore
- Real-time updates via Firestore listeners

### Advanced Notifications

- **Component**: `NotificationBell.tsx` in Header with unread count badge
- **Service**: `real-time-notifications-service.ts` - Push notifications via FCM
- **Features**: Real-time unread tracking, notification preferences, multi-type notifications
- Sound integration: `public/sounds/notification.mp3` (with graceful error handling)

### Team Management (Company/Dealer)

- **Service**: `team-management-service.ts` - Role-based team member management
- **Page**: `TeamManagementPage.tsx` - Add/remove team members, role assignment
- **Roles**: Admin, Manager, Editor, Viewer (hierarchical permissions)
- Company plans only (unlimited teams)

### Admin Tools

- **AlgoliaSyncManager**: Real-time sync status dashboard (`/admin/algolia-sync`)
- **BackupManagement**: Database backup/restore utilities
- **LeadScoringDashboard**: AI-powered lead qualification
- **SharedInboxPage**: Team inbox for dealer/company accounts

### Development Tools

- **DevelopmentToolsPage**: `/development-tools` - Comprehensive dev utilities
- **IconShowcasePage**: Visual preview of all project icons
- **TestDropdownsPage**: UI component testing sandbox

### AI Integration Enhancements

- **DeepSeekService**: Alternative AI provider for cost optimization
- **vehicle-description-generator**: Multi-language description generation (bg/en)
- **market-value.service**: AI-powered pricing recommendations
- **smart-alerts-service**: Proactive notifications for price changes, market trends

---

**Version**: 1.8.0  
**Last Updated**: January 1, 2026  
**Status**: Production

**Key Updates (v1.8.0)** - January 1, 2026:

- **Code Quality**: All console.log/console.error removed - 100% compliant with logger-service
- **Dealer Dashboard**: Fully implemented alert dismissal and task completion handlers
- **Security Enhancement**: Added numericId validation in Favorites page to prevent unauthorized access
- **Performance Optimization**: Added useCallback/useMemo to ConversationsList component for reduced re-renders
- **Build Validation**: prebuild script (ban-console.js) ensures production builds are console-free

**Previous Updates (v1.7.0)** - December 31, 2025:

- Added Recent Features & Systems section documenting December 2025 features
- Documented Follow System, Team Management, and Advanced Notifications
- Added Admin Tools and Development Tools sections
- Updated AI Integration details (DeepSeek, smart alerts)
- Clarified Social features (posts, follow, notifications)

**Previous Updates (v1.6.0)**:

- Enhanced Quick Scripts section with comprehensive npm command reference
- Added CLEAN_PORT_3000.bat and SYNC_ALGOLIA_NOW.bat to workflow documentation
- Updated Critical Documentation References with security, deployment, and search docs
- Clarified webpack memory cache configuration for development builds
- Added npm run train-ai for AI project knowledge updates
