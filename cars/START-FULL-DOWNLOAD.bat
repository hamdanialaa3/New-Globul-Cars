@echo off
chcp 65001 >nul
title 🚀 FULL DOWNLOAD - Ultimate Anti-Block Scraper

echo.
echo 🚀 ══════════════════════════════════════════════════════════════════════════════════════════
echo 📸 FULL DOWNLOAD MODE - ULTIMATE ANTI-BLOCK NETCARSHOW SCRAPER
echo 🚀 ══════════════════════════════════════════════════════════════════════════════════════════
echo.
echo 🔥 READY TO DOWNLOAD ALL CAR IMAGES FROM NETCARSHOW.COM
echo 🛡️  WITH MAXIMUM PROTECTION AGAINST IP/MAC BLOCKING
echo.
echo ⚠️  WARNING: This will download THOUSANDS of images!
echo 💾 Ensure you have at least 5-10 GB free disk space
echo ⏱️  Estimated time: 2-8 hours (depending on your connection)
echo.
echo 🛡️  ══════════════════════════════════════════════════════════════════════════════════════════
echo.

REM Quick system check
echo 🔧 Quick system check...

node --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Node.js not found! Please install Node.js first.
    pause
    exit /b 1
) else (
    echo ✅ Node.js ready
)

node -e "import('axios').then(()=>console.log('✅ Dependencies ready')).catch(()=>{console.log('❌ Dependencies missing'); process.exit(1)})" 2>nul
if errorlevel 1 (
    echo 🔧 Installing dependencies...
    npm install axios cheerio
    if errorlevel 1 (
        echo ❌ Failed to install dependencies
        pause
        exit /b 1
    )
)

echo.
echo 📁 Checking directories...

if not exist "brand_directories" (
    echo 📁 Creating brand_directories...
    mkdir brand_directories
) else (
    echo ✅ Brand directories ready
)

echo.
echo 💾 Checking disk space...

for /f "tokens=3" %%a in ('dir /-c %~dp0 2^>nul ^| find "bytes free"') do (
    set BYTES_FREE=%%a
    set /a GB_FREE=!BYTES_FREE! / 1073741824
    if !GB_FREE! LSS 3 (
        echo ⚠️  WARNING: Low disk space: !GB_FREE! GB free
        echo 💾 Recommended: At least 5 GB free space
        set /p CONTINUE="Continue anyway? (y/N): "
        if /i not "!CONTINUE!"=="y" (
            echo ❌ Operation cancelled
            pause
            exit /b 1
        )
    ) else (
        echo ✅ Sufficient disk space: !GB_FREE! GB free
    )
)

echo.
echo ⚙️  DOWNLOAD CONFIGURATION:
echo    📊 Max brands: 10 (modify in script for more)
echo    📊 Max models per brand: 20
echo    📊 Max images per model: 50
echo    🛡️  Smart delays: 2-8 seconds between requests
echo    🔄 Auto-retry: Up to 5 attempts per request
echo    🚨 Block detection: Automatic extended delays
echo.

set /p CONFIRM="🚀 START FULL DOWNLOAD? This will take several hours! (y/N): "
if /i not "!CONFIRM!"=="y" (
    echo ❌ Download cancelled by user
    pause
    exit /b 0
)

echo.
echo 🔥 ══════════════════════════════════════════════════════════════════════════════════════════
echo 🚀 LAUNCHING FULL DOWNLOAD WITH ULTIMATE PROTECTION
echo 🔥 ══════════════════════════════════════════════════════════════════════════════════════════
echo.
echo 💡 TIPS DURING DOWNLOAD:
echo    • Press Ctrl+C to safely stop at any time
echo    • Progress reports will show every 5 minutes
echo    • All downloaded images are saved automatically
echo    • You can resume later if interrupted
echo.

REM Start full download
node full-download-scraper.js

echo.
echo 🏁 ══════════════════════════════════════════════════════════════════════════════════════════
if errorlevel 1 (
    echo ❌ Download ended with errors
    echo 🔍 Check the logs above for details
    echo 💾 Partial downloads are saved and can be resumed
) else (
    echo ✅ FULL DOWNLOAD COMPLETED SUCCESSFULLY!
    echo 🎉 All images have been downloaded and organized
    echo 📁 Check the brand_directories folder for your images
)
echo 🏁 ══════════════════════════════════════════════════════════════════════════════════════════

echo.
pause