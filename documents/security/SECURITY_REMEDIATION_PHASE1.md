# 🚨 CRITICAL SECURITY REMEDIATION - EMERGENCY CHECKLIST
**Date:** February 9, 2026
**Status:** IN PROGRESS
**Severity:** CRITICAL - EXECUTE IMMEDIATELY

---

## ⚠️ PHASE 1: EMERGENCY MANUAL ACTIONS (Your Console Access Required)

### 1.1 - Google Cloud Console: Rotate All 7 API Keys
**Timeline:** Complete within 5 minutes

**Exposed Keys to Revoke:**
```
❌ REDACTED_GEMINI_KEY_1 (Gemini - DUPLICATE 3x)
❌ REDACTED_FIREBASE_KEY_1 (Firebase)
❌ REDACTED_MAPS_KEY (Maps)
❌ REDACTED_FIREBASE_KEY_2 (Firebase - DUPLICATE 3x)
❌ REDACTED_GEMINI_AI_KEY (Gemini AI)
```

**Steps:**
- [ ] Go to: https://console.cloud.google.com/apis/credentials
- [ ] For each key, click **Delete** button
- [ ] Create NEW keys:
  - [ ] Gemini API key (unrestricted for now, will be restricted after)
  - [ ] Firebase API key
  - [ ] Maps API key
  - [ ] Vertex AI key (if used)
- [ ] Copy new keys to secure location (KeePass/password manager)
- [ ] **DO NOT paste into code** - paste only to `.env.local` locally

**Verification:**
```bash
# After deletion, old keys should return 403 errors
curl "https://generativelanguage.googleapis.com/v1beta/models?key=REDACTED_GEMINI_KEY_1"
# Expected: 403 Forbidden (Key has been disabled, check with Cloud Console)
```

---

### 1.2 - Firebase Console: Review & Revoke Service Accounts
**Timeline:** Complete within 10 minutes

**Steps:**
- [ ] Go to: https://console.firebase.google.com/project/fire-new-globul/settings/serviceaccounts
- [ ] Check **Admin SDK** tab
- [ ] Look for any compromised service account keys
- [ ] If found, click **Delete** and generate new key (download JSON locally, never commit)
- [ ] Go to **Authentication** tab
- [ ] Verify sign-in methods are using API keys only (not service accounts in client code)

**Email Patterns to Remove from Firestore Rules:**
```
❌ globul.net.m@gmail.com (remove from hardcoded email list)
❌ alaa.hamdani@yahoo.com (remove from hardcoded email list)
❌ hamdanialaa@yahoo.com (remove from hardcoded email list)
```
→ Will be replaced with Firestore role-based access via custom claims

---

### 1.3 - Algolia Dashboard: Rotate Admin Key
**Timeline:** Complete within 5 minutes

**Exposed Key:**
```
❌ 47f0015ced4e86add8acc2e35ea01395 (Admin Write Key - CRITICAL)
```

**Steps:**
- [ ] Go to: https://www.algolia.com/apps
- [ ] Select your app
- [ ] Settings → API Keys
- [ ] Find and **Delete** the compromised Admin key: `47f0015ced4e86add8acc2e35ea01395`
- [ ] Click **Create API key**
  - Name: `ALGOLIA_ADMIN_KEY_NEW_202602`
  - ACLs: Select only necessary permissions (e.g., `addObject`, `deleteObject`, `editSettings`)
  - Valid until: Set expiration (90 days recommended)
- [ ] Copy new key to password manager
- [ ] Delete old key completely

---

### 1.4 - GitHub Account Security: Enable 2FA
**Timeline:** Complete within 5 minutes

**Account:** hamdanialaa3

**Steps:**
- [ ] Go to: https://github.com/settings/security
- [ ] Under "Two-factor authentication"
- [ ] Click **Enable two-factor authentication**
- [ ] Choose: **Authenticator app** (recommended) or **SMS**
- [ ] Save recovery codes in secure location (print or encrypted file)
- [ ] Verify 2FA is working by logging out and back in

**For any team members with access:**
- [ ] Request they enable 2FA on their accounts
- [ ] Consider GitHub org-wide enforcement if available

---

### 1.5 - Firebase Hosting: Pause Automatic Deployments
**Timeline:** Complete within 2 minutes

**Option A: Disable via Firebase CLI**
```bash
cd web/
firebase hosting:disable
```

**Option B: Manually via Console**
- [ ] Go to: https://console.firebase.google.com/project/fire-new-globul/hosting
- [ ] Click "Settings"
- [ ] Find "Deployment controls" or similar option
- [ ] Disable automatic deployments
- [ ] Note: Manual deployments still work, just won't auto-deploy from CI/CD

**Timeline for Re-enabling:** After completing Phase 2 & 3 (estimated 4-6 hours)

---

### 1.6 - Hardcoded Password: Immediate Revocation
**Timeline:** Complete within 5 minutes

**Location:** Code has plaintext password `885688`
- [ ] Change this password in all external systems immediately
- [ ] If this is a password for an admin account, change it NOW
- [ ] Check audit logs for any unauthorized access using old password
- [ ] Log out all sessions if possible

---

## ✅ CHECKLIST COMPLETION TARGET: WITHIN 30 MINUTES

Once all Phase 1 items are checked, proceed to Phase 2 (Automated Code Changes)

---

## 📋 PROGRESS TRACKER

| Phase | Task | Status | Started | Completed |
|-------|------|--------|---------|-----------|
| 1.1 | Google Cloud - Rotate 7 API Keys | ⏳ | | |
| 1.2 | Firebase - Review Service Accounts | ⏳ | | |
| 1.3 | Algolia - Rotate Admin Key | ⏳ | | |
| 1.4 | GitHub - Enable 2FA | ⏳ | | |
| 1.5 | Firebase Hosting - Pause Deployments | ⏳ | | |
| 1.6 | Change Hardcoded Password | ⏳ | | |

---

## ⚠️ CRITICAL REMINDER

**DO NOT:**
- ❌ Share new API keys in chat/slack
- ❌ Paste keys back into code files
- ❌ Upload keys to version control
- ❌ Send keys in emails

**DO:**
- ✅ Store keys in `.env.local` (git-ignored)
- ✅ Use environment variables in code
- ✅ Keep keys in secure password manager
- ✅ Use API key restrictions (Domain, IP, Service)
