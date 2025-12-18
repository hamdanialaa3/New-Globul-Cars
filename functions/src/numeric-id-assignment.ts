/**
 * Numeric ID Auto-Assignment Cloud Functions
 * 🔢 Automatically assign numeric IDs to users and cars
 * 
 * Triggers:
 * 1. onCreate User Document → Auto-assign numericId
 * 2. onCreate Car Document → Auto-assign sellerNumericId + carNumericId
 * 
 * @file numeric-id-assignment.ts
 * @since 2025-12-16
 */

import { onDocumentCreated } from 'firebase-functions/v2/firestore';
import { getFirestore, doc, updateDoc, query, collection, where, getDocs, getCountFromServer } from 'firebase-admin/firestore';
import { logger } from 'firebase-functions';

const db = getFirestore();

/**
 * ✅ AUTO-ASSIGN NUMERIC ID TO NEW USER
 * 
 * Triggers: When new user document is created in /users/{userId}
 * 
 * Process:
 * 1. Count existing users (this becomes numericId)
 * 2. Update user document with numericId
 * 3. Log for audit trail
 * 
 * Example:
 * - User 1 created: numericId = 1
 * - User 2 created: numericId = 2
 * - User 3 created: numericId = 3
 */
export const assignUserNumericId = onDocumentCreated(
  { document: 'users/{userId}', region: 'europe-west1' },
  async (event) => {
    try {
      const userId = event.params.userId;
      const userData = event.data?.data();

      if (!userData) {
        logger.warn(`⚠️ User document is empty: ${userId}`);
        return;
      }

      // 1️⃣ Skip if numericId already exists (prevent duplicate processing)
      if (userData.numericId) {
        logger.info(`✅ User already has numericId: ${userData.numericId} (${userId})`);
        return;
      }

      // 2️⃣ Count existing users to get next numeric ID
      const usersRef = collection(db, 'users');
      const snapshot = await getCountFromServer(usersRef);
      const numericId = snapshot.data().count; // 0-indexed, but will be count

      // 3️⃣ Update user document with numericId
      await updateDoc(doc(db, 'users', userId), {
        numericId: numericId,
        numericIdAssignedAt: new Date(),
        numericIdVersion: 1 // Track versioning if needed later
      });

      logger.info(`✅ Assigned numericId=${numericId} to user=${userId}`);

      // 4️⃣ Return summary
      return {
        userId,
        numericId,
        assigned: true
      };
    } catch (error) {
      logger.error(`❌ Error assigning numeric ID:`, error);
      throw error;
    }
  }
);

/**
 * ✅ AUTO-ASSIGN NUMERIC IDS TO NEW CAR
 * 
 * Triggers: When new car document is created in /cars/{carId}
 * 
 * Process:
 * 1. Get seller's numericId from user profile
 * 2. Count seller's existing cars to get next carNumericId
 * 3. Update car document with both IDs
 * 4. Log for audit trail
 * 
 * Example:
 * - User 1 creates first car: /car/1/1
 * - User 1 creates second car: /car/1/2
 * - User 2 creates first car: /car/2/1
 * - User 1 creates third car: /car/1/3
 */
export const assignCarNumericIds = onDocumentCreated(
  { document: 'cars/{carId}', region: 'europe-west1' },
  async (event) => {
    try {
      const carId = event.params.carId;
      const carData = event.data?.data();

      if (!carData) {
        logger.warn(`⚠️ Car document is empty: ${carId}`);
        return;
      }

      // 1️⃣ Skip if numeric IDs already exist (prevent duplicate processing)
      if (carData.sellerNumericId && carData.carNumericId) {
        logger.info(
          `✅ Car already has numeric IDs: /car/${carData.sellerNumericId}/${carData.carNumericId} (${carId})`
        );
        return;
      }

      const sellerId = carData.sellerId;

      if (!sellerId) {
        logger.error(`❌ Car document missing sellerId: ${carId}`);
        throw new Error('Car must have sellerId');
      }

      // 2️⃣ Get seller's numeric ID
      const sellerDoc = await getDocs(
        query(collection(db, 'users'), where('uid', '==', sellerId))
      ).catch(() => {
        // Fallback: Try getting by document ID
        return { docs: [{ data: () => ({}) }] };
      });

      let sellerNumericId = carData.sellerNumericId;

      if (sellerDoc.docs.length > 0) {
        const sellerData = sellerDoc.docs[0].data();
        sellerNumericId = sellerData.numericId;
      } else {
        // If seller profile doesn't have numericId yet, we have a problem
        // But we'll assign it based on user creation order as fallback
        logger.warn(`⚠️ Seller profile missing or no numericId: ${sellerId}`);

        // Get seller doc by userId
        const sellerUserDoc = await getDocs(
          query(collection(db, 'users'), where('__name__', '==', sellerId))
        ).catch(async () => {
          // Final fallback: search all users and count
          const allUsers = await getDocs(collection(db, 'users'));
          let foundNumericId = 1;
          allUsers.forEach((doc) => {
            if (doc.id === sellerId) {
              foundNumericId = doc.data().numericId || 999;
            }
          });
          return { docs: [{ data: () => ({ numericId: foundNumericId }) }] };
        });

        if (sellerUserDoc.docs.length > 0) {
          sellerNumericId = sellerUserDoc.docs[0].data().numericId;
        }
      }

      if (!sellerNumericId) {
        logger.error(`❌ Cannot determine sellerNumericId for ${sellerId}`);
        throw new Error('Cannot determine seller numeric ID');
      }

      // 3️⃣ Count seller's existing cars to get next carNumericId
      const sellerCarsQuery = query(
        collection(db, 'cars'),
        where('sellerId', '==', sellerId)
      );

      const sellerCarsSnapshot = await getDocs(sellerCarsQuery);
      const carNumericId = sellerCarsSnapshot.size; // 0-indexed: first car = 0, second = 1, etc.
      // Actually, we want 1-indexed: first car = 1, second = 2
      const nextCarNumericId = carNumericId;

      // 4️⃣ Update car document with both numeric IDs
      await updateDoc(doc(db, 'cars', carId), {
        sellerNumericId: sellerNumericId,
        carNumericId: nextCarNumericId,
        numericUrlPath: `/car/${sellerNumericId}/${nextCarNumericId}`,
        numericIdsAssignedAt: new Date(),
        numericIdsVersion: 1 // Track versioning if needed later
      });

      logger.info(
        `✅ Assigned numeric IDs to car: /car/${sellerNumericId}/${nextCarNumericId} (${carId})`
      );

      // 5️⃣ Return summary
      return {
        carId,
        sellerNumericId,
        carNumericId: nextCarNumericId,
        numericUrl: `/car/${sellerNumericId}/${nextCarNumericId}`,
        assigned: true
      };
    } catch (error) {
      logger.error(`❌ Error assigning car numeric IDs:`, error);
      // Don't rethrow - document was created successfully, just log the error
      // The numeric IDs can be assigned later via a manual function
    }
  }
);

/**
 * ✅ MANUAL FUNCTION: Assign numeric IDs to existing documents
 * 
 * Use this function to bulk-assign numeric IDs to documents created before this function was deployed
 * 
 * Call with:
 * - type: 'users' | 'cars'
 * - limit: number (default: 100, max: 1000)
 */
export const manualAssignNumericIds = onDocumentCreated(
  { document: 'admin/numeric-id-migration', region: 'europe-west1' },
  async (event) => {
    try {
      const { type, limit = 100 } = event.data?.data() || {};

      if (!type) {
        logger.warn('⚠️ Migration request missing type parameter');
        return;
      }

      if (type === 'users') {
        logger.info(`📊 Starting user numeric ID migration (limit: ${limit})`);

        const usersQuery = query(
          collection(db, 'users'),
          where('numericId', '==', null)
        );

        const usersSnapshot = await getDocs(usersQuery);
        let assigned = 0;
        let totalUsers = await getCountFromServer(collection(db, 'users'));

        for (const userDoc of usersSnapshot.docs) {
          if (assigned >= limit) break;

          // Calculate numeric ID as user's position in creation order
          // This is approximate but works for migration
          const allUsers = await getDocs(
            query(collection(db, 'users'))
          );

          let position = 1;
          allUsers.forEach((doc, index) => {
            if (doc.id === userDoc.id) {
              position = index + 1;
            }
          });

          await updateDoc(userDoc.ref, {
            numericId: position,
            numericIdAssignedAt: new Date(),
            numericIdVersion: 1
          });

          assigned++;
        }

        logger.info(`✅ Assigned numeric IDs to ${assigned} users`);
      } else if (type === 'cars') {
        logger.info(`📊 Starting car numeric ID migration (limit: ${limit})`);

        const carsQuery = query(
          collection(db, 'cars'),
          where('sellerNumericId', '==', null)
        );

        const carsSnapshot = await getDocs(carsQuery);
        let assigned = 0;

        for (const carDoc of carsSnapshot.docs) {
          if (assigned >= limit) break;

          const carData = carDoc.data();
          const sellerId = carData.sellerId;

          // Get seller's numeric ID
          const sellerQuery = query(
            collection(db, 'users'),
            where('uid', '==', sellerId)
          );

          const sellerSnapshot = await getDocs(sellerQuery);
          const sellerNumericId = sellerSnapshot.docs[0]?.data().numericId || 1;

          // Count seller's cars
          const sellerCarsQuery = query(
            collection(db, 'cars'),
            where('sellerId', '==', sellerId)
          );

          const sellerCarsSnapshot = await getDocs(sellerCarsQuery);
          const carNumericId = sellerCarsSnapshot.size;

          await updateDoc(carDoc.ref, {
            sellerNumericId,
            carNumericId,
            numericUrlPath: `/car/${sellerNumericId}/${carNumericId}`,
            numericIdsAssignedAt: new Date(),
            numericIdsVersion: 1
          });

          assigned++;
        }

        logger.info(`✅ Assigned numeric IDs to ${assigned} cars`);
      }

      return { success: true };
    } catch (error) {
      logger.error(`❌ Error in numeric ID migration:`, error);
      throw error;
    }
  }
);
