# 🔧 دليل التدريب الفني المتقدم للنماذج الذكية
## Advanced Technical Training Guide for AI Models

> **الإصدار:** 1.0.0  
> **التاريخ:** 25 يناير 2026  
> **المستوى:** متقدم (تقني)  
> **الجمهور:** Gemini, DeepSeek, OpenAI

---

## 📚 جدول المحتويات

1. [معمارية النظام](#معمارية-النظام)
2. [البنية الفنية للصفحات](#البنية-الفنية-للصفحات)
3. [خدمات البيانات](#خدمات-البيانات)
4. [نماذج البيانات](#نماذج-البيانات)
5. [التكاملات الخارجية](#التكاملات-الخارجية)
6. [أنماط التطوير](#أنماط-التطوير)
7. [الأداء والتحسين](#الأداء-والتحسين)

---

## معمارية النظام

### 🏗️ الهندسة العامة

```
┌─────────────────────────────────────────┐
│   🌐 الواجهة الأمامية (Frontend)       │
│   React 18 + TypeScript + Styled Comp  │
└─────────────────────────────────────────┘
           ↓
┌─────────────────────────────────────────┐
│   🔄 طبقة الخدمات (Services Layer)     │
│   - API Services                        │
│   - Firebase Services                   │
│   - Algolia Search                      │
│   - AI Services                         │
└─────────────────────────────────────────┘
           ↓
┌─────────────────────────────────────────┐
│   ☁️ طبقة البيانات (Data Layer)        │
│   - Firestore (مرئي)                    │
│   - Realtime Database                   │
│   - Cloud Storage                       │
│   - Cloud Functions                     │
└─────────────────────────────────────────┘
           ↓
┌─────────────────────────────────────────┐
│   🤖 الخدمات الخارجية (External Svcs) │
│   - Stripe                              │
│   - Algolia                             │
│   - Google Maps API                     │
│   - Gemini/OpenAI/DeepSeek              │
│   - Firebase ML                         │
└─────────────────────────────────────────┘
```

### 📦 هيكل المشروع

```
src/
├── components/
│   ├── UI/                          # مكونات عامة
│   ├── car/                         # مكونات السيارات
│   ├── messaging/                   # مكونات الرسائل
│   ├── search/                      # مكونات البحث
│   ├── admin/                       # مكونات الإدارة
│   └── ...
├── pages/
│   ├── 00_public/                   # صفحات عامة
│   ├── 01_auth/                     # صفحات المصادقة
│   ├── 03_user-pages/               # صفحات المستخدم
│   ├── 04_car-selling/              # صفحات البيع
│   ├── 06_admin/                    # صفحات الإدارة
│   └── ...
├── services/                        # خدمات البيانات
├── hooks/                           # React Hooks مخصصة
├── contexts/                        # Context Providers
├── types/                           # TypeScript Types
├── config/                          # ملفات الإعدادات
├── locales/                         # ترجمات (i18n)
├── utils/                           # دوال مساعدة
└── styles/                          # أنماط عامة
```

---

## البنية الفنية للصفحات

### 📄 نمط مكون الصفحة (Page Component Pattern)

```typescript
// مثال: src/pages/03_user-pages/profile/ProfilePage.tsx

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { useTheme } from '@/contexts/ThemeContext';

interface ProfilePageProps {
  // Props تمرر من الراوتر
}

const ProfilePage: React.FC<ProfilePageProps> = () => {
  // 1. Hooks الأساسية
  const { user } = useAuth();
  const { t } = useLanguage();
  const { theme } = useTheme();

  // 2. State المحلي
  const [isLoading, setIsLoading] = useState(false);
  const [data, setData] = useState(null);

  // 3. التأثيرات الجانبية
  useEffect(() => {
    // تحميل البيانات
    const loadData = async () => {
      // ...
    };

    loadData();
  }, [user?.id]);

  // 4. المتعاملات (Handlers)
  const handleUpdate = async () => {
    // ...
  };

  // 5. العرض
  return (
    <Container>
      {/* محتوى الصفحة */}
    </Container>
  );
};

export default ProfilePage;
```

### 🎯 الخطوات الأساسية لأي صفحة

1. **التحقق من الصلاحيات:** AuthGuard/ProtectedRoute
2. **تحميل البيانات:** useEffect + Services
3. **معالجة الحالة:** useState + Context
4. **التفاعلات:** Event Handlers
5. **العرض:** JSX + Styled Components
6. **التنظيف:** useEffect Cleanup

---

## خدمات البيانات

### 🔗 نمط الخدمة (Service Pattern)

```typescript
// مثال: src/services/car.service.ts

import { 
  collection, 
  query, 
  where, 
  getDocs,
  doc,
  getDoc,
  addDoc,
  updateDoc,
  deleteDoc
} from 'firebase/firestore';
import { db } from '@/firebase/config';

export class CarService {
  // 1. قراءة
  static async getCar(carId: string) {
    const docRef = doc(db, 'cars', carId);
    const docSnap = await getDoc(docRef);
    return docSnap.exists() ? docSnap.data() : null;
  }

  static async getAllCars(filters?: FilterOptions) {
    const q = query(
      collection(db, 'cars'),
      where('status', '==', 'active'),
      // فلاتر إضافية
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  }

  // 2. الكتابة
  static async addCar(carData: CarData) {
    const docRef = await addDoc(
      collection(db, 'cars'),
      {
        ...carData,
        createdAt: new Date(),
        status: 'pending'
      }
    );
    return docRef.id;
  }

  static async updateCar(carId: string, updates: Partial<CarData>) {
    const docRef = doc(db, 'cars', carId);
    await updateDoc(docRef, {
      ...updates,
      updatedAt: new Date()
    });
  }

  // 3. الحذف
  static async deleteCar(carId: string) {
    const docRef = doc(db, 'cars', carId);
    await deleteDoc(docRef);
  }

  // 4. بحث متقدم
  static async searchCars(searchTerm: string) {
    // استخدام Algolia للبحث المتقدم
    // ...
  }
}

// الاستخدام في المكونات:
const cars = await CarService.getAllCars({ status: 'active' });
```

### 📊 الخدمات الرئيسية

| الخدمة | الملف | الوظيفة |
|--------|------|---------|
| **CarService** | `services/car.service.ts` | إدارة السيارات |
| **UserService** | `services/user.service.ts` | إدارة المستخدمين |
| **AuthService** | `firebase/auth.ts` | المصادقة |
| **MessagingService** | `services/messaging/` | الرسائل |
| **SearchService** | `services/search/` | البحث (Firestore + Algolia) |
| **PaymentService** | `services/payment/` | معالجة الدفع |
| **AIService** | `services/ai/` | الخدمات الذكية |
| **StorageService** | `firebase/storage.ts` | تخزين الملفات |

---

## نماذج البيانات

### 🗂️ مجموعات Firestore

#### 1. مجموعات السيارات (6 مجموعات)

```typescript
// الهيكل الموحد لجميع السيارات
interface CarDocument {
  // البيانات الأساسية
  id: string;
  sellerId: string;           // Firebase UID للبائع
  sellerNumericId: number;    // معرف رقمي للعنوان المختصر
  carNumericId: number;       // معرف رقمي للعنوان المختصر

  // بيانات السيارة
  make: string;               // Marke (Toyota, BMW, etc.)
  model: string;              // Model
  year: number;
  mileage: number;            // بالكم
  fuelType: string;           // Petrol, Diesel, Electric, Hybrid
  transmission: string;       // Manual, Automatic
  engineSize: number;         // cc
  horsepower: number;         // PS/hp

  // الحالة والسعر
  condition: string;          // Excellent, Good, Fair
  price: number;              // EUR
  currency: string;           // EUR
  negotiable: boolean;

  // الصور
  images: string[];           // URLs للصور
  mainImage: string;          // صورة الغلاف الرئيسية

  // الميزات
  features: {
    safety: string[];         // Airbags, ABS, etc.
    comfort: string[];        // AC, Heated seats, etc.
    entertainment: string[];  // Radio, Bluetooth, etc.
    extra: string[];          // Tow hitch, Roof rack, etc.
  };

  // الموقع
  location: {
    city: string;
    address: string;
    latitude?: number;
    longitude?: number;
  };

  // بيانات الاتصال
  contact: {
    name: string;
    phone: string;
    email: string;
  };

  // البيانات الوصفية
  status: 'pending' | 'active' | 'sold' | 'removed';
  createdAt: Timestamp;
  updatedAt: Timestamp;
  expiresAt?: Timestamp;      // تاريخ انتهاء الإعلان

  // الإحصائيات
  views: number;
  clicks: number;
  favorites: number;
  messages: number;

  // SEO
  slug: string;               // للعنوان المختصر
  seoTitle: string;
  seoDescription: string;

  // الوصف
  description: string;        // الوصف الكامل
  aiGenerated: boolean;       // تم توليده بواسطة AI
}
```

**المجموعات الستة:**
- `passenger_cars` - سيارات الركاب
- `suvs` - SUV والـ Crossovers
- `vans` - الفانات والـ Minivans
- `motorcycles` - الدراجات النارية
- `trucks` - الشاحنات
- `buses` - الحافلات

#### 2. مجموعة المستخدمين

```typescript
interface UserDocument {
  // بيانات المصادقة
  uid: string;                // Firebase UID
  numericId: number;          // معرف رقمي (1-1000000)
  email: string;
  emailVerified: boolean;

  // البيانات الشخصية
  firstName: string;
  lastName: string;
  phone: string;
  profileImage: string;       // URL

  // الموقع
  city: string;
  address?: string;
  latitude?: number;
  longitude?: number;

  // نوع الحساب
  accountType: 'private' | 'dealer' | 'company';

  // الاشتراك
  subscription: {
    plan: 'free' | 'dealer' | 'company';
    status: 'active' | 'inactive' | 'pending';
    startDate: Timestamp;
    endDate?: Timestamp;
    autoRenew: boolean;
  };

  // الإحصائيات
  totalListings: number;
  activeListings: number;
  soldListings: number;
  rating: number;             // 1-5
  reviewCount: number;

  // الحالة
  isVerified: boolean;
  isBlocked: boolean;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  lastLoginAt?: Timestamp;

  // البيانات الإضافية
  bio?: string;
  website?: string;
  socialLinks?: {
    facebook?: string;
    instagram?: string;
    twitter?: string;
  };
}
```

#### 3. مجموعة الرسائل (Firebase Realtime DB)

```typescript
// البنية الجديدة (النظام الحالي)
interface Channel {
  channelId: string;          // msg_{min}_{max}_car_{carId}
  buyerNumericId: number;
  sellerNumericId: number;
  carNumericId: number;

  metadata: {
    createdAt: number;
    lastMessageAt: number;
    messageCount: number;
  };

  messages: {
    [messageId: string]: {
      sender: string;         // firebase uid
      senderNumericId: number;
      text: string;
      images?: string[];
      type: 'text' | 'offer' | 'system';
      createdAt: number;
      edited: boolean;
      deletedBy?: string[];
    };
  };

  status: {
    [uid: string]: {
      lastReadAt: number;
      isArchived: boolean;
      isMuted: boolean;
    };
  };
}

// الرسالة الفردية
interface Message {
  id: string;
  channelId: string;
  senderId: string;
  senderNumericId: number;
  text: string;
  type: 'text' | 'offer' | 'system';
  createdAt: number;
  readBy: string[];
  images?: string[];
  edited: boolean;
  deletedFor?: string[];
}
```

---

## التكاملات الخارجية

### 🔌 الخدمات المتكاملة

#### 1. Firebase
**الاستخدامات:**
- **Firestore:** قاعدة البيانات الرئيسية
- **Realtime Database:** الرسائل والحالة الحية
- **Authentication:** المصادقة
- **Cloud Storage:** تخزين الصور والملفات
- **Cloud Functions:** الدوال التشغيلية
- **Hosting:** استضافة الموقع

**الكود النموذجي:**
```typescript
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getDatabase } from 'firebase/database';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  projectId: 'fire-new-globul',
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_MESSAGING_SENDER_ID,
  appId: process.env.REACT_APP_FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const realtimeDb = getDatabase(app);
export const storage = getStorage(app);
```

#### 2. Algolia
**الاستخدامات:**
- البحث المتقدم
- التصفية السريعة
- الاقتراحات التلقائية

**الهيكل:**
```typescript
import algoliasearch from 'algoliasearch';

const client = algoliasearch(
  process.env.REACT_APP_ALGOLIA_APP_ID,
  process.env.REACT_APP_ALGOLIA_SEARCH_KEY
);

const index = client.initIndex('cars');

// البحث
const results = await index.search('Toyota Camry', {
  filters: 'year >= 2015 AND price <= 20000',
  facets: ['make', 'year', 'fuelType']
});

// التصفية
const facets = await index.searchForFacetValues('make', 'Toy', {
  filters: 'year >= 2010'
});
```

#### 3. Google Maps API
**الاستخدامات:**
- عرض خريطة موقع السيارة
- البحث الجغرافي
- المسافة بين المستخدم والسيارة

#### 4. Stripe
**الاستخدامات:**
- معالجة الدفع
- إدارة الاشتراكات
- الفواتير

#### 5. خدمات AI

**Gemini:**
```typescript
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(
  process.env.REACT_APP_GEMINI_API_KEY
);

const generateCarDescription = async (carData: CarData) => {
  const model = genAI.getGenerativeModel({ model: 'gemini-pro' });
  const prompt = `
    أنشئ وصفاً احترافياً لسيارة:
    ${JSON.stringify(carData)}
  `;
  const result = await model.generateContent(prompt);
  return result.response.text();
};
```

**OpenAI و DeepSeek:**
- بديل لـ Gemini
- استخدام API مشابهة
- تكاملات في `services/ai/`

---

## أنماط التطوير

### 🎯 النمط 1: Protected Routes

```typescript
// src/components/guards/ProtectedRoute.tsx

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAuth?: boolean;
  requireAdmin?: boolean;
  requireVerified?: boolean;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requireAuth = true,
  requireAdmin = false,
  requireVerified = false
}) => {
  const { user, isLoading } = useAuth();

  if (isLoading) return <LoadingSpinner />;

  if (requireAuth && !user) {
    return <Navigate to="/login" />;
  }

  if (requireAdmin && user?.role !== 'admin') {
    return <Navigate to="/" />;
  }

  if (requireVerified && !user?.emailVerified) {
    return <Navigate to="/verification" />;
  }

  return <>{children}</>;
};

// الاستخدام:
<Route
  path="/admin"
  element={
    <ProtectedRoute requireAdmin={true}>
      <AdminDashboard />
    </ProtectedRoute>
  }
/>
```

### 🎯 النمط 2: Custom Hooks

```typescript
// src/hooks/useCars.ts

export const useCars = (filters?: FilterOptions) => {
  const [cars, setCars] = useState<Car[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const loadCars = async () => {
      try {
        setIsLoading(true);
        const data = await CarService.getAllCars(filters);
        setCars(data);
      } catch (err) {
        setError(err as Error);
      } finally {
        setIsLoading(false);
      }
    };

    loadCars();
  }, [filters]);

  return { cars, isLoading, error };
};

// الاستخدام:
const { cars, isLoading } = useCars({ status: 'active' });
```

### 🎯 النمط 3: Context للحالة العامة

```typescript
// src/contexts/AuthContext.tsx

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // مراقبة حالة المصادقة
    const unsubscribe = auth.onAuthStateChanged(async (firebaseUser) => {
      if (firebaseUser) {
        const userData = await UserService.getUser(firebaseUser.uid);
        setUser(userData);
      } else {
        setUser(null);
      }
      setIsLoading(false);
    });

    return unsubscribe;
  }, []);

  const value: AuthContextType = {
    user,
    isLoading,
    login: async (email, password) => {
      // ...
    },
    logout: async () => {
      // ...
    },
    register: async (data) => {
      // ...
    }
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
```

---

## الأداء والتحسين

### ⚡ تحسينات الأداء

#### 1. Lazy Loading
```typescript
import { lazy, Suspense } from 'react';

const HeavyComponent = lazy(() => import('./HeavyComponent'));

// الاستخدام:
<Suspense fallback={<LoadingSpinner />}>
  <HeavyComponent />
</Suspense>
```

#### 2. Memoization
```typescript
import { memo, useMemo, useCallback } from 'react';

// تجنب إعادة الرسم غير الضرورية
const CarCard = memo(({ car }: { car: Car }) => {
  return <div>{car.make} {car.model}</div>;
});

// تخزين مؤقت للقيم المحسوبة
const expensiveValue = useMemo(() => {
  return heavyCalculation(data);
}, [data]);

// تخزين مؤقت للدوال
const handleClick = useCallback(() => {
  // ...
}, [dependencies]);
```

#### 3. Virtual Scrolling
```typescript
import { FixedSizeList } from 'react-window';

<FixedSizeList
  height={600}
  itemCount={cars.length}
  itemSize={100}
  width="100%"
>
  {({ index, style }) => (
    <div style={style}>
      <CarCard car={cars[index]} />
    </div>
  )}
</FixedSizeList>
```

#### 4. Image Optimization
```typescript
// الحد من حجم الصور والضغط
import imageCompression from 'browser-image-compression';

const compressImage = async (file: File) => {
  const options = {
    maxSizeMB: 1,
    maxWidthOrHeight: 1920,
    useWebWorker: true
  };
  return await imageCompression(file, options);
};

// تحويل إلى WebP
// استخدام Cloud Function للتحويل التلقائي
```

### 🔍 Firestore Query Optimization

```typescript
// ❌ بطيء: قراءة كل البيانات ثم الفلترة
const allCars = await getDocs(collection(db, 'cars'));
const filtered = allCars.docs
  .map(doc => doc.data())
  .filter(car => car.year > 2010 && car.price < 20000);

// ✅ سريع: الفلترة في الـ Query نفسه
const q = query(
  collection(db, 'cars'),
  where('year', '>', 2010),
  where('price', '<', 20000),
  orderBy('createdAt', 'desc'),
  limit(20)
);
const filtered = await getDocs(q);
```

### 📊 Bundle Size Analysis

```bash
# تحليل حجم الحزمة
npm run build:analyze

# النتيجة المتوقعة:
# - React: ~40KB
# - Firebase: ~60KB
# - Algolia: ~30KB
# - Styled Components: ~25KB
# - إجمالي: ~200KB (gzipped: ~60KB)
```

---

## 🛡️ الأمان والصلاحيات

### Firebase Security Rules

```typescript
// firestore.rules

rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // قاعدة عامة: رفض الوصول الافتراضي
    match /{document=**} {
      allow read, write: if false;
    }

    // السيارات: القراءة العامة، الكتابة للمالك فقط
    match /passenger_cars/{carId} {
      allow read: if true;
      allow create: if request.auth != null;
      allow update, delete: if request.auth.uid == resource.data.sellerId;
    }

    // المستخدمون: القراءة الجزئية، التحديث للمالك فقط
    match /users/{userId} {
      allow read: if resource.data.isPublic == true ||
                     request.auth.uid == userId;
      allow create: if request.auth.uid == userId;
      allow update, delete: if request.auth.uid == userId;
    }

    // الرسائل: المشاركون فقط
    match /messages/{messageId} {
      allow read, write: if request.auth.uid in resource.data.participants;
    }
  }
}
```

---

## 🔄 التدفق الأساسي للعمليات

### 1️⃣ تدفق إضافة سيارة جديدة

```
المستخدم يدخل /sell/auto
         ↓
يملأ النموذج (10 خطوات)
         ↓
يضغط "Submit"
         ↓
الفحص (Validation):
  - البيانات الإجبارية
  - صيغة البيانات
  - عدد الصور
         ↓
حفظ في Firestore:
  - إنشاء Document جديد
  - تعيين معرف رقمي
  - رفع الصور إلى Cloud Storage
         ↓
Cloud Function Trigger:
  - ضغط الصور (بـ WebP)
  - توليد الوصف (بـ AI)
  - إضافة للفهرس (Algolia)
         ↓
إرسال تأكيد البريد
         ↓
عرض رقم الإعلان الفريد
         ↓
الإعلان يظهر في الموقع
```

### 2️⃣ تدفق البحث والتصفية

```
المستخدم يدخل /cars أو /advanced-search
         ↓
يختار الفلاتر
         ↓
الضغط على "Search"
         ↓
البحث في Algolia:
  - معالجة الفلاتر
  - ترتيب النتائج
  - التصفح (Pagination)
         ↓
عرض النتائج:
  - شبكة من البطاقات
  - عدد النتائج
  - الفلاتر المطبقة
         ↓
النقر على سيارة:
  - فتح التفاصيل (/car/:id)
  - تسجيل المشاهدة (Analytics)
```

### 3️⃣ تدفق الرسائل

```
المستخدم A يفتح صفحة سيارة
         ↓
ينقر "إرسال رسالة"
         ↓
ينقل إلى /messages
         ↓
يكتب الرسالة الأولى
         ↓
يضغط "Send"
         ↓
إنشاء Channel في Realtime DB:
  - channelId = msg_{min}_{max}_car_{carId}
  - حفظ الرسالة الأولى
         ↓
المستخدم B يتلقى:
  - إشعار في التطبيق
  - إشعار بريد (إن فعّل)
         ↓
يرد على الرسالة
         ↓
حوار مستمر:
  - تحديث فوري (Realtime)
  - تخزين في Firestore (نسخة احتياطية)
```

---

## 📚 المصادر والتوثيق الإضافية

- **Firebase Docs:** https://firebase.google.com/docs
- **Algolia Docs:** https://www.algolia.com/doc/
- **React Docs:** https://react.dev
- **TypeScript Docs:** https://www.typescriptlang.org/docs

---

**✅ آخر تحديث:** 25 يناير 2026  
**📖 الإصدار:** 1.0.0 (تقني متقدم)  
**🎯 الهدف:** تعليم النموذج الذكي التفاصيل الفنية العميقة للمشروع
