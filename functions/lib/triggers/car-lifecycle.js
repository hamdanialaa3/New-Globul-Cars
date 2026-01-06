"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.onBusSold = exports.onTruckSold = exports.onMotorcycleSold = exports.onVanSold = exports.onSuvSold = exports.onPassengerCarSold = exports.onBusDeleted = exports.onTruckDeleted = exports.onMotorcycleDeleted = exports.onVanDeleted = exports.onSuvDeleted = exports.onPassengerCarDeleted = void 0;
const functions = require("firebase-functions");
const admin = require("firebase-admin");
// Firebase Admin bootstrap
if (!admin.apps.length) {
    admin.initializeApp();
}
const logger = functions.logger;
const db = admin.firestore();
async function purgeStoriesForCar(carId) {
    const storiesSnap = await db
        .collection('stories')
        .where('linkedCarId', '==', carId)
        .limit(500)
        .get();
    if (storiesSnap.empty) {
        return 0;
    }
    const batch = db.batch();
    storiesSnap.docs.forEach(doc => batch.delete(doc.ref));
    await batch.commit();
    return storiesSnap.size;
}
async function markStoriesSold(carId) {
    const storiesSnap = await db
        .collection('stories')
        .where('linkedCarId', '==', carId)
        .limit(500)
        .get();
    if (storiesSnap.empty) {
        return 0;
    }
    const batch = db.batch();
    storiesSnap.docs.forEach(doc => {
        batch.update(doc.ref, {
            carStatus: 'sold',
            isActive: false,
            updatedAt: admin.firestore.FieldValue.serverTimestamp()
        });
    });
    await batch.commit();
    return storiesSnap.size;
}
function createDeleteTrigger(collection) {
    return functions.firestore
        .document(`${collection}/{carId}`)
        .onDelete(async (snap, context) => {
        const carId = context.params.carId;
        try {
            const removed = await purgeStoriesForCar(carId);
            logger.info('[car-lifecycle] Cascade delete stories', { collection, carId, removed });
        }
        catch (error) {
            logger.error('[car-lifecycle] Failed to cascade delete stories', { collection, carId, error });
            throw error;
        }
    });
}
function createSoldTrigger(collection) {
    return functions.firestore
        .document(`${collection}/{carId}`)
        .onUpdate(async (change, context) => {
        const before = change.before.data();
        const after = change.after.data();
        if (!before || !after) {
            logger.warn('[car-lifecycle] Missing snapshot data', { collection, carId: context.params.carId });
            return;
        }
        const statusChangedToSold = before.status !== 'sold' && after.status === 'sold';
        if (!statusChangedToSold)
            return;
        try {
            const updated = await markStoriesSold(context.params.carId);
            logger.info('[car-lifecycle] Marked linked stories as sold', { collection, carId: context.params.carId, updated });
        }
        catch (error) {
            logger.error('[car-lifecycle] Failed to mark stories sold', { collection, carId: context.params.carId, error });
            throw error;
        }
    });
}
exports.onPassengerCarDeleted = createDeleteTrigger('passenger_cars');
exports.onSuvDeleted = createDeleteTrigger('suvs');
exports.onVanDeleted = createDeleteTrigger('vans');
exports.onMotorcycleDeleted = createDeleteTrigger('motorcycles');
exports.onTruckDeleted = createDeleteTrigger('trucks');
exports.onBusDeleted = createDeleteTrigger('buses');
exports.onPassengerCarSold = createSoldTrigger('passenger_cars');
exports.onSuvSold = createSoldTrigger('suvs');
exports.onVanSold = createSoldTrigger('vans');
exports.onMotorcycleSold = createSoldTrigger('motorcycles');
exports.onTruckSold = createSoldTrigger('trucks');
exports.onBusSold = createSoldTrigger('buses');
//# sourceMappingURL=car-lifecycle.js.map