# 🚨 URGENT - IMMEDIATE EMERGENCY ACTIONS
**DO THESE NOW - February 9, 2026 - Timeline: 30 minutes**

---

## ⚡ CRITICAL: KEY ROTATION (Complete within 5 minutes each)

### ❌ 7× EXPOSED GOOGLE API KEYS - DISABLE NOW

**Exposed Keys:**
```
1. REDACTED_GEMINI_KEY_1 (Gemini - DUPLICATE 3x in code)
2. REDACTED_FIREBASE_KEY_1 (Firebase)
3. REDACTED_MAPS_KEY (Maps)
4. REDACTED_FIREBASE_KEY_2 (Firebase - DUPLICATE 3x)
5. REDACTED_GEMINI_AI_KEY (Gemini AI)
```

**STEP 1.1: Go to Google Cloud Console**

1. Open: https://console.cloud.google.com/
2. Login with hamdanialaa3@gmail.com
3. Select Project: `fire-new-globul` (if not already selected)
4. Go to: **APIs & Services** → **Credentials** (left sidebar)

**STEP 1.2: Delete Exposed Keys**

For each exposed key above:
```
1. Find the key in the credentials list
2. Click on it to open details
3. Click "DELETE" button at top
4. Confirm deletion
5. Wait for "Key deleted" notification
```

**STEP 1.3: Create NEW Replacement Keys**

Create new unrestricted keys (for now):

1. Click: **"+ CREATE CREDENTIALS"** → **"API Key"**
2. Set name: `Gemini API Key (Rotated Feb 9 2026)`
3. Under "Application restrictions":
   - Select: **"HTTP referrers"**
   - Add: `localhost:3000`, `localhost:5173`, `fire-new-globul.web.app`, `mobilebg.eu`, `koli.one`
4. Click "CREATE"
5. Copy the new key → **Save to .env.local immediately** (not in code!)

**Repeat for:**
- Gemini API Key
- Firebase API Key
- Maps API Key

**✅ Verification:**
```bash
curl "https://generativelanguage.googleapis.com/v1beta/models/?key=OLDEXPIREDKEY"
# Should return: 403 Forbidden (Key has been disabled)
```

---

### ❌ 1× EXPOSED ALGOLIA ADMIN KEY - ROTATE NOW

**Exposed Key:**
```
47f0015ced4e86add8acc2e35ea01395 (Admin Write Key)
```

**STEP 2.1: Go to Algolia Dashboard**

1. Open: https://dashboard.algolia.com/
2. Login with hamdanialaa3@gmail.com
3. Select App: **fire-new-globul** or your app name

**STEP 2.2: Find & Delete Exposed Admin Key**

1. Go to: **Settings** → **API Keys** (left sidebar)
2. Find key: `47f0015ced4e86add8acc2e35ea01395`
3. Click the **X** button next to it
4. Confirm deletion
5. Wait for "Key deleted" notification

**STEP 2.3: Create NEW Admin Key**

1. Click: **"Create a new API Key"** button
2. Set Name: `Admin Key (Rotated Feb 9 2026)`
3. Under "API Key Permissions":
   - ✅ Select: `addObject`
   - ✅ Select: `deleteObject`
   - ✅ Select: `editSettings`
   - ✅ Select: `deleteIndex`
4. Under "Valid until":
   - Set expiration: **90 days** (recommended)
5. Click "Create"
6. Copy the new key → **Save to .env.local immediately** (not in code!)

**✅ Verification:**
Old key should return 401/403 error when used

---

### ❌ 2× HARDCODED PASSWORDS - CHANGE NOW

**Exposed Password:**
```
885688 (plaintext in code)
```

**STEP 3.1: Change System Password**

If this password is used anywhere (e.g., admin account):
1. Change the password in all external systems immediately
2. Update in database if stored
3. Log out all sessions

**STEP 3.2: Set Admin Password Hash**

Generate bcrypt hash for NEW admin password:

```bash
node -e "const bcrypt=require('bcryptjs'); console.log(bcrypt.hashSync('NEW_SECURE_PASSWORD_HERE', 12));"
```

Output will be: `$2a$12$...` (long hash)

**STEP 3.3: Save to .env.local**

```env
VITE_ADMIN_PASSWORD=$2a$12$FULL_HASH_FROM_ABOVE
```

**NEVER** commit plain password paths!

---

### ❌ FIREBASE SERVICE ACCOUNT - REVIEW NOW

**STEP 4.1: Go to Firebase Console**

1. Open: https://console.firebase.google.com/
2. Select Project: `fire-new-globul`
3. Go to: **Project Settings** (gear icon) → **Service Accounts**

**STEP 4.2: Check for Exposed Keys**

1. Under "Admin SDK Configuration Snippet"
2. If there's an old key visible/used:
   - Click "Generate New Private Key"
   - Old key is automatically disabled
   - Download new key (JSON file)
   - Store securely (NOT in repo)

**STEP 4.3: Update Firebase Config**

In code, use environment variable:
```typescript
// firebase-config.ts
export const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  // ... rest from env vars
};
```

---

## 🛑 STOP AUTOMATIC DEPLOYMENTS

### STEP 5: Disable Firebase Auto-Deploy

**Option A: Via Firebase CLI**
```bash
cd web/
firebase hosting:disable
# Output: "Hosting for project fire-new-globul has been disabled"
```

**Option B: Via Firebase Console**

1. Go to: https://console.firebase.google.com/project/fire-new-globul/hosting
2. Click: **Settings** tab
3. Find: "Deployment Controls" or "Auto-Deploy"
4. Click: **Disable** button
5. Confirm

**Why:** Prevent automatic deployment of old code with exposed keys

---

## 🔐 GITHUB ACCOUNT SECURITY

### STEP 6: Enable 2FA on GitHub

**STEP 6.1: GitHub Account Settings**

1. Go to: https://github.com/settings/security
2. Under "Two-factor authentication"
3. Click: **"Enable two-factor authentication"** OR **"Manage"** if already started

**STEP 6.2: Choose 2FA Method**

**Option 1: Authenticator App (Recommended)**
- Download Authenticator app: Microsoft Authenticator, Google Authenticator, or Authy
- Scan QR code
- Enter 6-digit code to confirm
- Save "recovery codes" in secure location
- Never share recovery codes!

**Option 2: SMS (Less Secure)**
- Enter phone number
- Receive SMS with code
- Less secure than apps

**STEP 6.3: Verify 2FA Works**

1. Log out of GitHub
2. Log back in
3. When prompted, enter code from authenticator app
4. Confirm 2FA is working

**Recovery Codes:**
- You'll get ~10 backup codes
- Print them or save to password manager
- Use if you lose access to authenticator app

---

## 🗂️ UPDATE .env.local (Locally on Your Machine)

### STEP 7: Create .env.local with NEW Keys

**STEP 7.1: Copy Template**
```bash
cd web/
cp .env.example .env.local
```

**STEP 7.2: Fill in NEW Values**

Replace all `REPLACE_ME_*` with NEW keys you just created:

```env
# Google APIs (NEW KEYS)
VITE_GOOGLE_GEMINI_API_KEY=<NEW_KEY_FROM_STEP_1.3>
VITE_GOOGLE_MAPS_API_KEY=<NEW_KEY_FROM_STEP_1.3>
VITE_GOOGLE_BROWSER_KEY=<NEW_KEY_FROM_STEP_1.3>

# Firebase (NEW KEYS)
VITE_FIREBASE_API_KEY=<NEW_KEY_FROM_STEP_1.3>
VITE_FIREBASE_AUTH_DOMAIN=fire-new-globul.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=fire-new-globul
# ... rest of Firebase config

# Algolia (NEW KEY)
ALGOLIA_APP_ID=RTGDK12KTJ (or whatever you have)
ALGOLIA_ADMIN_KEY=<NEW_KEY_FROM_STEP_2.3>

# Admin (NEW HASH)
VITE_ADMIN_PASSWORD=<BCRYPT_HASH_FROM_STEP_3.2>
```

**✅ CRITICAL:**
- ✅ `.env.local` is in `.gitignore` (already configured)
- ✅ Never commit `.env.local`
- ✅ Keep only on your local machine
- ✅ Share keys with team via secure channel (password manager, 1Password, LastPass)

---

## ✅ VERIFICATION CHECKLIST (5 minutes)

After completing all steps above:

```bash
# 1. Verify .env.local exists
[ -f web/.env.local ] && echo "✓ .env.local exists" || echo "✗ Missing"

# 2. Verify code builds with new env vars
cd web/
npm run build 2>&1 | grep -i "error\|fail" || echo "✓ Build successful"

# 3. Verify no hardcoded keys remaining
git grep -i "AIzaSy\|47f00\|885688" -- web/src/ 2>/dev/null | grep -v ".env.example" \
  || echo "✓ No hardcoded secrets found"

# 4. Verify .gitignore protection
grep -E "\.env\.local|google-services\.json" web/.gitignore && echo "✓ .gitignore protected"

# 5. GitHub 2FA status
echo "Verify: Settings → Security → 2FA enabled?"
```

---

## 📋 TIMELINE

| Step | Action | Time | Status |
|------|--------|------|--------|
| 1 | Rotate 7 Google API keys | 5 min | ⏳ |
| 2 | Rotate Algolia key | 5 min | ⏳ |
| 3 | Change passwords | 2 min | ⏳ |
| 4 | Review Firebase service accounts | 3 min | ⏳ |
| 5 | Disable auto-deployments | 1 min | ⏳ |
| 6 | Enable GitHub 2FA | 5 min | ⏳ |
| 7 | Create .env.local | 5 min | ⏳ |
| **TOTAL** | | **26 min** | |

---

## 🎯 Success Criteria

When complete:
```
✅ All old API keys deleted from Google Cloud
✅ All old Algolia keys deleted
✅ 2FA enabled on GitHub account
✅ Firebase auto-deploy disabled
✅ .env.local created with NEW keys
✅ Code builds successfully
✅ No hardcoded secrets in git
✅ .gitignore protects .env.local
```

---

## 🚨 AFTER PHASE 1 COMPLETE

### Phase 2: Code Deployment
- Run: `cd web && npm run build && firebase deploy`
- Verify: All 5 domains still responding
- Check: No errors in Firebase console

### Phase 3: Git History Cleanup (Within 24 hours)
- Run: `bash remove-secrets-repo.sh git@github.com:hamdanialaa3/New-Globul-Cars.git`
- Force-push cleaned repo
- All developers force-pull new history

### Phase 4: Verify Everything
- Run: `bash deep-scan.sh`
- Should show: ✅ ALL CHECKS PASSED

---

## ⚠️ DO NOT

- ❌ Commit `.env.local` to Git
- ❌ Share API keys in Slack/email
- ❌ Use old rotated keys anywhere
- ❌ Disable GitHub 2FA until team alerts you
- ❌ Deploy code without new keys in .env.local

---

## ✅ DO

- ✅ Rotate keys FIRST before any code changes
- ✅ Store new keys in `.env.local` only
- ✅ Enable 2FA on GitHub NOW
- ✅ Disable auto-deployments while fixing
- ✅ Test with `.env.local` locally before deployment

---

**TOTAL COMPLETION TIME: ~30 minutes**

**Next: Run Phase 2 after this is complete**

```bash
# After Phase 1 complete:
cd web/
npm run build
firebase deploy
```

**Report back when all steps are complete! ✅**
