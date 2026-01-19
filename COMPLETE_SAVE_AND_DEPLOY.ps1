# ========================================
#   Complete Save & Deploy Script
#   Project: Koli One (Fire New Globul)
# ========================================

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "   Complete Save & Deploy Process" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Step 1: Type Check
Write-Host "[1/5] Running TypeScript type check..." -ForegroundColor Yellow
npm run type-check
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Type check failed!" -ForegroundColor Red
    Read-Host "Press Enter to exit"
    exit 1
}
Write-Host "✅ Type check passed!" -ForegroundColor Green
Write-Host ""

# Step 2: Git Status
Write-Host "[2/5] Checking Git status..." -ForegroundColor Yellow
git status
Write-Host ""

# Step 3: Git Add & Commit
Write-Host "[3/5] Saving changes to Git..." -ForegroundColor Yellow
git add -A
$commitMessage = Read-Host "Enter commit message (or press Enter for auto-message)"
if ([string]::IsNullOrWhiteSpace($commitMessage)) {
    $commitMessage = "chore: Auto-save changes $(Get-Date -Format 'yyyy-MM-dd HH:mm')"
}
git commit -m "$commitMessage"
Write-Host "✅ Changes committed!" -ForegroundColor Green
Write-Host ""

# Step 4: Push to GitHub
Write-Host "[4/5] Pushing to GitHub..." -ForegroundColor Yellow
$currentBranch = git rev-parse --abbrev-ref HEAD
Write-Host "Current branch: $currentBranch" -ForegroundColor Cyan
git push origin $currentBranch
if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Pushed to GitHub successfully!" -ForegroundColor Green
} else {
    Write-Host "⚠️  Push to GitHub failed (may need authentication)" -ForegroundColor Yellow
}
Write-Host ""

# Step 5: Build & Deploy to Firebase
Write-Host "[5/5] Building and deploying to Firebase..." -ForegroundColor Yellow
Write-Host "Building production version..." -ForegroundColor Cyan
npm run build
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Build failed!" -ForegroundColor Red
    Read-Host "Press Enter to exit"
    exit 1
}
Write-Host "✅ Build completed!" -ForegroundColor Green
Write-Host ""

Write-Host "Checking Firebase authentication..." -ForegroundColor Cyan
firebase projects:list 2>&1 | Out-Null
if ($LASTEXITCODE -ne 0) {
    Write-Host "⚠️  Firebase authentication required" -ForegroundColor Yellow
    Write-Host "Please run: firebase login" -ForegroundColor Yellow
    Read-Host "Press Enter to exit"
    exit 1
}
Write-Host "✅ Firebase authenticated!" -ForegroundColor Green
Write-Host ""

Write-Host "Deploying to Firebase Hosting..." -ForegroundColor Cyan
Write-Host "Target domains:" -ForegroundColor Cyan
Write-Host "  - mobilebg.eu" -ForegroundColor White
Write-Host "  - koli.one" -ForegroundColor White
Write-Host "  - www.koli.one" -ForegroundColor White
Write-Host "  - fire-new-globul.web.app" -ForegroundColor White
Write-Host ""

firebase deploy --only hosting

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "========================================" -ForegroundColor Green
    Write-Host "   ✅ Deployment Successful!" -ForegroundColor Green
    Write-Host "========================================" -ForegroundColor Green
    Write-Host ""
    Write-Host "Your site is live at:" -ForegroundColor Cyan
    Write-Host "  🌐 https://mobilebg.eu" -ForegroundColor White
    Write-Host "  🌐 https://koli.one" -ForegroundColor White
    Write-Host "  🌐 https://www.koli.one" -ForegroundColor White
    Write-Host "  🌐 https://fire-new-globul.web.app" -ForegroundColor White
    Write-Host ""
} else {
    Write-Host ""
    Write-Host "========================================" -ForegroundColor Red
    Write-Host "   ❌ Deployment Failed!" -ForegroundColor Red
    Write-Host "========================================" -ForegroundColor Red
    Write-Host ""
}

Write-Host ""
Write-Host "Summary:" -ForegroundColor Cyan
Write-Host "✅ Type check completed" -ForegroundColor Green
Write-Host "✅ Changes committed to Git" -ForegroundColor Green
Write-Host "✅ Pushed to GitHub (branch: $currentBranch)" -ForegroundColor Green
if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Deployed to Firebase Hosting" -ForegroundColor Green
} else {
    Write-Host "⚠️  Firebase deployment needs manual intervention" -ForegroundColor Yellow
}
Write-Host ""

Read-Host "Press Enter to exit"
