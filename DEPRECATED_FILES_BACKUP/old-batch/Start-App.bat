@echo off
echo ============================================
echo    Globul Cars - Bulgarian Car Marketplace
echo ============================================
echo.

cd /d "%~dp0"

echo Building the application...
npm run build

if %errorlevel% neq 0 (
    echo.
    echo ❌ Build failed! Please check the errors above.
    pause
    exit /b 1
)

echo.
echo ✅ Build successful!
echo.

echo Starting the server on http://localhost:3002
echo Press Ctrl+C to stop the server
echo.

npx serve -s build -l 3002

pause