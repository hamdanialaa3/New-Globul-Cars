# 🚀 PHASE 1 - IMMEDIATE EXECUTION GUIDE

**Status:** ✅ Code fixes complete | ⏳ Manual console actions required  
**Timeline:** 30 minutes  
**Last Updated:** February 9, 2026  

---

## ✅ COMPLETED AUTOMATED ACTIONS

### [1] Fixed Remaining Hardcoded Keys
- ✅ GoogleMapSection.tsx - Removed 'AIzaSyAUYM_qygK5pUrlXtdDLmEi-_Kh9SyvRmk' fallback
- ✅ LocationPicker.tsx - Removed 'AIzaSyAUYM_qygK5pUrlXtdDLmEi-_Kh9SyvRmk' fallback
- ✅ mobile_new/firebase.ts - Moved from hardcoded to env-based validation
- ✅ Build verification passed (npm run build successful)
- ✅ Security scan: 0 hardcoded keys remaining

---

## 🎯 YOUR IMMEDIATE ACTIONS (30 Minutes)

### STEP 1: Google Cloud Console - Rotate 7 API Keys (10 minutes)

**Go to:** https://console.cloud.google.com/

1. **Select Project:** "Koli" or "New-Globul" 
2. **Navigate to:** APIs & Services → Credentials
3. **For EACH of these 7 keys, do this:**

#### Key #1: Maps API Key
- Find: (Test/Old Maps key)
- ❌ DELETE or DISABLE it
- ✅ CREATE NEW: Manage → Create Credentials → API Key
- **Restrict to:**
  - Application restrictions: HTTP referrers
  - Referrers:
    ```
    https://fire-new-globul.web.app/*
    https://fire-new-globul.firebaseapp.com/*
    https://koli.one/*
    https://mobilebg.eu/*
    ```
- 📋 **Copy new key → Save in Notes as:** `VITE_GOOGLE_MAPS_API_KEY = [PASTE HERE]`

#### Key #2: Gemini (Google Generative AI) Key
- Find: Old Generative AI key
- ❌ DELETE or DISABLE it  
- ✅ CREATE NEW: Same process as above
- **Restrict to:** Same HTTP referrers + Add API: "Generative Language API"
- 📋 **Copy new key → Save as:** `VITE_GOOGLE_GENERATIVE_AI_KEY = [PASTE HERE]`

#### Key #3-7: Other Google APIs
- Repeat the same process for:
  - Google Drive API key
  - YouTube API key
  - Custom Search API key
  - Any other active keys
- 📋 **Save each with its environment variable name**

---

### STEP 2: Algolia Dashboard - Rotate Admin Key (5 minutes)

**Go to:** https://www.algolia.com/account

1. **Select App:** Koli One / New-Globul
2. **Navigate to:** Settings → API Keys
3. **Find Old Admin Key:** `47f0015ced4e86add8acc2e35ea01395` (or similar)
4. ❌ **DELETE it** (or just revoke)
5. ✅ **CREATE NEW Admin Key:**
   - Click: "Create new key"
   - Name: "Admin Key (Prod)"
   - Select ACL:
     - ☑️ search (read)
     - ☑️ browse (read)
     - ☑️ addObject (write)
     - ☑️ editSettings (write)
     - ☑️ deleteIndex (write)
   - Save
6. 📋 **Copy new key → Save as:** `ALGOLIA_ADMIN_KEY = [PASTE HERE]`

**Also Create:**
- ✅ **Search-Only Key** for client-side (public):
  - ACL: just `search` + `browse` (read-only)
  - 📋 **Save as:** `VITE_ALGOLIA_SEARCH_KEY = [PASTE HERE]`

---

### STEP 3: Firebase Console - Review Service Accounts (3 minutes)

**Go to:** https://console.firebase.google.com/

1. **Select Project:** fire-new-globul
2. **Navigate to:** Project Settings → Service Accounts
3. **Check existing service account keys:**
   - If any key is older than 3 months: DELETE and create new
   - If any looks suspicious: DELETE it
4. **CREATE NEW key if needed:**
   - Click: "Generate New Private Key"
   - Save file as: `firebase-service-account.json`
   - ⚠️ **CRITICAL: DO NOT upload to Git!**
   - Keep locally in: `~/.config/firebase/` or password manager
5. 📋 **Store this JSON safely - needed for CI/CD later**

---

### STEP 4: GitHub - Enable 2FA & Update Secrets (5 minutes)

**Go to:** https://github.com/settings/security

1. **Enable Two-Factor Authentication:**
   - If not already enabled:
     - Click: "Enable two-factor authentication"
     - Choose: "Authenticator app" (recommended)
     - Download: Microsoft Authenticator or Google Authenticator
     - Scan QR code, save recovery codes
   - 📋 **Save recovery codes in password manager**

2. **Update GitHub Secrets:**
   - Go to: https://github.com/hamdanialaa3/New-Globul-Cars/settings/secrets/actions
   - Click: "New repository secret"
   - Add these secrets (one by one):
     ```
     VITE_GOOGLE_MAPS_API_KEY = [VALUE FROM STEP 1]
     VITE_GOOGLE_GENERATIVE_AI_KEY = [VALUE FROM STEP 2]
     ALGOLIA_ADMIN_KEY = [VALUE FROM STEP 2]
     FIREBASE_SERVICE_ACCOUNT = [JSON CONTENT FROM STEP 3]
     ```

3. **Repeat for mobile repo:** hamdanialaa3/Koli-One-Mobile

---

### STEP 5: Create .env.local File Locally (5 minutes)

**On your local machine:**

1. **Create file:** `c:\Users\hamda\Desktop\Koli_One_Root\.env.local`

2. **Add all new keys:**
   ```
   # Google APIs
   VITE_GOOGLE_MAPS_API_KEY=YOUR_NEW_MAPS_KEY
   VITE_GOOGLE_GENERATIVE_AI_KEY=YOUR_NEW_GEMINI_KEY
   VITE_GOOGLE_API_KEY=YOUR_NEW_GOOGLE_API_KEY
   VITE_GOOGLE_CLIENT_ID=YOUR_GOOGLE_CLIENT_ID
   
   # Algolia
   VITE_ALGOLIA_APP_ID=GDKG2NZNFB
   VITE_ALGOLIA_SEARCH_KEY=YOUR_NEW_SEARCH_ONLY_KEY
   ALGOLIA_ADMIN_KEY=YOUR_NEW_ADMIN_KEY
   
   # Firebase
   VITE_FIREBASE_API_KEY=YOUR_FIREBASE_API_KEY
   VITE_FIREBASE_AUTH_DOMAIN=fire-new-globul.firebaseapp.com
   VITE_FIREBASE_PROJECT_ID=fire-new-globul
   VITE_FIREBASE_STORAGE_BUCKET=fire-new-globul.firebasestorage.app
   VITE_FIREBASE_MESSAGING_SENDER_ID=973379297533
   VITE_FIREBASE_APP_ID=1:973379297533:web:59c6534d61a29cae5d9e94
   ```

3. **⚠️ CRITICAL:** 
   - ❌ DO NOT commit this file
   - ✅ It's protected by `.gitignore`
   - ✅ Each developer needs their own `.env.local`

---

### STEP 6: Disable Firebase Auto-Deployments (1 minute)

**Go to:** https://console.firebase.google.com/

1. **Select Project:** fire-new-globul
2. **Navigate to:** Hosting → Deployments
3. **Check:** If there's an active automatic deployment (GitHub integration):
   - Click: Settings
   - Disable: "Auto-deploy on new commits" (temporarily)
4. ✅ **Keep disabled until verification complete**

---

## ✅ VERIFICATION CHECKLIST (After All Steps)

Run these commands from your local machine:

```powershell
# 1. Verify .env.local exists and has correct values
Write-Host "Checking .env.local..."
cat .\.env.local | Select-String "VITE_GOOGLE|ALGOLIA|FIREBASE"

# 2. Test build with new keys
cd web
npm run build

# 3. Verify no hardcoded keys in final build
# Scan build output for secrets
Get-ChildItem -Path "web/build" -Include "*.js" -Recurse | Select-String -Pattern "AIzaSyAUYM|AIzaSyAchmK|47f0015"

# 4. If all green, ready to deploy!
```

---

## 📋 CURRENT STATUS

| Action | Status | ETA |
|--------|--------|-----|
| Fix hardcoded keys in code | ✅ DONE | - |
| Rotate Google API keys | ⏳ TODO | 10 min |
| Rotate Algolia keys | ⏳ TODO | 5 min |
| Review Firebase service account | ⏳ TODO | 3 min |
| Enable GitHub 2FA | ⏳ TODO | 5 min |
| Create .env.local | ⏳ TODO | 5 min |
| Disable Firebase auto-deploy | ⏳ TODO | 1 min |
| **Total Phase 1** | **⏳ IN PROGRESS** | **~30 min** |

---

## 🚀 NEXT STEPS (After Phase 1 Complete)

1. ✅ **Phase 1:** Complete steps above (30 min)
2. **Phase 2:** Deploy to Firebase (5 min)
   ```powershell
   cd web
   firebase deploy
   ```
3. **Phase 3:** Clean Git history (30 min, within 24 hours)
   ```powershell
   bash remove-secrets-repo.sh git@github.com:hamdanialaa3/New-Globul-Cars.git
   ```
4. **Phase 4:** Final verification (5 min)

---

## 📞 NEED HELP?

**If build fails after adding .env.local:**
- Check: `VITE_` prefix on all variables (required for Vite)
- Check: No spaces around `=` in `.env.local`
- Try: Delete `web/node_modules/.vite` and rebuild

**If deployment fails:**
- Check: All required env vars in `.env.local`
- Check: Firebase CLI logged in: `firebase login`
- Try: `firebase deploy --debug`

**If keys are still exposed:**
- Re-run: `cd c:\Users\hamda\Desktop\Koli_One_Root && bash deep-scan.sh`
- Contact: Your security team

---

## 📊 SUCCESS INDICATORS

✅ Phase 1 Complete when:
- All 7 Google keys rotated
- Algolia key rotated
- GitHub 2FA enabled
- .env.local created with new keys
- Build succeeds: `npm run build`
- `deep-scan.sh` shows: ✅ ALL CHECKS PASSED
- No hardcoded keys found in build output

---

**Status:** READY FOR YOUR MANUAL ACTIONS  
**Estimated Time:** 30 minutes  
**Difficulty:** Easy (mostly copy/paste)  
**Risk:** Very Low (only disabling old keys, no code changes)  

🎯 **START WITH STEP 1 NOW!**
