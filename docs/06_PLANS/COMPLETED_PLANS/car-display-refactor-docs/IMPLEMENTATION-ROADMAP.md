# 🗺️ خريطة طريق التنفيذ - Implementation Roadmap

## نظرة عامة
خطة تنفيذ مفصلة لإصلاح نظام عرض السيارات بالكامل

---

## المرحلة 1: الإصلاحات الحرجة (أسبوع واحد)

### اليوم 1: إصلاح الخطأ الحالي
**الملفات:**
- `src/services/carListingService.ts`
- `src/pages/03_user-pages/profile/ProfilePage/hooks/useProfile.ts`

**التغييرات:**
```typescript
// carListingService.ts
async getListingsBySellerId(sellerId: string) {
  if (!sellerId || sellerId.trim() === '') {
    return [];
  }
  // ... rest
}

// useProfile.ts
const loadCarsForProfile = async (profile: BulgarianUser | null) => {
  if (!profile || !profile.uid) {
    setUserCars([]);
    return;
  }
  // ... rest
}
```

### اليوم 2-3: إصلاح SellPage
**الملف:** `src/services/sellWorkflowService.ts`

**التغييرات:**
```typescript
await addDoc(collection(db, 'cars'), {
  ...carData,
  sellerId: currentUser.uid,
  status: 'active',
  isActive: true,  // ✅ إضافة
  isSold: false,
  views: 0,
  favorites: 0
});
```

### اليوم 4-5: إصلاح الكاش
**الملفات:**
- `src/services/sellWorkflowService.ts`
- `src/services/carListingService.ts`
- `src/firebase/car-service.ts`

**التغييرات:**
```typescript
// بعد كل عملية:
homePageCache.invalidate(CACHE_KEYS.FEATURED_CARS());
```

---

## المرحلة 2: التوحيد (أسبوعان)

### الأسبوع 1: إنشاء UnifiedCarService
**ملف جديد:** `src/services/unified-car-service.ts`

### الأسبوع 2: Migration
- تحديث HomePage
- تحديث CarsPage
- تحديث ProfilePage
- حذف الخدمات القديمة

---

## المرحلة 3: Migration البيانات (أسبوع واحد)

### Migration Script
**ملف جديد:** `scripts/migrate-car-fields.ts`

**الوظائف:**
1. توحيد sellerId/userId → sellerId
2. إضافة isActive للسيارات القديمة
3. توحيد power/horsepower → power
4. توحيد transmission/gearbox → transmission

---

## المرحلة 4: الاختبار (أسبوع واحد)

### اختبارات شاملة:
- اختبار إضافة سيارة
- اختبار تعديل سيارة
- اختبار حذف سيارة
- اختبار البحث
- اختبار الكاش

---

## الجدول الزمني الكامل: 5 أسابيع

**الأسبوع 1:** إصلاحات حرجة  
**الأسبوع 2-3:** توحيد الخدمات  
**الأسبوع 4:** Migration البيانات  
**الأسبوع 5:** اختبار ونشر
