# 🎯 START HERE - دليل البداية
## خطة فصل أنواع البروفايلات الثلاثة

**مرحباً! 👋 هذا هو الملف الأول الذي يجب قراءته**

---

## 📚 ما هذا المجلد؟

هذا المجلد يحتوي على **خطة شاملة** لفصل وتنظيم 3 أنواع من البروفايلات في مشروع Globul Cars:

1. **🟠 Private** - للمستخدمين الأفراد
2. **🟢 Dealer** - للتجار المحترفين
3. **🔵 Company** - للشركات والأساطيل

---

## 🗺️ خريطة القراءة (Reading Roadmap)

### المسار السريع (15 دقيقة)
```
1. 00-START_HERE.md (هذا الملف) ← أنت هنا
2. FOLDER_SUMMARY.md ← ملخص سريع
3. PROFILE_TYPES_SEPARATION_PLAN_PRIORITIZED.md ← الخطة العملية
```

### المسار الشامل (ساعة واحدة)
```
1. 00-START_HERE.md ← أنت هنا
2. CURRENT_SYSTEM_REALITY.md ← الوضع الحالي (مهم جداً!)
3. PROFILE_TYPES_SEPARATION_PLAN.md ← الخطة الأصلية الكاملة
4. ANALYSIS_AND_CHANGES_SUMMARY.md ← التحليل والقرارات
5. PROFILE_TYPES_SEPARATION_PLAN_PRIORITIZED.md ← الخطة المرتبة
```

### للمبرمج المنفذ (3 ساعات)
```
اقرأ جميع الملفات بالترتيب التالي:
1. 00-START_HERE.md
2. CURRENT_SYSTEM_REALITY.md ⭐ الأهم
3. PROFILE_TYPES_SEPARATION_PLAN_PRIORITIZED.md
4. PROFILE_TYPES_SEPARATION_PLAN.md
5. ANALYSIS_AND_CHANGES_SUMMARY.md
6. FOLDER_SUMMARY.md
```

---

## 📁 محتويات المجلد (7 ملفات)

### 1️⃣ ملفات التوجيه
- **00-START_HERE.md** (هذا الملف) - دليل البداية
- **FOLDER_SUMMARY.md** - ملخص سريع لكل الملفات
- **README.md** - معلومات عامة عن المجلد

### 2️⃣ الخطط والوثائق
- **PROFILE_TYPES_SEPARATION_PLAN.md** - الخطة الأصلية الشاملة (6500+ سطر)
- **PROFILE_TYPES_SEPARATION_PLAN_PRIORITIZED.md** - الخطة المرتبة حسب الأولوية
- **ANALYSIS_AND_CHANGES_SUMMARY.md** - التحليل والتعديلات المقترحة

### 3️⃣ الوضع الحالي
- **CURRENT_SYSTEM_REALITY.md** ⭐ - توثيق شامل للنظام الحالي

---

## 🎯 الهدف الرئيسي

### الوضع الحالي:
```typescript
// نظام موحد لجميع المستخدمين
interface BulgarianUser {
  // جميع الحقول مخلوطة معاً
  profileType: 'private' | 'dealer' | 'company';
  // ...
}
```

### الهدف المطلوب:
```typescript
// فصل واضح للأنواع الثلاثة
interface PrivateProfile extends BaseProfile { /* ... */ }
interface DealerProfile extends BaseProfile { /* dealer-specific */ }
interface CompanyProfile extends BaseProfile { /* company-specific */ }

type BulgarianUser = PrivateProfile | DealerProfile | CompanyProfile;
```

---

## 🔥 لماذا نحتاج هذا الفصل؟

### المشاكل الحالية:
1. **Type Safety ضعيف** - TypeScript لا يفرض القواعد بشكل صحيح
2. **كود مكرر** - نفس المنطق مكتوب في أماكن متعددة
3. **صعوبة الصيانة** - تغيير ميزة يؤثر على جميع الأنواع
4. **أخطاء Runtime** - بسبب البيانات المفقودة أو الخاطئة
5. **صعوبة التوسع** - إضافة ميزة جديدة تتطلب تعديل كل الملفات

### الفوائد المتوقعة:
1. ✅ **Type Safety قوي** - TypeScript يكتشف الأخطاء مبكراً
2. ✅ **كود أنظف** - كل نوع له logic خاص به
3. ✅ **صيانة أسهل** - تغييرات معزولة لكل نوع
4. ✅ **أقل أخطاء** - البيانات المطلوبة واضحة
5. ✅ **توسع أسرع** - إضافة ميزات جديدة بسهولة

---

## 📊 الأنواع الثلاثة

### 🟠 Private (خاص)
```typescript
{
  profileType: 'private',
  planTier: 'free' | 'premium',
  maxListings: 3 | 10,
  features: ['basic_listing', 'trust_score']
}
```

**الميزات:**
- إعلانات بسيطة
- درجة الثقة (Trust Score)
- معرض صور شخصي
- التقييمات والمراجعات

---

### 🟢 Dealer (تاجر)
```typescript
{
  profileType: 'dealer',
  planTier: 'dealer_basic' | 'dealer_pro' | 'dealer_enterprise',
  maxListings: 50 | 150 | 500,
  dealershipRef: `dealerships/{uid}`,
  dealerSnapshot: {
    nameBG: string,
    nameEN: string,
    logo?: string,
    status: 'pending' | 'verified' | 'rejected'
  }
}
```

**الميزات:**
- معلومات المعرض التجاري
- ساعات العمل
- الخدمات (تمويل، ضمان، استبدال)
- فريق العمل
- تحليلات متقدمة
- CSV Import/Export
- API Access

---

### 🔵 Company (شركة)
```typescript
{
  profileType: 'company',
  planTier: 'company_starter' | 'company_pro' | 'company_enterprise',
  maxListings: 100 | 300 | 1000,
  companyInfo: {
    bulstatNumber: string,
    fleetSize: number,
    departments: string[]
  }
}
```

**الميزات:**
- إدارة الأساطيل
- تقارير مخصصة
- Multi-user accounts
- Bulk operations
- Advanced analytics
- Enterprise API

---

## 🚀 المراحل التنفيذية (4 Phases)

### Phase 0: Pre-Migration Safeguards (3-5 أيام)
- Validators حرجة داخل `ProfileTypeContext`
- حظر التحويلات غير القانونية (مثلاً Dealer → Private مع إعلانات > 10)
- توحيد مصادر البيانات (المهملات والحقول القديمة)

### Phase 1: Core Interfaces & Types (أسبوع واحد)
- إنشاء الواجهات الأساسية
- Type guards و validators
- Unit tests

### Phase 2A: Service Layer (أسبوع)
- فصل الخدمات لكل نوع
- Firebase Firestore structure
- Security rules

### Phase 2B: Integrations & Consolidation (أسبوع)
- دمج الخدمات المكررة (dealership/bulgarian-profile)
- تحديث الاستدعاءات في UI لاستخدام الخدمات الجديدة

### Phase 3: UI Components (أسبوعين)
- مكونات UI مخصصة لكل نوع
- Forms و validation
- Theme colors

### Phase 4: Migration & Testing (أسبوع واحد)
- Data migration script
- Integration tests
- User acceptance testing

**المدة الإجمالية التقريبية:** 6 أسابيع (مرنة حسب نطاق البيانات)

---

## ⚠️ قبل أن تبدأ

### قواعد المشروع (الدستور):
1. **الموقع:** جمهورية بلغاريا
2. **اللغات:** Bulgarian (BG) + English (EN) فقط
3. **العملة:** Euro (€)
4. **حجم الملفات:** Max 300 lines - قسّم إذا لزم
5. **لا تحذف:** انقل الملفات إلى `DDD/` للمراجعة
6. **No Text Emojis:** استخدم SVG icons فقط
7. **Production Ready:** كل الكود جاهز للإنتاج
8. **No Duplication:** لا تكرار للكود

---

## 📖 الملف التالي

بعد قراءة هذا الملف، اذهب إلى:

### للمبرمج:
➡️ **[CURRENT_SYSTEM_REALITY.md](./CURRENT_SYSTEM_REALITY.md)**
- افهم النظام الحالي قبل أي تغيير
- جميع الملفات والمكونات موثقة

### للمدير أو المراجع:
➡️ **[FOLDER_SUMMARY.md](./FOLDER_SUMMARY.md)**
- نظرة عامة سريعة
- ملخص لكل ملف

---

## 🎓 مصطلحات مهمة

- **BG** = Bulgarian (البلغارية)
- **EN** = English (الإنجليزية)
- **EGN** = رقم الهوية البلغاري (10 أرقام)
- **Bulstat** = رقم التسجيل التجاري (9-13 رقم)
- **EIK** = رقم تعريف موحد (9 أرقام)
- **VAT** = رقم الضريبة (BG + 9 أرقام)
- **EOOD** = شركة ذات مسؤولية محدودة (شخص واحد)
- **OOD** = شركة ذات مسؤولية محدودة
- **AD** = شركة مساهمة
- **ET** = تاجر فردي

---

## 📞 مساعدة وأسئلة

- **المشروع:** Globul Cars
- **الموقع:** https://fire-new-globul.web.app
- **Firebase:** fire-new-globul
- **Instagram:** @globulnet
- **الموقع الإضافي:** mobilebg.eu

---

**🎉 مستعد؟ دعنا نبدأ!**

**الملف التالي:** [CURRENT_SYSTEM_REALITY.md](./CURRENT_SYSTEM_REALITY.md)

---

**آخر تحديث:** نوفمبر 2025  
**الإصدار:** v1.0

