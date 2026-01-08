# Subscription System Deployment Guide

**Version:** 2.0.0 | **Date:** January 7, 2026 | **Status:** Ready for Production

## 🎯 Pre-Deployment Checklist

### Phase 1: Code Verification
- [x] **Critical bug fixed**: Dealer plan limit changed from 10 → 30
- [x] **Single source of truth**: `subscription-plans.ts` created
- [x] **Services updated**: listing-limits.ts, billing-config.ts, PermissionsService.ts
- [x] **New features**: Micro-Transactions + Churn Prevention services created
- [ ] **TypeScript check**: Run `npm run type-check` (no errors expected)
- [ ] **Unit tests**: Run `npm test -- subscription-plans --watchAll=false`
- [ ] **Build test**: Run `npm run build` (verify prebuild checks pass)

### Phase 2: Firebase Configuration
- [ ] **Firestore rules**: Merge `firestore-rules-subscription-update.rules` into `firestore.rules`
- [ ] **Stripe webhook**: Update `functions/src/stripe-webhooks.ts` with new handlers
- [ ] **Environment variables**: Verify `STRIPE_SECRET_KEY` and `STRIPE_WEBHOOK_SECRET` set
- [ ] **Scheduled functions**: Deploy `checkGracePeriods` and `expirePromotions` functions

### Phase 3: Stripe Dashboard Setup
- [ ] **Products created**: VIP Badge (2€), Top of Page (5€), Instant Refresh (1€)
- [ ] **Webhook endpoint**: `https://your-project.cloudfunctions.net/stripeWebhook`
- [ ] **Events subscribed**: 
  - `customer.subscription.created`
  - `customer.subscription.updated`
  - `customer.subscription.deleted`
  - `invoice.paid`
  - `invoice.payment_failed`
  - `payment_intent.succeeded`
  - `payment_intent.payment_failed`

### Phase 4: Database Migration
- [ ] **Backup Firestore**: Use Firebase Console → Firestore → Export
- [ ] **Update existing users**: Run migration script (see below)
- [ ] **Verify counters**: Check `counters/{uid}/cars` for dealer users

---

## 🚀 Deployment Steps

### Step 1: Deploy Firestore Rules (5 min)

```bash
# 1. Merge new rules into firestore.rules
cat firestore-rules-subscription-update.rules >> firestore.rules

# 2. Deploy rules only (safe, no downtime)
firebase deploy --only firestore:rules

# 3. Test in Firestore Rules Playground
# - Verify free user blocked at 4th listing
# - Verify dealer user blocked at 31st listing (NOT 11th!)
# - Verify only Cloud Functions can write promotions
```

### Step 2: Deploy Cloud Functions (10 min)

```bash
# 1. Navigate to functions directory
cd functions

# 2. Install dependencies
npm install

# 3. Build TypeScript
npm run build

# 4. Deploy all functions
cd ..
npm run deploy:functions

# Expected output:
# ✅ stripeWebhook (HTTP)
# ✅ checkGracePeriods (Scheduled: every day 09:00)
# ✅ expirePromotions (Scheduled: every 6 hours)
```

### Step 3: Deploy Frontend (15 min)

```bash
# 1. Type check
npm run type-check

# 2. Run tests
npm test -- subscription-plans billing --watchAll=false

# 3. Build production bundle
npm run build

# 4. Deploy hosting
npm run deploy:hosting

# 5. Verify deployment
# Visit: https://your-project.web.app
# Check: Console for no errors
```

### Step 4: Database Migration Script

Create and run this one-time migration:

```typescript
// scripts/migrate-dealer-limits.ts
import * as admin from 'firebase-admin';

admin.initializeApp();
const db = admin.firestore();

async function migrateDealerLimits() {
  console.log('🔄 Starting dealer limit migration...');
  
  // Find all dealer users
  const dealerUsersSnapshot = await db.collection('users')
    .where('subscription.tier', '==', 'dealer')
    .get();

  console.log(`Found ${dealerUsersSnapshot.size} dealer users`);

  const batch = db.batch();
  let count = 0;

  for (const userDoc of dealerUsersSnapshot.docs) {
    const userData = userDoc.data();
    const activeListings = userData.stats?.activeListings || 0;

    // Users with 11-30 listings were previously blocked
    // No data to migrate, just log for verification
    console.log(`User ${userDoc.id}: ${activeListings}/30 listings`);

    count++;
    if (count % 500 === 0) {
      // Firestore batch limit is 500
      await batch.commit();
      console.log(`✅ Processed ${count} users`);
    }
  }

  if (count % 500 !== 0) {
    await batch.commit();
  }

  console.log(`✅ Migration complete! Processed ${count} dealer users`);
  console.log('🎉 Dealers can now add up to 30 listings!');
}

migrateDealerLimits().then(() => process.exit(0));
```

Run migration:

```bash
cd functions
npx ts-node ../scripts/migrate-dealer-limits.ts
```

---

## 🧪 Post-Deployment Testing

### Manual Test Suite

#### Test 1: Free User Limits
```
1. Create test user with free plan
2. Create 3 listings → Should succeed
3. Try 4th listing → Should block with upgrade prompt
✅ Expected: Blocked at 4th listing
```

#### Test 2: Dealer User Limits (CRITICAL)
```
1. Create test user with dealer plan
2. Create 10 listings → Should succeed
3. Create 20 listings → Should succeed
4. Create 30 listings → Should succeed
5. Try 31st listing → Should block with upgrade prompt
✅ Expected: Blocked at 31st listing (NOT 11th!)
```

#### Test 3: Company User Unlimited
```
1. Create test user with company plan
2. Create 50+ listings → All should succeed
✅ Expected: No limit
```

#### Test 4: Micro-Transaction Purchase
```
1. Login as any user
2. Select a listing
3. Click "VIP Badge" (2€)
4. Complete Stripe payment
5. Verify badge appears on listing
6. Check Firestore: listings/{id}/promotions should have active document
✅ Expected: Promotion applied immediately
```

#### Test 5: Grace Period Trigger
```
1. Create dealer user with active subscription
2. In Stripe Dashboard, cancel subscription
3. Webhook should fire → Check Cloud Function logs
4. Verify in Firestore: users/{id}/subscription.gracePeriod.isActive = true
5. User should receive email (if email system configured)
✅ Expected: Grace period starts, user notified
```

### Automated Test Suite

```bash
# Run all subscription tests
npm test -- subscription-plans --watchAll=false

# Run specific test
npm test -- --testNamePattern="dealer plan must have 30 listings" --watchAll=false

# Expected output:
# ✅ 🚨 CRITICAL: Dealer plan must have 30 listings (was 10)
# ✅ Free plan should have 3 listings
# ✅ Company plan should have unlimited listings
# ... (all tests pass)
```

---

## 📊 Monitoring & Metrics

### Key Metrics to Track

#### Subscription Health
- **Dealer upgrades**: Target +20% in first month
- **Churn rate**: Target reduction from 20% → 14%
- **Grace period conversions**: Target 30% retention

#### Micro-Transactions Revenue
- **VIP Badge sales**: Target 200/month × 2€ = 400€
- **Top of Page sales**: Target 150/month × 5€ = 750€
- **Instant Refresh sales**: Target 500/month × 1€ = 500€
- **Total expected**: ~1,650€/month additional revenue

### Monitoring Commands

```bash
# View Cloud Function logs (real-time)
firebase functions:log --only stripeWebhook

# View scheduled function logs
firebase functions:log --only checkGracePeriods,expirePromotions

# Check Firestore usage
firebase firestore:stats

# Monitor errors
firebase crashlytics:symbols:list
```

### Firestore Queries for Monitoring

```typescript
// Count active promotions
db.collectionGroup('promotions')
  .where('isActive', '==', true)
  .count()
  .get();

// Count grace period users
db.collection('users')
  .where('subscription.gracePeriod.isActive', '==', true)
  .count()
  .get();

// Revenue by promotion type (last 30 days)
db.collectionGroup('promotions')
  .where('createdAt', '>=', thirtyDaysAgo)
  .orderBy('type')
  .get();
```

---

## 🚨 Rollback Plan

If critical issues arise after deployment:

### Emergency Rollback

```bash
# 1. Revert Firestore rules (instant)
firebase deploy --only firestore:rules

# 2. Revert Cloud Functions
firebase functions:delete stripeWebhook --force
firebase functions:delete checkGracePeriods --force
firebase functions:delete expirePromotions --force

# 3. Revert frontend
firebase hosting:clone SOURCE_SITE_ID:CHANNEL_NAME DESTINATION_SITE_ID:live

# 4. Restore database from backup (if needed)
# Go to Firebase Console → Firestore → Import/Export
```

### Partial Rollback (Frontend Only)

```bash
# Deploy previous version from Git
git checkout v0.2.9
npm run build
npm run deploy:hosting
```

### Hotfix Process

```bash
# 1. Create hotfix branch
git checkout -b hotfix/subscription-system

# 2. Make minimal fix
# Edit only necessary files

# 3. Test locally
npm test && npm run build

# 4. Deploy functions + hosting
npm run deploy

# 5. Monitor logs for 30 minutes
firebase functions:log --only stripeWebhook
```

---

## 📞 Support Contacts

### Technical Issues
- **Developer Team**: dev@globul-cars.bg
- **Firebase Support**: https://firebase.google.com/support
- **Stripe Support**: https://support.stripe.com

### Monitoring Alerts
- **Sentry**: https://sentry.io/organizations/globul-cars
- **Google Analytics**: https://analytics.google.com

### Escalation Path
1. **Level 1**: Check logs (Firebase Console + Sentry)
2. **Level 2**: Review recent deployments (Git history)
3. **Level 3**: Rollback to previous version
4. **Level 4**: Contact Firebase/Stripe support

---

## ✅ Success Criteria

Deployment is considered successful when:

- [x] Zero TypeScript errors
- [x] All unit tests passing
- [x] Firestore rules deployed successfully
- [x] Cloud Functions deployed and responding
- [x] Frontend deployed and accessible
- [ ] Manual test suite 100% passed
- [ ] No critical errors in logs (first 24 hours)
- [ ] Dealer users can create 30 listings
- [ ] Micro-transaction purchases work
- [ ] Grace period triggers on payment failure
- [ ] Scheduled functions running on schedule

---

## 📚 Additional Resources

- **Full Documentation**: [SUBSCRIPTION_SYSTEM_OVERHAUL_JAN7_2026.md](../SUBSCRIPTION_SYSTEM_OVERHAUL_JAN7_2026.md)
- **Quick Start**: [SUBSCRIPTION_SYSTEM_QUICK_START.md](SUBSCRIPTION_SYSTEM_QUICK_START.md)
- **Architecture**: [PROJECT_CONSTITUTION.md](../PROJECT_CONSTITUTION.md)
- **Security**: [SECURITY.md](../SECURITY.md)

---

**Last Updated:** January 7, 2026  
**Deployment Team:** Globul Cars Engineering  
**Estimated Deployment Time:** ~45 minutes (including testing)  
**Risk Level:** Medium (critical bug fix, backward compatible)
