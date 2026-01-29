# Scripts Guide
## 🧪 Test Utilities (NEW - Jan 24, 2026!)

### **check-test-structure.js** ⭐
Advanced test structure analyzer that detects Jest configuration issues.

```bash
npm run test:check
# or
node scripts/check-test-structure.js
```

**Detects:**
- ❌ jest.mock() after imports (CRITICAL)
- ❌ jest.spyOn(console) without cleanup (MEDIUM)
- ❌ Missing jest import from @jest/globals (HIGH)
- ❌ Imports after jest.mock() (CRITICAL)
- ❌ describe/it without @jest/globals (HIGH)
- ❌ global.console mocks without restore (MEDIUM)

**Output Example:**
```
═══════════════════════════════════════════════════════════
   Test Structure Checker - فاحص بنية الاختبارات
═══════════════════════════════════════════════════════════

❌ ERRORS (2):
  1. src/services/__tests__/some.test.ts:15
     Issue: jest.mock() يجب أن يكون قبل الاستيرادات الأخرى

⚠️  WARNINGS (1):
  1. src/services/__tests__/test.test.ts
     Issue: استخدام jest.spyOn(console) بدون تنظيف

Summary: 2 errors, 1 warnings, 0 info
```

### **fix-jest-mocks.js** ⚙️
Automatic Jest configuration fixer - applies fixes to all detected issues.

```bash
npm run test:fix
# or
node scripts/fix-jest-mocks.js
```

**Auto-Fixes:**
- ✅ Moves jest.mock() before imports
- ✅ Adds jest import from @jest/globals
- ✅ Reorders imports correctly
- ✅ Formats test files properly
- ✅ Removes duplicate imports

**Output Example:**
```
✅ FIXED (10):
  1. src/services/social/__tests__/follow.service.test.ts
     - Moved jest.mock() before imports
     - Added jest import

  2. src/__tests__/SuperAdminFlow.test.tsx
     - Reordered imports
     - Fixed mock declarations

Summary: 10 files fixed, 0 errors
```

---
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
