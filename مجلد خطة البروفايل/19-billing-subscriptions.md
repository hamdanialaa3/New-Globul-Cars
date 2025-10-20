# القسم 19: Billing and Subscriptions Implementation

## 19.1 Stripe Integration

```
Setup:
  - Stripe Account: fire-new-globul
  - Products created in Stripe Dashboard:
    * Private Premium: €9.99/month
    * Dealer Basic: €49/month
    * Dealer Pro: €99/month
    * Dealer Enterprise: €199/month
    * Company Starter: €299/month
    * Company Pro: €599/month
    * Company Enterprise: custom

Implementation:
  File: src/services/billing/stripe.service.ts
  
  Functions:
  - createCheckoutSession(plan, userId)
  - handleWebhook(event)  // Cloud Function
  - getSubscriptionStatus(userId)
  - cancelSubscription(userId)
  - updatePlan(userId, newPlan)

  Webhooks:
  - customer.subscription.created
  - customer.subscription.updated
  - customer.subscription.deleted
  - invoice.payment_succeeded
  - invoice.payment_failed
```

## 19.2 Listing Caps Enforcement

```typescript
// src/utils/listing-limits.ts

const PLAN_LIMITS = {
  free: 3,
  premium: 10,
  dealer_basic: 50,
  dealer_pro: 150,
  dealer_enterprise: -1,  // unlimited
  company_starter: 100,
  company_pro: -1,        // unlimited
  company_enterprise: -1,
  custom: -1
};

export async function canAddListing(userId: string): Promise<boolean> {
  const user = await getUser(userId);
  const limit = PLAN_LIMITS[user.plan.tier];
  
  if (limit === -1) return true;  // unlimited
  
  const activeCount = user.stats.activeListings || 0;
  return activeCount < limit;
}

// Usage in add-car flow:
if (!await canAddListing(userId)) {
  throw new Error('Listing limit reached. Upgrade your plan.');
}
```

## 19.3 Commission Model (Future Phase)

```
Commission Structure:
  Private: 0% (free to sell)
  Dealer: 2% per successful sale (min €20, max €500)
  Company: 1.5% per sale (volume discount)

Trigger:
  - Seller marks listing as "sold"
  - Commission calculated automatically
  - Invoice generated
  - Charged to payment method on file
  - Or deducted from account balance

Configurable via Remote Config:
  commissions: {
    private: 0,
    dealer: 0.02,
    company: 0.015,
    min: 20,
    max: 500
  }
```
