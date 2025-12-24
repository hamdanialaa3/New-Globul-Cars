@echo off
chcp 65001 >nul
cls
echo ╔════════════════════════════════════════════════════════════╗
echo ║                                                            ║
echo ║   🧹 تنظيف شامل للمنفذ 3000 والكاش 🧹                     ║
echo ║                                                            ║
echo ╚════════════════════════════════════════════════════════════╝
echo.

cd /d "%~dp0"

echo [1/7] إيقاف جميع عمليات Node.js...
taskkill /F /IM node.exe /T >nul 2>&1
if %errorlevel% equ 0 (
    echo    ✓ تم إيقاف عمليات Node.js
) else (
    echo    ℹ لا توجد عمليات Node.js قيد التشغيل
)
timeout /t 2 /nobreak >nul

echo [2/7] تنظيف كاش npm...
call npm cache clean --force >nul 2>&1
echo    ✓ تم تنظيف كاش npm

echo [3/7] حذف مجلدات الكاش...
if exist "node_modules\.cache" (
    rmdir /S /Q "node_modules\.cache" >nul 2>&1
    echo    ✓ تم حذف node_modules\.cache
) else (
    echo    ℹ لا يوجد node_modules\.cache
)

if exist ".cache" (
    rmdir /S /Q ".cache" >nul 2>&1
    echo    ✓ تم حذف .cache
) else (
    echo    ℹ لا يوجد .cache
)

if exist "build" (
    rmdir /S /Q "build" >nul 2>&1
    echo    ✓ تم حذف build
) else (
    echo    ℹ لا يوجد build
)

echo [4/7] تنظيف كاش TypeScript...
if exist "tsconfig.tsbuildinfo" (
    del /F /Q "tsconfig.tsbuildinfo" >nul 2>&1
    echo    ✓ تم حذف tsconfig.tsbuildinfo
) else (
    echo    ℹ لا يوجد tsconfig.tsbuildinfo
)

echo [5/7] تنظيف ملفات السجلات...
del /F /Q "npm-debug.log" >nul 2>&1
del /F /Q "yarn-debug.log" >nul 2>&1
del /F /Q "yarn-error.log" >nul 2>&1
del /F /Q "lerna-debug.log" >nul 2>&1
echo    ✓ تم تنظيف ملفات السجلات

echo [6/7] تنظيف كاش المتصفح (localStorage/sessionStorage)...
echo    ℹ يرجى فتح DevTools في المتصفح ومسح الكاش يدوياً
echo    أو اضغط Ctrl+Shift+Delete في المتصفح

echo [7/7] التحقق من المنفذ 3000...
for /f "tokens=5" %%a in ('netstat -ano 2^>nul ^| findstr :3000') do (
    set PID=%%a
    if defined PID (
        echo    ⚠ المنفذ 3000 مستخدم من قبل PID: !PID!
        echo    جاري إغلاق العملية...
        taskkill /F /PID !PID! >nul 2>&1
        if !errorlevel! equ 0 (
            echo    ✓ تم إغلاق العملية بنجاح
        ) else (
            echo    ⚠ فشل إغلاق العملية - قد تحتاج صلاحيات إدارية
        )
        set PID=
    )
)

setlocal enabledelayedexpansion
for /f "tokens=5" %%a in ('netstat -ano 2^>nul ^| findstr :3000') do (
    set PID=%%a
    if defined PID (
        echo    ⚠ المنفذ 3000 لا يزال مستخدم من قبل PID: !PID!
        echo    يرجى إغلاقه يدوياً أو إعادة تشغيل الكمبيوتر
        set PID=
    )
)
endlocal

echo.
echo ╔════════════════════════════════════════════════════════════╗
echo ║                                                            ║
echo ║   ✅ تم التنظيف بنجاح!                                    ║
echo ║                                                            ║
echo ╚════════════════════════════════════════════════════════════╝
echo.
echo 💡 نصيحة: قم بتشغيل npm start لإعادة تشغيل الخادم
echo 💡 نصيحة: اضغط Ctrl+Shift+R في المتصفح لإعادة تحميل الصفحة
echo.
pause

