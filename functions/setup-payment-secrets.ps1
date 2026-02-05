# Payment Integration - Secrets Setup Script
# Run this script to configure Firebase Secrets for payment providers

Write-Host "==============================================================" -ForegroundColor Cyan
Write-Host "   💳 Payment Integration - Secrets Configuration" -ForegroundColor Cyan
Write-Host "   iCard & Revolut Webhook Secrets Setup" -ForegroundColor Cyan
Write-Host "==============================================================" -ForegroundColor Cyan
Write-Host ""

# Check if running in functions directory
if (-not (Test-Path "package.json")) {
    Write-Host "❌ ERROR: Run this script from the functions/ directory" -ForegroundColor Red
    Write-Host "   cd functions" -ForegroundColor Yellow
    Write-Host "   .\setup-payment-secrets.ps1" -ForegroundColor Yellow
    exit 1
}

# Check Firebase CLI
$firebaseVersion = firebase --version 2>&1 | Out-String
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ ERROR: Firebase CLI not installed" -ForegroundColor Red
    Write-Host "   Install: npm install -g firebase-tools" -ForegroundColor Yellow
    exit 1
}

Write-Host "✅ Firebase CLI detected: $($firebaseVersion.Trim())" -ForegroundColor Green
Write-Host ""

# Function to set secret
function Set-FirebaseSecret {
    param(
        [string]$SecretName,
        [string]$ProviderName,
        [string]$Description
    )
    
    Write-Host "──────────────────────────────────────────────────────────────" -ForegroundColor DarkGray
    Write-Host "Setting: $SecretName" -ForegroundColor Cyan
    Write-Host "Provider: $ProviderName" -ForegroundColor White
    Write-Host "Description: $Description" -ForegroundColor DarkGray
    Write-Host ""
    
    $continue = Read-Host "Do you have this secret ready? (y/n)"
    if ($continue -ne 'y') {
        Write-Host "⏩ Skipping $SecretName (you can set it later)" -ForegroundColor Yellow
        return $false
    }
    
    Write-Host "ℹ️  You'll be prompted to enter the secret value..." -ForegroundColor DarkGray
    Write-Host "   (Input will be hidden for security)" -ForegroundColor DarkGray
    Write-Host ""
    
    # Execute firebase command (will prompt for input)
    firebase functions:secrets:set $SecretName
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ $SecretName configured successfully!" -ForegroundColor Green
        return $true
    } else {
        Write-Host "❌ Failed to set $SecretName" -ForegroundColor Red
        return $false
    }
}

# Track which secrets were configured
$configuredSecrets = @()
$skippedSecrets = @()

# Header
Write-Host "📋 We'll configure 4 secrets for payment integration:" -ForegroundColor Yellow
Write-Host "   1. ICARD_WEBHOOK_SECRET" -ForegroundColor White
Write-Host "   2. ICARD_API_KEY" -ForegroundColor White
Write-Host "   3. REVOLUT_WEBHOOK_SECRET" -ForegroundColor White
Write-Host "   4. REVOLUT_API_KEY" -ForegroundColor White
Write-Host ""
Write-Host "⚠️  IMPORTANT: Get these values from provider dashboards FIRST" -ForegroundColor Yellow
Write-Host ""
$ready = Read-Host "Ready to start? (y/n)"
if ($ready -ne 'y') {
    Write-Host "Exiting... Run this script again when ready." -ForegroundColor Yellow
    exit 0
}
Write-Host ""

# Secret 1: iCard Webhook Secret
Write-Host "═══════════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "  1/4: iCard Webhook Secret" -ForegroundColor Cyan
Write-Host "═══════════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""
Write-Host "Where to find:" -ForegroundColor Yellow
Write-Host "  1. Login to iCard Merchant Portal: https://dashboard.icard.bg/" -ForegroundColor White
Write-Host "  2. Go to: Settings → API → Webhooks" -ForegroundColor White
Write-Host "  3. Create new webhook OR copy existing webhook secret" -ForegroundColor White
Write-Host "  4. The secret should be 32+ characters" -ForegroundColor White
Write-Host ""

$result = Set-FirebaseSecret -SecretName "ICARD_WEBHOOK_SECRET" -ProviderName "iCard" -Description "Webhook signature verification"
if ($result) { $configuredSecrets += "ICARD_WEBHOOK_SECRET" } else { $skippedSecrets += "ICARD_WEBHOOK_SECRET" }
Write-Host ""

# Secret 2: iCard API Key
Write-Host "═══════════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "  2/4: iCard API Key" -ForegroundColor Cyan
Write-Host "═══════════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""
Write-Host "Where to find:" -ForegroundColor Yellow
Write-Host "  1. Login to iCard Merchant Portal: https://dashboard.icard.bg/" -ForegroundColor White
Write-Host "  2. Go to: Settings → API → API Keys" -ForegroundColor White
Write-Host "  3. Create new API key OR copy existing key" -ForegroundColor White
Write-Host "  4. This is used for reconciliation API calls" -ForegroundColor White
Write-Host ""

$result = Set-FirebaseSecret -SecretName "ICARD_API_KEY" -ProviderName "iCard" -Description "API access for reconciliation"
if ($result) { $configuredSecrets += "ICARD_API_KEY" } else { $skippedSecrets += "ICARD_API_KEY" }
Write-Host ""

# Secret 3: Revolut Webhook Secret
Write-Host "═══════════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "  3/4: Revolut Webhook Secret" -ForegroundColor Cyan
Write-Host "═══════════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""
Write-Host "Where to find:" -ForegroundColor Yellow
Write-Host "  1. Login to Revolut Business: https://business.revolut.com/" -ForegroundColor White
Write-Host "  2. Go to: Developer → Webhooks" -ForegroundColor White
Write-Host "  3. Create webhook OR copy existing 'Signing Secret'" -ForegroundColor White
Write-Host "  4. Revolut auto-generates this when you create a webhook" -ForegroundColor White
Write-Host ""

$result = Set-FirebaseSecret -SecretName "REVOLUT_WEBHOOK_SECRET" -ProviderName "Revolut" -Description "Webhook signature verification (v1)"
if ($result) { $configuredSecrets += "REVOLUT_WEBHOOK_SECRET" } else { $skippedSecrets += "REVOLUT_WEBHOOK_SECRET" }
Write-Host ""

# Secret 4: Revolut API Key
Write-Host "═══════════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "  4/4: Revolut API Key" -ForegroundColor Cyan
Write-Host "═══════════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""
Write-Host "Where to find:" -ForegroundColor Yellow
Write-Host "  1. Login to Revolut Business: https://business.revolut.com/" -ForegroundColor White
Write-Host "  2. Go to: Developer → API → Create API Key" -ForegroundColor White
Write-Host "  3. Select scope: 'Read transactions' (for reconciliation)" -ForegroundColor White
Write-Host "  4. Store this key securely - shown only once!" -ForegroundColor White
Write-Host ""

$result = Set-FirebaseSecret -SecretName "REVOLUT_API_KEY" -ProviderName "Revolut" -Description "API access for reconciliation"
if ($result) { $configuredSecrets += "REVOLUT_API_KEY" } else { $skippedSecrets += "REVOLUT_API_KEY" }
Write-Host ""

# Summary
Write-Host "==============================================================" -ForegroundColor Cyan
Write-Host "   📊 Configuration Summary" -ForegroundColor Cyan
Write-Host "==============================================================" -ForegroundColor Cyan
Write-Host ""

if ($configuredSecrets.Count -gt 0) {
    Write-Host "✅ Configured Secrets ($($configuredSecrets.Count)/4):" -ForegroundColor Green
    foreach ($secret in $configuredSecrets) {
        Write-Host "   ✓ $secret" -ForegroundColor Green
    }
    Write-Host ""
}

if ($skippedSecrets.Count -gt 0) {
    Write-Host "⏩ Skipped Secrets ($($skippedSecrets.Count)/4):" -ForegroundColor Yellow
    foreach ($secret in $skippedSecrets) {
        Write-Host "   ○ $secret" -ForegroundColor Yellow
    }
    Write-Host ""
    Write-Host "⚠️  To configure skipped secrets later, run:" -ForegroundColor Yellow
    Write-Host "   firebase functions:secrets:set <SECRET_NAME>" -ForegroundColor White
    Write-Host ""
}

# Next steps
if ($configuredSecrets.Count -eq 4) {
    Write-Host "🎉 All secrets configured! Next steps:" -ForegroundColor Green
    Write-Host ""
    Write-Host "1. Redeploy webhook functions to use new secrets:" -ForegroundColor Cyan
    Write-Host "   firebase deploy --only functions:icardWebhooks,functions:revolutWebhooks" -ForegroundColor White
    Write-Host ""
    Write-Host "2. Register webhook URLs in provider dashboards:" -ForegroundColor Cyan
    Write-Host "   iCard:    https://europe-west1-fire-new-globul.cloudfunctions.net/icardWebhooks" -ForegroundColor White
    Write-Host "   Revolut:  https://europe-west1-fire-new-globul.cloudfunctions.net/revolutWebhooks" -ForegroundColor White
    Write-Host ""
    Write-Host "3. Test with sandbox payments (see PAYMENT_QUICK_START.md)" -ForegroundColor Cyan
    Write-Host ""
} elseif ($configuredSecrets.Count -gt 0) {
    Write-Host "⚠️  Partial configuration complete." -ForegroundColor Yellow
    Write-Host "   Configure remaining secrets before deploying." -ForegroundColor Yellow
    Write-Host ""
} else {
    Write-Host "ℹ️  No secrets were configured." -ForegroundColor Blue
    Write-Host "   Run this script again when you have the secret values." -ForegroundColor Blue
    Write-Host ""
}

Write-Host "==============================================================" -ForegroundColor Cyan
Write-Host "   📚 Documentation" -ForegroundColor Cyan
Write-Host "==============================================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "• Quick Start Guide:     functions\PAYMENT_QUICK_START.md" -ForegroundColor White
Write-Host "• Full Integration:      functions\PAYMENT_INTEGRATION_GUIDE.md" -ForegroundColor White
Write-Host "• Monitoring:            functions\POST_DEPLOYMENT_MONITORING.md" -ForegroundColor White
Write-Host ""
Write-Host "═══════════════════════════════════════════════════════════════" -ForegroundColor Cyan
