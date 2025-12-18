# Copilot Instructions for AI Agents

**Project Status** (Dec 2025): ✅ **96% Complete | Security: 100% | Tests: 40-45% | Code Quality: A+**

---

## 🎯 Big Picture Architecture

**Monorepo Structure**:
- **Frontend**: `bulgarian-car-marketplace/` (React 19 + TypeScript, CRA via CRACO)
- **Backend**: `functions/src/` (Firebase Cloud Functions, 98+ functions across ~25 domains)
- **ML**: `ai-valuation-model/` (Python/XGBoost, deployed via Vertex AI)
- **Data**: Firestore (collections), Firebase Storage (images), Algolia (search indexing)
- **Documentation**: [DOCUMENTATION_ORGANIZED/MASTER_INDEX.md](DOCUMENTATION_ORGANIZED/MASTER_INDEX.md)

**Why This Matters**:
- **77% build size reduction** (664MB → 150MB) via lazy loading + service consolidation
- **Context-based state** (no Redux) keeps frontend lightweight; 6 core contexts
- **Service layer** (103+ files) centralizes all business logic—never fetch in components
- **Critical constraint**: **Provider order in `AppProviders.tsx` is hardcoded—changing it breaks auth/language/theme**

---

## 🔥 Critical Patterns for AI Agents

### 1. Services + Structured Logging (MANDATORY)
**Rule**: All business logic → services; all logging → `logger-service.ts`; never `console.*` in production.

```typescript
// ✅ Correct
import { logger } from '@/services/logger-service';
import { getCarsByLocation } from '@/services/car-search-service';

async function loadCars(cityId: string) {
  try {
    const cars = await getCarsByLocation(cityId);
    logger.info('Loaded cars', { cityId, count: cars.length });
    return cars;
  } catch (error) {
    logger.error('Failed to load cars', error, { cityId });
    throw error;
  }
}

// ❌ Wrong (direct fetch + console)
const [cars, setCars] = useState([]);
useEffect(() => {
  fetch('/api/cars').then(r => r.json()).then(setCars);
  console.log('Loaded'); // ← Never do this
}, []);
```

### 2. Provider Order (HARDCODED - DO NOT CHANGE)
All providers in `src/providers/AppProviders.tsx`. **Exact order required** (outer → inner):
1. `ThemeProvider` (styled-components)
2. `GlobalStyles`
3. `ErrorBoundary`
4. `LanguageProvider` (MUST be before AuthProvider—auth uses translations)
5. `CustomThemeProvider` (Dark/Light mode)
6. `AuthProvider` (MUST be before ProfileTypeProvider)
7. `ProfileTypeProvider` (Private/Dealer/Company)
8. `ToastProvider`
9. `GoogleReCaptchaProvider`
10. `Router` (BrowserRouter)
11. `FilterProvider` (depends on Router)

**If you reorder these, the app breaks.** Check the file for detailed dependency documentation.

### 3. Unified Location Data (REPLACE DEPRECATED FIELDS)
- **Use**: `locationData` from `src/types/LocationData.ts` with `{ cityId, cityName, coordinates: { lat, lng } }`
- **Deprecated**: `location`, `city`, `region` (legacy; remove if found)
- **Services**: `unified-cities-service.ts`, `cityRegionMapper.ts`, `regionCarCountService.ts`

### 4. Path Aliases (ALWAYS USE)
```typescript
// ✅ Correct
import { logger } from '@/services/logger-service';
import { useLanguage } from '@/contexts/LanguageContext';
import { CarCard } from '@/components/CarCard';

// ❌ Wrong (brittle relative paths)
import { logger } from '../../services/logger-service';
```

**Available aliases**: `@/services/*`, `@/components/*`, `@/contexts/*`, `@/utils/*`, `@/types/*`, `@/hooks/*`, `@/pages/*`, `@/firebase/*`, `@/data/*`, `@/constants/*`, `@/features/*`, `@/assets/*`

### 5. Bilingual (Bulgarian/English)
- **All UI strings** must have both BG + EN translations in `src/locales/translations.ts`
- **Missing keys** cause fallback chain issues
- **Usage**: `const { t } = useLanguage(); t('namespace.key')`
- **Structure**: 
  ```typescript
  export const translations = {
    'sell.step1.title': { bg: 'Марка на автомобила', en: 'Vehicle Make' },
  };
  ```

---

## 📦 Frontend Architecture Deep Dive

### State Management (Contexts Only)
- **6 core contexts**: Language, Auth, ProfileType, Theme, Filter, Toast (all in `src/contexts/`)
- **Local state**: Use React `useState` for component-level UI
- **No Redux/Zustand** (complexity not needed at this scale)

### Routing + Lazy Loading
- **Routes**: `src/routes/` and `src/pages/`
- **Layouts**: 
  - `MainLayout` (header + footer for regular pages)
  - `FullScreenLayout` (auth, admin—Outlet pattern only)
- **Lazy loading CRITICAL**: Use `safeLazy()` or `React.lazy + Suspense` for pages (reduces initial bundle)
  - Examples: FacebookPixel, FloatingAddButton, WorkflowProgressBar all deferred
- **Guards**: `components/guards/AuthGuard.tsx` wraps protected routes (checks auth, admin flag, seller verification)

### Sell Workflow (Multi-Step Form)
- **Location**: `pages/sell/` (inspired by mobile.de German standard)
- **Steps** (in order): Vehicle → Seller → Data → Equipment → Images → Pricing → Contact
- **Draft persistence**: `workflowPersistenceService.ts` (auto-saves to localStorage + Firestore)
- **Analytics**: `workflow-analytics-service.ts` (tracks step completion, abandonment, time spent)
- **Props per step**: `{ currentStep, totalSteps, onNext, onPrev, draftData }`

### Styling (Styled-Components + Theme)
- **Theme**: `src/styles/theme.ts` (single source of truth for colors, spacing, fonts)
- **Font stack**: `'Martica', 'Arial', sans-serif` (custom Martica for brand)
- **Page styles**: Co-located as `styles.ts` exporting `S.*` namespace (`S.Container`, `S.Title`)
- **Mobile responsive**: `src/styles/mobile-responsive.css` (breakpoint overrides)
- **Theme toggle**: Real-time dark/light mode via context

### Profile Types (Private/Dealer/Company)
- **Controlled by**: `ProfileTypeProvider` context (depends on auth)
- **Route logic**: `pages/ProfilePage/ProfileRouter.tsx`
- **Permissions**:
  - **Private**: Basic listing, no team, ≤50 listings/year
  - **Dealer**: Team features, unlimited listings, financing integration
  - **Company**: Enhanced trust score, ratings, business verification
- **Check before accessing** profile-specific features in `ProfileTypeContext.ts`

---

## ⚙️ Backend (Cloud Functions)

### Domain Structure (`functions/src/`)
98+ functions organized by domain (~25 domains):

**Core Domains**:
- `subscriptions/` — Stripe checkout, session verification, cancellation, status, webhook handling
- `verification/` — Phone OTP, ID documents, EIK validation (Bulgarian company registry), email verification
- `auth/` — Admin role assignment, seller upgrades, user claims, JWT generation
- `billing/` — Invoices, payment history, plan management, invoice generation, prorated billing

**User & Commerce**:
- `messaging/` — Real-time messaging, notifications, auto-responders, message history
- `team/` — Member invitations, roles, permissions, audit logs, team management
- `seller/` — Profile management, trust score updates, seller verification
- `reviews/` — Rating aggregation, moderation, helpful voting, review analytics

**Search & Analytics**:
- `search/` — Algolia indexing, search analytics, autocomplete, faceted search
- `analytics/` — User behavior tracking, search analytics, conversion funnels, event tracking
- `catalog-feeds/` — XML/CSV feed generation for external marketplaces

**Social & Content**:
- `social-media/` — OAuth handlers (Facebook, TikTok), token exchange, profile sync
- `facebook-catalog/` — Facebook Catalog product sync, marketplace integration

**Business Integration**:
- `adapters/` — `financial-services-manager.js` orchestrates Bulgarian partners (DSK, UniCredit, Raiffeisen)
- `payments/` — Payment processing, invoice generation, refunds
- `commission/` — Commission calculation, payout management
- `vehicle-history/` — Vehicle history lookup, market analysis

**Utilities & Services**:
- `utils/` — Shared helpers, validation, transformations, error handling
- `ai/` — AI valuation model integration (Python/XGBoost)
- `monitoring/` — System health checks, error tracking, performance monitoring

**Other Domains**:
- `stats.ts` — Statistical aggregation, reporting
- `insurance-service.ts` — Insurance partner integration
- `ev-charging.ts` — EV charging network integration
- `service-network.ts` — Service provider network management
- `recaptcha.ts` — reCAPTCHA validation

### Function Export Pattern
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

### Frontend Invocation
```typescript
import { httpsCallable } from 'firebase/functions';
import { functions } from '@/firebase/index';

const result = await httpsCallable(functions, 'myFunction')({ data: 'value' });
```

---

## 🚀 Developer Workflows

### Installation & Local Dev
```bash
# Install (from repo root; installs frontend + functions)
npm install

# Start frontend dev server (hot reload)
cd bulgarian-car-marketplace && npm start
# Note: First compile takes 2-5 min due to CRACO overhead (normal)

# Or with optimized memory
npm run start:dev  # Uses 4GB heap
```

### Firebase Emulator Suite
```bash
npm run emulate
# Ports: Auth 9099, Firestore 8081, Functions 5001, Storage 8082, UI 4000
# Zero cloud costs; full production fidelity
# Firestore emulator auto-populates from firestore.rules
```

### Testing
```bash
# Frontend watch mode
npm test

# CI mode with coverage
npm run test:ci

# Type checking only
npm run type-check
```

### Testing Workflows (40-45% Coverage)

**Test File Structure**:
- **Unit Tests**: `src/__tests__/` or co-located `*.test.ts(x)` alongside source
- **Service Tests**: `src/services/__tests__/` (375+ tests across 40 files)
- **Component Tests**: `src/components/__tests__/` (Jest + React Testing Library)
- **Context Tests**: `src/contexts/__tests__/` (provider, consumer, hooks)
- **Utility Tests**: `src/utils/__tests__/` (logic, validators, helpers)

**Test Pattern Examples**:
```typescript
// ✅ Service Test Example
import { getCarsByLocation } from '@/services/car-search-service';
import { logger } from '@/services/logger-service';

describe('CarSearchService', () => {
  it('should fetch cars for given location', async () => {
    const cars = await getCarsByLocation('sofia-123');
    expect(cars).toEqual(expect.arrayContaining([
      expect.objectContaining({ cityId: 'sofia-123' })
    ]));
    expect(logger.info).toHaveBeenCalledWith('Loaded cars', expect.any(Object));
  });

  it('should handle errors gracefully', async () => {
    await expect(getCarsByLocation('invalid')).rejects.toThrow();
    expect(logger.error).toHaveBeenCalled();
  });
});

// ✅ Context Test Example
import { renderHook, act } from '@testing-library/react';
import { useLanguage } from '@/contexts/LanguageContext';

describe('LanguageContext', () => {
  it('should toggle language between BG and EN', () => {
    const { result } = renderHook(() => useLanguage());
    expect(result.current.language).toBe('bg');
    
    act(() => result.current.toggleLanguage());
    expect(result.current.language).toBe('en');
  });
});

// ✅ Component Test Example
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { CarCard } from '@/components/CarCard';

describe('CarCard', () => {
  it('should display car information', () => {
    render(<CarCard car={{ id: '1', title: 'BMW X5', price: 50000 }} />);
    expect(screen.getByText('BMW X5')).toBeInTheDocument();
    expect(screen.getByText('€50,000')).toBeInTheDocument();
  });

  it('should call onClick when clicked', async () => {
    const onClick = jest.fn();
    render(<CarCard car={{ id: '1' }} onClick={onClick} />);
    await userEvent.click(screen.getByRole('button'));
    expect(onClick).toHaveBeenCalled();
  });
});
```

**Coverage Goals** (Phase 3 & 4):
- Phase 1 (Done): Core services + utils (40-45%)
- Phase 2 (In Progress): Context + hooks integration
- Phase 3 (Jan 2026): E2E tests with Cypress (major user flows)
- Phase 4 (Feb 2026): UI component snapshot tests
- Target: 70%+ coverage by March 2026

**Running Tests by Category**:
```bash
# All tests
npm test

# Specific test file
npm test -- CarCard.test.tsx

# Services only
npm test -- services/

# Watch mode (development)
npm test -- --watch

# Coverage report (HTML)
npm run test:ci -- --coverage
# Open: coverage/lcov-report/index.html
```

### Build & Deployment
```bash
# Production build
npm run build

# Build + image compression
npm run build:optimized

# Deploy frontend to Firebase Hosting
npm run deploy

# Deploy functions (region: europe-west1 ONLY)
npm run deploy:functions

# Build optimization wins:
# - CRACO: ESLint disabled (rely on TypeScript compiler)
# - Services: 120 → 103 (deduplication)
# - Lazy loading: FacebookPixel, FloatingAddButton, maps, progress bars
# - Tree-shaking: terser-webpack-plugin removes unused code
```

### Documentation Scripts
```bash
# Quick update (1 second)
node auto-update-documentation.js --quick

# Full analysis
node auto-update-documentation.js --analyze

# Watch mode
node auto-update-documentation.js --watch
```

---

## 🔌 Third-Party Integrations

| Service | Location | Key Details |
|---------|----------|-------------|
| **Google Maps** | `services/google/google-maps-enhanced.service.ts` | Geocoding, autocomplete, distance matrix, directions. Requires `REACT_APP_GOOGLE_MAPS_API_KEY` |
| **hCaptcha** | `services/hcaptcha-service.tsx` | Registration, login, contact forms. Requires `REACT_APP_HCAPTCHA_SITE_KEY` |
| **Stripe** | `features/billing/BillingPage` + `functions/src/subscriptions/*` | 9 tiers, invoices, prorated billing. Guides: STRIPE_SETUP_COMPLETE_GUIDE.md, STRIPE_QUICK_START.md |
| **Socket.io** | `services/socket-service.ts` | Real-time messaging. CRITICAL: Always implement cleanup + reconnection in `useEffect` |
| **Algolia** | `functions/src/search/` | Car search indexing. Requires `REACT_APP_ALGOLIA_*` vars |
| **Facebook Pixel** | `components/FacebookPixel` (lazy-loaded) | Events: pageview, addToCart, purchase, search |
| **Supabase** | `services/supabase-config.ts` | Optional—supplementary storage for large files (primary: Firebase Storage) |

---

## ⚡ Performance Optimization Guide

### Bundle Analysis
```bash
# Analyze bundle size
npm run build -- --analyze

# Visual breakdown
# Look for: components/FacebookPixel, google-maps (large dependencies)
# These are already lazy-loaded—check imports in App.tsx
```

**Current Optimizations** (achieved 77% reduction):
- **Service Deduplication**: 120 → 103 services (removed ~2000 LOC)
- **Lazy Loading**: FacebookPixel, FloatingAddButton, maps, progress bars deferred
- **Code Splitting**: Routes split automatically by `React.lazy()`
- **Tree-Shaking**: Terser removes unused exports
- **Image Optimization**: `optimize-images.js` script compresses assets

### Performance Bottlenecks to Avoid
1. **Don't fetch in render**: Always use services + `useEffect`
2. **Don't create new objects in render**: Memoize contexts, callbacks (`useMemo`, `useCallback`)
3. **Don't import everything**: Use path aliases to enable tree-shaking
4. **Don't re-render on state change**: Use context wisely (split contexts if needed)
5. **Don't load all images at once**: Use `loading="lazy"` on `<img>` tags

### Monitoring Performance
```typescript
// Use reportWebVitals.ts to track metrics
import { reportWebVitals } from './reportWebVitals';

reportWebVitals((metric) => {
  // Send to analytics: LCP, FID, CLS, TTFB
  console.log(metric); // ← Log only in dev; use logger service in prod
});
```

---

## 🐛 Debugging Guide

### Local Development Setup
```bash
# Start with emulator (best for debugging)
npm run emulate

# In another terminal, start frontend
cd bulgarian-car-marketplace && npm start
```

**Emulator Ports**:
- Firebase Auth: http://localhost:9099
- Firestore: http://localhost:8081
- Cloud Functions: http://localhost:5001
- Storage: http://localhost:8082
- **Emulator UI**: http://localhost:4000 (inspect data, run queries)

### Debugging Strategies

**1. Logger Service (Recommended)**
```typescript
import { logger } from '@/services/logger-service';

// Structured logging with context
logger.debug('Starting car search', { cityId, filters });
logger.info('Cars loaded successfully', { count: cars.length, duration: 234 });
logger.warn('API rate limit approaching', { remaining: 50 });
logger.error('Payment failed', paymentError, { orderId: '12345', userId });

// Check logs in browser console (filtered by level)
// In production: sent to error tracking (Sentry if configured)
```

**2. Developer Helpers (Console)**
```typescript
// Available in browser console only
window.checkCarsStatus()    // Check Firestore car data
window.fixCarsStatus()      // Manual repair utility
window.__logger__           // Access logger instance directly
```

**3. Firebase Emulator UI**
- Navigate to http://localhost:4000
- Browse Firestore collections
- Run custom queries
- Inspect authentication state
- View Cloud Function logs

**4. React DevTools**
```typescript
// Install: "React Developer Tools" Chrome extension
// Features:
// - Inspect component tree and props
// - Track context changes
// - Profile rendering performance
// - Trigger re-renders manually
```

**5. Network Inspector (DevTools)**
```typescript
// Chrome DevTools → Network tab
// Filter by XHR/Fetch to see:
// - Firebase requests
// - Cloud Function calls
// - Algolia search queries
// - Check response times, payloads, errors
```

### Common Debugging Scenarios

**Problem**: "Provider not found" error
- **Cause**: Component using context outside of provider
- **Fix**: Check AppProviders.tsx wraps App root; verify provider order

**Problem**: Translation key shows as `'namespace.key'` (fallback)
- **Cause**: Missing translation in src/locales/translations.ts
- **Fix**: Add both `bg` and `en` keys for the language

**Problem**: Socket.io memory leak
- **Cause**: EventListener not cleaned up in useEffect
- **Fix**: Always `removeEventListener` in cleanup function

**Problem**: Build process slow (2-5 min)
- **Cause**: CRACO rebuilds entire app
- **Fix**: This is normal; use `npm run start:dev` for optimized memory

**Problem**: Firestore queries returning unexpected results
- **Cause**: Composite index missing or query constraints wrong
- **Fix**: Check firestore.indexes.json; deploy missing indexes via Firebase CLI

---

## ✨ Quick Tasks Guide

### Add a New Page
```typescript
// 1. Create page component
// src/pages/MyPage/index.tsx
import { useLanguage } from '@/contexts/LanguageContext';

export const MyPage = () => {
  const { t } = useLanguage();
  
  return (
    <div>
      <h1>{t('myPage.title')}</h1>
      {/* Use services for data, not direct fetches */}
    </div>
  );
};

// 2. Add route
// src/routes/AppRoutes.tsx or relevant route file
<Route path="/my-page" element={<MyPage />} />

// 3. Add translations (BOTH languages required!)
// src/locales/translations.ts
export const translations = {
  'myPage.title': { bg: 'Моята страница', en: 'My Page' },
};
```

### Add a New Service
```typescript
// 1. Create service
// src/services/my-service.ts
import { logger } from '@/services/logger-service';

export const myService = {
  async getData(id: string) {
    try {
      // Your logic here
      logger.info('Data fetched', { id });
      return data;
    } catch (error) {
      logger.error('Failed to fetch data', error, { id });
      throw error;
    }
  }
};

// 2. Use in component
import { myService } from '@/services/my-service';

useEffect(() => {
  myService.getData(id).then(setData);
}, [id]);
```

### Add a New Cloud Function
```typescript
// 1. Create function
// functions/src/my-domain/my-function.ts
import { onCall } from 'firebase-functions/v2/https';

export const myFunction = onCall(async (request) => {
  const { userId } = request.auth;
  const { data } = request.data;
  
  // Validate, process, return
  return { success: true, result: data };
});

// 2. Export in index.ts
// functions/src/index.ts
export { myFunction } from './my-domain/my-function';

// 3. Call from frontend
import { httpsCallable } from 'firebase/functions';
const myFunc = httpsCallable(functions, 'myFunction');
const result = await myFunc({ data: 'value' });
```

### Add Bilingual Content
```typescript
// 1. Always add BOTH languages in translations.ts
export const translations = {
  'feature.label': { 
    bg: 'Етикет на български', 
    en: 'Label in English' 
  },
  'feature.description': { 
    bg: 'Описание...', 
    en: 'Description...' 
  },
};

// 2. Use in component
const { t } = useLanguage();
<label>{t('feature.label')}</label>
<p>{t('feature.description')}</p>

// 3. Verify both languages work:
// - Toggle language in header
// - Check UI updates in real-time
```

### Deploy Changes
```bash
# 1. Commit to git
git add .
git commit -m "feat: add new feature"

# 2. Build & test
npm run build
npm run test

# 3. Deploy frontend
npm run deploy

# 4. Deploy functions (if changed)
npm run deploy:functions

# 5. Verify in production
# - Check Firebase Hosting URL
# - Test key workflows
# - Monitor logs via Firebase Console
```

---

1. **Provider Order**: Never reorder `AppProviders.tsx`—breaks auth/language/theme
2. **Translation Keys**: Missing BG or EN → fallback chain issues; add **both languages**
3. **Socket Cleanup**: Always `removeEventListener` in `useEffect` cleanup (prevents memory leaks)
4. **Location Fields**: Never use deprecated `location`, `city`, `region`—use `locationData` only
5. **Console Logs**: Never `console.*` in production—use `logger-service.ts` (enforced)
6. **Build Process**: CRACO disables ESLint; rely on TypeScript compiler for errors
7. **Service Duplication**: Extend existing services (103 exist) instead of creating duplicates
8. **Image Optimization**: Use optimized versions from `assets/` hierarchy
9. **Mobile Responsive**: Check `styles/mobile-responsive.css` for breakpoint overrides
10. **Archive Files**: Never auto-delete `ARCHIVE/`—manual review required before recreating features
11. **Monorepo Packages**: Paths (`@globul-cars/core`, `@globul-cars/services`) prepared in tsconfig but not yet fully implemented; currently use `src/services/`

---

## 📚 Essential Documentation

### Quick Start
- [DOCUMENTATION_ORGANIZED/MASTER_INDEX.md](DOCUMENTATION_ORGANIZED/MASTER_INDEX.md) ⭐ — Master index to all docs
- [README.md](README.md) — Project overview
- [START_HERE.md](DOCUMENTATION_ORGANIZED/01_ESSENTIAL/START_HERE.md) — Getting started guide
- [INDEX.md](INDEX.md) — Complete file index

### Guides
- [DEPLOYMENT_READY_INSTRUCTIONS.md](DOCUMENTATION_ORGANIZED/02_GUIDES/DEPLOYMENT_READY_INSTRUCTIONS.md) — Pre-flight deployment checklist
- [SECURITY.md](SECURITY.md) — Security policies + best practices
- [firestore.rules](firestore.rules) & [storage.rules](storage.rules) — Security rules

### Technical
- [ARCHITECTURE_GUIDE.md](DOCUMENTATION_ORGANIZED/03_TECHNICAL/architecture/ARCHITECTURE_GUIDE.md) — Detailed architecture
- [COMPLETE_REPAIR_PLAN_FINAL_DEC_15_2025.md](COMPLETE_REPAIR_PLAN_FINAL_DEC_15_2025.md) — Status report (96% complete)

### Firebase Configuration
- **Frontend**: `src/firebase/index.ts` (auto-detect long polling enabled, unlimited cache for offline-first)
- **Environment vars**: `.env` in `bulgarian-car-marketplace/` root (Firebase, hCaptcha, Google Maps, Algolia)
- **Never commit** `.env`; use `.env.example` for reference
- **App Check**: Currently disabled (can enable later if needed)

---

## 🧠 VS Code Context Tips for AI Agents

- **Start chats with `@workspace`** in Copilot Chat/Cursor to load full repo context
- **Keep these files open** in tabs to boost model priority:
  - `bulgarian-car-marketplace/src/providers/AppProviders.tsx`
  - `bulgarian-car-marketplace/src/routes/`
  - `bulgarian-car-marketplace/src/types/LocationData.ts`
  - `bulgarian-car-marketplace/src/services/logger-service.ts`
  - `functions/src/index.ts` + relevant domain folders
- **Why**: Models prioritize open tabs + recent edits for context retrieval

