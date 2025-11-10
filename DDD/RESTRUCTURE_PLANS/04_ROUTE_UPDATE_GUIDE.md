# 🗺️ دليل تحديث المسارات
## Route Update Guide

---

## 📝 ملفات تحتاج تحديث

### 1️⃣ App.tsx (الأهم!)

```typescript
// filepath: bulgarian-car-marketplace/src/App.tsx
// قبل التعديل
const HomePage = React.lazy(() => import('./pages/HomePage'));
const VehicleStartPageNew = React.lazy(() => import('./pages/VehicleStartPageNew'));
const MobileVehicleStartPageNew = React.lazy(() => import('./pages/MobileVehicleStartPageNew'));

// بعد التعديل
const HomePage = React.lazy(() => import('./pages/01_core/HomePage'));
const VehicleStartPageNew = React.lazy(() => import('./pages/04_sell/_workflow/VehicleStartPageNew'));
const MobileVehicleStartPageNew = React.lazy(() => import('./pages/04_sell/_mobile/MobileVehicleStartPageNew'));
```

---

### 2️⃣ Route definitions

```typescript
// filepath: bulgarian-car-marketplace/src/App.tsx
// ...existing code...

// Core routes - لا تغيير في paths!
<Route path="/" element={<Layout><Suspense fallback={<LoadingSpinner />}><HomePage /></Suspense></Layout>} />
<Route path="/about" element={<Layout><Suspense fallback={<LoadingSpinner />}><AboutPage /></Suspense></Layout>} />

// Sell routes - لا تغيير في paths!
<Route path="/sell/vehicle-start" element={<FullScreenLayout><Suspense fallback={<LoadingSpinner />}><VehicleStartPageNew /></Suspense></FullScreenLayout>} />
<Route path="/sell/seller-type" element={<FullScreenLayout><Suspense fallback={<LoadingSpinner />}><SellerTypePageNew /></Suspense></FullScreenLayout>} />

// ...existing code...
```

**ملاحظة مهمة:** نحن نُغيّر فقط مسار الـ import، **وليس** path في URL!

---

### 3️⃣ ملفات أخرى قد تحتاج تحديث

#### ProfileRouter.tsx

```typescript
// filepath: bulgarian-car-marketplace/src/pages/05_profile/ProfilePage/ProfileRouter.tsx
// قبل
import EditProfilePage from '../../EditProfilePage';
import MyListingsPage from '../../MyListingsPage';

// بعد
import EditProfilePage from '../EditProfilePage';
import MyListingsPage from '../MyListingsPage';
```

#### Navigation components

```typescript
// filepath: bulgarian-car-marketplace/src/components/Header/index.tsx
// المسارات تبقى كما هي (لا تغيير!)
<Link to="/sell/vehicle-start">Sell Car</Link>
<Link to="/about">About</Link>
```

---

## ✅ قائمة التحقق الشاملة

### قبل التشغيل:
- [ ] نسخة احتياطية Git
- [ ] فهم الفرق بين import path و route path
- [ ] تحديد جميع الملفات المتأثرة

### أثناء التشغيل:
- [ ] تحديث lazy imports في App.tsx
- [ ] التحقق من relative imports داخل الملفات المنقولة
- [ ] البحث عن direct imports في ملفات أخرى

### بعد التشغيل:
- [ ] تشغيل `npm run build`
- [ ] التحقق من عدم وجود أخطاء TypeScript
- [ ] اختبار كل route يدوياً
- [ ] التحقق من navigation links

---

## 🔍 أدوات البحث والاستبدال

### VS Code Find & Replace

```regex
# البحث عن جميع imports من pages/
import.*from ['"]\.\/pages\/([^'"]*)['"]

# الاستبدال (بعد التحليل اليدوي!)
# تختلف حسب كل حالة
```

### Grep في Terminal

```bash
# البحث عن جميع imports من HomePage
grep -r "from.*HomePage" bulgarian-car-marketplace/src/

# البحث عن sell workflow imports
grep -r "from.*VehicleStartPageNew" bulgarian-car-marketplace/src/
```

---

## ⚠️ تحذيرات هامة

### 1. لا تُغيّر route paths!

```typescript
// ❌ خطأ
<Route path="/01_core/home" element={...} />

// ✅ صحيح
<Route path="/" element={...} />
```

### 2. احذر من circular imports

```typescript
// ❌ خطأ - circular dependency
// File A imports B, B imports A

// ✅ صحيح - استخدم barrel exports
// src/pages/index.ts exports all pages
```

### 3. استخدم absolute imports عند الإمكان

```typescript
// ❌ تجنب
import MyComponent from '../../../components/MyComponent';

// ✅ أفضل
import MyComponent from '@/components/MyComponent';
```

---

**التالي:** راجع `05_TESTING_CHECKLIST.md` لقائمة الاختبارات الشاملة