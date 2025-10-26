# ⚡ Deploy After Build - Automated Deployment Script
# Run this after build completes successfully

Write-Host "`n╔═══════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║     🚀 FIREBASE DEPLOYMENT - AUTOMATED SCRIPT       ║" -ForegroundColor Cyan
Write-Host "╚═══════════════════════════════════════════════════════╝`n" -ForegroundColor Cyan

# Set location
Set-Location "C:\Users\hamda\Desktop\New Globul Cars"

Write-Host "📍 Current directory:" (Get-Location) -ForegroundColor Green
Write-Host ""

# Check if build exists
if (Test-Path "bulgarian-car-marketplace\build") {
    Write-Host "✅ Build folder found!" -ForegroundColor Green
} else {
    Write-Host "❌ Build folder not found. Run build first!" -ForegroundColor Red
    Write-Host "`n💡 Run this command first:" -ForegroundColor Yellow
    Write-Host "   cd bulgarian-car-marketplace" -ForegroundColor White
    Write-Host "   `$env:NODE_OPTIONS=`"--max_old_space_size=8192`"; `$env:GENERATE_SOURCEMAP=`"false`"; npm run build`n" -ForegroundColor White
    exit 1
}

Write-Host "`n🔍 Checking Firebase CLI..." -ForegroundColor Cyan

# Check Firebase CLI
try {
    $firebaseVersion = firebase --version 2>$null
    Write-Host "✅ Firebase CLI version: $firebaseVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Firebase CLI not found!" -ForegroundColor Red
    Write-Host "`n💡 Install Firebase CLI:" -ForegroundColor Yellow
    Write-Host "   npm install -g firebase-tools`n" -ForegroundColor White
    exit 1
}

Write-Host "`n🔐 Checking Firebase login..." -ForegroundColor Cyan

# Check if logged in
$loginStatus = firebase login:list 2>$null
if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Already logged in to Firebase!" -ForegroundColor Green
} else {
    Write-Host "⚠️  Not logged in. Running login..." -ForegroundColor Yellow
    firebase login
}

Write-Host "`n📋 Build Information:" -ForegroundColor Cyan
$buildSize = (Get-ChildItem -Path "bulgarian-car-marketplace\build" -Recurse | Measure-Object -Property Length -Sum).Sum / 1MB
Write-Host "   Build size: $([math]::Round($buildSize, 2)) MB" -ForegroundColor White

Write-Host "`n🎯 Deployment Target:" -ForegroundColor Cyan
Write-Host "   Project: fire-new-globul" -ForegroundColor White
Write-Host "   Domain: mobilebg.eu" -ForegroundColor White

Write-Host "`n🚀 Starting Firebase deployment..." -ForegroundColor Cyan
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`n" -ForegroundColor Cyan

# Deploy to Firebase
firebase deploy --only hosting

if ($LASTEXITCODE -eq 0) {
    Write-Host "`n╔═══════════════════════════════════════════════════════╗" -ForegroundColor Green
    Write-Host "║          ✅ DEPLOYMENT SUCCESSFUL! 🎉                ║" -ForegroundColor Green
    Write-Host "╚═══════════════════════════════════════════════════════╝`n" -ForegroundColor Green
    
    Write-Host "🌍 Your app is now live at:" -ForegroundColor Cyan
    Write-Host "   https://mobilebg.eu" -ForegroundColor White
    Write-Host "   https://mobilebg.eu/profile" -ForegroundColor White
    Write-Host "   https://mobilebg.eu/cars`n" -ForegroundColor White
    
    Write-Host "📱 Mobile Optimizations:" -ForegroundColor Cyan
    Write-Host "   ✅ ProfilePage (3 phases)" -ForegroundColor Green
    Write-Host "   ✅ HomePage (2 phases)" -ForegroundColor Green
    Write-Host "   ✅ CarsPage (1 phase)" -ForegroundColor Green
    Write-Host "   ✅ 845 lines optimized code`n" -ForegroundColor Green
    
    Write-Host "🎯 What's New:" -ForegroundColor Cyan
    Write-Host "   ✓ World-class mobile UX" -ForegroundColor White
    Write-Host "   ✓ Instagram/Facebook patterns" -ForegroundColor White
    Write-Host "   ✓ 48px touch targets" -ForegroundColor White
    Write-Host "   ✓ Professional organization`n" -ForegroundColor White
    
    Write-Host "🧪 Test on mobile:" -ForegroundColor Cyan
    Write-Host "   Ctrl+Shift+M in Chrome" -ForegroundColor White
    Write-Host "   Select: iPhone 12 Pro (390px)`n" -ForegroundColor White
    
} else {
    Write-Host "`n╔═══════════════════════════════════════════════════════╗" -ForegroundColor Red
    Write-Host "║          ❌ DEPLOYMENT FAILED                        ║" -ForegroundColor Red
    Write-Host "╚═══════════════════════════════════════════════════════╝`n" -ForegroundColor Red
    
    Write-Host "💡 Troubleshooting:" -ForegroundColor Yellow
    Write-Host "   1. Check firebase.json configuration" -ForegroundColor White
    Write-Host "   2. Verify build folder exists" -ForegroundColor White
    Write-Host "   3. Check Firebase login status" -ForegroundColor White
    Write-Host "   4. Review error messages above`n" -ForegroundColor White
}

Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`n" -ForegroundColor Cyan

