# Security Guidelines

## Sensitive Files

This project uses Firebase service accounts. **NEVER commit these files:**

- `serviceAccountKey.json` - Firebase admin credentials
- `.env` files - Environment variables
- Any `*.pem` files - Private keys

## Setup Instructions

1. **Get your Firebase service account key:**
   - Go to Firebase Console → Project Settings → Service Accounts
   - Click "Generate New Private Key"
   - Save as `serviceAccountKey.json` in project root

2. **The file is automatically ignored by git** (.gitignore line 52)

3. **For production deployment:**
   - Use Firebase environment config: `firebase functions:config:set`
   - Or use Google Cloud Secret Manager
   - Never hardcode credentials

## What's Tracked

- `serviceAccountKey.json` has been **removed from git history** (Phase 8 cleanup)
- If you cloned this repo before Phase 8, check your local copy doesn't have credentials committed

## Reporting Security Issues

Contact: [Your security contact email]
