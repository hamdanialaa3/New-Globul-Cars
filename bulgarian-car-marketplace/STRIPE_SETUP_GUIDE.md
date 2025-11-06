# 💳 Stripe Payments Extension - دليل الإعداد الكامل

## 📋 الملخص

تم تثبيت إضافة `invertase/firestore-stripe-payments@0.3.12` في المشروع لإدارة:
- ✅ الدفعات لمرة واحدة (One-time payments)
- ✅ الاشتراكات الشهرية/السنوية (Subscriptions)
- ✅ بوابة العملاء (Customer Portal)
- ✅ التجديدات التلقائية (Auto-renewals)

---

## 🚀 الخطوات المكتملة

### ✅ 1. قواعد الأمان (Firestore Rules)

تم إضافة القواعد في `firestore.rules`:

```javascript
// Customer data - only owner can access
match /customers/{uid} {
  allow read: if isOwner(uid);
  
  match /checkout_sessions/{id} {
    allow read, write: if isOwner(uid);
  }
  
  match /subscriptions/{id} {
    allow read: if isOwner(uid);
  }
  
  match /payments/{id} {
    allow read: if isOwner(uid);
  }
}

// Products - public read, webhook-only write
match /products/{id} {
  allow read: if true;
  allow write: if false;
  
  match /prices/{id} {
    allow read: if true;
    allow write: if false;
  }
}
```

**نشر القواعد:**
```bash
firebase deploy --only firestore:rules
```

### ✅ 2. خدمة Stripe (Frontend Service)

تم إنشاء `src/services/stripe-service.ts` مع:
- `getProducts()` - جلب المنتجات والأسعار
- `createCheckoutSession()` - إنشاء جلسة دفع
- `getActiveSubscriptions()` - جلب الاشتراكات النشطة
- `redirectToCustomerPortal()` - توجيه لبوابة العملاء
- `hasSubscriptionRole()` - التحقق من الدور المخصص

---

## 📝 الخطوات المتبقية

### 1️⃣ إعداد Stripe Webhook (ضروري)

**أ. احصل على Webhook URL:**
```
https://europe-west1-fire-new-globul.cloudfunctions.net/ext-firestore-stripe-payments-handleWebhookEvents
```

**ب. في Stripe Dashboard:**
1. انتقل إلى: https://dashboard.stripe.com/webhooks
2. اضغط "Add endpoint"
3. ضع الـ URL أعلاه في "Endpoint URL"
4. اختر الأحداث التالية:

**أحداث المنتجات والأسعار:**
- `product.created`
- `product.updated`
- `product.deleted`
- `price.created`
- `price.updated`
- `price.deleted`

**أحداث الدفع والاشتراك:**
- `checkout.session.completed`
- `customer.subscription.created`
- `customer.subscription.updated`
- `customer.subscription.deleted`
- `payment_intent.processing`
- `payment_intent.succeeded`
- `payment_intent.canceled`
- `payment_intent.payment_failed`

**أحداث الفواتير (اختياري):**
- `invoice.paid`
- `invoice.payment_succeeded`
- `invoice.payment_failed`
- `invoice.upcoming`

**ج. احفظ Webhook Secret:**
1. بعد إنشاء الويبهوك، انسخ "Signing secret" (يبدأ بـ `whsec_...`)
2. في Firebase Console > Extensions > firestore-stripe-payments
3. اضغط "Reconfigure" وضع القيمة في `Stripe webhook secret`
4. **لا تنسَ الضغط Save في أعلى الصفحة!**

---

### 2️⃣ إنشاء المنتجات والأسعار

**في Stripe Dashboard > Products:**

#### منتج 1: Private Premium
```
Name: Private Premium
Description: خطة مميزة للأفراد
Metadata:
  firebaseRole: premium
  profileType: private

Price 1:
  Amount: 9.99 BGN
  Billing: Monthly
  
Price 2:
  Amount: 99.99 BGN
  Billing: Yearly
  Trial: 7 days
```

#### منتج 2: Dealer Pro
```
Name: Dealer Pro
Description: خطة احترافية للتجار
Metadata:
  firebaseRole: dealer_pro
  profileType: dealer

Price 1:
  Amount: 49.99 BGN
  Billing: Monthly
  
Price 2:
  Amount: 499.99 BGN
  Billing: Yearly
```

#### منتج 3: Company Enterprise
```
Name: Company Enterprise
Description: خطة متقدمة للشركات
Metadata:
  firebaseRole: company_enterprise
  profileType: company

Price 1:
  Amount: 199.99 BGN
  Billing: Monthly
  
Price 2:
  Amount: 1999.99 BGN
  Billing: Yearly
```

**بعد الإنشاء:** الإضافة ستزامن المنتجات تلقائياً إلى Firestore collection: `products`

---

### 3️⃣ إعداد Customer Portal

**في Stripe Dashboard > Settings > Customer portal:**

1. **Branding:**
   - Logo: رفع شعار Globul Cars
   - Accent color: #FF8F10
   - Privacy policy: https://globulcars.com/privacy
   - Terms of service: https://globulcars.com/terms

2. **Functionality:**
   - ✅ Allow customers to update payment methods
   - ✅ Allow customers to update subscriptions
   - ✅ Allow customers to cancel subscriptions
   - أضف جميع المنتجات التي يمكن التبديل بينها

3. **Business information:**
   - Business name: Globul Cars
   - Email: support@globulcars.com

**حفظ الإعدادات**

---

### 4️⃣ إضافة متغيرات البيئة

**في `bulgarian-car-marketplace/.env`:**

```env
# Stripe Publishable Key (للواجهة الأمامية)
REACT_APP_STRIPE_PUBLISHABLE_KEY=pk_test_xxxxxxxxxxxxx

# Optional: للتطوير المحلي
REACT_APP_STRIPE_CUSTOMER_PORTAL_URL=https://billing.stripe.com/p/login/test_xxxxx
```

**الحصول على المفتاح:**
1. Stripe Dashboard > Developers > API keys
2. انسخ "Publishable key" (يبدأ بـ `pk_test_` أو `pk_live_`)

**إعادة تشغيل Dev Server:**
```bash
cd bulgarian-car-marketplace
npm start
```

---

### 5️⃣ تحديث BillingPage (مثال الاستخدام)

**في `src/features/billing/BillingPage.tsx`:**

```typescript
import { useEffect, useState } from 'react';
import StripeService, { StripeProduct, StripeSubscription } from '@/services/stripe-service';

export const BillingPage = () => {
  const [products, setProducts] = useState<StripeProduct[]>([]);
  const [subscription, setSubscription] = useState<StripeSubscription | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Load products
    StripeService.getProducts().then(setProducts);
    
    // Listen to subscriptions
    const unsubscribe = StripeService.subscribeToSubscriptions((subs) => {
      setSubscription(subs[0] || null);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const handleSubscribe = async (priceId: string) => {
    const unsubscribe = await StripeService.createCheckoutSession(
      {
        price: priceId,
        success_url: `${window.location.origin}/billing/success`,
        cancel_url: `${window.location.origin}/billing`,
        allow_promotion_codes: true,
      },
      (url) => {
        window.location.assign(url); // Redirect to Stripe Checkout
      },
      (error) => {
        alert(`خطأ: ${error}`);
      }
    );

    // Cleanup listener after redirect (optional)
    // unsubscribe();
  };

  const handleManageSubscription = async () => {
    await StripeService.redirectToCustomerPortal();
  };

  if (loading) return <div>جاري التحميل...</div>;

  return (
    <div>
      <h1>الباقات</h1>
      
      {subscription ? (
        <div>
          <h2>اشتراكك النشط</h2>
          <p>الباقة: {subscription.product}</p>
          <p>الحالة: {subscription.status}</p>
          <button onClick={handleManageSubscription}>
            إدارة الاشتراك
          </button>
        </div>
      ) : (
        <div>
          <h2>اختر باقتك</h2>
          {products.map(product => (
            <div key={product.id}>
              <h3>{product.name}</h3>
              <p>{product.description}</p>
              {product.prices?.map(price => (
                <button 
                  key={price.id}
                  onClick={() => handleSubscribe(price.id)}
                >
                  {price.unit_amount / 100} {price.currency.toUpperCase()} / {price.interval}
                </button>
              ))}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
```

---

## 🔒 Custom Claims للتحكم بالوصول

**مثال في Firestore Rules:**

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    function hasPremiumAccess() {
      return request.auth.token.stripeRole in ['premium', 'dealer_pro', 'company_enterprise'];
    }

    match /premium_content/{doc} {
      allow read: if hasPremiumAccess();
    }
  }
}
```

**مثال في الواجهة الأمامية:**

```typescript
const hasAccess = await StripeService.hasSubscriptionRole('premium');

if (hasAccess) {
  // عرض المحتوى المميز
} else {
  // توجيه لصفحة الاشتراك
}
```

---

## 🧪 الاختبار

### اختبار بطاقة تجريبية:

```
Card number: 4242 4242 4242 4242
Expiry: أي تاريخ مستقبلي
CVC: أي 3 أرقام
ZIP: أي رمز بريدي
```

### سيناريوهات الاختبار:

1. **اشتراك جديد:**
   - اضغط "Subscribe" على باقة
   - أدخل بطاقة تجريبية
   - تحقق من إنشاء `customers/{uid}/subscriptions/{id}`

2. **Customer Portal:**
   - اضغط "Manage Subscription"
   - تحقق من فتح بوابة Stripe
   - جرّب تغيير الباقة أو إلغاء الاشتراك

3. **Custom Claims:**
   - افتح Console > Authentication > Users
   - افحص Token للمستخدم
   - تحقق من وجود `stripeRole: "premium"`

---

## 📊 مراقبة البيانات

### في Firestore Console:

```
/customers/{userId}
  /checkout_sessions/{sessionId}  - جلسات الدفع
  /subscriptions/{subId}           - الاشتراكات
  /payments/{paymentId}            - السجلات المالية

/products/{productId}
  /prices/{priceId}                - الأسعار
  /tax_rates/{rateId}              - معدلات الضريبة
```

### في Firebase Functions Logs:

```bash
firebase functions:log --only ext-firestore-stripe-payments
```

---

## ⚠️ نقاط مهمة

1. **لا تنسَ نشر Firestore Rules:**
   ```bash
   firebase deploy --only firestore:rules
   ```

2. **استخدم Test Mode أولاً:**
   - جميع المفاتيح بـ `test_` قبل الإنتاج
   - انتقل لـ `live_` بعد التحقق الكامل

3. **Webhook Secret مهم:**
   - بدونه، لن تُزامن المنتجات من Stripe

4. **Customer Portal يحتاج إعداد:**
   - بدونه، لن يستطيع المستخدمون إدارة اشتراكاتهم

5. **Custom Claims تحتاج Refresh:**
   - استخدم `getIdToken(true)` لإجبار تحديث التوكن

---

## 🎯 الخطوات التالية الموصى بها

1. ✅ نشر Firestore Rules
2. ✅ إعداد Stripe Webhook
3. ✅ إنشاء 3 منتجات (Private/Dealer/Company)
4. ✅ إعداد Customer Portal
5. ✅ إضافة Publishable Key في `.env`
6. ⏳ تحديث `features/billing/BillingPage.tsx`
7. ⏳ اختبار Checkout Flow بالكامل
8. ⏳ اختبار Customer Portal
9. ⏳ التحقق من Custom Claims
10. ⏳ الانتقال لـ Live Mode

---

## 📚 المراجع

- [Stripe Extension Docs](https://github.com/invertase/firestore-stripe-payments)
- [Stripe Dashboard](https://dashboard.stripe.com)
- [Firebase Console](https://console.firebase.google.com)
- [Stripe Testing Cards](https://stripe.com/docs/testing)

---

**تم الإعداد بواسطة:** GitHub Copilot  
**التاريخ:** 6 نوفمبر 2025  
**الحالة:** جاهز للتثبيت والاختبار 🚀
