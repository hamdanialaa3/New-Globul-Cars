# 📁 الملفات المطلوبة للتنفيذ - Checklist

## 🔥 P0 - Critical (Week 1-2)

### Backend - Verification Functions

```
❌ functions/src/verification/approveVerification.ts
   Purpose: Approve dealer/company upgrade request
   Exports: onCall function
   Features: 
   - Check admin authentication
   - Update user.profileType ('dealer' | 'company')
   - Update user.verification.status = 'approved'
   - Send approval email
   - Delete verification request document

❌ functions/src/verification/rejectVerification.ts
   Purpose: Reject upgrade request with reason
   Exports: onCall function
   Features:
   - Validate rejection reason
   - Update status = 'rejected'
   - Send rejection email with reason
   - Keep request for 30 days (audit)

❌ functions/src/verification/verifyEIK.ts
   Purpose: Verify Bulgarian EIK/BULSTAT number
   Exports: onCall function
   Features:
   - Mock response structure (for now)
   - Return { valid: boolean, companyName: string, address: string }
   - TODO: Integrate with Bulgarian Registry API later

❌ functions/src/verification/onVerificationApproved.ts
   Purpose: Trigger on verification approval
   Exports: onDocumentUpdated trigger
   Features:
   - Listen to verificationRequests/{id} changes
   - Update user trust score
   - Log activity to audit log
   - Send notification to user
```

### Frontend - Admin Dashboard

```
❌ src/pages/AdminPage/VerificationReview.tsx
   Purpose: Admin interface for reviewing verification requests
   Features:
   - List pending requests (table view)
   - Document viewer (PDF/image preview)
   - Approve button with confirmation
   - Reject button with reason textarea
   - Status filters (pending/approved/rejected)
   - Search by user email/name
   - Pagination

❌ src/pages/AdminPage/index.tsx
   Purpose: Main admin page with tabs
   Features:
   - Tab navigation (Verification | Users | Reports | Settings)
   - Protected route (admin only)
   - Statistics overview
```

### Backend - Stripe Subscriptions

```
❌ functions/src/subscriptions/createCheckoutSession.ts
   Purpose: Create Stripe Checkout Session for subscription
   Exports: onCall function
   Input: { userId: string, planId: string }
   Features:
   - Get plan details from BillingService
   - Create Stripe customer if new
   - Create checkout session with correct price
   - Set metadata: { userId, planId, planTier }
   - Return { sessionId: string, checkoutUrl: string }

❌ functions/src/subscriptions/stripeWebhook.ts
   Purpose: Handle Stripe webhook events
   Exports: onRequest function
   Features:
   - Verify webhook signature
   - Handle events:
     • checkout.session.completed
     • invoice.payment_succeeded
     • customer.subscription.deleted
     • invoice.payment_failed
   - Update Firestore user.subscription
   - Send confirmation email

❌ functions/src/subscriptions/cancelSubscription.ts
   Purpose: Cancel user subscription
   Exports: onCall function
   Features:
   - Cancel Stripe subscription
   - Update Firestore status = 'canceled'
   - Revert to free plan
   - Send cancellation email

❌ functions/src/subscriptions/updateSubscription.ts
   Purpose: Upgrade/downgrade subscription
   Exports: onCall function
   Features:
   - Update Stripe subscription
   - Handle proration
   - Update Firestore plan details
```

### Frontend - Stripe Integration

```
❌ src/features/billing/StripeCheckout.tsx
   Purpose: Checkout button component
   Props: { planId: string, userId: string }
   Features:
   - Call createCheckoutSession callable
   - Show loading state
   - Redirect to Stripe Checkout URL
   - Handle errors

✅ src/features/billing/BillingService.ts (exists - needs update)
   TODO: Wire to backend callables instead of mock
```

---

## ⚠️ P1 - High Priority (Week 3-4)

### Backend - Analytics

```
❌ functions/src/analytics/aggregateAnalytics.ts
   Purpose: Daily aggregation of user analytics
   Exports: Scheduled function (runs daily)
   Features:
   - Aggregate views per listing
   - Count inquiries
   - Calculate conversion rates
   - Update user.stats document
   - Generate trending data

❌ functions/src/analytics/trackEvent.ts
   Purpose: Log analytics events
   Exports: onCall function
   Features:
   - Track: view, inquiry, favorite, share
   - Store in analytics_events collection
   - Increment counters
```

### Frontend - Analytics Service

```
❌ src/features/analytics/AnalyticsService.ts
   Purpose: Client-side analytics tracking
   Features:
   - trackView(listingId)
   - trackInquiry(listingId, sellerId)
   - trackConversion(listingId)
   - getUserAnalytics(userId)
   - Export methods (toExcel, toPDF)

✅ src/features/analytics/PrivateDashboard.tsx (exists - wire to service)
✅ src/features/analytics/DealerDashboard.tsx (exists - wire to service)
✅ src/features/analytics/CompanyDashboard.tsx (exists - wire to service)
```

### Backend - Reviews

```
❌ functions/src/reviews/submitReview.ts
   Purpose: Submit car seller review
   Exports: onCall function
   Features:
   - Validate: buyer cannot review own listing
   - Create review document
   - Update seller rating average
   - Trigger trust score recalculation

❌ functions/src/reviews/moderateReview.ts
   Purpose: Auto-moderate reviews
   Exports: onDocumentCreated trigger
   Features:
   - Check for profanity
   - Flag suspicious reviews
   - Auto-approve or send to queue

❌ functions/src/reviews/respondToReview.ts
   Purpose: Seller responds to review
   Exports: onCall function
   Features:
   - One response per review
   - Edit within 48 hours
   - Notify reviewer
```

### Frontend - Reviews

```
❌ src/features/reviews/ReviewsService.ts
   Purpose: Client-side review operations
   Features:
   - submitReview(data)
   - getSellerReviews(sellerId)
   - respondToReview(reviewId, response)
   - flagReview(reviewId, reason)

❌ src/components/Reviews/LeaveReview.tsx
   Purpose: Form to leave a review
   Features:
   - 5-star rating input
   - Category ratings (4 categories)
   - Text input (min 50 chars)
   - Photo upload (optional)
   - Submit button

❌ src/components/Reviews/ReviewsList.tsx
   Purpose: Display list of reviews
   Features:
   - Show reviews with pagination
   - Sort by: date, helpful
   - Helpful/Not helpful buttons
   - Seller response display
   - Report button
```

### Backend - Trust Score

```
❌ functions/src/trust/calculateTrustScore.ts
   Purpose: Calculate user trust score (0-100)
   Exports: Helper function + Scheduled function
   Features:
   - Base verifications (email, phone, id, business)
   - Performance metrics (rating, response time)
   - Activity metrics (years active)
   - Negative factors (disputes, warnings)
   - Store in user.verification.trustScore

❌ functions/src/trust/recomputeTrustScores.ts
   Purpose: Nightly recomputation of all trust scores
   Exports: Scheduled function (runs nightly)
```

### Frontend - Trust Score

```
❌ src/utils/trust-score.ts
   Purpose: Client-side trust score utilities
   Features:
   - calculateTrustScore(user) - local calculation
   - getTrustLevel(score) - return 'low' | 'medium' | 'high'
   - getBadges(user) - return earned badges array
```

### Backend - Team Management

```
❌ functions/src/team/inviteTeamMember.ts
   Purpose: Invite team member to company
   Exports: onCall function
   Features:
   - Generate invite token
   - Send invitation email
   - Create pending invite document

❌ functions/src/team/acceptInvite.ts
   Purpose: Accept team invitation
   Exports: onCall function
   Features:
   - Validate token
   - Add to team subcollection
   - Grant permissions
   - Send welcome email

❌ functions/src/team/removeTeamMember.ts
   Purpose: Remove member from team
   Exports: onCall function
   Features:
   - Check permissions (only admin)
   - Remove from subcollection
   - Revoke access
   - Log activity
```

### Frontend - Team Service

```
❌ src/features/team/TeamService.ts
   Purpose: Client-side team operations
   Features:
   - inviteTeamMember(email, role)
   - removeTeamMember(memberId)
   - updateMemberRole(memberId, newRole)
   - getTeamMembers(companyId)

✅ src/features/team/TeamManagement.tsx (exists - wire to service)
```

### Frontend - Public Dealer Pages

```
❌ src/pages/DealerPublicPage.tsx
   Purpose: Public profile for dealers (SEO optimized)
   Route: /dealer/:slug
   Features:
   - Dealer info display
   - Listings showcase with filters
   - Reviews display
   - Contact form
   - Working hours
   - Location map (Google Maps)
   - Schema.org markup
   - Meta tags (title, description, og:image)
```

---

## 📋 P2 - Medium Priority (Week 5+)

### Advanced Messaging

```
❌ src/features/messaging/QuickReplies.tsx
   Purpose: Quick reply templates for dealers
   Features: Predefined responses, custom templates

❌ src/features/messaging/AutoResponder.tsx
   Purpose: Auto-respond based on working hours

❌ src/features/messaging/LeadScoring.tsx
   Purpose: Classify leads (hot/warm/cold)

❌ src/features/messaging/SharedInbox.tsx
   Purpose: Team inbox for companies
```

### Invoicing

```
❌ functions/src/billing/generateInvoice.ts
   Purpose: Generate Bulgarian invoice PDF
   Features: VAT calculation, Bulgarian format, PDF generation

❌ functions/src/billing/emailInvoice.ts
   Purpose: Email invoice to customer
```

### Commissions

```
❌ functions/src/commissions/calculateCommission.ts
   Purpose: Calculate commission on car sale
   Exports: onDocumentCreated trigger on sales
   Features:
   - Dealer: 2%
   - Company: 1.5%
   - Store in commissions collection

❌ functions/src/commissions/generateStatement.ts
   Purpose: Monthly commission statement
   Exports: Scheduled function (1st of month)
```

### Security

```
❌ src/features/security/TwoFactorAuth.tsx
   Purpose: 2FA setup and verification

❌ functions/src/security/verifyTwoFactor.ts
   Purpose: Backend 2FA verification

❌ functions/src/security/auditLog.ts
   Purpose: Log all sensitive actions
```

---

## 📊 File Count Summary

```
P0 Files Needed: 14
├─ Backend Functions: 8
└─ Frontend Components: 6

P1 Files Needed: 16
├─ Backend Functions: 9
└─ Frontend Components: 7

P2 Files Needed: 12
├─ Backend Functions: 6
└─ Frontend Components: 6

Total New Files: 42
Existing Files to Update: 8

Total Work: 50 files
```

---

## ✅ Existing Files (Ready)

```
✅ src/contexts/ProfileTypeContext.tsx
✅ src/firebase/auth-service.ts (BulgarianUser interface)
✅ src/pages/ProfilePage/index.tsx
✅ src/components/Profile/* (17 components)
✅ src/features/verification/VerificationService.ts
✅ src/features/verification/types.ts
✅ src/features/billing/BillingService.ts
✅ src/features/billing/types.ts
✅ src/features/analytics/PrivateDashboard.tsx
✅ src/features/analytics/DealerDashboard.tsx
✅ src/features/analytics/CompanyDashboard.tsx
✅ src/features/team/TeamManagement.tsx
✅ src/utils/profile-completion.ts
```

---

## 🎯 Priority Order

**Week 1: Verification**
1. approveVerification.ts
2. rejectVerification.ts
3. verifyEIK.ts (mock)
4. onVerificationApproved.ts
5. AdminPage/VerificationReview.tsx
6. AdminPage/index.tsx

**Week 2: Subscriptions**
1. createCheckoutSession.ts
2. stripeWebhook.ts
3. StripeCheckout.tsx
4. Wire BillingService
5. Test payment flow

**Week 3: Analytics + Reviews**
1. AnalyticsService.ts (frontend)
2. aggregateAnalytics.ts (backend)
3. Wire dashboards
4. submitReview.ts
5. ReviewsService.ts
6. LeaveReview.tsx
7. ReviewsList.tsx

**Week 4: Team + Public Pages**
1. TeamService.ts
2. inviteTeamMember.ts
3. DealerPublicPage.tsx
4. SEO setup

---

**Use this as your implementation checklist!**  
**Check off items as you complete them.**
