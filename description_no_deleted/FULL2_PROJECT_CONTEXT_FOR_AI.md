# KOLI ONE - MASTER PROJECT CONTEXT & ARCHITECTURAL REFERENCE
> **VERSION:** 2.0 (Deep Audit Edition)
> **DATE:** February 8, 2026
> **STATUS:** CRITICAL REFERENCE DOCUMENT. DO NOT DELETE.

## 1. Project Overview & Tech Stack
**Koli One** is a premier Bulgarian automotive marketplace connecting buyers and sellers with a focus on trust, transparency, and advanced search.

### Tech Stack
*   **Web**: React 18, TypeScript, Vite, TailwindCSS (limited use), Styled Components (primary).
*   **Mobile**: Expo SDK 54, React Native 0.76, Expo Router (File-based routing).
*   **Backend**: Firebase (Auth, Firestore, Realtime Database, Storage, Cloud Functions).
*   **Search**: Algolia (Primary Index) + Firestore (Hybrid Source) + UnifiedSearchService (Orchestrator).
*   **AI**: Gemini Vision (Car Analysis), DeepSeek (Code/Logic).

### Folder Structure
*   `web/`: Main React Web Application.
    *   `src/services/`: Core business logic (Heavy service-oriented architecture).
    *   `src/components/`: Reusable UI components.
    *   `src/hooks/`: Custom React hooks (e.g., `useSellWorkflow`).
*   `mobile_new/`: Expo Mobile Application.
    *   `app/`: File-based routing (`(tabs)`, `(auth)`, `car/[id]`).
    *   `src/services/`: **Ported Services** (Adapted from Web).
*   `functions/`: Firebase Cloud Functions (Node.js).

---

## 2. Core Systems Architecture

### 2.1 Numeric ID System (CRITICAL)
**Purpose:** Replaces long Firebase IDs with short, user-friendly numeric IDs for URLs and references (e.g., `koli.one/car/123/5` -> Seller 123, Car 5).

*   **Key Services:**
    *   `numeric-car-system.service.ts` (Web & Mobile): **Primary Entry Point**.
    *   `numeric-id-counter.service.ts`: Handles atomic increment operations via Firestore Transactions.
    *   `numeric-id-lookup.service.ts`: Resolves Numeric ID <-> Firebase UID.

*   **Data Flow - Car Creation (`createCarAtomic`):**
    1.  User initiates creation.
    2.  `createCarAtomic` starts a Firestore Transaction.
    3.  **READ**: Fetches User's Numeric ID (from `users/{uid}`).
    4.  **READ & INCREMENT**: Fetches `counters/cars/sellers/{sellerId}`. Is executed atomically.
    5.  **WRITE**: Creates Car Document with `sellerNumericId` and new `carNumericId`.
    6.  **WRITE**: Updates User Stats (count of active listings).

*   **Security Constraint:**
    *   Write access to `counters` collection is **RESTRICTED** to Cloud Functions or strictly validated Transactional paths in Firestore Rules.

### 2.2 Sell Workflow (The "Wizard")
**Purpose:** Multi-step car listing process with draft saving and validation.

*   **Web Implementation:**
    *   **Orchestrator:** `WizardOrchestrator.tsx` manages state across 7 steps.
    *   **Service:** `SellWorkflowService.ts` (Facade) -> delegates to `SellWorkflowOperations`, `SellWorkflowImages`, etc.
    *   **State:** `useSellWorkflow` (Hook) + `WorkflowPersistenceService` (LocalStorage) + `DraftsService` (Firestore `drafts` collection).
    *   **Publishing:** Calls `SellWorkflowService.createCarListing` -> validates limits -> uploads images -> calls `unifiedCarService.createCar` (which calls `NumericCarSystem`).

*   **Mobile Implementation (`mobile_new/`):**
    *   **Orchestrator:** `sell.tsx` (simplified).
    *   **Service:** `SellService.ts` -> **Refactored** to use `numericCarSystemService.createCarAtomic` to match Web logic.
    *   **Drafts:** Syncs with Web Drafts if user is logged in.

### 2.3 Unified Search Engine
**Purpose:** Provide "Google-like" search experience with natural language understanding and trust scoring.

*   **Service:** `UnifiedSearchService.ts` (Singleton).
*   **Ranking Algorithm (Revenue Optimization):**
    *   **Trust Score Boost:** High-trust sellers (Score 80-100) get **+30% visibility boost**.
    *   **Medium Trust:** +15% boost.
    *   **Logic:** `applyTrustScoreRanking()` method.
*   **AI Smart Search:**
    *   Uses `aiQueryParserService` to convert "cheap SUV in Sofia" -> `{ priceMax: 5000, bodyType: 'suv', city: 'Sofia' }`.
*   **Infrastructure:**
    *   **Primary:** Algolia (for speed and implementation of facets).
    *   **Fallback/Hybrid:** Firestore queries for specific filters.

### 2.4 Messaging System (Dual Architecture)
**Current Status:** Transitioning from Firestore-simple to Realtime-Database-performant.

*   **Legacy/Simple (Firestore):**
    *   **Service:** `BulgarianMessagingService` (`messaging-service.ts`).
    *   **Collection:** `messages` (Firestore).
    *   **Use Case:** Simple inquiries, email-like messages.
*   **High-Performance (Realtime Database):**
    *   **Service:** `RealtimeMessagingService` (`realtime-messaging.service.ts`).
    *   **Database:** Firebase Realtime Database (RTDB).
    *   **Structure:**
        *   `channels/{channelId}`: Metadata, participants, last message.
        *   `messages/{channelId}/{messageId}`: Actual message content.
        *   `user_channels/{userId}`: Index for fast My Messages list.
    *   **Channel ID:** Deterministic: `msg_{minId}_{maxId}_car_{carId}`.
    *   **Features:** Typing indicators, Presence, Live Offers, Block System (`block-user.service.ts`).

### 2.5 Admin & Permissions
**Purpose:** Role-Based Access Control (RBAC) for staff.

*   **Service:** `AdminService` (`admin-permissions.service.ts`).
*   **Storage:** `admin_permissions/{userId}` (Firestore) - **SEPARATE** from user profile for security.
*   **Roles:** `super_admin`, `admin`, `moderator`.
*   **Key Logic:** `isAdmin(uid)`, `hasPermission(uid, permission)`.

---

## 3. Data Models (Key Schemas)

### User (`users/{uid}`)
```typescript
interface User {
  uid: string;
  numericId: number; // CRITICAL
  email: string;
  role: 'user' | 'dealer' | 'admin';
  trustScore?: number;
  stats: {
    listingsCount: number;
    soldCount: number;
  };
}
```

### Car (`cars/{carId}` OR `passenger_cars/{carId}`)
```typescript
interface Car {
  id: string; // Firebase ID
  sellerId: string; // Firebase UID
  sellerNumericId: number; // KEY for URLs
  carNumericId: number; // KEY for URLs (Sequence per seller)
  
  // Search Fields
  make: string;
  model: string;
  year: number;
  price: number;
  
  // Status
  status: 'active' | 'sold' | 'draft' | 'archived';
  
  // Metadata
  views: number;
  saves: number;
  aiAnalysis?: GeminiAnalysisResult;
}
```

---

## 4. Security & Rules Reference

### Firestore Rules (`firestore.rules`)
*   **Counters:** `write: false` (Only Cloud Functions or Admin SDK). Exception: Strict incremental logic might be allowed if validating `request.resource.data.count == resource.data.count + 1`.
*   **Users:** `read: public` (for profile), `write: owner`.
*   **Cars:** `read: public`, `write: owner`.
*   **Admin Permissions:** `read: owner/admin`, `write: NO ONE` (Only via Admin SDK/Console).

### Storage Rules (`storage.rules`)
*   **Workflow Images:** `read: public`, `write: owner` (while creating listing).
*   **Chat Attachments:** `read: authenticated` (Need to tighten to participants only).

---

## 5. Cloud Functions (`functions/index.ts`)
*   `onUserCreate`: **Trigger**. Assigns next `numericId` to user from `counters/users`.
*   `evaluateCar`: **Callable**. Uses Gemini Vision to analyze car photos for defects/specs.
*   `syncCarsToAlgolia`: **Trigger**. Real-time indexing of created/updated cars.
*   `onUserDelete`: **Trigger**. GDPR cleanup (wipes data, preserves numeric ID hole or recycles).
*   `cleanupExpiredDrafts`: **Scheduled**. Deletes drafts older than 30 days.

---

## 6. Mobile vs. Web Parity
*   **Services:** `mobile_new/src/services` contains **COPIES** of web services.
    *   **Action Item:** Any change to `web/src/services/numeric-*.ts` MUST be replicated to `mobile_new/src/services/`.
*   **Routing:** Web uses React Router (`/car/:id`), Mobile uses Expo Router (`app/car/[id].tsx`).
*   **Auth:** Both use Firebase Auth. Mobile needs `google-services.json`.

---

## 7. Development Guidelines (Do's and Don'ts)

### 🚨 DOs (Critical)
*   **ALWAYS** use `NumericCarSystemService.createCarAtomic` for creating cars. NEVER manually set `carNumericId`.
*   **ALWAYS** use `RealtimeMessagingService` for new chat features (it is the V2 standard).
*   **ALWAYS** update `counters` within a Transaction.

### 🚫 DON'Ts
*   **NEVER** write directly to `users/{uid}/numericId` from the client.
*   **NEVER** bypass the `SellWorkflowService` validation logic when creating listings.
*   **NEVER** mix `BulgarianMessaging` and `RealtimeMessaging` logic for the same conversation.

---

## 8. Known Issues & Future Work
1.  **Messaging Migration:** The project currently has two messaging services. Plan is to fully deprecate `BulgarianMessagingService` (Firestore) in favor of `RealtimeMessagingService` (RTDB).
2.  **Code Duplication:** Service layer is duplicated between Web and Mobile. Future goal: Monorepo with shared `packages/core` workspace.
3.  **Search Cache:** `UnifiedSearchService` needs aggressive caching for "Empty Search" (Homepage load).
