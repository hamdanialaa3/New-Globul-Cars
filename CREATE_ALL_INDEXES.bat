@echo off
chcp 65001 >nul
title Firebase Indexes Creator - إنشاء فهارس Firestore

echo.
echo ============================================
echo    🔥 Firebase Indexes Creation
echo ============================================
echo.
echo سيتم فتح 6 صفحات في المتصفح...
echo اضغط 'Create Index' في كل صفحة
echo.
echo ⏳ جاري الفتح...
echo.

REM Open all index creation URLs
start "" "https://console.firebase.google.com/v1/r/project/fire-new-globul/firestore/indexes?create_composite=ClRwcm9qZWN0cy9maXJlLW5ldy1nbG9idWwvZGF0YWJhc2VzLyhkZWZhdWx0KS9jb2xsZWN0aW9uR3JvdXBzL2FjaGlldmVtZW50cy9pbmRleGVzL18QARoKCgZ1c2VySWQQARoOCgp1bmxvY2tlZEF0EAIaDAoIX19uYW1lX18QAg"

timeout /t 2 /nobreak >nul

start "" "https://console.firebase.google.com/v1/r/project/fire-new-globul/firestore/indexes?create_composite=ClZwcm9qZWN0cy9maXJlLW5ldy1nbG9idWwvZGF0YWJhc2VzLyhkZWZhdWx0KS9jb2xsZWN0aW9uR3JvdXBzL3Bhc3Nlbmdlcl9jYXJzL2luZGV4ZXMvXxABGgwKCGlzQWN0aXZlEAEaDQoJY3JlYXRlZEF0EAIaDAoIX19uYW1lX18QAg"

timeout /t 2 /nobreak >nul

start "" "https://console.firebase.google.com/v1/r/project/fire-new-globul/firestore/indexes?create_composite=Ckxwcm9qZWN0cy9maXJlLW5ldy1nbG9idWwvZGF0YWJhc2VzLyhkZWZhdWx0KS9jb2xsZWN0aW9uR3JvdXBzL3N1dnMvaW5kZXhlcy9fEAEaDAoIaXNBY3RpdmUQARoNCgljcmVhdGVkQXQQAhoMCghfX25hbWVfXxAC"

timeout /t 2 /nobreak >nul

start "" "https://console.firebase.google.com/v1/r/project/fire-new-globul/firestore/indexes?create_composite=ClNwcm9qZWN0cy9maXJlLW5ldy1nbG9idWwvZGF0YWJhc2VzLyhkZWZhdWx0KS9jb2xsZWN0aW9uR3JvdXBzL21vdG9yY3ljbGVzL2luZGV4ZXMvXxABGgwKCGlzQWN0aXZlEAEaDQoJY3JlYXRlZEF0EAIaDAoIX19uYW1lX18QAg"

timeout /t 2 /nobreak >nul

start "" "https://console.firebase.google.com/v1/r/project/fire-new-globul/firestore/indexes?create_composite=Ck1wcm9qZWN0cy9maXJlLW5ldy1nbG9idWwvZGF0YWJhc2VzLyhkZWZhdWx0KS9jb2xsZWN0aW9uR3JvdXBzL2J1c2VzL2luZGV4ZXMvXxABGgwKCGlzQWN0aXZlEAEaDQoJY3JlYXRlZEF0EAIaDAoIX19uYW1lX18QAg"

timeout /t 2 /nobreak >nul

start "" "https://console.firebase.google.com/v1/r/project/fire-new-globul/firestore/indexes?create_composite=Ck5wcm9qZWN0cy9maXJlLW5ldy1nbG9idWwvZGF0YWJhc2VzLyhkZWZhdWx0KS9jb2xsZWN0aW9uR3JvdXBzL3RydWNrcy9pbmRleGVzL18QARoMCghpc0FjdGl2ZRABGg0KCWNyZWF0ZWRBdBACGgwKCF9fbmFtZV9fEAI"

echo.
echo ✅ تم فتح جميع الصفحات!
echo.
echo 📋 التعليمات:
echo    1. انتقل لكل صفحة في المتصفح (6 tabs)
echo    2. اضغط على زر 'Create Index' الأزرق
echo    3. انتظر رسالة 'Index created successfully'
echo    4. كرر للصفحات المتبقية
echo.
echo 💡 يمكنك إغلاق الصفحات بعد الضغط على 'Create Index'
echo    Firebase سيبني الـ indexes في الخلفية (2-5 دقائق)
echo.
echo ⚡ بعد ذلك، شغل التطبيق: npm start
echo.
pause
