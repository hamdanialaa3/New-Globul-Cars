# ⚡ AGGRESSIVE LOCALHOST CACHE CLEAR
# تنظيف شامل وقوي للـ Cache على localhost

Write-Host "`n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host "⚡ AGGRESSIVE CACHE CLEAR - Starting..." -ForegroundColor Yellow
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`n" -ForegroundColor Cyan

# 1. Kill ALL Node processes
Write-Host "1️⃣ Killing ALL Node processes..." -ForegroundColor Green
taskkill /F /IM node.exe 2>$null
taskkill /F /IM npm.exe 2>$null
taskkill /F /IM npx.exe 2>$null
Start-Sleep -Seconds 2
Write-Host "   ✅ All Node processes killed`n" -ForegroundColor Green

# 2. Clear Node caches
Write-Host "2️⃣ Clearing Node caches..." -ForegroundColor Green
cd "C:\Users\hamda\Desktop\New Globul Cars\bulgarian-car-marketplace"

if (Test-Path "node_modules\.cache") {
    Remove-Item -Recurse -Force "node_modules\.cache"
    Write-Host "   ✅ Webpack cache cleared" -ForegroundColor Green
}

if (Test-Path "build") {
    Remove-Item -Recurse -Force "build"
    Write-Host "   ✅ Build folder cleared" -ForegroundColor Green
}

if (Test-Path ".cache") {
    Remove-Item -Recurse -Force ".cache"
    Write-Host "   ✅ .cache folder cleared" -ForegroundColor Green
}

npm cache clean --force 2>$null
Write-Host "   ✅ NPM cache cleared`n" -ForegroundColor Green

# 3. Clear browser caches (instructions)
Write-Host "3️⃣ BROWSER CACHE - Manual Steps:" -ForegroundColor Yellow
Write-Host "   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host "   Step 1: Close Chrome COMPLETELY" -ForegroundColor White
Write-Host "   Step 2: Open Chrome" -ForegroundColor White
Write-Host "   Step 3: Press Ctrl+Shift+Delete" -ForegroundColor White
Write-Host "   Step 4: Select:" -ForegroundColor White
Write-Host "           ✓ Cached images and files" -ForegroundColor Yellow
Write-Host "           ✓ Cookies and site data" -ForegroundColor Yellow
Write-Host "           ✓ Time range: All time" -ForegroundColor Yellow
Write-Host "   Step 5: Click 'Clear data'" -ForegroundColor White
Write-Host "   Step 6: Close Chrome again" -ForegroundColor White
Write-Host "   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`n" -ForegroundColor Cyan

# 4. Rebuild and start
Write-Host "4️⃣ Starting clean server..." -ForegroundColor Green
Write-Host "   This will take 2-3 minutes...`n" -ForegroundColor Yellow

$env:NODE_OPTIONS="--max_old_space_size=8192"
$env:GENERATE_SOURCEMAP="false"
$env:TSC_COMPILE_ON_ERROR="true"
$env:DISABLE_ESLINT_PLUGIN="true"

Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host "⏳ WAIT FOR: 'Compiled successfully!'" -ForegroundColor Yellow
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`n" -ForegroundColor Cyan

Write-Host "THEN:" -ForegroundColor Cyan
Write-Host "  1. Open NEW Incognito window (Ctrl+Shift+N)" -ForegroundColor White
Write-Host "  2. Go to: http://localhost:3000/create-post" -ForegroundColor White
Write-Host "  3. You should see:" -ForegroundColor White
Write-Host "     ✅ Type buttons (Text, Car, Tip...)" -ForegroundColor Green
Write-Host "     ✅ 'Add Location' button" -ForegroundColor Green
Write-Host "     ✅ Everything visible!`n" -ForegroundColor Green

npm start

