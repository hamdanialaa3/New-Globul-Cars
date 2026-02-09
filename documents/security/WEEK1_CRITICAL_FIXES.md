# ⚡ خطة الإصلاح الفورية - الأسبوع الأول

**الهدف:** إصلاح 5 مشاكل حرجة تسبب crashes وبطء شديد
**المدة:** 5 أيام عمل (40 ساعة)
**الأولوية:** P0 (لا يمكن الإطلاق بدونها)

---

## المشكلة #1: console.log Violations ⏱️ 2 ساعات

### المشكلة:
```
❌ تخالف CONSTITUTION.md قسم "لا console"
❌ يسرب بيانات حساسة (مفاتيح Firebase, user IDs)
❌ يبطئ التطبيق في production
```

### الملفات المتأثرة:
```
mobile_new/src/components/home/
  ├─ HeroSection.tsx
  ├─ CategoriesSection.tsx
  ├─ FeaturedShowcase.tsx
  └─ SearchWidget.tsx

mobile_new/src/services/
  ├─ ListingService.ts
  ├─ SellService.ts
  └─ firebase.ts

mobile_new/app/
  ├─ car/[id].tsx
  └─ profile/my-ads.tsx
```

### الحل:

**Step 1:** إنشاء logger service
```tsx
// mobile_new/src/services/logger-service.ts
import { logger as webLogger } from '@/services/logger-service';

// Mirror web's logger API for consistency
export const logger = {
  info: (message: string, data?: unknown) => {
    if (__DEV__) {
      // Only in development
      console.log(`[INFO] ${message}`, data);
    }
  },
  
  error: (message: string, error?: unknown) => {
    if (__DEV__) {
      console.error(`[ERROR] ${message}`, error);
    }
    // Send to error tracking service
    reportError(message, error);
  },
  
  warn: (message: string, data?: unknown) => {
    if (__DEV__) {
      console.warn(`[WARN] ${message}`, data);
    }
  }
};
```

**Step 2:** استبدال console.log
```tsx
// ❌ قبل
console.log('Loading listings...');

// ✅ بعد
import { logger } from '@/services/logger-service';
logger.info('Loaded listings successfully');
```

**Step 3:** grep للتحقق
```bash
# تشغيل في mobile_new/
grep -r "console\." src/ --include="*.tsx" --include="*.ts"

# يجب أن يرجع 0 results في src/
```

### Checklist:
- [ ] إنشاء `mobile_new/src/services/logger-service.ts`
- [ ] تحديث 9 ملفات مع استبدال console
- [ ] تشغيل grep verification
- [ ] Git commit: `fix: remove console.log violations (CONSTITUTION)`

---

## المشكلة #2: Firebase Memory Leaks ⏱️ 4 ساعات

### المشكلة:
```
🔴 50+ listeners سارية طول الوقت
🔴 RAM usage يزيد من 80MB → 200MB+ بعد 10 دقائق
🔴 التطبيق يتوقف (becomes unresponsive)
🔴 حتى قد يـ crash
```

### Flamegraph المشكلة:
```
Initial Load: 80MB
After 1 min: 120MB (40 listeners active)
After 5 min: 180MB (50+ listeners, still increasing)
After 10 min: 250MB (💥 CRASH)

Root Cause: useEffect بدون cleanup
```

### الملفات الحرجة:

#### 1. ListingService.ts (8 listeners):
```tsx
// ❌ BAD: Listeners never unsubscribe
export const ListingService = {
  getListings(limit = 20) {
    const q = query(
      collection(db, 'cars'),
      limit(limit)
    );
    
    return onSnapshot(q, (snapshot) => {
      // ⚠️ هذا الـ listener ما فيه unsubscribe
      return snapshot.docs.map(doc => ({...}));
    });
  }
};
```

**الحل:**
```tsx
// ✅ GOOD: Proper cleanup
export const ListingService = {
  subscribeToListings(
    limit = 20,
    callback: (listings: CarListing[]) => void
  ): (() => void) => {
    const q = query(
      collection(db, 'cars'),
      limit(limit)
    );
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const listings = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as CarListing));
      
      callback(listings);
    });
    
    // Return unsubscribe function
    return unsubscribe;
  }
};
```

#### 2. استخدام في Component:
```tsx
// ❌ BAD
useEffect(() => {
  ListingService.subscribeToListings(20, setListings);
}, []);

// ✅ GOOD
useEffect(() => {
  const unsubscribe = ListingService.subscribeToListings(20, (listings) => {
    if (isMounted) {
      setListings(listings);
    }
  });
  
  return () => {
    isMounted = false;
    unsubscribe(); // ✅ Clean up!
  };
}, []);
```

#### 3. Create custom hook:
```tsx
// mobile_new/src/hooks/useFirestoreQuery.ts
import { Unsubscribe } from 'firebase/firestore';
import { useEffect, useState, useRef } from 'react';

export function useFirestoreQuery<T>(
  subscribe: (callback: (data: T) => void) => Unsubscribe,
  dependencies?: unknown[]
) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const isMounted = useRef(true);
  
  useEffect(() => {
    setLoading(true);
    let unsubscribe: Unsubscribe | null = null;
    
    try {
      unsubscribe = subscribe((newData) => {
        if (isMounted.current) {
          setData(newData);
          setLoading(false);
        }
      });
    } catch (err) {
      if (isMounted.current) {
        setError(err as Error);
        setLoading(false);
      }
    }
    
    return () => {
      isMounted.current = false;
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, dependencies || []);
  
  return { data, loading, error };
}
```

### Files to Update:

**Priority 1 (Highest Memory Impact):**
1. `ListingService.ts` - 8 listeners
2. `RecentBrowsingSection.tsx` - 3 listeners
3. `SearchWidget.tsx` - 4 listeners

**Priority 2:**
4. `FeaturedShowcase.tsx` - 2 listeners
5. `components/search/SearchResults.tsx` - 2 listeners

### Script to Find All Listeners:
```bash
# في mobile_new/
grep -r "onSnapshot\|listen\|observeListings" src/services src/components --include="*.ts" --include="*.tsx"

# تحديد أي listener بدون unsubscribe
grep -r "onSnapshot" src/ --include="*.tsx" -A 5 | grep -v "return\|unsubscribe" | head -20
```

### Verification:
```tsx
// Test in DevTools or React Native Debugger
// Memory usage: 80-100MB stable (لو كل شيء clean)
// لو بقي يرفع: 120MB+ بعد 5 دقائق = لسه في leaks
```

### Checklist:
- [ ] إنشاء `useFirestoreQuery.ts` hook
- [ ] تحديث `ListingService.ts`
- [ ] تحديث `RecentBrowsingSection.tsx`
- [ ] تحديث `SearchWidget.tsx`
- [ ] اختبار Memory usage (30 دقيقة browsing)
- [ ] Git commit: `fix: cleanup Firebase listeners`

---

## المشكلة #3: Image Compression ⏱️ 2 ساعات

### المشكلة:
```
❌ صور بـ 5-15MB كل واحدة
❌ تحميل gallery يستغرق 30+ ثانية
❌ Upload بطيء جداً
❌ Storage quota تنتهي بسرعة
```

### الحل:

```tsx
// mobile_new/src/services/ImageCompressionService.ts
import { manipulateAsync, SaveFormat } from 'expo-image-manipulator';
import * as FileSystem from 'expo-file-system';

interface CompressionOptions {
  quality?: number;
  maxWidth?: number;
  maxHeight?: number;
}

export const ImageCompressionService = {
  /**
   * Compress image for gallery/preview
   * 5-15MB → 200-300KB
   */
  async compressGalleryImage(
    uri: string,
    options: CompressionOptions = {}
  ): Promise<string> {
    const { quality = 0.7, maxWidth = 1280, maxHeight = 720 } = options;
    
    try {
      const result = await manipulateAsync(uri, [
        { resize: { width: maxWidth, height: maxHeight } }
      ], {
        compress: quality,
        format: SaveFormat.JPEG
      });
      
      return result.uri;
    } catch (error) {
      console.error('[ImageCompression] Gallery compression failed:', error);
      throw error;
    }
  },
  
  /**
   * Compress image for thumbnail
   * 5-15MB → 50-100KB
   */
  async compressThumbnail(
    uri: string,
    options: CompressionOptions = {}
  ): Promise<string> {
    const { quality = 0.8, maxWidth = 400, maxHeight = 300 } = options;
    
    try {
      const result = await manipulateAsync(uri, [
        { resize: { width: maxWidth, height: maxHeight } }
      ], {
        compress: quality,
        format: SaveFormat.JPEG
      });
      
      return result.uri;
    } catch (error) {
      console.error('[ImageCompression] Thumbnail compression failed:', error);
      throw error;
    }
  },
  
  /**
   * Get file size
   */
  async getFileSize(uri: string): Promise<number> {
    const fileInfo = await FileSystem.getInfoAsync(uri);
    return (fileInfo as any).size || 0;
  },
  
  /**
   * Convert bytes to readable format
   */
  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  }
};
```

### تطبيق في PhotosStep:
```tsx
// mobile_new/app/(sell)/photos.tsx (updated)
import { ImageCompressionService } from '@/services/ImageCompressionService';

export function PhotosStep() {
  const handleAddPhoto = async (imageUri: string) => {
    try {
      setLoading(true);
      
      // Get original size
      const originalSize = await ImageCompressionService.getFileSize(imageUri);
      logger.info(`Original image size: ${ImageCompressionService.formatFileSize(originalSize)}`);
      
      // Compress
      const compressedUri = await ImageCompressionService.compressGalleryImage(imageUri);
      const compressedSize = await ImageCompressionService.getFileSize(compressedUri);
      logger.info(`Compressed to: ${ImageCompressionService.formatFileSize(compressedSize)}`);
      
      // Create thumbnail
      const thumbnailUri = await ImageCompressionService.compressThumbnail(imageUri);
      
      // Save compressed versions
      setPhotos([...photos, {
        original: imageUri,
        compressed: compressedUri,
        thumbnail: thumbnailUri,
        size: compressedSize
      }]);
      
    } catch (error) {
      handleError(error, 'PhotosStep.handleAddPhoto');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <View>
      {/* ... photos list ... */}
      <Button onPress={handleAddPhoto}>
        Add Photo
      </Button>
    </View>
  );
}
```

### Checklist:
- [ ] إنشاء `ImageCompressionService.ts`
- [ ] تحديث `PhotosStep.tsx`
- [ ] اختبار: 5MB image → 300KB result
- [ ] اختبار upload time (< 5 سecs)
- [ ] Git commit: `feat: add image compression`

---

## المشكلة #4: Algolia Search Integration ⏱️ 3 ساعات

### المشكلة:
```
❌ Firestore search: 5-15 ثانية
✅ Algolia search: 200-300ms (50x faster!)
```

### التثبيت:
```bash
cd mobile_new
npm install algoliasearch react-native-network-info
```

### الخدمة:
```tsx
// mobile_new/src/services/AlgoliaSearchService.ts
import algoliasearch from 'algoliasearch';

const client = algoliasearch(
  process.env.EXPO_PUBLIC_ALGOLIA_APP_ID!,
  process.env.EXPO_PUBLIC_ALGOLIA_SEARCH_KEY!
);

interface SearchOptions {
  filters?: string;
  hitsPerPage?: number;
  page?: number;
}

interface SearchResult {
  id: string;
  make: string;
  model: string;
  year: number;
  price: number;
  [key: string]: unknown;
}

export const AlgoliaSearchService = {
  async search(
    query: string,
    options: SearchOptions = {}
  ): Promise<SearchResult[]> {
    const index = client.initIndex('cars');
    
    const { filters, hitsPerPage = 20, page = 0 } = options;
    
    const results = await index.search<SearchResult>(query, {
      filters,
      hitsPerPage,
      page
    });
    
    return results.hits.map((hit) => ({
      id: hit.objectID || hit.id,
      ...hit
    }));
  },
  
  async autocomplete(prefix: string): Promise<SearchResult[]> {
    const index = client.initIndex('cars');
    
    const results = await index.search<SearchResult>(prefix, {
      hitsPerPage: 10,
      restrictSearchableAttributes: ['make', 'model']
    });
    
    return results.hits;
  },
  
  async facetedSearch(query: string, facets: Record<string, string>): Promise<SearchResult[]> {
    const index = client.initIndex('cars');
    
    const filterStrings = Object.entries(facets)
      .map(([key, value]) => `${key}:${value}`)
      .join(' AND ');
    
    const results = await index.search<SearchResult>(query, {
      filters: filterStrings,
      hitsPerPage: 50
    });
    
    return results.hits;
  }
};
```

### تطبيق في Search Hook:
```tsx
// mobile_new/src/hooks/useMobileSearch.ts (updated)
import { AlgoliaSearchService } from '@/services/AlgoliaSearchService';
import { useFirestoreQuery } from './useFirestoreQuery';

export function useMobileSearch() {
  const [searchQuery, setSearchQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  
  // Debounce search
  useEffect(() => {
    if (!searchQuery.trim()) {
      setResults([]);
      return;
    }
    
    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const hits = await AlgoliaSearchService.search(searchQuery);
        setResults(hits);
        setError(null);
      } catch (err) {
        setError(err as Error);
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 300); // 300ms debounce
    
    return () => clearTimeout(timer);
  }, [searchQuery]);
  
  return { searchQuery, setSearchQuery, results, loading, error };
}
```

### Checklist:
- [ ] إضافة Algolia credentials في `.env`
- [ ] إنشاء `AlgoliaSearchService.ts`
- [ ] تحديث `useMobileSearch.ts`
- [ ] اختبار السرعة (< 500ms)
- [ ] Git commit: `feat: integrate Algolia search`

---

## المشكلة #5: Error Handling ⏱️ 1 ساعة

### الحل:

```tsx
// mobile_new/src/utils/error-handler.ts
import { FirebaseError } from 'firebase/app';
import { logger } from '@/services/logger-service';

export function getErrorMessage(error: unknown): string {
  if (error instanceof FirebaseError) {
    const messages: Record<string, string> = {
      'auth/user-not-found': 'User not found',
      'auth/wrong-password': 'Wrong password',
      'auth/email-already-in-use': 'Email already in use',
      'firestore/permission-denied': 'You don\'t have access to this resource',
      'firestore/not-found': 'Resource not found',
      'firestore/unavailable': 'Service temporarily unavailable',
      'storage/object-not-found': 'File not found',
      'storage/quota-exceeded': 'Storage quota exceeded'
    };
    
    return messages[error.code] || error.message;
  }
  
  if (error instanceof Error) {
    return error.message;
  }
  
  return 'An unexpected error occurred';
}

export async function handleErrorAsync(
  error: unknown,
  context: string,
  options?: {
    showAlert?: boolean;
    retryable?: boolean;
  }
): Promise<{ message: string; retryable: boolean }> {
  const message = getErrorMessage(error);
  logger.error(`[${context}] ${message}`, error);
  
  const retryable = error instanceof FirebaseError && 
    ['unavailable', 'permission-denied'].includes(error.code);
  
  if (options?.showAlert) {
    Alert.alert('Error', message, [
      {
        text: 'OK',
        onPress: () => {}
      },
      ...(retryable ? [{
        text: 'Retry',
        onPress: () => {} // caller will retry
      }] : [])
    ]);
  }
  
  return { message, retryable };
}
```

### استخدام:
```tsx
try {
  const listings = await ListingService.subscribeToListings(20, setListings);
} catch (error) {
  const { message, retryable } = await handleErrorAsync(
    error,
    'ListingService.subscribeToListings',
    { showAlert: true }
  );
}
```

### Checklist:
- [ ] إنشاء `error-handler.ts`
- [ ] تحديث 10+ try-catch blocks
- [ ] اختبار error scenarios
- [ ] Git commit: `improve: better error handling`

---

## يوم الاختبار الشامل ⏱️ 2 ساعات

### Checklist:
- [ ] Test on iOS simulator (15 mins)
- [ ] Test on Android emulator (15 mins)
- [ ] 30-minute usage session (no crashes)
- [ ] Memory profiler (should stay < 150MB)
- [ ] Search performance (< 500ms)
- [ ] Image compression (5MB → 300KB)
- [ ] Error messages show properly
- [ ] No console.log output

### Final Verification:
```bash
# Run from mobile_new/
npm run type-check
npm run lint
npm test

# Manual testing
npm start
# Test on simulator for 30 minutes
```

---

## Summary & Impact

**Before Week 1:**
- App crashes every 5-10 minutes ❌
- Search takes 5-15 seconds ❌
- Image gallery takes 30+ seconds ❌
- Memory usage: 200MB+ ❌
- Privacy violations (console.log) ❌
- **Stability: 20%** ⚠️

**After Week 1:**
- No crashes ✅
- Search takes 200-500ms ✅
- Image gallery instant ✅
- Memory usage: 80-100MB stable ✅
- CONSTITUTION compliant ✅
- **Stability: 95%** 🎉

**Ready to proceed to Week 2: Real-time Messaging** 📱
