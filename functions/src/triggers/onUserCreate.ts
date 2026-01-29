/**
 * ⚠️ SECURITY: Backend-Only Numeric ID Assignment
 * 
 * Purpose: Assign unique numeric IDs to new users (server-side only)
 * Previous: Client-side assignment via ensureUserNumericId (REMOVED)
 * Current: Server-side trigger on user creation
 * 
 * Firestore Collections:
 * - counters/users -> Global user counter
 * - users/{uid} -> User profile with numericId field
 * - numeric_ids/{numericId} -> Mapping numeric -> Firebase UID
 * 
 * Security Rules:
 * - counters: Backend writes only (client blocked)
 * - users: Backend writes numericId (client can read)
 * - numeric_ids: Backend only (client blocked)
 * 
 * Created: January 25, 2026
 */

import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

const MAX_RETRIES = 3;
const RETRY_DELAY_MS = 500;

/**
 * Assign numeric ID to new user (with transaction safety)
 */
async function assignNumericId(uid: string, attempt: number = 1): Promise<number | null> {
  const db = admin.firestore();
  
  try {
    // Use transaction to ensure atomic increment
    const numericId = await db.runTransaction(async (transaction) => {
      const counterRef = db.collection('counters').doc('users');
      const counterDoc = await transaction.get(counterRef);
      
      // Initialize counter if it doesn't exist
      let currentCount = 0;
      if (counterDoc.exists) {
        currentCount = counterDoc.data()?.count || 0;
      }
      
      const newNumericId = currentCount + 1;
      
      // Update counter
      transaction.set(counterRef, { 
        count: newNumericId,
        lastUpdated: admin.firestore.FieldValue.serverTimestamp()
      }, { merge: true });
      
      // Update user document
      const userRef = db.collection('users').doc(uid);
      transaction.set(userRef, {
        numericId: newNumericId,
        numericIdAssignedAt: admin.firestore.FieldValue.serverTimestamp()
      }, { merge: true });
      
      // Create numeric ID mapping for URL resolution
      const mappingRef = db.collection('numeric_ids').doc(String(newNumericId));
      transaction.set(mappingRef, {
        uid,
        createdAt: admin.firestore.FieldValue.serverTimestamp()
      });
      
      return newNumericId;
    });
    
    functions.logger.info('Numeric ID assigned successfully', {
      uid,
      numericId,
      attempt
    });
    
    return numericId;
    
  } catch (error) {
    functions.logger.error('Failed to assign numeric ID', {
      uid,
      attempt,
      error: error instanceof Error ? error.message : String(error)
    });
    
    // Retry on contention or transient errors
    if (attempt < MAX_RETRIES) {
      functions.logger.info(`Retrying numeric ID assignment (${attempt + 1}/${MAX_RETRIES})`, { uid });
      await new Promise(resolve => setTimeout(resolve, RETRY_DELAY_MS * attempt));
      return assignNumericId(uid, attempt + 1);
    }
    
    return null;
  }
}

/**
 * Firebase Firestore Trigger - On User Document Creation
 * 
 * This runs when a new user document is created in Firestore.
 * It assigns a numeric ID if one doesn't exist yet.
 * 
 * Note: The user doc might be created by:
 * 1. Auth onCreate trigger (from another function)
 * 2. Client-side registration flow (legacy)
 * 3. OAuth providers
 */
export const onUserCreate = functions
  .region('europe-west1')
  .firestore
  .document('users/{userId}')
  .onCreate(async (snap, context) => {
    const userId = context.params.userId;
    const userData = snap.data();
    
    try {
      functions.logger.info('User document created', { 
        userId,
        hasNumericId: !!userData.numericId 
      });

      // Skip if numeric ID already exists
      if (userData.numericId) {
        functions.logger.info('User already has numeric ID', {
          userId,
          numericId: userData.numericId
        });
        return;
      }

      // Assign numeric ID
      const numericId = await assignNumericId(userId);
      
      if (!numericId) {
        functions.logger.error('Failed to assign numeric ID after retries', { userId });
        
        // Create a manual review record
        await admin.firestore().collection('admin_tasks').add({
          type: 'missing_numeric_id',
          userId,
          createdAt: admin.firestore.FieldValue.serverTimestamp(),
          status: 'pending',
          priority: 'high'
        });
      }
      
    } catch (error) {
      functions.logger.error('Error in onUserCreate trigger', {
        userId,
        error: error instanceof Error ? error.message : String(error)
      });
      
      // Don't throw - let the user continue (fail-open)
      // Admin can fix numeric IDs later via scripts/assign-missing-numeric-ids.ts
    }
  });

/**
 * Callable Function - Get User's Numeric ID
 * 
 * Fallback for clients that need immediate numeric ID access.
 * Waits for backend assignment if not yet available.
 */
export const getUserNumericId = functions
  .region('europe-west1')
  .https
  .onCall(async (data, context) => {
    // Require authentication
    if (!context.auth) {
      throw new functions.https.HttpsError(
        'unauthenticated',
        'Authentication required'
      );
    }

    const userId = data.userId || context.auth.uid;

    // Security: Users can only query their own numeric ID (or admins can query any)
    const isAdmin = context.auth.token.admin === true;
    if (userId !== context.auth.uid && !isAdmin) {
      throw new functions.https.HttpsError(
        'permission-denied',
        'Cannot access other users numeric IDs'
      );
    }

    try {
      const db = admin.firestore();
      const userDoc = await db.collection('users').doc(userId).get();
      
      if (!userDoc.exists) {
        throw new functions.https.HttpsError(
          'not-found',
          'User document not found'
        );
      }

      const numericId = userDoc.data()?.numericId;
      
      if (!numericId) {
        // Try to assign one now (emergency fallback)
        functions.logger.warn('Numeric ID missing, attempting emergency assignment', { userId });
        const assigned = await assignNumericId(userId);
        
        if (!assigned) {
          throw new functions.https.HttpsError(
            'internal',
            'Failed to assign numeric ID'
          );
        }
        
        return { numericId: assigned };
      }

      return { numericId };
      
    } catch (error) {
      functions.logger.error('Error in getUserNumericId', {
        userId,
        error: error instanceof Error ? error.message : String(error)
      });
      
      if (error instanceof functions.https.HttpsError) {
        throw error;
      }
      
      throw new functions.https.HttpsError(
        'internal',
        'Failed to retrieve numeric ID'
      );
    }
  });
