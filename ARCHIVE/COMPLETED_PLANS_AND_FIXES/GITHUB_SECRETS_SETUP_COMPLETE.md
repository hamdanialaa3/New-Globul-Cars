# GitHub Secrets Setup - Complete Guide
## دليل شامل لإعداد GitHub Secrets

**آخر تحديث:** 15 يناير 2026  
**الحالة:** ✅ تم الإعداد - Workflow يعمل بشكل صحيح

---

## 📋 Secrets المطلوبة

| Secret Name | القيمة | المطلوب |
|------------|--------|---------|
| `FIREBASE_PROJECT_ID` | `fire-new-globul` | ✅ نعم |
| `FIREBASE_SERVICE_ACCOUNT` | محتوى JSON من Firebase | ✅ نعم |

---

## 🚀 الإعداد السريع

### الطريقة 1: تلقائي (موصى به)

```powershell
# 1. تحميل Service Account
.\scripts\download-service-account-helper.ps1

# 2. رفع Secrets إلى GitHub
.\scripts\setup-github-secrets-automated.ps1
```

### الطريقة 2: يدوي

1. **احصل على Service Account:**
   - https://console.firebase.google.com/project/fire-new-globul/settings/serviceaccounts/adminsdk
   - اضغط "Generate new private key"
   - احفظ الملف

2. **أضف Secrets في GitHub:**
   - https://github.com/hamdanialaa3/New-Globul-Cars/settings/secrets/actions
   - اضغط "New repository secret"
   - أضف:
     - Name: `FIREBASE_PROJECT_ID`, Value: `fire-new-globul`
     - Name: `FIREBASE_SERVICE_ACCOUNT`, Value: محتوى ملف JSON

---

## 🔍 التحقق

بعد إضافة Secrets، Workflow يجب أن ينجح. تحقق من:
- ✅ Secrets موجودة في GitHub
- ✅ Workflow يمر بـ "Pre-flight Secrets Check"
- ✅ Deployment ينجح

---

## 📚 الملفات المرتبطة

- `.github/workflows/firebase-deploy.yml` - Workflow الرئيسي
- `scripts/setup-github-secrets-automated.ps1` - سكريبت تلقائي
- `scripts/download-service-account-helper.ps1` - مساعد تحميل Service Account

---

**الحالة:** ✅ مكون وجاهز
