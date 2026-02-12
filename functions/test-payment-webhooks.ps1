# Payment Integration - Test Suite
# Quick tests for iCard & Revolut webhook handlers

Write-Host "==============================================================" -ForegroundColor Cyan
Write-Host "   🧪 Payment Integration - Test Suite" -ForegroundColor Cyan
Write-Host "   Webhook Handler Validation" -ForegroundColor Cyan
Write-Host "==============================================================" -ForegroundColor Cyan
Write-Host ""

# Configuration
$PROJECT_ID = "fire-new-globul"
$REGION = "europe-west1"
$ICARD_URL = "https://$REGION-$PROJECT_ID.cloudfunctions.net/icardWebhooks"
$REVOLUT_URL = "https://$REGION-$PROJECT_ID.cloudfunctions.net/revolutWebhooks"

# Test results tracking
$passedTests = 0
$failedTests = 0
$testResults = @()

# Helper function to run test
function Run-Test {
    param(
        [string]$TestName,
        [string]$Url,
        [hashtable]$Headers,
        [string]$Body,
        [int]$ExpectedStatus,
        [string]$ExpectedMessage
    )
    
    Write-Host "──────────────────────────────────────────────────────────────" -ForegroundColor DarkGray
    Write-Host "TEST: $TestName" -ForegroundColor Cyan
    Write-Host ""
    
    try {
        $response = Invoke-WebRequest -Uri $Url -Method POST -Headers $Headers -Body $Body -UseBasicParsing -ErrorAction Stop
        $statusCode = $response.StatusCode
        $responseBody = $response.Content
        
        if ($statusCode -eq $ExpectedStatus) {
            Write-Host "✅ PASSED: Status $statusCode (expected $ExpectedStatus)" -ForegroundColor Green
            if ($ExpectedMessage -and $responseBody -match $ExpectedMessage) {
                Write-Host "✅ Response contains expected message: '$ExpectedMessage'" -ForegroundColor Green
            }
            $script:passedTests++
            $script:testResults += [PSCustomObject]@{
                Test = $TestName
                Status = "✅ PASSED"
                Expected = $ExpectedStatus
                Actual = $statusCode
            }
            return $true
        } else {
            Write-Host "❌ FAILED: Status $statusCode (expected $ExpectedStatus)" -ForegroundColor Red
            $script:failedTests++
            $script:testResults += [PSCustomObject]@{
                Test = $TestName
                Status = "❌ FAILED"
                Expected = $ExpectedStatus
                Actual = $statusCode
            }
            return $false
        }
    } catch {
        $statusCode = $_.Exception.Response.StatusCode.value__
        if ($statusCode -eq $ExpectedStatus) {
            Write-Host "✅ PASSED: Status $statusCode (expected $ExpectedStatus)" -ForegroundColor Green
            $script:passedTests++
            $script:testResults += [PSCustomObject]@{
                Test = $TestName
                Status = "✅ PASSED"
                Expected = $ExpectedStatus
                Actual = $statusCode
            }
            return $true
        } else {
            Write-Host "❌ FAILED: Status $statusCode (expected $ExpectedStatus)" -ForegroundColor Red
            Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
            $script:failedTests++
            $script:testResults += [PSCustomObject]@{
                Test = $TestName
                Status = "❌ FAILED"
                Expected = $ExpectedStatus
                Actual = $statusCode
            }
            return $false
        }
    }
}

Write-Host "ℹ️  Testing webhook endpoints..." -ForegroundColor Yellow
Write-Host "   iCard:   $ICARD_URL" -ForegroundColor White
Write-Host "   Revolut: $REVOLUT_URL" -ForegroundColor White
Write-Host ""
Write-Host "⚠️  NOTE: Some tests are expected to fail (e.g., invalid signature = 401)" -ForegroundColor Yellow
Write-Host ""

$continue = Read-Host "Ready to start tests? (y/n)"
if ($continue -ne 'y') {
    Write-Host "Exiting..." -ForegroundColor Yellow
    exit 0
}
Write-Host ""

# ============================================
# TEST SUITE 1: iCard Webhooks
# ============================================
Write-Host "═══════════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "  TEST SUITE 1: iCard Webhook Handler" -ForegroundColor Cyan
Write-Host "═══════════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""

# Test 1.1: Missing signature (should fail with 401)
Run-Test `
    -TestName "iCard - Missing Signature Header" `
    -Url $ICARD_URL `
    -Headers @{ "Content-Type" = "application/json" } `
    -Body '{"transaction_id": "test_001"}' `
    -ExpectedStatus 401 `
    -ExpectedMessage "Missing signature"

Start-Sleep -Seconds 1

# Test 1.2: Invalid signature (should fail with 401)
Run-Test `
    -TestName "iCard - Invalid Signature" `
    -Url $ICARD_URL `
    -Headers @{ 
        "Content-Type" = "application/json"
        "X-iCard-Signature" = "invalid_signature_12345"
    } `
    -Body '{"transaction_id": "test_002", "amount": 100}' `
    -ExpectedStatus 401 `
    -ExpectedMessage "Invalid signature"

Start-Sleep -Seconds 1

# Test 1.3: Missing required fields (should fail with 400)
Run-Test `
    -TestName "iCard - Missing Required Fields" `
    -Url $ICARD_URL `
    -Headers @{ 
        "Content-Type" = "application/json"
        "X-iCard-Signature" = "test_signature"
        "X-iCard-Timestamp" = [DateTimeOffset]::UtcNow.ToUnixTimeSeconds()
    } `
    -Body '{"amount": 100}' `
    -ExpectedStatus 400 `
    -ExpectedMessage "Missing required"

Write-Host ""
Write-Host "ℹ️  For valid webhook tests, use iCard's sandbox testing tool" -ForegroundColor Yellow
Write-Host ""

# ============================================
# TEST SUITE 2: Revolut Webhooks
# ============================================
Write-Host "═══════════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "  TEST SUITE 2: Revolut Webhook Handler" -ForegroundColor Cyan
Write-Host "═══════════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""

# Test 2.1: Missing signature (should fail with 401)
Run-Test `
    -TestName "Revolut - Missing Signature Header" `
    -Url $REVOLUT_URL `
    -Headers @{ "Content-Type" = "application/json" } `
    -Body '{"id": "test_rev_001"}' `
    -ExpectedStatus 401 `
    -ExpectedMessage "Missing signature"

Start-Sleep -Seconds 1

# Test 2.2: Invalid signature (should fail with 401)
Run-Test `
    -TestName "Revolut - Invalid Signature" `
    -Url $REVOLUT_URL `
    -Headers @{ 
        "Content-Type" = "application/json"
        "Revolut-Signature" = "v1=invalid_signature_xyz"
    } `
    -Body '{"id": "test_rev_002", "amount": 50}' `
    -ExpectedStatus 401 `
    -ExpectedMessage "Invalid signature"

Start-Sleep -Seconds 1

# Test 2.3: Missing required fields (should fail with 400)
Run-Test `
    -TestName "Revolut - Missing Required Fields" `
    -Url $REVOLUT_URL `
    -Headers @{ 
        "Content-Type" = "application/json"
        "Revolut-Signature" = "v1=test_signature"
    } `
    -Body '{"amount": 50}' `
    -ExpectedStatus 400 `
    -ExpectedMessage "Missing required"

Write-Host ""
Write-Host "ℹ️  For valid webhook tests, use Revolut's webhook simulator" -ForegroundColor Yellow
Write-Host ""

# ============================================
# TEST SUITE 3: Function Logs Check
# ============================================
Write-Host "═══════════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "  TEST SUITE 3: Check Function Logs" -ForegroundColor Cyan
Write-Host "═══════════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""

Write-Host "Fetching last 20 iCard webhook logs..." -ForegroundColor Yellow
firebase functions:log --only icardWebhooks --limit 20 2>&1 | Select-String -Pattern "(ERROR|401|400|Missing|Invalid)" | ForEach-Object {
    if ($_ -match "ERROR") {
        Write-Host $_ -ForegroundColor Red
    } elseif ($_ -match "401|Missing|Invalid") {
        Write-Host $_ -ForegroundColor Yellow
    } else {
        Write-Host $_ -ForegroundColor White
    }
}

Write-Host ""
Write-Host "Fetching last 20 Revolut webhook logs..." -ForegroundColor Yellow
firebase functions:log --only revolutWebhooks --limit 20 2>&1 | Select-String -Pattern "(ERROR|401|400|Missing|Invalid)" | ForEach-Object {
    if ($_ -match "ERROR") {
        Write-Host $_ -ForegroundColor Red
    } elseif ($_ -match "401|Missing|Invalid") {
        Write-Host $_ -ForegroundColor Yellow
    } else {
        Write-Host $_ -ForegroundColor White
    }
}

Write-Host ""

# ============================================
# SUMMARY
# ============================================
Write-Host "==============================================================" -ForegroundColor Cyan
Write-Host "   📊 Test Results Summary" -ForegroundColor Cyan
Write-Host "==============================================================" -ForegroundColor Cyan
Write-Host ""

$script:testResults | Format-Table -AutoSize

Write-Host ""
Write-Host "Total Tests: $($passedTests + $failedTests)" -ForegroundColor White
Write-Host "Passed: $passedTests" -ForegroundColor Green
Write-Host "Failed: $failedTests" -ForegroundColor Red
Write-Host ""

if ($failedTests -eq 0) {
    Write-Host "🎉 All tests passed!" -ForegroundColor Green
} else {
    Write-Host "⚠️  Some tests failed. Review logs above." -ForegroundColor Yellow
}
Write-Host ""

# ============================================
# NEXT STEPS
# ============================================
Write-Host "==============================================================" -ForegroundColor Cyan
Write-Host "   📋 Next Steps" -ForegroundColor Cyan
Write-Host "==============================================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "1. Test with REAL sandbox payments:" -ForegroundColor Cyan
Write-Host "   • iCard Sandbox: https://sandbox.icard.bg/" -ForegroundColor White
Write-Host "   • Revolut Sandbox: https://sandbox-business.revolut.com/" -ForegroundColor White
Write-Host ""
Write-Host "2. Verify payment records in Firestore:" -ForegroundColor Cyan
Write-Host "   • Firebase Console → Firestore → payments" -ForegroundColor White
Write-Host "   • Check provider, status, amount, ad_id" -ForegroundColor White
Write-Host ""
Write-Host "3. Monitor webhook logs for errors:" -ForegroundColor Cyan
Write-Host "   firebase functions:log --only icardWebhooks,revolutWebhooks" -ForegroundColor White
Write-Host ""
Write-Host "4. Test reconciliation (manual trigger):" -ForegroundColor Cyan
Write-Host "   • Firebase Console → Functions → triggerReconciliation → Test" -ForegroundColor White
Write-Host "   • Input: { ""date"": ""2026-02-05"" }" -ForegroundColor White
Write-Host ""
Write-Host "==============================================================" -ForegroundColor Cyan
