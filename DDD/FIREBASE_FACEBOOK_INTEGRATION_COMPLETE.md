# 🔥 دليل التكامل الكامل: Firebase + Facebook

**المشروع:** Globul Cars  
**التاريخ:** 13 أكتوبر 2025

---

## 📋 Part 1: إعدادات Firebase Console

### الخطوة 1: افتح Firebase Authentication

```
https://console.firebase.google.com/project/fire-new-globul/authentication/providers
```

### الخطوة 2: فعّل Facebook Provider

1. اضغط على **"Facebook"** من قائمة Sign-in methods
2. اضغط على **"Enable"** أو **"تمكين"**
3. أدخل البيانات التالية:

**App ID:**
```
1780064479295175
```

**App Secret:**
```
e762759ee883c3cbc256779ce0852e90
```

4. **انسخ OAuth redirect URI** الذي سيظهر:
```
https://fire-new-globul.firebaseapp.com/__/auth/handler
```

5. اضغط **Save** أو **حفظ**

---

## 📋 Part 2: إعدادات Facebook App

### الخطوة 1: أضف OAuth Redirect URIs

**اذهب إلى:**
```
https://developers.facebook.com/apps/1780064479295175/use_cases/
```

**ثم:** Use Cases → Authentication and account creation → Settings

**في حقل "محددات URI لإعادة توجيه OAuth الصالحة"، أضف:**
```
https://fire-new-globul.firebaseapp.com/__/auth/handler
http://localhost:3000
```

### الخطوة 2: أضف JavaScript SDK Domains

**في حقل "النطاقات المسموح بها في JavaScript SDK"، أضف:**
```
https://fire-new-globul.firebaseapp.com
https://mobilebg.eu
https://localhost
```

⚠️ **انتبه:** بدون `/` في النهاية!

### الخطوة 3: فعّل الإعدادات المطلوبة

✅ ضع علامة صح (ON) على:
- تسجيل دخول العميل عبر OAuth
- تسجيل دخول عبر الويب باستخدام OAuth
- فرض HTTPS
- استخدام الوضع الصارم لمحددات URI

❌ اترك معطّل (OFF):
- فرض إعادة المصادقة على ويب عبر OAuth
- تسجيل دخول باستخدام OAuth للمتصفح المضمن

### الخطوة 4: احفظ التغييرات

**⚠️ مهم جداً:**
- انزل لأسفل الصفحة
- اضغط **"Save Changes"** أو **"حفظ التغييرات"**
- انتظر رسالة التأكيد

---

## 📋 Part 3: تحويل التطبيق إلى Live

### الخطوة 1: اذهب إلى Basic Settings

```
Settings → Basic
```

### الخطوة 2: تحقق من كل الحقول مملوءة:

- [x] **Display Name:** BG Cars FC APP
- [x] **App Domains:** localhost, mobilebg.eu, globul.net, fire-new-globul.firebaseapp.com
- [x] **Privacy Policy:** https://mobilebg.eu/privacy-policy
- [x] **Terms of Service:** https://mobilebg.eu/terms-of-service
- [x] **Data Deletion:** https://fire-new-globul.web.app/data-deletion
- [x] **Contact Email:** alaa.hamdani@yahoo.com
- [ ] **App Icon:** (إذا لم يكن موجوداً، ارفع شعار Globul Cars)

### الخطوة 3: حوّل الوضع إلى Live

في أعلى الصفحة أو في Dashboard:
- ابحث عن **"App Mode: Development"**
- اضغط على الزر/المفتاح لتبديله إلى **"Live"**
- قد يطلب منك تأكيد - اضغط **Confirm**

---

## 📋 Part 4: إعدادات Firebase Authorized Domains

### افتح Firebase Console:
```
https://console.firebase.google.com/project/fire-new-globul/authentication/settings
```

### في قسم "Authorized domains"، تأكد من وجود:

```
✅ fire-new-globul.firebaseapp.com
✅ fire-new-globul.web.app
✅ localhost
```

**أضف إذا لم يكن موجوداً:**
```
mobilebg.eu
globul.net
```

---

## 📋 Part 5: التحقق النهائي

### Checklist قبل الاختبار:

#### في Firebase:
- [ ] Facebook Provider مفعّل
- [ ] App ID صحيح: 1780064479295175
- [ ] App Secret صحيح
- [ ] Authorized domains تحتوي على جميع النطاقات

#### في Facebook:
- [ ] OAuth Redirect URIs مضافة
- [ ] JavaScript SDK Domains مضافة
- [ ] OAuth Settings مفعّلة
- [ ] App Mode = Live
- [ ] Privacy Policy, Terms, Data Deletion مضافة

#### في الكود:
- [x] firebase-config.ts يستخدم fire-new-globul ✅
- [x] social-auth-service.ts يستخدم signInWithPopup ✅
- [x] .env file موجود ✅

---

## 🧪 Part 6: الاختبار

### الخطوة 1: أعد تشغيل الخادم

```bash
cd bulgarian-car-marketplace
npm start
```

### الخطوة 2: امسح Cache المتصفح

**في Chrome/Edge:**
- اضغط `Ctrl + Shift + Delete`
- اختر "Cached images and files"
- اضغط "Clear data"

### الخطوة 3: افتح الموقع

```
http://localhost:3000
```

### الخطوة 4: جرّب تسجيل الدخول

1. اضغط على **"تسجيل الدخول"**
2. اختر **"تسجيل الدخول مع Facebook"**
3. يجب أن تظهر نافذة Facebook المنبثقة
4. أدخل بياناتك
5. اضغط "Continue" أو "متابعة"
6. يجب أن يتم تسجيل دخولك بنجاح ✅

---

## ⚠️ إذا ظهرت مشاكل:

### مشكلة 1: "عنوان URL محظور"
**الحل:** تأكد من إضافة OAuth Redirect URIs في Facebook وانتظر 5 دقائق

### مشكلة 2: "النوافذ المنبثقة محظورة"
**الحل:** في المتصفح، اسمح بالنوافذ المنبثقة من localhost:3000

### مشكلة 3: "التطبيق غير متوفر"
**الحل:** حوّل App Mode إلى Live في Facebook

### مشكلة 4: "Missing initial state"
**الحل:** امسح cache المتصفح وحاول مرة أخرى

---

## 🚀 بعد نجاح الاختبار المحلي:

### انشر على Firebase:

```bash
# بناء المشروع
cd bulgarian-car-marketplace
npm run build

# النشر
cd ..
firebase deploy --only hosting
```

### اختبر على الموقع المباشر:

```
https://fire-new-globul.web.app
```

---

## 📝 ملاحظات مهمة:

### للتطبيق المحمول المستقبلي:

عندما تبني تطبيق Android/iOS:

1. **في Facebook Console:**
   - أضف Android Platform أو iOS Platform
   - ستحتاج Package Name / Bundle ID
   - ستحتاج Key Hashes (للأندرويد)

2. **في Firebase:**
   - أضف Android App أو iOS App
   - ستحصل على `google-services.json` (Android) أو `GoogleService-Info.plist` (iOS)

3. **في الكود:**
   - استخدم `@react-native-firebase/auth`
   - استخدم `@react-native-facebook-login`

---

## 🎯 الحالة الحالية:

| المكون | الحالة |
|--------|---------|
| **Firebase Config** | ✅ مكتمل |
| **Facebook App** | ⏳ يحتاج Live Mode |
| **OAuth URIs** | ⏳ يحتاج إضافة في Facebook |
| **الكود** | ✅ جاهز |
| **.env File** | ✅ موجود |

---

**الآن أكمل الخطوات في Facebook Console وأخبرني عندما تنتهي!** 🚀

