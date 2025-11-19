// Sell Workflow Service - Complete Firebase Integration
// خدمة متكاملة لحفظ بيانات workflow بيع السيارات في Firebase

import {
  collection,
  doc,
  addDoc,
  updateDoc,
  serverTimestamp,
  Timestamp
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '@/firebase/firebase-config';
import { BULGARIAN_CITIES } from '@/constants/bulgarianCities';
import { CarListing } from '@/types/CarListing';
import LocationHelperService from './location-helper-service';
import { logger } from './logger-service';
import { serviceLogger } from './logger-wrapper';

// Extended location structure for new system
export interface EnhancedLocation {
  cityId: string;
  cityName: {
    en: string;
    bg: string;
    ar: string;
  };
  coordinates: {
    lat: number;
    lng: number;
  };
  region?: string;
  postalCode?: string;
  address?: string;
}

export class SellWorkflowService {
  private static collectionName = 'cars';

  /**
   * Get the appropriate Firestore collection name based on vehicle type
   * Returns the collection name where vehicles of this type should be stored
   */
  static getCollectionNameForVehicleType(vehicleType: string): string {
    const typeMap: Record<string, string> = {
      'car': 'passenger_cars',           // Passenger Car / Personal use
      'suv': 'suvs',                      // SUV/Jeep / Off-road
      'van': 'vans',                      // Van / Cargo/Combi
      'motorcycle': 'motorcycles',        // Motorcycle / Two-wheeled
      'truck': 'trucks',                  // Truck / Cargo
      'bus': 'buses'                      // Bus / Passenger
    };

    // Default to 'cars' if type not found (backward compatibility)
    return typeMap[vehicleType?.toLowerCase()] || 'cars';
  }

  /**
   * Transform workflow data to structured car listing
   */
  private static transformWorkflowData(
    workflowData: any,
    userId: string
  ): any {
    // ✅ FIXED: Use REGION as primary location (not city!)
    // Region = المحافظة (للبرمجة)
    // City = المدينة التابعة (للجمال فقط)
    
    const regionName = workflowData.region; // e.g., "Варна"
    const cityName = workflowData.city; // e.g., "Аксаково" (decorative only)
    const postalCode = workflowData.postalCode; // decorative only
    
    // Find region in BULGARIAN_CITIES (case-insensitive, flexible matching)
    const normalizeString = (str: string) => str?.toLowerCase().trim().replace(/\s+/g, ' ');
    const regionData = regionName
      ? BULGARIAN_CITIES.find(
      c => normalizeString(c.nameBg) === normalizeString(regionName) || 
           normalizeString(c.nameEn) === normalizeString(regionName) || 
           c.id === regionName?.toLowerCase().replace(/\s+/g, '-')
      )
      : null;
    
    if (regionData) {
      logger.info('Location processed successfully', { 
        region: regionData.id, 
        regionName: regionData.nameBg,
        city: cityName 
      });
    } else if (regionName) {
      logger.warn('Region not found in reference list, continuing without mapped region', {
        region: regionName
      });
    }

    // Parse arrays from comma-separated strings OR arrays
    const parseArray = (str: string | string[] | undefined): string[] => {
      if (!str) return [];
      // If already an array, return it
      if (Array.isArray(str)) return str;
      // If string, split it
      if (typeof str === 'string') {
        return str.split(',').map(s => s.trim()).filter(s => s);
      }
      return [];
    };

    // Get image URLs from workflow
    const imageUrls = parseArray(workflowData.images);

    // Return data matching CarListing type structure
    return {
      // Basic Information
      vehicleType: workflowData.vehicleType || 'car',
      make: workflowData.make || '',
      model: workflowData.model || '',
      year: parseInt(workflowData.year || '0'),
      mileage: parseInt(workflowData.mileage || '0'),
      fuelType: workflowData.fuelType || workflowData.fm || '',
      transmission: workflowData.transmission || 'Manual',
      power: workflowData.power ? parseInt(workflowData.power) : undefined, // in hp
      powerKW: workflowData.powerKW ? parseFloat(workflowData.powerKW) : (workflowData.power ? parseFloat(workflowData.power) * 0.7457 : undefined), // Convert hp to kW if not provided
      engineSize: workflowData.engineSize ? parseFloat(workflowData.engineSize) : undefined, // Cubic Capacity in cm³
      color: workflowData.color,
      exteriorColor: workflowData.exteriorColor || workflowData.color,
      description: workflowData.description || '',
      searchKeywords: workflowData.searchKeywords || workflowData.description || '', // For search in description
      
      // ⭐ Vehicle Details
      seats: workflowData.seats?.toString(),
      numberOfSeats: workflowData.seats ? parseInt(workflowData.seats) : (workflowData.numberOfSeats ? parseInt(workflowData.numberOfSeats) : undefined),
      doors: workflowData.doors?.toString(),
      numberOfDoors: workflowData.doors ? parseInt(workflowData.doors) : (workflowData.numberOfDoors ? parseInt(workflowData.numberOfDoors) : undefined),
      slidingDoor: workflowData.slidingDoor === 'true' || workflowData.slidingDoor === true,
      condition: workflowData.condition || 'used',
      previousOwners: workflowData.previousOwners?.toString(),
      numberOfOwners: workflowData.previousOwners ? parseInt(workflowData.previousOwners) : (workflowData.numberOfOwners ? parseInt(workflowData.numberOfOwners) : undefined),
      
      // ⭐ Registration & Inspection
      firstRegistrationDate: workflowData.firstRegistration 
        ? new Date(workflowData.firstRegistration) 
        : (workflowData.firstRegistrationDate ? new Date(workflowData.firstRegistrationDate) : undefined),
      firstRegistration: workflowData.firstRegistration 
        ? new Date(workflowData.firstRegistration) 
        : undefined,
      inspectionValidUntil: workflowData.huValid 
        ? new Date(workflowData.huValid) 
        : (workflowData.inspectionValidUntil ? new Date(workflowData.inspectionValidUntil) : undefined),
      huValid: workflowData.huValid 
        ? new Date(workflowData.huValid) 
        : undefined,
      
      // ⭐ Technical Details
      fuelTankCapacity: workflowData.fuelTankVolume ? parseFloat(workflowData.fuelTankVolume) : (workflowData.fuelTankCapacity ? parseFloat(workflowData.fuelTankCapacity) : undefined),
      fuelTankVolumeL: workflowData.fuelTankVolume ? parseFloat(workflowData.fuelTankVolume) : undefined,
      cylinders: workflowData.cylinders ? parseInt(workflowData.cylinders) : undefined,
      driveType: workflowData.driveType || '',
      emissionSticker: workflowData.emissionSticker || '',
      emissionClass: workflowData.emissionClass || '',
      particulateFilter: workflowData.particulateFilter === 'true' || workflowData.particulateFilter === true,
      weight: workflowData.weight ? parseFloat(workflowData.weight) : undefined,
      weightKg: workflowData.weight ? parseFloat(workflowData.weight) : (workflowData.weightKg ? parseFloat(workflowData.weightKg) : undefined),
      fuelConsumption: workflowData.fuelConsumption ? parseFloat(workflowData.fuelConsumption) : undefined, // l/100km
      
      // ⭐ Colors
      interiorColor: workflowData.interiorColor || '',
      interiorMaterial: workflowData.interiorMaterial || '',
      
      // ⭐ Exterior Features
      trailerCoupling: workflowData.trailerCoupling === 'true' || workflowData.trailerCoupling === true || workflowData.towbar !== 'none',
      towbar: workflowData.towbar || (workflowData.trailerCoupling === 'true' ? 'fixed' : 'none'),
      trailerLoadBraked: workflowData.trailerLoadBraked ? parseInt(workflowData.trailerLoadBraked) : (workflowData.brakedTrailerLoadKg ? parseInt(workflowData.brakedTrailerLoadKg) : undefined),
      trailerLoadUnbraked: workflowData.trailerLoadUnbraked ? parseInt(workflowData.trailerLoadUnbraked) : (workflowData.unbrakedTrailerLoadKg ? parseInt(workflowData.unbrakedTrailerLoadKg) : undefined),
      noseWeight: workflowData.noseWeight ? parseInt(workflowData.noseWeight) : (workflowData.noseWeightKg ? parseInt(workflowData.noseWeightKg) : undefined),
      parkingSensors: parseArray(workflowData.parkingSensors),
      parkingAssist: parseArray(workflowData.parkingAssist || workflowData.parkingSensors),
      cruiseControl: workflowData.cruiseControl || '',
      
      // ⭐ Interior Features
      airbags: workflowData.airbags || '',
      airConditioning: workflowData.airConditioning || workflowData.climateControl || '',
      climateControl: workflowData.climateControl || workflowData.airConditioning || '',
      
      // History
      accidentHistory: workflowData.hasAccidentHistory === 'true' || workflowData.accidentHistory === true,
      serviceHistory: workflowData.hasServiceHistory === 'true' || workflowData.serviceHistory === true,
      fullServiceHistory: workflowData.fullServiceHistory === 'true' || workflowData.fullServiceHistory === true,
      roadworthy: workflowData.roadworthy !== 'false' && workflowData.roadworthy !== false && (workflowData.isRoadworthy !== false),
      
      // Equipment Arrays
      safetyEquipment: parseArray(workflowData.safety),
      comfortEquipment: parseArray(workflowData.comfort),
      infotainmentEquipment: parseArray(workflowData.infotainment),
      extras: parseArray(workflowData.extras),
      
      // Pricing
      price: parseFloat(workflowData.price || '0'),
      currency: workflowData.currency || 'EUR',
      priceType: workflowData.priceType || 'fixed',
      paymentType: workflowData.paymentType || '',
      negotiable: workflowData.negotiable === 'true' || workflowData.negotiable === true,
      financing: workflowData.financing === 'true' || workflowData.financing === true,
      tradeIn: workflowData.tradeIn === 'true' || workflowData.tradeIn === true,
      warranty: workflowData.warranty === 'true' || workflowData.warranty === true,
      warrantyMonths: workflowData.warrantyMonths ? parseInt(workflowData.warrantyMonths) : undefined,
      paymentMethods: parseArray(workflowData.paymentMethods),
      additionalCosts: workflowData.additionalCosts,
      vatDeductible: workflowData.vatDeductible === 'true' || workflowData.vatDeductible === true,
      vatReclaimable: workflowData.vatReclaimable === 'true' || workflowData.vatReclaimable === true || workflowData.vatDeductible === 'true',
      
      // Seller Information
      sellerType: workflowData.sellerType || 'private',
      sellerName: workflowData.sellerName || '',
      sellerEmail: workflowData.sellerEmail || '',
      sellerPhone: workflowData.sellerPhone || '',
      sellerId: userId,  // ✅ Owner user ID
      preferredContact: parseArray(workflowData.preferredContact),
      availableHours: workflowData.availableHours,
      additionalInfo: workflowData.additionalInfo,
      
      // ⭐ Offer Details
      dealerRating: workflowData.dealerRating ? parseFloat(workflowData.dealerRating) : undefined,
      adOnlineSince: workflowData.createdAt ? new Date(workflowData.createdAt) : new Date(), // Will be set to createdAt
      adOnlineSinceDays: workflowData.adOnlineSinceDays ? parseInt(workflowData.adOnlineSinceDays) : undefined,
      hasVideo: workflowData.hasVideo === 'true' || workflowData.hasVideo === true || !!workflowData.videoUrl,
      withVideo: workflowData.hasVideo === 'true' || workflowData.hasVideo === true || !!workflowData.videoUrl,
      videoUrl: workflowData.videoUrl || '',
      hasImages: !!(imageUrls && imageUrls.length > 0), // Derived from images array
      discountOffer: workflowData.discountOffer === 'true' || workflowData.discountOffer === true,
      nonSmoker: workflowData.nonSmoker === 'true' || workflowData.nonSmoker === true,
      taxi: workflowData.taxi === 'true' || workflowData.taxi === true,
      damagedVehicles: workflowData.damagedVehicles || (workflowData.isDamaged === 'true' ? 'Yes' : undefined),
      isDamaged: workflowData.isDamaged === 'true' || workflowData.isDamaged === true || !!workflowData.damagedVehicles,
      commercial: workflowData.commercial === 'true' || workflowData.commercial === true,
      approvedUsedProgramme: workflowData.approvedUsedProgramme || '',
      
      // Location - SIMPLE: Use region as primary field
      region: regionData?.id || '',
      regionNameBg: regionData?.nameBg || '',
      regionNameEn: regionData?.nameEn || '',
      
      // City and postal code (decorative only - not used for filtering)
      city: cityName || '', // e.g., 'Аксаково' - decorative ❌
      postalCode: postalCode || '',
      
      // Coordinates from region
      coordinates: regionData?.coordinates,
      
      // System Fields
      status: 'active' as const,
      isActive: true,  // ✅ CRITICAL FIX: Add isActive for visibility
      isSold: false,   // ✅ CRITICAL FIX: Add isSold flag
      views: 0,
      favorites: 0,
      isFeatured: false,
      isUrgent: false
    };
  }

  /**
   * Upload images to Firebase Storage
   */
  static async uploadCarImages(
    carId: string,
    imageFiles: File[],
    vehicleType?: string
  ): Promise<string[]> {
    try {
      const uploadPromises = imageFiles.map(async (file, index) => {
        const timestamp = Date.now();
        const fileName = `${timestamp}_${index}_${file.name}`;
        const imageRef = ref(storage, `cars/${carId}/images/${fileName}`);
        
        const snapshot = await uploadBytes(imageRef, file);
        const downloadUrl = await getDownloadURL(snapshot.ref);
        
        return downloadUrl;
      });

      const imageUrls = await Promise.all(uploadPromises);
      serviceLogger.info('Uploaded car images', { carId, imageCount: imageUrls.length });
      
      return imageUrls;
    } catch (error) {
      serviceLogger.error('Error uploading car images', error as Error, { carId, imageCount: imageFiles.length });
      throw new Error('Failed to upload car images');
    }
  }

  /**
   * Create complete car listing from workflow
   */
  static async createCarListing(
    workflowData: any,
    userId: string,
    imageFiles?: File[]
  ): Promise<string> {
    try {
      serviceLogger.info('Starting car listing creation', { userId, hasMake: !!workflowData.make, hasModel: !!workflowData.model });
      serviceLogger.debug('Workflow data received', { make: workflowData.make, model: workflowData.model, year: workflowData.year });

      // Validate required fields
      if (!workflowData.make || !workflowData.year) {
        throw new Error('Missing required vehicle information');
      }

      // Transform workflow data to structured car listing
      const carData = this.transformWorkflowData(workflowData, userId);

      // Get the appropriate collection name based on vehicle type
      const collectionName = this.getCollectionNameForVehicleType(carData.vehicleType || 'car');
      serviceLogger.info('Using collection for vehicle type', { 
        vehicleType: carData.vehicleType, 
        collectionName 
      });

      // Calculate adOnlineSinceDays from createdAt (will be 0 for new ads)
      const now = new Date();
      const adOnlineSince = carData.adOnlineSince || now;
      
      // Create the listing document in the appropriate collection
      const docRef = await addDoc(collection(db, collectionName), {
        ...carData,
        adOnlineSince: Timestamp.fromDate(adOnlineSince),
        adOnlineSinceDays: carData.adOnlineSinceDays || 0, // Will be updated daily via cloud function if needed
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        expiresAt: Timestamp.fromDate(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)) // 30 days
      });

      const carId = docRef.id;
      serviceLogger.info('Car listing created with ID', { 
        carId, 
        userId, 
        make: carData.make, 
        model: carData.model,
        vehicleType: carData.vehicleType,
        collectionName 
      });

      // Upload images if provided
      if (imageFiles && imageFiles.length > 0) {
        const imageUrls = await this.uploadCarImages(carId, imageFiles, carData.vehicleType);
        
        // Update the listing with image URLs in the correct collection
        await updateDoc(doc(db, collectionName, carId), {
          images: imageUrls,
          updatedAt: serverTimestamp()
        });

        serviceLogger.info('Images uploaded and linked to car', { carId, imageCount: imageUrls.length });
      }

      // ✅ CRITICAL FIX: Invalidate homepage cache
      const { homePageCache, CACHE_KEYS } = await import('./homepage-cache.service');
      homePageCache.invalidate(CACHE_KEYS.FEATURED_CARS(4));
      homePageCache.invalidate(CACHE_KEYS.FEATURED_CARS(8));
      homePageCache.invalidate(CACHE_KEYS.FEATURED_CARS(10));
      serviceLogger.info('Homepage cache invalidated after car creation', { carId });

      // Clear cache for the region
      const { CityCarCountService } = await import('./cityCarCountService');
      if (carData.region) {
        CityCarCountService.clearCacheForCity(carData.region);
      }

      serviceLogger.info('Car listing creation completed successfully', { carId, userId });
      return carId;
    } catch (error) {
      serviceLogger.error('Error creating car listing', error as Error, { userId });
      throw error;
    }
  }

  /**
   * Update existing car listing
   */
  static async updateCarListing(
    carId: string,
    updates: Partial<CarListing>
  ): Promise<void> {
    try {
      const docRef = doc(db, this.collectionName, carId);
      
      await updateDoc(docRef, {
        ...updates,
        updatedAt: serverTimestamp()
      });

      serviceLogger.info('Car listing updated successfully', { carId });
    } catch (error) {
      serviceLogger.error('Error updating car listing', error as Error, { carId });
      throw new Error('Failed to update car listing');
    }
  }

  /**
   * Validate workflow data completeness
   * ⚡ FLEXIBLE: Allows publishing with missing fields
   */
  static validateWorkflowData(workflowData: any, strict: boolean = false): {
    isValid: boolean;
    missingFields: string[];
    criticalMissing: boolean;
  } {
    // RECOMMENDED fields (not blocking)
    const recommendedFields = [
      { key: 'sellerName', label: 'Seller Name (Име)' },
      { key: 'sellerEmail', label: 'Seller Email (Имейл)' },
      { key: 'sellerPhone', label: 'Seller Phone (Телефон)' }
    ];

    const missingFields: string[] = [];
    let criticalMissing = false;

    // Critical: make
    if (!workflowData.make) {
      missingFields.push('Make (Марка)');
      criticalMissing = true;
    }

    // Critical: year
    if (!workflowData.year) {
      missingFields.push('Year (Година)');
      criticalMissing = true;
    }

    // Critical: at least one image
    const imagesCount =
      workflowData.imagesCount ??
      (Array.isArray(workflowData.images)
        ? workflowData.images.length
        : typeof workflowData.images === 'string'
          ? parseInt(workflowData.images, 10)
          : typeof workflowData.images === 'number'
            ? workflowData.images
            : 0);

    if (!imagesCount || Number.isNaN(imagesCount) || imagesCount <= 0) {
      missingFields.push('Images (Снимки)');
      criticalMissing = true;
    }
    
    // Check recommended fields (only if strict mode)
    if (strict) {
      for (const field of recommendedFields) {
        if (!workflowData[field.key]) {
          missingFields.push(field.label);
        }
      }
      
      // Check location (only in strict mode)
      if (!workflowData.region && !workflowData.city) {
        missingFields.push('Location (Местоположение)');
      }
    }

    return {
      isValid: missingFields.length === 0,
      missingFields,
      criticalMissing
    };
  }

  /**
   * Get workflow progress percentage
   */
  static getWorkflowProgress(workflowData: any): number {
    const totalSteps = 8; // vehicleType, sellerType, vehicleData, equipment, images, pricing, contact, location
    let completedSteps = 0;

    if (workflowData.vehicleType) completedSteps++;
    if (workflowData.sellerType) completedSteps++;
    if (workflowData.make && workflowData.model && workflowData.year) completedSteps++;
    if (workflowData.safety || workflowData.comfort || workflowData.infotainment || workflowData.extras) completedSteps++;
    if (workflowData.images) completedSteps++;
    if (workflowData.price) completedSteps++;
    if (workflowData.sellerName && workflowData.sellerEmail && workflowData.sellerPhone) completedSteps++;
    if (workflowData.region || workflowData.city) completedSteps++;

    return Math.round((completedSteps / totalSteps) * 100);
  }
}

export default SellWorkflowService;

