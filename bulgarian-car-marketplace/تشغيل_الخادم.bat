@echo off
chcp 65001 >nul
echo ============================================
echo   إعادة تشغيل الخادم
echo ============================================
echo.

cd /d "%~dp0"

echo [1/4] إيقاف Node.js...
taskkill /F /IM node.exe /T >nul 2>&1
timeout /t 2 /nobreak >nul

echo [2/4] تنظيف الذاكرة المؤقتة...
if exist "node_modules\.cache" (
    rmdir /S /Q "node_modules\.cache" >nul 2>&1
)

echo [3/4] بدء الخادم...
start /MIN npm start

echo [4/4] انتظار 30 ثانية...
timeout /t 30 /nobreak

echo.
echo ============================================
echo   فتح المتصفح...
echo ============================================
start http://localhost:3000/profile/settings

echo.
echo ============================================
echo   تم! يجب أن يفتح المتصفح الآن.
echo.
echo   إذا لم تظهر التغييرات:
echo   اضغط Ctrl+Shift+R في المتصفح
echo ============================================
echo.
pause

