/**
 * Bulk Upload Service - Uploads multiple car listings
 * Maximum 50 cars per upload for Dealer plan
 * Location: Bulgaria
 * Currency: EUR
 *
 * File: src/services/dealer/bulk-upload.service.ts
 * Created: February 8, 2026
 */

import {
  collection,
  addDoc,
  Timestamp,
  doc,
  getDoc,
  updateDoc,
  writeBatch,
  query,
  where,
  getDocs,
  arrayUnion,
} from 'firebase/firestore';
import { db, auth } from '../../firebase/firebase-config';
import { serviceLogger } from '../logger-service';
import { getNextCarNumericId } from '../numeric-id-counter.service';
import type { ParsedCarData } from './csv-parser.service';
import {
  getMaxBulkUploadSize,
  type PlanTier,
} from '../../config/subscription-plans';

export interface UploadProgress {
  current: number;
  total: number;
  percentage: number;
}

export type BulkUploadSourceType =
  | 'csv'
  | 'zip'
  | 'smart_images'
  | 'cloud_sync';

export interface BulkReviewItem {
  numericId: number;
  make: string;
  model: string;
  year: number;
  price?: number;
  fuelType?: string;
  transmission?: string;
  color?: string;
  mileage?: number;
  reviewStatus: 'pending' | 'approved' | 'rejected';
}

export interface BulkUploadJob {
  id: string;
  userId: string;
  batchId: string;
  status:
    | 'uploading'
    | 'processing'
    | 'review'
    | 'publishing'
    | 'completed'
    | 'failed';
  totalCars: number;
  processedCars: number;
  sourceType: BulkUploadSourceType;
  errors: Array<{ message: string; index?: number }>;
  reviewItems: BulkReviewItem[];
  createdAt: Timestamp;
  completedAt?: Timestamp;
}

class BulkUploadService {
  private static instance: BulkUploadService;
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
    onProgress?: (percentage: number) => void,
    sourceType: BulkUploadSourceType = 'csv',
    existingJobId?: string
  ): Promise<void> {
    const user = auth.currentUser;
    if (!user) {
      throw new Error('User must be authenticated');
    }

    const userPlan = this.normalizePlanTier(await this.getUserPlan(user.uid));
    if (userPlan !== 'dealer' && userPlan !== 'company') {
      throw new Error('Bulk upload requires Dealer or Enterprise subscription');
    }

    const maxUploadSize = getMaxBulkUploadSize(userPlan);
    if (maxUploadSize !== -1 && cars.length > maxUploadSize) {
      throw new Error(
        `Maximum upload size is ${maxUploadSize} cars for ${userPlan} plan`
      );
    }

    const job = existingJobId
      ? {
          id: existingJobId,
          userId: user.uid,
          totalCars: cars.length,
          sourceType,
        }
      : await this.createUploadJob(user.uid, cars.length, sourceType);

    if (existingJobId) {
      await this.updateUploadJob(existingJobId, {
        totalCars: cars.length,
        processedCars: 0,
        status: 'uploading',
        sourceType,
        errors: [],
        reviewItems: [],
      });
    }

    serviceLogger.info('Starting bulk upload', {
      userId: user.uid,
      count: cars.length,
      sourceType,
      jobId: job.id,
      userPlan,
    });

    await this.updateUploadJob(job.id, { status: 'processing' });

    for (let i = 0; i < cars.length; i++) {
      try {
        const { numericId } = await this.uploadSingleCar(cars[i], user.uid);

        const reviewItem: BulkReviewItem = {
          numericId,
          make: cars[i].make || '',
          model: cars[i].model || '',
          year: cars[i].year || 0,
          price: cars[i].price,
          fuelType: cars[i].fuelType,
          transmission: cars[i].transmission,
          color: cars[i].color,
          mileage: cars[i].mileage,
          reviewStatus: 'pending',
        };

        await updateDoc(doc(db, 'bulk_upload_jobs', job.id), {
          processedCars: i + 1,
          status: i + 1 === cars.length ? 'review' : 'processing',
          reviewItems: arrayUnion(reviewItem),
        });

        const percentage = ((i + 1) / cars.length) * 100;
        if (onProgress) {
          onProgress(percentage);
        }

        if (i < cars.length - 1) {
          await this.delay(this.BATCH_DELAY_MS);
        }
      } catch (error) {
        serviceLogger.error('Failed to upload car', error as Error, {
          index: i,
          car: cars[i],
        });
        await this.updateUploadJob(job.id, {
          status: 'failed',
          errors: [
            {
              message: (error as Error)?.message || 'Unknown bulk upload error',
              index: i,
            },
          ],
          completedAt: Timestamp.now(),
        });
        throw error;
      }
    }

    serviceLogger.info('Bulk upload reached review stage', {
      userId: user.uid,
      count: cars.length,
      jobId: job.id,
    });
  }

  async createUploadJob(
    userId: string,
    totalCars: number,
    sourceType: BulkUploadSourceType
  ): Promise<BulkUploadJob> {
    const now = Timestamp.now();
    const batchId = `${userId}-${Date.now()}`;
    const payload = {
      userId,
      batchId,
      status: 'uploading' as const,
      totalCars,
      processedCars: 0,
      sourceType,
      errors: [],
      reviewItems: [] as BulkReviewItem[],
      createdAt: now,
    };

    const ref = await addDoc(collection(db, 'bulk_upload_jobs'), payload);
    return {
      id: ref.id,
      ...payload,
    };
  }

  /**
   * Approve a single review item (marks it ready to publish)
   */
  async approveReviewItem(jobId: string, numericId: number): Promise<void> {
    const jobRef = doc(db, 'bulk_upload_jobs', jobId);
    const snapshot = await getDoc(jobRef);
    if (!snapshot.exists()) return;

    const data = snapshot.data() as BulkUploadJob;
    const updatedItems = (data.reviewItems || []).map(item =>
      item.numericId === numericId
        ? { ...item, reviewStatus: 'approved' as const }
        : item
    );
    await updateDoc(jobRef, { reviewItems: updatedItems });
  }

  /**
   * Reject a single review item (excluded from publish)
   */
  async rejectReviewItem(jobId: string, numericId: number): Promise<void> {
    const jobRef = doc(db, 'bulk_upload_jobs', jobId);
    const snapshot = await getDoc(jobRef);
    if (!snapshot.exists()) return;

    const data = snapshot.data() as BulkUploadJob;
    const updatedItems = (data.reviewItems || []).map(item =>
      item.numericId === numericId
        ? { ...item, reviewStatus: 'rejected' as const }
        : item
    );
    await updateDoc(jobRef, { reviewItems: updatedItems });
  }

  /**
   * Publish all approved (and still-pending) review items by setting isActive=true
   * in cars_basic_info for matching numericIds.
   */
  async publishApprovedItems(jobId: string): Promise<number> {
    const jobRef = doc(db, 'bulk_upload_jobs', jobId);
    const snapshot = await getDoc(jobRef);
    if (!snapshot.exists()) {
      throw new Error('Job not found');
    }

    await updateDoc(jobRef, { status: 'publishing' });

    const data = snapshot.data() as BulkUploadJob;
    const toPublish = (data.reviewItems || []).filter(
      item =>
        item.reviewStatus === 'approved' || item.reviewStatus === 'pending'
    );

    if (!toPublish.length) {
      await updateDoc(jobRef, {
        status: 'completed',
        completedAt: Timestamp.now(),
      });
      return 0;
    }

    const publishedIds = toPublish.map(i => i.numericId);
    let published = 0;

    // Batch update cars_basic_info for each numericId
    const BATCH_SIZE = 20;
    for (let offset = 0; offset < publishedIds.length; offset += BATCH_SIZE) {
      const chunk = publishedIds.slice(offset, offset + BATCH_SIZE);
      const q = query(
        collection(db, 'cars_basic_info'),
        where('numericId', 'in', chunk)
      );
      const snaps = await getDocs(q);
      const batch = writeBatch(db);
      snaps.forEach(docSnap => {
        batch.update(docSnap.ref, {
          isActive: true,
          updatedAt: Timestamp.now(),
        });
      });
      await batch.commit();
      published += snaps.size;
    }

    await updateDoc(jobRef, {
      status: 'completed',
      completedAt: Timestamp.now(),
      reviewItems: (data.reviewItems || []).map(item =>
        publishedIds.includes(item.numericId)
          ? { ...item, reviewStatus: 'approved' as const }
          : item
      ),
    });

    serviceLogger.info('Bulk publish completed', { jobId, published });
    return published;
  }

  async updateUploadJob(
    jobId: string,
    patch: Partial<
      Omit<BulkUploadJob, 'id' | 'userId' | 'batchId' | 'createdAt'>
    >
  ): Promise<void> {
    await updateDoc(doc(db, 'bulk_upload_jobs', jobId), {
      ...patch,
      updatedAt: Timestamp.now(),
    });
  }

  private async uploadSingleCar(
    carData: ParsedCarData,
    userId: string
  ): Promise<{ numericId: number }> {
    const now = Timestamp.now();
    // Use the proper transactional counter to avoid collisions
    const numericId = await getNextCarNumericId(userId);

    const basicInfo = {
      userId,
      numericId,
      make: carData.make,
      model: carData.model,
      year: carData.year,
      isActive: false, // Draft until reviewer publishes
      status: 'draft',
      isFeatured: false,
      createdAt: now,
      updatedAt: now,
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
      updatedAt: now,
    };

    await addDoc(collection(db, 'cars_technical'), technical);

    const pricing = {
      userId,
      numericId,
      price: carData.price,
      currency: 'EUR',
      negotiable: true,
      createdAt: now,
      updatedAt: now,
    };

    await addDoc(collection(db, 'cars_pricing'), pricing);

    const condition = {
      userId,
      numericId,
      mileage: carData.mileage,
      color: carData.color,
      description: carData.description,
      createdAt: now,
      updatedAt: now,
    };

    await addDoc(collection(db, 'cars_condition'), condition);

    const location = {
      userId,
      numericId,
      city: carData.location || 'Bulgaria',
      country: 'Bulgaria',
      createdAt: now,
      updatedAt: now,
    };

    await addDoc(collection(db, 'cars_location'), location);

    if (carData.images && carData.images.length > 0) {
      const media = {
        userId,
        numericId,
        images: carData.images,
        mainImage: carData.images[0],
        createdAt: now,
        updatedAt: now,
      };

      await addDoc(collection(db, 'cars_media'), media);
    }

    return { numericId };
  }

  private async getUserPlan(userId: string): Promise<string> {
    try {
      const userDoc = await getDoc(doc(db, 'users', userId));
      if (userDoc.exists()) {
        const userData = userDoc.data();
        return (
          userData.plan?.tier ||
          userData.planTier ||
          userData.subscriptionTier ||
          'free'
        );
      }
      return 'free';
    } catch (error) {
      serviceLogger.error('Error getting user plan', error as Error, {
        userId,
      });
      return 'free';
    }
  }

  private normalizePlanTier(rawPlan: string): PlanTier {
    const plan = String(rawPlan || '')
      .trim()
      .toLowerCase();
    if (plan === 'company' || plan === 'enterprise') {
      return 'company';
    }
    if (plan === 'dealer' || plan === 'pro' || plan === 'professional') {
      return 'dealer';
    }
    return 'free';
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  validateUploadLimit(carCount: number, userPlan: PlanTier): boolean {
    const max = getMaxBulkUploadSize(userPlan);
    return carCount > 0 && (max === -1 || carCount <= max);
  }

  getMaxUploadSize(userPlan: PlanTier): number {
    return getMaxBulkUploadSize(userPlan);
  }
}

export const bulkUploadService = BulkUploadService.getInstance();
