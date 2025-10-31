# 🔧 دليل إعداد Firebase Extensions - خطوة بخطوة

## 📋 الخطوة 1: حذف BigQuery Export المعطلة

1. افتح: https://console.firebase.google.com/project/fire-new-globul/extensions
2. ابحث عن **Stream Collections to BigQuery** (firestore-bigquery-export)
3. انقر على الإضافة → **Manage** → **Uninstall extension**
4. أكد الحذف

---

## ✅ الخطوة 2: تثبيت BigQuery Export بالإعدادات الصحيحة

### افتح صفحة Extensions
https://console.firebase.google.com/project/fire-new-globul/extensions

### انقر "Install Extension"
ابحث عن: **Stream Collections to BigQuery**

### أدخل القيم التالية (انسخ-لصق):

#### **Cloud Functions location**
```
europe-west3
```
⚠️ **مهم**: فرانكفورت - لا يمكن تغييره بعد التثبيت

---

#### **BigQuery Dataset location**
```
eu
```
⚠️ **مهم جداً**: اختر `eu` (صغيرة) - وليس `EU` أو `europe-west3`

---

#### **BigQuery Project ID**
```
fire-new-globul
```

---

#### **Firestore Instance ID**
```
(default)
```

---

#### **Firestore Instance Location**
```
eur3
```
⚠️ **مهم جداً**: هذا هو موقع قاعدة Firestore الحقيقي لديك - وليس `europe-west3`

---

#### **Collection path**
```
cars
```

---

#### **Enable Wildcard Column field with Parent Firestore Document IDs**
```
No
```

---

#### **Dataset ID**
```
globul_analytics
```

---

#### **Table ID**
```
cars
```

---

### الإعدادات الاختيارية (استخدم هذه القيم):

#### **BigQuery SQL table Time Partitioning option type**
```
none
```

#### **BigQuery SQL table clustering**
```
data,document_id,timestamp
```

#### **Maximum number of synced documents per second**
```
100
```

#### **View Type**
```
View
```

#### **Use new query syntax for snapshots**
```
No
```

#### **Exclude old data payloads**
```
No
```

#### **Maximum number of enqueue attempts**
```
3
```

#### **Log level**
```
Info
```

### اترك فارغاً:
- Maximum Staleness Duration
- Refresh Interval (Minutes)
- Backup Collection Name
- Transform function URL
- Cloud KMS key name
- BigQuery Time Partitioning column name
- Firestore Document field name for BigQuery SQL Time Partitioning field option
- BigQuery SQL Time Partitioning table schema field(column) type

---

## 🔍 الخطوة 3: التحقق من التثبيت

### 3.1 تحقق من حالة الإضافة
1. في صفحة Extensions، تأكد أن **firestore-bigquery-export** حالتها: **Processing complete** ✅
2. إذا كانت **ERRORED** ❌، راجع رسالة الخطأ وأعد التثبيت

### 3.2 تحقق من BigQuery Dataset
1. افتح: https://console.cloud.google.com/bigquery?project=fire-new-globul
2. في الشريط الجانبي، ابحث عن Dataset: **globul_analytics**
3. تأكد من وجود Tables:
   - `cars_raw_changelog` (سجل كامل للتغييرات)
   - `cars_raw_latest` (الحالة الحالية للبيانات)

### 3.3 اختبار سريع
في BigQuery SQL Editor، شغل:
```sql
SELECT COUNT(*) as total_cars 
FROM `fire-new-globul.globul_analytics.cars_raw_latest`;
```

إذا كان العدد 0، هذا طبيعي - الإضافة تستمع للتغييرات الجديدة فقط.

---

## 📸 الخطوة 4: إعادة تكوين Resize Images

### افتح الإضافة
https://console.firebase.google.com/project/fire-new-globul/extensions/instances/storage-resize-images

### انقر **Manage** → **Reconfigure**

### غيّر هذه القيم فقط:

#### **Cloud Storage bucket for images**
```
fire-new-globul.appspot.com
```
⚠️ غيّرها من `.firebasestorage.app` إلى `.appspot.com`

---

#### **Sizes of resized images**
```
150x150,400x400,800x800,1920x1920
```
⚠️ غيّرها من `200x200` إلى 4 أحجام

---

#### **Convert image to preferred types**
```
true
```
⚠️ غيّرها من `false` إلى `true`

---

#### **Output options for selected formats**
```
{"webp":{"quality":85}}
```
⚠️ أضف هذا السطر (جديد)

---

#### **Cache-Control header for resized images**
```
max-age=31536000
```
⚠️ أضف هذا السطر (جديد)

---

#### **Paths that contain images you want to resize**
```
/cars/{carId}/images/{imageId},/users/{userId}/profile/{imageId},/users/{userId}/cover/{imageId},/posts/{postId}/images/{imageId}
```
⚠️ أضف هذا السطر (جديد)

---

#### **Backfill batch size**
```
5
```
⚠️ غيّرها من `3` إلى `5`

---

### احفظ التغييرات
انقر **Save** أسفل الصفحة

---

## 🔍 الخطوة 5: إعادة تكوين Algolia Search

### افتح الإضافة
https://console.firebase.google.com/project/fire-new-globul/extensions/instances/firestore-algolia-search

### انقر **Manage** → **Reconfigure**

### غيّر هذه القيم:

#### **Algolia Application Id**
```
RTGDK12KTJ
```
⚠️ إذا كانت `CHANGE_ME_APP_ID`، غيّرها

---

#### **Force Data Sync**
```
Yes
```
⚠️ غيّرها من `No` إلى `Yes` لفهرسة البيانات الموجودة

---

### تأكد من هذه القيم (لا تغيّرها):
- Collection Path: `cars` ✅
- Algolia Index Name: `cars_bg` ✅
- Database ID: `(default)` ✅

### احفظ التغييرات

---

## 🧪 الخطوة 6: اختبار شامل

### 6.1 اختبار Resize Images

#### ارفع صورة اختبار
1. اذهب إلى: https://console.firebase.google.com/project/fire-new-globul/storage
2. في المجلد الرئيسي، أنشئ مسار: `cars/test-car-001/images/`
3. ارفع صورة: `test.jpg` (أي صورة سيارة)

#### تحقق من النتيجة (انتظر 10-30 ثانية)
يجب أن تجد في نفس المجلد:
- ✅ `test_150x150.webp`
- ✅ `test_400x400.webp`
- ✅ `test_800x800.webp`
- ✅ `test_1920x1920.webp`
- ✅ `test.jpg` (الأصلية محفوظة)

---

### 6.2 اختبار Algolia Search

#### تحقق من الفهرسة
1. اذهب إلى: https://www.algolia.com/apps/RTGDK12KTJ/dashboard
2. سجل الدخول بحسابك
3. افتح Index: **cars_bg**
4. تحقق من وجود سجلات (Records)

#### اختبار البحث
في Search box في Algolia:
- ابحث عن: `BMW`
- ابحث عن: `Mercedes`
- ابحث عن: `Toyota`

يجب أن تظهر نتائج إذا كان لديك سيارات في Firestore.

---

### 6.3 اختبار BigQuery Export

#### أضف سيارة اختبار في Firestore
1. اذهب إلى: https://console.firebase.google.com/project/fire-new-globul/firestore
2. Collection: `cars`
3. أضف Document جديد:
```json
{
  "make": "Test Brand",
  "model": "Test Model",
  "price": 10000,
  "year": 2024,
  "city": "Sofia"
}
```

#### تحقق من BigQuery (انتظر 1-2 دقيقة)
في BigQuery SQL Editor:
```sql
SELECT 
  document_name,
  data,
  timestamp,
  operation
FROM `fire-new-globul.globul_analytics.cars_raw_latest`
ORDER BY timestamp DESC
LIMIT 10;
```

يجب أن ترى السيارة التي أضفتها للتو! 🎉

---

## ✅ قائمة التحقق النهائية

- [ ] BigQuery Export: حالتها **Processing complete**
- [ ] BigQuery Dataset: `globul_analytics` موجود بموقع `eu`
- [ ] BigQuery Tables: `cars_raw_changelog` و `cars_raw_latest` موجودتان
- [ ] Resize Images: تنتج 4 أحجام WebP
- [ ] Algolia Search: Index `cars_bg` يحتوي على سجلات
- [ ] Algolia Search: البحث يعمل بنجاح

---

## 🎯 الخطوات التالية

بعد التأكد من عمل جميع الإضافات:

1. **استيراد البيانات الموجودة إلى BigQuery** (اختياري):
   - اتبع: https://github.com/firebase/extensions/blob/master/firestore-bigquery-export/guides/IMPORT_EXISTING_DOCUMENTS.md

2. **مراقبة التكاليف**:
   - BigQuery: https://console.cloud.google.com/billing/
   - تأكد من إعداد Alerts للتكاليف

3. **إنشاء Views مخصصة في BigQuery**:
   ```sql
   CREATE VIEW `fire-new-globul.globul_analytics.active_cars` AS
   SELECT 
     JSON_EXTRACT_SCALAR(data, '$.make') as make,
     JSON_EXTRACT_SCALAR(data, '$.model') as model,
     CAST(JSON_EXTRACT_SCALAR(data, '$.price') AS INT64) as price,
     JSON_EXTRACT_SCALAR(data, '$.city') as city
   FROM `fire-new-globul.globul_analytics.cars_raw_latest`
   WHERE operation != 'DELETE';
   ```

---

## ❓ استكشاف الأخطاء

### BigQuery Extension تظهر ERRORED
- تحقق من Region: يجب أن يكون `eur3` لـ Firestore و `eu` لـ Dataset
- تأكد من تفعيل APIs: BigQuery و BigQuery Storage
- احذف وأعد التثبيت بالقيم الصحيحة

### Resize Images لا تعمل
- تحقق من المسار: يجب أن يبدأ بـ `/cars/` أو `/users/` أو `/posts/`
- تأكد من Bucket: `fire-new-globul.appspot.com`
- راجع Logs: Cloud Functions logs في Console

### Algolia لا يفهرس
- تأكد من ALGOLIA_APP_ID صحيح: `RTGDK12KTJ`
- تأكد من COLLECTION_PATH: `cars`
- فعّل Force Data Sync: `Yes`

---

**جاهز للبدء؟** ابدأ بالخطوة 1 (حذف BigQuery القديمة) وأخبرني عندما تنتهي من كل خطوة! 🚀
