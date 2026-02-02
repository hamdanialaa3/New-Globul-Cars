// Market Value Calculation Service
// خدمة حساب القيمة السوقية
// ✅ FIXED: Now uses real market data integration

import { PersonalVehicle } from '../types/personal-vehicle.types';
import { logger } from './logger-service';
import { bulgarianMarketDataService, CarMarketData } from './ai/market-data-integration.service';

// Brand prestige multipliers for Bulgarian market
const BRAND_PRESTIGE: Record<string, number> = {
  // Premium brands
  'mercedes-benz': 1.25,
  'bmw': 1.20,
  'audi': 1.18,
  'porsche': 1.45,
  'lexus': 1.15,
  'land rover': 1.12,
  'jaguar': 1.10,
  'volvo': 1.08,
  
  // Standard brands
  'volkswagen': 1.05,
  'toyota': 1.08,
  'honda': 1.05,
  'mazda': 1.03,
  'ford': 1.00,
  'opel': 0.98,
  'peugeot': 0.97,
  'renault': 0.96,
  'skoda': 1.02,
  'seat': 0.98,
  'hyundai': 1.00,
  'kia': 1.00,
  'nissan': 0.99,
  
  // Economy brands
  'dacia': 0.90,
  'fiat': 0.92,
  'lada': 0.75,
  'citroen': 0.95,
};

// Average base values by body type in BGN (Bulgarian market data 2024)
const BODY_TYPE_BASE_VALUES: Record<string, number> = {
  'sedan': 28000,
  'hatchback': 24000,
  'suv': 38000,
  'crossover': 35000,
  'wagon': 26000,
  'coupe': 32000,
  'convertible': 35000,
  'van': 30000,
  'pickup': 45000,
  'minivan': 28000,
};

// Depreciation curve - more accurate than linear
function getDepreciationMultiplier(ageYears: number): number {
  // Bulgarian market depreciation curve
  // Year 1: -15%, Year 2: -12%, Year 3-5: -10%/year, Year 6+: -8%/year
  if (ageYears <= 0) return 1.0;
  if (ageYears === 1) return 0.85;
  if (ageYears === 2) return 0.75;
  if (ageYears <= 5) return 0.75 * Math.pow(0.90, ageYears - 2);
  // After 5 years, slower depreciation
  const base5Year = 0.75 * Math.pow(0.90, 3); // ~0.55
  return base5Year * Math.pow(0.92, ageYears - 5);
}

// Mileage adjustment factor
function getMileageMultiplier(mileageKm: number, ageYears: number): number {
  // Average annual mileage in Bulgaria: ~15,000 km
  const expectedMileage = ageYears * 15000;
  const mileageDifference = mileageKm - expectedMileage;
  
  // ±5% adjustment per 10,000 km difference from expected
  const adjustmentFactor = (mileageDifference / 10000) * 0.05;
  
  // Cap adjustment between -25% and +15%
  return Math.max(0.75, Math.min(1.15, 1 - adjustmentFactor));
}

/**
 * Calculate market value for a personal vehicle
 * Uses real market data from Bulgarian car market sources
 */
export class MarketValueService {
  private static marketDataCache: Map<string, { data: CarMarketData; timestamp: number }> = new Map();
  private static CACHE_TTL = 24 * 60 * 60 * 1000; // 24 hours

  /**
   * Calculate market value based on vehicle data
   * ✅ FIXED: Uses real market data integration + sophisticated algorithm
   */
  static async calculateMarketValue(
    vehicle: Partial<PersonalVehicle>
  ): Promise<number | null> {
    try {
      // Basic validation
      if (!vehicle.make || !vehicle.model || !vehicle.firstRegistration || !vehicle.currentMileage) {
        logger.warn('Insufficient vehicle data for market value calculation', { vehicleId: vehicle.id });
        return null;
      }

      const currentYear = new Date().getFullYear();
      const vehicleAge = currentYear - vehicle.firstRegistration.year;
      const makeNormalized = vehicle.make.toLowerCase();

      // Step 1: Try to get real market data
      let marketData: CarMarketData | null = null;
      try {
        marketData = await this.fetchMarketDataWithCache(
          vehicle.make,
          vehicle.model,
          vehicle.firstRegistration.year
        );
      } catch (err) {
        logger.warn('Could not fetch market data, using algorithm fallback', { make: vehicle.make, model: vehicle.model });
      }

      let estimatedValue: number;

      if (marketData && marketData.averagePrice > 0) {
        // Use real market data as base
        estimatedValue = this.calculateFromMarketData(
          marketData,
          vehicle,
          vehicleAge
        );
        
        logger.info('Market value calculated from real data', {
          vehicleId: vehicle.id,
          marketAverage: marketData.averagePrice,
          estimatedValue,
          source: 'market_data'
        });
      } else {
        // Fallback to algorithm-based calculation
        estimatedValue = this.calculateFromAlgorithm(
          vehicle,
          vehicleAge,
          makeNormalized
        );
        
        logger.info('Market value calculated from algorithm', {
          vehicleId: vehicle.id,
          estimatedValue,
          source: 'algorithm'
        });
      }

      // Ensure minimum value of 500 BGN
      estimatedValue = Math.max(estimatedValue, 500);
      
      return Math.round(estimatedValue);
    } catch (error) {
      logger.error('Failed to calculate market value', error as Error, { vehicleId: vehicle.id });
      return null;
    }
  }

  /**
   * Calculate value using real market data
   */
  private static calculateFromMarketData(
    marketData: CarMarketData,
    vehicle: Partial<PersonalVehicle>,
    vehicleAge: number
  ): number {
    let baseValue = marketData.averagePrice;
    
    // Adjust for mileage difference from market average
    const avgMileage = marketData.averageKilometers || (vehicleAge * 15000);
    const mileageDiff = (vehicle.currentMileage || 0) - avgMileage;
    
    // Use market-derived price per km if available
    const pricePerKm = marketData.pricePerKm || 0.03;
    baseValue -= mileageDiff * pricePerKm;

    // Adjust for condition if specified
    if (vehicle.condition) {
      const conditionMultipliers: Record<string, number> = {
        'excellent': 1.10,
        'very_good': 1.05,
        'good': 1.00,
        'fair': 0.90,
        'poor': 0.75
      };
      baseValue *= conditionMultipliers[vehicle.condition] || 1.0;
    }

    // Fuel type premium (market-adjusted)
    if (vehicle.fuelType) {
      const fuelMultipliers: Record<string, number> = {
        'electric': 1.15,
        'hybrid': 1.10,
        'plug-in hybrid': 1.12,
        'petrol': 1.00,
        'diesel': 0.95, // Diesel less popular due to EU regulations
        'lpg': 0.92,
        'cng': 0.90
      };
      baseValue *= fuelMultipliers[vehicle.fuelType.toLowerCase()] || 1.0;
    }

    // Transmission adjustment
    if (vehicle.transmission === 'automatic') {
      baseValue *= 1.08;
    }

    return baseValue;
  }

  /**
   * Algorithm-based calculation (fallback)
   */
  private static calculateFromAlgorithm(
    vehicle: Partial<PersonalVehicle>,
    vehicleAge: number,
    makeNormalized: string
  ): number {
    // Get base value from body type or use default
    const bodyType = vehicle.bodyType?.toLowerCase() || 'sedan';
    let baseValue = BODY_TYPE_BASE_VALUES[bodyType] || 28000;

    // Apply brand prestige
    const brandMultiplier = BRAND_PRESTIGE[makeNormalized] || 1.0;
    baseValue *= brandMultiplier;

    // Apply depreciation curve
    const depreciationMultiplier = getDepreciationMultiplier(vehicleAge);
    baseValue *= depreciationMultiplier;

    // Apply mileage adjustment
    const mileageMultiplier = getMileageMultiplier(vehicle.currentMileage || 0, vehicleAge);
    baseValue *= mileageMultiplier;

    // Fuel type adjustment
    if (vehicle.fuelType) {
      const fuelMultipliers: Record<string, number> = {
        'electric': 1.20,
        'hybrid': 1.12,
        'plug-in hybrid': 1.15,
        'petrol': 1.00,
        'diesel': 0.95,
        'lpg': 0.90,
        'cng': 0.88
      };
      baseValue *= fuelMultipliers[vehicle.fuelType.toLowerCase()] || 1.0;
    }

    // Transmission adjustment
    if (vehicle.transmission === 'automatic') {
      baseValue *= 1.10;
    }

    // Engine size adjustment (if available)
    if (vehicle.engineSize) {
      if (vehicle.engineSize < 1.2) baseValue *= 0.92;
      else if (vehicle.engineSize >= 1.2 && vehicle.engineSize < 1.6) baseValue *= 0.96;
      else if (vehicle.engineSize >= 1.6 && vehicle.engineSize < 2.0) baseValue *= 1.00;
      else if (vehicle.engineSize >= 2.0 && vehicle.engineSize < 3.0) baseValue *= 1.05;
      else baseValue *= 1.10;
    }

    // Condition adjustment
    if (vehicle.condition) {
      const conditionMultipliers: Record<string, number> = {
        'excellent': 1.12,
        'very_good': 1.06,
        'good': 1.00,
        'fair': 0.88,
        'poor': 0.70
      };
      baseValue *= conditionMultipliers[vehicle.condition] || 1.0;
    }

    return baseValue;
  }

  /**
   * Fetch market data with caching
   */
  private static async fetchMarketDataWithCache(
    make: string,
    model: string,
    year: number
  ): Promise<CarMarketData | null> {
    const cacheKey = `${make}-${model}-${year}`.toLowerCase();
    const cached = this.marketDataCache.get(cacheKey);
    
    if (cached && Date.now() - cached.timestamp < this.CACHE_TTL) {
      return cached.data;
    }

    const data = await bulgarianMarketDataService.fetchMarketData(make, model, year);
    
    if (data) {
      this.marketDataCache.set(cacheKey, { data, timestamp: Date.now() });
    }
    
    return data;
  }

  /**
   * Get market value from cache or calculate
   */
  static async getMarketValue(
    vehicle: Partial<PersonalVehicle>,
    useCache: boolean = true
  ): Promise<number | null> {
    return this.calculateMarketValue(vehicle);
  }

  /**
   * Get price range for a vehicle
   */
  static async getPriceRange(
    vehicle: Partial<PersonalVehicle>
  ): Promise<{ min: number; max: number; average: number } | null> {
    const estimatedValue = await this.calculateMarketValue(vehicle);
    
    if (!estimatedValue) return null;
    
    // Return range of ±15%
    return {
      min: Math.round(estimatedValue * 0.85),
      max: Math.round(estimatedValue * 1.15),
      average: estimatedValue
    };
  }
}
