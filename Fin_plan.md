Plan: Koli One — Full Project Completion (البناية الجاهزة للسكن)
البناية مكتملة بنسبة ~80%. الهيكل والعمارة ممتازين. ما تبقى: توصيل الكهرباء (الإشعارات والتنبيهات)، تركيب الشبابيك (التكاملات الاجتماعية ومطابقة المدفوعات)، التشطيب الداخلي (الإعجابات، RSVP، الإعدادات، صفحات الأخطاء)، وربط المرافق (لوحات الإدارة، تكافؤ التطبيق). 10 مراحل، ~80 عنصر.

القرارات:

الدفع: نستمر مع Revolut + iCard. Stripe مؤجل.
تنبيهات الإدارة: 3 قنوات (Slack + Telegram + SendGrid)
Social APIs: Facebook, Instagram, Twitter/X, LinkedIn — كلها جاهزة
Email: SendGrid
Phase 1: CRITICAL — إصلاح الوظائف الأساسية المعطلة (حاجز إنتاج)
#	المشكلة	الملف	التفصيل
1.1	الإشعارات وهمية	NotificationDropdown.tsx	Lines 75-105 تحمّل بيانات mock. يجب استبدالها بـ onSnapshot من Firestore. markAsRead() L119 لا يكتب لـ Firebase
1.2	Push Notifications معطلة	AuthContext / hook جديد	لا يوجد FCM token registration في أي مكان. يجب: getToken(messaging) → حفظ في users/{uid}.fcmTokens[]
1.3	Like لا يعمل	PostsFeedPage.tsx:36	handleLike() فقط يسجل log. يجب: إنشاء post_likes subcollection + تحديث العداد
1.4	RSVP لا يعمل	EventCard.tsx:192	handleInterested() فقط يسجل log. يجب: إنشاء event_rsvps collection
1.5	Subscription check دائماً false	subscription-service.ts L54	checkSubscriptionStatus() returns false دائماً. يجب: query subscription doc
1.6	ثغرة أمنية: المفضلة	UserFavoritesPage.tsx:486	URL numericId غير محقق — يمكن لأي شخص رؤية مفضلات الآخرين
Phase 2: HIGH — بنية تحتية لتنبيهات الإدارة
#	المهمة	الملف
2.1	إنشاء SendGrid email service	email.service.ts (جديد)
2.2	تفعيل Slack webhook	monitoring.config.ts:315 — استبدال stub بـ fetch() POST
2.3	تفعيل Telegram bot	monitoring.config.ts:325 — استبدال stub بـ Bot API
2.4	تفعيل Email alerting	monitoring.config.ts:335 — ربط بـ SendGrid
2.5	إشعارات spam reports	report-spam.service.ts:151 — إرسال عبر 3 قنوات
2.6	Security alerts حقيقية	AIDashboard.tsx L306-320 — استبدال mock بـ Firestore listener
2.7	إشعارات security monitor	security-monitor.ts:494 — ربط notifyAdmins()
Phase 3: HIGH — إكمال الدفع والفوترة
#	المهمة	الملف
3.1	Payment provider API (iCard + Revolut)	payment-reconciliation.ts:219 — استبدال [] بـ API calls
3.2	تنبيهات المطابقة	payment-reconciliation.ts:253 — SendGrid + Slack
3.3	إيرادات micro-transactions	micro-transactions.service.ts:312 — query حقيقي
3.4	تنظيف العروض المنتهية	micro-transactions.service.ts:322 — batch update
3.5	تذكيرات grace period	churn-prevention.service.ts:301 — Cloud Scheduler
3.6	بريد الاحتفاظ بالعملاء	churn-prevention.service.ts:315 — SendGrid template
3.7	إصلاح AI billing mock	billing-system.ts:399 — توجيه لـ manual bank transfer
Phase 4: HIGH — تكامل Social Media
#	المهمة	الملف
4.1	Facebook Graph API	social-media-content.service.ts:234 + facebook-ads-sync.ts
4.2	Instagram Graph API	نفس الملف
4.3	Twitter/X API v2	نفس الملف
4.4	LinkedIn API	نفس الملف
4.5	حفظ Facebook Post ID	unified-car-mutations.ts:84 — إلغاء تعليق updateDoc
4.6	Google Ads sync	google-ads-sync.ts — ربط API حقيقي
Phase 5: MEDIUM — إكمال صفحات المستخدم
#	المهمة	الملف
5.1	إنشاء صفحة الإعدادات	src/pages/03_user-pages/SettingsPage.tsx (جديد) — حالياً placeholder
5.2	بطاقات السيارات في الملف الخاص	PrivateProfile.tsx L435 — ربط UnifiedCarService
5.3	Cover image fallback	CoverImageUploader.tsx L365,368 — إرجاع صورة placeholder بدل undefined
5.4	أسماء المشاركين في Shared Inbox	SharedInboxPage.tsx:176 — query displayName
Phase 6: MEDIUM — إكمال الرسائل
#	المهمة	الملف
6.1	ربط OfferBubble	InteractiveMessageBubble.tsx:99 — الملف موجود لكن غير مستخدم
6.2	إنشاء VoiceMessageBubble	ملف جديد — مرجع في L117 لكن غير موجود
6.3	ربط messaging analytics	MessageSender.ts:191
6.4	ربط AI message agent	MessageSender.ts:167
6.5	ضغط الصور	image-upload.service.ts:203
6.6	ربط ContactSection	ContactSection.tsx:21 — توجيه لخدمة الرسائل
Phase 7: MEDIUM — إصلاح التوجيه والصفحات المفقودة
#	المهمة	التفصيل
7.1	Route VisualSearchPage	صفحة كاملة لكن بدون route → إضافة /visual-search
7.2	Route ArchitectureDiagramPage	صفحة كاملة → /admin/architecture
7.3	إصلاح AdminDataFix	MainRoutes.tsx L48-52 يستخدم stub. الملف الحقيقي موجود
7.4	حذف Route مكرر	CompetitiveComparisonPage مكرر في MainRoutes (L541 + L604)
7.5	إنشاء صفحات أخطاء	500 ServerError + Offline + 403 Unauthorized (غير موجودين)
7.6	التحقق من Feature Flags	SiteSettingsControl.tsx toggles — هل مطبقة فعلاً أم مجرد UI؟
Phase 8: MEDIUM — AI والميزات المتقدمة
#	المهمة	الملف
8.1	Seller reputation scoring	deal-rating.service.ts:390 — حالياً return 70
8.2	Smart price drop alerts	smart-alerts.service.ts:386 — مطابقة + إرسال
8.3	Story plan limits	story.service.ts:35 — حالياً دائماً true
8.4	حل DeepSeek CPU conflict	index.ts L49-58 — اختبار runWith({ memory: '1GB' })
8.5	AI advisor backend	AdvisorResults.tsx:98 — Cloud Function
8.6	Duplicate detection analytics	duplicate-detection-enhanced.service.ts:453
8.7	Google Analytics config	google-analytics-data-deletion.service.ts:31
Phase 9: MEDIUM — إكمال تطبيق Mobile
#	المهمة	الملف
9.1	تفعيل native maps	map-search.tsx — ربط react-native-maps
9.2	تفعيل AI_ADVISOR flag	featureFlags.ts — تغيير false → true
9.3	إكمال marketplace checkout	checkout.tsx
9.4	Stripe key placeholder	PaymentService.ts — pk_test_placeholder
9.5	إكمال social post creation	create-post.tsx — @mentions, hashtags, location
9.6	ضغط الصور في upload queue	useUploadQueue.ts — expo-image-manipulator
9.7	صفحة إدارة الاشتراكات	subscription.tsx
9.8	Admin editing	admin — إضافة write operations
Phase 10: POLISH — اللمسات الأخيرة
#	المهمة	التفصيل
10.1	مزامنة الأنواع	ai-quota.types.ts يحتوي 'pro'|'dealer' غير موجود في types
10.2	Auth checks للـ Cloud Functions	5 functions بدون auth verification (admin-only operations)
10.3	Webhook timestamp validation	icard-webhooks.ts + revolut-webhooks.ts — التحقق من الاستخدام
10.4	Input validation	geminiPriceSuggestion — sanitize location parameter
10.5	Missing Firestore triggers	Review creation, Offer creation, Favorite → notifications
10.6	QUICK_START.md lint	Minor markdown formatting (trailing : in headings)
10.7	Full verification gate	npm run type-check && npm test && npm run build + functions build + mobile export
ما هو مستثنى (مؤجل):
إعادة تفعيل Stripe (نستمر بالتحويل البنكي)
Apple Pay / Google Pay
Video calls عبر WebRTC
تقسيم MainRoutes.tsx لملفات فرعية
تغطية الاختبارات (17/61 → 61/61)