// src/services/garage/car-delete.service.ts
// Complete Car Delete Service
// الموقع: بلغاريا | اللغات: BG/EN | العملة: EUR

import { 
  doc, 
  deleteDoc, 
  getDoc, 
  collection, 
  query, 
  where, 
  getDocs,
  writeBatch,
  updateDoc,
  increment,
  serverTimestamp,
  setDoc
} from 'firebase/firestore';
import { ref, deleteObject, listAll } from 'firebase/storage';
import { db, storage } from '@globul-cars/services/firebase/firebase-config';
import { serviceLogger } from '../logger-wrapper';

interface DeleteResult {
  success: boolean;
  message: string;
  errors?: string[];
}

class CarDeleteService {
  private static instance: CarDeleteService;
  
  private constructor() {}
  
  static getInstance(): CarDeleteService {
    if (!this.instance) {
      this.instance = new CarDeleteService();
    }
    return this.instance;
  }

  /**
   * Complete car deletion with all related data
   * حذف كامل للسيارة مع جميع البيانات المرتبطة
   */
  async deleteCar(carId: string, userId: string): Promise<DeleteResult> {
    const errors: string[] = [];
    
    try {
      serviceLogger.info('Starting car deletion process', { carId, userId });

      // 1. Verify ownership
      const carDoc = await getDoc(doc(db, 'cars', carId));
      if (!carDoc.exists()) {
        return {
          success: false,
          message: 'Колата не е намерена / Car not found'
        };
      }

      const carData = carDoc.data();
      if (carData.userId !== userId) {
        return {
          success: false,
          message: 'Нямате права да изтриете тази кола / No permission to delete this car'
        };
      }

      // 2. Delete all car images from Storage
      try {
        await this.deleteCarImages(carId, carData.images || []);
      } catch (error) {
        serviceLogger.error('Error deleting images', error as Error, { carId });
        errors.push('Images deletion failed');
      }

      // 3. Delete related messages
      try {
        await this.deleteCarMessages(carId);
      } catch (error) {
        serviceLogger.error('Error deleting messages', error as Error, { carId });
        errors.push('Messages deletion failed');
      }

      // 4. Remove from favorites
      try {
        await this.removeFromFavorites(carId);
      } catch (error) {
        serviceLogger.error('Error removing favorites', error as Error, { carId });
        errors.push('Favorites removal failed');
      }

      // 5. Delete analytics data
      try {
        await this.deleteCarAnalytics(carId);
      } catch (error) {
        serviceLogger.error('Error deleting analytics', error as Error, { carId });
        errors.push('Analytics deletion failed');
      }

      // 6. Update user stats
      try {
        await updateDoc(doc(db, 'users', userId), {
          'stats.cars': increment(-1),
          'stats.carsListed': increment(-1)
        });
      } catch (error) {
        serviceLogger.error('Error updating user stats', error as Error, { userId, carId });
        errors.push('Stats update failed');
      }

      // 7. Create audit log
      try {
        await setDoc(doc(collection(db, 'audit_logs')), {
          action: 'car_deleted',
          carId,
          userId,
          carData: {
            make: carData.make,
            model: carData.model,
            year: carData.year,
            price: carData.price
          },
          timestamp: serverTimestamp(),
          ip: await this.getClientIP()
        });
      } catch (error) {
        serviceLogger.error('Error creating audit log', error as Error, { carId, userId });
        errors.push('Audit log failed');
      }

      // 8. Finally, delete the car document
      await deleteDoc(doc(db, 'cars', carId));

      serviceLogger.info('Car deleted successfully', { carId, userId });

      return {
        success: true,
        message: 'Колата е изтрита успешно / Car deleted successfully',
        errors: errors.length > 0 ? errors : undefined
      };

    } catch (error) {
      serviceLogger.error('Car deletion error', error as Error, { carId, userId });
      return {
        success: false,
        message: 'Грешка при изтриване / Deletion error',
        errors: [...errors, (error as Error).message]
      };
    }
  }

  /**
   * Delete all car images from Storage
   */
  private async deleteCarImages(carId: string, imageUrls: string[]): Promise<void> {
    const deletePromises: Promise<void>[] = [];

    // Delete from URLs
    for (const imageUrl of imageUrls) {
      try {
        const imageRef = ref(storage, imageUrl);
        deletePromises.push(deleteObject(imageRef));
      } catch (error) {
        console.error('Error deleting image:', imageUrl, error);
      }
    }

    // Also delete from car-images folder
    try {
      const carImagesRef = ref(storage, `car-images/${carId}`);
      const imagesList = await listAll(carImagesRef);
      
      for (const item of imagesList.items) {
        deletePromises.push(deleteObject(item));
      }
    } catch (error) {
      serviceLogger.error('Error listing car images', error as Error, { carId });
    }

    await Promise.allSettled(deletePromises);
  }

  /**
   * Delete all messages related to this car
   */
  private async deleteCarMessages(carId: string): Promise<void> {
    const batch = writeBatch(db);
    
    const messagesQuery = query(
      collection(db, 'messages'),
      where('carId', '==', carId)
    );
    
    const messagesSnapshot = await getDocs(messagesQuery);
    
    messagesSnapshot.docs.forEach(doc => {
      batch.delete(doc.ref);
    });

    if (messagesSnapshot.docs.length > 0) {
      await batch.commit();
    }
  }

  /**
   * Remove car from all users' favorites
   */
  private async removeFromFavorites(carId: string): Promise<void> {
    const batch = writeBatch(db);
    
    const favoritesQuery = query(
      collection(db, 'favorites'),
      where('carId', '==', carId)
    );
    
    const favoritesSnapshot = await getDocs(favoritesQuery);
    
    favoritesSnapshot.docs.forEach(doc => {
      batch.delete(doc.ref);
    });

    if (favoritesSnapshot.docs.length > 0) {
      await batch.commit();
    }
  }

  /**
   * Delete car analytics data
   */
  private async deleteCarAnalytics(carId: string): Promise<void> {
    const batch = writeBatch(db);
    
    // Delete views
    const viewsQuery = query(
      collection(db, 'car_views'),
      where('carId', '==', carId)
    );
    const viewsSnapshot = await getDocs(viewsQuery);
    viewsSnapshot.docs.forEach(doc => batch.delete(doc.ref));

    // Delete inquiries
    const inquiriesQuery = query(
      collection(db, 'car_inquiries'),
      where('carId', '==', carId)
    );
    const inquiriesSnapshot = await getDocs(inquiriesQuery);
    inquiriesSnapshot.docs.forEach(doc => batch.delete(doc.ref));

    if (viewsSnapshot.docs.length > 0 || inquiriesSnapshot.docs.length > 0) {
      await batch.commit();
    }
  }

  /**
   * Get client IP for audit log
   */
  private async getClientIP(): Promise<string> {
    try {
      const response = await fetch('https://api.ipify.org?format=json');
      const data = await response.json();
      return data.ip;
    } catch {
      return 'unknown';
    }
  }

  /**
   * Soft delete (mark as deleted but don't remove)
   */
  async softDeleteCar(carId: string, userId: string): Promise<DeleteResult> {
    try {
      const carDoc = await getDoc(doc(db, 'cars', carId));
      if (!carDoc.exists() || carDoc.data().userId !== userId) {
        return {
          success: false,
          message: 'Колата не е намерена или нямате права / Car not found or no permission'
        };
      }

      await updateDoc(doc(db, 'cars', carId), {
        deleted: true,
        deletedAt: serverTimestamp(),
        isActive: false
      });

      return {
        success: true,
        message: 'Колата е деактивирана / Car deactivated'
      };
    } catch (error) {
      return {
        success: false,
        message: 'Грешка / Error',
        errors: [(error as Error).message]
      };
    }
  }
}

export const carDeleteService = CarDeleteService.getInstance();

