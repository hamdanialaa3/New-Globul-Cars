# Firebase Storage CORS Fix
# حل مشكلة رفع الصور

**Problem:** CORS policy blocking image uploads  
**Project:** fire-new-globul  
**Date:** October 13, 2025

---

## The Problem

```
Access to XMLHttpRequest at 'https://firebasestorage.googleapis.com/...' 
from origin 'http://localhost:3000' has been blocked by CORS policy
```

**Cause:** New Firebase project needs Storage configuration

---

## Solution - 3 Steps

### Step 1: Enable Firebase Storage

1. Open Firebase Console:
   ```
   https://console.firebase.google.com/project/fire-new-globul/storage
   ```

2. If you see "Get Started" button:
   - Click "Get Started"
   - Choose location: **europe-west1** (closest to Bulgaria)
   - Click "Done"

3. Storage bucket will be created:
   ```
   fire-new-globul.firebasestorage.app
   ```

---

### Step 2: Configure CORS (Using gsutil)

**Option 1: Using Google Cloud Shell**

1. Open Google Cloud Console:
   ```
   https://console.cloud.google.com/storage/browser?project=fire-new-globul
   ```

2. Click "Activate Cloud Shell" (top right)

3. Run these commands:
   ```bash
   # Create cors.json file
   cat > cors.json << 'EOF'
   [
     {
       "origin": ["*"],
       "method": ["GET", "HEAD", "PUT", "POST", "DELETE"],
       "maxAgeSeconds": 3600,
       "responseHeader": ["Content-Type", "Authorization", "Content-Length", "User-Agent", "X-Requested-With"]
     }
   ]
   EOF
   
   # Apply CORS configuration
   gsutil cors set cors.json gs://fire-new-globul.firebasestorage.app
   ```

4. Verify:
   ```bash
   gsutil cors get gs://fire-new-globul.firebasestorage.app
   ```

---

**Option 2: Using Firebase CLI (Simpler)**

The CORS file is already created in your project root. Just run:

```bash
# Install gsutil if not installed
# Then apply CORS
gsutil cors set cors.json gs://fire-new-globul.firebasestorage.app
```

---

### Step 3: Deploy Storage Rules

```bash
firebase deploy --only storage:rules
```

This will deploy the storage.rules file that's already configured in your project.

---

## Quick Test

After configuring CORS:

1. Reload your website: http://localhost:3000
2. Go to Profile page
3. Try uploading profile picture
4. Should work without CORS error

---

## Alternative Fix (If gsutil not available)

### Use Firebase Console directly:

1. Firebase Console → Storage → Rules

2. Make sure rules allow authenticated uploads:
   ```
   rules_version = '2';
   service firebase.storage {
     match /b/{bucket}/o {
       match /users/{userId}/profile/{allPaths=**} {
         allow read: if true;
         allow write: if request.auth != null && 
                         request.auth.uid == userId &&
                         request.resource.contentType.matches('image/.*') &&
                         request.resource.size < 10 * 1024 * 1024;
       }
     }
   }
   ```

3. Publish rules

4. Wait 1-2 minutes

5. CORS should work automatically for authenticated users

---

## Verify Storage is Enabled

Check these in Firebase Console:

1. **Storage Tab:**
   - Should show bucket: fire-new-globul.firebasestorage.app
   - Should show "Files" section

2. **Authentication:**
   - Must be enabled
   - Users must be signed in to upload

3. **Storage Rules:**
   - Should be deployed (not default rules)

---

## Commands Summary

```bash
# 1. Deploy storage rules
firebase deploy --only storage:rules

# 2. Configure CORS (using Google Cloud Shell)
cat > cors.json << 'EOF'
[
  {
    "origin": ["*"],
    "method": ["GET", "HEAD", "PUT", "POST", "DELETE"],
    "maxAgeSeconds": 3600,
    "responseHeader": ["Content-Type", "Authorization"]
  }
]
EOF

gsutil cors set cors.json gs://fire-new-globul.firebasestorage.app

# 3. Verify
gsutil cors get gs://fire-new-globul.firebasestorage.app
```

---

## Expected Result

After fix:

- Profile image upload: Works
- Cover image upload: Works
- Car images upload: Works
- Gallery images upload: Works
- No CORS errors

---

**Status:** Fix ready to apply  
**Time needed:** 5 minutes  
**Difficulty:** Easy

