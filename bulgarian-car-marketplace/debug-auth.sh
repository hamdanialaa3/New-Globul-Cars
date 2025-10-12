#!/bin/bash
# Firebase Authentication Diagnostics Script
# Enhanced diagnosis for Bulgarian Car Marketplace Authentication Issues

echo "🔍 Firebase Authentication Diagnostics"
echo "======================================"

echo ""
echo "📋 1. Environment Variables Check:"
echo "REACT_APP_FIREBASE_API_KEY: ${REACT_APP_FIREBASE_API_KEY:0:10}..."
echo "REACT_APP_FIREBASE_AUTH_DOMAIN: $REACT_APP_FIREBASE_AUTH_DOMAIN"
echo "REACT_APP_FIREBASE_PROJECT_ID: $REACT_APP_FIREBASE_PROJECT_ID"

echo ""
echo "🌐 2. Network & Domain Check:"
echo "Current URL: $(curl -s -o /dev/null -w "%{url_effective}" http://localhost:3000/)"
echo "Localhost accessible: $(curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/)"

echo ""
echo "🔥 3. Firebase Project Status:"
firebase use
firebase projects:list

echo ""
echo "🔐 4. Authentication Providers Check:"
echo "⚠️  Manual check required in Firebase Console:"
echo "   https://console.firebase.google.com/project/studio-448742006-a3493/authentication/providers"

echo ""
echo "📱 5. OAuth Configuration Issues:"
echo "Common problems to check:"
echo "- Google OAuth Client ID configuration"
echo "- Facebook App ID and App Secret"
echo "- Apple Services configuration"
echo "- Authorized domains in Firebase Console"

echo ""
echo "🛠️  6. Recommended Fixes:"
echo "1. Re-enable authentication providers in Firebase Console"
echo "2. Check OAuth app configurations"
echo "3. Verify authorized domains"
echo "4. Test with Firebase Auth Emulator"

echo ""
echo "🔧 7. Quick Test Commands:"
echo "firebase auth:import test-users.json --hash-algo=PLAINTEXT"
echo "firebase emulators:start --only auth"