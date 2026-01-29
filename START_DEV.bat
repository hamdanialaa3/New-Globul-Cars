@echo off
REM =========================================================
REM Optimized Development Server Startup
REM =========================================================
REM This script starts the dev server with performance optimizations

color 0A
echo.
echo  ╔════════════════════════════════════════════════════╗
echo  ║  🚀 KOLI ONE - Development Server Startup          ║
echo  ╚════════════════════════════════════════════════════╝
echo.

REM Kill any process on port 3000 first
echo  [1/3] Clearing port 3000...
netstat -ano | findstr ":3000" >nul && taskkill /F /PID %PORT_PID% >nul 2>&1 || echo  ✓ Port is clear
echo.

REM Set optimization flags
echo  [2/3] Setting memory allocation...
set NODE_OPTIONS=--max_old_space_size=4096
set CRACO_ENABLE_ESLINT_CACHING=true
set SKIP_PREFLIGHT_CHECK=true
echo  ✓ Memory: 4GB allocated
echo  ✓ ESLint Cache: Enabled
echo.

echo  [3/3] Starting development server...
echo.
echo  ⚡ Tips:
echo     - First load may take 30-60 seconds (webpack build)
echo     - Subsequent reloads will be MUCH faster
echo     - Access: http://localhost:3000
echo     - Press CTRL+C to stop
echo.

REM Use the optimized start script if available, otherwise fall back
npm run start:dev

pause
