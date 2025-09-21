@echo off
echo ============================================
echo    NetCarShow Car Data Scraper
echo ============================================
echo.

cd /d "%~dp0"

echo Checking Node.js installation...
node --version >nul 2>&1
if errorlevel 1 (
    echo ERROR: Node.js is not installed or not in PATH
    echo Please install Node.js from https://nodejs.org/
    pause
    exit /b 1
)

echo Checking dependencies...
if not exist "..\node_modules\cheerio" (
    echo Installing cheerio dependency...
    cd ..
    npm install cheerio
    cd cars
)

echo.
echo Choose scraping mode:
echo [1] Full scrape (get all brands from NetCarShow)
echo [2] Update existing files (improve formatting)
echo.

set /p choice="Enter your choice (1 or 2): "

if "%choice%"=="1" (
    echo.
    echo Starting full scraping process...
    echo This may take several hours depending on the number of brands.
    echo.
    node scraper.js scrape
) else if "%choice%"=="2" (
    echo.
    echo Updating existing files...
    echo.
    node scraper.js update
) else (
    echo Invalid choice. Please run again and choose 1 or 2.
)

echo.
echo Process completed!
pause