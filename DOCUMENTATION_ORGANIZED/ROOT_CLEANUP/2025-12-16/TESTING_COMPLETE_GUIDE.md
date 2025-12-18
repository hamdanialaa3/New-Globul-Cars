# 🧪 دليل الاختبار الشامل
# Complete Testing Guide - New Globul Cars

**آخر تحديث:** 11 ديسمبر 2025  
**الحالة:** ✅ جاهز للاستخدام  
**النطاق:** جميع الميزات والأنظمة

---

## 📚 جدول المحتويات

1. [نظرة عامة](#overview)
2. [أنواع الاختبار](#test-types)
3. [الاختبار السريع (15 دقيقة)](#quick-test)
4. [الاختبار الشامل (60 دقيقة)](#comprehensive-test)
5. [اختبار الميزات الرئيسية](#feature-testing)
6. [اختبار ماركات السيارات](#car-brands-testing)
7. [اختبار الأداء](#performance-testing)
8. [تقارير الأخطاء](#bug-reporting)
9. [سكريبتات الاختبار التلقائي](#automated-testing)

---

## 🎯 نظرة عامة | Overview {#overview}

### الهدف
التحقق من أن جميع الميزات المدمجة تعمل بشكل صحيح في بيئة Production.

### البيئات
- **Development**: `http://localhost:3000`
- **Production**: `https://new-globul-cars.web.app`

### الميزات المراد اختبارها (40+ Test Cases)
1. ✏️ **Car Edit Feature** (6 tests)
2. 🗑️ **Car Delete Feature** (6 tests)
3. 🔔 **Firebase Notifications** (7 tests)
4. 🔍 **Firestore Search Optimization** (3 tests)
5. 📝 **Logger Service** (3 tests)
6. 🎨 **UX Improvements** (4 tests)
7. 📱 **Mobile Responsiveness** (3 tests)
8. 🔒 **Security & Permissions** (3 tests)
9. ⚡ **Performance Metrics** (3 tests)
10. 🌐 **Internationalization** (3 tests)

---

## 🏃 أنواع الاختبار | Test Types {#test-types}

### 1️⃣ الاختبار السريع (Quick Test) - 15 دقيقة
**متى تستخدمه:**
- قبل كل commit
- بعد تغييرات صغيرة
- للتحقق السريع

**الميزات المُختبرة:**
- ✅ Car Edit (5 min)
- ✅ Car Delete (5 min)
- ✅ Search (3 min)
- ✅ Logger Service (2 min)

---

### 2️⃣ الاختبار الشامل (Comprehensive Test) - 45 دقيقة
**متى تستخدمه:**
- قبل merge إلى main
- قبل deployment إلى production
- بعد تغييرات كبيرة

**الميزات المُختبرة:**
- ✅ جميع الـ40 test case
- ✅ Mobile + Desktop
- ✅ Bulgarian + English
- ✅ All profile types

---

### 3️⃣ الاختبار الكامل (Full Test) - 60+ دقيقة
**متى تستخدمه:**
- قبل إطلاق production
- Weekly testing
- After major releases

**الميزات المُختبرة:**
- ✅ جميع الميزات
- ✅ Performance testing
- ✅ Security testing
- ✅ Stress testing
- ✅ Cross-browser testing

---

## ⚡ الاختبار السريع | Quick Test (15 دقيقة) {#quick-test}

### الإعداد
1. افتح `http://localhost:3000`
2. افتح Console (F12)
3. سجل دخول بحساب Dealer أو Company

---

### ✏️ Test 1: Car Edit (5 دقائق)

#### TC-Q1: عرض زر التعديل
```
✅ الخطوات:
1. اذهب إلى صفحة تفاصيل سيارة تملكها
2. ابحث عن زر "تعديل" أو "Edit"

✅ المتوقع:
- الزر ظاهر بوضوح
- الزر نشط (not disabled)
- الأيقونة صحيحة (✏️ أو 🔧)

⏱️ الوقت: 30 ثانية
```

#### TC-Q2: فتح وضع التعديل
```
✅ الخطوات:
1. اضغط زر "تعديل"

✅ المتوقع:
- النموذج يتحول إلى edit mode
- الحقول قابلة للتحرير
- زر "حفظ" و"إلغاء" ظاهران

⏱️ الوقت: 1 دقيقة
```

#### TC-Q3: حفظ التعديلات
```
✅ الخطوات:
1. عدّل: السعر (Price)
2. عدّل: الوصف (Description)
3. اضغط "حفظ"

✅ المتوقع:
- Loading spinner يظهر
- Success message: "تم تحديث المعلومات بنجاح"
- البيانات محدثة في الصفحة
- Firestore محدثة (تحقق من Console)

⏱️ الوقت: 2 دقيقة
```

#### TC-Q4: إلغاء التعديلات
```
✅ الخطوات:
1. عدّل أي حقل
2. اضغط "إلغاء"

✅ المتوقع:
- التعديلات لا تُحفظ
- الصفحة تعود إلى view mode
- البيانات الأصلية ظاهرة

⏱️ الوقت: 1 دقيقة
```

---

### 🗑️ Test 2: Car Delete (5 دقائق)

#### TC-Q5: عرض زر الحذف
```
✅ الخطوات:
1. اذهب إلى صفحة تفاصيل سيارة تملكها

✅ المتوقع:
- زر "حذف" ظاهر
- لون الزر أحمر (تحذيري)
- الأيقونة صحيحة (🗑️)

⏱️ الوقت: 30 ثانية
```

#### TC-Q6: فتح Dialog التأكيد
```
✅ الخطوات:
1. اضغط زر "حذف"

✅ المتوقع:
- Dialog التأكيد يفتح
- رسالة واضحة: "هل أنت متأكد من حذف هذه السيارة؟"
- زران: "نعم، احذف" و "إلغاء"

⏱️ الوقت: 1 دقيقة
```

#### TC-Q7: تأكيد الحذف
```
✅ الخطوات:
1. اضغط "نعم، احذف"

✅ المتوقع:
- Loading spinner
- Success message: "تم حذف السيارة بنجاح"
- Redirect إلى /profile أو /search
- السيارة محذوفة من Firestore
- الصور محذوفة من Storage

⏱️ الوقت: 2 دقيقة
```

#### TC-Q8: إلغاء الحذف
```
✅ الخطوات:
1. اضغط زر "حذف"
2. في Dialog، اضغط "إلغاء"

✅ المتوقع:
- Dialog يغلق
- السيارة لم تُحذف
- لا تغيير في البيانات

⏱️ الوقت: 1 دقيقة
```

---

### 🔍 Test 3: Search (3 دقائق)

#### TC-Q9: البحث الأساسي
```
✅ الخطوات:
1. اذهب إلى /search
2. اختر Make: "BMW"
3. اضغط "بحث"

✅ المتوقع:
- النتائج تظهر بسرعة (< 2 ثانية)
- فقط سيارات BMW تظهر
- الترتيب: الأحدث أولاً

⏱️ الوقت: 1.5 دقيقة
```

#### TC-Q10: البحث المتقدم
```
✅ الخطوات:
1. اذهب إلى /advanced-search
2. اختر:
   - Make: "Mercedes-Benz"
   - Model: "C-Class"
   - Year: 2020-2023
   - Price: 20000-50000 EUR

✅ المتوقع:
- النتائج دقيقة (تطابق جميع الفلاتر)
- الأداء سريع
- الـ Index optimization تعمل

⏱️ الوقت: 1.5 دقيقة
```

---

### 📝 Test 4: Logger Service (2 دقيقة)

#### TC-Q11: فحص Logger في Console
```
✅ الخطوات:
1. افتح Console (F12)
2. قم بأي إجراء (بحث، تعديل، حذف)

✅ المتوقع:
- Logs منظمة (استخدام Logger Service)
- No `console.log` مباشر في production
- Structured logging format:
  {
    timestamp: "2025-12-11T10:30:00Z",
    level: "info",
    message: "...",
    context: {...}
  }

⏱️ الوقت: 2 دقيقة
```

---

## 📋 الاختبار الشامل | Comprehensive Test (60 دقيقة) {#comprehensive-test}

### 1. 🚗 Car Edit Feature - 6 Test Cases

#### TC-1.1: عرض زر التعديل ✏️
**الإعداد:**
- سجل دخول بحساب Dealer/Company
- اذهب إلى صفحة تفاصيل سيارة تملكها

**الخطوات:**
1. افتح صفحة تفاصيل السيارة

**المتوقع:**
- ✅ زر "تعديل" ظاهر بوضوح
- ✅ الزر نشط (not disabled)
- ✅ الأيقونة صحيحة

**النتيجة:** ⬜ Pass ⬜ Fail  
**ملاحظات:** _________________________

---

#### TC-1.2: فتح وضع التعديل
**الخطوات:**
1. اضغط على زر "تعديل"

**المتوقع:**
- ✅ النموذج يتحول إلى edit mode
- ✅ جميع الحقول قابلة للتعديل
- ✅ زر "حفظ" و "إلغاء" ظاهران
- ✅ البيانات الحالية معبأة في الحقول

**النتيجة:** ⬜ Pass ⬜ Fail  
**ملاحظات:** _________________________

---

#### TC-1.3: تعديل المعلومات الأساسية
**الخطوات:**
1. عدّل السعر: من 25000 إلى 24500 EUR
2. عدّل الوصف: أضف نص جديد
3. عدّل الموديل: اختر موديل مختلف

**المتوقع:**
- ✅ الحقول تقبل التعديل
- ✅ Validation يعمل (مثلاً: السعر > 0)
- ✅ No errors في Console

**النتيجة:** ⬜ Pass ⬜ Fail  
**ملاحظات:** _________________________

---

#### TC-1.4: حفظ التعديلات
**الخطوات:**
1. بعد التعديل، اضغط "حفظ"

**المتوقع:**
- ✅ Loading indicator يظهر
- ✅ Success toast: "تم تحديث المعلومات بنجاح"
- ✅ البيانات محدثة في الصفحة
- ✅ البيانات محدثة في Firestore (تحقق من Console)
- ✅ الصفحة تعود إلى view mode
- ✅ Logger Service يسجل العملية

**النتيجة:** ⬜ Pass ⬜ Fail  
**ملاحظات:** _________________________

---

#### TC-1.5: إلغاء التعديلات
**الخطوات:**
1. عدّل أي حقول
2. اضغط "إلغاء"

**المتوقع:**
- ✅ التعديلات لا تُحفظ
- ✅ الصفحة تعود إلى البيانات الأصلية
- ✅ No errors في Console

**النتيجة:** ⬜ Pass ⬜ Fail  
**ملاحظات:** _________________________

---

#### TC-1.6: تعديل الصور
**الخطوات:**
1. في edit mode، احذف صورة موجودة
2. أضف صورة جديدة
3. اضغط "حفظ"

**المتوقع:**
- ✅ الصورة القديمة محذوفة من Storage
- ✅ الصورة الجديدة مرفوعة إلى Storage
- ✅ URLs محدثة في Firestore
- ✅ Preview الصور صحيح
- ✅ Lazy loading يعمل

**النتيجة:** ⬜ Pass ⬜ Fail  
**ملاحظات:** _________________________

---

### 2. 🗑️ Car Delete Feature - 6 Test Cases

#### TC-2.1: عرض زر الحذف
**الخطوات:**
1. افتح صفحة تفاصيل سيارة تملكها

**المتوقع:**
- ✅ زر "حذف" ظاهر
- ✅ لون الزر أحمر (تحذيري)
- ✅ الأيقونة صحيحة (🗑️)
- ✅ الزر في مكان واضح

**النتيجة:** ⬜ Pass ⬜ Fail  
**ملاحظات:** _________________________

---

#### TC-2.2: فتح Dialog التأكيد
**الخطوات:**
1. اضغط زر "حذف"

**المتوقع:**
- ✅ Dialog التأكيد يفتح
- ✅ رسالة واضحة: "هل أنت متأكد من حذف هذه السيارة؟"
- ✅ زران: "نعم، احذف" (أحمر) و "إلغاء" (رمادي)
- ✅ التحذير واضح

**النتيجة:** ⬜ Pass ⬜ Fail  
**ملاحظات:** _________________________

---

#### TC-2.3: تأكيد الحذف
**الخطوات:**
1. في Dialog، اضغط "نعم، احذف"

**المتوقع:**
- ✅ Loading spinner يظهر
- ✅ Success toast: "تم حذف السيارة بنجاح"
- ✅ Redirect إلى /profile أو /search
- ✅ السيارة محذوفة من Firestore
- ✅ الصور محذوفة من Storage
- ✅ Logger Service يسجل العملية

**النتيجة:** ⬜ Pass ⬜ Fail  
**ملاحظات:** _________________________

---

#### TC-2.4: إلغاء الحذف
**الخطوات:**
1. اضغط زر "حذف"
2. في Dialog، اضغط "إلغاء"

**المتوقع:**
- ✅ Dialog يغلق
- ✅ السيارة لم تُحذف
- ✅ لا تغيير في البيانات
- ✅ لا errors في Console

**النتيجة:** ⬜ Pass ⬜ Fail  
**ملاحظات:** _________________________

---

#### TC-2.5: حدود نوع البائع - Private
**الخطوات:**
1. سجل دخول بحساب Private (لديه 3 سيارات)
2. احذف واحدة

**المتوقع:**
- ✅ الحذف يعمل
- ✅ العدد يصبح 2
- ✅ الحد الأقصى يُحدّث (can add 1 more)

**النتيجة:** ⬜ Pass ⬜ Fail  
**ملاحظات:** _________________________

---

#### TC-2.6: حدود نوع البائع - Dealer
**الخطوات:**
1. سجل دخول بحساب Dealer
2. احذف سيارة

**المتوقع:**
- ✅ الحذف يعمل
- ✅ No listing limit (يمكن إضافة المزيد)

**النتيجة:** ⬜ Pass ⬜ Fail  
**ملاحظات:** _________________________

---

### 3. 🔔 Firebase Notifications - 7 Test Cases

#### TC-3.1: عرض الإشعارات
**الخطوات:**
1. اذهب إلى /notifications

**المتوقع:**
- ✅ قائمة الإشعارات تظهر
- ✅ Unread notifications مميزة (bold أو لون مختلف)
- ✅ التاريخ والوقت صحيحان
- ✅ الأيقونات صحيحة (حسب نوع الإشعار)

**النتيجة:** ⬜ Pass ⬜ Fail  
**ملاحظات:** _________________________

---

#### TC-3.2: Real-time Updates
**الخطوات:**
1. افتح صفحة الإشعارات في تبويبين
2. في التبويب 2، قم بإجراء يُنشئ إشعار (مثلاً: message)
3. راقب التبويب 1

**المتوقع:**
- ✅ الإشعار الجديد يظهر تلقائياً في التبويب 1
- ✅ No page refresh مطلوب
- ✅ Real-time listener يعمل

**النتيجة:** ⬜ Pass ⬜ Fail  
**ملاحظات:** _________________________

---

#### TC-3.3: Mark as Read
**الخطوات:**
1. اضغط على إشعار غير مقروء

**المتوقع:**
- ✅ الإشعار يُعلّم كـ "مقروء"
- ✅ التنسيق يتغير (يفقد bold)
- ✅ Badge count يقل بـ 1
- ✅ Firestore محدثة

**النتيجة:** ⬜ Pass ⬜ Fail  
**ملاحظات:** _________________________

---

#### TC-3.4: Mark All as Read
**الخطوات:**
1. اضغط "تعليم الكل كمقروء"

**المتوقع:**
- ✅ جميع الإشعارات تُعلّم كمقروءة
- ✅ Badge count = 0
- ✅ Firestore محدثة (batch update)

**النتيجة:** ⬜ Pass ⬜ Fail  
**ملاحظات:** _________________________

---

#### TC-3.5: حذف إشعار
**الخطوات:**
1. اضغط زر الحذف (🗑️) على إشعار

**المتوقع:**
- ✅ الإشعار يُحذف من القائمة
- ✅ الإشعار محذوف من Firestore
- ✅ No errors

**النتيجة:** ⬜ Pass ⬜ Fail  
**ملاحظات:** _________________________

---

#### TC-3.6: أنواع الإشعارات المختلفة
**الخطوات:**
1. أنشئ إشعارات من أنواع مختلفة:
   - New message (رسالة جديدة)
   - Price drop (انخفاض السعر)
   - Verification status (حالة التحقق)
   - System notification (إشعار النظام)

**المتوقع:**
- ✅ كل نوع له أيقونة مميزة
- ✅ الألوان صحيحة
- ✅ الروابط تعمل

**النتيجة:** ⬜ Pass ⬜ Fail  
**ملاحظات:** _________________________

---

#### TC-3.7: Badge Count في Header
**الخطوات:**
1. راقب Badge في Header (🔔)

**المتوقع:**
- ✅ Badge يعرض عدد الإشعارات غير المقروءة
- ✅ يتحدث real-time
- ✅ يختفي عند 0

**النتيجة:** ⬜ Pass ⬜ Fail  
**ملاحظات:** _________________________

---

### 4. 🔍 Firestore Search Optimization - 3 Test Cases

#### TC-4.1: البحث السريع
**الخطوات:**
1. اذهب إلى /search
2. اختر Make: "BMW"
3. اضغط "بحث"
4. قس الوقت

**المتوقع:**
- ✅ النتائج تظهر في < 2 ثانية
- ✅ الـ Composite Index يُستخدم
- ✅ No "missing index" errors في Console

**النتيجة:** ⬜ Pass ⬜ Fail  
**الوقت الفعلي:** _______ ثانية

---

#### TC-4.2: الترتيب الصحيح (Newest First)
**الخطوات:**
1. ابحث عن أي make
2. افحص النتائج

**المتوقع:**
- ✅ الأحدث في الأعلى (createdAt DESC)
- ✅ التواريخ مرتبة تنازلياً
- ✅ Firestore query صحيح

**النتيجة:** ⬜ Pass ⬜ Fail  
**ملاحظات:** _________________________

---

#### TC-4.3: البحث المعقد (Multi-filter)
**الخطوات:**
1. اذهب إلى /advanced-search
2. اختر:
   - Make: "Mercedes-Benz"
   - Model: "E-Class"
   - Year: 2018-2022
   - Price: 30000-60000 EUR
   - Fuel Type: "Diesel"
   - Transmission: "Automatic"

**المتوقع:**
- ✅ النتائج دقيقة (تطابق جميع الفلاتر)
- ✅ الأداء سريع (< 3 ثانية)
- ✅ Composite Index يغطي هذه الفلاتر

**النتيجة:** ⬜ Pass ⬜ Fail  
**الوقت الفعلي:** _______ ثانية

---

### 5. 📝 Logger Service - 3 Test Cases

#### TC-5.1: Structured Logging
**الخطوات:**
1. افتح Console (F12)
2. قم بأي إجراء (search, edit, delete)

**المتوقع:**
- ✅ Logs منظمة (استخدام Logger Service)
- ✅ كل log له structure:
  ```json
  {
    timestamp: "2025-12-11T10:30:00Z",
    level: "info",
    message: "User searched for cars",
    context: {
      userId: "...",
      filters: {...}
    }
  }
  ```
- ✅ No `console.log` مباشر

**النتيجة:** ⬜ Pass ⬜ Fail  
**ملاحظات:** _________________________

---

#### TC-5.2: Error Tracking
**الخطوات:**
1. تعمّد إنشاء خطأ (مثلاً: بحث بدون make)
2. افحص Console

**المتوقع:**
- ✅ الخطأ مسجل في Logger Service
- ✅ Stack trace موجود
- ✅ Context كامل (user, action, etc.)

**النتيجة:** ⬜ Pass ⬜ Fail  
**ملاحظات:** _________________________

---

#### TC-5.3: Production Mode (No Debug Logs)
**الخطوات:**
1. شغّل production build:
   ```bash
   npm run build
   npm start
   ```
2. افحص Console

**المتوقع:**
- ✅ فقط errors و warnings تظهر
- ✅ No debug logs في production
- ✅ Logger Service يُخفي debug logs تلقائياً

**النتيجة:** ⬜ Pass ⬜ Fail  
**ملاحظات:** _________________________

---

### 6. 🎨 UX Improvements - 4 Test Cases

#### TC-6.1: أزرار متسقة (Consistent Buttons)
**الخطوات:**
1. افحص جميع الأزرار في:
   - Sell workflow
   - Car details
   - Profile
   - Search

**المتوقع:**
- ✅ نفس الألوان (Orange theme: #FF8F10)
- ✅ نفس الأحجام
- ✅ نفس الـ hover effects
- ✅ نفس الـ font ('Martica', 'Arial', sans-serif)

**النتيجة:** ⬜ Pass ⬜ Fail  
**ملاحظات:** _________________________

---

#### TC-6.2: Loading States
**الخطوات:**
1. قم بإجراء يتطلب loading (search, save, delete)

**المتوقع:**
- ✅ Loading spinner يظهر
- ✅ الزر disabled أثناء loading
- ✅ Loading text واضح ("جاري الحفظ...")

**النتيجة:** ⬜ Pass ⬜ Fail  
**ملاحظات:** _________________________

---

#### TC-6.3: Error Messages
**الخطوات:**
1. تعمّد إنشاء خطأ (مثلاً: submit form بدون حقول مطلوبة)

**المتوقع:**
- ✅ Error toast يظهر
- ✅ الرسالة واضحة وبالعربية
- ✅ اللون أحمر
- ✅ الأيقونة صحيحة (❌ أو ⚠️)

**النتيجة:** ⬜ Pass ⬜ Fail  
**ملاحظات:** _________________________

---

#### TC-6.4: Success Messages
**الخطوات:**
1. أكمل إجراء ناجح (save, delete, etc.)

**المتوقع:**
- ✅ Success toast يظهر
- ✅ الرسالة واضحة
- ✅ اللون أخضر
- ✅ الأيقونة صحيحة (✅ أو ✓)
- ✅ Toast يختفي بعد 3-5 ثانية

**النتيجة:** ⬜ Pass ⬜ Fail  
**ملاحظات:** _________________________

---

### 7. 📱 Mobile Responsiveness - 3 Test Cases

#### TC-7.1: Mobile Layout
**الخطوات:**
1. افتح DevTools
2. اختر mobile view (iPhone X)
3. تصفح الصفحات الرئيسية

**المتوقع:**
- ✅ Layout يتكيف (responsive)
- ✅ الأزرار قابلة للضغط (size كافي)
- ✅ النصوص قابلة للقراءة
- ✅ الصور لا تتجاوز الشاشة

**النتيجة:** ⬜ Pass ⬜ Fail  
**ملاحظات:** _________________________

---

#### TC-7.2: Touch Interactions
**الخطوات:**
1. استخدم mobile device حقيقي
2. جرّب:
   - Scroll
   - Tap buttons
   - Swipe images
   - Open modals

**المتوقع:**
- ✅ Touch events تعمل
- ✅ No delays في response
- ✅ Gestures سلسة

**النتيجة:** ⬜ Pass ⬜ Fail  
**ملاحظات:** _________________________

---

#### TC-7.3: Mobile Bottom Nav
**الخطوات:**
1. في mobile view، افحص bottom navigation

**المتوقع:**
- ✅ Bottom nav ظاهر
- ✅ الأيقونات واضحة
- ✅ Active state مميز
- ✅ الروابط تعمل

**النتيجة:** ⬜ Pass ⬜ Fail  
**ملاحظات:** _________________________

---

### 8. 🔒 Security & Permissions - 3 Test Cases

#### TC-8.1: حماية Routes
**الخطوات:**
1. سجل خروج
2. حاول الوصول إلى `/sell` مباشرة

**المتوقع:**
- ✅ Redirect إلى /login
- ✅ رسالة: "يجب تسجيل الدخول أولاً"

**النتيجة:** ⬜ Pass ⬜ Fail  
**ملاحظات:** _________________________

---

#### TC-8.2: حماية Edit/Delete
**الخطوات:**
1. سجل دخول بحساب A
2. حاول تعديل/حذف سيارة للمستخدم B

**المتوقع:**
- ✅ الأزرار غير ظاهرة (or disabled)
- ✅ إذا حاولت عبر API: Error 403
- ✅ Firestore Rules تمنع العملية

**النتيجة:** ⬜ Pass ⬜ Fail  
**ملاحظات:** _________________________

---

#### TC-8.3: Firestore Rules
**الخطوات:**
1. افتح Firebase Console
2. اذهب إلى Firestore Rules
3. افحص rules لـ `cars` collection

**المتوقع:**
- ✅ فقط المالك يمكنه update/delete
- ✅ الجميع يمكنه read (published cars)
- ✅ Rules محدثة وآمنة

**النتيجة:** ⬜ Pass ⬜ Fail  
**ملاحظات:** _________________________

---

### 9. ⚡ Performance Metrics - 3 Test Cases

#### TC-9.1: Page Load Time
**الخطوات:**
1. افتح DevTools → Network tab
2. Refresh الصفحة الرئيسية
3. قس Load time

**المتوقع:**
- ✅ First Contentful Paint < 2s
- ✅ Time to Interactive < 3s
- ✅ Total load time < 5s

**النتيجة:** ⬜ Pass ⬜ Fail  
**الأوقات الفعلية:**
- FCP: _______ s
- TTI: _______ s
- Total: _______ s

---

#### TC-9.2: Bundle Size
**الخطوات:**
1. شغّل production build:
   ```bash
   npm run build
   ```
2. افحص `build/static/js/`

**المتوقع:**
- ✅ Total bundle size < 500 KB (gzipped)
- ✅ Code splitting يعمل
- ✅ Lazy loading للصفحات

**النتيجة:** ⬜ Pass ⬜ Fail  
**Bundle size:** _______ KB

---

#### TC-9.3: Lighthouse Score
**الخطوات:**
1. افتح DevTools → Lighthouse
2. Run audit (Desktop)

**المتوقع:**
- ✅ Performance > 80
- ✅ Accessibility > 90
- ✅ Best Practices > 90
- ✅ SEO > 80

**النتيجة:** ⬜ Pass ⬜ Fail  
**Scores:**
- Performance: _______
- Accessibility: _______
- Best Practices: _______
- SEO: _______

---

### 10. 🌐 Internationalization (i18n) - 3 Test Cases

#### TC-10.1: Bulgarian Language
**الخطوات:**
1. اختر Bulgarian (bg) من language switcher
2. تصفح الصفحات

**المتوقع:**
- ✅ جميع النصوص بالبلغارية
- ✅ التواريخ بتنسيق BG
- ✅ الأرقام بتنسيق BG (comma separator)

**النتيجة:** ⬜ Pass ⬜ Fail  
**ملاحظات:** _________________________

---

#### TC-10.2: English Language
**الخطوات:**
1. اختر English (en) من language switcher
2. تصفح الصفحات

**المتوقع:**
- ✅ جميع النصوص بالإنجليزية
- ✅ التواريخ بتنسيق EN
- ✅ الأرقام بتنسيق EN

**النتيجة:** ⬜ Pass ⬜ Fail  
**ملاحظات:** _________________________

---

#### TC-10.3: Language Persistence
**الخطوات:**
1. اختر لغة
2. Refresh الصفحة
3. افحص اللغة المختارة

**المتوقع:**
- ✅ اللغة محفوظة في localStorage
- ✅ اللغة تبقى بعد refresh
- ✅ `<html lang>` attribute محدث

**النتيجة:** ⬜ Pass ⬜ Fail  
**ملاحظات:** _________________________

---

## 🚗 اختبار ماركات السيارات | Car Brands Testing {#car-brands-testing}

### النطاق
اختبار أن جميع الـ**168 ماركة** تظهر بشكل صحيح في القوائم المنسدلة.

---

### Test 1: صفحة البحث المتقدم

#### الخطوات:
1. افتح: `http://localhost:3000/advanced-search`
2. ابحث عن قسم "Make" أو "الماركة"
3. افتح القائمة المنسدلة

#### التحقق:
- [ ] القائمة تفتح بدون أخطاء
- [ ] الماركات الشعبية في الأعلى:
  - Volkswagen
  - Mercedes-Benz
  - BMW
  - Audi
  - Opel
  - Toyota
  - Ford
  - Peugeot
  - Honda
  - Renault

- [ ] الماركات الجديدة موجودة (اختبر 5):
  - Xpeng (صينية كهربائية)
  - Hongqi (صينية فاخرة)
  - Koenigsegg (سويدية فائقة)
  - Proton (ماليزية)
  - Maruti Suzuki (هندية)

---

### Test 2: صفحة البيع (Sell Workflow)

#### الخطوات:
1. افتح: `http://localhost:3000/sell`
2. اختر نوع السيارة (Car)
3. اختر نوع البائع (Private/Dealer/Company)
4. انتقل إلى صفحة بيانات السيارة
5. ابحث عن قسم اختيار الماركة

#### التحقق:
- [ ] القائمة المنسدلة تظهر
- [ ] الشعارات تظهر للماركات المعروفة
- [ ] القسم الخاص بالماركات الشعبية موجود
- [ ] الماركات الجديدة موجودة

---

### Test 3: اختبار التسلسل (Cascade Test)

#### Test 3.1: Xpeng Models
1. اختر Make: **Xpeng**
2. تحقق من ظهور الموديلات:
   - [ ] G3
   - [ ] P5
   - [ ] P7
   - [ ] G9

#### Test 3.2: Hongqi Models
1. اختر Make: **Hongqi**
2. تحقق من ظهور الموديلات:
   - [ ] H5
   - [ ] H7
   - [ ] H9
   - [ ] HS5
   - [ ] HS7
   - [ ] E-HS3
   - [ ] E-HS9

#### Test 3.3: Li Auto Models
1. اختر Make: **Li Auto**
2. تحقق من ظهور الموديلات:
   - [ ] Li ONE
   - [ ] Li L6
   - [ ] Li L7
   - [ ] Li L8
   - [ ] Li L9

---

### Test 4: الشعارات (Logos)

#### التحقق:
اختبر أن الشعارات تظهر لـ:
- [ ] Volkswagen
- [ ] Mercedes-Benz
- [ ] BMW
- [ ] Audi
- [ ] Tesla
- [ ] Toyota
- [ ] Ford
- [ ] Honda

---

### Test 5: البحث في القائمة

#### الخطوات:
1. في القائمة المنسدلة، اكتب: "BMW"
2. تحقق من التصفية

#### التحقق:
- [ ] فقط "BMW" تظهر
- [ ] البحث سريع
- [ ] No errors

---

### Test 6: الماركات النادرة

#### التحقق:
ابحث عن الماركات التالية:
- [ ] Koenigsegg (سويدية فائقة)
- [ ] Pagani (إيطالية فائقة)
- [ ] Rimac (كرواتية كهربائية)
- [ ] Lucid (أمريكية كهربائية)
- [ ] Rivian (أمريكية كهربائية)

---

## ⚡ اختبار الأداء | Performance Testing {#performance-testing}

### Lighthouse Audit

#### الخطوات:
1. افتح Chrome DevTools
2. اذهب إلى Lighthouse tab
3. اختر:
   - Mode: Navigation
   - Device: Desktop
   - Categories: All
4. اضغط "Analyze page load"

#### المعايير المستهدفة:
- **Performance**: > 80 ✅
- **Accessibility**: > 90 ✅
- **Best Practices**: > 90 ✅
- **SEO**: > 80 ✅

#### النتائج الفعلية:
- Performance: _______
- Accessibility: _______
- Best Practices: _______
- SEO: _______

---

### Core Web Vitals

#### المقاييس:
1. **LCP (Largest Contentful Paint)**: < 2.5s
   - الفعلي: _______ s
   - [ ] Pass [ ] Fail

2. **FID (First Input Delay)**: < 100ms
   - الفعلي: _______ ms
   - [ ] Pass [ ] Fail

3. **CLS (Cumulative Layout Shift)**: < 0.1
   - الفعلي: _______
   - [ ] Pass [ ] Fail

---

### Bundle Analysis

#### الخطوات:
```bash
npm run build
```

#### التحقق:
- [ ] Total bundle size < 500 KB (gzipped)
- [ ] Code splitting يعمل (vendor chunks منفصلة)
- [ ] Lazy loading للصفحات
- [ ] Tree shaking فعّال

#### الأحجام الفعلية:
- Main bundle: _______ KB
- Vendor bundle: _______ KB
- Total (gzipped): _______ KB

---

### Network Performance

#### الخطوات:
1. افتح DevTools → Network tab
2. اختر throttling: "Fast 3G"
3. Refresh الصفحة

#### التحقق:
- [ ] الصفحة تحمّل < 10s
- [ ] Images lazy loading يعمل
- [ ] الخطوط محملة بكفاءة
- [ ] No unnecessary requests

---

## 🐛 تقارير الأخطاء | Bug Reporting {#bug-reporting}

### قالب تقرير الخطأ

```markdown
## 🐛 Bug Report

**العنوان:** [مختصر ووصفي]

### الوصف
[وصف مفصل للمشكلة]

### الخطوات لإعادة الإنتاج
1. افتح...
2. اضغط...
3. لاحظ...

### المتوقع
[ما كان يجب أن يحدث]

### الفعلي
[ما حدث بالفعل]

### البيئة
- Browser: Chrome 120
- OS: Windows 11
- Device: Desktop
- Language: Bulgarian

### Screenshots
[أرفق صور إن أمكن]

### Console Logs
```
[أرفق logs من Console]
```

### الأولوية
- [ ] P0: Critical (يمنع الاستخدام)
- [ ] P1: High (يؤثر على وظيفة رئيسية)
- [ ] P2: Medium (مزعج لكن يمكن تجاوزه)
- [ ] P3: Low (تحسين)

### الفئة
- [ ] UI/UX
- [ ] Functionality
- [ ] Performance
- [ ] Security
- [ ] Other: ____________
```

---

### مثال على تقرير خطأ

```markdown
## 🐛 Bug Report

**العنوان:** زر "حفظ" في Car Edit لا يعمل على Safari

### الوصف
عند محاولة حفظ تعديلات السيارة في Safari، الزر لا يستجيب.

### الخطوات لإعادة الإنتاج
1. افتح Safari (Version 17)
2. سجل دخول كـ Dealer
3. اذهب إلى car details page
4. اضغط "تعديل"
5. عدّل السعر
6. اضغط "حفظ"
7. لاحظ: لا شيء يحدث

### المتوقع
- Loading spinner يظهر
- البيانات تُحفظ في Firestore
- Success message يظهر

### الفعلي
- لا شيء يحدث
- الزر لا يستجيب
- No errors في Console

### البيئة
- Browser: Safari 17.0
- OS: macOS Sonoma 14.2
- Device: MacBook Pro
- Language: Bulgarian

### Console Logs
```
No errors in console
```

### الأولوية
- [x] P1: High (يؤثر على Safari users)

### الفئة
- [x] Functionality
```

---

## 🤖 سكريبتات الاختبار التلقائي | Automated Testing {#automated-testing}

### السكريبت الأول: test-production.js

#### الاستخدام:
```javascript
// في Console
const script = document.createElement('script');
script.src = '/test-production.js';
document.body.appendChild(script);
```

#### ما يختبره:
- ✅ Logger service integration
- ✅ React app structure
- ✅ Firebase connection
- ✅ Routing
- ✅ Language system
- ✅ UI components
- ✅ Performance metrics
- ✅ Error handling
- ✅ Network requests
- ✅ LocalStorage access

---

### السكريبت الثاني: Lighthouse CI

#### setup:
```bash
npm install -g @lhci/cli
```

#### تشغيل:
```bash
lhci autorun --collect.url=http://localhost:3000
```

#### التقارير:
يُنشئ تقارير HTML مفصلة في `.lighthouseci/`

---

### السكريبت الثالث: Jest Unit Tests

#### تشغيل:
```bash
npm test
```

#### التغطية:
```bash
npm test -- --coverage
```

#### المستهدف:
- Coverage > 70% ✅

---

## 📊 Sign-Off Sheet

### ملخص الاختبار

**التاريخ:** _______________  
**المُختبر:** _______________  
**البيئة:** [ ] Development [ ] Production  
**البراوزر:** _______________

### النتائج

| الفئة | Total Tests | Passed | Failed | Pass Rate |
|-------|-------------|--------|--------|-----------|
| Car Edit | 6 | ___ | ___ | ___% |
| Car Delete | 6 | ___ | ___ | ___% |
| Notifications | 7 | ___ | ___ | ___% |
| Search | 3 | ___ | ___ | ___% |
| Logger | 3 | ___ | ___ | ___% |
| UX | 4 | ___ | ___ | ___% |
| Mobile | 3 | ___ | ___ | ___% |
| Security | 3 | ___ | ___ | ___% |
| Performance | 3 | ___ | ___ | ___% |
| i18n | 3 | ___ | ___ | ___% |
| **TOTAL** | **41** | **___** | **___** | **___%** |

### الأخطاء الحرجة (P0-P1)

1. _______________________________________________
2. _______________________________________________
3. _______________________________________________

### التوصية

- [ ] ✅ **Ready for Production** - جميع الاختبارات نجحت
- [ ] ⚠️ **Ready with Minor Issues** - مشاكل بسيطة يمكن تجاهلها
- [ ] ❌ **Not Ready** - يجب إصلاح الأخطاء الحرجة أولاً

### توقيع المُختبر

**الاسم:** _______________  
**التوقيع:** _______________  
**التاريخ:** _______________

---

## 📝 ملاحظات إضافية

### نصائح للاختبار الفعّال

1. **ابدأ بالاختبار السريع**: لا تحتاج لـ60 دقيقة كل مرة
2. **استخدم checklist**: لا تنسى أي test case
3. **سجّل كل شيء**: Screenshots, logs, errors
4. **اختبر في browsers مختلفة**: Chrome, Firefox, Safari, Edge
5. **اختبر mobile حقيقي**: ليس فقط DevTools
6. **استخدم سكريبتات آلية**: وفّر الوقت

### متى تختبر؟

- ✅ قبل كل commit كبير
- ✅ قبل merge إلى main
- ✅ قبل deployment إلى production
- ✅ بعد إضافة feature جديدة
- ✅ بعد bug fix
- ✅ Weekly testing (روتين أسبوعي)

---

**تم إنشاؤه:** 11 ديسمبر 2025  
**آخر تحديث:** 11 ديسمبر 2025  
**الإصدار:** 1.0.0
