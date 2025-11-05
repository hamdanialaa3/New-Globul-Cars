# 🔍 Phase -1: Code Audit & Cleanup
## تدقيق الكود وتنظيفه قبل البدء

**المدة:** 3 أيام عمل  
**الأولوية:** 🔴 CRITICAL (يجب تنفيذها قبل Phase 0)  
**التاريخ:** نوفمبر 2025

---

## 🎯 لماذا Phase -1؟

### المشكلة المكتشفة:
بعد **تحليل عميق للكود الحالي**، اكتشفنا:

```typescript
❌ 3 تعريفات مختلفة لـ BulgarianUser
❌ 25+ موقع يستخدم isDealer القديم
❌ خدمتين مكررتين (dealership + bulgarian-profile)
❌ ProfilePage = 2227 سطر (يخرق الدستور)
❌ dealerInfo في 6 أماكن مختلفة
```

**النتيجة:** لا يمكن البدء بالخطة الأصلية والكود في هذه الحالة!

---

## 📊 Reality Gap Analysis (تحليل الفجوة)

| الموضوع | الخطة تقول | الواقع الفعلي | الفجوة |
|---------|------------|---------------|---------|
| **BulgarianUser Types** | 1 interface موحد | 3 interfaces مختلفة | 🔴 CRITICAL |
| **switchProfileType()** | مع validators | بدون validation | 🔴 CRITICAL |
| **ProfilePage Size** | < 300 سطر | 2227 سطر | 🔴 CRITICAL |
| **dealerships/{uid}** | موجود | غير موجود | 🟡 MAJOR |
| **Deprecated fields** | محذوفة | 25+ usage | 🟡 MAJOR |
| **Service duplication** | خدمة واحدة | خدمتين | 🟡 MAJOR |

---

## 📋 Day 1: Type Definitions Unification

### 1.1 تحديد المواقع الحالية

**الملفات التي تحتوي على تعريفات:**

```
📍 src/types/firestore-models.ts
   ├── BulgarianUser (22 fields)
   └── DealerInfo interface

📍 src/firebase/social-auth-service.ts
   ├── BulgarianUserProfile (54 fields)
   └── dealerInfo embedded

📍 src/firebase/auth-service.ts
   └── BulgarianUser (مختلف تماماً!)
```

### 1.2 إنشاء التعريف الموحد

**إنشاء:** `src/types/user/bulgarian-user.types.ts`

```typescript
/**
 * CANONICAL User Type Definition
 * المصدر القياسي الوحيد لتعريف المستخدم
 * 
 * ⚠️ DO NOT create other user types!
 * ⚠️ All imports must use this file only!
 */

import { Timestamp } from 'firebase/firestore';

// ==================== BASE PROFILE ====================
export interface BaseProfile {
  // Identity
  uid: string;
  email: string;
  displayName: string;
  firstName?: string;
  lastName?: string;
  photoURL?: string;
  coverImage?: string;
  
  // Contact
  phoneNumber?: string;
  phoneCountryCode: '+359';  // Bulgaria
  
  // Location (Bulgarian only)
  location?: {
    city: string;
    region: string;
    country: 'Bulgaria';
  };
  
  // Preferences
  preferredLanguage: 'bg' | 'en';
  currency: 'EUR';
  
  // Profile Type & Plan
  profileType: 'private' | 'dealer' | 'company';
  planTier: PlanTier;
  
  // Permissions (computed from profileType + planTier)
  permissions: ProfilePermissions;
  
  // Verification
  verification: {
    email: boolean;
    phone: boolean;
    id: boolean;
    business: boolean;
  };
  
  // Stats
  stats: {
    totalListings: number;
    activeListings: number;
    totalViews: number;
    totalMessages: number;
    trustScore: number;
  };
  
  // Timestamps
  createdAt: Timestamp;
  updatedAt: Timestamp;
  lastLoginAt?: Timestamp;
  
  // Flags
  isActive: boolean;
  isBanned: boolean;
}

// ==================== DEALER PROFILE ====================
export interface DealerProfile extends BaseProfile {
  profileType: 'dealer';
  planTier: 'dealer_basic' | 'dealer_pro' | 'dealer_enterprise';
  
  // Canonical reference (NEW!)
  dealershipRef: `dealerships/${string}`;
  
  // Snapshot for quick display (NEW!)
  dealerSnapshot: {
    nameBG: string;
    nameEN: string;
    logo?: string;
    status: 'pending' | 'verified' | 'rejected';
  };
  
  // DEPRECATED (for migration period only)
  /** @deprecated Use dealershipRef instead */
  dealerInfo?: any;
  /** @deprecated Use profileType === 'dealer' instead */
  isDealer?: boolean;
}

// ==================== PRIVATE & COMPANY ====================
export interface PrivateProfile extends BaseProfile {
  profileType: 'private';
  planTier: 'free' | 'premium';
}

export interface CompanyProfile extends BaseProfile {
  profileType: 'company';
  planTier: 'company_starter' | 'company_pro' | 'company_enterprise';
  companyRef: `companies/${string}`;
  companySnapshot: {
    nameBG: string;
    nameEN: string;
    logo?: string;
    status: 'pending' | 'verified' | 'rejected';
  };
}

// ==================== UNION TYPE ====================
export type BulgarianUser = PrivateProfile | DealerProfile | CompanyProfile;

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

export interface ProfilePermissions {
  canAddListings: boolean;
  maxListings: number;
  hasAnalytics: boolean;
  hasTeam: boolean;
  canExportData: boolean;
  canUseAPI: boolean;
}
```

### 1.3 Migration Map

إنشاء: `MIGRATION_MAP_TYPES.md`

```markdown
# Type Migration Map

## Files to Update (32 files)

### High Priority (Day 1)
- [ ] src/contexts/ProfileTypeContext.tsx
- [ ] src/pages/ProfilePage/index.tsx
- [ ] src/services/bulgarian-profile-service.ts
- [ ] src/services/dealership/dealership.service.ts
- [ ] src/firebase/social-auth-service.ts

### Medium Priority (Day 1-2)
- [ ] src/components/Profile/* (67 files)
- [ ] src/services/profile/* (23 files)

### Low Priority (Day 2-3)
- [ ] Tests and utilities

## Import Changes
```typescript
// ❌ OLD (DELETE THESE)
import { BulgarianUser } from '../firebase/social-auth-service';
import { BulgarianUserProfile } from '../firebase/auth-service';

// ✅ NEW (USE THIS ONLY)
import type { BulgarianUser, DealerProfile } from '../types/user/bulgarian-user.types';
```
```

**Exit Criteria for Day 1:**
- ✅ One canonical types file created
- ✅ All imports updated (32 files)
- ✅ Build passes with zero errors
- ✅ Tests updated and passing

---

## 📋 Day 2: Identify & Map Legacy Usage

### 2.1 Scan Codebase for Legacy Fields

**Tool:** `grep` or `codebase_search`

```bash
# Find all isDealer usage
grep -r "isDealer" src/ --include="*.ts" --include="*.tsx"
# Result: 25 matches in 10 files

# Find all dealerInfo usage
grep -r "dealerInfo" src/ --include="*.ts" --include="*.tsx"
# Result: 6 matches in 4 files
```

### 2.2 Create Legacy Usage Map

**إنشاء:** `LEGACY_USAGE_MAP.md`

```markdown
# Legacy Fields Usage Map

## isDealer Usage (25 occurrences)

### Category 1: Type Checks (15 occurrences)
```typescript
// ❌ OLD
if (user.isDealer) { ... }

// ✅ NEW
if (user.profileType === 'dealer') { ... }
```

**Files:**
1. src/contexts/ProfileTypeContext.tsx (3 times)
2. src/services/bulgarian-profile-service.ts (2 times)
3. src/pages/ProfilePage/index.tsx (5 times)
4. src/components/Header/Header.tsx (3 times)
5. src/services/admin-service.ts (2 times)

### Category 2: Conditional Rendering (10 occurrences)
```typescript
// ❌ OLD
{isDealer && <DealerFeatures />}

// ✅ NEW
{profileType === 'dealer' && <DealerFeatures />}
```

**Files:**
6. src/pages/ProfilePage/ProfileOverview.tsx (4 times)
7. src/components/Profile/ProfileDashboard.tsx (3 times)
8. src/pages/UsersDirectoryPage/index.tsx (3 times)

## dealerInfo Usage (6 occurrences)

### Direct Access (4 occurrences)
```typescript
// ❌ OLD
const name = user.dealerInfo?.companyName;

// ✅ NEW
const dealershipDoc = await getDoc(doc(db, 'dealerships', user.uid));
const name = dealershipDoc.data()?.dealershipNameBG;

// OR (if snapshot exists)
const name = user.dealerSnapshot?.nameBG;
```

**Files:**
1. src/services/bulgarian-profile-service.ts (2 times)
2. src/firebase/social-auth-service.ts (1 time)
3. src/types/firestore-models.ts (1 time)

### Mutation (2 occurrences)
```typescript
// ❌ OLD
await updateDoc(userRef, { dealerInfo: newData });

// ✅ NEW
await updateDoc(doc(db, 'dealerships', uid), newData);
await updateDoc(userRef, { 
  dealerSnapshot: { 
    nameBG: newData.dealershipNameBG,
    nameEN: newData.dealershipNameEN,
    logo: newData.logo,
    status: 'pending'
  }
});
```

**Files:**
4. src/services/bulgarian-profile-service.ts (1 time)
5. src/locales/translations.ts (1 time - keys)
```

### 2.3 Create Deprecation Timeline

**إنشاء:** `DEPRECATION_TIMELINE.md`

```markdown
# Deprecation Timeline

## Week 1-2: Add Warnings
- Add console.warn() for all legacy usage
- Add ESLint rule to flag legacy fields
- Update documentation

## Week 3-4: Update Code
- 5 files per day
- Test after each update
- Monitor for issues

## Week 5-6: Verify Zero Usage
- Run full codebase scan
- Confirm zero hits
- Remove deprecated fields from types

## Week 7+: Cleanup
- Remove deprecated type definitions
- Remove ESLint overrides
- Update documentation
```

**Exit Criteria for Day 2:**
- ✅ Complete usage map created (25 isDealer + 6 dealerInfo)
- ✅ Deprecation timeline planned
- ✅ Update strategy documented
- ✅ Risk assessment completed

---

## 📋 Day 3: Service Consolidation Planning

### 3.1 Service Duplication Analysis

**Current State:**

```
src/services/
├── bulgarian-profile-service.ts (558 lines)
│   ├── createCompleteProfile(dealerData)
│   ├── setupDealerProfile()
│   └── updateDealerInfo()
│
└── dealership/
    └── dealership.service.ts (474 lines)
        ├── saveDealershipInfo()
        ├── getDealershipInfo()
        └── uploadDocument()

PROBLEM: Both do the same thing! 🔴
```

### 3.2 Consolidation Decision

**Decision:** Keep `dealership.service.ts` as canonical source

**Reasons:**
1. ✅ Already writes to `dealerships/{uid}` collection
2. ✅ Better structured (separate file)
3. ✅ More complete (documents, media, etc.)
4. ✅ Aligns with new architecture

**Action Plan:**

```typescript
// Step 1: Mark bulgarian-profile-service methods as deprecated
export class BulgarianProfileService {
  /**
   * @deprecated Use dealershipService.saveDealershipInfo() instead
   * Will be removed in Phase 2A
   */
  static async setupDealerProfile(userId: string, data: any) {
    console.warn('⚠️ setupDealerProfile is deprecated. Use dealershipService instead.');
    return dealershipService.saveDealershipInfo(userId, data);
  }
}

// Step 2: Update all imports (Phase -1, Day 3)
// ❌ OLD
import { BulgarianProfileService } from '../services/bulgarian-profile-service';
await BulgarianProfileService.setupDealerProfile(uid, data);

// ✅ NEW
import { dealershipService } from '../services/dealership/dealership.service';
await dealershipService.saveDealershipInfo(uid, data);

// Step 3: Remove deprecated methods (Phase 2A)
```

### 3.3 Import Migration Map

**Files to Update (23 files):**

```markdown
## High Priority (Day 3)
- [ ] src/pages/ProfilePage/index.tsx
- [ ] src/components/Profile/Dealership/DealershipInfoForm.tsx
- [ ] src/services/bulgarian-profile-service.ts (add deprecations)

## Medium Priority (Phase 2A)
- [ ] All Profile components (15 files)
- [ ] All services (8 files)

## Testing
- [ ] Unit tests for dealership service
- [ ] Integration tests for profile updates
- [ ] E2E tests for dealer signup flow
```

**Exit Criteria for Day 3:**
- ✅ Consolidation decision documented
- ✅ Deprecation markers added
- ✅ Import migration plan ready
- ✅ Testing strategy defined

---

## 📊 Phase -1 Summary

### Deliverables

```
✅ Day 1: Type Definitions Unified
   ├── src/types/user/bulgarian-user.types.ts (CANONICAL)
   ├── 32 files updated
   └── All tests passing

✅ Day 2: Legacy Usage Mapped
   ├── LEGACY_USAGE_MAP.md (25 isDealer + 6 dealerInfo)
   ├── DEPRECATION_TIMELINE.md
   └── Update strategy documented

✅ Day 3: Service Consolidation Planned
   ├── Deprecation markers added
   ├── Import migration map (23 files)
   └── Testing strategy ready
```

### Success Metrics

| Metric | Before | After | Goal |
|--------|--------|-------|------|
| Type definitions | 3 files | 1 file | ✅ Unified |
| Build errors | ? | 0 | ✅ Clean |
| Legacy usage mapped | Unknown | 31 documented | ✅ Tracked |
| Service duplication | 2 services | 1 canonical | ✅ Clear |

---

## 🚀 Next Steps

**After Phase -1 completion:**

```
Phase -1 ✅ → Phase 0: Pre-Migration Safeguards
              ├── 0.0: Data Snapshot (NEW!)
              ├── 0.1: Split ProfilePage
              ├── 0.2: Consolidate Services (execute plan)
              └── 0.3: Add Validators
```

---

## 🔗 Related Documents

- **Phase 0:** PRE_MIGRATION_SAFEGUARDS.md (updated)
- **Phase 1:** Core Types (will use unified types)
- **Phase 2A:** Service Consolidation (will execute Day 3 plan)
- **Migration Map:** LEGACY_USAGE_MAP.md
- **Timeline:** UPDATED_TIMELINE.md

---

**آخر تحديث:** نوفمبر 2025  
**الحالة:** ✅ Ready for Implementation  
**الأولوية:** 🔴 MUST DO FIRST

