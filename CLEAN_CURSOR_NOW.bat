@echo off
echo ========================================
echo تنظيف Cursor Cache
echo Cleaning Cursor Cache
echo ========================================
echo.

echo [1/5] تنظيف npm cache...
call npm cache clean --force
echo ✅ npm cache نظيف!
echo.

echo [2/5] تنظيف node_modules cache...
cd "C:\Users\hamda\Desktop\New Globul Cars\bulgarian-car-marketplace"
if exist "node_modules\.cache" (
    rmdir /s /q "node_modules\.cache"
    echo ✅ node_modules cache محذوف!
) else (
    echo ℹ️  node_modules cache غير موجود
)
echo.

echo [3/5] تنظيف eslint cache...
if exist ".eslintcache" (
    del /f ".eslintcache"
    echo ✅ eslint cache محذوف!
) else (
    echo ℹ️  eslint cache غير موجود
)
echo.

echo [4/5] تنظيف Cursor Cache folders...
if exist "%APPDATA%\Cursor\Cache" (
    rmdir /s /q "%APPDATA%\Cursor\Cache"
    echo ✅ Cursor Cache محذوف!
) else (
    echo ℹ️  Cursor Cache غير موجود
)

if exist "%APPDATA%\Cursor\Code Cache" (
    rmdir /s /q "%APPDATA%\Cursor\Code Cache"
    echo ✅ Cursor Code Cache محذوف!
) else (
    echo ℹ️  Cursor Code Cache غير موجود
)

if exist "%LOCALAPPDATA%\Cursor\Cache" (
    rmdir /s /q "%LOCALAPPDATA%\Cursor\Cache"
    echo ✅ Local Cursor Cache محذوف!
) else (
    echo ℹ️  Local Cursor Cache غير موجود
)
echo.

echo [5/5] تنظيف TypeScript cache...
if exist ".tsbuildinfo" (
    del /f ".tsbuildinfo"
    echo ✅ TypeScript cache محذوف!
) else (
    echo ℹ️  TypeScript cache غير موجود
)
echo.

echo ========================================
echo ✅ التنظيف مكتمل!
echo ========================================
echo.
echo 📋 الخطوات التالية:
echo 1. أعد تشغيل Cursor
echo 2. في المتصفح: Ctrl + Shift + Delete
echo 3. Hard Refresh: Ctrl + Shift + R
echo.
pause

