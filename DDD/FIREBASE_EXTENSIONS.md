# 🔌 Firebase Extensions - دليل سريع

## الإضافات المثبتة حالياً

### ✅ 1. Stream Firestore to BigQuery
**الناشر:** `firebase/firestore-bigquery-export@0.2.6`  
**الوظيفة:** مزامنة بيانات Firestore إلى BigQuery للتحليلات المتقدمة  
**الحالة:** نشط ✅

---

### ✅ 2. Firestore User Document
**الناشر:** `rowy/firestore-user-document@0.0.6`  
**الوظيفة:** إنشاء وثيقة مستخدم تلقائياً عند التسجيل  
**الحالة:** نشط ✅

---

### ✅ 3. Delete User Data
**الناشر:** `firebase/delete-user-data@0.1.25`  
**الوظيفة:** حذف بيانات المستخدم من Firestore عند حذف حسابه  
**الحالة:** نشط ✅

---

### ✅ 4. Search Firestore with Algolia
**الناشر:** `algolia/firestore-algolia-search@1.2.10`  
**الوظيفة:** فهرسة Firestore في Algolia للبحث السريع والدقيق  
**الحالة:** نشط ✅  
**التكامل:** `src/services/algolia-service.ts`

---

### ✅ 5. Resize Images
**الناشر:** `firebase/storage-resize-images@0.2.10`  
**الوظيفة:** تصغير الصور تلقائياً عند رفعها (thumbnail, medium, large)  
**الحالة:** نشط ✅

---

### ✅ 6. Geocode Address in Firestore
**الناشر:** `googlemapsplatform/firestore-geocode-address@0.1.3`  
**الوظيفة:** تحويل العناوين النصية إلى إحداثيات جغرافية  
**الحالة:** نشط ✅

---

### ✅ 7. Run Payments with Stripe (جديد!)
**الناشر:** `invertase/firestore-stripe-payments@0.3.12`  
**الوظيفة:** إدارة الدفعات والاشتراكات عبر Stripe  
**الحالة:** تم التثبيت - يحتاج إعداد 🔧  
**التوثيق:** `STRIPE_SETUP_GUIDE.md`  
**التكامل:** `src/services/stripe-service.ts`

**الخطوات المطلوبة:**
1. ✅ نشر Firestore Rules: `firebase deploy --only firestore:rules`
2. ⏳ إعداد Stripe Webhook (انظر STRIPE_SETUP_GUIDE.md)
3. ⏳ إنشاء Products في Stripe Dashboard
4. ⏳ إعداد Customer Portal في Stripe
5. ⏳ إضافة `REACT_APP_STRIPE_PUBLISHABLE_KEY` في `.env`

---

## 🎯 الإضافات الموصى بإضافتها

### 🔜 1. Trigger Email (SendGrid)
**لماذا:** إرسال رسائل البريد (تحقق، إشعارات، فواتير)  
**الأولوية:** عالية ⭐⭐⭐  
**التكلفة:** مجاني حتى 100 بريد/يوم

### 🔜 2. Translate Text
**لماذا:** ترجمة تلقائية bg ↔ en لوصف السيارات والتعليقات  
**الأولوية:** متوسطة ⭐⭐  
**التكلفة:** حسب الاستخدام

### 🔜 3. Moderate Content (Text + Images)
**لماذا:** فلترة المحتوى غير اللائق والصور  
**الأولوية:** متوسطة ⭐⭐  
**التكلفة:** حسب الاستخدام

### 🔜 4. Send SMS (Twilio)
**لماذا:** رسائل SMS للتنبيهات الهامة (OTP، عروض جديدة)  
**الأولوية:** منخفضة ⭐  
**التكلفة:** حسب الاستخدام

---

## 📊 مراقبة الإضافات

### في Firebase Console:
```
Extensions → عرض جميع الإضافات → مراقبة الأداء
```

### Logs:
```bash
firebase functions:log --only ext-{extension-name}
```

**مثال:**
```bash
firebase functions:log --only ext-firestore-stripe-payments
```

---

## 🔧 إدارة الإضافات

### تحديث إضافة:
```bash
firebase ext:update {extension-instance-id}
```

### إعادة تكوين:
```
Firebase Console > Extensions > [اختر الإضافة] > Reconfigure
```

### إلغاء تثبيت:
```bash
firebase ext:uninstall {extension-instance-id}
```

---

## 📚 المراجع

- [Firebase Extensions Hub](https://extensions.dev/)
- [Stripe Extension Docs](https://github.com/invertase/firestore-stripe-payments)
- [Algolia Extension](https://www.algolia.com/doc/tools/firebase-extensions/)
- [SendGrid Extension](https://github.com/firebase/extensions/tree/main/firestore-send-email)

---

**آخر تحديث:** 6 نوفمبر 2025
