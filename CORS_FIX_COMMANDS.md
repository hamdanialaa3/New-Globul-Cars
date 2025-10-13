# Fix Firebase Storage CORS
# حل مشكلة CORS لرفع الصور

**Problem:** CORS blocking image uploads from localhost:3000

---

## Quick Fix - Google Cloud Shell

### Step 1: Open Cloud Shell

Go to:
```
https://console.cloud.google.com/storage/browser?project=fire-new-globul
```

Click "Activate Cloud Shell" (icon in top right)

---

### Step 2: Run these commands

Copy and paste these commands in Cloud Shell:

```bash
# Create CORS config
cat > cors.json << 'EOF'
[
  {
    "origin": ["*"],
    "method": ["GET", "HEAD", "PUT", "POST", "DELETE"],
    "maxAgeSeconds": 3600,
    "responseHeader": ["Content-Type", "Authorization", "Content-Length", "User-Agent", "X-Requested-With", "x-goog-resumable"]
  }
]
EOF

# Apply CORS
gsutil cors set cors.json gs://fire-new-globul.firebasestorage.app

# Verify
gsutil cors get gs://fire-new-globul.firebasestorage.app
```

---

### Step 3: Deploy Storage Rules

Back in your terminal:

```bash
firebase deploy --only storage:rules
```

---

### Step 4: Test

1. Reload website (F5)
2. Try uploading image
3. Should work!

---

## Alternative - If Cloud Shell doesn't work

### Add localhost to authorized domains:

1. Firebase Console → Storage → Rules

2. Update rules to explicitly allow localhost:
   
```
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /users/{userId}/{allPaths=**} {
      allow read: if true;
      allow write: if request.auth != null && 
                      request.auth.uid == userId &&
                      request.resource.size < 10 * 1024 * 1024;
    }
  }
}
```

3. Publish rules

4. Wait 1 minute

5. Test again

---

**Status:** Commands ready to run

