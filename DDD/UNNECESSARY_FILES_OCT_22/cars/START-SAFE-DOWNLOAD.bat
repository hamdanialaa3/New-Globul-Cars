@echo off
chcp 65001 >nul
title 🎯 SAFE DOWNLOAD - Step by Step Scraper

echo.
echo 🎯 ══════════════════════════════════════════════════════════════════════════════════════════
echo 📸 SAFE STEP-BY-STEP DOWNLOAD MODE
echo 🎯 ══════════════════════════════════════════════════════════════════════════════════════════
echo.
echo 🛡️  MAXIMUM PROTECTION AGAINST BLOCKING
echo 🐌 SLOW AND STEADY APPROACH
echo ✅ PERFECT FOR BEGINNERS OR CAREFUL DOWNLOADING
echo.

REM System check
echo 🔧 System check...
node --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Node.js not found!
    pause
    exit /b 1
) else (
    echo ✅ Node.js ready
)

echo.
echo 🎯 SAFE DOWNLOAD OPTIONS:
echo.
echo [1] 🧪 Test Run (3 brands, simulation mode)
echo [2] 🐌 Safe Download (5 brands, real download)  
echo [3] ⚡ Medium Speed (10 brands, balanced)
echo [4] 🚀 Fast Download (20 brands, higher speed)
echo [5] 🔧 Custom Configuration
echo [0] ❌ Exit
echo.

set /p CHOICE="Choose your option (0-5): "

if "%CHOICE%"=="0" exit /b 0
if "%CHOICE%"=="1" goto test_run
if "%CHOICE%"=="2" goto safe_download
if "%CHOICE%"=="3" goto medium_speed
if "%CHOICE%"=="4" goto fast_download
if "%CHOICE%"=="5" goto custom_config

echo ❌ Invalid choice
pause
exit /b 1

:test_run
echo.
echo 🧪 TEST RUN MODE
echo    📊 3 brands only
echo    🎭 Simulation mode (no actual downloads)
echo    ⏱️  Duration: ~5 minutes
echo.
node working-ultimate-scraper.js
goto end

:safe_download
echo.
echo 🐌 SAFE DOWNLOAD MODE
echo    📊 5 brands maximum
echo    🛡️  Extra protection delays (5-12 seconds)
echo    💾 Real downloads enabled
echo    ⏱️  Duration: ~30-60 minutes
echo.
echo 🔧 Creating safe configuration...

echo import fs from 'fs'; > temp-safe-config.js
echo const config = { >> temp-safe-config.js
echo   maxBrands: 5, >> temp-safe-config.js
echo   maxModelsPerBrand: 10, >> temp-safe-config.js
echo   maxImagesPerModel: 30, >> temp-safe-config.js
echo   smartDelayMin: 5000, >> temp-safe-config.js
echo   smartDelayMax: 12000, >> temp-safe-config.js
echo   simulationMode: false, >> temp-safe-config.js
echo   verboseMode: true >> temp-safe-config.js
echo }; >> temp-safe-config.js
echo fs.writeFileSync('safe-config.json', JSON.stringify(config, null, 2)); >> temp-safe-config.js

node temp-safe-config.js
del temp-safe-config.js

node full-download-scraper.js safe-config.json
goto end

:medium_speed
echo.
echo ⚡ MEDIUM SPEED MODE
echo    📊 10 brands maximum
echo    🛡️  Standard protection (2-8 seconds)
echo    💾 Real downloads enabled
echo    ⏱️  Duration: ~1-2 hours
echo.
node full-download-scraper.js
goto end

:fast_download
echo.
echo 🚀 FAST DOWNLOAD MODE
echo    📊 20 brands maximum
echo    ⚡ Faster pace (1-5 seconds)
echo    💾 Real downloads enabled
echo    ⏱️  Duration: ~2-4 hours
echo    ⚠️  WARNING: Higher chance of blocking
echo.
set /p CONFIRM="Continue with fast mode? Risk of blocking! (y/N): "
if /i not "%CONFIRM%"=="y" goto menu

echo 🔧 Creating fast configuration...

echo import fs from 'fs'; > temp-fast-config.js
echo const config = { >> temp-fast-config.js
echo   maxBrands: 20, >> temp-fast-config.js
echo   maxModelsPerBrand: 25, >> temp-fast-config.js
echo   maxImagesPerModel: 40, >> temp-fast-config.js
echo   smartDelayMin: 1000, >> temp-fast-config.js
echo   smartDelayMax: 5000, >> temp-fast-config.js
echo   simulationMode: false, >> temp-fast-config.js
echo   verboseMode: false >> temp-fast-config.js
echo }; >> temp-fast-config.js
echo fs.writeFileSync('fast-config.json', JSON.stringify(config, null, 2)); >> temp-fast-config.js

node temp-fast-config.js
del temp-fast-config.js

node full-download-scraper.js fast-config.json
goto end

:custom_config
echo.
echo 🔧 CUSTOM CONFIGURATION
echo.
set /p MAX_BRANDS="Max brands to process (1-50): "
set /p MAX_MODELS="Max models per brand (1-100): "
set /p MAX_IMAGES="Max images per model (1-200): "
set /p DELAY_MIN="Min delay between requests in seconds (1-30): "
set /p DELAY_MAX="Max delay between requests in seconds (1-60): "
set /p SIMULATE="Simulation mode only? (y/N): "

echo 🔧 Creating custom configuration...

echo import fs from 'fs'; > temp-custom-config.js
echo const config = { >> temp-custom-config.js
echo   maxBrands: %MAX_BRANDS%, >> temp-custom-config.js
echo   maxModelsPerBrand: %MAX_MODELS%, >> temp-custom-config.js
echo   maxImagesPerModel: %MAX_IMAGES%, >> temp-custom-config.js
echo   smartDelayMin: %DELAY_MIN%000, >> temp-custom-config.js
echo   smartDelayMax: %DELAY_MAX%000, >> temp-custom-config.js
if /i "%SIMULATE%"=="y" (
    echo   simulationMode: true, >> temp-custom-config.js
) else (
    echo   simulationMode: false, >> temp-custom-config.js
)
echo   verboseMode: true >> temp-custom-config.js
echo }; >> temp-custom-config.js
echo fs.writeFileSync('custom-config.json', JSON.stringify(config, null, 2)); >> temp-custom-config.js

node temp-custom-config.js
del temp-custom-config.js

node full-download-scraper.js custom-config.json
goto end

:end
echo.
echo 🏁 ══════════════════════════════════════════════════════════════════════════════════════════
if errorlevel 1 (
    echo ❌ Process ended with errors
) else (
    echo ✅ Process completed successfully!
)
echo 🏁 ══════════════════════════════════════════════════════════════════════════════════════════
echo.
pause