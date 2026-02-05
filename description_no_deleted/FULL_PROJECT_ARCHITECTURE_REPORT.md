# Koli One - Comprehensive Project Architecture Report
**Generated on:** 2026-02-04
**Project Root:** `C:\Users\hamda\Desktop\Koli_One_Root`

This report provides a complete architectural overview of the **Koli One** platform, comprising a React Web Application, an Expo Mobile Application, and a Firebase Backend. It is designed to give an external AI model full context for development planning.

---

## 🏗️ 1. High-Level Architecture

The project is structured as a monorepo containing two main client applications and a shared serverless backend.

| Component | Path | Tech Stack | Role |
| :--- | :--- | :--- | :--- |
| **Web App** | `/web` | React, TypeScript, Vite/CRA, Context API | Main public-facing platform for buyers & sellers. |
| **Mobile App** | `/mobile/mobile` | React Native, Expo, TypeScript, Expo Router | Native experience for iOS/Android. |
| **Backend** | `/web/functions` | Firebase Cloud Functions (Node.js) | Serverless API, Triggers, Jobs, AI Integration. |
| **Database** | Firestore | NoSQL | Primary database (Users, Cars, Chats). |

---

## 🌐 2. Web Application (`/web`)

### 2.1 Core Configuration
- **Entry Point:** `src/index.tsx` -> `src/App.tsx`
- **Providers:** Wrapped in `<AppProviders>` (`src/providers/index.tsx`) which aggregates:
    - `AuthProvider` (User state)
    - `ThemeProvider` (UI styling)
    - `FilterContext` (Search state)
- **Routing:** `src/AppRoutes.tsx` handles client-side routing.
- **State Management:** React Context API + Custom Hooks (`useAuth`, `useCars`).
- **Styling:** CSS Modules + Global `index.css` (Tailwind-like utility classes or custom CSS).

### 2.2 Directory Structure
- `src/components`: UI building blocks (e.g., `Navbar`, `CarCard`, `Filters`).
- `src/pages`: Top-level route views:
    - `Home.tsx`: Landing page with "Smart Ad Bar".
    - `Search.tsx`: Unified search interface.
    - `Sell.tsx`: Multi-step wizard for listing cars.
    - `Profile.tsx`: User dashboard.
    - `CarDetails.tsx`: Product page (`/car/:sellerId/:carId`).
- `src/services`: Business logic & API calls.
    - **Critical:** `numeric-car-system.service.ts` (Atomic ID generation).
    - `search/UnifiedSearchService.ts` (Algolia/Firestore hybrid search).
    - `messaging/realtime` (Chat logic).
- `src/layouts`: Wrapper layouts (e.g., `MainLayout` with header/footer).

### 2.3 Key Features
- **Numeric ID System:** Cars are URL-addressed by `/:numericSellerId/:numericCarId` (e.g., `/105/3`), NOT by random UUIDs. This is enforced by `numeric-car-system.service.ts`.
- **Smart Ad Bar:** A natural language input on the home page for quick searching.
- **PWA Support:** `service-worker.ts` and `manifest.json` for installability.

---

## 📱 3. Mobile Application (`/mobile/mobile`)

### 3.1 Core Configuration
- **Framework:** Expo (Managed Workflow).
- **Routing:** Expo Router (File-based routing in `app/`).
- **Language:** TypeScript (Strict Mode recently enabled).

### 3.2 Directory Structure (`app/`)
- `(tabs)`: Main bottom-tab navigation.
    - `index.tsx`: Home screen.
    - `search.tsx`: Mobile search interface.
    - `sell.tsx`: Selling wizard (WizardOrchestrator).
    - `profile.tsx`: User profile.
    - `messages.tsx`: Inbox.
- `_layout.tsx`: Root layout defining navigation stacks.

### 3.3 Services (`src/services`)
*Recently synchronized with Web logic (Feb 2026)*
- `SharedTypes.ts`: Interfaces (`User`, `CarListing`) matching Web.
- `numeric-id-counter.service.ts`: Ported atomic counter logic.
- `numeric-car-system.service.ts`: **CRITICAL**. Creating a car here uses a Firestore Transaction to guarantee unique 1, 2, 3 IDs.
- `numeric-id-lookup.service.ts`: Resolves Numeric IDs to Document UUIDs.
- `SellService.ts`: Uses the above systems to safely post listings.

### 3.4 Integration Status
- ✅ **Authentication:** Uses Firebase Auth (Google Services config required locally).
- ✅ **Data Consistency:** Writes to the same Firestore collections (`passenger_cars`, etc.) as Web.
- ✅ **Assets:** Logic and Favicons synchronized.

---

## ☁️ 4. Backend (`/web/functions`)

The backend is a dense collection of event-driven triggers and HTTP Callables.

### 4.1 Data Models (Firestore)
- **`users/{uid}`**: User profiles.
    - Field: `numericId` (Int, unique).
    - Field: `stats` (count of listings).
- **`counters/{type}`**: Atomic counters for IDs.
- **Vehicle Collections**: `passenger_cars`, `suvs`, `motorcycles`, `trucks`, `vans`, `buses`.
    - Field: `sellerNumericId`, `carNumericId`.
    - Field: `status` ('active', 'sold', 'draft').

### 4.2 Key Cloud Functions (`src/index.ts`)
1.  **AI & Vision**:
    - `evaluateCar`: Hybrid AI (Gemini + DeepSeek) to analyze car photos + price and return market advice.
    - `geminiChat`: Chatbot backend.
2.  **Search Sync**:
    - `syncPassengerCarsToAlgolia`, `syncSuvsToAlgolia`, etc.: Real-time indexing of Firestore data to Algolia for fast search.
3.  **Lifecycle Triggers**:
    - `onUserCreate`: **CRITICAL**. Assigns the `numericId` to a new user.
    - `onUserDelete`: Clean up user data (GDPR).
    - `onPassengerCarSold` / `onPassengerCarDeleted`: Cascading updates (e.g., mark related stories as sold).
4.  **Notifications**:
    - `onNewRealtimeMessage`: Push notifications for chat.
    - `notifyFollowersOnNewCar`: Social feed updates.
5.  **Marketing**:
    - `merchantFeedGenerator`: Generates XML for Google Shopping.
    - `sitemap`: Auto-generates `sitemap.xml` for SEO.

---

## ⚠️ 5. Critical Constraints & Rules

1.  **Numeric IDs are Sacred**: Never create a car or user without a strictly sequential Numeric ID.
    - **Web**: Handled by `numeric-car-system.service.ts`.
    - **Mobile**: Handled by `numeric-car-system.service.ts` (Ported).
    - **Backend**: `onUserCreate` handles User IDs.
2.  **Collection Split**: Cars are NOT in one big collection. They are split by type (`passenger_cars`, `buses`, etc.). Queries must account for this (Unified Search Service does this).
3.  **Atomic Operations**: Creation of entities must update the `counters` collection in the same transaction.

## 📈 6. Current Development Status
- **Web**: Mature, production-ready features.
- **Mobile**: Recently integrated core write-logic (Alpha stage compatibility).
- **Next Goals**:
    - Verify Mobile Build.
    - Asset Sync completion.
    - End-to-End testing of the "Sell" flow on Mobile.
# KOLI ONE - MASTER PROJECT CONTEXT
> **Use this file to prompt external AI models (GitHub Copilot, GPT-4, etc.) about the Koli One architecture.**
> It merges the static details of the Web platform with the dynamic, recently integrated Mobile architecture.

---

## 📌 1. Identity & Core Stats
- **Project Name:** Koli One (New Globul Cars)
- **Live URL:** https://koli.one
- **Region:** Bulgaria (europe-west1)
- **Primary Language:** Bulgarian (bg) | Secondary: English (en)
- **Monorepo Structure:**
  - `web/`: React Web App (Production)
  - `mobile_new/`: Expo Mobile App (Alpha/Beta - Feature Parity Mode)
  - `functions/`: Unified Firebase Backend (Serverless)

---

## 🌐 2. Web Architecture (`/web`)
**Status:** Mature, Production-Ready.
**Tech:** React 18.3, TypeScript, Styled-Components, Vite/CRA.

### Directory Map
- `src/services`: **150+ Services**.
    - `numeric-car-system.service.ts`: **THE AUTHORITY** on creating cars. Uses Firestore Transactions to assign sequential IDs (e.g., `105/1`).
    - `search/UnifiedSearchService.ts`: Hybrid Algolia + Firestore search.
    - `messaging/realtime`: Chat logic with optimizations.
- `src/pages`:
    - `/` (Home): Smart Ad Bar (AI Search).
    - `/sell`: 5-Step Wizard for listing via `UseSellWorkflow`.
    - `/car/:sellerId/:carId`: **Numeric Router** logic.

### Key Rules
- **Provider Stack:** Theme -> Language -> Auth -> Filter. Order is critical.
- **Components:** 200+ components in `src/components`.

---

## 📱 3. Mobile Architecture (`/mobile_new`)
**Status:** Alpha - Recently Integrated with Core Logic.
**Tech:** Expo SDK 54, React Native 0.81, Expo Router.

### Dependencies
```json
{
  "expo": "~54.0.33",
  "firebase": "^12.8.0",
  "expo-router": "~6.0.23",
  "styled-components": "^6.3.8",
  "@react-native-google-signin/google-signin": "^16.1.1"
}
```

### Routing (`mobile_new/app`)
Using File-based routing (Expo Router):
- **`(tabs)`**: The main bottom navigation.
    - `index.tsx`: Home (Feed/Search).
    - `search.tsx`: Advanced Filters.
    - `sell.tsx`: **WizardOrchestrator** (7 Steps).
    - `map.tsx`: Geo-search.
    - `messages.tsx`: Real-time inbox.
    - `profile.tsx`: Current user dashboard.
- **`(auth)`**:
    - `login.tsx`: Email/Google Auth.
    - `register.tsx`: New User Sign-up.
- **`car/[id].tsx`**: Details page.
- **`chat/[id].tsx`**: Chat room.

### 🔌 Ported Services (`mobile_new/src/services`)
*Crucial Integration Points matching Web Logic:*
1.  **`numeric-car-system.service.ts`**: The mobile version of the "Sacred" ID generator. Uses `runTransaction` to ensure `counters/cars` is updated atomically.
2.  **`numeric-id-counter.service.ts`**: Helper for counter increments.
3.  **`numeric-id-lookup.service.ts`**: Resolves `NumericID -> FirebaseUID`.
4.  **`SellService.ts`**: Updated Feb 2026 to use `numeric-car-system` instead of raw writes.

---

## ☁️ 4. Backend (Serverless) (`/web/functions`)
**Role:** The Brain. Handles everything secure.

### Critical Cloud Functions
1.  **`onUserCreate` (Trigger)**:
    - Listens to: `auth.user.onCreate`
    - Action: Assigns the next sequential `numericId` from `counters/users`.
    - **Note:** Mobile relies on this. Mobile does NOT assign User IDs, only reads them.
2.  **`evaluateCar` (Callable)**:
    - AI Hybrid System (Gemini Vision + DeepSeek Logic).
    - Analyzes uploaded photos to direct price + title.
3.  **`syncCarsToAlgolia` (Trigger)**:
    - Listens to: `passenger_cars`, `suvs`, etc.
    - Action: Pushes new data to Algolia for instant search.

### Database Schema (Firestore)
- **`users/{uid}`**: `{ numericId: 123, email: "..." }`
- **`counters/`**:
    - `users`: `{ count: 123 }`
    - `cars/sellers/{uid}`: `{ count: 5 }` (User's 5th car).
- **Vehicles** (Split Collections):
    - `passenger_cars`, `suvs`, `motorcycles`, `vans`, `trucks`, `buses`.
    - **Schema**: `{ sellerNumericId: 123, carNumericId: 5, ... }`

---

## ⚠️ 5. Developer "Gotchas"
1.  **Numeric IDs are MANDATORY**: Never `addDoc` to a car collection directly. Always use `numericCarSystemService.createCarAtomic()`.
2.  **Collection Splitting**: If you add a field to "Cars", you must add it to 6 collections (`passenger_cars`, etc.).
3.  **Mobile Auth**: Requires `google-services.json` (Android) and `GoogleService-Info.plist` (iOS) in `mobile_new/`.
4.  **Shared Types**: Use `mobile_new/src/types/SharedTypes.ts` to ensure Mobile data matches Web interfaces.

---
**End of Context**
