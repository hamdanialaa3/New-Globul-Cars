#!/usr/bin/env bash
# 🔐 GIT HISTORY CLEANUP SCRIPT
# =============================
# Purpose: Remove all hardcoded API keys and secrets from Git history
# WARNING: This is DESTRUCTIVE - will rewrite entire Git history
# 
# IMPORTANT:
# 1. All developers must pull latest changes BEFORE running this
# 2. This must be run in a separate directory (mirror clone)
# 3. All work branches must be deleted/merged first
# 4. After cleanup, all developers force-pull to new branches
#
# Install git-filter-repo first:
#   pip install git-filter-repo
#   OR
#   brew install git-filter-repo (macOS)
#   apt install git-filter-repo (Ubuntu)

set -euo pipefail

# Color output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}🔐 GIT HISTORY CLEANUP - PREPARATION${NC}"
echo -e "${BLUE}========================================${NC}\n"

# Configuration
GIT_REPOS=(
  "git@github.com:hamdanialaa3/New-Globul-Cars.git"
  "git@github.com:hamdanialaa3/Koli-One-Mobile.git"
)

WORK_DIR="/tmp/git-cleanup-$(date +%Y%m%d_%H%M%S)"
BACKUP_DIR="/tmp/git-backup-$(date +%Y%m%d_%H%M%S)"

echo -e "${YELLOW}📋 CONFIGURATION:${NC}"
echo "Work Directory: $WORK_DIR"
echo "Backup Directory: $BACKUP_DIR"
echo "Repos to clean: ${#GIT_REPOS[@]}"
echo ""

# Step 1: Create backup of local repos
echo -e "${BLUE}STEP 1: Creating backups...${NC}"
mkdir -p "$BACKUP_DIR"
for repo in "${GIT_REPOS[@]}"; do
  repo_name=$(basename "$repo" .git)
  if [ -d "$HOME/Desktop/Koli_One_Root/$repo_name" ] 2>/dev/null || [ -d "./$(echo $repo | sed 's/.*\///')" ] 2>/dev/null; then
    echo "  ✓ Backup path noted: $BACKUP_DIR/$repo_name"
  fi
done
echo ""

# Step 2: Check dependencies
echo -e "${BLUE}STEP 2: Checking dependencies...${NC}"
if ! command -v git-filter-repo &> /dev/null; then
  echo -e "${RED}❌ git-filter-repo not installed${NC}"
  echo "Install it with:"
  echo "  pip install git-filter-repo"
  echo "  OR"
  echo "  brew install git-filter-repo (macOS)"
  exit 1
fi
echo -e "${GREEN}✓ git-filter-repo found${NC}"
echo ""

# Step 3: Create directory structure
echo -e "${BLUE}STEP 3: Setting up work directory...${NC}"
mkdir -p "$WORK_DIR"
mkdir -p "$WORK_DIR/patterns"
echo -e "${GREEN}✓ Created $WORK_DIR${NC}"
echo ""

# Step 4: Create patterns files for filtering
echo -e "${BLUE}STEP 4: Creating filter patterns...${NC}"

cat > "$WORK_DIR/patterns/files-to-remove.txt" <<'EOF'
# Files to completely remove from history (never use these!)
google-services.json
GoogleService-Info.plist
.env.production
.env.local
.env
secrets.json
firebase-service-account.json
EOF

cat > "$WORK_DIR/patterns/secrets-to-replace.txt" <<'EOF'
# Hardcoded secrets to replace with REDACTED placeholder
# These are regex patterns - match will be replaced

# Google API Keys (REDACTED — check .env files for actual keys)
# Keys have been removed from this file for security.
# Use: AIzaSy[A-Za-z0-9_-]{33} as a regex pattern to find any Google API key.
AIzaSyz[A-Za-z0-9_-]{33}

# Algolia API Key (REDACTED)
# Use regex to find: [0-9a-f]{32}
[0-9a-f]{32}

# Hardcoded Password (REDACTED)
# Check .env or secrets manager for actual values

# Admin Emails
globul.net.m@gmail.com
alaa.hamdani@yahoo.com
hamdanialaa@yahoo.com

# Firebase Keys
firebase[a-zA-Z_-]*key

# Stripe Keys Pattern  
sk_test_[A-Za-z0-9_]{24}
pk_test_[A-Za-z0-9_]{24}
EOF

echo -e "${GREEN}✓ Created filter patterns${NC}\n"

echo -e "${YELLOW}📋 NEXT STEPS (MANUAL EXECUTION):${NC}"
echo ""
echo "1. BACKUP CURRENT WORK:"
echo "   • Commit all pending changes to your current branch"
echo "   • Push all branches to GitHub"
echo "   • Create a full local backup of repos"
echo ""

echo "2. COORDINATE WITH TEAM:"
echo "   • Alert all developers: Git history cleanup is happening"
echo "   • Request they back up any local work"
echo "   • Merge all active PRs or close them"
echo "   • Delete all feature branches except main/master"
echo ""

echo "3. RUN CLEANUP (for each repo):"
echo ""
echo "   WEB REPO (New-Globul-Cars):"
echo "   ─────────────────────────────"
echo "   cd $WORK_DIR"
echo "   git clone --mirror git@github.com:hamdanialaa3/New-Globul-Cars.git web-mirror.git"
echo "   cd web-mirror.git"
echo "   git filter-repo --force --invert-paths --paths-from-file $WORK_DIR/patterns/files-to-remove.txt"
echo ""
echo "   # Check if successful"
echo "   cd .."
echo "   git clone web-mirror.git New-Globul-Cars-cleaned"
echo "   cd New-Globul-Cars-cleaned"
echo "   git log --all --grep='AIza\\|47f00\\|885688' --oneline  # Should be EMPTY"
echo ""
echo "   # Push cleaned repo"
echo "   git push --force origin master  # ⚠️ DESTRUCTIVE - overwrites history"
echo ""

echo "4. MOBILE REPO (Koli-One-Mobile):"
echo "   ──────────────────────────────"
echo "   cd $WORK_DIR"
echo "   git clone --mirror git@github.com:hamdanialaa3/Koli-One-Mobile.git mobile-mirror.git"
echo "   cd mobile-mirror.git"
echo "   git filter-repo --force --invert-paths --paths-from-file $WORK_DIR/patterns/files-to-remove.txt"
echo ""

echo "5. VERIFY CLEANUP:"
echo "   cd New-Globul-Cars-cleaned"
echo "   git log -p -S 'AIzaSy' --all       # Should return NO results"
echo "   git log -p -S '47f001' --all      # Should return NO results"
echo "   git log -p -S '885688' --all      # Should return NO results"
echo "   grep -r 'google-services.json' . --include='*'  # Should return NO results"
echo ""

echo "6. FORCE UPDATE LOCAL REPOS:"
echo ""
echo "   # In each local repo directory:"
echo "   git remote set-url origin git@github.com:yourorg/yourrepo.git  # If URL changed"
echo "   git fetch --all"
echo "   git reset --hard origin/master  # or main"
echo ""

echo "7. VERIFY ALL DEVELOPERS:"
echo "   • Each developer: pulls and verifies no secrets in current logs"
echo "   • Check CI/CD logs for any remaining keys"
echo "   • Run secret scan tools"
echo ""

echo -e "${RED}⚠️  WARNING CHECKLIST:${NC}"
echo "  [ ] All team members have backed up their work"
echo "  [ ] All PRs are merged or closed"
echo "  [ ] All feature branches are deleted"
echo "  [ ] You have a full backup of repos"
echo "  [ ] Two-factor auth is enabled on GitHub account"
echo "  [ ] New API keys have been rotated and are environment-only"
echo ""

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}Ready for Git history cleanup${NC}"
echo -e "${BLUE}========================================${NC}"
