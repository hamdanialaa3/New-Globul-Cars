/**
 * Numeric Story ID Service
 * Generates sequential numeric IDs for Stories
 */

import { doc, runTransaction } from 'firebase/firestore';
import { db } from '../../firebase/firebase-config';
import { logger } from '../logger-service';

export const numericStoryIdService = {
    /**
     * Get the next available numeric ID for a new story
     * Increments the 'stories' counter in Firestore
     */
    getNextStoryNumericId: async (): Promise<number> => {
        const counterRef = doc(db, 'counters', 'stories');

        try {
            return await runTransaction(db, async (transaction) => {
                const counterDoc = await transaction.get(counterRef);

                let currentCount = 0;
                if (counterDoc.exists()) {
                    const data = counterDoc.data();
                    currentCount = data.count || 0;
                }

                const nextId = currentCount + 1;

                transaction.set(counterRef, {
                    count: nextId,
                    updatedAt: new Date()
                }, { merge: true });

                return nextId;
            });
        } catch (error) {
            logger.error('Failed to generate numeric story ID', error as Error);
            throw new Error('Failed to generate numeric story ID');
        }
    }
};
