@echo off
chcp 65001 >nul
echo ========================================
echo التحقق الكامل والنشر الشامل
echo ========================================
echo.

cd /d "c:\Users\hamda\Desktop\New Globul Cars"

echo [التحقق 1/6] التحقق من SellVehicleStep1.tsx...
findstr /C:"disabled: false" "bulgarian-car-marketplace\src\components\sell-workflow\steps\SellVehicleStep1.tsx" >nul
if %errorlevel% equ 0 (
    echo ✓ Car نشط
) else (
    echo ✗ Car غير نشط
)

findstr /C:"disabled: true" "bulgarian-car-marketplace\src\components\sell-workflow\steps\SellVehicleStep1.tsx" >nul
if %errorlevel% equ 0 (
    echo ✓ البطاقات الأخرى معطلة
) else (
    echo ✗ البطاقات غير معطلة
)
echo.

echo [التحقق 2/6] التحقق من حالة Git...
git status --short
echo.

echo [الخطوة 1/5] إضافة جميع التغييرات...
git add -A
if %errorlevel% neq 0 (
    echo ✗ خطأ في إضافة الملفات
    pause
    exit /b 1
)
echo ✓ تم إضافة جميع الملفات
echo.

echo [الخطوة 2/5] عمل Commit...
git commit -m "chore: نشر جميع التغييرات المحلية - توحيد التوثيق + تعطيل بطاقات SellVehicleStep1"
if %errorlevel% neq 0 (
    echo ⚠ قد يكون لا توجد تغييرات جديدة أو تم Commit مسبقاً
) else (
    echo ✓ تم عمل Commit
)
echo.

echo [الخطوة 3/5] رفع إلى GitHub...
git push origin main
if %errorlevel% neq 0 (
    echo ✗ خطأ في الرفع إلى GitHub
    pause
    exit /b 1
)
echo ✓ تم الرفع إلى GitHub بنجاح
echo.

echo [الخطوة 4/5] بناء المشروع (قد يستغرق 2-5 دقائق)...
cd bulgarian-car-marketplace
call npm run build
if %errorlevel% neq 0 (
    echo ✗ خطأ في بناء المشروع
    pause
    exit /b 1
)
echo ✓ تم بناء المشروع بنجاح
echo.

echo [الخطوة 5/5] النشر إلى Firebase...
cd ..
firebase deploy --only hosting
if %errorlevel% neq 0 (
    echo ✗ خطأ في النشر إلى Firebase
    pause
    exit /b 1
)
echo ✓ تم النشر إلى Firebase بنجاح
echo.

echo ========================================
echo ✓ تم إكمال جميع الخطوات بنجاح!
echo ========================================
echo.
echo تحقق من المواقع:
echo - https://fire-new-globul.web.app/sell/auto
echo - https://mobilebg.eu/sell/auto
echo.
echo انتظر 1-2 دقيقة ثم امسح cache المتصفح
echo.
pause
