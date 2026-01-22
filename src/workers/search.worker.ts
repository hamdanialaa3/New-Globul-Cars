/**
 * Search Web Worker
 * Offloads heavy search filtering logic from main thread
 * Improves UI responsiveness during search operations
 * 
 * Features:
 * - Multi-threaded search processing
 * - Filter optimization
 * - Result ranking
 * - Memory-efficient operations
 */

import type { CarListing } from '../types/CarListing';

interface SearchMessage {
  type: 'SEARCH' | 'FILTER' | 'SORT';
  payload: any;
}

interface SearchParams {
  query?: string;
  filters?: {
    make?: string;
    model?: string;
    yearFrom?: number;
    yearTo?: number;
    priceFrom?: number;
    priceTo?: number;
    region?: string;
    fuelType?: string;
    transmission?: string;
  };
  sortBy?: 'price' | 'year' | 'mileage' | 'date';
  sortOrder?: 'asc' | 'desc';
}

/**
 * Filter cars based on search params
 */
function filterCars(cars: CarListing[], params: SearchParams): CarListing[] {
  let results = [...cars];
  
  // Text search
  if (params.query && params.query.length > 0) {
    const query = params.query.toLowerCase();
    results = results.filter((car: any) => {
      const searchText = `${car.make} ${car.model} ${car.year} ${car.description || ''}`.toLowerCase();
      return searchText.includes(query);
    });
  }
  
  // Filter by make
  if (params.filters?.make) {
    results = results.filter((car: any) => 
      car.make.toLowerCase() === params.filters!.make!.toLowerCase()
    );
  }
  
  // Filter by model
  if (params.filters?.model) {
    results = results.filter((car: any) => 
      car.model.toLowerCase().includes(params.filters!.model!.toLowerCase())
    );
  }
  
  // Filter by year range
  if (params.filters?.yearFrom) {
    results = results.filter((car: any) => car.year >= params.filters!.yearFrom!);
  }
  if (params.filters?.yearTo) {
    results = results.filter((car: any) => car.year <= params.filters!.yearTo!);
  }
  
  // Filter by price range
  if (params.filters?.priceFrom) {
    results = results.filter((car: any) => car.price >= params.filters!.priceFrom!);
  }
  if (params.filters?.priceTo) {
    results = results.filter((car: any) => car.price <= params.filters!.priceTo!);
  }
  
  // Filter by region
  if (params.filters?.region) {
    results = results.filter((car: any) => 
      car.region?.toLowerCase() === params.filters!.region!.toLowerCase()
    );
  }
  
  // Filter by fuel type
  if (params.filters?.fuelType) {
    results = results.filter((car: any) => 
      car.fuelType?.toLowerCase() === params.filters!.fuelType!.toLowerCase()
    );
  }
  
  // Filter by transmission
  if (params.filters?.transmission) {
    results = results.filter((car: any) => 
      car.transmission?.toLowerCase() === params.filters!.transmission!.toLowerCase()
    );
  }
  
  return results;
}

/**
 * Sort cars based on criteria
 */
function sortCars(cars: CarListing[], sortBy: string, sortOrder: string): CarListing[] {
  const sorted = [...cars];
  
  sorted.sort((a, b) => {
    let comparison = 0;
    
    switch (sortBy) {
      case 'price':
        comparison = a.price - b.price;
        break;
      case 'year':
        comparison = a.year - b.year;
        break;
      case 'mileage':
        comparison = (a.mileage || 0) - (b.mileage || 0);
        break;
      case 'date':
        const dateA = a.createdAt instanceof Date ? a.createdAt.getTime() : 0;
        const dateB = b.createdAt instanceof Date ? b.createdAt.getTime() : 0;
        comparison = dateB - dateA; // Newest first by default
        break;
      default:
        comparison = 0;
    }
    
    return sortOrder === 'desc' ? -comparison : comparison;
  });
  
  return sorted;
}

/**
 * Main worker message handler
 */
self.addEventListener('message', (event: MessageEvent<SearchMessage>) => {
  const { type, payload } = event.data;
  
  try {
    switch (type) {
      case 'SEARCH': {
        const { cars, params } = payload;
        let results = filterCars(cars, params);
        
        // Apply sorting if specified
        if (params.sortBy) {
          results = sortCars(results, params.sortBy, params.sortOrder || 'asc');
        }
        
        self.postMessage({
          type: 'SEARCH_RESULTS',
          payload: {
            results,
            count: results.length,
            processingTime: Date.now() - payload.startTime
          }
        });
        break;
      }
      
      case 'FILTER': {
        const { cars, filters } = payload;
        const results = filterCars(cars, { filters });
        
        self.postMessage({
          type: 'FILTER_RESULTS',
          payload: {
            results,
            count: results.length
          }
        });
        break;
      }
      
      case 'SORT': {
        const { cars, sortBy, sortOrder } = payload;
        const results = sortCars(cars, sortBy, sortOrder);
        
        self.postMessage({
          type: 'SORT_RESULTS',
          payload: {
            results
          }
        });
        break;
      }
      
      default:
        self.postMessage({
          type: 'ERROR',
          payload: {
            error: 'Unknown message type'
          }
        });
    }
  } catch (error) {
    self.postMessage({
      type: 'ERROR',
      payload: {
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    });
  }
});

// Export type for TypeScript
export {};
