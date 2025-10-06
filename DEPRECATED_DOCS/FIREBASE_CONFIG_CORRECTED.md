# 🔧 تصحيح معرفات Firebase - الدليل الكامل

## 📋 معلومات المشروع الصحيحة

### من Firebase Console:
- **اسم المشروع**: New Globul Cars FG
- **Project ID**: `studio-448742006-a3493` (ينتهي بـ 93) ✅
- **Project Number**: `687922812237` (الرقم العام المختلف)
- **Web API Key**: `AIzaSyCYxOoD-tViZHLh3XhdbwQo8rRA5Q56NVs`
- **App ID**: `1:687922812237:web:e2f36cf22eab4e53ddd304`
- **Measurement ID**: `G-ENC064NX05`

### ⚠️ المشكلة السابقة:
كان هناك خلط بين:
- **Project ID**: `studio-448742006-a3493` (الصحيح)
- **Project Number**: `687922812237` (يُستخدم في Messaging Sender ID و App ID)

## ✅ التكوين المُصحح

### ملف .env المحدث:
```env
# Project Name: New Globul Cars FG
# Project ID: studio-448742006-a3493 (النهاية بـ 93)
# Project Number: 687922812237 (الرقم العام المختلف)

REACT_APP_FIREBASE_API_KEY=AIzaSyCYxOoD-tViZHLh3XhdbwQo8rRA5Q56NVs
REACT_APP_FIREBASE_AUTH_DOMAIN=studio-448742006-a3493.firebaseapp.com
REACT_APP_FIREBASE_PROJECT_ID=studio-448742006-a3493
REACT_APP_FIREBASE_STORAGE_BUCKET=studio-448742006-a3493.firebasestorage.app
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=687922812237
REACT_APP_FIREBASE_APP_ID=1:687922812237:web:e2f36cf22eab4e53ddd304
REACT_APP_FIREBASE_MEASUREMENT_ID=G-ENC064NX05
```

## 🔧 خطوات إعداد Google Sign-in

### الخطوة 1: Firebase Console
1. اذهب إلى: https://console.firebase.google.com/project/studio-448742006-a3493
2. **Authentication** → **Sign-in method**
3. انقر على **Google**
4. **فعّل** المزود
5. ضع **Support email**: `globulinternet@gmail.com`
6. **احفظ**

### الخطوة 2: Authorized Domains
في Firebase Console → Authentication → Settings → Authorized domains:

أضف هذه النطاقات:
- `localhost`
- `127.0.0.1`
- `studio-448742006-a3493.firebaseapp.com`
- `studio-448742006-a3493.web.app`

### الخطوة 3: Google Cloud Console
1. اذهب إلى: https://console.cloud.google.com/
2. اختر المشروع: `studio-448742006-a3493`
3. **APIs & Services** → **Credentials**
4. ابحث عن **OAuth 2.0 Client ID**
5. أضف **Authorized JavaScript origins**:
   - `http://localhost:3000`
   - `http://localhost:3001`
   - `https://studio-448742006-a3493.firebaseapp.com`
   - `https://studio-448742006-a3493.web.app`
6. أضف **Authorized redirect URIs**:
   - `https://studio-448742006-a3493.firebaseapp.com/__/auth/handler`

### الخطوة 4: OAuth Consent Screen
1. **APIs & Services** → **OAuth consent screen**
2. املأ الحقول المطلوبة:
   - **App name**: "New Globul Cars FG"
   - **User support email**: `globulinternet@gmail.com`
   - **Developer contact**: `globulinternet@gmail.com`
3. أضف **Authorized domains**:
   - `firebaseapp.com`
   - نطاق الإنتاج الخاص بك

## 🧪 اختبار التكوين

بعد حفظ التغييرات:

1. أعد تشغيل الخادم:
```bash
npm start
```

2. اذهب إلى صفحة الاختبار:
```
http://localhost:3001/google-test
```

3. انقر على **"🧪 Test Google Sign-In"**

4. تحقق من رسائل الخطأ في Console المتصفح (F12)

## ❗ ملاحظات مهمة

1. **Project ID** يختلف عن **Project Number**
2. **Project ID**: `studio-448742006-a3493` (يُستخدم في Auth Domain, Storage Bucket)
3. **Project Number**: `687922812237` (يُستخدم في Messaging Sender ID, App ID)
4. **Web API Key** الجديد: `AIzaSyCYxOoD-tViZHLh3XhdbwQo8rRA5Q56NVs`

## 🔄 إذا استمرت المشكلة

1. امسح cache المتصفح
2. امسح localStorage: `localStorage.clear()` في Console
3. جرب في وضع التصفح الخفي
4. تأكد من تفعيل Google provider في Firebase Console
5. تحقق من Authorized domains

---

هذا التكوين يجب أن يحل مشكلة Google Sign-in تماماً!