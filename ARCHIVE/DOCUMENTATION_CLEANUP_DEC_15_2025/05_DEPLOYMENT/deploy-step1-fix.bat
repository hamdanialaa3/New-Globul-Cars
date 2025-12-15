@echo off
chcp 65001 >nul
echo ========================================
echo نشر تغييرات SellVehicleStep1
echo ========================================
echo.

cd /d "c:\Users\hamda\Desktop\New Globul Cars"

echo [1/4] إضافة SellVehicleStep1.tsx إلى Git...
git add bulgarian-car-marketplace/src/components/sell-workflow/steps/SellVehicleStep1.tsx
if %errorlevel% neq 0 (
    echo ✗ خطأ في إضافة الملف
    pause
    exit /b 1
)
echo ✓ تم إضافة الملف
echo.

echo [2/4] عمل Commit...
git commit -m "feat: تعطيل بطاقات Van/Motorcycle/Truck/Bus/Parts في SellVehicleStep1 - Car فقط نشط"
if %errorlevel% neq 0 (
    echo ✗ خطأ في Commit
    pause
    exit /b 1
)
echo ✓ تم عمل Commit
echo.

echo [3/4] رفع إلى GitHub...
git push origin main
if %errorlevel% neq 0 (
    echo ✗ خطأ في الرفع
    pause
    exit /b 1
)
echo ✓ تم الرفع إلى GitHub
echo.

echo [4/4] بناء المشروع...
cd bulgarian-car-marketplace
call npm run build
if %errorlevel% neq 0 (
    echo ✗ خطأ في البناء
    pause
    exit /b 1
)
echo ✓ تم بناء المشروع
echo.

echo [5/5] النشر إلى Firebase...
cd ..
firebase deploy --only hosting
if %errorlevel% neq 0 (
    echo ✗ خطأ في النشر
    pause
    exit /b 1
)
echo ✓ تم النشر إلى Firebase
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
