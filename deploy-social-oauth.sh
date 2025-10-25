#!/bin/bash
# Deploy Social Media OAuth System
# Location: Bulgaria | Languages: BG/EN | Currency: EUR

echo "================================================"
echo "🚀 Social Media OAuth System Deployment"
echo "================================================"
echo ""

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Step 1: Check Firebase CLI
echo -e "${YELLOW}📦 Step 1: Checking Firebase CLI...${NC}"
if ! command -v firebase &> /dev/null; then
    echo -e "${RED}❌ Firebase CLI not found!${NC}"
    echo "Install it with: npm install -g firebase-tools"
    exit 1
fi
echo -e "${GREEN}✅ Firebase CLI found${NC}"
echo ""

# Step 2: Check Firebase Login
echo -e "${YELLOW}🔐 Step 2: Checking Firebase authentication...${NC}"
if ! firebase projects:list &> /dev/null; then
    echo -e "${YELLOW}⚠️  Not logged in. Please login:${NC}"
    firebase login
fi
echo -e "${GREEN}✅ Firebase authenticated${NC}"
echo ""

# Step 3: Set Firebase Secrets
echo -e "${YELLOW}🔑 Step 3: Setting Firebase secrets...${NC}"
echo ""
echo "Please provide your OAuth credentials:"
echo ""

# Facebook
echo -e "${YELLOW}Facebook OAuth:${NC}"
read -p "Facebook App ID (default: 1780064479295175): " FACEBOOK_APP_ID
FACEBOOK_APP_ID=${FACEBOOK_APP_ID:-1780064479295175}
read -sp "Facebook App Secret: " FACEBOOK_APP_SECRET
echo ""

firebase functions:secrets:set FACEBOOK_APP_ID --data-file <(echo -n "$FACEBOOK_APP_ID") 2>/dev/null || \
firebase functions:config:set facebook.app_id="$FACEBOOK_APP_ID"

firebase functions:secrets:set FACEBOOK_APP_SECRET --data-file <(echo -n "$FACEBOOK_APP_SECRET") 2>/dev/null || \
firebase functions:config:set facebook.app_secret="$FACEBOOK_APP_SECRET"

echo -e "${GREEN}✅ Facebook credentials set${NC}"
echo ""

# Twitter
echo -e "${YELLOW}Twitter OAuth:${NC}"
read -p "Twitter Client ID: " TWITTER_CLIENT_ID
read -sp "Twitter Client Secret: " TWITTER_CLIENT_SECRET
echo ""

if [ ! -z "$TWITTER_CLIENT_ID" ]; then
    firebase functions:secrets:set TWITTER_CLIENT_ID --data-file <(echo -n "$TWITTER_CLIENT_ID") 2>/dev/null || \
    firebase functions:config:set twitter.client_id="$TWITTER_CLIENT_ID"
    
    firebase functions:secrets:set TWITTER_CLIENT_SECRET --data-file <(echo -n "$TWITTER_CLIENT_SECRET") 2>/dev/null || \
    firebase functions:config:set twitter.client_secret="$TWITTER_CLIENT_SECRET"
    
    echo -e "${GREEN}✅ Twitter credentials set${NC}"
fi
echo ""

# TikTok
echo -e "${YELLOW}TikTok OAuth:${NC}"
read -p "TikTok Client Key: " TIKTOK_CLIENT_KEY
read -sp "TikTok Client Secret: " TIKTOK_CLIENT_SECRET
echo ""

if [ ! -z "$TIKTOK_CLIENT_KEY" ]; then
    firebase functions:secrets:set TIKTOK_CLIENT_KEY --data-file <(echo -n "$TIKTOK_CLIENT_KEY") 2>/dev/null || \
    firebase functions:config:set tiktok.client_key="$TIKTOK_CLIENT_KEY"
    
    firebase functions:secrets:set TIKTOK_CLIENT_SECRET --data-file <(echo -n "$TIKTOK_CLIENT_SECRET") 2>/dev/null || \
    firebase functions:config:set tiktok.client_secret="$TIKTOK_CLIENT_SECRET"
    
    echo -e "${GREEN}✅ TikTok credentials set${NC}"
fi
echo ""

# LinkedIn
echo -e "${YELLOW}LinkedIn OAuth:${NC}"
read -p "LinkedIn Client ID: " LINKEDIN_CLIENT_ID
read -sp "LinkedIn Client Secret: " LINKEDIN_CLIENT_SECRET
echo ""

if [ ! -z "$LINKEDIN_CLIENT_ID" ]; then
    firebase functions:secrets:set LINKEDIN_CLIENT_ID --data-file <(echo -n "$LINKEDIN_CLIENT_ID") 2>/dev/null || \
    firebase functions:config:set linkedin.client_id="$LINKEDIN_CLIENT_ID"
    
    firebase functions:secrets:set LINKEDIN_CLIENT_SECRET --data-file <(echo -n "$LINKEDIN_CLIENT_SECRET") 2>/dev/null || \
    firebase functions:config:set linkedin.client_secret="$LINKEDIN_CLIENT_SECRET"
    
    echo -e "${GREEN}✅ LinkedIn credentials set${NC}"
fi
echo ""

# Google (YouTube)
echo -e "${YELLOW}Google OAuth (YouTube):${NC}"
read -p "Google Client ID: " GOOGLE_CLIENT_ID
read -sp "Google Client Secret: " GOOGLE_CLIENT_SECRET
echo ""

if [ ! -z "$GOOGLE_CLIENT_ID" ]; then
    firebase functions:secrets:set GOOGLE_CLIENT_ID --data-file <(echo -n "$GOOGLE_CLIENT_ID") 2>/dev/null || \
    firebase functions:config:set google.client_id="$GOOGLE_CLIENT_ID"
    
    firebase functions:secrets:set GOOGLE_CLIENT_SECRET --data-file <(echo -n "$GOOGLE_CLIENT_SECRET") 2>/dev/null || \
    firebase functions:config:set google.client_secret="$GOOGLE_CLIENT_SECRET"
    
    echo -e "${GREEN}✅ Google credentials set${NC}"
fi
echo ""

# Step 4: Build Functions
echo -e "${YELLOW}🔨 Step 4: Building Cloud Functions...${NC}"
cd functions
npm install
npm run build
cd ..
echo -e "${GREEN}✅ Functions built successfully${NC}"
echo ""

# Step 5: Deploy Functions
echo -e "${YELLOW}🚀 Step 5: Deploying Cloud Functions...${NC}"
firebase deploy --only functions:exchangeOAuthToken

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Cloud Functions deployed successfully!${NC}"
else
    echo -e "${RED}❌ Deployment failed!${NC}"
    exit 1
fi
echo ""

# Step 6: Deploy Firestore Rules
echo -e "${YELLOW}🛡️  Step 6: Deploying Firestore rules...${NC}"
firebase deploy --only firestore:rules
echo -e "${GREEN}✅ Firestore rules deployed${NC}"
echo ""

# Done
echo "================================================"
echo -e "${GREEN}✅ Social Media OAuth System Deployed!${NC}"
echo "================================================"
echo ""
echo "Next steps:"
echo "1. Configure OAuth redirect URLs in each platform:"
echo "   - Facebook: https://developers.facebook.com/apps"
echo "   - Twitter: https://developer.twitter.com/en/portal/dashboard"
echo "   - TikTok: https://developers.tiktok.com/"
echo "   - LinkedIn: https://www.linkedin.com/developers/apps"
echo "   - Google: https://console.cloud.google.com/"
echo ""
echo "2. Add these redirect URLs:"
echo "   - Dev: http://localhost:3000/oauth/callback"
echo "   - Prod: https://mobilebg.eu/oauth/callback"
echo ""
echo "3. Test the integration:"
echo "   - Go to Profile > Settings"
echo "   - Click 'Connect' on any platform"
echo "   - Complete OAuth flow"
echo ""
echo "📚 Full documentation: bulgarian-car-marketplace/SOCIAL_MEDIA_OAUTH_SETUP.md"
echo ""

