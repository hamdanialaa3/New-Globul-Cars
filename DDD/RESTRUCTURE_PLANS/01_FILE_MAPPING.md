# 🗺️ خريطة تقسيم الملفات التفصيلية
## Detailed File Mapping

**الهدف:** خريطة دقيقة لكل ملف: من أين → إلى أين

---

## 📊 إحصائيات عامة

| الفئة | عدد الملفات | الحالة |
|------|-------------|--------|
| **Core Pages** | 6 | ✅ جاهز |
| **Auth Pages** | 5 | ✅ جاهز |
| **Marketplace** | 4 | ✅ جاهز |
| **Sell Workflow (Desktop)** | 15 | ⚠️ معقد |
| **Sell Workflow (Mobile)** | 15 | ⚠️ معقد |
| **Sell Legacy** | 1 مجلد | ✅ نقل كامل |
| **Profile** | 4-5 | ✅ جاهز |
| **User Services** | 5+ | ✅ جاهز |
| **Business** | 4+ | ✅ جاهز |
| **Features** | 4 | ⚠️ قرار مطلوب |
| **Admin** | 4+ | ✅ جاهز |
| **Integration** | 3 | ✅ جاهز |
| **إجمالي** | **~85 ملف** | |

---

## 📂 01_core/ - الصفحات الأساسية

### الملفات:

| # | من (Current) | إلى (New) | ملاحظات |
|---|-------------|-----------|---------|
| 1 | `src/pages/HomePage.tsx` | `src/pages/01_core/HomePage/index.tsx` | ✅ بسيط |
| 2 | `src/pages/AboutPage.tsx` | `src/pages/01_core/AboutPage/index.tsx` | ✅ بسيط |
| 3 | `src/pages/ContactPage.tsx` | `src/pages/01_core/ContactPage/index.tsx` | ✅ بسيط |
| 4 | `src/pages/TermsPage.tsx` | `src/pages/01_core/TermsPage/index.tsx` | ✅ بسيط |
| 5 | `src/pages/PrivacyPage.tsx` | `src/pages/01_core/PrivacyPage/index.tsx` | ✅ بسيط |
| 6 | `src/pages/NotFoundPage.tsx` | `src/pages/01_core/NotFoundPage/index.tsx` | ✅ بسيط |

### تحديثات App.tsx المطلوبة:

```typescript
// القديم
const HomePage = React.lazy(() => import('./pages/HomePage'));
const AboutPage = React.lazy(() => import('./pages/AboutPage'));
const ContactPage = React.lazy(() => import('./pages/ContactPage'));
const TermsPage = React.lazy(() => import('./pages/TermsPage'));
const PrivacyPage = React.lazy(() => import('./pages/PrivacyPage'));
const NotFoundPage = React.lazy(() => import('./pages/NotFoundPage'));

// الجديد
const HomePage = React.lazy(() => import('./pages/01_core/HomePage'));
const AboutPage = React.lazy(() => import('./pages/01_core/AboutPage'));
const ContactPage = React.lazy(() => import('./pages/01_core/ContactPage'));
const TermsPage = React.lazy(() => import('./pages/01_core/TermsPage'));
const PrivacyPage = React.lazy(() => import('./pages/01_core/PrivacyPage'));
const NotFoundPage = React.lazy(() => import('./pages/01_core/NotFoundPage'));
```

---

## 🔐 02_auth/ - صفحات المصادقة

### الملفات:

| # | من | إلى | ملاحظات |
|---|---|-----|---------|
| 1 | `src/pages/LoginPage.tsx` | `src/pages/02_auth/LoginPage/index.tsx` | ✅ |
| 2 | `src/pages/RegisterPage.tsx` | `src/pages/02_auth/RegisterPage/index.tsx` | ✅ |
| 3 | `src/pages/ForgotPasswordPage.tsx` | `src/pages/02_auth/ForgotPasswordPage/index.tsx` | ✅ |
| 4 | `src/pages/ResetPasswordPage.tsx` | `src/pages/02_auth/ResetPasswordPage/index.tsx` | ✅ |
| 5 | `src/pages/OAuthCallback.tsx` | `src/pages/02_auth/OAuthCallback/index.tsx` | ⚠️ يتعامل مع OAuth |

### تحديثات App.tsx:

```typescript
// القديم
const LoginPage = React.lazy(() => import('./pages/LoginPage'));
const RegisterPage = React.lazy(() => import('./pages/RegisterPage'));
const ForgotPasswordPage = React.lazy(() => import('./pages/ForgotPasswordPage'));
const ResetPasswordPage = React.lazy(() => import('./pages/ResetPasswordPage'));
const OAuthCallback = React.lazy(() => import('./pages/OAuthCallback'));

// الجديد
const LoginPage = React.lazy(() => import('./pages/02_auth/LoginPage'));
const RegisterPage = React.lazy(() => import('./pages/02_auth/RegisterPage'));
const ForgotPasswordPage = React.lazy(() => import('./pages/02_auth/ForgotPasswordPage'));
const ResetPasswordPage = React.lazy(() => import('./pages/02_auth/ResetPasswordPage'));
const OAuthCallback = React.lazy(() => import('./pages/02_auth/OAuthCallback'));
```

---

## 🛒 03_marketplace/ - السوق

### الملفات:

| # | من | إلى | ملاحظات |
|---|---|-----|---------|
| 1 | `src/pages/SearchPage.tsx` | `src/pages/03_marketplace/SearchPage/index.tsx` | ✅ |
| 2 | `src/pages/CategoryPage.tsx` | `src/pages/03_marketplace/CategoryPage/index.tsx` | ✅ |
| 3 | `src/pages/CarDetailsPage.tsx` | `src/pages/03_marketplace/CarDetailsPage/index.tsx` | ⚠️ صفحة معقدة |
| 4 | `src/pages/ComparisonPage.tsx` | `src/pages/03_marketplace/ComparisonPage/index.tsx` | ✅ |

### تحديثات App.tsx:

```typescript
// القديم
const SearchPage = React.lazy(() => import('./pages/SearchPage'));
const CategoryPage = React.lazy(() => import('./pages/CategoryPage'));
const CarDetailsPage = React.lazy(() => import('./pages/CarDetailsPage'));
const ComparisonPage = React.lazy(() => import('./pages/ComparisonPage'));

// الجديد
const SearchPage = React.lazy(() => import('./pages/03_marketplace/SearchPage'));
const CategoryPage = React.lazy(() => import('./pages/03_marketplace/CategoryPage'));
const CarDetailsPage = React.lazy(() => import('./pages/03_marketplace/CarDetailsPage'));
const ComparisonPage = React.lazy(() => import('./pages/03_marketplace/ComparisonPage'));
```

---

## 🚗 04_sell/ - نظام البيع (الأكثر تعقيداً!)

### A. Desktop Workflow → `04_sell/_workflow/`

#### 1. الصفحات الرئيسية:

| # | من | إلى |
|---|---|-----|
| 1 | `src/pages/VehicleStartPageNew/` | `src/pages/04_sell/_workflow/VehicleStartPageNew/` |
| 2 | `src/pages/SellerTypePageNew/` | `src/pages/04_sell/_workflow/SellerTypePageNew/` |
| 3 | `src/pages/VehicleData/` | `src/pages/04_sell/_workflow/VehicleData/` |
| 4 | `src/pages/ImagesPage/` | `src/pages/04_sell/_workflow/ImagesPage/` |
| 5 | `src/pages/PricingPage/` | `src/pages/04_sell/_workflow/PricingPage/` |

#### 2. Equipment Group → `04_sell/_workflow/equipment/`

| # | من | إلى |
|---|---|-----|
| 6 | `src/pages/EquipmentMainPage/` | `src/pages/04_sell/_workflow/equipment/EquipmentMainPage/` |
| 7 | `src/pages/SafetyPage/` | `src/pages/04_sell/_workflow/equipment/SafetyPage/` |
| 8 | `src/pages/ComfortPage/` | `src/pages/04_sell/_workflow/equipment/ComfortPage/` |
| 9 | `src/pages/InfotainmentPage/` | `src/pages/04_sell/_workflow/equipment/InfotainmentPage/` |
| 10 | `src/pages/ExtrasPage/` | `src/pages/04_sell/_workflow/equipment/ExtrasPage/` |
| 11 | `src/pages/UnifiedEquipmentPage/` | `src/pages/04_sell/_workflow/equipment/UnifiedEquipmentPage/` |

#### 3. Contact Group → `04_sell/_workflow/contact/`

| # | من | إلى |
|---|---|-----|
| 12 | `src/pages/ContactNamePage/` | `src/pages/04_sell/_workflow/contact/ContactNamePage/` |
| 13 | `src/pages/ContactAddressPage/` | `src/pages/04_sell/_workflow/contact/ContactAddressPage/` |
| 14 | `src/pages/ContactPhonePage/` | `src/pages/04_sell/_workflow/contact/ContactPhonePage/` |
| 15 | `src/pages/UnifiedContactPage/` | `src/pages/04_sell/_workflow/contact/UnifiedContactPage/` |

### B. Mobile Variants → `04_sell/_mobile/`

#### 1. الصفحات الرئيسية:

| # | من | إلى |
|---|---|-----|
| 1 | `src/pages/MobileVehicleStartPageNew/` | `src/pages/04_sell/_mobile/MobileVehicleStartPageNew/` |
| 2 | `src/pages/MobileSellerTypePageNew/` | `src/pages/04_sell/_mobile/MobileSellerTypePageNew/` |
| 3 | `src/pages/MobileVehicleData/` | `src/pages/04_sell/_mobile/MobileVehicleData/` |
| 4 | `src/pages/MobileImagesPage/` | `src/pages/04_sell/_mobile/MobileImagesPage/` |
| 5 | `src/pages/MobilePricingPage/` | `src/pages/04_sell/_mobile/MobilePricingPage/` |

#### 2. Mobile Equipment → `04_sell/_mobile/equipment/`

| # | من | إلى |
|---|---|-----|
| 6 | `src/pages/MobileEquipmentMainPage/` | `src/pages/04_sell/_mobile/equipment/MobileEquipmentMainPage/` |
| 7 | `src/pages/MobileSafetyPage/` | `src/pages/04_sell/_mobile/equipment/MobileSafetyPage/` |
| 8 | `src/pages/MobileComfortPage/` | `src/pages/04_sell/_mobile/equipment/MobileComfortPage/` |
| 9 | `src/pages/MobileInfotainmentPage/` | `src/pages/04_sell/_mobile/equipment/MobileInfotainmentPage/` |
| 10 | `src/pages/MobileExtrasPage/` | `src/pages/04_sell/_mobile/equipment/MobileExtrasPage/` |
| 11 | `src/pages/MobileUnifiedEquipmentPage/` | `src/pages/04_sell/_mobile/equipment/MobileUnifiedEquipmentPage/` |

#### 3. Mobile Contact → `04_sell/_mobile/contact/`

| # | من | إلى |
|---|---|-----|
| 12 | `src/pages/MobileContactNamePage/` | `src/pages/04_sell/_mobile/contact/MobileContactNamePage/` |
| 13 | `src/pages/MobileContactAddressPage/` | `src/pages/04_sell/_mobile/contact/MobileContactAddressPage/` |
| 14 | `src/pages/MobileContactPhonePage/` | `src/pages/04_sell/_mobile/contact/MobileContactPhonePage/` |
| 15 | `src/pages/MobileUnifiedContactPage/` | `src/pages/04_sell/_mobile/contact/MobileUnifiedContactPage/` |

### C. Legacy → `04_sell/_legacy/`

| من | إلى | ملاحظات |
|----|-----|---------|
| `src/pages/sell/` **(المجلد بالكامل)** | `src/pages/04_sell/_legacy/sell/` | ⚠️ نقل كامل - لا تحذف |

### تحديثات App.tsx للـ Sell System:

```typescript
// Desktop Workflow
const VehicleStartPageNew = React.lazy(() => import('./pages/04_sell/_workflow/VehicleStartPageNew'));
const SellerTypePageNew = React.lazy(() => import('./pages/04_sell/_workflow/SellerTypePageNew'));
const VehicleData = React.lazy(() => import('./pages/04_sell/_workflow/VehicleData'));
const EquipmentMainPage = React.lazy(() => import('./pages/04_sell/_workflow/equipment/EquipmentMainPage'));
const SafetyPage = React.lazy(() => import('./pages/04_sell/_workflow/equipment/SafetyPage'));
const ComfortPage = React.lazy(() => import('./pages/04_sell/_workflow/equipment/ComfortPage'));
const InfotainmentPage = React.lazy(() => import('./pages/04_sell/_workflow/equipment/InfotainmentPage'));
const ExtrasPage = React.lazy(() => import('./pages/04_sell/_workflow/equipment/ExtrasPage'));
const UnifiedEquipmentPage = React.lazy(() => import('./pages/04_sell/_workflow/equipment/UnifiedEquipmentPage'));
const ImagesPage = React.lazy(() => import('./pages/04_sell/_workflow/ImagesPage'));
const PricingPage = React.lazy(() => import('./pages/04_sell/_workflow/PricingPage'));
const ContactNamePage = React.lazy(() => import('./pages/04_sell/_workflow/contact/ContactNamePage'));
const ContactAddressPage = React.lazy(() => import('./pages/04_sell/_workflow/contact/ContactAddressPage'));
const ContactPhonePage = React.lazy(() => import('./pages/04_sell/_workflow/contact/ContactPhonePage'));
const UnifiedContactPage = React.lazy(() => import('./pages/04_sell/_workflow/contact/UnifiedContactPage'));

// Mobile Variants
const MobileVehicleStartPageNew = React.lazy(() => import('./pages/04_sell/_mobile/MobileVehicleStartPageNew'));
const MobileSellerTypePageNew = React.lazy(() => import('./pages/04_sell/_mobile/MobileSellerTypePageNew'));
const MobileVehicleData = React.lazy(() => import('./pages/04_sell/_mobile/MobileVehicleData'));
const MobileEquipmentMainPage = React.lazy(() => import('./pages/04_sell/_mobile/equipment/MobileEquipmentMainPage'));
const MobileSafetyPage = React.lazy(() => import('./pages/04_sell/_mobile/equipment/MobileSafetyPage'));
const MobileComfortPage = React.lazy(() => import('./pages/04_sell/_mobile/equipment/MobileComfortPage'));
const MobileInfotainmentPage = React.lazy(() => import('./pages/04_sell/_mobile/equipment/MobileInfotainmentPage'));
const MobileExtrasPage = React.lazy(() => import('./pages/04_sell/_mobile/equipment/MobileExtrasPage'));
const MobileUnifiedEquipmentPage = React.lazy(() => import('./pages/04_sell/_mobile/equipment/MobileUnifiedEquipmentPage'));
const MobileImagesPage = React.lazy(() => import('./pages/04_sell/_mobile/MobileImagesPage'));
const MobilePricingPage = React.lazy(() => import('./pages/04_sell/_mobile/MobilePricingPage'));
const MobileContactNamePage = React.lazy(() => import('./pages/04_sell/_mobile/contact/MobileContactNamePage'));
const MobileContactAddressPage = React.lazy(() => import('./pages/04_sell/_mobile/contact/MobileContactAddressPage'));
const MobileContactPhonePage = React.lazy(() => import('./pages/04_sell/_mobile/contact/MobileContactPhonePage'));
const MobileUnifiedContactPage = React.lazy(() => import('./pages/04_sell/_mobile/contact/MobileUnifiedContactPage'));
```

---

## 👤 05_profile/ - الملفات الشخصية

### الملفات:

| # | من | إلى | ملاحظات |
|---|---|-----|---------|
| 1 | `src/pages/ProfilePage/` | **لا ينقل** | ✅ موجود مسبقاً في مجلد |
| 2 | `src/pages/EditProfilePage.tsx` | `src/pages/05_profile/EditProfilePage/index.tsx` | ✅ |
| 3 | `src/pages/MyListingsPage.tsx` | `src/pages/05_profile/MyListingsPage/index.tsx` | ✅ |
| 4 | `src/pages/SavedCarsPage.tsx` | `src/pages/05_profile/SavedCarsPage/index.tsx` | ✅ |
| 5 | `src/pages/PrivateProfilePage.tsx` | `src/pages/05_profile/PrivateProfilePage/index.tsx` | ⚠️ إذا وُجد |

### ⚠️ ملاحظة حرجة - ProfileRouter:

**الملف:** `src/pages/ProfilePage/ProfileRouter.tsx`  
**يستورد:** `EditProfilePage`, `MyListingsPage`, `SavedCarsPage`

**يجب تحديث imports فيه:**

```typescript
// ProfileRouter.tsx - القديم
import EditProfilePage from '../EditProfilePage';
import MyListingsPage from '../MyListingsPage';
import SavedCarsPage from '../SavedCarsPage';

// الجديد (بعد نقلهم لـ 05_profile/)
import EditProfilePage from './EditProfilePage';
import MyListingsPage from './MyListingsPage';
import SavedCarsPage from './SavedCarsPage';
```

### تحديثات App.tsx:

```typescript
// القديم
const EditProfilePage = React.lazy(() => import('./pages/EditProfilePage'));
const MyListingsPage = React.lazy(() => import('./pages/MyListingsPage'));
const SavedCarsPage = React.lazy(() => import('./pages/SavedCarsPage'));

// الجديد
const EditProfilePage = React.lazy(() => import('./pages/05_profile/EditProfilePage'));
const MyListingsPage = React.lazy(() => import('./pages/05_profile/MyListingsPage'));
const SavedCarsPage = React.lazy(() => import('./pages/05_profile/SavedCarsPage'));
```

---

## 🛠️ 06_user_services/ - خدمات المستخدم

### الملفات:

| # | من | إلى |
|---|---|-----|
| 1 | `src/pages/MessagingPage/` | `src/pages/06_user_services/messaging/MessagingPage/` |
| 2 | `src/pages/ConversationPage/` | `src/pages/06_user_services/messaging/ConversationPage/` |
| 3 | `src/pages/NotificationsPage/` | `src/pages/06_user_services/notifications/NotificationsPage/` |
| 4 | `src/pages/FavoritesPage/` | `src/pages/06_user_services/favorites/FavoritesPage/` |
| 5 | `src/pages/SettingsPage/` | `src/pages/06_user_services/settings/SettingsPage/` |

### تحديثات App.tsx:

```typescript
// القديم
const MessagingPage = React.lazy(() => import('./pages/MessagingPage'));
const ConversationPage = React.lazy(() => import('./pages/ConversationPage'));
const NotificationsPage = React.lazy(() => import('./pages/NotificationsPage'));
const FavoritesPage = React.lazy(() => import('./pages/FavoritesPage'));
const SettingsPage = React.lazy(() => import('./pages/SettingsPage'));

// الجديد
const MessagingPage = React.lazy(() => import('./pages/06_user_services/messaging/MessagingPage'));
const ConversationPage = React.lazy(() => import('./pages/06_user_services/messaging/ConversationPage'));
const NotificationsPage = React.lazy(() => import('./pages/06_user_services/notifications/NotificationsPage'));
const FavoritesPage = React.lazy(() => import('./pages/06_user_services/favorites/FavoritesPage'));
const SettingsPage = React.lazy(() => import('./pages/06_user_services/settings/SettingsPage'));
```

---

## 💼 07_business/ - الصفحات التجارية

### الملفات:

| # | من | إلى |
|---|---|-----|
| 1 | `src/pages/DealerDashboard/` | `src/pages/07_business/dealer/DealerDashboard/` |
| 2 | `src/pages/DealerInventory/` | `src/pages/07_business/dealer/DealerInventory/` |
| 3 | `src/pages/DealerAnalytics/` | `src/pages/07_business/dealer/DealerAnalytics/` |
| 4 | `src/pages/CompanyDashboard/` | `src/pages/07_business/company/CompanyDashboard/` |

### تحديثات App.tsx:

```typescript
// القديم
const DealerDashboard = React.lazy(() => import('./pages/DealerDashboard'));
const DealerInventory = React.lazy(() => import('./pages/DealerInventory'));
const DealerAnalytics = React.lazy(() => import('./pages/DealerAnalytics'));
const CompanyDashboard = React.lazy(() => import('./pages/CompanyDashboard'));

// الجديد
const DealerDashboard = React.lazy(() => import('./pages/07_business/dealer/DealerDashboard'));
const DealerInventory = React.lazy(() => import('./pages/07_business/dealer/DealerInventory'));
const DealerAnalytics = React.lazy(() => import('./pages/07_business/dealer/DealerAnalytics'));
const CompanyDashboard = React.lazy(() => import('./pages/07_business/company/CompanyDashboard'));
```

---

## ⚙️ 08_features/ - الميزات المتقدمة

### ⚠️ قرار مطلوب!

**الوضع الحالي:**  
هذه الصفحات موجودة في `src/features/` (وليس `src/pages/`)

**الخيارات:**

#### الخيار 1: النقل الكامل (مُفضّل للتوحيد)

| من | إلى |
|----|-----|
| `src/features/verification/VerificationPage/` | `src/pages/08_features/verification/VerificationPage/` |
| `src/features/billing/BillingPage/` | `src/pages/08_features/billing/BillingPage/` |
| `src/features/analytics/AnalyticsDashboard/` | `src/pages/08_features/analytics/AnalyticsDashboard/` |
| `src/features/team/TeamManagement/` | `src/pages/08_features/team/TeamManagement/` |

**مميزات:** توحيد جميع الصفحات في مكان واحد  
**عيوب:** قد يكسر imports كثيرة في `src/features/`

#### الخيار 2: الإبقاء في src/features/ (الأقل مخاطرة)

لا نقل - تبقى في مكانها الحالي.

**مميزات:** لا مخاطر، لا تحديثات imports  
**عيوب:** عدم توحيد - صفحات في مكانين مختلفين

#### الخيار 3: Re-exports (حل وسط)

إنشاء `src/pages/08_features/index.ts` يعيد تصدير من `src/features/`:

```typescript
// src/pages/08_features/index.ts
export { VerificationPage } from '@/features/verification/VerificationPage';
export { BillingPage } from '@/features/billing/BillingPage';
export { AnalyticsDashboard } from '@/features/analytics/AnalyticsDashboard';
export { TeamManagement } from '@/features/team/TeamManagement';
```

**مميزات:** يحافظ على الهيكل الجديد بدون نقل فعلي  
**عيوب:** طبقة إضافية، قد تُربك

**التوصية:** **الخيار 2** (الإبقاء) - الأقل مخاطرة في هذه المرحلة.

---

## 🔧 09_admin/ - الإدارة

### الملفات:

| # | من | إلى |
|---|---|-----|
| 1 | `src/pages/AdminDashboard/` | `src/pages/09_admin/AdminDashboard/` |
| 2 | `src/pages/UserManagement/` | `src/pages/09_admin/UserManagement/` |
| 3 | `src/pages/ListingModeration/` | `src/pages/09_admin/ListingModeration/` |
| 4 | `src/pages/SystemSettings/` | `src/pages/09_admin/SystemSettings/` |

### تحديثات App.tsx:

```typescript
// القديم
const AdminDashboard = React.lazy(() => import('./pages/AdminDashboard'));
const UserManagement = React.lazy(() => import('./pages/UserManagement'));
const ListingModeration = React.lazy(() => import('./pages/ListingModeration'));
const SystemSettings = React.lazy(() => import('./pages/SystemSettings'));

// الجديد
const AdminDashboard = React.lazy(() => import('./pages/09_admin/AdminDashboard'));
const UserManagement = React.lazy(() => import('./pages/09_admin/UserManagement'));
const ListingModeration = React.lazy(() => import('./pages/09_admin/ListingModeration'));
const SystemSettings = React.lazy(() => import('./pages/09_admin/SystemSettings'));
```

---

## 🔗 10_integration/ - التكامل

### الملفات:

| # | من | إلى |
|---|---|-----|
| 1 | `src/pages/FacebookIntegration/` | `src/pages/10_integration/FacebookIntegration/` |
| 2 | `src/pages/TikTokIntegration/` | `src/pages/10_integration/TikTokIntegration/` |
| 3 | `src/pages/APIDocumentation/` | `src/pages/10_integration/APIDocumentation/` |

### تحديثات App.tsx:

```typescript
// القديم
const FacebookIntegration = React.lazy(() => import('./pages/FacebookIntegration'));
const TikTokIntegration = React.lazy(() => import('./pages/TikTokIntegration'));
const APIDocumentation = React.lazy(() => import('./pages/APIDocumentation'));

// الجديد
const FacebookIntegration = React.lazy(() => import('./pages/10_integration/FacebookIntegration'));
const TikTokIntegration = React.lazy(() => import('./pages/10_integration/TikTokIntegration'));
const APIDocumentation = React.lazy(() => import('./pages/10_integration/APIDocumentation'));
```

---

## 📊 ملخص التحديثات

### إجمالي الملفات المنقولة: **~82 ملف/مجلد**

| الفئة | العدد | الأولوية |
|------|------|----------|
| Core | 6 | 🔴 عالية |
| Auth | 5 | 🔴 عالية |
| Marketplace | 4 | 🟠 متوسطة |
| Sell (Desktop) | 15 | 🔴 حرجة |
| Sell (Mobile) | 15 | 🔴 حرجة |
| Sell (Legacy) | 1 مجلد | 🟢 منخفضة |
| Profile | 4 | 🟠 متوسطة |
| User Services | 5 | 🟠 متوسطة |
| Business | 4 | 🟢 منخفضة |
| Features | 0 | ⚪ مؤجلة |
| Admin | 4 | 🟢 منخفضة |
| Integration | 3 | 🟢 منخفضة |

---

## ⚠️ نقاط الانتباه الحرجة

### 1. ProfileRouter.tsx
**المسار:** `src/pages/ProfilePage/ProfileRouter.tsx`

**يجب تحديث:**
```typescript
// ...existing code...
import EditProfilePage from './EditProfilePage';
import MyListingsPage from './MyListingsPage';
import SavedCarsPage from './SavedCarsPage';
// ...existing code...
```

### 2. Sell Workflow Services
**الملفات:** `src/services/workflowPersistenceService.ts`

قد يحتوي hardcoded paths - ابحث عن:
```typescript
// ابحث في الملف عن strings مثل:
'./pages/VehicleStartPageNew'
```

إذا وُجدت، حدّثها.

### 3. Legacy Sell Folder
**المجلد:** `src/pages/sell/`

**لا تحذف** - انقله كاملاً إلى `04_sell/_legacy/sell/`

---

**الخطوة التالية:** ⬇️  
👉 افتح `02_MIGRATION_SCRIPT.js` للسكريبت الآلي
