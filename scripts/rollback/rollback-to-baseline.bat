@echo off
REM Rollback to Pre-Refactoring Baseline
REM Safe restoration script

echo ========================================
echo    ROLLBACK TO SAFE CHECKPOINT
echo ========================================
echo.
echo This will restore project to pre-refactoring state
echo Checkpoint: SAFE-CHECKPOINT-COMPLETE-20251103
echo.
pause

cd bulgarian-car-marketplace

echo.
echo Rolling back...
echo.

REM Option 1: Checkout tag
git checkout SAFE-CHECKPOINT-COMPLETE-20251103

echo.
echo Rollback complete!
echo.
echo Next steps:
echo 1. npm install
echo 2. npm run build
echo 3. npm test
echo.

pause

