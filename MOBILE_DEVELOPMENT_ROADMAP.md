# 🚀 خطة التطوير المفصلة - Mobile Frontend (6 أسابيع)

## الأسبوع 1: إصلاح المشاكل الحرجة (40-50 ساعة)

### المهمة 1.1: إزالة console.log violations ⏱️ 2-3 ساعات

**الملفات المتأثرة:**
```
mobile_new/src/components/home/
  ├─ HeroSection.tsx (3 console.log)
  ├─ CategoriesSection.tsx (2 console.log)
  ├─ FeaturedShowcase.tsx (2 console.log)
  └─ SearchWidget.tsx (2 console.log)

mobile_new/src/services/
  ├─ ListingService.ts (4 console.error/log)
  ├─ SellService.ts (3 console.log)
  └─ firebase.ts (1 console.log)

mobile_new/app/
  ├─ car/[id].tsx (2 console.log)
  └─ profile/my-ads.tsx (1 console.log)
```

**الكود الصحيح:**
```tsx
// ❌ قبل
console.log('Loading listings...');
console.error('Error:', error);

// ✅ بعد
import { logger } from '@/services/logger-service';
logger.info('Loading listings...');
logger.error('Error loading listings', error);
```

**Checklist:**
- [ ] إنشاء `src/services/logger-service.ts`
- [ ] استبدال جميع console.log
- [ ] تشغيل grep للتحقق من عدم وجود violations
- [ ] Commit: "fix: remove console.log violations"

---

### المهمة 1.2: إصلاح Firebase Memory Leaks ⏱️ 4-5 ساعات

**المشكلة:**
```tsx
// ❌ BAD: listeners لا تُفصل
useEffect(() => {
  const q = query(collection(db, 'cars'), where('status', '==', 'active'));
  onSnapshot(q, (snapshot) => {
    setListings(snapshot.docs.map(doc => doc.data()));
  });
}, []);
```

**الحل:**
```tsx
// ✅ GOOD: cleanup listeners
useEffect(() => {
  let isMounted = true;
  
  const q = query(collection(db, 'cars'), where('status', '==', 'active'));
  const unsubscribe = onSnapshot(q, (snapshot) => {
    if (isMounted) {
      setListings(snapshot.docs.map(doc => doc.data()));
    }
  });
  
  return () => {
    isMounted = false;
    unsubscribe();
  };
}, []);
```

**الملفات بالأولوية:**
1. `ListingService.ts` - 8 listeners ⚠️
2. `RecentBrowsingSection.tsx` - 3 listeners
3. `SearchWidget.tsx` - 4 listeners
4. `FeaturedShowcase.tsx` - 2 listeners

**Checklist:**
- [ ] إنشاء utility `useFirestoreQuery` hook
- [ ] تحديث ListingService.ts
- [ ] تحديث جميع components
- [ ] اختبار استقرار التطبيق (30 دقيقة browsing)
- [ ] Commit: "fix: cleanup Firebase listeners"

---

### المهمة 1.3: Image Compression Service ⏱️ 3-4 ساعات

**الحل:**
```tsx
// src/services/ImageCompressionService.ts
import { manipulateAsync, SaveFormat } from 'expo-image-manipulator';

export const ImageCompressionService = {
  async compressImage(uri: string, quality = 0.7) {
    const result = await manipulateAsync(uri, 
      [{ resize: { width: 1280, height: 720 } }],
      { compress: quality, format: SaveFormat.JPEG }
    );
    return result.uri; // 5MB → 200-300KB
  },

  async compressThumbnail(uri: string) {
    const result = await manipulateAsync(uri,
      [{ resize: { width: 400, height: 300 } }],
      { compress: 0.8, format: SaveFormat.JPEG }
    );
    return result.uri;
  }
};
```

**التطبيق في:**
1. `VisualSearchTeaser.tsx` - صور الكاميرا
2. `components/sell/PhotosStep.tsx` - رفع صور البيع
3. `ImageUpload.tsx` - رفع الصور العامة

**Checklist:**
- [ ] إنشاء `ImageCompressionService.ts`
- [ ] تطبيق في PhotosStep.tsx
- [ ] اختبار حجم الملفات (قياس قبل/بعد)
- [ ] Commit: "feat: add image compression service"

---

### المهمة 1.4: Algolia Search Integration ⏱️ 4-5 ساعات

**التثبيت:**
```bash
npm install algoliasearch
```

**الخدمة:**
```tsx
// src/services/AlgoliaSearchService.ts
import algoliasearch from 'algoliasearch';

const client = algoliasearch(
  process.env.ALGOLIA_APP_ID!,
  process.env.ALGOLIA_SEARCH_KEY!
);
const index = client.initIndex('cars');

export const AlgoliaSearchService = {
  async search(query: string, filters?: string) {
    const results = await index.search(query, {
      filters,
      hitsPerPage: 20,
    });
    return results.hits;
  },

  async autocomplete(prefix: string) {
    const results = await index.search(prefix, {
      hitsPerPage: 10,
    });
    return results.hits;
  }
};
```

**التطبيق:**
```tsx
// في useMobileSearch.ts
import { AlgoliaSearchService } from '@/services/AlgoliaSearchService';

const search = async () => {
  setLoading(true);
  try {
    const results = await AlgoliaSearchService.search(searchQuery, filters);
    setResults(results);
  } catch (error) {
    logger.error('Search failed', error);
  } finally {
    setLoading(false);
  }
};
```

**Checklist:**
- [ ] إضافة Algolia credentials في `.env`
- [ ] إنشاء `AlgoliaSearchService.ts`
- [ ] تحديث `useMobileSearch.ts`
- [ ] اختبار السرعة (< 500ms للبحث)
- [ ] Commit: "feat: integrate Algolia search"

---

### المهمة 1.5: Error Handling Improvement ⏱️ 3-4 ساعات

**الحل:**
```tsx
// src/utils/errorHandler.ts
export const handleError = (error: unknown, context: string) => {
  let message = 'Something went wrong';
  
  if (error instanceof FirebaseError) {
    message = getFirebaseErrorMessage(error.code);
  } else if (error instanceof Error) {
    message = error.message;
  }
  
  logger.error(`[${context}] ${message}`, error);
  return message;
};

function getFirebaseErrorMessage(code: string) {
  const messages: Record<string, string> = {
    'auth/user-not-found': 'User not found',
    'auth/wrong-password': 'Wrong password',
    'firestore/permission-denied': 'Access denied',
    'firestore/unavailable': 'Service temporarily unavailable',
  };
  return messages[code] || 'An error occurred';
}
```

**التطبيق:**
```tsx
try {
  const listings = await ListingService.getListings();
  setListings(listings);
} catch (error) {
  const message = handleError(error, 'ListingService.getListings');
  Alert.alert('Error', message);
}
```

**Checklist:**
- [ ] إنشاء `utils/errorHandler.ts`
- [ ] تحديث 20+ try-catch blocks
- [ ] اختبار جميع error paths
- [ ] Commit: "improve: better error handling"

---

### المهمة 1.6: Error UI States ⏱️ 2-3 ساعات

**إنشاء مكونات:**
```tsx
// src/components/common/ErrorState.tsx
export function ErrorState({
  error,
  onRetry
}: {
  error: string;
  onRetry: () => void;
}) {
  return (
    <Container>
      <Icon name="alert-circle" size={48} />
      <Title>Error</Title>
      <Message>{error}</Message>
      <RetryButton onPress={onRetry}>
        <RetryText>Try Again</RetryText>
      </RetryButton>
    </Container>
  );
}

// src/components/common/LoadingState.tsx
export function LoadingState({ message = 'Loading...' }) {
  return (
    <Container>
      <ActivityIndicator size="large" />
      <Message>{message}</Message>
    </Container>
  );
}

// src/components/common/EmptyState.tsx
export function EmptyState({
  icon,
  title,
  message,
  action
}: EmptyStateProps) {
  return (
    <Container>
      <Icon>{icon}</Icon>
      <Title>{title}</Title>
      <Message>{message}</Message>
      {action && <ActionButton onPress={action.onPress}>{action.label}</ActionButton>}
    </Container>
  );
}
```

**Checklist:**
- [ ] إنشاء 3 مكونات states
- [ ] تطبيق في 10+ screens
- [ ] اختبار جميع scenarios
- [ ] Commit: "feat: add error and loading states"

---

### المهمة 1.7: Firebase Security Rules ⏱️ 2-3 ساعات

**القواعس الحالية:** منفتحة للجميع ❌

**الحل:**
```js
// firebase/firestore.rules
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Cars collection
    match /cars/{doc=**} {
      allow read: if true; // All can view
      allow create: if request.auth != null && request.auth.uid == request.resource.data.sellerId;
      allow update: if request.auth != null && request.auth.uid == resource.data.sellerId;
      allow delete: if request.auth != null && request.auth.uid == resource.data.sellerId;
    }
    
    // Messages collection
    match /messages/{doc=**} {
      allow read: if request.auth != null && 
        (request.auth.uid == resource.data.senderId || 
         request.auth.uid == resource.data.receiverId);
      allow create: if request.auth != null && 
        request.auth.uid == request.resource.data.senderId;
    }
    
    // Users collection
    match /users/{userId} {
      allow read: if true;
      allow write: if request.auth != null && 
        request.auth.uid == userId;
    }
  }
}
```

**Checklist:**
- [ ] تحديث Firestore Security Rules
- [ ] اختبار مع unauthorized user
- [ ] اختبار مع user مختلف
- [ ] Commit: "security: implement firestore rules"

---

### المهمة 1.8: Testing & Verification ⏱️ 4-6 ساعات

**الاختبارات:**
- [ ] Manual testing on iOS simulator
- [ ] Manual testing on Android emulator
- [ ] Test 30 minutes of browsing (no crashes)
- [ ] Test slow network (2G simulation)
- [ ] Test offline mode
- [ ] Test image uploads with compression
- [ ] Test search performance (< 1 sec)
- [ ] Test error states

**Performance Testing:**
```bash
# قياس الأداء
npm run test:performance

# Memory usage
# Opening search: 80MB → 100MB
# Uploading images: 150MB peak
# After garbage collection: < 80MB
```

**Checklist:**
- [ ] جميع الاختبارات تمرّت ✅
- [ ] لا crash reports
- [ ] Performance metrics جيدة
- [ ] Commit: "test: week 1 verification passed"

---

## الأسبوع 2: Real-time Messaging ⏱️ 12 ساعات

### المهمة 2.1: Chat Service

```tsx
// src/services/ChatService.ts
export const ChatService = {
  async sendMessage(senderId: string, receiverId: string, text: string) {
    const docRef = await addDoc(collection(db, 'messages'), {
      senderId,
      receiverId,
      text,
      timestamp: serverTimestamp(),
      read: false
    });
    return docRef.id;
  },

  subscribeToMessages(userId: string, otherUserId: string, callback) {
    const q = query(
      collection(db, 'messages'),
      where('senderId', 'in', [userId, otherUserId]),
      where('receiverId', 'in', [userId, otherUserId]),
      orderBy('timestamp', 'desc')
    );
    return onSnapshot(q, callback);
  }
};
```

### المهمة 2.2: Chat UI Component

```tsx
// src/components/chat/ChatScreen.tsx
export function ChatScreen({ userId, otherUserId }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  
  useEffect(() => {
    const unsubscribe = ChatService.subscribeToMessages(
      userId,
      otherUserId,
      (snapshot) => {
        setMessages(snapshot.docs.map(doc => doc.data()));
      }
    );
    return unsubscribe;
  }, [userId, otherUserId]);
  
  const handleSend = async () => {
    await ChatService.sendMessage(userId, otherUserId, input);
    setInput('');
  };
  
  return (
    <Container>
      <MessageList messages={messages} />
      <InputBox value={input} onChangeText={setInput} onSend={handleSend} />
    </Container>
  );
}
```

---

## الأسبوع 3: Push Notifications ⏱️ 6 ساعات

```tsx
// src/services/PushNotificationService.ts
import * as Notifications from 'expo-notifications';

export const PushNotificationService = {
  async registerForPushNotifications(userId: string) {
    const token = (await Notifications.getExpoPushTokenAsync()).data;
    
    // Save to Firestore
    await updateDoc(doc(db, 'users', userId), {
      expoPushToken: token
    });
  },

  async sendPushNotification(expoPushToken: string, title: string, body: string) {
    await fetch('https://exp.host/--/api/v2/push/send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        to: expoPushToken,
        sound: 'default',
        title,
        body
      })
    });
  }
};
```

---

## الأسابيع 4-5: Advanced Features ⏱️ 40 ساعات

### المهام الرئيسية:
1. Advanced Search Filters (5 ساعات)
2. Analytics Dashboard (4 ساعات)
3. Seller Rating System (4 ساعات)
4. Reviews & Comments (5 ساعات)
5. Performance Optimization (12 ساعة)

---

## الأسبوع 6: Polish & Launch ⏱️ 20 ساعة

### Final Checklist:
- [ ] All tests passing
- [ ] Performance metrics: < 3sec initial load
- [ ] Zero critical issues
- [ ] Full GDPR compliance
- [ ] App Store submission prep
- [ ] Release notes ready
- [ ] Beta testing group notified
- [ ] Production ready ✅

---

**المجموع: 180-200 ساعة (4-5 أسابيع × 50 ساعة = ~1 مطور كامل الوقت)**
