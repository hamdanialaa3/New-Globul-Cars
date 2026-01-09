# Firebase Deployment Setup Guide

## Overview

This document outlines the setup required to deploy the New Globul Cars application to Firebase Hosting and Cloud Functions.

## Prerequisites

### 1. Firebase Service Account Permissions (Required)

The Firebase deployment workflow requires proper IAM permissions. Follow these steps in Google Cloud Console:

**Step 1: Open IAM Admin Console**
- Navigate to: https://console.cloud.google.com/iam-admin/iam?project=fire-new-globul
- Replace `fire-new-globul` with your actual project ID if different

**Step 2: Locate Service Account**
Find the service account:
```
firebase-adminsdk-fbsvc@fire-new-globul.iam.gserviceaccount.com
```

**Step 3: Grant Required Roles**
Click "Edit" (pencil icon) next to the service account and:
1. Click "+ ADD ANOTHER ROLE"
2. Search for and select: **Service Account User** (`roles/iam.serviceAccountUser`)
3. In the "Service Account" field, specify the target:
   ```
   fire-new-globul@appspot.gserviceaccount.com
   ```
   This is the App Engine default service account that needs ActAs permission.
4. Save changes

**Important:** This grants your workflow's service account (`firebase-adminsdk-fbsvc@...`) permission to act as the App Engine service account during Functions deployment.

### 2. GitHub Secrets Configuration

Ensure the following secrets are added to your GitHub repository:

| Secret Name | Description | Required |
|-------------|-------------|----------|
| `FIREBASE_SERVICE_ACCOUNT` | Full JSON service account key exported from Google Cloud Console | ✅ Yes |
| `FIREBASE_PROJECT_ID` | Firebase project ID (e.g., `fire-new-globul`) | ✅ Yes |
| `STRIPE_SECRET_KEY` | Stripe API secret key | ⚠️ Optional |
| `STRIPE_WEBHOOK_SECRET` | Stripe webhook secret | ⚠️ Optional |

**How to add secrets:**
1. Go to GitHub repository → Settings → Secrets and variables → Actions
2. Click "New repository secret"
3. Add each secret with the exact name above

### 3. Deployment Workflow

The workflow is automatically triggered when you push to the `main` branch. It will:

1. ✅ Check out code
2. ✅ Install dependencies (Node.js 20)
3. ✅ Build React app (CRA production build)
4. ✅ Install Firebase CLI
5. ✅ Configure service account from secrets
6. ✅ Deploy to Firebase Hosting
7. ✅ Deploy Cloud Functions

**Workflow file:** `.github/workflows/firebase-deploy.yml`

## Troubleshooting

### Error: `gcloud.json not found`
**Solution:** Ensure `FIREBASE_SERVICE_ACCOUNT` secret is set correctly with the full JSON key.

### Error: `Permission denied: iam.serviceAccounts.ActAs`
**Solution:** Complete Step 3 above (Grant Service Account User role in IAM Console).

### Error: `Functions deployment failed`
**Solution:**
1. Check Cloud Functions logs in Firebase Console
2. Verify `functions/` has `package.json` and dependencies installed
3. Check `functions/.env` is properly configured

## Manual Deployment (Local)

If you need to deploy locally:

```bash
# Install Firebase CLI globally
npm install -g firebase-tools

# Login to Firebase
firebase login

# Build the app
npm run build

# Deploy to Firebase
firebase deploy --project fire-new-globul

# Or deploy only specific resources
firebase deploy --only hosting --project fire-new-globul
firebase deploy --only functions --project fire-new-globul
```

## Monitoring Deployments

Monitor deployment progress:
- **GitHub Actions:** https://github.com/hamdanialaa3/New-Globul-Cars/actions
- **Firebase Console Hosting:** https://console.firebase.google.com/project/fire-new-globul/hosting
- **Cloud Functions Logs:** https://console.cloud.google.com/functions?project=fire-new-globul

## Custom Domain Deployment

**Status:** ✅ Already configured for `mobilebg.eu`

The custom domain is already set up and verified:
- **Primary domain:** https://mobilebg.eu
- **DNS:** Configured and verified
- **SSL Certificate:** Auto-managed by Firebase (Let's Encrypt)
- **Redirect:** HTTP → HTTPS (automatic)

If you need to add additional domains:
1. Go to Firebase Console → Hosting
2. Click "Add custom domain"
3. Enter new domain name
4. Follow DNS verification steps (add TXT record)
5. Add A/AAAA records provided by Firebase
6. Wait up to 24 hours for propagation

## Environment Variables

Cloud Functions environment variables are set via:
- `firebase functions:config:set` (CI/CD workflow)
- Firebase Console → Functions → Runtime settings

Current runtime config includes:
- `stripe.secret` (from `STRIPE_SECRET_KEY`)
- `stripe.webhook` (from `STRIPE_WEBHOOK_SECRET`)

Access in functions via:
```typescript
import * as functions from 'firebase-functions';
const config = functions.config();
const stripeSecret = config.stripe.secret;
```

## Support

For issues:
1. Check this document first
2. Review GitHub Actions logs
3. Check Firebase Console for errors
4. Review `functions/` logs in Cloud Console

---

**Last Updated:** January 9, 2026  
**Project:** New Globul Cars (Bulgarian Car Marketplace)
