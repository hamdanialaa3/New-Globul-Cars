# Restore Checkpoint - 20 نوفمبر 2025
# Run: powershell -ExecutionPolicy Bypass -File RESTORE_CHECKPOINT_NOV20_2025.ps1

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Restore Checkpoint - 20 نوفمبر 2025" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Check if git is available
if (-not (Get-Command git -ErrorAction SilentlyContinue)) {
    Write-Host "❌ Git is not installed or not in PATH" -ForegroundColor Red
    exit 1
}

# Get current directory
$projectRoot = Get-Location
Write-Host "Project Root: $projectRoot" -ForegroundColor Yellow
Write-Host ""

# Check git status
Write-Host "Checking git status..." -ForegroundColor Cyan
$gitStatus = git status --porcelain
if ($gitStatus) {
    Write-Host "⚠️  Warning: You have uncommitted changes!" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Uncommitted files:" -ForegroundColor Yellow
    $gitStatus | ForEach-Object { Write-Host "  $_" -ForegroundColor Gray }
    Write-Host ""
    $response = Read-Host "Do you want to stash these changes? (y/n)"
    if ($response -eq "y" -or $response -eq "Y") {
        Write-Host "Stashing changes..." -ForegroundColor Yellow
        git stash push -m "CHECKPOINT_NOV20_2025_BACKUP_$(Get-Date -Format 'yyyyMMdd_HHmmss')"
        Write-Host "✅ Changes stashed" -ForegroundColor Green
    } else {
        Write-Host "⚠️  Proceeding without stashing..." -ForegroundColor Yellow
    }
}

# Check if checkpoint commit exists
Write-Host ""
Write-Host "Looking for checkpoint commit..." -ForegroundColor Cyan
$checkpointCommit = git log --oneline --all --grep="CHECKPOINT_NOV20_2025" | Select-Object -First 1

if ($checkpointCommit) {
    Write-Host "✅ Found checkpoint commit: $checkpointCommit" -ForegroundColor Green
    Write-Host ""
    $response = Read-Host "Do you want to reset to this commit? (y/n)"
    if ($response -eq "y" -or $response -eq "Y") {
        $commitHash = ($checkpointCommit -split ' ')[0]
        Write-Host "Resetting to commit: $commitHash" -ForegroundColor Yellow
        git reset --hard $commitHash
        Write-Host "✅ Reset complete" -ForegroundColor Green
    } else {
        Write-Host "❌ Reset cancelled" -ForegroundColor Red
        exit 0
    }
} else {
    Write-Host "⚠️  No checkpoint commit found" -ForegroundColor Yellow
    Write-Host "This script will help you restore from backup if available" -ForegroundColor Yellow
}

# Restore node_modules if needed
Write-Host ""
Write-Host "Checking node_modules..." -ForegroundColor Cyan
if (-not (Test-Path "node_modules")) {
    Write-Host "⚠️  node_modules not found. Installing..." -ForegroundColor Yellow
    npm install
    Write-Host "✅ node_modules installed" -ForegroundColor Green
} else {
    Write-Host "✅ node_modules exists" -ForegroundColor Green
}

# Check packages
Write-Host ""
Write-Host "Checking packages..." -ForegroundColor Cyan
if (Test-Path "packages") {
    Write-Host "✅ packages directory exists" -ForegroundColor Green
    Get-ChildItem -Path "packages" -Directory | ForEach-Object {
        $packagePath = Join-Path $_.FullName "node_modules"
        if (-not (Test-Path $packagePath)) {
            Write-Host "  Installing dependencies for $($_.Name)..." -ForegroundColor Yellow
            Set-Location $_.FullName
            npm install
            Set-Location $projectRoot
        }
    }
} else {
    Write-Host "⚠️  packages directory not found" -ForegroundColor Yellow
}

# Verify critical files
Write-Host ""
Write-Host "Verifying critical files..." -ForegroundColor Cyan
$criticalFiles = @(
    "package.json",
    "bulgarian-car-marketplace/src/App.tsx",
    "bulgarian-car-marketplace/src/index.tsx",
    "firebase.json",
    "firestore.rules"
)

$allFilesExist = $true
foreach ($file in $criticalFiles) {
    if (Test-Path $file) {
        Write-Host "  ✅ $file" -ForegroundColor Green
    } else {
        Write-Host "  ❌ $file - MISSING!" -ForegroundColor Red
        $allFilesExist = $false
    }
}

if (-not $allFilesExist) {
    Write-Host ""
    Write-Host "❌ Some critical files are missing!" -ForegroundColor Red
    Write-Host "Please check your backup or git repository" -ForegroundColor Yellow
    exit 1
}

# Final summary
Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "✅ Checkpoint Restore Complete!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host "1. Run: npm install (if needed)" -ForegroundColor White
Write-Host "2. Run: npm run dev (to start dev server)" -ForegroundColor White
Write-Host "3. Check: http://localhost:3000" -ForegroundColor White
Write-Host ""

