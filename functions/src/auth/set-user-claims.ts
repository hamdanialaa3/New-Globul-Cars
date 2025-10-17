/**
 * Firebase Cloud Functions - User Claims Management
 * Automatically assigns default role to new users
 * Location: Bulgaria | Languages: BG, EN | Currency: EUR
 */

import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

/**
 * Triggers when a new user is created via Firebase Authentication
 * Assigns default role 'buyer' using Custom Claims
 * Also creates a user profile document in Firestore
 */
export const setDefaultUserRole = functions.auth.user().onCreate(async (user) => {
  const uid = user.uid;
  const email = user.email || '';
  
  // Default Custom Claims for new users
  const customClaims = {
    role: 'buyer',
    seller: false,
    admin: false,
    createdAt: Date.now()
  };
  
  try {
    // 1. Set Custom Claims in Auth Token
    await admin.auth().setCustomUserClaims(uid, customClaims);
    console.log(`Custom claims set for user ${uid}: role='buyer'`);
    
    // 2. Create user profile in Firestore
    await admin.firestore().collection('users').doc(uid).set({
      uid,
      email,
      role: 'buyer',
      accountType: 'individual',
      displayName: user.displayName || '',
      photoURL: user.photoURL || '',
      phoneNumber: user.phoneNumber || '',
      preferredLanguage: 'bg',
      currency: 'EUR',
      location: {
        country: 'Bulgaria',
        city: '',
        region: ''
      },
      isActive: true,
      emailVerified: user.emailVerified,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    }, { merge: true });
    
    console.log(`User profile created in Firestore for ${uid}`);
    
    // 3. Force token refresh using Realtime Database
    // This ensures the new claims are available immediately
    await admin.database().ref(`metadata/${uid}/refreshTime`).set(
      admin.database.ServerValue.TIMESTAMP
    );
    
    console.log(`Token refresh triggered for user ${uid}`);
    
    return { success: true, uid, role: 'buyer' };
    
  } catch (error) {
    console.error(`Error setting up new user ${uid}:`, error);
    throw new functions.https.HttpsError(
      'internal',
      'Failed to set up user account',
      error
    );
  }
});

/**
 * Handles token refresh when metadata changes
 * Monitors Realtime Database for refresh signals
 */
export const handleTokenRefresh = functions.database
  .ref('/metadata/{uid}/refreshTime')
  .onUpdate(async (change, context) => {
    const uid = context.params.uid;
    
    console.log(`Token refresh signal detected for user ${uid}`);
    
    // The client SDK will automatically refresh the token when it detects this change
    return { success: true, uid, timestamp: change.after.val() };
  });

