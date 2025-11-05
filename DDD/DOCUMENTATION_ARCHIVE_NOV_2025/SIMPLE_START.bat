@echo off
cls
echo.
echo ================================================================
echo   Bulgarian Car Marketplace - Simple Server Start
echo ================================================================
echo.

cd /d "%~dp0"

echo [INFO] Changing directory to project folder...
echo Current directory: %CD%
echo.

echo [INFO] Setting environment variables...
set NODE_OPTIONS=--max-old-space-size=4096
set SKIP_PREFLIGHT_CHECK=true
set BROWSER=none
echo Done.
echo.

echo [INFO] Starting development server...
echo This may take 1-3 minutes on first run...
echo.
echo ================================================================
echo   IMPORTANT: Watch for "Compiled successfully!" message
echo ================================================================
echo.

npm start

pause
