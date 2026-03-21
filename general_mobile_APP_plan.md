🏗️ الخطة الشاملة لتطبيق Koli One Mobile
TL;DR
التطبيق يملك أساساً ممتازاً (48 شاشة، 30+ خدمة، Firebase متكامل). الخطة تركز على 3 محاور: إتقان الواجهة 100%، ربط كامل بالويب، وميزات تنافسية تقتل المنافسين في بلغاريا.

الوضع الحالي — ما هو مكتمل وما ينقص
المكون الحالة ملاحظات
Home, Search, Sell, Profile, Messages ✅ مكتمل يعمل ببيانات حقيقية
50+ فلتر + Algolia + Firestore ✅ مكتمل محرك بحث موحد
9 خطوات بيع + AI Description ✅ مكتمل Gemini Vision + DeepSeek
7 تبويبات بروفايل ✅ مكتمل Overview, Ads, Campaigns, Analytics, Settings, Consultations, Following
المراسلة Realtime DB v2 ✅ مكتمل لكن ينقص typing indicators و voice
المقارنة ✅ مكتمل بيانات حقيقية، يقارن حتى 3 سيارات
VIN Scanner, Price Alerts, Saved Searches ✅ مكتمل
Auth (Google, Apple, Email, Phone, Guest) ✅ مكتمل
AR Garage ⚠️ بروتوتايب كاميرا فقط بدون ARKit/ARCore
المزادات ⚠️ جزئي عرض بدون مزايدة حية
Blog, Stories, Events, Social ⚠️ هيكل فقط شاشات فارغة
Dealer features ⚠️ جزئي
TCO Calculator, Neural Feed, Fast Sell ❌ غير موجود من المسودة — لم يُنفذ بعد
Phase 1: إتقان الواجهة الأمامية (UI/UX Perfection)
الأولوية: قصوى — لا يوجد اعتماد على مراحل أخرى

1.1 نظام التصميم الموحد (Design System)
إنشاء مكتبة مكونات موحدة تضمن اتساق بصري في كل مكان:

إنشاء DesignTokens.ts في styles — spacing scale (4-48px), radius, shadows, typography
UnifiedButton (primary/secondary/outline/ghost/destructive) مع أحجام sm/md/lg
UnifiedCard (flat/elevated/glass/outlined)
InputField موحد (text/numeric/select/multiline) مع حالات focus/error/disabled
Badge (status/count/premium/verified), Chip (selectable/filter/action)
Avatar (user/brand/placeholder), Divider, Spacer
الملفات: theme.ts, ui (مجلد جديد ومجلد موجود)

1.2 بطاقة السيارة المثالية (CarCard Revolution)
الملف: CarCard.tsx

Image Carousel (swipeable) بدل صورة واحدة — مع pagination dots
شارة Trust Shield 🛡️ للسيارات الموثقة (serviceHistory + VIN verified)
شارة السعر الذكي (Great/Good/Fair Price) من priceBadge الموجود في CarSummary
أيقونة المفضلة مع animation في الزاوية
Swipe actions: يمين = حفظ، يسار = مقارنة
Haptic feedback عند الضغط
عداد المشاهدات الصغير
1.3 الفلاتر المثالية (Perfect Filters)
الملفات: AdvancedSearchModal.tsx, UnifiedFilterEngine.ts

Quick Filters Bar أفقي في أعلى البحث — كل chip يفتح mini-picker (ماركة، سعر، سنة، وقود)
Range Sliders مزدوجة للسعر والسنة والكيلومتر (بدل inputs نصية)
Brand Picker مع بحث + شعارات Clearbit + "الأكثر شعبية" في الأعلى
Model Picker يعتمد على الماركة المختارة (cascading)
Color Picker بصري محسّن مع animation اختيار
Equipment Checklist مع عداد لكل فئة ("Safety: 3/12 selected")
Preset Filters جاهزة: "عائلية اقتصادية"، "رياضية"، "للمبتدئين"، "تجارية"
عداد نتائج حي: "~234 سيارة" يتحدث أثناء تغيير الفلاتر (debounced count)
تفعيل Radius Geo-Query عبر Algolia geo-search (معلق حالياً)
1.4 البروفايل المثالي
الملف: mobile_new/app/(tabs)/profile.tsx/profile.tsx)

Overview:

Cover Photo مع gradient overlay
Trust Score بتصميم gauge دائري (عداد سرعة) بدل progress bar
Stats Animation — أرقام تتصاعد من 0 للقيمة الحقيقية
QR Code لمشاركة البروفايل + Share deep link
Social Proof: "آخر نشاط: منذ 2 ساعة"، "متوسط الرد: 15 دقيقة"
My Ads:

Bulk Actions — تحديد متعدد + إيقاف/حذف/تجديد
Mini Performance Chart لكل إعلان (views آخر 7 أيام) — react-native-gifted-charts (موجود)
زر "Boost Ad" للترقية
Analytics:

Line Chart للمشاهدات عبر الزمن (7/30 يوم)
Conversion Funnel: مشاهدات → رسائل → عروض → بيع
Pie Chart توزيع المصادر
Settings:

Notification Preferences تفصيلية (رسائل/عروض/أسعار — كل واحد switch مستقل)
Privacy Controls — إخفاء الهاتف، إخفاء آخر نشاط
Data Export (GDPR) + Delete Account مع تأكيد
1.5 شاشة تفاصيل السيارة
الملف: [id].tsx

Full-screen Image Gallery مع pinch-to-zoom + swipe + counter "3/12"
Sticky Header يظهر عند التمرير (اسم + سعر + زر اتصال)
Quick Actions Bar ثابت أسفل: اتصل | راسل | عرض سعر | مشاركة
Specs Grid بتصميم 2×3 أيقونات (سنة، كم، وقود، HP، ناقل، لون)
Equipment Tabs (Safety | Comfort | Tech | Extras) بدل قائمة طويلة
Seller Card مع Trust Score + response rate
Similar Cars carousel في الأسفل
TCO Widget — حاسبة التكلفة الشهرية (Phase 3)
1.6 الرسائل المتقدمة
الملفات: mobile_new/app/(tabs)/messages.tsx/messages.tsx), [id].tsx

Typing Indicator حقيقي (RTDB /typing/{channelId})
Read Receipts (✓✓ نمط WhatsApp)
Offer Bubble مميز بصرياً مع أزرار قبول/رفض
Quick Replies: "هل السيارة متاحة؟"، "ممكن أقل سعر؟"
Image Messages + Voice Messages (expo-av)
Car Context Card في أعلى المحادثة
Online/Offline Status + Message Search
Block/Report User
1.7 الصفحة الرئيسية
الملف: mobile_new/app/(tabs)/index.tsx/index.tsx)

Hero Section ديناميكي يتغير بناءً على الوقت
"Recently Viewed" carousel
Category Grid أنيق (Cars, SUVs, Trucks, Motorcycles, Vans, Buses) بصور مميزة
Price Drop Alerts section
Trending Searches — الأكثر بحثاً في بلغاريا
"New on Koli One" — آخر الإعلانات
Dealer Spotlight — تاجر مميز
Phase 2: الربط الكامل بالويب (100% Web Parity)
الأولوية: عالية جداً — يعتمد جزئياً على Phase 1

2.1 Cross-Device Draft Continuity
DraftService.ts يكتب بنفس schema الويب: users/{uid}/sell*drafts/active
إضافة lastEditedOn: 'mobile' | 'web' + lastEditedAt: Timestamp
Conflict resolution: last-write-wins
2.2 توحيد Vehicle Collections
ListingService.ts يقرأ من نفس الـ 6 مجموعات: passenger_cars, suvs, vans, motorcycles, trucks, buses
SellService.ts يكتب للمجموعة الصحيحة بناءً على vehicleType
2.3 توحيد Search + Deep Links
فلاتر الموبايل تنتج نفس Algolia queries الخاصة بالويب
Deep Links: koli.one/search?mk=BMW&pf=5000 → الموبايل يفتح بنفس الفلاتر
Web URL params mapping ↔ mobile FilterState (الكود موجود في UnifiedFilterEngine)
2.4 توحيد Messaging
Channel IDs بنفس الصيغة: msg*{buyer}_{seller}\_car_{carId}
رسالة من الويب تظهر فوراً في الموبايل (والعكس)
Read receipts + typing indicators متزامنة
2.5 Numeric ID System
جميع الروابط تستخدم numericId (لا Firebase UID أبداً — CONSTITUTION requirement)
Deep Links: /car/{sellerNumericId}/{carNumericId}, /profile/{numericId}
numeric-id-lookup.service.ts — تأكيد التطابق مع الويب
2.6 Reviews + Trust Score + Notifications
ReviewService يقرأ/يكتب بنفس schema الويب
Trust Score بنفس الخوارزمية (من trust-score-service.ts)
Push notifications عبر Cloud Functions → deep link مباشر
Phase 3: الميزات التنافسية (Killer Features)
الأولوية: عالية — يعتمد على Phase 1+2

3.1 حاسبة TCO البلغارية (Total Cost of Ownership) — جديد
Widget في صفحة تفاصيل السيارة يحسب تلقائياً:

ضريبة السيارة السنوية البلغارية (بناءً على HP + سنة الصنع)
التأمين الإلزامي التقريبي (Civil Liability)
سعر Vignette السنوية (67 BGN)
استهلاك الوقود × سعر البنزين/الديزل الحالي
التكلفة الشهرية الحقيقية: "~450 лв/месец"
مقارنة مع متوسط نفس الفئة
ملفات جديدة: TcoCalculatorService.ts, TcoWidget.tsx

3.2 Street Scanner AI (كشف السيارات بالكاميرا) — جديد
فتح الكاميرا → التقاط صورة سيارة في الشارع
Gemini Vision (Cloud Function analyzeCarImage الموجودة) يستخرج Make/Model/Year
بحث Algolia فوري: "سيارات مشابهة معروضة للبيع على Koli One"
ملفات: ترقية scanner.tsx, خدمة جديدة street-scanner.service.ts

3.3 Koli Fast Sell (مزادات عكسية للوكلاء) — جديد
البائع يفعّل "Fast Sell" → push notifications لجميع الوكلاء
Blind bids خلال 24 ساعة (Firestore Transactions)
البائع يختار أفضل عرض
Real-time countdown + bid updates
ملفات جديدة: fast-sell.tsx, FastSellService.ts

3.4 Neural Scroll Feed (TikTok-Style Discovery) — جديد
Vertical swipe feed (full-screen cards)
قياس Dwell Time لكل سيارة
Algolia Personalization تعدل التوصيات بناءً على السلوك الصامت
Section في Home أو تبويب "Discover"
ملفات جديدة: discover.tsx, NeuralFeedService.ts

3.5 Shield of Trust (درع الثقة) — جديد
شارة ذهبية متوهجة على الإعلانات المُوثقة (VIN + service history + no accidents)
Boost في نتائج البحث (Algolia ranking)
ملف جديد: TrustShield.tsx
3.6 AR Garage — ترقية
ترقية من بروتوتايب إلى expo-three/ViroReact مع ARKit/ARCore
أبعاد حقيقية للسيارة + plane detection
أولوية منخفضة — ميزة show-off
Phase 4: التجاوب والأداء (بالتوازي مع Phase 1-3)
4.1 Responsive Layout
استبدال كل Dimensions.get بـ useWindowDimensions()
PixelRatio.getFontScale() + flexShrink على كل النصوص
Breakpoints: phone (<380) / normal (380-428) / large (428-500) / tablet (500+)
4.2 Performance
ضغط الصور قبل الرفع (expo-image-manipulator — 80% توفير)
إصلاح 11 box-shadow → shadow-\* + elevation (من PR audit)
إصلاح translateX(-50%) + 3 string pixel values
React.memo + useMemo + useCallback على المكونات الثقيلة
4.3 Offline Support
AsyncStorage caching (آخر 50 سيارة + محادثات)
Network-aware banner ("بدون إنترنت" + cached data)
Upload queue يتابع عند عودة الاتصال
Phase 5: الصفحات المعلقة (Complete Stubbed Screens)
يعتمد على Phase 2

الشاشة الوضع الحالي المطلوب
auctions.tsx عرض فقط Live countdown + bid placement + real-time updates
blog.tsx هيكل Featured article + list + detail + rich text
events.tsx هيكل Calendar view + RSVP + map
Stories/Social هيكل Create + view + 24h expiry + reactions
Dealer Dashboard جزئي Registration + verification + inventory + analytics
Phase 6: الأمان وضمان الجودة (بالتوازي)
Security: لا Firebase UIDs في routes/logs، rate limiting، Zod validation، App Check، certificate pinning
Testing: Unit (Jest) + Integration (Auth/Sell/Search/Message flows) + E2E (Detox/Maestro)
Accessibility: accessibilityLabel على كل عنصر، contrast ≥ 4.5:1، VoiceOver/TalkBack
Navigation Audit: إصلاح 5 مسارات مكسورة من PR audit
Phase 7: الإطلاق (Launch)
يعتمد على إتمام Phase 1-6

Google Play
Screenshots (5 شاشات) + Feature Graphic + وصف BG/EN
Privacy Policy + Data Safety Form + Content Rating
eas build --platform android --profile production
Internal → Closed Beta → Open Beta → Production
Apple App Store
Screenshots (3 أحجام) + App Review compliance
TestFlight → App Review → Release
Post-Launch
Sentry + Firebase Analytics monitoring
A/B testing عبر feature flags (موجود في Firestore)
ASO: keywords، ratings prompt (useAppReview.ts موجود)
الملفات الرئيسية المتأثرة
تعديل ملفات موجودة:

theme.ts — توسيع design tokens
CarCard.tsx — carousel + badges + swipe
AdvancedSearchModal.tsx — sliders + live count + presets
mobile_new/app/(tabs)/profile.tsx/profile.tsx) — cover photo + gauge + charts
mobile_new/app/(tabs)/search.tsx/search.tsx) — quick filters + map
mobile_new/app/(tabs)/messages.tsx/messages.tsx) — typing + voice
mobile_new/app/(tabs)/index.tsx/index.tsx) — dynamic hero + trending
mobile_new/app/car/[id].tsx — gallery + TCO + sticky header
DraftService.ts — cross-device
MessagingService.ts — typing + voice
ملفات جديدة:

TcoCalculatorService.ts — حاسبة التكلفة البلغارية
FastSellService.ts — مزادات عكسية
NeuralFeedService.ts — خوارزمية التغذية
street-scanner.service.ts — كشف السيارات بالكاميرا
TrustShield.tsx — شارة الثقة
discover.tsx — شاشة Neural Feed
fast-sell.tsx — شاشة المزادات العكسية
التحقق (Verification)
tsc --noEmit → 0 errors
jest → all suites pass
لا console.\* في الملفات المصدرية
Cross-Platform Test: أنشئ إعلان من الموبايل → أكمله من الويب (والعكس)
Messaging Test: أرسل رسالة من الويب → تظهر فوراً في الموبايل
Deep Link Test: koli.one/car/123/456 يفتح السيارة الصحيحة
Filter Parity: نفس الفلاتر على الويب والموبايل → نفس النتائج
Responsive Test: هاتف 5"، هاتف 6.7"، تابلت 10"
Offline Test: airplane mode → cached data + offline banner
Security Audit: لا Firebase UIDs في أي route أو log
القرارات
State: Zustand + Contexts (بدون Redux — لا حاجة)
Styling: styled-components/native (ثابت)
Navigation: Expo Router (ثابت)
AI Backend: Gemini Vision + DeepSeek (الموجود يغطي الحاجة)
Payment: Bank transfer + Stripe (نفس الويب)
AR: أولوية منخفضة — ميزة عرض
Neural Feed: section في Home أو "Discover" — ليس تبويب رئيسي سادس
Voice Messages: expo-av (dependency موجودة)
Shared Types: استخدام shared المشتركة (لا تكرار)
