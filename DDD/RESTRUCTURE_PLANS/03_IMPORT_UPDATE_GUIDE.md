# 🔄 دليل تحديث Imports
## Import Update Guide

**متى:** بعد تشغيل `02_MIGRATION_SCRIPT.js` بنجاح  
**أين:** `src/App.tsx` + `src/pages/ProfilePage/ProfileRouter.tsx`

---

## 🎯 القاعدة الذهبية

**نُغيّر فقط import paths - URL routes تبقى كما هي!**

```typescript
// ✅ هذا يتغير
const HomePage = React.lazy(() => import('./pages/01_core/HomePage'));

// ❌ هذا لا يتغير أبداً
<Route path="/" element={<HomePage />} />
```

---

## 📝 App.tsx - التحديثات المطلوبة

### 1️⃣ Core Pages (6 تحديثات)

```typescript
// filepath: src/App.tsx
// ...existing code... (السطور 1-30: imports أخرى)

// ❌ القديم (احذف)
const HomePage = React.lazy(() => import('./pages/HomePage'));
const AboutPage = React.lazy(() => import('./pages/AboutPage'));
const ContactPage = React.lazy(() => import('./pages/ContactPage'));
const TermsPage = React.lazy(() => import('./pages/TermsPage'));
const PrivacyPage = React.lazy(() => import('./pages/PrivacyPage'));
const NotFoundPage = React.lazy(() => import('./pages/NotFoundPage'));

// ✅ الجديد (استبدل)
const HomePage = React.lazy(() => import('./pages/01_core/HomePage'));
const AboutPage = React.lazy(() => import('./pages/01_core/AboutPage'));
const ContactPage = React.lazy(() => import('./pages/01_core/ContactPage'));
const TermsPage = React.lazy(() => import('./pages/01_core/TermsPage'));
const PrivacyPage = React.lazy(() => import('./pages/01_core/PrivacyPage'));
const NotFoundPage = React.lazy(() => import('./pages/01_core/NotFoundPage'));

// ...existing code...
```

---

### 2️⃣ Auth Pages (5 تحديثات)

```typescript
// filepath: src/App.tsx
// ...existing code...

// ❌ القديم
const LoginPage = React.lazy(() => import('./pages/LoginPage'));
const RegisterPage = React.lazy(() => import('./pages/RegisterPage'));
const ForgotPasswordPage = React.lazy(() => import('./pages/ForgotPasswordPage'));
const ResetPasswordPage = React.lazy(() => import('./pages/ResetPasswordPage'));
const OAuthCallback = React.lazy(() => import('./pages/OAuthCallback'));

// ✅ الجديد
const LoginPage = React.lazy(() => import('./pages/02_auth/LoginPage'));
const RegisterPage = React.lazy(() => import('./pages/02_auth/RegisterPage'));
const ForgotPasswordPage = React.lazy(() => import('./pages/02_auth/ForgotPasswordPage'));
const ResetPasswordPage = React.lazy(() => import('./pages/02_auth/ResetPasswordPage'));
const OAuthCallback = React.lazy(() => import('./pages/02_auth/OAuthCallback'));

// ...existing code...
```

---

### 3️⃣ Marketplace Pages (4 تحديثات)

```typescript
// filepath: src/App.tsx
// ...existing code...

// ❌ القديم
const SearchPage = React.lazy(() => import('./pages/SearchPage'));
const CategoryPage = React.lazy(() => import('./pages/CategoryPage'));
const CarDetailsPage = React.lazy(() => import('./pages/CarDetailsPage'));
const ComparisonPage = React.lazy(() => import('./pages/ComparisonPage'));

// ✅ الجديد
const SearchPage = React.lazy(() => import('./pages/03_marketplace/SearchPage'));
const CategoryPage = React.lazy(() => import('./pages/03_marketplace/CategoryPage'));
const CarDetailsPage = React.lazy(() => import('./pages/03_marketplace/CarDetailsPage'));
const ComparisonPage = React.lazy(() => import('./pages/03_marketplace/ComparisonPage'));

// ...existing code...
```

---

### 4️⃣ Sell Workflow - Desktop (15 تحديثاً)

```typescript
// filepath: src/App.tsx
// ...existing code...

// ❌ القديم - الصفحات الرئيسية
const VehicleStartPageNew = React.lazy(() => import('./pages/VehicleStartPageNew'));
const SellerTypePageNew = React.lazy(() => import('./pages/SellerTypePageNew'));
const VehicleData = React.lazy(() => import('./pages/VehicleData'));
const ImagesPage = React.lazy(() => import('./pages/ImagesPage'));
const PricingPage = React.lazy(() => import('./pages/PricingPage'));

// ✅ الجديد - الصفحات الرئيسية
const VehicleStartPageNew = React.lazy(() => import('./pages/04_sell/_workflow/VehicleStartPageNew'));
const SellerTypePageNew = React.lazy(() => import('./pages/04_sell/_workflow/SellerTypePageNew'));
const VehicleData = React.lazy(() => import('./pages/04_sell/_workflow/VehicleData'));
const ImagesPage = React.lazy(() => import('./pages/04_sell/_workflow/ImagesPage'));
const PricingPage = React.lazy(() => import('./pages/04_sell/_workflow/PricingPage'));

// ❌ القديم - Equipment Group
const EquipmentMainPage = React.lazy(() => import('./pages/EquipmentMainPage'));
const SafetyPage = React.lazy(() => import('./pages/SafetyPage'));
const ComfortPage = React.lazy(() => import('./pages/ComfortPage'));
const InfotainmentPage = React.lazy(() => import('./pages/InfotainmentPage'));
const ExtrasPage = React.lazy(() => import('./pages/ExtrasPage'));
const UnifiedEquipmentPage = React.lazy(() => import('./pages/UnifiedEquipmentPage'));

// ✅ الجديد - Equipment Group
const EquipmentMainPage = React.lazy(() => import('./pages/04_sell/_workflow/equipment/EquipmentMainPage'));
const SafetyPage = React.lazy(() => import('./pages/04_sell/_workflow/equipment/SafetyPage'));
const ComfortPage = React.lazy(() => import('./pages/04_sell/_workflow/equipment/ComfortPage'));
const InfotainmentPage = React.lazy(() => import('./pages/04_sell/_workflow/equipment/InfotainmentPage'));
const ExtrasPage = React.lazy(() => import('./pages/04_sell/_workflow/equipment/ExtrasPage'));
const UnifiedEquipmentPage = React.lazy(() => import('./pages/04_sell/_workflow/equipment/UnifiedEquipmentPage'));

// ❌ القديم - Contact Group
const ContactNamePage = React.lazy(() => import('./pages/ContactNamePage'));
const ContactAddressPage = React.lazy(() => import('./pages/ContactAddressPage'));
const ContactPhonePage = React.lazy(() => import('./pages/ContactPhonePage'));
const UnifiedContactPage = React.lazy(() => import('./pages/UnifiedContactPage'));

// ✅ الجديد - Contact Group
const ContactNamePage = React.lazy(() => import('./pages/04_sell/_workflow/contact/ContactNamePage'));
const ContactAddressPage = React.lazy(() => import('./pages/04_sell/_workflow/contact/ContactAddressPage'));
const ContactPhonePage = React.lazy(() => import('./pages/04_sell/_workflow/contact/ContactPhonePage'));
const UnifiedContactPage = React.lazy(() => import('./pages/04_sell/_workflow/contact/UnifiedContactPage'));

// ...existing code...
```

---

### 5️⃣ Sell Workflow - Mobile (15 تحديثاً)

```typescript
// filepath: src/App.tsx
// ...existing code...

// ❌ القديم - Mobile Main
const MobileVehicleStartPageNew = React.lazy(() => import('./pages/MobileVehicleStartPageNew'));
const MobileSellerTypePageNew = React.lazy(() => import('./pages/MobileSellerTypePageNew'));
const MobileVehicleData = React.lazy(() => import('./pages/MobileVehicleData'));
const MobileImagesPage = React.lazy(() => import('./pages/MobileImagesPage'));
const MobilePricingPage = React.lazy(() => import('./pages/MobilePricingPage'));

// ✅ الجديد - Mobile Main
const MobileVehicleStartPageNew = React.lazy(() => import('./pages/04_sell/_mobile/MobileVehicleStartPageNew'));
const MobileSellerTypePageNew = React.lazy(() => import('./pages/04_sell/_mobile/MobileSellerTypePageNew'));
const MobileVehicleData = React.lazy(() => import('./pages/04_sell/_mobile/MobileVehicleData'));
const MobileImagesPage = React.lazy(() => import('./pages/04_sell/_mobile/MobileImagesPage'));
const MobilePricingPage = React.lazy(() => import('./pages/04_sell/_mobile/MobilePricingPage'));

// ❌ القديم - Mobile Equipment
const MobileEquipmentMainPage = React.lazy(() => import('./pages/MobileEquipmentMainPage'));
const MobileSafetyPage = React.lazy(() => import('./pages/MobileSafetyPage'));
const MobileComfortPage = React.lazy(() => import('./pages/MobileComfortPage'));
const MobileInfotainmentPage = React.lazy(() => import('./pages/MobileInfotainmentPage'));
const MobileExtrasPage = React.lazy(() => import('./pages/MobileExtrasPage'));
const MobileUnifiedEquipmentPage = React.lazy(() => import('./pages/MobileUnifiedEquipmentPage'));

// ✅ الجديد - Mobile Equipment
const MobileEquipmentMainPage = React.lazy(() => import('./pages/04_sell/_mobile/equipment/MobileEquipmentMainPage'));
const MobileSafetyPage = React.lazy(() => import('./pages/04_sell/_mobile/equipment/MobileSafetyPage'));
const MobileComfortPage = React.lazy(() => import('./pages/04_sell/_mobile/equipment/MobileComfortPage'));
const MobileInfotainmentPage = React.lazy(() => import('./pages/04_sell/_mobile/equipment/MobileInfotainmentPage'));
const MobileExtrasPage = React.lazy(() => import('./pages/04_sell/_mobile/equipment/MobileExtrasPage'));
const MobileUnifiedEquipmentPage = React.lazy(() => import('./pages/04_sell/_mobile/equipment/MobileUnifiedEquipmentPage'));

// ❌ القديم - Mobile Contact
const MobileContactNamePage = React.lazy(() => import('./pages/MobileContactNamePage'));
const MobileContactAddressPage = React.lazy(() => import('./pages/MobileContactAddressPage'));
const MobileContactPhonePage = React.lazy(() => import('./pages/MobileContactPhonePage'));
const MobileUnifiedContactPage = React.lazy(() => import('./pages/MobileUnifiedContactPage'));

// ✅ الجديد - Mobile Contact
const MobileContactNamePage = React.lazy(() => import('./pages/04_sell/_mobile/contact/MobileContactNamePage'));
const MobileContactAddressPage = React.lazy(() => import('./pages/04_sell/_mobile/contact/MobileContactAddressPage'));
const MobileContactPhonePage = React.lazy(() => import('./pages/04_sell/_mobile/contact/MobileContactPhonePage'));
const MobileUnifiedContactPage = React.lazy(() => import('./pages/04_sell/_mobile/contact/MobileUnifiedContactPage'));

// ...existing code...
```

---

### 6️⃣ Profile System (4 تحديثات)

```typescript
// filepath: src/App.tsx
// ...existing code...

// ❌ القديم
const EditProfilePage = React.lazy(() => import('./pages/EditProfilePage'));
const MyListingsPage = React.lazy(() => import('./pages/MyListingsPage'));
const SavedCarsPage = React.lazy(() => import('./pages/SavedCarsPage'));

// ✅ الجديد
const EditProfilePage = React.lazy(() => import('./pages/05_profile/EditProfilePage'));
const MyListingsPage = React.lazy(() => import('./pages/05_profile/MyListingsPage'));
const SavedCarsPage = React.lazy(() => import('./pages/05_profile/SavedCarsPage'));

// ...existing code...
```

---

### 7️⃣ User Services (5 تحديثات)

```typescript
// filepath: src/App.tsx
// ...existing code...

// ❌ القديم
const MessagingPage = React.lazy(() => import('./pages/MessagingPage'));
const ConversationPage = React.lazy(() => import('./pages/ConversationPage'));
const NotificationsPage = React.lazy(() => import('./pages/NotificationsPage'));
const FavoritesPage = React.lazy(() => import('./pages/FavoritesPage'));
const SettingsPage = React.lazy(() => import('./pages/SettingsPage'));

// ✅ الجديد
const MessagingPage = React.lazy(() => import('./pages/06_user_services/messaging/MessagingPage'));
const ConversationPage = React.lazy(() => import('./pages/06_user_services/messaging/ConversationPage'));
const NotificationsPage = React.lazy(() => import('./pages/06_user_services/notifications/NotificationsPage'));
const FavoritesPage = React.lazy(() => import('./pages/06_user_services/favorites/FavoritesPage'));
const SettingsPage = React.lazy(() => import('./pages/06_user_services/settings/SettingsPage'));

// ...existing code...
```

---

### 8️⃣ Business + Admin + Integration (11 تحديثاً)

```typescript
// filepath: src/App.tsx
// ...existing code...

// ❌ القديم - Business
const DealerDashboard = React.lazy(() => import('./pages/DealerDashboard'));
const DealerInventory = React.lazy(() => import('./pages/DealerInventory'));
const DealerAnalytics = React.lazy(() => import('./pages/DealerAnalytics'));
const CompanyDashboard = React.lazy(() => import('./pages/CompanyDashboard'));

// ✅ الجديد - Business
const DealerDashboard = React.lazy(() => import('./pages/07_business/dealer/DealerDashboard'));
const DealerInventory = React.lazy(() => import('./pages/07_business/dealer/DealerInventory'));
const DealerAnalytics = React.lazy(() => import('./pages/07_business/dealer/DealerAnalytics'));
const CompanyDashboard = React.lazy(() => import('./pages/07_business/company/CompanyDashboard'));

// ❌ القديم - Admin
const AdminDashboard = React.lazy(() => import('./pages/AdminDashboard'));
const UserManagement = React.lazy(() => import('./pages/UserManagement'));
const ListingModeration = React.lazy(() => import('./pages/ListingModeration'));
const SystemSettings = React.lazy(() => import('./pages/SystemSettings'));

// ✅ الجديد - Admin
const AdminDashboard = React.lazy(() => import('./pages/09_admin/AdminDashboard'));
const UserManagement = React.lazy(() => import('./pages/09_admin/UserManagement'));
const ListingModeration = React.lazy(() => import('./pages/09_admin/ListingModeration'));
const SystemSettings = React.lazy(() => import('./pages/09_admin/SystemSettings'));

// ❌ القديم - Integration
const FacebookIntegration = React.lazy(() => import('./pages/FacebookIntegration'));
const TikTokIntegration = React.lazy(() => import('./pages/TikTokIntegration'));
const APIDocumentation = React.lazy(() => import('./pages/APIDocumentation'));

// ✅ الجديد - Integration
const FacebookIntegration = React.lazy(() => import('./pages/10_integration/FacebookIntegration'));
const TikTokIntegration = React.lazy(() => import('./pages/10_integration/TikTokIntegration'));
const APIDocumentation = React.lazy(() => import('./pages/10_integration/APIDocumentation'));

// ...existing code...
```

---

## 🔧 ProfileRouter.tsx - تحديث حرج!

```typescript
// filepath: src/pages/05_profile/ProfilePage/ProfileRouter.tsx
// ...existing code...

// ❌ القديم (relative imports من خارج المجلد)
import EditProfilePage from '../../EditProfilePage';
import MyListingsPage from '../../MyListingsPage';
import SavedCarsPage from '../../SavedCarsPage';

// ✅ الجديد (relative imports من نفس المجلد الأب)
import EditProfilePage from '../EditProfilePage';
import MyListingsPage from '../MyListingsPage';
import SavedCarsPage from '../SavedCarsPage';

// ...existing code...
```

---

## ✅ قائمة التحقق

### قبل البدء:
- [ ] نسخة احتياطية Git: `git commit -m "Before import updates"`
- [ ] السكريبت تم تشغيله بنجاح
- [ ] فتح `App.tsx` و `ProfileRouter.tsx`

### أثناء التحديث:
- [ ] تحديث Core Pages (6)
- [ ] تحديث Auth Pages (5)
- [ ] تحديث Marketplace (4)
- [ ] تحديث Sell Desktop (15)
- [ ] تحديث Sell Mobile (15)
- [ ] تحديث Profile (4)
- [ ] تحديث User Services (5)
- [ ] تحديث Business/Admin/Integration (11)
- [ ] تحديث ProfileRouter.tsx

### بعد التحديث:
- [ ] حفظ جميع الملفات
- [ ] تشغيل: `npm run build`
- [ ] التحقق من عدم وجود أخطاء TypeScript
- [ ] اختبار: راجع `04_TESTING_CHECKLIST.md`

---

## 🚨 تحذيرات هامة

### ❌ لا تُغيّر Route Paths!

```typescript
// ✅ صحيح - path يبقى كما هو
<Route path="/sell/vehicle-start" element={<VehicleStartPageNew />} />
<Route path="/about" element={<AboutPage />} />

// ❌ خطأ - لا تفعل هذا!
<Route path="/01_core/about" element={<AboutPage />} />
<Route path="/04_sell/_workflow/vehicle-start" element={<VehicleStartPageNew />} />
```

**السبب:** تغيير paths يكسر:
- Bookmarks المستخدمين
- الروابط الخارجية (SEO)
- Firebase Dynamic Links
- Social media shares

---

## 💡 نصائح للتحديث السريع

### استخدم VS Code Find & Replace:

1. **Ctrl+H** (Find & Replace)
2. **Regex Mode:** تفعيل (Alt+R)
3. **Find:** `import\(['"]\.\/pages\/([^'"]+)['"]\)`
4. **Replace:** يدوياً حسب الفئة

**أو استخدم Multiple Cursors:**
- Ctrl+D لتحديد التالي
- Alt+Click للنقاط المتعددة

---

**الخطوة التالية:** ⬇️  
👉 افتح `04_TESTING_CHECKLIST.md` للاختبارات الشاملة
