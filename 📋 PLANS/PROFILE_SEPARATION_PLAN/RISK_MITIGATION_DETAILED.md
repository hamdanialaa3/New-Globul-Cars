# ⚠️ RISK_MITIGATION_DETAILED.md
## إدارة المخاطر التفصيلية

تفصيل للمخاطر عالية التأثير أثناء فصل أنواع البروفايل وترحيل البيانات، مع حلول عملية وقابلة للقياس.

---

### 1) فقدان البيانات
- الوقاية:
  - Firestore/Storage Backup قبل كل مرحلة رئيسية
  - Idempotent migration + batch journaling
  - Read-only guard عند الإنذارات المرتفعة
- التحقق:
  - مقارنة سجلات عيّنية قبل/بعد (random sampling)
  - Consistency Checker: نسبة التطابق > 99.7%
  - Integrity checksums لدفعات محددة

### 2) توقف الخدمة
- الوقاية:
  - تفعيل تدريجي عبر RC (10% → 50% → 100%)
  - Blue/Green بنشر Functions (إن أمكن)
  - CDN cache لواجهات القراءة فقط
- التحقق:
  - Health checks كل دقيقة
  - مراقبة uptime و P95

### 3) أداء النظام
- الوقاية:
  - Preloading + proactive cache
  - SWR cache مع invalidation عبر onSnapshot
  - توازن عبء دفعات الترحيل (تأخير/Backoff)
- التحقق:
  - اختبار حمل 48 ساعة قبل الإنتاج
  - مقارنة P95 قبل/بعد

### 4) تناقض حالة المستخدم
- الوقاية:
  - Consistency Checker مجدول + Auto-heal
  - Migration lock في users/{uid}
  - Security rules تمنع الحالات غير القانونية
- التحقق:
  - تقارير mismatches يومية
  - إنذارات عند تجاوز الحد

### 5) خطأ بشري أثناء التفعيل
- الوقاية:
  - Operator Checklist مفصل + مراجعة زميل
  - قوالب RC محفوظة + change log
- التحقق:
  - مراجعة يومية لحالة RC + GitOps لملفات الإعداد

---

## جداول العتبات (Thresholds)
- Errors/min: WARN baseline + 1.0, PAGE baseline + 2.0
- Aborted writes: WARN 0.2%, PAGE 0.3%
- P95 latency: WARN > 900ms, PAGE > 1000ms (15m)
- Consistency mismatches: WARN > 0.5%, PAGE > 1%

---

## خطط التحقق (Validation)
- Emulators + Staging: تغطية كاملة لمسارات التحويل/التراجع
- E2E Tests لأكثر المسارات حساسية (switch profile, create listing)
- اختبارات مشغلة مع RC flags المرادفة للإنتاج

---

## ارتباطات
- CONTINGENCY_PLAN.md
- ROLLOUT_OPERATOR_CHECKLIST.md
- MONITORING_AND_ANALYTICS.md
