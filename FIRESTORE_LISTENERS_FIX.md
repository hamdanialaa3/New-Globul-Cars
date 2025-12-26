# 🔧 إصلاح مشكلة Firestore Listeners - Internal Assertion Failed

**التاريخ:** 27 ديسمبر 2025  
**الخطأ:** `FIRESTORE (12.6.0) INTERNAL ASSERTION FAILED: Unexpected state (ID: ca9)`

---

## 🐛 المشكلة

الخطأ يحدث بسبب:
1. **Duplicate Listeners:** عدة listeners على نفس document/query
2. **Cleanup غير صحيح:** عدم تنظيف listeners بشكل صحيح عند unmount
3. **Race Conditions:** تحديث state بعد cleanup
4. **Invalid State:** Firestore SDK في حالة غير متوقعة

---

## ✅ الإصلاحات المنفذة

### 1. useProfileData Hook ✅

**الملف:** `src/pages/03_user-pages/profile/ProfilePage/hooks/useProfileData.ts`

**التحسينات:**
- ✅ إضافة `isActive` flag لمنع state updates بعد cleanup
- ✅ إضافة try-catch في cleanup function
- ✅ Error handling محسّن

**الكود:**
```typescript
let isActive = true; // Prevent state updates after cleanup

const unsubscribe = onSnapshot(
  userRef, 
  (snapshot) => {
    if (!isActive) return; // Ignore updates after cleanup
    // ...
  }
);

return () => {
  isActive = false; // Flag first
  if (unsubscribe) {
    try {
      unsubscribe(); // Then cleanup
    } catch (cleanupError) {
      logger.warn('Error cleaning up', { error: cleanupError.message });
    }
  }
};
```

---

### 2. useProfile Hook ✅

**الملف:** `src/pages/03_user-pages/profile/ProfilePage/hooks/useProfile.ts`

**التحسينات:**
- ✅ إضافة `isActive` flag
- ✅ إضافة try-catch في cleanup
- ✅ Error handling محسّن

---

### 3. ProfileTypeContext ✅

**الملف:** `src/contexts/ProfileTypeContext.tsx`

**التحسينات:**
- ✅ تحسين cleanup function
- ✅ Clear unsubscribe reference بعد cleanup
- ✅ Error handling محسّن

**الكود:**
```typescript
return () => {
  if (unsubscribe) {
    try {
      unsubscribe();
      unsubscribe = null; // Clear reference after cleanup
    } catch (cleanupError) {
      logger.warn('Error cleaning up', { error: cleanupError.message });
      unsubscribe = null; // Clear reference even on error
    }
  }
};
```

---

### 4. Advanced Messaging Operations ✅

**الملف:** `src/services/messaging/advanced-messaging-operations.ts`

**التحسينات:**
- ✅ إضافة validation للـ conversationId و userId
- ✅ إضافة error handlers في onSnapshot
- ✅ تحسين cleanup functions
- ✅ Return no-op unsubscribe عند errors

**الكود:**
```typescript
// ✅ Guard against invalid IDs
if (!conversationId || typeof conversationId !== 'string' || conversationId.trim() === '') {
  logger.warn('Invalid conversationId');
  return () => {}; // Return no-op
}

let unsubscribe: (() => void) | null = null;

try {
  unsubscribe = onSnapshot(
    q,
    (snapshot) => { /* ... */ },
    (error) => { // ✅ Error handler
      logger.error('Error in subscription', error);
    }
  );
} catch (error) {
  logger.error('Error setting up subscription', error);
  return () => {}; // Return no-op if setup fails
}

// Return unsubscribe with error handling
return () => {
  if (unsubscribe) {
    try {
      unsubscribe();
    } catch (cleanupError) {
      logger.warn('Error cleaning up', { error: cleanupError.message });
    }
  }
};
```

---

## 🔍 المشاكل المحتملة المتبقية

### ⚠️ Duplicate Listeners على users/{userId}

هناك ثلاثة listeners منفصلة على نفس document:
1. `useProfileData` hook
2. `useProfile` hook  
3. `ProfileTypeContext`

**التوصية:**
- دمج listeners في service واحد (singleton pattern)
- أو استخدام shared listener service
- أو إزالة duplicate listeners إذا أمكن

**الحل المثالي (للمستقبل):**
```typescript
// Create UserProfileListenerService (singleton)
class UserProfileListenerService {
  private static instance: UserProfileListenerService;
  private listeners = new Map<string, Unsubscribe>();
  
  subscribe(userId: string, callback: Function): () => void {
    // Stop existing listener
    this.stopListening(userId);
    
    // Create new listener
    const unsubscribe = onSnapshot(doc(db, 'users', userId), callback);
    this.listeners.set(userId, unsubscribe);
    
    return () => this.stopListening(userId);
  }
  
  stopListening(userId: string): void {
    const unsub = this.listeners.get(userId);
    if (unsub) {
      try {
        unsub();
      } catch (e) {
        logger.warn('Error stopping listener', { userId, error: e });
      }
      this.listeners.delete(userId);
    }
  }
}
```

---

## 📊 النتائج المتوقعة

بعد الإصلاحات:
- ✅ لا توجد أخطاء Firestore في Console
- ✅ Cleanup صحيح لجميع listeners
- ✅ No memory leaks
- ✅ No race conditions

---

## 📁 الملفات المعدلة

1. ✅ `src/pages/03_user-pages/profile/ProfilePage/hooks/useProfileData.ts`
2. ✅ `src/pages/03_user-pages/profile/ProfilePage/hooks/useProfile.ts`
3. ✅ `src/contexts/ProfileTypeContext.tsx`
4. ✅ `src/services/messaging/advanced-messaging-operations.ts`

---

## ✅ Best Practices المطبقة

1. **isActive Flag Pattern:**
   ```typescript
   let isActive = true;
   // ...
   if (!isActive) return; // Prevent stale updates
   // ...
   return () => { isActive = false; unsubscribe(); };
   ```

2. **Error Handling في Cleanup:**
   ```typescript
   return () => {
     if (unsubscribe) {
       try {
         unsubscribe();
       } catch (cleanupError) {
         logger.warn('Cleanup error', { error: cleanupError.message });
       }
     }
   };
   ```

3. **Error Handlers في onSnapshot:**
   ```typescript
   onSnapshot(
     ref,
     (snapshot) => { /* success */ },
     (error) => { /* error handler */ } // ✅ Always provide error handler
   );
   ```

4. **Validation قبل Firestore Operations:**
   ```typescript
   if (!userId || typeof userId !== 'string' || userId.trim() === '') {
     return () => {}; // Return no-op
   }
   ```

---

**تم التنفيذ بواسطة:** AI Assistant  
**التاريخ:** 27 ديسمبر 2025  
**الحالة:** ✅ الإصلاحات مكتملة | ⚠️ يوصى بدمج duplicate listeners في المستقبل
