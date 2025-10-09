# تعليمات إعداد ملف .env

## ⚠️ مهم جداً!

يجب عليك إنشاء ملف `.env` في مجلد `bulgarian-car-marketplace`

## 📝 خطوات الإنشاء:

### 1. افتح Terminal في مجلد المشروع:
```bash
cd "C:\Users\hamda\Desktop\New Globul Cars\bulgarian-car-marketplace"
```

### 2. أنشئ ملف .env:
```bash
echo.> .env
```

### 3. افتح الملف في محرر نصوص والصق المحتوى التالي:

```env
# Firebase Configuration
REACT_APP_FIREBASE_API_KEY=AIzaSyBrQmYxT_t8-RnOX4vfRKJ1CJ3f5LBfBJc
REACT_APP_FIREBASE_AUTH_DOMAIN=studio-448742006-a3493.firebaseapp.com
REACT_APP_FIREBASE_PROJECT_ID=studio-448742006-a3493
REACT_APP_FIREBASE_STORAGE_BUCKET=studio-448742006-a3493.appspot.com
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=448742006
REACT_APP_FIREBASE_APP_ID=1:448742006:web:globul-cars-marketplace

# Google Maps API Key
# ⚠️ استبدل YOUR_GOOGLE_MAPS_API_KEY بالمفتاح الحقيقي
REACT_APP_GOOGLE_MAPS_API_KEY=YOUR_GOOGLE_MAPS_API_KEY

# Environment
REACT_APP_ENVIRONMENT=development
REACT_APP_DISABLE_APP_CHECK=true

# Bulgarian Configuration
REACT_APP_DEFAULT_LANGUAGE=bg
REACT_APP_DEFAULT_CURRENCY=EUR
REACT_APP_DEFAULT_TIMEZONE=Europe/Sofia
```

### 4. استبدل `YOUR_GOOGLE_MAPS_API_KEY` بالمفتاح الفعلي الذي حصلت عليه من Google Cloud Console

---

## ✅ للتحقق من أن الملف تم إنشاؤه بشكل صحيح:

```bash
type .env
```

يجب أن ترى المحتوى المذكور أعلاه.

---

## 🔒 أمان:

- ✅ ملف `.env` موجود في `.gitignore` ولن يتم رفعه إلى GitHub
- ⚠️ لا تشارك المفتاح مع أي شخص
- ⚠️ لا تلتقط screenshots تحتوي على المفتاح

---

**بعد إنشاء الملف، أعد تشغيل خادم التطوير:**
```bash
npm start
```










































