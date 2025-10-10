@echo off
echo ========================================
echo إعادة تعيين نماذج Cursor
echo Reset Cursor AI Models
echo ========================================
echo.

echo [تحذير] يجب إغلاق Cursor أولاً!
echo [Warning] Close Cursor first!
echo.
pause

echo.
echo [1/3] حذف إعدادات النماذج...
if exist "%APPDATA%\Cursor\User\settings.json" (
    del /f "%APPDATA%\Cursor\User\settings.json"
    echo ✅ settings.json محذوف!
) else (
    echo ℹ️  settings.json غير موجود
)
echo.

echo [2/3] حذف Cache النماذج...
if exist "%APPDATA%\Cursor\User\workspaceStorage" (
    rmdir /s /q "%APPDATA%\Cursor\User\workspaceStorage"
    echo ✅ workspaceStorage محذوف!
) else (
    echo ℹ️  workspaceStorage غير موجود
)
echo.

echo [3/3] حذف AI Cache...
if exist "%APPDATA%\Cursor\User\CachedExtensions" (
    rmdir /s /q "%APPDATA%\Cursor\User\CachedExtensions"
    echo ✅ AI Cache محذوف!
) else (
    echo ℹ️  AI Cache غير موجود
)
echo.

echo ========================================
echo ✅ إعادة تعيين النماذج مكتملة!
echo ========================================
echo.
echo 📋 الخطوات التالية:
echo.
echo 1. افتح Cursor
echo 2. اذهب إلى Settings (Ctrl + ,)
echo 3. ابحث عن "AI" أو "Features"
echo 4. اختر النموذج الافتراضي فقط
echo 5. لا تضيف نماذج جديدة
echo.
echo ⚠️  لا تعدل إعدادات النماذج مرة أخرى!
echo.
pause

































