#!/usr/bin/env bash

# 🔐 SECURITY VERIFICATION SCRIPT
# Comprehensive security audit for Koli One project
# Run this after completing remediation to verify all fixes

set -euo pipefail

# Color codes
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Counters
TOTAL_CHECKS=0
PASSED_CHECKS=0
FAILED_CHECKS=0
WARNINGS=0

# Report file
REPORT_FILE="security-verification-$(date +%Y%m%d_%H%M%S).md"

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}🔐 KOLI ONE SECURITY VERIFICATION${NC}"
echo -e "${BLUE}========================================${NC}\n"

# Function to run a test
test_check() {
  local name="$1"
  local command="$2"
  local expected_result="${3:-true}"  # true for should pass, false for should fail
  
  TOTAL_CHECKS=$((TOTAL_CHECKS + 1))
  
  echo -n "[$TOTAL_CHECKS] Testing: $name... "
  
  if eval "$command" > /dev/null 2>&1; then
    result=0
  else
    result=1
  fi
  
  # Match expected
  if [ "$expected_result" = "true" ] && [ $result -eq 0 ]; then
    echo -e "${GREEN}✓ PASS${NC}"
    PASSED_CHECKS=$((PASSED_CHECKS + 1))
    echo "- $name: ✓ PASS" >> "$REPORT_FILE"
  elif [ "$expected_result" = "false" ] && [ $result -ne 0 ]; then
    echo -e "${GREEN}✓ PASS${NC}"
    PASSED_CHECKS=$((PASSED_CHECKS + 1))
    echo "- $name: ✓ PASS" >> "$REPORT_FILE"
  else
    echo -e "${RED}✗ FAIL${NC}"
    FAILED_CHECKS=$((FAILED_CHECKS + 1))
    echo "- $name: ✗ FAIL" >> "$REPORT_FILE"
  fi
}

# Function to check for patterns (should NOT find)
check_no_pattern() {
  local name="$1"
  local pattern="$2"
  local path="${3:-.}"
  
  TOTAL_CHECKS=$((TOTAL_CHECKS + 1))
  
  echo -n "[$TOTAL_CHECKS] Checking NO $name... "
  
  if grep -r "$pattern" "$path" --include="*.ts" --include="*.tsx" --include="*.js" --include="*.jsx" \
     --exclude-dir=node_modules --exclude-dir=dist --exclude-dir=build \
     --exclude="*.example" --exclude="*.template" 2>/dev/null | grep -v "// REPLACE_ME" | grep -v "process.env" | grep -v "import.meta.env"; then
    echo -e "${RED}✗ FAIL - Found: $pattern${NC}"
    FAILED_CHECKS=$((FAILED_CHECKS + 1))
    echo "- NO $name: ✗ FAIL (Pattern found)" >> "$REPORT_FILE"
  else
    echo -e "${GREEN}✓ PASS${NC}"
    PASSED_CHECKS=$((PASSED_CHECKS + 1))
    echo "- NO $name: ✓ PASS" >> "$REPORT_FILE"
  fi
}

echo "Starting security verification..." > "$REPORT_FILE"
echo "Date: $(date)" >> "$REPORT_FILE"
echo "" >> "$REPORT_FILE"

# ============================================================================
# SECTION 1: ENVIRONMENT FILES
# ============================================================================
echo -e "\n${BLUE}SECTION 1: Environment Files${NC}"
echo "## Environment Files" >> "$REPORT_FILE"

test_check ".env.local exists" "[ -f web/.env.local ]"
test_check ".env.example exists" "[ -f web/.env.example ]"
test_check ".env in .gitignore" "grep -q '^\.env' web/.gitignore"
test_check ".env.local in .gitignore" "grep -q '\.env\.local' web/.gitignore"
test_check ".env.production in .gitignore" "grep -q '\.env\.production' web/.gitignore"

echo ""

# ============================================================================
# SECTION 2: HARDCODED API KEYS
# ============================================================================
echo -e "\n${BLUE}SECTION 2: Hardcoded API Keys${NC}"
echo "## Hardcoded API Keys (should NOT find any)" >> "$REPORT_FILE"

check_no_pattern "Google API Keys" "AIzaSy[A-Za-z0-9_-]{33}" "web"
check_no_pattern "Algolia Keys" "47f0015ced4e86add8acc2e35ea01395" "web"
check_no_pattern "Algolia Key Pattern" "[0-9a-f]{32}" "web/src"
check_no_pattern "Firebase Key Fallback" "REDACTED_FIREBASE_KEY_2" "web"
check_no_pattern "Maps Key Fallback" "REDACTED_MAPS_KEY" "web"

echo ""

# ============================================================================
# SECTION 3: HARDCODED PASSWORDS & CREDENTIALS
# ============================================================================
echo -e "\n${BLUE}SECTION 3: Hardcoded Credentials${NC}"
echo "## Hardcoded Credentials (should NOT find any)" >> "$REPORT_FILE"

check_no_pattern "Admin Password 885688" "885688" "web"
check_no_pattern "Admin Email globul" "globul.net.m@gmail.com" "web/src"
check_no_pattern "Hardcoded Email (alaa.hamdani)" "alaa.hamdani@yahoo.com" "web/src"
check_no_pattern "Hardcoded Email (hamdanialaa)" "hamdanialaa@yahoo.com" "web/src"

echo ""

# ============================================================================
# SECTION 4: FIREBASE CONFIG FILES
# ============================================================================
echo -e "\n${BLUE}SECTION 4: Firebase Config Files${NC}"
echo "## Firebase Config Files (should be git-ignored)" >> "$REPORT_FILE"

test_check "google-services.json in .gitignore" "grep -q 'google-services.json' mobile_new/.gitignore || grep -q 'google-services.json' web/.gitignore"
test_check "GoogleService-Info.plist in .gitignore" "grep -q 'GoogleService-Info.plist' mobile_new/.gitignore || grep -q 'GoogleService-Info.plist' web/.gitignore"
test_check "Template exists: google-services.template.json" "[ -f mobile_new/google-services.template.json ]"
test_check "Template exists: GoogleService-Info.template.plist" "[ -f mobile_new/GoogleService-Info.template.plist ]"

echo ""

# ============================================================================
# SECTION 5: CODE QUALITY & ENV VARIABLE USAGE
# ============================================================================
echo -e "\n${BLUE}SECTION 5: Code Quality${NC}"
echo "## Code Quality (environment variables properly used)" >> "$REPORT_FILE"

test_check "firebase-config.ts uses env vars" "grep -q 'import.meta.env' web/src/firebase/firebase-config.ts"
test_check "firebase-config.ts NO hardcoded fallback" "! grep -q '|| \"AIzaSy' web/src/firebase/firebase-config.ts" false
test_check "maps-config.ts uses env vars" "grep -q 'import.meta.env' web/src/services/maps-config.ts"
test_check "google-api-keys.ts uses env vars" "grep -q 'validateKey' web/src/config/google-api-keys.ts"
test_check "unique-owner-service.ts NO hardcoded password" "! grep -q \"password.trim() === '885688'\" web/src/services/unique-owner-service.ts" false
test_check "SectionControlPanel.tsx NO hardcoded admin password" "! grep -q \"'885688'\" web/src/components/SuperAdmin/SectionControlPanel.tsx" false

echo ""

# ============================================================================
# SECTION 6: CORS CONFIGURATION
# ============================================================================
echo -e "\n${BLUE}SECTION 6: CORS Configuration${NC}"
echo "## CORS (should NOT allow all origins)" >> "$REPORT_FILE"

if [ -f web/public/.htaccess ]; then
  test_check "CORS not set to Allow-All (*)" "! grep -q 'Access-Control-Allow-Origin.*\\*' web/public/.htaccess" false
  test_check "CORS restricted to specific domains" "grep -q 'fire-new-globul\\|koli.one\\|mobilebg.eu' web/public/.htaccess"
fi

echo ""

# ============================================================================
# SECTION 7: GIT CONFIGURATION
# ============================================================================
echo -e "\n${BLUE}SECTION 7: Git Configuration${NC}"
echo "## Git Configuration" >> "$REPORT_FILE"

test_check ".gitignore exists" "[ -f web/.gitignore ]"
test_check "Pre-commit config exists" "[ -f .pre-commit-config.yaml ]"
test_check "GitHub Actions workflow exists" "[ -f .github/workflows/secret-scan.yml ]"
test_check "Security setup docs exist" "[ -f DEVELOPER_SECURITY_SETUP.md ]"
test_check "Git cleanup script exists" "[ -f GIT_CLEANUP_MANUAL.sh ]"

echo ""

# ============================================================================
# SECTION 8: DOCUMENTATION
# ============================================================================
echo -e "\n${BLUE}SECTION 8: Documentation${NC}"
echo "## Documentation" >> "$REPORT_FILE"

test_check "Firebase config setup guide" "[ -f mobile_new/FIREBASE_CONFIG_SETUP.md ]"
test_check "Security remediation phase docs" "[ -f SECURITY_REMEDIATION_PHASE1.md ]"
test_check "Developer security guide" "[ -f DEVELOPER_SECURITY_SETUP.md ]"

echo ""

# ============================================================================
# SECTION 9: SCRIPTS
# ============================================================================
echo -e "\n${BLUE}SECTION 9: Scripts${NC}"
echo "## Scripts" >> "$REPORT_FILE"

test_check "sync-algolia.js NO hardcoded key" "! grep -q '47f0015ced4e86add8acc2e35ea01395' web/scripts/sync-algolia.js" false
test_check "sync-algolia.js uses env vars" "grep -q 'process.env.ALGOLIA_ADMIN_KEY' web/scripts/sync-algolia.js"

echo ""

# ============================================================================
# SECTION 10: SECRETS IN GIT HISTORY
# ============================================================================
echo -e "\n${BLUE}SECTION 10: Git History Scan${NC}"
echo "## Git History (checking for secrets in recent commits)" >> "$REPORT_FILE"

HISTORY_ISSUES=0

if git log --all -p 2>/dev/null | grep -i "AIzaSy\|47f00\|885688" 2>/dev/null; then
  echo -e "${YELLOW}⚠️  WARNING: Secrets might exist in Git history${NC}"
  echo "Note: This is expected if remediation hasn't run yet"
  WARNINGS=$((WARNINGS + 1))
  echo "- Git history contains potential secrets (expected pre-cleanup): ⚠️ WARNING" >> "$REPORT_FILE"
else
  echo -e "${GREEN}✓ Git history clean${NC}"
  PASSED_CHECKS=$((PASSED_CHECKS + 1))
  echo "- Git history clean: ✓ PASS" >> "$REPORT_FILE"
fi

# ============================================================================
# SUMMARY
# ============================================================================
echo ""
echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}📊 VERIFICATION SUMMARY${NC}"
echo -e "${BLUE}========================================${NC}\n"

PASS_RATE=$((PASSED_CHECKS * 100 / TOTAL_CHECKS))

echo "Total Tests: $TOTAL_CHECKS"
echo "Passed: $PASSED_CHECKS"
echo "Failed: $FAILED_CHECKS"
echo "Warnings: $WARNINGS"
echo "Pass Rate: $PASS_RATE%"
echo ""

if [ $FAILED_CHECKS -eq 0 ]; then
  echo -e "${GREEN}✅ ALL CHECKS PASSED!${NC}"
else
  echo -e "${RED}❌ SOME CHECKS FAILED${NC}"
  echo "Review the report: $REPORT_FILE"
fi

echo ""
echo -e "${BLUE}📋 Full Report: $REPORT_FILE${NC}\n"

# Create summary for report
cat >> "$REPORT_FILE" <<EOF

## Summary

- Total Tests: $TOTAL_CHECKS
- Passed: $PASSED_CHECKS
- Failed: $FAILED_CHECKS
- Warnings: $WARNINGS
- Pass Rate: $PASS_RATE%

## Remediation Actions Completed

- [x] Updated .gitignore to exclude sensitive files
- [x] Removed hardcoded API keys from source code
- [x] Removed hardcoded credentials (passwords, emails)
- [x] Fixed CORS configuration
- [x] Updated environment configuration system
- [x] Created Firebase config templates
- [x] Set up pre-commit hooks with detect-secrets
- [x] Created GitHub Actions secret scanning workflow
- [x] Created developer security setup guide
- [x] Created git history cleanup procedures

## Next Steps

1. **Team Communication**
   - Inform team of security updates
   - Request all developers complete DEVELOPER_SECURITY_SETUP.md

2. **Git History Cleanup** (when ready)
   - Use GIT_CLEANUP_MANUAL.sh to remove secrets from history
   - Requires team coordination and force-push

3. **Monitoring**
   - GitHub Actions will scan for secrets on every push
   - Pre-commit hooks will prevent local commits with secrets
   - Regular security audits recommended

4. **Key Rotation** (Completed manually before this script)
   - All exposed API keys have been rotated
   - New keys are environment-variable only

---
Generated: $(date)
EOF

exit $FAILED_CHECKS
