# 🔄 LISTENER MIGRATION GUIDE - PHASE B
## Replace onSnapshot with useFirestoreQuery Hook

---

## 📋 FILES REQUIRING MIGRATION

**Total Files**: 12  
**Priority**: High (fixes memory leaks)  
**Time Estimate**: 2-4 hours

---

## 🔴 CRITICAL (Must do first)

### 1️⃣ [usePostEngagement.ts](../web/src/hooks/usePostEngagement.ts)
**Risk Level**: 🔴 HIGH - Used by many components  
**Current Pattern**: Direct `onSnapshot` on posts collection  
**Lines to Change**: ~40-60  
**Migration Time**: 20 min

```typescript
// BEFORE
useEffect(() => {
  const postRef = doc(db, 'posts', postId);
  const unsub = onSnapshot(postRef, (snap) => {
    if (snap.exists()) setPost(snap.data());
  });
  return () => unsub();
}, [postId]);

// AFTER
const { data: postData, loading } = useFirestoreQuery<Post>(
  'posts',
  [],
  { 
    enabled: !!postId,
    transform: (docs, ids) => docs[0] // Get first doc
  }
);
useEffect(() => {
  if (postData) setPost(postData);
}, [postData]);
```

**Test After**: 
- Upload post → Check memory usage in DevTools (should decrease after unmount)
- Open/close engagement modal 10x → Should not crash

---

### 2️⃣ [useFirestoreNotifications.ts](../web/src/hooks/useFirestoreNotifications.ts)
**Risk Level**: 🔴 HIGH - Used by notification center  
**Current Pattern**: Direct `onSnapshot` with constraints  
**Lines to Change**: ~50-70  
**Migration Time**: 15 min

```typescript
// BEFORE
useEffect(() => {
  const q = query(
    collection(db, 'notifications'),
    where('userId', '==', uid),
    orderBy('createdAt', 'desc'),
    limit(20)
  );
  const unsub = onSnapshot(q, (snap) => {
    setNotifications(snap.docs.map(d => d.data()));
  });
  return () => unsub();
}, [uid]);

// AFTER
const { data: notifications, loading } = useFirestoreQuery<Notification>(
  'notifications',
  [
    where('userId', '==', uid),
    orderBy('createdAt', 'desc'),
    limit(20)
  ],
  { enabled: !!uid }
);
```

**Test After**:
- Receive notification → Check it appears
- Clear notifications → New ones load
- Close/reopen notification center 5x → No memory leak

---

### 3️⃣ [useSubscriptionListener.ts](../web/src/hooks/useSubscriptionListener.ts)
**Risk Level**: 🔴 HIGH - Critical for paid features  
**Current Pattern**: Document listener on user subscriptions  
**Lines to Change**: ~35-55  
**Migration Time**: 10 min

```typescript
// Use useFirestoreDoc for single document
const { data: subscription, loading } = useFirestoreDoc<UserSubscription>(
  'user_subscriptions',
  `${uid}_subscription`,
  { enabled: !!uid }
);
```

**Test After**:
- Subscribe to plan → Check status updates
- Cancel subscription → Status changes immediately
- Navigate away and back → No duplicate listeners

---

## 🟡 HIGH (Do next)

### 4️⃣ [MessagingService.ts](../web/src/services/messaging/messaging.service.ts)
**Risk Level**: 🟡 MEDIUM-HIGH - Chat history loading  
**Lines with onSnapshot**: ~120, ~180, ~250  
**Migration Time**: 30 min

**Pattern 1 - Messages Collection**:
```typescript
// BEFORE: Direct onSnapshot in method
subscribeToMessages(channelId: string, callback) {
  const q = query(collection(db, 'messages'), where('channelId', '==', channelId));
  return onSnapshot(q, (snap) => {
    callback(snap.docs.map(d => ({ id: d.id, ...d.data() })));
  });
}

// AFTER: Return hook instead
// NOTE: This converts method to hook usage
// Call in component: const { data: messages } = useFirestoreQuery('messages', [...])
```

**Test After**:
- Load chat → Messages appear
- Send message → Updates in real-time
- Scroll message history → No lag or memory issues

---

### 5️⃣ [smart-feed.service.ts](../web/src/services/feed/smart-feed.service.ts)
**Risk Level**: 🟡 MEDIUM - Feed loading  
**Lines with onSnapshot**: ~100, ~150  
**Migration Time**: 20 min

**Pattern**: Collection query with multiple constraints
```typescript
// Replace direct onSnapshot with hook in consuming component
// Instead of: this.subscribeToFeed()
// Use: useFirestoreQuery('posts', [where(...), orderBy(...), limit(...)])
```

---

### 6️⃣ [posts-feed.service.ts](../web/src/services/posts/posts-feed.service.ts)
**Risk Level**: 🟡 MEDIUM - Feed display  
**Lines with onSnapshot**: ~80, ~130  
**Migration Time**: 20 min

---

## 🟢 MEDIUM (Standard priority)

### 7️⃣ [feed-algorithm.service.ts](../web/src/services/feed/feed-algorithm.service.ts)
**Lines with onSnapshot**: ~40, ~90  
**Migration Time**: 15 min  

---

### 8️⃣ [realtime-messaging.service.ts](../web/src/services/messaging/realtime/realtime-messaging.service.ts)
**⚠️ IMPORTANT**: Uses RTDB `onValue`, not Firestore `onSnapshot`  
**Action**: SKIP THIS FILE - Keep RTDB listeners as-is  
**Reason**: useFirestoreQuery is Firestore-only; RTDB needs different approach

---

### 9️⃣ [presence.service.ts](../web/src/services/presence/presence.service.ts)
**Uses**: RTDB onValue  
**Action**: SKIP - Keep as-is

---

### 🔟 [typing-indicator.service.ts](../web/src/services/typing/typing-indicator.service.ts)
**Uses**: RTDB onValue  
**Action**: SKIP - Keep as-is

---

### 1️⃣1️⃣ [realtime-feed.service.ts](../web/src/services/feed/realtime-feed.service.ts)
**Uses**: RTDB onValue  
**Action**: SKIP - Keep as-is

---

### 1️⃣2️⃣ [car-lifecycle.service.ts](../web/src/services/sell-workflow/car-lifecycle.service.ts)
**Lines with onSnapshot**: ~50, ~100  
**Migration Time**: 15 min

---

## 🔄 MIGRATION PROCESS

### Step 1: Choose File
Select one file from CRITICAL tier first

### Step 2: Identify Patterns
Look for:
```typescript
onSnapshot(  ← Replace this
onValue(     ← SKIP (RTDB)
collection(db, ...  ← Firestore
ref(db, ...  ← RTDB (skip)
```

### Step 3: Apply Transformation
1. Remove `useEffect` wrapping the onSnapshot
2. Replace with `useFirestoreQuery` hook
3. Use returned `data` instead of state setter
4. Update cleanup return statement

### Step 4: Test
```bash
npm run type-check  # Verify no TS errors
npm run dev         # Test in browser
```

### Step 5: Commit
```bash
git add web/src/services/[file].ts
git commit -m "refactor(messaging): replace onSnapshot with useFirestoreQuery in [file]"
```

---

## 🧪 TESTING EACH MIGRATION

### General Tests (All Files)
```
✅ npm run type-check passes
✅ npm run dev has no console errors
✅ Browser DevTools → Memory tab: memory should drop after component unmount
```

### Feature-Specific Tests
**usePostEngagement**: Open post → Click engagement icon → Should load comments  
**useFirestoreNotifications**: Notification badge updates when new notification arrives  
**useSubscriptionListener**: User subscription status displays correctly  
**MessagingService**: Send message in chat → Appears immediately  
**feed services**: Social feed loads and scrolls without lag  

---

## 📊 LISTENER DISTRIBUTION

| Category | Count | Files | Time |
|----------|-------|-------|------|
| Firestore onSnapshot | 6 | usePostEngagement, useNotifications, useSubscriptionListener, MessagingService, smart-feed, posts-feed, feed-algorithm, car-lifecycle | 2.5h |
| RTDB onValue (SKIP) | 5 | realtime-messaging, presence, typing-indicator, realtime-feed, *others* | — |
| **Total Firestore** | **8** | | **2.5h** |

---

## 🎯 EXECUTION ORDER

1. **Day 1 Morning**: Migrate critical 3 files (usePostEngagement, useNotifications, useSubscriptionListener)
2. **Day 1 Afternoon**: Migrate messaging service (MessagingService, realtime-messaging)
3. **Day 2**: Migrate feed services (smart-feed, posts-feed, feed-algorithm, car-lifecycle)
4. **Verify**: Run full test suite `npm test` to ensure nothing broken

---

## ✅ COMPLETION CHECKLIST

- [ ] All 8 Firestore listener files migrated
- [ ] All 5 RTDB files verified (should have SKIP annotation in code)
- [ ] `npm run type-check` passes
- [ ] `npm run dev` has no errors in console
- [ ] Manual smoke tests pass (notifications, posts, messages, subscriptions)
- [ ] DevTools shows memory dropping after component unmount
- [ ] All changes in single PR: "refactor: migrate Firestore listeners to useFirestoreQuery hook"

---

## 📝 COMMON PATTERNS

### Pattern A: Collection Query with Constraints
```typescript
// BEFORE
onSnapshot(
  query(collection(db, 'notifications'), where('userId', '==', uid), orderBy('createdAt', 'desc')),
  (snap) => setData(snap.docs.map(d => ({id: d.id, ...d.data()})))
);

// AFTER
const { data } = useFirestoreQuery<Notification>(
  'notifications',
  [where('userId', '==', uid), orderBy('createdAt', 'desc')],
  { enabled: !!uid, transform: (docs, ids) => docs.map((d, i) => ({id: ids[i], ...d})) }
);
```

### Pattern B: Single Document
```typescript
// BEFORE
onSnapshot(doc(db, 'users', uid), (snap) => setUser(snap.data()));

// AFTER
const { data: user } = useFirestoreDoc<User>('users', uid);
```

### Pattern C: Service Method (Trickier)
```typescript
// BEFORE: Method returns unsubscribe function
subscribeToMessages(channelId: string): () => void {
  return onSnapshot(q, callback);
}

// AFTER: Move hook usage to consuming component
// In component file instead of service:
export function MessagesContainer({ channelId }) {
  const { data: messages } = useFirestoreQuery('messages', [where('channelId', '==', channelId)]);
}
```

---

**Last Updated**: February 4, 2026  
**Applies To**: Phase B Code Refactoring  
**Total Time**: ~2.5 hours for all 8 files  
**Priority**: High - Fixes production memory leaks
