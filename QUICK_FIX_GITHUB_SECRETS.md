# ⚡ الحل السريع لمشكلة GitHub Actions

## 🎯 الأوامر المطلوبة (بالترتيب)

### 1️⃣ تحميل Service Account من Firebase
```powershell
.\scripts\download-service-account-helper.ps1
```
**النتيجة:** سيفتح متصفح على صفحة Firebase Console

---

### 2️⃣ من Firebase Console:
1. اضغط **"Generate new private key"**
2. احفظ الملف باسم: **`firebase-service-account.json`**
3. ضع الملف في مجلد المشروع:
   ```
   C:\Users\hamda\Desktop\New Globul Cars\firebase-service-account.json
   ```

---

### 3️⃣ رفع الـ Secrets إلى GitHub تلقائياً
```powershell
.\scripts\setup-github-secrets-automated.ps1
```

**ماذا سيحدث؟**
```
✅ Step 1/6: Verifying prerequisites...
✅ Step 2/6: Extracting Firebase Project ID
✅ Step 3/6: Locating Firebase Service Account
✅ Step 4/6: Validating Service Account JSON
✅ Step 5/6: Getting Repository Information
✅ Step 6/6: Uploading Secrets to GitHub

🎉 Setup Complete!
```

---

### 4️⃣ إعادة تشغيل الـ Workflow (تلقائي أو يدوي)

**تلقائي:** السكريبت سيسألك:
```
Would you like to re-run the latest failed workflow now? (y/n): y
```

**يدوي:** إذا أردت إعادة تشغيله لاحقاً:
```powershell
gh run rerun --repo hamdanialaa3/New-Globul-Cars
```

---

## 🔍 التحقق من النجاح

### تحقق من الـ Secrets في GitHub:
```
https://github.com/hamdanialaa3/New-Globul-Cars/settings/secrets/actions
```

يجب أن ترى:
- ✅ FIREBASE_PROJECT_ID
- ✅ FIREBASE_SERVICE_ACCOUNT

### تحقق من الـ Workflow:
```
https://github.com/hamdanialaa3/New-Globul-Cars/actions
```

يجب أن ترى: ✅ **Workflow succeeded**

---

## 📱 روابط مهمة

| الرابط | الوصف |
|--------|------|
| [Firebase Console](https://console.firebase.google.com/project/fire-new-globul/settings/serviceaccounts/adminsdk) | تحميل Service Account |
| [GitHub Secrets](https://github.com/hamdanialaa3/New-Globul-Cars/settings/secrets/actions) | إدارة الـ Secrets |
| [GitHub Actions](https://github.com/hamdanialaa3/New-Globul-Cars/actions) | مراقبة الـ Workflows |
| [الموقع المنشور](https://mobilebg.eu) | الموقع النهائي |

---

## ⚠️ إذا واجهت مشكلة

### GitHub CLI غير مثبت:
```powershell
# تثبيت GitHub CLI
winget install --id GitHub.cli
# أو
choco install gh
```

### GitHub CLI غير مُصرّح:
```powershell
gh auth login
```

### ملف Service Account غير صحيح:
```powershell
# تحقق من صحة JSON
Get-Content firebase-service-account.json | ConvertFrom-Json
```

### الـ Workflow لا زال فاشل:
```powershell
# تحقق من الـ Secrets
gh secret list --repo hamdanialaa3/New-Globul-Cars

# يجب أن ترى:
# FIREBASE_PROJECT_ID        Updated 2025-01-10
# FIREBASE_SERVICE_ACCOUNT   Updated 2025-01-10
```

---

## 📚 وثائق إضافية

- [دليل كامل بالعربي](docs/GITHUB_SECRETS_SETUP_AR.md)
- [شرح السكريبتات](scripts/README_SECRETS_SETUP.md)

---

**✅ تم حل المشكلة بنجاح!**  
**تاريخ:** 10 يناير 2026  
**الحالة:** جاهز للتشغيل 🚀
