@echo off
REM Safe Checkpoint Creator for Windows
REM Creates a complete backup of the project at current state
REM Date: November 3, 2025

echo ========================================
echo Creating Safe Checkpoint for Project
echo ========================================
echo.

REM Get timestamp
for /f "tokens=2 delims==" %%I in ('wmic os get localdatetime /value') do set datetime=%%I
set CHECKPOINT_DATE=%datetime:~0,8%-%datetime:~8,6%
set CHECKPOINT_NAME=safe-checkpoint-%CHECKPOINT_DATE%

echo Checkpoint Name: %CHECKPOINT_NAME%
echo.

REM Step 1: Check Git status
echo Step 1: Checking Git status...
git status
echo.

set /p ADD_ALL="Do you want to add all changes? (y/n): "
if /i "%ADD_ALL%"=="y" (
    echo Adding all changes...
    git add .
)

REM Step 2: Create commit
echo.
echo Step 2: Creating commit...
git commit -m "checkpoint: Safe checkpoint before refactoring - %CHECKPOINT_DATE%"

REM Step 3: Create Git tag
echo.
echo Step 3: Creating Git tag...
git tag -a "%CHECKPOINT_NAME%" -m "Safe Checkpoint - Pre-Refactoring State"

REM Step 4: Create backup branch
echo.
echo Step 4: Creating backup branch...
set BACKUP_BRANCH=backup/safe-checkpoint-%CHECKPOINT_DATE%
git branch "%BACKUP_BRANCH%"

REM Step 5: Push to remote (optional)
echo.
set /p PUSH_REMOTE="Do you want to push to remote repository? (y/n): "
if /i "%PUSH_REMOTE%"=="y" (
    echo Pushing to remote...
    git push origin "%BACKUP_BRANCH%"
    git push origin "%CHECKPOINT_NAME%"
    echo Done: Pushed to remote repository
) else (
    echo Skipped: Remote push (local backup only)
)

REM Step 6: Create logs directory
echo.
echo Step 5: Creating checkpoint logs...
if not exist "logs\checkpoints" mkdir logs\checkpoints

REM Step 7: Create manifest
echo Safe Checkpoint Manifest > logs\checkpoints\manifest-%CHECKPOINT_DATE%.txt
echo ======================== >> logs\checkpoints\manifest-%CHECKPOINT_DATE%.txt
echo. >> logs\checkpoints\manifest-%CHECKPOINT_DATE%.txt
echo Checkpoint Name: %CHECKPOINT_NAME% >> logs\checkpoints\manifest-%CHECKPOINT_DATE%.txt
echo Date: %date% %time% >> logs\checkpoints\manifest-%CHECKPOINT_DATE%.txt
echo. >> logs\checkpoints\manifest-%CHECKPOINT_DATE%.txt

git rev-parse HEAD > logs\checkpoints\commit-hash.txt
echo Done: Manifest created

REM Step 8: Create recovery instructions
echo. > logs\checkpoints\RECOVERY-%CHECKPOINT_DATE%.md
echo # Recovery Instructions - %CHECKPOINT_NAME% >> logs\checkpoints\RECOVERY-%CHECKPOINT_DATE%.md
echo. >> logs\checkpoints\RECOVERY-%CHECKPOINT_DATE%.md
echo **Created:** %date% %time% >> logs\checkpoints\RECOVERY-%CHECKPOINT_DATE%.md
echo **Git Tag:** %CHECKPOINT_NAME% >> logs\checkpoints\RECOVERY-%CHECKPOINT_DATE%.md
echo **Backup Branch:** %BACKUP_BRANCH% >> logs\checkpoints\RECOVERY-%CHECKPOINT_DATE%.md
echo. >> logs\checkpoints\RECOVERY-%CHECKPOINT_DATE%.md
echo ## How to Restore This Checkpoint >> logs\checkpoints\RECOVERY-%CHECKPOINT_DATE%.md
echo. >> logs\checkpoints\RECOVERY-%CHECKPOINT_DATE%.md
echo ```bash >> logs\checkpoints\RECOVERY-%CHECKPOINT_DATE%.md
echo git checkout %CHECKPOINT_NAME% >> logs\checkpoints\RECOVERY-%CHECKPOINT_DATE%.md
echo npm install >> logs\checkpoints\RECOVERY-%CHECKPOINT_DATE%.md
echo npm run build >> logs\checkpoints\RECOVERY-%CHECKPOINT_DATE%.md
echo ``` >> logs\checkpoints\RECOVERY-%CHECKPOINT_DATE%.md

echo Done: Recovery instructions created

REM Summary
echo.
echo ========================================
echo Done: Safe Checkpoint Created Successfully!
echo ========================================
echo.
echo Checkpoint Details:
echo   Name: %CHECKPOINT_NAME%
echo   Git Tag: %CHECKPOINT_NAME%
echo   Backup Branch: %BACKUP_BRANCH%
echo.
echo To restore this checkpoint later:
echo   git checkout %CHECKPOINT_NAME%
echo.
echo Recovery instructions saved to:
echo   logs\checkpoints\RECOVERY-%CHECKPOINT_DATE%.md
echo.
echo ========================================
echo You can now safely proceed with refactoring!
echo ========================================
echo.

pause

