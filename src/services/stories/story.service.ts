/**
 * Story Service - "The Mastermind"
 * Handles creation, retrieval, and management of Car Stories.
 * 
 * Architectural Patterns:
 * 1. SEO Handshake: Updates parent Car document on story creation.
 * 2. Smart Feed Query: Efficiently fetches only active stories.
 * 3. Numeric IDs: Enforces sequential numeric IDs.
 */

import {
    collection,
    doc,
    setDoc,
    getDocs,
    query,
    where,
    orderBy,
    limit,
    Timestamp,
    serverTimestamp
} from 'firebase/firestore';
import { db } from '../../firebase/firebase-config';
import { unifiedCarService } from '../car/unified-car-service';
import { numericStoryIdService } from './numeric-story-id.service';
import { logger } from '../logger-service';
import { CarStory, StoryType } from '../../types/story.types';

// TODO: Import actual plan-limits.service.ts when available
const checkUserPlanLimit = async (userId: string): Promise<boolean> => {
    // MOCK: Always return true for Phase 1
    return true;
};

export const storyService = {
    /**
     * Create a new Story
     * Implements "SEO Handshake" -> Updates Car Doc
     */
    createStory: async (data: {
        userId: string;
        userNumericId: number;
        carNumericId: number;
        carId: string; // Needed for Firestore update
        type: StoryType;
        mediaUrl: string;
        thumbnailUrl: string;
        durationSec: number;
    }): Promise<string> => {
        try {
            // 1. Security & Plan Check
            const allowed = await checkUserPlanLimit(data.userId);
            if (!allowed) {
                throw new Error('User plan limit reached for stories.');
            }

            // 2. Assign Numeric ID
            const storyNumericId = await numericStoryIdService.getNextStoryNumericId();
            const storyId = `story-${storyNumericId}`; // Firestore Doc ID

            // 3. Construct Story Object
            const storyData: CarStory = {
                id: storyId,
                carNumericId: data.carNumericId,
                sellerNumericId: data.userNumericId,
                type: data.type,
                videoUrl: data.mediaUrl,
                thumbnailUrl: data.thumbnailUrl,
                durationSec: data.durationSec,
                createdAt: Date.now(), // Using number timestamp as per interface
                views: 0,
                // Additional Metadata helpful for querying but not in strict interface? 
                // Interface defines minimal set. We should stick to it, but add expiration handling logic here.
                // However, the interface 'CarStory' doesn't have 'expiresAt'. 
                // CHECK: Does the user want 'expiresAt' in the interface or just in DB?
                // The requirement says: "where('expiresAt', '>', Timestamp.now())"
                // So we MUST save 'expiresAt' to Firestore.
            };

            // Enhance with DB-only fields (or cast to any if strict typing blocks)
            const dbPayload = {
                ...storyData,
                expiresAt: Timestamp.fromMillis(Date.now() + 24 * 60 * 60 * 1000), // 24 hours expiry
                createdAt: serverTimestamp(), // Use server timestamp for DB consistency
                linkedCarId: data.carId // Store reference to parent car doc ID
            };

            const storyRef = doc(db, 'stories', storyId);

            // 4. Save Story
            await setDoc(storyRef, dbPayload);

            // 5. SEO Handshake: Update Car Document
            // This is CRITICAL.
            // We enable this for ALL story types as they all enhance the listing.
            if (true) {
                await unifiedCarService.updateCarVideoStatus(
                    data.carId,
                    { hasVideo: true, videoUrl: data.mediaUrl }
                );
            }

            logger.info(`Story created successfully: ${storyId}`);
            return storyId;

        } catch (error) {
            logger.error('Failed to create story', error as Error);
            throw error;
        }
    },

    /**
     * Get Stories (Smart Feed)
     * Fetches top 20 active stories
     */
    getStories: async (): Promise<CarStory[]> => {
        try {
            const storiesRef = collection(db, 'stories');

            // Query: Not expired, Ordered by Expiry (Ascending -> expiring soonest first? or Descending?)
            // Usually we want newest first, but the requirement said:
            // "where('expiresAt', '>', Timestamp.now()) orderBy('expiresAt', 'asc')"
            // This brings stories that are about to expire soonest? or maybe ensuring index usage?
            // Let's stick to the prompt's suggestion for now to ensure index compliance if pre-configured.
            // But realistically for a feed, we usually want 'orderBy created desc'.
            // Prompt said: "or createAt desc, requires index"
            // I will use 'createdAt' 'desc' as it makes more sense for a "Feed", enforcing index creation if needed.
            // Wait, strict guardrails said: "orderBy('expiresAt', 'asc') // or createAt desc"
            // Let's use createdAt desc for better UX, and I'll handle the index requirement (by expecting it).

            const q = query(
                storiesRef,
                where('expiresAt', '>', Timestamp.now()),
                orderBy('createdAt', 'desc'),
                limit(20)
            );

            const snapshot = await getDocs(q);

            return snapshot.docs.map(doc => {
                const data = doc.data();
                // Map back to strict CarStory interface
                return {
                    id: doc.id,
                    carNumericId: data.carNumericId,
                    sellerNumericId: data.sellerNumericId,
                    type: data.type,
                    videoUrl: data.videoUrl,
                    thumbnailUrl: data.thumbnailUrl,
                    durationSec: data.durationSec,
                    createdAt: data.createdAt?.toMillis ? data.createdAt.toMillis() : Date.now(),
                    views: data.views || 0,
                    order: data.order
                } as CarStory;
            });

        } catch (error) {
            logger.error('Failed to get stories', error as Error);
            return [];
        }
    }
};
