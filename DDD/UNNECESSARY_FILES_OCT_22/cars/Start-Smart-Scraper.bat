@echo off
title Smart Car Scraper - تحميل سريع مع تسمية ذكية
color 0a
echo.
echo =====================================
echo   Smart Car Scraper
echo   تحميل سريع مع تسمية ذكية للصور
echo =====================================
echo.

echo 🚀 بدء التحميل الشامل...
echo 🏷️  سيتم تسمية كل صورة حسب: العلامة_الموديل_السنة_الفئة
echo.

node -e "
import('./smart-naming-scraper.js').then(async (module) => {
  const scraper = new module.default();
  console.log('🏷️ بدء النظام الذكي للتسمية...');
  console.log('📋 سيتم استخراج: العلامة، الموديل، السنة، الفئة من كل صورة');
  console.log('');
  
  const results = await scraper.runSmartComprehensiveScrape(100);
  
  console.log('');
  console.log('🎉 اكتمل التحميل الذكي!');
  console.log('📊 ملخص النتائج:');
  results.forEach(result => {
    console.log(`   ${result.brand}: ${result.downloaded} صورة`);
  });
  
}).catch(e => {
  console.error('❌ خطأ:', e.message);
  console.log('');
  console.log('🔄 محاولة تشغيل النسخة البسيطة...');
  
  // النسخة البسيطة كبديل
  import('./comprehensive-scraper.js').then(async (module) => {
    const scraper = new module.default();
    await scraper.runComprehensiveScrape(50);
  });
})
"

echo.
echo ✅ انتهى التحميل
echo 📁 تحقق من مجلد brand_directories للصور المحملة
echo.
pause