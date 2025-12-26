# Project Master Reference Manual (The Bible)
## The Source of Truth for "Bulgarski Mobili" (New Globul Cars)

> **Version**: 3.3.0 (The "Constitution" Update)
> **Last Updated**: December 26, 2025
> **Status**: Production Core / Beta Advanced Features
> **Constitution**: Strictly Compliant with `PROJECT_CONSTITUTION.md`

This document is the **absolute reference** for the entire codebase. It describes every folder, feature, service, and data model. If it's in the code, it's described here.

---

## 🏗️ 1. Project Architecture (From A to Z)

**Bulgarski Mobili** is a high-performance Single Page Application (SPA) designed to dominate the Bulgarian automotive market.

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
│   ├── common/             # Buttons, Inputs, Modals, Cards
│   ├── guards/             # Route Guards (AuthGuard, NumericIdGuard)
│   ├── messaging/          # Chat bubbles, Inboxes
│   ├── SellWorkflow/       # The massive Car Selling Wizard components
│   └── shared/             # Shared utilities
├── contexts/               # Global State Providers
│   ├── AuthProvider.tsx    # User session management
│   ├── ThemeContext.tsx    # Light/Dark mode logic
│   └── LanguageContext.tsx # BG/EN translation logic
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
*   **URL Format**: `mobilebg.eu/car/{UserNumericID}/{CarNumericID}`
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
    6.  **Description**: AI-Powered text generator.
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
*   `/company/team` - **TeamManagement**: Add/Remove staff (UI Placeholder).
*   `/company/analytics` - **Analytics**: View/Click graphs (UI Placeholder).
*   `/billing` - Invoices & Subscription plans.

### Admin Pages (`/admin/*`)
*   `/admin/dashboard` - Global stats.
*   `/admin/users` - Manage users (Ban/Verify).
*   `/admin/approvals` - Moderation queue (for new listings).

---

## 🔧 5. Services & Business Logic

The logic is decoupled from UI. Key services include:

*   **`AuthService`**: Wraps Firebase Auth. Handles Login/Register/Logout.
*   **`ImageUploadService`**: Handles compression, resizing, and uploading to Firebase Storage.
*   **`FavoritesService`**: Manages the "Heart" button functionality.
*   **`MessagingService`**: Real-time chat using Firestore listeners (`onSnapshot`).
*   **`NotificationService`**: Sends push notifications & in-app alerts.

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

---

## 🛑 7. Missing Features (The Status Reality)

While the menu items exist, the following features are **NOT yet fully implemented**:

1.  **CSV Import**: There is no code to parse CSV files and bulk-create cars.
2.  **Team Logic**: The `TeamManagement` page is a UI shell. It does not actually create sub-users in Firebase yet.
3.  **Advanced Analytics**: The `CompanyAnalytics` page is a placeholder. It currently displays dummy data or "Coming Soon".

---

## 📜 7. Developer Guidelines (Constitution Enforced)

1.  **Max 300 Lines**: Every file MUST be under 300 lines. Split logic if it grows.
2.  **No Text Emojis**: Use Lucide-React icons only. No 🚗 or ⭐ in text.
3.  **Strict Typing**: No `any`. Define interfaces in `src/types/`.
4.  **No UUID in URL**: usage of `useParams()` must expect `numericId`, not `uid`.
5.  **Styled Components**: Write CSS inside the component file using `styled.div`.

---

**End of Reference Manual** (Verified Dec 26, 2025)
