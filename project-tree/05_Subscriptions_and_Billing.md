# 💳 Subscriptions & Billing System Documentation
## نظام الاشتراكات والفوترة - توثيق شامل

> **Last Updated:** January 23, 2026  
> **Version:** 0.4.0  
> **Status:** ✅ Production Ready

---

## 📋 Table of Contents

1. [Overview](#overview)
2. [Subscription Plans](#subscription-plans)
3. [Stripe Integration](#stripe-integration)
4. [Billing System](#billing-system)
5. [Usage Tracking](#usage-tracking)
6. [Payment Methods](#payment-methods)
7. [Technical Implementation](#technical-implementation)

---

## 🎯 Overview

The Subscriptions & Billing System manages user subscriptions, payments, and plan-based feature access. It integrates with Stripe for payment processing and supports three subscription tiers (Free, Dealer, Company) with different features and limits.

### Key Features

- **Three Subscription Tiers** - Free, Dealer, Company
- **Stripe Integration** - Secure payment processing
- **Usage Tracking** - Monitor listing usage
- **Grace Period** - Extended access after payment failure
- **Churn Prevention** - Automated retention campaigns
- **Manual Payments** - Bank transfer option
- **Invoice Management** - Automatic invoice generation

---

## 📊 Subscription Plans

### Plan Comparison

| Feature | Free | Dealer | Company |
|---------|------|--------|---------|
| **Price (Monthly)** | €0 | €20.11 | €100.11 |
| **Price (Annual)** | €0 | €193 (20% off) | €961 (20% off) |
| **Listings/Month** | 3 | 30 | Unlimited |
| **Team Members** | 0 | 3 | 10 |
| **Analytics** | — | Basic | Advanced |
| **Bulk Upload** | — | ✓ | ✓ |
| **Featured Badge** | — | ✓ | ✓ |
| **API Access** | — | — | ✓ |
| **Priority Support** | — | ✓ | ✓ |
| **Marketing Campaigns** | — | 5/month | Unlimited |

### Plan Configuration

**Location:** `src/config/subscription-plans.ts`

**Single Source of Truth:** All plan data comes from this file

**Structure:**
```typescript
export const SUBSCRIPTION_PLANS = {
  free: {
    tier: 'free',
    name: { en: 'Free', bg: 'Безплатен' },
    price: { monthly: 0, annual: 0 },
    stripePriceIds: { monthly: null, annual: null },
    features: {
      maxListings: 3,
      maxTeamMembers: 0,
      hasAnalytics: false,
      hasBulkUpload: false,
      hasFeaturedBadge: false,
      hasAPIAccess: false,
      hasPrioritySupport: false,
      maxCampaigns: 0
    },
    isActive: true
  },
  dealer: {
    tier: 'dealer',
    name: { en: 'Dealer', bg: 'Професионален Търговец' },
    price: { monthly: 20.11, annual: 193 },
    stripePriceIds: {
      monthly: 'price_xxxxx', // Stripe Price ID
      annual: 'price_yyyyy'
    },
    features: {
      maxListings: 30,
      maxTeamMembers: 3,
      hasAnalytics: true,
      hasBulkUpload: true,
      hasFeaturedBadge: true,
      hasAPIAccess: false,
      hasPrioritySupport: true,
      maxCampaigns: 5
    },
    isActive: true
  },
  company: {
    tier: 'company',
    name: { en: 'Company', bg: 'Корпоративен' },
    price: { monthly: 100.11, annual: 961 },
    stripePriceIds: {
      monthly: 'price_zzzzz',
      annual: 'price_wwwww'
    },
    features: {
      maxListings: Infinity,
      maxTeamMembers: 10,
      hasAnalytics: true,
      hasBulkUpload: true,
      hasFeaturedBadge: true,
      hasAPIAccess: true,
      hasPrioritySupport: true,
      maxCampaigns: Infinity
    },
    isActive: true
  }
};
```

---

## 💳 Stripe Integration

### Architecture

**Firebase Stripe Extension:**
- Extension ID: `firestore-stripe-payments`
- Collection: `customers/{uid}/checkout_sessions`
- Automatic webhook handling

### Checkout Flow

**Service:** `SubscriptionService`

**Location:** `src/services/billing/subscription-service.ts`

**Process:**
```typescript
1. User selects plan and billing interval (monthly/annual)
2. Client calls createCheckoutSession()
3. Write to Firestore: customers/{uid}/checkout_sessions
4. Firebase Extension creates Stripe Checkout Session
5. Extension writes session URL back to document
6. Client redirects to Stripe Checkout
7. User completes payment
8. Stripe webhook updates subscription status
9. User redirected to success page
```

**Implementation:**
```typescript
class SubscriptionService {
  async createCheckoutSession(params: {
    userId: string;
    planId: 'free' | 'dealer' | 'company';
    interval: 'monthly' | 'annual';
    successUrl: string;
    cancelUrl: string;
  }): Promise<{ url: string; sessionId: string }> {
    const plan = SUBSCRIPTION_PLANS[params.planId];
    const priceId = plan.stripePriceIds[params.interval];
    
    // Write to Firestore (Extension processes it)
    const sessionsRef = collection(db, 'customers', params.userId, 'checkout_sessions');
    const docRef = await addDoc(sessionsRef, {
      price: priceId,
      success_url: params.successUrl,
      cancel_url: params.cancelUrl,
      mode: 'subscription',
      metadata: {
        firebase_uid: params.userId,
        plan_tier: plan.tier,
        interval: params.interval
      }
    });
    
    // Wait for Extension to inject URL
    return new Promise((resolve, reject) => {
      const unsubscribe = onSnapshot(docRef, (snap) => {
        const data = snap.data();
        if (data?.error) {
          unsubscribe();
          reject(new Error(data.error.message));
        }
        if (data?.url) {
          unsubscribe();
          resolve({ url: data.url, sessionId: data.sessionId });
        }
      });
    });
  }
}
```

### Customer Portal

**Purpose:** Allow users to manage subscriptions, update payment methods, view invoices

**Implementation:**
```typescript
async createPortalLink(userId: string, returnUrl: string): Promise<string> {
  // Call Cloud Function
  const createPortalLink = httpsCallable(functions, 'ext-firestore-stripe-payments-createPortalLink');
  const { data } = await createPortalLink({ returnUrl });
  return data.url;
}
```

---

## 💰 Billing System

### Billing Service

**Location:** `src/features/billing/BillingService.ts`

**Methods:**
```typescript
class BillingService {
  // Get available plans
  getAvailablePlans(): Plan[]
  
  // Get user's current subscription
  async getCurrentSubscription(userId: string): Promise<Subscription | null>
  
  // Get user's invoices
  async getInvoices(userId: string): Promise<Invoice[]>
  
  // Cancel subscription
  async cancelSubscription(userId: string): Promise<void>
  
  // Upgrade/Downgrade subscription
  async changePlan(userId: string, newPlanId: string): Promise<void>
}
```

### Invoice Management

**Features:**
- Automatic invoice generation
- PDF download
- Email delivery
- Payment history
- Tax information

**Invoice Structure:**
```typescript
interface Invoice {
  id: string;
  userId: string;
  subscriptionId: string;
  amount: number;
  currency: 'EUR';
  status: 'paid' | 'pending' | 'failed';
  dueDate: Date;
  paidDate?: Date;
  items: InvoiceItem[];
  tax?: number;
  total: number;
  pdfUrl?: string;
}
```

---

## 📈 Usage Tracking

### Usage Tracking Service

**Location:** `src/services/subscription/UsageTrackingService.ts`

**Purpose:** Track subscription usage (listings, team members, etc.)

**Methods:**
```typescript
class UsageTrackingService {
  // Track listing creation
  async trackListingCreation(userId: string): Promise<void>
  
  // Track listing deletion
  async trackListingDeletion(userId: string): Promise<void>
  
  // Get current usage
  async getCurrentUsage(userId: string): Promise<UsageStats>
  
  // Check if limit reached
  async isLimitReached(userId: string, feature: string): Promise<boolean>
  
  // Get remaining quota
  async getRemainingQuota(userId: string, feature: string): Promise<number>
}
```

### Usage Statistics

```typescript
interface UsageStats {
  listings: {
    used: number;
    limit: number;
    remaining: number;
  };
  teamMembers: {
    used: number;
    limit: number;
    remaining: number;
  };
  campaigns: {
    used: number;
    limit: number;
    remaining: number;
  };
}
```

---

## 🏦 Payment Methods

### Stripe Payment (Automatic)

**Method:** Credit/Debit Card via Stripe

**Features:**
- Secure payment processing
- Automatic recurring billing
- Multiple card support
- 3D Secure authentication

### Manual Bank Transfer

**Service:** `ManualPaymentService`

**Location:** `src/services/payment/manual-payment-service.ts`

**Process:**
```typescript
1. User selects manual payment
2. System generates reference number
3. User receives payment instructions
4. User transfers money to bank account
5. User uploads receipt
6. Admin verifies payment
7. Subscription activated
```

**Features:**
- Reference number generation
- Receipt upload
- Admin verification
- Automatic expiration (7 days)
- Email notifications

**Methods:**
```typescript
class ManualPaymentService {
  // Create transaction
  async createTransaction(userId: string, planId: string, amount: number): Promise<Transaction>
  
  // Upload receipt
  async uploadReceipt(transactionId: string, receiptFile: File): Promise<void>
  
  // Verify payment (Admin)
  async verifyPayment(transactionId: string, adminId: string): Promise<void>
  
  // Reject payment (Admin)
  async rejectPayment(transactionId: string, adminId: string, reason: string): Promise<void>
  
  // Get transaction
  async getTransaction(transactionId: string): Promise<Transaction>
}
```

---

## 🔄 Grace Period System

### Grace Period Banner

**Component:** `GracePeriodBanner.tsx`

**Location:** `src/components/billing/GracePeriodBanner.tsx`

**Purpose:** Notify users of payment failures and provide grace period

**Features:**
- Payment failure notification
- Grace period countdown
- Update payment method button
- Cancel subscription option

**Grace Period Duration:** 7 days

**Implementation:**
```typescript
// Check if user is in grace period
const isInGracePeriod = subscription.status === 'past_due' && 
  subscription.gracePeriodEndsAt > new Date();

if (isInGracePeriod) {
  // Show grace period banner
  <GracePeriodBanner
    daysRemaining={calculateDaysRemaining()}
    onUpdatePayment={handleUpdatePayment}
    onCancel={handleCancel}
  />
}
```

---

## 🚫 Churn Prevention

### Churn Prevention Service

**Location:** `src/services/billing/churn-prevention.service.ts`

**Purpose:** Automated campaigns to prevent subscription cancellations

**Strategies:**
1. **Payment Failure Emails** - Remind users to update payment method
2. **Usage Reminders** - Notify users of unused features
3. **Discount Offers** - Special discounts for at-risk users
4. **Feature Highlights** - Show value of current plan
5. **Retention Surveys** - Understand cancellation reasons

**Methods:**
```typescript
class ChurnPreventionService {
  // Identify at-risk users
  async identifyAtRiskUsers(): Promise<string[]>
  
  // Send retention email
  async sendRetentionEmail(userId: string, strategy: string): Promise<void>
  
  // Offer discount
  async offerDiscount(userId: string, discountPercent: number): Promise<void>
  
  // Track cancellation reason
  async trackCancellationReason(userId: string, reason: string): Promise<void>
}
```

---

## 🔧 Technical Implementation

### Subscription Status

```typescript
type SubscriptionStatus = 
  | 'active'           // Active and paid
  | 'trialing'         // In trial period
  | 'past_due'         // Payment failed, in grace period
  | 'canceled'         // Canceled by user
  | 'unpaid'           // Payment failed, no grace period
  | 'incomplete'       // Payment incomplete
  | 'incomplete_expired'; // Payment incomplete and expired
```

### Subscription Data Model

```typescript
interface Subscription {
  id: string;
  userId: string;
  planId: 'free' | 'dealer' | 'company';
  status: SubscriptionStatus;
  currentPeriodStart: Date;
  currentPeriodEnd: Date;
  cancelAtPeriodEnd: boolean;
  canceledAt?: Date;
  stripeSubscriptionId?: string;
  stripeCustomerId?: string;
  gracePeriodEndsAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}
```

### Firestore Structure

```
users/{uid}/
  subscription: {
    planId: 'dealer',
    status: 'active',
    currentPeriodEnd: Timestamp,
    ...
  }

customers/{uid}/
  checkout_sessions/{sessionId}
  subscriptions/{subscriptionId}
  invoices/{invoiceId}
```

---

## 📱 UI Components

### Subscription Manager

**Component:** `SubscriptionManager.tsx`

**Location:** `src/components/subscription/SubscriptionManager.tsx`

**Features:**
- Plan comparison table
- Current plan display
- Upgrade/Downgrade buttons
- Feature highlights
- Pricing display

### Billing Page

**Component:** `BillingPage.tsx`

**Location:** `src/pages/08_payment-billing/BillingPage.tsx`

**Sections:**
1. Current Subscription
2. Plan Comparison
3. Payment Method
4. Billing History
5. Invoices

---

## 🔍 Best Practices

### Subscription Management

1. **Always check limits** before allowing actions
2. **Track usage** in real-time
3. **Show usage warnings** when approaching limits
4. **Handle payment failures** gracefully
5. **Provide clear upgrade paths**

### Payment Processing

1. **Validate payment** on server side
2. **Handle webhooks** reliably
3. **Log all transactions** for audit
4. **Provide receipts** automatically
5. **Support multiple payment methods**

### User Experience

1. **Clear pricing** - No hidden fees
2. **Easy upgrades** - One-click upgrade
3. **Usage visibility** - Show current usage
4. **Grace period** - Give users time to fix payment
5. **Cancellation flow** - Easy to cancel

---

## 🔗 Related Documentation

- [User Authentication & Profile](./02_User_Authentication_and_Profile.md)
- [Car Listing Creation](./03_Car_Listing_Creation.md)
- [Dealer & Company Profiles](./09_Dealer_and_Company_Profiles.md)
- [PROJECT_CONSTITUTION.md](../PROJECT_CONSTITUTION.md)

---

**Last Updated:** January 23, 2026  
**Maintained By:** Development Team  
**Status:** ✅ Production Ready
