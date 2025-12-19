# Documentation Cleanup Script for bulgarian-car-marketplace
# تنظيف التوثيق - نقل الملفات المكررة إلى الأرشيف

$archiveDir = "ARCHIVE\DOCUMENTATION_CLEANUP_2025-01-26"

# إنشاء مجلد الأرشيف
if (-not (Test-Path $archiveDir)) {
    New-Item -ItemType Directory -Path $archiveDir -Force | Out-Null
    Write-Host "✅ Created archive directory: $archiveDir" -ForegroundColor Green
}

# قائمة الملفات المكررة التي تم دمجها
$filesToArchive = @(
    # تقارير الإكمال المكررة
    "FINAL_COMPLETE_REPORT.md",
    "COMPLETE_STATUS.md",
    "EXECUTION_COMPLETE.md",
    "ALL_DONE.md",
    "MISSION_ACCOMPLISHED.md",
    
    # تقارير التقدم المكررة
    "PROGRESS_REPORT_WEEK1_DAY1-2.md",
    "PROGRESS_REPORT_WEEK1_DAY4.md",
    "PROGRESS_REPORT_WEEK2_COMPLETE.md",
    "PROGRESS_REPORT_WEEK3_COMPLETE.md",
    "WEEK1_DAY1-2_SUMMARY.md",
    "ملخص_الإنجاز_الأسبوع1_اليوم1-2.md",
    
    # تقارير Algolia المكررة
    "✅_ALGOLIA_COMPLETE_SUMMARY.md",
    "ALGOLIA_COMPLETE_SUMMARY.md",
    "ALGOLIA_FINAL_STEPS.md",
    "ALGOLIA_QUICK_START.md",
    "ALGOLIA_SETUP.md",
    "ALGOLIA_ERROR_FIX.md",
    "README_ALGOLIA.md",
    "ابدأ_هنا_ALGOLIA.md",
    
    # تقارير Loading Overlay المكررة
    "LOADING_OVERLAY_SETUP_COMPLETE.md",
    "LOADING_OVERLAY_FINAL_SUMMARY.md",
    "LOADING_OVERLAY_INTEGRATION_GUIDE.md",
    
    # تقارير Phase المكررة
    "PHASE-4-UNIFIED-SERVICES.md",
    "PHASE-5-COMPLETED.md",
    "PHASE-6-MIGRATION.md",
    
    # تقارير أخرى مكررة
    "FINAL_STATUS_REPORT.md",
    "SUMMARY.md",
    "ANALYSIS_REPORT.md",
    "DEEP_PROJECT_ANALYSIS_REPORT.md"
)

# نقل الملفات
$movedCount = 0
foreach ($file in $filesToArchive) {
    if (Test-Path $file) {
        $destination = Join-Path $archiveDir $file
        Move-Item -Path $file -Destination $destination -Force
        Write-Host "✅ Moved: $file" -ForegroundColor Green
        $movedCount++
    } else {
        Write-Host "⚠️  Not found: $file" -ForegroundColor Yellow
    }
}

Write-Host "`n✅ Cleanup complete! Moved $movedCount files to archive." -ForegroundColor Green
Write-Host "📁 Archive location: $archiveDir" -ForegroundColor Cyan
Write-Host "`n📚 New unified documentation:" -ForegroundColor Cyan
Write-Host "   - PROJECT_STATUS.md (Main report)" -ForegroundColor White
Write-Host "   - DOCUMENTATION_INDEX.md (Updated index)" -ForegroundColor White

