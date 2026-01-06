# Revenue Leakage Forensic Audit Report
# تقرير تدقيق تسرب الإيرادات

**Audit Date:** January 6, 2026  
**Dimension:** Revenue Leakage  
**Auditor:** GitHub Copilot  

---

## Executive Summary

This audit investigated two critical revenue protection mechanisms:
1. **Abandoned Cart/Flow Detection** - Tracking and recovering incomplete sell workflows
2. **Listing Expiration/Archival** - Managing stale and sold car listings

### Overall Assessment: 🟡 PARTIAL COVERAGE

| Category | Status | Revenue Impact |
|----------|--------|----------------|
| Abandoned Flow Tracking | ✅ EXISTS | High |
| Draft Recovery UI | ✅ EXISTS | High |
| Email Reminders for Drafts | ❌ MISSING | Medium |
| Sold Car Archival | ✅ EXISTS | Low |
| Active Listing Expiration (60+ days) | ❌ MISSING | High |
| Stale Listing Notifications | ❌ MISSING | Medium |

---

## 1. ABANDONED CART/FLOW DETECTION

### ✅ EXISTS: Workflow Analytics Service
**File:** [src/services/workflow-analytics-service.ts](src/services/workflow-analytics-service.ts)

**Capabilities:**
- Tracks workflow step entries (`entered`)
- Tracks workflow step exits (`exited`)
- Tracks workflow completions (`completed`)
- Tracks step abandonments (`abandoned`)
- Calculates funnel statistics and dropoff rates

**Key Methods:**
```typescript
// Lines 146-151
static async logStepAbandoned(
  step: number,
  stepName: string,
  userId?: string
): Promise<void> {
  await this.logEvent(step, stepName, 'abandoned', { userId });
}
```

**Metrics Collected:**
- `totalSessions` - Total sell workflow sessions started
- `completedSessions` - Sessions that finished all steps
- `abandonedSessions` - Sessions marked as abandoned
- `conversionRate` - Completion rate percentage
- `dropOffRate` per step - Where users abandon

---

### ✅ EXISTS: Google Analytics Abandonment Tracking
**File:** [src/utils/google-analytics.ts#L210-L216](src/utils/google-analytics.ts#L210-L216)

```typescript
export const trackListingAbandonment = (step: string, reason?: string) => {
  trackEvent('Sell Workflow', 'Abandon Listing', step);
  
  ReactGA.event('abandon_cart', {
    step: step,
    reason: reason
  });
};
```

**Status:** Function exists but **NOT ACTIVELY USED** in SellVehicleModal close handler!

---

### ✅ EXISTS: Draft Recovery Prompt (UI Recovery)
**File:** [src/pages/01_main-pages/home/HomePage/DraftRecoveryPrompt.tsx](src/pages/01_main-pages/home/HomePage/DraftRecoveryPrompt.tsx)

**Purpose:** Revenue fix - Recover abandoned drafts to improve conversion rate

**Capabilities:**
- Shows toast notification for incomplete drafts
- Displays draft completion percentage
- Links to resume workflow with draft data
- 15-25% estimated conversion improvement

**Key Logic (Lines 262-275):**
```typescript
// Find the most recent incomplete draft (not 100% complete)
const incompleteDraft = drafts.find((d: Draft) => d.completionPercentage < 100);

if (mounted && incompleteDraft) {
  logger.info('Found incomplete draft', { 
    draftId: incompleteDraft.id, 
    progress: incompleteDraft.completionPercentage 
  });
```

---

### ✅ EXISTS: useWorkflowStep Hook
**File:** [src/hooks/useWorkflowStep.ts](src/hooks/useWorkflowStep.ts)

Provides `markAbandoned()` function to components:
```typescript
// Lines 56-62
const markAbandoned = async () => {
  await WorkflowAnalyticsService.logStepAbandoned(
    step,
    stepName,
    currentUser?.uid
  );
};
```

---

### ❌ MISSING: Modal Abandonment Tracking
**File:** [src/components/SellWorkflow/SellVehicleModal.tsx](src/components/SellWorkflow/SellVehicleModal.tsx)

**Critical Gap:** The `handleClose()` function does NOT:
1. Call `trackListingAbandonment()`
2. Call `markAbandoned()` from analytics service
3. Log which step the user abandoned on

**Current Code (Lines 212-219):**
```typescript
const handleClose = () => {
  setIsClosing(true);
  setTimeout(() => {
    setIsClosing(false);
    onClose();
  }, 300);
};
```

**SHOULD BE:**
```typescript
const handleClose = () => {
  // Track abandonment with current step
  trackListingAbandonment(`step_${currentStep}`, 'user_closed_modal');
  WorkflowAnalyticsService.logStepAbandoned(currentStep, stepName, userId);
  
  setIsClosing(true);
  setTimeout(() => {
    setIsClosing(false);
    onClose();
  }, 300);
};
```

---

### ❌ MISSING: Email Notifications for Abandoned Drafts
**Finding:** No scheduled function exists to email users about incomplete drafts.

**Evidence:**
- No `notify-abandoned-drafts.ts` in `functions/src/scheduled/`
- No email template for "Continue your listing" reminders
- [last_fix_plan.md#L128](last_fix_plan.md#L128): "Returns next day → NO reminder about unfinished draft"

**Expected Revenue Recovery:** 5-10% of abandoned flows could convert with email reminders.

---

## 2. LISTING EXPIRATION/ARCHIVAL

### ✅ EXISTS: Archive Sold Cars (Scheduled)
**File:** [functions/src/scheduled/archive-sold-cars.ts](functions/src/scheduled/archive-sold-cars.ts)

**Schedule:** Daily at 3 AM (Bulgaria time)
**Threshold:** 30 days after marked as sold
**Collections:** All 6 vehicle collections (passenger_cars, suvs, vans, motorcycles, trucks, buses)

**Export in index.ts (Line 115):**
```typescript
export const archiveSoldCars = archiveJobs.archiveSoldCars;
export const manualArchiveSoldCars = archiveJobs.manualArchiveSoldCars;
```

**What it does:**
1. Finds cars with `status: 'sold'` older than 30 days
2. Copies to `archived_{collection}` collection
3. Sets `isActive: false` on original
4. Records job execution to `system_jobs`

---

### ✅ EXISTS: Cleanup Expired Drafts (Scheduled)
**File:** [functions/src/scheduled/archive-sold-cars.ts#L244-299](functions/src/scheduled/archive-sold-cars.ts#L244-L299)

**Schedule:** Weekly on Sunday at 4 AM
**Threshold:** Drafts older than 30 days

**Export in index.ts (Line 117):**
```typescript
export const cleanupExpiredDrafts = archiveJobs.cleanupExpiredDrafts;
```

---

### ✅ EXISTS: Draft Expiration Field
**File:** [src/services/drafts-service.ts#L55-61](src/services/drafts-service.ts#L55-L61)

```typescript
expiresAt: Timestamp.fromDate(
  new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days
)
```

**Client-side cleanup method exists (Line 215):**
```typescript
static async cleanupExpiredDrafts(): Promise<number>
```

---

### ✅ EXISTS: Car Listing expiresAt Field
**File:** [src/types/CarListing.ts#L184](src/types/CarListing.ts#L184)

```typescript
expiresAt?: Date;
```

**Also in sell-workflow-operations.ts (Line 190):**
```typescript
expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days
```

---

### ❌ MISSING: Archive Stale ACTIVE Listings
**Critical Gap:** No function exists to handle listings that are:
- Status: `active` for 60+ days
- Never updated
- Likely stale/abandoned by seller

**Evidence:**
- [last_update_plan.md#L531](last_update_plan.md#L531): "Finding: No archive function for old 'active' listings"
- [last_update_plan.md#L548](last_update_plan.md#L548): "functions/src/scheduled/archive-stale-listings.ts (DOES NOT EXIST)"

**Proposed File:** `functions/src/scheduled/archive-stale-listings.ts`

**What it SHOULD do:**
1. Find active listings older than 60 days
2. Send reminder notification to seller (7 days before)
3. Auto-archive or set `status: 'expired'` after 60 days
4. Allow one-click reactivation

---

### ❌ MISSING: Listing Expiration Notifications
**Finding:** No notification sent when:
- Listing is about to expire (3 days warning)
- Listing has expired
- Listing has low views (suggest refresh)

**Test data reference in [src/services/notifications/__tests__/unified-notification.service.test.ts#L321](src/services/notifications/__tests__/unified-notification.service.test.ts#L321):**
```typescript
message: 'Your listing will expire in 3 days',
```

**Note:** Test exists but implementation is missing!

---

## 3. SUMMARY OF GAPS

### HIGH PRIORITY (Revenue Impact > 5%)

| Gap | File Location | Recommended Fix |
|-----|---------------|-----------------|
| Modal close doesn't track abandonment | SellVehicleModal.tsx | Add `trackListingAbandonment()` to `handleClose()` |
| No email reminders for drafts | MISSING | Create `functions/src/scheduled/notify-abandoned-drafts.ts` |
| No stale listing archival | MISSING | Create `functions/src/scheduled/archive-stale-listings.ts` |

### MEDIUM PRIORITY (Revenue Impact 1-5%)

| Gap | File Location | Recommended Fix |
|-----|---------------|-----------------|
| No expiration warning notifications | MISSING | Create `listing-expiration-notifications.ts` |
| `expiresAt` field not enforced | CarListing.ts | Add scheduled function to check expiresAt |
| Funnel stats not visible in admin | workflow-analytics-service.ts | Create admin dashboard for dropoff analysis |

### LOW PRIORITY (Operational)

| Gap | File Location | Recommended Fix |
|-----|---------------|-----------------|
| No sitemap scheduled regeneration | MISSING | Create `regenerate-sitemap.ts` cron |

---

## 4. RECOMMENDED IMPLEMENTATION ORDER

1. **IMMEDIATE (Today):**
   - Fix `SellVehicleModal.tsx` close handler to track abandonments
   - This is a 5-line change with immediate analytics value

2. **THIS WEEK:**
   - Create `archive-stale-listings.ts` scheduled function
   - Create `notify-abandoned-drafts.ts` email reminder

3. **NEXT SPRINT:**
   - Add admin dashboard for funnel analytics
   - Implement listing expiration warning system

---

## 5. FILES AUDITED

| File | Lines | Purpose |
|------|-------|---------|
| workflow-analytics-service.ts | 301 | ✅ Analytics tracking |
| google-analytics.ts | 347 | ✅ GA4 events (unused abandonment) |
| DraftRecoveryPrompt.tsx | 408 | ✅ UI recovery prompt |
| useWorkflowStep.ts | 80 | ✅ Step tracking hook |
| SellVehicleModal.tsx | 272 | ❌ Missing abandonment call |
| archive-sold-cars.ts | 299 | ✅ Sold car archival |
| drafts-service.ts | 260 | ✅ Draft management |
| notifications.ts | 242 | ✅ FCM notifications |
| CarListing.ts | 487 | ✅ Has expiresAt field |

---

## 6. REVENUE RECOVERY ESTIMATE

| Fix | Estimated Recovery |
|-----|-------------------|
| Track modal abandonment | Better funnel visibility (no direct $) |
| Email draft reminders | 5-10% of abandoned = ~€X/month |
| Archive stale listings | Cleaner search results = better UX |
| Expiration notifications | 3-5% reactivation rate |

---

**Report Generated:** January 6, 2026  
**Next Review:** January 13, 2026
