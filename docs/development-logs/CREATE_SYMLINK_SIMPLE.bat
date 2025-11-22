@echo off
echo ========================================
echo Create Symlink for @globul-cars
echo ========================================
echo.
echo IMPORTANT: Run this file as Administrator!
echo.
pause

cd /d "%~dp0bulgarian-car-marketplace\node_modules"

if exist "@globul-cars" (
    echo Removing existing symlink...
    rmdir "@globul-cars"
)

echo Creating symlink...
mklink /D "@globul-cars" "..\..\packages"

if %errorLevel% equ 0 (
    echo.
    echo ✅ SUCCESS! Symlink created!
    echo.
    echo Now restart: npm start
) else (
    echo.
    echo ❌ FAILED! You must run as Administrator!
    echo.
    echo Right-click this file → Run as administrator
)

pause

