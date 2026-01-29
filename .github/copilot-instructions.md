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

---

## Core commands (Windows-optimized)

- **Dev:** `npm start` (CRACO webpack, port 3000)
- **Emulators:** `npm run emulate` (Auth 9099, Firestore 8080, Functions 5001)
- **Quality gate:** `npm run type-check` → `npm run build` → `npm test` or `npm run test:ci`
- **Deploy:** `npm run deploy` (Hosting + Functions)
- **Algolia sync:** `npm run sync-algolia`
- **Recovery:** `npm run clean:3000`, `npm run clean:all`, `scripts/START_SERVER.bat`, `scripts/RESTART_SERVER.bat`

---

## Hard rules

- `scripts/ban-console.js` blocks any `console.*` in `src/`; use `logger-service` instead
- Firestore listeners must use `isActive` guard on cleanup
- Public URLs use numeric IDs only: `/profile/:numericId`, `/car/:sellerNumericId/:carNumericId`, `/messages/:u1/:u2`
- **Profile URL strictness:** Own profile = `/profile/:numericId`; viewing others = `/profile/view/:numericId`
- Never expose Firebase UIDs in URLs
- Car data lives in six fixed collections: `passenger_cars`, `suvs`, `vans`, `motorcycles`, `trucks`, `buses`
- Resolve via `SellWorkflowCollections.getCollectionNameForVehicleType()`
- Never delete files; move to `DDD/` folder instead
- No text emojis (📍⚡🚗) anywhere in code—design/UI exceptions only

---

## Architecture map

**Services-first:** 410+ files under `src/services/`
- Prefer extending: `UnifiedCarService`, `numeric-id-system.service`, `SellWorkflowCollections`, `advanced-messaging.service`, `OfferWorkflowService`, `bulgaria-locations.service`, `bulgarian-compliance-service`
- See `src/services/` directory: ~404 services organized by domain (auth/, car/, messaging/, billing/, search/, etc.)

**Messaging:**
- Legacy path: `/messages/:sender/:recipient` (Firestore, deprecated)
- Production path: `/messages-v2?channel=…` (Firebase Realtime DB)
- Hook: `useRealtimeMessaging` from `src/hooks/messaging/`
- Databases: `/channels`, `/presence`, `/typing`
- Channel ID format: `msg_{min(user1,user2)}_{max(user1,user2)}_car_{carId}`

**Subscription/payments:**
- **Stripe deprecated**; manual bank transfer (iCard/Revolut) only
- Config: `src/config/bank-details.ts`
- Reference generator: `generatePaymentReference()`
- Processing: Manual verification workflow

**Search:**
- Hybrid Firestore + Algolia via `services/search/`
- Key services: `smart-search.service.ts`, `UnifiedSearchService`
- Config: `algolia-index-config.json`, `algolia-record-template.json`

**Routing:**
- Routes extracted under `src/routes/*.routes.tsx`
- Guards: `AuthGuard` enforces numeric ID routing
- Pages in `src/pages/` (286 total) organized by category (01_main-pages, 03_user-pages, etc.)

---

## Coding patterns

### Firestore listener pattern

```typescript
useEffect(() => {
  let isActive = true;
  const off = onSnapshot(ref, snap => {
    if (!isActive) return;
    setState(snap.data());
  });
  return () => {
    isActive = false;
    off();
  };
}, []);
```

### Path aliases

Import using `@/` prefix—must match across `tsconfig.json`, `craco.config.js`, `jest.config.js`:

```typescript
import { UnifiedCarService } from '@/services/car/unified-car-service';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/Button';
```

Never use relative imports beyond one level (`../..` is too deep).

### State management

Context-first (no Redux):
- **Auth:** `useAuth()` from `AuthProvider`
- **Language:** `useLanguage()` from `LanguageContext`
- **Profile:** `useProfileType()` from `ProfileTypeContext`
- **Theme:** `useTheme()` from `ThemeContext`
- **Filters:** `FilterContext`
- **Loading:** `LoadingContext`

### Validation helpers

- Plan limits: `listing-limits` service
- EGN/EIK: `bulgarian-compliance-service`
- Cities/regions: `bulgaria-locations.service`
- Phone: +359 format validation

### Images

- **WebP only**—convert all uploads
- Service: `image-upload-service.ts`, `imageOptimizationService.ts`
- Storage: Firebase Storage with `image-storage-*.ts` services

---

## Testing

- **Framework:** Jest + Testing Library
- **Location:** Co-locate tests in `__tests__/` folders
- **Mocks:** `src/__mocks__/firebase/firebase-config.ts`
- **Providers required:** Wrap renders with `ThemeProvider` + `LanguageProvider`
- **Mock order:** Place `jest.mock(...)` **before** imports to avoid hoisting issues
- **Path aliases:** Ensure `jest.config.js` `moduleNameMapper` matches tsconfig exactly
- **Coverage:** `npm run test:ci`
- **Stats:** `npm run test:profile-stats` for specific profile tests

---

## Project structure

```
src/
├── components/     # 441 reusable UI components
├── pages/         # 286 route pages (01_main-pages, 03_user-pages, etc.)
├── services/      # 404 business logic services (auth, car, messaging, billing, etc.)
├── contexts/      # 6 React contexts (Auth, Language, Theme, ProfileType, Filter, Loading)
├── hooks/         # Custom hooks (useAuth, useRealtimeMessaging, etc.)
├── routes/        # Route definitions (*.routes.tsx)
├── firebase/      # Firebase config & initialization
├── locales/       # i18n translations (bg/en)
├── config/        # App config (bank-details.ts, etc.)
├── utils/         # Helper functions
└── __mocks__/     # Test mocks

functions/         # Firebase Cloud Functions (Node 20)
scripts/          # Build/dev scripts (ban-console.js, clean-*.js, etc.)
DDD/              # Deleted files graveyard
```

---

## Operational notes

- **Max file length:** 300 lines; split if larger with proper exports/imports
- **No text emojis** in code (📍⚡🚗 forbidden)
- **Bulgarian market:** EUR currency, +359 phone validation, bg/en locales only
- **Bundler:** CRACO (webpack)—do not introduce Vite/other build tools unless migrating
- **TypeScript:** `strict` mode, target ES2017
- **Node:** v20.x for Functions
- **Firebase:** Project `fire-new-globul`
- **Numeric IDs:** User sequential (1, 2, 3...), Car hierarchical (userId/carLocalId)
- **CI/CD:** GitHub Actions on `main` push
- **Docs:** See `README.md`, `CONSTITUTION.md`, `PROJECT_DOCUMENTATION_UNIFIED.md`
