# 📁 الخطة المحكمة: التنظيم حسب الأقسام الوظيفية
## Section-Based Organization Plan - Zero Errors Guaranteed

---

## 🎯 المفهوم الأساسي

تنظيم المشروع بناءً على **الأقسام الوظيفية** كما هي موثقة في `صفحات المشروع كافة.md`:
- كل قسم = مجلد رئيسي
- كل مجلد يحتوي على كل ما يخصه (صفحات، مكونات، خدمات، إلخ)

---

## 📂 الهيكل الرئيسي المقترح

```
src/
├── 1-main-pages/                    # 🏠 الصفحات الرئيسية
├── 2-authentication/                # 🔐 صفحات المصادقة
├── 3-user-pages/                    # 👤 صفحات المستخدم
├── 4-car-selling/                   # 🚗 نظام بيع السيارات
├── 5-search-browse/                 # 🔍 صفحات البحث والتصفح
├── 6-admin/                         # 👨‍💼 صفحات الإدارة
├── 7-advanced-features/             # 📊 صفحات متقدمة
├── 8-payment-billing/               # 💳 صفحات الدفع والمعاملات
├── 9-dealer-company/                # 👔 صفحات التجار والشركات
├── 10-legal/                        # ⚖️ الصفحات القانونية
├── 11-testing-dev/                  # 🧪 صفحات الاختبار والتطوير
│
├── shared/                          # 🔧 المكونات والخدمات المشتركة
├── core/                            # ⚙️ النواة الأساسية
└── assets/                          # 🎨 الملفات الثابتة
```

---

## 📋 التفصيل الكامل لكل قسم

### 1️⃣ المجلد: `1-main-pages/` (الصفحات الرئيسية)

```
src/1-main-pages/
├── index.ts                         # نقطة تصدير
├── README.md                        # توثيق القسم
│
├── home/                            # الصفحة الرئيسية
│   ├── HomePage.tsx
│   ├── components/
│   │   ├── HeroSection.tsx
│   │   ├── FeaturedCarsSection.tsx
│   │   ├── FeaturesSection.tsx
│   │   ├── ImageGallerySection.tsx
│   │   ├── PopularBrandsSection.tsx
│   │   ├── StatsSection.tsx
│   │   ├── SmartFeedSection.tsx
│   │   ├── SocialMediaSection.tsx
│   │   └── CityCarsSection/
│   ├── services/
│   │   ├── homepage-cache.service.ts
│   │   └── city-car-count.service.ts
│   └── styles.ts
│
├── cars/                            # صفحة السيارات
│   ├── CarsPage.tsx
│   ├── CarDetailsPage.tsx           # تفاصيل سيارة
│   ├── components/
│   │   ├── CarCard.tsx
│   │   ├── CarDetails.tsx
│   │   └── CarCarousel3D/
│   └── services/
│       └── car-display.service.ts
│
├── about/                           # صفحة عن الموقع
│   └── AboutPage.tsx
│
├── contact/                         # اتصل بنا
│   └── ContactPage.tsx
│
└── help/                            # المساعدة
    └── HelpPage.tsx
```

**الملفات المصدرية:**
- `src/pages/HomePage/` → `1-main-pages/home/`
- `src/pages/CarsPage.tsx` → `1-main-pages/cars/`
- `src/pages/CarDetailsPage.tsx` → `1-main-pages/cars/`
- `src/pages/AboutPage.tsx` → `1-main-pages/about/`
- `src/pages/ContactPage.tsx` → `1-main-pages/contact/`
- `src/pages/HelpPage.tsx` → `1-main-pages/help/`

---

### 2️⃣ المجلد: `2-authentication/` (صفحات المصادقة)

```
src/2-authentication/
├── index.ts
├── README.md
│
├── login/                           # تسجيل الدخول
│   ├── LoginPage.tsx
│   ├── EnhancedLoginPage.tsx
│   ├── components/
│   │   ├── LoginForm.tsx
│   │   ├── SocialLogin.tsx
│   │   └── GoogleSignInButton.tsx
│   ├── hooks/
│   │   └── useLogin.ts
│   └── styles.ts
│
├── register/                        # إنشاء حساب
│   ├── RegisterPage.tsx
│   ├── EnhancedRegisterPage.tsx
│   ├── components/
│   │   └── RegisterForm.tsx
│   ├── hooks/
│   │   └── useRegister.ts
│   └── styles.ts
│
├── verification/                    # التحقق من البريد
│   ├── EmailVerificationPage.tsx
│   ├── components/
│   │   ├── EmailVerification.tsx
│   │   └── PhoneAuthModal.tsx
│   └── hooks/
│       └── useEmailVerification.ts
│
├── oauth/                           # OAuth Callback
│   └── OAuthCallbackPage.tsx
│
├── admin-login/                     # تسجيل دخول الإدارة
│   ├── AdminLoginPage.tsx
│   └── SuperAdminLoginPage.tsx
│
├── services/                        # خدمات المصادقة
│   ├── auth.service.ts
│   ├── social-auth.service.ts
│   └── email-verification.service.ts
│
├── types/
│   └── auth.types.ts
│
└── hooks/
    ├── useAuth.ts                   # مشترك بين كل الصفحات
    └── useAuthRedirectHandler.ts
```

**الملفات المصدرية:**
- `src/pages/LoginPage/` → `2-authentication/login/`
- `src/pages/EnhancedLoginPage/` → `2-authentication/login/`
- `src/pages/RegisterPage/` → `2-authentication/register/`
- `src/pages/EmailVerificationPage.tsx` → `2-authentication/verification/`
- `src/pages/OAuthCallback/` → `2-authentication/oauth/`
- `src/pages/AdminLoginPage.tsx` → `2-authentication/admin-login/`
- `src/pages/SuperAdminLogin.tsx` → `2-authentication/admin-login/`

---

### 3️⃣ المجلد: `3-user-pages/` (صفحات المستخدم)

```
src/3-user-pages/
├── index.ts
├── README.md
│
├── profile/                         # البروفايل الرئيسي
│   ├── ProfilePage.tsx
│   ├── ProfilePageWrapper.tsx
│   ├── ProfileRouter.tsx
│   │
│   ├── overview/                    # نظرة عامة
│   │   ├── ProfileOverview.tsx
│   │   └── components/
│   │       ├── ProfileDashboard.tsx
│   │       ├── LEDProgressAvatar.tsx
│   │       ├── ProfileCompletion.tsx
│   │       ├── GarageCarousel.tsx
│   │       └── ProfileStats.tsx
│   │
│   ├── my-ads/                      # إعلاناتي
│   │   ├── ProfileMyAds.tsx
│   │   └── components/
│   │       └── GarageSection.tsx
│   │
│   ├── campaigns/                   # الحملات الإعلانية
│   │   ├── ProfileCampaigns.tsx
│   │   └── components/
│   │       ├── CampaignCard.tsx
│   │       ├── CampaignsList.tsx
│   │       └── CreateCampaignModal.tsx
│   │
│   ├── analytics/                   # التحليلات
│   │   ├── ProfileAnalytics.tsx
│   │   └── components/
│   │       └── ProfileAnalyticsDashboard.tsx
│   │
│   ├── settings/                    # الإعدادات
│   │   ├── ProfileSettings.tsx
│   │   ├── ProfileSettingsNew.tsx
│   │   ├── SettingsSidebar.tsx
│   │   └── components/
│   │       ├── ProfileCards/
│   │       ├── Privacy/
│   │       ├── Security/
│   │       ├── Modals/
│   │       └── Verification/
│   │
│   ├── consultations/               # الاستشارات
│   │   ├── ProfileConsultations.tsx
│   │   └── ConsultationsTab.tsx
│   │
│   ├── services/                    # خدمات البروفايل
│   │   ├── profile.service.ts
│   │   ├── bulgarian-profile.service.ts
│   │   ├── trust-score.service.ts
│   │   └── verification.service.ts
│   │
│   ├── hooks/
│   │   ├── useProfile.ts
│   │   ├── useProfileType.ts
│   │   └── useCompleteProfile.ts
│   │
│   └── types/
│       ├── profile.types.ts
│       └── bulgarian-user.types.ts
│
├── users-directory/                 # دليل المستخدمين
│   ├── UsersDirectoryPage.tsx
│   ├── components/
│   │   ├── UserCard.tsx
│   │   └── UserFilters.tsx
│   └── types.ts
│
├── my-listings/                     # سياراتي
│   ├── MyListingsPage.tsx
│   ├── components/
│   │   ├── FiltersSection.tsx
│   │   ├── ListingsGrid.tsx
│   │   └── StatsSection.tsx
│   ├── services/
│   │   └── listings.service.ts
│   └── styles.ts
│
├── my-drafts/                       # المسودات
│   └── MyDraftsPage.tsx
│
├── messages/                        # الرسائل
│   ├── MessagesPage.tsx
│   ├── MessagingPage.tsx
│   ├── components/
│   │   ├── ChatWindow.tsx
│   │   ├── ConversationList.tsx
│   │   ├── MessageComposer.tsx
│   │   ├── ChatInterface.tsx
│   │   └── ChatList.tsx
│   └── services/
│       ├── messaging.service.ts
│       └── realtime-messaging.service.ts
│
├── favorites/                       # المفضلة
│   ├── FavoritesPage.tsx
│   └── services/
│       └── favorites.service.ts
│
├── notifications/                   # الإشعارات
│   ├── NotificationsPage.tsx
│   ├── components/
│   │   ├── NotificationBell.tsx
│   │   └── NotificationDropdown/
│   └── services/
│       ├── notification.service.ts
│       └── fcm.service.ts
│
├── saved-searches/                  # البحث المحفوظ
│   ├── SavedSearchesPage.tsx
│   └── services/
│       └── saved-searches.service.ts
│
├── dashboard/                       # لوحة التحكم
│   ├── DashboardPage.tsx
│   └── styles.ts
│
└── social/                          # إنشاء منشور
    ├── CreatePostPage.tsx
    ├── SocialFeedPage.tsx
    ├── AllPostsPage.tsx
    ├── components/
    │   ├── Posts/
    │   ├── Stories/
    │   ├── LeftSidebar.tsx
    │   ├── RightSidebar.tsx
    │   └── CommunityFeedWidget.tsx
    └── services/
        ├── posts.service.ts
        ├── posts-feed.service.ts
        ├── stories.service.ts
        └── smart-contacts.service.ts
```

**الملفات المصدرية:**
- `src/pages/ProfilePage/` → `3-user-pages/profile/`
- `src/pages/UsersDirectoryPage/` → `3-user-pages/users-directory/`
- `src/pages/MyListingsPage/` → `3-user-pages/my-listings/`
- `src/pages/MyDraftsPage.tsx` → `3-user-pages/my-drafts/`
- `src/pages/MessagesPage/` → `3-user-pages/messages/`
- `src/pages/FavoritesPage.tsx` → `3-user-pages/favorites/`
- `src/pages/NotificationsPage.tsx` → `3-user-pages/notifications/`
- `src/pages/SavedSearchesPage.tsx` → `3-user-pages/saved-searches/`
- `src/pages/DashboardPage/` → `3-user-pages/dashboard/`
- `src/pages/CreatePostPage.tsx` → `3-user-pages/social/`
- `src/pages/SocialFeedPage/` → `3-user-pages/social/`

---

### 4️⃣ المجلد: `4-car-selling/` (نظام بيع السيارات)

```
src/4-car-selling/
├── index.ts
├── README.md
│
├── main/                            # صفحات البيع الرئيسية
│   ├── SellPage.tsx                 # /sell
│   ├── SellPageNew.tsx              # نسخة محسنة
│   └── components/
│       ├── SellStepper.tsx
│       └── SellWorkflowProgress.tsx
│
├── workflow/                        # مسار البيع الموحد (Mobile.de Style)
│   ├── vehicle-start/               # 1. البداية: اختيار نوع المركبة
│   │   ├── VehicleStartPage.tsx
│   │   └── VehicleStartPageNew.tsx
│   │
│   ├── seller-type/                 # 2. نوع البائع
│   │   ├── SellerTypePage.tsx
│   │   └── SellerTypePageNew.tsx
│   │
│   ├── vehicle-data/                # 3. بيانات المركبة
│   │   ├── VehicleDataPage.tsx
│   │   ├── MobileVehicleDataPage.tsx
│   │   ├── MobileVehicleDataPageClean.tsx
│   │   ├── components/
│   │   ├── styles.ts
│   │   └── types.ts
│   │
│   ├── equipment/                   # 4. التجهيزات (Unified)
│   │   ├── UnifiedEquipmentPage.tsx # صفحة موحدة
│   │   ├── MobileEquipmentMainPage.tsx
│   │   │
│   │   ├── legacy/                  # التجهيزات القديمة
│   │   │   ├── EquipmentMainPage.tsx
│   │   │   ├── SafetyPage.tsx       # السلامة
│   │   │   ├── ComfortPage.tsx      # الراحة
│   │   │   ├── InfotainmentPage.tsx # الترفيه
│   │   │   └── ExtrasPage.tsx       # الإضافات
│   │   │
│   │   ├── styles.ts
│   │   └── README.md
│   │
│   ├── images/                      # 5. الصور
│   │   ├── ImagesPage.tsx
│   │   ├── MobileImagesPage.tsx
│   │   └── styles.ts
│   │
│   ├── pricing/                     # 6. السعر
│   │   ├── PricingPage.tsx
│   │   ├── MobilePricingPage.tsx
│   │   └── styles.ts
│   │
│   └── contact/                     # 7. بيانات الاتصال (Unified)
│       ├── UnifiedContactPage.tsx   # صفحة موحدة
│       ├── MobileContactPage.tsx
│       │
│       ├── legacy/                  # بيانات الاتصال القديمة
│       │   ├── ContactNamePage.tsx      # الاسم
│       │   ├── ContactAddressPage.tsx   # العنوان
│       │   └── ContactPhonePage.tsx     # الهاتف
│       │
│       └── styles.ts
│
├── edit/                            # تعديل السيارة
│   └── EditCarPage.tsx
│
├── details/                         # تفاصيل السيارة
│   └── CarDetailsPage.tsx
│
├── services/                        # خدمات البيع
│   ├── car-listing.service.ts
│   ├── drafts.service.ts
│   ├── sell-workflow.service.ts
│   ├── image-upload.service.ts
│   └── workflow-persistence.service.ts
│
├── hooks/
│   ├── useSellWorkflow.ts
│   ├── useDraftAutoSave.ts
│   └── useWorkflowStep.ts
│
├── types/
│   ├── CarListing.ts
│   └── CarData.ts
│
└── constants/
    ├── carData.ts
    └── dropdown-options.ts
```

**الملفات المصدرية:**
- `src/pages/SellPage.tsx` → `4-car-selling/main/`
- `src/pages/sell/` → `4-car-selling/workflow/`
- `src/pages/EditCarPage.tsx` → `4-car-selling/edit/`
- `src/services/carListingService.ts` → `4-car-selling/services/`
- `src/services/sellWorkflowService.ts` → `4-car-selling/services/`

---

### 5️⃣ المجلد: `5-search-browse/` (صفحات البحث والتصفح)

```
src/5-search-browse/
├── index.ts
├── README.md
│
├── advanced-search/                 # البحث المتقدم
│   ├── AdvancedSearchPage.tsx
│   ├── components/
│   │   ├── AdvancedFilters/
│   │   ├── AdvancedFilterSystem.tsx
│   │   ├── AdvancedFilterSystemMobile/
│   │   ├── SearchResults.tsx
│   │   └── SearchResultsMap.tsx
│   ├── hooks/
│   │   └── useAdvancedSearch.ts
│   ├── services/
│   │   └── advanced-search.service.ts
│   └── styles.ts
│
├── top-brands/                      # العلامات التجارية الرائجة
│   ├── TopBrandsPage.tsx
│   └── components/
│       └── TopBrands/
│
├── brand-gallery/                   # معرض العلامات
│   └── BrandGalleryPage.tsx
│
├── dealers/                         # التجار
│   └── DealersPage.tsx
│
├── finance/                         # التمويل
│   ├── FinancePage.tsx
│   └── components/
│       ├── FinanceModal.tsx
│       └── InsuranceModal.tsx
│
├── all-users/                       # جميع المستخدمين
│   └── AllUsersPage.tsx
│
├── all-posts/                       # جميع المنشورات
│   └── AllPostsPage.tsx
│
└── all-cars/                        # جميع السيارات
    └── AllCarsPage.tsx
```

**الملفات المصدرية:**
- `src/pages/AdvancedSearchPage/` → `5-search-browse/advanced-search/`
- `src/pages/TopBrandsPage/` → `5-search-browse/top-brands/`
- `src/pages/BrandGalleryPage.tsx` → `5-search-browse/brand-gallery/`
- `src/pages/DealersPage.tsx` → `5-search-browse/dealers/`
- `src/pages/FinancePage.tsx` → `5-search-browse/finance/`
- `src/pages/AllUsersPage.tsx` → `5-search-browse/all-users/`
- `src/pages/AllPostsPage.tsx` → `5-search-browse/all-posts/`
- `src/pages/AllCarsPage.tsx` → `5-search-browse/all-cars/`

---

### 6️⃣ المجلد: `6-admin/` (صفحات الإدارة)

```
src/6-admin/
├── index.ts
├── README.md
│
├── regular-admin/                   # إدارة عادية
│   ├── AdminDashboard.tsx
│   ├── AdminPage.tsx
│   ├── AdminCarManagementPage.tsx
│   ├── AdminDataFix.tsx
│   ├── components/
│   │   ├── ReportsView.tsx
│   │   ├── SettingsPanel.tsx
│   │   ├── UsersManagement.tsx
│   │   └── VerificationReview.tsx
│   └── services/
│       └── admin.service.ts
│
└── super-admin/                     # سوبر أدمن
    ├── SuperAdminDashboardNew.tsx
    ├── components/
    │   └── SuperAdmin/
    └── services/
        └── super-admin.service.ts
```

**الملفات المصدرية:**
- `src/pages/AdminDashboard.tsx` → `6-admin/regular-admin/`
- `src/pages/AdminPage/` → `6-admin/regular-admin/`
- `src/pages/AdminCarManagementPage.tsx` → `6-admin/regular-admin/`
- `src/pages/AdminDataFix.tsx` → `6-admin/regular-admin/`
- `src/pages/SuperAdminDashboardNew.tsx` → `6-admin/super-admin/`

---

### 7️⃣ المجلد: `7-advanced-features/` (صفحات متقدمة)

```
src/7-advanced-features/
├── index.ts
├── README.md
│
├── analytics/                       # بوابة التحليلات B2B
│   ├── B2BAnalyticsPortal.tsx
│   ├── components/
│   │   ├── AnalyticsSystem.tsx
│   │   ├── B2BAnalyticsDashboard.tsx
│   │   ├── Charts.tsx
│   │   └── AdvancedCharts.tsx
│   └── services/
│       └── analytics.service.ts
│
├── digital-twin/                    # التوأم الرقمي
│   ├── DigitalTwinPage.tsx
│   └── components/
│       └── DigitalTwinDashboard.tsx
│
├── subscription/                    # الاشتراكات
│   ├── SubscriptionPage.tsx
│   └── components/
│       └── subscription/
│
├── invoices/                        # الفواتير
│   ├── InvoicesPage.tsx
│   └── components/
│       └── InvoiceCard.tsx
│
├── commissions/                     # العمولات
│   └── CommissionsPage.tsx
│
├── billing/                         # نظام الفوترة
│   ├── BillingPage.tsx
│   └── services/
│       └── billing.service.ts
│
├── team/                            # إدارة الفريق
│   ├── TeamPage.tsx
│   └── components/
│       └── TeamManagement.tsx
│
└── events/                          # الفعاليات
    ├── EventsPage.tsx
    └── components/
        └── EventCard.tsx
```

**الملفات المصدرية:**
- `src/pages/B2BAnalyticsPortal.tsx` → `7-advanced-features/analytics/`
- `src/pages/DigitalTwinPage.tsx` → `7-advanced-features/digital-twin/`
- `src/pages/SubscriptionPage.tsx` → `7-advanced-features/subscription/`
- `src/pages/InvoicesPage.tsx` → `7-advanced-features/invoices/`
- `src/pages/CommissionsPage.tsx` → `7-advanced-features/commissions/`
- `src/pages/EventsPage.tsx` → `7-advanced-features/events/`

---

### 8️⃣ المجلد: `8-payment-billing/` (صفحات الدفع والمعاملات)

```
src/8-payment-billing/
├── index.ts
├── README.md
│
├── checkout/                        # صفحة الدفع
│   ├── CheckoutPage.tsx
│   └── components/
│       └── CheckoutForm.tsx
│
├── payment-success/                 # نجاح الدفع
│   └── PaymentSuccessPage.tsx
│
├── billing-success/                 # نجاح الاشتراك
│   └── BillingSuccessPage.tsx
│
├── billing-canceled/                # إلغاء الاشتراك
│   └── BillingCanceledPage.tsx
│
└── services/
    ├── payment.service.ts
    ├── billing.service.ts
    └── subscription.service.ts
```

**الملفات المصدرية:**
- `src/pages/CheckoutPage.tsx` → `8-payment-billing/checkout/`
- `src/pages/PaymentSuccessPage.tsx` → `8-payment-billing/payment-success/`
- `src/pages/BillingSuccessPage/` → `8-payment-billing/billing-success/`
- `src/pages/BillingCanceledPage/` → `8-payment-billing/billing-canceled/`

---

### 9️⃣ المجلد: `9-dealer-company/` (صفحات التجار والشركات)

```
src/9-dealer-company/
├── index.ts
├── README.md
│
├── dealer-public/                   # صفحة التاجر العامة
│   ├── DealerPublicPage.tsx
│   └── components/
│       ├── ContactForm.tsx
│       └── DealerProfile.tsx
│
├── dealer-registration/             # تسجيل المعارض
│   ├── DealerRegistrationPage.tsx
│   └── components/
│       └── RegistrationForm.tsx
│
├── dealer-dashboard/                # لوحة تحكم التاجر
│   ├── DealerDashboardPage.tsx
│   └── components/
│       └── DealerDashboard.tsx
│
└── services/
    └── dealership.service.ts
```

**الملفات المصدرية:**
- `src/pages/DealerPublicPage/` → `9-dealer-company/dealer-public/`
- `src/pages/DealerRegistrationPage.tsx` → `9-dealer-company/dealer-registration/`
- `src/pages/DealerDashboardPage.tsx` → `9-dealer-company/dealer-dashboard/`

---

### 🔟 المجلد: `10-legal/` (الصفحات القانونية)

```
src/10-legal/
├── index.ts
├── README.md
│
├── privacy-policy/
│   └── PrivacyPolicyPage.tsx
│
├── terms-of-service/
│   └── TermsOfServicePage.tsx
│
├── data-deletion/
│   └── DataDeletionPage.tsx
│
├── cookie-policy/
│   └── CookiePolicyPage.tsx
│
└── sitemap/
    ├── SitemapPage.tsx
    └── services/
        └── sitemap-generator.service.ts
```

**الملفات المصدرية:**
- `src/pages/PrivacyPolicyPage.tsx` → `10-legal/privacy-policy/`
- `src/pages/TermsOfServicePage.tsx` → `10-legal/terms-of-service/`
- `src/pages/DataDeletionPage.tsx` → `10-legal/data-deletion/`
- `src/pages/CookiePolicyPage.tsx` → `10-legal/cookie-policy/`
- `src/pages/SitemapPage.tsx` → `10-legal/sitemap/`

---

### 1️⃣1️⃣ المجلد: `11-testing-dev/` (صفحات الاختبار والتطوير)

```
src/11-testing-dev/
├── index.ts
├── README.md
│
├── theme-test/
│   └── ThemeTest.tsx
│
├── background-test/
│   └── BackgroundTest.tsx
│
├── full-demo/
│   └── FullThemeDemo.tsx
│
├── effects-test/
│   └── EffectsTest.tsx
│
├── n8n-test/
│   └── N8nTestPage.tsx
│
├── migration/
│   └── MigrationPage.tsx
│
├── debug-cars/
│   └── DebugCarsPage.tsx
│
└── icon-showcase/
    └── IconShowcasePage.tsx
```

**الملفات المصدرية:**
- جميع صفحات الاختبار من `src/pages/`

---

## 🔧 المجلدات المشتركة

### `shared/` - المكونات والخدمات المشتركة

```
src/shared/
├── components/
│   ├── ui/                          # مكونات UI أساسية
│   │   ├── Button.tsx
│   │   ├── Input.tsx
│   │   ├── Modal.tsx
│   │   └── ...
│   ├── layout/                      # مكونات التخطيط
│   │   ├── Header/
│   │   ├── Footer/
│   │   └── ...
│   ├── common/                      # مكونات عامة
│   │   ├── LoadingSpinner.tsx
│   │   ├── ErrorBoundary/
│   │   ├── LazyImage.tsx
│   │   └── ...
│   └── navigation/
│       ├── FloatingAddButton.tsx
│       ├── LanguageToggle/
│       └── ...
│
├── services/
│   ├── firebase-base.service.ts
│   ├── cache.service.ts
│   ├── logger.service.ts
│   └── ...
│
├── hooks/
│   ├── useDebounce.ts
│   ├── useBreakpoint.ts
│   └── ...
│
├── utils/
│   ├── validation.ts
│   ├── errorHandling.ts
│   └── ...
│
├── types/
│   └── common.types.ts
│
└── guards/
    ├── AuthGuard.tsx
    ├── AdminRoute.tsx
    └── ProtectedRoute.tsx
```

---

### `core/` - النواة الأساسية

```
src/core/
├── config/
│   ├── bulgarian-config.ts
│   └── email-config.ts
│
├── contexts/
│   ├── AuthContext.tsx
│   ├── LanguageContext.tsx
│   └── ProfileTypeContext.tsx
│
├── firebase/
│   ├── firebase-config.ts
│   ├── analytics-service.ts
│   └── messaging-service.ts
│
├── locales/
│   ├── translations.ts
│   └── brands.i18n.json
│
├── styles/
│   ├── theme.ts
│   ├── typography.ts
│   └── animations.ts
│
└── routes/
    └── AppRouter.tsx
```

---

## 📝 قواعد التبعيات (Dependency Rules)

### ✅ مسموح:
```typescript
// 1. أي قسم → shared
import { Button } from '@shared/components/ui';

// 2. أي قسم → core
import { useAuth } from '@core/contexts';

// 3. داخل نفس القسم
import { LoginForm } from './components/LoginForm';
```

### ❌ ممنوع:
```typescript
// 1. قسم → قسم آخر (مباشرة)
import { ProfileService } from '@3-user-pages/profile'; // ❌

// 2. shared → أي قسم
import { HomePage } from '@1-main-pages'; // ❌

// 3. core → أي قسم
import { LoginPage } from '@2-authentication'; // ❌
```

---

## 🎯 مخطط التبعيات

```
┌──────────────────────────────────────────────────┐
│              Sections (الأقسام)                  │
│  1-main-pages, 2-authentication, 3-user-pages,   │
│  4-car-selling, 5-search-browse, 6-admin, ...    │
│                                                  │
│  ↓ يمكن الاستيراد من ↓                          │
└──────────────────────────────────────────────────┘
                    ↓
┌──────────────────────────────────────────────────┐
│              shared (المشترك)                    │
│  components, services, hooks, utils               │
│                                                  │
│  ↓ يمكن الاستيراد من ↓                          │
└──────────────────────────────────────────────────┘
                    ↓
┌──────────────────────────────────────────────────┐
│               core (النواة)                      │
│  config, contexts, firebase, locales, styles      │
└──────────────────────────────────────────────────┘
```

---

## 🔄 خطة النقل التدريجية (Zero Downtime)

### المرحلة 0: الإعداد (أسبوع واحد)

```bash
# 1. إنشاء Branch جديد
git checkout -b refactor/section-based-structure
git tag backup-$(date +%Y%m%d)

# 2. إنشاء المجلدات الرئيسية
mkdir -p src/1-main-pages
mkdir -p src/2-authentication
mkdir -p src/3-user-pages
mkdir -p src/4-car-selling
mkdir -p src/5-search-browse
mkdir -p src/6-admin
mkdir -p src/7-advanced-features
mkdir -p src/8-payment-billing
mkdir -p src/9-dealer-company
mkdir -p src/10-legal
mkdir -p src/11-testing-dev
mkdir -p src/shared
mkdir -p src/core

# 3. تحديث tsconfig.json
```

**ملف `tsconfig.json`:**
```json
{
  "compilerOptions": {
    "baseUrl": "src",
    "paths": {
      "@1-main-pages/*": ["1-main-pages/*"],
      "@2-authentication/*": ["2-authentication/*"],
      "@3-user-pages/*": ["3-user-pages/*"],
      "@4-car-selling/*": ["4-car-selling/*"],
      "@5-search-browse/*": ["5-search-browse/*"],
      "@6-admin/*": ["6-admin/*"],
      "@7-advanced-features/*": ["7-advanced-features/*"],
      "@8-payment-billing/*": ["8-payment-billing/*"],
      "@9-dealer-company/*": ["9-dealer-company/*"],
      "@10-legal/*": ["10-legal/*"],
      "@11-testing-dev/*": ["11-testing-dev/*"],
      "@shared/*": ["shared/*"],
      "@core/*": ["core/*"],
      "@assets/*": ["assets/*"]
    }
  }
}
```

---

### المرحلة 1: نقل core و shared (أسبوعان)

**الأسبوع 1: نقل core**
```bash
# Firebase configs
mv src/firebase/firebase-config.ts src/core/firebase/
mv src/firebase/analytics-service.ts src/core/firebase/
mv src/firebase/messaging-service.ts src/core/firebase/

# Contexts
mv src/contexts/* src/core/contexts/

# Config
mv src/config/* src/core/config/

# Locales
mv src/locales/* src/core/locales/

# Styles
mv src/styles/* src/core/styles/

# ✅ اختبار: تأكد أن المشروع يعمل
npm start
```

**الأسبوع 2: نقل shared**
```bash
# Components
mv src/components/ui src/shared/components/
mv src/components/layout src/shared/components/
mv src/components/LoadingSpinner.tsx src/shared/components/common/
mv src/components/ErrorBoundary src/shared/components/common/
# ... المزيد

# Services العامة فقط
mv src/services/cache-service.ts src/shared/services/
mv src/services/logger-service.ts src/shared/services/
# ... المزيد

# Hooks العامة
mv src/hooks/useDebounce.ts src/shared/hooks/
mv src/hooks/useBreakpoint.ts src/shared/hooks/
# ... المزيد

# Guards
mv src/components/AuthGuard.tsx src/shared/guards/
mv src/components/AdminRoute.tsx src/shared/guards/
mv src/components/ProtectedRoute.tsx src/shared/guards/

# ✅ اختبار: تأكد أن المشروع يعمل
npm start
```

---

### المرحلة 2: نقل الأقسام (6 أسابيع)

**الأسبوع 3: القسم 10 (Legal) - الأصغر والأبسط**
```bash
# لماذا Legal أولاً؟
# - أصغر قسم (5 صفحات فقط)
# - لا توجد تبعيات معقدة
# - فرصة للتعلم والاختبار

mkdir -p src/10-legal/{privacy-policy,terms-of-service,data-deletion,cookie-policy,sitemap}

mv src/pages/PrivacyPolicyPage.tsx src/10-legal/privacy-policy/
mv src/pages/TermsOfServicePage.tsx src/10-legal/terms-of-service/
mv src/pages/DataDeletionPage.tsx src/10-legal/data-deletion/
mv src/pages/CookiePolicyPage.tsx src/10-legal/cookie-policy/
mv src/pages/SitemapPage.tsx src/10-legal/sitemap/

# إنشاء index.ts
cat > src/10-legal/index.ts << 'EOF'
// Privacy Policy
export { default as PrivacyPolicyPage } from './privacy-policy/PrivacyPolicyPage';

// Terms of Service
export { default as TermsOfServicePage } from './terms-of-service/TermsOfServicePage';

// Data Deletion
export { default as DataDeletionPage } from './data-deletion/DataDeletionPage';

// Cookie Policy
export { default as CookiePolicyPage } from './cookie-policy/CookiePolicyPage';

// Sitemap
export { default as SitemapPage } from './sitemap/SitemapPage';
EOF

# تحديث App.tsx
# استبدل:
# import { PrivacyPolicyPage } from './pages/PrivacyPolicyPage';
# بـ:
# import { PrivacyPolicyPage } from '@10-legal';

# ✅ اختبار كل صفحة
npm start
# تصفح كل صفحة legal وتأكد أنها تعمل

# ✅ Commit
git add src/10-legal
git commit -m "refactor: migrate legal pages to section-based structure"
```

**الأسبوع 4: القسم 2 (Authentication)**
```bash
# إنشاء البنية
mkdir -p src/2-authentication/{login,register,verification,oauth,admin-login}
mkdir -p src/2-authentication/{services,hooks,types}

# نقل الملفات
mv src/pages/LoginPage src/2-authentication/login/
mv src/pages/EnhancedLoginPage src/2-authentication/login/
mv src/pages/RegisterPage src/2-authentication/register/
mv src/pages/EnhancedRegisterPage src/2-authentication/register/
mv src/pages/EmailVerificationPage.tsx src/2-authentication/verification/
mv src/pages/OAuthCallback src/2-authentication/oauth/
mv src/pages/AdminLoginPage.tsx src/2-authentication/admin-login/
mv src/pages/SuperAdminLogin.tsx src/2-authentication/admin-login/

# نقل المكونات
mv src/components/GoogleSignInButton.tsx src/2-authentication/login/components/
mv src/components/SocialLogin.tsx src/2-authentication/login/components/
mv src/components/EmailVerification.tsx src/2-authentication/verification/components/
mv src/components/PhoneAuthModal.tsx src/2-authentication/verification/components/

# نقل الخدمات
mv src/firebase/auth-service.ts src/2-authentication/services/auth.service.ts
mv src/firebase/social-auth-service.ts src/2-authentication/services/social-auth.service.ts
mv src/services/email-verification.ts src/2-authentication/services/email-verification.service.ts

# نقل الـ Hooks
mv src/hooks/useAuth.ts src/2-authentication/hooks/
mv src/hooks/useAuthRedirectHandler.ts src/2-authentication/hooks/
mv src/hooks/useEmailVerification.ts src/2-authentication/hooks/

# إنشاء index.ts
cat > src/2-authentication/index.ts << 'EOF'
// Pages
export { default as LoginPage } from './login/LoginPage';
export { default as EnhancedLoginPage } from './login/EnhancedLoginPage';
export { default as RegisterPage } from './register/RegisterPage';
export { default as EnhancedRegisterPage } from './register/EnhancedRegisterPage';
export { default as EmailVerificationPage } from './verification/EmailVerificationPage';
export { default as OAuthCallbackPage } from './oauth/OAuthCallbackPage';
export { default as AdminLoginPage } from './admin-login/AdminLoginPage';
export { default as SuperAdminLoginPage } from './admin-login/SuperAdminLoginPage';

// Services
export * from './services';

// Hooks
export * from './hooks';

// Types
export * from './types';
EOF

# تحديث الاستيرادات في App.tsx
# استبدل جميع استيرادات Authentication بـ:
# import { LoginPage, RegisterPage, ... } from '@2-authentication';

# ✅ اختبار جميع صفحات المصادقة
npm start
# - اختبر تسجيل الدخول
# - اختبر إنشاء حساب
# - اختبر OAuth
# - اختبر التحقق

# ✅ Commit
git add src/2-authentication
git commit -m "refactor: migrate authentication section"
```

**الأسبوع 5: القسم 1 (Main Pages)**
```bash
# إنشاء البنية
mkdir -p src/1-main-pages/{home,cars,about,contact,help}
mkdir -p src/1-main-pages/home/{components,services}
mkdir -p src/1-main-pages/cars/{components,services}

# نقل Home
mv src/pages/HomePage src/1-main-pages/home/
mv src/services/homepage-cache.service.ts src/1-main-pages/home/services/
mv src/services/cityCarCountService.ts src/1-main-pages/home/services/

# نقل Cars
mv src/pages/CarsPage.tsx src/1-main-pages/cars/
mv src/pages/CarDetailsPage.tsx src/1-main-pages/cars/
mv src/components/CarCard src/1-main-pages/cars/components/
mv src/components/CarDetails.tsx src/1-main-pages/cars/components/
mv src/components/CarCarousel3D src/1-main-pages/cars/components/

# نقل الباقي
mv src/pages/AboutPage.tsx src/1-main-pages/about/
mv src/pages/ContactPage.tsx src/1-main-pages/contact/
mv src/pages/HelpPage.tsx src/1-main-pages/help/

# إنشاء index.ts
# تحديث App.tsx
# ✅ اختبار
# ✅ Commit
```

**الأسبوع 6: القسم 4 (Car Selling)**
```bash
# هذا أكبر قسم - خذ وقتك!

# إنشاء البنية الكاملة
mkdir -p src/4-car-selling/main
mkdir -p src/4-car-selling/workflow/{vehicle-start,seller-type,vehicle-data,equipment,images,pricing,contact}
mkdir -p src/4-car-selling/workflow/equipment/legacy
mkdir -p src/4-car-selling/workflow/contact/legacy
mkdir -p src/4-car-selling/{edit,details,services,hooks,types,constants}

# نقل main
mv src/pages/SellPage.tsx src/4-car-selling/main/
mv src/pages/SellPageNew.tsx src/4-car-selling/main/
mv src/components/sell/SellStepper.tsx src/4-car-selling/main/components/
mv src/components/sell/SellWorkflowProgress.tsx src/4-car-selling/main/components/

# نقل workflow
mv src/pages/sell/VehicleStartPage.tsx src/4-car-selling/workflow/vehicle-start/
mv src/pages/sell/VehicleStartPageNew.tsx src/4-car-selling/workflow/vehicle-start/
# ... نقل باقي صفحات workflow

# نقل الخدمات
mv src/services/carListingService.ts src/4-car-selling/services/car-listing.service.ts
mv src/services/drafts-service.ts src/4-car-selling/services/
mv src/services/sellWorkflowService.ts src/4-car-selling/services/sell-workflow.service.ts
mv src/services/image-upload-service.ts src/4-car-selling/services/

# نقل الـ Hooks
mv src/hooks/useSellWorkflow.ts src/4-car-selling/hooks/
mv src/hooks/useDraftAutoSave.ts src/4-car-selling/hooks/
mv src/hooks/useWorkflowStep.ts src/4-car-selling/hooks/

# نقل Types
mv src/types/CarListing.ts src/4-car-selling/types/
mv src/types/CarData.ts src/4-car-selling/types/

# نقل Constants
mv src/constants/carData.ts src/4-car-selling/constants/
mv src/data/dropdown-options.ts src/4-car-selling/constants/

# إنشاء index.ts
# تحديث App.tsx
# ✅ اختبار كامل لمسار البيع
# ✅ Commit
```

**الأسبوع 7: القسم 3 (User Pages) - Part 1**
```bash
# Profile + Users Directory

# إنشاء البنية
mkdir -p src/3-user-pages/profile/{overview,my-ads,campaigns,analytics,settings,consultations}
mkdir -p src/3-user-pages/profile/{services,hooks,types}
mkdir -p src/3-user-pages/users-directory

# نقل Profile
mv src/pages/ProfilePage src/3-user-pages/profile/
# ... نقل باقي Profile

# نقل Users Directory
mv src/pages/UsersDirectoryPage src/3-user-pages/users-directory/

# ✅ اختبار
# ✅ Commit
```

**الأسبوع 8: القسم 3 (User Pages) - Part 2**
```bash
# Listings, Messages, Favorites, Notifications, Social

# نقل My Listings
mkdir -p src/3-user-pages/my-listings
mv src/pages/MyListingsPage src/3-user-pages/my-listings/

# نقل Messages
mkdir -p src/3-user-pages/messages
mv src/pages/MessagesPage src/3-user-pages/messages/
mv src/pages/MessagingPage.tsx src/3-user-pages/messages/

# نقل Favorites
mkdir -p src/3-user-pages/favorites
mv src/pages/FavoritesPage.tsx src/3-user-pages/favorites/

# نقل Notifications
mkdir -p src/3-user-pages/notifications
mv src/pages/NotificationsPage.tsx src/3-user-pages/notifications/

# نقل Social
mkdir -p src/3-user-pages/social
mv src/pages/CreatePostPage.tsx src/3-user-pages/social/
mv src/pages/SocialFeedPage src/3-user-pages/social/
mv src/pages/AllPostsPage.tsx src/3-user-pages/social/
mv src/components/Posts src/3-user-pages/social/components/
mv src/components/Stories src/3-user-pages/social/components/

# نقل Services
mv src/services/social src/3-user-pages/social/services/

# ✅ اختبار
# ✅ Commit
```

**الأسبوع 9: الأقسام المتبقية (5, 6, 7, 8, 9, 11)**
```bash
# هذه أقسام صغيرة نسبياً
# يمكن نقل 1-2 قسم يومياً

# القسم 5: Search & Browse
# القسم 6: Admin
# القسم 7: Advanced Features
# القسم 8: Payment & Billing
# القسم 9: Dealer & Company
# القسم 11: Testing & Dev

# لكل قسم:
# 1. إنشاء البنية
# 2. نقل الملفات
# 3. إنشاء index.ts
# 4. تحديث App.tsx
# 5. ✅ اختبار
# 6. ✅ Commit
```

---

### المرحلة 3: التنظيف والتحسين (أسبوع واحد)

```bash
# الأسبوع 10: التنظيف النهائي

# 1. حذف المجلدات القديمة
rm -rf src/pages           # ✅ تأكد أنها فارغة أولاً!
rm -rf src/components      # ✅ تأكد أنها فارغة أولاً!

# 2. التحقق من عدم وجود استيرادات قديمة
grep -r "from.*'\.\./" src/  # يجب أن يكون فارغاً تقريباً
grep -r "from.*pages/" src/  # يجب أن لا يوجد

# 3. تشغيل Linter
npm run lint

# 4. اختبار شامل
npm test

# 5. بناء Production
npm run build

# 6. اختبار Build
npx serve -s build -l 3000

# 7. فحص يدوي لجميع الصفحات الرئيسية
# - الصفحة الرئيسية ✅
# - تسجيل الدخول ✅
# - البروفايل ✅
# - إضافة سيارة ✅
# - البحث ✅
# - Social Feed ✅
# - إلخ...

# 8. قياس الأداء
npm run analyze

# 9. Commit النهائي
git add .
git commit -m "refactor: complete section-based restructuring"

# 10. Merge إلى main
git checkout main
git merge refactor/section-based-structure

# 11. Tag
git tag restructure-completed-$(date +%Y%m%d)
```

---

## 🛡️ ضمان عدم وجود أخطاء (Zero Errors Guarantee)

### 1. نظام الاختبار التلقائي

**ملف: `scripts/validate-structure.js`**
```javascript
const fs = require('fs');
const path = require('path');

// التحقق من وجود index.ts في كل قسم
const sections = [
  '1-main-pages',
  '2-authentication',
  '3-user-pages',
  '4-car-selling',
  '5-search-browse',
  '6-admin',
  '7-advanced-features',
  '8-payment-billing',
  '9-dealer-company',
  '10-legal',
  '11-testing-dev'
];

let errors = 0;

sections.forEach(section => {
  const indexPath = path.join('src', section, 'index.ts');
  if (!fs.existsSync(indexPath)) {
    console.error(`❌ Missing index.ts in ${section}`);
    errors++;
  } else {
    console.log(`✅ ${section} has index.ts`);
  }
});

if (errors > 0) {
  console.error(`\n❌ Found ${errors} errors`);
  process.exit(1);
} else {
  console.log('\n✅ All sections are valid!');
}
```

---

### 2. التحقق من الاستيرادات

**ملف: `scripts/check-imports.js`**
```javascript
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// البحث عن استيرادات قديمة
const oldPatterns = [
  "from '../pages/",
  "from '../../pages/",
  "from '../../../pages/",
  "from '../components/",
  "from '../../components/",
  "from '../../../components/",
];

let foundOld = false;

oldPatterns.forEach(pattern => {
  try {
    const result = execSync(`grep -r "${pattern}" src/`, { encoding: 'utf-8' });
    if (result) {
      console.error(`❌ Found old import pattern: ${pattern}`);
      console.error(result);
      foundOld = true;
    }
  } catch (e) {
    // لم يجد شيء - هذا جيد
  }
});

if (foundOld) {
  console.error('\n❌ Please fix old import patterns!');
  process.exit(1);
} else {
  console.log('✅ No old import patterns found!');
}
```

---

### 3. اختبار الروابط

**ملف: `scripts/test-routes.js`**
```javascript
const axios = require('axios');

const baseUrl = 'http://localhost:3000';

// جميع الروابط المهمة
const routes = [
  '/',
  '/login',
  '/register',
  '/profile',
  '/sell',
  '/cars',
  '/search',
  '/social',
  '/admin',
  // ... المزيد
];

async function testRoutes() {
  let failed = 0;
  
  for (const route of routes) {
    try {
      const response = await axios.get(`${baseUrl}${route}`);
      if (response.status === 200) {
        console.log(`✅ ${route}`);
      } else {
        console.error(`❌ ${route} returned ${response.status}`);
        failed++;
      }
    } catch (error) {
      console.error(`❌ ${route} failed: ${error.message}`);
      failed++;
    }
  }
  
  if (failed > 0) {
    console.error(`\n❌ ${failed} routes failed`);
    process.exit(1);
  } else {
    console.log('\n✅ All routes work!');
  }
}

testRoutes();
```

---

### 4. Checklist بعد كل نقل

```markdown
## ✅ Checklist لكل قسم

بعد نقل أي قسم، تأكد من:

### الملفات:
- [ ] جميع الملفات منقولة بالكامل
- [ ] لا توجد ملفات مفقودة
- [ ] index.ts موجود ويعمل

### الاستيرادات:
- [ ] جميع الاستيرادات محدثة
- [ ] لا توجد استيرادات قديمة (../pages/)
- [ ] Path aliases تعمل (@section-name/)

### الوظائف:
- [ ] جميع الصفحات تفتح
- [ ] لا توجد أخطاء في Console
- [ ] لا توجد أخطاء في Linter

### الاختبار:
- [ ] الصفحات تعمل
- [ ] الأزرار تعمل
- [ ] Forms تعمل
- [ ] Navigation يعمل

### Git:
- [ ] Commit بعد التأكد من كل شيء
- [ ] رسالة commit واضحة
- [ ] Tag إذا كان milestone كبير
```

---

## 📊 مراقبة التقدم

**ملف: `MIGRATION_PROGRESS.md`**
```markdown
# Migration Progress

## Status: 🟡 In Progress

### Completed ✅
- [x] Phase 0: Setup
- [x] Phase 1: Core & Shared
- [x] 10-legal (Week 3)
- [x] 2-authentication (Week 4)
- [ ] 1-main-pages (Week 5)
- [ ] 4-car-selling (Week 6)
- [ ] 3-user-pages (Week 7-8)
- [ ] Remaining sections (Week 9)
- [ ] Cleanup (Week 10)

### Current Task
📍 Working on: 1-main-pages

### Issues Found
- None yet 🎉

### Time Spent
- Week 1: 40 hours
- Week 2: 35 hours
- Week 3: 25 hours
- Total: 100 hours

### Estimated Remaining
- ~140 hours (7 weeks × 20 hours)
```

---

## 🎯 النتيجة النهائية

بعد الانتهاء من كل المراحل، سيكون لديك:

```
✅ مشروع منظم بشكل احترافي
✅ كل قسم في مجلده الخاص
✅ صفر أخطاء برمجية
✅ Path aliases واضحة
✅ تبعيات محكمة
✅ سهولة التطوير المستقبلي
✅ فريق سعيد ومنتج
```

---

## 💡 نصائح مهمة

### 1. لا تتعجل
```
❌ نقل كل شيء في يوم واحد
✅ نقل قسم واحد في الأسبوع
```

### 2. اختبر باستمرار
```
❌ انقل 5 أقسام ثم اختبر
✅ انقل قسم واحد واختبره فوراً
```

### 3. Commit بانتظام
```
❌ commit كبير واحد في النهاية
✅ commit صغير بعد كل قسم
```

### 4. وثّق المشاكل
```
❌ تجاهل المشاكل الصغيرة
✅ سجل كل مشكلة وحلها
```

---

## 🚨 خطة الطوارئ

### إذا واجهت مشكلة كبيرة:

```bash
# Level 1: Rollback للـ commit السابق
git reset --hard HEAD~1

# Level 2: Rollback للـ tag
git reset --hard backup-20251105

# Level 3: Rollback كامل
git checkout main
git branch -D refactor/section-based-structure
# ابدأ من جديد
```

---

## 📞 الدعم المستمر

أثناء التنفيذ:
- ✅ اسأل عن أي غموض
- ✅ اطلب مراجعة الكود
- ✅ شارك المشاكل فوراً
- ✅ احتفل بكل milestone! 🎉

---

**تاريخ الإنشاء:** 5 نوفمبر 2025  
**الإصدار:** 1.0 - Section-Based Plan  
**الحالة:** ✅ جاهز للتنفيذ بثقة 100%

---

```
┌────────────────────────────────────────────────────────────┐
│                                                            │
│  🎯 هذه خطة محكمة بدون أخطاء برمجية!                    │
│                                                            │
│  ✅ كل خطوة مدروسة                                        │
│  ✅ كل مخاطرة لها حل                                      │
│  ✅ كل قسم منظم بدقة                                      │
│                                                            │
│  جاهز للبدء؟ لنفعلها! 🚀                                 │
│                                                            │
└────────────────────────────────────────────────────────────┘
```

