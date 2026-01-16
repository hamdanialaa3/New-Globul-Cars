# Google Maps API Setup Guide
## دليل إعداد Google Maps API

## المشكلة
```
Google Maps Platform rejected your request. The provided API key is invalid.
```

## الحل السريع

### 1. الحصول على Google Maps API Key

1. **اذهب إلى Google Cloud Console:**
   - https://console.cloud.google.com/

2. **اختر المشروع أو أنشئ مشروع جديد**

3. **فعّل APIs المطلوبة:**
   - اذهب إلى: **APIs & Services** → **Library**
   - فعّل هذه APIs:
     - ✅ **Maps JavaScript API**
     - ✅ **Maps Embed API** (للخرائط الثابتة)
     - ✅ **Geocoding API** (لتحويل العناوين إلى إحداثيات)
     - ✅ **Places API** (للبحث عن الأماكن)

4. **إنشاء API Key:**
   - اذهب إلى: **APIs & Services** → **Credentials**
   - اضغط **Create Credentials** → **API Key**
   - انسخ المفتاح

5. **تقييد المفتاح (مهم للأمان):**
   - اضغط على المفتاح الذي أنشأته
   - في **Application restrictions**:
     - اختر **HTTP referrers (web sites)**
     - أضف النطاقات المسموحة:
       - `localhost:*`
       - `*.web.app`
       - `*.firebaseapp.com`
       - `mobilebg.eu`
       - `*.mobilebg.eu`
   
   - في **API restrictions**:
     - اختر **Restrict key**
     - اختر فقط:
       - Maps JavaScript API
       - Maps Embed API
       - Geocoding API
       - Places API

### 2. إضافة المفتاح إلى المشروع

1. **افتح ملف `.env` في جذر المشروع**

2. **أضف السطر التالي:**
   ```env
   REACT_APP_GOOGLE_MAPS_API_KEY=YOUR_API_KEY_HERE
   ```

3. **استبدل `YOUR_API_KEY_HERE` بالمفتاح الذي نسخته**

4. **احفظ الملف**

5. **أعد تشغيل خادم التطوير:**
   ```bash
   npm start
   ```

### 3. التحقق من الإعداد

بعد إعادة التشغيل، يجب أن تعمل الخرائط بشكل صحيح.

## ملاحظات مهمة

- ⚠️ **لا تشارك المفتاح** مع أي شخص
- ⚠️ **لا ترفع ملف `.env`** إلى Git
- ✅ **استخدم تقييدات API** لحماية المفتاح
- ✅ **راقب الاستخدام** في Google Cloud Console

## استكشاف الأخطاء

### الخطأ: "API key not valid"
- تأكد من أن المفتاح صحيح
- تأكد من تفعيل APIs المطلوبة
- تحقق من تقييدات HTTP referrers

### الخطأ: "This API project is not authorized"
- تأكد من تفعيل Maps JavaScript API
- تأكد من تفعيل Maps Embed API

### الخريطة لا تظهر
- افتح Console في المتصفح (F12)
- ابحث عن أخطاء JavaScript
- تحقق من أن المفتاح موجود في `.env`

## الدعم

إذا استمرت المشكلة:
1. تحقق من Google Cloud Console → APIs & Services → Credentials
2. راجع Usage & Quotas للتأكد من عدم تجاوز الحدود
3. تحقق من Billing (قد تحتاج إلى تفعيل الفوترة)

---

**تاريخ الإنشاء:** يناير 2026
