# Create Checkpoint Commit - 20 نوفمبر 2025
# Run: powershell -ExecutionPolicy Bypass -File CREATE_CHECKPOINT_COMMIT.ps1

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Create Checkpoint Commit" -ForegroundColor Cyan
Write-Host "Date: 20 نوفمبر 2025" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Check if git is available
if (-not (Get-Command git -ErrorAction SilentlyContinue)) {
    Write-Host "❌ Git is not installed or not in PATH" -ForegroundColor Red
    exit 1
}

# Get current directory
$projectRoot = Get-Location
Write-Host "Project Root: $projectRoot" -ForegroundColor Yellow
Write-Host ""

# Check git status
Write-Host "Checking git status..." -ForegroundColor Cyan
$gitStatus = git status --porcelain
if (-not $gitStatus) {
    Write-Host "✅ No changes to commit" -ForegroundColor Green
    exit 0
}

Write-Host "Found changes:" -ForegroundColor Yellow
$gitStatus | Select-Object -First 20 | ForEach-Object { Write-Host "  $_" -ForegroundColor Gray }
if ($gitStatus.Count -gt 20) {
    Write-Host "  ... and $($gitStatus.Count - 20) more files" -ForegroundColor Gray
}
Write-Host ""

# Add all files
Write-Host "Adding all files to staging..." -ForegroundColor Cyan
git add -A

# Remove embedded git repository warning
$gitStatusAfter = git status --porcelain
if ($gitStatusAfter -match "functions/New-Globul-Cars") {
    Write-Host "⚠️  Warning: Embedded git repository detected" -ForegroundColor Yellow
    Write-Host "Removing from staging..." -ForegroundColor Yellow
    git rm --cached functions/New-Globul-Cars -r
    Write-Host "✅ Removed embedded repository from staging" -ForegroundColor Green
}

# Create commit message
$commitMessage = @"
checkpoint: Save working state - 20 نوفمبر 2025

✅ Project Status: Working without errors on localhost
✅ Migration Status: ~30% complete (basic structure + some files)
✅ All critical files preserved

Changes:
- Migration partial completion (packages structure)
- Core files migrated (hooks, contexts, constants, locales)
- Services migrated (firebase, logger, social-auth, unified-car)
- UI components migrated (partial)
- Auth pages migrated (LoginPage, RegisterPage)
- Cars package migrated (partial)
- Profile package migrated (partial)
- Large files copied (carData_static.ts, translations.ts)
- Cleanup completed (removed duplicate files)

Files:
- All packages/* files
- Migration documentation
- Checkpoint files (CHECKPOINT_NOV20_2025_*)
- Restore scripts

⚠️  Note: This is a working checkpoint. Project is functional on localhost.
"@

# Show commit message preview
Write-Host ""
Write-Host "Commit message:" -ForegroundColor Cyan
Write-Host $commitMessage -ForegroundColor Gray
Write-Host ""

# Ask for confirmation
$response = Read-Host "Do you want to create this commit? (y/n)"
if ($response -ne "y" -and $response -ne "Y") {
    Write-Host "❌ Commit cancelled" -ForegroundColor Red
    exit 0
}

# Create commit
Write-Host ""
Write-Host "Creating commit..." -ForegroundColor Cyan
git commit -m $commitMessage

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "✅ Commit created successfully!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Commit hash:" -ForegroundColor Cyan
    git log --oneline -1
    Write-Host ""
    Write-Host "To restore this checkpoint:" -ForegroundColor Yellow
    Write-Host "  git reset --hard HEAD" -ForegroundColor White
    Write-Host "  OR" -ForegroundColor White
    Write-Host "  powershell -ExecutionPolicy Bypass -File RESTORE_CHECKPOINT_NOV20_2025.ps1" -ForegroundColor White
} else {
    Write-Host ""
    Write-Host "❌ Commit failed!" -ForegroundColor Red
    Write-Host "Please check git status and try again" -ForegroundColor Yellow
    exit 1
}

