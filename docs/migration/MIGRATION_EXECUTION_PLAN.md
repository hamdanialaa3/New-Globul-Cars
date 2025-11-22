# Migration Execution Plan - خطة تنفيذ Migration

**التاريخ**: 20 نوفمبر 2025  
**الحالة**: جاري التنفيذ

---

## 📊 الإحصائيات

- **Components**: ~369 ملف
- **Pages**: ~200+ ملف
- **Services**: ~212 ملف
- **Hooks**: 23 ملف
- **Utils**: 31 ملف
- **Types**: 17 ملف
- **Features**: ~15 ملف

**الإجمالي**: ~867 ملف يحتاج نقل

---

## 🎯 خطة التنفيذ

### المرحلة 1: Hooks (الأسهل - 23 ملف)
**الهدف**: `@globul-cars/core/src/hooks/`

**الملفات المتبقية**:
- useAIImageAnalysis.ts
- useAsyncData.ts
- useAuth.ts (منقول جزئياً)
- useAuthRedirectHandler.ts
- useCarIoT.ts
- useCompleteProfile.ts
- useDealershipForm.ts
- useDraftAutoSave.ts
- useEmailVerification.ts
- useFavorites.ts
- useNotifications.ts
- useOptimisticUpdate.ts
- useOptimizedImage.ts
- useProfileTracking.ts
- usePWA.ts
- useSavedSearches.ts
- useSellWorkflow.ts
- useWorkflowStep.ts

**الوقت المتوقع**: 30 دقيقة

---

### المرحلة 2: Utils (31 ملف)
**الهدف**: `@globul-cars/core/src/utils/`

**الملفات**:
- accessibility-helpers.ts
- accessibility.ts
- auth-error-handler.ts
- backup-service.ts
- clean-google-auth.js
- errorHandling.ts (منقول جزئياً)
- facebook-sdk.ts
- feature-flags.ts
- firebase-health-check.ts
- google-analytics.ts
- listing-limits.ts (منقول جزئياً)
- locationHelpers.ts (منقول جزئياً)
- migrate-locations-browser.ts
- optimistic-updates.ts
- performance-monitor.ts
- performance-monitoring.ts
- performance.ts
- profile-completion.ts (منقول جزئياً)
- schema-generator.ts
- sentry.ts
- seo.ts
- seo.tsx
- sitemap-generator.ts
- sitemapGenerator.ts
- timestamp-converter.ts
- toast-helper.ts
- uptime-monitoring.ts
- userFilters.ts (منقول جزئياً)
- validation.ts
- validators/ (2 ملفات)

**الوقت المتوقع**: 45 دقيقة

---

### المرحلة 3: Types (17 ملف)
**الهدف**: `@globul-cars/core/src/types/` (معظمها)

**الملفات**:
- AdvancedProfile.ts
- ai-quota.types.ts
- ai.types.ts
- browser-image-compression.d.ts
- CarData.ts
- CarListing.ts
- company/company.types.ts
- dealership/dealership.types.ts
- dealership.types.ts
- firestore-models.ts
- LocationData.ts
- social-feed.types.ts
- social-media.types.ts
- styled.d.ts
- theme.ts
- user/bulgarian-user.types.ts

**الوقت المتوقع**: 30 دقيقة

---

### المرحلة 4: Services (212 ملف)
**الهدف**: `@globul-cars/services/src/`

**التصنيف**:
- Firebase services → `firebase/`
- Car services → `car/` (جزء منقول)
- User services → `user/`
- Messaging services → `messaging/`
- Analytics services → `analytics/`
- Payment services → `payments/`
- Social services → `social/`
- Admin services → `admin/`
- Other services → `services/`

**الوقت المتوقع**: 3-4 ساعات

---

### المرحلة 5: Components (369 ملف)
**الهدف**: `@globul-cars/ui/src/components/`

**التصنيف**:
- UI Components → `ui/`
- Layout Components → `layout/`
- Form Components → `forms/`
- Car Components → `cars/` (قد يحتاج package منفصل)
- Profile Components → `profile/`
- Admin Components → `admin/`
- Other → `shared/`

**الوقت المتوقع**: 4-5 ساعات

---

### المرحلة 6: Pages (200+ ملف)
**الهدف**: packages المناسبة

**التصنيف**:
- Auth Pages → `@globul-cars/auth` (جزء منقول)
- Car Pages → `@globul-cars/cars` (جزء منقول)
- Profile Pages → `@globul-cars/profile` (جزء منقول)
- Admin Pages → `@globul-cars/admin`
- Social Pages → `@globul-cars/social`
- Messaging Pages → `@globul-cars/messaging`
- Payment Pages → `@globul-cars/payments`
- IoT Pages → `@globul-cars/iot`
- Other → `@globul-cars/app`

**الوقت المتوقع**: 4-5 ساعات

---

### المرحلة 7: Features (~15 ملف)
**الهدف**: packages المناسبة

- analytics/ → `@globul-cars/core` أو package منفصل
- billing/ → `@globul-cars/payments`
- reviews/ → `@globul-cars/core`
- team/ → `@globul-cars/core`
- verification/ → `@globul-cars/core`

**الوقت المتوقع**: 1 ساعة

---

### المرحلة 8: App.tsx
**الهدف**: `packages/app/src/App.tsx`

**الخطوات**:
1. نسخ App.tsx إلى packages/app/src/
2. تحديث جميع الـ imports
3. تحديث index.tsx لاستخدام packages/app

**الوقت المتوقع**: 1 ساعة

---

### المرحلة 9: تحديث الـ Imports
**الهدف**: جميع الملفات

**الخطوات**:
1. البحث عن جميع relative imports
2. استبدالها بـ `@globul-cars/*`
3. تحديث tsconfig.json paths
4. اختبار الـ build

**الوقت المتوقع**: 2-3 ساعات

---

## ⏱️ الوقت الإجمالي المتوقع

**~16-20 ساعة عمل**

---

## 🚀 البدء بالتنفيذ

سنبدأ بالمراحل الأسهل أولاً:
1. Hooks (30 دقيقة)
2. Utils (45 دقيقة)
3. Types (30 دقيقة)
4. ثم ننتقل للملفات الأكبر

---

**آخر تحديث**: 20 نوفمبر 2025

