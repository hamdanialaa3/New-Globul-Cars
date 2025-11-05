# 🌟 CURRENT SYSTEM REALITY
## توثيق شامل للنظام الحالي - Profile, Posts & Users

**التاريخ:** نوفمبر 2025  
**الحالة:** ✅ Complete Documentation  
**الغرض:** نقطة مرجعية قبل أي تطوير

---

## 📋 جدول المحتويات

1. [BulgarianUser Interface](#1-bulgarianuser-interface)
2. [Profile Types System](#2-profile-types-system)
3. [Posts System](#3-posts-system)
4. [Components](#4-components)
5. [Services](#5-services)
6. [Firestore Structure](#6-firestore-structure)
7. [File Locations](#7-file-locations)

---

## 1. BulgarianUser Interface

### 1.1 الملف الرئيسي
**الموقع:** `bulgarian-car-marketplace/src/types/bulgarian-user.types.ts`

### 1.2 الحقول الأساسية (80+ Fields)

```typescript
interface BulgarianUser {
  // ============ BASIC INFO ============
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  displayName: string;
  photoURL?: string;
  coverImage?: string;
  
  // ============ PROFILE TYPE ============
  profileType: 'private' | 'dealer' | 'company';
  planTier: PlanTier;
  
  // ============ BULGARIAN SPECIFIC ============
  // Personal
  egn?: string;                    // 10-digit EGN
  idCardNumber?: string;           // ID card
  idCardIssueDate?: Timestamp;
  idCardExpiryDate?: Timestamp;
  dateOfBirth?: Timestamp;
  
  // Address
  address?: {
    street: string;
    city: string;
    municipality: string;
    province: string;
    postalCode: string;
    country: 'BG';
  };
  
  // Phone
  phoneNumber?: string;
  phoneCountryCode?: string;       // +359
  
  // Business Registration
  bulstatNumber?: string;          // 9-13 digits
  eikNumber?: string;              // 9 digits
  vatNumber?: string;              // BG + 9 digits
  companyRegNumber?: string;
  legalForm?: 'EOOD' | 'OOD' | 'AD' | 'SOLE_TRADER' | 'ET';
  
  // ============ VERIFICATION ============
  isEmailVerified: boolean;
  isPhoneVerified: boolean;
  isIDVerified: boolean;
  isBusinessVerified: boolean;
  idVerificationStatus: 'pending' | 'verified' | 'rejected';
  businessVerificationStatus: 'pending' | 'verified' | 'rejected';
  
  // ID Upload
  idCardFrontImage?: string;       // URL
  idCardBackImage?: string;        // URL
  idCardUploadedAt?: Timestamp;
  
  // ============ DEALER/COMPANY INFO ============
  dealershipInfo?: {
    // Names
    dealershipNameBG: string;
    dealershipNameEN: string;
    description: string;
    
    // Legal
    legalForm: 'EOOD' | 'OOD' | 'AD' | 'SOLE_TRADER' | 'ET';
    vatNumber: string;
    companyRegNumber: string;
    
    // Contact
    businessAddress: Address;
    businessPhone: string;
    businessEmail: string;
    website?: string;
    
    // Hours
    workingHours: {
      [key in 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday']: {
        isOpen: boolean;
        openTime?: string;  // "09:00"
        closeTime?: string; // "18:00"
      };
    };
    
    // Services
    services: {
      financing: boolean;
      warranty: boolean;
      tradeIn: boolean;
      delivery: boolean;
      service: boolean;
      bodyShop: boolean;
      towing: boolean;
      rentCar: boolean;
    };
    
    // Social & Branding
    logo?: string;
    coverImage?: string;
    socialMedia?: {
      facebook?: string;
      instagram?: string;
      tiktok?: string;
      linkedin?: string;
      youtube?: string;
    };
  };
  
  companyInfo?: {
    fleetSize?: number;
    bulstatNumber: string;
    eikNumber: string;
    vatNumber: string;
    departments?: string[];
  };
  
  // ============ PERMISSIONS & LIMITS ============
  permissions: {
    maxListings: number;
    hasAnalytics: boolean;
    hasCampaigns: boolean;
    hasTeam: boolean;
    hasAPI: boolean;
    canImportCSV: boolean;
    canExportData: boolean;
    hasPrioritySupport: boolean;
  };
  
  // ============ SUBSCRIPTION ============
  subscription?: {
    planId: string;
    status: 'active' | 'cancelled' | 'expired';
    startDate: Timestamp;
    endDate: Timestamp;
    autoRenew: boolean;
    stripeCustomerId?: string;
    stripeSubscriptionId?: string;
  };
  
  // ============ STATISTICS ============
  stats: {
    totalListings: number;
    activeListings: number;
    totalViews: number;
    totalMessages: number;
    totalReviews: number;
    averageRating: number;
    trustScore: number;
  };
  
  // ============ SOCIAL FEATURES ============
  followers?: string[];            // User IDs
  following?: string[];
  followersCount: number;
  followingCount: number;
  
  // Gallery
  galleryImages?: string[];        // Max 9 images
  
  // Reviews
  reviews?: {
    total: number;
    average: number;
    breakdown: {
      5: number;
      4: number;
      3: number;
      2: number;
      1: number;
    };
  };
  
  // ============ PRIVACY ============
  privacySettings?: {
    showEmail: boolean;
    showPhone: boolean;
    showAddress: boolean;
    showStats: boolean;
    allowMessages: boolean;
    allowReviews: boolean;
  };
  
  // ============ TIMESTAMPS ============
  createdAt: Timestamp;
  updatedAt: Timestamp;
  lastLoginAt?: Timestamp;
  
  // ============ FLAGS ============
  isActive: boolean;
  isBanned: boolean;
  isFeatured: boolean;
  isVerifiedSeller: boolean;
}
```

---

## 2. Profile Types System

### 2.1 الأنواع الثلاثة

#### 🟠 Private Profile
```typescript
{
  profileType: 'private',
  planTier: 'free' | 'premium',
  permissions: {
    maxListings: 3,      // free
    hasAnalytics: false,
    hasTeam: false,
    hasAPI: false
  }
}
```

#### 🟢 Dealer Profile
```typescript
{
  profileType: 'dealer',
  planTier: 'dealer_basic' | 'dealer_pro' | 'dealer_enterprise',
  dealershipInfo: { /* required */ },
  permissions: {
    maxListings: 50 | 150 | 500,
    hasAnalytics: true,
    hasTeam: true,
    hasAPI: true  // pro & enterprise only
  }
}
```

#### 🔵 Company Profile
```typescript
{
  profileType: 'company',
  planTier: 'company_starter' | 'company_pro' | 'company_enterprise',
  companyInfo: { /* required */ },
  permissions: {
    maxListings: 100 | 300 | 1000,
    hasAnalytics: true,
    hasTeam: true,
    hasAPI: true
  }
}
```

### 2.2 ProfileTypeContext
**الموقع:** `src/contexts/ProfileTypeContext.tsx`

```typescript
const ProfileTypeContext = createContext<{
  profileType: ProfileType;
  setProfileType: (type: ProfileType) => void;
  switchProfileType: (newType: ProfileType) => Promise<void>;
  themeColor: string;
}>
```

**الألوان:**
- Private: `#FF8F10` (Orange)
- Dealer: `#16a34a` (Green)
- Company: `#1d4ed8` (Blue)

---

## 3. Posts System

### 3.1 Post Interface
**الموقع:** `src/types/post.types.ts`

```typescript
interface Post {
  // Basic
  id: string;
  userId: string;
  content: string;
  
  // Media
  images?: string[];
  videos?: string[];
  
  // Car Listing
  carListing?: {
    carId: string;
    make: string;
    model: string;
    year: number;
    price: number;
    mileage: number;
    thumbnail: string;
  };
  
  // Location
  location?: {
    coordinates: {
      lat: number;
      lng: number;
    };
    address?: string;
    city?: string;
    region?: string;
  };
  
  // Engagement
  likes: string[];           // User IDs
  likesCount: number;
  comments: Comment[];
  commentsCount: number;
  shares: number;
  views: number;
  
  // Timestamps
  createdAt: Timestamp;
  updatedAt: Timestamp;
  
  // Status
  isActive: boolean;
  isPinned: boolean;
  isPromoted: boolean;
}
```

### 3.2 Posts Components

#### PostCard
**الموقع:** `src/components/Posts/PostCard.tsx`

**الميزات:**
- عرض المنشور مع الصور/الفيديو
- زر الإعجاب/التعليق/المشاركة
- عرض car listing إذا وجد
- خريطة Google Maps للموقع
- عرض اسم وصورة الناشر

#### CreatePost
**الموقع:** `src/components/Posts/CreatePost.tsx`

**الميزات:**
- إنشاء منشور نصي
- رفع صور (max 10)
- ربط إعلان سيارة
- إضافة موقع GPS

### 3.3 Posts Service
**الموقع:** `src/services/social/posts.service.ts`

```typescript
class PostsService {
  async createPost(post: CreatePostDto): Promise<string>
  async getPost(postId: string): Promise<Post>
  async getUserPosts(userId: string): Promise<Post[]>
  async getFeedPosts(userId: string, limit: number): Promise<Post[]>
  async likePost(postId: string, userId: string): Promise<void>
  async unlikePost(postId: string, userId: string): Promise<void>
  async deletePost(postId: string, userId: string): Promise<void>
  async uploadImages(files: File[]): Promise<string[]>
}
```

---

## 4. Components

### 4.1 Profile Components

#### ProfilePage (Main)
**الموقع:** `src/pages/ProfilePage/index.tsx`  
**الحجم:** 1711 سطر

**الأقسام:**
- **Tabs (6):**
  1. Profile (Overview)
  2. My Ads
  3. Campaigns
  4. Analytics
  5. Settings
  6. Consultations

**المكونات الفرعية:**
- `LEDProgressAvatar` - صورة الملف الشخصي مع حلقة التقدم
- `CoverImageUploader` - رفع صورة الغلاف
- `ProfileGallery` - معرض 9 صور
- `VerificationPanel` - شارات التحقق
- `TrustBadge` - درجة الثقة
- `ProfileCompletion` - نسبة اكتمال الملف

#### ProfileDashboard
**الموقع:** `src/components/Profile/ProfileDashboard.tsx`

**يعرض:**
- حلقة اكتمال الملف الشخصي
- إحصائيات (المشاهدات، الإعلانات، الرسائل)
- روابط سريعة

#### DealershipInfoForm
**الموقع:** `src/components/Profile/Dealership/DealershipInfoForm.tsx`  
**الحجم:** 670 سطر

**الحقول:**
- معلومات المعرض (BG/EN)
- Legal form & registration
- ساعات العمل (7 أيام)
- الخدمات (8 خدمات)
- Social media links

### 4.2 Verification Components

#### IDCardEditor
**الموقع:** `src/components/Profile/IDCardEditor/index.tsx`

**الميزات:**
- رفع صورة الهوية
- استخراج البيانات بواسطة OCR
- تحرير البيانات فوق الصورة
- مرجع للهوية البلغارية

#### VerificationPanel
**الموقع:** `src/components/Profile/VerificationPanel.tsx`

**الشارات:**
- ✅ Email Verified
- ✅ Phone Verified
- ✅ ID Verified
- ✅ Business Verified

### 4.3 Settings Components

#### ProfileSettings
**الموقع:** `src/pages/ProfilePage/ProfileSettings.tsx`

**الأقسام:**
- Profile Photo
- Contact Data
- Login Data
- ID Verification
- Business Documents
- Danger Zone

#### PrivacySettingsManager
**الموقع:** `src/components/Profile/Privacy/PrivacySettingsManager.tsx`

**الإعدادات:**
- إظهار/إخفاء البريد الإلكتروني
- إظهار/إخفاء رقم الهاتف
- السماح بالرسائل
- السماح بالمراجعات

---

## 5. Services

### 5.1 Profile Services

#### bulgarian-profile-service.ts
**الموقع:** `src/services/bulgarian-profile-service.ts`

```typescript
class BulgarianProfileService {
  async getProfile(userId: string): Promise<BulgarianUser>
  async updateProfile(userId: string, data: Partial<BulgarianUser>): Promise<void>
  async uploadProfilePhoto(file: File): Promise<string>
  async uploadCoverImage(file: File): Promise<string>
  async verifyEGN(egn: string): boolean
  async verifyBulstat(bulstat: string): boolean
  async submitIDVerification(frontImage: File, backImage: File): Promise<void>
}
```

#### profile-stats-service.ts
**الموقع:** `src/services/profile/profile-stats-service.ts`

```typescript
class ProfileStatsService {
  async getStats(userId: string): Promise<ProfileStats>
  async incrementViews(userId: string): Promise<void>
  async updateListingsCount(userId: string): Promise<void>
  async calculateTrustScore(userId: string): Promise<number>
}
```

#### trust-score-service.ts
**الموقع:** `src/services/profile/trust-score-service.ts`

**حساب Trust Score:**
```typescript
trust Score = 
  + Email Verified (10 points)
  + Phone Verified (15 points)
  + ID Verified (25 points)
  + Business Verified (30 points)
  + Profile Complete (20 points)
  + Active Listings (10 points)
  + Positive Reviews (20 points max)
  - Negative Reviews (-5 each)
  
Max: 100 points
```

### 5.2 Dealership Service

#### dealership.service.ts
**الموقع:** `src/services/dealership/dealership.service.ts`  
**الحجم:** 420 سطر

```typescript
class DealershipService {
  async saveDealershipInfo(userId: string, info: DealershipInfo): Promise<void>
  async getDealershipInfo(userId: string): Promise<DealershipInfo>
  async updateWorkingHours(userId: string, hours: WorkingHours): Promise<void>
  async updateServices(userId: string, services: Services): Promise<void>
  async uploadLogo(file: File): Promise<string>
}
```

### 5.3 ID Verification Service

#### id-verification-service.ts
**الموقع:** `src/services/id-verification-service.ts`

```typescript
class IDVerificationService {
  async uploadIDCard(frontImage: File, backImage: File): Promise<void>
  async extractDataFromID(imageUrl: string): Promise<IDCardData>
  async verifyEGN(egn: string): boolean
  async verifyIDCard(idCardNumber: string): boolean
  async submitForReview(userId: string): Promise<void>
}
```

**EGN Validation:**
- 10 أرقام
- أول 6 أرقام = YYMMDD (تاريخ الميلاد)
- 3 أرقام تسلسلية
- رقم أخير = checksum

---

## 6. Firestore Structure

### 6.1 Collections

#### users/{userId}
```typescript
{
  id: string,
  email: string,
  profileType: 'private' | 'dealer' | 'company',
  // ... جميع حقول BulgarianUser
  
  // Subcollections:
  // - posts/{postId}
  // - cars/{carId}
  // - conversations/{conversationId}
  // - notifications/{notificationId}
}
```

#### posts/{postId}
```typescript
{
  id: string,
  userId: string,
  content: string,
  images: string[],
  carListing?: CarListingPreview,
  location?: Location,
  likes: string[],
  likesCount: number,
  commentsCount: number,
  createdAt: Timestamp,
  
  // Subcollection:
  // - comments/{commentId}
}
```

#### cars/{carId}
```typescript
{
  id: string,
  userId: string,
  make: string,
  model: string,
  year: number,
  price: number,
  images: string[],
  status: 'active' | 'sold' | 'inactive',
  createdAt: Timestamp,
  // ... complete car data
}
```

### 6.2 Security Rules

```javascript
// Users can only edit their own profile
match /users/{userId} {
  allow read: if true;
  allow write: if request.auth.uid == userId;
}

// Users can only create posts as themselves
match /posts/{postId} {
  allow read: if true;
  allow create: if request.auth.uid == request.resource.data.userId;
  allow update, delete: if request.auth.uid == resource.data.userId;
}

// Dealer-specific rules
match /users/{userId} {
  allow update: if request.auth.uid == userId && 
    (resource.data.profileType == 'dealer' 
      ? request.resource.data.dealershipInfo != null 
      : true);
}
```

---

## 7. File Locations

### 7.1 Types
```
src/types/
├── bulgarian-user.types.ts    (BulgarianUser interface)
├── post.types.ts              (Post interface)
├── dealership.types.ts        (DealershipInfo)
├── billing.types.ts           (Plan, Subscription)
└── AdvancedProfile.ts         (Extended profile types)
```

### 7.2 Components
```
src/components/Profile/
├── ProfileDashboard.tsx       (1711 lines - Main profile page)
├── LEDProgressAvatar.tsx      (Animated avatar)
├── CoverImageUploader.tsx     (Cover image)
├── ProfileGallery.tsx         (9-image gallery)
├── VerificationPanel.tsx      (Verification badges)
├── TrustBadge.tsx             (Trust score gauge)
├── ProfileCompletion.tsx      (Completion tracker)
├── IDCardEditor/              (ID verification)
│   ├── index.tsx
│   ├── field-definitions.ts
│   └── types.ts
├── Dealership/
│   └── DealershipInfoForm.tsx (670 lines)
└── Privacy/
    └── PrivacySettingsManager.tsx
```

### 7.3 Services
```
src/services/
├── bulgarian-profile-service.ts
├── profile/
│   ├── profile-stats-service.ts
│   ├── trust-score-service.ts
│   └── image-processing-service.ts
├── dealership/
│   └── dealership.service.ts  (420 lines)
├── id-verification-service.ts
├── social/
│   └── posts.service.ts
└── billing/
    └── billing.service.ts
```

### 7.4 Pages
```
src/pages/ProfilePage/
├── index.tsx                  (1711 lines - Main)
├── ProfileSettings.tsx
├── ProfileAnalytics.tsx
├── ProfileCampaigns.tsx
├── ConsultationsTab.tsx
├── hooks/
│   └── useProfile.ts
├── components/
│   ├── PrivateProfile.tsx
│   ├── DealerProfile.tsx
│   └── CompanyProfile.tsx
└── styles.ts
```

### 7.5 Contexts
```
src/contexts/
└── ProfileTypeContext.tsx     (Profile type management)
```

---

## 8. Hooks

### 8.1 useProfile
**الموقع:** `src/pages/ProfilePage/hooks/useProfile.ts`

```typescript
const useProfile = (userId?: string) => {
  const [profile, setProfile] = useState<BulgarianUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  
  // Real-time sync with Firestore
  useEffect(() => {
    const unsubscribe = onSnapshot(
      doc(db, 'users', userId),
      (doc) => setProfile(doc.data() as BulgarianUser)
    );
    return unsubscribe;
  }, [userId]);
  
  return { profile, loading, error };
};
```

### 8.2 useProfileType
**الموقع:** `src/contexts/ProfileTypeContext.tsx`

```typescript
const useProfileType = () => {
  const context = useContext(ProfileTypeContext);
  
  return {
    profileType: context.profileType,
    themeColor: context.themeColor,
    switchProfileType: context.switchProfileType
  };
};
```

---

## 9. Key Features

### 9.1 Profile Features
- ✅ 3 Profile Types (Private, Dealer, Company)
- ✅ Dynamic Theme Colors
- ✅ 6-Tab Navigation
- ✅ Profile Completion Tracker
- ✅ LED Progress Avatar
- ✅ Cover Image & Gallery (9 photos)
- ✅ Verification System (Email, Phone, ID, Business)
- ✅ Trust Score (0-100)
- ✅ Follow/Unfollow System
- ✅ Reviews & Ratings

### 9.2 Dealer Features
- ✅ Dealership Info Form (BG/EN)
- ✅ Working Hours (7 days)
- ✅ Services Management (8 services)
- ✅ Logo & Branding
- ✅ Social Media Links
- ✅ Team Management
- ✅ Analytics Dashboard

### 9.3 Posts Features
- ✅ Create Text Posts
- ✅ Upload Images (max 10)
- ✅ Link Car Listings
- ✅ Add GPS Location
- ✅ Like/Comment/Share
- ✅ View Counter
- ✅ Real-time Updates

---

## 10. Plan Tiers

### Private Plans
1. **free** - 3 listings, basic features
2. **premium** - 10 listings, priority support, €9.99/month

### Dealer Plans
1. **dealer_basic** - 50 listings, analytics, €49/month
2. **dealer_pro** - 150 listings, CSV import, API, €99/month
3. **dealer_enterprise** - 500 listings, full API, €199/month

### Company Plans
1. **company_starter** - 100 listings, €79/month
2. **company_pro** - 300 listings, advanced analytics, €149/month
3. **company_enterprise** - 1000 listings, custom solutions, €299/month

---

## 11. Integration Points

### 11.1 Firebase
- **Authentication:** Google, Facebook, Email/Password
- **Firestore:** Real-time database
- **Storage:** Images & documents
- **Hosting:** fire-new-globul.web.app
- **Cloud Functions:** Backend logic

### 11.2 External Services
- **Google Maps:** Location display
- **Stripe:** Payment processing (planned)
- **OCR:** ID card data extraction (planned)
- **SMS:** Phone verification

### 11.3 Social Media
- **Facebook:** Social login, page integration
- **Instagram:** @globulnet
- **TikTok:** @globulnet

---

## 12. Known Issues & TODOs

### Current Issues:
1. ⚠️ No strict type checking between profile types
2. ⚠️ Dealership info optional for dealers (should be required)
3. ⚠️ No validation for plan tier permissions
4. ⚠️ Trust score calculation not optimized

### Future Improvements:
1. 🔄 Separate interfaces for each profile type
2. 🔄 Type guards for profile validation
3. 🔄 Service layer separation
4. 🔄 Better error handling
5. 🔄 Performance optimization

---

## 📊 Statistics

- **Total Lines of Code:** ~15,000+
- **Components:** 50+
- **Services:** 15+
- **Types/Interfaces:** 30+
- **Firebase Collections:** 6
- **Supported Languages:** 2 (BG, EN)
- **Profile Types:** 3
- **Plan Tiers:** 9
- **Verification Levels:** 4

---

## 🎯 Next Steps

بعد فهم النظام الحالي، انتقل إلى:

1. **[PROFILE_TYPES_SEPARATION_PLAN_PRIORITIZED.md](./PROFILE_TYPES_SEPARATION_PLAN_PRIORITIZED.md)**
   - فهم خطة التطوير
   
2. **[ANALYSIS_AND_CHANGES_SUMMARY.md](./ANALYSIS_AND_CHANGES_SUMMARY.md)**
   - معرفة القرارات والتغييرات

3. **ابدأ التنفيذ!**
   - Phase 1: Core Interfaces & Types

---

**آخر تحديث:** نوفمبر 2025  
**الإصدار:** v1.0  
**الحالة:** ✅ Production - Ready for Refactoring

