# 📦 PROJECT_HANDOVER_GUIDE.md
## دليل التسليم للمطورين والعمليات

غرض هذا الدليل: تسليم منظم، تشغيل آمن، واستجابة فعّالة للطوارئ.

---

## 1) المعلومات الأساسية
- بنية المشروع (Monorepo) + المجلدات الأساسية (frontend, functions, ai, assets, DDD)
- مزودو السحابة: Firebase (Auth, Firestore, Storage, Functions)
- الحزم وإدارة الإصدارات: npm, CRACO, TypeScript
- بيئات العمل: dev, staging, production

---

## 2) التشغيل والصيانة
- Runbooks: 
  - ROLLOUT_OPERATOR_CHECKLIST.md
  - MIGRATION_RUNBOOK_DEALERSHIP.md
  - MIGRATION_EXECUTION_PLAN.md
  - CONTINGENCY_PLAN.md
- مهام دورية:
  - مراجعة RC flags أسبوعياً
  - تفقد مؤشرات المراقبة ولوحات الأداء
  - تحديث الفهارس والسياسات عند الحاجة

---

## 3) جهات الاتصال والمسؤوليات
- Product Owner: …
- Tech Lead: …
- DevOps/Cloud: …
- Support Lead: …

(املأ الأسماء/القنوات الفعلية داخلياً)

---

## 4) الطوارئ
- من يُستدعى: حسب نوع المشكلة (Backend, Frontend, DB)
- إجراءات: راجع CONTINGENCY_PLAN.md
- التصعيد: PAGE بعد 15 دقيقة من الإنذار المستمر

---

## 5) المعرفة التشغيلية
- المراقبة: لوحات Cloud Monitoring + Sentry/Crashlytics
- التقارير: أسبوعية (المقاييس الأساسية)
- خطط التوسع: تحسينات الأداء + الأتمتة + المناوبة

---

## 6) التوثيق التقني والقرارات
- TECHNICAL_DECISION_RECORD.md (TDR)
- PROFILE_TYPES_SEPARATION_PLAN_PRIORITIZED.md (blueprint)
- ANALYSIS_AND_CHANGES_SUMMARY.md (rationale)

---

## 7) تحقق ما بعد التسليم
- مرور على قواعد Firestore
- تشغيل اختبارات التكامل/الواجهات
- مراجعة خطوات الترحيل ونتائجها

---

## ملاحظة
حدّث هذا الدليل عند تغيّر فرق العمل أو إضافة أنظمة مراقبة جديدة.
