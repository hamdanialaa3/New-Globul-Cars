# Create Symlinks for @globul-cars packages
# يجب تشغيل هذا الملف كمسؤول (Run as Administrator)

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Creating Symlinks for @globul-cars" -ForegroundColor Cyan
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

$nodeModulesPath = "bulgarian-car-marketplace\node_modules"
$symlinkPath = Join-Path $nodeModulesPath "@globul-cars"
$targetPath = "..\..\packages"

# التحقق من وجود node_modules
if (-not (Test-Path $nodeModulesPath)) {
    Write-Host "❌ ERROR: node_modules directory not found" -ForegroundColor Red
    Write-Host "Please run 'npm install' first" -ForegroundColor Yellow
    Read-Host "Press Enter to exit"
    exit 1
}

# حذف symlink موجود (إن وجد)
if (Test-Path $symlinkPath) {
    Write-Host "🗑️  Removing existing symlink..." -ForegroundColor Yellow
    Remove-Item -Path $symlinkPath -Force -ErrorAction SilentlyContinue
}

# إنشاء symlink جديد
Write-Host "🔗 Creating symlink: @globul-cars -> $targetPath" -ForegroundColor Yellow

try {
    $absoluteTarget = Resolve-Path $targetPath -ErrorAction Stop
    New-Item -ItemType SymbolicLink -Path $symlinkPath -Target $absoluteTarget -Force | Out-Null
    
    Write-Host ""
    Write-Host "✅ Symlink created successfully!" -ForegroundColor Green
    Write-Host ""
    Write-Host "📁 Location: $symlinkPath" -ForegroundColor Cyan
    Write-Host "📁 Target: $absoluteTarget" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "🚀 You can now restart the dev server with: npm start" -ForegroundColor Green
} catch {
    Write-Host ""
    Write-Host "❌ Failed to create symlink: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "Make sure you're running as Administrator" -ForegroundColor Yellow
}

Write-Host ""
Read-Host "Press Enter to exit"

