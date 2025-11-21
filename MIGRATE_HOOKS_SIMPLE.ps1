# Migration Script - نقل Hooks
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
        Write-Host "OK: $hook"
        $migrated++
    } else {
        Write-Host "Not found: $hook"
    }
}

Write-Host ""
Write-Host "Migrated $migrated hooks"
Write-Host "Note: Import updates required manually"

