import * as functions from 'firebase-functions/v1';
import * as admin from 'firebase-admin';

/**
 * TASK-07: Price Drop Alerts System
 * 
 * This Cloud Function monitors price changes across all car collections and sends
 * push notifications to users who have saved searches matching the updated car.
 * 
 * Collections monitored:
 * - cars, cars_sold, cars_pending, cars_rejected, cars_featured, cars_draft, cars_expired
 * 
 * Notification flow:
 * 1. onUpdate trigger fires when a car document changes
 * 2. Check if price decreased (newPrice < oldPrice)
 * 3. Query saved_searches for matching criteria
 * 4. Send push notification to matching users via their expo_push_tokens
 */

interface SavedSearch {
    userId: string;
    userFirebaseId: string;
    make?: string;
    model?: string;
    yearMin?: number;
    yearMax?: number;
    priceMax?: number;
    mileageMax?: number;
    categories?: string[];
    fuelTypes?: string[];
    transmissions?: string[];
    bodyTypes?: string[];
    regions?: string[];
    createdAt: string;
    isActive: boolean;
    notificationsEnabled: boolean;
}

interface PriceAlert {
    userId: string;
    userFirebaseId: string;
    carId: string;
    carNumericId: number;
    carMake: string;
    carModel: string;
    oldPrice: number;
    newPrice: number;
    discount: number;
    discountPercent: number;
    notificationSent: boolean;
    notificationSentAt?: string;
    createdAt: string;
}

/**
 * Helper: Check if car matches saved search criteria
 */
function carMatchesSavedSearch(carData: any, search: SavedSearch): boolean {
    // Make & Model match
    if (search.make && carData.make !== search.make) return false;
    if (search.model && carData.model !== search.model) return false;

    // Year range
    if (search.yearMin && carData.year < search.yearMin) return false;
    if (search.yearMax && carData.year > search.yearMax) return false;

    // Price max
    if (search.priceMax && carData.price > search.priceMax) return false;

    // Mileage max
    if (search.mileageMax && carData.mileage > search.mileageMax) return false;

    // Categories (condition: new, used, etc.)
    if (search.categories?.length && !search.categories.includes(carData.category)) return false;

    // Fuel types
    if (search.fuelTypes?.length && !search.fuelTypes.includes(carData.fuelType)) return false;

    // Transmissions
    if (search.transmissions?.length && !search.transmissions.includes(carData.transmission)) return false;

    // Body types
    if (search.bodyTypes?.length && !search.bodyTypes.includes(carData.bodyType)) return false;

    // Regions
    if (search.regions?.length && !search.regions.includes(carData.region)) return false;

    return true;
}

/**
 * Helper: Send push notification via Expo
 */
async function sendExpoPushNotification(
    expoPushToken: string,
    title: string,
    body: string,
    data: any
): Promise<void> {
    const message = {
        to: expoPushToken,
        sound: 'default',
        title,
        body,
        data,
        priority: 'high',
        channelId: 'price-alerts'
    };

    try {
        const response = await fetch('https://exp.host/--/api/v2/push/send', {
            method: 'POST',
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(message),
        });

        if (!response.ok) {
            functions.logger.error('Expo push notification failed:', await response.text());
        } else {
            functions.logger.info('Expo push notification sent successfully');
        }
    } catch (error) {
        functions.logger.error('Error sending Expo push notification:', error);
    }
}

/**
 * Main Cloud Function: Monitor price changes in car collections
 * 
 * Triggered on any update to documents in:
 * - cars, cars_sold, cars_pending, cars_rejected, cars_featured, cars_draft, cars_expired
 */
export const onCarPriceUpdate = functions.firestore
    .document('{collection}/{carId}')
    .onUpdate(async (change, context) => {
        const collectionName = context.params.collection;
        const carId = context.params.carId;

        // Only monitor car collections
        const carCollections = [
            'cars', 'cars_sold', 'cars_pending', 'cars_rejected',
            'cars_featured', 'cars_draft', 'cars_expired'
        ];

        if (!carCollections.includes(collectionName)) {
            return null;
        }

        const beforeData = change.before.data();
        const afterData = change.after.data();

        const oldPrice = beforeData.price || 0;
        const newPrice = afterData.price || 0;

        // Only proceed if price decreased
        if (newPrice >= oldPrice) {
            return null;
        }

        functions.logger.info(`[Price Drop] ${collectionName}/${carId}: €${oldPrice} → €${newPrice}`);

        const discount = oldPrice - newPrice;
        const discountPercent = Math.round((discount / oldPrice) * 100);

        // Query saved searches for matching users
        const db = admin.firestore();
        const savedSearchesSnapshot = await db.collection('saved_searches')
            .where('isActive', '==', true)
            .where('notificationsEnabled', '==', true)
            .get();

        if (savedSearchesSnapshot.empty) {
            functions.logger.info('No active saved searches with notifications enabled');
            return null;
        }

        const notificationPromises: Promise<void>[] = [];
        const alertPromises: Promise<any>[] = [];

        for (const searchDoc of savedSearchesSnapshot.docs) {
            const search = searchDoc.data() as SavedSearch;

            // Check if car matches search criteria
            if (!carMatchesSavedSearch(afterData, search)) {
                continue;
            }

            functions.logger.info(`[Match] User ${search.userId} - Search ${searchDoc.id}`);

            // Get user's expo push token
            const userDoc = await db.collection('users').doc(search.userFirebaseId).get();
            if (!userDoc.exists) continue;

            const userData = userDoc.data();
            const expoPushToken = userData?.expoPushToken;

            if (!expoPushToken || !expoPushToken.startsWith('ExponentPushToken[')) {
                functions.logger.info(`[Skip] No valid Expo token for user ${search.userId}`);
                continue;
            }

            // Create notification message
            const carTitle = `${afterData.make} ${afterData.model} ${afterData.year}`;
            const notificationTitle = `🔔 Спад на цената!`;
            const notificationBody = `${carTitle} намали цената с €${discount} (-${discountPercent}%). Нова цена: €${newPrice}`;

            // Send push notification
            notificationPromises.push(
                sendExpoPushNotification(
                    expoPushToken,
                    notificationTitle,
                    notificationBody,
                    {
                        type: 'price_drop',
                        carId,
                        carNumericId: afterData.carNumericId || 0,
                        oldPrice,
                        newPrice,
                        discount,
                        discountPercent,
                        searchId: searchDoc.id
                    }
                )
            );

            // Store alert in price_alerts collection
            const alertData: PriceAlert = {
                userId: search.userId,
                userFirebaseId: search.userFirebaseId,
                carId,
                carNumericId: afterData.carNumericId || 0,
                carMake: afterData.make || '',
                carModel: afterData.model || '',
                oldPrice,
                newPrice,
                discount,
                discountPercent,
                notificationSent: true,
                notificationSentAt: new Date().toISOString(),
                createdAt: new Date().toISOString()
            };

            alertPromises.push(
                db.collection('price_alerts').add(alertData)
            );
        }

        // Execute all notifications and alerts in parallel
        await Promise.all([...notificationPromises, ...alertPromises]);

        functions.logger.info(`[Complete] Sent ${notificationPromises.length} notifications`);
        return null;
    });

/**
 * Scheduled function: Clean up old price alerts (older than 30 days)
 * Runs daily at 3 AM UTC
 */
export const cleanupOldPriceAlerts = functions.pubsub
    .schedule('0 3 * * *')
    .timeZone('UTC')
    .onRun(async (context) => {
        const db = admin.firestore();
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        const oldAlertsSnapshot = await db.collection('price_alerts')
            .where('createdAt', '<', thirtyDaysAgo.toISOString())
            .get();

        const batch = db.batch();
        oldAlertsSnapshot.docs.forEach(doc => {
            batch.delete(doc.ref);
        });

        await batch.commit();
        functions.logger.info(`[Cleanup] Deleted ${oldAlertsSnapshot.size} old price alerts`);
        return null;
    });
