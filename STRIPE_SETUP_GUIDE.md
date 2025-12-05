# 🔥 Stripe Integration Setup Guide

**تاريخ الإنشاء**: 5 ديسمبر 2025  
**الوقت المطلوب**: 30-45 دقيقة  
**الصعوبة**: ⭐⭐ متوسط

---

## 🎯 ما تم إنجازه

✅ **إنشاء Cloud Function** (`functions/src/stripe-checkout.ts`)  
✅ **تحديث BillingService** مع Stripe integration  
✅ **إنشاء .env.example** مع Stripe keys  
✅ **إعداد Webhook handlers** للأحداث المهمة

---

## 📋 خطوات الإعداد

### 1️⃣ إنشاء حساب Stripe

1. اذهب إلى [stripe.com](https://stripe.com)
2. أنشئ حساب جديد أو سجل دخول
3. اختر "Test mode" للبداية

### 2️⃣ الحصول على API Keys

1. في Stripe Dashboard، اذهب إلى **Developers > API keys**
2. انسخ:
   - **Publishable key** (يبدأ بـ `pk_test_`)
   - **Secret key** (يبدأ بـ `sk_test_`)

### 3️⃣ إنشاء Products & Prices

في Stripe Dashboard:

#### أ) إنشاء Dealer Plan
```
Product Name: Globul Cars - Dealer Plan
Description: 15 cars monthly + 30 AI analyses
```

**Prices:**
- Monthly: €29.00 → Price ID: `price_dealer_monthly`
- Annual: €300.00 → Price ID: `price_dealer_annual`

#### ب) إنشاء Company Plan
```
Product Name: Globul Cars - Company Plan  
Description: Unlimited cars + unlimited AI
```

**Prices:**
- Monthly: €199.00 → Price ID: `price_company_monthly`
- Annual: €1600.00 → Price ID: `price_company_annual`

### 4️⃣ تحديث Environment Variables

إنشئ ملف `.env` في المجلد الرئيسي:

```bash
# Stripe Configuration
REACT_APP_STRIPE_PUBLIC_KEY=pk_test_your_publishable_key
STRIPE_SECRET_KEY=sk_test_your_secret_key
```

### 5️⃣ تحديث Firebase Functions Config

```bash
cd functions
firebase functions:config:set stripe.secret_key="sk_test_your_secret_key"
firebase functions:config:set stripe.webhook_secret="whsec_your_webhook_secret"
```

### 6️⃣ تحديث Price IDs في الكود

في `functions/src/stripe-checkout.ts`، استبدل:

```typescript
const PLAN_PRICES = {
  dealer: {
    monthly: 'price_1234567890', // ضع Price ID الحقيقي هنا
    annual: 'price_0987654321',  // ضع Price ID الحقيقي هنا
  },
  company: {
    monthly: 'price_abcdefghij', // ضع Price ID الحقيقي هنا
    annual: 'price_zyxwvutsrq',  // ضع Price ID الحقيقي هنا
  },
};
```

### 7️⃣ نشر Cloud Functions

```bash
cd functions
npm install stripe
npm run build
firebase deploy --only functions
```

### 8️⃣ إعداد Webhooks

1. في Stripe Dashboard، اذهب إلى **Developers > Webhooks**
2. اضغط **Add endpoint**
3. URL: `https://your-project.cloudfunctions.net/stripeWebhook`
4. اختر الأحداث التالية:
   - `checkout.session.completed`
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`

5. انسخ **Webhook secret** وأضفه للـ config:
```bash
firebase functions:config:set stripe.webhook_secret="whsec_your_webhook_secret"
```

---

## 🧪 اختبار التكامل

### 1. اختبار Checkout Session

```typescript
import { billingService } from './features/billing/BillingService';

// Test creating checkout session
const result = await billingService.createCheckoutSession(
  'user123',
  'dealer',
  'monthly'
);

console.log('Checkout URL:', result.url);
```

### 2. اختبار بطاقات Stripe التجريبية

استخدم هذه البطاقات للاختبار:

- **نجح الدفع**: `4242 4242 4242 4242`
- **فشل الدفع**: `4000 0000 0000 0002`
- **يتطلب 3D Secure**: `4000 0025 0000 3155`

**تفاصيل إضافية للاختبار:**
- Expiry: أي تاريخ مستقبلي (مثل 12/25)
- CVC: أي 3 أرقام (مثل 123)
- ZIP: أي رمز بريدي

### 3. اختبار Webhooks

1. استخدم [Stripe CLI](https://stripe.com/docs/stripe-cli) للاختبار المحلي:
```bash
stripe listen --forward-to localhost:5001/your-project/us-central1/stripeWebhook
```

2. أو استخدم [ngrok](https://ngrok.com/) لتعريض localhost:
```bash
ngrok http 5001
```

---

## 🔧 استكمال TODO Comments

الآن يمكنك إزالة هذه التعليقات من الكود:

### في `BillingService.ts`:

```typescript
// ✅ DONE - Line 125
// TODO: Call Cloud Function to create Stripe Checkout Session
// تم تطبيقه في createCheckoutSession()

// ⚠️ PARTIAL - Line 144  
// TODO: Cancel in Stripe
// تم تطبيق الإلغاء في Firestore، يحتاج تكامل مع Stripe API

// ⚠️ PENDING - Line 156
// TODO: Query invoices collection
// يحتاج إنشاء collection للفواتير

// ⚠️ PENDING - Line 165
// TODO: Update in Stripe  
// يحتاج تكامل مع Stripe Customer Portal
```

---

## 🚀 الخطوات التالية

### فوري (هذا الأسبوع):
1. ✅ إنشاء حساب Stripe
2. ✅ إعداد Products & Prices
3. ✅ تحديث Environment Variables
4. ✅ نشر Cloud Functions
5. ✅ إعداد Webhooks
6. ✅ اختبار الدفع التجريبي

### قريباً (الأسبوع القادم):
7. 🔄 إضافة Customer Portal للمستخدمين
8. 🔄 إنشاء Invoices collection
9. 🔄 تحسين error handling
10. 🔄 إضافة email notifications

### لاحقاً (بعد الإطلاق):
11. 🔄 تفعيل Live mode
12. 🔄 إضافة المزيد من طرق الدفع
13. 🔄 تحليلات الإيرادات
14. 🔄 خصومات وكوبونات

---

## 💡 نصائح مهمة

### الأمان:
- ❌ **لا تضع** Secret Keys في الكود أبداً
- ✅ **استخدم** Firebase Functions Config
- ✅ **تحقق من** Webhook signatures
- ✅ **استخدم** HTTPS فقط

### الاختبار:
- 🧪 **اختبر** جميع السيناريوهات (نجح، فشل، إلغاء)
- 📧 **تحقق من** الإيميلات التلقائية
- 🔄 **اختبر** Webhook events
- 💳 **جرب** بطاقات مختلفة

### الإنتاج:
- 🔴 **غيّر** إلى Live mode قبل الإطلاق
- 📊 **راقب** الدفعات والأخطاء
- 💰 **تحقق من** الضرائب والرسوم
- 📈 **تتبع** معدلات التحويل

---

## 🆘 استكشاف الأخطاء

### خطأ: "No such price"
**الحل**: تأكد من Price IDs في `PLAN_PRICES`

### خطأ: "Invalid API key"  
**الحل**: تحقق من Firebase Functions Config

### خطأ: "Webhook signature verification failed"
**الحل**: تأكد من Webhook Secret في Config

### خطأ: "Customer does not exist"
**الحل**: تحقق من إنشاء Customer في `createCheckoutSession`

---

## 📞 الدعم

- 📚 [Stripe Documentation](https://stripe.com/docs)
- 🔥 [Firebase Functions Guide](https://firebase.google.com/docs/functions)
- 💬 [Stripe Discord](https://discord.gg/stripe)
- 📧 Email: globul.net.m@gmail.com

---

**تم بواسطة**: Amazon Q Developer  
**آخر تحديث**: 5 ديسمبر 2025  
**الحالة**: ✅ جاهز للتطبيق 🚀