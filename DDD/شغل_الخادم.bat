@echo off
chcp 65001 >nul
cls
echo.
echo ╔════════════════════════════════════════════╗
echo ║   🚀 تشغيل خادم Bulgarian Car Marketplace   ║
echo ╔════════════════════════════════════════════╗
echo.
echo [1/5] الدخول للمجلد الصحيح...
cd /d "%~dp0bulgarian-car-marketplace"

echo [2/5] إيقاف Node القديم...
taskkill /F /IM node.exe /T >nul 2>&1

echo [3/5] الانتظار...
timeout /t 3 /nobreak >nul

echo [4/5] تنظيف الكاش...
if exist "node_modules\.cache" (
    rmdir /S /Q "node_modules\.cache" >nul 2>&1
)

echo [5/5] بدء الخادم...
echo.
echo ════════════════════════════════════════════
echo   انتظر 60 ثانية ثم افتح المتصفح
echo   http://localhost:3000/profile/settings
echo ════════════════════════════════════════════
echo.

npm start

