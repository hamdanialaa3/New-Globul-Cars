/**
 * Numeric System Validation Cloud Functions
 * 🔢 Strict validation for numeric IDs and messaging system
 * 
 * Functions:
 * 1. validateNumericCar() - Verify car numeric IDs are correct
 * 2. validateNumericMessage() - Verify message between valid users
 * 3. enforceCarOwnership() - Prevent unauthorized car updates
 * 
 * @file numeric-system-validation.ts
 * @since 2025-12-16
 */

import { onCall, HttpsError } from 'firebase-functions/v2/https';
import { getFirestore, doc, getDoc, query, collection, where, getDocs } from 'firebase-admin/firestore';
import { getAuth } from 'firebase-admin/auth';

const db = getFirestore();
const auth = getAuth();

/**
 * ✅ Validate Numeric Car
 * Verifies:
 * - User numeric ID exists and matches
 * - Car numeric ID is correct for user
 * - Car is not sold
 */
export const validateNumericCar = onCall(
  { cors: true, region: 'europe-west1' },
  async (request) => {
    try {
      const { userNumericId, carNumericId } = request.data;

      // 1️⃣ Validate input
      if (typeof userNumericId !== 'number' || typeof carNumericId !== 'number') {
        throw new HttpsError(
          'invalid-argument',
          '❌ Invalid numeric IDs: must be numbers'
        );
      }

      if (userNumericId <= 0 || carNumericId <= 0) {
        throw new HttpsError(
          'invalid-argument',
          '❌ Invalid numeric IDs: must be positive'
        );
      }

      // 2️⃣ Find user by numeric ID
      const usersQuery = query(
        collection(db, 'users'),
        where('numericId', '==', userNumericId)
      );

      const usersSnapshot = await getDocs(usersQuery);

      if (usersSnapshot.empty) {
        throw new HttpsError(
          'not-found',
          `❌ User not found: numeric ID ${userNumericId}`
        );
      }

      const userId = usersSnapshot.docs[0].id;

      // 3️⃣ Find car by seller and car numeric IDs
      const carsQuery = query(
        collection(db, 'cars'),
        where('sellerId', '==', userId),
        where('carNumericId', '==', carNumericId)
      );

      const carsSnapshot = await getDocs(carsQuery);

      if (carsSnapshot.empty) {
        throw new HttpsError(
          'not-found',
          `❌ Car not found: /car/${userNumericId}/${carNumericId}`
        );
      }

      const carDoc = carsSnapshot.docs[0];
      const carData = carDoc.data();

      // 4️⃣ Check if car is sold
      if (carData.status === 'sold' || carData.isSold === true) {
        throw new HttpsError(
          'failed-precondition',
          '❌ This car has been sold'
        );
      }

      // 5️⃣ Return validated data
      return {
        valid: true,
        carId: carDoc.id,
        userNumericId,
        carNumericId,
        make: carData.make,
        model: carData.model,
        year: carData.year,
        price: carData.price,
        url: `/car/${userNumericId}/${carNumericId}`
      };
    } catch (error) {
      console.error('❌ validateNumericCar error:', error);

      if (error instanceof HttpsError) {
        throw error;
      }

      throw new HttpsError('internal', '❌ Internal server error');
    }
  }
);

/**
 * ✅ Validate Numeric Message
 * Verifies:
 * - Sender numeric ID matches current user
 * - Recipient numeric ID exists
 * - Message content is valid
 */
export const validateNumericMessage = onCall(
  { cors: true, region: 'europe-west1' },
  async (request) => {
    try {
      const { senderNumericId, recipientNumericId, subject, content } = request.data;

      if (!request.auth) {
        throw new HttpsError('unauthenticated', '❌ Not authenticated');
      }

      const uid = request.auth.uid;

      // 1️⃣ Verify sender owns numeric ID
      const senderQuery = query(
        collection(db, 'users'),
        where('numericId', '==', senderNumericId)
      );

      const senderSnapshot = await getDocs(senderQuery);

      if (senderSnapshot.empty) {
        throw new HttpsError(
          'not-found',
          `❌ Sender numeric ID not found: ${senderNumericId}`
        );
      }

      const senderId = senderSnapshot.docs[0].id;

      if (senderId !== uid) {
        throw new HttpsError(
          'permission-denied',
          `❌ You do not own numeric ID ${senderNumericId}`
        );
      }

      // 2️⃣ Verify recipient exists
      const recipientQuery = query(
        collection(db, 'users'),
        where('numericId', '==', recipientNumericId)
      );

      const recipientSnapshot = await getDocs(recipientQuery);

      if (recipientSnapshot.empty) {
        throw new HttpsError(
          'not-found',
          `❌ Recipient not found: numeric ID ${recipientNumericId}`
        );
      }

      const recipientId = recipientSnapshot.docs[0].id;

      // 3️⃣ Validate message content
      if (!subject || typeof subject !== 'string' || subject.trim().length === 0) {
        throw new HttpsError(
          'invalid-argument',
          '❌ Subject is required'
        );
      }

      if (!content || typeof content !== 'string' || content.trim().length === 0) {
        throw new HttpsError(
          'invalid-argument',
          '❌ Content is required'
        );
      }

      if (content.length > 5000) {
        throw new HttpsError(
          'invalid-argument',
          '❌ Content too long (max 5000 characters)'
        );
      }

      // 4️⃣ Return validated message
      return {
        valid: true,
        senderId,
        senderNumericId,
        recipientId,
        recipientNumericId,
        subject: subject.trim(),
        content: content.trim()
      };
    } catch (error) {
      console.error('❌ validateNumericMessage error:', error);

      if (error instanceof HttpsError) {
        throw error;
      }

      throw new HttpsError('internal', '❌ Internal server error');
    }
  }
);

/**
 * ✅ Enforce Car Ownership
 * Prevents:
 * - Updating cars you don't own
 * - Marking other people's cars as sold
 * - Unauthorized price changes
 */
export const enforceCarOwnership = onCall(
  { cors: true, region: 'europe-west1' },
  async (request) => {
    try {
      const { carId, userNumericId, carNumericId } = request.data;

      if (!request.auth) {
        throw new HttpsError('unauthenticated', '❌ Not authenticated');
      }

      const uid = request.auth.uid;

      // 1️⃣ Get car document
      const carDoc = await getDoc(doc(db, 'cars', carId));

      if (!carDoc.exists()) {
        throw new HttpsError('not-found', '❌ Car not found');
      }

      const carData = carDoc.data();

      // 2️⃣ Verify car belongs to user
      if (carData.sellerId !== uid) {
        throw new HttpsError(
          'permission-denied',
          '❌ You do not own this car'
        );
      }

      // 3️⃣ Verify numeric IDs match
      if (
        carData.sellerNumericId !== userNumericId ||
        carData.carNumericId !== carNumericId
      ) {
        throw new HttpsError(
          'invalid-argument',
          `❌ Numeric ID mismatch. Expected /car/${carData.sellerNumericId}/${carData.carNumericId}`
        );
      }

      return {
        authorized: true,
        carId,
        userNumericId,
        carNumericId,
        make: carData.make,
        model: carData.model
      };
    } catch (error) {
      console.error('❌ enforceCarOwnership error:', error);

      if (error instanceof HttpsError) {
        throw error;
      }

      throw new HttpsError('internal', '❌ Internal server error');
    }
  }
);
