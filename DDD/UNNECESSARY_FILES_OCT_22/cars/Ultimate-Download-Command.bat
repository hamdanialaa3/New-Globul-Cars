@echo off
title 🚀 التحميل الشامل والمستمر - أمر واحد للكل
color 0B

echo.
echo  ██████╗██████╗ ████████╗ █████╗ ██████╗     ██████╗ ██████╗ ███╗   ██╗██████╗  ██╗     ██████╗  ██████╗ ████████╗███████╗
echo ██╔════╝██╔══██╗██╔═══██╗██╔══██╗██╔═══██╗    ██╔══██╗██╔═══██╗████╗  ██║██╔══██╗ ██║     ██╔═══██╗██╔═══██╗██╔═══██╗██╔════╝
echo ██║     ██████╔╝██████╔╝ ██████╔╝██║   ██║    ██║  ██║██║   ██║██╔██╗ ██║██║  ██║ ██║     ██║   ██║██║   ██║██████╔╝███████╗
echo ██║     ██╔══██╗██╔══██╗ ██╔══██╗██║   ██║    ██║  ██║██║   ██║██║╚██╗██║██║  ██║ ██║     ██║   ██║██║   ██║██╔══██╗╚════██║
echo ╚██████╗██████╔╝██║  ██║ ██║  ██║╚██████╔╝    ██████╔╝╚██████╔╝██║ ╚████║██████╔╝ ███████╗╚██████╔╝╚██████╔╝██████╔╝███████║
echo  ╚═════╝╚═════╝ ╚═╝  ╚═╝ ╚═╝  ╚═╝ ╚═════╝     ╚═════╝  ╚═════╝ ╚═╝  ╚═══╝╚═════╝  ╚══════╝ ╚═════╝  ╚═════╝ ╚═════╝ ╚══════╝
echo.
echo ════════════════════════════════════════════════════════════════════════════════════════════
echo    🚀 نظام التحميل الشامل والمستمر - أمر واحد يحمل الكل
echo ════════════════════════════════════════════════════════════════════════════════════════════
echo    📝 التسمية الذكية: الموديل_الفئة_الجيل_سنة الصنع_رقم
echo    🌍 جميع العلامات العالمية (44 علامة تجارية)
echo    ⚡ تحميل مستمر بدون توقف حتى الانتهاء
echo    🎯 إحصائيات مباشرة ونتائج فورية
echo ════════════════════════════════════════════════════════════════════════════════════════════
echo.

echo 🎯 اختر حجم التحميل المطلوب:
echo.
echo [1] 🔥 ضخم جداً    - 20 صورة لكل علامة (~880 صورة - 60 دقيقة)
echo [2] 🚀 ضخم         - 15 صورة لكل علامة (~660 صورة - 45 دقيقة)  
echo [3] 💪 كبير        - 10 صور لكل علامة (~440 صورة - 30 دقيقة)
echo [4] ⚡ متوسط       - 6 صور لكل علامة (~264 صورة - 18 دقيقة)
echo [5] 🧪 اختبار سريع - 3 صور لكل علامة (~132 صورة - 10 دقائق)
echo [6] 🎮 مخصص        - اختر عدد الصور بنفسك
echo.

set /p choice="👆 اختر الرقم (1-6): "

if "%choice%"=="1" (
    echo.
    echo 🔥 بدء التحميل الضخم جداً...
    echo ⏱️  الوقت المتوقع: 45-60 دقيقة
    echo 📊 الصور المتوقعة: ~880 صورة
    echo.
    set /p confirm="🤔 متأكد من هذا الحجم الضخم؟ (y/n): "
    if /i "%confirm%"=="y" (
        echo.
        echo 🚀 جاري البدء...
        node -e "import('./continuous-bulk-downloader.js').then(async (module) => { const d = new module.default(); await d.quickStart(20); })"
    ) else (
        echo ❌ تم الإلغاء
    )
    goto end
)

if "%choice%"=="2" (
    echo.
    echo 🚀 بدء التحميل الضخم...
    echo ⏱️  الوقت المتوقع: 30-45 دقيقة
    echo 📊 الصور المتوقعة: ~660 صورة
    echo.
    node -e "import('./continuous-bulk-downloader.js').then(async (module) => { const d = new module.default(); await d.quickStart(15); })"
    goto end
)

if "%choice%"=="3" (
    echo.
    echo 💪 بدء التحميل الكبير...
    echo ⏱️  الوقت المتوقع: 20-30 دقيقة
    echo 📊 الصور المتوقعة: ~440 صورة
    echo.
    node -e "import('./continuous-bulk-downloader.js').then(async (module) => { const d = new module.default(); await d.quickStart(10); })"
    goto end
)

if "%choice%"=="4" (
    echo.
    echo ⚡ بدء التحميل المتوسط...
    echo ⏱️  الوقت المتوقع: 12-18 دقيقة
    echo 📊 الصور المتوقعة: ~264 صورة
    echo.
    node -e "import('./continuous-bulk-downloader.js').then(async (module) => { const d = new module.default(); await d.quickStart(6); })"
    goto end
)

if "%choice%"=="5" (
    echo.
    echo 🧪 بدء الاختبار السريع...
    echo ⏱️  الوقت المتوقع: 8-12 دقائق
    echo 📊 الصور المتوقعة: ~132 صورة
    echo.
    node -e "import('./continuous-bulk-downloader.js').then(async (module) => { const d = new module.default(); await d.quickStart(3); })"
    goto end
)

if "%choice%"=="6" (
    echo.
    set /p custom="🎮 كم صورة لكل علامة؟ (1-50): "
    if %custom% gtr 0 if %custom% leq 50 (
        set /a total=%custom%*44
        echo.
        echo 🎮 بدء التحميل المخصص...
        echo ⏱️  الوقت المتوقع: متغير حسب العدد
        echo 📊 الصور المتوقعة: ~%total% صورة
        echo.
        node -e "import('./continuous-bulk-downloader.js').then(async (module) => { const d = new module.default(); await d.quickStart(%custom%); })"
    ) else (
        echo ❌ رقم غير صحيح! يجب أن يكون بين 1 و 50
    )
    goto end
)

echo.
echo ❌ اختيار غير صحيح!
goto end

:end
echo.
echo ════════════════════════════════════════════════════════════════════════════════════════════
echo                            🎉 انتهت عملية التحميل الشامل 
echo ════════════════════════════════════════════════════════════════════════════════════════════
echo 📂 تحقق من المجلدات: brand_directories\
echo 📊 لعرض الإحصائيات الكاملة: node filename-analyzer.js  
echo 🔍 لفتح مجلد الصور: explorer brand_directories
echo ════════════════════════════════════════════════════════════════════════════════════════════
echo.
pause