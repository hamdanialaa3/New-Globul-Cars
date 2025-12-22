# 📘 نظام المستخدم والأنواع الثلاثة - User Profile System Documentation
## توثيق شامل ومتكامل - Complete Integrated Documentation

> **Version**: 2.0.0  
> **Last Updated**: December 2025  
> **Status**: Production-Ready  
> **Source of Truth**: هذا الملف هو المصدر الوحيد الموثوق للمعلومات المتعلقة بنظام المستخدم

---

## 📋 جدول المحتويات (Table of Contents)

1. [نظرة عامة على النظام](#نظرة-عامة-على-النظام)
2. [الأنواع الثلاثة للمستخدمين](#الأنواع-الثلاثة-للمستخدمين)
3. [الهيكل التقني والكود](#الهيكل-التقني-والكود)
4. [نظام الأذونات والحدود](#نظام-الأذونات-والحدود)
5. [التحقق والثقة (Verification & Trust)](#التحقق-والثقة)
6. [التحويل بين الأنواع](#التحويل-بين-الأنواع)
7. [التخزين في Firestore](#التخزين-في-firestore)
8. [واجهة المستخدم والتصميم](#واجهة-المستخدم-والتصميم)
9. [التكامل مع الأنظمة الأخرى](#التكامل-مع-الأنظمة-الأخرى)
10. [أفضل الممارسات والأخطاء الشائعة](#أفضل-الممارسات-والأخطاء-الشائعة)
11. [الخلاصة والمراجع](#الخلاصة-والمراجع)
12. [البنية الهيكلية الكاملة لقسم المستخدمين](#12-البنية-الهيكلية-الكاملة-لقسم-المستخدمين-complete-user-system-architecture)

---

## 1. نظرة عامة على النظام

### 1.1 المفهوم الأساسي

نظام **Bulgarski Mobili** (New Globul Cars) يدعم ثلاثة أنواع من المستخدمين:

1. **بائع شخصي (Private User)** - للأفراد الذين يبيعون سياراتهم الشخصية
2. **تاجر سيارات (Dealer)** - للمعارض الصغيرة والمتوسطة
3. **شركة (Company)** - للشركات الكبيرة والمستوردين

### 1.2 الملفات الرئيسية

| الملف | الوصف | الموقع |
|------|------|--------|
| `bulgarian-user.types.ts` | **المصدر القياسي الوحيد** لتعريف الأنواع | `src/types/user/` |
| `ProfileTypeContext.tsx` | إدارة حالة النوع والثيم | `src/contexts/` |
| `ProfileService.ts` | الخدمات الأساسية للبروفايل | `src/services/profile/` |
| `ProfilePage/index.tsx` | صفحة البروفايل الرئيسية | `src/pages/03_user-pages/profile/` |

### 1.3 المبادئ الأساسية

- ✅ **Type Safety**: استخدام TypeScript Union Types (`BulgarianUser = PrivateProfile | DealerProfile | CompanyProfile`)
- ✅ **Single Source of Truth**: `bulgarian-user.types.ts` هو المصدر الوحيد
- ✅ **Real-time Sync**: استخدام Firestore `onSnapshot` للمزامنة الفورية
- ✅ **Validation**: التحقق من الشروط قبل التحويل بين الأنواع
- ✅ **Backward Compatibility**: دعم الحقول المتقادمة خلال فترة الانتقال

---

## 2. الأنواع الثلاثة للمستخدمين

### 2.1 بائع شخصي (Private Profile)

#### 2.1.1 التعريف
```typescript
interface PrivateProfile extends BaseProfile {
  profileType: 'private';
  planTier: 'free' | 'dealer' | 'company';
  egn?: string;  // Bulgarian personal ID (optional)
}
```

#### 2.1.2 الخصائص
- **الهدف**: الأفراد الذين يبيعون سياراتهم الشخصية
- **الخطة**: `free` (افتراضي)
- **الحد الأقصى للإعلانات**: **3 إعلانات نشطة**
- **التحقق**: Email, Phone (اختياري: EGN)
- **الثيم**: برتقالي (#FF8F10)
- **المكون**: `PrivateProfile.tsx`

#### 2.1.3 الميزات المتاحة
- ✅ إضافة إعلانات (حتى 3)
- ✅ عرض البروفايل الشخصي
- ✅ معرض صور شخصي (9 صور)
- ❌ لا يوجد Analytics
- ❌ لا يوجد Bulk Edit
- ❌ لا يوجد Quick Replies

#### 2.1.4 مثال على الاستخدام
```typescript
const user: PrivateProfile = {
  uid: 'user123',
  profileType: 'private',
  planTier: 'free',
  email: 'user@example.com',
  displayName: 'Иван Петров',
  stats: {
    activeListings: 2,
    totalListings: 5,
    totalViews: 150
  }
};
```

---

### 2.2 تاجر سيارات (Dealer Profile)

#### 2.2.1 التعريف
```typescript
interface DealerProfile extends BaseProfile {
  profileType: 'dealer';
  planTier: 'dealer';
  
  // ✅ NEW: Canonical reference
  dealershipRef?: `dealerships/${string}`;
  
  // ✅ NEW: Snapshot for quick display
  dealerSnapshot?: {
    nameBG: string;
    nameEN: string;
    logo?: string;
    status: 'pending' | 'verified' | 'rejected';
    address?: string;
    phone?: string;
    website?: string;
  };
  
  // ❌ DEPRECATED (migration period only)
  dealerInfo?: any;
  isDealer?: boolean;
}
```

#### 2.2.2 الخصائص
- **الهدف**: معارض السيارات الصغيرة والمتوسطة
- **الخطة**: `dealer`
- **الحد الأقصى للإعلانات**: **10 إعلانات نشطة**
- **التحقق**: Email, Phone, Business Documents
- **الثيم**: أخضر (#16a34a)
- **المكون**: `DealerProfile.tsx`
- **التخزين**: `users/{uid}` + `dealerships/{uid}`

#### 2.2.3 الميزات المتاحة
- ✅ إضافة إعلانات (حتى 10)
- ✅ صفحة بروفايل تجارية مع Logo و Map
- ✅ Analytics (Standard)
- ✅ Quick Replies في الرسائل
- ✅ Bulk Edit
- ✅ Priority Support
- ❌ لا يوجد Team Management
- ❌ لا يوجد API Access

#### 2.2.4 متطلبات التحويل
1. وجود `dealershipRef` في `users/{uid}`
2. وجود وثيقة في `dealerships/{uid}`
3. عدد الإعلانات النشطة ≤ 10
4. `planTier === 'dealer'`

#### 2.2.5 مثال على الاستخدام
```typescript
const dealer: DealerProfile = {
  uid: 'dealer123',
  profileType: 'dealer',
  planTier: 'dealer',
  dealershipRef: 'dealerships/dealer123',
  dealerSnapshot: {
    nameBG: 'Авто София',
    nameEN: 'Auto Sofia',
    logo: 'https://...',
    status: 'verified',
    address: 'ул. Витоша 15, София',
    phone: '+359888123456'
  },
  stats: {
    activeListings: 8,
    totalListings: 25,
    totalViews: 5000
  }
};
```

---

### 2.3 شركة (Company Profile)

#### 2.3.1 التعريف
```typescript
interface CompanyProfile extends BaseProfile {
  profileType: 'company';
  planTier: 'company';
  
  // ✅ NEW: Company reference
  companyRef?: `companies/${string}`;
  companySnapshot?: {
    nameBG: string;
    nameEN: string;
    logo?: string;
    status: 'pending' | 'verified' | 'rejected';
    address?: string;
    phone?: string;
    website?: string;
    vatNumber?: string;  // EIK
  };
}
```

#### 2.3.2 الخصائص
- **الهدف**: الشركات الكبيرة والمستوردين
- **الخطة**: `company`
- **الحد الأقصى للإعلانات**: **غير محدود (Unlimited)**
- **التحقق**: Email, Phone, Company Registration (EIK), VAT Number
- **الثيم**: أزرق (#1d4ed8)
- **المكون**: `CompanyProfile.tsx`
- **التخزين**: `users/{uid}` + `companies/{uid}`

#### 2.3.3 الميزات المتاحة
- ✅ إعلانات غير محدودة
- ✅ Team Management (إضافة مستخدمين فرعيين)
- ✅ Advanced Analytics (Views, Leads, Conversion Rates)
- ✅ API Access
- ✅ CSV Import/Export
- ✅ Bulk Edit
- ✅ Quick Replies
- ✅ Priority Support
- ✅ Campaign Management

#### 2.3.4 متطلبات التحويل
1. وجود `companyRef` في `users/{uid}`
2. وجود وثيقة في `companies/{uid}`
3. `planTier === 'company'`
4. لا يوجد حد للإعلانات النشطة

#### 2.3.5 مثال على الاستخدام
```typescript
const company: CompanyProfile = {
  uid: 'company123',
  profileType: 'company',
  planTier: 'company',
  companyRef: 'companies/company123',
  companySnapshot: {
    nameBG: 'Авто Импорт ЕООД',
    nameEN: 'Auto Import Ltd',
    logo: 'https://...',
    status: 'verified',
    address: 'бул. Цариградско шосе 125, София',
    phone: '+359700123456',
    vatNumber: 'BG123456789'
  },
  stats: {
    activeListings: 150,
    totalListings: 500,
    totalViews: 50000
  }
};
```

---

## 3. الهيكل التقني والكود

### 3.1 Type System (نظام الأنواع)

#### 3.1.1 Union Type
```typescript
// المصدر: src/types/user/bulgarian-user.types.ts
export type BulgarianUser =
  | PrivateProfile
  | DealerProfile
  | CompanyProfile;
```

#### 3.1.2 Type Guards
```typescript
// التحقق من النوع
export function isDealerProfile(user: BulgarianUser): user is DealerProfile {
  return user.profileType === 'dealer';
}

export function isCompanyProfile(user: BulgarianUser): user is CompanyProfile {
  return user.profileType === 'company';
}

export function isPrivateProfile(user: BulgarianUser): user is PrivateProfile {
  return user.profileType === 'private';
}

export function isBusinessProfile(user: BulgarianUser): user is DealerProfile | CompanyProfile {
  return user.profileType === 'dealer' || user.profileType === 'company';
}
```

#### 3.1.3 استخدام Type Guards
```typescript
function processUser(user: BulgarianUser) {
  if (isDealerProfile(user)) {
    // TypeScript يعرف أن user هو DealerProfile هنا
    console.log(user.dealershipRef);
  } else if (isCompanyProfile(user)) {
    // TypeScript يعرف أن user هو CompanyProfile هنا
    console.log(user.companyRef);
  } else {
    // TypeScript يعرف أن user هو PrivateProfile هنا
    console.log(user.egn);
  }
}
```

### 3.2 Context System (نظام السياق)

#### 3.2.1 ProfileTypeContext
```typescript
// المصدر: src/contexts/ProfileTypeContext.tsx
interface ProfileTypeContextState {
  profileType: ProfileType;
  theme: ProfileTheme;
  permissions: ProfilePermissions;
  planTier: PlanTier;
  loading: boolean;
  
  // Helper booleans
  isPrivate: boolean;
  isDealer: boolean;
  isCompany: boolean;
  
  // Actions
  switchProfileType: (newType: ProfileType) => Promise<void>;
  refreshProfileType: () => Promise<void>;
}
```

#### 3.2.2 استخدام Context
```typescript
import { useProfileType } from '../contexts/ProfileTypeContext';

function MyComponent() {
  const { profileType, theme, permissions, isDealer } = useProfileType();
  
  return (
    <div style={{ color: theme.primary }}>
      {isDealer && <DealerFeatures />}
      <p>Max Listings: {permissions.maxListings}</p>
    </div>
  );
}
```

### 3.3 Theme System (نظام الثيمات)

#### 3.3.1 تعريف الثيمات
```typescript
const THEMES: Record<ProfileType, ProfileTheme> = {
  private: {
    primary: '#FF8F10',     // Orange
    secondary: '#FFDF00',   // Yellow
    accent: '#FF7900',      // Dark Orange
    gradient: 'linear-gradient(135deg, ...)'
  },
  dealer: {
    primary: '#16a34a',     // Green
    secondary: '#22c55e',   // Light Green
    accent: '#15803d',      // Dark Green
    gradient: 'linear-gradient(135deg, #16a34a 0%, #22c55e 100%)'
  },
  company: {
    primary: '#1d4ed8',     // Blue
    secondary: '#3b82f6',   // Light Blue
    accent: '#1e40af',      // Dark Blue
    gradient: 'linear-gradient(135deg, #1d4ed8 0%, #3b82f6 100%)'
  }
};
```

#### 3.3.2 تطبيق الثيم
```typescript
// في المكونات
const { theme } = useProfileType();

<Button style={{ backgroundColor: theme.primary }}>
  Submit
</Button>
```

---

## 4. نظام الأذونات والحدود

### 4.1 Permissions Matrix (مصفوفة الأذونات)

| الميزة | Private (Free) | Dealer | Company |
|--------|---------------|--------|---------|
| **Max Listings** | 3 | 10 | Unlimited (-1) |
| **Analytics** | ❌ | ✅ Standard | ✅ Advanced |
| **Bulk Edit** | ❌ | ✅ | ✅ |
| **Quick Replies** | ❌ | ✅ | ✅ |
| **Team/Sub-users** | ❌ | ❌ | ✅ |
| **Export Data** | ❌ | ❌ | ✅ |
| **API Access** | ❌ | ❌ | ✅ |
| **CSV Import** | ❌ | ❌ | ✅ |
| **Priority Support** | ❌ | ✅ | ✅ |
| **Campaigns** | ❌ | ❌ | ✅ |

### 4.2 حساب الأذونات

```typescript
// المصدر: src/contexts/ProfileTypeContext.tsx
function getPermissions(profileType: ProfileType, planTier: PlanTier): ProfilePermissions {
  const PLAN_LIMITS: Record<PlanTier, number> = {
    free: 3,
    dealer: 10,
    company: -1  // unlimited
  };

  const maxListings = PLAN_LIMITS[planTier] || 3;

  // Base permissions for all
  const base: ProfilePermissions = {
    canAddListings: true,
    maxListings,
    hasAnalytics: false,
    hasAdvancedAnalytics: false,
    hasTeam: false,
    canExportData: false,
    hasPrioritySupport: false,
    canUseQuickReplies: false,
    canBulkEdit: false,
    canImportCSV: false,
    canUseAPI: false
  };

  // Dealer enhancements
  if (profileType === 'dealer' || planTier === 'dealer') {
    return {
      ...base,
      maxListings: 10,
      hasAnalytics: true,
      canUseQuickReplies: true,
      canBulkEdit: true,
      hasPrioritySupport: true
    };
  }

  // Company enhancements
  if (profileType === 'company' || planTier === 'company') {
    return {
      ...base,
      maxListings: -1,
      hasAnalytics: true,
      hasAdvancedAnalytics: true,
      hasTeam: true,
      canExportData: true,
      canUseQuickReplies: true,
      canBulkEdit: true,
      canImportCSV: true,
      canUseAPI: true,
      hasPrioritySupport: true
    };
  }

  return base;
}
```

### 4.3 التحقق من الحدود

```typescript
// قبل إضافة إعلان جديد
const { permissions } = useProfileType();
const { activeListings } = user.stats;

if (permissions.maxListings !== -1 && activeListings >= permissions.maxListings) {
  throw new Error(`You have reached the maximum limit of ${permissions.maxListings} listings`);
}
```

---

## 5. التحقق والثقة (Verification & Trust)

### 5.1 مستويات التحقق

```typescript
interface Verification {
  email: boolean;      // +10 points
  phone: boolean;      // +15 points
  id: boolean;         // +25 points (EGN for private, Business docs for dealer/company)
  business: boolean;   // +20 points (for dealer/company only)
}
```

### 5.2 Trust Score (درجة الثقة)

```typescript
interface Stats {
  totalListings: number;
  activeListings: number;
  totalViews: number;
  totalMessages: number;
  trustScore: number;  // Calculated from verification + activity
}
```

#### 5.2.1 حساب Trust Score
- Email Verified: +10
- Phone Verified: +15
- ID Verified: +25
- Business Verified: +20 (dealer/company only)
- Profile Completion: +10
- Reviews: +15
- Activity: +5

**المجموع الأقصى**: 100 نقطة

### 5.3 Badges (الشارات)

- ✅ **Email Verified**: البريد الإلكتروني مؤكد
- ✅ **Phone Verified**: رقم الهاتف مؤكد
- ✅ **ID Verified**: الهوية الشخصية مؤكدة
- ✅ **Business Verified**: الوثائق التجارية مؤكدة (للشركات)
- 🏆 **Trust Badge**: درجة ثقة عالية (≥80)

---

## 6. التحويل بين الأنواع

### 6.1 عملية التحويل

#### 6.1.1 التحقق قبل التحويل
```typescript
// المصدر: src/contexts/ProfileTypeContext.tsx
const switchProfileType = async (newType: ProfileType) => {
  // 1. Get current user data
  const userData = await UserRepository.getById(currentUser.uid);
  
  // 2. Validate dealer/company requirements
  if (newType === 'dealer') {
    if (!userData.dealershipRef) {
      throw new Error('Missing dealershipRef. Please complete dealership setup first.');
    }
    const dealershipDoc = await getDoc(doc(db, userData.dealershipRef));
    if (!dealershipDoc.exists()) {
      throw new Error('Dealership document not found.');
    }
  }
  
  if (newType === 'company') {
    if (!userData.companyRef) {
      throw new Error('Missing companyRef. Please complete company setup first.');
    }
    const companyDoc = await getDoc(doc(db, userData.companyRef));
    if (!companyDoc.exists()) {
      throw new Error('Company document not found.');
    }
  }
  
  // 3. Check active listings limit
  const activeListings = userData.stats?.activeListings || 0;
  const newPermissions = getPermissions(newType, planTier);
  
  if (newPermissions.maxListings !== -1 && activeListings > newPermissions.maxListings) {
    throw new Error(
      `Cannot switch: You have ${activeListings} active listings, ` +
      `but the new profile type only allows ${newPermissions.maxListings}.`
    );
  }
  
  // 4. Validate plan tier compatibility
  const validPlanTiers: Record<ProfileType, PlanTier[]> = {
    private: ['free'],
    dealer: ['dealer'],
    company: ['company']
  };
  
  // 5. All validations passed - switch profile type
  await updateDoc(doc(db, 'users', currentUser.uid), {
    profileType: newType,
    updatedAt: new Date()
  });
};
```

### 6.2 سيناريوهات التحويل

#### 6.2.1 Private → Dealer
**المتطلبات**:
1. إنشاء وثيقة في `dealerships/{uid}`
2. إضافة `dealershipRef` في `users/{uid}`
3. `activeListings ≤ 10`
4. `planTier = 'dealer'`

**الخطوات**:
```typescript
// 1. Create dealership document
const dealershipRef = doc(db, 'dealerships', uid);
await setDoc(dealershipRef, {
  nameBG: '...',
  nameEN: '...',
  address: '...',
  phone: '...',
  status: 'pending',
  createdAt: serverTimestamp()
});

// 2. Update user
await updateDoc(doc(db, 'users', uid), {
  profileType: 'dealer',
  dealershipRef: `dealerships/${uid}`,
  planTier: 'dealer'
});
```

#### 6.2.2 Dealer → Company
**المتطلبات**:
1. إنشاء وثيقة في `companies/{uid}`
2. إضافة `companyRef` في `users/{uid}`
3. `planTier = 'company'`
4. لا يوجد حد للإعلانات

**الخطوات**:
```typescript
// 1. Create company document
const companyRef = doc(db, 'companies', uid);
await setDoc(companyRef, {
  nameBG: '...',
  nameEN: '...',
  vatNumber: 'BG...',
  address: '...',
  status: 'pending',
  createdAt: serverTimestamp()
});

// 2. Update user
await updateDoc(doc(db, 'users', uid), {
  profileType: 'company',
  companyRef: `companies/${uid}`,
  planTier: 'company'
});
```

#### 6.2.3 Company/Dealer → Private
**المتطلبات**:
1. `activeListings ≤ 3`
2. `planTier = 'free'`

**الخطوات**:
```typescript
await updateDoc(doc(db, 'users', uid), {
  profileType: 'private',
  planTier: 'free',
  // Keep dealershipRef/companyRef for potential future upgrade
});
```

---

## 7. التخزين في Firestore

### 7.1 هيكل Collections

#### 7.1.1 `users` Collection
```
users/
  {uid}/
    - profileType: 'private' | 'dealer' | 'company'
    - planTier: 'free' | 'dealer' | 'company'
    - numericId: number
    - dealershipRef?: 'dealerships/{uid}'
    - companyRef?: 'companies/{uid}'
    - dealerSnapshot?: {...}
    - companySnapshot?: {...}
    - stats: {
        activeListings: number
        totalListings: number
        totalViews: number
        trustScore: number
      }
    - verification: {
        email: boolean
        phone: boolean
        id: boolean
        business: boolean
      }
    - ... (BaseProfile fields)
```

#### 7.1.2 `dealerships` Collection
```
dealerships/
  {uid}/
    - nameBG: string
    - nameEN: string
    - logo?: string
    - address: string
    - phone: string
    - website?: string
    - status: 'pending' | 'verified' | 'rejected'
    - createdAt: Timestamp
    - updatedAt: Timestamp
```

#### 7.1.3 `companies` Collection
```
companies/
  {uid}/
    - nameBG: string
    - nameEN: string
    - logo?: string
    - address: string
    - phone: string
    - website?: string
    - vatNumber?: string  // EIK
    - status: 'pending' | 'verified' | 'rejected'
    - createdAt: Timestamp
    - updatedAt: Timestamp
```

### 7.2 العلاقات (Relationships)

```
users/{uid}
  ├── dealershipRef → dealerships/{uid}  (for dealers)
  └── companyRef → companies/{uid}       (for companies)
```

### 7.3 Snapshot Pattern

لتحسين الأداء، يتم حفظ **snapshot** من بيانات `dealerships` و `companies` في `users/{uid}`:

```typescript
dealerSnapshot: {
  nameBG: string;
  nameEN: string;
  logo?: string;
  status: 'pending' | 'verified' | 'rejected';
  address?: string;
  phone?: string;
  website?: string;
}
```

**الفائدة**: تقليل عدد قراءات Firestore عند عرض البروفايل.

---

## 8. واجهة المستخدم والتصميم

### 8.1 المكونات الرئيسية

#### 8.1.1 ProfilePage
- **الموقع**: `src/pages/03_user-pages/profile/ProfilePage/index.tsx`
- **الوظيفة**: الصفحة الرئيسية للبروفايل
- **الميزات**:
  - عرض البروفايل حسب النوع
  - التبويبات (Overview, My-Ads, Campaigns, Analytics, Settings, Consultations)
  - ProfileTypeConfirmModal للتحويل بين الأنواع

#### 8.1.2 PrivateProfile
- **الموقع**: `src/pages/03_user-pages/profile/ProfilePage/components/PrivateProfile.tsx`
- **الثيم**: برتقالي (#FF8F10)
- **الميزات**: معرض صور شخصي، قائمة السيارات

#### 8.1.3 DealerProfile
- **الموقع**: `src/pages/03_user-pages/profile/ProfilePage/components/DealerProfile.tsx`
- **الثيم**: أخضر (#16a34a)
- **الميزات**: Logo، خريطة، معلومات تجارية، Reviews

#### 8.1.4 CompanyProfile
- **الموقع**: `src/pages/03_user-pages/profile/ProfilePage/components/CompanyProfile.tsx`
- **الثيم**: أزرق (#1d4ed8)
- **الميزات**: Team Management، Advanced Analytics، Campaigns

### 8.2 التبويبات (Tabs)

1. **Profile (Overview)**: نظرة عامة على البروفايل
2. **My Ads**: قائمة جميع الإعلانات
3. **Campaigns**: إدارة الحملات الإعلانية (للشركات)
4. **Analytics**: الإحصائيات والتحليلات
5. **Settings**: الإعدادات والخصوصية
6. **Consultations**: الاستشارات (جديد)

### 8.3 ProfileTypeConfirmModal

Modal للتحويل بين الأنواع مع:
- تحذيرات واضحة
- عرض المتطلبات
- التحقق من الحدود

---

## 9. التكامل مع الأنظمة الأخرى

### 9.1 Authentication System

```typescript
// AuthProvider → ProfileTypeProvider
// الترتيب مهم!
<AuthProvider>
  <ProfileTypeProvider>
    {/* App */}
  </ProfileTypeProvider>
</AuthProvider>
```

### 9.2 Car Listing System

```typescript
// عند إنشاء إعلان جديد
const { permissions } = useProfileType();
if (permissions.maxListings !== -1 && activeListings >= permissions.maxListings) {
  // Show upgrade modal
}
```

### 9.3 Billing System

```typescript
// Plan Tiers aligned with BillingService
const PLAN_LIMITS: Record<PlanTier, number> = {
  free: 3,
  dealer: 10,
  company: -1
};
```

### 9.4 Analytics System

```typescript
// Different analytics for different types
if (isDealer) {
  // Standard analytics
} else if (isCompany) {
  // Advanced analytics with team data
}
```

---

## 10. أفضل الممارسات والأخطاء الشائعة

### 10.1 ✅ أفضل الممارسات

1. **استخدم Type Guards دائماً**
   ```typescript
   // ✅ Good
   if (isDealerProfile(user)) {
     console.log(user.dealershipRef);
   }
   
   // ❌ Bad
   if (user.profileType === 'dealer') {
     console.log((user as DealerProfile).dealershipRef);
   }
   ```

2. **استخدم Context بدلاً من Props Drilling**
   ```typescript
   // ✅ Good
   const { profileType, theme } = useProfileType();
   
   // ❌ Bad
   <Component profileType={profileType} theme={theme} />
   ```

3. **تحقق من الحدود قبل الإجراءات**
   ```typescript
   // ✅ Good
   if (permissions.maxListings !== -1 && activeListings >= permissions.maxListings) {
     throw new Error('Limit reached');
   }
   ```

4. **استخدم Snapshot Pattern للبيانات الثابتة**
   ```typescript
   // ✅ Good
   const dealerName = user.dealerSnapshot?.nameBG;
   
   // ❌ Bad (unless real-time updates needed)
   const dealershipDoc = await getDoc(doc(db, user.dealershipRef));
   ```

### 10.2 ❌ الأخطاء الشائعة

1. **استخدام الحقول المتقادمة**
   ```typescript
   // ❌ Deprecated
   if (user.isDealer) { ... }
   if (user.dealerInfo) { ... }
   
   // ✅ Use instead
   if (isDealerProfile(user)) { ... }
   if (user.dealershipRef) { ... }
   ```

2. **عدم التحقق من النوع قبل الوصول للحقول**
   ```typescript
   // ❌ Error-prone
   console.log(user.dealershipRef);  // Might be undefined for private users
   
   // ✅ Safe
   if (isDealerProfile(user)) {
     console.log(user.dealershipRef);
   }
   ```

3. **نسيان التحقق من الحدود**
   ```typescript
   // ❌ Missing validation
   await createCar(carData);
   
   // ✅ With validation
   if (activeListings >= permissions.maxListings) {
     throw new Error('Limit reached');
   }
   await createCar(carData);
   ```

4. **عدم استخدام Real-time Listener**
   ```typescript
   // ❌ One-time fetch
   const userDoc = await getDoc(doc(db, 'users', uid));
   
   // ✅ Real-time updates
   const unsubscribe = onSnapshot(doc(db, 'users', uid), (doc) => {
     // Update state
   });
   ```

---

## 11. الخلاصة والمراجع

### 11.1 الملفات المرجعية

- **Types**: `src/types/user/bulgarian-user.types.ts`
- **Context**: `src/contexts/ProfileTypeContext.tsx`
- **Service**: `src/services/profile/ProfileService.ts`
- **Components**: `src/pages/03_user-pages/profile/ProfilePage/`

### 11.2 الوثائق المدمجة

تم دمج المعلومات من:
- `PROJECT_CONSTITUTION.md`
- `PROJECT_MASTER_REFERENCE_MANUAL.md`
- الكود الفعلي في المشروع
- الذاكرة المحفوظة (Memories)

### 11.3 التحديثات المستقبلية

- [ ] إزالة الحقول المتقادمة (`isDealer`, `dealerInfo`)
- [ ] تحسين Snapshot Pattern
- [ ] إضافة Team Management للشركات
- [ ] تحسين Trust Score Algorithm

---

## 12. البنية الهيكلية الكاملة لقسم المستخدمين (Complete User System Architecture)

### 12.1 هيكل المجلدات (Directory Structure)

```
src/
├── pages/03_user-pages/                    # صفحات المستخدمين
│   ├── profile/                            # نظام البروفايل
│   │   ├── ProfilePage/                   # الصفحة الرئيسية
│   │   │   ├── index.tsx                  # المكون الرئيسي (1711 سطر)
│   │   │   ├── ProfilePageWrapper.tsx     # Wrapper للتبويبات
│   │   │   ├── hooks/                     # Custom Hooks
│   │   │   │   ├── useProfile.ts          # Hook الرئيسي للبروفايل
│   │   │   │   ├── useProfileData.ts     # Hook لتحميل البيانات
│   │   │   │   └── useProfileActions.ts   # Hook للإجراءات (حفظ، تعديل)
│   │   │   ├── components/                # مكونات البروفايل حسب النوع
│   │   │   │   ├── PrivateProfile.tsx     # بروفايل شخصي (برتقالي)
│   │   │   │   ├── DealerProfile.tsx      # بروفايل تاجر (أخضر)
│   │   │   │   └── CompanyProfile.tsx     # بروفايل شركة (أزرق)
│   │   │   ├── tabs/                      # تبويبات البروفايل
│   │   │   │   ├── ProfileOverview.tsx    # نظرة عامة
│   │   │   │   ├── MyAdsTab.tsx           # إعلاناتي
│   │   │   │   ├── CampaignsTab.tsx       # الحملات
│   │   │   │   ├── AnalyticsTab.tsx       # التحليلات
│   │   │   │   ├── SettingsTab.tsx        # الإعدادات
│   │   │   │   └── PublicProfileView.tsx  # عرض البروفايل العام
│   │   │   ├── layout/                    # تخطيط الصفحة
│   │   │   │   ├── ProfileLayout.tsx      # التخطيط الرئيسي
│   │   │   │   ├── TabNavigation.tsx     # شريط التبويبات
│   │   │   │   └── CompactHeader.tsx     # رأس مدمج
│   │   │   └── types.ts                   # أنواع البيانات
│   │   └── components/
│   │       └── ProfileTypeSwitcher.tsx    # مبدل نوع البروفايل
│   ├── dashboard/                          # لوحة التحكم
│   ├── my-listings/                        # إعلاناتي
│   ├── my-drafts/                          # المسودات
│   ├── favorites/                          # المفضلة
│   ├── saved-searches/                     # عمليات البحث المحفوظة
│   ├── notifications/                      # الإشعارات
│   ├── messages/                           # الرسائل
│   ├── billing/                            # الفواتير والدفع
│   └── users-directory/                    # دليل المستخدمين
│
├── components/Profile/                     # مكونات البروفايل القابلة لإعادة الاستخدام
│   ├── ProfileDashboard.tsx               # لوحة تحكم البروفايل
│   ├── ProfileCompletion.tsx              # حساب نسبة الاكتمال
│   ├── ProfileGallery.tsx                  # معرض الصور (9 صور)
│   ├── ProfileTypeConfirmModal.tsx        # Modal تأكيد تغيير النوع
│   ├── VerificationPanel.tsx              # لوحة التحقق
│   ├── TrustBadge.tsx                     # شارة الثقة
│   ├── LEDProgressAvatar.tsx              # Avatar مع حلقة تقدم
│   ├── CoverImageUploader.tsx             # رفع صورة الغلاف
│   ├── SimpleProfileAvatar.tsx            # Avatar بسيط
│   ├── ProfileImageUploader.tsx           # رفع صورة البروفايل
│   ├── GarageCarousel.tsx                 # معرض السيارات (Carousel)
│   ├── GarageSection_Pro.tsx              # قسم الجراج (Grid)
│   ├── FollowButton.tsx                   # زر المتابعة
│   ├── ProfileActions.tsx                 # إجراءات البروفايل
│   ├── ProfileStats.tsx                   # إحصائيات البروفايل
│   ├── BusinessBackground.tsx             # خلفية تجارية
│   ├── IDReferenceHelper.tsx             # مساعد بطاقة الهوية
│   ├── IDCardEditor/                      # محرر بطاقة الهوية
│   ├── ProfileCards/                      # بطاقات البروفايل
│   │   ├── ProfilePhotoCard.tsx
│   │   ├── ContactDataCard.tsx
│   │   ├── LoginDataCard.tsx
│   │   ├── DocumentsCard.tsx
│   │   ├── IDCardVerificationCard.tsx
│   │   ├── VerificationBadge.tsx
│   │   └── DangerZoneCard.tsx
│   ├── Modals/                            # النوافذ المنبثقة
│   │   ├── EmailVerificationModal.tsx
│   │   ├── PhoneVerificationModal.tsx
│   │   ├── PhotoEditModal.tsx
│   │   ├── NameEditModal.tsx
│   │   ├── LocationEditModal.tsx
│   │   └── PasswordChangeModal.tsx
│   ├── Forms/                             # نماذج البروفايل
│   │   ├── DealershipProfileForm.tsx
│   │   └── CompanyProfileForm.tsx
│   ├── BusinessInfo/                       # معلومات تجارية
│   │   └── BusinessInformationForm.tsx
│   ├── Dealership/                        # معلومات المعرض
│   │   └── DealershipInfoForm.tsx
│   ├── Privacy/                           # إعدادات الخصوصية
│   │   └── PrivacySettingsManager.tsx
│   ├── Security/                          # الأمان
│   │   └── PrivacySettings.tsx
│   ├── SocialMedia/                       # وسائل التواصل
│   │   └── SocialMediaSettings.tsx
│   ├── Analytics/                         # التحليلات
│   │   └── ProfileAnalyticsDashboard.tsx
│   ├── Campaigns/                         # الحملات
│   │   ├── CampaignsList.tsx
│   │   ├── CampaignCard.tsx
│   │   └── CreateCampaignModal.tsx
│   └── Enhancements/                      # الميزات الإضافية
│       ├── AchievementsGallerySection.tsx
│       ├── AvailabilityCalendarSection.tsx
│       ├── CarStorySection.tsx
│       ├── ChallengesSection.tsx
│       ├── GroupsSection.tsx
│       ├── IntroVideoSection.tsx
│       ├── LeaderboardSection.tsx
│       ├── PointsLevelsSection.tsx
│       ├── SuccessStoriesSection.tsx
│       ├── TransactionsSection.tsx
│       └── TrustNetworkSection.tsx
│
├── services/                               # الخدمات
│   ├── profile/                           # خدمات البروفايل
│   │   ├── ProfileService.ts              # الخدمة الرئيسية
│   │   ├── UnifiedProfileService.ts       # خدمة موحدة
│   │   ├── bulgarian-profile-service.ts   # خدمة البروفايل البلغاري
│   │   ├── trust-score-service.ts         # خدمة درجة الثقة
│   │   ├── profile-stats.service.ts       # خدمة الإحصائيات
│   │   ├── profile-stats-service.ts       # خدمة الإحصائيات (نسخة أخرى)
│   │   ├── ProfileMediaService.ts         # خدمة الوسائط
│   │   ├── ProfileMigrationService.ts     # خدمة الترحيل
│   │   ├── PermissionsService.ts          # خدمة الأذونات
│   │   ├── VerificationWorkflowService.ts # خدمة سير عمل التحقق
│   │   ├── achievements-gallery.service.ts
│   │   ├── availability-calendar.service.ts
│   │   ├── car-story.service.ts
│   │   ├── challenges.service.ts
│   │   ├── groups.service.ts
│   │   ├── intro-video.service.ts
│   │   ├── leaderboard.service.ts
│   │   ├── points-automation.service.ts
│   │   ├── points-levels.service.ts
│   │   ├── success-stories.service.ts
│   │   ├── transactions.service.ts
│   │   └── trust-network.service.ts
│   ├── user/                              # خدمات المستخدم
│   │   └── canonical-user.service.ts      # الخدمة القياسية
│   ├── users/                             # خدمات المستخدمين (جمع)
│   │   └── users-directory.service.ts      # خدمة دليل المستخدمين
│   ├── google/                            # خدمات Google
│   │   └── google-profile-sync.service.ts # مزامنة Google
│   └── social/                            # خدمات اجتماعية
│       └── follow.service.ts              # خدمة المتابعة
│
├── repositories/                          # مستودعات البيانات
│   ├── UserRepository.ts                 # مستودع المستخدمين
│   ├── DealershipRepository.ts           # مستودع المعارض
│   ├── CompanyRepository.ts               # مستودع الشركات
│   └── index.ts                           # تصديرات موحدة
│
├── contexts/                              # السياقات (Contexts)
│   ├── ProfileTypeContext.tsx             # سياق نوع البروفايل
│   ├── AuthProvider.tsx                   # سياق المصادقة
│   └── LanguageContext.tsx                # سياق اللغة
│
├── hooks/                                 # Custom Hooks
│   ├── useProfile.ts                      # Hook البروفايل (في ProfilePage)
│   ├── useProfilePermissions.ts          # Hook الأذونات
│   ├── useCompleteProfile.ts              # Hook اكتمال البروفايل
│   ├── useProfileTracking.ts              # Hook تتبع البروفايل
│   └── useTranslation.tsx                 # Hook الترجمة
│
├── types/user/                            # أنواع البيانات
│   └── bulgarian-user.types.ts           # **المصدر القياسي الوحيد**
│
├── utils/                                 # أدوات مساعدة
│   ├── profile-completion.ts              # حساب نسبة الاكتمال
│   ├── validators/
│   │   └── profile-validators.ts         # التحقق من صحة البيانات
│   └── routing-utils.ts                   # أدوات التوجيه
│
└── routes/                                # التوجيه
    ├── NumericProfileRouter.tsx           # Router البروفايل الرقمي
    └── MainRoutes.tsx                     # المسارات الرئيسية
```

### 12.2 تدفق البيانات (Data Flow)

#### 12.2.1 تحميل البروفايل (Profile Loading Flow)

```
1. User navigates to /profile/:userId
   ↓
2. NumericProfileRouter resolves route
   ↓
3. ProfilePageWrapper renders
   ↓
4. useProfile(targetUserId) hook called
   ↓
5. Check if userId is numeric or Firebase UID
   ↓
6. If numeric → Convert to Firebase UID via getFirebaseUidByNumericId()
   ↓
7. Load user data from Firestore:
   - bulgarianAuthService.getUserProfileById(uid)
   - OR bulgarianAuthService.getCurrentUserProfile() (if own profile)
   ↓
8. Normalize user data (add defaults)
   ↓
9. Load user cars via unifiedCarService.getUserCars(uid)
   ↓
10. Setup real-time listener (onSnapshot) for own profile
   ↓
11. Return { user, userCars, loading, isOwnProfile, ... }
   ↓
12. ProfilePageWrapper renders appropriate component:
   - PrivateProfile (if profileType === 'private')
   - DealerProfile (if profileType === 'dealer')
   - CompanyProfile (if profileType === 'company')
```

#### 12.2.2 تحديث البروفايل (Profile Update Flow)

```
1. User clicks "Edit Profile"
   ↓
2. setEditing(true)
   ↓
3. User modifies formData
   ↓
4. User clicks "Save"
   ↓
5. handleSaveProfile() called
   ↓
6. Validate formData via validateProfileData()
   ↓
7. Build updateData object
   ↓
8. bulgarianAuthService.updateUserProfile(updateData)
   ↓
9. Firestore updateDoc() called
   ↓
10. Real-time listener triggers (onSnapshot)
   ↓
11. UI updates automatically
   ↓
12. Show success toast
```

### 12.3 الخدمات الرئيسية (Core Services)

#### 12.3.1 ProfileService
**الموقع**: `src/services/profile/ProfileService.ts`

**الوظائف الرئيسية**:
- `incrementActiveListings(uid)` - زيادة عدد الإعلانات النشطة
- `decrementActiveListings(uid)` - تقليل عدد الإعلانات النشطة
- `switchProfileType(uid, newType)` - تغيير نوع البروفايل
- `updateUserProfile(uid, data)` - تحديث بيانات المستخدم
- `getUserProfile(uid)` - جلب بيانات المستخدم

**الاستخدام**:
```typescript
import { ProfileService } from '../services/profile/ProfileService';

// عند إنشاء إعلان جديد
await ProfileService.incrementActiveListings(userId);

// عند حذف إعلان
await ProfileService.decrementActiveListings(userId);
```

#### 12.3.2 UnifiedProfileService
**الموقع**: `src/services/profile/UnifiedProfileService.ts`

**الوظائف الرئيسية**:
- `setupDealerProfile(userId, dealershipData)` - إعداد بروفايل تاجر
- `setupCompanyProfile(userId, companyData)` - إعداد بروفايل شركة
- `getDealershipInfo(dealershipId)` - جلب معلومات المعرض
- `updateDealershipInfo(dealershipId, updates)` - تحديث معلومات المعرض
- `uploadDealershipLogo(userId, file)` - رفع شعار المعرض

**الاستخدام**:
```typescript
import { UnifiedProfileService } from '../services/profile/UnifiedProfileService';

const profileService = UnifiedProfileService.getInstance();
await profileService.setupDealerProfile(userId, {
  dealershipNameBG: 'Авто София',
  address: 'Sofia, Bulgaria',
  licenseNumber: 'BG-12345'
});
```

#### 12.3.3 BulgarianProfileService
**الموقع**: `src/services/bulgarian-profile-service.ts`

**الوظائف الرئيسية**:
- `createCompleteProfile(userId, profileData, dealerData?)` - إنشاء بروفايل كامل
- `getUserProfileById(uid)` - جلب بروفايل بالمعرف
- `getCurrentUserProfile()` - جلب بروفايل المستخدم الحالي
- `updateUserProfile(data)` - تحديث البروفايل
- `uploadProfileImage(uid, file)` - رفع صورة البروفايل
- `updatePreferences(uid, preferences)` - تحديث التفضيلات

#### 12.3.4 TrustScoreService
**الموقع**: `src/services/profile/trust-score-service.ts`

**الوظائف الرئيسية**:
- `calculateTrustScore(uid)` - حساب درجة الثقة
- `getTrustLevel(score)` - الحصول على مستوى الثقة
- `getBadges(uid)` - الحصول على الشارات
- `updateVerificationStatus(uid, type, verified)` - تحديث حالة التحقق

**حساب Trust Score**:
```typescript
const score = await TrustScoreService.getInstance().calculateTrustScore(uid);
// Returns: 0-100
// Levels: UNVERIFIED (0-20), BASIC (21-40), TRUSTED (41-60), 
//         VERIFIED (61-80), PREMIUM (81-100)
```

#### 12.3.5 CanonicalUserService
**الموقع**: `src/services/user/canonical-user.service.ts`

**الوظائف الرئيسية**:
- `getUserProfile(userId, options?)` - جلب البروفايل (مع Cache)
- `getUserProfilesBatch(userIds)` - جلب عدة بروفايلات دفعة واحدة
- `updateUserProfile(userId, data)` - تحديث البروفايل
- `createUser(userId, data)` - إنشاء مستخدم جديد

**ميزة Cache**:
- TTL: 5 دقائق
- يقلل قراءات Firestore
- يمكن تخطي Cache بـ `{ skipCache: true }`

### 12.4 Custom Hooks (Hooks المخصصة)

#### 12.4.1 useProfile
**الموقع**: `src/pages/03_user-pages/profile/ProfilePage/hooks/useProfile.ts`

**الوظيفة**: Hook الرئيسي لإدارة البروفايل

**المعاملات**:
- `targetUserId?: string` - معرف المستخدم المستهدف (اختياري)

**القيم المُرجعة**:
```typescript
{
  user: BulgarianUser | null;           // المستخدم المستهدف
  target: BulgarianUser | null;         // نفس user (للتوافق)
  viewer: BulgarianUser | null;         // المستخدم الحالي (المشاهد)
  userCars: ProfileCar[];               // سيارات المستخدم
  loading: boolean;                     // حالة التحميل
  editing: boolean;                      // حالة التعديل
  formData: ProfileFormData;            // بيانات النموذج
  isOwnProfile: boolean;                // هل هو البروفايل الخاص؟
  error: string | null;                 // خطأ إن وجد
  
  // من ProfileTypeContext
  profileType: ProfileType;
  theme: ProfileTheme;
  permissions: ProfilePermissions;
  planTier: PlanTier;
  
  // Functions
  loadUserData: () => Promise<void>;
  refresh: () => Promise<void>;
  handleInputChange: (e) => void;
  handleSaveProfile: () => Promise<void>;
  handleCancelEdit: () => void;
  handleLogout: () => Promise<void>;
  setEditing: (editing: boolean) => void;
  setUser: (user) => void;
}
```

**الميزات**:
- ✅ دعم Numeric ID و Firebase UID
- ✅ Real-time updates (onSnapshot)
- ✅ Auto-assign numeric ID إذا كان مفقوداً
- ✅ تحميل السيارات تلقائياً
- ✅ Normalization للبيانات

#### 12.4.2 useProfileData
**الموقع**: `src/pages/03_user-pages/profile/ProfilePage/hooks/useProfileData.ts`

**الوظيفة**: Hook مبسط لتحميل بيانات البروفايل فقط

**القيم المُرجعة**:
```typescript
{
  user: BulgarianUser | null;
  loading: boolean;
  isOwnProfile: boolean;
  loadUserData: () => Promise<void>;
  setUser: (user) => void;
}
```

#### 12.4.3 useProfileActions
**الموقع**: `src/pages/03_user-pages/profile/ProfilePage/hooks/useProfileActions.ts`

**الوظيفة**: Hook للإجراءات (حفظ، تعديل، تسجيل خروج)

**القيم المُرجعة**:
```typescript
{
  editing: boolean;
  formData: ProfileFormData;
  setEditing: (editing: boolean) => void;
  setFormData: (data) => void;
  handleInputChange: (e) => void;
  handleSaveProfile: () => Promise<void>;
  handleCancelEdit: () => void;
  handleLogout: () => Promise<void>;
}
```

#### 12.4.4 useProfilePermissions
**الموقع**: `src/hooks/useProfilePermissions.ts`

**الوظيفة**: Hook للحصول على أذونات المستخدم

**المعاملات**:
- `profileNumericId: number | null`

**القيم المُرجعة**:
```typescript
{
  canAddListings: boolean;
  maxListings: number;
  hasAnalytics: boolean;
  // ... (جميع الأذونات)
}
```

#### 12.4.5 useCompleteProfile
**الموقع**: `src/hooks/useCompleteProfile.ts`

**الوظيفة**: Hook لحساب نسبة اكتمال البروفايل

**القيم المُرجعة**:
```typescript
{
  completion: number;        // 0-100
  missingFields: string[];   // الحقول المفقودة
  progressColor: string;      // لون التقدم
  progressMessage: string;     // رسالة التقدم
}
```

#### 12.4.6 useProfileTracking
**الموقع**: `src/hooks/useProfileTracking.ts`

**الوظيفة**: Hook لتتبع زيارات البروفايل

**المعاملات**:
- `profileUserId: string | undefined`

**الميزات**:
- تتبع عدد الزيارات
- تحديث `stats.totalViews` في Firestore
- تجنب التكرار (debounce)

### 12.5 Repositories (المستودعات)

#### 12.5.1 UserRepository
**الموقع**: `src/repositories/UserRepository.ts`

**الوظائف**:
- `getById(uid)` - جلب مستخدم بالمعرف
- `create(uid, data)` - إنشاء مستخدم
- `update(uid, data)` - تحديث مستخدم
- `updateWithTransaction(uid, updateFn)` - تحديث مع Transaction
- `delete(uid)` - حذف مستخدم
- `getByNumericId(numericId)` - جلب مستخدم بالمعرف الرقمي
- `getByEmail(email)` - جلب مستخدم بالبريد
- `getAll(filters?)` - جلب جميع المستخدمين

**الاستخدام**:
```typescript
import { UserRepository } from '../repositories/UserRepository';

const user = await UserRepository.getById(uid);
await UserRepository.update(uid, { displayName: 'New Name' });
```

#### 12.5.2 DealershipRepository
**الموقع**: `src/repositories/DealershipRepository.ts`

**الوظائف**:
- `getById(dealershipId)` - جلب معرض بالمعرف
- `create(dealershipId, data)` - إنشاء معرض
- `update(dealershipId, data)` - تحديث معرض
- `getByOwnerId(ownerId)` - جلب معرض بمعرف المالك

#### 12.5.3 CompanyRepository
**الموقع**: `src/repositories/CompanyRepository.ts`

**الوظائف**:
- `getById(companyId)` - جلب شركة بالمعرف
- `create(companyId, data)` - إنشاء شركة
- `update(companyId, data)` - تحديث شركة
- `getByOwnerId(ownerId)` - جلب شركة بمعرف المالك

### 12.6 Routing System (نظام التوجيه)

#### 12.6.1 NumericProfileRouter
**الموقع**: `src/routes/NumericProfileRouter.tsx`

**المسارات المدعومة**:
```
/profile                              → Auto-redirect to /profile/{numericId}
/profile/:userId                      → Profile overview
/profile/:userId/my-ads               → My Ads tab
/profile/:userId/campaigns            → Campaigns tab
/profile/:userId/analytics            → Analytics tab
/profile/:userId/settings             → Settings tab
/profile/:userId/consultations        → Consultations tab
/profile/:userId/car/:carId           → Car details
/profile/:userId/car/:carId/edit      → Edit car
```

**الميزات**:
- ✅ دعم Numeric ID و Firebase UID
- ✅ Auto-redirect للبروفايل الخاص
- ✅ Nested routes للتبويبات
- ✅ Backward compatibility

#### 12.6.2 ProfilePageWrapper
**الموقع**: `src/pages/03_user-pages/profile/ProfilePage/ProfilePageWrapper.tsx`

**الوظيفة**: Wrapper يوفر:
- Tab Navigation
- Cover Image
- Sidebar مع معلومات المستخدم
- Content area (`<Outlet />`) للتبويبات

**الميزات**:
- Auto-redirect `/profile` → `/profile/{numericId}`
- Follow/Unfollow functionality
- Google Profile Sync
- Profile Type Switcher

### 12.7 Profile Completion System (نظام اكتمال البروفايل)

#### 12.7.1 حساب النسبة
**الموقع**: `src/utils/profile-completion.ts`

**الوظيفة**: `calculateProfileCompletion(user, profileType)`

**الحقول المطلوبة حسب النوع**:

**Private (7 حقول = 100%)**:
- Email Verified: 20%
- Phone Verified: 20%
- Profile Photo: 15%
- Display Name: 10%
- Phone Number: 10%
- Address: 15%
- Bio (≥50 chars): 10%

**Dealer (9 حقول = 100%)**:
- Email Verified: 15%
- Phone Verified: 15%
- Business Name: 10%
- EIK/BULSTAT: 15%
- Business Address: 10%
- Logo/Photo: 10%
- Working Hours: 5%
- Services Description (≥100 chars): 10%
- Payment Setup: 10%

**Company (10 حقول = 100%)**:
- Email Verified: 10%
- Phone Verified: 10%
- Company Name: 10%
- EIK/BULSTAT Verified: 15%
- VAT Number: 10%
- Company Logo: 10%
- Headquarters Address: 10%
- Authorized Person: 10%
- Payment & Billing: 10%
- Team Setup: 5%

#### 12.7.2 Visual Indicators
- **LEDProgressAvatar**: Avatar مع حلقة تقدم متوهجة
- **ProfileCompletion**: مكون يعرض النسبة والحقول المفقودة
- **Progress Colors**:
  - < 50%: أحمر (#dc2626)
  - 50-80%: برتقالي (#f59e0b)
  - 80-100%: أزرق (#3b82f6)
  - 100%: أخضر (#16a34a)

### 12.8 Verification System (نظام التحقق)

#### 12.8.1 مستويات التحقق
```typescript
interface Verification {
  email: { verified: boolean; verifiedAt?: Date };
  phone: { verified: boolean; verifiedAt?: Date };
  identity: { verified: boolean; verifiedAt?: Date };
  business: { verified: boolean; verifiedAt?: Date };
}
```

#### 12.8.2 VerificationWorkflowService
**الموقع**: `src/services/profile/VerificationWorkflowService.ts`

**الوظائف**:
- `verifyEmail(uid)` - التحقق من البريد
- `verifyPhone(uid, code)` - التحقق من الهاتف
- `verifyIdentity(uid, documents)` - التحقق من الهوية
- `verifyBusiness(uid, documents)` - التحقق من الوثائق التجارية

#### 12.8.3 VerificationPanel Component
**الموقع**: `src/components/Profile/VerificationPanel.tsx`

**الميزات**:
- عرض حالة التحقق لكل مستوى
- أزرار لبدء عملية التحقق
- Badges للتحقق المكتمل
- Progress indicator

### 12.9 Profile Enhancements (الميزات الإضافية)

#### 12.9.1 Achievements Gallery
**الخدمة**: `src/services/profile/achievements-gallery.service.ts`
- معرض الإنجازات
- Badges مخصصة
- Progress tracking

#### 12.9.2 Points & Levels
**الخدمة**: `src/services/profile/points-levels.service.ts`
- نظام النقاط
- المستويات
- Rewards

#### 12.9.3 Leaderboard
**الخدمة**: `src/services/profile/leaderboard.service.ts`
- لوحة المتصدرين
- Rankings
- Categories

#### 12.9.4 Challenges
**الخدمة**: `src/services/profile/challenges.service.ts`
- التحديات
- Goals
- Completion tracking

#### 12.9.5 Trust Network
**الخدمة**: `src/services/profile/trust-network.service.ts`
- شبكة الثقة
- Recommendations
- Social proof

### 12.10 Integration Points (نقاط التكامل)

#### 12.10.1 مع نظام السيارات (Car System)
```typescript
// عند إنشاء إعلان جديد
await ProfileService.incrementActiveListings(userId);

// عند حذف إعلان
await ProfileService.decrementActiveListings(userId);

// عند بيع سيارة
await ProfileService.decrementActiveListings(userId);
```

#### 12.10.2 مع نظام الرسائل (Messaging System)
```typescript
// Quick Replies للـ Dealers
if (isDealer && permissions.canUseQuickReplies) {
  // Show quick replies UI
}
```

#### 12.10.3 مع نظام الدفع (Billing System)
```typescript
// Plan Tiers
const tier = user.planTier; // 'free' | 'dealer' | 'company'
const limits = PLAN_LIMITS[tier];
```

#### 12.10.4 مع نظام التحليلات (Analytics System)
```typescript
// Different analytics for different types
if (isDealer) {
  // Standard analytics
} else if (isCompany) {
  // Advanced analytics with team data
}
```

### 12.11 Performance Optimizations (تحسينات الأداء)

#### 12.11.1 Snapshot Pattern
- حفظ snapshot من `dealerships` و `companies` في `users/{uid}`
- تقليل قراءات Firestore
- تحديث Snapshot عند تغيير البيانات

#### 12.11.2 Caching
- `CanonicalUserService` يستخدم Cache (TTL: 5 دقائق)
- تقليل قراءات Firestore المتكررة

#### 12.11.3 Real-time Listeners
- استخدام `onSnapshot` فقط للبروفايل الخاص
- Cleanup listeners عند unmount

#### 12.11.4 Lazy Loading
- Lazy load للتبويبات
- Lazy load للصور
- Code splitting

### 12.12 Error Handling (معالجة الأخطاء)

#### 12.12.1 Validation
```typescript
// في useProfile
const validation = validateProfileData(formData, formData.accountType);
if (!validation.valid) {
  toast.error(Object.values(validation.errors).join('\n'));
  return;
}
```

#### 12.12.2 Error States
- `loading: boolean` - حالة التحميل
- `error: string | null` - رسالة الخطأ
- Fallback UI عند فشل التحميل

#### 12.12.3 Logging
- استخدام `logger` service لجميع العمليات
- Logging للأخطاء مع Context
- Debug logs في Development mode

---

## 13. Migration Guide (دليل الترحيل)

### 13.1 من الكود القديم إلى الجديد

#### 13.1.1 Profile Services
```typescript
// ❌ OLD: استخدام خدمات متعددة
import { ProfileService } from '../services/profile/ProfileService';
import { UnifiedProfileService } from '../services/profile/UnifiedProfileService';
import { bulgarianProfileService } from '../services/bulgarian-profile-service';

// ✅ NEW: استخدام unifiedProfileService (Recommended)
import { unifiedProfileService } from '../services/profile';

// Setup dealer profile
await unifiedProfileService.setupDealerProfile(userId, dealerData);
```

#### 13.1.2 Routing
```typescript
// ❌ OLD: استخدام UUID مباشرة
navigate(`/car-details/${carId}`);

// ✅ NEW: استخدام getCarDetailsUrl
import { getCarDetailsUrl } from '../utils/routing-utils';
navigate(getCarDetailsUrl(car));
```

#### 13.1.3 Type Safety
```typescript
// ❌ OLD: تعريف Types محلي
interface MyUser { ... }

// ✅ NEW: استخدام bulgarian-user.types.ts فقط
import type { BulgarianUser } from '../types/user/bulgarian-user.types';
```

---

## 14. Testing Strategy (استراتيجية الاختبار)

### 14.1 Unit Tests

#### 14.1.1 Services Tests
- **Location**: `src/services/profile/__tests__/`
- **Coverage Target**: > 80%
- **Files**:
  - `ProfileService.test.ts`
  - `UnifiedProfileService.test.ts`
  - `trust-score-service.test.ts`

#### 14.1.2 Hooks Tests
- **Location**: `src/pages/03_user-pages/profile/ProfilePage/hooks/__tests__/`
- **Coverage Target**: > 80%
- **Files**:
  - `useProfile.test.ts`
  - `useProfileData.test.ts`
  - `useProfileActions.test.ts`

#### 14.1.3 Utils Tests
- **Location**: `src/utils/__tests__/`
- **Coverage Target**: > 90%
- **Files**:
  - `profile-completion.test.ts`
  - `profile-validators.test.ts`

### 14.2 Integration Tests

#### 14.2.1 Profile Flow Tests
- تحميل البروفايل
- تحديث البروفايل
- تغيير نوع البروفايل

#### 14.2.2 Integration with Car System
- إنشاء إعلان → تحديث Stats
- حذف إعلان → تحديث Stats

### 14.3 Test Commands
```bash
# Run all tests
npm test

# Run profile tests only
npm test -- profile

# Run with coverage
npm test -- --coverage
```

---

## 15. Troubleshooting (حل المشاكل)

### 15.1 المشاكل الشائعة

#### 15.1.1 Profile Type Not Updating
**المشكلة**: تغيير نوع البروفايل لا يعمل

**الحل**:
1. تحقق من `ProfileTypeContext` listener
2. تحقق من Firestore permissions
3. تحقق من `planTier` compatibility

#### 15.1.2 Numeric ID Missing
**المشكلة**: `numericId` مفقود في البروفايل

**الحل**:
```typescript
import { ensureUserNumericId } from '../services/numeric-id-assignment.service';
const numericId = await ensureUserNumericId(userId);
```

#### 15.1.3 Real-time Updates Not Working
**المشكلة**: التحديثات الفورية لا تعمل

**الحل**:
1. تحقق من `onSnapshot` listener
2. تحقق من Cleanup في `useEffect`
3. تحقق من Firestore rules

### 15.2 Debugging Tips

#### 15.2.1 Enable Debug Logs
```typescript
// في Development mode
if (process.env.NODE_ENV === 'development') {
  logger.debug('Profile data', { user, profileType });
}
```

#### 15.2.2 Check Firestore Data
```typescript
// في Browser Console
const userDoc = await getDoc(doc(db, 'users', userId));
console.log('User data:', userDoc.data());
```

---

## 16. API Reference (مرجع API)

### 16.1 UnifiedProfileService

#### setupDealerProfile
```typescript
await unifiedProfileService.setupDealerProfile(
  userId: string,
  dealershipData: DealershipInfo
): Promise<void>
```

#### setupCompanyProfile
```typescript
await unifiedProfileService.setupCompanyProfile(
  userId: string,
  companyData: CompanyInfo
): Promise<void>
```

#### getDealershipInfo
```typescript
const dealer = await unifiedProfileService.getDealershipInfo(
  dealershipId: string
): Promise<DealershipInfo | null>
```

### 16.2 ProfileService (Legacy)

#### incrementActiveListings
```typescript
await ProfileService.incrementActiveListings(uid: string): Promise<void>
```

#### decrementActiveListings
```typescript
await ProfileService.decrementActiveListings(uid: string): Promise<void>
```

#### switchProfileType
```typescript
await ProfileService.switchProfileType(
  uid: string,
  newType: ProfileType
): Promise<void>
```

### 16.3 Hooks

#### useProfile
```typescript
const {
  user,
  userCars,
  loading,
  isOwnProfile,
  profileType,
  theme,
  permissions,
  loadUserData,
  handleSaveProfile
} = useProfile(targetUserId?: string);
```

#### useProfileType
```typescript
const {
  profileType,
  theme,
  permissions,
  planTier,
  isPrivate,
  isDealer,
  isCompany,
  switchProfileType
} = useProfileType();
```

---

## 17. Glossary (قاموس المصطلحات)

### مصطلحات عربية
- **بائع شخصي**: Private User - مستخدم فردي
- **تاجر سيارات**: Dealer - معرض سيارات
- **شركة**: Company - شركة كبيرة
- **التحقق**: Verification - عملية التأكيد
- **درجة الثقة**: Trust Score - مقياس الثقة
- **البروفايل**: Profile - الملف الشخصي
- **الإعلانات النشطة**: Active Listings - الإعلانات الحالية
- **المعرض**: Dealership - معرض السيارات

### مصطلحات إنجليزية
- **Profile Type**: نوع البروفايل (private/dealer/company)
- **Plan Tier**: مستوى الخطة (free/dealer/company)
- **Numeric ID**: المعرف الرقمي
- **Firebase UID**: معرف Firebase
- **Snapshot Pattern**: نمط Snapshot للبيانات
- **Type Guard**: حارس النوع في TypeScript
- **Real-time Listener**: مستمع التحديثات الفورية

---

## 📝 Changelog (سجل التغييرات)

### Version 2.0.0 (December 2025)
- ✅ **Added**: القسم 12 - البنية الهيكلية الكاملة لقسم المستخدمين
- ✅ **Updated**: جدول المحتويات ليشمل القسم 12
- ✅ **Enhanced**: تفاصيل شاملة عن جميع المكونات والخدمات
- ✅ **Added**: تدفق البيانات (Data Flow) بالتفصيل
- ✅ **Added**: Custom Hooks documentation
- ✅ **Added**: Repositories documentation
- ✅ **Added**: Routing System documentation
- ✅ **Added**: Profile Completion System documentation
- ✅ **Added**: Verification System documentation
- ✅ **Added**: Profile Enhancements documentation
- ✅ **Added**: Integration Points documentation
- ✅ **Added**: Performance Optimizations documentation
- ✅ **Added**: Error Handling documentation

### Version 1.0.0 (December 2025)
- ✅ **Initial Release**: التوثيق الأساسي للنظام
- ✅ **Added**: الأقسام 1-11
- ✅ **Added**: الأنواع الثلاثة للمستخدمين
- ✅ **Added**: نظام الأذونات والحدود
- ✅ **Added**: نظام التحقق والثقة
- ✅ **Added**: نظام التحويل بين الأنواع

---

**تم إنشاء هذا الملف**: December 2025  
**آخر تحديث**: December 2025  
**الحالة**: Production-Ready ✅  
**الإصدار**: 2.0.0