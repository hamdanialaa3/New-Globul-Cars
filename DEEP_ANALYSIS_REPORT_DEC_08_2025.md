# Deep Analysis Report: Profile, Subscription & Car Addition Systems
**Date:** December 8, 2025
**Status:** ✅ Fully Unified & Optimized

## 1. Executive Summary
The system has been successfully refactored to a unified **3-Tier Architecture** (`free`, `dealer`, `company`). All legacy tiers (`premium`, `dealer_basic`, `dealer_pro`, `company_starter`, etc.) have been removed from the core logic. Transactional integrity has been implemented for car creation to prevent limit bypass.

## 2. System Analysis

### A. Profile System (`ProfileTypeContext`, `ProfileService`, `PermissionsService`)
*   **Status:** ✅ **Clean**
*   **Changes:**
    *   `ProfileService.ts`: Removed legacy fallback logic (`dealer_basic`, `company_starter`). Now strictly enforces `dealer` and `company` tiers.
    *   `PermissionsService.ts`: Completely rewritten to support only the 3 canonical tiers.
    *   `ProfileTypeContext.tsx`: Simplified permission logic.
*   **Limits Enforced:**
    *   **Free:** 3 Listings
    *   **Dealer:** 10 Listings
    *   **Company:** Unlimited

### B. Subscription System (`stripeWebhook`, `cancelSubscription`, `SubscriptionService`)
*   **Status:** ✅ **Secure & Synced**
*   **Changes:**
    *   `stripeWebhook.ts`: Now updates `planTier` at the **root level** of the user document. This is critical for Firestore Security Rules.
    *   `cancelSubscription.ts`: Automatically reverts `planTier` to `'free'` upon cancellation.
    *   `config.ts` (Backend): Updated limits to match frontend (Free: 3, Dealer: 10).
    *   `SubscriptionService.ts` (Frontend): Updated fallback plans to show only the 3 valid options.

### C. Car Addition System (`sellWorkflowService`)
*   **Status:** ✅ **Transactional**
*   **Changes:**
    *   **Atomic Transactions:** `createCarListing` now uses `runTransaction`.
    *   **Race Condition Protection:** It reads `activeListings`, checks the limit, creates the car, and increments the counter **atomically**.
    *   **Limit Logic:** Hardcoded to the unified 3-tier limits inside the transaction for maximum security.

## 3. Remaining Tasks / Recommendations
1.  **UI Cleanup:** The `BillingPage.tsx` seems generic. Ensure `SubscriptionPlans` component (child component) is rendering the correct plans.
2.  **Data Migration:** If there are existing users with old tiers (`dealer_basic`, etc.), a migration script is needed to update them to `dealer`.
3.  **Stripe Dashboard:** Ensure the Stripe Price IDs in `functions/src/subscriptions/config.ts` match the actual prices in your Stripe Dashboard.

## 4. Conclusion
The code is now consistent, secure, and free of legacy logic duplication. The "Merged Plan" has been fully executed.
