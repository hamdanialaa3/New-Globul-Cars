# خطة التنفيذ الكاملة - تطبيق Koli One للموبايل
# IMPLEMENTATION ROADMAP - From Zero to App Store

**التاريخ:** 25 يناير 2026  
**الحالة:** جاهز للبدء  
**التقنية المختارة:** React Native + Expo

---

## تقييم الملفات الموجودة

### ما هو موجود حالياً:

| الملف | الحالة | ملاحظات |
|-------|--------|---------|
| `MOBILE_APP_MASTER_PLAN.md` | جيد | خطة عامة لكنها تحتاج تفاصيل تقنية |
| `PROMPT_FOR_VSCODE_AI.txt` | جيد | نص التخاطب للحصول على معلومات المشروع |
| `ابدأ_من_هنا.md` | جيد | دليل سريع للبدء |
| `web_project_doc/` | ممتاز | نسخة من وثائق المشروع الأصلي |
| `KOLI_ONE_MOBILE_COMPLETE_SPECIFICATION.md` | جديد | الوثيقة الشاملة 100% |

### التوصيات:

1. **الملفات الموجودة على السكة الصحيحة** - الهيكل جيد
2. **المفقود:** تفاصيل Firebase Config الفعلية، الأنواع TypeScript، الترجمات
3. **الإضافة المطلوبة:** هذا الملف + الوثيقة الشاملة الجديدة

---

## الخطوة 0: التحضير الفوري (قبل البرمجة)

### A. إنشاء مشروع Expo

```powershell
# افتح PowerShell في المجلد
cd "C:\Users\hamda\Desktop\New G Cars APP"

# إنشاء مشروع Expo جديد في مجلد فرعي 'mobile'
mkdir mobile
cd mobile
npx create-expo-app@latest . --template tabs

# أو إذا أردت في المجلد الرئيسي مباشرة (بعد نقل الوثائق):
# npx create-expo-app@latest . --template tabs
```

### B. نسخ الملفات الأساسية من المشروع الأصلي

```powershell
# من مشروع الويب إلى مجلد الموبايل
# يجب نسخ:

# 1. Firebase Config
# من: New Globul Cars\src\firebase\firebase-config.ts
# إلى: New G Cars APP\mobile\src\services\firebase\config.ts

# 2. Types
# من: New Globul Cars\src\types\CarListing.ts
# إلى: New G Cars APP\mobile\src\types\CarListing.ts

# 3. Subscription Plans
# من: New Globul Cars\src\config\subscription-plans.ts
# إلى: New G Cars APP\mobile\src\constants\subscriptionPlans.ts

# 4. Translations
# من: New Globul Cars\src\locales\bg\
# إلى: New G Cars APP\mobile\src\locales\bg\

# من: New Globul Cars\src\locales\en\
# إلى: New G Cars APP\mobile\src\locales\en\
```

### C. تثبيت التبعيات

```bash
cd "C:\Users\hamda\Desktop\New G Cars APP\mobile"

# Firebase
npx expo install @react-native-firebase/app @react-native-firebase/auth @react-native-firebase/firestore @react-native-firebase/storage @react-native-firebase/database @react-native-firebase/messaging

# Google Sign-In
npm install @react-native-google-signin/google-signin

# Algolia Search
npm install algoliasearch

# i18n
npm install i18next react-i18next

# Icons (بديل الإيموجي)
npm install lucide-react-native react-native-svg

# UI & Navigation
npx expo install react-native-reanimated react-native-gesture-handler

# Storage
npx expo install @react-native-async-storage/async-storage

# Image handling
npx expo install expo-image-picker expo-image-manipulator
```

---

## الخطوة 1: إعداد Firebase (اليوم الأول)

### firebase.config.ts

```typescript
// src/services/firebase/config.ts
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { getDatabase } from 'firebase/database';

const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
  authDomain: "fire-new-globul.firebaseapp.com",
  projectId: "fire-new-globul",
  storageBucket: "fire-new-globul.appspot.com",
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
  databaseURL: "https://fire-new-globul-default-rtdb.europe-west1.firebasedatabase.app"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export const realtimeDb = getDatabase(app);
export default app;
```

### .env

```bash
# .env (لا ترفعه إلى Git!)
EXPO_PUBLIC_FIREBASE_API_KEY=your_api_key
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
EXPO_PUBLIC_FIREBASE_APP_ID=your_app_id
EXPO_PUBLIC_ALGOLIA_APP_ID=RTGDK12KTJ
EXPO_PUBLIC_ALGOLIA_SEARCH_KEY=your_search_key
```

---

## الخطوة 2: إعداد هيكل المشروع (اليوم الثاني)

### هيكل المجلدات

```
mobile/
├── app/                          # Expo Router
│   ├── (tabs)/
│   │   ├── _layout.tsx
│   │   ├── index.tsx             # Home
│   │   ├── search.tsx            # Search
│   │   ├── messages.tsx          # Messages
│   │   └── profile.tsx           # Profile
│   ├── car/
│   │   └── [sellerId]/
│   │       └── [carId]/
│   │           ├── index.tsx     # Details
│   │           └── edit.tsx      # Edit
│   ├── profile/
│   │   ├── [id].tsx              # My profile
│   │   └── view/
│   │       └── [id].tsx          # View others
│   ├── messages/
│   │   └── [channelId].tsx       # Chat
│   ├── advanced-search.tsx
│   └── _layout.tsx
│
├── src/
│   ├── components/
│   ├── services/
│   ├── hooks/
│   ├── contexts/
│   ├── types/
│   ├── constants/
│   ├── locales/
│   └── utils/
│
├── assets/
├── app.json
└── package.json
```

---

## الخطوة 3: المصادقة (الأسبوع الأول)

### AuthContext.tsx

```typescript
// src/contexts/AuthContext.tsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import { auth, db } from '@/services/firebase/config';
import { onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';

interface User {
  uid: string;
  numericId: number;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  subscriptionTier: 'free' | 'dealer' | 'company';
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        // Fetch user data from Firestore
        const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
        if (userDoc.exists()) {
          const userData = userDoc.data();
          setUser({
            uid: firebaseUser.uid,
            numericId: userData.numericId,
            email: firebaseUser.email,
            displayName: userData.displayName || firebaseUser.displayName,
            photoURL: userData.photoURL || firebaseUser.photoURL,
            subscriptionTier: userData.subscriptionTier || 'free',
          });
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const signOut = async () => {
    await auth.signOut();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
```

### Profile Guard (Constitution Rule)

```typescript
// src/utils/navigation.ts

/**
 * CRITICAL: تطبيق قواعد الدستور للتوجيه
 */
export function getProfileRoute(
  targetNumericId: number,
  currentUserNumericId: number | null
): string {
  if (currentUserNumericId === targetNumericId) {
    // صفحتي الخاصة
    return `/profile/${targetNumericId}`;
  } else {
    // بروفايل شخص آخر - تحويل إلى view
    return `/profile/view/${targetNumericId}`;
  }
}

/**
 * Car URL builder
 */
export function getCarRoute(
  sellerNumericId: number,
  carNumericId: number,
  edit: boolean = false
): string {
  const base = `/car/${sellerNumericId}/${carNumericId}`;
  return edit ? `${base}/edit` : base;
}

/**
 * Channel ID generator (deterministic)
 */
export function generateChannelId(
  user1NumericId: number,
  user2NumericId: number,
  carNumericId: number
): string {
  const min = Math.min(user1NumericId, user2NumericId);
  const max = Math.max(user1NumericId, user2NumericId);
  return `msg_${min}_${max}_car_${carNumericId}`;
}
```

---

## الخطوة 4: البحث والسيارات (الأسبوع الثاني)

### CarService.ts

```typescript
// src/services/cars/carService.ts
import { db } from '@/services/firebase/config';
import { 
  collection, 
  query, 
  where, 
  orderBy, 
  limit, 
  getDocs,
  doc,
  getDoc
} from 'firebase/firestore';
import { CarListing } from '@/types/CarListing';

const VEHICLE_COLLECTIONS = [
  'passenger_cars', 'suvs', 'vans', 
  'motorcycles', 'trucks', 'buses'
] as const;

/**
 * Get cars with filters
 */
export async function getCars(
  filters: Partial<CarListing> = {},
  options: { limit?: number; page?: number } = {}
): Promise<CarListing[]> {
  const allCars: CarListing[] = [];
  
  for (const collectionName of VEHICLE_COLLECTIONS) {
    const carsRef = collection(db, collectionName);
    let q = query(
      carsRef,
      where('status', '==', 'active'),
      orderBy('createdAt', 'desc'),
      limit(options.limit || 20)
    );
    
    // Add filters
    if (filters.make) {
      q = query(q, where('make', '==', filters.make));
    }
    if (filters.fuelType) {
      q = query(q, where('fuelType', '==', filters.fuelType));
    }
    // ... more filters
    
    const snapshot = await getDocs(q);
    snapshot.forEach((doc) => {
      allCars.push({ id: doc.id, ...doc.data() } as CarListing);
    });
  }
  
  return allCars;
}

/**
 * Get single car by numeric IDs
 */
export async function getCarByNumericId(
  sellerNumericId: number,
  carNumericId: number
): Promise<CarListing | null> {
  for (const collectionName of VEHICLE_COLLECTIONS) {
    const carsRef = collection(db, collectionName);
    const q = query(
      carsRef,
      where('sellerNumericId', '==', sellerNumericId),
      where('numericId', '==', carNumericId),
      limit(1)
    );
    
    const snapshot = await getDocs(q);
    if (!snapshot.empty) {
      const doc = snapshot.docs[0];
      return { id: doc.id, ...doc.data() } as CarListing;
    }
  }
  
  return null;
}
```

### Algolia Search

```typescript
// src/services/search/algoliaSearch.ts
import algoliasearch from 'algoliasearch/lite';

const client = algoliasearch(
  process.env.EXPO_PUBLIC_ALGOLIA_APP_ID!,
  process.env.EXPO_PUBLIC_ALGOLIA_SEARCH_KEY!
);

const index = client.initIndex('cars_bg');

interface SearchOptions {
  page?: number;
  hitsPerPage?: number;
  filters?: string;
}

export async function searchCars(
  query: string,
  options: SearchOptions = {}
) {
  const { hits, nbHits, page, nbPages } = await index.search(query, {
    page: options.page || 0,
    hitsPerPage: options.hitsPerPage || 20,
    filters: options.filters || 'status:active',
  });
  
  return {
    cars: hits,
    total: nbHits,
    currentPage: page,
    totalPages: nbPages,
  };
}
```

---

## الخطوة 5: الرسائل (الأسبوع الثالث)

### MessagingService.ts

```typescript
// src/services/messaging/messagingService.ts
import { realtimeDb } from '@/services/firebase/config';
import { 
  ref, 
  push, 
  set, 
  onValue, 
  query, 
  orderByChild,
  serverTimestamp
} from 'firebase/database';

interface Message {
  id: string;
  senderId: string;
  senderNumericId: number;
  text: string;
  type: 'text' | 'offer' | 'image';
  timestamp: number;
  isRead: boolean;
}

/**
 * Send message
 */
export async function sendMessage(
  channelId: string,
  senderId: string,
  senderNumericId: number,
  text: string,
  type: 'text' | 'offer' | 'image' = 'text'
) {
  const messagesRef = ref(realtimeDb, `messages/${channelId}`);
  const newMessageRef = push(messagesRef);
  
  await set(newMessageRef, {
    senderId,
    senderNumericId,
    text,
    type,
    timestamp: serverTimestamp(),
    isRead: false,
  });
  
  // Update channel lastMessageAt
  const channelRef = ref(realtimeDb, `channels/${channelId}/lastMessageAt`);
  await set(channelRef, serverTimestamp());
}

/**
 * Listen to messages
 */
export function subscribeToMessages(
  channelId: string,
  callback: (messages: Message[]) => void
) {
  const messagesRef = ref(realtimeDb, `messages/${channelId}`);
  const q = query(messagesRef, orderByChild('timestamp'));
  
  return onValue(q, (snapshot) => {
    const messages: Message[] = [];
    snapshot.forEach((child) => {
      messages.push({
        id: child.key!,
        ...child.val(),
      });
    });
    callback(messages);
  });
}
```

---

## الخطوة 6: UI Components (مستمر)

### CarCard.tsx

```typescript
// src/components/CarCard.tsx
import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { CarListing } from '@/types/CarListing';
import { getCarRoute } from '@/utils/navigation';
import { MapPin, Fuel, Settings } from 'lucide-react-native';

interface Props {
  car: CarListing;
}

export function CarCard({ car }: Props) {
  const router = useRouter();
  
  const handlePress = () => {
    router.push(getCarRoute(car.sellerNumericId, car.numericId));
  };
  
  return (
    <TouchableOpacity style={styles.card} onPress={handlePress}>
      <Image 
        source={{ uri: car.images?.[0] || 'placeholder.png' }}
        style={styles.image}
      />
      <View style={styles.content}>
        <Text style={styles.title}>{car.make} {car.model}</Text>
        <Text style={styles.year}>{car.year}</Text>
        <Text style={styles.price}>{car.price.toLocaleString()} EUR</Text>
        
        <View style={styles.details}>
          <View style={styles.detail}>
            <MapPin size={14} color="#666" />
            <Text style={styles.detailText}>{car.city}</Text>
          </View>
          <View style={styles.detail}>
            <Fuel size={14} color="#666" />
            <Text style={styles.detailText}>{car.fuelType}</Text>
          </View>
          <View style={styles.detail}>
            <Settings size={14} color="#666" />
            <Text style={styles.detailText}>{car.transmission}</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  image: {
    width: '100%',
    height: 180,
    resizeMode: 'cover',
  },
  content: {
    padding: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1A1D2E',
  },
  year: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  price: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FF6B35',
    marginTop: 8,
  },
  details: {
    flexDirection: 'row',
    marginTop: 12,
    gap: 16,
  },
  detail: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  detailText: {
    fontSize: 12,
    color: '#666',
  },
});
```

---

## الجدول الزمني الكامل

| الأسبوع | المهام | الإنجاز المتوقع |
|---------|--------|-----------------|
| **1** | إعداد المشروع + Firebase + Auth | 100% |
| **2** | البحث البسيط + قائمة السيارات | 100% |
| **3** | تفاصيل السيارة + Algolia | 100% |
| **4** | البحث المتقدم + الفلاتر | 100% |
| **5** | الرسائل + FCM | 100% |
| **6** | المفضلة + البروفايل | 100% |
| **7** | الاشتراكات + الإعدادات | 100% |
| **8** | الاختبار + EAS Build + النشر | 100% |

---

## قائمة التحقق النهائية

### قبل البدء:
- [ ] نسخ Firebase Config من المشروع الأصلي
- [ ] إنشاء مشروع Expo
- [ ] تثبيت جميع التبعيات
- [ ] إعداد .env مع المفاتيح

### أثناء التطوير:
- [ ] تطبيق قواعد الدستور (Numeric ID, لا UID في الروابط)
- [ ] استخدام Lucide Icons (لا إيموجي)
- [ ] الملفات لا تزيد عن 300 سطر
- [ ] i18n لكل النصوص (bg/en)

### قبل النشر:
- [ ] اختبار جميع الشاشات
- [ ] اختبار المصادقة (Google, Email, Guest)
- [ ] اختبار البحث (Firestore + Algolia)
- [ ] اختبار الرسائل
- [ ] اختبار Push Notifications
- [ ] EAS Build لـ iOS + Android
- [ ] سياسة الخصوصية
- [ ] لقطات شاشة للمتاجر

---

**هذه الوثيقة + KOLI_ONE_MOBILE_COMPLETE_SPECIFICATION.md = كل ما يحتاجه أي نموذج ذكي لبناء التطبيق من الصفر.**
