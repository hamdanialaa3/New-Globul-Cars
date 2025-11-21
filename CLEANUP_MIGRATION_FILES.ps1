# Cleanup Migration Files - Keep Only Essential Files
# Run: powershell -ExecutionPolicy Bypass -File CLEANUP_MIGRATION_FILES.ps1

Write-Host "Cleaning up migration files..." -ForegroundColor Yellow

# Files to KEEP (Essential)
$keepFiles = @(
    "START_HERE.md",
    "COMPLETE_MIGRATION_GUIDE.md",
    "FINAL_STATUS.md",
    "README_MIGRATION.md",
    "COPY_FILES.ps1",
    "MANUAL_COPY_INSTRUCTIONS.md"
)

# Files to DELETE (Redundant)
$deleteFiles = @(
    "MIGRATION_100_PERCENT_COMPLETE.md",
    "MIGRATION_99_PERCENT_COMPLETE.md",
    "MIGRATION_FINAL_REPORT.md",
    "MIGRATION_COMPLETE_README.md",
    "FINAL_MIGRATION_98_PERCENT.md",
    "MIGRATION_UI_DESIGN_SYSTEM_COMPLETE.md",
    "MIGRATION_UI_MOBILE_COMPLETE.md",
    "FINAL_MIGRATION_STATUS_UPDATED.md",
    "MIGRATION_CORE_HOOKS_COMPLETE.md",
    "MIGRATION_100_PERCENT_COMPLETE_FINAL.md",
    "MIGRATION_UI_COMPLETE.md",
    "MIGRATION_CARS_SERVICES_COMPLETE.md",
    "MIGRATION_COMPLETE_SUMMARY.md",
    "FINAL_MIGRATION_COMPLETE.md",
    "MIGRATION_PROFILE_HOOKS_COMPLETE.md",
    "MIGRATION_COMPLETE_SUMMARY_FINAL.md",
    "MIGRATION_UI_COMPONENTS_COMPLETE.md",
    "MIGRATION_COMPLETE_FINAL.md",
    "MIGRATION_HOOKS_COMPLETE.md",
    "FINAL_MIGRATION_STATUS.md",
    "FINAL_MIGRATION_SUMMARY.md",
    "FINAL_MIGRATION_STATUS_UPDATE.md",
    "FINAL_MIGRATION_COMPLETE_REPORT.md",
    "COMPLETE_MIGRATION_SUMMARY_FINAL.md",
    "FINAL_100_PERCENT_MIGRATION_STATUS.md",
    "FINAL_MIGRATION_STATUS_NOV20.md",
    "MIGRATION_95_PERCENT_COMPLETE.md",
    "MIGRATION_REGISTERPAGE_COMPLETE.md",
    "MIGRATION_LOGINPAGE_COMPLETE.md",
    "MIGRATION_STRUCTURE_COMPLETE.md",
    "MIGRATION_COMPLETE_STATUS_NOV20.md",
    "MIGRATION_PROGRESS_UPDATE.md",
    "SERVICES_MIGRATION_STATUS.md",
    "MIGRATION_PROGRESS_REPORT.md",
    "MIGRATION_FIXES_COMPLETE.md",
    "MIGRATION_EXECUTION_STATUS.md",
    "MIGRATION_CORE_COMPLETE_FINAL.md",
    "MIGRATION_CORE_FINAL_SUMMARY.md",
    "MIGRATION_CORE_FINAL_STATUS.md",
    "MIGRATION_CORE_PROGRESS.md",
    "MIGRATION_TYPES_FINAL.md",
    "MIGRATION_TYPES_COMPLETE.md",
    "MIGRATION_PROGRESS_TYPES.md",
    "COMPLETE_MIGRATION_STATUS.md",
    "FINAL_MIGRATION_REPORT.md",
    "MIGRATION_PLAN_DETAILED.md",
    "MIGRATION_REPORT_PHASE1.md",
    "MIGRATION_PROGRESS.md",
    "MIGRATION_100_PERCENT_FINAL.md",
    "MIGRATION_FINAL_100_PERCENT.md",
    "MIGRATION_100_PERCENT_PLAN.md",
    "FINAL_SUMMARY.md",
    "FINAL_STATUS_SUMMARY.md",
    "FINAL_CHECKLIST.md",
    "HONEST_FINAL_STATUS.md",
    "FINAL_SOLUTION_INSTRUCTIONS.md",
    "FINAL_FIX_SUMMARY.md",
    "FINAL_SOLUTION.md",
    "FINAL_MODULE_SCOPE_FIX.md",
    "CORE_PACKAGE_100_PERCENT_FINAL.md",
    "FINAL_CORE_PACKAGE_STATUS.md",
    "CORE_PACKAGE_100_PERCENT_COMPLETE.md",
    "CORE_PACKAGE_COMPLETE_100_PERCENT.md",
    "CORE_PACKAGE_FIXES.md",
    "WHY_98_PERCENT.md",
    "COPY_CARDATA_STATIC.md",
    "COPY_LARGE_FILES_MANUAL.md",
    "COPY_CORE_FILES.bat",
    "COPY_CORE_FILES.ps1",
    "COPY_MOBILE_DESIGN_SYSTEM.bat",
    "COMPLETE_MIGRATION.ps1"
)

$deletedCount = 0
$notFoundCount = 0

foreach ($file in $deleteFiles) {
    if (Test-Path $file) {
        Remove-Item $file -Force
        Write-Host "✅ Deleted: $file" -ForegroundColor Green
        $deletedCount++
    } else {
        Write-Host "⚠️  Not found: $file" -ForegroundColor Yellow
        $notFoundCount++
    }
}

Write-Host "`n✅ Cleanup Complete!" -ForegroundColor Green
Write-Host "Deleted: $deletedCount files" -ForegroundColor Cyan
Write-Host "Not found: $notFoundCount files" -ForegroundColor Yellow
Write-Host "`nEssential files kept:" -ForegroundColor Cyan
foreach ($file in $keepFiles) {
    if (Test-Path $file) {
        Write-Host "  ✅ $file" -ForegroundColor Green
    }
}

