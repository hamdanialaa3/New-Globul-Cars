# Production Deployment Checklist
## Messaging System v2.0

**Date:** January 14, 2026  
**Deploy Window:** [SCHEDULE: Low-traffic period]  
**Duration:** 4-6 hours + 48h monitoring  
**Team:** Lead Engineer, DevOps, Support

---

## 🚦 Pre-Deployment (T-24 hours)

### Infrastructure Verification

- [ ] **Realtime Database**
  - [ ] Capacity: Sufficient for 2x current load
  - [ ] Backup enabled: Yes
  - [ ] Security rules deployed: ✅
  - [ ] Test write: `firebase database:set /test "{\"status\":\"ok\"}"`
  - [ ] Test read: `firebase database:get /test`

- [ ] **Cloud Functions**
  - [ ] Deployed to staging: ✅
  - [ ] All 4 functions healthy:
    - [ ] `syncMessageToFirestore`
    - [ ] `sendMessageNotification`
    - [ ] `syncReadStatusToFirestore`
    - [ ] `cleanupOldMessages`
  - [ ] Memory limits: 512MB (sync), 256MB (others)
  - [ ] Timeouts: 60s (sync), 30s (others)
  - [ ] Cold start test: <3s

- [ ] **Firestore**
  - [ ] Indexes created: `firestore.indexes.json`
  - [ ] Security rules updated: Allow Cloud Function writes
  - [ ] Backup created: `gs://your-bucket/backups/pre-migration-YYYYMMDD`
  - [ ] Verify backup: `gcloud firestore export --list`

- [ ] **Firebase Hosting**
  - [ ] Build successful: `npm run build`
  - [ ] Deployed to staging: `firebase hosting:channel:deploy staging`
  - [ ] Smoke test passed: ✅

### Code Readiness

- [ ] **Frontend**
  - [ ] All Phase 1-5 code merged to `main` branch
  - [ ] TypeScript type-check passed: `npm run type-check`
  - [ ] Linter passed: `npm run lint`
  - [ ] Tests passed: `npm test -- --passWithNoTests`
  - [ ] Build size <5MB: `npm run build:analyze`
  - [ ] Feature flag ready:
    ```typescript
    // firebase-config.ts
    export const MESSAGING_V2_ENABLED = false; // Will toggle to true
    export const MESSAGING_MAINTENANCE_MODE = false;
    ```

- [ ] **Backend**
  - [ ] Cloud Functions code reviewed: ✅
  - [ ] Environment variables set in Firebase Console
  - [ ] Secrets configured: FCM_SERVER_KEY, etc.
  - [ ] Function deployment tested in staging

- [ ] **Migration Script**
  - [ ] Dry-run completed: `npm run migrate:firestore-to-rtdb -- --dry-run`
  - [ ] Expected output verified:
    ```
    Total Cars Scanned: [NUMBER]
    Cars with Conversations: [NUMBER]
    Estimated Messages: [NUMBER]
    Estimated Duration: [TIME]
    ```
  - [ ] Logs directory exists: `logs/`
  - [ ] Script rollback plan documented: ✅ (in MESSAGING_MIGRATION_GUIDE.md)

### Team Preparation

- [ ] **Communication**
  - [ ] User notification sent (24h notice):
    > "We're upgrading our messaging system on [DATE] from [TIME] to [TIME].  
    > You may experience brief interruptions. Thank you for your patience!"
  - [ ] Support team briefed: FAQ document shared
  - [ ] On-call engineer assigned: [NAME]
  - [ ] Escalation path defined: Engineer → DevOps → Manager

- [ ] **Monitoring Setup**
  - [ ] Firebase Console dashboard open
  - [ ] Sentry error tracking active
  - [ ] Slack alerts configured:
    - Channel: `#messaging-deployment`
    - Webhook: [URL]
    - Threshold: >10 errors/min
  - [ ] Monitoring script ready: `npm run monitor:messaging`

- [ ] **Rollback Plan**
  - [ ] Rollback scripts tested in staging
  - [ ] Team trained on rollback procedures
  - [ ] Decision criteria documented:
    - 🔴 Rollback if: Message delivery <95%, Cloud Function errors >1%
    - 🟡 Monitor if: Message delivery <98%, FCM delivery <95%
    - 🟢 Proceed if: All metrics above thresholds

---

## 🚀 Deployment (T-0)

### Step 1: Enable Maintenance Mode (T+0:00)

```bash
# 1. Update feature flag
# In firebase-config.ts:
export const MESSAGING_MAINTENANCE_MODE = true;

# 2. Commit and deploy
git add src/firebase/firebase-config.ts
git commit -m "Enable maintenance mode for migration"
git push origin main
npm run build
firebase deploy --only hosting

# 3. Verify banner shows
# Open: https://your-domain.com/messages
# Expected: "System maintenance in progress..."
```

**Verification:**
- [ ] Maintenance banner visible: ✅
- [ ] New message sending blocked: ✅
- [ ] Existing messages readable: ✅

**Duration:** 5 minutes

---

### Step 2: Run Data Migration (T+0:05)

```bash
# 1. Final dry-run (sanity check)
npm run migrate:firestore-to-rtdb -- --dry-run | tee logs/dry-run-$(date +%Y%m%d-%H%M).log

# 2. Review output
cat logs/dry-run-$(date +%Y%m%d-%H%M).log
# Confirm: No errors, counts match expectations

# 3. Run actual migration
npm run migrate:firestore-to-rtdb | tee logs/migration-$(date +%Y%m%d-%H%M).log

# 4. Monitor progress (in separate terminal)
tail -f logs/migration-$(date +%Y%m%d-%H%M).log

# 5. Wait for completion
# Expected: "Migration completed successfully!"
```

**Monitoring During Migration:**
- [ ] No fatal errors in logs
- [ ] RTDB write rate: [NUMBER] writes/sec
- [ ] Firestore read rate: [NUMBER] reads/sec
- [ ] Memory usage: <2GB

**Verification After Migration:**
```bash
# Check RTDB structure
firebase database:get /channels --shallow
# Expected output:
# {
#   "msg_5_18_car_42": true,
#   "msg_10_25_car_123": true,
#   ...
# }

# Count channels
firebase database:get /channels --shallow | jq 'keys | length'
# Expected: [NUMBER] channels

# Sample channel data
firebase database:get /channels/msg_5_18_car_42
# Expected: Full channel object with messages, metadata
```

**Rollback Trigger:**
- [ ] If migration fails: See [Rollback Scenario 1](#scenario-1-migration-script-fails)
- [ ] If errors >5%: See [Rollback Scenario 2](#scenario-2-cloud-functions-fail)

**Duration:** 30-60 minutes (depends on data volume)

---

### Step 3: Deploy Cloud Functions (T+0:45)

```bash
# 1. Deploy messaging functions
firebase deploy --only functions:syncMessageToFirestore,functions:sendMessageNotification,functions:syncReadStatusToFirestore,functions:cleanupOldMessages

# 2. Verify deployment
firebase functions:log --only messaging --limit 10

# Expected output:
# ✓ syncMessageToFirestore (us-central1)
# ✓ sendMessageNotification (us-central1)
# ✓ syncReadStatusToFirestore (us-central1)
# ✓ cleanupOldMessages (us-central1)

# 3. Test trigger
firebase database:set /messages/test_channel/test_msg "{\"content\":\"test\",\"timestamp\":1234567890}"

# 4. Check function logs
firebase functions:log --only syncMessageToFirestore --limit 1
# Expected: Function executed successfully, wrote to Firestore
```

**Verification:**
- [ ] All 4 functions deployed: ✅
- [ ] No cold start errors: ✅
- [ ] Test message synced to Firestore: ✅
- [ ] FCM notification sent (if test user has token): ✅

**Rollback Trigger:**
- [ ] If functions fail to deploy: See [Rollback Scenario 2](#scenario-2-cloud-functions-fail)

**Duration:** 10 minutes

---

### Step 4: Enable New Messaging UI (T+1:00)

```bash
# 1. Update feature flags
# In firebase-config.ts:
export const MESSAGING_V2_ENABLED = true;
export const MESSAGING_MAINTENANCE_MODE = false;

# 2. Commit and deploy
git add src/firebase/firebase-config.ts
git commit -m "Enable RTDB messaging UI"
git push origin main
npm run build
firebase deploy --only hosting

# 3. Clear CDN cache (if applicable)
firebase hosting:channel:deploy live --expires 1h

# 4. Verify new UI loads
# Open: https://your-domain.com/messages-v2?channel=msg_5_18_car_42
```

**Verification:**
- [ ] New UI loads without errors: ✅
- [ ] Messages render correctly: ✅
- [ ] Send message works: ✅
- [ ] Receive message works: ✅
- [ ] Presence indicators show online status: ✅
- [ ] Typing indicators work: ✅
- [ ] Read receipts update: ✅

**Rollback Trigger:**
- [ ] If critical UI bug: See [Rollback Scenario 3](#scenario-3-critical-ui-bug)

**Duration:** 5 minutes

---

### Step 5: Smoke Tests (T+1:10)

**Test 1: Send/Receive Message**
```bash
# User A (you): Send message via UI
# User B (test account): Check if message received

# Verify in Firebase Console:
# 1. RTDB: /messages/msg_[A]_[B]_car_[ID] → New message exists
# 2. Firestore: notifications/[B]/messages/[channelId] → Notification created
# 3. Cloud Functions logs → syncMessageToFirestore executed successfully
```
- [ ] Message appears in RTDB: ✅
- [ ] Message appears in User B's UI: ✅
- [ ] FCM notification sent: ✅
- [ ] Firestore notification created: ✅

**Test 2: Offline Support**
```bash
# 1. Disconnect internet (browser DevTools → Network → Offline)
# 2. Send message
# 3. Reconnect internet
# 4. Verify message syncs
```
- [ ] Message queued in IndexedDB: ✅
- [ ] Message syncs after reconnect: ✅
- [ ] Recipient receives message: ✅

**Test 3: Read Receipts**
```bash
# 1. User B opens conversation
# 2. User A should see "Read" status
```
- [ ] Read status updates in RTDB: ✅
- [ ] User A sees "Read" indicator: ✅

**Test 4: Blocking**
```bash
# 1. User A blocks User B
# 2. User B tries to send message
```
- [ ] Channel hidden for User A: ✅
- [ ] User B sees error: "User unavailable": ✅
- [ ] No new messages allowed: ✅

**Test 5: Car Deletion**
```bash
# 1. Delete car with active conversation
# 2. Verify conversation archived
```
- [ ] Conversation archived in RTDB: ✅
- [ ] New messages blocked: ✅
- [ ] History preserved: ✅

**Duration:** 15 minutes

---

### Step 6: Gradual Rollout (T+1:30)

**Option A: Gradual (Recommended)**
```typescript
// In firebase-config.ts
export const MESSAGING_V2_ROLLOUT_PERCENTAGE = 10; // Start with 10% of users

// Increment over 48 hours:
// Hour 0: 10%
// Hour 6: 25%
// Hour 12: 50%
// Hour 24: 75%
// Hour 48: 100%

export function shouldUseMessagingV2(userId: number): boolean {
  if (!MESSAGING_V2_ENABLED) return false;
  
  // Deterministic rollout (same user always gets same result)
  return (userId % 100) < MESSAGING_V2_ROLLOUT_PERCENTAGE;
}
```

**Option B: Immediate (Risky)**
```typescript
// All users switch immediately
export const MESSAGING_V2_ENABLED = true;
```

**Choose:**
- [ ] **Gradual rollout** (safer, longer)
- [ ] **Immediate rollout** (riskier, faster)

**If Gradual:**
- [ ] T+0: 10% rollout deployed
- [ ] T+6h: Monitor metrics, increase to 25%
- [ ] T+12h: Monitor metrics, increase to 50%
- [ ] T+24h: Monitor metrics, increase to 75%
- [ ] T+48h: Monitor metrics, increase to 100%

**Duration:** 48 hours (gradual) or 0 (immediate)

---

## 📊 Post-Deployment Monitoring (T+1:30 → T+48:00)

### Real-Time Dashboard (Keep Open)

**Firebase Console:**
- [ ] Realtime Database → Usage tab
  - Watch: Concurrent connections, bandwidth, storage
  - Alert if: Bandwidth >100GB/day, connections >10,000
  
- [ ] Cloud Functions → Dashboard
  - Watch: Invocations, errors, execution time
  - Alert if: Error rate >1%, execution time >10s (p95)
  
- [ ] Firestore → Usage tab
  - Watch: Read/write operations, document count
  - Alert if: Read rate >1M/day (should decrease)

**Sentry:**
- [ ] Open Sentry dashboard
- [ ] Filter by: `messaging-*` tags
- [ ] Alert if: >10 errors/min

**Custom Monitoring:**
```bash
# Run in separate terminal
npm run monitor:messaging

# Expected output every 5 minutes:
# [INFO] Health check:
#   RTDB Channels: 187
#   Firestore Notifications (1h): 42
#   Sync Lag: 0 messages
#   Timestamp: 2026-01-14T10:30:00Z
```

### Metrics to Watch

| Metric | Target | Current | Status |
|--------|--------|---------|--------|
| Message delivery rate | >99.5% | [AUTO] | 🟢 |
| FCM notification delivery | >98% | [AUTO] | 🟢 |
| Cloud Function errors | <0.1% | [AUTO] | 🟢 |
| RTDB bandwidth | <10GB/day | [AUTO] | 🟢 |
| Average message latency | <500ms | [AUTO] | 🟢 |
| User-reported issues | <5/day | [MANUAL] | 🟢 |

**Alert Thresholds:**
- 🔴 **Critical** (Initiate rollback):
  - Message delivery <95%
  - Cloud Function errors >1%
  - RTDB completely down
  
- 🟡 **Warning** (Investigate immediately):
  - Message delivery <98%
  - FCM delivery <95%
  - Cloud Function errors >0.5%
  - RTDB bandwidth >50GB/day
  
- 🟢 **Normal** (Continue monitoring):
  - All metrics above thresholds

### Hourly Checks (First 48h)

**Every Hour:**
- [ ] Check Firebase Console dashboards
- [ ] Check Sentry for new errors
- [ ] Review Cloud Function logs: `firebase functions:log --only messaging --limit 50`
- [ ] Check support tickets: Any messaging complaints?
- [ ] Verify sync lag: `npm run scripts:check-messaging-consistency`

**Every 6 Hours:**
- [ ] Run full smoke tests again
- [ ] Generate health report: `npm run scripts:generate-health-report`
- [ ] Email report to team

**Every 24 Hours:**
- [ ] Full system audit
- [ ] Performance review: Latency, throughput, costs
- [ ] User feedback analysis
- [ ] Decision: Continue or rollback?

---

## 🔄 Rollback Procedures (If Needed)

### Scenario 1: Migration Script Fails

**Triggers:**
- Script crashes mid-execution
- <95% of messages migrated
- Fatal errors in logs

**Actions:**
```bash
# 1. Stop migration (Ctrl+C)
# 2. Keep maintenance mode ON
# 3. Review logs
cat logs/migration-$(date +%Y%m%d-%H%M).log | grep ERROR

# 4. Fix issues in staging
# 5. Schedule re-attempt

# NO DATA LOSS (Firestore unchanged)
```

**Duration:** 0 minutes (no rollback needed)

---

### Scenario 2: Cloud Functions Fail

**Triggers:**
- Functions fail to deploy
- Error rate >1%
- No FCM notifications sent

**Actions:**
```bash
# 1. Rollback to previous functions
firebase rollback:functions

# 2. Verify rollback
firebase functions:log --only messaging --limit 10

# 3. Investigate
firebase functions:log --only messaging --limit 100 | grep ERROR

# 4. Fix and redeploy
# (Fix issues in code)
firebase deploy --only functions

# 5. If persistent: Disable RTDB messaging
# In firebase-config.ts:
export const MESSAGING_V2_ENABLED = false;
npm run deploy
```

**Duration:** 10 minutes

---

### Scenario 3: Critical UI Bug

**Triggers:**
- Users cannot send/receive messages
- UI crashes or freezes
- >50 support tickets in 1 hour

**Actions:**
```bash
# 1. IMMEDIATE: Enable maintenance mode
# In firebase-config.ts:
export const MESSAGING_MAINTENANCE_MODE = true;
npm run build && firebase deploy --only hosting

# 2. Revert to Firestore UI
git revert HEAD~5..HEAD -- src/hooks/messaging/
git revert HEAD~5..HEAD -- src/components/messaging/
npm run build
firebase deploy --only hosting

# 3. Disable maintenance mode
export const MESSAGING_MAINTENANCE_MODE = false;
npm run deploy

# 4. Notify users
# Email: "We've temporarily reverted to the previous messaging system..."
```

**Duration:** 15 minutes

---

### Scenario 4: Complete Failure (Nuclear Option)

**Triggers:**
- Multiple critical issues
- Rollback attempts failed
- 48h window passed without resolution

**Actions:**
```bash
# 1. Restore Firestore backup
gcloud firestore import gs://your-bucket/backups/pre-migration-20260114

# 2. Disable RTDB messaging completely
# In firebase-config.ts:
export const MESSAGING_V2_ENABLED = false;
export const USE_FIRESTORE_ONLY = true;

# 3. Revert ALL code changes
git reset --hard [PRE-MIGRATION-COMMIT-HASH]
npm run build
firebase deploy

# 4. Full team debrief
# Schedule: Post-mortem meeting to analyze failure
```

**Duration:** 1-2 hours

---

## ✅ Success Criteria (48h Checkpoint)

### Go/No-Go Decision

**✅ PROCEED** if:
- [ ] Message delivery rate >99%
- [ ] FCM notification delivery >98%
- [ ] Cloud Function errors <0.1%
- [ ] User-reported issues <10 total
- [ ] No critical incidents
- [ ] Team consensus: "System stable"

**🔄 ROLLBACK** if:
- [ ] Message delivery rate <95%
- [ ] Cloud Function errors >1%
- [ ] >50 user-reported issues
- [ ] Any critical incident (data loss, security breach)
- [ ] Team consensus: "System unstable"

**Decision Maker:** [Lead Engineer + Manager]

**Decision Time:** T+48:00

---

## 📝 Post-Deployment Tasks

### Immediate (T+48h)

- [ ] **Decommission Old System** (if successful):
  ```bash
  # Archive old messaging code
  git mv src/hooks/messaging/useRealtimeMessaging.old.ts DDD/deprecated/
  git mv src/services/advanced-messaging.service.ts DDD/deprecated/
  git commit -m "Archive old messaging system"
  
  # Optional: Delete old Firestore conversations (after 30 days)
  # (Keep backup for 90 days minimum)
  ```

- [ ] **Update Documentation**:
  - [ ] Mark `MESSAGING_SYSTEM_FINAL.md` as "Deployed"
  - [ ] Update `README.md` with new architecture
  - [ ] Archive migration guide to `/ARCHIVE/`

- [ ] **Team Debrief**:
  - [ ] Schedule retrospective meeting
  - [ ] Document lessons learned
  - [ ] Celebrate success! 🎉

### Week 1

- [ ] **Performance Optimization**:
  - [ ] Analyze RTDB bandwidth usage
  - [ ] Optimize Cloud Function memory/timeouts
  - [ ] Implement query pagination (if needed)
  - [ ] Review cost analytics

- [ ] **User Feedback**:
  - [ ] Send satisfaction survey
  - [ ] Analyze support tickets
  - [ ] Prioritize bug fixes

### Month 1

- [ ] **Full Audit**:
  - [ ] 30-day uptime report
  - [ ] Cost comparison (old vs. new)
  - [ ] User engagement analysis
  - [ ] Write final report

---

## 📞 Emergency Contacts

| Role | Name | Phone | Email |
|------|------|-------|-------|
| Lead Engineer | [Your Name] | [Phone] | [Email] |
| DevOps On-Call | [Name] | [Phone] | [Email] |
| Firebase Admin | [Name] | [Phone] | [Email] |
| Product Manager | [Name] | [Phone] | [Email] |
| CEO (Escalation) | [Name] | [Phone] | [Email] |

**Slack Channel:** `#messaging-deployment`  
**Zoom Room:** [Link for emergency calls]

---

## 📚 Reference Documents

- [Migration Guide](MESSAGING_MIGRATION_GUIDE.md)
- [Integration Tests](src/__tests__/messaging-integration.test.ts)
- [Rollback Procedures](MESSAGING_MIGRATION_GUIDE.md#rollback-procedures)
- [Monitoring Guide](MESSAGING_MIGRATION_GUIDE.md#monitoring-plan)

---

## ✅ Final Sign-Off

**Pre-Deployment Checklist Completed:**
- [ ] Lead Engineer: _________________ Date: _______
- [ ] DevOps: _________________ Date: _______
- [ ] Product Manager: _________________ Date: _______

**Post-Deployment Sign-Off (T+48h):**
- [ ] Lead Engineer: _________________ Date: _______
- [ ] DevOps: _________________ Date: _______
- [ ] Product Manager: _________________ Date: _______

**Decision:**
- [ ] ✅ **PROCEED** - System stable, decommission old system
- [ ] 🔄 **ROLLBACK** - System unstable, revert changes

**Notes:**
```
[Additional notes, observations, or concerns]
```

---

**Document Version:** 1.0  
**Last Updated:** January 14, 2026  
**Owner:** [Your Name]  
**Status:** ✅ **READY FOR PRODUCTION**
