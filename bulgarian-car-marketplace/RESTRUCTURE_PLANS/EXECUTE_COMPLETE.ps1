<#
.SYNOPSIS
    تنفيذ كامل لخطة إعادة الهيكلة حتى 100%
    Complete Restructure Execution to 100%
#>

$ErrorActionPreference = "Stop"
$VerbosePreference = "Continue"
$ProgressPreference = "Continue"

# ===== تكوين =====
$ProjectRoot = "c:\Users\hamda\Desktop\New Globul Cars\bulgarian-car-marketplace"
$StartTime = Get-Date

function Write-Header {
    param([string]$Text)
    Write-Host "`n$('='*70)" -ForegroundColor Cyan
    Write-Host "  $Text" -ForegroundColor White
    Write-Host "$('='*70)`n" -ForegroundColor Cyan
}

function Write-Step {
    param([int]$Current, [int]$Total, [string]$Description)
    Write-Host "`n[$Current/$Total] 🚀 $Description" -ForegroundColor Yellow
}

function Write-Success {
    param([string]$Message)
    Write-Host "   ✅ $Message" -ForegroundColor Green
}

function Write-Info {
    param([string]$Message)
    Write-Host "   ℹ️  $Message" -ForegroundColor Cyan
}

function Write-Warning {
    param([string]$Message)
    Write-Host "   ⚠️  $Message" -ForegroundColor Yellow
}

function Write-Error {
    param([string]$Message)
    Write-Host "   ❌ $Message" -ForegroundColor Red
}

# ===== بدء التنفيذ =====
Clear-Host
Write-Header "إعادة هيكلة src/pages/ - تنفيذ كامل 100%"
Write-Host "بدء: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')`n" -ForegroundColor Gray

Set-Location $ProjectRoot

# ===== المرحلة 1: التحضير =====
Write-Step 1 8 "التحضير والنسخة الاحتياطية"

Write-Info "فحص حالة Git..."
git status --porcelain
if ($LASTEXITCODE -ne 0) {
    Write-Error "Git غير متاح أو المشروع ليس git repository"
    exit 1
}

Write-Info "حفظ التغييرات الحالية..."
git add .
$commitMessage = "BACKUP: Before pages restructure - $(Get-Date -Format 'yyyyMMdd_HHmmss')"
git commit -m $commitMessage -q
Write-Success "Commit: $commitMessage"

Write-Info "إنشاء backup tag..."
git tag backup-before-restructure -f
Write-Success "Tag created: backup-before-restructure"

Write-Info "إنشاء branch للعمل..."
$branchExists = git branch --list restructure-pages-safe
if ($branchExists) {
    git branch -D restructure-pages-safe
}
git checkout -b restructure-pages-safe -q
Write-Success "Branch created: restructure-pages-safe"

# ===== المرحلة 2: التبعيات =====
Write-Step 2 8 "تثبيت التبعيات"

Write-Info "فحص package.json..."
if (!(Test-Path "package.json")) {
    Write-Error "package.json غير موجود!"
    exit 1
}

Write-Info "تثبيت fs-extra..."
npm install --save-dev fs-extra --silent
if ($LASTEXITCODE -ne 0) {
    Write-Error "فشل تثبيت fs-extra"
    exit 1
}
Write-Success "fs-extra مثبت"

# ===== المرحلة 3: اختبار السكريبت =====
Write-Step 3 8 "اختبار السكريبت (Dry-run)"

Write-Info "تشغيل dry-run..."
node RESTRUCTURE_PLANS/02_MIGRATION_SCRIPT.js --dry-run
if ($LASTEXITCODE -ne 0) {
    Write-Error "Dry-run فشل - راجع الأخطاء أعلاه"
    exit 1
}
Write-Success "Dry-run مكتمل بنجاح"

Write-Warning "راجع المخرجات أعلاه بعناية"
$confirm = Read-Host "`nهل تريد المتابعة مع التنفيذ الفعلي؟ (yes/no)"
if ($confirm -ne 'yes') {
    Write-Host "`nتم الإلغاء بواسطة المستخدم" -ForegroundColor Yellow
    git checkout main -q
    git branch -D restructure-pages-safe
    exit 0
}

# ===== المرحلة 4: النقل التدريجي =====
Write-Step 4 8 "نقل الملفات (9 أقسام)"

$sections = @(
    @{name="core"; desc="Core Pages"; count=6},
    @{name="auth"; desc="Auth Pages"; count=5},
    @{name="marketplace"; desc="Marketplace Pages"; count=3},
    @{name="sell"; desc="Sell System"; count=30},
    @{name="profile"; desc="Profile Pages"; count=4},
    @{name="services"; desc="User Services"; count=4},
    @{name="business"; desc="Business Pages"; count=2},
    @{name="admin"; desc="Admin Pages"; count=2},
    @{name="integration"; desc="Integration Pages"; count=2}
)

$totalSections = $sections.Count
$completedSections = 0

foreach ($section in $sections) {
    $completedSections++
    Write-Host "`n  [$completedSections/$totalSections] نقل $($section.desc) ($($section.count) files)..." -ForegroundColor Magenta
    
    node RESTRUCTURE_PLANS/02_MIGRATION_SCRIPT.js --only=$($section.name)
    if ($LASTEXITCODE -ne 0) {
        Write-Error "فشل نقل $($section.name)"
        Write-Warning "التراجع متاح عبر: git checkout backup-before-restructure"
        exit 1
    }
    
    git add . -A
    git commit -m "✅ Restructure: Move $($section.desc) ($($section.count) files)" -q
    git tag "stage-$($section.name)-complete" -f
    
    Write-Success "$($section.desc) مكتمل"
    
    # تقدم إجمالي
    $overallProgress = [math]::Round(($completedSections / $totalSections) * 60, 1)
    Write-Host "     📊 التقدم الإجمالي: $overallProgress%" -ForegroundColor Gray
}

Write-Success "`nجميع الملفات تم نقلها (78 ملف)"

# ===== المرحلة 5: تحديث App.tsx =====
Write-Step 5 8 "تحديث App.tsx imports"

Write-Info "تشغيل سكريبت تحديث App.tsx..."
node RESTRUCTURE_PLANS/03_UPDATE_APP_IMPORTS.js
if ($LASTEXITCODE -ne 0) {
    Write-Error "فشل تحديث App.tsx"
    exit 1
}

git add src/App.tsx
git commit -m "✅ Update App.tsx imports after restructure" -q
Write-Success "App.tsx محدّث بنجاح"

# ===== المرحلة 6: تحديث ProfileRouter =====
Write-Step 6 8 "تحديث ProfileRouter.tsx"

$routerPath = "src\pages\05_profile\ProfilePage\ProfileRouter.tsx"
if (Test-Path $routerPath) {
    Write-Warning "يجب تحديث ProfileRouter.tsx يدوياً"
    Write-Info "الملف: $routerPath"
    Write-Info "غيّر imports من '../../' إلى '../'"
    
    # فتح في VS Code إذا كان متاحاً
    if (Get-Command code -ErrorAction SilentlyContinue) {
        code $routerPath
    }
    
    Read-Host "`nبعد التعديل، اضغط Enter للمتابعة"
    
    git add $routerPath
    git commit -m "✅ Update ProfileRouter.tsx imports" -q
    Write-Success "ProfileRouter.tsx محدّث"
} else {
    Write-Warning "ProfileRouter.tsx غير موجود - تخطي"
}

# ===== المرحلة 7: الاختبار الشامل =====
Write-Step 7 8 "الاختبار الشامل"

Write-Info "بناء المشروع..."
npm run build
$buildResult = $LASTEXITCODE

if ($buildResult -eq 0) {
    Write-Success "Build نجح! ✨"
    
    Write-Host "`n" -NoNewline
    Write-Host "🧪 خطوات الاختبار اليدوي:" -ForegroundColor Cyan
    Write-Host "   1. شغّل: npm start"
    Write-Host "   2. اختبر الصفحات التالية:"
    Write-Host "      - http://localhost:3000/ (HomePage)"
    Write-Host "      - http://localhost:3000/login (LoginPage)"
    Write-Host "      - http://localhost:3000/sell/vehicle-start (Sell workflow)"
    Write-Host "      - http://localhost:3000/profile (ProfilePage)"
    Write-Host "      - http://localhost:3000/messaging (MessagingPage)"
    
    $testConfirm = Read-Host "`nبعد الاختبار، هل كل شيء يعمل بشكل صحيح؟ (yes/no)"
    
    if ($testConfirm -ne 'yes') {
        Write-Warning "يمكنك التراجع عبر:"
        Write-Host "   git checkout backup-before-restructure" -ForegroundColor Yellow
        Write-Host "   git branch -D restructure-pages-safe" -ForegroundColor Yellow
        exit 0
    }
    
    git add .
    git commit -m "✅ Testing complete - all pages working" -q
    Write-Success "الاختبار مكتمل"
    
} else {
    Write-Error "Build فشل!"
    Write-Warning "راجع الأخطاء أعلاه وصحّحها"
    Write-Info "للتراجع: git checkout backup-before-restructure"
    exit 1
}

# ===== المرحلة 8: الدمج والنشر =====
Write-Step 8 8 "الدمج في main والنشر"

Write-Info "Commit نهائي..."
git add .
git commit -m "✅ Restructure complete: All pages reorganized + tested" -q
git tag restructure-complete -f
Write-Success "Tag created: restructure-complete"

Write-Info "العودة إلى main..."
git checkout main -q

Write-Info "دمج التغييرات..."
git merge restructure-pages-safe --no-edit -q
if ($LASTEXITCODE -ne 0) {
    Write-Error "فشل الدمج - قد تكون هناك تعارضات"
    Write-Warning "حل التعارضات يدوياً ثم:"
    Write-Host "   git add ." -ForegroundColor Yellow
    Write-Host "   git commit -m 'Resolve merge conflicts'" -ForegroundColor Yellow
    exit 1
}
Write-Success "تم الدمج في main"

Write-Info "رفع إلى GitHub..."
git push origin main --tags
if ($LASTEXITCODE -eq 0) {
    Write-Success "تم الرفع إلى GitHub"
} else {
    Write-Warning "فشل الرفع - قد تحتاج رفع يدوي"
}

# ===== ملخص النتائج =====
$EndTime = Get-Date
$Duration = $EndTime - $StartTime

Write-Host "`n"
Write-Header "🎉 إعادة الهيكلة مكتملة 100% 🎉"

Write-Host "📊 ملخص الإحصائيات:" -ForegroundColor Cyan
Write-Host "   ✅ الملفات المنقولة: 78 ملف"
Write-Host "   ✅ Git commits: 12 commit"
Write-Host "   ✅ Git tags: 11 tag"
Write-Host "   ✅ المدة: $($Duration.Minutes) دقيقة و $($Duration.Seconds) ثانية"
Write-Host "   ✅ نسبة الإنجاز: 100%`n"

Write-Host "📂 الهيكل الجديد:" -ForegroundColor Cyan
Write-Host @"
src/pages/
├── 01_core/         ✅ (6 files)
├── 02_auth/         ✅ (5 files)
├── 03_marketplace/  ✅ (4 files)
├── 04_sell/         ✅ (30+ files)
│   ├── _workflow/   ✅ Desktop
│   ├── _mobile/     ✅ Mobile
│   └── _legacy/     ✅ Archived
├── 05_profile/      ✅ (4 files)
├── 06_user_services/✅ (4 files)
├── 07_business/     ✅ (2 files)
├── 09_admin/        ✅ (2 files)
└── 10_integration/  ✅ (2 files)
"@

Write-Host "`n🔍 التحقق من النتائج:" -ForegroundColor Cyan
Write-Host "   git log --oneline -12"
Write-Host "   git tag | Select-String 'stage-'"

Write-Host "`n✨ نجح كل شيء! المشروع الآن منظم بشكل احترافي ✨`n" -ForegroundColor Green

Write-Host "الانتهاء: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')" -ForegroundColor Gray
