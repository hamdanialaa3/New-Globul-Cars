"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.cleanupOldPriceAlerts = exports.onCarPriceUpdate = void 0;
const functions = require("firebase-functions/v1");
const admin = require("firebase-admin");
/**
 * Helper: Check if car matches saved search criteria
 */
function carMatchesSavedSearch(carData, search) {
    var _a, _b, _c, _d, _e;
    // Make & Model match
    if (search.make && carData.make !== search.make)
        return false;
    if (search.model && carData.model !== search.model)
        return false;
    // Year range
    if (search.yearMin && carData.year < search.yearMin)
        return false;
    if (search.yearMax && carData.year > search.yearMax)
        return false;
    // Price max
    if (search.priceMax && carData.price > search.priceMax)
        return false;
    // Mileage max
    if (search.mileageMax && carData.mileage > search.mileageMax)
        return false;
    // Categories (condition: new, used, etc.)
    if (((_a = search.categories) === null || _a === void 0 ? void 0 : _a.length) && !search.categories.includes(carData.category))
        return false;
    // Fuel types
    if (((_b = search.fuelTypes) === null || _b === void 0 ? void 0 : _b.length) && !search.fuelTypes.includes(carData.fuelType))
        return false;
    // Transmissions
    if (((_c = search.transmissions) === null || _c === void 0 ? void 0 : _c.length) && !search.transmissions.includes(carData.transmission))
        return false;
    // Body types
    if (((_d = search.bodyTypes) === null || _d === void 0 ? void 0 : _d.length) && !search.bodyTypes.includes(carData.bodyType))
        return false;
    // Regions
    if (((_e = search.regions) === null || _e === void 0 ? void 0 : _e.length) && !search.regions.includes(carData.region))
        return false;
    return true;
}
/**
 * Helper: Send push notification via Expo
 */
async function sendExpoPushNotification(expoPushToken, title, body, data) {
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
            console.error('Expo push notification failed:', await response.text());
        }
        else {
            console.log('Expo push notification sent successfully');
        }
    }
    catch (error) {
        console.error('Error sending Expo push notification:', error);
    }
}
/**
 * Main Cloud Function: Monitor price changes in car collections
 *
 * Triggered on any update to documents in:
 * - cars, cars_sold, cars_pending, cars_rejected, cars_featured, cars_draft, cars_expired
 */
exports.onCarPriceUpdate = functions.firestore
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
    console.log(`[Price Drop] ${collectionName}/${carId}: €${oldPrice} → €${newPrice}`);
    const discount = oldPrice - newPrice;
    const discountPercent = Math.round((discount / oldPrice) * 100);
    // Query saved searches for matching users
    const db = admin.firestore();
    const savedSearchesSnapshot = await db.collection('saved_searches')
        .where('isActive', '==', true)
        .where('notificationsEnabled', '==', true)
        .get();
    if (savedSearchesSnapshot.empty) {
        console.log('No active saved searches with notifications enabled');
        return null;
    }
    const notificationPromises = [];
    const alertPromises = [];
    for (const searchDoc of savedSearchesSnapshot.docs) {
        const search = searchDoc.data();
        // Check if car matches search criteria
        if (!carMatchesSavedSearch(afterData, search)) {
            continue;
        }
        console.log(`[Match] User ${search.userId} - Search ${searchDoc.id}`);
        // Get user's expo push token
        const userDoc = await db.collection('users').doc(search.userFirebaseId).get();
        if (!userDoc.exists)
            continue;
        const userData = userDoc.data();
        const expoPushToken = userData === null || userData === void 0 ? void 0 : userData.expoPushToken;
        if (!expoPushToken || !expoPushToken.startsWith('ExponentPushToken[')) {
            console.log(`[Skip] No valid Expo token for user ${search.userId}`);
            continue;
        }
        // Create notification message
        const carTitle = `${afterData.make} ${afterData.model} ${afterData.year}`;
        const notificationTitle = `🔔 Спад на цената!`;
        const notificationBody = `${carTitle} намали цената с €${discount} (-${discountPercent}%). Нова цена: €${newPrice}`;
        // Send push notification
        notificationPromises.push(sendExpoPushNotification(expoPushToken, notificationTitle, notificationBody, {
            type: 'price_drop',
            carId,
            carNumericId: afterData.carNumericId || 0,
            oldPrice,
            newPrice,
            discount,
            discountPercent,
            searchId: searchDoc.id
        }));
        // Store alert in price_alerts collection
        const alertData = {
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
        alertPromises.push(db.collection('price_alerts').add(alertData));
    }
    // Execute all notifications and alerts in parallel
    await Promise.all([...notificationPromises, ...alertPromises]);
    console.log(`[Complete] Sent ${notificationPromises.length} notifications`);
    return null;
});
/**
 * Scheduled function: Clean up old price alerts (older than 30 days)
 * Runs daily at 3 AM UTC
 */
exports.cleanupOldPriceAlerts = functions.pubsub
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
    console.log(`[Cleanup] Deleted ${oldAlertsSnapshot.size} old price alerts`);
    return null;
});
//# sourceMappingURL=price-drop-alerts.js.map