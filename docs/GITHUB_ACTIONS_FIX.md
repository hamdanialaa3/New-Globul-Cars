# GitHub Actions Deployment Fix Guide

## Problem
GitHub Actions deployment is failing with error:
```
ERROR: (gcloud.config.set) There was a problem refreshing auth tokens for account 
firebase-adminsdk-fbsvc@fire-new-globul.iam.gserviceaccount.com: 
invalid_grant: Invalid grant: account not found
```

## Root Cause
The service account key stored in GitHub Secrets is either:
1. Expired or revoked
2. The service account was deleted
3. The key ID doesn't match

## Solution Steps

### Step 1: Create New Service Account Key

1. **Go to Google Cloud Console**:
   - https://console.cloud.google.com/iam-admin/serviceaccounts?project=fire-new-globul

2. **Find or Create Service Account**:
   - Look for existing: `firebase-adminsdk-*@fire-new-globul.iam.gserviceaccount.com`
   - Or create new one with name: `github-actions-deploy`

3. **Generate New Key**:
   - Click on the service account
   - Go to "Keys" tab
   - Click "Add Key" → "Create new key"
   - Choose "JSON" format
   - Download the key file

4. **Grant Required Roles**:
   Make sure the service account has these roles:
   - Firebase Admin
   - Cloud Functions Developer
   - Cloud Build Editor
   - Service Account User

### Step 2: Update GitHub Secret

1. **Go to GitHub Repository Settings**:
   - https://github.com/hamdanialaa3/New-Globul-Cars/settings/secrets/actions

2. **Update FIREBASE_SERVICE_ACCOUNT**:
   - Click on `FIREBASE_SERVICE_ACCOUNT`
   - Click "Update secret"
   - Paste the **entire contents** of the JSON key file
   - Click "Update secret"

3. **Verify FIREBASE_PROJECT_ID**:
   - Make sure it's set to: `fire-new-globul`

### Step 3: Test Deployment

1. **Re-run Failed Workflow**:
   - Go to: https://github.com/hamdanialaa3/New-Globul-Cars/actions
   - Click on the failed workflow
   - Click "Re-run all jobs"

2. **Or Push New Commit**:
   ```bash
   git commit --allow-empty -m "test: trigger deployment"
   git push
   ```

## Quick Fix (Using Firebase MCP)

Since Firebase MCP Server is now connected, I can help you:
1. Verify the service account exists
2. Check its permissions
3. Guide you through creating a new key

## Alternative: Disable GCloud Setup

If you don't need GCloud features, you can simplify the workflow:

**Edit `.github/workflows/firebase-deploy.yml`**:
- Remove lines 132-140 (Authenticate Google Cloud + Setup gcloud)
- Keep only Firebase deployment (lines 142-173)

This will use Firebase CLI authentication only.

## Security Note

**After creating the new key**:
1. Delete the old key from Google Cloud Console
2. Never commit the JSON key file to Git
3. Only store it in GitHub Secrets

## Need Help?

If you need me to:
1. Create a simplified workflow without GCloud
2. Generate a script to automate this
3. Check service account permissions

Just let me know!
