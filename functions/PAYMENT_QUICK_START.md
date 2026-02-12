# 🚀 Payment Integration - Quick Start
**iCard & Revolut - Immediate Actions Required**

Status: ✅ **All 5 functions deployed successfully** (Feb 5, 2026)

---

## 📍 Step 1: Webhook URLs (Copy These Now)

```
iCard Webhook URL:
https://europe-west1-fire-new-globul.cloudfunctions.net/icardWebhooks

Revolut Webhook URL:
https://europe-west1-fire-new-globul.cloudfunctions.net/revolutWebhooks
```

---

## 🔐 Step 2: Setup Firebase Secrets (Run Now)

**CRITICAL**: Replace `YOUR_ACTUAL_SECRET_HERE` with real secrets from provider dashboards.

### Option A: Interactive Setup (Recommended)
```powershell
cd functions

# iCard webhook secret (get from iCard merchant portal)
firebase functions:secrets:set ICARD_WEBHOOK_SECRET

# Revolut webhook secret (get from Revolut business dashboard)
firebase functions:secrets:set REVOLUT_WEBHOOK_SECRET

# iCard API key (for reconciliation API calls)
firebase functions:secrets:set ICARD_API_KEY

# Revolut API key (for reconciliation API calls)
firebase functions:secrets:set REVOLUT_API_KEY
```

### Option B: One-Line Setup (PowerShell)
```powershell
# WARNING: Replace placeholders first!
"YOUR_ICARD_WEBHOOK_SECRET" | firebase functions:secrets:set ICARD_WEBHOOK_SECRET --force
"YOUR_REVOLUT_WEBHOOK_SECRET" | firebase functions:secrets:set REVOLUT_WEBHOOK_SECRET --force
"YOUR_ICARD_API_KEY" | firebase functions:secrets:set ICARD_API_KEY --force
"YOUR_REVOLUT_API_KEY" | firebase functions:secrets:set REVOLUT_API_KEY --force
```

### After Setting Secrets - Redeploy Webhooks
```bash
firebase deploy --only functions:icardWebhooks,functions:revolutWebhooks
```

---

## 🎯 Step 3: Register Webhooks with Providers

### A) iCard Merchant Portal

1. **Login**: https://dashboard.icard.bg/
2. **Navigate**: Settings → API → Webhooks → Add New
3. **Configure**:
   - URL: `https://europe-west1-fire-new-globul.cloudfunctions.net/icardWebhooks`
   - Method: **POST**
   - Events: Select ALL payment events:
     - ✅ `payment.created`
     - ✅ `payment.completed`
     - ✅ `payment.failed`
     - ✅ `payment.pending`
     - ✅ `payment.refunded`
   - **Secret**: Generate strong secret (32+ chars), save it securely
4. **Test**: Use iCard's webhook testing tool
5. **Copy Secret**: Save to Firebase (Step 2 above)

### B) Revolut Business Dashboard

1. **Login**: https://business.revolut.com/
2. **Navigate**: Developer → Webhooks → Create Webhook
3. **Configure**:
   - URL: `https://europe-west1-fire-new-globul.cloudfunctions.net/revolutWebhooks`
   - Events: Select transaction events:
     - ✅ `TransactionCreated`
     - ✅ `TransactionStateChanged`
   - **Signing Secret**: Revolut auto-generates this
   - Signature Version: **v1** (default)
4. **Copy Secret**: Save to Firebase (Step 2 above)
5. **Test**: U Revolut's webhook simulator

---

## 🧪 Step 4: Test Sandbox Payments (Do This Now)

### Test Scenario 1: iCard Sandbox Payment

```bash
# 1. Create test ad in Firestore (manual: Firebase Console → Firestore → ads)
#    Note the ad_id (e.g., "test_ad_12345")

# 2. Make sandbox payment via iCard test environment
#    Use iCard's sandbox credentials
#    Include metadata: { ad_id: "test_ad_12345", user_id: "test_user_456" }

# 3. Check webhook logs
firebase functions:log --only icardWebhooks --limit 50

# 4. Verify payment record in Firestore
# Firebase Console → Firestore → payments
# Expected: 1 document with provider="icard", status="completed"

# 5. Verify ad status updated
# Firebase Console → Firestore → ads/{ad_id}
# Expected: status="payment_verified" or similar
```

### Test Scenario 2: Revolut Sandbox Payment

```bash
# 1. Create test ad (same as above)

# 2. Make sandbox payment via Revolut sandbox
#    Include reference: "ad_test_ad_12345_user_test_user_456"

# 3. Check webhook logs
firebase functions:log --only revolutWebhooks --limit 50

# 4. Verify payment + ad status (same checks as iCard)
```

### Test Scenario 3: Duplicate Webhook (Important!)

```bash
# Send the SAME webhook twice (copy payload from logs)
# Expected results:
# - First: 200 OK, payment recorded
# - Second: 409 Conflict, "Webhook already processed"
```

### Test Scenario 4: Invalid Signature (Security Test)

```bash
# Send webhook with wrong/missing signature
curl -X POST https://europe-west1-fire-new-globul.cloudfunctions.net/icardWebhooks \
  -H "Content-Type: application/json" \
  -H "X-iCard-Signature: invalid_signature_12345" \
  -d '{"transaction_id": "test_tx_001", "amount": 100}'

# Expected: 401 Unauthorized
# Expected log: "Invalid webhook signature"
```

---

## 📊 Step 5: Setup Monitoring (Cloud Console)

### A) Create Log-Based Alerts

**Alert 1: Webhook Failures (High Priority)**

```
Resource type: Cloud Function
Function name: matches "icardWebhooks|revolutWebhooks"
Severity: >= ERROR
Condition: Error count > 5 in 10 minutes
Notification: Email to admin@kolione.com + SMS
```

**Alert 2: Reconciliation Discrepancies**

```
Resource type: Cloud Function
Function name: dailyReconciliation
Log filter: jsonPayload.discrepancy_amount > 100
Notification: Email + Slack webhook
```

### B) Create Dashboard Queries

**Query 1: Payment Success Rate (Last 24h)**

```sql
SELECT 
  provider,
  COUNT(*) as total,
  SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as successful,
  ROUND(SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) / COUNT(*) * 100, 2) as success_rate
FROM payments
WHERE created_at >= TIMESTAMP_SUB(CURRENT_TIMESTAMP(), INTERVAL 24 HOUR)
GROUP BY provider;
```

**Query 2: Failed Webhooks (Last 7 Days)**

```
resource.type="cloud_function"
resource.labels.function_name=~"(icard|revolut)Webhooks"
severity>=ERROR
timestamp>="2026-01-29T00:00:00Z"
```

### C) Setup Firestore Indexes

```bash
# Required for reconciliation queries
firebase firestore:indexes

# Add in firebase.json:
{
  "firestore": {
    "indexes": [
      {
        "collectionGroup": "payments",
        "queryScope": "COLLECTION",
        "fields": [
          { "fieldPath": "created_at", "order": "DESCENDING" },
          { "fieldPath": "status", "order": "ASCENDING" }
        ]
      },
      {
        "collectionGroup": "payments",
        "queryScope": "COLLECTION",
        "fields": [
          { "fieldPath": "provider", "order": "ASCENDING" },
          { "fieldPath": "created_at", "order": "DESCENDING" }
        ]
      }
    ]
  }
}

# Deploy indexes
firebase deploy --only firestore:indexes
```

---

## 🔍 Step 6: Verify Reconciliation Works

### Manual Reconciliation Test

```typescript
// In Firebase Console → Functions → triggerReconciliation → Test
{
  "date": "2026-02-05",
  "sendAlerts": true
}
```

### Check Reconciliation Logs

```bash
firebase functions:log --only dailyReconciliation --limit 20
```

### Expected Output

```json
{
  "summary": {
    "total_payments": 25,
    "total_amount": 12500.00,
    "by_provider": {
      "icard": { "count": 15, "amount": 7500.00 },
      "revolut": { "count": 10, "amount": 5000.00 }
    },
    "discrepancy_count": 0,
    "discrepancy_amount": 0
  },
  "timestamp": "2026-02-05T02:00:00Z"
}
```

---

## 📥 Step 7: Export CSV for Accounting

### Via Callable Function (Admin Panel)

```typescript
// Admin dashboard code
const exportReconciliation = firebase.functions().httpsCallable('exportReconciliationReport');

const result = await exportReconciliation({
  startDate: '2026-02-01',
  endDate: '2026-02-05',
  format: 'csv'
});

// Download CSV
const blob = new Blob([result.data.csv], { type: 'text/csv' });
const url = window.URL.createObjectURL(blob);
const a = document.createElement('a');
a.href = url;
a.download = `reconciliation_${result.data.startDate}_${result.data.endDate}.csv`;
a.click();
```

### CSV Format (Expected Columns)

```csv
date,provider,transaction_id,ad_id,user_id,amount,currency,status,created_at,verified_at
2026-02-05,icard,icard_tx_123,ad_456,user_789,50.00,BGN,completed,2026-02-05T10:30:00Z,2026-02-05T10:30:05Z
2026-02-05,revolut,rev_tx_abc,ad_def,user_ghi,75.50,EUR,completed,2026-02-05T14:20:00Z,2026-02-05T14:20:03Z
```

---

## ⚠️ Step 8: Rollback Plan (Emergency)

### If Critical Issue Detected

```bash
# 1. Disable payment webhooks immediately
firebase functions:delete icardWebhooks --region europe-west1 --force
firebase functions:delete revolutWebhooks --region europe-west1 --force

# 2. Revert to previous commit
git log --oneline -5
git revert 4733884b  # Payment integration commit
git push origin master

# 3. Redeploy stable version
firebase deploy --only functions

# 4. Notify users (add banner to UI)
# "We're experiencing technical issues with some payment methods. Please use Stripe for now."
```

### Partial Rollback (One Provider Only)

```typescript
// In src/config/payment-methods.ts
export const ENABLED_PAYMENT_METHODS = [
  'stripe',
  // 'icard',  // ← Temporarily disabled
  'revolut',
  'iban'
];
```

---

## ✅ Pre-Production Checklist

- [ ] All 5 functions deployed (verify: `firebase functions:list`)
- [ ] Webhook URLs copied and saved
- [ ] Firebase Secrets configured (iCard + Revolut)
- [ ] Webhooks registered in provider dashboards (iCard + Revolut)
- [ ] Sandbox payment test passed (iCard)
- [ ] Sandbox payment test passed (Revolut)
- [ ] Duplicate webhook test passed (409 Conflict)
- [ ] Invalid signature test passed (401 Unauthorized)
- [ ] Cloud Monitoring alerts configured
- [ ] Firestore indexes deployed
- [ ] Manual reconciliation tested
- [ ] CSV export tested
- [ ] Rollback procedure documented
- [ ] Team trained on monitoring dashboard
- [ ] On-call schedule updated (24/7 coverage for payment issues)

---

## 📞 Emergency Contacts

| Role | Name | Contact |
|---|---|---|
| **Payment Issues** | DevOps Lead | +359-XXX-XXX-XXX |
| **iCard Support** | iCard Tech | support@icard.bg |
| **Revolut Support** | Revolut Business | https://business.revolut.com/help |
| **Firestore Issues** | Firebase Support | https://firebase.google.com/support |

---

## 📚 Additional Resources

- **Full Integration Guide**: [PAYMENT_INTEGRATION_GUIDE.md](./PAYMENT_INTEGRATION_GUIDE.md)
- **Post-Deployment Monitoring**: [POST_DEPLOYMENT_MONITORING.md](./POST_DEPLOYMENT_MONITORING.md)
- **Monitoring Scripts**: [scripts/README.md](./scripts/README.md)
- **Firebase Console**: https://console.firebase.google.com/project/fire-new-globul
- **Cloud Functions Logs**: https://console.cloud.google.com/logs/query?project=fire-new-globul

---

**Last Updated**: February 5, 2026  
**Next Review**: February 12, 2026 (after 7 days of production usage)  
**Maintainer**: Koli One DevOps Team
