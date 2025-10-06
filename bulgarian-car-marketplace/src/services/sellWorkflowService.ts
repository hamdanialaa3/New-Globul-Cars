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
import { db, storage } from '../firebase/firebase-config';
import { BULGARIAN_CITIES } from '../constants/bulgarianCities';
import { CarListing } from '../types/CarListing';

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
   * Transform workflow data to structured car listing
   */
  private static transformWorkflowData(
    workflowData: any,
    userId: string
  ): any {
    // Find city details
    const cityId = workflowData.region || workflowData.city;
    const cityData = BULGARIAN_CITIES.find(c => 
      c.id === cityId || 
      c.nameBg === cityId || 
      c.nameEn === cityId
    );

    // Parse arrays from comma-separated strings
    const parseArray = (str: string | undefined): string[] => {
      if (!str) return [];
      return str.split(',').map(s => s.trim()).filter(s => s);
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
      power: workflowData.power ? parseInt(workflowData.power) : undefined,
      engineSize: workflowData.engineSize ? parseFloat(workflowData.engineSize) : undefined,
      color: workflowData.color,
      description: workflowData.description || '',
      
      // ⭐ NEW: Vehicle Details
      numberOfSeats: workflowData.seats ? parseInt(workflowData.seats) : undefined,
      numberOfDoors: workflowData.doors ? parseInt(workflowData.doors) : undefined,
      condition: workflowData.condition || 'used',
      previousOwners: workflowData.previousOwners ? parseInt(workflowData.previousOwners) : undefined,
      
      // ⭐ NEW: Registration & Inspection
      firstRegistrationDate: workflowData.firstRegistration 
        ? new Date(workflowData.firstRegistration) 
        : undefined,
      inspectionValidUntil: workflowData.huValid 
        ? new Date(workflowData.huValid) 
        : undefined,
      
      // ⭐ NEW: Technical Details
      fuelTankVolume: workflowData.fuelTankVolume ? parseFloat(workflowData.fuelTankVolume) : undefined,
      cylinders: workflowData.cylinders ? parseInt(workflowData.cylinders) : undefined,
      driveType: workflowData.driveType || '',
      emissionSticker: workflowData.emissionSticker || '',
      emissionClass: workflowData.emissionClass || '',
      particulateFilter: workflowData.particulateFilter === 'true',
      weight: workflowData.weight ? parseFloat(workflowData.weight) : undefined,
      fuelConsumption: workflowData.fuelConsumption ? parseFloat(workflowData.fuelConsumption) : undefined,
      
      // ⭐ NEW: Colors
      interiorColor: workflowData.interiorColor || '',
      interiorMaterial: workflowData.interiorMaterial || '',
      
      // ⭐ NEW: Exterior Features
      trailerCoupling: workflowData.trailerCoupling === 'true',
      trailerLoadBraked: workflowData.trailerLoadBraked ? parseInt(workflowData.trailerLoadBraked) : undefined,
      trailerLoadUnbraked: workflowData.trailerLoadUnbraked ? parseInt(workflowData.trailerLoadUnbraked) : undefined,
      noseWeight: workflowData.noseWeight ? parseInt(workflowData.noseWeight) : undefined,
      cruiseControl: workflowData.cruiseControl || '',
      slidingDoor: workflowData.slidingDoor === 'true',
      
      // History
      accidentHistory: workflowData.hasAccidentHistory === 'true',
      serviceHistory: workflowData.hasServiceHistory === 'true',
      
      // Equipment Arrays
      safetyEquipment: parseArray(workflowData.safety),
      comfortEquipment: parseArray(workflowData.comfort),
      infotainmentEquipment: parseArray(workflowData.infotainment),
      extras: parseArray(workflowData.extras),
      
      // ⭐ NEW: Specific Equipment Arrays
      parkingSensors: parseArray(workflowData.parkingSensors),
      
      // ⭐ NEW: Specific Equipment Fields
      airbags: workflowData.airbags || '',
      airConditioning: workflowData.airConditioning || '',
      
      // Pricing
      price: parseFloat(workflowData.price || '0'),
      currency: workflowData.currency || 'EUR',
      priceType: workflowData.priceType || 'fixed',
      negotiable: workflowData.negotiable === 'true' || workflowData.negotiable === true,
      financing: workflowData.financing === 'true' || workflowData.financing === true,
      tradeIn: workflowData.tradeIn === 'true' || workflowData.tradeIn === true,
      warranty: workflowData.warranty === 'true' || workflowData.warranty === true,
      warrantyMonths: workflowData.warrantyMonths ? parseInt(workflowData.warrantyMonths) : undefined,
      paymentMethods: parseArray(workflowData.paymentMethods),
      additionalCosts: workflowData.additionalCosts,
      vatDeductible: workflowData.vatDeductible === 'true',
      
      // Seller Information
      sellerType: workflowData.sellerType || 'private',
      sellerName: workflowData.sellerName || '',
      sellerEmail: workflowData.sellerEmail || '',
      sellerPhone: workflowData.sellerPhone || '',
      sellerId: userId,  // ✅ Owner user ID
      preferredContact: parseArray(workflowData.preferredContact),
      availableHours: workflowData.availableHours,
      additionalInfo: workflowData.additionalInfo,
      
      // ⭐ NEW: Dealer Info
      dealerRating: workflowData.dealerRating ? parseFloat(workflowData.dealerRating) : undefined,
      
      // ⭐ NEW: Vehicle Status
      isDamaged: workflowData.isDamaged === 'true',
      isRoadworthy: workflowData.isRoadworthy !== 'false',
      nonSmoker: workflowData.nonSmoker === 'true',
      taxi: workflowData.taxi === 'true',
      
      // ⭐ NEW: Media
      hasVideo: workflowData.hasVideo === 'true',
      videoUrl: workflowData.videoUrl || '',
      
      // Location (both old and new structure for compatibility)
      city: cityData?.id || workflowData.city || '',
      region: workflowData.region || cityData?.nameBg || '',
      postalCode: workflowData.postalCode,
      location: workflowData.location,
      
      // Enhanced location structure (custom field)
      locationData: {
        cityId: cityData?.id || cityId || '',
        cityName: {
          en: cityData?.nameEn || workflowData.city || '',
          bg: cityData?.nameBg || workflowData.city || '',
          ar: cityData?.nameAr || ''
        },
        coordinates: cityData?.coordinates || { lat: 42.6977, lng: 23.3219 },
        region: workflowData.region,
        postalCode: workflowData.postalCode,
        address: workflowData.location
      },
      
      // System Fields
      status: 'active' as const,
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
    imageFiles: File[]
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
      console.log(`✅ Uploaded ${imageUrls.length} images for car ${carId}`);
      
      return imageUrls;
    } catch (error) {
      console.error('❌ Error uploading car images:', error);
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
      console.log('🚀 Starting car listing creation...');
      console.log('Workflow data:', workflowData);

      // Validate required fields
      if (!workflowData.make || !workflowData.model || !workflowData.year) {
        throw new Error('Missing required vehicle information');
      }
      if (!workflowData.price) {
        throw new Error('Missing price information');
      }
      if (!workflowData.sellerName || !workflowData.sellerEmail || !workflowData.sellerPhone) {
        throw new Error('Missing seller contact information');
      }
      if (!workflowData.region && !workflowData.city) {
        throw new Error('Missing location information');
      }

      // Transform workflow data to structured car listing
      const carData = this.transformWorkflowData(workflowData, userId);

      // Create the listing document
      const docRef = await addDoc(collection(db, this.collectionName), {
        ...carData,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        expiresAt: Timestamp.fromDate(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)) // 30 days
      });

      const carId = docRef.id;
      console.log(`✅ Car listing created with ID: ${carId}`);

      // Upload images if provided
      if (imageFiles && imageFiles.length > 0) {
        const imageUrls = await this.uploadCarImages(carId, imageFiles);
        
        // Update the listing with image URLs
        await updateDoc(doc(db, this.collectionName, carId), {
          images: imageUrls,
          updatedAt: serverTimestamp()
        });

        console.log(`✅ Images uploaded and linked to car ${carId}`);
      }

      // Clear cache for the city
      const { CityCarCountService } = await import('./cityCarCountService');
      if (carData.location?.cityId) {
        CityCarCountService.clearCacheForCity(carData.location.cityId);
      }

      console.log('🎉 Car listing creation completed successfully!');
      return carId;
    } catch (error) {
      console.error('❌ Error creating car listing:', error);
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

      console.log(`✅ Car listing ${carId} updated successfully`);
    } catch (error) {
      console.error('❌ Error updating car listing:', error);
      throw new Error('Failed to update car listing');
    }
  }

  /**
   * Validate workflow data completeness
   */
  static validateWorkflowData(workflowData: any): {
    isValid: boolean;
    missingFields: string[];
  } {
    const requiredFields = [
      { key: 'make', label: 'Make (Марка)' },
      { key: 'model', label: 'Model (Модел)' },
      { key: 'year', label: 'Year (Година)' },
      { key: 'price', label: 'Price (Цена)' },
      { key: 'sellerName', label: 'Seller Name (Име)' },
      { key: 'sellerEmail', label: 'Seller Email (Имейл)' },
      { key: 'sellerPhone', label: 'Seller Phone (Телефон)' }
    ];

    const missingFields: string[] = [];

    for (const field of requiredFields) {
      if (!workflowData[field.key]) {
        missingFields.push(field.label);
      }
    }

    // Check location
    if (!workflowData.region && !workflowData.city) {
      missingFields.push('Location (Местоположение)');
    }

    return {
      isValid: missingFields.length === 0,
      missingFields
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

