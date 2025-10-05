# Firebase App Check Setup Guide

## Current Status
Firebase App Check is currently **DISABLED** to prevent reCAPTCHA runtime errors during development.

## Why It's Disabled
The application was experiencing runtime errors with reCAPTCHA v3 integration:
```
ERROR: Missing required parameters: sitekey
```

This occurred due to issues with the test reCAPTCHA site key and Firebase App Check initialization timing.

## How to Enable App Check (Production Setup)

### Step 1: Get a Real reCAPTCHA v3 Site Key
1. Go to [Google reCAPTCHA Admin Console](https://www.google.com/recaptcha/admin)
2. Click "Create" or select an existing site
3. Choose reCAPTCHA v3
4. Add your domain(s):
   - `localhost` (for development)
   - `studio-448742006-a3493.web.app` (production)
   - `studio-448742006-a3493.firebaseapp.com` (production)
5. Copy the **Site Key** (not the Secret Key)

### Step 2: Update Environment Variables
Edit `.env` file:
```env
# Replace with your real reCAPTCHA v3 site key
REACT_APP_RECAPTCHA_SITE_KEY=your_real_site_key_here

# Enable App Check
REACT_APP_DISABLE_APP_CHECK=false
```

### Step 3: Enable App Check in Firebase Console
1. Go to [Firebase Console](https://console.firebase.google.com)
2. Select your project: `studio-448742006-a3493`
3. Go to **App Check** section
4. Enable App Check for your web app
5. Select **reCAPTCHA v3** as the provider
6. Enter your reCAPTCHA site key

### Step 4: Test Thoroughly
1. Restart the development server
2. Check browser console for successful App Check initialization
3. Test all app functionality
4. Verify no reCAPTCHA errors appear

### Step 5: Deploy to Production
1. Ensure the production domain is added to reCAPTCHA
2. Deploy the app with `firebase deploy`
3. Monitor Firebase Console for App Check metrics

## Troubleshooting

### Still Getting reCAPTCHA Errors?
1. Verify the site key is correct and active
2. Check that the domain is whitelisted in reCAPTCHA
3. Ensure App Check is enabled in Firebase Console
4. Clear browser cache and try incognito mode

### App Check Not Initializing?
1. Check browser console for error messages
2. Verify environment variables are loaded
3. Ensure Firebase SDK is properly initialized

## Security Benefits
When properly configured, App Check provides:
- Protection against abuse
- Reduced billing costs
- Enhanced security for Firebase services

## Development Without App Check
For development purposes, App Check can remain disabled. The app will function normally without security restrictions.