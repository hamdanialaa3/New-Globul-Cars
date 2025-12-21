# PowerShell Script to Clean Up Zombie Code
# This script removes unused files from the project as part of the "Fat Removal" process.

$BasePath = "c:\Users\hamda\Desktop\New Globul Cars\bulgarian-car-marketplace\src"

# List of files to delete
$FilesToDelete = @(
    "pages\04_car-selling\sell\VehicleDataPageUnified.tsx",
    "pages\04_car-selling\sell\PricingPageUnified.tsx",
    "pages\04_car-selling\sell\ImagesPageUnified.tsx",
    "pages\04_car-selling\sell\UnifiedContactPage.tsx",
    "pages\04_car-selling\sell\VehicleStartPageUnified.tsx",
    "pages\04_car-selling\sell\DesktopPreviewPage.tsx",
    "pages\04_car-selling\sell\DesktopSubmissionPage.tsx",
    "pages\04_car-selling\sell\ComfortEquipmentPage.tsx",
    "pages\04_car-selling\sell\ExtrasEquipmentPage.tsx",
    "pages\04_car-selling\sell\SafetyEquipmentPage.tsx",
    "pages\04_car-selling\sell\InfotainmentEquipmentPage.tsx",
    "pages\04_car-selling\sell\PricingPage.tsx",
    "pages\04_car-selling\sell\VehicleDataPage.tsx",
    "pages\04_car-selling\sell\ImagesPage.tsx",
    "pages\04_car-selling\sell\Equipment\UnifiedEquipmentPage.tsx",
    "pages\04_car-selling\sell\Equipment\UnifiedEquipmentStyles.ts",
    "pages\04_car-selling\sell\Equipment\styles.ts",
    "pages\04_car-selling\sell\Equipment\useEquipmentSelection.ts",
    "pages\04_car-selling\sell\UnifiedContactStyles.ts",
    "services\validation-service.ts",
    "services\hcaptcha-service.tsx"
)

Write-Host "Starting Cleanup Process..." -ForegroundColor Cyan

foreach ($file in $FilesToDelete) {
    $fullPath = Join-Path $BasePath $file
    if (Test-Path $fullPath) {
        Remove-Item -Path $fullPath -Force
        Write-Host "Deleted: $file" -ForegroundColor Green
    } else {
        Write-Host "File not found (already deleted?): $file" -ForegroundColor Yellow
    }
}

# Rename operations
$ValidationEnhanced = Join-Path $BasePath "services\validation-service-enhanced.ts"
$ValidationTarget = Join-Path $BasePath "services\validation-service.ts"

if (Test-Path $ValidationEnhanced) {
    Rename-Item -Path $ValidationEnhanced -NewName "validation-service.ts"
    Write-Host "Renamed validation-service-enhanced.ts to validation-service.ts" -ForegroundColor Green
}

$CaptchaClean = Join-Path $BasePath "services\hcaptcha-service-clean.ts"
$CaptchaTarget = Join-Path $BasePath "services\hcaptcha-service.ts" # Note .ts extension

if (Test-Path $CaptchaClean) {
    Rename-Item -Path $CaptchaClean -NewName "hcaptcha-service.ts"
    Write-Host "Renamed hcaptcha-service-clean.ts to hcaptcha-service.ts" -ForegroundColor Green
}

Write-Host "Cleanup Complete!" -ForegroundColor Cyan
