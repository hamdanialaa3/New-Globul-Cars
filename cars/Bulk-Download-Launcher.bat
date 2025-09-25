@echo off
title تحميل شامل مستمر - جميع العلامات دفعة واحدة
color 0A

echo ====================================================
echo    🚀 نظام التحميل الشامل والمستمر
echo ====================================================
echo    📝 الصيغة: الموديل_الفئة_الجيل_سنة الصنع_رقم
echo    🌍 جميع العلامات العالمية دفعة واحدة  
echo    ⚡ بدون توقف حتى الانتهاء
echo ====================================================
echo.

echo [1] تحميل شامل - 8 صور لكل علامة (~350 صورة)
echo [2] تحميل متوسط - 5 صور لكل علامة (~220 صورة)
echo [3] تحميل كبير - 15 صورة لكل علامة (~660 صورة)
echo [4] تحميل ضخم - 25 صورة لكل علامة (~1100 صورة)
echo [5] اختبار سريع - 2 صورة لكل علامة (~90 صورة)
echo.

set /p choice="اختر حجم التحميل (1-5): "

if "%choice%"=="1" (
    echo.
    echo 🚀 بدء التحميل الشامل - 8 صور لكل علامة
    echo ⏱️  الوقت المتوقع: 15-20 دقيقة
    echo.
    node continuous-bulk-downloader.js
    goto end
)

if "%choice%"=="2" (
    echo.
    echo 🚀 بدء التحميل المتوسط - 5 صور لكل علامة
    node -e "import('./continuous-bulk-downloader.js').then(async (module) => { const d = new module.default(); await d.quickStart(5); })"
    goto end
)

if "%choice%"=="3" (
    echo.
    echo 🚀 بدء التحميل الكبير - 15 صورة لكل علامة
    echo ⚠️  قد يستغرق 30-40 دقيقة
    node -e "import('./continuous-bulk-downloader.js').then(async (module) => { const d = new module.default(); await d.quickStart(15); })"
    goto end
)

if "%choice%"=="4" (
    echo.
    echo 🚀 بدء التحميل الضخم - 25 صورة لكل علامة
    echo ⚠️  قد يستغرق 45-60 دقيقة
    echo.
    set /p confirm="هل أنت متأكد؟ (y/n): "
    if /i "%confirm%"=="y" (
        node -e "import('./continuous-bulk-downloader.js').then(async (module) => { const d = new module.default(); await d.quickStart(25); })"
    ) else (
        echo تم الإلغاء.
    )
    goto end
)

if "%choice%"=="5" (
    echo.
    echo 🧪 تشغيل اختبار سريع - 2 صورة لكل علامة
    node -e "import('./continuous-bulk-downloader.js').then(async (module) => { const d = new module.default(); await d.quickStart(2); })"
    goto end
)

echo.
echo ❌ اختيار غير صحيح!

:end
echo.
echo ====================================================
echo          🎉 انتهت العملية - تحقق من المجلدات
echo ====================================================
echo 📂 المجلدات: brand_directories\
echo 🔍 لعرض الإحصائيات: node filename-analyzer.js
echo ====================================================
pause