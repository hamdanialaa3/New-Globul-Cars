# 📋 Migration Guide: Deprecated Services
**التاريخ**: 15 ديسمبر 2025  
**الحالة**: Active Deprecation Period  
**الإزالة النهائية**: مارس 2026  

---

## 🚨 الخدمات المهجورة (Deprecated Services)

### 1. carDataService.ts ❌

**الحالة**: DEPRECATED  
**السبب**: تم استبداله بـ UnifiedCarService  
**تاريخ الإهجار**: 15 ديسمبر 2025  
**الإزالة**: مارس 2026  

#### Migration Path

```typescript
// ❌ قديم (DEPRECATED)
import { carDataService } from '@/services/carDataService';

const brands = carDataService.getAllBrands();
const cars = carDataService.getCarsByBrand('BMW');
const categories = carDataService.getCategoriesForBrand('BMW');

// ✅ جديد (Recommended)
import { unifiedCarService } from '@/services/car/unified-car.service';
import { CAR_DATA, getAllMakes } from '@/constants/carData';

// For searching cars
const cars = await unifiedCarService.searchCars({ make: 'BMW' });

// For static data (brands, models, etc.)
const makes = getAllMakes();
const bmwData = CAR_DATA['BMW'];
```

#### Method Mapping

| القديم (Old) | الجديد (New) |
|-------------|-------------|
| `carDataService.getAllBrands()` | `getAllMakes()` من `@/constants/carData` |
| `carDataService.getCarsByBrand(brand)` | `unifiedCarService.searchCars({ make: brand })` |
| `carDataService.getBrandData(brand)` | `CAR_DATA[brand]` من `@/constants/carData` |
| `carDataService.searchCars(query)` | `unifiedCarService.searchCars(filters)` |
| `carDataService.getCategoriesForBrand()` | استخدم `CAR_DATA` مباشرة |

---

### 2. firebase-auth-users-service.ts ❌

**الحالة**: DEPRECATED  
**السبب**: تم استبداله بـ canonical-user.service.ts  
**تاريخ الإهجار**: 15 ديسمبر 2025  
**الإزالة**: مارس 2026  

#### Migration Path

```typescript
// ❌ قديم (DEPRECATED)
import { getUsersDirectory } from '@/services/firebase-auth-users-service';

const users = await getUsersDirectory({ limit: 10 });

// ✅ جديد (Recommended)
import { userService } from '@/services/user/canonical-user.service';

const users = await userService.searchUsers({ limit: 10 });
```

#### Method Mapping

| القديم (Old) | الجديد (New) |
|-------------|-------------|
| `getUsersDirectory()` | `userService.searchUsers()` |
| `getUserProfile(uid)` | `userService.getUserProfile(uid)` |
| `updateUserProfile(uid, data)` | `userService.updateUserProfile(uid, data)` |
| `getUserStats(uid)` | `userService.getUserStats(uid)` |

---

### 3. carService.ts (من firebase/) ❌

**الحالة**: DEPRECATED  
**السبب**: دالات متفرقة تم توحيدها في UnifiedCarService  
**تاريخ الإهجار**: 15 ديسمبر 2025  
**الإزالة**: مارس 2026  

#### Migration Path

```typescript
// ❌ قديم (DEPRECATED)
import { getCarById, updateCar } from '@/firebase/car-service';

const car = await getCarById(id);
await updateCar(id, updates);

// ✅ جديد (Recommended)
import { unifiedCarService } from '@/services/car/unified-car.service';

const car = await unifiedCarService.getCarById(id);
await unifiedCarService.updateCar(id, updates);
```

---

## 🔧 خطوات الترحيل (Migration Steps)

### الخطوة 1: تحديث الـ imports

```bash
# ابحث عن جميع الاستخدامات
grep -r "from '@/services/carDataService'" src/
grep -r "from '@/services/firebase-auth-users-service'" src/
grep -r "from '@/firebase/car-service'" src/
```

### الخطوة 2: استبدال الـ imports

استخدم Find & Replace في VSCode:

```
Find:    from '@/services/carDataService'
Replace: from '@/services/car/unified-car.service'
```

### الخطوة 3: تحديث الدوال

راجع Method Mapping أعلاه لكل خدمة وحدّث الدوال المستخدمة.

### الخطوة 4: اختبار التطبيق

```bash
# تشغيل الاختبارات
npm test

# تشغيل التطبيق
npm start
```

### الخطوة 5: حذف الـ imports القديمة

بعد التأكد من عمل كل شيء، يمكن حذف الخدمات القديمة من `ARCHIVE/`.

---

## ⚠️ تحذيرات مهمة

### Development Warnings

في بيئة التطوير (development)، سترى تحذيرات عند استخدام الخدمات المهجورة:

```
╔═══════════════════════════════════════════════════════════════════════╗
║                      ⚠️  DEPRECATION WARNING  ⚠️                        ║
╠═══════════════════════════════════════════════════════════════════════╣
║  You are using a DEPRECATED service: carDataService.ts                ║
║                                                                       ║
║  This service will be REMOVED in v2.0.0 (March 2026)                ║
║                                                                       ║
║  Please migrate to:                                                  ║
║  → UnifiedCarService (@/services/car/unified-car.service)           ║
╚═══════════════════════════════════════════════════════════════════════╝
```

### Production Impact

في بيئة الإنتاج (production):
- التحذيرات لن تظهر في Console
- لكن سيتم تسجيلها في Logger Service
- الأداء قد يتأثر (الخدمات القديمة أبطأ)

---

## 📊 حالة الترحيل

### ✅ الملفات المحدثة

```
✅ FeaturedCars.tsx
✅ CarDetailsPage.tsx
✅ MyListingsPage.tsx
✅ AdminCarManagementPage.tsx
✅ TopBrandsPage.tsx
✅ SearchResults.tsx
```

### ⚠️ الملفات التي تحتاج تحديث

قم بالبحث عن:
```bash
# للعثور على جميع الاستخدامات المتبقية
npm run find:deprecated
```

---

## 🆘 الحصول على المساعدة

إذا واجهت مشاكل في الترحيل:

1. **راجع الأمثلة** في `docs/migration-examples/`
2. **اطلع على Tests** في `__tests__/unified-car.service.test.ts`
3. **اتصل بالفريق** عبر Slack #migration-help

---

## 📅 الجدول الزمني

| التاريخ | الحدث |
|--------|------|
| 15 ديسمبر 2025 | بداية Deprecation Period |
| 31 يناير 2026 | تحذير Final Migration Reminder |
| 28 فبراير 2026 | آخر موعد للترحيل |
| 1 مارس 2026 | إزالة الخدمات القديمة نهائياً |

---

**آخر تحديث**: 15 ديسمبر 2025  
**المصدر**: [DEEP_TECHNICAL_ANALYSIS_REPORT_DEC_15_2025.md](../DEEP_TECHNICAL_ANALYSIS_REPORT_DEC_15_2025.md)
