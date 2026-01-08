# 🚨 CRITICAL: Subscription System Changes (Jan 7, 2026)

**READ THIS FIRST** if you're working with subscriptions, billing, or listing limits!

---

## ⚡ What Changed (TL;DR)

### 1. 🐛 Critical Bug Fix
**Dealer plan was broken** → Fixed (10 listings → 30 listings)

### 2. 📦 New File to Import
**OLD (WRONG):**
```typescript
import { SUBSCRIPTION_PLANS } from '@/config/billing-config'; // ❌ DON'T USE
```

**NEW (CORRECT):**
```typescript
import { getMaxListings } from '@/config/subscription-plans'; // ✅ USE THIS
```

### 3. 💳 New Features Added
- **Micro-Transactions**: VIP Badge (2€), Top of Page (5€), Instant Refresh (1€)
- **Churn Prevention**: 7-day grace period when payment fails

---

## 📚 Quick Links

| I need to... | Read this |
|--------------|-----------|
| Understand the bug fix | [SUBSCRIPTION_SYSTEM_OVERHAUL_JAN7_2026.md](SUBSCRIPTION_SYSTEM_OVERHAUL_JAN7_2026.md) (Section 2) |
| Use subscription limits in code | [SUBSCRIPTION_SYSTEM_QUICK_START.md](docs/SUBSCRIPTION_SYSTEM_QUICK_START.md) |
| Deploy to production | [SUBSCRIPTION_SYSTEM_DEPLOYMENT_GUIDE.md](docs/SUBSCRIPTION_SYSTEM_DEPLOYMENT_GUIDE.md) |
| See test results | Run `npm test -- subscription-plans` |

---

## 🔧 How to Use Correctly

### Check if user can add listing:

```typescript
import { canAddListing } from '@/utils/listing-limits';

const canCreate = await canAddListing(userId);
if (!canCreate) {
  showUpgradeModal('dealer');
}
```

### Get max listings for a tier:

```typescript
import { getMaxListings } from '@/config/subscription-plans';

const max = getMaxListings('dealer'); // Returns 30 (FIXED!)
```

### Purchase a promotion:

```typescript
import { purchasePromotion } from '@/services/billing/micro-transactions.service';

await purchasePromotion(userId, listingId, 'vip_badge', paymentIntentId);
```

---

## 🚨 CRITICAL: Don't Do These!

❌ **Don't hardcode limits:**
```typescript
const max = tier === 'dealer' ? 10 : 3; // WRONG! Use getMaxListings()
```

❌ **Don't import from old location:**
```typescript
import { SUBSCRIPTION_PLANS } from '@/config/billing-config'; // DEPRECATED
```

❌ **Don't create listings without checking limit:**
```typescript
await createCar(data); // WRONG! Check canAddListing() first
```

---

## ✅ What to Do Next

1. **Read the Quick Start**: [SUBSCRIPTION_SYSTEM_QUICK_START.md](docs/SUBSCRIPTION_SYSTEM_QUICK_START.md)
2. **Run the tests**: `npm test -- subscription-plans`
3. **Check your code**: Search for `billing-config` imports and update them

---

**Questions?** Check [SUBSCRIPTION_SYSTEM_COMPLETION_REPORT_JAN7_2026.md](SUBSCRIPTION_SYSTEM_COMPLETION_REPORT_JAN7_2026.md)

**Last Updated:** January 7, 2026
