@echo off
echo ========================================
echo   Starting Bulgarian Car Marketplace
echo   Profile Settings - New Design
echo ========================================
echo.

cd /d "%~dp0"

echo Cleaning cache...
if exist "node_modules\.cache" (
    rmdir /S /Q "node_modules\.cache" 2>nul
    echo Cache cleared!
) else (
    echo No cache to clear.
)

echo.
echo Starting development server...
echo.
echo ========================================
echo   Server will open at:
echo   http://localhost:3000
echo.
echo   To view new Settings page:
echo   http://localhost:3000/profile/settings
echo ========================================
echo.

npm start

