# ============================================================================
# Azure Integration Setup Script
# Koli One - Bulgaria Car Marketplace
# ============================================================================
# This script automates Azure authentication setup
# Run from project root: .\AZURE_SETUP.ps1
# ============================================================================

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Azure Integration Setup" -ForegroundColor Cyan
Write-Host "Koli One - Car Marketplace" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Check if running from correct directory
if (-not (Test-Path "package.json")) {
    Write-Host "ERROR: Please run this script from project root directory!" -ForegroundColor Red
    Write-Host "Current directory: $(Get-Location)" -ForegroundColor Yellow
    exit 1
}

# ============================================================================
# Step 1: Install Required NPM Packages
# ============================================================================
Write-Host "Step 1: Installing Azure MSAL packages..." -ForegroundColor Yellow
Write-Host ""

$packages = @(
    "@azure/msal-browser",
    "@azure/msal-react"
)

foreach ($package in $packages) {
    Write-Host "  Installing $package..." -ForegroundColor Gray
    npm install $package --save
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "  ✓ $package installed successfully" -ForegroundColor Green
    } else {
        Write-Host "  ✗ Failed to install $package" -ForegroundColor Red
        exit 1
    }
}

Write-Host ""
Write-Host "✓ All packages installed successfully!" -ForegroundColor Green
Write-Host ""

# ============================================================================
# Step 2: Create .env.local if not exists
# ============================================================================
Write-Host "Step 2: Setting up environment variables..." -ForegroundColor Yellow
Write-Host ""

$envFile = ".env.local"
$envExists = Test-Path $envFile

if (-not $envExists) {
    Write-Host "  Creating .env.local file..." -ForegroundColor Gray
    
    $envContent = @"
# Azure Authentication Configuration
REACT_APP_AZURE_TENANT_ID=fdb9a393-7d60-4dae-b17b-0bb89edad2fe
REACT_APP_AZURE_CLIENT_ID=
REACT_APP_AZURE_AUTH_ENABLED=false
"@
    
    Set-Content -Path $envFile -Value $envContent
    Write-Host "  ✓ .env.local created" -ForegroundColor Green
} else {
    Write-Host "  .env.local already exists" -ForegroundColor Gray
    
    # Check if Azure variables exist
    $envContent = Get-Content $envFile -Raw
    
    if ($envContent -notmatch "REACT_APP_AZURE_TENANT_ID") {
        Write-Host "  Adding Azure variables to existing .env.local..." -ForegroundColor Gray
        
        $azureVars = @"

# Azure Authentication Configuration
REACT_APP_AZURE_TENANT_ID=fdb9a393-7d60-4dae-b17b-0bb89edad2fe
REACT_APP_AZURE_CLIENT_ID=
REACT_APP_AZURE_AUTH_ENABLED=false
"@
        
        Add-Content -Path $envFile -Value $azureVars
        Write-Host "  ✓ Azure variables added" -ForegroundColor Green
    } else {
        Write-Host "  Azure variables already exist" -ForegroundColor Gray
    }
}

Write-Host ""

# ============================================================================
# Step 3: Display Next Steps
# ============================================================================
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Setup Complete!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "Next Steps:" -ForegroundColor Yellow
Write-Host ""
Write-Host "1. Register App in Azure Portal:" -ForegroundColor White
Write-Host "   https://portal.azure.com" -ForegroundColor Cyan
Write-Host "   → Microsoft Entra ID → App registrations → New registration" -ForegroundColor Gray
Write-Host ""

Write-Host "2. Configure the app:" -ForegroundColor White
Write-Host "   Name: Koli One - Car Marketplace" -ForegroundColor Gray
Write-Host "   Account type: Personal Microsoft accounts" -ForegroundColor Gray
Write-Host "   Redirect URI (SPA): http://localhost:3000/auth/azure/callback" -ForegroundColor Gray
Write-Host ""

Write-Host "3. Copy Application (client) ID from Azure Portal" -ForegroundColor White
Write-Host ""

Write-Host "4. Update .env.local:" -ForegroundColor White
Write-Host "   REACT_APP_AZURE_CLIENT_ID=<paste_client_id_here>" -ForegroundColor Gray
Write-Host "   REACT_APP_AZURE_AUTH_ENABLED=true" -ForegroundColor Gray
Write-Host ""

Write-Host "5. Start the dev server:" -ForegroundColor White
Write-Host "   npm start" -ForegroundColor Cyan
Write-Host ""

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Documentation:" -ForegroundColor Yellow
Write-Host "  → AZURE_QUICK_START_AR.md (Quick guide in Arabic)" -ForegroundColor Gray
Write-Host "  → AZURE_SETUP_GUIDE.md (Complete guide)" -ForegroundColor Gray
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# ============================================================================
# Optional: Open documentation
# ============================================================================
$openDocs = Read-Host "Open documentation? (y/n)"
if ($openDocs -eq "y" -or $openDocs -eq "Y") {
    if (Test-Path "AZURE_QUICK_START_AR.md") {
        Start-Process "AZURE_QUICK_START_AR.md"
    }
    
    # Open Azure Portal
    $openPortal = Read-Host "Open Azure Portal? (y/n)"
    if ($openPortal -eq "y" -or $openPortal -eq "Y") {
        Start-Process "https://portal.azure.com"
    }
}

Write-Host ""
Write-Host "Setup script completed successfully!" -ForegroundColor Green
Write-Host ""
