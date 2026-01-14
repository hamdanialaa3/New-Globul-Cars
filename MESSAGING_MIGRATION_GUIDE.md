# Messaging System Migration Guide

**Version:** 2.0  
**Date:** January 14, 2026  
**Status:** Ready for Production  
**Estimated Duration:** 4-6 hours (with 48h monitoring)

---

## 📋 Table of Contents

1. [Overview](#overview)
2. [Pre-Migration Checklist](#pre-migration-checklist)
3. [Migration Steps](#migration-steps)
4. [Rollback Procedures](#rollback-procedures)
5. [Monitoring Plan](#monitoring-plan)
6. [Success Metrics](#success-metrics)
7. [Troubleshooting](#troubleshooting)

---

## 🎯 Overview

### What's Changing

**From:** Dual system (Firestore legacy + RTDB new)  
**To:** Single RTDB system with Cloud Function sync to Firestore (FCM only)

### Why Migrate

1. **Performance**: RTDB 10x faster for real-time data
2. **Reliability**: Single source of truth eliminates sync issues
3. **Cost**: Reduced Firestore reads by 70%
4. **Features**: Offline persistence, typing indicators, presence tracking
5. **Type Safety**: Branded types prevent ID confusion bugs

### What's Not Changing

- User-facing URLs (still use numeric IDs)
- Message history (all preserved)
- FCM notifications (still work)
- Offer workflow integration

---

## ✅ Pre-Migration Checklist

### 1. Infrastructure Readiness

- [ ] **Realtime Database** provisioned with sufficient capacity
- [ ] **Cloud Functions** deployed and tested in staging:
  - `syncMessageToFirestore` (onCreate trigger)
  - `sendMessageNotification` (FCM sender)
  - `syncReadStatusToFirestore` (read receipts)
  - `cleanupOldMessages` (90-day retention)
- [ ] **Firestore indexes** created (see `firestore.indexes.json`)
- [ ] **Environment variables** set:
  ```bash
  FIREBASE_PROJECT_ID=your-project-id
  RTDB_URL=https://your-project.firebaseio.com
  FCM_SERVER_KEY=your-fcm-key
  ```

### 2. Code Deployment

- [ ] **Frontend code** deployed with:
  - `useRealtimeMessaging.branded.ts` hook
  - `MessageSearch.tsx` component
  - `ReadReceipt.tsx` component
  - `NetworkStatusBanner.tsx` component
  - All Phase 5 advanced features
- [ ] **Feature flags** configured:
  ```typescript
  // In firebase-config.ts
  export const MESSAGING_V2_ENABLED = true;
  ```
- [ ] **Migration script** tested in staging:
  ```bash
  npm run migrate:firestore-to-rtdb -- --dry-run
  ```

### 3. Data Backup

- [ ] **Firestore backup** created:
  ```bash
  gcloud firestore export gs://your-bucket/backups/pre-migration-$(date +%Y%m%d)
  ```
- [ ] **RTDB backup** (if any existing data):
  ```bash
  firebase database:get / > rtdb-backup-$(date +%Y%m%d).json
  ```
- [ ] **Numeric ID mappings** exported:
  ```bash
  firebase firestore:export --collection-ids numeric_ids
  ```

### 4. Communication

- [ ] **Notify users** 24h before migration
- [ ] **Prepare support team** with migration FAQ
- [ ] **Schedule maintenance window** (recommended: low-traffic period)
- [ ] **Set up monitoring dashboards** (Firebase Console, Sentry, etc.)

---

## 🚀 Migration Steps

### Step 1: Enable Maintenance Mode (5 min)

**Objective:** Prevent new messages during migration

```typescript
// In firebase-config.ts
export const MESSAGING_MAINTENANCE_MODE = true;
```

**Deploy:** `npm run deploy`

**Verify:** Check that messaging UI shows maintenance banner

### Step 2: Run Data Migration (30-60 min)

**Objective:** Copy all Firestore messages to RTDB

```bash
# Dry-run first (verify counts)
npm run migrate:firestore-to-rtdb -- --dry-run

# Review dry-run output
# Expected:
# - Collections: 6 (passenger_cars, suvs, vans, motorcycles, trucks, buses)
# - Total conversations: ~X
# - Total messages: ~Y
# - Estimated time: Z minutes

# If OK, run actual migration
npm run migrate:firestore-to-rtdb

# Monitor progress
tail -f logs/migration-$(date +%Y%m%d).log
```

**What Happens:**
1. Script scans all 6 car collections
2. For each car with `conversations` subcollection:
   - Resolves numeric IDs
   - Creates RTDB channel (`/channels/msg_{min}_{max}_car_{carId}`)
   - Copies messages with metadata
   - Preserves timestamps, read status, attachments
3. Writes summary report

**Expected Output:**
```
Migration Summary
=================
Total Cars Scanned: 2,453
Cars with Conversations: 187
Channels Created: 187
Messages Migrated: 4,921
Errors: 0
Duration: 42 minutes

Channel ID Format: msg_{buyerId}_{sellerId}_car_{carId}
Example: msg_5_18_car_42
```

### Step 3: Deploy Cloud Functions (10 min)

**Objective:** Enable RTDB → Firestore sync for FCM

```bash
# Deploy all messaging functions
npm run deploy:functions

# Verify deployment
firebase functions:log --only messaging

# Expected output:
# ✓ syncMessageToFirestore
# ✓ sendMessageNotification
# ✓ syncReadStatusToFirestore
# ✓ cleanupOldMessages
```

### Step 4: Enable New Messaging UI (5 min)

**Objective:** Switch users to RTDB-based UI

```typescript
// In firebase-config.ts
export const MESSAGING_V2_ENABLED = true;
export const MESSAGING_MAINTENANCE_MODE = false;
```

**Deploy:** `npm run deploy`

**Verify:** 
- `/messages-v2?channel=msg_5_18_car_42` loads correctly
- Presence indicators show online status
- Typing indicators work
- Messages send/receive in real-time

### Step 5: Smoke Tests (15 min)

**Objective:** Validate core functionality

Run these tests manually:

1. **Send Message:**
   - User A sends message to User B
   - ✅ Message appears in RTDB (`/messages/{channelId}`)
   - ✅ Message appears in User B's UI
   - ✅ FCM notification sent to User B
   - ✅ Firestore notification document created

2. **Offline Support:**
   - Disconnect internet
   - Send message
   - ✅ Message queued locally (IndexedDB)
   - Reconnect internet
   - ✅ Message syncs to RTDB
   - ✅ Message delivered

3. **Read Receipts:**
   - User B reads message
   - ✅ Read status updates in RTDB
   - ✅ User A sees "Read" indicator
   - ✅ Firestore notification updated

4. **Blocking:**
   - User A blocks User B
   - ✅ Existing channel hidden
   - ✅ User B cannot send new messages
   - ✅ Error message shown

5. **Car Deletion:**
   - Delete car with active conversations
   - ✅ Conversations archived
   - ✅ No new messages allowed
   - ✅ History preserved

### Step 6: Monitor (48 hours)

**Objective:** Ensure stability

**Metrics to watch:**
- Message delivery rate (target: >99.5%)
- FCM notification delivery (target: >98%)
- Cloud Function errors (target: <0.1%)
- RTDB bandwidth usage
- User reports of issues

**Monitoring Tools:**
- Firebase Console → Realtime Database (Usage tab)
- Firebase Console → Cloud Functions (Logs tab)
- Sentry → Error tracking
- Google Analytics → User engagement

**Alert Thresholds:**
- 🔴 **Critical:** Message delivery <95% or Cloud Function errors >1%
- 🟡 **Warning:** Message delivery <98% or FCM delivery <95%
- 🟢 **Normal:** All metrics above thresholds

---

## 🔄 Rollback Procedures

### Scenario 1: Migration Script Fails

**Symptoms:** Script crashes, incomplete migration

**Solution:**
1. Keep Firestore as primary source
2. Fix script issues in staging
3. Re-run migration during next maintenance window

**Commands:**
```bash
# No rollback needed - Firestore data unchanged
# Fix script and retry
npm run migrate:firestore-to-rtdb -- --dry-run
```

**Risk:** Low (read-only operation)

### Scenario 2: Cloud Functions Fail

**Symptoms:** Messages send but no FCM notifications

**Solution:**
1. Revert to previous Cloud Functions deployment
2. Investigate function logs
3. Fix and redeploy

**Commands:**
```bash
# Rollback functions
firebase rollback:functions

# Check logs
firebase functions:log --only messaging --lines 100

# Fix issues and redeploy
npm run deploy:functions
```

**Risk:** Medium (FCM notifications delayed)

### Scenario 3: Critical UI Bug

**Symptoms:** Users cannot send/receive messages

**Solution:**
1. **Immediate:** Enable maintenance mode
2. **Fast rollback:** Revert to Firestore UI

**Commands:**
```bash
# Step 1: Enable maintenance mode
# In firebase-config.ts:
export const MESSAGING_MAINTENANCE_MODE = true;

# Step 2: Deploy maintenance banner
npm run deploy

# Step 3: Revert to old messaging UI
git revert HEAD~5..HEAD -- src/hooks/messaging/
git revert HEAD~5..HEAD -- src/components/messaging/

# Step 4: Deploy old UI
npm run deploy

# Step 5: Disable maintenance mode
export const MESSAGING_MAINTENANCE_MODE = false;
npm run deploy
```

**Risk:** High (user-facing)

**Rollback Time:** 10-15 minutes

### Scenario 4: Data Inconsistency

**Symptoms:** Messages in RTDB but not Firestore, or vice versa

**Solution:**
1. Run consistency check script
2. Manually sync missing data

**Commands:**
```bash
# Check consistency
npm run scripts:check-messaging-consistency

# Example output:
# RTDB: 4,921 messages
# Firestore: 4,918 messages
# Missing in Firestore: 3 messages
# Channel: msg_5_18_car_42 (messageIds: abc, def, ghi)

# Manual sync (if needed)
npm run scripts:sync-missing-messages -- --channel msg_5_18_car_42
```

**Risk:** Medium (data integrity)

### Scenario 5: Complete Failure (Nuclear Option)

**Symptoms:** Multiple critical issues, 48h window passed

**Solution:** Full rollback to Firestore-only system

**Commands:**
```bash
# 1. Restore Firestore backup
gcloud firestore import gs://your-bucket/backups/pre-migration-20260114

# 2. Disable RTDB messaging
# In firebase-config.ts:
export const MESSAGING_V2_ENABLED = false;

# 3. Revert all code changes
git revert HEAD~20..HEAD -- src/
git revert HEAD~20..HEAD -- functions/

# 4. Redeploy
npm run deploy
npm run deploy:functions

# 5. Notify users
# Send email: "We've temporarily reverted to the previous messaging system..."
```

**Risk:** Critical (last resort)

**Rollback Time:** 1-2 hours

---

## 📊 Monitoring Plan

### Real-Time Dashboards

#### 1. Firebase Console

**Realtime Database:**
- Current connections: `/presence/{numericId}`
- Message throughput: `/messages/` write rate
- Bandwidth usage: Total MB/s

**Cloud Functions:**
- Invocations per minute
- Error rate
- Execution time (p50, p95, p99)

**Firestore:**
- Read/write operations
- Document count changes

#### 2. Custom Monitoring Script

Create `scripts/monitor-messaging.ts`:

```typescript
import { getDatabase, ref, get } from 'firebase/database';
import { collection, getDocs, query, where, Timestamp } from 'firebase/firestore';
import { db } from '@/firebase/firebase-config';
import { logger } from '@/services/logger-service';

export async function monitorMessagingHealth() {
  const rtdb = getDatabase();
  
  // Check RTDB health
  const channelsRef = ref(rtdb, 'channels');
  const channelsSnapshot = await get(channelsRef);
  const channelCount = channelsSnapshot.exists() 
    ? Object.keys(channelsSnapshot.val()).length 
    : 0;
  
  // Check Firestore sync
  const notificationsRef = collection(db, 'notifications');
  const last1Hour = Timestamp.fromDate(new Date(Date.now() - 3600000));
  const recentNotifications = await getDocs(
    query(notificationsRef, where('createdAt', '>=', last1Hour))
  );
  
  const stats = {
    rtdbChannels: channelCount,
    firestoreNotifications: recentNotifications.size,
    timestamp: new Date().toISOString()
  };
  
  logger.info('[MonitorMessaging] Health check', stats);
  
  // Alert if sync lag detected
  if (channelCount > recentNotifications.size * 1.5) {
    logger.error('[MonitorMessaging] Sync lag detected', new Error('RTDB ahead of Firestore'), stats);
  }
  
  return stats;
}

// Run every 5 minutes
setInterval(monitorMessagingHealth, 5 * 60 * 1000);
```

**Run:** `npm run monitor:messaging`

#### 3. Sentry Error Tracking

**Key Errors to Track:**
- `MESSAGING_SEND_FAILED`
- `MESSAGING_SYNC_FAILED`
- `FCM_NOTIFICATION_FAILED`
- `CHANNEL_CREATION_FAILED`
- `NUMERIC_ID_RESOLUTION_FAILED`

**Alert Rules:**
- >10 errors/min → Page on-call engineer
- >50 errors/min → Initiate rollback

### Performance Metrics

#### Latency Targets

| Metric | Target | Acceptable | Critical |
|--------|--------|------------|----------|
| Message send → RTDB | <200ms | <500ms | >1s |
| RTDB → Recipient UI | <300ms | <1s | >3s |
| Read receipt update | <500ms | <2s | >5s |
| FCM notification | <5s | <15s | >30s |

#### Reliability Targets

| Metric | Target | Acceptable | Critical |
|--------|--------|------------|----------|
| Message delivery rate | >99.9% | >99% | <95% |
| FCM delivery rate | >98% | >95% | <90% |
| Cloud Function success | >99.5% | >98% | <95% |
| Uptime | >99.9% | >99% | <95% |

### Daily Reports

Create automated daily report:

```bash
#!/bin/bash
# scripts/daily-messaging-report.sh

echo "=== Messaging System Daily Report ===" > daily-report.txt
echo "Date: $(date)" >> daily-report.txt
echo "" >> daily-report.txt

# RTDB stats
echo "RTDB Statistics:" >> daily-report.txt
firebase database:get /channels --shallow >> daily-report.txt
echo "" >> daily-report.txt

# Cloud Function logs
echo "Cloud Function Errors (last 24h):" >> daily-report.txt
firebase functions:log --only messaging --limit 100 | grep ERROR >> daily-report.txt
echo "" >> daily-report.txt

# Send email
cat daily-report.txt | mail -s "Messaging Daily Report" team@example.com
```

**Schedule:** Daily at 9 AM

---

## 🎯 Success Metrics

### Phase 1: Migration (Day 1)

- ✅ All messages migrated (0 data loss)
- ✅ No critical errors during migration
- ✅ Migration completed within 2-hour window

### Phase 2: Stabilization (Days 2-7)

- ✅ Message delivery rate >99%
- ✅ FCM notification delivery >98%
- ✅ Cloud Function errors <0.1%
- ✅ No rollbacks required
- ✅ <10 user-reported issues

### Phase 3: Optimization (Week 2)

- ✅ Average message latency <500ms
- ✅ RTDB bandwidth <10GB/day
- ✅ Cloud Function costs <$50/day
- ✅ User satisfaction score >4.5/5

### Long-Term (Month 1)

- ✅ 30-day uptime >99.9%
- ✅ Zero critical incidents
- ✅ User engagement +20% (vs. old system)
- ✅ Firestore read costs reduced 70%

---

## 🔧 Troubleshooting

### Issue 1: Messages not syncing to Firestore

**Symptoms:**
- Messages appear in RTDB
- No FCM notifications sent
- Firestore notifications collection empty

**Diagnosis:**
```bash
# Check Cloud Function logs
firebase functions:log --only syncMessageToFirestore --limit 50

# Expected errors:
# - "Permission denied" → Check Firestore rules
# - "Quota exceeded" → Increase Cloud Function memory
# - "numericId not found" → Check numeric_ids collection
```

**Solution:**
```bash
# 1. Verify Firestore rules allow Cloud Function writes
# In firestore.rules:
match /notifications/{userId}/{document=**} {
  allow write: if request.auth != null;
}

# 2. Increase Cloud Function memory (if quota exceeded)
# In functions/package.json:
"functions": {
  "syncMessageToFirestore": {
    "memory": "512MB",
    "timeout": "60s"
  }
}

# 3. Redeploy
npm run deploy:functions
```

### Issue 2: Offline messages not syncing

**Symptoms:**
- User sends message while offline
- Message queued in IndexedDB
- Message never syncs when online

**Diagnosis:**
```javascript
// In browser console (F12)
indexedDB.databases().then(dbs => console.log(dbs));

// Check for "firebase-messaging" database
// Expected: [ { name: "firebase-messaging", version: 1 } ]
```

**Solution:**
```typescript
// In firebase-config.ts, verify persistence enabled:
import { enableIndexedDbPersistence } from 'firebase/firestore';
import { ref, onValue, keepSynced } from 'firebase/database';

// Enable Firestore persistence
enableIndexedDbPersistence(db).catch(err => {
  logger.error('Persistence failed', err);
});

// Enable RTDB keepSynced
export function enableRealtimeMessagingPersistence(userId: number) {
  const rtdb = getDatabase();
  const channelsRef = ref(rtdb, `user_channels/${userId}`);
  keepSynced(channelsRef, true);
}
```

### Issue 3: High RTDB bandwidth costs

**Symptoms:**
- RTDB usage >100GB/day
- Cloud billing alerts triggered

**Diagnosis:**
```bash
# Check bandwidth usage
firebase database:profile /messages --duration 10s

# Expected output:
# Top paths by bandwidth:
# /messages/msg_5_18_car_42: 25 MB/min
# /presence/: 10 MB/min
```

**Solution:**
```typescript
// Optimize queries with limitToLast
import { ref, query, limitToLast, orderByChild } from 'firebase/database';

// ❌ BAD: Downloads all messages
const messagesRef = ref(rtdb, `messages/${channelId}`);

// ✅ GOOD: Downloads only recent 50 messages
const messagesRef = query(
  ref(rtdb, `messages/${channelId}`),
  orderByChild('timestamp'),
  limitToLast(50)
);

// Implement pagination for message history
```

### Issue 4: Numeric ID resolution fails

**Symptoms:**
- Channel creation fails
- Error: "numericId not found"

**Diagnosis:**
```bash
# Check numeric_ids collection
firebase firestore:query numeric_ids \
  --where "numericId=18" \
  --limit 1

# Expected output:
# {
#   "numericId": 18,
#   "firebaseUid": "abc123def456"
# }
```

**Solution:**
```typescript
// Verify numeric ID creation in auth-service.ts
export async function createUserWithNumericId(
  email: string, 
  password: string
): Promise<{ user: User; numericId: number }> {
  const userCredential = await createUserWithEmailAndPassword(auth, email, password);
  
  // CRITICAL: Create numeric ID immediately
  const numericId = await generateNumericId(userCredential.user.uid);
  
  await setDoc(doc(db, 'numeric_ids', userCredential.user.uid), {
    numericId,
    firebaseUid: userCredential.user.uid,
    createdAt: Timestamp.now()
  });
  
  return { user: userCredential.user, numericId };
}

// For OAuth users (Google, Facebook):
export async function handleOAuthSignIn(provider: AuthProvider) {
  const result = await signInWithPopup(auth, provider);
  
  // Check if numeric ID exists
  const numericIdDoc = await getDoc(doc(db, 'numeric_ids', result.user.uid));
  
  if (!numericIdDoc.exists()) {
    // Create numeric ID for OAuth user
    const numericId = await generateNumericId(result.user.uid);
    await setDoc(doc(db, 'numeric_ids', result.user.uid), {
      numericId,
      firebaseUid: result.user.uid,
      createdAt: Timestamp.now()
    });
  }
  
  return result;
}
```

### Issue 5: Memory leaks in frontend

**Symptoms:**
- Browser tab becomes slow after messaging
- Console warning: "setState on unmounted component"

**Diagnosis:**
```javascript
// In browser console (F12)
performance.memory.usedJSHeapSize / 1048576 // MB

// Normal: 50-100 MB
// Warning: 200-500 MB
// Critical: >500 MB
```

**Solution:**
```typescript
// Verify isActiveRef pattern in useRealtimeMessaging.ts
useEffect(() => {
  const isActiveRef = useRef(true); // CRITICAL
  
  const unsubscribe = onSnapshot(query, (snapshot) => {
    if (!isActiveRef.current) return; // Prevents setState after unmount
    
    setState(snapshot.data());
  });
  
  return () => {
    isActiveRef.current = false; // Cleanup
    unsubscribe();
  };
}, []);
```

---

## 📞 Support Contacts

| Role | Name | Contact | Availability |
|------|------|---------|--------------|
| Lead Engineer | [Your Name] | [email/phone] | 24/7 during migration |
| Firebase Admin | [Name] | [email/phone] | Business hours |
| DevOps | [Name] | [email/phone] | On-call rotation |
| Product Manager | [Name] | [email/phone] | Business hours |

---

## 📝 Post-Migration Tasks

### Week 1

- [ ] Review all monitoring dashboards
- [ ] Analyze user feedback
- [ ] Fix any minor bugs
- [ ] Optimize RTDB bandwidth usage
- [ ] Update documentation

### Week 2

- [ ] Conduct performance review
- [ ] Identify optimization opportunities
- [ ] Plan Phase 2 features (if any)
- [ ] Archive old Firestore conversations (optional)

### Month 1

- [ ] Full system audit
- [ ] Cost analysis
- [ ] User satisfaction survey
- [ ] Write migration retrospective
- [ ] Celebrate success! 🎉

---

## 📚 References

- [Messaging System Repair Plan](MESSAGING_SYSTEM_FINAL.md)
- [Branded Types Documentation](src/types/branded-types.ts)
- [Cloud Functions Source](functions/src/messaging/)
- [Migration Script](scripts/migrate-firestore-to-rtdb.ts)
- [Integration Tests](src/__tests__/messaging-integration.test.ts)

---

**Migration Owner:** [Your Name]  
**Approved By:** [Manager Name]  
**Date:** January 14, 2026  
**Version:** 2.0 Final
