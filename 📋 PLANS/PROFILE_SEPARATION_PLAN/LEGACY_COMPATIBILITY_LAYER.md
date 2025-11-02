# 🔄 Legacy Compatibility Layer
## طبقة التوافق مع الكود القديم

**المدة:** ضمن Phase 1 (لا وقت إضافي)  
**الأولوية:** 🟡 HIGH  
**الغرض:** دعم الكود القديم والجديد معاً أثناء الانتقال

---

## 🎯 لماذا نحتاج Compatibility Layer؟

### المشكلة
```typescript
// الواقع المُكتشف:
// - 25 موقع يستخدم isDealer
// - 6 مواقع تستخدم dealerInfo
// - الكود يعمل حالياً ولا يمكن كسره!

// ❌ لا يمكن: حذف مباشر
delete user.isDealer;     // سيكسر 25 موقع!
delete user.dealerInfo;   // سيكسر 6 مواقع!

// ✅ الحل: Compatibility Layer
```

### الهدف
```
الكود القديم يعمل ← Compatibility Layer → الكود الجديد يعمل

خلال 6-8 أسابيع، نُحوّل تدريجياً من القديم للجديد
```

---

## 🧩 Architecture

### Layer Structure

```typescript
/**
 * Legacy Compatibility Layer
 * src/services/compatibility/legacy-adapter.ts
 * 
 * Provides backward compatibility for legacy fields
 * Will be removed after full migration (Week 8+)
 */

// ==================== TYPE ADAPTERS ====================

export interface LegacyUser {
  /** @deprecated Use profileType === 'dealer' */
  isDealer?: boolean;
  
  /** @deprecated Use dealershipRef + dealerSnapshot */
  dealerInfo?: any;
  
  /** @deprecated Use profileType === 'company' */
  isCompany?: boolean;
  
  /** @deprecated Use companyRef + companySnapshot */
  companyInfo?: any;
}

export interface ModernUser {
  profileType: 'private' | 'dealer' | 'company';
  dealershipRef?: string;
  dealerSnapshot?: DealerSnapshot;
  companyRef?: string;
  companySnapshot?: CompanySnapshot;
}

// ==================== GETTERS (Read) ====================

/**
 * Get isDealer value (backward compatible)
 * @deprecated Use profileType === 'dealer' instead
 */
export function getLegacyIsDealer(user: BulgarianUser): boolean {
  if (process.env.NODE_ENV === 'development') {
    console.warn(
      '⚠️ DEPRECATED: isDealer is deprecated. Use profileType === "dealer" instead.',
      '\nFile:', new Error().stack?.split('\n')[2]
    );
  }
  
  // Support both old and new
  if ('profileType' in user) {
    return user.profileType === 'dealer';
  }
  
  return user.isDealer || false;
}

/**
 * Get dealerInfo (backward compatible)
 * @deprecated Use getDealershipInfo() from dealershipService
 */
export async function getLegacyDealerInfo(
  userId: string
): Promise<any | null> {
  if (process.env.NODE_ENV === 'development') {
    console.warn(
      '⚠️ DEPRECATED: dealerInfo is deprecated.',
      '\nUse: dealershipService.getDealershipInfo() instead'
    );
  }
  
  // Try new structure first
  const dealershipDoc = await getDoc(doc(db, 'dealerships', userId));
  if (dealershipDoc.exists()) {
    return dealershipDoc.data();
  }
  
  // Fallback to old structure
  const userDoc = await getDoc(doc(db, 'users', userId));
  if (userDoc.exists()) {
    const data = userDoc.data();
    return data.dealerInfo || null;
  }
  
  return null;
}

// ==================== SETTERS (Write) ====================

/**
 * Update dealer info (backward compatible)
 * Writes to both old and new locations during transition
 */
export async function setLegacyDealerInfo(
  userId: string,
  dealerInfo: any
): Promise<void> {
  if (process.env.NODE_ENV === 'development') {
    console.warn(
      '⚠️ DEPRECATED: setLegacyDealerInfo is deprecated.',
      '\nUse: dealershipService.saveDealershipInfo() instead'
    );
  }
  
  // Write to new location (canonical)
  await dealershipService.saveDealershipInfo(userId, dealerInfo);
  
  // Also write to old location (for backward compatibility)
  // TODO: Remove after all code migrated
  const userRef = doc(db, 'users', userId);
  await updateDoc(userRef, {
    dealerInfo,
    dealershipRef: `dealerships/${userId}`,
    dealerSnapshot: {
      nameBG: dealerInfo.dealershipNameBG || '',
      nameEN: dealerInfo.dealershipNameEN || '',
      logo: dealerInfo.logo || null,
      status: dealerInfo.verified ? 'verified' : 'pending'
    },
    updatedAt: serverTimestamp()
  });
}

// ==================== CONVERTERS ====================

/**
 * Convert legacy user to modern format
 */
export function convertLegacyToModern(legacyUser: any): BulgarianUser {
  // Determine profileType
  let profileType: 'private' | 'dealer' | 'company' = 'private';
  
  if (legacyUser.isDealer || legacyUser.dealerInfo) {
    profileType = 'dealer';
  } else if (legacyUser.isCompany || legacyUser.companyInfo) {
    profileType = 'company';
  } else if (legacyUser.profileType) {
    profileType = legacyUser.profileType;
  }
  
  // Base conversion
  const modernUser: any = {
    ...legacyUser,
    profileType
  };
  
  // Handle dealer-specific conversion
  if (profileType === 'dealer') {
    if (legacyUser.dealerInfo && !legacyUser.dealershipRef) {
      // Legacy format - create snapshot
      modernUser.dealerSnapshot = {
        nameBG: legacyUser.dealerInfo.dealershipNameBG || legacyUser.dealerInfo.companyName || '',
        nameEN: legacyUser.dealerInfo.dealershipNameEN || '',
        logo: legacyUser.dealerInfo.logo || null,
        status: legacyUser.dealerInfo.verified ? 'verified' : 'pending'
      };
      modernUser.dealershipRef = `dealerships/${legacyUser.uid}`;
    }
    
    // Mark legacy fields as deprecated (keep for now)
    modernUser._legacyDealerInfo = legacyUser.dealerInfo;
    modernUser._legacyIsDealer = legacyUser.isDealer;
  }
  
  return modernUser as BulgarianUser;
}

/**
 * Convert modern user to legacy format (for old components)
 */
export function convertModernToLegacy(modernUser: BulgarianUser): any {
  const legacyUser: any = {
    ...modernUser
  };
  
  // Add legacy fields
  if (modernUser.profileType === 'dealer') {
    legacyUser.isDealer = true;
    
    // If dealerSnapshot exists, create minimal dealerInfo
    if ('dealerSnapshot' in modernUser && modernUser.dealerSnapshot) {
      legacyUser.dealerInfo = {
        dealershipNameBG: modernUser.dealerSnapshot.nameBG,
        dealershipNameEN: modernUser.dealerSnapshot.nameEN,
        logo: modernUser.dealerSnapshot.logo,
        verified: modernUser.dealerSnapshot.status === 'verified'
      };
    }
  }
  
  if (modernUser.profileType === 'company') {
    legacyUser.isCompany = true;
    
    if ('companySnapshot' in modernUser && modernUser.companySnapshot) {
      legacyUser.companyInfo = {
        companyNameBG: modernUser.companySnapshot.nameBG,
        companyNameEN: modernUser.companySnapshot.nameEN,
        logo: modernUser.companySnapshot.logo,
        verified: modernUser.companySnapshot.status === 'verified'
      };
    }
  }
  
  return legacyUser;
}

// ==================== HOOKS ====================

/**
 * React hook for legacy compatibility
 */
export function useLegacyUser(user: BulgarianUser | null) {
  const [legacyUser, setLegacyUser] = useState<any>(null);
  
  useEffect(() => {
    if (user) {
      setLegacyUser(convertModernToLegacy(user));
    } else {
      setLegacyUser(null);
    }
  }, [user]);
  
  return legacyUser;
}
```

---

## 🔧 Usage Examples

### Example 1: Reading Legacy isDealer

```typescript
// ❌ OLD CODE (still works during transition)
import { getLegacyIsDealer } from '../services/compatibility/legacy-adapter';

function MyComponent({ user }) {
  const isDealer = getLegacyIsDealer(user);
  // ⚠️ Console warning in dev mode
  
  if (isDealer) {
    return <DealerFeatures />;
  }
  return <PrivateFeatures />;
}

// ✅ NEW CODE (migrate to this)
function MyComponent({ user }) {
  const isDealer = user.profileType === 'dealer';
  
  if (isDealer) {
    return <DealerFeatures />;
  }
  return <PrivateFeatures />;
}
```

### Example 2: Reading dealerInfo

```typescript
// ❌ OLD CODE (still works)
import { getLegacyDealerInfo } from '../services/compatibility/legacy-adapter';

async function loadDealerData(userId: string) {
  const dealerInfo = await getLegacyDealerInfo(userId);
  // ⚠️ Warning in console
  return dealerInfo;
}

// ✅ NEW CODE (migrate to this)
import { dealershipService } from '../services/dealership/dealership.service';

async function loadDealerData(userId: string) {
  const dealerInfo = await dealershipService.getDealershipInfo(userId);
  return dealerInfo;
}
```

### Example 3: Writing dealerInfo

```typescript
// ❌ OLD CODE (still works, writes to both locations)
import { setLegacyDealerInfo } from '../services/compatibility/legacy-adapter';

async function updateDealer(userId: string, data: any) {
  await setLegacyDealerInfo(userId, data);
  // Writes to: dealerships/{uid} + users/{uid}.dealerInfo
}

// ✅ NEW CODE (migrate to this)
import { dealershipService } from '../services/dealership/dealership.service';

async function updateDealer(userId: string, data: any) {
  await dealershipService.saveDealershipInfo(userId, data);
  // Writes to: dealerships/{uid} + users/{uid}.dealerSnapshot
}
```

---

## 📊 Migration Strategy

### Phase 1: Enable Compatibility Layer (Week 1-2)

```
✅ Create legacy-adapter.ts
✅ Add to all legacy usage points (31 locations)
✅ Enable console warnings in development
✅ Test backward compatibility
```

### Phase 2: Gradual Migration (Week 3-6)

```
📅 Update 5 files per day
   ├── Replace getLegacyIsDealer() → profileType === 'dealer'
   ├── Replace getLegacyDealerInfo() → dealershipService
   └── Test after each update

📊 Track progress:
   Week 3: 25 files remaining
   Week 4: 15 files remaining
   Week 5: 5 files remaining
   Week 6: 0 files remaining ✅
```

### Phase 3: Remove Layer (Week 7-8)

```
✅ Verify zero usage (grep scan)
✅ Remove compatibility layer file
✅ Remove legacy fields from types
✅ Update documentation
```

---

## 🧪 Testing Strategy

### Unit Tests

```typescript
// tests/legacy-adapter.test.ts

describe('Legacy Adapter', () => {
  describe('getLegacyIsDealer', () => {
    it('returns true for dealer profileType', () => {
      const user = { profileType: 'dealer' } as any;
      expect(getLegacyIsDealer(user)).toBe(true);
    });
    
    it('returns true for legacy isDealer', () => {
      const user = { isDealer: true } as any;
      expect(getLegacyIsDealer(user)).toBe(true);
    });
    
    it('returns false for private', () => {
      const user = { profileType: 'private' } as any;
      expect(getLegacyIsDealer(user)).toBe(false);
    });
    
    it('logs warning in development', () => {
      const consoleWarn = jest.spyOn(console, 'warn');
      const user = { profileType: 'dealer' } as any;
      getLegacyIsDealer(user);
      expect(consoleWarn).toHaveBeenCalled();
    });
  });
  
  describe('convertLegacyToModern', () => {
    it('converts isDealer to profileType', () => {
      const legacy = { isDealer: true, uid: '123' };
      const modern = convertLegacyToModern(legacy);
      expect(modern.profileType).toBe('dealer');
    });
    
    it('creates dealerSnapshot from dealerInfo', () => {
      const legacy = {
        isDealer: true,
        uid: '123',
        dealerInfo: {
          dealershipNameBG: 'Тест',
          dealershipNameEN: 'Test',
          verified: true
        }
      };
      const modern = convertLegacyToModern(legacy);
      expect(modern.dealerSnapshot?.nameBG).toBe('Тест');
      expect(modern.dealerSnapshot?.status).toBe('verified');
    });
  });
});
```

---

## 📈 Progress Tracking

### Deprecation Dashboard

Create: `scripts/track-legacy-usage.ts`

```typescript
/**
 * Track legacy field usage across codebase
 * Run weekly to monitor progress
 */

import { execSync } from 'child_process';

function trackUsage() {
  console.log('📊 Legacy Usage Tracker\n');
  
  // Count isDealer
  const isDealerCount = execSync(
    'grep -r "isDealer" src/ --include="*.ts" --include="*.tsx" | wc -l'
  ).toString().trim();
  
  // Count dealerInfo
  const dealerInfoCount = execSync(
    'grep -r "dealerInfo" src/ --include="*.ts" --include="*.tsx" | wc -l'
  ).toString().trim();
  
  // Count getLegacyIsDealer (compatibility layer)
  const compatCount = execSync(
    'grep -r "getLegacyIsDealer\\|getLegacyDealerInfo" src/ --include="*.ts" --include="*.tsx" | wc -l'
  ).toString().trim();
  
  console.log(`isDealer usage: ${isDealerCount}`);
  console.log(`dealerInfo usage: ${dealerInfoCount}`);
  console.log(`Compatibility layer usage: ${compatCount}`);
  console.log(`\nTarget: 0 for all\n`);
  
  // Save history
  const fs = require('fs');
  const history = JSON.parse(
    fs.existsSync('legacy-usage-history.json') 
      ? fs.readFileSync('legacy-usage-history.json', 'utf8')
      : '[]'
  );
  
  history.push({
    date: new Date().toISOString(),
    isDealer: parseInt(isDealerCount),
    dealerInfo: parseInt(dealerInfoCount),
    compat: parseInt(compatCount)
  });
  
  fs.writeFileSync('legacy-usage-history.json', JSON.stringify(history, null, 2));
  console.log('✅ History updated\n');
}

trackUsage();
```

**Run weekly:**
```bash
npx ts-node scripts/track-legacy-usage.ts
```

---

## 🎯 Success Criteria

### Week-by-Week Goals

| Week | isDealer | dealerInfo | Compat Layer | Status |
|------|----------|------------|--------------|--------|
| 1 | 25 | 6 | 31 | Added layer |
| 2 | 25 | 6 | 31 | Testing |
| 3 | 20 | 5 | 31 | Migrating |
| 4 | 15 | 4 | 31 | Progress |
| 5 | 5 | 2 | 31 | Almost done |
| 6 | 0 | 0 | 31 | Ready to remove |
| 7 | 0 | 0 | 0 | ✅ Complete |

---

## 🔗 Related Documents

- **Phase -1:** PHASE_MINUS_1_CODE_AUDIT.md (legacy usage map)
- **Phase 1:** Core Types (uses modern types)
- **Deprecation:** DEPRECATION_TIMELINE.md
- **Testing:** Unit test suite

---

**آخر تحديث:** نوفمبر 2025  
**الحالة:** ✅ Ready for Implementation  
**Timeline:** Weeks 1-7

