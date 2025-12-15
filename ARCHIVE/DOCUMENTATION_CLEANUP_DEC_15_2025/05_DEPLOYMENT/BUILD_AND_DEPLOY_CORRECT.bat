@echo off
chcp 65001 >nul
echo ========================================
echo بناء ونشر صحيح - Build and Deploy Correct
echo ========================================
echo.

echo [مهم] يجب تنفيذ Build من داخل bulgarian-car-marketplace
echo.

cd /d "c:\Users\hamda\Desktop\New Globul Cars"

echo [الخطوة 1/3] الانتقال إلى bulgarian-car-marketplace...
cd bulgarian-car-marketplace
if %errorlevel% neq 0 (
    echo ✗ خطأ في الانتقال
    pause
    exit /b 1
)
echo ✓ تم الانتقال
echo.

echo [الخطوة 2/3] بناء المشروع (2-5 دقائق)...
echo يرجى الانتظار...
call npm run build
if %errorlevel% neq 0 (
    echo.
    echo ✗ فشل البناء!
    echo.
    echo حاول يدوياً:
    echo cd bulgarian-car-marketplace
    echo npm run build
    pause
    exit /b 1
)
echo ✓ تم البناء بنجاح
echo.

echo [الخطوة 3/3] التحقق من Build...
if exist "build\index.html" (
    echo ✓ Build folder جاهز
) else (
    echo ✗ Build folder غير موجود!
    pause
    exit /b 1
)
echo.

echo [الخطوة 4/4] النشر إلى Firebase...
cd ..
firebase deploy --only hosting
if %errorlevel% neq 0 (
    echo.
    echo ✗ فشل النشر!
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
pause
