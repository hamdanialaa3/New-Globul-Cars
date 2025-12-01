# Update Imports Script - تحديث جميع الـ imports
$projectRoot = Get-Location
$packagesRoot = Join-Path $projectRoot "packages"

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Update Imports - تحديث جميع الـ imports" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Function to update imports in a file
function Update-FileImports {
    param(
        [string]$FilePath,
        [string]$PackageName
    )
    
    if (-not (Test-Path $FilePath)) {
        return $false
    }
    
    $content = Get-Content $FilePath -Raw -Encoding UTF8
    $originalContent = $content
    $updated = $false
    
    # Update @/ imports based on package
    switch ($PackageName) {
        "core" {
            # @/services → @globul-cars/services
            $content = $content -replace "from ['\`"]@/services/", "from '@globul-cars/services/"
            # @/hooks → @globul-cars/core
            $content = $content -replace "from ['\`"]@/hooks/", "from '@globul-cars/core"
            # @/contexts → @globul-cars/core
            $content = $content -replace "from ['\`"]@/contexts/", "from '@globul-cars/core/contexts"
            # @/utils → @globul-cars/core
            $content = $content -replace "from ['\`"]@/utils/", "from '@globul-cars/core/utils"
            # @/types → @globul-cars/core
            $content = $content -replace "from ['\`"]@/types/", "from '@globul-cars/core/types"
            # @/constants → @globul-cars/core
            $content = $content -replace "from ['\`"]@/constants/", "from '@globul-cars/core/constants"
            # @/components → @globul-cars/ui
            $content = $content -replace "from ['\`"]@/components/", "from '@globul-cars/ui/components"
        }
        "services" {
            # @/services → @globul-cars/services
            $content = $content -replace "from ['\`"]@/services/", "from '@globul-cars/services/"
            # @/hooks → @globul-cars/core
            $content = $content -replace "from ['\`"]@/hooks/", "from '@globul-cars/core"
            # @/contexts → @globul-cars/core
            $content = $content -replace "from ['\`"]@/contexts/", "from '@globul-cars/core/contexts"
            # @/utils → @globul-cars/core
            $content = $content -replace "from ['\`"]@/utils/", "from '@globul-cars/core/utils"
            # @/types → @globul-cars/core
            $content = $content -replace "from ['\`"]@/types/", "from '@globul-cars/core/types"
        }
        "ui" {
            # @/services → @globul-cars/services
            $content = $content -replace "from ['\`"]@/services/", "from '@globul-cars/services/"
            # @/hooks → @globul-cars/core
            $content = $content -replace "from ['\`"]@/hooks/", "from '@globul-cars/core"
            # @/contexts → @globul-cars/core
            $content = $content -replace "from ['\`"]@/contexts/", "from '@globul-cars/core/contexts"
            # @/utils → @globul-cars/core
            $content = $content -replace "from ['\`"]@/utils/", "from '@globul-cars/core/utils"
            # @/types → @globul-cars/core
            $content = $content -replace "from ['\`"]@/types/", "from '@globul-cars/core/types"
        }
        default {
            # Generic updates for all packages
            $content = $content -replace "from ['\`"]@/services/", "from '@globul-cars/services/"
            $content = $content -replace "from ['\`"]@/hooks/", "from '@globul-cars/core"
            $content = $content -replace "from ['\`"]@/contexts/", "from '@globul-cars/core/contexts"
            $content = $content -replace "from ['\`"]@/utils/", "from '@globul-cars/core/utils"
            $content = $content -replace "from ['\`"]@/types/", "from '@globul-cars/core/types"
            $content = $content -replace "from ['\`"]@/components/", "from '@globul-cars/ui/components"
        }
    }
    
    # Update relative paths to services
    $content = $content -replace "from ['\`"]\.\./\.\./\.\./services/", "from '@globul-cars/services/"
    $content = $content -replace "from ['\`"]\.\./\.\./services/", "from '@globul-cars/services/"
    $content = $content -replace "from ['\`"]\.\./services/", "from '@globul-cars/services/"
    $content = $content -replace "from ['\`"]\./services/", "from '@globul-cars/services/"
    
    # Update relative paths to hooks
    $content = $content -replace "from ['\`"]\.\./\.\./\.\./hooks/", "from '@globul-cars/core"
    $content = $content -replace "from ['\`"]\.\./\.\./hooks/", "from '@globul-cars/core"
    $content = $content -replace "from ['\`"]\.\./hooks/", "from '@globul-cars/core"
    $content = $content -replace "from ['\`"]\./hooks/", "from '@globul-cars/core"
    
    # Update relative paths to contexts
    $content = $content -replace "from ['\`"]\.\./\.\./\.\./contexts/", "from '@globul-cars/core/contexts"
    $content = $content -replace "from ['\`"]\.\./\.\./contexts/", "from '@globul-cars/core/contexts"
    $content = $content -replace "from ['\`"]\.\./contexts/", "from '@globul-cars/core/contexts"
    $content = $content -replace "from ['\`"]\./contexts/", "from '@globul-cars/core/contexts"
    
    # Update relative paths to utils
    $content = $content -replace "from ['\`"]\.\./\.\./\.\./utils/", "from '@globul-cars/core/utils"
    $content = $content -replace "from ['\`"]\.\./\.\./utils/", "from '@globul-cars/core/utils"
    $content = $content -replace "from ['\`"]\.\./utils/", "from '@globul-cars/core/utils"
    $content = $content -replace "from ['\`"]\./utils/", "from '@globul-cars/core/utils"
    
    # Update relative paths to types
    $content = $content -replace "from ['\`"]\.\./\.\./\.\./types/", "from '@globul-cars/core/types"
    $content = $content -replace "from ['\`"]\.\./\.\./types/", "from '@globul-cars/core/types"
    $content = $content -replace "from ['\`"]\.\./types/", "from '@globul-cars/core/types"
    $content = $content -replace "from ['\`"]\./types/", "from '@globul-cars/core/types"
    
    # Update relative paths to components
    $content = $content -replace "from ['\`"]\.\./\.\./\.\./components/", "from '@globul-cars/ui/components"
    $content = $content -replace "from ['\`"]\.\./\.\./components/", "from '@globul-cars/ui/components"
    $content = $content -replace "from ['\`"]\.\./components/", "from '@globul-cars/ui/components"
    $content = $content -replace "from ['\`"]\./components/", "from '@globul-cars/ui/components"
    
    # Update specific service imports
    $content = $content -replace "from ['\`"]\.\./\.\./\.\./services/logger-service", "from '@globul-cars/services"
    $content = $content -replace "from ['\`"]\.\./\.\./services/logger-service", "from '@globul-cars/services"
    $content = $content -replace "from ['\`"]\.\./services/logger-service", "from '@globul-cars/services"
    $content = $content -replace "from ['\`"]\./services/logger-service", "from '@globul-cars/services"
    $content = $content -replace "from ['\`"]@/services/logger-service", "from '@globul-cars/services"
    
    if ($content -ne $originalContent) {
        Set-Content -Path $FilePath -Value $content -Encoding UTF8 -NoNewline
        return $true
    }
    
    return $false
}

# Process all TypeScript/TSX files in packages
$totalFiles = 0
$updatedFiles = 0

$packages = @("core", "services", "ui", "auth", "cars", "profile", "app", "admin", "social", "messaging", "payments", "iot")

foreach ($package in $packages) {
    $packagePath = Join-Path $packagesRoot $package
    if (-not (Test-Path $packagePath)) {
        continue
    }
    
    Write-Host "Processing @globul-cars/$package..." -ForegroundColor Cyan
    
    $files = Get-ChildItem -Path $packagePath -Recurse -Include "*.ts", "*.tsx" | Where-Object {
        $_.FullName -notmatch "node_modules" -and
        $_.FullName -notmatch "\.d\.ts$" -and
        $_.FullName -notmatch "\.test\." -and
        $_.FullName -notmatch "\.spec\."
    }
    
    foreach ($file in $files) {
        $totalFiles++
        if (Update-FileImports -FilePath $file.FullName -PackageName $package) {
            $updatedFiles++
            if ($updatedFiles % 50 -eq 0) {
                Write-Host "  Updated $updatedFiles files..." -ForegroundColor Yellow
            }
        }
    }
    
    Write-Host "  Done: @globul-cars/$package" -ForegroundColor Green
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Update Complete!" -ForegroundColor Green
Write-Host "Total files processed: $totalFiles" -ForegroundColor Cyan
Write-Host "Files updated: $updatedFiles" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan

