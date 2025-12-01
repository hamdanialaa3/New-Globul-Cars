# Deploy with Cache Busting Script
# نشر مع إزالة التخزين المؤقت

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Deploy with Cache Busting" -ForegroundColor Cyan
Write-Host "  نشر مع إزالة التخزين المؤقت" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

$projectDir = "C:\Users\hamda\Desktop\New Globul Cars\bulgarian-car-marketplace"
Set-Location $projectDir

# Step 1: Clean build directory
Write-Host "🧹 Step 1: Cleaning build directory..." -ForegroundColor Yellow
if (Test-Path "build") {
    Remove-Item -Recurse -Force "build"
    Write-Host "✅ Build directory cleaned" -ForegroundColor Green
}

# Step 2: Build with cache busting
Write-Host ""
Write-Host "📦 Step 2: Building project with cache busting..." -ForegroundColor Yellow
$env:GENERATE_SOURCEMAP = "false"
$env:INLINE_RUNTIME_CHUNK = "false"
npm run build

if ($LASTEXITCODE -ne 0) {
    Write-Host ""
    Write-Host "❌ Build failed! Please check the errors above." -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "✅ Build completed successfully!" -ForegroundColor Green

# Step 3: Add version to index.html
Write-Host ""
Write-Host "🔧 Step 3: Adding version to index.html..." -ForegroundColor Yellow
$indexPath = "build\index.html"
if (Test-Path $indexPath) {
    $content = Get-Content $indexPath -Raw
    $timestamp = [DateTimeOffset]::UtcNow.ToUnixTimeSeconds()
    $versionedContent = $content -replace '(<script[^>]*src=")([^"]*\.js)(")', "`$1`$2?v=$timestamp`$3"
    $versionedContent = $versionedContent -replace '(<link[^>]*href=")([^"]*\.css)(")', "`$1`$2?v=$timestamp`$3"
    Set-Content $indexPath $versionedContent
    Write-Host "✅ Version added to assets" -ForegroundColor Green
}

# Step 4: Deploy to Firebase
Write-Host ""
Write-Host "🚀 Step 4: Deploying to Firebase..." -ForegroundColor Yellow
firebase deploy --only hosting --force

if ($LASTEXITCODE -ne 0) {
    Write-Host ""
    Write-Host "❌ Deployment failed! Please check the errors above." -ForegroundColor Red
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
Write-Host "💡 Important: Clear your browser cache (Ctrl+Shift+Delete)" -ForegroundColor Yellow
Write-Host "مهم: امسح cache المتصفح (Ctrl+Shift+Delete)" -ForegroundColor Yellow
Write-Host ""

