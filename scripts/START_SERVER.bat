@echo off
chcp 65001 >nul
cls
echo ============================================
echo   تشغيل الخادم مع تنظيف المنافذ
echo ============================================
echo.

cd /d "%~dp0"

echo [1/4] تنظيف عمليات Node.js المعلقة...
taskkill /F /IM node.exe /T >nul 2>&1
taskkill /F /IM npm.cmd /T >nul 2>&1
timeout /t 1 /nobreak >nul

echo [2/4] تنظيف المنفذ 3000...
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :3000') do (
    echo    إيقاف العملية PID: %%a
    taskkill /F /PID %%a >nul 2>&1
)
timeout /t 1 /nobreak >nul

echo [3/4] تعيين متغيرات البيئة...
set NODE_OPTIONS=--max_old_space_size=10096
set BROWSER=none
set PORT=3000
set HOST=localhost

echo [4/4] تشغيل الخادم...
echo.
echo ============================================
echo   🚀 الخادم يعمل الآن على http://localhost:3000
echo ============================================
echo.

npm start

pause

