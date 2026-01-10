# 🔐 إعداد GitHub Secrets لنشر Firebase

## المشكلة الحالية

الـ GitHub Actions workflow يفشل لأن الـ secrets المطلوبة غير مكونة. يجب إضافة هذه الـ secrets يدوياً.

## ✅ الحل: إضافة الـ Secrets المطلوبة

### 1️⃣ اذهب إلى إعدادات الـ Secrets

**الرابط المباشر:**
```
https://github.com/hamdanialaa3/New-Globul-Cars/settings/secrets/actions
```

**أو يدوياً:**
- اذهب إلى repository في GitHub
- اضغط على **Settings** (الإعدادات)
- في القائمة الجانبية اليسرى، اضغط على **Secrets and variables** > **Actions**

---

### 2️⃣ إضافة Secret #1: FIREBASE_SERVICE_ACCOUNT

**الخطوات:**

1. **احصل على Service Account JSON Key:**
   - اذهب إلى [Google Cloud Console](https://console.cloud.google.com/iam-admin/iam?project=fire-new-globul)
   - اختر مشروع `fire-new-globul`
   - انتقل إلى **IAM & Admin** > **Service Accounts**
   - ابحث عن `firebase-adminsdk-fbsvc@fire-new-globul.iam.gserviceaccount.com`
   - اضغط على الثلاث نقاط ← **Manage keys**
   - اضغط **Add Key** > **Create new key**
   - اختر **JSON**
   - سيتم تحميل ملف JSON

2. **أضف الـ Secret في GitHub:**
   - اضغط **New repository secret**
   - **Name**: `FIREBASE_SERVICE_ACCOUNT`
   - **Value**: افتح ملف JSON المحمل والصق **المحتوى الكامل** (كل النص بداخل الملف)
   - اضغط **Add secret**

**مثال على شكل المحتوى (لا تستخدم هذا - استخدم ملفك الخاص):**
```json
{
  "type": "service_account",
  "project_id": "fire-new-globul",
  "private_key_id": "...",
  "private_key": "-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n",
  "client_email": "firebase-adminsdk-fbsvc@fire-new-globul.iam.gserviceaccount.com",
  "client_id": "...",
  "auth_uri": "https://accounts.google.com/o/oauth2/auth",
  "token_uri": "https://oauth2.googleapis.com/token",
  ...
}
```

---

### 3️⃣ إضافة Secret #2: FIREBASE_PROJECT_ID

**الخطوات:**

1. اضغط **New repository secret**
2. **Name**: `FIREBASE_PROJECT_ID`
3. **Value**: `fire-new-globul`
4. اضغط **Add secret**

---

### 4️⃣ (اختياري) إضافة Stripe Secrets

إذا كنت تستخدم Stripe:

**STRIPE_SECRET_KEY:**
- اذهب إلى [Stripe Dashboard](https://dashboard.stripe.com/apikeys)
- انسخ **Secret key** (يبدأ بـ `sk_test_` أو `sk_live_`)
- أضفه كـ secret باسم `STRIPE_SECRET_KEY`

**STRIPE_WEBHOOK_SECRET:**
- اذهب إلى [Stripe Webhooks](https://dashboard.stripe.com/webhooks)
- انسخ **Webhook signing secret** (يبدأ بـ `whsec_`)
- أضفه كـ secret باسم `STRIPE_WEBHOOK_SECRET`

---

## ✅ التحقق من النجاح

بعد إضافة الـ secrets:

1. اذهب إلى تبويب **Actions** في repository
2. اختر آخر workflow فاشل
3. اضغط **Re-run all jobs**
4. يجب أن يمر الـ **Pre-flight check** بنجاح ✅

---

## 📋 قائمة المراجعة

- [ ] تم إضافة `FIREBASE_SERVICE_ACCOUNT` (JSON كامل)
- [ ] تم إضافة `FIREBASE_PROJECT_ID` (`fire-new-globul`)
- [ ] (اختياري) تم إضافة `STRIPE_SECRET_KEY`
- [ ] (اختياري) تم إضافة `STRIPE_WEBHOOK_SECRET`
- [ ] تم إعادة تشغيل الـ workflow
- [ ] الـ deployment نجح ✅

---

## ⚠️ ملاحظات أمنية مهمة

1. **لا تشارك الـ service account JSON أبداً** في:
   - Git commits
   - Public repositories
   - Chat messages
   - Screenshots

2. **لا تضع الـ secrets في:**
   - `.env` files في الـ repository
   - `firebase.json`
   - أي ملف يتم commit-ه

3. **الـ GitHub Secrets محمية:**
   - لا يمكن قراءتها بعد الإضافة
   - تظهر كـ `***` في الـ logs
   - آمنة للاستخدام في workflows

---

## 🆘 المساعدة

إذا واجهت مشاكل:

1. تأكد أن الـ JSON صحيح (استخدم [JSONLint](https://jsonlint.com/))
2. تأكد أن الـ service account له صلاحيات Firebase Admin
3. تأكد أن الـ project ID صحيح (`fire-new-globul`)
4. راجع الـ [workflow logs](https://github.com/hamdanialaa3/New-Globul-Cars/actions)

---

**آخر تحديث:** 10 يناير 2026
