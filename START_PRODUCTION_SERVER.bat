@echo off
cls
echo.
echo ╔════════════════════════════════════════════════════════════╗
echo ║                                                            ║
echo ║   🚀 Bulgarian Car Marketplace - Production Server 🚀      ║
echo ║                                                            ║
echo ╚════════════════════════════════════════════════════════════╝
echo.

cd /d "%~dp0"

REM Stop any existing Node.js processes
echo 🔄 Stopping old server instances...
taskkill /F /IM node.exe >nul 2>&1
timeout /t 2 /nobreak >nul

echo ✅ Starting production server...
echo.
echo 🌐 Server will be available at:
echo    http://localhost:3000
echo.
echo 📝 Press Ctrl+C to stop
echo.

npx serve -s build -l 3000

pause
