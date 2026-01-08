# Subscription System Quick Start Guide

**Updated:** January 7, 2026 | **Version:** 2.0.0 (Post-Overhaul)

## 🎯 TL;DR for Developers

```typescript
// ✅ ALWAYS use this - Single Source of Truth
import { getMaxListings, hasUnlimitedListings } from '@/config/subscription-plans';

// Check if user can add listing
const canAdd = await canAddListing(userId); // from listing-limits.ts

// Get max listings for a tier
const max = getMaxListings('dealer'); // Returns 30 (FIXED!)

// Check if unlimited
const unlimited = hasUnlimitedListings('company'); // true
```

## 📊 Plan Limits (The Truth™)

| Plan     | Listings | Price/Month | Key Features                          |
|----------|----------|-------------|---------------------------------------|
| Free     | 3        | 0 €         | Basic listings, no extras             |
| Dealer   | **30**   | 20 €        | Bulk upload, analytics, 3 team members|
| Company  | ∞        | 100 €       | API access, webhooks, 10 team members |

### 🚨 CRITICAL BUG FIX (Jan 7, 2026)
**Before:** Dealer plan had inconsistent limits (10 in code, 30 in UI) → **BAD** ❌  
**After:** Centralized in `subscription-plans.ts`, dealer = 30 everywhere → **GOOD** ✅

## 🔧 How to Use

### Checking Listing Limits

```typescript
import { canAddListing, getRemainingListings } from '@/utils/listing-limits';

// Before creating a car
const canCreate = await canAddListing(userId);
if (!canCreate) {
  // Show upgrade prompt
  showUpgradeModal('dealer');
  return;
}

// Show remaining slots
const remaining = await getRemainingListings(userId);
console.log(`You can add ${remaining} more cars`);
```

### Comparing Plans

```typescript
import { comparePlans, canUpgradeTo, getRecommendedPlan } from '@/config/subscription-plans';

// Check if upgrade is possible
if (canUpgradeTo(currentTier, 'dealer')) {
  showUpgradeButton('dealer');
}

// Get recommended plan based on needs
const recommended = getRecommendedPlan(25); // Returns 'dealer'
```

### Getting Plan Details

```typescript
import { getPlanByTier, SUBSCRIPTION_PLANS } from '@/config/subscription-plans';

// Method 1: Direct access (use carefully)
const dealerPlan = SUBSCRIPTION_PLANS.dealer;
console.log(dealerPlan.features.maxListings); // 30

// Method 2: Helper function (recommended)
const plan = getPlanByTier('dealer');
if (plan.features.canBulkUpload) {
  showBulkUploadButton();
}
```

## 💳 Micro-Transactions (Turbo Boost)

New one-time payment promotions added January 7, 2026:

```typescript
import { purchasePromotion, hasActivePromotion } from '@/services/billing/micro-transactions.service';

// Purchase a promotion
const result = await purchasePromotion(
  userId,
  listingId,
  'top_of_page', // or 'vip_badge' or 'instant_refresh'
  paymentIntentId
);

// Check if listing has active promotion
const hasVIP = await hasActivePromotion(listingId, 'vip_badge');
if (hasVIP) {
  addVIPBadge(listing);
}
```

### Available Promotions

| Product          | Price | Duration  | Benefit                           |
|------------------|-------|-----------|-----------------------------------|
| VIP Badge        | 2 €   | 7 days    | Gold badge + 3x visibility        |
| Top of Page      | 5 €   | 3 days    | Pin to top + 5x impressions       |
| Instant Refresh  | 1 €   | Instant   | Jump to top + reset timestamp     |

## 🛡️ Churn Prevention System

```typescript
import { 
  startGracePeriod, 
  getGracePeriodStatus,
  applyRetentionOffer 
} from '@/services/billing/churn-prevention.service';

// When payment fails
await startGracePeriod(userId, 'payment_failed');

// Check grace period status
const status = await getGracePeriodStatus(userId);
if (status.isActive) {
  showGracePeriodBanner(status.remainingDays);
}

// Apply retention offer
await applyRetentionOffer(userId, {
  type: 'discount',
  discountPercentage: 50,
  durationMonths: 3
});
```

## 🧪 Testing

```bash
# Run subscription tests
npm test -- --testPathPattern=subscription-plans --watchAll=false

# Run all billing tests
npm test -- billing --watchAll=false

# Check listing limit enforcement
npm test -- listing-limits --watchAll=false
```

### Manual Test Checklist

- [ ] Free user can create exactly 3 listings
- [ ] Dealer user can create exactly 30 listings (NOT 10!)
- [ ] Company user can create unlimited listings
- [ ] Upgrade from free to dealer unlocks 30 slots
- [ ] Micro-transaction purchase applies promotion
- [ ] Grace period starts on payment failure
- [ ] Retention offers reduce price correctly

## 🚨 Common Pitfalls

### ❌ DON'T: Hardcode limits
```typescript
// BAD - This is what caused the bug!
const maxListings = user.tier === 'dealer' ? 10 : 3;
```

### ✅ DO: Use centralized config
```typescript
// GOOD - Single source of truth
import { getMaxListings } from '@/config/subscription-plans';
const maxListings = getMaxListings(user.tier);
```

### ❌ DON'T: Import old constants
```typescript
// DEPRECATED - Don't use anymore
import { SUBSCRIPTION_PLANS } from '@/config/billing-config';
```

### ✅ DO: Import from new location
```typescript
// CORRECT - Use this
import { SUBSCRIPTION_PLANS } from '@/config/subscription-plans';
```

## 📚 Related Documentation

- [SUBSCRIPTION_SYSTEM_OVERHAUL_JAN7_2026.md](../SUBSCRIPTION_SYSTEM_OVERHAUL_JAN7_2026.md) - Complete overhaul details
- [PROJECT_CONSTITUTION.md](../PROJECT_CONSTITUTION.md) - Architectural principles
- [SECURITY.md](../SECURITY.md) - Firestore rules for subscriptions

## 🔗 Key Files

| File | Purpose |
|------|---------|
| `src/config/subscription-plans.ts` | **Single source of truth** for all limits |
| `src/utils/listing-limits.ts` | Enforce limits before car creation |
| `src/services/billing/micro-transactions.service.ts` | One-time promotions |
| `src/services/billing/churn-prevention.service.ts` | Grace period + retention |
| `src/services/profile/PermissionsService.ts` | Feature flags by plan |

## 💡 Quick Decision Tree

```
Need to check plan limits?
├─ Before creation → canAddListing(userId)
├─ Display remaining → getRemainingListings(userId)
├─ Get max for tier → getMaxListings(tier)
└─ Check unlimited → hasUnlimitedListings(tier)

Need to upgrade user?
├─ Check possible → canUpgradeTo(from, to)
├─ Get recommendation → getRecommendedPlan(needsCount)
└─ Compare tiers → comparePlans(tierA, tierB)

Need promotions?
├─ Purchase → purchasePromotion(...)
├─ Check active → hasActivePromotion(listingId, type)
└─ Get all → getActivePromotions(listingId)

Payment failed?
├─ Start grace → startGracePeriod(userId, reason)
├─ Check status → getGracePeriodStatus(userId)
└─ Apply offer → applyRetentionOffer(userId, offer)
```

## 📞 Need Help?

1. **Bug in limits?** Check `subscription-plans.ts` first
2. **User can't add listing?** Run `canAddListing()` and log result
3. **Promotion not applying?** Verify `paymentIntentId` is valid
4. **Grace period issues?** Check Firestore `users/{id}/subscription.gracePeriod`

---

**Last Updated:** January 7, 2026  
**Maintainer:** Globul Cars Dev Team  
**Status:** ✅ Production-ready (all tests passing)
