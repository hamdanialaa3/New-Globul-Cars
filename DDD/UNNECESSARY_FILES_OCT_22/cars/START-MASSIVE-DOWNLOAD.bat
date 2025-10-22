@echo off
chcp 65001 >nul
title 🔥 MASSIVE DOWNLOAD - NetCarShow Ultimate Scraper

echo.
echo 🔥 ══════════════════════════════════════════════════════════════════════════════════════════
echo 📸 MASSIVE DOWNLOAD MODE - ULTIMATE NETCARSHOW SCRAPER
echo 🔥 ══════════════════════════════════════════════════════════════════════════════════════════
echo.
echo 🚀 READY FOR MASSIVE DOWNLOAD: 100,000+ IMAGES!
echo 🛡️  MAXIMUM PROTECTION + FASTEST SAFE SPEED
echo 💾 ESTIMATED SIZE: 10-20 GB
echo ⏱️  ESTIMATED TIME: 6-12 HOURS
echo.
echo ⚠️  🚨 WARNING: THIS IS A MASSIVE OPERATION! 🚨
echo    💾 Ensure you have at least 25 GB free disk space
echo    ⚡ Ensure stable internet connection
echo    🔌 Keep your computer plugged in
echo    ☕ This will run for many hours
echo.

REM Check system requirements
echo 🔧 System Requirements Check...
echo.

REM Check Node.js
node --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Node.js not found! Please install Node.js first.
    pause
    exit /b 1
) else (
    echo ✅ Node.js ready
)

REM Check dependencies
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

REM Check disk space
echo 📁 Checking disk space...
for /f "tokens=3" %%a in ('dir /-c %~dp0 2^>nul ^| find "bytes free"') do (
    set BYTES_FREE=%%a
    set /a GB_FREE=!BYTES_FREE! / 1073741824
    if !GB_FREE! LSS 20 (
        echo ⚠️  WARNING: Low disk space: !GB_FREE! GB free
        echo 💾 Recommended: At least 25 GB free space for massive download
        set /p CONTINUE="Continue anyway? This may fail! (y/N): "
        if /i not "!CONTINUE!"=="y" (
            echo ❌ Operation cancelled - insufficient disk space
            pause
            exit /b 1
        )
    ) else (
        echo ✅ Sufficient disk space: !GB_FREE! GB free
    )
)

REM Check internet connection
echo 🌐 Testing internet connection...
ping -n 1 www.netcarshow.com >nul 2>&1
if errorlevel 1 (
    echo ❌ Cannot reach NetCarShow.com
    echo 🌐 Check your internet connection
    pause
    exit /b 1
) else (
    echo ✅ Internet connection ready
)

echo.
echo 🔥 MASSIVE DOWNLOAD CONFIGURATION:
echo    🏭 Target: 50 car brands
echo    🚗 Models: Up to 100 per brand
echo    📸 Images: Up to 200 per model  
echo    🎯 Total estimate: 1,000,000 images
echo    💾 Size estimate: 10-20 GB
echo    ⚡ Smart delays: 1.5-4 seconds
echo    🔄 Concurrent: 3 downloads at once
echo    🛡️  Full protection enabled
echo.

echo 🚨 FINAL WARNING:
echo    • This will run for 6-12 hours continuously
echo    • Your computer will be busy downloading
echo    • Do not close this window
echo    • You can press Ctrl+C to stop safely
echo.

set /p FINAL_CONFIRM="🔥 START MASSIVE DOWNLOAD NOW? (Type 'YES' to confirm): "
if not "!FINAL_CONFIRM!"=="YES" (
    echo ❌ Massive download cancelled by user
    echo 💡 To start safely, run: .\START-SAFE-DOWNLOAD.bat
    pause
    exit /b 0
)

echo.
echo 🔥 ══════════════════════════════════════════════════════════════════════════════════════════
echo 🚀 LAUNCHING MASSIVE DOWNLOAD - ULTIMATE PROTECTION MODE
echo 🔥 ══════════════════════════════════════════════════════════════════════════════════════════
echo.
echo 💡 DURING MASSIVE DOWNLOAD:
echo    📊 Progress reports every 5 minutes
echo    🛡️  Auto-protection against blocking
echo    🔄 Auto-retry on failures
echo    💾 All progress is saved automatically
echo    🛑 Press Ctrl+C to stop safely anytime
echo.
echo 🚀 Starting in 3 seconds...
timeout /t 3 /nobreak >nul

REM Start massive download
node massive-download-scraper.js

echo.
echo 🏁 ══════════════════════════════════════════════════════════════════════════════════════════
if errorlevel 1 (
    echo ❌ Massive download ended with errors
    echo 🔍 Check the logs above for details
    echo 💾 All downloaded images are saved
    echo 🔄 You can resume by running this script again
) else (
    echo ✅ MASSIVE DOWNLOAD COMPLETED SUCCESSFULLY!
    echo 🎉 ALL IMAGES HAVE BEEN DOWNLOADED!
    echo 📁 Check the brand_directories folder
    echo 🏆 Congratulations on completing this massive task!
)
echo 🏁 ══════════════════════════════════════════════════════════════════════════════════════════

echo.
echo 📊 Final Statistics:
dir /s brand_directories 2>nul | find "File(s)"
echo.
pause