@echo off
chcp 65001 >nul
cls
echo ╔════════════════════════════════════════════════════════════╗
echo ║                                                            ║
echo ║   🧹 تنظيف كاشات وذاكرة Cursor البسيطة 🧹                ║
echo ║                                                            ║
echo ╚════════════════════════════════════════════════════════════╝
echo.

cd /d "%~dp0"

powershell.exe -ExecutionPolicy Bypass -File "%~dp0CLEAN_CURSOR_CACHE.ps1"

echo.
pause


