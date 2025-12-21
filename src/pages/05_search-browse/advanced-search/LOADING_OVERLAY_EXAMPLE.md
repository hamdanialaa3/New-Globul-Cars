// src/pages/05_search-browse/advanced-search/LOADING_OVERLAY_EXAMPLE.md
# مثال عملي: استخدام LoadingOverlay

هذا المثال يوضح كيفية دمج LoadingOverlay في صفحة البحث المتقدم

## المثال الكامل

```tsx
// AdvancedSearchPage.tsx
import React, { useState } from 'react';
import { useLoadingOverlay } from '@/hooks/useLoadingOverlay';
import { useLoadingWrapper } from '@/services/with-loading';
import * as carService from '@/services/car-service';

interface AdvancedSearchPageProps {}

const AdvancedSearchPage: React.FC<AdvancedSearchPageProps> = () => {
  const [searchResults, setSearchResults] = useState([]);
  const { showLoading, hideLoading } = useLoadingOverlay();
  const { withLoading } = useLoadingWrapper();

  // الطريقة 1: استخدام withLoading
  const handleSearchWithWrapper = withLoading(
    async (filters) => {
      const results = await carService.searchCars(filters);
      setSearchResults(results);
      return results;
    },
    'جاري البحث عن السيارات...'
  );

  // الطريقة 2: استخدام showLoading/hideLoading يدويًا
  const handleAdvancedSearch = async (filters: any) => {
    showLoading('جاري تطبيق المرشحات...');
    
    try {
      const results = await carService.searchWithFilters(filters);
      setSearchResults(results);
    } catch (error) {
      console.error('خطأ في البحث:', error);
      // يمكن إضافة معالجة خطأ هنا
    } finally {
      hideLoading();
    }
  };

  return (
    <div>
      <h1>البحث المتقدم عن السيارات</h1>
      
      {/* نموذج البحث */}
      <SearchForm onSubmit={handleSearchWithWrapper} />
      
      {/* النتائج */}
      {searchResults.length > 0 && (
        <SearchResults results={searchResults} />
      )}
    </div>
  );
};

export default AdvancedSearchPage;
```

---

## حالات الاستخدام الشائعة

### 1. جلب السيارات المميزة

```tsx
const { withLoading } = useLoadingWrapper();

const loadFeaturedCars = withLoading(
  async () => {
    const cars = await carService.getFeaturedCars();
    setFeaturedCars(cars);
  },
  'جاري تحميل السيارات المميزة...'
);
```

### 2. حفظ قائمة المفضلة

```tsx
const { showLoading, hideLoading } = useLoadingOverlay();

const handleSaveFavorite = async (carId: string) => {
  showLoading('جاري الحفظ...');
  try {
    await favoriteService.addFavorite(carId);
  } finally {
    hideLoading();
  }
};
```

### 3. تحميل تفاصيل السيارة

```tsx
useEffect(() => {
  const { showLoading, hideLoading } = useLoading();
  
  const loadCarDetails = async () => {
    showLoading('جاري تحميل التفاصيل...');
    try {
      const carData = await carService.getCarById(carId);
      setCarData(carData);
    } finally {
      hideLoading();
    }
  };
  
  loadCarDetails();
}, [carId]);
```

### 4. حذف إعلان

```tsx
const { showLoading, hideLoading } = useLoadingOverlay();

const handleDeleteListing = async (carId: string) => {
  showLoading('جاري الحذف...');
  try {
    await carService.deleteCar(carId);
    // تحديث القائمة
    refetchListings();
  } catch (error) {
    toast.error('فشل حذف الإعلان');
  } finally {
    hideLoading();
  }
};
```

---

## نصائح مهمة

✅ **استخدم try/finally**: لضمان إغلاق LoadingOverlay دائماً
✅ **رسائل واضحة**: اجعل الرسائل معبّرة عن العملية الجارية
✅ **التعامل مع الأخطاء**: أغلق LoadingOverlay حتى عند حدوث خطأ
✅ **تجنب التداخل**: لا تفتح LoadingOverlay متعددة في نفس الوقت

---

## الملفات المرتبطة

- `src/components/LoadingOverlay/LoadingOverlay.tsx`
- `src/contexts/LoadingContext.tsx`
- `src/hooks/useLoadingOverlay.ts`
- `src/services/with-loading.ts`
