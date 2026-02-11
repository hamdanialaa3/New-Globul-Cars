# KOLI ONE - DEEP QUERY & PATH AUDIT REPORT
> **DATE:** February 8, 2026
> **SCOPE:** Web (`web/src`) & Mobile (`mobile_new/src`)
> **STATUS:** CRITICAL ARCHITECTURAL ANALYSIS

This document contains a comprehensive audit of all Firestore interactions, Storage paths, Realtime Database structures, and Navigation flows in the Koli One project.

---

## 1. 🔍 Firestore Queries Audit

### 1.1 Query Patterns & Performance Risks
The audit revealed a Heavy Write / Heavy Read pattern with "Multi-Collection" complexity.

#### **A. Multi-Collection Queries (High Latency Risk)**
*   **Problem:** The platform iterates through multiple collections (`passenger_cars`, `suvs`, `vans`, etc.) for nearly every "Global Search" or "Get User Listings" operation. This causes the "N+1 Query" problem, multiplying reads and latency.
*   **Affected Files:**
    *   `web/src/services/queryBuilder.service.ts` (`fetchCarsForPageType`)
    *   `dashboard-operations.ts` (`StatsOperations.getDashboardStats` calls `queryAllCollections`)
    *   `mobile_new/src/services/ListingService.ts` (`getListings`)
*   **Code Example:**
    ```typescript
    // FOUND IN: ListingService.ts
    for (const collName of VEHICLE_COLLECTIONS) {
        // ... await getDocs(...) inside loop -> SERIAL EXECUTION
    }
    ```
*   **Impact:** If you have 7 vehicle categories, you perform 7 sequential network requests just to load the homepage or profile.
*   **Recommendation:** Move to a single `listings` logic collection or use a `Collection Group Query` if schemas match. Alternatively, execute promises in `Promise.all()` (Web does this sometimes, Mobile does not).

#### **B. Unindexed Queries Detected**
*   **Sport Cars Logic (`queryBuilder.service.ts`):**
    *   `where('numberOfDoors', '==', 2)` (No OrderBy)
    *   `where('power', '>=', 270)` (No OrderBy)
    *   **Risk:** These fallback to checking *every document* or rely on simple indexes, but merging result sets manually in memory (`allSportCars.set(...)`) is inefficient for large datasets.
*   **Dashboard Stats (`StatsOperations.calculateStatsFromCars`):**
    *   Fetches **ALL** user cars into memory then filters with `.length`.
    *   **Risk:** As a dealer scales to 1,000+ listings, this will crash the browser/app.
    *   **Fix:** Use Aggregation Queries (`count()`) instead of fetching documents.

#### **C. Cursor-Based Pagination Implementation**
*   **Observation:** `fetchCarsForPageTypePaginated` uses `startAfter(lastDocument)`.
*   **Status:** ✅ **Good Practice**. This is correctly implemented to handle infinite scrolling.

---

## 2. 🗄️ Storage Paths Audit

### 2.1 Storage Path Structure
The application writes to Firebase Storage but also heavily relies on **IndexedDB** for local draft capabilities.

#### **A. Protected & Unprotected Paths**
*   **User Uploads:** Likely in `users/{uid}/...` (Standard).
*   **Workflow Images:** Stored locally in IndexedDB (`sell-workflow-images`) before final upload.
    *   **File:** `image-storage-operations.ts`
    *   **Risk:** If the user clears browser cache, draft images are lost.
*   **Missing Path definitions:** The code scans revealed `generateThumbnail` and validation logic, but explicit Storage Buckets paths (e.g., `gs://...`) are abstracted in `sell-workflow-service.ts` (not fully visible in this scan).

#### **B. Optimization Opportunities**
*   **Image Resizing:** Done Client-Side (`canvas.drawImage`).
    *   ✅ **Good:** Saves bandwidth and server processing.
    *   **Constraint:** Mobile implementation needs to use `expo-image-manipulator` equivalent instead of DOM `HTMLCanvasElement`.

---

## 3. ⚡ Realtime Database Paths

### 3.1 Path Structure (`realtime-messaging.service.ts`)
The new messaging system uses a standardized path integrity.

*   `channels/{channelId}`: Metadata for the conversation.
*   `messages/{channelId}/{messageId}`: Actual chat logs.
*   `user_channels/{userId}/{channelId}`: fast look-up index.
*   `presence/{userId}`: Online/Offline status.
*   `typing/{channelId}/{userId}`: Typing indicators.

### 3.2 Security Risks in Code
*   **Channel ID Generation:** `msg_{minId}_{maxId}_car_{carId}`.
    *   ✅ **Safe:** Deterministic ID prevents duplicate channels.
*   **Unprotected Access:** The code relies on client-side checks `if (recipientId !== userId)`.
    *   **CRITICAL:** Must ensure Firebase Security Rules (`database.rules.json`) mirror this logic. Logic in TS files is **bypassable**.

---

## 4. 🧭 Navigation & Routing Audit

### 4.1 Web Navigation (`src/routes`, `react-router`)
*   **Pattern:** Standard URL params `koli.one/car/:id`.
*   **Redirects:** `NumericCarRedirect.tsx` ensures legacy numeric IDs resolve to correct pages.

### 4.2 Mobile Navigation (`expo-router`)
*   **Structure:** File-based routing in `app/`.
    *   `app/(tabs)/index.tsx`: Home
    *   `app/(tabs)/search.tsx`: Search
    *   `app/(tabs)/sell.tsx`: Sell Workflow
    *   `app/(tabs)/messages.tsx`: Inbox
    *   `app/(tabs)/profile.tsx`: Profile
*   **Deep Linking:** Handles `koli.one/car/*` links via universal links config.
*   **Dead Routes:**
    *   `app/profile/my-ads.tsx` vs `app/(tabs)/profile.tsx`: Potential duplication or nested navigation confusion.

---

## 5. 🚀 Action Plan & Recommendations

1.  **OPTIMIZE QUERIES (High Priority):**
    *   **Web/Mobile:** Replace `for (coll of COLLECTIONS)` loops with `Promise.all()` at minimum.
    *   **Dashboard:** Replace "Fetch All + Filter JS" with `countFromServer()` queries.
    *   **Mobile:** Add `FlashList` for rendering listings to avoid Main Thread freezes.

2.  **NORMALIZE DATA:**
    *   Consider a "Unified Index" collection (`all_listings_index`) that contains just `{ id, price, year, make, model, collectionName }` for super-fast searching without checking 6+ collections.

3.  **MOBILE PARITY:**
    *   Fix `ListingService.ts` on mobile to use `startAfter` (Pagination), currently it only has `limit(20)` and no `fetchMore` visible in the snippet.

4.  **SECURITY RULES CHECK:**
    *   Verify `storage.rules` prohibits writes to `public/` unless specific conditions are met.
    *   Verify `firestore.rules` blocks write access to `counters` collection (verified in previous audit, but worth repeating).

---
*Audit conducted by Antigravity Agent*
