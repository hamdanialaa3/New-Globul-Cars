#!/bin/bash
# 🔐 GitHub Secrets Setup Script (Linux/Mac version)
# Automates Firebase secrets extraction and provides GitHub CLI commands

set -e

echo "════════════════════════════════════════════════════════════════"
echo "🔐 Firebase GitHub Secrets Setup Wizard"
echo "════════════════════════════════════════════════════════════════"
echo ""

# Check if Firebase CLI is installed
echo "🔍 Checking Firebase CLI..."
if ! command -v firebase &> /dev/null; then
    echo "❌ Firebase CLI not found!"
    echo "   Install: npm install -g firebase-tools"
    echo ""
    exit 1
fi
echo "✅ Firebase CLI found"

# Read .firebaserc to get project ID
echo ""
echo "📋 Reading .firebaserc..."
if [ ! -f ".firebaserc" ]; then
    echo "❌ .firebaserc not found!"
    exit 1
fi

PROJECT_ID=$(cat .firebaserc | grep -o '"default"[[:space:]]*:[[:space:]]*"[^"]*"' | cut -d'"' -f4)

if [ -z "$PROJECT_ID" ]; then
    echo "❌ Cannot find Firebase project ID in .firebaserc"
    exit 1
fi

echo "✅ Project ID: $PROJECT_ID"

# Check if GitHub CLI is installed
echo ""
echo "🔍 Checking GitHub CLI..."
if command -v gh &> /dev/null; then
    echo "✅ GitHub CLI found - Can add secrets automatically"
    USE_GH_CLI=true
else
    echo "⚠️  GitHub CLI not found - Will show manual instructions"
    echo "   Install: https://cli.github.com/"
    USE_GH_CLI=false
fi

# Get current repository
echo ""
echo "📦 Repository: hamdanialaa3/New-Globul-Cars"

# Check for service account key
echo ""
echo "════════════════════════════════════════════════════════════════"
echo "🔑 Firebase Service Account"
echo "════════════════════════════════════════════════════════════════"
echo ""

SERVICE_ACCOUNT_PATH="firebase-service-account.json"

if [ -f "$SERVICE_ACCOUNT_PATH" ]; then
    echo "✅ Found: $SERVICE_ACCOUNT_PATH"
    SERVICE_ACCOUNT=$(cat "$SERVICE_ACCOUNT_PATH")
else
    echo "❌ Service account key not found at: $SERVICE_ACCOUNT_PATH"
    echo ""
    echo "📚 How to get it:"
    echo "   1. Go to: https://console.firebase.google.com/project/$PROJECT_ID/settings/serviceaccounts/adminsdk"
    echo "   2. Click 'Generate new private key'"
    echo "   3. Save as: $SERVICE_ACCOUNT_PATH"
    echo "   4. Re-run this script"
    echo ""
    
    read -p "Open Firebase Console now? (Y/n): " OPEN_BROWSER
    if [ "$OPEN_BROWSER" != "n" ]; then
        if command -v xdg-open &> /dev/null; then
            xdg-open "https://console.firebase.google.com/project/$PROJECT_ID/settings/serviceaccounts/adminsdk"
        elif command -v open &> /dev/null; then
            open "https://console.firebase.google.com/project/$PROJECT_ID/settings/serviceaccounts/adminsdk"
        fi
    fi
    
    exit 1
fi

# Add secrets
echo ""
echo "════════════════════════════════════════════════════════════════"
echo "🚀 Adding Secrets to GitHub"
echo "════════════════════════════════════════════════════════════════"
echo ""

if [ "$USE_GH_CLI" = true ]; then
    # Check if logged in
    if ! gh auth status &> /dev/null; then
        echo "❌ GitHub CLI not authenticated"
        echo "   Run: gh auth login"
        exit 1
    fi
    
    echo "🔐 Adding FIREBASE_PROJECT_ID..."
    echo "$PROJECT_ID" | gh secret set FIREBASE_PROJECT_ID -R hamdanialaa3/New-Globul-Cars
    if [ $? -eq 0 ]; then
        echo "✅ FIREBASE_PROJECT_ID added successfully"
    else
        echo "❌ Failed to add FIREBASE_PROJECT_ID"
    fi
    
    echo ""
    echo "🔐 Adding FIREBASE_SERVICE_ACCOUNT..."
    echo "$SERVICE_ACCOUNT" | gh secret set FIREBASE_SERVICE_ACCOUNT -R hamdanialaa3/New-Globul-Cars
    if [ $? -eq 0 ]; then
        echo "✅ FIREBASE_SERVICE_ACCOUNT added successfully"
    else
        echo "❌ Failed to add FIREBASE_SERVICE_ACCOUNT"
    fi
    
    echo ""
    echo "════════════════════════════════════════════════════════════════"
    echo "✅ Secrets Added Successfully!"
    echo "════════════════════════════════════════════════════════════════"
    echo ""
    echo "🚀 Next Steps:"
    echo "   1. Go to: https://github.com/hamdanialaa3/New-Globul-Cars/actions"
    echo "   2. Re-run the failed workflow"
    echo "   3. Or push a commit to trigger deployment"
    
else
    # Manual instructions
    echo "📋 Manual Setup Instructions:"
    echo ""
    echo "1️⃣  FIREBASE_PROJECT_ID:"
    echo "   Value: $PROJECT_ID"
    echo ""
    echo "2️⃣  FIREBASE_SERVICE_ACCOUNT:"
    echo "   Copy content from: $SERVICE_ACCOUNT_PATH"
    echo ""
    echo "📝 Add secrets at:"
    echo "   https://github.com/hamdanialaa3/New-Globul-Cars/settings/secrets/actions"
    echo ""
    
    # Copy to clipboard (if available)
    if command -v pbcopy &> /dev/null; then
        echo "$PROJECT_ID" | pbcopy
        echo "📋 FIREBASE_PROJECT_ID copied to clipboard! (macOS)"
    elif command -v xclip &> /dev/null; then
        echo "$PROJECT_ID" | xclip -selection clipboard
        echo "📋 FIREBASE_PROJECT_ID copied to clipboard! (Linux)"
    fi
    
    echo ""
    read -p "Open GitHub Secrets page now? (Y/n): " OPEN_SECRETS
    if [ "$OPEN_SECRETS" != "n" ]; then
        if command -v xdg-open &> /dev/null; then
            xdg-open "https://github.com/hamdanialaa3/New-Globul-Cars/settings/secrets/actions"
        elif command -v open &> /dev/null; then
            open "https://github.com/hamdanialaa3/New-Globul-Cars/settings/secrets/actions"
        fi
    fi
fi

echo ""
echo "════════════════════════════════════════════════════════════════"
echo "Done! 🎉"
echo "════════════════════════════════════════════════════════════════"
