Now let me read the remaining part to get the full context:

Read mobil.de Mobile APP .md, lines 1238 to 1238

Good, I've read the full file. Now let me also read the existing mobile app codebase context to understand what's already built:

Reviewed 2 files
Explore: Explore mobile app codebase
Now I have comprehensive context. Let me build the plan:

Created 00_MASTER_PLAN.md
The create_file tool is disabled. I'll need to ask the user to enable file editing tools or output the content as code blocks. Let me output all plan files as code blocks that can be saved.

أداة إنشاء الملفات معطّلة حالياً. سأكتب لك كل ملفات الخطة كبلوكات كود جاهزة للنسخ. هذه 5 ملفات يجب حفظها في mobile.de_APP_plan

الملف 1: 00_MASTER_PLAN.md
Navy #0F172A → Royal Blue #1E3A8A → Sky Blue #3B82F6 → Light Blue #60A5FA

Deep Indigo #4C1D95 → Violet #7C3AED → Lavender #A78BFA → Soft Purple #C4B5FD

Light Mode: #F8FAFC → #EFF6FF → #FFFFFF
Dark Mode: #0F172A → #1E293B → #334155

Success: #10B981 (أخضر زمردي)
Warning: #F59E0B (كهرماني)
Error: #EF4444 (أحمر)
Info: #6366F1 (نيلي)

الملف 2: 01_DESIGN_SYSTEM.md
1.5 التدرجات (Gradients) 2. الخطوط (Typography)
2.1 مقياس الخطوط
الاسم الحجم الوزن الاستخدام
displayLg 32px 800 عنوان الصفحة الرئيسية
displayMd 28px 700 عنوان قسم رئيسي
headingLg 24px 700 عنوان بطاقة كبيرة
headingMd 20px 600 عنوان شاشة، سعر كبير
headingSm 18px 600 عنوان قسم فرعي
bodyLg 16px 400 نص المحتوى الرئيسي
bodyMd 14px 400 نص بطاقات، وصف
bodySm 13px 400 نص ثانوي، تسميات
caption 12px 500 metadata، تواريخ، مسافات
captionSm 11px 500 badges صغيرة
micro 10px 600 أدنى حجم قابل للقراءة
2.2 عائلة الخطوط 3. المكونات الأساسية (Core Components)
3.1 بطاقة السيارة (CarCard) — التصميم المستوحى من mobile.de
3.2 مؤشر السعر (PriceRating Component)
مستوحى من مؤشر mobile.de الشهير:

3.3 أزرار (Buttons)
النوع الخلفية النص الاستخدام
Primary gradient(#1E3A8A → #3B82F6) أبيض CTA رئيسي
Secondary gradient(#4C1D95 → #7C3AED) أبيض CTA مميز
Outline شفاف + border #3B82F6 أزرق إجراء ثانوي
Ghost شفاف أزرق إجراء خفيف
Danger #EF4444 أبيض حذف/إلغاء
3.4 شريط البحث (SearchBar)
3.5 فلتر (FilterChip)
3.6 TabBar 4. التباعد والأبعاد (Spacing & Sizing) 5. الظلال (Shadows) 6. الأيقونات (Icons)
المكتبة الأساسية: lucide-react-native (متسقة مع الويب)
المكتبة الاحتياطية: @expo/vector-icons (FontAwesome5)
الحجم الافتراضي: 20px للأيقونات العادية، 24px للـ TabBar
اللون الافتراضي: #64748B (غير نشط) → #1E3A8A (نشط) 7. تطبيق على theme.ts الحالي
الملف المستهدف: theme.ts

التغييرات المطلوبة:

استبدال primary: '#003366' → primary: '#1E3A8A'
استبدال secondary: '#FF7900' → secondary: '#7C3AED'
إضافة كامل لوحة الألوان الموصوفة أعلاه
إضافة dark mode variants لكل لون
إضافة gradients object
تحديث typography scale
ملف المرجع: theme.ts (الحالي ~200 سطر)

App
├── (auth)/
│ ├── login.tsx ← تسجيل دخول (Email/Google/Apple)
│ ├── register.tsx ← تسجيل حساب جديد
│ ├── forgot-password.tsx
│ └── verify-phone.tsx ← توثيق رقم الهاتف
│
├── (tabs)/
│ ├── index.tsx ← 🏠 الرئيسية (Home)
│ ├── search.tsx ← 🔍 البحث (Search)
│ ├── sell.tsx ← 📷 نشر إعلان (Sell)
│ ├── map.tsx ← 🗺️ خريطة (Map)
│ ├── messages.tsx ← 💬 الرسائل (Messages)
│ └── profile.tsx ← 👤 الملف الشخصي (Profile)
│
├── car/[id].tsx ← تفاصيل السيارة
├── car/gallery.tsx ← معرض صور كامل الشاشة
├── chat/[id].tsx ← محادثة فردية
├── profile/[id].tsx ← ملف مستخدم آخر
├── profile/edit.tsx ← تعديل الملف
├── profile/settings.tsx
├── profile/my-ads.tsx
├── profile/favorites.tsx
├── profile/saved-searches.tsx
├── profile/analytics.tsx ← إحصائيات (تاجر)
├── profile/dashboard.tsx ← لوحة التاجر
├── dealer/[id].tsx ← صفحة التاجر
├── notifications.tsx
├── price-alerts.tsx
├── financing-instant.tsx
├── vin-scan.tsx
├── certified-vehicle.tsx
└── ...30+ شاشة أخرى موجودة

2.2 Context API (موجود ويبقى) 3. الأداء (Performance)
3.1 أهداف الأداء
المقياس الهدف القياس
Cold start < 2s معدل على iPhone 12 / Pixel 6
TTI (Time to Interactive) < 3s أول تفاعل مع البحث
Scroll FPS 60 fps قائمة نتائج البحث
Image load (cached) < 100ms صورة بطاقة
Image load (network) < 500ms أول صورة من CDN
Search API response < 300ms p95 Algolia query
Message delivery < 500ms Firebase RTDB
App size (download) < 50MB iOS + Android
3.2 استراتيجيات الأداء
Image Optimization

Expo Image مع cachePolicy: 'memory-disk'
Progressive loading: placeholder blur → thumbnail → full
WebP format preferred, AVIF fallback
CDN resize: generate 3 sizes (thumb 200px, medium 600px, full 1200px)
List Virtualization

FlashList بدلاً من FlatList للنتائج
estimatedItemSize مضبوط
removeClippedSubviews: true
Pagination: 20 items per page, infinite scroll
Skeleton Loading

Skeleton placeholder لكل بطاقة وقسم
Shimmer effect أثناء التحميل
Content-aware skeleton (يطابق شكل المحتوى)
Offline Support

المفضلات: حفظ في AsyncStorage + مزامنة
آخر 50 إعلان مُعاين: SQLite cache
آخر بحث: نتائج مخزنة محلياً
الرسائل: queue عند عدم الاتصال + sync عند العودة
Code Splitting

Lazy loading للشاشات غير الأساسية
Dynamic import للمكونات الثقيلة (خرائط، كاميرا، AR) 4. تدفقات المستخدم الرئيسية (User Flows)
4.1 تدفق نشر إعلان (Publish Listing)
معايير القبول:

Given: المستخدم مسجّل ومؤكّد
When: يملأ جميع الحقول المطلوبة ويرفع >= 3 صور
Then: الإعلان يظهر في نتائج البحث خلال 60 ثانية
4.2 تدفق البحث والشراء (Search → Contact) 5. دعم RTL (العربية)
┌─────────────────────────────────────────────┐
│ Mobile App │
│ (Expo Router / RN) │
└──────────────┬──────────────────────────────┘
│
┌──────────▼──────────┐
│ Firebase SDK │ ← Direct client access
│ (Auth, Firestore, │ (with Security Rules)
│ RTDB, Storage) │
└──────────┬──────────┘
│
┌──────────▼──────────┐
│ Cloud Functions │ ← Server-side logic
│ (Node.js 20) │
│ ───────────── │
│ • onUserCreate │ ← Auto-assign numeric ID
│ • onListingCreate │ ← Validate + index in Algolia
│ • onListingUpdate │ ← Re-index + notifications
│ • onImageUpload │ ← Resize + optimize + CDN
│ • onMessage │ ← Push notification
│ • scheduledCleanup │ ← Expire old listings
│ • priceEstimation │ ← ML price rating
│ • searchSync │ ← Algolia sync
└──────────┬──────────┘
│
┌──────────▼──────────┐
│ Algolia Search │ ← Full-text + facets + geo
└─────────────────────┘

firestore/
├── users/ ← ملفات المستخدمين
│ └── {uid}/
│ ├── displayName, email, phone, avatar
│ ├── numericId ← ID رقمي للخصوصية
│ ├── role: 'private' | 'dealer' | 'company'
│ ├── planTier: 'free' | 'dealer_basic' | 'dealer_pro'
│ ├── location: { lat, lon, city, country }
│ ├── stats: { listings, views, followers, rating }
│ ├── verification: { email, phone, id, business }
│ └── createdAt, updatedAt
│
├── listings/ ← الإعلانات (6+ collections via sell-workflow)
│ └── {listingId}/
│ ├── sellerId, sellerNumericId
│ ├── make, model, variant, year
│ ├── price, currency, priceRating
│ ├── mileage, fuelType, transmission, power
│ ├── bodyType, doors, color, interiorColor
│ ├── features: string[]
│ ├── description
│ ├── images: { url, thumbnail, order }[]
│ ├── location: { lat, lon, city }
│ ├── status: 'draft' | 'pending' | 'active' | 'sold' | 'expired'
│ ├── views, inquiries, saves
│ ├── carNumericId ← ID رقمي للسيارة
│ └── createdAt, updatedAt, expiresAt
│
├── messages/ ← Firestore Realtime DB v2
│ └── conversations/{convId}/
│ ├── participants: [uid1, uid2]
│ ├── listingId
│ ├── lastMessage, lastMessageAt
│ └── messages/{msgId}/
│ ├── senderId, text, type, attachments
│ └── createdAt, readAt
│
├── reviews/ ← تقييمات البائعين
│ └── {reviewId}/
│ ├── reviewerId, targetId, listingId
│ ├── rating: 1-5, comment
│ └── createdAt
│
├── saved_searches/ ← عمليات البحث المحفوظة
│ └── {searchId}/
│ ├── userId
│ ├── filters: { make, model, priceRange, ... }
│ ├── notifyOnNew: boolean
│ └── lastNotifiedAt
│
├── price_history/ ← سجل أسعار للتحليل
│ └── {make}{model}{year}/
│ └── entries: { price, date, mileage, condition }[]
│
└── audit_logs/ ← سجلات التدقيق
└── {logId}/
├── action, userId, resourceId, resourceType
├── before, after
└── timestamp

3. Cloud Functions (الوظائف الأساسية)
   3.1 المطلوب إضافته/تحسينه (استيحاء mobile.de)
   الوظيفة الوصف المصدر (trigger)
   onListingCreated فحص جودة + فهرسة Algolia + إشعار Firestore onCreate
   onListingUpdated إعادة فهرسة + إشعار متابعين Firestore onUpdate
   calculatePriceRating مقارنة السعر بمتوسط السوق HTTP callable
   onImageUploaded resize (200/600/1200px) + WebP + CDN Storage onFinalize
   checkSavedSearches إرسال إشعارات عند مطابقة بحث محفوظ Scheduled (كل 15 دقيقة)
   expireOldListings تغيير status = expired بعد 30 يوم Scheduled (يومياً)
   generateDealerStats تجميع إحصائيات التاجر Scheduled (كل ساعة)
   moderateListing فحص spam + محتوى غير لائق Firestore onCreate
   notifyNewMessage إشعار push عند رسالة جديدة RTDB onCreate
   syncToAlgolia مزامنة تلقائية Firestore ↔ Algolia Firestore onWrite
   3.2 Algolia Index Configuration
4. مؤشر السعر (Price Rating API)
   4.1 الآلية
5. Push Notifications Strategy
   الحدث المستقبل المحتوى
   رسالة جديدة مستقبل الرسالة "لديك رسالة جديدة من {sender} بخصوص {carTitle}"
   إعلان جديد يطابق بحث محفوظ صاحب البحث "{make} {model} جديد بسعر €{price} في {city}"
   تقييم جديد البائع "تقييم جديد ⭐{rating} من {reviewer}"
   إعلان على وشك الانتهاء صاحب الإعلان "إعلانك ينتهي خلال 3 أيام — جدّد الآن"
   انخفاض سعر في مفضلة المشتري "انخفض سعر {carTitle} من €{old} إلى €{new}"
   الملف 6: 05_PROMPT_FOR_AI_MODELS.md
   أنت مهندس برمجيات أول متخصص في تطبيقات الموبايل ومنصات المركبات. مطلوب منك تنفيذ مهمة محددة ضمن مشروع Koli One — تطبيق موبايل لسوق السيارات في بلغاريا، مستوحى من تجربة mobile.de الألمانية.

═══════════════════════════════════════
📋 سياق المشروع (اقرأ بعناية قبل التنفيذ)
═══════════════════════════════════════

■ التقنية:

Framework: Expo Router v6 (React Native 0.81.5, React 19, Expo SDK 54)
Styling: Styled Components v6 مع theme.ts مركزي
State: Zustand v4 + React Context (Auth, Language)
Backend: Firebase (Auth, Firestore, RTDB v2, Storage, Cloud Functions Node.js 20)
Search: Algolia (فهرسة + بحث + faceting + geo-search)
Navigation: Expo Router file-based routing مع 6 tabs + 30+ screens
Language: TypeScript strict mode
Icons: lucide-react-native + @expo/vector-icons
■ الهوية البصرية (أزرق/بنفسجي — ليس برتقالي):

Primary: #1E3A8A (Royal Blue) → #3B82F6 (Sky Blue)
Accent: #4C1D95 (Indigo) → #7C3AED (Violet) → #A78BFA (Lavender)
Success: #10B981 | Warning: #F59E0B | Error: #EF4444 | Info: #6366F1
Dark BG: #0F172A → #1E293B | Light BG: #F8FAFC → #EFF6FF
Gradients: primary(#1E3A8A → #3B82F6), accent(#4C1D95 → #7C3AED), mixed(#1E3A8A → #7C3AED)
■ البنية (ملفات رئيسية):

Root layout: \_layout.tsx
Tab layout: mobile_new/app/(tabs)/\_layout.tsx
Theme: theme.ts
Components: mobile_new/src/components/
Services: mobile_new/src/services/
Store: mobile_new/src/store/ (Zustand)
Config: mobile_new/src/config/
■ قواعد صارمة يجب اتباعها:

استخدم Numeric IDs فقط في URLs — لا Firebase UIDs أبداً
لا console.\* — استخدم logger-service بدلاً منه
isActive guard على جميع Firestore listeners لمنع تسريب الذاكرة
لا تحذف ملفات — انقل إلى DDD/ إذا لزم الأمر
جميع المكونات يجب أن تدعم dark mode و RTL (العربية)
استخدم styled-components مع theme tokens — لا ألوان hardcoded
اختبارات تحتاج ThemeProvider + LanguageProvider wrappers
■ الميزات المستوحاة من mobile.de المطلوبة:

بطاقة سيارة (CarCard) بتصميم أنيق مع PriceRating indicator
بحث متقدم مع فلاتر (ماركة، موديل، سنة، سعر، وقود، كم، جسم، لون، ميزات)
مؤشر سعر (PriceRating): excellent/good/fair/high بناءً على متوسط السوق
معرض صور full-screen مع pinch-zoom و swipe
صفحة تفاصيل منظمة: مواصفات grid + وصف + بائع + مشابهات
حفظ بحث + إشعارات عند مطابقة
Dashboard تاجر مع إحصائيات و leads management
تدفق نشر إعلان بـ 6 خطوات مع فحص جودة الصور
تقييمات البائعين (1-5 نجوم)
Sticky CTA bar (اتصل + راسل + مفضلة) في شاشة التفاصيل
═══════════════════════════════════════
🎯 المهمة المطلوبة منك الآن
═══════════════════════════════════════

[أدرج هنا المهمة المحددة، مثال:]

المهمة: إنشاء مكون PriceRating.tsx

المسار: PriceRating.tsx
الوظيفة: يعرض مؤشر سعر بصري (شريط تقدم ملون + نص الحالة)
Props: { rating: 'excellent' | 'good' | 'fair' | 'high' | 'unknown', price: number, averagePrice?: number }
يدعم dark mode + RTL
يستخدم theme tokens من theme.ts
يتضمن styled-components
═══════════════════════════════════════
📦 معايير القبول
═══════════════════════════════════════

الكود يجب أن يكون TypeScript strict مع types واضحة
يستخدم styled-components مع theme tokens (لا ألوان hardcoded)
يدعم dark mode (يقرأ من theme)
يدعم RTL (العربية)
يتضمن JSDoc للمكون الرئيسي
لا يستخدم console.\*
جاهز للإنتاج (لا TODO أو placeholder)
يتوافق مع نسخة React/RN/Expo المحددة أعلاه
═══════════════════════════════════════
📐 تنسيق الإخراج
═══════════════════════════════════════

اكتب الكود الكامل بدون اختصارات
ابدأ بـ imports
ثم types/interfaces
ثم styled components
ثم المكون الرئيسي
ثم export
إذا كان هناك ملفات متعددة، اذكر المسار الكامل لكل ملف
المهمة: إعادة تصميم CarCard.tsx بنمط mobile.de مع PriceRating

المهمة: إنشاء AdvancedFilterSheet bottom sheet مع 15 فلتر

المهمة: إنشاء Full-screen Image Gallery مع pinch-zoom

المهمة: تحديث theme.ts بلوحة الألوان الأزرق/بنفسجي الكاملة

المهمة: إنشاء useSearchStore (Zustand) مع Algolia integration

المهمة: إنشاء Dealer Dashboard screen مع stats cards

المهمة: إنشاء Cloud Function لحساب PriceRating

---## ملاحظة أخيرةهذا البرومت مصمم لضمان **الاتساق** عبر جميع النماذج والمهندسين. كل من ينفّذ مهمة يجب أن يستخدم نفس:- الألوان والتدرجات- نمط الكود (styled-components + TypeScript)- القواعد الصارمة (no console, numeric IDs, isActive guard)- معايير القبول
هذه هي الملفات الخمسة الكاملة. لإنشائها، يُرجى تفعيل أداة إنشاء الملفات (File Edit tools) في الإعدادات، أو احفظ كل بلوك يدوياً في المجلد mobile.de_APP_plan بالأسماء التالية:

الملف المحتوى
00_MASTER_PLAN.md الخطة الرئيسية والفهرس
01_DESIGN_SYSTEM.md نظام التصميم الكامل (ألوان، خطوط، مكونات)
02_FRONTEND_ARCHITECTURE.md هندسة الواجهة (شاشات، تدفقات، أداء)
03_BACKEND_SERVICES.md الخدمات الخلفية (Firebase، Algolia، Cloud Functions)
04_IMPLEMENTATION_PHASES.md مراحل التنفيذ (13 أسبوع، 5 مراحل)
05_PROMPT_FOR_AI_MODELS.md برومت احترافي جاهز للنسخ
الملخص: خطة متكاملة من 5 مراحل (~13 أسبوع) تحوّل تطبيق Koli One Mobile من تصميمه الحالي (#003366 + #FF7900) إلى تجربة مستوحاة من mobile.de بهوية أزرق/بنفسجي (#1E3A8A → #7C3AED) مع الحفاظ على البنية التقنية الموجودة (Expo Router + Firebase + Algolia).
