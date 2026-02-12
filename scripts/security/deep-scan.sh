#!/usr/bin/env bash

# 🔍 DEEP SECURITY SCAN - COMPREHENSIVE VERIFICATION
# ====================================================
# Verifies no secrets remain in repository and code

set -euo pipefail

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

ISSUES=0
CHECKS=0

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}🔍 DEEP SECURITY SCAN${NC}"
echo -e "${BLUE}========================================${NC}\n"

scan_pattern() {
  local name="$1"
  local pattern="$2"
  local exclude_patterns="${3:-.env.example|.template}"
  
  CHECKS=$((CHECKS + 1))
  
  echo -n "[$CHECKS] Scanning for $name... "
  
  if git grep -i "$pattern" -- . 2>/dev/null | grep -v "$exclude_patterns" 2>/dev/null | head -5; then
    echo -e "${RED}⚠️  FOUND${NC}"
    ISSUES=$((ISSUES + 1))
    return 1
  else
    echo -e "${GREEN}✓ CLEAN${NC}"
    return 0
  fi
}

check_file() {
  local name="$1"
  local file_pattern="$2"
  local should_exist="${3:-false}"
  
  CHECKS=$((CHECKS + 1))
  
  echo -n "[$CHECKS] Checking for $name... "
  
  if git ls-files | grep -E "$file_pattern" 2>/dev/null; then
    if [ "$should_exist" = "false" ]; then
      echo -e "${RED}❌ FOUND (should not be committed)${NC}"
      ISSUES=$((ISSUES + 1))
      return 1
    else
      echo -e "${GREEN}✓ Found (as expected)${NC}"
      return 0
    fi
  else
    if [ "$should_exist" = "true" ]; then
      echo -e "${YELLOW}⚠️  NOT FOUND (should be added)${NC}"
      return 1
    else
      echo -e "${GREEN}✓ Not committed (correct)${NC}"
      return 0
    fi
  fi
}

# ============================================================================
# SECTION 1: API KEYS
# ============================================================================
echo -e "${BLUE}SECTION 1: API Keys${NC}\n"

scan_pattern "Google API Keys" "AIzaSy" ".env.example|.template"
scan_pattern "Algolia Keys" "47f00" ".env.example|.template"
scan_pattern "Firebase Keys" "firebaseconfig.*=" ".env.example|.template"
scan_pattern "Generic API Key patterns" "api_key.*=" ".env.example|.template"

echo ""

# ============================================================================
# SECTION 2: CREDENTIALS & PASSWORDS
# ============================================================================
echo -e "${BLUE}SECTION 2: Credentials & Passwords${NC}\n"

scan_pattern "Hardcoded password 885688" "885688" ".env.example|.template|REMOVED"
scan_pattern "Admin emails (globul)" "globul.net.m" ".env.example|.template|REMOVED"
scan_pattern "Admin emails (hamdani)" "hamdani" ".env.example|.template|REMOVED|hamdanialaa" 2>/dev/null || true
scan_pattern "Plaintext password assignments" "password.*=.*['\"]" ".env.example|.template|REPLACED|bcrypt|hash" 2>/dev/null || true

echo ""

# ============================================================================
# SECTION 3: SERVICE CONFIG FILES
# ============================================================================
echo -e "${BLUE}SECTION 3: Service Config Files${NC}\n"

check_file "google-services.json" "google-services.json" false
check_file "GoogleService-Info.plist" "GoogleService-Info.plist" false
check_file ".env.local" "\.env\.local" false
check_file ".env.production" "\.env\.production" false

echo ""

# ============================================================================
# SECTION 4: TEMPLATES & EXAMPLES EXIST
# ============================================================================
echo -e "${BLUE}SECTION 4: Security Templates${NC}\n"

check_file ".env.example" "\.env\.example" true
check_file "google-services template" "google-services.template|google-services.json.template" true
check_file "GoogleService-Info template" "GoogleService-Info.template|GoogleService-Info.plist.template" true

echo ""

# ============================================================================
# SECTION 5: GIT HISTORY (Last 100 commits)
# ============================================================================
echo -e "${BLUE}SECTION 5: Git History Scan (last 100 commits)${NC}\n"

CHECKS=$((CHECKS + 1))
echo -n "[$CHECKS] Scanning recent commits... "

history_issues=0
if git log --all -100 -p | grep -i "AIzaSy\|AIzaSy" 2>/dev/null | head -5; then
  echo -e "${YELLOW}⚠️  FOUND in history${NC}"
  history_issues=$((history_issues + 1))
else
  echo -e "${GREEN}✓ No Google keys${NC}"
fi

CHECKS=$((CHECKS + 1))
echo -n "[$CHECKS] Checking for Algolia in history... "
if git log --all -100 -p | grep "47f00" 2>/dev/null | head -5; then
  echo -e "${YELLOW}⚠️  FOUND in history${NC}"
  history_issues=$((history_issues + 1))
else
  echo -e "${GREEN}✓ No Algolia keys${NC}"
fi

CHECKS=$((CHECKS + 1))
echo -n "[$CHECKS] Checking for password in history... "
if git log --all -100 -p | grep "885688" 2>/dev/null | head -5; then
  echo -e "${YELLOW}⚠️  FOUND in history${NC}"
  history_issues=$((history_issues + 1))
  ISSUES=$((ISSUES + 1))
else
  echo -e "${GREEN}✓ No hardcoded passwords${NC}"
fi

echo ""

# ============================================================================
# SECTION 6: GITIGNORE & SECURITY FILES
# ============================================================================
echo -e "${BLUE}SECTION 6: .gitignore Rules${NC}\n"

CHECKS=$((CHECKS + 1))
echo -n "[$CHECKS] Checking .gitignore completeness... "
missing_rules=0

for rule in ".env" ".env.local" ".env.production" "google-services.json" "GoogleService-Info.plist"; do
  if ! grep -q "$rule" .gitignore 2>/dev/null; then
    echo "Missing: $rule"
    missing_rules=1
  fi
done

if [ $missing_rules -eq 1 ]; then
  echo -e "${RED}⚠️  Incomplete${NC}"
  ISSUES=$((ISSUES + 1))
else
  echo -e "${GREEN}✓ Complete${NC}"
fi

echo ""

# ============================================================================
# SECTION 7: FIRESTORE RULES
# ============================================================================
echo -e "${BLUE}SECTION 7: Firestore Security Rules${NC}\n"

CHECKS=$((CHECKS + 1))
echo -n "[$CHECKS] Checking for hardcoded emails in rules... "

if [ -f "firestore.rules" ]; then
  if grep -E "globul|hamdani" firestore.rules 2>/dev/null | grep -v "function\|comment" > /dev/null; then
    echo -e "${YELLOW}⚠️  Found hardcoded emails${NC}"
    ISSUES=$((ISSUES + 1))
  else
    echo -e "${GREEN}✓ Clean${NC}"
  fi
else
  echo -e "${YELLOW}⚠️  firestore.rules not found${NC}"
fi

echo ""

# ============================================================================
# SECTION 8: CORS CONFIGURATION
# ============================================================================
echo -e "${BLUE}SECTION 8: CORS Configuration${NC}\n"

CHECKS=$((CHECKS + 1))
echo -n "[$CHECKS] Checking CORS configuration... "

if [ -f "public/.htaccess" ]; then
  if grep -q 'Access-Control-Allow-Origin.*\*' public/.htaccess 2>/dev/null; then
    echo -e "${RED}⚠️  CORS set to Allow-All${NC}"
    ISSUES=$((ISSUES + 1))
  else
    echo -e "${GREEN}✓ CORS restricted${NC}"
  fi
else
  echo -e "${YELLOW}⚠️  .htaccess not found${NC}"
fi

echo ""

# ============================================================================
# SECTION 9: NPM PACKAGES
# ============================================================================
echo -e "${BLUE}SECTION 9: Dependencies${NC}\n"

CHECKS=$((CHECKS + 1))
echo -n "[$CHECKS] Checking for detect-secrets... "
if npm list detect-secrets 2>/dev/null | grep -q "detect-secrets"; then
  echo -e "${GREEN}✓ Installed${NC}"
else
  echo -e "${YELLOW}⚠️  Not installed${NC}"
fi

CHECKS=$((CHECKS + 1))
echo -n "[$CHECKS] Checking for pre-commit config... "
if [ -f ".pre-commit-config.yaml" ]; then
  echo -e "${GREEN}✓ Found${NC}"
else
  echo -e "${YELLOW}⚠️  Not found${NC}"
fi

echo ""

# ============================================================================
# SUMMARY
# ============================================================================
echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}📊 SCAN SUMMARY${NC}"
echo -e "${BLUE}========================================${NC}\n"

echo "Total Checks: $CHECKS"
echo "Issues Found: $ISSUES"

if [ $ISSUES -eq 0 ]; then
  echo -e "${GREEN}✅ ALL CHECKS PASSED - Repository is secure!${NC}"
else
  echo -e "${RED}❌ $ISSUES ISSUES FOUND - Review above for details${NC}"
fi

echo ""
echo "Next Steps:"
echo "1. Review issues marked with ⚠️ or ❌ above"
echo "2. If git history cleanup needed: bash remove-secrets-repo.sh <repo_url>"
echo "3. Re-run this script after fixes"
echo ""

exit $ISSUES
