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
