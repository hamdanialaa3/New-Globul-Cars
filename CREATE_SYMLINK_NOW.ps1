# Create Symlink for @globul-cars packages
# This script MUST be run as Administrator

$ErrorActionPreference = "Stop"

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Creating Symlink for @globul-cars" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Check if running as Administrator
$isAdmin = ([Security.Principal.WindowsPrincipal] [Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)

if (-not $isAdmin) {
    Write-Host "❌ ERROR: This script must be run as Administrator!" -ForegroundColor Red
    Write-Host ""
    Write-Host "Right-click on this file and select 'Run with PowerShell' as Administrator" -ForegroundColor Yellow
    Write-Host ""
    Read-Host "Press Enter to exit"
    exit 1
}

# Define paths
$projectRoot = Split-Path -Parent $PSScriptRoot
$nodeModulesPath = Join-Path $projectRoot "bulgarian-car-marketplace\node_modules"
$symlinkPath = Join-Path $nodeModulesPath "@globul-cars"
$targetPath = Join-Path $projectRoot "packages"

Write-Host "Project Root: $projectRoot" -ForegroundColor Gray
Write-Host "Node Modules: $nodeModulesPath" -ForegroundColor Gray
Write-Host "Symlink Path: $symlinkPath" -ForegroundColor Gray
Write-Host "Target Path: $targetPath" -ForegroundColor Gray
Write-Host ""

# Check if node_modules exists
if (-not (Test-Path $nodeModulesPath)) {
    Write-Host "❌ ERROR: node_modules directory not found!" -ForegroundColor Red
    Write-Host "Path: $nodeModulesPath" -ForegroundColor Yellow
    Write-Host "Please run 'npm install' first" -ForegroundColor Yellow
    Read-Host "Press Enter to exit"
    exit 1
}

# Check if packages exists
if (-not (Test-Path $targetPath)) {
    Write-Host "❌ ERROR: packages directory not found!" -ForegroundColor Red
    Write-Host "Path: $targetPath" -ForegroundColor Yellow
    Read-Host "Press Enter to exit"
    exit 1
}

# Remove existing symlink or directory
if (Test-Path $symlinkPath) {
    Write-Host "🗑️  Removing existing symlink/directory..." -ForegroundColor Yellow
    
    $item = Get-Item $symlinkPath -Force
    if ($item.LinkType -eq "SymbolicLink") {
        Remove-Item $symlinkPath -Force
        Write-Host "✅ Existing symlink removed" -ForegroundColor Green
    } else {
        Remove-Item $symlinkPath -Recurse -Force
        Write-Host "✅ Existing directory removed" -ForegroundColor Green
    }
}

# Create symlink
Write-Host ""
Write-Host "🔗 Creating symlink..." -ForegroundColor Yellow
Write-Host "   From: $symlinkPath" -ForegroundColor Gray
Write-Host "   To:   $targetPath" -ForegroundColor Gray
Write-Host ""

try {
    # Use absolute paths for better reliability
    $absoluteTarget = (Resolve-Path $targetPath).Path
    $absoluteSymlink = $symlinkPath
    
    New-Item -ItemType SymbolicLink -Path $absoluteSymlink -Target $absoluteTarget -Force | Out-Null
    
    Write-Host "✅ SUCCESS! Symlink created successfully!" -ForegroundColor Green
    Write-Host ""
    
    # Verify symlink
    $linkInfo = Get-Item $symlinkPath -Force
    if ($linkInfo.LinkType -eq "SymbolicLink") {
        Write-Host "✅ Symlink verified:" -ForegroundColor Green
        Write-Host "   Type: $($linkInfo.LinkType)" -ForegroundColor Gray
        Write-Host "   Target: $($linkInfo.Target)" -ForegroundColor Gray
    }
    
    Write-Host ""
    Write-Host "🚀 Next step: Restart your dev server with: npm start" -ForegroundColor Green
    Write-Host ""
    
} catch {
    Write-Host ""
    Write-Host "❌ FAILED to create symlink" -ForegroundColor Red
    Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host ""
    Write-Host "Try running this command manually in PowerShell (as Admin):" -ForegroundColor Yellow
    Write-Host "  New-Item -ItemType SymbolicLink -Path '$symlinkPath' -Target '$targetPath' -Force" -ForegroundColor Gray
    Write-Host ""
    Read-Host "Press Enter to exit"
    exit 1
}

Write-Host "✅ Process completed successfully!" -ForegroundColor Green
Write-Host ""
Read-Host "Press Enter to exit"

