# Deploy Social Media OAuth System (PowerShell)
# Location: Bulgaria | Languages: BG/EN | Currency: EUR

Write-Host ""
Write-Host "================================================" -ForegroundColor Cyan
Write-Host "🚀 Social Media OAuth System Deployment" -ForegroundColor White
Write-Host "================================================" -ForegroundColor Cyan
Write-Host ""

# Step 1: Check Firebase CLI
Write-Host "📦 Step 1: Checking Firebase CLI..." -ForegroundColor Yellow
if (!(Get-Command firebase -ErrorAction SilentlyContinue)) {
    Write-Host "❌ Firebase CLI not found!" -ForegroundColor Red
    Write-Host "Install it with: npm install -g firebase-tools"
    exit 1
}
Write-Host "✅ Firebase CLI found" -ForegroundColor Green
Write-Host ""

# Step 2: Check Firebase Login
Write-Host "🔐 Step 2: Checking Firebase authentication..." -ForegroundColor Yellow
$loginCheck = firebase projects:list 2>&1
if ($LASTEXITCODE -ne 0) {
    Write-Host "⚠️  Not logged in. Please login:" -ForegroundColor Yellow
    firebase login
}
Write-Host "✅ Firebase authenticated" -ForegroundColor Green
Write-Host ""

# Step 3: Set Firebase Secrets
Write-Host "🔑 Step 3: Setting Firebase secrets..." -ForegroundColor Yellow
Write-Host ""
Write-Host "Please provide your OAuth credentials:" -ForegroundColor White
Write-Host ""

# Facebook
Write-Host "Facebook OAuth:" -ForegroundColor Yellow
$FACEBOOK_APP_ID = Read-Host "Facebook App ID (default: 1780064479295175)"
if ([string]::IsNullOrWhiteSpace($FACEBOOK_APP_ID)) {
    $FACEBOOK_APP_ID = "1780064479295175"
}
$FACEBOOK_APP_SECRET = Read-Host "Facebook App Secret" -AsSecureString
$FACEBOOK_APP_SECRET = [Runtime.InteropServices.Marshal]::PtrToStringAuto([Runtime.InteropServices.Marshal]::SecureStringToBSTR($FACEBOOK_APP_SECRET))

firebase functions:config:set facebook.app_id="$FACEBOOK_APP_ID"
firebase functions:config:set facebook.app_secret="$FACEBOOK_APP_SECRET"

Write-Host "✅ Facebook credentials set" -ForegroundColor Green
Write-Host ""

# Twitter
Write-Host "Twitter OAuth (optional, press Enter to skip):" -ForegroundColor Yellow
$TWITTER_CLIENT_ID = Read-Host "Twitter Client ID"
if (![string]::IsNullOrWhiteSpace($TWITTER_CLIENT_ID)) {
    $TWITTER_CLIENT_SECRET = Read-Host "Twitter Client Secret" -AsSecureString
    $TWITTER_CLIENT_SECRET = [Runtime.InteropServices.Marshal]::PtrToStringAuto([Runtime.InteropServices.Marshal]::SecureStringToBSTR($TWITTER_CLIENT_SECRET))
    
    firebase functions:config:set twitter.client_id="$TWITTER_CLIENT_ID"
    firebase functions:config:set twitter.client_secret="$TWITTER_CLIENT_SECRET"
    
    Write-Host "✅ Twitter credentials set" -ForegroundColor Green
}
Write-Host ""

# TikTok
Write-Host "TikTok OAuth (optional, press Enter to skip):" -ForegroundColor Yellow
$TIKTOK_CLIENT_KEY = Read-Host "TikTok Client Key"
if (![string]::IsNullOrWhiteSpace($TIKTOK_CLIENT_KEY)) {
    $TIKTOK_CLIENT_SECRET = Read-Host "TikTok Client Secret" -AsSecureString
    $TIKTOK_CLIENT_SECRET = [Runtime.InteropServices.Marshal]::PtrToStringAuto([Runtime.InteropServices.Marshal]::SecureStringToBSTR($TIKTOK_CLIENT_SECRET))
    
    firebase functions:config:set tiktok.client_key="$TIKTOK_CLIENT_KEY"
    firebase functions:config:set tiktok.client_secret="$TIKTOK_CLIENT_SECRET"
    
    Write-Host "✅ TikTok credentials set" -ForegroundColor Green
}
Write-Host ""

# LinkedIn
Write-Host "LinkedIn OAuth (optional, press Enter to skip):" -ForegroundColor Yellow
$LINKEDIN_CLIENT_ID = Read-Host "LinkedIn Client ID"
if (![string]::IsNullOrWhiteSpace($LINKEDIN_CLIENT_ID)) {
    $LINKEDIN_CLIENT_SECRET = Read-Host "LinkedIn Client Secret" -AsSecureString
    $LINKEDIN_CLIENT_SECRET = [Runtime.InteropServices.Marshal]::PtrToStringAuto([Runtime.InteropServices.Marshal]::SecureStringToBSTR($LINKEDIN_CLIENT_SECRET))
    
    firebase functions:config:set linkedin.client_id="$LINKEDIN_CLIENT_ID"
    firebase functions:config:set linkedin.client_secret="$LINKEDIN_CLIENT_SECRET"
    
    Write-Host "✅ LinkedIn credentials set" -ForegroundColor Green
}
Write-Host ""

# Google (YouTube)
Write-Host "Google OAuth for YouTube (optional, press Enter to skip):" -ForegroundColor Yellow
$GOOGLE_CLIENT_ID = Read-Host "Google Client ID"
if (![string]::IsNullOrWhiteSpace($GOOGLE_CLIENT_ID)) {
    $GOOGLE_CLIENT_SECRET = Read-Host "Google Client Secret" -AsSecureString
    $GOOGLE_CLIENT_SECRET = [Runtime.InteropServices.Marshal]::PtrToStringAuto([Runtime.InteropServices.Marshal]::SecureStringToBSTR($GOOGLE_CLIENT_SECRET))
    
    firebase functions:config:set google.client_id="$GOOGLE_CLIENT_ID"
    firebase functions:config:set google.client_secret="$GOOGLE_CLIENT_SECRET"
    
    Write-Host "✅ Google credentials set" -ForegroundColor Green
}
Write-Host ""

# Step 4: Build Functions
Write-Host "🔨 Step 4: Building Cloud Functions..." -ForegroundColor Yellow
Push-Location functions
npm install
npm run build
Pop-Location
Write-Host "✅ Functions built successfully" -ForegroundColor Green
Write-Host ""

# Step 5: Deploy Functions
Write-Host "🚀 Step 5: Deploying Cloud Functions..." -ForegroundColor Yellow
firebase deploy --only functions:exchangeOAuthToken

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Cloud Functions deployed successfully!" -ForegroundColor Green
} else {
    Write-Host "❌ Deployment failed!" -ForegroundColor Red
    exit 1
}
Write-Host ""

# Step 6: Deploy Firestore Rules
Write-Host "🛡️  Step 6: Deploying Firestore rules..." -ForegroundColor Yellow
firebase deploy --only firestore:rules
Write-Host "✅ Firestore rules deployed" -ForegroundColor Green
Write-Host ""

# Done
Write-Host "================================================" -ForegroundColor Cyan
Write-Host "✅ Social Media OAuth System Deployed!" -ForegroundColor Green
Write-Host "================================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host "1. Configure OAuth redirect URLs in each platform:"
Write-Host "   - Facebook: https://developers.facebook.com/apps"
Write-Host "   - Twitter: https://developer.twitter.com/en/portal/dashboard"
Write-Host "   - TikTok: https://developers.tiktok.com/"
Write-Host "   - LinkedIn: https://www.linkedin.com/developers/apps"
Write-Host "   - Google: https://console.cloud.google.com/"
Write-Host ""
Write-Host "2. Add these redirect URLs:"
Write-Host "   - Dev: http://localhost:3000/oauth/callback"
Write-Host "   - Prod: https://mobilebg.eu/oauth/callback"
Write-Host ""
Write-Host "3. Test the integration:"
Write-Host "   - Go to Profile > Settings"
Write-Host "   - Click 'Connect' on any platform"
Write-Host "   - Complete OAuth flow"
Write-Host ""
Write-Host "📚 Full documentation: bulgarian-car-marketplace\SOCIAL_MEDIA_OAUTH_SETUP.md" -ForegroundColor Cyan
Write-Host ""

