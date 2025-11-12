@echo off
cls
echo.
echo ╔════════════════════════════════════════════════════════════╗
echo ║                                                            ║
echo ║   👁️  Auto-Rebuild on Changes 👁️                          ║
echo ║                                                            ║
echo ╚════════════════════════════════════════════════════════════╝
echo.

cd /d "%~dp0"

echo 📝 سيتم إعادة البناء تلقائياً عند حفظ أي ملف
echo.
echo 🔄 للتطبيق:
echo    1. احفظ ملفك (Ctrl+S)
echo    2. انتظر البناء (10-20 ثانية)
echo    3. اضغط F5 في المتصفح
echo.
echo 📝 اضغط Ctrl+C للإيقاف
echo.

REM Install chokidar-cli if not exists (for watch mode)
npm list chokidar-cli >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo 📦 تثبيت أداة المراقبة...
    call npm install --save-dev chokidar-cli
)

REM Watch src folder and rebuild on changes
npx chokidar "src/**/*.{js,jsx,ts,tsx,css}" -c "npm run build && echo ✅ تم إعادة البناء! اضغط F5 في المتصفح"
