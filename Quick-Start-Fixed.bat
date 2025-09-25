@echo off
echo ===========================================
echo    Bulgarian Car Marketplace - Quick Start
echo ===========================================
echo.

cd /d "%~dp0bulgarian-car-marketplace"

echo Installing dependencies...
call npm install
if %errorlevel% neq 0 (
    echo Error installing dependencies
    pause
    exit /b 1
)

echo.
echo Building project...
call npm run build
if %errorlevel% neq 0 (
    echo Error building project
    pause
    exit /b 1
)

echo.
echo Starting server on http://localhost:3001
echo Press Ctrl+C to stop the server
echo.

python -m http.server 3001 -d build