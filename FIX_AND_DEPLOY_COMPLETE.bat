@echo off
chcp 65001 >nul
echo ========================================
echo إصلاح ونشر كامل - Fix and Deploy Complete
echo ========================================
echo.

cd /d "c:\Users\hamda\Desktop\New Globul Cars"

echo [التحقق 1/6] التحقق من Build folder...
cd bulgarian-car-marketplace
if exist build\index.html (
    echo ✓ Build folder موجود
    cd ..
) else (
    echo ✗ Build folder غير موجود - سيتم البناء الآن
    cd ..
    echo.
    echo [الخطوة 1/3] بناء المشروع (2-5 دقائق)...
    cd bulgarian-car-marketplace
    call npm run build
    if %errorlevel% neq 0 (
        echo ✗ خطأ في البناء
        echo.
        echo حاول يدوياً:
        echo cd bulgarian-car-marketplace
        echo npm run build
        pause
        exit /b 1
    )
    echo ✓ تم البناء بنجاح
    cd ..
)
echo.

echo [التحقق 2/6] التحقق من Firebase login...
firebase login:list >nul 2>&1
if %errorlevel% neq 0 (
    echo ⚠ قد تحتاج تسجيل الدخول
    echo نفذ: firebase login
) else (
    echo ✓ Firebase مسجل دخول
)
echo.

echo [التحقق 3/6] التحقق من المشروع...
firebase use >nul 2>&1
if %errorlevel% neq 0 (
    echo ⚠ تحديد المشروع...
    firebase use fire-new-globul
) else (
    echo ✓ المشروع محدد
)
echo.

echo [التحقق 4/6] التحقق من firebase.json...
if exist firebase.json (
    echo ✓ firebase.json موجود
) else (
    echo ✗ firebase.json غير موجود!
    pause
    exit /b 1
)
echo.

echo [التحقق 5/6] التحقق من .firebaserc...
if exist .firebaserc (
    echo ✓ .firebaserc موجود
) else (
    echo ✗ .firebaserc غير موجود!
    pause
    exit /b 1
)
echo.

echo [التحقق 6/6] التحقق من Build folder نهائي...
if exist bulgarian-car-marketplace\build\index.html (
    echo ✓ Build folder جاهز للنشر
) else (
    echo ✗ Build folder غير موجود أو غير مكتمل!
    echo.
    echo يجب بناء المشروع أولاً:
    echo cd bulgarian-car-marketplace
    echo npm run build
    pause
    exit /b 1
)
echo.

echo ========================================
echo بدء النشر إلى Firebase...
echo ========================================
echo.

firebase deploy --only hosting
if %errorlevel% neq 0 (
    echo.
    echo ✗ فشل النشر!
    echo.
    echo حاول يدوياً:
    echo firebase deploy --only hosting
    echo.
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
echo انتظر 1-2 دقيقة ثم امسح cache المتصفح
echo.
pause
