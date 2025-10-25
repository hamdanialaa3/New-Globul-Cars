@echo off
cd /d "%~dp0bulgarian-car-marketplace"
echo ===================================
echo Building project...
echo ===================================
call npm run build
if errorlevel 1 (
    echo Build failed!
    pause
    exit /b 1
)

echo.
echo ===================================
echo Build successful!
echo Deploying to Firebase...
echo ===================================
cd ..
call firebase deploy --only hosting
if errorlevel 1 (
    echo Deploy failed!
    pause
    exit /b 1
)

echo.
echo ===================================
echo Deploy successful!
echo Site: https://mobilebg.eu/
echo ===================================
pause

