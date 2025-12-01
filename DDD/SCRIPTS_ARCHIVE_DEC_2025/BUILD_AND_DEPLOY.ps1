# Build and Deploy Script for Bulgarian Car Marketplace
# سكريبت بناء ونشر المشروع

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Build and Deploy to Firebase" -ForegroundColor Cyan
Write-Host "  بناء ونشر المشروع على Firebase" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Change to project directory
$projectDir = "C:\Users\hamda\Desktop\New Globul Cars\bulgarian-car-marketplace"
Set-Location $projectDir

Write-Host "📦 Step 1: Building project..." -ForegroundColor Yellow
Write-Host "جاري بناء المشروع..." -ForegroundColor Yellow
Write-Host ""

# Build the project
npm run build

if ($LASTEXITCODE -ne 0) {
    Write-Host ""
    Write-Host "❌ Build failed! Please check the errors above." -ForegroundColor Red
    Write-Host "فشل البناء! يرجى التحقق من الأخطاء أعلاه." -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "✅ Build completed successfully!" -ForegroundColor Green
Write-Host "تم البناء بنجاح!" -ForegroundColor Green
Write-Host ""

Write-Host "🚀 Step 2: Deploying to Firebase..." -ForegroundColor Yellow
Write-Host "جاري النشر على Firebase..." -ForegroundColor Yellow
Write-Host ""

# Deploy to Firebase
firebase deploy --only hosting

if ($LASTEXITCODE -ne 0) {
    Write-Host ""
    Write-Host "❌ Deployment failed! Please check the errors above." -ForegroundColor Red
    Write-Host "فشل النشر! يرجى التحقق من الأخطاء أعلاه." -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "  ✅ Deployment Complete!" -ForegroundColor Green
Write-Host "  تم النشر بنجاح!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "🌐 Your site is live at: https://mobilebg.eu/" -ForegroundColor Cyan
Write-Host "موقعك متاح على: https://mobilebg.eu/" -ForegroundColor Cyan
Write-Host ""

