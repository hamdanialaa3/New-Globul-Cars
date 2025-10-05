# قيم سريعة لتفعيل Geocode Extension

## ✅ القيم الجاهزة للنسخ واللصق

### معلومات المشروع:
```
Project ID: studio-448742006-a3493
Project Name: New Globul Cars FG
Firebase API Key: AIzaSyBrQmYxT_t8-RnOX4vfRKJ1CJ3f5LBfBJc
```

---

## 📝 ملء النموذج

### 1. Collection ID:
```
cars
```

### 2. Maps API key:
```
⚠️ يجب إنشاؤه أولاً من:
https://console.cloud.google.com/apis/credentials?project=studio-448742006-a3493

الخطوات:
1. افتح الرابط أعلاه
2. اضغط: + CREATE CREDENTIALS > API key
3. انسخ المفتاح (يبدأ بـ AIzaSy...)
4. الصقه هنا
```

### 3. Cloud Functions location:
```
us-central1
```
*(لا تغيره)*

---

## 🔑 خطوات إنشاء Google Maps API Key (سريعة)

### الخطوة 1: فعّل APIs المطلوبة
افتح هذه الروابط واضغط "ENABLE" لكل منها:

**Geocoding API:**
```
https://console.cloud.google.com/apis/library/geocoding-backend.googleapis.com?project=studio-448742006-a3493
```

**Distance Matrix API:**
```
https://console.cloud.google.com/apis/library/distance-matrix-backend.googleapis.com?project=studio-448742006-a3493
```

### الخطوة 2: أنشئ API Key
```
https://console.cloud.google.com/apis/credentials/wizard?api=geocoding-backend.googleapis.com&project=studio-448742006-a3493
```

1. اختر: **Geocoding API**
2. Where will you be calling the API from?: **Web browser (Javascript)**
3. What data will you be accessing?: **Public data**
4. اضغط: **What credentials do I need?**
5. انسخ المفتاح

---

## 📋 ملخص التعبئة

| الحقل | القيمة |
|-------|--------|
| Collection ID | `cars` |
| Maps API key | `AIzaSy...` (من الخطوات أعلاه) |
| Cloud Functions location | `us-central1` |

---

## ⚡ بعد التفعيل - اختبار سريع

في Firestore Console، أضف وثيقة في مجموعة `cars`:

```json
{
  "make": "BMW",
  "model": "X5",
  "address": "София, България, бул. Витоша 1"
}
```

انتظر 10-20 ثانية، ثم تحقق من الوثيقة.
يجب أن تجد حقول جديدة:
```json
{
  "location": {
    "lat": 42.6977,
    "lng": 23.3219
  },
  "geocoded": true
}
```

---

## 🎯 روابط مباشرة

**Firebase Console:**
```
https://console.firebase.google.com/project/studio-448742006-a3493
```

**Extensions في Firebase:**
```
https://console.firebase.google.com/project/studio-448742006-a3493/extensions
```

**Google Cloud Console:**
```
https://console.cloud.google.com/home/dashboard?project=studio-448742006-a3493
```

**APIs & Services:**
```
https://console.cloud.google.com/apis/dashboard?project=studio-448742006-a3493
```

---

## 📊 المجموعات المتاحة للاستخدام

إذا أردت استخدام مجموعة أخرى غير `cars`:

```
users          - لمواقع المستخدمين
notifications  - للإشعارات
messages       - للرسائل
chatMessages   - لرسائل الدردشة
chatRooms      - لغرف الدردشة
favorites      - للمفضلة
reviews        - للتقييمات
reports        - للتقارير
```

---

**🚀 جاهز للتفعيل!**



















