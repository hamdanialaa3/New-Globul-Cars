# 📋 Profile Types Separation Plan
## خطة فصل أنواع البروفايلات الثلاثة

**التاريخ:** نوفمبر 2025  
**الحالة:** 🚀 Ready for Implementation  
**الأولوية:** HIGH - Core Feature

---

## 📚 محتويات المجلد

### 🎯 ملفات البداية السريعة
1. **[00-START_HERE.md](./00-START_HERE.md)** ⭐
   - نقطة البداية لفهم الخطة
   - الملف الأول الذي يجب قراءته

2. **[FOLDER_SUMMARY.md](./FOLDER_SUMMARY.md)**
   - ملخص سريع لجميع المستندات
   - مرجع سريع للمحتوى

---

### 📖 الوثائق الرئيسية

#### 1. الخطة الأصلية
**[PROFILE_TYPES_SEPARATION_PLAN.md](./PROFILE_TYPES_SEPARATION_PLAN.md)**
- الخطة الشاملة الأصلية (6500+ سطر)
- تحتوي على جميع التفاصيل الفنية
- المرجع الأساسي للمشروع

#### 2. الخطة المرتبة حسب الأولوية
**[PROFILE_TYPES_SEPARATION_PLAN_PRIORITIZED.md](./PROFILE_TYPES_SEPARATION_PLAN_PRIORITIZED.md)**
- نسخة معدلة حسب الأولوية البرمجية
- مرتبة في 4 مراحل تنفيذية
- ملف الخطوات العملية
 - يشمل قسم: "Advanced Stabilization Addenda" بتفاصيل جاهزة للتنفيذ

#### 3. التحليل والتغييرات
**[ANALYSIS_AND_CHANGES_SUMMARY.md](./ANALYSIS_AND_CHANGES_SUMMARY.md)**
- شرح التعديلات المقترحة
- الأسباب وراء التغييرات
- المخاطر والحلول

---

### 🔍 الوضع الحالي

**[CURRENT_SYSTEM_REALITY.md](./CURRENT_SYSTEM_REALITY.md)** 🌟
- توثيق شامل للنظام الحالي
- الملفات والمكونات الموجودة
- نقطة البداية قبل أي تطوير
- **أهم ملف للمطورين!**

---

## 🎯 كيفية الاستخدام

### للمطور الجديد:
1. ابدأ بـ **[00-START_HERE.md](./00-START_HERE.md)**
2. اقرأ **[CURRENT_SYSTEM_REALITY.md](./CURRENT_SYSTEM_REALITY.md)**
3. راجع **[PROFILE_TYPES_SEPARATION_PLAN_PRIORITIZED.md](./PROFILE_TYPES_SEPARATION_PLAN_PRIORITIZED.md)**
4. ابدأ التنفيذ من Phase 1

### للمراجعة السريعة:
1. **[FOLDER_SUMMARY.md](./FOLDER_SUMMARY.md)** - نظرة عامة
2. **[ANALYSIS_AND_CHANGES_SUMMARY.md](./ANALYSIS_AND_CHANGES_SUMMARY.md)** - القرارات المهمة

### للتنفيذ:
1. **[PROFILE_TYPES_SEPARATION_PLAN_PRIORITIZED.md](./PROFILE_TYPES_SEPARATION_PLAN_PRIORITIZED.md)** - خطوات العمل
2. **[CURRENT_SYSTEM_REALITY.md](./CURRENT_SYSTEM_REALITY.md)** - المرجع التقني

---

## 📊 إحصائيات المشروع

- **عدد الملفات:** 7 ملفات توثيق
- **إجمالي الأسطر:** ~10,000 سطر
- **المراحل:** 4 مراحل تنفيذية
- **الأنواع:** 3 أنواع بروفايل (Private, Dealer, Company)
- **الخطط:** 9 مستويات اشتراك

---

## 🚀 الحالة الحالية

### ✅ مكتمل:
- [x] تحليل النظام الحالي
- [x] توثيق جميع المكونات
- [x] تصميم الهيكل الجديد
- [x] ترتيب الأولويات
- [x] تحديد المخاطر والحلول

### 🔄 قيد التنفيذ:
- [ ] Phase 0: Pre-Migration Safeguards
- [ ] Phase 1: Core Interfaces & Types
- [ ] Phase 2A: Service Layer
- [ ] Phase 2B: Integrations & Consolidation
- [ ] Phase 3: UI Components
- [ ] Phase 4: Migration & Testing

---

## 🎨 أنواع البروفايلات الثلاثة

### 🟠 Private (خاص)
- **اللون:** `#FF8F10` (Orange)
- **الهدف:** المستخدمين الأفراد
- **الخطط:** free, premium

### 🟢 Dealer (تاجر)
- **اللون:** `#16a34a` (Green)
- **الهدف:** التجار المحترفين
- **الخطط:** dealer_basic, dealer_pro, dealer_enterprise

### 🔵 Company (شركة)
- **اللون:** `#1d4ed8` (Blue)
- **الهدف:** الشركات والأساطيل
- **الخطط:** company_starter, company_pro, company_enterprise

---

## 📞 معلومات الاتصال

- **المشروع:** Globul Cars (Bulgarian Car Marketplace)
- **الموقع:** https://fire-new-globul.web.app
- **Firebase:** fire-new-globul
- **المكان:** Sofia, Bulgaria

---

## 📝 ملاحظات مهمة

1. **لا تحذف ملفات!** - انقلها إلى `DDD/` للمراجعة
2. **حجم الملفات** - بحد أقصى 300 سطر، قسّم إذا لزم الأمر
3. **اللغات** - Bulgarian (BG) + English (EN) فقط
4. **العملة** - Euro (€) فقط
5. **No Text Emojis** - استخدم أيقونات SVG فقط
6. **Production Ready** - كل الكود يجب أن يكون جاهز للإنتاج

---

## 🧩 ملاحظة معمارية (مهمة)

تم اعتماد نموذج "مرجع + لقطة" (Hybrid Reference Model):
- users/{uid}: يحتوي snapshot صغير للتاجر/الشركة + references
- dealerships/{uid} و companies/{uid}: المصدر القياسي الكامل للبيانات

التفاصيل الكاملة في: **[PROFILE_TYPES_SEPARATION_PLAN_PRIORITIZED.md](./PROFILE_TYPES_SEPARATION_PLAN_PRIORITIZED.md)** → قسم "Canonical Data Model & Source of Truth"

---

**آخر تحديث:** نوفمبر 2025  
**الإصدار:** v1.0

