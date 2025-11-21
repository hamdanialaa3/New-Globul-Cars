# Update All Imports - تحديث جميع الـ imports
$ErrorActionPreference = "Stop"
$projectRoot = Get-Location
$packagesRoot = Join-Path $projectRoot "packages"

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Update All Imports - تحديث جميع الـ imports" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Function to update imports in a file
function Update-FileImports {
    param([string]$FilePath)
    
    if (-not (Test-Path $FilePath)) {
        return $false
    }
    
    try {
        $content = Get-Content $FilePath -Raw -Encoding UTF8
        $originalContent = $content
        
        # Fix broken imports from previous script (missing slashes)
        $content = $content -replace "from ['\`"]@globul-cars/core/contexts([A-Z])", "from '@globul-cars/core/contexts/`$1"
        $content = $content -replace "from ['\`"]@globul-cars/ui/components([A-Z])", "from '@globul-cars/ui/components/`$1"
        $content = $content -replace "from ['\`"]@globul-cars/core([a-z])", "from '@globul-cars/core/`$1"
        
        # Update @/ imports to @globul-cars/*
        $content = $content -replace "from ['\`"]@/services/", "from '@globul-cars/services/"
        $content = $content -replace "from ['\`"]@/hooks/", "from '@globul-cars/core"
        $content = $content -replace "from ['\`"]@/contexts/", "from '@globul-cars/core/contexts"
        $content = $content -replace "from ['\`"]@/utils/", "from '@globul-cars/core/utils"
        $content = $content -replace "from ['\`"]@/types/", "from '@globul-cars/core/types"
        $content = $content -replace "from ['\`"]@/components/", "from '@globul-cars/ui/components"
        $content = $content -replace "from ['\`"]@/constants/", "from '@globul-cars/core/constants"
        $content = $content -replace "from ['\`"]@/locales/", "from '@globul-cars/core/locales"
        $content = $content -replace "from ['\`"]@/config/", "from '@globul-cars/core/config"
        
        # Update relative paths - services (multiple levels)
        $content = $content -replace "from ['\`"]\.\./\.\./\.\./\.\./services/", "from '@globul-cars/services/"
        $content = $content -replace "from ['\`"]\.\./\.\./\.\./services/", "from '@globul-cars/services/"
        $content = $content -replace "from ['\`"]\.\./\.\./services/", "from '@globul-cars/services/"
        $content = $content -replace "from ['\`"]\.\./services/", "from '@globul-cars/services/"
        $content = $content -replace "from ['\`"]\./services/", "from '@globul-cars/services/"
        
        # Update relative paths - hooks
        $content = $content -replace "from ['\`"]\.\./\.\./\.\./\.\./hooks/", "from '@globul-cars/core"
        $content = $content -replace "from ['\`"]\.\./\.\./\.\./hooks/", "from '@globul-cars/core"
        $content = $content -replace "from ['\`"]\.\./\.\./hooks/", "from '@globul-cars/core"
        $content = $content -replace "from ['\`"]\.\./hooks/", "from '@globul-cars/core"
        $content = $content -replace "from ['\`"]\./hooks/", "from '@globul-cars/core"
        
        # Update relative paths - contexts
        $content = $content -replace "from ['\`"]\.\./\.\./\.\./\.\./contexts/", "from '@globul-cars/core/contexts"
        $content = $content -replace "from ['\`"]\.\./\.\./\.\./contexts/", "from '@globul-cars/core/contexts"
        $content = $content -replace "from ['\`"]\.\./\.\./contexts/", "from '@globul-cars/core/contexts"
        $content = $content -replace "from ['\`"]\.\./contexts/", "from '@globul-cars/core/contexts"
        $content = $content -replace "from ['\`"]\./contexts/", "from '@globul-cars/core/contexts"
        
        # Update relative paths - utils
        $content = $content -replace "from ['\`"]\.\./\.\./\.\./\.\./utils/", "from '@globul-cars/core/utils"
        $content = $content -replace "from ['\`"]\.\./\.\./\.\./utils/", "from '@globul-cars/core/utils"
        $content = $content -replace "from ['\`"]\.\./\.\./utils/", "from '@globul-cars/core/utils"
        $content = $content -replace "from ['\`"]\.\./utils/", "from '@globul-cars/core/utils"
        $content = $content -replace "from ['\`"]\./utils/", "from '@globul-cars/core/utils"
        
        # Update relative paths - types
        $content = $content -replace "from ['\`"]\.\./\.\./\.\./\.\./types/", "from '@globul-cars/core/types"
        $content = $content -replace "from ['\`"]\.\./\.\./\.\./types/", "from '@globul-cars/core/types"
        $content = $content -replace "from ['\`"]\.\./\.\./types/", "from '@globul-cars/core/types"
        $content = $content -replace "from ['\`"]\.\./types/", "from '@globul-cars/core/types"
        $content = $content -replace "from ['\`"]\./types/", "from '@globul-cars/core/types"
        
        # Update relative paths - components
        $content = $content -replace "from ['\`"]\.\./\.\./\.\./\.\./components/", "from '@globul-cars/ui/components"
        $content = $content -replace "from ['\`"]\.\./\.\./\.\./components/", "from '@globul-cars/ui/components"
        $content = $content -replace "from ['\`"]\.\./\.\./components/", "from '@globul-cars/ui/components"
        $content = $content -replace "from ['\`"]\.\./components/", "from '@globul-cars/ui/components"
        $content = $content -replace "from ['\`"]\./components/", "from '@globul-cars/ui/components"
        
        # Update relative paths - constants
        $content = $content -replace "from ['\`"]\.\./\.\./\.\./\.\./constants/", "from '@globul-cars/core/constants"
        $content = $content -replace "from ['\`"]\.\./\.\./\.\./constants/", "from '@globul-cars/core/constants"
        $content = $content -replace "from ['\`"]\.\./\.\./constants/", "from '@globul-cars/core/constants"
        $content = $content -replace "from ['\`"]\.\./constants/", "from '@globul-cars/core/constants"
        $content = $content -replace "from ['\`"]\./constants/", "from '@globul-cars/core/constants"
        
        # Update specific service imports (logger-service, etc.)
        $content = $content -replace "from ['\`"]\.\./\.\./\.\./services/logger-service['\`"]", "from '@globul-cars/services'"
        $content = $content -replace "from ['\`"]\.\./\.\./services/logger-service['\`"]", "from '@globul-cars/services'"
        $content = $content -replace "from ['\`"]\.\./services/logger-service['\`"]", "from '@globul-cars/services'"
        $content = $content -replace "from ['\`"]\./services/logger-service['\`"]", "from '@globul-cars/services'"
        $content = $content -replace "from ['\`"]@/services/logger-service['\`"]", "from '@globul-cars/services'"
        
        if ($content -ne $originalContent) {
            Set-Content -Path $FilePath -Value $content -Encoding UTF8 -NoNewline
            return $true
        }
        
        return $false
    } catch {
        Write-Host "  Error: $($_.Exception.Message)" -ForegroundColor Red
        return $false
    }
}

# Process all packages
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
        $_.FullName -notmatch "\.spec\." -and
        $_.FullName -notmatch "\\dist\\"
    }
    
    $packageUpdated = 0
    foreach ($file in $files) {
        $totalFiles++
        if (Update-FileImports -FilePath $file.FullName) {
            $updatedFiles++
            $packageUpdated++
        }
    }
    
    Write-Host "  Updated $packageUpdated files in @globul-cars/$package" -ForegroundColor Green
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Update Complete!" -ForegroundColor Green
Write-Host "Total files processed: $totalFiles" -ForegroundColor Cyan
Write-Host "Files updated: $updatedFiles" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan

