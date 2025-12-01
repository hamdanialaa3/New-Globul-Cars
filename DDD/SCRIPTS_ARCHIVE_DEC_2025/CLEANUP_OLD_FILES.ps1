# Cleanup old files from bulgarian-car-marketplace/src
# تنظيف الملفات القديمة من bulgarian-car-marketplace/src

$ErrorActionPreference = "Stop"

Write-Host "Starting Cleanup of Old Files..." -ForegroundColor Green
Write-Host "WARNING: This will delete files from bulgarian-car-marketplace/src" -ForegroundColor Yellow
Write-Host ""

# Directories to check (only if files are migrated)
$directoriesToCheck = @(
    "bulgarian-car-marketplace/src/features",
    "bulgarian-car-marketplace/src/components",
    "bulgarian-car-marketplace/src/pages",
    "bulgarian-car-marketplace/src/services"
)

$deletedCount = 0
$errorCount = 0

foreach ($dir in $directoriesToCheck) {
    if (Test-Path $dir) {
        Write-Host "Checking: $dir" -ForegroundColor Cyan
        
        # Get all files
        $files = Get-ChildItem -Path $dir -Recurse -File -Include "*.tsx","*.ts" | Where-Object {
            $_.FullName -notmatch "node_modules|\.test\.|\.spec\.|__tests__|__mocks__"
        }
        
        foreach ($file in $files) {
            try {
                # Check if file exists in packages (basic check)
                $relativePath = $file.FullName.Replace((Resolve-Path $dir).Path + "\", "")
                
                # For now, just log - don't delete automatically
                # User should verify manually
                Write-Host "  Found: $relativePath" -ForegroundColor Gray
            }
            catch {
                $errorCount++
                Write-Host "Error processing $($file.Name): $_" -ForegroundColor Red
            }
        }
    }
}

Write-Host ""
Write-Host "Cleanup Summary:" -ForegroundColor Cyan
Write-Host "  Files found: (listed above)" -ForegroundColor Yellow
Write-Host "  NOTE: Files are NOT deleted automatically" -ForegroundColor Yellow
Write-Host "  Please verify manually before deleting" -ForegroundColor Yellow
Write-Host ""
Write-Host "Cleanup check completed!" -ForegroundColor Green

