# 📋 Manual Copy Instructions

## ⚠️ الملفات الكبيرة تحتاج نسخ يدوي

بسبب حجم الملفات الكبير، يجب نسخها يدوياً:

### 1. carData_static.ts (~4100 سطر)

**من:**
```
bulgarian-car-marketplace/src/constants/carData_static.ts
```

**إلى:**
```
packages/core/src/constants/carData_static.ts
```

**الطريقة:**
1. افتح الملف المصدر في VS Code
2. اضغط `Ctrl+A` لتحديد كل المحتوى
3. اضغط `Ctrl+C` للنسخ
4. افتح الملف الوجهة
5. اضغط `Ctrl+V` للصق
6. احفظ الملف (`Ctrl+S`)

### 2. translations.ts (~2879 سطر)

**من:**
```
bulgarian-car-marketplace/src/locales/translations.ts
```

**إلى:**
```
packages/core/src/locales/translations.ts
```

**الطريقة:**
نفس الخطوات أعلاه

---

## ✅ بعد النسخ

بعد نسخ الملفين:
- ✅ Core Package: **100%**
- ✅ التقدم الإجمالي: **~99%**

---

## 🚀 بديل: استخدام File Explorer

1. افتح File Explorer
2. اذهب إلى: `bulgarian-car-marketplace/src/constants/`
3. انسخ `carData_static.ts`
4. الصق في: `packages/core/src/constants/`
5. كرر لـ `translations.ts` من `bulgarian-car-marketplace/src/locales/`

---

**ملاحظة**: هذه هي الخطوة الوحيدة المتبقية لإكمال Core Package!

