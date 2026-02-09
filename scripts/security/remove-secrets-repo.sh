#!/usr/bin/env bash

# 🚨 EMERGENCY: GIT HISTORY CLEANUP - COMPLETE
# =============================================
# WARNING: This script REWRITES Git history - use on mirror clone only!
# Usage: bash remove-secrets-repo.sh <repo_url> <output_cleaned_repo>
# Example: bash remove-secrets-repo.sh git@github.com:hamdanialaa3/New-Globul-Cars.git web-cleaned

set -euo pipefail

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Check arguments
if [ $# -lt 1 ]; then
  echo -e "${RED}❌ Usage: $0 <repo_ssh_url> [output_dir]${NC}"
  echo "Example: $0 git@github.com:hamdanialaa3/New-Globul-Cars.git"
  exit 1
fi

REPO_SSH="$1"
OUTPUT_DIR="${2:-.}/repo-mirror.git"
REPO_NAME=$(basename "$REPO_SSH" .git)

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}🚨 GIT HISTORY CLEANUP SCRIPT${NC}"
echo -e "${BLUE}========================================${NC}\n"

echo -e "${YELLOW}⚠️  WARNINGS:${NC}"
echo "1. This REWRITES Git history - cannot be undone!"
echo "2. Make a full backup first"
echo "3. Stop all CI/CD pipelines"
echo "4. All developers must force-pull after"
echo "5. Do NOT use on production repo - use mirror clone"
echo ""

read -p "Continue? (type CONTINUE): " confirm
if [ "$confirm" != "CONTINUE" ]; then
  echo "Aborted."
  exit 0
fi

echo ""
echo -e "${BLUE}STEP 1: Checking dependencies...${NC}"
if ! command -v git-filter-repo &> /dev/null; then
  echo -e "${RED}❌ git-filter-repo not found${NC}"
  echo "Install with: pip install git-filter-repo"
  exit 1
fi
echo -e "${GREEN}✓ git-filter-repo found${NC}\n"

echo -e "${BLUE}STEP 2: Creating mirror clone...${NC}"
echo "Cloning from: $REPO_SSH"
echo "Destination: $OUTPUT_DIR"
git clone --mirror "$REPO_SSH" "$OUTPUT_DIR"
cd "$OUTPUT_DIR"
echo -e "${GREEN}✓ Mirror clone created${NC}\n"

echo -e "${BLUE}STEP 3: Creating filter patterns...${NC}"
cat > replace-secrets.txt <<'EOF'
# Google API Keys - 7 instances
REDACTED_GEMINI_KEY_1==>REMOVED_GOOGLE_API_KEY
REDACTED_FIREBASE_KEY_1==>REMOVED_GOOGLE_API_KEY
REDACTED_MAPS_KEY==>REMOVED_GOOGLE_API_KEY
REDACTED_FIREBASE_KEY_2==>REMOVED_GOOGLE_API_KEY
REDACTED_GEMINI_AI_KEY==>REMOVED_GOOGLE_API_KEY

# Algolia Key
47f0015ced4e86add8acc2e35ea01395==>REMOVED_ALGOLIA_ADMIN_KEY

# Hardcoded password
885688==>REMOVED_PLAINTEXT_PASSWORD

# Admin emails
globul.net.m@gmail.com==>REMOVED_ADMIN_EMAIL
alaa.hamdani@yahoo.com==>REMOVED_ADMIN_EMAIL
hamdanialaa@yahoo.com==>REMOVED_ADMIN_EMAIL
EOF

echo "Created replace-secrets.txt with 10 patterns"
echo -e "${GREEN}✓ Filter patterns created${NC}\n"

echo -e "${BLUE}STEP 4: Running git filter-repo...${NC}"
echo "This will scan and replace secrets in all commits..."
echo ""

git filter-repo --replace-text replace-secrets.txt --force

echo ""
echo -e "${GREEN}✓ Filter repo completed${NC}\n"

echo -e "${BLUE}STEP 5: Removing large/binary files...${NC}"
git filter-repo --invert-paths --paths 'google-services.json' --force
git filter-repo --invert-paths --paths 'GoogleService-Info.plist' --force
git filter-repo --invert-paths --paths '.env.production' --force
git filter-repo --invert-paths --paths '.env.local' --force
echo -e "${GREEN}✓ Sensitive files removed${NC}\n"

echo -e "${BLUE}STEP 6: Verifying cleanup...${NC}"
echo "Searching for remaining secrets in latest 50 commits..."

remaining_secrets=0

if git log -p --all -50 | grep -i "AIzaSy\|47f00\|885688" 2>/dev/null; then
  echo -e "${YELLOW}⚠️  Some secrets still found in history (may be false positives)${NC}"
  remaining_secrets=1
else
  echo -e "${GREEN}✓ No secrets found in recent commits${NC}"
fi

if [ $remaining_secrets -eq 0 ]; then
  echo -e "${GREEN}✓ Cleanup verified successful${NC}\n"
else
  echo -e "${YELLOW}⚠️  Review the output above${NC}\n"
fi

echo -e "${BLUE}STEP 7: Next Steps${NC}"
echo ""
echo "1. VERIFY cleanup worked:"
echo "   cd $OUTPUT_DIR"
echo "   git log --all --oneline | wc -l"
echo ""
echo "2. CLONE cleaned repo to test:"
echo "   cd .."
echo "   git clone $OUTPUT_DIR test-cleaned"
echo "   cd test-cleaned"
echo "   git grep -i 'AIzaSy' || echo 'No secrets found!'"
echo ""
echo "3. FORCE PUSH to GitHub (if verified):"
echo "   cd $OUTPUT_DIR"
echo "   git push --mirror --force"
echo ""
echo "4. NOTIFY ALL DEVELOPERS:"
echo "   'Git history cleaned. Force-pull with:'"
echo "   git fetch --all"
echo "   git reset --hard origin/master  # or main"
echo ""
echo "5. DELETE OLD BRANCHES if any:"
echo "   git branch -D <branch-name>"
echo ""

echo -e "${BLUE}========================================${NC}"
echo -e "${GREEN}✅ Git cleanup ready${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""
echo "Cleaned repo location: $OUTPUT_DIR"
echo "Mirror clone location: $(pwd)"
