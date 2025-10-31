# ⚡ تنظيف localhost للـ OAuth - Nuclear Cleanup
# Use this ONLY if you must test on localhost
# Otherwise, just use Production: https://mobilebg.eu

Write-Host "`n╔═══════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║     🧹 NUCLEAR LOCALHOST CLEANUP FOR OAUTH          ║" -ForegroundColor Cyan
Write-Host "╚═══════════════════════════════════════════════════════╝`n" -ForegroundColor Cyan

Write-Host "⚠️  WARNING: This will take 5-10 minutes!`n" -ForegroundColor Yellow
Write-Host "💡 TIP: Use Production instead (https://mobilebg.eu) - 1 minute!`n" -ForegroundColor Green

$answer = Read-Host "Continue with cleanup? (y/N)"
if ($answer -ne 'y' -and $answer -ne 'Y') {
    Write-Host "`n✅ Smart choice! Use Production instead:`n" -ForegroundColor Green
    Write-Host "   https://mobilebg.eu/login`n" -ForegroundColor White
    exit 0
}

Write-Host "`n🔄 Starting nuclear cleanup...`n" -ForegroundColor Cyan

# 1. Kill all node processes
Write-Host "1️⃣  Killing all node processes..." -ForegroundColor Yellow
taskkill /F /IM node.exe 2>$null
if ($LASTEXITCODE -eq 0) {
    Write-Host "   ✅ Node processes killed" -ForegroundColor Green
} else {
    Write-Host "   ℹ️  No node processes running" -ForegroundColor Gray
}
Start-Sleep -Seconds 2

# 2. Navigate to project
Write-Host "`n2️⃣  Navigating to project..." -ForegroundColor Yellow
cd "C:\Users\hamda\Desktop\New Globul Cars\bulgarian-car-marketplace"
Write-Host "   ✅ In: bulgarian-car-marketplace" -ForegroundColor Green

# 3. Clean webpack cache
Write-Host "`n3️⃣  Cleaning webpack cache..." -ForegroundColor Yellow
if (Test-Path "node_modules\.cache") {
    Remove-Item -Recurse -Force "node_modules\.cache"
    Write-Host "   ✅ Webpack cache cleared" -ForegroundColor Green
} else {
    Write-Host "   ℹ️  No webpack cache found" -ForegroundColor Gray
}

# 4. Clean build folder
Write-Host "`n4️⃣  Cleaning build folder..." -ForegroundColor Yellow
if (Test-Path "build") {
    Remove-Item -Recurse -Force "build"
    Write-Host "   ✅ Build folder cleared" -ForegroundColor Green
} else {
    Write-Host "   ℹ️  No build folder found" -ForegroundColor Gray
}

# 5. Clean .cache
Write-Host "`n5️⃣  Cleaning .cache..." -ForegroundColor Yellow
if (Test-Path ".cache") {
    Remove-Item -Recurse -Force ".cache"
    Write-Host "   ✅ .cache folder cleared" -ForegroundColor Green
} else {
    Write-Host "   ℹ️  No .cache folder found" -ForegroundColor Gray
}

# 6. Clean npm cache
Write-Host "`n6️⃣  Cleaning npm cache..." -ForegroundColor Yellow
npm cache clean --force 2>$null
Write-Host "   ✅ npm cache cleared" -ForegroundColor Green

Write-Host "`n╔═══════════════════════════════════════════════════════╗" -ForegroundColor Green
Write-Host "║     ✅ CLEANUP COMPLETE!                             ║" -ForegroundColor Green
Write-Host "╚═══════════════════════════════════════════════════════╝`n" -ForegroundColor Green

Write-Host "📋 NEXT STEPS:`n" -ForegroundColor Cyan

Write-Host "1️⃣  Clear browser data:" -ForegroundColor Yellow
Write-Host "   - Chrome: Ctrl+Shift+Delete" -ForegroundColor White
Write-Host "   - Select: 'All time'" -ForegroundColor White
Write-Host "   - Check: Cached images, Cookies, Site data" -ForegroundColor White
Write-Host "   - Click: Clear data`n" -ForegroundColor White

Write-Host "2️⃣  Close ALL browser windows`n" -ForegroundColor Yellow

Write-Host "3️⃣  Start fresh server:" -ForegroundColor Yellow
Write-Host "   `$env:NODE_OPTIONS=`"--max_old_space_size=8192`"" -ForegroundColor White
Write-Host "   `$env:GENERATE_SOURCEMAP=`"false`"" -ForegroundColor White
Write-Host "   npm start`n" -ForegroundColor White

Write-Host "4️⃣  Wait for 'Compiled successfully!'`n" -ForegroundColor Yellow

Write-Host "5️⃣  Open in INCOGNITO:" -ForegroundColor Yellow
Write-Host "   Chrome: Ctrl+Shift+N" -ForegroundColor White
Write-Host "   Go to: http://localhost:3000/login`n" -ForegroundColor White

Write-Host "6️⃣  Test Google Sign-In`n" -ForegroundColor Yellow

Write-Host "⏱️  Total time: 5-10 minutes`n" -ForegroundColor Gray

Write-Host "💡 OR just use Production (1 minute!):" -ForegroundColor Green
Write-Host "   https://mobilebg.eu/login`n" -ForegroundColor White

Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`n" -ForegroundColor Cyan

$startServer = Read-Host "Start server now? (y/N)"
if ($startServer -eq 'y' -or $startServer -eq 'Y') {
    Write-Host "`n🚀 Starting server with 8GB memory...`n" -ForegroundColor Cyan
    $env:NODE_OPTIONS="--max_old_space_size=8192"
    $env:GENERATE_SOURCEMAP="false"
    npm start
} else {
    Write-Host "`n✅ Ready! Start server manually when ready.`n" -ForegroundColor Green
}

