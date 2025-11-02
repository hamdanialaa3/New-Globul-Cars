# 🧭 MIGRATION_EXECUTION_PLAN.md
## خطة تنفيذ الترحيل خطوة بخطوة

هذه الخطة تكمل: ROLLOUT_OPERATOR_CHECKLIST.md و MIGRATION_RUNBOOK_DEALERSHIP.md.

---

## Phase 0: التحضير (أسبوع 1)
- [ ] Firestore/Storage Export (نسخ احتياطي كامل)
- [ ] بيئة Staging مطابقة للإنتاج (مشروع Firebase منفصل)
- [ ] Remote Config مفاتيح التفعيل/التدرج موجودة ومختبرة
- [ ] Monitoring: لوحات Cloud Functions/Firestore + تنبيهات
- [ ] Seed بيانات تركيبية على Staging (1000–5000 مستخدم)
- [ ] تأكيد الفهارس (indexes) المطلوبة

Artifacts:
- Backup manifest
- RC snapshot
- Test dataset manifest

---

## Phase 1: الترحيل المتوازي (أسابيع 2–3)
- [ ] تشغيل النظام الجديد بجانب القديم (Compatibility Layer ON)
- [ ] Dual-read/Dual-write حيث يلزم (قراءة من الجديد، كتابة في كليهما)
- [ ] مقارنة النتائج في الوقت الحقيقي (Consistency Checker)
- [ ] Auto-heal للتناقضات الطفيفة

Verification:
- مقارنة عشوائية (Spot-check) لعينات يومية
- تقارير movedCount/skippedCount/retryCount

---

## Phase 2: التبديل (أسبوع 4)
- [ ] تفعيل RC_DEALERSHIP_MIGRATION_ENABLED على 10%
- [ ] مراقبة لمدة ساعتين (خطأ < 0.5%, P95 < 900ms)
- [ ] رفع إلى 50% لمدة 24 ساعة
- [ ] رفع إلى 100% لمدة 48 ساعة
- [ ] إطفاء Compatibility Layer تدريجياً

Exit Criteria:
- 0 legacy dealerInfo/isDealer في users
- لا إنذارات مستمرة خلال 48 ساعة

---

## واجهات/قواعد إسناد مرجعية

- Migration Script: راجع MIGRATION_RUNBOOK_DEALERSHIP.md (Batch + Idempotency)
- Security Rules: راجع PROFILE_TYPES_SEPARATION_PLAN_PRIORITIZED.md (Users/Dealerships/Companies)
- Remote Config: RC_PROFILE_SWITCH_GUARD_ENABLED, RC_DEALERSHIP_MIGRATION_ENABLED
- Consistency Checker: وظيفة مجدولة كل 6 ساعات + Auto-heal

---

## لقطات تحقق (Checkpoints)
- CP1: نجاح Staging Tests (100%)
- CP2: انتهاء أول دفعة إنتاجية بدون إنذارات
- CP3: 50% من المستخدمين، مقاييس مستقرة
- CP4: 100% من المستخدمين، لا legacy fields
- CP5: توقيف Compatibility Layer + توثيق النتيجة

---

## جدول المخاطر السريع
- فقدان بيانات → نسخ احتياطي + Idempotency + Rollback مستهدف
- تدهور أداء → مراقبة P95 + خنق دفعات + معادلة عبء
- أخطاء قواعد → Dry-run + Emulators + حرس RC

---

## المخرجات (Deliverables)
- تقرير إنجاز الترحيل
- Metrics Dashboard لقيم ما بعد التبديل
- قائمة الحقول المهملة المُزالة بالكامل
