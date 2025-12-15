# Organization Script - تنظيف ملفات التوثيق
# تاريخ: 15 ديسمبر 2025

Write-Host "🚀 بدء تنظيف ملفات التوثيق..." -ForegroundColor Green
Write-Host ""

$rootPath = "c:\Users\hamda\Desktop\New Globul Cars"
$orgPath = "$rootPath\DOCUMENTATION_ORGANIZED"

# ==================== 01_ESSENTIAL ====================
Write-Host "📁 نقل الملفات الأساسية إلى 01_ESSENTIAL..." -ForegroundColor Cyan

$essentialFiles = @(
    "README.md",
    "START_HERE.md",
    "INDEX.md"
)

foreach ($file in $essentialFiles) {
    $source = Join-Path $rootPath $file
    $dest = Join-Path $orgPath "01_ESSENTIAL\$file"
    if (Test-Path $source) {
        Copy-Item $source $dest -Force
        Write-Host "  ✅ نقل: $file" -ForegroundColor Green
    }
}

# نسخ copilot instructions
$copilotSource = "$rootPath\.github\copilot-instructions.md"
if (Test-Path $copilotSource) {
    Copy-Item $copilotSource "$orgPath\01_ESSENTIAL\copilot-instructions.md" -Force
    Write-Host "  ✅ نقل: copilot-instructions.md" -ForegroundColor Green
}

Write-Host ""

# ==================== 02_GUIDES ====================
Write-Host "📁 نقل الأدلة إلى 02_GUIDES..." -ForegroundColor Cyan

$guideFiles = @(
    "DEPLOYMENT_READY_INSTRUCTIONS.md",
    "ENV_SETUP_GUIDE.md",
    "SELL_WORKFLOW_COMPLETE_DOCUMENTATION.md",
    "STRIPE_SETUP_COMPLETE_GUIDE.md",
    "TESTING_COMPLETE_GUIDE.md",
    "PROGRAMMING_PRIORITIES_COMPLETE_DEC_11_2025.md",
    "GIT_COMMIT_INSTRUCTIONS.md",
    "BILLING_DEPLOYMENT_GUIDE.md",
    "FIRESTORE_INDEX_CREATION_GUIDE.md",
    "PRODUCTION_READY_CHECKLIST.md"
)

foreach ($file in $guideFiles) {
    $source = Join-Path $rootPath $file
    $dest = Join-Path $orgPath "02_GUIDES\$file"
    if (Test-Path $source) {
        Copy-Item $source $dest -Force
        Write-Host "  ✅ نقل: $file" -ForegroundColor Green
    }
}

# نسخ FIREBASE_INFO.txt
if (Test-Path "$rootPath\FIREBASE_INFO.txt") {
    Copy-Item "$rootPath\FIREBASE_INFO.txt" "$orgPath\02_GUIDES\FIREBASE_INFO.txt" -Force
    Write-Host "  ✅ نقل: FIREBASE_INFO.txt" -ForegroundColor Green
}

Write-Host ""

# ==================== 03_TECHNICAL ====================
Write-Host "📁 نقل التوثيق التقني إلى 03_TECHNICAL..." -ForegroundColor Cyan

$technicalFiles = @(
    "PROJECT_DOCUMENTATION.md",
    "PROJECT_FIXES_AND_IMPROVEMENTS.md",
    "EXECUTIVE_SUMMARY.md"
)

foreach ($file in $technicalFiles) {
    $source = Join-Path $rootPath $file
    $dest = Join-Path $orgPath "03_TECHNICAL\$file"
    if (Test-Path $source) {
        Copy-Item $source $dest -Force
        Write-Host "  ✅ نقل: $file" -ForegroundColor Green
    }
}

# نسخ مجلد docs/architecture
if (Test-Path "$rootPath\docs\architecture") {
    Copy-Item "$rootPath\docs\architecture" "$orgPath\03_TECHNICAL\architecture" -Recurse -Force
    Write-Host "  ✅ نقل مجلد: architecture/" -ForegroundColor Green
}

# نسخ ملفات docs المهمة
$docsFiles = @(
    "docs\SEARCH_SYSTEM_COMPLETE_DOCUMENTATION.md",
    "docs\AI_ARCHITECTURE.md",
    "docs\profile-system.md"
)

foreach ($file in $docsFiles) {
    $source = Join-Path $rootPath $file
    $filename = Split-Path $file -Leaf
    $dest = Join-Path $orgPath "03_TECHNICAL\$filename"
    if (Test-Path $source) {
        Copy-Item $source $dest -Force
        Write-Host "  ✅ نقل: $filename" -ForegroundColor Green
    }
}

Write-Host ""

# ==================== 04_ARABIC_DOCS ====================
Write-Host "📁 نقل التوثيق العربي إلى 04_ARABIC_DOCS..." -ForegroundColor Cyan

$arabicFiles = @(
    "تقرير_التحليل_الشامل_للمشروع_2025.md",
    "خطة_إصلاح_النظام.md",
    "دليل_التعديل_والحذف.md",
    "دليل_تصحيح_الصور.md",
    "تقرير_البروفايل_والاشتراكات.md",
    "تأثير_ANY_على_المشروع.md"
)

foreach ($file in $arabicFiles) {
    $source = Join-Path $rootPath $file
    $dest = Join-Path $orgPath "04_ARABIC_DOCS\$file"
    if (Test-Path $source) {
        Copy-Item $source $dest -Force
        Write-Host "  ✅ نقل: $file" -ForegroundColor Green
    }
}

# نسخ مجلد docs/07_ARABIC_DOCS
if (Test-Path "$rootPath\docs\07_ARABIC_DOCS") {
    Copy-Item "$rootPath\docs\07_ARABIC_DOCS" "$orgPath\04_ARABIC_DOCS\07_ARABIC_DOCS" -Recurse -Force
    Write-Host "  ✅ نقل مجلد: 07_ARABIC_DOCS/" -ForegroundColor Green
}

Write-Host ""

# ==================== 05_DEPRECATED ====================
Write-Host "📁 نقل الملفات القديمة إلى 05_DEPRECATED..." -ForegroundColor Yellow

# Deployment files (deprecated)
$deploymentFiles = @(
    "DEPLOYMENT_COMPLETE.md",
    "DEPLOYMENT_COMPLETED.md",
    "DEPLOYMENT_EXECUTED.md",
    "DEPLOYMENT_STATUS.md",
    "DEPLOYMENT_SOLUTION.md",
    "DEPLOYMENT_FINAL_STATUS.md",
    "DEPLOYMENT_SUMMARY_2025-12-13_0551.md",
    "DEPLOYMENT_INSTRUCTIONS.md",
    "DEPLOY_MANUAL_STEPS.md",
    "URGENT_DEPLOY_INSTRUCTIONS.md",
    "FINAL_DEPLOYMENT_VERIFICATION.md",
    "FINAL_DEPLOY_SOLUTION.md",
    "COMPLETE_DEPLOYMENT_CHECKLIST.md"
)

# Documentation files (deprecated)
$documentationFiles = @(
    "DOCUMENTATION_CLEANUP_COMPLETE.md",
    "DOCUMENTATION_CLEANUP_PLAN.md",
    "DOCUMENTATION_CLEANUP_SUMMARY.md",
    "DOCUMENTATION_FINAL_STATUS.md",
    "DOCUMENTATION_STATUS.md",
    "DOCUMENTATION_STRUCTURE.md",
    "DOCUMENTATION_INDEX.md",
    "FINAL_DOCUMENTATION_CLEANUP_REPORT.md"
)

# Analysis files (deprecated)
$analysisFiles = @(
    "ANALYSIS_COMPLETE_SUMMARY.md",
    "ANALYSIS_SUMMARY_EN.md",
    "ANALYSIS_SUMMARY_EN_2025.md",
    "COMPREHENSIVE_PROJECT_ANALYSIS_2025.md",
    "COMPREHENSIVE_PROJECT_ANALYSIS_2025_EN.md",
    "FINAL_COMPLETE_ANALYSIS_REPORT.md",
    "تقرير_التحليل_الشامل_2025_محدث.md",
    "تقرير_التحليل_الشامل_للمشروع.md"
)

# Fixes & Cleanup (deprecated)
$fixesFiles = @(
    "ANY_FIXES_BATCH2.md",
    "ANY_FIXES_BATCH3_COMPONENTS.md",
    "ANY_FIXES_COMPLETE_BATCH1.md",
    "ANY_FIXES_FINAL_SUMMARY.md",
    "ANY_FIXES_PROGRESS.md",
    "FINAL_ANY_FIXES_SUMMARY.md",
    "FIXES_APPLIED_SUMMARY.md",
    "FIXES_COMPLETED_SUMMARY.md",
    "FIXES_SUMMARY.md",
    "CLEANUP_COMPLETION_REPORT.md",
    "CLEANUP_FINAL_SUMMARY.md",
    "CLEANUP_PLAN.md",
    "FINAL_CLEANUP_SUMMARY.md",
    "DUPLICATE_CLEANUP_COMPLETE.md",
    "FIX_BUILD_AND_DEPLOY.md",
    "FIX_FIREBASE_DEPLOY.md",
    "FIX_SYNTAX_ERROR.md"
)

# Sell Workflow (deprecated)
$sellWorkflowFiles = @(
    "SELL_WORKFLOW_ANALYSIS.md",
    "SELL_WORKFLOW_DOCUMENTATION.md",
    "SELL_WORKFLOW_DATA_MAPPING_VERIFICATION.md",
    "SELL_WORKFLOW_LINKS.md",
    "SELL_WORKFLOW_UNIFICATION_PLAN.md",
    "COMPLETE_SELL_WORKFLOW_ANALYSIS.md",
    "FINAL_UNIFICATION_EXECUTION.md",
    "COMPLETE_UNIFICATION_PLAN.md"
)

# Stripe (deprecated)
$stripeFiles = @(
    "STRIPE_INTEGRATION_COMPLETE.md",
    "STRIPE_QUICK_START.md"
)

# Homepage (deprecated)
$homepageFiles = @(
    "HOMEPAGE_COMPETITIVE_ANALYSIS.md",
    "HOMEPAGE_COMPETITIVE_ANALYSIS_2025.md",
    "HOMEPAGE_COMPETITIVE_STRATEGY.md",
    "HOMEPAGE_DEEP_ANALYSIS_AND_IMPROVEMENTS.md",
    "HOMEPAGE_IMPROVEMENT_RECOMMENDATIONS.md"
)

# Modal System (deprecated)
$modalFiles = @(
    "MODAL_SYSTEM_FINAL_DOCUMENTATION.md",
    "MODAL_SYSTEM_IMPLEMENTATION_COMPLETE.md"
)

# Loading Overlay (deprecated)
$loadingFiles = @(
    "LOADING_OVERLAY_QUICK_START.md",
    "LOADING_OVERLAY_STATUS.md",
    "LOADING_OVERLAY_VERIFICATION_REPORT.md"
)

# Other deprecated
$otherDeprecated = @(
    "SESSION_SUMMARY_DEC_13_2025.md",
    "IMPLEMENTATION_COMPLETE_DEC_13_2025.md",
    "PHASE_1_IMPLEMENTATION_COMPLETE.md",
    "WORK_COMPLETED.md",
    "CHANGELOG_DEC_13_2025.md",
    "CHANGES_SUMMARY.md",
    "ROUTE_REDIRECT_FIX.md",
    "CAR_DETAILS_LAYOUT_FIX.md",
    "QUICK_FIX_ANALYTICS_IMPORTS.md",
    "QUICK_FIX_CHECKLIST.md",
    "ACTION_CHECKLIST_2025.md",
    "ACTION_PLAN_QUICK_REFERENCE.md",
    "links_all.md",
    "SETUP_FILES.md",
    "SHAREBUTTON_GUIDE.md",
    "SHAREBUTTON_IMPLEMENTATION_SUMMARY.md",
    "USER_PROFILE_LINKS_GUIDE.md",
    "VAPID_SETUP_GUIDE.md",
    "VIRTUAL_SCROLLING_EXPLANATION.md",
    "VIRTUAL_SCROLLING_IMPLEMENTATION.md",
    "VITE_MIGRATION_GUIDE.md",
    "TAILWIND_DECISION_REPORT.md",
    "TYPE_SAFETY_IMPROVEMENTS.md",
    "MODERN_PRACTICES_RECOMMENDATIONS.md",
    "TEST_REPORT_2025.md",
    "DATA_SYNC_CRITICAL_ISSUE.md",
    "ADVANCED_SEARCH_FIXES.md",
    "CORRECT_BUILD_COMMANDS.md",
    "BILLING_TOAST_UX_IMPLEMENTATION.md",
    "SETUP_AUTOHUB_AI_LOADER.md",
    "FINAL_DELIVERY_SUMMARY.md",
    "ملف الازرار واللمسات .md"
)

$allDeprecated = $deploymentFiles + $documentationFiles + $analysisFiles + $fixesFiles + $sellWorkflowFiles + $stripeFiles + $homepageFiles + $modalFiles + $loadingFiles + $otherDeprecated

$movedCount = 0
foreach ($file in $allDeprecated) {
    $source = Join-Path $rootPath $file
    $dest = Join-Path $orgPath "05_DEPRECATED\$file"
    if (Test-Path $source) {
        Copy-Item $source $dest -Force
        $movedCount++
    }
}

Write-Host "  ✅ نقل $movedCount ملف إلى DEPRECATED" -ForegroundColor Yellow

Write-Host ""

# ==================== إحصائيات ====================
Write-Host "📊 إحصائيات التنظيف:" -ForegroundColor Magenta
Write-Host "  01_ESSENTIAL: $(( Get-ChildItem "$orgPath\01_ESSENTIAL" -File).Count) ملفات" -ForegroundColor Green
Write-Host "  02_GUIDES: $(( Get-ChildItem "$orgPath\02_GUIDES" -File).Count) ملفات" -ForegroundColor Green
Write-Host "  03_TECHNICAL: $(( Get-ChildItem "$orgPath\03_TECHNICAL" -File -Recurse).Count) ملفات" -ForegroundColor Green
Write-Host "  04_ARABIC_DOCS: $(( Get-ChildItem "$orgPath\04_ARABIC_DOCS" -File -Recurse).Count) ملفات" -ForegroundColor Green
Write-Host "  05_DEPRECATED: $(( Get-ChildItem "$orgPath\05_DEPRECATED" -File).Count) ملفات" -ForegroundColor Yellow

Write-Host ""
Write-Host "✅ التنظيف مكتمل بنجاح!" -ForegroundColor Green
Write-Host ""
Write-Host "📝 الخطوة التالية:" -ForegroundColor Cyan
Write-Host "   راجع الملفات في DOCUMENTATION_ORGANIZED/" -ForegroundColor White
Write-Host "   ثم قم بحذف الملفات الأصلية من الجذر إذا كنت راضياً عن النتيجة" -ForegroundColor White
Write-Host ""
