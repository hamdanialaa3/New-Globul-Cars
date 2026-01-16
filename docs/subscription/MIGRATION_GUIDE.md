# 🔄 Billing Services Migration Guide

**Date:** January 16, 2026  
**Status:** In Progress  
**Priority:** High

---

## 📊 Current State

We currently have **3 billing service implementations**:

1. ❌ **LEGACY**: `src/services/billing-service.ts` (UnifiedBillingService)
2. ✅ **PRODUCTION**: `src/services/billing/subscription-service.ts` (Stripe Extension)
3. ✅ **UI LAYER**: `src/features/billing/BillingService.ts` (Transforms plans for UI)

---

## 🎯 Migration Goal

**Deprecate and remove** `billing-service.ts` to eliminate code duplication.

---

## 📋 Migration Checklist

### Phase 1: Audit Dependencies ✅

Find all files importing `billing-service.ts`:

```bash
# Search for imports
grep -r "from.*billing-service" src/
```

**Files to update:**
- [ ] Components using `UnifiedBillingService.getInstance()`
- [ ] Services calling `billing-service` methods
- [ ] Tests importing `billing-service`

### Phase 2: Update Imports 🔄

Replace legacy imports:

```typescript
// ❌ OLD (Remove):
import { UnifiedBillingService } from '@/services/billing-service';
const billing = UnifiedBillingService.getInstance();

// ✅ NEW (Use this):
import { subscriptionService } from '@/services/billing/subscription-service';
import { billingService } from '@/features/billing/BillingService';
```

### Phase 3: Method Mapping 🗺️

| Legacy Method | New Replacement |
|--------------|-----------------|
| `createCheckoutSession()` | `subscriptionService.createCheckoutSession()` |
| `getSubscriptionStatus()` | `billingService.getCurrentSubscription()` |
| `cancelSubscription()` | `subscriptionService.getPortalLink()` → User cancels via portal |
| `getStripeInstance()` | Import directly from `@stripe/stripe-js` |

### Phase 4: Update Components 📝

Example migration:

```typescript
// BEFORE:
import { UnifiedBillingService } from '@/services/billing-service';

const handleUpgrade = async () => {
  const billing = UnifiedBillingService.getInstance();
  const session = await billing.createCheckoutSession(
    'dealer', 
    userId, 
    successUrl, 
    cancelUrl
  );
  // ...
};

// AFTER:
import { subscriptionService } from '@/services/billing/subscription-service';

const handleUpgrade = async () => {
  const result = await subscriptionService.createCheckoutSession({
    userId,
    planId: 'dealer',
    interval: 'monthly',
    successUrl,
    cancelUrl
  });
  window.location.href = result.url;
};
```

### Phase 5: Remove Legacy Files 🗑️

Once all dependencies migrated:

1. Delete `src/services/billing-service.ts`
2. Delete `src/services/billing-operations.ts` (if unused)
3. Delete `src/services/billing-data.ts` (LEGACY tiers)
4. Update `src/services/billing/index.ts` exports

---

## ⚠️ Breaking Changes

### 1. Method Signatures Changed

**Old:**
```typescript
createCheckoutSession(
  tierId: string,
  userId: string,
  successUrl: string,
  cancelUrl: string
): Promise<any>
```

**New:**
```typescript
createCheckoutSession(params: {
  userId: string;
  planId: 'dealer' | 'company';
  interval: 'monthly' | 'annual';
  successUrl: string;
  cancelUrl: string;
}): Promise<{ url: string; sessionId: string }>
```

### 2. Stripe Connect Removed

Legacy `StripeConnectOperations` is removed. For car purchase payments, use:
```typescript
import { httpsCallable } from 'firebase/functions';

const createPayment = httpsCallable(functions, 'createCarPaymentIntent');
const result = await createPayment({ carId, amount, buyerId });
```

---

## 🧪 Testing Strategy

### Before Migration:
1. **Document current behavior**
2. **Create test cases** for all billing flows
3. **Backup database** (if needed)

### During Migration:
1. **Update one component at a time**
2. **Test thoroughly** after each update
3. **Keep rollback plan ready**

### After Migration:
1. **Run full test suite**
2. **Test checkout flow** end-to-end
3. **Verify webhook handling** still works
4. **Monitor production logs** for errors

---

## 📈 Progress Tracker

| Component/Service | Status | Notes |
|-------------------|--------|-------|
| SubscriptionManager.tsx | ✅ Done | Already using subscriptionService |
| PricingPageEnhanced.tsx | ✅ Done | Using SUBSCRIPTION_PLANS directly |
| BillingPage.tsx | ✅ Done | Uses subscriptionService |
| ProfileTypeSwitcher.tsx | ✅ Done | Creates checkout sessions |
| billing-service.ts | ⚠️ To Remove | Awaiting final migration |
| billing-operations.ts | ⚠️ To Review | Check if still needed |
| billing-data.ts | ⚠️ To Remove | LEGACY - marked deprecated |

---

## 🚨 Risks & Mitigation

| Risk | Mitigation |
|------|------------|
| Breaking existing flows | Comprehensive testing before removal |
| Missing functionality | Audit all methods before migration |
| Production errors | Deploy in stages, monitor logs |
| Data loss | No database changes in this migration |

---

## 📅 Timeline

- **Week 1**: Audit & document dependencies ✅
- **Week 2**: Update imports & test (current)
- **Week 3**: Remove legacy files
- **Week 4**: Monitor production & cleanup

---

## ✅ Success Criteria

1. All components use `subscription-service.ts` or `BillingService.ts`
2. No imports of `billing-service.ts` in codebase
3. All tests passing
4. Checkout flow works end-to-end
5. Webhook handling verified

---

## 📞 Contacts

**Migration Lead**: [Developer Name]  
**Code Review**: [Tech Lead]  
**Testing**: [QA Team]

---

**Last Updated**: January 16, 2026
