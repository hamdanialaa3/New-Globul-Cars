# Profile System Implementation Plan - 8 Clear Steps
## Bulgarian Car Marketplace - Complete Profile Enhancement

**Date:** October 18, 2025  
**Target:** 100% Implementation  
**Strategy:** Incremental, tested development in 8 manageable phases

---

## CURRENT SYSTEM ANALYSIS

### What We Have:
```
EXISTING COMPONENTS:
✓ ProfilePage (index.tsx) - 1,480 lines (needs restructuring)
✓ BulgarianUser interface with accountType ('individual' | 'business')
✓ Basic verification structure (email, phone, identity, business)
✓ ProfileImageUploader, CoverImageUploader
✓ TrustBadge, ProfileStats, ProfileCompletion
✓ GarageSection, ProfileGallery
✓ VerificationPanel, IDReferenceHelper
✓ BusinessUpgradeCard, BusinessBackground
✓ FollowButton, ProfileAnalyticsDashboard (basic)
✓ PrivacySettings

EXISTING SERVICES:
✓ auth-service.ts (needs profileType addition)
✓ google-profile-sync.service
✓ car-analytics.service
✓ car-delete.service
✓ follow.service
✓ trust-score-service (basic)

EXISTING ROUTES:
✓ /profile - Main profile page
✓ /profile?userId=XXX - View other profiles
✓ /messages - Messaging system exists
✓ /admin - Admin dashboard exists

FIREBASE:
✓ Firestore (needs security rules update)
✓ Authentication (working)
✓ Storage (working)
✓ Cloud Functions (basic setup)
```

### What We Need to Add:
```
MISSING CRITICAL FEATURES:
[ ] ProfileTypeContext (private/dealer/company differentiation)
[ ] LEDProgressAvatar (circular progress ring)
[ ] Profile type-specific components (Private/Dealer/Company views)
[ ] Verification workflow (document upload + admin approval)
[ ] Subscription/billing system (Stripe integration)
[ ] Type-specific analytics dashboards
[ ] Team management (for company accounts)
[ ] Enhanced security rules + indexes
[ ] Remote Config for feature flags
```

---

## 8-STEP IMPLEMENTATION PLAN

---

## STEP 1: Foundation - ProfileTypeContext & Data Model Enhancement
**Duration:** 3-4 hours  
**Goal:** Add profile type system without breaking existing functionality

### Tasks:
```
1.1 Update BulgarianUser Interface
    File: bulgarian-car-marketplace/src/firebase/auth-service.ts
    
    ADD to BulgarianUser interface:
    • profileType: 'private' | 'dealer' | 'company'  (default: 'private')
    • verification.level: 'none' | 'basic' | 'business' | 'company'
    • plan: { tier, status, renewsAt }
    • trust.score: number (0-100)
    
    KEEP existing: accountType (for backward compatibility)

1.2 Create ProfileTypeContext
    File: bulgarian-car-marketplace/src/contexts/ProfileTypeContext.tsx
    (~100 lines)
    
    exports:
    • profileType: 'private' | 'dealer' | 'company'
    • theme: { primary, secondary, accent }
    • permissions: { canAddListings, maxListings, hasAnalytics, hasTeam }
    • isPrivate, isDealer, isCompany (boolean helpers)
    • switchProfileType(newType) (for future upgrade flow)

1.3 Wrap App with ProfileTypeContext
    File: bulgarian-car-marketplace/src/App.tsx
    
    <ProfileTypeProvider>
      <Router>
        <Routes>...</Routes>
      </Router>
    </ProfileTypeProvider>

1.4 Update useProfile Hook
    File: bulgarian-car-marketplace/src/pages/ProfilePage/hooks/useProfile.ts
    
    ADD:
    • profileType to state
    • Load profileType from Firestore
    • Provide profileType to consumers

1.5 Migration Script (Optional - for existing users)
    File: scripts/migrate-profile-types.js
    
    For all users without profileType:
    • If accountType === 'business' → profileType = 'dealer'
    • Else → profileType = 'private'
```

### Acceptance Criteria:
```
[PASS] ProfileTypeContext created and exported
[PASS] App wrapped with ProfileTypeProvider
[PASS] useProfile returns profileType
[PASS] Existing profiles load without errors
[PASS] Theme colors change based on profileType (console log test)
```

### Testing Commands:
```bash
cd bulgarian-car-marketplace
npm start
# Open browser → /profile
# Console should show: "ProfileType: private" (or dealer/company)
# No errors in console
```

---

## STEP 2: LED Progress Avatar System
**Duration:** 4-5 hours  
**Goal:** Visual progress indicator around profile pictures

### Tasks:
```
2.1 Create Profile Completion Calculator
    File: bulgarian-car-marketplace/src/utils/profile-completion.ts
    (~100 lines)
    
    export function calculateProfileCompletion(
      user: BulgarianUser, 
      profileType: 'private' | 'dealer' | 'company'
    ): number {
      // Private: Email 20%, Phone 20%, Photo 15%, Name 10%, Address 15%, Bio 10%
      // Dealer: + EIK 15%, Business name 10%, Working hours 5%, Services 10%, Payment 10%
      // Company: + VAT 10%, Team setup 5%, Headquarters 10%, Authorized person 10%
      // Returns 0-100
    }

2.2 Create LEDProgressAvatar Component
    File: bulgarian-car-marketplace/src/components/Profile/LEDProgressAvatar.tsx
    (~150 lines)
    
    Props:
    • photoURL: string
    • size: number (120 for private, 216 for dealer, 240 for company)
    • shape: 'circle' | 'square'
    • ledColor: string (#FF8F10, #16a34a, #1d4ed8)
    • progress: number (0-100)
    • showProgress: boolean
    
    Features:
    • SVG circle animation (stroke-dasharray)
    • Pulse animation (opacity 1 ↔ 0.7)
    • Progress text below avatar
    • Color-coded text (red <50, amber 50-79, blue 80-99, green 100)

2.3 Update ProfilePage to Use LED Avatar
    File: bulgarian-car-marketplace/src/pages/ProfilePage/index.tsx
    
    Replace: ProfileImageUploader
    With: <LEDProgressAvatar
            photoURL={user?.photoURL}
            size={profileType === 'private' ? 120 : 
                  profileType === 'dealer' ? 216 : 240}
            shape={profileType === 'company' ? 'square' : 'circle'}
            ledColor={getThemeColor(profileType)}
            progress={calculateProfileCompletion(user, profileType)}
            showProgress={true}
          />

2.4 Add Progress Text Translations
    File: bulgarian-car-marketplace/src/locales/translations.ts
    
    ADD:
    profile: {
      led_progress_title_bg: "Профилът е завършен на {progress}%",
      led_progress_title_en: "Profile {progress}% complete",
      led_complete_bg: "Всички функции отключени",
      led_complete_en: "All features unlocked"
    }
```

### Acceptance Criteria:
```
[PASS] calculateProfileCompletion returns correct percentage
[PASS] LED ring appears around profile picture
[PASS] Ring color matches profileType (orange/green/blue)
[PASS] Progress text displays below avatar
[PASS] Animation is smooth (pulse effect visible)
[PASS] Different sizes for private/dealer/company
```

### Testing Commands:
```bash
npm start
# Navigate to /profile
# Should see colored ring around avatar
# Check console for progress percentage
# Verify ring fills according to completion
```

---

## STEP 3: Profile Type-Specific Components
**Duration:** 6-8 hours  
**Goal:** Create distinct views for Private, Dealer, Company profiles

### Tasks:
```
3.1 Create PrivateProfile Component
    File: bulgarian-car-marketplace/src/pages/ProfilePage/components/PrivateProfile.tsx
    (~280 lines)
    
    Features:
    • LED avatar (120px, circular, orange)
    • Bio section
    • Active listings (max 3 free, 10 premium)
    • Contact info (masked by default)
    • Trust score display
    • Social links (optional)

3.2 Create DealerProfile Component
    File: bulgarian-car-marketplace/src/pages/ProfilePage/components/DealerProfile.tsx
    (~280 lines)
    
    Features:
    • LED avatar (216px, circular, green)
    • Business info (name, EIK, address, working hours)
    • Inventory showcase (up to 50/150 listings)
    • Services offered (financing, warranty, trade-in)
    • Contact info (full display)
    • Reviews section
    • "Verified Dealer" badge (if verified)

3.3 Create CompanyProfile Component
    File: bulgarian-car-marketplace/src/pages/ProfilePage/components/CompanyProfile.tsx
    (~280 lines)
    
    Features:
    • LED avatar (240px, square, blue)
    • Corporate info (company name, VAT, headquarters)
    • Fleet overview
    • Locations list
    • Team members (if team enabled)
    • Corporate analytics preview
    • "Enterprise Partner" badge

3.4 Create ProfileModeSwitcher Component
    File: bulgarian-car-marketplace/src/pages/ProfilePage/components/ProfileModeSwitcher.tsx
    (~150 lines)
    
    Features:
    • Dropdown to preview different profile types (dev/admin only)
    • "Upgrade to Dealer" button (for private users)
    • "Upgrade to Company" button (for dealers)
    • Modal with requirements checklist
    • Link to /verification page

3.5 Update ProfilePage Main Component
    File: bulgarian-car-marketplace/src/pages/ProfilePage/index.tsx
    
    BEFORE: Single view for all users
    AFTER: Switch based on profileType
    
    {profileType === 'private' && <PrivateProfile user={user} />}
    {profileType === 'dealer' && <DealerProfile user={user} />}
    {profileType === 'company' && <CompanyProfile user={user} />}
```

### Acceptance Criteria:
```
[PASS] Private profile displays correctly (orange theme)
[PASS] Dealer profile displays correctly (green theme)
[PASS] Company profile displays correctly (blue theme)
[PASS] LED avatars have correct sizes and shapes
[PASS] Profile switcher dropdown works (dev mode)
[PASS] "Upgrade" button appears for private users
[PASS] Content adapts to profile type
```

### Testing Commands:
```bash
npm start
# Test private profile: /profile (default)
# Test dealer: manually set profileType='dealer' in Firestore
# Test company: manually set profileType='company' in Firestore
# Verify colors, sizes, and content differ
```

---

## STEP 4: Verification System - Document Upload & Admin Approval
**Duration:** 8-10 hours  
**Goal:** Complete verification workflow (Private → Dealer → Company)

### Tasks:
```
4.1 Create VerificationPage
    File: bulgarian-car-marketplace/src/features/verification/VerificationPage.tsx
    (~250 lines)
    
    Sections:
    • Current verification status
    • Requirements checklist (dynamic by target type)
    • Document upload form
    • Submit button
    • Progress indicator

4.2 Create DocumentUpload Component
    File: bulgarian-car-marketplace/src/features/verification/DocumentUpload.tsx
    (~200 lines)
    
    Features:
    • File input (PDF/JPG, max 5MB)
    • Preview after upload
    • Multiple documents support
    • Status indicator (pending/uploaded/verified/rejected)
    • Delete/replace document

4.3 Create VerificationService
    File: bulgarian-car-marketplace/src/features/verification/VerificationService.ts
    (~250 lines)
    
    Functions:
    • uploadDocument(userId, file, type)
    • submitVerification(userId, documents)
    • getVerificationStatus(userId)
    • updateVerificationStatus(userId, status, notes) // admin only

4.4 Create AdminApprovalQueue
    File: bulgarian-car-marketplace/src/features/verification/AdminApprovalQueue.tsx
    (~280 lines)
    
    Features:
    • List of pending verifications
    • Document preview inline
    • EIK verification button (calls external API - placeholder for now)
    • Notes field (for rejection reason)
    • Approve/Reject buttons
    • Sends email notification

4.5 Update Admin Dashboard
    File: bulgarian-car-marketplace/src/pages/AdminDashboard.tsx
    
    ADD new tab: "Verifications" (next to Users, Listings, Reports)
    Content: <AdminApprovalQueue />

4.6 Create Cloud Function: onVerificationApproved
    File: functions/src/verification/on-verification-approved.ts
    
    Trigger: Firestore update on users/{uid}.verification.status
    Actions:
    • If status === 'approved':
      - Update user.profileType
      - Update user.verification.level
      - Send email notification
      - Log action to adminLogs

4.7 Add Route for Verification
    File: bulgarian-car-marketplace/src/App.tsx
    
    <Route path="/verification" element={<VerificationPage />} />
```

### Acceptance Criteria:
```
[PASS] User can access /verification page
[PASS] Document upload works (Firebase Storage)
[PASS] Submit button triggers Firestore update
[PASS] Admin sees pending applications in dashboard
[PASS] Admin can view documents inline
[PASS] Approve button updates profileType
[PASS] User receives email notification
[PASS] All actions logged in adminLogs
```

### Testing Commands:
```bash
# As user:
npm start → /verification
# Upload test documents
# Submit

# As admin:
npm start → /admin → Verifications tab
# Should see pending application
# Click Approve
# Check user profile → should be 'dealer' now
# Check email (test email service)
```

---

## STEP 5: Billing System - Stripe Integration & Subscriptions
**Duration:** 8-10 hours  
**Goal:** Full subscription management with Stripe

### Tasks:
```
5.1 Setup Stripe (Test Mode)
    • Create Stripe test account (if not exists)
    • Get API keys (test mode)
    • Add to .env:
      REACT_APP_STRIPE_PUBLISHABLE_KEY=pk_test_...
    • Add to functions .env:
      STRIPE_SECRET_KEY=sk_test_...

5.2 Create Stripe Products (in Stripe Dashboard)
    Products:
    • Private Premium: €9.99/month
    • Dealer Basic: €49/month
    • Dealer Pro: €99/month
    • Dealer Enterprise: €199/month
    • Company Starter: €299/month
    • Company Pro: €599/month
    • Company Enterprise: €999/month

5.3 Create BillingPage
    File: bulgarian-car-marketplace/src/features/billing/BillingPage.tsx
    (~250 lines)
    
    Sections:
    • Current plan display
    • Plan comparison table
    • Upgrade/downgrade buttons
    • Billing history
    • Payment method management
    • Invoice downloads

5.4 Create SubscriptionPlans Component
    File: bulgarian-car-marketplace/src/features/billing/SubscriptionPlans.tsx
    (~250 lines)
    
    Features:
    • Grid of 9 plans
    • Feature comparison
    • Current plan highlighted
    • "Upgrade" / "Downgrade" buttons
    • Redirects to Stripe Checkout

5.5 Create StripeCheckout Component
    File: bulgarian-car-marketplace/src/features/billing/StripeCheckout.tsx
    (~200 lines)
    
    Features:
    • Stripe Elements integration
    • Card input
    • Submit payment
    • Success/error handling

5.6 Create BillingService
    File: bulgarian-car-marketplace/src/features/billing/BillingService.ts
    (~280 lines)
    
    Functions:
    • createCheckoutSession(userId, planId)
    • getSubscriptionStatus(userId)
    • cancelSubscription(userId)
    • updatePaymentMethod(userId, paymentMethodId)
    • getInvoices(userId)

5.7 Create Cloud Functions for Stripe
    File: functions/src/billing/
    
    Functions:
    • createStripeCheckoutSession(userId, planId)
    • handleStripeWebhook(event) // customer.subscription.updated, etc.
    • getSubscriptionStatus(userId)

5.8 Create listing-limits Utility
    File: bulgarian-car-marketplace/src/utils/listing-limits.ts
    (~80 lines)
    
    export async function canAddListing(userId: string): Promise<boolean> {
      // Check user.plan.tier
      // Compare user.stats.activeListings to limit
      // Return true/false
    }

5.9 Enforce Listing Caps in Add Car Flow
    File: bulgarian-car-marketplace/src/pages/SellCar/* (all entry points)
    
    BEFORE: Always allow
    AFTER:
    useEffect(() => {
      const checkLimit = async () => {
        const canAdd = await canAddListing(currentUser.uid);
        if (!canAdd) {
          toast.error("Listing limit reached. Upgrade your plan.");
          navigate('/billing');
        }
      };
      checkLimit();
    }, []);

5.10 Add Route for Billing
    File: bulgarian-car-marketplace/src/App.tsx
    
    <Route path="/billing" element={<BillingPage />} />
```

### Acceptance Criteria:
```
[PASS] Stripe test account setup complete
[PASS] 9 products created in Stripe Dashboard
[PASS] /billing page loads with current plan
[PASS] User can click "Upgrade" → Stripe Checkout opens
[PASS] Payment succeeds → user.plan updated in Firestore
[PASS] Listing cap enforced (cannot add if at limit)
[PASS] User redirected to /billing when limit reached
[PASS] Invoices downloadable from billing page
[PASS] Webhook processes subscription updates
```

### Testing Commands:
```bash
npm start → /billing
# Click "Upgrade to Dealer Basic"
# Use Stripe test card: 4242 4242 4242 4242
# Complete payment
# Check Firestore: user.plan.tier should be 'dealer_basic'
# Try to add 51st car (should be blocked if on Basic plan)
```

---

## STEP 6: Analytics Dashboards - Private/Dealer/Company
**Duration:** 8-10 hours  
**Goal:** Type-specific analytics dashboards

### Tasks:
```
6.1 Create AnalyticsDashboard Router
    File: bulgarian-car-marketplace/src/features/analytics/AnalyticsDashboard.tsx
    (~200 lines)
    
    {profileType === 'private' && <PrivateDashboard />}
    {profileType === 'dealer' && <DealerDashboard />}
    {profileType === 'company' && <CompanyDashboard />}

6.2 Create PrivateDashboard
    File: bulgarian-car-marketplace/src/features/analytics/PrivateDashboard.tsx
    (~250 lines)
    
    Metrics:
    • Total views (all listings)
    • Total inquiries
    • Views per listing (bar chart)
    • Inquiries per listing
    • Response time
    • Date range selector (7d/30d/90d)

6.3 Create DealerDashboard
    File: bulgarian-car-marketplace/src/features/analytics/DealerDashboard.tsx
    (~280 lines)
    
    Metrics:
    • All private metrics PLUS:
    • Inventory value (sum of prices)
    • Sales funnel (views → inquiries → favorites)
    • Lead sources (direct/search/social)
    • Average days to sell
    • Top performing models
    • Export CSV button

6.4 Create CompanyDashboard
    File: bulgarian-car-marketplace/src/features/analytics/CompanyDashboard.tsx
    (~280 lines)
    
    Metrics:
    • All dealer metrics PLUS:
    • Fleet overview (total vehicles by location)
    • Team performance (per member)
    • Multi-location breakdown
    • ROI analysis (if ad spend tracked)
    • Custom date ranges
    • Export PDF with charts

6.5 Create AnalyticsService
    File: bulgarian-car-marketplace/src/features/analytics/AnalyticsService.ts
    (~280 lines)
    
    Functions:
    • getViewCounts(userId, dateRange)
    • getInquiryCounts(userId, dateRange)
    • getPerformanceByListing(userId)
    • getLeadSources(userId, dateRange)
    • getSalesFunnel(userId, dateRange)
    • exportData(userId, format) // CSV or PDF

6.6 Create Cloud Function: aggregateAnalytics
    File: functions/src/analytics/aggregate-analytics.ts
    
    Scheduled: Daily (Cloud Scheduler)
    Actions:
    • For each listing, aggregate daily stats
    • Store in listings/{id}/analytics/{date}
    • Avoid hot document problem

6.7 Add Shared Components
    Files: bulgarian-car-marketplace/src/features/analytics/components/
    
    • MetricCard.tsx (~80 lines) - Display single metric
    • SalesFunnelChart.tsx (~120 lines) - Funnel visualization
    • ExportButton.tsx (~100 lines) - CSV/PDF export

6.8 Add Route for Analytics
    File: bulgarian-car-marketplace/src/App.tsx
    
    <Route path="/analytics" element={<AnalyticsDashboard />} />
```

### Acceptance Criteria:
```
[PASS] /analytics loads without errors
[PASS] Private users see basic dashboard
[PASS] Dealer users see advanced dashboard
[PASS] Company users see enterprise dashboard
[PASS] Charts render correctly
[PASS] Date range selector works
[PASS] Export CSV generates file
[PASS] Export PDF generates file (dealer/company only)
[PASS] Data matches Firestore counts
```

### Testing Commands:
```bash
npm start → /analytics
# For private: see basic metrics
# For dealer: manually set profileType='dealer' in Firestore
  → should see sales funnel, top models
# For company: manually set profileType='company' in Firestore
  → should see team performance, fleet overview
# Test export buttons (CSV/PDF)
```

---

## STEP 7: Team Management & Advanced Messaging
**Duration:** 6-8 hours  
**Goal:** Company team features + enhanced messaging

### Tasks:
```
7.1 Create TeamManagement Page
    File: bulgarian-car-marketplace/src/features/team/TeamManagement.tsx
    (~250 lines)
    
    Features:
    • List of team members
    • Invite new member (email)
    • Assign roles (admin, manager, member)
    • Set permissions (can_edit_listings, can_view_analytics)
    • Remove member

7.2 Create InviteMember Component
    File: bulgarian-car-marketplace/src/features/team/InviteMember.tsx
    (~180 lines)
    
    Features:
    • Email input
    • Role selector
    • Permissions checklist
    • Send invitation button
    • Invitation sends email with signup link

7.3 Create RolePermissions Component
    File: bulgarian-car-marketplace/src/features/team/RolePermissions.tsx
    (~200 lines)
    
    Features:
    • Edit role for existing member
    • Toggle permissions
    • Save button

7.4 Create TeamService
    File: bulgarian-car-marketplace/src/features/team/TeamService.ts
    (~250 lines)
    
    Functions:
    • inviteTeamMember(companyId, email, role, permissions)
    • getTeamMembers(companyId)
    • updateMemberRole(companyId, memberId, newRole)
    • removeMember(companyId, memberId)
    • getMyCompanies(userId) // for team members

7.5 Update Messaging for Company Inbox
    File: bulgarian-car-marketplace/src/pages/MessagesPage.tsx
    
    For company accounts:
    • Shared inbox (all team members see conversations)
    • Assignment feature (assign conversation to specific member)
    • Internal notes (team-only comments)
    • Status tags (new/open/pending/closed)

7.6 Create QuickReplies Component (Dealer Feature)
    File: bulgarian-car-marketplace/src/features/messaging/QuickReplies.tsx
    (~150 lines)
    
    Features:
    • Predefined message templates
    • Insert template into message
    • Customizable templates (dealer can edit)

7.7 Add Route for Team Management
    File: bulgarian-car-marketplace/src/App.tsx
    
    <Route 
      path="/team" 
      element={<TeamManagement />} 
    />
    // Restrict to company accounts in route guard
```

### Acceptance Criteria:
```
[PASS] /team loads for company accounts only
[PASS] Team member list displays
[PASS] Invite member sends email
[PASS] Role assignment works
[PASS] Permissions update correctly
[PASS] Shared inbox visible to all team members (company)
[PASS] Conversation assignment works (company)
[PASS] Quick replies work (dealer)
[PASS] Internal notes work (company)
```

### Testing Commands:
```bash
# Setup: Set profileType='company' in Firestore
npm start → /team
# Invite a test member (use temp email service)
# Assign role "manager"
# Test shared inbox: /messages
# Assign conversation to member
# Test quick replies (set profileType='dealer')
```

---

## STEP 8: Final Integration - Security Rules, Indexes, Testing
**Duration:** 6-8 hours  
**Goal:** Production-ready deployment with all security measures

### Tasks:
```
8.1 Update Firestore Security Rules
    File: firestore.rules
    
    From plan Section 23.1 - Complete implementation:
    • Add rules for users collection (profileType, verification, plan)
    • Add rules for verificationDocuments collection
    • Add rules for subscriptions collection
    • Add rules for teamMembers collection
    • Add rules for listings (enforce plan caps)

8.2 Deploy Firestore Indexes
    File: firestore.indexes.json
    
    From plan Section 23.2 - All required indexes:
    • users: profileType + verification.status + createdAt
    • users: plan.tier + plan.status
    • listings: ownerId + status + createdAt
    • listings: ownerType + moderation.status + createdAt
    • reviews: targetUserId + status + createdAt
    • verificationDocuments: status + uploadedAt
    
    Deploy: firebase deploy --only firestore:indexes

8.3 Deploy Cloud Functions
    Commands:
    cd functions
    npm run build
    firebase deploy --only functions
    
    Functions to deploy:
    • onVerificationApproved
    • createStripeCheckoutSession
    • handleStripeWebhook
    • aggregateAnalytics (scheduled)

8.4 Setup Firebase Remote Config
    Console: Firebase → Remote Config
    
    Add parameters from plan Section 27:
    • enable_dealer_upgrade: true
    • enable_company_upgrade: true
    • enable_profile_led_progress: true
    • verification_sla_hours: 48
    • grace_period_days: 7
    • max_listing_images: 20
    • max_file_size_mb: 5

8.5 Add Translations for New Features
    File: bulgarian-car-marketplace/src/locales/translations.ts
    
    Add namespaces:
    • verification: { ... }
    • billing: { ... }
    • analytics: { ... }
    • team: { ... }

8.6 Update ProfilePage README
    File: bulgarian-car-marketplace/src/pages/ProfilePage/README.md
    
    Document:
    • New profile types
    • LED Progress system
    • Verification workflow
    • Billing integration
    • Analytics dashboards
    • Team management

8.7 Create Migration Script (for existing users)
    File: scripts/migrate-existing-profiles.js
    
    For all users:
    • Add profileType (default: 'private')
    • Add verification.level (default: 'none')
    • Add plan (default: { tier: 'free', status: 'active' })
    • Add trust.score (calculate from existing data)

8.8 E2E Testing Checklist
    Manual tests:
    [ ] Private user profile loads correctly
    [ ] LED progress ring displays and animates
    [ ] Upgrade to dealer flow works end-to-end
    [ ] Document upload and admin approval works
    [ ] Dealer profile displays with green theme
    [ ] Billing page loads and Stripe checkout works
    [ ] Subscription updates plan in Firestore
    [ ] Listing cap enforced correctly
    [ ] Analytics dashboard loads for each type
    [ ] Team management works (company only)
    [ ] Shared inbox works (company only)
    [ ] Quick replies work (dealer only)
    [ ] All security rules enforced
    [ ] Performance: page load <2s for all profile types

8.9 Performance Optimization
    • Code split profile type components (lazy load)
    • Optimize LED SVG rendering
    • Cache profile data (5-min TTL)
    • Lazy load analytics charts
    • Optimize Firestore queries (use indexes)

8.10 Documentation and Handoff
    Create/update:
    • PROFILE_SYSTEM_COMPLETE.md (architecture overview)
    • API_REFERENCE.md (services and functions)
    • ADMIN_GUIDE.md (verification approval process)
    • USER_GUIDE.md (upgrade flow, billing)
```

### Acceptance Criteria:
```
[PASS] All security rules deployed and enforced
[PASS] All indexes deployed (no missing index errors)
[PASS] All Cloud Functions deployed and working
[PASS] Remote Config parameters set
[PASS] All translations added (BG + EN)
[PASS] Migration script tested and run
[PASS] All E2E tests pass
[PASS] Performance targets met (<2s page load)
[PASS] No console errors on any page
[PASS] Linter passes (npm run lint)
```

### Testing Commands:
```bash
# Deploy security rules
firebase deploy --only firestore:rules

# Deploy indexes
firebase deploy --only firestore:indexes

# Deploy functions
cd functions && npm run build && firebase deploy --only functions

# Test locally
npm start

# Run full E2E test suite
npm run test:e2e

# Check performance
npm run build
# Lighthouse audit: target >90 score

# Final check
firebase deploy  # Deploy everything to production
```

---

## IMPLEMENTATION ORDER SUMMARY

```
STEP 1: Foundation (3-4h)
  → ProfileTypeContext + data model

STEP 2: LED Avatar (4-5h)
  → Visual progress system

STEP 3: Profile Types (6-8h)
  → Private/Dealer/Company components

STEP 4: Verification (8-10h)
  → Document upload + admin approval

STEP 5: Billing (8-10h)
  → Stripe integration + subscriptions

STEP 6: Analytics (8-10h)
  → Type-specific dashboards

STEP 7: Team & Messaging (6-8h)
  → Company features + enhanced chat

STEP 8: Integration (6-8h)
  → Security + testing + deployment

TOTAL ESTIMATED TIME: 50-63 hours
RECOMMENDED SCHEDULE: 1-2 weeks (full-time) or 3-4 weeks (part-time)
```

---

## RISK MITIGATION

```
COMMON ISSUES & SOLUTIONS:

Issue 1: Existing users have no profileType
Solution: Migration script sets default 'private'

Issue 2: Breaking changes to BulgarianUser interface
Solution: Keep accountType for backward compatibility

Issue 3: Stripe webhook failures
Solution: Retry logic + manual reconciliation tool

Issue 4: Performance degradation with large datasets
Solution: Pagination + caching + daily aggregation

Issue 5: Security rule too restrictive
Solution: Test rules in Firebase Emulator before deploy

Issue 6: Team feature confusion (who has access?)
Solution: Clear UI indicators + permissions matrix

Issue 7: LED progress calculation incorrect
Solution: Unit tests for each profile type + edge cases
```

---

## POST-IMPLEMENTATION TASKS

```
AFTER STEP 8 COMPLETION:

1. Legal Review (external)
   • Engage Bulgarian legal counsel
   • Validate 5-car threshold
   • Confirm VAT thresholds
   • Review Terms of Service
   • Review dealer/company agreements

2. EIK/BULSTAT API Integration (external)
   • Obtain API key from Trade Registry Agency
   • Integrate EIK verification
   • Add fallback for API outages

3. Stripe Production Setup
   • Switch from test to live API keys
   • Create production products
   • Setup webhooks for live environment
   • Test live payments (small amount)

4. Professional Translation
   • Native Bulgarian speaker review
   • Legal text translation (BG + EN)
   • UI text refinement

5. User Onboarding
   • Create help videos (profile types, upgrade flow)
   • Write help center articles
   • Design email templates (verification, billing)

6. Marketing Launch
   • Announce new profile types
   • Promote dealer/company features
   • Offer launch discount (first month free for dealers)
```

---

## SUCCESS METRICS

```
KPIs TO TRACK:

User Adoption:
  • % of users with completed profiles (target: >70%)
  • Private → Dealer conversion rate (target: 5%)
  • Dealer → Company conversion rate (target: 2%)

Revenue:
  • Monthly Recurring Revenue (MRR) - target: €50K in 6 months
  • Average Revenue Per Dealer - target: €75/month
  • Churn rate - target: <10% monthly

Verification:
  • Average approval time - target: <24 hours
  • Approval rate - track rejected % (improve documentation)
  • EIK verification success rate - target: >95%

Engagement:
  • Dashboard usage - target: >70% of dealers check weekly
  • Analytics export usage - track CSV/PDF downloads
  • Team features usage (company) - track active team members

Platform Health:
  • Page load times - target: <2s for 90% of users
  • Error rate - target: <1%
  • Uptime - target: 99.5% monthly
```

---

**Ready to start implementation?**  
**Recommended:** Begin with Step 1 today, complete Steps 1-3 this week, Steps 4-6 next week, Steps 7-8 final week.

**Last Updated:** October 18, 2025  
**Version:** 1.0  
**Status:** READY FOR IMPLEMENTATION

