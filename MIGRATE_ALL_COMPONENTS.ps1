# Migration Script - نقل جميع Components
$projectRoot = Get-Location
$sourceRoot = Join-Path $projectRoot "bulgarian-car-marketplace\src\components"
$destRoot = Join-Path $projectRoot "packages\ui\src\components"

# Get all files from components directory (excluding __tests__, __mocks__)
$allComponents = Get-ChildItem -Path $sourceRoot -Recurse -File | Where-Object {
    $_.FullName -notmatch "__tests__" -and
    $_.FullName -notmatch "__mocks__" -and
    $_.FullName -notmatch "\.test\." -and
    $_.FullName -notmatch "\.spec\."
}

Write-Host "Migrating All Components..." -ForegroundColor Cyan
Write-Host "Found $($allComponents.Count) component files" -ForegroundColor Yellow
Write-Host ""

$migrated = 0
$skipped = 0

foreach ($component in $allComponents) {
    # Calculate relative path
    $relativePath = $component.FullName.Substring($sourceRoot.Length + 1)
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
    Copy-Item -Path $component.FullName -Destination $destPath -Force
    Write-Host "OK: $relativePath" -ForegroundColor Green
    $migrated++
    
    # Limit output
    if ($migrated % 50 -eq 0) {
        Write-Host "... $migrated components migrated so far ..." -ForegroundColor Yellow
    }
}

Write-Host ""
Write-Host "Migrated: $migrated components" -ForegroundColor Green
Write-Host "Skipped (already exists): $skipped components" -ForegroundColor Yellow
Write-Host "Note: Import updates required manually" -ForegroundColor Yellow

