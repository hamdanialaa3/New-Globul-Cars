@echo off
REM Quick Symlink Creation Script
REM Run this as Administrator

echo ========================================
echo Creating Symlink for @globul-cars
echo ========================================
echo.

cd /d "%~dp0bulgarian-car-marketplace\node_modules"

if exist "@globul-cars" (
    echo Removing existing @globul-cars...
    rmdir /s /q "@globul-cars" 2>nul
)

echo Creating symlink...
mklink /D "@globul-cars" "..\..\packages"

if %ERRORLEVEL% EQU 0 (
    echo.
    echo ✅ SUCCESS! Symlink created!
    echo.
    echo Now restart: npm start
) else (
    echo.
    echo ❌ FAILED! Run as Administrator
    echo.
    echo Right-click this file → Run as administrator
)

pause

