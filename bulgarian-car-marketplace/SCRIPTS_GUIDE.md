# 🔧 دليل السكريبتات - Scripts Guide

## 📋 السكريبتات المتاحة

### 1. تحديث الخدمات
```bash
node scripts/update-to-unified-service.js
```
**الوظيفة:** تحديث جميع الاستيرادات لاستخدام UnifiedCarService
**متى تستخدمه:** بعد إضافة ملفات جديدة

### 2. تحليل الملفات
```bash
node scripts/analyze-large-files.js
```
**الوظيفة:** تحليل الملفات الكبيرة وإنشاء تقرير
**متى تستخدمه:** للتحقق من حجم الملفات

### 3. ترحيل البيانات
```bash
node scripts/migrate-data.js
```
**الوظيفة:** ترحيل البيانات إلى البنية الجديدة
**متى تستخدمه:** مرة واحدة عند الترقية

### 4. التحقق من الترحيل
```bash
node scripts/verify-migration.js
```
**الوظيفة:** التحقق من صحة البيانات المرحلة
**متى تستخدمه:** بعد الترحيل

---

## 🚀 الأوامر السريعة

### التطوير
```bash
npm start              # تشغيل التطبيق
npm run build          # بناء للإنتاج
npm test               # تشغيل الاختبارات
```

### الصيانة
```bash
# تحديث الخدمات
npm run update:services

# تحليل الملفات
npm run analyze:files

# ترحيل البيانات
npm run migrate:data

# التحقق
npm run verify:migration
```

---

## 📝 إضافة إلى package.json

أضف هذه السكريبتات إلى `package.json`:

```json
{
  "scripts": {
    "update:services": "node scripts/update-to-unified-service.js",
    "analyze:files": "node scripts/analyze-large-files.js",
    "migrate:data": "node scripts/migrate-data.js",
    "verify:migration": "node scripts/verify-migration.js"
  }
}
```

---

## ✅ قائمة التحقق

- [ ] تشغيل `update:services` بعد إضافة ملفات
- [ ] تشغيل `analyze:files` شهرياً
- [ ] تشغيل `migrate:data` مرة واحدة
- [ ] تشغيل `verify:migration` بعد الترحيل

---

**آخر تحديث:** ${new Date().toLocaleDateString('ar-EG')}
