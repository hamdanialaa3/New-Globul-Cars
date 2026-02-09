# 🔐 Developer Security Setup Guide

**REQUIRED:** All developers must complete these steps before contributing to Koli One.

## 1️⃣ Setup Pre-commit Hooks (Local Machine)

### Installation

```bash
# Install pre-commit framework
pip install pre-commit
# OR on macOS
brew install pre-commit

# OR on Windows
choco install pre-commit
```

### Enable Pre-commit Hooks

```bash
# Clone repo (if not already)
cd ~/Desktop/Koli_One_Root

# Install git hooks
pre-commit install

# Optional: Run on all files to verify
pre-commit run --all-files
```

### What This Does

Pre-commit hooks will automatically:
- ✅ Scan for hardcoded API keys before each commit
- ✅ Detect credentials, passwords, tokens
- ✅ Fix whitespace and formatting issues
- ✅ Validate JSON/YAML files

If secrets are detected, your commit will be **REJECTED** automatically.

### Troubleshooting Pre-commit

```bash
# Bypass (not recommended - only for emergency!)
git commit --no-verify

# Update hooks to latest
pre-commit autoupdate

# Clean cache
pre-commit clean

# Run manually on current changes
pre-commit run
```

## 2️⃣ Configure Environment Variables

### Web App (.env.local)

```bash
cd web/

# Copy template
cp .env.example .env.local

# Open in editor
code .env.local
```

Fill in each value from secure storage (password manager, Firebase Console, etc.):

```env
# Google Gemini
VITE_GOOGLE_GEMINI_API_KEY=<get_from_google_cloud>

# Firebase
VITE_FIREBASE_API_KEY=<get_from_firebase>
VITE_FIREBASE_AUTH_DOMAIN=<get_from_firebase>
VITE_FIREBASE_PROJECT_ID=<get_from_firebase>
VITE_FIREBASE_STORAGE_BUCKET=<get_from_firebase>
VITE_FIREBASE_MESSAGING_SENDER_ID=<get_from_firebase>
VITE_FIREBASE_APP_ID=<get_from_firebase>
VITE_FIREBASE_MEASUREMENT_ID=<get_from_firebase>
VITE_FIREBASE_DATABASE_URL=<get_from_firebase>

# Google Maps
VITE_GOOGLE_MAPS_API_KEY=<get_from_google_cloud>

# Algolia
VITE_ALGOLIA_APP_ID=<get_from_algolia>
VITE_ALGOLIA_SEARCH_KEY=<get_from_algolia>
VITE_ALGOLIA_ADMIN_KEY=<ask_admin>

# Admin (for development only)
VITE_ADMIN_EMAIL=<set_by_admin>
VITE_ADMIN_PASSWORD=<set_by_admin>
```

**CRITICAL:**
- ✅ Store `.env.local` securely (never commit)
- ✅ `.env.local` is in `.gitignore` (already configured)
- ✅ Never paste contents in Slack/email
- ✅ Use password manager for secure storage

### Mobile App (.env.local)

```bash
cd mobile_new/

# Copy Google Cloud configs
# Go to Firebase Console > Project Settings > Your Apps
# Download google-services.json → save to mobile_new/
# Download GoogleService-Info.plist (iOS) → save to mobile_new/
```

**CRITICAL:**
- ✅ `google-services.json` must exist for Android build
- ✅ `GoogleService-Info.plist` must exist for iOS build
- ✅ Both are git-ignored (never committed)
- ✅ See [FIREBASE_CONFIG_SETUP.md](./FIREBASE_CONFIG_SETUP.md) for details

## 3️⃣ Verify Setup

### Web App

```bash
cd web/

# Check .env.local exists
if [ -f .env.local ]; then
  echo "✓ .env.local configured"
  else
  echo "✗ Missing .env.local"
fi

# Verify no secrets in git
git grep -i "AIzaSy\|47f00\|885688" -- . | grep -v ".env.example" || echo "✓ No hardcoded secrets in tracked files"

# Test build
npm run build

# Verify Firebase config loads
npm run type-check
```

### Mobile App

```bash
cd mobile_new/

# Check configs exist
if [ -f google-services.json ] && [ -f GoogleService-Info.plist ]; then
  echo "✓ Firebase configs present"
else
  echo "✗ Missing Firebase configs"
fi

# Run pre-commit checks
pre-commit run --all-files
```

## 4️⃣ Daily Workflow

### Before Starting Work

```bash
# Ensure pre-commit is installed
pre-commit --version

# Pull latest changes
git pull origin master  # or main/develop

# Install/update dependencies
npm install  # in web/ and mobile_new/
```

### Making Changes

```bash
# Edit code normally
code src/services/myservice.ts

# Stage changes
git add .

# Commit (pre-commit will automatically scan)
git commit -m "feat: add new service"
# If secrets detected → commit REJECTED, fix issues, try again
```

### If Commit Is Rejected

**Scenario 1: Hardcoded API Key Detected**
```bash
# ❌ Pre-commit error: "Hardcoded API key found"

# Solution: Remove hardcoded key
# src/services/my-service.ts (WRONG):
const API_KEY = "AIzaSy...";

# Should be (RIGHT):
const API_KEY = import.meta.env.VITE_MY_API_KEY;

# Fix .env.local with actual key
# Re-commit
git add .
git commit -m "feat: use env variables for API key"  # ✅ PASSES
```

**Scenario 2: Password String Detected**
```bash
# ❌ Pre-commit error: "Hardcoded password detected"

# Solution: Never hardcode passwords
# WRONG: password: "mypass123"
# RIGHT: password: import.meta.env.VITE_ADMIN_PASSWORD

# Fix and commit
git add .
git commit -m "fix: use env for admin password"  # ✅ PASSES
```

## 5️⃣ Getting API Keys Safely

### Google Cloud Console
1. Go to console.cloud.google.com
2. Select project: **fire-new-globul**
3. APIs & Services → Credentials
4. Create API Key (if needed)
5. Copy key → paste into `.env.local` ONLY (never code)
6. **DO NOT commit `.env.local`** - it's git-ignored

### Firebase Console
1. Go to console.firebase.google.com
2. Select project: **fire-new-globul**
3. Project Settings (gear icon)
4. **Your Apps** tab
5. Copy config values → `.env.local`

### Algolia Dashboard
1. Go to www.algolia.com
2. Select app
3. Settings → API Keys
4. Copy values → `.env.local`

## 6️⃣ Emergency: Secrets Leaked?

**IF YOU ACCIDENTALLY COMMIT A SECRET:**

1. **Immediately notify the team** in #security Slack channel
2. **Revoke the compromised key** in respective console:
   - Google Cloud Console → delete key
   - Firebase Console → regenerate
   - Algolia Dashboard → create new key
3. **Create new key** and update `.env.local`
4. **We will clean Git history** with `git filter-repo`
5. **All developers** will force-pull cleaned repos

## 7️⃣ CI/CD Security

GitHub Actions automatically:
- ✅ Scans every push for secrets
- ✅ Scans every PR for secrets
- ✅ Fails build if secrets detected
- ✅ Alerts team in PR comments

**Your commits must pass**:
```bash
✅ detect-secrets scan → NO secrets
✅ Pattern matching → NO API keys in code
✅ .gitignore validation → sensitive files protected
✅ .env.example exists → no real secrets in template
```

## 📋 Security Checklist

- [ ] Pre-commit hooks installed (`pre-commit install`)
- [ ] `.env.local` created and filled with real values
- [ ] `.env.local` is git-ignored (never commit)
- [ ] Mobile: `google-services.json` downloaded and git-ignored
- [ ] Mobile: `GoogleService-Info.plist` downloaded and git-ignored
- [ ] No hardcoded API keys in `.ts`/`.js` files
- [ ] No hardcoded passwords anywhere
- [ ] `npm run build` completes successfully
- [ ] `npm run type-check` passes
- [ ] `pre-commit run --all-files` passes
- [ ] First commit accepted (pre-commit hook triggered)

## 🆘 Need Help?

- **Pre-commit issues**: `pre-commit install && pre-commit run --help`
- **Firebase config**: See [FIREBASE_CONFIG_SETUP.md](./FIREBASE_CONFIG_SETUP.md)
- **Git cleanup history**: See [GIT_CLEANUP_MANUAL.sh](./GIT_CLEANUP_MANUAL.sh)
- **Report security issue**: Slack #security channel

**Remember:** Every commit is scanned. Secrets will be caught automatically. No manual check needed! ✅
