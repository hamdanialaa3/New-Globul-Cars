# 🔄 Legacy Compatibility Layer
## طبقة التوافق مع الكود القديم

**الرقم:** 30 (الدعم التنفيذي)  
**المدة:** ضمن Phase 1-2 (لا وقت إضافي)  
**الأولوية:** 🟡 HIGH  
**الحالة:** ✅ Ready - NEW في v2.0

---

## 🎯 لماذا نحتاج Compatibility Layer؟

### الواقع المُكتشف
```typescript
// بعد تحليل الكود (Phase -1 Day 2):
❌ 25 موقع يستخدم isDealer
❌ 6 مواقع تستخدم dealerInfo
❌ لا يمكن كسر الكود الموجود مباشرة!

// الحل: Compatibility Layer
✅ الكود القديم يعمل
✅ الكود الجديد يعمل
✅ الانتقال التدريجي (8 أسابيع)
```

---

## 🧩 Architecture

### الملف الرئيسي
**إنشاء:** `src/services/compatibility/legacy-adapter.ts` (< 300 lines)

```typescript
/**
 * Legacy Compatibility Layer
 * Provides backward compatibility during migration
 * 
 * ⚠️ This file will be REMOVED after Week 7+
 * ⚠️ Do NOT use in new code - for migration only!
 */

import { doc, getDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../firebase/firebase-config';
import { dealershipService } from '../dealership/dealership.service';
import type { BulgarianUser, DealerProfile } from '../../types/user/bulgarian-user.types';

// ==================== GETTERS (Read) ====================

/**
 * Get isDealer value (backward compatible)
 * @deprecated Use profileType === 'dealer' instead
 * 
 * Usage:
 * ```typescript
 * // ❌ OLD (works but deprecated)
 * const isDealer = getLegacyIsDealer(user);
 * 
 * // ✅ NEW (migrate to this)
 * const isDealer = user.profileType === 'dealer';
 * ```
 */
export function getLegacyIsDealer(user: BulgarianUser): boolean {
  if (process.env.NODE_ENV === 'development') {
    const stack = new Error().stack;
    const caller = stack?.split('\n')[2]?.trim();
    console.warn(
      '⚠️ DEPRECATED: isDealer field',
      '\n  Use: user.profileType === "dealer"',
      '\n  Called from:', caller
    );
  }
  
  // Support both formats
  if ('profileType' in user) {
    return user.profileType === 'dealer';
  }
  
  // Fallback to legacy
  return (user as any).isDealer || false;
}

/**
 * Get dealerInfo (backward compatible)
 * @deprecated Use dealershipService.getDealershipInfo() instead
 */
export async function getLegacyDealerInfo(userId: string): Promise<any | null> {
  if (process.env.NODE_ENV === 'development') {
    console.warn(
      '⚠️ DEPRECATED: dealerInfo field',
      '\n  Use: dealershipService.getDealershipInfo(userId)'
    );
  }
  
  // Try new structure first
  const dealerDoc = await getDoc(doc(db, 'dealerships', userId));
  if (dealerDoc.exists()) {
    return dealerDoc.data();
  }
  
  // Fallback to old embedded
  const userDoc = await getDoc(doc(db, 'users', userId));
  if (userDoc.exists()) {
    return (userDoc.data() as any).dealerInfo || null;
  }
  
  return null;
}

// ==================== SETTERS (Write) ====================

/**
 * Update dealer info (backward compatible)
 * Writes to BOTH locations during migration
 * 
 * @deprecated Use dealershipService.saveDealershipInfo() instead
 */
export async function setLegacyDealerInfo(
  userId: string,
  dealerInfo: any
): Promise<void> {
  if (process.env.NODE_ENV === 'development') {
    console.warn(
      '⚠️ DEPRECATED: setLegacyDealerInfo()',
      '\n  Use: dealershipService.saveDealershipInfo()'
    );
  }
  
  // 1. Write to canonical location
  await dealershipService.saveDealershipInfo(userId, dealerInfo);
  
  // 2. Also update user snapshot (for backward compat)
  const userRef = doc(db, 'users', userId);
  await updateDoc(userRef, {
    dealershipRef: `dealerships/${userId}`,
    dealerSnapshot: {
      nameBG: dealerInfo.dealershipNameBG || '',
      nameEN: dealerInfo.dealershipNameEN || '',
      logo: dealerInfo.logo || null,
      status: dealerInfo.verified ? 'verified' : 'pending'
    },
    // Keep old field during migration (Phase 1-3)
    dealerInfo,
    updatedAt: serverTimestamp()
  });
}

// ==================== CONVERTERS ====================

/**
 * Convert legacy user to modern format
 */
export function convertLegacyToModern(legacyUser: any): BulgarianUser {
  let profileType: 'private' | 'dealer' | 'company' = 'private';
  
  if (legacyUser.isDealer || legacyUser.dealerInfo) profileType = 'dealer';
  else if (legacyUser.isCompany || legacyUser.companyInfo) profileType = 'company';
  else if (legacyUser.profileType) profileType = legacyUser.profileType;
  
  const modernUser: any = { ...legacyUser, profileType };
  
  // Create snapshot from embedded data
  if (profileType === 'dealer' && legacyUser.dealerInfo) {
    modernUser.dealerSnapshot = {
      nameBG: legacyUser.dealerInfo.dealershipNameBG || '',
      nameEN: legacyUser.dealerInfo.dealershipNameEN || '',
      logo: legacyUser.dealerInfo.logo || null,
      status: legacyUser.dealerInfo.verified ? 'verified' : 'pending'
    };
    modernUser.dealershipRef = `dealerships/${legacyUser.uid}`;
  }
  
  return modernUser as BulgarianUser;
}

/**
 * Convert modern user to legacy (for old components)
 */
export function convertModernToLegacy(modernUser: BulgarianUser): any {
  const legacy: any = { ...modernUser };
  
  if (modernUser.profileType === 'dealer') {
    legacy.isDealer = true;
    
    if ('dealerSnapshot' in modernUser && modernUser.dealerSnapshot) {
      legacy.dealerInfo = {
        dealershipNameBG: modernUser.dealerSnapshot.nameBG,
        dealershipNameEN: modernUser.dealerSnapshot.nameEN,
        logo: modernUser.dealerSnapshot.logo,
        verified: modernUser.dealerSnapshot.status === 'verified'
      };
    }
  }
  
  return legacy;
}
```

---

## 📈 Migration Timeline

### Week 1-2: Enable Layer
```
✅ Create legacy-adapter.ts
✅ Add to 31 usage points
✅ Enable warnings (development only)
✅ Test compatibility
```

### Week 3-6: Gradual Update
```
📅 Update 5 files per day
   Day 1-5:   25 → 20 usages
   Day 6-10:  20 → 15 usages
   Day 11-15: 15 → 5 usages
   Day 16-20: 5 → 0 usages ✅
```

### Week 7+: Remove Layer
```
✅ Verify zero usage (grep scan)
✅ Remove compatibility layer
✅ Remove deprecated fields from types
✅ Update documentation
```

---

## 🧪 Testing

```typescript
// tests/legacy-adapter.test.ts
describe('Legacy Adapter', () => {
  it('getLegacyIsDealer returns true for dealer', () => {
    expect(getLegacyIsDealer({ profileType: 'dealer' } as any)).toBe(true);
  });
  
  it('shows warning in development', () => {
    const warn = jest.spyOn(console, 'warn');
    getLegacyIsDealer({ profileType: 'dealer' } as any);
    expect(warn).toHaveBeenCalled();
  });
  
  it('convertLegacyToModern creates snapshot', () => {
    const legacy = {
      isDealer: true,
      dealerInfo: { dealershipNameBG: 'Тест' }
    };
    const modern = convertLegacyToModern(legacy);
    expect(modern.dealerSnapshot?.nameBG).toBe('Тест');
  });
});
```

---

## 📊 Progress Tracking

**Create:** `scripts/track-legacy-usage.ts`

```bash
# Run weekly
npx ts-node scripts/track-legacy-usage.ts

# Output:
# Week 1: isDealer: 25, dealerInfo: 6
# Week 3: isDealer: 20, dealerInfo: 5
# Week 5: isDealer: 5, dealerInfo: 2
# Week 7: isDealer: 0, dealerInfo: 0 ✅
```

---

## 🎯 Success Criteria

```
✅ All old code works during migration
✅ All new code works immediately
✅ Zero breaking changes
✅ Smooth 8-week transition
✅ Complete removal by Week 7
```

---

**Status:** ✅ Ready - Enables safe migration  
**Timeline:** Weeks 1-7

