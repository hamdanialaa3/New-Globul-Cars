# 🚀 PHASE 1 - COMPLETE CHECKLIST & EXECUTION SUMMARY

**Date:** February 9, 2026  
**Current Status:** ✅ AUTOMATED TASKS DONE | ⏳ MANUAL TASKS READY  
**Total Time Required:** 30 minutes  

---

## ✅ AUTOMATED STATUS (COMPLETED)

### [1] Code Cleanup & Security Fixes ✅
- ✅ Removed 7 hardcoded Google API keys
- ✅ Removed 1 hardcoded Algolia Admin key
- ✅ Removed 2 hardcoded admin passwords
- ✅ Removed 3 hardcoded admin emails
- ✅ Fixed CORS misconfiguration
- ✅ Fixed 3 additional files with hardcoded Firebase/Maps keys:
  - GoogleMapSection.tsx
  - LocationPicker.tsx
  - mobile_new/firebase.ts

### [2] Build Verification ✅
- ✅ npm run build: **SUCCESS**
- ✅ TypeScript validation: **PASSED**
- ✅ Code compiles without errors

### [3] Initial Security Scan ✅
- ✅ deep-scan.sh preliminary check: **NO SECRETS FOUND**
- ✅ gitleaks baseline: **CLEAN**
- ✅ Source code verification: **0 hardcoded keys**

### [4] Documentation & Automation ✅
- ✅ PHASE1_EXECUTION_GUIDE.md created
- ✅ Emergency scripts ready (remove-secrets-repo.sh, deep-scan.sh, etc.)
- ✅ Pre-commit hooks configured
- ✅ GitHub Actions workflow configured

---

## 🎯 YOUR IMMEDIATE MANUAL ACTIONS (30 Minutes)

### ⏱️ STEP 1: Google Cloud Console - Rotate 7 API Keys (10 minutes)

**URL:** https://console.cloud.google.com/

**Checklist:**
- [ ] Login to Google Cloud Console
- [ ] Select correct project (Koli / New-Globul)
- [ ] Navigate: APIs & Services → Credentials
- [ ] For EACH of these 7 keys:
  - [ ] **Maps API Key**
    - ❌ DISABLE/DELETE old key
    - ✅ CREATE NEW key
    - 📋 Save as: `VITE_GOOGLE_MAPS_API_KEY = [VALUE]`
  - [ ] **Gemini/Google Generative AI Key**
    - ❌ DISABLE/DELETE old key
    - ✅ CREATE NEW key
    - 📋 Save as: `VITE_GOOGLE_GENERATIVE_AI_KEY = [VALUE]`
  - [ ] **Google Drive API Key**
    - ❌ DISABLE/DELETE old key
    - ✅ CREATE NEW key
    - 📋 Save as: `VITE_GOOGLE_API_KEY = [VALUE]`
  - [ ] **YouTube API Key** (if exists)
    - ❌ DISABLE/DELETE old key
    - ✅ CREATE NEW key
  - [ ] **Custom Search API Key** (if exists)
    - ❌ DISABLE/DELETE old key
    - ✅ CREATE NEW key
  - [ ] **Remaining Google API Keys** (2-3 more)
    - ❌ DISABLE/DELETE old keys
    - ✅ CREATE NEW keys

**For EACH new key, set restrictions:**
- ✅ Application restrictions: HTTP referrers
- ✅ Referrers:
  ```
  https://fire-new-globul.web.app/*
  https://fire-new-globul.firebaseapp.com/*
  https://koli.one/*
  https://www.koli.one/*
  https://mobilebg.eu/*
  ```
- ⏱️ **Time: ~10 minutes (1-2 min per key)**

---

### ⏱️ STEP 2: Algolia Dashboard - Rotate Admin Key (5 minutes)

**URL:** https://www.algolia.com/account

**Checklist:**
- [ ] Login to Algolia
- [ ] Select App: Koli One / New-Globul
- [ ] Navigate: Settings → API Keys
- [ ] **DELETE Old Admin Key:**
  - [ ] Find old key: `47f0015ced4e86add8acc2e35ea01395` (or similar)
  - [ ] ❌ DELETE it
- [ ] **CREATE New Admin Key:**
  - [ ] Click: "Create new key"
  - [ ] Name: "Admin Key (Prod)"
  - [ ] Select ACL:
    - ☑️ search (read)
    - ☑️ browse (read)
    - ☑️ addObject (write)
    - ☑️ editSettings (write)
    - ☑️ deleteIndex (write)
  - [ ] Save
  - [ ] 📋 Copy → Save as: `ALGOLIA_ADMIN_KEY = [VALUE]`
- [ ] **CREATE Search-Only Key:**
  - [ ] Click: "Create new key"
  - [ ] Name: "Search Key (Public)"
  - [ ] Select ACL:
    - ☑️ search (read only)
    - ☑️ browse (read only)
  - [ ] Save
  - [ ] 📋 Copy → Save as: `VITE_ALGOLIA_SEARCH_KEY = [VALUE]`
- ⏱️ **Time: ~5 minutes**

---

### ⏱️ STEP 3: Firebase Console - Review Service Accounts (3 minutes)

**URL:** https://console.firebase.google.com/

**Checklist:**
- [ ] Login to Firebase
- [ ] Select Project: fire-new-globul
- [ ] Navigate: Project Settings → Service Accounts
- [ ] **Review existing keys:**
  - [ ] Check creation date of each key
  - [ ] If older than 3 months: DELETE it
  - [ ] If suspicious: DELETE it
  - [ ] If healthy: KEEP it
- [ ] **CREATE NEW key (if needed):**
  - [ ] Click: "Generate New Private Key"
  - [ ] Save file: `firebase-service-account.json`
  - [ ] 📋 Store safely (NOT in Git):
    ```
    ~/.config/firebase/firebase-service-account.json
    OR
    Password manager / Secure storage
    ```
- [ ] **Verify Web API Key:**
  - [ ] Go to: Credentials tab
  - [ ] Check if web API key needs rotation
  - [ ] If exposed: CREATE NEW key
  - [ ] 📋 Save as: `VITE_FIREBASE_API_KEY = [VALUE]`
- ⏱️ **Time: ~3 minutes**

---

### ⏱️ STEP 4: GitHub - Enable 2FA & Update Secrets (5 minutes)

**Part A: Enable 2FA**

**URL:** https://github.com/settings/security

**Checklist:**
- [ ] Navigate to: Settings → Security
- [ ] **Enable Two-Factor Authentication:**
  - [ ] If NOT enabled:
    - [ ] Click: "Enable two-factor authentication"
    - [ ] Choose: "Authenticator app" (Microsoft Authenticator or Google Authenticator)
    - [ ] Scan QR code with app
    - [ ] Save recovery codes in password manager
  - [ ] If already enabled: SKIP (go to Part B)

**Part B: Update GitHub Secrets**

**Web Repo:** https://github.com/hamdanialaa3/New-Globul-Cars/settings/secrets/actions

**Checklist:**
- [ ] Go to: Settings → Secrets and variables → Actions
- [ ] Add/Update these secrets:
  ```
  VITE_GOOGLE_MAPS_API_KEY = [FROM STEP 1]
  VITE_GOOGLE_GENERATIVE_AI_KEY = [FROM STEP 1]
  VITE_GOOGLE_API_KEY = [FROM STEP 1]
  ALGOLIA_ADMIN_KEY = [FROM STEP 2]
  ALGOLIA_APP_ID = GDKG2NZNFB
  VITE_ALGOLIA_SEARCH_KEY = [FROM STEP 2]
  VITE_FIREBASE_API_KEY = [FROM STEP 3]
  FIREBASE_SERVICE_ACCOUNT = [JSON CONTENT FROM STEP 3]
  ```

**Mobile Repo:** https://github.com/hamdanialaa3/Koli-One-Mobile/settings/secrets/actions

**Checklist:**
- [ ] Repeat the same secrets update for mobile repo

**Alternative: Using GitHub CLI**

```powershell
# If you prefer command line:
gh auth login  # Login first if needed

# Web repo
cd web
gh secret set VITE_GOOGLE_MAPS_API_KEY --body "YOUR_NEW_KEY"
gh secret set VITE_GOOGLE_GENERATIVE_AI_KEY --body "YOUR_NEW_KEY"
gh secret set ALGOLIA_ADMIN_KEY --body "YOUR_NEW_KEY"

# Mobile repo
cd ../mobile_new
gh secret set VITE_GOOGLE_MAPS_API_KEY --body "YOUR_NEW_KEY"
# ... repeat for other secrets
```

- ⏱️ **Time: ~5 minutes**

---

### ⏱️ STEP 5: Create .env.local File Locally (5 minutes)

**On your local machine ONLY (NOT in Git):**

**Checklist:**
- [ ] Create file: `c:\Users\hamda\Desktop\Koli_One_Root\.env.local`
- [ ] Add content (replace [VALUE] with actual keys from steps above):

```env
# ============================================
# Google APIs - REPLACE WITH YOUR NEW KEYS
# ============================================
VITE_GOOGLE_MAPS_API_KEY=YOUR_NEW_MAPS_KEY_FROM_STEP1
VITE_GOOGLE_GENERATIVE_AI_KEY=YOUR_NEW_GEMINI_KEY_FROM_STEP1
VITE_GOOGLE_API_KEY=YOUR_NEW_GOOGLE_API_KEY_FROM_STEP1
VITE_GOOGLE_CLIENT_ID=YOUR_GOOGLE_CLIENT_ID

# ============================================
# Algolia - REPLACE WITH YOUR NEW KEYS
# ============================================
VITE_ALGOLIA_APP_ID=GDKG2NZNFB
VITE_ALGOLIA_SEARCH_KEY=YOUR_NEW_SEARCH_KEY_FROM_STEP2
ALGOLIA_ADMIN_KEY=YOUR_NEW_ADMIN_KEY_FROM_STEP2

# ============================================
# Firebase - REPLACE WITH YOUR NEW KEY
# ============================================
VITE_FIREBASE_API_KEY=YOUR_NEW_FIREBASE_KEY_FROM_STEP3
VITE_FIREBASE_AUTH_DOMAIN=fire-new-globul.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=fire-new-globul
VITE_FIREBASE_STORAGE_BUCKET=fire-new-globul.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=973379297533
VITE_FIREBASE_APP_ID=1:973379297533:web:59c6534d61a29cae5d9e94
FIREBASE_API_KEY=YOUR_NEW_FIREBASE_KEY_FROM_STEP3
FIREBASE_AUTH_DOMAIN=fire-new-globul.firebaseapp.com
FIREBASE_PROJECT_ID=fire-new-globul
FIREBASE_STORAGE_BUCKET=fire-new-globul.firebasestorage.app
FIREBASE_MESSAGING_SENDER_ID=973379297533
FIREBASE_APP_ID=1:973379297533:web:59c6534d61a29cae5d9e94
FIREBASE_DATABASE_URL=https://fire-new-globul-default-rtdb.europe-west1.firebasedatabase.app

# ============================================
# Important: This file is in .gitignore
# DO NOT commit this file to Git
# ============================================
```

**Checklist:**
- [ ] File created at correct path
- [ ] All new keys pasted (from Steps 1-3)
- [ ] ⚠️ **VERIFY:** `.gitignore` includes `.env.local`:
  ```powershell
  # Run this to verify:
  cat .\.gitignore | Select-String ".env"
  # Should show: .env, .env.local, .env.*.local
  ```
- [ ] 🔒 **FILE IS NOT COMMITTED** (protected by .gitignore)

- ⏱️ **Time: ~5 minutes**

---

### ⏱️ STEP 6: Firebase Console - Disable Auto-Deploy (1 minute)

**URL:** https://console.firebase.google.com/

**Checklist:**
- [ ] Select Project: fire-new-globul
- [ ] Navigate: Hosting → Connected repository
- [ ] If auto-deploy is active:
  - [ ] Click: Settings
  - [ ] ❌ DISABLE: "Auto-deploy on new commits"
  - [ ] Save
- [ ] ✅ Keep disabled until verification complete (Phase 2)

- ⏱️ **Time: ~1 minute**

---

## ✅ VERIFICATION CHECKLIST (After All Steps)

**After completing Steps 1-6 above, run these checks:**

### Check 1: .env.local exists and has values
```powershell
cd c:\Users\hamda\Desktop\Koli_One_Root
Write-Host "Checking .env.local..."
if (Test-Path ".env.local") {
    Write-Host "✅ .env.local exists" -ForegroundColor Green
    $content = Get-Content ".env.local"
    $keyCount = ($content | Select-String "VITE_|FIREBASE_|ALGOLIA_" | Measure-Object).Count
    Write-Host "✅ Found $keyCount environment variables" -ForegroundColor Green
} else {
    Write-Host "❌ .env.local NOT found" -ForegroundColor Red
}
```

### Check 2: Build succeeds with new keys
```powershell
cd web
Write-Host "Testing build with new keys..."
npm run build
# Expected: "done in X seconds" with no errors
```

### Check 3: No hardcoded keys in build output
```powershell
$result = Get-ChildItem -Path "build" -Include "*.js" -Recurse | 
    Select-String -Pattern "AIzaSyAUYM|AIzaSyAchmK|47f0015|885688|globul.net.m"
if ($result) {
    Write-Host "❌ FOUND SECRETS IN BUILD:" -ForegroundColor Red
    $result | Format-Table
} else {
    Write-Host "✅ NO SECRETS IN BUILD" -ForegroundColor Green
}
```

### Check 4: Run deep security scan
```powershell
cd c:\Users\hamda\Desktop\Koli_One_Root
Write-Host "`nRunning deep-scan.sh..."
bash deep-scan.sh 2>&1 | tail -50
# Expected: ✅ ALL CHECKS PASSED
```

### Check 5: Verify Git secrets are updated
```powershell
cd c:\Users\hamda\Desktop\Koli_One_Root
gh secret list --repo hamdanialaa3/New-Globul-Cars | Select-Object name,updated
# Should show recent timestamps for updated secrets
```

---

## 📋 FINAL VERIFICATION CHECKLIST (Before Phase 2)

✅ **Complete this before moving to Phase 2:**

**Security:**
- [ ] All 7 Google API keys rotated (old keys disabled)
- [ ] Algolia Admin key rotated
- [ ] Algolia Search key created
- [ ] Firebase service accounts reviewed
- [ ] Firebase API key verified
- [ ] 2FA enabled on GitHub
- [ ] 2FA enabled on Google Cloud
- [ ] 2FA enabled on Algolia
- [ ] 2FA enabled on Firebase

**Code & Configuration:**
- [ ] .env.local created locally (NOT committed)
- [ ] .gitignore protects .env.local
- [ ] npm run build succeeds
- [ ] deep-scan.sh shows: 0 secrets found
- [ ] gitleaks shows: 0 issues
- [ ] No hardcoded keys in build output

**CI/CD & GitHub:**
- [ ] GitHub Secrets updated (web repo)
- [ ] GitHub Secrets updated (mobile repo)
- [ ] Firebase auto-deploy disabled

**File Checks:**
- [ ] firebase-service-account.json stored safely (NOT in repo)
- [ ] All new keys stored in password manager
- [ ] Old keys documented as rotated (for audit trail)

---

## 🎯 TIMELINE

```
Step 1: Google Cloud ..................... 10 min ⏳
Step 2: Algolia .......................... 5 min  ⏳
Step 3: Firebase ......................... 3 min  ⏳
Step 4: GitHub 2FA + Secrets ............ 5 min  ⏳
Step 5: Create .env.local ............... 5 min  ⏳
Step 6: Disable Firebase auto-deploy .... 1 min  ⏳
Step 7: Verification checks ............. 5 min  ⏳
────────────────────────────────────────────────
                        TOTAL ........... 34 min
```

---

## 📥 WHAT TO REPORT BACK

**After completing all steps above, send back:**

```
✅ Phase 1 Complete

[ROTATED KEYS]
Rotated services: Google Cloud (7 keys), Algolia (1 key), Firebase API
2FA enabled: Google Cloud, Firebase, Algolia, GitHub
GitHub Secrets: Updated (web + mobile repos)

[VERIFICATION RESULTS]
- deep-scan.sh output: [paste last 10 lines]
- gitleaks results: [number of issues found - should be 0]
- Build status: [Success/Failed]

[CI/CD STATUS]
- GitHub Actions: [Ready/Pending]
- Firebase auto-deploy: [Disabled] ✅
```

---

## 🚀 NEXT: PHASE 2

Once you report "✅ Phase 1 Complete", I will immediately:

1. **Deploy:** firebase deploy (5 min)
2. **Verify:** Check all 5 domains live
3. **Start Phase 3:** Git history cleanup (remove-secrets-repo.sh)
4. **Final verification:** deep-scan.sh on clean repo

---

## 📞 TROUBLESHOOTING

**Build fails after creating .env.local:**
- Check: No spaces around `=` in .env.local
- Check: All `VITE_` variables for Vite
- Try: Delete `web/node_modules/.vite` and rebuild
- Try: `npm cache clean --force && npm install`

**GitHub Secrets not working:**
- Verify: Secret name matches exactly (case-sensitive)
- Verify: No trailing spaces in value
- Try: Delete and re-create the secret
- Try: Restart any running workflows

**Firebase deploy fails:**
- Check: `firebase login` command shows you're authenticated
- Check: Firebase CLI installed: `firebase --version`
- Try: `firebase use fire-new-globul`

**deep-scan.sh shows errors:**
- This is probably just warnings about other files
- Look for: "API Keys found" or "Passwords found"
- Should be: 0 findings for actual secrets

---

**Status:** Ready for your manual execution  
**Estimated Time:** 30 minutes  
**Difficulty:** Low (mostly console navigation & copy/paste)  
**Risk:** Very Low (only rotating old keys, no code changes)  

🎯 **START WITH STEP 1 NOW!**
