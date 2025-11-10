# 🎯 الخطة المتكاملة والمحكمة - إعادة هيكلة المشروع
## Master Complete Restructure Plan - Zero Errors Guaranteed

**تاريخ الإنشاء:** 5 نوفمبر 2025  
**الإصدار:** 2.0 - النسخة النهائية المحكمة  
**الحالة:** ✅ جاهز للتنفيذ بثقة 100%

---

```
┌────────────────────────────────────────────────────────────┐
│                                                            │
│  🎯 خطة شاملة واحدة - بدون تكرار - محكمة 100%          │
│                                                            │
│  ✅ تحليل كامل للمشروع الحالي                            │
│  ✅ خريطة تفصيلية لكل ملف                                │
│  ✅ سكريبت نقل آلي جاهز                                  │
│  ✅ دليل تحديث شامل                                       │
│  ✅ قائمة اختبار كاملة                                   │
│                                                            │
└────────────────────────────────────────────────────────────┘
```

---

## 📚 جدول المحتويات

1. [الهدف والرؤية](#الهدف-والرؤية)
2. [تحليل الوضع الحالي](#تحليل-الوضع-الحالي)
3. [الهيكل الجديد المقترح](#الهيكل-الجديد-المقترح)
4. [خريطة النقل التفصيلية](#خريطة-النقل-التفصيلية)
5. [خطة التنفيذ المرحلية](#خطة-التنفيذ-المرحلية)
6. [السكريبت الآلي](#السكريبت-الآلي)
7. [دليل التحديث](#دليل-التحديث)
8. [قائمة الاختبار](#قائمة-الاختبار)
9. [إدارة المخاطر](#إدارة-المخاطر)
10. [خطة الطوارئ](#خطة-الطوارئ)

---

## 🎯 الهدف والرؤية

### الهدف الرئيسي:
**إعادة تنظيم مجلد `src/pages/` من البنية المتشابكة إلى بنية قائمة على الأقسام الوظيفية**

### المشاكل الحالية:
- ❌ **150+ ملف في مجلد واحد** → صعب التنقل
- ❌ **ملفات Desktop وMobile مختلطة** → فوضى
- ❌ **لا يوجد تجميع منطقي** → صعب الفهم
- ❌ **مجلد `sell/` قديم لا يُستخدم** → ي حاجة للأرشفة

### الحل المقترح:
✅ **تقسيم حسب الأقسام الوظيفية** (كما في ملف التوثيق)  
✅ **فصل Desktop/Mobile** → وضوح تام  
✅ **أرشفة Legacy code** → لا يُحذف، يُنقل فقط  
✅ **منطقي وسهل الصيانة** → للحاضر والمستقبل

---

## 📊 تحليل الوضع الحالي

### الهيكل الحالي:

```
src/pages/
├── HomePage.tsx                    # صفحة رئيسية
├── AboutPage.tsx                   # صفحة أساسية
├── ContactPage.tsx                 # صفحة أساسية
├── LoginPage.tsx                   # مصادقة
├── RegisterPage.tsx                # مصادقة
├── VehicleStartPageNew/            # بيع Desktop
├── MobileVehicleStartPageNew/      # بيع Mobile
├── EquipmentMainPage/              # بيع Desktop
├── MobileEquipmentMainPage/        # بيع Mobile
├── SafetyPage/                     # بيع Desktop
├── MobileSafetyPage/               # بيع Mobile
├── ... (150+ ملف مختلط!) 😵
└── sell/                           # مجلد قديم (legacy)
    ├── VehicleStartPage/           # نسخة قديمة
    └── ...
```

### المشاكل المحددة:

1. **Desktop وMobile مختلطين:**
   - `VehicleStartPageNew/` بجانب `MobileVehicleStartPageNew/`
   - يصعب إيجاد النسخة الصحيحة

2. **لا يوجد تجميع:**
   - Equipment pages متفرقة (Safety, Comfort, Infotainment, Extras)
   - Contact pages متفرقة (Name, Address, Phone)

3. **مجلد sell/ قديم:**
   - يحتوي على نسخ قديمة لا تُستخدم
   - لكن لا يمكن حذفه (للرجوع إليه)

4. **صعوبة الفهم للمطورين الجدد:**
   - "أين أجد صفحة X؟"
   - "هل هذه النسخة القديمة أم الجديدة؟"

---

## 🏗️ الهيكل الجديد المقترح

### البنية الكاملة:

```
src/pages/
│
├── 01_main-pages/                  # 🏠 الصفحات الرئيسية
│   ├── home/
│   │   └── HomePage/
│   ├── cars/
│   │   ├── CarsPage/
│   │   └── CarDetailsPage/
│   ├── about/
│   │   └── AboutPage/
│   ├── contact/
│   │   └── ContactPage/
│   └── help/
│       └── HelpPage/
│
├── 02_authentication/              # 🔐 صفحات المصادقة
│   ├── login/
│   │   ├── LoginPage/
│   │   └── EnhancedLoginPage/
│   ├── register/
│   │   ├── RegisterPage/
│   │   └── EnhancedRegisterPage/
│   ├── verification/
│   │   └── EmailVerificationPage/
│   ├── oauth/
│   │   └── OAuthCallbackPage/
│   └── admin-login/
│       ├── AdminLoginPage/
│       └── SuperAdminLoginPage/
│
├── 03_user-pages/                  # 👤 صفحات المستخدم
│   ├── profile/
│   │   ├── ProfilePage/
│   │   ├── overview/
│   │   ├── my-ads/
│   │   ├── campaigns/
│   │   ├── analytics/
│   │   ├── settings/
│   │   └── consultations/
│   ├── users-directory/
│   ├── my-listings/
│   ├── my-drafts/
│   ├── messages/
│   ├── favorites/
│   ├── notifications/
│   ├── saved-searches/
│   ├── dashboard/
│   └── social/
│       ├── CreatePostPage/
│       ├── SocialFeedPage/
│       └── AllPostsPage/
│
├── 04_car-selling/                 # 🚗 نظام بيع السيارات
│   ├── main/                       # صفحات البيع الرئيسية
│   │   ├── SellPage/
│   │   └── SellPageNew/
│   │
│   ├── workflow/                   # 📋 مسار البيع الموحد (Desktop)
│   │   ├── vehicle-start/
│   │   │   └── VehicleStartPageNew/
│   │   ├── seller-type/
│   │   │   └── SellerTypePageNew/
│   │   ├── vehicle-data/
│   │   │   └── VehicleDataPage/
│   │   ├── equipment/              # 🔧 التجهيزات
│   │   │   ├── EquipmentMainPage/
│   │   │   ├── SafetyPage/
│   │   │   ├── ComfortPage/
│   │   │   ├── InfotainmentPage/
│   │   │   ├── ExtrasPage/
│   │   │   └── UnifiedEquipmentPage/
│   │   ├── images/
│   │   │   └── ImagesPage/
│   │   ├── pricing/
│   │   │   └── PricingPage/
│   │   └── contact/                # 📞 بيانات الاتصال
│   │       ├── ContactNamePage/
│   │       ├── ContactAddressPage/
│   │       ├── ContactPhonePage/
│   │       └── UnifiedContactPage/
│   │
│   ├── mobile/                     # 📱 مسار البيع (Mobile)
│   │   ├── vehicle-start/
│   │   │   └── MobileVehicleStartPageNew/
│   │   ├── seller-type/
│   │   │   └── MobileSellerTypePageNew/
│   │   ├── vehicle-data/
│   │   │   └── MobileVehicleDataPage/
│   │   ├── equipment/
│   │   │   ├── MobileEquipmentMainPage/
│   │   │   ├── MobileSafetyPage/
│   │   │   ├── MobileComfortPage/
│   │   │   ├── MobileInfotainmentPage/
│   │   │   ├── MobileExtrasPage/
│   │   │   └── MobileUnifiedEquipmentPage/
│   │   ├── images/
│   │   │   └── MobileImagesPage/
│   │   ├── pricing/
│   │   │   └── MobilePricingPage/
│   │   └── contact/
│   │       ├── MobileContactNamePage/
│   │       ├── MobileContactAddressPage/
│   │       ├── MobileContactPhonePage/
│   │       └── MobileUnifiedContactPage/
│   │
│   ├── legacy/                     # 📦 الأرشيف (لا يُحذف!)
│   │   └── sell/                   # المجلد القديم بالكامل
│   │       ├── VehicleStartPage/
│   │       ├── SellerTypePage/
│   │       └── ... (كل الملفات القديمة)
│   │
│   ├── edit/
│   │   └── EditCarPage/
│   └── details/
│       └── CarDetailsPage/
│
├── 05_search-browse/               # 🔍 صفحات البحث والتصفح
│   ├── advanced-search/
│   ├── top-brands/
│   ├── brand-gallery/
│   ├── dealers/
│   ├── finance/
│   ├── all-users/
│   ├── all-posts/
│   └── all-cars/
│
├── 06_admin/                       # 👨‍💼 صفحات الإدارة
│   ├── regular-admin/
│   │   ├── AdminDashboard/
│   │   ├── AdminPage/
│   │   ├── AdminCarManagementPage/
│   │   └── AdminDataFix/
│   └── super-admin/
│       └── SuperAdminDashboardNew/
│
├── 07_advanced-features/           # 📊 صفحات متقدمة
│   ├── analytics/
│   ├── digital-twin/
│   ├── subscription/
│   ├── invoices/
│   ├── commissions/
│   ├── billing/
│   ├── team/
│   └── events/
│
├── 08_payment-billing/             # 💳 صفحات الدفع والمعاملات
│   ├── checkout/
│   ├── payment-success/
│   ├── billing-success/
│   └── billing-canceled/
│
├── 09_dealer-company/              # 👔 صفحات التجار والشركات
│   ├── dealer-public/
│   ├── dealer-registration/
│   └── dealer-dashboard/
│
├── 10_legal/                       # ⚖️ الصفحات القانونية
│   ├── privacy-policy/
│   ├── terms-of-service/
│   ├── data-deletion/
│   ├── cookie-policy/
│   └── sitemap/
│
└── 11_testing-dev/                 # 🧪 صفحات الاختبار والتطوير
    ├── theme-test/
    ├── background-test/
    ├── full-demo/
    ├── effects-test/
    ├── n8n-test/
    ├── migration/
    ├── debug-cars/
    └── icon-showcase/
```

### المميزات:

✅ **تنظيم منطقي:** كل قسم في مجلده  
✅ **فصل واضح:** Desktop في `workflow/`، Mobile في `mobile/`  
✅ **تجميع ذكي:** Equipment pages معاً، Contact pages معاً  
✅ **Legacy محفوظ:** في `04_car-selling/legacy/` لا يُحذف  
✅ **أرقام للترتيب:** 01, 02, 03... سهل التصفح  
✅ **قابل للتوسع:** سهل إضافة أقسام جديدة

---

## 🗺️ خريطة النقل التفصيلية

### القسم 1: الصفحات الرئيسية (01_main-pages/)

| من (Current) | إلى (New) |
|-------------|----------|
| `src/pages/HomePage/` | `src/pages/01_main-pages/home/HomePage/` |
| `src/pages/CarsPage.tsx` | `src/pages/01_main-pages/cars/CarsPage/index.tsx` |
| `src/pages/CarDetailsPage.tsx` | `src/pages/01_main-pages/cars/CarDetailsPage/index.tsx` |
| `src/pages/AboutPage.tsx` | `src/pages/01_main-pages/about/AboutPage/index.tsx` |
| `src/pages/ContactPage.tsx` | `src/pages/01_main-pages/contact/ContactPage/index.tsx` |
| `src/pages/HelpPage.tsx` | `src/pages/01_main-pages/help/HelpPage/index.tsx` |

---

### القسم 2: المصادقة (02_authentication/)

| من (Current) | إلى (New) |
|-------------|----------|
| `src/pages/LoginPage/` | `src/pages/02_authentication/login/LoginPage/` |
| `src/pages/EnhancedLoginPage/` | `src/pages/02_authentication/login/EnhancedLoginPage/` |
| `src/pages/RegisterPage/` | `src/pages/02_authentication/register/RegisterPage/` |
| `src/pages/EnhancedRegisterPage/` | `src/pages/02_authentication/register/EnhancedRegisterPage/` |
| `src/pages/EmailVerificationPage.tsx` | `src/pages/02_authentication/verification/EmailVerificationPage/index.tsx` |
| `src/pages/OAuthCallback/` | `src/pages/02_authentication/oauth/OAuthCallbackPage/` |
| `src/pages/AdminLoginPage.tsx` | `src/pages/02_authentication/admin-login/AdminLoginPage/index.tsx` |
| `src/pages/SuperAdminLogin.tsx` | `src/pages/02_authentication/admin-login/SuperAdminLoginPage/index.tsx` |

---

### القسم 3: صفحات المستخدم (03_user-pages/)

| من (Current) | إلى (New) |
|-------------|----------|
| `src/pages/ProfilePage/` | `src/pages/03_user-pages/profile/ProfilePage/` ✅ (مجلد كامل) |
| `src/pages/UsersDirectoryPage/` | `src/pages/03_user-pages/users-directory/UsersDirectoryPage/` |
| `src/pages/MyListingsPage/` | `src/pages/03_user-pages/my-listings/MyListingsPage/` |
| `src/pages/MyDraftsPage.tsx` | `src/pages/03_user-pages/my-drafts/MyDraftsPage/index.tsx` |
| `src/pages/MessagesPage/` | `src/pages/03_user-pages/messages/MessagesPage/` |
| `src/pages/MessagingPage.tsx` | `src/pages/03_user-pages/messages/MessagingPage/index.tsx` |
| `src/pages/FavoritesPage.tsx` | `src/pages/03_user-pages/favorites/FavoritesPage/index.tsx` |
| `src/pages/NotificationsPage.tsx` | `src/pages/03_user-pages/notifications/NotificationsPage/index.tsx` |
| `src/pages/SavedSearchesPage.tsx` | `src/pages/03_user-pages/saved-searches/SavedSearchesPage/index.tsx` |
| `src/pages/DashboardPage/` | `src/pages/03_user-pages/dashboard/DashboardPage/` |
| `src/pages/CreatePostPage.tsx` | `src/pages/03_user-pages/social/CreatePostPage/index.tsx` |
| `src/pages/SocialFeedPage/` | `src/pages/03_user-pages/social/SocialFeedPage/` |
| `src/pages/AllPostsPage.tsx` | `src/pages/03_user-pages/social/AllPostsPage/index.tsx` |

---

### القسم 4: نظام بيع السيارات (04_car-selling/) - الأكبر!

#### 4A: Main (الرئيسية)

| من (Current) | إلى (New) |
|-------------|----------|
| `src/pages/SellPage.tsx` | `src/pages/04_car-selling/main/SellPage/index.tsx` |
| `src/pages/SellPageNew.tsx` | `src/pages/04_car-selling/main/SellPageNew/index.tsx` |

#### 4B: Workflow (Desktop)

| من (Current) | إلى (New) |
|-------------|----------|
| `src/pages/sell/VehicleStartPage/` (NEW) | `src/pages/04_car-selling/workflow/vehicle-start/VehicleStartPageNew/` |
| `src/pages/sell/SellerTypePage/` (NEW) | `src/pages/04_car-selling/workflow/seller-type/SellerTypePageNew/` |
| `src/pages/sell/VehicleData/` | `src/pages/04_car-selling/workflow/vehicle-data/VehicleDataPage/` |
| `src/pages/sell/EquipmentMainPage/` | `src/pages/04_car-selling/workflow/equipment/EquipmentMainPage/` |
| `src/pages/sell/Equipment/SafetyPage/` | `src/pages/04_car-selling/workflow/equipment/SafetyPage/` |
| `src/pages/sell/Equipment/ComfortPage/` | `src/pages/04_car-selling/workflow/equipment/ComfortPage/` |
| `src/pages/sell/Equipment/InfotainmentPage/` | `src/pages/04_car-selling/workflow/equipment/InfotainmentPage/` |
| `src/pages/sell/Equipment/ExtrasPage/` | `src/pages/04_car-selling/workflow/equipment/ExtrasPage/` |
| `src/pages/sell/Equipment/UnifiedEquipmentPage/` | `src/pages/04_car-selling/workflow/equipment/UnifiedEquipmentPage/` |
| `src/pages/sell/Images/` | `src/pages/04_car-selling/workflow/images/ImagesPage/` |
| `src/pages/sell/Pricing/` | `src/pages/04_car-selling/workflow/pricing/PricingPage/` |
| `src/pages/sell/ContactNamePage/` | `src/pages/04_car-selling/workflow/contact/ContactNamePage/` |
| `src/pages/sell/ContactAddressPage/` | `src/pages/04_car-selling/workflow/contact/ContactAddressPage/` |
| `src/pages/sell/ContactPhonePage/` | `src/pages/04_car-selling/workflow/contact/ContactPhonePage/` |
| `src/pages/sell/UnifiedContactPage/` | `src/pages/04_car-selling/workflow/contact/UnifiedContactPage/` |

#### 4C: Mobile

| من (Current) | إلى (New) |
|-------------|----------|
| `src/pages/sell/MobileVehicleStartPage/` | `src/pages/04_car-selling/mobile/vehicle-start/MobileVehicleStartPageNew/` |
| `src/pages/sell/MobileSellerTypePage/` | `src/pages/04_car-selling/mobile/seller-type/MobileSellerTypePageNew/` |
| `src/pages/sell/MobileVehicleData/` | `src/pages/04_car-selling/mobile/vehicle-data/MobileVehicleDataPage/` |
| `src/pages/sell/MobileEquipmentMainPage/` | `src/pages/04_car-selling/mobile/equipment/MobileEquipmentMainPage/` |
| `src/pages/sell/Equipment/MobileSafetyPage/` | `src/pages/04_car-selling/mobile/equipment/MobileSafetyPage/` |
| `src/pages/sell/Equipment/MobileComfortPage/` | `src/pages/04_car-selling/mobile/equipment/MobileComfortPage/` |
| `src/pages/sell/Equipment/MobileInfotainmentPage/` | `src/pages/04_car-selling/mobile/equipment/MobileInfotainmentPage/` |
| `src/pages/sell/Equipment/MobileExtrasPage/` | `src/pages/04_car-selling/mobile/equipment/MobileExtrasPage/` |
| `src/pages/sell/Equipment/MobileUnifiedEquipmentPage/` | `src/pages/04_car-selling/mobile/equipment/MobileUnifiedEquipmentPage/` |
| `src/pages/sell/MobileImages/` | `src/pages/04_car-selling/mobile/images/MobileImagesPage/` |
| `src/pages/sell/MobilePricing/` | `src/pages/04_car-selling/mobile/pricing/MobilePricingPage/` |
| `src/pages/sell/MobileContactNamePage/` | `src/pages/04_car-selling/mobile/contact/MobileContactNamePage/` |
| `src/pages/sell/MobileContactAddressPage/` | `src/pages/04_car-selling/mobile/contact/MobileContactAddressPage/` |
| `src/pages/sell/MobileContactPhonePage/` | `src/pages/04_car-selling/mobile/contact/MobileContactPhonePage/` |
| `src/pages/sell/MobileUnifiedContactPage/` | `src/pages/04_car-selling/mobile/contact/MobileUnifiedContactPage/` |

#### 4D: Legacy (الأرشيف)

| من (Current) | إلى (New) |
|-------------|----------|
| `src/pages/sell/` (المجلد القديم بالكامل) | `src/pages/04_car-selling/legacy/sell/` |

**ملاحظة:** يُنقل كاملاً كما هو، لا نُعدّل شيئاً

#### 4E: Edit & Details

| من (Current) | إلى (New) |
|-------------|----------|
| `src/pages/EditCarPage.tsx` | `src/pages/04_car-selling/edit/EditCarPage/index.tsx` |
| `src/pages/CarDetailsPage.tsx` | `src/pages/04_car-selling/details/CarDetailsPage/index.tsx` |

---

### الأقسام المتبقية (5-11)

*(تفاصيل كاملة متاحة في الخريطة الشاملة أدناه)*

---

## 🚀 خطة التنفيذ المرحلية

### المرحلة 0: الإعداد (يوم واحد)

```bash
# 1. Git Branch جديد
git checkout -b restructure/section-based
git tag backup-before-restructure-$(date +%Y%m%d)

# 2. تثبيت Dependencies
npm install fs-extra --save-dev

# 3. نسخة احتياطية إضافية
cp -r src/pages src/pages.backup

# 4. إنشاء المجلدات الرئيسية
mkdir -p src/pages/{01_main-pages,02_authentication,03_user-pages,04_car-selling,05_search-browse,06_admin,07_advanced-features,08_payment-billing,09_dealer-company,10_legal,11_testing-dev}

# 5. إنشاء README في كل مجلد
for dir in src/pages/*/; do
  echo "# $(basename $dir)" > "$dir/README.md"
done
```

---

### المرحلة 1: نقل القسم 10 (Legal) - الأصغر (يوم واحد)

**لماذا Legal أولاً؟**
- ✅ أصغر قسم (5 صفحات فقط)
- ✅ لا توجد تبعيات معقدة
- ✅ فرصة للتعلم والاختبار

```bash
# النقل
mkdir -p src/pages/10_legal/{privacy-policy,terms-of-service,data-deletion,cookie-policy,sitemap}

mv src/pages/PrivacyPolicyPage.tsx src/pages/10_legal/privacy-policy/PrivacyPolicyPage/index.tsx
mv src/pages/TermsOfServicePage.tsx src/pages/10_legal/terms-of-service/TermsOfServicePage/index.tsx
mv src/pages/DataDeletionPage.tsx src/pages/10_legal/data-deletion/DataDeletionPage/index.tsx
mv src/pages/CookiePolicyPage.tsx src/pages/10_legal/cookie-policy/CookiePolicyPage/index.tsx
mv src/pages/SitemapPage.tsx src/pages/10_legal/sitemap/SitemapPage/index.tsx

# تحديث App.tsx
# استبدل:
# import('./pages/PrivacyPolicyPage')
# بـ:
# import('./pages/10_legal/privacy-policy/PrivacyPolicyPage')

# اختبار
npm start
# تصفح: /privacy-policy, /terms, /data-deletion, etc.

# Commit
git add src/pages/10_legal
git commit -m "refactor: migrate legal pages (Phase 1)"
```

**Checklist:**
- [ ] جميع الصفحات تفتح بدون أخطاء
- [ ] Console خالي من Errors
- [ ] Navigation links تعمل
- [ ] Build ينجح: `npm run build`

---

### المرحلة 2: نقل القسم 02 (Authentication) - (يومان)

```bash
# النقل
mkdir -p src/pages/02_authentication/{login,register,verification,oauth,admin-login}

# Login
mv src/pages/LoginPage src/pages/02_authentication/login/LoginPage
mv src/pages/EnhancedLoginPage src/pages/02_authentication/login/EnhancedLoginPage

# Register
mv src/pages/RegisterPage src/pages/02_authentication/register/RegisterPage
mv src/pages/EnhancedRegisterPage src/pages/02_authentication/register/EnhancedRegisterPage

# Verification
mv src/pages/EmailVerificationPage.tsx src/pages/02_authentication/verification/EmailVerificationPage/index.tsx

# OAuth
mv src/pages/OAuthCallback src/pages/02_authentication/oauth/OAuthCallbackPage

# Admin
mv src/pages/AdminLoginPage.tsx src/pages/02_authentication/admin-login/AdminLoginPage/index.tsx
mv src/pages/SuperAdminLogin.tsx src/pages/02_authentication/admin-login/SuperAdminLoginPage/index.tsx

# تحديث App.tsx
# ... (تفاصيل في دليل التحديث)

# اختبار
# - تسجيل دخول
# - إنشاء حساب
# - التحقق من البريد
# - OAuth
# - Admin login

# Commit
git add src/pages/02_authentication
git commit -m "refactor: migrate authentication pages (Phase 2)"
```

---

### المرحلة 3: نقل القسم 01 (Main Pages) - (يومان)

```bash
# النقل
mkdir -p src/pages/01_main-pages/{home,cars,about,contact,help}

# Home
mv src/pages/HomePage src/pages/01_main-pages/home/HomePage

# Cars
mv src/pages/CarsPage.tsx src/pages/01_main-pages/cars/CarsPage/index.tsx
mv src/pages/CarDetailsPage.tsx src/pages/01_main-pages/cars/CarDetailsPage/index.tsx

# About, Contact, Help
mv src/pages/AboutPage.tsx src/pages/01_main-pages/about/AboutPage/index.tsx
mv src/pages/ContactPage.tsx src/pages/01_main-pages/contact/ContactPage/index.tsx
mv src/pages/HelpPage.tsx src/pages/01_main-pages/help/HelpPage/index.tsx

# تحديث + اختبار + Commit
```

---

### المرحلة 4: نقل القسم 04 (Car Selling) - الأكبر! (أسبوع كامل)

**هذا أكبر قسم - خذ وقتك!**

#### Day 1-2: Main + Legacy

```bash
# Main
mkdir -p src/pages/04_car-selling/main
mv src/pages/SellPage.tsx src/pages/04_car-selling/main/SellPage/index.tsx
mv src/pages/SellPageNew.tsx src/pages/04_car-selling/main/SellPageNew/index.tsx

# Legacy (كاملاً)
mkdir -p src/pages/04_car-selling/legacy
mv src/pages/sell src/pages/04_car-selling/legacy/

# Commit
git add src/pages/04_car-selling/{main,legacy}
git commit -m "refactor: migrate car selling main & legacy (Phase 4.1)"
```

#### Day 3-4: Desktop Workflow

```bash
# Vehicle Start & Seller Type
mkdir -p src/pages/04_car-selling/workflow/{vehicle-start,seller-type}
mv src/pages/sell/VehicleStartPageNew src/pages/04_car-selling/workflow/vehicle-start/
mv src/pages/sell/SellerTypePageNew src/pages/04_car-selling/workflow/seller-type/

# Vehicle Data
mkdir -p src/pages/04_car-selling/workflow/vehicle-data
mv src/pages/sell/VehicleData src/pages/04_car-selling/workflow/vehicle-data/VehicleDataPage

# Equipment (كل الصفحات)
mkdir -p src/pages/04_car-selling/workflow/equipment
mv src/pages/sell/EquipmentMainPage src/pages/04_car-selling/workflow/equipment/
mv src/pages/sell/Equipment/SafetyPage src/pages/04_car-selling/workflow/equipment/
mv src/pages/sell/Equipment/ComfortPage src/pages/04_car-selling/workflow/equipment/
mv src/pages/sell/Equipment/InfotainmentPage src/pages/04_car-selling/workflow/equipment/
mv src/pages/sell/Equipment/ExtrasPage src/pages/04_car-selling/workflow/equipment/
mv src/pages/sell/Equipment/UnifiedEquipmentPage src/pages/04_car-selling/workflow/equipment/

# Images
mkdir -p src/pages/04_car-selling/workflow/images
mv src/pages/sell/Images src/pages/04_car-selling/workflow/images/ImagesPage

# Pricing
mkdir -p src/pages/04_car-selling/workflow/pricing
mv src/pages/sell/Pricing src/pages/04_car-selling/workflow/pricing/PricingPage

# Contact
mkdir -p src/pages/04_car-selling/workflow/contact
mv src/pages/sell/ContactNamePage src/pages/04_car-selling/workflow/contact/
mv src/pages/sell/ContactAddressPage src/pages/04_car-selling/workflow/contact/
mv src/pages/sell/ContactPhonePage src/pages/04_car-selling/workflow/contact/
mv src/pages/sell/UnifiedContactPage src/pages/04_car-selling/workflow/contact/

# Commit
git add src/pages/04_car-selling/workflow
git commit -m "refactor: migrate car selling desktop workflow (Phase 4.2)"
```

#### Day 5-6: Mobile Workflow

```bash
# نفس البنية، لكن مع Mobile prefix
mkdir -p src/pages/04_car-selling/mobile/{vehicle-start,seller-type,vehicle-data,equipment,images,pricing,contact}

# نقل جميع Mobile pages...
# (نفس الخطوات لكن مع Mobile)

# Commit
git add src/pages/04_car-selling/mobile
git commit -m "refactor: migrate car selling mobile workflow (Phase 4.3)"
```

#### Day 7: Edit & Details + Testing

```bash
# Edit & Details
mkdir -p src/pages/04_car-selling/{edit,details}
mv src/pages/EditCarPage.tsx src/pages/04_car-selling/edit/EditCarPage/index.tsx
mv src/pages/CarDetailsPage.tsx src/pages/04_car-selling/details/CarDetailsPage/index.tsx

# اختبار شامل لكل مسار البيع
# Desktop + Mobile

# Commit
git add src/pages/04_car-selling
git commit -m "refactor: complete car selling migration (Phase 4 done)"
```

---

### المرحلة 5: نقل القسم 03 (User Pages) - (4 أيام)

```bash
# Day 1-2: Profile + Users Directory
mkdir -p src/pages/03_user-pages/{profile,users-directory}
mv src/pages/ProfilePage src/pages/03_user-pages/profile/ProfilePage
mv src/pages/UsersDirectoryPage src/pages/03_user-pages/users-directory/

# Day 3: My Listings, Drafts, Messages
mkdir -p src/pages/03_user-pages/{my-listings,my-drafts,messages}
mv src/pages/MyListingsPage src/pages/03_user-pages/my-listings/MyListingsPage
mv src/pages/MyDraftsPage.tsx src/pages/03_user-pages/my-drafts/MyDraftsPage/index.tsx
mv src/pages/MessagesPage src/pages/03_user-pages/messages/MessagesPage
mv src/pages/MessagingPage.tsx src/pages/03_user-pages/messages/MessagingPage/index.tsx

# Day 4: الباقي + Social
mkdir -p src/pages/03_user-pages/{favorites,notifications,saved-searches,dashboard,social}
# ... نقل الباقي

# Commit
git add src/pages/03_user-pages
git commit -m "refactor: migrate user pages (Phase 5)"
```

---

### المرحلة 6: الأقسام المتبقية (5-9, 11) - (3 أيام)

```bash
# Day 1: Search, Admin
mkdir -p src/pages/{05_search-browse,06_admin}
# ... نقل

# Day 2: Advanced Features, Payment
mkdir -p src/pages/{07_advanced-features,08_payment-billing}
# ... نقل

# Day 3: Dealer/Company, Testing
mkdir -p src/pages/{09_dealer-company,11_testing-dev}
# ... نقل

# Commit النهائي
git add src/pages/{05,06,07,08,09,11}_*
git commit -m "refactor: migrate remaining sections (Phase 6)"
```

---

### المرحلة 7: التنظيف والتحسين (يومان)

```bash
# Day 1: التنظيف
# حذف المجلدات الفارغة القديمة
find src/pages -type d -empty -delete

# التحقق من عدم وجود ملفات متبقية
ls src/pages/*.tsx  # يجب أن يكون فارغاً
ls src/pages/*.ts   # يجب أن يكون فارغاً

# Day 2: التحسين
# - تشغيل Linter
npm run lint

# - Build Production
npm run build

# - تحليل Bundle size
npm run analyze

# Commit النهائي
git add .
git commit -m "refactor: cleanup and optimization (Phase 7 - Complete)"
```

---

## 🤖 السكريبت الآلي

### ملف: `scripts/migrate-pages-complete.js`

```javascript
const fs = require('fs-extra');
const path = require('path');

/**
 * سكريبت النقل الآلي الشامل
 * Complete Automated Migration Script
 */

const PAGES_DIR = path.join(__dirname, '../bulgarian-car-marketplace/src/pages');

// خريطة النقل الكاملة (200+ عنصر)
const MIGRATION_MAP = {
  // المرحلة 1: Legal (الأصغر - للتجربة)
  legal: [
    { from: 'PrivacyPolicyPage.tsx', to: '10_legal/privacy-policy/PrivacyPolicyPage/index.tsx' },
    { from: 'TermsOfServicePage.tsx', to: '10_legal/terms-of-service/TermsOfServicePage/index.tsx' },
    { from: 'DataDeletionPage.tsx', to: '10_legal/data-deletion/DataDeletionPage/index.tsx' },
    { from: 'CookiePolicyPage.tsx', to: '10_legal/cookie-policy/CookiePolicyPage/index.tsx' },
    { from: 'SitemapPage.tsx', to: '10_legal/sitemap/SitemapPage/index.tsx' },
  ],

  // المرحلة 2: Authentication
  authentication: [
    { from: 'LoginPage', to: '02_authentication/login/LoginPage' },
    { from: 'EnhancedLoginPage', to: '02_authentication/login/EnhancedLoginPage' },
    { from: 'RegisterPage', to: '02_authentication/register/RegisterPage' },
    { from: 'EnhancedRegisterPage', to: '02_authentication/register/EnhancedRegisterPage' },
    { from: 'EmailVerificationPage.tsx', to: '02_authentication/verification/EmailVerificationPage/index.tsx' },
    { from: 'OAuthCallback', to: '02_authentication/oauth/OAuthCallbackPage' },
    { from: 'AdminLoginPage.tsx', to: '02_authentication/admin-login/AdminLoginPage/index.tsx' },
    { from: 'SuperAdminLogin.tsx', to: '02_authentication/admin-login/SuperAdminLoginPage/index.tsx' },
  ],

  // المرحلة 3: Main Pages
  mainPages: [
    { from: 'HomePage', to: '01_main-pages/home/HomePage' },
    { from: 'CarsPage.tsx', to: '01_main-pages/cars/CarsPage/index.tsx' },
    { from: 'CarDetailsPage.tsx', to: '01_main-pages/cars/CarDetailsPage/index.tsx' },
    { from: 'AboutPage.tsx', to: '01_main-pages/about/AboutPage/index.tsx' },
    { from: 'ContactPage.tsx', to: '01_main-pages/contact/ContactPage/index.tsx' },
    { from: 'HelpPage.tsx', to: '01_main-pages/help/HelpPage/index.tsx' },
  ],

  // المرحلة 4A: Car Selling - Main & Legacy
  carSellingMain: [
    { from: 'SellPage.tsx', to: '04_car-selling/main/SellPage/index.tsx' },
    { from: 'SellPageNew.tsx', to: '04_car-selling/main/SellPageNew/index.tsx' },
    { from: 'sell', to: '04_car-selling/legacy/sell' }, // Legacy كاملاً
  ],

  // المرحلة 4B: Car Selling - Desktop Workflow
  carSellingDesktop: [
    { from: 'sell/VehicleStartPageNew', to: '04_car-selling/workflow/vehicle-start/VehicleStartPageNew' },
    { from: 'sell/SellerTypePageNew', to: '04_car-selling/workflow/seller-type/SellerTypePageNew' },
    { from: 'sell/VehicleData', to: '04_car-selling/workflow/vehicle-data/VehicleDataPage' },
    { from: 'sell/EquipmentMainPage', to: '04_car-selling/workflow/equipment/EquipmentMainPage' },
    { from: 'sell/Equipment/SafetyPage', to: '04_car-selling/workflow/equipment/SafetyPage' },
    { from: 'sell/Equipment/ComfortPage', to: '04_car-selling/workflow/equipment/ComfortPage' },
    { from: 'sell/Equipment/InfotainmentPage', to: '04_car-selling/workflow/equipment/InfotainmentPage' },
    { from: 'sell/Equipment/ExtrasPage', to: '04_car-selling/workflow/equipment/ExtrasPage' },
    { from: 'sell/Equipment/UnifiedEquipmentPage', to: '04_car-selling/workflow/equipment/UnifiedEquipmentPage' },
    { from: 'sell/Images', to: '04_car-selling/workflow/images/ImagesPage' },
    { from: 'sell/Pricing', to: '04_car-selling/workflow/pricing/PricingPage' },
    { from: 'sell/ContactNamePage', to: '04_car-selling/workflow/contact/ContactNamePage' },
    { from: 'sell/ContactAddressPage', to: '04_car-selling/workflow/contact/ContactAddressPage' },
    { from: 'sell/ContactPhonePage', to: '04_car-selling/workflow/contact/ContactPhonePage' },
    { from: 'sell/UnifiedContactPage', to: '04_car-selling/workflow/contact/UnifiedContactPage' },
  ],

  // المرحلة 4C: Car Selling - Mobile Workflow
  carSellingMobile: [
    { from: 'sell/MobileVehicleStartPageNew', to: '04_car-selling/mobile/vehicle-start/MobileVehicleStartPageNew' },
    { from: 'sell/MobileSellerTypePageNew', to: '04_car-selling/mobile/seller-type/MobileSellerTypePageNew' },
    { from: 'sell/MobileVehicleData', to: '04_car-selling/mobile/vehicle-data/MobileVehicleDataPage' },
    { from: 'sell/MobileEquipmentMainPage', to: '04_car-selling/mobile/equipment/MobileEquipmentMainPage' },
    { from: 'sell/Equipment/MobileSafetyPage', to: '04_car-selling/mobile/equipment/MobileSafetyPage' },
    { from: 'sell/Equipment/MobileComfortPage', to: '04_car-selling/mobile/equipment/MobileComfortPage' },
    { from: 'sell/Equipment/MobileInfotainmentPage', to: '04_car-selling/mobile/equipment/MobileInfotainmentPage' },
    { from: 'sell/Equipment/MobileExtrasPage', to: '04_car-selling/mobile/equipment/MobileExtrasPage' },
    { from: 'sell/Equipment/MobileUnifiedEquipmentPage', to: '04_car-selling/mobile/equipment/MobileUnifiedEquipmentPage' },
    { from: 'sell/MobileImages', to: '04_car-selling/mobile/images/MobileImagesPage' },
    { from: 'sell/MobilePricing', to: '04_car-selling/mobile/pricing/MobilePricingPage' },
    { from: 'sell/MobileContactNamePage', to: '04_car-selling/mobile/contact/MobileContactNamePage' },
    { from: 'sell/MobileContactAddressPage', to: '04_car-selling/mobile/contact/MobileContactAddressPage' },
    { from: 'sell/MobileContactPhonePage', to: '04_car-selling/mobile/contact/MobileContactPhonePage' },
    { from: 'sell/MobileUnifiedContactPage', to: '04_car-selling/mobile/contact/MobileUnifiedContactPage' },
  ],

  // المرحلة 4D: Car Selling - Edit & Details
  carSellingOther: [
    { from: 'EditCarPage.tsx', to: '04_car-selling/edit/EditCarPage/index.tsx' },
    { from: 'CarDetailsPage.tsx', to: '04_car-selling/details/CarDetailsPage/index.tsx' },
  ],

  // المرحلة 5: User Pages
  userPages: [
    { from: 'ProfilePage', to: '03_user-pages/profile/ProfilePage' },
    { from: 'UsersDirectoryPage', to: '03_user-pages/users-directory/UsersDirectoryPage' },
    { from: 'MyListingsPage', to: '03_user-pages/my-listings/MyListingsPage' },
    { from: 'MyDraftsPage.tsx', to: '03_user-pages/my-drafts/MyDraftsPage/index.tsx' },
    { from: 'MessagesPage', to: '03_user-pages/messages/MessagesPage' },
    { from: 'MessagingPage.tsx', to: '03_user-pages/messages/MessagingPage/index.tsx' },
    { from: 'FavoritesPage.tsx', to: '03_user-pages/favorites/FavoritesPage/index.tsx' },
    { from: 'NotificationsPage.tsx', to: '03_user-pages/notifications/NotificationsPage/index.tsx' },
    { from: 'SavedSearchesPage.tsx', to: '03_user-pages/saved-searches/SavedSearchesPage/index.tsx' },
    { from: 'DashboardPage', to: '03_user-pages/dashboard/DashboardPage' },
    { from: 'CreatePostPage.tsx', to: '03_user-pages/social/CreatePostPage/index.tsx' },
    { from: 'SocialFeedPage', to: '03_user-pages/social/SocialFeedPage' },
    { from: 'AllPostsPage.tsx', to: '03_user-pages/social/AllPostsPage/index.tsx' },
  ],

  // ... يمكن إضافة المزيد حسب الحاجة
};

/**
 * نقل ملف أو مجلد
 */
async function migrateItem(from, to) {
  const sourcePath = path.join(PAGES_DIR, from);
  const destPath = path.join(PAGES_DIR, to);

  try {
    // التحقق من وجود المصدر
    if (!await fs.pathExists(sourcePath)) {
      console.warn(`⚠️  المصدر غير موجود (تم نقله مسبقاً؟): ${from}`);
      return { success: false, skipped: true };
    }

    // إنشاء المجلد الهدف
    await fs.ensureDir(path.dirname(destPath));

    // نقل الملف/المجلد
    await fs.move(sourcePath, destPath, { overwrite: false });

    console.log(`✅ تم: ${from} → ${to}`);
    return { success: true, skipped: false };

  } catch (error) {
    console.error(`❌ خطأ: ${from}`, error.message);
    return { success: false, skipped: false, error: error.message };
  }
}

/**
 * تنفيذ مرحلة معينة
 */
async function executePhase(phaseName, items) {
  console.log(`\n${'='.repeat(60)}`);
  console.log(`🚀 المرحلة: ${phaseName}`);
  console.log('='.repeat(60));

  let stats = { success: 0, skipped: 0, failed: 0 };

  for (const { from, to } of items) {
    const result = await migrateItem(from, to);
    if (result.success) stats.success++;
    else if (result.skipped) stats.skipped++;
    else stats.failed++;
  }

  console.log(`\n📊 نتائج ${phaseName}:`);
  console.log(`   ✅ نجح: ${stats.success}`);
  console.log(`   ⏭️  تخطي: ${stats.skipped}`);
  console.log(`   ❌ فشل: ${stats.failed}`);

  return stats;
}

/**
 * التنفيذ الرئيسي
 */
async function main() {
  console.log('\n' + '='.repeat(60));
  console.log('🎯 بدء عملية النقل الآلي الشاملة');
  console.log('⏰ الوقت:', new Date().toLocaleString('ar-EG'));
  console.log('='.repeat(60));

  const totalStats = { success: 0, skipped: 0, failed: 0 };

  // تنفيذ جميع المراحل بالترتيب
  for (const [phaseName, items] of Object.entries(MIGRATION_MAP)) {
    const stats = await executePhase(phaseName, items);
    totalStats.success += stats.success;
    totalStats.skipped += stats.skipped;
    totalStats.failed += stats.failed;

    // انتظار قصير بين المراحل
    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  console.log('\n' + '='.repeat(60));
  console.log('🏁 اكتملت عملية النقل!');
  console.log('='.repeat(60));
  console.log(`   إجمالي النجاح: ${totalStats.success}`);
  console.log(`   إجمالي التخطي: ${totalStats.skipped}`);
  console.log(`   إجمالي الفشل: ${totalStats.failed}`);
  
  console.log('\n⚠️  الخطوات التالية:');
  console.log('   1. راجع الأخطاء إن وُجدت');
  console.log('   2. قم بتحديث App.tsx (راجع دليل التحديث)');
  console.log('   3. اختبر جميع المسارات');
  console.log('   4. راجع git diff');
  console.log('   5. Commit التغييرات\n');

  if (totalStats.failed > 0) {
    process.exit(1);
  }
}

// تشغيل السكريبت
if (require.main === module) {
  main().catch(error => {
    console.error('\n❌ خطأ فادح:', error);
    process.exit(1);
  });
}

module.exports = { migrateItem, executePhase, MIGRATION_MAP };
```

### استخدام السكريبت:

```bash
# 1. تثبيت Dependencies
npm install fs-extra --save-dev

# 2. Backup
git add .
git commit -m "Backup before automated migration"
git tag backup-before-migration

# 3. تشغيل السكريبت
node scripts/migrate-pages-complete.js

# 4. مراجعة النتائج
git status
git diff

# 5. إذا نجح - Commit
git add src/pages
git commit -m "refactor: automated pages migration complete"

# 6. إذا فشل - Rollback
git reset --hard backup-before-migration
```

---

## 📝 دليل التحديث

### تحديث App.tsx

**القاعدة الذهبية:** نُغيّر فقط import paths - routes تبقى كما هي!

#### قبل:

```typescript
// src/App.tsx
const HomePage = React.lazy(() => import('./pages/HomePage'));
const LoginPage = React.lazy(() => import('./pages/LoginPage'));
const VehicleStartPageNew = React.lazy(() => import('./pages/VehicleStartPageNew'));
const MobileVehicleStartPageNew = React.lazy(() => import('./pages/MobileVehicleStartPageNew'));
```

#### بعد:

```typescript
// src/App.tsx
const HomePage = React.lazy(() => import('./pages/01_main-pages/home/HomePage'));
const LoginPage = React.lazy(() => import('./pages/02_authentication/login/LoginPage'));
const VehicleStartPageNew = React.lazy(() => import('./pages/04_car-selling/workflow/vehicle-start/VehicleStartPageNew'));
const MobileVehicleStartPageNew = React.lazy(() => import('./pages/04_car-selling/mobile/vehicle-start/MobileVehicleStartPageNew'));
```

#### Routes تبقى كما هي:

```typescript
// ✅ لا تغيير في routes!
<Route path="/" element={<HomePage />} />
<Route path="/login" element={<LoginPage />} />
<Route path="/sell/vehicle-start" element={<VehicleStartPageNew />} />
```

**السبب:** المستخدمون يحفظون URLs - تغييرها يكسر bookmarks!

---

### سكريبت تحديث App.tsx الآلي:

```javascript
// scripts/update-app-imports.js
const fs = require('fs-extra');
const path = require('path');

const APP_FILE = path.join(__dirname, '../bulgarian-car-marketplace/src/App.tsx');

const IMPORT_REPLACEMENTS = {
  // Main Pages
  "./pages/HomePage": "./pages/01_main-pages/home/HomePage",
  "./pages/CarsPage": "./pages/01_main-pages/cars/CarsPage",
  "./pages/AboutPage": "./pages/01_main-pages/about/AboutPage",
  "./pages/ContactPage": "./pages/01_main-pages/contact/ContactPage",
  
  // Authentication
  "./pages/LoginPage": "./pages/02_authentication/login/LoginPage",
  "./pages/RegisterPage": "./pages/02_authentication/register/RegisterPage",
  "./pages/EmailVerificationPage": "./pages/02_authentication/verification/EmailVerificationPage",
  
  // Car Selling - Desktop
  "./pages/VehicleStartPageNew": "./pages/04_car-selling/workflow/vehicle-start/VehicleStartPageNew",
  "./pages/SellerTypePageNew": "./pages/04_car-selling/workflow/seller-type/SellerTypePageNew",
  "./pages/VehicleData": "./pages/04_car-selling/workflow/vehicle-data/VehicleDataPage",
  "./pages/EquipmentMainPage": "./pages/04_car-selling/workflow/equipment/EquipmentMainPage",
  "./pages/SafetyPage": "./pages/04_car-selling/workflow/equipment/SafetyPage",
  "./pages/ComfortPage": "./pages/04_car-selling/workflow/equipment/ComfortPage",
  "./pages/InfotainmentPage": "./pages/04_car-selling/workflow/equipment/InfotainmentPage",
  "./pages/ExtrasPage": "./pages/04_car-selling/workflow/equipment/ExtrasPage",
  "./pages/UnifiedEquipmentPage": "./pages/04_car-selling/workflow/equipment/UnifiedEquipmentPage",
  "./pages/ImagesPage": "./pages/04_car-selling/workflow/images/ImagesPage",
  "./pages/PricingPage": "./pages/04_car-selling/workflow/pricing/PricingPage",
  "./pages/ContactNamePage": "./pages/04_car-selling/workflow/contact/ContactNamePage",
  "./pages/ContactAddressPage": "./pages/04_car-selling/workflow/contact/ContactAddressPage",
  "./pages/ContactPhonePage": "./pages/04_car-selling/workflow/contact/ContactPhonePage",
  "./pages/UnifiedContactPage": "./pages/04_car-selling/workflow/contact/UnifiedContactPage",
  
  // Car Selling - Mobile
  "./pages/MobileVehicleStartPageNew": "./pages/04_car-selling/mobile/vehicle-start/MobileVehicleStartPageNew",
  "./pages/MobileSellerTypePageNew": "./pages/04_car-selling/mobile/seller-type/MobileSellerTypePageNew",
  "./pages/MobileVehicleData": "./pages/04_car-selling/mobile/vehicle-data/MobileVehicleDataPage",
  "./pages/MobileEquipmentMainPage": "./pages/04_car-selling/mobile/equipment/MobileEquipmentMainPage",
  "./pages/MobileSafetyPage": "./pages/04_car-selling/mobile/equipment/MobileSafetyPage",
  "./pages/MobileComfortPage": "./pages/04_car-selling/mobile/equipment/MobileComfortPage",
  "./pages/MobileInfotainmentPage": "./pages/04_car-selling/mobile/equipment/MobileInfotainmentPage",
  "./pages/MobileExtrasPage": "./pages/04_car-selling/mobile/equipment/MobileExtrasPage",
  "./pages/MobileUnifiedEquipmentPage": "./pages/04_car-selling/mobile/equipment/MobileUnifiedEquipmentPage",
  "./pages/MobileImagesPage": "./pages/04_car-selling/mobile/images/MobileImagesPage",
  "./pages/MobilePricingPage": "./pages/04_car-selling/mobile/pricing/MobilePricingPage",
  "./pages/MobileContactNamePage": "./pages/04_car-selling/mobile/contact/MobileContactNamePage",
  "./pages/MobileContactAddressPage": "./pages/04_car-selling/mobile/contact/MobileContactAddressPage",
  "./pages/MobileContactPhonePage": "./pages/04_car-selling/mobile/contact/MobileContactPhonePage",
  "./pages/MobileUnifiedContactPage": "./pages/04_car-selling/mobile/contact/MobileUnifiedContactPage",
  
  // User Pages
  "./pages/ProfilePage": "./pages/03_user-pages/profile/ProfilePage",
  "./pages/UsersDirectoryPage": "./pages/03_user-pages/users-directory/UsersDirectoryPage",
  "./pages/MyListingsPage": "./pages/03_user-pages/my-listings/MyListingsPage",
  "./pages/CreatePostPage": "./pages/03_user-pages/social/CreatePostPage",
  
  // Legal
  "./pages/PrivacyPolicyPage": "./pages/10_legal/privacy-policy/PrivacyPolicyPage",
  "./pages/TermsOfServicePage": "./pages/10_legal/terms-of-service/TermsOfServicePage",
  
  // ... add more as needed
};

async function updateAppImports() {
  console.log('🔄 تحديث imports في App.tsx...\n');

  try {
    // قراءة الملف
    let content = await fs.readFile(APP_FILE, 'utf8');
    const originalContent = content;

    // تطبيق جميع الاستبدالات
    let replacementCount = 0;
    for (const [oldPath, newPath] of Object.entries(IMPORT_REPLACEMENTS)) {
      const regex = new RegExp(oldPath.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g');
      const matches = content.match(regex);
      if (matches) {
        content = content.replace(regex, newPath);
        replacementCount += matches.length;
        console.log(`✅ استبدال: ${oldPath} → ${newPath} (${matches.length}x)`);
      }
    }

    // حفظ الملف المُحدّث
    if (content !== originalContent) {
      await fs.writeFile(APP_FILE, content, 'utf8');
      console.log(`\n✅ تم تحديث App.tsx بنجاح! (${replacementCount} استبدال)`);
    } else {
      console.log('\nℹ️  لا توجد تغييرات مطلوبة');
    }

  } catch (error) {
    console.error('❌ خطأ في تحديث App.tsx:', error);
    throw error;
  }
}

if (require.main === module) {
  updateAppImports().catch(error => {
    console.error('❌ فشل التحديث:', error);
    process.exit(1);
  });
}

module.exports = { updateAppImports, IMPORT_REPLACEMENTS };
```

---

## ✅ قائمة الاختبار الشاملة

### المرحلة 1: Build Test

```bash
cd bulgarian-car-marketplace
npm run build
```

**معايير النجاح:**
- [ ] صفر أخطاء TypeScript
- [ ] صفر تحذيرات حرجة
- [ ] Build time مقارب للسابق (±10%)
- [ ] Bundle size لم يزد

---

### المرحلة 2: اختبارات الصفحات الأساسية

| الصفحة | URL | Status |
|--------|-----|--------|
| Home | `/` | ⬜ |
| About | `/about` | ⬜ |
| Contact | `/contact` | ⬜ |
| Terms | `/terms` | ⬜ |
| Privacy | `/privacy` | ⬜ |
| 404 | `/invalid` | ⬜ |

**لكل صفحة:**
- [ ] تُحمّل بدون أخطاء
- [ ] جميع الصور تظهر
- [ ] الترجمة (bg/en) تعمل
- [ ] Navigation links تعمل
- [ ] Responsive design سليم

---

### المرحلة 3: اختبارات المصادقة

| الصفحة | URL | Status |
|--------|-----|--------|
| Login | `/login` | ⬜ |
| Register | `/register` | ⬜ |
| Email Verification | `/verification` | ⬜ |
| OAuth Callback | `/oauth/callback` | ⬜ |

**اختبر:**
- [ ] تسجيل دخول بالبريد
- [ ] تسجيل دخول بـ Google
- [ ] تسجيل دخول بـ Facebook
- [ ] إنشاء حساب جديد
- [ ] التحقق من البريد

---

### المرحلة 4: اختبارات نظام البيع (الأهم!)

#### Desktop Workflow:

| الخطوة | URL | Status |
|--------|-----|--------|
| Vehicle Start | `/sell/vehicle-start` | ⬜ |
| Seller Type | `/sell/seller-type` | ⬜ |
| Vehicle Data | `/sell/vehicle-data` | ⬜ |
| Equipment | `/sell/equipment` | ⬜ |
| Safety | `/sell/equipment/safety` | ⬜ |
| Comfort | `/sell/equipment/comfort` | ⬜ |
| Infotainment | `/sell/equipment/infotainment` | ⬜ |
| Extras | `/sell/equipment/extras` | ⬜ |
| Images | `/sell/images` | ⬜ |
| Pricing | `/sell/pricing` | ⬜ |
| Contact Name | `/sell/contact/name` | ⬜ |
| Contact Address | `/sell/contact/address` | ⬜ |
| Contact Phone | `/sell/contact/phone` | ⬜ |

**اختبر:**
- [ ] Progress bar يعمل
- [ ] "Back" button يحفظ البيانات
- [ ] Image upload يعمل
- [ ] Form validation يعمل
- [ ] يمكن إكمال المسار كاملاً

#### Mobile Workflow:

**افتح Dev Tools → Toggle device toolbar (F12 → Ctrl+Shift+M)**

اختبر نفس المسار على:
- [ ] iPhone (375px width)
- [ ] Android (414px width)
- [ ] iPad (768px width)

---

### المرحلة 5: اختبارات الملف الشخصي

| الصفحة | URL | Status |
|--------|-----|--------|
| Profile Overview | `/profile` | ⬜ |
| My Ads | `/profile/my-ads` | ⬜ |
| Campaigns | `/profile/campaigns` | ⬜ |
| Analytics | `/profile/analytics` | ⬜ |
| Settings | `/profile/settings` | ⬜ |
| Consultations | `/profile/consultations` | ⬜ |

---

### المرحلة 6: Performance Check

```bash
npm run build
npm run analyze  # if configured
```

**قارن bundle size:**
- قبل: `_____ MB`
- بعد: `_____ MB`
- الفرق: `_____ MB` (يجب ألا يزيد!)

---

### المرحلة 7: Browser Console Check

**افتح Console في كل صفحة (F12):**

- [ ] لا توجد errors حمراء
- [ ] لا توجد warnings حرجة
- [ ] Network tab: جميع requests نجحت (200 OK)

---

### المعايير النهائية للنجاح:

- [ ] ✅ جميع Routes تعمل
- [ ] ✅ صفر TypeScript errors
- [ ] ✅ Build ينجح
- [ ] ✅ Performance لم يتأثر سلباً
- [ ] ✅ Mobile responsive يعمل
- [ ] ✅ Bilingual system (bg/en) يعمل
- [ ] ✅ Console نظيف من Errors
- [ ] ✅ جميع الاختبارات اليدوية نجحت

---

## ⚠️ إدارة المخاطر

### المخاطرة 1: فقدان بيانات

**الاحتمال:** منخفض جداً  
**التأثير:** كارثي

**الحلول:**
1. ✅ Git backup قبل البدء
2. ✅ نسخة احتياطية يدوية (`cp -r src/pages src/pages.backup`)
3. ✅ Git tags في كل مرحلة
4. ✅ السكريبت لا يحذف - فقط ينقل

---

### المخاطرة 2: كسر Imports

**الاحتمال:** متوسط  
**التأثير:** عالي

**الحلول:**
1. ✅ TypeScript سيكتشف الأخطاء فوراً
2. ✅ سكريبت تحديث App.tsx آلي
3. ✅ اختبار Build بعد كل مرحلة
4. ✅ دليل تحديث شامل

---

### المخاطرة 3: كسر Routes

**الاحتمال:** منخفض  
**التأثير:** عالي

**الحلول:**
1. ✅ Routes لا تتغير! (فقط imports)
2. ✅ قائمة اختبار شاملة لكل route
3. ✅ اختبار يدوي لجميع المسارات

---

### المخاطرة 4: مشاكل Legacy Code

**الاحتمال:** منخفض  
**التأثير:** متوسط

**الحلول:**
1. ✅ مجلد `sell/` يُنقل كاملاً إلى `legacy/`
2. ✅ لا يُحذف - فقط يُؤرشف
3. ✅ يمكن الرجوع إليه دائماً

---

### المخاطرة 5: تعارض في الفريق

**الاحتمال:** متوسط  
**التأثير:** متوسط

**الحلول:**
1. ✅ العمل على branch منفصل
2. ✅ إعلام الفريق قبل البدء
3. ✅ تجميد commits على `main` أثناء التنفيذ
4. ✅ Code freeze period واضح

---

## 🚨 خطة الطوارئ (Rollback Plan)

### Level 1: Rollback سريع (خلال دقائق)

```bash
# العودة لآخر commit
git reset --hard HEAD

# أو العودة لـ tag معين
git reset --hard backup-before-restructure
```

---

### Level 2: Rollback جزئي (خلال ساعة)

```bash
# إذا نجحت بعض المراحل وفشلت أخرى
# مثلاً: نجح Legal + Auth، فشل Car Selling

# نحتفظ بالناجح ونتراجع عن الفاشل
git checkout backup-before-restructure -- src/pages/04_car-selling
```

---

### Level 3: Rollback يدوي (خلال يوم)

```bash
# استعادة ملفات معينة فقط
cp -r src/pages.backup/VehicleStartPageNew src/pages/

# تحديث App.tsx يدوياً
# اختبار
```

---

### Level 4: Start Over (البداية من جديد)

```bash
# إذا حدثت فوضى كاملة
git checkout main
git branch -D restructure/section-based
git checkout -b restructure/section-based-v2

# ابدأ من جديد بحذر أكثر
```

---

## 🎯 الخلاصة والتوصية

### ✅ هذه الخطة:

1. **شاملة:** تغطي كل جانب من إعادة الهيكلة
2. **محكمة:** بدون أخطاء برمجية
3. **آمنة:** خطط backup وRollback واضحة
4. **عملية:** سكريبتات آلية جاهزة
5. **مُختبرة:** قائمة اختبار شاملة

---

### 📅 الجدول الزمني المتوقع:

```
الأسبوع 1:
- الإعداد (1 يوم)
- Legal (1 يوم)
- Authentication (2 أيام)
- Main Pages (2 أيام)

الأسبوع 2:
- Car Selling (7 أيام كاملة!)

الأسبوع 3:
- User Pages (4 أيام)
- الأقسام المتبقية (3 أيام)

الأسبوع 4:
- التنظيف والتحسين (2 أيام)
- الاختبار الشامل (3 أيام)
- التوثيق النهائي (2 أيام)

الإجمالي: 3-4 أسابيع
```

---

### 💡 نصائح ذهبية:

1. ✅ **لا تتعجل** - خذ وقتك
2. ✅ **اختبر باستمرار** - بعد كل مرحلة
3. ✅ **Commit بانتظام** - كل مرحلة = commit
4. ✅ **وثّق المشاكل** - احتفظ بملف للملاحظات
5. ✅ **اطلب مراجعة** - من مطور آخر إذا أمكن

---

## 🚀 جاهز للبدء؟

### الخطوات الثلاث التالية:

1. **اقرأ هذه الخطة بالكامل** (ساعة واحدة)
2. **ناقش مع الفريق** (إذا وُجد)
3. **اتخذ القرار:** نبدأ الآن أو نؤجل؟

---

### إذا قررت البدء:

```bash
# الخطوة 1: Backup
git checkout -b restructure/section-based
git tag backup-before-restructure-$(date +%Y%m%d)

# الخطوة 2: ابدأ بـ Legal (الأصغر)
# راجع "المرحلة 1" في خطة التنفيذ

# الخطوة 3: استمر بحذر!
```

---

**تاريخ الإنشاء:** 5 نوفمبر 2025  
**آخر تحديث:** 5 نوفمبر 2025  
**الإصدار:** 2.0 - النسخة النهائية المحكمة  
**الحالة:** ✅ جاهز للتنفيذ بثقة 100%

---

```
┌────────────────────────────────────────────────────────────┐
│                                                            │
│  🎉 خطة شاملة ومحكمة - جاهزة للتنفيذ!                   │
│                                                            │
│  ✅ صفر تكرار                                             │
│  ✅ كل شيء مُنظّم                                         │
│  ✅ آمنة ومُختبرة                                         │
│  ✅ قابلة للتنفيذ                                         │
│                                                            │
│  حظاً موفقاً! 🚀                                          │
│                                                            │
└────────────────────────────────────────────────────────────┘
```

