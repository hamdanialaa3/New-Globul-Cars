import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

// Firebase Admin bootstrap
if (!admin.apps.length) {
  admin.initializeApp();
}

const logger = functions.logger;
const db = admin.firestore();
const VEHICLE_COLLECTIONS = [
  'passenger_cars',
  'suvs',
  'vans',
  'motorcycles',
  'trucks',
  'buses'
];

async function purgeStoriesForCar(carId: string): Promise<number> {
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

async function markStoriesSold(carId: string): Promise<number> {
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

function createDeleteTrigger(collection: string) {
  return functions.firestore
    .document(`${collection}/{carId}`)
    .onDelete(async (snap, context) => {
      const carId = context.params.carId;

      try {
        const removed = await purgeStoriesForCar(carId);
        logger.info('[car-lifecycle] Cascade delete stories', { collection, carId, removed });
      } catch (error) {
        logger.error('[car-lifecycle] Failed to cascade delete stories', { collection, carId, error });
        throw error;
      }
    });
}

function createSoldTrigger(collection: string) {
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
      if (!statusChangedToSold) return;

      try {
        const updated = await markStoriesSold(context.params.carId);
        logger.info('[car-lifecycle] Marked linked stories as sold', { collection, carId: context.params.carId, updated });
      } catch (error) {
        logger.error('[car-lifecycle] Failed to mark stories sold', { collection, carId: context.params.carId, error });
        throw error;
      }
    });
}

export const onPassengerCarDeleted = createDeleteTrigger('passenger_cars');
export const onSuvDeleted = createDeleteTrigger('suvs');
export const onVanDeleted = createDeleteTrigger('vans');
export const onMotorcycleDeleted = createDeleteTrigger('motorcycles');
export const onTruckDeleted = createDeleteTrigger('trucks');
export const onBusDeleted = createDeleteTrigger('buses');

export const onPassengerCarSold = createSoldTrigger('passenger_cars');
export const onSuvSold = createSoldTrigger('suvs');
export const onVanSold = createSoldTrigger('vans');
export const onMotorcycleSold = createSoldTrigger('motorcycles');
export const onTruckSold = createSoldTrigger('trucks');
export const onBusSold = createSoldTrigger('buses');
