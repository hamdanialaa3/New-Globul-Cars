# Migration Script - نقل Components الحرجة
$projectRoot = Get-Location
$sourceRoot = Join-Path $projectRoot "bulgarian-car-marketplace\src\components"
$destRoot = Join-Path $projectRoot "packages\ui\src\components"

# Critical Components - الأولوية القصوى
$criticalComponents = @(
    @{File="Header"; Dest="Header"},
    @{File="Footer"; Dest="Footer"},
    @{File="ErrorBoundary.tsx"; Dest="ErrorBoundary.tsx"},
    @{File="ErrorBoundary"; Dest="ErrorBoundary"},
    @{File="ProtectedRoute.tsx"; Dest="ProtectedRoute.tsx"},
    @{File="AuthGuard.tsx"; Dest="AuthGuard.tsx"},
    @{File="NotFoundPage.tsx"; Dest="NotFoundPage.tsx"},
    @{File="Toast"; Dest="Toast"},
    @{File="layout"; Dest="layout"},
    @{File="Accessibility.tsx"; Dest="Accessibility.tsx"},
    @{File="ProgressBar.tsx"; Dest="ProgressBar.tsx"},
    @{File="FloatingAddButton.tsx"; Dest="FloatingAddButton.tsx"},
    @{File="NotificationHandler.tsx"; Dest="NotificationHandler.tsx"}
)

Write-Host "Migrating Critical Components..." -ForegroundColor Cyan
$migrated = 0

foreach ($component in $criticalComponents) {
    $sourcePath = Join-Path $sourceRoot $component.File
    $destPath = Join-Path $destRoot $component.Dest
    
    if (Test-Path $sourcePath) {
        if (Test-Path $sourcePath -PathType Container) {
            # Directory
            Copy-Item -Path $sourcePath -Destination $destPath -Recurse -Force
            Write-Host "OK: $($component.File)/ (directory)" -ForegroundColor Green
        } else {
            # File
            $destDir = Split-Path $destPath -Parent
            if (-not (Test-Path $destDir)) {
                New-Item -ItemType Directory -Path $destDir -Force | Out-Null
            }
            Copy-Item -Path $sourcePath -Destination $destPath -Force
            Write-Host "OK: $($component.File)" -ForegroundColor Green
        }
        $migrated++
    } else {
        Write-Host "Not found: $($component.File)" -ForegroundColor Yellow
    }
}

Write-Host ""
Write-Host "Migrated $migrated critical components" -ForegroundColor Green

