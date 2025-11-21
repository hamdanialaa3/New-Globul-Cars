@echo off
REM Run PowerShell script as Administrator
REM تشغيل ملف PowerShell كمسؤول

echo ========================================
echo Creating Symlink for @globul-cars
echo ========================================
echo.
echo This will open PowerShell as Administrator...
echo.

powershell -Command "Start-Process powershell -Verb RunAs -ArgumentList '-NoProfile -ExecutionPolicy Bypass -File \"%~dp0CREATE_SYMLINK.ps1\"'"

