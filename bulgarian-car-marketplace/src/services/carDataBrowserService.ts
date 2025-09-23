import { CarDataFromFile, CarDataSummary, SearchFilters } from '../types/CarData';

// Bulgarian Car Data Browser Service
// Enhanced with caching and advanced search capabilities

class CarDataBrowserService {
  private carData: CarDataFromFile[] = [];
  private summary: CarDataSummary | null = null;
  private searchCache: Map<string, CarDataFromFile[]> = new Map();
  private isLoaded = false;

  // Load data from JSON files
  async loadData(): Promise<void> {
    if (this.isLoaded) return;

    try {
      // Load car data and summary in parallel
      const [carDataResponse, summaryResponse] = await Promise.all([
        fetch('/car-data.json'),
        fetch('/car-data-summary.json')
      ]);

      if (!carDataResponse.ok || !summaryResponse.ok) {
        throw new Error('Failed to load car data files');
      }

      this.carData = await carDataResponse.json();
      this.summary = await summaryResponse.json();

      // Preprocess data for Bulgarian market
      this.preprocessBulgarianData();

      this.isLoaded = true;
    } catch (error) {
      console.error('Error loading Bulgarian car data:', error);
      throw error;
    }
  }

  private preprocessBulgarianData(): void {
    // Ensure all cars have Bulgarian-specific properties
    this.carData.forEach((car, index) => {
      // Generate ID if missing
      if (!car.id) {
        car.id = `bg-car-${index + 1}`;
      }

      // Ensure Bulgarian currency
      car.currency = 'EUR';

      // Ensure Bulgarian country
      car.country = 'BG';

      // Ensure features array exists
      car.features = car.features || [];

      // Ensure images array exists
      car.images = car.images || [];

      // Ensure createdAt exists
      car.createdAt = car.createdAt || new Date().toISOString();
    });
  }

  // Quick search with caching
  searchCars(query: string = '', filters: SearchFilters = {}): CarDataFromFile[] {
    const cacheKey = JSON.stringify({ query, filters });

    if (this.searchCache.has(cacheKey)) {
      return this.searchCache.get(cacheKey)!;
    }

    let results = [...this.carData];

    // Apply text search
    if (query.trim()) {
      const searchTerm = query.toLowerCase();
      results = results.filter(car =>
        car.brand.toLowerCase().includes(searchTerm) ||
        car.model.toLowerCase().includes(searchTerm) ||
        car.description?.toLowerCase().includes(searchTerm) ||
        car.location.toLowerCase().includes(searchTerm) ||
        car.features.some(feature =>
          feature.toLowerCase().includes(searchTerm)
        )
      );
    }

    // Apply filters
    results = this.applyFilters(results, filters);

    // Apply sorting
    if (filters.sortBy) {
      results = this.sortResults(results, filters.sortBy);
    }

    // Cache results
    this.searchCache.set(cacheKey, results);
    return results;
  }

  // Advanced search with comprehensive filtering
  advancedSearch(params: any): CarDataFromFile[] {
    const cacheKey = JSON.stringify(params);

    if (this.searchCache.has(cacheKey)) {
      return this.searchCache.get(cacheKey)!;
    }

    let results = [...this.carData];

    // Apply all advanced filters
    if (params.make) {
      results = results.filter(car =>
        car.brand.toLowerCase() === params.make.toLowerCase()
      );
    }

    if (params.model) {
      results = results.filter(car =>
        car.model.toLowerCase().includes(params.model.toLowerCase())
      );
    }

    if (params.vehicleType && params.vehicleType.length > 0) {
      results = results.filter(car =>
        params.vehicleType.includes(this.mapToVehicleType(car))
      );
    }

    if (params.minPrice) {
      const minPrice = parseFloat(params.minPrice);
      results = results.filter(car => car.price >= minPrice);
    }

    if (params.maxPrice) {
      const maxPrice = parseFloat(params.maxPrice);
      results = results.filter(car => car.price <= maxPrice);
    }

    if (params.minFirstRegistration) {
      const minYear = parseInt(params.minFirstRegistration);
      results = results.filter(car => car.year >= minYear);
    }

    if (params.maxFirstRegistration) {
      const maxYear = parseInt(params.maxFirstRegistration);
      results = results.filter(car => car.year <= maxYear);
    }

    if (params.fuelType && params.fuelType.length > 0) {
      results = results.filter(car =>
        params.fuelType.includes(car.fuelType)
      );
    }

    if (params.transmission && params.transmission.length > 0) {
      results = results.filter(car =>
        params.transmission.includes(car.transmission)
      );
    }

    if (params.city) {
      results = results.filter(car =>
        car.location.toLowerCase().includes(params.city.toLowerCase())
      );
    }

    if (params.condition && params.condition.length > 0) {
      results = results.filter(car =>
        params.condition.includes(car.condition)
      );
    }

    if (params.sellerType && params.sellerType.length > 0) {
      results = results.filter(car =>
        params.sellerType.includes(car.sellerType)
      );
    }

    if (params.withPictures) {
      results = results.filter(car =>
        car.images && car.images.length > 0
      );
    }

    // Cache results
    this.searchCache.set(cacheKey, results);
    return results;
  }

  private applyFilters(results: CarDataFromFile[], filters: SearchFilters): CarDataFromFile[] {
    if (filters.brand) {
      results = results.filter(car => car.brand.toLowerCase() === filters.brand!.toLowerCase());
    }

    if (filters.model) {
      results = results.filter(car => car.model.toLowerCase().includes(filters.model!.toLowerCase()));
    }

    if (filters.minPrice) {
      results = results.filter(car => car.price >= filters.minPrice!);
    }

    if (filters.maxPrice) {
      results = results.filter(car => car.price <= filters.maxPrice!);
    }

    if (filters.minYear) {
      results = results.filter(car => car.year >= filters.minYear!);
    }

    if (filters.maxYear) {
      results = results.filter(car => car.year <= filters.maxYear!);
    }

    if (filters.fuelType && filters.fuelType.length > 0) {
      results = results.filter(car => filters.fuelType!.includes(car.fuelType));
    }

    if (filters.transmission && filters.transmission.length > 0) {
      results = results.filter(car => filters.transmission!.includes(car.transmission));
    }

    if (filters.location) {
      results = results.filter(car =>
        car.location.toLowerCase().includes(filters.location!.toLowerCase())
      );
    }

    if (filters.condition && filters.condition.length > 0) {
      results = results.filter(car => filters.condition!.includes(car.condition));
    }

    if (filters.sellerType && filters.sellerType.length > 0) {
      results = results.filter(car => filters.sellerType!.includes(car.sellerType));
    }

    if (filters.withImages) {
      results = results.filter(car => car.images && car.images.length > 0);
    }

    return results;
  }

  private sortResults(results: CarDataFromFile[], sortBy: string): CarDataFromFile[] {
    switch (sortBy) {
      case 'price_asc':
        return results.sort((a, b) => a.price - b.price);
      case 'price_desc':
        return results.sort((a, b) => b.price - a.price);
      case 'year_asc':
        return results.sort((a, b) => a.year - b.year);
      case 'year_desc':
        return results.sort((a, b) => b.year - a.year);
      case 'mileage_asc':
        return results.sort((a, b) => a.mileage - b.mileage);
      case 'date_desc':
        return results.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      default:
        return results;
    }
  }

  private mapToVehicleType(car: CarDataFromFile): string {
    // Map Bulgarian car properties to vehicle types
    if (car.doors === 2 && car.seats <= 4) return 'sports';
    if (car.seats >= 7) return 'van';
    if (car.doors >= 5) return 'estate';
    if (car.transmission === 'automatic' && car.power > 200) return 'suv';
    // Default mappings based on Bulgarian market
    return 'saloon';
  }

  // Get all brands (sorted for Bulgarian market)
  getAllBrands(): string[] {
    return [...new Set(this.carData.map(car => car.brand))].sort();
  }

  // Get models by brand
  getModelsByBrand(brand: string): string[] {
    return [...new Set(this.carData
      .filter(car => car.brand.toLowerCase() === brand.toLowerCase())
      .map(car => car.model)
    )].sort();
  }

  // Get Bulgarian cities
  getBulgarianCities(): string[] {
    const cities = [...new Set(this.carData.map(car => car.location))];
    return cities.filter(city => city && city.trim() !== '').sort();
  }

  // Get summary
  getSummary(): CarDataSummary | null {
    return this.summary;
  }

  // Clear cache
  clearCache(): void {
    this.searchCache.clear();
  }

  // Check if data is loaded
  isDataLoaded(): boolean {
    return this.isLoaded;
  }

  // Get car by ID
  getCarById(id: string): CarDataFromFile | undefined {
    return this.carData.find(car => car.id === id);
  }
}

// Export singleton instance
export const carDataBrowserService = new CarDataBrowserService();

// Re-export types for convenience
export type { CarDataFromFile, CarDataSummary, SearchFilters } from '../types/CarData';