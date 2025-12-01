# Migration Script - نقل جميع الملفات المتبقية
# Run: powershell -ExecutionPolicy Bypass -File MIGRATE_ALL_FILES.ps1

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Migration Script - نقل جميع الملفات" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

$projectRoot = Get-Location
$sourceRoot = Join-Path $projectRoot "bulgarian-car-marketplace\src"
$packagesRoot = Join-Path $projectRoot "packages"

# Helper function to copy file and update imports
function Copy-FileWithImports {
    param(
        [string]$SourcePath,
        [string]$DestPath,
        [string]$PackageName
    )
    
    if (-not (Test-Path $SourcePath)) {
        Write-Host "  Warning: Source not found: $SourcePath" -ForegroundColor Yellow
        return $false
    }
    
    # Create destination directory if needed
    $destDir = Split-Path $DestPath -Parent
    if (-not (Test-Path $destDir)) {
        New-Item -ItemType Directory -Path $destDir -Force | Out-Null
    }
    
    # Copy file
    Copy-Item -Path $SourcePath -Destination $DestPath -Force
    
    # Read content
    $content = Get-Content $DestPath -Raw -Encoding UTF8
    
    # Update imports (basic patterns)
    $content = $content -replace "from ['\`"]@/", "from '@globul-cars/"
    $content = $content -replace "from ['\`"]\.\./\.\./\.\./services/", "from '@globul-cars/services/"
    $content = $content -replace "from ['\`"]\.\./\.\./services/", "from '@globul-cars/services/"
    $content = $content -replace "from ['\`"]\.\./services/", "from '@globul-cars/services/"
    $content = $content -replace "from ['\`"]\.\./\.\./\.\./hooks/", "from '@globul-cars/core/hooks"
    $content = $content -replace "from ['\`"]\.\./\.\./hooks/", "from '@globul-cars/core/hooks"
    $content = $content -replace "from ['\`"]\.\./hooks/", "from '@globul-cars/core/hooks"
    $content = $content -replace "from ['\`"]\.\./\.\./\.\./contexts/", "from '@globul-cars/core/contexts"
    $content = $content -replace "from ['\`"]\.\./\.\./contexts/", "from '@globul-cars/core/contexts"
    $content = $content -replace "from ['\`"]\.\./contexts/", "from '@globul-cars/core/contexts"
    $content = $content -replace "from ['\`"]\.\./\.\./\.\./utils/", "from '@globul-cars/core/utils"
    $content = $content -replace "from ['\`"]\.\./\.\./utils/", "from '@globul-cars/core/utils"
    $content = $content -replace "from ['\`"]\.\./utils/", "from '@globul-cars/core/utils"
    $content = $content -replace "from ['\`"]\.\./\.\./\.\./types/", "from '@globul-cars/core/types"
    $content = $content -replace "from ['\`"]\.\./\.\./types/", "from '@globul-cars/core/types"
    $content = $content -replace "from ['\`"]\.\./types/", "from '@globul-cars/core/types"
    
    # Write updated content
    Set-Content -Path $DestPath -Value $content -Encoding UTF8 -NoNewline
    
    return $true
}

# Phase 1: Migrate Hooks
Write-Host "Phase 1: Migrating Hooks..." -ForegroundColor Cyan
$hooksSource = Join-Path $sourceRoot "hooks"
$hooksDest = Join-Path $packagesRoot "core\src\hooks"

$hooksToMigrate = @(
    "useAIImageAnalysis.ts",
    "useAsyncData.ts",
    "useAuthRedirectHandler.ts",
    "useCarIoT.ts",
    "useCompleteProfile.ts",
    "useDealershipForm.ts",
    "useDraftAutoSave.ts",
    "useEmailVerification.ts",
    "useFavorites.ts",
    "useNotifications.ts",
    "useOptimisticUpdate.ts",
    "useOptimizedImage.ts",
    "useProfileTracking.ts",
    "usePWA.ts",
    "useSavedSearches.ts",
    "useSellWorkflow.ts",
    "useWorkflowStep.ts"
)

$migratedHooks = 0
foreach ($hook in $hooksToMigrate) {
    $sourcePath = Join-Path $hooksSource $hook
    $destPath = Join-Path $hooksDest $hook
    
    if (Copy-FileWithImports -SourcePath $sourcePath -DestPath $destPath -PackageName "core") {
        Write-Host "  OK: $hook" -ForegroundColor Green
        $migratedHooks++
    }
}

Write-Host "Migrated $migratedHooks hooks" -ForegroundColor Green
Write-Host ""

# Note: This is a basic script. Full migration requires manual review of imports.
Write-Host "Note: This script does basic import updates." -ForegroundColor Yellow
Write-Host "Manual review and testing required for all files." -ForegroundColor Yellow

