````instructions
# Koli One – Copilot Instructions

**Stack:** React 18 + TS 5.6 (strict) + Styled-Components; Firebase 12 (Firestore, Functions Node 20, Auth, Storage); Algolia search  
**Market:** Bulgaria (bg/en, EUR)  
**Domain:** https://koli.one  
**Policy:** No file deletions—move unwanted files to `DDD/`

---

## Fast start

- Run `semantic_search` before adding code; 410+ services already cover most needs
- Read architecture rules for non‑negotiables: numeric IDs, multi-collection cars, no emojis, max 300 lines/file
- Use path aliases (`@/…`); do not introduce deep relative paths
- Check `CONSTITUTION.md` for Arabic/Bulgarian architectural standards
- **New developers:** Start with `docs/getting-started/00_START_HERE.md`, then `FIXY.md` for troubleshooting

---

## Core commands (Windows-optimized)

**Development:**
- `npm start` - CRACO webpack dev server (port 3000, opens browser)
- `npm run start:dev` - Optimized dev server (no browser, 4GB memory, recommended)
- `START_DEV.bat` - Windows helper script (auto port cleanup)
- `npm run emulate` - Firebase emulators (Auth:9099, Firestore:8080, Functions:5001)

**Quality gates:**
- `npm run type-check` - TypeScript strict mode check (REQUIRED before commits)
- `npm run build` - Production build (prebuild runs `ban-console.js`)
- `npm test` - Jest test suite
- `npm run test:ci` - CI mode with coverage

**Deployment:**
- `npm run deploy` - Deploy hosting + functions
- `npm run deploy:hosting` - Hosting only
- `npm run deploy:functions` - Functions only

**Utilities:**
- `npm run sync-algolia` - Sync search indexes
- `npm run clean:3000` - Kill port 3000 processes
- `npm run clean:all` - Full cache + node_modules cleanup

---

## Hard rules (CONSTITUTION)

**Numeric ID System (CRITICAL):**
- **NEVER expose Firebase UIDs in public URLs** - privacy-first design
- User profiles: Sequential IDs (1, 2, 3...) stored in `users/{uid}/numericId`
- Car listings: Hierarchical IDs `{sellerNumericId}/{carLocalId}`
- **URL patterns (STRICT):**
  - Own profile: `/profile/:numericId` (requires auth check)
  - View other: `/profile/view/:numericId` (public)
  - Car detail: `/car/:sellerNumericId/:carNumericId`
  - Car edit: `/car/:sellerNumericId/:carNumericId/edit`
  - Messages: `/messages/:senderId/:recipientId`
- **Validation:** See `utils/constitution-audit.ts` for compliance checks

**Multi-Collection Car Storage:**
- Six fixed Firestore collections based on `vehicleType`:
  - `passenger_cars` (car)
  - `suvs` (suv)
  - `vans` (van)
  - `motorcycles` (motorcycle)
  - `trucks` (truck)
  - `buses` (bus)
- **ALWAYS use:** `SellWorkflowCollections.getCollectionNameForVehicleType(vehicleType)`
- Never hardcode collection names; defaults to `'cars'` for backward compatibility
- See `services/sell-workflow-collections.ts` for implementation

**Logging (ENFORCED):**
- `scripts/ban-console.js` runs on `npm run build` and blocks ANY `console.*` in `src/`
- **MUST use:** `logger-service.ts` (`logger.info()`, `logger.error()`, `logger.warn()`)
- Exempt files: `logger-service.ts` itself, test files, mock files
- Production NODE_ENV triggers strict enforcement

**Firestore Listeners:**
- ALWAYS use `isActive` guard to prevent state updates after unmount:
```typescript
useEffect(() => {
  let isActive = true;
  const unsubscribe = onSnapshot(docRef, snap => {
    if (!isActive) return; // Guard against memory leaks
    setState(snap.data());
  });
  return () => {
    isActive = false;
    unsubscribe();
  };
}, []);
```

**File Management:**
- Never delete files; move to `DDD/` (deleted files graveyard)
- Max 300 lines per file; split with proper exports/imports if larger
- No text emojis in code (📍⚡🚗 forbidden) - design/UI only

---

## Architecture map

**Services-First Architecture (410+ files):**
Located in `src/services/` organized by domain:
- `auth/` - Authentication (Azure, Bulgarian auth, verification)
- `car/` - Core car logic (UnifiedCarService, queries, mutations)
- `messaging/` - Chat system (Realtime DB v2, advanced-messaging.service)
- `billing/` - Payments (manual bank transfers, deprecated Stripe)
- `search/` - Hybrid Firestore + Algolia (smart-search, UnifiedSearchService)
- `verification/` - Phone/ID verification
- `workflow/` - Sell workflow, analytics, persistence

**Critical Services:**
- `UnifiedCarService` - Main car CRUD operations (queries, mutations, cache)
- `SellWorkflowCollections` - Collection routing by vehicle type
- `advanced-messaging.service` - Realtime DB messaging (v2)
- `OfferWorkflowService` - Offer negotiation flows
- `bulgaria-locations.service` - Cities/regions data
- `bulgarian-compliance-service` - EGN/EIK validation
- `logger-service` - Centralized logging (REQUIRED for all logging)

**Messaging Architecture:**
- **Legacy:** `/messages/:sender/:recipient` (Firestore, deprecated)
- **Production:** `/messages-v2?channel=...` (Firebase Realtime DB)
- Hook: `useRealtimeMessaging` from `src/hooks/messaging/`
- Paths: `/channels`, `/presence`, `/typing`
- Channel ID format: `msg_{min(uid1,uid2)}_{max(uid1,uid2)}_car_{carId}`
- Migration ongoing; use Realtime DB for new features

**Payment System:**
- **Stripe deprecated** - manual bank transfers only (iCard/Revolut)
- Config: `src/config/bank-details.ts`
- Reference: `generatePaymentReference(userId, amount, purpose)`
- Workflow: User submits transfer → Admin verifies → Manual approval

**Search System:**
- Hybrid Firestore (base queries) + Algolia (full-text search)
- Algolia config: `algolia-index-config.json`, `algolia-record-template.json`
- Sync: `npm run sync-algolia` or `functions/src/syncCarsToAlgolia.ts`
- Services: `smart-search.service.ts`, `UnifiedSearchService`

**Routing Structure:**
- Routes extracted to `src/routes/*.routes.tsx` (MainRoutes, etc.)
- Guards: `AuthGuard` enforces auth + numeric ID validation
- Pages: `src/pages/` (286 total) organized by category:
  - `01_main-pages/` - HomePage, SearchPage, MapPage
  - `02_authentication/` - Login, Register, OAuth
  - `03_user-pages/` - Profile, Settings, MyListings
  - `04_marketplace/` - Checkout, Offers
  - `06_admin/` - Super admin dashboard

---

## Coding patterns

**Path Aliases (REQUIRED):**
Configured in `tsconfig.json`, `craco.config.js`, `jest.config.js`:
```typescript
import { UnifiedCarService } from '@/services/car/unified-car-service';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/Button';
import type { CarListing } from '@/types/CarListing';
```
- Never use deep relative imports (`../../../` forbidden)
- Single-level `../` acceptable within same module

**State Management (Context-First):**
No Redux; use React Context + hooks:
- `useAuth()` - AuthProvider (user, login, logout, numeric ID)
- `useLanguage()` - LanguageContext (bg/en, i18n keys)
- `useProfileType()` - ProfileTypeContext (private, dealer, company)
- `useTheme()` - ThemeContext (light/dark mode)
- `FilterContext` - Search filters persistence
- `LoadingContext` - Global loading states

**CarListing Type (Multi-ID System):**
From `src/types/CarListing.ts`:
```typescript
interface CarListing {
  id?: string;                    // Firebase doc ID
  numericId?: number;             // Car's numeric ID (alias: carNumericId)
  carNumericId?: number;          // Standard field name
  sellerNumericId?: number;       // Seller's numeric ID
  ownerNumericId?: number;        // Alias for sellerNumericId
  userCarSequenceId?: number;     // Alias for carNumericId
  vehicleType: string;            // 'car', 'suv', 'van', 'motorcycle', 'truck', 'bus'
  make: string;
  model: string;
  makeOther?: string;             // Custom brand when make='__other__'
  modelOther?: string;            // Custom model when model='__other__'
  // ... 100+ fields
}
```

**Collection Resolution:**
```typescript
import { SellWorkflowCollections } from '@/services/sell-workflow-collections';

const collectionName = SellWorkflowCollections.getCollectionNameForVehicleType(vehicleType);
// 'car' → 'passenger_cars'
// 'suv' → 'suvs'
// 'motorcycle' → 'motorcycles'
// unknown → 'cars' (fallback)
```

**Validation Helpers:**
- Listing limits: `services/listing-limits.service`
- EGN/EIK: `bulgarian-compliance-service.validateEGN()`, `.validateEIK()`
- Cities/regions: `bulgaria-locations.service.getCities()`, `.getRegions()`
- Phone: +359 format, `services/verification/phone-verification-service`

**Image Handling:**
- **WebP only** - convert all uploads
- Services: `image-upload-service.ts`, `imageOptimizationService.ts`
- Storage: Firebase Storage, organized by `image-storage-*.ts` services
- Compression: `browser-image-compression` lib

---

## Testing

**Framework:** Jest 27 + Testing Library + TypeScript
- **Location:** Co-locate in `__tests__/` folders
- **Mocks:** `src/__mocks__/firebase/firebase-config.ts` (centralized Firebase mocks)
- **Provider wrappers:** ALWAYS wrap renders with `ThemeProvider` + `LanguageProvider`
- **Mock order:** Place `jest.mock(...)` BEFORE imports (hoisting issues)
- **Path aliases:** `moduleNameMapper` in `jest.config.js` MUST match `tsconfig.json`

**Commands:**
- `npm test` - Watch mode (interactive)
- `npm run test:ci` - CI mode (--watchAll=false, coverage)
- `npm run test:profile-stats` - Profile-specific tests
- `npm run test:check` - Validate test structure
- `npm run test:fix` - Auto-fix Jest mock issues

**Example Test:**
```typescript
import { render, screen } from '@testing-library/react';
import { ThemeProvider } from 'styled-components';
import { LanguageProvider } from '@/contexts/LanguageContext';
import MyComponent from '../MyComponent';

jest.mock('@/services/logger-service'); // Before imports!

const renderWithProviders = (ui: React.ReactElement) => (
  render(
    <ThemeProvider theme={{ mode: 'light' }}>
      <LanguageProvider>
        {ui}
      </LanguageProvider>
    </ThemeProvider>
  )
);

test('renders correctly', () => {
  renderWithProviders(<MyComponent />);
  expect(screen.getByText(/hello/i)).toBeInTheDocument();
});
```

---

## Project structure

```
web/
├── src/
│   ├── components/        # 441 reusable UI (Button, Card, Modal, etc.)
│   ├── pages/            # 286 route pages (01_main-pages, 03_user-pages, 06_admin)
│   ├── services/         # 404 business logic (auth, car, messaging, billing)
│   ├── contexts/         # React contexts (Auth, Language, Theme, ProfileType, Filter, Loading)
│   ├── hooks/            # Custom hooks (useAuth, useRealtimeMessaging, useSellWorkflow)
│   ├── routes/           # Route definitions (MainRoutes.tsx, etc.)
│   ├── firebase/         # Firebase config & initialization
│   ├── locales/          # i18n translations (bg/en JSON files)
│   ├── config/           # App config (bank-details, azure-config, etc.)
│   ├── types/            # TypeScript interfaces (CarListing, user, etc.)
│   ├── utils/            # Helper functions (seo, validation, constitution-audit)
│   └── __mocks__/        # Test mocks (firebase, services)
├── functions/            # Firebase Cloud Functions (Node 20, TypeScript)
│   ├── src/
│   │   ├── auth/        # Auth triggers (onCreate, onDelete)
│   │   ├── messaging/   # Message notifications
│   │   ├── analytics/   # Analytics tracking
│   │   ├── ai/          # AI features (Gemini integration)
│   │   └── scheduled/   # Cron jobs
│   └── package.json
├── scripts/             # Build/dev scripts (ban-console.js, clean-*.js, scrapers)
├── public/              # Static assets (sounds, images)
├── docs/                # Documentation (architecture, testing, getting-started)
├── DDD/                 # Deleted files graveyard (DO NOT delete files)
├── .github/             # GitHub Actions CI/CD workflows
└── firebase.json        # Firebase config (hosting, functions, emulators)
```

---

## Development workflows

**Starting Development:**
1. Recommended: `START_DEV.bat` (Windows) or `npm run start:dev`
2. Alternative: `npm start` (slower, opens browser)
3. First run: 35-65s (Webpack + TypeScript + ESLint)
4. Hot reload: 2-5s (Fast Refresh)
5. Troubleshoot: `docs/getting-started/FIXY.md`

**Pre-Commit Checklist:**
1. `npm run type-check` (strict TypeScript validation)
2. Fix any type errors (zero tolerance policy)
3. Ensure no `console.*` in `src/` (use `logger.*`)
4. Run affected tests (`npm test -- <file-pattern>`)
5. Check numeric ID patterns in URLs

**Debugging:**
- **Port conflicts:** `npm run clean:3000` or `scripts/CLEAN_PORT_3000.bat`
- **Memory issues:** `npm run clean:cache`, then `npm ci`
- **Slow builds:** Check `craco.config.js` cache settings (memory cache in dev)
- **Firebase emulator:** Access UI at `http://localhost:4000`
- **Logs:** `logger-service` outputs to console in dev, Sentry in prod

**Building for Production:**
1. `npm run build` (triggers `prebuild` → `ban-console.js`)
2. Build output: `build/` directory
3. Static files cached: 1 year (immutable)
4. CSP headers: Defined in `firebase.json`
5. Deploy: `npm run deploy` (hosting + functions)

---

## Firebase specifics

**Project:** `fire-new-globul`
**Console:** https://console.firebase.google.com/project/fire-new-globul
**Emulators:**
- Auth UI: http://localhost:4000/auth
- Firestore UI: http://localhost:4000/firestore
- Functions logs: Terminal output

**Firestore Collections:**
- `users/` - User profiles (contains `numericId`)
- `passenger_cars/`, `suvs/`, `vans/`, `motorcycles/`, `trucks/`, `buses/` - Vehicles
- `workflow_drafts/` - Draft listings (auto-save)
- `workflow_progress/` - Step tracking
- `workflow_images/` - Temp image uploads
- `messages/` - Legacy chat (deprecated)
- `subscription_plans/`, `user_subscriptions/` - Subscription system

**Realtime Database (New):**
- `/channels/{channelId}/` - Messages
- `/presence/{userId}/` - Online status
- `/typing/{channelId}/{userId}/` - Typing indicators

**Functions (Node 20):**
- `syncCarsToAlgolia` - HTTP trigger for search sync
- `onUserCreate` - Auth trigger (assign numeric ID)
- `onCarCreate` - Firestore trigger (Algolia indexing)
- `sendMessageNotification` - Messaging trigger
- See `functions/src/index.ts` for full list

---

## Bulgarian market specifics

**Localization:**
- Languages: Bulgarian (bg) primary, English (en) secondary
- Currency: EUR (€) only
- Phone: +359 format validation
- i18n files: `src/locales/bg.json`, `src/locales/en.json`

**Legal Compliance:**
- EGN validation (Bulgarian national ID): `bulgarian-compliance-service.validateEGN()`
- EIK validation (company ID): `bulgarian-compliance-service.validateEIK()`
- Cities/regions: `bulgaria-locations.service` (predefined list)

**Domain:**
- Production: https://koli.one
- Staging: https://fire-new-globul.web.app
- Firebase Hosting: https://fire-new-globul.firebaseapp.com

---

## Operational notes

- **TypeScript:** `strict` mode, target ES2017, no `any` types
- **Node:** v20.x LTS for Functions, v20+ for local dev
- **Bundler:** CRACO (webpack 5) - do NOT migrate to Vite without team approval
- **CI/CD:** GitHub Actions on `main` push (`.github/workflows/firebase-deploy.yml`)
- **Monitoring:** Sentry for errors, Google Analytics 4 for events
- **SEO:** Server-side rendering via Firebase Hosting, dynamic meta tags
- **Performance:** Code splitting by route, lazy loading, WebP images only
- **Security:** CSP headers in `firebase.json`, no Firebase UIDs in URLs

**Further Reading:**
- `README.md` - Comprehensive project overview
- `CONSTITUTION.md` - Architectural standards (Arabic + English)
- `QUICK_START.md` - Fast development startup guide
- `docs/getting-started/00_START_HERE.md` - New developer onboarding
- `Taks.md` - Completed features checklist (100% done)

````
