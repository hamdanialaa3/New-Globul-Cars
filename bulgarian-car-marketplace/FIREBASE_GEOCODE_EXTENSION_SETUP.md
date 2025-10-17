# 🗺️ إعداد Firebase Geocode Extension

## 📋 المعلومات المطلوبة

---

## 1️⃣ Collection ID

### أدخل:
```
cars
```

**الشرح:**
- هذا اسم الـ Collection في Firestore الذي يحتوي على السيارات
- الـ Extension ستراقب هذا الـ Collection
- عند إضافة أو تحديث سيارة، ستحسب الإحداثيات تلقائياً

---

## 2️⃣ Maps API Key

### أدخل:
```
AIzaSyDvULqHtzVQFWshx2fO755CMELUaMcm5_4
```

**الشرح:**
- هذا هو مفتاح Google Maps API
- نفس المفتاح المستخدم في المشروع
- تأكد من تفعيل Geocoding API و Distance Matrix API

---

## 3️⃣ Cloud Functions Location

### اختر:
```
Frankfurt (europe-west3)
```

**الشرح:**
- أقرب منطقة لبلغاريا
- أسرع وأفضل أداء
- لا يمكن تغييره بعد التثبيت

---

## 🔧 إعدادات متقدمة (Advanced Parameters)

### إذا طُلب منك، استخدم هذه القيم:

#### Address Field:
```
city,region
```

#### Coordinates Field:
```
coordinates
```

#### Distance Matrix Origin Field (اختياري):
```
userLocation
```

#### Distance Matrix Destination Field (اختياري):
```
coordinates
```

---

## ✅ الخطوات الكاملة

### 1. افتح صفحة الـ Extension:
```
https://console.firebase.google.com/project/fire-new-globul/extensions
```

### 2. ابحث عن:
```
Geocode Address in Firestore
```

### 3. اضغط **Install**

### 4. املأ النموذج:

```
Collection ID:          cars
Maps API key:           AIzaSyDvULqHtzVQFWshx2fO755CMELUaMcm5_4
Cloud Functions:        Frankfurt (europe-west3)
```

### 5. اضغط **Install extension**

### 6. انتظر 2-3 دقائق حتى يكتمل التثبيت

---

## 🎯 ماذا ستفعل الـ Extension؟

### تلقائياً عند إضافة سيارة:

```javascript
// عند إضافة سيارة جديدة
await db.collection('cars').add({
  make: 'BMW',
  model: '320d',
  city: 'София',
  region: 'София-град'
  // لا توجد coordinates
});

// الـ Extension ستضيف تلقائياً:
{
  make: 'BMW',
  model: '320d', 
  city: 'София',
  region: 'София-град',
  coordinates: {           // ✅ تُضاف تلقائياً!
    lat: 42.6977,
    lng: 23.3219
  }
}
```

---

## 🔄 تحديث السيارات الموجودة

بعد تثبيت الـ Extension، لتحديث السيارات الموجودة:

### الطريقة 1: من Console:
```
1. افتح: https://console.firebase.google.com/project/fire-new-globul/firestore
2. افتح Collection: cars
3. لكل سيارة:
   - اضغط على Document
   - أضف حقل مؤقت: trigger: true
   - احفظ
   - الـ Extension ستحسب coordinates
   - احذف حقل trigger
```

### الطريقة 2: من الكود (أفضل):

أنشئ سكريبت:

```javascript
// bulgarian-car-marketplace/scripts/update-all-car-coordinates.js

const admin = require('firebase-admin');
const serviceAccount = require('../secrets/fire-new-globul-firebase-adminsdk.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

async function updateAllCars() {
  const carsRef = db.collection('cars');
  const snapshot = await carsRef.get();
  
  console.log(`Found ${snapshot.size} cars to update`);
  
  let updated = 0;
  
  for (const doc of snapshot.docs) {
    const data = doc.data();
    
    // إذا لم يكن فيها coordinates
    if (!data.coordinates && data.city) {
      try {
        // أضف حقل trigger لتفعيل Extension
        await doc.ref.update({
          _trigger_geocode: admin.firestore.FieldValue.serverTimestamp()
        });
        
        updated++;
        console.log(`✅ Updated: ${data.make} ${data.model} in ${data.city}`);
        
        // انتظر قليلاً لتجنب Rate Limiting
        await new Promise(resolve => setTimeout(resolve, 100));
      } catch (error) {
        console.error(`❌ Error updating ${doc.id}:`, error);
      }
    }
  }
  
  console.log(`\n✅ Triggered geocoding for ${updated} cars`);
  console.log('⏳ Wait 1-2 minutes for the extension to process all cars');
}

updateAllCars()
  .then(() => process.exit(0))
  .catch(error => {
    console.error('Error:', error);
    process.exit(1);
  });
```

**تشغيل السكريبت:**
```bash
node scripts/update-all-car-coordinates.js
```

---

## ⚙️ إعدادات إضافية للـ Extension

### بعد التثبيت، يمكنك تكوين:

#### 1. Address Format:
```javascript
// كيف تُقرأ العناوين
addressFormat: '{city}, {region}, Bulgaria'
```

#### 2. Output Field:
```javascript
// أين تُحفظ النتيجة
outputField: 'coordinates'
```

#### 3. Error Handling:
```javascript
// ماذا تفعل عند الخطأ
onError: 'skip' // تخطي السجلات التي بها مشاكل
```

---

## 🎯 التحقق من عمل الـ Extension

### بعد التثبيت:

#### 1. أضف سيارة جديدة:
```
http://localhost:3000/sell
```

#### 2. أكمل النموذج:
- اختر محافظة: `Пловдив`
- اختر مدينة: `Пловдив`
- انشر السيارة

#### 3. تحقق من Firestore:
```
https://console.firebase.google.com/project/fire-new-globul/firestore
```

افتح السيارة الجديدة → يجب أن ترى:
```javascript
{
  city: "Пловдив",
  region: "Пловдив",
  coordinates: {        // ✅ تمت الإضافة تلقائياً!
    lat: 42.1354,
    lng: 24.7453
  }
}
```

---

## 🔍 مراقبة الـ Extension

### سجلات التنفيذ:
```
https://console.firebase.google.com/project/fire-new-globul/functions/logs
```

ستجد:
```
✅ Geocoding successful for document: cars/abc123
✅ Added coordinates: {lat: 42.1354, lng: 24.7453}
```

---

## 💰 التكلفة

### Geocoding API:
- **مجاناً:** أول 40,000 طلب/شهر
- **بعدها:** $5 لكل 1,000 طلب

### Distance Matrix API:
- **مجاناً:** ضمن $200 رصيد شهري
- **بعدها:** $5 لكل 1,000 عنصر

### Cloud Functions:
- **مجاناً:** أول 2 مليون استدعاء/شهر
- **بعدها:** $0.40 لكل مليون

### المتوقع لمشروعك:
- إضافة ~100 سيارة/شهر
- = 100 طلب Geocoding
- = **$0.00** (ضمن المجاني) ✅

---

## ⚠️ ملاحظات مهمة

### 1. Billing يجب أن يكون مُفعّل:
```
https://console.cloud.google.com/billing?project=fire-new-globul
```

إذا لم يكن مُفعّل:
- اربط بطاقة ائتمان
- لن تُحاسب (ضمن المجاني)
- لكنه مطلوب للـ Extension

### 2. APIs يجب أن تكون مُفعّلة:
- ✅ Geocoding API
- ✅ Distance Matrix API
- ✅ Cloud Tasks API (تُفعّل تلقائياً)

### 3. الصلاحيات:
الـ Extension تحتاج:
- Cloud Datastore User
- Secret Manager Secret Accessor
- Cloud Tasks Enqueuer

**كلها تُمنح تلقائياً عند التثبيت** ✅

---

## 🎉 بعد التثبيت

### سيحدث تلقائياً:

1. **عند إضافة سيارة جديدة:**
   - الـ Extension تقرأ `city` و `region`
   - تستدعي Geocoding API
   - تضيف حقل `coordinates`

2. **عند تحديث المدينة:**
   - الـ Extension تكتشف التغيير
   - تعيد حساب الإحداثيات
   - تحدّث حقل `coordinates`

3. **في الموقع:**
   - جميع السيارات ستحتوي على coordinates
   - خريطة Google Maps ستعمل
   - المسافة ستُحسب بدقة
   - الاتجاهات ستعمل

---

## ✅ قائمة التحقق

قبل التثبيت:
- [ ] Billing مُفعّل
- [ ] Geocoding API مُفعّلة
- [ ] Distance Matrix API مُفعّلة
- [ ] API Key جاهز

أثناء التثبيت:
- [ ] Collection ID: `cars`
- [ ] Maps API key: `AIzaSyDvULqHtzVQFWshx2fO755CMELUaMcm5_4`
- [ ] Location: `Frankfurt (europe-west3)`

بعد التثبيت:
- [ ] انتظر 2-3 دقائق
- [ ] أضف سيارة للاختبار
- [ ] تحقق من Firestore
- [ ] شاهد coordinates

---

## 🚀 النتيجة

بعد تثبيت الـ Extension:

```
✅ كل سيارة جديدة ستحتوي على coordinates تلقائياً
✅ خريطة Google Maps ستعمل بشكل مثالي
✅ المسافة ستُحسب بدقة
✅ الاتجاهات ستعمل
✅ الوقت المحلي سيُعرض
✅ كل شيء تلقائي!
```

---

**🎊 الـ Extension ستحل كل مشاكل الخرائط تلقائياً!** 🗺️

**تاريخ:** 16 أكتوبر 2025  
**الحالة:** جاهز للتثبيت

