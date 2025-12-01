# Migration Script - نقل Hooks
# Run: powershell -ExecutionPolicy Bypass -File MIGRATE_HOOKS.ps1

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Migration Script - نقل Hooks" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

$projectRoot = Get-Location
$sourceRoot = Join-Path $projectRoot "bulgarian-car-marketplace\src\hooks"
$destRoot = Join-Path $projectRoot "packages\core\src\hooks"

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

$migrated = 0
foreach ($hook in $hooksToMigrate) {
    $sourcePath = Join-Path $sourceRoot $hook
    $destPath = Join-Path $destRoot $hook
    
    if (Test-Path $sourcePath) {
        Copy-Item -Path $sourcePath -Destination $destPath -Force
        Write-Host "OK: $hook" -ForegroundColor Green
        $migrated++
    } else {
        Write-Host "Not found: $hook" -ForegroundColor Yellow
    }
}

Write-Host ""
Write-Host "Migrated $migrated hooks" -ForegroundColor Green
Write-Host 'Note: Import updates required manually' -ForegroundColor Yellow

