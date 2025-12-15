// functions/src/auto-id-assignment/assignCarNumericId.ts
// 🔢 Auto-assign numeric ID when car listing is created
// Triggered by: Firestore onCreate - cars/{carId}
// Hierarchical: Each seller has their own car counter (1, 2, 3...)

import { onDocumentCreated } from 'firebase-functions/v2/firestore';
import { getNextCarNumericId } from '../services/numeric-id-counter.service';
import { logger } from 'firebase-functions/v2';

/**
 * Auto-assign numeric ID to new car listings
 * 
 * Trigger: Firestore onCreate - cars/{carId}
 * 
 * Process:
 * 1. Detect new car document creation
 * 2. Get seller's numeric ID from user lookup
 * 3. Generate next car number for this seller (transaction-safe)
 * 4. Update car document with numericId + sellerNumericId
 * 5. Log success/failure for monitoring
 * 
 * Example:
 * - User 1's cars: numericId = 1, 2, 3...
 * - User 2's cars: numericId = 1, 2, 3...
 * - User 100's cars: numericId = 1, 2, 3...
 * 
 * URL Result:
 * - /profile/1/1 → User 1's Car #1
 * - /profile/1/2 → User 1's Car #2
 * - /profile/2/1 → User 2's Car #1
 * - /profile/100/5 → User 100's Car #5
 * 
 * Hierarchical Structure (like mobile.de):
 * - Each seller has independent car numbering
 * - Clean, predictable URLs
 * - Easy to understand: seller/car relationship
 */
export const assignCarNumericId = onDocumentCreated(
  {
    document: 'cars/{carId}',
    region: 'europe-west1', // Match your Firebase region
    memory: '256MiB',
    timeoutSeconds: 60,
    maxInstances: 100, // Cars created more frequently than users
  },
  async (event) => {
    const { carId } = event.params;
    const carData = event.data?.data();

    // Check if numericId already exists (prevent duplicate assignment)
    if (carData?.numericId) {
      logger.info('✅ Car already has numeric ID', {
        carId,
        numericId: carData.numericId,
        sellerId: carData.sellerId,
      });
      return;
    }

    try {
      const sellerId = carData?.sellerId;

      if (!sellerId) {
        logger.error('❌ Car created without sellerId', { carId });
        throw new Error('Car must have sellerId');
      }

      logger.info('🔢 Assigning numeric ID to new car', { carId, sellerId });

      // Get seller's numeric ID
      const admin = require('firebase-admin');
      const db = admin.firestore();
      const sellerDoc = await db.collection('users').doc(sellerId).get();
      const sellerData = sellerDoc.data();

      if (!sellerData?.numericId) {
        logger.error('❌ Seller does not have numeric ID yet', { sellerId });
        throw new Error('Seller must have numericId before creating car');
      }

      const sellerNumericId = sellerData.numericId;

      // Get next car number for this seller (transaction-safe)
      const carNumericId = await getNextCarNumericId(sellerId);

      // Update car document
      await event.data?.ref.update({
        numericId: carNumericId,
        sellerNumericId,
        updatedAt: new Date().toISOString(),
      });

      logger.info('✅ Successfully assigned numeric ID to car', {
        carId,
        sellerId,
        sellerNumericId,
        carNumericId,
        profileUrl: `/profile/${sellerNumericId}/${carNumericId}`,
      });

      return { 
        success: true, 
        numericId: carNumericId,
        sellerNumericId,
        profileUrl: `/profile/${sellerNumericId}/${carNumericId}`,
      };
    } catch (error) {
      logger.error('❌ Failed to assign numeric ID to car', {
        carId,
        error: error instanceof Error ? error.message : String(error),
      });

      // Optionally: Retry logic or alert admin
      throw error;
    }
  }
);
