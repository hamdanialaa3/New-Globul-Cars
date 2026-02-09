# وثيقة المواصفات الكاملة - تطبيق Koli One للموبايل
# KOLI ONE MOBILE APP - COMPLETE SPECIFICATION DOCUMENT

**التاريخ:** 25 يناير 2026  
**الإصدار:** 1.0.0  
**الغرض:** دليل شامل 100% لبناء تطبيق موبايل مطابق للمشروع الأصلي  
**المصدر:** CONSTITUTION.md + وثائق المشروع الأصلي + Firebase Configuration

---

## جدول المحتويات

1. [أساسيات المشروع](#1-أساسيات-المشروع)
2. [نظام الروابط والمعرفات](#2-نظام-الروابط-والمعرفات-numeric-id-system)
3. [المصادقة والمستخدمون](#3-المصادقة-والمستخدمون)
4. [بنية قاعدة البيانات](#4-بنية-قاعدة-البيانات-firestore)
5. [الوظائف الأساسية](#5-الوظائف-الأساسية-features)
6. [خدمات البحث](#6-خدمات-البحث)
7. [نظام الرسائل](#7-نظام-الرسائل)
8. [الاشتراكات والدفع](#8-الاشتراكات-والدفع)
9. [التصميم والألوان](#9-التصميم-والألوان)
10. [التوطين i18n](#10-التوطين-i18n)
11. [Cloud Functions](#11-cloud-functions)
12. [قواعد الأمان](#12-قواعد-الأمان-security-rules)
13. [هيكل المشروع للموبايل](#13-هيكل-المشروع-للموبايل)
14. [خطة التنفيذ](#14-خطة-التنفيذ-المرحلية)
15. [قواعد الدستور الملزمة](#15-قواعد-الدستور-الملزمة)

---

# 1. أساسيات المشروع

## 1.1 معلومات عامة

| العنصر | القيمة |
|--------|--------|
| **اسم المشروع** | Koli One (كولي وان) |
| **الدومين** | https://koli.one |
| **Firebase Project** | fire-new-globul |
| **الموقع الجغرافي** | جمهورية بلغاريا |
| **اللغات** | البلغارية (bg) - رئيسية، الإنجليزية (en) - ثانوية |
| **العملة** | يورو (EUR) فقط |
| **رمز الهاتف** | +359 (بلغاريا) |
| **Firebase Region** | europe-west1 |
| **Algolia Index** | cars_bg |
| **GitHub** | github.com/hamdanialaa3/New-Globul-Cars |

## 1.2 الغرض من التطبيق

سوق سيارات رقمي متكامل يشمل:
- بيع وشراء السيارات المستعملة والجديدة
- نظام إعلانات مع صور متعددة
- نظام رسائل بين البائع والمشتري
- نظام بحث متقدم مع AI
- نظام اشتراكات (Free/Dealer/Company)
- نظام مفضلة وبحث محفوظ

## 1.3 Firebase Configuration

```typescript
// firebase-config.ts
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",           // من Firebase Console
  authDomain: "fire-new-globul.firebaseapp.com",
  projectId: "fire-new-globul",
  storageBucket: "fire-new-globul.appspot.com",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID",
  databaseURL: "https://fire-new-globul-default-rtdb.europe-west1.firebasedatabase.app"
};
```

---

# 2. نظام الروابط والمعرفات (Numeric ID System)

## 2.1 القاعدة الذهبية (CRITICAL)

> **ممنوع منعاً باتاً** استخدام Firebase UID في الروابط العامة  
> يجب استخدام **Numeric ID** فقط (رقم تسلسلي: 1, 2, 3, ...)

## 2.2 أنماط الروابط

### صفحة البروفايل

```typescript
// المسارات
/profile/:numericId          // صفحة المالك (تحرير)
/profile/view/:numericId     // صفحة العرض للآخرين (قراءة فقط)

// أمثلة
/profile/18                  // صفحتي الخاصة (أنا المستخدم 18)
/profile/view/42             // عرض بروفايل المستخدم 42
```

### منطق التحويل التلقائي

```typescript
// CRITICAL: تطبيق صارم في الموبايل
function handleProfileNavigation(targetNumericId: number, currentUserNumericId: number) {
  if (targetNumericId === currentUserNumericId) {
    // صفحتي الخاصة - بقاء على /profile/:id
    navigate(`/profile/${targetNumericId}`);
  } else {
    // بروفايل شخص آخر - تحويل إلى /profile/view/:id
    navigate(`/profile/view/${targetNumericId}`);
  }
}

// مثال: أنا المستخدم 80
// إذا حاولت الوصول إلى /profile/80 → أبقى (صفحتي)
// إذا حاولت الوصول إلى /profile/42 → تحويل إلى /profile/view/42
```

### صفحة الإعلان (السيارة)

```typescript
// المسارات
/car/:sellerNumericId/:carNumericId       // عرض الإعلان
/car/:sellerNumericId/:carNumericId/edit  // تعديل (للمالك فقط)

// أمثلة
/car/1/5      // الإعلان الخامس للمستخدم رقم 1
/car/90/3     // الإعلان الثالث للمستخدم رقم 90
/car/90/3/edit // تعديل (فقط للمستخدم 90)
```

### الرسائل

```typescript
// Firestore Legacy
/messages/:senderId/:recipientId

// Realtime Database (الحديث)
/messages-v2?channel=channelId

// Channel ID Pattern (Deterministic)
// msg_{min(user1,user2)}_{max(user1,user2)}_car_{carId}
// مثال: msg_5_18_car_42
```

## 2.3 كيفية إعطاء Numeric ID

```typescript
// عند أول تسجيل دخول:
// 1. Cloud Function: onUserCreate يُنفّذ تلقائياً
// 2. يقرأ العداد من: counters/users
// 3. يزيد العداد بـ 1 (atomic increment)
// 4. يحفظ في: users/{firebaseUid}.numericId = newNumericId

// الخدمات المسؤولة:
// - functions/src/triggers/onUserCreate.ts
// - getUserNumericId (Callable Function)
```

---

# 3. المصادقة والمستخدمون

## 3.1 طرق تسجيل الدخول

| الطريقة | الحالة | SDK/Library |
|---------|--------|-------------|
| Google OAuth | فعّال (رئيسي) | @react-native-google-signin |
| Email/Password | فعّال | Firebase Auth |
| Facebook OAuth | فعّال (اختياري) | @react-native-fbsdk |
| دخول كضيف (Anonymous) | فعّال | Firebase Auth |

## 3.2 تدفق تسجيل المستخدم

```
1. المستخدم يسجل/يدخل
2. Firebase Auth يُنشئ الحساب
3. Cloud Function (beforeUserCreated) - Rate Limiting
4. Cloud Function (onUserCreate) - Numeric ID Assignment
5. يُنشأ مستند في Firestore: users/{firebaseUid}
6. يصبح البروفايل متاحاً: /profile/{numericId}
```

## 3.3 بنية مستند المستخدم

```typescript
// Collection: users/{firebaseUid}
interface User {
  // معرّفات (CRITICAL)
  numericId: number;              // 1, 2, 3, ... (تسلسلي)
  numericIdAssignedAt: Timestamp;
  
  // معلومات أساسية
  displayName: string;
  email: string;
  phone?: string;                 // +359XXXXXXXXX
  photoURL?: string;
  
  // نوع الحساب
  accountType: 'private' | 'dealer' | 'company';
  subscriptionTier: 'free' | 'dealer' | 'company';
  
  // إحصائيات
  listingsCount: number;
  favoritesCount: number;
  reviewsCount: number;
  rating?: number;                // 0-5
  
  // نظام
  createdAt: Timestamp;
  updatedAt: Timestamp;
  lastLoginAt: Timestamp;
  isVerified: boolean;
  isActive: boolean;
  
  // FCM للإشعارات
  fcmTokens?: string[];
}
```

---

# 4. بنية قاعدة البيانات (Firestore)

## 4.1 المجموعات الستة للسيارات

```typescript
const VEHICLE_COLLECTIONS = [
  'passenger_cars',  // سيارات ركاب (سيدان، هاتشباك، كوبيه)
  'suvs',           // SUV / كروس أوفر
  'vans',           // فانات / ميني فان
  'motorcycles',    // دراجات نارية
  'trucks',         // شاحنات
  'buses'           // حافلات
] as const;

type VehicleCollection = typeof VEHICLE_COLLECTIONS[number];
```

## 4.2 بنية مستند السيارة (CarListing)

```typescript
interface CarListing {
  // ═══════════════════════════════════════
  // معرّفات (CRITICAL - لا تُغيّر)
  // ═══════════════════════════════════════
  id?: string;                    // Firebase Document ID
  numericId: number;              // رقم الإعلان لكل بائع (1, 2, 3...)
  carNumericId?: number;          // Alias for numericId
  sellerNumericId: number;        // رقم البائع
  sellerId: string;               // Firebase UID للبائع (مطلوب للأمان)
  
  // ═══════════════════════════════════════
  // معلومات أساسية
  // ═══════════════════════════════════════
  vehicleType: string;            // passenger_car, suv, van, etc.
  make: string;                   // الماركة (BMW, Mercedes, Audi)
  model: string;                  // الموديل
  year: number;                   // سنة الصنع
  mileage: number;                // الكيلومترات
  vin?: string;                   // Vehicle Identification Number
  
  // ═══════════════════════════════════════
  // مواصفات تقنية
  // ═══════════════════════════════════════
  fuelType: string;               // gasoline, diesel, electric, hybrid
  transmission: string;           // manual, automatic, semi-automatic
  power?: number;                 // القوة (حصان)
  powerKW?: number;               // القوة (كيلوواط)
  engineSize?: number;            // السعة اللترية (cc)
  driveType?: string;             // front, rear, all-wheel
  fuelConsumption?: number;       // l/100km
  co2Emissions?: number;
  euroStandard?: string;          // Euro 4, 5, 6
  
  // ═══════════════════════════════════════
  // المظهر
  // ═══════════════════════════════════════
  color?: string;                 // لون خارجي
  exteriorColor?: string;         // Alias
  interiorColor?: string;         // لون داخلي
  interiorMaterial?: string;      // fabric, leather, alcantara
  doors?: string;                 // عدد الأبواب
  numberOfDoors?: number;
  seats?: string;                 // عدد المقاعد
  numberOfSeats?: number;
  
  // ═══════════════════════════════════════
  // الحالة والتاريخ
  // ═══════════════════════════════════════
  condition?: string;             // new, used, for-parts
  accidentHistory: boolean;       // تاريخ حوادث
  serviceHistory: boolean;        // سجل صيانة
  fullServiceHistory?: boolean;
  roadworthy?: boolean;
  numberOfOwners?: number;
  firstRegistration?: Date;
  
  // ═══════════════════════════════════════
  // الموقع
  // ═══════════════════════════════════════
  city: string;                   // المدينة
  region: string;                 // المنطقة/الولاية
  postalCode?: string;
  coordinates?: {
    lat: number;
    lng: number;
  };
  locationData?: {
    cityName?: string;
    regionName?: string;
    cityId?: number;
    regionId?: number;
  };
  
  // ═══════════════════════════════════════
  // التسعير
  // ═══════════════════════════════════════
  price: number;                  // السعر
  currency: string;               // EUR دائماً
  priceType: string;              // fixed, negotiable
  negotiable: boolean;
  financing: boolean;
  tradeIn: boolean;
  warranty: boolean;
  warrantyMonths?: number;
  vatReclaimable?: boolean;       // ضريبة قابلة للاسترداد
  
  // ═══════════════════════════════════════
  // الصور (WebP فقط)
  // ═══════════════════════════════════════
  images?: string[];              // روابط Storage (max 20)
  hasImages?: boolean;
  hasVideo?: boolean;
  videoUrl?: string;
  
  // ═══════════════════════════════════════
  // البائع
  // ═══════════════════════════════════════
  sellerType: string;             // private, dealer
  sellerName: string;
  sellerPhone: string;
  sellerEmail: string;
  companyName?: string;
  
  // ═══════════════════════════════════════
  // التجهيزات
  // ═══════════════════════════════════════
  safetyEquipment?: string[];
  comfortEquipment?: string[];
  infotainmentEquipment?: string[];
  exteriorEquipment?: string[];
  interiorEquipment?: string[];
  extras?: string[];
  
  // ═══════════════════════════════════════
  // النظام
  // ═══════════════════════════════════════
  status: 'active' | 'sold' | 'draft' | 'expired' | 'deleted';
  createdAt: Timestamp;
  updatedAt: Timestamp;
  expiresAt?: Timestamp;
  views?: number;
  favorites?: number;
  isFeatured?: boolean;
  isUrgent?: boolean;
  
  // ═══════════════════════════════════════
  // للبحث
  // ═══════════════════════════════════════
  searchKeywords?: string;
  description?: string;
}
```

## 4.3 مجموعات أخرى مهمة

```typescript
// المستخدمون
users/{firebaseUid}

// العدادات (للـ Numeric ID)
counters/users                   // عداد المستخدمين العام
counters/{userId}/cars           // عداد سيارات كل مستخدم

// المفضلة
favorites/{userId}/cars/{carId}

// البحث المحفوظ
saved_searches/{userId}/searches/{searchId}

// المتابعة
follows/{followId}               // Format: {followerId}_{followingId}

// الإشعارات
notifications/{notificationId}

// الاشتراكات
customers/{uid}/subscriptions/{subscriptionId}
```

---

# 5. الوظائف الأساسية (Features)

## 5.1 البحث

### أنواع البحث

| النوع | المسار | الوصف |
|-------|--------|-------|
| بسيط | `/cars` | قائمة السيارات مع فلاتر أساسية |
| متقدم | `/advanced-search` | 30+ فلتر مع أقسام منظمة |
| ذكي | `/cars?mode=smart` | بحث بالذكاء الاصطناعي |
| صوتي | Voice Button | Whisper API |
| مرئي | Image Upload | بحث بالصورة عن سيارات مشابهة |

### أقسام البحث المتقدم

```typescript
const SEARCH_SECTIONS = [
  'basicData',        // ماركة، موديل، نوع المركبة
  'technicalData',    // وقود، ناقل حركة، قوة، سعة
  'exterior',         // لون خارجي، تجهيزات خارجية
  'interior',         // لون داخلي، مواد، تجهيزات
  'extras',           // تجهيزات إضافية
  'offerDetails',     // نوع البائع، تقييم، حالة
  'location',         // مدينة، منطقة، دولة
  'typeAndCondition', // حالة، تاريخ، ملكية
];
```

## 5.2 عرض الإعلانات

### شاشة قائمة السيارات

```typescript
// الحقول المعروضة في البطاقة
interface CarCardData {
  image: string;           // أول صورة
  make: string;
  model: string;
  year: number;
  price: number;
  currency: string;        // EUR
  mileage: number;
  fuelType: string;
  transmission: string;
  city: string;
  isFeatured?: boolean;
}
```

### شاشة تفاصيل السيارة

```typescript
// جميع الحقول من CarListing
// + أزرار:
// - "راسل البائع" → بدء محادثة
// - "أضف للمفضلة" → حفظ
// - "مشاركة" → share link
// - "تعديل" (للمالك فقط)
```

## 5.3 البروفايل

### الأقسام

1. **إعلاناتي** - قائمة إعلانات المستخدم
2. **المفضلة** - السيارات المحفوظة
3. **البحث المحفوظ** - فلاتر بحث محفوظة
4. **الإعدادات** - إعدادات الحساب
5. **الاشتراك** - عرض الخطة + الترقية

## 5.4 المفضلة

```typescript
// Firestore: favorites/{userId}/cars/{carId}
interface Favorite {
  carId: string;
  vehicleType: string;     // لتحديد المجموعة
  addedAt: Timestamp;
  // Denormalized data:
  make: string;
  model: string;
  price: number;
  image: string;
}
```

## 5.5 البحث المحفوظ

```typescript
// Firestore: saved_searches/{userId}/searches/{searchId}
interface SavedSearch {
  name: string;
  filters: SearchFilters;
  createdAt: Timestamp;
  notifyOnNewMatches: boolean;
  lastNotifiedAt?: Timestamp;
}
```

---

# 6. خدمات البحث

## 6.1 Algolia Configuration

```typescript
const ALGOLIA_CONFIG = {
  APP_ID: 'RTGDK12KTJ',
  SEARCH_KEY: 'YOUR_SEARCH_KEY',    // من Algolia Dashboard
  INDEX_NAME: 'cars_bg',
  
  // Sort Replicas
  SORT_REPLICAS: [
    'cars_bg_price_asc',
    'cars_bg_price_desc',
    'cars_bg_year_desc',
    'cars_bg_mileage_asc',
    'cars_bg_createdAt_desc',
  ],
};
```

## 6.2 خدمات البحث

```typescript
// 1. SmartSearchService - البحث الذكي بـ AI
import { smartSearchService } from '@/services/search/smart-search.service';
const results = await smartSearchService.search(query, filters, options);

// 2. UnifiedSearchService - الواجهة الموحدة
import { searchService } from '@/services/search/UnifiedSearchService';
const results = await searchService.search(filters, options);

// 3. AlgoliaSearchService - البحث المباشر في Algolia
import algoliaSearchService from '@/services/algoliaSearchService';
const results = await algoliaSearchService.searchCars(filters, options);
```

## 6.3 بناء الفلاتر

```typescript
interface SearchFilters {
  // أساسي
  make?: string;
  model?: string;
  vehicleType?: string;
  
  // نطاقات
  yearFrom?: number;
  yearTo?: number;
  priceFrom?: number;
  priceTo?: number;
  mileageFrom?: number;
  mileageTo?: number;
  powerFrom?: number;
  powerTo?: number;
  
  // تصنيفي
  fuelType?: string;
  transmission?: string;
  condition?: string;
  driveType?: string;
  
  // الموقع
  city?: string;
  region?: string;
  country?: string;
  
  // البائع
  sellerType?: string;       // private, dealer
  
  // إضافي
  hasImages?: boolean;
  hasVideo?: boolean;
  negotiable?: boolean;
  warranty?: boolean;
}
```

---

# 7. نظام الرسائل

## 7.1 Realtime Database Structure

```
/channels/{channelId}/
  ├── buyerNumericId: number
  ├── buyerFirebaseId: string
  ├── sellerNumericId: number
  ├── sellerFirebaseId: string
  ├── carNumericId: number
  ├── carId: string
  ├── vehicleType: string
  ├── createdAt: number (timestamp)
  └── lastMessageAt: number

/messages/{channelId}/{messageId}/
  ├── senderId: string (Firebase UID)
  ├── senderNumericId: number
  ├── text: string
  ├── type: 'text' | 'offer' | 'image' | 'car_reference'
  ├── timestamp: number
  ├── isRead: boolean
  └── metadata?: {
        offerAmount?: number,
        offerStatus?: 'pending' | 'accepted' | 'rejected'
      }

/typing/{channelId}/{numericId}/
  └── isTyping: boolean

/presence/{numericId}/
  ├── online: boolean
  ├── lastSeen: number
  └── currentPage?: string
```

## 7.2 Channel ID Generation

```typescript
function generateChannelId(
  user1NumericId: number,
  user2NumericId: number,
  carNumericId: number
): string {
  const min = Math.min(user1NumericId, user2NumericId);
  const max = Math.max(user1NumericId, user2NumericId);
  return `msg_${min}_${max}_car_${carNumericId}`;
}

// مثال: msg_5_18_car_42
```

## 7.3 بدء محادثة من صفحة سيارة

```typescript
async function startConversation(car: CarListing, currentUser: User) {
  const channelId = generateChannelId(
    currentUser.numericId,    // المشتري
    car.sellerNumericId,      // البائع
    car.numericId             // السيارة
  );
  
  // إنشاء القناة إذا لم تكن موجودة
  const channelRef = ref(realtimeDb, `channels/${channelId}`);
  const snapshot = await get(channelRef);
  
  if (!snapshot.exists()) {
    await set(channelRef, {
      buyerNumericId: currentUser.numericId,
      buyerFirebaseId: currentUser.uid,
      sellerNumericId: car.sellerNumericId,
      sellerFirebaseId: car.sellerId,
      carNumericId: car.numericId,
      carId: car.id,
      vehicleType: car.vehicleType,
      createdAt: serverTimestamp(),
      lastMessageAt: serverTimestamp(),
    });
  }
  
  // Navigate to messages
  navigate(`/messages/${channelId}`);
}
```

---

# 8. الاشتراكات والدفع

## 8.1 الخطط

| الخطة | الحد الأقصى للإعلانات | أعضاء الفريق | شهرياً | سنوياً |
|-------|----------------------|--------------|--------|--------|
| **Free** | 3 | 0 | 0 EUR | 0 EUR |
| **Dealer** | 30 | 3 | 20.11 EUR | 193 EUR |
| **Company** | غير محدود | 10 | 100.11 EUR | 961 EUR |

## 8.2 تعريف الخطط

```typescript
type PlanTier = 'free' | 'dealer' | 'company';

interface SubscriptionPlan {
  id: string;
  tier: PlanTier;
  name: {
    bg: string;
    en: string;
  };
  description: {
    bg: string;
    en: string;
  };
  price: {
    monthly: number;
    annual: number;
    currency: 'EUR';
  };
  features: {
    maxListings: number;       // -1 = unlimited
    maxTeamMembers: number;
    canBulkUpload: boolean;
    canFeatureListings: boolean;
    hasAdvancedAnalytics: boolean;
    hasPrioritySupport: boolean;
  };
}

const SUBSCRIPTION_PLANS: Record<PlanTier, SubscriptionPlan> = {
  free: {
    id: 'plan_free',
    tier: 'free',
    name: { bg: 'Безплатен', en: 'Free' },
    price: { monthly: 0, annual: 0, currency: 'EUR' },
    features: {
      maxListings: 3,
      maxTeamMembers: 0,
      canBulkUpload: false,
      canFeatureListings: false,
      hasAdvancedAnalytics: false,
      hasPrioritySupport: false,
    }
  },
  dealer: {
    id: 'plan_dealer',
    tier: 'dealer',
    name: { bg: 'Професионален Търговец', en: 'Professional Dealer' },
    price: { monthly: 20.11, annual: 193, currency: 'EUR' },
    features: {
      maxListings: 30,
      maxTeamMembers: 3,
      canBulkUpload: true,
      canFeatureListings: true,
      hasAdvancedAnalytics: true,
      hasPrioritySupport: false,
    }
  },
  company: {
    id: 'plan_company',
    tier: 'company',
    name: { bg: 'Фирма', en: 'Company' },
    price: { monthly: 100.11, annual: 961, currency: 'EUR' },
    features: {
      maxListings: -1,  // unlimited
      maxTeamMembers: 10,
      canBulkUpload: true,
      canFeatureListings: true,
      hasAdvancedAnalytics: true,
      hasPrioritySupport: true,
    }
  }
};
```

## 8.3 طرق الدفع

### Stripe (Automated)
```typescript
// Stripe Price IDs
const STRIPE_PRICES = {
  dealer: {
    monthly: 'price_1Sf7iU3EuPQhDyrBtP0bEc4B',
    annual: 'price_1Sf7l83EuPQhDyrB3Z3zIpZv'
  },
  company: {
    monthly: 'price_XXXXX',
    annual: 'price_XXXXX'
  }
};
```

### التحويل البنكي (Manual)
```typescript
const BANK_DETAILS = {
  revolut: {
    bankName: "Revolut Bank UAB",
    beneficiary: "Alaa Al-Hamadani",
    iban: "LT44 3250 0419 1285 4116",
    bic: "REVOLT21",
    processingTime: "Instant"
  },
  icard: {
    bankName: "iCard / myPOS",
    beneficiary: "ALAA HAMID MOHAMMED SHAKER AL-HAMADANI",
    iban: "BG98INTF40012039023344",
    bic: "INTFBGSF",
    processingTime: "1-2 hours"
  }
};
```

---

# 9. التصميم والألوان

## 9.1 Light Mode

```css
/* الخلفيات */
--bg-primary: #c7c0b9;
--bg-secondary: #b4b1aa;
--bg-card: #a09090;
--bg-header: #1A1D2E;

/* النصوص */
--text-primary: #1A1D2E;
--text-secondary: #4A5568;
--text-link: #FF6B35;

/* الألوان الرئيسية */
--accent-primary: #FF6B35;
--accent-secondary: #FF8C61;
--blue-primary: #2C5F8D;

/* الحدود */
--border-primary: #E2E8F0;

/* الأزرار */
--btn-primary-bg: #FF6B35;
--btn-primary-text: #FFFFFF;
--btn-primary-hover: #FF8C61;

/* الحالات */
--success: #10B981;
--warning: #F59E0B;
--error: #EF4444;
--info: #3B82F6;
```

## 9.2 Dark Mode

```css
/* الخلفيات */
--bg-primary: #0F1419;
--bg-secondary: #1A1F2E;
--bg-card: #1E2432;
--bg-header: #0A0D14;

/* النصوص */
--text-primary: #F8FAFC;
--text-secondary: #CBD5E1;
--text-link: #FF9066;

/* الألوان الرئيسية */
--accent-primary: #FF8C61;
--accent-secondary: #FFA885;
--blue-primary: #5B9FD8;

/* الحدود */
--border-primary: #2D3748;

/* الأزرار */
--btn-primary-bg: #FF8C61;
--btn-primary-text: #0F1419;
```

## 9.3 قواعد التصميم

```typescript
// ممنوع منعاً باتاً
const BANNED_IN_UI = [
  'Emojis', // لا إيموجي نصية
  'Hard-coded text', // استخدم i18n
  'Inline styles', // استخدم StyleSheet
];

// مطلوب
const REQUIRED_IN_UI = [
  'Lucide Icons', // بدلاً من الإيموجي
  'WebP images', // لا PNG/JPG
  'Responsive design', // Mobile-first
  'Accessibility', // ARIA labels
];
```

---

# 10. التوطين (i18n)

## 10.1 هيكل الملفات

```
src/locales/
├── bg/
│   ├── advancedSearch.ts
│   ├── auth.ts
│   ├── billing.ts
│   ├── cars.ts
│   ├── common.ts
│   ├── messages.ts
│   ├── profile.ts
│   └── index.ts
├── en/
│   └── (نفس الملفات)
└── index.ts
```

## 10.2 مفاتيح الترجمة الأساسية

```typescript
// advancedSearch
const advancedSearch = {
  title: 'Разширено търсене',           // Advanced Search
  make: 'Марка',                        // Make
  model: 'Модел',                       // Model
  fuelType: 'Тип гориво',               // Fuel Type
  transmission: 'Скоростна кутия',      // Transmission
  price: 'Цена',                        // Price
  year: 'Година',                       // Year
  mileage: 'Пробег',                    // Mileage
  searchCars: 'Търси автомобили',       // Search Cars
  resetFilters: 'Изчисти филтрите',     // Reset Filters
};

// common
const common = {
  save: 'Запази',                       // Save
  cancel: 'Отказ',                      // Cancel
  loading: 'Зареждане...',              // Loading...
  error: 'Грешка',                      // Error
  success: 'Успех',                     // Success
  back: 'Назад',                        // Back
  next: 'Напред',                       // Next
  confirm: 'Потвърди',                  // Confirm
};

// cars
const cars = {
  newListing: 'Нова обява',             // New Listing
  editListing: 'Редактирай обява',      // Edit Listing
  deleteListing: 'Изтрий обява',        // Delete Listing
  contactSeller: 'Свържи се с продавача', // Contact Seller
  addToFavorites: 'Добави в любими',    // Add to Favorites
  share: 'Сподели',                     // Share
};
```

## 10.3 القيم الثابتة

```typescript
// أنواع الوقود
const FUEL_TYPES = {
  gasoline: { bg: 'Бензин', en: 'Gasoline' },
  diesel: { bg: 'Дизел', en: 'Diesel' },
  electric: { bg: 'Електрически', en: 'Electric' },
  hybrid_gasoline: { bg: 'Хибрид (Бензин)', en: 'Hybrid (Gasoline)' },
  hybrid_diesel: { bg: 'Хибрид (Дизел)', en: 'Hybrid (Diesel)' },
  lpg: { bg: 'ГНП', en: 'LPG' },
  natural_gas: { bg: 'Природен газ', en: 'Natural Gas' },
};

// ناقل الحركة
const TRANSMISSIONS = {
  manual: { bg: 'Ръчна', en: 'Manual' },
  automatic: { bg: 'Автоматична', en: 'Automatic' },
  semi_automatic: { bg: 'Полуавтоматична', en: 'Semi-Automatic' },
};

// المناطق البلغارية (28 область)
const BULGARIAN_PROVINCES = [
  'София-град', 'Пловдив', 'Варна', 'Бургас', 'Русе',
  'Стара Загора', 'Плевен', 'Благоевград', 'Велико Търново',
  'Шумен', 'Добрич', 'Хасково', 'Пазарджик', 'Перник',
  'Сливен', 'Ямбол', 'Габрово', 'Кърджали', 'Кюстендил',
  'Ловеч', 'Монтана', 'Разград', 'Силистра', 'Смолян',
  'Софийска област', 'Търговище', 'Враца', 'Видин',
];
```

---

# 11. Cloud Functions

## 11.1 الدوال الأساسية

```typescript
// ═══════════════════════════════════════
// Authentication & Users
// ═══════════════════════════════════════
beforeUserCreated      // Rate limiting (3 reg/device/24h)
onUserCreate           // Numeric ID assignment
onUserDelete           // GDPR cleanup
getUserNumericId       // Callable: get user's numeric ID

// ═══════════════════════════════════════
// Notifications
// ═══════════════════════════════════════
onNewCarPosted         // إشعار للمتابعين
onNewMessage           // إشعار رسالة جديدة
onPriceUpdate          // إشعار تغيير السعر
onNewRealtimeMessage   // Push notification (Realtime DB)
onOfferStatusChange    // إشعار حالة العرض
notifyFollowersOnNewCar
cleanupOldNotifications

// ═══════════════════════════════════════
// Algolia Sync (real-time)
// ═══════════════════════════════════════
syncPassengerCarsToAlgolia
syncSuvsToAlgolia
syncVansToAlgolia
syncMotorcyclesToAlgolia
syncTrucksToAlgolia
syncBusesToAlgolia
batchSyncAllCarsToAlgolia

// ═══════════════════════════════════════
// AI Services
// ═══════════════════════════════════════
evaluateCar            // Gemini Vision + DeepSeek
aiGenerateCarDescription
hybridAIProxy

// ═══════════════════════════════════════
// Image Processing
// ═══════════════════════════════════════
optimizeUploadedImage
cleanupDeletedImages

// ═══════════════════════════════════════
// Payments
// ═══════════════════════════════════════
stripeWebhooks
onPaymentVerified
checkExpiredManualPayments

// ═══════════════════════════════════════
// Car Lifecycle
// ═══════════════════════════════════════
onPassengerCarDeleted, onSuvDeleted, ... (cleanup)
onPassengerCarSold, onSuvSold, ...        (mark sold)
archiveSoldCars
cleanupExpiredDrafts
```

---

# 12. قواعد الأمان (Security Rules)

## 12.1 Firestore Rules (ملخص)

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Helper functions
    function isAuthenticated() {
      return request.auth != null;
    }
    
    function isOwner(userId) {
      return isAuthenticated() && request.auth.uid == userId;
    }
    
    // Users
    match /users/{userId} {
      allow read: if isAuthenticated();
      allow create: if isAuthenticated() && request.auth.uid == userId;
      allow update, delete: if isOwner(userId);
    }
    
    // Vehicle Collections (6)
    match /passenger_cars/{carId} {
      allow read: if true;
      allow write: if isOwner(resource.data.sellerId) 
        || (request.resource.data.sellerId == request.auth.uid);
    }
    // (same for suvs, vans, motorcycles, trucks, buses)
    
    // Counters - Protected (Backend only)
    match /counters/users {
      allow read: if true;
      allow create, update, delete: if false;
    }
    
    // Favorites
    match /favorites/{userId}/cars/{carId} {
      allow read, write: if isOwner(userId);
    }
  }
}
```

## 12.2 Realtime Database Rules

```json
{
  "rules": {
    "channels": {
      "$channelId": {
        ".read": "auth != null",
        ".write": "auth != null",
        ".validate": "newData.hasChildren(['buyerFirebaseId', 'sellerFirebaseId']) && (newData.child('buyerFirebaseId').val() === auth.uid || newData.child('sellerFirebaseId').val() === auth.uid)"
      }
    },
    "messages": {
      "$channelId": {
        ".read": "auth != null && root.child('channels').child($channelId).exists() && (root.child('channels').child($channelId).child('buyerFirebaseId').val() === auth.uid || root.child('channels').child($channelId).child('sellerFirebaseId').val() === auth.uid)",
        "$messageId": {
          ".write": "auth != null && root.child('channels').child($channelId).exists()"
        }
      }
    },
    "presence": {
      "$numericId": {
        ".read": "auth != null",
        ".write": "auth != null",
        ".validate": "newData.child('uid').val() === auth.uid"
      }
    },
    "typing": {
      "$channelId": {
        ".read": "auth != null",
        "$numericId": {
          ".write": "auth != null"
        }
      }
    }
  }
}
```

---

# 13. هيكل المشروع للموبايل

## 13.1 React Native + Expo Structure

```
New G Cars APP/
├── app/                          # Expo Router (screens)
│   ├── (tabs)/                   # Tab navigation
│   │   ├── index.tsx             # Home
│   │   ├── search.tsx            # Search
│   │   ├── messages.tsx          # Messages
│   │   └── profile.tsx           # Profile
│   ├── car/
│   │   ├── [sellerId]/
│   │   │   └── [carId].tsx       # Car details
│   │   │   └── edit.tsx          # Edit car
│   ├── profile/
│   │   ├── [id].tsx              # My profile (owner)
│   │   └── view/
│   │       └── [id].tsx          # View profile (others)
│   ├── messages/
│   │   └── [channelId].tsx       # Chat
│   ├── advanced-search.tsx       # Advanced search
│   └── _layout.tsx               # Root layout
│
├── src/
│   ├── components/               # Reusable components
│   │   ├── CarCard.tsx
│   │   ├── CarCardCompact.tsx
│   │   ├── SearchBar.tsx
│   │   ├── FilterSection.tsx
│   │   └── ...
│   │
│   ├── services/                 # Firebase & API services
│   │   ├── firebase/
│   │   │   ├── config.ts
│   │   │   ├── auth.ts
│   │   │   ├── firestore.ts
│   │   │   └── storage.ts
│   │   ├── search/
│   │   │   ├── smartSearch.ts
│   │   │   ├── algolia.ts
│   │   │   └── unified.ts
│   │   ├── messaging/
│   │   │   ├── channels.ts
│   │   │   └── realtime.ts
│   │   └── numericId.ts
│   │
│   ├── hooks/                    # Custom hooks
│   │   ├── useAuth.ts
│   │   ├── useCars.ts
│   │   ├── useMessages.ts
│   │   └── useProfile.ts
│   │
│   ├── contexts/                 # React contexts
│   │   ├── AuthContext.tsx
│   │   ├── LanguageContext.tsx
│   │   └── ThemeContext.tsx
│   │
│   ├── types/                    # TypeScript types
│   │   ├── CarListing.ts
│   │   ├── User.ts
│   │   ├── Message.ts
│   │   └── Subscription.ts
│   │
│   ├── constants/                # Constants
│   │   ├── collections.ts
│   │   ├── subscriptionPlans.ts
│   │   └── colors.ts
│   │
│   ├── locales/                  # i18n translations
│   │   ├── bg/
│   │   └── en/
│   │
│   └── utils/                    # Utility functions
│       ├── formatters.ts
│       ├── validators.ts
│       └── navigation.ts
│
├── assets/                       # Static assets
│   ├── images/
│   └── fonts/
│
├── app.json                      # Expo config
├── package.json
├── tsconfig.json
└── babel.config.js
```

## 13.2 Dependencies (package.json)

```json
{
  "dependencies": {
    "expo": "~50.0.0",
    "expo-router": "~3.4.0",
    "react": "18.2.0",
    "react-native": "0.73.0",
    
    // Firebase
    "@react-native-firebase/app": "^18.0.0",
    "@react-native-firebase/auth": "^18.0.0",
    "@react-native-firebase/firestore": "^18.0.0",
    "@react-native-firebase/storage": "^18.0.0",
    "@react-native-firebase/database": "^18.0.0",
    "@react-native-firebase/messaging": "^18.0.0",
    
    // Auth
    "@react-native-google-signin/google-signin": "^10.0.0",
    
    // Search
    "algoliasearch": "^4.20.0",
    
    // i18n
    "i18next": "^23.0.0",
    "react-i18next": "^13.0.0",
    
    // UI
    "lucide-react-native": "^0.300.0",
    "react-native-reanimated": "~3.6.0",
    "react-native-gesture-handler": "~2.14.0",
    
    // Storage
    "@react-native-async-storage/async-storage": "^1.21.0"
  }
}
```

---

# 14. خطة التنفيذ المرحلية

## المرحلة 0: التحضير (يوم 1-2)

```bash
# 1. إنشاء المشروع
cd "C:\Users\hamda\Desktop\New G Cars APP"
npx create-expo-app@latest . --template tabs

# 2. تثبيت Firebase
npx expo install @react-native-firebase/app @react-native-firebase/auth @react-native-firebase/firestore @react-native-firebase/storage @react-native-firebase/database @react-native-firebase/messaging

# 3. تثبيت باقي التبعيات
npm install algoliasearch i18next react-i18next lucide-react-native

# 4. نسخ Firebase Config من المشروع الأصلي
```

## المرحلة 1: الهيكل الأساسي (أسبوع 1)

- [ ] إعداد Firebase
- [ ] إعداد Expo Router
- [ ] إعداد i18n (نسخ الترجمات)
- [ ] إعداد Theme (Light/Dark)
- [ ] إعداد Types (نسخ من المشروع الأصلي)

## المرحلة 2: المصادقة (أسبوع 2)

- [ ] Google Sign-In
- [ ] Email/Password
- [ ] Anonymous (Guest)
- [ ] Numeric ID Integration
- [ ] Profile Routing (Constitution Rules)

## المرحلة 3: البحث والسيارات (أسبوع 3-4)

- [ ] قائمة السيارات
- [ ] تفاصيل السيارة
- [ ] البحث البسيط
- [ ] البحث المتقدم
- [ ] Algolia Integration

## المرحلة 4: الرسائل (أسبوع 5)

- [ ] قائمة المحادثات
- [ ] شاشة المحادثة
- [ ] بدء محادثة من صفحة سيارة
- [ ] Push Notifications (FCM)

## المرحلة 5: المفضلة والبروفايل (أسبوع 6)

- [ ] إضافة/إزالة من المفضلة
- [ ] البحث المحفوظ
- [ ] شاشة البروفايل
- [ ] إعلاناتي
- [ ] الإعدادات

## المرحلة 6: الاشتراكات (أسبوع 7)

- [ ] عرض الخطط
- [ ] حدود الإعلانات
- [ ] ربط الدفع

## المرحلة 7: الاختبار والنشر (أسبوع 8)

- [ ] اختبار شامل
- [ ] EAS Build
- [ ] App Store / Google Play

---

# 15. قواعد الدستور الملزمة

## 15.1 قواعد الكود

| القاعدة | الوصف |
|---------|-------|
| **Numeric ID فقط** | ممنوع Firebase UID في الروابط |
| **حد 300 سطر** | الملف يُقسم إذا زاد |
| **لا تكرار** | DRY Principle |
| **لا حذف** | انقل إلى مجلد DDD |
| **لا إيموجي** | استخدم Lucide Icons |
| **لا console.log** | استخدم logger service |

## 15.2 قواعد التوجيه

```typescript
// صفحة البروفايل
/profile/:id           → للمالك فقط
/profile/view/:id      → لعرض الآخرين

// تحويل تلقائي
if (targetId !== currentUserId) {
  redirect(`/profile/view/${targetId}`);
}
```

## 15.3 قواعد الأسماء

```typescript
// المتغيرات: camelCase
const userData = {};
const handleSearch = () => {};

// الثوابت: UPPER_SNAKE_CASE
const MAX_IMAGES = 20;
const API_ENDPOINT = 'https://...';

// المكونات: PascalCase
const CarCard = () => {};
const SearchBar = () => {};

// الملفات: kebab-case أو PascalCase
// car-listing.ts أو CarListing.tsx
```

---

# ملحق: روابط مهمة

| العنصر | الرابط |
|--------|--------|
| Live Site | https://koli.one |
| Firebase Console | https://console.firebase.google.com/project/fire-new-globul |
| GitHub | https://github.com/hamdanialaa3/New-Globul-Cars |
| Algolia Dashboard | https://dashboard.algolia.com |

---

**تاريخ الوثيقة:** 25 يناير 2026  
**الإصدار:** 1.0.0  
**المؤلف:** AI Development Assistant based on Project Constitution

---

> **ملاحظة للنموذج الذكي:** هذه الوثيقة تحتوي على كل ما تحتاجه لبناء تطبيق موبايل كامل. اتبع الهيكل والقواعد بدقة. عند الشك، ارجع إلى قسم "قواعد الدستور الملزمة".
