# 🔐 GitHub Secrets Setup Guide
**Project**: New-Globul-Cars  
**Owner**: hamdanialaa3  
**Firebase Project**: fire-new-globul

> **ملاحظة:** هذا الدليل يغطي إعداد GitHub Secrets. للحالة الحالية، انظر `docs/GITHUB_SECRETS_SETUP_COMPLETE.md`

---

## ✅ الحالة الحالية

تم إصلاح مشكلة المصادقة في GitHub Actions. Workflow يعمل الآن بشكل صحيح باستخدام `google-github-actions/auth@v2`.

---

## ✅ Quick Fix (Step-by-Step)

### 1. Go to Repository Settings

Navigate to:
```
https://github.com/hamdanialaa3/New-Globul-Cars/settings/secrets/actions
```

Or manually:
1. Go to your repository: https://github.com/hamdanialaa3/New-Globul-Cars
2. Click **Settings** (top right)
3. In left sidebar: **Secrets and variables** → **Actions**

---

### 2. Add Required Secret

Click **"New repository secret"** and add:

#### Secret #1: FIREBASE_PROJECT_ID
```
Name: FIREBASE_PROJECT_ID
Value: fire-new-globul
```

**✅ Copy this exactly:** `fire-new-globul`

---

### 3. Verify Existing Secret

Make sure this secret already exists (check the list):

#### Secret #2: FIREBASE_SERVICE_ACCOUNT
```
Name: FIREBASE_SERVICE_ACCOUNT
Value: <Your Firebase Service Account JSON>
```

**How to get this:**
1. Go to [Firebase Console](https://console.firebase.google.com/project/fire-new-globul/settings/serviceaccounts/adminsdk)
2. Click **Generate new private key**
3. Save the JSON file
4. Copy the **entire JSON content** as the secret value

**Example format:**
```json
{
  "type": "service_account",
  "project_id": "fire-new-globul",
  "private_key_id": "abc123...",
  "private_key": "-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n",
  "client_email": "firebase-adminsdk-xxxxx@fire-new-globul.iam.gserviceaccount.com",
  "client_id": "123456789...",
  "auth_uri": "https://accounts.google.com/o/oauth2/auth",
  "token_uri": "https://oauth2.googleapis.com/token",
  "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
  "client_x509_cert_url": "https://www.googleapis.com/robot/v1/metadata/x509/..."
}
```

---

### 4. Re-run Failed Workflow

After adding the secrets:

1. Go to **Actions** tab
2. Find the failed workflow run
3. Click **"Re-run failed jobs"**

Or push a new commit to trigger deployment:
```bash
git commit --allow-empty -m "chore: trigger workflow with secrets"
git push origin main
```

---

## 📋 Complete Secrets Checklist

| Secret Name | Required? | Source | Status |
|-------------|-----------|--------|--------|
| `FIREBASE_PROJECT_ID` | ✅ Yes | `.firebaserc` file | ❌ **MISSING** |
| `FIREBASE_SERVICE_ACCOUNT` | ✅ Yes | Firebase Console | ❓ Check if exists |

---

## 🔍 How to Verify Secrets Are Working

After adding secrets, check the workflow logs for:

```
✅ Critical secrets present.
🚀 Starting Firebase deployment...
📦 Project: fire-new-globul
🌍 Region: europe-west1
```

Instead of:
```
❌ FIREBASE_PROJECT_ID is missing!
```

---

## 🛠️ Alternative: Use .firebaserc (Not Recommended for CI/CD)

If you don't want to use secrets, you can hardcode the project ID in the workflow:

**In `.github/workflows/firebase-deploy.yml`:**

Replace:
```yaml
project_id: ${{ secrets.FIREBASE_PROJECT_ID }}
```

With:
```yaml
project_id: fire-new-globul
```

**⚠️ Warning:** This is less secure and not recommended for production deployments. Always use secrets for sensitive data.

---

## 🚀 Expected Workflow After Fix

```bash
# Pre-flight Secrets Check
✅ Critical secrets present.

# Build
✅ Build completed successfully

# Authenticate Google Cloud
✅ Authenticated with service account

# Deploy to Firebase
🚀 Starting Firebase deployment...
📦 Project: fire-new-globul
🌍 Region: europe-west1

✅ Deployment Successful!
🌐 Hosting: https://fire-new-globul.web.app
🌐 Custom Domain: https://koli.one
```

---

## 📚 Related Files

1. **Workflow File**: `.github/workflows/firebase-deploy.yml`
2. **Firebase Config**: `.firebaserc` (contains project ID)
3. **Firebase JSON**: `firebase.json` (deployment config)

---

## 🔗 Useful Links

- **Repository Secrets**: https://github.com/hamdanialaa3/New-Globul-Cars/settings/secrets/actions
- **Firebase Console**: https://console.firebase.google.com/project/fire-new-globul
- **Service Accounts**: https://console.firebase.google.com/project/fire-new-globul/settings/serviceaccounts/adminsdk
- **GitHub Actions Docs**: https://docs.github.com/en/actions/security-guides/encrypted-secrets

---

## ✅ Final Checklist

- [ ] Add `FIREBASE_PROJECT_ID` secret (value: `fire-new-globul`)
- [ ] Verify `FIREBASE_SERVICE_ACCOUNT` secret exists
- [ ] Test: Re-run failed workflow
- [ ] Confirm: Check for ✅ in workflow logs
- [ ] Monitor: Ensure deployment completes successfully

---

**Status**: 🔴 **ACTION REQUIRED** - Add secrets to proceed with deployments

**Last Updated**: January 10, 2026
