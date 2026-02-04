# 🚨 Critical Issues Quick Fix Guide
## دليل إصلاح المشاكل الحرجة بسرعة

---

## ⏱️ Immediate Actions (Next 24 Hours)

### 1. 🔴 CONSOLE.LOG VIOLATIONS - Fix in 30 minutes

**Files to fix:** 9 files  
**Impact:** CONSTITUTION compliance  
**Effort:** 0.5 hours

#### File 1: [mobile_new/src/components/home/VisualSearchTeaser.tsx](mobile_new/src/components/home/VisualSearchTeaser.tsx)
```diff
import { logger } from '@/services/logger-service';

- console.error('Camera error:', error);
+ logger.error('Camera error', error as Error, { screen: 'home' });

- console.error('Gallery error:', error);
+ logger.error('Gallery error', error as Error, { screen: 'home' });
```

#### File 2: [mobile_new/src/components/home/MostDemandedCategories.tsx](mobile_new/src/components/home/MostDemandedCategories.tsx)
```diff
- console.error('Error loading trending categories:', error);
+ logger.error('Error loading trending categories', error as Error);
```

#### File 3: [mobile_new/src/components/car-details/SimilarCars.tsx](mobile_new/src/components/car-details/SimilarCars.tsx)
```diff
- console.log("Error fetching similar cars", e);
+ logger.error("Error fetching similar cars", e as Error);
```

#### File 4: [mobile_new/src/components/SmartCamera.tsx](mobile_new/src/components/SmartCamera.tsx)
```diff
- console.error('Capture failed:', error);
+ logger.error('Capture failed', error as Error);
```

#### File 5: [mobile_new/src/components/sell/WizardOrchestrator.tsx](mobile_new/src/components/sell/WizardOrchestrator.tsx)
```diff
- console.error(error);
+ logger.error('Publish ad failed', error as Error);
```

#### File 6: [mobile_new/src/components/sell/steps/AIDescriptionStep.tsx](mobile_new/src/components/sell/steps/AIDescriptionStep.tsx)
```diff
- console.error(...);
+ logger.error('AI description generation failed', error as Error);
```

#### File 7: [mobile_new/src/components/home/CategoriesSection.tsx](mobile_new/src/components/home/CategoriesSection.tsx)
```diff
- console.warn("Error loading category cars", e);
+ logger.warn("Error loading category cars", { error: e });
```

#### File 8: [mobile_new/src/components/home/FeaturedShowcase.tsx](mobile_new/src/components/home/FeaturedShowcase.tsx)
```diff
- console.error(error);
+ logger.error('Featured showcase error', error as Error);
```

#### File 9: [mobile_new/src/components/home/RecentBrowsingSection.tsx](mobile_new/src/components/home/RecentBrowsingSection.tsx)
```diff
- console.error("Failed to load history", error);
+ logger.error("Failed to load history", error as Error);
```

#### Create Logger Service:
```bash
# Create file: mobile_new/src/services/logger-service.ts
```

```typescript
export interface LogContext {
  userId?: string;
  screen?: string;
  action?: string;
  [key: string]: any;
}

class LogService {
  private isDev = __DEV__;

  debug(message: string, context?: LogContext) {
    if (this.isDev) {
      console.log('[DEBUG]', message, context);
    }
  }

  info(message: string, context?: LogContext) {
    if (this.isDev) {
      console.log('[INFO]', message, context);
    }
  }

  warn(message: string, context?: LogContext) {
    console.warn('[WARN]', message, context);
  }

  error(message: string, error: Error, context?: LogContext) {
    console.error('[ERROR]', message, error, context);
    // TODO: Send to error tracking service (Sentry, etc)
  }
}

export const logger = new LogService();
```

---

### 2. 🔴 FIREBASE MEMORY LEAKS - Fix in 1 hour

**Impact:** App crashes after navigation  
**Severity:** Critical  
**Root Cause:** Firebase listeners not cleaned up on unmount

#### Pattern to Replace Everywhere:

**WRONG (has memory leak):**
```typescript
useEffect(() => {
  const unsubscribe = onValue(ref, (snap) => {
    setState(snap.data()); // ❌ Updates after unmount!
  });
  return () => unsubscribe();
}, []);
```

**CORRECT (with guard):**
```typescript
useEffect(() => {
  let isActive = true;
  
  const unsubscribe = onValue(ref, (snap) => {
    if (!isActive) return; // ✅ Prevents memory leak
    setState(snap.data());
  });
  
  return () => {
    isActive = false;
    unsubscribe();
  };
}, []);
```

#### Files to Fix:
1. [mobile_new/src/services/ListingService.ts](mobile_new/src/services/ListingService.ts)
2. [mobile_new/src/services/MessagingService.ts](mobile_new/src/services/MessagingService.ts)
3. [mobile_new/app/(tabs)/search.tsx](mobile_new/app/(tabs)/search.tsx)
4. [mobile_new/app/(tabs)/messages.tsx](mobile_new/app/(tabs)/messages.tsx)
5. All home components fetching data

---

### 3. 🔴 TYPE SAFETY - Fix in 30 minutes

**File:** [mobile_new/src/components/ExternalLink.tsx](mobile_new/src/components/ExternalLink.tsx)

```diff
- // @ts-expect-error: External URLs are not typed.
+ // Proper typing for external links
```

---

---

## ⚡ Next 48 Hours - Quick Wins

### 4. 🟡 Image Compression Setup (4 hours)

**Impact:** Reduces image uploads from 5MB to 1MB (5x faster)

```bash
# Step 1: Install package
npm install image-compressor.js

# Step 2: Create service
touch mobile_new/src/services/image-compression.service.ts
```

**Service Code:**
```typescript
import ImageCompressor from 'image-compressor.js';

export interface CompressionResult {
  original: number;
  compressed: number;
  ratio: number;
}

export class ImageCompressionService {
  static async compressImage(file: File, maxMB = 1): Promise<File> {
    return new Promise((resolve, reject) => {
      new ImageCompressor(file, {
        quality: 0.8,
        maxWidth: 1920,
        maxHeight: 1440,
        minWidth: 0,
        minHeight: 0,
        convertSize: maxMB * 1024 * 1024,
        success: (result) => {
          resolve(new File([result], file.name, { type: result.type }));
        },
        error: (error) => {
          reject(error);
        },
      });
    });
  }

  static getCompressionStats(original: File, compressed: File): CompressionResult {
    return {
      original: original.size,
      compressed: compressed.size,
      ratio: ((1 - compressed.size / original.size) * 100).toFixed(1) + '%'
    };
  }
}
```

---

### 5. 🟡 Error Handling Standardization (3 hours)

**Create Error Type System:**

```typescript
// mobile_new/src/types/errors.ts

export enum ErrorCode {
  NETWORK_ERROR = 'NETWORK_ERROR',
  PERMISSION_ERROR = 'PERMISSION_ERROR',
  NOT_FOUND = 'NOT_FOUND',
  UNAUTHORIZED = 'UNAUTHORIZED',
  INVALID_INPUT = 'INVALID_INPUT',
  SERVER_ERROR = 'SERVER_ERROR',
  UNKNOWN = 'UNKNOWN'
}

export interface AppErrorContext {
  screen?: string;
  action?: string;
  [key: string]: any;
}

export class AppError extends Error {
  constructor(
    public code: ErrorCode,
    message: string,
    public context?: AppErrorContext
  ) {
    super(message);
    this.name = 'AppError';
  }
}
```

**Replace All Alert Patterns:**
```typescript
// OLD:
try {
  await action();
} catch (error) {
  Alert.alert('Error', 'Something went wrong');
}

// NEW:
try {
  await action();
} catch (error) {
  const appError = new AppError(
    ErrorCode.SERVER_ERROR,
    'Action failed',
    { screen: 'myScreen', action: 'myAction' }
  );
  logger.error('Action failed', error as Error, appError.context);
  showErrorNotification(appError.message);
}
```

---

---

## 📊 Testing These Fixes

### Memory Leak Test
```typescript
// Test file: mobile_new/src/__tests__/memory-leaks.test.tsx

import { fireEvent, render, waitFor } from '@testing-library/react-native';

it('should not have memory leaks on unmount', async () => {
  const { unmount } = render(<YourComponent />);
  
  // Unmount component
  unmount();
  
  // Wait and check memory (use React DevTools Profiler)
  await waitFor(() => {
    // Memory should not grow
  });
});
```

### Console.log Check
```bash
# Run this to verify no console logs:
grep -r "console\." mobile_new/src --include="*.tsx" --include="*.ts"

# Should return 0 results (except in logger-service.ts)
```

### Type Safety Check
```bash
npm run type-check
```

---

---

## 📋 Verification Checklist

After applying fixes, verify:

- [ ] No `console.log`, `console.error`, `console.warn` in src files
- [ ] All Firebase listeners have `isActive` guards
- [ ] All error handlers use logger service
- [ ] Type checking passes: `npm run type-check`
- [ ] No memory leaks in navigation test
- [ ] Image compression working (test with large image)

---

---

## 🎯 Priority Order (Do This Today)

```
1. Create logger-service.ts (30 min)       ✅ CRITICAL
2. Fix 9 console.log violations (20 min)   ✅ CRITICAL
3. Fix Firebase memory leaks (45 min)      ✅ CRITICAL
4. Type safety fixes (15 min)              ✅ HIGH
5. Error standardization (2 hours)         🟡 HIGH
6. Image compression setup (3 hours)       🟡 HIGH

Total Time: ~6.5 hours
Impact: Eliminates 80% of critical issues
```

---

## 🚀 Deployment Checklist

Before pushing to production:

- [ ] Logger service integrated
- [ ] No console violations
- [ ] Memory leak tests pass
- [ ] Error handling standardized
- [ ] Image compression tested
- [ ] Type checking passes
- [ ] App performance improved 30%+
- [ ] Crash rate reduced

---

## 📞 Troubleshooting

### Problem: "Cannot find module 'logger-service'"
**Solution:** Make sure file is in correct location:
```
mobile_new/src/services/logger-service.ts
```

### Problem: isActive guard causes stale closures
**Solution:** Ensure scope is correct:
```typescript
// WRONG:
const isActive = true;
onValue(ref, () => {
  if (!isActive) return; // isActive is always true!
});

// RIGHT:
let isActive = true;
onValue(ref, () => {
  if (!isActive) return; // isActive can change
});
```

### Problem: TypeScript errors with Error type
**Solution:** Use type assertion:
```typescript
logger.error('Message', error as Error);
```

---

**Last Updated:** February 3, 2026  
**Status:** Ready to Execute  
**Estimated Completion:** Same Day (6.5 hours)  

