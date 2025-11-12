# 🗺️ خطة النقل التفصيلية
## Detailed Migration Plan

---

## 📦 المرحلة 1: الصفحات الأساسية (Core Pages)

### الملفات المطلوب نقلها:

```bash
# من:
src/pages/HomePage.tsx
src/pages/AboutPage.tsx
src/pages/ContactPage.tsx
src/pages/TermsPage.tsx
src/pages/PrivacyPage.tsx
src/pages/NotFoundPage.tsx

# إلى:
src/pages/01_core/HomePage/index.tsx
src/pages/01_core/AboutPage/index.tsx
src/pages/01_core/ContactPage/index.tsx
src/pages/01_core/TermsPage/index.tsx
src/pages/01_core/PrivacyPage/index.tsx
src/pages/01_core/NotFoundPage/index.tsx
```

### التحديثات المطلوبة:

#### 1. في `App.tsx`:
```typescript
// قبل:
const HomePage = React.lazy(() => import('./pages/HomePage'));

// بعد:
const HomePage = React.lazy(() => import('./pages/01_core/HomePage'));
```

#### 2. في `routes.ts` (إذا وُجد):
```typescript
// تحديث جميع imports
import HomePage from '@/pages/01_core/HomePage';
```

---

## 🔐 المرحلة 2: صفحات المصادقة (Auth Pages)

### الملفات:

```bash
# من:
src/pages/LoginPage.tsx
src/pages/RegisterPage.tsx
src/pages/ForgotPasswordPage.tsx
src/pages/ResetPasswordPage.tsx
src/pages/OAuthCallback.tsx

# إلى:
src/pages/02_auth/LoginPage/index.tsx
src/pages/02_auth/RegisterPage/index.tsx
src/pages/02_auth/ForgotPasswordPage/index.tsx
src/pages/02_auth/ResetPasswordPage/index.tsx
src/pages/02_auth/OAuthCallback/index.tsx
```

### ملاحظات خاصة:
- ⚠️ `OAuthCallback` يتعامل مع Facebook/TikTok OAuth
- تأكد من تحديث redirect URLs في Firebase Console

---

## 🚗 المرحلة 3: نظام البيع (Sell System) - الأهم!

### المجموعة 1: مسار البيع الرئيسي (Main Workflow)

```bash
src/pages/04_sell/_workflow/
├── VehicleStartPageNew/
│   ├── index.tsx
│   └── styles.ts
├── SellerTypePageNew/
│   ├── index.tsx
│   └── styles.ts
├── VehicleData/
│   ├── index.tsx
│   ├── components/
│   └── styles.ts
├── equipment/
│   ├── EquipmentMainPage/
│   ├── SafetyPage/
│   ├── ComfortPage/
│   ├── InfotainmentPage/
│   ├── ExtrasPage/
│   └── UnifiedEquipmentPage/
├── ImagesPage/
├── PricingPage/
└── contact/
    ├── ContactNamePage/
    ├── ContactAddressPage/
    ├── ContactPhonePage/
    └── UnifiedContactPage/
```

### المجموعة 2: نسخ الموبايل (Mobile Variants)

```bash
src/pages/04_sell/_mobile/
├── MobileVehicleStartPageNew/
├── MobileSellerTypePageNew/
├── MobileVehicleData/
├── equipment/
│   ├── MobileEquipmentMainPage/
│   ├── MobileSafetyPage/
│   ├── MobileComfortPage/
│   ├── MobileInfotainmentPage/
│   ├── MobileExtrasPage/
│   └── MobileUnifiedEquipmentPage/
├── MobileImagesPage/
├── MobilePricingPage/
└── contact/
    ├── MobileContactNamePage/
    ├── MobileContactAddressPage/
    ├── MobileContactPhonePage/
    └── MobileUnifiedContactPage/
```

### المجموعة 3: الأرشيف (Legacy)

```bash
src/pages/04_sell/_legacy/
└── sell/
    ├── VehicleStartPage/     # النسخة القديمة
    ├── SellerTypePage/       # النسخة القديمة
    └── ... (كل ملفات sell/ القديمة)
```

---

## 👤 المرحلة 4: الملف الشخصي (Profile System)

### الملفات:

```bash
src/pages/05_profile/
├── ProfilePage/
│   ├── index.tsx
│   ├── ProfileRouter.tsx
│   └── styles.ts
├── EditProfilePage/
├── MyListingsPage/
├── SavedCarsPage/
└── private/               # Private seller specific
    └── PrivateProfilePage/
```

### التحديثات الحرجة:

#### في `ProfileRouter.tsx`:
```typescript
// تحديث imports للصفحات المنقولة
import EditProfilePage from '../EditProfilePage';
import MyListingsPage from '../MyListingsPage';
```

---

## 🛠️ المرحلة 5: خدمات المستخدم (User Services)

```bash
src/pages/06_user_services/
├── messaging/
│   ├── MessagingPage/
│   └── ConversationPage/
├── notifications/
│   └── NotificationsPage/
├── favorites/
│   └── FavoritesPage/
└── settings/
    └── SettingsPage/
```

---

## 💼 المرحلة 6: الصفحات التجارية (Business Pages)

```bash
src/pages/07_business/
├── dealer/
│   ├── DealerDashboard/
│   ├── DealerInventory/
│   └── DealerAnalytics/
└── company/
    └── CompanyDashboard/
```

---

## ⚙️ المرحلة 7: الميزات المتقدمة (Advanced Features)

### الخيار 1: نقل من src/features/

```bash
# نقل كامل من:
src/features/

# إلى:
src/pages/08_features/
├── verification/
├── billing/
├── analytics/
└── team/
```

### الخيار 2: الإبقاء على src/features/ (مُفضّل)

```bash
# الإبقاء على:
src/features/   # كما هو

# وإنشاء:
src/pages/08_features/
└── index.ts    # Re-exports من src/features/
```

**القرار:** نناقش مع الفريق

---

## 🔧 المرحلة 8: لوحة الإدارة (Admin Panel)

```bash
src/pages/09_admin/
├── AdminDashboard/
├── UserManagement/
├── ListingModeration/
└── SystemSettings/
```

---

## 🔗 المرحلة 9: التكامل (Integration Pages)

```bash
src/pages/10_integration/
├── FacebookIntegration/
├── TikTokIntegration/
└── APIDocumentation/
```

---

## ✅ قائمة التحقق لكل ملف منقول

- [ ] نقل الملف إلى الموقع الجديد
- [ ] إنشاء `index.tsx` إذا لم يكن موجوداً
- [ ] تحديث imports الداخلية
- [ ] تحديث `App.tsx` lazy imports
- [ ] تحديث route paths إذا لزم
- [ ] اختبار الصفحة في المتصفح
- [ ] اختبار responsive (mobile/desktop)
- [ ] التأكد من عدم كسر أي links
- [ ] تحديث الوثائق إذا لزم

---

**التالي:** راجع `03_AUTOMATED_MIGRATION_SCRIPT.md` للسكريبت الآلي
