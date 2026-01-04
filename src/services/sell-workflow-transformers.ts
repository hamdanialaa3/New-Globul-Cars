// sell-workflow-transformers.ts - Data transformation utilities
// Split from sellWorkflowService.ts to comply with 300-line limit

import { CarListing } from '../types/CarListing';
import { BULGARIAN_CITIES } from '../constants/bulgarianCities';
import { logger } from './logger-service';
import { WorkflowData, EnhancedLocation } from './sell-workflow-types';

export class SellWorkflowTransformers {
  /**
   * Transform workflow data to structured car listing
   */
  static transformWorkflowData(
    workflowDataInput: WorkflowData,
    userId: string
  ): Partial<CarListing> {
    const workflowData = workflowDataInput as any;

    // Use REGION as primary location (not city!)
    const regionName = workflowData.region; // e.g., "Варна"
    const cityName = workflowData.locationData?.cityName; // e.g., "Аксаково"
    const postalCode = workflowData.postalCode;

    // Find region in BULGARIAN_CITIES
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
      logger.warn('Region not found in reference list', {
        region: regionName
      });
    }

    // Parse arrays from various formats
    const parseArray = (str: unknown): string[] => {
      if (!str) return [];
      if (Array.isArray(str)) return str.map(String);
      if (typeof str === 'number') return [String(str)];
      if (typeof str === 'string') {
        return str.split(',').map(s => s.trim()).filter(s => s);
      }
      return [];
    };

    // Get image URLs from workflow
    const imageUrls = parseArray(workflowData.images);

    // Boolean string conversions (for test compatibility)
    const parseBool = (val: any) => {
      if (typeof val === 'boolean') return val;
      if (typeof val === 'string') return val.toLowerCase() === 'true';
      return false;
    };

    // Parse safetyEquipment from safety string if not present
    let safetyEquipment = workflowData.safetyEquipment;
    if (!safetyEquipment && typeof workflowData.safety === 'string') {
      safetyEquipment = workflowData.safety.split(',').map((s: string) => s.trim()).filter(Boolean);
    }

    // ✅ FIX: Handle "Other" fields - use custom values if "__other__" is selected
    const finalMake = workflowData.make === '__other__'
      ? (workflowData.makeOther || workflowData.make || '')
      : (workflowData.make || '');

    const finalModel = workflowData.model === '__other__'
      ? (workflowData.modelOther || workflowData.model || '')
      : (workflowData.model || '');

    const finalFuelType = workflowData.fuelType === '__other__'
      ? (workflowData.fuelTypeOther || workflowData.fuelType || '')
      : (workflowData.fuelType || '');

    const finalColor = workflowData.color === '__other__' || workflowData.color === 'Other'
      ? (workflowData.colorOther || workflowData.exteriorColorOther || workflowData.color || '')
      : (workflowData.color || workflowData.exteriorColor || '');

    // Return structured car listing
    const result: any = {
      // Basic info
      make: finalMake,
      model: finalModel,
      // ✅ Save "Other" fields for reference and search
      makeOther: workflowData.make === '__other__' ? workflowData.makeOther : undefined,
      modelOther: workflowData.model === '__other__' ? workflowData.modelOther : undefined,
      variantOther: workflowData.variant === '__other__' ? workflowData.variantOther : undefined,
      fuelTypeOther: workflowData.fuelType === '__other__' ? workflowData.fuelTypeOther : undefined,
      colorOther: (workflowData.color === '__other__' || workflowData.color === 'Other')
        ? (workflowData.colorOther || workflowData.exteriorColorOther)
        : undefined,
      year: typeof workflowData.year === 'string' ? parseInt(workflowData.year) : workflowData.year,
      mileage: typeof workflowData.mileage === 'string' ? parseInt(workflowData.mileage) : workflowData.mileage,
      fuelType: finalFuelType,
      transmission: workflowData.transmission,
      color: finalColor,
      exteriorColor: finalColor,

      // Location
      locationData: regionData ? {
        cityId: regionData.id,
        cityName: regionData.nameBg,
        coordinates: {
          lat: regionData.lat,
          lng: regionData.lng
        }
      } : undefined,

      // Seller info
      sellerName: workflowData.sellerName,
      sellerEmail: workflowData.sellerEmail,
      sellerPhone: workflowData.sellerPhone,
      sellerId: userId,

      // Images
      images: imageUrls,
      imagesCount: imageUrls.length,

      // Pricing
      price: typeof workflowData.price === 'string' ? parseFloat(workflowData.price) : workflowData.price,

      // IDs
      numericId: workflowData.numericId,
      sellerNumericId: workflowData.sellerNumericId,

      // Equipment (Legacy + New Array Support)
      safety: workflowData.safety || {},
      safetyEquipment: safetyEquipment || [],

      comfort: workflowData.comfort || {},
      comfortEquipment: workflowData.comfortEquipment || [],

      infotainment: workflowData.infotainment || {},
      infotainmentEquipment: workflowData.infotainmentEquipment || [],

      extras: workflowData.extras || {},
      extrasEquipment: workflowData.extrasEquipment || [],

      // Description
      description: workflowData.description || workflowData.additionalInfo || '',

      // Metadata
      vehicleType: workflowData.vehicleType,
      sellerType: workflowData.sellerType,
      status: 'active',
      createdAt: new Date(),
      updatedAt: new Date(),
      // Boolean fields for test compatibility
      negotiable: parseBool(workflowData.negotiable),
      hasVideo: parseBool(workflowData.hasVideo),
      nonSmoker: parseBool(workflowData.nonSmoker),
      // Add region for test compatibility
      region: regionName
    };
    
    // ✅ CRITICAL FIX: Remove undefined fields to prevent Firestore errors
    // Firestore does not accept undefined values - they must be removed or set to null
    return this.removeUndefinedFields(result);
  }

  /**
   * Remove undefined fields from object (recursive for nested objects)
   * Firestore throws errors when trying to save undefined values
   */
  private static removeUndefinedFields(obj: any): any {
    if (obj === null || obj === undefined) {
      return null;
    }

    if (Array.isArray(obj)) {
      return obj.map(item => this.removeUndefinedFields(item));
    }

    if (typeof obj === 'object' && !(obj instanceof Date)) {
      const cleaned: any = {};
      for (const key in obj) {
        if (obj.hasOwnProperty(key)) {
          const value = obj[key];
          // Skip undefined values completely
          if (value !== undefined) {
            cleaned[key] = this.removeUndefinedFields(value);
          }
        }
      }
      return cleaned;
    }

    return obj;
  }

  /**
   * Transform car listing back to workflow data for editing
   */
  static transformCarListingToWorkflow(carListing: CarListing): WorkflowData {
    return {
      vehicleType: carListing.vehicleType,
      sellerType: carListing.sellerType,
      make: carListing.make,
      model: carListing.model,
      year: carListing.year,
      mileage: carListing.mileage,
      fuelType: carListing.fuelType,
      transmission: carListing.transmission,
      region: carListing.locationData?.cityName,
      locationData: {
        cityName: carListing.locationData?.cityName,
        cityId: carListing.locationData?.cityId
      },
      sellerName: carListing.sellerName,
      sellerEmail: carListing.sellerEmail,
      sellerPhone: carListing.sellerPhone,
      images: carListing.images,
      imagesCount: carListing.imagesCount,
      price: carListing.price,
      numericId: carListing.numericId,
      sellerNumericId: carListing.sellerNumericId,
      safety: carListing.safety,
      comfort: carListing.comfort,
      infotainment: carListing.infotainment,
      extras: carListing.extras,
      description: carListing.description || '',
      additionalInfo: carListing.description || ''
    };
  }

  /**
   * Sanitize workflow data for security
   */
  static sanitizeWorkflowData(data: WorkflowData): WorkflowData {
    const sanitizeString = (str: string) => str?.replace(/[<>]/g, '').trim();

    return {
      ...data,
      make: data.make ? sanitizeString(data.make) : data.make,
      model: data.model ? sanitizeString(data.model) : data.model,
      sellerName: data.sellerName ? sanitizeString(data.sellerName) : data.sellerName,
      sellerEmail: data.sellerEmail ? sanitizeString(data.sellerEmail) : data.sellerEmail,
      region: data.region ? sanitizeString(data.region) : data.region
    };
  }
}