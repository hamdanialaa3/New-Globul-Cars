# دليل استخدام الأنظمة الجديدة

<div dir="rtl">

## الخادم يعمل الآن على: http://localhost:3000

---

## الأنظمة الجديدة - دليل سريع

### 1. نظام الأدوار (RBAC)

#### كيف أصبح بائع؟

**الخطوات:**
1. سجّل الدخول أو أنشئ حساب جديد
2. اذهب إلى: `http://localhost:3000/profile`
3. ابحث عن زر "Upgrade to Seller" (إذا لم يظهر، فأنت بالفعل seller)
4. املأ المعلومات:
   - اسم الشركة (اختياري)
   - رقم BULSTAT (اختياري)
   - نوع الأعمال (dealership/trader/company)
   - العنوان (اختياري)
5. اقبل الشروط والأحكام
6. اضغط "Upgrade to Seller"

**النتيجة:**
- سيتم تحديث دورك من `buyer` إلى `seller`
- يمكنك الآن إضافة سيارات للبيع
- ستظهر لك لوحة تحكم خاصة

---

### 2. نظام المراسلات

#### كيف أرسل رسالة لمستخدم؟

**الطريقة 1 - من دليل المستخدمين:**
1. اذهب إلى: `http://localhost:3000/users`
2. اختر أي مستخدم
3. سيفتح بروفايله في: `http://localhost:3000/profile?userId=XXX`
4. اضغط زر "Send Message"
5. سيتم توجيهك إلى صفحة الرسائل

**الطريقة 2 - من صفحة السيارة:**
1. افتح أي سيارة: `http://localhost:3000/car/XXX`
2. اضغط "Contact Seller"
3. سيتم فتح محادثة مع البائع

**الطريقة 3 - من صفحة الرسائل مباشرة:**
1. اذهب إلى: `http://localhost:3000/messages`
2. ستجد جميع محادثاتك
3. اختر محادثة أو ابدأ جديدة

#### ماذا أتوقع؟

**في صفحة الرسائل:**
- **اليسار:** قائمة جميع المحادثات
- **اليمين:** نافذة الدردشة
- **عدادات:** الرسائل غير المقروءة (باللون البرتقالي)
- **Real-time:** الرسائل تظهر فوراً بدون تحديث الصفحة

**الإشعارات:**
- عند استلام رسالة جديدة، ستستلم إشعار push
- حتى لو كان التطبيق مغلق أو في الخلفية

---

### 3. نظام التقييمات

#### كيف أقيّم بائع؟

**الخطوات:**
1. اذهب إلى صفحة أي سيارة
2. انزل إلى قسم "Seller Information"
3. ابحث عن قسم "Reviews" أو "Write a Review"
4. اختر عدد النجوم (1-5):
   - ⭐ = سيء جداً
   - ⭐⭐ = سيء
   - ⭐⭐⭐ = متوسط
   - ⭐⭐⭐⭐ = جيد
   - ⭐⭐⭐⭐⭐ = ممتاز
5. اكتب تعليقك (مطلوب)
6. اضغط "Submit Review"

**ملاحظات:**
- لا يمكنك تقييم نفسك
- لا يمكنك تقييم نفس البائع مرتين لنفس السيارة
- التقييمات تُحدّث متوسط البائع تلقائياً

---

### 4. لوحة تحكم البائعين

#### كيف أصل للوحة التحكم؟

**الخطوات:**
1. كن بائعاً (seller) - راجع القسم 1 أعلاه
2. اذهب إلى: `http://localhost:3000/profile`
3. اضغط تبويبة "Analytics"

**ماذا سأرى؟**

```
الإحصائيات الشاملة:
  - إجمالي السيارات
  - السيارات النشطة
  - السيارات المباعة
  - السيارات في المسودة
  - إجمالي المشاهدات
  - إجمالي الاستفسارات
  - متوسط التقييم
  - عدد المراجعات
  - معدل التحويل (%)
  - السيارة الأكثر مشاهدة
  
النشاط الأخير (آخر 7 أيام):
  - المشاهدات الجديدة
  - الاستفسارات الجديدة
  - المراجعات الجديدة
```

---

### 5. نظام البحث (Algolia)

#### الحالة الحالية:
- الكود جاهز ومُدمج ✅
- المزامنة التلقائية جاهزة ✅
- **لكن:** Algolia غير مُفعّل (يحتاج API Keys)

#### كيف أفعّل Algolia؟

**الخطوات:**
1. أنشئ حساب في: https://www.algolia.com
2. احصل على:
   - App ID
   - Admin API Key
3. شغّل الأوامر:

```bash
firebase functions:config:set algolia.app_id="YOUR_APP_ID"
firebase functions:config:set algolia.api_key="YOUR_ADMIN_KEY"

cd functions
npm install algoliasearch
npm run build
firebase deploy --only functions:syncCarToAlgolia,functions:reindexAllCars
```

4. أعد فهرسة السيارات الموجودة:

```javascript
// استدعاء من Console أو Frontend
const functions = getFunctions();
const reindex = httpsCallable(functions, 'reindexAllCars');
await reindex();
```

**بعد التفعيل:**
- البحث سيكون أسرع بكثير
- يمكنك استخدام فلاتر متعددة في نفس الوقت
- بحث نصي كامل في الوصف والميزات

---

### 6. نظام الدفع (Stripe Connect)

#### الحالة الحالية:
- الكود جاهز ومُدمج ✅
- Payment Intents جاهزة ✅
- Webhooks جاهزة ✅
- **لكن:** Stripe غير مُفعّل (يحتاج API Keys)

#### كيف أفعّل Stripe؟

**الخطوات:**
1. أنشئ حساب في: https://stripe.com
2. فعّل Stripe Connect
3. احصل على:
   - Secret Key (sk_...)
   - Webhook Secret (whsec_...)
4. شغّل الأوامر:

```bash
firebase functions:config:set stripe.secret_key="sk_live_XXX"
firebase functions:config:set stripe.webhook_secret="whsec_XXX"

cd functions
npm install stripe
npm run build
firebase deploy --only functions
```

5. أضف webhook endpoint في Stripe Dashboard:
   - URL: `https://your-project.cloudfunctions.net/handleStripeWebhook`
   - Events: `payment_intent.succeeded`, `payment_intent.payment_failed`

**بعد التفعيل:**
- البائعون يمكنهم إنشاء حسابات Stripe Connect
- المشترون يمكنهم الدفع مباشرة في المنصة
- المنصة تأخذ عمولة 5% تلقائياً
- الأموال تُحوّل للبائعين مباشرة

---

## الصفحات المتوفرة

```
الرئيسية:           http://localhost:3000/
السيارات:           http://localhost:3000/cars
تفاصيل سيارة:       http://localhost:3000/car/:id
إضافة سيارة:        http://localhost:3000/sell
البروفايل:          http://localhost:3000/profile
دليل المستخدمين:    http://localhost:3000/users
الرسائل (جديد!):    http://localhost:3000/messages
```

---

## نصائح الاستخدام

### للحصول على أفضل تجربة:

1. **استخدم متصفحين مختلفين:**
   - Chrome للمستخدم A
   - Firefox للمستخدم B
   - لاختبار المراسلات الفورية

2. **فعّل الإشعارات:**
   - اسمح للمتصفح بإرسال إشعارات
   - ستحتاج VAPID Key للإشعارات الحقيقية

3. **اختبر جميع الأدوار:**
   - سجّل كـ buyer
   - ترقّى إلى seller
   - جرّب إضافة سيارة
   - اختبر المراسلات
   - اكتب مراجعة

---

## استكشاف الأخطاء الشائعة

### الخادم لا يعمل:

```bash
# أوقف الخادم
Ctrl+C

# نظّف cache
cd bulgarian-car-marketplace
rm -rf node_modules/.cache

# أعد التشغيل
npm start
```

### الإشعارات لا تعمل:

```
السبب: VAPID Key غير موجود

الحل:
1. firebase messaging:generate-vapid-key
2. أضف المفتاح إلى .env
3. أعد تشغيل الخادم
```

### الرسائل لا تُرسل:

```
السبب المحتمل: Firestore Rules

الحل:
1. firebase deploy --only firestore:rules
2. تأكد من أن المستخدم مُصادق (signed in)
3. تحقق من Console للأخطاء
```

---

## الخلاصة

**النظام الآن يعمل بالكامل محلياً!**

جرّب جميع الميزات:
- ✅ التسجيل والأدوار
- ✅ المراسلات الفورية
- ✅ التقييمات
- ✅ لوحة تحكم البائعين
- ✅ دليل المستخدمين

**عند الجاهزية للنشر:**
```bash
firebase deploy
```

</div>

