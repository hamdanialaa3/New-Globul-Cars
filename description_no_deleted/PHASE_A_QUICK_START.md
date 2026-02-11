# 🚀 PHASE A - QUICK EXECUTION GUIDE
## Deploy Rules & Indexes (15-20 minutes)

---

## ✅ PRE-DEPLOYMENT CHECKLIST

- [ ] Backup current database.rules.json
- [ ] Backup current storage.rules
- [ ] Backup current firestore.indexes.json
- [ ] Make sure you're logged in: `firebase login` and verify with `firebase projects:list`
- [ ] Verify you're in correct directory: `cd web`

---

## 🎯 STEP 1: Deploy Firestore Indexes (5-10 MIN)

```bash
cd web
firebase deploy --only firestore:indexes
```

**Expected Output:**
```
i  deploying firestore
i  firestore: checking firestore.indexes.json for compilation errors...
✔  firestore: rules file compiled successfully
✔  firestore: uploaded successfully to (project-id)
i  firestore: finished deploying in 7m 23s
```

**ACTION**: Wait until you see "✔" and "uploaded successfully"

⏳ **WAIT 5-10 MINUTES** - Indexes are building in background

---

## 🧪 TEST 1: Verify Indexes Built

In Firebase Console:
1. Go to **Firestore → Indexes** tab
2. Look for status "✅ Enabled" next to each index
3. Should see 25 indexes total

**If you see "Building...":**
- Wait 5 more minutes
- Refresh browser

**If you see "Deleted":**
- Something went wrong with deployment
- Run `firebase deploy --only firestore:indexes --debug` and share output

---

## 🎯 STEP 2: Deploy Storage Rules (2-3 MIN)

```bash
firebase deploy --only storage:rules
```

**Expected Output:**
```
i  deploying storage
✔  storage: rules file compiled successfully
✔  storage: released successfully to (project-id)
```

---

## 🧪 TEST 2: Verify Storage Rules

In Firebase Storage console:
1. Navigate to `car-images` folder
2. Try to upload a small image
3. **Expected**: Upload fails with "Missing customMetadata" error (This is correct!)

---

## 🎯 STEP 3: Deploy Realtime Database Rules (2 MIN)

```bash
firebase deploy --only database
```

**Expected Output:**
```
i  deploying database
✔  database: rules file compiled successfully
✔  database: released successfully to (project-id)
```

---

## 🧪 TEST 3: Verify RTDB Rules

Open Firebase Console → Realtime Database → Data tab:
1. Look for `/channels` path (if any exist)
2. You should still be able to read/write data as before
3. If you see errors, it means rules were applied (this is correct)

---

## 🎯 STEP 4: Deploy useFirestoreQuery Hook

```bash
# Copy the hook file (should already exist at web/src/hooks/useFirestoreQuery.ts)
# If not exists, copy from our backup location:
cp useFirestoreQuery.ts.backup web/src/hooks/useFirestoreQuery.ts
```

---

## 🧪 TEST 4: TypeScript Compilation

```bash
cd web
npm run type-check
```

**Expected Output:**
```
No errors found ✔
Compilation successful
```

**If errors appear:**
- Check that `useFirestoreQuery.ts` has no syntax errors
- Run `npm install` to ensure dependencies present

---

## ✅ PHASE A COMPLETE - ALL TESTS PASSED?

If all 4 tests passed ✅:
- Firestore indexes are ready
- Storage rules are enforcing metadata
- RTDB rules are active
- TypeScript compiles without errors
- **Ready for Phase B**

### Next Step:
→ **Apply PR patches for 19 upload services** (see PR_READY_PATCHES_PHASE_B.md)
→ **Migrate 12+ listener files** to useFirestoreQuery

---

## ❌ TROUBLESHOOTING

### "Error: Missing indexes"
```bash
# Indexes still building - wait 5 more minutes
# Then test again with: firebase deploy --only firestore:indexes --debug
```

### "Error: Rules file has errors"
```bash
# Syntax error in rules file
firebase deploy --only storage:rules --debug
# Look for line numbers in error message
```

### "Error: Not authenticated"
```bash
firebase login
# Browser will open - complete login
# Then retry command
```

### "Error: Project not found"
```bash
# Verify correct firebase project
firebase projects:list
firebase use --add  # Select correct project
```

---

## 📋 QUICK REFERENCE

| Component | File | Command | Status |
|-----------|------|---------|--------|
| Firestore Indexes | firestore.indexes.json | `firebase deploy --only firestore:indexes` | ✔ |
| Storage Rules | storage.rules | `firebase deploy --only storage:rules` | ✔ |
| RTDB Rules | database.rules.json | `firebase deploy --only database` | ✔ |
| Query Hook | useFirestoreQuery.ts | Already created | ✔ |

---

## ⏱️ TIMING

- Deploy Indexes: 5-10 min (wait for build)
- Deploy Storage: 2-3 min
- Deploy RTDB: 2 min
- **Total**: ~15-20 minutes

---

**Created**: February 4, 2026
**Status**: Ready to execute
**Phase**: A (Rules & Indexes)
**Next**: Phase B patches for upload services
