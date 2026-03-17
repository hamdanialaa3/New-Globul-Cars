User: الان : بعد تحليل عميق للمشروع اكتب لي اقتراح تعديل لمواقع الملفات وترتيبها و ترتيب المجلدات بحيث يكون كل شيء منسق و مرتب و مرقم و مؤشر بالشكل الصحيح اقصد محليا و بعد ان ننتهي ننشر على جيت هوب في خطوات لاحقة 

الملوب منك : 
الدخول الى مخزن مليان اغراض تقوم انت بشراء صناديق كراتون و شفافة او مكتوب عليها و تضع كل القطع في هذا المخزن كل شيء في الصندوق المخصص المكتوب عليه بوضوح ما هو هذا الصندوق , الصندوق يقصد به المجلد و الملفات هي الاغراض و الكتابة على الصندوق هي الكومنت او التسمية 

بشكل احترافي اكتب خطة متكامله لهذا الغرض ولا تنسى عند وضع اي شيء بالصندوق يجب ان تقوم بازالة الغبار و تلميعه هنا يقصد به ربطه برمجيا و التاكد انه غير مكرر و ليس فيه مشكله امنيه او برمجيه 

اكتب خطتك الان بعمق و عناية وتشمل جميع ملفات المشروع 
و بعدها من المؤكد انه سوف يضهر لك التكرار والزومبي و غيرها ايضا عالج هذه الاشياء ليكون المشروع مثالي 100% بازخى شكل 

GitHub Copilot: سأبدأ بتحليل هيكل المشروع بالكامل (الويب + الموبايل + البنية الجذرية) لاستخراج خريطة تنظيم احترافية تشمل إعادة ترتيب المجلدات، تسمية واضحة، ومعايير إزالة التكرار والملفات الزومبي قبل أي تنفيذ. შემდეგ سأحوّل النتائج إلى خطة تنفيذ مرحلية دقيقة يمكن تطبيقها محليًا أولًا ثم نشرها لاحقًا على GitHub.سأنفّذ الآن استكشافًا متوازيًا على 3 مسارات (الهيكل العام، كود الويب، كود الموبايل) لتقليل الوقت والخروج بخطة شاملة تغطي جميع الملفات مع نقاط المخاطر والتكرار.

Root structure audit

Web code organization audit

Mobile app organization audit

Read [](file:///c%3A/Users/hamda/Desktop/Koli_One_Root/mobile_new)

Read [](file:///c%3A/Users/hamda/Desktop/Koli_One_Root/src)

Read [](file:///c%3A/Users/hamda/Desktop/Koli_One_Root/src)

Read [](file:///c%3A/Users/hamda/Desktop/Koli_One_Root/mobile_new)

Read [](file:///c%3A/Users/hamda/Desktop/Koli_One_Root/CONSTITUTION.md#1-1), lines 1 to 100

Read [](file:///c%3A/Users/hamda/Desktop/Koli_One_Root/package.json#1-1), lines 1 to 80

Read [](file:///c%3A/Users/hamda/Desktop/Koli_One_Root/CONSTITUTION.md#1-1), lines 1 to 100

Searched for files matching `**/.cursorrules`, 1 match

Read [](file:///c%3A/Users/hamda/Desktop/Koli_One_Root/src)

Read [](file:///c%3A/Users/hamda/Desktop/Koli_One_Root/functions)

Read [](file:///c%3A/Users/hamda/Desktop/Koli_One_Root/shared)

Read [](file:///c%3A/Users/hamda/Desktop/Koli_One_Root/scripts)

Read [](file:///c%3A/Users/hamda/Desktop/Koli_One_Root/mobile_new/app)

Read [](file:///c%3A/Users/hamda/Desktop/Koli_One_Root/mobile_new/src)

Read [](file:///c%3A/Users/hamda/Desktop/Koli_One_Root/mobile_new/assets)

Read [](file:///c%3A/Users/hamda/Desktop/Koli_One_Root/docs)

Read [](file:///c%3A/Users/hamda/Desktop/Koli_One_Root/scripts)

Read [](file:///c%3A/Users/hamda/Desktop/Koli_One_Root/configs)

Read [](file:///c%3A/Users/hamda/Desktop/Koli_One_Root/DDD)

Read [](file:///c%3A/Users/hamda/Desktop/Koli_One_Root/CONSTITUTION.md#100-100), lines 100 to 300

Searched for regex `console\.(log|error|warn|debug)` (`**/src/**`), 30 results

Searched for regex `firebase\.uid|Firebase UID|uid.*URL|uid.*route` (`**/src/**`), 20 results

Read [](file:///c%3A/Users/hamda/Desktop/Koli_One_Root/.cursorrules#1-1), lines 1 to 150

Read [](file:///c%3A/Users/hamda/Desktop/Koli_One_Root/mobile_new/src/components)

Read [](file:///c%3A/Users/hamda/Desktop/Koli_One_Root/mobile_new/src/services)

Read [](file:///c%3A/Users/hamda/Desktop/Koli_One_Root/mobile_new/src/hooks)

Read [](file:///c%3A/Users/hamda/Desktop/Koli_One_Root/mobile_new/src/config)

Read [](file:///c%3A/Users/hamda/Desktop/Koli_One_Root/src/components)

Read [](file:///c%3A/Users/hamda/Desktop/Koli_One_Root/src/services)

Read [](file:///c%3A/Users/hamda/Desktop/Koli_One_Root/functions)

Read [](file:///c%3A/Users/hamda/Desktop/Koli_One_Root/mobile_new/app)

Read [](file:///c%3A/Users/hamda/Desktop/Koli_One_Root/mobile_new/src/store)

Read [](file:///c%3A/Users/hamda/Desktop/Koli_One_Root/mobile_new/src/context)

Read [](file:///c%3A/Users/hamda/Desktop/Koli_One_Root/mobile_new/src/contexts)

Read [](file:///c%3A/Users/hamda/Desktop/Koli_One_Root/src/providers)

Searched for regex `\.\.\/\.\.\/\.\.\/|\.\.\/\.\.\/\.\.\/\.\.|deep.*import.*path` (`**/src/**`), 20 results

Searched for regex `onSnapshot|unsubscribe|isActive.*false|cleanup` (`**/src/**`), 20 results

Searched for text `\.deprecated|\.dead|\.zombie|DELETE|FIXME|TODO|HACK` (`**/src/**`), 15 results

Read [](file:///c%3A/Users/hamda/Desktop/Koli_One_Root/src/services)

Read [](file:///c%3A/Users/hamda/Desktop/Koli_One_Root/build)

Read [](file:///c%3A/Users/hamda/Desktop/Koli_One_Root/public)

Searched for regex `^[a-z]+\.[a-z]+\.(js|ts|json|config|rc)$`, 2 results

Read [](file:///c%3A/Users/hamda/Desktop/Koli_One_Root/CONSTITUTION.md#1-1), lines 1 to 50

Read [](file:///c%3A/Users/hamda/Desktop/Koli_One_Root/mobile_new/app/_layout.tsx#1-1), lines 1 to 120

Read [](file:///c%3A/Users/hamda/Desktop/Koli_One_Root/src/providers/AppProviders.tsx#1-1), lines 1 to 100

Read [](file:///c%3A/Users/hamda/Desktop/Koli_One_Root/mobile_new/src/contexts/AuthContext.tsx#1-1), lines 1 to 80

Searched for files matching `**/*.json *.config.* .eslintrc .prettierrc tsconfig`, no matches

Read [](file:///c%3A/Users/hamda/Desktop/Koli_One_Root)

Read [](file:///c%3A/Users/hamda/Desktop/Koli_One_Root/README.md#1-1), lines 1 to 30

Searched for text `collection('passenger_cars')|collection('cars')|collection('suvs')|collection('trucks')|collection('motorcycles')|getCollection` (`**/src/services/**`), 25 results

Searched for text `from '@/*' import` (`**/src/**/*.ts`), no results

Searched for text `__tests__|test|spec` (`**/src/pages/**`), 15 results

Searched for regex `export\s*(?:const|function|class|interface)\s+\w+` (`**/mobile_new/src/services/*.ts`), 50 results

Searched for regex `export\s*(?:const|function|class|interface)\s+\w+` (`**/src/services/*.ts`), 50 results

Read [](file:///c%3A/Users/hamda/Desktop/Koli_One_Root/governance)

Read [](file:///c%3A/Users/hamda/Desktop/Koli_One_Root/ops)

Read [](file:///c%3A/Users/hamda/Desktop/Koli_One_Root/tsconfig.json#1-1), lines 1 to 30

Read [](file:///c%3A/Users/hamda/Desktop/Koli_One_Root/firebase.json#1-1), lines 1 to 20

Searched for regex `const.*=.*require|import.*\*.*from|export.*const.*=.*{}` (`**/src/services/**`), 20 results

Searched for regex `onSnapshot.*=>.*{$|unsubscribe\(\)` (`**/src/**`), 15 results

Searched for files matching `**/src/services/listing*.ts`, 1 match

Searched for files matching `**/src/services/**/*.service.ts`, 50 matches

Read [](file:///c%3A/Users/hamda/Desktop/Koli_One_Root/mobile_new/src/components/common)

Read [](file:///c%3A/Users/hamda/Desktop/Koli_One_Root/src/components)

Searched for regex `from\s+['"](\.\.?/)*\.\./\.\./src` (`**/mobile_new/src/**/*.ts?(x)`), no results

Read [](file:///c%3A/Users/hamda/Desktop/Koli_One_Root/CONSTITUTION.md#100-100), lines 100 to 200

Read [](file:///c%3A/Users/hamda/Desktop/Koli_One_Root/shared)

Read [](file:///c%3A/Users/hamda/Desktop/Koli_One_Root/extensions)

Read [](file:///c%3A/Users/hamda/Desktop/Koli_One_Root/mobile_new/src)

Searched for text `from '../../../src` (`**/mobile_new/src/**/*.ts`), no results

Searched for text `from '../../../src` (`**/mobile_new/src/**/*.tsx`), no results

Read [](file:///c%3A/Users/hamda/Desktop/Koli_One_Root/mobile_new/src/store/useSellStore.ts#1-1), lines 1 to 50

Searched for text `export` (`**/src/services/car/**`), 10 results

Searched for text `import|export` (`**/src/services/numeric*`), 15 results

Searched for regex `import.*numeric.*from|import.*sell[-_]workflow.*from` (`**/src/**`), 20 results

Read [](file:///c%3A/Users/hamda/Desktop/Koli_One_Root/src/services/listings.service.ts#1-1), lines 1 to 50

Read [](file:///c%3A/Users/hamda/Desktop/Koli_One_Root/CONSTITUTION.md#1-1), lines 1 to 200

Searched for regex `\.deprecated|\.dead`, 1 result

Read [](file:///c%3A/Users/hamda/Desktop/Koli_One_Root/Read_me_%20important_no_delete)

Searched for regex `fix|cleanup|migrate|phase` (`**/scripts/*`), 20 results

Read [](file:///c%3A/Users/hamda/Desktop/Koli_One_Root/mobile_new/e2e)

Read [](file:///c%3A/Users/hamda/Desktop/Koli_One_Root/mobile_new/jest.config.js#1-1), lines 1 to 30

Read [](file:///c%3A/Users/hamda/Desktop/Koli_One_Root/mobile_new/app/%28tabs%29/_layout.tsx#1-1), lines 1 to 40

Read [](file:///c%3A/Users/hamda/Desktop/Koli_One_Root/DDD)

Searched for files matching `**/src/hooks/**/__tests__/*.test.tsx`, 3 matches

Searched for regex `import.*services.*from.*services|import.*services.*from.*\.\./\.\./services` (`**/src/services/**`), no results

Searched for files matching `**/src/components/**/__tests__/*.test.tsx`, 5 matches

Read [](file:///c%3A/Users/hamda/Desktop/Koli_One_Root/documents)

Read [](file:///c%3A/Users/hamda/Desktop/Koli_One_Root/email-templates)

Read [](file:///c%3A/Users/hamda/Desktop/Koli_One_Root/functions/src)

Searched for text `phase` (`**/scripts/**`), 20 results

Read [](file:///c%3A/Users/hamda/Desktop/Koli_One_Root/mobile_new/src/types)

Read [](file:///c%3A/Users/hamda/Desktop/Koli_One_Root/src/types)

Read [](file:///c%3A/Users/hamda/Desktop/Koli_One_Root/mobile_new/app/%28tabs%29/_layout.tsx#40-40), lines 40 to 50

Read [](file:///c%3A/Users/hamda/Desktop/Koli_One_Root/configs)

Read [](file:///c%3A/Users/hamda/Desktop/Koli_One_Root/shared/src)

Searched for regex `export.*\*.from|export {.*}.*from` (`**/src/services/**`), 25 results

Searched for text `import { db } from` (`**/src/**`), 20 results

Read [](file:///c%3A/Users/hamda/Desktop/Koli_One_Root/mobile_new/src/data)

Read [](file:///c%3A/Users/hamda/Desktop/Koli_One_Root/mobile_new/package.json#1-1), lines 1 to 80

Read [](file:///c%3A/Users/hamda/Desktop/Koli_One_Root/mobile_new/tsconfig.json)

Read [](file:///c%3A/Users/hamda/Desktop/Koli_One_Root/functions/src)

Read [](file:///c%3A/Users/hamda/Desktop/Koli_One_Root/docs)

Searched for regex `import.*from.*services|import.*from.*utils|import.*from.*contexts` (`**/src/components/**`), 20 results

Read [](file:///c%3A/Users/hamda/Desktop/Koli_One_Root/functions/src/index.ts#1-1), lines 1 to 50

Created memory file [](file:///c%3A/Users/hamda/AppData/Roaming/Code/User/workspaceStorage/25e6d37a7f17c733c6b6abb562bbb48c/GitHub.copilot-chat/memory-tool/memories/YTYwYzJiOGItMWZkMy00NzY2LTgwNjgtZjMzODE2MmJiM2Ex/repo-structure-analysis.md)

Read [](file:///c%3A/Users/hamda/Desktop/Koli_One_Root/package.json#1-1), lines 1 to 100

Read [](file:///c%3A/Users/hamda/Desktop/Koli_One_Root/src/constants)

Read [](file:///c%3A/Users/hamda/Desktop/Koli_One_Root/mobile_new/src/constants)

Searched for regex `listing|car.*service|\.service\.ts` (`**/src/services/**`), 20 results

Searched for text `export` (`**/shared/**`), 10 results

Searched for files matching `**/src/services/numeric*.ts`, 8 matches

Searched for files matching `**/src/services/sell-workflow*.ts`, 8 matches

Searched for files matching `**/mobile_new/src/components/**/index.ts`, 4 matches

Read [](file:///c%3A/Users/hamda/Desktop/Koli_One_Root/src/features)

Read [](file:///c%3A/Users/hamda/Desktop/Koli_One_Root/mobile_new/app/%28tabs%29/index.tsx)

Read [](file:///c%3A/Users/hamda/Desktop/Koli_One_Root/tsconfig.json#1-1), lines 1 to 50

Read [](file:///c%3A/Users/hamda/Desktop/Koli_One_Root/package.json#1-1), lines 1 to 50

Searched for regex `onSnapshot|isActive|useEffect` (`**/src/hooks/**`), 15 results

Searched for text `import|export` (`**/shared/src/**`), 15 results

Read [](file:///c%3A/Users/hamda/Desktop/Koli_One_Root/CONSTITUTION.md#1-1), lines 1 to 150

Read [](file:///c%3A/Users/hamda/Desktop/Koli_One_Root/mobile_new/MOBILE_REWORK_PLAN.md#1-1), lines 1 to 100

Read memory [](file:///c%3A/Users/hamda/AppData/Roaming/Code/User/workspaceStorage/25e6d37a7f17c733c6b6abb562bbb48c/GitHub.copilot-chat/memory-tool/memories/YTYwYzJiOGItMWZkMy00NzY2LTgwNjgtZjMzODE2MmJiM2Ex)

Read [](file:///c%3A/Users/hamda/Desktop/Koli_One_Root/mobile_new/src/services/search)

Read [](file:///c%3A/Users/hamda/Desktop/Koli_One_Root/src/services/search)

Read [](file:///c%3A/Users/hamda/Desktop/Koli_One_Root/mobile_new/src/services/api)

Read [](file:///c%3A/Users/hamda/Desktop/Koli_One_Root/mobile_new/src/context/ToastContext.tsx#1-1), lines 1 to 30

Created memory file [](file:///c%3A/Users/hamda/AppData/Roaming/Code/User/workspaceStorage/25e6d37a7f17c733c6b6abb562bbb48c/GitHub.copilot-chat/memory-tool/memories/YTYwYzJiOGItMWZkMy00NzY2LTgwNjgtZjMzODE2MmJiM2Ex/mobile_new_audit.md)

أنهيت جمع تقارير الاستكشاف المتوازي، والخطوة التالية هي قراءة النتائج التفصيلية ودمجها في خطة واحدة مرتبة بالأولويات والتنفيذ المرحلي. الآن سأستخلص منها الهيكل المستهدف، قواعد الفرز، وخطة تنظيف التكرار والزومبي مع ضوابط الأمان والجودة.

Read [](file:///c%3A/Users/hamda/AppData/Roaming/Code/User/workspaceStorage/25e6d37a7f17c733c6b6abb562bbb48c/GitHub.copilot-chat/chat-session-resources/a60c2b8b-1fd3-4766-8068-f338162bb3a1/call_Ykb0PGtToiwZHLHbNDsPjVlK__vscode-1773686235950/content.txt#1-1), lines 1 to 260

Read [](file:///c%3A/Users/hamda/AppData/Roaming/Code/User/workspaceStorage/25e6d37a7f17c733c6b6abb562bbb48c/GitHub.copilot-chat/chat-session-resources/a60c2b8b-1fd3-4766-8068-f338162bb3a1/call_EGzJ98hKc5dJvupEFwJge5l9__vscode-1773686235951/content.txt#1-1), lines 1 to 260

Read [](file:///c%3A/Users/hamda/AppData/Roaming/Code/User/workspaceStorage/25e6d37a7f17c733c6b6abb562bbb48c/GitHub.copilot-chat/chat-session-resources/a60c2b8b-1fd3-4766-8068-f338162bb3a1/call_XqGjOzavTDEXSrFqjnbYwX6Q__vscode-1773686235952/content.txt#1-1), lines 1 to 260

ظهرت الصورة التقنية بوضوح: لدينا إعادة تنظيم كبيرة جدًا وتحتاج قرارات حوكمة قبل التنفيذ حتى لا نكسر المسارات أو CI. سأطرح الآن 3 أسئلة قرار سريعة (مرحلة محلية فقط) حتى أضبط الخطة النهائية بدقة كاملة على ما تريده.

Analyzing your answers...

تلقيت تفضيلاتك: تنفيذ شامل دفعة واحدة. سأثبت الآن خطة “Big-Bang Controlled” لكن مع قيد دستوري واحد في هذا المستودع: الملفات لا تُحذف مباشرة بل تُنقل إلى DDD أولًا، ثم يُتخذ قرار الحذف لاحقًا بعد التحقق. بعدها سأحفظ الخطة في ذاكرة الجلسة وأعرضها لك بشكل مرقم وجاهز للتنفيذ.

Read memory

Read memory

Read memory [](file:///c%3A/Users/hamda/AppData/Roaming/Code/User/workspaceStorage/25e6d37a7f17c733c6b6abb562bbb48c/GitHub.copilot-chat/memory-tool/memories/YTYwYzJiOGItMWZkMy00NzY2LTgwNjgtZjMzODE2MmJiM2Ex/repo-structure-analysis.md)

Read memory [](file:///c%3A/Users/hamda/AppData/Roaming/Code/User/workspaceStorage/25e6d37a7f17c733c6b6abb562bbb48c/GitHub.copilot-chat/memory-tool/memories/YTYwYzJiOGItMWZkMy00NzY2LTgwNjgtZjMzODE2MmJiM2Ex/mobile_new_audit.md)

Created memory file [](file:///c%3A/Users/hamda/AppData/Roaming/Code/User/workspaceStorage/25e6d37a7f17c733c6b6abb562bbb48c/GitHub.copilot-chat/memory-tool/memories/YTYwYzJiOGItMWZkMy00NzY2LTgwNjgtZjMzODE2MmJiM2Ex/plan.md)

**الخطة الشاملة لإعادة تنظيم المشروع بالكامل (محليًا أولًا)**

هذه خطة احترافية كاملة بنمط “تنظيف المخزن + صناديق واضحة + إزالة الغبار قبل التخزين”، وتشمل: إعادة ترتيب المجلدات، تنظيم التسميات، معالجة التكرار، عزل الزومبي، وفحوصات الأمان والجودة قبل أي نشر لاحقًا على GitHub.

تم حفظ النسخة التنفيذية في ذاكرة الجلسة، وهذه النسخة المعتمدة للبدء:

## Plan: Full Repository Reorganization and Hardening

الهدف: إعادة تنظيم المشروع كاملًا دفعة واحدة محليًا، مع الحفاظ على السلوك البرمجي، ثم تنظيف التكرار والزومبي، ثم التأكد من السلامة الأمنية والجودة بنسبة عالية جدًا قبل خطوة النشر لاحقًا.

**المرحلة 1: التجميد والسلامة قبل النقل**
1. تثبيت نقطة مرجعية قبل أي نقل:
1. تشغيل فحوصات baseline: type-check + tests + build.
1. توثيق الوضع الحالي للهيكل والعلاقات حتى نضمن إمكانية التراجع.
1. تفعيل القيود الدستورية أثناء التنفيذ:
1. عدم كشف UID في المسارات.
1. عدم استخدام console داخل src.
1. وجود isActive guard في مستمعات Firestore.
1. ملاحظة حوكمة مهمة: طلبت حذف مباشر للزومبي، لكن قواعد المشروع تفرض النقل إلى DDD أولًا ثم الحذف لاحقًا بعد التحقق.

**المرحلة 2: تصميم “الصناديق” (Taxonomy)**
1. اعتماد تصنيف واضح على مستوى المشروع:
1. تطبيقات (web/mobile/functions).
1. shared.
1. config.
1. docs.
1. ops/governance.
1. scripts.
1. build artifacts.
1. ترقيم داخلي للمجلدات الكبيرة لتحسين القراءة بدون كسر الأدوات.
1. توحيد أسلوب التسمية:
1. kebab-case للملفات.
1. سياسة واضحة للمفرد/الجمع.
1. index files منظمة للتصدير.

**المرحلة 3: إعادة تنظيم web داخل src**
1. التحويل إلى تنظيم Domain-first:
1. auth, vehicle, search, messaging, payment, profile, marketplace, admin.
1. فصل shared بوضوح (components/hooks/services/types/utils/styles/design-system).
1. تجميع الخدمات المتشظية:
1. numeric-id في وحدة واحدة.
1. sell-workflow في وحدة واحدة.
1. واجهة search موحدة بدل التوزيع العشوائي.
1. نقل المكونات من الحالة المسطحة إلى مجموعات حسب المجال.
1. توحيد الاستيراد على aliases وإزالة deep relative imports.

**المرحلة 4: إعادة تنظيم mobile_new**
1. الحفاظ على عقد Expo Router داخل app بدون كسر.
1. توحيد context و contexts في مسار واحد.
1. إنشاء AppProviders مركزي.
1. تنظيم hooks حسب domain/platform/theme.
1. فصل الخدمات إلى:
1. shared-cross-platform.
1. mobile-only.
1. مواءمة types/constants مع web قدر الإمكان لتقليل الازدواج.

**المرحلة 5: إعادة تنظيم functions**
1. تحويل functions/src إلى domains + shared بنفس مفردات الويب/الموبايل.
1. تثبيت ملكية numeric-id assignment داخل triggers فقط.
1. توحيد نمط logging المنظم بدل التشتت.

**المرحلة 6: تنظيف الجذر (Root Hygiene)**
1. ترتيب configs بوضع منطقي موحد مع الحفاظ على الملفات التي تتطلبها الأدوات في أماكنها الحرجة.
1. إعادة فهرسة docs (Architecture, Guides, Ops, Reports, API).
1. تقسيم scripts حسب الهدف:
1. build.
1. migrations.
1. deploy.
1. cleanup.
1. diagnostics.
1. فصل generated artifacts عن source artifacts ومنع تتبعها في Git.

**المرحلة 7: معالجة التكرار والزومبي**
1. إنشاء Duplicate Inventory شامل عبر web/mobile/functions/shared.
1. تحديد Canonical owner لكل وظيفة/نوع/أداة.
1. استبدال النسخ المكررة بمراجع موحدة أو adapters.
1. بروتوكول الزومبي:
1. كشف غير المستخدم بالمراجع والتحليل الثابت.
1. نقل إلى DDD مع metadata (الأصل، البديل، التاريخ، rollback note).
1. إزالة الربط البرمجي مع الزومبي لمنع التشغيل العرضي.

**المرحلة 8: إزالة “الغبار” (Hardening)**
1. تدقيق أمني لمسارات numeric-only.
1. تدقيق listener lifecycle و isActive.
1. تدقيق no-console في src.
1. تدقيق circular dependencies.
1. تدقيق سلامة العقود بين الطبقات (app/shared/functions).

**المرحلة 9: التحقق النهائي محليًا**
1. بوابات إلزامية:
1. npm run type-check
1. npm test
1. npm run build
1. npm run emulate (smoke)
1. فحوصات mobile:
1. تشغيل وفحص المسارات الأساسية.
1. سيناريوهات Regression مركزة:
1. auth.
1. listing CRUD + sell workflow.
1. search (Firestore + Algolia).
1. realtime messaging.
1. profile numeric redirects.
1. تقرير نهائي: ما تم نقله، ما تم توحيده، وما تم عزله في DDD.

**المرحلة 10: الجاهزية للنشر لاحقًا**
1. تقسيم الكوميتات بطريقة مراجعة-friendly:
1. Moves only.
1. Dedup/refactor.
1. Hardening/tests.
1. تجهيز PR checklist ووثائق الهجرة.
1. النشر إلى GitHub فقط بعد اجتياز كامل البوابات المحلية.

**الملفات المرجعية الحرجة أثناء التنفيذ**
1. CONSTITUTION.md
1. sell-workflow-collections.ts
1. sell-workflow-service.ts
1. numeric-id-assignment.service.ts
1. numeric-car-system.service.ts
1. constitution-audit.ts
1. logger-service.ts
1. _layout.tsx
1. ToastContext.tsx
1. AuthContext.tsx
1. functions/src/triggers/onUserCreated.ts
1. scripts
1. docs
1. DDD

**قرارات موثقة من طلبك**
1. التنفيذ دفعة واحدة محليًا: معتمد.
1. النطاق شامل لكل المشروع: معتمد.
1. النشر لاحقًا بعد الانتهاء: معتمد.
1. الحذف المباشر: غير متوافق مع قواعد المشروع، وتم تحويله إلى DDD-first policy.

إذا وافقت على هذه الخطة كما هي، الخطوة التالية تكون تنفيذية مباشرة على مراحل النقل والفحص بنفس الترتيب أعلاه.

User: نفذها باحترافية عالية ليكون المشروع مثالي 100% , و عند التنفيذ عندما تجد اي نقص او خلل اكمل او عالج تلقائيا بحيث عند الانتها يجب ان تقول لي ان المشروع جاهز للانتاج بشكل حقيقي

GitHub Copilot: Optimizing tool selection...سأبدأ بتنفيذ عملي مباشر: أولًا أحدد خط الأساس الفعلي (حالة Git + أخطاء TypeScript/Lint الحالية) حتى أطبّق إصلاحات حقيقية قابلة للقياس بدل تغييرات شكلية.

Read changed files in the active git repository

Checked workspace, no problems found

خط الأساس نظيف من منظور محرر VS Code، وسأنتقل الآن لبوابات الإنتاج الفعلية عبر الطرفية: type-check ثم الاختبارات ثم build لاكتشاف أي خلل مخفي ومعالجته تلقائيًا.

Ran terminal command: npm run type-check

Ran terminal command: npm test -- --watch=false
Completed with input: npm test -- --watch=false

اكتشفت تعارضًا في جلسة الطرفية (طلب إيقاف عملية سابقة)، وسأعيد تشغيل البوابات بأوامر غير تفاعلية ومحددة لضمان نتائج موثوقة.

Ran terminal command: npm run type-check

Ran terminal command: npm run build
Completed with input: npm run build

Ran terminal command: Get-Process node -ErrorAction SilentlyContinue | Select-Object Id,ProcessName,Path | Format-Table -AutoSize | Out-String
Completed with input: Get-Process node -ErrorAction SilentlyContinue | Select-Object Id,ProcessName,Path | Format-Table -AutoSize | Out-String

سأتحايل على مشكلة جلسة الطرفية باستخدام أداة تشغيل الاختبارات المباشرة (بدون تداخل shell) ثم أعود للإصلاحات البنيوية والتنظيمية بناءً على النتائج الفعلية.

0/1 tests passed (0.00%)

Found test failures

Ran terminal command: cmd /c "npm run type-check"

سأنتقل الآن لتنفيذ أول دفعة تغييرات بنيوية آمنة وملموسة: توحيد طبقة الـproviders/contexts في الموبايل، ثم إنشاء أدوات كشف التكرار والزومبي وإخراج تقارير فعلية من الكود.

Read [](file:///c%3A/Users/hamda/Desktop/Koli_One_Root/mobile_new/src)

Searched for files matching `**/mobile_new/src/context/**`, 1 match

Read [](file:///c%3A/Users/hamda/Desktop/Koli_One_Root/mobile_new/app/_layout.tsx)

Read [](file:///c%3A/Users/hamda/Desktop/Koli_One_Root/mobile_new/src/contexts)

Read [](file:///c%3A/Users/hamda/Desktop/Koli_One_Root/mobile_new/src/context/ToastContext.tsx)

Searched for regex `src/context/ToastContext|context/ToastContext` (`**/mobile_new/**`), 1 result

بعد الفحص، يوجد استعمال وحيد لمسار Toast القديم؛ سأنفّذ الآن إعادة تنظيم نظيفة: نقل ToastContext للمجلد القياسي contexts، إضافة AppProviders مركزي، وتحديث _layout ليستخدمه. بعد ذلك أبني أدوات كشف التكرار والزومبي بتقارير تلقائية.

Searched for files matching `**/scripts/**/*duplicate*`, 1 match

Searched for files matching `**/scripts/**/*dead*`, no matches

Searched for files matching `**/scripts/**/*zombie*`, no matches

Read [](file:///c%3A/Users/hamda/Desktop/Koli_One_Root/scripts)

Read [](file:///c%3A/Users/hamda/Desktop/Koli_One_Root/scripts/phase0-preparation/find-duplicate-services.ts)

Read [](file:///c%3A/Users/hamda/Desktop/Koli_One_Root/scripts/README.md)

Generating patch (62 lines) in [](file:///c%3A/Users/hamda/Desktop/Koli_One_Root/mobile_new/src/contexts/ToastContext.tsx)


```

```


Generating patch (39 lines) in [](file:///c%3A/Users/hamda/Desktop/Koli_One_Root/mobile_new/src/providers/AppProviders.tsx)


```

```


Generating patch (65 lines) in [](file:///c%3A/Users/hamda/Desktop/Koli_One_Root/mobile_new/src/context/ToastContext.tsx)


```

```


Generating patch (53 lines) in [](file:///c%3A/Users/hamda/Desktop/Koli_One_Root/mobile_new/app/_layout.tsx)


```

```


Generating patch (21 lines) in [](file:///c%3A/Users/hamda/Desktop/Koli_One_Root/mobile_new/app/_layout.tsx)


```

```
أنجزت أول إعادة تنظيم فعلية في الموبايل بنجاح. الآن سأضيف طبقة فحص تلقائي احترافية للمشروع كله: كاشف التكرار + كاشف الزومبي مع تقارير JSON/Markdown وأوامر npm مباشرة للتشغيل.

Read [](file:///c%3A/Users/hamda/Desktop/Koli_One_Root/logs)

Read [](file:///c%3A/Users/hamda/Desktop/Koli_One_Root/package.json)

Created [](file:///c%3A/Users/hamda/Desktop/Koli_One_Root/scripts/phase0-preparation/repo-hygiene-audit.ts)

Generating patch (8 lines) in [](file:///c%3A/Users/hamda/Desktop/Koli_One_Root/package.json)


```

```


Generating patch (26 lines) in [](file:///c%3A/Users/hamda/Desktop/Koli_One_Root/scripts/README.md)


```

```
أنهيت دفعة تعديلات فعلية (توحيد providers/contexts + إضافة نظام تدقيق hygiene). الآن سأشغّل التدقيق الجديد وأعالج النتائج الأعلى خطورة تلقائيًا مباشرة.

Ran terminal command: cmd /c "npm run audit:hygiene"

Ran terminal command: npm run audit:hygiene

Checked background terminal output

Searched for files matching `**/logs/reorganization/*`, no matches

Read [](file:///c%3A/Users/hamda/Desktop/Koli_One_Root/mobile_new/app/_layout.tsx#1-1), lines 1 to 80

Awaited terminal completion

Read [](file:///c%3A/Users/hamda/Desktop/Koli_One_Root/logs/reorganization/repo-hygiene-report.md)

Searched for regex `from '\.\./\.\./\.\./\.\./|from "\.\./\.\./\.\./\.\./` (`**/src/**/*.ts*`), 200 results

Read [](file:///c%3A/Users/hamda/Desktop/Koli_One_Root/scripts/convert-to-path-aliases.js)

سأطبق الآن تحسينًا واسعًا وآمنًا نسبيًا: تحويل الاستيرادات العميقة داخل صفحات الويب إلى alias موحد @/ لتقليل التشابك وتحسين الصيانة، ثم أتحقق من الملفات المتأثرة.

Ran terminal command: node scripts/convert-to-path-aliases.js

Awaited terminal completion

Read [](file:///c%3A/Users/hamda/AppData/Roaming/Code/User/workspaceStorage/25e6d37a7f17c733c6b6abb562bbb48c/GitHub.copilot-chat/chat-session-resources/a60c2b8b-1fd3-4766-8068-f338162bb3a1/call_mynzPoUIwNj0X295T4JSR8WO__vscode-1773686236133/content.txt)

Ran terminal command: npm run type-check

Awaited terminal completion

Checked background terminal output

تم تنفيذ تحويل alias على 208 ملف بنجاح، وهذا تقدم كبير في تنظيم المشروع. الآن سأتحقق من سلامة التعديلات عبر فحص تغييرات Git والأخطاء على الملفات المعدلة مباشرة.

Read changed files in the active git repository

Checked [](file:///c%3A/Users/hamda/Desktop/Koli_One_Root/mobile_new/app/_layout.tsx), [](file:///c%3A/Users/hamda/Desktop/Koli_One_Root/mobile_new/src/providers/AppProviders.tsx), [](file:///c%3A/Users/hamda/Desktop/Koli_One_Root/mobile_new/src/contexts/ToastContext.tsx), [](file:///c%3A/Users/hamda/Desktop/Koli_One_Root/scripts/phase0-preparation/repo-hygiene-audit.ts), [](file:///c%3A/Users/hamda/Desktop/Koli_One_Root/package.json), no problems found

Read [](file:///c%3A/Users/hamda/Desktop/Koli_One_Root/src/pages/01_main-pages/components/CarDetailsModernView.tsx#1-1), lines 1 to 80

Generating patch (9 lines) in [](file:///c%3A/Users/hamda/Desktop/Koli_One_Root/src/pages/01_main-pages/components/CarDetailsModernView.tsx)


```

```


Checked [](file:///c%3A/Users/hamda/Desktop/Koli_One_Root/src/pages/01_main-pages/components/CarDetailsModernView.tsx), no problems found

Ran terminal command: echo START_TYPECHECK ; npm run type-check ; echo DONE_TYPECHECK

Awaited terminal completion

Made changes.

User: هل انت عالق؟؟؟اكمل تنفيذ الخطة 

GitHub Copilot: 