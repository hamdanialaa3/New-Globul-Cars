# ⚡ أوامر Firebase للتشغيل الآن

**التاريخ:** 13 أكتوبر 2025

---

## 🔥 الأوامر المطلوبة

### 1️⃣ إعداد Firebase في Console:

**افتح هذا الرابط:**
```
https://console.firebase.google.com/project/fire-new-globul/authentication/providers
```

**ثم اتبع:**
1. اضغط على **Facebook** من القائمة
2. اضغط **Enable** إذا لم يكن مفعّلاً
3. أدخل:
   - **App ID:** `1780064479295175`
   - **App Secret:** `e762759ee883c3cbc256779ce0852e90`
4. **احفظ**

---

### 2️⃣ أضف Authorized Domains:

**في نفس صفحة Authentication:**
1. اذهب إلى تبويب **Settings** (في الأعلى)
2. انزل إلى **Authorized domains**
3. اضغط **Add domain**
4. أضف هذه النطاقات واحداً تلو الآخر:

```
mobilebg.eu
globul.net
localhost
```

**ملاحظة:** `fire-new-globul.firebaseapp.com` و `fire-new-globul.web.app` موجودة مسبقاً

---

### 3️⃣ نشر Firestore Rules:

```bash
cd "C:\Users\hamda\Desktop\New Globul Cars"
firebase deploy --only firestore:rules
```

---

### 4️⃣ نشر Storage Rules:

```bash
firebase deploy --only storage:rules
```

---

### 5️⃣ نشر Firebase Functions (اختياري):

```bash
cd functions
npm install
npm run build
cd ..
firebase deploy --only functions
```

---

### 6️⃣ نشر كل شيء (الخيار الشامل):

```bash
# البناء
cd bulgarian-car-marketplace
npm run build

# العودة للجذر
cd ..

# النشر الكامل
firebase deploy
```

---

## 📝 ملخص الخطوات يدوياً في Firebase Console:

### ✅ 1. تفعيل Facebook Provider:
```
Authentication → Providers → Facebook → Enable
App ID: 1780064479295175
App Secret: e762759ee883c3cbc256779ce0852e90
```

### ✅ 2. إضافة Authorized Domains:
```
Authentication → Settings → Authorized domains → Add domain
- mobilebg.eu
- globul.net
- localhost
```

### ✅ 3. التحقق من OAuth Redirect URI:
```
يجب أن يكون:
https://fire-new-globul.firebaseapp.com/__/auth/handler
```

---

## 🎯 الترتيب الموصى به:

### المرحلة 1: الإعدادات (يدوي)
1. ✅ Firebase Console → Enable Facebook
2. ✅ Firebase Console → Add Authorized Domains
3. ✅ Facebook Console → Add OAuth Redirect URIs
4. ✅ Facebook Console → Switch to Live Mode

### المرحلة 2: النشر (أوامر)
```bash
# 1. نشر القواعد
firebase deploy --only firestore:rules,storage:rules

# 2. نشر الموقع
cd bulgarian-car-marketplace && npm run build && cd ..
firebase deploy --only hosting

# 3. اختبار
```

---

## 🔗 الروابط المهمة:

| الخدمة | الرابط |
|--------|--------|
| **Firebase Auth Settings** | https://console.firebase.google.com/project/fire-new-globul/authentication/settings |
| **Firebase Providers** | https://console.firebase.google.com/project/fire-new-globul/authentication/providers |
| **Facebook App** | https://developers.facebook.com/apps/1780064479295175 |
| **Facebook OAuth Settings** | https://developers.facebook.com/apps/1780064479295175/use_cases/ |

---

## ⏰ الجدول الزمني:

- **الإعدادات اليدوية:** 10 دقائق
- **انتظار تطبيق التغييرات:** 5 دقائق
- **البناء والنشر:** 3 دقائق
- **الاختبار:** 2 دقيقة

**الوقت الإجمالي:** ~20 دقيقة

---

**ابدأ بالخطوة 1 في Firebase Console!** 🚀

