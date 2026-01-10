# GitHub Actions Workflows

This directory contains automated workflows for CI/CD.

## 📋 Available Workflows

### `firebase-deploy.yml` - Firebase Deployment

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
- `FIREBASE_PROJECT_ID` - Firebase project ID (`fire-new-globul`)

**Optional Secrets:**
- `STRIPE_SECRET_KEY` - Stripe API secret key
- `STRIPE_WEBHOOK_SECRET` - Stripe webhook signing secret

---

## 🔧 Setup Instructions

**First time setup?** See [SETUP_SECRETS.md](../SETUP_SECRETS.md) for detailed instructions.

**Quick steps:**
1. Go to [Repository Secrets](https://github.com/hamdanialaa3/New-Globul-Cars/settings/secrets/actions)
2. Add `FIREBASE_SERVICE_ACCOUNT` (full JSON from Google Cloud)
3. Add `FIREBASE_PROJECT_ID` (value: `fire-new-globul`)
4. Re-run the workflow

---

## 📊 Workflow Status

Current deployment status:
[![Firebase Deploy](https://github.com/hamdanialaa3/New-Globul-Cars/actions/workflows/firebase-deploy.yml/badge.svg)](https://github.com/hamdanialaa3/New-Globul-Cars/actions/workflows/firebase-deploy.yml)

---

## 🐛 Troubleshooting

### "FIREBASE_SERVICE_ACCOUNT is NOT SET"
- Secret is missing or empty
- Follow [SETUP_SECRETS.md](../SETUP_SECRETS.md) to add it

### "Invalid JSON format"
- Service account JSON is malformed
- Download a fresh JSON key from Google Cloud Console

### "Permission denied"
- Service account needs Firebase Admin permissions
- Check IAM roles in Google Cloud Console

---

**Project:** Bulgarian Car Marketplace (mobilebg.eu)  
**Firebase Project:** fire-new-globul  
**Last Updated:** January 10, 2026
