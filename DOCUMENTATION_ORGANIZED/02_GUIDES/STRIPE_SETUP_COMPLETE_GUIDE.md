# 💳 Stripe Integration - دليل الإعداد الكامل
**Complete Stripe Setup Guide**

**Last Updated**: December 12, 2025  
**Status**: ✅ Backend Ready | ⏳ Stripe Account Setup Required  
**Geography**: 🇧🇬 Bulgaria  
**Currency**: 💶 EUR (Euro)

---

## 📊 **نظرة عامة | Overview**

### **الخطط الثلاثة | Three Plans:**

1. **FREE** (€0/month) - Private sellers
2. **DEALER** (€29/month or €300/year) - Car dealers
3. **COMPANY** (€199/month or €1,600/year) - Large businesses

---

## 🎯 **خطوات الإعداد | Setup Steps**

### **Step 1: إنشاء Stripe Account**

1. **الذهاب إلى:** https://dashboard.stripe.com/register
2. **اختر:** Bulgaria (بلغاريا) كـ country
3. **أدخل:**
   - Business name: Globul Cars
   - Business type: Individual / Company
   - Email: globul.net.m@gmail.com
4. **أكمل التحقق:**
   - إثبات الهوية (ID/Passport)
   - معلومات البنك (لاستلام المدفوعات)

**⏱️ Time**: 15-30 minutes  
**Cost**: FREE (Stripe doesn't charge setup fees)

---

### **Step 2: Get API Keys**

1. **الذهاب إلى:** https://dashboard.stripe.com/test/apikeys
2. **انسخ:**
   ```env
   STRIPE_PUBLISHABLE_KEY=pk_test_51...  # Public key (للـ frontend)
   STRIPE_SECRET_KEY=sk_test_51...       # Secret key (للـ backend)
   ```

3. **أضف إلى Firebase Functions:**
   ```bash
   cd functions
   firebase functions:config:set stripe.secret_key="sk_test_51..."
   firebase functions:config:set stripe.publishable_key="pk_test_51..."
   ```

4. **أضف إلى `.env` (Frontend):**
   ```env
   REACT_APP_STRIPE_PUBLIC_KEY=pk_test_51...
   ```

---

### **Step 3: Create Products & Prices**

#### **3.1 إنشاء Dealer Plan**

1. **الذهاب إلى:** https://dashboard.stripe.com/test/products/create
2. **Product Details:**
   - Name: `Dealer Plan`
   - Description: `Professional plan for car dealers - 15 cars/month + 30 AI analyses`
   - Image: (Upload Globul Cars logo)

3. **Pricing:**
   
   **Monthly Price:**
   - Amount: `€29.00`
   - Billing period: `Monthly`
   - Currency: `EUR`
   - Click "Add price"
   - **Copy Price ID**: `price_1SaQJCKdXsQ61OHN50bRgcvP` ✅
   
   **Annual Price:**
   - Amount: `€300.00`
   - Billing period: `Yearly`
   - Currency: `EUR`
   - Click "Add another price"
   - **Copy Price ID**: `price_1SaQM6KdXsQ61OHNo98fp2eq` ✅

4. **Save Product**

---

#### **3.2 إنشاء Company Plan**

1. **الذهاب إلى:** https://dashboard.stripe.com/test/products/create
2. **Product Details:**
   - Name: `Company Plan`
   - Description: `Enterprise plan for large businesses - Unlimited cars + Unlimited AI`
   - Image: (Upload Globul Cars logo)

3. **Pricing:**
   
   **Monthly Price:**
   - Amount: `€199.00`
   - Billing period: `Monthly`
   - Currency: `EUR`
   - **Copy Price ID**: `price_XXXXXXXXX` ⏳ (سنحدثها)
   
   **Annual Price:**
   - Amount: `€1,600.00`
   - Billing period: `Yearly`
   - Currency: `EUR`
   - **Copy Price ID**: `price_YYYYYYYYY` ⏳ (سنحدثها)

4. **Save Product**

---

### **Step 4: Update Price IDs في الكود**

افتح `functions/src/subscriptions/config.ts` وحدث:

```typescript
export const SUBSCRIPTION_PLANS: Record<string, SubscriptionPlan> = {
  // ... free plan ...
  
  dealer: {
    // ... other fields ...
    stripePriceId: 'price_1SaQJCKdXsQ61OHN50bRgcvP', // ✅ من Stripe Dashboard
  },
  
  dealer_annual: {
    // ... other fields ...
    stripePriceId: 'price_1SaQM6KdXsQ61OHNo98fp2eq', // ✅ من Stripe Dashboard
  },
  
  company: {
    // ... other fields ...
    stripePriceId: 'price_XXXXXXXXX', // ⏳ املأها من Step 3.2
  },
  
  company_annual: {
    // ... other fields ...
    stripePriceId: 'price_YYYYYYYYY', // ⏳ املأها من Step 3.2
  },
};
```

---

### **Step 5: Setup Webhook**

#### **5.1 Get Webhook URL**

بعد deploy الـ functions، الـ webhook URL سيكون:
```
https://europe-west1-fire-new-globul.cloudfunctions.net/stripeWebhook
```

#### **5.2 Configure في Stripe**

1. **الذهاب إلى:** https://dashboard.stripe.com/test/webhooks/create
2. **Endpoint URL:** أدخل الـ URL أعلاه
3. **Events to send:**
   - ✅ `checkout.session.completed`
   - ✅ `invoice.payment_succeeded`
   - ✅ `customer.subscription.deleted`
   - ✅ `customer.subscription.updated`
   - ✅ `invoice.payment_failed`
4. **Click "Add endpoint"**
5. **Copy Signing Secret:** `whsec_...`

#### **5.3 Add Webhook Secret**

```bash
firebase functions:config:set stripe.webhook_secret="whsec_..."
```

---

### **Step 6: Deploy Cloud Functions**

```bash
cd functions
npm install stripe@latest  # Install Stripe SDK
npm run build              # Build TypeScript
firebase deploy --only functions:createCheckoutSession,functions:stripeWebhook,functions:cancelSubscription
```

**⏱️ Time**: 3-5 minutes

---

### **Step 7: اختبار التكامل | Test Integration**

#### **7.1 Test Dealer Monthly (€29)**

1. **الذهاب إلى:** http://localhost:3000/billing
2. **اختر:** Dealer Plan → Monthly
3. **Click:** Subscribe
4. **Stripe Checkout opens:**
   - Use test card: `4242 4242 4242 4242`
   - Expiry: Any future date (12/26)
   - CVC: Any 3 digits (123)
   - ZIP: Any 5 digits (12345)
5. **Complete payment**
6. **Verify:**
   - Redirects to `/billing/success` ✅
   - Subscription shows in Firestore ✅
   - Webhook received in Stripe Dashboard ✅

#### **7.2 Test Dealer Annual (€300)**

Repeat above with **Annual** interval.

#### **7.3 Test Cancel**

1. **Click Cancel** on checkout
2. **Verify:** Redirects to `/billing/canceled` ✅

---

## 🔧 **Troubleshooting**

### **❌ "No Stripe Price ID configured"**

**السبب:** Price IDs في `config.ts` فارغة  
**الحل:** املأ Price IDs من Stripe Dashboard (Step 3)

---

### **❌ "Webhook signature verification failed"**

**السبب:** Webhook secret خاطئ  
**الحل:**
```bash
firebase functions:config:get  # Check current config
firebase functions:config:set stripe.webhook_secret="whsec_CORRECT_SECRET"
firebase deploy --only functions:stripeWebhook
```

---

### **❌ "Customer creation failed"**

**السبب:** User email ناقص  
**الحل:** تأكد من وجود `email` في Firestore `users` collection

---

## 💰 **التكاليف | Costs**

### **Stripe Fees (European Cards):**
```
Standard: 1.5% + €0.25 per successful charge
Non-EU cards: 2.5% + €0.25
```

### **Examples:**
```
€29 payment:
  - Stripe fee: €0.69
  - You receive: €28.31

€300 payment:
  - Stripe fee: €4.75
  - You receive: €295.25

€199 payment:
  - Stripe fee: €3.24
  - You receive: €195.76

€1,600 payment:
  - Stripe fee: €24.25
  - You receive: €1,575.75
```

---

## 📋 **Checklist**

```
[ ] Step 1: Stripe account created ✅
[ ] Step 2: API keys copied and configured ✅
[ ] Step 3: Products & Prices created
    [ ] Dealer Monthly (€29)
    [ ] Dealer Annual (€300)
    [ ] Company Monthly (€199)
    [ ] Company Annual (€1,600)
[ ] Step 4: Price IDs updated in config.ts
[ ] Step 5: Webhook configured
[ ] Step 6: Functions deployed
[ ] Step 7: Testing completed
    [ ] Test payment successful
    [ ] Test payment canceled
    [ ] Webhook received
    [ ] Subscription activated in Firestore
```

---

## 🚀 **Go Live (Production)**

عندما تكون جاهزًا للـ production:

1. **Switch to Live Mode:**
   - Dashboard → Toggle "Test mode" OFF
   
2. **Create Live Products:**
   - Repeat Step 3 in Live mode
   - Get new LIVE Price IDs (start with `price_live_...`)

3. **Update Live API Keys:**
   ```bash
   firebase functions:config:set stripe.secret_key="sk_live_..."
   ```

4. **Update Live Webhook:**
   - Create new webhook endpoint in Live mode
   - Use same URL
   - Get new webhook secret
   - Update config

5. **Deploy:**
   ```bash
   firebase deploy --only functions
   ```

---

## 📞 **الدعم | Support**

**Stripe Support:**
- Email: support@stripe.com
- Chat: https://dashboard.stripe.com/support

**Project Support:**
- Email: globul.net.m@gmail.com

---

**✅ After completing this guide, Stripe Integration will be 100% complete!**
