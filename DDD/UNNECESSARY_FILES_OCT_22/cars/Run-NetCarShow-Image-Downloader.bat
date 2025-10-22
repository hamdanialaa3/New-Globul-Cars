@echo off
chcp 65001 >nul
echo.
echo ====================================================================
echo                🚗 NetCarShow مُنزِّل الصور الشامل 🚗
echo ====================================================================
echo.
echo هذا البرنامج سيقوم بتنزيل جميع صور السيارات من موقع NetCarShow.com
echo وتنظيمها في المجلدات المناسبة لكل علامة تجارية
echo.
echo المميزات:
echo ✅ تنزيل شامل لجميع صور السيارات
echo ✅ تنظيم تلقائي في مجلدات العلامات التجارية
echo ✅ إعادة تسمية الصور بأسماء مفهومة
echo ✅ الحفاظ على الجودة الأصلية للصور
echo ✅ تجنب تكرار التنزيل
echo ✅ إحصائيات مفصلة
echo.

cd /d "%~dp0"

echo 🔍 التحقق من متطلبات النظام...
echo.

REM التحقق من Node.js
node --version >nul 2>&1
if errorlevel 1 (
    echo ❌ خطأ: Node.js غير مثبت أو غير موجود في PATH
    echo.
    echo 📥 يرجى تثبيت Node.js من: https://nodejs.org/
    echo    قم بتحميل النسخة LTS وتثبيتها
    echo.
    pause
    exit /b 1
)

echo ✅ Node.js مثبت - الإصدار:
node --version

REM التحقق من التبعيات
echo.
echo 🔍 التحقق من التبعيات المطلوبة...

if not exist "node_modules\axios" (
    echo 📦 تثبيت axios...
    npm install axios
    if errorlevel 1 (
        echo ❌ فشل في تثبيت axios
        pause
        exit /b 1
    )
)

if not exist "node_modules\cheerio" (
    echo 📦 تثبيت cheerio...
    npm install cheerio
    if errorlevel 1 (
        echo ❌ فشل في تثبيت cheerio
        pause
        exit /b 1
    )
)

echo ✅ جميع التبعيات مثبتة

REM التحقق من وجود مجلدات العلامات التجارية
echo.
echo 🔍 التحقق من مجلدات العلامات التجارية...

if not exist "brand_directories" (
    echo ❌ مجلد brand_directories غير موجود!
    echo.
    echo 📁 يرجى التأكد من وجود مجلد brand_directories في نفس مجلد هذا الملف
    echo    يجب أن يحتوي على مجلدات فرعية للعلامات التجارية مثل:
    echo    - BMW/
    echo    - Mercedes-Benz/
    echo    - Audi/
    echo    - Toyota/
    echo    إلخ...
    echo.
    pause
    exit /b 1
)

REM عد مجلدات العلامات التجارية
for /d %%i in ("brand_directories\*") do set /a brand_count+=1
echo ✅ تم العثور على %brand_count% مجلد علامة تجارية

echo.
echo 🔍 التحقق من ملف المُنزِّل...

if not exist "netcarshow-image-downloader.js" (
    echo ❌ ملف netcarshow-image-downloader.js غير موجود!
    pause
    exit /b 1
)

echo ✅ ملف المُنزِّل موجود

echo.
echo ====================================================================
echo                        🚀 بدء عملية التنزيل
echo ====================================================================
echo.
echo ⚠️  تحذيرات مهمة:
echo    • هذه العملية قد تستغرق ساعات أو أيام حسب سرعة الإنترنت
echo    • سيتم تنزيل آلاف الصور (قد تصل إلى غيغابايتات)
echo    • تأكد من وجود مساحة كافية على القرص الصلب
echo    • لا تغلق هذه النافذة أثناء التنزيل
echo.
echo 🔧 للإيقاف المؤقت: اضغط Ctrl+C
echo 📊 ستظهر إحصائيات التقدم كل 15 دقيقة
echo.

set /p confirm=هل تريد المتابعة؟ (y/n): 
if /i not "%confirm%"=="y" if /i not "%confirm%"=="yes" (
    echo.
    echo ❌ تم إلغاء العملية
    pause
    exit /b 0
)

echo.
echo 🚀 بدء تنزيل صور NetCarShow.com...
echo.
echo تسجيل العملية سيتم حفظه في: netcarshow-download.log
echo.

REM بدء عملية التنزيل مع تسجيل الإخراج
node netcarshow-image-downloader.js 2>&1 | tee netcarshow-download.log

echo.
echo ====================================================================
echo                        ✅ انتهت العملية
echo ====================================================================
echo.

if exist "netcarshow-download.log" (
    echo 📊 يمكنك مراجعة تفاصيل العملية في ملف: netcarshow-download.log
    echo.
)

echo 📁 جميع الصور محفوظة في مجلد: brand_directories\
echo.
echo شكراً لاستخدام مُنزِّل صور NetCarShow! 🙏
echo.

pause