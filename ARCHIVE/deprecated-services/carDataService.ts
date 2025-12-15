/**
 * ⚠️ DEPRECATED SERVICE - DO NOT USE
 * 
 * This service has been DEPRECATED and will be removed in v2.0.0
 * 
 * Migration Path:
 * ================
 * OLD: import { carDataService } from '@/services/carDataService';
 * NEW: import { unifiedCarService } from '@/services/car/unified-car.service';
 * 
 * Method Mapping:
 * ===============
 * carDataService.getAllBrands() → unifiedCarService.searchCars()
 * carDataService.getCarsByBrand(brand) → unifiedCarService.searchCars({ make: brand })
 * carDataService.getBrandData(brand) → Use static CAR_DATA from @/constants/carData
 * 
 * Deprecated: December 15, 2025
 * Removal: March 2026
 * 
 * @see {@link ../car/unified-car.service.ts} for the new unified service
 * @deprecated Use UnifiedCarService instead
 */

import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';
import { serviceLogger } from './logger-wrapper';

// ⚠️ DEPRECATION WARNING
if (process.env.NODE_ENV === 'development') {
  console.warn(`
╔═══════════════════════════════════════════════════════════════════════╗
║                      ⚠️  DEPRECATION WARNING  ⚠️                        ║
╠═══════════════════════════════════════════════════════════════════════╣
║  You are using a DEPRECATED service: carDataService.ts                ║
║                                                                       ║
║  This service will be REMOVED in v2.0.0 (March 2026)                ║
║                                                                       ║
║  Please migrate to:                                                  ║
║  → UnifiedCarService (@/services/car/unified-car.service)           ║
║                                                                       ║
║  See migration guide:                                                ║
║  → ARCHIVE/deprecated-services/MIGRATION_GUIDE.md                   ║
╚═══════════════════════════════════════════════════════════════════════╝
  `);
  
  serviceLogger.warn('DEPRECATED: carDataService is being used', {
    stack: new Error().stack,
    migration: 'Use UnifiedCarService instead'
  });
}

// Interface for car data from text files
export interface CarDataFromFile {
  brand: string;
  year: number;
  model: string;
  engine?: string;
  power?: string;
  transmission?: string;
  drivetrain?: string;
  bodyStyle?: string;
  dimensions?: string;
  weight?: string;
  topSpeed?: string;
  acceleration?: string;
  fuelEconomy?: string;
  price?: string;
  category?: string;
  generation?: string;
  size?: string;
  engineSize?: string;
  fuelType?: string;
  cylinders?: number;
  doors?: number;
  seats?: number;
  color?: string;
  condition?: string;
}

// Interface for brand data
export interface BrandData {
  name: string;
  models: CarDataFromFile[];
  categories: string[];
  generations: string[];
  sizes: string[];
  engineSizes: string[];
  fuelTypes: string[];
  transmissions: string[];
  colors: string[];
  years: number[];
}

// Main service class
export class CarDataService {
  private brandDirectoriesPath: string;
  private brandsData: Map<string, BrandData> = new Map();

  constructor() {
    this.brandDirectoriesPath = path.join(__dirname, '../../../cars/brand_directories');
    this.loadAllBrandData();
    
    // Log deprecation warning
    serviceLogger.warn('carDataService instantiated - DEPRECATED', {
      trace: 'Use UnifiedCarService instead'
    });
  }

  private loadAllBrandData(): void {
    try {
      // Check if directory exists
      if (!fs.existsSync(this.brandDirectoriesPath)) {
        serviceLogger.warn('Brand directories path does not exist', {
          path: this.brandDirectoriesPath
        });
        return;
      }

      const brandDirs = fs.readdirSync(this.brandDirectoriesPath);
      
      for (const brandDir of brandDirs) {
        const brandPath = path.join(this.brandDirectoriesPath, brandDir);
        
        if (fs.statSync(brandPath).isDirectory()) {
          const brandData = this.loadBrandData(brandDir);
          if (brandData) {
            this.brandsData.set(brandDir.toLowerCase(), brandData);
          }
        }
      }
      
      serviceLogger.info('All brand data loaded (DEPRECATED)', {
        brandsCount: this.brandsData.size
      });
    } catch (error) {
      serviceLogger.error('Error loading all brand data', error as Error);
    }
  }

  private loadBrandData(brandDir: string): BrandData | null {
    try {
      const brandPath = path.join(this.brandDirectoriesPath, brandDir);
      const files = fs.readdirSync(brandPath);
      
      const brandData: BrandData = {
        name: brandDir,
        models: [],
        categories: new Set<string>() as any,
        generations: new Set<string>() as any,
        sizes: new Set<string>() as any,
        engineSizes: new Set<string>() as any,
        fuelTypes: new Set<string>() as any,
        transmissions: new Set<string>() as any,
        colors: new Set<string>() as any,
        years: new Set<number>() as any
      };
      
      for (const file of files) {
        if (file.endsWith('.txt')) {
          const filePath = path.join(brandPath, file);
          const content = fs.readFileSync(filePath, 'utf-8');
          const cars = this.parseCarDataFromContent(content, brandDir);
          
          brandData.models.push(...cars);
          
          // Collect unique values
          cars.forEach(car => {
            if (car.category) (brandData.categories as Set<string>).add(car.category);
            if (car.generation) (brandData.generations as Set<string>).add(car.generation);
            if (car.size) (brandData.sizes as Set<string>).add(car.size);
            if (car.engineSize) (brandData.engineSizes as Set<string>).add(car.engineSize);
            if (car.fuelType) (brandData.fuelTypes as Set<string>).add(car.fuelType);
            if (car.transmission) (brandData.transmissions as Set<string>).add(car.transmission);
            if (car.color) (brandData.colors as Set<string>).add(car.color);
            (brandData.years as Set<number>).add(car.year);
          });
        }
      }
      
      // Convert Sets to Arrays
      brandData.categories = Array.from(brandData.categories as Set<string>);
      brandData.generations = Array.from(brandData.generations as Set<string>);
      brandData.sizes = Array.from(brandData.sizes as Set<string>);
      brandData.engineSizes = Array.from(brandData.engineSizes as Set<string>);
      brandData.fuelTypes = Array.from(brandData.fuelTypes as Set<string>);
      brandData.transmissions = Array.from(brandData.transmissions as Set<string>);
      brandData.colors = Array.from(brandData.colors as Set<string>);
      brandData.years = Array.from(brandData.years as Set<number>).sort((a, b) => b - a);
      
      return brandData;
    } catch (error) {
      serviceLogger.error('Error loading brand data', error as Error, {
        brand: brandDir
      });
      return null;
    }
  }

  private parseCarDataFromContent(content: string, brandName: string): CarDataFromFile[] {
    const cars: CarDataFromFile[] = [];
    const lines = content.split('\n');

    let currentYear: number | null = null;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();

      // Check for year
      const yearMatch = line.match(/^(\d{4}):$/);
      if (yearMatch) {
        currentYear = parseInt(yearMatch[1]);
        continue;
      }

      // Check for car model
      if (line.startsWith('- ') && currentYear) {
        const modelName = line.substring(2).split('  ')[0].trim();

        // Collect all specs for this car (until next car or year)
        const specs: string[] = [];
        let j = i + 1;

        while (j < lines.length) {
          const nextLine = lines[j].trim();
          
          if (nextLine.startsWith('- ') || nextLine.match(/^\d{4}:$/)) {
            break;
          }
          
          if (nextLine && !nextLine.startsWith('//')) {
            specs.push(nextLine);
          }
          
          j++;
        }

        const car = this.parseCarSpecs(modelName, currentYear, brandName, specs);
        cars.push(car);
      }
    }

    return cars;
  }

  private parseCarSpecs(modelName: string, year: number, brand: string, specs: string[]): CarDataFromFile {
    const car: CarDataFromFile = {
      brand,
      year,
      model: modelName
    };

    // Parse each spec line
    for (const spec of specs) {
      const [key, value] = spec.split(':').map(s => s.trim());
      
      if (!value) continue;

      switch (key.toLowerCase()) {
        case 'engine':
          car.engine = value;
          break;
        case 'power':
          car.power = value;
          break;
        case 'transmission':
          car.transmission = value;
          break;
        case 'drivetrain':
          car.drivetrain = value;
          break;
        case 'body style':
          car.bodyStyle = value;
          break;
        case 'dimensions':
          car.dimensions = value;
          break;
        case 'weight':
          car.weight = value;
          break;
        case 'top speed':
          car.topSpeed = value;
          break;
        case '0-100 km/h':
          car.acceleration = value;
          break;
        case 'fuel economy':
          car.fuelEconomy = value;
          break;
        case 'price':
          car.price = value;
          break;
      }
    }

    // Add derived properties
    car.category = this.determineCategory(modelName);
    car.generation = this.determineGeneration(modelName, year);
    car.condition = 'New'; // Default to new cars from data
    car.bodyStyle = this.determineBodyStyle(modelName);

    return car;
  }

  private determineCategory(modelName: string): string {
    const lowerModel = modelName.toLowerCase();
    
    if (lowerModel.includes('suv') || lowerModel.includes('x')) {
      return 'SUV';
    } else if (lowerModel.includes('sedan') || lowerModel.includes('series')) {
      return 'Sedan';
    } else if (lowerModel.includes('coupe')) {
      return 'Coupe';
    } else if (lowerModel.includes('wagon') || lowerModel.includes('touring')) {
      return 'Wagon';
    } else if (lowerModel.includes('convertible') || lowerModel.includes('cabrio')) {
      return 'Convertible';
    } else {
      return 'Other';
    }
  }

  private determineGeneration(modelName: string, year: number): string {
    // Determine generation based on year and model
    if (year >= 2020) {
      return 'Latest Generation';
    } else if (year >= 2015) {
      return 'Current Generation';
    } else if (year >= 2010) {
      return 'Previous Generation';
    } else {
      return 'Older Generation';
    }
  }

  private determineBodyStyle(modelName: string): string {
    const lowerModel = modelName.toLowerCase();
    
    if (lowerModel.includes('suv')) {
      return 'SUV';
    } else if (lowerModel.includes('sedan')) {
      return 'Sedan';
    } else if (lowerModel.includes('coupe')) {
      return 'Coupe';
    } else if (lowerModel.includes('wagon')) {
      return 'Wagon';
    } else if (lowerModel.includes('hatchback')) {
      return 'Hatchback';
    } else if (lowerModel.includes('convertible')) {
      return 'Convertible';
    } else {
      return 'Other';
    }
  }

  // Public methods for searching
  /** @deprecated Use unifiedCarService.searchCars() instead */
  getAllBrands(): string[] {
    serviceLogger.warn('DEPRECATED: getAllBrands() called');
    return Array.from(this.brandsData.keys());
  }

  /** @deprecated Use unifiedCarService.searchCars() instead */
  getBrandData(brand: string): BrandData | undefined {
    serviceLogger.warn('DEPRECATED: getBrandData() called', { brand });
    return this.brandsData.get(brand.toLowerCase());
  }

  /** @deprecated Use unifiedCarService.searchCars() instead */
  searchCars(query: {
    brand?: string;
    year?: number;
    category?: string;
    minPrice?: number;
    maxPrice?: number;
  }): CarDataFromFile[] {
    serviceLogger.warn('DEPRECATED: searchCars() called', { query });
    let results: CarDataFromFile[] = [];

    // Get all cars from all brands
    for (const brandData of this.brandsData.values()) {
      results.push(...brandData.models);
    }

    // Apply filters
    if (query.brand) {
      results = results.filter(car => 
        car.brand.toLowerCase() === query.brand?.toLowerCase()
      );
    }

    if (query.year) {
      results = results.filter(car => car.year === query.year);
    }

    if (query.category) {
      results = results.filter(car => car.category === query.category);
    }

    return results;
  }

  /** @deprecated Use unifiedCarService.searchCars() instead */
  getCarsByBrand(brand: string): CarDataFromFile[] {
    serviceLogger.warn('DEPRECATED: getCarsByBrand() called', { brand });
    const brandData = this.getBrandData(brand);
    return brandData ? brandData.models : [];
  }

  /** @deprecated Use CAR_DATA from @/constants/carData instead */
  getCategoriesForBrand(brand: string): string[] {
    serviceLogger.warn('DEPRECATED: getCategoriesForBrand() called', { brand });
    const brandData = this.getBrandData(brand);
    return brandData ? brandData.categories : [];
  }

  /** @deprecated Use CAR_DATA from @/constants/carData instead */
  getGenerationsForBrand(brand: string): string[] {
    serviceLogger.warn('DEPRECATED: getGenerationsForBrand() called', { brand });
    const brandData = this.getBrandData(brand);
    return brandData ? brandData.generations : [];
  }

  /** @deprecated Use CAR_DATA from @/constants/carData instead */
  getSizesForBrand(brand: string): string[] {
    serviceLogger.warn('DEPRECATED: getSizesForBrand() called', { brand });
    const brandData = this.getBrandData(brand);
    return brandData ? brandData.sizes : [];
  }
}

// Export singleton instance
/** @deprecated Use unifiedCarService from @/services/car/unified-car.service instead */
export const carDataService = new CarDataService();
