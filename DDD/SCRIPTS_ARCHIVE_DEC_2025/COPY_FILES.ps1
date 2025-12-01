# Simple PowerShell script to copy large files
# Run: powershell -ExecutionPolicy Bypass -File COPY_FILES.ps1

Write-Host "Starting file copy..." -ForegroundColor Green

# Copy carData_static.ts
$source1 = "bulgarian-car-marketplace\src\constants\carData_static.ts"
$dest1 = "packages\core\src\constants\carData_static.ts"

if (Test-Path $source1) {
    Write-Host "Copying carData_static.ts..." -ForegroundColor Yellow
    Copy-Item -Path $source1 -Destination $dest1 -Force
    Write-Host "✅ carData_static.ts copied successfully!" -ForegroundColor Green
} else {
    Write-Host "❌ Source file not found: $source1" -ForegroundColor Red
}

# Copy translations.ts
$source2 = "bulgarian-car-marketplace\src\locales\translations.ts"
$dest2 = "packages\core\src\locales\translations.ts"

if (Test-Path $source2) {
    Write-Host "Copying translations.ts..." -ForegroundColor Yellow
    Copy-Item -Path $source2 -Destination $dest2 -Force
    Write-Host "✅ translations.ts copied successfully!" -ForegroundColor Green
} else {
    Write-Host "❌ Source file not found: $source2" -ForegroundColor Red
}

# Verify
Write-Host "`nVerifying files..." -ForegroundColor Cyan
if (Test-Path $dest1 -And Test-Path $dest2) {
    Write-Host "✅✅✅ BOTH FILES COPIED SUCCESSFULLY!" -ForegroundColor Green
    Write-Host "Core Package is now 100% complete!" -ForegroundColor Green
} else {
    Write-Host "⚠️ Some files are missing" -ForegroundColor Yellow
}

Write-Host "`nDone!" -ForegroundColor Green

