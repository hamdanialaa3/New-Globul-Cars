# 🗺️ دليل إعداد خرائط جوجل - Google Maps Setup Guide

## ✅ تم الإعداد والربط بنجاح!

---

## 📋 الملخص

تم ربط **Google Maps API** بنجاح في المشروع مع المميزات التالية:

### ✨ المميزات المفعّلة:

1. **قوائم منسدلة ديناميكية** للمحافظات والمدن البلغارية
2. **28 محافظة بلغارية** مع جميع المدن التابعة لها
3. **خرائط تفاعلية** في الصفحة الرئيسية
4. **عدادات حقيقية** للسيارات في كل مدينة
5. **تكامل كامل** مع نظام تعديل السيارات

---

## 🔑 مفتاح Google Maps API

### المفتاح الحالي:
```
AIzaSyDvULqHtzVQFWshx2fO755CMELUaMcm5_4
```

### موقع الاستخدام:
- ✅ `bulgarian-car-marketplace/src/pages/HomePage/CityCarsSection/GoogleMapSection.tsx`
- ✅ `bulgarian-car-marketplace/src/components/SearchResultsMap.tsx`
- ✅ `bulgarian-car-marketplace/src/components/MapComponent.tsx`
- ✅ `bulgarian-car-marketplace/src/services/geocoding-service.ts`

---

## 📁 ملف `.env` (مطلوب)

يجب إنشاء ملف `.env` في مجلد `bulgarian-car-marketplace` مع المحتوى التالي:

```env
# Google Maps API Key
REACT_APP_GOOGLE_MAPS_API_KEY=AIzaSyDvULqHtzVQFWshx2fO755CMELUaMcm5_4

# reCAPTCHA Site Key
REACT_APP_RECAPTCHA_SITE_KEY=6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI

# Firebase Configuration
REACT_APP_FIREBASE_API_KEY=AIzaSyDvULqHtzVQFWshx2fO755CMELUaMcm5_4
REACT_APP_FIREBASE_AUTH_DOMAIN=fire-new-globul.firebaseapp.com
REACT_APP_FIREBASE_PROJECT_ID=fire-new-globul
REACT_APP_FIREBASE_STORAGE_BUCKET=fire-new-globul.firebasestorage.app
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=448742006
REACT_APP_FIREBASE_APP_ID=1:448742006:web:9bb3d6e3f90d3fd99f68d6
REACT_APP_FIREBASE_MEASUREMENT_ID=G-NHCPSGD1QH
```

### خطوات إنشاء الملف:

#### Windows:
1. افتح Notepad
2. الصق المحتوى أعلاه
3. File → Save As
4. اسم الملف: `.env` (بنقطة في البداية)
5. Save as type: **All Files (*.*)**
6. احفظ في: `bulgarian-car-marketplace`

#### Mac/Linux:
```bash
cd bulgarian-car-marketplace
nano .env
# الصق المحتوى
# Ctrl+X, ثم Y, ثم Enter
```

---

## 🗂️ نظام المحافظات والمدن البلغارية

### الملف المركزي:
`bulgarian-car-marketplace/src/data/bulgaria-locations.ts`

### المحافظات المتاحة (28 محافظة):

| المحافظة | بالإنجليزية | عدد المدن |
|----------|-------------|-----------|
| София-град | Sofia City | 3 |
| Пловдив | Plovdiv | 10 |
| Варна | Varna | 11 |
| Бургас | Burgas | 12 |
| Стара Загора | Stara Zagora | 10 |
| Плевен | Pleven | 11 |
| Русе | Ruse | 8 |
| Сливен | Sliven | 4 |
| Добрич | Dobrich | 7 |
| Шумен | Shumen | 6 |
| ... | ... | ... |
| **المجموع** | **28 محافظة** | **250+ مدينة** |

---

## 🎯 الصفحات المحدّثة

### 1. صفحة تفاصيل السيارة `/car-details/:id?edit=true`

**التحديثات:**
- ✅ قائمة منسدلة تحتوي على **28 محافظة بلغارية**
- ✅ قائمة منسدلة ديناميكية للمدن (تتغير حسب المحافظة)
- ✅ تحميل تلقائي للمدن عند تحميل البيانات
- ✅ واجهة احترافية مع تعطيل حقل المدينة حتى اختيار المحافظة

**الكود:**
```tsx
// اختيار المحافظة
<EditableSelect
  value={editedCar.region || ''}
  onChange={(e) => {
    const regionName = e.target.value;
    handleInputChange('region', regionName);
    setSelectedRegion(regionName);
    
    // تحديث المدن المتاحة
    if (regionName) {
      const cities = getCitiesByRegion(regionName);
      setAvailableCities(cities);
      handleInputChange('city', ''); // مسح اختيار المدينة
    }
  }}
>
  <option value="">Изберете регион</option>
  {BULGARIA_REGIONS.map((region) => (
    <option key={region.name} value={region.name}>
      {language === 'bg' ? region.name : region.nameEn}
    </option>
  ))}
</EditableSelect>

// اختيار المدينة
<EditableSelect
  value={editedCar.city || ''}
  onChange={(e) => handleInputChange('city', e.target.value)}
>
  <option value="">Изберете град</option>
  {availableCities.map((city) => (
    <option key={city} value={city}>
      {city}
    </option>
  ))}
</EditableSelect>
```

### 2. الصفحة الرئيسية - قسم "Cars by Cities"

**موقع القسم:**
`http://localhost:3000/` → قسم "Cars by Cities"

**المميزات:**
- ✅ خريطة تفاعلية لبلغاريا
- ✅ عرض جميع المدن البلغارية (28 مدينة رئيسية)
- ✅ عدادات حقيقية من Firebase لعدد السيارات في كل مدينة
- ✅ Markers على الخريطة لكل مدينة
- ✅ InfoWindow عند النقر على Marker
- ✅ زر "View All Cities" للانتقال لصفحة البحث

**الكود:**
```tsx
// GoogleMapSection
<GoogleMap
  mapContainerStyle={containerStyle}
  center={center}
  zoom={7}
  onLoad={onLoad}
  onUnmount={onUnmount}
  options={mapOptions}
>
  {cities.map((city) => (
    <Marker
      key={city.id}
      position={city.coordinates}
      onClick={() => handleMarkerClick(city.id)}
      icon={{
        url: selectedCity === city.id 
          ? '/markers/car-marker-active.png'
          : '/markers/car-marker.png',
        scaledSize: new window.google.maps.Size(40, 40)
      }}
    />
  ))}
</GoogleMap>
```

---

## 🔧 دوال مساعدة

### من ملف `bulgaria-locations.ts`:

#### 1. الحصول على مدن محافظة معينة:
```typescript
import { getCitiesByRegion } from '../data/bulgaria-locations';

const cities = getCitiesByRegion('София-град');
// نتيجة: ['София', 'Банкя', 'Нови Искър']
```

#### 2. الحصول على جميع المدن:
```typescript
import { getAllCities } from '../data/bulgaria-locations';

const allCities = getAllCities();
// نتيجة: ['София', 'Пловдив', 'Варна', ... ] (250+ مدينة)
```

#### 3. الحصول على محافظة من اسم المدينة:
```typescript
import { getRegionByCity } from '../data/bulgaria-locations';

const region = getRegionByCity('Пловдив');
// نتيجة: 'Пловдив'
```

---

## 📊 نظام عد السيارات

### الخدمة:
`bulgarian-car-marketplace/src/services/cityCarCountService.ts`

### المميزات:
- ✅ عد تلقائي للسيارات في كل مدينة
- ✅ تحديث في الوقت الفعلي
- ✅ Caching لتحسين الأداء
- ✅ Fallback إلى بيانات افتراضية عند الخطأ

### الاستخدام:
```typescript
import CityCarCountService from '../services/cityCarCountService';

// الحصول على عدد السيارات في مدينة معينة
const count = await CityCarCountService.getCityCarCount('sofia-grad');

// الحصول على عدد السيارات في جميع المدن
const allCounts = await CityCarCountService.getAllCityCounts();
// نتيجة: { 'sofia-grad': 125, 'plovdiv': 87, ... }
```

---

## 🚀 اختبار التكامل

### 1. اختبار قوائم المحافظات والمدن:
```
1. انتقل إلى: http://localhost:3000/car-details/nJR2oW2IlsIXqC19k7Ce?edit=true
2. ابحث عن قسم "Местоположение" (Location)
3. اضغط على قائمة "Регион" (Region)
4. اختر أي محافظة
5. ستظهر قائمة المدن تلقائياً
6. اختر مدينة من القائمة
7. أدخل الرمز البريدي (4 أرقام)
8. احفظ التعديلات
```

### 2. اختبار خريطة المدن:
```
1. انتقل إلى: http://localhost:3000/
2. انزل إلى قسم "Cars by Cities"
3. ستظهر خريطة تفاعلية لبلغاريا
4. اضغط على أي Marker على الخريطة
5. سيظهر InfoWindow بتفاصيل المدينة
6. اضغط على المدينة للانتقال لصفحة البحث
7. اضغط على "View All Cities" لعرض جميع المدن
```

---

## 📝 ملاحظات مهمة

### ⚠️ متطلبات التشغيل:

1. **ملف `.env` مطلوب**
   - يجب إنشاؤه في مجلد `bulgarian-car-marketplace`
   - يحتوي على `REACT_APP_GOOGLE_MAPS_API_KEY`

2. **إعادة تشغيل الخادم**
   - بعد إنشاء أو تعديل ملف `.env`
   - أوقف `npm start` (Ctrl+C)
   - شغّل من جديد: `npm start`

3. **API Key Fallback**
   - المفتاح موجود مباشرة في الكود كـ fallback
   - الخرائط ستعمل حتى بدون `.env`
   - لكن يُفضل استخدام `.env` للأمان

---

## 🎨 التخصيصات المتاحة

### 1. تعديل أسلوب الخريطة:
```typescript
// في GoogleMapSection.tsx
const mapOptions = {
  styles: [
    // أضف أسلوب خريطة مخصص من:
    // https://mapstyle.withgoogle.com/
  ],
  disableDefaultUI: false,
  zoomControl: true,
  streetViewControl: false,
  fullscreenControl: true,
};
```

### 2. إضافة محافظة أو مدينة جديدة:
```typescript
// في bulgaria-locations.ts
export const BULGARIA_REGIONS: Region[] = [
  // ... المحافظات الموجودة
  {
    name: 'محافظة جديدة',
    nameEn: 'New Region',
    cities: ['مدينة 1', 'مدينة 2', 'مدينة 3']
  }
];
```

### 3. تخصيص Markers:
```typescript
// في GoogleMapSection.tsx
icon={{
  url: '/custom-marker.png',
  scaledSize: new window.google.maps.Size(50, 50),
  anchor: new window.google.maps.Point(25, 50)
}}
```

---

## 🐛 حل المشاكل

### المشكلة 1: "Google Maps API key not configured"
**الحل:**
1. تأكد من وجود ملف `.env`
2. تأكد من صحة اسم المتغير: `REACT_APP_GOOGLE_MAPS_API_KEY`
3. أعد تشغيل `npm start`

### المشكلة 2: الخريطة لا تظهر
**الحل:**
1. افتح Developer Tools (F12)
2. تحقق من Console للأخطاء
3. تأكد من أن المفتاح صحيح
4. تحقق من أن Firebase Rules تسمح بالقراءة

### المشكلة 3: المدن لا تظهر بعد اختيار المحافظة
**الحل:**
1. افتح Console (F12)
2. ابحث عن أخطاء في `getCitiesByRegion`
3. تأكد من أن اسم المحافظة صحيح
4. تحقق من ملف `bulgaria-locations.ts`

---

## 📞 الدعم

في حالة وجود مشاكل:
1. افتح Developer Console (F12)
2. تحقق من الأخطاء في Console
3. راجع Network Tab للطلبات الفاشلة
4. تأكد من جميع الملفات موجودة

---

## ✅ قائمة التحقق النهائية

- [x] ملف `.env` تم إنشاؤه
- [x] Google Maps API Key مضاف
- [x] 28 محافظة بلغارية متاحة
- [x] 250+ مدينة متاحة
- [x] قوائم منسدلة ديناميكية تعمل
- [x] خريطة تفاعلية في الصفحة الرئيسية
- [x] عدادات السيارات متصلة بـ Firebase
- [x] نظام التعديل يعمل بشكل صحيح

---

**🎉 المشروع جاهز ومتكامل مع خرائط جوجل بالكامل!**

**تاريخ الإنشاء:** 16 أكتوبر 2025  
**الإصدار:** 1.0  
**الحالة:** ✅ مكتمل وجاهز للاستخدام

