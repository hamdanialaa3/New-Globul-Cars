# 🎯 Profile Types Separation Plan - PRIORITIZED (ENHANCED)
## الخطة المرتبة حسب الأولوية البرمجية - نسخة محسّنة

**التاريخ:** نوفمبر 2025  
**الحالة:** 📋 Ready for Implementation  
**المدة الإجمالية:** 6-7 أسابيع (5 مراحل)  
**آخر تحديث:** 2 نوفمبر 2025

---

## 🎯 التحسينات الرئيسية في هذه النسخة

1. ✅ **Phase 0 جديدة:** إصلاح المشاكل الحرجة قبل البدء
2. ✅ **Runtime Validators:** إضافة validators مع type guards
3. ✅ **Phase 2 مقسمة:** 2A (Core) + 2B (Integration)
4. ✅ **ProfilePage Split:** أولوية مستقلة في Phase 3
5. ✅ **Rollback Strategy:** استراتيجية rollback محكمة
6. ✅ **Gradual Migration:** نشر تدريجي آمن

---

## 📋 جدول المحتويات

0. [**Phase 0: Pre-Migration Fixes** (NEW)](#phase-0-pre-migration-fixes)
1. [Phase 1: Core Interfaces & Types](#phase-1-core-interfaces--types)
2. [Phase 2A: Core Service Layer](#phase-2a-core-service-layer)
3. [Phase 2B: Integration Services](#phase-2b-integration-services)
4. [Phase 3: UI Components & Forms](#phase-3-ui-components--forms)
5. [Phase 4: Migration & Testing](#phase-4-migration--testing)
6. [Timeline & Resources](#timeline--resources)
7. [Success Criteria](#success-criteria)

---

## ⚠️ Phase 0: Pre-Migration Fixes
**المدة:** 3-4 أيام عمل  
**الأولوية:** 🔥🔥 CRITICAL (يجب تنفيذها أولاً)

### لماذا Phase 0؟

قبل البدء بإنشاء نظام الـ types الجديد، يجب إصلاح المشاكل الحرجة في الكود الحالي:

**المشاكل المكتشفة:**
- ❌ ProfilePage حجمه 2227 سطر (يخالف قاعدة الـ 300 سطر)
- ❌ خدمات مكررة: DealershipService vs BulgarianProfileService
- ❌ switchProfileType() غير آمن - لا يفحص dealershipInfo
- ❌ لا يوجد runtime validation قبل تغيير profileType

### 0.1 Split ProfilePage (الأولوية الأولى)

**المشكلة:** `src/pages/ProfilePage/index.tsx` = 2227 سطر!

**الحل:** نقسمه لـ 7 ملفات:

```
src/pages/ProfilePage/
├── index.tsx                    (150 lines) - Router فقط
├── ProfileOverview.tsx          (250 lines) - الملخص
├── ProfileSettings.tsx          (300 lines) - الإعدادات
├── ProfileAnalytics.tsx         (280 lines) - التحليلات
├── ProfileGallery.tsx           (220 lines) - المعرض
├── ProfileTeam.tsx              (350 lines) - إدارة الفريق
└── ProfileCampaigns.tsx         (320 lines) - الحملات
```

**الفائدة:**
- ✅ كل ملف أقل من 300 سطر
- ✅ أسهل في الصيانة
- ✅ أسهل في الاختبار
- ✅ Lazy loading أفضل

**المدة:** يومين

---

### 0.2 Consolidate Duplicate Services

**المشكلة:** خدمتين تعملان نفس الشيء:
- `services/dealership/dealership.service.ts` (420 lines)
- `services/bulgarian-profile-service.ts` - setupDealerProfile()

**الحل:**

```typescript
// BEFORE: Two services doing same thing
DealershipService.saveDealershipInfo(info);
BulgarianProfileService.setupDealerProfile(info);

// AFTER: One unified service
BulgarianProfileService.updateDealerProfile(info);
```

**الخطوات:**
1. نقل كل methods من DealershipService → BulgarianProfileService
2. نحذف dealership.service.ts
3. نحدث كل الـ imports في المشروع

**المدة:** يوم واحد

---

### 0.3 Add Basic Runtime Validators

**المشكلة:** `switchProfileType()` في ProfileTypeContext لا يفحص شيء!

**قبل:**
```typescript
const switchProfileType = async (newType: ProfileType) => {
  // ❌ No validation!
  await updateDoc(doc(db, 'users', currentUser.uid), {
    profileType: newType
  });
  setProfileType(newType);
};
```

**بعد:**
```typescript
const switchProfileType = async (newType: ProfileType) => {
  // ✅ Validate before switch
  if (newType === 'dealer') {
    const userData = await getDoc(doc(db, 'users', currentUser.uid));
    const data = userData.data();
    
    if (!data?.dealershipInfo) {
      throw new Error('Cannot switch to dealer: dealershipInfo required');
    }
    
    if (!data.dealershipInfo.vatNumber) {
      throw new Error('Cannot switch to dealer: VAT number required');
    }
  }
  
  if (newType === 'company') {
    const userData = await getDoc(doc(db, 'users', currentUser.uid));
    const data = userData.data();
    
    if (!data?.companyInfo) {
      throw new Error('Cannot switch to company: companyInfo required');
    }
  }
  
  await updateDoc(doc(db, 'users', currentUser.uid), {
    profileType: newType
  });
  setProfileType(newType);
};
```

**المدة:** نصف يوم

---

### 0.4 Fix Duplicate Components

**المشكلة:**
- `DealershipInfoForm.tsx` (670 lines)
- `BusinessInformationForm.tsx` (300 lines)
- **كلاهما يفعلان نفس الشيء!**

**الحل:** ندمجهم في `DealershipInfoForm.tsx` ونحذف الـ duplicate

**المدة:** نصف يوم

---

## Phase 0 Summary

**Total Duration:** 3-4 days  
**Benefits:**
- ✅ Codebase نظيف قبل Phase 1
- ✅ أقل conflicts أثناء التنفيذ
- ✅ أسهل في الاختبار
- ✅ يحل 4 من الـ 15 مشكلة المكتشفة

**Next:** بعد Phase 0 → نبدأ Phase 1 بثقة

---

## 🧩 Canonical Data Model & Source of Truth (CRITICAL)
**الهدف:** إنهاء الازدواجية الحالية بين حقول التاجر داخل وثيقة `users/{uid}` ومجموعة `dealerships/{uid}` عبر قرار واضح لمصدر الحقيقة.

### القرار المعتمد
- users/{uid}: يحتفظ فقط بالحقول الأساسية + نوع الحساب + plan + صلاحيات + إحصائيات + لقطات صغيرة (snapshots) للعرض السريع.
- dealerships/{uid}: المصدر القياسي الكامل لكل بيانات التاجر (legal, services, hours, docs, media...)
- companies/{uid}: المصدر القياسي لبيانات الشركات (إن وُجدت حالياً أو ننشئها ضمن الترحيل)

### لماذا هذا القرار؟
- يتوافق مع الكود الحالي (وجود `services/dealership/dealership.service.ts` ومجموعة `dealerships`)
- يقلل حجم وثيقة user ويجعل قراءات الواجهة أرخص وأكثر قابلية للتوسع
- يزيل التعارض بين `dealerInfo` داخل user و`dealerships/{uid}`

### المخطط النهائي (Firestore)
```
users/{uid}
  profileType: 'private' | 'dealer' | 'company'
  planTier: 'free' | 'premium' | 'dealer_*' | 'company_*'
  verification: { email, phone, id, business }
  permissions: { ... }
  stats: { ... }
  dealerSnapshot?: { nameBG, nameEN, logo, status }
  companySnapshot?: { nameBG, nameEN, logo, status }

dealerships/{uid}
  legal, vatNumber, eik, address, workingHours, services, documents, galleryImages, social...

companies/{uid}
  legal, bulstat/eik, address, departments, team, branding...
```

### تعديل بسيط على الأنواع (Types) في الخطة
- بدل تضمين `dealershipInfo` داخل `DealerProfile` ككائن كامل، نستعمل:
  ```ts
  interface DealerProfile extends BaseProfile {
    profileType: 'dealer';
    planTier: DealerPlanTier;
    dealershipRef: string; // 'dealerships/{uid}'
    dealerSnapshot?: { nameBG: string; nameEN: string; logo?: string; status: 'pending' | 'verified' | 'rejected' };
    // باقي الحقول: permissions, subscription, analytics...
  }
  ```
- خدمات الوصول تجلب التفاصيل الكاملة من `dealerships/{uid}` عند الحاجة (Repository pattern).

### تبعات القرار (Code Touch Points)
- Profile fetch: عند تحميل البروفايل، إن كان Dealer نقرأ snapshot سريع من user ونحمل التفاصيل lazily من `dealerships/{uid}` عند فتح تبويب الإعدادات/الملف التجاري.
- Forms: نماذج التاجر تستخدم خدمة `DealerProfileService` التي تكتب مباشرة إلى `dealerships/{uid}` وتحدّث `dealerSnapshot` مختصراً في user (name/logo/status).
- UI: بطاقات العرض تستخدم snapshot للسرعة؛ صفحات التفاصيل تستخدم الوثيقة الكاملة.

---

## 🔁 Migration Plan: users.dealerInfo → dealerships/{uid}
**الهدف:** نقل أي بيانات تاجر مخزّنة داخل user إلى وثيقة `dealerships/{uid}` والتخلص من الحقول القديمة (`isDealer`, `dealerInfo`).

### خطوات الترحيل (Pseudo-code)
```ts
// scripts/migrate-dealer-info.ts (للتوثيق داخل الخطة)
async function migrateDealerInfoBatch(batchSize = 200) {
  const q = query(collection(db, 'users'), where('dealerInfo', '!=', null), limit(batchSize));
  const snap = await getDocs(q);

  const batch = writeBatch(db);

  for (const docSnap of snap.docs) {
    const uid = docSnap.id;
    const user = docSnap.data();
    const dealerInfo = user.dealerInfo; // الشكل القديم

    // 1) أنشئ/حدّث dealerships/{uid}
    const dealerRef = doc(db, 'dealerships', uid);
    batch.set(dealerRef, {
      ...dealerInfo,
      updatedAt: serverTimestamp(),
      createdAt: user.createdAt || serverTimestamp()
    }, { merge: true });

    // 2) Snapshot مختصر داخل users/{uid}
    batch.set(doc(db, 'users', uid), {
      dealershipRef: `dealerships/${uid}`,
      dealerSnapshot: {
        nameBG: dealerInfo.dealershipNameBG || dealerInfo.companyName || '',
        nameEN: dealerInfo.dealershipNameEN || dealerInfo.companyName || '',
        logo: dealerInfo.logo || null,
        status: user.businessVerification?.status || 'pending'
      },
      // إزالة الحقول القديمة
      dealerInfo: deleteField(),
      isDealer: deleteField(),
      updatedAt: serverTimestamp()
    }, { merge: true });
  }

  await batch.commit();
}
```

### اعتبارات الأداء
- شغّل الترحيل على دفعات صغيرة (200-500)
- استخدم مؤشرات (indexes) إن لزم
- راقب معدلات الأخطاء والمهلات

---

## 🔐 Firestore Security Rules (Expanded)
**Users**
```javascript
match /users/{userId} {
  allow read: if request.auth != null;
  allow create: if request.auth.uid == userId && validateProfileBasics(request.resource.data);
  allow update: if request.auth.uid == userId && validateProfileSwitch(resource.data, request.resource.data);
}

function validateProfileBasics(data) {
  return data.profileType in ['private','dealer','company'];
}

function validateProfileSwitch(oldData, newData) {
  // منع switch إلى dealer بدون snapshot أو مرجع صالح
  if (newData.profileType == 'dealer') {
    return newData.dealershipRef != null && newData.dealerSnapshot != null;
  }
  // منع downgrade من dealer إلى private إذا تجاوز الحد
  if (oldData.profileType == 'dealer' && newData.profileType == 'private') {
    return oldData.stats.activeListings <= 10;
  }
  return true;
}
```

**Dealerships/Companies**
```javascript
match /dealerships/{userId} {
  allow read: if true; // عامة للعرض
  allow create, update: if request.auth.uid == userId; // المالك فقط
}

match /companies/{userId} {
  allow read: if true;
  allow create, update: if request.auth.uid == userId;
}
```

---

## 🧭 File-by-File Change Plan (ملفّات متأثرة)
1) `src/contexts/ProfileTypeContext.tsx`
   - switchProfileType(newType, additionalData?) → إضافة تحقق باستخدام ProfileValidator
   - عند الترقية إلى Dealer: إنشاء/تحديث `dealerships/{uid}` وتحديث `dealerSnapshot` + `dealershipRef` في user

2) `src/services/dealership/dealership.service.ts`
   - يبقى المصدر القياسي لبيانات التاجر (CRUD على dealerships/{uid})
   - إضافة method لتحديث snapshot في users/{uid} بعد كل تغيير رئيسي (الاسم/الشعار/الحالة)

3) `src/services/bulgarian-profile-service.ts`
   - إزالة DealerProfile المضمّن واستبداله باستدعاءات إلى DealerProfileService/DealershipService
   - حذف أي اعتماد على `isDealer`/`dealerInfo` داخل user

4) `src/pages/ProfilePage/index.tsx`
   - التقسيم إلى ملفات (3.0) بدون تغيير behavior
   - الاستهلاك من snapshot للتغذية السريعة، والتحميل الكسول للتفاصيل

5) ترجمات `locales/translations.ts`
   - إضافة مفاتيح جديدة لرسائل الأخطاء من ProfileValidator (bg/en)

---

## 🧪 Testing Matrix (مختصر)
- Validators: حالات نجاح/فشل للترقية/الخفض/إنشاء إعلان
- Services: كتابة/قراءة من dealerships/{uid} + sync snapshot في users/{uid}
- Rules: منع الشروط غير القانونية (dealer بدون snapshot/ref، downgrade مع >10 listings)
- UI: تبويبات البروفايل بعد التقسيم، تحميل snapshot ثم التفاصيل، عدم كسر الترجمات

---

## 🧰 Feature Flags (Remote Config)
استخدم مفاتيح Remote Config لتفعيل تدريجي:
- RC_PROFILE_SWITCH_GUARD_ENABLED = true
- RC_DEALERSHIP_MIGRATION_ENABLED = false → 10% → 50% → 100%
- RC_UI_PROFILE_SPLIT_ENABLED = false (تفعيل بعد إنهاء Phase 3.0)

قراءة في الواجهة:
```ts
const guardsEnabled = rc.getBoolean('RC_PROFILE_SWITCH_GUARD_ENABLED');
```

---

## 🌐 Translations To Add (BG/EN)
أضف المفاتيح التالية في `locales/translations.ts`:
- profile.switch.errors.missingDealershipRef
  - bg: Моля, попълнете данните за дилъра преди смяна на типа профил.
  - en: Please complete dealership details before switching profile type.
- profile.switch.errors.activeListingsExceeded
  - bg: Не можете да преминете към личен профил с повече от 10 активни обяви.
  - en: You can't switch to a private profile with more than 10 active listings.
- profile.validation.invalidPlanTier
  - bg: Невалиден абонамент за този тип профил.
  - en: Invalid plan tier for this profile type.
- profile.migration.inProgress
  - bg: Обновяваме профила ви. Моля, изчакайте...
  - en: We’re updating your profile. Please wait...

استخدم `useLanguage().t('profile.switch.errors.missingDealershipRef')` في الرسائل.

---

## 🛡️ Advanced Stabilization Addenda (Implementation-Ready)

### 1) Central Capability Matrix (Type + Plan → Capabilities)
Purpose: Single source for gates in UI/services; prevents scattered plan checks.

Contract:
```ts
type ProfileType = 'private' | 'dealer' | 'company';
type Capability =
  | 'createListing'
  | 'bulkImport'
  | 'manageTeam'
  | 'advancedAnalytics'
  | 'apiAccess'
  | 'financeOffers';

type CapabilityResult = {
  flags: Record<Capability, boolean>;
  limits: { maxActiveListings: number };
};

export function getCapabilities(profileType: ProfileType, planTier: string): CapabilityResult { /* map */ }
export function can(user: { profileType: ProfileType; planTier: string }, cap: Capability): boolean;
```

Usage:
```ts
// UI
if (!can(user, 'bulkImport')) return toast.error(t('profile.capability.denied.bulkImport'));

// Services
assert(can(user, 'apiAccess'), 'API not allowed for this plan');
```

Notes:
- Matrix should live in `src/services/profile/capabilities.matrix.ts`
- Add unit tests for each plan tier

---

### 2) Rate Limiting & Abuse Prevention on Profile Updates
Client:
```ts
// Debounce/throttle form submits, check lastUpdatedAt, and require hCaptcha for sensitive ops
const minIntervalMs = rc.getNumber('RC_PROFILE_UPDATE_MIN_INTERVAL_MS') ?? 5000;
if (Date.now() - lastUpdatedAt < minIntervalMs) {
  return toast.error(t('profile.rateLimit.tooManyUpdates'));
}
```

Backend (Callable, pseudocode):
```ts
// functions/src/profile/guardRateLimit.ts
export const guardRateLimit = onCall(async (req) => {
  const uid = req.auth?.uid; assert(uid);
  // use firestore doc as counter with decay window
  const ref = doc(db, 'rate_limits', uid);
  const now = Date.now();
  await db.runTransaction(async (tx) => {
    const snap = await tx.get(ref);
    const data = snap.data() || { count: 0, windowStart: now };
    const windowMs = 60_000; const limit = 10; // 10 updates/minute
    const inWindow = now - data.windowStart < windowMs;
    const count = inWindow ? (data.count + 1) : 1;
    if (count > limit) throw new HttpsError('resource-exhausted', 'Rate limit');
    tx.set(ref, { count, windowStart: inWindow ? data.windowStart : now }, { merge: true });
  });
});
```

Rules:
- Sensitive updates go via callable that runs `guardRateLimit`
- Combine with hCaptcha verification when updating legal/vat docs

---

### 3) Profile Audit Log (Write via Functions Only)
Firestore:
```
user_audit/{uid}/profile_events/{eventId}
  type: 'switch_profile_type' | 'change_plan' | 'verification_update' | 'dealership_update'
  data: object
  actor: { uid, role }
  createdAt: timestamp
```

Security Rules:
```javascript
match /user_audit/{uid}/profile_events/{id} {
  allow read: if request.auth != null && request.auth.uid == uid;
  allow write: if false; // only Admin SDK (Cloud Functions)
}
```

Cloud Function (pseudo):
```ts
export const logProfileEvent = async (uid: string, evt: Omit<Event,'createdAt'>) =>
  await addDoc(collection(db, `user_audit/${uid}/profile_events`), { ...evt, createdAt: serverTimestamp() });
```

---

### 4) Consistency Checker (Scheduled)
Goal: heal or flag users with mismatched state.

Pseudo:
```ts
// functions/src/cron/profileConsistency.ts
export const profileConsistency = onSchedule('every 6 hours', async () => {
  const users = await db.collection('users').where('profileType','==','dealer').get();
  for (const u of users.docs) {
    const { dealershipRef } = u.data();
    if (!dealershipRef) {
      // heal: create empty dealerships/{uid} and write snapshot
      await db.doc(`dealerships/${u.id}`).set({ createdFrom: 'auto-heal', createdAt: serverTimestamp() }, { merge: true });
      await db.doc(`users/${u.id}`).set({ dealershipRef: `dealerships/${u.id}` }, { merge: true });
    }
  }
});
```

---

### 5) Migration Lock & Concurrency Control
Add field during migrations:
```ts
users/{uid}.migrationLock = { inProgress: true, step: 'dealerInfoToDealerships', startedAt }
```

Client/UI:
```ts
if (user.migrationLock?.inProgress) showBanner(t('profile.migration.inProgress'));
```

---

### 6) Trust Score Recalculation Triggers
Trigger on verification/dealership updates:
```ts
// functions/src/trust/recalculateOnUpdate.ts
export const onVerificationChange = onDocumentWritten('users/{uid}', async (e) => {
  const after = e.after?.data(); const before = e.before?.data();
  if (after?.verification !== before?.verification) {
    const score = computeTrustScore(after);
    await db.doc(`users/${e.params.uid}`).set({ stats: { trustScore: score } }, { merge: true });
  }
});

export const onDealershipChange = onDocumentWritten('dealerships/{uid}', async (e) => {
  const userRef = db.doc(`users/${e.params.uid}`);
  const user = (await userRef.get()).data();
  if (user?.profileType === 'dealer') {
    const score = computeTrustScore(user);
    await userRef.set({ stats: { trustScore: score } }, { merge: true });
  }
});
```

---

### 7) Logo/Avatar Normalization Pipeline
Storage Trigger (or Extension):
```ts
// functions/src/storage/onLogoUpload.ts
export const onLogoUpload = onObjectFinalized(async (obj) => {
  if (!obj.name?.includes('/logos/')) return;
  // generate sizes, convert to webp/jpg, update user.dealerSnapshot.logo
});
```

Client resizing hint: ensure max dimensions before upload.

---

### 8) Team Roles & Permission Map (Dealers/Companies)
Types:
```ts
type DealerRole = 'admin' | 'manager' | 'agent';
const DealerPermissions = {
  admin: ['manageTeam','bulkImport','advancedAnalytics','apiAccess','createListing','financeOffers'],
  manager: ['bulkImport','advancedAnalytics','createListing','financeOffers'],
  agent: ['createListing']
} as const;
```

Usage:
```ts
function hasRolePermission(role: DealerRole, cap: Capability) {
  return DealerPermissions[role].includes(cap);
}
```

---

### 9) Client Caching & SWR Pattern for Profile
Contract:
```ts
// services/profile-cache.service.ts
export async function getProfile(uid: string) {
  const cached = cache.get(`profile:${uid}`);
  if (cached) emitToUI(cached);
  const fresh = await fetchFromFirestore(uid);
  cache.set(`profile:${uid}`, fresh, { ttlMs: 60_000 });
  return fresh;
}
```

Use onSnapshot to invalidate cache on remote changes.

---

### 10) Deprecated Fields Cleanup List
Mark for migration/removal after rollout:
- users.isDealer
- users.dealerInfo
- users.companyInfo (if replaced by companyRef + snapshot)
- users.location, users.city, users.region (legacy, replaced by locationData)

Add a simple detector script (lint-like) to flag any new usage before commit.

---

### 11) Additional Translations (BG/EN)
- profile.capability.denied.bulkImport
  - bg: Пакетът ви не включва групов импорт.
  - en: Your plan doesn’t include bulk import.
- profile.rateLimit.tooManyUpdates
  - bg: Твърде много промени за кратко време. Моля, опитайте по-късно.
  - en: Too many updates in a short time. Please try again later.
- profile.audit.changedProfileType
  - bg: Типът на профила е променен успешно.
  - en: Profile type changed successfully.
- profile.audit.updatedVerification
  - bg: Статусът на верификацията е обновен.
  - en: Verification status updated.
- profile.photos.logoUpdated
  - bg: Логото е обновено.
  - en: Logo updated.

---

---

## Phase 1: Core Interfaces & Types
**المدة:** أسبوع واحد (5 أيام عمل)  
**الأولوية:** 🔥 CRITICAL

### 1.1 Base Profile Interface

**الملف:** `src/types/profiles/base-profile.types.ts`

```typescript
/**
 * Base Profile Interface
 * Common fields shared by all profile types
 */
export interface BaseProfile {
  // ============ CORE IDENTITY ============
  id: string;
  email: string;
  displayName: string;
  photoURL?: string;
  coverImage?: string;
  
  // ============ PROFILE TYPE ============
  profileType: 'private' | 'dealer' | 'company';
  planTier: PlanTier;
  
  // ============ BULGARIAN BASICS ============
  firstName: string;
  lastName: string;
  phoneNumber?: string;
  address?: Address;
  
  // ============ VERIFICATION ============
  verification: {
    email: boolean;
    phone: boolean;
    id: boolean;
    business: boolean;
  };
  
  // ============ STATISTICS ============
  stats: {
    totalListings: number;
    activeListings: number;
    totalViews: number;
    totalMessages: number;
    followersCount: number;
    followingCount: number;
    trustScore: number;
  };
  
  // ============ SOCIAL ============
  galleryImages?: string[];      // Max 9
  followers?: string[];
  following?: string[];
  
  // ============ PRIVACY ============
  privacySettings?: PrivacySettings;
  
  // ============ TIMESTAMPS ============
  createdAt: Timestamp;
  updatedAt: Timestamp;
  lastLoginAt?: Timestamp;
  
  // ============ FLAGS ============
  isActive: boolean;
  isBanned: boolean;
  isFeatured: boolean;
}
```

**المدة:** يوم واحد  
**الاختبار:** Unit tests للـ interface

---

### 1.2 Private Profile Interface

**الملف:** `src/types/profiles/private-profile.types.ts`

```typescript
import { BaseProfile } from './base-profile.types';

/**
 * Private Profile - للمستخدمين الأفراد
 * Theme: #FF8F10 (Orange)
 */
export interface PrivateProfile extends BaseProfile {
  profileType: 'private';
  planTier: 'free' | 'premium';
  
  // ============ PERSONAL INFO ============
  dateOfBirth?: Timestamp;
  egn?: string;                    // 10-digit EGN
  idCardNumber?: string;
  
  // ID Verification
  idCard?: {
    frontImage: string;
    backImage: string;
    uploadedAt: Timestamp;
    status: 'pending' | 'verified' | 'rejected';
  };
  
  // ============ PERMISSIONS ============
  permissions: {
    maxListings: 3 | 10;           // free: 3, premium: 10
    hasAnalytics: false;
    hasCampaigns: false;
    hasTeam: false;
    hasAPI: false;
  };
  
  // ============ SUBSCRIPTION ============
  subscription?: {
    planId: 'free' | 'premium';
    status: 'active' | 'cancelled' | 'expired';
    startDate: Timestamp;
    endDate: Timestamp;
  };
}
```

**المدة:** نصف يوم  
**الاختبار:** Validation tests

---

### 1.3 Dealer Profile Interface

**الملف:** `src/types/profiles/dealer-profile.types.ts`

```typescript
import { BaseProfile } from './base-profile.types';

/**
 * Dealer Profile - للتجار المحترفين
 * Theme: #16a34a (Green)
 */
export interface DealerProfile extends BaseProfile {
  profileType: 'dealer';
  planTier: 'dealer_basic' | 'dealer_pro' | 'dealer_enterprise';
  
  // ============ DEALERSHIP INFO (REQUIRED) ============
  dealershipInfo: {
    // Names
    dealershipNameBG: string;
    dealershipNameEN: string;
    description: string;
    
    // Legal (REQUIRED)
    legalForm: 'EOOD' | 'OOD' | 'AD' | 'SOLE_TRADER' | 'ET';
    vatNumber: string;             // BG + 9 digits
    companyRegNumber: string;      // Bulstat/EIK
    
    // Contact
    businessAddress: Address;
    businessPhone: string;
    businessEmail: string;
    website?: string;
    
    // Hours
    workingHours: WorkingHours;
    
    // Services
    services: DealerServices;
    
    // Branding
    logo?: string;
    coverImage?: string;
    socialMedia?: SocialMediaLinks;
  };
  
  // ============ BUSINESS VERIFICATION (REQUIRED) ============
  businessVerification: {
    status: 'pending' | 'verified' | 'rejected';
    documents?: {
      registrationCertificate: string;
      vatCertificate?: string;
      uploadedAt: Timestamp;
    };
  };
  
  // ============ TEAM MANAGEMENT ============
  team?: {
    members: TeamMember[];
    maxMembers: 3 | 10 | 50;       // basic: 3, pro: 10, enterprise: 50
  };
  
  // ============ PERMISSIONS ============
  permissions: {
    maxListings: 50 | 150 | 500;   // basic/pro/enterprise
    hasAnalytics: true;
    hasCampaigns: true;
    hasTeam: true;
    hasAPI: boolean;               // pro & enterprise only
    canImportCSV: boolean;         // pro & enterprise only
    canExportData: boolean;        // pro & enterprise only
  };
  
  // ============ SUBSCRIPTION ============
  subscription: {                  // REQUIRED for dealers
    planId: 'dealer_basic' | 'dealer_pro' | 'dealer_enterprise';
    status: 'active' | 'cancelled' | 'expired';
    startDate: Timestamp;
    endDate: Timestamp;
    autoRenew: boolean;
    stripeCustomerId?: string;
    stripeSubscriptionId?: string;
  };
}
```

**المدة:** يوم واحد  
**الاختبار:** Validation + Business logic tests

---

### 1.4 Company Profile Interface

**الملف:** `src/types/profiles/company-profile.types.ts`

```typescript
import { BaseProfile } from './base-profile.types';

/**
 * Company Profile - للشركات والأساطيل
 * Theme: #1d4ed8 (Blue)
 */
export interface CompanyProfile extends BaseProfile {
  profileType: 'company';
  planTier: 'company_starter' | 'company_pro' | 'company_enterprise';
  
  // ============ COMPANY INFO (REQUIRED) ============
  companyInfo: {
    // Names
    companyNameBG: string;
    companyNameEN: string;
    description: string;
    
    // Legal (REQUIRED)
    legalForm: 'EOOD' | 'OOD' | 'AD';
    bulstatNumber: string;         // 9-13 digits
    eikNumber: string;             // 9 digits
    vatNumber: string;             // BG + 9 digits
    
    // Fleet
    fleetSize: number;
    departments?: string[];
    
    // Contact
    headquartersAddress: Address;
    mainPhone: string;
    mainEmail: string;
    website?: string;
    
    // Branding
    logo: string;                  // Required
    coverImage?: string;
  };
  
  // ============ BUSINESS VERIFICATION (REQUIRED) ============
  businessVerification: {
    status: 'pending' | 'verified' | 'rejected';
    documents: {
      registrationCertificate: string;
      vatCertificate: string;
      uploadedAt: Timestamp;
    };
  };
  
  // ============ TEAM MANAGEMENT ============
  team: {                          // REQUIRED
    members: TeamMember[];
    maxMembers: 10 | 30 | 100;     // starter/pro/enterprise
    departments: Department[];
  };
  
  // ============ PERMISSIONS ============
  permissions: {
    maxListings: 100 | 300 | 1000; // starter/pro/enterprise
    hasAnalytics: true;
    hasCampaigns: true;
    hasTeam: true;
    hasAPI: true;
    canImportCSV: true;
    canExportData: true;
    hasPrioritySupport: true;
    hasCustomReports: boolean;     // pro & enterprise only
  };
  
  // ============ SUBSCRIPTION (REQUIRED) ============
  subscription: {
    planId: 'company_starter' | 'company_pro' | 'company_enterprise';
    status: 'active' | 'cancelled' | 'expired';
    startDate: Timestamp;
    endDate: Timestamp;
    autoRenew: boolean;
    stripeCustomerId: string;
    stripeSubscriptionId: string;
  };
}
```

**المدة:** يوم واحد  
**الاختبار:** Validation + Enterprise logic tests

---

### 1.5 Type Guards & Validators (ENHANCED)

**الملف:** `src/types/profiles/type-guards.ts`

```typescript
/**
 * Type Guards & Runtime Validators (ENHANCED)
 * التحقق من نوع البروفايل + validation قبل التحويل
 */

// ============ SIMPLE TYPE GUARDS ============

export function isPrivateProfile(profile: BulgarianUser): profile is PrivateProfile {
  return profile.profileType === 'private';
}

export function isDealerProfile(profile: BulgarianUser): profile is DealerProfile {
  return profile.profileType === 'dealer';
}

export function isCompanyProfile(profile: BulgarianUser): profile is CompanyProfile {
  return profile.profileType === 'company';
}

// ============ RUNTIME VALIDATORS (مع رسائل خطأ واضحة) ============

export class ProfileValidationError extends Error {
  constructor(message: string, public code: string) {
    super(message);
    this.name = 'ProfileValidationError';
  }
}

export function validatePrivateProfile(profile: unknown): profile is PrivateProfile {
  const p = profile as PrivateProfile;
  
  if (p.profileType !== 'private') {
    throw new ProfileValidationError(
      'Profile type must be "private"',
      'INVALID_PROFILE_TYPE'
    );
  }
  
  if (p.planTier !== 'free' && p.planTier !== 'premium') {
    throw new ProfileValidationError(
      'Private profile plan must be "free" or "premium"',
      'INVALID_PLAN_TIER'
    );
  }
  
  if (!p.email || typeof p.email !== 'string') {
    throw new ProfileValidationError(
      'Email is required',
      'MISSING_EMAIL'
    );
  }
  
  return true;
}

export function validateDealerProfile(profile: unknown): profile is DealerProfile {
  const p = profile as DealerProfile;
  
  if (p.profileType !== 'dealer') {
    throw new ProfileValidationError(
      'Profile type must be "dealer"',
      'INVALID_PROFILE_TYPE'
    );
  }
  
  // ✅ CRITICAL: Check dealershipInfo exists
  if (!p.dealershipInfo) {
    throw new ProfileValidationError(
      'Dealer profile requires dealershipInfo',
      'MISSING_DEALERSHIP_INFO'
    );
  }
  
  // ✅ Validate required fields
  if (!p.dealershipInfo.dealershipNameBG) {
    throw new ProfileValidationError(
      'Dealership name (BG) is required',
      'MISSING_DEALERSHIP_NAME_BG'
    );
  }
  
  if (!p.dealershipInfo.vatNumber) {
    throw new ProfileValidationError(
      'VAT number is required for dealers',
      'MISSING_VAT_NUMBER'
    );
  }
  
  // ✅ Validate VAT format (BG + 9 digits)
  if (!/^BG\d{9}$/.test(p.dealershipInfo.vatNumber)) {
    throw new ProfileValidationError(
      'Invalid VAT number format. Must be BG followed by 9 digits',
      'INVALID_VAT_FORMAT'
    );
  }
  
  // ✅ Check subscription exists
  if (!p.subscription) {
    throw new ProfileValidationError(
      'Dealer profile requires active subscription',
      'MISSING_SUBSCRIPTION'
    );
  }
  
  return true;
}

export function validateCompanyProfile(profile: unknown): profile is CompanyProfile {
  const p = profile as CompanyProfile;
  
  if (p.profileType !== 'company') {
    throw new ProfileValidationError(
      'Profile type must be "company"',
      'INVALID_PROFILE_TYPE'
    );
  }
  
  // ✅ Check companyInfo exists
  if (!p.companyInfo) {
    throw new ProfileValidationError(
      'Company profile requires companyInfo',
      'MISSING_COMPANY_INFO'
    );
  }
  
  // ✅ Validate Bulstat
  if (!p.companyInfo.bulstatNumber || !/^\d{9,13}$/.test(p.companyInfo.bulstatNumber)) {
    throw new ProfileValidationError(
      'Valid Bulstat number (9-13 digits) is required',
      'INVALID_BULSTAT'
    );
  }
  
  // ✅ Check team exists
  if (!p.team) {
    throw new ProfileValidationError(
      'Company profile requires team structure',
      'MISSING_TEAM'
    );
  }
  
  return true;
}

// ============ PROFILE STATE VALIDATORS (جديد!) ============

/**
 * ProfileValidator - للتحقق قبل تغيير حالة البروفايل
 */
export class ProfileValidator {
  /**
   * Check if user can switch to dealer type
   */
  static canSwitchToDealer(
    currentProfile: BulgarianUser, 
    dealershipInfo?: DealerProfile['dealershipInfo']
  ): { canSwitch: boolean; reason?: string } {
    
    // ✅ Must provide dealershipInfo
    if (!dealershipInfo) {
      return {
        canSwitch: false,
        reason: 'Dealership information is required'
      };
    }
    
    // ✅ Validate VAT number
    if (!dealershipInfo.vatNumber || !/^BG\d{9}$/.test(dealershipInfo.vatNumber)) {
      return {
        canSwitch: false,
        reason: 'Valid VAT number is required (BG + 9 digits)'
      };
    }
    
    // ✅ Must have verified email
    if (!currentProfile.verification.email) {
      return {
        canSwitch: false,
        reason: 'Email verification required before upgrading to dealer'
      };
    }
    
    // ✅ Must have verified phone
    if (!currentProfile.verification.phone) {
      return {
        canSwitch: false,
        reason: 'Phone verification required before upgrading to dealer'
      };
    }
    
    return { canSwitch: true };
  }
  
  /**
   * Check if user can switch to company type
   */
  static canSwitchToCompany(
    currentProfile: BulgarianUser,
    companyInfo?: CompanyProfile['companyInfo']
  ): { canSwitch: boolean; reason?: string } {
    
    if (!companyInfo) {
      return {
        canSwitch: false,
        reason: 'Company information is required'
      };
    }
    
    // ✅ Validate Bulstat
    if (!companyInfo.bulstatNumber || !/^\d{9,13}$/.test(companyInfo.bulstatNumber)) {
      return {
        canSwitch: false,
        reason: 'Valid Bulstat number required'
      };
    }
    
    // ✅ Must have all verifications
    if (!currentProfile.verification.email || 
        !currentProfile.verification.phone || 
        !currentProfile.verification.id) {
      return {
        canSwitch: false,
        reason: 'Full verification (email, phone, ID) required for company accounts'
      };
    }
    
    return { canSwitch: true };
  }
  
  /**
   * Check if dealer can downgrade to private
   */
  static canDowngradeToPrivate(dealerProfile: DealerProfile): { 
    canDowngrade: boolean; 
    reason?: string;
    warnings?: string[];
  } {
    const warnings: string[] = [];
    
    // ✅ Check active listings
    if (dealerProfile.stats.activeListings > 10) {
      return {
        canDowngrade: false,
        reason: `You have ${dealerProfile.stats.activeListings} active listings. ` +
                `Private accounts are limited to 10 listings. ` +
                `Please deactivate ${dealerProfile.stats.activeListings - 10} listings first.`
      };
    }
    
    // ⚠️ Team members warning
    if (dealerProfile.team && dealerProfile.team.length > 0) {
      warnings.push(
        `${dealerProfile.team.length} team members will lose access`
      );
    }
    
    // ⚠️ Analytics data warning
    if (dealerProfile.analytics) {
      warnings.push('Analytics data will be archived (read-only)');
    }
    
    return { 
      canDowngrade: true, 
      warnings: warnings.length > 0 ? warnings : undefined 
    };
  }
  
  /**
   * Check if user can create listing
   */
  static canCreateListing(profile: BulgarianUser): { 
    canCreate: boolean; 
    reason?: string 
  } {
    const { stats, permissions } = profile;
    
    // ✅ Check listing limit
    if (permissions.maxListings !== -1 && 
        stats.activeListings >= permissions.maxListings) {
      return {
        canCreate: false,
        reason: `Listing limit reached (${permissions.maxListings}). ` +
                `Upgrade your plan for more listings.`
      };
    }
    
    // ✅ Check account status
    if (profile.isBanned) {
      return {
        canCreate: false,
        reason: 'Account is banned. Contact support.'
      };
    }
    
    if (!profile.isActive) {
      return {
        canCreate: false,
        reason: 'Account is inactive. Please activate your account.'
      };
    }
    
    // ✅ Dealer/Company: Check business verification
    if (isDealerProfile(profile) || isCompanyProfile(profile)) {
      if (profile.businessVerification.status !== 'verified') {
        return {
          canCreate: false,
          reason: 'Business verification pending. Complete verification to create listings.'
        };
      }
    }
    
    return { canCreate: true };
  }
}

// ============ HELPERS ============

export function getProfileType(profile: BulgarianUser): 'private' | 'dealer' | 'company' {
  return profile.profileType;
}

export function getThemeColor(profileType: 'private' | 'dealer' | 'company'): string {
  const colors = {
    private: '#FF8F10',  // Orange
    dealer: '#16a34a',   // Green
    company: '#1d4ed8'   // Blue
  };
  return colors[profileType];
}

export function getPlanDisplayName(planTier: PlanTier, language: 'bg' | 'en'): string {
  const names = {
    bg: {
      free: 'Безплатен',
      premium: 'Премиум',
      dealer_basic: 'Търговец Базов',
      dealer_pro: 'Търговец Про',
      dealer_enterprise: 'Търговец Ентърпрайз',
      company_starter: 'Компания Стартър',
      company_pro: 'Компания Про',
      company_enterprise: 'Компания Ентърпрайз',
      custom: 'Персонализиран'
    },
    en: {
      free: 'Free',
      premium: 'Premium',
      dealer_basic: 'Dealer Basic',
      dealer_pro: 'Dealer Pro',
      dealer_enterprise: 'Dealer Enterprise',
      company_starter: 'Company Starter',
      company_pro: 'Company Pro',
      company_enterprise: 'Company Enterprise',
      custom: 'Custom'
    }
  };
  
  return names[language][planTier];
}
```

**المدة:** يوم كامل (بسبب الـ validators المعقدة)  
**الاختبار:** 
- Unit tests لكل validator
- Integration tests للـ canSwitch methods
- Edge cases (banned users, unverified, etc.)

---

### 1.6 Union Type

**الملف:** `src/types/profiles/index.ts`

```typescript
import { PrivateProfile } from './private-profile.types';
import { DealerProfile } from './dealer-profile.types';
import { CompanyProfile } from './company-profile.types';

/**
 * BulgarianUser - Union Type
 * يمكن أن يكون أي من الأنواع الثلاثة
 */
export type BulgarianUser = 
  | PrivateProfile 
  | DealerProfile 
  | CompanyProfile;

// Re-export all types
export * from './base-profile.types';
export * from './private-profile.types';
export * from './dealer-profile.types';
export * from './company-profile.types';
export * from './type-guards';

// Helper types
export type ProfileType = BulgarianUser['profileType'];
export type PlanTier = BulgarianUser['planTier'];
```

**المدة:** 1 ساعة  
**الاختبار:** Type checking tests

---

### 1.7 Supporting Types

**الملف:** `src/types/profiles/supporting-types.ts`

```typescript
// Address
export interface Address {
  street: string;
  city: string;
  municipality?: string;
  province?: string;
  postalCode: string;
  country: 'BG';
}

// Working Hours
export type DayOfWeek = 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday';

export interface DayHours {
  isOpen: boolean;
  openTime?: string;   // "09:00"
  closeTime?: string;  // "18:00"
}

export type WorkingHours = Record<DayOfWeek, DayHours>;

// Dealer Services
export interface DealerServices {
  financing: boolean;
  warranty: boolean;
  tradeIn: boolean;
  delivery: boolean;
  service: boolean;
  bodyShop: boolean;
  towing: boolean;
  rentCar: boolean;
}

// Social Media
export interface SocialMediaLinks {
  facebook?: string;
  instagram?: string;
  tiktok?: string;
  linkedin?: string;
  youtube?: string;
}

// Team Member
export interface TeamMember {
  userId: string;
  role: 'admin' | 'manager' | 'salesperson';
  permissions: string[];
  addedAt: Timestamp;
}

// Department
export interface Department {
  id: string;
  name: string;
  managerId: string;
  memberIds: string[];
}

// Privacy Settings
export interface PrivacySettings {
  showEmail: boolean;
  showPhone: boolean;
  showAddress: boolean;
  showStats: boolean;
  allowMessages: boolean;
  allowReviews: boolean;
}
```

**المدة:** نصف يوم

---

### Phase 1 Summary

**الملفات المُنشأة (7 files):**
1. ✅ `base-profile.types.ts`
2. ✅ `private-profile.types.ts`
3. ✅ `dealer-profile.types.ts`
4. ✅ `company-profile.types.ts`
5. ✅ `type-guards.ts`
6. ✅ `index.ts`
7. ✅ `supporting-types.ts`

**الاختبارات (Tests):**
- Unit tests for each interface
- Validation tests
- Type guard tests
- Integration tests

**المدة الإجمالية:** 5 أيام عمل  
**مخرجات:** Type system كامل وآمن

---

## Phase 2A: Core Service Layer
**المدة:** أسبوع واحد (5 أيام عمل)  
**الأولوية:** 🔥 HIGH

> **لماذا قسمنا Phase 2؟**  
> Phase 2 كانت كبيرة جداً (أسبوعين). بتقسيمها لـ A/B:
> - ✅ Milestones أوضح للتتبع
> - ✅ نقدر نختبر 2A قبل 2B
> - ✅ لو حصلت مشكلة نعرف مكانها بالضبط

### 2A.1 Base Profile Service

**الملف:** `src/services/profiles/base-profile.service.ts`

```typescript
/**
 * Base Profile Service
 * Common operations for all profile types
 */
export class BaseProfileService {
  protected db = getFirestore();
  protected storage = getStorage();
  
  // ============ READ OPERATIONS ============
  
  async getProfile(userId: string): Promise<BulgarianUser | null> {
    try {
      const docRef = doc(this.db, 'users', userId);
      const docSnap = await getDoc(docRef);
      
      if (!docSnap.exists()) {
        return null;
      }
      
      return docSnap.data() as BulgarianUser;
    } catch (error) {
      logger.error('Error getting profile', error, { userId });
      throw error;
    }
  }
  
  async getProfiles(userIds: string[]): Promise<BulgarianUser[]> {
    const profiles = await Promise.all(
      userIds.map(id => this.getProfile(id))
    );
    return profiles.filter(p => p !== null) as BulgarianUser[];
  }
  
  // ============ UPDATE OPERATIONS ============
  
  async updateBasicInfo(
    userId: string,
    data: Partial<BaseProfile>
  ): Promise<void> {
    try {
      const docRef = doc(this.db, 'users', userId);
      await updateDoc(docRef, {
        ...data,
        updatedAt: serverTimestamp()
      });
      
      logger.info('Profile updated', { userId, fields: Object.keys(data) });
    } catch (error) {
      logger.error('Error updating profile', error, { userId });
      throw error;
    }
  }
  
  // ============ MEDIA OPERATIONS ============
  
  async uploadProfilePhoto(userId: string, file: File): Promise<string> {
    try {
      const path = `users/${userId}/profile/${Date.now()}_${file.name}`;
      const storageRef = ref(this.storage, path);
      
      await uploadBytes(storageRef, file);
      const url = await getDownloadURL(storageRef);
      
      await this.updateBasicInfo(userId, { photoURL: url });
      
      logger.info('Profile photo uploaded', { userId, url });
      return url;
    } catch (error) {
      logger.error('Error uploading profile photo', error, { userId });
      throw error;
    }
  }
  
  async uploadCoverImage(userId: string, file: File): Promise<string> {
    try {
      const path = `users/${userId}/cover/${Date.now()}_${file.name}`;
      const storageRef = ref(this.storage, path);
      
      await uploadBytes(storageRef, file);
      const url = await getDownloadURL(storageRef);
      
      await this.updateBasicInfo(userId, { coverImage: url });
      
      logger.info('Cover image uploaded', { userId, url });
      return url;
    } catch (error) {
      logger.error('Error uploading cover image', error, { userId });
      throw error;
    }
  }
  
  // ============ STATS OPERATIONS ============
  
  async incrementStat(
    userId: string, 
    statName: keyof BaseProfile['stats'],
    increment: number = 1
  ): Promise<void> {
    try {
      const docRef = doc(this.db, 'users', userId);
      await updateDoc(docRef, {
        [`stats.${statName}`]: firestore.FieldValue.increment(increment),
        updatedAt: serverTimestamp()
      });
    } catch (error) {
      logger.error('Error incrementing stat', error, { userId, statName });
      throw error;
    }
  }
  
  async updateTrustScore(userId: string, newScore: number): Promise<void> {
    if (newScore < 0 || newScore > 100) {
      throw new Error('Trust score must be between 0 and 100');
    }
    
    await updateDoc(doc(this.db, 'users', userId), {
      'stats.trustScore': newScore,
      updatedAt: serverTimestamp()
    });
  }
}
```

**المدة:** يومان  
**الاختبار:** Unit tests لكل method

---

### 2A.2 Private Profile Service

**الملف:** `src/services/profiles/private-profile.service.ts`

```typescript
/**
 * Private Profile Service
 * Operations specific to Private profiles
 */
export class PrivateProfileService extends BaseProfileService {
  
  // ============ READ WITH TYPE SAFETY ============
  
  async getPrivateProfile(userId: string): Promise<PrivateProfile> {
    const profile = await this.getProfile(userId);
    
    if (!profile) {
      throw new Error(`Private profile not found: ${userId}`);
    }
    
    if (!isPrivateProfile(profile)) {
      throw new Error(
        `Profile ${userId} is ${profile.profileType}, not private`
      );
    }
    
    return profile;
  }
  
  // ============ ID VERIFICATION ============
  
  async uploadIDCard(
    userId: string, 
    frontImage: File, 
    backImage: File
  ): Promise<void> {
    try {
      // Upload front
      const frontPath = `users/${userId}/id-verification/front.jpg`;
      const frontRef = ref(this.storage, frontPath);
      await uploadBytes(frontRef, frontImage);
      const frontURL = await getDownloadURL(frontRef);
      
      // Upload back
      const backPath = `users/${userId}/id-verification/back.jpg`;
      const backRef = ref(this.storage, backPath);
      await uploadBytes(backRef, backImage);
      const backURL = await getDownloadURL(backRef);
      
      // Update profile
      await updateDoc(doc(this.db, 'users', userId), {
        idCard: {
          frontImage: frontURL,
          backImage: backURL,
          uploadedAt: serverTimestamp(),
          status: 'pending'
        },
        updatedAt: serverTimestamp()
      });
      
      logger.info('ID card uploaded for verification', { userId });
    } catch (error) {
      logger.error('Error uploading ID card', error, { userId });
      throw error;
    }
  }
  
  // ============ SUBSCRIPTION ============
  
  async upgradeToPremium(userId: string, subscriptionData: {
    stripeCustomerId: string;
    stripeSubscriptionId: string;
  }): Promise<void> {
    const profile = await this.getPrivateProfile(userId);
    
    if (profile.planTier === 'premium') {
      throw new Error('User is already premium');
    }
    
    await updateDoc(doc(this.db, 'users', userId), {
      planTier: 'premium',
      subscription: {
        planId: 'premium',
        status: 'active',
        startDate: serverTimestamp(),
        endDate: null, // Calculate based on billing cycle
        autoRenew: true,
        ...subscriptionData
      },
      permissions: getPrivatePermissions('premium'),
      updatedAt: serverTimestamp()
    });
    
    logger.info('User upgraded to premium', { userId });
  }
}
```

**المدة:** يوم واحد

---

### 2A.3 Dealer Profile Service

**الملف:** `src/services/profiles/dealer-profile.service.ts`

```typescript
/**
 * Dealer Profile Service  
 * Operations specific to Dealer profiles
 */
export class DealerProfileService extends BaseProfileService {
  
  async getDealerProfile(userId: string): Promise<DealerProfile> {
    const profile = await this.getProfile(userId);
    
    if (!profile) {
      throw new Error(`Dealer profile not found: ${userId}`);
    }
    
    if (!isDealerProfile(profile)) {
      throw new Error(
        `Profile ${userId} is ${profile.profileType}, not dealer`
      );
    }
    
    // ✅ Runtime validation
    validateDealerProfile(profile);
    
    return profile;
  }
  
  // ============ DEALERSHIP INFO ============
  
  async updateDealershipInfo(
    userId: string,
    dealershipInfo: Partial<DealerProfile['dealershipInfo']>
  ): Promise<void> {
    const profile = await this.getDealerProfile(userId);
    
    // ✅ Merge with existing info
    const updatedInfo = {
      ...profile.dealershipInfo,
      ...dealershipInfo
    };
    
    // ✅ Validate complete info
    if (!isDealershipInfoComplete(updatedInfo)) {
      throw new Error('Incomplete dealership information');
    }
    
    await updateDoc(doc(this.db, 'users', userId), {
      dealershipInfo: updatedInfo,
      updatedAt: serverTimestamp()
    });
    
    logger.info('Dealership info updated', { userId });
  }
  
  // ============ TEAM MANAGEMENT ============
  
  async addTeamMember(
    userId: string,
    member: Omit<TeamMember, 'addedAt' | 'addedBy'>
  ): Promise<void> {
    const profile = await this.getDealerProfile(userId);
    
    // ✅ Check team limit
    const currentTeamSize = profile.team?.length || 0;
    if (currentTeamSize >= profile.permissions.maxTeamMembers &&
        profile.permissions.maxTeamMembers !== -1) {
      throw new Error(
        `Team member limit reached (${profile.permissions.maxTeamMembers})`
      );
    }
    
    const newMember: TeamMember = {
      ...member,
      addedAt: serverTimestamp() as Timestamp,
      addedBy: userId,
      isActive: true
    };
    
    await updateDoc(doc(this.db, 'users', userId), {
      team: arrayUnion(newMember),
      updatedAt: serverTimestamp()
    });
    
    logger.info('Team member added', { userId, memberEmail: member.email });
  }
  
  async removeTeamMember(userId: string, memberUserId: string): Promise<void> {
    const profile = await this.getDealerProfile(userId);
    
    const updatedTeam = profile.team?.filter(m => m.userId !== memberUserId) || [];
    
    await updateDoc(doc(this.db, 'users', userId), {
      team: updatedTeam,
      updatedAt: serverTimestamp()
    });
    
    logger.info('Team member removed', { userId, removedMember: memberUserId });
  }
}
```

**المدة:** يومان (أطول بسبب team management)
    await updateDoc(doc(db, 'users', userId), {
      ...data,
      updatedAt: serverTimestamp()
    });
  }
  
  // Submit ID verification
  async submitIDVerification(
    userId: string,
    frontImage: File,
    backImage: File
  ): Promise<void> {
    // Upload images
    const frontUrl = await this.uploadIDImage(userId, frontImage, 'front');
    const backUrl = await this.uploadIDImage(userId, backImage, 'back');
    
    // Update profile
    await updateDoc(doc(db, 'users', userId), {
      idCard: {
        frontImage: frontUrl,
        backImage: backUrl,
        uploadedAt: serverTimestamp(),
        status: 'pending'
      },
      updatedAt: serverTimestamp()
    });
  }
  
  private async uploadIDImage(userId: string, file: File, side: 'front' | 'back'): Promise<string> {
    const path = `users/${userId}/id-card/${side}-${Date.now()}.jpg`;
    const storageRef = ref(storage, path);
    await uploadBytes(storageRef, file);
    return await getDownloadURL(storageRef);
  }
  
  // Upgrade to premium
  async upgradeToPremium(userId: string): Promise<void> {
    await updateDoc(doc(db, 'users', userId), {
      planTier: 'premium',
      'permissions.maxListings': 10,
      subscription: {
        planId: 'premium',
        status: 'active',
        startDate: serverTimestamp(),
        endDate: null  // Will be set after payment
      },
      updatedAt: serverTimestamp()
    });
  }
}
```

**المدة:** يوم واحد

---

### 2.3 Dealer Profile Service

**الملف:** `src/services/profiles/dealer-profile.service.ts`

```typescript
/**
 * Dealer Profile Service
 * Operations specific to Dealer profiles
 */
export class DealerProfileService extends BaseProfileService {
  // Get dealer profile with type safety
  async getDealerProfile(userId: string): Promise<DealerProfile> {
    const profile = await this.getProfile(userId);
    
    if (!isDealerProfile(profile)) {
      throw new Error('Profile is not a Dealer profile');
    }
    
    return profile;
  }
  // Update dealership info
  async updateDealershipInfo(
    userId: string,
    dealershipInfo: Partial<DealerProfile['dealershipInfo']>
  ): Promise<void> {
    const profile = await this.getDealerProfile(userId);
    
    await updateDoc(doc(db, 'users', userId), {
      dealershipInfo: {
        ...profile.dealershipInfo,
        ...dealershipInfo
      },
      updatedAt: serverTimestamp()
    });
  }
  
  // Update working hours
  async updateWorkingHours(
    userId: string,
    workingHours: WorkingHours
  ): Promise<void> {
    await updateDoc(doc(db, 'users', userId), {
      'dealershipInfo.workingHours': workingHours,
      updatedAt: serverTimestamp()
    });
  }
  
  // Update services
  async updateServices(
    userId: string,
    services: Partial<DealerServices>
  ): Promise<void> {
    const profile = await this.getDealerProfile(userId);
    await updateDoc(doc(db, 'users', userId), {
      'dealershipInfo.services': {
        ...profile.dealershipInfo.services,
        ...services
      },
      updatedAt: serverTimestamp()
    });
  }
  
  // Upload logo
    const storageRef = ref(storage, path);
    await uploadBytes(storageRef, file);
    const url = await getDownloadURL(storageRef);
    
    await updateDoc(doc(db, 'users', userId), {
      'dealershipInfo.logo': url,
      updatedAt: serverTimestamp()
    });
    
    return url;
  }
  
  // Add team member
  async addTeamMember(
    userId: string,
    member: TeamMember
  ): Promise<void> {
    const profile = await this.getDealerProfile(userId);
    const currentMembers = profile.team?.members || [];
    
    if (currentMembers.length >= profile.team!.maxMembers) {
      throw new Error('Team size limit reached');
    }
    
    await updateDoc(doc(db, 'users', userId), {
      'team.members': arrayUnion(member),
      updatedAt: serverTimestamp()
    });
  
  // Submit business verification
  async submitBusinessVerification(
    userId: string,
    }
  ): Promise<void> {
    // Upload documents
    const regCertUrl = await this.uploadDocument(userId, documents.registrationCertificate, 'registration');
    const vatCertUrl = documents.vatCertificate 
      ? await this.uploadDocument(userId, documents.vatCertificate, 'vat')
      : undefined;
    
    await updateDoc(doc(db, 'users', userId), {
      'businessVerification.status': 'pending',
      'businessVerification.documents': {
        registrationCertificate: regCertUrl,
        vatCertificate: vatCertUrl,
        uploadedAt: serverTimestamp()
      },
      updatedAt: serverTimestamp()
    });
  }
  
  private async uploadDocument(userId: string, file: File, type: string): Promise<string> {
    const path = `dealerships/${userId}/documents/${type}-${Date.now()}.pdf`;
    const storageRef = ref(storage, path);
    await uploadBytes(storageRef, file);
    return await getDownloadURL(storageRef);
  }
```

**المدة:** يومان

---

### 2.4 Company Profile Service

**الملف:** `src/services/profiles/company-profile.service.ts`

```typescript
/**
 * Company Profile Service
 * Operations specific to Company profiles
 */
export class CompanyProfileService extends BaseProfileService {
  // Get company profile with type safety
  async getCompanyProfile(userId: string): Promise<CompanyProfile> {
    const profile = await this.getProfile(userId);
    
    if (!isCompanyProfile(profile)) {
      throw new Error('Profile is not a Company profile');
    }
    
    return profile;
  }
  
  // Update company info
  async updateCompanyInfo(
    userId: string,
    companyInfo: Partial<CompanyProfile['companyInfo']>
  ): Promise<void> {
    const profile = await this.getCompanyProfile(userId);
    
    await updateDoc(doc(db, 'users', userId), {
      companyInfo: {
        ...profile.companyInfo,
        ...companyInfo
      },
      updatedAt: serverTimestamp()
    });
  }
  
  async addDepartment(
    userId: string,
    department: Department
  ): Promise<void> {
  }
  
    member: TeamMember
  ): Promise<void> {
    const profile = await this.getCompanyProfile(userId);
    
    if (currentMembers.length >= profile.team.maxMembers) {
      throw new Error('Team size limit reached');
    }
    
    // Add member to team
    await updateDoc(doc(db, 'users', userId), {
      'team.members': arrayUnion(member),
      updatedAt: serverTimestamp()
    });
    
    // Add member to department
    const departments = profile.team.departments;
    const updatedDepartments = departments.map(dept => {
      if (dept.id === departmentId) {
        return {
          ...dept,
          memberIds: [...dept.memberIds, member.userId]
        };
      }
      return dept;
    });
    
    await updateDoc(doc(db, 'users', userId), {
      'team.departments': updatedDepartments,
      updatedAt: serverTimestamp()
    });
  }
  
  // Generate custom report (enterprise only)
  async generateCustomReport(
    userId: string,
    reportType: string
  ): Promise<ReportData> {
    const profile = await this.getCompanyProfile(userId);
    
    if (!profile.permissions.hasCustomReports) {
      throw new Error('Custom reports not available in current plan');
    }
    
    // Generate report logic...
    return {} as ReportData;
  }
}
```

**المدة:** يومان

---

### 2.5 Profile Factory Service

**الملف:** `src/services/profiles/profile-factory.service.ts`

```typescript
/**
 * Profile Factory Service
 * Creates new profiles of each type
 */
export class ProfileFactoryService {
  // Create Private Profile
  async createPrivateProfile(
    userId: string,
    data: {
      email: string;
      firstName: string;
      lastName: string;
    }
  ): Promise<PrivateProfile> {
    const profile: PrivateProfile = {
      // Base fields
      id: userId,
      email: data.email,
      displayName: `${data.firstName} ${data.lastName}`,
      firstName: data.firstName,
      lastName: data.lastName,
      
      // Type specific
      profileType: 'private',
      planTier: 'free',
      
      // Verification
      verification: {
        email: false,
        phone: false,
        id: false,
        business: false
      },
      
      // Stats
      stats: {
        totalListings: 0,
        activeListings: 0,
        totalViews: 0,
        totalMessages: 0,
        followersCount: 0,
        followingCount: 0,
        trustScore: 0
      },
      
      // Permissions
      permissions: {
        maxListings: 3,
        hasAnalytics: false,
        hasCampaigns: false,
        hasTeam: false,
        hasAPI: false
      },
      
      // Timestamps
      createdAt: serverTimestamp() as Timestamp,
      updatedAt: serverTimestamp() as Timestamp,
      
      // Flags
      isActive: true,
      isBanned: false,
      isFeatured: false
    };
    
    await setDoc(doc(db, 'users', userId), profile);
    return profile;
  }
  
  // Create Dealer Profile
  async createDealerProfile(
    userId: string,
    data: {
      email: string;
      firstName: string;
      lastName: string;
      dealershipNameBG: string;
      dealershipNameEN: string;
      vatNumber: string;
      companyRegNumber: string;
      planTier: 'dealer_basic' | 'dealer_pro' | 'dealer_enterprise';
    }
  ): Promise<DealerProfile> {
    const permissions = this.getDealerPermissions(data.planTier);
    
    const profile: DealerProfile = {
      // Base fields
      id: userId,
      email: data.email,
      displayName: data.dealershipNameEN,
      firstName: data.firstName,
      lastName: data.lastName,
      
      // Type specific
      profileType: 'dealer',
      planTier: data.planTier,
      
      // Dealership Info
      dealershipInfo: {
        dealershipNameBG: data.dealershipNameBG,
        dealershipNameEN: data.dealershipNameEN,
        description: '',
        legalForm: 'EOOD',
        vatNumber: data.vatNumber,
        companyRegNumber: data.companyRegNumber,
        businessAddress: {} as Address,
        businessPhone: '',
        businessEmail: data.email,
        workingHours: this.getDefaultWorkingHours(),
        services: this.getDefaultServices()
      },
      
      // Business Verification
      businessVerification: {
        status: 'pending'
      },
      
      // Verification
      verification: {
        email: false,
        phone: false,
        id: false,
        business: false
      },
      
      // Stats
      stats: {
        totalListings: 0,
        activeListings: 0,
        totalViews: 0,
        totalMessages: 0,
        followersCount: 0,
        followingCount: 0,
        trustScore: 0
      },
      
      // Permissions
      permissions,
      
      // Subscription (REQUIRED)
      subscription: {
        planId: data.planTier,
        status: 'active',
        startDate: serverTimestamp() as Timestamp,
        endDate: null as any,  // Will be set after payment
        autoRenew: true
      },
      
      // Timestamps
      createdAt: serverTimestamp() as Timestamp,
      updatedAt: serverTimestamp() as Timestamp,
      
      // Flags
      isActive: true,
      isBanned: false,
      isFeatured: false
    };
    
    await setDoc(doc(db, 'users', userId), profile);
    return profile;
  }
  
  // Create Company Profile
  async createCompanyProfile(
    userId: string,
    data: {
      email: string;
      firstName: string;
      lastName: string;
      companyNameBG: string;
      companyNameEN: string;
      bulstatNumber: string;
      eikNumber: string;
      vatNumber: string;
      planTier: 'company_starter' | 'company_pro' | 'company_enterprise';
    }
  ): Promise<CompanyProfile> {
    const permissions = this.getCompanyPermissions(data.planTier);
    
    const profile: CompanyProfile = {
      // Base fields
      id: userId,
      email: data.email,
      displayName: data.companyNameEN,
      firstName: data.firstName,
      lastName: data.lastName,
      
      // Type specific
      profileType: 'company',
      planTier: data.planTier,
      
      // Company Info
      companyInfo: {
        companyNameBG: data.companyNameBG,
        companyNameEN: data.companyNameEN,
        description: '',
        legalForm: 'OOD',
        bulstatNumber: data.bulstatNumber,
        eikNumber: data.eikNumber,
        vatNumber: data.vatNumber,
        fleetSize: 0,
        headquartersAddress: {} as Address,
        mainPhone: '',
        mainEmail: data.email,
        logo: ''
      },
      
      // Business Verification
      businessVerification: {
        status: 'pending',
        documents: {} as any
      },
      
      // Team (REQUIRED)
      team: {
        members: [],
        maxMembers: this.getMaxTeamMembers(data.planTier),
        departments: []
      },
      
      // Verification
      verification: {
        email: false,
        phone: false,
        id: false,
        business: false
      },
      
      // Stats
      stats: {
        totalListings: 0,
        activeListings: 0,
        totalViews: 0,
        totalMessages: 0,
        followersCount: 0,
        followingCount: 0,
        trustScore: 0
      },
      
      // Permissions
      permissions,
      
      // Subscription (REQUIRED)
      subscription: {
        planId: data.planTier,
        status: 'active',
        startDate: serverTimestamp() as Timestamp,
        endDate: null as any,
        autoRenew: true,
        stripeCustomerId: '',
        stripeSubscriptionId: ''
      },
      
      // Timestamps
      createdAt: serverTimestamp() as Timestamp,
      updatedAt: serverTimestamp() as Timestamp,
      
      // Flags
      isActive: true,
      isBanned: false,
      isFeatured: false
    };
    
    await setDoc(doc(db, 'users', userId), profile);
    return profile;
  }
  
  // Helper methods
  private getDealerPermissions(planTier: DealerProfile['planTier']): DealerProfile['permissions'] {
    const permissionsMap = {
      dealer_basic: {
        maxListings: 50,
        hasAnalytics: true,
        hasCampaigns: true,
        hasTeam: true,
        hasAPI: false,
        canImportCSV: false,
        canExportData: false
      },
      dealer_pro: {
        maxListings: 150,
        hasAnalytics: true,
        hasCampaigns: true,
        hasTeam: true,
        hasAPI: true,
        canImportCSV: true,
        canExportData: true
      },
      dealer_enterprise: {
        maxListings: 500,
        hasAnalytics: true,
        hasCampaigns: true,
        hasTeam: true,
        hasAPI: true,
        canImportCSV: true,
        canExportData: true
      }
    };
    
    return permissionsMap[planTier];
  }
  
  private getCompanyPermissions(planTier: CompanyProfile['planTier']): CompanyProfile['permissions'] {
    const permissionsMap = {
      company_starter: {
        maxListings: 100,
        hasAnalytics: true,
        hasCampaigns: true,
        hasTeam: true,
        hasAPI: true,
        canImportCSV: true,
        canExportData: true,
        hasPrioritySupport: true,
        hasCustomReports: false
      },
      company_pro: {
        maxListings: 300,
        hasAnalytics: true,
        hasCampaigns: true,
        hasTeam: true,
        hasAPI: true,
        canImportCSV: true,
        canExportData: true,
        hasPrioritySupport: true,
        hasCustomReports: true
      },
      company_enterprise: {
        maxListings: 1000,
        hasAnalytics: true,
        hasCampaigns: true,
        hasTeam: true,
        hasAPI: true,
        canImportCSV: true,
        canCanExportData: true,
        hasPrioritySupport: true,
        hasCustomReports: true
      }
    };
    
    return permissionsMap[planTier];
  }
  
  private getMaxTeamMembers(planTier: CompanyProfile['planTier']): number {
    const maxMembersMap = {
      company_starter: 10,
      company_pro: 30,
      company_enterprise: 100
    };
    
    return maxMembersMap[planTier];
  }
  
  private getDefaultWorkingHours(): WorkingHours {
    const defaultHours: DayHours = {
      isOpen: true,
      openTime: '09:00',
      closeTime: '18:00'
    };
    
    return {
      monday: defaultHours,
      tuesday: defaultHours,
      wednesday: defaultHours,
      thursday: defaultHours,
      friday: defaultHours,
      saturday: { isOpen: true, openTime: '10:00', closeTime: '14:00' },
      sunday: { isOpen: false }
    };
  }
  
  private getDefaultServices(): DealerServices {
    return {
      financing: false,
      warranty: false,
      tradeIn: false,
      delivery: false,
      service: false,
      bodyShop: false,
      towing: false,
      rentCar: false
    };
  }
}
```

**المدة:** يومان

---

### Phase 2 Summary

**الملفات المُنشأة (5 files):**
1. ✅ `base-profile.service.ts`
2. ✅ `private-profile.service.ts`
3. ✅ `dealer-profile.service.ts`
4. ✅ `company-profile.service.ts`
5. ✅ `profile-factory.service.ts`

**المدة الإجمالية:** 10 أيام عمل  
**الاختبارات:** Unit + Integration tests

---

## Phase 3: UI Components & Forms (ENHANCED)
**المدة:** أسبوعان + 2 أيام (12 يوم عمل)  
**الأولوية:** 🟡 MEDIUM

> **Phase 3** مقسّمة لأولويات: ProfilePage Split أولاً (مستقل)، ثم Type-Safe Components

### 3.0 ProfilePage Split (PRIORITY #1 - مستقل عن الـ Types)

**المشكلة:** `src/pages/ProfilePage/index.tsx` = 2227 سطر

**الحل:**

```
src/pages/ProfilePage/
├── index.tsx                    (~150 lines) - Router + Tab Navigation
├── ProfileOverview.tsx          (~250 lines) - Overview tab
├── ProfileSettings.tsx          (~300 lines) - Settings tab
├── ProfileAnalytics.tsx         (~280 lines) - Analytics (dealer/company only)
├── ProfileGallery.tsx           (~220 lines) - Gallery tab
├── ProfileTeam.tsx              (~350 lines) - Team management
├── ProfileCampaigns.tsx         (~320 lines) - Campaigns
└── styles.ts                    (~200 lines) - Shared styles
```

**لماذا أولاً؟**
- ✅ مستقل عن Phase 1/2 (يمكن عمله الآن!)
- ✅ يحل مشكلة حرجة (2227 سطر)
- ✅ يسهّل Phase 3.1+ (ملفات أصغر)

**المدة:** يومان

---

### 3.1 Type-Safe Profile Components

**الهدف:** تحديث Components لاستخدام Discriminated Unions

```typescript
// BEFORE: Runtime checks
function ProfileCard({ user }: { user: any }) {
  if (user.profileType === 'dealer') {
    return <DealerCard dealer={user as any} />;
  }
  // ...
}

// AFTER: Type-safe with discriminated unions
function ProfileCard({ user }: { user: BulgarianUser }) {
  switch (user.profileType) {
    case 'private':
      return <PrivateProfileCard profile={user} />;  // user is PrivateProfile
    case 'dealer':
      return <DealerProfileCard profile={user} />;   // user is DealerProfile
    case 'company':
      return <CompanyProfileCard profile={user} />;  // user is CompanyProfile
  }
}
```

**Components to update:**
- ProfileOverview.tsx
- ProfileSettings.tsx
- ProfileAnalytics.tsx (dealer/company only)
- ProfileTeam.tsx (dealer/company only)

**المدة:** 3 أيام

---

### 3.2 Type-Specific Forms

**Private Form:**
```typescript
// src/components/Profile/PrivateProfileForm.tsx
interface PrivateProfileFormProps {
  profile: PrivateProfile;  // Type-safe!
  onUpdate: (data: Partial<PrivateProfile>) => Promise<void>;
}
```

**Dealer Form:**
```typescript
// src/components/Profile/DealerProfileForm.tsx
interface DealerProfileFormProps {
  profile: DealerProfile;
  onUpdate: (data: Partial<DealerProfile>) => Promise<void>;
}
```

**Company Form:**
```typescript
// src/components/Profile/CompanyProfileForm.tsx
interface CompanyProfileFormProps {
  profile: CompanyProfile;
  onUpdate: (data: Partial<CompanyProfile>) => Promise<void>;
}
```

**المدة:** 5 أيام

---

### 3.3 Update Routing

**ProfileRouter Enhancement:**

```typescript
function ProfileRouter() {
  const { user } = useAuth();
  const profile = user as BulgarianUser;
  
  // Type-safe routing based on profile type
  switch (profile.profileType) {
    case 'private':
      return <PrivateProfileRoutes profile={profile} />;
    case 'dealer':
      return <DealerProfileRoutes profile={profile} />;
    case 'company':
      return <CompanyProfileRoutes profile={profile} />;
  }
}
```

**المدة:** يومان

---

## Phase 4: Migration & Testing
**المدة:** أسبوعان (10 أيام عمل)  
**الأولوية:** 🔥 CRITICAL

> **Phase 4 المحسّنة:** مع Rollback Strategy + Gradual Rollout

### 4.1 Migration Script with Snapshots

```typescript
/**
 * Profile Migration Service
 * Migrates users to new type system with rollback capability
 */
class ProfileMigrationService {
  
  async migrateUser(userId: string): Promise<{
    success: boolean;
    snapshotId?: string;
    error?: string;
  }> {
    let snapshotId: string | null = null;
    
    try {
      // 1️⃣ Create snapshot (backup)
      snapshotId = await this.createSnapshot(userId);
      logger.info('Snapshot created', { userId, snapshotId });
      
      // 2️⃣ Fetch current data
      const currentData = await this.fetchUserData(userId);
      
      // 3️⃣ Transform to new structure
      const newProfile = await this.transformProfile(currentData);
      
      // 4️⃣ Validate new profile
      this.validateNewProfile(newProfile);
      
      // 5️⃣ Write to Firestore
      await this.writeNewProfile(userId, newProfile);
      
      // 6️⃣ Verify migration
      await this.verifyMigration(userId, newProfile);
      
      // 7️⃣ Schedule snapshot cleanup (after 7 days)
      await this.scheduleSnapshotCleanup(snapshotId, 7);
      
      logger.info('Migration successful', { userId });
      return { success: true, snapshotId };
      
    } catch (error) {
      logger.error('Migration failed', error, { userId });
      
      // 8️⃣ ROLLBACK
      if (snapshotId) {
        await this.rollback(userId, snapshotId);
        logger.info('Rolled back to snapshot', { userId, snapshotId });
      }
      
      return { 
        success: false, 
        error: error.message 
      };
    }
  }
  
  private async createSnapshot(userId: string): Promise<string> {
    const userData = await getDoc(doc(db, 'users', userId));
    const snapshotId = `snapshot_${userId}_${Date.now()}`;
    
    await setDoc(doc(db, 'migration_snapshots', snapshotId), {
      userId,
      data: userData.data(),
      createdAt: serverTimestamp()
    });
    
    return snapshotId;
  }
  
  private async rollback(userId: string, snapshotId: string): Promise<void> {
    const snapshot = await getDoc(doc(db, 'migration_snapshots', snapshotId));
    
    if (!snapshot.exists()) {
      throw new Error(`Snapshot not found: ${snapshotId}`);
    }
    
    const originalData = snapshot.data().data;
    await setDoc(doc(db, 'users', userId), originalData);
    
    logger.info('Rollback completed', { userId, snapshotId });
  }
}
```

**المدة:** 3 أيام

---

### 4.2 Gradual Rollout Strategy

**النشر التدريجي الآمن:**

```
Week 1: 5% of users (test accounts + volunteers)
├── Monitor errors
├── Check performance
└── Gather feedback

Week 2: 25% of users
├── Include mix of private/dealer/company
├── Monitor closely
└── Fix any issues

Week 3: 50% of users
├── Majority migration
├── Performance monitoring
└── Support team on standby

Week 4: 100% of users
├── Complete migration
├── Archive snapshots after 7 days
└── Celebrate! 🎉
```

**Feature Flag Implementation:**

```typescript
// Firebase Remote Config
const USE_NEW_PROFILE_TYPES = remoteConfig().getBoolean('use_new_profile_types');

// Gradual rollout
const ROLLOUT_PERCENTAGE = remoteConfig().getNumber('profile_types_rollout');

function shouldUseNewTypes(userId: string): boolean {
  if (!USE_NEW_PROFILE_TYPES) return false;
  
  // Consistent hash-based rollout
  const hash = simpleHash(userId);
  return (hash % 100) < ROLLOUT_PERCENTAGE;
}
```

**المدة:** أسبوع واحد (Setup)

---

### 4.3 Monitoring & Alerts

**Real-time Monitoring:**

```typescript
// Migration dashboard metrics
interface MigrationMetrics {
  total: number;
  successful: number;
  failed: number;
  rolledBack: number;
  inProgress: number;
  averageDuration: number;  // milliseconds
  errorRate: number;        // percentage
}

// Alert triggers
const ALERT_THRESHOLDS = {
  errorRate: 5,           // Alert if >5% fail
  avgDuration: 30000,     // Alert if >30s per migration
  rolledBack: 10          // Alert if >10 rollbacks/hour
};
```

**المدة:** يومان

---

### 4.4 Testing Strategy

**Unit Tests:**
- All validators
- All type guards
- Migration transform logic

**Integration Tests:**
- End-to-end profile creation
- Profile type switching
- Permission validation

**Load Testing:**
- Migration performance with 1000+ users
- Rollback speed

**User Acceptance Testing:**
- Private user flow
- Dealer upgrade flow
- Company registration flow

**المدة:** 3 أيام

---

### 4.5 Firestore Security Rules Update

```javascript
// firestore.rules - Enhanced with type validation

match /users/{userId} {
  allow read: if request.auth != null;
  
  allow create: if request.auth.uid == userId
    && validateProfileType(request.resource.data);
  
  allow update: if request.auth.uid == userId
    && validateProfileTypeSwitch(
      resource.data,
      request.resource.data
    );
}

function validateProfileType(data) {
  // Dealer MUST have dealershipInfo
  return data.profileType == 'dealer' 
    ? data.dealershipInfo != null && data.dealershipInfo.vatNumber != null
    : true;
}

function validateProfileTypeSwitch(oldData, newData) {
  // Can't switch from dealer to private if >10 active listings
  return (oldData.profileType == 'dealer' && newData.profileType == 'private')
    ? oldData.stats.activeListings <= 10
    : true;
}
```

**المدة:** يوم واحد

---

## Phase 4 Summary

**Components:**
- ✅ Migration script with snapshots
- ✅ Rollback capability
- ✅ Gradual rollout (4 weeks)
- ✅ Real-time monitoring
- ✅ Comprehensive testing
- ✅ Security rules updated

**Total Duration:** أسبوعان (setup) + 4 أسابيع (rollout)

---

## Timeline & Resources

**المدة الإجمالية:** 6-7 أسابيع + 4 أسابيع rollout

| Phase | المدة | الأولوية | الموارد |
|-------|-------|----------|---------|
| Phase 0 | 3-4 أيام | 🔥🔥 CRITICAL | 1 Senior Dev |
| Phase 1 | 1 أسبوع | 🔥 CRITICAL | 1 Senior Dev |
| Phase 2A | 1 أسبوع | 🔥 HIGH | 2 Developers |
| Phase 2B | 1 أسبوع | 🔥 HIGH | 2 Developers |
| Phase 3 | 12 يوم | 🟡 MEDIUM | 1 Developer + 1 UI/UX |
| Phase 4 | 2 أسابيع | 🔥 CRITICAL | Full Team |
| Rollout | 4 أسابيع | 🔥 CRITICAL | Support + DevOps |

---

## Success Criteria

### Phase 1:
- ✅ All types defined with 100% TypeScript coverage
- ✅ Type guards working correctly
- ✅ Runtime validators implemented
- ✅ All unit tests passing

### Phase 2:
- ✅ Services refactored for each type
- ✅ Duplicate services merged
- ✅ Context providers validated
- ✅ Firebase operations working
- ✅ Integration tests passing

### Phase 3:
- ✅ ProfilePage split (<300 lines per file)
- ✅ UI components for all types
- ✅ Type-safe component props
- ✅ Forms validation working
- ✅ User testing completed

### Phase 4:
- ✅ Migration script with rollback
- ✅ 100% users migrated (4 weeks)
- ✅ <5% error rate maintained
- ✅ Zero data loss
- ✅ Production monitoring active
- ✅ Security rules enforced

---

**آخر تحديث:** 2 نوفمبر 2025  
**الإصدار:** v2.0 (ENHANCED)  
**الحالة:** 📋 Ready for Implementation

**ملاحظة:** هذه النسخة المحسّنة تضيف Phase 0، تقسيم Phase 2، ProfilePage Split، و Rollback Strategy المحكم.

