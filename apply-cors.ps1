# Apply CORS rules to Firebase Storage
# This script applies CORS configuration to allow localhost and production access to Firebase Storage

Write-Host "======================================" -ForegroundColor Cyan
Write-Host "  Firebase Storage CORS Setup" -ForegroundColor Cyan
Write-Host "======================================" -ForegroundColor Cyan
Write-Host ""

# Check if gcloud is installed
$gcloudInstalled = Get-Command gsutil -ErrorAction SilentlyContinue
if (-not $gcloudInstalled) {
    Write-Host "ERROR: Google Cloud SDK is not installed!" -ForegroundColor Red
    Write-Host "Please install it from: https://cloud.google.com/sdk/docs/install" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "After installation:" -ForegroundColor Yellow
    Write-Host "  1. Restart PowerShell" -ForegroundColor Yellow
    Write-Host "  2. Run: gcloud auth login" -ForegroundColor Yellow
    Write-Host "  3. Run this script again" -ForegroundColor Yellow
    exit 1
}

Write-Host "✓ Google Cloud SDK is installed" -ForegroundColor Green
Write-Host ""

# Set project
$projectId = "fire-new-globul"
Write-Host "Setting project to: $projectId" -ForegroundColor Cyan
gcloud config set project $projectId

if ($LASTEXITCODE -ne 0) {
    Write-Host ""
    Write-Host "ERROR: Failed to set project. Please run:" -ForegroundColor Red
    Write-Host "  gcloud auth login" -ForegroundColor Yellow
    Write-Host "Then run this script again." -ForegroundColor Yellow
    exit 1
}

Write-Host "✓ Project set successfully" -ForegroundColor Green
Write-Host ""

# Apply CORS
$bucket = "gs://fire-new-globul.firebasestorage.app"
Write-Host "Applying CORS rules to: $bucket" -ForegroundColor Cyan
Write-Host ""

gsutil cors set cors.json $bucket

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "✓ CORS rules applied successfully!" -ForegroundColor Green
    Write-Host ""
    
    # Verify
    Write-Host "Verifying CORS configuration..." -ForegroundColor Cyan
    gsutil cors get $bucket
    
    Write-Host ""
    Write-Host "======================================" -ForegroundColor Green
    Write-Host "  CORS Setup Complete!" -ForegroundColor Green
    Write-Host "======================================" -ForegroundColor Green
    Write-Host ""
    Write-Host "Next steps:" -ForegroundColor Yellow
    Write-Host "  1. Wait 5-10 minutes for changes to propagate" -ForegroundColor White
    Write-Host "  2. Clear browser cache (Ctrl + Shift + Delete)" -ForegroundColor White
    Write-Host "  3. Reload your application" -ForegroundColor White
    Write-Host "  4. Check Developer Console (F12) for CORS errors" -ForegroundColor White
    Write-Host ""
} else {
    Write-Host ""
    Write-Host "ERROR: Failed to apply CORS rules" -ForegroundColor Red
    Write-Host ""
    Write-Host "Troubleshooting:" -ForegroundColor Yellow
    Write-Host "  1. Make sure you're logged in: gcloud auth login" -ForegroundColor White
    Write-Host "  2. Make sure cors.json exists in current directory" -ForegroundColor White
    Write-Host "  3. Check your permissions for the project" -ForegroundColor White
    Write-Host ""
    exit 1
}
