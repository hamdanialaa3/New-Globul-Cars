# Comprehensive Review Script - مراجعة شاملة
$ErrorActionPreference = "Continue"
$projectRoot = Get-Location

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Comprehensive Migration Review" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# 1. Check for duplicate files
Write-Host "1. Checking for duplicate files..." -ForegroundColor Yellow
$originalSrc = Join-Path $projectRoot "bulgarian-car-marketplace\src"
$packagesRoot = Join-Path $projectRoot "packages"

if (Test-Path $originalSrc) {
    $originalFiles = Get-ChildItem -Path $originalSrc -Recurse -File -Include "*.ts", "*.tsx" | Where-Object {
        $_.FullName -notmatch "node_modules|\.d\.ts$|\.test\.|\.spec\.|\\dist\\"
    }
    
    $packageFiles = Get-ChildItem -Path $packagesRoot -Recurse -File -Include "*.ts", "*.tsx" | Where-Object {
        $_.FullName -notmatch "node_modules|\.d\.ts$|\.test\.|\.spec\.|\\dist\\"
    }
    
    Write-Host "   Original files: $($originalFiles.Count)" -ForegroundColor Gray
    Write-Host "   Package files: $($packageFiles.Count)" -ForegroundColor Gray
}

# 2. Check for old imports
Write-Host ""
Write-Host "2. Checking for old imports..." -ForegroundColor Yellow
$oldImports = Get-ChildItem -Path $packagesRoot -Recurse -File -Include "*.ts", "*.tsx" -ErrorAction SilentlyContinue | Where-Object {
    $_.FullName -notmatch "node_modules|\.d\.ts$|\.test\.|\.spec\.|\\dist\\"
} | Select-String -Pattern "from ['\`"]@/|from ['\`"]\.\./\.\./\.\./\.\./|from ['\`"]\.\./\.\./\.\./services|from ['\`"]\.\./\.\./\.\./hooks|from ['\`"]\.\./\.\./\.\./components" -ErrorAction SilentlyContinue

if ($oldImports) {
    Write-Host "   Found $($oldImports.Count) files with old imports:" -ForegroundColor Red
    $oldImports | Select-Object -First 10 | ForEach-Object {
        Write-Host "     $($_.Path):$($_.LineNumber)" -ForegroundColor Gray
    }
} else {
    Write-Host "   ✓ No old imports found" -ForegroundColor Green
}

# 3. Check package.json files
Write-Host ""
Write-Host "3. Checking package.json files..." -ForegroundColor Yellow
$packages = @("core", "services", "ui", "auth", "cars", "profile", "app", "admin", "social", "messaging", "payments", "iot")
$missingPackages = @()

foreach ($package in $packages) {
    $packagePath = Join-Path $packagesRoot $package
    $packageJson = Join-Path $packagePath "package.json"
    
    if (Test-Path $packagePath) {
        if (Test-Path $packageJson) {
            Write-Host "   ✓ $package/package.json exists" -ForegroundColor Green
        } else {
            Write-Host "   ✗ $package/package.json missing" -ForegroundColor Red
            $missingPackages += $package
        }
    }
}

# 4. Check tsconfig.json files
Write-Host ""
Write-Host "4. Checking tsconfig.json files..." -ForegroundColor Yellow
foreach ($package in $packages) {
    $packagePath = Join-Path $packagesRoot $package
    $tsconfig = Join-Path $packagePath "tsconfig.json"
    
    if (Test-Path $packagePath) {
        if (Test-Path $tsconfig) {
            Write-Host "   ✓ $package/tsconfig.json exists" -ForegroundColor Green
        } else {
            Write-Host "   ✗ $package/tsconfig.json missing" -ForegroundColor Red
        }
    }
}

# 5. Check index.ts exports
Write-Host ""
Write-Host "5. Checking index.ts exports..." -ForegroundColor Yellow
foreach ($package in $packages) {
    $packagePath = Join-Path $packagesRoot $package
    $indexFile = Join-Path $packagePath "src\index.ts"
    
    if (Test-Path $indexFile) {
        Write-Host "   ✓ $package/src/index.ts exists" -ForegroundColor Green
    } else {
        Write-Host "   ⚠ $package/src/index.ts missing" -ForegroundColor Yellow
    }
}

# 6. Count files per package
Write-Host ""
Write-Host "6. File count per package..." -ForegroundColor Yellow
foreach ($package in $packages) {
    $packagePath = Join-Path $packagesRoot $package
    if (Test-Path $packagePath) {
        $files = Get-ChildItem -Path $packagePath -Recurse -File -Include "*.ts", "*.tsx" -ErrorAction SilentlyContinue | Where-Object {
            $_.FullName -notmatch "node_modules|\.d\.ts$|\.test\.|\.spec\.|\\dist\\"
        }
        Write-Host "   $package : $($files.Count) files" -ForegroundColor Cyan
    }
}

# 7. Check for broken imports (missing @globul-cars paths)
Write-Host ""
Write-Host "7. Checking for broken @globul-cars imports..." -ForegroundColor Yellow
$brokenImports = Get-ChildItem -Path $packagesRoot -Recurse -File -Include "*.ts", "*.tsx" -ErrorAction SilentlyContinue | Where-Object {
    $_.FullName -notmatch "node_modules|\.d\.ts$|\.test\.|\.spec\.|\\dist\\"
} | Select-String -Pattern "from ['\`"]@globul-cars/[^'\`"]*['\`"]" -ErrorAction SilentlyContinue | Where-Object {
    $_.Line -match "@globul-cars/[^/]+[^/'\`"]" -and $_.Line -notmatch "@globul-cars/(core|services|ui|auth|cars|profile|app|admin|social|messaging|payments|iot)/"
}

if ($brokenImports) {
    Write-Host "   Found $($brokenImports.Count) potentially broken imports:" -ForegroundColor Red
    $brokenImports | Select-Object -First 5 | ForEach-Object {
        Write-Host "     $($_.Path):$($_.LineNumber) - $($_.Line.Trim())" -ForegroundColor Gray
    }
} else {
    Write-Host "   ✓ No broken imports found" -ForegroundColor Green
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Review Complete!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan

