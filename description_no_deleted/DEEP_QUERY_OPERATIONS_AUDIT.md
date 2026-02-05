# 🔍 DEEP QUERY & DATABASE OPERATIONS AUDIT
## Koli One - Professional Full Analysis
### Date: January 27, 2026

---

## 📑 TABLE OF CONTENTS

1. [Firestore Queries with Line Numbers](#1-firestore-queries-with-line-numbers)
2. [Cloud Functions Callable Mapping](#2-cloud-functions-callable-mapping)
3. [Firestore Rules vs Code Usage Analysis](#3-firestore-rules-vs-code-usage-analysis)
4. [Realtime Database Operations Map](#4-realtime-database-operations-map)
5. [Storage Operations & Security Analysis](#5-storage-operations--security-analysis)
6. [Composite Index Requirements](#6-composite-index-requirements)
7. [Security Vulnerabilities & Recommendations](#7-security-vulnerabilities--recommendations)

---

## 1. FIRESTORE QUERIES WITH LINE NUMBERS

### 1.1 Web Application (web/src/)

#### 📂 Utils & SEO

| File | Line | Query Pattern | Index Required | Risk |
|------|------|---------------|----------------|------|
| [sitemap-generator.ts](../web/src/utils/sitemap-generator.ts#L46-L51) | 46-51 | `collection(db, collectionName), where('status', '==', 'active'), orderBy('createdAt', 'desc'), limit(50000)` | ⚠️ YES | 🟡 Medium |
| [SitemapFactory.ts](../web/src/utils/seo/SitemapFactory.ts#L298-L322) | 298-322 | `where('status', '==', 'active'), orderBy('createdAt', 'desc'), limit(count)` | ⚠️ YES | 🟡 Medium |
| [price-rating.ts](../web/src/utils/price-rating.ts#L98-L105) | 98-105 | `where('make', '=='), where('year', '>='), where('year', '<='), where('status', '==', 'active'), limit(60)` | 🔴 YES (4 fields!) | 🔴 High |
| [pagination.ts](../web/src/utils/pagination.ts#L56-L71) | 56-71 | Dynamic: `where, orderBy, limit, startAfter` | ⚠️ Depends | 🟡 Medium |

#### 📂 Services - User Management

| File | Line | Query Pattern | Index Required | Risk |
|------|------|---------------|----------------|------|
| [users-directory.service.ts](../web/src/services/users/users-directory.service.ts#L63) | 63 | `query(usersRef, orderBy('createdAt', 'desc'))` | ❌ No | 🟢 Low |
| [canonical-user.service.ts](../web/src/services/user/canonical-user.service.ts#L71-L237) | 71-237 | Multiple `doc, getDoc, updateDoc, query, where` | ⚠️ Some | 🟡 Medium |

#### 📂 Services - Notifications & Analytics

| File | Line | Query Pattern | Index Required | Risk |
|------|------|---------------|----------------|------|
| [notification-enhancements.service.ts](../web/src/services/notification-enhancements.service.ts#L339-L397) | 339-397 | `where('userId', '=='), where('isArchived', '=='), orderBy('createdAt', 'desc'), limit(1000)` | ⚠️ YES | 🟡 Medium |
| [workflow-analytics-service.ts](../web/src/services/workflow-analytics-service.ts#L174-L180) | 174-180 | Timestamp range queries: `where('timestamp', '>='), where('timestamp', '<=')` | ⚠️ YES | 🟡 Medium |
| [visitor-analytics-service.ts](../web/src/services/visitor-analytics-service.ts#L72-L104) | 72-104 | `addDoc, query, where, limit` | ⚠️ YES | 🟢 Low |

#### 📂 Services - Social Features

| File | Line | Query Pattern | Index Required | Risk |
|------|------|---------------|----------------|------|
| [posts.service.ts](../web/src/services/social/posts.service.ts#L235-L237) | 235-237 | `where('status', '==', 'published'), where('visibility', '==', 'public'), orderBy('createdAt', 'desc')` | 🔴 YES (3 fields!) | 🔴 High |
| [smart-feed.service.ts](../web/src/services/social/smart-feed.service.ts#L220-L222) | 220-222 | `where('status', '==', 'published'), where('visibility', '==', 'public'), orderBy('createdAt', 'desc')` | 🔴 YES (3 fields!) | 🔴 High |
| [posts-feed.service.ts](../web/src/services/social/posts-feed.service.ts#L111-L113) | 111-113 | `where('status', '==', 'published'), where('visibility', '==', 'public'), orderBy('createdAt', 'desc')` | 🔴 YES | 🔴 High |
| [feed-algorithm.service.ts](../web/src/services/social/algorithms/feed-algorithm.service.ts#L110-L112) | 110-112 | `where('status', '==', 'published'), where('visibility', '==', 'public'), orderBy('createdAt', 'desc')` | 🔴 YES | 🔴 High |
| [events.service.ts](../web/src/services/social/events.service.ts#L180-L182) | 180-182 | `where('status', '==', 'upcoming'), orderBy('startDate', 'asc')` | ⚠️ YES | 🟡 Medium |
| [follow.service.ts](../web/src/services/social/follow.service.ts#L197) | 197 | `orderBy('followedAt', 'desc'), limit` | ❌ No | 🟢 Low |
| [comments.service.ts](../web/src/services/social/comments.service.ts#L114) | 114 | `orderBy('createdAt', 'desc'), limit` | ❌ No | 🟢 Low |
| [recommendations.service.ts](../web/src/services/social/recommendations.service.ts#L155-L156) | 155-156 | `where('visibility', '==', 'public'), orderBy('createdAt', 'desc')` | ⚠️ YES | 🟡 Medium |

#### 📂 Services - Stories & Content

| File | Line | Query Pattern | Index Required | Risk |
|------|------|---------------|----------------|------|
| [story.service.ts](../web/src/services/stories/story.service.ts#L161-L163) | 161-163 | `where('status', '==', 'active'), where('expiresAt', '>', now), orderBy('createdAt', 'desc')` | 🔴 YES (3 fields!) | 🔴 High |

#### 📂 Services - Search

| File | Line | Query Pattern | Index Required | Risk |
|------|------|---------------|----------------|------|
| [smart-search.service.ts](../web/src/services/search/smart-search.service.ts#L450-L463) | 450-463 | Dynamic: `where('status', '==', 'active'), orderBy('createdAt', 'desc')` | ⚠️ YES | 🟡 Medium |
| [search-history.service.ts](../web/src/services/search/search-history.service.ts#L75) | 75 | `orderBy('timestamp', 'desc'), limit` | ❌ No | 🟢 Low |
| [saved-searches-alerts.service.ts](../web/src/services/search/saved-searches-alerts.service.ts#L152) | 152 | `orderBy('createdAt', 'desc')` | ❌ No | 🟢 Low |

#### 📂 Services - Reviews

| File | Line | Query Pattern | Index Required | Risk |
|------|------|---------------|----------------|------|
| [review-service.ts](../web/src/services/reviews/review-service.ts#L227-L228) | 227-228 | `where('status', '==', 'approved'), orderBy('createdAt', 'desc')` | ⚠️ YES | 🟡 Medium |
| [rating-service.ts](../web/src/services/reviews/rating-service.ts#L238) | 238 | `orderBy('createdAt', 'desc'), limit` | ❌ No | 🟢 Low |

#### 📂 Services - Super Admin

| File | Line | Query Pattern | Index Required | Risk |
|------|------|---------------|----------------|------|
| [super-admin-operations.ts](../web/src/services/super-admin-operations.ts#L191) | 191 | `query(usersRef, orderBy('createdAt', 'desc'))` | ❌ No | 🟢 Low |
| [super-admin-operations.ts](../web/src/services/super-admin-operations.ts#L297) | 297 | `orderBy('lastLogin', 'desc'), limit` | ❌ No | 🟢 Low |
| [super-admin-operations.ts](../web/src/services/super-admin-operations.ts#L449) | 449 | `where('status', '==', 'pending')` | ❌ No | 🟢 Low |
| [super-admin-cars-service.ts](../web/src/services/super-admin-cars-service.ts#L115) | 115 | `query(collection(db, 'cars'), orderBy('createdAt', 'desc'))` | ❌ No | 🟢 Low |

---

### 1.2 runTransaction() Locations (Atomic Operations)

| File | Line(s) | Purpose | Risk |
|------|---------|---------|------|
| [numeric-id-counter.service.ts](../web/src/services/numeric-id-counter.service.ts#L18) | 18, 49, 99 | Atomic counter increment for numeric IDs | 🟢 Low |
| [sell-workflow-operations.ts](../web/src/services/sell-workflow-operations.ts#L60) | 60, 167, 235 | Draft → Published workflow transitions | 🟡 Medium |
| [UnifiedProfileService.ts](../web/src/services/profile/UnifiedProfileService.ts#L551) | 551 | Profile creation with verification | 🟡 Medium |
| [VerificationWorkflowService.ts](../web/src/services/profile/VerificationWorkflowService.ts#L82) | 82, 139, 194 | Verification status updates | 🟡 Medium |
| [ProfileService.ts](../web/src/services/profile/ProfileService.ts#L110) | 110 | Profile update transactions | 🟡 Medium |
| [bulgarian-profile-service.ts](../web/src/services/bulgarian-profile-service.ts#L126) | 126 | Bulgarian profile transactions | 🟡 Medium |
| [UserRepository.ts](../web/src/repositories/UserRepository.ts#L73) | 73 | User data transactions | 🟢 Low |
| [CompanyRepository.ts](../web/src/repositories/CompanyRepository.ts#L268) | 268 | Company data transactions | 🟢 Low |
| [DealershipRepository.ts](../web/src/repositories/DealershipRepository.ts#L282) | 282 | Dealership data transactions | 🟢 Low |
| [numeric-story-id.service.ts](../web/src/services/stories/numeric-story-id.service.ts#L19) | 19 | Story numeric ID generation | 🟢 Low |

---

### 1.3 Mobile Application (mobile_new/src/)

| File | Line | Query Pattern | Index Required | Risk |
|------|------|---------------|----------------|------|
| [UnifiedFilterEngine.ts](../mobile_new/src/services/search/UnifiedFilterEngine.ts#L42-L79) | 42-79 | Dynamic: `where('make', '=='), where('model', '=='), where('price', '>='), where('price', '<='), where('year', '>='), where('year', '<=')` | 🔴 YES (Multiple!) | 🔴 High |
| [userService.ts](../mobile_new/src/services/userService.ts#L47-L126) | 47-126 | `runTransaction, doc, getDoc, setDoc, updateDoc` | ⚠️ Some | 🟡 Medium |
| [numeric-id-lookup.service.ts](../mobile_new/src/services/numeric-id-lookup.service.ts#L16-L112) | 16-112 | `where('numericId', '=='), where('sellerNumericId', '=='), where('carNumericId', '=='), limit(1)` | ⚠️ YES | 🟡 Medium |
| [PlatformSyncService.ts](../mobile_new/src/services/PlatformSyncService.ts#L51-L116) | 51-116 | `where('userId', '=='), where('carId', '=='), onSnapshot` | ⚠️ YES | 🟡 Medium |
| [ListingService.ts](../mobile_new/src/services/ListingService.ts#L53-L199) | 53-199 | `where('status', '=='), where('sellerId', '=='), where('vehicleType', '=='), where('fuelType', '==')` | 🔴 YES (4 fields!) | 🔴 High |
| [SubscriptionService.ts](../mobile_new/src/services/SubscriptionService.ts#L41-L64) | 41-64 | `doc, getDoc` | ❌ No | 🟢 Low |
| [numeric-car-system.service.ts](../mobile_new/src/services/numeric-car-system.service.ts#L43-L74) | 43-74 | `runTransaction, doc, collection` | ⚠️ Some | 🟡 Medium |

---

## 2. CLOUD FUNCTIONS CALLABLE MAPPING

### 2.1 Client → Function Mapping

| Client Service | httpsCallable Name | Function File | Export Name |
|----------------|-------------------|---------------|-------------|
| [ai/firebase-ai-callable.service.ts](../web/src/services/ai/firebase-ai-callable.service.ts) | `geminiChat` | [ai-functions.ts](../web/functions/src/ai-functions.ts) | `geminiChat` |
| [ai/firebase-ai-callable.service.ts](../web/src/services/ai/firebase-ai-callable.service.ts) | `geminiPriceSuggestion` | [ai-functions.ts](../web/functions/src/ai-functions.ts) | `geminiPriceSuggestion` |
| [ai/firebase-ai-callable.service.ts](../web/src/services/ai/firebase-ai-callable.service.ts) | `geminiProfileAnalysis` | [ai-functions.ts](../web/functions/src/ai-functions.ts) | `geminiProfileAnalysis` |
| [ai/firebase-ai-callable.service.ts](../web/src/services/ai/firebase-ai-callable.service.ts) | `aiQuotaCheck` | [ai-functions.ts](../web/functions/src/ai-functions.ts) | `aiQuotaCheck` |
| [ai/DeepSeekService.ts](../web/src/services/ai/DeepSeekService.ts) | `aiGenerateText` | [deepseek-proxy.ts](../web/functions/src/ai/deepseek-proxy.ts) | `aiGenerateText` (DISABLED) |
| [ai/DeepSeekService.ts](../web/src/services/ai/DeepSeekService.ts) | `aiGenerateCarDescription` | [deepseek-proxy.ts](../web/functions/src/ai/deepseek-proxy.ts) | `aiGenerateCarDescription` (DISABLED) |
| Multiple pages | `evaluateCar` | [index.ts](../web/functions/src/index.ts#L76) | `evaluateCar` |
| [billing/subscription-service.ts](../web/src/services/billing/subscription-service.ts) | `ext-firestore-stripe-payments-createPortalLink` | Stripe Extension | External |
| [commission-service.ts](../web/src/services/commission-service.ts) | `getCommissionPeriods`, `getCommissionPeriod`, `getAllCommissionPeriods`, `getCommissionRate`, `triggerCommissionCharging`, `markCommissionPaid`, `generateCommissionStatement` | Not Found | ❌ Missing |
| [billing-operations.ts](../web/src/services/billing-operations.ts) | `createCheckoutSession`, `getSubscriptionStatus`, `cancelSubscription`, `updatePaymentMethod`, `generateInvoice`, `getInvoices`, `getInvoice`, `updateInvoiceStatus`, `sendInvoiceEmail` | Not Found | ❌ Missing |
| [cloud-messaging-service.ts](../web/src/services/messaging/cloud-messaging-service.ts) | 15+ functions (quickReply, autoResponder, leadScore, etc.) | Not Found | ❌ Missing |
| [numeric-system-validation.service.ts](../web/src/services/numeric-system-validation.service.ts) | `validateNumericCar`, `validateNumericMessage`, `enforceCarOwnership` | Not Found | ❌ Missing |
| [social-token-provider.ts](../web/src/services/social-token-provider.ts) | `getSocialAccessToken` | Not Found | ❌ Missing |
| [eik-verification-service.ts](../web/src/services/verification/eik-verification-service.ts) | `verifyEIK` | Not Found | ❌ Missing |
| [social-media.service.ts](../web/src/services/social/social-media.service.ts) | `exchangeOAuthToken` | Not Found | ❌ Missing |
| [numeric-id-assignment.service.ts](../web/src/services/numeric-id-assignment.service.ts) | `getUserNumericId` | [triggers/onUserCreate.ts](../web/functions/src/triggers/onUserCreate.ts) | `getUserNumericId` |
| [algolia-operations.ts](../web/src/services/algolia-operations.ts) | `batchSyncAllCarsToAlgolia` | [syncCarsToAlgolia.ts](../web/functions/src/syncCarsToAlgolia.ts#L224) | `batchSyncAllCarsToAlgolia` |
| SEO tools | `requestIndexing` | [indexing-service.ts](../web/functions/src/seo/indexing-service.ts) | `requestIndexing` |
| SEO tools | `getSearchPerformanceDashboard` | [search-console-service.ts](../web/functions/src/seo/search-console-service.ts#L359) | `getSearchPerformanceDashboard` |
| SEO tools | `submitToIndexNow` | [indexnow-service.ts](../web/functions/src/seo/indexnow-service.ts#L154) | `submitToIndexNow` |
| Sitemap tools | `manualSitemapRegeneration` | [sitemap.ts](../web/functions/src/sitemap.ts#L215) | `manualSitemapRegeneration` |
| B2B tools | `exportB2BLeads`, `getB2BAnalytics`, `exportB2BAnalytics` | [b2b-exports.ts](../web/functions/src/analytics/b2b-exports.ts) | `exportB2BLeads`, `getB2BAnalytics`, `exportB2BAnalytics` |
| Analytics | `logSearchEvent` | [bigquery-service.ts](../web/functions/src/analytics/bigquery-service.ts#L38) | `logSearchEvent` |

### 2.2 Cloud Functions by Type

#### Callable (onCall) - 15 Functions
```
geminiChat, geminiPriceSuggestion, geminiProfileAnalysis, aiQuotaCheck
evaluateCar, batchSyncAllCarsToAlgolia, manualSitemapRegeneration
requestIndexing, getSearchPerformanceDashboard, submitToIndexNow
logSearchEvent, getUserNumericId
exportB2BLeads, getB2BAnalytics, exportB2BAnalytics
```

#### HTTP (onRequest) - 3 Functions
```
stripeWebhooks, sitemap, prerenderSEO
```

#### Firestore Triggers - 20+ Functions
```
// onCreate
notifyFollowersOnNewCar, onUserCreate, syncMessageToFirestore

// onUpdate  
onPassengerCarSold, onSuvSold, onVanSold, onMotorcycleSold, onTruckSold, onBusSold

// onDelete
onPassengerCarDeleted, onSuvDeleted, onVanDeleted, onMotorcycleDeleted, onTruckDeleted, onBusDeleted

// onWrite (Algolia Sync)
syncPassengerCarsToAlgolia, syncSuvsToAlgolia, syncVansToAlgolia
syncMotorcyclesToAlgolia, syncTrucksToAlgolia, syncBusesToAlgolia
```

#### Scheduled (PubSub) - 5+ Functions
```
scheduledSitemapRegeneration, cleanupOldNotifications, archiveSoldCars
dailyReminder, cleanupExpiredDrafts
```

#### Auth Triggers - 2 Functions
```
sendWelcomeEmail (auth.user.onCreate)
onUserDelete (auth.user.onDelete)
```

---

## 3. FIRESTORE RULES VS CODE USAGE ANALYSIS

### 3.1 Rules Summary (857 lines)

| Collection | Read | Create | Update | Delete | Notes |
|------------|------|--------|--------|--------|-------|
| `counters/{userId}` | Auth | ❌ | Strict increment | ❌ | Protected counters |
| `counters/users` | Public | ❌ | ❌ | ❌ | Global counter - locked |
| `counters/cars/sellers/{sellerId}` | Auth | Owner | Owner (increment) | ❌ | Car counter per seller |
| `profiles/{profileId}` | Public | Auth | Owner | Owner | User profiles |
| `users/{userId}` | Auth | Owner | Owner/followers | Owner | Follow counters allowed |
| `customers/{uid}` | Owner | Owner | Owner | ❌ | Stripe customers |
| `cars/{carId}` | Public | Auth (seller) | Owner | Owner | Legacy cars |
| `passenger_cars/{carId}` | Public | Auth (seller) | Owner | Owner | Main vehicle collection |
| `suvs/{carId}` | Public | Auth (seller) | Owner | Owner | SUV vehicles |
| `vans/{carId}` | Public | Auth (seller) | Owner | Owner | Van vehicles |
| `motorcycles/{carId}` | Public | Auth (seller) | Owner | Owner | Motorcycles |
| `trucks/{carId}` | Public | Auth (seller) | Owner | Owner | Trucks |
| `buses/{carId}` | Public | Auth (seller) | Owner | Owner | Buses |
| `follows/{followId}` | Public | Auth (follower) | ❌ | Follower | Follow/unfollow only |
| `notifications/{notificationId}` | Owner | ❌ | isRead only | Owner | Cloud Functions create |
| `blocked_users/{blockId}` | Blocker/blocked | Blocker | Blocker | Blocker | Privacy protection |
| `reports/{reportId}` | Reporter | Auth | ❌ | ❌ | Content moderation |
| `posts/{postId}` | Public | Owner | Owner | Owner | Social posts |
| `favorites/{favoriteId}` | Owner | Owner | ❌ | Owner | User favorites |
| `messages/{messageId}` | Sender/recipient | Sender | Sender/recipient | ❌ | No message deletion |
| `conversations/{conversationId}` | Participants | Auth | Participants | ❌ | No conversation deletion |

### 3.2 ⚠️ Rules Issues Detected

#### 🔴 CRITICAL: Missing Cloud Function Implementations

The following `httpsCallable` calls in client code have **NO CORRESPONDING CLOUD FUNCTIONS**:

```typescript
// commission-service.ts - 8 missing functions
getCommissionPeriods, getCommissionPeriod, getAllCommissionPeriods, 
getCommissionRate, triggerCommissionCharging, markCommissionPaid, 
generateCommissionStatement

// billing-operations.ts - 9 missing functions
createCheckoutSession, getSubscriptionStatus, cancelSubscription, 
updatePaymentMethod, generateInvoice, getInvoices, getInvoice, 
updateInvoiceStatus, sendInvoiceEmail

// cloud-messaging-service.ts - 15+ missing functions
createQuickReply, getQuickReplies, updateQuickReply, deleteQuickReply, 
useQuickReply, getAutoResponderSettings, updateAutoResponderSettings, 
calculateLeadScore, getLeads, updateLeadStatus, assignConversation, 
getSharedInbox, addInternalNote, getInternalNotes

// Validation functions - 3 missing
validateNumericCar, validateNumericMessage, enforceCarOwnership

// Social/Auth - 3 missing
getSocialAccessToken, verifyEIK, exchangeOAuthToken
```

**Impact**: These calls will fail with "Function not found" errors at runtime.

#### 🟡 WARNING: Overly Permissive Rules

| Collection | Issue |
|------------|-------|
| `searchAnalytics` | Anonymous create allowed |
| `searchClicks` | Anonymous create allowed |
| `analytics_events` | Anonymous create allowed |
| `ad_campaigns` | Anonymous stat updates allowed |
| `profile_analytics` | Anonymous updates allowed |
| `profile_metrics` | Anonymous updates allowed |
| `userPoints` | Anonymous updates allowed |
| `leaderboard` | Anonymous updates allowed |

---

## 4. REALTIME DATABASE OPERATIONS MAP

### 4.1 RTDB Paths & Operations

#### 📂 Messaging System (Primary RTDB Usage)

| Service | Path | Operations | Line |
|---------|------|------------|------|
| [realtime-messaging.service.ts](../web/src/services/messaging/realtime/realtime-messaging.service.ts#L362) | `channels/{channelId}` | get, set, update | 362, 445, 490, 592 |
| [realtime-messaging.service.ts](../web/src/services/messaging/realtime/realtime-messaging.service.ts#L419) | `user_channels/{userNumericId}/{channelId}` | set, get | 419, 433 |
| [realtime-messaging.service.ts](../web/src/services/messaging/realtime/realtime-messaging.service.ts#L575) | `messages/{channelId}` | push, onValue, query | 575, 742, 776, 804, 810, 825 |
| [realtime-messaging.service.ts](../web/src/services/messaging/realtime/realtime-messaging.service.ts#L717) | `channels/{channelId}/unreadCount/{userNumericId}` | set, get | 717, 738 |
| [realtime-messaging.service.ts](../web/src/services/messaging/realtime/realtime-messaging.service.ts#L843) | `messages/{channelId}/{messageId}/metadata` | update | 843 |

#### 📂 Typing Indicator

| Service | Path | Operations | Line |
|---------|------|------------|------|
| [typing-indicator.service.ts](../web/src/services/messaging/realtime/typing-indicator.service.ts#L139) | `typing/{channelId}/{userNumericId}` | set, remove | 139 |
| [typing-indicator.service.ts](../web/src/services/messaging/realtime/typing-indicator.service.ts#L253) | `typing/{channelId}` | onValue | 253, 286, 291 |

#### 📂 Presence System

| Service | Path | Operations | Line |
|---------|------|------------|------|
| [presence.service.ts](../web/src/services/messaging/realtime/presence.service.ts#L114) | `presence/{numericUserId}` | set, onDisconnect, onValue | 114, 171, 215, 237, 262, 281, 314, 319 |
| [presence-monitor.ts](../web/src/services/messaging/core/presence-monitor.ts#L69) | `presence/{userId}` | get, onValue | 69, 101, 125, 162, 198, 222, 259 |

#### 📂 Message Operations

| Service | Path | Operations | Line |
|---------|------|------------|------|
| [message-deletion.service.ts](../web/src/services/messaging/message-deletion.service.ts#L56) | `messages/{channelId}/{messageId}` | update, remove | 56, 192 |
| [message-deletion.service.ts](../web/src/services/messaging/message-deletion.service.ts#L295) | `messages/{channelId}` | query, remove | 295 |
| [MessageSearch.tsx](../web/src/components/messaging/MessageSearch.tsx#L102) | `user_channels/{userNumericId}` | get | 102 |
| [MessageSearch.tsx](../web/src/components/messaging/MessageSearch.tsx#L116) | `messages/{channelId}` | get | 116 |

#### 📂 Car Lifecycle Integration

| Service | Path | Operations | Line |
|---------|------|------------|------|
| [car-lifecycle.service.ts](../web/src/services/garage/car-lifecycle.service.ts#L52) | `channels` | query | 52, 306 |
| [car-lifecycle.service.ts](../web/src/services/garage/car-lifecycle.service.ts#L70) | `channels/{channelId}` | get, update | 70, 209, 241, 277 |

#### 📂 Social Feed (RTDB)

| Service | Path | Operations | Line |
|---------|------|------------|------|
| [realtime-feed.service.ts](../web/src/services/social/realtime-feed.service.ts#L63) | Feed refs | onValue | 63, 95, 127, 227, 254 |

### 4.2 Mobile RTDB Operations

| Service | Path | Operations | Line |
|---------|------|------------|------|
| [MessagingService.ts](../mobile_new/src/services/MessagingService.ts#L62) | `messages/{channelId}` | push, onValue | 62, 92, 97 |
| [MessagingService.ts](../mobile_new/src/services/MessagingService.ts#L77) | `channels/{channelId}` | update, get | 77, 122 |
| [MessagingService.ts](../mobile_new/src/services/MessagingService.ts#L110) | `user_channels/{userNumericId}` | onValue | 110, 112 |

### 4.3 RTDB Path Structure Summary

```
/
├── channels/
│   └── {channelId}/
│       ├── buyerNumericId: number
│       ├── sellerNumericId: number
│       ├── carNumericId: number
│       ├── lastMessage: object
│       ├── updatedAt: number
│       └── unreadCount/
│           └── {userNumericId}: number
│
├── messages/
│   └── {channelId}/
│       └── {messageId}/
│           ├── senderId: number
│           ├── content: string
│           ├── timestamp: number
│           ├── status: string
│           └── metadata/
│               └── offerStatus: string
│
├── user_channels/
│   └── {userNumericId}/
│       └── {channelId}: boolean|object
│
├── typing/
│   └── {channelId}/
│       └── {userNumericId}: timestamp
│
└── presence/
    └── {numericUserId}/
        ├── online: boolean
        ├── lastSeen: number
        └── device: string
```

---

## 5. STORAGE OPERATIONS & SECURITY ANALYSIS

### 5.1 Storage Operations by Service

#### 📂 Car Images

| Service | Operations | Path Pattern | Line |
|---------|------------|--------------|------|
| [sell-workflow-images.ts](../web/src/services/sell-workflow-images.ts#L4) | uploadBytes, getDownloadURL, deleteObject | `workflow-images/{userId}/{filename}` | 54-55, 144 |
| [car-delete.service.ts](../web/src/services/garage/car-delete.service.ts#L20) | deleteObject, listAll | `car-images/{carId}/*` | 210, 219, 222 |
| [image-upload.service.ts](../web/src/services/car/image-upload.service.ts#L6) | uploadBytes, getDownloadURL, deleteObject | `car-images/{carId}/{filename}` | 103-104, 140 |
| [image-upload-service.ts](../web/src/services/image-upload-service.ts#L4) | uploadBytesResumable, getDownloadURL | Dynamic path | 129, 153 |

#### 📂 Profile & User Media

| Service | Operations | Path Pattern | Line |
|---------|------------|--------------|------|
| [ProfileMediaService.ts](../web/src/services/profile/ProfileMediaService.ts#L13-L16) | uploadBytes, getDownloadURL, deleteObject, listAll | `users/{uid}/profile/*`, `users/{uid}/cover/*`, `users/{uid}/gallery/*` | 60-61, 94-95, 132-133, 184, 308 |
| [bulgarian-profile-service.ts](../web/src/services/bulgarian-profile-service.ts#L31) | uploadBytes, getDownloadURL, deleteObject | `profile-pictures/{userId}/{timestamp}-{filename}` | 269-270, 490 |
| [UnifiedProfileService.ts](../web/src/services/profile/UnifiedProfileService.ts#L28) | uploadBytes, getDownloadURL | `profile-pictures/{userId}/*`, `dealerships/{dealershipId}/logo-*` | 214-215, 247-248, 289-290 |
| [image-processing-service.ts](../web/src/services/profile/image-processing-service.ts#L7-L9) | uploadBytes, getDownloadURL, deleteObject | `users/{userId}/{path}` | 102-103, 116 |
| [intro-video.service.ts](../web/src/services/profile/intro-video.service.ts#L15) | uploadBytes, getDownloadURL, deleteObject | `intro-videos/{userId}/*`, `intro-videos/{userId}/thumbnails/*` | 70-71, 77-78, 142, 146 |

#### 📂 Verification Documents

| Service | Operations | Path Pattern | Line |
|---------|------------|--------------|------|
| [id-verification-service.ts](../web/src/services/verification/id-verification-service.ts#L16) | uploadBytes, getDownloadURL | `users/{userId}/documents/{filename}` | 222-223 |
| [VerificationWorkflowService.ts](../web/src/services/profile/VerificationWorkflowService.ts#L20) | uploadBytes, getDownloadURL | `verification-documents/{uid}/{fileName}` | 62-63 |

#### 📂 Social Content

| Service | Operations | Path Pattern | Line |
|---------|------------|--------------|------|
| [story.service.ts](../web/src/services/stories/story.service.ts#L28) | uploadBytes, getDownloadURL, deleteObject | `stories/{userId}/{fileName}` | 50-51, 245 |
| [events.service.ts](../web/src/services/social/events.service.ts#L25) | uploadBytes, getDownloadURL | `events/{userId}/{fileName}` | 314-315 |
| [posts.service.ts](../web/src/services/social/posts.service.ts#L23) | uploadBytesResumable, getDownloadURL | Dynamic path | 199, 215 |
| [success-stories.service.ts](../web/src/services/profile/success-stories.service.ts#L21) | uploadBytes, getDownloadURL, deleteObject | Dynamic `storagePath` | 58-59, 79 |
| [achievements-gallery.service.ts](../web/src/services/profile/achievements-gallery.service.ts#L19) | uploadBytes, getDownloadURL | Certificate uploads | 233-234 |

#### 📂 Messaging

| Service | Operations | Path Pattern | Line |
|---------|------------|--------------|------|
| [image-upload.service.ts](../web/src/services/messaging/realtime/image-upload.service.ts#L12) | uploadBytes, getDownloadURL, deleteObject | `messages/*` | 132-133, 146-147, 175, 182 |

#### 📂 Dealership

| Service | Operations | Path Pattern | Line |
|---------|------------|--------------|------|
| [dealership.service.ts](../web/src/services/dealership/dealership.service.ts#L20-L22) | uploadBytes, getDownloadURL, deleteObject | `dealerships/{userId}/*` | 117-118, 172, 200-201, 251 |

#### 📂 Payment

| Service | Operations | Path Pattern | Line |
|---------|------------|--------------|------|
| [manual-payment-service.ts](../web/src/services/payment/manual-payment-service.ts#L447) | uploadBytes, getDownloadURL | Payment receipts | 454-455 |

### 5.2 Storage Rules Analysis

**Current Rules (103 lines):**

| Path | Read | Write | Status |
|------|------|-------|--------|
| `workflow-images/{userId}/**` | Public | Owner | ✅ OK |
| `profile-pictures/{userId}/**` | Public | Owner | ✅ OK |
| `profile-photos/{userId}/**` | Public | Owner | ✅ OK |
| `users/{userId}/profile/**` | Public | Owner | ✅ OK |
| `users/{userId}/cover/**` | Public | Owner | ✅ OK |
| `users/{userId}/documents/**` | Owner | Owner | ✅ OK |
| `verification-documents/{userId}/**` | Owner | Owner | ✅ OK |
| `dealerships/{userId}/documents/**` | Owner | Owner | ✅ OK |
| `dealerships/{userId}/logo-*` | Public | Owner | ✅ OK |
| `dealerships/{userId}/media/**` | Public | Owner | ✅ OK |
| `stories/{userId}/**` | Public | Owner | ✅ OK |
| `events/{userId}/**` | Public | Owner | ✅ OK |
| `intro-videos/{userId}/**` | Public | Owner | ✅ OK |
| `car-images/**` | Public | Auth | ⚠️ Any auth user can write |
| `messages/**` | Auth | Auth | ⚠️ Any auth user can R/W |
| `/**` (fallback) | Public | ❌ Blocked | ✅ OK (Jan 25, 2026 fix) |

### 5.3 ⚠️ Storage Security Issues

#### 🔴 CRITICAL: car-images Path

```javascript
// Current rule
match /car-images/{allPaths=**} {
  allow read: if true;
  allow write: if isAuthenticated();  // ⚠️ ANY authenticated user can write!
}
```

**Risk**: Any authenticated user can upload/delete ANY car image.

**Fix Required**:
```javascript
match /car-images/{carId}/{allPaths=**} {
  allow read: if true;
  // Check ownership via metadata or deny client writes
  allow write: if false; // Use Cloud Functions for uploads
}
```

#### 🟡 WARNING: messages Path

```javascript
// Current rule
match /messages/{allPaths=**} {
  allow read, write: if isAuthenticated();  // ⚠️ ANY authenticated user!
}
```

**Risk**: Any authenticated user can read/modify ANY message attachment.

**Recommendation**: Add participant validation or use Cloud Functions.

---

## 6. COMPOSITE INDEX REQUIREMENTS

### 6.1 firestore.indexes.json Status

**Current File**: EMPTY ❌
```json
{
    "indexes": [],
    "fieldOverrides": []
}
```

### 6.2 Required Composite Indexes

Deploy the following indexes to avoid query failures:

```json
{
  "indexes": [
    {
      "collectionGroup": "posts",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "status", "order": "ASCENDING" },
        { "fieldPath": "visibility", "order": "ASCENDING" },
        { "fieldPath": "createdAt", "order": "DESCENDING" }
      ]
    },
    {
      "collectionGroup": "stories",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "status", "order": "ASCENDING" },
        { "fieldPath": "expiresAt", "order": "ASCENDING" },
        { "fieldPath": "createdAt", "order": "DESCENDING" }
      ]
    },
    {
      "collectionGroup": "passenger_cars",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "status", "order": "ASCENDING" },
        { "fieldPath": "createdAt", "order": "DESCENDING" }
      ]
    },
    {
      "collectionGroup": "passenger_cars",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "make", "order": "ASCENDING" },
        { "fieldPath": "price", "order": "ASCENDING" }
      ]
    },
    {
      "collectionGroup": "passenger_cars",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "make", "order": "ASCENDING" },
        { "fieldPath": "year", "order": "DESCENDING" }
      ]
    },
    {
      "collectionGroup": "notifications",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "userId", "order": "ASCENDING" },
        { "fieldPath": "isArchived", "order": "ASCENDING" },
        { "fieldPath": "createdAt", "order": "DESCENDING" }
      ]
    },
    {
      "collectionGroup": "events",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "status", "order": "ASCENDING" },
        { "fieldPath": "startDate", "order": "ASCENDING" }
      ]
    },
    {
      "collectionGroup": "reviews",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "status", "order": "ASCENDING" },
        { "fieldPath": "createdAt", "order": "DESCENDING" }
      ]
    },
    {
      "collectionGroup": "follows",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "followerId", "order": "ASCENDING" },
        { "fieldPath": "followedAt", "order": "DESCENDING" }
      ]
    },
    {
      "collectionGroup": "follows",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "followingId", "order": "ASCENDING" },
        { "fieldPath": "followedAt", "order": "DESCENDING" }
      ]
    }
  ],
  "fieldOverrides": []
}
```

### 6.3 🔴 HIGH-RISK Queries Requiring Indexes

| Query Location | Fields | Priority |
|----------------|--------|----------|
| posts.service.ts:235-237 | `status` + `visibility` + `createdAt` | 🔴 CRITICAL |
| smart-feed.service.ts:220-222 | `status` + `visibility` + `createdAt` | 🔴 CRITICAL |
| feed-algorithm.service.ts:110-112 | `status` + `visibility` + `createdAt` | 🔴 CRITICAL |
| story.service.ts:161-163 | `status` + `expiresAt` + `createdAt` | 🔴 CRITICAL |
| price-rating.ts:98-105 | `make` + `year` + `status` | 🔴 CRITICAL |
| UnifiedFilterEngine.ts:42-79 | `make` + `price` + `year` | 🔴 CRITICAL |
| ListingService.ts:53-199 | `status` + `sellerId` + `vehicleType` + `fuelType` | 🔴 CRITICAL |

---

## 7. SECURITY VULNERABILITIES & RECOMMENDATIONS

### 7.1 Summary of Issues

| Category | Critical | Warning | Total |
|----------|----------|---------|-------|
| Missing Cloud Functions | 38 | 0 | 38 |
| Overly Permissive Rules | 0 | 8 | 8 |
| Storage Security | 1 | 1 | 2 |
| Missing Indexes | 10+ | 0 | 10+ |
| **Total** | **49** | **9** | **58** |

### 7.2 Priority Action Items

#### 🔴 P0 - CRITICAL (Immediate)

1. **Create missing Cloud Functions** for commission, billing, and messaging services (38 functions)
2. **Deploy composite indexes** for posts, stories, and vehicle collections
3. **Fix car-images storage rule** to prevent unauthorized writes

#### 🟡 P1 - HIGH (This Week)

4. **Review analytics rules** that allow anonymous writes
5. **Add participant validation** to messages storage rule
6. **Create indexes** for notification and search queries

#### 🟢 P2 - MEDIUM (This Month)

7. **Audit all httpsCallable calls** and ensure functions exist
8. **Add rate limiting** to anonymous-writable collections
9. **Implement Cloud Function validation** for sensitive operations

### 7.3 Deployment Commands

```bash
# Deploy Firestore Rules
firebase deploy --only firestore:rules

# Deploy Firestore Indexes
firebase deploy --only firestore:indexes

# Deploy Storage Rules
firebase deploy --only storage:rules

# Deploy All Functions
firebase deploy --only functions
```

---

## 📊 STATISTICS

| Metric | Count |
|--------|-------|
| **Firestore Queries (web/src)** | 200+ |
| **Firestore Queries (mobile_new/src)** | 100+ |
| **runTransaction Calls** | 18 |
| **httpsCallable Calls** | 91 |
| **Cloud Functions (Deployed)** | ~50 |
| **Cloud Functions (Missing)** | 38 |
| **RTDB Paths** | 5 main paths |
| **Storage Paths** | 15+ patterns |
| **Required Indexes** | 10+ |
| **Security Issues** | 58 |

---

**Document Generated**: January 27, 2026
**Audit Scope**: Full codebase analysis - web/, mobile_new/, functions/
**Next Review**: Weekly
