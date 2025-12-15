## Copilot Instructions for AI Agents

### 🎯 Big Picture
**Structure**: Monorepo with frontend-first architecture
- **Frontend**: `bulgarian-car-marketplace/` (React 19 + TypeScript + CRA via CRACO). Entirely self-contained—imports can reference local services, contexts, pages
- **Backend**: `functions/src/` (Firebase Cloud Functions, 98+ Node.js functions across ~25 domains)
- **ML**: `ai-valuation-model/` (Python/XGBoost, deployed via Vertex AI; called by backend autonomously-resale.ts)
- **Data**: Firestore collections (10+), Firebase Storage (images), Algolia (car search indexing)
- **Archive**: `ARCHIVE/` (organized cleanup Dec 2025; never auto-delete; manual review required before recreating archived features)
- **Documentation**: `DOCUMENTATION_ORGANIZED/` (master index: [MASTER_INDEX.md](DOCUMENTATION_ORGANIZED/MASTER_INDEX.md); essential docs, guides, technical, Arabic docs)
- **Packages**: `packages/` (monorepo workspaces: core, services, ui, auth, cars, profile)
- **Optimization**: 77% build size reduction (664MB → 150MB) achieved via service consolidation, lazy loading, tree-shaking

**Key Success Metrics**: 
- Avoid deprecated location fields (`location`, `city`, `region`). Use unified `locationData` (cityId/cityName/coordinates) from `types/LocationData.ts`
- Never use `console.*` in production—always use `logger-service.ts` for structured logging
- Project is **96% complete** (Dec 2025); check [README.md](README.md) and [COMPLETE_REPAIR_PLAN_FINAL_DEC_15_2025.md](COMPLETE_REPAIR_PLAN_FINAL_DEC_15_2025.md) for current status
- **Testing Coverage**: 40-45% (475+ tests across 40 files); see [TESTING_PHASE_2_COMPLETE_DEC_15_2025.md](TESTING_PHASE_2_COMPLETE_DEC_15_2025.md)
- **Security**: 100% secure—all 8 security issues resolved; see [FIXES_REPORT_DEC_15_2025.md](FIXES_REPORT_DEC_15_2025.md)

### Frontend Architecture
**Provider Stack** (order is critical—do not reorder):
1. `ThemeProvider` (styled-components theme from `src/styles/theme.ts`)
2. `GlobalStyles` (stylesheet injection)
3. `LanguageProvider` (bilingual context: BG/EN; persists to localStorage `globul-cars-language`; updates `<html lang>` automatically)
4. `AuthProvider` (Firebase Auth; handles session, user claims, seller upgrades)
5. `ProfileTypeProvider` (context for Private/Dealer/Company profile types; controls feature access)
6. `ToastProvider` (notification system)
7. `GoogleReCaptchaProvider` (reCAPTCHA v3 integration)
8. `Router` (React Router v7; lazy-loaded routes via Suspense)
9. `FilterProvider` (search/filter state across car listings)

**Routing Architecture** (`src/routes/` + `src/pages/`):
- **Layouts**: `MainLayout` (regular pages: header, footer), `FullScreenLayout` (auth, admin, fullscreen: Outlet pattern only)
- **Guards**: `components/guards/AuthGuard.tsx` wraps protected routes; checks auth state, admin flag, seller verification status
- **Lazy Loading**: Critical—use `safeLazy()` utility or `React.lazy + Suspense` for pages. Examples: `FacebookPixel`, `FloatingAddButton`, `WorkflowProgressBar` deferred to reduce initial bundle
- **Sell Workflow**: Dedicated multi-step flow in `pages/sell/` (steps: vehicle → seller → data → equipment → images → pricing → contact). Draft persistence via `workflowPersistenceService.ts`; analytics via `workflow-analytics-service.ts`

**State Management**:
- **Contexts only**—no Redux/Zustand. Contexts live in `src/contexts/` (6 core contexts: Language, Auth, ProfileType, Theme, Filter, Toast)
- **Local state** for component-level needs
- **Services layer** (`src/services/`, 103+ files) for business logic; import and call in components rather than fetching inline

### UI/Styles/Translations
**Styling approach**:
- **Styled-components** with theme from `src/styles/theme.ts`
- **Font stack**: `'Martica', 'Arial', sans-serif` (custom Martica font for brand identity)
- **Page styles**: Co-located as `styles.ts` exporting `S.*` namespace (e.g., `S.Container`, `S.Title`)
- **Mobile overrides**: `src/styles/mobile-responsive.css` (breakpoints and responsive tweaks)
- **Dynamic theme**: Theme switches in real-time via context (theme toggle in header)

**Bilingual (Bulgarian/English)**:
- **All strings must exist in both languages** in `src/locales/translations.ts`; missing keys cause fallback chain issues
- **Access pattern**: `const { t } = useLanguage(); t('namespace.key')`
- **Language persistence**: Stored in `localStorage` key `globul-cars-language`
- **Automatic `<html lang>` updates** when language changes
- **Currency/formatting**: EUR for Bulgaria; check `constants/` for locale-specific formats

**Translation structure** (example):
```typescript
// src/locales/translations.ts
export const translations = {
  'sell.step1.title': { bg: 'Марка на автомобила', en: 'Vehicle Make' },
  'sell.step1.description': { bg: 'Изберете марката...', en: 'Select the make...' },
};
```

### Data + Domain Patterns
**Unified Location Data** (CRITICAL):
- Always use `src/types/LocationData.ts` with `locationData` object containing:
  - `cityId`: City identifier (numeric/string)
  - `cityName`: Display name (e.g., "Sofia")
  - `coordinates`: `{ lat, lng }` for map display
- **Deprecated fields—NEVER use**: `location`, `city`, `region` (legacy; removed in Phase 5)
- **City services**: `unified-cities-service.ts`, `cityRegionMapper.ts`, `regionCarCountService.ts`
- If you see old fields in code, it's a bug—report and fix immediately

**Sell Workflow** (`pages/sell/`):
- Multi-step flow inspired by mobile.de (German standard)
- **Steps order**: Vehicle → Seller → Data → Equipment → Images → Pricing → Contact
- **Draft persistence**: `workflowPersistenceService.ts` (auto-save to localStorage/Firestore)
- **Analytics tracking**: `workflow-analytics-service.ts` (step completion, abandonment, time spent)
- Each step component receives props: `{ currentStep, totalSteps, onNext, onPrev, draftData }`

**Profile Types** (Private/Dealer/Company):
- Controlled by `ProfileTypeProvider` context
- Route logic in `pages/ProfilePage/ProfileRouter.tsx`
- Different features/permissions per type:
  - **Private**: Basic listing, no team, limited to 50 listings/year
  - **Dealer**: Team features, unlimited listings, financing integration
  - **Company**: Enhanced trust score, ratings, business verification
- Check `ProfileTypeContext.ts` before accessing profile-specific features

**Services Layer** (`src/services/`, 103+ files):
- **Rule**: Never fetch or call APIs directly in components; use services
- **Patterns**: Singletons for stateless services (Firebase, APIs); classes for stateful (Socket, Messaging)
- **Import style**: `import { getCarById } from '@/services/car-service'` (or via full paths during migration)
- **Logging**: CRITICAL—use `logger-service.ts` instead of `console.*` in all code:
  ```typescript
  // ❌ Wrong (console in production)
  console.log('User logged in', userId);
  console.error('Failed to load', error);
  
  // ✅ Right (structured logging)
  import { logger } from '@/services/logger-service';
  logger.info('User logged in', { userId });
  logger.error('Failed to load', error, { context: 'carService' });
  ```
- **Socket.io cleanup mandatory**: Always `removeEventListener` in `useEffect` cleanup
- **Example**:
  ```typescript
  // ❌ Wrong (direct fetch in component)
  const [cars, setCars] = useState([]);
  useEffect(() => {
    fetch('/api/cars').then(r => r.json()).then(setCars);
  }, []);
  
  // ✅ Right (via service)
  import { getCarsByLocation } from '@/services/car-search-service';
  const [cars, setCars] = useState([]);
  useEffect(() => {
    getCarsByLocation(cityId).then(setCars);
  }, [cityId]);
  ```

### Firebase/Infra
**Frontend Firebase Configuration** (`src/firebase/index.ts`):
- Initialized with `initializeFirestore({ experimentalAutoDetectLongPolling: true, cacheSizeBytes: -1 })`
- Unlimited cache enabled to support offline-first patterns
- App Check **disabled** (can enable later if needed)
- Separate service files for domain-specific Firebase operations

**Environment Variables** (`.env` in `bulgarian-car-marketplace/` root):
- `REACT_APP_FIREBASE_*` (API key, project ID, etc.)
- `REACT_APP_HCAPTCHA_SITE_KEY` (for form protection)
- `REACT_APP_GOOGLE_MAPS_API_KEY` (maps & geocoding)
- `REACT_APP_ALGOLIA_*` (search indexing)
- **Rule**: Never commit `.env`; use `.env.example` for reference

**Local Development** (`npm run emulate`):
- **Ports**: Auth 9099, Firestore 8081, Functions 5001, Storage 8082, Emulator UI 4000
- **Benefits**: No cloud costs, full fidelity with production, instant feedback
- **Firestore emulator**: Auto-populates from `firestore.rules`; supports queries
- **Cloud Functions emulator**: Runs locally on port 5001 with live reloading

**Deployment Checklist**:
- Frontend: `npm run deploy` (builds → Firebase Hosting)
- Functions: `npm run deploy:functions` (region: `europe-west1` ONLY)
- Security rules: Update `firestore.rules` / `storage.rules` before deploy
- Verify indexes in `firestore.indexes.json` exist in production
- Check `DEPLOYMENT_READY_INSTRUCTIONS.md` for pre-flight steps

### Dev Workflows
**Installation & Local Development**:
- **Install**: `npm install` at repo root (installs both frontend & functions dependencies)
- **Dev server**: `cd bulgarian-car-marketplace && npm start` (hot reload, can take 2-5 min on first compile due to CRACO)
- **Build**: `npm run build` (production build with optimizations)
- **Optimized build**: `npm run build:optimized` (+ image compression)
- **Tests**: `npm test` (watch mode) or `npm run test:ci` (coverage, CI-safe)
- **TypeScript**: Errors shown in VSCode; no ESLint (disabled via CRACO)
- **Linting**: Run separately if needed; focus on type safety

**Build Optimization Wins**:
- CRACO config disables ESLint (rely on TypeScript)
- Service deduplication: 120 services → 103 services
- Lazy-load components: FacebookPixel, FloatingAddButton, maps, progress bars
- Tree-shake unused code via `terser-webpack-plugin`
- Image optimization: `optimize-images.js` script for production

**Docker & Production**:
- **Dev**: `docker compose --profile dev up frontend-dev` (mounts source, hot-reload)
- **Prod**: `docker compose --profile prod up -d frontend` (builds optimized image, serves on port 3000)
- Frontend Dockerfile uses `--legacy-peer-deps` for React 19 compatibility
- Build uses `serve` package for production-like server

**Debugging in Production**:
- Check `logger-service.ts` output (avoids noisy `console.log`)
- Use `window.checkCarsStatus()` and `window.fixCarsStatus()` dev helpers (console only)
- Firestore Emulator UI at http://localhost:4000 for data inspection

### Cloud Functions Organization (`functions/src/`)
**Domain Structure** (98+ functions across ~25 domains):
- **`subscriptions/`**: Stripe checkout, session verification, cancellation, status
- **`verification/`**: Phone OTP, ID documents, EIK validation (Bulgarian company registry)
- **`analytics/`**: User behavior tracking, search analytics, conversion funnels
- **`auth/`**: Admin role assignment, user claims, seller upgrades
- **`billing/`**: Invoice generation, payment history, plan management
- **`messaging/`**: Real-time messaging, notifications, auto-responders
- **`team/`**: Member invitations, role management, permissions, audit logs
- **`social-media/`**: OAuth handlers (Facebook, TikTok), token exchange
- **`reviews/`**: Rating aggregation, moderation, helpful voting
- **`search/`**: Algolia indexing, search analytics
- **`seller/`**: Seller profile management, trust score updates
- **`adapters/`**: `financial-services-manager.js` orchestrates Bulgarian financial partners (DSK, UniCredit, Raiffeisen)
- **`utils/`**: Shared helpers, validation, transformations

**Function Export Pattern**:
```typescript
// functions/src/my-domain/my-function.ts
import { onCall } from 'firebase-functions/v2/https';
export const myFunction = onCall(async (request) => {
  const { data } = request.data;
  // Validate, process, return
  return { success: true, result: data };
});

// functions/src/index.ts (aggregates all exports)
export { myFunction } from './my-domain/my-function';
```

**Frontend Invocation**:
```typescript
import { httpsCallable } from 'firebase/functions';
const result = await httpsCallable(functions, 'myFunction')({ data: 'value' });
```

### Workflows & Commands
- **Local dev**: from repo root run `npm install`; then `cd bulgarian-car-marketplace && npm start`.
- **Full emulator suite**: `npm run emulate` (Auth 9099, Firestore 8081, Functions 5001, Storage 8082, UI 4000). See [firebase.json](firebase.json) and [FIREBASE_INFO.txt](FIREBASE_INFO.txt).
- **Deploy hosting**: `npm run deploy`. **Deploy functions**: `npm run deploy:functions` (region europe-west1 ONLY). See [deploy.ps1](deploy.ps1), [deploy-to-firebase.ps1](deploy-to-firebase.ps1), and guidance in [DEPLOYMENT_READY_INSTRUCTIONS.md](DEPLOYMENT_READY_INSTRUCTIONS.md).
- **Tests**: run React tests via `npm test` or `npm run test:ci` in `bulgarian-car-marketplace/`. Backend tests use ad-hoc scripts; validate with emulator.
- **TypeScript checks**: rely on compiler; ESLint is disabled via CRACO. See [tsconfig.json](tsconfig.json).
- **Documentation updates**: Auto-update docs with `node auto-update-documentation.js --quick` (1 second) or `--analyze` (full analysis). Watch mode available via `--watch`.

### Import Paths & Path Aliases (Critical)
**Always use path aliases** defined in `tsconfig.json` to keep imports clean and relocatable:
```typescript
// ✅ Correct (use path aliases)
import { logger } from '@/services/logger-service';
import { useLanguage } from '@/contexts/LanguageContext';
import { CarCard } from '@/components/CarCard';
import { LocationData } from '@/types/LocationData';

// ❌ Wrong (relative imports make refactoring painful)
import { logger } from '../../services/logger-service';
import { useLanguage } from '../../contexts/LanguageContext';
```

**Available aliases** (from `tsconfig.json`):
- `@/services/*` → local services
- `@/components/*` → local components
- `@/contexts/*` → contexts
- `@/utils/*` → utility functions
- `@/types/*` → TypeScript types
- `@/hooks/*` → custom hooks
- `@/pages/*` → page components
- `@/firebase/*` → Firebase config
- `@/data/*` → static data
- `@/constants/*` → constants
- `@/features/*` → feature modules
- `@/assets/*` → media assets
- `@globul-cars/core/*` → monorepo core (when available)
- `@globul-cars/services/*` → monorepo services (when available)

### Cross-Component Integrations
**Frontend → Cloud Functions**:
- Import: `functions` from `src/firebase/index.ts`
- Call pattern: `httpsCallable(functions, 'functionName')`
- Backend exports in `functions/src/index.ts`
- Example:
  ```typescript
  // Frontend (React)
  import { httpsCallable } from 'firebase/functions';
  const functions = getFunctions();
  const result = await httpsCallable(functions, 'myFunction')({ data: 'value' });
  ```

**AI Valuation**:
- Service in `ai-valuation-model/` (Python/XGBoost)
- Consumed by `functions/src/autonomous-resale-engine.ts`
- Returns pricing suggestions and market analysis

**Social OAuth**:
- Frontend callback: `pages/OAuthCallback`
- Backend handlers: `functions/src/social-media/oauth-handler.ts`
- Function: `exchangeOAuthToken` (Cloud Function)

### Third-Party Integrations

**Google Maps API**:
- Service: `services/google/google-maps-enhanced.service.ts`
- Features: Geocoding, autocomplete, distance matrix, directions
- Required: `REACT_APP_GOOGLE_MAPS_API_KEY` in `.env`
- Fallback: `components/LeafletBulgariaMap` if no API key

**hCaptcha**:
- Service: `services/hcaptcha-service.tsx`
- Usage: Registration, login, contact forms
- Required: `REACT_APP_HCAPTCHA_SITE_KEY` in `.env`

**Stripe** (Billing):
- Frontend: `features/billing/BillingPage`
- Backend: `functions/src/subscriptions/*` and `functions/src/billing/*`
- Guides: [STRIPE_SETUP_COMPLETE_GUIDE.md](STRIPE_SETUP_COMPLETE_GUIDE.md), [STRIPE_QUICK_START.md](STRIPE_QUICK_START.md)

**Socket.io** (Real-time):
- Service: `services/socket-service.ts`
- Separate server outside Firebase
- CRITICAL: Always implement reconnection + cleanup in `useEffect`

**Supabase** (Optional):
- Supplementary storage for large files
- Config: `services/supabase-config.ts`
- Primary: Firebase Storage (do not replace)

**Facebook Pixel**:
- Component: `components/FacebookPixel` (lazy-loaded)
- Included in `App.tsx`
- Events: pageview, addToCart, purchase, search

### Feature Modules
**Analytics** (`features/analytics/AnalyticsDashboard`):
- Admin-only; Firebase Analytics + custom event tracking

**Billing** (`features/billing/BillingPage`):
- 9 subscription tiers; invoices; prorated billing

**Verification** (`features/verification/VerificationPage`):
- SMS OTP, ID document upload, EIK validation (Bulgarian company registry)

**Team Management** (`features/team/TeamManagement`):
- Dealer/Company only; members, roles, permissions, audit logs

**Reviews** (`features/reviews/`):
- 1-5 star ratings; moderation; helpful voting

### Monorepo Packages (`packages/`)
**Structure**: Workspaces-based monorepo for shared code
- `packages/core/` - Common utilities, helpers, constants
- `packages/services/` - Shared business logic services
- `packages/ui/` - Reusable UI components library
- `packages/auth/` - Authentication logic and components
- `packages/cars/` - Car-related domain logic
- `packages/profile/` - Profile management logic

**Status**: Path aliases configured in tsconfig (`@globul-cars/core`, `@globul-cars/services`), but packages not yet fully implemented. Currently using local services in `bulgarian-car-marketplace/src/services/`.

**Future**: Migrate shared services to monorepo packages for better code reuse across potential future apps (dealer portal, admin panel, mobile app).

### Critical Gotchas
1. **Provider Order**: Changing context hierarchy breaks auth/language/theme—order in `App.tsx` is critical
2. **Translation Keys**: Missing `bg` or `en` causes fallback chain — add **both** languages
3. **Socket Cleanup**: Always `removeEventListener` in `useEffect` cleanup to prevent memory leaks
4. **Location Fields**: Never use deprecated `location`, `city`, `region` — use `locationData` only
5. **Build Process**: CRACO disables ESLint; rely on TypeScript compiler errors
6. **Console Logs**: Use `logger-service.ts` in production; never `console.*` (enforced in PROGRAMMING_PRIORITIES)
7. **Image Optimization**: Use optimized versions from `assets/` hierarchy
8. **Mobile Responsive**: Check `styles/mobile-responsive.css` for breakpoint overrides
9. **Service Duplication**: Extend existing services instead of creating duplicates (103 services already exist)
10. **Monorepo Future**: `@globul-cars/core` and `@globul-cars/services` paths prepared in tsconfig but not yet implemented
11. **Archive Files**: Never auto-delete files in `ARCHIVE/` directory—manual review required before recreating archived features

### Key References
- **Project Overview**: [README.md](README.md), [INDEX.md](INDEX.md), [START_HERE.md](START_HERE.md)
- **Architecture**: [ARCHITECTURE_DIAGRAM.html](docs/ARCHITECTURE_DIAGRAM.html), [ARCHITECTURE_GUIDE.md](docs/architecture/ARCHITECTURE_GUIDE.md)
- **Deployment**: [DEPLOYMENT_READY_INSTRUCTIONS.md](DEPLOYMENT_READY_INSTRUCTIONS.md)
- **Sell Workflow**: [SELL_WORKFLOW_DOCUMENTATION.md](docs/06_PLANS/ACTIVE_PLANS/SELL_WORKFLOW_DOCUMENTATION.md)
- **Billing/Payments**: [STRIPE_SETUP_COMPLETE_GUIDE.md](STRIPE_SETUP_COMPLETE_GUIDE.md), [BILLING_DEPLOYMENT_GUIDE.md](BILLING_DEPLOYMENT_GUIDE.md)
- **Security**: [SECURITY.md](SECURITY.md), [firestore.rules](firestore.rules)
- **Testing**: [TESTING_COMPLETE_GUIDE.md](TESTING_COMPLETE_GUIDE.md)

