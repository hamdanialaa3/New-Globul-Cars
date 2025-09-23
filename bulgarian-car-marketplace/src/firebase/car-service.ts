// src/firebase/car-service.ts
// Bulgarian Car Service for Car Marketplace

import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  getDoc,
  getDocs,
  query,
  where,
  orderBy,
  limit,
  startAfter,
  Timestamp,
  DocumentSnapshot
} from 'firebase/firestore';
import {
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject,
  listAll
} from 'firebase/storage';
import { cacheService } from '../services/cache-service';
import { db, storage, BulgarianFirebaseUtils } from './firebase-config';

// Car Condition Types
export type CarCondition = 'new' | 'used' | 'damaged';

// Fuel Types
export type FuelType = 'petrol' | 'diesel' | 'electric' | 'hybrid' | 'gas';

// Transmission Types
export type TransmissionType = 'manual' | 'automatic' | 'semi-automatic';

// Drive Types
export type DriveType = 'awd' | 'fwd' | 'rwd';

// Payment Types
export type PaymentType = 'buy' | 'leasing';

// Bulgarian Car Interface
export interface BulgarianCar {
  id: string;
  ownerId: string;
  ownerName: string;
  ownerEmail: string;
  ownerPhone?: string;

  // Basic Information
  make: string;
  model: string;
  year: number;
  mileage: number;
  price: number;
  currency: string;
  bodyStyle?: string; // Vehicle type (SUV, Sedan, etc.)
  seats?: number;
  doors?: number;
  slidingDoor?: boolean;
  paymentType?: PaymentType;

  // Technical Details
  fuelType: FuelType;
  transmission: TransmissionType;
  engineSize: number; // in cubic centimeters
  power: number; // in horsepower
  condition: CarCondition;
  powerKW?: number; // optional derived
  driveType?: DriveType;
  fuelConsumptionCombined?: number; // l/100km
  emissionSticker?: string;
  emissionClass?: string;
  particulateFilter?: boolean;
  fuelTankVolumeL?: number;
  weightKg?: number;
  cylinders?: number;

  // Location
  location: {
    city: string;
    region: string;
    postalCode: string;
    country: string;
    coordinates?: {
      latitude: number;
      longitude: number;
    };
  };

  // Description
  title: string;
  description: string;
  features: string[];
  color: string;
  exteriorColorCategory?: string; // e.g., black, grey, red
  metallic?: boolean;
  matte?: boolean;
  towbar?: 'fixed' | 'detachable' | 'swiveling' | 'none';
  trailerAssist?: boolean;
  brakedTrailerLoadKg?: number;
  unbrakedTrailerLoadKg?: number;
  noseWeightKg?: number; // support load
  parkingAssist?: string[]; // e.g., front, rear, camera, 360
  cruiseControl?: 'none' | 'cruise' | 'adaptive';
  interiorColor?: string;
  interiorMaterial?: string; // fabric, leather, alcantara, etc.
  airbags?: string; // level
  climateControl?: string; // types
  extras?: string[]; // additional features

  // Media
  images: string[]; // URLs to Firebase Storage
  mainImage: string;

  // Status
  isActive: boolean;
  isSold: boolean;
  isFeatured: boolean;
  views: number;
  favorites: number;

  // Bulgarian Specific
  hasBulgarianRegistration: boolean;
  vinNumber?: string;
  firstRegistrationDate?: Date;
  inspectionValidUntil?: Date;
  numberOfOwners?: number;
  fullServiceHistory?: boolean;
  roadworthy?: boolean;
  newService?: boolean;
  deliveryAvailable?: boolean;

  // Metadata
  createdAt: Date;
  updatedAt: Date;
  lastViewedAt?: Date;

  // Offer details
  sellerType?: 'dealer' | 'private' | 'company';
  sellerRating?: number; // 0-5
  adOnlineSinceDays?: number;
  withVideo?: boolean;
  discountOffer?: boolean;
  nonSmoker?: boolean;
  taxi?: boolean;
  vatReclaimable?: boolean;
  warranty?: boolean;
  damagedVehicles?: string; // descriptor
  commercial?: boolean; // export/import
  approvedUsedProgramme?: string;
}

// Car Search Filters
export interface CarSearchFilters {
  make?: string;
  model?: string;
  generation?: string; // جيل السيارة (مثل G05, F15)
  bodyStyle?: string; // نوع الهيكل (SUV, Sedan, Coupe, etc.)
  seats?: { from?: number; to?: number };
  doors?: { from?: number; to?: number };
  slidingDoor?: boolean;
  minYear?: number;
  maxYear?: number;
  minPrice?: number;
  maxPrice?: number;
  minMileage?: number;
  maxMileage?: number;
  fuelType?: FuelType;
  transmission?: TransmissionType;
  condition?: CarCondition;
  paymentType?: PaymentType;
  location?: {
    city?: string;
    region?: string;
    radius?: number; // in kilometers
  };
  features?: string[];
  keywords?: string;
  hasImages?: boolean;
  isActive?: boolean;
  isSold?: boolean;
  // Technical
  driveType?: DriveType;
  power?: { from?: number; to?: number; unit?: 'hp' | 'kW' };
  engineSizeCc?: { from?: number; to?: number };
  fuelTankVolumeL?: { from?: number; to?: number };
  weightKg?: { from?: number; to?: number };
  cylinders?: { from?: number; to?: number };
  fuelConsumptionCombinedMax?: number;
  emissionSticker?: string;
  emissionClass?: string;
  particulateFilter?: boolean;
  // Exterior
  exteriorColorCategory?: string;
  metallic?: boolean;
  matte?: boolean;
  towbar?: 'fixed' | 'detachable' | 'swiveling' | 'none';
  trailerAssist?: boolean;
  brakedTrailerLoadKg?: { from?: number };
  unbrakedTrailerLoadKg?: { from?: number };
  noseWeightKg?: { from?: number };
  parkingAssist?: string[];
  cruiseControl?: 'none' | 'cruise' | 'adaptive';
  // Interior
  interiorColor?: string;
  interiorMaterial?: string;
  airbags?: string;
  climateControl?: string;
  extras?: string[];
  // Offer details
  sellerType?: 'dealer' | 'private' | 'company';
  sellerRatingMin?: number;
  adOnlineSinceDays?: number;
  withVideo?: boolean;
  discountOffer?: boolean;
  nonSmoker?: boolean;
  taxi?: boolean;
  vatReclaimable?: boolean;
  warranty?: boolean;
  damagedVehicles?: string;
  commercial?: boolean;
  approvedUsedProgramme?: string;
}

// Bulgarian Car Service
export class BulgarianCarService {
  private static instance: BulgarianCarService;

  private constructor() {}

  static getInstance(): BulgarianCarService {
    if (!BulgarianCarService.instance) {
      BulgarianCarService.instance = new BulgarianCarService();
    }
    return BulgarianCarService.instance;
  }

  // Create a new car listing
  async createCarListing(carData: Omit<BulgarianCar, 'id' | 'createdAt' | 'updatedAt' | 'views' | 'favorites'>): Promise<string> {
    try {
      // Validate car data
      this.validateCarData(carData);

      // Create car object
      const car: Omit<BulgarianCar, 'id'> = {
        ...carData,
        views: 0,
        favorites: 0,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      // Add to Firestore
      const docRef = await addDoc(collection(db, 'cars'), {
        ...car,
        createdAt: Timestamp.fromDate(car.createdAt),
        updatedAt: Timestamp.fromDate(car.updatedAt),
        firstRegistrationDate: car.firstRegistrationDate ? Timestamp.fromDate(car.firstRegistrationDate) : null,
        inspectionValidUntil: car.inspectionValidUntil ? Timestamp.fromDate(car.inspectionValidUntil) : null
      });

      return docRef.id;
    } catch (error: any) {
      throw this.handleCarError(error);
    }
  }

  // Update car listing
  async updateCarListing(carId: string, updates: Partial<BulgarianCar>, ownerId: string): Promise<void> {
    try {
      // Verify ownership
      await this.verifyCarOwnership(carId, ownerId);

      // Validate updates
      if (updates.price !== undefined) {
        this.validatePrice(updates.price);
      }

      if (updates.location?.postalCode) {
        if (!BulgarianFirebaseUtils.validateBulgarianPostalCode(updates.location.postalCode)) {
          throw new Error('Невалиден пощенски код');
        }
      }

      // Update Firestore
      await updateDoc(doc(db, 'cars', carId), {
        ...updates,
        updatedAt: Timestamp.fromDate(new Date())
      });
    } catch (error: any) {
      throw this.handleCarError(error);
    }
  }

  // Delete car listing
  async deleteCarListing(carId: string, ownerId: string): Promise<void> {
    try {
      // Verify ownership
      await this.verifyCarOwnership(carId, ownerId);

      // Delete associated images
      await this.deleteCarImages(carId);

      // Delete from Firestore
      await deleteDoc(doc(db, 'cars', carId));
    } catch (error: any) {
      throw this.handleCarError(error);
    }
  }

  // Get car by ID
  async getCarById(carId: string): Promise<BulgarianCar | null> {
    try {
      const carDoc = await getDoc(doc(db, 'cars', carId));

      if (!carDoc.exists()) {
        return null;
      }

      const data = carDoc.data();
      return {
        id: carDoc.id,
        ...data,
        createdAt: data.createdAt.toDate(),
        updatedAt: data.updatedAt.toDate(),
        firstRegistrationDate: data.firstRegistrationDate?.toDate(),
        inspectionValidUntil: data.inspectionValidUntil?.toDate(),
        lastViewedAt: data.lastViewedAt?.toDate()
      } as BulgarianCar;
    } catch (error: any) {
      throw this.handleCarError(error);
    }
  }

  // Search cars with filters - Optimized version with caching
  async searchCars(
    filters: CarSearchFilters = {},
    sortBy: 'createdAt' | 'price' | 'mileage' | 'year' = 'createdAt',
    sortOrder: 'asc' | 'desc' = 'desc',
    limitCount: number = 20,
    startAfterDoc?: DocumentSnapshot
  ): Promise<{ cars: BulgarianCar[]; hasMore: boolean; lastDoc?: DocumentSnapshot }> {
    try {
      // Create cache key from search parameters
      const cacheKey = `search_${JSON.stringify(filters)}_${sortBy}_${sortOrder}_${limitCount}_${startAfterDoc?.id || 'start'}`;

      // Check cache first (only for non-paginated results)
      if (!startAfterDoc) {
        const cachedResult = cacheService.get(cacheKey);
        if (cachedResult) {
          return cachedResult;
        }
      }

      let q = query(collection(db, 'cars'));

      // Apply filters with optimized index usage
      // Priority: Apply most selective filters first
      if (filters.isActive !== undefined) {
        q = query(q, where('isActive', '==', filters.isActive));
      }

      if (filters.isSold !== undefined) {
        q = query(q, where('isSold', '==', filters.isSold));
      }

      // Apply make/model filters (compound index available)
      if (filters.make && filters.model) {
        q = query(q, where('make', '==', filters.make));
        q = query(q, where('model', '==', filters.model));
      } else if (filters.make) {
        q = query(q, where('make', '==', filters.make));
      }

      // Apply other filters
      if (filters.fuelType) {
        q = query(q, where('fuelType', '==', filters.fuelType));
      }

      if (filters.transmission) {
        q = query(q, where('transmission', '==', filters.transmission));
      }

      if (filters.condition) {
        q = query(q, where('condition', '==', filters.condition));
      }

      if (filters.hasImages !== undefined) {
        if (filters.hasImages) {
          q = query(q, where('images', '!=', []));
        } else {
          q = query(q, where('images', '==', []));
        }
      }

      // Apply sorting (must be last before pagination)
      q = query(q, orderBy(sortBy, sortOrder));

      // Apply pagination
      if (startAfterDoc) {
        q = query(q, startAfter(startAfterDoc));
      }

      q = query(q, limit(limitCount + 1)); // +1 to check if there are more results

      const querySnapshot = await getDocs(q);
      const cars: BulgarianCar[] = [];
      let lastDoc: DocumentSnapshot | undefined;

      const docs = querySnapshot.docs;
      for (let i = 0; i < docs.length && i < limitCount; i++) {
        const doc = docs[i];
        const data = doc.data();
        const car = {
          id: doc.id,
          ...data,
          createdAt: data.createdAt.toDate(),
          updatedAt: data.updatedAt.toDate(),
          firstRegistrationDate: data.firstRegistrationDate?.toDate(),
          inspectionValidUntil: data.inspectionValidUntil?.toDate(),
          lastViewedAt: data.lastViewedAt?.toDate()
        } as BulgarianCar;

        // Apply client-side filters that Firestore doesn't support directly
        if (this.matchesAdvancedFilters(car, filters)) {
          cars.push(car);
          lastDoc = doc;
        }
      }

      const hasMore = querySnapshot.size > limitCount;
      const result = { cars, hasMore, lastDoc };

      // Cache the result for non-paginated queries
      if (!startAfterDoc) {
        cacheService.set(cacheKey, result, 5 * 60 * 1000); // Cache for 5 minutes
      }

      return result;
    } catch (error: any) {
      throw this.handleCarError(error);
    }
  }

  // Get distinct option values for specified fields by scanning recent active cars (cached)
  async getDistinctOptions(fields: Array<keyof BulgarianCar | string>, limitCount: number = 300): Promise<Record<string, string[]>> {
    const cacheKey = `distinct_options_${fields.sort().join(',')}_${limitCount}`;
    const cached = cacheService.get(cacheKey);
    if (cached) return cached;

    // Fetch recent active cars
    let q = query(
      collection(db, 'cars'),
      where('isActive', '==', true),
      orderBy('createdAt', 'desc'),
      limit(limitCount)
    );

    const snapshot = await getDocs(q);
    const sets: Record<string, Set<string>> = {};
    fields.forEach(f => sets[String(f)] = new Set<string>());

    snapshot.forEach(docSnap => {
      const data = docSnap.data() as any;
      for (const field of fields) {
        const key = String(field);
        const value = data[key];
        if (value === undefined || value === null) continue;
        if (Array.isArray(value)) {
          value.forEach((v: any) => v != null && sets[key].add(String(v)));
        } else if (typeof value === 'object') {
          // skip nested objects here
        } else {
          sets[key].add(String(value));
        }
      }
      // Special-cases for nested/alias fields
      if (fields.includes('parkingAssist')) {
        const pa = data['parkingAssist'];
        if (Array.isArray(pa)) {
          pa.forEach((v: any) => v != null && sets['parkingAssist'].add(String(v)));
        }
      }
    });

    const result: Record<string, string[]> = {};
    for (const f of fields) {
      result[String(f)] = Array.from(sets[String(f)] || []).sort((a, b) => a.localeCompare(b));
    }

    cacheService.set(cacheKey, result, 5 * 60 * 1000);
    return result;
  }

  // Get distinct models by make (cached)
  async getModelsByMake(make: string, limitCount: number = 300): Promise<string[]> {
    const cacheKey = `models_by_make_${make}_${limitCount}`;
    const cached = cacheService.get(cacheKey);
    if (cached) return cached;

    let q = query(
      collection(db, 'cars'),
      where('make', '==', make),
      orderBy('createdAt', 'desc'),
      limit(limitCount)
    );

    const snapshot = await getDocs(q);
    const set = new Set<string>();
    snapshot.forEach(s => {
      const data = s.data();
      if (data.model) set.add(String(data.model));
    });
    const arr = Array.from(set).sort((a, b) => a.localeCompare(b));
    cacheService.set(cacheKey, arr, 5 * 60 * 1000);
    return arr;
  }

  // Check if car matches advanced filters (client-side filtering)
  private matchesAdvancedFilters(car: BulgarianCar, filters: CarSearchFilters): boolean {
    // Price range
    if (filters.minPrice !== undefined && car.price < filters.minPrice) {
      return false;
    }
    if (filters.maxPrice !== undefined && car.price > filters.maxPrice) {
      return false;
    }

    // Year range
    if (filters.minYear !== undefined && car.year < filters.minYear) {
      return false;
    }
    if (filters.maxYear !== undefined && car.year > filters.maxYear) {
      return false;
    }

    // Max mileage
    if (filters.minMileage !== undefined && car.mileage < filters.minMileage) {
      return false;
    }
    if (filters.maxMileage !== undefined && car.mileage > filters.maxMileage) {
      return false;
    }

    // Location
    if (filters.location?.city && car.location.city !== filters.location.city) {
      return false;
    }
    if (filters.location?.region && car.location.region !== filters.location.region) {
      return false;
    }

    // Features
    if (filters.features && filters.features.length > 0) {
      const hasAllFeatures = filters.features.every(feature =>
        car.features.includes(feature)
      );
      if (!hasAllFeatures) {
        return false;
      }
    }

    // Basic extra filters
    if (filters.bodyStyle && car.bodyStyle !== filters.bodyStyle) return false;
    if (filters.seats) {
      if (filters.seats.from !== undefined && (car.seats ?? 0) < filters.seats.from) return false;
      if (filters.seats.to !== undefined && (car.seats ?? 0) > filters.seats.to) return false;
    }
    if (filters.doors) {
      if (filters.doors.from !== undefined && (car.doors ?? 0) < filters.doors.from) return false;
      if (filters.doors.to !== undefined && (car.doors ?? 0) > filters.doors.to) return false;
    }
    if (filters.slidingDoor !== undefined && (car.slidingDoor || false) !== filters.slidingDoor) return false;
    if (filters.paymentType && car.paymentType !== filters.paymentType) return false;

    // Technical filters
    if (filters.driveType && car.driveType !== filters.driveType) return false;
    if (filters.power) {
      const hp = car.power;
      const value = filters.power;
      const carValue = value.unit === 'kW' && car.powerKW ? car.powerKW : hp;
      if (value.from !== undefined && (carValue ?? 0) < value.from) return false;
      if (value.to !== undefined && (carValue ?? 0) > value.to) return false;
    }
    if (filters.engineSizeCc) {
      const cc = car.engineSize;
      if (filters.engineSizeCc.from !== undefined && cc < filters.engineSizeCc.from) return false;
      if (filters.engineSizeCc.to !== undefined && cc > filters.engineSizeCc.to) return false;
    }
    if (filters.fuelTankVolumeL) {
      const v = car.fuelTankVolumeL ?? 0;
      if (filters.fuelTankVolumeL.from !== undefined && v < filters.fuelTankVolumeL.from) return false;
      if (filters.fuelTankVolumeL.to !== undefined && v > filters.fuelTankVolumeL.to) return false;
    }
    if (filters.weightKg) {
      const w = car.weightKg ?? 0;
      if (filters.weightKg.from !== undefined && w < filters.weightKg.from) return false;
      if (filters.weightKg.to !== undefined && w > filters.weightKg.to) return false;
    }
    if (filters.cylinders) {
      const c = car.cylinders ?? 0;
      if (filters.cylinders.from !== undefined && c < filters.cylinders.from) return false;
      if (filters.cylinders.to !== undefined && c > filters.cylinders.to) return false;
    }
    if (filters.fuelConsumptionCombinedMax !== undefined) {
      const fc = car.fuelConsumptionCombined ?? Number.MAX_SAFE_INTEGER;
      if (fc > filters.fuelConsumptionCombinedMax) return false;
    }
    if (filters.emissionSticker && car.emissionSticker !== filters.emissionSticker) return false;
    if (filters.emissionClass && car.emissionClass !== filters.emissionClass) return false;
    if (filters.particulateFilter !== undefined && (car.particulateFilter || false) !== filters.particulateFilter) return false;

    // Exterior
    if (filters.exteriorColorCategory && car.exteriorColorCategory !== filters.exteriorColorCategory) return false;
    if (filters.metallic !== undefined && (car.metallic || false) !== filters.metallic) return false;
    if (filters.matte !== undefined && (car.matte || false) !== filters.matte) return false;
    if (filters.towbar && (car.towbar || 'none') !== filters.towbar) return false;
    if (filters.trailerAssist !== undefined && (car.trailerAssist || false) !== filters.trailerAssist) return false;
    if (filters.brakedTrailerLoadKg?.from !== undefined && (car.brakedTrailerLoadKg ?? 0) < filters.brakedTrailerLoadKg.from) return false;
    if (filters.unbrakedTrailerLoadKg?.from !== undefined && (car.unbrakedTrailerLoadKg ?? 0) < filters.unbrakedTrailerLoadKg.from) return false;
    if (filters.noseWeightKg?.from !== undefined && (car.noseWeightKg ?? 0) < filters.noseWeightKg.from) return false;
    if (filters.parkingAssist && filters.parkingAssist.length > 0) {
      const hasAll = (filters.parkingAssist).every(p => (car.parkingAssist || []).includes(p));
      if (!hasAll) return false;
    }
    if (filters.cruiseControl && (car.cruiseControl || 'none') !== filters.cruiseControl) return false;

    // Interior
    if (filters.interiorColor && car.interiorColor !== filters.interiorColor) return false;
    if (filters.interiorMaterial && car.interiorMaterial !== filters.interiorMaterial) return false;
    if (filters.airbags && car.airbags !== filters.airbags) return false;
    if (filters.climateControl && car.climateControl !== filters.climateControl) return false;
    if (filters.extras && filters.extras.length > 0) {
      const hasAllExtras = filters.extras.every(x => (car.extras || []).includes(x));
      if (!hasAllExtras) return false;
    }

    // Offer details
    if (filters.sellerType && car.sellerType !== filters.sellerType) return false;
    if (filters.sellerRatingMin !== undefined && (car.sellerRating ?? 0) < filters.sellerRatingMin) return false;
    if (filters.adOnlineSinceDays !== undefined) {
      // Compute days since ad was created
      const now = new Date();
      const created = car.createdAt instanceof Date ? car.createdAt : new Date(car.createdAt);
      const diffMs = now.getTime() - created.getTime();
      const daysSince = Math.floor(diffMs / (1000 * 60 * 60 * 24));
      // Keep ads that are not older than the specified days window
      if (daysSince > filters.adOnlineSinceDays) return false;
    }
    if (filters.withVideo !== undefined && (car.withVideo || false) !== filters.withVideo) return false;
    if (filters.discountOffer !== undefined && (car.discountOffer || false) !== filters.discountOffer) return false;
    if (filters.nonSmoker !== undefined && (car.nonSmoker || false) !== filters.nonSmoker) return false;
    if (filters.taxi !== undefined && (car.taxi || false) !== filters.taxi) return false;
    if (filters.vatReclaimable !== undefined && (car.vatReclaimable || false) !== filters.vatReclaimable) return false;
    if (filters.warranty !== undefined && (car.warranty || false) !== filters.warranty) return false;
    if (filters.damagedVehicles && (car.damagedVehicles || '') !== filters.damagedVehicles) return false;
    if (filters.commercial !== undefined && (car.commercial || false) !== filters.commercial) return false;
    if (filters.approvedUsedProgramme && (car.approvedUsedProgramme || '') !== filters.approvedUsedProgramme) return false;

    // Keywords search
    if (filters.keywords) {
      const keywords = filters.keywords.toLowerCase();
      const searchableText = [
        car.title,
        car.description,
        car.make,
        car.model,
        car.location.city,
        car.location.region,
        ...car.features
      ].join(' ').toLowerCase();

      if (!searchableText.includes(keywords)) {
        return false;
      }
    }

    return true;
  }

  // Get user's car listings
  async getUserCarListings(userId: string, includeInactive: boolean = false): Promise<BulgarianCar[]> {
    try {
      let q = query(
        collection(db, 'cars'),
        where('ownerId', '==', userId),
        orderBy('createdAt', 'desc')
      );

      if (!includeInactive) {
        q = query(q, where('isActive', '==', true));
      }

      const querySnapshot = await getDocs(q);
      const cars: BulgarianCar[] = [];

      querySnapshot.forEach((doc) => {
        const data = doc.data();
        cars.push({
          id: doc.id,
          ...data,
          createdAt: data.createdAt.toDate(),
          updatedAt: data.updatedAt.toDate(),
          firstRegistrationDate: data.firstRegistrationDate?.toDate(),
          inspectionValidUntil: data.inspectionValidUntil?.toDate(),
          lastViewedAt: data.lastViewedAt?.toDate()
        } as BulgarianCar);
      });

      return cars;
    } catch (error: any) {
      throw this.handleCarError(error);
    }
  }

  // Upload car images
  async uploadCarImages(carId: string, files: File[]): Promise<string[]> {
    try {
      const uploadedUrls: string[] = [];

      for (let i = 0; i < files.length && i < 10; i++) { // Max 10 images
        const file = files[i];

        // Validate file type
        if (!file.type.startsWith('image/')) {
          throw new Error(`Файл ${file.name} не е изображение`);
        }

        // Validate file size (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
          throw new Error(`Файл ${file.name} е твърде голям (максимум 5MB)`);
        }

        // Create storage reference
        const storageRef = ref(storage, `cars/${carId}/${Date.now()}_${file.name}`);

        // Upload file
        await uploadBytes(storageRef, file);

        // Get download URL
        const downloadURL = await getDownloadURL(storageRef);
        uploadedUrls.push(downloadURL);
      }

      return uploadedUrls;
    } catch (error: any) {
      throw this.handleCarError(error);
    }
  }

  // Delete car images
  async deleteCarImages(carId: string): Promise<void> {
    try {
      const imagesRef = ref(storage, `cars/${carId}`);
      const imagesList = await listAll(imagesRef);

      // Delete all images
      const deletePromises = imagesList.items.map((itemRef) => deleteObject(itemRef));
      await Promise.all(deletePromises);
    } catch (error: any) {
      console.error('Error deleting car images:', error);
    }
  }

  // Mark car as viewed
  async markCarAsViewed(carId: string): Promise<void> {
    try {
      const carRef = doc(db, 'cars', carId);
      await updateDoc(carRef, {
        views: (await getDoc(carRef)).data()?.views + 1 || 1,
        lastViewedAt: Timestamp.fromDate(new Date())
      });
    } catch (error: any) {
      console.error('Error marking car as viewed:', error);
    }
  }

  // Toggle favorite status
  async toggleFavorite(carId: string, userId: string): Promise<boolean> {
    try {
      const favoriteRef = doc(db, 'favorites', `${userId}_${carId}`);
      const favoriteDoc = await getDoc(favoriteRef);

      if (favoriteDoc.exists()) {
        // Remove favorite
        await deleteDoc(favoriteRef);

        // Decrease favorite count
        await updateDoc(doc(db, 'cars', carId), {
          favorites: (await getDoc(doc(db, 'cars', carId))).data()?.favorites - 1 || 0
        });

        return false; // Not favorite anymore
      } else {
        // Add favorite
        await addDoc(collection(db, 'favorites'), {
          userId,
          carId,
          createdAt: Timestamp.fromDate(new Date())
        });

        // Increase favorite count
        await updateDoc(doc(db, 'cars', carId), {
          favorites: (await getDoc(doc(db, 'cars', carId))).data()?.favorites + 1 || 1
        });

        return true; // Now favorite
      }
    } catch (error: any) {
      throw this.handleCarError(error);
    }
  }

  // Get user's favorite cars
  async getUserFavoriteCars(userId: string): Promise<BulgarianCar[]> {
    try {
      const favoritesQuery = query(
        collection(db, 'favorites'),
        where('userId', '==', userId)
      );

      const favoritesSnapshot = await getDocs(favoritesQuery);
      const carIds: string[] = [];

      favoritesSnapshot.forEach((doc) => {
        carIds.push(doc.data().carId);
      });

      // Get car details
      const cars: BulgarianCar[] = [];
      for (const carId of carIds) {
        const car = await this.getCarById(carId);
        if (car) {
          cars.push(car);
        }
      }

      return cars;
    } catch (error: any) {
      throw this.handleCarError(error);
    }
  }

  // Get popular cars
  async getPopularCars(limitCount: number = 10): Promise<BulgarianCar[]> {
    try {
      const q = query(
        collection(db, 'cars'),
        where('isActive', '==', true),
        where('isSold', '==', false),
        orderBy('views', 'desc'),
        limit(limitCount)
      );

      const querySnapshot = await getDocs(q);
      const cars: BulgarianCar[] = [];

      querySnapshot.forEach((doc) => {
        const data = doc.data();
        cars.push({
          id: doc.id,
          ...data,
          createdAt: data.createdAt.toDate(),
          updatedAt: data.updatedAt.toDate(),
          firstRegistrationDate: data.firstRegistrationDate?.toDate(),
          inspectionValidUntil: data.inspectionValidUntil?.toDate(),
          lastViewedAt: data.lastViewedAt?.toDate()
        } as BulgarianCar);
      });

      return cars;
    } catch (error: any) {
      // Gracefully degrade on permission issues for public featured cars
      if (error && (error.code === 'permission-denied' || error.code === 'failed-precondition')) {
        if (process.env.NODE_ENV !== 'production') {
          console.warn('getPopularCars permission issue, returning empty list:', error);
        }
        return [];
      }
      throw this.handleCarError(error);
    }
  }

  // Private helper methods
  private validateCarData(carData: Omit<BulgarianCar, 'id' | 'createdAt' | 'updatedAt' | 'views' | 'favorites'>): void {
    if (!carData.make || !carData.model) {
      throw new Error('Марка и модел на автомобила са задължителни');
    }

    if (carData.year < 1900 || carData.year > new Date().getFullYear() + 1) {
      throw new Error('Невалидна година на производство');
    }

    this.validatePrice(carData.price);

    if (carData.mileage < 0) {
      throw new Error('Километражът не може да бъде отрицателен');
    }

    if (!carData.location.city || !carData.location.region) {
      throw new Error('Град и област са задължителни');
    }

    if (!BulgarianFirebaseUtils.validateBulgarianPostalCode(carData.location.postalCode)) {
      throw new Error('Невалиден пощенски код');
    }

    if (!carData.title || carData.title.length < 10) {
      throw new Error('Заглавието трябва да бъде поне 10 символа');
    }

    if (!carData.description || carData.description.length < 50) {
      throw new Error('Описанието трябва да бъде поне 50 символа');
    }
  }

  private validatePrice(price: number): void {
    if (price <= 0) {
      throw new Error('Цената трябва да бъде положително число');
    }

    if (price > 10000000) { // 10 million EUR
      throw new Error('Цената е твърде висока');
    }
  }

  private async verifyCarOwnership(carId: string, ownerId: string): Promise<void> {
    const car = await this.getCarById(carId);
    if (!car) {
      throw new Error('Автомобилът не е намерен');
    }

    if (car.ownerId !== ownerId) {
      throw new Error('Нямате права да редактирате този автомобил');
    }
  }

  private handleCarError(error: any): Error {
    const errorMessages: { [key: string]: string } = {
      'permission-denied': 'Нямате права за достъп до този автомобил',
      'not-found': 'Автомобилът не е намерен',
      'invalid-argument': 'Невалидни данни за автомобила',
      'resource-exhausted': 'Твърде много заявки. Моля опитайте по-късно',
      'internal': 'Вътрешна грешка в системата',
      'storage/unauthorized': 'Нямате права да качвате файлове',
      'storage/canceled': 'Качването беше отменено',
      'storage/quota-exceeded': 'Надхвърлен е лимитът за съхранение',
      'storage/invalid-format': 'Невалиден формат на файла'
    };

    const bulgarianMessage = errorMessages[error.code] || 'Възникна грешка при обработката на автомобила';
    return new Error(bulgarianMessage);
  }
}

// Export singleton instance
export const bulgarianCarService = BulgarianCarService.getInstance();