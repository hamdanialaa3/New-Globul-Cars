# Google Maps API - Complete Setup Guide
## دليل شامل لإعداد Google Maps API

**آخر تحديث:** 15 يناير 2026  
**الحالة:** ✅ تم إنشاء المفتاح وإضافته إلى المشروع

> **ملاحظة:** هذا الدليل يغطي كل ما تحتاجه لإعداد واستخدام Google Maps API. للرجوع السريع، انظر الأقسام المحددة أدناه.

---

## 📋 نظرة عامة

هذا الدليل الشامل يغطي كل ما تحتاجه لإعداد واستخدام Google Maps API في المشروع.

---

## 🔑 المفتاح الحالي

**المفتاح المضاف إلى المشروع:**
```
AIzaSyBNNqHpz4tjaEwbHtPadlS0kk_BUgulmMo
```

**الحالة:**
- ✅ موجود في ملف `.env` كـ `REACT_APP_GOOGLE_MAPS_API_KEY`
- ✅ مقيد بـ APIs التالية:
  - Maps JavaScript API
  - Maps Embed API
  - Geocoding API
  - Places API

---

## 🚀 الإعداد السريع

### الخطوة 1: التحقق من المفتاح

```powershell
# في PowerShell
findstr "REACT_APP_GOOGLE_MAPS_API_KEY" .env
```

يجب أن يظهر:
```
REACT_APP_GOOGLE_MAPS_API_KEY=AIzaSyBNNqHpz4tjaEwbHtPadlS0kk_BUgulmMo
```

### الخطوة 2: إعادة تشغيل التطبيق

```bash
npm start
```

### الخطوة 3: اختبار الخريطة

افتح:
```
http://localhost:3001/profile/view/90
```

---

## 🔧 إنشاء مفتاح جديد (إذا لزم الأمر)

### الطريقة 1: من Google Cloud Console (الأسهل)

1. **افتح:**
   ```
   https://console.cloud.google.com/apis/credentials?project=fire-new-globul
   ```

2. **اضغط "Create Credentials" → "API Key"**

3. **انسخ المفتاح**

4. **قيّد المفتاح:**
   - اضغط على المفتاح
   - **Application restrictions:** HTTP referrers
     - `localhost:*`
     - `*.web.app`
     - `*.firebaseapp.com`
     - `mobilebg.eu`
     - `*.mobilebg.eu`
   - **API restrictions:** Restrict key
     - Maps JavaScript API
     - Maps Embed API
     - Geocoding API
     - Places API

### الطريقة 2: من Google Cloud Shell (برمجياً)

انسخ الأوامر التالية إلى Google Cloud Shell:

```bash
# 1. التحقق من المشروع
gcloud config get-value project

# 2. تفعيل APIs
gcloud services enable maps-backend.googleapis.com --project=fire-new-globul
gcloud services enable maps-embed-backend.googleapis.com --project=fire-new-globul
gcloud services enable geocoding-backend.googleapis.com --project=fire-new-globul
gcloud services enable places-backend.googleapis.com --project=fire-new-globul

# 3. إنشاء API Key
gcloud alpha services api-keys create \
  --display-name="Maps-API-Key-$(date +%Y%m%d)" \
  --api-target=service=maps-backend.googleapis.com \
  --api-target=service=maps-embed-backend.googleapis.com \
  --api-target=service=geocoding-backend.googleapis.com \
  --api-target=service=places-backend.googleapis.com \
  --project=fire-new-globul
```

**إذا فشلت الخطوة 3:**
```bash
gcloud services api-keys create \
  --display-name="Maps-API-Key-$(date +%Y%m%d)" \
  --project=fire-new-globul
```

**عرض المفاتيح:**
```bash
gcloud services api-keys list --project=fire-new-globul
```

**الحصول على قيمة المفتاح:**
```bash
gcloud services api-keys get-key-string KEY_ID --project=fire-new-globul
```

---

## 🔄 تحديث المفتاح في المشروع

بعد الحصول على مفتاح جديد:

1. **افتح ملف `.env`**

2. **حدّث السطر:**
   ```env
   REACT_APP_GOOGLE_MAPS_API_KEY=YOUR_NEW_KEY_HERE
   ```

3. **أعد تشغيل التطبيق:**
   ```bash
   npm start
   ```

---

## 📍 استخدام الخرائط في الكود

### في Components:

```typescript
import { GOOGLE_MAPS_API_KEY } from '@/services/maps-config';
import StaticMapEmbed from '@/components/StaticMapEmbed';

// استخدام StaticMapEmbed
<StaticMapEmbed
  location={{
    city: 'София',
    region: 'София',
    coordinates: { lat: 42.6977, lng: 23.3219 }
  }}
  zoom={13}
/>
```

### في Services:

```typescript
import { GOOGLE_MAPS_API_KEY } from '@/services/maps-config';
import { GeocodingService } from '@/services/geocoding-service';

const geocodingService = new GeocodingService();
const result = await geocodingService.geocodeAddress('София, Bulgaria');
```

---

## 🐛 استكشاف الأخطاء

### الخطأ: "API key is invalid"

**الحل:**
1. تحقق من أن المفتاح موجود في `.env`
2. تأكد من إعادة تشغيل التطبيق بعد التعديل
3. امسح cache المتصفح (Ctrl + Shift + Delete)

### الخطأ: "REQUEST_DENIED"

**الحل:**
1. تحقق من تفعيل APIs في Google Cloud Console
2. تحقق من تقييدات HTTP referrers
3. تأكد من أن النطاق مسموح

### الخريطة لا تظهر

**الحل:**
1. افتح Console في المتصفح (F12)
2. ابحث عن أخطاء JavaScript
3. تحقق من Network tab لطلبات Google Maps

---

## 🔒 الأمان

### أفضل الممارسات:

1. **استخدم تقييدات HTTP referrers** - تحدد من يمكنه استخدام المفتاح
2. **استخدم تقييدات API** - تحدد أي APIs يمكن استخدامها
3. **راقب الاستخدام** - راجع Usage & Quotas في Google Cloud Console
4. **لا ترفع `.env` إلى Git** - تأكد من وجوده في `.gitignore`

---

## 📚 الملفات المرتبطة

- `src/services/maps-config.ts` - تكوين المفتاح
- `src/services/google-maps-enhanced.service.ts` - خدمة الخرائط المحسنة
- `src/services/geocoding-service.ts` - خدمة Geocoding
- `src/components/StaticMapEmbed/index.tsx` - مكون الخريطة الثابتة
- `src/components/MapComponent.tsx` - مكون الخريطة التفاعلية

---

## 🔗 روابط مفيدة

- **Google Cloud Console:** https://console.cloud.google.com/apis/credentials?project=fire-new-globul
- **Maps JavaScript API Docs:** https://developers.google.com/maps/documentation/javascript
- **Maps Embed API Docs:** https://developers.google.com/maps/documentation/embed
- **Geocoding API Docs:** https://developers.google.com/maps/documentation/geocoding

---

**الحالة الحالية:** ✅ مكون وجاهز للاستخدام
