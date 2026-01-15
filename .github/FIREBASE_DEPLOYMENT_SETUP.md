# 🔧 Firebase Deployment Setup Guide
## دليل إعداد نشر Firebase

**التاريخ:** يناير 2026  
**الحالة:** ✅ **دليل شامل لحل مشاكل النشر**

---

## ⚠️ المشكلة: IAM Permissions Error

### الخطأ:
```
The account used to deploy Firebase functions lacks the required permission 
iam.serviceAccounts.ActAs on the service account fire-new-globul@appspot.gserviceaccount.com
```

---

## ✅ الحل: إضافة Service Account User Role

### الخطوات التفصيلية:

#### 1. الوصول إلى Google Cloud IAM Console

افتح الرابط التالي:
```
https://console.cloud.google.com/iam-admin/iam?project=fire-new-globul
```

#### 2. العثور على Service Account المستخدم في GitHub Actions

1. في صفحة IAM، ابحث عن الحساب المستخدم في GitHub Actions
2. هذا الحساب عادة يكون:
   - Service account من `FIREBASE_SERVICE_ACCOUNT` secret
   - أو حساب GitHub Actions service account

#### 3. إضافة Service Account User Role

**الطريقة الأولى: عبر IAM Members**

1. اضغط على **"Grant Access"** أو **"Add"** في أعلى الصفحة
2. أدخل email الحساب المستخدم في GitHub Actions
3. اختر Role: **"Service Account User"** (`roles/iam.serviceAccountUser`)
4. في حقل **"Grant this role to"**، اختر:
   - **"Specific service account"**
   - ثم اختر: `fire-new-globul@appspot.gserviceaccount.com`
5. اضغط **"Save"**

**الطريقة الثانية: عبر Service Account مباشرة**

1. اذهب إلى:
   ```
   https://console.cloud.google.com/iam-admin/serviceaccounts?project=fire-new-globul
   ```
2. ابحث عن: `fire-new-globul@appspot.gserviceaccount.com`
3. اضغط على Service Account
4. اذهب إلى تبويب **"Permissions"**
5. اضغط **"Grant Access"**
6. أدخل email الحساب من GitHub Actions
7. اختر Role: **"Service Account User"**
8. اضغط **"Save"**

---

## 🔍 التحقق من الحساب المستخدم في GitHub Actions

### في `.github/workflows/firebase-deploy.yml`:

**الطريقة الجديدة (OIDC - موصى بها):**

```yaml
- name: Authenticate to Google Cloud
  id: auth
  uses: google-github-actions/auth@v2
  with:
    credentials_json: ${{ secrets.FIREBASE_SERVICE_ACCOUNT }}
```

**الحساب المستخدم:** موجود في `secrets.FIREBASE_SERVICE_ACCOUNT` (JSON key file)

**ملاحظة:** تم تحديث Workflow لاستخدام `google-github-actions/auth@v2` بدلاً من الطريقة القديمة. هذا يحل مشكلة "Failed to authenticate" ويتبع أفضل الممارسات الحديثة.

### كيفية معرفة الحساب:

1. اذهب إلى GitHub Repository → Settings → Secrets and variables → Actions
2. افتح `FIREBASE_SERVICE_ACCOUNT` secret
3. انسخ محتوى JSON
4. ابحث عن `"client_email"` في JSON
5. هذا هو email الحساب الذي يحتاج الصلاحيات

**مثال:**
```json
{
  "type": "service_account",
  "project_id": "fire-new-globul",
  "private_key_id": "...",
  "client_email": "github-actions@fire-new-globul.iam.gserviceaccount.com",
  ...
}
```

في هذا المثال، الحساب هو: `github-actions@fire-new-globul.iam.gserviceaccount.com`

---

## 📋 Checklist للصلاحيات المطلوبة

### Service Account المستخدم في GitHub Actions يحتاج:

✅ **Service Account User** (`roles/iam.serviceAccountUser`)
   - على: `fire-new-globul@appspot.gserviceaccount.com`

✅ **Firebase Admin** (`roles/firebase.admin`)
   - على: Project `fire-new-globul`

✅ **Cloud Functions Admin** (`roles/cloudfunctions.admin`)
   - على: Project `fire-new-globul`

✅ **Service Account Token Creator** (`roles/iam.serviceAccountTokenCreator`)
   - على: Project `fire-new-globul`

---

## 🛠️ تحديث Workflow (تم التحديث - يناير 2026)

### ✅ التحديثات المطبقة:

1. **استخدام `google-github-actions/auth@v2`** - طريقة المصادقة الحديثة (OIDC)
2. **إزالة الطرق القديمة** - لا مزيد من `--token` أو إدارة يدوية للملفات
3. **إدارة تلقائية للاعتمادات** - Action يدير الملفات تلقائياً

### التحقق من الصلاحيات (اختياري):

```yaml
- name: Verify Service Account Permissions
  env:
    GOOGLE_APPLICATION_CREDENTIALS: ${{ steps.auth.outputs.credentials_file_path }}
  run: |
    echo "Verifying service account permissions..."
    gcloud projects get-iam-policy fire-new-globul \
      --flatten="bindings[].members" \
      --format="table(bindings.role)" \
      --filter="bindings.members:$(gcloud auth list --filter=status:ACTIVE --format='value(account)')"
```

---

## ✅ التحقق من الحل

بعد إضافة الصلاحيات:

1. **انتظر 1-2 دقيقة** حتى تنتشر الصلاحيات
2. **أعد تشغيل GitHub Actions workflow**
3. **تحقق من نجاح deployment**

---

## 🔐 الأمان

⚠️ **مهم:** 
- لا تشارك `FIREBASE_SERVICE_ACCOUNT` secret مع أي شخص
- استخدم **Principle of Least Privilege** - أعط فقط الصلاحيات المطلوبة
- راجع الصلاحيات بانتظام

---

## 📞 الدعم

إذا استمرت المشكلة:

1. تحقق من أن Service Account email صحيح
2. تأكد من أن الصلاحيات تم تطبيقها على المشروع الصحيح
3. راجع Google Cloud Audit Logs للتحقق من محاولات الوصول

---

**تاريخ الإنشاء:** يناير 2026  
**آخر تحديث:** يناير 2026
