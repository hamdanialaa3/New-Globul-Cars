# ✅ MASTER EXECUTION PLAN
## Koli One - Critical Fixes Implementation (All Phases)

---

## 📋 EXECUTIVE SUMMARY

**Total Time**: 1 day (Phase A) + 2 days (Phase B) = 3 days  
**Risk Level**: 🔴 CRITICAL (Production stabilization)  
**Scope**: 
- ✅ 25 Firestore composite indexes
- ✅ Tightened Storage security rules
- ✅ Complete RTDB access control rules
- ✅ Memory leak prevention hook (useFirestoreQuery)
- 🔄 19 upload services metadata updates
- 🔄 8 Firestore listener migrations
- 🔄 Image compression for web + mobile
- ⏳ 38 missing Cloud Functions (Next week)

**Status**: Phase A & B ready; Phase C deferred

---

## 🚀 PHASE A: FIREBASE DEPLOYMENT (1 day)
**Objective**: Deploy all Firebase rules and indexes  
**Team Size**: 1 person (tech lead)  
**Execution Time**: ~1 hour (includes 5-10 min build wait)  
**Risk**: LOW (rules-only, no app code changes)

### A1: Pre-Deployment Setup (5 min)
- [ ] Verify logged in: `firebase login`
- [ ] Verify project: `firebase projects:list` → Select correct project
- [ ] Navigate to web: `cd web`
- [ ] Backup current config:
  ```bash
  cp firestore.indexes.json firestore.indexes.json.backup
  cp storage.rules storage.rules.backup
  cp database.rules.json database.rules.json.backup
  ```

### A2: Deploy Firestore Indexes (10 min execution + 5-10 min build)
```bash
firebase deploy --only firestore:indexes
```

**Expected Output**:
```
i  deploying firestore
✔  firestore: rules file compiled successfully
✔  firestore: uploaded successfully
i  firestore: finished deploying in 7m 23s
```

**Verification** (Firebase Console):
- [ ] Firestore → Indexes tab
- [ ] See 25 indexes with status "✅ Enabled"
- [ ] No indexes showing "Building" or "Deleted"

### A3: Deploy Storage Rules (3 min)
```bash
firebase deploy --only storage:rules
```

**Expected Output**: `✔  storage: released successfully`

**Verification**:
- [ ] Storage console → `car-images` → Try upload
- [ ] Should fail with: "Custom metadata missing" (CORRECT!)

### A4: Deploy RTDB Rules (3 min)
```bash
firebase deploy --only database
```

**Expected Output**: `✔  database: released successfully`

**Verification**:
- [ ] Realtime Database console → Data tab
- [ ] Still see `/channels`, `/messages` paths readable

### A5: Verify Hook Added (2 min)
```bash
ls -la web/src/hooks/useFirestoreQuery.ts
npm run type-check
```

**Expected**: 
- [ ] File exists at `web/src/hooks/useFirestoreQuery.ts`
- [ ] No TypeScript errors

### A6: Final Validation Tests (5 min)
Run in browser (npm run dev):
```javascript
// Console test 1: Check indexes
await fetch('https://console.firebase.google.com/project/[your-project]/firestore/indexes')
// Verify 25 indexes visible

// Console test 2: Check storage rules
// Try upload → should fail with metadata error

// Console test 3: Check memory
// Open DevTools → Memory tab → Record allocation timeline
// Navigate components → Should drop after unmount (no leak)
```

---

## 🔄 PHASE B: CODE UPDATES (2 days)
**Objective**: Update 19 upload services + 8 listener files + image compression  
**Team Size**: 1-2 people (frontend developers)  
**Execution Time**: 8-16 hours across 2 days  
**Risk**: MEDIUM (coordinated with Phase A deployment)

### B1: Apply Upload Service Patches (Day 1 - 4 hours)
**Files to patch**: 19 upload services (see [PR_READY_PATCHES_PHASE_B.md](./PR_READY_PATCHES_PHASE_B.md))

**Workflow**:
1. Check out feature branch: `git checkout -b fix/phase-b-metadata-uploads`
2. Apply patches (choose one method):

**Option A - Via git apply** (Recommended):
```bash
# Get patch files
# Apply all patches
cd web
cat patches/patch-*.diff | git apply

# Verify
git diff --stat  # Should show 19 files modified
npm run type-check  # Should pass
```

**Option B - Manual** (Visual inspection):
```bash
# For each file in list:
# 1. Open file in editor
# 2. Find uploadBytes( or uploadBytesResumable(
# 3. Add metadata parameter before file parameter
# 4. Example:
# - const snapshot = await uploadBytes(ref, file);
# + const metadata = { customMetadata: { ownerId: auth.currentUser.uid } };
# + const snapshot = await uploadBytes(ref, file, metadata);
```

**Files to update** (in priority order):
1. sell-workflow-images.ts
2. image-upload.service.ts (car images)
3. ProfileMediaService.ts
4. messaging/image-upload.service.ts (senderId)
5. story.service.ts
6. posts.service.ts
7. events.service.ts
8. id-verification-service.ts
9. intro-video.service.ts
10. dealership.service.ts
11. manual-payment-service.ts
12-19. [Other upload services]

**Test After Each File**:
```bash
npm run type-check  # Should pass
npm run test -- [filename]  # Run tests if available
```

**Commit**:
```bash
git add web/src/services
git commit -m "refactor: add metadata to upload functions

- Add customMetadata with ownerId to all uploadBytes calls
- Ensures compliance with new storage rules
- Prevents 'Custom metadata missing' errors after Phase A deployment"
```

---

### B2: Migrate Firestore Listeners (Day 1 Evening - 3 hours)
**Files to migrate**: 8 Firestore listener files (see [LISTENER_MIGRATION_GUIDE.md](./LISTENER_MIGRATION_GUIDE.md))

**Critical Files (Do first)**:
1. usePostEngagement.ts
2. useFirestoreNotifications.ts  
3. useSubscriptionListener.ts

**Standard Files**:
4. MessagingService.ts
5. smart-feed.service.ts
6. posts-feed.service.ts
7. feed-algorithm.service.ts
8. car-lifecycle.service.ts

**Process for Each File**:
1. Open file in editor
2. Find `onSnapshot(` calls
3. Replace with `useFirestoreQuery()` hook
4. Update state management
5. Verify TypeScript passes
6. Test feature works
7. Commit

**Example Replacement** (Copy-paste pattern):
```diff
// BEFORE
useEffect(() => {
  const unsub = onSnapshot(q, (snap) => {
    setData(snap.docs.map(d => ({id: d.id, ...d.data()})));
  });
  return () => unsub();
}, [deps]);

// AFTER
const { data, loading } = useFirestoreQuery(
  'collectionName',
  [constraint1, constraint2],
  { enabled: !!dependency }
);

useEffect(() => {
  if (data) setData(data);  // Only if state management needed
}, [data]);
```

**Test After Migration**:
```bash
# 1. Type check
npm run type-check

# 2. Compile
npm run build

# 3. Manual test in browser
npm run dev
# - Use the feature that depends on this listener
# - Should work identically to before
# - Check console for errors

# 4. Memory leak check
# - Open DevTools → Memory tab
# - Record allocation timeline for 30 seconds
# - Use feature (open/close components)
# - Memory should increase and decrease (not spike)
```

**Commit**:
```bash
git add web/src/hooks/usePostEngagement.ts
git commit -m "refactor(hooks): migrate usePostEngagement to useFirestoreQuery

- Replace direct onSnapshot with memory-leak-safe hook
- Eliminates useEffect cleanup boilerplate
- Fixes memory leak on component unmount"
```

---

### B3: Add Image Compression (Day 2 - 2 hours)
**Scope**: Web (browser-image-compression) + Mobile (expo-image-manipulator)

**Step 1: Install Web Package** (5 min)
```bash
cd web
npm install browser-image-compression
npm run type-check  # Verify no TS issues
```

**Step 2: Update Image Upload Functions** (45 min)
Add compression before upload in 5 key services:
1. image-upload.service.ts
2. sell-workflow-images.ts
3. ProfileMediaService.ts
4. story.service.ts
5. posts.service.ts

**Pattern**:
```typescript
import imageCompression from 'browser-image-compression';

const compressedFile = await imageCompression(file, {
  maxSizeMB: 1,                    // Compress to 1MB max
  maxWidthOrHeight: 1920,         // Max dimensions
  useWebWorker: true              // Offload to worker thread
});

// Then upload compressedFile instead of file
const snapshot = await uploadBytes(ref, compressedFile, metadata);
```

**Test**:
```bash
npm run dev
# 1. Upload 5MB image
# 2. Check Storage console
# 3. File should be <1.5MB after compression
# 4. Visual quality should be acceptable (not blurry)
```

**Step 3: Mobile Setup** (15 min)
```bash
cd mobile_new
npm install expo-image-manipulator
```

**Step 4: Add Mobile Compression** (45 min)
Update in sell workflow and chat image handlers:

```typescript
import * as ImageManipulator from 'expo-image-manipulator';

async function compressImage(uri: string): Promise<string> {
  const result = await ImageManipulator.manipulateAsync(
    uri,
    [{ resize: { width: 1920, height: 1920 } }],
    { compress: 0.7, format: 'jpeg' }
  );
  return result.uri;
}

// Then use: const compressedUri = await compressImage(imageUri);
```

**Commit**:
```bash
git add web/package.json web/src/services mobile_new/package.json
git commit -m "feat: add image compression for uploads

- Web: browser-image-compression (1MB max, 1920px dimensions)
- Mobile: expo-image-manipulator (70% JPEG quality)
- Reduces storage costs and improves upload performance
- Preserves visual quality for typical use cases"
```

---

## 🔴 PHASE C: MISSING CLOUD FUNCTIONS (Next week)
**Status**: 🚫 DEFERRED (not starting yet)  
**Objective**: Create 38 missing Cloud Function implementations  
**Time Estimate**: 2-5 days  
**Scope**:
- Commission calculation service
- Billing/invoice service
- Messaging validation service
- Image processing service
- PDF generation service
- Analytics service
- Email notification service
- Payment webhook handler

**Trigger**: After Phase B validation passes

---

## 📊 EXECUTION TIMELINE

```
DAY 1 (Phase A + B Start)
├─ 09:00 - Setup & Backup (15 min)
├─ 09:15 - Deploy Firestore Indexes (10 min deploy + 5-10 min wait)
├─ 09:30 - Deploy Storage Rules (5 min)
├─ 09:40 - Deploy RTDB Rules (5 min)
├─ 09:50 - Validation Tests (10 min)
├─ 10:00 - PHASE A COMPLETE ✅
├─ 10:00 - Apply Upload Service Patches (4 hours)
│  ├─ 10:00-11:00: Sell workflow + car images patches
│  ├─ 11:00-12:00: Profile + media patches
│  ├─ 12:00-13:00: Messaging + story/posts patches
│  └─ 13:00-14:00: Verification + commits
├─ 14:00 - Migrate Listener Files (3 hours)
│  ├─ 14:00-15:00: Critical listeners (usePostEngagement, useNotifications)
│  ├─ 15:00-16:30: Standard listeners (messaging, feed services)
│  └─ 16:30-17:00: Testing & commits
└─ 17:00 - EOD: 21 files committed, Phase B-1 complete

DAY 2 (Phase B - Image Compression)
├─ 09:00 - Install compression libraries (10 min)
├─ 09:10 - Add web compression (1 hour)
├─ 10:10 - Add mobile compression (1 hour)
├─ 11:10 - Test & validate (30 min)
├─ 11:40 - Code review & merge (20 min)
└─ 12:00 - Phase B COMPLETE ✅

WEEK 2 (Phase C)
├─ Monday: Design Cloud Functions architecture
├─ Tue-Thu: Implement 38 functions
├─ Friday: Testing & deployment
└─ Deploy Phase C

TOTAL: 2-3 days active work
```

---

## ✅ PRE-DEPLOYMENT VERIFICATION

Before starting Phase A, verify:

- [ ] All 4 files exist:
  ```bash
  ls web/firestore.indexes.json
  ls web/storage.rules
  ls web/database.rules.json
  ls web/src/hooks/useFirestoreQuery.ts
  ```

- [ ] No uncommitted changes:
  ```bash
  git status  # Should be clean
  ```

- [ ] Correct Firebase project:
  ```bash
  firebase projects:list
  # Verify correct project is selected
  ```

- [ ] All tests pass:
  ```bash
  npm run type-check
  npm test
  ```

---

## 🆘 EMERGENCY ROLLBACK

If something breaks after Phase A deployment:

```bash
# 1. Immediately restore backup files
cp firestore.indexes.json.backup firestore.indexes.json
cp storage.rules.backup storage.rules
cp database.rules.json.backup database.rules.json

# 2. Redeploy backups
firebase deploy --only firestore:indexes,storage:rules,database

# 3. Verify
firebase deploy --only firestore:indexes --debug
```

---

## 📞 CONTACT & ESCALATION

| Issue | Action |
|-------|--------|
| Firebase deployment fails | Check `firebase deploy --debug` output |
| Type-check fails | Run `npm run type-check --verbose` |
| Test fails | Run `npm test -- [file] --verbose` |
| Memory leak still present | Run DevTools memory profiler, compare before/after migration |
| Uploads fail with metadata error | Verify Phase B patch applied correctly |

---

## 📝 SUCCESS CRITERIA

**Phase A Complete When**:
- ✅ 25 Firestore indexes showing "Enabled"
- ✅ Storage rules deployed
- ✅ RTDB rules deployed
- ✅ useFirestoreQuery.ts added with no TS errors
- ✅ 4 validation tests pass

**Phase B Complete When**:
- ✅ 19 upload services updated with metadata
- ✅ All uploads working (check Storage console)
- ✅ 8 listener files migrated to useFirestoreQuery
- ✅ npm run type-check passes
- ✅ npm run build succeeds
- ✅ Memory profiler shows no leaks
- ✅ All features work in browser
- ✅ PR created & merged with all changes

**Phase C Ready When**:
- ✅ Phase B deployed to production
- ✅ No P0 bugs reported in Phase B
- ✅ 38 Cloud Function specs documented
- ✅ Team bandwidth available

---

## 📚 DOCUMENTATION REFERENCES

| Document | Purpose |
|----------|---------|
| [PHASE_A_QUICK_START.md](./PHASE_A_QUICK_START.md) | Step-by-step Phase A deployment |
| [PR_READY_PATCHES_PHASE_B.md](./PR_READY_PATCHES_PHASE_B.md) | Copy-paste patches for 19 upload services |
| [LISTENER_MIGRATION_GUIDE.md](./LISTENER_MIGRATION_GUIDE.md) | How-to guide for 8 listener migrations |
| [DEEP_QUERY_OPERATIONS_AUDIT.md](./DEEP_QUERY_OPERATIONS_AUDIT.md) | Complete codebase query audit |
| [CRITICAL_FIXES_APPLIED.md](./CRITICAL_FIXES_APPLIED.md) | Summary of 4 fixes + remaining tasks |

---

## 🎯 NEXT IMMEDIATE ACTIONS

**RIGHT NOW** (Next 30 minutes):
1. Read this plan (you are here ✓)
2. Read [PHASE_A_QUICK_START.md](./PHASE_A_QUICK_START.md)
3. Open terminal in `web/` directory
4. Run: `firebase login` (if needed)
5. Run: `firebase projects:list`

**THEN** (Next 1 hour):
1. Execute Phase A deployment
2. Run 4 validation tests
3. Verify all tests pass

**DAY 1 AFTERNOON** (After Phase A success):
1. Read [PR_READY_PATCHES_PHASE_B.md](./PR_READY_PATCHES_PHASE_B.md)
2. Create feature branch: `git checkout -b fix/phase-b-metadata-uploads`
3. Apply patches to 19 upload services
4. Test each one

**DAY 1 EVENING**:
1. Read [LISTENER_MIGRATION_GUIDE.md](./LISTENER_MIGRATION_GUIDE.md)
2. Migrate 8 listener files
3. Full test suite

**DAY 2**:
1. Add image compression (web + mobile)
2. Final validation
3. Merge PR

---

## 🏁 DEFINITION OF DONE

Project is stable when:
- ✅ 0 "Missing Index" errors in Firestore queries
- ✅ 0 memory leaks detected in DevTools
- ✅ All uploads include metadata
- ✅ Storage rules enforcing access control
- ✅ RTDB messaging system functional
- ✅ npm run type-check passes
- ✅ npm run build produces no errors
- ✅ All existing features work in browser
- ✅ Image compression reduces file sizes
- ✅ All PR reviews passed

---

**Plan Created**: February 4, 2026  
**Status**: Ready for execution  
**Next Phase**: PHASE A deployment (start with PHASE_A_QUICK_START.md)  
**Estimated Completion**: February 6, 2026
