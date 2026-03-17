#!/bin/bash
# Deploy AI Services and Cloud Functions
# نشر خدمات الذكاء الاصطناعي ودوال السحابة

set -e

echo "🤖 AI Services Deployment Script"
echo "=================================="
echo ""

# Check if Firebase CLI is installed
if ! command -v firebase &> /dev/null; then
    echo "❌ Firebase CLI not found. Installing..."
    npm install -g firebase-tools
fi

# Check if .env exists
if [ ! -f ".env" ]; then
    echo "❌ Error: .env file not found"
    echo "Please create .env with required variables:"
    echo "  REACT_APP_OPENAI_API_KEY"
    echo "  REACT_APP_GEMINI_API_KEY"
    echo "  WHATSAPP_VERIFY_TOKEN"
    echo "  WHATSAPP_ACCESS_TOKEN"
    exit 1
fi

echo "✅ Environment configuration found"
echo ""

# Step 1: Build React App
echo "📦 Step 1: Building React application..."
npm run build

if [ $? -eq 0 ]; then
    echo "✅ React build successful"
else
    echo "❌ React build failed"
    exit 1
fi

echo ""

# Step 2: Check Firebase Functions
echo "🔧 Step 2: Setting up Cloud Functions..."
cd functions

# Install dependencies
echo "  Installing dependencies..."
npm install

# Build TypeScript
echo "  Building TypeScript..."
npm run build

if [ $? -eq 0 ]; then
    echo "✅ Functions build successful"
else
    echo "❌ Functions build failed"
    cd ..
    exit 1
fi

cd ..

echo ""

# Step 3: Deploy to Firebase
echo "🚀 Step 3: Deploying to Firebase..."
echo ""

# Deploy Firestore rules
echo "  Deploying Firestore security rules..."
firebase deploy --only firestore:rules

# Deploy Firebase Functions
echo "  Deploying Cloud Functions..."
firebase deploy --only functions

# Deploy Hosting
echo "  Deploying to Firebase Hosting..."
firebase deploy --only hosting

echo ""
echo "✅ Deployment completed successfully!"
echo ""

# Display deployment info
echo "📊 Deployment Information:"
echo "  - Hosting URL: https://$(grep -oP '(?<="site": ")[^"]*' firebase.json).web.app"
echo "  - Functions: $(firebase functions:list 2>/dev/null | wc -l) deployed"
echo ""

# Step 4: Verify deployment
echo "🔍 Verifying deployment..."
firebase functions:log --limit 5

echo ""
echo "🎉 AI Services are now live!"
echo ""
echo "Next steps:"
echo "  1. Configure WhatsApp webhook: https://your-project.web.app/whatsapp"
echo "  2. Test AI services: npm run test:ai"
echo "  3. Monitor costs and usage in Firebase Console"
echo ""
