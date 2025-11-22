# Create Symlink for @globul-cars packages
# يجب تشغيل هذا الملف كمسؤول

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Creating Symlink for @globul-cars" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# التحقق من الصلاحيات
$isAdmin = ([Security.Principal.WindowsPrincipal] [Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)

if (-not $isAdmin) {
    Write-Host "❌ ERROR: يجب تشغيل هذا الملف كمسؤول (Run as Administrator)" -ForegroundColor Red
    Write-Host ""
    Write-Host "Right-click on this file and select 'Run with PowerShell' as Administrator" -ForegroundColor Yellow
    Read-Host "Press Enter to exit"
    exit 1
}

$basePath = Split-Path -Parent $PSScriptRoot
$nodeModulesPath = Join-Path $basePath "bulgarian-car-marketplace\node_modules"
$symlinkPath = Join-Path $nodeModulesPath "@globul-cars"
$targetPath = Join-Path $basePath "packages"

# التحقق من وجود node_modules
if (-not (Test-Path $nodeModulesPath)) {
    Write-Host "❌ ERROR: node_modules directory not found" -ForegroundColor Red
    Write-Host "Path: $nodeModulesPath" -ForegroundColor Yellow
    Write-Host "Please run 'npm install' first" -ForegroundColor Yellow
    Read-Host "Press Enter to exit"
    exit 1
}

# التحقق من وجود packages
if (-not (Test-Path $targetPath)) {
    Write-Host "❌ ERROR: packages directory not found" -ForegroundColor Red
    Write-Host "Path: $targetPath" -ForegroundColor Yellow
    Read-Host "Press Enter to exit"
    exit 1
}

# حذف symlink موجود (إن وجد)
if (Test-Path $symlinkPath) {
    Write-Host "🗑️  Removing existing symlink..." -ForegroundColor Yellow
    Remove-Item -Path $symlinkPath -Force -ErrorAction SilentlyContinue
}

# إنشاء symlink جديد
Write-Host "🔗 Creating symlink..." -ForegroundColor Yellow
Write-Host "   From: $symlinkPath" -ForegroundColor Gray
Write-Host "   To:   $targetPath" -ForegroundColor Gray
Write-Host ""

try {
    New-Item -ItemType SymbolicLink -Path $symlinkPath -Target $targetPath -Force | Out-Null
    
    Write-Host "✅ SUCCESS! Symlink created successfully!" -ForegroundColor Green
    Write-Host ""
    Write-Host "📁 Location: $symlinkPath" -ForegroundColor Cyan
    Write-Host "📁 Target:   $targetPath" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "🚀 Next step: Restart the dev server with: npm start" -ForegroundColor Green
    Write-Host ""
    
    # التحقق من Symlink
    $linkInfo = Get-Item $symlinkPath -ErrorAction SilentlyContinue
    if ($linkInfo) {
        Write-Host "✅ Symlink verified successfully!" -ForegroundColor Green
    }
} catch {
    Write-Host ""
    Write-Host "❌ FAILED to create symlink" -ForegroundColor Red
    Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host ""
    Write-Host "Make sure you're running as Administrator" -ForegroundColor Yellow
}

Write-Host ""
Read-Host "Press Enter to exit"

