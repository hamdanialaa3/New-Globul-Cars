# 🔒 SECURITY OPERATIONS GUIDE
## Firebase Service Account & Security Management

**Last Updated:** January 25, 2026  
**Project:** Koli One (Fire New Globul)  
**Status:** Production Active

---

## 📋 Table of Contents

1. [Service Account Rotation](#1-service-account-rotation)
2. [Secret Revocation](#2-secret-revocation)
3. [Git History Cleanup](#3-git-history-cleanup)
4. [Security Rules Deployment](#4-security-rules-deployment)
5. [Rate Limiting System](#5-rate-limiting-system)
6. [Numeric ID System](#6-numeric-id-system)
7. [Incident Response](#7-incident-response)

---

## 1. Service Account Rotation

### When to Rotate

- **Immediate**: If credentials are exposed in public repo or logs
- **Scheduled**: Every 90 days (best practice)
- **Post-Incident**: After any security event
- **Team Changes**: When admin access changes

### Rotation Steps

#### Step 1: Create New Service Account

```bash
# 1. Go to Firebase Console
# https://console.firebase.google.com/project/fire-new-globul/settings/serviceaccounts/adminsdk

# 2. Click "Generate New Private Key"
# 3. Download JSON file (e.g., firebase-service-account-NEW.json)
```

#### Step 2: Update Environment Variables

```bash
# 1. Copy new credentials to environment variable
# Method A: PowerShell (Windows)
$env:FIREBASE_SERVICE_ACCOUNT_JSON = Get-Content "path/to/new-key.json" -Raw

# Method B: Linux/Mac
export FIREBASE_SERVICE_ACCOUNT_JSON=$(cat path/to/new-key.json)

# 2. Update CI/CD secrets
# GitHub Actions: Settings → Secrets → FIREBASE_SERVICE_ACCOUNT_JSON
# Firebase Hosting: firebase functions:config:set service_account.json="$(cat new-key.json)"
```

#### Step 3: Test New Credentials

```bash
# Test admin scripts with new credentials
cd scripts
node verify-firebase-connection.js

# Expected output:
# ✅ Firebase Admin initialized successfully
# ✅ Firestore connection verified
```

#### Step 4: Update Production Functions

```bash
# Deploy Cloud Functions with new credentials
firebase use production
firebase deploy --only functions

# Verify functions are using new credentials
firebase functions:log --only beforeUserCreated
```

#### Step 5: Deactivate Old Service Account

```bash
# 1. Wait 24-48 hours to ensure no systems use old key
# 2. Go to IAM & Admin in Google Cloud Console
# https://console.cloud.google.com/iam-admin/serviceaccounts?project=fire-new-globul

# 3. Find old service account
# 4. Click "Keys" tab
# 5. Delete old key (keep new one only)
```

---

## 2. Secret Revocation

### Immediate Actions (< 1 Hour)

```bash
# 1. Rotate Firebase service account (see above)

# 2. Regenerate Firebase API keys
# https://console.firebase.google.com/project/fire-new-globul/settings/general

# 3. Rotate database secrets
firebase functions:config:unset stripe.secret
firebase functions:config:set stripe.secret="sk_live_NEW_KEY"

# 4. Invalidate all user sessions (if breach confirmed)
# Run Cloud Function to force re-authentication
firebase functions:call invalidateAllSessions
```

### Post-Revocation Checklist

- [ ] All admin scripts use new credentials
- [ ] CI/CD pipelines updated
- [ ] Cloud Functions redeployed
- [ ] Monitoring shows no errors with new keys
- [ ] Old keys deleted from Firebase Console
- [ ] Team notified of credential change

---

## 3. Git History Cleanup

### ⚠️ WARNING: Destructive Operation

**Before proceeding:**
1. Create backup: `git clone --mirror <repo-url> backup.git`
2. Notify all team members (they will need to re-clone)
3. Coordinate with all active branches

### Method A: BFG Repo-Cleaner (Recommended)

```bash
# 1. Download BFG
# https://rtyley.github.io/bfg-repo-cleaner/

# 2. Clone fresh copy
git clone --mirror https://github.com/hamdanialaa3/New-Globul-Cars.git

# 3. Remove sensitive file
java -jar bfg.jar --delete-files firebase-service-account.json New-Globul-Cars.git

# 4. Clean up
cd New-Globul-Cars.git
git reflog expire --expire=now --all
git gc --prune=now --aggressive

# 5. Force push (DANGEROUS - overwrites history)
git push --force
```

### Method B: git-filter-repo (Alternative)

```bash
# 1. Install git-filter-repo
# pip install git-filter-repo

# 2. Clone fresh copy
git clone https://github.com/hamdanialaa3/New-Globul-Cars.git
cd New-Globul-Cars

# 3. Remove file from all history
git filter-repo --path firebase-service-account.json --invert-paths

# 4. Force push
git remote add origin https://github.com/hamdanialaa3/New-Globul-Cars.git
git push --force --all
```

### Post-Cleanup Actions

```bash
# 1. All developers re-clone repo
git clone https://github.com/hamdanialaa3/New-Globul-Cars.git

# 2. Verify file is gone from history
git log --all --full-history -- firebase-service-account.json
# Should return nothing

# 3. GitHub: Invalidate cached versions
# Settings → Security → Advanced security → Purge cache
```

---

## 4. Security Rules Deployment

### Firestore Rules

```bash
# 1. Review changes
firebase firestore:rules --help

# 2. Deploy rules
firebase deploy --only firestore:rules

# 3. Verify deployment
# Check Firebase Console → Firestore → Rules
# Test with Firestore Emulator
firebase emulators:start --only firestore

# 4. Monitor for blocked operations
# Console → Firestore → Usage → Denied requests
```

### Storage Rules

```bash
# 1. Test rules locally
firebase emulators:start --only storage

# 2. Deploy rules
firebase deploy --only storage

# 3. Verify no legitimate uploads blocked
# Console → Storage → Usage → Denied operations

# 4. If legitimate path blocked, add explicit rule:
# Edit storage.rules → Add specific match block → Redeploy
```

### Rules Rollback (Emergency)

```bash
# 1. Find last working version
git log -- firestore.rules storage.rules

# 2. Checkout previous version
git checkout <commit-hash> -- firestore.rules storage.rules

# 3. Deploy immediately
firebase deploy --only firestore:rules,storage

# 4. Investigate what broke
firebase functions:log --only beforeUserCreated
```

---

## 5. Rate Limiting System

### Overview

- **File:** `functions/src/blocking/beforeCreate.ts`
- **Type:** Auth Blocking Function
- **Limit:** 3 registrations per device fingerprint per 24 hours
- **Fingerprint:** SHA256(IP + User-Agent)

### Monitoring

```bash
# View blocked registrations
firebase firestore:query registration_attempts --where blocked==true --limit 50

# View rate limit logs
firebase functions:log --only beforeUserCreated

# Alert on high block rate (>10% of attempts)
# Set up Cloud Monitoring alert in Firebase Console
```

### Adjusting Limits

```typescript
// File: functions/src/blocking/beforeCreate.ts

// Change these constants:
const MAX_ATTEMPTS = 3;        // Increase to 5 for more lenient
const WINDOW_HOURS = 24;       // Change to 48 for 2-day window

// Redeploy:
firebase deploy --only functions:beforeUserCreated
```

### Whitelist IP/Device (Emergency)

```typescript
// Add to beforeUserCreated function:

const WHITELIST_FINGERPRINTS = [
  'abc123...', // Support team device
  'def456...', // Testing environment
];

if (WHITELIST_FINGERPRINTS.includes(fingerprint)) {
  return; // Skip rate limit check
}
```

### Clearing Rate Limit for User

```bash
# Delete attempts for specific fingerprint
firebase firestore:delete "registration_attempts" \
  --where "fingerprint==abc123..." \
  --recursive
```

---

## 6. Numeric ID System

### Overview

- **File:** `functions/src/triggers/onUserCreate.ts`
- **Type:** Firestore Trigger
- **Trigger:** `users/{userId}` onCreate
- **Counter:** `counters/users`

### Monitoring

```bash
# Check current counter value
firebase firestore:get counters/users

# View recent numeric ID assignments
firebase functions:log --only onUserCreate

# Find users without numeric ID
firebase firestore:query users --where numericId==null
```

### Manual Numeric ID Assignment

```bash
# Run admin script for missing IDs
cd scripts
node assign-missing-numeric-ids.js

# Or use TypeScript version
npx ts-node assign-missing-numeric-ids.ts
```

### Fixing Duplicate Numeric IDs (Rare)

```typescript
// Run this admin script only if duplicates detected:

const admin = require('firebase-admin');
admin.initializeApp();

async function fixDuplicates() {
  const db = admin.firestore();
  const usersSnap = await db.collection('users').get();
  
  const idMap = new Map();
  const duplicates = [];
  
  usersSnap.forEach(doc => {
    const numericId = doc.data().numericId;
    if (idMap.has(numericId)) {
      duplicates.push(doc.id);
    } else {
      idMap.set(numericId, doc.id);
    }
  });
  
  console.log('Duplicates found:', duplicates);
  // Manually reassign IDs for duplicate users
}
```

---

## 7. Incident Response

### Security Event Checklist

1. **Immediate Actions (< 30 min)**
   - [ ] Identify scope of breach
   - [ ] Rotate exposed credentials
   - [ ] Review recent access logs
   - [ ] Notify security team

2. **Short-term Actions (< 24 hours)**
   - [ ] Clean git history if credentials exposed
   - [ ] Force logout all users if user data breached
   - [ ] Deploy emergency security rules
   - [ ] Document incident in SECURITY.md

3. **Long-term Actions (< 7 days)**
   - [ ] Conduct security audit
   - [ ] Review and update security rules
   - [ ] Implement additional monitoring
   - [ ] Train team on security practices

### Emergency Contacts

- **Firebase Support:** https://firebase.google.com/support
- **Google Cloud Security:** security@google.com
- **Project Lead:** support@koli.one

### Logging & Monitoring

```bash
# Enable detailed Cloud Function logs
firebase functions:config:set logger.level="debug"
firebase deploy --only functions

# Set up alerts in Cloud Monitoring
# https://console.cloud.google.com/monitoring/alerting

# Common alerts:
# - High rate of blocked registrations (>10% in 5 min)
# - Numeric ID assignment failures (>5 in 1 hour)
# - Storage rule denials (>50 in 5 min)
# - Unusual admin script activity
```

---

## 📚 Additional Resources

- [Firebase Security Checklist](https://firebase.google.com/support/guides/security-checklist)
- [Google Cloud Security Best Practices](https://cloud.google.com/security/best-practices)
- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [BFG Repo-Cleaner](https://rtyley.github.io/bfg-repo-cleaner/)
- [git-filter-repo](https://github.com/newren/git-filter-repo)

---

## 🔄 Version History

| Version | Date | Changes | Author |
|---------|------|---------|--------|
| 1.0 | 2026-01-25 | Initial security operations guide | System Architect |

---

**© 2026 Koli One - Confidential Security Documentation**
