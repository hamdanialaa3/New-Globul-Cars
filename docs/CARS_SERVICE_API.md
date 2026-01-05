# Cars Service API Documentation

## Overview

The `carsService.ts` module provides a simple, backward-compatible API for accessing car data throughout the application. It acts as a facade/wrapper over the more complex `UnifiedCarService`, making it easier for components to fetch and search for cars.

## Architecture

```
┌─────────────────────────────────────┐
│   Components (CarDetailsPage, etc)  │
│   Import from: services/carsService │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│      carsService.ts (Facade)        │
│   - Simple API                      │
│   - Type exports                    │
│   - Error handling                  │
│   - Logging                         │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│    UnifiedCarService (Core Logic)   │
│   - Multi-collection queries        │
│   - Firestore operations            │
│   - Cache management                │
└─────────────────────────────────────┘
```

## Purpose

- **Backward Compatibility**: Maintains the API that existing components expect
- **Simplified Interface**: Provides straightforward functions without complex parameters
- **Single Import**: All car-related types and functions in one place
- **Consistent Logging**: Uses `logger-service` for all operations
- **Error Handling**: Proper try-catch blocks with informative error messages

## Installation / Import

```typescript
// Import specific functions and types
import { getCarById, Car, SearchFilters } from '@/services/carsService';

// Or using relative path
import { getCarById, Car } from '../../services/carsService';

// Import all exports
import * as carsService from '@/services/carsService';
```

## Type Definitions

### Car Type

```typescript
export type Car = UnifiedCar;
```

The `Car` type is an alias for `UnifiedCar` from the unified car service. It includes:

- `id: string` - Unique car identifier
- `sellerId: string` - Owner's Firebase UID
- `make: string` - Car brand (e.g., "BMW", "Mercedes")
- `model: string` - Car model (e.g., "X5", "C-Class")
- `year: number` - Manufacturing year
- `price: number` - Price in EUR
- `mileage?: number` - Mileage in kilometers
- `fuelType?: string` - Fuel type (e.g., "Бензин", "Дизел")
- `transmission?: string` - Transmission type (e.g., "Автоматична", "Ръчна")
- `status: 'active' | 'sold' | 'draft'` - Listing status
- `isActive: boolean` - Whether the listing is active
- `isSold: boolean` - Whether the car is sold
- `views: number` - Number of views
- `favorites: number` - Number of times favorited
- `createdAt: Date` - Creation timestamp
- `updatedAt: Date` - Last update timestamp
- `sellerNumericId?: number` - Seller's numeric ID (for clean URLs)
- `carNumericId?: number` - Car's numeric ID (for clean URLs)
- `images?: string[]` - Array of image URLs
- And many more optional fields...

### SearchFilters Type

```typescript
export type SearchFilters = CarFilters;
```

Search filters for querying cars:

```typescript
{
  make?: string;              // Filter by brand
  model?: string;             // Filter by model
  minYear?: number;           // Minimum year
  maxYear?: number;           // Maximum year
  minPrice?: number;          // Minimum price (EUR)
  maxPrice?: number;          // Maximum price (EUR)
  fuelType?: string;          // Fuel type
  transmission?: string;      // Transmission type
  bodyType?: string;          // Body type (Sedan, SUV, etc.)
  region?: string;            // Location region
  sellerId?: string;          // Filter by seller
  isActive?: boolean;         // Filter by active status
  isSold?: boolean;           // Filter by sold status
  locationData?: {            // Location data
    regionName?: string;
  };
}
```

## API Functions

### getCarById

Get a single car by its ID.

```typescript
async function getCarById(id: string | number): Promise<Car | null>
```

**Parameters:**
- `id` - Car ID (can be string or number, will be converted to string)

**Returns:**
- `Promise<Car | null>` - The car object or null if not found

**Example:**
```typescript
const car = await getCarById('abc123');
if (car) {
  console.log(`Found: ${car.make} ${car.model} - ${car.price} EUR`);
} else {
  console.log('Car not found');
}

// Also accepts numeric IDs
const carByNumber = await getCarById(123);
```

**Error Handling:**
- Throws error if database query fails
- Returns `null` if car is not found (not an error)

---

### getAllCars

Get all active cars with optional filtering.

```typescript
async function getAllCars(
  filters: SearchFilters = {}, 
  limitCount: number = 50
): Promise<Car[]>
```

**Parameters:**
- `filters` - Optional search filters (defaults to empty)
- `limitCount` - Maximum number of results (defaults to 50)

**Returns:**
- `Promise<Car[]>` - Array of car objects (automatically filters to `isActive: true`)

**Example:**
```typescript
// Get all active cars (max 50)
const allCars = await getAllCars();

// Get BMW cars only
const bmwCars = await getAllCars({ make: 'BMW' });

// Get cars with price range
const affordableCars = await getAllCars(
  { minPrice: 10000, maxPrice: 30000 },
  100 // Get up to 100 results
);
```

---

### searchCars

Search cars with advanced filters.

```typescript
async function searchCars(
  filters: SearchFilters, 
  limitCount: number = 20
): Promise<Car[]>
```

**Parameters:**
- `filters` - Search filters object
- `limitCount` - Maximum number of results (defaults to 20)

**Returns:**
- `Promise<Car[]>` - Array of matching car objects

**Example:**
```typescript
const results = await searchCars({
  make: 'BMW',
  model: 'X5',
  minYear: 2015,
  maxYear: 2020,
  minPrice: 20000,
  maxPrice: 50000,
  fuelType: 'Дизел',
  transmission: 'Автоматична'
}, 30);

console.log(`Found ${results.length} cars matching criteria`);
```

---

### getCarsByBrand

Get cars by brand/make.

```typescript
async function getCarsByBrand(
  brand: string, 
  limitCount: number = 20
): Promise<Car[]>
```

**Parameters:**
- `brand` - Brand/make name (e.g., "BMW", "Mercedes", "Audi")
- `limitCount` - Maximum number of results (defaults to 20)

**Returns:**
- `Promise<Car[]>` - Array of car objects (only active cars)

**Example:**
```typescript
const bmwCars = await getCarsByBrand('BMW', 50);
const audiCars = await getCarsByBrand('Audi');

// Empty brand returns empty array
const noCars = await getCarsByBrand(''); // Returns []
```

---

### getFeaturedCars

Get featured cars for homepage display.

```typescript
async function getFeaturedCars(limitCount: number = 4): Promise<Car[]>
```

**Parameters:**
- `limitCount` - Maximum number of featured cars (defaults to 4)

**Returns:**
- `Promise<Car[]>` - Array of featured car objects

**Example:**
```typescript
// Get 4 featured cars for homepage
const featured = await getFeaturedCars();

// Get more featured cars
const moreFeatured = await getFeaturedCars(8);
```

---

### getNewCars

Get new cars from the last 24 hours.

```typescript
async function getNewCars(limitCount: number = 12): Promise<Car[]>
```

**Parameters:**
- `limitCount` - Maximum number of new cars (defaults to 12)

**Returns:**
- `Promise<Car[]>` - Array of newly listed car objects

**Example:**
```typescript
const newCars = await getNewCars();
console.log(`${newCars.length} new cars listed in last 24 hours`);

// Get more new listings
const moreNewCars = await getNewCars(20);
```

---

### getSimilarCars

Get similar cars for recommendations (based on current car).

```typescript
async function getSimilarCars(
  carId: string, 
  limitCount: number = 6
): Promise<Car[]>
```

**Parameters:**
- `carId` - The ID of the car to find similar cars for
- `limitCount` - Maximum number of similar cars (defaults to 6)

**Returns:**
- `Promise<Car[]>` - Array of similar car objects

**Example:**
```typescript
// Show similar cars on details page
const similarCars = await getSimilarCars('abc123', 8);
```

---

### getUserCars

Get all cars listed by a specific user.

```typescript
async function getUserCars(userId: string): Promise<Car[]>
```

**Parameters:**
- `userId` - Firebase UID of the user

**Returns:**
- `Promise<Car[]>` - Array of user's car objects

**Example:**
```typescript
const userCars = await getUserCars('user-123');
console.log(`User has ${userCars.length} listings`);

// Empty userId returns empty array
const noCars = await getUserCars(''); // Returns []
```

---

## Error Handling

All functions in `carsService` follow consistent error handling patterns:

1. **Validation Errors**: Functions validate inputs and return empty arrays/null for invalid inputs
2. **Database Errors**: Throws the original error from Firestore for caller to handle
3. **Logging**: All operations are logged via `logger-service`

**Example Error Handling:**
```typescript
try {
  const car = await getCarById('abc123');
  if (!car) {
    console.log('Car not found');
    return;
  }
  // Use car...
} catch (error) {
  console.error('Failed to fetch car:', error);
  // Show user-friendly error message
}
```

## Logging

All functions automatically log their operations:

- **Debug**: Function calls with parameters
- **Info**: Successful operations with result counts
- **Warn**: Validation failures (empty inputs)
- **Error**: Database errors with context

**Log Example:**
```
DEBUG: getCarById called { id: 'abc123' }
INFO: getCarById completed { found: true }
```

## Multi-Collection Support

The `carsService` automatically searches across **all vehicle type collections**:

- `cars` - Legacy collection
- `passenger_cars` - Personal cars
- `suvs` - SUVs/Jeeps
- `vans` - Vans/Cargo
- `motorcycles` - Motorcycles
- `trucks` - Trucks
- `buses` - Buses

This is handled transparently by `UnifiedCarService`.

## Performance Considerations

- **Caching**: Underlying `UnifiedCarService` implements caching
- **Pagination**: Use `limitCount` parameter to control result size
- **Parallel Queries**: Multi-collection queries run in parallel
- **Client-side Filtering**: Some filters applied client-side for flexibility

## Testing

Comprehensive test suite available in `src/services/__tests__/carsService.test.ts`:

- 16 test cases covering all functions
- Mocked UnifiedCarService for unit testing
- 100% passing rate

**Run Tests:**
```bash
npm test -- --testPathPattern=carsService.test.ts
```

## Migration Guide

### From Direct UnifiedCarService Usage

**Before:**
```typescript
import { unifiedCarService } from './car/unified-car-service';
import { UnifiedCar } from './car/unified-car-types';

const car = await unifiedCarService.getCarById('abc123');
const cars = await unifiedCarService.searchCars({ make: 'BMW' }, 20);
```

**After:**
```typescript
import { getCarById, searchCars, Car } from './carsService';

const car = await getCarById('abc123');
const cars = await searchCars({ make: 'BMW' }, 20);
```

### From Custom Implementations

**Before:**
```typescript
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '../firebase/firebase-config';

const q = query(
  collection(db, 'cars'),
  where('make', '==', 'BMW'),
  where('isActive', '==', true)
);
const snapshot = await getDocs(q);
const cars = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
```

**After:**
```typescript
import { getCarsByBrand } from './carsService';

const cars = await getCarsByBrand('BMW');
```

## Related Documentation

- `src/services/car/unified-car-service.ts` - Core implementation
- `src/services/car/unified-car-types.ts` - Type definitions
- `PROJECT_CONSTITUTION.md` - Numeric ID system
- `docs/STRICT_NUMERIC_ID_SYSTEM.md` - URL structure

## Support

For issues or questions:
1. Check the test file for usage examples
2. Review the source code JSDoc comments
3. See `UnifiedCarService` documentation for advanced features

## Changelog

### v1.0.0 (2026-01-05)
- Initial release
- Created as facade for UnifiedCarService
- Supports all major car operations
- Comprehensive test coverage
- Full JSDoc documentation
