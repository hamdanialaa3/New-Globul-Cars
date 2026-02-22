# Security Policy

## 🔒 Project Security Hardening (February 21, 2026)

This document describes the security posture of the Koli One project and the measures implemented to protect user data, financial transactions, and system integrity.

---

## Security Architecture Overview

### 1. Client-Side vs Server-Side Key Separation

**Rule:** NEVER put SECRET keys in `VITE_` environment variables.

| Key Type | Where to Store | Example |
|----------|---------------|---------|
| Firebase Config (API Key, Project ID) | `VITE_*` env vars | `VITE_FIREBASE_API_KEY` |
| Algolia Search-Only Key | `VITE_*` env vars | `VITE_ALGOLIA_SEARCH_KEY` |
| Stripe Publishable Key | `VITE_*` env vars | `VITE_STRIPE_PUBLISHABLE_KEY` |
| hCaptcha Site Key | `VITE_*` env vars | `VITE_HCAPTCHA_SITE_KEY` |
| **Stripe Secret Key** | **Secret Manager** | `stripe-secret-key` |
| **hCaptcha Secret Key** | **Secret Manager** | `hcaptcha-secret-key` |
| **Facebook Page Token** | **Secret Manager** | `facebook-page-access-token` |
| **WhatsApp Access Token** | **Secret Manager** | `whatsapp-access-token` |
| **Payment Gateway Secrets** | **Secret Manager** | `epay-secret-key` |
| **Social Media Tokens** | **Cloud Functions env** | Backend only |

### 2. Firestore Security Rules

All 80+ Firestore collections are secured with:

- **Ownership enforcement**: Users can only write to documents they own (via `sellerId`, `userId`, or document ID matching `auth.uid`)
- **Admin-only collections**: Audit logs, security events, compliance data require `isAdmin()` role
- **Cloud Functions-only writes**: Financial data (orders, payments, transactions), car history reports, and aggregation data can only be written by server-side code
- **Immutable collections**: Activity logs, search history, audit trails cannot be updated or deleted by clients
- **Size validation**: Public-create collections (analytics events, contact forms) have field count limits to prevent abuse
- **Default deny**: Any unmatched collection returns `allow read, write: if false`

### 3. Cloud Storage Security Rules

- **File type validation**: Only images (`image/*`), videos (`video/*`), and documents (`application/pdf`) are accepted
- **File size limits**: 10MB for images, 50MB for videos, 20MB for documents
- **Ownership enforcement**: Users can only upload to their own folder (`/{userId}/`)
- **Default deny**: Unmatched paths are blocked for both read and write

### 4. Realtime Database Security

- **Participant-only messaging**: Users can only read/write messages in channels they participate in
- **Own presence only**: Users can only update their own online status
- **Validated message structure**: Messages require `senderId`, `content`, `timestamp`, and `type` fields
- **Feed is read-only**: Social feed data is managed by Cloud Functions only

---

## Environment Variables Setup

### Required Environment Variables
Copy `.env.example` to `.env.local` and fill in:

```bash
cp .env.example .env.local
```

### Production Deployment
- Never commit `.env` files
- Use GitHub Secrets for CI/CD
- Use Google Cloud Secret Manager for all server-side secrets
- Rotate keys immediately if exposed

---

## IAM & Service Accounts (Principle of Least Privilege)

### Cloud Functions Service Account
- `roles/datastore.user` — Firestore read/write
- `roles/storage.objectAdmin` — Media bucket access
- `roles/secretmanager.secretAccessor` — Read secrets
- `roles/pubsub.subscriber` — Event-driven functions
- `roles/logging.logWriter` — Write logs
- `roles/monitoring.metricWriter` — Write metrics

### GitHub Actions Deployment Account
- `roles/firebasehosting.admin` — Deploy hosting
- `roles/cloudfunctions.developer` — Deploy functions
- `roles/storage.objectAdmin` — Deploy artifacts
- `roles/iam.serviceAccountUser` — Impersonate functions SA

⛔ **NO Editor or Owner roles for any service account.**

---

## Exposed Credentials - What to Do

If credentials are accidentally exposed in Git history:

### 1. Firebase
- Go to [Firebase Console](https://console.firebase.google.com/)
- Navigate to: Project Settings → General
- Regenerate the API key
- Update `.env.local` and GitHub Secrets

### 2. Stripe
- Go to [Stripe Dashboard](https://dashboard.stripe.com/)
- Navigate to: Developers → API Keys
- Roll the secret key immediately
- Update Secret Manager

### 3. Social Media Tokens
- Rotate the token in the respective platform's developer portal
- Update the Secret Manager value

### 4. Google Cloud
- Go to IAM → Service Accounts
- Delete and regenerate the key
- Never download JSON keys — use Workload Identity Federation instead

---

## Security Checklist for Deployment

- [ ] All `VITE_` env vars contain ONLY public identifiers (no secrets)
- [ ] All secret keys are in Google Cloud Secret Manager
- [ ] Firestore rules deployed and tested
- [ ] Storage rules deployed and tested
- [ ] Database rules deployed and tested
- [ ] No `Editor` or `Owner` roles on any service account
- [ ] Content-Security-Policy header configured in `firebase.json`
- [ ] X-Frame-Options: DENY
- [ ] X-Content-Type-Options: nosniff
- [ ] CORS configured with specific domains only
- [ ] Firebase App Check enabled
- [ ] Rate limiting implemented in Cloud Functions
- [ ] Git history cleaned of any leaked secrets
