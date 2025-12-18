// Cloud Function to set superAdmin custom claim on the unique owner
// Run once to initialize the owner's admin privileges
// Location: Bulgaria | Languages: BG/EN | Currency: EUR

import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

/**
 * Manually callable function to set superAdmin claim on the unique owner
 * Only run this ONCE to initialize owner privileges
 * After that, all checks use the custom claim instead of hardcoded email
 */
export const setSuperAdminClaim = functions.https.onCall(async (data, context) => {
  // Initial authentication: only authenticated user can call this
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
  }

  const { email } = data;
  
  // Security: only allow setting claim on the specific owner email
  if (email !== 'alaa.hamdani@yahoo.com') {
    throw new functions.https.HttpsError('permission-denied', 'Can only set claim on owner email');
  }

  // Require caller to be the owner themselves (self-initialization)
  if (context.auth.token.email !== email) {
    throw new functions.https.HttpsError('permission-denied', 'Can only set your own claim');
  }

  try {
    // Get user by email
    const user = await admin.auth().getUserByEmail(email);
    
    // Set custom claim
    await admin.auth().setCustomUserClaims(user.uid, {
      superAdmin: true,
      uniqueOwner: true,
      role: 'SUPER_ADMIN',
      permissions: ['all']
    });

    console.log(`✅ Custom claims set for ${email}`);

    return {
      success: true,
      message: 'Super Admin claims set successfully. Please sign out and sign in again for claims to take effect.',
      uid: user.uid,
      claims: {
        superAdmin: true,
        uniqueOwner: true,
        role: 'SUPER_ADMIN'
      }
    };
  } catch (error: unknown) {
    const err = error instanceof Error ? error : new Error(String(error));
    console.error('Error setting custom claims:', err.message);
    throw new functions.https.HttpsError('internal', `Failed to set claims: ${err.message}`);
  }
});

/**
 * Helper function to verify if a user has super admin claim
 * Can be called from other Cloud Functions
 */
export async function verifySuperAdmin(context: functions.https.CallableContext): Promise<boolean> {
  if (!context.auth) {
    return false;
  }

  // Check custom claim
  if (context.auth.token.superAdmin === true || context.auth.token.uniqueOwner === true) {
    return true;
  }

  // Fallback: check email (for backward compatibility during migration)
  if (context.auth.token.email === 'alaa.hamdani@yahoo.com') {
    console.warn('⚠️ Using email fallback for super admin check. Please set custom claims.');
    return true;
  }

  return false;
}
