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
import { UnifiedCar } from '../car/unified-car-types';
import { serviceLogger } from '../logger-service';
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
   * 🎯 SMART MODEL DETECTION MAP
   * Maps popular model codes to their brands
   * يربط رموز الموديلات الشائعة بالبراندات
   */
  private readonly MODEL_TO_BRAND_MAP: Record<string, string[]> = {
    // Audi Models
    'a1': ['Audi', 'A1'], 'a3': ['Audi', 'A3'], 'a4': ['Audi', 'A4'],
    'a5': ['Audi', 'A5'], 'a6': ['Audi', 'A6'], 'a7': ['Audi', 'A7'], 'a8': ['Audi', 'A8'],
    'q2': ['Audi', 'Q2'], 'q3': ['Audi', 'Q3'], 'q4': ['Audi', 'Q4'],
    'q5': ['Audi', 'Q5'], 'q7': ['Audi', 'Q7'], 'q8': ['Audi', 'Q8'],
    'tt': ['Audi', 'TT'], 'r8': ['Audi', 'R8'], 'rs3': ['Audi', 'RS3'],
    'rs4': ['Audi', 'RS4'], 'rs5': ['Audi', 'RS5'], 'rs6': ['Audi', 'RS6'],
    's3': ['Audi', 'S3'], 's4': ['Audi', 'S4'], 's5': ['Audi', 'S5'], 's6': ['Audi', 'S6'],
    
    // BMW Models
    '118': ['BMW', '118'], '120': ['BMW', '120'], '125': ['BMW', '125'],
    '218': ['BMW', '218'], '220': ['BMW', '220'], '225': ['BMW', '225'],
    '316': ['BMW', '316'], '318': ['BMW', '318'], '320': ['BMW', '320'],
    '325': ['BMW', '325'], '328': ['BMW', '328'], '330': ['BMW', '330'], '335': ['BMW', '335'],
    '420': ['BMW', '420'], '428': ['BMW', '428'], '430': ['BMW', '430'], '435': ['BMW', '435'],
    '520': ['BMW', '520'], '525': ['BMW', '525'], '528': ['BMW', '528'],
    '530': ['BMW', '530'], '535': ['BMW', '535'], '540': ['BMW', '540'],
    '740': ['BMW', '740'], '750': ['BMW', '750'], '760': ['BMW', '760'],
    'x1': ['BMW', 'X1'], 'x2': ['BMW', 'X2'], 'x3': ['BMW', 'X3'],
    'x4': ['BMW', 'X4'], 'x5': ['BMW', 'X5'], 'x6': ['BMW', 'X6'], 'x7': ['BMW', 'X7'],
    'm2': ['BMW', 'M2'], 'm3': ['BMW', 'M3'], 'm4': ['BMW', 'M4'],
    'm5': ['BMW', 'M5'], 'm6': ['BMW', 'M6'], 'z3': ['BMW', 'Z3'], 'z4': ['BMW', 'Z4'],
    
    // Mercedes Models
    'c180': ['Mercedes', 'C180'], 'c200': ['Mercedes', 'C200'], 'c220': ['Mercedes', 'C220'],
    'c250': ['Mercedes', 'C250'], 'c280': ['Mercedes', 'C280'], 'c300': ['Mercedes', 'C300'],
    'c320': ['Mercedes', 'C320'], 'c350': ['Mercedes', 'C350'], 'c400': ['Mercedes', 'C400'],
    'e200': ['Mercedes', 'E200'], 'e220': ['Mercedes', 'E220'], 'e250': ['Mercedes', 'E250'],
    'e280': ['Mercedes', 'E280'], 'e300': ['Mercedes', 'E300'], 'e320': ['Mercedes', 'E320'],
    'e350': ['Mercedes', 'E350'], 'e400': ['Mercedes', 'E400'], 'e500': ['Mercedes', 'E500'],
    's320': ['Mercedes', 'S320'], 's350': ['Mercedes', 'S350'], 's400': ['Mercedes', 'S400'],
    's500': ['Mercedes', 'S500'], 's600': ['Mercedes', 'S600'],
    'a160': ['Mercedes', 'A160'], 'a180': ['Mercedes', 'A180'], 'a200': ['Mercedes', 'A200'],
    'a220': ['Mercedes', 'A220'], 'a250': ['Mercedes', 'A250'],
    'b180': ['Mercedes', 'B180'], 'b200': ['Mercedes', 'B200'], 'b220': ['Mercedes', 'B220'],
    'cla200': ['Mercedes', 'CLA200'], 'cla220': ['Mercedes', 'CLA220'], 'cla250': ['Mercedes', 'CLA250'],
    'gla200': ['Mercedes', 'GLA200'], 'gla220': ['Mercedes', 'GLA220'], 'gla250': ['Mercedes', 'GLA250'],
    'glc200': ['Mercedes', 'GLC200'], 'glc220': ['Mercedes', 'GLC220'], 'glc250': ['Mercedes', 'GLC250'],
    'gle350': ['Mercedes', 'GLE350'], 'gle400': ['Mercedes', 'GLE400'], 'gle450': ['Mercedes', 'GLE450'],
    'gls400': ['Mercedes', 'GLS400'], 'gls450': ['Mercedes', 'GLS450'], 'gls500': ['Mercedes', 'GLS500'],
    'ml320': ['Mercedes', 'ML320'], 'ml350': ['Mercedes', 'ML350'], 'ml400': ['Mercedes', 'ML400'],
    'amg': ['Mercedes', 'AMG'], 'c63': ['Mercedes', 'C63'], 'e63': ['Mercedes', 'E63'],
    
    // VW Models
    'golf': ['Volkswagen', 'Golf'], 'polo': ['Volkswagen', 'Polo'], 'passat': ['Volkswagen', 'Passat'],
    'jetta': ['Volkswagen', 'Jetta'], 'tiguan': ['Volkswagen', 'Tiguan'], 'touareg': ['Volkswagen', 'Touareg'],
    'touran': ['Volkswagen', 'Touran'], 'caddy': ['Volkswagen', 'Caddy'], 'amarok': ['Volkswagen', 'Amarok'],
    'arteon': ['Volkswagen', 'Arteon'], 'beetle': ['Volkswagen', 'Beetle'], 'id3': ['Volkswagen', 'ID.3'],
    'id4': ['Volkswagen', 'ID.4'], 'eos': ['Volkswagen', 'Eos'], 'scirocco': ['Volkswagen', 'Scirocco'],
    
    // Toyota Models
    'corolla': ['Toyota', 'Corolla'], 'camry': ['Toyota', 'Camry'], 'yaris': ['Toyota', 'Yaris'],
    'rav4': ['Toyota', 'RAV4'], 'highlander': ['Toyota', 'Highlander'], 'land cruiser': ['Toyota', 'Land Cruiser'],
    'prius': ['Toyota', 'Prius'], 'supra': ['Toyota', 'Supra'], 'avensis': ['Toyota', 'Avensis'],
    'auris': ['Toyota', 'Auris'], 'chr': ['Toyota', 'C-HR'], 'hilux': ['Toyota', 'Hilux'],
    
    // Lexus Models
    'is200': ['Lexus', 'IS200'], 'is250': ['Lexus', 'IS250'], 'is300': ['Lexus', 'IS300'],
    'es250': ['Lexus', 'ES250'], 'es300': ['Lexus', 'ES300'], 'es350': ['Lexus', 'ES350'],
    'rx350': ['Lexus', 'RX350'], 'rx400': ['Lexus', 'RX400'], 'rx450': ['Lexus', 'RX450'],
    'nx200': ['Lexus', 'NX200'], 'nx300': ['Lexus', 'NX300'], 'lx570': ['Lexus', 'LX570'],
    
    // Opel Models
    'astra': ['Opel', 'Astra'], 'corsa': ['Opel', 'Corsa'], 'insignia': ['Opel', 'Insignia'],
    'vectra': ['Opel', 'Vectra'], 'mokka': ['Opel', 'Mokka'], 'grandland': ['Opel', 'Grandland'],
    'crossland': ['Opel', 'Crossland'], 'zafira': ['Opel', 'Zafira'], 'combo': ['Opel', 'Combo'],
    
    // Ford Models
    'fiesta': ['Ford', 'Fiesta'], 'focus': ['Ford', 'Focus'], 'mondeo': ['Ford', 'Mondeo'],
    'mustang': ['Ford', 'Mustang'], 'explorer': ['Ford', 'Explorer'], 'escape': ['Ford', 'Escape'],
    'kuga': ['Ford', 'Kuga'], 'edge': ['Ford', 'Edge'], 'ranger': ['Ford', 'Ranger'],
    'transit': ['Ford', 'Transit'], 'fusion': ['Ford', 'Fusion'], 'ecosport': ['Ford', 'EcoSport'],
    
    // Mazda Models
    'cx3': ['Mazda', 'CX-3'], 'cx5': ['Mazda', 'CX-5'], 'cx7': ['Mazda', 'CX-7'], 'cx9': ['Mazda', 'CX-9'],
    'mazda3': ['Mazda', 'Mazda3'], 'mazda6': ['Mazda', 'Mazda6'], 'mx5': ['Mazda', 'MX-5'],
    
    // Honda Models
    'civic': ['Honda', 'Civic'], 'accord': ['Honda', 'Accord'], 'crv': ['Honda', 'CR-V'],
    'hrv': ['Honda', 'HR-V'], 'jazz': ['Honda', 'Jazz'], 'pilot': ['Honda', 'Pilot'],
    
    // Nissan Models
    'micra': ['Nissan', 'Micra'], 'juke': ['Nissan', 'Juke'], 'qashqai': ['Nissan', 'Qashqai'],
    'xtrail': ['Nissan', 'X-Trail'], 'navara': ['Nissan', 'Navara'], 'pathfinder': ['Nissan', 'Pathfinder'],
    'leaf': ['Nissan', 'Leaf'], 'gtr': ['Nissan', 'GT-R'], '350z': ['Nissan', '350Z'], '370z': ['Nissan', '370Z'],
    
    // Hyundai Models
    'i10': ['Hyundai', 'i10'], 'i20': ['Hyundai', 'i20'], 'i30': ['Hyundai', 'i30'], 'i40': ['Hyundai', 'i40'],
    'tucson': ['Hyundai', 'Tucson'], 'santa fe': ['Hyundai', 'Santa Fe'], 'kona': ['Hyundai', 'Kona'],
    'elantra': ['Hyundai', 'Elantra'], 'sonata': ['Hyundai', 'Sonata'], 'ioniq': ['Hyundai', 'Ioniq'],
    
    // Kia Models
    'picanto': ['Kia', 'Picanto'], 'rio': ['Kia', 'Rio'], 'ceed': ['Kia', 'Ceed'],
    'sportage': ['Kia', 'Sportage'], 'sorento': ['Kia', 'Sorento'], 'soul': ['Kia', 'Soul'],
    'stinger': ['Kia', 'Stinger'], 'stonic': ['Kia', 'Stonic'], 'xceed': ['Kia', 'XCeed'],
    
    // Peugeot Models
    '208': ['Peugeot', '208'], '308': ['Peugeot', '308'], '508': ['Peugeot', '508'],
    '2008': ['Peugeot', '2008'], '3008': ['Peugeot', '3008'], '5008': ['Peugeot', '5008'],
    
    // Renault Models
    'clio': ['Renault', 'Clio'], 'megane': ['Renault', 'Megane'], 'captur': ['Renault', 'Captur'],
    'kadjar': ['Renault', 'Kadjar'], 'koleos': ['Renault', 'Koleos'], 'talisman': ['Renault', 'Talisman'],
    'scenic': ['Renault', 'Scenic'], 'espace': ['Renault', 'Espace'], 'twingo': ['Renault', 'Twingo'],
  };

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
      // 🔍 DEBUG LOG
      console.log('🔍 SmartSearch.search() called', { keywords, userId, page, pageSize });
      
      // 1. Parse keywords intelligently
      const parsed = this.parseKeywords(keywords);
      console.log('🎯 Keywords parsed:', parsed);
      
      // 2. Check cache first
      const cacheKey = `smart_search_${keywords}_${userId || 'guest'}_${page}`;
      const cached = await homePageCache.getOrFetch(
        cacheKey,
        async () => {
          // 3. Execute Firestore query
          console.log('📡 Executing Firestore query...');
          const results = await this.executeSearch(parsed, pageSize * page);
          console.log('📊 Firestore returned:', results.length, 'cars');
          return results;
        },
        3 * 60 * 1000 // 3 minutes cache
      );
      
      console.log('📦 After cache/fetch:', cached.length, 'cars');
      
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
   * 🎯 ENHANCED: Smart model detection (A4 → Audi, C320 → Mercedes)
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
      keywords: []
    };
    
    // 🎯 STEP 1: Smart Model Detection
    // Check each word and compound words for known model codes
    for (let i = 0; i < words.length; i++) {
      const word = words[i];
      
      // Check single word (e.g., "a4", "golf")
      if (this.MODEL_TO_BRAND_MAP[word]) {
        const [brand, model] = this.MODEL_TO_BRAND_MAP[word];
        parsed.keywords.push(brand.toLowerCase());
        parsed.keywords.push(model.toLowerCase());
        serviceLogger.debug(`🎯 Smart Model Detected: "${word}" → ${brand} ${model}`);
        continue; // Skip to next word
      }
      
      // Check compound words (e.g., "c 320" → "c320")
      if (i < words.length - 1) {
        const compound = word + words[i + 1];
        if (this.MODEL_TO_BRAND_MAP[compound]) {
          const [brand, model] = this.MODEL_TO_BRAND_MAP[compound];
          parsed.keywords.push(brand.toLowerCase());
          parsed.keywords.push(model.toLowerCase());
          serviceLogger.debug(`🎯 Smart Model Detected (Compound): "${word} ${words[i + 1]}" → ${brand} ${model}`);
          i++; // Skip next word since we used it in compound
          continue;
        }
      }
      
      // If not a known model, add as regular keyword
      parsed.keywords.push(word);
    }
    
    // 🎯 STEP 2: Detect brands (ALL car brands)
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
      
      serviceLogger.debug('Smart Search - Executing with params', {
        brands: parsed.brands,
        fuelTypes: parsed.fuelTypes,
        years: parsed.years,
        priceRange: parsed.priceRange,
        keywords: parsed.keywords
      });
      
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
      
      
      const allCars: (CarListing | UnifiedCar)[] = [];
      
      // Query each collection in parallel
      const queryPromises = collections.map(async (collectionName) => {
        try {
          
          let q: Query<DocumentData> = query(collection(db, collectionName));
          
          // Filter by status (active only)
          q = query(q, where('status', '==', 'active'));
          
          // ⚡ REMOVED: Brand filter from Firestore (will use client-side for case-insensitive)
          // Reason: Firestore 'in' query is case-sensitive, won't match 'ford' vs 'Ford' vs 'FORD'
          
          // Apply fuel type filter if detected
          if (parsed.fuelTypes.length > 0) {
            const fuelTypes = parsed.fuelTypes.slice(0, 10);
            q = query(q, where('fuelType', 'in', fuelTypes));
          }
          
          // ✅ ENABLED: orderBy with Firestore indexes (status + createdAt)
          // Indexes exist in firestore.indexes.json for all vehicle collections
          q = query(q, orderBy('createdAt', 'desc'));
          
          // Limit results per collection
          q = query(q, firestoreLimit(Math.ceil(limitCount / collections.length)));
          
          // Execute query
          const snapshot = await getDocs(q);
          const cars = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          })) as (CarListing | UnifiedCar)[];
          
          if (cars.length > 0 && isDebug) {
            serviceLogger.debug(`[${collectionName}] Sample`, {
              make: cars[0].make,
              model: cars[0].model,
              status: cars[0].status,
              fuelType: (cars[0] as any).fuelType
            });
          }
          
          return cars;
        } catch (error) {
          serviceLogger.error(`[${collectionName}] Query failed`, error as Error);
          return [];
        }
      });
      
      // Wait for all queries to complete
      const results = await Promise.all(queryPromises);
      results.forEach(cars => allCars.push(...cars));
      
      serviceLogger.debug('Smart Search - Firestore returned', {
        totalCars: allCars.length,
        collections: collections.map((col, i) => ({ name: col, count: results[i].length }))
      });
      
      if (allCars.length === 0) {
        serviceLogger.warn('No cars found in any collection', { parsed, collections });
      }
      
      // ⚡ NEW: Apply client-side filters (ranges, text search, make/model matching)
      const beforeFilter = allCars.length;
      const filteredCars = this.applyClientSideFilters(allCars, parsed);
      
      if (isDebug) {
        serviceLogger.debug('After client-side filtering', {
          before: beforeFilter,
          after: filteredCars.length,
          removed: beforeFilter - filteredCars.length
        });
      }
      
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
    const isDebug = typeof window !== 'undefined' && localStorage.getItem('DEBUG_SEARCH') === 'true';
    
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
      
      // ⚡ ENHANCED: Case-insensitive keyword matching with "Other" fields support
      if (parsed.keywords.length > 0) {
        // ✅ FIX: Include "Other" fields in search
        const carMake = ((car.make || (car as any).makeOther) || '').toLowerCase();
        const carModel = ((car.model || (car as any).modelOther) || '').toLowerCase();
        const carVariant = ((car as any).variantOther || '').toLowerCase();
        const carDescription = ((car as any).description || '').toLowerCase();
        const carFuelType = ((car.fuelType || (car as any).fuelTypeOther) || '').toLowerCase();
        const carColor = ((car.color || (car as any).colorOther || (car as any).exteriorColor) || '').toLowerCase();
        const carTrim = ((car as any).trim || '').toLowerCase();
        const carCategory = ((car as any).category || '').toLowerCase();
        
        const searchText = `${carMake} ${carModel} ${carVariant} ${carDescription} ${carFuelType} ${carColor} ${carTrim} ${carCategory}`;
        
        // ⚡ SMART: Match if ANY keyword is found (OR logic, case-insensitive)
        const hasMatch = parsed.keywords.some(keyword => {
          const lowerKeyword = keyword.toLowerCase();
          const matched = searchText.includes(lowerKeyword);
          return matched;
        });
        
        if (!hasMatch) {
          return false;
        }
      }
      
      return true;
    });
    
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

