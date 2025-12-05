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
import { db } from '@globul-cars/services/firebase/firebase-config';
import { CarListing } from '@globul-cars/core/typesCarListing';
import { BulgarianCar } from '@globul-cars/services/firebase/car-service';
import { serviceLogger } from '../logger-wrapper';
import { homePageCache, CACHE_KEYS } from '../homepage-cache.service';
import { searchHistoryService } from './search-history.service';
import { searchPersonalizationService } from './search-personalization.service';

interface SmartSearchResult {
  cars: (CarListing | BulgarianCar)[];
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
      // 🔍 DEBUG: Log search start
      const isDebug = typeof window !== 'undefined' && localStorage.getItem('DEBUG_SEARCH') === 'true';
      if (isDebug) console.log('🔍 Smart search started:', keywords);
      
      // 1. Parse keywords intelligently
      const parsed = this.parseKeywords(keywords);
      if (isDebug) console.log('📊 Parsed keywords:', parsed);
      
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
          'usa': 'USA'
        };
        
        // Use mapped name if exists, otherwise capitalize first letter
        const brandName = brandMap[word] || word.charAt(0).toUpperCase() + word.slice(1);
        parsed.brands.push(brandName);
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
   */
  private async executeSearch(
    parsed: ParsedKeywords,
    limitCount: number = 100
  ): Promise<(CarListing | BulgarianCar)[]> {
    try {
      const isDebug = typeof window !== 'undefined' && localStorage.getItem('DEBUG_SEARCH') === 'true';
      
      let q: Query<DocumentData> = query(collection(db, this.collectionName));
      
      // Filter by status (active only)
      q = query(q, where('status', '==', 'active'));
      
      // ⚡ SMART FIX: Apply brand filter if detected
      if (parsed.brands.length > 0) {
        // Firestore 'in' query supports up to 10 values
        const brands = parsed.brands.slice(0, 10);
        q = query(q, where('make', 'in', brands));
      }
      
      // Apply fuel type filter if detected
      if (parsed.fuelTypes.length > 0) {
        const fuelTypes = parsed.fuelTypes.slice(0, 10);
        q = query(q, where('fuelType', 'in', fuelTypes));
      }
      
      // Order by creation date (newest first)
      q = query(q, orderBy('createdAt', 'desc'));
      
      // Limit results
      q = query(q, firestoreLimit(limitCount));
      
      // Execute query
      const snapshot = await getDocs(q);
      let cars = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as (CarListing | BulgarianCar)[];
      
      // 🔍 DEBUG: Log Firestore results
      if (isDebug) console.log('🔥 Firestore results:', cars.length, 'cars');
      
      // ⚡ NEW: Apply client-side filters (ranges, text search, make/model matching)
      const beforeFilter = cars.length;
      cars = this.applyClientSideFilters(cars, parsed);
      if (isDebug) console.log('✅ After filtering:', cars.length, 'cars (filtered:', beforeFilter - cars.length, ')');
      
      return cars;
      
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
    cars: (CarListing | BulgarianCar)[],
    parsed: ParsedKeywords
  ): (CarListing | BulgarianCar)[] {
    return cars.filter(car => {
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
      
      // ⚡ ENHANCED: Keyword matching (in make, model, description)
      // This catches brands NOT in the knownBrands list (like GMC, etc.)
      if (parsed.keywords.length > 0) {
        const searchText = `
          ${car.make || ''} 
          ${car.model || ''} 
          ${(car as any).description || ''} 
          ${car.fuelType || ''}
          ${(car as any).trim || ''}
          ${(car as any).category || ''}
        `.toLowerCase();
        
        // ⚡ SMART: Match if ANY keyword is found (OR logic)
        const hasMatch = parsed.keywords.some(keyword => 
          searchText.includes(keyword.toLowerCase())
        );
        
        if (!hasMatch) {
          return false;
        }
      }
      
      return true;
    });
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
  ): Promise<(CarListing | BulgarianCar)[]> {
    const result = await this.search(keywords, undefined, 1, limit);
    return result.cars;
  }
}

export const smartSearchService = new SmartSearchService();
export default smartSearchService;

