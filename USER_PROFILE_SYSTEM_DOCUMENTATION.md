# 📘 نظام المستخدم والأنواع الثلاثة - User Profile System Documentation
## توثيق شامل ومتكامل - Complete Integrated Documentation

> **Version**: 1.0.0  
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

**تم إنشاء هذا الملف**: December 2025  
**آخر تحديث**: December 2025  
**الحالة**: Production-Ready ✅

### User Profile
- **Pattern:** `/profile/{userId}`
- **Example:** `http://localhost:3000/profile/1`

### Vehicle Listing (Hierarchical Structure)
- **Pattern:** `/car/{userId}/{carLocalId}`
- **Logic:** The URL contains the User ID followed by the specific Car ID generated by that user.
- **Example:** `http://localhost:3000/car/1/1` (User 1, Car 1).

### Messaging System
- **Trigger:** Initiated from a Vehicle Page (`/car/1/1`) or Profile Page (`/profile/2`).
- **Flow:** When User B (`/profile/2`) visits User A's car (`/car/1/1`) and clicks "Message":
  - Open a dedicated chat context between User A and User B.
  - Context must preserve the reference to the specific car.