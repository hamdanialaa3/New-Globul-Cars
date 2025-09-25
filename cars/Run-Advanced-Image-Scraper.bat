@echo off
chcp 65001 >nul 2>&1
title NetCarShow Comprehensive Image Downloader

echo.
echo ╔══════════════════════════════════════════════════════════════════╗
echo ║                🚗 NetCarShow Image Downloader v2.0 🚗             ║
echo ╠══════════════════════════════════════════════════════════════════╣
echo ║                   Enhanced Professional Edition                   ║
echo ╚══════════════════════════════════════════════════════════════════╝
echo.
echo 🌟 Enhanced Features:
echo    ✅ Smart brand detection and matching
echo    ✅ Multi-source image extraction (IMG, CSS, JS, JSON-LD)
echo    ✅ Advanced filtering and quality control  
echo    ✅ Intelligent file naming and organization
echo    ✅ Real-time progress tracking and statistics
echo    ✅ Robust error handling and retry mechanisms
echo    ✅ Duplicate detection and prevention
echo.

cd /d "%~dp0"

echo 🔧 SYSTEM REQUIREMENTS CHECK
echo ════════════════════════════════════════
echo.

REM Check Node.js
echo 🔍 Checking Node.js installation...
node --version >nul 2>&1
if errorlevel 1 (
    echo ❌ ERROR: Node.js not installed or not in PATH
    echo.
    echo 📥 Please install Node.js from: https://nodejs.org/
    echo    Download the LTS version and install it
    echo    Make sure to add Node.js to your system PATH
    echo.
    echo Press any key to exit...
    pause >nul
    exit /b 1
)

for /f "tokens=*" %%i in ('node --version') do set NODE_VERSION=%%i
echo ✅ Node.js installed: %NODE_VERSION%

REM Check npm
echo 🔍 Checking npm...
npm --version >nul 2>&1
if errorlevel 1 (
    echo ❌ ERROR: npm not found
    echo.
    pause
    exit /b 1
)

for /f "tokens=*" %%i in ('npm --version') do set NPM_VERSION=%%i
echo ✅ npm available: v%NPM_VERSION%

REM Check dependencies
echo.
echo 🔍 DEPENDENCIES CHECK
echo ════════════════════════════════════════
echo.

echo 📦 Checking axios...
if not exist "node_modules\axios" (
    echo ⬇️  Installing axios...
    npm install axios --no-audit --no-fund
    if errorlevel 1 (
        echo ❌ Failed to install axios
        echo.
        echo Try running: npm install axios
        pause
        exit /b 1
    )
    echo ✅ axios installed successfully
) else (
    echo ✅ axios already installed
)

echo 📦 Checking cheerio...
if not exist "node_modules\cheerio" (
    echo ⬇️  Installing cheerio...
    npm install cheerio --no-audit --no-fund
    if errorlevel 1 (
        echo ❌ Failed to install cheerio
        echo.
        echo Try running: npm install cheerio
        pause
        exit /b 1
    )
    echo ✅ cheerio installed successfully
) else (
    echo ✅ cheerio already installed
)

REM Check directory structure
echo.
echo 🔍 DIRECTORY STRUCTURE CHECK
echo ════════════════════════════════════════
echo.

if not exist "brand_directories" (
    echo ❌ ERROR: brand_directories folder not found!
    echo.
    echo 📁 Required folder structure:
    echo    %CD%\brand_directories\
    echo    ├── BMW\
    echo    ├── Mercedes-Benz\
    echo    ├── Audi\
    echo    ├── Toyota\
    echo    └── ... (other brand folders)
    echo.
    echo Please create the brand_directories folder with brand subfolders
    echo.
    pause
    exit /b 1
)

REM Count brand directories
set brand_count=0
for /d %%i in ("brand_directories\*") do set /a brand_count+=1

if %brand_count% LSS 10 (
    echo ⚠️  WARNING: Only %brand_count% brand directories found
    echo    Expected 150+ directories for comprehensive scraping
    echo.
) else (
    echo ✅ Brand directories found: %brand_count%
)

REM Show some sample directories
echo.
echo 📁 Sample brand directories:
for /L %%i in (1,1,10) do (
    for /f "tokens=%%i delims=" %%d in ('dir /b /ad "brand_directories" 2^>nul') do echo    %%d\
)
echo    ... and %brand_count% more

REM Check scraper files
echo.
echo 🔍 SCRAPER FILES CHECK  
echo ════════════════════════════════════════
echo.

set "PREFERRED_SCRAPER=advanced-netcarshow-scraper.js"
set "BACKUP_SCRAPER=netcarshow-image-downloader.js"
set "FALLBACK_SCRAPER=comprehensive-image-scraper.js"

if exist "%PREFERRED_SCRAPER%" (
    set "SELECTED_SCRAPER=%PREFERRED_SCRAPER%"
    echo ✅ Using advanced scraper: %PREFERRED_SCRAPER%
) else if exist "%BACKUP_SCRAPER%" (
    set "SELECTED_SCRAPER=%BACKUP_SCRAPER%"
    echo ✅ Using backup scraper: %BACKUP_SCRAPER%
) else if exist "%FALLBACK_SCRAPER%" (
    set "SELECTED_SCRAPER=%FALLBACK_SCRAPER%"
    echo ✅ Using fallback scraper: %FALLBACK_SCRAPER%
) else (
    echo ❌ ERROR: No scraper files found!
    echo.
    echo Required files:
    echo    - %PREFERRED_SCRAPER% (preferred)
    echo    - %BACKUP_SCRAPER% (backup)  
    echo    - %FALLBACK_SCRAPER% (fallback)
    echo.
    pause
    exit /b 1
)

REM Test internet connectivity
echo.
echo 🔍 CONNECTIVITY CHECK
echo ════════════════════════════════════════
echo.

echo 🌐 Testing internet connectivity...
ping -n 1 8.8.8.8 >nul 2>&1
if errorlevel 1 (
    echo ❌ No internet connection detected
    echo.
    echo Please check your internet connection and try again
    pause
    exit /b 1
) else (
    echo ✅ Internet connection: OK
)

echo 🌐 Testing NetCarShow.com accessibility...
curl -s -I --connect-timeout 10 https://www.netcarshow.com/ >nul 2>&1
if errorlevel 1 (
    echo ⚠️  WARNING: NetCarShow.com may be unreachable
    echo    This could be due to:
    echo    - Temporary server issues
    echo    - Network restrictions
    echo    - Firewall blocking
    echo.
    echo Continue anyway? (y/n)
    choice /c yn /n
    if errorlevel 2 exit /b 1
) else (
    echo ✅ NetCarShow.com: Accessible
)

REM Check available disk space
echo.
echo 🔍 STORAGE CHECK
echo ════════════════════════════════════════
echo.

for /f "tokens=3" %%i in ('dir /-c "%~d0" 2^>nul ^| find "bytes free"') do set FREE_SPACE=%%i
set /a FREE_GB=%FREE_SPACE% / 1073741824 2>nul || set FREE_GB=Unknown

if %FREE_GB% LSS 50 (
    echo ⚠️  WARNING: Low disk space detected
    echo    Available space: %FREE_GB% GB
    echo    Recommended: 50+ GB for comprehensive scraping
    echo.
    echo Continue with limited space? (y/n)
    choice /c yn /n
    if errorlevel 2 exit /b 1
) else (
    echo ✅ Available disk space: %FREE_GB% GB
)

echo ✅ All system checks passed!

REM Display operation information
echo.
echo ╔══════════════════════════════════════════════════════════════════╗
echo ║                        🚀 OPERATION DETAILS                      ║
echo ╚══════════════════════════════════════════════════════════════════╝
echo.
echo 📊 Expected Results:
echo    • %brand_count% car brands will be processed
echo    • Thousands of high-quality car images
echo    • Organized in brand-specific directories
echo    • Intelligent naming: brand_model_number_timestamp.jpg
echo    • Duplicate detection and prevention
echo.
echo ⏱️  Estimated Time:
echo    • 2-6 hours (depending on internet speed)
echo    • Progress updates every 10 minutes
echo    • Can be safely interrupted and resumed
echo.
echo 💾 Storage Requirements:
echo    • 5-20 GB total (varies by image count and quality)
echo    • Images saved to: %CD%\brand_directories\
echo.
echo ⚠️  Important Warnings:
echo    • This process will download thousands of images
echo    • Ensure stable internet connection
echo    • Don't close this window during operation
echo    • Process can be stopped safely with Ctrl+C
echo.

echo ╔══════════════════════════════════════════════════════════════════╗
echo ║                       ⚡ READY TO START                           ║
echo ╚══════════════════════════════════════════════════════════════════╝
echo.

set /p confirm="🚀 Start comprehensive image downloading? (y/n): "
if /i not "%confirm%"=="y" if /i not "%confirm%"=="yes" (
    echo.
    echo ❌ Operation cancelled by user
    echo.
    pause
    exit /b 0
)

echo.
echo ╔══════════════════════════════════════════════════════════════════╗
echo ║                    🏁 STARTING DOWNLOAD PROCESS                   ║
echo ╚══════════════════════════════════════════════════════════════════╝
echo.

echo 🚀 Launching NetCarShow image scraper...
echo 📊 Progress will be displayed in real-time
echo 📋 Session log will be saved to: netcarshow-scraping-log.txt
echo ⏸️  Press Ctrl+C to stop safely at any time
echo.

REM Start the scraping process with logging
echo [%date% %time%] Starting NetCarShow comprehensive image scraping > netcarshow-scraping-log.txt
echo [%date% %time%] Using scraper: %SELECTED_SCRAPER% >> netcarshow-scraping-log.txt
echo [%date% %time%] Brand directories: %brand_count% >> netcarshow-scraping-log.txt
echo [%date% %time%] Available space: %FREE_GB% GB >> netcarshow-scraping-log.txt
echo. >> netcarshow-scraping-log.txt

node "%SELECTED_SCRAPER%" 2>&1 | tee -a netcarshow-scraping-log.txt

set PROCESS_EXIT_CODE=%ERRORLEVEL%

echo.
echo [%date% %time%] Process completed with exit code: %PROCESS_EXIT_CODE% >> netcarshow-scraping-log.txt

echo ╔══════════════════════════════════════════════════════════════════╗
echo ║                      🏁 PROCESS COMPLETED                         ║
echo ╚══════════════════════════════════════════════════════════════════╝
echo.

if %PROCESS_EXIT_CODE% EQU 0 (
    echo ✅ SUCCESS: Image downloading completed successfully!
) else (
    echo ⚠️  Process ended with exit code: %PROCESS_EXIT_CODE%
    echo    This might indicate:
    echo    - Manual interruption (Ctrl+C)
    echo    - Network connectivity issues  
    echo    - Insufficient disk space
    echo    - Other system errors
)

echo.
echo 📊 SESSION SUMMARY:
echo ════════════════════════════════════════

if exist "netcarshow-scraping-log.txt" (
    echo 📋 Detailed log saved: netcarshow-scraping-log.txt
    echo 📁 Images location: %CD%\brand_directories\
    echo.
    
    REM Count downloaded images
    echo 🔍 Counting downloaded images...
    set total_images=0
    for /r "brand_directories" %%f in (*.jpg *.jpeg *.png *.webp *.gif) do set /a total_images+=1
    echo 📸 Total images in directories: %total_images%
    
) else (
    echo ⚠️  Log file not found
)

echo.
echo 🎉 Thank you for using NetCarShow Image Downloader!
echo.
echo Next steps:
echo   • Review the downloaded images in brand_directories\
echo   • Check netcarshow-scraping-log.txt for detailed information
echo   • Re-run this script to download any missed images
echo.

pause