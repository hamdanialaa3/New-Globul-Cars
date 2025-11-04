# Fix Firebase Storage CORS Issue

**Issue:** Images from Firebase Storage blocked by CORS policy

**Solution:** Configure CORS for Firebase Storage bucket

---

## Method 1: Using gsutil (Recommended)

### Prerequisites:
1. Install Google Cloud SDK
2. Authenticate with Firebase

### Steps:

```bash
# 1. Install Google Cloud SDK (if not installed)
# Download from: https://cloud.google.com/sdk/docs/install

# 2. Initialize gcloud
gcloud init

# 3. Authenticate
gcloud auth login

# 4. Set your Firebase project
gcloud config set project fire-new-globul

# 5. Apply CORS configuration
gsutil cors set cors.json gs://fire-new-globul.firebasestorage.app
```

---

## Method 2: Using Firebase Console (Easier)

### Steps:

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project: **fire-new-globul**
3. Go to **Storage** in left menu
4. Click on **Rules** tab
5. Add these rules:

```
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /{allPaths=**} {
      allow read: if true;  // Public read access
      allow write: if request.auth != null;  // Authenticated write
    }
  }
}
```

6. Click **Publish**

---

## Method 3: Using Firebase CLI

```bash
# 1. Install Firebase CLI (if not installed)
npm install -g firebase-tools

# 2. Login
firebase login

# 3. Update storage.rules file (already in project)

# 4. Deploy storage rules
firebase deploy --only storage
```

---

## Verify CORS is Working

After applying CORS configuration:

1. Clear browser cache
2. Reload the app
3. Check console - CORS errors should be gone
4. Images should load properly

---

## Quick Test:

```javascript
// Test image loading
fetch('https://firebasestorage.googleapis.com/v0/b/fire-new-globul.firebasestorage.app/o/cars%2FnJR2oW2IlsIXqC19k7Ce%2Fimages%2F1760562318164_0_car_image_1.jpg?alt=media&token=36fdef3f-5d46-4731-b4c5-5499a6823bbb')
  .then(res => console.log('CORS working:', res.status))
  .catch(err => console.error('CORS error:', err));
```

---

## Alternative: Use Firebase Storage SDK (Already Implemented)

If CORS continues to be an issue, ensure you're using Firebase Storage SDK methods:

```typescript
import { getDownloadURL, ref } from 'firebase/storage';
import { storage } from './firebase';

// Instead of direct URLs, use:
const imageRef = ref(storage, imagePath);
const url = await getDownloadURL(imageRef);
```

This bypasses CORS issues because it uses Firebase SDK authentication.

---

**Status:** CORS configuration file created (cors.json)  
**Action Required:** Apply using one of the methods above

