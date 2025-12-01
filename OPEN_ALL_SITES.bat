@echo off
echo ========================================
echo   Opening All Sites
echo   فتح جميع المواقع
echo ========================================
echo.
echo Opening https://mobilebg.eu/ ...
start "" "https://mobilebg.eu/"
timeout /t 2 /nobreak >nul

echo Opening https://fire-new-globul.web.app/ ...
start "" "https://fire-new-globul.web.app/"
timeout /t 2 /nobreak >nul

echo Opening https://fire-new-globul.firebaseapp.com/ ...
start "" "https://fire-new-globul.firebaseapp.com/"
timeout /t 2 /nobreak >nul

echo.
echo ========================================
echo   All sites opened!
echo   تم فتح جميع المواقع!
echo ========================================
echo.
echo Press any key to close...
pause >nul

