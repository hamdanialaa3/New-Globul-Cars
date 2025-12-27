# DDD (Domain-Driven Design) Directory

## 📋 Purpose

This directory serves as a **temporary storage area** for deprecated files, old implementations, and backup materials during refactoring and cleanup operations.

## 🗂️ Contents

### Archive Directories
- **ARCHIVE_DOCS/** - Archived documentation files
- **ARCHIVE_SCRIPTS/** - Archived utility scripts
- **TRANSLATIONS_BACKUP_NOV28_2025/** - Translation backup from November 28, 2025
- **TRASH/** - Files marked for potential deletion

### Old Service Implementations
- **unified-car.service.ts** - Legacy unified car service (superseded)
- **advanced-messaging-service-old.ts** - Old messaging service implementation
- **billing-service-old.ts** - Legacy billing service

### Deprecated Components
- **TeamManagementPage.tsx** - Old team management page component

### Reports
- **EXECUTION_REPORT_2025-12-23.md** - Execution report from December 23, 2025

## ⚠️ Important Notes

### Not for Active Development
This directory is **NOT** part of the active codebase. Files here are:
- ❌ Not imported by any active code
- ❌ Not included in builds
- ❌ Not deployed to production
- ❌ Not covered by tests

### Purpose of This Directory
1. **Safety Net**: Keep old implementations during refactoring in case rollback is needed
2. **Reference**: Preserve code for reference during reimplementation
3. **Documentation**: Maintain execution reports and historical context
4. **Temporary Storage**: Hold files before permanent deletion

## 🔄 When to Use This Directory

### Move Files Here When:
- ✅ Refactoring a service with a new implementation
- ✅ Replacing a component with a better version
- ✅ Deprecating a feature but want to keep the code temporarily
- ✅ Cleaning up but unsure if code might be needed later

### Delete Files When:
- ⏱️ 3+ months have passed since deprecation
- ✅ New implementation is stable and tested
- ✅ No references exist in any active code
- ✅ Team confirms code is no longer needed

## 📂 Recommended File Organization

When adding files to DDD, use this structure:
```
DDD/
├── ARCHIVE_DOCS/           # Old documentation
├── ARCHIVE_SCRIPTS/        # Old scripts
├── TRASH/                  # Files marked for deletion
├── services-old/           # Deprecated services
├── components-old/         # Deprecated components
├── backups-YYYY-MM-DD/     # Date-stamped backups
└── README.md               # This file
```

## 🚨 Maintenance Schedule

**Monthly Review**: Check for files that can be permanently deleted
**Quarterly Cleanup**: Remove files older than 3 months
**Annual Archive**: Move very old files to external archive if needed

## ⚙️ Integration with Build System

This directory is **excluded** from:
- TypeScript compilation (see `tsconfig.json`)
- Jest tests (see `jest.config.js`)
- Webpack builds (see `craco.config.js`)
- Git tracking of generated files (see `.gitignore`)

## 📝 Best Practices

1. **Date-stamp directories** for backups: `TRANSLATIONS_BACKUP_YYYY-MM-DD`
2. **Add reason for deprecation** in file header comments
3. **Document replacement** path (which file replaces this one)
4. **Keep reports** for audit trail (EXECUTION_REPORT_*.md)
5. **Don't import** from this directory in active code

## 🔗 Related Documentation

- **[Cleanup Plan](../docs/archived/CLEANUP_PLAN.md)** - Overall cleanup strategy
- **[Project Constitution](../docs/architecture/PROJECT_CONSTITUTION.md)** - Code organization principles
- **[Architecture Docs](../docs/architecture/)** - System architecture guidelines

## 📞 Questions?

If you're unsure whether to move a file here:
1. Check if it's imported anywhere: `grep -r "filename" src/`
2. Review with the team
3. When in doubt, move it here (safer than deleting)

---

**Last Updated**: December 27, 2025  
**Status**: Active Archive Directory  
**Maintenance**: Monthly cleanup recommended
