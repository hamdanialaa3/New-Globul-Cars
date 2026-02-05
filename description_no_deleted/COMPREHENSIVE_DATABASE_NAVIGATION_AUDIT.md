# 🔍 COMPREHENSIVE DATABASE & NAVIGATION AUDIT
## Koli One - Bulgarian Car Marketplace
### Generated: January 2026

---

## 📋 TABLE OF CONTENTS

1. [Firestore Queries Analysis](#1-firestore-queries-analysis)
2. [Firebase Storage Operations](#2-firebase-storage-operations)
3. [Realtime Database (RTDB) Paths](#3-realtime-database-rtdb-paths)
4. [Navigation Patterns Map](#4-navigation-patterns-map)
5. [Critical Issues & Recommendations](#5-critical-issues--recommendations)
6. [Index Recommendations](#6-index-recommendations)

---

## 1. FIRESTORE QUERIES ANALYSIS

### 1.1 Query Distribution by Folder

#### 📁 `web/src/services/` (Primary Business Logic)
| Service File | Query Types | Collections Used |
|--------------|-------------|------------------|
| `favorites.service.ts` | `where()`, `orderBy()`, `limit()` | `favorites`, `cars` |
| `gloubul-connect-service.ts` | `collection()`, `doc()`, `query()` | `connections` |
| `permission-management-operations.ts` | `where()`, `doc()` | `permissions`, `users` |
| `super-admin-operations.ts` | `collection()`, `query()`, `where()` | All collections |
| `moderation.service.ts` | `where()`, `orderBy()` | `reports`, `cars`, `users` |
| `sell-workflow-operations.ts` | `runTransaction()` (3x) | `drafts`, `cars/*` |
| `numeric-id-counter.service.ts` | `runTransaction()` (3x) | `counters/*` |
| `bulgarian-profile-service.ts` | `runTransaction()` | `profiles`, `users` |

#### 📁 `web/src/services/profile/`
| Service File | Query Types | Collections Used |
|--------------|-------------|------------------|
| `UnifiedProfileService.ts` | `doc()`, `getDoc()`, `setDoc()` | `profiles`, `users` |
| `VerificationWorkflowService.ts` | `doc()`, `updateDoc()` | `verifications` |
| `ProfileMediaService.ts` | `doc()`, `updateDoc()` | `profiles` |

#### 📁 `web/src/services/social/`
| Service File | Query Types | Collections Used |
|--------------|-------------|------------------|
| `posts.service.ts` | `where()`, `orderBy()`, `limit()` | `posts` |
| `follow-service.ts` | `doc()`, `setDoc()`, `deleteDoc()` | `follows` |
| `events.service.ts` | `where()`, `orderBy()` | `events` |
| `feed-algorithm.service.ts` | `where()` + `orderBy()` combinations | `posts`, `follows` |

#### 📁 `web/src/services/search/`
| Service File | Query Types | Collections Used |
|--------------|-------------|------------------|
| `firestoreQueryBuilder.ts` | Dynamic `where()`, `orderBy()`, `limit()` | `cars`, `passenger_cars`, `suvs`, etc. |
| `smart-search.service.ts` | Complex queries | All vehicle collections |
| `algolia-search.service.ts` | Hybrid (Algolia + Firestore) | N/A (Algolia primary) |

#### 📁 `web/src/utils/`
| Utility File | Query Types | Collections Used |
|--------------|-------------|------------------|
| `sitemap-generator.ts` | `collection()`, `getDocs()` | `cars`, `profiles` |
| `pagination.ts` | `startAfter()`, `limit()` | Dynamic |
| `price-rating.ts` | `where()` | `cars` |
| `backup-service.ts` | Full collection reads | Multiple |

#### 📁 `web/functions/src/triggers/`
| Trigger File | Query Types | Collections Used |
|--------------|-------------|------------------|
| `on-user-delete.ts` | `runTransaction()`, `where()` | All user-related collections |
| `registration-rate-limit.js` | `where()` + `where()` compound | `registration_attempts` |

---

### 1.2 runTransaction() Locations (22 Total)

| File | Count | Purpose |
|------|-------|---------|
| `numeric-id-counter.service.ts` | 3 | Atomic counter increments for user/car IDs |
| `numeric-car-system.service.ts` | 2 | Car numeric ID assignment |
| `sell-workflow-operations.ts` | 3 | Draft → Published car workflow |
| `bulgarian-profile-service.ts` | 2 | Profile creation with numeric ID |
| `UnifiedProfileService.ts` | 1 | Profile updates |
| `VerificationWorkflowService.ts` | 1 | Verification status changes |
| `UserRepository.ts` | 2 | User CRUD operations |
| `CompanyRepository.ts` | 2 | Company management |
| `DealershipRepository.ts` | 1 | Dealership operations |
| `follow-service.ts` | 2 | Follow count atomicity |
| `mobile_new/src/services/` | 3 | Mobile profile/car operations |

---

### 1.3 ⚠️ SLOW/UNINDEXED QUERIES DETECTED

#### 🔴 HIGH PRIORITY - Compound Queries Without Indexes

```javascript
// ❌ posts.service.ts:64 - Needs composite index
query(collection, where('type', '==', type), orderBy('createdAt', 'desc'), limit(limitCount))
// Index needed: posts(type ASC, createdAt DESC)

// ❌ posts.service.ts:71 - Needs composite index
query(collection, where('authorProfileId', '==', authorProfileId), orderBy('createdAt', 'desc'))
// Index needed: posts(authorProfileId ASC, createdAt DESC)

// ❌ car-history.service.ts:348 - Needs composite index
query(serviceRef, where('carId', '==', carData.id), orderBy('date', 'desc'), limit(10))
// Index needed: service_records(carId ASC, date DESC)

// ❌ car-history.service.ts:415 - Needs composite index
query(mileageRef, where('carId', '==', carData.id), orderBy('date', 'desc'))
// Index needed: mileage_records(carId ASC, date DESC)

// ❌ AllPostsPage/index.tsx:37 - Needs composite index
query(collection(db, 'posts'), where('status', '==', 'published'), orderBy('createdAt', 'desc'))
// Index needed: posts(status ASC, createdAt DESC)

// ❌ EventsPage.tsx:82 - Needs composite index
query(eventsRef, where('date', '>=', now), orderBy('date', 'asc'))
// Index needed: events(date ASC)

// ❌ feed-algorithm.service.ts - Multiple compound queries
// Lines 106, 171, 244, 438 - TRY blocks indicate expected failures
```

#### 🟡 MEDIUM PRIORITY - Client-Side Filtering Workarounds

```javascript
// queryBuilder.service.ts:302-303
// Color filtering done client-side to avoid composite index requirement
// Performance impact: Full collection scan, then filter
```

---

### 1.4 Current Index Status

**⚠️ CRITICAL: `firestore.indexes.json` is EMPTY!**

```json
{
    "indexes": [],
    "fieldOverrides": []
}
```

**Recommendation:** Deploy composite indexes for all compound queries listed above.

---

## 2. FIREBASE STORAGE OPERATIONS

### 2.1 Storage Paths by Service

#### 📁 Car Images (`workflow-images/`)
| Service | Operations | Path Pattern |
|---------|------------|--------------|
| `sell-workflow-images.ts` | `uploadBytes`, `getDownloadURL`, `deleteObject` | `workflow-images/{userId}/{filename}` |
| `car-delete.service.ts` | `deleteObject`, `listAll` | `car-images/{carId}` |

#### 📁 User Media
| Service | Operations | Path Pattern |
|---------|------------|--------------|
| `bulgarian-profile-service.ts` | `uploadBytes`, `getDownloadURL`, `deleteObject` | `profile-pictures/{userId}/{timestamp}-{filename}` |
| `ProfileMediaService.ts` | `uploadBytes`, `getDownloadURL`, `deleteObject` | `users/{uid}/profile/{filename}`, `users/{uid}/cover/{filename}`, `users/{uid}/gallery/{filename}` |
| `image-processing-service.ts` | `uploadBytes`, `getDownloadURL`, `deleteObject` | `users/{userId}/{path}` |
| `UnifiedProfileService.ts` | `uploadBytes`, `getDownloadURL` | `profile-pictures/{userId}/*`, `dealerships/{dealershipId}/logo-*`, `dealerships/{userId}/documents/*` |

#### 📁 Verification Documents
| Service | Operations | Path Pattern |
|---------|------------|--------------|
| `id-verification-service.ts` | `uploadBytes`, `getDownloadURL` | `users/{userId}/documents/{filename}` |
| `VerificationWorkflowService.ts` | `uploadBytes`, `getDownloadURL` | `verification-documents/{uid}/{fileName}` |

#### 📁 Social Content
| Service | Operations | Path Pattern |
|---------|------------|--------------|
| `story.service.ts` | `uploadBytes`, `getDownloadURL`, `deleteObject` | `stories/{userId}/{fileName}` |
| `events.service.ts` | `uploadBytes`, `getDownloadURL` | `events/{userId}/{fileName}` |
| `posts.service.ts` | `uploadBytesResumable`, `getDownloadURL` | Dynamic path |

#### 📁 Profile Enhancements
| Service | Operations | Path Pattern |
|---------|------------|--------------|
| `intro-video.service.ts` | `uploadBytes`, `getDownloadURL`, `deleteObject` | `intro-videos/{userId}/*`, `intro-videos/{userId}/thumbnails/*` |
| `success-stories.service.ts` | `uploadBytes`, `getDownloadURL`, `deleteObject` | Dynamic `storagePath` |
| `achievements-gallery.service.ts` | `uploadBytes`, `getDownloadURL` | Certificate uploads |

#### 📁 Messaging
| Service | Operations | Path Pattern |
|---------|------------|--------------|
| `image-upload.service.ts` | `uploadBytes`, `getDownloadURL`, `deleteObject` | `messages/*` |

#### 📁 Payments
| Service | Operations | Path Pattern |
|---------|------------|--------------|
| `manual-payment-service.ts` | `uploadBytes`, `getDownloadURL` | Payment receipt uploads |

---

### 2.2 Storage Security Rules Analysis

**Current Rules:** `web/storage.rules` (103 lines)

#### ✅ PROTECTED PATHS (Owner-Based)
| Path | Read | Write | Notes |
|------|------|-------|-------|
| `workflow-images/{userId}/**` | Public | Owner only | ✅ Good |
| `profile-pictures/{userId}/**` | Public | Owner only | ✅ Good |
| `profile-photos/{userId}/**` | Public | Owner only | ✅ Good |
| `users/{userId}/profile/**` | Public | Owner only | ✅ Good |
| `users/{userId}/cover/**` | Public | Owner only | ✅ Good |
| `users/{userId}/documents/**` | Owner | Owner only | ✅ Private |
| `verification-documents/{userId}/**` | Owner | Owner only | ✅ Private |
| `dealerships/{userId}/documents/**` | Owner | Owner only | ✅ Private |
| `dealerships/{userId}/{logo-*}` | Public | Owner only | ✅ Good |
| `dealerships/{userId}/media/**` | Public | Owner only | ✅ Good |
| `stories/{userId}/**` | Public | Owner only | ✅ Good |
| `events/{userId}/**` | Public | Owner only | ✅ Good |
| `intro-videos/{userId}/**` | Public | Owner only | ✅ Good |

#### ⚠️ POTENTIALLY RISKY PATHS
| Path | Read | Write | Issue |
|------|------|-------|-------|
| `car-images/**` | Public | Any authenticated | 🟡 Any user can upload |
| `messages/**` | Authenticated | Authenticated | 🟡 Any user can read/write any message media |

#### ✅ SECURE FALLBACK
```firerules
match /{allPaths=**} {
  allow read: if true; // Public read
  allow write: if false; // ✅ Block all writes except explicit paths
}
```

---

### 2.3 🔴 UNORGANIZED/MISSING PATH COVERAGE

| Code Path | Storage Rules Match | Issue |
|-----------|---------------------|-------|
| `manual-payment-service.ts` | ❌ No explicit rule | Falls to blocked fallback |
| `achievements-gallery.service.ts` | ❌ No explicit rule | Certificate uploads blocked |
| `posts.service.ts` (dynamic path) | ❓ Unknown | Needs investigation |

**Recommendation:** Add explicit rules for:
```firerules
match /payment-receipts/{userId}/{allPaths=**} {
  allow read: if isOwner(userId);
  allow write: if isOwner(userId);
}

match /certificates/{userId}/{allPaths=**} {
  allow read: if true;
  allow write: if isOwner(userId);
}
```

---

## 3. REALTIME DATABASE (RTDB) PATHS

### 3.1 Complete RTDB Structure Map

```
Firebase Realtime Database
│
├── channels/
│   └── {channelId}/
│       ├── participants: [numericId1, numericId2]
│       ├── lastMessageAt: timestamp
│       ├── lastMessage: string
│       ├── carId: string (optional - car context)
│       └── unreadCount/
│           └── {userNumericId}: number
│
├── messages/
│   └── {channelId}/
│       └── {messageId}/
│           ├── senderId: numericId
│           ├── text: string
│           ├── timestamp: number
│           ├── status: 'sent' | 'delivered' | 'read'
│           ├── deliveredAt: timestamp
│           ├── readAt: timestamp
│           ├── read: boolean
│           └── metadata/
│               └── ...
│
├── user_channels/
│   └── {userNumericId}/
│       └── {channelId}: true
│
├── presence/
│   └── {userNumericId}/
│       ├── online: boolean
│       ├── lastSeen: timestamp
│       └── status: 'online' | 'away' | 'offline'
│
└── typing/
    └── {channelId}/
        └── {userNumericId}/
            ├── typing: boolean
            └── timestamp: number
```

---

### 3.2 RTDB Service Mapping

| Service File | Paths Used | Operations |
|--------------|------------|------------|
| **`realtime-messaging.service.ts`** | `channels/`, `messages/`, `user_channels/` | Full CRUD |
| **`presence.service.ts`** | `presence/{userId}` | `set`, `onValue`, `onDisconnect` |
| **`typing-indicator.service.ts`** | `typing/{channelId}/{userId}` | `set`, `remove`, `onValue` |
| **`message-deletion.service.ts`** | `messages/{channelId}/{messageId}` | `remove`, `update` |
| **`presence-monitor.ts`** | `presence/` | Batch monitoring |
| **`delivery-engine.ts`** | `messages/{channelId}/{messageId}/status` | Multi-path updates |
| **`car-lifecycle.service.ts`** | `channels/` | Channel cleanup on car delete |
| **`MessageSearch.tsx`** | `user_channels/`, `messages/` | Search functionality |

#### Cloud Functions Using RTDB
| Function File | Trigger Path | Action |
|---------------|--------------|--------|
| `sync-rtdb-to-firestore.ts` | `messages/{channelId}/{messageId}` | Sync to Firestore |
| `sync-rtdb-to-firestore.ts` | `messages/{channelId}/{messageId}/read` | Update read status |
| `realtime-messaging-notifications.ts` | `channels/{channelId}` | Push notifications |
| `on-user-delete.ts` | N/A (cleanup) | Delete `channels/`, `user_channels/`, `presence/`, `typing/` |

---

### 3.3 Mobile App RTDB Usage

| Service | Paths | Operations |
|---------|-------|------------|
| `MessagingService.ts` | `messages/{channelId}`, `channels/{channelId}`, `user_channels/{userNumericId}` | Full messaging |

---

### 3.4 ⚠️ RTDB SECURITY ANALYSIS

**Current Status:** No `database.rules.json` file found in repository!

**Recommendation:** Create RTDB security rules:

```json
{
  "rules": {
    "channels": {
      "$channelId": {
        ".read": "auth != null && root.child('channels').child($channelId).child('participants').hasChild(auth.token.numericId)",
        ".write": "auth != null && root.child('channels').child($channelId).child('participants').hasChild(auth.token.numericId)"
      }
    },
    "messages": {
      "$channelId": {
        ".read": "auth != null && root.child('channels').child($channelId).child('participants').hasChild(auth.token.numericId)",
        ".write": "auth != null && root.child('channels').child($channelId).child('participants').hasChild(auth.token.numericId)"
      }
    },
    "user_channels": {
      "$userNumericId": {
        ".read": "auth != null && auth.token.numericId == $userNumericId",
        ".write": "auth != null && auth.token.numericId == $userNumericId"
      }
    },
    "presence": {
      "$userNumericId": {
        ".read": "auth != null",
        ".write": "auth != null && auth.token.numericId == $userNumericId"
      }
    },
    "typing": {
      "$channelId": {
        "$userNumericId": {
          ".read": "auth != null",
          ".write": "auth != null && auth.token.numericId == $userNumericId"
        }
      }
    }
  }
}
```

---

## 4. NAVIGATION PATTERNS MAP

### 4.1 Complete Route Registry (MainRoutes.tsx - 556 lines)

#### 🏠 Public Routes
| Path | Component | Auth Required |
|------|-----------|---------------|
| `/` | `HomePage` | No |
| `/cars` | `CarsPage` | No |
| `/cars/:city` | `LocationLandingPage` | No |
| `/cars/:city/:brand` | `LocationLandingPage` | No |
| `/cars/electric` | `DynamicCarShowcase` | No |
| `/cars/hybrid` | `DynamicCarShowcase` | No |
| `/cars/low-mileage` | `DynamicCarShowcase` | No |
| `/cars/budget` | `DynamicCarShowcase` | No |
| `/cars/suv`, `/cars/sedan`, etc. | `DynamicCarShowcase` | No |
| `/car/:sellerNumericId/:carNumericId` | `NumericCarDetailsPage` | No |
| `/car/:sellerNumericId/:carNumericId/history` | `CarHistoryPage` | No |
| `/dealer/:slug` | `DealerPublicPage` | No |
| `/search` | `AlgoliaSearchPage` | No |
| `/advanced-search` | `AdvancedSearchPage` | No |
| `/privacy-policy` | `PrivacyPolicyPage` | No |
| `/terms-of-service` | `TermsOfServicePage` | No |
| `/about` | `AboutPage` | No |
| `/contact` | `ContactPage` | No |
| `/help` | `HelpPage` | No |
| `/sitemap` | `SitemapPage` | No |
| `/top-brands` | `TopBrandsPage` | No |
| `/auctions` | `AuctionsPage` | No |
| `/pricing` | `CarPricingPage` | No |
| `/map` | `MapAnalyticsPage` | No |

#### 🔐 Authenticated Routes
| Path | Component | Auth Required |
|------|-----------|---------------|
| `/profile/*` | `NumericProfileRouter` | Yes |
| `/sell/auto` | `SellModalPage` | Yes |
| `/messages` | `RealtimeMessagesPage` | Yes |
| `/notifications` | `NotificationsPage` | Yes |
| `/saved-searches` | `SavedSearchesPage` | Yes |
| `/favorites` | `FavoritesRedirectPage` | Yes |
| `/invoices` | `InvoicesPage` | Yes |
| `/commissions` | `CommissionsPage` | Yes |
| `/dashboard` | `DashboardPage` | Yes |
| `/my-listings` | `MyListingsPage` | Yes |
| `/my-drafts` | `MyDraftsPage` | Yes |
| `/subscription` | `SubscriptionPage` | Yes |
| `/events` | `EventsPage` | Yes |
| `/join-team` | `AcceptInvitePage` | Yes |
| `/dealer-dashboard` | `DealerDashboardPage` | Yes |

#### 🛡️ Admin Routes
| Path | Component | Admin Required |
|------|-----------|----------------|
| `/admin` | `AdminPage` | Yes |
| `/admin/dashboard` | `AdminDashboard` | Yes |
| `/admin-car-management` | `AdminCarManagementPage` | Yes |
| `/admin/data-fix` | `AdminDataFix` | Yes |
| `/admin/algolia-sync` | `AlgoliaSyncManager` | Yes |

#### 👑 Super Admin Routes
| Path | Component | Notes |
|------|-----------|-------|
| `/super-admin-login` | `SuperAdminLoginPage` | Public entry |
| `/super-admin/*` | `SuperAdminDashboard` | Full access |
| `/super-admin/finance/manual-payments` | `AdminManualPaymentsDashboard` | Finance |

#### 🛠️ Dev-Only Routes (`IS_DEV`)
| Path | Component |
|------|-----------|
| `/admin/backup` | `BackupManagement` |
| `/admin/leads` | `LeadScoringDashboard` |
| `/messages/quick-replies` | `QuickReplyManager` |
| `/messages/auto-responder` | `AutoResponderSettings` |
| `/admin/auth-users` | `AuthUsersPage` |
| `/admin/shared-inbox` | `SharedInboxPage` |
| `/dealer/stripe-setup` | `StripeSetupPage` |
| `/admin/delete-mock-cars` | `DeleteMockCarsPage` |
| `/debug-cars` | `DebugCarsPage` |

---

### 4.2 Navigate() Call Frequency Map

| Target Path | Call Count | Source Pages |
|-------------|------------|--------------|
| `/login` | 12+ | ProfilePage, FavoritesPage, MyListingsPage, SocialFeed |
| `/profile` | 8+ | SuccessPage, ProfileSettings, various |
| `/sell` | 10+ | ProfilePage, MyListingsPage, ProfileSettings |
| `/cars` | 8+ | FavoritesPage, ProfileSettings, Search |
| `/messages` | 6+ | ProfilePage, ProfileSettings |
| `/profile/settings` | 5+ | ProfilePage, ProfileOverview |
| `/subscription` | 3+ | CurrentPlanCard |
| `/car/{sellerNumericId}/{carNumericId}` | 3+ | CarsGridSection, listings |
| `/advanced-search` | 2+ | SavedSearchesPage |

---

### 4.3 Link Component Destinations

| Component File | Link Destinations |
|----------------|-------------------|
| `SitemapPage.tsx` | `/cars`, `/sell`, `/about`, `/contact`, `/help`, `/privacy-policy`, `/terms-of-service` |
| `ProfilePage.tsx` | `/profile/:numericId/settings`, `/plans` |
| `Footer.tsx` | All footer links |
| `Header.tsx` | `/`, `/cars`, `/sell`, `/login`, `/register` |

---

### 4.4 ⚠️ NAVIGATION ISSUES DETECTED

#### 🔴 POTENTIAL DEAD ROUTES
| Route Defined | Usage Found | Status |
|---------------|-------------|--------|
| `/visual-search` | Used in navigate() | ❓ No Route definition found |
| `/browse` | Used in WhyUsPage | ❓ No Route definition found |
| `/messaging/{userId}` | Used in FollowingTab | ❓ Should be `/messages` |
| `/profile/view/{numericId}` | Used in FollowingTab | ❓ Should be `/profile/{numericId}` |
| `/profile/my-ads` | Used in ProfileSettings | ❓ Should be `/my-listings` |
| `/posts/{postId}` | Used in AllPostsPage | ❓ No Route definition found |

#### 🟡 POTENTIAL NAVIGATION LOOPS
```
/billing → redirects to → /subscription
/sell → redirects to → /sell/auto
/favorites → redirects to → /profile/{numericId}/favorites
```
**Note:** These are intentional redirects, not loops.

#### 🟡 INCONSISTENT PATTERNS
| Pattern | Examples | Issue |
|---------|----------|-------|
| Profile viewing | `/profile/{id}` vs `/profile/view/{id}` | Inconsistent |
| Messaging | `/messages/{senderId}/{receiverId}` vs `/messages?with={id}` | Multiple patterns |

---

## 5. CRITICAL ISSUES & RECOMMENDATIONS

### 5.1 🔴 CRITICAL (Immediate Action)

1. **Empty Firestore Indexes**
   - `firestore.indexes.json` has no indexes defined
   - All compound queries are full collection scans
   - **Action:** Deploy indexes listed in Section 6

2. **Missing RTDB Security Rules**
   - No `database.rules.json` found
   - All RTDB data potentially accessible
   - **Action:** Create and deploy RTDB rules

3. **Storage Path Gaps**
   - Payment receipts, certificates have no explicit rules
   - May be blocked by fallback
   - **Action:** Add explicit rules

### 5.2 🟡 HIGH PRIORITY

4. **Client-Side Query Filtering**
   - Color filtering done client-side
   - Performance impact on large datasets
   - **Action:** Create composite index or Algolia facet

5. **Dead Navigation Routes**
   - `/visual-search`, `/browse`, `/posts/{postId}` not defined
   - **Action:** Add routes or fix navigate() calls

6. **Inconsistent Profile URLs**
   - `/profile/view/{id}` vs `/profile/{id}`
   - **Action:** Standardize to `/profile/{numericId}`

### 5.3 🟢 MEDIUM PRIORITY

7. **Storage `messages/**` Too Permissive**
   - Any authenticated user can access any message media
   - **Action:** Add channel participant validation

8. **Duplicate Route Aliases**
   - Multiple paths to same component (e.g., `/cars/like-new` & `/cars/low-mileage`)
   - **Action:** Keep for SEO but document clearly

---

## 6. INDEX RECOMMENDATIONS

### 6.1 Required Composite Indexes

Add to `firestore.indexes.json`:

```json
{
  "indexes": [
    {
      "collectionGroup": "posts",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "type", "order": "ASCENDING" },
        { "fieldPath": "createdAt", "order": "DESCENDING" }
      ]
    },
    {
      "collectionGroup": "posts",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "authorProfileId", "order": "ASCENDING" },
        { "fieldPath": "createdAt", "order": "DESCENDING" }
      ]
    },
    {
      "collectionGroup": "posts",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "status", "order": "ASCENDING" },
        { "fieldPath": "createdAt", "order": "DESCENDING" }
      ]
    },
    {
      "collectionGroup": "service_records",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "carId", "order": "ASCENDING" },
        { "fieldPath": "date", "order": "DESCENDING" }
      ]
    },
    {
      "collectionGroup": "mileage_records",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "carId", "order": "ASCENDING" },
        { "fieldPath": "date", "order": "DESCENDING" }
      ]
    },
    {
      "collectionGroup": "events",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "date", "order": "ASCENDING" }
      ]
    },
    {
      "collectionGroup": "registration_attempts",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "fingerprint", "order": "ASCENDING" },
        { "fieldPath": "createdAt", "order": "ASCENDING" }
      ]
    }
  ],
  "fieldOverrides": []
}
```

### 6.2 Deploy Command
```bash
cd web
firebase deploy --only firestore:indexes
```

---

## 📊 SUMMARY STATISTICS

| Category | Count | Status |
|----------|-------|--------|
| **Firestore Query Files** | 50+ | ⚠️ Many unindexed |
| **runTransaction() Calls** | 22 | ✅ Atomic |
| **Storage Paths** | 15 patterns | ⚠️ 3 gaps |
| **Storage Rules** | 103 lines | ✅ Mostly secure |
| **RTDB Paths** | 5 root paths | ❌ No rules |
| **Navigation Routes** | 80+ | ⚠️ 6 dead routes |
| **navigate() Calls** | 80+ | ⚠️ Inconsistent |

---

**Document Generated:** January 2026  
**Author:** GitHub Copilot (Claude Opus 4.5)  
**Repository:** Koli_One_Root
