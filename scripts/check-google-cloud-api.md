# Google Cloud API Check - Gemini API

## Issue
API key works in direct Node.js tests but fails in Cloud Functions with `API_KEY_INVALID` error.

## Verification Steps

### 1. Check if Generative Language API is Enabled

**Visit:** https://console.cloud.google.com/apis/library/generativelanguage.googleapis.com?project=fire-new-globul

**Expected:** Should show "API ENABLED" button (green)

**If not enabled:**
1. Click "ENABLE" button
2. Wait for activation (30-60 seconds)
3. Redeploy the function

---

### 2. Check API Key Restrictions

**Visit:** https://aistudio.google.com/apikey

**Check your API key:** `***REMOVED_GEMINI_KEY***`

**Expected Settings:**
- **Application restrictions:** None
- **API restrictions:** None OR "Generative Language API" allowed

**If restricted:**
1. Click "Edit" on your API key
2. Set "Application restrictions" to "None"
3. Set "API restrictions" to "Don't restrict key" OR add "Generative Language API"
4. Save changes
5. Wait 5 minutes for changes to propagate
6. Test the function again

---

### 3. Check Billing is Enabled

**Visit:** https://console.cloud.google.com/billing?project=fire-new-globul

**Expected:** Should show an active billing account

**If no billing:**
1. Set up billing account
2. Link to project
3. Enable billing

---

### 4. Check API Quotas

**Visit:** https://console.cloud.google.com/apis/api/generativelanguage.googleapis.com/quotas?project=fire-new-globul

**Expected:** Should show quotas with no errors

**Common Issues:**
- Requests per minute exceeded
- Requests per day exceeded
- Project quota issues

---

### 5. Alternative Solution - Use API Key in .env File

Instead of using `functions.config()`, try using environment variables:

```bash
# Create .env file in functions directory
cd "c:\Users\hamda\Desktop\New Globul Cars\functions"
echo "GOOGLE_GENERATIVE_AI_KEY=***REMOVED_GEMINI_KEY***" > .env

# Deploy again
cd ..
firebase deploy --only functions:geminiChat
```

**OR** use Firebase Environment Variables (new method):

```bash
firebase functions:secrets:set GOOGLE_GENERATIVE_AI_KEY
# Enter: ***REMOVED_GEMINI_KEY***
```

Then update `ai-functions.ts` to use `defineString()` from firebase-functions/params.

---

### 6. Check Cloud Function Service Account Permissions

**Visit:** https://console.cloud.google.com/iam-admin/iam?project=fire-new-globul

**Look for:** `fire-new-globul@appspot.gserviceaccount.com`

**Required Roles:**
- Cloud Functions Invoker
- (No special Gemini API roles needed - API key handles auth)

---

## Current Logs Show

```
[ai-functions] Using API key from functions.config()
[ai-functions] Key length: 39
[ai-functions] Key starts with: AIzaSyBJWv
[ai-functions] Key ends with: VRuKDYwvCU
[ai-functions] Has whitespace? false
[ai-functions] API key successfully loaded
```

✅ Key is loading correctly in Cloud Function
❌ But Google API still rejects it with API_KEY_INVALID

**This suggests:**
1. API key restrictions are blocking Cloud Function IP addresses
2. Generative Language API is not enabled for the project
3. API key was created for a different Google Cloud project

---

## Next Steps

**Option 1 - Enable API (Most Likely Fix):**
1. Go to https://console.cloud.google.com/apis/library/generativelanguage.googleapis.com?project=fire-new-globul
2. Click "ENABLE" if not already enabled
3. Wait 1 minute
4. Test the function

**Option 2 - Remove API Key Restrictions:**
1. Go to https://aistudio.google.com/apikey
2. Edit your API key
3. Set "Application restrictions" to "None"
4. Save and wait 5 minutes
5. Test the function

**Option 3 - Create New API Key:**
1. Go to https://aistudio.google.com/apikey
2. Create new API key for project `fire-new-globul`
3. Copy the new key
4. Set it: `firebase functions:config:set gemini.key="NEW_KEY"`
5. Deploy: `firebase deploy --only functions:geminiChat`

**Option 4 - Use Environment Variables (Recommended):**
Instead of deprecated `functions.config()`, migrate to modern params:
```typescript
import { defineString } from 'firebase-functions/params';
const apiKey = defineString('GOOGLE_GENERATIVE_AI_KEY');
```
