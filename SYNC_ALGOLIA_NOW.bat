@echo off
echo ============================================
echo        ALGOLIA DATA SYNC SCRIPT
echo ============================================
echo.
echo This will sync all cars from Firestore to Algolia
echo.
echo Your Algolia Account:
echo   App ID: RTGDK12KTJ
echo   Index:  cars
echo.
echo Collections to sync:
echo   - passenger_cars
echo   - suvs
echo   - vans
echo   - motorcycles
echo   - trucks
echo   - buses
echo.
echo Press any key to start sync...
pause >nul

echo.
echo Starting sync...
node scripts/sync-algolia.js

echo.
echo ============================================
echo Sync completed! Check output above.
echo ============================================
echo.
echo Next steps:
echo   1. Restart dev server: npm start
echo   2. Go to /cars page and test search
echo   3. Check analytics at /admin
echo.
pause
