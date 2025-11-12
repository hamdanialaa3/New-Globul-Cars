@echo off
cls
echo.
echo ============================================
echo   START HERE - Click this file!
echo   Bulgarian Car Marketplace Server
echo ============================================
echo.
echo [1/5] Going to project folder...
cd /d "%~dp0bulgarian-car-marketplace"

echo [2/5] Stopping old Node processes...
taskkill /F /IM node.exe /T >nul 2>&1

echo [3/5] Waiting...
timeout /t 3 /nobreak >nul

echo [4/5] Cleaning cache...
if exist "node_modules\.cache" (
    rmdir /S /Q "node_modules\.cache" >nul 2>&1
)

echo [5/5] Starting server...
echo.
echo ============================================
echo   Wait 60 seconds, then open browser:
echo   http://localhost:3000/profile/settings
echo.
echo   Press F12 and look for:
echo   "NEW SIMPLE DESIGN LOADED"
echo ============================================
echo.

npm start

