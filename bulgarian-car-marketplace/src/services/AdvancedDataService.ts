import { CarDataFromFile, CarDataSummary, AdvancedSearchParams, AvailableFilterOptions } from '@/types/CarData';
import { BULGARIAN_CITIES } from '@/constants/bulgarianCities';
import { logger } from './logger-service';

class AdvancedDataService {
  private carData: CarDataFromFile[] = [];
  private summary: CarDataSummary | null = null;
  private searchCache: Map<string, CarDataFromFile[]> = new Map();

  // Realistic mock data for Bulgarian market
  private mockData: CarDataFromFile[] = [
    {
      id: '1',
      brand: 'Volkswagen',
      model: 'Golf',
      year: 2020,
      price: 28500,
      currency: 'EUR',
      mileage: 45000,
      fuelType: 'petrol',
      transmission: 'manual',
      engineSize: 1.5,
      power: 150,
      powerUnit: 'hp',
      doors: 5,
      seats: 5,
      color: 'черен',
      condition: 'used',
      location: 'София',
      country: 'BG',
      description: 'Отлично състояние, пълна сервизна история, без инциденти. Комбиниран разход: 5.8l/100km.',
      features: ['климатик', 'кожен салон', 'камера за backup', 'ABS', 'ESP'],
      images: ['golf1.jpg', 'golf2.jpg'],
      sellerType: 'dealer',
      dealerRating: 4.5,
      createdAt: '2024-01-15'
    },
    {
      id: '2',
      brand: 'BMW',
      model: '320d',
      year: 2019,
      price: 32500,
      currency: 'EUR',
      mileage: 68000,
      fuelType: 'diesel',
      transmission: 'automatic',
      engineSize: 2.0,
      power: 190,
      powerUnit: 'hp',
      doors: 4,
      seats: 5,
      color: 'бял',
      condition: 'used',
      location: 'Пловдив',
      country: 'BG',
      description: 'Много добре поддържан BMW 320d с пълна екипировка.',
      features: ['навигация', 'кожен салон', 'панорамен покрив', 'LED фарове'],
      images: ['bmw1.jpg', 'bmw2.jpg'],
      sellerType: 'private',
      createdAt: '2024-01-14'
    },
    {
      id: '3',
      brand: 'Mercedes-Benz',
      model: 'C-Class',
      year: 2021,
      price: 42000,
      currency: 'EUR',
      mileage: 25000,
      fuelType: 'petrol',
      transmission: 'automatic',
      engineSize: 2.0,
      power: 258,
      powerUnit: 'hp',
      doors: 4,
      seats: 5,
      color: 'сив',
      condition: 'used',
      location: 'Варна',
      country: 'BG',
      description: 'Mercedes-Benz C200 с отлична поддръжка и гаранция.',
      features: ['климатик', 'навигация', 'кожен салон', 'камера 360°', 'автопилот'],
      images: ['merc1.jpg', 'merc2.jpg'],
      sellerType: 'dealer',
      dealerRating: 4.8,
      createdAt: '2024-01-13'
    },
    {
      id: '4',
      brand: 'Audi',
      model: 'A4',
      year: 2018,
      price: 26500,
      currency: 'EUR',
      mileage: 85000,
      fuelType: 'diesel',
      transmission: 'automatic',
      engineSize: 2.0,
      power: 190,
      powerUnit: 'hp',
      doors: 4,
      seats: 5,
      color: 'син',
      condition: 'used',
      location: 'Бургас',
      country: 'BG',
      description: 'Audi A4 с отлична история и пълна екипировка.',
      features: ['климатик', 'навигация', 'кожен салон', 'xenon фарове'],
      images: ['audi1.jpg', 'audi2.jpg'],
      sellerType: 'private',
      createdAt: '2024-01-12'
    },
    {
      id: '5',
      brand: 'Toyota',
      model: 'Corolla',
      year: 2022,
      price: 19500,
      currency: 'EUR',
      mileage: 15000,
      fuelType: 'petrol',
      transmission: 'manual',
      engineSize: 1.6,
      power: 132,
      powerUnit: 'hp',
      doors: 4,
      seats: 5,
      color: 'бял',
      condition: 'used',
      location: 'Русе',
      country: 'BG',
      description: 'Нова Toyota Corolla с гаранция и отлична икономичност.',
      features: ['климатик', 'радио', 'електрически стъкла', 'централно заключване'],
      images: ['toyota1.jpg', 'toyota2.jpg'],
      sellerType: 'dealer',
      dealerRating: 4.2,
      createdAt: '2024-01-11'
    }
  ];

  async loadData(): Promise<void> {
    try {
      // Attempt to load real data first
      const [carDataResponse, summaryResponse] = await Promise.allSettled([
        fetch('/data/car-data.json'),
        fetch('/data/car-data-summary.json')
      ]);

      if (carDataResponse.status === 'fulfilled') {
        this.carData = await carDataResponse.value.json();
      } else {
        // Use mock data if loading fails
        this.carData = this.mockData;
      }

      if (summaryResponse.status === 'fulfilled') {
        this.summary = await summaryResponse.value.json();
      } else {
        this.summary = this.generateSummary();
      }

      this.preprocessData();
    } catch (error) {
      logger.error('[SERVICE] Error loading car data, using mock data', error as Error, { 
        mockDataCount: this.mockData.length 
      });
      this.carData = this.mockData;
      this.summary = this.generateSummary();
      this.preprocessData();
    }
  }

  private generateSummary(): CarDataSummary {
    return {
      totalCars: this.carData.length,
      brands: new Set(this.carData.map(car => car.brand)).size,
      models: new Set(this.carData.map(car => car.model)).size,
      minPrice: Math.min(...this.carData.map(car => car.price)),
      maxPrice: Math.max(...this.carData.map(car => car.price)),
      minYear: Math.min(...this.carData.map(car => car.year)),
      maxYear: Math.max(...this.carData.map(car => car.year)),
      currency: 'EUR',
      country: 'BG',
      lastUpdated: new Date().toISOString()
    };
  }

  private preprocessData(): void {
    // Optimize data for searching
    this.carData.forEach(car => {
      car.features = car.features || [];
      // Add additional search metadata
      car.features.push(
        `${car.brand} ${car.model}`,
        `${car.year}`,
        `${car.fuelType}`,
        `${car.transmission}`
      );
    });
  }

  advancedSearch(params: AdvancedSearchParams): CarDataFromFile[] {
    const cacheKey = JSON.stringify(params);

    if (this.searchCache.has(cacheKey)) {
      return this.searchCache.get(cacheKey)!;
    }

    let results = [...this.carData];

    // (Comment removed - was in Arabic)
    results = this.applyMakeFilter(results, params.make);
    results = this.applyModelFilter(results, params.model);
    results = this.applyPriceFilter(results, params.minPrice, params.maxPrice);
    results = this.applyYearFilter(results, params.minFirstRegistration, params.maxFirstRegistration);
    results = this.applyMileageFilter(results, params.minMileage, params.maxMileage);
    results = this.applyFuelTypeFilter(results, params.fuelType);
    results = this.applyTransmissionFilter(results, params.transmission);
    results = this.applyLocationFilter(results, params.city, params.radius);
    results = this.applyVehicleTypeFilter(results, params.vehicleType);
    results = this.applyConditionFilter(results, params.condition);
    results = this.applySeatsFilter(results, params.minSeats, params.maxSeats);
    results = this.applyDoorsFilter(results, params.doors);
    results = this.applyPowerFilter(results, params.minPower, params.maxPower, params.powerUnit);
    results = this.applyEngineSizeFilter(results, params.minEngineSize, params.maxEngineSize);
    results = this.applyFeaturesFilter(results, params);

    this.searchCache.set(cacheKey, results);
    return results;
  }

  private applyMakeFilter(results: CarDataFromFile[], make: string): CarDataFromFile[] {
    if (!make) return results;
    return results.filter(car =>
      car.brand.toLowerCase() === make.toLowerCase()
    );
  }

  private applyModelFilter(results: CarDataFromFile[], model: string): CarDataFromFile[] {
    if (!model) return results;
    return results.filter(car =>
      car.model.toLowerCase().includes(model.toLowerCase())
    );
  }

  private applyPriceFilter(results: CarDataFromFile[], minPrice: string, maxPrice: string): CarDataFromFile[] {
    let filtered = results;

    if (minPrice) {
      const min = parseFloat(minPrice);
      filtered = filtered.filter(car => car.price >= min);
    }

    if (maxPrice) {
      const max = parseFloat(maxPrice);
      filtered = filtered.filter(car => car.price <= max);
    }

    return filtered;
  }

  private applyYearFilter(results: CarDataFromFile[], minYear: string, maxYear: string): CarDataFromFile[] {
    let filtered = results;

    if (minYear) {
      const min = parseInt(minYear);
      filtered = filtered.filter(car => car.year >= min);
    }

    if (maxYear) {
      const max = parseInt(maxYear);
      filtered = filtered.filter(car => car.year <= max);
    }

    return filtered;
  }

  private applyMileageFilter(results: CarDataFromFile[], minMileage: string, maxMileage: string): CarDataFromFile[] {
    let filtered = results;

    if (minMileage) {
      const min = parseInt(minMileage);
      filtered = filtered.filter(car => car.mileage >= min);
    }

    if (maxMileage) {
      const max = parseInt(maxMileage);
      filtered = filtered.filter(car => car.mileage <= max);
    }

    return filtered;
  }

  private applyFuelTypeFilter(results: CarDataFromFile[], fuelTypes: string[]): CarDataFromFile[] {
    if (!fuelTypes || fuelTypes.length === 0) return results;
    return results.filter(car => fuelTypes.includes(car.fuelType));
  }

  private applyTransmissionFilter(results: CarDataFromFile[], transmissions: string[]): CarDataFromFile[] {
    if (!transmissions || transmissions.length === 0) return results;
    return results.filter(car => transmissions.includes(car.transmission));
  }

  private applyLocationFilter(results: CarDataFromFile[], city: string, radius: string): CarDataFromFile[] {
    if (!city) return results;

    // (Comment removed - was in Arabic)
    return results.filter(car =>
      car.location.toLowerCase().includes(city.toLowerCase())
    );
  }

  private applyVehicleTypeFilter(results: CarDataFromFile[], vehicleTypes: string[]): CarDataFromFile[] {
    if (!vehicleTypes || vehicleTypes.length === 0) return results;

    return results.filter(car => {
      const carType = this.determineVehicleType(car);
      return vehicleTypes.includes(carType);
    });
  }

  private applyConditionFilter(results: CarDataFromFile[], conditions: string[]): CarDataFromFile[] {
    if (!conditions || conditions.length === 0) return results;
    return results.filter(car => conditions.includes(car.condition));
  }

  private applySeatsFilter(results: CarDataFromFile[], minSeats: string, maxSeats: string): CarDataFromFile[] {
    let filtered = results;

    if (minSeats) {
      const min = parseInt(minSeats);
      filtered = filtered.filter(car => car.seats >= min);
    }

    if (maxSeats) {
      const max = parseInt(maxSeats);
      filtered = filtered.filter(car => car.seats <= max);
    }

    return filtered;
  }

  private applyDoorsFilter(results: CarDataFromFile[], doors: string): CarDataFromFile[] {
    if (!doors) return results;
    return results.filter(car => car.doors === parseInt(doors));
  }

  private applyPowerFilter(results: CarDataFromFile[], minPower: string, maxPower: string, powerUnit: 'hp' | 'kw'): CarDataFromFile[] {
    let filtered = results;

    if (minPower) {
      const min = parseInt(minPower);
      filtered = filtered.filter(car => {
        const power = powerUnit === 'kw' ? this.convertHpToKw(car.power) : car.power;
        return power >= min;
      });
    }

    if (maxPower) {
      const max = parseInt(maxPower);
      filtered = filtered.filter(car => {
        const power = powerUnit === 'kw' ? this.convertHpToKw(car.power) : car.power;
        return power <= max;
      });
    }

    return filtered;
  }

  private applyEngineSizeFilter(results: CarDataFromFile[], minEngineSize: string, maxEngineSize: string): CarDataFromFile[] {
    let filtered = results;

    if (minEngineSize) {
      const min = parseFloat(minEngineSize);
      filtered = filtered.filter(car => car.engineSize >= min);
    }

    if (maxEngineSize) {
      const max = parseFloat(maxEngineSize);
      filtered = filtered.filter(car => car.engineSize <= max);
    }

    return filtered;
  }

  private applyFeaturesFilter(results: CarDataFromFile[], params: AdvancedSearchParams): CarDataFromFile[] {
    let filtered = results;

    // (Comment removed - was in Arabic)
    if (params.withPictures) {
      filtered = filtered.filter(car => car.images && car.images.length > 0);
    }

    if (params.vatReclaimable) {
      filtered = filtered.filter(car =>
        car.features.some(f => f.toLowerCase().includes('ддс'))
      );
    }

    if (params.warranty) {
      filtered = filtered.filter(car =>
        car.features.some(f => f.toLowerCase().includes('гаранция'))
      );
    }

    if (params.nonSmoker) {
      filtered = filtered.filter(car =>
        car.features.some(f => f.toLowerCase().includes('непушач'))
      );
    }

    return filtered;
  }

  private determineVehicleType(car: CarDataFromFile): string {
    // (Comment removed - was in Arabic)
    if (car.doors === 2) return 'coupe';
    if (car.seats >= 7) return 'van';
    if (car.model.toLowerCase().includes('suv') || car.model.toLowerCase().includes('x5')) return 'suv';
    return 'sedan';
  }

  private convertHpToKw(hp: number): number {
    return Math.round(hp * 0.7457);
  }

  getAvailableOptions(): AvailableFilterOptions {
    const brands = [...new Set(this.carData.map(car => car.brand))].sort();
    const models = [...new Set(this.carData.map(car => car.model))].sort();

    const modelsByMake: Record<string, string[]> = {};
    brands.forEach(brand => {
      modelsByMake[brand] = [...new Set(
        this.carData.filter(car => car.brand === brand).map(car => car.model)
      )].sort();
    });

    return {
      makes: brands,
      models: models,
      modelsByMake: modelsByMake,
      vehicleTypes: [
        { value: 'sedan', label: 'Седан', labelBg: 'Седан' },
        { value: 'suv', label: 'SUV', labelBg: 'Джип' },
        { value: 'coupe', label: 'Coupe', labelBg: 'Купе' },
        { value: 'van', label: 'Van', labelBg: 'Ван' },
        { value: 'cabrio', label: 'Cabrio', labelBg: 'Кабрио' }
      ],
      conditions: [
        { value: 'new', label: 'New', labelBg: 'Нов' },
        { value: 'used', label: 'Used', labelBg: 'Употребяван' },
        { value: 'pre-registration', label: 'Pre-registered', labelBg: 'Пререгистрация' }
      ],
      // ✅ FIXED: Use BULGARIAN_CITIES constant instead of hardcoded
      cities: BULGARIAN_CITIES.map(city => city.nameBg),
      fuelTypes: [
        { value: 'petrol', label: 'Petrol', labelBg: 'Бензин' },
        { value: 'diesel', label: 'Diesel', labelBg: 'Дизел' },
        { value: 'electric', label: 'Electric', labelBg: 'Електрически' },
        { value: 'hybrid', label: 'Hybrid', labelBg: 'Хибриден' }
      ],
      transmissions: [
        { value: 'manual', label: 'Manual', labelBg: 'Ръчна' },
        { value: 'automatic', label: 'Automatic', labelBg: 'Автоматична' },
        { value: 'semi-automatic', label: 'Semi-automatic', labelBg: 'Полуавтоматична' }
      ],
      colors: [
        { value: 'черен', label: 'Black', labelBg: 'Черен' },
        { value: 'бял', label: 'White', labelBg: 'Бял' },
        { value: 'сив', label: 'Gray', labelBg: 'Сив' },
        { value: 'син', label: 'Blue', labelBg: 'Син' },
        { value: 'червен', label: 'Red', labelBg: 'Червен' }
      ],
      features: [
        { value: 'климатик', label: 'Air conditioning', labelBg: 'Климатик' },
        { value: 'навигация', label: 'Navigation', labelBg: 'Навигация' },
        { value: 'кожен салон', label: 'Leather interior', labelBg: 'Кожен салон' },
        { value: 'камера', label: 'Camera', labelBg: 'Камера' }
      ]
    };
  }

  getSearchSuggestions(query: string): string[] {
    if (query.length < 2) return [];

    const suggestions = new Set<string>();

    this.carData.forEach(car => {
      if (car.brand.toLowerCase().includes(query.toLowerCase())) {
        suggestions.add(car.brand);
      }
      if (car.model.toLowerCase().includes(query.toLowerCase())) {
        suggestions.add(`${car.brand} ${car.model}`);
      }
      car.features.forEach(feature => {
        if (feature.toLowerCase().includes(query.toLowerCase())) {
          suggestions.add(feature);
        }
      });
    });

    return Array.from(suggestions).slice(0, 10); // حد 10 اقتراحات
  }

  clearCache(): void {
    this.searchCache.clear();
  }

  getSummary(): CarDataSummary | null {
    return this.summary;
  }
}

export const advancedDataService = new AdvancedDataService();