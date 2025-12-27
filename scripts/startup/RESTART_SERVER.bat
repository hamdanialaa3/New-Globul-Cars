@echo off
cls
echo.
echo ╔════════════════════════════════════════════════════════════╗
echo ║                                                            ║
echo ║   🔄 Restart Server - إعادة تشغيل الخادم 🔄               ║
echo ║                                                            ║
echo ╚════════════════════════════════════════════════════════════╝
echo.

REM Kill all Node.js processes
echo 🛑 إيقاف جميع خوادم Node.js...
taskkill /F /IM node.exe >nul 2>&1

REM Wait for processes to close
echo ⏳ انتظار 3 ثواني...
timeout /t 3 /nobreak >nul

REM Navigate to project directory
cd /d "%~dp0"

echo.
echo ✅ تم إيقاف الخوادم القديمة
echo.
echo 🚀 جاري تشغيل خادم جديد...
echo.
echo 🌐 الرابط: http://localhost:3000
echo.
echo 📝 اضغط Ctrl+C للإيقاف
echo.

REM Open browser
start http://localhost:3000

REM Start server
npx serve -s build -l 3000
