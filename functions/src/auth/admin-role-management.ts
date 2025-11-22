/**
 * Firebase Cloud Functions - Admin Role Management
 * Allows admins to manage user roles and permissions
 * Location: Bulgaria | Languages: BG, EN | Currency: EUR
 */

import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

interface SetUserRoleRequest {
  targetUserId: string;
  newRole: 'buyer' | 'seller' | 'admin';
  reason?: string;
}

interface GetUserClaimsRequest {
  targetUserId: string;
}

/**
 * Helper function to check if requesting user is admin
 */
async function isUserAdmin(uid: string): Promise<boolean> {
  try {
    const userRecord = await admin.auth().getUser(uid);
    const claims = userRecord.customClaims || {};
    return claims.admin === true;
  } catch (error) {
    console.error(`Error checking admin status for ${uid}:`, error);
    return false;
  }
}

/**
 * Callable function for admins to set user roles
 * Requires admin privileges
 */
export const setUserRole = functions.https.onCall(
  async (data: SetUserRoleRequest, context) => {
    // 1. Check authentication
    if (!context.auth) {
      throw new functions.https.HttpsError(
        'unauthenticated',
        'User must be authenticated'
      );
    }
    
    const requestingUid = context.auth.uid;
    
    // 2. Check admin privileges
    const isAdmin = await isUserAdmin(requestingUid);
    
    if (!isAdmin) {
      throw new functions.https.HttpsError(
        'permission-denied',
        'Only admins can set user roles'
      );
    }
    
    // 3. Validate input
    if (!data.targetUserId) {
      throw new functions.https.HttpsError(
        'invalid-argument',
        'Target user ID is required'
      );
    }
    
    const validRoles = ['buyer', 'seller', 'admin'];
    if (!validRoles.includes(data.newRole)) {
      throw new functions.https.HttpsError(
        'invalid-argument',
        `Invalid role. Must be one of: ${validRoles.join(', ')}`
      );
    }
    
    try {
      const targetUid = data.targetUserId;
      
      // 4. Get target user
      const targetUser = await admin.auth().getUser(targetUid);
      
      // 5. Build new custom claims
      const newClaims = {
        role: data.newRole,
        seller: data.newRole === 'seller' || data.newRole === 'admin',
        admin: data.newRole === 'admin',
        lastModifiedBy: requestingUid,
        lastModifiedAt: Date.now()
      };
      
      // 6. Set custom claims
      await admin.auth().setCustomUserClaims(targetUid, newClaims);
      console.log(`Admin ${requestingUid} set role for ${targetUid} to ${data.newRole}`);
      
      // 7. Update Firestore user profile
      await admin.firestore().collection('users').doc(targetUid).update({
        role: data.newRole,
        accountType: data.newRole === 'seller' || data.newRole === 'admin' ? 'business' : 'individual',
        roleModifiedBy: requestingUid,
        roleModifiedAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      });
      
      // 8. Log the action
      await admin.firestore().collection('admin_logs').add({
        action: 'set_user_role',
        performedBy: requestingUid,
        targetUser: targetUid,
        oldRole: targetUser.customClaims?.role || 'unknown',
        newRole: data.newRole,
        reason: data.reason || 'No reason provided',
        timestamp: admin.firestore.FieldValue.serverTimestamp()
      });
      
      // 9. Force token refresh for target user
      await admin.database().ref(`metadata/${targetUid}/refreshTime`).set(
        admin.database.ServerValue.TIMESTAMP
      );
      
      return {
        success: true,
        message: `User role updated to ${data.newRole}`,
        targetUserId: targetUid,
        newRole: data.newRole
      };
      
    } catch (error: any) {
      console.error(`Error setting role for ${data.targetUserId}:`, error);
      
      if (error instanceof functions.https.HttpsError) {
        throw error;
      }
      
      throw new functions.https.HttpsError(
        'internal',
        'Failed to set user role',
        error.message
      );
    }
  }
);

/**
 * Callable function to get user's custom claims
 * Admins can check any user, regular users can check their own claims
 */
export const getUserClaims = functions.https.onCall(
  async (data: GetUserClaimsRequest, context) => {
    if (!context.auth) {
      throw new functions.https.HttpsError(
        'unauthenticated',
        'User must be authenticated'
      );
    }
    
    const requestingUid = context.auth.uid;
    const targetUid = data.targetUserId || requestingUid;
    
    try {
      // Check permissions
      const isAdmin = await isUserAdmin(requestingUid);
      const isOwnProfile = targetUid === requestingUid;
      
      if (!isAdmin && !isOwnProfile) {
        throw new functions.https.HttpsError(
          'permission-denied',
          'You can only view your own claims'
        );
      }
      
      // Get user record
      const userRecord = await admin.auth().getUser(targetUid);
      const customClaims = userRecord.customClaims || {};
      
      return {
        success: true,
        userId: targetUid,
        email: userRecord.email,
        claims: customClaims,
        role: customClaims.role || 'buyer',
        isSeller: customClaims.seller === true,
        isAdmin: customClaims.admin === true
      };
      
    } catch (error: any) {
      console.error(`Error getting claims for ${targetUid}:`, error);
      
      if (error instanceof functions.https.HttpsError) {
        throw error;
      }
      
      throw new functions.https.HttpsError(
        'internal',
        'Failed to get user claims',
        error.message
      );
    }
  }
);

/**
 * Callable function to list all users with their roles
 * Admin only
 */
export const listUsersWithRoles = functions.https.onCall(
  async (data, context) => {
    if (!context.auth) {
      throw new functions.https.HttpsError(
        'unauthenticated',
        'User must be authenticated'
      );
    }
    
    const requestingUid = context.auth.uid;
    
    // Check admin privileges
    const isAdmin = await isUserAdmin(requestingUid);
    
    if (!isAdmin) {
      throw new functions.https.HttpsError(
        'permission-denied',
        'Only admins can list all users'
      );
    }
    
    try {
      const maxResults = data.maxResults || 100;
      const pageToken = data.pageToken || undefined;
      
      // List users from Auth
      const listUsersResult = await admin.auth().listUsers(maxResults, pageToken);
      
      // Format user data
      const users = listUsersResult.users.map(userRecord => ({
        uid: userRecord.uid,
        email: userRecord.email,
        displayName: userRecord.displayName,
        emailVerified: userRecord.emailVerified,
        disabled: userRecord.disabled,
        role: userRecord.customClaims?.role || 'buyer',
        isSeller: userRecord.customClaims?.seller === true,
        isAdmin: userRecord.customClaims?.admin === true,
        creationTime: userRecord.metadata.creationTime,
        lastSignInTime: userRecord.metadata.lastSignInTime
      }));
      
      return {
        success: true,
        users,
        totalCount: users.length,
        nextPageToken: listUsersResult.pageToken
      };
      
    } catch (error: any) {
      console.error('Error listing users:', error);
      throw new functions.https.HttpsError(
        'internal',
        'Failed to list users',
        error.message
      );
    }
  }
);

