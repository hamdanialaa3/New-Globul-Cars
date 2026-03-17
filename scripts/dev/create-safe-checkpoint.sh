#!/bin/bash

# Safe Checkpoint Creator
# Creates a complete backup of the project at current state
# Date: November 3, 2025

echo "========================================"
echo "Creating Safe Checkpoint for Project"
echo "========================================"
echo ""

# Configuration
CHECKPOINT_DATE=$(date +%Y%m%d-%H%M%S)
CHECKPOINT_NAME="safe-checkpoint-${CHECKPOINT_DATE}"
PROJECT_ROOT=$(pwd)

echo "Checkpoint Name: ${CHECKPOINT_NAME}"
echo "Project Root: ${PROJECT_ROOT}"
echo ""

# Step 1: Check Git status
echo "Step 1: Checking Git status..."
git status

echo ""
read -p "Do you want to add all changes? (y/n): " -n 1 -r
echo ""

if [[ $REPLY =~ ^[Yy]$ ]]
then
    echo "Adding all changes..."
    git add .
fi

# Step 2: Create commit
echo ""
echo "Step 2: Creating commit..."
git commit -m "checkpoint: Safe checkpoint before refactoring - ${CHECKPOINT_DATE}

This checkpoint captures the complete project state including:
- All documentation prepared
- Analysis scripts ready
- Refactoring plan complete
- Project constitution established

Created as safety measure before starting backend refactoring.

Files included:
- Documentation in 📚 DOCUMENTATION/REFACTORING/
- Analysis scripts in scripts/phase0-preparation/
- Project constitution and rules
- All source code in current state

This checkpoint can be used to restore project to this exact state.

Checkpoint ID: ${CHECKPOINT_NAME}
Date: $(date)
"

# Step 3: Create Git tag
echo ""
echo "Step 3: Creating Git tag..."
git tag -a "${CHECKPOINT_NAME}" -m "Safe Checkpoint - Pre-Refactoring State

Complete project backup before starting backend refactoring.

Includes:
- All documentation
- Analysis scripts
- Current codebase state
- Configuration files

Use this tag to restore to this exact state if needed.

Created: $(date)
"

# Step 4: Create backup branch
echo ""
echo "Step 4: Creating backup branch..."
BACKUP_BRANCH="backup/safe-checkpoint-${CHECKPOINT_DATE}"
git branch "${BACKUP_BRANCH}"

# Step 5: Push to remote (if available)
echo ""
read -p "Do you want to push to remote repository? (y/n): " -n 1 -r
echo ""

if [[ $REPLY =~ ^[Yy]$ ]]
then
    echo "Pushing to remote..."
    git push origin "${BACKUP_BRANCH}"
    git push origin "${CHECKPOINT_NAME}"
    echo "✅ Pushed to remote repository"
else
    echo "⚠️  Skipped remote push (local backup only)"
fi

# Step 6: Create filesystem snapshot manifest
echo ""
echo "Step 5: Creating filesystem manifest..."
MANIFEST_FILE="logs/checkpoints/manifest-${CHECKPOINT_DATE}.txt"
mkdir -p logs/checkpoints

echo "Safe Checkpoint Manifest" > "${MANIFEST_FILE}"
echo "========================" >> "${MANIFEST_FILE}"
echo "" >> "${MANIFEST_FILE}"
echo "Checkpoint Name: ${CHECKPOINT_NAME}" >> "${MANIFEST_FILE}"
echo "Date: $(date)" >> "${MANIFEST_FILE}"
echo "Git Commit: $(git rev-parse HEAD)" >> "${MANIFEST_FILE}"
echo "Git Branch: $(git rev-parse --abbrev-ref HEAD)" >> "${MANIFEST_FILE}"
echo "" >> "${MANIFEST_FILE}"
echo "Files and Directories:" >> "${MANIFEST_FILE}"
echo "=====================" >> "${MANIFEST_FILE}"
find . -type f -not -path "*/node_modules/*" -not -path "*/.git/*" -not -path "*/build/*" -not -path "*/dist/*" >> "${MANIFEST_FILE}"

echo "✅ Manifest created: ${MANIFEST_FILE}"

# Step 7: Create recovery instructions
echo ""
echo "Step 6: Creating recovery instructions..."
RECOVERY_FILE="logs/checkpoints/RECOVERY-${CHECKPOINT_DATE}.md"

cat > "${RECOVERY_FILE}" << EOF
# Recovery Instructions - ${CHECKPOINT_NAME}

**Created:** $(date)  
**Git Commit:** $(git rev-parse HEAD)  
**Git Tag:** ${CHECKPOINT_NAME}  
**Backup Branch:** ${BACKUP_BRANCH}

---

## How to Restore This Checkpoint

### Option 1: Restore using Git tag
\`\`\`bash
cd bulgarian-car-marketplace
git checkout ${CHECKPOINT_NAME}
npm install
npm run build
\`\`\`

### Option 2: Restore using backup branch
\`\`\`bash
cd bulgarian-car-marketplace
git checkout ${BACKUP_BRANCH}
npm install
npm run build
\`\`\`

### Option 3: Restore using commit hash
\`\`\`bash
cd bulgarian-car-marketplace
git checkout $(git rev-parse HEAD)
npm install
npm run build
\`\`\`

### Option 4: Create new branch from checkpoint
\`\`\`bash
cd bulgarian-car-marketplace
git checkout -b my-branch-name ${CHECKPOINT_NAME}
npm install
npm run build
\`\`\`

---

## Verification

After restoring, verify the state:

\`\`\`bash
# Check Git status
git status

# Check current commit
git log -1

# Verify build works
npm run build

# Verify tests pass
npm test

# Check documentation exists
ls -la "../📚 DOCUMENTATION/REFACTORING/"

# Check scripts exist
ls -la "scripts/phase0-preparation/"
\`\`\`

---

## What This Checkpoint Includes

### Documentation:
- 📚 DOCUMENTATION/REFACTORING/README.md
- 📚 DOCUMENTATION/REFACTORING/MASTER_PLAN_V2.md
- 📚 DOCUMENTATION/REFACTORING/EXECUTION_TRACKER.md
- 📚 DOCUMENTATION/REFACTORING/QUICK_START_GUIDE.md
- 📚 DOCUMENTATION/REFACTORING/SUMMARY.md
- 📚 DOCUMENTATION/REFACTORING/INDEX.md
- 📚 DOCUMENTATION/PROJECT_CONSTITUTION.md
- 📚 DOCUMENTATION/START_HERE.md

### Analysis Scripts:
- scripts/phase0-preparation/analyze-imports.ts
- scripts/phase0-preparation/find-duplicate-services.ts
- scripts/phase0-preparation/create-baseline.ts
- scripts/phase0-preparation/README.md

### Source Code:
- All files in src/ directory
- All configuration files
- Package.json and dependencies
- Firebase configuration

### Everything Else:
- All other project files
- Configuration files
- Git history
- Documentation

---

## Emergency Rollback

If something goes wrong and you need to quickly restore:

\`\`\`bash
# Quick restore
cd bulgarian-car-marketplace
git reset --hard ${CHECKPOINT_NAME}
npm install
npm run build

# If that doesn't work, use backup branch
git reset --hard ${BACKUP_BRANCH}
npm install
npm run build
\`\`\`

---

## Checkpoint Information

**Purpose:** Safe state before starting backend refactoring  
**Created By:** Automated checkpoint script  
**Can Be Deleted:** No - keep for safety  
**Expiry:** Never (permanent backup)

---

**This checkpoint ensures you can always return to this exact state!**
EOF

echo "✅ Recovery instructions created: ${RECOVERY_FILE}"

# Step 8: Summary
echo ""
echo "========================================"
echo "✅ Safe Checkpoint Created Successfully!"
echo "========================================"
echo ""
echo "Checkpoint Details:"
echo "  Name: ${CHECKPOINT_NAME}"
echo "  Git Tag: ${CHECKPOINT_NAME}"
echo "  Backup Branch: ${BACKUP_BRANCH}"
echo "  Commit: $(git rev-parse HEAD | cut -c1-8)"
echo ""
echo "Files Created:"
echo "  - Manifest: ${MANIFEST_FILE}"
echo "  - Recovery Instructions: ${RECOVERY_FILE}"
echo ""
echo "To restore this checkpoint later, use:"
echo "  git checkout ${CHECKPOINT_NAME}"
echo ""
echo "Or read recovery instructions:"
echo "  cat ${RECOVERY_FILE}"
echo ""
echo "========================================"
echo "You can now safely proceed with refactoring!"
echo "========================================"

