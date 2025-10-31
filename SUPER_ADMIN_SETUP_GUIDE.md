# Super Admin Setup Guide
## Complete Instructions for 100% Real Data Dashboard

### ✅ 1. Deploy Cloud Functions

Deploy the updated functions to make them live in `europe-west1`:

```bash
cd functions
npm run deploy
```

This deploys:
- `getSuperAdminAnalytics` - Main analytics callable (uses Admin SDK, bypasses Firestore rules)
- `setSuperAdminClaim` - One-time setup to add custom claims to owner
- `getAuthUsersCount`, `getActiveAuthUsers` - Auth user counters
- `syncAuthToFirestore` - Sync Firebase Auth to Firestore

**Expected output:** All functions deployed successfully to `europe-west1-fire-new-globul`

---

### ✅ 2. Create Owner Account in Firebase Auth

**Option A: Firebase Console (Recommended)**

1. Go to [Firebase Console](https://console.firebase.google.com/project/fire-new-globul/authentication/users)
2. Click "Add User"
3. Enter:
   - Email: `alaa.hamdani@yahoo.com`
   - Password: (your chosen password - remember this!)
4. Click "Add User"

**Option B: Command Line**

```bash
firebase auth:import users.json --project fire-new-globul
```

Where `users.json` contains:
```json
{
  "users": [{
    "localId": "unique-owner-uid",
    "email": "alaa.hamdani@yahoo.com",
    "emailVerified": true,
    "passwordHash": "...",
    "salt": "...",
    "createdAt": "1698672000000"
  }]
}
```

---

### ✅ 3. Set Custom Claims on Owner (One-Time Setup)

After owner account exists in Firebase Auth, set the `superAdmin` custom claim:

**Method 1: Using Cloud Function (Recommended)**

```javascript
// In browser console after signing in as owner:
const functions = firebase.functions();
const setClaim = functions.httpsCallable('setSuperAdminClaim');
setClaim({ email: 'alaa.hamdani@yahoo.com' })
  .then(result => console.log('✅ Claims set:', result.data))
  .catch(err => console.error('❌ Error:', err));
```

**Method 2: Using Firebase Admin SDK Script**

Create `set-owner-claim.js`:
```javascript
const admin = require('firebase-admin');
const serviceAccount = require('./serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

async function setOwnerClaim() {
  const email = 'alaa.hamdani@yahoo.com';
  const user = await admin.auth().getUserByEmail(email);
  
  await admin.auth().setCustomUserClaims(user.uid, {
    superAdmin: true,
    uniqueOwner: true,
    role: 'SUPER_ADMIN',
    permissions: ['all']
  });
  
  console.log('✅ Custom claims set successfully');
  process.exit(0);
}

setOwnerClaim().catch(console.error);
```

Run:
```bash
node set-owner-claim.js
```

**⚠️ Important:** After setting claims, the owner MUST sign out and sign in again for claims to take effect!

---

### ✅ 4. Test Super Admin Login

1. **Start the app:**
   ```bash
   cd bulgarian-car-marketplace
   npm start
   ```

2. **Navigate to Super Admin login:**
   ```
   http://localhost:3000/super-admin-login
   ```

3. **Enter credentials:**
   - Email: `alaa.hamdani@yahoo.com`
   - Password: (the password you set in step 2)

4. **Click "Access Super Admin Dashboard"**

**Expected Result:**
- ✅ "Owner authenticated. Redirecting to Super Admin dashboard…"
- Redirects to `/super-admin`
- Dashboard loads with REAL data (users, cars, messages, views, revenue)
- No permission errors in console
- All metrics show actual Firebase data

---

### ✅ 5. Verify Real Data is Loading

In the Super Admin dashboard, check:

1. **Console logs should show:**
   ```
   🔄 Loading real Firebase data...
   ✅ Real Firebase data loaded successfully
   ```

2. **Network tab should show:**
   - Callable function to `europe-west1-fire-new-globul.cloudfunctions.net/getSuperAdminAnalytics`
   - Status: 200 OK
   - Response contains real numbers

3. **No errors like:**
   - ❌ "Missing or insufficient permissions"
   - ❌ "CORS error"
   - ❌ "us-central1" references

---

### 🔧 Troubleshooting

#### Problem: "Firebase sign-in failed"
**Solution:** Ensure owner account exists in Firebase Auth with correct password

#### Problem: "Permission denied" when calling getSuperAdminAnalytics
**Solution:** 
1. Verify custom claims are set (check in Firebase Console under user's custom claims)
2. Sign out and sign in again after setting claims
3. Check function is deployed: `firebase functions:list`

#### Problem: "us-central1" CORS errors
**Solution:** 
1. Verify `firebase-config.ts` uses `getFunctions(app, 'europe-west1')`
2. Check no hardcoded us-central1 URLs in services
3. Clear browser cache and hard refresh (Ctrl+Shift+R)

#### Problem: Analytics shows 0 for all metrics
**Solution:**
1. Add test data to Firestore (cars, users collections)
2. Check Firestore rules allow owner to read
3. Verify owner is signed into Firebase Auth (check `auth.currentUser` in console)

---

### 📊 Custom Claim Structure

The owner's Firebase Auth token includes:
```json
{
  "superAdmin": true,
  "uniqueOwner": true,
  "role": "SUPER_ADMIN",
  "permissions": ["all"],
  "email": "alaa.hamdani@yahoo.com",
  "uid": "..."
}
```

All Cloud Functions now check `context.auth.token.superAdmin` instead of hardcoding email.

---

### 🧪 Running Tests

**Functions tests:**
```bash
cd functions
npm test
```

**Frontend tests:**
```bash
cd bulgarian-car-marketplace
npm test
```

**Specific test:**
```bash
npm test SuperAdminFlow.test.tsx
```

---

### 🚀 Production Deployment

1. **Deploy functions:**
   ```bash
   npm run deploy:functions
   ```

2. **Build and deploy frontend:**
   ```bash
   cd bulgarian-car-marketplace
   npm run build:optimized
   firebase deploy --only hosting
   ```

3. **Verify on production:**
   - Visit: `https://fire-new-globul.web.app/super-admin-login`
   - Sign in with owner credentials
   - Check dashboard shows real production data

---

### 🔒 Security Notes

- ✅ Custom claims provide better security than hardcoded emails
- ✅ All analytics computed server-side with Admin SDK (bypasses Firestore rules)
- ✅ Owner authentication required for all sensitive operations
- ✅ Functions region-locked to `europe-west1` (no CORS issues)
- ⚠️ Keep service account key secure (never commit to git)
- ⚠️ Owner password should be strong and rotated periodically

---

### 📝 Next Steps (Optional Hardening)

1. **Add IP whitelist** for Super Admin endpoints
2. **Enable 2FA** for owner Firebase Auth account
3. **Add audit logs** for all Super Admin actions
4. **Rate limiting** on sensitive callable functions
5. **Scheduled claim refresh** (expire claims after X hours)
