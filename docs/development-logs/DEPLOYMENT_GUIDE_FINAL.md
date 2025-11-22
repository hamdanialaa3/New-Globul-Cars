# 🚀 دليل النشر النهائي - Zero-Cost AI Stack
**New Globul Cars - Deployment Guide**

آخر تحديث: 20 نوفمبر 2025

---

## 📋 قائمة التحقق قبل النشر

### 1. الأسرار والإعدادات (CRITICAL)

#### أ) إنشاء Gmail App Password جديد
⚠️ **كلمة المرور المكشوفة سابقًا يجب تدويرها فوراً**

1. افتح https://myaccount.google.com/security
2. فعّل التحقق بخطوتين (2FA) إن لم يكن مفعلاً
3. ابحث عن "App passwords"
4. أنشئ كلمة مرور جديدة:
   - الاسم: `New Globul Cars Production`
   - احفظ الكود (16 حرف بدون مسافات)

#### ب) الحصول على Gemini API Key
1. افتح https://aistudio.google.com/app/apikey
2. سجّل دخول بحساب Google
3. أنشئ API key جديد
4. انسخ المفتاح (يبدأ بـ `AIza...`)

#### ج) إعداد Firebase Functions Config
في مجلد المشروع الرئيسي، نفّذ:

```powershell
firebase functions:config:set `
  email.smtp_user="globul.net.m@gmail.com" `
  email.smtp_pass="YOUR_NEW_GMAIL_APP_PASSWORD_16_CHARS" `
  alerts.admin_email="globul.net.m@gmail.com" `
  gemini.api_key="YOUR_GEMINI_API_KEY" `
  gemini.model="gemini-1.5-flash" `
  ai.display_name_bg="Clover Alina" `
  ai.display_name_en="Clover Alina"
```

**استبدل:**
- `YOUR_NEW_GMAIL_APP_PASSWORD_16_CHARS` بكلمة المرور الجديدة من الخطوة أ
- `YOUR_GEMINI_API_KEY` بالمفتاح من الخطوة ب

**تحقق من الإعدادات:**
```powershell
firebase functions:config:get
```

---

### 2. بناء التطبيق

#### أ) تثبيت التبعيات (إن لم يتم)
```powershell
# Frontend
cd bulgarian-car-marketplace
npm install

# Functions (تم بالفعل ✅)
cd ..\functions
npm install
```

#### ب) بناء Frontend
```powershell
cd ..\bulgarian-car-marketplace
npm run build
```

**تحقق من:**
- مجلد `build/` تم إنشاؤه
- حجم الملفات معقول (< 200 MB)
- لا أخطاء في الـ console

---

### 3. نشر Firebase

#### الخيار 1: النشر الكامل (موصى به للمرة الأولى)
```powershell
cd ..
firebase deploy
```

هذا سينشر:
- ✅ Firestore Rules (`firestore.rules`)
- ✅ Storage Rules (`storage.rules`)
- ✅ Cloud Functions (98+ وظيفة)
- ✅ Hosting (من `bulgarian-car-marketplace/build/`)

**المدة المتوقعة:** 5-10 دقائق

#### الخيار 2: النشر الجزئي (للتحديثات السريعة)

**نشر Functions فقط:**
```powershell
firebase deploy --only functions
```

**نشر Hosting فقط:**
```powershell
firebase deploy --only hosting
```

**نشر القواعد فقط:**
```powershell
firebase deploy --only firestore:rules,storage:rules
```

---

### 4. التحقق بعد النشر

#### أ) اختبار Cloud Functions
افتح Firebase Console: https://console.firebase.google.com/project/fire-new-globul/functions

تحقق من:
- ✅ جميع الوظائف deployed بنجاح
- ✅ لا أخطاء في السجلات (Logs)
- ✅ Region: `europe-west1`

**وظائف AI المتوقعة:**
```
- onCarCreated (data ingestion)
- reprocessCar (callable)
- optimizeImage (storage trigger)
- reoptimizeImage (callable)
- cleanupImageVariants (storage delete)
- checkDuplicatesOnCreate (firestore trigger)
- checkDuplicates (callable)
- scanForDuplicatesBatch (scheduled)
- sendFraudAlert (callable)
- sendQuotaWarning (callable)
- sendErrorAlert (callable)
- sendDailyDigest (scheduled)
```

#### ب) اختبار Hosting
افتح: https://fire-new-globul.web.app

تحقق من:
- ✅ الصفحة تحمّل بدون أخطاء
- ✅ اللغة البلغارية + الإنجليزية تعملان
- ✅ صفحة البحث تعمل
- ✅ تفاصيل سيارة تحمّل بشكل صحيح

#### ج) اختبار AI Features

**1. Data Ingestion:**
- أضف سيارة جديدة عبر واجهة Sell
- تحقق من Firestore Console: يجب أن يحتوي الـ document على:
  - حقول محسّنة (`normalizedMake`, `normalizedModel`)
  - `category` مُستدل تلقائياً
  - `qualityScore` محسوب

**2. Image Optimization:**
- ارفع صورة سيارة
- تحقق من Storage: يجب أن يكون هناك:
  - `cars/{carId}/images/original.jpg`
  - `cars/{carId}/optimized/thumb_*.webp`
  - `cars/{carId}/optimized/small_*.webp`
  - `cars/{carId}/optimized/medium_*.webp`
  - `cars/{carId}/optimized/large_*.webp`

**3. Duplicate Detection:**
- أضف سيارتين متشابهتين (نفس Make/Model/Year)
- تحقق من Firestore: يجب أن تظهر رسالة تحذير `suspectedDuplicates`

**4. Email Alerts:**
- سجّل الدخول إلى `globul.net.m@gmail.com`
- تحقق من استلام بريد يومي (Daily Digest) حوالي الساعة 9 صباحاً UTC

---

### 5. مراقبة الأداء

#### Firebase Console - Performance
افتح: https://console.firebase.google.com/project/fire-new-globul/performance

تحقق من:
- ✅ Custom traces تظهر:
  - `ai_search_advanced`
  - `car_details_load`
  - `ai_ingestion`
  - `ai_image_opt`
  - `ai_duplicate_check`

#### Firebase Console - Analytics
افتح: https://console.firebase.google.com/project/fire-new-globul/analytics

تحقق من:
- ✅ أحداث مخصصة تُسجّل:
  - `ai_chat_interaction`
  - `ai_image_analysis`
  - `ai_price_suggestion`
  - `search_performed`
  - `listing_conversion`

---

## 🔥 حل المشاكل الشائعة

### مشكلة: Functions لا تنشر
```
Error: HTTP Error: 403, The caller does not have permission
```

**الحل:**
```powershell
firebase login --reauth
firebase use fire-new-globul
firebase deploy --only functions
```

---

### مشكلة: Email Alerts لا ترسل
**تحقق من:**
1. Config تم ضبطه: `firebase functions:config:get`
2. Gmail App Password صحيح (16 حرف بدون مسافات)
3. السجلات في Functions Console لا تظهر أخطاء SMTP

**اختبار يدوي:**
```powershell
firebase functions:shell
> sendErrorAlert({error: 'test', context: 'manual'})
```

---

### مشكلة: Gemini API تفشل
**أخطاء محتملة:**
- `429 Quota Exceeded` → انتظر حتى اليوم التالي (حد 1500 طلب/يوم)
- `401 Unauthorized` → تحقق من صحة `gemini.api_key`
- `400 Bad Request` → تحقق من صيغة الطلب في `data-ingestion.ts`

---

### مشكلة: Storage Rules ترفض الكتابة
**الحل:**
تأكد من نشر `storage.rules`:
```powershell
firebase deploy --only storage:rules
```

تحقق من القواعد في Console:
https://console.firebase.google.com/project/fire-new-globul/storage/rules

---

## 📊 مراقبة التكاليف (صفر متوقع)

### Firebase Spark (Free Plan)
**الحدود الشهرية:**
- Firestore: 50K reads, 20K writes, 1GB storage ✅
- Functions: 125K invocations, 40K GB-sec ✅
- Hosting: 10GB storage, 360MB/day bandwidth ✅
- Storage: 5GB, 1GB download/day ✅

**مراقبة الاستخدام:**
https://console.firebase.google.com/project/fire-new-globul/usage

**إنذارات:**
- إذا اقتربت من 80% من أي حد، ستصلك إنذارات عبر البريد
- Cloud Function `sendQuotaWarning` سترسل تنبيه تلقائي

### Gemini API (Free Tier)
**الحد:** 1500 طلب/يوم

**مراقبة:**
https://aistudio.google.com/app/apikey (Usage tab)

**تحسين:**
- استخدام الاستدلال بالقواعد أولاً (`inferCategoryByRules`)
- Gemini كاحتياط فقط (fallback)

---

## 🎯 نقاط الاتصال بعد النشر

### صفحة الإنتاج
https://fire-new-globul.web.app

### Firebase Console
https://console.firebase.google.com/project/fire-new-globul

### Google Cloud Console (للمراقبة المتقدمة)
https://console.cloud.google.com/home/dashboard?project=fire-new-globul

---

## 📝 سجل التغييرات (20 نوفمبر 2025)

### ✅ مكتمل
- [x] تنظيف بيانات السيارات (`data-ingestion.ts`)
- [x] تحسين الصور WebP (`image-optimization.ts`)
- [x] كشف التكرارات (`duplicate-detection.ts`)
- [x] تنبيهات البريد (`email-alerts.ts`)
- [x] Firebase Analytics events
- [x] Firebase Performance traces
- [x] Storage Rules للصور المحسّنة
- [x] Firestore Rules لسجلات AI
- [x] .env.example للأسرار
- [x] Dependencies installed (sharp, nodemailer)

### 🎯 المتبقي (اختياري)
- [ ] تفعيل SendGrid للإنتاج العالي
- [ ] إضافة Circuit Breaker لمكالمات Gemini
- [ ] Dashboard إداري لمراقبة AI operations
- [ ] A/B testing لتحسينات الأداء

---

## 🔒 ملاحظات أمنية

1. **لا تكشف الأسرار:** لا تشارك `firebase functions:config` output علنًا
2. **دوّر كلمات المرور:** مرة كل شهر على الأقل
3. **مراقبة السجلات:** تحقق من Functions Logs يومياً للأيام الأولى
4. **Rate Limiting:** القواعد الحالية تحمي من الإساءة، لكن راقب الاستخدام

---

## 📞 الدعم

إذا واجهت مشاكل:
1. راجع السجلات في Firebase Console
2. تحقق من `AI_IMPLEMENTATION_STATUS.md` للتفاصيل التقنية
3. راجع `.github/copilot-instructions.md` لمعمارية المشروع

---

**جاهز للنشر! 🚀**
