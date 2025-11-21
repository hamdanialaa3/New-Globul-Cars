# Migration Script - نقل جميع Pages
$projectRoot = Get-Location
$sourceRoot = Join-Path $projectRoot "bulgarian-car-marketplace\src\pages"
$destRoot = Join-Path $projectRoot "packages"

# Page mapping to packages
$pageMapping = @{
    "02_authentication" = "auth"
    "01_main-pages\CarsPage.tsx" = "cars"
    "01_main-pages\CarDetailsPage.tsx" = "cars"
    "05_search-browse\advanced-search" = "cars"
    "03_user-pages\profile" = "profile"
    "03_user-pages\social" = "social"
    "03_user-pages\messages" = "messaging"
    "08_payment-billing" = "payments"
    "03_user-pages\IoTDashboardPage.tsx" = "iot"
    "06_admin" = "admin"
}

Write-Host "Migrating All Pages..." -ForegroundColor Cyan

# Get all page files
$allPages = Get-ChildItem -Path $sourceRoot -Recurse -File | Where-Object {
    $_.Extension -match "\.(tsx|ts)$" -and
    $_.FullName -notmatch "__tests__" -and
    $_.FullName -notmatch "\.test\." -and
    $_.FullName -notmatch "\.spec\."
}

Write-Host "Found $($allPages.Count) page files" -ForegroundColor Yellow
Write-Host ""

$migrated = 0
$skipped = 0

foreach ($page in $allPages) {
    # Calculate relative path
    $relativePath = $page.FullName.Substring($sourceRoot.Length + 1)
    
    # Determine target package
    $targetPackage = "app" # default
    foreach ($key in $pageMapping.Keys) {
        if ($relativePath -like "*$key*") {
            $targetPackage = $pageMapping[$key]
            break
        }
    }
    
    $destRootPackage = Join-Path $destRoot $targetPackage
    $destPath = Join-Path $destRootPackage "src\pages\$relativePath"
    
    # Skip if already exists
    if (Test-Path $destPath) {
        $skipped++
        continue
    }
    
    # Create destination directory
    $destDir = Split-Path $destPath -Parent
    if (-not (Test-Path $destDir)) {
        New-Item -ItemType Directory -Path $destDir -Force | Out-Null
    }
    
    # Copy file
    Copy-Item -Path $page.FullName -Destination $destPath -Force
    Write-Host "OK: $relativePath -> @globul-cars/$targetPackage" -ForegroundColor Green
    $migrated++
    
    # Limit output
    if ($migrated % 50 -eq 0) {
        Write-Host "... $migrated pages migrated so far ..." -ForegroundColor Yellow
    }
}

Write-Host ""
Write-Host "Migrated: $migrated pages" -ForegroundColor Green
Write-Host "Skipped (already exists): $skipped pages" -ForegroundColor Yellow
Write-Host "Note: Import updates required manually" -ForegroundColor Yellow

