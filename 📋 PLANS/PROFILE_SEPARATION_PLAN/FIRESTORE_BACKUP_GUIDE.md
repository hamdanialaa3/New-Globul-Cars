# 🔐 FIRESTORE BACKUP GUIDE
## Critical backup before Phase 0 execution

**Phase:** 0 Day 1  
**Priority:** 🔴 CRITICAL - Must do before ANY migration

---

## 📋 Backup Checklist

```
[ ] 1. Export Firestore data
[ ] 2. Run data analysis script
[ ] 3. Review analysis report
[ ] 4. Save backup location
[ ] 5. Verify backup integrity
```

---

## 🔹 Method 1: Firebase CLI Export (RECOMMENDED)

### Prerequisites
```bash
# Install Firebase CLI
npm install -g firebase-tools

# Login
firebase login

# Verify project
firebase projects:list
```

### Export Command
```bash
# Full export to Cloud Storage bucket
firebase firestore:export gs://fire-new-globul-backup/phase0-$(date +%Y%m%d)

# Alternative: Export to local (requires gcloud)
gcloud firestore export gs://fire-new-globul-backup/phase0-backup \
  --collection-ids=users,dealerships,companies
```

### Expected Output
```
✔ Exporting data...
✔ Export complete
  Exported: 1,234 users
  Location: gs://fire-new-globul-backup/phase0-20251102
  Size: 45.2 MB
```

---

## 🔹 Method 2: Run Analysis Script

### Setup
```bash
cd bulgarian-car-marketplace

# Install dependencies (if needed)
npm install --save-dev @types/node

# Set Firebase credentials
export FIREBASE_API_KEY="your-api-key"
export FIREBASE_PROJECT_ID="fire-new-globul"
```

### Execute
```bash
# Run analysis
npx ts-node scripts/analyze-existing-data.ts

# Output will be saved to:
# 📋 PLANS/PROFILE_SEPARATION_PLAN/DATA_ANALYSIS_REPORT.md
```

### Expected Report Sections
```markdown
# 📊 DATA ANALYSIS REPORT

1. Overall Statistics
2. Profile Type Distribution
3. Legacy Field Usage
4. Data Quality Issues
5. Dealer Data Analysis
6. Migration Recommendations
7. Next Steps
```

---

## 🔹 Method 3: Firestore Console Manual Export

### Steps
1. Go to: https://console.firebase.google.com/project/fire-new-globul/firestore
2. Click "Import/Export" tab
3. Select "Export"
4. Choose destination: `gs://fire-new-globul-backup/manual-export-$(date)`
5. Collections: `users`, `dealerships`, `companies`, `posts`
6. Click "Export"

### Verification
```bash
# List backups
gsutil ls gs://fire-new-globul-backup/

# Check size
gsutil du -sh gs://fire-new-globul-backup/phase0-*
```

---

## ⚠️ CRITICAL WARNINGS

### 🚨 Before You Proceed

```
⚠️  DO NOT skip backup!
⚠️  DO NOT proceed if analysis shows critical issues
⚠️  DO NOT delete old backups for 90 days
⚠️  DO verify backup integrity before migration
```

### 🔴 Stop Migration If

- ❌ Inconsistent profileType > 0
- ❌ Missing email > 10%
- ❌ Backup failed
- ❌ Analysis script errors

---

## 📊 Post-Backup Verification

### Check 1: Backup Exists
```bash
firebase firestore:export --help
# Should show recent export in console
```

### Check 2: File Size Reasonable
```bash
# Expect: ~30-50 KB per user
# Example: 1,000 users = ~30-50 MB
```

### Check 3: Analysis Report Generated
```bash
ls -lh "📋 PLANS/PROFILE_SEPARATION_PLAN/DATA_ANALYSIS_REPORT.md"
# Should exist and be > 1 KB
```

---

## 🔄 Restore Procedure (If Needed)

### Emergency Rollback
```bash
# Import from backup
firebase firestore:import gs://fire-new-globul-backup/phase0-20251102

# Verify restoration
npx ts-node scripts/analyze-existing-data.ts
```

### Selective Restore
```bash
# Restore only specific collection
gcloud firestore import gs://fire-new-globul-backup/phase0-backup \
  --collection-ids=users
```

---

## 📝 Backup Log Template

```markdown
# Backup Log Entry

**Date:** 2025-11-02  
**Phase:** 0 Day 1  
**Backup Type:** Full Export  
**Location:** gs://fire-new-globul-backup/phase0-20251102  
**Size:** 45.2 MB  
**Users Backed Up:** 1,234  
**Status:** ✅ Success  
**Verified:** ✅ Yes  
**Issues:** None

**Analysis Results:**
- Total Users: 1,234
- Private: 980 (79.4%)
- Dealer: 200 (16.2%)
- Company: 54 (4.4%)
- Legacy Usage: 200 (16.2%)
- Data Issues: 0 critical

**Next Step:** Proceed to Phase 0 Day 2
```

---

## 🎯 Success Criteria

### ✅ Backup is Complete When

- [x] Firestore export succeeded
- [x] Analysis script ran successfully
- [x] Report shows 0 critical issues
- [x] Backup location documented
- [x] Backup size verified (30-50 KB/user)
- [x] Git commit with backup info created

### Example Git Commit
```bash
git add "📋 PLANS/PROFILE_SEPARATION_PLAN/DATA_ANALYSIS_REPORT.md"
git commit -m "✅ Phase 0 Day 1: Data snapshot complete

📊 Analysis Results:
- Total users: 1,234
- Profile types: OK
- Legacy usage: 16.2%
- Critical issues: 0

🔐 Backup: gs://fire-new-globul-backup/phase0-20251102
Size: 45.2 MB
Status: ✅ Verified

⏭️ Ready for Day 2: Split ProfilePage"
```

---

## 📞 Troubleshooting

### Error: "Permission Denied"
```bash
# Grant permissions
gcloud auth login
firebase login --reauth
```

### Error: "Bucket doesn't exist"
```bash
# Create bucket
gsutil mb gs://fire-new-globul-backup/

# Set lifecycle (optional)
gsutil lifecycle set backup-lifecycle.json gs://fire-new-globul-backup/
```

### Error: "Analysis script fails"
```bash
# Check Node version (need >= 18)
node --version

# Check TypeScript
npx ts-node --version

# Run with verbose logging
DEBUG=* npx ts-node scripts/analyze-existing-data.ts
```

---

**Status:** 📋 Guide Complete  
**Next:** Run backup before proceeding to Day 2


