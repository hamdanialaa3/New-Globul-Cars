@echo off
echo ======================================
echo Copying car images to public folder
echo ======================================
echo.

mkdir "bulgarian-car-marketplace\public\assets\images" 2>nul

echo Copying pexels-pixabay-259234.jpg...
copy "assets\images\pexels-pixabay-259234.jpg" "bulgarian-car-marketplace\public\assets\images\pexels-pixabay-259234.jpg" /Y >nul 2>&1
if %ERRORLEVEL% EQU 0 (
    echo [OK] pexels-pixabay-259234.jpg copied
) else (
    echo [ERROR] Failed to copy pexels-pixabay-259234.jpg
)

echo.
echo Copying pexels-pixabay-259249.jpg...
copy "assets\images\pexels-pixabay-259249.jpg" "bulgarian-car-marketplace\public\assets\images\pexels-pixabay-259249.jpg" /Y >nul 2>&1
if %ERRORLEVEL% EQU 0 (
    echo [OK] pexels-pixabay-259249.jpg copied
) else (
    echo [ERROR] Failed to copy pexels-pixabay-259249.jpg
)

echo.
echo ======================================
echo Done! Images copied to public folder
echo ======================================
echo.
echo You can now use:
echo - /assets/images/pexels-pixabay-259234.jpg
echo - /assets/images/pexels-pixabay-259249.jpg
echo.
pause

