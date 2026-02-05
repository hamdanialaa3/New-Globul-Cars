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
Write-Host "📋 نموذجان للإعداد:" -ForegroundColor Yellow
Write-Host ""
Write-Host "   [1] إعداد أساسي (موصى به للبداية)" -ForegroundColor Green
Write-Host "       ✅ ICARD_WEBHOOK_SECRET" -ForegroundColor White
Write-Host "       ✅ REVOLUT_WEBHOOK_SECRET" -ForegroundColor White
Write-Host "       ℹ️  كافية لاستقبال المدفوعات" -ForegroundColor DarkGray
Write-Host ""
Write-Host "   [2] إعداد متقدم (اختياري)" -ForegroundColor Cyan
Write-Host "       🔹 ICARD_API_KEY" -ForegroundColor DarkGray
Write-Host "       🔹 REVOLUT_API_KEY" -ForegroundColor DarkGray
Write-Host "       ℹ️  للميزات المتقدمة (Refunds, Status queries)" -ForegroundColor DarkGray
Write-Host ""
Write-Host "⚠️  نصيحة: ابدأ بالإعداد الأساسي فقط، يمكن إضافة API Keys لاحقاً" -ForegroundColor Yellow
Write-Host ""
$setupMode = Read-Host "اختر: [1] أساسي فقط  [2] أساسي + متقدم  (default: 1)"
if ($setupMode -eq "") { $setupMode = "1" }
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

# Secret 2: iCard API Key (OPTIONAL)
if ($setupMode -eq "2") {
    Write-Host "═══════════════════════════════════════════════════════════════" -ForegroundColor Cyan
    Write-Host "  2/4: iCard API Key (اختياري)" -ForegroundColor Cyan
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
} else {
    Write-Host "⏩ تخطي ICARD_API_KEY (غير مطلوب للإعداد الأساسي)" -ForegroundColor DarkGray
    Write-Host ""
    $skippedSecrets += "ICARD_API_KEY"
}

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

# Secret 4: Revolut API Key (OPTIONAL)
if ($setupMode -eq "2") {
    Write-Host "═══════════════════════════════════════════════════════════════" -ForegroundColor Cyan
    Write-Host "  4/4: Revolut API Key (اختياري)" -ForegroundColor Cyan
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
} else {
    Write-Host "⏩ تخطي REVOLUT_API_KEY (غير مطلوب للإعداد الأساسي)" -ForegroundColor DarkGray
    Write-Host ""
    $skippedSecrets += "REVOLUT_API_KEY"
}

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
$requiredSecrets = @("ICARD_WEBHOOK_SECRET", "REVOLUT_WEBHOOK_SECRET")
$hasRequiredSecrets = ($requiredSecrets | Where-Object { $configuredSecrets -contains $_ }).Count -eq 2

if ($hasRequiredSecrets) {
    Write-Host "🎉 الإعداد الأساسي مكتمل! الخطوات التالية:" -ForegroundColor Green
    Write-Host ""
    Write-Host "1. أعد نشر webhook functions:" -ForegroundColor Cyan
    Write-Host "   firebase deploy --only functions:icardWebhooks,functions:revolutWebhooks" -ForegroundColor White
    Write-Host ""
    Write-Host "2. سجل Webhooks في لوحات التحكم:" -ForegroundColor Cyan
    Write-Host "   iCard:    https://europe-west1-fire-new-globul.cloudfunctions.net/icardWebhooks" -ForegroundColor White
    Write-Host "   Revolut:  https://europe-west1-fire-new-globul.cloudfunctions.net/revolutWebhooks" -ForegroundColor White
    Write-Host ""
    Write-Host "3. اختبر بدفعات Sandbox (راجع PAYMENT_SETUP_SIMPLIFIED_AR.md)" -ForegroundColor Cyan
    Write-Host ""
    
    if ($setupMode -eq "1") {
        Write-Host "💡 ملاحظة: يمكنك إضافة API Keys لاحقاً عند الحاجة:" -ForegroundColor Yellow
        Write-Host "   firebase functions:secrets:set ICARD_API_KEY" -ForegroundColor DarkGray
        Write-Host "   firebase functions:secrets:set REVOLUT_API_KEY" -ForegroundColor DarkGray
        Write-Host ""
    }
} elseif ($configuredSecrets.Count -gt 0) {
    Write-Host "⚠️  إعداد جزئي مكتمل." -ForegroundColor Yellow
    Write-Host "   أكمل الـ Secrets المطلوبة قبل النشر:" -ForegroundColor Yellow
    foreach ($req in $requiredSecrets) {
        if ($configuredSecrets -notcontains $req) {
            Write-Host "   ❌ $req" -ForegroundColor Red
        }
    }
    Write-Host ""
} else {
    Write-Host "ℹ️  لم يتم ضبط أي secrets." -ForegroundColor Blue
    Write-Host "   شغل السكريبت مرة أخرى عندما تكون جاهزاً." -ForegroundColor Blue
    Write-Host ""
}

Write-Host "==============================================================" -ForegroundColor Cyan
Write-Host "   📚 الوثائق المتاحة" -ForegroundColor Cyan
Write-Host "==============================================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "• دليل مبسّط (بالعربي):  PAYMENT_SETUP_SIMPLIFIED_AR.md  ⭐" -ForegroundColor Green
Write-Host "• Quick Start Guide:      PAYMENT_QUICK_START.md" -ForegroundColor White
Write-Host "• Full Integration:       PAYMENT_INTEGRATION_GUIDE.md" -ForegroundColor White
Write-Host "• Test Scenarios:         PAYMENT_TEST_SCENARIOS.md" -ForegroundColor White
Write-Host ""
Write-Host "═══════════════════════════════════════════════════════════════" -ForegroundColor Cyan
