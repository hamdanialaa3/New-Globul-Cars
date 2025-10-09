@echo off
echo Fixing Firestore Error...
echo.

cd bulgarian-car-marketplace

echo Step 1: Clearing browser cache...
echo Please manually clear your browser cache (Ctrl+Shift+Delete)
echo.

echo Step 2: Clearing IndexedDB...
echo Close all browser tabs for localhost:3000
echo.

echo Step 3: Removing node_modules/.cache...
if exist "node_modules\.cache" (
    rmdir /s /q "node_modules\.cache"
    echo Cache cleared!
) else (
    echo No cache found
)
echo.

echo Step 4: Restarting server...
echo Please stop the current server (Ctrl+C if running)
echo Then run: npm start
echo.

pause

