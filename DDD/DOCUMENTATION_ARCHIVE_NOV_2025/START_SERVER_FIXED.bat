@echo off
:: ================================================
:: 🚀 Bulgarian Car Marketplace - Dev Server
:: ================================================
:: Fixed version - November 2025
:: ================================================

color 0A
title Bulgarian Car Marketplace - Dev Server Starting...

echo.
echo ╔════════════════════════════════════════════════════════════╗
echo ║                                                            ║
echo ║        🇧🇬 BULGARIAN CAR MARKETPLACE 🚗                     ║
echo ║                                                            ║
echo ║        Starting Development Server...                      ║
echo ║                                                            ║
echo ╚════════════════════════════════════════════════════════════╝
echo.

:: تحديد المجلد الصحيح
cd /d "%~dp0"

echo [1/5] Checking Node.js installation...
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ ERROR: Node.js is not installed!
    echo.
    echo Please install Node.js from: https://nodejs.org/
    echo.
    pause
    exit /b 1
)
echo ✅ Node.js: OK
for /f "tokens=*" %%i in ('node --version') do set NODE_VERSION=%%i
echo    Version: %NODE_VERSION%
echo.

echo [2/5] Checking npm installation...
npm --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ ERROR: npm is not installed!
    pause
    exit /b 1
)
echo ✅ npm: OK
for /f "tokens=*" %%i in ('npm --version') do set NPM_VERSION=%%i
echo    Version: %NPM_VERSION%
echo.

echo [3/5] Checking node_modules...
if not exist "node_modules\" (
    echo ⚠️  WARNING: node_modules not found!
    echo.
    echo Installing dependencies... (this may take 3-5 minutes)
    echo.
    call npm install --legacy-peer-deps
    if %errorlevel% neq 0 (
        echo.
        echo ❌ ERROR: Failed to install dependencies!
        echo.
        pause
        exit /b 1
    )
    echo.
    echo ✅ Dependencies installed successfully!
    echo.
) else (
    echo ✅ node_modules: OK
)
echo.

echo [4/5] Checking .env file...
if not exist ".env" (
    echo ⚠️  WARNING: .env file not found!
    echo.
    echo Creating .env from .env.example...
    copy .env.example .env
    echo.
    echo ⚠️  IMPORTANT: Please edit .env and add your Firebase credentials!
    echo.
    pause
)
echo ✅ .env: OK
echo.

echo [5/5] Starting development server...
echo.
echo ┌────────────────────────────────────────────────────────────┐
echo │                                                            │
echo │  🌐 Server will start at: http://localhost:3000           │
echo │                                                            │
echo │  📝 Press Ctrl+C to stop the server                       │
echo │                                                            │
echo │  🔄 Browser will open automatically...                    │
echo │                                                            │
echo └────────────────────────────────────────────────────────────┘
echo.

:: تعيين متغيرات البيئة لتحسين الأداء
set NODE_OPTIONS=--max-old-space-size=4096
set BROWSER=chrome
set SKIP_PREFLIGHT_CHECK=true

:: تشغيل الخادم
title Bulgarian Car Marketplace - Dev Server Running on Port 3000
npm start

:: في حالة توقف الخادم
echo.
echo.
echo ════════════════════════════════════════════════════════════
echo  Server stopped.
echo ════════════════════════════════════════════════════════════
echo.
pause
