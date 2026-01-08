# Subscription & Payment System Documentation
> **Generated Date:** January 7, 2026
> **Scope:** Full System Analysis & Audit

This document serves as the single source of truth for the subscription and payment system in "New Globul Cars". It combines architectural analysis with a critical audit of the current code reality.

---

## 1. System Architecture

The project uses a **Hybrid Integration Model**:
1.  **Stripe**: Payment processor and subscription engine.
2.  **Firebase Extension**: `firestore-stripe-payments` synchronizes products/customers between Stripe and Firestore.
3.  **Custom Webhooks**: `stripe-webhooks.ts` manages business logic (e.g., downgrades, listing deactivation).
4.  **Firestore**: Stores user permissions and plan status.

### Core Data Flow
1.  **Checkout**: User selects plan -> `SubscriptionService` creates session -> Extension calls Stripe -> User pays -> Webhook updates User Doc.
2.  **Access Control**: Frontend guards (`RequireCompanyGuard`) checks `user.planTier` in Firestore.
3.  **Enforcement**: `SellWorkflowService` checks `listing-limits.ts` before allowing new car listings.

---

## 2. Subscription Tiers (Intended vs. Reality)

There is a **CRITICAL DISCREPANCY** between the advertised limits and the enforced limits.

| Tier | Advertised Limit (UI) | Enforced Limit (Code) | Cost | Features |
| :--- | :--- | :--- | :--- | :--- |
| **Private (Free)** | 3 Listings | **3 Listings** | €0 | Basic features |
| **Dealer** | **30 Listings** | 🔴 **10 Listings** | €20/mo | Priority support, Analytics |
| **Company** | Unlimited | **Unlimited** | €100/mo | API, Dedicated Manager |

**🚨 Critical Issue**: The code at `src/utils/listing-limits.ts` hardcodes the Dealer limit to `10`. Users paying for the "30 listings" Dealer plan will be **blocked** after adding their 10th car.

---

## 3. Complete File Inventory (12+ Files)

### Backend (Cloud Functions)
*   **`functions/src/stripe-webhooks.ts`** (592 lines): 8 Stripe events, auto-downgrade, `deactivateExcessListings()`

### Core Enforcement ⚠️
*   **`src/utils/listing-limits.ts`** (113L): `PLAN_LIMITS = {free: 3, dealer: 10, company: -1}` ⚠️ BUG
*   **`src/services/profile/PermissionsService.ts`** (323L): Returns `maxListings: 10` for dealer ⚠️
*   **`src/config/billing-config.ts`** (100L): Advertises `listings: 30` for dealer ⚠️

### Services
*   **`src/services/billing/subscription-service.ts`** (200L): Checkout flow
*   **`src/features/billing/BillingService.ts`** (196L): Plan management
*   **`src/services/subscription/UsageTrackingService.ts`** (395L): Quota tracking
*   **`src/services/UnifiedCarService.ts`**: Enforces limits on create

### Types & Config
*   **`src/features/billing/types.ts`**: `PlanTier`, `Subscription`, `Invoice`
*   **`src/types/user/bulgarian-user.types.ts`** (311L): `ProfilePermissions` (20+ fields)
*   **`src/config/stripe-extension.config.ts`** (106L): Stripe Price IDs

### UI
*   **`src/features/billing/SubscriptionPlans.tsx`** (329L): Pricing display

---

## 4. Critical Workflows

### A. The "Sell Car" Block
When a user tries to publish a car:
1.  `SellWorkflowService.createCarListing` is triggered.
2.  It calls `canAddListing(userId)` from `listing-limits.ts`.
3.  It counts active listings in `users/{uid}/stats.activeListings`.
4.  If `activeCount >= limit` (currently 10 for Dealers), it throws an error: `"Listing limit reached"`.

### B. The "Downgrade Deactivation"
When a user cancels or their payment fails 3 times:
1.  Webhook receives `customer.subscription.deleted`.
2.  It calculates the new limit (e.g., 3 for Private).
3.  It queries **all active cars** for that user.
4.  If `count > 3`, it sorts them by date.
5.  It **deactivates the newest cars** until only 3 remain.
6.  The user is notified.

---

## 5. Stripe Webhooks (8 Events)

| Event | Action |
|-------|--------|
| `subscription.created` | Update `planTier` |
| `subscription.updated` | Handle tier change |
| `subscription.deleted` | Downgrade + deactivate excess |
| `subscription.paused` | Pause access |
| `invoice.payment_succeeded` | Confirm payment |
| `invoice.payment_failed` | Auto-downgrade after 3x |
| `charge.refunded` | Log refund |
| `charge.dispute.created` | Freeze account |

---

## 6. 🚨 BUG FIX (Dealer Listing Limits)

### Problem
Dealers pay for **30 listings** but blocked at **10**.

### Fix Code

**File 1: `src/utils/listing-limits.ts` (Line 18)**
```typescript
const PLAN_LIMITS: Record<PlanTier, number> = {
  free: 3,
  dealer: 30,    // ✅ Changed from 10
  company: -1
};
```

**File 2: `src/services/profile/PermissionsService.ts` (Line 61)**
```typescript
if (planTier === 'dealer') return {
  maxListings: 30,        // ✅ Changed from 10
  maxMonthlyListings: 30,
  // ...
};
```

---

## 7. Permissions (20+ per Tier)

```typescript
ProfilePermissions {
  maxListings: number;           // free:3, dealer:30, company:-1
  canEditLockedFields: boolean;  // dealer: quota-based
  canBulkUpload: boolean;        // dealer+
  hasAnalytics: boolean;         // dealer+
  maxTeamMembers: number;        // dealer:2, company:-1
  apiRateLimitPerHour: number;   // company:10000
}
```

---

## 8. Actions

1. ✅ **Apply fixes above**
2. 📋 **Unify config sources**
3. 🔧 **Move Product IDs to Firestore**
4. ✉️ **Notify affected dealers**

---

**Updated:** Jan 7, 2026 | **Status:** Bug Fix Documented
