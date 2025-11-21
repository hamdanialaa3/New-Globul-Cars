@echo off
echo ========================================
echo Creating Symlink for @globul-cars
echo ========================================
echo.

cd /d "%~dp0bulgarian-car-marketplace\node_modules"

if not exist "@globul-cars" (
    echo Creating symlink...
    mklink /D "@globul-cars" "..\..\packages"
    if %errorLevel% equ 0 (
        echo.
        echo ✅ Symlink created successfully!
        echo.
        echo 📁 Location: bulgarian-car-marketplace\node_modules\@globul-cars
        echo 📁 Target: ..\..\packages
    ) else (
        echo.
        echo ❌ Failed to create symlink
        echo.
        echo ⚠️  IMPORTANT: You must run this file as Administrator!
        echo Right-click and select "Run as administrator"
    )
) else (
    echo ℹ️  Symlink already exists
    echo.
    echo To recreate it, delete it first:
    echo   rmdir "@globul-cars"
)

echo.
pause

