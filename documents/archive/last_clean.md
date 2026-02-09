نظرة عامة سريعة
أدناه مجموعة أوامر وإجراءات ذكية ومتكاملة لتنظيف المشروع بالكامل (إزالة "مواد البناء" المتبقية: ملفات احتياطية، أكواد ميتة، مفاتيح مسربة، TODOs، إعدادات تجريبية) وتجهيزه للإنتاج. كل خطوة قابلة للتنفيذ محليًا أو عبر CI، وتمنح النموذج المحلي حرية تنفيذ التعديلات عبر كل المجلدات والملفات مع ضمان قابلية التراجع والمراجعة.

1. إجراءات تحضيرية آمنة (لا تبدأ قبل تنفيذها)
افتح فرع عمل جديد مخصص للتنظيف:

bash
git checkout -b chore/cleanup-project
قفل النشر التلقائي على بيئة الإنتاج مؤقتًا (تعطيل pipeline أو وضع feature-flag).

نسخة احتياطية كاملة من المستودع والبيانات:

احفظ نسخة من الـ repo: git bundle create repo.bundle --all

صدّر قواعد Firestore/RTDB/Storage إلى bucket مؤمن.

سجل التغييرات: افتح/حدّث CHANGELOG.md وCLEANUP_PLAN.md في جذر المشروع.

2. تنظيف الشيفرة والمجلدات (أوامر قابلة للتشغيل)
هدف: إزالة ملفات احتياطية، أكواد ميتة، نقل/حذف مفاتيح، ترتيب التبعيات، توحيد بنية المجلدات.

إزالة الملفات المؤقتة والنسخ الاحتياطية:

bash
# حذف ملفات backup و .ts.backup و *.bak و *~ 
git ls-files -z | xargs -0 -n1 bash -c '[[ "$1" =~ \.ts\.backup$|\.bak$|~$ ]] && git rm --cached -f "$1" || true' _
git commit -m "chore: remove backup/temp files"
إزالة المفاتيح من التاريخ (إن وُجدت):

bash
# افحص وجود مفاتيح في التاريخ
git grep -n --cached "API_KEY\|SECRET\|PRIVATE_KEY" || true
# إذا وُجدت مفاتيح في التاريخ استخدم bfg أو git-filter-repo (تنفيذ خارجي موثوق)
# مثال: استخدام bfg (نفّذ محليًا بعد تثبيت bfg)
bfg --delete-files functions/.env
git reflog expire --expire=now --all && git gc --prune=now --aggressive
نقل المفاتيح إلى Secret Manager (مثال GCP):

bash
# لا تنفّذ هذا مباشرة إن لم تكن لديك صلاحيات؛ استخدم واجهة GCP أو سكربت آمن
gcloud secrets create GEMINI_KEY --data-file=<(echo "REDACTED")
gcloud secrets versions add GEMINI_KEY --data-file=<(echo "REDACTED")
تنظيف التبعيات (نقل @types إلى devDependencies، إزالة firebase-admin من الويب):

bash
# مثال: تعديل package.json آليًا عبر jq (تأكد من تثبيت jq)
jq '(.dependencies // {}) as $d | (.devDependencies // {}) as $dev | 
    ($d | keys[] | select(startswith("@types/")) ) as $t |
    .devDependencies[$t] = $d[$t] | del(.dependencies[$t])' package.json > package.tmp.json && mv package.tmp.json package.json
npm prune
npm install
git add package.json package-lock.json
git commit -m "chore: move @types to devDependencies and prune deps"
حذف الكود الميت وملفات غير مستخدمة (أدوات مساعدة):

شغّل أدوات static analysis: eslint --ext .ts,.tsx src --fix وts-prune أو depcheck.

bash
npx depcheck || true
npx ts-prune --project tsconfig.json > ts-prune-report.txt
# راجع التقرير ثم احذف الملفات أو الرموز غير المستخدمة بعناية
تنظيم المجلدات: نقل .ts.backup إلى archive/ أو حذفها بعد التحقق:

bash
mkdir -p archive/backups
git ls-files '*.ts.backup' | xargs -I{} git mv {} archive/backups/
git commit -m "chore: move .ts.backup files to archive/backups"
3. تنظيف المحتوى والوثائق (التوثيق النهائي)
إزالة أو تحديث TODOs: اجمع كل TODOs، صنفها، ثم إما حلها أو تحويلها إلى issues.

bash
# استخراج TODOs
git grep -n "TODO" > TODO_LIST.txt
# أنشئ issues آليًا أو يدوياً بناءً على TODO_LIST.txt
إنشاء ملفات توثيق نهائية:

README.PRODUCTION.md يشرح بنية المشروع، خطوات النشر، متطلبات البنية التحتية، وبيانات الاتصال.

OPERATIONAL_RUNBOOK.md لعمليات التشغيل، مراقبة، rollback، واستجابة للحوادث.

ARCHITECTURE.md محدثة مع خرائط الروابط (all_links.md) وروابط الخدمات.

توليد changelog تلقائي:

bash
# استخدم conventional-changelog أو auto-changelog
npx auto-changelog -p
git add CHANGELOG.md
git commit -m "chore: update changelog after cleanup"
4. جودة الكود والاختبارات (إجبارية قبل الدمج)
تشغيل TypeScript strict check:

bash
npm run type-check
تشغيل ESLint + Prettier:

bash
npm run lint
npm run format
تشغيل الاختبارات:

bash
npm run test:unit
npm run test:integration
npm run test:e2e
إضافة قواعد CI: اجعل CI يفشل إن لم تمر: type-check, lint, test, build.

Visual regression: أضف Percy/Chromatic snapshots للواجهات الحرجة.

5. أمن وتشغيل (حماية نهائية)
فحص الأمان:

شغّل npm audit وsnyk test أو dependabot لتحديث الحزم الضعيفة.

bash
npm audit fix --force || true
# أو استخدم Snyk
snyk test
قواعد الوصول:

راجع IAM في GCP/AWS، حدّ من صلاحيات الحسابات، فعّل MFA لكل الحسابات.

قواعد Firebase:

راجع firestore.rules, database.rules.json, storage.rules وتأكد من عدم وجود allow if true.

مراجعة Git history: تأكد من إزالة أي أسرار من التاريخ قبل الدمج.

6. إجراءات PR، المراجعة، والنشر (قابلة للتنفيذ آليًا)
قالب PR (انسخ‑ألصق في وصف PR):

كتابة تعليمات برمجية
Title: chore(cleanup): project-wide cleanup and production hardening

Summary:
- Removed backup/temp files and moved legacy backups to archive/
- Purged secrets from repo and moved to Secret Manager
- Pruned dependencies and moved @types to devDependencies
- Added CI gates: type-check, lint, unit/integration/e2e tests
- Updated documentation: README.PRODUCTION.md, OPERATIONAL_RUNBOOK.md, ARCHITECTURE.md
- Added visual regression snapshots for critical pages

Verification steps:
1. Run `npm ci` then `npm run type-check` (must pass)
2. Run `npm run lint` and `npm run test:unit` (must pass)
3. Build and run staging: `npm run build && npm run start:staging`
4. Manual smoke test: open /sell, /cars/:id, /checkout/:carId
5. Confirm secrets are not present: `git grep -n "REDACTED|GEMINI_KEY|STRIPE_SECRET"`

Rollback:
- Revert PR branch or use `git revert <merge-commit>`
- Feature flag to disable new behaviors if needed

Reviewers required: 2 (one must be security engineer)
قائمة تحقق دمج نهائية:

[ ] CI green

[ ] 2 reviewers approved

[ ] No secrets in repo

[ ] Docs updated

[ ] Backups stored

[ ] Rollback plan documented

نشر تدريجي:

استخدم canary rollout: 5% → 25% → 100% مع مراقبة Sentry وRUM.

أوامر نشر (مثال Firebase Hosting):

bash
firebase deploy --only hosting --project staging
# بعد مراقبة:
firebase deploy --only hosting --project production
ملاحظات تشغيلية ونهائية (حرية التنفيذ للنموذج المحلي)
أعطِ النموذج المحلي حرية تنفيذ التعديلات داخل الفرع chore/cleanup-project لكن اجعل كل تغيير قابلًا للمراجعة عبر PR.

اطلب من النموذج إنشاء ملفات verify/cleanup/*.md لكل مجموعة تغييرات (secrets, deps, backups, docs) تتضمن أوامر التحقق ونتائج الفحص.

نفّذ تنظيفًا دوريًا: مهام cron أو GitHub Actions لتنظيف الملفات المؤقتة القديمة وأرشفة الـ backups كل 30 يومًا.

أضف خيارًا في إعدادات المشروع: "Auto-clean orphan uploads after X days" مع Cloud Function تقوم بالحذف الآمن.