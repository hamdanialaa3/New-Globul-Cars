# 🔄 GRADUAL_MIGRATION_PLAN.md
## استراتيجية الترحيل التدريجي (Gradual Migration)

توضّح هذه الوثيقة أسلوب التشغيل المتوازي، القراءة/الكتابة المزدوجة، ثم التبديل الكامل.

---

## Phase 0: التشغيل المتوازي (أسبوعين)
- النظام القديم والجديد يعملان معاً
- Dual-write: الكتابة تُسجّل في البنية الجديدة مع الحفاظ على التوافق الخلفي
- مقارنة نتائج أساسية عبر Consistency Checker

## Phase 1: القراءة من النظام الجديد (أسبوع)
- القراءة من الكيان الجديد (dealerships/{uid})
- الكتابة تبقى مزدوجة مؤقتاً
- مراقبة الأداء والأخطاء بعناية

## Phase 2: التبديل الكامل (أسبوع)
- إيقاف الكتابة للهيكل القديم نهائياً
- تنظيف الحقول الموروثة (isDealer, dealerInfo, companyInfo إذا استبدلت)

---

## Compatibility Layer (ملاحظات)
```ts
// src/types/legacy-compatibility.types.ts (reference-only)
interface LegacyCompatibilityLayer {
  legacySupport: {
    canReadOldFormat: boolean;
    canWriteNewFormat: boolean;
    migrationStatus: 'pending' | 'in_progress' | 'completed';
    autoMigration: boolean;
  };
  autoConverters: {
    oldToNew: (legacyData: any) => BulgarianUser;
    newToOld: (newData: BulgarianUser) => any;
  };
}
```

- ملاحظة: طبقة التوافق تُنفَّذ حين الحاجة فقط، وتُزال بعد اكتمال الترحيل.

---

## قياسات التقدم
- % المستخدمين المهاجرين بالكامل
- عدد الوثائق المصحّحة تلقائياً
- زمن الاستجابة P95 قبل/بعد
- نسبة الأخطاء قبل/بعد
