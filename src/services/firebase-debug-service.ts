import { collection, getDocs, query, limit } from 'firebase/firestore';
import { queryAllCollections, countAllVehicles, VEHICLE_COLLECTIONS } from './search/multi-collection-helper';
import { db } from '../firebase/firebase-config';
import { serviceLogger } from './logger-service';

class FirebaseDebugService {
  private static instance: FirebaseDebugService;

  private constructor() {}

  public static getInstance(): FirebaseDebugService {
    if (!FirebaseDebugService.instance) {
      FirebaseDebugService.instance = new FirebaseDebugService();
    }
    return FirebaseDebugService.instance;
  }

  // Debug: Check what's actually in Firebase
  public async debugFirebaseData(): Promise<any> {
    try {
        serviceLogger.info('DEBUG: Checking Firebase data');
      
      // Check users collection
      const usersSnapshot = await getDocs(collection(db, 'users'));
        serviceLogger.debug('Users found', { count: usersSnapshot.docs.length });
      const users = usersSnapshot.docs.map((doc: any) => ({
        id: doc.id,
        ...doc.data()
      }));
        serviceLogger.debug('Users data', { users });

      // Check cars collection - ✅ ALL COLLECTIONS
      const cars = await queryAllCollections();
      serviceLogger.debug('Cars found', { count: cars.length });
      serviceLogger.debug('Cars data', { cars });

      // Check messages collection
      const messagesSnapshot = await getDocs(collection(db, 'messages'));
        serviceLogger.debug('Messages found', { count: messagesSnapshot.docs.length });
      const messages = messagesSnapshot.docs.map((doc: any) => ({
        id: doc.id,
        ...doc.data()
      }));
        serviceLogger.debug('Messages data', { messages });

      return {
        users: {
          count: usersSnapshot.docs.length,
          data: users
        },
        cars: {
          count: cars.length,
          data: cars
        },
        messages: {
          count: messagesSnapshot.docs.length,
          data: messages
        }
      };
    } catch (error) {
        serviceLogger.error('DEBUG: Error checking Firebase data', error as unknown as Error);
      throw error;
    }
  }
}

export const firebaseDebugService = FirebaseDebugService.getInstance();
