# Copilot Instructions: Bulgarian Car Marketplace

**Updated:** January 16, 2026 | **Stack:** React 18.3 + TS 5.6 (strict) + Styled-Components | Firebase 12 | Algolia | Stripe  
**Project Size:** 795 components | 780+ TS files | 410+ services | 290 pages | 85+ routes | 195,000+ LOC

## 🚀 Essential Commands

```bash
npm start           # Dev server (port 3000, CRACO Webpack with memory cache)
npm run type-check  # ⚠️ REQUIRED before commits (strict TypeScript checks)
npm run build       # Prebuild: ban-console.js → TypeScript → minification
npm run deploy      # Firebase Hosting + Cloud Functions (Node.js 20)
npm run emulate     # Local Firebase emulators (Auth:9099, Firestore:8080, Functions:5001)
npm run clean:3000  # Kill stuck port 3000 (Windows: .\scripts\clean-ports.ps1)
npm run clean:all   # Nuclear clean (cache + node_modules + build artifacts)
npm test            # Jest + Testing Library (watch mode)
npm run test:ci     # CI mode (no watch, coverage)
```

**Windows Quick Scripts:** `.\scripts\START_SERVER.bat`, `.\scripts\RESTART_SERVER.bat`, `.\scripts\clean-ports.ps1`

## 🏗️ Critical Architecture Patterns (Non-Negotiable)

### 1. Firestore Listeners — ALWAYS Use `isActive` Flag

**Why:** Prevents "setState on unmounted component" errors (PROJECT_CONSTITUTION.md §4.3)

```typescript
useEffect(() => {
  let isActive = true; // ✅ REQUIRED guard
  const unsubscribe = onSnapshot(ref, snap => {
    if (!isActive) return; // ✅ Check BEFORE setState
    setState(snap.data());
  });
  return () => {
    isActive = false; // ✅ Set flag FIRST
    unsubscribe(); // ✅ Then cleanup
  };
}, []);
```

**Violations detected by:** `scripts/find-missing-cleanups.ts`

### 2. Logging — console.\* is BANNED in src/

**Enforcement:** `scripts/ban-console.js` blocks build if console.\* found

```typescript
// ✅ REQUIRED
import { logger } from '@/services/logger-service';
logger.info('action', { userId, context });
logger.error('failed', error, { metadata });

// ❌ BANNED (fails prebuild)
console.log('something'); // Build will fail
```

### 3. Numeric ID System — URLs Never Expose Firebase UIDs

**Pattern:** `/profile/:numericId`, `/car/:sellerId/:carId`, `/messages/:user1/:user2`

```typescript
// ✅ Always use service layer
import { UnifiedCarService } from '@/services/UnifiedCarService';
await UnifiedCarService.createCarListing(data, userProfile);

// Counter storage: Firestore counters/{uid}/cars
// Numeric mapping: numeric_ids collection
```

### 4. Multi-Collection Cars — Never Hardcode Collection Names

**6 Fixed Collections:** `passenger_cars`, `suvs`, `vans`, `motorcycles`, `trucks`, `buses`

```typescript
// ✅ REQUIRED
import { SellWorkflowCollections } from '@/services/sell-workflow-collections';
const collection =
  SellWorkflowCollections.getCollectionNameForVehicleType(vehicleType);

// ❌ NEVER
db.collection('passenger_cars'); // Hard-coded, breaks abstraction
```

## 🔑 Core Services (Use These, Don't Duplicate)

| Service                        | Purpose                        | Usage                                          |
| ------------------------------ | ------------------------------ | ---------------------------------------------- |
| `UnifiedCarService`            | Car CRUD + numeric IDs         | `createCarListing(data, userProfile)`          |
| `numeric-id-system.service`    | Numeric ID resolution for URLs | `getUserNumericId()`, `getCarNumericId()`      |
| `SellWorkflowCollections`      | Multi-collection management    | `getCollectionNameForVehicleType(type)`        |
| `AdvancedMessagingService`     | Real-time messaging (Phase 2)  | `sendMessage()`, `sendOfferMessage()`          |
| `OfferWorkflowService`         | Car offer workflow             | `createOffer()`, `acceptOffer()`               |
| `logger`                       | Structured logging             | Replace all `console.*` (auto-banned in build) |
| `bulgaria-locations.service`   | Location/city data             | `getCities()` - never hardcode locations       |
| `bulgarian-compliance-service` | EGN/EIK validation             | `validateEGN()`, `validateEIK()`               |

**Service Architecture:** 410+ services in `src/services/` organized by domain:

- **Pattern:** `[domain]-[category].ts` or `[domain].service.ts`
- **Complex features:** Split into `-data.ts`, `-operations.ts`, `-types.ts`
- **Examples:** `autonomous-resale-*.ts` (5 files), `advanced-user-management-*.ts` (4 files)

## 📋 Essential Patterns (Copy-Paste Ready)

### Pattern 1: Firebase Listeners (CRITICAL - Prevents Memory Leaks)

```typescript
useEffect(() => {
  let isActive = true;
  const unsubscribe = onSnapshot(query, snap => {
    if (!isActive) return; // ✅ REQUIRED
    setState(snap.data());
  });
  return () => {
    isActive = false;
    unsubscribe();
  };
}, []);
```

### Pattern 2: Numeric URL Resolution

```typescript
// URLs: /profile/18, /car/1/5, /messages/18/42
import {
  getUserNumericId,
  getCarNumericId,
} from '@/services/numeric-id-system.service';

const userNumericId = params.numericId;
const userId = await getUserNumericId(userNumericId);
```

### Pattern 3: Multi-Collection Car Queries

```typescript
import { SellWorkflowCollections } from '@/services/sell-workflow-collections';

const collectionName =
  SellWorkflowCollections.getCollectionNameForVehicleType('passenger_cars');
// ❌ NEVER: db.collection('passenger_cars')
```

### Pattern 4: Plan Limit Enforcement

```typescript
import { canAddListing } from '@/utils/listing-limits';

if (!(await canAddListing(userId))) {
  throw new Error('Plan limit reached'); // free: 3, dealer: 10, company: ∞
}
```

### Pattern 5: Context-First State (No Redux)

```typescript
import { useAuth, useLanguage, useProfileType, useTheme } from '@/contexts';

// Available contexts: AuthContext, LanguageContext, ProfileTypeContext,
// ThemeContext, FilterContext, LoadingContext
const { user } = useAuth();
```

## 📬 Real-Time Messaging Architecture (Phase 2 Complete)

### Entry Points & Implementation

- **Legacy Route**: `/messages/:senderId/:recipientId` (Firestore-based, deprecated)
- **New Route**: `/messages-v2?channel=channelId` (Realtime DB, production)
- **Page**: `src/pages/03_user-messages/MessagesPage.tsx` (1,071 lines)
- **Service**: `src/services/advanced-messaging.service.ts` (350 lines, legacy)
- **New Hook**: `src/hooks/messaging/useRealtimeMessaging.ts` (production)

### Hybrid Architecture (Phase 3 Active)

**Realtime Database Structure:**

```
/channels/{channelId}/
  ├── buyerNumericId: 5
  ├── sellerNumericId: 18
  ├── carNumericId: 42
  ├── messages/{messageId}/...
  └── metadata/...

/presence/{numericId}/
  ├── online: true
  ├── lastSeen: timestamp
  └── currentPage: string

/typing/{channelId}/{numericId}/
  └── isTyping: boolean
```

**Channel ID Pattern (Deterministic):**

```typescript
// Format: msg_{min(user1,user2)}_{max(user1,user2)}_car_{carId}
// Example: msg_5_18_car_42
```

### Key Features

- ✅ Unified Messaging System (solved 2-system duplication in Phase 1)
- ✅ Real-time listeners with `isActive` flag (prevents memory leaks)
- ✅ Offer workflow integration (`sendOfferMessage()`)
- ✅ Mark as read + conversation archiving per-user
- ✅ File upload validation (size, type, security checks)
- ✅ Search & filtering with SearchManager
- ✅ Presence tracking (online/offline/last seen)
- ✅ Typing indicators (realtime)
- ✅ FCM push notifications

### Production Usage

```typescript
import { useRealtimeMessaging } from '@/hooks/messaging/useRealtimeMessaging';

const {
  channels, // List of all channels
  currentChannel, // Active channel
  messages, // Messages in current channel
  isLoading, // Loading state
  sendMessage, // Send text message
  sendOffer, // Send offer message
  selectChannel, // Switch channel
  markAsRead, // Mark messages as read
} = useRealtimeMessaging(numericId, firebaseId, {
  autoMarkAsRead: true,
});
```

### When Working on Messaging

1. **Always use `useRealtimeMessaging` hook** for production code
2. **Numeric ID resolution** happens in entry point before hook
3. **Status updates** go through `MessageOperations` (read/delete/archive)
4. **Offers** integrated with `OfferWorkflowService`
5. **File uploads** validated before storage (no direct Firebase calls)
6. **Presence tracking** automatic via hook initialization
7. **Typing indicators** managed by `typing-indicator.service.ts`

---

## 💳 Subscription System (Phase 2 Complete) - Updated Jan 16, 2026

## 💳 Subscription System (Phase 3 Complete) - Updated Jan 16, 2026

### 🔄 PAYMENT SYSTEM MIGRATION (January 16, 2026)

**Status:** ✅ Manual Bank Transfer System ACTIVE (iCard + Revolut)  
**Previous:** Stripe automated billing (DISABLED)  
**Current:** Manual bank transfers with admin verification

### Payment Methods

| Method      | Bank             | IBAN                     | Speed     | Region                   |
| ----------- | ---------------- | ------------------------ | --------- | ------------------------ |
| **iCard**   | iCard/myPOS      | BG98INTF40012039023344   | 1-2 hours | Bulgaria (BLINK support) |
| **Revolut** | Revolut Bank UAB | LT44 3250 0419 1285 4116 | Instant   | International            |

**Beneficiary:** Alaa Al-Hamadani  
**Contact:** support@mobilebg.eu | +359 87 983 9671

### Plans & Limits (Current)

| Plan        | Max Ads | Team Members | Monthly     | Annual   |
| ----------- | ------- | ------------ | ----------- | -------- |
| **Free**    | 3       | 0            | €0          | €0       |
| **Dealer**  | 30      | 3            | **€20.11**  | **€193** |
| **Company** | ∞       | 10           | **€100.11** | **€961** |

**Price Rules:**

- Monthly: Always ends with `.11` (e.g., 20.11, 100.11)
- Annual: Whole numbers (20% discount applied)
- Payment method: Manual bank transfer only
- Processing: 1-2 hours after verification

### Core Services (Updated)

| Service                            | Purpose                    | File Path                               |
| ---------------------------------- | -------------------------- | --------------------------------------- |
| `bank-details`                     | Bank account configuration | `src/config/bank-details.ts`            |
| `payment.types`                    | Payment type definitions   | `src/types/payment.types.ts`            |
| `AdminManualPaymentsDashboard`     | Payment verification UI    | `src/pages/09_admin/manual-payments/`   |
| ⚠️ `stripe-extension` (DEPRECATED) | Legacy Stripe config       | `src/config/stripe-extension.config.ts` |

### Admin Payment Workflow

1. **User initiates payment** → Selects bank (iCard/Revolut) + receives reference
2. **User transfers money** → Sends IBAN transfer with reference number
3. **Admin verifies** → Checks transaction in `/admin/manual-payments`
4. **Status update** → Verifies payment → Activates subscription
5. **User notified** → Email confirmation of activation

### Current Pricing (Manual Bank Transfer)

```typescript
import { BANK_DETAILS } from '@/config/bank-details';

// iCard (Bulgaria)
BANK_DETAILS.icard.iban; // BG98INTF40012039023344
BANK_DETAILS.icard.bic; // INTFBGSF
BANK_DETAILS.icard.supportsInstant; // true (BLINK)

// Revolut (International)
BANK_DETAILS.revolut.iban; // LT44 3250 0419 1285 4116
BANK_DETAILS.revolut.bic; // REVOLT21
BANK_DETAILS.revolut.revtag; // @hamdanialaa
```

### Usage Patterns (Updated)

```typescript
// ❌ OLD (Stripe - DISABLED)
import { subscriptionService } from '@/services/billing/subscription-service';
await subscriptionService.createCheckoutSession(...);

// ✅ NEW (Manual Bank Transfer)
import { BANK_DETAILS } from '@/config/bank-details';
import { generatePaymentReference } from '@/config/bank-details';

const reference = generatePaymentReference('subscription', 'dealer');
// Returns: GLOBUL-SUB-dealer-1704835200

// Redirect user to payment instructions
window.location.href = '/billing/manual-payment?plan=dealer&reference=' + reference;
```

### Payment Status Lifecycle

```
pending_manual_verification
    ↓
verified (by admin)
    ↓
completed (subscription activated)

OR

rejected (by admin with reason)
    ↓
expired (after 7 days if not verified)
```

### Firestore Collections

```
manual_payments/
  ├── {transactionId}/
  │   ├── userId: string
  │   ├── amount: number
  │   ├── selectedBankAccount: 'revolut' | 'icard'
  │   ├── status: PaymentStatus
  │   ├── createdAt: timestamp
  │   └── verifiedAt: timestamp

user_subscriptions/
  ├── {userId}/
  │   ├── active: Subscription
  │   └── history: Subscription[]
```

### Admin Dashboard

**Route:** `/admin/manual-payments`  
**File:** `src/pages/09_admin/manual-payments/AdminManualPaymentsDashboard.tsx`

Features:

- ✅ View pending transactions
- ✅ Verify bank transfers
- ✅ Mark as completed/rejected
- ✅ Generate payment reports
- ✅ Manual subscription activation

### Key Changes from Stripe

| Aspect  | Stripe          | Manual Transfer         |
| ------- | --------------- | ----------------------- |
| Setup   | Dashboard + API | Admin verification only |
| Speed   | Instant         | 1-2 hours               |
| Cost    | 2-3% fee        | No fees                 |
| Refunds | Automatic       | Manual                  |
| Support | Stripe          | Revolut + iCard         |

### Important: DO NOT USE

❌ Never use these deprecated Stripe configurations:

```typescript
import { STRIPE_PRICE_IDS } from '@/config/stripe-extension.config.ts';  // DEPRECATED
import { STRIPE_FUNCTIONS } from '@/config/stripe-extension.config.ts';   // DEPRECATED
subscriptionService.createCheckoutSession(...)  // DEPRECATED - causes errors
```

### For More Information

- 📚 Full migration guide: `PAYMENT_SYSTEM_MIGRATION_JAN16_2026.md`
- 🏦 Bank details config: `src/config/bank-details.ts`
- 💬 Quick guide (Arabic): `PAYMENT_SYSTEM_QUICK_GUIDE_AR.md`
- 🎯 Admin dashboard: `src/pages/09_admin/manual-payments/AdminManualPaymentsDashboard.tsx`

---

## 🤖 AI Integration System

### AI Router (Multi-Provider Resilience)

**Service**: `src/services/ai/ai-router.service.ts`

**Providers**:

1. **Google Gemini** - Primary (auto-generate descriptions, image analysis)
2. **OpenAI** - Fallback (GPT-4 for complex queries)
3. **DeepSeek** - Alternative (cost optimization)

**Usage**:

```typescript
import { AIRouter } from '@/services/ai/ai-router.service';

const response = await AIRouter.generate({
  task: 'description',
  input: carData,
  options: { language: 'bg', maxTokens: 500 },
});
```

### Key AI Services

| Service                                    | Purpose                           | Location                               |
| ------------------------------------------ | --------------------------------- | -------------------------------------- |
| `ai-router.service.ts`                     | Multi-provider router             | `services/ai/`                         |
| `gemini-vision.service.ts`                 | Image analysis (damage detection) | `services/ai/`                         |
| `vehicle-description-generator.service.ts` | Auto-generate descriptions        | `services/ai/`                         |
| `whisper.service.ts`                       | Voice recognition (search)        | `services/ai/`                         |
| `nlu-multilingual.service.ts`              | Natural language understanding    | `services/ai/`                         |
| `ai-cost-optimizer.service.ts`             | Cost tracking & optimization      | `services/ai/`                         |
| `AutonomousResaleEngine`                   | Resale value analysis             | `services/autonomous-resale-engine.ts` |

### AI-Powered Features

- ✅ Auto-generated car descriptions (Gemini)
- ✅ Image damage detection (Gemini Vision)
- ✅ Voice search (Whisper)
- ✅ Visual search (upload photo → find similar cars)
- ✅ Smart search suggestions (NLU)
- ✅ Resale value predictions (autonomous engine)

---

## 🎨 Design System & UI Standards

### Theme: Glassmorphism

**File**: `src/styles/global-glassmorphism-buttons.css`

**Characteristics**:

- Frosted glass effects (`backdrop-filter: blur(10px)`)
- Semi-transparent backgrounds (`rgba(255, 255, 255, 0.1)`)
- Subtle shadows & borders
- Smooth animations (Framer Motion)

### Smart Text Colors (WCAG AAA)

**System**: `SMART_TEXT_COLOR_SYSTEM.md`

- Automatically adjusts text color based on background
- WCAG AAA compliance (contrast ratio 7:1)
- Dynamic calculation for all UI elements

### Responsive Breakpoints

```typescript
const breakpoints = {
  mobile: '480px', // Phones
  tablet: '768px', // Tablets
  laptop: '1024px', // Laptops
  desktop: '1440px', // Large screens
};
```

### Image Standards

- **Format**: WebP only (enforced)
- **Optimization**: `browser-image-compression` + Cloud Function
- **Lazy Loading**: Native `loading="lazy"` + React.lazy
- **Max Images**: 20 per car listing
- **Cloud Function**: `functions/src/image-optimizer.ts`

### Icons

- **Library**: Lucide React (primary)
- **Custom**: `assets/images/professional_car_logos/` (brand logos)

### Typography

**Responsive Scale**:

- Desktop: `0.95rem` (base)
- Tablet: `0.85rem`
- Mobile: `0.6rem`

---

## 🚗 Car Listing & Multi-Collection System

### 6 Collections (Fixed - Never Add More)

```
passenger_cars   → Regular cars
suvs             → SUVs/Crossovers
vans             → Commercial vans
motorcycles      → Bikes/scooters
trucks           → Heavy vehicles
buses            → Transport vehicles
```

### Numeric ID System (Critical Data Model)

```typescript
// Instead of exposing Firebase UIDs in URLs:
// ❌ /car/abc123def456ghi789jkl
// ✅ /car/1/5  → user 1's 5th car

// Implementation:
counters/{userId}/cars → Counter document per user
numeric_ids collection → Maps numeric → Firebase UID
```

### Sell Workflow Route Structure

- `/sell/vehicle-type` → Vehicle type selection
- `/sell/basic` → Title, year, mileage
- `/sell/features` → Condition, equipment
- `/sell/description` → AI-assisted description editor
- `/sell/pricing` → Market value + manual price
- `/sell/images` → Multi-image upload (WebP only)
- `/sell/review` → Final review & publish

---

## 📊 Data Flow & External Integrations

### Search Architecture (Hybrid: Firestore + Algolia)

**Strategy**: Use Firestore for real-time data, Algolia for advanced search features

**Services**:

- `services/search/smart-search.service.ts` - Main search coordinator
- `services/search/UnifiedSearchService.ts` - Unified interface (Firestore + Algolia)
- `services/search/algoliaSearchService.ts` - Algolia integration
- `services/search/bulgarian-synonyms.service.ts` - Bulgarian language synonyms
- `services/search/ai-query-parser.service.ts` - AI-powered query parsing

**Components**:

- `components/Search/SmartAutocomplete.tsx` - Smart autocomplete with suggestions
- `components/Search/SearchFilters.tsx` - Advanced filtering UI
- `components/visual-search/VisualSearchUpload.tsx` - Visual search (upload photo)
- `components/voice-search/VoiceSearchButton.tsx` - Voice search

**Frontend**: React Instantsearch + custom FilterContext

**Sync**: Cloud Function `syncCarsToAlgolia.ts` (automatic)

### Firebase Backend Structure

**Firestore Collections**:

- **6 Fixed Collections**: `passenger_cars`, `suvs`, `vans`, `motorcycles`, `trucks`, `buses`
- **Counter System**: `counters/{uid}/cars` for numeric IDs
- **Numeric Mapping**: `numeric_ids` collection for URL resolution
- **Users**: `users/{uid}` with numeric ID mapping
- **Favorites**: `favorites/{uid}/cars/{carId}`
- **Reviews**: `reviews/{carId}/reviews/{reviewId}`
- **Notifications**: `notifications/{uid}/items/{notifId}`

**Realtime Database**:

- **Channels**: `/channels/{channelId}/` (messaging)
- **Presence**: `/presence/{numericId}/` (online status)
- **Typing**: `/typing/{channelId}/{numericId}/` (typing indicators)

**Cloud Storage**:

- Car images: `cars/{carId}/{imageId}.webp`
- Documents: `documents/{userId}/{docId}.pdf`
- **Format**: WebP-only for images

**Cloud Functions**: Background jobs (Node.js 20)

- **24 Functions total**
- **Categories**: AI, SEO, notifications, lifecycle events
- **Key Functions**:
  - `ai/` - AI services (Gemini, DeepSeek, OpenAI)
  - `seo/` - Sitemap, merchant feed, structured data
  - `notifications/` - FCM push notifications
  - `triggers/car-lifecycle.ts` - Car creation/update/delete triggers
  - `syncCarsToAlgolia.ts` - Algolia sync
  - `image-optimizer.ts` - Image optimization
- **Deploy**: `npm run deploy:functions`

**Authentication**:

- Email/Password
- OAuth: Google, Facebook
- Custom claims for role-based access

**Hosting**:

- SPA with rewrites for sitemap & merchant feed
- Firebase Hosting with CDN
- Custom domain: mobilebg.eu

### Emulator Setup

```bash
npm run emulate  # Start Firebase emulators
# Auth: localhost:9099
# Functions: localhost:5001
# Firestore: localhost:8080
# Hosting: localhost:5002
```

### Scripts Directory (100+ Automation Scripts)

**Key Scripts**:

- `ban-console.js` → Enforces logger-service usage (prebuild)
- `clean-all.js` / `clean-port-3000.js` → Port & cache cleanup
- `train-ai-on-project.js` → AI training on codebase
- `migrate-dealer-limits.ts` → Database migrations
- `sync-algolia.js` → Sync Firestore → Algolia
- `analyze-bundle-size.js` → Bundle analysis
- `verify-firebase-connection.js` → Connection diagnostics

**Script Categories**:

- **Migrations**: `migrate-*.js/ts` (dealer limits, legacy cars)
- **Diagnostics**: `diagnose-*.js/ts`, `check-*.js/ts`
- **Fixing**: `fix-*.js` (imports, styles, components)
- **Analysis**: `analyze-*.js`, `scan-*.js`
- **Deployment**: `deploy-*.sh/ps1`

## 🐛 Debugging Quick Fixes

| Issue                   | Fix                                                                                 |
| ----------------------- | ----------------------------------------------------------------------------------- |
| "setState on unmounted" | Add `isActive` flag to listener                                                     |
| Console errors in build | Remove console.\* or use logger                                                     |
| Jest tests failing      | Check `src/__mocks__/firebase/firebase-config.ts`                                   |
| Path aliases broken     | Sync tsconfig + craco + jest configs                                                |
| Port 3000 stuck         | `npm run clean:3000` or `scripts/clean-ports.ps1` (Windows)                         |
| Cache issues            | `npm run clean:all` then restart                                                    |
| Firestore limits        | Check composite indexes in [FIRESTORE_INDEXES_GUIDE.md](FIRESTORE_INDEXES_GUIDE.md) |
| Hot reload not working  | Clear dev cache with `scripts/clear-dev-caches.ps1`                                 |
| Build failing           | Run `npm run type-check` first, then check `scripts/ban-console.js` output          |
| Firebase 401 errors     | Run `scripts/verify-firebase-connection.js`                                         |

### Windows-Specific Issues

**Port Cleanup (Windows)**:

```powershell
# PowerShell scripts available
.\scripts\clean-ports.ps1        # Clean all dev ports
.\scripts\clear-dev-caches.ps1   # Clear development caches
.\scripts\deploy-phase2.ps1      # Deployment helper
```

**Quick Restart (Windows)**:

```bash
# Batch files for quick actions
.\scripts\START_SERVER.bat       # Start dev server
.\scripts\RESTART_SERVER.bat     # Restart with cache clear
.\scripts\QUICK_REBUILD.bat      # Clean rebuild
```

## 🛠️ Build System & Configuration

### TypeScript Configuration (STRICT MODE)

**Critical Rules:**

1. **Prebuild Check:** `npm run type-check` before commits
2. **Target:** ES2017 (broad compatibility)
3. **Strict Mode:** Enabled in `tsconfig.json`
4. **Workflow:** Edit → Type Check → Build → Test → Deploy

### CRACO Configuration (Custom Webpack)

- **Dev Cache**: Memory-based (fastest, no disk I/O)
- **Production**: Minification disabled for debugging
- **ModuleScopePlugin**: Removed to allow monorepo imports
- **Path Aliases**: Configured in `tsconfig.json`, `craco.config.js`, `jest.config.js`
- **Dev Server**: Port 3000 (localhost), hot reload enabled, aggressive cache invalidation

### Path Aliases — Sync 3 Files When Adding New Aliases

When adding `@/newAlias/*`, update:

- `tsconfig.json` (TypeScript)
- `craco.config.js` (Webpack)
- `jest.config.js` (Testing)

**Available Path Aliases**:

```typescript
@/components/*  → src/components/*
@/services/*    → src/services/*
@/pages/*       → src/pages/*
@/hooks/*       → src/hooks/*
@/types/*       → src/types/*
@/contexts/*    → src/contexts/*
@/utils/*       → src/utils/*
@/features/*    → src/features/*
@/assets/*      → src/assets/*
@/firebase/*    → src/firebase/*
@/config/*      → src/config/*
@/constants/*   → src/constants/*
@/data/*        → src/data/*

// Monorepo packages (if present)
@globul-cars/core/*      → packages/core/src/*
@globul-cars/services/*  → packages/services/src/*
```

### Firestore Query Optimization (Required)

- Use `firebase-cache.service` to reduce cross-partition queries
- Add composite indexes for multi-field filters
- Reference [FIRESTORE_INDEXES_GUIDE.md](FIRESTORE_INDEXES_GUIDE.md)

### Routing — Use safeLazy() for Code Splitting

```typescript
import { safeLazy } from '@/utils/lazyImport';
const MyPage = safeLazy(() => import('@/pages/MyPage'));
// Routes in: src/routes/*.routes.tsx (MainRoutes.tsx, auth.routes.tsx, admin.routes.tsx, etc.)
```

### Component Organization

- **Reusable**: `src/components/` (441 components)
- **Page-specific**: `src/pages/*/components/`
- **Always use**: `React.memo()` for expensive renders

### Contexts (6 Total - No Redux)

```typescript
AuthContext; // User auth state
LanguageContext; // i18n (bg/en)
ProfileTypeContext; // free/dealer/company
ThemeContext; // Dark/light mode
FilterContext; // Search filters
LoadingContext; // Global loading state
```

### Bulgarian Market Constraints (Hardcoded Checks)

- **Currency**: EUR only (validation in `bulgarian-config`)
- **Phone**: +359 prefix required (validation in forms)
- **Cities**: Use `bulgaria-locations.service.ts` (never hardcode)
- **i18n**: `useLanguage()` hook + `src/locales/{bg,en}` JSON files
- **EGN/EIK**: Validate with `bulgarian-compliance-service.ts`

### Testing & Validation

**Test Structure**:

- **Unit Tests**: Jest + Testing Library
- **Mock Files**: `src/__mocks__/firebase/firebase-config.ts`
- **Test Commands**:
  - `npm test` → Watch mode
  - `npm run test:ci` → CI mode (no watch, coverage)
  - `npm run test:profile-stats` → Profile system tests

**TypeScript Strict Mode**:

- Always run `npm run type-check` before commits
- `strict: true` in `tsconfig.json`
- Target: ES2017 for broad compatibility

### Naming Conventions (STRICT)

**Components**: PascalCase (e.g., `CarCard.tsx`, `SearchWidget.tsx`)  
**Functions/Variables**: camelCase (e.g., `handleSearch`, `userData`)  
**Constants**: UPPER_SNAKE_CASE (e.g., `MAX_UPLOAD_SIZE`, `API_ENDPOINT`)  
**Types/Interfaces**: PascalCase (e.g., `UserProfile`, `CarData`)  
**Contexts**: PascalCase + Context (e.g., `AuthContext`, `ThemeContext`)  
**Services**: kebab-case.service.ts (e.g., `car.service.ts`, `numeric-id-system.service.ts`)

## 📚 Key Documentation

- [PROJECT_CONSTITUTION.md](PROJECT_CONSTITUTION.md) — Architectural rules & project stats
- [MESSAGING_SYSTEM_FINAL.md](MESSAGING_SYSTEM_FINAL.md) — Unified messaging (Phase 1 & 2)
- [src/routes/README.md](src/routes/README.md) — Route definitions by feature
- [FIRESTORE_INDEXES_GUIDE.md](FIRESTORE_INDEXES_GUIDE.md) — Required composite indexes
- [DOCUMENTATION_INDEX.md](DOCUMENTATION_INDEX.md) — Complete docs index
