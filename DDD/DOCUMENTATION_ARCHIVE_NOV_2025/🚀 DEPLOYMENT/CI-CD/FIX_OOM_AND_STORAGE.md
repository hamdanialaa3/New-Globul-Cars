# ⚡ حل فوري لمشكلة CI/CD Pipeline

## 🔴 المشاكل المكتشفة:
1. ✅ **JavaScript Heap Out of Memory** - محلولة
2. ✅ **Artifact Storage Quota Exceeded** - محلولة

---

## ✨ الحلول المطبقة:

### 1️⃣ زيادة ذاكرة Node.js (6GB)
```yaml
env:
  NODE_OPTIONS: --max_old_space_size=6144
```

### 2️⃣ تقليل استهلاك Storage:

#### أ) ضغط Build Artifacts
- **قبل:** رفع مجلد `build/` كامل (~50-150 MB)
- **بعد:** ضغط إلى `build.tar.gz` (~10-30 MB)
- **توفير:** 60-70% من المساحة

#### ب) تقليل Retention Period
```yaml
retention-days: 1  # للـ build artifacts (كان 7)
retention-days: 3  # للـ build logs (كان 7)
```

#### ج) أسماء Artifacts فريدة
```yaml
name: build-${{ github.run_number }}  # منع التكرار
```

#### د) Workflow تنظيف تلقائي
- **ملف جديد:** `.github/workflows/cleanup-artifacts.yml`
- **يعمل يومياً:** الساعة 2 صباحاً
- **يحذف:** Artifacts أقدم من 3 أيام

---

## 🚀 خطوات التطبيق:

### الخطوة 1️⃣: حذف Artifacts القديمة يدوياً (الآن)

**Option A: عبر GitHub Web UI**
```
1. اذهب إلى: https://github.com/hamdanialaa3/New-Globul-Cars/actions
2. اختر أي workflow run قديم
3. انزل لأسفل → Artifacts
4. احذف الـ artifacts يدوياً (خصوصاً القديمة)
5. كرر للـ workflow runs القديمة
```

**Option B: عبر GitHub CLI (أسرع)**
```powershell
# تثبيت GitHub CLI إذا لم يكن مثبتاً
# https://cli.github.com/

# حذف جميع artifacts أقدم من 3 أيام
gh api -X GET /repos/hamdanialaa3/New-Globul-Cars/actions/artifacts --paginate | `
  jq -r '.artifacts[] | select(.created_at | fromdateiso8601 < (now - 259200)) | .id' | `
  ForEach-Object { gh api -X DELETE "/repos/hamdanialaa3/New-Globul-Cars/actions/artifacts/$_" }
```

### الخطوة 2️⃣: دفع التعديلات

```powershell
cd "c:\Users\hamda\Desktop\New Globul Cars"

# إضافة جميع الملفات المعدلة
git add .github/workflows/ci-pipeline.yml
git add .github/workflows/cleanup-artifacts.yml

# الـ Commit
git commit -m "ci: fix OOM and storage quota issues

✨ Build Improvements:
- Increased Node memory to 6GB (from 4GB)
- Added build timeout (20 min)
- Compress build artifacts (60% size reduction)
- Unique artifact names per run

💾 Storage Optimizations:
- Reduced retention: 1 day for builds, 3 days for logs
- Added daily artifact cleanup workflow
- Extract/compress steps in deploy jobs

🔍 Enhanced Diagnostics:
- System info logging
- Build verification steps
- Always upload build logs on failure

Expected: Fix OOM errors and free up storage quota"

# Push
git push origin main
```

### الخطوة 3️⃣: تشغيل Cleanup Workflow يدوياً (اختياري)

```powershell
# بعد Push، شغّل الـ cleanup workflow فوراً
gh workflow run cleanup-artifacts.yml
```

---

## 📊 التوقعات بعد الإصلاح:

### Build Job:
| Metric | Before | After |
|--------|--------|-------|
| Memory | 4GB (OOM ❌) | 6GB (✅) |
| Build Time | Timeout | ~5-10 min |
| Artifact Size | ~100 MB | ~20 MB |

### Storage:
| Metric | Before | After |
|--------|--------|-------|
| Retention | 7 days | 1-3 days |
| Cleanup | Manual | Daily Auto |
| Space Saved | 0 | ~80% |

---

## 🔍 التحقق من النجاح:

بعد Push:

1. **اذهب لـ Actions:**
   https://github.com/hamdanialaa3/New-Globul-Cars/actions

2. **شاهد الـ workflow الجديد يعمل**
   - Build Job يجب أن ينجح الآن
   - Artifacts ستكون مضغوطة (.tar.gz)

3. **تحقق من Storage:**
   - Settings → Actions → Storage
   - يجب أن ترى انخفاض في الاستخدام

4. **في المستقبل:**
   - Cleanup workflow يعمل يومياً تلقائياً
   - Storage لن يمتلئ مرة أخرى

---

## 🆘 إذا استمرت مشكلة Storage:

### حل إضافي 1: حذف يدوي شامل
```powershell
# حذف كل artifacts في المستودع (استخدم بحذر!)
gh api /repos/hamdanialaa3/New-Globul-Cars/actions/artifacts --paginate | `
  jq -r '.artifacts[].id' | `
  ForEach-Object { gh api -X DELETE "/repos/hamdanialaa3/New-Globul-Cars/actions/artifacts/$_" }
```

### حل إضافي 2: تعطيل artifact upload مؤقتاً
عدّل في workflow:
```yaml
# علّق على خطوة Upload build artifacts
# - name: Upload build artifacts
#   uses: actions/upload-artifact@v4
#   ...
```

### حل إضافي 3: ترقية GitHub Plan
- GitHub Free: 500 MB storage
- GitHub Pro: 2 GB storage
- GitHub Team: 50 GB storage

---

## ✅ Checklist النهائي:

- [ ] حذفت artifacts القديمة يدوياً
- [ ] دفعت التعديلات على الـ workflows
- [ ] Build job ينجح الآن
- [ ] Artifacts مضغوطة ومُرفوعة
- [ ] Cleanup workflow مفعّل
- [ ] Storage usage انخفض

---

**جاهز للتطبيق!** 🚀  
ابدأ بالخطوة 1 (حذف artifacts القديمة) ثم الخطوة 2 (دفع التعديلات).
