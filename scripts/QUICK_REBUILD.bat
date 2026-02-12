@echo off
cls
echo.
echo ╔════════════════════════════════════════════════════════════╗
echo ║                                                            ║
echo ║   ⚡ Quick Rebuild & Restart ⚡                             ║
echo ║                                                            ║
echo ╚════════════════════════════════════════════════════════════╝
echo.

cd /d "%~dp0"

echo 🔄 إيقاف الخادم القديم...
taskkill /F /IM node.exe >nul 2>&1
timeout /t 1 /nobreak >nul

echo.
echo 🔨 بناء سريع (بدون minification)...
echo.
call npm run build >nul 2>&1

if %ERRORLEVEL% EQU 0 (
    echo ✅ البناء نجح!
    echo.
    echo 🚀 تشغيل الخادم...
    echo 🌐 http://localhost:3000
    echo.
    start http://localhost:3000
    npx serve -s build -l 3000
) else (
    echo ❌ فشل البناء! تحقق من الأخطاء
    pause
)
