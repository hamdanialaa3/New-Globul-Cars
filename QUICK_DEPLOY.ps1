# Quick Deploy Script - نشر سريع مع إزالة Cache
Write-Host "🚀 Quick Deploy with Cache Busting" -ForegroundColor Cyan
Write-Host ""

$projectDir = "C:\Users\hamda\Desktop\New Globul Cars\bulgarian-car-marketplace"
Set-Location $projectDir

# Clean and build
Write-Host "📦 Building..." -ForegroundColor Yellow
if (Test-Path "build") { Remove-Item -Recurse -Force "build" }
npm run build

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Build failed!" -ForegroundColor Red
    exit 1
}

# Deploy with force
Write-Host "🚀 Deploying..." -ForegroundColor Yellow
firebase deploy --only hosting --force

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "✅ Deployed successfully!" -ForegroundColor Green
    Write-Host "🌐 https://mobilebg.eu/" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "💡 Clear browser cache: Ctrl+Shift+Delete" -ForegroundColor Yellow
} else {
    Write-Host "❌ Deployment failed!" -ForegroundColor Red
}

