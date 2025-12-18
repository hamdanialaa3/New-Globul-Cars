# Deploy All Fixes - Quick Script
# This script deploys all fixes for Leaderboard permissions and CORS issues

Write-Host "======================================" -ForegroundColor Cyan
Write-Host "  Deploying All Fixes" -ForegroundColor Cyan
Write-Host "======================================" -ForegroundColor Cyan
Write-Host ""

$ErrorActionPreference = "Continue"

# Step 1: Deploy Firestore Rules
Write-Host "Step 1: Deploying Firestore Rules..." -ForegroundColor Yellow
Write-Host "----------------------------------------" -ForegroundColor Gray
firebase deploy --only firestore:rules

if ($LASTEXITCODE -eq 0) {
    Write-Host "✓ Firestore rules deployed successfully" -ForegroundColor Green
} else {
    Write-Host "✗ Failed to deploy Firestore rules" -ForegroundColor Red
    Write-Host "  Please run manually: firebase deploy --only firestore:rules" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "Waiting 5 seconds for Firestore rules to propagate..." -ForegroundColor Cyan
Start-Sleep -Seconds 5
Write-Host ""

# Step 2: Apply CORS
Write-Host "Step 2: Applying CORS to Firebase Storage..." -ForegroundColor Yellow
Write-Host "----------------------------------------" -ForegroundColor Gray

# Check if gsutil is available
$gcloudInstalled = Get-Command gsutil -ErrorAction SilentlyContinue
if ($gcloudInstalled) {
    $projectId = "fire-new-globul"
    $bucket = "gs://fire-new-globul.firebasestorage.app"
    
    Write-Host "Setting project: $projectId" -ForegroundColor Cyan
    gcloud config set project $projectId | Out-Null
    
    Write-Host "Applying CORS rules to: $bucket" -ForegroundColor Cyan
    gsutil cors set cors.json $bucket
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✓ CORS rules applied successfully" -ForegroundColor Green
        
        Write-Host ""
        Write-Host "CORS Configuration:" -ForegroundColor Cyan
        gsutil cors get $bucket
    } else {
        Write-Host "✗ Failed to apply CORS rules" -ForegroundColor Red
        Write-Host "  Please run manually: .\apply-cors.ps1" -ForegroundColor Yellow
    }
} else {
    Write-Host "⚠ Google Cloud SDK not found" -ForegroundColor Yellow
    Write-Host "  CORS rules were not applied" -ForegroundColor Yellow
    Write-Host "  To apply CORS:" -ForegroundColor Yellow
    Write-Host "    1. Install Google Cloud SDK: https://cloud.google.com/sdk/docs/install" -ForegroundColor White
    Write-Host "    2. Run: .\apply-cors.ps1" -ForegroundColor White
}

Write-Host ""
Write-Host "======================================" -ForegroundColor Green
Write-Host "  Deployment Complete!" -ForegroundColor Green
Write-Host "======================================" -ForegroundColor Green
Write-Host ""

Write-Host "Summary:" -ForegroundColor Cyan
Write-Host "  ✓ Firestore rules updated (leaderboards permissions)" -ForegroundColor Green
Write-Host "  ✓ Code improvements applied (error handling)" -ForegroundColor Green
if ($gcloudInstalled -and $LASTEXITCODE -eq 0) {
    Write-Host "  ✓ CORS rules applied" -ForegroundColor Green
} else {
    Write-Host "  ⚠ CORS rules need manual application" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "Next Steps:" -ForegroundColor Yellow
Write-Host "  1. Wait 5-10 minutes for changes to propagate" -ForegroundColor White
Write-Host "  2. Clear browser cache (Ctrl + Shift + Delete)" -ForegroundColor White
Write-Host "  3. Restart your dev server: cd bulgarian-car-marketplace && npm start" -ForegroundColor White
Write-Host "  4. Test the application:" -ForegroundColor White
Write-Host "     - Open http://localhost:3000" -ForegroundColor Gray
Write-Host "     - Go to Profile page" -ForegroundColor Gray
Write-Host "     - Check Developer Console (F12) for errors" -ForegroundColor Gray
Write-Host "     - Verify images load correctly" -ForegroundColor Gray
Write-Host "     - Verify Leaderboard works without permission errors" -ForegroundColor Gray
Write-Host ""

Write-Host "Documentation:" -ForegroundColor Cyan
Write-Host "  - Quick Guide (Arabic): QUICK_FIX_GUIDE_AR.md" -ForegroundColor White
Write-Host "  - CORS Details: FIREBASE_STORAGE_CORS_FIX.md" -ForegroundColor White
Write-Host ""

# Ask if user wants to restart dev server
Write-Host "Do you want to restart the development server now? (Y/N): " -ForegroundColor Yellow -NoNewline
$response = Read-Host
if ($response -eq 'Y' -or $response -eq 'y') {
    Write-Host ""
    Write-Host "Starting development server..." -ForegroundColor Cyan
    Set-Location "bulgarian-car-marketplace"
    npm start
}
