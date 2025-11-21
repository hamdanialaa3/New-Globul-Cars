@echo off
REM Clear Cache Script for Bulgarian Car Marketplace
REM تنظيف الكاش لـ webpack و node_modules

echo 🧹 Starting cache cleanup...

cd bulgarian-car-marketplace

REM Clear webpack cache
if exist "node_modules\.cache" (
    echo 🗑️  Removing webpack cache...
    rmdir /s /q "node_modules\.cache"
    echo ✅ Webpack cache cleared
) else (
    echo ℹ️  No webpack cache found
)

REM Clear build directory (optional)
if exist "build" (
    echo 🗑️  Removing build directory...
    rmdir /s /q "build"
    echo ✅ Build directory cleared
) else (
    echo ℹ️  No build directory found
)

echo.
echo ✅ Cache cleanup completed!
echo 🚀 You can now restart the dev server with: npm start

pause

