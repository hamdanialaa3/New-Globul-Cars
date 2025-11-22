@echo off
echo ========================================
echo Creating Symlink for @globul-cars
echo ========================================
echo.

cd /d "%~dp0bulgarian-car-marketplace\node_modules"

if exist "@globul-cars" (
    echo Removing existing symlink/directory...
    rmdir /s /q "@globul-cars" 2>nul
)

echo Creating symlink...
mklink /D "@globul-cars" "..\..\packages"

if %ERRORLEVEL% EQU 0 (
    echo.
    echo ✅ SUCCESS! Symlink created!
    echo.
    echo Location: bulgarian-car-marketplace\node_modules\@globul-cars
    echo Target:   packages
    echo.
    echo 🚀 Now restart your dev server: npm start
) else (
    echo.
    echo ❌ FAILED! You need to run this as Administrator
    echo.
    echo Right-click this file and select "Run as administrator"
)

echo.
pause

