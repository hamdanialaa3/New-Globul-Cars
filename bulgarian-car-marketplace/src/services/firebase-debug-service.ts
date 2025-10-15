import { collection, getDocs, query, limit } from 'firebase/firestore';
import { db } from '../firebase/firebase-config';

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
      console.log('🔍 DEBUG: Checking Firebase data...');
      
      // Check users collection
      const usersSnapshot = await getDocs(collection(db, 'users'));
      console.log('👥 Users found:', usersSnapshot.docs.length);
      const users = usersSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      console.log('👥 Users data:', users);

      // Check cars collection
      const carsSnapshot = await getDocs(collection(db, 'cars'));
      console.log('🔍 Cars found:', carsSnapshot.docs.length);
      const cars = carsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      console.log('📊 Cars data:', cars);

      // Check messages collection
      const messagesSnapshot = await getDocs(collection(db, 'messages'));
      console.log('💬 Messages found:', messagesSnapshot.docs.length);
      const messages = messagesSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      console.log('💬 Messages data:', messages);

      return {
        users: {
          count: usersSnapshot.docs.length,
          data: users
        },
        cars: {
          count: carsSnapshot.docs.length,
          data: cars
        },
        messages: {
          count: messagesSnapshot.docs.length,
          data: messages
        }
      };
    } catch (error) {
      console.error('❌ DEBUG: Error checking Firebase data:', error);
      throw error;
    }
  }
}

export const firebaseDebugService = FirebaseDebugService.getInstance();
