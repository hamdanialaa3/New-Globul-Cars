@echo off
REM Cloud Functions Deployment Script for Windows
REM نشر Cloud Functions على Windows

echo ========================================
echo 🚀 Starting Cloud Functions Deployment
echo ========================================

REM Check if we're in the right directory
if not exist firebase.json (
    echo ❌ Error: firebase.json not found
    echo Please run from project root
    exit /b 1
)

REM Install dependencies
echo.
echo 📦 Installing Cloud Functions dependencies...
cd functions
call npm install algoliasearch
if %errorlevel% neq 0 (
    echo ❌ Failed to install dependencies
    cd ..
    exit /b 1
)
cd ..

REM Check Algolia configuration
echo.
echo 🔍 Checking Algolia configuration...
firebase functions:config:get algolia.app_id >nul 2>&1
if %errorlevel% neq 0 (
    echo.
    echo ⚠️  Algolia not configured!
    echo Please set Algolia credentials:
    echo   firebase functions:config:set algolia.app_id="YOUR_APP_ID"
    echo   firebase functions:config:set algolia.admin_key="YOUR_ADMIN_KEY"
    echo.
    set /p continue_anyway="Do you want to continue without Algolia? (y/N): "
    if /i not "%continue_anyway%"=="y" (
        echo Deployment cancelled.
        exit /b 1
    )
) else (
    echo ✅ Algolia configuration found
)

REM Deploy functions
echo.
echo 🚀 Deploying Cloud Functions...
firebase deploy --only functions:syncPassengerCarsToAlgolia,functions:syncSuvsToAlgolia,functions:syncVansToAlgolia,functions:syncMotorcyclesToAlgolia,functions:syncTrucksToAlgolia,functions:syncBusesToAlgolia,functions:batchSyncAllCarsToAlgolia

if %errorlevel% equ 0 (
    echo.
    echo ========================================
    echo ✅ Deployment successful!
    echo ========================================
    echo.
    echo 📋 Next Steps:
    echo 1. Run initial batch sync:
    echo    firebase functions:call batchSyncAllCarsToAlgolia
    echo.
    echo 2. Test real-time sync by:
    echo    - Adding a new car
    echo    - Updating an existing car
    echo    - Checking Algolia dashboard
    echo ========================================
) else (
    echo.
    echo ❌ Deployment failed!
    exit /b 1
)

pause
