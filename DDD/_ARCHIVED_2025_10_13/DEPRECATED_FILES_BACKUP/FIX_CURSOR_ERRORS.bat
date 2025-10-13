@echo off
echo ========================================
echo    إصلاح أخطاء Cursor التلقائي
echo ========================================
echo.

echo [1/5] إيقاف جميع عمليات Cursor...
taskkill /f /im "Cursor.exe" 2>nul
timeout /t 3 /nobreak >nul

echo [2/5] حذف ملفات التخزين المؤقت...
if exist "%APPDATA%\Cursor\User\settings.json" del "%APPDATA%\Cursor\User\settings.json"
if exist "%APPDATA%\Cursor\CachedData" rmdir /s /q "%APPDATA%\Cursor\CachedData"
if exist "%APPDATA%\Cursor\logs" rmdir /s /q "%APPDATA%\Cursor\logs"
if exist "%APPDATA%\Cursor\CachedExtensions" rmdir /s /q "%APPDATA%\Cursor\CachedExtensions"

echo [3/5] حذف ملفات المشروع المؤقتة...
if exist "dist" rmdir /s /q "dist"
if exist "node_modules\.cache" rmdir /s /q "node_modules\.cache"
if exist ".firebase" rmdir /s /q ".firebase"

echo [4/5] إنشاء إعدادات آمنة...
if not exist "%APPDATA%\Cursor\User" mkdir "%APPDATA%\Cursor\User"
copy "safe-cursor-settings.json" "%APPDATA%\Cursor\User\settings.json" >nul

echo [5/5] إعادة تشغيل Cursor...
start "" "C:\Users\%USERNAME%\AppData\Local\Programs\Cursor\Cursor.exe"

echo.
echo ========================================
echo    تم الإصلاح بنجاح!
echo    لا تستخدم الوضع التلقائي مؤقتاً
echo ========================================
pause


