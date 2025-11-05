@echo off
echo ========================================
echo Starting Dev Server with 4GB Memory
echo ========================================
echo.

cd /d "%~dp0"

echo [1/3] Cleaning cache...
if exist "node_modules\.cache" (
    rmdir /S /Q "node_modules\.cache"
    echo     ✓ Deleted cache
)

echo [2/3] Cleaning build...
if exist "build" (
    rmdir /S /Q "build"
    echo     ✓ Deleted build
)

if exist ".eslintcache" (
    del /F /Q ".eslintcache"
    echo     ✓ Deleted .eslintcache
)

echo [3/3] Starting dev server with 4GB memory...
echo.
echo ⏳ This will take 2-3 minutes to compile...
echo.

set NODE_OPTIONS=--max_old_space_size=4096

npm start

pause

