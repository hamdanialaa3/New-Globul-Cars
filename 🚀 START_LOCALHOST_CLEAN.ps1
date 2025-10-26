# 🚀 تشغيل localhost نظيف تماماً
# Clean localhost startup script

Write-Host "`n╔═══════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║     🚀 CLEAN LOCALHOST STARTUP                      ║" -ForegroundColor Cyan
Write-Host "╚═══════════════════════════════════════════════════════╝`n" -ForegroundColor Cyan

# 1. Kill node
Write-Host "1. إيقاف Node processes..." -ForegroundColor Yellow
taskkill /F /IM node.exe 2>$null
Start-Sleep -Seconds 2
Write-Host "   ✅ Done`n" -ForegroundColor Green

# 2. Navigate
Write-Host "2. الذهاب للمجلد..." -ForegroundColor Yellow
cd "C:\Users\hamda\Desktop\New Globul Cars\bulgarian-car-marketplace"
Write-Host "   ✅ في: bulgarian-car-marketplace`n" -ForegroundColor Green

# 3. Clean caches
Write-Host "3. تنظيف Cache..." -ForegroundColor Yellow
if (Test-Path "node_modules\.cache") {
    Remove-Item -Recurse -Force "node_modules\.cache"
    Write-Host "   ✅ Webpack cache deleted" -ForegroundColor Green
}
if (Test-Path "build") {
    Remove-Item -Recurse -Force "build"
    Write-Host "   ✅ Build folder deleted" -ForegroundColor Green
}
Write-Host ""

# 4. Start server
Write-Host "4. تشغيل Server نظيف..." -ForegroundColor Yellow
Write-Host "   (Memory: 8GB, No sourcemaps)`n" -ForegroundColor Gray

$env:NODE_OPTIONS="--max_old_space_size=8192"
$env:GENERATE_SOURCEMAP="false"
$env:TSC_COMPILE_ON_ERROR="true"
$env:DISABLE_ESLINT_PLUGIN="true"

Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`n" -ForegroundColor Cyan
Write-Host "🚀 Starting clean server...`n" -ForegroundColor Green
Write-Host "⏳ انتظر 'Compiled successfully!' (2-3 دقائق)`n" -ForegroundColor Yellow
Write-Host "ثم:" -ForegroundColor Cyan
Write-Host "  1. اضغط Ctrl+Shift+N (Incognito mode)" -ForegroundColor White
Write-Host "  2. اذهب إلى: http://localhost:3000/login" -ForegroundColor White
Write-Host "  3. جرّب الأزرار`n" -ForegroundColor White
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`n" -ForegroundColor Cyan

npm start

