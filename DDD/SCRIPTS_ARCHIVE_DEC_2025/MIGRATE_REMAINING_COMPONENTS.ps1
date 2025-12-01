# Migrate Remaining Components from bulgarian-car-marketplace to packages/ui
# نقل المكونات المتبقية من bulgarian-car-marketplace إلى packages/ui

$ErrorActionPreference = "Stop"
$sourceDir = "bulgarian-car-marketplace/src/components"
$targetDir = "packages/ui/src/components"

Write-Host "Starting Components Migration..." -ForegroundColor Green
Write-Host "Source: $sourceDir" -ForegroundColor Cyan
Write-Host "Target: $targetDir" -ForegroundColor Cyan
Write-Host ""

# Get all component files
$componentFiles = Get-ChildItem -Path $sourceDir -Recurse -File -Include *.tsx,*.ts | Where-Object {
    $_.FullName -notmatch 'node_modules|\.test\.|\.spec\.|__tests__|__mocks__'
}

$totalFiles = $componentFiles.Count
$copiedCount = 0
$skippedCount = 0
$errorCount = 0

Write-Host "Found $totalFiles component files to migrate" -ForegroundColor Yellow
Write-Host ""

foreach ($file in $componentFiles) {
    try {
        # Get relative path from source directory
        $relativePath = $file.FullName.Replace((Resolve-Path $sourceDir).Path + "\", "")
        $targetPath = Join-Path $targetDir $relativePath
        $targetFolder = Split-Path $targetPath -Parent
        
        # Skip if already exists in target
        if (Test-Path $targetPath) {
            $skippedCount++
            Write-Host "Skipped (exists): $relativePath" -ForegroundColor Gray
            continue
        }
        
        # Create target directory if it doesn't exist
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
Write-Host "Components migration completed!" -ForegroundColor Green

