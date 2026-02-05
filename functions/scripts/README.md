# Firebase Functions Monitoring Scripts

Scripts for post-deployment monitoring and health checks.

## Available Scripts

### 1. `health-check.ps1` (Windows/PowerShell)
**Quick health check for Firebase Functions**

```powershell
cd functions
.\scripts\health-check.ps1
```

**What it checks:**
- ✅ Recent errors in Cloud Logging (last hour)
- ✅ Function deployment status (active count)
- ✅ Critical function health (last 30 min activity)
- ✅ Local codebase patterns (functions.config, plain imports)

**Output:**
- Green ✅ = Healthy
- Yellow ⚠️ = Warning
- Red ❌ = Error detected

---

### 2. `health-check.sh` (Linux/macOS/Bash)
**Same functionality as PowerShell version**

```bash
cd functions
chmod +x scripts/health-check.sh
./scripts/health-check.sh
```

**Requirements:**
- `gcloud` CLI installed and authenticated
- Project ID: `fire-new-globul`

**Exit codes:**
- `0` = Healthy or moderate issues
- `1` = High error count (>20 errors/hour)

---

## Critical Functions Monitored

| Function | Purpose | Region |
|----------|---------|--------|
| `stripeWebhooks` | Payment processing | europe-west1 |
| `onPaymentVerified` | Payment completion | europe-west1 |
| `prerenderSEO` | SEO/performance | us-central1 |
| `onNewRealtimeMessage` | Messaging | europe-west1 |
| `syncPassengerCarsToAlgolia` | Search indexing | us-central1 |
| `syncSuvsToAlgolia` | Search indexing | us-central1 |

---

## When to Run

### ✅ **Immediate (Run Now)**
- Right after deployment
- After upgrading dependencies
- After Node.js version change

### ⏰ **Scheduled**
- Every 6 hours for first 24h after deployment
- Every 12 hours for first week
- Daily for ongoing monitoring

### 🚨 **On-Demand**
- When users report issues
- After high traffic events
- Before/after major releases

---

## Quick Links

After running the script, check these manually:

1. **Firebase Console**  
   https://console.firebase.google.com/project/fire-new-globul/functions
   - View invocation graphs
   - Check error rates
   - Monitor quota usage

2. **Cloud Logging**  
   https://console.cloud.google.com/logs/query?project=fire-new-globul
   - Filter: `resource.type=cloud_function AND severity>=ERROR`

3. **Stripe Dashboard**  
   https://dashboard.stripe.com/webhooks
   - Check webhook delivery success rate

4. **Algolia Dashboard**  
   https://dashboard.algolia.com/
   - Verify search index sync status

---

## Troubleshooting

### "gcloud not found"
Install Google Cloud SDK:
- Windows: https://cloud.google.com/sdk/docs/install
- macOS: `brew install google-cloud-sdk`
- Linux: https://cloud.google.com/sdk/docs/install#linux

### "Permission denied"
Authenticate with gcloud:
```bash
gcloud auth login
gcloud config set project fire-new-globul
```

### "No recent activity"
This is normal if:
- Functions are event-triggered (not HTTP)
- Low traffic period (nighttime)
- Functions haven't been invoked yet

Check Firebase Console for historical data.

---

## See Also

- [POST_DEPLOYMENT_MONITORING.md](../POST_DEPLOYMENT_MONITORING.md) - Full monitoring guide
- [CI Workflow](../../.github/workflows/functions-ci.yml) - Automated checks
- [Firebase Console](https://console.firebase.google.com/project/fire-new-globul/functions) - Live metrics
