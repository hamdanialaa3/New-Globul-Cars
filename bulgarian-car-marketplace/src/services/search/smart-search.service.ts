import { logger } from '../logger-service';
// Smart Search Service - Intelligent Keyword-Based Search
// خدمة البحث الذكي - بحث ذكي بالكلمات المفتاحية
// 🎯 100% Real - Connected to Firestore

import {
  collection,
  query,
  where,
  orderBy,
  limit as firestoreLimit,
  getDocs,
  Query,
  DocumentData,
  Timestamp
} from 'firebase/firestore';
import { db } from '../../firebase/firebase-config';
import { CarListing } from '../../types/CarListing';
import { UnifiedCar } from '../car/unified-car.service';
import { serviceLogger } from '../logger-wrapper';
import { homePageCache, CACHE_KEYS } from '../homepage-cache.service';
import { searchHistoryService } from './search-history.service';
import { searchPersonalizationService } from './search-personalization.service';

interface SmartSearchResult {
  cars: (CarListing | UnifiedCar)[];
  totalCount: number;
  processingTime: number;
  isPersonalized: boolean;
}

interface ParsedKeywords {
  brands: string[];
  models: string[];
  years: number[];
  priceRange: { min?: number; max?: number };
  fuelTypes: string[];
  keywords: string[];
}

class SmartSearchService {
  private collectionName = 'cars';

  /**
   * Main search function - Smart keyword-based search
   * البحث الرئيسي - بحث ذكي بالكلمات المفتاحية
   */
  async search(
    keywords: string,
    userId?: string,
    page: number = 1,
    pageSize: number = 20
  ): Promise<SmartSearchResult> {
    const startTime = Date.now();
    
    try {
      // 🔍 ALWAYS LOG: Search start
      console.log('🚀 Smart Search Started:', { keywords, userId, page, pageSize });
      
      // 1. Parse keywords intelligently
      const parsed = this.parseKeywords(keywords);
      console.log('📊 Parsed keywords:', parsed);
      
      // 2. Check cache first
      const cacheKey = `smart_search_${keywords}_${userId || 'guest'}_${page}`;
      const cached = await homePageCache.getOrFetch(
        cacheKey,
        async () => {
          // 3. Execute Firestore query
          const results = await this.executeSearch(parsed, pageSize * page);
          return results;
        },
        3 * 60 * 1000 // 3 minutes cache
      );
      
      // 4. Apply personalization if user logged in
      let rankedCars = cached;
      let isPersonalized = false;
      
      if (userId) {
        rankedCars = await searchPersonalizationService.personalizeResults(
          cached,
          userId
        );
        isPersonalized = true;
      }
      
      // 5. Apply pagination
      const start = (page - 1) * pageSize;
      const end = start + pageSize;
      const paginatedCars = rankedCars.slice(start, end);
      
      // 6. Save to search history
      if (userId && keywords.trim()) {
        await searchHistoryService.saveSearch(userId, keywords, parsed);
      }
      
      const processingTime = Date.now() - startTime;
      
      // 🔍 ALWAYS LOG: Final results
      console.log('✅ Smart Search Completed:', {
        keywords,
        resultsCount: paginatedCars.length,
        totalCount: rankedCars.length,
        processingTime: processingTime + 'ms',
        isPersonalized
      });
      
      serviceLogger.info('Smart search completed', {
        keywords,
        resultsCount: paginatedCars.length,
        totalCount: rankedCars.length,
        processingTime,
        isPersonalized
      });
      
      return {
        cars: paginatedCars,
        totalCount: rankedCars.length,
        processingTime,
        isPersonalized
      };
      
    } catch (error) {
      console.error('❌ Smart Search Failed:', error);
      serviceLogger.error('Smart search failed', error as Error);
      throw error;
    }
  }

  /**
   * Parse keywords intelligently
   * تحليل الكلمات المفتاحية بذكاء
   */
  private parseKeywords(keywords: string): ParsedKeywords {
    const lower = keywords.toLowerCase().trim();
    const words = lower.split(/\s+/);
    
    const parsed: ParsedKeywords = {
      brands: [],
      models: [],
      years: [],
      priceRange: {},
      fuelTypes: [],
      keywords: words
    };
    
    // Detect brands (ALL car brands)
    // ⚡ COMPLETE LIST - All major car brands
    const knownBrands = [
      // German brands
      'bmw', 'mercedes', 'benz', 'mercedes-benz', 'audi', 'vw', 'volkswagen', 'porsche', 'opel', 'smart',
      // American brands
      'ford', 'chevrolet', 'gmc', 'jeep', 'dodge', 'chrysler', 'cadillac', 'lincoln', 'buick', 'hummer', 'tesla',
      // Japanese brands
      'toyota', 'honda', 'mazda', 'nissan', 'subaru', 'mitsubishi', 'suzuki', 'lexus', 'infiniti', 'acura',
      // Korean brands
      'hyundai', 'kia', 'genesis', 'ssangyong',
      // European brands
      'skoda', 'seat', 'renault', 'peugeot', 'citroen', 'fiat', 'alfa', 'romeo', 'alfa romeo', 'lancia',
      'volvo', 'saab', 'dacia', 'mini', 'land', 'rover', 'range', 'jaguar', 'bentley', 'rolls', 'royce',
      // Italian/Luxury
      'ferrari', 'lamborghini', 'maserati', 'aston', 'martin', 'bugatti', 'mclaren',
      // Chinese brands
      'geely', 'byd', 'mg', 'great', 'wall', 'chery', 'haval',
      // Others
      'lada', 'uaz', 'gaz', 'zaz', 'moskvich'
    ];
    
    words.forEach(word => {
      if (knownBrands.includes(word)) {
        // ⚡ SMART: Proper brand name capitalization
        const brandMap: Record<string, string> = {
          'bmw': 'BMW',
          'gmc': 'GMC',
          'vw': 'VW',
          'mg': 'MG',
          'uaz': 'UAZ',
          'gaz': 'GAZ',
          'zaz': 'ZAZ',
          'byd': 'BYD',
          'suv': 'SUV',
          'usa': 'USA',
          'ford': 'Ford',
          'audi': 'Audi',
          'toyota': 'Toyota',
          'honda': 'Honda',
          'mercedes': 'Mercedes',
          'nissan': 'Nissan',
          'hyundai': 'Hyundai',
          'kia': 'Kia',
          'mazda': 'Mazda',
          'volkswagen': 'Volkswagen',
          'chevrolet': 'Chevrolet',
          'jeep': 'Jeep',
          'tesla': 'Tesla',
          'volvo': 'Volvo',
          'lexus': 'Lexus',
          'subaru': 'Subaru',
          'porsche': 'Porsche',
          'land': 'Land',
          'rover': 'Rover',
          'range': 'Range',
          'jaguar': 'Jaguar'
        };
        
        // Use mapped name if exists, otherwise capitalize first letter
        const brandName = brandMap[word] || word.charAt(0).toUpperCase() + word.slice(1);
        // ⚡ FIX: Don't add to brands array - we'll use keywords for flexible matching
        // parsed.brands.push(brandName);
        // Instead, mark this word as a brand for later use
        if (!parsed.keywords.includes(word)) {
          parsed.keywords.push(word);
        }
      }
      
      // Detect years (2000-2025)
      const year = parseInt(word);
      if (year >= 2000 && year <= 2025) {
        parsed.years.push(year);
      }
      
      // Detect price (e.g., "5000", "5k", "10000")
      if (word.match(/^\d+k?$/)) {
        const price = word.endsWith('k') 
          ? parseInt(word.slice(0, -1)) * 1000 
          : parseInt(word);
        if (!parsed.priceRange.max || price > parsed.priceRange.max) {
          parsed.priceRange.max = price;
        }
      }
      
      // Detect fuel types
      const fuelMap: Record<string, string> = {
        'petrol': 'Petrol',
        'diesel': 'Diesel',
        'electric': 'Electric',
        'hybrid': 'Hybrid',
        'газ': 'LPG',
        'lpg': 'LPG',
        'бензин': 'Petrol',
        'дизел': 'Diesel'
      };
      
      if (fuelMap[word]) {
        parsed.fuelTypes.push(fuelMap[word]);
      }
    });
    
    return parsed;
  }

  /**
   * Execute Firestore search query
   * تنفيذ استعلام البحث في Firestore
   * ⚡ ENHANCED: Search across ALL 7 collections
   */
  private async executeSearch(
    parsed: ParsedKeywords,
    limitCount: number = 100
  ): Promise<(CarListing | UnifiedCar)[]> {
    try {
      const isDebug = typeof window !== 'undefined' && localStorage.getItem('DEBUG_SEARCH') === 'true';
      
      // 🔍 ALWAYS LOG: Search parameters
      console.log('🔍 Smart Search - Executing with params:', {
        brands: parsed.brands,
        fuelTypes: parsed.fuelTypes,
        years: parsed.years,
        priceRange: parsed.priceRange,
        keywords: parsed.keywords
      });
      console.log('⚠️ NOTE: Brand filtering moved to client-side for case-insensitive matching');
      
      // ⚡ CRITICAL FIX: Search across ALL vehicle type collections
      const collections = [
        'cars',             // Legacy collection
        'passenger_cars',   // Personal cars
        'suvs',             // SUVs/Jeeps
        'vans',             // Vans/Cargo
        'motorcycles',      // Motorcycles
        'trucks',           // Trucks
        'buses'             // Buses
      ];
      
      console.log('🔍 Searching across', collections.length, 'collections:', collections);
      
      const allCars: (CarListing | UnifiedCar)[] = [];
      
      // Query each collection in parallel
      const queryPromises = collections.map(async (collectionName) => {
        try {
          console.log(`🔎 Querying collection: ${collectionName}...`);
          
          let q: Query<DocumentData> = query(collection(db, collectionName));
          
          // Filter by status (active only)
          q = query(q, where('status', '==', 'active'));
          
          // ⚡ REMOVED: Brand filter from Firestore (will use client-side for case-insensitive)
          // Reason: Firestore 'in' query is case-sensitive, won't match 'ford' vs 'Ford' vs 'FORD'
          
          // Apply fuel type filter if detected
          if (parsed.fuelTypes.length > 0) {
            const fuelTypes = parsed.fuelTypes.slice(0, 10);
            console.log(`  ⛽ [${collectionName}] Applying fuel filter:`, fuelTypes);
            q = query(q, where('fuelType', 'in', fuelTypes));
          }
          
          // Order by creation date (newest first)
          q = query(q, orderBy('createdAt', 'desc'));
          
          // Limit results per collection
          q = query(q, firestoreLimit(Math.ceil(limitCount / collections.length)));
          
          // Execute query
          const snapshot = await getDocs(q);
          const cars = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          })) as (CarListing | UnifiedCar)[];
          
          console.log(`  ✅ [${collectionName}] Found ${cars.length} cars`);
          if (cars.length > 0) {
            console.log(`  📋 [${collectionName}] Sample:`, {
              make: cars[0].make,
              model: cars[0].model,
              status: cars[0].status,
              fuelType: (cars[0] as any).fuelType
            });
          }
          
          return cars;
        } catch (error) {
          console.error(`  ❌ [${collectionName}] Query failed:`, error);
          return [];
        }
      });
      
      // Wait for all queries to complete
      const results = await Promise.all(queryPromises);
      results.forEach(cars => allCars.push(...cars));
      
      // 🔍 ALWAYS LOG: Firestore results
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log('✅ Smart Search - Firestore returned:', allCars.length, 'total cars from all collections');
      console.log('📦 Collections results:', collections.map((col, i) => `${col}: ${results[i].length}`).join(', '));
      
      if (allCars.length > 0) {
        console.log('📋 First 3 cars from Firestore:');
        allCars.slice(0, 3).forEach((car, i) => {
          console.log(`  [${i}] ${car.make} ${car.model} (${car.year}) - Status: ${car.status} - Price: ${car.price}`);
        });
      } else {
        console.warn('⚠️ NO CARS FOUND in any collection!');
        console.warn('🔍 Search params were:', parsed);
        console.warn('📦 Collections searched:', collections);
        console.warn('💡 Possible reasons:');
        console.warn('   1. No cars with status="active"');
        console.warn('   2. Fuel type filter too restrictive');
        console.warn('   3. Firestore rules blocking read');
      }
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      
      // ⚡ NEW: Apply client-side filters (ranges, text search, make/model matching)
      const beforeFilter = allCars.length;
      const filteredCars = this.applyClientSideFilters(allCars, parsed);
      console.log('🎯 Smart Search - After client-side filtering:', filteredCars.length, 'cars (removed:', beforeFilter - filteredCars.length, ')');
      
      return filteredCars;
      
    } catch (error) {
      serviceLogger.error('Firestore search failed', error as Error);
      return [];
    }
  }

  /**
   * Apply client-side filters for complex conditions
   * تطبيق فلاتر من جانب العميل للشروط المعقدة
   * ⚡ ENHANCED: Now supports FULL text search in make/model/description
   */
  private applyClientSideFilters(
    cars: (CarListing | UnifiedCar)[],
    parsed: ParsedKeywords
  ): (CarListing | UnifiedCar)[] {
    console.log('🎯 Client-side filtering started with', cars.length, 'cars');
    console.log('📋 Keywords to match:', parsed.keywords);
    
    const filtered = cars.filter(car => {
      // Year filter
      if (parsed.years.length > 0) {
        const carYear = car.year || 0;
        if (!parsed.years.includes(carYear)) {
          return false;
        }
      }
      
      // Price range filter
      if (parsed.priceRange.min && car.price < parsed.priceRange.min) {
        return false;
      }
      if (parsed.priceRange.max && car.price > parsed.priceRange.max) {
        return false;
      }
      
      // ⚡ ENHANCED: Case-insensitive keyword matching
      if (parsed.keywords.length > 0) {
        const carMake = (car.make || '').toLowerCase();
        const carModel = (car.model || '').toLowerCase();
        const carDescription = ((car as any).description || '').toLowerCase();
        const carFuelType = (car.fuelType || '').toLowerCase();
        const carTrim = ((car as any).trim || '').toLowerCase();
        const carCategory = ((car as any).category || '').toLowerCase();
        
        const searchText = `${carMake} ${carModel} ${carDescription} ${carFuelType} ${carTrim} ${carCategory}`;
        
        // ⚡ SMART: Match if ANY keyword is found (OR logic, case-insensitive)
        const hasMatch = parsed.keywords.some(keyword => {
          const lowerKeyword = keyword.toLowerCase();
          const matched = searchText.includes(lowerKeyword);
          
          // 🔍 ALWAYS LOG: First 3 cars for debugging
          if (cars.indexOf(car) < 3) {
            console.log(`🔍 [Car ${cars.indexOf(car)}] ${carMake} ${carModel}:`, {
              keyword: lowerKeyword,
              matched: matched,
              make: car.make,
              model: car.model,
              status: car.status
            });
          }
          
          return matched;
        });
        
        if (!hasMatch) {
          return false;
        }
      }
      
      return true;
    });
    
    console.log('✅ After client-side filtering:', filtered.length, 'cars matched');
    if (filtered.length > 0) {
      console.log('📋 Sample matched car:', {
        make: filtered[0].make,
        model: filtered[0].model,
        year: filtered[0].year
      });
    }
    
    return filtered;
  }

  /**
   * Get search suggestions based on partial input
   * الحصول على اقتراحات البحث بناءً على الإدخال الجزئي
   */
  async getSuggestions(
    partial: string,
    userId?: string,
    limit: number = 10
  ): Promise<string[]> {
    try {
      const suggestions: Set<string> = new Set();
      
      // 1. Get user's recent searches (if logged in)
      if (userId) {
        const recentSearches = await searchHistoryService.getRecentSearches(userId, 5);
        recentSearches
          .filter(s => s.query.toLowerCase().includes(partial.toLowerCase()))
          .forEach(s => suggestions.add(s.query));
      }
      
      // 2. Get popular searches
      const popularSearches = await searchHistoryService.getPopularSearches(limit);
      popularSearches
        .filter(s => s.toLowerCase().includes(partial.toLowerCase()))
        .forEach(s => suggestions.add(s));
      
      // 3. Get brand/model suggestions from Firestore
      const parsed = this.parseKeywords(partial);
      if (parsed.brands.length === 0 && partial.length >= 2) {
        // Suggest brands
        const brands = await this.getBrandSuggestions(partial);
        brands.forEach(b => suggestions.add(b));
      }
      
      return Array.from(suggestions).slice(0, limit);
      
    } catch (error) {
      serviceLogger.error('Failed to get suggestions', error as Error);
      return [];
    }
  }

  /**
   * Get brand suggestions from Firestore
   */
  private async getBrandSuggestions(partial: string): Promise<string[]> {
    try {
      const cacheKey = `brand_suggestions_${partial}`;
      
      return await homePageCache.getOrFetch(
        cacheKey,
        async () => {
          // Get all unique makes from Firestore
          const snapshot = await getDocs(
            query(
              collection(db, this.collectionName),
              firestoreLimit(100)
            )
          );
          
          const makes = new Set<string>();
          snapshot.docs.forEach(doc => {
            const make = doc.data().make;
            if (make && make.toLowerCase().includes(partial.toLowerCase())) {
              makes.add(make);
            }
          });
          
          return Array.from(makes);
        },
        10 * 60 * 1000 // 10 minutes
      );
      
    } catch (error) {
      return [];
    }
  }

  /**
   * Quick search - simplified for homepage
   * بحث سريع - مبسط للصفحة الرئيسية
   */
  async quickSearch(
    keywords: string,
    limit: number = 6
  ): Promise<(CarListing | UnifiedCar)[]> {
    const result = await this.search(keywords, undefined, 1, limit);
    return result.cars;
  }
}

export const smartSearchService = new SmartSearchService();
export default smartSearchService;

