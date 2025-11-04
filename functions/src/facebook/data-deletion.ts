// Facebook Data Deletion Webhook Handler
// Processes data deletion requests from Facebook users
// GDPR and Facebook Platform Policy compliant

import { onRequest } from 'firebase-functions/v2/https';
import * as admin from 'firebase-admin';
import * as crypto from 'crypto';

interface DataDeletionRequest {
  signed_request: string;
}

interface DecodedRequest {
  user_id: string;
  algorithm: string;
  issued_at: number;
}

/**
 * Verify and decode Facebook signed request
 */
function parseSignedRequest(signedRequest: string, appSecret: string): DecodedRequest | null {
  try {
    const [encodedSig, payload] = signedRequest.split('.');
    
    // Decode payload
    const jsonPayload = Buffer.from(payload, 'base64').toString('utf8');
    const data = JSON.parse(jsonPayload);
    
    // Verify signature
    const expectedSig = crypto
      .createHmac('sha256', appSecret)
      .update(payload)
      .digest('base64')
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=/g, '');
    
    if (encodedSig !== expectedSig) {
      console.error('Invalid signature');
      return null;
    }
    
    return data;
  } catch (error) {
    console.error('Error parsing signed request:', error);
    return null;
  }
}

/**
 * Delete user data from Firestore
 */
async function deleteUserData(userId: string): Promise<boolean> {
  try {
    const db = admin.firestore();
    
    // Find user by Facebook ID
    const usersSnapshot = await db.collection('users')
      .where('facebookId', '==', userId)
      .get();
    
    if (usersSnapshot.empty) {
      console.log(`No user found with Facebook ID: ${userId}`);
      return true; // Consider successful if no data exists
    }
    
    const batch = db.batch();
    
    // Delete user documents
    usersSnapshot.docs.forEach(doc => {
      batch.delete(doc.ref);
    });
    
    // Delete related data (cars, messages, etc.)
    for (const userDoc of usersSnapshot.docs) {
      const uid = userDoc.id;
      
      // Delete user's car listings
      const carsSnapshot = await db.collection('cars')
        .where('sellerId', '==', uid)
        .get();
      
      carsSnapshot.docs.forEach(doc => {
        batch.delete(doc.ref);
      });
      
      // Delete user's messages
      const messagesSnapshot = await db.collection('messages')
        .where('userId', '==', uid)
        .get();
      
      messagesSnapshot.docs.forEach(doc => {
        batch.delete(doc.ref);
      });
      
      // Delete user's saved searches
      const searchesSnapshot = await db.collection('savedSearches')
        .where('userId', '==', uid)
        .get();
      
      searchesSnapshot.docs.forEach(doc => {
        batch.delete(doc.ref);
      });
    }
    
    await batch.commit();
    console.log(`Successfully deleted data for Facebook user: ${userId}`);
    return true;
  } catch (error) {
    console.error('Error deleting user data:', error);
    return false;
  }
}

/**
 * Generate confirmation code for Facebook
 */
function generateConfirmationCode(userId: string): string {
  const timestamp = Date.now();
  return crypto
    .createHash('sha256')
    .update(`${userId}_${timestamp}_deleted`)
    .digest('hex')
    .substring(0, 16);
}

/**
 * Data Deletion Webhook Handler
 * Called by Facebook when user requests data deletion
 */
export const handleFacebookDataDeletion = onRequest(
  { cors: true },
  async (request, response) => {
    try {
      // Only accept POST requests
      if (request.method !== 'POST') {
        response.status(405).json({ error: 'Method not allowed' });
        return;
      }
      
      const { signed_request } = request.body as DataDeletionRequest;
      
      if (!signed_request) {
        response.status(400).json({ error: 'Missing signed_request' });
        return;
      }
      
      // Get Facebook App Secret from environment
      const appSecret = process.env.FACEBOOK_APP_SECRET;
      
      if (!appSecret) {
        console.error('FACEBOOK_APP_SECRET not configured');
        response.status(500).json({ error: 'Server configuration error' });
        return;
      }
      
      // Decode and verify the request
      const decodedRequest = parseSignedRequest(signed_request, appSecret);
      
      if (!decodedRequest) {
        response.status(400).json({ error: 'Invalid signed request' });
        return;
      }
      
      const { user_id } = decodedRequest;
      
      // Delete user data
      const deleted = await deleteUserData(user_id);
      
      if (!deleted) {
        response.status(500).json({ error: 'Failed to delete user data' });
        return;
      }
      
      // Generate confirmation code
      const confirmationCode = generateConfirmationCode(user_id);
      
      // Log the deletion for audit
      await admin.firestore().collection('audit_logs').add({
        type: 'facebook_data_deletion',
        userId: user_id,
        confirmationCode,
        timestamp: admin.firestore.FieldValue.serverTimestamp(),
        status: 'completed'
      });
      
      // Return confirmation to Facebook
      response.status(200).json({
        url: `https://mobilebg.eu/data-deletion?confirmation=${confirmationCode}`,
        confirmation_code: confirmationCode
      });
      
    } catch (error) {
      console.error('Error in data deletion handler:', error);
      response.status(500).json({ error: 'Internal server error' });
    }
  }
);

