/**
 * Bulgarian Market Data Integration Service
 * خدمة تكامل بيانات السوق البلغارية
 * 
 * @service BulgarianMarketDataService
 * @description تجميع بيانات حقيقية من mobile.bg, mobile.de, autobg.info
 */

import { logger } from '../logger-service';
import { firestore } from '../../firebase/firebase-config';
import { 
  collection, 
  doc, 
  setDoc, 
  getDocs, 
  query, 
  where, 
  orderBy, 
  limit,
  Timestamp 
} from 'firebase/firestore';

// ================ Interfaces ================

export interface MarketDataSource {
  name: string;
  url: string;
  lastSync: Date | null;
  status: 'active' | 'inactive' | 'error';
}

export interface CarMarketData {
  make: string;
  model: string;
  year: number;
  averagePrice: number;
  minPrice: number;
  maxPrice: number;
  totalListings: number;
  pricePerKm: number;
  averageKilometers: number;
  popularColors: string[];
  popularFuelTypes: string[];
  averageDaysOnMarket: number;
  priceHistory: PriceHistoryPoint[];
  source: string;
  lastUpdated: Date;
}

export interface PriceHistoryPoint {
  date: Date;
  averagePrice: number;
  listingCount: number;
}

export interface MarketTrend {
  make: string;
  model: string;
  trend: 'rising' | 'falling' | 'stable';
  changePercent: number;
  period: string;
}

export interface CompetitorListing {
  id: string;
  make: string;
  model: string;
  year: number;
  price: number;
  kilometers: number;
  location: string;
  source: string;
  url: string;
  listingDate: Date;
}

// ================ Service ================

class BulgarianMarketDataService {
  private static instance: BulgarianMarketDataService;
  
  private dataSources: MarketDataSource[] = [
    { name: 'mobile.bg', url: 'https://www.mobile.bg', lastSync: null, status: 'active' },
    { name: 'mobile.de', url: 'https://www.mobile.de', lastSync: null, status: 'active' },
    { name: 'autobg.info', url: 'https://www.autobg.info', lastSync: null, status: 'active' }
  ];

  private constructor() {}

  static getInstance(): BulgarianMarketDataService {
    if (!this.instance) {
      this.instance = new BulgarianMarketDataService();
    }
    return this.instance;
  }

  // ================ Public Methods ================

  /**
   * جلب بيانات السوق لسيارة محددة
   */
  async fetchMarketData(
    make: string, 
    model: string, 
    year?: number
  ): Promise<CarMarketData | null> {
    try {
      // محاولة جلب من Cache أولاً
      const cachedData = await this.getCachedMarketData(make, model, year);
      if (cachedData && this.isCacheValid(cachedData.lastUpdated)) {
        logger.info('Using cached market data', { make, model, year });
        return cachedData;
      }

      // جلب بيانات جديدة من مصادر متعددة
      const [mobileBgData, mobileDeData, autoBgData] = await Promise.allSettled([
        this.fetchFromMobileBg(make, model, year),
        this.fetchFromMobileDe(make, model, year),
        this.fetchFromAutoBg(make, model, year)
      ]);

      // دمج البيانات
      const mergedData = this.mergeMarketData(
        mobileBgData.status === 'fulfilled' ? mobileBgData.value : null,
        mobileDeData.status === 'fulfilled' ? mobileDeData.value : null,
        autoBgData.status === 'fulfilled' ? autoBgData.value : null
      );

      if (!mergedData) {
        logger.warn('No market data available', { make, model, year });
        return null;
      }

      // حفظ في Cache
      await this.cacheMarketData(mergedData);

      logger.info('Market data fetched successfully', { 
        make, 
        model, 
        year,
        avgPrice: mergedData.averagePrice 
      });

      return mergedData;
    } catch (error) {
      logger.error('Failed to fetch market data', error as Error, { make, model, year });
      return null;
    }
  }

  /**
   * جلب اتجاهات السوق
   */
  async getMarketTrends(make?: string): Promise<MarketTrend[]> {
    try {
      const trendsRef = collection(firestore, 'market_trends');
      let q = query(trendsRef, orderBy('changePercent', 'desc'), limit(20));

      if (make) {
        q = query(trendsRef, where('make', '==', make), limit(10));
      }

      const snapshot = await getDocs(q);
      const trends: MarketTrend[] = [];

      snapshot.forEach(doc => {
        const data = doc.data();
        trends.push({
          make: data.make,
          model: data.model,
          trend: data.trend,
          changePercent: data.changePercent,
          period: data.period
        });
      });

      logger.info('Market trends fetched', { count: trends.length, make });
      return trends;
    } catch (error) {
      logger.error('Failed to fetch market trends', error as Error);
      return [];
    }
  }

  /**
   * جلب منافسين قريبين
   */
  async findCompetitors(
    make: string,
    model: string,
    year: number,
    price: number,
    maxResults: number = 10
  ): Promise<CompetitorListing[]> {
    try {
      // نطاق السعر ±15%
      const priceMin = price * 0.85;
      const priceMax = price * 1.15;

      // نطاق السنة ±2 سنوات
      const yearMin = year - 2;
      const yearMax = year + 2;

      const competitorsRef = collection(firestore, 'competitor_listings');
      const q = query(
        competitorsRef,
        where('make', '==', make),
        where('model', '==', model),
        where('year', '>=', yearMin),
        where('year', '<=', yearMax),
        orderBy('year', 'desc'),
        limit(maxResults)
      );

      const snapshot = await getDocs(q);
      const competitors: CompetitorListing[] = [];

      snapshot.forEach(doc => {
        const data = doc.data();
        
        // تصفية حسب السعر
        if (data.price >= priceMin && data.price <= priceMax) {
          competitors.push({
            id: doc.id,
            make: data.make,
            model: data.model,
            year: data.year,
            price: data.price,
            kilometers: data.kilometers,
            location: data.location,
            source: data.source,
            url: data.url,
            listingDate: data.listingDate.toDate()
          });
        }
      });

      logger.info('Competitors found', { 
        make, 
        model, 
        year, 
        price,
        count: competitors.length 
      });

      return competitors;
    } catch (error) {
      logger.error('Failed to find competitors', error as Error);
      return [];
    }
  }

  /**
   * تحليل تاريخ الأسعار
   */
  async getPriceHistory(
    make: string,
    model: string,
    months: number = 6
  ): Promise<PriceHistoryPoint[]> {
    try {
      const historyRef = collection(firestore, 'price_history');
      const cutoffDate = new Date();
      cutoffDate.setMonth(cutoffDate.getMonth() - months);

      const q = query(
        historyRef,
        where('make', '==', make),
        where('model', '==', model),
        where('date', '>=', Timestamp.fromDate(cutoffDate)),
        orderBy('date', 'asc')
      );

      const snapshot = await getDocs(q);
      const history: PriceHistoryPoint[] = [];

      snapshot.forEach(doc => {
        const data = doc.data();
        history.push({
          date: data.date.toDate(),
          averagePrice: data.averagePrice,
          listingCount: data.listingCount
        });
      });

      logger.info('Price history fetched', { make, model, months, points: history.length });
      return history;
    } catch (error) {
      logger.error('Failed to fetch price history', error as Error);
      return [];
    }
  }

  // ================ Private Methods ================

  /**
   * جلب من mobile.bg (محاكاة - يحتاج web scraping حقيقي)
   */
  private async fetchFromMobileBg(
    make: string,
    model: string,
    year?: number
  ): Promise<Partial<CarMarketData>> {
    // TODO: Implement real web scraping with Puppeteer/Cheerio
    // For now, return mock data
    
    await this.delay(500); // محاكاة طلب الشبكة

    return {
      make,
      model,
      year: year || 2020,
      averagePrice: 15000,
      minPrice: 12000,
      maxPrice: 18000,
      totalListings: 45,
      averageKilometers: 80000,
      popularColors: ['Черен', 'Бял', 'Сив'],
      popularFuelTypes: ['Дизел', 'Бензин'],
      averageDaysOnMarket: 28,
      source: 'mobile.bg',
      lastUpdated: new Date()
    };
  }

  /**
   * جلب من mobile.de (محاكاة)
   */
  private async fetchFromMobileDe(
    make: string,
    model: string,
    year?: number
  ): Promise<Partial<CarMarketData>> {
    await this.delay(600);

    return {
      make,
      model,
      year: year || 2020,
      averagePrice: 16500,
      minPrice: 13000,
      maxPrice: 20000,
      totalListings: 120,
      averageKilometers: 75000,
      source: 'mobile.de',
      lastUpdated: new Date()
    };
  }

  /**
   * جلب من autobg.info (محاكاة)
   */
  private async fetchFromAutoBg(
    make: string,
    model: string,
    year?: number
  ): Promise<Partial<CarMarketData>> {
    await this.delay(400);

    return {
      make,
      model,
      year: year || 2020,
      averagePrice: 14800,
      minPrice: 11500,
      maxPrice: 17500,
      totalListings: 32,
      averageKilometers: 85000,
      source: 'autobg.info',
      lastUpdated: new Date()
    };
  }

  /**
   * دمج البيانات من مصادر متعددة
   */
  private mergeMarketData(
    ...sources: (Partial<CarMarketData> | null)[]
  ): CarMarketData | null {
    const validSources = sources.filter(s => s !== null) as Partial<CarMarketData>[];
    
    if (validSources.length === 0) return null;

    const merged: CarMarketData = {
      make: validSources[0].make!,
      model: validSources[0].model!,
      year: validSources[0].year!,
      averagePrice: this.calculateAverage(validSources.map(s => s.averagePrice || 0)),
      minPrice: Math.min(...validSources.map(s => s.minPrice || Infinity)),
      maxPrice: Math.max(...validSources.map(s => s.maxPrice || 0)),
      totalListings: validSources.reduce((sum, s) => sum + (s.totalListings || 0), 0),
      pricePerKm: 0,
      averageKilometers: this.calculateAverage(validSources.map(s => s.averageKilometers || 0)),
      popularColors: this.mergeArrays(validSources.map(s => s.popularColors || [])),
      popularFuelTypes: this.mergeArrays(validSources.map(s => s.popularFuelTypes || [])),
      averageDaysOnMarket: this.calculateAverage(validSources.map(s => s.averageDaysOnMarket || 0)),
      priceHistory: [],
      source: 'merged',
      lastUpdated: new Date()
    };

    // حساب السعر لكل كيلومتر
    if (merged.averageKilometers > 0) {
      merged.pricePerKm = merged.averagePrice / merged.averageKilometers;
    }

    return merged;
  }

  /**
   * حفظ في Cache
   */
  private async cacheMarketData(data: CarMarketData): Promise<void> {
    try {
      const cacheKey = `${data.make}_${data.model}_${data.year}`;
      const cacheRef = doc(firestore, 'market_data_cache', cacheKey);
      
      await setDoc(cacheRef, {
        ...data,
        lastUpdated: Timestamp.fromDate(data.lastUpdated)
      });

      logger.info('Market data cached', { cacheKey });
    } catch (error) {
      logger.error('Failed to cache market data', error as Error);
    }
  }

  /**
   * جلب من Cache
   */
  private async getCachedMarketData(
    make: string,
    model: string,
    year?: number
  ): Promise<CarMarketData | null> {
    try {
      const cacheKey = `${make}_${model}_${year || ''}`;
      const cacheRef = doc(firestore, 'market_data_cache', cacheKey);
      const snapshot = await getDocs(query(collection(firestore, 'market_data_cache'), where('__name__', '==', cacheKey)));

      if (snapshot.empty) return null;

      const data = snapshot.docs[0].data();
      return {
        ...data,
        lastUpdated: data.lastUpdated.toDate()
      } as CarMarketData;
    } catch (error) {
      logger.error('Failed to get cached data', error as Error);
      return null;
    }
  }

  /**
   * التحقق من صلاحية Cache (24 ساعة)
   */
  private isCacheValid(lastUpdated: Date): boolean {
    const maxAge = 24 * 60 * 60 * 1000; // 24 ساعة
    return Date.now() - lastUpdated.getTime() < maxAge;
  }

  // ================ Utilities ================

  private calculateAverage(numbers: number[]): number {
    const validNumbers = numbers.filter(n => n > 0);
    if (validNumbers.length === 0) return 0;
    return validNumbers.reduce((sum, n) => sum + n, 0) / validNumbers.length;
  }

  private mergeArrays(arrays: string[][]): string[] {
    const merged = new Set<string>();
    arrays.forEach(arr => arr.forEach(item => merged.add(item)));
    return Array.from(merged).slice(0, 5); // أفضل 5
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// ================ Export ================

export const bulgarianMarketDataService = BulgarianMarketDataService.getInstance();
