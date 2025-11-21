# Migration Script - نقل Types
$projectRoot = Get-Location
$sourceRoot = Join-Path $projectRoot "bulgarian-car-marketplace\src\types"
$destRoot = Join-Path $projectRoot "packages\core\src\types"

$typesToMigrate = @(
    "AdvancedProfile.ts",
    "ai-quota.types.ts",
    "ai.types.ts",
    "browser-image-compression.d.ts",
    "CarData.ts",
    "CarListing.ts",
    "firestore-models.ts",
    "LocationData.ts",
    "social-feed.types.ts",
    "social-media.types.ts",
    "styled.d.ts",
    "theme.ts"
)

$migrated = 0
foreach ($type in $typesToMigrate) {
    $sourcePath = Join-Path $sourceRoot $type
    $destPath = Join-Path $destRoot $type
    
    if (Test-Path $sourcePath) {
        Copy-Item -Path $sourcePath -Destination $destPath -Force
        Write-Host "OK: $type"
        $migrated++
    } else {
        Write-Host "Not found: $type"
    }
}

# Copy subdirectories
$subdirs = @("company", "dealership", "user")
foreach ($subdir in $subdirs) {
    $subdirSource = Join-Path $sourceRoot $subdir
    $subdirDest = Join-Path $destRoot $subdir
    if (Test-Path $subdirSource) {
        Copy-Item -Path $subdirSource -Destination $subdirDest -Recurse -Force
        Write-Host "OK: $subdir/ (directory)"
        $migrated++
    }
}

Write-Host ""
Write-Host "Migrated $migrated types"
Write-Host "Note: Import updates required manually"

