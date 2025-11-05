@echo off
cls
echo.
echo ╔════════════════════════════════════════════════════════════╗
echo ║                                                            ║
echo ║   🔥 Development Server with Hot Reload 🔥                 ║
echo ║                                                            ║
echo ╚════════════════════════════════════════════════════════════╝
echo.

cd /d "%~dp0"

REM Set environment variables for development
set BROWSER=none
set FAST_REFRESH=true
set DISABLE_ESLINT_PLUGIN=true
set TSC_COMPILE_ON_ERROR=true
set SKIP_PREFLIGHT_CHECK=true

REM Kill old Node.js processes
echo 🔄 إيقاف الخوادم القديمة...
taskkill /F /IM node.exe >nul 2>&1
timeout /t 2 /nobreak >nul

echo.
echo ✅ جاري تشغيل خادم التطوير...
echo.
echo 🔥 Hot Reload نشط - التعديلات ستظهر تلقائياً!
echo 🌐 الرابط: http://localhost:3000
echo.
echo 📝 اضغط Ctrl+C للإيقاف
echo.
echo ⏳ انتظر 30-60 ثانية للتحميل الأول...
echo.

REM Start development server
npm start
