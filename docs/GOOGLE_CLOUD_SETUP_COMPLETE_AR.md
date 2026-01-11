# دليل الإعداد الكامل - Google Cloud + GitHub Secrets

## 📋 المحتويات
- [المشكلة](#المشكلة)
- [الحل الكامل](#الحل-الكامل-خطوة-بخطوة)
- [الجزء 1: Google Cloud Shell](#الجزء-1-google-cloud-shell)
- [الجزء 2: تشغيل السكريبت المحلي](#الجزء-2-تشغيل-السكريبت-المحلي)
- [الجزء 3: التحقق](#الجزء-3-التحقق)
- [استكشاف الأخطاء وإصلاحها](#استكشاف-الأخطاء-وإصلاحها)
- [تحذيرات أمنية](#تحذيرات-أمنية)

---

## 🔴 المشكلة

عند تشغيل GitHub Actions، تظهر الأخطاء التالية:

```
Error: Input required and not supplied: credentials
Error: Process completed with exit code 1
```

**السبب**: GitHub Secrets المطلوبة غير موجودة في المستودع، مما يتسبب في فشل CI/CD pipeline.

**الأسرار المطلوبة**:
- `GCP_PROJECT_ID` - معرف مشروع Google Cloud
- `GCP_SA_KEY` - مفتاح حساب الخدمة (Service Account) بصيغة JSON
- `FIREBASE_TOKEN` (اختياري) - رمز Firebase CLI

---

## ✅ الحل الكامل (خطوة بخطوة)

### المتطلبات الأساسية
- ✅ حساب Google Cloud نشط
- ✅ مشروع Firebase موجود
- ✅ صلاحيات Owner أو Editor على المشروع
- ✅ Personal Access Token من GitHub مع صلاحيات `repo`
- ✅ Git و PowerShell مثبتان على جهازك

---

## 🔷 الجزء 1: Google Cloud Shell

### الخطوة 1: فتح Google Cloud Console

1. انتقل إلى: https://console.cloud.google.com
2. سجل الدخول بحساب Google الخاص بك
3. حدد المشروع الصحيح من القائمة المنسدلة في الأعلى

### الخطوة 2: فتح Cloud Shell

1. انقر على أيقونة **Cloud Shell** في شريط الأدوات العلوي (>_)
2. انتظر حتى يتم تحميل Terminal

### الخطوة 3: تعيين متغير معرف المشروع

```bash
export PROJECT_ID="your-project-id"
gcloud config set project $PROJECT_ID
```

**مثال**:
```bash
export PROJECT_ID="globul-cars-app"
gcloud config set project globul-cars-app
```

### الخطوة 4: إنشاء Service Account

```bash
gcloud iam service-accounts create github-actions-sa \
    --display-name="GitHub Actions Service Account" \
    --description="Service account for GitHub Actions deployments"
```

**الإخراج المتوقع**:
```
Created service account [github-actions-sa]
```

### الخطوة 5: منح الصلاحيات المطلوبة

قم بتشغيل الأوامر التالية واحداً تلو الآخر:

```bash
# صلاحية Firebase Admin
gcloud projects add-iam-policy-binding $PROJECT_ID \
    --member="serviceAccount:github-actions-sa@${PROJECT_ID}.iam.gserviceaccount.com" \
    --role="roles/firebase.admin"

# صلاحية Cloud Storage
gcloud projects add-iam-policy-binding $PROJECT_ID \
    --member="serviceAccount:github-actions-sa@${PROJECT_ID}.iam.gserviceaccount.com" \
    --role="roles/storage.admin"

# صلاحية Cloud Functions (إذا لزم الأمر)
gcloud projects add-iam-policy-binding $PROJECT_ID \
    --member="serviceAccount:github-actions-sa@${PROJECT_ID}.iam.gserviceaccount.com" \
    --role="roles/cloudfunctions.developer"

# صلاحية Cloud Build
gcloud projects add-iam-policy-binding $PROJECT_ID \
    --member="serviceAccount:github-actions-sa@${PROJECT_ID}.iam.gserviceaccount.com" \
    --role="roles/cloudbuild.builds.editor"
```

### الخطوة 6: إنشاء وتنزيل المفتاح

```bash
gcloud iam service-accounts keys create key.json \
    --iam-account=github-actions-sa@${PROJECT_ID}.iam.gserviceaccount.com
```

**الإخراج المتوقع**:
```
created key [...] of type [json] as [key.json] for [github-actions-sa@globul-cars-app.iam.gserviceaccount.com]
```

### الخطوة 7: عرض محتوى المفتاح

```bash
cat key.json
```

**انسخ المخرجات بالكامل** (من `{` إلى `}`) - ستحتاجها لاحقاً.

**مثال على المخرجات**:
```json
{
  "type": "service_account",
  "project_id": "globul-cars-app",
  "private_key_id": "abc123...",
  "private_key": "-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n",
  "client_email": "github-actions-sa@globul-cars-app.iam.gserviceaccount.com",
  "client_id": "123456789",
  "auth_uri": "https://accounts.google.com/o/oauth2/auth",
  "token_uri": "https://oauth2.googleapis.com/token",
  "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
  "client_x509_cert_url": "https://www.googleapis.com/robot/v1/metadata/x509/..."
}
```

### الخطوة 8: تنزيل الملف إلى جهازك

في Cloud Shell، انقر على قائمة الثلاث نقاط (⋮) > **Download** > أدخل `key.json`

---

## 🔷 الجزء 2: تشغيل السكريبت المحلي

### الخطوة 1: التحضير

1. **افتح المشروع في VS Code** أو محرر النصوص المفضل لديك
2. **تأكد من وجود الملف**: `scripts/setup-firebase-secrets-corrected.ps1`
3. **ضع ملف `key.json`** الذي قمت بتنزيله في مجلد `scripts/`

**هيكل المجلدات**:
```
New-Globul-Cars/
├── scripts/
│   ├── setup-firebase-secrets-corrected.ps1
│   └── key.json  ← ضع الملف هنا
└── ...
```

### الخطوة 2: إنشاء GitHub Personal Access Token

1. اذهب إلى: https://github.com/settings/tokens
2. انقر على **Generate new token (classic)**
3. حدد:
   - **Note**: "Firebase Secrets Setup"
   - **Expiration**: 30 days (أو حسب الحاجة)
   - **Scopes**: ✅ `repo` (جميع الخيارات)
4. انقر على **Generate token**
5. **انسخ التوكن فوراً** (لن تتمكن من رؤيته مرة أخرى!)

**مثال على التوكن**:
```
ghp_ABcd1234EFgh5678IJkl9012MNop3456QRst
```

### الخطوة 3: فتح PowerShell

1. انقر بزر الماوس الأيمن على مجلد `scripts/`
2. اختر **Open in Terminal** أو **Open PowerShell window here**
3. أو استخدم:
   ```powershell
   cd path\to\New-Globul-Cars\scripts
   ```

### الخطوة 4: تشغيل السكريبت

```powershell
.\setup-firebase-secrets-corrected.ps1
```

### الخطوة 5: إدخال المعلومات المطلوبة

سيطلب منك السكريبت:

**1. GitHub Username**:
```
Enter your GitHub username: hamdanialaa3
```

**2. Repository Name**:
```
Enter your repository name: New-Globul-Cars
```

**3. GitHub Token**:
```
Enter your GitHub Personal Access Token: ghp_ABcd1234EFgh5678IJkl9012MNop3456QRst
```

**4. Google Cloud Project ID**:
```
Enter your Google Cloud Project ID: globul-cars-app
```

**5. Path to key.json**:
```
Enter the full path to your key.json file (or press Enter if it's in the current directory): 
```
- إذا كان الملف في نفس المجلد، اضغط **Enter**
- وإلا، أدخل المسار الكامل: `C:\path\to\key.json`

### الخطوة 6: مراقبة الإخراج

**الإخراج المتوقع**:
```
=== Firebase GitHub Secrets Setup ===

Validating inputs...
✓ GitHub credentials validated
✓ key.json file found and validated

Reading key.json content...
✓ key.json is valid JSON

Setting up GitHub Secrets...
✓ Secret GCP_PROJECT_ID created successfully
✓ Secret GCP_SA_KEY created successfully

=== Setup Complete! ===

GitHub Secrets created successfully:
  • GCP_PROJECT_ID
  • GCP_SA_KEY

Next steps:
1. Verify secrets at: https://github.com/hamdanialaa3/New-Globul-Cars/settings/secrets/actions
2. Run your GitHub Actions workflow
3. Delete the key.json file from your local machine for security
```

### الخطوة 7: حذف key.json (مهم!)

```powershell
Remove-Item key.json -Force
```

**⚠️ تحذير**: لا تقم بتحميل `key.json` إلى Git أبداً!

---

## 🔷 الجزء 3: التحقق

### 1. التحقق من GitHub Secrets

1. انتقل إلى: https://github.com/hamdanialaa3/New-Globul-Cars/settings/secrets/actions
2. تحقق من وجود:
   - ✅ `GCP_PROJECT_ID` - Updated X seconds/minutes ago
   - ✅ `GCP_SA_KEY` - Updated X seconds/minutes ago

**📸 لقطة شاشة متوقعة**:
```
Repository secrets
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
GCP_PROJECT_ID        Updated 2 minutes ago    [Update] [Remove]
GCP_SA_KEY           Updated 2 minutes ago    [Update] [Remove]
```

### 2. اختبار GitHub Actions

1. انتقل إلى تبويب **Actions** في مستودعك
2. اختر أي workflow
3. انقر على **Run workflow**
4. راقب السجلات (Logs)

**الإخراج الناجح يجب أن يعرض**:
```
✓ Authenticating to Google Cloud...
✓ Authenticated as: github-actions-sa@globul-cars-app.iam.gserviceaccount.com
✓ Project set to: globul-cars-app
```

### 3. التحقق من صلاحيات Service Account

في Google Cloud Console:

```bash
gcloud projects get-iam-policy $PROJECT_ID \
    --flatten="bindings[].members" \
    --format="table(bindings.role)" \
    --filter="bindings.members:github-actions-sa@"
```

**يجب أن ترى**:
```
ROLE
roles/cloudbuild.builds.editor
roles/firebase.admin
roles/storage.admin
```

---

## 🔧 استكشاف الأخطاء وإصلاحها

### ❌ المشكلة 1: "Unable to find key.json"

**الأعراض**:
```
Error: Unable to find key.json at specified path
```

**الحل**:
1. تحقق من أن `key.json` موجود في مجلد `scripts/`
2. جرب إدخال المسار الكامل:
   ```
   C:\Users\YourName\Projects\New-Globul-Cars\scripts\key.json
   ```
3. تأكد من أن اسم الملف صحيح (حساس لحالة الأحرف)

---

### ❌ المشكلة 2: "Invalid JSON format"

**الأعراض**:
```
Error: key.json is not valid JSON
```

**الحل**:
1. افتح `key.json` في VS Code
2. تحقق من:
   - يبدأ بـ `{` وينتهي بـ `}`
   - لا توجد أحرف غريبة في البداية أو النهاية
   - كل الأقواس والفواصل صحيحة
3. أعد تنزيل الملف من Google Cloud Shell
4. تحقق من صحة JSON: https://jsonlint.com/

---

### ❌ المشكلة 3: "GitHub API authentication failed"

**الأعراض**:
```
Error: GitHub API authentication failed (401 Unauthorized)
```

**الحل**:
1. **تحقق من صحة التوكن**:
   - هل انتهت صلاحيته؟
   - هل تم نسخه بالكامل؟
2. **تحقق من الصلاحيات**:
   - يجب أن يكون لديك `repo` scope
3. **أنشئ توكن جديد**:
   - https://github.com/settings/tokens
   - اختر `repo` (جميع الخيارات)

---

### ❌ المشكلة 4: "Service Account doesn't have required permissions"

**الأعراض**:
```
Error: Permission denied on resource project globul-cars-app
```

**الحل**:

1. **في Google Cloud Shell**:
   ```bash
   export PROJECT_ID="your-project-id"
   
   # إعادة منح الصلاحيات
   gcloud projects add-iam-policy-binding $PROJECT_ID \
       --member="serviceAccount:github-actions-sa@${PROJECT_ID}.iam.gserviceaccount.com" \
       --role="roles/firebase.admin"
   
   gcloud projects add-iam-policy-binding $PROJECT_ID \
       --member="serviceAccount:github-actions-sa@${PROJECT_ID}.iam.gserviceaccount.com" \
       --role="roles/storage.admin"
   ```

2. **انتظر دقيقة واحدة** (تستغرق IAM التغييرات وقتاً للتطبيق)

3. **تحقق من الصلاحيات**:
   ```bash
   gcloud projects get-iam-policy $PROJECT_ID \
       --flatten="bindings[].members" \
       --filter="bindings.members:github-actions-sa@" \
       --format="table(bindings.role)"
   ```

---

### ❌ المشكلة 5: "Secret already exists but can't update"

**الأعراض**:
```
Error: Secret already exists and update failed
```

**الحل**:

**الطريقة 1: من واجهة GitHub**
1. اذهب إلى: https://github.com/hamdanialaa3/New-Globul-Cars/settings/secrets/actions
2. احذف السرين القديمين (`GCP_PROJECT_ID` و `GCP_SA_KEY`)
3. أعد تشغيل السكريبت

**الطريقة 2: باستخدام GitHub CLI**
```powershell
# حذف الأسرار القديمة
gh secret remove GCP_PROJECT_ID -R hamdanialaa3/New-Globul-Cars
gh secret remove GCP_SA_KEY -R hamdanialaa3/New-Globul-Cars

# إعادة التشغيل
.\setup-firebase-secrets-corrected.ps1
```

---

### ❌ المشكلة 6: GitHub Actions مازالت تفشل

**الأعراض**:
```
Error: google-github-actions/auth@v1 failed
Input required and not supplied: credentials
```

**الحل**:

1. **تحقق من اسم السر في workflow**:

افتح ملف `.github/workflows/deploy.yml` (أو أي workflow آخر):

```yaml
- name: Authenticate to Google Cloud
  uses: google-github-actions/auth@v1
  with:
    credentials_json: ${{ secrets.GCP_SA_KEY }}  # ← تأكد من هذا السطر
    project_id: ${{ secrets.GCP_PROJECT_ID }}    # ← وهذا أيضاً
```

2. **تأكد من أن الأسماء متطابقة تماماً**:
   - في السكريبت: `GCP_SA_KEY`
   - في الـ workflow: `${{ secrets.GCP_SA_KEY }}`
   - (حساس لحالة الأحرف!)

3. **جرب إعادة تشغيل الـ workflow**:
   - اذهب إلى تبويب **Actions**
   - اختر الـ workflow الفاشل
   - انقر على **Re-run all jobs**

---

## 🔒 تحذيرات أمنية

### ⚠️ 1. حماية key.json

**❌ لا تفعل**:
- ✖ لا ترفع `key.json` إلى GitHub أو أي نظام تحكم بالإصدارات
- ✖ لا ترسله عبر البريد الإلكتروني
- ✖ لا تشاركه على Slack أو Discord
- ✖ لا تضعه في مجلد عام (Public folder)

**✅ افعل**:
- ✓ احذف `key.json` بعد رفع الأسرار مباشرة
- ✓ أضف `*.json` إلى `.gitignore`
- ✓ استخدم GitHub Secrets فقط لتخزين المفاتيح

---

### ⚠️ 2. إدارة GitHub Tokens

**❌ لا تفعل**:
- ✖ لا تكتب التوكن في ملف نصي
- ✖ لا تحفظه في المتصفح بشكل غير آمن
- ✖ لا تعطه صلاحيات أكثر من اللازم

**✅ افعل**:
- ✓ استخدم مدير كلمات المرور (Password Manager)
- ✓ حدد صلاحيات محددة فقط (`repo` scope)
- ✓ حدد تاريخ انتهاء صلاحية (30-90 يوم)
- ✓ احذف التوكنات القديمة بانتظام

---

### ⚠️ 3. مراقبة الأمان

**راقب هذه الأشياء بانتظام**:

1. **نشاط Service Account**:
   - https://console.cloud.google.com/iam-admin/serviceaccounts
   - راقب الاستخدام والأنشطة الغريبة

2. **GitHub Security Logs**:
   - https://github.com/hamdanialaa3/New-Globul-Cars/settings/security
   - تحقق من تنبيهات الأمان

3. **تدوير المفاتيح (Key Rotation)**:
   - أنشئ مفتاح جديد كل 90 يوم
   - احذف المفاتيح القديمة من Google Cloud Console

---

### ⚠️ 4. إذا تسرب المفتاح

**إذا تم رفع `key.json` إلى GitHub بالخطأ**:

**فوراً قم بـ**:

1. **إلغاء المفتاح من Google Cloud**:
   ```bash
   gcloud iam service-accounts keys list \
       --iam-account=github-actions-sa@${PROJECT_ID}.iam.gserviceaccount.com
   
   # احذف المفتاح المتسرب
   gcloud iam service-accounts keys delete KEY_ID \
       --iam-account=github-actions-sa@${PROJECT_ID}.iam.gserviceaccount.com
   ```

2. **أنشئ مفتاح جديد**:
   ```bash
   gcloud iam service-accounts keys create key-new.json \
       --iam-account=github-actions-sa@${PROJECT_ID}.iam.gserviceaccount.com
   ```

3. **حدّث GitHub Secrets** بالمفتاح الجديد

4. **امسح Git History** (إن أمكن):
   ```bash
   git filter-branch --force --index-filter \
     "git rm --cached --ignore-unmatch scripts/key.json" \
     --prune-empty --tag-name-filter cat -- --all
   
   git push origin --force --all
   ```

5. **راقب النشاط** على حساب Google Cloud لمدة 24 ساعة

---

### ⚠️ 5. أفضل الممارسات

**للحفاظ على أمان بيئتك**:

✅ **استخدم Least Privilege Principle**:
- امنح Service Account الحد الأدنى من الصلاحيات المطلوبة فقط

✅ **فعّل Two-Factor Authentication (2FA)**:
- على حساب Google
- على حساب GitHub

✅ **راجع الصلاحيات بانتظام**:
- كل 30 يوم، راجع من لديه صلاحيات على المشروع

✅ **استخدم Secret Scanning**:
- فعّل GitHub Secret Scanning في الـ Repository Settings

✅ **وثّق التغييرات**:
- احتفظ بسجل لمتى تم إنشاء/تحديث الأسرار

---

## 📚 موارد إضافية

### الوثائق الرسمية

- [Google Cloud Service Accounts](https://cloud.google.com/iam/docs/service-accounts)
- [GitHub Secrets Documentation](https://docs.github.com/en/actions/security-guides/encrypted-secrets)
- [google-github-actions/auth](https://github.com/google-github-actions/auth)
- [Firebase CLI Reference](https://firebase.google.com/docs/cli)

### أدوات مفيدة

- [JSON Validator](https://jsonlint.com/) - للتحقق من صحة `key.json`
- [GitHub CLI](https://cli.github.com/) - لإدارة الأسرار من سطر الأوامر
- [gcloud CLI](https://cloud.google.com/sdk/docs/install) - للتعامل مع Google Cloud

---

## ✅ قائمة مرجعية نهائية

قبل إغلاق هذا الدليل، تأكد من:

- [ ] Service Account تم إنشاؤه في Google Cloud
- [ ] الصلاحيات المطلوبة تم منحها
- [ ] `key.json` تم تنزيله
- [ ] GitHub Personal Access Token تم إنشاؤه
- [ ] السكريبت `setup-firebase-secrets-corrected.ps1` تم تشغيله بنجاح
- [ ] `GCP_PROJECT_ID` موجود في GitHub Secrets
- [ ] `GCP_SA_KEY` موجود في GitHub Secrets
- [ ] `key.json` تم حذفه من جهازك المحلي (**مهم جداً!**)
- [ ] GitHub Actions تعمل بدون أخطاء
- [ ] تم اختبار الـ deployment بنجاح

---

## 🎉 تهانينا!

لقد أكملت إعداد Google Cloud Service Account و GitHub Secrets بنجاح!

الآن يمكن لـ GitHub Actions:
- ✅ المصادقة تلقائياً مع Google Cloud
- ✅ نشر التطبيق على Firebase Hosting
- ✅ إدارة Cloud Storage والموارد الأخرى
- ✅ تشغيل CI/CD pipeline بدون تدخل يدوي

---

**تم إنشاء هذا الدليل في**: 2026-01-11  
**الإصدار**: 1.0  
**المؤلف**: hamdanialaa3  
**الترخيص**: MIT License

---

## 💬 الدعم والمساعدة

إذا واجهت أي مشاكل:

1. راجع قسم [استكشاف الأخطاء وإصلاحها](#استكشاف-الأخطاء-وإصلاحها)
2. تحقق من [GitHub Actions Logs](https://github.com/hamdanialaa3/New-Globul-Cars/actions)
3. راجع [Google Cloud Logs](https://console.cloud.google.com/logs)
4. افتح Issue في المستودع مع تفاصيل الخطأ

**تذكر**: لا تشارك `key.json` أو أي معلومات حساسة في Issues أو Pull Requests!

---

**🔐 السلامة أولاً | أمن المعلومات مسؤولية الجميع**
