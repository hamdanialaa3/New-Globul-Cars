# Migration Script - نقل Utils
$projectRoot = Get-Location
$sourceRoot = Join-Path $projectRoot "bulgarian-car-marketplace\src\utils"
$destRoot = Join-Path $projectRoot "packages\core\src\utils"

$utilsToMigrate = @(
    "accessibility-helpers.ts",
    "accessibility.ts",
    "auth-error-handler.ts",
    "backup-service.ts",
    "clean-google-auth.js",
    "errorHandling.ts",
    "facebook-sdk.ts",
    "feature-flags.ts",
    "firebase-health-check.ts",
    "google-analytics.ts",
    "listing-limits.ts",
    "locationHelpers.ts",
    "migrate-locations-browser.ts",
    "optimistic-updates.ts",
    "performance-monitor.ts",
    "performance-monitoring.ts",
    "performance.ts",
    "profile-completion.ts",
    "schema-generator.ts",
    "sentry.ts",
    "seo.ts",
    "seo.tsx",
    "sitemap-generator.ts",
    "sitemapGenerator.ts",
    "timestamp-converter.ts",
    "toast-helper.ts",
    "uptime-monitoring.ts",
    "userFilters.ts",
    "validation.ts"
)

$migrated = 0
foreach ($util in $utilsToMigrate) {
    $sourcePath = Join-Path $sourceRoot $util
    $destPath = Join-Path $destRoot $util
    
    if (Test-Path $sourcePath) {
        Copy-Item -Path $sourcePath -Destination $destPath -Force
        Write-Host "OK: $util"
        $migrated++
    } else {
        Write-Host "Not found: $util"
    }
}

# Copy validators directory
$validatorsSource = Join-Path $sourceRoot "validators"
$validatorsDest = Join-Path $destRoot "validators"
if (Test-Path $validatorsSource) {
    Copy-Item -Path $validatorsSource -Destination $validatorsDest -Recurse -Force
    Write-Host "OK: validators/ (directory)"
    $migrated++
}

Write-Host ""
Write-Host "Migrated $migrated utils"
Write-Host "Note: Import updates required manually"

