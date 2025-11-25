# 🗑️ سلة المهملات - Trash / Deprecated Files

**تاريخ الإنشاء:** 2025-01-21  
**الموقع:** الجذر الرئيسي للمشروع (`New Globul Cars/سلة المهملات/`)  
**الغرض:** حفظ الملفات المكررة والـ deprecated قبل الحذف النهائي

---

## ⚠️ تحذير

**هذه الملفات غير مستخدمة في الإنتاج**  
**يتم الاحتفاظ بها للرجوع إليها فقط**  
**سيتم حذفها نهائياً بعد التحقق**

---

## 📋 قائمة الملفات المهملة

### Services (الخدمات)

#### 1. `carListingService.ts.deprecated`
- **السبب:** تم استبداله بـ `UnifiedCarService`
- **التاريخ:** 2025-01-21
- **الاستبدال:** `src/services/car/unified-car.service.ts`
- **الملفات التي تم تحديثها:**
  - ✅ `EditCarPage.tsx` → يستخدم `unifiedCarService`
  - ✅ `NearbyCarsFinder.tsx` → يستخدم `unifiedCarService`
  - ✅ `TopBrandsPage/index.tsx` → يستخدم `unifiedCarService`

#### 2. `car-service.ts.deprecated` (BulgarianCarService)
- **السبب:** تم استبداله بـ `UnifiedCarService`
- **التاريخ:** 2025-01-21
- **الاستبدال:** `src/services/car/unified-car.service.ts`
- **الملفات التي تم تحديثها:**
  - ✅ `TopBrandsPage/index.tsx` → يستخدم `unifiedCarService`
  - ✅ `smart-search.service.ts` → يستخدم `UnifiedCar` بدلاً من `BulgarianCar`
  - ✅ `search-personalization.service.ts` → يستخدم `UnifiedCar` بدلاً من `BulgarianCar`
  - ✅ `SearchResultsMap.tsx` → يستخدم `UnifiedCar` بدلاً من `BulgarianCar`
  - ✅ `seo.ts` → يستخدم `UnifiedCar` بدلاً من `BulgarianCar`
  - ✅ `firebase/index.ts` → تم تعطيل export لـ `car-service`

#### 3. `bulgarian-profile-service.facade.ts.deprecated`
- **السبب:** Facade deprecated - تم استبداله بـ `canonical-user.service`
- **التاريخ:** 2025-01-21
- **الاستبدال:** `src/services/user/canonical-user.service.ts`
- **الملفات التي تم تحديثها:**
  - ✅ جميع الملفات تستخدم الآن `canonical-user.service` مباشرة

#### 4. `dealership-adapter.service.ts`
- **السبب:** Adapter deprecated - تم استبداله بـ `dealership.service`
- **التاريخ:** 2025-01-21
- **الاستبدال:** `src/services/dealership/dealership.service.ts`
- **الملفات التي تم تحديثها:**
  - ✅ `PrivacySettingsManager.tsx` → يستخدم `dealership.service`
  - ✅ `DealerRegistrationPage.tsx` → يستخدم `dealership.service`

### Types (الأنواع)

#### 5. `dealership.types.ts.deprecated`
- **السبب:** نسخة مكررة - تم توحيد الأنواع
- **التاريخ:** 2025-01-21
- **الاستبدال:** `src/types/dealership/dealership.types.ts` (النسخة الصحيحة)

### Pages (الصفحات)

#### 6. `ProfileSettingsNew.tsx.deprecated`
- **السبب:** صفحة deprecated - تم استبدالها بـ `ProfileSettingsMobileDe.tsx`
- **التاريخ:** 2025-01-21
- **الاستبدال:** `src/pages/03_user-pages/profile/ProfilePage/ProfileSettingsMobileDe.tsx`
- **Route المحذوف:** `/profile/settings-new` (لم يعد موجوداً في `ProfileRouter.tsx`)

---

## 🔄 خطة الترحيل المكتملة

### ✅ تم إكماله:

1. **توحيد خدمات السيارات:**
   - ✅ نقل `carListingService.ts` → `deprecated/services/`
   - ✅ نقل `car-service.ts` → `deprecated/services/`
   - ✅ تحديث جميع الاستخدامات إلى `UnifiedCarService`
   - ✅ تحديث الأنواع من `CarListing` إلى `UnifiedCar` حيث لزم الأمر

2. **توحيد خدمات البروفايل:**
   - ✅ نقل `bulgarian-profile-service.facade.ts` → `deprecated/services/`
   - ✅ جميع الملفات تستخدم `canonical-user.service` مباشرة

3. **توحيد خدمات Dealership:**
   - ✅ نقل `dealership-adapter.service.ts` → `deprecated/services/`
   - ✅ تحديث `PrivacySettingsManager.tsx` و `DealerRegistrationPage.tsx` لاستخدام `dealership.service`

4. **تنظيف الأنواع:**
   - ✅ نقل `dealership.types.ts` المكرر → `deprecated/types/`

5. **تنظيف الصفحات:**
   - ✅ نقل `ProfileSettingsNew.tsx` → `deprecated/pages/`
   - ✅ Route `/profile/settings-new` لم يعد موجوداً

---

## 📝 ملاحظات مهمة

### قبل الحذف النهائي:

1. **التحقق من عدم وجود imports:**
   ```bash
   # البحث عن أي استخدامات متبقية
   grep -r "carListingService" src/
   grep -r "bulgarianCarService" src/
   grep -r "bulgarian-profile-service.facade" src/
   grep -r "dealership-adapter" src/
   grep -r "ProfileSettingsNew" src/
   ```

2. **التحقق من عدم وجود أخطاء في البناء:**
   ```bash
   npm run build
   ```

3. **التحقق من الاختبارات:**
   ```bash
   npm test
   ```

---

## 🗑️ الحذف النهائي

بعد التحقق من جميع النقاط أعلاه، يمكن حذف هذا المجلد بالكامل:

```bash
rm -rf src/deprecated
```

أو في Windows:
```powershell
Remove-Item -Recurse -Force src\deprecated
```

---

**آخر تحديث:** 2025-01-21  
**المسؤول:** AI Assistant
