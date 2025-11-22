# 🛠️ Scripts Documentation - Diagnostic Tools
# توثيق السكربتات - أدوات التشخيص

<div dir="rtl">

## 📋 نظرة عامة

هذا المجلد يحتوي على **11 سكربت تشخيصي** تم إنشاؤها خلال مرحلة التشخيص (22 نوفمبر 2025).

**الهدف:** مراقبة مستمرة لجودة الكود وأداء المشروع.

---

## 📦 السكربتات المتاحة

### 1️⃣ **Environment & Configuration** (البيئة والإعدادات)

#### `audit-env.js`
**الوظيفة:** فحص المفاتيح البيئية المطلوبة

**الاستخدام:**
```bash
node scripts/audit-env.js
```

**الإخراج:**
```json
{
  "ok": true,
  "missing": [],
  "present": [
    "REACT_APP_FIREBASE_API_KEY",
    "REACT_APP_FIREBASE_AUTH_DOMAIN",
    ...
  ],
  "requiredCount": 8,
  "presentCount": 6
}
```

**متى تستخدمه:**
- قبل بدء التطوير
- بعد تحديث `.env`
- عند حدوث مشاكل في التكاملات الخارجية

---

#### `generate-env-template.js`
**الوظيفة:** إنشاء قالب `.env.template` مع التوثيق

**الاستخدام:**
```bash
node scripts/generate-env-template.js
```

**الإخراج:**
- ملف `.env.template` في الجذر
- يحتوي على جميع المفاتيح المطلوبة مع شرح لكل منها

**متى تستخدمه:**
- عند إضافة مفاتيح جديدة
- لمشاركة المشروع مع مطورين جدد

---

### 2️⃣ **Code Quality** (جودة الكود)

#### `check-provider-order.js`
**الوظيفة:** فحص ترتيب المزودين في `App.tsx`

**الاستخدام:**
```bash
node scripts/check-provider-order.js
```

**الإخراج:**
```json
{
  "ok": true,
  "expectedOrder": [
    "ThemeProvider",
    "GlobalStyles",
    "LanguageProvider",
    "AuthProvider",
    "ProfileTypeProvider",
    "ToastProvider",
    "GoogleReCaptchaProvider",
    "Router"
  ],
  "actualOrder": [...]
}
```

**متى تستخدمه:**
- بعد تعديل `App.tsx`
- عند إضافة مزود جديد
- قبل كل Deployment

---

#### `scan-realtime-cleanup.js`
**الوظيفة:** الكشف عن تسريبات الاشتراكات في الوقت الحقيقي

**الاستخدام:**
```bash
node scripts/scan-realtime-cleanup.js
```

**الإخراج:**
```json
{
  "ok": true,
  "count": 0,
  "files": []
}
```

**ماذا يبحث عنه:**
- `onSnapshot(` بدون cleanup
- `on(` بدون `off(`
- `subscribe(` بدون `unsubscribe()`

**متى تستخدمه:**
- بعد إضافة ميزات Realtime جديدة
- عند اكتشاف مشاكل في الأداء
- قبل Production Deployment

---

#### `check-typescript.js`
**الوظيفة:** فحص أخطاء TypeScript

**الاستخدام:**
```bash
node scripts/check-typescript.js
```

**الإخراج:**
```
✓ No TypeScript errors found
```

أو:
```
✗ TypeScript compilation failed
[Details of errors...]
```

**متى تستخدمه:**
- قبل كل Commit
- بعد تعديلات كبيرة في الكود
- في CI/CD pipeline

---

#### `audit-singletons.js`
**الوظيفة:** فحص تطبيق نمط Singleton في الخدمات

**الاستخدام:**
```bash
node scripts/audit-singletons.js
```

**الإخراج:**
```json
{
  "totalServices": 60,
  "correctImplementations": 15,
  "needsReview": 45,
  "breakdown": {
    "missingPrivateConstructor": 7,
    "incorrectGetInstance": 38
  },
  "details": {
    "correct": ["logger-service.ts", ...],
    "highPriority": ["auth-service.ts", ...],
    "mediumPriority": ["notification-service.ts", ...]
  }
}
```

**ما يفحصه:**
- وجود `private constructor()`
- صحة منطق `getInstance()`
- تفرد الـ instance

**متى تستخدمه:**
- بعد إضافة خدمة جديدة
- خلال مرحلة Refactoring
- للتأكد من جودة الكود

---

#### `scan-console-usage.js`
**الوظيفة:** الكشف عن استخدامات `console.*` في الكود

**الاستخدام:**
```bash
node scripts/scan-console-usage.js
```

**الإخراج:**
```json
{
  "ok": false,
  "totalOccurrences": 489,
  "totalFiles": 167,
  "byType": {
    "log": 197,
    "error": 266,
    "warn": 26
  },
  "topFiles": [
    { "file": "scripts/fix-old-data-ownership.ts", "count": 48 },
    { "file": "services/carBrandsService.ts", "count": 15 },
    ...
  ]
}
```

**ما يبحث عنه:**
- `console.log(`
- `console.error(`
- `console.warn(`
- `console.debug(`
- `console.info(`

**متى تستخدمه:**
- قبل Production Deployment
- خلال Logging Cleanup
- للمراقبة المستمرة

---

### 3️⃣ **Performance & Optimization** (الأداء والتحسين)

#### `analyze-bundle-size.js`
**الوظيفة:** تحليل حجم Build وتحديد الملفات الثقيلة

**الاستخدام:**
```bash
node scripts/analyze-bundle-size.js
```

**الإخراج:**
```json
{
  "ok": true,
  "buildSizeMB": "709.21",
  "mainBundleSizeMB": "3.89",
  "productionDeps": 47,
  "heavyDeps": 3,
  "topBundles": [
    { "file": "main.js", "size": "3.89 MB" },
    { "file": "90.chunk.js", "size": "2.35 MB" },
    ...
  ],
  "heavyDependencies": [
    { "name": "firebase", "impact": "Large" },
    { "name": "socket.io", "impact": "Medium" },
    ...
  ]
}
```

**ما يحلله:**
- حجم Build الإجمالي
- حجم main.js
- عدد Dependencies
- أكبر 10 ملفات
- المكتبات الثقيلة

**متى تستخدمه:**
- بعد إضافة dependency جديدة
- قبل Deployment
- خلال Bundle Optimization
- للمراقبة الشهرية

---

### 4️⃣ **Migration & Legacy Code** (الترحيل والكود القديم)

#### `analyze-legacy-location-usage.js`
**الوظيفة:** تحليل استخدامات حقول الموقع القديمة

**الاستخدام:**
```bash
node scripts/analyze-legacy-location-usage.js
```

**الإخراج:**
```json
{
  "totalOccurrences": 273,
  "filesWithIssues": 23,
  "breakdown": {
    "location": 156,
    "city": 87,
    "region": 30
  },
  "byDirectory": {
    "src/services/": 80,
    "src/pages/": 60,
    ...
  },
  "topFiles": [
    { "file": "services/location-service.ts", "count": 25 },
    ...
  ]
}
```

**ما يبحث عنه:**
- `.location` (deprecated)
- `.city` (deprecated)
- `.region` (deprecated)
- يجب استبدالها بـ `.locationData.*`

**متى تستخدمه:**
- خلال Location Migration
- للتحقق من التقدم
- بعد كل مرحلة من الترحيل

---

### 5️⃣ **Internationalization** (الترجمة)

#### `check-translations-basic.js`
**الوظيفة:** فحص أساسي لاكتمال الترجمات

**الاستخدام:**
```bash
node scripts/check-translations-basic.js
```

---

#### `check-translations-nested.js`
**الوظيفة:** فحص الترجمات المتداخلة (Nested)

**الاستخدام:**
```bash
node scripts/check-translations-nested.js
```

---

#### `check-translations-complete.js`
**الوظيفة:** فحص شامل لجميع مفاتيح الترجمة

**الاستخدام:**
```bash
node scripts/check-translations-complete.js
```

**الإخراج:**
```json
{
  "ok": true,
  "bgKeys": 500,
  "enKeys": 500,
  "missingInBg": [],
  "missingInEn": []
}
```

**ما يفحصه:**
- تطابق المفاتيح بين bg و en
- المفاتيح المفقودة في أي لغة
- التداخل الصحيح (Nested structure)

**متى تستخدمه:**
- بعد إضافة ترجمات جديدة
- قبل Deployment
- عند تغيير هيكل الترجمات

---

## 🔄 الاستخدام اليومي الموصى به

### صباحًا (قبل البدء):
```bash
# فحص شامل
node scripts/audit-env.js
node scripts/check-provider-order.js
node scripts/check-typescript.js
```

### خلال التطوير:
```bash
# حسب المهمة
node scripts/scan-console-usage.js        # عند Logging Cleanup
node scripts/analyze-legacy-location-usage.js  # عند Location Migration
node scripts/audit-singletons.js          # عند Service Refactoring
```

### قبل Commit:
```bash
node scripts/check-typescript.js
node scripts/check-translations-complete.js
```

### قبل Deployment:
```bash
# فحص Production-Ready
node scripts/scan-console-usage.js
node scripts/analyze-bundle-size.js
node scripts/scan-realtime-cleanup.js
node scripts/check-provider-order.js
```

---

## 📊 التقارير المنشأة

جميع السكربتات تنشئ تقارير JSON في الجذر:

```
LEGACY_LOCATION_FIELDS_REPORT.json
SINGLETON_AUDIT_REPORT.json
CONSOLE_LOG_AUDIT_REPORT.json
BUNDLE_SIZE_REPORT.json
```

**للوصول:**
```bash
# قراءة تقرير
cat CONSOLE_LOG_AUDIT_REPORT.json | jq .

# أو مباشرة في VS Code
code CONSOLE_LOG_AUDIT_REPORT.json
```

---

## 🎯 KPIs المستهدفة

| المقياس | الحالي | الهدف | السكربت |
|---------|--------|--------|---------|
| Console Usage | 489 | 0 | `scan-console-usage.js` |
| Build Size | 709 MB | 200 MB | `analyze-bundle-size.js` |
| Legacy Location | 273 | 0 | `analyze-legacy-location-usage.js` |
| Singleton Correct | 25% | 100% | `audit-singletons.js` |
| Subscription Leaks | 0 | 0 | `scan-realtime-cleanup.js` |
| TypeScript Errors | 0 | 0 | `check-typescript.js` |

---

## 🛠️ إضافة سكربت جديد

### القالب الموصى به:
```javascript
const fs = require('fs');
const path = require('path');

console.log('🔍 Script Name - Description\n');

try {
  // Your logic here
  
  const result = {
    ok: true,
    // Your metrics
  };
  
  // Save report
  fs.writeFileSync(
    path.join(__dirname, '../YOUR_REPORT.json'),
    JSON.stringify(result, null, 2)
  );
  
  console.log(JSON.stringify(result, null, 2));
  
} catch (error) {
  console.error('❌ Error:', error.message);
  process.exit(1);
}
```

---

## 📚 مزيد من المعلومات

- **الخطة الشاملة:** `OPTIMIZATION_ROADMAP.md`
- **خطة الموقع:** `LOCATION_MIGRATION_PLAN.md`
- **التقرير الكامل:** `📊_COMPREHENSIVE_COMPLETION_REPORT_NOV22_2025.md`
- **الملخص السريع:** `📋_QUICK_SUMMARY_NOV22_2025.md`

---

</div>

**Created:** November 22, 2025  
**Last Updated:** November 22, 2025  
**Total Scripts:** 11  
**Status:** ✅ All operational
