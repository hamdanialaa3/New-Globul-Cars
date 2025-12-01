# Migration Script - نقل Services الحرجة
$projectRoot = Get-Location
$sourceRoot = Join-Path $projectRoot "bulgarian-car-marketplace\src\services"
$destRoot = Join-Path $projectRoot "packages\services\src"

# Critical Services - الأولوية القصوى
$criticalServices = @(
    @{File="carListingService.ts"; Dest="car\carListingService.ts"},
    @{File="favoritesService.ts"; Dest="car\favoritesService.ts"},
    @{File="notification-service.ts"; Dest="notifications\notification-service.ts"},
    @{File="messaging\realtimeMessaging.ts"; Dest="messaging\realtimeMessaging.ts"},
    @{File="email-service.ts"; Dest="email\email-service.ts"},
    @{File="image-upload-service.ts"; Dest="image\image-upload-service.ts"}
)

Write-Host "Migrating Critical Services..." -ForegroundColor Cyan
$migrated = 0

foreach ($service in $criticalServices) {
    $sourcePath = Join-Path $sourceRoot $service.File
    $destPath = Join-Path $destRoot $service.Dest
    
    if (Test-Path $sourcePath) {
        $destDir = Split-Path $destPath -Parent
        if (-not (Test-Path $destDir)) {
            New-Item -ItemType Directory -Path $destDir -Force | Out-Null
        }
        Copy-Item -Path $sourcePath -Destination $destPath -Force
        Write-Host "OK: $($service.File)" -ForegroundColor Green
        $migrated++
    } else {
        Write-Host "Not found: $($service.File)" -ForegroundColor Yellow
    }
}

Write-Host ""
Write-Host "Migrated $migrated critical services" -ForegroundColor Green

