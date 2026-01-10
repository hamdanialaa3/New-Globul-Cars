# 🔧 Scripts Directory - GitHub Secrets Setup

## Quick Start

### Problem
GitHub Actions deployment fails with missing secrets error:
```
❌ FIREBASE_PROJECT_ID is missing!
❌ FIREBASE_SERVICE_ACCOUNT is missing!
```

### Solution (2 Simple Steps)

#### Step 1: Download Service Account
```powershell
.\scripts\download-service-account-helper.ps1
```
This will:
- Open Firebase Console automatically
- Guide you to download the Service Account JSON
- Save it as `firebase-service-account.json` in project root

#### Step 2: Upload Secrets to GitHub
```powershell
.\scripts\setup-github-secrets-automated.ps1
```
This will:
- Validate the Service Account JSON
- Extract Firebase Project ID from `.firebaserc`
- Upload both secrets to GitHub automatically
- Re-run the failed workflow

---

## Available Scripts

### 1. `download-service-account-helper.ps1`
**Purpose:** Opens Firebase Console to download Service Account

**Usage:**
```powershell
.\scripts\download-service-account-helper.ps1
```

**What it does:**
- Opens: https://console.firebase.google.com/project/fire-new-globul/settings/serviceaccounts/adminsdk
- Displays step-by-step instructions

---

### 2. `setup-github-secrets-automated.ps1`
**Purpose:** Automated GitHub Secrets configuration

**Prerequisites:**
- GitHub CLI installed (`gh --version`)
- GitHub CLI authenticated (`gh auth login`)
- `firebase-service-account.json` in project root

**Usage:**
```powershell
.\scripts\setup-github-secrets-automated.ps1
```

**What it does:**
1. ✅ Verifies GitHub CLI and authentication
2. ✅ Extracts `FIREBASE_PROJECT_ID` from `.firebaserc`
3. ✅ Validates `firebase-service-account.json` structure
4. ✅ Uploads `FIREBASE_PROJECT_ID` to GitHub Secrets
5. ✅ Uploads `FIREBASE_SERVICE_ACCOUNT` to GitHub Secrets
6. ✅ Verifies secrets were set correctly
7. ✅ Offers to re-run failed workflow

**Output:**
```
✅ FIREBASE_PROJECT_ID uploaded successfully
✅ FIREBASE_SERVICE_ACCOUNT uploaded successfully
✅ All required secrets are configured!
```

---

## Manual Alternative

If scripts don't work, use GitHub CLI commands:

```powershell
# Upload Project ID
echo "fire-new-globul" | gh secret set FIREBASE_PROJECT_ID

# Upload Service Account
Get-Content firebase-service-account.json -Raw | gh secret set FIREBASE_SERVICE_ACCOUNT

# Verify
gh secret list

# Re-run workflow
gh run rerun 20881979328
```

---

## Troubleshooting

### GitHub CLI not found
```powershell
# Install from: https://cli.github.com/
# Or with Chocolatey:
choco install gh

# Or with Scoop:
scoop install gh
```

### GitHub CLI not authenticated
```powershell
gh auth login
# Follow prompts to authenticate
```

### Service Account file not found
1. Check file location: `firebase-service-account.json` must be in project root
2. Check file name: must be exact (case-sensitive)
3. Re-download from Firebase Console if corrupted

### Invalid Service Account JSON
```powershell
# Validate JSON structure
Get-Content firebase-service-account.json | ConvertFrom-Json
```

Must contain:
- `type`: "service_account"
- `project_id`: "fire-new-globul"
- `private_key_id`
- `private_key`
- `client_email`

---

## Security Notes

⚠️ **CRITICAL:**
- `firebase-service-account.json` is in `.gitignore`
- Never commit this file to Git
- Never share its contents publicly
- Keep credentials secure

✅ **Safe to commit:**
- This README
- The PowerShell scripts (they don't contain secrets)
- `.firebaserc` (only contains project ID)

---

## Related Documentation

- [Complete Setup Guide (Arabic)](../docs/GITHUB_SECRETS_SETUP_AR.md)
- [Firebase Service Account Docs](https://firebase.google.com/docs/admin/setup)
- [GitHub Secrets Docs](https://docs.github.com/en/actions/security-guides/encrypted-secrets)

---

**Last Updated:** January 10, 2026  
**Status:** ✅ Production Ready
