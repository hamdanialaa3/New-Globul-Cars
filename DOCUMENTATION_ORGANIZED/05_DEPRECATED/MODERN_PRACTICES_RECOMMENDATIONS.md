# 🚀 توصيات الممارسات البرمجية الحديثة
## Modern Coding Practices Recommendations

**التاريخ:** ديسمبر 2025  
**الهدف:** أحدث الممارسات البرمجية العالمية الحالية

---

## 📋 جدول المحتويات

1. [State Management](#state-management)
2. [Data Fetching](#data-fetching)
3. [Form Validation](#form-validation)
4. [Error Handling](#error-handling)
5. [Performance Optimization](#performance-optimization)
6. [Testing Strategies](#testing-strategies)
7. [Code Organization](#code-organization)
8. [Type Safety](#type-safety)

---

## 1. State Management

### 1.1 الحالة الحالية
- ✅ React Context API للـ global state
- ✅ Local state للمكونات
- ❌ لا يوجد state management library

### 1.2 التوصية: Zustand

**لماذا Zustand؟**
- خفيف الوزن (1KB gzipped)
- أقل boilerplate من Redux
- أفضل من Context API للـ state المعقد
- TypeScript support ممتاز

**التطبيق:**

```typescript
// stores/carStore.ts
import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { CarListing, CarFilters } from '@/types/CarListing';

interface CarStore {
  cars: CarListing[];
  filters: CarFilters;
  selectedCar: CarListing | null;
  loading: boolean;
  error: Error | null;
  
  // Actions
  setCars: (cars: CarListing[]) => void;
  setFilters: (filters: CarFilters) => void;
  setSelectedCar: (car: CarListing | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: Error | null) => void;
  
  // Computed
  filteredCars: () => CarListing[];
}

export const useCarStore = create<CarStore>()(
  devtools(
    persist(
      (set, get) => ({
        cars: [],
        filters: {},
        selectedCar: null,
        loading: false,
        error: null,
        
        setCars: (cars) => set({ cars }),
        setFilters: (filters) => set({ filters }),
        setSelectedCar: (car) => set({ selectedCar: car }),
        setLoading: (loading) => set({ loading }),
        setError: (error) => set({ error }),
        
        filteredCars: () => {
          const { cars, filters } = get();
          // Filtering logic
          return cars.filter(car => {
            if (filters.make && car.make !== filters.make) return false;
            if (filters.maxPrice && car.price > filters.maxPrice) return false;
            // ... more filters
            return true;
          });
        },
      }),
      {
        name: 'car-storage',
        partialize: (state) => ({ 
          filters: state.filters,
          selectedCar: state.selectedCar 
        }),
      }
    ),
    { name: 'CarStore' }
  )
);

// Usage:
function CarsPage() {
  const { cars, loading, setCars, filteredCars } = useCarStore();
  const filtered = filteredCars();
  
  // ...
}
```

**المزايا:**
- ✅ Type-safe
- ✅ DevTools support
- ✅ Persistence support
- ✅ Selector optimization
- ✅ No Provider needed

---

## 2. Data Fetching

### 2.1 الحالة الحالية
- ❌ Manual state management للبيانات
- ❌ Manual loading/error states
- ❌ Manual caching
- ❌ Manual refetching

### 2.2 التوصية: React Query (TanStack Query)

**لماذا React Query؟**
- Automatic caching
- Automatic refetching
- Background updates
- Optimistic updates
- Pagination support
- Infinite scroll support

**التطبيق:**

```typescript
// hooks/useCars.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { unifiedCarService } from '@/services/car/unified-car.service';
import { CarListing, CarFilters } from '@/types/CarListing';

export function useCars(filters: CarFilters) {
  return useQuery({
    queryKey: ['cars', filters],
    queryFn: () => unifiedCarService.getCars(filters),
    staleTime: 5 * 60 * 1000, // 5 minutes
    cacheTime: 10 * 60 * 1000, // 10 minutes
    retry: 2,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });
}

export function useCar(carId: string) {
  return useQuery({
    queryKey: ['car', carId],
    queryFn: () => unifiedCarService.getCarById(carId),
    enabled: !!carId,
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
}

export function useCreateCar() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (car: Partial<CarListing>) => unifiedCarService.createCar(car),
    onSuccess: () => {
      // Invalidate and refetch
      queryClient.invalidateQueries({ queryKey: ['cars'] });
    },
    onError: (error) => {
      // Error handling
      logger.error('Failed to create car', error);
    },
  });
}

export function useUpdateCar() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<CarListing> }) =>
      unifiedCarService.updateCar(id, data),
    onMutate: async ({ id, data }) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['car', id] });
      
      // Snapshot previous value
      const previousCar = queryClient.getQueryData<CarListing>(['car', id]);
      
      // Optimistically update
      queryClient.setQueryData<CarListing>(['car', id], (old) => ({
        ...old!,
        ...data,
      }));
      
      return { previousCar };
    },
    onError: (error, variables, context) => {
      // Rollback on error
      if (context?.previousCar) {
        queryClient.setQueryData(['car', variables.id], context.previousCar);
      }
    },
    onSettled: (data, error, variables) => {
      // Refetch after error or success
      queryClient.invalidateQueries({ queryKey: ['car', variables.id] });
    },
  });
}

// Infinite scroll example:
export function useInfiniteCars(filters: CarFilters) {
  return useInfiniteQuery({
    queryKey: ['cars', 'infinite', filters],
    queryFn: ({ pageParam = 0 }) => 
      unifiedCarService.getCars(filters, { offset: pageParam, limit: 20 }),
    getNextPageParam: (lastPage, allPages) => {
      return lastPage.length === 20 ? allPages.length * 20 : undefined;
    },
  });
}

// Usage in component:
function CarsPage() {
  const [filters, setFilters] = useState<CarFilters>({});
  const { data, isLoading, error } = useCars(filters);
  const createCar = useCreateCar();
  
  const handleCreate = async (carData: Partial<CarListing>) => {
    await createCar.mutateAsync(carData);
    // Success handling
  };
  
  if (isLoading) return <LoadingSpinner />;
  if (error) return <ErrorDisplay error={error} />;
  
  return (
    <div>
      {data?.map(car => <CarCard key={car.id} car={car} />)}
    </div>
  );
}
```

**المزايا:**
- ✅ Automatic caching
- ✅ Background refetching
- ✅ Optimistic updates
- ✅ Error handling
- ✅ Loading states
- ✅ Retry logic

---

## 3. Form Validation

### 3.1 الحالة الحالية
- ❌ Manual validation
- ❌ No type-safe validation
- ❌ Inconsistent validation logic

### 3.2 التوصية: Zod + React Hook Form

**لماذا Zod؟**
- Type-safe schemas
- Runtime validation
- Type inference
- Composable schemas

**التطبيق:**

```typescript
// schemas/carSchema.ts
import { z } from 'zod';

export const CarListingSchema = z.object({
  make: z.string().min(1, 'Make is required'),
  model: z.string().min(1, 'Model is required'),
  year: z.number()
    .int('Year must be an integer')
    .min(1900, 'Year must be after 1900')
    .max(new Date().getFullYear() + 1, 'Year cannot be in the future'),
  price: z.number()
    .positive('Price must be positive')
    .max(10000000, 'Price is too high'),
  mileage: z.number()
    .nonnegative('Mileage cannot be negative')
    .max(1000000, 'Mileage is too high'),
  fuelType: z.enum(['petrol', 'diesel', 'electric', 'hybrid', 'lpg']),
  transmission: z.enum(['manual', 'automatic', 'semi-automatic']),
  locationData: z.object({
    cityId: z.string().min(1),
    cityName: z.string().min(1),
    coordinates: z.object({
      lat: z.number(),
      lng: z.number(),
    }),
  }),
  images: z.array(z.string().url()).min(1, 'At least one image is required'),
  description: z.string().max(5000, 'Description is too long'),
});

export type CarListingInput = z.infer<typeof CarListingSchema>;

// component:
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { CarListingSchema, CarListingInput } from '@/schemas/carSchema';

function CarForm() {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setValue,
    watch,
  } = useForm<CarListingInput>({
    resolver: zodResolver(CarListingSchema),
    defaultValues: {
      make: '',
      model: '',
      year: new Date().getFullYear(),
      price: 0,
      mileage: 0,
      images: [],
    },
  });
  
  const onSubmit = async (data: CarListingInput) => {
    try {
      await unifiedCarService.createCar(data);
      // Success handling
    } catch (error) {
      // Error handling
    }
  };
  
  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <input
        {...register('make')}
        placeholder="Make"
      />
      {errors.make && <span>{errors.make.message}</span>}
      
      <input
        {...register('price', { valueAsNumber: true })}
        type="number"
        placeholder="Price"
      />
      {errors.price && <span>{errors.price.message}</span>}
      
      {/* More fields... */}
      
      <button type="submit" disabled={isSubmitting}>
        {isSubmitting ? 'Submitting...' : 'Submit'}
      </button>
    </form>
  );
}
```

**المزايا:**
- ✅ Type-safe validation
- ✅ Automatic type inference
- ✅ Composable schemas
- ✅ Great error messages
- ✅ Integration with React Hook Form

---

## 4. Error Handling

### 4.1 الحالة الحالية
- ✅ ErrorBoundary موجود
- ⚠️ Inconsistent error handling
- ⚠️ Some console.error usage

### 4.2 التوصية: Error Boundary + Sentry

**التطبيق:**

```typescript
// ErrorBoundary with Sentry:
import * as Sentry from '@sentry/react';
import { ErrorBoundary } from '@sentry/react';

function App() {
  return (
    <Sentry.ErrorBoundary
      fallback={({ error, resetError }) => (
        <ErrorFallback error={error} resetError={resetError} />
      )}
      showDialog
    >
      <Router>
        {/* App content */}
      </Router>
    </Sentry.ErrorBoundary>
  );
}

// Custom error hook:
import { toast } from 'react-toastify';
import * as Sentry from '@sentry/react';
import { logger } from '@/services/logger-service';

export function useErrorHandler() {
  return useCallback((error: Error, context?: string) => {
    // Log locally
    logger.error('Operation failed', error, { context });
    
    // Send to Sentry
    Sentry.captureException(error, {
      tags: { context },
      level: 'error',
    });
    
    // Show user-friendly message
    toast.error(
      error.message || 'An error occurred. Please try again.',
      { position: 'top-right' }
    );
  }, []);
}

// Usage:
function MyComponent() {
  const handleError = useErrorHandler();
  
  const handleAction = async () => {
    try {
      await someOperation();
    } catch (error) {
      handleError(error as Error, 'MyComponent.handleAction');
    }
  };
}
```

---

## 5. Performance Optimization

### 5.1 React 19 Features

#### 5.1.1 `use` Hook

```typescript
import { use, Suspense } from 'react';

function CarDetails({ carPromise }: { carPromise: Promise<Car> }) {
  const car = use(carPromise); // Suspense-aware
  
  return (
    <div>
      <h1>{car.make} {car.model}</h1>
      <p>{car.price} EUR</p>
    </div>
  );
}

// Usage:
<Suspense fallback={<LoadingSpinner />}>
  <CarDetails carPromise={fetchCar(carId)} />
</Suspense>
```

#### 5.1.2 `useOptimistic`

```typescript
import { useOptimistic } from 'react';

function CarList({ cars }: { cars: CarListing[] }) {
  const [optimisticCars, addOptimisticCar] = useOptimistic(
    cars,
    (state, newCar: CarListing) => [...state, newCar]
  );
  
  const handleAdd = async (car: CarListing) => {
    addOptimisticCar(car); // Immediate UI update
    await createCar(car); // Actual API call
  };
  
  return (
    <div>
      {optimisticCars.map(car => (
        <CarCard key={car.id} car={car} />
      ))}
    </div>
  );
}
```

### 5.2 Code Splitting

```typescript
// Route-based:
import { lazy, Suspense } from 'react';

const CarDetailsPage = lazy(() => import('./pages/CarDetailsPage'));
const AdminPage = lazy(() => import('./pages/AdminPage'));

// Component-based:
const HeavyChart = lazy(() => import('./components/HeavyChart'));

function Dashboard() {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <HeavyChart />
    </Suspense>
  );
}
```

### 5.3 Image Optimization

```typescript
// Next.js Image component style (for future migration):
import Image from 'next/image';

<Image
  src={car.imageUrl}
  alt={car.make}
  width={800}
  height={600}
  loading="lazy"
  placeholder="blur"
  blurDataURL={car.blurDataUrl}
/>

// Or with react-image:
import { Image } from 'react-image';

<Image
  src={car.imageUrl}
  loader={<LoadingSpinner />}
  unloader={<ErrorImage />}
  alt={car.make}
  loading="lazy"
/>
```

---

## 6. Testing Strategies

### 6.1 Unit Tests (Jest + React Testing Library)

```typescript
// __tests__/services/unified-car.service.test.ts
import { unifiedCarService } from '@/services/car/unified-car.service';
import { CarListing } from '@/types/CarListing';

describe('UnifiedCarService', () => {
  describe('getCars', () => {
    it('should fetch cars with filters', async () => {
      const filters = { make: 'BMW', maxPrice: 50000 };
      const cars = await unifiedCarService.getCars(filters);
      
      expect(cars).toBeDefined();
      expect(Array.isArray(cars)).toBe(true);
      cars.forEach(car => {
        expect(car.make).toBe('BMW');
        expect(car.price).toBeLessThanOrEqual(50000);
      });
    });
  });
});
```

### 6.2 Component Tests

```typescript
// __tests__/components/CarCard.test.tsx
import { render, screen } from '@testing-library/react';
import { CarCard } from '@/components/CarCard';

describe('CarCard', () => {
  const mockCar: CarListing = {
    id: '1',
    make: 'BMW',
    model: 'X5',
    price: 50000,
    year: 2020,
    // ... other fields
  };
  
  it('should render car details', () => {
    render(<CarCard car={mockCar} />);
    
    expect(screen.getByText('BMW X5')).toBeInTheDocument();
    expect(screen.getByText('50,000 EUR')).toBeInTheDocument();
  });
});
```

### 6.3 E2E Tests (Playwright)

```typescript
// e2e/car-listing.spec.ts
import { test, expect } from '@playwright/test';

test('should create a car listing', async ({ page }) => {
  await page.goto('/sell');
  
  // Fill form
  await page.fill('[name="make"]', 'BMW');
  await page.fill('[name="model"]', 'X5');
  await page.fill('[name="price"]', '50000');
  
  // Submit
  await page.click('button[type="submit"]');
  
  // Verify success
  await expect(page.locator('.success-message')).toBeVisible();
});
```

---

## 7. Code Organization

### 7.1 Feature-Based Structure

```
src/
├── features/
│   ├── cars/
│   │   ├── components/
│   │   ├── hooks/
│   │   ├── services/
│   │   ├── types/
│   │   └── index.ts
│   ├── profile/
│   │   ├── components/
│   │   ├── hooks/
│   │   └── services/
│   └── messaging/
│       ├── components/
│       └── hooks/
├── shared/
│   ├── components/
│   ├── hooks/
│   └── utils/
└── app/
    ├── routes/
    └── layouts/
```

### 7.2 Barrel Exports

```typescript
// features/cars/index.ts
export { CarCard } from './components/CarCard';
export { CarList } from './components/CarList';
export { useCars } from './hooks/useCars';
export { unifiedCarService } from './services/unified-car.service';
export type { CarListing } from './types/CarListing';

// Usage:
import { CarCard, useCars, CarListing } from '@/features/cars';
```

---

## 8. Type Safety

### 8.1 Strict TypeScript

```json
// tsconfig.json
{
  "compilerOptions": {
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true,
    "strictFunctionTypes": true,
    "strictPropertyInitialization": true,
    "noImplicitThis": true,
    "alwaysStrict": true
  }
}
```

### 8.2 Type Utilities

```typescript
// utils/types.ts

// Extract types from schemas
type CarInput = z.infer<typeof CarListingSchema>;

// Utility types
type PartialExcept<T, K extends keyof T> = Partial<T> & Pick<T, K>;
type RequiredFields<T, K extends keyof T> = T & Required<Pick<T, K>>;

// Usage:
type CarUpdate = PartialExcept<CarListing, 'id'>;
type CarCreate = Omit<CarListing, 'id' | 'createdAt' | 'updatedAt'>;
```

---

## 📊 ملخص التوصيات

| الممارسة | الحالة الحالية | الموصى به | الأولوية |
|---------|---------------|----------|---------|
| State Management | Context API | Zustand | 🟡 متوسطة |
| Data Fetching | Manual | React Query | 🔴 عالية |
| Form Validation | Manual | Zod + RHF | 🟡 متوسطة |
| Error Handling | Basic | Sentry | 🟡 متوسطة |
| Testing | None | Jest + RTL + Playwright | 🟢 منخفضة |
| Type Safety | Weak | Strict TS | 🔴 عالية |
| Performance | Good | React 19 Features | 🟡 متوسطة |

---

**آخر تحديث:** ديسمبر 2025  
**الإصدار:** 1.0
