# 🔄 SERVICE CONSOLIDATION PLAN
## Merging duplicate services & establishing canonical sources

**Created:** November 2025  
**Phase:** -1 Day 3 (Service Consolidation)  
**Purpose:** Eliminate service duplication and clarify responsibilities

---

## 📊 Current State Analysis

### Service Duplication Identified

| Service | Location | Lines | Purpose | Status |
|---------|----------|-------|---------|--------|
| **BulgarianProfileService** | `services/bulgarian-profile-service.ts` | 558 | General profile operations | ⚠️ Has dealer methods |
| **DealershipService** | `services/dealership/dealership.service.ts` | 474 | Dealership-specific operations | ✅ Canonical for dealers |

### Problem: Overlapping Responsibilities

```
BulgarianProfileService:
├── setupDealerProfile()      ⚠️ DUPLICATE - dealer setup
├── updateUserProfile()        ✅ KEEP - general profiles
├── uploadProfilePicture()     ✅ KEEP - general profiles
└── trackUserActivity()        ✅ KEEP - general analytics

DealershipService:
├── saveDealershipInfo()       ✅ CANONICAL - dealer setup
├── getDealershipInfo()        ✅ CANONICAL - dealer retrieval
├── uploadDocument()           ✅ CANONICAL - dealer docs
└── updateVerificationStatus() ✅ CANONICAL - dealer verification
```

**Verdict:** BulgarianProfileService has **1 duplicate dealer method**

---

## 🎯 Consolidation Strategy

### Decision Matrix

| Method | Current Location | Target Location | Action | Timeline |
|--------|------------------|-----------------|--------|----------|
| `setupDealerProfile()` | BulgarianProfileService | ❌ DELETE | Deprecate & redirect | Phase 2A |
| `updateUserProfile()` | BulgarianProfileService | ✅ KEEP | General use | N/A |
| `uploadProfilePicture()` | BulgarianProfileService | ✅ KEEP | General use | N/A |
| `saveDealershipInfo()` | DealershipService | ✅ KEEP | Canonical | N/A |
| `getDealershipInfo()` | DealershipService | ✅ KEEP | Canonical | N/A |

---

## 📋 Phase -1 Day 3: Implementation Plan

### ✅ Step 1: Add Deprecation Warnings (DONE)

**File:** `bulgarian-profile-service.ts`

```typescript
/**
 * @deprecated Use dealershipService.saveDealershipInfo() instead
 * This method will be removed in Phase 2A (Week 4)
 */
static async setupDealerProfile(userId: string, dealerData: DealerProfile): Promise<void> {
  console.warn(`⚠️ [DEPRECATED] setupDealerProfile() called for user ${userId}. Use dealershipService instead.`);
  
  // ... existing implementation ...
}
```

**Status:** ✅ COMPLETE

---

### ⏳ Step 2: Update Import Statements (Phase 0-1)

**Files to update (23 total):**

#### High Priority (3 files - Week 1-2)
```typescript
// 1. ProfilePage/index.tsx
// OLD:
import { BulgarianProfileService } from '../../services/bulgarian-profile-service';
await BulgarianProfileService.setupDealerProfile(uid, data);

// NEW:
import { dealershipService } from '../../services/dealership/dealership.service';
await dealershipService.saveDealershipInfo(uid, data);
```

```typescript
// 2. Profile/DealershipInfoForm.tsx
// OLD:
await BulgarianProfileService.setupDealerProfile(userId, dealershipData);

// NEW:
await dealershipService.saveDealershipInfo(userId, dealershipData);
```

```typescript
// 3. Settings/AccountTypeSettings.tsx
// OLD:
await BulgarianProfileService.setupDealerProfile(currentUser.uid, formData);

// NEW:
await dealershipService.saveDealershipInfo(currentUser.uid, formData);
```

#### Medium Priority (10 files - Week 3-4)
- Profile components
- Settings components  
- Admin tools

#### Low Priority (10 files - Week 5-6)
- Test files
- Documentation
- Mock data

---

### ⏳ Step 3: Dual-Write Period (Phase 1-2)

**During Weeks 1-4:**

```typescript
// DealershipService.saveDealershipInfo() implementation:
async saveDealershipInfo(userId: string, data: DealershipInfo): Promise<void> {
  // 1. Save to canonical collection
  await setDoc(doc(db, 'dealerships', userId), data);
  
  // 2. DUAL-WRITE: Update user document (for backward compatibility)
  await updateDoc(doc(db, 'users', userId), {
    // NEW fields (Phase 1+)
    profileType: 'dealer',
    dealershipRef: `dealerships/${userId}`,
    dealerSnapshot: {
      nameBG: data.nameBG,
      nameEN: data.nameEN,
      logo: data.logo,
      status: data.verificationStatus
    },
    
    // OLD fields (for backward compatibility - Phase 1-3 only)
    isDealer: true,
    dealerInfo: data  // Full copy for legacy code
  });
}
```

**Status:** 📋 Planned for Phase 1

---

### ⏳ Step 4: Remove Dual-Write (Phase 4)

**After Week 7:**

```typescript
// Remove old fields from dual-write
await updateDoc(doc(db, 'users', userId), {
  profileType: 'dealer',
  dealershipRef: `dealerships/${userId}`,
  dealerSnapshot: { ... }
  // ❌ isDealer: REMOVED
  // ❌ dealerInfo: REMOVED
});
```

---

### ⏳ Step 5: Delete Deprecated Method (Phase 4)

**After Week 8:**

```typescript
// bulgarian-profile-service.ts
// ❌ DELETE THIS METHOD:
// static async setupDealerProfile() { ... }
```

---

## 📊 Migration Tracking

### Files Requiring Updates

| File | Priority | Current Status | Target Week |
|------|----------|----------------|-------------|
| ProfilePage/index.tsx | 🔴 P0 | ❌ Not started | Week 1 |
| Profile/DealershipInfoForm.tsx | 🔴 P0 | ❌ Not started | Week 1 |
| Settings/AccountTypeSettings.tsx | 🔴 P0 | ❌ Not started | Week 2 |
| Profile/DealerProfile.tsx | 🟠 P1 | ❌ Not started | Week 3 |
| Admin/DealerManagement.tsx | 🟠 P1 | ❌ Not started | Week 3 |
| Admin/VerificationQueue.tsx | 🟠 P1 | ❌ Not started | Week 4 |
| ... | ... | ... | ... |

**Tracking URL:** See `LEGACY_USAGE_MAP.md` for complete list

---

## 🧪 Testing Strategy

### Unit Tests

```typescript
describe('DealershipService', () => {
  it('should create dealership and update user profile', async () => {
    const userId = 'test-user-123';
    const data = { nameBG: 'Тест Авто', ... };
    
    await dealershipService.saveDealershipInfo(userId, data);
    
    // Verify dealership document
    const dealership = await getDoc(doc(db, 'dealerships', userId));
    expect(dealership.exists()).toBe(true);
    
    // Verify user document updated
    const user = await getDoc(doc(db, 'users', userId));
    expect(user.data().profileType).toBe('dealer');
    expect(user.data().dealershipRef).toBe(`dealerships/${userId}`);
  });
});
```

### Integration Tests

```typescript
describe('Profile Type Switch', () => {
  it('should convert private to dealer correctly', async () => {
    // 1. Create private user
    const user = await createUser({ profileType: 'private' });
    
    // 2. Switch to dealer
    await dealershipService.saveDealershipInfo(user.uid, dealerData);
    
    // 3. Verify conversion
    const updated = await getUser(user.uid);
    expect(updated.profileType).toBe('dealer');
    expect(updated.dealershipRef).toBeDefined();
  });
});
```

---

## ⚠️ Risk Mitigation

### Risk 1: Breaking Changes During Migration
**Mitigation:** Dual-write strategy (Weeks 1-7)

### Risk 2: Data Inconsistency
**Mitigation:** Transaction-based writes

```typescript
await runTransaction(db, async (transaction) => {
  // Write dealership
  transaction.set(dealershipRef, data);
  
  // Update user
  transaction.update(userRef, { 
    profileType: 'dealer',
    dealershipRef: `dealerships/${userId}`
  });
});
```

### Risk 3: Performance Degradation
**Mitigation:** Monitor P95 latency, set alert < 900ms

---

## 📈 Success Metrics

| Metric | Target | Current | Status |
|--------|--------|---------|--------|
| Import updates | 23/23 | 0/23 | ❌ Not started |
| Deprecation warnings deployed | 100% | 100% | ✅ Done |
| Test coverage | > 80% | TBD | ⏳ Pending |
| Legacy method usage | 0 calls/day | TBD | ⏳ Pending |

---

## 🗓️ Timeline Summary

```
Week -1: Phase -1 Day 3 (NOW)
├── ✅ Add deprecation warnings
├── ✅ Document consolidation plan
└── ✅ Identify 23 files to update

Week 0: Phase 0
└── ⏳ Split ProfilePage (2227 lines → 9 files)

Week 1-2: Phase 1
├── ⏳ Update 3 high-priority files
├── ⏳ Implement dual-write in DealershipService
└── ⏳ Deploy with monitoring

Week 3-4: Phase 2
├── ⏳ Update 10 medium-priority files
└── ⏳ Verify < 5 calls/day to deprecated method

Week 5-6: Phase 3
├── ⏳ Update remaining 10 files
└── ⏳ Verify 0 calls/day to deprecated method

Week 7+: Phase 4
├── ⏳ Remove dual-write (old fields)
└── ⏳ Delete deprecated setupDealerProfile() method
```

---

## 📝 Next Steps

### Immediate (Phase -1 Complete)
- ✅ Add deprecation warning (Done)
- ✅ Document consolidation plan (Done)
- ✅ Git commit changes

### Week 0 (Phase 0)
- Split ProfilePage/index.tsx (2227 lines → < 300 each)
- Add validators to ProfileTypeContext

### Week 1 (Phase 1)
- Update ProfilePage to use dealershipService
- Implement dual-write strategy
- Deploy monitoring dashboard

---

**Status:** ✅ Phase -1 Day 3 Complete  
**Next Phase:** Phase 0 (Pre-Migration)  
**Est. Completion:** 8-9 weeks from now

---

**Last Updated:** November 2025  
**Authored by:** Phase -1 Team  
**Approved by:** [Pending Review]

