# 🛠️ Scripts Directory

This directory contains utility scripts for development, deployment, and maintenance of the Bulgarian Car Marketplace (Globul Cars) project.

## 📂 Directory Structure

```
scripts/
├── startup/          # Server startup scripts
├── legacy/           # Legacy utility scripts (backward compatibility)
├── *.js             # Build and utility JavaScript scripts
└── README.md        # This file
```

## 🚀 Startup Scripts (`startup/`)

### Development Server

**START_DEV_HOT_RELOAD.bat** (Recommended for development)
```bash
# Windows: Double-click or run from command line
START_DEV_HOT_RELOAD.bat

# Purpose: Start development server with hot reload
# Port: 3000
# Features: Auto-reload on file changes
```

**START_SERVER.bat**
```bash
# Standard development server start
START_SERVER.bat
```

**FAST_START.ps1** (PowerShell)
```powershell
# Quick start with optimizations
./FAST_START.ps1
```

**START_SERVER_CLEAN.ps1** (PowerShell)
```powershell
# Start with clean cache
./START_SERVER_CLEAN.ps1
```

### Production Server

**START_PRODUCTION_SERVER.bat**
```bash
# Build and serve production version
START_PRODUCTION_SERVER.bat
```

### Server Management

**RESTART_SERVER.bat**
```bash
# Restart the development server
RESTART_SERVER.bat
```

**QUICK_REBUILD.bat**
```bash
# Quick production rebuild
QUICK_REBUILD.bat
```

### Internationalization

**تشغيل_الخادم.bat** (Arabic)
```bash
# Start server (Arabic version)
```

## 🧹 Legacy Utility Scripts (`legacy/`)

These scripts are kept for backward compatibility. Use the npm scripts when possible.

### Port Cleanup

**CLEAN_PORTS.ps1** (PowerShell)
```powershell
# Clean up all ports used by the project
./CLEAN_PORTS.ps1
```

**CLEAN_PORT_3000.bat**
```bash
# Clean port 3000 specifically
CLEAN_PORT_3000.bat
```

**تنظيف_المنفذ_3000.bat** (Arabic)
```bash
# Clean port 3000 (Arabic version)
```

### Recommended Alternative
Instead of using these scripts, use the npm command:
```bash
npm run clean:3000
```

## 🔧 Build & Utility Scripts (Root)

### ban-console.js
Prevents `console.log` statements in production builds.
```bash
# Automatically runs before build via prebuild script
node scripts/ban-console.js
```

### analyze-bundle-size.js
Analyzes the production bundle size.
```bash
node scripts/analyze-bundle-size.js
# Or use: npm run build:analyze
```

### optimize-images.js
Optimizes images for web delivery.
```bash
node scripts/optimize-images.js
```

### clean-all.js
Comprehensive cleanup of caches and temporary files.
```bash
node scripts/clean-all.js
# Or use: npm run clean
```

### backup-manager.js
Manages project backups.
```bash
node scripts/backup-manager.js
```

### Migration Scripts

**migrate-legacy-cars.js**
```bash
npm run migrate:legacy-cars
```

**add-seller-ids.js**
```bash
node scripts/add-seller-ids.js
```

### Analysis Scripts

- **analyze-large-files.js** - Find large files in the project
- **analyze-images.js** - Analyze image usage and size
- **analyze-existing-data.ts** - Analyze Firestore data
- **audit-singletons.js** - Check singleton pattern usage
- **audit-env.js** - Verify environment variables

### Testing Scripts

**pretest-profile-stats.js**
```bash
npm run test:profile-stats
```

### Translation Scripts

- **check-translations.js** - Verify translation coverage
- **check-translation-coverage.ts** - TypeScript version

## 📋 Common Tasks

### Start Development Server
```bash
# Option 1: npm (recommended)
npm start

# Option 2: Windows batch file
scripts/startup/START_DEV_HOT_RELOAD.bat

# Option 3: PowerShell
scripts/startup/FAST_START.ps1
```

### Build for Production
```bash
# npm (recommended)
npm run build

# Windows batch file
scripts/startup/QUICK_REBUILD.bat
```

### Clean Ports (if server won't start)
```bash
# npm (recommended)
npm run clean:3000

# Legacy script
scripts/legacy/CLEAN_PORT_3000.bat
```

### Clean All Caches
```bash
npm run clean:all
```

### Type Check
```bash
npm run type-check
```

### Security Audit
```bash
npm audit
```

## 🔐 Security Notes

- Never commit scripts that contain API keys or secrets
- Review scripts before running them, especially from external sources
- Use npm scripts when possible for consistency

## 🐛 Troubleshooting

### Port 3000 Already in Use
```bash
# Windows: Use legacy script
scripts/legacy/CLEAN_PORT_3000.bat

# Or use npm command
npm run clean:3000
```

### Build Fails with TypeScript Errors
```bash
# Run type check first
npm run type-check

# Clean and rebuild
npm run clean
npm run build
```

### Hot Reload Not Working
1. Stop the server (Ctrl+C)
2. Clear cache: `npm run clean:cache`
3. Restart: `npm start` or `scripts/startup/START_DEV_HOT_RELOAD.bat`

## 📚 Related Documentation

- **[Package.json Scripts](../package.json)** - All available npm scripts
- **[Security Policy](../SECURITY.md)** - Security guidelines
- **[Troubleshooting Guide](../docs/troubleshooting/)** - Common issues and fixes

## 🎯 Best Practices

1. **Prefer npm scripts** over direct script execution
2. **Use startup scripts** only for quick testing or when npm is unavailable
3. **Keep legacy scripts** for backward compatibility but document alternatives
4. **Test scripts** before committing changes
5. **Document new scripts** in this README

---

**Last Updated**: December 27, 2025  
**Version**: 1.0.0
