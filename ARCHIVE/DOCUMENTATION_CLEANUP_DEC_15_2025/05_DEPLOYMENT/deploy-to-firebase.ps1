# Deploy to Firebase Script
# This script builds and deploys the project to Firebase Hosting

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "🚀 Starting Firebase Deployment" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan

# Navigate to project root
$projectRoot = "C:\Users\hamda\Desktop\New Globul Cars"
Set-Location $projectRoot

Write-Host "`n📦 Step 1: Building the React application..." -ForegroundColor Yellow
Set-Location "bulgarian-car-marketplace"
npm run build

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Build failed!" -ForegroundColor Red
    exit 1
}

Write-Host "✅ Build completed successfully!" -ForegroundColor Green

# Navigate back to root
Set-Location $projectRoot

Write-Host "`n🔥 Step 2: Deploying to Firebase Hosting..." -ForegroundColor Yellow
firebase deploy --only hosting --project fire-new-globul

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Deployment failed!" -ForegroundColor Red
    exit 1
}

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "✅ Deployment completed successfully!" -ForegroundColor Green
Write-Host "🌐 Your site is live at:" -ForegroundColor Cyan
Write-Host "   - https://fire-new-globul.web.app" -ForegroundColor White
Write-Host "   - https://fire-new-globul.firebaseapp.com" -ForegroundColor White
Write-Host "   - https://mobilebg.eu" -ForegroundColor White
Write-Host "========================================" -ForegroundColor Cyan

