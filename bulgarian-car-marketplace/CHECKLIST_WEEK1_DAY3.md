# ✅ Next Steps Checklist - Week 1, Day 3
## Naming Cleanup Implementation

**Date**: November 26, 2025  
**Task**: Remove temporary naming suffixes (`Unified`, `New`, etc.)  
**Estimated Duration**: 1 day  
**Risk Level**: 🟢 Low  
**Impact**: 🟡 Medium  

---

## 📋 Pre-Implementation Checklist

### Environment Setup
- [ ] Pull latest changes from main branch
- [ ] Create new feature branch: `refactor/naming-cleanup`
- [ ] Ensure all tests are passing on current branch
- [ ] Backup current state (git commit)

### Prerequisites Verification
- [x] Week 1, Day 1-2 completed (Unified AuthGuard)
- [x] Feature flags system in place
- [x] No blocking issues from previous tasks

---

## 🎯 Implementation Tasks

### Phase 1: Identify Files to Rename

- [ ] **Scan for files with `Unified` suffix**
  ```bash
  # PowerShell command
  Get-ChildItem -Path "src" -Recurse -Filter "*Unified*.tsx" | Select-Object FullName
  ```

- [ ] **Scan for files with `New` suffix**
  ```bash
  Get-ChildItem -Path "src" -Recurse -Filter "*New*.tsx" | Select-Object FullName
  ```

- [ ] **Create list of files to rename**
  - [ ] `VehicleDataPageUnified.tsx` → `VehicleDataPage.tsx`
  - [ ] `ImagesPageUnified.tsx` → `ImagesPage.tsx`
  - [ ] `UnifiedContactPage.tsx` → `ContactPage.tsx`
  - [ ] `UnifiedEquipmentPage.tsx` → `EquipmentPage.tsx`

### Phase 2: Create Renaming Script

- [ ] **Create PowerShell script**: `scripts/rename-unified-files.ps1`
  ```powershell
  # Script content from refactoring plan
  $files = @(
      @{Old="VehicleDataPageUnified.tsx"; New="VehicleDataPage.tsx"},
      @{Old="ImagesPageUnified.tsx"; New="ImagesPage.tsx"},
      @{Old="UnifiedContactPage.tsx"; New="ContactPage.tsx"},
      @{Old="UnifiedEquipmentPage.tsx"; New="EquipmentPage.tsx"}
  )
  
  foreach ($file in $files) {
      # Find and rename
      Get-ChildItem -Path "src" -Recurse -Filter $file.Old | 
          Rename-Item -NewName $file.New
      
      # Update all imports
      Get-ChildItem -Path "src" -Recurse -Include "*.tsx","*.ts" |
          ForEach-Object {
              (Get-Content $_) -replace $file.Old, $file.New | Set-Content $_
          }
  }
  ```

- [ ] **Test script on a copy of the project first**
- [ ] **Review script for any edge cases**

### Phase 3: Execute Renaming

- [ ] **Run the renaming script**
  ```bash
  cd bulgarian-car-marketplace
  ./scripts/rename-unified-files.ps1
  ```

- [ ] **Verify all files were renamed correctly**
  ```bash
  # Check if old files still exist (should be empty)
  Get-ChildItem -Path "src" -Recurse -Filter "*Unified*.tsx"
  ```

- [ ] **Verify new files exist**
  ```bash
  # Check if new files exist
  Get-ChildItem -Path "src" -Recurse -Filter "VehicleDataPage.tsx"
  Get-ChildItem -Path "src" -Recurse -Filter "ImagesPage.tsx"
  Get-ChildItem -Path "src" -Recurse -Filter "ContactPage.tsx"
  Get-ChildItem -Path "src" -Recurse -Filter "EquipmentPage.tsx"
  ```

### Phase 4: Update Imports

- [ ] **Search for remaining old imports**
  ```bash
  # Search for any remaining references
  grep -r "VehicleDataPageUnified" src/
  grep -r "ImagesPageUnified" src/
  grep -r "UnifiedContactPage" src/
  grep -r "UnifiedEquipmentPage" src/
  ```

- [ ] **Manually fix any missed imports**
- [ ] **Update `App.tsx` imports**
- [ ] **Update any route definitions**

### Phase 5: Update Component Names

- [ ] **Update component export names inside files**
  - [ ] Check `VehicleDataPage.tsx` - ensure component is named `VehicleDataPage` not `VehicleDataPageUnified`
  - [ ] Check `ImagesPage.tsx` - ensure component is named `ImagesPage`
  - [ ] Check `ContactPage.tsx` - ensure component is named `ContactPage`
  - [ ] Check `EquipmentPage.tsx` - ensure component is named `EquipmentPage`

- [ ] **Update any JSDoc comments referencing old names**
- [ ] **Update any console.log statements with old names**

---

## 🧪 Testing Checklist

### Automated Tests

- [ ] **Run unit tests**
  ```bash
  npm test
  ```

- [ ] **Run type checking**
  ```bash
  npm run type-check
  # or
  npx tsc --noEmit
  ```

- [ ] **Run linter**
  ```bash
  npm run lint
  ```

- [ ] **Check for build errors**
  ```bash
  npm run build
  ```

### Manual Testing

- [ ] **Test sell workflow**
  - [ ] Navigate to `/sell/auto`
  - [ ] Go through vehicle data step
  - [ ] Go through equipment step
  - [ ] Go through images step
  - [ ] Go through contact step
  - [ ] Complete the flow

- [ ] **Test all renamed pages load correctly**
  - [ ] Vehicle Data Page loads
  - [ ] Images Page loads
  - [ ] Contact Page loads
  - [ ] Equipment Page loads

- [ ] **Test navigation between pages**
  - [ ] Forward navigation works
  - [ ] Back navigation works
  - [ ] Direct URL access works

### Visual Testing

- [ ] **Check for any UI regressions**
- [ ] **Verify responsive design still works**
- [ ] **Test on different browsers**
  - [ ] Chrome
  - [ ] Firefox
  - [ ] Safari (if available)

---

## 📝 Documentation Updates

- [ ] **Update IMPLEMENTATION_TRACKER.md**
  - [ ] Mark Day 3 as completed
  - [ ] Update progress percentage
  - [ ] Add completion date

- [ ] **Create progress report**: `PROGRESS_REPORT_WEEK1_DAY3.md`
  - [ ] Document what was renamed
  - [ ] List any issues encountered
  - [ ] Record metrics (files renamed, imports updated, etc.)

- [ ] **Update main README if needed**
  - [ ] Update any references to old component names

---

## 🔄 Git Workflow

### Commit Strategy

- [ ] **Stage renamed files**
  ```bash
  git add src/
  ```

- [ ] **Create meaningful commit message**
  ```bash
  git commit -m "refactor: remove 'Unified' suffix from component names

  - Renamed VehicleDataPageUnified → VehicleDataPage
  - Renamed ImagesPageUnified → ImagesPage
  - Renamed UnifiedContactPage → ContactPage
  - Renamed UnifiedEquipmentPage → EquipmentPage
  - Updated all imports across the project
  - All tests passing

  Part of Week 1, Day 3 refactoring plan"
  ```

- [ ] **Push to remote branch**
  ```bash
  git push origin refactor/naming-cleanup
  ```

### Pull Request

- [ ] **Create Pull Request**
  - [ ] Title: `refactor: Remove temporary naming suffixes (Week 1, Day 3)`
  - [ ] Description: Link to refactoring plan and progress report
  - [ ] Add labels: `refactoring`, `week-1`, `low-risk`
  - [ ] Request review from team

- [ ] **Address review comments**
- [ ] **Merge after approval**

---

## ⚠️ Rollback Plan

If issues arise:

### Immediate Rollback

- [ ] **Revert the commit**
  ```bash
  git revert HEAD
  git push origin refactor/naming-cleanup
  ```

### Full Rollback

- [ ] **Reset to previous commit**
  ```bash
  git reset --hard HEAD~1
  git push origin refactor/naming-cleanup --force
  ```

### Partial Rollback

- [ ] **Revert specific files**
  ```bash
  git checkout HEAD~1 -- path/to/file.tsx
  git commit -m "revert: Rollback specific file rename"
  ```

---

## 📊 Success Criteria

### Must Have (Blocking)
- [x] All 4 files renamed successfully
- [ ] All imports updated correctly
- [ ] All tests passing
- [ ] No build errors
- [ ] No console errors in browser

### Should Have (Important)
- [ ] Documentation updated
- [ ] Progress report created
- [ ] Pull request created and reviewed
- [ ] No visual regressions

### Nice to Have (Optional)
- [ ] Storybook stories updated (if applicable)
- [ ] E2E tests updated (if applicable)
- [ ] Performance metrics recorded

---

## 🎯 Definition of Done

Task is considered complete when:

1. ✅ All 4 components renamed
2. ✅ All imports updated across the project
3. ✅ All automated tests passing
4. ✅ Manual testing completed successfully
5. ✅ No console errors or warnings
6. ✅ Documentation updated
7. ✅ Progress report created
8. ✅ Code committed with clear message
9. ✅ Pull request created and reviewed
10. ✅ Changes merged to main branch

---

## 📞 Support

If you encounter issues:

1. **Check the logs**: Look for error messages in console/terminal
2. **Review the script**: Ensure the PowerShell script ran correctly
3. **Check git status**: Verify what files were changed
4. **Rollback if needed**: Use the rollback plan above
5. **Document the issue**: Add to progress report for future reference

---

## 🚀 After Completion

Once Day 3 is complete:

- [ ] **Celebrate the milestone!** 🎉
- [ ] **Move to Day 4**: Extract Provider Stack
- [ ] **Update project board**: Mark Day 3 as done
- [ ] **Share progress**: Update team on completion

---

**Status**: ⏳ Ready to Start  
**Assigned To**: Development Team  
**Priority**: High  
**Estimated Time**: 4-6 hours  
**Actual Time**: TBD

---

**Last Updated**: November 26, 2025  
**Next Review**: End of Day 3
