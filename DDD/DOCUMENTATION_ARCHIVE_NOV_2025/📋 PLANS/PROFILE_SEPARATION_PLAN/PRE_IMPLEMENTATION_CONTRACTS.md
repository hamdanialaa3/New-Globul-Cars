# ✅ PRE_IMPLEMENTATION_CONTRACTS.md
## عقود ما قبل التنفيذ (Contracts) — جاهزة للمراجعة والاعتماد

الغرض: تثبيت العقود الحرجة قبل بدء التنفيذ لضمان اتساق المنطق بين الواجهة والخدمات وقواعد Firestore.

---

## 1) Capability Matrix — خريطة القدرات حسب النوع والخطة

```ts
// src/services/profile/capabilities.matrix.ts (reference-only contract)
export type ProfileType = 'private' | 'dealer' | 'company';
export type Capability =
  | 'createListing'
  | 'bulkImport'
  | 'manageTeam'
  | 'advancedAnalytics'
  | 'apiAccess'
  | 'financeOffers';

export interface CapabilityResult {
  flags: Record<Capability, boolean>;
  limits: { maxActiveListings: number };
}

// خطة → قدرات (قابلة للتعديل لاحقاً بسهولة)
const PRIVATE: Record<string, CapabilityResult> = {
  free:   { flags: { createListing: true,  bulkImport: false, manageTeam: false, advancedAnalytics: false, apiAccess: false, financeOffers: false }, limits: { maxActiveListings: 3 } },
  premium:{ flags: { createListing: true,  bulkImport: false, manageTeam: false, advancedAnalytics: true,  apiAccess: false, financeOffers: true  }, limits: { maxActiveListings: 10 } },
};

const DEALER: Record<string, CapabilityResult> = {
  dealer_basic:      { flags: { createListing: true, bulkImport: true,  manageTeam: true,  advancedAnalytics: true,  apiAccess: false, financeOffers: true  }, limits: { maxActiveListings: 50 } },
  dealer_pro:        { flags: { createListing: true, bulkImport: true,  manageTeam: true,  advancedAnalytics: true,  apiAccess: true,  financeOffers: true  }, limits: { maxActiveListings: 150 } },
  dealer_enterprise: { flags: { createListing: true, bulkImport: true,  manageTeam: true,  advancedAnalytics: true,  apiAccess: true,  financeOffers: true  }, limits: { maxActiveListings: 500 } },
};

const COMPANY: Record<string, CapabilityResult> = {
  company_starter:   { flags: { createListing: true, bulkImport: true,  manageTeam: true,  advancedAnalytics: true,  apiAccess: false, financeOffers: false }, limits: { maxActiveListings: 100 } },
  company_pro:       { flags: { createListing: true, bulkImport: true,  manageTeam: true,  advancedAnalytics: true,  apiAccess: true,  financeOffers: true  }, limits: { maxActiveListings: 300 } },
  company_enterprise:{ flags: { createListing: true, bulkImport: true,  manageTeam: true,  advancedAnalytics: true,  apiAccess: true,  financeOffers: true  }, limits: { maxActiveListings: 1000 } },
};

export function getCapabilities(profileType: ProfileType, planTier: string): CapabilityResult {
  const map = profileType === 'private' ? PRIVATE : profileType === 'dealer' ? DEALER : COMPANY;
  const cap = map[planTier];
  if (!cap) throw new Error(`Unknown plan tier: ${profileType}:${planTier}`);
  return cap;
}

export function can(user: { profileType: ProfileType; planTier: string }, cap: Capability): boolean {
  return getCapabilities(user.profileType, user.planTier).flags[cap] === true;
}
```

الهدف: مصدر واحد للقيود والقدرات (limits/flags) ليتسق استخدامها بين UI/Services/Rules.

---

## 2) validateSwitch() — حارس التحويل بين الأنواع

```ts
// src/services/profile/validators/switch.validator.ts (reference-only contract)
export type SwitchErrorCode =
  | 'MISSING_DEALERSHIP_REF'
  | 'ACTIVE_LISTINGS_EXCEEDED'
  | 'INVALID_PLAN_TIER'
  | 'BUSINESS_NOT_VERIFIED';

export type SwitchResult = { ok: true } | { ok: false; code: SwitchErrorCode; messageKey: string };

export interface BaseProfile {
  uid: string;
  profileType: ProfileType;
  planTier: string;
  verification?: { email?: boolean; phone?: boolean; id?: boolean; business?: boolean };
  stats?: { activeListings?: number };
}

export interface DealerProfile extends BaseProfile {
  profileType: 'dealer';
  dealershipRef?: `dealerships/${string}`;
  dealerSnapshot?: { nameBG: string; nameEN: string; logo?: string | null; status: 'pending'|'verified'|'rejected' };
}

export type BulgarianUser = BaseProfile | DealerProfile; // مبسط هنا لأغراض العقد

export function validateSwitch(current: BulgarianUser, targetType: ProfileType): SwitchResult {
  // 1) توافق الخطة مع النوع
  const { flags, limits } = getCapabilities(targetType, current.planTier);
  if (!flags.createListing) {
    return { ok: false, code: 'INVALID_PLAN_TIER', messageKey: 'profile.validation.invalidPlanTier' };
  }

  // 2) Dealer: لزوم المرجع واللقطة
  if (targetType === 'dealer') {
    const c = current as DealerProfile;
    if (!c.dealershipRef || !c.dealerSnapshot) {
      return { ok: false, code: 'MISSING_DEALERSHIP_REF', messageKey: 'profile.switch.errors.missingDealershipRef' };
    }
    if (c.verification?.business === false) {
      return { ok: false, code: 'BUSINESS_NOT_VERIFIED', messageKey: 'profile.switch.errors.businessNotVerified' };
    }
  }

  // 3) Dealer → Private: حد الإعلانات
  if (current.profileType === 'dealer' && targetType === 'private') {
    const active = current.stats?.activeListings ?? 0;
    if (active > 10) {
      return { ok: false, code: 'ACTIVE_LISTINGS_EXCEEDED', messageKey: 'profile.switch.errors.activeListingsExceeded' };
    }
  }

  return { ok: true };
}
```

ملحوظة: استعمل مفاتيح الترجمة المحددة مسبقاً في الخطة.

---

## 3) مفاتيح الترجمة المطلوبة (BG/EN)

- profile.switch.errors.businessNotVerified
  - bg: Неуспешна смяна: бизнесът все още не е потвърден.
  - en: Switch denied: business verification is not completed yet.

(بالإضافة إلى المفاتيح التي سبق إضافتها في الخطة)

---

## 4) حالات اختبار حرجة (Unit)

- validateSwitch():
  - dealer → private مع 11 إعلان نشط → ACTIVE_LISTINGS_EXCEEDED
  - private → dealer بدون dealershipRef/snapshot → MISSING_DEALERSHIP_REF
  - private → dealer مع businessVerification=false → BUSINESS_NOT_VERIFIED
  - private(premium) → dealer مع خطة لا تدعم createListing → INVALID_PLAN_TIER
  - happy path: private(premium) → dealer (كل الشروط مستوفاة) → ok

- getCapabilities():
  - private.free, private.premium, dealer_basic/pro/enterprise, company_* — يغطي جميع الفروع

---

## 5) اختبارات Emulator (Rules)

- منع الكتابة users/{uid} إلى dealer بدون (dealershipRef && dealerSnapshot)
- منع downgrade من dealer→private إذا activeListings > 10
- السماح بالتحديثات الآمنة + منع الحقول المهملة (dealerInfo/isDealer)

---

هذه العقود تغلق الحدود المنطقية قبل التنفيذ، وتضمن اتساق السلوك في الواجهة والخدمات والقواعد.
