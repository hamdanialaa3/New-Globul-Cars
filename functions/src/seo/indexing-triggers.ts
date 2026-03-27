import * as functions from 'firebase-functions/v1';
import { indexingService } from './indexing-service';

const logger = functions.logger;
const BASE_URL = 'https://koli.one';

// Handled dynamically via exports

/**
 * Creates a generic Firestore trigger for sending new car URLs to Google Indexing API
 */
const createIndexingTrigger = (collectionName: string) => {
    return functions.firestore
        .document(`${collectionName}/{carId}`)
        .onCreate(async (snap, context) => {
            const carData = snap.data();
            const carId = context.params.carId;

            if (!carData) return null;

            // Wait until it's published
            if (carData.status === 'draft') return null;

            // Construct proper URL
            const sellerId = carData.sellerNumericId || carData.sellerId;
            const carNumericId = carData.carNumericId || carId;

            if (!sellerId || !carNumericId) {
                logger.warn(`Cannot index new ${collectionName} - missing ID data`, { carId });
                return null;
            }

            const url = `${BASE_URL}/car/${sellerId}/${carNumericId}`;
            logger.info(`🔥 Google Indexing Triggered for New Car: ${url}`);

            try {
                // Ping Google API
                await indexingService.requestIndexing(url, 'URL_UPDATED');
                
                logger.info(`✅ Successfully PINGED Google to index: ${url}`);
                return { success: true };
            } catch (error) {
                logger.error(`❌ Failed to PING Google Indexing for ${url}`, error);
                return null;
            }
        });
};

/**
 * Creates a generic Firestore trigger for sending sold/deleted car URLs to Google to remove/update snippet
 */
const createRemovalTrigger = (collectionName: string) => {
    return functions.firestore
        .document(`${collectionName}/{carId}`)
        .onUpdate(async (change, context) => {
            const before = change.before.data();
            const after = change.after.data();

            // Detect status change to sold
            if (!before.isSold && after.isSold) {
                const sellerId = after.sellerNumericId || after.sellerId;
                const carNumericId = after.carNumericId || context.params.carId;

                const url = `${BASE_URL}/car/${sellerId}/${carNumericId}`;
                logger.info(`🏁 Car sold! Pinging Google to update SERP status for: ${url}`);
                
                try {
                    // Update index indicating it's no longer available
                    await indexingService.requestIndexing(url, 'URL_UPDATED');
                } catch (error) {
                    logger.error(`Failed to update Google Indexing API for sold car: ${url}`, error);
                }
            }
            return null;
        });
};

// ============================================================================
// EXPORTS FOR ALL 6 VEHICLE COLLECTIONS
// ============================================================================

export const onPassengerCarCreatedIndexing = createIndexingTrigger('passenger_cars');
export const onSuvCreatedIndexing = createIndexingTrigger('suvs');
export const onVanCreatedIndexing = createIndexingTrigger('vans');
export const onMotorcycleCreatedIndexing = createIndexingTrigger('motorcycles');
export const onTruckCreatedIndexing = createIndexingTrigger('trucks');
export const onBusCreatedIndexing = createIndexingTrigger('buses');

export const onPassengerCarSoldIndexing = createRemovalTrigger('passenger_cars');
export const onSuvSoldIndexing = createRemovalTrigger('suvs');
export const onVanSoldIndexing = createRemovalTrigger('vans');
export const onMotorcycleSoldIndexing = createRemovalTrigger('motorcycles');
export const onTruckSoldIndexing = createRemovalTrigger('trucks');
export const onBusSoldIndexing = createRemovalTrigger('buses');
