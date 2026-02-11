# 🎯 QUICK REFERENCE - PHASES A, B, C
## Koli One Stabilization - What To Do Next

---

## 🚀 START HERE (5 minutes)

You are here → You have 4 completed fixes ready to deploy:
1. ✅ firestore.indexes.json - 25 composite indexes
2. ✅ storage.rules - Tightened with metadata validation
3. ✅ database.rules.json - Complete RTDB access control
4. ✅ useFirestoreQuery.ts - Memory leak prevention hook

**Next step**: Execute Phase A (firebase deploy commands)

---

## 📋 WHICH FILE TO READ?

| You want to... | Read this file |
|---|---|
| Deploy Phase A NOW | [PHASE_A_QUICK_START.md](./PHASE_A_QUICK_START.md) |
| Copy-paste patch code | [PR_READY_PATCHES_PHASE_B.md](./PR_READY_PATCHES_PHASE_B.md) |
| Learn listener migration | [LISTENER_MIGRATION_GUIDE.md](./LISTENER_MIGRATION_GUIDE.md) |
| See full timeline | [MASTER_EXECUTION_PLAN.md](./MASTER_EXECUTION_PLAN.md) |
| Understand all issues | [DEEP_QUERY_OPERATIONS_AUDIT.md](./DEEP_QUERY_OPERATIONS_AUDIT.md) |
| See what's fixed | [CRITICAL_FIXES_APPLIED.md](./CRITICAL_FIXES_APPLIED.md) |

---

## ⏱️ TIMING SUMMARY

| Phase | What | Time | When | Status |
|-------|------|------|------|--------|
| A | Firebase deployment | 1 hour | TODAY NOW | ✅ Ready |
| B-1 | Upload service patches | 4 hours | TODAY afternoon | ✅ Ready |
| B-2 | Listener migration | 3 hours | TODAY evening | ✅ Ready |
| B-3 | Image compression | 2 hours | TOMORROW | ✅ Ready |
| C | Cloud Functions | 2-5 days | NEXT WEEK | 🚫 Not yet |

**Total**: 10-14 hours work over 2 days

---

## 🔥 CRITICAL COMMANDS (Copy-paste)

### Phase A: Deploy Now
```bash
cd web
firebase deploy --only firestore:indexes
firebase deploy --only storage:rules
firebase deploy --only database
npm run type-check
```

### Phase B-1: Patch Upload Services
```bash
git checkout -b fix/phase-b-metadata-uploads
# Apply patches from PR_READY_PATCHES_PHASE_B.md
git add web/src/services
git commit -m "refactor: add metadata to upload functions"
npm run type-check
npm run build
```

### Phase B-2: Migrate Listeners
```bash
# Edit each file and replace onSnapshot with useFirestoreQuery hook
# For each migrated file:
git add web/src/hooks/[filename]
git commit -m "refactor: migrate [filename] to useFirestoreQuery"
```

### Phase B-3: Image Compression
```bash
npm install browser-image-compression expo-image-manipulator
# Add compression to upload functions (see PR_READY_PATCHES_PHASE_B.md)
npm run type-check
npm run build
```

---

## ✅ VALIDATE AT EACH STEP

After Phase A:
- [ ] 25 Firestore indexes show "Enabled" in console
- [ ] Storage upload fails with "metadata missing" error
- [ ] No TypeScript errors: `npm run type-check`

After Phase B-1:
- [ ] All uploads work again (metadata added)
- [ ] Check Storage console for customMetadata fields
- [ ] No TypeScript errors

After Phase B-2:
- [ ] DevTools Memory tab: memory drops after component unmount (no leak)
- [ ] Features work: notifications, posts, messages, subscriptions
- [ ] npm run build succeeds

After Phase B-3:
- [ ] Upload 5MB image → file is <1.5MB after compression
- [ ] Visual quality is acceptable (not blurry)
- [ ] No TypeScript errors

---

## 🆘 SOMETHING BROKE?

| Error | Fix |
|-------|-----|
| `Error: Missing indexes` | Indexes still building. Wait 5 min and retry: `firebase deploy --only firestore:indexes --debug` |
| `Error: Rules file has errors` | Check syntax in rules file. Find line number in error message. |
| `Error: Not authenticated` | Run `firebase login` and complete browser login |
| `npm run type-check` fails | Likely misnamed import or missing file. Full error message shows line number |
| Uploads fail after Phase A | Patch not applied yet - this is expected! Apply Phase B-1 |
| Memory still leaking | Listener migration incomplete. Check DevTools to find which listener |
| Image not compressing | Check console for compression errors. May need fallback to original |

---

## 📁 FILES YOU'LL EDIT

### Phase A: Deploy (No editing)
- `firestore.indexes.json` ← already updated
- `storage.rules` ← already updated
- `database.rules.json` ← already updated
- `useFirestoreQuery.ts` ← already created

### Phase B-1: Upload Services (19 files)
```
web/src/services/
├─ sell-workflow-images.ts ← ADD METADATA
├─ car/image-upload.service.ts ← ADD METADATA
├─ image-upload-service.ts ← ADD METADATA
├─ profile/ProfileMediaService.ts ← ADD METADATA
├─ messaging/realtime/image-upload.service.ts ← ADD METADATA (senderId)
├─ story.service.ts ← ADD METADATA
├─ posts.service.ts ← ADD METADATA
├─ events.service.ts ← ADD METADATA
├─ id-verification-service.ts ← ADD METADATA
├─ intro-video.service.ts ← ADD METADATA
├─ dealership/dealership.service.ts ← ADD METADATA
├─ payment/manual-payment-service.ts ← ADD METADATA
└─ [7 more upload services]
```

### Phase B-2: Listener Migration (8 files)
```
web/src/
├─ hooks/usePostEngagement.ts ← REPLACE onSnapshot
├─ hooks/useFirestoreNotifications.ts ← REPLACE onSnapshot
├─ hooks/useSubscriptionListener.ts ← REPLACE onSnapshot
├─ services/messaging/messaging.service.ts ← REPLACE onSnapshot
├─ services/feed/smart-feed.service.ts ← REPLACE onSnapshot
├─ services/feed/posts-feed.service.ts ← REPLACE onSnapshot
├─ services/feed/feed-algorithm.service.ts ← REPLACE onSnapshot
└─ services/sell-workflow/car-lifecycle.service.ts ← REPLACE onSnapshot
```

### Phase B-3: Compression (5+ files)
```
web/src/services/
├─ image-upload-service.ts ← ADD COMPRESSION
├─ sell-workflow-images.ts ← ADD COMPRESSION
├─ profile/ProfileMediaService.ts ← ADD COMPRESSION
├─ story.service.ts ← ADD COMPRESSION
└─ posts.service.ts ← ADD COMPRESSION

mobile_new/
└─ app/(tabs)/sell/ ← ADD COMPRESSION
```

---

## 🧪 QUICK TESTS

### Test 1: Indexes Built
```bash
open https://console.firebase.google.com/project/[your-project]/firestore/indexes
# Should see 25 indexes with ✅ status
```

### Test 2: Upload Fails (Expected!)
```bash
# After Phase A, before Phase B-1
npm run dev
# Try upload → Should see error: "Custom metadata missing"
# This is correct! Phase B-1 will fix it
```

### Test 3: Upload Works Again
```bash
# After Phase B-1
npm run dev
# Try upload → Should work!
# Check Firefox/Chrome DevTools → Storage console
# Click image → Metadata tab → See ownerId field
```

### Test 4: No Memory Leak
```bash
npm run dev
# DevTools → Memory → Record allocation timeline (30 sec)
# Open component that uses listener
# Close component
# Memory should drop (not increase)
# No spikes = no leak ✅
```

---

## 💬 GIT COMMIT TEMPLATES

### Phase A (Firebase Deploy)
```
[No commits - rules deployed directly]
```

### Phase B-1 (Metadata)
```
refactor: add metadata to upload functions

- Add customMetadata.ownerId to all uploadBytes calls
- Ensures compliance with new storage rules
- Prevents 'Custom metadata missing' errors after Phase A deployment
- Affects 19 services: sell-workflow, car images, profile, messaging, etc.
```

### Phase B-2 (Listeners)
```
refactor: migrate Firestore listeners to useFirestoreQuery hook

- Replace direct onSnapshot with memory-leak-safe hook
- Eliminates useEffect cleanup boilerplate
- Fixes memory leak on component unmount
- Migrated: usePostEngagement, useNotifications, useSubscriptionListener, etc.
- Verified: No console errors, memory drops on unmount, all features work
```

### Phase B-3 (Compression)
```
feat: add image compression for uploads

- Web: browser-image-compression (1MB max, 1920px dimensions)
- Mobile: expo-image-manipulator (70% JPEG quality)
- Reduces storage costs and improves upload performance
- Preserves visual quality for typical use cases
```

---

## 📊 RISK MATRIX

| Phase | Component | Risk | Impact | Mitigation |
|-------|-----------|------|--------|-----------|
| A | Indexes | 🟢 LOW | Queries fail until indexes built | Build time 5-10 min expected |
| A | Storage Rules | 🟡 MEDIUM | Uploads fail if metadata missing | Phase B-1 has patches ready |
| A | RTDB Rules | 🟢 LOW | Messaging blocks briefly | Already tested in test DB |
| B | Upload Services | 🟡 MEDIUM | 19 files to update | Patches provided, easy to review |
| B | Listener Migration | 🟡 MEDIUM | Memory leaks if done wrong | Hook provided, validated pattern |
| B | Compression | 🟢 LOW | Image quality may degrade | Fallback to original if needed |

---

## 👥 TEAM ASSIGNMENTS

**For 1 person** (You handle everything):
- Day 1: Phase A (1h) + B-1 (4h) + B-2 (3h) = 8 hours
- Day 2: B-3 (2h) + Testing (2h) = 4 hours
- Total: 12 hours over 2 days

**For 2 people** (Split work):
- Person A: Phase A (1h) + B-1 (4h) → Total 5h
- Person B: Phase B-2 (3h) + B-3 (2h) → Total 5h
- Day 1 done in 1 day, Day 2 done in parallel

**For QA team**:
- Smoke test after each phase
- Memory leak profiling (Phase B-2)
- Image quality check (Phase B-3)
- Full regression test after Phase B complete

---

## 🎓 LEARNING OUTCOMES

After completing this plan, you'll have:
- ✅ Deployed 25 Firestore composite indexes
- ✅ Tightened Storage access control with metadata
- ✅ Secured RTDB with participant-based rules
- ✅ Implemented memory leak prevention pattern
- ✅ Added image compression (web + mobile)
- ✅ Experience with Firebase security best practices
- ✅ Understanding of Firestore optimization

---

## 📞 NEED HELP?

| Question | Answer |
|----------|--------|
| What's in Phase C? | 38 missing Cloud Functions (deferred to next week) |
| How long does index building take? | 5-10 minutes (automatic) |
| Can I rollback? | Yes - backup files ready, restore and redeploy |
| Do I need to update mobile app? | Only Phase B-3 (image compression). Mobile messaging already uses correct structure. |
| What if tests fail? | Check DEEP_QUERY_OPERATIONS_AUDIT.md for complete query list to debug |
| How do I know if memory leak is fixed? | DevTools → Memory tab → Allocation timeline should drop after unmount |

---

## 🏁 SUCCESS!

When you see this:
- ✅ npm run type-check: 0 errors
- ✅ npm run build: success
- ✅ 25 Firestore indexes: Enabled
- ✅ Uploads working with metadata
- ✅ DevTools memory: drops after unmount
- ✅ All features working in browser
- ✅ 21 files committed to PR

**Phase A & B are COMPLETE** 🎉

---

## 📝 QUICK CHECKLIST

```bash
# [ ] 1. Read this file ← YOU ARE HERE
# [ ] 2. Read PHASE_A_QUICK_START.md
# [ ] 3. Open terminal: cd web
# [ ] 4. Run: firebase login
# [ ] 5. Run: firebase deploy --only firestore:indexes
# [ ] 6. Wait 5-10 min for indexes to build
# [ ] 7. Run: firebase deploy --only storage:rules
# [ ] 8. Run: firebase deploy --only database
# [ ] 9. Run: npm run type-check
# [ ] 10. Verify in Firebase console (4 tests)
# [ ] PHASE A COMPLETE ✅

# [ ] 11. Read PR_READY_PATCHES_PHASE_B.md
# [ ] 12. Create branch: git checkout -b fix/phase-b
# [ ] 13. Apply patches to 19 upload services
# [ ] 14. Commit: git commit -m "refactor: add metadata..."
# [ ] 15. Test uploads in browser
# [ ] PHASE B-1 COMPLETE ✅

# [ ] 16. Read LISTENER_MIGRATION_GUIDE.md
# [ ] 17. Migrate 8 Firestore listener files
# [ ] 18. Test memory (DevTools Memory tab)
# [ ] 19. Commit: git commit -m "refactor: migrate listeners..."
# [ ] PHASE B-2 COMPLETE ✅

# [ ] 20. Add image compression (web + mobile)
# [ ] 21. Test image quality
# [ ] 22. Commit: git commit -m "feat: add image compression"
# [ ] 23. Push & create PR
# [ ] PHASE B-3 COMPLETE ✅

# [ ] 24. Next week: Implement Phase C (Cloud Functions)
```

---

**Print this page or bookmark it** 🔖  
**Everything else is in the referenced docs**

Next → [PHASE_A_QUICK_START.md](./PHASE_A_QUICK_START.md)
