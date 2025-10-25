# Copilot Instructions for New-Globul-Cars

## Architecture Overview

**Primary App:** `bulgarian-car-marketplace/` - React 19 SPA with Create React App (CRA)
- Entry: `src/index.tsx` → `<App />` with strict provider hierarchy
- **Multi-tenant**: Monorepo includes Firebase Functions (`functions/`), Python AI model (`ai-valuation-model/`), and frontend

**Provider Stack Order** (DO NOT reorder - see `App.tsx:1-25`):
```
ThemeProvider → GlobalStyles → LanguageProvider → AuthProvider → 
ProfileTypeProvider → ToastProvider → GoogleReCaptchaProvider → Router
```

## Key Conventions

### Bilingual System (Bulgarian + English)
- Access copy via `useLanguage().t('namespace.key')` from `contexts/LanguageContext.tsx`
- All strings require **both** `bg` and `en` keys in `locales/translations.ts`
- Docs follow trilingual pattern (Arabic summaries exist in root - preserve when editing)
- Language persists to `localStorage` and triggers custom `languageChange` event
- Document `lang` attribute updates automatically (`bg-BG` or `en-US`)

### Styling & Theme
- **Theme**: `styles/theme.ts` exports `bulgarianTheme` with mobile.de-inspired palette
- **Font stack**: `'Martica', 'Arial', sans-serif` (recent migration - keep consistent)
- Styled components consume `theme` tokens; avoid inline styles in complex pages
- Page-specific styles: co-locate as `styles.ts` exporting `S.*` helpers (see `pages/ProfilePage/styles.ts`)
- Leaflet maps need theme overrides in `GlobalStyles` (`.leaflet-tooltip` patterns)

### Routes & Code Splitting
- All routes use `React.lazy` + `<Suspense>` (see `App.tsx:30-100`)
- Layout wrapper (`Layout`) provides `Header`/`Footer`/`SkipNavigation`
- Use `FullScreenLayout` when intentionally omitting chrome (auth pages, sell workflow)
- Mobile-aware: `MobileHeader` toggled separately from desktop `Header`

### State Management (Contexts Only)
- **Auth**: `AuthProvider` (`contexts/AuthProvider.tsx`)
- **Profile Type**: `ProfileTypeProvider` - Private/Dealer/Company distinctions
- **Language**: `LanguageProvider` 
- **Notifications**: `ToastProvider` (react-toastify wrapper)
- NO Redux/Zustand - context + local state only

### Services Layer (`src/services/`)
- **100+ services** organized by domain: `messaging/`, `analytics/`, `billing/`, `search/`, etc.
- Firebase wrappers: `firebase-cache.service.ts`, `firebase-real-data-service.ts`
- External APIs: `google/`, `supabase-config.ts`, `hcaptcha-service.tsx`
- Real-time: `socket-service.ts`, `realtimeMessaging.ts` (Socket.io + Firebase) - **caller manages cleanup**
- Caching: `cache-service.ts`, `cityCarCountCache.ts` - reuse existing patterns
- **Rule**: Extend existing services instead of adding fetch logic to components

### Firebase Architecture
- **Init**: `src/firebase/index.ts` - exports `app`, `auth`, `db`, `storage`, `functions`
- **Services**: `firebase/` has specialized services: `auth-service.ts`, `messaging-service.ts`, `car-service.ts`
- **Functions**: Separate Node.js backend in `functions/` (v1 & v2 Cloud Functions)
  - `functions/src/`: TypeScript functions by feature (`analytics/`, `payments/`, `messaging/`, etc.)
  - `functions/index.js`: Main entry - uses `FinancialServicesManager` adapter pattern
- **Emulators**: `firebase emulators:start` (ports in `firebase.json:51-75`)
- **Rules**: `firestore.rules`, `storage.rules` - deploy via `firebase deploy --only firestore:rules,storage:rules`

### Environment Variables
- Prefix: `REACT_APP_*` for frontend (CRA requirement)
- Required: `REACT_APP_FIREBASE_*`, `REACT_APP_RECAPTCHA_SITE_KEY`, `REACT_APP_GOOGLE_MAPS_API_KEY`
- See `README.md:40-50` for full list
- Create `.env` in `bulgarian-car-marketplace/` (NOT root)

## Developer Workflows

### Building & Deploying
- **Dev**: `cd bulgarian-car-marketplace && npm start` (port 3000)
- **Build**: `npm run build` (output: `build/`) - optimized via CRACO
- **Optimized Build**: `npm run build:optimized` - includes image optimization via `scripts/optimize-images.js`
- **Deploy**: `npm run deploy` = build + `firebase deploy --only hosting`
- **Functions**: `npm run deploy:functions` (from root)
- **Lint**: `npm run lint` is a **no-op** - use TypeScript compiler errors instead (intentional per `package.json:56`)

### Testing
- **Run**: `npm test` (watch mode) or `npm run test:ci` (coverage, CI)
- Framework: Testing Library + React 19 APIs
- Location: Co-locate tests with components or `services/__tests__/`
- **No Husky?** Run `npx lint-staged` manually for pre-commit checks

### CRACO Build System
- `craco.config.js`: Disables ESLint during build for speed (`eslint.enable: false`)
- Adds Node.js polyfills (`buffer`, `stream`, `crypto-browserify`, etc.) for browser use
- Optimized code splitting: vendor chunks + common chunk reuse
- **Styled Components**: Auto-minified with `pure` annotations

### Debugging
- **Firebase queries**: Use emulators (`npm run emulate` from root)
- **Performance**: `src/utils/performance-monitoring` tracks web vitals
- **Logging**: `services/logger-service.ts` (centralized console wrapper)
- **Test files moved**: Debug utils now in `DDD/TEST_DEBUG_FILES_MOVED_OCT_22/` (not in production)

## Project-Specific Patterns

### Sell Workflow (Mobile.de-inspired)
Multi-step wizard in `pages/sell/`:
1. `VehicleStartPageNew` → `SellerTypePageNew` → `VehicleData` 
2. Equipment: `EquipmentMainPage` → `SafetyPage`, `ComfortPage`, `InfotainmentPage`, `ExtrasPage` (or `UnifiedEquipmentPage`)
3. `ImagesPage` → `PricingPage` → Contact pages (unified or separate: `ContactNamePage`, `ContactAddressPage`, `ContactPhonePage`)
- Workflow state persisted via `workflowPersistenceService.ts`
- Analytics tracked via `workflow-analytics-service.ts`

### Profile System
- **3 Types**: Private, Dealer, Company (`ProfileTypeContext`)
- **UI**: `pages/ProfilePage/ProfileRouter.tsx` routes by type
- **Features**: Trust score (0-100), badges (6 types), verification (`features/verification/`), team management (`features/team/`)
- **Styling**: Co-located `ProfilePage/styles.ts` with `S.*` pattern

### Location Data
- **Unified structure**: `types/LocationData.ts` - `CompleteLocation` interface
- **Legacy fields removed**: `location`, `city`, `region` are deprecated (cleanup Oct 22, 2025)
- Services: `unified-cities-service.ts`, `cityRegionMapper.ts`, `regionCarCountService.ts`
- Maps: Google Maps (`google-maps-enhanced.service.ts`) + Leaflet (`components/LeafletBulgariaMap`)

### Real-time Features
- **Messaging**: Socket.io (`socket-service.ts`) + Firebase (`messaging/`) - hybrid architecture
- **Notifications**: `notification-service.ts`, `fcm-service.ts`, `NotificationHandler` component
- **Analytics**: `real-time-analytics-service.ts`, `visitor-analytics-service.ts`

### AI Valuation (Python Microservice)
- Location: `ai-valuation-model/`
- Stack: XGBoost + Vertex AI + BigQuery
- Scripts: `train_model.py`, `deploy_model.py`, `test_model.py`
- Integration: Called from `functions/` (see `autonomous-resale-engine.ts`)

## Cleanup & Organization

### DDD Folder (Do Not Delete Archive)
- `DDD/` contains moved files from Oct 2025 cleanup - **NOT for deletion**
- Subdirectories: `_ARCHIVED_2025_10_13_MOVED_OCT_22/`, `DUPLICATE_COMPONENTS_MOVED_OCT_22/`, `TEST_DEBUG_FILES_MOVED_OCT_22/`, etc.
- Rule: All cleanup moves files to `DDD/` for manual review (never auto-delete)
- See `CLEANUP_REPORT_OCT_22_2025.md` for details

### Recent Optimizations (Oct 2025)
- Build size: 664 MB → 150 MB (77% reduction)
- Load time: 10s → 2s
- Services: 120 → 103 (deduplication)
- Console.log cleanup: Removed from debug files
- Infinite animations removed (performance)
- See `START_HERE.md`, `CHECKPOINT_OCT_22_2025.md` for details

## Integration Points

### Firebase Functions Communication
- Frontend calls via `functions` SDK from `firebase/index.ts`
- Backend structure: `functions/src/index.ts` exports by feature
- Adapters: `functions/adapters/financial-services-manager.js` orchestrates service partners

### Third-Party Services
- **Google Maps**: `google-maps-enhanced.service.ts` (requires API key)
- **hCaptcha**: `hcaptcha-service.tsx` (clean implementation - old version in `hcaptcha-service-clean.ts`)
- **Supabase**: `supabase-config.ts` (supplementary storage)
- **Facebook Pixel**: `FacebookPixel` component for analytics
- **Socket.io**: Real-time messaging server (check `socket-service.ts` for connection logic)

### Feature Modules (`src/features/`)
- **Analytics**: `analytics/AnalyticsDashboard` - admin tooling
- **Billing**: `billing/BillingPage` - subscription management
- **Verification**: `verification/VerificationPage` - phone/ID verification
- **Team**: `team/TeamManagement` - dealer/company team management
- **Reviews**: `reviews/` - rating system (1-5 stars)

## Common Pitfalls

1. **Provider Order**: Changing context hierarchy breaks auth/language/theme
2. **Translation Keys**: Missing `bg` or `en` causes fallback chain - add both
3. **Socket Cleanup**: Always tear down listeners in `useEffect` cleanup
4. **Legacy Location Fields**: Don't use `location`, `city`, `region` - use `locationData`
5. **Build Process**: CRACO disables ESLint - run TypeScript check separately
6. **Image References**: Use optimized versions from `assets/` hierarchy
7. **Mobile Responsiveness**: Check `styles/mobile-responsive.css` for overrides
