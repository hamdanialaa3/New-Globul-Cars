# 🔗 Social Media OAuth Integration - Complete Setup Guide

## 📋 Overview
This guide will help you complete the OAuth integration for Facebook, Twitter/X, TikTok, LinkedIn, and YouTube.

---

## 🔑 Required Environment Variables

Create a `.env` file in `bulgarian-car-marketplace/` with:

```env
# Facebook OAuth
REACT_APP_FACEBOOK_APP_ID=1780064479295175
REACT_APP_FACEBOOK_APP_SECRET=e762759ee883c3cbc256779ce0852e90

# Twitter/X OAuth
REACT_APP_TWITTER_CLIENT_ID=your_twitter_client_id
REACT_APP_TWITTER_CLIENT_SECRET=your_twitter_client_secret

# TikTok OAuth
REACT_APP_TIKTOK_CLIENT_KEY=your_tiktok_client_key
REACT_APP_TIKTOK_CLIENT_SECRET=your_tiktok_client_secret

# LinkedIn OAuth
REACT_APP_LINKEDIN_CLIENT_ID=your_linkedin_client_id
REACT_APP_LINKEDIN_CLIENT_SECRET=your_linkedin_client_secret

# Google OAuth (YouTube)
REACT_APP_GOOGLE_CLIENT_ID=your_google_client_id
REACT_APP_GOOGLE_CLIENT_SECRET=your_google_client_secret

# App URLs
REACT_APP_BASE_URL=http://localhost:3000
```

---

## 🎯 OAuth Redirect URLs

Add these URLs to each platform's developer console:

### Development
- `http://localhost:3000/oauth/callback`

### Production
- `https://mobilebg.eu/oauth/callback`
- `https://fire-new-globul.firebaseapp.com/oauth/callback`

---

## 📱 Platform-Specific Setup

### 1️⃣ Facebook
✅ **Already configured!**
- App ID: `1780064479295175`
- App Secret: `e762759ee883c3cbc256779ce0852e90`

**Setup:**
1. Go to: https://developers.facebook.com/apps/1780064479295175
2. Settings > Basic > Add Platform > Website
3. Site URL: `http://localhost:3000` (dev) or `https://mobilebg.eu` (prod)
4. Products > Facebook Login > Settings
5. Valid OAuth Redirect URIs: Add both URLs above
6. Required Permissions: `public_profile`, `pages_manage_posts`, `pages_read_engagement`

---

### 2️⃣ Twitter/X
**Setup:**
1. Go to: https://developer.twitter.com/en/portal/dashboard
2. Create new App or use existing
3. User authentication settings > OAuth 2.0 > ON
4. Type: Web App
5. Callback URLs: Add both URLs above
6. Scopes: `tweet.read`, `tweet.write`, `users.read`
7. Copy Client ID & Secret → `.env`

---

### 3️⃣ TikTok
**Setup:**
1. Go to: https://developers.tiktok.com/
2. My apps > Create new app
3. Add product: "Login Kit"
4. Redirect domain: `localhost:3000` (dev) or `mobilebg.eu` (prod)
5. Callback URLs: Add both URLs above
6. Scopes: `user.info.basic`, `video.upload`, `video.publish`
7. Copy Client Key & Secret → `.env`

---

### 4️⃣ LinkedIn
**Setup:**
1. Go to: https://www.linkedin.com/developers/apps
2. Create app or use existing
3. Products > Add "Sign In with LinkedIn"
4. Auth > OAuth 2.0 settings
5. Redirect URLs: Add both URLs above
6. Default scopes: `w_member_social`, `r_liteprofile`
7. Copy Client ID & Secret → `.env`

---

### 5️⃣ YouTube (Google)
**Setup:**
1. Go to: https://console.cloud.google.com/
2. APIs & Services > Credentials
3. Create OAuth 2.0 Client ID
4. Application type: Web application
5. Authorized redirect URIs: Add both URLs above
6. Enable APIs: YouTube Data API v3
7. Scopes: `https://www.googleapis.com/auth/youtube.upload`
8. Copy Client ID & Secret → `.env`

---

## 🔧 Testing OAuth Flow

### Step 1: Start Development Server
```bash
cd bulgarian-car-marketplace
npm start
```

### Step 2: Go to Settings
1. Login to your account
2. Navigate to Profile > Settings
3. Scroll to "Social Media Accounts"

### Step 3: Test Connection
1. Click "Connect" for Facebook
2. OAuth popup should open
3. Authorize the app
4. You'll be redirected to callback
5. Account should show as "Connected"

---

## 🐛 Troubleshooting

### Issue: "redirect_uri_mismatch"
**Solution:** Make sure the redirect URL in your app settings EXACTLY matches:
```
http://localhost:3000/oauth/callback
```
(No trailing slash, exact port)

### Issue: "Invalid scope"
**Solution:** Check that requested scopes are enabled in your app settings

### Issue: Popup blocked
**Solution:** Allow popups for localhost in browser settings

### Issue: "Token exchange failed"
**Solution:** Make sure Cloud Function is deployed (see Backend Setup below)

---

## ⚙️ Backend Setup (Firebase Cloud Functions)

The OAuth code exchange MUST happen on backend for security.

See: `functions/src/social-media/oauth-handler.ts`

Deploy:
```bash
firebase deploy --only functions:handleOAuthCallback
```

---

## 🎨 UI Components

- **SocialMediaSettings**: `/profile` > Settings tab
- **CrossPostSelector**: Create Post form > Footer section
- **Connected indicator**: Shows checkmark when active

---

## 📊 Firestore Structure

```javascript
socialMediaAccounts/{userId}_{platform}/
  - userId: string
  - platform: 'facebook' | 'twitter' | 'tiktok' | 'linkedin' | 'youtube'
  - accountId: string
  - accountName: string
  - accountHandle: string
  - accessToken: string (encrypted)
  - refreshToken: string (encrypted)
  - tokenExpiresAt: timestamp
  - isActive: boolean
  - permissions: string[]
  - connectedAt: timestamp
  - lastUsed: timestamp
```

---

## 🔒 Security Notes

1. **Never expose secrets in frontend**
2. **Always exchange code on backend**
3. **Encrypt tokens in Firestore**
4. **Validate state parameter**
5. **Use HTTPS in production**
6. **Implement token refresh**

---

## 📚 Resources

- [Facebook OAuth Docs](https://developers.facebook.com/docs/facebook-login/web)
- [Twitter OAuth 2.0](https://developer.twitter.com/en/docs/authentication/oauth-2-0)
- [TikTok Login Kit](https://developers.tiktok.com/doc/login-kit-web/)
- [LinkedIn OAuth](https://docs.microsoft.com/en-us/linkedin/shared/authentication/authentication)
- [Google OAuth](https://developers.google.com/identity/protocols/oauth2)

---

## ✅ Checklist

- [ ] Create OAuth apps on all platforms
- [ ] Add redirect URLs
- [ ] Copy Client IDs/Secrets to `.env`
- [ ] Deploy Cloud Function for token exchange
- [ ] Test each platform connection
- [ ] Verify tokens are saved to Firestore
- [ ] Test cross-posting functionality

---

**Need help?** Check console logs for detailed error messages.

