# .github Directory

Configuration files for GitHub integrations and automations.

## 📁 Structure

```
.github/
├── workflows/              # GitHub Actions workflows
│   ├── firebase-deploy.yml # 🚀 Main deployment workflow
│   └── README.md           # Workflows documentation
├── copilot-instructions.md # 🤖 GitHub Copilot instructions
└── SETUP_SECRETS.md        # 🔐 Secret setup guide (IMPORTANT!)
```

---

## 🚨 First Time Setup Required

**If you're setting up CI/CD for the first time:**

1. **Read this first:** [SETUP_SECRETS.md](SETUP_SECRETS.md)
2. Configure required GitHub secrets
3. Re-run the deployment workflow

**Quick link:** [Repository Secrets Settings](https://github.com/hamdanialaa3/New-Globul-Cars/settings/secrets/actions)

---

## 📚 Documentation

- **[copilot-instructions.md](copilot-instructions.md)** - Complete guide for GitHub Copilot AI
  - Critical architecture patterns
  - Service patterns
  - Development workflows
  - Debugging guides

- **[SETUP_SECRETS.md](SETUP_SECRETS.md)** - GitHub Actions secrets setup
  - Firebase service account
  - Project ID
  - Stripe keys (optional)

- **[workflows/README.md](workflows/README.md)** - CI/CD pipeline documentation
  - Available workflows
  - Trigger conditions
  - Troubleshooting

---

## 🤖 GitHub Copilot

This repository includes comprehensive AI instructions for GitHub Copilot.

The instructions are automatically loaded and help Copilot understand:
- Project architecture (195,000+ LOC, 795 components)
- Critical patterns (Numeric ID system, Multi-collection, Firestore listeners)
- Bulgarian market constraints
- Service organization (410+ services)

No additional setup needed - Copilot reads `copilot-instructions.md` automatically.

---

## 🔄 CI/CD Pipeline

**Current Status:**
[![Firebase Deploy](https://github.com/hamdanialaa3/New-Globul-Cars/actions/workflows/firebase-deploy.yml/badge.svg)](https://github.com/hamdanialaa3/New-Globul-Cars/actions/workflows/firebase-deploy.yml)

**Pipeline Overview:**
1. Pre-flight secret validation ✅
2. Install dependencies (npm ci)
3. Build React app (production)
4. Deploy to Firebase Hosting
5. Deploy Cloud Functions

**Deploy manually:**
- Go to [Actions tab](https://github.com/hamdanialaa3/New-Globul-Cars/actions)
- Select "Deploy to Firebase"
- Click "Run workflow"

---

## ⚙️ Workflow Configuration

All workflows use:
- **Node.js:** 20.x
- **Firebase CLI:** Latest
- **Project ID:** `fire-new-globul`
- **Region:** europe-west1

---

**Project:** Bulgarian Car Marketplace  
**Live:** https://mobilebg.eu  
**Firebase Console:** https://console.firebase.google.com/project/fire-new-globul
