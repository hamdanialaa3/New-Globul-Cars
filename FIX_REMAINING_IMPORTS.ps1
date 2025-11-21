# Fix Remaining @/ Imports - إصلاح الـ imports المتبقية
$ErrorActionPreference = "Continue"
$projectRoot = Get-Location
$packagesRoot = Join-Path $projectRoot "packages"

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Fix Remaining @/ Imports" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Mapping of @/ paths to @globul-cars packages
$importMappings = @{
    "@/firebase/firebase-config" = "@globul-cars/services"
    "@/firebase" = "@globul-cars/services"
    "@/firebase/index" = "@globul-cars/services"
    "@/firebase/social-auth-service" = "@globul-cars/services"
    "@/data/dropdown-options" = "@globul-cars/core/constants/dropdown-options"
    "@/data/bulgaria-locations" = "@globul-cars/core/constants/bulgaria-locations"
    "@/data/car-brands-structured.json" = "@globul-cars/core/constants/car-brands-structured.json"
    "@/data/car-makes-models" = "@globul-cars/core/constants/car-makes-models"
    "@/config/ai-tiers.config" = "@globul-cars/core/config/ai-tiers.config"
    "@/config/users-directory.config" = "@globul-cars/core/config/users-directory.config"
    "@/styles/mobile-design-system" = "@globul-cars/ui/styles/mobile-design-system"
    "@/pages/03_user-pages/profile/ProfilePage/types" = "@globul-cars/profile/types"
    "@/pages/03_user-pages/profile/ProfilePage/hooks/useProfile" = "@globul-cars/profile/hooks/useProfile"
    "@/pages/05_search-browse/advanced-search/AdvancedSearchPage/types" = "@globul-cars/cars/types"
    "@/assets/icons" = "../../bulgarian-car-marketplace/src/assets/icons"
    "@/repositories/DealershipRepository" = "@globul-cars/services"
}

# Function to update imports in a file
function Update-FileImports {
    param([string]$FilePath)
    
    if (-not (Test-Path $FilePath)) {
        return $false
    }
    
    try {
        $content = Get-Content $FilePath -Raw -Encoding UTF8
        $originalContent = $content
        
        # Apply all mappings
        foreach ($oldPath in $importMappings.Keys) {
            $newPath = $importMappings[$oldPath]
            # Match: from '@/path' or from "@/path"
            $pattern = "from ['\`"]$([regex]::Escape($oldPath))['\`"]"
            $replacement = "from '$newPath'"
            $content = $content -replace $pattern, $replacement
        }
        
        # Fix broken imports (missing slashes)
        $content = $content -replace "from ['\`"]@globul-cars/ui/components([A-Z][a-zA-Z]+)['\`"]", "from '@globul-cars/ui/components/`$1'"
        $content = $content -replace "from ['\`"]@globul-cars/core/contexts([A-Z][a-zA-Z]+)['\`"]", "from '@globul-cars/core/contexts/`$1'"
        $content = $content -replace "from ['\`"]@globul-cars/core([a-z][a-zA-Z]+)['\`"]", "from '@globul-cars/core/`$1'"
        
        if ($content -ne $originalContent) {
            Set-Content -Path $FilePath -Value $content -Encoding UTF8 -NoNewline
            return $true
        }
        
        return $false
    } catch {
        Write-Host "  Error in $FilePath : $_" -ForegroundColor Red
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
    
    $files = Get-ChildItem -Path $packagePath -Recurse -Include "*.ts", "*.tsx" -ErrorAction SilentlyContinue | Where-Object {
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

# Count remaining @/ imports
Write-Host ""
Write-Host "Checking for remaining @/ imports..." -ForegroundColor Yellow
$remainingFiles = Get-ChildItem -Path $packagesRoot -Recurse -Include "*.ts", "*.tsx" -ErrorAction SilentlyContinue | Where-Object {
    $_.FullName -notmatch "node_modules|\.d\.ts$|\.test\.|\.spec\.|\\dist\\"
} | Select-String -Pattern "from ['\`"]@/" -ErrorAction SilentlyContinue

if ($remainingFiles) {
    Write-Host "Found $($remainingFiles.Count) remaining @/ imports:" -ForegroundColor Yellow
    $remainingFiles | Select-Object -First 10 | ForEach-Object {
        Write-Host "  $($_.Path):$($_.LineNumber) - $($_.Line.Trim())" -ForegroundColor Gray
    }
    if ($remainingFiles.Count -gt 10) {
        Write-Host "  ... and $($remainingFiles.Count - 10) more" -ForegroundColor Gray
    }
} else {
    Write-Host "No remaining @/ imports found!" -ForegroundColor Green
}

