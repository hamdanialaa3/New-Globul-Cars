# CODEBASE.md — Koli One Complete Project Knowledge Base

> **Read this file to understand the ENTIRE project in one pass.**
> Any AI model reading this document will have full context for every service, hook, page, integration, rule, and convention in the Koli One codebase.

---

## 1. Project Identity

| Field         | Value                                                               |
| ------------- | ------------------------------------------------------------------- |
| **Name**      | Koli One (Коли-Уан)                                                 |
| **URL**       | https://koli.one                                                    |
| **Type**      | Vehicle marketplace (cars, motorcycles, trucks, buses, boats, etc.) |
| **Region**    | Bulgaria (4 cities: Sofia, Plovdiv, Varna, Burgas)                  |
| **Languages** | Bulgarian (primary), English, Arabic                                |
| **Currency**  | EUR                                                                 |
| **Status**    | Production — active development                                     |
| **Repos**     | `New-Globul-Cars` (web + functions), `Koli-One-Mobile` (mobile)     |

### Tech Stack

| Layer              | Technology                                                               |
| ------------------ | ------------------------------------------------------------------------ |
| **Frontend**       | React 18, TypeScript 5.6, Styled-Components 6, Vite                      |
| **State**          | Context API + Zustand (NO Redux)                                         |
| **Routing**        | React Router DOM 7.9                                                     |
| **Backend**        | Firebase (Firestore, Auth, Cloud Functions Node.js 20, Storage, Hosting) |
| **Search**         | Hybrid Firestore + Algolia                                               |
| **Messaging**      | Firebase Realtime Database v2                                            |
| **AI**             | Gemini, DeepSeek, OpenAI (via `ai-router.service.ts`)                    |
| **Payments**       | Manual bank transfers + Stripe                                           |
| **Mobile**         | Expo Router (React Native) in `mobile_new/`                              |
| **Monitoring**     | Sentry, Firebase Analytics, Google Analytics 4                           |
| **Bot Protection** | hCaptcha                                                                 |
| **Forms**          | React Hook Form + Zod                                                    |
| **Animations**     | Framer Motion                                                            |
| **Icons**          | Lucide React                                                             |

### Project Scale

- **795 React Components** (.tsx)
- **780+ TypeScript Services** (.ts)
- **290 Pages**, **85+ Routes**
- **40+ Custom Hooks**
- **9 Context Providers**
- **24+ Cloud Functions**
- **195,000+ Lines of Code**
- **12+ Vehicle Collections** in Firestore

---

## 2. Monorepo Structure

```
Koli_One_Root/
├── src/                    # Web app source (React SPA)
│   ├── components/         # 200+ UI components by feature
│   ├── services/           # 140+ domain services (see §5)
│   ├── hooks/              # 40+ custom hooks (see §6)
│   ├── pages/              # 290 pages in 14 categories (see §7)
│   ├── contexts/           # 9 context providers (see §8)
│   ├── config/             # Feature flags, Firebase, bank details, keys
│   ├── types/              # TypeScript interfaces (car, user, payment, etc.)
│   ├── routes/             # MainRoutes, NumericCarRedirect, NumericProfileRouter
│   ├── providers/          # AppProviders, StripeProvider, Theme/Language wiring
│   ├── layouts/            # MainLayout, FullScreenLayout
│   ├── features/           # 10 feature modules (ads, billing, car-listing, etc.)
│   ├── utils/              # 40+ helpers (analytics, validation, routing)
│   ├── styles/             # Theme, CSS, design tokens
│   ├── i18n/               # Internationalization (BG/EN)
│   ├── firebase/           # Firebase config, auth, analytics
│   ├── workers/            # Web Workers for async operations
│   ├── design-system/      # theme.ts
│   └── data/               # Static data files
├── functions/              # Firebase Cloud Functions (Node.js 20 backend)
│   └── src/
│       ├── triggers/       # Firestore & Auth triggers
│       ├── scheduled/      # Cron jobs (archive, backup)
│       ├── api/            # HTTP endpoints (Stripe, SEO)
│       ├── notifications/  # FCM notifications
│       ├── services/       # Backend-only services
│       └── index.ts        # All function exports
├── mobile_new/             # Expo Router mobile app
│   ├── app/                # File-based routing (tabs, auth, details)
│   └── src/                # Mobile components, services, hooks, types
├── shared/                 # Code shared between web & mobile
│   └── src/types/          # Shared TypeScript types
├── schemas/                # JSON Schema definitions (User, Listing, Story, Campaign)
├── scripts/                # Build, cleanup, deploy, migration scripts
├── docs/                   # Developer documentation (20+ guides)
├── documents/              # Feature specs & mobile specs
├── governance/             # Change approval, release policy
├── ops/                    # Operational playbooks
├── ml/                     # ML datasets and model registries
├── DDD/                    # Archived deleted files (never delete, move here)
├── CONSTITUTION.md         # 18-article governance framework (source of truth)
├── CODEBASE.md             # THIS FILE — complete project knowledge
├── .cursorrules            # AI assistant rules
└── .github/copilot-instructions.md  # GitHub Copilot rules
```

---

## 3. Non-Negotiable Rules (CRITICAL — DO NOT VIOLATE)

### Rule 1: Numeric ID System (Privacy)

- **NEVER** expose Firebase UIDs in public URLs
- User URL: `/profile/:numericId` or `/u/:numericId/:slug`
- Car URL: `/car/:sellerNumericId/:carNumericId` or `/car/:numericId/:slug`
- Services: `numeric-id-lookup.service.ts`, `numeric-car-system.service.ts`
- Guard: `NumericIdGuard.tsx` redirects invalid URLs

### Rule 2: 6-Collection Vehicle Pattern

- **NEVER** hardcode collection names
- Collections: `passenger_cars`, `suvs`, `vans`, `motorcycles`, `trucks`, `buses`, `construction_machines`, `agricultural_machines`, `trailers`, `campers`, `forklifts`, `boats`
- Always use: `SellWorkflowCollections.getCollectionNameForVehicleType(type)`
- Source: `src/services/sell-workflow-collections.ts`

### Rule 3: Firestore Listener `isActive` Guard

- **ALWAYS** use `isActive` flag to prevent state updates after unmount

```typescript
useEffect(() => {
  let isActive = true;
  const unsubscribe = onSnapshot(ref, snap => {
    if (!isActive) return; // Critical check
    setState(snap.data());
  });
  return () => {
    isActive = false;
    unsubscribe();
  };
}, []);
```

### Rule 4: No console.\* in src/

- Build system blocks it (`scripts/ban-console.js`)
- Use `src/services/logger-service.ts` instead

### Rule 5: No File Deletion

- Move deprecated files to `DDD/` for historical reference

### Rule 6: Path Aliases

- Use `@/...` imports (configured in `tsconfig.json`)
- Avoid deep relative paths like `../../../`

### Rule 7: Tests Need Provider Wrappers

- All tests require `ThemeProvider + LanguageProvider`
- See `docs/testing/README.md`

---

## 4. Data Architecture

### 4.1 Firestore Collections

| Collection                | Purpose                                                       |
| ------------------------- | ------------------------------------------------------------- |
| `users`                   | User profiles (numericId, slug, profile, trust, verification) |
| `passenger_cars`          | Sedans, hatchbacks, coupes                                    |
| `suvs`                    | SUVs, crossovers                                              |
| `vans`                    | Vans, minivans                                                |
| `motorcycles`             | Motorcycles                                                   |
| `trucks`                  | Trucks                                                        |
| `buses`                   | Buses                                                         |
| `construction_machines`   | Construction equipment                                        |
| `agricultural_machines`   | Agricultural equipment                                        |
| `trailers`                | Trailers                                                      |
| `campers`                 | Campers/RVs                                                   |
| `forklifts`               | Forklifts                                                     |
| `boats`                   | Boats                                                         |
| `favorites`               | User's saved cars                                             |
| `workflow_drafts`         | Auto-saved listing drafts                                     |
| `channels`                | Messaging channels (participants, unread counts)              |
| `messages`                | Message content (per channel)                                 |
| `subscriptions`           | User subscriptions                                            |
| `notifications`           | User notifications                                            |
| `admins` / `super_admins` | Admin permissions                                             |
| `analytics_events`        | Event logs                                                    |
| `bulk_jobs`               | Dealer bulk upload jobs                                       |

### 4.2 Realtime Database (Messaging)

```
channels/
  {channelId}/                    # Format: msg_{sellerNumId}_{buyerNumId}_car_{carNumId}
    metadata: { ... }
    messages/
      {messageId}: { content, timestamp, sender, read }
```

### 4.3 Firebase Storage

- **Images**: Max 10MB, `image/*` type, organized by user ID
- **Videos**: Max 50MB, `video/*` type
- **Ownership**: Users access only their own uploads
- Auto-optimized to WebP with responsive sizes via Cloud Function

### 4.4 Schemas (in `schemas/`)

- `User.json` — User profiles with numeric IDs and slugs
- `Listing.json` — Vehicle listings with SEO-friendly URLs
- `Story.json` — User-generated content
- `Campaign.json` — Marketing campaigns
- `taxonomy.v1.json` — Vehicle brands, models, generations, trims
- `api/openapi.yaml` — OpenAPI 3.0 specification

---

## 5. Services Catalog (src/services/)

### 5.1 AI & Machine Learning (`ai/`)

| Service                                    | Purpose                                                 |
| ------------------------------------------ | ------------------------------------------------------- |
| `ai-router.service.ts`                     | Routes between Gemini/DeepSeek based on task complexity |
| `gemini-chat.service.ts`                   | Gemini LLM for conversational AI (Bulgarian support)    |
| `deepseek-enhanced.service.ts`             | DeepSeek AI for advanced analysis                       |
| `openai.service.ts`                        | OpenAI GPT-4 for premium features                       |
| `ai-quota.service.ts`                      | AI usage quota management                               |
| `ai-cost-optimizer.service.ts`             | AI cost tracking and provider switching                 |
| `gemini-vision.service.ts`                 | Image analysis via Gemini Vision                        |
| `whisper.service.ts`                       | Speech-to-text (OpenAI Whisper)                         |
| `vehicle-description-generator.service.ts` | AI vehicle description generation                       |
| `ai-pipeline.service.ts`                   | Orchestrates: pre-check → generate → validate           |
| `project-knowledge.service.ts`             | RAG system for context-aware responses                  |
| `security-monitor.ts`                      | Detects suspicious AI usage                             |
| `nlu-multilingual.service.ts`              | Multi-language NLU                                      |
| `sentiment-analysis.service.ts`            | Content sentiment analysis                              |
| `firebase-ai-callable.service.ts`          | Secure server-side AI calls via Cloud Functions         |

### 5.2 Search & Discovery (`search/`)

| Service                             | Purpose                                               |
| ----------------------------------- | ----------------------------------------------------- |
| `UnifiedSearchService.ts`           | Main search hub (Firestore + Algolia hybrid)          |
| `smart-search.service.ts`           | Intelligent keyword search with Bulgarian synonyms    |
| `queryOrchestrator.ts`              | Routes queries between Algolia and Firestore          |
| `firestoreQueryBuilder.ts`          | Builds optimized Firestore queries across collections |
| `multi-collection-helper.ts`        | Searches across all vehicle type collections          |
| `ai-query-parser.service.ts`        | NLP-powered query parsing                             |
| `saved-searches-alerts.service.ts`  | Alerts when new listings match saved searches         |
| `pagination.service.ts`             | Search result pagination                              |
| `browser-cache-strategy.service.ts` | Client-side search caching                            |
| `bulgarian-synonyms.service.ts`     | Bulgarian language synonym expansion                  |
| `search-personalization.service.ts` | Personalized results                                  |
| `search-history.service.ts`         | User search history tracking                          |

### 5.3 Messaging (`messaging/`)

| Service                                  | Purpose                           |
| ---------------------------------------- | --------------------------------- |
| `messaging-facade.ts`                    | Unified messaging API entry point |
| `realtime/realtime-messaging.service.ts` | Real-time Firebase RTDB messaging |
| `realtime/typing-indicator.service.ts`   | Real-time typing indicators       |
| `realtime/presence.service.ts`           | Online/offline presence           |
| `realtime/push-notification.service.ts`  | Push notifications for messages   |
| `core/messaging-orchestrator.ts`         | Message delivery orchestration    |
| `core/modules/MessageSender.ts`          | Message sending                   |
| `core/modules/ConversationLoader.ts`     | Conversation history loading      |
| `ai-smart-suggestions.service.ts`        | AI-powered reply suggestions      |
| `message-search.service.ts`              | Full-text message search          |
| `block-user.service.ts`                  | User blocking                     |
| `user-report.service.ts`                 | Abuse reporting                   |
| `offer-workflow.service.ts`              | Purchase offer workflow           |

### 5.4 Selling Workflow (`sell-workflow-*`)

| Service                                   | Purpose                                    |
| ----------------------------------------- | ------------------------------------------ |
| `sell-workflow-service.ts`                | Main selling orchestrator                  |
| `sell-workflow-collections.ts`            | Maps vehicles to 12+ Firestore collections |
| `sell-workflow-operations.ts`             | CRUD for workflow steps                    |
| `sell-workflow-transformers.ts`           | Data format transformations                |
| `sell-workflow-validation.ts`             | Step-by-step validation                    |
| `sell-workflow-images.ts`                 | Image handling in sell flow                |
| `unified-workflow-persistence.service.ts` | Persists workflow to Firestore             |
| `drafts-service.ts`                       | Draft auto-save management                 |

### 5.5 Profile & Users (`profile/`, `users/`)

| Service                          | Purpose                   |
| -------------------------------- | ------------------------- |
| `ProfileService.ts`              | Main profile orchestrator |
| `UnifiedProfileService.ts`       | Unified profile interface |
| `trust-score-service.ts`         | Trust score calculation   |
| `trust-network.service.ts`       | Trust network graph       |
| `leaderboard.service.ts`         | Rankings and leaderboards |
| `points-automation.service.ts`   | Auto reputation points    |
| `PermissionsService.ts`          | Profile visibility/access |
| `image-processing-service.ts`    | Profile image processing  |
| `VerificationWorkflowService.ts` | Verification workflows    |
| `users.service.ts`               | User data operations      |
| `user/canonical-user.service.ts` | Canonical user profiles   |

### 5.6 Payments (`payment/`, root)

| Service                                 | Purpose                                      |
| --------------------------------------- | -------------------------------------------- |
| `payment-service.ts`                    | Payment processing abstraction               |
| `stripe-service.ts`                     | Stripe integration                           |
| `payment/manual-payment.service.ts`     | Manual bank transfer handling                |
| `payment/bulgarian-payment.service.ts`  | Bulgarian payment methods (ePay.bg, EasyPay) |
| `config/bank-details.ts`                | IBAN/BIC (Revolut, iCard)                    |
| `billing/subscription-service.ts`       | Subscription management                      |
| `billing/micro-transactions.service.ts` | Turbo boost pay-to-promote                   |
| `commission-service.ts`                 | Commission calculations                      |

### 5.7 Verification (`verification/`)

| Service                         | Purpose                                 |
| ------------------------------- | --------------------------------------- |
| `phone-verification.service.ts` | SMS phone verification                  |
| `id-verification.service.ts`    | ID document verification                |
| `eik-verification-service.ts`   | Bulgarian company ID (EIK) verification |
| `egn-validator.ts`              | Bulgarian personal ID (EGN) validation  |
| `email-verification.ts`         | Email verification                      |

### 5.8 Social Features (`social/`)

| Service                                 | Purpose                      |
| --------------------------------------- | ---------------------------- |
| `smart-feed.service.ts`                 | Aggregated content feed      |
| `posts.service.ts`                      | Post CRUD                    |
| `follow.service.ts`                     | Follow/follower management   |
| `comments.service.ts`                   | Comment management           |
| `badges.service.ts`                     | Badge system                 |
| `algorithms/feed-algorithm.service.ts`  | Feed ranking algorithm       |
| `ml/collaborative-filtering.service.ts` | Collaborative filtering      |
| `ml/hybrid-recommender.service.ts`      | Hybrid recommendation engine |

### 5.9 Recommendations (`recommendation/`)

| Service                     | Purpose                               |
| --------------------------- | ------------------------------------- |
| `recommendation.service.ts` | Personalized car recommendations      |
| `scoring.service.ts`        | Recommendation scoring                |
| `behavior.service.ts`       | User behavior analysis                |
| `diversify.service.ts`      | Recommendation diversity              |
| `reasons.service.ts`        | Human-readable recommendation reasons |

### 5.10 Dealer Management (`dealer/`)

| Service                       | Purpose                     |
| ----------------------------- | --------------------------- |
| `bulk-upload.service.ts`      | Bulk car import (50 max)    |
| `csv-parser.service.ts`       | CSV parsing for bulk upload |
| `vin-decoder.service.ts`      | VIN decoding                |
| `dealer-dashboard.service.ts` | Dealer analytics dashboard  |

### 5.11 Analytics (`analytics/`)

| Service                             | Purpose                        |
| ----------------------------------- | ------------------------------ |
| `UnifiedAnalyticsService.ts`        | Central analytics hub          |
| `firebase-analytics-service.ts`     | Firebase Analytics integration |
| `google-ads-integration.service.ts` | Google Ads conversion tracking |
| `car-analytics.service.ts`          | Car listing engagement metrics |
| `search-analytics.service.ts`       | Search query analytics         |
| `profile-analytics.service.ts`      | Profile view analytics         |

### 5.12 Notifications (`notifications/`)

| Service                              | Purpose                       |
| ------------------------------------ | ----------------------------- |
| `unified-notification.service.ts`    | Unified notification delivery |
| `fcm.service.ts`                     | Firebase Cloud Messaging      |
| `push-notifications.service.ts`      | Push notification management  |
| `real-time-notifications-service.ts` | Real-time notifications       |
| `smart-alerts-service.ts`            | Intelligent alerts            |

### 5.13 Location & Maps

| Service                                  | Purpose                    |
| ---------------------------------------- | -------------------------- |
| `bulgaria-locations.service.ts`          | Bulgarian city/region data |
| `unified-cities-service.ts`              | City data consolidation    |
| `geocoding-service.ts`                   | Address ↔ coordinates      |
| `cityRegionMapper.ts`                    | City-to-region mapping     |
| `google/google-maps-enhanced.service.ts` | Google Maps integration    |

### 5.14 Images & Storage

| Service                              | Purpose                                    |
| ------------------------------------ | ------------------------------------------ |
| `image-upload-service.ts`            | Image upload orchestration                 |
| `image-upload-validation.service.ts` | Upload validation (size, type, dimensions) |
| `image-storage-operations.ts`        | Firebase Storage CRUD                      |
| `imageOptimizationService.ts`        | Client-side image optimization             |
| `ImageStorageService.ts`             | Image storage management                   |

### 5.15 Security & Admin

| Service                               | Purpose                |
| ------------------------------------- | ---------------------- |
| `security/security-service.ts`        | Core security          |
| `security/delete-account.service.ts`  | GDPR right to deletion |
| `security/two-factor-auth.service.ts` | 2FA                    |
| `compliance/gdpr.service.ts`          | GDPR compliance        |
| `admin-operations-service.ts`         | Admin operations       |
| `admin-permissions.service.ts`        | Role-based access      |
| `audit-logging-service.ts`            | Audit trail            |
| `hcaptcha-service.ts`                 | Bot protection         |

### 5.16 Infrastructure Services

| Service                              | Purpose                              |
| ------------------------------------ | ------------------------------------ |
| `logger-service.ts`                  | Unified logging (Sentry integration) |
| `error-handling-service.ts`          | Global error handling                |
| `cache-service.ts`                   | Client-side caching                  |
| `rate-limiting-service.ts`           | Rate limiting                        |
| `slug.service.ts`                    | URL slug generation                  |
| `short-links.service.ts`             | Link shortening                      |
| `site-settings.service.ts`           | Global site settings                 |
| `firebase/UnifiedFirebaseService.ts` | Unified Firebase interface           |

### 5.17 Car Data & Brands

| Service                                   | Purpose                       |
| ----------------------------------------- | ----------------------------- |
| `car/unified-car-service.ts`              | Main car service orchestrator |
| `car-count.service.ts`                    | Car count statistics          |
| `cityCarCountService.ts`                  | Cars per city                 |
| `carBrandsService.ts`                     | Car brands/models data        |
| `brand-normalization.ts`                  | Brand name normalization      |
| `featured-cars.ts`                        | Featured listings             |
| `market-value.service.ts`                 | Price estimation              |
| `duplicate-detection-enhanced.service.ts` | Duplicate car detection       |

### 5.18 Garage & Vehicle Management

| Service                           | Purpose                     |
| --------------------------------- | --------------------------- |
| `garage/garage-service.ts`        | User's owned vehicles       |
| `garage/car-lifecycle.service.ts` | Vehicle ownership lifecycle |
| `vehicle-reminder.service.ts`     | Service reminders           |

### 5.19 Reviews & Auctions

| Service                       | Purpose               |
| ----------------------------- | --------------------- |
| `reviews/review-service.ts`   | Review CRUD           |
| `reviews/rating-service.ts`   | Rating system         |
| `auctions/auction-service.ts` | Auction functionality |

### 5.20 Email & Communication

| Service                        | Purpose                  |
| ------------------------------ | ------------------------ |
| `email-service.ts`             | Email sending            |
| `whatsapp/whatsapp-gateway.ts` | WhatsApp integration     |
| `calls/call-service.ts`        | Voice call functionality |

---

## 6. Custom Hooks Catalog (src/hooks/)

### Authentication & Profile

| Hook                     | Purpose                                     |
| ------------------------ | ------------------------------------------- |
| `useAuth`                | Firebase Auth context & user profile access |
| `useCompleteProfile`     | Load complete user profile data             |
| `useProfilePermissions`  | Profile access permission guard             |
| `useAuthRedirectHandler` | Smart redirect after login by role          |

### Search & Discovery

| Hook               | Purpose                      |
| ------------------ | ---------------------------- |
| `useAlgoliaSearch` | Algolia search index queries |
| `useSearchWorker`  | Web Worker background search |
| `useSavedSearches` | Manage saved search filters  |

### Selling Workflow

| Hook                 | Purpose                          |
| -------------------- | -------------------------------- |
| `useSellWorkflow`    | Car selling workflow state       |
| `useDraftAutoSave`   | Auto-save drafts (30s intervals) |
| `useWorkflowStep`    | Navigate workflow steps          |
| `useUnifiedWorkflow` | Multi-step form management       |
| `useBulkUploadJob`   | Track bulk uploads               |

### Messaging & Notifications

| Hook                        | Purpose                         |
| --------------------------- | ------------------------------- |
| `useMessaging`              | Real-time messaging for channel |
| `useRealtimeMessaging`      | Real-time message stream        |
| `useNotifications`          | FCM push notifications          |
| `useFirestoreNotifications` | Firestore notification listener |
| `usePresence`               | User online/offline presence    |
| `useTypingIndicator`        | Typing indicators in chat       |

### Data & Favorites

| Hook                      | Purpose                     |
| ------------------------- | --------------------------- |
| `useFavorites`            | Manage favorite cars        |
| `useHomepageCars`         | Homepage car feed           |
| `useHomepageStats`        | Homepage statistics         |
| `useAsyncData`            | Generic async data fetching |
| `useOptimisticUpdate`     | Optimistic UI updates       |
| `useSubscriptionListener` | Subscription status changes |

### AI Features

| Hook                 | Purpose                       |
| -------------------- | ----------------------------- |
| `useAIEvaluation`    | AI car evaluation             |
| `useAIImageAnalysis` | Extract car data from images  |
| `useOptimizedImage`  | Responsive image optimization |

### UI & Responsive

| Hook                                       | Purpose                         |
| ------------------------------------------ | ------------------------------- |
| `useBreakpoint`                            | Responsive breakpoint detection |
| `useIsMobile / useIsTablet / useIsDesktop` | Device type helpers             |
| `useLoadingOverlay`                        | Global loading overlay          |
| `useMobileInteractions`                    | Multi-touch gestures            |
| `usePullToRefresh`                         | Pull-to-refresh gesture         |
| `useScrollDetection`                       | Scroll tracking                 |

### Performance & Utilities

| Hook          | Purpose                                |
| ------------- | -------------------------------------- |
| `useDebounce` | Debounce value changes                 |
| `useThrottle` | Throttle function calls                |
| `useRetry`    | Retry with exponential backoff         |
| `usePWA`      | PWA install prompt & offline detection |

### Content & Navigation

| Hook                  | Purpose                      |
| --------------------- | ---------------------------- |
| `usePageBuilder`      | Dynamic page sections        |
| `useSiteSettings`     | Global site config           |
| `useSlugRedirect`     | URL slug resolution          |
| `usePostEngagement`   | Social post interactions     |
| `usePromotionalOffer` | Promotional offer management |

---

## 7. Pages & Routes Map (src/pages/)

### 01_main-pages — Primary Pages

`HomePage`, `CarsPage`, `CarDetailsPage`, `NumericCarDetailsPage`, about/, advisor/, ai-analysis/, auctions/, blog/, contact/, help/, history/, map/, marketplace/, social-hub/, valuation/

### 02_authentication — Auth Pages

login/, register/, admin-login/, forgot-password/, oauth/, verification/

### 02_error-pages — Error Pages

`CarNotFoundPage` (404), `ForbiddenPage` (403), `OfflinePage`, `ServerErrorPage` (500)

### 03_user-pages — User Dashboard

`ProfilePage`, dashboard/, ai-dashboard/, `MessagesPage`, `RealtimeMessagesPage`, billing/, favorites/, garage/, my-drafts/, my-listings/, notifications/, saved-searches/, social/, users-directory/

### 04_car-selling — Sell Workflow

`SellPageNew` (multi-step), `EditCarPage`, sell/Contact/, Images/, VehicleData/, Pricing/, Preview/, Submission/

### 05_search-browse — Search Pages

`SearchPage`, advanced-search/, algolia-search/, all-cars/, brand-gallery/, dealers/, finance/, location/, top-brands/, view-all-dealers/, view-all-new-cars/

### 06_admin — Admin Dashboard

`AdminPage`, `AIQuotaManager`, `AlgoliaAdminPanel`, `AlgoliaSyncManager`, `AuthUsersPage`, `DebugCarsPage`, `MigrationPage`, `SEODashboard`, `SharedInboxPage`, finance/, reports/, super-admin/, `TeamManagement`

### 07_advanced-features — Premium Features

`B2BAnalyticsPortal`, `EventsPage`, `KATServicesPage`, `VisualSearchPage`, `OpenBankingInstantPage`, `CrossBorderEscrowPage`, `OmniScanSellPage`

### 08_payment-billing — Payments

`CheckoutPage`, `ManualCheckoutPage`, `SubscriptionPage`, `InvoicesPage`, `CommissionsPage`, `PaymentSuccessPage`, `PaymentFailedPage`, `UpdatePaymentMethodPage`

### 09_dealer-company — Dealer Pages

`DealerDashboardPage`, `DealerPublicPage`, `DealerRegistrationPage`, `SellerDashboardPage`, `CompanyAnalyticsDashboard`, `BulkReviewPage`, `StripeSetupPage`

### 10_landing — Landing Pages

`CompetitiveComparisonPage`, `LaunchOfferPage`, `WhyUsPage`

### 10_legal — Legal Pages

cookie-policy/, data-deletion/, privacy-policy/, terms-of-service/, sitemap/

---

## 7.1 V2.0 Advanced Features Routes (Feature-Flagged)

| Route                | Page Component           | Feature Flag                 | Purpose                                                                                               | Dependencies                              |
| -------------------- | ------------------------ | ---------------------------- | ----------------------------------------------------------------------------------------------------- | ----------------------------------------- |
| `/financing/instant` | `OpenBankingInstantPage` | `ENABLE_OPEN_BANKING`        | Instant credit scoring + pre-approved financing offers from 4 Bulgarian banks in 15 seconds           | `openBankingService`, Auth required       |
| `/import/escrow`     | `CrossBorderEscrowPage`  | `ENABLE_CROSS_BORDER_ESCROW` | 1-Click EU import with escrow payment protection, customs/tax calculation, transport logistics        | `crossBorderEscrowService`, Auth required |
| `/sell/scan`         | `OmniScanSellPage`       | `ENABLE_OMNI_SCAN_AI`        | Live camera VIN scanning, auto-fill vehicle details, stolen vehicle check, 15-second listing creation | `omniScanService`, Auth required          |

### Feature Flag Gating Strategy

**Development Mode**: All V2.0 feature flags default to `false` in `src/config/feature-flags.ts`

**Rollout Phases**:

1. **Phase 1 (Disabled)**: Set flag to `false`, components redirect to fallback routes
2. **Phase 2 (Soft Launch)**: Enable for 10% of users, monitor Sentry errors for 48 hours
3. **Phase 3 (Limited Release)**: Enable for 50% of users, monitor for 5 days
4. **Phase 4 (Full Rollout)**: Enable for 100% of users, keep flag in code for instant rollback

**Entry CTAs** (only visible when flags enabled):

- FinancingCalculatorPage: "Instant Pre-Approval (Open Banking)" button → `/financing/instant`
- SellModalPage: "Try Omni-Scan VIN (15s)" floating button → `/sell/scan`

---

## 8. Context Providers (src/contexts/)

| Provider                     | Purpose                                                             |
| ---------------------------- | ------------------------------------------------------------------- |
| `AuthContext / AuthProvider` | Firebase auth state, user profile, real-time sync                   |
| `ThemeContext`               | Light/dark mode with localStorage persistence                       |
| `LanguageContext`            | Language selection (en/bg) with translations                        |
| `FilterContext`              | Search filters with URL sync (make, model, price, year, city, fuel) |
| `ComparisonContext`          | Car comparison (up to 3 cars side-by-side)                          |
| `LoadingContext`             | Global loading overlay with progress                                |
| `ProfileTypeContext`         | Profile type (private/dealer/company)                               |
| `AdminThemeContext`          | Admin-specific theme (isolated)                                     |
| `AdminLanguageContext`       | Admin language support (en/bg/tr/de/ar)                             |

---

## 9. Cloud Functions (functions/src/)

### 9.1 Firestore Triggers

| Function                         | Event                    | Purpose                                |
| -------------------------------- | ------------------------ | -------------------------------------- |
| `onUserCreate`                   | `auth.user.create`       | Assign numeric ID, bootstrap user doc  |
| `on-user-delete`                 | `auth.user.delete`       | Clean up all user data                 |
| `car-lifecycle`                  | Car create/update/delete | Inventory management, lifecycle events |
| `price-drop-alerts`              | Car price update         | Alert watchers on price changes        |
| `orphaned-data-cleanup`          | Manual/Scheduled         | Remove orphaned documents              |
| `onNewMessage`                   | `messages.create`        | Send FCM notification                  |
| `onNewInquiry`                   | `inquiries.create`       | Notify seller                          |
| `onNewOffer`                     | `offers.create`          | Notify parties                         |
| `onNewReview`                    | `reviews.create`         | Notify reviewed user                   |
| `onNewFavorite`                  | `favorites.create`       | Notify seller                          |
| `on[VehicleType]CreatedIndexing` | Per-collection create    | Auto-index in Google Search            |

### 9.2 Scheduled Functions

| Function                       | Schedule  | Purpose                          |
| ------------------------------ | --------- | -------------------------------- |
| `archive-sold-cars`            | Daily 3AM | Archive cars sold >30 days ago   |
| `firestore-backup`             | Daily     | Automatic Firestore backups      |
| `dailyReminder`                | Daily     | Activity engagement reminders    |
| `cleanupOldNotifications`      | Scheduled | Delete 30+ day old notifications |
| `scheduledSitemapRegeneration` | Daily     | Auto-regenerate XML sitemap      |

### 9.3 HTTP/Callable Functions

| Function                   | Type     | Purpose                             |
| -------------------------- | -------- | ----------------------------------- |
| `geminiChat`               | Callable | Interactive Gemini AI chat          |
| `analyzeCarImage`          | Callable | Vision analysis of car photos       |
| `geminiPriceSuggestion`    | Callable | AI price recommendation             |
| `evaluateCar`              | Callable | Hybrid AI evaluation                |
| `aiGenerateCarDescription` | Callable | AI description writer               |
| `hybridAIProxy`            | Callable | Router: Gemini or DeepSeek by quota |
| `create-payment-intent`    | HTTP     | Stripe payment intent               |
| `merchantFeed`             | HTTP     | Google Shopping XML feed            |
| `sitemap`                  | HTTP     | XML sitemap generator               |
| `requestIndexing`          | Callable | Request Google indexing             |

### 9.3.1 V2.0 Engine Cloud Functions (NEW - April 2026)

| Function                      | Engine | Type      | Purpose                                      |
| ----------------------------- | ------ | --------- | -------------------------------------------- |
| `processLoanApplication`      | 4      | Callable  | Validate credit score + submit to 4 banks    |
| `processEscrowPayment`        | 3      | Callable  | Initialize escrow transaction + fund holding |
| `recordInspectionAndRelease`  | 3      | Callable  | Inspect vehicle + release escrow funds       |
| `expireOldEscrowTransactions` | 3      | Scheduled | Daily escrow expiration cleanup (03:00 UTC)  |
| `verifyVINExternal`           | 8      | Callable  | Check carVertical for stolen + history       |

**Feature Flag Dependencies**:

- `processLoanApplication` requires `ENABLE_OPEN_BANKING` in config/feature-flags.ts
- `processEscrowPayment` requires `ENABLE_CROSS_BORDER_ESCROW` in config/feature-flags.ts
- `verifyVINExternal` requires `ENABLE_OMNI_SCAN_AI` in config/feature-flags.ts

### 9.4 Image Processing

| Function                | Trigger        | Purpose                            |
| ----------------------- | -------------- | ---------------------------------- |
| `optimizeUploadedImage` | Storage upload | Convert to WebP + responsive sizes |
| `cleanupDeletedImages`  | Storage delete | Remove optimized variants          |

### 9.5 Ad Sync

| Function                | Type      | Purpose                    |
| ----------------------- | --------- | -------------------------- |
| `syncCarsToGoogleAds`   | Scheduled | Export to Google Ads       |
| `syncCarsToFacebookAds` | Scheduled | Export to Facebook catalog |

### 9.6 Bulk Operations

| Function            | Trigger               | Purpose                        |
| ------------------- | --------------------- | ------------------------------ |
| `processBulkUpload` | `bulk_jobs` Firestore | Multi-car bulk upload pipeline |
| `groupBulkImages`   | Bulk step             | Group images by vehicle        |
| `extractVIN`        | Bulk step             | OCR VIN extraction             |

---

## 10. Mobile App (mobile_new/)

### Routing (`mobile_new/app/`)

```
app/
├── (tabs)/           # Main navigation (6 tabs)
│   ├── index.tsx     # Home/Feed
│   ├── search.tsx    # Search & Browse
│   ├── sell.tsx      # Sell Workflow
│   ├── messages.tsx  # Messaging
│   ├── map.tsx       # Map View
│   └── profile.tsx   # Profile
├── (auth)/           # Login, Signup
├── car/              # Car detail pages
├── chat/             # Chat pages
├── onboarding.tsx    # Onboarding flow
├── notifications.tsx # Notification center
├── dealers.tsx       # Dealer browse
├── VisualSearch.tsx  # Image-based search
├── financing-instant.tsx  # 🆕 Instant Financing (Engine 4)
├── import-escrow.tsx      # 🆕 Cross-Border Escrow (Engine 3)
├── vin-scan.tsx           # 🆕 Omni-Scan VIN (Engine 8)
└── _layout.tsx       # Root providers (Auth, Language, Theme)
```

### V2.0 Mobile Screens (NEW - April 2026)

| Screen                    | Route                | Feature Flag                 | Purpose                                    | Cloud Function           |
| ------------------------- | -------------------- | ---------------------------- | ------------------------------------------ | ------------------------ |
| `InstantFinancingScreen`  | `/financing-instant` | `ENABLE_OPEN_BANKING`        | Get instant loan pre-approval from 4 banks | `processLoanApplication` |
| `CrossBorderEscrowScreen` | `/import-escrow`     | `ENABLE_CROSS_BORDER_ESCROW` | EU 1-Click import with escrow + cost calc  | `processEscrowPayment`   |
| `OmniScanVINScreen`       | `/vin-scan`          | `ENABLE_OMNI_SCAN_AI`        | Quick VIN verification + vehicle history   | `verifyVINExternal`      |

**Navigation Integration** (Mobile Tab Integration — April 2026):

| Tab Screen                | V2.0 Feature      | Button Placement                 | Route                | Feature Flag                 |
| ------------------------- | ----------------- | -------------------------------- | -------------------- | ---------------------------- |
| `(tabs)/index.tsx` (Home) | Instant Financing | Top banner                       | `/financing-instant` | `ENABLE_OPEN_BANKING`        |
| `(tabs)/search.tsx`       | 1-Click Import    | Above search results             | `/import-escrow`     | `ENABLE_CROSS_BORDER_ESCROW` |
| `(tabs)/sell.tsx`         | Omni-Scan VIN     | Second button (below Smart Sell) | `/vin-scan`          | `ENABLE_OMNI_SCAN_AI`        |

**All screens integrate with**:

- `useAuth` hook for authentication
- Firebase Callable Functions for backend operations
- Feature flag checks before rendering (via `isFeatureEnabled`)
- Styled-components/native for React Native styling
- Expo Router file-based routing

**Feature Flags** (`mobile_new/src/config/feature-flags.ts`):

```typescript
ENABLE_OPEN_BANKING: false,           // Engine 4
ENABLE_CROSS_BORDER_ESCROW: false,    // Engine 3
ENABLE_OMNI_SCAN_AI: false,           // Engine 8
```

### Mobile Services (`mobile_new/src/services/`)

`AnalyticsService`, `ConversationService`, `ListingService`, `MessagingService`, `NotificationService`, `SellService`, `SubscriptionService`, `ReviewService`, `SavedSearchesService`, `PriceEstimatorService`, `VinCheckService`, `PlatformSyncService`, `numeric-id-*.service.ts` (4 files), plus `ai/`, `car/`, `search/`, `history/` subdirectories.

### Mobile State: Zustand (`useSellStore.ts` for sell workflow)

### Mobile Theme: `mobile_new/src/styles/theme.ts` (styled-components/native)

---

## 11. External Integrations

| Service                | Purpose        | Key Files                                              |
| ---------------------- | -------------- | ------------------------------------------------------ |
| **Algolia**            | Hybrid search  | `services/search/*`, `functions/syncCarsToAlgolia.ts`  |
| **Google Maps**        | Location/maps  | `services/maps/*`, `services/geocoding-service.ts`     |
| **Google Analytics 4** | Analytics      | `services/analytics/`, `firebase/analytics-service.ts` |
| **Google Ads**         | Ad feed        | `functions/google-ads-sync.ts`                         |
| **Facebook Catalog**   | Product feed   | `functions/facebook-ads-sync.ts`                       |
| **Stripe**             | Payments       | `services/stripe-service.ts`, `functions/api/stripe/`  |
| **Sentry**             | Error tracking | `config/sentry.ts`, `services/logger-service.ts`       |
| **hCaptcha**           | Bot protection | `services/hcaptcha-service.ts`                         |
| **Firebase RTDB**      | Messaging      | `services/messaging/*`, `database.rules.json`          |
| **Firebase Storage**   | Media          | `services/image-storage-*`, `storage.rules`            |
| **Google Merchant**    | Shopping feed  | `functions/merchant-feed.ts`                           |
| **WhatsApp**           | Communication  | `services/whatsapp/*`                                  |

---

## 12. Security Model

### Authentication Methods

- Email/password + email verification
- Google sign-in, Facebook sign-in
- Phone (SMS) verification
- Azure Entra ID (`auth/azure-auth.service.ts`)
- Guest accounts (auto-expiration)
- 2FA (`security/two-factor-auth.service.ts`)

### Firestore Security Rules

- **Default**: DENY ALL
- Users read/write only their own documents
- Messaging restricted to channel participants
- Admin functions secured with `isAdmin()` check
- VIN verification fields immutable
- Document size limit enforced (500 fields)

### Storage Rules

- Image: max 10MB, `image/*` type
- Video: max 50MB, `video/*` type
- Users access only their own uploads

### HTTP Security (firebase.json headers)

- CSP: Allows Google, Stripe, Facebook, Storage origins
- X-Frame-Options: DENY
- X-Content-Type-Options: nosniff
- X-XSS-Protection: 1; mode=block
- Referrer-Policy: strict-origin-when-cross-origin

---

## 13. Configuration (src/config/)

| File                    | Purpose                                              |
| ----------------------- | ---------------------------------------------------- |
| `feature-flags.ts`      | Feature toggles                                      |
| `bank-details.ts`       | IBAN/BIC (Revolut, iCard)                            |
| `subscription-plans.ts` | Subscription tiers (Free/Dealer €50/Enterprise €500) |
| `ai-tiers.config.ts`    | AI feature tiering (free/paid)                       |
| `bulgarian-config.ts`   | Bulgaria-specific settings                           |
| `firebase/`             | Firebase project config                              |
| `google-api-keys.ts`    | Google Maps/Auth keys                                |
| `monitoring.config.ts`  | Sentry + monitoring config                           |
| `env-validation.ts`     | Environment variable validation                      |
| `navigation-links.ts`   | Navigation data                                      |
| `social-media.ts`       | Social platform IDs                                  |
| `sentry.ts`             | Sentry DSN and config                                |

---

## 14. Key Business Workflows

### 14.1 Sell a Car

1. User starts → `useSellWorkflow` hook
2. Multi-step form: Vehicle Data → Images → Pricing → Contact → Preview → Submit
3. `sell-workflow-service.ts` orchestrates
4. `sell-workflow-collections.ts` selects correct Firestore collection
5. `sell-workflow-images.ts` handles image upload/optimization
6. Draft auto-saved via `drafts-service.ts` every 30 seconds
7. On submit → Firestore document created → Cloud Function triggers indexing + Algolia sync

### 14.2 Search for a Car

1. User types query → `UnifiedSearchService.ts`
2. `queryOrchestrator.ts` routes to Algolia (text) or Firestore (filters)
3. `firestoreQueryBuilder.ts` queries across all vehicle collections
4. `multi-collection-helper.ts` merges results
5. `browser-cache-strategy.service.ts` caches frequent searches
6. Results displayed with pagination (`pagination.service.ts`)

### 14.3 Send a Message

1. User clicks "Contact Seller" → channel created: `msg_{seller}_{buyer}_car_{car}`
2. `messaging-facade.ts` → `realtime-messaging.service.ts`
3. Message stored in Realtime Database
4. Cloud Function `onNewMessage` sends FCM push notification
5. `typing-indicator.service.ts` shows real-time typing
6. `presence.service.ts` shows online/offline status

### 14.4 Process a Payment

1. User selects subscription → `CheckoutPage` or `ManualCheckoutPage`
2. **Stripe path**: `stripe-service.ts` creates PaymentIntent → Stripe webhook confirms
3. **Bank transfer path**: `manual-payment.service.ts` shows IBAN → admin verifies → subscription activated
4. `bank-details.ts` provides Revolut + iCard bank details

### 14.5 Register & Verify

1. `onUserCreate` Cloud Function assigns numeric ID
2. User logs in → `AuthProvider` syncs profile from Firestore
3. Phone verification: `phone-verification.service.ts` (Firebase SMS)
4. Email verification: `email-verification.ts` (Firebase link)
5. EGN validation: `egn-validator.ts` (Bulgarian personal ID algorithm)
6. EIK verification: `eik-verification-service.ts` (Bulgarian Trade Registry API)
7. Trust score calculated: `trust-score-service.ts`

### 14.6 Bulk Dealer Upload

1. Dealer uploads CSV or ZIP → `bulk-upload.service.ts`
2. `csv-parser.service.ts` parses listings
3. `vin-decoder.service.ts` decodes VINs
4. `image-grouping.service.ts` groups images per car
5. Cloud Function `processBulkUpload` orchestrates pipeline
6. Each car → correct collection via `sell-workflow-collections.ts`

---

## 15. Development Workflows

### Commands (run from repo root)

```bash
npm start                  # Dev server (Vite @ port 5173)
npm run start:dev          # Dev server with HMR
npm run type-check         # TypeScript type checking
npm test                   # Run tests
npm run build              # Production build
npm run emulate            # Firebase emulators (Auth + Firestore + Storage)
npm run deploy             # Firebase deployment
npm run audit:hygiene      # Repository audit
cd mobile_new && npm start # Mobile dev server (Expo)
```

### Path Aliases (tsconfig.json)

```typescript
import { SomeService } from '@/services/some-service'; // ✅
import { SomeService } from '../../../services/some-service'; // ❌
```

### Testing Conventions

- Tests in `__tests__/` folders
- All tests require `ThemeProvider + LanguageProvider` wrappers
- See `docs/testing/README.md` for patterns

---

## 16. Where to Find What (Quick Reference)

| I need to...                  | Look at...                                                    |
| ----------------------------- | ------------------------------------------------------------- |
| Understand architecture rules | `CONSTITUTION.md`                                             |
| Find a service                | `src/services/{domain}/` (see §5)                             |
| Find a hook                   | `src/hooks/` (see §6)                                         |
| Find a page/route             | `src/pages/{category}/` (see §7)                              |
| Understand data model         | `schemas/`, `src/types/`                                      |
| See Firestore rules           | `firestore.rules`                                             |
| See messaging rules           | `database.rules.json`                                         |
| Modify a Cloud Function       | `functions/src/` (see §9)                                     |
| Work on mobile app            | `mobile_new/` (see §10)                                       |
| Configure a feature           | `src/config/` (see §13)                                       |
| Add a new vehicle type        | `src/services/sell-workflow-collections.ts`                   |
| Debug search                  | `src/services/search/`                                        |
| Debug messaging               | `src/services/messaging/`, `src/hooks/messaging/`             |
| Debug payments                | `src/services/payment/`, `src/config/bank-details.ts`         |
| Add admin features            | `src/pages/06_admin/`, `src/services/admin/`                  |
| Work on AI features           | `src/services/ai/`, `functions/src/ai-functions.ts`           |
| Work on dealer features       | `src/services/dealer/`, `src/pages/09_dealer-company/`        |
| Handle notifications          | `src/services/notifications/`, `functions/src/notifications/` |
| Fix SEO issues                | `functions/src/sitemap.ts`, `src/pages/10_landing/`           |
| Manage images                 | `src/services/image-*`, `functions/src/image-optimizer.ts`    |
| View deployment config        | `firebase.json`, `functions/.env`                             |
| Read docs                     | `docs/`, `documents/`                                         |
| See archived files            | `DDD/`                                                        |

---

## 17. Documentation Map

| Document                          | Purpose                                    |
| --------------------------------- | ------------------------------------------ |
| `CODEBASE.md`                     | **THIS FILE** — complete project knowledge |
| `CONSTITUTION.md`                 | Governance rules (18 articles)             |
| `.cursorrules`                    | AI assistant rules (Cursor IDE)            |
| `.github/copilot-instructions.md` | GitHub Copilot rules                       |
| `README.md`                       | Project overview                           |
| `QUICK_START.md`                  | Dev server startup guide                   |
| `SECURITY.md`                     | Security hardening checklist               |
| `CONTRIBUTING.md`                 | Contribution guidelines                    |
| `PLAN 4x.md`                      | Strategic masterplan (Arabic)              |
| `docs/DOCUMENTATION_INDEX.md`     | Documentation master index                 |
| `docs/getting-started/`           | Onboarding guides                          |
| `docs/guides/`                    | 14 implementation guides                   |
| `docs/testing/`                   | Testing docs                               |
| `documents/features/`             | Feature specifications                     |
| `documents/mobile/`               | Mobile app specifications                  |
| `schemas/`                        | JSON Schema definitions                    |
| `api/openapi.yaml`                | API specification                          |

---

> **Maintenance**: Update this file when adding new services, hooks, pages, or major features.
> Last updated: March 31, 2026
