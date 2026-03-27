المرحلة 1: الأمان والثغرات الحرجة 🔴
1.1 إزالة كلمة المرور المكشوفة
الملف: unique-owner-service.ts:60 — OWNER_PASSWORD = 'Alaa1983' مكتوبة بشكل صريح!
الحل: نقل إلى Environment Variable (VITE_OWNER_SECRET)
التحقق: grep -r "Alaa1983" src/ → 0 نتائج
1.2 إزالة إيميلات الأدمن من Firestore Rules
الملف: firestore.rules:19-30 — 4 إيميلات شخصية مكشوفة في isAdmin()
الحل: إنشاء كوليكشن admin_roles + تعديل isAdmin() ليقرأ منه بدل الإيميلات
1.3 تفعيل MFA للسوبر أدمن
الملفات: Super Admin login + RoleGuard.tsx
الحل: Firebase Multi-Factor Auth (SMS) + enrollment screen
1.4 Session Timeout + Rate Limiting للأدمن
الحل: idle timeout (30 min) + قفل بعد 5 محاولات فاشلة + audit logging
المرحلة 2: الوظائف الناقصة — الويب 🌐
2.1 صفحة Settings ❌ غير موجودة
UserSettingsGuardedPage.tsx يعرض placeholder فقط
الحل: إنشاء SettingsPage.tsx بأقسام: معلومات شخصية، أمان، إشعارات، خصوصية، لغة، حذف حساب
المرجع: مكونات موجودة في Modals (PasswordChangeModal, PhoneVerificationModal, etc.)
2.2 Car Tracking — ⚠️ تصميم بدون خريطة
CarTrackingPage.tsx — layout فقط
الحل: تكامل Google Maps API
2.3 Events Creation ❌ معطل
index.tsx:208 — "not yet available"
الحل: CreateEventModal + CRUD على كوليكشن events
2.4 "Recently Sold" + "Community" — Coming Soon
UnifiedSocial.tsx:300 — قسمين معطلين في الرئيسية
الحل: ربط مع sold_cars + Social Feed الموجود
2.5 View All Dealers — Mock Data
ViewAllDealersPage.tsx:263 — بيانات وهمية
الحل: استبدال بكويري Firestore حقيقي
2.6 SEO City+Brand — Placeholder Cards
SEOCityBrandPage.tsx:135
الحل: استبدال بكويري Algolia مفلتر
2.7 Content Moderation Queue ❌ Stub
الحل: صفحة /admin/moderation + Cloud Function trigger + Approve/Reject workflow
المرحلة 3: الوظائف الناقصة — Backend 🔧
3.1 إرسال SMS ❌ غير مطبق
real-time-notifications-service.ts:288 — يسجل فقط ولا يرسل
الحل: Cloud Function sendSMS عبر Twilio
3.2 Push Notifications Delivery ⚠️ ناقص
push-notifications.service.ts — Token collection بدون delivery
الحل: Cloud Function sendPushNotification مع batch delivery
3.3 B2B Analytics TODOs
functions/src/analytics/b2b-exports.ts:365 — priceTrend: 2.5 // TODO
الحل: حساب فعلي من تاريخ الأسعار
3.4 إزالة console.log من Functions
الحل: استبدال بـ functions.logger.info()
3.5 Google Analytics Account ID — TODO
الحل: إضافة GA4 Property ID كـ env var
3.6 Subscription Tier Enforcement ❌
الحل: middleware يتحقق من مستوى الاشتراك (Basic: 3 إعلانات، Premium: 10، Dealer: ∞)
المرحلة 4: الوظائف الناقصة — الموبايل 📱
4.1 Admin Panel ⚠️ 60%
الحل: إضافة إحصائيات + moderation queue + system alerts
4.2 Dealer Dashboard ⚠️ 70%
الحل: إحصائيات مبيعات + bulk upload + inventory management
4.3 Onboarding Screen 4 — AI Showcase
الحل: شاشة رابعة تعرض Visual Search, AI Valuation, AI Advisor
4.4 Fast Sell — ⚠️ محتمل Stub
الحل: التحقق والإكمال (quick capture → AI fill → publish)
المرحلة 5: توحيد الكود المشترك (Shared SDK) 🔗
5.1 إنشاء shared/sdk/
5 services مكررة: Messaging, Listing, Review, Analytics, Search
الحل: SDK موحد مع platform adapters (web/mobile)
التأثير: إصلاح bug واحد بدل اثنين، سلوك متسق
المرحلة 6: إعادة التصميم (Plan 1.5) 🎨
المهمة التفاصيل
6.1 توحيد الألوان 4 أنظمة → #E65100 + #1A237E
6.2 توحيد الخطوط 6 خطوط → Inter + Exo 2 (-200KB)
6.3 إعادة تصميم Header إزالة LED glow → هيدر نظيف + mega-menu
6.4 تقليل أقسام الرئيسية 14+ → 8-10 أقسام
6.5 Accessibility (WCAG AA) skip-nav, ARIA, focus ring, contrast 4.5:1 → Lighthouse ≥90
6.6 مزامنة ثيم الموبايل نفس design tokens
المرحلة 7: الاختبارات والجودة 🧪
المهمة التفاصيل
7.1 E2E Tests للويب Playwright + 10 سيناريوهات (لا يوجد حالياً!)
7.2 تفعيل HomePage Smoke Test describe.skip → fix + enable
7.3 Integration Tests للـ Functions tests لـ stripeWebhooks, onUserCreate, dailyReconciliation
المرحلة 8: التحضير للإنتاج 🚀
المهمة التفاصيل
8.1 إزالة Mock/Fallback Data analytics mock, translation mock
8.2 تفعيل DeepSeek Functions 3 functions معطلة (CPU conflict)
8.3 Feature Flags Cleanup USE_CLEAN_NAMING + USE_ROUTER_OUTLET_LAYOUTS = PENDING
8.4 Monitoring للـ Cron Jobs تنبيهات عند فشل scheduled functions
8.5 Feature Flag UI في Super Admin إدارة بدون نشر جديد
8.6 Security Headers (CSP) في firebase.json
ملخص الفجوات حسب القسم الرئيسي
القسم النسبة الفجوات الحرجة
الرئيسية 90% Recently Sold, Community coming soon, 14+ أقسام
البروفايل 95% Settings page = placeholder
البحث 98% SEO placeholder cards
بيع سيارة 95% لا tier enforcement
المراسلة 80% SMS ❌، Push delivery ❌
الدفع 100% —
الأدمن 85% Content moderation ❌
السوبر أدمن 75% MFA ❌, Session timeout ❌, Password مكشوف ❌
الموبايل 92% Admin 60%, Dealer 70%, Onboarding 75%
Backend Functions 90% SMS, Push, B2B TODOs, console.log
التكامل ويب↔موبايل 70% 5 services مكررة, ثيمات غير موحدة
الاختبارات 80% لا E2E للويب، smoke test معطل
Design System 60% 4 أنظمة ألوان، 6 خطوط، ضعف accessibility
التحقق النهائي (Definition of Done)
npm run type-check → 0 errors
npm test → all pass
npm run build → success
Lighthouse: Perf ≥85, A11y ≥90, SEO ≥95
grep "TODO|FIXME|coming soon|placeholder|mock" src/ → 0
لا كلمات مرور أو إيميلات مكشوفة في الكود
كل Cloud Functions مراقبة بتنبيهات
E2E tests تمر بنجاح (ويب + موبايل)
SMS + Push notifications يعملان فعلياً
Shared SDK موحد بين الويب والموبايل
القرارات:

الأمان والمميزات والتصميم → بالتوازي
Shared SDK → ضمن الخطة
MFA → مع باقي إصلاحات الأمان (ليس فوري منفصل)
لا حذف ملفات → نقل إلى DDD حسب CONSTITUTION.md

✅ الخطة النهائية الشاملة — Koli One Production Readiness Plan v2.0
تم تجميع كل نتائج البحث العميق وتحديث الخطة. إليك الملخص:

ما تغيّر عن v1
v1 v2 (النهائية)
المراحل 8 14
الفجوات المكتشفة ~15 ~65
نسبة الإنجاز الحقيقية ~92% ~88%
مناطق جديدة مغطاة — PWA, i18n, Payments (deep), Dealer Flow, Error Handling, CI/CD, Email, API Docs
المراحل الـ 14

# المرحلة النسبة الحالية الفجوات

1 الأمان 🔴 60% كلمة مرور مكشوفة، إيميلات أدمن، لا MFA، storage leak، لا global error handlers
2 الويب 🌐 88% Settings placeholder، Events disabled، Mock data، 500 page غير مربوط
3 Backend 🔧 82% SMS/Push لا يعملان، لا rate limiting، B2B analytics TODOs
4 الموبايل 📱 85% Admin 60%، Dealer 70%، Onboarding 3/4
5 الدفع 💳 85% Disputes غير معالجة، لا PDF فواتير، Trial webhook ناقص
6 تدفق الديلر 🏢 75% لا صفحة حالة تحقق، لا rejection feedback، لا إيميل على تغيير الحالة
7 PWA 📲 74% تعارض service workers، لا manifest screenshots، font cache بلا حدود
8 i18n 🌍 61% 52+ نص hardcoded، عربي 2/25 module فقط
9 Error Handling ⚠️ 70% لا unhandled rejection listener، لا HTTP interceptor، 500 غير مربوط
10 CI/CD 🔄 70% لا staging، lint/type-check non-blocking، لا E2E في CI
11 البريد 📧 80% SendGrid TODO، لا delivery tracking
12 الاختبارات 🧪 65% لا E2E للويب، HomePage test معطل
13 API Docs 📚 40% 9/40+ endpoints موثقة فقط، لا versioning
14 التصميم + النهائي 🎨 65% ألوان متعددة، 6 خطوط، لا WCAG AA، mock data
أهم 6 أولويات فورية (P0)
إزالة كلمة المرور Alaa1983 من الكود المصدري
إزالة إيميلات الأدمن من firestore.rules
إضافة global error handlers (unhandledrejection + window.onerror)
إصلاح storage rules — مسار المراسلة مفتوح لأي مستخدم
تطبيق dispute handling — charge.dispute.created غير معالج
إنشاء staging environment — حالياً deploy مباشر على production
