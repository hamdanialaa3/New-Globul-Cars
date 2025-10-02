@echo off
chcp 65001 >nul
title 🛡️  Ultimate Anti-Block NetCarShow Scraper v4.0 - Enterprise Edition

echo.
echo 🛡️  ══════════════════════════════════════════════════════════════════════════════════════════
echo 🚗 ULTIMATE ANTI-BLOCK NETCARSHOW SCRAPER v4.0 - ENTERPRISE EDITION
echo 🛡️  ══════════════════════════════════════════════════════════════════════════════════════════
echo.
echo 🔒 MULTI-LAYER PROTECTION FEATURES:
echo    🔄 Dynamic Proxy Rotation (Free + Premium)
echo    🌐 Multi-VPN Provider Integration
echo    🎭 Advanced User-Agent ^& Header Randomization  
echo    🧠 Human Behavior Simulation Engine
echo    🚨 Real-time Block Detection ^& Emergency Response
echo    ⚡ Intelligent Rate Limiting ^& Adaptive Delays
echo    🕵️  Stealth Mode ^& Traffic Obfuscation
echo    📸 Complete Image Extraction ^& Organization
echo.
echo 🛡️  ══════════════════════════════════════════════════════════════════════════════════════════
echo.

REM ═══════════════════════════ SYSTEM REQUIREMENTS CHECK ═══════════════════════════
echo 🔧 Checking system requirements...
echo.

REM Check Node.js
echo 📋 Checking Node.js installation...
node --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Node.js is NOT installed!
    echo 📥 Please download and install Node.js from: https://nodejs.org/
    echo 🔧 Minimum required version: Node.js v18.0.0 or higher
    echo.
    pause
    exit /b 1
) else (
    for /f "tokens=*" %%i in ('node --version') do set NODE_VERSION=%%i
    echo ✅ Node.js found: !NODE_VERSION!
)

REM Check NPM
echo 📋 Checking NPM installation...
npm --version >nul 2>&1
if errorlevel 1 (
    echo ❌ NPM is NOT installed!
    echo 🔧 NPM should come with Node.js. Please reinstall Node.js.
    echo.
    pause
    exit /b 1
) else (
    for /f "tokens=*" %%i in ('npm --version') do set NPM_VERSION=%%i
    echo ✅ NPM found: !NPM_VERSION!
)

REM Check PowerShell (for advanced network operations)
echo 📋 Checking PowerShell...
powershell -Command "Write-Host 'PowerShell OK'" >nul 2>&1
if errorlevel 1 (
    echo ⚠️  PowerShell not available - some advanced features may not work
) else (
    echo ✅ PowerShell available for advanced operations
)

echo.
echo ═══════════════════════════ DEPENDENCY CHECK ═══════════════════════════
echo.

REM Check package.json
if not exist package.json (
    echo 📦 Creating package.json...
    echo {> package.json
    echo   "name": "ultimate-anti-block-scraper",>> package.json
    echo   "version": "4.0.0",>> package.json
    echo   "type": "module",>> package.json
    echo   "description": "Ultimate Anti-Block NetCarShow Scraper with Enterprise Protection",>> package.json
    echo   "main": "complete-ultimate-scraper.js",>> package.json
    echo   "scripts": {>> package.json
    echo     "start": "node complete-ultimate-scraper.js",>> package.json
    echo     "test": "node system-test.js">> package.json
    echo   },>> package.json
    echo   "dependencies": {>> package.json
    echo     "axios": "^1.6.0",>> package.json
    echo     "cheerio": "^1.0.0-rc.12">> package.json
    echo   },>> package.json
    echo   "engines": {>> package.json
    echo     "node": "^18.0.0">> package.json
    echo   }>> package.json
    echo }>> package.json
    echo ✅ package.json created
)

REM Install dependencies
echo 📦 Installing/updating dependencies...
echo 🔄 Installing axios (HTTP client with proxy support)...
npm install axios@^1.6.0 --save

echo 🔄 Installing cheerio (HTML parsing)...  
npm install cheerio@^1.0.0-rc.12 --save

REM Check if dependencies were installed successfully
echo.
echo 📋 Verifying dependency installation...
node -e "import('axios').then(()=>console.log('✅ axios: OK')).catch(()=>console.log('❌ axios: FAILED'))"
node -e "import('cheerio').then(()=>console.log('✅ cheerio: OK')).catch(()=>console.log('❌ cheerio: FAILED'))"

echo.
echo ═══════════════════════════ DIRECTORY STRUCTURE CHECK ═══════════════════════════
echo.

REM Check brand directories
if not exist "brand_directories" (
    echo ⚠️  brand_directories folder not found
    echo 🔧 Please ensure you have the brand_directories folder with all car brands
    echo 📁 The scraper needs this structure to organize downloaded images
    echo.
    set /p CONTINUE="Continue anyway? (y/N): "
    if /i not "!CONTINUE!"=="y" (
        echo ❌ Exiting - brand_directories required
        pause
        exit /b 1
    )
) else (
    for /f %%i in ('dir /ad /b brand_directories 2^>nul ^| find /c /v ""') do set BRAND_COUNT=%%i
    echo ✅ Found !BRAND_COUNT! brand directories
)

echo.
echo ═══════════════════════════ DISK SPACE CHECK ═══════════════════════════
echo.

REM Check available disk space
for /f "tokens=3" %%a in ('dir /-c %~dp0 2^>nul ^| find "bytes free"') do set BYTES_FREE=%%a
if defined BYTES_FREE (
    set /a GB_FREE=!BYTES_FREE! / 1073741824
    if !GB_FREE! LSS 5 (
        echo ⚠️  Low disk space: !GB_FREE! GB free
        echo 💾 Recommended: At least 10 GB free space for image downloads
        set /p CONTINUE="Continue anyway? (y/N): "
        if /i not "!CONTINUE!"=="y" (
            echo ❌ Exiting - insufficient disk space
            pause
            exit /b 1
        )
    ) else (
        echo ✅ Sufficient disk space: !GB_FREE! GB free
    )
)

echo.
echo ═══════════════════════════ NETWORK CONNECTIVITY CHECK ═══════════════════════════
echo.

echo 🌐 Testing network connectivity...
ping -n 1 google.com >nul 2>&1
if errorlevel 1 (
    echo ❌ No internet connection detected
    echo 🌐 Please check your internet connection
    echo.
    pause
    exit /b 1
) else (
    echo ✅ Internet connection: OK
)

echo 🌐 Testing target website accessibility...
powershell -Command "try { $response = Invoke-WebRequest -Uri 'https://www.netcarshow.com' -TimeoutSec 10; Write-Host '✅ NetCarShow.com: Accessible' } catch { Write-Host '⚠️ NetCarShow.com: May be blocked or slow' }" 2>nul

echo.
echo ═══════════════════════════ VPN DETECTION ═══════════════════════════
echo.

echo 🔍 Scanning for available VPN providers...

REM Check for ProtonVPN
protonvpn status >nul 2>&1
if not errorlevel 1 (
    echo ✅ ProtonVPN: Available
    set VPN_FOUND=1
)

REM Check for NordVPN  
nordvpn status >nul 2>&1
if not errorlevel 1 (
    echo ✅ NordVPN: Available
    set VPN_FOUND=1
)

REM Check for ExpressVPN
expressvpn status >nul 2>&1
if not errorlevel 1 (
    echo ✅ ExpressVPN: Available
    set VPN_FOUND=1
)

REM Check for Windscribe
windscribe status >nul 2>&1
if not errorlevel 1 (
    echo ✅ Windscribe: Available  
    set VPN_FOUND=1
)

REM Check for Surfshark
surfshark-vpn status >nul 2>&1
if not errorlevel 1 (
    echo ✅ Surfshark: Available
    set VPN_FOUND=1
)

if not defined VPN_FOUND (
    echo ⚠️  No VPN providers detected
    echo 🛡️  The scraper will use proxy rotation for protection
    echo 💡 For maximum protection, consider installing a VPN client
) else (
    echo 🛡️  VPN protection available for enhanced anonymity
)

echo.
echo ═══════════════════════════ FINAL SYSTEM VALIDATION ═══════════════════════════
echo.

REM Final validation
echo 🔍 Performing final system validation...
node -e "
try {
    import('./complete-ultimate-scraper.js').then(module => {
        console.log('✅ Main scraper module: Valid');
    }).catch(err => {
        console.log('❌ Main scraper module: Error - ' + err.message);
        process.exit(1);
    });
} catch (err) {
    console.log('❌ Module validation failed: ' + err.message);
    process.exit(1);
}
"

if errorlevel 1 (
    echo ❌ System validation failed
    echo 🔧 Please check the error messages above
    echo.
    pause
    exit /b 1
)

echo.
echo 🎉 ═══════════════════════════ SYSTEM READY ═══════════════════════════
echo ✅ All systems validated and ready
echo 🛡️  Ultimate protection systems initialized
echo 🚀 Ready to begin protected scraping operation
echo.
echo ⚠️  IMPORTANT NOTES:
echo    • The scraper will automatically handle IP blocking and rate limiting
echo    • Human behavior simulation is enabled for maximum stealth
echo    • All downloaded images will be organized in brand-specific folders
echo    • Progress reports will be displayed every 15 minutes
echo    • Press Ctrl+C at any time to safely stop the operation
echo    • Session data will be preserved for resumption
echo.

set /p START="🚀 Start Ultimate Anti-Block Scraping? (Y/n): "
if /i "!START!"=="n" (
    echo ❌ Operation cancelled by user
    pause
    exit /b 0
)

echo.
echo 🛡️  ══════════════════════════════════════════════════════════════════════════════════════════
echo 🚀 LAUNCHING ULTIMATE ANTI-BLOCK SCRAPER
echo 🛡️  ══════════════════════════════════════════════════════════════════════════════════════════
echo.

REM Start the ultimate scraper
node complete-ultimate-scraper.js

echo.
echo 🏁 ═══════════════════════════ SCRAPING COMPLETED ═══════════════════════════
echo.

if errorlevel 1 (
    echo ❌ Scraper ended with errors
    echo 🔍 Check the logs above for details
) else (
    echo ✅ Scraper completed successfully  
    echo 📊 Check the generated report files for detailed statistics
)

echo.
echo 💾 All session data has been preserved
echo 🔧 You can run this script again to resume or start a new session
echo.
pause