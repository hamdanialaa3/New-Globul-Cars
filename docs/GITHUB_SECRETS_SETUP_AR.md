# 🔐 دليل إعداد GitHub Secrets - حل مشكلة Deployment

## 📋 المشكلة
GitHub Actions يفشل لأن الـ Secrets المطلوبة غير موجودة:
- ❌ `FIREBASE_SERVICE_ACCOUNT`
- ❌ `FIREBASE_PROJECT_ID`

---

## ✅ الحل التلقائي (الموصى به)

### الخطوة 1: تحميل Service Account من Firebase

1. **افتح رابط Firebase Console:**
   ```
   https://console.firebase.google.com/project/fire-new-globul/settings/serviceaccounts/adminsdk
   ```

2. **اضغط على زر "Generate new private key"**
   - سيظهر تحذير أمني - اضغط "Generate Key"

3. **احفظ الملف باسم:**
   ```
   firebase-service-account.json
   ```
   
4. **ضع الملف في مجلد المشروع الرئيسي:**
   ```
   C:\Users\hamda\Desktop\New Globul Cars\firebase-service-account.json
   ```

---

### الخطوة 2: تشغيل السكريبت التلقائي

افتح PowerShell في مجلد المشروع وشغّل:

```powershell
.\scripts\setup-github-secrets-automated.ps1
```

**ماذا سيفعل السكريبت؟**
1. ✅ يتحقق من وجود GitHub CLI
2. ✅ يقرأ `FIREBASE_PROJECT_ID` من `.firebaserc`
3. ✅ يتحقق من صحة `firebase-service-account.json`
4. ✅ يرفع الـ Secrets إلى GitHub تلقائياً
5. ✅ يعيد تشغيل الـ Workflow الفاشل

---

## 🔧 الحل اليدوي (البديل)

إذا لم يعمل السكريبت التلقائي:

### 1. إضافة FIREBASE_PROJECT_ID

```powershell
# في PowerShell
echo "fire-new-globul" | gh secret set FIREBASE_PROJECT_ID --repo hamdanialaa3/New-Globul-Cars
```

### 2. إضافة FIREBASE_SERVICE_ACCOUNT

```powershell
# في PowerShell
Get-Content firebase-service-account.json -Raw | gh secret set FIREBASE_SERVICE_ACCOUNT --repo hamdanialaa3/New-Globul-Cars
```

### 3. التحقق من الـ Secrets

```powershell
gh secret list --repo hamdanialaa3/New-Globul-Cars
```

يجب أن ترى:
```
FIREBASE_PROJECT_ID        Updated 2025-01-10
FIREBASE_SERVICE_ACCOUNT   Updated 2025-01-10
```

### 4. إعادة تشغيل الـ Workflow

```powershell
gh run rerun 20881979328 --repo hamdanialaa3/New-Globul-Cars
```

أو من الموقع:
```
https://github.com/hamdanialaa3/New-Globul-Cars/actions
```

---

## 🎯 الحل السريع (أوامر مباشرة)

```powershell
# 1. تحميل Firebase CLI (اختياري لكن مفيد)
npm install -g firebase-tools

# 2. تسجيل الدخول إلى Firebase
firebase login

# 3. إنشاء Service Account جديد
# (يدوياً من الرابط أعلاه)

# 4. تشغيل السكريبت
.\scripts\setup-github-secrets-automated.ps1
```

---

## ⚠️ تحذيرات أمنية مهمة

### ✅ تأكد من:
1. ملف `firebase-service-account.json` في `.gitignore`
2. عدم رفع الملف إلى Git أبداً
3. عدم مشاركة محتوى الملف مع أحد

### ❌ لا تقم بـ:
1. نشر محتوى Service Account في Issues أو Pull Requests
2. وضع الملف في مجلد عام (public/)
3. إرساله عبر البريد الإلكتروني بدون تشفير

---

## 🔍 التحقق من النجاح

بعد إضافة الـ Secrets، تحقق من:

1. **الـ Secrets موجودة في GitHub:**
   ```
   https://github.com/hamdanialaa3/New-Globul-Cars/settings/secrets/actions
   ```

2. **الـ Workflow يعمل:**
   ```
   https://github.com/hamdanialaa3/New-Globul-Cars/actions
   ```

3. **الموقع منشور على Firebase:**
   ```
   https://fire-new-globul.web.app
   https://mobilebg.eu
   ```

---

## 📞 المساعدة

إذا واجهت أي مشكلة:

1. تأكد من تثبيت GitHub CLI:
   ```powershell
   gh --version
   ```

2. تأكد من تسجيل الدخول:
   ```powershell
   gh auth status
   ```

3. تأكد من الصلاحيات:
   ```powershell
   gh auth refresh -s admin:org,repo
   ```

---

## 📚 مصادر إضافية

- [Firebase Service Account Documentation](https://firebase.google.com/docs/admin/setup)
- [GitHub Secrets Documentation](https://docs.github.com/en/actions/security-guides/encrypted-secrets)
- [GitHub CLI Documentation](https://cli.github.com/manual/)

---

**تاريخ التحديث:** 10 يناير 2026  
**النسخة:** 1.0  
**الحالة:** ✅ جاهز للاستخدام
