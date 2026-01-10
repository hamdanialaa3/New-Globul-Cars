# GitHub Actions Workflows

This directory contains automated workflows for CI/CD.

## 📋 Active Workflows

### ✅ `firebase-deploy.yml` - Main Firebase Deployment (ACTIVE)

**Status:** ✅ Active and recommended

**Trigger:**
- Push to `main` branch
- Manual dispatch (workflow_dispatch)

**What it does:**
1. ✅ Validates required secrets
2. 🔨 Builds React app (`npm run build`)
3. 📦 Installs Cloud Functions dependencies
4. 🚀 Deploys to Firebase Hosting
5. ⚡ Deploys Firebase Cloud Functions

**Required Secrets:**
- `FIREBASE_SERVICE_ACCOUNT` - Service account JSON from Google Cloud

**Note:** `FIREBASE_PROJECT_ID` is automatically extracted from `.firebaserc` - no secret needed!

**Features:**
- Pre-flight secret validation with helpful error messages
- Detailed deployment logs with debug mode
- Success summary with deployment URLs
- Error handling with troubleshooting tips

---

## 🚫 Deprecated Workflows

### ❌ `deploy.yml` - OLD Firebase Deployment (DEPRECATED)

**Status:** ⚠️ Disabled - Uses old action with authentication issues

This workflow used `FirebaseExtended/action-hosting-deploy@v0` which had:
- Authentication/permission problems
- Limited error messages
- Less flexibility

**Replaced by:** `firebase-deploy.yml` (uses Firebase CLI directly)

---

### ❌ `ci.yml` - Docker Build (OPTIONAL)

**Status:** ⚠️ Disabled - Optional Docker workflow

This builds and pushes to Docker Hub. It's separate from Firebase deployment and currently disabled to avoid confusion.

**Required Secrets (if enabled):**
- `DOCKER_USER`
- `DOCKER_PAT`

---

## 🔧 Setup Instructions

**First time setup?** See [../SETUP_SECRETS.md](../SETUP_SECRETS.md) for detailed instructions.

**Quick steps:**
1. Go to [Repository Secrets](https://github.com/hamdanialaa3/New-Globul-Cars/settings/secrets/actions)
2. Add `FIREBASE_SERVICE_ACCOUNT` (full JSON from Google Cloud)
3. Re-run the workflow

**Note:** `FIREBASE_PROJECT_ID` is no longer needed - it's extracted from `.firebaserc` automatically!

---

## 📊 Workflow Status

Current deployment status:
[![Firebase Deploy](https://github.com/hamdanialaa3/New-Globul-Cars/actions/workflows/firebase-deploy.yml/badge.svg)](https://github.com/hamdanialaa3/New-Globul-Cars/actions/workflows/firebase-deploy.yml)

---

## 🐛 Troubleshooting

### "FIREBASE_SERVICE_ACCOUNT is NOT SET"
- Secret is missing or empty
- Follow [../SETUP_SECRETS.md](../SETUP_SECRETS.md) to add it

### "RequestError in action.min.js"
- This error is from the OLD `deploy.yml` workflow
- Solution: The old workflow is now disabled
- Use `firebase-deploy.yml` instead (it's automatic)

### "Invalid JSON format"
- Service account JSON is malformed
- Download a fresh JSON key from Google Cloud Console

### "Permission denied"
- Service account needs Firebase Admin permissions
- Check IAM roles in Google Cloud Console

### Multiple workflows running
- Only `firebase-deploy.yml` should be active
- `deploy.yml` and `ci.yml` are disabled (no triggers)

---

## 🔄 Manual Deployment

To deploy manually:

1. Go to [Actions tab](https://github.com/hamdanialaa3/New-Globul-Cars/actions)
2. Select "Deploy to Firebase (Hosting + Functions)"
3. Click "Run workflow"
4. Choose branch (usually `main`)
5. Click "Run workflow" button

---

## 📝 Workflow Files Summary

| File | Status | Purpose |
|------|--------|---------|
| `firebase-deploy.yml` | ✅ Active | Main Firebase deployment with CLI |
| `deploy.yml` | ❌ Disabled | Old workflow (authentication issues) |
| `ci.yml` | ❌ Disabled | Optional Docker build |

---

**Project:** Bulgarian Car Marketplace (mobilebg.eu)  
**Firebase Project:** fire-new-globul  
**Region:** europe-west1  
**Last Updated:** January 10, 2026
