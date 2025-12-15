@echo off
REM =============================================================================
REM تشغيل سكربتات الهجرة للمعرفات الرقمية
REM Migration Scripts Runner for Numeric IDs
REM =============================================================================

echo.
echo ================================================================================
echo           تشغيل سكربتات الهجرة للمعرفات الرقمية
echo           Running Numeric ID Migration Scripts
echo ================================================================================
echo.

REM Check if Firebase CLI is logged in
echo [1/3] التحقق من تسجيل الدخول إلى Firebase...
echo [1/3] Checking Firebase CLI authentication...
firebase projects:list >nul 2>&1
if errorlevel 1 (
    echo.
    echo ❌ خطأ: يجب تسجيل الدخول إلى Firebase CLI أولاً
    echo ❌ Error: You must login to Firebase CLI first
    echo.
    echo قم بتشغيل الأمر التالي:
    echo Run this command:
    echo    firebase login
    echo.
    pause
    exit /b 1
)

echo ✅ تم تسجيل الدخول بنجاح
echo ✅ Logged in successfully
echo.

REM Check if firebase-admin is installed in functions
echo [2/3] التحقق من تثبيت firebase-admin...
echo [2/3] Checking firebase-admin installation...
cd functions
if not exist "node_modules\firebase-admin" (
    echo.
    echo ⚠️  firebase-admin غير مثبت. جاري التثبيت...
    echo ⚠️  firebase-admin not installed. Installing...
    call npm install firebase-admin
    if errorlevel 1 (
        echo.
        echo ❌ فشل تثبيت firebase-admin
        echo ❌ Failed to install firebase-admin
        cd ..
        pause
        exit /b 1
    )
)
cd ..

echo ✅ firebase-admin مثبت
echo ✅ firebase-admin installed
echo.

REM Run migrations
echo [3/3] تشغيل سكربتات الهجرة...
echo [3/3] Running migration scripts...
echo.

echo ================================================================================
echo الخطوة 1: هجرة المستخدمين (Users Migration)
echo ================================================================================
echo.
node scripts/migration/assign-numeric-ids-users-cli.js
if errorlevel 1 (
    echo.
    echo ❌ فشلت هجرة المستخدمين
    echo ❌ User migration failed
    pause
    exit /b 1
)

echo.
echo ================================================================================
echo الخطوة 2: هجرة السيارات (Cars Migration)
echo ================================================================================
echo.
node scripts/migration/assign-numeric-ids-cars-cli.js
if errorlevel 1 (
    echo.
    echo ❌ فشلت هجرة السيارات
    echo ❌ Car migration failed
    pause
    exit /b 1
)

echo.
echo ================================================================================
echo ✅ اكتملت جميع عمليات الهجرة بنجاح!
echo ✅ All migrations completed successfully!
echo ================================================================================
echo.
echo الخطوات التالية:
echo Next steps:
echo.
echo 1. تحقق من قاعدة البيانات في Firebase Console
echo    Check database in Firebase Console
echo.
echo 2. أعد تشغيل الخادم المحلي
echo    Restart local server
echo    cd bulgarian-car-marketplace
echo    npm start
echo.
echo 3. اذهب إلى /profile في المتصفح
echo    Go to /profile in browser
echo.
echo 4. يجب أن ترى رابط مثل: /profile/1 أو /profile/2
echo    You should see URL like: /profile/1 or /profile/2
echo.
pause
