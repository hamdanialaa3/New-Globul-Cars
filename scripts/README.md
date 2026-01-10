# Scripts Guide

## � GitHub Secrets Setup (NEW!)

### **setup-github-secrets.ps1** ⭐
Automated wizard to add Firebase secrets to GitHub.

```powershell
pwsh scripts/setup-github-secrets.ps1
```

**Features:**
- ✅ Auto-reads project ID from `.firebaserc`
- ✅ Validates Firebase service account key
- ✅ Adds secrets via GitHub CLI (or shows manual steps)
- ✅ Opens relevant pages in browser
- ✅ Interactive and user-friendly

**Prerequisites:**
```powershell
# Option 1: Full automation (recommended)
winget install GitHub.cli
gh auth login

# Option 2: Manual mode
# Just run the script - it guides you through
```

**Required File:**
- `firebase-service-account.json` (download from Firebase Console)
- Get it from: https://console.firebase.google.com/project/fire-new-globul/settings/serviceaccounts/adminsdk

**Troubleshooting:**
- "Service account not found" → Download from Firebase Console
- "GitHub CLI not found" → Script will show manual instructions
- "Not authenticated" → Run `gh auth login`

---

## �🚀 Development Scripts

### **START_DEV_HOT_RELOAD.bat**
Start development server with hot module reloading.
```bash
./scripts/START_DEV_HOT_RELOAD.bat
```
- Opens on: http://localhost:3000
- Auto-refreshes on file changes

### **START_SERVER.bat**
Standard development server startup.
```bash
./scripts/START_SERVER.bat
```

## 🔨 Build Scripts

### **QUICK_REBUILD.bat**
Fast production build (clears cache first).
```bash
./scripts/QUICK_REBUILD.bat
```

## 🛠️ Utility Scripts

### **RESTART_SERVER.bat**
Kill port 3000 process and restart server.
```bash
./scripts/RESTART_SERVER.bat
```
- Useful when port is blocked
- Automatically starts dev server after cleanup

---

## 📦 NPM Scripts

Available in `package.json`:

### Development
```bash
npm start              # Start dev server
npm run dev:vite       # Vite dev server (alternative)
```

### Production
```bash
npm run build          # Production build
npm run build:analyze  # Build + bundle analysis
```

### Testing
```bash
npm test               # Run tests
npm run test:ci        # CI mode (coverage)
npm run type-check     # TypeScript validation
```

### Deployment
```bash
npm run deploy         # Build + deploy to Firebase
npm run deploy:hosting # Deploy hosting only
npm run deploy:functions # Deploy functions only
```

### Utilities
```bash
npm run lint           # Code linting (disabled)
npm run train-ai       # Train AI on project structure
```

---

## ⚠️ Troubleshooting

**Port 3000 already in use?**
```bash
./scripts/RESTART_SERVER.bat
```

**Build failing?**
```bash
./scripts/QUICK_REBUILD.bat
```

**Firebase deployment issues?**
```bash
npm run build          # Ensure build succeeds first
firebase login         # Re-authenticate if needed
npm run deploy
```

---

**Last Updated**: December 28, 2025
