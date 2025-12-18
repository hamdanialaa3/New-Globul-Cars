// Cloud Function to get REAL user count from Firebase Authentication
// Not from Firestore - from the actual Firebase Auth system!

import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

/**
 * Get the REAL total number of users from Firebase Authentication
 * This reads from the actual Auth system, not from Firestore
 */
export const getAuthUsersCount = functions.https.onCall(async (data, context) => {
  // Verify that caller is the unique owner
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
  }
  
  // Only unique owner can call this
  if (context.auth.token.email !== 'alaa.hamdani@yahoo.com') {
    throw new functions.https.HttpsError('permission-denied', 'Only unique owner can access this data');
  }
  
  try {
    let totalUsers = 0;
    let nextPageToken: string | undefined = undefined;
    const users: Record<string, unknown>[] = [];
    
    // List all users from Firebase Authentication
    // This reads from the REAL Firebase Auth, not Firestore!
    do {
      const listUsersResult = await admin.auth().listUsers(1000, nextPageToken);
      
      listUsersResult.users.forEach((userRecord) => {
        // Exclude the super admin from the count
        if (userRecord.email !== 'alaa.hamdani@yahoo.com') {
          totalUsers++;
          
          users.push({
            uid: userRecord.uid,
            email: userRecord.email,
            displayName: userRecord.displayName || 'No Name',
            photoURL: userRecord.photoURL || null,
            emailVerified: userRecord.emailVerified,
            phoneNumber: userRecord.phoneNumber || null,
            disabled: userRecord.disabled,
            createdAt: userRecord.metadata.creationTime,
            lastSignInTime: userRecord.metadata.lastSignInTime,
            providers: userRecord.providerData.map(p => p.providerId)
          });
        }
      });
      
      nextPageToken = listUsersResult.pageToken;
    } while (nextPageToken);
    
    console.log(`✅ Found ${totalUsers} REAL users in Firebase Authentication`);
    
    return {
      totalUsers,
      users: users.slice(0, 100), // Return first 100 users
      timestamp: new Date().toISOString(),
      source: 'Firebase Authentication (Real Data)'
    };
    
  } catch (error: unknown) {
    const err = error instanceof Error ? error : new Error(String(error));
    console.error('Error getting auth users:', err.message);
    throw new functions.https.HttpsError('internal', `Failed to get users: ${err.message}`);
  }
});

/**
 * Get active users (logged in within last 24 hours)
 */
export const getActiveAuthUsers = functions.https.onCall(async (data, context) => {
  // Verify authentication
  if (!context.auth || context.auth.token.email !== 'alaa.hamdani@yahoo.com') {
    throw new functions.https.HttpsError('permission-denied', 'Not authorized');
  }
  
  try {
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    let activeUsers = 0;
    let nextPageToken: string | undefined = undefined;
    
    do {
      const listUsersResult = await admin.auth().listUsers(1000, nextPageToken);
      
      listUsersResult.users.forEach((userRecord) => {
        if (userRecord.email === 'alaa.hamdani@yahoo.com') return; // Skip super admin
        
        const lastSignIn = userRecord.metadata.lastSignInTime;
        if (lastSignIn) {
          const lastSignInDate = new Date(lastSignIn);
          if (lastSignInDate > oneDayAgo) {
            activeUsers++;
          }
        }
      });
      
      nextPageToken = listUsersResult.pageToken;
    } while (nextPageToken);
    
    return {
      activeUsers,
      period: '24 hours',
      timestamp: new Date().toISOString()
    };
    
  } catch (error: unknown) {
    const err = error instanceof Error ? error : new Error(String(error));
    console.error('Error getting active users:', err.message);
    throw new functions.https.HttpsError('internal', `Failed to get active users: ${err.message}`);
  }
});

/**
 * Sync Firebase Auth users to Firestore
 * This creates/updates user documents in Firestore from Firebase Auth
 */
export const syncAuthToFirestore = functions.https.onCall(async (data, context) => {
  // Verify authentication
  if (!context.auth || context.auth.token.email !== 'alaa.hamdani@yahoo.com') {
    throw new functions.https.HttpsError('permission-denied', 'Not authorized');
  }
  
  try {
    let syncedUsers = 0;
    let nextPageToken: string | undefined = undefined;
    const batch = admin.firestore().batch();
    let batchCount = 0;
    
    do {
      const listUsersResult = await admin.auth().listUsers(1000, nextPageToken);
      
      for (const userRecord of listUsersResult.users) {
        // Skip super admin
        if (userRecord.email === 'alaa.hamdani@yahoo.com') continue;
        
        const userRef = admin.firestore().collection('users').doc(userRecord.uid);
        
        // Check if user exists in Firestore
        const userDoc = await userRef.get();
        
        if (!userDoc.exists) {
          // Create new user document
          batch.set(userRef, {
            uid: userRecord.uid,
            email: userRecord.email,
            displayName: userRecord.displayName || 'User',
            photoURL: userRecord.photoURL || null,
            emailVerified: userRecord.emailVerified,
            phoneNumber: userRecord.phoneNumber || null,
            disabled: userRecord.disabled,
            createdAt: admin.firestore.Timestamp.fromDate(new Date(userRecord.metadata.creationTime)),
            lastLogin: userRecord.metadata.lastSignInTime 
              ? admin.firestore.Timestamp.fromDate(new Date(userRecord.metadata.lastSignInTime))
              : null,
            providers: userRecord.providerData.map(p => p.providerId),
            syncedFromAuth: true,
            syncedAt: admin.firestore.FieldValue.serverTimestamp()
          });
          
          batchCount++;
          syncedUsers++;
          
          // Commit batch every 500 operations (Firestore limit is 500)
          if (batchCount >= 500) {
            await batch.commit();
            batchCount = 0;
          }
        }
      }
      
      nextPageToken = listUsersResult.pageToken;
    } while (nextPageToken);
    
    // Commit remaining operations
    if (batchCount > 0) {
      await batch.commit();
    }
    
    console.log(`✅ Synced ${syncedUsers} users from Auth to Firestore`);
    
    return {
      syncedUsers,
      timestamp: new Date().toISOString(),
      message: `Successfully synced ${syncedUsers} users to Firestore`
    };
    
  } catch (error: unknown) {
    const err = error instanceof Error ? error : new Error(String(error));
    console.error('Error syncing users:', err.message);
    throw new functions.https.HttpsError('internal', `Failed to sync users: ${err.message}`);
  }
});

