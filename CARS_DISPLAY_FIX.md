# ✅ إصلاح مشكلة عدم ظهور الإعلانات في الصفحة الرئيسية

**التاريخ:** 27 ديسمبر 2025  
**المشكلة:** الإعلانات `/car/80/1` و `/car/80/2` لا تظهر في الصفحة الرئيسية

---

## 🔍 تحليل المشكلة

المشكلة كانت في **عدم التوافق بين أنظمة الفلترة المختلفة**:

1. **LatestCarsSection** كان يستخدم: `where('status', '==', 'published')`
2. **getFeaturedCars** كان يستخدم: `where('isActive', '==', true)` و `where('isSold', '==', false)`
3. **getNewCarsLast24Hours** كان يستخدم: نفس شروط getFeaturedCars

السيارات الجديدة قد تستخدم:
- `status: 'published'` أو `status: 'active'`
- أو `isActive: true` بدون حقل `status`
- أو كلا الحقلين معاً

---

## ✅ الحل المنفذ

تم توحيد الفلترة في جميع الدوال لدعم **جميع الصيغ المحتملة**:

### 1. getFeaturedCars()
- تم إزالة `where` clauses الصارمة
- استخدام استعلام بسيط: `orderBy('createdAt', 'desc')` فقط
- فلترة client-side لدعم:
  - `status === 'published'` أو `status === 'active'`
  - `isActive === true` (أو غير محدد = true افتراضياً)
  - `isSold !== true` و `status !== 'sold'`

### 2. getNewCarsLast24Hours()
- نفس التحسين: استخدام `where('createdAt', '>=', timestamp)` فقط
- فلترة client-side بنفس الشروط الموحدة

### 3. LatestCarsSection
- إزالة `where('status', '==', 'published')`
- استخدام `orderBy('createdAt', 'desc')` فقط
- فلترة client-side بنفس الشروط الموحدة

---

## 📝 الكود الجديد (فلترة موحدة)

```typescript
.filter(car => {
  // Support multiple status formats: status='published'/'active', or isActive=true
  const isActive = car.isActive !== false; // Default to true if missing
  const isSold = car.isSold === true; // Default to false if missing
  const status = (car as any).status;
  const isPublished = status === 'published' || status === 'active';
  const isNotSoldStatus = status !== 'sold';
  
  // Include car if: (isActive OR status='published'/'active') AND NOT sold
  return (isActive || isPublished) && !isSold && isNotSoldStatus;
});
```

---

## 🎯 النتيجة

الآن جميع السيارات التي:
- ✅ لديها `status: 'published'` أو `status: 'active'`
- ✅ أو لديها `isActive: true` (أو غير محدد)
- ✅ وليست `isSold: true` أو `status: 'sold'`

ستظهر في:
- Featured Cars Section
- New Cars Section (آخر 24 ساعة)
- Latest Cars Section

---

## 📁 الملفات المعدلة

1. `src/services/car/unified-car-queries.ts`
   - `getFeaturedCars()` - تم تحديث الفلترة
   - `getNewCarsLast24Hours()` - تم تحديث الفلترة

2. `src/pages/01_main-pages/home/HomePage/LatestCarsSection.tsx`
   - `fetchLatestCars()` - تم تحديث الاستعلام والفلترة

---

## ⚠️ ملاحظة مهمة

تم زيادة `limit` في الاستعلامات من `limitCount * 2` إلى `limitCount * 4` لتعويض الفلترة client-side. هذا قد يزيد قليلاً في عدد documents المُجلب، لكنه يضمن ظهور جميع السيارات المؤهلة.

---

**تم التنفيذ بواسطة:** AI Assistant  
**التاريخ:** 27 ديسمبر 2025  
**الحالة:** ✅ مكتمل
