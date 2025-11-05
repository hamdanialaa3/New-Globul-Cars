# 🧩 IMPLEMENTATION_STRATEGY.md
## استراتيجية التنفيذ المترابطة (Phases, Flags, Deliverables)

تربط هذه الوثيقة المراحل (0,1,2A,2B,3,4) مع المخرجات والأعلام والاعتماديات.

---

## خريطة المراحل
- Phase 0: Safeguards & Validators
  - Deliverables: Profile switch guards, rule checks, translations
  - Flags: RC_PROFILE_SWITCH_GUARD_ENABLED=true
- Phase 1: Core Types & Validators
  - Deliverables: Types, guards, tests
- Phase 2A: Services Consolidation
  - Deliverables: DealershipService canonical, snapshot sync, remove old dealerInfo
- Phase 2B: Integrations Update
  - Deliverables: UI consumers updated, no direct old fields
  - Flags: RC_DEALERSHIP_MIGRATION_ENABLED steps
- Phase 3: UI Split
  - Deliverables: Split ProfilePage, lazy-load detail, snapshot use
  - Flags: RC_UI_PROFILE_SPLIT_ENABLED=true
- Phase 4: Migration & Testing
  - Deliverables: Batches executed, reports, dashboards

---

## الاعتماديات
- Phase 2A يعتمد على Phase 1 (types ready)
- Phase 3 يعتمد على 2B (integrations migrated)
- Migration execution يتطلب Phase 0 مفعّل و 2A/2B مكتملين

---

## مخرجات لكل مرحلة (Definition of Done)
- Types: build green + tests green + no any in public APIs
- Services: zero references to deprecated fields
- UI: snapshot-first rendering, no regressions in nav/forms
- Migration: 100% processed, legacy fields removed, metrics green

---

## الوثائق المُساندة
- ROLLOUT_OPERATOR_CHECKLIST.md
- MIGRATION_EXECUTION_PLAN.md
- CONTINGENCY_PLAN.md
- MONITORING_AND_ANALYTICS.md
- SUCCESS_METRICS.md
- TECHNICAL_DECISION_RECORD.md
