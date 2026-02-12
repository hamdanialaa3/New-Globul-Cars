# 🔧 Stripe Integration Setup Guide

**Last Updated:** January 16, 2026  
**Project:** Koli One  
**Environment:** Production

---

## 📋 Overview

This guide explains how to set up and maintain Stripe integration for the subscription system.

---

## 🏗️ Architecture

### Firebase Stripe Extension
We use the **Firebase Stripe Payments Extension** for seamless integration:
- Extension ID: `firestore-stripe-payments`
- Collection: `customers/{uid}/checkout_sessions`
- Products synced from Stripe Dashboard

### Manual Stripe.js
For one-time payments (promotions):
- Service: `src/services/billing-operations.ts`
- Functions: `functions/src/api/stripe/create-payment-intent.ts`

---

## 🎯 Subscription Plans

| Plan | Monthly Price | Annual Price | Listings |
|------|---------------|--------------|----------|
| Free | €0 | €0 | 3 |
| Dealer | €20.11 | €193 | 30 |
| Company | €100.11 | €961 | Unlimited |

---

## 🔑 Step 1: Create Stripe Products

### 1.1 Login to Stripe Dashboard
```
https://dashboard.stripe.com/products
```

### 1.2 Create Dealer Product
1. Click **"+ Add product"**
2. Fill in:
   - **Name**: `Mobilebg Cars - Dealer`
   - **Description**: `Professional dealer plan with 30 active listings`
3. Add **Monthly Price**:
   - Price: `€20.11`
   - Billing: `Recurring - Monthly`
   - **Copy the Price ID** (starts with `price_...`)
4. Add **Annual Price**:
   - Price: `€193`
   - Billing: `Recurring - Yearly`
   - **Copy the Price ID**

### 1.3 Create Company Product
1. Click **"+ Add product"**
2. Fill in:
   - **Name**: `Mobilebg Cars - Company`
   - **Description**: `Enterprise plan with unlimited listings`
3. Add **Monthly Price**:
   - Price: `€100.11`
   - Billing: `Recurring - Monthly`
   - **Copy the Price ID**
4. Add **Annual Price**:
   - Price: `€961`
   - Billing: `Recurring - Yearly`
   - **Copy the Price ID**

---

## 📝 Step 2: Update Price IDs in Code

### 2.1 Update `subscription-plans.ts`

**File:** `src/config/subscription-plans.ts`

```typescript
dealer: {
  // ... other config
  stripePriceIds: {
    monthly: 'price_YOUR_DEALER_MONTHLY_ID', // ← Paste here
    annual: 'price_YOUR_DEALER_ANNUAL_ID'    // ← Paste here
  }
},
company: {
  // ... other config
  stripePriceIds: {
    monthly: 'price_YOUR_COMPANY_MONTHLY_ID', // ← Paste here
    annual: 'price_YOUR_COMPANY_ANNUAL_ID'    // ← Paste here
  }
}
```

### 2.2 Update `stripe-extension.config.ts`

**File:** `src/config/stripe-extension.config.ts`

```typescript
export const STRIPE_PRICE_IDS = {
  dealer: {
    monthly: 'price_YOUR_DEALER_MONTHLY_ID',
    annual: 'price_YOUR_DEALER_ANNUAL_ID'
  },
  company: {
    monthly: 'price_YOUR_COMPANY_MONTHLY_ID',
    annual: 'price_YOUR_COMPANY_ANNUAL_ID'
  }
} as const;
```

---

## 🪝 Step 3: Setup Webhook

### 3.1 Create Webhook Endpoint

1. Go to **Developers → Webhooks**
2. Click **"+ Add endpoint"**
3. **Endpoint URL**:
   ```
   https://YOUR_CLOUD_FUNCTION_URL/stripe-webhooks
   ```
   Example:
   ```
   https://europe-west1-YOUR_PROJECT.cloudfunctions.net/stripe-webhooks
   ```

4. **Events to send**:
   - ✅ `customer.subscription.created`
   - ✅ `customer.subscription.updated`
   - ✅ `customer.subscription.deleted`
   - ✅ `customer.subscription.paused`
   - ✅ `invoice.payment_succeeded`
   - ✅ `invoice.payment_failed`
   - ✅ `charge.refunded`
   - ✅ `charge.dispute.created`

5. **Copy the Signing Secret** (starts with `whsec_...`)

### 3.2 Add Webhook Secret to Firebase

```bash
# For Firebase Functions v1:
firebase functions:config:set stripe.webhook="whsec_YOUR_SIGNING_SECRET"

# For Firebase Functions v2 (Secrets Manager):
firebase functions:secrets:set STRIPE_WEBHOOK_SECRET
# Paste the secret when prompted
```

### 3.3 Verify in Code

**File:** `functions/src/stripe-webhooks.ts`

```typescript
const webhookSecret = 
  process.env.STRIPE_WEBHOOK_SECRET ||
  functions.config()?.stripe?.webhook ||
  "";

// This should NOT be empty in production
if (!webhookSecret) {
  logger.error("STRIPE_WEBHOOK_SECRET not configured!");
}
```

---

## 🔐 Step 4: Configure API Keys

### 4.1 Get API Keys from Stripe

1. Go to **Developers → API keys**
2. Copy:
   - **Publishable key** (starts with `pk_live_...` or `pk_test_...`)
   - **Secret key** (starts with `sk_live_...` or `sk_test_...`)

### 4.2 Add to Firebase Config

```bash
# Publishable key (Frontend)
firebase functions:config:set stripe.publishable="pk_live_YOUR_KEY"

# Secret key (Backend)
firebase functions:config:set stripe.secret="sk_live_YOUR_KEY"
```

### 4.3 Add to Environment Variables

**File:** `.env` (Frontend)

```env
REACT_APP_STRIPE_PUBLISHABLE_KEY=pk_live_YOUR_KEY
```

**File:** `functions/.env` (Backend)

```env
STRIPE_SECRET_KEY=sk_live_YOUR_KEY
STRIPE_WEBHOOK_SECRET=whsec_YOUR_SECRET
```

---

## 🧪 Step 5: Test the Integration

### 5.1 Test Card Numbers

Use Stripe test cards:

| Card Number | Result |
|-------------|--------|
| `4242 4242 4242 4242` | Success |
| `4000 0000 0000 0002` | Card declined |
| `4000 0025 0000 3155` | Requires authentication (3D Secure) |

**Expiry:** Any future date (e.g., `12/34`)  
**CVC:** Any 3 digits (e.g., `123`)

### 5.2 Test Subscription Flow

1. **Create Checkout Session**:
   ```typescript
   import { subscriptionService } from '@/services/billing/subscription-service';
   
   const result = await subscriptionService.createCheckoutSession({
     userId: 'test-user-id',
     planId: 'dealer',
     interval: 'monthly',
     successUrl: 'https://yoursite.com/success',
     cancelUrl: 'https://yoursite.com/cancel'
   });
   
   // Redirect to result.url
   window.location.href = result.url;
   ```

2. **Complete Payment** using test card

3. **Verify Webhook Received**:
   - Check Firebase Functions logs
   - Verify `users/{uid}` updated with `planTier: 'dealer'`

---

## 🔍 Step 6: Monitor & Debug

### 6.1 Firebase Functions Logs

```bash
# View all logs
firebase functions:log

# Filter for Stripe webhooks
firebase functions:log --only stripe-webhooks
```

### 6.2 Stripe Dashboard

1. **Payments**: https://dashboard.stripe.com/payments
2. **Subscriptions**: https://dashboard.stripe.com/subscriptions
3. **Webhook Logs**: https://dashboard.stripe.com/webhooks

### 6.3 Common Issues

| Issue | Solution |
|-------|----------|
| Webhook not received | Check endpoint URL and firewall |
| Signature verification failed | Verify webhook secret matches |
| Price ID not found | Ensure price IDs are correct in code |
| User not updated | Check `stripe-webhooks.ts` logs for errors |

---

## 🚀 Step 7: Deploy to Production

### 7.1 Pre-Deployment Checklist

- [ ] All Price IDs updated in code
- [ ] Webhook secret configured
- [ ] API keys configured (LIVE keys)
- [ ] Test subscription flow works
- [ ] Webhook endpoint accessible
- [ ] Environment variables set

### 7.2 Deploy

```bash
# Deploy functions (includes webhook handler)
npm run deploy:functions

# Or deploy all
firebase deploy
```

### 7.3 Post-Deployment Verification

1. **Test with LIVE card** (not test card)
2. **Verify webhook received** in Stripe Dashboard
3. **Check user updated** in Firestore
4. **Monitor for errors** in Firebase logs

---

## 📚 Additional Resources

- [Stripe Dashboard](https://dashboard.stripe.com)
- [Firebase Stripe Extension Docs](https://github.com/stripe/stripe-firebase-extensions)
- [Stripe API Reference](https://stripe.com/docs/api)
- [Project Subscription System README](./README.md)

---

## 🆘 Support Contacts

**Stripe Support**: https://support.stripe.com  
**Firebase Support**: https://firebase.google.com/support  
**Project Lead**: [Your Contact Info]

---

**Remember:**
- ⚠️ Never commit API keys to Git
- ✅ Always test with test mode first
- ✅ Monitor webhook logs after deployment
- ✅ Keep this document updated with any changes
