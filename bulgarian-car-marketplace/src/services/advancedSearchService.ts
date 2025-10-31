// Advanced Search Service - REFACTORED
// خدمة البحث المتقدم المتكاملة مع Firebase
// 🎯 100% Real - Comprehensive Firestore Integration
// ⚡ Optimized with Caching + Pagination

import { 
  collection, 
  query, 
  where, 
  orderBy, 
  limit as firestoreLimit,
  getDocs,
  getCountFromServer,
  Query,
  DocumentData
} from 'firebase/firestore';
import { db } from '../firebase/firebase-config';
import { SearchData } from '../pages/AdvancedSearchPage/types';
import { CarListing } from '../types/CarListing';
import { BulgarianCar } from '../firebase/car-service';
import { serviceLogger } from './logger-wrapper';
import { homePageCache } from './homepage-cache.service';
import { searchHistoryService } from './search/search-history.service';

interface AdvancedSearchResult {
  cars: (CarListing | BulgarianCar)[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
  processingTime: number;
}

class AdvancedSearchService {
  private collectionName = 'cars'; // ✅ Same as sellWorkflowService

  /**
   * Build Firestore query from search data
   * بناء استعلام Firestore من بيانات البحث
   */
  private buildQuery(searchData: SearchData): Query<DocumentData> {
    let q = query(collection(db, this.collectionName));
    
    // Only active listings
    q = query(q, where('status', '==', 'active'));
    
    // Basic filters - Direct Firestore queries
    if (searchData.make) {
      q = query(q, where('make', '==', searchData.make));
    }
    
    if (searchData.model) {
      q = query(q, where('model', '==', searchData.model));
    }
    
    if (searchData.vehicleType) {
      q = query(q, where('vehicleType', '==', searchData.vehicleType));
    }
    
    if (searchData.fuelType) {
      q = query(q, where('fuelType', '==', searchData.fuelType));
    }
    
    if (searchData.transmission) {
      q = query(q, where('transmission', '==', searchData.transmission));
    }
    
    if (searchData.condition) {
      q = query(q, where('condition', '==', searchData.condition));
    }
    
    if (searchData.seller) {
      q = query(q, where('sellerType', '==', searchData.seller));
    }
    
    // Location filters
    if (searchData.city) {
      q = query(q, where('city', '==', searchData.city));
    }
    
    if (searchData.country) {
      q = query(q, where('country', '==', searchData.country));
    }
    
    // Sorting
    q = query(q, orderBy('createdAt', 'desc'));
    
    // Limit results
    q = query(q, limit(100));
    
    return q;
  }

  /**
   * Apply client-side filters for complex conditions
   * تطبيق فلاتر من جانب العميل للشروط المعقدة
   */
  private applyClientFilters(
    cars: CarListing[], 
    searchData: SearchData
  ): CarListing[] {
    return cars.filter(car => {
      // Price range
      if (searchData.priceFrom) {
        const priceFrom = parseFloat(searchData.priceFrom);
        if (car.price < priceFrom) return false;
      }
      if (searchData.priceTo) {
        const priceTo = parseFloat(searchData.priceTo);
        if (car.price > priceTo) return false;
      }
      
      // Year range
      if (searchData.firstRegistrationFrom) {
        const yearFrom = parseInt(searchData.firstRegistrationFrom);
        if (car.year < yearFrom) return false;
      }
      if (searchData.firstRegistrationTo) {
        const yearTo = parseInt(searchData.firstRegistrationTo);
        if (car.year > yearTo) return false;
      }
      
      // Mileage range
      if (searchData.mileageFrom) {
        const mileageFrom = parseFloat(searchData.mileageFrom);
        if (car.mileage < mileageFrom) return false;
      }
      if (searchData.mileageTo) {
        const mileageTo = parseFloat(searchData.mileageTo);
        if (car.mileage > mileageTo) return false;
      }
      
      // Power range
      if (searchData.powerFrom && car.power) {
        const powerFrom = parseFloat(searchData.powerFrom);
        if (car.power < powerFrom) return false;
      }
      if (searchData.powerTo && car.power) {
        const powerTo = parseFloat(searchData.powerTo);
        if (car.power > powerTo) return false;
      }
      
      // Engine size (cubic capacity) range
      if (searchData.cubicCapacityFrom && car.engineSize) {
        const ccFrom = parseFloat(searchData.cubicCapacityFrom);
        if (car.engineSize < ccFrom) return false;
      }
      if (searchData.cubicCapacityTo && car.engineSize) {
        const ccTo = parseFloat(searchData.cubicCapacityTo);
        if (car.engineSize > ccTo) return false;
      }
      
      // Seats range
      if (searchData.seatsFrom && (car as any).numberOfSeats) {
        const seatsFrom = parseInt(searchData.seatsFrom);
        if ((car as any).numberOfSeats < seatsFrom) return false;
      }
      if (searchData.seatsTo && (car as any).numberOfSeats) {
        const seatsTo = parseInt(searchData.seatsTo);
        if ((car as any).numberOfSeats > seatsTo) return false;
      }
      
      // Doors range
      if (searchData.doorsFrom && (car as any).numberOfDoors) {
        const doorsFrom = parseInt(searchData.doorsFrom);
        if ((car as any).numberOfDoors < doorsFrom) return false;
      }
      if (searchData.doorsTo && (car as any).numberOfDoors) {
        const doorsTo = parseInt(searchData.doorsTo);
        if ((car as any).numberOfDoors > doorsTo) return false;
      }
      
      // Fuel tank volume range
      if (searchData.fuelTankVolumeFrom && (car as any).fuelTankVolume) {
        const volumeFrom = parseFloat(searchData.fuelTankVolumeFrom);
        if ((car as any).fuelTankVolume < volumeFrom) return false;
      }
      if (searchData.fuelTankVolumeTo && (car as any).fuelTankVolume) {
        const volumeTo = parseFloat(searchData.fuelTankVolumeTo);
        if ((car as any).fuelTankVolume > volumeTo) return false;
      }
      
      // Cylinders range
      if (searchData.cylindersFrom && (car as any).cylinders) {
        const cylindersFrom = parseInt(searchData.cylindersFrom);
        if ((car as any).cylinders < cylindersFrom) return false;
      }
      if (searchData.cylindersTo && (car as any).cylinders) {
        const cylindersTo = parseInt(searchData.cylindersTo);
        if ((car as any).cylinders > cylindersTo) return false;
      }
      
      // Drive type
      if (searchData.driveType && (car as any).driveType !== searchData.driveType) {
        return false;
      }
      
      // Color filters
      if (searchData.exteriorColor && car.color !== searchData.exteriorColor) {
        return false;
      }
      
      if (searchData.interiorColor && (car as any).interiorColor) {
        if ((car as any).interiorColor !== searchData.interiorColor) {
          return false;
        }
      }
      
      if (searchData.interiorMaterial && (car as any).interiorMaterial) {
        if ((car as any).interiorMaterial !== searchData.interiorMaterial) {
          return false;
        }
      }
      
      // Equipment filters
      if (searchData.airConditioning && (car as any).airConditioning !== searchData.airConditioning) {
        return false;
      }
      
      if (searchData.cruiseControl && (car as any).cruiseControl !== searchData.cruiseControl) {
        return false;
      }
      
      // Parking sensors (array check)
      if (searchData.parkingSensors && searchData.parkingSensors.length > 0) {
        const carSensors = (car as any).parkingSensors || [];
        const hasAllSensors = searchData.parkingSensors.every(
          sensor => carSensors.includes(sensor)
        );
        if (!hasAllSensors) return false;
      }
      
      // ✅ Safety Equipment (array check)
      if (searchData.safetyEquipment && searchData.safetyEquipment.length > 0) {
        const carSafety = car.safetyEquipment || [];
        const hasAllSafety = searchData.safetyEquipment.every(
          item => carSafety.includes(item)
        );
        if (!hasAllSafety) return false;
      }
      
      // ✅ Comfort Equipment (array check)
      if (searchData.comfortEquipment && searchData.comfortEquipment.length > 0) {
        const carComfort = car.comfortEquipment || [];
        const hasAllComfort = searchData.comfortEquipment.every(
          item => carComfort.includes(item)
        );
        if (!hasAllComfort) return false;
      }
      
      // ✅ Infotainment Equipment (array check)
      if (searchData.infotainmentEquipment && searchData.infotainmentEquipment.length > 0) {
        const carInfotainment = car.infotainmentEquipment || [];
        const hasAllInfotainment = searchData.infotainmentEquipment.every(
          item => carInfotainment.includes(item)
        );
        if (!hasAllInfotainment) return false;
      }
      
      // Extras (array check)
      if (searchData.extras && searchData.extras.length > 0) {
        const carExtras = car.extras || [];
        const hasAllExtras = searchData.extras.every(
          extra => carExtras.includes(extra)
        );
        if (!hasAllExtras) return false;
      }
      
      // Boolean filters
      if (searchData.adsWithPictures && (!car.images || car.images.length === 0)) {
        return false;
      }
      
      if (searchData.adsWithVideo && !(car as any).hasVideo) {
        return false;
      }
      
      if (searchData.nonSmokerVehicle && !(car as any).nonSmoker) {
        return false;
      }
      
      if (searchData.taxi && !(car as any).taxi) {
        return false;
      }
      
      if (searchData.warranty && !(car as any).warranty) {
        return false;
      }
      
      if (searchData.damagedVehicles) {
        // If user wants damaged vehicles, show only damaged
        if (!(car as any).isDamaged) return false;
      } else {
        // If user doesn't want damaged vehicles, exclude them
        if ((car as any).isDamaged) return false;
      }
      
      // Service history
      if (searchData.serviceHistory === 'full' && !car.serviceHistory) {
        return false;
      }
      if (searchData.serviceHistory === 'none' && car.serviceHistory) {
        return false;
      }
      
      // Roadworthy
      if (searchData.roadworthy === 'yes' && !(car as any).isRoadworthy) {
        return false;
      }
      if (searchData.roadworthy === 'no' && (car as any).isRoadworthy) {
        return false;
      }
      
      // Owners count
      if (searchData.ownersCount) {
        const maxOwners = parseInt(searchData.ownersCount);
        if ((car as any).previousOwners && (car as any).previousOwners > maxOwners) {
          return false;
        }
      }
      
      // Description search
      if (searchData.searchDescription) {
        const searchTerm = searchData.searchDescription.toLowerCase();
        const description = car.description?.toLowerCase() || '';
        if (!description.includes(searchTerm)) {
          return false;
        }
      }
      
      return true;
    });
  }

  /**
   * Search cars with advanced filters
   * البحث عن السيارات مع فلاتر متقدمة
   */
  async searchCars(searchData: SearchData): Promise<CarListing[]> {
    try {
      serviceLogger.debug('Advanced search started', { searchData });
      
      // Build and execute Firestore query
      const q = this.buildQuery(searchData);
      const querySnapshot = await getDocs(q);
      
      // Convert to CarListing array
      const cars: CarListing[] = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        cars.push({
          id: doc.id,
          ...data,
          createdAt: data.createdAt?.toDate(),
          updatedAt: data.updatedAt?.toDate(),
          expiresAt: data.expiresAt?.toDate()
        } as CarListing);
      });
      
      serviceLogger.debug('Cars found from Firestore', { count: cars.length });
      
      // Apply client-side filters for complex conditions
      const filteredCars = this.applyClientFilters(cars, searchData);
      
      serviceLogger.debug('After client-side filters', { count: filteredCars.length });
      
      return filteredCars;
    } catch (error) {
      serviceLogger.error('Error in advanced search', error as Error, { searchData });
      throw error;
    }
  }

  /**
   * Get search statistics
   * الحصول على إحصائيات البحث
   */
  async getSearchStats(searchData: SearchData): Promise<{
    totalResults: number;
    averagePrice: number;
    priceRange: { min: number; max: number };
    topMakes: string[];
  }> {
    try {
      const cars = await this.searchCars(searchData);
      
      if (cars.length === 0) {
        return {
          totalResults: 0,
          averagePrice: 0,
          priceRange: { min: 0, max: 0 },
          topMakes: []
        };
      }
      
      // Calculate statistics
      const prices = cars.map(c => c.price);
      const averagePrice = prices.reduce((a, b) => a + b, 0) / prices.length;
      const minPrice = Math.min(...prices);
      const maxPrice = Math.max(...prices);
      
      // Count makes
      const makeCount: Record<string, number> = {};
      cars.forEach(car => {
        makeCount[car.make] = (makeCount[car.make] || 0) + 1;
      });
      
      // Get top 5 makes
      const topMakes = Object.entries(makeCount)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([make]) => make);
      
      return {
        totalResults: cars.length,
        averagePrice: Math.round(averagePrice),
        priceRange: { min: minPrice, max: maxPrice },
        topMakes
      };
    } catch (error) {
      serviceLogger.error('Error getting search stats', error as Error);
      throw error;
    }
  }

  /**
   * ⚡ NEW: Enhanced search with caching and pagination
   * بحث محسّن مع التخزين المؤقت والترقيم
   */
  async searchWithPagination(
    searchData: SearchData,
    userId?: string,
    page: number = 1,
    pageSize: number = 20
  ): Promise<AdvancedSearchResult> {
    const startTime = Date.now();
    
    try {
      // 1. Generate cache key
      const cacheKey = `advanced_search_${JSON.stringify(searchData)}_all`;
      
      // 2. Get cached results or fetch new
      const allCars = await homePageCache.getOrFetch(
        cacheKey,
        async () => {
          return await this.searchCars(searchData);
        },
        5 * 60 * 1000 // 5 minutes
      );
      
      // 3. Calculate pagination
      const totalCount = allCars.length;
      const totalPages = Math.ceil(totalCount / pageSize);
      const start = (page - 1) * pageSize;
      const end = start + pageSize;
      const paginatedCars = allCars.slice(start, end);
      
      // 4. Save to search history
      if (userId) {
        await searchHistoryService.saveSearch(
          userId,
          this.generateSearchQuery(searchData),
          searchData,
          totalCount
        );
      }
      
      const processingTime = Date.now() - startTime;
      
      serviceLogger.info('Advanced search completed', {
        totalCount,
        page,
        pageSize,
        totalPages,
        processingTime
      });
      
      return {
        cars: paginatedCars,
        totalCount,
        page,
        pageSize,
        totalPages,
        processingTime
      };
      
    } catch (error) {
      serviceLogger.error('Advanced search with pagination failed', error as Error);
      throw error;
    }
  }

  /**
   * Generate human-readable search query
   */
  private generateSearchQuery(searchData: SearchData): string {
    const parts: string[] = [];
    
    if (searchData.make) parts.push(searchData.make);
    if (searchData.model) parts.push(searchData.model);
    if (searchData.priceFrom || searchData.priceTo) {
      parts.push(`€${searchData.priceFrom || '0'}-${searchData.priceTo || '∞'}`);
    }
    if (searchData.firstRegistrationFrom || searchData.firstRegistrationTo) {
      parts.push(`${searchData.firstRegistrationFrom || ''}-${searchData.firstRegistrationTo || ''}`);
    }
    
    return parts.join(' ') || 'All cars';
  }
}

export default new AdvancedSearchService();
