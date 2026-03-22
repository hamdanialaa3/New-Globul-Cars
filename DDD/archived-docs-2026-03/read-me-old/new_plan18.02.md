الملف CONSTITUTION.md محجوب حالياً لكني أعدت صياغة مسودة اقتراحات تقنية وتنظيمية شاملة تُغطي كل الجوانب التي تحتاجها المنصة لتكون رصينة، قابلة للتوسع، وآمنة. هذه النقاط مُصممة لتُدرج مباشرة في ملف الدستور التقني كـ checklist ومخطط للنقاش والتنفيذ.

البنية المعمارية والبيانات
توثيق معماري واحد: أضف مخطط معماري (diagram) يوضح الخدمات، قواعد البيانات، التخزين، CDN، وواجهات الـ API. ضع روابط إلى مخططات قابلة للتحديث (Diagrams-as-code).

Taxonomy موحّد: اعتمد ملف JSON/YAML واحد للـ taxonomy (brand → year → model → trim → engine) مع versioning وschema validation. اجعل كل خدمة تقرأ من نفس المصدر.

عقدة بيانات مركزية: صِف contract لكل مستند رئيسي (Listing, User, Story, Campaign) مع أمثلة JSON وحقول إلزامية/اختيارية.

Schema Registry: سجل تغييرات الـ schema مع migration scripts لكل تغيير (db migrations).

API Contracts: استخدم OpenAPI/GraphQL schema موحّد؛ اجعل كل endpoint موثّقاً مع أمثلة طلب/استجابة ورموز الخطأ.

Caching وIndexing: حدد طبقة كاش (Redis/Memory) وIndexing (Algolia/Elastic) مع قواعد TTL وcache invalidation عند تحديث القوائم.

Media Pipeline: سياسة موحّدة للصور/فيديو: client compression, server transcode (WebP/AVIF), thumbnails، CDN origin rules، ومسارات تخزين (draft vs published).

الأمن والخصوصية والامتثال
مفتاح واحد للسياسة: أدرج سياسة خصوصية وملف GDPR وبيان معالجة البيانات داخل المشروع مع خطوات الامتثال (DPA، سجل المعالجات).

Consent & Audit: سجل موافقات المستخدمين لاستخدام الصور في التدريب؛ احتفظ بسجل قابل للاستعلام (who/when/what).

تخزين آمن للأسرار: استخدم secret manager (Vault / cloud KMS)؛ لا تضع مفاتيح في repo أو .env عامة.

تشفير شامل: TLS في النقل، تشفير at‑rest للـ buckets الحساسة، مفاتيح دورية الدوران (rotation).

سياسات الوصول: RBAC مفصّل (Admin, Support, Dev, ML, Ops) مع least privilege وMFA للحسابات الإدارية.

قواعد Firestore/DB صارمة: صِف قواعد الوصول لكل مجموعة (create/read/update/delete) مع اختبارات قواعد تلقائية.

حماية ضد إساءة الاستخدام: rate limits، CAPTCHA للعمليات الحساسة، آليات كشف الاحتيال (duplicate listings, image reuse, bot detection).

حذف واحتفاظ البيانات: سياسة retention وحق المستخدم في الحذف (right to be forgotten) مع خطوات تنفيذية ومسح تدريجي من التخزين والنسخ الاحتياطية.

سجل تدقيق: audit logs لكل عمليات CRUD الحساسة مع إمكانية تصدير للـ SIEM.

DevOps، CI/CD، والاختبارات
بيئات متطابقة: infra-as-code (Terraform) لتعريف staging/prod مع parity تامّة. لا تغيّر إعدادات يدوياً في prod.

Pipeline موحّد: GitHub Actions/GitLab CI:

lint → typecheck → unit tests → build → e2e → canary deploy.

EAS/Fastlane للـ mobile builds، مع secrets في CI.

Testing Pyramid:

Unit tests للخدمات الأساسية (auth, upload, vision client, pricing).

Integration tests لواجهات Functions وStorage.

E2E (Detox/Appium) لسيناريوهات النشر والبحث والدفع/اتصال البائع.

Contract Tests: اختبارات توافق API بين الويب والموبايل (consumer-driven contracts).

CI Smoke Gates: منع الدمج إذا فشل SLO أو اختبارات الأمان (SAST).

Observability: Sentry + Prometheus/Grafana + RUM. اجعل traces مترابطة عبر الخدمات (trace id).

SLOs وAlerting: حدد SLOs (inference ≤3s, API p95 < 500ms) مع playbooks وon‑call rota.

Backups وDR: snapshots يومية، retention 30/90 يوم، خطة استعادة RTO/RPO محددة ومجربة سنوياً.

الذكاء الاصطناعي وبيانات التدريب
Dataset Registry: سجل مجموعات الصور مع metadata (source, consent, label quality, license).

Labeling Workflow: أدوات لوسم الصور، مراجعة بشرية، وقياس جودة الوسم (inter‑annotator agreement).

Versioned Models: سجل نماذج (model registry) مع metadata: training data snapshot, hyperparams, eval metrics.

ML Ops: automated retrain pipelines، A/B model rollout، canary inference, rollback.

Explainability: لكل اقتراح (vision/pricing) أعد حقل explainability مختصر يوضح سبب الاقتراح (features matched, confidence).

Quota & Billing: نظام قياس استهلاك AI لكل مستخدم/حساب، مع حدود مجانية وخطط مدفوعة.

Privacy in ML: تجنب تخزين بيانات حساسة في training set، وقدم آلية opt‑out.

المنتج، تجربة المستخدم، والحوكمة
Mobile‑First Flows: Quick Capture, Scan & Compare, Offline Drafts. اجعل التجربة موجهة للمستخدم أثناء التنقل.

Progressive Disclosure: ابدأ بحد أدنى من الحقول، ثم اقترح الحقول المتقدمة عبر AI أو templates للتجار.

Trust Signals: badges (verified dealer), listing quality score, seller response time، VIN checks، inspection partners.

Monetization Hooks: Stories boosts, Featured listings, AI premium tiers — لكن منفصلة عن تجربة النشر الأساسية.

Moderation Workflow: queue للـ content moderation، أدوات للـ reviewers، وaudit trail للقرارات.

Localization & Accessibility: دعم BG/EN/AR مع ملفات ترجمة، WCAG accessibility checks، تنسيقات عملة/تاريخ محلية.

Governance Board: لجنة تقنية دورية (architecture review board) لمراجعة تغييرات schema/infra/major features.

العمليات التشغيلية والامتداد المستقبلي
Onboarding Devs: README موحّد، dev‑container، scripts للإعداد المحلي (one‑command dev start).

Feature Flags: استخدم نظام flags (LaunchDarkly/Unleash) لكل ميزة جديدة مع kill switch.

Migration Strategy: لكل تغيير في schema، اكتب migration script + compatibility shim لتجنّب كسر العملاء.

Cost Control: tagging للموارد، budgets، alerts عند تجاوز thresholds، تقارير شهرية للتكلفة.

Third‑party Risk: تقييم مزودين (privacy, SLA, exit strategy)، عقود DPA مع مزودي البيانات.

Roadmap Governance: فصل واضح بين MVP, V1, V2 مع acceptance criteria لكل مرحلة، ومؤشرات نجاح قابلة للقياس.

خطوات مقترحة لإدراجها في CONSTITUTION.md
مقدمة قصيرة: هدف الدستور، من يلتزم به، وكيف يُحدّث.

قوائم تحقق تنفيذية: security checklist, release checklist, pre‑merge checklist.

مخططات وملفات مرجعية: روابط إلى taxonomy.json, OpenAPI, infra repo, model registry.

سياسات: data retention, consent, incident response, escalation matrix.

قواعد الحوكمة: من يوافق على تغييرات schema، من يملك الميزانية، من يملك القرار التقني النهائي.

مرفقات: runbooks، playbooks، contact list للطوارئ.

خاتمة وخطوة تالية مقترحة
أدرج هذه النقاط كـ مسودة فصلية داخل CONSTITUTION.md (قسم Architecture, Security, DevOps, ML, Product, Ops). إذا رغبت، أجهز لك نسخة جاهزة للنسخ بصيغة Markdown مُنظّمة لكل قسم مع أمثلة JSON/commands وtemplates (firestore.rules, CI YAML, migration script template). أخبرني أي قسم تريدني أن أجهّزه أولاً وسأقدمه جاهزاً للنقاش أو للإدراج
----------------------------------------------------------------------------
التلخيص السريع
انسخ كل ما كتبته أعلاه إلى ملف المسودة — المحتوى شامل ومتكامل كأساس. لكن أضيف الآن مجموعة نقاط عملية ومحددة يجب إدراجها في CONSTITUTION.md قبل اعتباره نهائيًا، لتفادي ارتباك برمجي عند التوسع وضمان جاهزية تشغيلية وقانونية.

إضافات تقنية وتنظيمية يجب إدراجها فورًا
Versioned Taxonomy File

ملف موحّد taxonomy.v{n}.json مع حقل schemaVersion وشرح طريقة الترقية.

Schema Contracts وExamples

لكل كيان رئيسي (User, Listing, Story, Campaign) أضف JSON مثال وحقول إلزامية/اختيارية ونوع البيانات.

API Contract Registry

رابط إلى OpenAPI spec أو GraphQL schema؛ سياسة تغيير واجهات API (deprecation window).

Migration Policy

خطوات ترحيل schema: migration script template، compatibility shim، اختبار رجعي قبل الدمج.

Feature Flags وKill Switches

ملف featureFlags.md يحدد كل علم، القيمة الافتراضية، وكيفية تعطيله من السيرفر فورًا.

Secrets Management

سياسة استخدام Secret Manager؛ لا مفاتيح في repo؛ خطوات دوران المفاتيح.

Consent Audit Log

نموذج سجل موافقات المستخدمين لاستخدام الصور في التدريب مع حقل timestamp وsource.

Data Retention and Deletion

سياسة زمنية لكل نوع بيانات، خطوات حذف فعلي من storage وbackups، وإثبات الحذف للمستخدم.

RBAC Matrix

جدول أدوار وصلاحيات (Admin, Support, Dev, ML, Ops) مع أمثلة عمليات مسموحة وممنوعة.

Firestore Rules Snippets

أمثلة قواعد جاهزة للمجموعات الحساسة مع اختبارات قواعد تلقائية.

CI/CD Gate Rules

شروط منع الدمج: failing SAST, failing unit tests, coverage threshold، SLO regression.

إضافات تشغيلية وDevOps
Infra as Code Reference

رابط لمستودع Terraform أو CloudFormation مع تعليمات deploy للـ staging/prod.

One‑command Dev Start

سكربت dev.sh أو devcontainer يهيئ env محليًا ويشغّل emulators.

TESTING.md Template

خطوات smoke tests، acceptance checklist، وكيفية تشغيل emulators وE2E.

Observability Playbook

قائمة متغيرات Sentry/Grafana، trace ids، وكيفية فتح incident وon‑call rota.

Cost Control Rules

tagging convention، budget alerts، periodic cost report owner.

إضافات للذكاء الاصطناعي وML Ops
Dataset Registry

جدول يصف كل مجموعة بيانات: source, consent, license, qualityScore.

Model Registry

لكل إصدار نموذج: id, trainingSnapshot, metrics, rolloutStatus, rollbackSteps.

Explainability Field

إجبار كل استجابة AI على حقل explainability قصير يشرح سبب الاقتراح.

Quota and Billing Policy

تعريف حدود مجانية، آلية احتساب الاستهلاك، webhook للـ billing events.

حوكمة المنتج والحوكمة التقنية
Change Approval Board

من يوافق على تغييرات schema أو infra أو ميزات مدفوعة.

Release Policy

تعريف مراحل: canary → internal → public، مع acceptance criteria لكل مرحلة.

Incident Response Playbook

خطوات فورية، من يتواصل، قوالب رسائل للمستخدمين، postmortem template.

بنية ملفات مقترحة للمسودة
CONSTITUTION.md (lead + links)

taxonomy.v1.json

schemas/ (Listing.json, User.json, Story.json)

api/openapi.yaml (or schema.graphql)

ops/TESTING.md

ops/firestore.rules

ops/infra/README.md

ml/dataset_registry.csv

governance/CHANGE_APPROVAL.md

خطوات تنفيذ سريعة الآن
انسخ المحتوى الحالي الذي كتبته سابقًا إلى CONSTITUTION.md.

أضف الأقسام أعلاه كعناوين فرعية قصيرة في نفس الملف مع روابط إلى ملفات مرجعية أو قوالب.

أنشئ مستودع فرعي أو مجلد governance لوضع القوالب (rules, CI snippets, migration template).

سجّل إصدار أول CONSTITUTION v0.1 مع changelog بسيط.
------------------------------------------------------------------------------
CONSTITUTION FOR KOLI ONE TECHNICAL GOVERNANCE
Purpose
This document is the technical constitution for Koli One and the Alaa Technologies portfolio. It defines architecture, data contracts, security, DevOps, ML governance, product rules, and operational policies required to keep the platform robust, auditable, and scalable. Use this file as the canonical reference for engineering, security, and product decisions.

1 Architecture and Data Contracts
1.1 System Overview
Single source of truth: Web and Mobile share the same backend services, database, and taxonomy. No divergent data models between clients.

Services: API Gateway → Auth Service → Listings Service → Media Service → Search Indexer (Algolia) → Pricing/AI Functions → Analytics.

Storage: Firestore (primary documents), Cloud Storage (media), Redis (optional cache), Algolia (search index).

1.2 Canonical Taxonomy
File: taxonomy.v1.json

Structure:

schemaVersion: integer

brands: [{ id, name, aliases[] }]

models: [{ id, brandId, name, generations[] }]

trims: [{ id, modelId, name, engineVariants[] }]

Rules:

Every listing must reference brandId, modelId, generationId, trimId where available.

Taxonomy changes require a migration script and version bump.

1.3 Document Schemas
Place JSON schema files under schemas/:

schemas/User.json — required fields: uid, email?, phone?, createdAt, roles[], profile{displayName,trustScore,verification}

schemas/Listing.json — required fields: listingId, sellerId, brandId, modelId, year, price, currency, mileage, media[], status, createdAt

schemas/Story.json, schemas/Campaign.json, schemas/ConsultationRequest.json

Each schema includes required, properties, types, and example.

1.4 API Contracts
Spec: Maintain api/openapi.yaml (or GraphQL schema) as the canonical API contract.

Policy: Any breaking change must be documented, deprecated for at least 30 days, and accompanied by a compatibility shim.

1.5 Indexing and Caching
Search: Algolia index fields must match Listing.json fields used for filters. Maintain index mapping in ops/algolia-mapping.json.

Cache: Use Redis for hot counters (views, contact counts). Cache invalidation must be triggered on listing updates.

2 Security Privacy and Compliance
2.1 Secrets and Keys
No secrets in repo. Use cloud Secret Manager or Vault.

Rotation: Keys rotate every 90 days. Document rotation steps in ops/secrets-rotation.md.

2.2 Data Protection
Transport: TLS 1.2+ enforced for all endpoints.

At rest: Encrypt sensitive buckets and DB fields (e.g., payment tokens).

Access control: RBAC with roles: admin, support, dev, ml, ops, dealer.

MFA: Required for admin and ops accounts.

2.3 Consent and Audit
Consent record: store { userId, purpose, timestamp, source } for any opt-in (e.g., ML training).

Audit logs: All CRUD on sensitive collections must be logged with actorId, action, resource, timestamp.

2.4 Firestore Rules
Keep ops/firestore.rules in repo. Example snippet:

js
match /listings/{listingId} {
  allow create: if request.auth != null && request.resource.data.sellerId == request.auth.uid;
  allow update, delete: if request.auth != null && resource.data.sellerId == request.auth.uid;
  allow read: if true;
}
Add automated tests for rules in CI.

2.5 Privacy and Retention
Retention policy: define per-collection TTLs (e.g., drafts 30 days, logs 365 days).

Right to be forgotten: implement DELETE /users/{uid} workflow that removes PII, media, and flags training datasets.

3 DevOps CI CD and Testing
3.1 Environments and IaC
IaC: Terraform modules for staging and prod in ops/infra/.

Parity: staging must mirror prod configuration (scaling, secrets, feature flags).

3.2 CI Pipeline
GitHub Actions (or GitLab CI) pipeline:

lint → typecheck → unit tests → integration tests → build → e2e → deploy (canary)

Mobile: EAS + Fastlane steps for store builds.

Gate rules: block merges if SAST or unit tests fail or coverage drops below threshold.

3.3 Testing Strategy
Unit tests for services (auth, upload, vision client).

Integration tests for functions and storage (use emulators).

E2E: Detox/Appium for mobile flows (publish wizard, upload, messaging).

Contract tests: consumer-driven contract tests between web and mobile.

3.4 Observability and SLOs
Tools: Sentry (errors), Prometheus/Grafana (metrics), RUM (frontend).

SLOs:

API p95 < 500ms

Vision inference ≤ 3s

Upload success rate > 99%

Alerting: PagerDuty or equivalent on-call rota and runbooks in ops/playbooks/.

3.5 Backups and DR
Daily DB snapshots, 30-day retention by default.

DR test annually; document RTO and RPO.

4 ML Governance and AI Ops
4.1 Dataset Registry
ml/dataset_registry.csv columns: datasetId, source, consented, license, qualityScore, createdAt.

Only datasets with consented = true may be used for training.

4.2 Model Registry
ml/model_registry.json entries: modelId, version, trainingSnapshotId, metrics, rolloutStatus, createdAt.

All model deployments must include rollback steps and canary rollout.

4.3 Explainability and Quotas
Explainability: every AI response must include explainability and confidence.

Quota enforcement: AI calls must check aiQuotaCheck CF before execution. Track usage per user and per account tier.

4.4 ML Ops Pipelines
Automated retrain pipelines with reproducible environments.

A/B model evaluation and metrics collection in BigQuery.

5 Product Rules and UX Governance
5.1 Mobile First Principles
Quick Capture: camera-first listing creation with auto-draft.

Offline resilience: online-first with robust drafts (Firestore local cache + AsyncStorage). Document decision and migration steps in ops/offline-decision.md.

5.2 Listing Wizard Rules
7-step wizard required parity across web and mobile.

Each step must validate and persist partial drafts.

UI must show AI suggestions with confidence and allow manual override.

5.3 Trust and Safety
Trust signals: verifiedDealer, inspectionBadge, listingQualityScore.

Moderation: moderation queue, reviewer tools, and audit trail for decisions.

5.4 Monetization Hooks
Non-invasive monetization: storiesBoost, featuredListing, aiPremium.

Implement server-side checks for quotas and billing triggers; payments handled on web or via secure payment provider.

6 Governance and Change Management
6.1 Change Approval Board
Members: CTO, Head of Engineering, Head of Product, Security Lead.

Approves schema changes, infra changes, and paid-feature launches.

6.2 Release Policy
Stages: canary → internal → public.

Each stage requires acceptance criteria and KPI checks.

6.3 Incident Response
ops/playbooks/incident-response.md with steps: detect → contain → notify → remediate → postmortem.

Postmortem template and SLA for publishing.

6.4 Onboarding and Documentation
README.md at repo root with one-command dev start.

ops/TESTING.md with smoke tests and acceptance checklist.

governance/CHANGELOG.md for constitution updates.

Appendix Templates and File Structure
Recommended repository layout

كتابة تعليمات برمجية
/CONSTITUTION.md
/api/openapi.yaml
/schemas/User.json
/schemas/Listing.json
/taxonomy.v1.json
/ops/firestore.rules
/ops/infra/terraform/
/ops/TESTING.md
/ops/playbooks/incident-response.md
/ml/dataset_registry.csv
/ml/model_registry.json
/governance/CHANGE_APPROVAL.md
Quick JSON example for Listing

json
{
  "listingId": "string",
  "sellerId": "string",
  "brandId": "string",
  "modelId": "string",
  "year": 2018,
  "price": 9800,
  "currency": "EUR",
  "mileage": 120000,
  "media": ["gs://bucket/listings/uid/123.jpg"],
  "status": "published",
  "createdAt": "2026-02-18T21:00:00Z"
}
Next Steps and Implementation Plan
Commit this CONSTITUTION.md as v0.1 in repo root.

Create skeleton files listed in Appendix and populate minimal examples.

Schedule Architecture Review Board to approve taxonomy and migration policy.

Add CI checks to block merges that violate rules (lint, typecheck, SAST).

Implement consent audit and dataset registry before any ML training.

If you want, I will now:

generate the actual files and templates (schemas, taxonomy skeleton, ops/TESTING.md, ops/firestore.rules snippets) as ready-to-copy Markdown/JSON files, or

create a prioritized task list (Jira-style epics and tasks) to implement the constitution across 30/60/90 days.

------------------------------------------------------------------------------
ان الوضع الحالي : 
المستخدم : 1 هذا رابطه : http://localhost:3000/profile/1
و هذا اعلانه رقم 540 : http://localhost:3000/car/1/540 
و هذا تعديل ملفه : http://localhost:3000/profile/1/settings
و هذا تعيل ملف الاعلان : http://localhost:3000/car/1/540/edit
و هذا عندما يضهر الاعلان للمستخدمين او الزوار الاخرين : http://localhost:3000/car/1/540
نظرة عامة على نمط الروابط الحالي والمراد تحسينه
الحالة الحالية التي ذكرتها:

ملف المستخدم العام: http://localhost:3000/profile/1

عرض الإعلان (زائر/مستخدم): http://localhost:3000/car/1/540

تعديل ملف المستخدم: http://localhost:3000/profile/1/settings

تعديل الإعلان: http://localhost:3000/car/1/540/edit

سأبني فوق هذا النمط بنظام ثابت، قابل للتوسّع، آمن، وصديق لمحركات البحث، مع شرح دقيق لكيفية توليد كل رابط وربطه بقاعدة البيانات، وكيفية التعامل مع تغيّر العناوين وإعادة التوجيه، وكيفية دعم روابط قصيرة قابلة للمشاركة.

نمط الروابط المقترح وربطها بالبيانات
قواعد عامة

معرّف رقمي ثابت (numericId) يبقى ثابتاً طوال عمر المورد.

slug وصفي لتحسين SEO، لكنه ثانوي للمعرّف الرقمي.

روابط تحرير/إعدادات تبقى مرتبطة بالـ userNumericId أو listingNumericId مع مسار واضح.

نمط URL المقترح

نوع الرابط	قالب URL	مثال
ملف المستخدم العام	/u/{userNumericId}/{userSlug}	/u/1/alaa-al-hamdani
ملف المستخدم الحالي (بدون slug)	/profile/{userNumericId}	/profile/1
إعدادات المستخدم	/profile/{userNumericId}/settings	/profile/1/settings
عرض الإعلان (public canonical)	/car/{listingNumericId}/{brandSlug}-{modelSlug}-{year}/{listingSlug}	/car/540/bmw-3-series-2017/alaa-320d-sport
عرض الإعلان (بنسخة مبسطة كما عندك الآن)	/car/{sellerNumericId}/{listingNumericId}	/car/1/540
تعديل الإعلان	/car/{sellerNumericId}/{listingNumericId}/edit	/car/1/540/edit
رابط قصير للمشاركة	/s/{shortCode}	/s/Ab3d9K
ملاحظة تنفيذية: احتفظ بدعم الشكل القديم (/car/1/540) كـ legacy route مع إعادة توجيه 301 إلى canonical URL الجديد عند توفر slug، أو اعرض canonical في <link rel="canonical">.

مخطط قاعدة البيانات والعلاقات الأساسية
مخطط كيان‑علاقة مبسّط

كتابة تعليمات برمجية
users
  - userId (UUID)
  - userNumericId (INT, unique)
  - username
  - slug (string, unique)
  - createdAt, updatedAt

listings
  - listingId (UUID)
  - listingNumericId (INT, unique)
  - sellerId (FK -> users.userId)
  - brandId, modelId, year
  - title
  - slug (string, unique per listing or global unique)
  - status (draft/published)
  - canonicalUrl (computed)
  - createdAt, updatedAt

listing_slugs_history
  - id
  - listingId
  - oldSlug
  - createdAt

short_links
  - shortCode (PK)
  - targetType ('listing'|'user')
  - targetId
  - createdAt
  - clickCount
فهرسات مقترحة

listings(listingNumericId) unique

listings(sellerId, listingNumericId) composite

users(userNumericId) unique

users(slug) unique

short_links(shortCode) unique

سير إنشاء الرابط عند نشر أو تعديل الإعلان (تفصيلي)
خطوات تنفيذية عند Publish / Update

إنشاء السجل الأساسي: DB يخصّص listingNumericId (auto‑increment أو ULID).

توليد baseSlug: slugify(title || brand-model-year || seller.username).

التحقق من التكرار:

إذا لم يوجد slug مطابق → استخدم baseSlug.

إذا وجد → جرّب baseSlug-2, baseSlug-3 ... حتى 10 محاولات.

إذا استمر التعارض → استخدم suffix ثابت: ${baseSlug}-${listingNumericId}.

حفظ slug في حقل slug وتسجيل أي slug قديم في listing_slugs_history.

حساب canonicalUrl بناءً على القالب المقترح وتخزينه (أو توليده عند الطلب).

فهرسة: أرسل السجل إلى Search Indexer (Algolia) مع الحقول canonicalUrl, slug, listingNumericId.

إرجاع URL للمستخدم: API يعيد canonical URL في استجابة الإنشاء/التحديث.

Redirects: إذا تغيّر slug لاحقاً، أضف سجل redirect 301 من old → new (يمكن تخزينه في listing_slugs_history أو جدول redirects منفصل).

Sequence Diagram (PlantUML)

plantuml
@startuml
actor User
participant "Client (Web/Mobile)" as Client
participant "API Gateway" as API
participant "SlugService" as Slug
database "DB (listings)" as DB
participant "SearchIndexer" as Indexer
Client -> API : POST /listings {title, brand, ...}
API -> DB : INSERT listing (returns listingNumericId)
API -> Slug : generateBaseSlug(title, brand, seller)
Slug -> DB : query slugExists(baseSlug)
alt slug free
  Slug -> API : return baseSlug
else slug collision
  Slug -> DB : try baseSlug-2 ... or baseSlug-listingNumericId
  Slug -> API : return uniqueSlug
end
API -> DB : UPDATE listing SET slug=uniqueSlug, status=published
API -> Indexer : index listing with canonicalUrl
API -> Client : 201 Created + canonicalUrl
@enduml
خوارزمية slugify واحتواء التصادمات (كود نموذجي)
قواعد slugify

Normalize Unicode NFKD

Transliterate (AR/CY → Latin)

Lowercase, replace non‑alnum → -, collapse dashes, trim, limit length 80

Pseudo code

js
function slugify(text, locale='en') {
  const normalized = text.normalize('NFKD');
  const transliterated = transliterate(normalized, locale);
  return transliterated
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80);
}

async function uniqueSlug(baseSlug, listingNumericId) {
  let slug = baseSlug;
  for (let i=1; i<=10; i++) {
    if (!await db.slugExists(slug)) return slug;
    slug = `${baseSlug}-${i+1}`;
  }
  return `${baseSlug}-${listingNumericId}`;
}
التعامل مع الروابط القديمة وتغيّر slug
سجل التاريخ: كل تغيير slug يُسجّل في listing_slugs_history مع oldSlug, redirectTo (current canonical).

Middleware للـ routing:

عند وصول طلب إلى /car/{...}/{slug}:

استخرج listingNumericId من المسار.

جلب السجل من DB؛ إن كان slug في المسار ≠ listing.slug → أعد توجيه 301 إلى canonical URL.

إن لم يوجد listing → 404.

SEO: استخدم 301 redirect دائم، حدّث sitemap، واحتفظ بـ rel=canonical في صفحة الويب.

روابط قصيرة وتحليلات النقر
توليد shortCode: Base62(listingNumericId) أو hash(salt + listingId).slice(0,7).

تخزين: short_links { shortCode, targetType, targetId, createdAt, clickCount }.

خدمة إعادة التوجيه: /s/{shortCode} → lookup → increment clickCount (async) → redirect 302/301 إلى canonical.

قيود: rate limit على endpoint /s/* لمنع إساءة الاستخدام.

أمثلة مستندات Firestore / JSON
مثال Listing document

json
{
  "listingId": "uuid-abc-123",
  "listingNumericId": 540,
  "sellerId": "uuid-user-1",
  "brandId": "bmw",
  "modelId": "3-series",
  "year": 2017,
  "title": "ALAA 320d Sport",
  "slug": "alaa-320d-sport",
  "canonicalUrl": "/car/540/bmw-3-series-2017/alaa-320d-sport",
  "status": "published",
  "createdAt": "2026-02-18T21:00:00Z"
}
مثال User document

json
{
  "userId": "uuid-user-1",
  "userNumericId": 1,
  "username": "alaa",
  "slug": "alaa-al-hamdani",
  "createdAt": "2024-05-01T10:00:00Z"
}
قواعد قبول واختبارات للتنفيذ
Unit tests

slugify مع نصوص AR/BG/EN → توقع slugs محددة.

uniqueSlug مع حالات تصادم متزامن.

Integration tests

نشر إعلانين بنفس العنوان → تحقق من اختلاف slugs.

تغيير عنوان الإعلان → تحقق من وجود redirect 301 من old → new.

Load test

1000 نشر متزامن → لا تكرار في listingNumericId أو slug collisions غير محسوبة.

Acceptance

canonical URL يعاد في استجابة API بعد الإنشاء.

زيارة /car/1/540 يعيد توجيه إلى canonical إن كان slug موجودًا.

خطوات تنفيذ عملية سريعة (مهمة)
اختيار نوع المعرف: قرّر auto‑increment أو ULID. (اقتراح: استخدم auto‑increment للـ listingNumericId إن قاعدة البيانات تدعمها؛ أسهل للـ SEO).

إنشاء SlugService: وحدة تولّد slug وتتحقق من التكرار وتُسجّل التاريخ.

تعديل API Create/Update: احفظ slug وcanonicalUrl بعد الإنشاء، أعد الاستجابة للمستخدم.

إضافة جدول history وredirects.

تحديث SearchIndexer وSitemap generator.

إضافة middleware للـ routing للتحقق من slug وإجراء 301 عند الحاجة.

كتابة اختبارات unit/integration/E2E.

نشر تدريجي: شغّل على staging، اختبر redirects وSEO، ثم انشر.
------------------------------------------------------------------------------
القرار والتنفيذ الفوري
الخيار الأنسب للتنفيذ الفوري هو بناء SlugService — خدمة موحّدة لتوليد وإدارة الـ slugs وكتابة تاريخ التغييرات. سأقدّم لك هنا حزمة تنفيذية جاهزة: كود TypeScript للخدمة، اختبارات وحدة (Jest)، مخطط قاعدة بيانات بسيط، قواعد قبول، وأوامر Git لتطبيق التغييرات كفرع عمل. يمكنك نسخها مباشرة إلى المشروع وبدء الاختبار.

1 ما الذي ستفعله SlugService بالضبط
تولّد baseSlug من عنوان الإعلان أو من تركيبة brand-model-year-seller.

تطبّق transliteration + normalization لدعم AR/BG/EN.

تتحقّق من تفرد الـ slug في قاعدة البيانات، وتجرب suffixes -2, -3, … حتى 10 محاولات.

إذا استمر التعارض، تستخدم fallback ثابت: ${baseSlug}-${listingNumericId}.

تسجّل كل slug قديم في جدول listing_slugs_history مع oldSlug, redirectTo, changedBy, changedAt.

تُعيد canonical URL جاهز للفهرسة والرد على العميل.

تُوفّر واجهة برمجية قابلة للاختبار للاستخدام داخل endpoint الإنشاء/التحديث.

2 واجهة الخدمة وملف الكود TypeScript
موقع مقترح: server/src/services/slug.service.ts  
افتراضات: مشروع Node/TypeScript، ORM بسيط أو طبقة DB مع وظائف findListingBySlug, insertListing, updateListing, insertSlugHistory, وgetListingById.

ts
// server/src/services/slug.service.ts
import { transliterate as unidecode } from 'unidecode'; // npm i unidecode
import { db } from '../lib/db'; // واجهة بسيطة للـ DB
import { Listing } from '../models/listing';

function slugify(text: string, maxLen = 80): string {
  if (!text) return '';
  const normalized = text.normalize('NFKD');
  const transliterated = unidecode(normalized);
  const slug = transliterated
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, maxLen);
  return slug || String(Date.now());
}

export class SlugService {
  static async generateUniqueSlug(baseInput: { title?: string; brand?: string; model?: string; year?: number; sellerUsername?: string }, listingNumericId: number) {
    const baseParts = [];
    if (baseInput.title) baseParts.push(baseInput.title);
    else if (baseInput.brand && baseInput.model) baseParts.push(`${baseInput.brand} ${baseInput.model} ${baseInput.year ?? ''}`);
    else if (baseInput.sellerUsername) baseParts.push(baseInput.sellerUsername);
    const base = baseParts.join(' ').trim() || `listing-${listingNumericId}`;
    const baseSlug = slugify(base);

    // Try baseSlug, baseSlug-2, baseSlug-3 ... up to 10
    for (let i = 0; i < 10; i++) {
      const candidate = i === 0 ? baseSlug : `${baseSlug}-${i + 1}`;
      const exists = await db.slugExists(candidate);
      if (!exists) return candidate;
    }
    // fallback
    return `${baseSlug}-${listingNumericId}`;
  }

  static async assignSlugToListing(listingId: string, listingNumericId: number, baseInput: { title?: string; brand?: string; model?: string; year?: number; sellerUsername?: string }, actorId?: string) {
    const uniqueSlug = await this.generateUniqueSlug(baseInput, listingNumericId);
    // fetch current listing
    const listing: Listing | null = await db.getListingById(listingId);
    if (!listing) throw new Error('Listing not found');

    const oldSlug = listing.slug || null;
    if (oldSlug === uniqueSlug) {
      // no change
      return { slug: uniqueSlug, changed: false };
    }

    // update listing slug and canonicalUrl
    const canonicalUrl = `/car/${listingNumericId}/${uniqueSlug}`;
    await db.updateListingSlug(listingId, uniqueSlug, canonicalUrl);

    // record history if oldSlug existed
    if (oldSlug) {
      await db.insertSlugHistory({
        listingId,
        oldSlug,
        newSlug: uniqueSlug,
        redirectTo: canonicalUrl,
        changedBy: actorId || 'system',
        changedAt: new Date().toISOString()
      });
    }

    return { slug: uniqueSlug, canonicalUrl, changed: true };
  }
}
ملاحظات تنفيذية

استخدمت مكتبة unidecode للتعريب/التعريب العكسي. يمكن استبدالها بمكتبة أقوى (icu‑transliterator) حسب البيئة.

db هو طبقة تجريدية: يجب أن توفر الدوال التالية:

slugExists(slug: string): Promise<boolean>

getListingById(listingId: string): Promise<Listing | null>

updateListingSlug(listingId, slug, canonicalUrl): Promise<void>

insertSlugHistory({ listingId, oldSlug, newSlug, redirectTo, changedBy, changedAt }): Promise<void>

3 اختبارات وحدة Jest
موقع مقترح: server/tests/slug.service.test.ts

ts
// server/tests/slug.service.test.ts
import { SlugService } from '../src/services/slug.service';
import { db } from '../src/lib/db';

jest.mock('../src/lib/db');

describe('SlugService', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  test('slugify basic english title', async () => {
    const slug = await SlugService.generateUniqueSlug({ title: 'Alaa 320d Sport' }, 540);
    expect(slug).toMatch(/alaa-320d-sport/);
  });

  test('handles collisions by suffixing', async () => {
    // simulate slugExists true for base and base-2, false for base-3
    (db.slugExists as jest.Mock)
      .mockResolvedValueOnce(true)
      .mockResolvedValueOnce(true)
      .mockResolvedValueOnce(false);

    const slug = await SlugService.generateUniqueSlug({ title: 'Collision Test' }, 999);
    expect(slug).toMatch(/collision-test-3$/);
  });

  test('fallback uses listingNumericId after 10 collisions', async () => {
    (db.slugExists as jest.Mock).mockResolvedValue(true); // always exists
    const slug = await SlugService.generateUniqueSlug({ title: 'X' }, 12345);
    expect(slug).toMatch(/-12345$/);
  });
});
تشغيل الاختبارات

bash
# تثبيت الحزم إن لم تكن مثبتة
npm install --save-dev jest ts-jest @types/jest unidecode

# إعداد jest في package.json أو jest.config.js
npx jest --runInBand
4 مخطط قاعدة البيانات وتعديلات Migration
لـ SQL (مثال PostgreSQL)

sql
-- listings table assumed existing with listingNumericId and slug columns
ALTER TABLE listings ADD COLUMN IF NOT EXISTS slug VARCHAR(255);
ALTER TABLE listings ADD COLUMN IF NOT EXISTS canonical_url VARCHAR(512);

CREATE TABLE IF NOT EXISTS listing_slugs_history (
  id BIGSERIAL PRIMARY KEY,
  listing_id UUID NOT NULL,
  old_slug VARCHAR(255) NOT NULL,
  new_slug VARCHAR(255) NOT NULL,
  redirect_to VARCHAR(512) NOT NULL,
  changed_by VARCHAR(128),
  changed_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_listings_slug ON listings (slug);
لـ Firestore (NoSQL)

إضافة حقل slug وcanonicalUrl داخل مستند listings/{listingId}.

مجموعة فرعية listings/{listingId}/slug_history/{historyId} أو مجموعة مركزية listing_slugs_history مع الحقول أعلاه.

5 تكامل مع API Create/Update وRouting
خطوات دمج بسيطة

عند POST /api/listings:

أنشئ السجل الأساسي واحصل على listingId وlistingNumericId.

استدعِ SlugService.assignSlugToListing(listingId, listingNumericId, { title, brand, model, year, sellerUsername }, actorId).

أعد الاستجابة مع { listingId, listingNumericId, canonicalUrl }.

عند PUT /api/listings/:id إذا تغيّر العنوان أو الحقول المؤثرة:

استدعِ assignSlugToListing مرّة أخرى؛ الخدمة تتعامل مع عدم التغيير.

Routing middleware:

عند استقبال طلب /car/:sellerId/:listingId أو /car/:listingNumericId/:slug:

جلب السجل حسب listingNumericId.

إن كان slug في المسار يختلف عن listing.slug → أعد توجيه 301 إلى canonicalUrl.

إن لم يوجد listing → 404.

6 Acceptance Criteria واختبارات نهائية
AC1 كل إعلان جديد يحصل على slug فريد خلال ≤ 200ms في بيئة staging.

AC2 نشر إعلانين بنفس العنوان لا يسبب تصادم slug؛ أحدهما يحصل على suffix.

AC3 تغيير عنوان الإعلان يسجّل سجلًا في listing_slugs_history ويؤدي إلى redirect 301 من old → new.

AC4 اختبارات الوحدة تمرّ كلها (npm test) وCI يرفض الدمج إن فشل أي اختبار.

AC5 وجود فهرس فريد على listings.slug أو تحقق تفرد في Firestore قبل الكتابة.

7 أوامر Git وملف باتش جاهز للتطبيق
إنشاء فرع وتطبيق التغييرات

bash
git checkout -b feat/mobile/slug-service
# انسخ الملفات الجديدة إلى server/src/services/slug.service.ts و server/tests/slug.service.test.ts
git add server/src/services/slug.service.ts server/tests/slug.service.test.ts
git commit -m "server: add SlugService with unit tests and slug history support"
git push origin feat/mobile/slug-service
gh pr create --title "Add SlugService and slug history" --body "Implements unique slug generation, collision handling, and history logging" --base main
8 خطوات النشر التجريبي والقياس
نشر على staging مع feature flag ENABLE_SLUG_SERVICE=true.

تشغيل مجموعة اختبارات: unit + integration + E2E لنشر/تعديل/redirect.

مراقبة: Sentry errors, DB slow queries, indexer queue.

تفعيل production بعد 48 ساعة من المراقبة الناجحة.

خاتمة سريعة
ابدأ الآن بإنشاء الملف server/src/services/slug.service.ts وملف الاختبار، ثم شغّل npm test.

سأقدّم لك بعد ذلك باتش unified-diff جاهز إذا رغبت، أو تكامل DB migration مفصّل لبيئتك (Postgres أو Firestore) حسب اختيارك.

أخبرني إن تريد أن أجهّز unified diff الآن أو أن أعدّ migration script لقاعدة بيانات محددة لديك.



