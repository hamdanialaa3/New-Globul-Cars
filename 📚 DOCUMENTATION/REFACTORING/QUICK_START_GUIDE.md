# Quick Start Guide - Backend Refactoring

**Reading Time:** 5 minutes  
**Execution Time (Pre-Phase 0):** 3 days  
**For:** Developers starting the refactoring

---

## TL;DR

Clean up 173 services → 90, remove 312 console.log, cut 33% of code.  
**Duration:** 7 weeks | **Risk:** Minimal | **User Impact:** ZERO

---

## What You Need

- [x] Node.js + npm
- [x] Git configured
- [x] ts-node (`npm install -g ts-node`)
- [x] Bulgarian-car-marketplace repo access

---

## START HERE: Phase 0 Preparation

### Day 1: Backup (30 mins)

```bash
cd bulgarian-car-marketplace

# Create backup
git checkout -b backup/pre-refactoring-20251103
git push origin backup/pre-refactoring-20251103
git tag -a v1.0-pre-refactoring -m "Pre-refactoring snapshot"
git push origin v1.0-pre-refactoring

# Return to main
git checkout main
git checkout -b refactor/backend-cleanup-phase0
```

### Day 2: Run Analysis (2 hours)

```bash
mkdir -p logs/phase0-preparation

npx ts-node scripts/phase0-preparation/analyze-imports.ts
npx ts-node scripts/phase0-preparation/find-duplicate-services.ts
npx ts-node scripts/phase0-preparation/create-baseline.ts

# Review reports
ls logs/phase0-preparation/
```

### Day 3: Review & Approve (1 hour)

```bash
# Review reports
code logs/phase0-preparation/

# Test rollback
./scripts/rollback/rollback-to-baseline.sh --dry-run

# Get team approval
```

---

## Day-to-Day Workflow

### Morning:
1. `git pull`
2. Read EXECUTION_TRACKER.md
3. Review today's tasks

### During Work:
1. Follow plan exactly
2. Test after EVERY change
3. Commit every 1-2 hours

### Evening:
1. Push all commits
2. Update EXECUTION_TRACKER.md
3. Note blockers

---

## Testing After Each Change

```bash
npm run build  # MUST succeed
npm test       # MUST pass
npm start      # Manual testing
```

---

## If Something Breaks

```bash
# Rollback last commit
git reset --hard HEAD~1

# Or rollback to baseline
git checkout backup/pre-refactoring-20251103

# Always test after rollback
npm install
npm run build
```

---

## Key Reminders

### ALWAYS:
✅ Test after every change  
✅ Commit frequently  
✅ Move files to DDD/ (never delete)  

### NEVER:
❌ Delete files  
❌ Change UI  
❌ Skip testing  

---

## Quick Reference

### Important Files:
- `README.md` - This directory overview
- `MASTER_PLAN_V2.md` - Complete plan (50+ pages)
- `EXECUTION_TRACKER.md` - Daily progress
- `PROJECT_CONSTITUTION.md` - Rules (one level up)

### Commands:
```bash
npm run build      # Build project
npm test           # Run tests
npm start          # Dev server
npx ts-node <script>  # Run script
```

---

**Ready?** → Read `MASTER_PLAN_V2.md` Phase 0 & 1, then start!

**Good luck!** 🚀

