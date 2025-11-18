# 📝 قائمة الملفات المتأثرة - Files to Modify

## نظرة عامة
قائمة شاملة بجميع الملفات التي تحتاج تعديل في خطة الإصلاح

---

## 🔴 المرحلة 1: الإصلاحات الحرجة (أسبوع واحد)

### اليوم 1: إصلاح خطأ ProfilePage

#### ملف 1: carListingService.ts
**المسار:** `src/services/carListingService.ts`  
**السطر:** ~450  
**التعديل:**
```typescript
async getListingsBySellerId(sellerId: string): Promise<CarListing[]> {
  // ✅ إضافة فحص
  if (!sellerId || sellerId.trim() === '') {
    return [];
  }
  // ... rest
}
```

#### ملف 2: useProfile.ts
**المسار:** `src/pages/03_user-pages/profile/ProfilePage/hooks/useProfile.ts`  
**السطر:** ~80  
**التعديل:**
```typescript
const loadCarsForProfile = async (profile: BulgarianUser | null) => {
  // ✅ إضافة فحص أقوى
  if (!profile || !profile.uid) {
    setUserCars([]);
    return;
  }
  // ... rest
}
```

---

### اليوم 2-3: إصلاح isActive

#### ملف 3: sellWorkflowService.ts
**المسار:** `src/services/sellWorkflowService.ts`  
**السطر:** ~200  
**التعديل:**
```typescript
await addDoc(collection(db, 'cars'), {
  ...carData,
  sellerId: currentUser.uid,
  status: 'active',
  isActive: true,  // ✅ إضافة
  isSold: false,   // ✅ إضافة
  views: 0,
  favorites: 0
});
```

---

### اليوم 4-5: إصلاح الكاش

#### ملف 4: sellWorkflowService.ts (تحديث)
**المسار:** `src/services/sellWorkflowService.ts`  
**التعديل:**
```typescript
// بعد إضافة السيارة:
homePageCache.invalidate(CACHE_KEYS.FEATURED_CARS());
```

#### ملف 5: carListingService.ts (تحديث)
**المسار:** `src/services/carListingService.ts`  
**التعديل:**
```typescript
// في updateListing:
homePageCache.invalidate(CACHE_KEYS.FEATURED_CARS());

// في deleteListing:
homePageCache.invalidate(CACHE_KEYS.FEATURED_CARS());
```

#### ملف 6: car-service.ts
**المسار:** `src/firebase/car-service.ts`  
**التعديل:**
```typescript
// في updateCarListing:
homePageCache.invalidate(CACHE_KEYS.FEATURED_CARS());

// في deleteCarListing:
homePageCache.invalidate(CACHE_KEYS.FEATURED_CARS());
```

---

## 🟡 المرحلة 2: التوحيد (أسبوعان)

### ملف جديد: unified-car-service.ts
**المسار:** `src/services/unified-car-service.ts`  
**الحالة:** ملف جديد  
**المحتوى:**
```typescript
class UnifiedCarService {
  async getFeaturedCars(limit: number) { }
  async searchCars(filters: BasicFilters) { }
  async advancedSearch(filters: AdvancedFilters) { }
  async getUserCars(userId: string) { }
  private async buildQuery(filters: any) { }
}
```

### الملفات للتحديث:

#### ملف 7: FeaturedCarsSection.tsx
**المسار:** `src/pages/01_main-pages/home/HomePage/FeaturedCarsSection.tsx`  
**التعديل:**
```typescript
// استبدال:
import { bulgarianCarService } from '@/firebase/car-service';
// بـ:
import { unifiedCarService } from '@/services/unified-car-service';
```

#### ملف 8: FeaturedCars.tsx
**المسار:** `src/components/FeaturedCars.tsx`  
**التعديل:**
```typescript
// استبدال:
const result = await bulgarianCarService.searchCars(...);
// بـ:
const result = await unifiedCarService.getFeaturedCars(limit);
```

#### ملف 9: CarsPage/index.tsx
**المسار:** `src/pages/01_main-pages/cars/CarsPage/index.tsx`  
**التعديل:**
```typescript
// استبدال:
import carListingService from '@/services/carListingService';
// بـ:
import { unifiedCarService } from '@/services/unified-car-service';
```

#### ملف 10: useProfile.ts (تحديث)
**المسار:** `src/pages/03_user-pages/profile/ProfilePage/hooks/useProfile.ts`  
**التعديل:**
```typescript
// استبدال:
import carListingService from '@/services/carListingService';
// بـ:
import { unifiedCarService } from '@/services/unified-car-service';
```

#### ملف 11: useAdvancedSearch.ts
**المسار:** `src/pages/05_search-browse/advanced-search/AdvancedSearchPage/hooks/useAdvancedSearch.ts`  
**التعديل:**
```typescript
// الإبقاء على algoliaSearchService
// لكن إضافة fallback:
import { unifiedCarService } from '@/services/unified-car-service';
```

---

## 🟢 المرحلة 3: Migration البيانات (أسبوع واحد)

### ملف جديد: migrate-car-fields.ts
**المسار:** `scripts/migrate-car-fields.ts`  
**الحالة:** ملف جديد  
**الوظيفة:**
```typescript
// 1. توحيد sellerId/userId → sellerId
// 2. إضافة isActive للسيارات القديمة
// 3. توحيد power/horsepower → power
// 4. توحيد transmission/gearbox → transmission
```

### الملفات للتحديث:

#### ملف 12: car-service.ts (BulgarianCar interface)
**المسار:** `src/firebase/car-service.ts`  
**التعديل:**
```typescript
export interface BulgarianCar {
  // ❌ حذف:
  // horsepower?: number;
  // gearbox?: string;
  
  // ✅ الإبقاء على:
  power: number;
  transmission: string;
}
```

#### ملف 13: CarListing.ts
**المسار:** `src/types/CarListing.ts`  
**التعديل:**
```typescript
export interface CarListing {
  // ❌ تصحيح:
  images: string[];  // كانت File[]
  
  // ✅ إضافة:
  isActive: boolean;
  isSold: boolean;
}
```

#### ملف 14: GarageSection_Pro.tsx
**المسار:** `src/components/Profile/GarageSection_Pro.tsx`  
**التعديل:**
```typescript
export interface GarageCar {
  // ❌ حذف التكرار:
  // horsepower?: number;
  // power?: number;
  
  // ✅ توحيد:
  power: number;
}
```

---

## 📊 ملخص الملفات

### حسب النوع:

#### خدمات (Services): 4 ملفات
1. ✅ carListingService.ts (تحديث)
2. ✅ sellWorkflowService.ts (تحديث)
3. ✅ car-service.ts (تحديث)
4. ✅ unified-car-service.ts (جديد)

#### Hooks: 2 ملفات
5. ✅ useProfile.ts (تحديث)
6. ✅ useAdvancedSearch.ts (تحديث)

#### صفحات (Pages): 3 ملفات
7. ✅ FeaturedCarsSection.tsx (تحديث)
8. ✅ CarsPage/index.tsx (تحديث)
9. ✅ ProfileMyAds.tsx (تحديث)

#### مكونات (Components): 2 ملفات
10. ✅ FeaturedCars.tsx (تحديث)
11. ✅ GarageSection_Pro.tsx (تحديث)

#### Types: 2 ملفات
12. ✅ car-service.ts (BulgarianCar interface)
13. ✅ CarListing.ts (interface)

#### Scripts: 1 ملف
14. ✅ migrate-car-fields.ts (جديد)

---

## 🎯 الأولويات

### 🔴 حرجة (الأسبوع 1):
- carListingService.ts
- useProfile.ts
- sellWorkflowService.ts

### 🟡 عالية (الأسبوع 2-3):
- unified-car-service.ts (جديد)
- FeaturedCars.tsx
- CarsPage/index.tsx
- useProfile.ts (تحديث ثاني)

### 🟢 متوسطة (الأسبوع 4):
- migrate-car-fields.ts (جديد)
- car-service.ts (interfaces)
- CarListing.ts
- GarageSection_Pro.tsx

---

## ✅ Checklist التنفيذ

### قبل التعديل:
- [ ] نسخ احتياطي للملفات
- [ ] إنشاء branch جديد
- [ ] مراجعة التغييرات المطلوبة

### أثناء التعديل:
- [ ] تعديل ملف واحد في كل مرة
- [ ] اختبار بعد كل تعديل
- [ ] Commit بعد كل ملف

### بعد التعديل:
- [ ] اختبار شامل
- [ ] Code review
- [ ] Merge إلى main

---

## 📝 ملاحظات مهمة

### للملفات الجديدة:
- ✅ unified-car-service.ts: إنشاء من الصفر
- ✅ migrate-car-fields.ts: تشغيل مرة واحدة فقط

### للملفات المحذوفة (بعد التوحيد):
- ❌ carListingService.ts (بعد نقل الوظائف)
- ❌ advancedSearchService.ts (دمج مع unified)

### للملفات المعدلة:
- ⚠️ احتفظ بنسخة احتياطية
- ⚠️ اختبر قبل وبعد
- ⚠️ راجع الارتباطات

---

*آخر تحديث: 2025-01-XX*  
*الحالة: جاهز للتنفيذ*
