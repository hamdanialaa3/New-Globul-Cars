# Migration Script - نقل Features
$projectRoot = Get-Location
$sourceRoot = Join-Path $projectRoot "bulgarian-car-marketplace\src\features"
$destRoot = Join-Path $projectRoot "packages"

# Feature mapping to packages
$featureMapping = @{
    "analytics" = "core"
    "billing" = "payments"
    "reviews" = "core"
    "team" = "core"
    "verification" = "core"
}

Write-Host "Migrating Features..." -ForegroundColor Cyan

if (-not (Test-Path $sourceRoot)) {
    Write-Host "Features directory not found" -ForegroundColor Yellow
    exit 0
}

$allFeatures = Get-ChildItem -Path $sourceRoot -Recurse -File

$migrated = 0
foreach ($feature in $allFeatures) {
    $relativePath = $feature.FullName.Substring($sourceRoot.Length + 1)
    $featureDir = ($relativePath -split "\\")[0]
    
    # Determine target package
    $targetPackage = $featureMapping[$featureDir]
    if (-not $targetPackage) {
        $targetPackage = "core" # default
    }
    
    $destRootPackage = Join-Path $destRoot $targetPackage
    $destPath = Join-Path $destRootPackage "src\features\$relativePath"
    
    # Create destination directory
    $destDir = Split-Path $destPath -Parent
    if (-not (Test-Path $destDir)) {
        New-Item -ItemType Directory -Path $destDir -Force | Out-Null
    }
    
    # Copy file
    Copy-Item -Path $feature.FullName -Destination $destPath -Force
    Write-Host "OK: $relativePath -> @globul-cars/$targetPackage" -ForegroundColor Green
    $migrated++
}

Write-Host ""
Write-Host "Migrated $migrated features" -ForegroundColor Green

