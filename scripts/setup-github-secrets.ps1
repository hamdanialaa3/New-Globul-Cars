# 🔐 GitHub Secrets Setup Script
# Automates Firebase secrets extraction and provides GitHub CLI commands

$ErrorActionPreference = "Stop"

Write-Host "════════════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "🔐 Firebase GitHub Secrets Setup Wizard" -ForegroundColor Cyan
Write-Host "════════════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""

# Check if Firebase CLI is installed
Write-Host "🔍 Checking Firebase CLI..." -ForegroundColor Yellow
$firebaseInstalled = Get-Command firebase -ErrorAction SilentlyContinue

if (-not $firebaseInstalled) {
    Write-Host "❌ Firebase CLI not found!" -ForegroundColor Red
    Write-Host "   Install: npm install -g firebase-tools" -ForegroundColor Yellow
    Write-Host ""
    exit 1
}
Write-Host "✅ Firebase CLI found" -ForegroundColor Green

# Read .firebaserc to get project ID
Write-Host ""
Write-Host "📋 Reading .firebaserc..." -ForegroundColor Yellow
$firebaserc = Get-Content ".firebaserc" -Raw | ConvertFrom-Json
$projectId = $firebaserc.projects.default

if (-not $projectId) {
    Write-Host "❌ Cannot find Firebase project ID in .firebaserc" -ForegroundColor Red
    exit 1
}

Write-Host "✅ Project ID: $projectId" -ForegroundColor Green

# Check if GitHub CLI is installed
Write-Host ""
Write-Host "🔍 Checking GitHub CLI..." -ForegroundColor Yellow
$ghInstalled = Get-Command gh -ErrorAction SilentlyContinue

if ($ghInstalled) {
    Write-Host "✅ GitHub CLI found - Can add secrets automatically" -ForegroundColor Green
    $useGhCli = $true
} else {
    Write-Host "⚠️  GitHub CLI not found - Will show manual instructions" -ForegroundColor Yellow
    Write-Host "   Install: winget install GitHub.cli" -ForegroundColor Yellow
    $useGhCli = $false
}

# Get current repository
Write-Host ""
Write-Host "📦 Repository: hamdanialaa3/New-Globul-Cars" -ForegroundColor Cyan

# Check for service account key
Write-Host ""
Write-Host "════════════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "🔑 Firebase Service Account" -ForegroundColor Cyan
Write-Host "════════════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""

$serviceAccountPath = "firebase-service-account.json"
$serviceAccountExists = Test-Path $serviceAccountPath

if ($serviceAccountExists) {
    Write-Host "✅ Found: $serviceAccountPath" -ForegroundColor Green
    $serviceAccount = Get-Content $serviceAccountPath -Raw
} else {
    Write-Host "❌ Service account key not found at: $serviceAccountPath" -ForegroundColor Red
    Write-Host ""
    Write-Host "📚 How to get it:" -ForegroundColor Yellow
    Write-Host "   1. Go to: https://console.firebase.google.com/project/$projectId/settings/serviceaccounts/adminsdk" -ForegroundColor White
    Write-Host "   2. Click 'Generate new private key'" -ForegroundColor White
    Write-Host "   3. Save as: $serviceAccountPath" -ForegroundColor White
    Write-Host "   4. Re-run this script" -ForegroundColor White
    Write-Host ""
    
    # Open browser
    $openBrowser = Read-Host "Open Firebase Console now? (Y/n)"
    if ($openBrowser -ne "n") {
        Start-Process "https://console.firebase.google.com/project/$projectId/settings/serviceaccounts/adminsdk"
    }
    
    exit 1
}

# Add secrets
Write-Host ""
Write-Host "════════════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "🚀 Adding Secrets to GitHub" -ForegroundColor Cyan
Write-Host "════════════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""

if ($useGhCli) {
    # Check if logged in
    $ghAuthStatus = gh auth status 2>&1
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ GitHub CLI not authenticated" -ForegroundColor Red
        Write-Host "   Run: gh auth login" -ForegroundColor Yellow
        exit 1
    }
    
    Write-Host "🔐 Adding FIREBASE_PROJECT_ID..." -ForegroundColor Yellow
    echo $projectId | gh secret set FIREBASE_PROJECT_ID -R hamdanialaa3/New-Globul-Cars
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ FIREBASE_PROJECT_ID added successfully" -ForegroundColor Green
    } else {
        Write-Host "❌ Failed to add FIREBASE_PROJECT_ID" -ForegroundColor Red
    }
    
    Write-Host ""
    Write-Host "🔐 Adding FIREBASE_SERVICE_ACCOUNT..." -ForegroundColor Yellow
    echo $serviceAccount | gh secret set FIREBASE_SERVICE_ACCOUNT -R hamdanialaa3/New-Globul-Cars
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ FIREBASE_SERVICE_ACCOUNT added successfully" -ForegroundColor Green
    } else {
        Write-Host "❌ Failed to add FIREBASE_SERVICE_ACCOUNT" -ForegroundColor Red
    }
    
    Write-Host ""
    Write-Host "════════════════════════════════════════════════════════════════" -ForegroundColor Green
    Write-Host "✅ Secrets Added Successfully!" -ForegroundColor Green
    Write-Host "════════════════════════════════════════════════════════════════" -ForegroundColor Green
    Write-Host ""
    Write-Host "🚀 Next Steps:" -ForegroundColor Cyan
    Write-Host "   1. Go to: https://github.com/hamdanialaa3/New-Globul-Cars/actions" -ForegroundColor White
    Write-Host "   2. Re-run the failed workflow" -ForegroundColor White
    Write-Host "   3. Or push a commit to trigger deployment" -ForegroundColor White
    
} else {
    # Manual instructions
    Write-Host "📋 Manual Setup Instructions:" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "1️⃣  FIREBASE_PROJECT_ID:" -ForegroundColor Yellow
    Write-Host "   Value: $projectId" -ForegroundColor White
    Write-Host ""
    Write-Host "2️⃣  FIREBASE_SERVICE_ACCOUNT:" -ForegroundColor Yellow
    Write-Host "   Copy content from: $serviceAccountPath" -ForegroundColor White
    Write-Host ""
    Write-Host "📝 Add secrets at:" -ForegroundColor Cyan
    Write-Host "   https://github.com/hamdanialaa3/New-Globul-Cars/settings/secrets/actions" -ForegroundColor White
    Write-Host ""
    
    # Copy to clipboard
    Write-Host "📋 FIREBASE_PROJECT_ID copied to clipboard!" -ForegroundColor Green
    Set-Clipboard -Value $projectId
    
    Write-Host ""
    $openSecrets = Read-Host "Open GitHub Secrets page now? (Y/n)"
    if ($openSecrets -ne "n") {
        Start-Process "https://github.com/hamdanialaa3/New-Globul-Cars/settings/secrets/actions"
    }
}

Write-Host ""
Write-Host "════════════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "Done! 🎉" -ForegroundColor Green
Write-Host "════════════════════════════════════════════════════════════════" -ForegroundColor Cyan
