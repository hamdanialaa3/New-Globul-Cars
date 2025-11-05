# 🛡️ CONTINGENCY_PLAN.md
## خطة الطوارئ والتراجع الآمن

هذه الخطة تحدد شروط التراجع، خطواته، وطرق التحقق بعد التنفيذ.

---

## RollbackPlan (Type Contract)
```ts
// rollback-manager.ts (reference-only contract)
interface RollbackPlan {
  triggers: {
    errorRate: number;        // e.g., > 0.5% writes
    performanceDrop: number;  // e.g., P95 > 1000ms sustained 15m
    dataLoss: boolean;        // any detected data loss
  };
  steps: {
    immediate: string[];      // إجراءات فورية
    phased: string[];         // إجراءات مرحلية
    dataRecovery: string[];   // استعادة البيانات
  };
  verification: {
    healthChecks: string[];   // فحوصات الصحة
    dataIntegrity: string[];  // فحوصات التكامل
  };
}
```

---

## Triggers (أمثلة عملية)
- Errors/min > baseline + 2.0 أو > 0.5% من الكتابات
- P95 latency > 1000ms لمدة 15 دقيقة
- ارتفاع Aborted writes > 0.3% لمدة 15 دقيقة
- تقارير فقدان بيانات من مراقبة التناسق/الدعم

---

## Steps
### Immediate
- Set RC_DEALERSHIP_MIGRATION_ENABLED=false
- إن لزم: RC_UI_PROFILE_SPLIT_ENABLED=false
- إيقاف مهام الترحيل المجدولة
- تفعيل Read-only تنبيهي (عُلم) إذا الضرر واسع

### Phased
- تراجع نشر Functions الأخير (rollback to previous version)
- تقليل دفعات الترحيل وإعادة المحاولة مع backoff
- عزل cohort محدد متأثر وإيقافه

### Data Recovery
- استرجاع مستهدف من Firestore Export حسب uid
- تصحيح الوثائق المعيبة وإعادة تشغيل دفعات الإصلاح
- تدقيق integrity: counts, checksums, random sampling

---

## Verification (ما بعد التراجع)
- صحّة القراءة/الكتابة بدون إنذارات لمدة 2h
- مقارنة عينات قبل/بعد التراجع
- تأكيد إزالة الحقول المعيبة/الحالات المكسورة

---

## اتصالات (Comms)
- رسالة فورية داخلية: سبب التراجع، النطاق، الزمن، المسؤولون
- تحديث حالة للعملاء إن تأثروا (شريط بسيط داخل التطبيق)
- تقرير لاحق بأسباب الجذر (RCA) + إجراءات منع التكرار
