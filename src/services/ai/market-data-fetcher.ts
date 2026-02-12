/**
 * Market Data Fetcher
 * Fetches Bulgarian market data from Firestore (real data from listings)
 * Falls back to internal estimation if no data found
 */

import { logger } from '../logger-service';
import { collection, query, where, getDocs, orderBy, limit } from 'firebase/firestore';
import { db } from '../../firebase';

interface MarketData {
  make: string;
  model: string;
  year: number;
  averagePrice: number;
  priceRange: { min: number; max: number };
  totalListings: number;
  source: 'firestore' | 'internal';
  lastUpdated: Date;
}

class MarketDataFetcher {
  private static instance: MarketDataFetcher;
  private cache: Map<string, MarketData> = new Map();
  private readonly CACHE_TTL = 3600000; // 1 hour

  static getInstance(): MarketDataFetcher {
    if (!this.instance) {
      this.instance = new MarketDataFetcher();
    }
    return this.instance;
  }

  async fetchBulgarianMarketData(
    make: string,
    model: string,
    year: number
  ): Promise<MarketData> {
    const cacheKey = `${make}_${model}_${year}`;
    
    // Check cache first
    if (this.cache.has(cacheKey)) {
      const cached = this.cache.get(cacheKey)!;
      if (Date.now() - cached.lastUpdated.getTime() < this.CACHE_TTL) {
        return cached;
      }
    }

    try {
      // Query Firestore for real market data
      const marketData = await this.queryFirestoreListings(make, model, year);
      this.cache.set(cacheKey, marketData);
      return marketData;

    } catch (error) {
      logger.error('Failed to fetch market data from Firestore', error as Error);
      
      // Return estimation based on year/make if Firestore fails
      const fallbackData = this.estimateMarketData(make, model, year);
      return fallbackData;
    }
  }

  private async queryFirestoreListings(
    make: string,
    model: string,
    year: number
  ): Promise<MarketData> {
    const collections = ['passenger_cars', 'suvs', 'cars'];
    let allPrices: number[] = [];

    for (const collectionName of collections) {
      try {
        const q = query(
          collection(db, collectionName),
          where('make', '==', make),
          where('model', '==', model),
          where('year', '>=', year - 1),
          where('year', '<=', year + 1),
          where('status', '==', 'active'),
          limit(100)
        );

        const snapshot = await getDocs(q);
        snapshot.forEach(doc => {
          const data = doc.data();
          if (data.price && typeof data.price === 'number') {
            allPrices.push(data.price);
          }
        });
      } catch (e) {
        // Continue with other collections
        logger.warn(`Failed to query ${collectionName}`, e as Error);
      }
    }

    if (allPrices.length === 0) {
      // No listings found, return estimation
      return this.estimateMarketData(make, model, year);
    }

    // Calculate statistics
    const sortedPrices = allPrices.sort((a, b) => a - b);
    const averagePrice = Math.round(allPrices.reduce((a, b) => a + b, 0) / allPrices.length);
    const minPrice = sortedPrices[0];
    const maxPrice = sortedPrices[sortedPrices.length - 1];

    return {
      make,
      model,
      year,
      averagePrice,
      priceRange: { min: minPrice, max: maxPrice },
      totalListings: allPrices.length,
      source: 'firestore',
      lastUpdated: new Date()
    };
  }

  private estimateMarketData(make: string, model: string, year: number): MarketData {
    // Base estimation using depreciation model
    const currentYear = new Date().getFullYear();
    const age = currentYear - year;
    
    // Premium brands base prices
    const premiumBrands = ['BMW', 'Mercedes-Benz', 'Audi', 'Porsche', 'Lexus'];
    const isPremium = premiumBrands.some(b => make.toLowerCase().includes(b.toLowerCase()));
    
    let basePrice = isPremium ? 35000 : 20000;
    
    // Apply depreciation (roughly 15% per year, slowing down over time)
    const depreciation = Math.pow(0.85, Math.min(age, 10));
    const estimatedPrice = Math.round(basePrice * depreciation);
    
    return {
      make,
      model,
      year,
      averagePrice: estimatedPrice,
      priceRange: { 
        min: Math.round(estimatedPrice * 0.7), 
        max: Math.round(estimatedPrice * 1.3) 
      },
      totalListings: 0,
      source: 'internal',
      lastUpdated: new Date()
    };
  }
}

export const marketDataFetcher = MarketDataFetcher.getInstance();
export default marketDataFetcher;
