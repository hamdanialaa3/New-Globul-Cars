# 🔧 حل مشكلة تسجيل الدخول مع Facebook

**المشكلة:** عنوان URL محظور - فشلت إعادة التوجيه

**السبب:** عناوين URL لإعادة التوجيه غير مضافة في إعدادات تطبيق Facebook

---

## 🎯 الحل السريع

### الخطوة 1: احصل على عنوان URL لإعادة التوجيه من Firebase

1. افتح **Firebase Console**:
   ```
   https://console.firebase.google.com/project/fire-new-globul/authentication/providers
   ```

2. اذهب إلى **Authentication** > **Sign-in method**

3. اضغط على **Facebook**

4. ستجد **OAuth redirect URI** مثل:
   ```
   https://fire-new-globul.firebaseapp.com/__/auth/handler
   ```
   
   **انسخ هذا العنوان!** 📋

---

### الخطوة 2: أضف عنوان URL في Facebook App

1. افتح **Facebook Developers Console**:
   ```
   https://developers.facebook.com/apps
   ```

2. اختر تطبيقك

3. اذهب إلى **Use Cases** (في القائمة اليسرى)

4. اختر **Customize** بجانب **Authentication and account creation**

5. انتقل إلى **Settings**

6. في **Valid OAuth Redirect URIs**، أضف هذه العناوين:

```
https://fire-new-globul.firebaseapp.com/__/auth/handler
https://fire-new-globul.web.app/__/auth/handler
https://mobilebg.eu/__/auth/handler
http://localhost:3000
http://localhost:3000/__/auth/handler
```

7. اضغط **Save Changes** 💾

---

### الخطوة 3: تأكد من إعدادات Firebase

في Firebase Console > Authentication > Facebook، تأكد من:

- ✅ **App ID** موجود
- ✅ **App Secret** موجود
- ✅ **Status: Enabled** (مفعّل)

---

## 📋 عناوين URL المطلوبة للإضافة

### في Facebook App Settings:

#### 1. Valid OAuth Redirect URIs:
```
https://fire-new-globul.firebaseapp.com/__/auth/handler
https://fire-new-globul.web.app/__/auth/handler
https://mobilebg.eu/__/auth/handler
```

#### 2. App Domains:
```
fire-new-globul.firebaseapp.com
fire-new-globul.web.app
mobilebg.eu
localhost
```

#### 3. Site URL:
```
https://fire-new-globul.web.app
```

---

## 🔍 التحقق من الإعدادات

### في Facebook App:

1. **Settings** > **Basic**:
   - ✅ App Domains مضاف
   - ✅ Privacy Policy URL مضاف
   - ✅ Terms of Service URL مضاف
   - ✅ App Icon مضاف

2. **Use Cases** > **Authentication**:
   - ✅ Valid OAuth Redirect URIs مضافة
   - ✅ Client OAuth Login: ON
   - ✅ Web OAuth Login: ON
   - ✅ Enforce HTTPS: ON

3. **Permissions**:
   - ✅ `email` - Approved
   - ✅ `public_profile` - Approved

---

## 🚨 إذا ما زالت المشكلة موجودة:

### 1. تحقق من App Mode:
- في Facebook App Settings > Basic
- تأكد أن **App Mode** = **Live** (وليس Development)

### 2. تحقق من OAuth Settings:
```
Settings > Advanced > Security
- Client OAuth Login: YES
- Web OAuth Login: YES
- Embedded Browser OAuth Login: YES
- Valid OAuth Redirect URIs: مضافة كلها
```

### 3. انتظر 5 دقائق:
بعد إضافة عناوين URL، انتظر 5-10 دقائق حتى تطبّق Facebook التغييرات.

---

## 📸 لقطة شاشة من Facebook Settings

يجب أن تبدو هكذا:

```
Use Cases > Authentication and account creation > Settings

Valid OAuth Redirect URIs:
┌─────────────────────────────────────────────────────────────┐
│ https://fire-new-globul.firebaseapp.com/__/auth/handler    │
│ https://fire-new-globul.web.app/__/auth/handler            │
│ https://mobilebg.eu/__/auth/handler                         │
│ http://localhost:3000                                       │
└─────────────────────────────────────────────────────────────┘

Client OAuth Login: ✅ ON
Web OAuth Login: ✅ ON
```

---

## 🎯 الخطوات بالترتيب:

1. ✅ افتح Firebase Console
2. ✅ انسخ OAuth redirect URI
3. ✅ افتح Facebook Developers
4. ✅ اذهب إلى Use Cases > Authentication > Settings
5. ✅ أضف جميع عناوين URL
6. ✅ احفظ التغييرات
7. ✅ انتظر 5 دقائق
8. ✅ جرّب تسجيل الدخول مرة أخرى

---

## 🔗 روابط مفيدة:

- **Firebase Console:** https://console.firebase.google.com/project/fire-new-globul/authentication/providers
- **Facebook Developers:** https://developers.facebook.com/apps
- **Firebase Docs:** https://firebase.google.com/docs/auth/web/facebook-login

---

## ⚠️ ملاحظات مهمة:

1. **App Mode:** يجب أن يكون **Live** وليس **Development**
2. **HTTPS:** يجب أن تكون كل عناوين URL تبدأ بـ `https://` (ما عدا localhost)
3. **Trailing Slash:** لا تضع `/` في نهاية عناوين URL
4. **Case Sensitive:** عناوين URL حساسة لحالة الأحرف

---

**بعد إضافة العناوين وحفظ التغييرات، انتظر 5 دقائق ثم جرّب تسجيل الدخول مرة أخرى!** ✨

---

**تاريخ الإنشاء:** 13 أكتوبر 2025  
**الحالة:** ✅ جاهز للتطبيق

