@echo off
echo ========================================
echo   Deployment to Firebase Hosting
echo   Domains: mobilebg.eu, koli.one
echo ========================================
echo.

REM Step 1: Build the project
echo [1/3] Building production version...
call npm run build
if %ERRORLEVEL% NEQ 0 (
    echo ❌ Build failed!
    pause
    exit /b 1
)
echo ✅ Build completed successfully!
echo.

REM Step 2: Firebase login check
echo [2/3] Checking Firebase authentication...
firebase projects:list >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo ⚠️  Firebase authentication required
    echo Please run: firebase login
    pause
    exit /b 1
)
echo ✅ Firebase authenticated!
echo.

REM Step 3: Deploy to hosting
echo [3/3] Deploying to Firebase Hosting...
echo Deploying to:
echo   - fire-new-globul.web.app
echo   - fire-new-globul.firebaseapp.com
echo   - mobilebg.eu
echo   - koli.one
echo   - www.koli.one
echo.
firebase deploy --only hosting

if %ERRORLEVEL% EQU 0 (
    echo.
    echo ========================================
    echo   ✅ Deployment Successful!
    echo ========================================
    echo.
    echo Your site is live at:
    echo   🌐 https://mobilebg.eu
    echo   🌐 https://koli.one
    echo   🌐 https://www.koli.one
    echo   🌐 https://fire-new-globul.web.app
    echo.
) else (
    echo.
    echo ========================================
    echo   ❌ Deployment Failed!
    echo ========================================
    echo.
    echo Please check the error messages above.
    echo.
)

pause
