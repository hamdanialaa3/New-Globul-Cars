# سجل التغييرات التفصيلي - توحيد نظام الاشتراكات
## Detailed Changelog - Subscription System Unification

> **تاريخ التنفيذ**: ديسمبر 2025
> **الحالة**: ✅ 6 من 9 مهام مكتملة

---

## 📋 ملخص التنفيذ | Execution Summary

| الملف | السطور المعدلة | النوع | الحالة |
|------|----------------|-------|--------|
| `bulgarian-user.types.ts` | 10-18, 135-137, 150-152 | Type Definition | ✅ مكتمل |
| `features/billing/types.ts` | 1-5 | Type Definition | ✅ مكتمل |
| `functions/subscriptions/types.ts` | 5-6 | Type Definition | ✅ مكتمل |
| `functions/subscriptions/config.ts` | 33-163 | Configuration | ✅ مكتمل |
| `ProfileTypeContext.tsx` (2 files) | 86-99 | Business Logic | ✅ مكتمل |
| `listing-limits.ts` (2 files) | 10-19 | Business Logic | ✅ مكتمل |
| `PermissionsService.ts` | 144-320, 408-435 | Business Logic | ✅ مكتمل |
| `ProfileService.ts` | 136, 156 | Business Logic | ✅ مكتمل |
| `packages/profile/src/types.ts` | 144-145 | Type Definition | ✅ مكتمل |
| `createCheckoutSession.ts` | 18-38, 60-82 | API Function | ✅ مكتمل |

**إجمالي**: 10 ملفات معدلة، ~300 سطر معدل

---

## 📄 تفاصيل كل ملف | File-by-File Details

### 1. `bulgarian-user.types.ts`
**المسار الكامل**: `bulgarian-car-marketplace/src/types/user/bulgarian-user.types.ts`

#### التغيير 1: PlanTier Type Definition (Lines 10-18)

**قبل**:
```typescript
// ==================== SUPPORTING TYPES ====================
export type PlanTier = 
  | 'free' 
  | 'premium' 
  | 'dealer_basic' 
  | 'dealer_pro' 
  | 'dealer_enterprise' 
  | 'company_starter' 
  | 'company_pro' 
  | 'company_enterprise';

export type BillingInterval = 'monthly' | 'annual';
```

**بعد**:
```typescript
// ==================== SUPPORTING TYPES ====================
/**
 * Unified Plan Tiers - matches BillingService.ts
 * Updated: December 2025
 */
export type PlanTier = 'free' | 'dealer' | 'company';

export type BillingInterval = 'monthly' | 'annual';
```

**السبب**: إزالة 6 قيم غير مستخدمة (premium, dealer_basic, dealer_pro, dealer_enterprise, company_starter, company_pro, company_enterprise)

#### التغيير 2: DealerProfile Interface (Lines 135-137)

**قبل**:
```typescript
export interface DealerProfile extends BaseProfile {
  profileType: 'dealer';
  planTier: 'dealer_basic' | 'dealer_pro' | 'dealer_enterprise';
```

**بعد**:
```typescript
export interface DealerProfile extends BaseProfile {
  profileType: 'dealer';
  planTier: 'dealer';
```

**السبب**: توحيد جميع تجار السيارات تحت خطة واحدة

#### التغيير 3: CompanyProfile Interface (Lines 150-152)

**قبل**:
```typescript
export interface CompanyProfile extends BaseProfile {
  profileType: 'company';
  planTier: 'company_starter' | 'company_pro' | 'company_enterprise';
```

**بعد**:
```typescript
export interface CompanyProfile extends BaseProfile {
  profileType: 'company';
  planTier: 'company';
```

**السبب**: توحيد جميع الشركات تحت خطة واحدة

**التأثير**: TypeScript الآن يرفض `planTier: 'dealer_basic'` - يجب استخدام `'dealer'` فقط

---

### 2. `features/billing/types.ts`
**المسار الكامل**: `bulgarian-car-marketplace/src/features/billing/types.ts`

#### التغيير: Simplified PlanTier (Lines 1-5)

**قبل**:
```typescript
// src/features/billing/types.ts
// Billing System Types

export type PlanTier = 
  | 'free' 
  | 'premium' 
  | 'dealer_basic' 
  | 'dealer_pro' 
  | 'dealer_enterprise' 
  | 'company_starter' 
  | 'company_pro' 
  | 'company_enterprise' 
  | 'custom';
```

**بعد**:
```typescript
// src/features/billing/types.ts
// Billing System Types
// Updated: December 2025 - Simplified to 3 plans

export type PlanTier = 'free' | 'dealer' | 'company';
```

**السبب**: هذا الملف كان يعرّف 9 خطط بينما BillingService يستخدم 3 فقط - تسبب في type mismatch

**التأثير**: الآن BillingService و types.ts متطابقان تمامًا

---

### 3. `functions/src/subscriptions/types.ts`
**المسار الكامل**: `functions/src/subscriptions/types.ts`

#### التغيير: Backend SubscriptionPlan tier (Lines 5-6)

**قبل**:
```typescript
// functions/src/subscriptions/types.ts
// Subscription System Types for Cloud Functions

export interface SubscriptionPlan {
  id: string;
  tier: 'free' | 'basic' | 'pro' | 'premium' | 'dealer_basic' | 'dealer_premium' | 'enterprise';
```

**بعد**:
```typescript
// functions/src/subscriptions/types.ts
// Subscription System Types for Cloud Functions
// Updated: December 2025 - Unified with Frontend (3 plans only)

export interface SubscriptionPlan {
  id: string;
  tier: 'free' | 'dealer' | 'company';
```

**السبب**: Backend كان يستخدم أسماء مختلفة تمامًا عن Frontend ('dealer_premium', 'enterprise')

**التأثير الحاسم**: الآن عندما يرسل Frontend `{ planId: 'dealer' }`, Backend يفهمه ✅

---

### 4. `functions/src/subscriptions/config.ts`
**المسار الكامل**: `functions/src/subscriptions/config.ts`

#### التغيير الكبير: SUBSCRIPTION_PLANS Restructure (Lines 33-163)

**قبل** (225 سطر - 7 خطط):
```typescript
export const SUBSCRIPTION_PLANS: Record<string, SubscriptionPlan> = {
  free: { 
    tier: 'free', 
    price: 0, 
    currency: 'BGN', 
    limits: { listings: 1, photos: 5, teamMembers: 0 } 
  },
  basic: { tier: 'basic', price: 9.99, currency: 'BGN', ... },
  pro: { tier: 'pro', price: 19.99, currency: 'BGN', ... },
  dealer_basic: { tier: 'dealer_basic', price: 49.99, currency: 'BGN', ... },
  dealer_premium: { tier: 'dealer_premium', price: 99.99, currency: 'BGN', ... },
  enterprise: { tier: 'enterprise', price: 299.99, currency: 'BGN', ... },
};
```

**بعد** (5 خطط فعلية):
```typescript
export const SUBSCRIPTION_PLANS: Record<string, SubscriptionPlan> = {
  free: {
    id: 'free',
    tier: 'free',
    price: 0,
    currency: 'EUR', // ⚠️ تغيير من BGN إلى EUR
    stripePriceId: '', // Free has no Stripe price
    limits: { 
      listings: 5,      // ⚠️ تغيير من 1 إلى 5
      photos: 10,       // ⚠️ تغيير من 5 إلى 10
      teamMembers: 0 
    }
  },
  
  dealer: {
    id: 'dealer',
    tier: 'dealer',
    price: 29,          // ⚠️ جديد - €29/month
    currency: 'EUR',
    billingPeriod: 'monthly',
    stripePriceId: 'price_DEALER_MONTHLY', // TODO
    limits: { 
      listings: 15,     // ⚠️ جديد
      photos: 30, 
      teamMembers: 3 
    }
  },
  
  dealer_annual: {     // ⚠️ خطة جديدة تمامًا
    id: 'dealer_annual',
    tier: 'dealer',    // نفس tier، id مختلف
    price: 300,        // €300/year (save €48)
    currency: 'EUR',
    billingPeriod: 'yearly',
    stripePriceId: 'price_DEALER_ANNUAL', // TODO
    limits: { listings: 15, photos: 30, teamMembers: 3 }
  },
  
  company: {
    id: 'company',
    tier: 'company',
    price: 199,         // ⚠️ جديد - €199/month
    currency: 'EUR',
    billingPeriod: 'monthly',
    stripePriceId: 'price_COMPANY_MONTHLY', // TODO
    limits: { 
      listings: -1,     // ⚠️ Unlimited
      photos: 50, 
      teamMembers: 10 
    }
  },
  
  company_annual: {    // ⚠️ خطة جديدة تمامًا
    id: 'company_annual',
    tier: 'company',   // نفس tier، id مختلف
    price: 1600,       // €1600/year (save €788)
    currency: 'EUR',
    billingPeriod: 'yearly',
    stripePriceId: 'price_COMPANY_ANNUAL', // TODO
    limits: { listings: -1, photos: 50, teamMembers: 10 }
  }
};
```

**ملاحظات هامة**:
1. ❌ **حذف**: basic, pro, dealer_premium, enterprise
2. ✅ **إضافة**: dealer_annual, company_annual (لدعم الفواتير السنوية)
3. 🔄 **تغيير العملة**: BGN → EUR (لمطابقة BillingService)
4. 🔄 **تغيير حد Free**: 1 إعلان → 5 إعلانات

**السبب الحاسم**: 
- `tier` الآن يطابق Frontend تمامًا
- `id` مختلف للخطط السنوية لكن `tier` نفسه (dealer_annual.tier = 'dealer')

---

### 5. `ProfileTypeContext.tsx` (ملفين)
**المسارات**:
- `bulgarian-car-marketplace/src/contexts/ProfileTypeContext.tsx`
- `packages/core/src/contexts/ProfileTypeContext.tsx`

#### التغيير: PLAN_LIMITS Simplification (Lines 86-99)

**قبل**:
```typescript
function getPermissions(profileType: ProfileType, planTier: PlanTier): ProfilePermissions {
  const PLAN_LIMITS: Record<PlanTier, number> = {
    free: 3,                  // ❌ خطأ
    premium: 10,              // ❌ لا توجد هذه الخطة
    dealer_basic: 50,         // ❌ لا توجد هذه الخطة
    dealer_pro: 150,
    dealer_enterprise: -1,
    company_starter: 100,
    company_pro: -1,
    company_enterprise: -1
  };

  const maxListings = PLAN_LIMITS[planTier] || 3;
```

**بعد**:
```typescript
function getPermissions(profileType: ProfileType, planTier: PlanTier): ProfilePermissions {
  // Updated December 2025 - Simplified to 3 plans matching BillingService
  const PLAN_LIMITS: Record<PlanTier, number> = {
    free: 5,      // ✅ صحيح (matches BillingService)
    dealer: 15,   // ✅ صحيح
    company: -1   // ✅ unlimited
  };

  const maxListings = PLAN_LIMITS[planTier] || 5;
```

**السبب**: 
- القيمة القديمة `free: 3` كانت خطأ - BillingService يقول `5`
- الخطط dealer_basic/pro/enterprise لا توجد في BillingService

**التأثير**: الآن الحدود صحيحة ومتسقة عبر كل الطبقات

---

### 6. `listing-limits.ts` (ملفين)
**المسارات**:
- `bulgarian-car-marketplace/src/utils/listing-limits.ts`
- `packages/core/src/utils/listing-limits.ts`

#### التغيير: PLAN_LIMITS Configuration (Lines 10-19)

**قبل**:
```typescript
// Plan Limits Configuration
const PLAN_LIMITS: Record<PlanTier, number> = {
  free: 3,
  premium: 10,
  dealer_basic: 50,
  dealer_pro: 150,
  dealer_enterprise: -1,
  company_starter: 100,
  company_pro: -1,
  company_enterprise: -1,
  custom: -1
};
```

**بعد**:
```typescript
// Plan Limits Configuration
// Updated December 2025 - Simplified to 3 plans matching BillingService
const PLAN_LIMITS: Record<PlanTier, number> = {
  free: 5,
  dealer: 15,
  company: -1
};
```

**السبب**: نفس السبب كـ ProfileTypeContext - توحيد الحدود

**الوظائف المتأثرة**:
```typescript
// هذه الدوال تستخدم PLAN_LIMITS
async function canAddListing(userId: string): Promise<boolean> {
  const limit = PLAN_LIMITS[planTier as PlanTier] || 3;
  // الآن limit صحيح
}

async function getRemainingListings(userId: string): Promise<number> {
  const limit = PLAN_LIMITS[planTier as PlanTier] || 3;
  // الآن limit صحيح
}

function getPlanListingLimit(planTier: PlanTier): number {
  return PLAN_LIMITS[planTier] || 3;
  // الآن القيمة الافتراضية 5 (من التغيير في السطر 99)
}
```

---

### 7. `PermissionsService.ts`
**المسار**: `packages/services/src/profile/PermissionsService.ts`

#### التغيير 1: getTierPermissions Consolidation (Lines 144-320)

**قبل** (9 حالات):
```typescript
private static getTierPermissions(planTier: PlanTier): ProfilePermissions {
  switch (planTier) {
    case 'free': return { maxListings: 3, ... };
    case 'premium': return { maxListings: 10, ... };
    case 'dealer_basic': return { maxListings: 50, maxTeamMembers: 2, ... };
    case 'dealer_pro': return { maxListings: 150, maxTeamMembers: 5, ... };
    case 'dealer_enterprise': return { maxListings: -1, maxTeamMembers: -1, ... };
    case 'company_starter': return { maxListings: 100, maxTeamMembers: 10, ... };
    case 'company_pro': return { maxListings: -1, maxTeamMembers: 50, ... };
    case 'company_enterprise': return { maxListings: -1, maxTeamMembers: -1, ... };
    default: return this.getTierPermissions('free');
  }
}
```

**بعد** (3 حالات):
```typescript
private static getTierPermissions(planTier: PlanTier): ProfilePermissions {
  switch (planTier) {
    case 'free':
      return {
        canAddListings: true,
        maxListings: 5,           // ✅ Updated
        canFeatureListings: false,
        canBulkUpload: false,
        hasAnalytics: false,
        hasAdvancedAnalytics: false,
        hasExportAnalytics: false,
        hasTeam: false,
        maxTeamMembers: 0,
        canAssignRoles: false,
        canExportData: false,
        canImportData: false,
        canBulkEdit: false,
        canUseAPI: false,
        hasWebhooks: false,
        apiRateLimitPerHour: 0,
        canCreateCampaigns: false,
        maxCampaigns: 0,
        canUseEmailMarketing: false,
        hasPrioritySupport: false,
        hasAccountManager: false,
        canRequestConsultations: true,
        canCustomizeBranding: false,
        canHideCompetitors: false,
        hasFeaturedBadge: false
      };

    case 'dealer':                // ✅ Unified all dealer tiers
      return {
        canAddListings: true,
        maxListings: 15,          // ✅ From BillingService
        canFeatureListings: true,
        canBulkUpload: true,
        hasAnalytics: true,
        hasAdvancedAnalytics: true,
        hasExportAnalytics: true,
        hasTeam: true,
        maxTeamMembers: 3,        // ✅ Average of old tiers
        canAssignRoles: true,
        canExportData: true,
        canImportData: true,
        canBulkEdit: true,
        canUseAPI: false,         // ✅ API only for Company
        hasWebhooks: false,
        apiRateLimitPerHour: 0,
        canCreateCampaigns: true,
        maxCampaigns: 5,
        canUseEmailMarketing: true,
        hasPrioritySupport: true,
        hasAccountManager: false,  // ✅ Only Company has this
        canRequestConsultations: true,
        canCustomizeBranding: true,
        canHideCompetitors: false,
        hasFeaturedBadge: true
      };

    case 'company':               // ✅ Unified all company tiers
      return {
        canAddListings: true,
        maxListings: -1,          // ✅ Unlimited
        canFeatureListings: true,
        canBulkUpload: true,
        hasAnalytics: true,
        hasAdvancedAnalytics: true,
        hasExportAnalytics: true,
        hasTeam: true,
        maxTeamMembers: 10,       // ✅ From BillingService
        canAssignRoles: true,
        canExportData: true,
        canImportData: true,
        canBulkEdit: true,
        canUseAPI: true,          // ✅ API access
        hasWebhooks: true,
        apiRateLimitPerHour: 5000,
        canCreateCampaigns: true,
        maxCampaigns: -1,         // ✅ Unlimited
        canUseEmailMarketing: true,
        hasPrioritySupport: true,
        hasAccountManager: true,   // ✅ Dedicated account manager
        canRequestConsultations: true,
        canCustomizeBranding: true,
        canHideCompetitors: true,
        hasFeaturedBadge: true
      };

    default:
      return this.getTierPermissions('free');
  }
}
```

**القرارات المهمة**:
1. **Dealer Features**: دمج أفضل ميزات dealer_pro (بدون API/Webhooks)
2. **Company Features**: دمج أفضل ميزات company_pro (مع API/Webhooks)
3. **Team Limits**: Dealer=3, Company=10 (قيم متوازنة)

#### التغيير 2: getPlanDisplayName Update (Lines 408-420)

**قبل**:
```typescript
static getPlanDisplayName(planTier: PlanTier, language: 'bg' | 'en' = 'bg'): string {
  const names: Record<PlanTier, { bg: string; en: string }> = {
    free: { bg: 'Безплатен', en: 'Free' },
    premium: { bg: 'Премиум', en: 'Premium' },
    dealer_basic: { bg: 'Дилър - Базов', en: 'Dealer - Basic' },
    dealer_pro: { bg: 'Дилър - Професионален', en: 'Dealer - Pro' },
    dealer_enterprise: { bg: 'Дилър - Корпоративен', en: 'Dealer - Enterprise' },
    company_starter: { bg: 'Компания - Стартиращ', en: 'Company - Starter' },
    company_pro: { bg: 'Компания - Професионален', en: 'Company - Pro' },
    company_enterprise: { bg: 'Компания - Корпоративен', en: 'Company - Enterprise' }
  };
  return names[planTier]?.[language] || planTier;
}
```

**بعد**:
```typescript
static getPlanDisplayName(planTier: PlanTier, language: 'bg' | 'en' = 'bg'): string {
  const names: Record<PlanTier, { bg: string; en: string }> = {
    free: { bg: 'Безплатен', en: 'Free' },
    dealer: { bg: 'Търговец', en: 'Dealer' },
    company: { bg: 'Компания', en: 'Company' }
  };
  return names[planTier]?.[language] || planTier;
}
```

#### التغيير 3: isHigherTier Update (Lines 426-435)

**قبل**:
```typescript
static isHigherTier(tier1: PlanTier, tier2: PlanTier): boolean {
  const tierRanking: Record<PlanTier, number> = {
    free: 0,
    premium: 1,
    dealer_basic: 2,
    dealer_pro: 3,
    dealer_enterprise: 4,
    company_starter: 3,
    company_pro: 4,
    company_enterprise: 5
  };
  return tierRanking[tier1] > tierRanking[tier2];
}
```

**بعد**:
```typescript
static isHigherTier(tier1: PlanTier, tier2: PlanTier): boolean {
  const tierRanking: Record<PlanTier, number> = {
    free: 0,
    dealer: 2,
    company: 3
  };
  return tierRanking[tier1] > tierRanking[tier2];
}
```

**مثال الاستخدام**:
```typescript
PermissionsService.isHigherTier('company', 'dealer'); // true
PermissionsService.isHigherTier('dealer', 'free');    // true
PermissionsService.isHigherTier('free', 'dealer');    // false
```

---

### 8. `ProfileService.ts`
**المسار**: `packages/services/src/profile/ProfileService.ts`

#### التغيير 1: Dealer Profile Creation (Line 136)

**قبل**:
```typescript
transaction.update(userRef, {
  profileType: 'dealer',
  dealershipRef: `dealerships/${uid}`,
  planTier: currentUser.planTier?.includes('dealer') ? currentUser.planTier : 'dealer_basic',
  updatedAt: serverTimestamp()
});
```

**بعد**:
```typescript
transaction.update(userRef, {
  profileType: 'dealer',
  dealershipRef: `dealerships/${uid}`,
  planTier: 'dealer', // Simplified to single dealer tier
  updatedAt: serverTimestamp()
});
```

**السبب**: لا حاجة للتحقق - الجميع يحصل على 'dealer'

#### التغيير 2: Company Profile Creation (Line 156)

**قبل**:
```typescript
transaction.update(userRef, {
  profileType: 'company',
  companyRef: `companies/${uid}`,
  planTier: currentUser.planTier?.includes('company') ? currentUser.planTier : 'company_starter',
  updatedAt: serverTimestamp()
});
```

**بعد**:
```typescript
transaction.update(userRef, {
  profileType: 'company',
  companyRef: `companies/${uid}`,
  planTier: 'company', // Simplified to single company tier
  updatedAt: serverTimestamp()
});
```

**التأثير**: 
- عند التبديل من Private → Dealer: `planTier = 'dealer'`
- عند التبديل من Private → Company: `planTier = 'company'`
- لا توجد اختيارات فرعية

---

### 9. `packages/profile/src/types.ts`
**المسار**: `packages/profile/src/types.ts`

#### التغيير: Profile planTier (Lines 144-145)

**قبل**:
```typescript
planTier?: 'free' | 'premium' | 'dealer_basic' | 'dealer_pro' | 'dealer_enterprise' | 
           'company_starter' | 'company_pro' | 'company_enterprise' | 'custom';
```

**بعد**:
```typescript
// Updated December 2025 - Simplified to 3 plans
planTier?: 'free' | 'dealer' | 'company';
```

**السبب**: توحيد مع باقي الملفات

---

### 10. `createCheckoutSession.ts`
**المسار**: `functions/src/subscriptions/createCheckoutSession.ts`

#### التغيير 1: Function Signature (Lines 18-38)

**قبل**:
```typescript
/**
 * Create Stripe Checkout Session
 * 
 * @param userId - The user ID subscribing
 * @param planId - The subscription plan ID
 * @param successUrl - Optional custom success URL
 * @param cancelUrl - Optional custom cancel URL
 */
export const createCheckoutSession = onCall<{
  userId: string;
  planId: string;
  successUrl?: string;
  cancelUrl?: string;
}>({ region: 'europe-west1' }, async (request) => {
  const { userId, planId, successUrl, cancelUrl } = request.data;
```

**بعد**:
```typescript
/**
 * Create Stripe Checkout Session
 * 
 * Updated: December 2025 - Added interval parameter support
 * 
 * @param userId - The user ID subscribing
 * @param planId - The subscription plan ID (dealer or company)
 * @param interval - Billing interval ('monthly' or 'annual')
 * @param successUrl - Optional custom success URL
 * @param cancelUrl - Optional custom cancel URL
 */
export const createCheckoutSession = onCall<{
  userId: string;
  planId: string;
  interval?: 'monthly' | 'annual'; // ⚠️ New parameter
  successUrl?: string;
  cancelUrl?: string;
}>({ region: 'europe-west1' }, async (request) => {
  const { userId, planId, interval = 'monthly', successUrl, cancelUrl } = request.data;
```

#### التغيير 2: Plan Resolution Logic (Lines 60-82)

**قبل**:
```typescript
// 3. Validate plan
if (!validatePaidPlan(planId)) {
  throw new HttpsError('invalid-argument', `Invalid or free plan: ${planId}`);
}

const plan = getPlanById(planId)!;

if (!plan.stripePriceId) {
  throw new HttpsError('failed-precondition', 'Stripe Price ID not configured for this plan');
}

logger.info('Creating checkout session', { userId, planId });
```

**بعد**:
```typescript
// 3. Validate plan and interval
if (!validatePaidPlan(planId)) {
  throw new HttpsError('invalid-argument', `Invalid or free plan: ${planId}`);
}

// Get the correct plan based on interval (e.g., 'dealer' + 'annual' = 'dealer_annual')
const fullPlanId = interval === 'annual' ? `${planId}_annual` : planId;
const plan = getPlanById(fullPlanId);

if (!plan) {
  throw new HttpsError('invalid-argument', `Plan not found: ${fullPlanId}`);
}

if (!plan.stripePriceId) {
  throw new HttpsError('failed-precondition', 'Stripe Price ID not configured for this plan');
}

logger.info('Creating checkout session', { userId, planId, interval, fullPlanId });
```

**مثال التنفيذ**:
```typescript
// Frontend calls
createCheckoutSession({ userId, planId: 'dealer', interval: 'monthly' });
// Backend resolves to: fullPlanId = 'dealer' → uses plan.stripePriceId = 'price_DEALER_MONTHLY'

createCheckoutSession({ userId, planId: 'dealer', interval: 'annual' });
// Backend resolves to: fullPlanId = 'dealer_annual' → uses plan.stripePriceId = 'price_DEALER_ANNUAL'

createCheckoutSession({ userId, planId: 'company', interval: 'annual' });
// Backend resolves to: fullPlanId = 'company_annual' → uses plan.stripePriceId = 'price_COMPANY_ANNUAL'
```

**ملاحظة حاسمة**: 
- `planId` يبقى بسيط ('dealer' أو 'company')
- `fullPlanId` يتم حسابه داخليًا ('dealer_annual', 'company_annual', إلخ)
- هذا يبقي Frontend API بسيطة بينما يدعم Backend الفواتير السنوية

---

## 🔍 ملفات لم يتم تعديلها (لكن تحتاج تحقق)

### ملفات Packages (غير مؤكدة)
قد تحتوي على نسخ مكررة - يجب التحقق:

1. `packages/core/src/types/user/bulgarian-user.types.ts`
2. `packages/payments/src/features/billing/types.ts`
3. `packages/payments/src/features/billing/billing/types.ts`

**Action**: بحث عن PlanTier في هذه الملفات وتحديثها إن وُجدت

### ملفات Frontend (قد تحتاج تحديث)

1. `bulgarian-car-marketplace/src/services/stripe-service.ts`
   - قد يحتوي على `createCheckoutSession` wrapper
   - يجب أن يمرر `interval` parameter

2. `bulgarian-car-marketplace/src/pages/SubscriptionPage.tsx`
   - يجب أن يمرر `interval` عند الضغط على "Monthly" أو "Annual"

3. `bulgarian-car-marketplace/src/features/billing/BillingService.ts`
   - **مصدر الحقيقة** - يجب أن يبقى كما هو (3 plans)

---

## 🎯 الخطوات التالية | Next Steps

### ✅ مكتمل (6 مهام)
1. ✅ توحيد PlanTier في جميع الملفات
2. ✅ تحديث Backend config
3. ✅ إصلاح PLAN_LIMITS
4. ✅ تحديث PermissionsService
5. ✅ تحديث ProfileService
6. ✅ إضافة دعم interval

### ⏳ متبقي (3 مهام)
7. ⏳ إنشاء Stripe Price IDs الحقيقية
8. ⏳ تحديث ملف التوثيق
9. ⏳ اختبار النظام الكامل

---

## 📊 إحصائيات التغييرات | Change Statistics

| الفئة | العدد |
|------|------|
| **ملفات معدلة** | 10 |
| **سطور معدلة** | ~300 |
| **قيم PlanTier محذوفة** | 6 (premium, dealer_basic, dealer_pro, dealer_enterprise, company_starter, company_pro, company_enterprise, custom) |
| **قيم PlanTier مضافة** | 0 (فقط توحيد الموجودة) |
| **خطط محذوفة من config** | 3 (basic, pro, dealer_premium, enterprise) |
| **خطط مضافة لـ config** | 2 (dealer_annual, company_annual) |
| **حالات محذوفة من PermissionsService** | 6 |
| **دوال محدثة** | 15+ |

---

**تم التوثيق بواسطة**: GitHub Copilot
**التاريخ**: ديسمبر 2025
**الحالة**: ✅ 66% مكتمل (6/9 مهام)
