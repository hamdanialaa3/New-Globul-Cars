# 📋 PROFILE TYPES SEPARATION PLAN
## الخطة الأصلية الشاملة - Complete Reference

**التاريخ:** نوفمبر 2025  
**الحالة:** 📚 Reference Document  
**الغرض:** المرجع الفني الشامل

---

## 🎯 Note

**هذا هو الملف المرجعي الشامل للخطة.**

للحصول على:
- **البداية السريعة** → اقرأ **[00-START_HERE.md](./00-START_HERE.md)**
- **الخطة العملية** → اقرأ **[PROFILE_TYPES_SEPARATION_PLAN_PRIORITIZED.md](./PROFILE_TYPES_SEPARATION_PLAN_PRIORITIZED.md)**
- **الوضع الحالي** → اقرأ **[CURRENT_SYSTEM_REALITY.md](./CURRENT_SYSTEM_REALITY.md)**

---

> Addenda (Nov 2025): For additional implementation-ready stabilization fixes (capability matrix, rate limiting, audit logs, consistency checks, trust score triggers, team permissions, image normalization, client caching, and deprecated fields cleanup), see the section “Advanced Stabilization Addenda” in [PROFILE_TYPES_SEPARATION_PLAN_PRIORITIZED.md](./PROFILE_TYPES_SEPARATION_PLAN_PRIORITIZED.md). This reference stays narrative and avoids duplicating code snippets.

## 📋 Table of Contents

### Part 1: Objective & Overview
- [1.1 Project Goals](#11-project-goals)
- [1.2 Scope](#12-scope)
- [1.3 Success Criteria](#13-success-criteria)

### Part 2: Current State Analysis
- [2.1 Existing System](#21-existing-system)
- [2.2 Problems Identified](#22-problems-identified)
- [2.3 Technical Debt](#23-technical-debt)

### Part 3: Proposed Architecture
- [3.1 Type System Design](#31-type-system-design)
- [3.2 Service Layer Design](#32-service-layer-design)
- [3.3 Database Structure](#33-database-structure)

### Part 4: Implementation Phases
- [4.1 Phase 1: Types & Interfaces](#41-phase-1-types--interfaces)
- [4.2 Phase 2: Service Layer](#42-phase-2-service-layer)
- [4.3 Phase 3: UI Components](#43-phase-3-ui-components)
- [4.4 Phase 4: Migration](#44-phase-4-migration)

### Part 5: Data Migration Strategy
- [5.1 Migration Script](#51-migration-script)
- [5.2 Rollback Plan](#52-rollback-plan)
- [5.3 Testing Strategy](#53-testing-strategy)

### Part 6: UI/UX Changes
- [6.1 Profile Type Selection](#61-profile-type-selection)
- [6.2 Profile Forms](#62-profile-forms)
- [6.3 Settings Pages](#63-settings-pages)

### Part 7: Security & Validation
- [7.1 Firestore Rules](#71-firestore-rules)
- [7.2 Bulgarian Validators](#72-bulgarian-validators)
- [7.3 Type Guards](#73-type-guards)

### Part 8: Testing Strategy
- [8.1 Unit Tests](#81-unit-tests)
- [8.2 Integration Tests](#82-integration-tests)
- [8.3 E2E Tests](#83-e2e-tests)

### Part 9: Timeline & Resources
- [9.1 Project Timeline](#91-project-timeline)
- [9.2 Team Requirements](#92-team-requirements)
- [9.3 Budget Estimation](#93-budget-estimation)

### Part 10: Risks & Mitigation
- [10.1 Technical Risks](#101-technical-risks)
- [10.2 Business Risks](#102-business-risks)
- [10.3 Mitigation Strategies](#103-mitigation-strategies)

---

## Part 1: Objective & Overview

### 1.1 Project Goals

**الهدف الرئيسي:**
فصل وتنظيم 3 أنواع من البروفايلات (Private, Dealer, Company) في نظام type-safe قابل للصيانة والتوسع.

**الأهداف الفرعية:**
1. ✅ تحسين Type Safety في TypeScript
2. ✅ تقليل Code Duplication
3. ✅ تسهيل الصيانة والتطوير المستقبلي
4. ✅ تحسين أمان البيانات
5. ✅ دعم خطط اشتراك مختلفة لكل نوع
6. ✅ تحسين تجربة المستخدم

---

### 1.2 Scope

**داخل النطاق (In Scope):**
- ✅ إعادة هيكلة Type System
- ✅ فصل Service Layer
- ✅ تحديث UI Components
- ✅ ترحيل البيانات الموجودة
- ✅ تحديث Security Rules
- ✅ Testing شامل

**خارج النطاق (Out of Scope):**
- ❌ تغيير نظام الدفع (Stripe)
- ❌ إعادة تصميم UI بالكامل
- ❌ إضافة ميزات جديدة
- ❌ تغيير Firebase Project
- ❌ تغيير Domain/Hosting

---

### 1.3 Success Criteria

**معايير النجاح:**

1. **Technical:**
   - ✅ 100% TypeScript type coverage
   - ✅ Zero `any` types
   - ✅ All tests passing (80%+ coverage)
   - ✅ No runtime type errors

2. **Business:**
   - ✅ Zero downtime deployment
   - ✅ All existing users migrated
   - ✅ No data loss
   - ✅ No user complaints

3. **Performance:**
   - ✅ Page load time < 2s
   - ✅ API response time < 500ms
   - ✅ Database queries optimized

---

## Part 2: Current State Analysis

### 2.1 Existing System

**الوضع الحالي:**
- واجهة واحدة: `BulgarianUser` (80+ حقول)
- جميع أنواع البروفايلات مختلطة
- Validation ضعيف
- Code duplication في الخدمات
- Security rules بسيطة

**التفاصيل الكاملة:**
راجع **[CURRENT_SYSTEM_REALITY.md](./CURRENT_SYSTEM_REALITY.md)** للحصول على توثيق شامل للنظام الحالي.

---

### 2.2 Problems Identified

**المشاكل الرئيسية:**

1. **Type Safety:**
```typescript
// ❌ Current Problem
interface BulgarianUser {
  profileType: 'private' | 'dealer' | 'company';
  dealershipInfo?: DealershipInfo;  // Optional for ALL types!
  companyInfo?: CompanyInfo;        // Optional for ALL types!
}

// TypeScript can't enforce:
// - Dealer MUST have dealershipInfo
// - Company MUST have companyInfo
// - Private should NOT have these fields
```

2. **Code Duplication:**
```typescript
// ❌ Duplicated validation logic
function validatePrivateProfile(user) { /* ... */ }
function validateDealerProfile(user) { /* ... 80% same */ }
function validateCompanyProfile(user) { /* ... 80% same */ }
```

3. **Weak Validation:**
```typescript
// ❌ No compile-time validation
if (user.profileType === 'dealer' && !user.dealershipInfo) {
  // Runtime error! Too late!
}
```

---

### 2.3 Technical Debt

**الديون التقنية الحالية:**

1. **Optional Fields Everywhere:**
   - 50+ optional fields في `BulgarianUser`
   - لا توجد طريقة للتأكد من وجود البيانات المطلوبة

2. **Service Methods:**
   - 30+ methods في خدمة واحدة
   - منطق معقد للتعامل مع الأنواع المختلفة
   - صعوبة الاختبار

3. **UI Components:**
   - مكونات كبيرة جداً (1000+ سطر)
   - if/else للتعامل مع الأنواع
   - صعوبة الصيانة

---

## Part 3: Proposed Architecture

### 3.1 Type System Design

**النظام المقترح:**

```typescript
// Base Profile - Common fields
interface BaseProfile {
  id: string;
  email: string;
  displayName: string;
  profileType: 'private' | 'dealer' | 'company';
  // ... common fields
}

// Private Profile
interface PrivateProfile extends BaseProfile {
  profileType: 'private';
  planTier: 'free' | 'premium';
  egn?: string;
  // NO dealershipInfo
  // NO companyInfo
}

// Dealer Profile
interface DealerProfile extends BaseProfile {
  profileType: 'dealer';
  planTier: 'dealer_basic' | 'dealer_pro' | 'dealer_enterprise';
  dealershipInfo: DealershipInfo;  // REQUIRED!
  // NO companyInfo
}

// Company Profile
interface CompanyProfile extends BaseProfile {
  profileType: 'company';
  planTier: 'company_starter' | 'company_pro' | 'company_enterprise';
  companyInfo: CompanyInfo;        // REQUIRED!
  // NO dealershipInfo
}

// Union Type
type BulgarianUser = PrivateProfile | DealerProfile | CompanyProfile;
```

**الفوائد:**
- ✅ TypeScript يفرض القواعد
- ✅ لا يمكن أن يكون dealer بدون dealershipInfo
- ✅ لا حقول غير ضرورية
- ✅ Intellisense أفضل

**التفاصيل الكاملة:**
راجع **[PROFILE_TYPES_SEPARATION_PLAN_PRIORITIZED.md](./PROFILE_TYPES_SEPARATION_PLAN_PRIORITIZED.md)** للحصول على الكود الكامل.

---

### 3.2 Service Layer Design

**البنية المقترحة:**

```
services/profiles/
├── base-profile.service.ts       ← Common operations
├── private-profile.service.ts    ← Private specific
├── dealer-profile.service.ts     ← Dealer specific
├── company-profile.service.ts    ← Company specific
└── profile-factory.service.ts    ← Create new profiles
```

**الفوائد:**
- ✅ Single Responsibility
- ✅ No code duplication
- ✅ Type-safe methods
- ✅ Easy to test

---

### 3.3 Database Structure

**Firestore Structure:**

```
users/{userId}
  - profileType: string
  - ... base fields
  - dealershipInfo?: object  (if dealer)
  - companyInfo?: object     (if company)
  
  Subcollections:
  - posts/{postId}
  - cars/{carId}
  - conversations/{conversationId}
```

**لا تغيير في البنية** - نفس الهيكل، لكن مع:
- ✅ Validation أقوى
- ✅ Type safety في الكود
- ✅ Security rules أفضل

---

## Part 4: Implementation Phases

### 4.1 Phase 1: Types & Interfaces

**المدة:** أسبوع واحد

**المخرجات:**
- ✅ 7 ملفات types جديدة
- ✅ Type guards & validators
- ✅ Unit tests (80%+ coverage)

**التفاصيل:**
راجع Phase 1 في **[PROFILE_TYPES_SEPARATION_PLAN_PRIORITIZED.md](./PROFILE_TYPES_SEPARATION_PLAN_PRIORITIZED.md#phase-1-core-interfaces--types)**

---

### 4.2 Phase 2: Service Layer

**المدة:** أسبوعان

**المخرجات:**
- ✅ 5 services جديدة
- ✅ Base service مع common logic
- ✅ Integration tests

**التفاصيل:**
راجع Phase 2 في **[PROFILE_TYPES_SEPARATION_PLAN_PRIORITIZED.md](./PROFILE_TYPES_SEPARATION_PLAN_PRIORITIZED.md#phase-2-service-layer-separation)**

---

### 4.3 Phase 3: UI Components

**المدة:** أسبوعان

**المخرجات:**
- ✅ مكونات منفصلة لكل نوع
- ✅ Forms محسّنة
- ✅ Settings pages مُحدثة

---

### 4.4 Phase 4: Migration

**المدة:** أسبوع واحد

**المخرجات:**
- ✅ Migration script
- ✅ Rollback plan
- ✅ Production deployment

---

## Part 5: Data Migration Strategy

### 5.1 Migration Script

```typescript
/**
 * Migration Script
 * Migrates existing users to new type system
 */
async function migrateUsers() {
  const usersRef = collection(db, 'users');
  const snapshot = await getDocs(usersRef);
  
  for (const doc of snapshot.docs) {
    const user = doc.data() as BulgarianUser;
    
    // Validate and transform based on type
    if (user.profileType === 'dealer') {
      if (!user.dealershipInfo) {
        console.error(`Dealer ${user.id} missing dealershipInfo`);
        // Create default dealershipInfo or flag for manual review
      }
    }
    
    if (user.profileType === 'company') {
      if (!user.companyInfo) {
        console.error(`Company ${user.id} missing companyInfo`);
        // Create default companyInfo or flag for manual review
      }
    }
    
    // Update document
    await updateDoc(doc.ref, {
      // ... transformed data
      migratedAt: serverTimestamp()
    });
  }
}
```

---

### 5.2 Rollback Plan

**إذا حدث خطأ:**

1. **Stop Migration**
2. **Restore from Backup**
3. **Revert Code** (Git)
4. **Notify Users**
5. **Investigate Issue**

**Backup Strategy:**
```bash
# Before migration
firebase firestore:export gs://fire-new-globul-backup/$(date +%Y%m%d)

# After migration (if needed)
firebase firestore:import gs://fire-new-globul-backup/20251101
```

---

### 5.3 Testing Strategy

**قبل Production:**

1. **Dry Run on Test Data**
   - 100 test users
   - All profile types
   - Edge cases

2. **Gradual Rollout**
   - 10% of users (Day 1)
   - 50% of users (Day 3)
   - 100% of users (Day 7)

3. **Monitoring**
   - Error rates
   - Performance metrics
   - User feedback

---

## Part 6: UI/UX Changes

### 6.1 Profile Type Selection

**عند التسجيل:**
```tsx
<ProfileTypeSelector>
  <Option value="private" color="#FF8F10">
    <Icon>👤</Icon>
    <Title>خاص</Title>
    <Description>للمستخدمين الأفراد</Description>
  </Option>
  
  <Option value="dealer" color="#16a34a">
    <Icon>🏢</Icon>
    <Title>تاجر</Title>
    <Description>للتجار المحترفين</Description>
  </Option>
  
  <Option value="company" color="#1d4ed8">
    <Icon>🏭</Icon>
    <Title>شركة</Title>
    <Description>للشركات والأساطيل</Description>
  </Option>
</ProfileTypeSelector>
```

---

### 6.2 Profile Forms

**نماذج منفصلة لكل نوع:**

1. **PrivateProfileForm**
   - اسم
   - رقم هاتف
   - عنوان
   - EGN (اختياري)
   - صورة هوية (اختياري)

2. **DealerProfileForm**
   - معلومات المعرض (BG/EN)
   - معلومات قانونية (VAT, Bulstat)
   - ساعات العمل
   - الخدمات
   - فريق العمل

3. **CompanyProfileForm**
   - معلومات الشركة (BG/EN)
   - معلومات قانونية (Bulstat, EIK, VAT)
   - حجم الأسطول
   - الأقسام
   - فريق العمل

---

### 6.3 Settings Pages

**صفحات منفصلة:**
```
/profile/settings/private    ← Private users
/profile/settings/dealer     ← Dealers
/profile/settings/company    ← Companies
```

---

## Part 7: Security & Validation

### 7.1 Firestore Rules

راجع **[ANALYSIS_AND_CHANGES_SUMMARY.md](./ANALYSIS_AND_CHANGES_SUMMARY.md#6-security-improvements)** للحصول على Security Rules المُحسّنة.

---

### 7.2 Bulgarian Validators

```typescript
// EGN Validator
export function validateEGN(egn: string): boolean {
  if (!/^\d{10}$/.test(egn)) return false;
  
  // Extract date
  const year = parseInt(egn.substring(0, 2));
  const month = parseInt(egn.substring(2, 4));
  const day = parseInt(egn.substring(4, 6));
  
  // Validate date
  // ...
  
  // Validate checksum
  const weights = [2, 4, 8, 5, 10, 9, 7, 3, 6];
  let sum = 0;
  for (let i = 0; i < 9; i++) {
    sum += parseInt(egn[i]) * weights[i];
  }
  const checksum = sum % 11;
  const expectedChecksum = checksum === 10 ? 0 : checksum;
  
  return parseInt(egn[9]) === expectedChecksum;
}

// Bulstat Validator
export function validateBulstat(bulstat: string): boolean {
  if (!/^\d{9,13}$/.test(bulstat)) return false;
  
  // Validate checksum
  // Implementation based on Bulgarian standards
  // ...
  
  return true;
}

// VAT Validator
export function validateVAT(vat: string): boolean {
  if (!/^BG\d{9}$/.test(vat)) return false;
  
  const bulstat = vat.substring(2);
  return validateBulstat(bulstat);
}
```

---

### 7.3 Type Guards

راجع **[PROFILE_TYPES_SEPARATION_PLAN_PRIORITIZED.md](./PROFILE_TYPES_SEPARATION_PLAN_PRIORITIZED.md#15-type-guards--validators)** للحصول على Type Guards الكاملة.

---

## Part 8: Testing Strategy

### 8.1 Unit Tests

```typescript
// Example: Type Guard Tests
describe('isPrivateProfile', () => {
  it('should return true for private profile', () => {
    const profile: PrivateProfile = { /* ... */ };
    expect(isPrivateProfile(profile)).toBe(true);
  });
  
  it('should return false for dealer profile', () => {
    const profile: DealerProfile = { /* ... */ };
    expect(isPrivateProfile(profile)).toBe(false);
  });
});

// Example: Validator Tests
describe('validateEGN', () => {
  it('should validate correct EGN', () => {
    expect(validateEGN('1234567890')).toBe(true);
  });
  
  it('should reject invalid EGN', () => {
    expect(validateEGN('invalid')).toBe(false);
  });
});
```

**التغطية المطلوبة:** 80%+

---

### 8.2 Integration Tests

```typescript
describe('DealerProfileService', () => {
  it('should create dealer profile with required fields', async () => {
    const profile = await service.createDealerProfile({
      userId: 'test-dealer-1',
      email: 'dealer@test.com',
      dealershipNameBG: 'Тест Дилър',
      dealershipNameEN: 'Test Dealer',
      vatNumber: 'BG123456789',
      companyRegNumber: '123456789',
      planTier: 'dealer_basic'
    });
    
    expect(profile.profileType).toBe('dealer');
    expect(profile.dealershipInfo).toBeDefined();
    expect(profile.subscription).toBeDefined();
  });
});
```

---

### 8.3 E2E Tests

```typescript
describe('Dealer Signup Flow', () => {
  it('should complete dealer registration', async () => {
    await page.goto('/signup');
    await page.click('[data-testid="profile-type-dealer"]');
    await page.fill('[name="dealershipNameBG"]', 'Тест Дилър');
    await page.fill('[name="dealershipNameEN"]', 'Test Dealer');
    await page.fill('[name="vatNumber"]', 'BG123456789');
    await page.click('[type="submit"]');
    
    await page.waitForURL('/profile');
    expect(await page.textContent('h1')).toContain('Test Dealer');
  });
});
```

---

## Part 9: Timeline & Resources

### 9.1 Project Timeline

| Week | Phase | Tasks | Team |
|------|-------|-------|------|
| 1 | Phase 1 | Types & Interfaces | 1 Senior Dev |
| 2-3 | Phase 2 | Service Layer | 2 Developers |
| 4-5 | Phase 3 | UI Components | 1 Dev + 1 UI/UX |
| 6 | Phase 4 | Migration & Testing | Full Team |

**المدة الإجمالية:** 6 أسابيع

---

### 9.2 Team Requirements

**الفريق المطلوب:**

- 1x Senior TypeScript Developer (Full-time, 6 weeks)
- 1x Mid-level Developer (Full-time, 4 weeks)
- 1x UI/UX Designer (Part-time, 2 weeks)
- 1x QA Engineer (Full-time, 2 weeks)
- 1x DevOps (Part-time, 1 week)

---

### 9.3 Budget Estimation

**تقدير التكلفة:**

- Development: ~240 hours @ €50/hr = €12,000
- UI/UX: ~80 hours @ €40/hr = €3,200
- QA: ~80 hours @ €35/hr = €2,800
- DevOps: ~40 hours @ €60/hr = €2,400
- **الإجمالي:** ~€20,400

---

## Part 10: Risks & Mitigation

### 10.1 Technical Risks

راجع **[ANALYSIS_AND_CHANGES_SUMMARY.md](./ANALYSIS_AND_CHANGES_SUMMARY.md#risk-mitigation)** للحصول على خطة شاملة لإدارة المخاطر.

---

### 10.2 Business Risks

**المخاطر التجارية:**

1. **User Confusion**
   - الخطر: المستخدمون لا يفهمون التغييرات
   - الاحتمالية: متوسطة
   - التأثير: عالي
   - الحل: توثيق واضح + إشعارات

2. **Lost Revenue**
   - الخطر: مشاكل في نظام الاشتراكات
   - الاحتمالية: منخفضة
   - التأثير: مرتفع جداً
   - الحل: اختبار شامل + monitoring

---

### 10.3 Mitigation Strategies

**استراتيجيات التخفيف:**

1. **Comprehensive Testing**
2. **Gradual Rollout**
3. **Backup & Rollback Plans**
4. **User Communication**
5. **24/7 Monitoring**
6. **Support Team Training**

---

## Conclusion

هذه الخطة الشاملة توفر:

- ✅ تحليل كامل للوضع الحالي
- ✅ تصميم معماري محكم
- ✅ خطة تنفيذ مفصلة (4 مراحل)
- ✅ استراتيجية ترحيل آمنة
- ✅ تغطية اختبار شاملة
- ✅ إدارة مخاطر متقدمة

**للبدء بالتنفيذ:**
1. راجع **[PROFILE_TYPES_SEPARATION_PLAN_PRIORITIZED.md](./PROFILE_TYPES_SEPARATION_PLAN_PRIORITIZED.md)**
2. ابدأ بـ Phase 1: Types & Interfaces
3. اتبع الخطة خطوة بخطوة

---

## References

- **[README.md](./README.md)** - معلومات عامة
- **[00-START_HERE.md](./00-START_HERE.md)** - دليل البداية
- **[FOLDER_SUMMARY.md](./FOLDER_SUMMARY.md)** - ملخص سريع
- **[CURRENT_SYSTEM_REALITY.md](./CURRENT_SYSTEM_REALITY.md)** - النظام الحالي
- **[PROFILE_TYPES_SEPARATION_PLAN_PRIORITIZED.md](./PROFILE_TYPES_SEPARATION_PLAN_PRIORITIZED.md)** - الخطة المرتبة
- **[ANALYSIS_AND_CHANGES_SUMMARY.md](./ANALYSIS_AND_CHANGES_SUMMARY.md)** - التحليل والقرارات

---

**آخر تحديث:** نوفمبر 2025  
**الإصدار:** v1.0  
**الحالة:** 📚 Complete Reference Document

