# Migrate Remaining Pages from bulgarian-car-marketplace to appropriate packages
# نقل الصفحات المتبقية من bulgarian-car-marketplace إلى packages المناسبة

$ErrorActionPreference = "Stop"
$sourceDir = "bulgarian-car-marketplace/src/pages"

Write-Host "Starting Pages Migration..." -ForegroundColor Green
Write-Host "Source: $sourceDir" -ForegroundColor Cyan
Write-Host ""

# Mapping of page categories to target packages
$pageMappings = @{
    "02_authentication" = "packages/auth/src/pages"
    "01_main-pages/CarsPage.tsx" = "packages/cars/src/pages"
    "01_main-pages/CarDetailsPage.tsx" = "packages/cars/src/pages"
    "05_search-browse" = "packages/cars/src/pages"
    "03_user-pages/profile" = "packages/profile/src/pages"
    "06_admin" = "packages/admin/src/pages"
    "03_user-pages/social" = "packages/social/src/pages"
    "03_user-pages/messages" = "packages/messaging/src/pages"
    "08_payment-billing" = "packages/payments/src/pages"
    "03_user-pages/IoTDashboardPage.tsx" = "packages/iot/src/pages"
    "01_main-pages" = "packages/app/src/pages"
    "03_user-pages" = "packages/app/src/pages"
    "04_car-selling" = "packages/app/src/pages"
    "07_advanced-features" = "packages/app/src/pages"
    "09_dealer-company" = "packages/app/src/pages"
    "10_legal" = "packages/app/src/pages"
    "11_testing-dev" = "packages/app/src/pages"
}

# Get all page files
$pageFiles = Get-ChildItem -Path $sourceDir -Recurse -File -Include *.tsx,*.ts | Where-Object {
    $_.FullName -notmatch 'node_modules|\.test\.|\.spec\.|__tests__|__mocks__'
}

$totalFiles = $pageFiles.Count
$copiedCount = 0
$skippedCount = 0
$errorCount = 0

Write-Host "Found $totalFiles page files to migrate" -ForegroundColor Yellow
Write-Host ""

foreach ($file in $pageFiles) {
    try {
        # Get relative path from source directory
        $relativePath = $file.FullName.Replace((Resolve-Path $sourceDir).Path + "\", "")
        
        # Determine target package based on path
        $targetPackage = $null
        foreach ($pattern in $pageMappings.Keys) {
            if ($relativePath -like "*$pattern*") {
                $targetPackage = $pageMappings[$pattern]
                break
            }
        }
        
        # Default to app package if no match
        if (-not $targetPackage) {
            $targetPackage = "packages/app/src/pages"
        }
        
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
        
        if ($copiedCount % 10 -eq 0) {
            Write-Host "Copied $copiedCount/$totalFiles files..." -ForegroundColor Green
        }
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
Write-Host "Pages migration completed!" -ForegroundColor Green

