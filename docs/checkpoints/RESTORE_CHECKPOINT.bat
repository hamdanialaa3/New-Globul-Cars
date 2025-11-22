@echo off
:: ================================================
:: Script to Restore Checkpoint - Nov 7, 2025
:: استعادة نقطة الحفظ - 7 نوفمبر 2025
:: ================================================

echo.
echo ========================================
echo    Globul Auto - Checkpoint Restore
echo    استعادة نقطة الحفظ
echo ========================================
echo.

cd /d "%~dp0"

echo [1/3] Checking Git status...
echo [1/3] التحقق من حالة Git...
git status

echo.
echo ========================================
echo Available Restore Options:
echo خيارات الاستعادة المتاحة:
echo ========================================
echo.
echo 1. Checkout checkpoint branch
echo    git checkout checkpoint-nov7-2025-stable
echo.
echo 2. Create new branch from checkpoint
echo    git checkout -b my-new-branch checkpoint-nov7-2025-stable
echo.
echo 3. View checkpoint details
echo    git log checkpoint-nov7-2025-stable --oneline -5
echo.
echo ========================================
echo.

:menu
echo Select an option (اختر خياراً):
echo [1] Checkout checkpoint branch
echo [2] Create new branch from checkpoint
echo [3] View checkpoint log
echo [4] Return to main branch
echo [5] Exit
echo.

set /p choice="Enter your choice (1-5): "

if "%choice%"=="1" goto checkout
if "%choice%"=="2" goto newbranch
if "%choice%"=="3" goto viewlog
if "%choice%"=="4" goto main
if "%choice%"=="5" goto end

echo Invalid choice! Please try again.
goto menu

:checkout
echo.
echo [2/3] Switching to checkpoint branch...
echo [2/3] التبديل إلى فرع نقطة الحفظ...
git checkout checkpoint-nov7-2025-stable
echo.
echo ✅ Done! You are now on checkpoint-nov7-2025-stable
echo ✅ تم! أنت الآن على checkpoint-nov7-2025-stable
goto success

:newbranch
echo.
set /p branchname="Enter new branch name: "
echo.
echo [2/3] Creating new branch: %branchname%
git checkout -b %branchname% checkpoint-nov7-2025-stable
echo.
echo ✅ Done! You are now on %branchname%
echo ✅ تم! أنت الآن على %branchname%
goto success

:viewlog
echo.
echo [2/3] Viewing checkpoint log...
git log checkpoint-nov7-2025-stable --oneline -10
echo.
pause
goto menu

:main
echo.
echo [2/3] Returning to main branch...
git checkout main
echo.
echo ✅ Done! You are back on main branch
echo ✅ تم! أنت الآن على الفرع الرئيسي
goto success

:success
echo.
echo ========================================
echo [3/3] Checkpoint restore completed!
echo [3/3] اكتملت استعادة نقطة الحفظ!
echo ========================================
echo.
echo Current branch:
git branch --show-current
echo.
goto end

:end
echo.
echo Press any key to exit...
pause >nul

