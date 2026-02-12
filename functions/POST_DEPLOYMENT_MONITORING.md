# Firebase Functions Upgrade - Post-Deployment Monitoring Guide

**Date:** February 5, 2026  
**Commit:** `a69b2281` (CI) + `3d298ba1` (Node 22 upgrade)  
**Changes:** firebase-functions v4.9.0 → v7.0.5, Node 20 → 22, clean build pipeline

---

## ✅ Completed Steps

- ✅ **73/73 functions** deployed on Node.js 22
- ✅ All `functions.config()` → `process.env` migrations verified
- ✅ All imports now use `firebase-functions/v1`
- ✅ Clean build pipeline with `prebuild` step
- ✅ CI workflow active with forbidden pattern checks
- ✅ Zero TypeScript errors, zero stale artifacts

---

## 🔍 Critical Monitoring (First 48 Hours)

### 1. Firebase Console Monitoring
**URL:** https://console.firebase.google.com/project/fire-new-globul/functions

**Watch for:**
- Function invocation errors (spike >20% from baseline)
- Cold start latency increases
- Timeouts (especially `prerenderSEO`, `stripeWebhooks`)
- Quota warnings

**Check every:** 6 hours for first 24h, then every 12h

---

### 2. Cloud Logging
**Filter for errors:**
```
resource.type="cloud_function"
severity>=ERROR
timestamp>="2026-02-05T00:00:00Z"
```

**Priority functions to monitor:**
- `stripeWebhooks` - payment processing
- `onPaymentVerified` - payment completion
- `onNewRealtimeMessage` - messaging
- `prerenderSEO` - SEO/performance
- All Algolia sync functions - search indexing

---

### 3. Key Metrics to Track

| Metric | Baseline | Alert Threshold | Where |
|--------|----------|----------------|-------|
| **Error Rate** | <0.5% | >1% | Firebase Console |
| **Avg Execution Time** | Varies by function | +30% increase | Cloud Monitoring |
| **Cold Start Time** | ~2-5s | >10s | Cloud Trace |
| **Stripe Webhook Success** | ~99% | <95% | Stripe Dashboard |
| **Algolia Sync Lag** | <5min | >15min | Algolia Dashboard |

---

### 4. Sentry/Error Tracking (If Configured)

**Set up alert rules:**
1. Error count >20% increase (1-hour window)
2. New error types introduced
3. Critical function failures (webhook, payment)

**Alert channels:** Email + Slack (if configured)

---

### 5. Quick Health Check Commands

From `web/functions` directory:

```bash
# Check recent function logs (last 10 minutes)
firebase functions:log --only stripeWebhooks,onPaymentVerified --limit 50

# Check function status
gcloud functions list --filter="name:*fire-new-globul*" --format="table(name,status,runtime)"

# Check for new errors in last hour
gcloud logging read "resource.type=cloud_function AND severity>=ERROR AND timestamp>=\"$(date -u -d '1 hour ago' '+%Y-%m-%dT%H:%M:%SZ')\"" --limit 100 --format json
```

---

## 🚨 Rollback Plan (If Critical Issues Detected)

### Option 1: Git Revert
```bash
cd "c:\Users\hamda\Desktop\Koli_One_Root\web"
git revert a69b2281 3d298ba1  # Revert CI + Node 22 commits
git push origin master
firebase deploy --only functions
```

### Option 2: Targeted Function Rollback
```bash
# Delete problematic function
firebase functions:delete <functionName> --region <region> --force

# Redeploy from stable commit
git checkout 3c083a29  # Last stable commit (pre-Node 22)
cd functions
npm run build
firebase deploy --only functions:<functionName>
git checkout master
```

### Option 3: Full Rollback to Last Stable
```bash
git reset --hard 3c083a29
git push origin master --force
firebase deploy --only functions
```

**⚠️ Before rollback:**
1. Document the error (screenshots, logs, error messages)
2. Check if it's a transient issue (wait 5-10 minutes)
3. Verify it's related to the upgrade (check logs for `firebase-functions` or Node-related errors)

---

## 📊 Success Criteria (After 48 Hours)

- [ ] No critical errors in Cloud Logging
- [ ] Error rate remains below baseline +10%
- [ ] Stripe webhook success rate >95%
- [ ] No user-reported issues with payments/messaging
- [ ] Algolia search indexes updating normally
- [ ] All scheduled functions executing on time
- [ ] No quota exceeded errors

**If all criteria met:** Upgrade considered stable ✅

---

## 📝 Next Steps (Week 2-4)

1. **Monitor long-term stability** (2 weeks)
2. **Update CHANGELOG.md** with upgrade notes
3. **Review Cloud Functions billing** (Node 22 may have different cost profile)
4. **Consider migrating to Gen 2 functions** (v2 API, better performance)
5. **Add integration tests** for critical functions (webhooks, triggers)

---

## 🔗 Useful Links

- Firebase Console: https://console.firebase.google.com/project/fire-new-globul
- Cloud Logging: https://console.cloud.google.com/logs (filter by `fire-new-globul`)
- Stripe Dashboard: https://dashboard.stripe.com/webhooks
- Algolia: https://dashboard.algolia.com/

---

## 📞 Emergency Contacts

- **Primary:** Check Firebase Console first
- **Logs:** Cloud Logging with error filter
- **Rollback:** Use commands above
- **Questions:** Refer to firebase-functions migration guide: https://firebase.google.com/docs/functions/config-env#migrate-config
