# 💳 Stripe Dashboard Setup Guide - Complete Instructions

## 📋 Prerequisites

- Stripe account (https://dashboard.stripe.com)
- Access to Firebase project
- `functions/src/subscriptions/config.ts` file

---

## 🎯 Step 1: Create Products in Stripe Dashboard

### **1.1 Navigate to Products**
```
Stripe Dashboard → Products → + New
```

### **1.2 Create 8 Products**

#### **Product 1: Premium**
```
Name: Globul Cars Premium
Description: Premium plan for private sellers - 10 listings, basic analytics
Pricing:
  - Monthly: 9.99 BGN
  - Annual: 99.99 BGN (save 17%)
```

#### **Product 2: Dealer Basic**
```
Name: Globul Cars Dealer Basic
Description: Basic plan for car dealers - 50 listings, 2 team members
Pricing:
  - Monthly: 49.99 BGN
  - Annual: 499.99 BGN (save 17%)
```

#### **Product 3: Dealer Pro**
```
Name: Globul Cars Dealer Pro
Description: Professional dealer plan - 150 listings, 5 team members, API access
Pricing:
  - Monthly: 99.99 BGN
  - Annual: 999.99 BGN (save 17%)
```

#### **Product 4: Dealer Enterprise**
```
Name: Globul Cars Dealer Enterprise
Description: Enterprise dealer plan - Unlimited listings, unlimited team, priority support
Pricing:
  - Monthly: 299.99 BGN
  - Annual: 2999.99 BGN (save 17%)
```

#### **Product 5: Company Starter**
```
Name: Globul Cars Company Starter
Description: Starter plan for companies - 100 listings, 10 team members
Pricing:
  - Monthly: 149.99 BGN
  - Annual: 1499.99 BGN (save 17%)
```

#### **Product 6: Company Pro**
```
Name: Globul Cars Company Pro
Description: Professional company plan - Unlimited listings, 50 team members
Pricing:
  - Monthly: 249.99 BGN
  - Annual: 2499.99 BGN (save 17%)
```

#### **Product 7: Company Enterprise**
```
Name: Globul Cars Company Enterprise
Description: Enterprise company plan - Unlimited everything, dedicated support
Pricing:
  - Monthly: 499.99 BGN
  - Annual: 4999.99 BGN (save 17%)
```

### **1.3 Configuration Settings**

For each product, configure:

```
Product Type: Service
Billing Period: Recurring
Currency: BGN (Bulgarian Lev)
Tax Behavior: Exclusive (will add VAT at checkout)

Monthly Price:
  - Type: Recurring
  - Interval: Monthly
  - Amount: [as per product]

Annual Price:
  - Type: Recurring
  - Interval: Yearly
  - Amount: [monthly × 10] (17% discount)
```

---

## 📝 Step 2: Copy Price IDs

### **2.1 Find Price IDs**

For each product:
1. Click on the product name
2. In the "Pricing" section, you'll see price entries
3. Click on each price to view details
4. Copy the **Price ID** (starts with `price_`)

Example:
```
Premium Monthly: price_1AbCdEfGhIjKlMnO
Premium Annual: price_1PqRsTuVwXyZaBcD
```

### **2.2 Organize Price IDs**

Create a table:

| Plan | Monthly Price ID | Annual Price ID |
|------|------------------|-----------------|
| Premium | price_1AbCdEfGhIjKlMnO | price_1PqRsTuVwXyZaBcD |
| Dealer Basic | price_1... | price_1... |
| Dealer Pro | price_1... | price_1... |
| Dealer Enterprise | price_1... | price_1... |
| Company Starter | price_1... | price_1... |
| Company Pro | price_1... | price_1... |
| Company Enterprise | price_1... | price_1... |

---

## 🔧 Step 3: Update Config File

### **3.1 Open config.ts**

```bash
cd functions/src/subscriptions
code config.ts
```

### **3.2 Replace Placeholder Price IDs**

**Before:**
```typescript
{
  id: 'premium',
  name: { bg: 'Премиум', en: 'Premium' },
  price: 9.99,
  stripePriceId: 'price_XXXXXXXXXX',  // ❌ Placeholder
  // ...
}
```

**After:**
```typescript
{
  id: 'premium',
  name: { bg: 'Премиум', en: 'Premium' },
  price: 9.99,
  stripePriceId: 'price_1AbCdEfGhIjKlMnO',  // ✅ Real ID
  // ...
}
```

### **3.3 Complete Updated Config**

```typescript
export const SUBSCRIPTION_PLANS: Record<string, SubscriptionPlan> = {
  free: {
    id: 'free',
    name: { bg: 'Безплатен', en: 'Free' },
    price: 0,
    currency: 'BGN',
    stripePriceId: '',  // No Stripe for free plan
    tier: 'free',
    features: [
      { bg: 'До 3 обяви', en: 'Up to 3 listings' },
      { bg: 'Основно търсене', en: 'Basic search' },
      { bg: 'Запазване на любими', en: 'Save favorites' },
    ],
  },

  premium: {
    id: 'premium',
    name: { bg: 'Премиум', en: 'Premium' },
    price: 9.99,
    currency: 'BGN',
    stripePriceId: 'price_[YOUR_MONTHLY_ID]',  // ← Replace
    tier: 'premium',
    features: [
      { bg: 'До 10 обяви', en: 'Up to 10 listings' },
      { bg: 'Основна аналитика', en: 'Basic analytics' },
      { bg: 'Приоритетна поддръжка', en: 'Priority support' },
      { bg: 'Без реклами', en: 'Ad-free' },
    ],
  },

  dealer_basic: {
    id: 'dealer_basic',
    name: { bg: 'Дилър Базов', en: 'Dealer Basic' },
    price: 49.99,
    currency: 'BGN',
    stripePriceId: 'price_[YOUR_MONTHLY_ID]',  // ← Replace
    tier: 'dealer_basic',
    features: [
      { bg: 'До 50 обяви', en: 'Up to 50 listings' },
      { bg: '2 членове в екипа', en: '2 team members' },
      { bg: 'Разширена аналитика', en: 'Advanced analytics' },
      { bg: 'До 2 кампании', en: 'Up to 2 campaigns' },
    ],
  },

  dealer_pro: {
    id: 'dealer_pro',
    name: { bg: 'Дилър Про', en: 'Dealer Pro' },
    price: 99.99,
    currency: 'BGN',
    stripePriceId: 'price_[YOUR_MONTHLY_ID]',  // ← Replace
    tier: 'dealer_pro',
    features: [
      { bg: 'До 150 обяви', en: 'Up to 150 listings' },
      { bg: '5 членове в екипа', en: '5 team members' },
      { bg: 'API достъп (1000/час)', en: 'API access (1000/hr)' },
      { bg: 'До 10 кампании', en: 'Up to 10 campaigns' },
      { bg: 'Email маркетинг', en: 'Email marketing' },
    ],
  },

  dealer_enterprise: {
    id: 'dealer_enterprise',
    name: { bg: 'Дилър Корпоративен', en: 'Dealer Enterprise' },
    price: 299.99,
    currency: 'BGN',
    stripePriceId: 'price_[YOUR_MONTHLY_ID]',  // ← Replace
    tier: 'dealer_enterprise',
    features: [
      { bg: 'Неограничени обяви', en: 'Unlimited listings' },
      { bg: 'Неограничен екип', en: 'Unlimited team' },
      { bg: 'API достъп (10000/час)', en: 'API access (10000/hr)' },
      { bg: 'Неограничени кампании', en: 'Unlimited campaigns' },
      { bg: 'Персонален мениджър', en: 'Dedicated account manager' },
      { bg: 'Персонализиране', en: 'Custom branding' },
    ],
  },

  company_starter: {
    id: 'company_starter',
    name: { bg: 'Компания Стартер', en: 'Company Starter' },
    price: 149.99,
    currency: 'BGN',
    stripePriceId: 'price_[YOUR_MONTHLY_ID]',  // ← Replace
    tier: 'company_starter',
    features: [
      { bg: 'До 100 обяви', en: 'Up to 100 listings' },
      { bg: '10 членове в екипа', en: '10 team members' },
      { bg: 'API достъп (2000/час)', en: 'API access (2000/hr)' },
      { bg: 'Разширена аналитика', en: 'Advanced analytics' },
    ],
  },

  company_pro: {
    id: 'company_pro',
    name: { bg: 'Компания Про', en: 'Company Pro' },
    price: 249.99,
    currency: 'BGN',
    stripePriceId: 'price_[YOUR_MONTHLY_ID]',  // ← Replace
    tier: 'company_pro',
    features: [
      { bg: 'Неограничени обяви', en: 'Unlimited listings' },
      { bg: '50 членове в екипа', en: '50 team members' },
      { bg: 'API достъп (5000/час)', en: 'API access (5000/hr)' },
      { bg: 'Персонализирани отчети', en: 'Custom reports' },
    ],
  },

  company_enterprise: {
    id: 'company_enterprise',
    name: { bg: 'Компания Корпоративна', en: 'Company Enterprise' },
    price: 499.99,
    currency: 'BGN',
    stripePriceId: 'price_[YOUR_MONTHLY_ID]',  // ← Replace
    tier: 'company_enterprise',
    features: [
      { bg: 'Неограничени обяви', en: 'Unlimited listings' },
      { bg: 'Неограничен екип', en: 'Unlimited team' },
      { bg: 'API достъп (50000/час)', en: 'API access (50000/hr)' },
      { bg: 'Персонален мениджър', en: 'Dedicated account manager' },
      { bg: 'SLA 99.9%', en: 'SLA 99.9%' },
    ],
  },
};
```

---

## 🔗 Step 4: Configure Webhook

### **4.1 Get Cloud Function URL**

After deploying `stripeWebhook` function:

```bash
firebase deploy --only functions:stripeWebhook
```

Copy the URL from output:
```
Function URL (stripeWebhook): https://europe-west1-[project-id].cloudfunctions.net/stripeWebhook
```

### **4.2 Add Webhook in Stripe**

1. **Go to**: Stripe Dashboard → Developers → Webhooks
2. **Click**: + Add endpoint
3. **Endpoint URL**: Paste Cloud Function URL
4. **Description**: Globul Cars Subscription Events
5. **Events to send**: Select these 5 events:
   - ✅ `checkout.session.completed`
   - ✅ `invoice.payment_succeeded`
   - ✅ `invoice.payment_failed`
   - ✅ `customer.subscription.deleted`
   - ✅ `customer.subscription.updated`
6. **Click**: Add endpoint

### **4.3 Copy Webhook Secret**

1. Click on the newly created webhook
2. Click "Reveal" next to "Signing secret"
3. Copy the secret (starts with `whsec_`)

### **4.4 Update Environment Variables**

**In `functions/.env`:**
```env
STRIPE_SECRET_KEY=sk_live_... (or sk_test_ for testing)
STRIPE_WEBHOOK_SECRET=whsec_[YOUR_SECRET]
```

**⚠️ Important**: Never commit `.env` file to Git!

---

## 🧪 Step 5: Test the Integration

### **5.1 Use Test Mode**

In Stripe Dashboard, toggle to **Test mode** (switch in top right)

All Price IDs will change to test versions (start with `price_test_`)

### **5.2 Update Config with Test Price IDs**

Temporarily update `config.ts` with test Price IDs for testing

### **5.3 Test Checkout Flow**

1. **Start app**: `npm start`
2. **Navigate**: /pricing
3. **Click**: Select a plan
4. **Use test card**: 4242 4242 4242 4242
   - Expiry: Any future date
   - CVC: Any 3 digits
   - ZIP: Any 5 digits
5. **Complete checkout**
6. **Verify**: Redirected to /billing/success
7. **Check**: Subscription appears in Firestore

### **5.4 Test Webhook**

Use Stripe CLI to forward webhooks locally:

```bash
# Install Stripe CLI
brew install stripe/stripe-cli/stripe

# Login
stripe login

# Forward webhooks
stripe listen --forward-to localhost:5001/[project-id]/europe-west1/stripeWebhook

# Trigger test event
stripe trigger checkout.session.completed
```

Check Firebase Functions logs:
```bash
firebase functions:log --only stripeWebhook
```

---

## 🚀 Step 6: Deploy to Production

### **6.1 Switch to Live Mode**

1. Toggle Stripe Dashboard to **Live mode**
2. Copy **live** Price IDs
3. Update `config.ts` with live Price IDs
4. Update `functions/.env` with live keys:
   ```env
   STRIPE_SECRET_KEY=sk_live_...
   STRIPE_WEBHOOK_SECRET=whsec_live_...
   ```

### **6.2 Deploy Functions**

```bash
cd functions
npm run build
firebase deploy --only functions:createCheckoutSession,functions:verifyCheckoutSession,functions:stripeWebhook,functions:cancelSubscription
```

### **6.3 Update Webhook URL**

In Stripe Dashboard → Webhooks:
1. Click on webhook endpoint
2. Update URL to production Cloud Function URL
3. Save changes

### **6.4 Deploy Frontend**

```bash
cd bulgarian-car-marketplace
npm run build
firebase deploy --only hosting
```

---

## ✅ Verification Checklist

After deployment, verify:

- [ ] All 8 products created in Stripe
- [ ] All Price IDs copied to `config.ts`
- [ ] Webhook endpoint configured with correct URL
- [ ] Webhook secret added to `functions/.env`
- [ ] Environment variables set in Firebase Functions config
- [ ] Test checkout completes successfully
- [ ] Webhook events processed correctly
- [ ] User subscription updated in Firestore
- [ ] Success page displays correctly
- [ ] Invoice generated in Stripe Dashboard

---

## 🔐 Security Best Practices

### **Environment Variables**

Never expose in client code:
```typescript
// ❌ WRONG
const stripeKey = 'sk_live_...';

// ✅ CORRECT (Cloud Functions only)
const stripeKey = process.env.STRIPE_SECRET_KEY;
```

### **Webhook Signature Verification**

Always verify in `stripeWebhook` function:
```typescript
const sig = request.headers['stripe-signature'];
const event = stripe.webhooks.constructEvent(
  request.rawBody,
  sig,
  STRIPE_CONFIG.webhookSecret
);
```

### **User Authentication**

Always verify in Cloud Functions:
```typescript
if (!request.auth) {
  throw new HttpsError('unauthenticated', 'User must be authenticated');
}
```

---

## 📊 Monitoring & Analytics

### **Stripe Dashboard**

Monitor:
- Daily/Monthly revenue
- Subscription churn rate
- Failed payments
- Customer lifetime value

### **Firebase Analytics**

Track events:
```typescript
analytics.logEvent('checkout_initiated', { plan: 'premium' });
analytics.logEvent('subscription_activated', { plan: 'premium' });
analytics.logEvent('subscription_cancelled', { plan: 'premium' });
```

### **Cloud Functions Logs**

Monitor errors:
```bash
firebase functions:log --only stripeWebhook,createCheckoutSession
```

---

## 🆘 Troubleshooting

### **Issue**: Webhook not receiving events

**Solutions**:
1. Check webhook URL is correct
2. Verify events are selected in Stripe
3. Check Cloud Function is deployed
4. Verify STRIPE_WEBHOOK_SECRET is correct

### **Issue**: Invalid signature error

**Solutions**:
1. Ensure webhook secret matches Stripe Dashboard
2. Don't modify request body before verification
3. Use `request.rawBody` not `request.body`

### **Issue**: Checkout session returns 404

**Solutions**:
1. Verify `createCheckoutSession` is deployed
2. Check region is `europe-west1`
3. Ensure user is authenticated

---

## 📞 Support Resources

- **Stripe Docs**: https://stripe.com/docs
- **Stripe Support**: https://support.stripe.com
- **Firebase Docs**: https://firebase.google.com/docs
- **Project Docs**: `SUBSCRIPTION_IMPLEMENTATION_REPORT.md`

---

**Last Updated**: December 2, 2025  
**Version**: 1.0.0  
**Status**: ✅ Ready for Production
