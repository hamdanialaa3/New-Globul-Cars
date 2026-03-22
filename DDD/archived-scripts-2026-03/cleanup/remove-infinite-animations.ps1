# Remove Infinite Animations Script
# ⚡ Automatically removes all "infinite" from animation declarations

$basePath = "C:\Users\hamda\Desktop\New Globul Cars\bulgarian-car-marketplace\src\components\Profile"
$files = @(
    "ProfileStats.tsx",
    "ProfileImageUploader.tsx",
    "ProfileGallery.tsx",
    "IDReferenceHelper.tsx",
    "GarageSection_Pro.tsx",
    "CoverImageUploader.tsx",
    "BusinessBackground.tsx",
    "business-upgrade\styles.ts",
    "Analytics\ProfileAnalyticsDashboard.tsx"
)

Write-Host "⚡ Removing infinite animations from Profile components..." -ForegroundColor Cyan
Write-Host ""

foreach ($file in $files) {
    $fullPath = Join-Path $basePath $file
    
    if (Test-Path $fullPath) {
        $content = Get-Content $fullPath -Raw
        
        # Replace "infinite" with comment
        $newContent = $content -replace 'animation:([^;]+)infinite', 'animation:$1 /* ⚡ OPTIMIZED: Removed infinite */'
        
        Set-Content -Path $fullPath -Value $newContent -NoNewline
        
        Write-Host "✅ $file" -ForegroundColor Green
    } else {
        Write-Host "⚠️  $file (not found)" -ForegroundColor Yellow
    }
}

Write-Host ""
Write-Host "🎉 All infinite animations removed!" -ForegroundColor Green

