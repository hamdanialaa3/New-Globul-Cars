@echo off
echo ===================================
echo إعادة تشغيل كاملة - تنظيف شامل
echo NUCLEAR RESTART - Full Clean
echo ===================================
echo.

echo [1/7] إيقاف جميع Node processes...
taskkill /F /IM node.exe 2>nul
timeout /t 2 /nobreak >nul

echo [2/7] حذف node_modules\.cache...
if exist "node_modules\.cache" (
    rmdir /S /Q "node_modules\.cache"
    echo     ✓ Deleted node_modules\.cache
) else (
    echo     ✓ node_modules\.cache not found
)

echo [3/7] حذف build folder...
if exist "build" (
    rmdir /S /Q "build"
    echo     ✓ Deleted build
) else (
    echo     ✓ build not found
)

echo [4/7] حذف .eslintcache...
if exist ".eslintcache" (
    del /F /Q ".eslintcache"
    echo     ✓ Deleted .eslintcache
) else (
    echo     ✓ .eslintcache not found
)

echo [5/7] حذف package-lock.json...
if exist "package-lock.json" (
    del /F /Q "package-lock.json"
    echo     ✓ Deleted package-lock.json
) else (
    echo     ✓ package-lock.json not found
)

echo [6/7] حذف node_modules (سيأخذ وقت)...
if exist "node_modules" (
    echo     ⏳ This may take 1-2 minutes...
    rmdir /S /Q "node_modules"
    echo     ✓ Deleted node_modules
) else (
    echo     ✓ node_modules not found
)

echo [7/7] إعادة تثبيت dependencies...
echo     ⏳ npm install (may take 2-3 minutes)...
call npm install

echo.
echo ===================================
echo ✅ التنظيف اكتمل!
echo.
echo الآن شغّل:
echo   npm start
echo.
echo ثم امسح cache المتصفح:
echo   Ctrl+Shift+Delete
echo ===================================
pause

