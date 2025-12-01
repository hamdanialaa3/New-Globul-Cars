# Migrate Remaining Features from bulgarian-car-marketplace to appropriate packages
# نقل الميزات المتبقية من bulgarian-car-marketplace إلى packages المناسبة

$ErrorActionPreference = "Stop"
$sourceDir = "bulgarian-car-marketplace/src/features"

Write-Host "Starting Features Migration..." -ForegroundColor Green
Write-Host "Source: $sourceDir" -ForegroundColor Cyan
Write-Host ""

# Mapping of features to target packages
$featureMappings = @{
    "analytics" = "packages/core/src/features/analytics"
    "billing" = "packages/payments/src/features/billing"
    "reviews" = "packages/core/src/features/reviews"
    "team" = "packages/core/src/features/team"
    "verification" = "packages/core/src/features/verification"
}

# Get all feature files
$featureFiles = Get-ChildItem -Path $sourceDir -Recurse -File -Include *.tsx,*.ts | Where-Object {
    $_.FullName -notmatch 'node_modules|\.test\.|\.spec\.|__tests__|__mocks__'
}

$totalFiles = $featureFiles.Count
$copiedCount = 0
$skippedCount = 0
$errorCount = 0

Write-Host "Found $totalFiles feature files to migrate" -ForegroundColor Yellow
Write-Host ""

foreach ($file in $featureFiles) {
    try {
        # Get relative path from source directory
        $relativePath = $file.FullName.Replace((Resolve-Path $sourceDir).Path + "\", "")
        
        # Determine target package based on feature name
        $targetPackage = $null
        foreach ($featureName in $featureMappings.Keys) {
            if ($relativePath -like "*$featureName*") {
                $targetPackage = $featureMappings[$featureName]
                break
            }
        }
        
        # Default to core if no match
        if (-not $targetPackage) {
            $targetPackage = "packages/core/src/features"
        }
        
        # Get feature name from path (e.g., analytics/AnalyticsDashboard.tsx -> AnalyticsDashboard.tsx)
        $featureFileName = Split-Path $relativePath -Leaf
        $targetPath = Join-Path $targetPackage $relativePath
        $targetFolder = Split-Path $targetPath -Parent
        
        # Skip if already exists
        if (Test-Path $targetPath) {
            $skippedCount++
            Write-Host "Skipped (exists): $relativePath -> $targetPackage" -ForegroundColor Gray
            continue
        }
        
        # Create target directory
        if (-not (Test-Path $targetFolder)) {
            New-Item -ItemType Directory -Path $targetFolder -Force | Out-Null
        }
        
        # Copy file
        Copy-Item -Path $file.FullName -Destination $targetPath -Force
        $copiedCount++
        
        Write-Host "Copied: $relativePath -> $targetPackage" -ForegroundColor Green
    }
    catch {
        $errorCount++
        Write-Host "Error copying $($file.Name): $_" -ForegroundColor Red
    }
}

Write-Host ""
Write-Host "Migration Summary:" -ForegroundColor Cyan
Write-Host "  Copied: $copiedCount" -ForegroundColor Green
Write-Host "  Skipped: $skippedCount" -ForegroundColor Yellow
Write-Host "  Errors: $errorCount" -ForegroundColor Red
Write-Host ""
Write-Host "Features migration completed!" -ForegroundColor Green

