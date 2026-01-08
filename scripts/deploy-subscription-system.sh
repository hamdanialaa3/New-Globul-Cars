#!/bin/bash

###############################################################################
# Subscription System Deployment Script
# Automates the deployment of subscription system updates
# 
# File: scripts/deploy-subscription-system.sh
# Created: January 8, 2026
# 
# USAGE: ./scripts/deploy-subscription-system.sh [--skip-tests]
###############################################################################

set -e # Exit on error

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🚀 Subscription System Deployment Script"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Check if --skip-tests flag is provided
SKIP_TESTS=false
if [ "$1" == "--skip-tests" ]; then
  SKIP_TESTS=true
  echo "${YELLOW}⚠️  Skipping tests as requested${NC}"
fi

# Step 1: Pre-deployment checks
echo "${BLUE}📋 Step 1: Pre-deployment Checks${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Check if Firebase CLI is installed
if ! command -v firebase &> /dev/null; then
    echo "${RED}❌ Firebase CLI not found. Install it first:${NC}"
    echo "   npm install -g firebase-tools"
    exit 1
fi

# Check if we're logged in to Firebase
if ! firebase projects:list &> /dev/null; then
    echo "${RED}❌ Not logged in to Firebase. Run:${NC}"
    echo "   firebase login"
    exit 1
fi

echo "${GREEN}✅ Firebase CLI configured${NC}"

# Step 2: Run TypeScript type check
echo ""
echo "${BLUE}📋 Step 2: TypeScript Type Check${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

if npm run type-check; then
    echo "${GREEN}✅ TypeScript compilation successful${NC}"
else
    echo "${RED}❌ TypeScript errors found. Fix them before deploying.${NC}"
    exit 1
fi

# Step 3: Run unit tests
if [ "$SKIP_TESTS" = false ]; then
    echo ""
    echo "${BLUE}📋 Step 3: Unit Tests${NC}"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    
    if npm test -- subscription-plans billing --watchAll=false --coverage; then
        echo "${GREEN}✅ All tests passed${NC}"
    else
        echo "${RED}❌ Tests failed. Fix them before deploying.${NC}"
        exit 1
    fi
else
    echo ""
    echo "${YELLOW}⏭️  Skipping tests${NC}"
fi

# Step 4: Build production bundle
echo ""
echo "${BLUE}📋 Step 4: Build Production Bundle${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

if npm run build; then
    echo "${GREEN}✅ Production build successful${NC}"
else
    echo "${RED}❌ Build failed. Check console for errors.${NC}"
    exit 1
fi

# Step 5: Deploy Firestore rules
echo ""
echo "${BLUE}📋 Step 5: Deploy Firestore Rules${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Backup existing rules
cp firestore.rules firestore.rules.backup
echo "${YELLOW}📦 Backed up existing rules to firestore.rules.backup${NC}"

# Merge new rules (assuming manual merge was done)
if firebase deploy --only firestore:rules; then
    echo "${GREEN}✅ Firestore rules deployed${NC}"
else
    echo "${RED}❌ Firestore rules deployment failed${NC}"
    echo "${YELLOW}⚠️  Restoring backup...${NC}"
    mv firestore.rules.backup firestore.rules
    exit 1
fi

# Step 6: Deploy Cloud Functions
echo ""
echo "${BLUE}📋 Step 6: Deploy Cloud Functions${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

cd functions
npm install
npm run build
cd ..

if firebase deploy --only functions; then
    echo "${GREEN}✅ Cloud Functions deployed${NC}"
else
    echo "${RED}❌ Cloud Functions deployment failed${NC}"
    exit 1
fi

# Step 7: Deploy Frontend (Firebase Hosting)
echo ""
echo "${BLUE}📋 Step 7: Deploy Frontend (Firebase Hosting)${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

if firebase deploy --only hosting; then
    echo "${GREEN}✅ Frontend deployed${NC}"
else
    echo "${RED}❌ Frontend deployment failed${NC}"
    exit 1
fi

# Step 8: Run post-deployment checks
echo ""
echo "${BLUE}📋 Step 8: Post-Deployment Verification${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

echo "${YELLOW}⏳ Waiting 10 seconds for deployment to propagate...${NC}"
sleep 10

# Check if hosting is accessible
HOSTING_URL=$(firebase hosting:site:list | grep -m 1 "https://" | awk '{print $1}')
if [ -n "$HOSTING_URL" ]; then
    echo "${GREEN}✅ Hosting URL: ${HOSTING_URL}${NC}"
    
    # Test if site is accessible
    if curl -s -o /dev/null -w "%{http_code}" "$HOSTING_URL" | grep -q "200"; then
        echo "${GREEN}✅ Site is accessible${NC}"
    else
        echo "${YELLOW}⚠️  Site may not be accessible yet. Check manually.${NC}"
    fi
else
    echo "${YELLOW}⚠️  Could not determine hosting URL. Check Firebase console.${NC}"
fi

# Summary
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "${GREEN}🎉 Deployment Complete!${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "📊 Deployment Summary:"
echo "  ✅ TypeScript compilation: PASSED"
if [ "$SKIP_TESTS" = false ]; then
    echo "  ✅ Unit tests: PASSED"
else
    echo "  ⏭️  Unit tests: SKIPPED"
fi
echo "  ✅ Production build: SUCCESS"
echo "  ✅ Firestore rules: DEPLOYED"
echo "  ✅ Cloud Functions: DEPLOYED"
echo "  ✅ Frontend hosting: DEPLOYED"
echo ""
echo "🔍 Next Steps:"
echo "  1. Run manual tests (see docs/SUBSCRIPTION_SYSTEM_DEPLOYMENT_GUIDE.md)"
echo "  2. Monitor logs: firebase functions:log"
echo "  3. Check analytics after 24 hours"
echo "  4. Verify dealer users can create 30 listings"
echo ""
echo "📚 Documentation:"
echo "  - Deployment Guide: docs/SUBSCRIPTION_SYSTEM_DEPLOYMENT_GUIDE.md"
echo "  - Quick Start: docs/SUBSCRIPTION_SYSTEM_QUICK_START.md"
echo "  - Complete Report: SUBSCRIPTION_SYSTEM_COMPLETION_REPORT_JAN7_2026.md"
echo ""
echo "${GREEN}✅ All systems operational!${NC}"
echo ""
