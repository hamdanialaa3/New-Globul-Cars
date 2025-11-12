@echo off
echo ============================================
echo   Restarting Server - Please Wait
echo ============================================
echo.

REM Go to project directory
cd /d "%~dp0"

REM Kill all Node processes
echo [1/4] Stopping all Node processes...
taskkill /F /IM node.exe /T >nul 2>&1
timeout /t 2 /nobreak >nul

REM Clean cache
echo [2/4] Cleaning cache...
if exist "node_modules\.cache" (
    rmdir /S /Q "node_modules\.cache" >nul 2>&1
)

REM Start server
echo [3/4] Starting server...
start /MIN npm start

echo [4/4] Waiting for server to start (30 seconds)...
timeout /t 30 /nobreak

REM Open browser
echo.
echo ============================================
echo   Opening browser...
echo ============================================
start http://localhost:3000/profile/settings

echo.
echo ============================================
echo   DONE! Browser should open now.
echo.
echo   If changes don't appear:
echo   1. Press Ctrl+Shift+R in browser
echo   2. Or press F12, right-click refresh icon
echo      and select "Empty Cache and Hard Reload"
echo ============================================
echo.
pause

