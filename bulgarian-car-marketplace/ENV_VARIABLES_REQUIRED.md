# 🔐 متغيرات البيئة المطلوبة - Fire New Globul

## 📋 تعليمات الإعداد

قم بإنشاء ملف `.env` في مجلد `bulgarian-car-marketplace/` بالمحتوى التالي:

---

## 📝 محتوى ملف .env

```env
# Firebase Configuration - Fire New Globul
# Project ID: fire-new-globul
# Project Number: 973379297533
# Environment: Production

REACT_APP_FIREBASE_API_KEY=AIzaSyAchmKCk8ipzv0dDwbQ2xU1Pa6o4CQsEu8
REACT_APP_FIREBASE_AUTH_DOMAIN=fire-new-globul.firebaseapp.com
REACT_APP_FIREBASE_PROJECT_ID=fire-new-globul
REACT_APP_FIREBASE_STORAGE_BUCKET=fire-new-globul.firebasestorage.app
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=973379297533
REACT_APP_FIREBASE_APP_ID=1:973379297533:web:59c6534d61a29cae5d9e94
REACT_APP_FIREBASE_MEASUREMENT_ID=G-TDRZ4Z3D7Z

# Google reCAPTCHA v3
REACT_APP_RECAPTCHA_SITE_KEY=6LfYourSiteKey

# App Settings
REACT_APP_ENV=production
REACT_APP_NAME=Globul Cars
REACT_APP_SUPPORT_EMAIL=globulinternet@gmail.com
```

---

## 🚀 كيفية إنشاء الملف

### الطريقة 1: يدوياً
1. افتح `bulgarian-car-marketplace/`
2. أنشئ ملف جديد اسمه `.env`
3. انسخ المحتوى أعلاه

### الطريقة 2: عبر PowerShell

```powershell
cd "C:\Users\hamda\Desktop\New Globul Cars\bulgarian-car-marketplace"

@"
# Firebase Configuration - Fire New Globul
REACT_APP_FIREBASE_API_KEY=AIzaSyAchmKCk8ipzv0dDwbQ2xU1Pa6o4CQsEu8
REACT_APP_FIREBASE_AUTH_DOMAIN=fire-new-globul.firebaseapp.com
REACT_APP_FIREBASE_PROJECT_ID=fire-new-globul
REACT_APP_FIREBASE_STORAGE_BUCKET=fire-new-globul.firebasestorage.app
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=973379297533
REACT_APP_FIREBASE_APP_ID=1:973379297533:web:59c6534d61a29cae5d9e94
REACT_APP_FIREBASE_MEASUREMENT_ID=G-TDRZ4Z3D7Z

# App Settings
REACT_APP_ENV=production
REACT_APP_NAME=Globul Cars
REACT_APP_SUPPORT_EMAIL=globulinternet@gmail.com
"@ | Out-File -FilePath .env -Encoding UTF8
```

---

## ✅ بعد إنشاء الملف

1. أعد تشغيل الخادم:
```bash
npm start
```

2. تأكد من أن Firebase يعمل بشكل صحيح

---

## ⚠️ ملاحظات مهمة

- ✅ **لا تشارك ملف `.env` مع أحد**
- ✅ **ملف `.env` موجود في `.gitignore`** (لن يتم رفعه لـ Git)
- ✅ **Firebase الحالي:** Fire New Globul
- ✅ **Project ID:** fire-new-globul
- ✅ **Project Number:** 973379297533

---

**تاريخ الإنشاء:** 13 أكتوبر 2025

