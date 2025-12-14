@echo off
chcp 65001 >nul
echo ========================================
echo نشر تغييرات SellVehicleStep1 فوراً
echo ========================================
echo.

cd /d "c:\Users\hamda\Desktop\New Globul Cars"

echo [1/4] التحقق من التغييرات...
findstr /C:"disabled: true" "bulgarian-car-marketplace\src\components\sell-workflow\steps\SellVehicleStep1.tsx" >nul
if %errorlevel% equ 0 (
    echo ✓ التغييرات موجودة في الملف
) else (
    echo ✗ التغييرات غير موجودة!
    pause
    exit /b 1
)
echo.

echo [2/4] إضافة و Commit و Push...
git add bulgarian-car-marketplace/src/components/sell-workflow/steps/SellVehicleStep1.tsx
git commit -m "fix: نشر تغييرات SellVehicleStep1 - تعطيل البطاقات ال5"
git push origin main
if %errorlevel% neq 0 (
    echo ✗ خطأ في Git
    pause
    exit /b 1
)
echo ✓ تم الرفع إلى GitHub
echo.

echo [3/4] بناء المشروع (2-5 دقائق)...
cd bulgarian-car-marketplace
call npm run build
if %errorlevel% neq 0 (
    echo ✗ خطأ في البناء
    pause
    exit /b 1
)
echo ✓ تم البناء بنجاح
echo.

echo [4/4] النشر إلى Firebase...
cd ..
firebase deploy --only hosting
if %errorlevel% neq 0 (
    echo ✗ خطأ في النشر
    pause
    exit /b 1
)
echo ✓ تم النشر بنجاح!
echo.

echo ========================================
echo ✓ تم النشر بنجاح!
echo ========================================
echo.
echo تحقق من: https://fire-new-globul.web.app/sell/auto
echo انتظر 1-2 دقيقة ثم امسح cache المتصفح
echo.
pause
