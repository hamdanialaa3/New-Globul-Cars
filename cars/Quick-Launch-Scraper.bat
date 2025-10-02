@echo off
chcp 65001 >nul
title 🛡️  Ultimate Anti-Block Scraper v4.0

echo.
echo 🛡️  ══════════════════════════════════════════════════════════════════════════════════════════
echo 🚗 ULTIMATE ANTI-BLOCK NETCARSHOW SCRAPER v4.0 - ENTERPRISE EDITION
echo 🛡️  ══════════════════════════════════════════════════════════════════════════════════════════
echo.

echo 🔧 Quick System Check...
echo.

REM Check Node.js
node --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Node.js is NOT installed!
    echo 📥 Please install Node.js from: https://nodejs.org/
    pause
    exit /b 1
) else (
    echo ✅ Node.js is installed
)

REM Check if axios is available
echo 🔍 Checking dependencies...
node -e "import('axios').then(()=>console.log('✅ axios: OK')).catch(()=>{console.log('❌ axios: MISSING'); process.exit(1)})" 2>nul
if errorlevel 1 (
    echo 🔧 Installing axios...
    npm install axios
    if errorlevel 1 (
        echo ❌ Failed to install axios
        pause
        exit /b 1
    )
)

echo ✅ All systems ready!
echo.

echo 🚀 LAUNCHING ULTIMATE ANTI-BLOCK SCRAPER...
echo.

REM Start the scraper
node unified-ultimate-scraper.js

echo.
echo 🏁 Scraper completed.
pause