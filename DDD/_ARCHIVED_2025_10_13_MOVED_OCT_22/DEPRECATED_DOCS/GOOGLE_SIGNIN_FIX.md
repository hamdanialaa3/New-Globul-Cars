# 🔧 Google Sign-In Fix - Step by Step Guide

## ❌ Current Issues Identified

1. **Project ID Mismatch**: Your Firebase console shows `project-687922812237` but your `.env` uses `studio-448742006-a3493`
2. **Missing Google Provider Configuration**: Google sign-in provider needs to be properly enabled
3. **Authorized Domains**: Need to add localhost and your domains
4. **OAuth Configuration**: Web client needs proper setup

## ✅ Step-by-Step Fix

### Step 1: Fix Firebase Project Configuration

You have TWO different project IDs in your setup:
- Console shows: `project-687922812237`  
- Your app uses: `studio-448742006-a3493`

**Choose ONE project and stick with it:**

#### Option A: Use project-687922812237 (Recommended)
Update your `.env` file to match the console project:

```env
REACT_APP_FIREBASE_PROJECT_ID=project-687922812237
REACT_APP_FIREBASE_AUTH_DOMAIN=project-687922812237.firebaseapp.com
REACT_APP_FIREBASE_STORAGE_BUCKET=project-687922812237.appspot.com
```

#### Option B: Use studio-448742006-a3493
Switch your Firebase console to the other project.

### Step 2: Enable Google Sign-In Provider

1. Go to Firebase Console: https://console.firebase.google.com/
2. Select your project: `project-687922812237`
3. Go to **Authentication** → **Sign-in method**
4. Click on **Google** provider
5. **Enable** the toggle
6. Set **Project support email**: `globulinternet@gmail.com`
7. Click **Save**

### Step 3: Configure Authorized Domains

In Firebase Console → Authentication → Settings → Authorized domains:

Add these domains:
- `localhost`
- `127.0.0.1`
- `project-687922812237.firebaseapp.com`
- `project-687922812237.web.app`
- Your production domain (if any)

### Step 4: Google Cloud Console Configuration

1. Go to: https://console.cloud.google.com/
2. Select project: `project-687922812237`
3. Go to **APIs & Services** → **Credentials**
4. Find your **OAuth 2.0 Client ID** (created by Firebase)
5. Add **Authorized JavaScript origins**:
   - `http://localhost:3000`
   - `http://localhost:3001`
   - `https://project-687922812237.firebaseapp.com`
   - `https://project-687922812237.web.app`
6. Add **Authorized redirect URIs**:
   - `https://project-687922812237.firebaseapp.com/__/auth/handler`

### Step 5: OAuth Consent Screen

1. In Google Cloud Console → **APIs & Services** → **OAuth consent screen**
2. Fill required fields:
   - **App name**: "Globul Cars - Bulgarian Car Marketplace"
   - **User support email**: `globulinternet@gmail.com`
   - **Developer contact**: `globulinternet@gmail.com`
3. Add **Authorized domains**:
   - `firebaseapp.com`
   - Your production domain
4. **Save and Continue**

## 🔄 Quick Fix - Updated Configuration Files

I'll update your configuration to use the correct project ID and fix the Google authentication.