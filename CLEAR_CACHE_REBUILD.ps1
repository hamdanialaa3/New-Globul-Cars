# ========================================
# Clear Cache and Rebuild Script
# للتخلص من مشاكل التخزين المؤقت
# ========================================

Write-Host "🧹 تنظيف الكاش وإعادة البناء..." -ForegroundColor Cyan
Write-Host ""

# 1. إيقاف خادم التطوير إن كان يعمل
Write-Host "⏹️  إيقاف خادم التطوير..." -ForegroundColor Yellow
Get-Process -Name "node" -ErrorAction SilentlyContinue | Where-Object { $_.Path -like "*bulgarian-car-marketplace*" } | Stop-Process -Force
Start-Sleep -Seconds 2

# 2. حذف مجلدات الكاش
Write-Host "🗑️  حذف مجلدات الكاش..." -ForegroundColor Yellow

$foldersToDelete = @(
    "bulgarian-car-marketplace\node_modules\.cache",
    "bulgarian-car-marketplace\.cache",
    "bulgarian-car-marketplace\build",
    "bulgarian-car-marketplace\.webpack-cache"
)

foreach ($folder in $foldersToDelete) {
    $fullPath = Join-Path $PSScriptRoot $folder
    if (Test-Path $fullPath) {
        Write-Host "  ❌ حذف: $folder" -ForegroundColor Red
        Remove-Item -Path $fullPath -Recurse -Force -ErrorAction SilentlyContinue
    } else {
        Write-Host "  ✓ غير موجود: $folder" -ForegroundColor Gray
    }
}

Write-Host ""

# 3. إعادة تثبيت المكتبات (اختياري - علق عليه إذا كان يستغرق وقتاً طويلاً)
# Write-Host "📦 إعادة تثبيت المكتبات..." -ForegroundColor Yellow
# Set-Location "bulgarian-car-marketplace"
# npm ci
# Set-Location ..

# 4. تعليمات للمستخدم
Write-Host ""
Write-Host "✅ تم تنظيف الكاش بنجاح!" -ForegroundColor Green
Write-Host ""
Write-Host "📋 خطوات إضافية يجب تنفيذها:" -ForegroundColor Cyan
Write-Host "  1️⃣  في المتصفح: اضغط Ctrl+Shift+Delete" -ForegroundColor White
Write-Host "     ثم احذف:" -ForegroundColor White
Write-Host "       - Cached images and files" -ForegroundColor Gray
Write-Host "       - Cookies and site data" -ForegroundColor Gray
Write-Host ""
Write-Host "  2️⃣  أو افتح في وضع Incognito:" -ForegroundColor White
Write-Host "     Ctrl+Shift+N (Chrome)" -ForegroundColor Gray
Write-Host "     Ctrl+Shift+P (Firefox)" -ForegroundColor Gray
Write-Host ""
Write-Host "  3️⃣  شغّل خادم التطوير:" -ForegroundColor White
Write-Host "     cd bulgarian-car-marketplace" -ForegroundColor Gray
Write-Host "     npm start" -ForegroundColor Gray
Write-Host ""
Write-Host "  4️⃣  في المتصفح عند التحميل:" -ForegroundColor White
Write-Host "     اضغط Ctrl+Shift+R (Hard Refresh)" -ForegroundColor Gray
Write-Host ""

# 5. فتح المجلد للتحقق
Write-Host "📂 فتح مجلد المشروع..." -ForegroundColor Yellow
Start-Sleep -Seconds 1
explorer "bulgarian-car-marketplace"

Write-Host ""
Write-Host "✨ جاهز! الآن نفذ الخطوات أعلاه" -ForegroundColor Green
Write-Host ""

# 6. سؤال المستخدم إذا كان يريد بدء خادم التطوير مباشرة
$response = Read-Host "هل تريد بدء خادم التطوير الآن؟ (y/n)"
if ($response -eq 'y' -or $response -eq 'Y') {
    Write-Host ""
    Write-Host "🚀 بدء خادم التطوير..." -ForegroundColor Cyan
    Set-Location "bulgarian-car-marketplace"
    npm start
}
