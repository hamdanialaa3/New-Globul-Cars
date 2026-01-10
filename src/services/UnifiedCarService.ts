import { unifiedCarService as modularService } from './car/unified-car-service';
import { db } from '../firebase/firebase-config';
import { serverTimestamp } from 'firebase/firestore';
import { numericCarSystemService } from './numeric-car-system.service';
import { auth } from '../firebase/firebase-config';
import { logger } from './logger-service';

export const UnifiedCarService = {
    ...modularService,

    /**
     * Clone a car listing (Legacy method kept for reference)
     */
    async cloneCarListing(sourceCarId: string, userId: string): Promise<string> {
        return modularService.createCar({
            ...await modularService.getCarById(sourceCarId),
            sellerId: userId,
            status: 'draft',
            isCloned: true
        }).then(res => res.id);
    },

    /**
     * Create car listing with strict Numeric ID System
     * This implements the "Project Constitution" logic explicitly requested.
     */
    async createCarListing(
        data: any,
        userProfile: { uid: string; numericId: number }
    ): Promise<{ id: string; sellerNumericId: number; carNumericId: number }> {
        // Determine user numeric ID (either passed or fetched from current auth)
        let sellerNumericId = userProfile?.numericId;
        if (!sellerNumericId && auth.currentUser) {
            sellerNumericId = await numericCarSystemService.getUserNumericId(auth.currentUser.uid);
        }

        if (!sellerNumericId) {
            throw new Error('User Numeric ID is required for strict car creation.');
        }

        // 2. Generate Sequence ID
        const nextSequenceId = await numericCarSystemService.getNextCarNumericId(userProfile.uid || auth.currentUser?.uid || '');

        // 3. Prepare strict data
        const newCarData = {
            ...data,
            sellerId: userProfile.uid,
            sellerNumericId: sellerNumericId,
            carNumericId: nextSequenceId,

            // Aliases for compatibility
            ownerNumericId: sellerNumericId,
            userCarSequenceId: nextSequenceId,

            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
            status: data.status || 'active',
            images: data.images || [],
            price: data.price || 0,
            make: data.make || '',
            model: data.model || '',
        };

        // 4. Save to Firestore
        const result = await modularService.createCar(newCarData);

        logger.info('Car created', { sellerNumericId: result.sellerNumericId, carNumericId: result.carNumericId });

        return {
            id: result.id,
            sellerNumericId: result.sellerNumericId,
            carNumericId: result.carNumericId
        };
    },

    async updateCarVideoStatus(
        carId: string,
        status: { hasVideo: boolean, videoUrl?: string }
    ): Promise<void> {
        if (!carId) throw new Error('Car ID is required');

        // Use modular updateCar to ensure consistency and cache invalidation
        await modularService.updateCar(carId, {
            hasVideo: status.hasVideo,
            videoUrl: status.videoUrl,
            updatedAt: serverTimestamp() as any
        });

        logger.info('Car video status updated', { carId });
    }
};

export const unifiedCarService = UnifiedCarService;
export default UnifiedCarService;
