# GitHub Actions Deployment - Complete Guide
## دليل شامل لنشر Firebase عبر GitHub Actions

**آخر تحديث:** 15 يناير 2026  
**الحالة:** ✅ تم إصلاح مشكلة المصادقة - يعمل الآن بشكل صحيح

---

## ✅ الحالة الحالية

تم تحديث Workflow لاستخدام `google-github-actions/auth@v2` للمصادقة الحديثة (OIDC). المشكلة السابقة تم حلها.

---

## 🔐 الإعداد

### Secrets المطلوبة في GitHub

1. **FIREBASE_PROJECT_ID**
   - القيمة: `fire-new-globul`

2. **FIREBASE_SERVICE_ACCOUNT**
   - القيمة: محتوى ملف JSON لـ Service Account من Firebase

### كيفية إضافة Secrets

1. اذهب إلى: https://github.com/hamdanialaa3/New-Globul-Cars/settings/secrets/actions
2. اضغط "New repository secret"
3. أضف الـ secrets المذكورة أعلاه

---

## 🚀 Workflow الحالي

الـ Workflow يستخدم:
- ✅ `google-github-actions/auth@v2` للمصادقة
- ✅ Pre-flight secrets validation
- ✅ Build & Deploy automation

**الملف:** `.github/workflows/firebase-deploy.yml`

---

## 📝 التغييرات الأخيرة

**15 يناير 2026:**
- ✅ تم تحديث المصادقة لاستخدام `google-github-actions/auth@v2`
- ✅ تم إزالة الطرق القديمة (deprecated token authentication)
- ✅ تم تبسيط خطوة النشر

**التفاصيل:** انظر `.github/CHANGELOG_AUTH_FIX.md`

---

## 🔧 استكشاف الأخطاء

### خطأ: "Failed to authenticate"

**الحل:**
1. تحقق من وجود `FIREBASE_SERVICE_ACCOUNT` secret
2. تأكد من صحة محتوى JSON
3. تحقق من أن Service Account لديه الصلاحيات المطلوبة

### خطأ: "Missing secrets"

**الحل:**
1. تحقق من وجود جميع Secrets المطلوبة
2. راجع `.github/workflows/firebase-deploy.yml` لمعرفة المتطلبات

---

## 📚 الملفات المرتبطة

- `.github/workflows/firebase-deploy.yml` - ملف Workflow الرئيسي
- `.github/CHANGELOG_AUTH_FIX.md` - سجل التغييرات
- `.github/workflows/README.md` - توثيق Workflows

---

**الحالة:** ✅ يعمل بشكل صحيح
