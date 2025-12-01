# Migration Script - نقل جميع Services
$projectRoot = Get-Location
$sourceRoot = Join-Path $projectRoot "bulgarian-car-marketplace\src\services"
$destRoot = Join-Path $projectRoot "packages\services\src"

# Get all .ts files from services directory (excluding __tests__)
$allServices = Get-ChildItem -Path $sourceRoot -Recurse -Filter "*.ts" | Where-Object {
    $_.FullName -notmatch "__tests__" -and
    $_.FullName -notmatch "\.test\.ts$" -and
    $_.FullName -notmatch "\.spec\.ts$"
}

Write-Host "Migrating All Services..." -ForegroundColor Cyan
Write-Host "Found $($allServices.Count) service files" -ForegroundColor Yellow
Write-Host ""

$migrated = 0
$skipped = 0

foreach ($service in $allServices) {
    # Calculate relative path
    $relativePath = $service.FullName.Substring($sourceRoot.Length + 1)
    $destPath = Join-Path $destRoot $relativePath
    
    # Skip if already exists in packages
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
    Copy-Item -Path $service.FullName -Destination $destPath -Force
    Write-Host "OK: $relativePath" -ForegroundColor Green
    $migrated++
}

Write-Host ""
Write-Host "Migrated: $migrated services" -ForegroundColor Green
Write-Host "Skipped (already exists): $skipped services" -ForegroundColor Yellow
Write-Host "Note: Import updates required manually" -ForegroundColor Yellow

