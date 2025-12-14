# 🔐 دليل إعداد Environment Variables

## ⚠️ مهم جداً: إعداد المتغيرات البيئية

بعد إصلاح المشكلة الأمنية الحرجة (إزالة Hardcoded Credentials)، يجب إعداد المتغيرات البيئية التالية:

---

## 📋 المتغيرات المطلوبة

### 1. Firebase Configuration (مطلوبة)

أضف هذه المتغيرات إلى ملف `.env` في `bulgarian-car-marketplace/`:

```env
# Firebase Configuration
REACT_APP_FIREBASE_API_KEY=your_firebase_api_key
REACT_APP_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
REACT_APP_FIREBASE_PROJECT_ID=fire-new-globul
REACT_APP_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
REACT_APP_FIREBASE_APP_ID=your_app_id
```

### 2. Admin Credentials (لـ Super Admin Login)

```env
# Admin Credentials (للمطورين فقط - لا تشارك هذه القيم!)
REACT_APP_ADMIN_EMAIL=your_admin_email@example.com
REACT_APP_ADMIN_PASSWORD=your_secure_password
```

**⚠️ تحذير أمني**:
- لا تضع هذه القيم في Git
- أضف `.env` إلى `.gitignore`
- استخدم `.env.example` كقالب فقط (بدون قيم حقيقية)

---

## 📝 خطوات الإعداد

### 1. إنشاء ملف `.env`

```bash
cd bulgarian-car-marketplace
cp .env.example .env
```

### 2. ملء القيم

افتح ملف `.env` واملأ جميع القيم المطلوبة.

### 3. التحقق من الإعداد

عند تشغيل التطبيق، سيتم التحقق تلقائياً من وجود المتغيرات المطلوبة.

إذا كانت هناك متغيرات ناقصة، ستحصل على رسالة خطأ واضحة.

---

## 🔒 الأمان

### ✅ افعل:
- استخدم `.env` للمتغيرات الحساسة
- أضف `.env` إلى `.gitignore`
- استخدم `.env.example` كقالب (بدون قيم حقيقية)
- استخدم كلمات مرور قوية للـ Admin

### ❌ لا تفعل:
- لا تضع credentials في الكود
- لا تشارك ملف `.env` مع أي شخص
- لا ترفع `.env` إلى Git
- لا تستخدم نفس كلمة المرور في بيئات مختلفة

---

## 🧪 للاختبار

بعد إعداد المتغيرات:

1. أعد تشغيل التطبيق:
   ```bash
   npm start
   ```

2. تحقق من أن Super Admin Login يعمل:
   - اذهب إلى `/super-admin-login`
   - يجب أن يعمل تسجيل الدخول بدون أخطاء

3. تحقق من Console:
   - لا يجب أن ترى أخطاء عن متغيرات ناقصة
   - إذا رأيت تحذيرات، أضف المتغيرات الناقصة

---

## 📞 المساعدة

إذا واجهت مشاكل:
1. تحقق من أن جميع المتغيرات موجودة في `.env`
2. تحقق من أن `.env` في المجلد الصحيح (`bulgarian-car-marketplace/`)
3. أعد تشغيل التطبيق بعد إضافة المتغيرات
4. تحقق من Console للأخطاء

---

**آخر تحديث**: 13 ديسمبر 2025  
**الإصدار**: 1.0.0
