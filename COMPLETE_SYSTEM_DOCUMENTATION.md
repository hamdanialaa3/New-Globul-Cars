# Complete System Documentation - Bulgarski Mobili
## Comprehensive Technical Reference (Bulgarski Mobili / New Globul Cars)

> **Version**: 4.0.0 - Complete System Analysis  
> **Created**: December 26, 2025  
> **Status**: Production-Ready with Advanced Features  
> **Project Size**: 2,100+ Files | 180,000+ Lines of Code | 390+ Components | 107+ Services  
> **Constitution**: Strictly Compliant with `PROJECT_CONSTITUTION.md`

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Technology Stack](#2-technology-stack)
3. [Project Architecture](#3-project-architecture)
4. [Frontend Architecture](#4-frontend-architecture)
5. [Backend Architecture](#5-backend-architecture)
6. [Core Workflows](#6-core-workflows)
7. [Complete Feature List](#7-complete-feature-list)
8. [Services Layer](#8-services-layer)
9. [Bulgarian Market Compliance](#9-bulgarian-market-compliance)
10. [Development & Deployment](#10-development--deployment)
11. [Performance & Optimization](#11-performance--optimization)
12. [Future Roadmap](#12-future-roadmap)

---

## 1. Executive Summary

**Bulgarski Mobili** is a next-generation automotive marketplace platform designed specifically for the Bulgarian market, with capabilities to compete with established players like mobile.bg. The platform combines modern web technologies, AI-powered features, and strict compliance with Bulgarian regulations to deliver a superior user experience.

### Key Statistics
-  **Total Files**: 2,100+
- **Lines of Code**: 180,000+
- **React Components**: 390+
- **Backend Services**: 107+
- **Complete Features**: 50+
- **Cloud Functions**: 8
- **Supported Languages**: 2 (Bulgarian, English)
- **Vehicle Types Supported**: 6 (Cars, SUVs, Vans, Motorcycles, Trucks, Buses)

### Core Achievements
✅ **Strict Numeric ID System**: SEO-optimized URLs (`/car/80/5`)  
✅ **Multi-Step Sell Wizard**: 6-step guided selling process  
✅ **Real-time Messaging**: Instant buyer-seller communication  
✅ **Favorites System**: Complete with heart button animations  
✅ **AI Integration**: Google Gemini for descriptions and price suggestions  
✅ **Bulgarian Compliance**: EGN/EIK verification  
✅ **PWA Support**: Installable, offline-capable  
✅ **Multi-Provider Auth**: Google, Facebook, Apple, Phone, Email  

---

## 2. Technology Stack

### Frontend Technologies

#### Core Framework
- **React**: 18.3.1 (Latest stable)
- **TypeScript**: 4.9+ (Strict mode enabled)
- **React Router DOM**: 7.9.1 (Client-side routing)

#### Styling & UI
- **Styled Components**: 6.x (CSS-in-JS)
- **Framer Motion**: 12.x (Animations)
- **React Icons**: 5.x (Icon library)
- **Leaflet.js**: 1.9.x (Maps and geolocation)

#### State Management
- **React Context API**: 8 contexts (Auth, Language, Theme, ProfileType, Filter, Loading, Notification, Cart)
- **Zustand**: 4.x (Feature-specific state - car-listing)

#### Form & Validation
- **React Hook Form**: 7.x (Form state management)
- **Zod**: 3.x (Schema validation)
- **Yup**: 1.x (Alternative validation)

#### Data Fetching & Real-time
- **Firebase SDK**: 12.3.0 (Real-time database sync)
- **Axios**: 1.7.x (HTTP requests)
- **React Query**: 5.x (Server state management - future)

#### Development Tools
- **CRACO**: 7.x (Create React App Configuration Override)
- **ESLint**: 9.x (Code linting)
- **Prettier**: 3.x (Code formatting)
- **Jest**: 29.x (Unit testing)
- **React Testing Library**: 16.x (Component testing)

### Backend Technologies (Firebase)

#### Firebase Services
- **Firebase Authentication**: Multi-provider auth
- **Cloud Firestore**: NoSQL database
- **Firebase Cloud Storage**: File storage
- **Cloud Functions**: Serverless backend (Node.js 20)
- **Firebase Hosting**: Static site hosting
- **Firebase Cloud Messaging**: Push notifications
- **Firebase Analytics**: User analytics
- **Firebase Performance**: Performance monitoring

#### Third-Party Integrations
- **Algolia**: Advanced search (optional)
- **Stripe**: Payment processing
- **Google Gemini AI**: AI features (description generation, price suggestions)
- **Google Maps API**: Geolocation services
- **Twilio**: SMS verification (optional)
- **SendGrid**: Email delivery (optional)

#### Build & Deployment
- **Firebase CLI**: Deployment tool
- **GitHub**: Version control
- **GitHub Actions**: CI/CD (optional)
- **Node.js**: 18.x / 20.x (Cloud Functions runtime)
- **npm**: 9.x (Package manager)

---

## 3. Project Architecture

### Architectural Patterns

#### 1. Single Page Application (SPA)
- Client-side routing
- Dynamic content loading
- No full page reloads
- Fast navigation

#### 2. Component-Based Architecture
- 390+ reusable components
- Atomic Design principles
- Separation of concerns
- High cohesion, low coupling

#### 3. Service Layer Pattern
- 107+ service files
- Singleton pattern for stateful services
- Centralized business logic
- Testable and maintainable

#### 4. Context-Based State Management
- 8 React Contexts for global state
- Zustand for feature-specific state
- No Redux (simpler architecture)

#### 5. Multi-Collection Database Design
- Vehicle-type-specific Firestore collections
- Optimized queries
- Reduced costs
- Better performance

---

## 4. Frontend Architecture

### Directory Structure (Complete Map)

```
bulgarian-car-marketplace/
├── public/                           # Static assets (served as-is)
│   ├── index.html                    # Entry HTML file
│   ├── manifest.json                 # PWA manifest
│   ├── firebase-messaging-sw.js      # Service worker for FCM
│   ├── service-worker.js             # General service worker
│   ├── offline.html                  # Offline fallback page
│   ├── robots.txt                    # SEO robots file
│   ├── sitemap.xml                   # SEO sitemap (auto-generated)
│   ├── car-logos/                    # 200+ brand logos (WebP format)
│   ├── media/                        # Static images and videos
│   └── data/                         # JSON data files
│
├── src/                              # Source code root (180K+ LOC)
│   │
│   ├── index.tsx                     # React entry point
│   ├── App.tsx                       # Root component (providers setup)
│   ├── service-worker.ts             # PWA service worker (TypeScript)
│   ├── setupTests.ts                 # Jest setup
│   │
│   ├── assets/                       # Imported assets (bundled)
│   │   ├── images/                   # Image assets
│   │   ├── icons/                    # SVG icons
│   │   ├── fonts/                    # Custom fonts
│   │   └── videos/                   # Video assets
│   │
│   ├── components/                   # Reusable UI components (390+)
│   │   ├── auth/                     # Authentication components
│   │   │   ├── LoginForm.tsx
│   │   │   ├── RegisterForm.tsx
│   │   │   ├── SocialLoginButtons.tsx
│   │   │   ├── PhoneVerification.tsx
│   │   │   └── GuestExpirationModal.tsx
│   │   ├── car/                      # Car-related components
│   │   │   ├── CarCard.tsx           # Main car card component
│   │   │   ├── CarImageGallery.tsx   # Image gallery with zoom
│   │   │   ├── CarBasicInfo.tsx      # Basic info display
│   │   │   ├── CarEquipmentDisplay.tsx
│   │   │   └── CarContactButtons.tsx # Contact action buttons
│   │   ├── common/                   # Common UI elements
│   │   │   ├── Button.tsx
│   │   │   ├── Input.tsx
│   │   │   ├── Dropdown.tsx
│   │   │   ├── Modal.tsx
│   │   │   ├── Toast.tsx
│   │   │   ├── Loading.tsx
│   │   │   └── ErrorBoundary.tsx
│   │   ├── forms/                    # Form components
│   │   │   ├── BrandModelSelector.tsx
│   │   │   ├── YearSelector.tsx
│   │   │   ├── PriceRangeSlider.tsx
│   │   │   ├── LocationPicker.tsx
│   │   │   └── ImageUploader.tsx
│   │   ├── layout/                   # Layout components
│   │   │   ├── Header.tsx
│   │   │   ├── Footer.tsx
│   │   │   ├── Sidebar.tsx
│   │   │   ├── MainLayout.tsx
│   │   │   └── FullScreenLayout.tsx
│   │   ├── messaging/                # Messaging UI
│   │   │   ├── ConversationList.tsx
│   │   │   ├── ChatWindow.tsx
│   │   │   ├── MessageBubble.tsx
│   │   │   ├── TypingIndicator.tsx
│   │   │   └── QuickRepliesPanel.tsx
│   │   ├── notifications/            # Notification UI
│   │   │   ├── NotificationBell.tsx
│   │   │   ├── NotificationCenter.tsx
│   │   │   ├── NotificationItem.tsx
│   │   │   └── NotificationSettings.tsx
│   │   ├── search/                   # Search UI
│   │   │   ├── QuickSearchBar.tsx
│   │   │   ├── AdvancedSearchFilters.tsx
│   │   │   ├── SearchResults.tsx
│   │   │   ├── FilterChips.tsx
│   │   │   └── SavedSearches.tsx
│   │   ├── guards/                   # Route protection
│   │   │   ├── AuthGuard.tsx         # Requires authentication
│   │   │   ├── AdminGuard.tsx        # Requires admin role
│   │   │   └── NumericIdGuard.tsx    # Handles numeric ID validation
│   │   ├── admin/                    # Admin-specific components
│   │   │   ├── UserManagementTable.tsx
│   │   │   ├── ListingModerationQueue.tsx
│   │   │   ├── MarketStatsCharts.tsx
│   │   │   └── AdminControlPanel.tsx
│   │   └── SellWorkflow/             # Complex car selling wizard
│   │       ├── SellVehicleWizard.tsx # Main wizard component (900+ lines)
│   │       ├── ProgressIndicator.tsx
│   │       ├── StepNavigation.tsx
│   │       └── steps/                # Individual wizard steps
│   │           ├── VehicleTypeStep.tsx
│   │           ├── VehicleDataStep.tsx
│   │           ├── EquipmentStep.tsx
│   │           ├── ImagesStep.tsx
│   │           ├── PricingStep.tsx
│   │           └── DescriptionStep.tsx
│   │
│   ├── pages/                        # Page components (organized in folders)
│   │   ├── 01_main-pages/           # Core pages
│   │   │   ├── home/                 # Homepage (lazy-loaded sections)
│   │   │   │   ├── HomePage/
│   │   │   │   │   ├── index.tsx     # Main homepage
│   │   │   │   │   ├── HeroSection.tsx
│   │   │   │   │   ├── NewCarsSection.tsx
│   │   │   │   │   ├── PopularBrandsSection.tsx (lazy)
│   │   │   │   │   ├── FeaturedCarsSection.tsx (lazy)
│   │   │   │   │   └── TestimonialsSection.tsx (lazy)
│   │   │   ├── NumericCarDetailsPage.tsx   # Car details with numeric IDs
│   │   │   ├── NumericMessagingPage.tsx    # Messaging page
│   │   │   └── NotFoundPage.tsx            # 404 error page
│   │   ├── 02_authentication/        # Auth pages
│   │   │   ├── LoginPage.tsx
│   │   │   ├── RegisterPage.tsx
│   │   │   ├── ForgotPasswordPage.tsx
│   │   │   └── VerifyEmailPage.tsx
│   │   ├── 03_user-profile/          # Profile pages
│   │   │   ├── UserProfilePage.tsx
│   │   │   ├── UserDashboard.tsx
│   │   │   ├── UserFavoritesPage.tsx   # NEW - Complete favorites implementation
│   │   │   ├── UserListingsPage.tsx
│   │   │   ├── UserDraftsPage.tsx
│   │   │   └── UserSettingsPage.tsx
│   │   ├── 04_car-management/        # Listing management
│   │   │   ├── AddCarPage.tsx        # Opens sell wizard
│   │   │   ├── EditCarPage.tsx
│   │   │   └── MyListingsPage.tsx
│   │   ├── 05_search-browse/         # Search pages
│   │   │   ├── SearchResultsPage.tsx
│   │   │   ├── AdvancedSearchPage.tsx
│   │   │   ├── VisualSearchPage.tsx  # AI image search
│   │   │   ├── VoiceSearchPage.tsx   # Voice search
│   │   │   └── BrowseByCategoryPage.tsx
│   │   ├── 06_admin/                 # Admin panel
│   │   │   ├── SuperAdminDashboard.tsx
│   │   │   ├── UserManagementPage.tsx
│   │   │   ├── ListingModerationPage.tsx
│   │   │   ├── MarketStatsPage.tsx
│   │   │   └── SystemConfigPage.tsx
│   │   ├── 07_legal-info/            # Legal pages
│   │   │   ├── TermsOfServicePage.tsx
│   │   │   ├── PrivacyPolicyPage.tsx
│   │   │   ├── CookiePolicyPage.tsx
│   │   │   └── AboutUsPage.tsx
│   │   ├── 08_analytics/             # Analytics
│   │   │   ├── PrivateAnalyticsDashboard.tsx
│   │   │   ├── DealerAnalyticsDashboard.tsx
│   │   │   └── CompanyAnalyticsDashboard.tsx
│   │   ├── 09_billing/               # Billing & payments
│   │   │   ├── SubscriptionPlansPage.tsx
│   │   │   ├── CheckoutPage.tsx
│   │   │   ├── PaymentSuccessPage.tsx
│   │   │   └── BillingHistoryPage.tsx
│   │   ├── 10_b2b-portal/            # B2B features
│   │   │   ├── DealerPortalPage.tsx
│   │   │   ├── CompanyPortalPage.tsx
│   │   │   ├── TeamManagementPage.tsx
│   │   │   └── APIAccessPage.tsx
│   │   └── 11_iot-ai/                # IoT & AI dashboards
│   │       ├── IoTDashboard.tsx
│   │       ├── AIChatbotPage.tsx
│   │       └── SmartInsightsPage.tsx
│   │
│   ├── features/                     # Complex feature modules (self-contained)
│   │   ├── car-listing/              # Sell workflow (6-step wizard)
│   │   │   ├── components/           # Wizard components
│   │   │   ├── store/                # Zustand store
│   │   │   │   └── carListingStore.ts
│   │   │   ├── schemas/              # Zod validation schemas
│   │   │   │   └── carListingSchemas.ts
│   │   │   ├── services/             # Feature services
│   │   │   │   ├── SellWorkflowService.ts
│   │   │   │   ├── SellWorkflowImages.ts
│   │   │   │   ├── SellWorkflowValidation.ts
│   │   │   │   └── SellWorkflowCollections.ts
│   │   │   └── index.ts              # Public API
│   │   ├── analytics/                # Analytics dashboards
│   │   │   ├── components/
│   │   │   ├── services/
│   │   │   └── types/
│   │   ├── billing/                  # Stripe integration
│   │   │   ├── components/
│   │   │   ├── services/
│   │   │   └── types/
│   │   ├── verification/             # Document verification
│   │   │   ├── components/
│   │   │   ├── services/
│   │   │   └── types/
│   │   ├── team/                     # Team management
│   │   │   ├── TeamManagement.tsx
│   │   │   ├── components/
│   │   │   └── services/
│   │   ├── posts/                    # Social posts
│   │   │   ├── components/
│   │   │   └── services/
│   │   └── reviews/                  # Reviews & ratings
│   │       ├── components/
│   │       └── services/
│   │
│   ├── services/                     # Business logic layer (107+ files)
│   │   ├── car/                      # Car services (12 files)
│   │   │   ├── UnifiedCarService.ts  ⭐ Main car service
│   │   │   ├── car-stats-service.ts
│   │   │   ├── car-validation-service.ts
│   │   │   └── ...
│   │   ├── search/                   # Search services (15 files)
│   │   │   ├── UnifiedSearchService.ts  ⭐ Main search service
│   │   │   ├── firestoreQueryBuilder.ts
│   │   │   ├── queryOrchestrator.ts
│   │   │   ├── multi-collection-helper.ts
│   │   │   ├── AlgoliaSearchService.ts
│   │   │   ├── visual-search-service.ts
│   │   │   └── voice-search-service.ts
│   │   ├── auth/                     # Auth services (8 files)
│   │   │   ├── social-auth-service.ts
│   │   │   ├── phone-auth-service.ts
│   │   │   └── ...
│   │   ├── messaging/                # Messaging services (5 files)
│   │   │   ├── MessagingService.ts
│   │   │   ├── ConversationService.ts
│   │   │   ├── advanced-messaging-service.ts
│   │   │   └── ...
│   │   ├── notifications/            # Notification services (6 files)
│   │   │   ├── NotificationService.ts
│   │   │   ├── fcm-service.ts
│   │   │   ├── email-notification-service.ts
│   │   │   └── ...
│   │   ├── favorites/                # Favorites services (3 files)
│   │   │   ├── FavoritesService.ts   ⭐ Main favorites service
│   │   │   └── user-favorites-service.ts
│   │   ├── ai/                       # AI services (6 files)
│   │   │   ├── gemini-service.ts     # Google Gemini integration
│   │   │   ├── ai-chat-service.ts
│   │   │   ├── ai-description-generator.ts
│   │   │   ├── ai-price-suggestion.ts
│   │   │   └── ...
│   │   ├── analytics/                # Analytics services (5 files)
│   │   │   ├── analytics-service.ts
│   │   │   ├── lead-scoring-service.ts
│   │   │   └── ...
│   │   ├── billing/                  # Billing services (7 files)
│   │   │   ├── stripe-service.ts
│   │   │   ├── billing-service.ts
│   │   │   ├── invoice-service.ts
│   │   │   └── ...
│   │   ├── admin/                    # Admin services (10 files)
│   │   │   ├── admin-service.ts
│   │   │   ├── moderation-service.ts
│   │   │   ├── usersReportService.ts
│   │   │   ├── carsReportService.ts
│   │   │   ├── AdminDataFix.ts
│   │   │   └── ...
│   │   ├── numeric-ids/              # Numeric ID system (5 files)
│   │   │   ├── numeric-car-system.service.ts   ⭐ Car numeric IDs
│   │   │   ├── numeric-id-assignment.service.ts
│   │   │   ├── numeric-id-lookup.service.ts
│   │   │   └── ...
│   │   ├── bulgarian-compliance/     # Bulgarian compliance (6 files)
│   │   │   ├── bulgarian-compliance-service.ts   # EGN validation
│   │   │   ├── eik-verification-service.ts      # EIK verification
│   │   │   ├── bulgarian-profile-service.ts
│   │   │   └── ...
│   │   └── utils/                    # Utility services (25 files)
│   │       ├── logger-service.ts     ⭐ Centralized logging
│   │       ├── error-handling-service.ts
│   │       ├── validation-service.ts
│   │       ├── bulgaria-locations-service.ts
│   │       ├── image-compression-service.ts
│   │       ├── seo-service.ts
│   │       └── ...
│   │
│   ├── contexts/                     # React Context providers (8 contexts)
│   │   ├── AuthProvider.tsx          # Authentication state
│   │   ├── ProfileTypeContext.tsx    # User profile type (Private/Dealer/Company)
│   │   ├── LanguageContext.tsx       # i18n (bg/en)
│   │   ├── ThemeContext.tsx          # Dark/light mode
│   │   ├── FilterContext.tsx         # Search filters
│   │   ├── LoadingContext.tsx        # Global loading states
│   │   ├── NotificationContext.tsx   # Notifications
│   │   └── index.ts                  # Barrel exports
│   │
│   ├── hooks/                        # Custom React hooks (20+)
│   │   ├── useAuth.ts
│   │   ├── useLanguage.ts
│   │   ├── useTheme.ts
│   │   ├── useDebounce.ts
│   │   ├── useIntersectionObserver.ts
│   │   ├── useLocalStorage.ts
│   │   ├── useWindowSize.ts
│   │   └── ...
│   │
│   ├── types/                        # TypeScript definitions (source of truth)
│   │   ├── user/                     # User types
│   │   │   └── bulgarian-user.types.ts  # Canonical user types
│   │   ├── CarListing.ts             # Car listing types (476 lines, 150+ fields)
│   │   ├── Message.ts                # Message types
│   │   ├── Notification.ts           # Notification types
│   │   ├── Subscription.ts           # Subscription types
│   │   ├── Analytics.ts              # Analytics types
│   │   └── index.ts                  # Type exports
│   │
│   ├── routes/                       # Route definitions (modular approach)
│   │   ├── MainRoutes.tsx            # Main app routes (361 lines)
│   │   ├── NumericProfileRouter.tsx  # Profile routes (196 lines)
│   │   └── NumericCarRedirect.tsx    # Legacy UUID → Numeric redirects (88 lines)
│   │
│   ├── layouts/                      # Layout components
│   │   ├── MainLayout.tsx            # Default layout (header + content + footer)
│   │   └── FullScreenLayout.tsx      # Full-screen layout (no header/footer)
│   │
│   ├── utils/                        # Utility functions (30+ files)
│   │   ├── lazyImport.ts             # safeLazy() wrapper for code splitting
│   │   ├── listing-limits.ts         # Listing limit checks
│   │   ├── date-utils.ts             # Date formatting
│   │   ├── number-utils.ts           # Number formatting
│   │   ├── url-utils.ts              # URL helpers
│   │   ├── storage-utils.ts          # LocalStorage/SessionStorage helpers
│   │   └── ...
│   │
│   ├── styles/                       # Global styles
│   │   ├── theme.ts                  # Theme configuration (colors, fonts, breakpoints)
│   │   ├── GlobalStyles.ts           # Global CSS (resets, typography)
│   │   └── variables.css             # CSS custom properties
│   │
│   └── firebase/                     # Firebase configuration
│       ├── firebase-config.ts        # Firebase initialization
│       └── firestore-helpers.ts      # Firestore utility functions
│
├── functions/                        # Cloud Functions (Node.js 20)
│   ├── src/
│   │   ├── index.ts                  # Functions entry point (exports all functions)
│   │   ├── ai-functions.ts           # AI endpoints (Gemini integration)
│   │   ├── image-optimizer.ts        # Image processing (thumbnails, WebP)
│   │   ├── sitemap.ts                # SEO sitemap generation
│   │   ├── merchant-feed.ts          # Google Shopping feed
│   │   ├── facebook-ads-sync.ts      # Facebook Catalog sync
│   │   ├── google-ads-sync.ts        # Google Ads sync
│   │   └── notifications/            # Notification triggers
│   │       ├── onNewMessage.ts
│   │       ├── onFavoriteAdded.ts
│   │       ├── onListingApproved.ts
│   │       └── onPriceChange.ts
│   ├── package.json
│   └── tsconfig.json
│
├── scripts/                          # Development & maintenance scripts
│   ├── ban-console.js                # Pre-build check (no console.log allowed)
│   ├── optimize-images.js            # Image optimization (WebP conversion)
│   ├── migrate-isActive.ts           # Data migration script
│   ├── clear-dev-caches.ps1          # Cache clearing (PowerShell)
│   ├── START_DEV_HOT_RELOAD.bat      # Windows dev server launcher
│   ├── QUICK_REBUILD.bat             # Fast production build
│   └── RESTART_SERVER.bat            # Firebase emulator restart
│
├── docs/                             # Documentation (50+ files)
│   ├── STRICT_NUMERIC_ID_SYSTEM.md
│   ├── AI_SERVICES_IMPLEMENTATION_CHECKLIST.md
│   ├── CODE_REVIEW_FACEBOOK_INTEGRATION.md
│   ├── FAVORITES_SYSTEM_DELIVERY.md
│   ├── HEART_BUTTON_IMPLEMENTATION.md
│   └── ... (45+ more documentation files)
│
├── build/                            # Production build (generated, not in Git)
├── node_modules/                     # Dependencies (not in Git)
│
├── .env                              # Environment variables (not in Git)
├── .env.example                      # Environment template
├── .gitignore                        # Git ignore rules
├── package.json                      # NPM dependencies & scripts
├── tsconfig.json                     # TypeScript configuration
├── craco.config.js                   # Create React App config override
├── jest.config.js                    # Jest test configuration
├── firebase.json                     # Firebase configuration
├── firestore.rules                   # Firestore security rules
├── storage.rules                     # Storage security rules
└── README.md                         # Project readme
```

*(Continued in next message due to length...)*
