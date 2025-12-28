#!/bin/bash
# Cloud Functions Deployment Script
# يعمل على Windows (Git Bash) و Linux/Mac

set -e  # Exit on error

echo "🚀 Starting Cloud Functions Deployment..."
echo "================================================"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if we're in the right directory
if [ ! -f "firebase.json" ]; then
    echo -e "${RED}❌ Error: firebase.json not found. Please run from project root.${NC}"
    exit 1
fi

# Install dependencies
echo -e "${YELLOW}📦 Installing Cloud Functions dependencies...${NC}"
cd functions
npm install algoliasearch
cd ..

# Check Algolia configuration
echo -e "${YELLOW}🔍 Checking Algolia configuration...${NC}"
ALGOLIA_APP_ID=$(firebase functions:config:get algolia.app_id 2>/dev/null || echo "")
ALGOLIA_ADMIN_KEY=$(firebase functions:config:get algolia.admin_key 2>/dev/null || echo "")

if [ -z "$ALGOLIA_APP_ID" ] || [ -z "$ALGOLIA_ADMIN_KEY" ]; then
    echo -e "${RED}⚠️  Algolia not configured!${NC}"
    echo "Please set Algolia credentials:"
    echo "  firebase functions:config:set algolia.app_id=\"YOUR_APP_ID\""
    echo "  firebase functions:config:set algolia.admin_key=\"YOUR_ADMIN_KEY\""
    read -p "Do you want to continue without Algolia? (y/N): " continue_anyway
    if [ "$continue_anyway" != "y" ] && [ "$continue_anyway" != "Y" ]; then
        echo "Deployment cancelled."
        exit 1
    fi
else
    echo -e "${GREEN}✅ Algolia configuration found${NC}"
fi

# Deploy functions
echo -e "${YELLOW}🚀 Deploying Cloud Functions...${NC}"
firebase deploy --only functions:syncPassengerCarsToAlgolia,functions:syncSuvsToAlgolia,functions:syncVansToAlgolia,functions:syncMotorcyclesToAlgolia,functions:syncTrucksToAlgolia,functions:syncBusesToAlgolia,functions:batchSyncAllCarsToAlgolia

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Deployment successful!${NC}"
    echo ""
    echo "================================================"
    echo "📋 Next Steps:"
    echo "1. Run initial batch sync:"
    echo "   firebase functions:call batchSyncAllCarsToAlgolia"
    echo ""
    echo "2. Test real-time sync by:"
    echo "   - Adding a new car"
    echo "   - Updating an existing car"
    echo "   - Checking Algolia dashboard"
    echo "================================================"
else
    echo -e "${RED}❌ Deployment failed!${NC}"
    exit 1
fi
