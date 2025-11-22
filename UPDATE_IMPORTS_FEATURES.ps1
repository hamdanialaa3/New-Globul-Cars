# Update imports in Features files
# تحديث imports في ملفات Features

$ErrorActionPreference = "Stop"

Write-Host "Starting Features Imports Update..." -ForegroundColor Green
Write-Host ""

# Path mappings
$importMappings = @{
    "@/components/" = "@globul-cars/ui"
    "@/services/" = "@globul-cars/services"
    "@/hooks/" = "@globul-cars/core"
    "@/utils/" = "@globul-cars/core"
    "@/types/" = "@globul-cars/core"
    "@/contexts/" = "@globul-cars/core"
    "@/constants/" = "@globul-cars/core"
    "@/locales/" = "@globul-cars/core"
    "@/features/" = "@globul-cars/core/features"
}

# Get all feature files
$featureFiles = @()
$featureFiles += Get-ChildItem -Path "packages/core/src/features" -Recurse -Include "*.tsx","*.ts" -ErrorAction SilentlyContinue | Where-Object {
    $_.FullName -notmatch "node_modules|\.test\.|\.spec\.|__tests__|__mocks__"
}
$featureFiles += Get-ChildItem -Path "packages/payments/src/features" -Recurse -Include "*.tsx","*.ts" -ErrorAction SilentlyContinue | Where-Object {
    $_.FullName -notmatch "node_modules|\.test\.|\.spec\.|__tests__|__mocks__"
}

$totalFiles = $featureFiles.Count
$updatedCount = 0
$errorCount = 0

Write-Host "Found $totalFiles feature files to update" -ForegroundColor Yellow
Write-Host ""

foreach ($file in $featureFiles) {
    try {
        $content = Get-Content $file.FullName -Raw -Encoding UTF8
        $originalContent = $content
        $updated = $false
        
        # Update @/ imports
        foreach ($oldPath in $importMappings.Keys) {
            $newPath = $importMappings[$oldPath]
            if ($content -match [regex]::Escape($oldPath)) {
                $content = $content -replace [regex]::Escape($oldPath), $newPath
                $updated = $true
            }
        }
        
        # Update relative imports (../../services/ -> @globul-cars/services)
        if ($content -match "from ['\`"]\.\.\/\.\.\/services\/") {
            $content = $content -replace "from ['\`"]\.\.\/\.\.\/services\/", "from '@globul-cars/services/"
            $updated = $true
        }
        
        if ($content -match "from ['\`"]\.\.\/\.\.\/\.\.\/services\/") {
            $content = $content -replace "from ['\`"]\.\.\/\.\.\/\.\.\/services\/", "from '@globul-cars/services/"
            $updated = $true
        }
        
        # Update relative hooks imports
        if ($content -match "from ['\`"]\.\.\/\.\.\/hooks\/") {
            $content = $content -replace "from ['\`"]\.\.\/\.\.\/hooks\/", "from '@globul-cars/core/hooks/"
            $updated = $true
        }
        
        if ($content -match "from ['\`"]\.\.\/\.\.\/\.\.\/hooks\/") {
            $content = $content -replace "from ['\`"]\.\.\/\.\.\/\.\.\/hooks\/", "from '@globul-cars/core/hooks/"
            $updated = $true
        }
        
        # Update relative components imports
        if ($content -match "from ['\`"]\.\.\/\.\.\/components\/") {
            $content = $content -replace "from ['\`"]\.\.\/\.\.\/components\/", "from '@globul-cars/ui/components/"
            $updated = $true
        }
        
        if ($content -match "from ['\`"]\.\.\/\.\.\/\.\.\/components\/") {
            $content = $content -replace "from ['\`"]\.\.\/\.\.\/\.\.\/components\/", "from '@globul-cars/ui/components/"
            $updated = $true
        }
        
        # Save if updated
        if ($updated) {
            Set-Content -Path $file.FullName -Value $content -Encoding UTF8 -NoNewline
            $updatedCount++
            $relativePath = $file.FullName.Replace((Get-Location).Path + "\", "")
            Write-Host "Updated: $relativePath" -ForegroundColor Green
        }
    }
    catch {
        $errorCount++
        Write-Host "Error updating $($file.Name): $_" -ForegroundColor Red
    }
}

Write-Host ""
Write-Host "Migration Summary:" -ForegroundColor Cyan
Write-Host "  Updated: $updatedCount" -ForegroundColor Green
Write-Host "  Errors: $errorCount" -ForegroundColor Red
Write-Host ""
Write-Host "Features imports update completed!" -ForegroundColor Green

