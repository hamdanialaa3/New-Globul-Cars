@echo off
echo ========================================
echo 🚀 Starting Firebase Deployment
echo ========================================
echo.

echo 📦 Step 1: Building the React application...
cd bulgarian-car-marketplace
call npm run build
if errorlevel 1 (
    echo ❌ Build failed!
    pause
    exit /b 1
)
echo ✅ Build completed successfully!
echo.

cd ..
echo 🔥 Step 2: Deploying to Firebase Hosting...
call firebase deploy --only hosting --project fire-new-globul
if errorlevel 1 (
    echo ❌ Deployment failed!
    pause
    exit /b 1
)
echo.

echo ========================================
echo ✅ Deployment completed successfully!
echo 🌐 Your site is live at:
echo    - https://fire-new-globul.web.app
echo    - https://fire-new-globul.firebaseapp.com
echo    - https://mobilebg.eu
echo ========================================
pause

