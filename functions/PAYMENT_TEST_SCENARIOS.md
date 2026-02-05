# 🧪 Payment Webhook Test Scenarios
**Comprehensive Testing Guide for iCard & Revolut**

---

## Test Environment Setup

### Prerequisites Checklist

- [ ] Firebase Functions deployed (all 5 payment functions)
- [ ] Webhook URLs obtained and saved
- [ ] Firebase Secrets configured (ICARD_WEBHOOK_SECRET, REVOLUT_WEBHOOK_SECRET)
- [ ] Webhooks registered in provider dashboards
- [ ] Test ad created in Firestore (note the ad_id)
- [ ] Sandbox credentials obtained from providers

### Test Ad Setup (Firestore)

```javascript
// Firebase Console → Firestore → ads → Add Document
{
  "id": "test_ad_12345",
  "seller_uid": "test_user_001",
  "title": "Test Mercedes C-Class 2020",
  "price": 15000,
  "currency": "BGN",
  "status": "pending_payment",  // Important: needs payment
  "payment_method": "icard",    // Or "revolut"
  "created_at": Timestamp.now(),
  "metadata": {
    "test": true
  }
}
```

---

## Test Suite 1: iCard Webhook Tests

### Scenario 1.1: Successful Payment (Happy Path)

**Step 1**: Make sandbox payment via iCard portal

```bash
# iCard Sandbox Portal: https://sandbox.icard.bg/
# Login with test credentials
# Make payment with these details:
Amount: 15000 (BGN)
Metadata: {
  "ad_id": "test_ad_12345",
  "user_id": "test_user_001"
}
```

**Step 2**: iCard sends webhook to your endpoint

```json
// Expected webhook payload from iCard
{
  "transaction_id": "icard_tx_abc123",
  "event_type": "payment.completed",
  "amount": 15000.00,
  "currency": "BGN",
  "status": "completed",
  "metadata": {
    "ad_id": "test_ad_12345",
    "user_id": "test_user_001"
  },
  "created_at": "2026-02-05T10:30:00Z",
  "merchant_id": "merchant_001"
}

// Headers sent by iCard:
X-iCard-Signature: hmac-sha256=<computed_signature>
X-iCard-Timestamp: 1738755000
Content-Type: application/json
```

**Step 3**: Verify webhook processing

```powershell
# Check function logs
firebase functions:log --only icardWebhooks --limit 20

# Expected log entries:
# ✅ iCard webhook received - tx: icard_tx_abc123
# ✅ Signature verified
# ✅ Webhook not processed before (idempotency check passed)
# ✅ Payment recorded in Firestore
# ✅ Ad status updated to payment_verified
```

**Step 4**: Verify Firestore updates

```javascript
// Check: payments collection
// Firebase Console → Firestore → payments → {payment_id}
{
  "provider": "icard",
  "provider_tx_id": "icard_tx_abc123",
  "ad_id": "test_ad_12345",
  "user_id": "test_user_001",
  "amount": 15000.00,
  "currency": "BGN",
  "status": "completed",
  "created_at": Timestamp,
  "verified_at": Timestamp,
  "metadata": { ... }
}

// Check: ads collection status updated
// Firebase Console → Firestore → ads → test_ad_12345
{
  "status": "payment_verified",  // Updated!
  "payment_id": "{generated_payment_id}",
  ...
}

// Check: payment_webhooks_processed (idempotency tracking)
// Firebase Console → Firestore → payment_webhooks_processed → {idempotency_key}
{
  "transaction_id": "icard_tx_abc123",
  "processed_at": Timestamp,
  "provider": "icard",
  "expires_at": Timestamp(+7 days)
}
```

**Success Criteria**:
- ✅ Webhook returns 200 OK
- ✅ Payment record created in `payments` collection
- ✅ Ad status updated to `payment_verified`
- ✅ Idempotency key stored in `payment_webhooks_processed`
- ✅ No errors in Cloud Functions logs

---

### Scenario 1.2: Duplicate Webhook (Idempotency Test)

**Test**: Send the SAME webhook twice

**Step 1**: Copy webhook payload from Scenario 1.1

**Step 2**: Resend webhook using curl or Postman

```powershell
# PowerShell example
$payload = @{
    transaction_id = "icard_tx_abc123"  # SAME transaction ID
    event_type = "payment.completed"
    amount = 15000.00
    currency = "BGN"
    status = "completed"
    metadata = @{
        ad_id = "test_ad_12345"
        user_id = "test_user_001"
    }
    created_at = "2026-02-05T10:30:00Z"
    merchant_id = "merchant_001"
} | ConvertTo-Json

$headers = @{
    "Content-Type" = "application/json"
    "X-iCard-Signature" = "hmac-sha256=<same_signature>"
    "X-iCard-Timestamp" = "1738755000"
}

Invoke-WebRequest `
    -Uri "https://europe-west1-fire-new-globul.cloudfunctions.net/icardWebhooks" `
    -Method POST `
    -Headers $headers `
    -Body $payload
```

**Expected Response**:
```json
{
  "error": "Webhook already processed",
  "transaction_id": "icard_tx_abc123"
}
```
**HTTP Status**: `409 Conflict`

**Success Criteria**:
- ✅ Webhook returns 409 Conflict
- ✅ No duplicate payment record created
- ✅ Ad status remains unchanged
- ✅ Log shows "Webhook already processed" message
- ✅ Idempotency protection working correctly

---

### Scenario 1.3: Invalid Signature (Security Test)

**Test**: Send webhook with wrong signature

```powershell
$payload = @{
    transaction_id = "icard_tx_invalid"
    amount = 100.00
} | ConvertTo-Json

$headers = @{
    "Content-Type" = "application/json"
    "X-iCard-Signature" = "hmac-sha256=INVALID_SIGNATURE_12345"
    "X-iCard-Timestamp" = [DateTimeOffset]::UtcNow.ToUnixTimeSeconds()
}

Invoke-WebRequest `
    -Uri "https://europe-west1-fire-new-globul.cloudfunctions.net/icardWebhooks" `
    -Method POST `
    -Headers $headers `
    -Body $payload
```

**Expected Response**:
```json
{
  "error": "Invalid webhook signature"
}
```
**HTTP Status**: `401 Unauthorized`

**Success Criteria**:
- ✅ Webhook returns 401 Unauthorized
- ✅ No payment record created
- ✅ Security check logged
- ✅ Signature verification protecting against unauthorized requests

---

### Scenario 1.4: Missing Required Fields

**Test**: Send webhook with missing metadata

```powershell
$payload = @{
    transaction_id = "icard_tx_incomplete"
    amount = 100.00
    currency = "BGN"
    status = "completed"
    # Missing metadata.ad_id and metadata.user_id
} | ConvertTo-Json

# (With valid signature)
Invoke-WebRequest -Uri $ICARD_URL -Method POST -Headers $headers -Body $payload
```

**Expected Response**:
```json
{
  "error": "Missing required metadata: ad_id, user_id"
}
```
**HTTP Status**: `400 Bad Request`

**Success Criteria**:
- ✅ Webhook returns 400 Bad Request
- ✅ No payment record created
- ✅ Clear error message indicating missing fields
- ✅ Validation logic working correctly

---

### Scenario 1.5: Timestamp Replay Attack

**Test**: Send old webhook (>5 minutes old)

```powershell
$payload = @{
    transaction_id = "icard_tx_old"
    amount = 100.00
} | ConvertTo-Json

$headers = @{
    "Content-Type" = "application/json"
    "X-iCard-Signature" = "<valid_signature>"
    "X-iCard-Timestamp" = "1738700000"  # 15 hours ago (way past 5-min window)
}

Invoke-WebRequest -Uri $ICARD_URL -Method POST -Headers $headers -Body $payload
```

**Expected Response**:
```json
{
  "error": "Webhook timestamp too old"
}
```
**HTTP Status**: `401 Unauthorized`

**Success Criteria**:
- ✅ Webhook returns 401 Unauthorized
- ✅ Timestamp validation preventing replay attacks
- ✅ 5-minute window enforced

---

## Test Suite 2: Revolut Webhook Tests

### Scenario 2.1: Successful Payment (Happy Path)

**Step 1**: Make sandbox payment via Revolut portal

```bash
# Revolut Sandbox: https://sandbox-business.revolut.com/
# Make payment with:
Amount: 7550 (EUR)
Reference: "ad_test_ad_12345_user_test_user_001"
# OR
Merchant Order ID: "ad_test_ad_12345_user_test_user_001"
```

**Step 2**: Revolut sends webhook

```json
// Expected webhook payload from Revolut
{
  "event": "TransactionStateChanged",
  "timestamp": "2026-02-05T14:20:00Z",
  "data": {
    "id": "rev_tx_xyz789",
    "type": "CARD_PAYMENT",
    "state": "completed",
    "amount": 7550.00,
    "currency": "EUR",
    "reference": "ad_test_ad_12345_user_test_user_001",
    "merchant_order_id": "ad_test_ad_12345_user_test_user_001",
    "created_at": "2026-02-05T14:19:30Z",
    "updated_at": "2026-02-05T14:20:00Z"
  }
}

// Headers sent by Revolut:
Revolut-Signature: v1=<hmac_sha256_signature>
Content-Type: application/json
```

**Step 3**: Verify webhook processing

```powershell
firebase functions:log --only revolutWebhooks --limit 20

# Expected log entries:
# ✅ Revolut webhook received - tx: rev_tx_xyz789
# ✅ Signature verified (v1 format)
# ✅ Reference parsed: ad_id=test_ad_12345, user_id=test_user_001
# ✅ Payment recorded in Firestore
# ✅ Ad status updated
```

**Step 4**: Verify Firestore

```javascript
// payments collection
{
  "provider": "revolut",
  "provider_tx_id": "rev_tx_xyz789",
  "ad_id": "test_ad_12345",
  "user_id": "test_user_001",
  "amount": 7550.00,
  "currency": "EUR",
  "status": "completed",
  ...
}
```

**Success Criteria**: Same as iCard Scenario 1.1

---

### Scenario 2.2: Invalid Reference Format

**Test**: Send webhook with malformed reference

```json
{
  "event": "TransactionStateChanged",
  "data": {
    "id": "rev_tx_bad_ref",
    "reference": "invalid_format_missing_ids",  // Wrong format!
    "amount": 100.00,
    ...
  }
}
```

**Expected Response**:
```json
{
  "error": "Invalid reference format. Expected: ad_{ad_id}_user_{user_id}"
}
```
**HTTP Status**: `400 Bad Request`

**Success Criteria**:
- ✅ Webhook returns 400 Bad Request
- ✅ Reference parsing validation working
- ✅ Clear error message for debugging

---

## Test Suite 3: Reconciliation Tests

### Scenario 3.1: Manual Reconciliation Trigger

**Test**: Trigger reconciliation for test date

```javascript
// Firebase Console → Functions → triggerReconciliation → Test Tab
{
  "date": "2026-02-05",
  "sendAlerts": false
}
```

**Expected Response**:
```json
{
  "summary": {
    "date": "2026-02-05",
    "total_payments": 2,
    "total_amount": 22550.00,
    "by_provider": {
      "icard": { "count": 1, "amount": 15000.00 },
      "revolut": { "count": 1, "amount": 7550.00 }
    },
    "discrepancy_count": 0,
    "discrepancy_amount": 0.00
  },
  "missing_payments": [],
  "unmatched_transactions": []
}
```

**Success Criteria**:
- ✅ Function executes without errors
- ✅ All test payments counted correctly
- ✅ No discrepancies (since both webhooks processed)
- ✅ Reconciliation report saved to Firestore

---

### Scenario 3.2: Export CSV Report

**Test**: Export reconciliation data as CSV

```javascript
// Admin dashboard callable function
const exportFunc = firebase.functions().httpsCallable('exportReconciliationReport');

const result = await exportFunc({
  startDate: '2026-02-01',
  endDate: '2026-02-05',
  format: 'csv'
});

// result.data.csv contains CSV string
console.log(result.data.csv);
```

**Expected CSV Output**:
```csv
date,provider,transaction_id,ad_id,user_id,amount,currency,status,created_at,verified_at
2026-02-05,icard,icard_tx_abc123,test_ad_12345,test_user_001,15000.00,BGN,completed,2026-02-05T10:30:00Z,2026-02-05T10:30:05Z
2026-02-05,revolut,rev_tx_xyz789,test_ad_12345,test_user_001,7550.00,EUR,completed,2026-02-05T14:20:00Z,2026-02-05T14:20:03Z
```

**Success Criteria**:
- ✅ CSV generated successfully
- ✅ All columns present and correctly formatted
- ✅ Data matches Firestore records
- ✅ File can be opened in Excel/Google Sheets

---

## Test Suite 4: Edge Cases & Error Handling

### Scenario 4.1: Network Timeout

**Test**: Simulate slow Firestore writes

```typescript
// Temporarily increase timeout in code (for testing)
// Or artificially delay webhook processing
```

**Expected**: Function should timeout gracefully, not leave orphaned data

---

### Scenario 4.2: Concurrent Webhooks (Race Condition)

**Test**: Send 2 webhooks for same transaction simultaneously

**Expected**: Idempotency protection prevents double-processing

---

### Scenario 4.3: Large Batch Reconciliation

**Test**: Reconcile 1000+ payments in one day

```javascript
{ "date": "2026-02-01" }  // Date with many transactions
```

**Expected**: Function completes within timeout (540s), pagination works

---

## Test Checklist Summary

### iCard Tests
- [ ] ✅ Successful payment (200 OK)
- [ ] ✅ Duplicate webhook (409 Conflict)
- [ ] ✅ Invalid signature (401 Unauthorized)
- [ ] ✅ Missing metadata (400 Bad Request)
- [ ] ✅ Old timestamp (401 Unauthorized)

### Revolut Tests
- [ ] ✅ Successful payment (200 OK)
- [ ] ✅ Duplicate webhook (409 Conflict)
- [ ] ✅ Invalid signature (401 Unauthorized)
- [ ] ✅ Invalid reference format (400 Bad Request)

### Reconciliation Tests
- [ ] ✅ Manual trigger works
- [ ] ✅ CSV export generates correctly
- [ ] ✅ Daily scheduled job runs at 2 AM
- [ ] ✅ Discrepancy alerts sent (>€100)

### Integration Tests
- [ ] ✅ Payment → Ad status updated
- [ ] ✅ Payment → Metrics recorded
- [ ] ✅ Payment → Notification sent (if configured)

---

## Troubleshooting

### Common Issues

**Issue**: Webhook returns 401 constantly
- **Fix**: Verify webhook secret matches exactly (no extra spaces/newlines)
- **Check**: `firebase functions:config:get` or Secret Manager

**Issue**: Payment recorded but ad status not updated
- **Fix**: Check ad exists in Firestore, verify ad_id in webhook metadata
- **Check**: Function logs for "Ad not found" errors

**Issue**: Reconciliation shows discrepancies
- **Fix**: Check if webhooks failed/timed out, manually verify bank statements
- **Check**: `payment_webhooks_processed` collection for missing webhooks

---

**Document Version**: 1.0  
**Last Updated**: February 5, 2026  
**Test Data Valid Until**: February 12, 2026 (sandbox data may expire)
