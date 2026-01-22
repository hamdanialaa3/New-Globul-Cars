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
    getDoc,
    query,
    where,
    orderBy,
    limit,
    Timestamp,
    serverTimestamp,
    increment,
    arrayUnion,
    updateDoc,
    addDoc
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { db, storage } from '../../firebase/firebase-config';
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
     * uploadStoryMedia - Real Firebase Storage upload
     */
    async uploadStoryMedia(userId: string, file: File): Promise<string> {
        const timestamp = Date.now();
        const fileName = `${userId}_${timestamp}.${file.name.split('.').pop()}`;
        const storageRef = ref(storage, `stories/${userId}/${fileName}`);

        await uploadBytes(storageRef, file);
        return await getDownloadURL(storageRef);
    },

    /**
     * Create a new Story
     * Implements "SEO Handshake" -> Updates Car Doc
     */
    createStory: async (data: {
        userId: string;
        userNumericId: number;
        carNumericId: number;
        carId: string;
        type: StoryType;
        mediaFile: File;
        thumbnailFile?: File; // Optional if we generate it client-side
        durationSec: number;
        visibility?: 'public' | 'followers' | 'close_friends';
        caption?: string;
    }): Promise<string> => {
        try {
            // 1. Security & Plan Check
            const allowed = await checkUserPlanLimit(data.userId);
            if (!allowed) {
                throw new Error('User plan limit reached for stories.');
            }

            // 2. Upload Media
            const videoUrl = await storyService.uploadStoryMedia(data.userId, data.mediaFile);
            let thumbnailUrl = '';
            if (data.thumbnailFile) {
                thumbnailUrl = await storyService.uploadStoryMedia(data.userId, data.thumbnailFile);
            }

            // 3. Assign Numeric ID
            const storyNumericId = await numericStoryIdService.getNextStoryNumericId();
            const storyId = `story-${storyNumericId}`;

            // 4. Fetch Author Info for performance
            const userDoc = await getDoc(doc(db, 'users', data.userId));
            const userData = userDoc.exists() ? userDoc.data() : {};

            const now = Date.now();
            const expiresAt = now + 24 * 60 * 60 * 1000;

            // 5. Construct Story Object
            const storyData: CarStory = {
                id: storyId,
                carNumericId: data.carNumericId,
                sellerNumericId: data.userNumericId,
                authorId: data.userId,
                type: data.type,
                videoUrl: videoUrl,
                thumbnailUrl: thumbnailUrl || videoUrl, // Fallback to video if no thumb
                durationSec: data.durationSec,
                createdAt: now,
                expiresAt: expiresAt,
                status: 'active',
                viewCount: 0,
                viewedBy: [],
                reactions: {},
                visibility: data.visibility || 'public',
                authorInfo: {
                    displayName: userData.displayName || 'Anonymous',
                    profileImage: userData.profileImage?.url,
                    profileType: userData.profileType || 'private',
                    isVerified: userData.isVerified || false
                }
            };

            const dbPayload = {
                ...storyData,
                createdAt: serverTimestamp(),
                expiresAt: Timestamp.fromMillis(expiresAt),
                linkedCarId: data.carId
            };

            const storyRef = doc(db, 'stories', storyId);

            // 6. Save Story
            await setDoc(storyRef, dbPayload);

            // 7. SEO Handshake: Update Car Document
            await unifiedCarService.updateCarVideoStatus(
                data.carId,
                { hasVideo: true, videoUrl: videoUrl }
            );

            logger.info(`Story created successfully: ${storyId}`);
            return storyId;

        } catch (error) {
            logger.error('Failed to create story', error as Error, { userId: data.userId });
            throw error;
        }
    },

    /**
     * Get Stories (Smart Feed)
     * Fetches top 20 active stories globally or for followers
     */
    getStories: async (userId?: string): Promise<CarStory[]> => {
        try {
            const storiesRef = collection(db, 'stories');
            let q;

            if (userId) {
                // If userId provided, we could prioritize followed users (future logic)
                // For Phase 1, just get active global stories
                q = query(
                    storiesRef,
                    where('status', '==', 'active'),
                    where('expiresAt', '>', Timestamp.now()),
                    orderBy('createdAt', 'desc'),
                    limit(20)
                );
            } else {
                q = query(
                    storiesRef,
                    where('status', '==', 'active'),
                    where('expiresAt', '>', Timestamp.now()),
                    orderBy('createdAt', 'desc'),
                    limit(20)
                );
            }

            const snapshot = await getDocs(q);

            return snapshot.docs.map((doc: any) => {
                const data = doc.data();
                return {
                    id: doc.id,
                    ...data,
                    createdAt: data.createdAt?.toMillis ? data.createdAt.toMillis() : Date.now(),
                    expiresAt: data.expiresAt?.toMillis ? data.expiresAt.toMillis() : Date.now() + 86400000
                } as CarStory;
            });

        } catch (error) {
            logger.error('Failed to get stories', error as Error);
            return [];
        }
    },

    /**
     * Record story view
     */
    async recordView(storyId: string, viewerId: string): Promise<void> {
        try {
            const storyRef = doc(db, 'stories', storyId);
            await updateDoc(storyRef, {
                viewCount: increment(1),
                viewedBy: arrayUnion(viewerId)
            });

            // Sub-collection for detailed analytics if needed
            await addDoc(collection(db, 'stories', storyId, 'views'), {
                viewerId,
                viewedAt: serverTimestamp()
            });
        } catch (error) {
            logger.error('Failed to record story view', error as Error);
        }
    },

    /**
     * addReaction
     */
    async addReaction(storyId: string, userId: string, emoji: string): Promise<void> {
        try {
            const storyRef = doc(db, 'stories', storyId);
            await updateDoc(storyRef, {
                [`reactions.${userId}`]: emoji
            });
        } catch (error) {
            logger.error('Failed to add reaction', error as Error);
        }
    },

    /**
     * deleteStory
     */
    async deleteStory(storyId: string, userId: string): Promise<void> {
        try {
            const storyRef = doc(db, 'stories', storyId);
            const storyDoc = await getDoc(storyRef);

            if (!storyDoc.exists()) throw new Error('Story not found');
            if (storyDoc.data().authorId !== userId) throw new Error('Unauthorized');

            // 1. Delete media
            const storyData = storyDoc.data();
            if (storyData.videoUrl) {
                try {
                    const mediaRef = ref(storage, storyData.videoUrl);
                    await deleteObject(mediaRef);
                } catch (e) {
                    logger.warn('Failed to delete story media from storage', { error: (e as Error).message });
                }
            }

            // 2. Mark as deleted in DB
            await updateDoc(storyRef, {
                status: 'deleted',
                deletedAt: serverTimestamp()
            });

            logger.info(`Story deleted: ${storyId}`);
        } catch (error) {
            logger.error('Failed to delete story', error as Error);
            throw error;
        }
    }
};
