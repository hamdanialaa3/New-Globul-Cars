/**
 * Bulk Upload Service - Uploads multiple car listings
 * Maximum 50 cars per upload for Dealer plan
 * Location: Bulgaria
 * Currency: EUR
 * 
 * File: src/services/dealer/bulk-upload.service.ts
 * Created: February 8, 2026
 */

import { collection, addDoc, Timestamp, doc, getDoc } from 'firebase/firestore';
import { db, auth } from '../../firebase/firebase-config';
import { serviceLogger } from '../logger-service';
import type { ParsedCarData } from './csv-parser.service';

export interface UploadProgress {
  current: number;
  total: number;
  percentage: number;
}

class BulkUploadService {
  private static instance: BulkUploadService;
  private readonly MAX_UPLOAD_SIZE = 50;
  private readonly BATCH_DELAY_MS = 500;

  private constructor() {}

  static getInstance(): BulkUploadService {
    if (!BulkUploadService.instance) {
      BulkUploadService.instance = new BulkUploadService();
    }
    return BulkUploadService.instance;
  }

  async uploadCars(
    cars: ParsedCarData[],
    onProgress?: (percentage: number) => void
  ): Promise<void> {
    const user = auth.currentUser;
    if (!user) {
      throw new Error('User must be authenticated');
    }

    if (cars.length > this.MAX_UPLOAD_SIZE) {
      throw new Error(`Maximum upload size is ${this.MAX_UPLOAD_SIZE} cars`);
    }

    const userPlan = await this.getUserPlan(user.uid);
    if (userPlan !== 'dealer' && userPlan !== 'company') {
      throw new Error('Bulk upload requires Dealer or Enterprise subscription');
    }

    serviceLogger.info('Starting bulk upload', { userId: user.uid, count: cars.length });

    for (let i = 0; i < cars.length; i++) {
      try {
        await this.uploadSingleCar(cars[i], user.uid);

        const percentage = ((i + 1) / cars.length) * 100;
        if (onProgress) {
          onProgress(percentage);
        }

        if (i < cars.length - 1) {
          await this.delay(this.BATCH_DELAY_MS);
        }
      } catch (error) {
        serviceLogger.error('Failed to upload car', error as Error, { index: i, car: cars[i] });
        throw error;
      }
    }

    serviceLogger.info('Bulk upload completed', { userId: user.uid, count: cars.length });
  }

  private async uploadSingleCar(carData: ParsedCarData, userId: string): Promise<void> {
    const now = Timestamp.now();
    const numericId = await this.generateNumericId();

    const basicInfo = {
      userId,
      numericId,
      make: carData.make,
      model: carData.model,
      year: carData.year,
      isActive: true,
      isFeatured: false,
      createdAt: now,
      updatedAt: now
    };

    await addDoc(collection(db, 'cars_basic_info'), basicInfo);

    const technical = {
      userId,
      numericId,
      fuelType: carData.fuelType,
      transmission: carData.transmission,
      engineSize: carData.engineSize,
      doors: carData.doors,
      seats: carData.seats,
      createdAt: now,
      updatedAt: now
    };

    await addDoc(collection(db, 'cars_technical'), technical);

    const pricing = {
      userId,
      numericId,
      price: carData.price,
      currency: 'EUR',
      negotiable: true,
      createdAt: now,
      updatedAt: now
    };

    await addDoc(collection(db, 'cars_pricing'), pricing);

    const condition = {
      userId,
      numericId,
      mileage: carData.mileage,
      color: carData.color,
      description: carData.description,
      createdAt: now,
      updatedAt: now
    };

    await addDoc(collection(db, 'cars_condition'), condition);

    const location = {
      userId,
      numericId,
      city: carData.location || 'Bulgaria',
      country: 'Bulgaria',
      createdAt: now,
      updatedAt: now
    };

    await addDoc(collection(db, 'cars_location'), location);

    if (carData.images && carData.images.length > 0) {
      const media = {
        userId,
        numericId,
        images: carData.images,
        mainImage: carData.images[0],
        createdAt: now,
        updatedAt: now
      };

      await addDoc(collection(db, 'cars_media'), media);
    }
  }

  private async getUserPlan(userId: string): Promise<string> {
    try {
      const userDoc = await getDoc(doc(db, 'users', userId));
      if (userDoc.exists()) {
        const userData = userDoc.data();
        return userData.subscriptionTier || 'free';
      }
      return 'free';
    } catch (error) {
      serviceLogger.error('Error getting user plan', error as Error, { userId });
      return 'free';
    }
  }

  private async generateNumericId(): Promise<number> {
    const counterDoc = await getDoc(doc(db, 'counters', 'cars'));
    let currentId = 1;

    if (counterDoc.exists()) {
      currentId = counterDoc.data().value + 1;
    }

    return currentId;
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  validateUploadLimit(carCount: number): boolean {
    return carCount > 0 && carCount <= this.MAX_UPLOAD_SIZE;
  }

  getMaxUploadSize(): number {
    return this.MAX_UPLOAD_SIZE;
  }
}

export const bulkUploadService = BulkUploadService.getInstance();
