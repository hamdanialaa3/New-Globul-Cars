# 📍 خريطة الملفات والمسارات - نظام Numeric ID للبروفايل

**تاريخ الإنشاء:** 16 ديسمبر 2025  
**الإصدار:** 1.0  
**الهدف:** توثيق جميع الملفات المسؤولة عن نظام Numeric ID  

---

## 🎯 ملخص سريع

```
HTTP Request:
  GET http://localhost:3000/profile/18
     ↓
Routing:
  src/routes/NumericProfileRouter.tsx
     ↓
URL Parse:
  userId = "18" (numeric string)
     ↓
Hook Conversion:
  src/pages/03_user-pages/profile/ProfilePage/hooks/useProfile.ts
     ↓
Numeric ID Detection:
  /^\d+$/.test("18") → true ✓
     ↓
Firebase UID Lookup:
  src/services/numeric-id-lookup.service.ts
  → getFirebaseUidByNumericId(18) → "xyz123firebaseuid"
     ↓
Data Loading:
  bulgarianAuthService.getUserProfileById("xyz123firebaseuid")
     ↓
Render:
  ProfilePageWrapper → <Outlet /> with Context
     ↓
Output:
  User profile with numeric ID in URL ✓
```

---

## 📂 الملفات الحرجة

### 1. الـ Routing Layer

#### `src/routes/NumericProfileRouter.tsx` ⭐ CRITICAL

**المسؤولية:** معالجة الـ routes لـ `/profile/{userId}` والـ nested routes

**المحتوى:**
```typescript
// عدد الأسطر: 73 (مُبسطة من 385)
// الـ Structure:
<Route path="" element={<ProfilePageWrapper />}>
  <Route index element={<ProfileOverview />} />
  <Route path="my-ads" element={<ProfileMyAds />} />
  <Route path="campaigns" element={<ProfileCampaigns />} />
  <Route path="analytics" element={<ProfileAnalytics />} />
  <Route path="settings" element={<SettingsPage />} />
  <Route path="consultations" element={<ProfileConsultations />} />
  <Route path=":userId/car/:carId/edit" element={<EditCarPage />} />
  <Route path=":userId/car/:id" element={<CarDetailsPage />} />
  <Route path=":userId" element={<ProfileOverview />} />
</Route>
```

**Git History:**
- ✅ "fix: simplify NumericProfileRouter to use ProfilePageWrapper correctly"
- Previous: 385 lines with complex components
- Current: 73 lines (simple and efficient)

**موقع الملف:**
```
c:\Users\hamda\Desktop\New Globul Cars\bulgarian-car-marketplace\src\routes\NumericProfileRouter.tsx
```

---

### 2. الـ Layout Layer

#### `src/pages/03_user-pages/profile/ProfilePage/ProfilePageWrapper.tsx` ⭐ CRITICAL

**المسؤولية:** عرض الـ Layout الرئيسي للبروفايل وإدارة البيانات

**الحجم:** 348 سطر  
**الدوال الرئيسية:**
- `useProfile(targetUserId)` - تحميل البيانات
- `handleFollow()` - إدارة المتابعة
- `handleMessage()` - فتح الرسائل
- `handleGoogleSync()` - مزامجة Google

**الـ Context Injection:**
```typescript
<Outlet context={{
  user,           // بيانات المستخدم الأساسية
  viewer,         // المستخدم الحالي
  isOwnProfile,   // هل هو ملفك الخاص؟
  theme,          // الـ theme الحالي
  userCars,       // السيارات
  refresh,        // دالة التحديث
  setUser         // تعيين بيانات المستخدم
}} />
```

**موقع الملف:**
```
c:\Users\hamda\Desktop\New Globul Cars\bulgarian-car-marketplace\src\pages\03_user-pages\profile\ProfilePage\ProfilePageWrapper.tsx
```

---

### 3. الـ Data Layer

#### `src/pages/03_user-pages/profile/ProfilePage/hooks/useProfile.ts` ⭐ CRITICAL

**المسؤولية:** تحويل Numeric ID إلى Firebase UID وتحميل البيانات

**منطق العمل:**
```typescript
1. استقبال: targetUserId = "18"
2. كشف: isNumericId = /^\d+$/.test("18") → true
3. تحويل: getFirebaseUidByNumericId(18) → "firebaseUid"
4. تحميل: getUserProfileById("firebaseUid")
5. إرجاع: { user, target, viewer, userCars, ... }
```

**الدوال:**
- `isNumericId()` - كشف Numeric ID
- `getFirebaseUidByNumericId()` - التحويل
- `loadUserData()` - تحميل البيانات

**موقع الملف:**
```
c:\Users\hamda\Desktop\New Globul Cars\bulgarian-car-marketplace\src\pages\03_user-pages\profile\ProfilePage\hooks\useProfile.ts
```

---

#### `src/services/numeric-id-lookup.service.ts` ⭐ CRITICAL

**المسؤولية:** خدمة Firestore للبحث عن Firebase UID من Numeric ID

**الدوال:**
```typescript
export async function getFirebaseUidByNumericId(numericId: number): Promise<string>
// المثال:
// Input: 18
// Firestore Query: numericIds collection → id where numericId == 18
// Output: "firebaseUidXyz123"

export async function getUserByNumericId(numericId: number): Promise<BulgarianUser>
// يجمع بين التحويل وتحميل البيانات
```

**Firestore Collection:**
```
Collection: numericIds
  Document ID: [firebaseUid]
  Fields:
    - numericId: number
    - createdAt: timestamp
    - updatedAt: timestamp
```

**موقع الملف:**
```
c:\Users\hamda\Desktop\New Globul Cars\bulgarian-car-marketplace\src\services\numeric-id-lookup.service.ts
```

---

#### `src/services/numeric-id-counter.service.ts`

**المسؤولية:** إدارة عداد Numeric IDs في Cloud Functions

**الاستخدام:** عند إنشاء مستخدم جديد في Firebase Authentication

**الموقع:**
```
c:\Users\hamda\Desktop\New Globul Cars\bulgarian-car-marketplace\src\services\numeric-id-counter.service.ts
```

---

### 4. الـ Styling Layer

#### `src/pages/03_user-pages/profile/ProfilePage/styles.ts` ⭐ IMPORTANT

**الحجم:** 1854 سطر  
**المحتوى:**
- `ProfilePageContainer` - الحاوية الرئيسية
- `ProfileHeader` - رأس البروفايل
- `ProfileImage` - الصورة الشخصية
- `ProfileImageContainer` - حاوية الصورة
- `ProfileInfo` - معلومات المستخدم
- `CompletionBadge` - شارة الإكمال
- و 20+ styled component آخر

**الـ Animations:**
```typescript
const fadeIn = keyframes`...` // تلاشي عند التحميل
const pulse = keyframes`...`   // نبض الشارات
```

**الـ Responsive Breakpoints:**
```typescript
@media (max-width: 1024px) { ... }
@media (max-width: 768px) { ... }
@media (max-width: 480px) { ... }
```

**موقع الملف:**
```
c:\Users\hamda\Desktop\New Globul Cars\bulgarian-car-marketplace\src\pages\03_user-pages\profile\ProfilePage\styles.ts
```

---

#### `src/pages/03_user-pages/profile/ProfilePage/TabNavigation.styles.ts` ⭐ IMPORTANT

**الحجم:** 784 سطر  
**المحتوى:**
- `TabNavigation` - شريط التبويبات
- `TabButton` - زر التبويب الواحد
- `TabNavLink` - رابط التبويب
- `SyncButton` - زر المزامجة
- `FollowButton` - زر المتابعة

**الـ Gradient & Glow Effects:**
```typescript
// Active State
background: linear-gradient(135deg, rgba(255, 159, 42, 0.98) 0%, ...)
box-shadow: 0 8px 24px rgba(255, 143, 16, 0.35), ...

// Hover State
transform: translateY(-2px) scale(1.02);
```

**موقع الملف:**
```
c:\Users\hamda\Desktop\New Globul Cars\bulgarian-car-marketplace\src\pages\03_user-pages\profile\ProfilePage\TabNavigation.styles.ts
```

---

### 5. الـ Tab Components

#### `src/pages/03_user-pages/profile/ProfilePage/ProfileMyAds.tsx` ⭐ IMPORTANT

**الحجم:** 482 سطر  
**المسؤولية:** عرض وإدارة سيارات المستخدم

**الـ Features:**
- 10 خيارات ترتيب
- 4 خيارات تصفية
- شبكة responsive
- Empty state

**موقع الملف:**
```
c:\Users\hamda\Desktop\New Globul Cars\bulgarian-car-marketplace\src\pages\03_user-pages\profile\ProfilePage\ProfileMyAds.tsx
```

---

#### `src/pages/03_user-pages/profile/ProfilePage/tabs/SettingsTab.tsx` ⭐ IMPORTANT

**الحجم:** 3115 سطر (الملف الأكبر!)  
**المسؤولية:** إدارة الإعدادات الشاملة (9 أقسام)

**الأقسام:**
1. Edit Information (معلومات شخصية)
2. Account (معلومات الحساب)
3. Privacy (الخصوصية)
4. Notifications (الإخطارات)
5. Appearance (المظهر)
6. Security (الأمان)
7. Car Preferences (تفضيلات السيارات)
8. Data & Export (البيانات والتصدير)
9. Photo Upload (رفع الصورة)

**موقع الملف:**
```
c:\Users\hamda\Desktop\New Globul Cars\bulgarian-car-marketplace\src\pages\03_user-pages\profile\ProfilePage\tabs\SettingsTab.tsx
```

---

#### `src/pages/03_user-pages/profile/ProfilePage/tabs/ProfileOverview.tsx`

**المسؤولية:** عرض النظرة العامة للبروفايل

**موقع الملف:**
```
c:\Users\hamda\Desktop\New Globul Cars\bulgarian-car-marketplace\src\pages\03_user-pages\profile\ProfilePage\tabs\ProfileOverview.tsx
```

---

#### `src/pages/03_user-pages/profile/ProfilePage/ProfileCampaigns.tsx`

**المسؤولية:** عرض الحملات الإعلانية

**موقع الملف:**
```
c:\Users\hamda\Desktop\New Globul Cars\bulgarian-car-marketplace\src\pages\03_user-pages\profile\ProfilePage\ProfileCampaigns.tsx
```

---

#### `src/pages/03_user-pages/profile/ProfilePage/ProfileAnalytics.tsx`

**المسؤولية:** عرض الإحصائيات

**موقع الملف:**
```
c:\Users\hamda\Desktop\New Globul Cars\bulgarian-car-marketplace\src\pages\03_user-pages\profile\ProfilePage\ProfileAnalytics.tsx
```

---

### 6. الـ Theme & Global Styles

#### `src/styles/theme.ts`

**الحجم:** 452 سطر  
**المحتوى:**
- `bulgarianColors` - نظام الألوان
- `bulgarianTypography` - النصوص
- `bulgarianTheme` - الـ theme الكامل

**الألوان الأساسية:**
```typescript
primary.main: '#003366'          // أزرق داكن
secondary.main: '#CC0000'        // أحمر
accent.main: '#0066CC'           // أزرق للروابط
```

**موقع الملف:**
```
c:\Users\hamda\Desktop\New Globul Cars\bulgarian-car-marketplace\src\styles\theme.ts
```

---

#### `src/styles/unified-theme.css`

**المحتوى:** CSS Variables للـ Light و Dark modes

**المتغيرات:**
```css
--bg-primary
--bg-card
--text-primary
--text-secondary
--accent-primary
--accent-secondary
--border-primary
--shadow-sm
--shadow-md
--shadow-lg
```

**موقع الملف:**
```
c:\Users\hamda\Desktop\New Globul Cars\bulgarian-car-marketplace\src\styles\unified-theme.css
```

---

### 7. الـ Context Providers

#### `src/contexts/LanguageContext.tsx`

**المسؤولية:** إدارة اللغة (BG/EN)

**استخدام في البروفايل:**
```typescript
const { language, t } = useLanguage();
// language: 'bg' | 'en'
// t(key): ترجمة النصوص
```

**موقع الملف:**
```
c:\Users\hamda\Desktop\New Globul Cars\bulgarian-car-marketplace\src\contexts\LanguageContext.tsx
```

---

#### `src/contexts/ThemeContext.tsx`

**المسؤولية:** إدارة الـ Theme (Light/Dark)

**استخدام في البروفايل:**
```typescript
const { theme, setTheme } = useTheme();
// theme: 'light' | 'dark' | 'auto'
```

**موقع الملف:**
```
c:\Users\hamda\Desktop\New Globul Cars\bulgarian-car-marketplace\src\contexts/ThemeContext.tsx
```

---

#### `src/contexts/AuthProvider.tsx`

**المسؤولية:** إدارة تسجيل الدخول والمستخدم الحالي

**استخدام في البروفايل:**
```typescript
const { currentUser, isLoading } = useAuth();
// currentUser: { uid, email, displayName, ... }
```

**موقع الملف:**
```
c:\Users\hamda\Desktop\New Globul Cars\bulgarian-car-marketplace\src\contexts/AuthProvider.tsx
```

---

#### `src/contexts/ProfileTypeContext.tsx`

**المسؤولية:** إدارة نوع الملف الشخصي (Private/Dealer/Company)

**استخدام في البروفايل:**
```typescript
const { profileType, theme } = useProfileType();
// profileType: 'private' | 'dealer' | 'company'
// theme: ProfileTheme object
```

**موقع الملف:**
```
c:\Users\hamda\Desktop\New Globul Cars\bulgarian-car-marketplace\src\contexts/ProfileTypeContext.tsx
```

---

### 8. الـ Services

#### `src/services/profile/UnifiedProfileService.ts`

**المسؤولية:** خدمات إدارة البروفايل

**الدوال:**
- `getUserProfile(uid)`
- `updateProfile(uid, data)`
- `uploadProfileImage(uid, file)`
- `deleteProfileImage(uid)`

**موقع الملف:**
```
c:\Users\hamda\Desktop\New Globul Cars\bulgarian-car-marketplace\src\services/profile/UnifiedProfileService.ts
```

---

#### `src/services/car/unified-car.service.ts`

**المسؤولية:** خدمات إدارة السيارات

**الدوال:**
- `getUserCars(uid)`
- `getCar(carId)`
- `createCar(uid, data)`
- `updateCar(carId, data)`
- `deleteCar(carId)`

**موقع الملف:**
```
c:\Users\hamda\Desktop\New Globul Cars\bulgarian-car-marketplace\src\services/car/unified-car.service.ts
```

---

#### `src/services/logger-service.ts`

**المسؤولية:** التسجيل المركزي للأحداث

**الاستخدام:**
```typescript
logger.info('User logged in', { userId });
logger.error('Error', error, { context: 'profilePage' });
```

**موقع الملف:**
```
c:\Users\hamda\Desktop\New Globul Cars\bulgarian-car-marketplace\src\services/logger-service.ts
```

---

### 9. الـ Localization

#### `src/locales/translations.ts`

**المحتوى:** جميع النصوص بالبلغارية والإنجليزية

**مثال:**
```typescript
'profile.tabs.profile': { bg: 'Профил', en: 'Profile' },
'profile.tabs.myAds': { bg: 'Моите обяви', en: 'My Ads' },
'profile.tabs.campaigns': { bg: 'Кампании', en: 'Campaigns' },
...
```

**موقع الملف:**
```
c:\Users\hamda\Desktop\New Globul Cars\bulgarian-car-marketplace\src\locales/translations.ts
```

---

### 10. الـ Firebase Configuration

#### `src/firebase/firebase-config.ts`

**المحتوى:** إعدادات Firebase

**المتغيرات:**
```typescript
firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.REACT_APP_FIREBASE_APP_ID,
}
```

**موقع الملف:**
```
c:\Users\hamda\Desktop\New Globul Cars\bulgarian-car-marketplace\src\firebase/firebase-config.ts
```

---

### 11. البيئة

#### `.env` (في `bulgarian-car-marketplace/`)

**المتغيرات:**
```bash
REACT_APP_FIREBASE_API_KEY=...
REACT_APP_FIREBASE_AUTH_DOMAIN=...
REACT_APP_FIREBASE_PROJECT_ID=...
REACT_APP_FIREBASE_STORAGE_BUCKET=...
REACT_APP_GOOGLE_MAPS_API_KEY=...
REACT_APP_ALGOLIA_APP_ID=...
REACT_APP_HCAPTCHA_SITE_KEY=...
```

**موقع الملف:**
```
c:\Users\hamda\Desktop\New Globul Cars\bulgarian-car-marketplace\.env
```

---

## 🔄 Data Flow Diagram

```
User Request
    ↓
Browser: GET /profile/18
    ↓
React Router (React Router v7)
    ↓
NumericProfileRouter.tsx
    ↓
Detect: :userId = "18"
    ↓
ProfilePageWrapper.tsx
    ↓
Call: useProfile("18")
    ↓
useProfile Hook
    ├─ Detect: /^\d+$/.test("18") → true
    ├─ Call: getFirebaseUidByNumericId(18)
    ├─ Query: Firestore numericIds collection
    └─ Result: "firebaseUid123"
    ↓
Call: bulgarianAuthService.getUserProfileById("firebaseUid123")
    ↓
Load Data:
    ├─ user profile
    ├─ user cars
    ├─ viewer info
    └─ target info
    ↓
Render: ProfilePageWrapper
    ├─ Inject Context via <Outlet />
    └─ Render: <Outlet context={{...}} />
    ↓
Nested Routes:
    ├─ / → ProfileOverview
    ├─ /my-ads → ProfileMyAds
    ├─ /campaigns → ProfileCampaigns
    ├─ /analytics → ProfileAnalytics
    ├─ /settings → SettingsPage
    └─ /consultations → ProfileConsultations
    ↓
Display: User Profile Page with Numeric ID in URL ✓
```

---

## 📊 الملفات حسب الأهمية

### 🔴 حرجة (Critical)

```
1. NumericProfileRouter.tsx         (73 lines)
2. ProfilePageWrapper.tsx           (348 lines)
3. useProfile.ts                    (hook)
4. numeric-id-lookup.service.ts     (service)
5. numeric-id-counter.service.ts    (service)
```

### 🟠 مهمة (Important)

```
1. styles.ts                        (1854 lines)
2. TabNavigation.styles.ts          (784 lines)
3. SettingsTab.tsx                  (3115 lines)
4. ProfileMyAds.tsx                 (482 lines)
5. ProfileOverview.tsx              (layout)
6. ProfileCampaigns.tsx             (wrapper)
7. ProfileAnalytics.tsx             (wrapper)
```

### 🟡 داعمة (Supporting)

```
1. LanguageContext.tsx              (translations)
2. ThemeContext.tsx                 (theming)
3. AuthProvider.tsx                 (auth)
4. ProfileTypeContext.tsx           (profile types)
5. UnifiedProfileService.ts         (service)
6. unified-car.service.ts           (service)
7. logger-service.ts                (logging)
8. theme.ts                         (colors)
9. unified-theme.css                (css vars)
10. translations.ts                 (i18n)
11. firebase-config.ts              (firebase)
```

---

## 🔍 البحث عن الملفات

### البحث السريع (Quick Search)

```bash
# البحث عن ملفات البروفايل
find . -path "*profile*" -name "*.tsx"

# البحث عن الـ styles
find . -path "*profile*" -name "*.ts" | grep -i style

# البحث عن الـ services
find . -name "*numeric-id*"

# البحث عن الـ hooks
find . -path "*hooks*" -name "*.ts"
```

### البحث في VS Code

```
Ctrl + P (Windows/Linux)
Cmd + P (Mac)

Then type:
- "NumericProfileRouter" → finds the file
- "useProfile" → finds the hook
- "numeric-id-lookup" → finds the service
```

---

## 🚀 التشغيل والاختبار

### تشغيل المشروع

```bash
# من الجذر
npm install

# من bulgarian-car-marketplace
npm start

# الوصول إلى:
http://localhost:3000/profile
→ يحول إلى: http://localhost:3000/profile/18 (مثلاً)
```

### اختبار الـ Build

```bash
npm run build           # بناء عادي
npm run build:optimized # بناء محسّن
npm run test            # اختبارات
npm run test:ci         # اختبارات CI
```

---

## 📝 الملاحظات المهمة

1. **Numeric ID محفوظ في Firestore:**
   - Collection: `numericIds`
   - Document ID: Firebase UID
   - Field: `numericId` (number)

2. **Conversion يحدث في useProfile Hook:**
   - الـ Hook يكتشف الـ numeric ID
   - يحوله إلى Firebase UID
   - ثم يحمل البيانات

3. **Context Injection يحدث في ProfilePageWrapper:**
   - جميع البيانات تُمرر عبر <Outlet context={...} />
   - جميع الـ Tabs تستقبل البيانات من الـ context

4. **Responsive Design:**
   - Desktop: كامل الـ layout
   - Tablet: 2 صفوف من التبويبات
   - Mobile: sticky tabs + صورة فوق الغلاف
   - Small: عمود واحد فقط

5. **التحديثات:**
   - Git commit: "fix: simplify NumericProfileRouter..."
   - تاريخ: آخر تحديث
   - الحالة: ✅ جاهز للإنتاج

---

**✅ الخريطة كاملة وشاملة - جاهزة للتنفيذ**

