# Migrate Remaining Services from bulgarian-car-marketplace to packages/services
# نقل الخدمات المتبقية من bulgarian-car-marketplace إلى packages/services

$ErrorActionPreference = "Stop"
$sourceDir = "bulgarian-car-marketplace/src/services"
$targetDir = "packages/services/src"

Write-Host "Starting Services Migration..." -ForegroundColor Green
Write-Host "Source: $sourceDir" -ForegroundColor Cyan
Write-Host "Target: $targetDir" -ForegroundColor Cyan
Write-Host ""

# Get all service files
$serviceFiles = Get-ChildItem -Path $sourceDir -Recurse -File -Include *.ts,*.tsx | Where-Object {
    $_.FullName -notmatch 'node_modules|\.test\.|\.spec\.|__tests__|__mocks__'
}

$totalFiles = $serviceFiles.Count
$copiedCount = 0
$skippedCount = 0
$errorCount = 0

Write-Host "Found $totalFiles service files to migrate" -ForegroundColor Yellow
Write-Host ""

foreach ($file in $serviceFiles) {
    try {
        # Get relative path from source directory
        $relativePath = $file.FullName.Replace((Resolve-Path $sourceDir).Path + "\", "")
        $targetPath = Join-Path $targetDir $relativePath
        $targetFolder = Split-Path $targetPath -Parent
        
        # Skip if already exists
        if (Test-Path $targetPath) {
            $skippedCount++
            Write-Host "Skipped (exists): $relativePath" -ForegroundColor Gray
            continue
        }
        
        # Create target directory
        if (-not (Test-Path $targetFolder)) {
            New-Item -ItemType Directory -Path $targetFolder -Force | Out-Null
        }
        
        # Copy file
        Copy-Item -Path $file.FullName -Destination $targetPath -Force
        $copiedCount++
        
        if ($copiedCount % 10 -eq 0) {
            Write-Host "Copied $copiedCount/$totalFiles files..." -ForegroundColor Green
        }
    }
    catch {
        $errorCount++
        Write-Host "Error copying $($file.Name): $_" -ForegroundColor Red
    }
}

Write-Host ""
Write-Host "Migration Summary:" -ForegroundColor Cyan
Write-Host "  Copied: $copiedCount" -ForegroundColor Green
Write-Host "  Skipped: $skippedCount" -ForegroundColor Yellow
Write-Host "  Errors: $errorCount" -ForegroundColor Red
Write-Host ""
Write-Host "Services migration completed!" -ForegroundColor Green

