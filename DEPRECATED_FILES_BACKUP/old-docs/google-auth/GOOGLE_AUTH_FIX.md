# Google Authentication Fix Guide

## Error: "An error occurred during Google sign-in. Please try again."

This error typically occurs due to Firebase/Google OAuth configuration issues. Here's how to fix it:

## Step 1: Firebase Console Configuration

### 1.1 Enable Google Sign-in Provider
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project: `studio-448742006-a3493`
3. Navigate to **Authentication** > **Sign-in method**
4. Find **Google** provider and click **Edit**
5. Enable the provider if it's not already enabled
6. Set the project support email (required)

### 1.2 Configure Authorized Domains
In Firebase Console > Authentication > Settings > Authorized domains:
- Add `localhost` (for development)
- Add `127.0.0.1` (alternative localhost)
- Add your production domain when deploying

### 1.3 OAuth Redirect URIs
Make sure these URIs are added:
- `https://studio-448742006-a3493.firebaseapp.com/__/auth/handler`
- `http://localhost:3000/__/auth/handler` (for development)
- `http://localhost:3001/__/auth/handler` (alternative port)

## Step 2: Google Cloud Console Configuration

### 2.1 Enable Required APIs
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Select project: `studio-448742006-a3493`
3. Navigate to **APIs & Services** > **Library**
4. Enable these APIs:
   - Identity and Access Management (IAM) API
   - Google+ API (if using legacy features)
   - People API (recommended)

### 2.2 Configure OAuth Consent Screen
1. Go to **APIs & Services** > **OAuth consent screen**
2. Choose **External** user type
3. Fill in required fields:
   - App name: "Globul Cars - Bulgarian Car Marketplace"
   - User support email: Your email
   - Developer contact information: Your email
4. Add authorized domains:
   - `firebaseapp.com`
   - Your production domain

### 2.3 OAuth Client Configuration
1. Go to **APIs & Services** > **Credentials**
2. Find your OAuth 2.0 Client (created by Firebase)
3. Add authorized redirect URIs:
   - `https://studio-448742006-a3493.firebaseapp.com/__/auth/handler`
4. Add authorized JavaScript origins:
   - `http://localhost:3000`
   - `http://localhost:3001`
   - Your production domain

## Step 3: Fix Common Code Issues

### 3.1 Update Google Provider Configuration
The current code should work, but let's ensure proper scopes:

```typescript
// In social-auth-service.ts
const googleProvider = new GoogleAuthProvider();
googleProvider.addScope('email');
googleProvider.addScope('profile');
```

### 3.2 Add Better Error Handling
```typescript
static async signInWithGoogle(): Promise<UserCredential> {
  try {
    console.log('Attempting Google sign-in...');
    const result = await signInWithPopup(auth, googleProvider);
    console.log('Google sign-in successful:', result.user.email);
    return result;
  } catch (error: any) {
    console.error('Google sign-in error details:', {
      code: error.code,
      message: error.message,
      credential: error.credential
    });
    
    // Handle specific error cases
    if (error.code === 'auth/popup-blocked') {
      throw new Error('Popup was blocked. Please allow popups for this site.');
    } else if (error.code === 'auth/unauthorized-domain') {
      throw new Error('This domain is not authorized. Please contact support.');
    } else if (error.code === 'auth/operation-not-allowed') {
      throw new Error('Google sign-in is not enabled. Please contact support.');
    }
    
    throw new Error(this.getErrorMessage(error.code, 'Google'));
  }
}
```

## Step 4: Testing the Fix

### 4.1 Clear Browser Data
1. Clear cookies and site data for localhost
2. Clear Firebase Auth token: `localStorage.clear()` in console
3. Hard refresh the page (Ctrl+F5)

### 4.2 Test Different Scenarios
1. Test with popup blocker disabled
2. Test in incognito mode
3. Test with different Google accounts
4. Check browser console for detailed error messages

## Step 5: Environment Variables Check

Ensure your `.env` file has the correct Firebase configuration:

```env
REACT_APP_FIREBASE_API_KEY=AIzaSyBrQmYxT_t8-RnOX4vfRKJ1CJ3f5LBfBJc
REACT_APP_FIREBASE_AUTH_DOMAIN=studio-448742006-a3493.firebaseapp.com
REACT_APP_FIREBASE_PROJECT_ID=studio-448742006-a3493
```

## Common Error Codes and Solutions

- `auth/popup-blocked`: Enable popups or use redirect method
- `auth/unauthorized-domain`: Add domain to Firebase authorized domains
- `auth/operation-not-allowed`: Enable Google provider in Firebase
- `auth/invalid-api-key`: Check your Firebase API key
- `auth/network-request-failed`: Check internet connection

## Quick Debug Steps

1. Open browser DevTools (F12)
2. Go to Console tab
3. Try Google sign-in
4. Look for specific error codes/messages
5. Check Network tab for failed requests

If you see specific error codes, refer to the solutions above.