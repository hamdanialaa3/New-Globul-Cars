@echo off
REM Create Symlinks for @globul-cars packages
REM يجب تشغيل هذا الملف كمسؤول (Run as Administrator)

echo ========================================
echo Creating Symlinks for @globul-cars
echo ========================================
echo.

REM التحقق من الصلاحيات
net session >nul 2>&1
if %errorLevel% neq 0 (
    echo ❌ ERROR: يجب تشغيل هذا الملف كمسؤول (Run as Administrator)
    echo.
    echo Right-click on this file and select "Run as administrator"
    pause
    exit /b 1
)

cd bulgarian-car-marketplace\node_modules

REM حذف symlink موجود (إن وجد)
if exist "@globul-cars" (
    echo 🗑️  Removing existing symlink...
    rmdir "@globul-cars" 2>nul
)

REM إنشاء symlink جديد
echo 🔗 Creating symlink: @globul-cars -> ..\..\packages
mklink /D "@globul-cars" "..\..\packages"

if %errorLevel% equ 0 (
    echo.
    echo ✅ Symlink created successfully!
    echo.
    echo 📁 Location: bulgarian-car-marketplace\node_modules\@globul-cars
    echo 📁 Target: ..\..\packages
    echo.
    echo 🚀 You can now restart the dev server with: npm start
) else (
    echo.
    echo ❌ Failed to create symlink
    echo Make sure you're running as Administrator
)

echo.
pause

