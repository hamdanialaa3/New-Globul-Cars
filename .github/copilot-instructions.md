# Copilot Instructions for New-Globul-Cars

> **📖 ما هو هذا الملف؟ | What is this file?**
> 
> **English:** This file contains comprehensive instructions for GitHub Copilot AI to understand our codebase architecture, conventions, and best practices. It helps Copilot provide context-aware code suggestions that follow our project standards.
>
> **العربية:** يحتوي هذا الملف على تعليمات شاملة لـ GitHub Copilot AI لفهم بنية الكود والاتفاقيات وأفضل الممارسات. يساعد Copilot في تقديم اقتراحات كود متوافقة مع السياق وتتبع معايير مشروعنا.
>
> **For more details, see:** `.github/README.md`

---

## Architecture Overview

**Monorepo Structure:**
```
New Globul Cars/
├── bulgarian-car-marketplace/  # React 19 SPA (primary frontend)
├── functions/                   # Firebase Cloud Functions (Node.js backend)
├── ai-valuation-model/         # Python AI microservice (XGBoost + Vertex AI)
├── assets/                     # Optimized media assets
└── DDD/                        # Archive folder (DO NOT DELETE - historical reference)
```

**Primary App:** `bulgarian-car-marketplace/` - React 19 SPA with Create React App
- Entry: `src/index.tsx` → `<App />` with **strict provider hierarchy**
- Build system: CRACO (custom webpack config in `craco.config.js`)
- Package manager: npm (NOT yarn/pnpm)

**Provider Stack Order** (CRITICAL - DO NOT reorder, see `App.tsx:1-25`):
```
ThemeProvider → GlobalStyles → LanguageProvider → AuthProvider → 
ProfileTypeProvider → ToastProvider → GoogleReCaptchaProvider → Router
```
Changing this order breaks authentication, theming, or language detection.

## Key Conventions

### Bilingual System (Bulgarian + English)
- **Access translations:** `useLanguage().t('namespace.key')` from `contexts/LanguageContext.tsx`
- **Translation files:** `locales/translations.ts` - 2100+ lines, exports single `translations` object
- **ALL strings require BOTH `bg` and `en` keys** - missing keys trigger fallback chain (bg → en → key itself)
- **Docs follow trilingual pattern:** Arabic summaries exist in root markdown files - preserve when editing
- **Persistence:** Language choice saved to `localStorage` as `'globul-cars-language'`
- **Custom event:** `languageChange` event dispatched when language switches
- **Document integration:** `<html lang>` attribute auto-updates (`bg-BG` or `en-US`)
- **Example usage:**
  ```tsx
  const { language, setLanguage, t } = useLanguage();
  <button>{t('common.submit')}</button>  // Accesses translations.bg.common.submit
  ```

### Styling & Theme
- **Theme source:** `styles/theme.ts` exports `bulgarianTheme` with mobile.de-inspired design palette
- **Font stack:** `'Martica', 'Arial', sans-serif` (migrated Oct 2025 - keep consistent across all new components)
- **Styled components pattern:** Components consume `theme` tokens via `styled-components` - avoid inline styles in complex pages
- **Page-specific styles:** Co-locate as `styles.ts` exporting `S.*` namespace (example: `pages/ProfilePage/styles.ts`)
- **Special overrides:** Leaflet maps need theme overrides in `GlobalStyles` (search for `.leaflet-tooltip` patterns)
- **Mobile responsiveness:** Check `styles/mobile-responsive.css` for global mobile overrides before adding new breakpoints

### Routes & Code Splitting
- **All routes use React.lazy + Suspense** (see `App.tsx:30-100` for pattern)
- **Layout system:** `Layout` wrapper provides `Header`/`Footer`/`SkipNavigation` accessibility
- **Full-screen layouts:** Use `FullScreenLayout` when intentionally omitting chrome (auth pages, sell workflow)
- **Mobile-aware:** `MobileHeader` + `MobileBottomNav` toggle separately from desktop `Header`
- **Route example:**
  ```tsx
  const CarDetailsPage = React.lazy(() => import('./pages/CarDetailsPage'));
  <Route path="/car/:id" element={<Suspense fallback={<LoadingSpinner />}><CarDetailsPage /></Suspense>} />
  ```

### State Management (Context API Only)
- **NO Redux/Zustand** - context + local state only
- **Core contexts:**
  - `AuthProvider` (`contexts/AuthProvider.tsx`) - Firebase auth state
  - `ProfileTypeProvider` - Private/Dealer/Company distinctions (3 types)
  - `LanguageProvider` - Bilingual system
  - `ToastProvider` - Notifications (react-toastify wrapper)
- **Context files:** All in `src/contexts/` with co-located `__tests__/` subdirectory

### Services Layer (`src/services/`)
- **100+ services** organized by domain: `messaging/`, `analytics/`, `billing/`, `search/`, `profile/`, etc.
- **Firebase wrappers:** 
  - `firebase-cache.service.ts` - Caching layer with `CACHE_SIZE_UNLIMITED`
  - `firebase-real-data-service.ts` - Real data queries
  - `firebase-auth-users-service.ts` - User management
  - `firebase-debug-service.ts` - Development debugging
- **External integrations:** 
  - `google/google-maps-enhanced.service.ts` (requires `REACT_APP_GOOGLE_MAPS_API_KEY`)
  - `supabase-config.ts` (supplementary storage)
  - `hcaptcha-service.tsx` (clean implementation)
- **Real-time services:** 
  - `socket-service.ts` - Socket.io client (hybrid architecture with Firebase)
  - `realtimeMessaging.ts` - Message real-time updates
  - **CRITICAL:** Caller manages cleanup (always use `useEffect` cleanup functions)
- **Caching services:** 
  - `cache-service.ts` - Generic caching
  - `cityCarCountCache.ts` - Location-specific caching
- **Golden Rule:** Extend existing services instead of adding fetch logic to components
- **Service structure pattern:**
  ```typescript
  // services/my-service.ts
  class MyService {
    private static instance: MyService;
    static getInstance(): MyService { /* singleton */ }
    async fetchData(): Promise<Data> { /* implementation */ }
  }
  export const myService = MyService.getInstance();
  ```

### Firebase Architecture
- **Initialization:** `src/firebase/index.ts` exports `app`, `auth`, `db`, `storage`, `functions`
- **Firestore config:** Uses `initializeFirestore` with:
  - `cacheSizeBytes: CACHE_SIZE_UNLIMITED` (performance optimization)
  - `ignoreUndefinedProperties: true` (prevents errors)
  - `experimentalAutoDetectLongPolling: true` (better connection handling)
- **App Check DISABLED:** Completely disabled to prevent `auth/firebase-app-check-token-is-invalid` errors
- **Specialized services:** `firebase/auth-service.ts`, `firebase/messaging-service.ts`, `firebase/car-service.ts`
- **Cloud Functions backend:** Separate Node.js project in `functions/`
  - Entry: `functions/src/index.ts` exports functions by feature
  - Structure: `functions/src/{analytics,auth,billing,messaging,verification}/`
  - Adapter pattern: `functions/adapters/financial-services-manager.js` orchestrates partner services
  - **98+ Cloud Functions** organized by domain (see `functions/src/` subdirectories)
- **Local development:**
  - Emulators: `npm run emulate` from root (or `firebase emulators:start`)
  - Ports defined in `firebase.json:51-75` (Auth: 9099, Firestore: 8081, Functions: 5001, Storage: 8082)
- **Security rules:**
  - Files: `firestore.rules`, `storage.rules` at project root
  - Deploy: `firebase deploy --only firestore:rules,storage:rules`
  - Never modify rules without understanding security implications for Bulgarian market

### Environment Variables
- **Prefix requirement:** `REACT_APP_*` for frontend (Create React App requirement)
- **Location:** `.env` file in `bulgarian-car-marketplace/` directory (NOT root)
- **Required variables:**
  ```env
  REACT_APP_FIREBASE_API_KEY=
  REACT_APP_FIREBASE_AUTH_DOMAIN=
  REACT_APP_FIREBASE_PROJECT_ID=
  REACT_APP_FIREBASE_STORAGE_BUCKET=
  REACT_APP_FIREBASE_MESSAGING_SENDER_ID=
  REACT_APP_FIREBASE_APP_ID=
  REACT_APP_RECAPTCHA_SITE_KEY=
  REACT_APP_GOOGLE_MAPS_API_KEY=
  ```
- **See:** Root `README.md:40-50` for complete list
- **Never commit:** `.env` to version control (in `.gitignore`)

## Developer Workflows

### Building & Deploying
- **Dev server:** `cd bulgarian-car-marketplace && npm start` (port 3000)
  - Uses React Scripts with CRACO customization
  - Hot reload enabled
  - First build can take 3+ minutes (watch for "Compiled successfully!")
- **Production build:** `npm run build` (output: `build/`) - optimized via CRACO
  - ESLint disabled during build for speed (type checking via TypeScript compiler only)
  - Webpack code splitting: vendor chunks + common chunk reuse
  - Styled Components auto-minified with `pure` annotations
- **Optimized build:** `npm run build:optimized` 
  - Runs standard build + image optimization via `scripts/optimize-images.js`
  - Use before production deployments
- **Deploy hosting:** `npm run deploy` = build + `firebase deploy --only hosting`
  - Deploys to Firebase Hosting from `bulgarian-car-marketplace/build/`
  - CDN cache update takes 5-15 minutes
- **Deploy functions:** `npm run deploy:functions` (from root)
  - Builds TypeScript in `functions/` then deploys
  - Functions deployed to `europe-west1` region
- **Lint command:** `npm run lint` is **intentionally a no-op** (see `package.json:56`)
  - Use TypeScript compiler errors for type checking instead
  - Run `npx lint-staged` manually for pre-commit checks (no Husky installed)

### Testing
- **Watch mode:** `npm test` (interactive test runner)
- **CI mode:** `npm run test:ci` (single-run with coverage, no watch)
- **Framework:** Testing Library + React 19 APIs
- **Location patterns:**
  - Component tests: Co-locate with components in same directory
  - Service tests: `services/__tests__/` or `services/subdomain/__tests__/`
- **Example test structure:**
  ```typescript
  // src/services/__tests__/validation-service.test.ts
  import { validator } from '../validation-service';
  
  describe('ValidationService', () => {
    describe('validateField', () => {
      it('should validate required fields', () => {
        const error = validator.validateField('email', '', { required: true }, 'bg');
        expect(error).toBe('Това поле е задължително');
      });
    });
  });
  ```
- **Coverage:** Run `npm run test:ci` to generate coverage report in `coverage/`

### CRACO Build System
- **Config file:** `craco.config.js` at app root
- **Key customizations:**
  - ESLint disabled: `eslint.enable: false` (faster builds, rely on TypeScript)
  - Node.js polyfills: Adds browser shims for `buffer`, `stream`, `crypto-browserify`, `url`, `util`, `zlib`
  - Handles `node:` scheme imports (maps to browser-friendly equivalents)
  - Webpack optimization: Vendor/common chunk splitting for better caching
  - Styled Components: Minification + `pure` annotations for tree-shaking
- **Build performance:** ~77% size reduction achieved (664 MB → 150 MB after Oct 2025 optimization)
- **Why CRACO?** Create React App doesn't expose webpack config; CRACO allows customization without ejecting

### Debugging
- **Firebase queries:** Use local emulators first
  - Start: `npm run emulate` from project root
  - UI: `http://localhost:4000` (Emulator Suite UI)
  - Firestore UI: `http://localhost:4000/firestore`
  - Advantages: Offline development, faster iteration, no production data pollution
- **Performance monitoring:** 
  - Service: `src/utils/performance-monitoring` tracks Core Web Vitals
  - Metrics: FCP, LCP, FID, CLS automatically logged
- **Logging:**
  - Centralized: `services/logger-service.ts` (replaces `console.*` in production)
  - Pattern: `logger.info('message', { context })` instead of `console.log`
- **Common issues:**
  - **Localhost Firestore errors:** Usually stale browser cache - hard refresh (Ctrl+Shift+R) or Incognito mode
  - **Dev server crashes:** Out of memory - restart dev server (already runs with 4GB heap via `NODE_OPTIONS`)
  - **Auth errors:** Check App Check is disabled in `firebase-config.ts` (known issue with token validation)
- **Debug files location:** Moved to `DDD/TEST_DEBUG_FILES_MOVED_OCT_22/` (not in production builds)

## Project-Specific Patterns

### Sell Workflow (Mobile.de-inspired)
Multi-step wizard in `pages/sell/` following mobile.de UX patterns:

**Desktop flow:**
1. **Vehicle Start** → `VehicleStartPageNew` (vehicle type selection)
2. **Seller Type** → `SellerTypePageNew` (Private/Dealer/Company)
3. **Vehicle Data** → `VehicleData` (make, model, year, VIN, etc.)
4. **Equipment** (branching paths):
   - `EquipmentMainPage` (overview/navigation)
   - `SafetyPage` (airbags, ABS, etc.)
   - `ComfortPage` (AC, heated seats, etc.)
   - `InfotainmentPage` (navigation, Bluetooth, etc.)
   - `ExtrasPage` (roof rack, tow hitch, etc.)
   - Alternative: `UnifiedEquipmentPage` (single-page variant)
5. **Images** → `ImagesPage` (up to 20 photos, drag-drop ordering)
6. **Pricing** → `PricingPage` (price, negotiability, financing options)
7. **Contact** (unified or multi-step):
   - `UnifiedContactPage` (all contact info in one)
   - OR separate: `ContactNamePage` → `ContactAddressPage` → `ContactPhonePage`

**Mobile flow:** Parallel mobile-optimized pages (`Mobile*.tsx` variants)
- Uses bottom sheet navigation
- Swipe gestures for step progression
- Optimized form fields for touch

**State persistence:**
- Service: `workflowPersistenceService.ts` (saves to localStorage + Firestore draft)
- Auto-save on field blur
- Resume unfinished listings on return

**Analytics:**
- Tracked via: `workflow-analytics-service.ts`
- Events: Step entry/exit, field completion, abandonment points
- Funnels tracked per user segment (Private vs Dealer vs Company)

### Profile System
**3 Profile Types** (managed by `ProfileTypeContext`):
- **Private:** Individual sellers (`#FF8F10` orange theme)
  - Features: Basic listing, trust score, reviews
  - Max listings: Plan-dependent (Free: 3, Premium: Unlimited)
- **Dealer:** Professional car dealers (`#16a34a` green theme)
  - Features: Inventory management, team members, analytics dashboard
  - Additional: Logo, business hours, location map
- **Company:** Corporate/fleet (`#1d4ed8` blue theme)
  - Features: Multi-location support, advanced reporting, API access
  - Enterprise: Custom integrations, dedicated support

**UI routing:** `pages/ProfilePage/ProfileRouter.tsx`
- Dynamically renders profile component based on `profileType`
- URL structure: `/profile` (single route, component switches internally)
- Subroutes: `/profile/settings`, `/profile/analytics`, `/profile/team`, etc.

**Key features:**
- **Trust score:** 0-100 calculated by `trust-score-service.ts`
  - Factors: Verification status, reviews, response time, listing quality
- **Badges:** 6 types (Verified, Top Seller, Fast Responder, etc.)
  - Displayed via `TrustBadge` component
- **Verification:** Phone + ID document (`features/verification/VerificationPage`)
  - SMS OTP via Firebase Functions
  - Document upload to Firebase Storage
  - Admin review queue
- **Team management:** `features/team/TeamManagement`
  - Invite members, assign roles (Admin, Manager, Agent)
  - Per-member permissions

**Styling:** Co-located in `ProfilePage/styles.ts`
- Pattern: Export `S` namespace with styled components
- Example: `S.ProfileContainer`, `S.StatsCard`, etc.
- Reduces main component file size

### Location Data
**Unified structure** (migrated Oct 2025):
- **Type definition:** `types/LocationData.ts`
- **Primary interface:** `CompleteLocation` with nested `locationData: LocationData`
- **DEPRECATED fields:** `location`, `city`, `region` (removed from new code)
  - Legacy listings may still have these - migration service handles conversion
- **LocationData structure:**
  ```typescript
  interface LocationData {
    cityId: string;                    // From BULGARIAN_CITIES constant
    cityName: { bg: string; en: string; };
    coordinates: { lat: number; lng: number; };
    region?: string;                   // Province (Област)
    postalCode?: string;               // 4-digit Bulgarian postal code
    address?: string;                  // Optional full address
  }
  ```

**Services:**
- `unified-cities-service.ts` - Master city database (28 Bulgarian cities)
- `cityRegionMapper.ts` - Maps cities to 28 regions (Области)
- `regionCarCountService.ts` - Caches car counts per region
- **Map integrations:**
  - Google Maps: `google-maps-enhanced.service.ts` (primary, requires API key)
  - Leaflet: `components/LeafletBulgariaMap` (fallback, no API key needed)
  - Bulgaria-specific: Pre-loaded city coordinates, region boundaries

### Real-time Features
**Hybrid architecture** (Socket.io + Firebase Realtime Database):

**Messaging:**
- Service: `socket-service.ts` (Socket.io client)
- Firebase: `messaging/` services (persistence layer)
- Flow: Client → Socket.io → Firebase Functions → Firestore → Real-time listeners
- **Cleanup pattern:**
  ```tsx
  useEffect(() => {
    const unsubscribe = socketService.onMessage((msg) => {
      handleMessage(msg);
    });
    return () => unsubscribe(); // CRITICAL: Always cleanup
  }, []);
  ```

**Notifications:**
- Services: `notification-service.ts`, `fcm-service.ts`
- Component: `NotificationHandler` (auto-included in App.tsx)
- Types: New message, listing update, price drop, verification status
- Channels: In-app toast + browser push (FCM) + email (via Cloud Functions)

**Analytics:**
- `real-time-analytics-service.ts` - Live dashboard metrics
- `visitor-analytics-service.ts` - User behavior tracking
- Updates: WebSocket for real-time, batch to BigQuery every 5 minutes

### AI Valuation (Python Microservice)
**Location:** `ai-valuation-model/` directory

**Stack:**
- ML: XGBoost (gradient boosting)
- Training: Vertex AI (Google Cloud)
- Data: BigQuery (historical sales, market trends)
- Deployment: Cloud Functions (Python 3.11 runtime)

**Key scripts:**
- `train_model.py` - Train on Bulgarian car market data
- `deploy_model.py` - Deploy to Vertex AI endpoint
- `test_model.py` - Validation against holdout set

**Integration:**
- Called from: `functions/src/autonomous-resale-engine.ts`
- Input: Car details (make, model, year, mileage, condition, location)
- Output: Predicted price (EUR), confidence interval, comparable listings
- Used in: Pricing page suggestions, market value reports

## Cleanup & Organization

### DDD Folder (Do Not Delete Archive)
**Purpose:** Historical archive for manually-reviewed files from Oct 2025 cleanup
- **Location:** `DDD/` at project root
- **Subdirectories:**
  - `_ARCHIVED_2025_10_13_MOVED_OCT_22/` - Components moved during first cleanup pass
  - `DUPLICATE_COMPONENTS_MOVED_OCT_22/` - Duplicate/redundant components identified
  - `TEST_DEBUG_FILES_MOVED_OCT_22/` - Debug utilities removed from production bundle
  - Additional dated subdirectories for specific cleanup batches
- **Golden Rule:** **NEVER auto-delete files from DDD/** - all moves require manual review
  - Reason: May contain unique business logic, legacy integrations, or reference implementations
- **Documentation:** `CLEANUP_REPORT_OCT_22_2025.md` details all moves with rationale
- **When to check:** Before implementing "new" features - may already exist in DDD archive

### Recent Optimizations (Oct 2025)
**Major achievements** (documented in `CHECKPOINT_OCT_22_2025.md` and `START_HERE.md`):
- **Build size:** 664 MB → 150 MB (77% reduction)
  - Method: Duplicate service consolidation, lazy loading, tree-shaking
- **Load time:** 10s → 2s (first contentful paint)
  - Method: Code splitting, CRACO optimization, image compression
- **Service deduplication:** 120 → 103 services
  - Consolidated: Location services (5 → 1), Firebase wrappers (7 → 3), analytics (4 → 2)
- **Console.log cleanup:** Removed from 50+ debug files
  - Replaced with: `logger-service.ts` for production logging
- **Animation performance:** Removed infinite animations causing CPU spikes
  - Kept: Essential animations (page transitions, loading states)
- **Font migration:** Unified to `'Martica', 'Arial', sans-serif`
  - Previous: Mixed fonts across components caused FOUT (Flash of Unstyled Text)

**Breaking changes to avoid:**
- Don't restore old location field structure (`location`, `city`, `region`)
- Don't add new duplicate services - check existing services first
- Don't use `console.log` in production code - use `logger-service.ts`

### Code Organization Principles
**File naming:**
- Pages: PascalCase with `Page` suffix (e.g., `HomePage.tsx`)
- Components: PascalCase (e.g., `TrustBadge.tsx`)
- Services: kebab-case with `.service.ts` suffix (e.g., `firebase-cache.service.ts`)
- Utilities: kebab-case with `.ts` suffix (e.g., `error-handling.ts`)
- Tests: Same name as file + `.test.ts` or `.test.tsx`

**Import organization:**
- React imports first
- Third-party libraries
- Internal absolute imports (contexts, services, utils)
- Relative imports (same directory)
- Styles/CSS last

**Component structure:**
```tsx
// 1. Imports
import React, { useState, useEffect } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { myService } from '@/services/my-service';
import * as S from './styles';

// 2. Types/Interfaces (if not in separate file)
interface MyComponentProps { /* ... */ }

// 3. Component
export const MyComponent: React.FC<MyComponentProps> = ({ prop1 }) => {
  // 4. Hooks
  const { t } = useLanguage();
  const [state, setState] = useState<Type>(initialValue);
  
  // 5. Effects
  useEffect(() => {
    // Effect logic
    return () => { /* Cleanup */ };
  }, [dependencies]);
  
  // 6. Event handlers
  const handleClick = () => { /* ... */ };
  
  // 7. Render
  return <S.Container>{/* JSX */}</S.Container>;
};
```

## Integration Points

### Firebase Functions Communication
**Frontend to backend flow:**
- Frontend imports: `functions` from `src/firebase/index.ts`
- Call pattern: `httpsCallable(functions, 'functionName')`
- Backend entry: `functions/src/index.ts` exports functions by domain
- Example:
  ```typescript
  // Frontend (React)
  import { getFunctions, httpsCallable } from 'firebase/functions';
  const functions = getFunctions();
  const myFunction = httpsCallable(functions, 'myFunction');
  const result = await myFunction({ data: 'value' });
  
  // Backend (Cloud Functions)
  // functions/src/my-feature/my-function.ts
  export const myFunction = onCall(async (request) => {
    const { data } = request.data;
    // Process...
    return { result: 'success' };
  });
  ```

**Adapter pattern:**
- File: `functions/adapters/financial-services-manager.js`
- Purpose: Orchestrates Bulgarian financial service partners
- Integrations: DSK Bank, UniCredit Bulbank, Raiffeisen, insurance companies
- Use when: Adding payment processing, loan applications, insurance quotes

**Function organization:**
- `analytics/` - User behavior, search analytics, conversion tracking
- `auth/` - Admin roles, user claims, seller upgrades
- `billing/` - Subscriptions, payments, invoicing
- `messaging/` - Real-time messaging, notifications, auto-responders
- `verification/` - Phone OTP, ID document verification, EIK validation
- `team/` - Member invitations, role management, permissions
- See `functions/src/` for complete list (98+ functions)

### Third-Party Services
**Google Maps API:**
- Service: `services/google/google-maps-enhanced.service.ts`
- Features: Geocoding, autocomplete, distance matrix, directions
- Requires: `REACT_APP_GOOGLE_MAPS_API_KEY` in `.env`
- Fallback: Leaflet maps (`components/LeafletBulgariaMap`) if no API key

**hCaptcha:**
- Service: `services/hcaptcha-service.tsx`
- Implementation: Clean version (old version archived as `hcaptcha-service-clean.ts`)
- Usage: Registration, login, contact forms, listing submission
- Required: `REACT_APP_HCAPTCHA_SITE_KEY` in `.env`

**Supabase:**
- Config: `services/supabase-config.ts`
- Purpose: Supplementary storage for large files, backups
- Usage: Alternative to Firebase Storage for certain use cases
- Note: Firebase Storage is primary - Supabase is optional enhancement

**Socket.io:**
- Service: `services/socket-service.ts`
- Real-time server: Separate Socket.io server (check service for connection logic)
- Use cases: Real-time messaging, online status, typing indicators
- CRITICAL: Always implement reconnection logic and cleanup

**Facebook Pixel:**
- Component: `components/FacebookPixel`
- Location: Included in `App.tsx`
- Events: Page view, add to cart, purchase, search
- Configuration: Via environment variables

**Social Media OAuth:**
- Platforms: Facebook, Instagram (via Facebook), TikTok
- Handler: `pages/OAuthCallback` (callback URL handler)
- Functions: `functions/src/social-media/oauth-handler.ts`
- Token exchange: `exchangeOAuthToken` Cloud Function
- See: `FACEBOOK_SETUP_COMPLETE_GUIDE.md` for Facebook setup

### Feature Modules (`src/features/`)
**Purpose:** Complex features with multiple components, organized as mini-apps

**Analytics** (`features/analytics/AnalyticsDashboard`):
- Admin-only dashboard
- Metrics: User growth, listing stats, conversion rates
- Integrations: Firebase Analytics, custom event tracking
- Access control: Requires admin role

**Billing** (`features/billing/BillingPage`):
- Subscription management (9 plan tiers)
- Payment history, invoices, receipts
- Plan upgrades/downgrades with prorated billing
- Stripe integration (via Firebase Functions)

**Verification** (`features/verification/VerificationPage`):
- Phone verification: SMS OTP via Firebase Functions
- ID document upload: To Firebase Storage
- Admin review queue: For manual verification
- EIK validation: For company profiles (Bulgarian registry)

**Team Management** (`features/team/TeamManagement`):
- Dealer/Company only (not available for Private profiles)
- Invite members via email
- Role assignment: Admin, Manager, Agent
- Permissions: Per-member access control
- Activity logs: Audit trail for team actions

**Reviews** (`features/reviews/`):
- Star rating: 1-5 stars
- Review forms: Structured review submission
- Statistics: Rating distribution, average score
- Helpful voting: Users vote on review helpfulness
- Moderation: Admin can hide/remove inappropriate reviews

## Common Pitfalls

1. **Provider Order**: Changing context hierarchy breaks auth/language/theme
2. **Translation Keys**: Missing `bg` or `en` causes fallback chain - add both
3. **Socket Cleanup**: Always tear down listeners in `useEffect` cleanup
4. **Legacy Location Fields**: Don't use `location`, `city`, `region` - use `locationData`
5. **Build Process**: CRACO disables ESLint - run TypeScript check separately
6. **Image References**: Use optimized versions from `assets/` hierarchy
7. **Mobile Responsiveness**: Check `styles/mobile-responsive.css` for overrides
