@echo off
chcp 65001 >nul
title 🔥 ALL DOWNLOAD MODES - NetCarShow Ultimate Scraper

echo.
echo 🔥 ══════════════════════════════════════════════════════════════════════════════════════════
echo 📸 تشغيل جميع أنواع التحميل معاً - NETCARSHOW ULTIMATE SCRAPER
echo 🔥 ══════════════════════════════════════════════════════════════════════════════════════════
echo.
echo 🚀 سيتم تشغيل جميع أنواع التحميل في نفس الوقت للحصول على أقصى سرعة!
echo 💾 التحميل الحقيقي مُفعّل - ستحصل على آلاف الصور!
echo.

echo 🔧 فحص المتطلبات...
node --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Node.js غير موجود
    pause
    exit /b 1
) else (
    echo ✅ Node.js جاهز
)

echo.
echo 🚀 بدء التحميل على 4 مستويات مختلفة...
echo.

echo [1] 🎯 بدء التحميل الذكي السريع...
start "Smart Download" cmd /c "node smart-download-scraper.js & pause"

echo [2] ⚡ بدء التحميل السريع...
start "Fast Download" cmd /c "node fast-download-scraper.js & pause"

echo [3] 🚀 بدء التحميل الكامل...
start "Full Download" cmd /c "node full-download-scraper.js & pause"

echo [4] 🔥 بدء التحميل الضخم...
start "Massive Download" cmd /c "node massive-download-scraper.js & pause"

echo.
echo 🎉 تم تشغيل 4 أنواع تحميل مختلفة!
echo.
echo 📊 النتائج المتوقعة:
echo    • التحميل الذكي: 1,500+ صورة
echo    • التحميل السريع: 7,500+ صورة
echo    • التحميل الكامل: 10,000+ صورة
echo    • التحميل الضخم: 1,000,000+ صورة
echo.
echo 💡 نصائح:
echo    • ستفتح 4 نوافذ منفصلة
echo    • كل نوع يعمل بسرعة مختلفة
echo    • جميع الصور تُحفظ في brand_directories
echo    • لا تغلق النوافذ حتى انتهاء التحميل
echo.
echo 📁 راقب مجلد: brand_directories للنتائج
echo.
pause