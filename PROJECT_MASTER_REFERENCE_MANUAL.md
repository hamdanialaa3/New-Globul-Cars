# Project Master Reference Manual
## The Source of Truth for "Bulgarski Mobili" (New Globul Cars)

> **Version**: 1.0.0
> **Last Updated**: December 2025
> **Status**: Production-Ready / Maintenance Mode

---

## 1. Project Overview

**Bulgarski Mobili** (formerly Globul Cars) is the premier Bulgarian automotive marketplace, designed to rival platforms like *mobile.de*. It acts as a comprehensive ecosystem connecting private sellers, dealerships, and companies with buyers through a high-performance, visually stunning, and feature-rich web application.

### Core Value Proposition
*   **Localized Experience**: Fully tailored for the Bulgarian market (Cyrillic support, local cities, "EGN" verification).
*   **Trust & Safety**: Verification badges, "Guest Expiration" policies, and transparent seller limits.
*   **Professional Tools**: Dealer dashboards, bulk editing, and analytics for business users.
*   **Modern Tech**: Fast, responsive PWA built with React 18, TypeScript, and Firebase.

### Technology Stack
*   **Frontend**: React 18, TypeScript, Styled-Components (Vanilla CSS), Framer Motion (animations).
*   **State Management**: React Context (`AuthProvider`, `ProfileTypeContext`, `FilterContext`).
*   **Routing**: `react-router-dom` v6 with a custom **Numeric ID System** for clean, SEO-friendly URLs.
*   **Backend**: Firebase (Auth, Firestore, Storage, Cloud Functions, Hosting).
*   **Search**: Hybrid system (Unified Search Service) combining Firestore queries and Algolia (optional).
*   **Maps**: Leaflet / Google Maps Static API.

---

## 2. Design System & UX

The application implements a "German Marketplace Style" design—clean, data-dense but readable, and professional.

### Color Palette (`src/styles/theme.ts`)
*   **Primary (Brand)**: `#003366` (Dark Blue) - Used for headers, primary actions.
*   **Secondary (Action)**: `#CC0000` (Red) - Used for "Sell" buttons, urgent alerts.
*   **Accent**: `#0066CC` (Bright Blue) - Links, interactive elements.
*   **Backgrounds**:
    *   Light: `#f4f4f4` (Page bg), `#ffffff` (Cards).
    *   Dark Mode: Supported via `CustomThemeProvider`.

### Typography
*   **Font Family**: `'Martica'`, `'Arial'`, sans-serif.
*   **Scale**: standard `rem` based scale (xs to 6xl).

### Responsiveness
*   **Mobile-First**: All layouts are optimized for touch devices.
*   **PWA**: Installable on mobile devices with Service Worker caching (`src/service-worker.ts`).

---

## 3. Frontend Architecture & Routing

### Numeric ID System
The platform uses a strict **Numeric ID Strategy** for URLs to resemble major platforms (e.g., `mobile.bg` or `mobile.de`).
*   **Format**: `/car/:sellerNumericId/:carNumericId` (e.g., `/car/123/456`).
*   **Resolution**: handled by `NumericCarDetailsPage.tsx`, which maps numeric IDs back to Firestore UUIDs.

### Key Pages
1.  **Homepage** (`src/pages/01_main-pages/home/HomePage/index.tsx`):
    *   **Hero Section**: High-impact visual with "Quick Search".
    *   **New Cars**: Latest 24h additions.
    *   **Lazy Loaded Sections**: Popular Brands, Featured Cars to optimize LCP.
2.  **Search Results** (`filter-context` driven):
    *   Uses `UnifiedSearchService` to query cars.
    *   Supports filters: Make, Model, Price, Year, Region, Fuel, Transmission.
3.  **Car Details** (`src/pages/01_main-pages/CarDetailsPage.tsx`):
    *   **German Style Layout**: Large gallery on left, key data table on right.
    *   **Components**: `CarImageGallery`, `CarBasicInfo`, `CarEquipmentDisplay` (grouped by category).
    *   **Interaction**: Contact buttons (Phone, Email, WhatsApp, Viber).

---

## 4. User Ecosystem: Profiles & Plans

The application defines three distinct user types in `src/types/user/bulgarian-user.types.ts`. Managed by `ProfileTypeContext`.

### 1. Private User (`private`)
*   **Target**: Individuals selling their personal vehicle.
*   **Limits**: 
    *   **Free Plan**: Max **3 active listings**.
    *   Cannot customize brand logic.
*   **Verification**: Email, Phone.

### 2. Dealer (`dealer`)
*   **Target**: Small to medium car dealerships.
*   **Features**:
    *   **Dealer Plan**: Max **10 active listings**.
    *   Business Profile Page with logo and map.
    *   Access to "Quick Replies" in messages.
*   **Requirements**: Dealership document verification.

### 3. Company (`company`)
*   **Target**: Large enterprises, importers.
*   **Features**:
    *   **Unlimited** active listings.
    *   **Team Management**: Add sub-users.
    *   **Advanced Analytics**: Views, leads, conversion rates.
    *   **API Access** & **CSV Import**.
*   **Requirements**: Company registration (EIK), VAT number.

### Permissions Matrix
| Feature | Private (Free) | Dealer | Company |
| :--- | :--- | :--- | :--- |
| **Max Listings** | 3 | 10 | Unlimited |
| **Analytics** | Basic | Standard | Advanced |
| **Bulk Edit** | No | Yes | Yes |
| **Priority Support** | No | Yes | Yes |
| **Team/Sub-users** | No | No | Yes |

---

## 5. Core Workflows

### A. Authentication
*   **Providers**: 
    *   Email/Password.
    *   Social (Google, Facebook).
    *   Phone (with reCAPTCHA verification).
*   **Logic**: Handled in `AuthProvider.tsx` and `SocialAuthService`.
*   **Guest Mode**: Supported, with `GuestExpirationModal` to prompt signup.

### B. "Sell Your Car" Workflow (The Wizard)
Located in `src/components/SellWorkflow/SellVehicleWizard.tsx`. A multi-step modal wizard.

*   **Persistence**: Auto-saves drafts to `localStorage` and Firestore (`UnifiedWorkflowPersistenceService`). Includes a **Timer** to encourage completion.
*   **Steps**:
    1.  **Vehicle Selection**: Type (Car, SUV, Bike), Make, Model.
    2.  **Vehicle Data**: Year, Mileage, Engine, Fuel, Transmission.
    3.  **Equipment**: Checkboxes for Extras, Safety, Comfort.
    4.  **Images**: Drag & Drop upload (handled by `SellWorkflowImages`).
        *   *Note*: Images are stored in IndexedDB during draft, uploaded to Firebase Storage on publish.
    5.  **Pricing**: Price, Currency (BGN/EUR), Negotiable flag.
    6.  **Contact**: Review details, Seller info.
*   **Validation**: Strict checks before publishing (e.g., Subscription limits check via `listing-limits.ts`).

### C. Buying & Contact
*   **Inquiry System**: Users can click "Call", "Email", "Viber", or "WhatsApp". 
*   **Messaging**: Internal messaging system (`/messages`) linked to specific car listings.

---

## 6. Backend Architecture (Firebase)

### Firestore Database Schema

#### `users` Collection
*   **Document ID**: `uid` (Auth ID).
*   **Fields**:
    *   `profileType`: 'private' | 'dealer' | 'company'.
    *   `numericId`: Auto-incremented integer.
    *   `stats`: `{ activeListings: number, totalViews: number }`.
    *   `planTier`: 'free' | 'dealer' | 'company'.

#### `cars` Collection
*   **Document ID**: UUID.
*   **Fields** (See `src/types/CarListing.ts`):
    *   `make`, `model`, `year`, `price`, `currency`.
    *   `sellerId`: Reference to User UID.
    *   `sellerNumericId`, `carNumericId`: For routing.
    *   `images`: Array of storage URLs.
    *   `status`: 'active' | 'sold' | 'deleted' | 'draft'.
    *   `equipment`: Arrays (`safety`, `comfort`, `extras`).

### Cloud Storage
*   **Structure**: `workflow-images/{userId}/{filename}`.
*   **Optimization**: Images are compressed on the client (`browser-image-compression`) before upload to save bandwidth.

### Backend Services (`src/services/`)
*   **`UnifiedSearchService`**: Central entry point for searching.
*   **`SellWorkflowService`**: Facade for the sell wizard logic.
*   **`ProfileService`**: Manages user data and limits.
*   **`AdminDataFix`**: Utilities for data cleanup.

---

## 7. Admin Panel (`src/pages/06_admin`)

Located at `/super-admin-dashboard`, this is a powerful command center for the platform owner ("The Super Admin").

### Features
1.  **Overview**: Real-time counters (Live Users, Active Listings).
2.  **User Management**: View/Edit/Ban users. Filter by type (Dealer/Private).
3.  **Market Stats**: Aggregated data on total value, car distribution by region/brand.
4.  **Content Moderation**: Review reported listings.
5.  **Reports**: Export data to **CSV**, **Excel**, or **JSON**.
    *   *Usage*: `usersReportService`, `carsReportService`.
6.  **AI & IoT**: Monitoring dashboards for AI usage quotas and IoT car tracking integrations.
7.  **Firebase Controls**: Direct links to Firestore console.

---

## 8. Development & Maintenance

### Project Structure
*   `src/components`: Reusable UI components.
*   `src/pages`: Route-based page components.
*   `src/contexts`: Global state providers.
*   `src/services`: Business logic and API calls.
*   `src/types`: TypeScript definitions (**Source of Truth**).

### Key Commands
*   `npm start`: Run dev server (localhost:3000).
*   `npm run build`: Production build.
*   `firebase deploy`: Deploy Hosting and Functions.

### Environment
*   **Production**: Hosted on Firebase Hosting.
*   **Env Variables**: managed in `.env` (Firebase Config, API Keys).

---

## 9. Future Roadmap & Extensibility
*   **AI Integration**: Expand `AIChatbot` and `SmartSellStrip`.
*   **Optimization**: Move `public/` assets to CDN if size grows.
*   **Mobile App**: PWA is the current mobile strategy; React Native port is possible using existing Services.

---
*This document serves as the primary reference for all developers and AI agents working on the Bulgarski Mobili project.*
