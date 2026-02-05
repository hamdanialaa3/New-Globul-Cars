# 📱 MOBILE IMPLEMENTATION HANDBOOK
> **Merged from:** `MOBILE_DEVELOPMENT_ROADMAP.md`, `WEEK1_CRITICAL_FIXES.md`, `MOBILE_IMPLEMENTATION_PLAN.md`
> **Focus:** `mobile_new` (Expo/React Native)

---

## Part 1: Critical Fixes (Week 1 Priority)

### 1.1 Console.log Violations (Strict Constitution Enforcement)
**Problem:** `console.log` leaks sensitive data and performance.
**Solution:** Use `src/services/logger-service.ts`.

**Implementation:**
```typescript
// src/services/logger-service.ts
export const logger = {
  info: (msg, data) => __DEV__ && console.log(`[INFO] ${msg}`, data),
  error: (msg, err) => {
    if (__DEV__) console.error(`[ERROR] ${msg}`, err);
    // Add Crashlytics here
  }
};
```

### 1.2 Memory Leaks (Firestore Listeners)
**Problem:** `onSnapshot` inside `useEffect` without unsubscribe.
**Fix:** Always return the unsubscribe function.

```typescript
useEffect(() => {
  const q = query(collection(db, 'cars'));
  const unsubscribe = onSnapshot(q, (snap) => setData(snap.docs));
  return () => unsubscribe(); // CRITICAL
}, []);
```

### 1.3 Image Compression
**Tool:** `expo-image-manipulator`.
**Constraint:** Resize to 1280x720 (Gallery) and 400x300 (Thumb) before upload.

---

## Part 2: Development Roadmap (6 Weeks)

### Week 1: Emergency Stability
*   Fix Console Violations.
*   Fix Memory Leaks in `ListingService`.
*   Implement Image Compressor.

### Week 2: Real-time Features
*   **Messaging:** Implement `ChatService` with RTDB/Firestore sync.
*   **Algolia:** Integrate `algoliasearch` for <300ms query speed.

### Week 3: Push Notifications & Analytics
*   Setup `expo-notifications`.
*   Track conversion events.

### Week 4-5: Revenue Features
*   Advanced Search Filters.
*   Seller Ratings.
*   Drafts Auto-save.

### Week 6: Verification & Polish
*   Offline support.
*   Performance profiling.

---

## Part 3: Technical Specs

### Algolia Service
```typescript
import algoliasearch from 'algoliasearch';
const client = algoliasearch(APP_ID, KEY);
const index = client.initIndex('cars');

export const searchCars = async (query) => {
  const { hits } = await index.search(query);
  return hits;
};
```

### Error Handling
Wrap all async calls in `try/catch` and use `handleError(error, context)` utility that maps Firebase error codes to user messages.
