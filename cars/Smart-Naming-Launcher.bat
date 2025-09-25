@echo off
title التحميل السريع مع التسمية الذكية
color 0A

echo ====================================================
echo    🚀 نظام التحميل السريع مع التسمية الذكية
echo ====================================================  
echo    📝 صيغة التسمية: الموديل_الفئة_الجيل_سنة الصنع
echo    🌍 مثال: Civic_SI_Latest_Gen_2024_001.jpg
echo ====================================================
echo.

echo [1] تشغيل النظام المحسّن للتسمية الذكية
echo [2] اختبار النظام مع بيانات تجريبية  
echo [3] تحليل الملفات الموجودة
echo [4] تحميل فعلي من الإنترنت
echo [5] عرض الإحصائيات
echo.

set /p choice="اختر رقم العملية (1-5): "

if "%choice%"=="1" (
    echo.
    echo 🧪 تشغيل النظام المحسّن...
    node -e "import('./enhanced-naming-scraper.js').then(async (module) => { const scraper = new module.default(); await scraper.testNamingSystem(); }).catch(e => console.error('❌ خطأ:', e.message))"
    goto end
)

if "%choice%"=="2" (
    echo.
    echo 🧪 اختبار مع بيانات تجريبية...
    node -e "import('./enhanced-naming-scraper.js').then(async (module) => { const scraper = new module.default(); await scraper.generateTestImages('Tesla', 10); }).catch(e => console.error('❌ خطأ:', e.message))"
    goto end
)

if "%choice%"=="3" (
    echo.
    echo 📊 تحليل الملفات الموجودة...
    node -e "import('./filename-analyzer.js').then(async (module) => { const analyzer = new module.default(); await analyzer.generateStats(); }).catch(e => console.error('❌ خطأ:', e.message))"
    goto end
)

if "%choice%"=="4" (
    echo.
    echo 🌐 تحميل فعلي من الإنترنت...
    node -e "import('./ultimate-fast-scraper.js').then(async (module) => { const scraper = new module.default(); const results = await scraper.runFastDownload(10); console.log('✅ انتهى التحميل:', results.length, 'نتيجة'); }).catch(e => console.error('❌ خطأ:', e.message))"
    goto end
)

if "%choice%"=="5" (
    echo.
    echo 📈 عرض الإحصائيات...
    node -e "import('./filename-analyzer.js').then(async (module) => { const analyzer = new module.default(); await analyzer.quickAnalysis('Honda'); console.log(''); await analyzer.quickAnalysis('Toyota'); }).catch(e => console.error('❌ خطأ:', e.message))"
    goto end
)

echo.
echo ❌ اختيار غير صحيح!
goto end

:end
echo.
echo ====================================================
echo                   🎉 انتهت العملية  
echo ====================================================
pause