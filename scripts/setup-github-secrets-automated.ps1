#!/usr/bin/env pwsh
<#
.SYNOPSIS
    Automated GitHub Secrets Setup for Firebase Deployment
    
.DESCRIPTION
    This script automates the process of setting up GitHub secrets required
    for Firebase deployment through GitHub Actions. It performs:
    
    1. Extracts Firebase Project ID from .firebaserc
    2. Guides user to download Service Account JSON from Firebase Console
    3. Validates the JSON structure
    4. Securely uploads secrets to GitHub using gh CLI
    5. Verifies the secrets were set correctly
    
.NOTES
    Author: Bulgarian Car Marketplace DevOps Team
    Date: January 10, 2026
    Requires: GitHub CLI (gh), Firebase CLI, PowerShell 7+
    
.EXAMPLE
    .\scripts\setup-github-secrets-automated.ps1
#>

[CmdletBinding()]
param()

# Set strict mode for better error handling
Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

# Color functions for better UX
function Write-ColorOutput {
    param(
        [Parameter(Mandatory = $true)]
        [string]$Message,
        
        [Parameter(Mandatory = $false)]
        [ValidateSet('Success', 'Error', 'Warning', 'Info', 'Header')]
        [string]$Type = 'Info'
    )
    
    $colors = @{
        'Success' = 'Green'
        'Error'   = 'Red'
        'Warning' = 'Yellow'
        'Info'    = 'Cyan'
        'Header'  = 'Magenta'
    }
    
    $icons = @{
        'Success' = '✅'
        'Error'   = '❌'
        'Warning' = '⚠️'
        'Info'    = '📋'
        'Header'  = '🚀'
    }
    
    Write-Host "$($icons[$Type]) $Message" -ForegroundColor $colors[$Type]
}

function Write-SectionHeader {
    param([string]$Title)
    Write-Host "`n$('='*80)" -ForegroundColor Magenta
    Write-ColorOutput -Message $Title -Type 'Header'
    Write-Host "$('='*80)`n" -ForegroundColor Magenta
}

# Main script
try {
    Write-SectionHeader "GitHub Secrets Setup - Firebase Deployment Automation"
    
    # Step 1: Verify prerequisites
    Write-ColorOutput -Message "Step 1/6: Verifying prerequisites..." -Type 'Info'
    
    # Check GitHub CLI
    if (-not (Get-Command gh -ErrorAction SilentlyContinue)) {
        Write-ColorOutput -Message "GitHub CLI (gh) is not installed!" -Type 'Error'
        Write-Host "Install from: https://cli.github.com/" -ForegroundColor Yellow
        exit 1
    }
    Write-ColorOutput -Message "GitHub CLI found: $(gh --version | Select-Object -First 1)" -Type 'Success'
    
    # Check authentication
    $authStatus = gh auth status 2>&1
    if ($LASTEXITCODE -ne 0) {
        Write-ColorOutput -Message "GitHub CLI is not authenticated!" -Type 'Error'
        Write-Host "Run: gh auth login" -ForegroundColor Yellow
        exit 1
    }
    Write-ColorOutput -Message "GitHub CLI authenticated successfully" -Type 'Success'
    
    # Check Firebase CLI
    if (-not (Get-Command firebase -ErrorAction SilentlyContinue)) {
        Write-ColorOutput -Message "Firebase CLI is not installed!" -Type 'Warning'
        Write-Host "Install from: npm install -g firebase-tools" -ForegroundColor Yellow
    }
    else {
        Write-ColorOutput -Message "Firebase CLI found: $(firebase --version)" -Type 'Success'
    }
    
    # Step 2: Extract Firebase Project ID from .firebaserc
    Write-SectionHeader "Step 2/6: Extracting Firebase Project ID"
    
    $firebasercPath = Join-Path $PSScriptRoot ".." ".firebaserc"
    if (-not (Test-Path $firebasercPath)) {
        Write-ColorOutput -Message ".firebaserc file not found!" -Type 'Error'
        exit 1
    }
    
    $firebaserc = Get-Content $firebasercPath -Raw | ConvertFrom-Json
    $projectId = $firebaserc.projects.default
    
    if (-not $projectId) {
        Write-ColorOutput -Message "Could not extract project ID from .firebaserc" -Type 'Error'
        exit 1
    }
    
    Write-ColorOutput -Message "Firebase Project ID: $projectId" -Type 'Success'
    
    # Step 3: Check for existing Service Account JSON
    Write-SectionHeader "Step 3/6: Locating Firebase Service Account"
    
    $serviceAccountPath = Join-Path $PSScriptRoot ".." "firebase-service-account.json"
    
    if (-not (Test-Path $serviceAccountPath)) {
        Write-ColorOutput -Message "Service Account JSON not found locally" -Type 'Warning'
        Write-Host "`nPlease follow these steps to download it:" -ForegroundColor Yellow
        Write-Host "1. Open: https://console.firebase.google.com/project/$projectId/settings/serviceaccounts/adminsdk" -ForegroundColor Cyan
        Write-Host "2. Click 'Generate new private key'" -ForegroundColor Cyan
        Write-Host "3. Save the file as 'firebase-service-account.json' in the project root" -ForegroundColor Cyan
        Write-Host "`nPress Enter after downloading the file..." -ForegroundColor Yellow
        Read-Host
        
        if (-not (Test-Path $serviceAccountPath)) {
            Write-ColorOutput -Message "Service Account file still not found! Exiting..." -Type 'Error'
            exit 1
        }
    }
    
    Write-ColorOutput -Message "Service Account JSON found" -Type 'Success'
    
    # Step 4: Validate Service Account JSON
    Write-SectionHeader "Step 4/6: Validating Service Account JSON"
    
    try {
        $serviceAccount = Get-Content $serviceAccountPath -Raw | ConvertFrom-Json
        
        $requiredFields = @('type', 'project_id', 'private_key_id', 'private_key', 'client_email')
        $missingFields = $requiredFields | Where-Object { -not $serviceAccount.$_ }
        
        if ($missingFields) {
            Write-ColorOutput -Message "Invalid Service Account JSON! Missing fields: $($missingFields -join ', ')" -Type 'Error'
            exit 1
        }
        
        if ($serviceAccount.project_id -ne $projectId) {
            Write-ColorOutput -Message "Warning: Service Account project_id ($($serviceAccount.project_id)) doesn't match .firebaserc ($projectId)" -Type 'Warning'
            Write-Host "Continue anyway? (y/n): " -NoNewline -ForegroundColor Yellow
            $continue = Read-Host
            if ($continue -ne 'y') {
                exit 1
            }
        }
        
        Write-ColorOutput -Message "Service Account JSON is valid" -Type 'Success'
        Write-ColorOutput -Message "Type: $($serviceAccount.type)" -Type 'Info'
        Write-ColorOutput -Message "Project ID: $($serviceAccount.project_id)" -Type 'Info'
        Write-ColorOutput -Message "Client Email: $($serviceAccount.client_email)" -Type 'Info'
        
    }
    catch {
        Write-ColorOutput -Message "Failed to parse Service Account JSON: $_" -Type 'Error'
        exit 1
    }
    
    # Step 5: Get repository information
    Write-SectionHeader "Step 5/6: Getting Repository Information"
    
    $repoInfo = gh repo view --json nameWithOwner, name, owner | ConvertFrom-Json
    $repoFullName = $repoInfo.nameWithOwner
    
    Write-ColorOutput -Message "Repository: $repoFullName" -Type 'Success'
    
    # Step 6: Upload secrets to GitHub
    Write-SectionHeader "Step 6/6: Uploading Secrets to GitHub"
    
    Write-Host "`n⚠️  This will upload sensitive credentials to GitHub Secrets." -ForegroundColor Yellow
    Write-Host "Continue? (y/n): " -NoNewline -ForegroundColor Yellow
    $confirm = Read-Host
    
    if ($confirm -ne 'y') {
        Write-ColorOutput -Message "Operation cancelled by user" -Type 'Warning'
        exit 0
    }
    
    # Upload FIREBASE_PROJECT_ID
    Write-ColorOutput -Message "Uploading FIREBASE_PROJECT_ID..." -Type 'Info'
    $projectId | gh secret set FIREBASE_PROJECT_ID --repo $repoFullName
    
    if ($LASTEXITCODE -eq 0) {
        Write-ColorOutput -Message "FIREBASE_PROJECT_ID uploaded successfully" -Type 'Success'
    }
    else {
        Write-ColorOutput -Message "Failed to upload FIREBASE_PROJECT_ID" -Type 'Error'
        exit 1
    }
    
    # Upload FIREBASE_SERVICE_ACCOUNT
    Write-ColorOutput -Message "Uploading FIREBASE_SERVICE_ACCOUNT..." -Type 'Info'
    Get-Content $serviceAccountPath -Raw | gh secret set FIREBASE_SERVICE_ACCOUNT --repo $repoFullName
    
    if ($LASTEXITCODE -eq 0) {
        Write-ColorOutput -Message "FIREBASE_SERVICE_ACCOUNT uploaded successfully" -Type 'Success'
    }
    else {
        Write-ColorOutput -Message "Failed to upload FIREBASE_SERVICE_ACCOUNT" -Type 'Error'
        exit 1
    }
    
    # Verify secrets
    Write-SectionHeader "Verification: Listing Repository Secrets"
    
    Write-ColorOutput -Message "Fetching secrets list..." -Type 'Info'
    $secrets = gh secret list --repo $repoFullName 2>&1
    
    if ($secrets -match "FIREBASE_PROJECT_ID" -and $secrets -match "FIREBASE_SERVICE_ACCOUNT") {
        Write-ColorOutput -Message "All required secrets are configured!" -Type 'Success'
        Write-Host "`nConfigured Secrets:" -ForegroundColor Green
        $secrets | ForEach-Object { Write-Host "  $_" -ForegroundColor Cyan }
    }
    else {
        Write-ColorOutput -Message "Warning: Could not verify all secrets" -Type 'Warning'
    }
    
    # Success summary
    Write-SectionHeader "🎉 Setup Complete!"
    
    Write-Host @"
✅ All secrets have been successfully uploaded to GitHub!

Next Steps:
1. Go to: https://github.com/$repoFullName/actions
2. Find the failed workflow run
3. Click "Re-run all jobs"

Or run: gh run rerun --repo $repoFullName

The workflow should now pass! 🚀
"@ -ForegroundColor Green
    
    # Offer to re-run workflow
    Write-Host "`nWould you like to re-run the latest failed workflow now? (y/n): " -NoNewline -ForegroundColor Yellow
    $rerun = Read-Host
    
    if ($rerun -eq 'y') {
        Write-ColorOutput -Message "Finding latest workflow run..." -Type 'Info'
        $latestRun = gh run list --repo $repoFullName --limit 1 --json databaseId, status --jq '.[0]' | ConvertFrom-Json
        
        if ($latestRun -and $latestRun.status -eq 'completed') {
            Write-ColorOutput -Message "Re-running workflow (ID: $($latestRun.databaseId))..." -Type 'Info'
            gh run rerun $latestRun.databaseId --repo $repoFullName
            
            if ($LASTEXITCODE -eq 0) {
                Write-ColorOutput -Message "Workflow re-run triggered successfully!" -Type 'Success'
                Write-Host "Monitor progress: https://github.com/$repoFullName/actions" -ForegroundColor Cyan
            }
            else {
                Write-ColorOutput -Message "Failed to re-run workflow. Please do it manually." -Type 'Warning'
            }
        }
        else {
            Write-ColorOutput -Message "Could not find a completed workflow to re-run" -Type 'Warning'
        }
    }
    
    Write-Host "`n" # Spacing
    
}
catch {
    Write-ColorOutput -Message "An error occurred: $_" -Type 'Error'
    Write-Host $_.ScriptStackTrace -ForegroundColor Red
    exit 1
}
finally {
    # Security reminder
    Write-Host "`n⚠️  Security Reminder:" -ForegroundColor Yellow
    Write-Host "   - Add 'firebase-service-account.json' to .gitignore" -ForegroundColor Yellow
    Write-Host "   - Never commit this file to Git!" -ForegroundColor Yellow
    Write-Host "   - Keep your Service Account credentials secure" -ForegroundColor Yellow
}
