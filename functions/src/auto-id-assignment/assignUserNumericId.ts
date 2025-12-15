// functions/src/auto-id-assignment/assignUserNumericId.ts
// 🔢 Auto-assign numeric ID when user is created
// Triggered by: Firebase Auth onCreate (Cloud Function)
// Inspired by: mobile.de, AutoScout24 user ID system

import { onDocumentCreated } from 'firebase-functions/v2/firestore';
import { getNextUserNumericId } from '../services/numeric-id-counter.service';
import { logger } from 'firebase-functions/v2';

/**
 * Auto-assign numeric ID to new users
 * 
 * Trigger: Firestore onCreate - users/{userId}
 * 
 * Process:
 * 1. Detect new user document creation
 * 2. Generate next numeric ID (transaction-safe)
 * 3. Update user document with numericId field
 * 4. Log success/failure for monitoring
 * 
 * Example:
 * - User 1: numericId = 1
 * - User 2: numericId = 2
 * - User 100: numericId = 100
 * 
 * URL Result:
 * - /profile/1 → User 1
 * - /profile/2 → User 2
 * - /profile/100 → User 100
 */
export const assignUserNumericId = onDocumentCreated(
  {
    document: 'users/{userId}',
    region: 'europe-west1', // Match your Firebase region
    memory: '256MiB',
    timeoutSeconds: 60,
    maxInstances: 10,
  },
  async (event) => {
    const { userId } = event.params;
    const userData = event.data?.data();

    // Check if numericId already exists (prevent duplicate assignment)
    if (userData?.numericId) {
      logger.info('✅ User already has numeric ID', {
        userId,
        numericId: userData.numericId,
      });
      return;
    }

    try {
      logger.info('🔢 Assigning numeric ID to new user', { userId });

      // Get next numeric ID (transaction-safe)
      const numericId = await getNextUserNumericId();

      // Update user document
      await event.data?.ref.update({
        numericId,
        updatedAt: new Date().toISOString(),
      });

      logger.info('✅ Successfully assigned numeric ID to user', {
        userId,
        numericId,
      });

      return { success: true, numericId };
    } catch (error) {
      logger.error('❌ Failed to assign numeric ID to user', {
        userId,
        error: error instanceof Error ? error.message : String(error),
      });

      // Optionally: Retry logic or alert admin
      throw error;
    }
  }
);
