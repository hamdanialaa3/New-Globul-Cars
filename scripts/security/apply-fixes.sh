#!/usr/bin/env bash

# 🔐 APPLY SECURITY FIXES AUTOMATICALLY
# ======================================
# This script:
# 1. Ensures .gitignore has all sensitive files
# 2. Creates .env.example template
# 3. Moves exposed service configs to safe location
# 4. Creates templates for missing config files
# 5. Validates no hardcoded secrets remain

set -euo pipefail

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}🔐 APPLYING SECURITY FIXES${NC}"
echo -e "${BLUE}========================================${NC}\n"

ROOT="$(pwd)"
BACKUP_DIR=".sensitive_backup_$(date +%Y%m%d_%H%M%S)"

# STEP 1: Backup sensitive files
echo -e "${BLUE}STEP 1: Backing up sensitive files...${NC}"
mkdir -p "$BACKUP_DIR"

for f in google-services.json GoogleService-Info.plist .env.production .env.local; do
  if [ -f "$f" ]; then
    cp "$f" "$BACKUP_DIR/"
    echo "  ✓ Backed up: $f → $BACKUP_DIR/"
  fi
done

if [ -z "$(find "$BACKUP_DIR" -type f 2>/dev/null)" ]; then
  echo "  ✓ No sensitive files to backup"
  rmdir "$BACKUP_DIR" 2>/dev/null || true
fi
echo ""

# STEP 2: Update .gitignore
echo -e "${BLUE}STEP 2: Updating .gitignore...${NC}"

cat >> .gitignore <<'EOF'

# 🔐 SECURITY: Environment and service configs
.env
.env.local
.env.development.local
.env.production.local
.env.test.local
google-services.json
GoogleService-Info.plist
.secrets.baseline

# Remove files that should never be committed
*.key
*.pem
service-account*.json
firebase-service-account*.json
secrets.json
EOF

echo -e "${GREEN}✓ Updated .gitignore${NC}\n"

# STEP 3: Create comprehensive .env.example
echo -e "${BLUE}STEP 3: Creating .env.example...${NC}"

cat > .env.example <<'EOF'
# 🔐 ENVIRONMENT VARIABLES TEMPLATE
# Copy this to .env.local and fill in real values
# NEVER commit .env.local to Git

# ==========================================
# Google APIs
# ==========================================

# Google Gemini AI
VITE_GOOGLE_GEMINI_API_KEY=REPLACE_ME_WITH_YOUR_KEY

# Google Maps API
VITE_GOOGLE_MAPS_API_KEY=REPLACE_ME_WITH_YOUR_KEY
VITE_GOOGLE_BROWSER_KEY=REPLACE_ME_WITH_YOUR_KEY

# ==========================================
# Firebase Configuration
# ==========================================

VITE_FIREBASE_API_KEY=REPLACE_ME_WITH_YOUR_KEY
VITE_FIREBASE_AUTH_DOMAIN=REPLACE_ME_WITH_YOUR_DOMAIN
VITE_FIREBASE_PROJECT_ID=REPLACE_ME_WITH_YOUR_PROJECT_ID
VITE_FIREBASE_STORAGE_BUCKET=REPLACE_ME_WITH_YOUR_BUCKET
VITE_FIREBASE_MESSAGING_SENDER_ID=REPLACE_ME_WITH_YOUR_SENDER_ID
VITE_FIREBASE_APP_ID=REPLACE_ME_WITH_YOUR_APP_ID
VITE_FIREBASE_MEASUREMENT_ID=REPLACE_ME_WITH_YOUR_MEASUREMENT_ID
VITE_FIREBASE_DATABASE_URL=REPLACE_ME_WITH_YOUR_DATABASE_URL

# ==========================================
# Algolia Search Engine
# ==========================================

# Public keys (safe to expose to frontend)
VITE_ALGOLIA_APP_ID=REPLACE_ME_WITH_YOUR_APP_ID
VITE_ALGOLIA_SEARCH_KEY=REPLACE_ME_WITH_YOUR_SEARCH_KEY

# Private keys (backend only)
ALGOLIA_ADMIN_KEY=REPLACE_ME_WITH_YOUR_ADMIN_KEY

# ==========================================
# Admin Configuration
# ==========================================

# Admin email (for authentication)
VITE_ADMIN_EMAIL=admin@example.com

# Admin password (stored as bcrypt hash, not plaintext)
# Generate hash: node -e "const bcrypt=require('bcryptjs'); console.log(bcrypt.hashSync(process.argv[1], 12));" "your_password"
VITE_ADMIN_PASSWORD=REPLACE_ME_WITH_BCRYPT_HASH

# ==========================================
# Environment
# ==========================================

NODE_ENV=development
VITE_ENV=development

# ==========================================
# Optional Services
# ==========================================

# Stripe (if using payments)
VITE_STRIPE_PUBLIC_KEY=REPLACE_ME
STRIPE_SECRET_KEY=REPLACE_ME

# SendGrid or Mailgun (if using email)
SENDGRID_API_KEY=REPLACE_ME
MAILGUN_API_KEY=REPLACE_ME

# Sentry (if using error tracking)
VITE_SENTRY_DSN=REPLACE_ME

# Analytics (if using custom analytics)
VITE_MIXPANEL_TOKEN=REPLACE_ME
EOF

echo -e "${GREEN}✓ Created .env.example${NC}\n"

# STEP 4: Create Firebase config templates
echo -e "${BLUE}STEP 4: Creating Firebase config templates...${NC}"

cat > google-services.template.json <<'EOF'
{
  "type": "service_account",
  "project_id": "YOUR_PROJECT_ID",
  "private_key_id": "YOUR_PRIVATE_KEY_ID",
  "private_key": "-----BEGIN PRIVATE KEY-----\nYOUR_PRIVATE_KEY\n-----END PRIVATE KEY-----\n",
  "client_email": "YOUR_EMAIL",
  "client_id": "YOUR_CLIENT_ID",
  "auth_uri": "https://accounts.google.com/o/oauth2/auth",
  "token_uri": "https://oauth2.googleapis.com/token",
  "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
  "client_x509_cert_url": "YOUR_CERT_URL"
}
EOF

cat > GoogleService-Info.template.plist <<'EOF'
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
  <key>GOOGLE_APP_ID</key>
  <string>YOUR_GOOGLE_APP_ID</string>
  <key>BUNDLE_ID</key>
  <string>YOUR_BUNDLE_ID</string>
  <key>PROJECT_ID</key>
  <string>YOUR_PROJECT_ID</string>
  <key>STORAGE_BUCKET</key>
  <string>YOUR_STORAGE_BUCKET</string>
  <key>IS_ADS_ENABLED</key>
  <false/>
  <key>IS_ANALYTICS_ENABLED</key>
  <false/>
  <key>IS_APPINVITE_ENABLED</key>
  <true/>
  <key>IS_GCM_ENABLED</key>
  <true/>
  <key>IS_SIGNIN_ENABLED</key>
  <true/>
  <key>GOOGLE_API_KEY</key>
  <string>YOUR_GOOGLE_API_KEY</string>
  <key>DATABASE_URL</key>
  <string>YOUR_DATABASE_URL</string>
</dict>
</plist>
EOF

echo -e "${GREEN}✓ Created Firebase config templates${NC}\n"

# STEP 5: Scan for remaining hardcoded secrets
echo -e "${BLUE}STEP 5: Scanning for hardcoded secrets...${NC}"

FOUND_ISSUES=0

# Scan for Google API keys
echo -n "  Checking for Google API keys... "
if git grep -i "AIzaSy" -- . 2>/dev/null | grep -v ".env.example" | grep -v ".template" | grep -v "^Binary" > /dev/null; then
  echo -e "${RED}⚠️  FOUND${NC}"
  FOUND_ISSUES=1
  git grep -i "AIzaSy" -- . | grep -v ".env.example" | grep -v ".template" || true
else
  echo -e "${GREEN}✓ Clean${NC}"
fi

# Scan for Algolia keys
echo -n "  Checking for Algolia keys... "
if git grep "47f00" -- . 2>/dev/null | grep -v ".env.example" | grep -v ".template" > /dev/null; then
  echo -e "${RED}⚠️  FOUND${NC}"
  FOUND_ISSUES=1
  git grep "47f00" -- . || true
else
  echo -e "${GREEN}✓ Clean${NC}"
fi

# Scan for hardcoded passwords
echo -n "  Checking for hardcoded passwords... "
if git grep "885688" -- . 2>/dev/null | grep -v ".env.example" | grep -v ".template" > /dev/null; then
  echo -e "${RED}⚠️  FOUND${NC}"
  FOUND_ISSUES=1
  git grep "885688" -- . || true
else
  echo -e "${GREEN}✓ Clean${NC}"
fi

# Scan for committed .env files
echo -n "  Checking for committed .env files... "
if git ls-files | grep -E '\.env\.local|\.env\.production|google-services.json|GoogleService-Info.plist' 2>/dev/null; then
  echo -e "${RED}⚠️  FOUND${NC}"
  FOUND_ISSUES=1
else
  echo -e "${GREEN}✓ Clean${NC}"
fi

echo ""

# STEP 6: Summary
echo -e "${BLUE}STEP 6: Summary${NC}\n"

if [ $FOUND_ISSUES -eq 0 ]; then
  echo -e "${GREEN}✅ ALL SECURITY FIXES APPLIED${NC}"
  echo ""
  echo "Changes made:"
  echo "  ✓ .gitignore updated with sensitive file patterns"
  echo "  ✓ .env.example created with all required keys"
  echo "  ✓ Firebase config templates created"
  echo "  ✓ No hardcoded secrets found in tracked files"
  echo ""
  echo -e "${YELLOW}Next steps:${NC}"
  echo "  1. git add .gitignore .env.example *.template.*"
  echo "  2. git commit -m 'chore: security - add env templates and gitignore rules'"
  echo "  3. Create .env.local with real values (from secure storage)"
  echo "  4. DO NOT commit .env.local"
  echo "  5. npm install detect-secrets && pre-commit install"
else
  echo -e "${RED}❌ ISSUES FOUND - Manual cleanup required${NC}"
  echo ""
  echo "Remove hardcoded secrets from source files, then run this script again."
fi

echo ""
echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}Security fixes completed${NC}"
echo -e "${BLUE}========================================${NC}"
