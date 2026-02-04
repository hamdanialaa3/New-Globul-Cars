# 🛠️ Mobile Frontend Implementation Plan
## تفصيل الخطة التنفيذية - Mobile Frontend (mobile_new)

---

## Phase 1: Critical Foundation (Weeks 1-2)

### ✅ TASK 1.1: Logger Service Implementation
**Priority:** 🔴 CRITICAL | **Effort:** 2 hours | **Deadline:** Day 1

#### Files to Create:
1. `src/services/logger-service.ts`
2. Update build config to block console in production

#### Implementation Steps:
```typescript
// src/services/logger-service.ts structure:
export interface LogContext {
  userId?: string;
  screen?: string;
  action?: string;
  [key: string]: any;
}

export class LogService {
  static debug(message: string, context?: LogContext)
  static info(message: string, context?: LogContext)
  static warn(message: string, context?: LogContext)
  static error(message: string, error: Error, context?: LogContext)
  static log(level: string, message: string, data?: any)
}

export const logger = LogService;
```

#### Files to Update (9 total):
1. [mobile_new/src/components/home/VisualSearchTeaser.tsx#L168](mobile_new/src/components/home/VisualSearchTeaser.tsx#L168)
   - Replace: `console.error('Camera error:', error)`
   - With: `logger.error('Camera error', error as Error, { screen: 'home' })`

2. [mobile_new/src/components/home/MostDemandedCategories.tsx#L185](mobile_new/src/components/home/MostDemandedCategories.tsx#L185)
   - Replace: `console.error('Error loading trending categories:', error)`
   - With: `logger.error('Error loading trending categories', error as Error)`

3. [mobile_new/src/components/car-details/SimilarCars.tsx#L41](mobile_new/src/components/car-details/SimilarCars.tsx#L41)
   - Replace: `console.log("Error fetching similar cars", e)`
   - With: `logger.error("Error fetching similar cars", e as Error)`

4. [mobile_new/src/components/SmartCamera.tsx#L99](mobile_new/src/components/SmartCamera.tsx#L99)
   - Replace: `console.error('Capture failed:', error)`
   - With: `logger.error('Capture failed', error as Error)`

5. [mobile_new/src/components/sell/WizardOrchestrator.tsx#L127](mobile_new/src/components/sell/WizardOrchestrator.tsx#L127)
   - Replace: `console.error(error)`
   - With: `logger.error('Publish ad failed', error as Error)`

6. [mobile_new/src/components/sell/steps/AIDescriptionStep.tsx#L94](mobile_new/src/components/sell/steps/AIDescriptionStep.tsx#L94)
   - Replace: `console.error()`
   - With: `logger.error()`

7. [mobile_new/src/components/home/CategoriesSection.tsx#L199](mobile_new/src/components/home/CategoriesSection.tsx#L199)
   - Replace: `console.warn("Error loading category cars", e)`
   - With: `logger.warn("Error loading category cars", { error: e })`

8. [mobile_new/src/components/home/FeaturedShowcase.tsx#L123](mobile_new/src/components/home/FeaturedShowcase.tsx#L123)
   - Replace: `console.error(error)`
   - With: `logger.error('Featured showcase error', error as Error)`

9. [mobile_new/src/components/home/RecentBrowsingSection.tsx#L68](mobile_new/src/components/home/RecentBrowsingSection.tsx#L68)
   - Replace: `console.error("Failed to load history", error)`
   - With: `logger.error("Failed to load history", error as Error)`

#### Add TypeScript Strict Mode Check:
```bash
# In package.json add:
"scripts": {
  "type-check": "tsc --noEmit --strict"
}
```

---

### ✅ TASK 1.2: Image Compression & Optimization
**Priority:** 🔴 CRITICAL | **Effort:** 6-8 hours | **Deadline:** Days 2-3

#### Dependencies to Install:
```bash
npm install image-compressor.js
# OR
npm install browser-image-compression
```

#### Files to Create:
1. `src/services/image-optimization.service.ts`
2. `src/services/ImageStorageService.ts`
3. `src/hooks/useImageCompression.ts`

#### Key Implementation:

**src/services/image-optimization.service.ts:**
```typescript
export interface CompressionOptions {
  maxSizeMB?: number;           // default: 1
  maxWidthOrHeight?: number;    // default: 1920
  useWebWorker?: boolean;       // default: true
  onProgress?: (progress: number) => void;
}

export class ImageOptimizationService {
  static async compressImage(file: File, options?: CompressionOptions): Promise<File>
  static async compressMultiple(files: File[], options?: CompressionOptions): Promise<File[]>
  static getCompressionStats(original: File, compressed: File): { originalSize: number; compressedSize: number; ratio: number }
}
```

**src/services/ImageStorageService.ts:**
```typescript
export class ImageStorageService {
  static async uploadImage(file: File, options?: UploadOptions): Promise<{ url: string; size: number; duration: number }>
  static async uploadBatch(files: File[], options?: UploadOptions): Promise<UploadResult[]>
  static async getImages(): Promise<File[]>
  static async deleteImage(url: string): Promise<void>
}
```

#### Integration Points:
1. Update car listing upload component
2. Update profile image upload
3. Update gallery component
4. Add compression progress indicator

---

### ✅ TASK 1.3: Algolia Integration
**Priority:** 🔴 CRITICAL | **Effort:** 6-8 hours | **Deadline:** Days 3-4

#### Setup Steps:
1. Create Algolia account
2. Configure index (cars)
3. Get API credentials
4. Set environment variables

#### Files to Create:
1. `src/services/search/algolia-search.service.ts`
2. `src/hooks/useAlgoliaSearch.ts`

#### Environment Variables (.env):
```env
EXPO_PUBLIC_ALGOLIA_APP_ID=your_app_id
EXPO_PUBLIC_ALGOLIA_SEARCH_API_KEY=your_search_key
EXPO_PUBLIC_ALGOLIA_INDEX_NAME=cars
```

#### Key Implementation:

**src/services/search/algolia-search.service.ts:**
```typescript
export interface AlgoliaSearchParams {
  query: string;
  filters?: string;
  facetFilters?: string[][];
  numericFilters?: string[];
  hitsPerPage?: number;
  page?: number;
}

export class AlgoliaSearchService {
  static async search(params: AlgoliaSearchParams): Promise<AlgoliaSearchResult>
  static async searchFacets(params: FacetSearchParams): Promise<FacetResult[]>
  static isAvailable(): boolean
}
```

**src/hooks/useAlgoliaSearch.ts:**
```typescript
export const useAlgoliaSearch = () => {
  const [results, setResults] = useState<CarListing[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  const search = useCallback(async (query: string, filters?: FilterState) => {
    // Algolia search implementation
  }, [])

  return { results, loading, error, search }
}
```

#### Integration Steps:
1. Update [mobile_new/app/(tabs)/search.tsx](mobile_new/app/(tabs)/search.tsx) to use Algolia
2. Add facet filters for make, model, price, mileage
3. Add typo tolerance
4. Add search suggestions
5. Test performance

---

### ✅ TASK 1.4: Firebase Listener Memory Leak Fixes
**Priority:** 🔴 CRITICAL | **Effort:** 6-8 hours | **Deadline:** Days 4-5

#### Pattern to Follow (from web):
```typescript
// WRONG - has memory leak:
useEffect(() => {
  const unsubscribe = onValue(ref, (snap) => {
    setState(snap.data()); // Updates after unmount!
  });
  return () => unsubscribe();
}, []);

// CORRECT - with guard:
let isActive = true;
useEffect(() => {
  const unsubscribe = onValue(ref, (snap) => {
    if (!isActive) return; // Prevents memory leak
    setState(snap.data());
  });
  return () => {
    isActive = false;
    unsubscribe();
  };
}, []);
```

#### Files to Audit & Fix:
1. [mobile_new/src/services/ListingService.ts](mobile_new/src/services/ListingService.ts)
2. [mobile_new/src/services/MessagingService.ts](mobile_new/src/services/MessagingService.ts)
3. [mobile_new/app/(tabs)/search.tsx](mobile_new/app/(tabs)/search.tsx)
4. [mobile_new/app/(tabs)/messages.tsx](mobile_new/app/(tabs)/messages.tsx)
5. All home components

#### Test Procedure:
- Monitor memory usage while navigating
- Use React DevTools Profiler
- Verify no memory growth after repeated navigation

---

### ✅ TASK 1.5: Error Handling Service
**Priority:** 🟡 HIGH | **Effort:** 4-5 hours | **Deadline:** Day 5

#### Files to Create:
1. `src/services/error-handling-service.ts`
2. `src/types/errors.ts`

#### Implementation:

**src/types/errors.ts:**
```typescript
export enum ErrorCode {
  NETWORK_ERROR = 'NETWORK_ERROR',
  PERMISSION_ERROR = 'PERMISSION_ERROR',
  NOT_FOUND = 'NOT_FOUND',
  UNAUTHORIZED = 'UNAUTHORIZED',
  INVALID_INPUT = 'INVALID_INPUT',
  SERVER_ERROR = 'SERVER_ERROR',
  FIREBASE_ERROR = 'FIREBASE_ERROR',
  STORAGE_ERROR = 'STORAGE_ERROR',
  UNKNOWN = 'UNKNOWN'
}

export class AppError extends Error {
  constructor(
    public code: ErrorCode,
    public message: string,
    public originalError?: Error,
    public context?: Record<string, any>
  ) {
    super(message)
  }
}
```

**src/services/error-handling-service.ts:**
```typescript
export class ErrorHandlingService {
  static handleError(error: unknown, context?: Record<string, any>): AppError {
    // Classify error
    // Log with context
    // Return structured error
  }

  static shouldRetry(error: AppError): boolean
  static getRetryDelay(attempt: number): number
  static getUserMessage(error: AppError): string
}
```

---

---

## Phase 2: Essential Features (Weeks 3-4)

### ✅ TASK 2.1: Messaging Enhancements
**Priority:** 🟡 HIGH | **Effort:** 10-12 hours | **Deadline:** Days 6-7

#### Files to Create:
1. `src/services/messaging/message-deletion.service.ts`
2. `src/services/messaging/message-search.service.ts`
3. `src/services/messaging/block-user.service.ts`
4. `src/components/messaging/TypingIndicator.tsx`
5. `src/components/messaging/ReadReceipt.tsx`
6. `src/components/messaging/PresenceIndicator.tsx`
7. `src/hooks/useMessaging.ts` (enhanced)

#### Key Features:
- Message deletion with undo
- Full-text search in conversations
- User blocking/reporting
- Typing indicators
- Read receipts
- Online status indicator

#### Real-time Database Schema:
```
messages/{conversationId}/
  ├── {messageId}/
  │   ├── content
  │   ├── senderId
  │   ├── timestamp
  │   ├── status: 'sent' | 'delivered' | 'read'
  │   ├── deletedFor: []
  
conversations/{userId}/
  ├── {conversationId}/
  │   ├── lastMessage
  │   ├── unreadCount
  │   ├── participantTyping: {userId: boolean}
  │   ├── participantOnline: {userId: timestamp}
```

---

### ✅ TASK 2.2: Push Notifications System
**Priority:** 🟡 HIGH | **Effort:** 8-10 hours | **Deadline:** Days 8-9

#### Files to Create:
1. `src/services/notifications/fcm.service.ts`
2. `src/services/notifications/unified-notification.service.ts`
3. `src/components/NotificationDropdown.tsx`
4. `src/components/NotificationsSettings.tsx`
5. `src/hooks/useFirestoreNotifications.ts`

#### Implementation:
1. Complete FCM token registration
2. Add notification listeners
3. Create notification dropdown UI
4. Add notification settings/preferences
5. Add sound management
6. Implement notification grouping
7. Add deep linking from notifications

#### Notification Types:
```
- Message received
- New listing in favorite categories
- Price drop alerts
- Message replies
- User interactions
- System announcements
```

---

### ✅ TASK 2.3: Analytics System Expansion
**Priority:** 🟡 HIGH | **Effort:** 6-8 hours | **Deadline:** Days 9-10

#### Update Files:
1. `src/services/AnalyticsService.ts` - Expand to 40+ events
2. Create `src/services/workflow-analytics.service.ts`
3. Create `src/services/visitor-analytics.service.ts`

#### Events to Track (40+):
```
Search Events:
- search_listings (with term, filters)
- view_search_results
- apply_filters
- clear_filters
- save_search
- remove_saved_search

Listing Events:
- view_listing
- add_to_favorites
- remove_from_favorites
- share_listing
- contact_seller
- make_offer

Selling Events:
- start_sell_wizard
- complete_wizard_step_1-10
- upload_image
- complete_wizard
- edit_listing
- delete_listing
- publish_listing

Message Events:
- open_conversation
- send_message
- receive_message
- delete_message
- block_user

App Events:
- app_launch
- app_foreground
- app_background
- app_crash
- permission_requested
- permission_granted
```

---

### ✅ TASK 2.4: Search Features (History, Personalization, Synonyms)
**Priority:** 🟡 HIGH | **Effort:** 8-10 hours | **Deadline:** Days 10-11

#### Files to Create:
1. `src/services/search/saved-searches.service.ts`
2. `src/services/search/search-history.service.ts`
3. `src/services/search/search-personalization.service.ts`
4. `src/services/search/bulgarian-synonyms.service.ts`
5. `src/hooks/useSavedSearches.ts`
6. `src/components/search/SavedSearchesList.tsx`

#### Implementation:
- Save/load searches from Firestore
- Track search history (AsyncStorage + Firestore)
- Personalize results based on user behavior
- Add Bulgarian word synonyms for better matching
- Create saved searches UI

---

### ✅ TASK 2.5: Data Caching Strategy
**Priority:** 🟡 HIGH | **Effort:** 6-8 hours | **Deadline:** Day 12

#### Files to Create:
1. `src/services/firebase-cache.service.ts`
2. `src/services/cache-service.ts`

#### Caching Layers:
```
Layer 1: Memory Cache (fast, volatile)
- Recent search results
- User profile data
- Listing details

Layer 2: IndexedDB (persistent, for images)
- Uploaded images
- Cached images
- Gallery previews

Layer 3: AsyncStorage (small data)
- User preferences
- Last search
- Recent browsing
```

#### Implementation:
```typescript
export class FirebaseCache {
  static async get<T>(key: string): Promise<T | null>
  static async set<T>(key: string, data: T, ttl?: number): Promise<void>
  static async remove(key: string): Promise<void>
  static async clear(): Promise<void>
}
```

---

---

## Phase 3: Premium Features (Weeks 5-6)

### ✅ TASK 3.1: Selling Wizard Completion
**Priority:** 🟡 HIGH | **Effort:** 8-10 hours | **Deadline:** Days 13-14

#### Current Status:
- Step 1: Vehicle Type ✅
- Step 2: Brand/Model ✅
- Step 3: Details ⚠️ Partial
- Step 4: Condition ⚠️ Partial
- Step 5: Price ⚠️ Partial
- Steps 6-10 ❌ Missing

#### Files to Update/Create:
1. Complete [mobile_new/src/components/sell/steps/](mobile_new/src/components/sell/steps/)
2. Create `src/services/sell-workflow-images.ts`
3. Create `src/services/draft-service.ts`
4. Update [mobile_new/src/components/sell/WizardOrchestrator.tsx](mobile_new/src/components/sell/WizardOrchestrator.tsx)

#### Missing Steps Implementation:
1. **Step 6: Images** - Image upload with compression, preview, reorder
2. **Step 7: Description** - Text editor with AI generation
3. **Step 8: Features** - Checkboxes for extras (AC, leather seats, etc.)
4. **Step 9: Verification** - Review all data before publish
5. **Step 10: Publish** - Confirmation and status tracking

#### Draft Auto-save:
```typescript
export class DraftService {
  static async saveDraft(data: SellWorkflowData): Promise<void>
  static async loadDraft(): Promise<SellWorkflowData | null>
  static async deleteDraft(): Promise<void>
  static async getDraftTimestamp(): Promise<number | null>
}
```

---

### ✅ TASK 3.2: Car Details Enhancements
**Priority:** 🟡 HIGH | **Effort:** 8-10 hours | **Deadline:** Days 15-16

#### Components to Create:
1. `src/components/FinanceCalculator.tsx`
2. `src/components/InsuranceCalculator.tsx`
3. `src/components/CarComparison.tsx`
4. `src/components/PriceHistory.tsx`

#### Finance Calculator:
```typescript
interface FinanceOptions {
  price: number;
  downPayment: number;
  interestRate: number;
  months: number;
}

// Calculate monthly payment, total interest, etc.
```

#### Insurance Calculator:
```typescript
interface InsuranceQuote {
  basePrice: number;
  ageFactor: number;
  vehicleFactor: number;
  totalEstimate: number;
}
```

---

### ✅ TASK 3.3: Profile & Settings
**Priority:** 🟡 HIGH | **Effort:** 6-8 hours | **Deadline:** Day 17

#### Files to Create:
1. `src/components/ProfileDashboard.tsx`
2. `src/components/SettingsPanel.tsx`
3. `src/services/user-settings.service.ts`

#### Features:
- User profile editing
- Notification preferences
- Privacy settings
- Language/theme preferences
- Account security
- Activity history

---

### ✅ TASK 3.4: Deep Linking & Navigation
**Priority:** 🟡 HIGH | **Effort:** 4-5 hours | **Deadline:** Day 18

#### Update Files:
1. [mobile_new/app/_layout.tsx](mobile_new/app/_layout.tsx)
2. Create route validators

#### Deep Links to Support:
```
koli://car/{sellerNumericId}/{carNumericId}
koli://profile/{numericId}
koli://messages/{conversationId}
koli://search?q={query}&make={make}&model={model}
koli://sell/{carNumericId}/edit
```

---

---

## Phase 4: Polish & Optimization (Week 7)

### ✅ TASK 4.1: UI/UX Polish (8-10 hours)
- [ ] Add skeleton loaders to all list components
- [ ] Add smooth page transitions
- [ ] Add gesture support (swipe, long press)
- [ ] Add haptic feedback
- [ ] Fix style inconsistencies
- [ ] Add accessibility labels

### ✅ TASK 4.2: Offline Support (6-8 hours)
- [ ] Implement offline detection
- [ ] Queue operations while offline
- [ ] Sync when back online
- [ ] Show offline indicator
- [ ] Test offline scenarios

### ✅ TASK 4.3: Performance Optimization (4-6 hours)
- [ ] Lazy load images
- [ ] Optimize bundle size
- [ ] Reduce re-renders
- [ ] Add virtual scrolling
- [ ] Monitor memory usage

---

---

## 🎯 Success Metrics & Milestones

### Week 1 Milestones:
- [ ] Logger service deployed
- [ ] Image compression working
- [ ] Algolia integration complete
- [ ] Firebase memory leaks fixed
- [ ] Error handling service implemented

**Target Completion:** 40-50 hours work

### Week 2 Milestones:
- [ ] Messaging enhancements live
- [ ] Push notifications integrated
- [ ] Analytics tracking 40+ events
- [ ] Search features (history, personalization)
- [ ] Caching system implemented

**Target Completion:** 40-50 hours work

### Week 3-4 Milestones:
- [ ] Selling wizard 100% complete
- [ ] Car details fully featured
- [ ] Profile & settings complete
- [ ] Deep linking working
- [ ] 10+ quick wins implemented

**Target Completion:** 30-40 hours work

### Performance Targets:
```
Search Response:      <100ms (Algolia)
Image Upload:         <2s for 2MB
Message Delivery:     <1s
Page Load:            <2s
Crash Rate:           <0.1%
Memory Leaks:         0
Feature Complete:     95%+
```

---

## 📋 Dependencies to Install

```bash
npm install \
  algoliasearch \
  image-compressor.js \
  firebase@^12.8.0 \
  @firebase/storage@^10.0.0 \
  expo-notifications@^0.32.16 \
  react-native-async-storage@^2.2.0

# Dev dependencies:
npm install --save-dev \
  @types/algoliasearch \
  @testing-library/react-native
```

---

## 🔗 Reference Links

- [Web Services Pattern](../web/src/services/)
- [Web Components Pattern](../web/src/components/)
- [CONSTITUTION.md](../CONSTITUTION.md)
- [Web Instructions](../web/.github/copilot-instructions.md)

---

**Document Created:** February 3, 2026  
**Last Updated:** February 3, 2026  
**Status:** Ready for Implementation  

