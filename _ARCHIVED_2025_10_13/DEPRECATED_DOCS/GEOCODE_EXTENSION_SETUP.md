# دليل تفعيل إضافة Geocode Address في Firestore
## Firebase Extension: firestore-geocode-address

---

## 📋 المعلومات المطلوبة للتفعيل

### 1️⃣ Collection ID (معرف المجموعة) - **مطلوب**
اختر واحدة من المجموعات التالية حسب احتياجك:

```
cars
```
**الموصى به**: استخدم `cars` لأنها المجموعة الرئيسية التي تحتوي على عناوين السيارات المعروضة.

**مجموعات أخرى متاحة** (إذا أردت استخدامها):
- `users` - لتخزين مواقع المستخدمين
- `dealers` - لتخزين مواقع التجار
- `chatRooms` - لتخزين مواقع غرف الدردشة

---

### 2️⃣ Maps API Key (مفتاح Google Maps) - **مطلوب**

**⚠️ هام جداً**: يجب إنشاء مفتاح Google Maps API أولاً

#### خطوات الحصول على المفتاح:

1. **افتح Google Cloud Console**
   ```
   https://console.cloud.google.com
   ```

2. **سجل دخول بالحساب**
   ```
   globul.net.m@gmail.com
   ```

3. **اختر المشروع**
   ```
   Project ID: studio-448742006-a3493
   Project Name: New Globul Cars FG
   ```

4. **فعّل Google Maps APIs**
   - اذهب إلى: `APIs & Services` > `Library`
   - ابحث عن وفعّل:
     - ✅ **Geocoding API** (الأساسية)
     - ✅ **Distance Matrix API** (للمسافات)
     - ✅ **Maps JavaScript API** (اختياري)
     - ✅ **Places API** (اختياري)

5. **أنشئ مفتاح API**
   - اذهب إلى: `APIs & Services` > `Credentials`
   - اضغط: `+ CREATE CREDENTIALS`
   - اختر: `API key`
   - **سينشئ مفتاح يبدأ بـ**: `AIzaSy...`

6. **قيّد المفتاح (للأمان)**
   - اضغط على اسم المفتاح لتحريره
   - في `API restrictions`:
     - اختر: `Restrict key`
     - فعّل فقط:
       - Geocoding API
       - Distance Matrix API
   - في `Application restrictions`:
     - اختر: `HTTP referrers (web sites)`
     - أضف:
       ```
       https://studio-448742006-a3493.web.app/*
       https://studio-448742006-a3493.firebaseapp.com/*
       localhost:*
       ```

7. **انسخ المفتاح**
   ```
   مثال: AIzaSyC4XJ9KvRQ6fJ6_JjUr-E8vXoMgN4D7pCE
   ```

---

### 3️⃣ Cloud Functions Location (موقع الوظائف السحابية)
```
us-central1
```
✅ **تم تحديده مسبقاً** - لا تغيره

---

### 4️⃣ معلومات المشروع (للمراجعة)

```yaml
Firebase Project ID: studio-448742006-a3493
Firebase API Key: AIzaSyBrQmYxT_t8-RnOX4vfRKJ1CJ3f5LBfBJc
Auth Domain: studio-448742006-a3493.firebaseapp.com
Storage Bucket: studio-448742006-a3493.appspot.com
Messaging Sender ID: 448742006
App ID: 1:448742006:web:globul-cars-marketplace
```

---

## 📝 ملء النموذج في Firebase Console

### الحقول المطلوبة:

| الحقل | القيمة |
|-------|--------|
| **Collection ID** | `cars` |
| **Maps API key** | `AIzaSy...` (المفتاح الذي أنشأته) |
| **Cloud Functions location** | `us-central1` |

### الحقول الاختيارية (Parameters المتقدمة):

يمكنك ترك القيم الافتراضية:

| الحقل | القيمة الافتراضية |
|-------|-------------------|
| **Function timeout seconds** | 540 |
| **Minimum function instances** | 0 |
| **Maximum function instances** | 1000 |
| **Function memory** | 256MB |
| **VPC Connector** | (اتركه فارغاً) |
| **Function ingress settings** | Allow all traffic |

---

## 🔧 كيفية استخدام الإضافة بعد التفعيل

### مثال 1: إضافة عنوان لسيارة

```javascript
import { collection, addDoc } from 'firebase/firestore';
import { db } from './firebase-config';

// عند إضافة سيارة جديدة
await addDoc(collection(db, 'cars'), {
  make: 'BMW',
  model: 'X5',
  year: 2023,
  price: 45000,
  
  // أضف حقل العنوان
  address: 'Sofia, Bulgaria, Tsarigradsko Shose 115',
  
  // الإضافة ستضيف تلقائياً:
  // - location.lat: (إحداثيات خطوط العرض)
  // - location.lng: (إحداثيات خطوط الطول)
  // - geopoint: (نقطة جغرافية)
});
```

### مثال 2: تحديث عنوان موجود

```javascript
import { doc, updateDoc } from 'firebase/firestore';

// عند تحديث العنوان
await updateDoc(doc(db, 'cars', 'car-id-123'), {
  address: 'Plovdiv, Bulgaria, Central Street 25'
  // سيتم تحديث الإحداثيات تلقائياً
});
```

### مثال 3: حساب المسافة بين عنوانين

```javascript
// الإضافة توفر أيضاً Distance Matrix API
// لحساب المسافة والوقت بين موقعين

import { doc, getDoc } from 'firebase/firestore';

const car1 = await getDoc(doc(db, 'cars', 'car-id-1'));
const car2 = await getDoc(doc(db, 'cars', 'car-id-2'));

// استخدم الإحداثيات من location.lat و location.lng
const distance = calculateDistance(
  car1.data().location,
  car2.data().location
);
```

---

## 📊 هيكل البيانات المتوقع

### قبل التفعيل:
```json
{
  "make": "BMW",
  "model": "X5",
  "address": "Sofia, Bulgaria"
}
```

### بعد التفعيل:
```json
{
  "make": "BMW",
  "model": "X5",
  "address": "Sofia, Bulgaria",
  "location": {
    "lat": 42.6977,
    "lng": 23.3219,
    "geohash": "sx1m9hhm"
  },
  "geopoint": {
    "_latitude": 42.6977,
    "_longitude": 23.3219
  },
  "geocoded": true,
  "geocoded_at": "2025-09-30T12:00:00Z"
}
```

---

## 💰 التكلفة والفواتير

### Google Maps Platform Pricing:

#### Geocoding API:
- **أول 40,000 طلب/شهر**: مجاناً
- **بعد ذلك**: $5.00 لكل 1,000 طلب

#### Distance Matrix API:
- **أول 40,000 عنصر/شهر**: مجاناً
- **بعد ذلك**: $5.00 لكل 1,000 عنصر

#### Cloud Functions (Firebase):
- **الطبقة المجانية**:
  - 2M invocations/month
  - 400,000 GB-seconds
  - 200,000 CPU-seconds
  - 5GB outbound data

**💡 نصيحة**: للمشاريع الصغيرة والمتوسطة، ستبقى ضمن الحد المجاني

---

## 🛡️ الأمان والصلاحيات

الإضافة تحتاج إلى الصلاحيات التالية:

✅ **Cloud Datastore User** - للقراءة والكتابة في Firestore
✅ **Secret Manager Secret Accessor** - لحماية مفتاح Maps API
✅ **Cloud Tasks Enqueuer** - لجدولة العمليات

---

## ⚙️ الخدمات المُفعَّلة

سيتم تفعيل:

1. **Geocoding API** - لتحويل العناوين إلى إحداثيات
2. **Distance Matrix API** - لحساب المسافات
3. **Cloud Tasks API** - لجدولة المهام
4. **3 Cloud Functions** سيتم إنشاؤها تلقائياً:
   - `geocodeAddress` - للتحويل الجغرافي
   - `calculateDistance` - لحساب المسافات
   - `updateGeocode` - للتحديث التلقائي

---

## 🚀 خطوات التفعيل النهائية

### 1. افتح Firebase Console
```
https://console.firebase.google.com/project/studio-448742006-a3493
```

### 2. اذهب إلى Extensions
```
Build > Extensions > Explore Extensions
```

### 3. ابحث عن الإضافة
```
firestore-geocode-address
```

### 4. اضغط Install
```
Install in Firebase project
```

### 5. املأ النموذج:
```yaml
Collection ID: cars
Maps API key: AIzaSy... (المفتاح الذي أنشأته)
Cloud Functions location: us-central1
```

### 6. وافق على الشروط
```
✅ I agree to the Firebase Extensions User Terms of Service
```

### 7. اضغط Install Extension
```
Install extension
```

### 8. انتظر الانتهاء (2-3 دقائق)
```
⏳ Installing extension...
✅ Extension installed successfully!
```

---

## 🧪 اختبار الإضافة

### 1. أضف وثيقة اختبارية:

```javascript
import { collection, addDoc } from 'firebase/firestore';
import { db } from './firebase-config';

// اختبار بسيط
const testCar = await addDoc(collection(db, 'cars'), {
  make: 'Test',
  model: 'Car',
  address: 'София, България, бул. Витоша 1'
});

console.log('Test car added:', testCar.id);
```

### 2. انتظر 10-20 ثانية

### 3. تحقق من الوثيقة:

```javascript
import { doc, getDoc } from 'firebase/firestore';

const carDoc = await getDoc(doc(db, 'cars', testCar.id));
const carData = carDoc.data();

console.log('Address:', carData.address);
console.log('Location:', carData.location);
console.log('Geocoded:', carData.geocoded);

// يجب أن ترى:
// {
//   address: "София, България, бул. Витоша 1",
//   location: { lat: 42.6977, lng: 23.3219 },
//   geocoded: true
// }
```

---

## ❓ الأسئلة الشائعة

### س: هل يمكنني استخدام مجموعات متعددة؟
ج: نعم، لكن يجب تثبيت الإضافة لكل مجموعة بشكل منفصل.

### س: ماذا لو لم يتم تحديث الإحداثيات؟
ج: تأكد من:
- صحة مفتاح Maps API
- تفعيل Geocoding API
- عدم تجاوز الحد المجاني
- صحة العنوان المدخل

### س: هل يمكن حذف الإضافة لاحقاً؟
ج: نعم، يمكنك حذفها دون تأثير على البيانات الموجودة.

### س: هل تعمل مع Firebase Emulator؟
ج: لا، تحتاج إلى مشروع Firebase حقيقي.

---

## 📞 الدعم

إذا واجهت أي مشكلة:

1. **راجع وثائق Firebase**:
   ```
   https://firebase.google.com/docs/extensions/official/firestore-geocode-address
   ```

2. **تحقق من Firebase Console Logs**:
   ```
   Functions > Logs
   ```

3. **تأكد من تفعيل APIs المطلوبة**:
   ```
   https://console.cloud.google.com/apis/dashboard
   ```

---

## ✅ قائمة التحقق النهائية

- [ ] تم إنشاء مشروع Firebase: `studio-448742006-a3493`
- [ ] تم تفعيل Geocoding API
- [ ] تم تفعيل Distance Matrix API
- [ ] تم إنشاء Maps API Key
- [ ] تم تقييد المفتاح للأمان
- [ ] تم ملء النموذج بالقيم الصحيحة
- [ ] تم تثبيت الإضافة
- [ ] تم اختبار الإضافة

---

**🎉 بالتوفيق في تفعيل الإضافة!**

---

*آخر تحديث: 30 سبتمبر 2025*



















