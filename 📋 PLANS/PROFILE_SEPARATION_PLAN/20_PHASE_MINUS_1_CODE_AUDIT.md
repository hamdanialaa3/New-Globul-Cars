# 🔍 Phase -1: Code Audit & Cleanup
## تدقيق الكود وتنظيفه قبل البدء

**الرقم:** 20 (المراحل التنفيذية)  
**المدة:** 3 أيام عمل  
**الأولوية:** 🔴 CRITICAL (يجب تنفيذها قبل Phase 0)  
**الحالة:** ✅ Ready for Execution

---

## 🎯 لماذا Phase -1؟

### الواقع المُكتشف
بعد تحليل عميق للكود الحالي (راجع `03_CURRENT_SYSTEM_REALITY.md`):

```typescript
❌ 3 تعريفات مختلفة لـ BulgarianUser
❌ 25 موقع يستخدم isDealer القديم
❌ 6 مواقع تستخدم dealerInfo القديم
❌ خدمتين مكررتين (dealership + bulgarian-profile)
❌ ProfilePage = 2227 سطر
❌ switchProfileType() بدون validation
```

**النتيجة:** لا يمكن البدء بالخطة الأصلية والكود في هذه الحالة!

---

## 📋 Day 1: Type Definitions Unification

### 1.1 المشكلة

```
المواقع الحالية (3 تعريفات):
├── src/types/firestore-models.ts
│   └── BulgarianUser (22 fields, isDealer, dealerInfo)
├── src/firebase/social-auth-service.ts
│   └── BulgarianUserProfile (54 fields)
└── src/firebase/auth-service.ts
    └── BulgarianUser (different!)
```

### 1.2 الحل: ملف واحد موحّد

**إنشاء:** `src/types/user/bulgarian-user.types.ts`

```typescript
/**
 * CANONICAL Bulgarian User Types
 * المصدر القياسي الوحيد لتعريف المستخدم
 * 
 * ⚠️ DO NOT create other BulgarianUser interfaces!
 * ⚠️ All imports MUST use this file only!
 * 
 * File: src/types/user/bulgarian-user.types.ts
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
  phoneCountryCode: '+359';
  
  // Location (Bulgarian cities only)
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
  
  // Permissions
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
  
  // ✅ NEW: Canonical reference
  dealershipRef: `dealerships/${string}`;
  
  // ✅ NEW: Snapshot for quick display
  dealerSnapshot: {
    nameBG: string;
    nameEN: string;
    logo?: string;
    status: 'pending' | 'verified' | 'rejected';
  };
  
  // ❌ DEPRECATED (migration period only)
  /**
   * @deprecated Use dealershipRef instead
   * Will be removed after Phase 4
   */
  dealerInfo?: any;
  
  /**
   * @deprecated Use profileType === 'dealer' instead
   * Will be removed after Phase 4
   */
  isDealer?: boolean;
}

// ==================== PRIVATE PROFILE ====================
export interface PrivateProfile extends BaseProfile {
  profileType: 'private';
  planTier: 'free' | 'premium';
  
  // Private-specific (if any)
  egn?: string;  // Bulgarian personal ID
}

// ==================== COMPANY PROFILE ====================
export interface CompanyProfile extends BaseProfile {
  profileType: 'company';
  planTier: 'company_starter' | 'company_pro' | 'company_enterprise';
  
  // ✅ NEW: Company reference
  companyRef: `companies/${string}`;
  companySnapshot: {
    nameBG: string;
    nameEN: string;
    logo?: string;
    status: 'pending' | 'verified' | 'rejected';
  };
}

// ==================== UNION TYPE ====================
export type BulgarianUser = 
  | PrivateProfile 
  | DealerProfile 
  | CompanyProfile;

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

### 1.3 تحديث جميع الـ Imports (32 file)

```typescript
// ❌ OLD (حذف هذه)
import { BulgarianUser } from '../firebase/social-auth-service';
import { BulgarianUserProfile } from '../firebase/auth-service';
import type { BulgarianUser } from '../types/firestore-models';

// ✅ NEW (استخدم هذا فقط)
import type { 
  BulgarianUser, 
  DealerProfile, 
  PrivateProfile,
  CompanyProfile 
} from '../types/user/bulgarian-user.types';
```

**الملفات للتحديث:**
```
High Priority (8 files):
- src/contexts/ProfileTypeContext.tsx
- src/pages/ProfilePage/index.tsx
- src/services/bulgarian-profile-service.ts
- src/services/dealership/dealership.service.ts
- src/firebase/social-auth-service.ts
- src/firebase/auth-service.ts
- src/types/firestore-models.ts
- src/components/Profile/ProfileDashboard.tsx

Medium Priority (24 files):
- All Profile components
- All services
- All hooks
```

**Exit Criteria Day 1:**
- ✅ CANONICAL file created
- ✅ All 32 imports updated
- ✅ Build passes
- ✅ Tests pass

---

## 📋 Day 2: Legacy Usage Mapping

### 2.1 Scan Codebase

```bash
# isDealer usage
grep -r "isDealer" src/ --include="*.ts" --include="*.tsx"
# Result: 25 matches in 10 files

# dealerInfo usage
grep -r "dealerInfo" src/ --include="*.ts" --include="*.tsx"
# Result: 6 matches in 4 files
```

### 2.2 Create LEGACY_USAGE_MAP.md

```markdown
# Legacy Fields Usage Map

## isDealer (25 occurrences in 10 files)

### Type Checks (15 occurrences)
src/contexts/ProfileTypeContext.tsx: 3
src/services/bulgarian-profile-service.ts: 2
src/pages/ProfilePage/index.tsx: 5
src/components/Header/Header.tsx: 3
src/services/admin-service.ts: 2

### Conditional Rendering (10 occurrences)
src/pages/ProfilePage/ProfileOverview.tsx: 4
src/components/Profile/ProfileDashboard.tsx: 3
src/pages/UsersDirectoryPage/index.tsx: 3

## dealerInfo (6 occurrences in 4 files)

### Direct Access (4 occurrences)
src/services/bulgarian-profile-service.ts: 2
src/firebase/social-auth-service.ts: 1
src/types/firestore-models.ts: 1

### Mutation (2 occurrences)
src/services/bulgarian-profile-service.ts: 1
src/locales/translations.ts: 1
```

### 2.3 Deprecation Timeline

```markdown
Week 1-2: Add warnings & compatibility layer
Week 3-4: Update 5 files/day
Week 5-6: Verify zero usage
Week 7+:  Remove deprecated fields
```

**Exit Criteria Day 2:**
- ✅ Complete usage map (31 locations)
- ✅ Deprecation timeline
- ✅ Update strategy

---

## 📋 Day 3: Service Consolidation Planning

### 3.1 Decision

**Keep:** `dealership.service.ts` (canonical)  
**Deprecate:** methods in `bulgarian-profile-service.ts`

### 3.2 Implementation

```typescript
// bulgarian-profile-service.ts (add deprecations)
export class BulgarianProfileService {
  /**
   * @deprecated Use dealershipService.saveDealershipInfo() instead
   * Will be removed in Phase 2A
   */
  static async setupDealerProfile(userId: string, data: any) {
    console.warn('⚠️ setupDealerProfile is deprecated. Use dealershipService instead.');
    // Forward to canonical service
    return dealershipService.saveDealershipInfo(userId, data);
  }
  
  // Similar for other dealer methods...
}
```

### 3.3 Update Imports (23 files)

```typescript
// ❌ OLD
import { BulgarianProfileService } from '../services/bulgarian-profile-service';
await BulgarianProfileService.setupDealerProfile(uid, data);

// ✅ NEW
import { dealershipService } from '../services/dealership/dealership.service';
await dealershipService.saveDealershipInfo(uid, data);
```

**Exit Criteria Day 3:**
- ✅ Deprecation markers added
- ✅ Import migration plan (23 files)
- ✅ Testing strategy

---

## 📊 Phase -1 Summary

### Deliverables
```
✅ Day 1: CANONICAL types file
   - src/types/user/bulgarian-user.types.ts
   - 32 imports updated
   
✅ Day 2: Legacy usage mapped
   - LEGACY_USAGE_MAP.md
   - 31 locations documented
   
✅ Day 3: Service consolidation
   - Deprecation markers
   - 23-file update plan
```

### Success Metrics

| Metric | Before | After |
|--------|--------|-------|
| Type definitions | 3 files | 1 file ✅ |
| Legacy usage | Unknown | 31 mapped ✅ |
| Service clarity | 2 duplicates | 1 canonical ✅ |
| Build status | ? | Green ✅ |

---

## 🚀 Next Phase

```
Phase -1 ✅ → 21_PHASE_0_PRE_MIGRATION.md
              ↓
              0.0: Data Snapshot
              0.1: Split ProfilePage
              0.2: Execute consolidation
              0.3: Add validators
```

---

**الأولوية:** 🔴 MUST DO FIRST  
**التبعية:** لا شيء (مستقل)  
**المخرجات:** أساس نظيف للمراحل التالية

