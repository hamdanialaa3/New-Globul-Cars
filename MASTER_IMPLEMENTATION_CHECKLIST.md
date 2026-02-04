# ✅ Master Checklist - Koli One Mobile App

**Project:** Koli One Mobile (React Native + Expo)
**Target:** 85% Feature Completeness
**Timeline:** 6 Weeks
**Status:** Planning → Execution Phase

---

## 📊 WEEK 1: Critical Stabilization (40 hours)

### Task 1.1: Remove console.log Violations ⏱️ 2 hours
- [ ] Create `src/services/logger-service.ts`
- [ ] Define logger interface (info, error, warn, debug)
- [ ] Setup conditional logging (only __DEV__)
- [ ] Update 9 files:
  - [ ] `src/components/home/HeroSection.tsx`
  - [ ] `src/components/home/CategoriesSection.tsx`
  - [ ] `src/components/home/FeaturedShowcase.tsx`
  - [ ] `src/components/home/SearchWidget.tsx`
  - [ ] `src/services/ListingService.ts`
  - [ ] `src/services/SellService.ts`
  - [ ] `src/services/firebase.ts`
  - [ ] `app/car/[id].tsx`
  - [ ] `app/profile/my-ads.tsx`
- [ ] Run grep verification: `grep -r "console\." src/`
- [ ] All results should be 0
- [ ] Git commit: `fix: remove console.log violations`
- [ ] PR review & approval

### Task 1.2: Fix Firebase Memory Leaks ⏱️ 4 hours

#### 1.2.1: Create useFirestoreQuery hook
- [ ] Create `src/hooks/useFirestoreQuery.ts`
- [ ] Implement generic hook for all Firestore subscriptions
- [ ] Add isMounted ref for cleanup
- [ ] Add error handling
- [ ] Add loading state management
- [ ] Type-safe with TypeScript generics

#### 1.2.2: Update ListingService (8 listeners)
- [ ] Convert getListings() → subscribeToListings()
- [ ] Convert getListingById() → subscribeToListing()
- [ ] Convert getUserListings() → subscribeToUserListings()
- [ ] Convert getFeaturedListings() → subscribeToFeaturedListings()
- [ ] Add unsubscribe return values
- [ ] Add isMounted guard
- [ ] Test each method individually

#### 1.2.3: Update Components with Listeners
- [ ] RecentBrowsingSection.tsx (3 listeners)
  - [ ] Add useFirestoreQuery hook
  - [ ] Add cleanup
  - [ ] Add error state
  
- [ ] SearchWidget.tsx (4 listeners)
  - [ ] Add useFirestoreQuery hook
  - [ ] Add cleanup
  - [ ] Test with quick typing
  
- [ ] FeaturedShowcase.tsx (2 listeners)
  - [ ] Add useFirestoreQuery hook
  - [ ] Add cleanup
  
- [ ] Other components with listeners
  - [ ] CategoriesSection.tsx
  - [ ] AI-related components
  - [ ] Profile related

#### 1.2.4: Memory Testing
- [ ] Open iOS simulator with memory profiler
- [ ] Initial state: 80MB
- [ ] After 5 mins browsing: should stay < 120MB
- [ ] After 10 mins browsing: should stay < 130MB
- [ ] After 30 mins browsing: should not crash
- [ ] Memory should decrease when navigating away

- [ ] Git commit: `fix: cleanup Firebase listeners`
- [ ] Git commit: `refactor: use useFirestoreQuery hook`
- [ ] PR review & approval

### Task 1.3: Image Compression Service ⏱️ 2 hours

#### 1.3.1: Create Service
- [ ] Install `expo-image-manipulator` package
- [ ] Create `src/services/ImageCompressionService.ts`
- [ ] Implement compressGalleryImage(uri, options)
- [ ] Implement compressThumbnail(uri, options)
- [ ] Implement getFileSize(uri)
- [ ] Implement formatFileSize(bytes)
- [ ] Add error handling with logger

#### 1.3.2: Apply to Upload Flows
- [ ] Update `PhotosStep.tsx`
  - [ ] Compress before upload
  - [ ] Show size before/after
  - [ ] Test with 5MB image
  
- [ ] Update `VisualSearchTeaser.tsx`
  - [ ] Compress camera photo
  - [ ] Compress gallery photo
  - [ ] Test performance
  
- [ ] Update any other image upload components

#### 1.3.3: Testing
- [ ] Upload 5MB image
- [ ] Verify compressed to 200-300KB
- [ ] Check thumbnail is 50-100KB
- [ ] Test gallery loading time (should be < 5s now)
- [ ] Verify image quality acceptable

- [ ] Git commit: `feat: add image compression`
- [ ] PR review & approval

### Task 1.4: Algolia Search Integration ⏱️ 3 hours

#### 1.4.1: Setup
- [ ] Add `.env` file with Algolia credentials
  - [ ] `EXPO_PUBLIC_ALGOLIA_APP_ID`
  - [ ] `EXPO_PUBLIC_ALGOLIA_SEARCH_KEY`
- [ ] Install `algoliasearch` package

#### 1.4.2: Create Service
- [ ] Create `src/services/AlgoliaSearchService.ts`
- [ ] Implement search(query, options)
- [ ] Implement autocomplete(prefix)
- [ ] Implement facetedSearch(query, facets)
- [ ] Add error handling

#### 1.4.3: Update Search Hook
- [ ] Update `src/hooks/useMobileSearch.ts`
- [ ] Replace Firestore queries with Algolia
- [ ] Add debouncing (300ms)
- [ ] Add result caching
- [ ] Test performance: should be < 500ms

#### 1.4.4: Update Components
- [ ] Update `SearchWidget.tsx` to use Algolia
- [ ] Update `SearchResults.tsx` to use Algolia
- [ ] Add loading state
- [ ] Add error state

#### 1.4.5: Testing
- [ ] Search "BMW": < 500ms response
- [ ] Search "Black SUV": < 500ms response
- [ ] Autocomplete on "B": < 300ms response
- [ ] Test with slow network (2G)
- [ ] Compare with web (should be similar speed)

- [ ] Git commit: `feat: integrate Algolia search`
- [ ] PR review & approval

### Task 1.5: Improve Error Handling ⏱️ 1 hour

#### 1.5.1: Create Utilities
- [ ] Create `src/utils/error-handler.ts`
- [ ] Implement getErrorMessage(error)
- [ ] Implement handleErrorAsync(error, context, options)
- [ ] Create error type mapping for Firebase errors
- [ ] Add translation for common errors

#### 1.5.2: Create Components
- [ ] Create `src/components/common/ErrorState.tsx`
  - [ ] Display error icon
  - [ ] Show error message
  - [ ] Retry button
  
- [ ] Create `src/components/common/LoadingState.tsx`
  - [ ] Loading spinner
  - [ ] Optional message

#### 1.5.3: Update Components
- [ ] Update 20+ try-catch blocks to use new handler
- [ ] Add ErrorState display on error
- [ ] Add LoadingState during operations
- [ ] Test each error scenario

- [ ] Git commit: `improve: better error handling`
- [ ] PR review & approval

### Task 1.6: Firebase Security Rules ⏱️ 1 hour

#### 1.6.1: Update Rules
- [ ] Review current `firestore.rules`
- [ ] Update to restrict reads/writes
- [ ] Add user authentication requirement
- [ ] Add role-based access control
- [ ] Add field-level security

#### 1.6.2: Test Rules
- [ ] Test unauthorized user cannot read
- [ ] Test different user cannot modify others' data
- [ ] Test seller can only edit own listings
- [ ] Test messages only visible to participants

- [ ] Git commit: `security: implement firestore rules`
- [ ] PR review & approval

### Task 1.7: Comprehensive Testing ⏱️ 4 hours

#### 1.7.1: Manual Testing
- [ ] iOS Simulator (15 minutes)
  - [ ] App launches
  - [ ] No crashes
  - [ ] Navigation works
  - [ ] Search responds < 1s
  - [ ] Images load properly
  
- [ ] Android Emulator (15 minutes)
  - [ ] Same as iOS
  
- [ ] 30-minute usage test
  - [ ] Browse home page
  - [ ] Search multiple times
  - [ ] View car details
  - [ ] View seller profile
  - [ ] Check no crashes
  - [ ] Check memory (should stay < 150MB)

#### 1.7.2: Performance Benchmarks
- [ ] Initial load time: < 3s
- [ ] Search latency: < 500ms
- [ ] Image gallery: < 2s for 10 images
- [ ] Memory peak: < 150MB
- [ ] No memory leaks over time

#### 1.7.3: Type Checking
- [ ] Run `npm run type-check`
- [ ] No TypeScript errors
- [ ] All types properly defined

#### 1.7.4: Linting
- [ ] Run `npm run lint`
- [ ] No eslint violations
- [ ] Code style consistent

### Task 1.8: Final Checklist
- [ ] All commits pushed
- [ ] All PRs approved and merged
- [ ] Changelog updated
- [ ] Version bumped (pre-release)
- [ ] Release notes prepared
- [ ] Team notified of completion

---

## 📊 WEEK 2-3: Core Features (50 hours)

### Task 2.1: Real-time Messaging ⏱️ 8 hours
- [ ] Create `ChatService.ts`
  - [ ] sendMessage(senderId, receiverId, text)
  - [ ] subscribeToMessages(userId, otherUserId)
  - [ ] markAsRead(messageId)
  - [ ] uploadMedia(messageId, file)
  
- [ ] Create `ChatScreen.tsx` component
- [ ] Create `MessageBubble.tsx` component
- [ ] Create `ChatList.tsx` component
- [ ] Add typing indicator support
- [ ] Test real-time updates
- [ ] Commit: `feat: add real-time messaging`

### Task 2.2: Push Notifications ⏱️ 4 hours
- [ ] Create `PushNotificationService.ts`
- [ ] Setup Expo push notifications
- [ ] Register device tokens
- [ ] Send test notifications
- [ ] Handle notification taps
- [ ] Commit: `feat: add push notifications`

### Task 2.3: Advanced Search Filters ⏱️ 5 hours
- [ ] Create `AdvancedFilters.tsx` component
- [ ] Implement 10+ filter options
- [ ] Add filter persistence
- [ ] Add clear filters button
- [ ] Update search with filters
- [ ] Commit: `feat: add advanced search filters`

### Task 2.4: Reviews System (Start) ⏱️ 3 hours
- [ ] Create `ReviewService.ts`
- [ ] Create review submission UI
- [ ] Add review display
- [ ] Commit: `feat: add reviews system`

---

## 📊 WEEK 4-5: Revenue Features (40 hours)

### Task 3.1: Seller Dashboard ⏱️ 8 hours
### Task 3.2: Analytics ⏱️ 6 hours
### Task 3.3: Payment System ⏱️ 6 hours
### Task 3.4: Advanced Features ⏱️ 20 hours

---

## 📊 WEEK 6: Polish & Launch (20 hours)

### Task 4.1: Performance Optimization ⏱️ 8 hours
### Task 4.2: UI/UX Polish ⏱️ 6 hours
### Task 4.3: Final Testing ⏱️ 4 hours
### Task 4.4: Launch Preparation ⏱️ 2 hours

---

## 🎯 Quality Gates

### Before Every Commit:
- [ ] Code compiles without errors
- [ ] No TypeScript errors
- [ ] No ESLint violations
- [ ] Tests pass (when applicable)
- [ ] Manual testing on simulator

### Before Every PR:
- [ ] Changelog updated
- [ ] Documentation updated
- [ ] At least 2 reviewers approve
- [ ] All CI checks pass

### Before Every Release:
- [ ] All PR tests pass
- [ ] Performance benchmarks met
- [ ] Manual QA on both iOS/Android
- [ ] Security audit passed
- [ ] Documentation complete

---

## 📝 Progress Tracking

| Phase | Week | Status | Completion | Notes |
|-------|------|--------|------------|-------|
| Critical Fixes | 1 | ⏳ TODO | 0% | Starting Monday |
| Core Features | 2-3 | ⏳ TODO | 0% | After Week 1 |
| Revenue Features | 4-5 | ⏳ TODO | 0% | Mid-project |
| Polish | 6 | ⏳ TODO | 0% | Final week |

---

## 🎉 Success Criteria

### Week 1 Complete When:
- [x] App doesn't crash (tested 30 mins)
- [x] Search < 500ms (10x faster)
- [x] Memory stable (80-100MB)
- [x] No console.log violations
- [x] All tests passing
- [x] Stability 95%+

### Week 3 Complete When:
- [x] Messaging working
- [x] Advanced filters added
- [x] Push notifications sent
- [x] Reviews showing
- [x] Feature parity 60%+

### Week 6 Complete When:
- [x] All features implemented
- [x] Performance optimized
- [x] UI polished
- [x] Zero critical bugs
- [x] Launch ready
- [x] Feature parity 85%+

---

## 📞 Communication

### Daily Standup:
- [ ] Time: 9:00 AM daily
- [ ] Duration: 15 minutes
- [ ] Format: What done, what next, blockers

### Weekly Review:
- [ ] Time: Friday 4:00 PM
- [ ] Duration: 45 minutes
- [ ] Attendees: Dev team, PM, stakeholders

### Escalation Path:
- [ ] Blocker → Tech lead (2 hrs)
- [ ] Major issue → PM (4 hrs)
- [ ] Timeline risk → Director (end of day)

---

**Last Updated:** 2024
**Next Review:** Monday 9:00 AM
**Status:** Ready to start Week 1 ✅
