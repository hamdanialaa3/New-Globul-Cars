# 📋 KOLI ONE - التوثيق الشامل الكامل
# Complete Project Documentation

> **آخر تحديث:** February 4, 2026  
> **الإصدار:** 0.1.0  
> **الحالة:** Production (Live at https://koli.one)

---

## 📌 نظرة عامة على المشروع | Project Overview

**Koli One** هو سوق سيارات إلكتروني بلغاري متكامل، يجمع بين البيع والشراء والتبادل مع ميزات AI متقدمة ونظام رسائل فوري ودفع إلكتروني.

### المعلومات الأساسية | Basic Info

| Property | Value |
|----------|-------|
| **Project Name** | Koli One (New Globul Cars) |
| **Live URL** | https://koli.one |
| **Firebase Project** | fire-new-globul |
| **Firebase Project Number** | 973379297533 |
| **GitHub Repository** | hamdanialaa3/New-Globul-Cars |
| **Region** | Bulgaria (europe-west1) |
| **Primary Language** | Bulgarian (bg) |
| **Secondary Language** | English (en) |
| **Currency** | EUR (€) |

---

## 🏗️ المعمارية الكاملة | Complete Architecture

### Tech Stack

```
Frontend:
├── React 18.3.1 (Functional Components + Hooks)
├── TypeScript (Strict Mode)
├── Styled-Components 6.1.19
├── React Router DOM 7.9.1
├── Framer Motion 12.23.26
├── Recharts 3.2.1 (Charts)
├── Three.js 0.182.0 (3D Graphics)
└── Lucide React 0.544.0 (Icons)

Backend (Firebase):
├── Firebase 12.3.0
├── Firestore (NoSQL Database)
├── Firebase Auth (Authentication)
├── Firebase Storage (File Storage)
├── Firebase Functions (Cloud Functions - europe-west1)
├── Firebase Realtime Database (Messaging)
└── Firebase Analytics

External Services:
├── Algolia (Search - algoliasearch 4.25.2)
├── Stripe (Payments - @stripe/react-stripe-js 2.9.0)
├── Google Maps API (@react-google-maps/api 2.20.7)
├── Google Gemini AI (@google/generative-ai 0.24.1)
├── OpenAI (openai 6.15.0)
├── Sentry (Error Tracking - @sentry/react 10.32.1)
├── hCaptcha (@hcaptcha/react-hcaptcha 1.12.1)
└── Socket.io (Real-time - socket.io-client 4.7.5)
```

---

## 📁 هيكل المجلدات الكامل | Complete Folder Structure

```
web/
├── src/
│   ├── App.tsx                    # Main App Component
│   ├── AppRoutes.tsx              # Root Routing Configuration
│   ├── index.tsx                  # React Entry Point
│   │
│   ├── assets/                    # Static Assets (images, fonts)
│   │
│   ├── components/                # 🧩 UI COMPONENTS (200+ components)
│   │   ├── admin/                 # Admin Dashboard Components
│   │   ├── auth/                  # Authentication Components
│   │   ├── billing/               # Billing & Payment Components
│   │   ├── car/                   # Car-related Components
│   │   ├── common/                # Shared/Reusable Components
│   │   ├── dealer/                # Dealer Profile Components
│   │   ├── filters/               # Search Filter Components
│   │   ├── guards/                # Route Guards (AuthGuard, etc.)
│   │   ├── Header/                # Navigation Header
│   │   ├── Footer/                # Site Footer
│   │   ├── HomePage/              # Homepage Sections
│   │   ├── messaging/             # Chat/Messaging Components
│   │   ├── moderation/            # Content Moderation
│   │   ├── Notifications/         # Notification System
│   │   ├── payment/               # Payment Components
│   │   ├── Posts/                 # Social Feed Posts
│   │   ├── Profile/               # User Profile Components
│   │   ├── Search/                # Search Components
│   │   ├── SellWorkflow/          # Car Selling Wizard (5 Steps)
│   │   ├── social/                # Social Features
│   │   ├── Stories/               # Instagram-style Stories
│   │   ├── subscription/          # Subscription Plans
│   │   ├── SuperAdmin/            # Super Admin Components
│   │   ├── Toast/                 # Toast Notifications
│   │   ├── trust/                 # Trust & Verification Badges
│   │   ├── ui/                    # Base UI Components
│   │   └── visual-search/         # Visual/AI Search
│   │
│   ├── config/                    # ⚙️ CONFIGURATION
│   │   ├── bulgarian-config.ts    # Bulgarian Localization
│   │   ├── bank-details.ts        # Manual Payment Bank Info
│   │   └── ...
│   │
│   ├── constants/                 # 📊 CONSTANTS
│   │   ├── car-constants.ts       # Car Makes, Models, Options
│   │   ├── pricing-constants.ts   # Subscription Pricing
│   │   └── ...
│   │
│   ├── contexts/                  # 🔄 REACT CONTEXTS
│   │   ├── AuthContext.tsx        # Authentication State
│   │   ├── AuthProvider.tsx       # Auth Provider Implementation
│   │   ├── ThemeContext.tsx       # Dark/Light Theme
│   │   ├── LanguageContext.tsx    # i18n (bg/en)
│   │   ├── FilterContext.tsx      # Search Filters State
│   │   ├── ProfileTypeContext.tsx # User Profile Type
│   │   └── LoadingContext.tsx     # Global Loading State
│   │
│   ├── data/                      # 📦 STATIC DATA
│   │   ├── brands-models.json     # Car Brands & Models
│   │   └── cities.json            # Bulgarian Cities
│   │
│   ├── design-system/             # 🎨 DESIGN SYSTEM
│   │   └── ...                    # Design Tokens & Components
│   │
│   ├── features/                  # 🚀 FEATURE MODULES
│   │   ├── ads/                   # Internal Ads System
│   │   ├── analytics/             # Analytics Dashboard
│   │   ├── billing/               # Billing Features
│   │   ├── car-listing/           # Car Listing Features
│   │   ├── posts/                 # Social Posts
│   │   ├── pricing/               # Pricing Features
│   │   ├── reviews/               # Review System
│   │   ├── team/                  # Team Management
│   │   └── verification/          # User Verification
│   │
│   ├── firebase/                  # 🔥 FIREBASE CONFIG
│   │   ├── firebase-config.ts     # Firebase Initialization
│   │   ├── auth-service.ts        # Auth Service
│   │   ├── messaging-service.ts   # FCM Notifications
│   │   └── social-auth-service.ts # OAuth Providers
│   │
│   ├── hooks/                     # 🪝 CUSTOM HOOKS (40+ hooks)
│   │   ├── useAuth.ts             # Authentication Hook
│   │   ├── useFavorites.ts        # Favorites Management
│   │   ├── useMessaging.ts        # Messaging Hook
│   │   ├── useSellWorkflow.ts     # Sell Workflow State
│   │   ├── useAlgoliaSearch.ts    # Algolia Integration
│   │   ├── useAIImageAnalysis.ts  # AI Image Analysis
│   │   └── ...
│   │
│   ├── layouts/                   # 📐 LAYOUTS
│   │   ├── MainLayout.tsx         # Main App Layout
│   │   └── ...
│   │
│   ├── locales/                   # 🌍 TRANSLATIONS
│   │   ├── bg.json                # Bulgarian
│   │   └── en.json                # English
│   │
│   ├── pages/                     # 📄 PAGES (Organized by Category)
│   │   ├── 01_main-pages/         # Main Public Pages
│   │   ├── 02_authentication/     # Auth Pages (Login, Register)
│   │   ├── 02_error-pages/        # Error Pages (404, etc.)
│   │   ├── 03_user-pages/         # User Dashboard Pages
│   │   ├── 03_user-profile/       # User Profile Pages
│   │   ├── 04_car-selling/        # Car Selling Pages
│   │   ├── 05_search-browse/      # Search & Browse Pages
│   │   ├── 06_admin/              # Admin Dashboard Pages
│   │   ├── 07_advanced-features/  # Advanced Features
│   │   ├── 07_car-details/        # Car Detail Pages
│   │   ├── 08_payment-billing/    # Payment Pages
│   │   ├── 09_dealer-company/     # Dealer Pages
│   │   ├── 10_landing/            # Landing Pages
│   │   ├── 10_legal/              # Legal Pages
│   │   ├── 11_test-pages/         # Development Test Pages
│   │   └── seo/                   # SEO Landing Pages
│   │
│   ├── providers/                 # 🎁 PROVIDERS
│   │   ├── AppProviders.tsx       # All Providers Stack
│   │   └── StripeProvider.tsx     # Stripe Integration
│   │
│   ├── repositories/              # 📚 REPOSITORIES
│   │   ├── DealershipRepository.ts
│   │   └── ...
│   │
│   ├── routes/                    # 🛤️ ROUTING
│   │   ├── MainRoutes.tsx         # All Application Routes
│   │   └── NumericProfileRouter.tsx
│   │
│   ├── services/                  # 🔧 SERVICES (150+ services)
│   │   ├── ai/                    # AI Services
│   │   ├── analytics/             # Analytics Services
│   │   ├── auth/                  # Auth Services
│   │   ├── billing/               # Billing Services
│   │   ├── messaging/             # Messaging Services
│   │   ├── search/                # Search Services
│   │   └── ... (100+ more)
│   │
│   ├── styles/                    # 🎨 STYLES
│   │   ├── theme.ts               # Bulgarian Theme
│   │   ├── unified-theme.css      # CSS Variables
│   │   └── ...
│   │
│   ├── types/                     # 📝 TYPESCRIPT TYPES
│   │   ├── CarListing.ts          # Car Listing Interface
│   │   ├── profile.types.ts       # Profile Types
│   │   └── ...
│   │
│   ├── utils/                     # 🛠️ UTILITIES
│   │   └── ...
│   │
│   └── workers/                   # ⚡ WEB WORKERS
│       └── ...
│
├── functions/                     # ☁️ CLOUD FUNCTIONS
│   └── src/
│       ├── index.ts               # Functions Entry Point
│       ├── ai/                    # AI Functions
│       ├── ai-functions.ts        # Gemini Chat, AI Quota
│       ├── analytics/             # Analytics Functions
│       ├── api/                   # API Endpoints
│       ├── notifications/         # Notification Triggers
│       ├── scheduled/             # Scheduled Jobs
│       ├── seo/                   # SEO Functions
│       ├── services/              # Backend Services
│       ├── stripe-webhooks.ts     # Stripe Payment Webhooks
│       ├── syncCarsToAlgolia.ts   # Algolia Sync
│       └── triggers/              # Firestore Triggers
│
├── public/                        # 📂 PUBLIC ASSETS
├── firestore.rules                # 🔒 Firestore Security Rules
├── storage.rules                  # 🔒 Storage Security Rules
└── firebase.json                  # Firebase Configuration
```

---

## 🗺️ خريطة الـ Routing الكاملة | Complete Routing Map

### 🔐 Authentication Routes (FullScreenLayout)
| Route | Component | Guard |
|-------|-----------|-------|
| `/login` | LoginPage | None |
| `/register` | RegisterPage | None |
| `/forgot-password` | ForgotPasswordPage | None |
| `/verification` | EmailVerificationPage | None |
| `/oauth/callback` | OAuthCallback | None |
| `/super-admin-login` | SuperAdminLogin | None |
| `/super-admin` | SuperAdminDashboard | Auth |
| `/super-admin/users` | SuperAdminUsersPage | Auth |

### 🏠 Main Public Routes (MainLayout)
| Route | Component | Guard |
|-------|-----------|-------|
| `/` | HomePage | None |
| `/cars` | CarsPage | None |
| `/social` | SocialFeedPage | None |
| `/advisor` | AIAdvisorPage | None |
| `/valuation` | AIValuationPage | None |
| `/history` | AIHistoryPage | None |
| `/blog` | BlogPage | None |
| `/blog/:slug` | BlogPostPage | None |
| `/about` | AboutPage | None |
| `/contact` | ContactPage | None |
| `/help` | HelpPage | None |
| `/map` | MapAnalyticsPage | None |
| `/auctions` | AuctionsPage | None |
| `/top-brands` | TopBrandsPage | None |
| `/pricing` | CarPricingPage | None |
| `/ai-analysis` | AIAnalysisPage | None |

### 🛒 Marketplace Routes
| Route | Component | Guard |
|-------|-----------|-------|
| `/marketplace` | MarketplacePage | None |
| `/marketplace/product/:productId` | ProductDetailPage | None |
| `/marketplace/cart` | CartPage | None |
| `/marketplace/checkout` | MarketplaceCheckoutPage | None |
| `/marketplace/payment` | StripePaymentPage | None |
| `/marketplace/order-success` | OrderSuccessPage | None |

### 🚗 Car Routes
| Route | Component | Guard |
|-------|-----------|-------|
| `/car/:sellerNumericId/:carNumericId` | NumericCarDetailsPage | None |
| `/car/:sellerNumericId/:carNumericId/edit` | EditCarPage | Auth |
| `/car/:sellerNumericId/:carNumericId/history` | CarHistoryPage | None |
| `/cars/all` | DynamicCarShowcase | None |
| `/cars/electric` | DynamicCarShowcase (electric) | None |
| `/cars/hybrid` | DynamicCarShowcase (hybrid) | None |
| `/cars/suv` | DynamicCarShowcase (suv) | None |
| `/cars/sedan` | DynamicCarShowcase (sedan) | None |
| `/cars/budget` | DynamicCarShowcase (budget) | None |
| `/cars/newly-added` | DynamicCarShowcase (new) | None |
| `/cars/brand/:brandName` | DynamicCarShowcase (brand) | None |
| `/cars/city/:cityName` | DynamicCarShowcase (city) | None |

### 📝 Sell Workflow Routes
| Route | Component | Guard |
|-------|-----------|-------|
| `/sell` | → Redirect to `/sell/auto` | None |
| `/sell/auto` | SellModalPage | Auth |
| `/sell/inserat/:vehicleType/*` | SellRouteRedirect | Auth |

### 👤 Profile Routes
| Route | Component | Guard |
|-------|-----------|-------|
| `/profile/*` | NumericProfileRouter | Varies |
| `/profile/:numericId` | UserProfilePage | None |
| `/profile/:numericId/favorites` | UserFavoritesPage | None |
| `/favorites` | FavoritesRedirectPage | Auth |

### 💬 Messaging Routes
| Route | Component | Guard |
|-------|-----------|-------|
| `/messages` | RealtimeMessagesPage | Auth |
| `/messages-v2` | RealtimeMessagesPage | Auth |

### 🏢 Dealer Routes
| Route | Component | Guard |
|-------|-----------|-------|
| `/dealer/:slug` | DealerPublicPage | None |
| `/dealer-registration` | DealerRegistrationPage | None |
| `/dealer-dashboard` | DealerDashboardPage | Auth |
| `/seller-dashboard` | DealerDashboardPage | Auth |
| `/dealers` | DealersPage | Auth |

### 💳 Payment & Billing Routes
| Route | Component | Guard |
|-------|-----------|-------|
| `/subscription` | SubscriptionPage | Auth |
| `/billing/success` | BillingSuccessPage | Auth |
| `/billing/canceled` | BillingCanceledPage | Auth |
| `/billing/manual-checkout` | ManualCheckoutPage | Auth |
| `/billing/manual-success` | ManualPaymentSuccessPage | Auth |
| `/checkout/:carId` | CheckoutPage | Auth |
| `/payment-success/:transactionId` | PaymentSuccessPage | Auth |
| `/payment-failed` | PaymentFailedPage | Auth |
| `/invoices` | InvoicesPage | Auth |
| `/commissions` | CommissionsPage | Auth |

### 🔧 Admin Routes
| Route | Component | Guard |
|-------|-----------|-------|
| `/admin` | AdminPage | Auth + Admin |
| `/admin/dashboard` | AdminDashboard | Auth + Admin |
| `/admin/ai-quotas` | AIQuotaManager | Auth |
| `/admin/algolia-sync` | AlgoliaSyncManager | Auth + Admin |
| `/admin/integration-status` | IntegrationStatusDashboard | Auth |
| `/admin/setup` | QuickSetupPage | Auth |
| `/admin/cloud-services` | CloudServicesManager | Auth |
| `/admin-car-management` | AdminCarManagementPage | Auth + Admin |
| `/super-admin/finance/manual-payments` | AdminManualPaymentsDashboard | Auth + Admin |

### 📜 Legal Routes
| Route | Component | Guard |
|-------|-----------|-------|
| `/privacy-policy` | PrivacyPolicyPage | None |
| `/terms-of-service` | TermsOfServicePage | None |
| `/data-deletion` | DataDeletionPage | None |
| `/cookie-policy` | CookiePolicyPage | None |
| `/sitemap` | SitemapPage | None |

### 🔍 SEO Landing Pages
| Route | Component |
|-------|-----------|
| `/city/:city` | CityCarsLandingPage |
| `/koli/:city` | CityCarsPage |
| `/koli/:city/:brand` | BrandCityPage |
| `/koli/novi` | NewCarsPage |
| `/koli/avarijni` | AccidentCarsPage |
| `/cars/:city` | LocationLandingPage |
| `/cars/:city/:brand` | LocationLandingPage |

---

## 🗄️ قاعدة البيانات | Database Collections

### Firestore Collections

#### 👥 User Management
| Collection | Description |
|------------|-------------|
| `users` | User profiles with numericId, email, displayName |
| `profiles` | Extended user profiles |
| `counters/users` | Global user counter for numeric ID assignment |
| `counters/cars/sellers/{sellerId}` | Per-seller car counter |

#### 🚗 Vehicle Collections (6 Types)
| Collection | Description |
|------------|-------------|
| `cars` | Legacy cars collection |
| `passenger_cars` | Passenger vehicles |
| `suvs` | SUVs and Jeeps |
| `vans` | Vans and MPVs |
| `motorcycles` | Motorcycles |
| `trucks` | Trucks |
| `buses` | Buses |

#### 💬 Messaging
| Collection | Description |
|------------|-------------|
| `conversations` | Chat conversations |
| `messages` | Individual messages |
| `messaging_analytics` | Message analytics |

#### 📱 Social Features
| Collection | Description |
|------------|-------------|
| `posts` | Social feed posts |
| `posts/{postId}/comments` | Post comments |
| `posts/{postId}/likes` | Post likes |
| `follows` | Follow relationships |
| `stories` | Instagram-style stories |

#### 💳 Payments & Subscriptions
| Collection | Description |
|------------|-------------|
| `customers/{uid}` | Stripe customer data |
| `customers/{uid}/checkout_sessions` | Checkout sessions |
| `customers/{uid}/subscriptions` | Active subscriptions |
| `transactions` | Payment transactions |
| `manual_payments` | Manual bank transfer payments |

#### 🏢 Business
| Collection | Description |
|------------|-------------|
| `dealerships` | Verified dealerships |
| `team_invitations` | Team invite codes |
| `users/{companyId}/team_members` | Company team members |

#### 📊 Analytics & Tracking
| Collection | Description |
|------------|-------------|
| `searchAnalytics` | Search query tracking |
| `searchClicks` | Search click tracking |
| `searchAggregates` | Popular searches |
| `workflow_analytics` | Sell workflow analytics |
| `listingMetrics` | Car listing metrics |

#### 🔔 Notifications
| Collection | Description |
|------------|-------------|
| `notifications` | User notifications |

#### 🤖 AI System
| Collection | Description |
|------------|-------------|
| `ai_quotas` | AI usage quotas per user |

#### 📢 Ads
| Collection | Description |
|------------|-------------|
| `ad_campaigns` | Internal ad campaigns |
| `ad_analytics` | Ad tracking |
| `campaigns` | Marketing campaigns |

#### ⭐ User Interactions
| Collection | Description |
|------------|-------------|
| `favorites` | Saved cars |
| `reviews` | User reviews |
| `blocked_users` | Block relationships |
| `trustConnections` | Trust network |

#### 📜 History & Reports
| Collection | Description |
|------------|-------------|
| `car_accident_reports` | Car accident history |
| `car_service_records` | Service history |
| `car_history_reports` | Generated history reports |

---

## 🔒 Security Rules Summary

### Authentication Helpers
```javascript
isAuthenticated() // request.auth != null
isOwner(userId)   // request.auth.uid == userId
```

### Key Rules
- **Cars**: Public read, authenticated create, owner-only update/delete
- **Users**: Authenticated read, owner-only write
- **Messages**: Participant-only access
- **Notifications**: Owner-only read, Cloud Functions create
- **Counters**: Strict increment-only updates
- **Ads**: Public read, safe stat increments

---

## 🔧 Services Layer الكاملة | Complete Services

### 🤖 AI Services (`services/ai/`)
| Service | Purpose |
|---------|---------|
| `gemini-chat.service.ts` | Gemini AI chat integration |
| `gemini-vision.service.ts` | Image analysis with Gemini |
| `gemini-analysis.service.ts` | Car analysis with AI |
| `ai-quota.service.ts` | AI usage quota management |
| `ai-router.service.ts` | AI provider routing |
| `deepseek-enhanced.service.ts` | DeepSeek AI integration |
| `openai.service.ts` | OpenAI integration |
| `whisper.service.ts` | Voice transcription |
| `vehicle-description-generator.service.ts` | AI car descriptions |

### 🔍 Search Services (`services/search/`)
| Service | Purpose |
|---------|---------|
| `algolia-search.service.ts` | Algolia integration |
| `smart-search.service.ts` | Intelligent search |
| `UnifiedSearchService.ts` | Unified search facade |
| `saved-searches.service.ts` | Saved search management |
| `search-history.service.ts` | Search history tracking |
| `bulgarian-synonyms.service.ts` | Bulgarian synonyms |

### 💬 Messaging Services (`services/messaging/`)
| Service | Purpose |
|---------|---------|
| `realtime/` | Real-time messaging |
| `core/` | Core messaging logic |
| `analytics/` | Message analytics |
| `ai-smart-suggestions.service.ts` | AI reply suggestions |
| `block-user.service.ts` | User blocking |
| `message-search.service.ts` | Message search |

### 💳 Billing Services (`services/billing/`)
| Service | Purpose |
|---------|---------|
| `billing-service.ts` | Main billing logic |
| `billing-operations.ts` | Billing operations |
| `stripe-service.ts` | Stripe integration |
| `commission-service.ts` | Commission calculation |

### 🚗 Car Services
| Service | Purpose |
|---------|---------|
| `sell-workflow-*.ts` | Car selling workflow |
| `car-service-loading-wrapper.ts` | Car data loading |
| `car-count.service.ts` | Car counting |
| `car-logo-service.ts` | Brand logos |
| `market-value.service.ts` | Price estimation |

### 👤 User Services
| Service | Purpose |
|---------|---------|
| `auth/` | Authentication |
| `profile/` | Profile management |
| `user/` | User operations |
| `favorites.service.ts` | Favorites management |

### 📊 Analytics Services
| Service | Purpose |
|---------|---------|
| `analytics-service.ts` | General analytics |
| `visitor-analytics-service.ts` | Visitor tracking |
| `workflow-analytics-service.ts` | Workflow tracking |

---

## ☁️ Cloud Functions الكاملة | Complete Cloud Functions

### 🔔 Notifications
| Function | Trigger |
|----------|---------|
| `onNewCarPosted` | New car listing |
| `onPriceUpdate` | Price change |
| `onNewMessage` | New message |
| `onCarViewed` | Car view |
| `onNewInquiry` | New inquiry |
| `onNewOffer` | New offer |
| `onVerificationUpdate` | Verification status |
| `dailyReminder` | Scheduled daily |
| `notifyFollowersOnNewCar` | Follower notification |
| `cleanupOldNotifications` | Cleanup old notifications |

### 🤖 AI Functions
| Function | Type |
|----------|------|
| `geminiChat` | Callable |
| `aiQuotaCheck` | Callable |
| `geminiPriceSuggestion` | Callable |
| `evaluateCar` | Callable |

### 🔄 Algolia Sync
| Function | Collection |
|----------|------------|
| `syncPassengerCarsToAlgolia` | passenger_cars |
| `syncSuvsToAlgolia` | suvs |
| `syncVansToAlgolia` | vans |
| `syncMotorcyclesToAlgolia` | motorcycles |
| `syncTrucksToAlgolia` | trucks |
| `syncBusesToAlgolia` | buses |
| `batchSyncAllCarsToAlgolia` | All collections |

### 📅 Scheduled Jobs
| Function | Schedule |
|----------|----------|
| `archiveSoldCars` | Daily |
| `cleanupExpiredDrafts` | Daily |
| `scheduledSitemapRegeneration` | Daily |

### 💳 Payment Webhooks
| Function | Purpose |
|----------|---------|
| `stripeWebhooks` | Stripe payment events |

### 🚗 Car Lifecycle Triggers
| Function | Event |
|----------|-------|
| `onPassengerCarDeleted` | Car deletion cleanup |
| `onPassengerCarSold` | Mark car as sold |
| (Same for all vehicle types) | |

### 📊 Analytics & SEO
| Function | Purpose |
|----------|---------|
| `requestIndexing` | Google indexing |
| `logSearchEvent` | BigQuery logging |
| `prerenderSEO` | Prerender pages |
| `sitemap` | Generate sitemap |
| `merchantFeedGenerator` | Google Shopping feed |

### 🖼️ Image Processing
| Function | Purpose |
|----------|---------|
| `optimizeUploadedImage` | WebP conversion |
| `cleanupDeletedImages` | Cleanup orphan images |

### 📈 B2B Analytics
| Function | Purpose |
|----------|---------|
| `exportB2BLeads` | Export leads |
| `getB2BAnalytics` | Get analytics |
| `exportB2BAnalytics` | Export analytics |

---

## 🎨 نظام الثيم | Theme System

### CSS Variables (unified-theme.css)
```css
/* Light Theme */
--bg-primary: #ffffff
--bg-secondary: #f8fafc
--bg-card: #ffffff
--text-primary: #1e293b
--text-secondary: #64748b
--accent-primary: #0066CC
--btn-primary-bg: #003366
--success: #28A745
--error: #CC0000

/* Dark Theme */
--bg-primary: #0F1419
--bg-secondary: #1a2027
--bg-card: #1e2632
--text-primary: #F8FAFC
--text-secondary: #94a3b8
--accent-primary: #3399FF
```

### Bulgarian Color Palette
```typescript
primary: '#003366'    // Dark Blue (header)
secondary: '#CC0000'  // Red (main buttons)
accent: '#0066CC'     // Blue (links)
success: '#28A745'    // Green
warning: '#FFC107'    // Yellow
error: '#CC0000'      // Red
```

---

## 🔄 State Management

### React Contexts
| Context | Purpose |
|---------|---------|
| `AuthContext` | Authentication state |
| `ThemeContext` | Dark/Light theme |
| `LanguageContext` | i18n (bg/en) |
| `FilterContext` | Search filters |
| `ProfileTypeContext` | User profile type |
| `LoadingContext` | Global loading state |

### Provider Stack Order (Critical!)
```
1. ThemeProvider (styled-components)
2. GlobalStyles
3. ErrorBoundary
4. LanguageProvider
5. CustomThemeProvider
6. AuthProvider
7. ProfileTypeProvider
8. ToastProvider
9. GoogleReCaptchaProvider
10. Router
11. FilterProvider
```

---

## 📱 Responsive Breakpoints

```typescript
xs: '320px'   // Extra small phones
sm: '480px'   // Small phones
md: '768px'   // Tablets
lg: '1024px'  // Laptops
xl: '1280px'  // Desktops
2xl: '1536px' // Large screens
```

---

## 🔐 Environment Variables

```bash
# Firebase
REACT_APP_FIREBASE_API_KEY=
REACT_APP_FIREBASE_AUTH_DOMAIN=
REACT_APP_FIREBASE_PROJECT_ID=
REACT_APP_FIREBASE_STORAGE_BUCKET=
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=
REACT_APP_FIREBASE_APP_ID=
REACT_APP_FIREBASE_MEASUREMENT_ID=
REACT_APP_FIREBASE_DATABASE_URL=

# Algolia
REACT_APP_ALGOLIA_APP_ID=
REACT_APP_ALGOLIA_SEARCH_KEY=

# Stripe
REACT_APP_STRIPE_PUBLISHABLE_KEY=

# Google
REACT_APP_GOOGLE_MAPS_API_KEY=
REACT_APP_RECAPTCHA_SITE_KEY=

# AI Services
REACT_APP_GEMINI_API_KEY=
REACT_APP_OPENAI_API_KEY=

# Feature Flags
REACT_APP_ADS_ENABLED=true
REACT_APP_AUTO_ADSENSE_ENABLED=true
```

---

## 📊 Key Types & Interfaces

### CarListing Interface
```typescript
interface CarListing {
  // IDs
  id?: string;
  numericId?: number;
  sellerNumericId?: number;
  
  // Basic Info
  vehicleType: string;
  make: string;
  model: string;
  year: number;
  mileage: number;
  
  // Technical
  fuelType: string;
  transmission: string;
  power?: number;
  engineSize?: number;
  
  // Pricing
  price: number;
  currency: string; // 'EUR'
  negotiable: boolean;
  
  // Seller
  sellerId: string;
  sellerType: string;
  sellerName: string;
  
  // Location
  city: string;
  region: string;
  
  // Status
  status: 'active' | 'sold' | 'draft' | 'expired' | 'deleted';
  
  // Media
  images?: string[];
  stories?: CarStory[];
}
```

### User Profile
```typescript
interface UserProfile {
  uid: string;
  numericId: number;
  email: string;
  displayName?: string;
  photoURL?: string;
  phoneNumber?: string;
  profileType: 'individual' | 'dealer' | 'company';
  isVerified: boolean;
  followersCount: number;
  followingCount: number;
}
```

---

## ✅ نقاط القوة | Strengths

1. **بنية منظمة** - تنظيم واضح للمجلدات والملفات
2. **TypeScript صارم** - أمان الأنواع في كل مكان
3. **6 أنواع مركبات** - تغطية شاملة للسوق
4. **AI متكامل** - Gemini + DeepSeek + OpenAI
5. **نظام URL رقمي** - خصوصية المستخدم
6. **دعم ثنائي اللغة** - Bulgarian + English
7. **نظام Theme كامل** - Dark/Light mode
8. **Algolia Search** - بحث سريع ودقيق
9. **Cloud Functions** - 50+ وظيفة سحابية
10. **Security Rules** - قواعد أمان صارمة

---

## ⚠️ نقاط تحتاج تحسين | Areas for Improvement

1. **عدد الملفات كبير** - 150+ service file
2. **بعض التكرار** - duplicate logic في بعض الأماكن
3. **اختبارات ناقصة** - تغطية الاختبارات محدودة
4. **توثيق داخلي** - بعض الملفات بدون توثيق
5. **Dead Code** - بعض الملفات غير مستخدمة في DDD/

---

## 🚀 أوامر التشغيل | Commands

```bash
# Development
npm start              # Start dev server (port 3000)
npm run start:dev      # Start with increased memory

# Build
npm run build          # Production build
npm run build:analyze  # Analyze bundle size

# Testing
npm test               # Run tests
npm run test:ci        # CI mode
npm run type-check     # TypeScript check

# Deploy
npm run deploy         # Deploy to Firebase
npm run deploy:hosting # Hosting only
npm run deploy:functions # Functions only

# Firebase
npm run emulate        # Run emulators
```

---

## 📞 معلومات الاتصال | Contact

- **Domain:** https://koli.one
- **Firebase Project:** fire-new-globul
- **Region:** Bulgaria (europe-west1)

---

> **ملاحظة:** هذا التوثيق تم إنشاؤه تلقائياً من تحليل المشروع ويجب تحديثه مع كل تغيير كبير.
