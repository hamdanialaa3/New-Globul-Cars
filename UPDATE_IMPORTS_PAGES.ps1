# Update imports in Pages files
# تحديث imports في ملفات Pages

$ErrorActionPreference = "Stop"

Write-Host "Starting Pages Imports Update..." -ForegroundColor Green
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
    "@/pages/" = "@globul-cars/app/pages"
}

# Get all page files
$pageFiles = @()
$packages = @("app", "auth", "cars", "profile", "admin", "social", "messaging", "payments", "iot")
foreach ($pkg in $packages) {
    $pagePath = "packages/$pkg/src/pages"
    if (Test-Path $pagePath) {
        $pageFiles += Get-ChildItem -Path $pagePath -Recurse -Include "*.tsx","*.ts" -ErrorAction SilentlyContinue | Where-Object {
            $_.FullName -notmatch "node_modules|\.test\.|\.spec\.|__tests__|__mocks__"
        }
    }
}

$totalFiles = $pageFiles.Count
$updatedCount = 0
$errorCount = 0

Write-Host "Found $totalFiles page files to update" -ForegroundColor Yellow
Write-Host ""

foreach ($file in $pageFiles) {
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
        
        # Update relative imports
        # ../../services/ -> @globul-cars/services
        if ($content -match "from ['\`"]\.\.\/\.\.\/services\/") {
            $content = $content -replace "from ['\`"]\.\.\/\.\.\/services\/", "from '@globul-cars/services/"
            $updated = $true
        }
        
        if ($content -match "from ['\`"]\.\.\/\.\.\/\.\.\/services\/") {
            $content = $content -replace "from ['\`"]\.\.\/\.\.\/\.\.\/services\/", "from '@globul-cars/services/"
            $updated = $true
        }
        
        # ../../components/ -> @globul-cars/ui
        if ($content -match "from ['\`"]\.\.\/\.\.\/components\/") {
            $content = $content -replace "from ['\`"]\.\.\/\.\.\/components\/", "from '@globul-cars/ui/components/"
            $updated = $true
        }
        
        if ($content -match "from ['\`"]\.\.\/\.\.\/\.\.\/components\/") {
            $content = $content -replace "from ['\`"]\.\.\/\.\.\/\.\.\/components\/", "from '@globul-cars/ui/components/"
            $updated = $true
        }
        
        # ../../hooks/ -> @globul-cars/core/hooks
        if ($content -match "from ['\`"]\.\.\/\.\.\/hooks\/") {
            $content = $content -replace "from ['\`"]\.\.\/\.\.\/hooks\/", "from '@globul-cars/core/hooks/"
            $updated = $true
        }
        
        if ($content -match "from ['\`"]\.\.\/\.\.\/\.\.\/hooks\/") {
            $content = $content -replace "from ['\`"]\.\.\/\.\.\/\.\.\/hooks\/", "from '@globul-cars/core/hooks/"
            $updated = $true
        }
        
        # ../../contexts/ -> @globul-cars/core/contexts
        if ($content -match "from ['\`"]\.\.\/\.\.\/contexts\/") {
            $content = $content -replace "from ['\`"]\.\.\/\.\.\/contexts\/", "from '@globul-cars/core/contexts/"
            $updated = $true
        }
        
        # Save if updated
        if ($updated) {
            Set-Content -Path $file.FullName -Value $content -Encoding UTF8 -NoNewline
            $updatedCount++
            if ($updatedCount % 10 -eq 0) {
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
Write-Host "Pages imports update completed!" -ForegroundColor Green

