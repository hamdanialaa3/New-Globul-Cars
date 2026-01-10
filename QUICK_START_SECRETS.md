# 🚀 Quick Start - GitHub Secrets Setup

## ⚡ السريع جداً (نسخة مختصرة)

```powershell
# تحميل service account key من Firebase Console
# احفظه كـ: firebase-service-account.json

# ثم شغّل
pwsh scripts/setup-github-secrets.ps1
```

**هذا كل شيء!** 🎉

---

## 📋 الخطوات بالتفصيل (إذا احتجت)

### 1. تحميل Firebase Service Account

افتح: https://console.firebase.google.com/project/fire-new-globul/settings/serviceaccounts/adminsdk

اضغط **"Generate new private key"** → احفظ الملف كـ `firebase-service-account.json`

### 2. تشغيل السكريبت

```powershell
pwsh scripts/setup-github-secrets.ps1
```

### 3. اتبع التعليمات

السكريبت سيرشدك خطوة بخطوة!

---

## 🎯 بعد إضافة الـ Secrets

### إعادة تشغيل الـ Workflow

**Option 1:** من Actions tab
```
https://github.com/hamdanialaa3/New-Globul-Cars/actions
→ اختر الـ workflow الفاشل
→ "Re-run failed jobs"
```

**Option 2:** Push جديد
```bash
git commit --allow-empty -m "chore: trigger deployment"
git push
```

---

## ❓ مشاكل؟

### "Firebase CLI not found"
```bash
npm install -g firebase-tools
```

### "GitHub CLI not found" (اختياري)
```powershell
winget install GitHub.cli
gh auth login
```

### "Service account not found"
- السكريبت سيفتح Firebase Console تلقائياً
- حمّل الملف واحفظه كـ `firebase-service-account.json`
- أعد تشغيل السكريبت

---

## 🎉 Done!

بعد نجاح السكريبت، الـ workflow يجب أن يعمل بدون مشاكل.

**التحقق:** https://github.com/hamdanialaa3/New-Globul-Cars/actions
