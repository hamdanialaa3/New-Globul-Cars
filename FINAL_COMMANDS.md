# ⚡ الأوامر النهائية - نسخ ولصق

## 🎯 الخيار 1: تطبيق كامل (موصى به)

### في PowerShell:

```powershell
# الانتقال للمجلد
cd "c:\Users\hamda\Desktop\New Globul Cars"

# 1️⃣ حذف Artifacts القديمة أولاً (يحرر المساحة)
.\cleanup-old-artifacts.ps1

# 2️⃣ دفع التعديلات
git add .github/workflows/ci-pipeline.yml .github/workflows/cleanup-artifacts.yml FIX_OOM_AND_STORAGE.md cleanup-old-artifacts.ps1 FINAL_COMMANDS.md

git commit -m "ci: fix OOM and storage quota - compress artifacts, auto cleanup, increased memory"

git push origin main

# 3️⃣ تشغيل cleanup workflow يدوياً (اختياري)
gh workflow run cleanup-artifacts.yml
```

---

## 🎯 الخيار 2: تطبيق سريع (بدون cleanup script)

```powershell
cd "c:\Users\hamda\Desktop\New Globul Cars"

git add .github/workflows/ci-pipeline.yml .github/workflows/cleanup-artifacts.yml

git commit -m "ci: fix OOM and storage quota issues"

git push origin main
```

---

## 🎯 الخيار 3: حذف Artifacts يدوياً عبر GitHub

إذا لم يكن GitHub CLI مثبتاً:

1. اذهب إلى: https://github.com/hamdanialaa3/New-Globul-Cars/actions
2. افتح أي workflow run قديم
3. انزل لأسفل → Artifacts
4. اضغط على الـ 🗑️ بجانب كل artifact
5. كرر للـ workflows القديمة (اختر الأقدم أولاً)

---

## 📊 ما تم إصلاحه:

### ✅ مشكلة 1: Out of Memory
```yaml
# قبل: 4GB
NODE_OPTIONS: --max_old_space_size=4096

# بعد: 6GB
NODE_OPTIONS: --max_old_space_size=6144
```

### ✅ مشكلة 2: Storage Quota
| التحسين | التوفير |
|---------|---------|
| ضغط artifacts | 60-70% |
| Retention 1-3 days | 70% |
| Auto cleanup daily | 100% (دائم) |

---

## 🔍 التحقق من النجاح:

بعد 5-10 دقائق من Push:

### 1️⃣ Build يجب أن ينجح:
```
✅ Build Application: Success
✅ Build artifacts uploaded (compressed)
✅ No OOM errors
```

### 2️⃣ Artifacts مضغوطة:
```
build-12345.tar.gz  (~20 MB)  ← بدلاً من
build/              (~100 MB)
```

### 3️⃣ Storage منخفض:
```
GitHub Actions Storage: 50 MB / 500 MB  ← صحي
```

---

## 🆘 استكشاف الأخطاء:

### إذا استمر OOM:
```yaml
# زد الذاكرة لـ 8GB
NODE_OPTIONS: --max_old_space_size=8192
```

### إذا استمر Storage Quota:
```powershell
# احذف كل artifacts (استخدم بحذر!)
gh api /repos/hamdanialaa3/New-Globul-Cars/actions/artifacts --paginate | jq -r '.artifacts[].id' | ForEach-Object { gh api -X DELETE "/repos/hamdanialaa3/New-Globul-Cars/actions/artifacts/$_" }
```

### إذا لم يكن GitHub CLI مثبتاً:
```powershell
# تثبيت عبر winget
winget install GitHub.cli

# أو حمّل من
# https://cli.github.com/

# ثم سجل دخول
gh auth login
```

---

## ✅ Checklist:

- [ ] حذفت artifacts القديمة (Option 1 أو 3)
- [ ] دفعت التعديلات (git push)
- [ ] انتظرت اكتمال Build (~10 دقائق)
- [ ] تحققت من نجاح Build في Actions
- [ ] تأكدت من ضغط Artifacts
- [ ] تحققت من انخفاض Storage

---

**جاهز!** اختر أحد الخيارات أعلاه وابدأ 🚀
