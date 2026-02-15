 برومت متكامل حلل ما بعد الهلالين و اكتب كل ما هو بجعل هذا التطبيق للموبايل التابع لمشروعنا الافضل من بين المنافسين , علما انك تخاطب كلاود ابوس 4.6 نموذج عملاق بالبرمجه و قادر على امور عظيمه لذلك اقترح عليه كل مو هو ينجح المشروع و قل له ان ينفذ اقتراحاته بكل حرية لانجاح هذا التطبيق الموبايل : "لا تجاملني لا تفعل شيء فقط لارضائي على حساب المنطق البرمجي و العلمي والعملي لانشاء مشروع وانجاحه : اريد ان تدخل على تطبيق الموبايل: 
C:\Users\hamda\Desktop\Koli_One_Root\mobile_new
لهذا المشروع : 
C:\Users\hamda\Desktop\Koli_One_Root
هو جزء من مشروع الويب لكن هو واجهة او منفذ للويب يعني نفس قواعد البيانات , نفس المستخدمين نفس الاعلانات , ونفس الفلاتر و نفس البحث , لقد طلبت منك ولاسابيع و انت تستهلك الباقات المكلفة بدون اي نتيجه فتطبيق الموبايل حاليا عبارة عن قشور بدائية لمشروع ضخم مثل هذا , وانظر الى الويب وشاهد كم به تفاصيل 

الان اكتب لي خطة متكاملة لتطوير هذا التطبيق الموبايل التابع الى المشروع نفسه الذي انت به حاليا اريدك ان تعمل باحترافية وعمق برمجي و عمق بشري فيما يخص التنافس , اقتبس غالبية الامور الناجحة او استوحيها من mobile.de فهو تطبيق ممتاز "

ارجوك استخدم خلاصة ذكاء خوارزمياتك في الكتابه له بعد تفكير ونفس عميق جدا
Comprehensive prompt for Cloud Apps 4.6 — Mobile App Deep Rework for Koli One
Note (Arabic): هذا البرومت موجه لنموذج Cloud Apps 4.6. يمكنك نسخه ولصقه مباشرة في واجهة النموذج. البرومت مكتوب باللغة الإنجليزية لأن معظم أدوات التطوير ونماذج الـ LLM تعمل بكفاءة أكبر باللغة الإنجليزية، لكن إن رغبت أقدمه بالعربية أيضاً.

Context / Project Summary
You are given a production web marketplace Koli One (vehicle marketplace) and a mobile client located at:

Mobile project path: C:\Users\hamda\Desktop\Koli_One_Root\mobile_new

Project root (web + shared services): C:\Users\hamda\Desktop\Koli_One_Root

The mobile app is currently a thin, primitive shell that must become the best mobile experience among competitors (inspired by mobile.de  and other top automotive apps). The mobile app must use the same backend, database, users, listings, filters, search, and business rules as the web project. Your job: analyze, design, and produce an actionable, code-level plan and implementation guidance to transform the mobile app into a production‑grade, high‑conversion, secure, performant, and AI‑enabled native/hybrid mobile client.

Tone & mandate: Be brutally honest, technical, and pragmatic. Do not optimize for flattery. Prioritize engineering correctness, UX that converts, scalability, security, and measurable business outcomes. You have full freedom to propose architectural changes, new services, or migrations if they are justified.

Primary Objectives (what success looks like)
Feature parity with web: same search, filters, listing details, user accounts, quotas, and publish flow (7‑step wizard).

Superior mobile UX: fast discovery, clear CTAs, frictionless listing creation (image-first), and Stories integration.

AI-assisted flows: image-based brand/model suggestion, price estimation, AI description generator integrated into mobile flow.

Performance & reliability: FCP-like mobile metrics (cold start, list scroll, image load), offline resilience for listing drafts.

Security & compliance: GDPR, secure auth/session handling, safe image handling and consent for training.

Operational readiness: CI/CD, monitoring, crash reporting, feature flags, staged rollout.

Immediate Tasks (analyze now)
Static codebase analysis

Inspect mobile_new project structure, package.json / build files, native modules, and platform targets (React Native / Expo / Flutter / NativeScript / Ionic?). Report framework, versions, and major dependencies.

Identify usage of web-only APIs (localStorage, window, document) and any direct DOM assumptions.

API compatibility

Verify mobile client uses same API endpoints as web. List missing endpoints or mismatches (auth/session, listing create, image upload, vision analyze, pricing estimate).

Auth & session

Check current auth flow (Firebase Auth? token vs session cookie). If web uses session cookies, propose secure mobile strategy (refresh tokens + secure storage).

Media pipeline

Inspect image upload flow: client-side compression, thumbnails, resumable uploads, IndexedDB usage (web-only). Propose mobile equivalents (local file cache, temporary storage, background upload).

Listing wizard

Compare mobile wizard to web 7-step flow. Identify missing steps, validation, and draft persistence.

AI integration

Check if mobile calls /vision/analyze and /pricing/estimate. If not, add integration points and UX flows for confidence scores and manual override.

Performance hotspots

Identify heavy components (maps, car galleries, charts) and propose lazy-loading, virtualization, and native modules.

Offline & resilience

Check draft persistence strategy on mobile (SQLite, AsyncStorage, Realm). Propose robust offline-first approach with sync and conflict resolution.

Security review

Check storage of tokens, image encryption, transport TLS, and permissions. Flag any insecure patterns.

Analytics & monitoring

Verify integration with Sentry, RUM, Firebase Analytics/GA4, and custom events for story views, listing conversions, and AI acceptance.

Deliverables (what I expect you to produce)
For each deliverable, produce code examples, config snippets, and step‑by‑step migration tasks.

Audit Report (48 hours)

Framework & dependency list, compatibility issues, prioritized bug list, and quick wins (0–2 weeks).

Mobile Rework Plan (2 weeks)

Epic breakdown (sprints), task list with owners, time estimates, acceptance criteria, and risk mitigation.

Architecture Proposal

Mobile architecture diagram (offline sync, upload pipeline, AI calls), recommended libraries, native modules, and CI/CD changes.

Implementation Guide

Code snippets for: secure auth (refresh token flow), resumable uploads, image compression, vision API integration, price estimator UI, Stories component, and draft sync.

UX Flows & Mockups

Key screens: Home feed, Search & Filters, Listing Details, Listing Wizard (image-first), Vision Review screen (dropdowns + confidence), Price Suggestion screen, Stories composer/viewer, Profile & quotas.

Performance Plan

Metrics to track, instrumentation, lazy-loading strategy, image CDN usage, and memory/cpu budgets.

Security & Compliance Checklist

Token storage, consent flows, data deletion endpoints, logging, and penetration test plan.

Testing Matrix

Unit, integration, E2E (Detox/Appium), device matrix, and load testing for uploads and inference.

Rollout Plan

Canary release, feature flags, staged rollout percentages, rollback strategy, and monitoring dashboards.

POC Implementation

Implement a working POC for: image upload → /vision/analyze → prefilled dropdowns → user confirm → /pricing/estimate → suggested prices. Provide runnable code and test instructions.

Non‑functional requirements (strict)
Latency: Vision inference roundtrip ≤ 3s (target). Listing create API ≤ 500ms (excluding uploads).

Offline: Drafts must survive app kill and device reboot; sync when online.

Storage: Thumbnails generated client-side; full-res uploaded in background; limit per listing (e.g., 20 images).

Battery & Data: Use background upload with Wi‑Fi preference; warn user on mobile data.

Accessibility: WCAG-like accessibility for mobile (labels, contrast, large tap targets).

Localization: Bulgarian + English; currency BGN/EUR; date/time formats.

Quota enforcement: Enforce Free/Dealer/Company quotas client-side and server-side.

UX & Product Recommendations (competitive differentiation vs mobile.de)
Image-first listing composer: Start with camera/upload; immediate AI suggestions; show confidence and allow quick corrections.

Smart search with visual filters: Allow reverse-image search (user uploads image → find similar listings), saved searches, and location-aware results.

Stories & Highlights: Native Stories carousel with analytics and CTA to listing; company Highlights pinned.

Instant price guidance: Show 3 price bands with sample comparable ads and confidence; allow seller to accept or edit.

Trust signals: VIN check integration, verified dealer badges, seller response time, and escrow/inspection partners.

Progressive disclosure: Minimal hero UI for buyers; advanced filters hidden behind a single “Refine” control.

Personalized feed: ML-driven recommendations based on user behavior and saved searches.

Fast listing preview: Before publish, show how listing will appear on web and mobile with SEO/OG preview.

One-tap contact: WhatsApp integration and in-app messaging with templates and lead tracking.

Offline capture mode: Allow sellers to capture images and data offline and publish later.

Recommended Tech Stack & Libraries (practical)
Framework: React Native (preferred) or Flutter if already in use. If current project is React Native, keep it.

State: Redux Toolkit + RTK Query or React Query for server sync.

Storage: Realm or WatermelonDB for offline-first sync; fallback AsyncStorage for small drafts.

Image handling: react-native-image-crop-picker, libvips or sharp on server for heavy processing; client-side compression with react-native-image-resizer.

Uploads: tus protocol (resumable) or S3 multipart with presigned URLs; background uploads via react-native-background-upload.

Maps: Mapbox or native Google Maps with lazy load.

Auth: OAuth2 + refresh tokens; secure storage via react-native-keychain / EncryptedSharedPreferences.

Analytics & Monitoring: Sentry, Firebase Analytics (or Amplitude), and custom events to BigQuery.

CI/CD: GitHub Actions or GitLab CI; Fastlane for iOS/Android builds and deployment.

Feature flags: LaunchDarkly or Unleash (self-hosted).

Testing: Jest, React Native Testing Library, Detox for E2E.

Security & Privacy specifics
Token handling: Use short-lived access tokens + refresh tokens stored in secure storage; never store tokens in plain AsyncStorage.

Image privacy: Encrypt images at rest in cloud storage if required; store only public URLs for published images; keep private drafts in secure bucket with TTL.

Consent: Explicit opt‑in modal for using images in ML training; store consent record.

Data deletion: Implement user-initiated deletion endpoint that removes images and associated training flags.

CSP & network: Enforce TLS 1.2+, certificate pinning for critical endpoints (optional), and strict CORS on APIs.

Testing & QA plan
Unit tests: 80% coverage for critical modules (auth, upload, wizard).

Integration tests: API contract tests for /vision/analyze, /pricing/estimate, /listings/create.

E2E: Detox flows for listing creation, image upload, vision review, and publish.

Load tests: Simulate concurrent uploads and inference calls; ensure autoscaling triggers.

User testing: 20 power users (dealers + private sellers) for UX feedback and AI suggestion acceptance.

Timeline & Resource Estimate (example)
Week 0 (Audit): 3 dev-days (audit + quick wins list).

Sprint 1 (2 weeks): Core infra: auth refresh flow, resumable uploads, draft persistence. (2 devs)

Sprint 2 (2 weeks): Vision integration POC + UI for review dropdowns + price estimator POC. (2 devs + 1 ML engineer)

Sprint 3 (2 weeks): Listing wizard polish, Stories MVP, offline sync. (3 devs)

Sprint 4 (2 weeks): Performance tuning, analytics, QA, and staged rollout. (3 devs + QA)
Total: ~8–10 weeks for full mobile rework MVP with POC features. Adjust based on team size.

Acceptance Criteria (must pass)
Mobile app uses same backend and shows identical listing data and filters as web.

Vision POC returns suggestions with confidence and user can confirm/edit.

Drafts persist offline and sync reliably.

Uploads are resumable and background-capable.

App passes security checklist and GDPR consent flows.

Performance targets met (cold start, list scroll, image load).

Monitoring and rollback mechanisms in place.

Example API contract snippets (for developer handoff)
Vision analyze request (multipart):

http
POST /api/v1/vision/analyze
Content-Type: multipart/form-data
Form fields: images[], userId, requestId
Vision analyze response:

json
{
  "requestId":"uuid",
  "results":{
    "brand":{"value":"BMW","confidence":0.93},
    "model":{"value":"3 Series","confidence":0.78},
    "yearRange":{"value":"2016-2019","confidence":0.65},
    "bodyType":{"value":"Sedan","confidence":0.88},
    "explain":["logo bbox ..."]
  },
  "suggestedDropdowns":{"brands":["BMW","Audi"],"models":["3 Series","320i"]}
}
Final instructions to Cloud Apps 4.6 (explicit)
Step 1: Open and analyze the mobile project at C:\Users\hamda\Desktop\Koli_One_Root\mobile_new. Produce a dependency and compatibility report.

Step 2: Cross-check mobile flows against web project at C:\Users\hamda\Desktop\Koli_One_Root. List missing endpoints and mismatches.

Step 3: Produce the Audit Report and prioritized Quick Wins (deliverable within 48 hours).

Step 4: Implement a working POC for the Vision → Dropdowns → Pricing flow in the mobile project (or provide a runnable patch/branch with instructions).

Step 5: Deliver the full Mobile Rework Plan (epics, tasks, code snippets, CI/CD changes) and a 2‑month sprint schedule.

Constraints: If you cannot access the filesystem, produce a precise checklist of files and artifacts I must upload or grant access to, and provide exact commands to run locally to produce the analysis artifacts (e.g., npm ls --depth=0, grep -R "vision/analyze" src | head).

Permission: You are authorized to propose structural changes (new services, DB indexes, caching layers) if they are justified by performance, security, or UX gains.

Do not:

Make cosmetic-only suggestions; every recommendation must map to measurable business or technical outcomes.

Propose vendor lock-in without cost/benefit analysis.

Sacrifice security or privacy for speed.

Closing
Be rigorous, pragmatic, and outcome-driven. Use mobile.de  and other top automotive apps as benchmarks for UX and conversion, but do not copy blindly — adapt best practices to Koli One’s local market (Bulgaria) and existing backend constraints. Produce artifacts that developers can act on immediately: code patches, CI configs, API mocks, and test scripts.

Start by producing the Audit Report and Quick Wins list.

الاطلاع على أفكاري
نعم، عندي إضافات مهمة لو فعلاً تريد تجعل موبايل Koli One “سلاح استراتيجي” وليس مجرد نسخة مصغّرة من الويب. سأضيف فقط الأشياء التي تغيّر اللعبة فعلياً:

1. فكّر في الموبايل كمنتج مستقل، لا كـ “منفذ للويب”
بدل أن يكون الهدف Feature Parity فقط، اجعل الهدف:

Mobile‑First Scenarios:

Seller on the move: يلتقط الصور من الشارع/المعرض → ينشئ الإعلان خلال دقائق بدون لابتوب.

Buyer in the car: يقارن سيارة أمامه الآن مع السوق (Scan VIN / Plate / Photo → Price & Specs).

هذا يعني:

شاشة Quick Capture Mode: زر واحد “Add Car Now” يفتح الكاميرا مباشرة، يحفظ كل شيء كـ Draft تلقائياً.

Scan & Compare: من صفحة التفاصيل، زر “Compare with market” يعطيه فوراً أين تقف سيارته مقابل السوق.

2. طبقة “ذكاء المنتج” فوق الذكاء الاصطناعي
ليس كافياً أن يكون عندك Vision + Pricing + Wizard. أضف:

Behavioral Intelligence:

إذا المستخدم دائماً يتجاهل اقتراحات السعر → خفّف الإلحاح، واعرضها كـ “Insights” فقط.

إذا Dealer ينشر كثيراً من نفس النوع → اقترح له Templates جاهزة (Pre‑filled forms).

Lifecycle Intelligence:

بعد 7 أيام من عدم وجود تفاعل على إعلان → Push Notification:

“Your BMW 320d has 40% fewer views than similar cars. Try adjusting price by −5% or update photos.”

3. المنافسة مع mobile.de: أين يمكن أن تتفوّق فعلاً؟
بدل أن “نقلّد” mobile.de، ركّز على نقاط لا يستطيع هو لعبها بسهولة في بلغاريا:

Local Depth vs Global Breadth:

تكامل عميق مع السوق البلغاري: لغات، عملة، ضرائب، عادات التسعير، مدن، طرق الدفع.

Local Insights: “In Sofia, diesel sedans 2015–2018 sell 20% faster than petrol.”

Human + AI Hybrid:

زر “Ask Expert” داخل التطبيق (مدفوع لاحقاً): يرسل الإعلان لمسؤول بشري يراجع السعر/الصور ويعطي Feedback.

Trust Layer:

مؤشرات ثقة: “Seller response time”, “Listing quality score”, “Photo quality score”, “Price fairness score”.

4. نموذج العمل داخل التطبيق (Monetization داخل UX)
لا تجعل الموبايل فقط قناة عرض، بل قناة دخل:

Company / Dealer Upsell داخل الموبايل:

Boost Story (Top of feed for 24h).

Highlight Listing (Badge + Priority in search).

Auto‑Renew for dealers (Subscription).

AI as Paid Add‑On:

Free: 1 AI description/day + basic price suggestion.

Dealer/Company: Unlimited AI descriptions + advanced pricing + “Market Heatmap”.

5. طبقة القياس: كيف نعرف أن التطبيق “أفضل من المنافسين”؟
أضف في البرومبت طلب صريح من النموذج أن:

يعرّف KPIs خاصة بالموبايل:

Time to First Listing (من أول فتح للتطبيق إلى أول إعلان منشور).

Listing Completion Rate (كم % يكملون الـ Wizard على الموبايل).

AI Suggestion Acceptance Rate (للـ Vision وللسعر).

Story View → Contact Conversion.

ويقترح تجارب A/B:

ترتيب الحقول في الـ Wizard.

شكل شاشة السعر (Slider vs Suggested Buttons).

مكان زر “Contact Seller”.

6. قرار معماري عميق: Offline‑First بجد، أم مجرد Draft؟
اقترح عليه بوضوح:

إمّا:

Offline‑First حقيقي: استخدام قاعدة بيانات محلية (Realm/SQLite) مع Sync Engine، بحيث:

يمكن للبائع أن ينشئ إعلانات كاملة بدون إنترنت، ثم تُرفع لاحقاً.

أو:

Online‑First + Drafts بسيطة: AsyncStorage فقط، بدون تعقيد كبير.

واطلب منه أن يختار واحداً بوضوح، ويبرّر القرار بناءً على:

نوع المستخدمين (Dealers في المعارض vs أفراد في البيت).

بيئة الإنترنت في بلغاريا.

تعقيد الكود مقابل العائد.

7. “صوت علاء” داخل البرومبت
أنت قلت له: “لا تجاملني”. أضف له جملة صريحة:
claude opus 4.6 الان انا اخاطبك :
انت اكيد ليك نظرة و اقرب للمشروع لانك تفهمه جيدا لذلك كل اقتراحاتك مقبوله فبما يخص التنفيذ لهذه الاقتراحات اعلاه , المطلوب هو تطبيق جيد كل الازرار تعمل الفلاتر كلها نفسها تستوحى و تربط بمشروع الويب الاصلي الحالي كل المستخدمين و كل الاعلانات هي نفسها يعني التطبيق هو منفذ يجلب لنا كل بيانات المشروع الويب الاصلي لذلك نفذ بهناية كل شيء و اكمله على افضل وجه 
“If you detect that the current mobile architecture or tech stack is fundamentally limiting (e.g., wrong framework, wrong navigation, or unmaintainable structure), you are explicitly allowed to recommend a partial or full rewrite with a clear cost/benefit analysis. Do not protect sunk cost.”