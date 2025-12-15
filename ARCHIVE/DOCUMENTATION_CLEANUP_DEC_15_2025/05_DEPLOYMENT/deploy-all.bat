@echo off
chcp 65001 >nul
echo ========================================
echo بدء عملية النشر الكاملة
echo ========================================
echo.

cd /d "c:\Users\hamda\Desktop\New Globul Cars"

echo [1/5] إضافة جميع التغييرات إلى Git...
git add -A
if %errorlevel% neq 0 (
    echo ✗ خطأ في إضافة الملفات
    pause
    exit /b 1
)
echo ✓ تم إضافة جميع الملفات
echo.

echo [2/5] عمل Commit...
git commit -m "docs: توحيد وتنظيف الملفات التوثيقية - دمج 16 ملف في ملفين موحدين"
if %errorlevel% neq 0 (
    echo ✗ خطأ في Commit
    pause
    exit /b 1
)
echo ✓ تم عمل Commit بنجاح
echo.

echo [3/5] رفع التغييرات إلى GitHub...
git push origin main
if %errorlevel% neq 0 (
    echo ✗ خطأ في الرفع إلى GitHub
    pause
    exit /b 1
)
echo ✓ تم الرفع إلى GitHub بنجاح
echo.

echo [4/5] بناء المشروع (Build)...
cd bulgarian-car-marketplace
call npm run build
if %errorlevel% neq 0 (
    echo ✗ خطأ في بناء المشروع
    pause
    exit /b 1
)
echo ✓ تم بناء المشروع بنجاح
echo.

echo [5/5] النشر إلى Firebase...
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
echo ✓ تم إكمال جميع العمليات بنجاح!
echo ========================================
echo.
echo الموقع: https://mobilebg.eu/
echo GitHub: hamdanialaa3
echo Firebase: Fire New Globul
echo.
pause
