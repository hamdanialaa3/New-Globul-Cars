# 🔄 دليل نقل البيانات من Firebase القديم إلى الجديد

## المشكلة الحالية

عند إنشاء مشروع Firebase الجديد (`fire-new-globul`) لحل مشكلة المصادقة، **لم يتم نقل البيانات** من المشروع القديم. النتيجة:

- ✅ المصادقة تعمل بشكل ممتاز
- ❌ لا توجد بيانات سيارات
- ❌ لا توجد بيانات مستخدمين (profiles)
- ❌ لا توجد إعلانات أو رسائل
- ❌ صفحات البروفايل فارغة

---

## 📋 خطة النقل الكاملة

### الخيار 1: نقل البيانات باستخدام Firebase Admin SDK (الأفضل) ⭐

#### الخطوة 1: تحميل Service Account Keys

**من المشروع القديم (studio-448742006-a3493):**
1. افتح: https://console.firebase.google.com/project/studio-448742006-a3493/settings/serviceaccounts/adminsdk
2. اضغط "Generate New Private Key"
3. احفظ الملف باسم: `old-project-service-account.json`

**من المشروع الجديد (fire-new-globul):**
1. افتح: https://console.firebase.google.com/project/fire-new-globul/settings/serviceaccounts/adminsdk
2. اضغط "Generate New Private Key"
3. احفظ الملف باسم: `new-project-service-account.json`

#### الخطوة 2: تحديث السكريبت

افتح ملف `migrate-firestore-data.js` وحدث:

```javascript
// استبدل هذا
const oldServiceAccount = require('./old-project-service-account.json');
const newServiceAccount = require('./new-project-service-account.json');
```

#### الخطوة 3: تثبيت المتطلبات

```bash
npm install firebase-admin
```

#### الخطوة 4: تشغيل النقل

```bash
node migrate-firestore-data.js
```

---

### الخيار 2: استخدام Google Cloud Shell (أسرع) ⚡

```bash
# 1. تسجيل الدخول للمشروع القديم
gcloud config set project studio-448742006-a3493

# 2. تصدير Firestore
gcloud firestore export gs://studio-448742006-a3493.appspot.com/firestore-backup

# 3. نسخ البيانات للمشروع الجديد
gsutil -m cp -r gs://studio-448742006-a3493.appspot.com/firestore-backup gs://fire-new-globul.appspot.com/

# 4. تسجيل الدخول للمشروع الجديد
gcloud config set project fire-new-globul

# 5. استيراد Firestore
gcloud firestore import gs://fire-new-globul.appspot.com/firestore-backup
```

---

### الخيار 3: نقل Authentication Users أيضاً 👥

```bash
# تصدير المستخدمين من المشروع القديم
firebase auth:export users-backup.json --project studio-448742006-a3493

# استيراد المستخدمين للمشروع الجديد
firebase auth:import users-backup.json --project fire-new-globul
```

---

## 📊 Collections المطلوب نقلها

تأكد من نقل جميع Collections التالية:

- [x] `users` - بيانات المستخدمين
- [x] `profiles` - الملفات الشخصية
- [x] `cars` - السيارات
- [x] `listings` - الإعلانات
- [x] `favorites` - المفضلة
- [x] `messages` - الرسائل
- [x] `notifications` - الإشعارات
- [x] `reviews` - التقييمات
- [x] `savedSearches` - البحث المحفوظ
- [x] `follows` - المتابعات
- [x] `carViews` - مشاهدات السيارات
- [x] `analytics` - التحليلات
- [x] `sellWorkflow` - بيانات بيع السيارات
- [x] `transactions` - المعاملات
- [x] `reports` - البلاغات

---

## ⚠️ تحذيرات مهمة

1. **النسخ الاحتياطي أولاً**: احفظ نسخة احتياطية من المشروع القديم
2. **تحقق من الحصص (Quota)**: تأكد من وجود مساحة كافية في المشروع الجديد
3. **الوقت المتوقع**: قد يستغرق النقل من 10-60 دقيقة حسب حجم البيانات
4. **التكلفة**: عملية Export/Import قد تكلف $0.01 - $0.10 حسب حجم البيانات

---

## 🔍 التحقق من نجاح النقل

بعد اكتمال النقل، تحقق من:

```bash
# عرض عدد المستندات في كل collection
firebase firestore:indexes --project fire-new-globul
```

أو من Firebase Console:
1. افتح: https://console.firebase.google.com/project/fire-new-globul/firestore/data
2. تحقق من وجود البيانات في كل collection

---

## 🆘 حل المشاكل

### مشكلة: "Permission Denied"
**الحل**: تأكد من تفعيل Billing في المشروع الجديد

### مشكلة: "Storage bucket not found"
**الحل**: 
```bash
gsutil mb gs://fire-new-globul.appspot.com
```

### مشكلة: البيانات لم تظهر بعد النقل
**الحل**: 
1. امسح cache المتصفح
2. أعد تشغيل الخادم المحلي
3. تحقق من Firestore Rules

---

## 📞 هل تحتاج مساعدة؟

أخبرني أي خيار تفضل وسأساعدك خطوة بخطوة! 

**الخيار الموصى به**: الخيار 2 (Google Cloud Shell) - الأسرع والأسهل ⚡

