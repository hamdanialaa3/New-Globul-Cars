# 🔢 دليل تشغيل الهجرة للمعرفات الرقمية
# Numeric ID Migration Guide

## المشكلة / Problem

عند الذهاب إلى صفحة البروفايل، جميع المستخدمين يظهرون على نفس الرابط:
```
http://localhost:3000/profile
```

When going to profile page, all users show on same URL:
```
http://localhost:3000/profile
```

## السبب / Reason

النظام الجديد للمعرفات الرقمية موجود في الكود، لكن المستخدمين الحاليين في قاعدة البيانات لا يملكون `numericId` بعد.

The new numeric ID system exists in code, but existing users in database don't have `numericId` yet.

## الحل / Solution

تشغيل سكربتات الهجرة لإضافة `numericId` لجميع المستخدمين والسيارات الموجودة.

Run migration scripts to add `numericId` to all existing users and cars.

---

## خطوات التشغيل / Steps to Run

### الطريقة السريعة / Quick Method

شغل الملف التنفيذي:
```bash
run-migration.bat
```

سيقوم تلقائياً بـ:
1. التحقق من تسجيل الدخول لـ Firebase
2. تثبيت المكتبات المطلوبة
3. تشغيل هجرة المستخدمين
4. تشغيل هجرة السيارات

It will automatically:
1. Check Firebase CLI login
2. Install required packages
3. Run users migration
4. Run cars migration

---

### الطريقة اليدوية / Manual Method

#### الخطوة 1: تسجيل الدخول لـ Firebase
```bash
firebase login
```

#### الخطوة 2: تثبيت firebase-admin (إذا لم يكن مثبتاً)
```bash
cd functions
npm install firebase-admin
cd ..
```

#### الخطوة 3: تشغيل هجرة المستخدمين (أولاً!)
```bash
node scripts/migration/assign-numeric-ids-users-cli.js
```

**مهم**: يجب تشغيل هجرة المستخدمين أولاً!

**Important**: Must run users migration first!

#### الخطوة 4: تشغيل هجرة السيارات (ثانياً)
```bash
node scripts/migration/assign-numeric-ids-cars-cli.js
```

---

## بعد الهجرة / After Migration

### 1. أعد تشغيل الخادم المحلي
```bash
cd bulgarian-car-marketplace
npm start
```

### 2. اذهب إلى صفحة البروفايل
```
http://localhost:3000/profile
```

### 3. يجب أن يتم توجيهك تلقائياً إلى
```
http://localhost:3000/profile/1
```
أو
```
http://localhost:3000/profile/2
```

حسب ترتيب المستخدمين في قاعدة البيانات.

Depending on user order in database.

---

## النتائج المتوقعة / Expected Results

### قبل الهجرة / Before Migration:
```
✅ /profile                     → يعمل (لكن نفس الرابط للجميع)
❌ /profile/1                   → 404 Not Found
❌ /profile/1/1                 → 404 Not Found
```

### بعد الهجرة / After Migration:
```
✅ /profile                     → يحول تلقائياً إلى /profile/{numericId}
✅ /profile/1                   → بروفايل المستخدم رقم 1
✅ /profile/2                   → بروفايل المستخدم رقم 2
✅ /profile/1/1                 → سيارة رقم 1 للمستخدم رقم 1
✅ /profile/2/3                 → سيارة رقم 3 للمستخدم رقم 2
✅ /profile/{firebaseUID}       → يحول تلقائياً إلى /profile/{numericId}
```

---

## استكشاف الأخطاء / Troubleshooting

### خطأ: "User must login to Firebase CLI first"
**الحل**: شغل `firebase login` في الترمينال

**Solution**: Run `firebase login` in terminal

---

### خطأ: "firebase-admin not installed"
**الحل**: 
```bash
cd functions
npm install firebase-admin
cd ..
```

---

### خطأ: "seller doesn't have numericId yet"
**السبب**: تشغيل هجرة السيارات قبل هجرة المستخدمين

**الحل**: شغل هجرة المستخدمين أولاً:
```bash
node scripts/migration/assign-numeric-ids-users-cli.js
```

ثم شغل هجرة السيارات:
```bash
node scripts/migration/assign-numeric-ids-cars-cli.js
```

**Reason**: Running cars migration before users migration

**Solution**: Run users migration first, then cars

---

### الصفحة لا تزال تظهر /profile بدون رقم

**الحل**:
1. تأكد من اكتمال الهجرة بنجاح (تحقق من رسائل النجاح في الكونسول)
2. أعد تشغيل الخادم المحلي
3. امسح الكاش في المتصفح (Ctrl + Shift + R)
4. تحقق من قاعدة البيانات في Firebase Console أن المستخدم عنده `numericId`

**Solution**:
1. Ensure migration completed successfully (check console success messages)
2. Restart local server
3. Clear browser cache (Ctrl + Shift + R)
4. Check Firebase Console that user has `numericId`

---

## التحقق من البيانات / Verify Data

### في Firebase Console:
1. اذهب إلى: https://console.firebase.google.com/
2. اختر المشروع: `fire-new-globul`
3. Firestore Database → `users` collection
4. افتح أي مستخدم
5. تحقق من وجود حقل `numericId`

### في الكونسول:
```javascript
// في صفحة المتصفح، افتح Console (F12)
// In browser page, open Console (F12)

// اطبع معلومات المستخدم الحالي
// Print current user info
const user = firebase.auth().currentUser;
const db = firebase.firestore();
db.collection('users').doc(user.uid).get().then(doc => {
  console.log('User data:', doc.data());
  console.log('Numeric ID:', doc.data().numericId);
});
```

---

## معلومات إضافية / Additional Info

### ملفات السكربتات / Script Files:
- `scripts/migration/assign-numeric-ids-users-cli.js` - هجرة المستخدمين
- `scripts/migration/assign-numeric-ids-cars-cli.js` - هجرة السيارات
- `run-migration.bat` - ملف تشغيل تلقائي

### ملفات النظام / System Files:
- `src/routes/NumericProfileRouter.tsx` - نظام التوجيه
- `src/services/numeric-id-lookup.service.ts` - خدمة البحث
- `src/services/numeric-id-counter.service.ts` - خدمة العد
- `src/hooks/useProfilePermissions.ts` - خطافات الصلاحيات

### الوثائق / Documentation:
- `NUMERIC_ID_SYSTEM_COMPLETE_GUIDE.md` - الدليل الكامل (إنجليزي)
- `NUMERIC_ID_DEPLOYMENT_GUIDE_AR.md` - دليل النشر (عربي)
- `DEPLOYMENT_NUMERIC_ID_CHECKLIST.md` - قائمة التحقق
- `NUMERIC_ID_SYSTEM_README.md` - ملف README

---

## الدعم / Support

إذا واجهت أي مشاكل، تحقق من:
1. رسائل الخطأ في الكونسول
2. Firebase Console للتأكد من البيانات
3. الوثائق الكاملة في المشروع

If you face any issues, check:
1. Error messages in console
2. Firebase Console to verify data
3. Complete documentation in project

---

**تم الإنشاء**: 15 ديسمبر 2025  
**Created**: December 15, 2025

**الإصدار**: 1.0.0  
**Version**: 1.0.0
