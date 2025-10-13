@echo off
echo ========================================
echo حل مشكلة Cursor Connection
echo Fix Cursor Connection Error
echo ========================================
echo.

echo [تحذير] يجب إغلاق Cursor أولاً!
echo [Warning] Close Cursor first!
echo.
pause

echo.
echo [1/4] حذف Cursor Cache...
if exist "%APPDATA%\Cursor\Cache" (
    rmdir /s /q "%APPDATA%\Cursor\Cache"
    echo ✅ Cache محذوف!
) else (
    echo ℹ️  Cache غير موجود
)

if exist "%LOCALAPPDATA%\Cursor\Cache" (
    rmdir /s /q "%LOCALAPPDATA%\Cursor\Cache"
    echo ✅ Local Cache محذوف!
) else (
    echo ℹ️  Local Cache غير موجود
)
echo.

echo [2/4] حذف Global Storage...
if exist "%APPDATA%\Cursor\User\globalStorage" (
    rmdir /s /q "%APPDATA%\Cursor\User\globalStorage"
    echo ✅ Global Storage محذوف!
) else (
    echo ℹ️  Global Storage غير موجود
)
echo.

echo [3/4] حذف Code Cache...
if exist "%APPDATA%\Cursor\Code Cache" (
    rmdir /s /q "%APPDATA%\Cursor\Code Cache"
    echo ✅ Code Cache محذوف!
) else (
    echo ℹ️  Code Cache غير موجود
)
echo.

echo [4/4] حذف GPUCache...
if exist "%APPDATA%\Cursor\GPUCache" (
    rmdir /s /q "%APPDATA%\Cursor\GPUCache"
    echo ✅ GPU Cache محذوف!
) else (
    echo ℹ️  GPU Cache غير موجود
)
echo.

echo ========================================
echo ✅ التنظيف مكتمل!
echo ========================================
echo.
echo 📋 الخطوات التالية:
echo.
echo 1. افتح Cursor
echo 2. اضغط Sign Out
echo 3. أغلق Cursor تماماً
echo 4. أعد فتح Cursor
echo 5. سجل دخول (Sign In)
echo.
echo إذا لم تُحل المشكلة:
echo - جرب إيقاف VPN
echo - تحقق من Firewall
echo - أضف Cursor للـ Antivirus exclusions
echo.
pause










