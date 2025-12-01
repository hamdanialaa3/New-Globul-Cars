# Clear Cache Script for Bulgarian Car Marketplace
# تنظيف الكاش لـ webpack و node_modules

Write-Host "🧹 Starting cache cleanup..." -ForegroundColor Cyan

$projectPath = "bulgarian-car-marketplace"
$cachePath = Join-Path $projectPath "node_modules\.cache"
$buildPath = Join-Path $projectPath "build"

# Clear webpack cache
if (Test-Path $cachePath) {
    Write-Host "🗑️  Removing webpack cache..." -ForegroundColor Yellow
    Remove-Item -Path $cachePath -Recurse -Force -ErrorAction SilentlyContinue
    Write-Host "✅ Webpack cache cleared" -ForegroundColor Green
} else {
    Write-Host "ℹ️  No webpack cache found" -ForegroundColor Gray
}

# Clear build directory (optional)
if (Test-Path $buildPath) {
    Write-Host "🗑️  Removing build directory..." -ForegroundColor Yellow
    Remove-Item -Path $buildPath -Recurse -Force -ErrorAction SilentlyContinue
    Write-Host "✅ Build directory cleared" -ForegroundColor Green
} else {
    Write-Host "ℹ️  No build directory found" -ForegroundColor Gray
}

# Clear npm cache (optional - uncomment if needed)
# Write-Host "🗑️  Clearing npm cache..." -ForegroundColor Yellow
# npm cache clean --force
# Write-Host "✅ npm cache cleared" -ForegroundColor Green

Write-Host ""
Write-Host "✅ Cache cleanup completed!" -ForegroundColor Green
Write-Host "🚀 You can now restart the dev server with: npm start" -ForegroundColor Cyan

