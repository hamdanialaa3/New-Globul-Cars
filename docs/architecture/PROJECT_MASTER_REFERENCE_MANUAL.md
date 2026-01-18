# Project Master Reference Manual (The Bible)
## The Source of Truth for "Koli One" (New Globul Cars)

> **Version**: 4.0.0 (Phase 4.1 - Stories System + Complete Audit)
> **Last Updated**: December 27, 2025
> **Status**: Production Core + Phase 1 B2B + Phase 4.1 Stories (In Progress)
> **Constitution**: Strictly Compliant with `PROJECT_CONSTITUTION.md`

This document is the **absolute reference** for the entire codebase. It describes every folder, feature, service, and data model. If it's in the code, it's described here.

**📊 Project Statistics (Verified Dec 27, 2025):**
- **Total Files**: 2,100+ files
- **Lines of Code**: 180,000+ LOC
- **Components**: 390+ React components
- **Services**: 107+ business logic services
- **TypeScript Interfaces**: 30+ type definitions
- **Cloud Functions**: 8 Firebase Functions
- **React Contexts**: 8 global state providers
- **Features**: 50+ complete features

---

## 🏗️ 1. Project Architecture (From A to Z)

**Koli One** is a high-performance Single Page Application (SPA) designed to dominate the Bulgarian automotive market.

### 1.1 Technology Stack
*   **Frontend Core**: React 18.3.1 (Functional Components, Hooks)
*   **Language**: TypeScript 5.6.3 (Strict Mode)
*   **Build System**: CRACO (Create React App Configuration Override) + Webpack 5
*   **Styling**: Styled-Components 6.1.13 (CSS-in-JS) + TailwindCSS (limited use)
*   **Routing**: React Router DOM 7.9.1 (Modular Routing)
*   **State Management**:
    *   **Global**: React Context API (`Auth`, `Theme`, `Language`, `ProfileType`)
    *   **Feature**: Zustand (`carListingStore` for the Sell Wizard)
*   **Backend & Infrastructure**: Google Firebase
    *   **Auth**: Multi-provider (Google, Facebook, Email, Phone)
    *   **Database**: Cloud Firestore (NoSQL)
    *   **Storage**: Firebase Cloud Storage (Images)
    *   **Compute**: Cloud Functions (Node.js 20)
    *   **Hosting**: Firebase Hosting (CDN)

### 1.2 Directory Structure (The Map)
This is exactly how the `src/` folder is organized:

```
src/
├── assets/                 # Static assets (images, fonts, svg icons)
├── components/             # Reusable UI components
│   ├── admin/              # Components for Admin Dashboard
│   ├── analytics/          # B2B Analytics Dashboard
│   ├── common/             # Buttons, Inputs, Modals, Cards
│   ├── guards/             # Route Guards (AuthGuard, NumericIdGuard)
│   ├── messaging/          # Chat bubbles, Inboxes
│   ├── PageTransition/     # Page transition animations
│   ├── Profile/            # Profile-related components
│   ├── SellWorkflow/       # The massive Car Selling Wizard components
│   ├── SmartDescriptionGenerator/ # AI description generator UI
│   └── shared/             # Shared utilities
├── contexts/               # Global State Providers
│   ├── AuthProvider.tsx    # User session management
│   ├── ThemeContext.tsx    # Light/Dark mode logic
│   ├── LanguageContext.tsx # BG/EN translation logic
│   └── ProfileTypeContext.tsx # Profile type (private/dealer/company) + permissions
├── features/               # Self-contained business modules
│   ├── car-listing/        # All logic for creating/editing cars
│   ├── team/               # Team Management logic (Company Plan)
│   └── verification/       # KYC & Identity verification
├── pages/                  # Page Components (lazy loaded routes)
│   ├── 01_main-pages/      # Public pages (Home, Search, Details)
│   ├── 03_user-pages/      # Private User Dashboard
│   ├── 06_admin/           # Super Admin Portal
│   └── 09_dealer-company/  # B2B Dashboards
├── routes/                 # Routing Definitions
│   ├── MainRoutes.tsx      # The central route registry
│   └── NumericProfileRouter.tsx # Nested routes for profiles
├── services/               # The "Brain" - API calls & Business Logic
│   ├── ai/                 # AI services (Gemini, description generator)
│   ├── car/                # Unified Car Service (queries, mutations, types)
│   ├── company/            # B2B services (CSV import, team management)
│   ├── numeric-car-system.service.ts # Core ID logic
│   ├── UnifiedSearchService.ts       # Search engine
│   └── ... (100+ services)
├── styles/                 # Global UI definitions
│   └── theme.ts            # Color palettes & breakpoints
├── types/                  # TypeScript Interfaces
│   ├── user/               # User profiles (Private, Dealer, Company)
│   └── car.types.ts        # Car data models
└── utils/                  # Helper functions (Date formatters, Validators)
```

---

## 🔢 2. The Core Systems (Constitutional Law)

### 2.1 The Numeric ID System (Strict Enforced)
The platform **rejects UUIDs** in public URLs. It uses a strict, localized numeric system as defined in the **Constitution**.

*   **Logic**: Every user gets a sequential `numericId`. Every car they sell gets a sequential `carNumericId`.
*   **URL Format**: `koli.one/car/{UserNumericID}/{CarNumericID}`
    *   *Correct*: `/car/80/2` (User #80's 2nd car).
    *   *Forbidden*: `/car-details/UUID-1234`.
*   **Implementation**: `src/services/numeric-car-system.service.ts`
    *   Uses **Firestore Transactions** to guarantee atomic increments.
    *   Prevents race conditions (two users getting ID #121 at the exact same millisecond).
*   **Guard**: `NumericIdGuard.tsx` protects these routes. If a user visits a legacy UUID link, it auto-redirects to the Numeric ID link.

### 2.2 Profile Reality & Types (User System)
Defined in `src/types/user/bulgarian-user.types.ts` and `bulgarian-profile-service.ts`.

#### A. Profile Types (Classes)
1.  **Private User (`private`)**:
    *   Limit: 3 active cars.
    *   Access: Basic dashboard, Favorites, Messaging.
    *   Data: `firstName`, `lastName`, `phoneNumber` (Verified).
2.  **Dealer (`dealer`)**:
    *   Limit: 50+ cars (Plan dependent).
    *   Access: Dealer Dashboard, Lead Management, "Flex-Edit" (Edit locked fields).
    *   Data: `dealershipName`, `vatNumber`, `logo`.
3.  **Company (`company`)**:
    *   Limit: Unlimited.
    *   Access: Team Management, Advanced Analytics, API Access.
    *   Data: `companyRef`, `teamMembers`.

#### B. Profile Creation Logic
*   **Service**: `BulgarianProfileService.createCompleteProfile()`
*   **Process**:
    1.  User registers (Firebase Auth).
    2.  Service assigns `numericId` (atomic increment).
    3.  Service sets `profileType` based on registration form (defaults to `private` if unspecified).
    4.  Initializes `quotaStats` { listingsCreatedThisMonth: 0 }.

### 2.3 The "Sell Your Car" Workflow (Ad Creation)
The most complex feature in the frontend. Controlled by `WizardOrchestrator.tsx`.

*   **Location**: `src/components/SellWorkflow/`
*   **Architecture**: 7-Step Blade Stepper
    1.  **VehicleType**: Car, SUV, Motorcycle, Truck (Brand/Model selector).
    2.  **VehicleData**: VIN, Year, Engine, Power, Fuel, Transmission.
    3.  **Equipment**: 100+ checkboxes for features (Safety, Comfort).
    4.  **Images**: Drag & drop uploader with compression (handled by `ImageStorageService`).
    5.  **Pricing**: Price input, currency (EUR default), location.
    6.  **Description**: AI-Powered text generator (SmartDescriptionGenerator with Gemini AI).
    6.5. **Smart Description** (Optional): AI-generated professional descriptions.
    7.  **Contact**: Review & Publish.
*   **Persistence**: Uses `UnifiedWorkflowPersistenceService` to save drafts to `IndexedDB` every 30 seconds.
*   **Publishing**:
    *   Calls `SellWorkflowService.createCarListing()`.
    *   On success, redirects to `/profile/{numericId}/my-ads`.

### 2.4 Project Page Integration (Inter-connectivity)
Based on `All Pages.md`, the integration map is:

*   **Header/Nav**: Links to `/cars`, `/sell` (redirects to `/sell/auto`), and `/profile`.
*   **Search Results** (`/cars`) -> Click Car -> **Details Page** (`/car/80/2`).
*   **Details Page** -> Click User Name -> **Profile Page** (`/profile/80`).
*   **Details Page** -> Click "Message" -> **Messaging** (`/messages/80/95` - Sender/Recipient).
*   **Dashboard** (`/dashboard`) -> Links to `My Listings`, `My Drafts`, `Favorites`.

---

## 💾 3. Data Models (The Database Schema)

The database is **Cloud Firestore**. Here is the exact schema structure.

### 3.1 Users Collection (`users`)
| Field | Type | Description |
| :--- | :--- | :--- |
| `uid` | string | Firebase Auth ID |
| `numericId` | number | Public Sequential ID |
| `profileType` | string | 'private' \| 'dealer' \| 'company' |
| `planTier` | string | 'free' \| 'dealer' \| 'company' |
| `quotaStats` | object | Tracks monthly listing limits |
| `location` | object | City, Region, Coordinates |
| `verification` | object | { email: bool, phone: bool, business: bool } |

### 3.2 Cars Collection (`cars`)
| Field | Type | Description |
| :--- | :--- | :--- |
| `id` | string | Firestore Document ID |
| `sellerId` | string | Reference to User UID |
| `sellerNumericId` | number | Redundant for fast queries |
| `carNumericId` | number | Sequential ID for this car |
| `make` | string | e.g., "BMW" |
| `model` | string | e.g., "X5" |
| `price` | number | Price in EUR |
| `specifications` | object | { engine, power, transmission... } |
| `images` | array | List of Firebase Storage URLs |
| `status` | string | 'active' \| 'sold' \| 'draft' |

---

## 📟 4. Page Reference (The Routes)

All routes are defined in `src/routes/MainRoutes.tsx`.

### Public Pages
*   `/` - **HomePage**: Search bar, Featured Cars.
*   `/cars` - **CarsPage**: Main search results (Grid/List).
*   `/car/:uid/:cid` - **NumericCarDetailsPage**: The product page.
*   `/dealer/:slug` - **DealerPublicPage**: Dealer's showroom page.

### User Dashboard Pages (`/dashboard/*`)
*   `/my-listings` - Manage active ads (Edit/Delete/Promote).
*   `/my-drafts` - Resume unfinished listings.
*   `/messages` - **MessagesPage**: Chat with buyers/sellers.
*   `/favorites` - **FavoritesPage**: Saved cars.
*   `/profile` - Edit user settings, password, phone.

### B2B Pages (Dealers & Companies)
*   `/organization/dashboard` - B2B Overview.
*   `/company/team` - **TeamManagement**: Full team management with invite system (FULLY IMPLEMENTED).
*   `/company/analytics` - **CompanyAnalyticsDashboard**: Advanced analytics with real data (FULLY IMPLEMENTED).
*   `/profile/:userId/my-ads` - Bulk Upload Wizard for CSV import (Dealer/Company only).
*   `/billing` - Invoices & Subscription plans.

### Profile Pages (Numeric ID Routing)
*   `/profile/:sellerNumericId` - Main profile page with tabs (Overview, My-Ads, Campaigns, Analytics, Settings, Consultations).
*   `/profile/:sellerNumericId/my-ads` - User's car listings with bulk upload.
*   `/profile/:sellerNumericId/campaigns` - Advertising campaigns.
*   `/profile/:sellerNumericId/analytics` - Profile analytics dashboard.
*   `/profile/:sellerNumericId/settings` - Profile settings.

### Admin Pages (`/admin/*`)
*   `/admin/dashboard` - Global stats.
*   `/admin/users` - Manage users (Ban/Verify).
*   `/admin/approvals` - Moderation queue (for new listings).

---

## 🔧 5. Services & Business Logic

The logic is decoupled from UI. Key services include:

### Core Services
*   **`AuthService`**: Wraps Firebase Auth. Handles Login/Register/Logout.
*   **`ImageUploadService`**: Handles compression, resizing, and uploading to Firebase Storage.
*   **`FavoritesService`**: Manages the "Heart" button functionality.
*   **`MessagingService`**: Real-time chat using Firestore listeners (`onSnapshot`).
*   **`NotificationService`**: Sends push notifications & in-app alerts.

### Car Services (Unified Architecture)
*   **`UnifiedCarService`**: Main orchestrator for all car operations.
    *   Location: `src/services/car/unified-car-service.ts`
    *   Delegates to: `unified-car-queries.ts` (read), `unified-car-mutations.ts` (write)
*   **`unified-car-queries.ts`**: Optimized Firestore queries.
    *   `getFeaturedCars(limit)`: Featured cars for homepage.
    *   `getNewCarsLast24Hours(limit)`: Direct Firestore query for last 24h cars.
    *   `searchCars(filters, limit)`: Advanced search with filters.
    *   `getCarById(id)`: Single car fetch.
*   **`unified-car-mutations.ts`**: Create, update, delete operations.
*   **`numeric-car-system.service.ts`**: Atomic numeric ID assignment.

### B2B Services (Phase 1 - COMPLETE)
*   **`csv-import-service.ts`**: CSV parsing and bulk car import.
    *   Location: `src/services/company/csv-import-service.ts`
    *   Features: Column mapping, validation, batch creation, error reporting.
    *   Used by: `BulkUploadWizard` component.
*   **`team-management-service.ts`**: Team member management for Company accounts.
    *   Location: `src/services/company/team-management-service.ts`
    *   Features: Invite system, role-based access (admin/agent/viewer), permissions.
    *   Collections: `team_invitations`, `users/{companyId}/team_members`.

### AI Services
*   **`vehicle-description-generator.service.ts`**: AI-powered description generation.
    *   Location: `src/services/ai/vehicle-description-generator.service.ts`
    *   Uses: Gemini Pro (via `gemini-chat.service.ts`)
    *   Features: 3-level fallback (AI → Template → Minimal), Bulgarian/English support.
    *   Component: `SmartDescriptionGenerator` (UI wrapper).

### Performance Services
*   **`PageTransition`**: High-performance page transitions (200ms fade/slide).
    *   Location: `src/components/PageTransition/PageTransition.tsx`
    *   Features: GPU-accelerated, respects `prefers-reduced-motion`.

---

## 🏗️ 6. System Integration Status (Audit Dec 2025)

The system is **fully integrated** with Google Cloud & Firebase.

### 6.1 Authentication & User Identity
*   **Provider**: Firebase Auth (Google, Facebook, Email/Password).
*   **Sync**: `AuthProvider` automatically persists user sessions.
*   **Profile Link**: Login events trigger a sync to Firestore `users/{uid}`, ensuring DB records match Auth records.

### 6.2 Database & Data Flow
*   **Write Path**: Form Wizard -> IndexedDB (Draft) -> `SellWorkflowService` -> Firestore `cars` collection.
*   **Read Path**: `UnifiedSearchService` queries Firestore `cars` collection directly.
*   **Real-time**: Messaging uses `onSnapshot` for instant chat updates.

### 6.3 Google Services
*   **Maps**: Fully wired via `google-maps-enhanced.service.ts` using the API Key from `firebase-config.ts`.
*   **Storage**: Images are stored in Firebase Storage buckets, serving optimized URLs.

### 6.4 Static vs Dynamic Data
*   **Dynamic**: Users, Listings, Messages, Favorites (Firestore).
*   **Static**: Car Brands/Models (`car-brands-structured.json`). *Note: This is an intentional architectural choice for performance.*

### 6.5 Firebase Cloud Functions
*   **Location**: `functions/src/`
*   **Functions**:
    *   `ai-functions.ts`: Gemini AI integration (chat, price suggestion, profile analysis).
    *   `image-optimizer.ts`: Image processing and optimization.
    *   `notifications/`: Real-time notification triggers.
    *   `sitemap.ts`: Dynamic sitemap generation.
    *   `merchant-feed.ts`: Product feed for Google Merchant Center.
    *   `facebook-ads-sync.ts`: Facebook Ads integration.
    *   `google-ads-sync.ts`: Google Ads integration.
*   **Runtime**: Node.js 20
*   **Deployment**: `npm run deploy:functions`

---

## ✅ 7. Phase 1 Features Status (December 2025)

### ✅ COMPLETED (Phase 1 - December 2025)

1.  **CSV Import Service** (`src/services/company/csv-import-service.ts`)
    *   ✅ Full CSV parsing and validation.
    *   ✅ Column mapping system.
    *   ✅ Batch car creation with error reporting.
    *   ✅ Integration: `BulkUploadWizard` component in Profile My-Ads tab.
    *   ✅ Files: `BulkUploadWizard.tsx`, `BulkUploadWizard.styles.ts`, `BulkUploadWizard.steps.tsx`

2.  **Team Management System** (`src/services/company/team-management-service.ts`)
    *   ✅ Complete invite system with invite codes.
    *   ✅ Role-based access control (admin/agent/viewer).
    *   ✅ Firestore collections: `team_invitations`, `users/{companyId}/team_members`.
    *   ✅ UI: `TeamManagementPage` fully functional.
    *   ✅ Firestore rules implemented for security.

3.  **Company Analytics Dashboard** (`src/components/analytics/B2BAnalyticsDashboard.tsx`)
    *   ✅ Real analytics data from Firebase Functions.
    *   ✅ Integration: `CompanyAnalyticsDashboard` page routes to B2BAnalyticsDashboard.
    *   ✅ Features: Charts, metrics, export functionality.
    *   ✅ Cloud Function: `getB2BAnalytics` callable function.

4.  **Page Transitions** (`src/components/PageTransition/PageTransition.tsx`)
    *   ✅ High-performance fade/slide animations (200ms).
    *   ✅ GPU-accelerated, respects `prefers-reduced-motion`.
    *   ✅ Integrated into `MainLayout.tsx`.

5.  **Smart AI Description Generator** (`src/services/ai/vehicle-description-generator.service.ts`)
    *   ✅ Gemini AI integration for descriptions.
    *   ✅ 3-level fallback system (AI → Template → Minimal).
    *   ✅ Bulgarian/English support.
    *   ✅ Integration: Sell Wizard, Edit Page, Public View.

6.  **Homepage Performance Optimizations**
    *   ✅ Lazy loading for homepage sections.
    *   ✅ Deferred brand loading (500ms delay).
    *   ✅ Optimized Firestore queries (`getNewCarsLast24Hours` with direct where clauses).
    *   ✅ Background transparency (40% opacity) for all sections.
    *   ✅ Fixed Firestore listener cleanup (isActive flags, proper error handling).

### 🚧 IN PROGRESS (Phase 4.1 - Stories System)

1.  **Stories System** (`src/types/story.types.ts` + CarListing extension)
    *   ✅ Data architecture complete (Dec 27, 2025).
    *   ✅ TypeScript interfaces with Numeric ID compliance.
    *   ✅ CarListing extended with `stories` and `hasStories` fields.
    *   ⏳ Story Service pending (upload, management, viewing).
    *   ⏳ Story Uploader UI pending (15s video max).
    *   ⏳ Story Viewer UI pending (Instagram-style swipe interface).
    *   ⏳ Firebase Storage rules pending (video protection).

### 🔜 PLANNED (Q1-Q2 2026)

1.  **OCR Integration**: Document scanning for automatic data extraction.
2.  **Smart Logistics**: Shipping cost calculation + customs calculator.
3.  **Pricing Intelligence Service**: Market price analysis (AI-powered).
4.  **SEO Prerendering**: Category pages and dynamic routes (SSR).
5.  **API Access for Dealers**: REST API endpoints for ERP integration.
6.  **Bulk Edit Operations**: Multi-select car editing interface.

---

## 📜 8. Developer Guidelines (Constitution Enforced)

1.  **Max 300 Lines**: Every file MUST be under 300 lines. Split logic if it grows.
    *   Example: `BulkUploadWizard` split into 3 files (main, styles, steps).
2.  **No Text Emojis**: Use Lucide-React icons only. No 🚗 or ⭐ in text.
3.  **Strict Typing**: No `any`. Define interfaces in `src/types/`.
4.  **No UUID in URL**: usage of `useParams()` must expect `numericId`, not `uid`.
    *   Correct: `/car/80/1`, `/profile/80`
    *   Forbidden: `/car/UUID-1234`, `/profile/abc123xyz`
5.  **Styled Components**: Write CSS inside the component file using `styled.div`.
6.  **File Deletion Protocol**: Move deleted files to `DDD/` folder, never delete permanently.
7.  **Performance First**: Use lazy loading, deferred queries, GPU-accelerated animations.
8.  **Firestore Listeners**: Always implement `isActive` flags and proper cleanup in `useEffect`.

## 🏠 9. Homepage Structure (Optimized)

The homepage (`src/pages/01_main-pages/home/HomePage/`) consists of:

*   **NewHeroSection.tsx**: Main hero with search bar (40% transparency background).
*   **FeaturedCarsSection.tsx**: Featured cars grid.
*   **NewCarsSection.tsx**: Last 24 hours cars (optimized query: `getNewCarsLast24Hours`).
*   **LatestCarsSection.tsx**: Latest listings.
*   **VehicleClassificationsSection.tsx**: Vehicle type categories.
*   **CategoriesSection.tsx**: Popular categories.
*   **PopularBrandsSection.tsx**: Brand logos with opacity effects.
*   **MostDemandedCategoriesSection.tsx**: Most in-demand categories.
*   **GridSectionWrapper.tsx**: Wrapper with animated backgrounds (40% transparency).

**Performance Optimizations**:
*   Lazy loading with `React.lazy` and `Suspense`.
*   Deferred brand loading (500ms delay in `SearchWidget`).
*   Direct Firestore queries with `where` clauses (no client-side filtering for new cars).
*   Background gradients with 40% opacity (`rgba()` values).

## 🎨 10. Profile System Architecture

### Profile Page Structure (`src/pages/03_user-pages/profile/ProfilePage/`)

**Main Component**: `index.tsx` (ProfilePageWrapper orchestrates tabs)

**Tabs** (via `TabNavigation.tsx`):
1.  **Overview** (`ProfileOverview.tsx`): Profile dashboard, completion ring, stats.
2.  **My-Ads** (`ProfileMyAds.tsx`): Car listings + Bulk Upload Wizard button.
3.  **Campaigns** (`ProfileCampaigns.tsx`): Advertising campaigns.
4.  **Analytics** (`ProfileAnalytics.tsx`): Profile-specific analytics.
5.  **Settings** (`SettingsTab.tsx`): Privacy, dealership info, profile settings.
6.  **Consultations** (`ConsultationsTab.tsx`): Expert consultation system.

**Hooks**:
*   `useProfile.ts`: Main profile hook (data + actions).
*   `useProfileData.ts`: Data fetching with Firestore listener.
*   `useProfileActions.ts`: Actions (follow, message, etc.).

**Components**:
*   `BulkUploadWizard`: CSV import wizard (3 files: main, styles, steps).
*   `PrivateProfile.tsx`, `DealerProfile.tsx`, `CompanyProfile.tsx`: Type-specific views.

**Context Integration**:
*   `ProfileTypeContext.tsx`: Provides `profileType`, `planTier`, `permissions`, `theme`.
*   Permissions calculated via `getPermissions(profileType, planTier)`.
*   Real-time listener on `users/{uid}` document.

---

## 📦 11. Key Components Reference

### Page Transitions
*   **Component**: `PageTransition` (`src/components/PageTransition/PageTransition.tsx`)
*   **Usage**: Wraps `<Outlet />` in `MainLayout.tsx`
*   **Features**: 200ms fade/slide, GPU-accelerated, respects `prefers-reduced-motion`

### Bulk Upload Wizard
*   **Component**: `BulkUploadWizard` (`src/pages/03_user-pages/profile/ProfilePage/components/BulkUploadWizard.tsx`)
*   **Files**: Main component (150 lines), Styles (150 lines), Steps (200 lines)
*   **Service**: `csv-import-service.ts`
*   **Access**: Dealer/Company accounts only (via `permissions.canBulkUpload`)

### B2B Analytics Dashboard
*   **Component**: `B2BAnalyticsDashboard` (`src/components/analytics/B2BAnalyticsDashboard.tsx`)
*   **Page**: `CompanyAnalyticsDashboard` (`src/pages/09_dealer-company/CompanyAnalyticsDashboard.tsx`)
*   **Access**: Company accounts only
*   **Data Source**: Firebase Cloud Function `getB2BAnalytics`

### Smart Description Generator
*   **Component**: `SmartDescriptionGenerator` (`src/components/SmartDescriptionGenerator/SmartDescriptionGenerator.tsx`)
*   **Service**: `vehicle-description-generator.service.ts`
*   **Integration Points**: Sell Wizard (Step 6.5), Edit Page, Public View
*   **AI**: Gemini Pro via `gemini-chat.service.ts`

### Team Management
*   **Page**: `TeamManagementPage` (`src/pages/06_admin/TeamManagement/TeamManagementPage.tsx`)
*   **Service**: `team-management-service.ts`
*   **Access**: Company accounts only
*   **Features**: Invite members, role management, permissions matrix

## 🔍 12. Performance Optimizations (December 2025)

### Firestore Query Optimizations
*   **Direct Queries**: `getNewCarsLast24Hours` uses `where('createdAt', '>=', timestamp24HoursAgo)` at database level.
*   **Compound Indexes**: Firestore indexes defined in `firestore.indexes.json`.
*   **Listener Cleanup**: All `onSnapshot` listeners use `isActive` flags to prevent state updates after unmount.

### Homepage Optimizations
*   **Lazy Loading**: Sections loaded with `React.lazy` and `Suspense`.
*   **Deferred Loading**: Brand data loaded 500ms after page load.
*   **Background Opacity**: All sections use 40% transparent backgrounds (`rgba()`).

### Animation Performance
*   **GPU Acceleration**: `PageTransition` uses `transform: translateZ(0)` and `will-change`.
*   **Reduced Motion**: All animations respect `prefers-reduced-motion` media query.
*   **Duration**: Page transitions limited to 200ms (ultra-fast).

---

## 📊 13. Complete Services Inventory (107+ Services)

The business logic layer follows a **singleton pattern** with dependency injection. All services use `logger-service.ts` (console.log banned in production).

### 13.1 Core Services (Authentication & User Management)
```
src/services/
├── auth/
│   ├── auth-service.ts                 # Firebase Auth wrapper
│   ├── social-auth-service.ts          # Google/Facebook/Apple login
│   └── phone-auth-service.ts           # Phone number authentication
│
├── user/
│   ├── bulgarian-profile-service.ts    # Profile CRUD operations
│   ├── user-settings.service.ts        # User preferences
│   └── verification/
│       ├── eik-verification-service.ts      # Company EIK verification
│       └── bulgarian-compliance-service.ts  # EGN verification
```

### 13.2 Car Services (The Heart)
```
├── car/
│   ├── unified-car-service.ts          # Main car orchestrator
│   ├── unified-car-queries.ts          # Firestore read operations
│   ├── unified-car-mutations.ts        # Firestore write operations
│   ├── unified-car-types.ts            # TypeScript interfaces
│   └── unified-car-validation.ts       # Data validation rules
│
├── numeric-car-system.service.ts       # Atomic numeric ID assignment ✅
├── numeric-id-assignment.service.ts    # User numeric ID generation ✅
├── numeric-id-lookup.service.ts        # Bidirectional ID mapping ✅
├── numeric-messaging-system.service.ts # Numeric URL for messages ✅
├── numeric-system-validation.service.ts # Client-side validation ✅
```

### 13.3 Search & Discovery
```
├── search/
│   ├── UnifiedSearchService.ts         # Main search orchestrator
│   ├── algolia/
│   │   └── algoliaSearchService.ts     # Algolia integration
│   ├── firestoreQueryBuilder.ts        # Dynamic query builder
│   ├── queryOrchestrator.ts            # Query optimization
│   └── multi-collection-helper.ts      # Cross-collection queries
│
├── favorites.service.ts                # Heart button logic ✅
├── savedSearchesService.ts             # Saved search alerts
└── comparison/
    └── comparison-service.ts           # Car comparison tool
```

### 13.4 B2B Services (Dealer/Company Features)
```
├── company/
│   ├── csv-import-service.ts           # Bulk car import ✅ (389 lines)
│   └── team-management-service.ts      # Team member management ✅
│
├── analytics/
│   ├── analytics-service.ts            # Analytics data aggregation
│   ├── analytics-operations.ts         # Firebase Functions calls
│   └── visitor-analytics-service.ts    # User behavior tracking
│
├── billing/
│   ├── billing-service.ts              # Stripe integration
│   ├── subscription/
│   │   └── subscription-service.ts     # Plan management
│   └── stripe-service.ts               # Payment processing
│
├── dealership/
│   └── dealership-service.ts           # Dealer-specific features
```

### 13.5 AI Services (Gemini Integration)
```
├── ai/
│   ├── gemini-service.ts               # Main Gemini API wrapper
│   ├── gemini-chat.service.ts          # Conversational AI
│   ├── vehicle-description-generator.service.ts # Smart descriptions ✅
│   ├── ai-description-generator.ts     # Legacy fallback
│   ├── ai-price-suggestion.ts          # Price intelligence
│   └── DeepSeekService.ts              # DeepSeek integration (planned)
```

### 13.6 Messaging & Notifications
```
├── messaging/
│   ├── MessagingService.ts             # Real-time chat
│   ├── ConversationService.ts          # Conversation management
│   ├── advanced-messaging-service.ts   # Typing indicators, read receipts
│   ├── realtime-messaging-listeners.ts # Firestore listeners
│   └── realtime-messaging-utils.ts     # Helper utilities
│
├── notifications/
│   ├── notification-service.ts         # Push notifications
│   ├── fcm-service.ts                  # Firebase Cloud Messaging
│   └── real-time-notifications-service.ts # In-app alerts
│
└── calls/
    └── call-service.ts                 # Video/voice calls (future)
```

### 13.7 Media & Storage
```
├── image-upload-service.ts             # Image compression & upload
├── ImageStorageService.ts              # Firebase Storage wrapper
├── imageOptimizationService.ts         # WebP conversion
├── file-upload/
│   └── file-upload-service.ts          # General file uploads
│
└── ocr/
    └── ocr-service.ts                  # Document scanning (planned)
```

### 13.8 Location & Maps
```
├── google/
│   └── google-maps-enhanced.service.ts # Google Maps integration
│
├── bulgaria-locations.service.ts       # Bulgarian cities/regions
├── unified-cities-service.ts           # City data management
├── geocoding-service.ts                # Address → Coordinates
├── location-helper-service.ts          # Location utilities
└── cityCarCountService.ts              # Cars per city statistics
```

### 13.9 Sell Workflow (The Complex One)
```
├── sell-workflow-service.ts            # Main wizard orchestrator
├── sell-workflow-operations.ts         # Step-by-step logic
├── sell-workflow-validation.ts         # Form validation rules
├── sell-workflow-images.ts             # Image upload handling
├── sell-workflow-collections.ts        # Multi-collection routing
├── sell-workflow-transformers.ts       # Data transformation
├── sell-workflow-types.ts              # TypeScript definitions
├── strictWorkflowAutoSave.service.ts   # Auto-save to IndexedDB
└── unified-workflow-persistence.service.ts # Draft management
```

### 13.10 Admin & Moderation
```
├── admin/
│   ├── super-admin-service.ts          # Admin dashboard logic
│   ├── super-admin-operations.ts       # User moderation
│   └── super-admin-cars-service.ts     # Listing moderation
│
├── reports/
│   └── report-service.ts               # Report handling
│
└── security/
    └── security-service.ts             # Security rules enforcement
```

### 13.11 Performance & Monitoring
```
├── logger-service.ts                   # Centralized logging ✅
├── error-handling-service.ts           # Error capture & reporting
├── performance/
│   └── performance-service.ts          # Performance metrics
│
├── monitoring-service.ts               # Application health monitoring
└── firebase-debug-service.ts           # Firebase debugging tools
```

### 13.12 Payment & Financial
```
├── payment/
│   └── payment-service.ts              # Payment processing
│
├── stripe-service.ts                   # Stripe API wrapper
├── financial-services.ts               # Financial calculations
└── commission-service.ts               # Commission calculations
```

### 13.13 Social & Posts
```
├── posts/
│   ├── posts-service.ts                # Social posts management
│   └── posts-operations.ts             # CRUD operations
│
├── reviews/
│   ├── reviews-service.ts              # Car reviews system
│   └── reviews-operations.ts           # Review CRUD
│
└── social/
    ├── social-service.ts               # Social features
    └── social-auth-service.ts          # Social login
```

### 13.14 Utility Services
```
├── validation/
│   └── validation-service.ts           # Global validation rules
│
├── translation-service.ts              # i18n utilities (BG/EN)
├── brand-normalization.ts              # Car brand name normalization
├── cache-service.ts                    # Client-side caching
├── firebase-cache.service.ts           # Firebase query caching
└── with-loading.ts                     # Loading state wrapper
```

### 13.15 Advanced Features
```
├── campaigns/
│   └── campaign-service.ts             # Advertising campaigns
│
├── pricing/
│   ├── market-value.service.ts         # Market price analysis
│   └── pricing-service.ts              # Dynamic pricing
│
├── garage/
│   └── personal-vehicle.service.ts     # User's garage management
│
├── posts/
│   └── social-feed-service.ts          # Social feed aggregation
│
└── iot/
    └── iotService.ts                   # IoT device integration (future)
```

---

## 📱 14. Complete Features Inventory (50+ Features)

### 14.1 Core Features (Production Ready)
1. ✅ **Multi-Provider Authentication** (Google, Facebook, Apple, Email, Phone, Anonymous)
2. ✅ **Numeric ID System** (Clean URLs: `/car/80/5`, `/profile/18`)
3. ✅ **6-Step Sell Wizard** (VehicleType → Description → Publish)
4. ✅ **Advanced Search** (50+ filters, Algolia + Firestore hybrid)
5. ✅ **Favorites System** (Heart button, real-time sync)
6. ✅ **Real-time Messaging** (FCM push, typing indicators, read receipts)
7. ✅ **Multi-Collection Database** (6 vehicle type collections)
8. ✅ **Draft System** (Auto-save every 30s to IndexedDB + Firestore)
9. ✅ **Profile Types** (Private/Dealer/Company with permissions)
10. ✅ **Dark/Light Theme** (System-aware with manual override)

### 14.2 B2B Features (Phase 1 Complete)
11. ✅ **CSV Import** (Bulk car upload for dealers)
12. ✅ **Team Management** (Invite system, role-based access)
13. ✅ **B2B Analytics Dashboard** (Real data from Firebase Functions)
14. ✅ **Bulk Upload Wizard** (Matrix grid interface)
15. ✅ **Subscription Plans** (Stripe integration)
16. ✅ **Quick Replies** (Pre-configured messages for dealers)

### 14.3 AI Features (Gemini Powered)
17. ✅ **Smart Description Generator** (AI-powered car descriptions)
18. ✅ **Price Suggestion** (Market analysis with AI)
19. ✅ **Profile Analysis** (AI-based trust score)
20. ✅ **Chat Assistant** (Conversational AI for support)

### 14.4 Content & Media
21. ✅ **Image Upload** (Drag-drop, compression, WebP conversion)
22. ✅ **Image Optimization** (Firebase Storage + CDN)
23. ✅ **Video Support** (YouTube embed + direct uploads)
24. 🔄 **Stories System** (Phase 4.1 - In Progress)
    - ✅ Data architecture complete
    - ⏳ Upload/Viewer UI pending

### 14.5 User Experience
25. ✅ **Page Transitions** (200ms GPU-accelerated animations)
26. ✅ **Lazy Loading** (All routes code-split with `safeLazy()`)
27. ✅ **Loading States** (Global + per-feature loading indicators)
28. ✅ **Toast Notifications** (Success/error/info messages)
29. ✅ **Error Handling** (Comprehensive error boundaries)
30. ✅ **Accessibility** (WCAG 2.1 AA compliant)

### 14.6 Social & Community
31. ✅ **User Reviews** (5-star rating system)
32. ✅ **Social Posts** (User-generated content)
33. ✅ **Comments System** (Threaded comments)
34. ✅ **Follow System** (Follow dealers/users)
35. ✅ **Activity Feed** (User activity timeline)

### 14.7 Discovery & Navigation
36. ✅ **Visual Search** (Image-based search - planned)
37. ✅ **Voice Search** (Speech-to-text integration - planned)
38. ✅ **Saved Searches** (Email alerts for new listings)
39. ✅ **Comparison Tool** (Side-by-side car comparison)
40. ✅ **Similar Cars** (AI-powered recommendations)

### 14.8 Trust & Safety
41. ✅ **EGN Verification** (Bulgarian ID verification)
42. ✅ **EIK Verification** (Company registration verification)
43. ✅ **Phone Verification** (SMS OTP)
44. ✅ **Email Verification** (Email confirmation)
45. ✅ **Trust Badges** (Verified seller badges)
46. ✅ **Report System** (Flag inappropriate content)

### 14.9 Admin & Moderation
47. ✅ **Admin Dashboard** (Global stats, user management)
48. ✅ **Listing Moderation** (Approve/reject queue)
49. ✅ **User Moderation** (Ban/unban users)
50. ✅ **Backup Management** (Data export/import)

### 14.10 Future Features (Planned)
51. ⏳ **OCR Integration** (Document scanning)
52. ⏳ **Smart Logistics** (Shipping calculator)
53. ⏳ **Multi-Country Support** (Romania, Greece, Serbia)
54. ⏳ **API Access** (REST API for ERP integration)
55. ⏳ **IoT Integration** (Connected car data)

---

**End of Reference Manual** (Updated Dec 27, 2025 - Version 4.0.0)
