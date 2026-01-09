# 🔴 Critical Missing Items - Action Items
## Bulgarian Car Marketplace - Production Readiness

**Date:** January 2026  
**Priority:** 🔴 CRITICAL - Must Fix Before Launch

---

## 🔴 WEEK 1 (Before Launch) - CRITICAL

### 1. Firebase Auth Trigger: `onUserDelete` Cloud Function
**Priority:** 🔴 CRITICAL  
**Impact:** GDPR Violation, Orphaned Data, Database Bloat  
**Effort:** 4-6 hours  
**Files to Create:**
- `functions/src/triggers/on-user-delete.ts`
- Update `functions/src/index.ts` to export

**Tasks:**
- [ ] Create Cloud Function triggered on Firebase Auth user deletion
- [ ] Delete all car listings across 6 collections
- [ ] Delete all messages in Realtime Database (`/channels/`)
- [ ] Delete all favorites
- [ ] Delete all notifications
- [ ] Delete all reviews authored by user
- [ ] Delete all posts/comments
- [ ] Delete profile pictures from Storage
- [ ] Delete analytics data
- [ ] Delete team memberships (if Company account)
- [ ] Test with test user deletion
- [ ] Add error logging and monitoring

---

### 2. Realtime Database Security Rules
**Priority:** 🔴 CRITICAL  
**Impact:** Unauthorized Access, Data Breach  
**Effort:** 2-3 hours  
**Files to Create:**
- `database.rules.json` (project root)

**Tasks:**
- [ ] Create `database.rules.json` with security rules
- [ ] Protect `/channels/` (only participants can read/write)
- [ ] Protect `/presence/` (only own presence can read/write)
- [ ] Protect `/typing/` (only participants can read, only self can write)
- [ ] Deploy rules: `firebase deploy --only database`
- [ ] Test rules with authenticated/unauthenticated users
- [ ] Verify unauthorized access is blocked

---

### 3. Firestore Rules: Fix `counters` Collection Vulnerability
**Priority:** 🔴 CRITICAL  
**Impact:** Numeric ID System Compromise, Data Corruption  
**Effort:** 1 hour  
**Files to Update:**
- `firestore.rules` (line 16-20)

**Tasks:**
- [ ] Change `counters` write rule to `allow write: if false;`
- [ ] OR: Move counter increments to Cloud Functions
- [ ] Test counter increments still work
- [ ] Verify unauthorized writes are blocked
- [ ] Deploy rules: `firebase deploy --only firestore:rules`

---

### 4. Block User Feature
**Priority:** 🔴 CRITICAL  
**Impact:** User Safety, Harassment Prevention  
**Effort:** 8-10 hours  
**Files to Create:**
- `src/services/messaging/block-user.service.ts`
- `src/components/messaging/BlockUserButton.tsx`
- Update `firestore.rules` (add `blocked_users` collection)

**Tasks:**
- [ ] Create `blocked_users` collection structure
- [ ] Create `blockUser()` service method
- [ ] Create `unblockUser()` service method
- [ ] Create `isBlocked()` check method
- [ ] Update `realtime-messaging.service.ts` to filter blocked users
- [ ] Create `BlockUserButton` component
- [ ] Add "Block" button to profile pages
- [ ] Add blocked users list to settings
- [ ] Update Firestore rules for `blocked_users` collection
- [ ] Test block/unblock functionality
- [ ] Verify messages from blocked users don't appear

---

### 5. Report Spam/Abuse Feature
**Priority:** 🔴 CRITICAL  
**Impact:** Content Moderation, Platform Safety, Legal Liability  
**Effort:** 10-12 hours  
**Files to Create:**
- `src/services/moderation/report-spam.service.ts`
- `src/components/moderation/ReportSpamButton.tsx`
- `src/pages/06_admin/ModerationDashboard.tsx`
- Update `firestore.rules` (add `reports` collection)

**Tasks:**
- [ ] Create `reports` collection structure
- [ ] Create `reportSpam()` service method
- [ ] Create `reportAbuse()` service method
- [ ] Create `ReportSpamButton` component
- [ ] Add "Report" button to:
  - Car listings
  - User profiles
  - Messages
- [ ] Create admin moderation dashboard
- [ ] Add report review workflow (pending, reviewed, resolved)
- [ ] Add email notifications for admins on new reports
- [ ] Update Firestore rules for `reports` collection
- [ ] Test report functionality
- [ ] Create admin UI to review reports

---

### 6. ErrorBoundary Wrapper Around App.tsx
**Priority:** 🔴 CRITICAL  
**Impact:** White Screen of Death Prevention  
**Effort:** 30 minutes  
**Files to Update:**
- `src/App.tsx`

**Tasks:**
- [ ] Import `ErrorBoundary` from `@/components/ErrorBoundary`
- [ ] Wrap `<Router>` with `<ErrorBoundary>`
- [ ] Create fallback component (or use default)
- [ ] Test error boundary by throwing error in component
- [ ] Verify error UI displays correctly
- [ ] Test "Retry" button functionality

---

### 7. Payment Retry Flow - Update Payment Method
**Priority:** 🔴 CRITICAL  
**Impact:** Lost Revenue, Poor User Experience  
**Effort:** 6-8 hours  
**Files to Create:**
- `src/pages/08_payment-billing/UpdatePaymentMethodPage.tsx`
- `src/components/payment/UpdatePaymentMethodForm.tsx`

**Files to Update:**
- `src/pages/08_payment-billing/PaymentFailedPage.tsx`

**Tasks:**
- [ ] Create `UpdatePaymentMethodPage` component
- [ ] Integrate Stripe payment method update API
- [ ] Add "Update Payment Method" button to `PaymentFailedPage`
- [ ] Show payment method expiration warnings
- [ ] Add payment method validation before retry
- [ ] Test payment method update flow
- [ ] Test payment retry after method update

---

### 8. Missing Empty State Components
**Priority:** 🔴 CRITICAL  
**Impact:** Blank Screens, Poor UX  
**Effort:** 4-6 hours  
**Files to Create:**
- `src/components/EmptyStates/NoSearchResults.tsx`
- `src/components/EmptyStates/NoNotifications.tsx`
- `src/components/EmptyStates/NoSavedSearches.tsx`
- `src/components/EmptyStates/NoConsultations.tsx`
- `src/components/EmptyStates/NoCampaigns.tsx`
- `src/components/EmptyStates/NoTeamMembers.tsx`

**Tasks:**
- [ ] Create reusable `EmptyState` component variants
- [ ] Add to search pages (`NoSearchResults`)
- [ ] Add to notifications page (`NoNotifications`)
- [ ] Add to saved searches page (`NoSavedSearches`)
- [ ] Add to consultations tab (`NoConsultations`)
- [ ] Add to campaigns tab (`NoCampaigns`)
- [ ] Add to team management (`NoTeamMembers`)
- [ ] Ensure consistent messaging and CTAs
- [ ] Test on mobile and desktop

---

## 🟡 WEEK 2 (Launch Week) - HIGH PRIORITY

### 9. Consistent Loading States
**Priority:** 🟡 HIGH  
**Impact:** Perceived Performance  
**Effort:** 6-8 hours

**Tasks:**
- [ ] Add loading spinners to message sending
- [ ] Add skeleton loaders for search results
- [ ] Add skeleton loaders for profile data
- [ ] Ensure buttons are disabled during submission
- [ ] Show progress for image uploads (visible progress bars)
- [ ] Test on slow network (3G simulation)

---

### 10. Success Confirmation Feedback
**Priority:** 🟡 HIGH  
**Impact:** User Trust  
**Effort:** 4-6 hours

**Tasks:**
- [ ] Add success toast for car listing published
- [ ] Add "Sent" indicator for messages
- [ ] Add success modal for subscription upgrade
- [ ] Add success page for payments
- [ ] Show checkmarks/icons for successful actions
- [ ] Test on all major actions

---

### 11. Mobile Gestures
**Priority:** 🟡 HIGH  
**Impact:** Mobile UX  
**Effort:** 8-10 hours

**Tasks:**
- [ ] Add pull-to-refresh to messages list
- [ ] Add pull-to-refresh to car listings
- [ ] Add pull-to-refresh to notifications
- [ ] Add swipe-to-delete for notifications
- [ ] Add swipe-to-archive for messages
- [ ] Test on iOS and Android devices

---

### 12. Offline State Handling
**Priority:** 🟡 HIGH  
**Impact:** User Frustration  
**Effort:** 6-8 hours

**Tasks:**
- [ ] Add online/offline detection (use `navigator.onLine` or Firebase)
- [ ] Show "No Internet" banner when offline
- [ ] Queue actions for retry when online (messages, favorites)
- [ ] Disable form submission when offline (with explanation)
- [ ] Test offline/online transitions
- [ ] Test action queue after coming online

---

## 🔵 WEEK 3 (Post-Launch) - MEDIUM PRIORITY

### 13. Error Message Improvements
**Priority:** 🔵 MEDIUM  
**Effort:** 4-6 hours

**Tasks:**
- [ ] Create error message translation service
- [ ] Map technical errors to user-friendly messages
- [ ] Add actionable error messages (tell user what to do)
- [ ] Translate error messages to Bulgarian
- [ ] Test all error scenarios

---

### 14. Form Validation Improvements
**Priority:** 🔵 MEDIUM  
**Effort:** 6-8 hours

**Tasks:**
- [ ] Add real-time validation to profile edit form
- [ ] Add character limit validation to message input
- [ ] Add validation for search filters (min > max price)
- [ ] Show inline error messages
- [ ] Highlight invalid fields
- [ ] Add character counters where applicable

---

### 15. Cleanup Scheduled Jobs
**Priority:** 🔵 MEDIUM  
**Effort:** 6-8 hours

**Tasks:**
- [ ] Schedule `cleanupExpiredDrafts` to run daily
- [ ] Create `cleanupOrphanedFavorites` scheduled job
- [ ] Create `cleanupOrphanedMessages` scheduled job
- [ ] Schedule cleanup jobs in Firebase Functions scheduler
- [ ] Test cleanup jobs with test data
- [ ] Monitor cleanup job execution

---

### 16. Numeric ID Auto-Repair
**Priority:** 🔵 MEDIUM  
**Effort:** 4-6 hours

**Tasks:**
- [ ] Create Cloud Function to detect cars without numeric IDs
- [ ] Auto-repair on car creation (if ID missing)
- [ ] Schedule daily repair job for legacy data
- [ ] Add monitoring/alerting for ID assignment failures
- [ ] Test auto-repair functionality

---

### 17. Algolia Sync Failure Recovery
**Priority:** 🔵 MEDIUM  
**Effort:** 6-8 hours

**Tasks:**
- [ ] Add retry queue for failed Algolia syncs
- [ ] Create Cloud Function to detect and retry failed syncs
- [ ] Monitor sync success rate
- [ ] Alert on sync failures
- [ ] Test retry mechanism

---

### 18. Rate Limiting
**Priority:** 🔵 MEDIUM  
**Effort:** 8-10 hours

**Tasks:**
- [ ] Implement rate limiting for message sending
- [ ] Implement rate limiting for car listing creation
- [ ] Implement rate limiting for search queries
- [ ] Implement rate limiting for image uploads
- [ ] Add rate limit headers to responses
- [ ] Show user-friendly error when rate limit exceeded
- [ ] Test rate limiting with multiple requests

---

## 📊 Progress Tracking

### Critical Items (Week 1)
- [ ] 1. onUserDelete Cloud Function
- [ ] 2. Realtime Database Rules
- [ ] 3. Firestore counters fix
- [ ] 4. Block User Feature
- [ ] 5. Report Spam Feature
- [ ] 6. ErrorBoundary wrapper
- [ ] 7. Payment retry flow
- [ ] 8. Empty state components

### High Priority (Week 2)
- [ ] 9. Loading states
- [ ] 10. Success feedback
- [ ] 11. Mobile gestures
- [ ] 12. Offline handling

### Medium Priority (Week 3+)
- [ ] 13. Error messages
- [ ] 14. Form validation
- [ ] 15. Cleanup jobs
- [ ] 16. Numeric ID repair
- [ ] 17. Algolia sync recovery
- [ ] 18. Rate limiting

---

## 🎯 Completion Criteria

Each item is considered complete when:
1. ✅ Code implemented and tested
2. ✅ Unit tests written (where applicable)
3. ✅ Manual testing completed
4. ✅ Code review approved
5. ✅ Deployed to staging
6. ✅ Staging testing passed
7. ✅ Deployed to production
8. ✅ Production monitoring shows no errors

---

**Last Updated:** January 2026  
**Next Review:** After Week 1 critical items complete
