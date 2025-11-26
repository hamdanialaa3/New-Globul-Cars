# 📋 Week 1, Day 3 - Ready to Execute
## Naming Cleanup - Implementation Plan

**Date**: November 26, 2025, 02:05 AM  
**Status**: ⏳ **READY FOR EXECUTION**  
**Risk Level**: 🟢 Low  
**Estimated Time**: 1-2 hours

---

## 🎯 What Will Be Done

### Files to Rename (5 Critical + 3 Legacy)

#### Critical Files (Used in App.tsx)

| Current Name | New Name | Location | Status |
|--------------|----------|----------|--------|
| `VehicleStartPageNew.tsx` | `VehicleStartPage.tsx` | `pages/04_car-selling/sell/` | ⏳ Ready |
| `VehicleDataPageUnified.tsx` | `VehicleDataPage.tsx` | `pages/04_car-selling/sell/` | ⏳ Ready |
| `UnifiedEquipmentPage.tsx` | `EquipmentPage.tsx` | `pages/04_car-selling/sell/Equipment/` | ⏳ Ready |
| `ImagesPageUnified.tsx` | `ImagesPage.tsx` | `pages/04_car-selling/sell/` | ⏳ Ready |
| `UnifiedContactPage.tsx` | `ContactPage.tsx` | `pages/04_car-selling/sell/` | ⏳ Ready |

#### Legacy Files (Not actively used)

| Current Name | New Name | Note |
|--------------|----------|------|
| `ContactPageUnified.tsx` | `ContactPageLegacy.tsx` | Keep for reference |
| `PricingPageUnified.tsx` | `PricingPageLegacy.tsx` | Keep for reference |
| `VehicleStartPageUnified.tsx` | `VehicleStartPageLegacy.tsx` | Keep for reference |

---

## 🛠️ Tools Created

### PowerShell Script
**File**: `scripts/rename-unified-files.ps1`

**Features**:
- ✅ Automatic file renaming
- ✅ Import statement updates across all files
- ✅ Component name updates inside files
- ✅ Backup creation before changes
- ✅ Progress reporting
- ✅ Error handling

**Usage**:
```powershell
cd bulgarian-car-marketplace
.\scripts\rename-unified-files.ps1
```

---

## ⚠️ Important Considerations

### Why Manual Execution is Recommended

1. **Testing Required**: Each rename needs verification
2. **Import Dependencies**: Must ensure all imports are updated
3. **Build Verification**: Must confirm no TypeScript errors
4. **Git History**: Better to commit each rename separately

### Recommended Approach

**Option 1: Automated (Faster but riskier)**
```powershell
# Run the script
.\scripts\rename-unified-files.ps1

# Then test
npm run type-check
npm test
npm run build
```

**Option 2: Manual (Safer, recommended)**
```powershell
# Rename files one by one using IDE
# Update imports manually
# Test after each rename
# Commit after each successful rename
```

---

## 📝 Step-by-Step Manual Guide

### Step 1: VehicleStartPageNew → VehicleStartPage

1. **Rename file**:
   - From: `src/pages/04_car-selling/sell/VehicleStartPageNew.tsx`
   - To: `src/pages/04_car-selling/sell/VehicleStartPage.tsx`

2. **Update App.tsx** (line 51):
   ```typescript
   // Before
   const VehicleStartPage = React.lazy(() => import('./pages/04_car-selling/sell/VehicleStartPageNew'));
   
   // After
   const VehicleStartPage = React.lazy(() => import('./pages/04_car-selling/sell/VehicleStartPage'));
   ```

3. **Test**:
   ```bash
   npm run type-check
   npm test
   ```

4. **Commit**:
   ```bash
   git add .
   git commit -m "refactor: rename VehicleStartPageNew to VehicleStartPage"
   ```

### Step 2: VehicleDataPageUnified → VehicleDataPage

1. **Rename file**:
   - From: `src/pages/04_car-selling/sell/VehicleDataPageUnified.tsx`
   - To: `src/pages/04_car-selling/sell/VehicleDataPage.tsx`

2. **Update App.tsx** (line 53):
   ```typescript
   // Before
   const VehicleDataPageUnified = React.lazy(() => import('./pages/04_car-selling/sell/VehicleDataPageUnified'));
   
   // After
   const VehicleDataPage = React.lazy(() => import('./pages/04_car-selling/sell/VehicleDataPage'));
   ```

3. **Update usage in App.tsx** (find all `VehicleDataPageUnified` and replace with `VehicleDataPage`)

4. **Test & Commit**

### Step 3: UnifiedEquipmentPage → EquipmentPage

1. **Rename file**:
   - From: `src/pages/04_car-selling/sell/Equipment/UnifiedEquipmentPage.tsx`
   - To: `src/pages/04_car-selling/sell/Equipment/EquipmentPage.tsx`

2. **Update App.tsx** (line 66):
   ```typescript
   // Before
   const UnifiedEquipmentPage = React.lazy(() => import('./pages/04_car-selling/sell/Equipment/UnifiedEquipmentPage'));
   
   // After
   const EquipmentPage = React.lazy(() => import('./pages/04_car-selling/sell/Equipment/EquipmentPage'));
   ```

3. **Update usage in App.tsx** (find all `UnifiedEquipmentPage` and replace with `EquipmentPage`)

4. **Test & Commit**

### Step 4: ImagesPageUnified → ImagesPage

1. **Rename file**:
   - From: `src/pages/04_car-selling/sell/ImagesPageUnified.tsx`
   - To: `src/pages/04_car-selling/sell/ImagesPage.tsx`

2. **Update App.tsx** (line 67):
   ```typescript
   // Before
   const ImagesPageUnified = React.lazy(() => import('./pages/04_car-selling/sell/ImagesPageUnified'));
   
   // After
   const ImagesPage = React.lazy(() => import('./pages/04_car-selling/sell/ImagesPage'));
   ```

3. **Update usage in App.tsx** (find all `ImagesPageUnified` and replace with `ImagesPage`)

4. **Test & Commit**

### Step 5: UnifiedContactPage → ContactPage

1. **Rename file**:
   - From: `src/pages/04_car-selling/sell/UnifiedContactPage.tsx`
   - To: `src/pages/04_car-selling/sell/ContactPage.tsx`

2. **Update App.tsx** (line 72):
   ```typescript
   // Before
   const UnifiedContactPage = React.lazy(() => import('./pages/04_car-selling/sell/UnifiedContactPage'));
   
   // After
   const ContactPage = React.lazy(() => import('./pages/04_car-selling/sell/ContactPage'));
   ```

3. **Update usage in App.tsx** (find all `UnifiedContactPage` and replace with `ContactPage`)

4. **Test & Commit**

---

## ✅ Testing Checklist

After each rename:

### Automated Tests
- [ ] `npm run type-check` - No TypeScript errors
- [ ] `npm test` - All tests passing
- [ ] `npm run lint` - No linting errors
- [ ] `npm run build` - Build succeeds

### Manual Tests
- [ ] Navigate to `/sell/auto`
- [ ] Test the renamed page loads correctly
- [ ] Test navigation to/from the page
- [ ] Check browser console for errors
- [ ] Test on mobile view

---

## 🎯 Success Criteria

### Must Have
- ✅ All 5 critical files renamed
- ✅ All imports updated in App.tsx
- ✅ All TypeScript checks passing
- ✅ All tests passing
- ✅ Build succeeds
- ✅ No console errors

### Should Have
- ✅ Git commits for each rename
- ✅ Manual testing completed
- ✅ Documentation updated
- ✅ Progress report created

---

## 📊 Expected Impact

### Before
```
Files with temporary suffixes: 8
Code clarity: Medium
Professional appearance: Low
```

### After
```
Files with temporary suffixes: 0 (critical), 3 (legacy)
Code clarity: High
Professional appearance: High
```

---

## 🚀 Next Steps After Completion

1. **Update IMPLEMENTATION_TRACKER.md**
   - Mark Day 3 as completed
   - Update progress to 60% (3/5 days)

2. **Create Progress Report**
   - `PROGRESS_REPORT_WEEK1_DAY3.md`
   - Document what was renamed
   - List any issues encountered

3. **Move to Day 4**
   - Extract Provider Stack
   - Create `AppProviders.tsx`

---

## ⚠️ Rollback Plan

If issues arise:

### Quick Rollback
```bash
git reset --hard HEAD~1  # Undo last commit
```

### Full Rollback
```bash
git reset --hard HEAD~5  # Undo all 5 renames
```

### Partial Rollback
```bash
git revert <commit-hash>  # Revert specific rename
```

---

## 📞 Support

If you encounter issues:

1. **Check TypeScript errors**: `npm run type-check`
2. **Check build errors**: `npm run build`
3. **Check console**: Look for runtime errors
4. **Rollback**: Use git to undo changes
5. **Document**: Add to progress report

---

## 🎓 Recommendations

### For This Task

1. **Use IDE Refactoring**: Most IDEs can rename files and update imports automatically
2. **One at a Time**: Rename one file, test, commit, repeat
3. **Keep Legacy Files**: Don't delete old files yet, rename to `*Legacy.tsx`
4. **Test Thoroughly**: Manual testing is crucial for UI components

### For Future

1. **Avoid Temporary Names**: Don't use `New`, `Unified`, `Temp` in production code
2. **Use Feature Flags**: For gradual migration instead of temporary names
3. **Clean Up Regularly**: Don't let temporary names accumulate

---

**Status**: ⏳ **READY TO EXECUTE**  
**Recommended Approach**: Manual, one-by-one  
**Estimated Time**: 1-2 hours  
**Risk**: 🟢 Low (with proper testing)

---

**Created**: November 26, 2025, 02:05 AM  
**Last Updated**: November 26, 2025, 02:05 AM
