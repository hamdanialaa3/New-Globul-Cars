# 🔍 شرح الأخطاء - ModuleScopePlugin

## ❌ ما هي المشكلة؟

### الخطأ:
```
Module not found: Error: You attempted to import 
C:\Users\hamda\Desktop\New Globul Cars\packages\core\src/contexts/LanguageContext 
which falls outside of the project src/ directory. 
Relative imports outside of src/ are not supported.
```

### المعنى:
1. **Create React App (CRA)** يمنع imports من خارج مجلد `src/` لأسباب أمنية
2. **ModuleScopePlugin** هو plugin في webpack يفرض هذا القيد
3. محاولاتنا لإزالة ModuleScopePlugin لم تنجح (قد يكون يتم إنشاؤه بعد تطبيق الـ filter)

---

## 🎯 الحلول المتاحة:

### ✅ الحل 1: استخدام Symlinks (موصى به)
إنشاء symlink في `node_modules` يشير إلى `packages/`:

```bash
# في bulgarian-car-marketplace/node_modules/
mklink /D @globul-cars ..\..\packages
```

**المميزات:**
- ✅ webpack يعتبره داخل `node_modules` (مسموح)
- ✅ لا يحتاج تعديلات على webpack config
- ✅ يعمل مع جميع المتصفحات

### ✅ الحل 2: استخدام npm/yarn workspaces
إذا كان المشروع يستخدم workspaces، يجب أن تعمل packages تلقائياً.

### ✅ الحل 3: نقل الملفات إلى src/ (غير موصى به)
نقل `packages/` إلى داخل `src/` لكن هذا يخرب هيكل monorepo.

### ✅ الحل 4: استخدام relative paths مؤقتاً
```typescript
// بدلاً من:
import { LanguageProvider } from '@globul-cars/core/contexts/LanguageContext';

// استخدم:
import { LanguageProvider } from '../../../packages/core/src/contexts/LanguageContext';
```

---

## 🔧 التطبيق الفوري:

### إنشاء Symlinks:

**في PowerShell (كمسؤول):**
```powershell
cd bulgarian-car-marketplace\node_modules
New-Item -ItemType SymbolicLink -Path "@globul-cars" -Target "..\..\packages"
```

**في CMD (كمسؤول):**
```cmd
cd bulgarian-car-marketplace\node_modules
mklink /D @globul-cars ..\..\packages
```

**ملاحظة:** يجب تشغيل CMD أو PowerShell **كمسؤول (Administrator)**

---

## 📊 لماذا فشلت محاولات إزالة ModuleScopePlugin؟

1. **ModuleScopePlugin قد يتم إنشاؤه بعد تطبيق الـ filter**
2. **قد يكون الاسم مختلفاً في إصدارات مختلفة من react-scripts**
3. **webpack قد يحل المسارات قبل تطبيق الـ filter**

---

## ✅ الحل الأفضل الآن:

**استخدام Symlinks** - هذا هو الحل الذي يقترحه webpack نفسه في رسالة الخطأ.

---

**التاريخ:** 18 نوفمبر 2025

