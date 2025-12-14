@echo off
chcp 65001 >nul
echo ========================================
echo إصلاح مشكلة Firebase Deploy
echo ========================================
echo.

cd /d "c:\Users\hamda\Desktop\New Globul Cars"

echo [التحقق 1] التحقق من Build folder...
if exist "bulgarian-car-marketplace\build\index.html" (
    echo ✓ Build folder موجود وجاهز
    goto :deploy
) else (
    echo ✗ Build folder غير موجود
    echo.
    echo [الخطوة 1] بناء المشروع...
    cd bulgarian-car-marketplace
    echo يرجى الانتظار (2-5 دقائق)...
    call npm run build
    if %errorlevel% neq 0 (
        echo.
        echo ✗ فشل البناء!
        echo.
        echo حاول يدوياً في Terminal منفصل:
        echo cd bulgarian-car-marketplace
        echo npm run build
        pause
        exit /b 1
    )
    echo ✓ تم البناء بنجاح
    cd ..
)

:deploy
echo.
echo [التحقق 2] التحقق من Firebase...
firebase login:list >nul 2>&1
if %errorlevel% neq 0 (
    echo ⚠ قد تحتاج تسجيل الدخول
    echo نفذ: firebase login
) else (
    echo ✓ Firebase مسجل دخول
)

echo.
echo [التحقق 3] التحقق من المشروع...
firebase use fire-new-globul >nul 2>&1
if %errorlevel% neq 0 (
    echo ⚠ تحديد المشروع...
    firebase use fire-new-globul
)

echo.
echo [التحقق 4] التحقق من Build folder نهائي...
if not exist "bulgarian-car-marketplace\build\index.html" (
    echo ✗ Build folder غير موجود!
    echo يجب بناء المشروع أولاً
    pause
    exit /b 1
)
echo ✓ Build folder جاهز

echo.
echo ========================================
echo بدء النشر...
echo ========================================
echo.

firebase deploy --only hosting
if %errorlevel% neq 0 (
    echo.
    echo ✗ فشل النشر!
    echo.
    echo الخطأ المحتمل:
    echo 1. Build folder غير موجود أو غير مكتمل
    echo 2. مشكلة في Firebase authentication
    echo 3. مشكلة في firebase.json
    echo.
    echo حاول يدوياً:
    echo firebase deploy --only hosting
    pause
    exit /b 1
)

echo.
echo ========================================
echo ✓ تم النشر بنجاح!
echo ========================================
echo.
echo تحقق من:
echo - https://fire-new-globul.web.app/sell/auto
echo - https://mobilebg.eu/sell/auto
echo.
pause
