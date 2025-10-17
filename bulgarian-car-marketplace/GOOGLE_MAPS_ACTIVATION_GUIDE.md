# 🗺️ دليل تفعيل Google Maps - خطوة بخطوة

## ⚠️ خطأ: "This page didn't load Google Maps correctly"

### السبب:
المفتاح غير مُفعّل بشكل كامل في Google Cloud، أو توجد قيود تمنع الاستخدام.

---

## ✅ الحل: 5 خطوات بسيطة

### الخطوة 1️⃣: افتح Google Cloud Console
```
https://console.cloud.google.com/google/maps-apis/credentials?project=fire-new-globul
```

### الخطوة 2️⃣: ابحث عن API Key
ستجد مفتاح باسم مشابه لـ:
- "Browser key (auto created by Firebase)"
- أو "API key 1"

**اضغط على أيقونة القلم (Edit)** ✏️

---

### الخطوة 3️⃣: إزالة القيود (مهم!)

#### أ. Application restrictions:
- اختر: **None** (مؤقتاً للاختبار)
- أو اختر: **HTTP referrers** وأضف:
  ```
  http://localhost:3000/*
  http://localhost:*/*
  ```

#### ب. API restrictions:
- اختر: **Don't restrict key** (مؤقتاً للاختبار)
- أو اختر: **Restrict key** وحدد الـ 7 APIs:
  - ✅ Maps JavaScript API
  - ✅ Geocoding API
  - ✅ Places API (New)
  - ✅ Distance Matrix API
  - ✅ Directions API
  - ✅ Time Zone API
  - ✅ Maps Embed API

**اضغط Save** 💾

---

### الخطوة 4️⃣: تأكد من تفعيل الـ APIs

افتح:
```
https://console.cloud.google.com/apis/library?project=fire-new-globul
```

ابحث عن كل API وتأكد من أنها **Enabled**:

1. **Maps JavaScript API** ← ابحث واضغط → Enable
2. **Geocoding API** ← ابحث واضغط → Enable  
3. **Places API (New)** ← ابحث واضغط → Enable
4. **Distance Matrix API** ← ابحث واضغط → Enable
5. **Directions API** ← ابحث واضغط → Enable
6. **Time Zone API** ← ابحث واضغط → Enable
7. **Maps Embed API** ← ابحث واضغط → Enable

⏳ **انتظر 1-2 دقيقة** بعد التفعيل!

---

### الخطوة 5️⃣: اختبر المشروع

```bash
# أوقف الخادم
Ctrl + C

# امسح الكاش
npm cache clean --force

# شغّل من جديد
npm start
```

ثم افتح:
```
http://localhost:3000/
```

انزل لقسم **"Cars by Cities"** - يجب أن تظهر الخريطة! ✅

---

## 🔍 إذا استمرت المشكلة

### تحقق من Console:

1. افتح Developer Tools: `F12`
2. اذهب لـ **Console**
3. ابحث عن أخطاء تبدأ بـ:
   ```
   Google Maps JavaScript API error:
   ```

### الأخطاء الشائعة:

#### ❌ "RefererNotAllowedMapError"
**الحل:** أضف `http://localhost:3000/*` في HTTP referrers

#### ❌ "ApiNotActivatedMapError"
**الحل:** فعّل **Maps JavaScript API** من المكتبة

#### ❌ "InvalidKeyMapError"
**الحل:** تأكد من صحة المفتاح

#### ❌ "RequestDenied"
**الحل:** تحقق من تفعيل Billing في Google Cloud

---

## 🎯 الحل البديل (Fallback)

إذا استمرت المشكلة، المشروع سيستخدم **خريطة SVG بديلة**:

### الميزات:
- ✅ خريطة بلغاريا مرسومة بـ SVG
- ✅ جميع الـ 28 مدينة
- ✅ Markers قابلة للنقر
- ✅ Tooltip عند التمرير
- ✅ عدادات السيارات
- ✅ تعمل بدون Google Maps

### للتبديل يدوياً:
```tsx
// في CityCarsSection/index.tsx
const [useGoogleMaps, setUseGoogleMaps] = useState(false); // false = استخدام SVG
```

---

## 💡 نصائح

### 1. للتطوير المحلي:
```
Application restrictions: None
API restrictions: Don't restrict key
```

### 2. للإنتاج:
```
Application restrictions: HTTP referrers
  - https://fire-new-globul.web.app/*
  - https://mobilebg.eu/*

API restrictions: Restrict key
  - فقط الـ 7 APIs المستخدمة
```

### 3. مراقبة الاستخدام:
```
https://console.cloud.google.com/google/maps-apis/metrics?project=fire-new-globul
```

---

## 🔑 التحقق من المفتاح

### المفتاح الحالي:
```
AIzaSyDvULqHtzVQFWshx2fO755CMELUaMcm5_4
```

### للتحقق من صحته:
افتح في المتصفح:
```
https://maps.googleapis.com/maps/api/js?key=AIzaSyDvULqHtzVQFWshx2fO755CMELUaMcm5_4&libraries=places
```

إذا رأيت كود JavaScript = **المفتاح صحيح** ✅

إذا رأيت خطأ = **المفتاح به مشكلة** ❌

---

## 📋 قائمة التحقق

قبل الاختبار، تأكد من:
- [ ] المفتاح موجود في `.env` أو مباشرة في الكود
- [ ] الـ 7 APIs مُفعّلة في Google Cloud
- [ ] API Key بدون قيود (للاختبار)
- [ ] انتظرت 1-2 دقيقة بعد التفعيل
- [ ] مسحت الكاش وأعدت التشغيل
- [ ] فتحت Console للتحقق من الأخطاء

---

## ✅ النتيجة المتوقعة

بعد التفعيل الصحيح:
```
✅ خريطة Google تظهر في الصفحة الرئيسية
✅ 28 مدينة مع Markers
✅ InfoWindow عند النقر
✅ عدادات السيارات
✅ لا توجد أخطاء في Console
```

---

## 🆘 إذا لم يعمل

**استخدم الخريطة البديلة:**

1. افتح: `src/pages/HomePage/CityCarsSection/index.tsx`
2. غيّر السطر 20:
   ```tsx
   const [useGoogleMaps, setUseGoogleMaps] = useState(false);
   ```
3. احفظ الملف
4. ستعمل الخريطة SVG البديلة!

---

**🎯 المشروع سيعمل في كلتا الحالتين!** ✅

**تاريخ:** 16 أكتوبر 2025  
**الحالة:** جاهز مع حل بديل

