# أوامر النشر - جاهز للإنتاج

<div dir="rtl">

## خطوات النشر الكامل

### 1. نشر Cloud Functions

```bash
cd functions
npm install
npm run build
firebase deploy --only functions
```

**الوظائف التي سيتم نشرها:**
- setDefaultUserRole
- handleTokenRefresh
- upgradeToSeller
- checkSellerEligibility
- setUserRole
- getUserClaims
- listUsersWithRoles
- sendMessageNotification
- updateMessageReadStatus
- aggregateSellerRating
- validateReview
- getSellerMetrics

**الوقت المتوقع:** 5-10 دقائق

---

### 2. نشر Firestore Rules

```bash
firebase deploy --only firestore:rules
```

**الوقت المتوقع:** 1-2 دقيقة

---

### 3. نشر Frontend

```bash
cd bulgarian-car-marketplace
npm install
npm run build
firebase deploy --only hosting
```

**الوقت المتوقع:** 3-5 دقائق

---

## إذا كنت تريد النشر بالكامل دفعة واحدة:

```bash
# من المجلد الرئيسي للمشروع
firebase deploy
```

**الوقت المتوقع:** 10-15 دقيقة

---

## التحقق من النشر

### 1. تحقق من Cloud Functions:

```bash
firebase functions:log
```

**يجب أن ترى:**
- Functions deployed successfully
- لا أخطاء في السجلات

### 2. تحقق من Firestore Rules:

```bash
firebase firestore:rules get
```

**يجب أن ترى:**
- القواعد المحدّثة بـ Custom Claims

### 3. تحقق من الموقع:

افتح: `https://mobilebg.eu` أو `https://your-project.web.app`

**يجب أن ترى:**
- الموقع يعمل بشكل طبيعي
- صفحة /messages تعمل
- صفحة /users تعمل
- صفحة /profile تعمل

---

## الإعدادات المطلوبة (قبل النشر)

### 1. إعداد VAPID Key للإشعارات:

```bash
firebase messaging:generate-vapid-key
```

**انسخ المفتاح وضعه في:**
1. `bulgarian-car-marketplace/.env`:
   ```
   REACT_APP_FIREBASE_VAPID_KEY=your-vapid-key-here
   ```

2. `bulgarian-car-marketplace/public/firebase-messaging-sw.js`:
   ```javascript
   // Already configured with project settings
   ```

### 2. إعداد Algolia (اختياري):

إذا أردت تفعيل البحث المتقدم:

```bash
firebase functions:config:set \
  algolia.app_id="YOUR_ALGOLIA_APP_ID" \
  algolia.api_key="YOUR_ALGOLIA_ADMIN_KEY"
```

### 3. إعداد Stripe (اختياري):

إذا أردت تفعيل المدفوعات:

```bash
firebase functions:config:set \
  stripe.secret_key="YOUR_STRIPE_SECRET_KEY" \
  stripe.webhook_secret="YOUR_STRIPE_WEBHOOK_SECRET"
```

---

## اختبار ما بعد النشر

### 1. اختبار التسجيل:

```
1. سجّل مستخدم جديد
2. تحقق من Firebase Console > Authentication
3. تحقق من Firestore > users
4. تأكد من: role: 'buyer'
```

### 2. اختبار الترقية إلى Seller:

```
1. سجّل الدخول كمستخدم
2. اذهب إلى Profile
3. اضغط "Upgrade to Seller"
4. أدخل المعلومات
5. اقبل الشروط
6. اضغط "Upgrade"
7. تحقق من: role: 'seller' في Firebase Console
```

### 3. اختبار المراسلات:

```
1. سجّل دخول مستخدم A
2. اذهب إلى /users
3. اختر مستخدم B
4. اضغط "Send Message"
5. اكتب رسالة
6. سجّل دخول مستخدم B (جهاز آخر)
7. تحقق من استلام الإشعار
```

### 4. اختبار التقييمات:

```
1. سجّل دخول كمشتري
2. اذهب إلى صفحة سيارة
3. اضغط "Leave Review"
4. قيّم البائع
5. اكتب تعليق
6. اضغط "Submit"
7. تحقق من تحديث التقييم في بروفايل البائع
```

---

## استكشاف الأخطاء

### إذا لم تعمل Cloud Functions:

```bash
# تحقق من السجلات
firebase functions:log --only setDefaultUserRole

# تحقق من الحالة
firebase functions:list
```

### إذا لم تعمل الإشعارات:

```
1. تحقق من VAPID Key في .env
2. تحقق من firebase-messaging-sw.js
3. تحقق من إذن المتصفح للإشعارات
4. تحقق من Service Worker في DevTools
```

### إذا لم تعمل المراسلات:

```
1. تحقق من Firestore Rules
2. تحقق من Firebase Console > Firestore > conversations
3. تحقق من Console Logs في المتصفح
```

---

## الأوامر المفيدة

### عرض السجلات المباشرة:

```bash
firebase functions:log --follow
```

### عرض استخدام الموارد:

```bash
firebase functions:list
```

### حذف جميع البيانات التجريبية:

```bash
# احذر! هذا سيحذف جميع البيانات
firebase firestore:delete --all-collections
```

---

## الدعم والمساعدة

### روابط مفيدة:

- Firebase Console: https://console.firebase.google.com
- Firestore Data: https://console.firebase.google.com/project/fire-new-globul/firestore
- Functions: https://console.firebase.google.com/project/fire-new-globul/functions
- Authentication: https://console.firebase.google.com/project/fire-new-globul/authentication

### الملفات المرجعية:

- التوثيق الشامل: `COMPLETE_SYSTEM_IMPLEMENTATION_OCT_17.md`
- دليل البدء: `QUICK_START_NEW_FEATURES.md`
- خطة الخروج: `خطة البروفايل .md`

---

**جاهز للنشر!**

</div>

