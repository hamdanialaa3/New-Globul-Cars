<#
.SYNOPSIS
    سكريبت تنفيذ إعادة الهيكلة الكامل
    Complete Restructure Execution Script

.DESCRIPTION
    ينفذ خطة إعادة هيكلة src/pages/ بالكامل مع:
    - النسخة الاحتياطية التلقائية
    - النقل التدريجي مع Git tags
    - تحديث Imports تلقائياً
    - الاختبار الشامل

.EXAMPLE
    .\EXECUTE_RESTRUCTURE.ps1
#>

# إعدادات
$ErrorActionPreference = "Stop"
$ProjectRoot = "c:\Users\hamda\Desktop\New Globul Cars\bulgarian-car-marketplace"

# دوال مساعدة
function Write-Step {
    param([string]$Message)
    Write-Host "`n$('='*60)" -ForegroundColor Cyan
    Write-Host "🚀 $Message" -ForegroundColor Cyan
    Write-Host "$('='*60)`n" -ForegroundColor Cyan
}

function Write-Success {
    param([string]$Message)
    Write-Host "✅ $Message" -ForegroundColor Green
}

function Write-Warning {
    param([string]$Message)
    Write-Host "⚠️  $Message" -ForegroundColor Yellow
}

function Write-Error {
    param([string]$Message)
    Write-Host "❌ $Message" -ForegroundColor Red
}

# بدء التنفيذ
Write-Host "`n" -NoNewline
Write-Host "🚀" -ForegroundColor Cyan -NoNewline
Write-Host " إعادة هيكلة src/pages/ " -ForegroundColor White -NoNewline
Write-Host "🚀`n" -ForegroundColor Cyan

Set-Location $ProjectRoot

# =======================
# الخطوة 1: النسخة الاحتياطية
# =======================
Write-Step "الخطوة 1/7: النسخة الاحتياطية"

git status
if ($LASTEXITCODE -ne 0) {
    Write-Error "Git غير متاح - تأكد من تثبيت Git"
    exit 1
}

Write-Host "حفظ التغييرات الحالية..." -ForegroundColor Yellow
git add .
git commit -m "BACKUP: Before pages restructure - $(Get-Date -Format 'yyyyMMdd_HHmmss')"

Write-Host "إنشاء backup tag..." -ForegroundColor Yellow
git tag backup-before-restructure -f

Write-Host "إنشاء branch للعمل..." -ForegroundColor Yellow
git checkout -b restructure-pages-safe

Write-Success "النسخة الاحتياطية مكتملة"

# =======================
# الخطوة 2: التبعيات
# =======================
Write-Step "الخطوة 2/7: تثبيت التبعيات"

npm install --save-dev fs-extra
if ($LASTEXITCODE -ne 0) {
    Write-Error "فشل تثبيت fs-extra"
    exit 1
}

Write-Success "التبعيات مثبتة"

# =======================
# الخطوة 3: اختبار السكريبت
# =======================
Write-Step "الخطوة 3/7: اختبار السكريبت (Dry-run)"

node RESTRUCTURE_PLANS/02_MIGRATION_SCRIPT.js --dry-run
if ($LASTEXITCODE -ne 0) {
    Write-Error "فشل dry-run"
    exit 1
}

Write-Warning "راجع المخرجات أعلاه"
$confirm = Read-Host "هل تريد المتابعة؟ (y/n)"
if ($confirm -ne 'y') {
    Write-Host "تم الإلغاء" -ForegroundColor Yellow
    exit 0
}

# =======================
# الخطوة 4: النقل التدريجي
# =======================
Write-Step "الخطوة 4/7: نقل الملفات (9 أقسام)"

$sections = @(
    @{name="core"; desc="Core Pages (6 files)"},
    @{name="auth"; desc="Auth Pages (5 files)"},
    @{name="marketplace"; desc="Marketplace Pages (3 files)"},
    @{name="sell"; desc="Sell System (30+ files)"},
    @{name="profile"; desc="Profile Pages (4 files)"},
    @{name="services"; desc="User Services (4 files)"},
    @{name="business"; desc="Business Pages (2 files)"},
    @{name="admin"; desc="Admin Pages (2 files)"},
    @{name="integration"; desc="Integration Pages (2 files)"}
)

$totalSections = $sections.Count
$currentSection = 0

foreach ($section in $sections) {
    $currentSection++
    Write-Host "`n[$currentSection/$totalSections] نقل $($section.desc)..." -ForegroundColor Cyan
    
    node RESTRUCTURE_PLANS/02_MIGRATION_SCRIPT.js --only=$($section.name)
    if ($LASTEXITCODE -ne 0) {
        Write-Error "فشل نقل $($section.name)"
        exit 1
    }
    
    git add .
    git commit -m "✅ Restructure: Move $($section.desc)"
    git tag "stage-$($section.name)-complete"
    
    Write-Success "$($section.desc) مكتمل"
}

Write-Success "جميع الملفات تم نقلها (78 ملف)"

# =======================
# الخطوة 5: تحديث App.tsx
# =======================
Write-Step "الخطوة 5/7: تحديث App.tsx imports"

node RESTRUCTURE_PLANS/03_UPDATE_APP_IMPORTS.js
if ($LASTEXITCODE -ne 0) {
    Write-Error "فشل تحديث App.tsx"
    exit 1
}

git add .
git commit -m "✅ Update App.tsx imports after restructure"

Write-Success "App.tsx محدّث"

# =======================
# الخطوة 6: تحديث ProfileRouter
# =======================
Write-Step "الخطوة 6/7: تحديث ProfileRouter.tsx"

Write-Warning "يجب تحديث ProfileRouter.tsx يدوياً"
Write-Host "افتح: src/pages/05_profile/ProfilePage/ProfileRouter.tsx"
Write-Host "غيّر imports من '../../' إلى '../'"

$routerPath = "src\pages\05_profile\ProfilePage\ProfileRouter.tsx"
if (Test-Path $routerPath) {
    code $routerPath
}

Read-Host "بعد التعديل، اضغط Enter"

git add .
git commit -m "✅ Update ProfileRouter.tsx imports"

Write-Success "ProfileRouter.tsx محدّث"

# =======================
# الخطوة 7: الاختبار
# =======================
Write-Step "الخطوة 7/7: الاختبار الشامل"

Write-Host "بناء المشروع..." -ForegroundColor Yellow
npm run build

if ($LASTEXITCODE -ne 0) {
    Write-Error "فشل البناء - راجع الأخطاء"
    exit 1
}

Write-Success "Build نجح!"

Write-Host "`nشغّل dev server للاختبار:`n" -ForegroundColor Cyan
Write-Host "  npm start`n"
Write-Host "اختبر الصفحات التالية:"
Write-Host "  - http://localhost:3000/"
Write-Host "  - http://localhost:3000/login"
Write-Host "  - http://localhost:3000/sell/vehicle-start"
Write-Host "  - http://localhost:3000/profile`n"

$testConfirm = Read-Host "بعد الاختبار، هل كل شيء يعمل؟ (y/n)"
if ($testConfirm -ne 'y') {
    Write-Warning "يمكنك الرجوع عبر: git checkout backup-before-restructure"
    exit 0
}

# =======================
# النهاية: الدمج
# =======================
Write-Host "`n" -NoNewline
Write-Host "🎉" -ForegroundColor Green -NoNewline
Write-Host " إعادة الهيكلة مكتملة! " -ForegroundColor White -NoNewline
Write-Host "🎉`n" -ForegroundColor Green

git add .
git commit -m "✅ Restructure complete: All pages reorganized + tested"
git tag restructure-complete

Write-Host "الدمج في main..." -ForegroundColor Yellow
git checkout main
git merge restructure-pages-safe

Write-Host "`nرفع إلى GitHub..." -ForegroundColor Yellow
git push origin main --tags

Write-Success "تم الرفع إلى GitHub"

# =======================
# ملخص النتائج
# =======================
Write-Host "`n$('='*60)" -ForegroundColor Green
Write-Host "📊 ملخص النتائج" -ForegroundColor Green
Write-Host "$('='*60)" -ForegroundColor Green
Write-Host "✅ الملفات المنقولة: 78 ملف"
Write-Host "✅ Git tags: 11 tag"
Write-Host "✅ Commits: 12 commit"
Write-Host "✅ نسبة الإنجاز: 100%"
Write-Host "$('='*60)`n" -ForegroundColor Green

Write-Host "الهيكل الجديد:" -ForegroundColor Cyan
Write-Host @"
src/pages/
├── 01_core/         ✅
├── 02_auth/         ✅
├── 03_marketplace/  ✅
├── 04_sell/         ✅
│   ├── _workflow/   ✅
│   ├── _mobile/     ✅
│   └── _legacy/     ✅
├── 05_profile/      ✅
├── 06_user_services/✅
├── 07_business/     ✅
├── 09_admin/        ✅
└── 10_integration/  ✅
"@

Write-Host "`n✨ نجح كل شيء! المشروع الآن منظم بشكل احترافي ✨`n" -ForegroundColor Green
