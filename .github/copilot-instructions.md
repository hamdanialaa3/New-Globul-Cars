## Copilot Instructions (Concise)

### Big Picture
- Monorepo. Primary app: `bulgarian-car-marketplace/` (React 19 + TypeScript + CRA via CRACO). Backend: `functions/` (Firebase Cloud Functions Node.js). ML: `ai-valuation-model/` (Python/XGBoost/Vertex AI). Assets in `assets/`. Historical archive `DDD/` (never delete, check before recreating features).

### Frontend Architecture
- Provider stack (do not reorder): ThemeProvider → GlobalStyles → LanguageProvider → AuthProvider → ProfileTypeProvider → ToastProvider → GoogleReCaptchaProvider → Router → FilterProvider. See `src/providers/AppProviders.tsx` and `src/App.tsx`.
- Routing extracted under `src/routes/` (Auth/Admin done; Sell/Main/Dealer WIP). Use React.lazy + Suspense and layouts: `MainLayout` for regular pages, `FullScreenLayout` for auth/admin/fullscreen (Outlet pattern).
- Guards: `components/guards/AuthGuard.tsx` handles auth/admin/verified flags; wrap protected routes.
- State management is contexts + local state only; no Redux/Zustand. Contexts live in `src/contexts/`.

### UI/Styles/Translations
- Styled-components with theme from `styles/theme.ts`; font stack `'Martica', 'Arial', sans-serif`. Page styles co-located as `styles.ts` exporting `S.*` namespace. Mobile overrides in `styles/mobile-responsive.css`.
- Bilingual (bg/en). All strings must have both keys in `locales/translations.ts`; access via `useLanguage().t('namespace.key')`. Language persisted in `localStorage` key `globul-cars-language`; html `lang` updates automatically.

### Data + Domain Patterns
- Location data unified: `types/LocationData.ts` with `locationData` containing cityId/cityName/coordinates; old fields (`location`, `city`, `region`) are deprecated—do not add back. City services: `unified-cities-service.ts`, `cityRegionMapper.ts`, `regionCarCountService.ts`.
- Sell workflow pages under `pages/sell/` follow mobile.de-style steps (vehicle → seller → data → equipment → images → pricing → contact). Draft persistence via `workflowPersistenceService.ts`; analytics via `workflow-analytics-service.ts`.
- Profile types (Private/Dealer/Company) controlled by `ProfileTypeProvider`; routing handled by `pages/ProfilePage/ProfileRouter.tsx`. Trust score/badges/verification services already exist.
- Services layer in `src/services/` (100+). Extend services instead of fetching inside components. Socket/real-time services require `useEffect` cleanup.

### Firebase/Infra
- Frontend initialized in `src/firebase/index.ts` using `initializeFirestore` with unlimited cache and `experimentalAutoDetectLongPolling: true`; App Check disabled. Specialized services for auth/messaging/car.
- Env vars: `.env` inside `bulgarian-car-marketplace/` with `REACT_APP_*` (firebase keys, reCAPTCHA, Google Maps). Never commit .env.
- Local emulators: `npm run emulate` (ports: Auth 9099, Firestore 8081, Functions 5001, Storage 8082; Emulator UI 4000). Deploy hosting via `npm run deploy`; deploy functions via `npm run deploy:functions` (region europe-west1). Security rules in root `firestore.rules`/`storage.rules`.

### Dev Workflows
- Install: `npm install` at repo root. Dev server: `cd bulgarian-car-marketplace && npm start` (hot reload, can take minutes on first compile). Build: `npm run build`; optimized: `npm run build:optimized` (image optimizer). Lint is no-op; rely on TypeScript errors. Tests: `npm test` (watch) or `npm run test:ci` (coverage). Prefer `npm` (no yarn/pnpm).
 - Docker: use `docker-compose.yml` to run production-like frontend on port 3000. For dev, mount source and swap command to `npm start`.

### Workflows & Commands
- Local dev: from repo root run `npm install`; then `cd bulgarian-car-marketplace && npm start`.
- Full emulator suite: `npm run emulate` (Auth 9099, Firestore 8081, Functions 5001, Storage 8082, UI 4000). See [firebase.json](firebase.json) and [FIREBASE_INFO.txt](FIREBASE_INFO.txt).
- Deploy hosting: `npm run deploy`. Deploy functions: `npm run deploy:functions` (region europe-west1). See [deploy.ps1](deploy.ps1), [deploy-to-firebase.ps1](deploy-to-firebase.ps1), and guidance in [DEPLOYMENT_READY_INSTRUCTIONS.md](DEPLOYMENT_READY_INSTRUCTIONS.md).
- Tests: run React tests via `npm test` or `npm run test:ci` in `bulgarian-car-marketplace/`. Backend tests use ad-hoc scripts; validate with emulator.
- TypeScript checks: rely on compiler; ESLint is disabled via CRACO. See [tsconfig.json](tsconfig.json).

### Runbook (CI + Health)
- Frontend CI: builds with legacy peers then runs tests; strict install check is advisory. See [.github/workflows/frontend-ci.yml](.github/workflows/frontend-ci.yml).
- Functions CI: TypeScript build must pass on PR/Push. See [.github/workflows/functions-ci.yml](.github/workflows/functions-ci.yml).
- Health check: verify frontend at 3000 via [scripts/health-check-frontend.ps1](scripts/health-check-frontend.ps1).
 - ESLint CI: advisory linting for `src` via [.github/workflows/eslint-ci.yml](.github/workflows/eslint-ci.yml); config in [bulgarian-car-marketplace/.eslintrc.json](bulgarian-car-marketplace/.eslintrc.json).

### Debugging & Utilities
- Firestore indexes: review [firestore.indexes.json](firestore.indexes.json) and recommend via [firestore.indexes.recommendations.json](firestore.indexes.recommendations.json); creation guide in [FIRESTORE_INDEX_CREATION_GUIDE.md](FIRESTORE_INDEX_CREATION_GUIDE.md).
- Rules: see [firestore.rules](firestore.rules) and enhanced variant [firestore-enhanced.rules](firestore-enhanced.rules); Storage rules in [storage.rules](storage.rules).
- Remote Config: template in [remoteconfig.template.json](remoteconfig.template.json).
- Scripts: operational helpers in [scripts/](scripts) and root `.ps1` helpers like [FIX_ALL_SEARCH_SERVICES.ps1](FIX_ALL_SEARCH_SERVICES.ps1), [FINAL_FIX_ALL_COLLECTIONS.ps1](FINAL_FIX_ALL_COLLECTIONS.ps1).

### Cross-Component Integrations
- Frontend → Functions: import `functions` from `src/firebase/index.ts` and call `httpsCallable(functions, 'functionName')`. Backend exports in `functions/src/index.ts`. Example in the section below under Firebase/Infra.
- AI valuation: service in `ai-valuation-model/` consumed by `functions/src/autonomous-resale-engine.ts` for pricing suggestions.
- Social OAuth: frontend callback at `pages/OAuthCallback`; backend handler in `functions/src/social-media/oauth-handler.ts` and callable `exchangeOAuthToken`.

### Data & Domain Conventions
- Unified location: use `types/LocationData.ts` with `locationData` (cityId/cityName/coordinates). Do not use deprecated fields `location`, `city`, `region`.
- Sell workflow: pages under `pages/sell/` follow mobile.de steps; drafts via `workflowPersistenceService.ts`; analytics via `workflow-analytics-service.ts`.
- Profile types: controlled by `ProfileTypeProvider`; route logic in `pages/ProfilePage/ProfileRouter.tsx`.

### Provider Stack & Routing
- App providers order is strict: ThemeProvider → GlobalStyles → LanguageProvider → AuthProvider → ProfileTypeProvider → ToastProvider → GoogleReCaptchaProvider → Router → FilterProvider. See [src/providers/AppProviders.tsx](bulgarian-car-marketplace/src/providers/AppProviders.tsx) and [src/App.tsx](bulgarian-car-marketplace/src/App.tsx).
- Routing under `src/routes/` using `React.lazy` + `Suspense`. Layouts: `MainLayout` for regular pages, `FullScreenLayout` for auth/admin/fullscreen. Use Outlet-based pattern; wrap protected routes with `components/guards/AuthGuard.tsx`.

### UI/Styles/Translations
- Styled-components theme at `styles/theme.ts`; font `'Martica', 'Arial', sans-serif`. Co-locate page styles as `styles.ts` exporting `S.*`. Mobile overrides in `styles/mobile-responsive.css`.
- Bilingual (bg/en): all strings in `locales/translations.ts` with both keys; access via `useLanguage().t('namespace.key')`. Persist language in `localStorage` `globul-cars-language`.

### Firebase/Infra Essentials
- Frontend Firebase init at `src/firebase/index.ts` using `initializeFirestore` with unlimited cache and `experimentalAutoDetectLongPolling: true`; App Check disabled.
### Containers
- Frontend Dockerfile: [bulgarian-car-marketplace/Dockerfile](bulgarian-car-marketplace/Dockerfile) builds prod and serves via `serve` on 3000 (uses `--legacy-peer-deps` for React 19 until Stripe updates).
- Dev profile: `docker compose --profile dev up frontend-dev` mounts source and runs `npm start`; prod: `docker compose --profile prod up -d frontend` from [docker-compose.yml](docker-compose.yml).
- Functions Dockerfile: [functions/Dockerfile](functions/Dockerfile) builds Node functions; pair with emulator outside container.
- Compose: [docker-compose.yml](docker-compose.yml) defines profiles `prod`/`dev`; remove/keep commented `functions` section as needed.

### Vite Trial (Optional)
- Experimental config: [bulgarian-car-marketplace/vite.config.ts](bulgarian-car-marketplace/vite.config.ts).
- Try dev: `npm run dev:vite`. Try build: `npm run build:vite`. Default build remains CRACO.

- Emulators ports: Auth 9099, Firestore 8081, Functions 5001, Storage 8082; Emulator UI 4000. Start with `npm run emulate`.
- Security: rules in root; deploy functions only to `europe-west1`.
- Env: `.env` in `bulgarian-car-marketplace/` with `REACT_APP_*` (firebase keys, reCAPTCHA, Google Maps). Never commit `.env`.

### Third-Party Services
- Google Maps: `services/google/google-maps-enhanced.service.ts` (geocoding, autocomplete, distance matrix, directions). Needs `REACT_APP_GOOGLE_MAPS_API_KEY`.
- hCaptcha: `services/hcaptcha-service.tsx`; production key `REACT_APP_HCAPTCHA_SITE_KEY`.
- Socket.io: `services/socket-service.ts`; separate server; must implement reconnection and cleanup in `useEffect`.
- Stripe: billing via Firebase Functions; see `features/billing/BillingPage` and backend under `functions/src/billing/*`. Setup guides: [STRIPE_SETUP_COMPLETE_GUIDE.md](STRIPE_SETUP_COMPLETE_GUIDE.md), [STRIPE_QUICK_START.md](STRIPE_QUICK_START.md).

### Feature Modules
- Analytics: `features/analytics/AnalyticsDashboard` (admin-only), integrates Firebase Analytics and custom events.
- Verification: `features/verification/VerificationPage` (SMS OTP, ID upload, EIK validation).
- Team Management: `features/team/TeamManagement` (roles, permissions, audit logs).
- Reviews: `features/reviews/` (ratings, forms, stats, moderation).

### Critical Gotchas
- Provider order: do not reorder context providers.
- Translations: every string must have `bg` and `en` in `locales/translations.ts`.
- Socket cleanup: always remove listeners in `useEffect` cleanup.
- Location fields: never reintroduce deprecated `location`, `city`, `region`.
- Build process: CRACO disables ESLint; rely on TypeScript.
- Use `logger-service.ts` in production code rather than `console.*`.

### Example: Frontend → Cloud Function
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
// Export via functions/src/index.ts
```

### Key References
- Project overview: [README.md](README.md), [INDEX.md](INDEX.md), [START_HERE.md](START_HERE.md).
- Deployment: [DEPLOYMENT_READY_INSTRUCTIONS.md](DEPLOYMENT_READY_INSTRUCTIONS.md), [DEPLOYMENT_SUMMARY_2025-12-13_0551.md](DEPLOYMENT_SUMMARY_2025-12-13_0551.md).
- Testing: [TESTING_COMPLETE_GUIDE.md](TESTING_COMPLETE_GUIDE.md).
- Billing: [BILLING_DEPLOYMENT_GUIDE.md](BILLING_DEPLOYMENT_GUIDE.md), [BILLING_TOAST_UX_IMPLEMENTATION.md](BILLING_TOAST_UX_IMPLEMENTATION.md).
- Sell workflow: [SELL_WORKFLOW_DOCUMENTATION.md](SELL_WORKFLOW_DOCUMENTATION.md), [SELL_WORKFLOW_LINKS.md](SELL_WORKFLOW_LINKS.md).
- Security: [SECURITY.md](SECURITY.md), [FIREBASE_INFO.txt](FIREBASE_INFO.txt).

### Performance/Structure Conventions
- Route/layout extraction reduced `App.tsx` size; keep using Outlet-based layouts. Lazy-load heavy components (FacebookPixel, ProgressBar, map layers). Use `logger-service.ts` instead of `console.*` in production code. Avoid duplicating services or reintroducing deprecated location fields. Always clean up Socket.io listeners.

### AI/ML and Docs
- AI valuation microservice under `ai-valuation-model/` (train/deploy/test scripts); consumed by `functions/src/autonomous-resale-engine.ts` for pricing suggestions.
- Key docs: `DOCUMENTATION_INDEX.md` (nav), `PROGRAMMING_PRIORITIES_COMPLETE_DEC_11_2025.md`, `START_HERE.md`, `CHECKPOINT_OCT_22_2025.md`. Arabic summaries in root docs—preserve.

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
