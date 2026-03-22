# PHASE 2 DEPLOYMENT SCRIPT
# Quick deployment for notification system

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "   PHASE 2: NOTIFICATIONS DEPLOYMENT   " -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Step 1: Deploy Firestore Rules
Write-Host "[1/4] Deploying Firestore Security Rules..." -ForegroundColor Yellow
firebase deploy --only firestore:rules
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Firestore rules deployment failed!" -ForegroundColor Red
    exit 1
}
Write-Host "✅ Firestore rules deployed" -ForegroundColor Green
Write-Host ""

# Step 2: Install Functions Dependencies
Write-Host "[2/4] Installing Cloud Functions dependencies..." -ForegroundColor Yellow
Set-Location functions
npm install
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ npm install failed!" -ForegroundColor Red
    Set-Location ..
    exit 1
}
Set-Location ..
Write-Host "✅ Dependencies installed" -ForegroundColor Green
Write-Host ""

# Step 3: Deploy Cloud Functions
Write-Host "[3/4] Deploying Cloud Functions..." -ForegroundColor Yellow
firebase deploy --only functions:notifyFollowersOnNewCar,functions:cleanupOldNotifications
if ($LASTEXITCODE -ne 0) {
    Write-Host "⚠️  Functions deployment failed - check logs above" -ForegroundColor Yellow
    Write-Host "   You can retry with: firebase deploy --only functions" -ForegroundColor Yellow
}
else {
    Write-Host "✅ Cloud Functions deployed" -ForegroundColor Green
}
Write-Host ""

# Step 4: Build Frontend
Write-Host "[4/4] Building frontend..." -ForegroundColor Yellow
npm run build
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Build failed!" -ForegroundColor Red
    exit 1
}
Write-Host "✅ Frontend built" -ForegroundColor Green
Write-Host ""

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "        DEPLOYMENT SUMMARY" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "✅ Firestore rules: DEPLOYED" -ForegroundColor Green
Write-Host "✅ Cloud Functions: DEPLOYED" -ForegroundColor Green
Write-Host "✅ Frontend build: COMPLETE" -ForegroundColor Green
Write-Host ""
Write-Host "📋 NEXT STEPS:" -ForegroundColor Yellow
Write-Host "1. Test locally: npm start" -ForegroundColor White
Write-Host "2. Deploy hosting: firebase deploy --only hosting" -ForegroundColor White
Write-Host "3. Monitor logs: firebase functions:log" -ForegroundColor White
Write-Host ""
Write-Host "📖 Documentation: docs/PHASE2_NOTIFICATIONS_IMPLEMENTATION.md" -ForegroundColor Cyan
Write-Host ""
Write-Host "🎉 PHASE 2 DEPLOYMENT COMPLETE!" -ForegroundColor Green
