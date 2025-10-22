# 🗺️ Google Maps Setup Guide - دليل إعداد خرائط جوجل

## 📋 المتطلبات

لتشغيل خريطة المدن البلغارية، تحتاج إلى Google Maps API Key.

---

## 🔑 الحصول على API Key

### الخطوة 1: إنشاء مشروع في Google Cloud
1. اذهب إلى [Google Cloud Console](https://console.cloud.google.com/)
2. قم بإنشاء مشروع جديد أو اختر مشروع موجود
3. اسم المشروع: `Globul Cars Maps`

### الخطوة 2: تفعيل Maps JavaScript API
1. في Google Cloud Console، اذهب إلى **APIs & Services** > **Library**
2. ابحث عن: **Maps JavaScript API**
3. اضغط **Enable**

### الخطوة 3: إنشاء API Key
1. اذهب إلى **APIs & Services** > **Credentials**
2. اضغط **Create Credentials** > **API key**
3. انسخ الـ API Key
4. (اختياري) قم بتقييد الـ API Key:
   - **Application restrictions**: HTTP referrers
   - أضف domain: `localhost:3000/*` (للتطوير)
   - أضف domain: `yourdomain.com/*` (للإنتاج)
   - **API restrictions**: اختر Maps JavaScript API فقط

---

## ⚙️ التكوين في المشروع

### إضافة API Key

**الطريقة 1: ملف .env (موصى بها)**

1. أنشئ ملف `.env` في المجلد الرئيسي:
```bash
cd bulgarian-car-marketplace
```

2. أضف الـ API Key:
```env
REACT_APP_GOOGLE_MAPS_API_KEY=YOUR_API_KEY_HERE
```

3. أعد تشغيل المشروع:
```bash
npm start
```

**الطريقة 2: مباشرة في الكود (للتجربة فقط)**

افتح `src/pages/HomePage/CityCarsSection/GoogleMapSection.tsx`:
```typescript
googleMapsApiKey: 'YOUR_API_KEY_HERE'
```

⚠️ **تحذير:** لا تضع API Key مباشرة في الكود في الإنتاج!

---

## 🎨 تخصيص الخريطة

### تغيير الألوان
```typescript
// في GoogleMapSection.tsx
const mapOptions = {
  styles: [
    {
      featureType: 'water',
      elementType: 'geometry',
      stylers: [{ color: '#e3f2fd' }]
    },
    {
      featureType: 'landscape',
      elementType: 'geometry',
      stylers: [{ color: '#f5f5f5' }]
    }
  ]
};
```

### تغيير الارتفاع
```typescript
// في GoogleMapSection.tsx
const MapContainer = styled.div`
  height: 400px; // غيّر هذا الرقم
`;
```

### تغيير المركز والتكبير
```typescript
const BULGARIA_CENTER = {
  lat: 42.7339,  // المركز الشمالي/الجنوبي
  lng: 25.4858   // المركز الشرقي/الغربي
};

// في GoogleMap component:
zoom={7} // من 1 (بعيد) إلى 20 (قريب)
```

---

## 🎯 المميزات المفعّلة

### ✅ Maps JavaScript API
- عرض الخريطة
- Markers للمدن
- InfoWindows للتفاصيل

### ⚠️ APIs اختيارية (غير مطلوبة حالياً):
- Places API (للبحث عن الأماكن)
- Geocoding API (لتحويل العناوين)
- Directions API (للمسارات)

---

## 💰 التسعير

### الاستخدام المجاني
Google Maps يوفر **$200 رصيد مجاني شهرياً**

هذا يعادل:
- **28,000** تحميل للخريطة شهرياً
- **~933** زائر يومياً

### إذا تجاوزت الحد المجاني:
- كل 1,000 تحميل إضافي = **$7**
- يمكن وضع حد أقصى للاستخدام

---

## 🔒 الأمان

### تقييد API Key (موصى به)

1. **Application restrictions:**
```
HTTP referrers:
- http://localhost:3000/*
- https://yourdomain.com/*
- https://www.yourdomain.com/*
```

2. **API restrictions:**
```
Only allow:
- Maps JavaScript API
```

### لماذا التقييد؟
- ✅ يمنع الاستخدام غير المصرح به
- ✅ يحمي من سرقة API Key
- ✅ يحد من التكاليف غير المتوقعة

---

## 🧪 الاختبار

### تحقق من عمل الخريطة:

1. شغّل المشروع:
```bash
npm start
```

2. افتح الصفحة الرئيسية: `http://localhost:3000`

3. تحقق من:
   - ✅ الخريطة تظهر
   - ✅ 28 marker للمدن
   - ✅ النقر على marker يفتح InfoWindow
   - ✅ زر "View Cars" ينقل للصفحة المفلترة

### إذا لم تظهر الخريطة:

**الخطأ:** "Loading map..."
- **السبب:** API Key مفقود أو غير صحيح
- **الحل:** تأكد من `.env` وأعد التشغيل

**الخطأ:** "For development purposes only"
- **السبب:** API Key غير مقيّد
- **الحل:** قيّد الـ API Key في Google Cloud Console

**الخطأ:** Console error
- **السبب:** Maps JavaScript API غير مفعّل
- **الحل:** فعّل Maps JavaScript API في Google Cloud

---

## 📊 المميزات الحالية

```
✅ خريطة Google Maps حقيقية
✅ 28 مدينة بلغارية
✅ Markers تفاعلية مع glow
✅ InfoWindow معلومات فورية
✅ عداد السيارات لكل مدينة
✅ تنقل تلقائي عند النقر
✅ دعم ثنائي اللغة (بلغاري/إنجليزي)
✅ Responsive design
✅ Loading states
✅ Error handling
```

---

## 🚀 الاستخدام

### في الصفحة الرئيسية
القسم يظهر تلقائياً في:
```
HomePage > CityCarsSection > GoogleMapSection
```

### التنقل
```
خريطة → نقر على مدينة → InfoWindow → "View Cars" → /cars?city=CITY_ID
```

---

## 📁 الملفات ذات الصلة

```
bulgarian-car-marketplace/
├── .env                                          # API Key هنا
├── src/
│   └── pages/
│       └── HomePage/
│           └── CityCarsSection/
│               ├── GoogleMapSection.tsx          # الخريطة
│               ├── CityGrid.tsx                  # الشبكة
│               ├── index.tsx                     # المكون الرئيسي
│               └── styles.ts                     # التنسيقات
└── GOOGLE_MAPS_SETUP.md                         # هذا الملف
```

---

## 🔧 استكشاف الأخطاء

### المشكلة: الخريطة لا تظهر
```bash
# 1. تحقق من API Key
echo $REACT_APP_GOOGLE_MAPS_API_KEY

# 2. أعد التشغيل
npm start

# 3. تحقق من Console
# افتح Developer Tools > Console
# ابحث عن أخطاء Google Maps
```

### المشكلة: "This API key is not authorized"
```
الحل:
1. اذهب إلى Google Cloud Console
2. Credentials > قيّد API Key
3. أضف localhost:3000 للـ HTTP referrers
4. احفظ وانتظر دقيقة
5. أعد تحميل الصفحة
```

### المشكلة: Markers لا تظهر
```typescript
// تحقق من الإحداثيات في bulgarianCities.ts
// تأكد أنها ضمن حدود بلغاريا:
// lat: 41.2 - 44.2
// lng: 22.4 - 28.6
```

---

## 💡 نصائح الأداء

### تحسين التحميل
```typescript
// استخدام lazyLoad للخريطة
const { isLoaded } = useJsApiLoader({
  id: 'google-map-script',
  googleMapsApiKey: API_KEY,
  libraries: ['places'] // فقط إذا احتجت
});
```

### تقليل التكاليف
- استخدم Static Maps API للصور الثابتة
- فعّل Caching
- استخدم Clustering للـ Markers الكثيرة

---

## 🎉 النتيجة

```
╔════════════════════════════════════════════╗
║  🗺️ Google Maps Integration             ║
║                                            ║
║  ✅ خريطة حقيقية من Google              ║
║  ✅ 28 مدينة بلغارية                     ║
║  ✅ Markers تفاعلية                       ║
║  ✅ InfoWindow معلومات                   ║
║  ✅ تنقل مباشر للسيارات                 ║
║  ✅ ارتفاع محسّن (400px)                 ║
║                                            ║
║  🚀 جاهز للاستخدام!                     ║
╚════════════════════════════════════════════╝
```

---

**Made with ❤️ for Globul Cars** 🇧🇬🚗


