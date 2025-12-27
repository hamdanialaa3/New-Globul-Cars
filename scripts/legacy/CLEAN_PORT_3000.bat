@echo off
chcp 65001 >nul
cls
echo ============================================
echo   تنظيف شامل للمنفذ 3000 والكاش
echo ============================================
echo.

cd /d "%~dp0"

echo [1/6] إيقاف جميع عمليات Node.js...
taskkill /F /IM node.exe /T >nul 2>&1
timeout /t 2 /nobreak >nul

echo [2/6] تنظيف كاش npm...
call npm cache clean --force >nul 2>&1

echo [3/6] حذف مجلدات الكاش...
if exist "node_modules\.cache" (
    rmdir /S /Q "node_modules\.cache" >nul 2>&1
    echo    ✓ تم حذف node_modules\.cache
)
if exist ".cache" (
    rmdir /S /Q ".cache" >nul 2>&1
    echo    ✓ تم حذف .cache
)
if exist "build" (
    rmdir /S /Q "build" >nul 2>&1
    echo    ✓ تم حذف build
)

echo [4/6] تنظيف كاش TypeScript...
if exist "tsconfig.tsbuildinfo" (
    del /F /Q "tsconfig.tsbuildinfo" >nul 2>&1
    echo    ✓ تم حذف tsconfig.tsbuildinfo
)

echo [5/6] تنظيف ملفات السجلات...
del /F /Q "npm-debug.log" >nul 2>&1
del /F /Q "yarn-debug.log" >nul 2>&1
del /F /Q "yarn-error.log" >nul 2>&1

echo [6/6] التحقق من المنفذ 3000...
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :3000') do (
    echo    ⚠ المنفذ 3000 مستخدم من قبل PID: %%a
    echo    جاري إغلاق العملية...
    taskkill /F /PID %%a >nul 2>&1
    echo    ✓ تم إغلاق العملية
)

echo.
echo ============================================
echo   ✅ تم التنظيف بنجاح!
echo ============================================
echo.
echo 💡 نصيحة: قم بتشغيل npm start لإعادة تشغيل الخادم
echo.
pause

