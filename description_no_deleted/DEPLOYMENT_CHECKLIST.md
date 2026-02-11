# 🚀 DEPLOYMENT & IMPLEMENTATION CHECKLIST
## Koli One - Phase A & B (February 4, 2026)

---

## 🎯 PHASE A: FIRESTORE INDEXES + RULES DEPLOYMENT
### ⏱️ Estimated Time: 1-3 hours

### Step 1: Deploy Firestore Indexes
```bash
cd c:\Users\hamda\Desktop\Koli_One_Root\web
firebase deploy --only firestore:indexes
```

**Expected Output**:
```
=== Deploying to your Firebase project ===
i  deploying firestore
✔  firestore indexes created successfully
```

**Monitor**:
- [ ] Open [Firebase Console → Firestore → Indexes](https://console.firebase.google.com)
- [ ] Watch status column - should change from `BUILDING` → `BUILT` (5-10 min)
- [ ] Count indexes: Should show 25 indexes

**If Stuck**:
```bash
firebase deploy --only firestore:indexes --debug
```

---

### Step 2: Deploy Storage Rules (TIGHTENED)
```bash
cd c:\Users\hamda\Desktop\Koli_One_Root\web
firebase deploy --only storage:rules
```

**Expected Output**:
```
✔  storage security rules deployed successfully
```

**Verify in Console**: 
- [ ] Go to [Storage Rules Tab](https://console.firebase.google.com/project/_/storage/rules)
- [ ] Search for `car-images` - should show owner validation requirement

---

### Step 3: Deploy Realtime Database Rules
```bash
cd c:\Users\hamda\Desktop\Koli_One_Root\web
firebase deploy --only database
```

**Expected Output**:
```
✔  database.json deployed successfully
```

**Verify**:
- [ ] Open [RTDB Rules Tab](https://console.firebase.google.com/project/_/database/_/rules)
- [ ] Should show `/channels`, `/messages`, `/presence` rules

---

### Step 4: Quick Validation After Deployment

#### Test 4a: Firestore Query (Should NOT fail with "Missing Index")
```bash
# Open browser console in any running instance and run:
# This query previously failed, now should work:
const db = getDatabase(); // or firestore instance
const postsQuery = query(
  collection(db, 'posts'),
  where('status', '==', 'published'),
  where('visibility', '==', 'public'),
  orderBy('createdAt', 'desc'),
  limit(10)
);
const snapshot = await getDocs(postsQuery);
console.log('✅ Query successful:', snapshot.size, 'docs');
```

**Result Expected**: 
- ✅ No "Missing Index" error
- Document count displayed

#### Test 4b: Storage Upload Without Metadata (Should FAIL)
```bash
# In browser console on any page with upload:
const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
const storageRef = ref(storage, 'car-images/test-car-123/test.jpg');

try {
  await uploadBytes(storageRef, file);
  console.log('❌ FAILED: Should have been rejected');
} catch (error) {
  console.log('✅ CORRECT: Upload rejected -', error.message);
}
```

**Result Expected**:
- ✅ Permission denied error (rules blocking)

#### Test 4c: Storage Upload With Metadata (Should SUCCEED)
```bash
# In browser console:
const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
const storageRef = ref(storage, 'car-images/test-car-123/test.jpg');
const metadata = { 
  customMetadata: { 
    ownerId: firebase.auth().currentUser.uid 
  } 
};

try {
  await uploadBytes(storageRef, file, metadata);
  console.log('✅ Upload succeeded with metadata');
} catch (error) {
  console.log('❌ FAILED:', error.message);
}
```

**Result Expected**:
- ✅ Upload successful

---

### ✅ Phase A Completion Checklist
- [ ] `firebase deploy --only firestore:indexes` completed
- [ ] All 25 indexes show `BUILT` status in Firebase Console
- [ ] `firebase deploy --only storage:rules` completed
- [ ] `firebase deploy --only database` completed
- [ ] Test 4a: Query executes without "Missing Index" error
- [ ] Test 4b: Upload without metadata is rejected
- [ ] Test 4c: Upload with metadata is accepted

**⏱️ If all pass → Move to Phase B**  
**❌ If any fail → Debug using `firebase deploy --debug` and check Console error logs**

---

## 📝 PHASE B: CODE UPDATES
### ⏱️ Estimated Time: 8-24 hours

### B1: Update All Upload Functions (Add Metadata)

**Files to Update** (19 files):

| # | File | Line | Change |
|---|------|------|--------|
| 1 | [sell-workflow-images.ts](../web/src/services/sell-workflow-images.ts) | 54 | Add metadata |
| 2 | [car-delete.service.ts](../web/src/services/garage/car-delete.service.ts) | 210 | N/A (deleteObject) |
| 3 | [image-upload.service.ts](../web/src/services/car/image-upload.service.ts) | 103 | Add metadata |
| 4 | [image-upload-service.ts](../web/src/services/image-upload-service.ts) | 129 | Add metadata |
| 5 | [ProfileMediaService.ts](../web/src/services/profile/ProfileMediaService.ts) | 60 | Add metadata |
| 6 | [bulgarian-profile-service.ts](../web/src/services/bulgarian-profile-service.ts) | 269 | Add metadata |
| 7 | [UnifiedProfileService.ts](../web/src/services/profile/UnifiedProfileService.ts) | 214 | Add metadata |
| 8 | [image-processing-service.ts](../web/src/services/profile/image-processing-service.ts) | 102 | Add metadata |
| 9 | [intro-video.service.ts](../web/src/services/profile/intro-video.service.ts) | 70 | Add metadata |
| 10 | [id-verification-service.ts](../web/src/services/verification/id-verification-service.ts) | 222 | Add metadata |
| 11 | [VerificationWorkflowService.ts](../web/src/services/profile/VerificationWorkflowService.ts) | 62 | Add metadata |
| 12 | [story.service.ts](../web/src/services/stories/story.service.ts) | 50 | Add metadata |
| 13 | [events.service.ts](../web/src/services/social/events.service.ts) | 314 | Add metadata |
| 14 | [posts.service.ts](../web/src/services/social/posts.service.ts) | 199 | Add metadata |
| 15 | [success-stories.service.ts](../web/src/services/profile/success-stories.service.ts) | 58 | Add metadata |
| 16 | [achievements-gallery.service.ts](../web/src/services/profile/achievements-gallery.service.ts) | 233 | Add metadata |
| 17 | [image-upload.service.ts](../web/src/services/messaging/realtime/image-upload.service.ts) | 132 | Add metadata + senderId |
| 18 | [dealership.service.ts](../web/src/services/dealership/dealership.service.ts) | 117 | Add metadata |
| 19 | [manual-payment-service.ts](../web/src/services/payment/manual-payment-service.ts) | 454 | Add metadata |

**Implementation Pattern**:

```typescript
// BEFORE:
const snapshot = await uploadBytes(storageRef, file);

// AFTER:
const metadata = { 
  customMetadata: { 
    ownerId: currentUser.uid 
  } 
};
const snapshot = await uploadBytes(storageRef, file, metadata);
```

**PR-Ready Patches** → See section B1_PATCHES below

---

### B2: Replace Direct onSnapshot with useFirestoreQuery

**Files to Update** (12 files):

| # | File | Listeners | Priority |
|---|------|-----------|----------|
| 1 | [usePostEngagement.ts](../web/src/hooks/usePostEngagement.ts) | 2 onSnapshot | HIGH |
| 2 | [useFirestoreNotifications.ts](../web/src/hooks/useFirestoreNotifications.ts) | 1 onSnapshot | HIGH |
| 3 | [useSubscriptionListener.ts](../web/src/hooks/useSubscriptionListener.ts) | 1 onSnapshot | HIGH |
| 4 | [MessagingService.ts](../mobile_new/src/services/MessagingService.ts) | 2 onSnapshot | HIGH |
| 5 | [smart-feed.service.ts](../web/src/services/social/smart-feed.service.ts) | 1+ onSnapshot | MEDIUM |
| 6 | [posts-feed.service.ts](../web/src/services/social/posts-feed.service.ts) | 1+ onSnapshot | MEDIUM |
| 7 | [feed-algorithm.service.ts](../web/src/services/social/algorithms/feed-algorithm.service.ts) | Multiple | MEDIUM |
| 8 | [realtime-messaging.service.ts](../web/src/services/messaging/realtime/realtime-messaging.service.ts) | 5+ onValue | MEDIUM |
| 9 | [presence.service.ts](../web/src/services/messaging/realtime/presence.service.ts) | 4+ onValue | MEDIUM |
| 10 | [typing-indicator.service.ts](../web/src/services/messaging/realtime/typing-indicator.service.ts) | 2+ onValue | MEDIUM |
| 11 | [realtime-feed.service.ts](../web/src/services/social/realtime-feed.service.ts) | 5+ onValue | MEDIUM |
| 12 | [car-lifecycle.service.ts](../web/src/services/garage/car-lifecycle.service.ts) | 2+ onSnapshot | LOW |

**Migration Pattern**:

```typescript
// BEFORE: Direct onSnapshot with manual cleanup
useEffect(() => {
  const unsub = onSnapshot(q, (snap) => {
    setData(...);
  });
  return () => unsub();
}, [deps]);

// AFTER: Using useFirestoreQuery hook
const { data, loading, error } = useFirestoreQuery('collection', constraints, {
  transform: (doc, id) => ({ id, ...doc }),
  onData: (items) => console.log('Updated:', items)
});
```

---

### B3: Image Compression (Web)

**Package Installation**:
```bash
cd web
npm install browser-image-compression
```

**Implementation** - Add to each upload service:

```typescript
import imageCompression from 'browser-image-compression';

// Before upload:
const compressedFile = await imageCompression(file, {
  maxSizeMB: 1,
  maxWidthOrHeight: 1920,
  useWebWorker: true
});

await uploadBytes(storageRef, compressedFile, metadata);
```

**Files to Update**: Same 19 files from B1

---

### B4: Image Compression (Mobile)

**Package Installation**:
```bash
cd mobile_new
npm install expo-image-manipulator
```

**Implementation** - In Sell Workflow:

```typescript
import * as ImageManipulator from 'expo-image-manipulator';

const actions = [{ resize: { width: 1920, height: 1920 } }];
const result = await ImageManipulator.manipulateAsync(
  imageUri,
  actions,
  { compress: 0.7, format: 'jpeg' }
);

// Then upload result.uri
```

---

### ✅ Phase B Completion Checklist

**B1: Upload Metadata**
- [ ] All 19 files updated with metadata
- [ ] Test upload a car image - verify metadata in Firebase Console
- [ ] Test upload a profile picture - verify ownerId set

**B2: Replace Listeners**
- [ ] usePostEngagement.ts migrated
- [ ] useFirestoreNotifications.ts migrated
- [ ] MessagingService.ts migrated
- [ ] Open browser DevTools Memory tab
- [ ] Keep page open for 10 minutes
- [ ] Watch memory usage - should stabilize (NOT grow unbounded)

**B3: Image Compression (Web)**
- [ ] browser-image-compression installed
- [ ] Upload 5MB image from web - verify compressed to <1MB
- [ ] Check image quality is acceptable

**B4: Image Compression (Mobile)**
- [ ] expo-image-manipulator installed
- [ ] Take photo and upload from mobile - verify compressed

---

## 🧪 QUICK VALIDATION TESTS

### Test: Memory Leak Check (10-minute smoke test)
```javascript
// Run in browser console on homepage
const memBefore = performance.memory.usedJSHeapSize / 1048576; // MB
console.log('Memory Before:', memBefore.toFixed(2), 'MB');

// Simulate 10 minutes of navigation
setInterval(() => {
  // Navigate between pages that have listeners
  window.location.hash = '#/messages';
  setTimeout(() => window.location.hash = '#/search', 2000);
}, 3000);

// After 10 minutes:
setTimeout(() => {
  const memAfter = performance.memory.usedJSHeapSize / 1048576;
  const delta = memAfter - memBefore;
  console.log('Memory After:', memAfter.toFixed(2), 'MB');
  console.log('Delta:', delta.toFixed(2), 'MB');
  console.log(delta < 100 ? '✅ OK' : '❌ LEAK DETECTED');
}, 600000); // 10 minutes
```

---

## 📋 GIT COMMIT TEMPLATES

### Phase A (Deploy):
```
git commit -m "🔒 security(firestore/storage/rtdb): deploy production indexes, rules, and database rules

- Added 25 composite Firestore indexes for social/search/messaging
- Tightened storage rules: car-images and messages now require owner metadata
- Deployed RTDB rules for channels, messages, presence, typing with access control
- Fixes critical query failures and security gaps

BREAKING: Uploads must include customMetadata.ownerId
DEPLOYMENT: firebase deploy --only firestore:indexes storage:rules database"
```

### Phase B (Code):
```
git commit -m "refactor: add metadata to uploads and replace direct listeners with useFirestoreQuery

- Updated 19 upload services to include customMetadata.ownerId/senderId
- Replaced 12+ direct onSnapshot/onValue with useFirestoreQuery hook
- Added image compression (web: browser-image-compression, mobile: expo-image-manipulator)
- Prevents memory leaks and ensures storage security compliance

Fixes: #MEMORY-LEAK #STORAGE-SECURITY #QUERY-PERFORMANCE"
```

---

## 🆘 TROUBLESHOOTING

### Issue: "Missing Index" error after deploy
**Cause**: Indexes not yet built  
**Solution**: Wait 5-10 minutes, refresh Firebase Console, verify status = BUILT

### Issue: Upload rejected with 403 (Permission denied)
**Cause**: metadata not included or rules not deployed  
**Solution**: 
```bash
firebase deploy --only storage:rules --debug
# Then test again with metadata
```

### Issue: Memory still leaking after listener replacement
**Cause**: Some listeners not yet migrated  
**Solution**:
```bash
grep -r "onSnapshot\|onValue" web/src --include="*.ts" --include="*.tsx" | grep -v node_modules | grep -v ".test"
# Migrate remaining ones
```

### Issue: Cannot upload because of CORS or network
**Cause**: May need to clear service worker cache  
**Solution**:
```bash
# Clear all service workers
navigator.serviceWorker.getRegistrations().then(regs => 
  regs.forEach(r => r.unregister())
);
```

---

## ✨ NEXT STEPS AFTER COMPLETION

**If Phase A & B pass**:
1. Create PR with all changes
2. Request code review
3. Merge to staging
4. Run 24-hour stability monitoring
5. Promote to production

**Phase C** (Cloud Functions) starts next week after stability verified

---

**Checklist Created**: February 4, 2026
**Status**: Ready for Phase A deployment
**Estimated Total Time**: 24-48 hours for both phases
