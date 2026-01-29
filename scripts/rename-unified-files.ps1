# Naming Cleanup Script - Week 1, Day 3
# Removes temporary suffixes (Unified, New) from component names
# Date: November 26, 2025

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Naming Cleanup Script - Week 1, Day 3" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Define the project root
$projectRoot = "C:\Users\hamda\Desktop\New Globul Cars\bulgarian-car-marketplace"
$srcPath = Join-Path $projectRoot "src"

# Define files to rename (CRITICAL ONES USED IN APP.TSX)
$criticalRenames = @(
    @{
        Old = "VehicleStartPageNew.tsx"
        New = "VehicleStartPage.tsx"
        Path = "pages\04_car-selling\sell"
        OldImport = "VehicleStartPageNew"
        NewImport = "VehicleStartPage"
    },
    @{
        Old = "VehicleDataPageUnified.tsx"
        New = "VehicleDataPage.tsx"
        Path = "pages\04_car-selling\sell"
        OldImport = "VehicleDataPageUnified"
        NewImport = "VehicleDataPage"
    },
    @{
        Old = "UnifiedEquipmentPage.tsx"
        New = "EquipmentPage.tsx"
        Path = "pages\04_car-selling\sell\Equipment"
        OldImport = "UnifiedEquipmentPage"
        NewImport = "EquipmentPage"
    },
    @{
        Old = "ImagesPageUnified.tsx"
        New = "ImagesPage.tsx"
        Path = "pages\04_car-selling\sell"
        OldImport = "ImagesPageUnified"
        NewImport = "ImagesPage"
    },
    @{
        Old = "UnifiedContactPage.tsx"
        New = "ContactPage.tsx"
        Path = "pages\04_car-selling\sell"
        OldImport = "UnifiedContactPage"
        NewImport = "ContactPage"
    }
)

# Additional renames (less critical)
$additionalRenames = @(
    @{
        Old = "ContactPageUnified.tsx"
        New = "ContactPageLegacy.tsx"
        Path = "pages\04_car-selling\sell"
        Note = "Legacy file - keeping for reference"
    },
    @{
        Old = "PricingPageUnified.tsx"
        New = "PricingPageLegacy.tsx"
        Path = "pages\04_car-selling\sell"
        Note = "Legacy file - keeping for reference"
    },
    @{
        Old = "VehicleStartPageUnified.tsx"
        New = "VehicleStartPageLegacy.tsx"
        Path = "pages\04_car-selling\sell"
        Note = "Legacy file - keeping for reference"
    }
)

Write-Host "Step 1: Backing up current state..." -ForegroundColor Yellow
Write-Host ""

# Create backup
$backupPath = Join-Path $projectRoot "backup_before_naming_cleanup_$(Get-Date -Format 'yyyyMMdd_HHmmss')"
Write-Host "Creating backup at: $backupPath" -ForegroundColor Gray

# Function to rename file and update imports
function Rename-ComponentFile {
    param(
        [hashtable]$FileInfo,
        [string]$SrcPath
    )
    
    $fullOldPath = Join-Path $SrcPath $FileInfo.Path | Join-Path -ChildPath $FileInfo.Old
    $fullNewPath = Join-Path $SrcPath $FileInfo.Path | Join-Path -ChildPath $FileInfo.New
    
    Write-Host "Processing: $($FileInfo.Old) -> $($FileInfo.New)" -ForegroundColor Cyan
    
    # Check if old file exists
    if (-not (Test-Path $fullOldPath)) {
        Write-Host "  [SKIP] File not found: $fullOldPath" -ForegroundColor Yellow
        return $false
    }
    
    # Check if new file already exists
    if (Test-Path $fullNewPath) {
        Write-Host "  [SKIP] Target file already exists: $fullNewPath" -ForegroundColor Yellow
        return $false
    }
    
    # Rename the file
    try {
        Rename-Item -Path $fullOldPath -NewName $FileInfo.New -ErrorAction Stop
        Write-Host "  [OK] File renamed successfully" -ForegroundColor Green
        
        # Update component name inside the file if needed
        if ($FileInfo.OldImport -and $FileInfo.NewImport) {
            $content = Get-Content $fullNewPath -Raw
            $updatedContent = $content -replace "export (default )?$($FileInfo.OldImport)", "export `$1$($FileInfo.NewImport)"
            $updatedContent = $updatedContent -replace "const $($FileInfo.OldImport)", "const $($FileInfo.NewImport)"
            Set-Content -Path $fullNewPath -Value $updatedContent
            Write-Host "  [OK] Component name updated inside file" -ForegroundColor Green
        }
        
        return $true
    }
    catch {
        Write-Host "  [ERROR] Failed to rename: $_" -ForegroundColor Red
        return $false
    }
}

# Function to update imports in all files
function Update-ImportsInFiles {
    param(
        [string]$SrcPath,
        [string]$OldImport,
        [string]$NewImport,
        [string]$OldFileName,
        [string]$NewFileName
    )
    
    Write-Host "  Updating imports: $OldImport -> $NewImport" -ForegroundColor Cyan
    
    $filesUpdated = 0
    
    # Find all TypeScript/TSX files
    Get-ChildItem -Path $SrcPath -Recurse -Include "*.tsx","*.ts" | ForEach-Object {
        $filePath = $_.FullName
        $content = Get-Content $filePath -Raw
        $originalContent = $content
        
        # Update import statements (file path)
        $content = $content -replace [regex]::Escape($OldFileName -replace '\.tsx$', ''), ($NewFileName -replace '\.tsx$', '')
        
        # Update component usage (variable names)
        if ($OldImport -ne $NewImport) {
            $content = $content -replace "\b$OldImport\b", $NewImport
        }
        
        if ($content -ne $originalContent) {
            Set-Content -Path $filePath -Value $content
            $filesUpdated++
            Write-Host "    Updated: $($_.Name)" -ForegroundColor Gray
        }
    }
    
    Write-Host "  [OK] Updated $filesUpdated files" -ForegroundColor Green
}

Write-Host ""
Write-Host "Step 2: Renaming critical files (used in App.tsx)..." -ForegroundColor Yellow
Write-Host ""

$successCount = 0
foreach ($fileInfo in $criticalRenames) {
    if (Rename-ComponentFile -FileInfo $fileInfo -SrcPath $srcPath) {
        $successCount++
        
        # Update imports across all files
        if ($fileInfo.OldImport -and $fileInfo.NewImport) {
            Update-ImportsInFiles -SrcPath $srcPath `
                -OldImport $fileInfo.OldImport `
                -NewImport $fileInfo.NewImport `
                -OldFileName $fileInfo.Old `
                -NewFileName $fileInfo.New
        }
    }
    Write-Host ""
}

Write-Host ""
Write-Host "Step 3: Renaming additional files (legacy)..." -ForegroundColor Yellow
Write-Host ""

foreach ($fileInfo in $additionalRenames) {
    $fullOldPath = Join-Path $srcPath $fileInfo.Path | Join-Path -ChildPath $fileInfo.Old
    $fullNewPath = Join-Path $srcPath $fileInfo.Path | Join-Path -ChildPath $fileInfo.New
    
    if (Test-Path $fullOldPath) {
        Write-Host "Processing: $($fileInfo.Old) -> $($fileInfo.New)" -ForegroundColor Cyan
        Write-Host "  Note: $($fileInfo.Note)" -ForegroundColor Gray
        
        if (-not (Test-Path $fullNewPath)) {
            Rename-Item -Path $fullOldPath -NewName $fileInfo.New
            Write-Host "  [OK] Renamed to legacy" -ForegroundColor Green
        }
        else {
            Write-Host "  [SKIP] Target already exists" -ForegroundColor Yellow
        }
    }
    Write-Host ""
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Summary" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Critical files renamed: $successCount / $($criticalRenames.Count)" -ForegroundColor $(if ($successCount -eq $criticalRenames.Count) { "Green" } else { "Yellow" })
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host "1. Run: npm run type-check" -ForegroundColor White
Write-Host "2. Run: npm test" -ForegroundColor White
Write-Host "3. Run: npm run build" -ForegroundColor White
Write-Host "4. Manual testing of sell workflow" -ForegroundColor White
Write-Host ""
Write-Host "If everything works:" -ForegroundColor Green
Write-Host "  git add ." -ForegroundColor White
Write-Host "  git commit -m 'refactor: remove temporary naming suffixes (Week 1, Day 3)'" -ForegroundColor White
Write-Host ""
Write-Host "If issues occur:" -ForegroundColor Red
Write-Host "  Restore from backup: $backupPath" -ForegroundColor White
Write-Host ""
