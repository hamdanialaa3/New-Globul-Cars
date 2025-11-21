@echo off
REM Quick Fix - Create Symlink for @globul-cars
REM يجب تشغيل هذا الملف كمسؤول

echo ========================================
echo Quick Fix - Create Symlink
echo ========================================
echo.

REM التحقق من الصلاحيات
net session >nul 2>&1
if %errorLevel% neq 0 (
    echo.
    echo ❌ ERROR: يجب تشغيل هذا الملف كمسؤول
    echo.
    echo Right-click on this file and select "Run as administrator"
    echo.
    pause
    exit /b 1
)

cd /d "%~dp0bulgarian-car-marketplace\node_modules"

REM حذف symlink موجود
if exist "@globul-cars" (
    echo 🗑️  Removing existing symlink...
    rmdir "@globul-cars" 2>nul
)

REM إنشاء symlink جديد
echo 🔗 Creating symlink...
mklink /D "@globul-cars" "..\..\packages"

if %errorLevel% equ 0 (
    echo.
    echo ✅ SUCCESS! Symlink created successfully!
    echo.
    echo 📁 Location: bulgarian-car-marketplace\node_modules\@globul-cars
    echo 📁 Target: ..\..\packages
    echo.
    echo 🚀 Next step: Restart the dev server with: npm start
    echo.
) else (
    echo.
    echo ❌ FAILED to create symlink
    echo.
    echo Make sure you're running as Administrator
    echo.
)

pause

