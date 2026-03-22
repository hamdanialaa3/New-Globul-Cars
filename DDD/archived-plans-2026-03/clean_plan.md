Plan: Koli One — Full Project Cleanup & Debris Removal
TL;DR: المشروع هيكلياً سليم لكنه يحتوي على بقايا بناء: تكرارات في الملفات، أكواد منتهية الصلاحية لا تزال في src، مستندات تخطيط قديمة، وملفات إعداد من أدوات بناء سابقة. الخطة تزيل كل الأنقاض في 7 مراحل — من التكرارات الحرجة إلى اللمسات النهائية — مع احترام قاعدة CONSTITUTION.md: لا حذف أبداً، النقل إلى DDD فقط.

Phase 1: Critical Duplicates & Conflicts (BLOCKING)
تكرارات تسبب ارتباكاً حقيقياً أو أخطاء نشر. يجب أن تُنفذ أولاً.

Step	Action	Files
1.1	Move stale Firestore indexes to DDD/ — root copy is the deployed/authoritative one	firestore.indexes.json
1.2	Move entire duplicate functions directory to DDD/ — exact duplicate of src	firebase/functions/**
1.3	Move deprecated firestore rules to DDD/ — header says "Do NOT deploy from this file"; authoritative source is root firestore.rules	firestore.rules
Phase 2: Deprecated Source Code Still in src (HIGH)
ملفات مُعلّمة @deprecated ولها بدائل جاهزة. تُنقل فقط بعد التأكد من عدم وجود imports نشطة.

Step	Action	Files
2.1	Consolidate SEO: 3 deprecated files → canonical seo folder. Verify zero active imports then move old files to DDD/	seo.ts, seo.tsx, schema-generator.ts
2.2	Remove deprecated configs after verifying zero imports	billing-config.ts, stripe-extension.config.ts
2.3	Remove deprecated CAR_BRANDS export (keep other active exports in file if any)	dropdown-options.ts
2.4	Delete commented-out dead routes entirely (FullThemeDemo, DigitalTwinPage, IoTDashboardPage)	MainRoutes.tsx
2.5	Audit workflow-service.ts (16+ deprecated methods) — if purely a redirect facade with zero direct usage, move to DDD/	workflow-service.ts
2.6	Consolidate 3 performance files — merge performance-monitor.ts (types only) into performance-monitoring.ts if appropriate	performance.ts, performance-monitoring.ts, performance-monitor.ts
2.7	Audit deprecated types — move firestore-models.ts to DDD/ if replaced by bulgarian-user.types.ts	firestore-models.ts
Phase 3: Legacy Build Tool Artifacts (MEDIUM)
بقايا من عملية الترحيل CRA → Vite.

Step	Action	Files
3.1	Check if any npm script or CI still invokes Jest. If not, move to DDD/	jest.config.js
3.2	If Step 3.1 removes Jest, also move babel.config.js (dependent on 3.1)	babel.config.js
Phase 4: Stale Documentation & Planning Debris (MEDIUM)
مستندات قديمة تُضلل المطورين.

Step	Action	Files
4.1	Update QUICK_START.md — references old web/ folder that doesn't exist	QUICK_START.md
4.2	Move outdated project_structure.txt to DDD/ (or regenerate)	project_structure.txt
4.3	Consolidate 7 mobile planning docs → 1 master plan, move originals to DDD/	Mobile_APP_Plans/plan_phone_APP*.md (7 files)
4.4	Move completed mobile audit artifacts to DDD/	audit_plan.json, completion reports (P1_TASK_0*_COMPLETE.md)
4.5	Move misplaced LOGO.png to images	Read_me_important_no_delete/LOGO.png
Phase 5: Schema & Config Hygiene (MEDIUM)
إزالة مخططات قديمة وتوحيد مواقع الإعداد.

Step	Action	Files
5.1	Move 3 unversioned legacy schemas to DDD/ — superseded by .v1.json versions	Listing.json, User.json, Story.json
5.2	Move ESLint config from configs to root (standard convention)	.eslintrc.json → .eslintrc.json
5.3	Verify .env is gitignored (may contain sensitive keys)	.gitignore, .env
Phase 6: Type Definition Deduplication (MEDIUM)
ثلاثة مواقع لتعريفات الأنواع المشتركة.

Step	Action	Files
6.1	Map type overlap across 3 locations. Ensure src imports from shared where canonical types exist, not local duplicates	types, types, types
6.2	Verify scripts/sync-shared.js runs correctly and keeps mobile_new in sync	scripts/sync-shared.js
Phase 7: Code Quality Polish (LOW)
ليست عاجلة لكنها تُحسّن الصيانة.

Step	Action	Files
7.1	Resolve ProfilePage routing ambiguity — verify which location is actually routed, move unused to DDD/	ProfilePage.tsx, profile, 05_profile
7.2	Generate TODO/FIXME inventory (50+ items) — categorize: implement / remove / convert to GitHub Issue	Across entire src and functions
7.3	Review 2 HACK comments — fix or document as known limitations	GodModeRevenueGrid.tsx, security-monitor.ts
7.4	Archive old DDD/ cleanup folders (pre-March 2026) into DDD/archive-pre-march-2026/ to reduce noise	dedup-cleanup-2026-02-15, root-cleanup-2026-02-15, etc.
Verification
After Phase 1: firebase deploy --only firestore:indexes --dry-run — correct indexes deployed
After Phase 2: npm run build + npm run type-check — zero errors, no broken imports
After Phase 2: grep -r "from.*seo\b" src/ — confirm no stale SEO imports
After Phase 3: npm test — all tests pass under Vitest
After Phase 5: npx eslint . — ESLint loads from new root location
After Phase 6: npm run type-check + cd mobile_new && npx tsc --noEmit
Final gate: npm run type-check && npm test && npm run build — full green
Decisions
All moves follow CONSTITUTION.md: files go to DDD/post-cleanup-2026-03-18/ with clear suffixes, never deleted
build already gitignored — confirmed, no action needed
src console.log is acceptable (server-side, not under src ban)
DDD/ is gitignored — all moves are for local dev clarity
Further Considerations
npm scripts audit — 170 scripts in package.json, many possibly unused. Recommend: separate task after this cleanup
Unused car logos — 200+ brand logos in public — requires cross-referencing with code. Recommend: defer
functions/ TODOs — payment-reconciliation.ts and b2b-exports.ts have placeholder implementations. Recommend: convert to GitHub Issues, not part of cleanup