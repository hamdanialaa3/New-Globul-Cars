# 🗺️ LEGACY USAGE MAP
## Complete mapping of deprecated fields (isDealer & dealerInfo)

**Created:** November 2025  
**Phase:** -1 Day 2 (Legacy Usage Mapping)  
**Purpose:** Track all legacy field usages for safe deprecation

---

## 📊 Summary Statistics

| Field | Total Occurrences | Files Affected | Status |
|-------|-------------------|----------------|--------|
| `isDealer` | 19 | 9 files | ⚠️ Active - Must Migrate |
| `dealerInfo` | 5 | 3 files (+1 translations) | ⚠️ Active - Must Migrate |
| **TOTAL** | **24** | **10 files** | 🔄 Migration Required |

---

## 🔴 CRITICAL USAGE: isDealer (19 occurrences in 9 files)

### 1. `src/firebase/auth-service.ts` (3 occurrences)

**Line 184: Type Definition**
```typescript
profile: {
  isDealer: boolean;  // ⚠️ DEPRECATED TYPE FIELD
  companyName?: string;
  taxNumber?: string;
```
**Action:** Update to use `profileType: 'dealer'`

**Line 268: Data Mapping**
```typescript
profile: {
  isDealer: userData.profile?.isDealer || false,
  companyName: userData.profile?.companyName,
```
**Action:** Map to `profileType`

**Line 607: Default Value**
```typescript
profile: {
  isDealer: false,  // ⚠️ Set default for new users
  preferredCurrency: BULGARIAN_CONFIG.currency,
```
**Action:** Set `profileType: 'private'` instead

---

### 2. `src/firebase/social-auth-service.ts` (3 occurrences)

**Line 617: Default User Creation**
```typescript
// User type
isDealer: false,  // ⚠️ All new social auth users default to private
```
**Action:** Set `profileType: 'private'`

**Line 838-849: Search Criteria**
```typescript
interface SearchCriteria {
  isDealer?: boolean;  // ⚠️ Used for filtering
}
// ...
if (criteria.isDealer !== undefined) {
  q = query(q, where('isDealer', '==', criteria.isDealer));
}
```
**Action:** Update to filter by `profileType`

---

### 3. `src/services/bulgarian-profile-service.ts` (2 occurrences)

**Line 177: Profile Data Save**
```typescript
// User type
isDealer: profileData.isDealer || false,
dealerInfo: dealerData,
```
**Action:** Dual-write during migration (set both `isDealer` AND `profileType`)

**Line 304: Dealer Setup**
```typescript
await this.updateUserProfile(userId, {
  isDealer: true,  // ⚠️ When promoting user to dealer
  dealerInfo: dealerData
});
```
**Action:** Use `profileType: 'dealer'` + `dealershipRef`

---

### 4. `src/contexts/ProfileTypeContext.tsx` (2 occurrences)

**Line 53: Helper Boolean**
```typescript
// Helper booleans
isPrivate: boolean;
isDealer: boolean;  // ✅ OK - This is a COMPUTED helper, not storage
isCompany: boolean;
```
**Status:** ✅ SAFE - Computed from `profileType`, not stored

**Line 250: Computed Value**
```typescript
const isDealer = profileType === 'dealer';  // ✅ OK - Computed
```
**Status:** ✅ SAFE - Keep this pattern

---

### 5. `src/types/user/bulgarian-user.types.ts` (1 occurrence)

**Line 129: Type Definition (Deprecated Field)**
```typescript
/**
 * @deprecated Use profileType === 'dealer' instead
 * Will be removed after Phase 4
 * Current usage: 25 occurrences in 10 files
 */
isDealer?: boolean;
```
**Status:** ✅ Already marked deprecated - Keep during migration

---

### 6. `src/services/real-data-initializer.ts` (3 occurrences)

**Lines 50, 74, 98: Test Data**
```typescript
profile: {
  isDealer: false,  // User 1
  // ...
},
// ...
profile: {
  isDealer: true,   // User 2 (dealer)
  // ...
},
// ...
profile: {
  isDealer: false,  // User 3
```
**Action:** Update test data to use `profileType`

---

### 7. `src/services/firebase-auth-users-service.ts` (2 occurrences)

**Lines 88, 118: Mock Data**
```typescript
profile: {
  isDealer: false,  // Mock user 1
  // ...
},
// ...
profile: {
  isDealer: true,   // Mock dealer
```
**Action:** Update mock data to use `profileType`

---

### 8. `src/services/advanced-user-management-service.ts` (3 occurrences)

**Line 63: Interface**
```typescript
profile: {
  isDealer: boolean;  // ⚠️ Service interface
  preferredCurrency: 'EUR';
```
**Action:** Update interface to use `profileType`

**Line 165: Data Mapping**
```typescript
profile: {
  isDealer: userData.profile?.isDealer || false,
```
**Action:** Map to `profileType`

**Line 245: Default Value**
```typescript
profile: {
  isDealer: false,
```
**Action:** Set `profileType: 'private'`

---

### 9. `src/services/admin-service.ts` (1 occurrence)

**Line 248: Admin Creation**
```typescript
profile: {
  isDealer: true,  // ⚠️ Admins marked as dealers?
  isAdmin: true,
  isSuperAdmin: true,
```
**Action:** Reconsider - Admins should be separate, not dealers!

---

## 🟡 MODERATE USAGE: dealerInfo (5 occurrences in 3 files)

### 1. `src/services/bulgarian-profile-service.ts` (2 occurrences)

**Line 178: Data Save**
```typescript
isDealer: profileData.isDealer || false,
dealerInfo: dealerData,  // ⚠️ Embedded dealer data
```
**Action:** Replace with `dealershipRef` + snapshot

**Line 305: Dealer Setup**
```typescript
await this.updateUserProfile(userId, {
  isDealer: true,
  dealerInfo: dealerData  // ⚠️ Full dealer object
});
```
**Action:** Save to `dealerships/{uid}` collection, set `dealershipRef`

---

### 2. `src/types/user/bulgarian-user.types.ts` (1 occurrence)

**Line 122: Type Definition**
```typescript
/**
 * @deprecated Use dealershipRef instead
 * Will be removed after Phase 4
 * Current usage: 6 files
 */
dealerInfo?: any;
```
**Status:** ✅ Already marked deprecated

---

### 3. `src/locales/translations.ts` (2 occurrences)

**Lines 962, 2026: Translation Keys**
```typescript
// Bulgarian
dealerInfo: 'Информация за търговеца',

// English
dealerInfo: 'Dealer Info',
```
**Status:** ⚠️ KEEP - This is a UI label, not data storage

---

## 📋 MIGRATION PRIORITY MATRIX

| Priority | Files | Reason | Timeline |
|----------|-------|--------|----------|
| 🔴 **P0** | bulgarian-profile-service.ts | Main profile service - dual-write first | Week 1 |
| 🔴 **P0** | auth-service.ts | User creation - affects all new users | Week 1 |
| 🟠 **P1** | social-auth-service.ts | Social login - high traffic | Week 2 |
| 🟠 **P1** | ProfileTypeContext.tsx | Already good (computed helpers) | ✅ No action |
| 🟡 **P2** | advanced-user-management-service.ts | Admin tool - lower traffic | Week 3 |
| 🟡 **P2** | admin-service.ts | Admin creation - NEEDS REVIEW | Week 3 |
| 🟢 **P3** | real-data-initializer.ts | Test data only | Week 4 |
| 🟢 **P3** | firebase-auth-users-service.ts | Mock data only | Week 4 |
| ⚪ **P4** | translations.ts | UI labels - KEEP | No action |

---

## 🗓️ DEPRECATION TIMELINE

### Week 1-2: Dual-Write Phase (Phase 0-1)
```
✅ Add new fields (profileType, dealershipRef)
✅ Update write operations to set BOTH old and new fields
✅ Keep isDealer/dealerInfo for backward compatibility
```

**Files to update:**
- bulgarian-profile-service.ts
- auth-service.ts
- social-auth-service.ts

---

### Week 3-4: Read Migration (Phase 2)
```
✅ Update all READ operations to use new fields
✅ Add fallback: if (dealershipRef) ... else if (dealerInfo) ...
⚠️ Log warnings when old fields are used
```

**Files to update:**
- advanced-user-management-service.ts
- admin-service.ts
- All Profile components

---

### Week 5-6: Monitoring & Verification (Phase 3)
```
📊 Monitor legacy field usage (Firebase Analytics)
📊 Confirm < 1% of reads use fallback
✅ Fix any remaining usages
```

---

### Week 7+: Cleanup (Phase 4)
```
🗑️ Remove isDealer field (if usage = 0%)
🗑️ Remove dealerInfo field (if usage = 0%)
🗑️ Remove fallback code
🗑️ Remove @deprecated markers
```

---

## 🚨 CRITICAL WARNINGS

### ⚠️ Admin Service Issue
```typescript
// admin-service.ts:248
profile: {
  isDealer: true,  // ❌ WHY?
  isAdmin: true,
  isSuperAdmin: true,
```

**Problem:** Admins are marked as dealers!  
**Risk:** Admin profiles will incorrectly appear as dealers  
**Action:** Add separate `isAdmin` tracking OR use `profileType: 'admin'`?

---

### ⚠️ Firestore Query Migration
```typescript
// social-auth-service.ts:849
q = query(q, where('isDealer', '==', criteria.isDealer));
```

**Problem:** Direct Firestore query on deprecated field  
**Risk:** Won't work after field removal  
**Action:** Update to `where('profileType', '==', 'dealer')`

---

## 📝 NEXT STEPS (Day 3)

1. ✅ Service Consolidation Plan
2. ✅ Add deprecation warnings to methods
3. ✅ Create migration helper functions
4. ✅ Test dual-write strategy

---

**Last Updated:** November 2025  
**Status:** 📋 Complete - Ready for Day 3  
**Next:** `20_PHASE_MINUS_1_CODE_AUDIT.md` (Day 3: Service Consolidation)

