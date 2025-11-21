@echo off
REM Create Symlink for @globul-cars packages
REM This bypasses ModuleScopePlugin by making packages appear as node_modules

echo ========================================
echo Creating Symlink for @globul-cars
echo ========================================
echo.

cd /d "%~dp0bulgarian-car-marketplace\node_modules"

REM Check if symlink already exists
if exist "@globul-cars" (
    echo Removing existing symlink/directory...
    rmdir /s /q "@globul-cars" 2>nul
    if %ERRORLEVEL% NEQ 0 (
        echo Warning: Could not remove existing @globul-cars
        echo Please delete it manually and try again
        pause
        exit /b 1
    )
)

echo Creating symlink...
echo From: %CD%\@globul-cars
echo To:   ..\..\packages
echo.

mklink /D "@globul-cars" "..\..\packages"

if %ERRORLEVEL% EQU 0 (
    echo.
    echo ========================================
    echo ✅ SUCCESS! Symlink created!
    echo ========================================
    echo.
    echo Location: bulgarian-car-marketplace\node_modules\@globul-cars
    echo Target:   packages
    echo.
    echo 🚀 Now restart your dev server: npm start
    echo.
) else (
    echo.
    echo ========================================
    echo ❌ FAILED! You need Administrator privileges
    echo ========================================
    echo.
    echo Right-click this file and select "Run as administrator"
    echo.
    echo Or run this command manually in CMD as Admin:
    echo   cd "%~dp0bulgarian-car-marketplace\node_modules"
    echo   mklink /D "@globul-cars" "..\..\packages"
    echo.
)

pause

