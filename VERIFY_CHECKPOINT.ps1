# Verify Checkpoint - 20 نوفمبر 2025
# Run: powershell -ExecutionPolicy Bypass -File VERIFY_CHECKPOINT.ps1

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Verify Checkpoint - 20 نوفمبر 2025" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

$projectRoot = Get-Location
$errors = 0
$warnings = 0

# Critical files to check
$criticalFiles = @(
    @{Path="package.json"; Description="Root package.json"},
    @{Path="bulgarian-car-marketplace/src/App.tsx"; Description="Main App.tsx"},
    @{Path="bulgarian-car-marketplace/src/index.tsx"; Description="Entry point"},
    @{Path="packages/core/src/constants/carData_static.ts"; Description="Car data"},
    @{Path="packages/core/src/locales/translations.ts"; Description="Translations"},
    @{Path="firebase.json"; Description="Firebase config"},
    @{Path="firestore.rules"; Description="Firestore rules"}
)

Write-Host "Checking critical files..." -ForegroundColor Cyan
foreach ($file in $criticalFiles) {
    $fullPath = Join-Path $projectRoot $file.Path
    if (Test-Path $fullPath) {
        $size = (Get-Item $fullPath).Length
        Write-Host "  ✅ $($file.Description) ($([math]::Round($size/1KB, 2)) KB)" -ForegroundColor Green
    } else {
        Write-Host "  ❌ $($file.Description) - MISSING!" -ForegroundColor Red
        $errors++
    }
}

# Check packages
Write-Host ""
Write-Host "Checking packages..." -ForegroundColor Cyan
$packages = @("core", "services", "ui", "auth", "cars", "profile", "app", "admin", "social", "messaging", "payments", "iot")
foreach ($package in $packages) {
    $packagePath = Join-Path $projectRoot "packages\$package"
    $packageJson = Join-Path $packagePath "package.json"
    $srcIndex = Join-Path $packagePath "src\index.ts"
    
    if (Test-Path $packagePath) {
        if (Test-Path $packageJson) {
            Write-Host "  ✅ @globul-cars/$package" -ForegroundColor Green
        } else {
            Write-Host "  ⚠️  @globul-cars/$package - package.json missing" -ForegroundColor Yellow
            $warnings++
        }
    } else {
        Write-Host "  ❌ @globul-cars/$package - directory missing" -ForegroundColor Red
        $errors++
    }
}

# Check node_modules
Write-Host ""
Write-Host "Checking dependencies..." -ForegroundColor Cyan
$nodeModules = Join-Path $projectRoot "node_modules"
if (Test-Path $nodeModules) {
    Write-Host "  ✅ Root node_modules exists" -ForegroundColor Green
} else {
    Write-Host "  ⚠️  Root node_modules missing (run: npm install)" -ForegroundColor Yellow
    $warnings++
}

# Check git
Write-Host ""
Write-Host "Checking git status..." -ForegroundColor Cyan
if (Get-Command git -ErrorAction SilentlyContinue) {
    $gitStatus = git status --porcelain
    if ($gitStatus) {
        Write-Host "  ⚠️  Uncommitted changes detected" -ForegroundColor Yellow
        $warnings++
    } else {
        Write-Host "  ✅ Git working directory clean" -ForegroundColor Green
    }
    
    $lastCommit = git log --oneline -1
    if ($lastCommit) {
        Write-Host "  ✅ Last commit: $lastCommit" -ForegroundColor Green
    }
} else {
    Write-Host "  ⚠️  Git not found" -ForegroundColor Yellow
    $warnings++
}

# Summary
Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
if ($errors -eq 0 -and $warnings -eq 0) {
    Write-Host "✅ Checkpoint verification PASSED!" -ForegroundColor Green
} elseif ($errors -eq 0) {
    Write-Host "⚠️  Checkpoint verification PASSED with warnings" -ForegroundColor Yellow
    Write-Host "   Warnings: $warnings" -ForegroundColor Yellow
} else {
    Write-Host "❌ Checkpoint verification FAILED!" -ForegroundColor Red
    Write-Host "   Errors: $errors" -ForegroundColor Red
    Write-Host "   Warnings: $warnings" -ForegroundColor Yellow
}
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

if ($errors -gt 0) {
    exit 1
} else {
    exit 0
}

