# Update all remaining imports in packages
# تحديث جميع الـ imports المتبقية في packages

$ErrorActionPreference = "Stop"

Write-Host "Starting Complete Imports Update..." -ForegroundColor Green
Write-Host ""

# Path mappings
$importMappings = @{
    "@/components/" = "@globul-cars/ui/components/"
    "@/services/" = "@globul-cars/services/"
    "@/hooks/" = "@globul-cars/core/hooks/"
    "@/utils/" = "@globul-cars/core/utils/"
    "@/types/" = "@globul-cars/core/types/"
    "@/contexts/" = "@globul-cars/core/contexts/"
    "@/constants/" = "@globul-cars/core/constants/"
    "@/locales/" = "@globul-cars/core/locales/"
    "@/features/" = "@globul-cars/core/features/"
    "@/firebase/" = "@globul-cars/services/firebase/"
    "@/data/" = "@globul-cars/core/constants/"
}

# Get all TypeScript/TSX files in packages
$allFiles = Get-ChildItem -Path "packages" -Recurse -Include "*.tsx","*.ts" | Where-Object {
    $_.FullName -notmatch "node_modules|\.test\.|\.spec\.|__tests__|__mocks__|dist|build"
}

$totalFiles = $allFiles.Count
$updatedCount = 0
$errorCount = 0

Write-Host "Found $totalFiles files to check" -ForegroundColor Yellow
Write-Host ""

foreach ($file in $allFiles) {
    try {
        $content = Get-Content $file.FullName -Raw -Encoding UTF8
        $originalContent = $content
        $updated = $false
        
        # Update @/ imports
        foreach ($oldPath in $importMappings.Keys) {
            $newPath = $importMappings[$oldPath]
            $pattern = [regex]::Escape($oldPath)
            if ($content -match $pattern) {
                $content = $content -replace $pattern, $newPath
                $updated = $true
            }
        }
        
        # Update relative imports to services
        if ($content -match "from ['\`"]\.\.\/\.\.\/services\/") {
            $content = $content -replace "from ['\`"]\.\.\/\.\.\/services\/", "from '@globul-cars/services/"
            $updated = $true
        }
        if ($content -match "from ['\`"]\.\.\/\.\.\/\.\.\/services\/") {
            $content = $content -replace "from ['\`"]\.\.\/\.\.\/\.\.\/services\/", "from '@globul-cars/services/"
            $updated = $true
        }
        if ($content -match "from ['\`"]\.\.\/\.\.\/\.\.\/\.\.\/services\/") {
            $content = $content -replace "from ['\`"]\.\.\/\.\.\/\.\.\/\.\.\/services\/", "from '@globul-cars/services/"
            $updated = $true
        }
        
        # Update relative imports to firebase
        if ($content -match "from ['\`"]\.\.\/\.\.\/firebase\/") {
            $content = $content -replace "from ['\`"]\.\.\/\.\.\/firebase\/", "from '@globul-cars/services/firebase/"
            $updated = $true
        }
        if ($content -match "from ['\`"]\.\.\/\.\.\/\.\.\/firebase\/") {
            $content = $content -replace "from ['\`"]\.\.\/\.\.\/\.\.\/firebase\/", "from '@globul-cars/services/firebase/"
            $updated = $true
        }
        
        # Update relative imports to contexts
        if ($content -match "from ['\`"]\.\.\/\.\.\/contexts\/") {
            $content = $content -replace "from ['\`"]\.\.\/\.\.\/contexts\/", "from '@globul-cars/core/contexts/"
            $updated = $true
        }
        if ($content -match "from ['\`"]\.\.\/\.\.\/\.\.\/contexts\/") {
            $content = $content -replace "from ['\`"]\.\.\/\.\.\/\.\.\/contexts\/", "from '@globul-cars/core/contexts/"
            $updated = $true
        }
        
        # Update relative imports to components
        if ($content -match "from ['\`"]\.\.\/\.\.\/components\/") {
            $content = $content -replace "from ['\`"]\.\.\/\.\.\/components\/", "from '@globul-cars/ui/components/"
            $updated = $true
        }
        if ($content -match "from ['\`"]\.\.\/\.\.\/\.\.\/components\/") {
            $content = $content -replace "from ['\`"]\.\.\/\.\.\/\.\.\/components\/", "from '@globul-cars/ui/components/"
            $updated = $true
        }
        
        # Update relative imports to hooks
        if ($content -match "from ['\`"]\.\.\/\.\.\/hooks\/") {
            $content = $content -replace "from ['\`"]\.\.\/\.\.\/hooks\/", "from '@globul-cars/core/hooks/"
            $updated = $true
        }
        if ($content -match "from ['\`"]\.\.\/\.\.\/\.\.\/hooks\/") {
            $content = $content -replace "from ['\`"]\.\.\/\.\.\/\.\.\/hooks\/", "from '@globul-cars/core/hooks/"
            $updated = $true
        }
        
        # Update relative imports to data/constants
        if ($content -match "from ['\`"]\.\.\/\.\.\/data\/") {
            $content = $content -replace "from ['\`"]\.\.\/\.\.\/data\/", "from '@globul-cars/core/constants/"
            $updated = $true
        }
        if ($content -match "from ['\`"]\.\.\/\.\.\/\.\.\/data\/") {
            $content = $content -replace "from ['\`"]\.\.\/\.\.\/\.\.\/data\/", "from '@globul-cars/core/constants/"
            $updated = $true
        }
        
        # Save if updated
        if ($updated) {
            Set-Content -Path $file.FullName -Value $content -Encoding UTF8 -NoNewline
            $updatedCount++
            if ($updatedCount % 20 -eq 0) {
                Write-Host "Updated $updatedCount/$totalFiles files..." -ForegroundColor Green
            }
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
Write-Host "Complete imports update finished!" -ForegroundColor Green

