import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';
import { serviceLogger } from './logger-wrapper';

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
  }

  private loadAllBrandData(): void {
    try {
      if (!fs.existsSync(this.brandDirectoriesPath)) {
        serviceLogger.warn('Brand directories not found', { path: this.brandDirectoriesPath });
        return;
      }

      const brandDirs = fs.readdirSync(this.brandDirectoriesPath)
        .filter(item => fs.statSync(path.join(this.brandDirectoriesPath, item)).isDirectory());

      for (const brandDir of brandDirs) {
        try {
          const brandData = this.loadBrandData(brandDir);
          if (brandData) {
            this.brandsData.set(brandDir.toLowerCase(), brandData);
          }
        } catch (error) {
          serviceLogger.error('Error loading brand', error as Error, { brandDir });
        }
      }
    } catch (error) {
      serviceLogger.error('[SERVICE] Error loading brand data', error as Error);
    }
  }

  private loadBrandData(brandDir: string): BrandData | null {
    const brandPath = path.join(this.brandDirectoriesPath, brandDir);

    // Find the .txt file in the brand directory
    const files = fs.readdirSync(brandPath)
      .filter(file => file.endsWith('.txt'));

    if (files.length === 0) {
      return null;
    }

    const txtFile = files[0]; // Take the first .txt file
    const filePath = path.join(brandPath, txtFile);

    try {
      const content = fs.readFileSync(filePath, 'utf8');
      const cars = this.parseCarDataFromContent(content, brandDir);

      // Extract unique values for filters
      const categories = Array.from(new Set(cars.map(car => car.category).filter((cat): cat is string => Boolean(cat))));
      const generations = Array.from(new Set(cars.map(car => car.generation).filter((gen): gen is string => Boolean(gen))));
      const sizes = Array.from(new Set(cars.map(car => car.size).filter((size): size is string => Boolean(size))));
      const engineSizes = Array.from(new Set(cars.map(car => car.engineSize).filter((size): size is string => Boolean(size))));
      const fuelTypes = Array.from(new Set(cars.map(car => car.fuelType).filter((type): type is string => Boolean(type))));
      const transmissions = Array.from(new Set(cars.map(car => car.transmission).filter((trans): trans is string => Boolean(trans))));
      const colors = Array.from(new Set(cars.map(car => car.color).filter((color): color is string => Boolean(color))));
      const years = Array.from(new Set(cars.map(car => car.year))).sort((a, b) => b - a);

      return {
        name: brandDir,
        models: cars,
        categories,
        generations,
        sizes,
        engineSizes,
        fuelTypes,
        transmissions,
        colors,
        years
      };
    } catch (error) {
      serviceLogger.error('Error parsing file', error as Error, { txtFile, brandDir });
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
          if (nextLine.includes(': ')) {
            specs.push(nextLine);
          }
          j++;
        }

        const carData = this.parseCarSpecs(modelName, currentYear, brandName, specs);
        cars.push(carData);

        i = j - 1; // Skip processed lines
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

    for (const spec of specs) {
      const [key, ...valueParts] = spec.split(': ');
      const value = valueParts.join(': ').trim();

      switch (key.toLowerCase()) {
        case 'engine':
          car.engine = value;
          // Extract fuel type and engine size
          if (value.toLowerCase().includes('electric')) {
            car.fuelType = 'Electric';
          } else if (value.toLowerCase().includes('diesel')) {
            car.fuelType = 'Diesel';
          } else if (value.toLowerCase().includes('petrol') || value.toLowerCase().includes('gasoline')) {
            car.fuelType = 'Petrol';
          } else if (value.toLowerCase().includes('hybrid')) {
            car.fuelType = 'Hybrid';
          }

          // Extract engine size
          const sizeMatch = value.match(/(\d+\.?\d*)\s*l(?:itre|iter)?/i);
          if (sizeMatch) {
            car.engineSize = sizeMatch[1] + 'L';
          }

          // Extract cylinders
          const cylinderMatch = value.match(/(\d+)-cylinder/i);
          if (cylinderMatch) {
            car.cylinders = parseInt(cylinderMatch[1]);
          }
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

        case 'dimensions':
          car.dimensions = value;
          // Try to determine size from dimensions
          if (value.includes('4,') || value.includes('5,')) {
            car.size = 'Large';
          } else if (value.includes('3,') || value.includes('4,')) {
            car.size = 'Medium';
          } else {
            car.size = 'Compact';
          }
          break;

        case 'weight':
          car.weight = value;
          break;

        case 'top speed':
          car.topSpeed = value;
          break;

        case 'acceleration':
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

    // Determine category based on model name
    car.category = this.determineCategory(modelName);
    car.generation = this.determineGeneration(modelName, year);
    car.condition = 'New'; // Default to new cars from data
    car.bodyStyle = this.determineBodyStyle(modelName);

    return car;
  }

  private determineCategory(modelName: string): string {
    const name = modelName.toLowerCase();

    if (name.includes('x1') || name.includes('x2') || name.includes('x3') || name.includes('x4') || name.includes('x5') || name.includes('x6') || name.includes('x7')) {
      return 'SUV';
    } else if (name.includes('3') || name.includes('5') || name.includes('7')) {
      return 'Sedan';
    } else if (name.includes('m2') || name.includes('m3') || name.includes('m4') || name.includes('m5') || name.includes('m6')) {
      return 'Sports Car';
    } else if (name.includes('i3') || name.includes('i8') || name.includes('ix')) {
      return 'Electric';
    } else if (name.includes('coupe') || name.includes('cabrio')) {
      return 'Coupe';
    } else if (name.includes('touring') || name.includes('wagon')) {
      return 'Wagon';
    }

    return 'Other';
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
    const name = modelName.toLowerCase();

    if (name.includes('coupe') || name.includes('coupé')) {
      return 'Coupe';
    } else if (name.includes('cabrio') || name.includes('convertible')) {
      return 'Convertible';
    } else if (name.includes('suv') || name.includes('x')) {
      return 'SUV';
    } else if (name.includes('sedan') || name.includes('saloon')) {
      return 'Sedan';
    } else if (name.includes('hatchback')) {
      return 'Hatchback';
    } else if (name.includes('wagon') || name.includes('touring')) {
      return 'Wagon';
    } else if (name.includes('pickup') || name.includes('truck')) {
      return 'Pickup';
    } else if (name.includes('van') || name.includes('minibus')) {
      return 'Van';
    }

    return 'Other';
  }

  // Public methods for searching
  getAllBrands(): string[] {
    return Array.from(this.brandsData.keys()).sort();
  }

  getBrandData(brand: string): BrandData | null {
    return this.brandsData.get(brand.toLowerCase()) || null;
  }

  getAllCategories(): string[] {
    const categories = new Set<string>();
    this.brandsData.forEach(brand => {
      brand.categories.forEach(cat => categories.add(cat));
    });
    return Array.from(categories).sort();
  }

  getAllGenerations(): string[] {
    const generations = new Set<string>();
    this.brandsData.forEach(brand => {
      brand.generations.forEach(gen => generations.add(gen));
    });
    return Array.from(generations).sort();
  }

  getAllSizes(): string[] {
    const sizes = new Set<string>();
    this.brandsData.forEach(brand => {
      brand.sizes.forEach(size => sizes.add(size));
    });
    return Array.from(sizes).sort();
  }

  getAllEngineSizes(): string[] {
    const engineSizes = new Set<string>();
    this.brandsData.forEach(brand => {
      brand.engineSizes.forEach(size => engineSizes.add(size));
    });
    return Array.from(engineSizes).sort();
  }

  getAllFuelTypes(): string[] {
    const fuelTypes = new Set<string>();
    this.brandsData.forEach(brand => {
      brand.fuelTypes.forEach(type => fuelTypes.add(type));
    });
    return Array.from(fuelTypes).sort();
  }

  getAllTransmissions(): string[] {
    const transmissions = new Set<string>();
    this.brandsData.forEach(brand => {
      brand.transmissions.forEach(trans => transmissions.add(trans));
    });
    return Array.from(transmissions).sort();
  }

  getAllColors(): string[] {
    const colors = new Set<string>();
    this.brandsData.forEach(brand => {
      brand.colors.forEach(color => colors.add(color));
    });
    return Array.from(colors).sort();
  }

  getAllYears(): number[] {
    const years = new Set<number>();
    this.brandsData.forEach(brand => {
      brand.years.forEach(year => years.add(year));
    });
    return Array.from(years).sort((a, b) => b - a);
  }

  // Search methods
  searchCars(query: string = '', filters: any = {}): CarDataFromFile[] {
    let results: CarDataFromFile[] = [];

    // Collect all cars from all brands
    this.brandsData.forEach(brand => {
      results.push(...brand.models);
    });

    // Apply text search
    if (query.trim()) {
      const searchTerm = query.toLowerCase();
      results = results.filter(car =>
        car.brand.toLowerCase().includes(searchTerm) ||
        car.model.toLowerCase().includes(searchTerm) ||
        car.engine?.toLowerCase().includes(searchTerm) ||
        car.power?.toLowerCase().includes(searchTerm) ||
        car.transmission?.toLowerCase().includes(searchTerm) ||
        car.category?.toLowerCase().includes(searchTerm) ||
        car.generation?.toLowerCase().includes(searchTerm)
      );
    }

    // Apply filters
    if (filters.brand) {
      results = results.filter(car => car.brand.toLowerCase() === filters.brand.toLowerCase());
    }

    if (filters.category) {
      results = results.filter(car => car.category === filters.category);
    }

    if (filters.generation) {
      results = results.filter(car => car.generation === filters.generation);
    }

    if (filters.size) {
      results = results.filter(car => car.size === filters.size);
    }

    if (filters.engineSize) {
      results = results.filter(car => car.engineSize === filters.engineSize);
    }

    if (filters.fuelType) {
      results = results.filter(car => car.fuelType === filters.fuelType);
    }

    if (filters.transmission) {
      results = results.filter(car => car.transmission?.toLowerCase().includes(filters.transmission.toLowerCase()));
    }

    if (filters.year) {
      results = results.filter(car => car.year === parseInt(filters.year));
    }

    if (filters.minYear) {
      results = results.filter(car => car.year >= parseInt(filters.minYear));
    }

    if (filters.maxYear) {
      results = results.filter(car => car.year <= parseInt(filters.maxYear));
    }

    return results;
  }

  // Get cars by brand
  getCarsByBrand(brand: string): CarDataFromFile[] {
    const brandData = this.getBrandData(brand);
    return brandData ? brandData.models : [];
  }

  // Get categories for a specific brand
  getCategoriesForBrand(brand: string): string[] {
    const brandData = this.getBrandData(brand);
    return brandData ? brandData.categories : [];
  }

  // Get generations for a specific brand
  getGenerationsForBrand(brand: string): string[] {
    const brandData = this.getBrandData(brand);
    return brandData ? brandData.generations : [];
  }

  // Get sizes for a specific brand
  getSizesForBrand(brand: string): string[] {
    const brandData = this.getBrandData(brand);
    return brandData ? brandData.sizes : [];
  }

  // Get engine sizes for a specific brand
  getEngineSizesForBrand(brand: string): string[] {
    const brandData = this.getBrandData(brand);
    return brandData ? brandData.engineSizes : [];
  }
}

// Export singleton instance
export const carDataService = new CarDataService();