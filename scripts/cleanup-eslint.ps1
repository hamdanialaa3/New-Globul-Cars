# ESLint Auto-Fix PowerShell Script
# Bulgarian Car Marketplace - Code Cleanup

Write-Host "🚀 بدء عملية تنظيف كود سوق السيارات البلغاري..." -ForegroundColor Green
Write-Host ""

# Change to the main project directory
Set-Location "bulgarian-car-marketplace"

Write-Host "📁 دليل العمل الحالي: $(Get-Location)" -ForegroundColor Yellow

# Check if we're in the right directory
if (-not (Test-Path "package.json")) {
    Write-Host "❌ لم يتم العثور على package.json. تأكد من أنك في دليل المشروع الصحيح." -ForegroundColor Red
    exit 1
}

Write-Host "✅ تم العثور على package.json" -ForegroundColor Green

# Step 1: Install dependencies if needed
Write-Host ""
Write-Host "📦 فحص التبعيات..." -ForegroundColor Blue
if (-not (Test-Path "node_modules")) {
    Write-Host "⬇️ تثبيت التبعيات..." -ForegroundColor Yellow
    npm install
} else {
    Write-Host "✅ التبعيات مثبتة بالفعل" -ForegroundColor Green
}

# Step 2: Run ESLint auto-fix
Write-Host ""
Write-Host "🔧 تشغيل ESLint لإصلاح المشاكل تلقائياً..." -ForegroundColor Blue
try {
    npx eslint "src/**/*.{tsx,ts,jsx,js}" --fix --max-warnings 100
    Write-Host "✅ تم إصلاح المشاكل التلقائية" -ForegroundColor Green
} catch {
    Write-Host "⚠️ تم إصلاح بعض المشاكل، لكن تبقت مشاكل أخرى" -ForegroundColor Yellow
}

# Step 3: Check remaining issues
Write-Host ""
Write-Host "📊 فحص المشاكل المتبقية..." -ForegroundColor Blue
$eslintOutput = npx eslint "src/**/*.{tsx,ts,jsx,js}" --format json 2>$null

if ($eslintOutput) {
    $results = $eslintOutput | ConvertFrom-Json
    $totalErrors = ($results | ForEach-Object { $_.errorCount } | Measure-Object -Sum).Sum
    $totalWarnings = ($results | ForEach-Object { $_.warningCount } | Measure-Object -Sum).Sum
    $filesWithIssues = ($results | Where-Object { $_.errorCount -gt 0 -or $_.warningCount -gt 0 }).Count

    Write-Host ""
    Write-Host "📈 تقرير ESLint النهائي:" -ForegroundColor Cyan
    Write-Host "   📄 ملفات بها مشاكل: $filesWithIssues" -ForegroundColor White
    Write-Host "   ❌ إجمالي الأخطاء: $totalErrors" -ForegroundColor Red
    Write-Host "   ⚠️ إجمالي التحذيرات: $totalWarnings" -ForegroundColor Yellow

    if ($totalErrors -eq 0 -and $totalWarnings -eq 0) {
        Write-Host ""
        Write-Host "🎉 تم حل جميع مشاكل ESLint!" -ForegroundColor Green
    } else {
        Write-Host ""
        Write-Host "📋 المشاكل المتبقية تحتاج مراجعة يدوية:" -ForegroundColor Yellow
        
        $results | Where-Object { $_.errorCount -gt 0 -or $_.warningCount -gt 0 } | ForEach-Object {
            $filePath = $_.filePath -replace [regex]::Escape((Get-Location).Path), "."
            Write-Host ""
            Write-Host "📄 $filePath" -ForegroundColor Cyan
            
            $_.messages | ForEach-Object {
                $icon = if ($_.severity -eq 2) { "❌" } else { "⚠️" }
                Write-Host "   $icon السطر $($_.line): $($_.message)" -ForegroundColor White
            }
        }
    }
}

# Step 4: Build test
Write-Host ""
Write-Host "🏗️ اختبار بناء المشروع..." -ForegroundColor Blue
try {
    $env:CI = "true"
    npm run build 2>$null
    Write-Host "✅ تم بناء المشروع بنجاح!" -ForegroundColor Green
} catch {
    Write-Host "❌ فشل في بناء المشروع. راجع الأخطاء أعلاه." -ForegroundColor Red
}

# Step 5: Generate final report
Write-Host ""
Write-Host "📄 إنشاء تقرير نهائي..." -ForegroundColor Blue

$reportContent = @"
# تقرير تنظيف الكود - $(Get-Date -Format "yyyy-MM-dd HH:mm:ss")

## النتائج:
- إجمالي الأخطاء: $totalErrors
- إجمالي التحذيرات: $totalWarnings  
- ملفات بها مشاكل: $filesWithIssues

## الحالة:
$(if ($totalErrors -eq 0 -and $totalWarnings -eq 0) { "✅ جميع المشاكل تم حلها" } else { "⚠️ تبقت مشاكل تحتاج مراجعة يدوية" })

## الخطوات التالية:
1. مراجعة المشاكل المتبقية يدوياً
2. اختبار التطبيق للتأكد من عمله
3. تشغيل الاختبارات إذا كانت متوفرة

---
تم إنشاؤه بواسطة سكريپت تنظيف ESLint
"@

$reportContent | Out-File -FilePath "../docs/cleanup-report.md" -Encoding UTF8

Write-Host ""
Write-Host "🎯 انتهت عملية التنظيف!" -ForegroundColor Green
Write-Host "📋 تم حفظ التقرير في docs/cleanup-report.md" -ForegroundColor Cyan
Write-Host "🔍 راجع التغييرات واختبر التطبيق." -ForegroundColor White

# Return to parent directory
Set-Location ".."