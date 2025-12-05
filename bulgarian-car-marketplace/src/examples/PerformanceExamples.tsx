import { logger } from '../services/logger-service';
// src/examples/PerformanceExamples.tsx
// Performance Optimization Examples
// أمثلة على التحسينات المطبقة

import React, { useMemo, useCallback, useState } from 'react';
import { OptimizedImage } from '../components/OptimizedImage';
import { firebaseCache, cacheKeys } from '../services/firebase-cache.service';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '../firebase';

// ============================================================================
// EXAMPLE 1: OptimizedImage Usage
// ============================================================================

export const ImageExample: React.FC = () => {
  return (
    <div>
      <h2>Optimized Images</h2>
      
      {/* Basic usage with lazy loading */}
      <OptimizedImage 
        src="/assets/images/car_brands/bmw.png"
        alt="BMW Logo"
        width={120}
        height={80}
        loading="lazy"
      />
      
      {/* Eager loading for above-the-fold images */}
      <OptimizedImage 
        src="/assets/images/hero-background.jpg"
        alt="Hero"
        width="100%"
        height={400}
        loading="eager"
      />
      
      {/* With fallback */}
      <OptimizedImage 
        src="/path/that/might/not/exist.jpg"
        alt="Fallback example"
        fallback="/images/placeholder.png"
        width={300}
        height={200}
      />
    </div>
  );
};

// ============================================================================
// EXAMPLE 2: Firebase Cache Usage
// ============================================================================

export const FirebaseCacheExample: React.FC = () => {
  const [cars, setCars] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  // Fetch cars with caching
  const fetchCars = async () => {
    setLoading(true);
    try {
      const data = await firebaseCache.getOrFetch(
        cacheKeys.activeCars(),
        async () => {
          logger.info('🔥 Fetching from Firebase...');
          const snapshot = await getDocs(
            query(collection(db, 'cars'), where('status', '==', 'active'))
          );
          return snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          }));
        },
        { duration: 5 * 60 * 1000 } // Cache for 5 minutes
      );
      
      setCars(data);
    } catch (error) {
      logger.error('Error fetching cars:', error);
    } finally {
      setLoading(false);
    }
  };

  // Invalidate cache when car is updated
  const handleCarUpdate = async (carId: string) => {
    // ... update logic
    
    // Invalidate related caches
    firebaseCache.invalidate(cacheKeys.activeCars());
    firebaseCache.invalidate(cacheKeys.carDetails(carId));
    
    // Refetch with fresh data
    await fetchCars();
  };

  return (
    <div>
      <button onClick={fetchCars}>
        {loading ? 'Loading...' : 'Fetch Cars'}
      </button>
      <p>Cars: {cars.length}</p>
      <pre>{JSON.stringify(firebaseCache.getStats(), null, 2)}</pre>
    </div>
  );
};

// ============================================================================
// EXAMPLE 3: React.memo Usage
// ============================================================================

// Heavy component that should not re-render unnecessarily
const CarCard = React.memo<{ 
  car: any; 
  onFavorite: (id: string) => void;
  onView: (id: string) => void;
}>(
  ({ car, onFavorite, onView }) => {
    logger.info(`Rendering CarCard for ${car.id}`);
    
    return (
      <div style={{ border: '1px solid #ddd', padding: '1rem', margin: '0.5rem' }}>
        <OptimizedImage 
          src={car.images?.[0] || '/placeholder.png'}
          alt={`${car.make} ${car.model}`}
          width={200}
          height={150}
        />
        <h3>{car.make} {car.model}</h3>
        <p>{car.price} {car.currency}</p>
        <button onClick={() => onFavorite(car.id)}>❤️ Favorite</button>
        <button onClick={() => onView(car.id)}>👁️ View</button>
      </div>
    );
  },
  // Custom comparison function - only re-render if these props change
  (prevProps, nextProps) => 
    prevProps.car.id === nextProps.car.id &&
    prevProps.car.price === nextProps.car.price &&
    prevProps.car.favorite === nextProps.car.favorite
);

export const CarListExample: React.FC = () => {
  const [cars, setCars] = useState([
    { id: '1', make: 'BMW', model: 'X5', price: 50000, currency: 'EUR', favorite: false },
    { id: '2', make: 'Mercedes', model: 'C-Class', price: 40000, currency: 'EUR', favorite: false },
    { id: '3', make: 'Audi', model: 'A4', price: 35000, currency: 'EUR', favorite: false },
  ]);

  // useCallback to prevent re-creating function on every render
  const handleFavorite = useCallback((id: string) => {
    setCars(prev => prev.map(car => 
      car.id === id ? { ...car, favorite: !car.favorite } : car
    ));
  }, []);

  const handleView = useCallback((id: string) => {
    logger.info('Viewing car:', id);
  }, []);

  return (
    <div>
      <h2>Car List (React.memo example)</h2>
      {cars.map(car => (
        <CarCard 
          key={car.id}
          car={car}
          onFavorite={handleFavorite}
          onView={handleView}
        />
      ))}
    </div>
  );
};

// ============================================================================
// EXAMPLE 4: useMemo for Expensive Calculations
// ============================================================================

export const FilterExample: React.FC = () => {
  const [cars, setCars] = useState([
    { id: '1', make: 'BMW', model: 'X5', price: 50000, year: 2020, mileage: 30000 },
    { id: '2', make: 'Mercedes', model: 'C-Class', price: 40000, year: 2019, mileage: 45000 },
    { id: '3', make: 'Audi', model: 'A4', price: 35000, year: 2021, mileage: 20000 },
    { id: '4', make: 'BMW', model: '3 Series', price: 38000, year: 2020, mileage: 25000 },
  ]);

  const [filters, setFilters] = useState({
    make: '',
    minPrice: 0,
    maxPrice: 100000,
    maxMileage: 100000
  });

  // ❌ BAD: This runs on EVERY render!
  // const filteredCars = cars.filter(car => {
  //   if (filters.make && car.make !== filters.make) return false;
  //   if (car.price < filters.minPrice || car.price > filters.maxPrice) return false;
  //   if (car.mileage > filters.maxMileage) return false;
  //   return true;
  // });

  // ✅ GOOD: Only recalculates when cars or filters change
  const filteredCars = useMemo(() => {
    logger.info('🔄 Filtering cars...');
    return cars.filter(car => {
      if (filters.make && car.make !== filters.make) return false;
      if (car.price < filters.minPrice || car.price > filters.maxPrice) return false;
      if (car.mileage > filters.maxMileage) return false;
      return true;
    });
  }, [cars, filters]);

  // ✅ GOOD: Only recalculates when filteredCars changes
  const stats = useMemo(() => {
    logger.info('📊 Calculating stats...');
    return {
      count: filteredCars.length,
      avgPrice: filteredCars.reduce((sum, car) => sum + car.price, 0) / filteredCars.length,
      minPrice: Math.min(...filteredCars.map(c => c.price)),
      maxPrice: Math.max(...filteredCars.map(c => c.price))
    };
  }, [filteredCars]);

  return (
    <div>
      <h2>Filter Example (useMemo)</h2>
      
      <div>
        <input 
          type="text" 
          placeholder="Make (BMW, Mercedes, Audi)"
          value={filters.make}
          onChange={e => setFilters({ ...filters, make: e.target.value })}
        />
        <input 
          type="number" 
          placeholder="Max Mileage"
          value={filters.maxMileage}
          onChange={e => setFilters({ ...filters, maxMileage: Number(e.target.value) })}
        />
      </div>
      
      <div>
        <h3>Stats</h3>
        <p>Count: {stats.count}</p>
        <p>Avg Price: €{stats.avgPrice.toFixed(0)}</p>
        <p>Price Range: €{stats.minPrice} - €{stats.maxPrice}</p>
      </div>
      
      <div>
        <h3>Filtered Cars ({filteredCars.length})</h3>
        {filteredCars.map(car => (
          <p key={car.id}>{car.make} {car.model} - €{car.price}</p>
        ))}
      </div>
    </div>
  );
};

// ============================================================================
// EXAMPLE 5: Combined Optimizations
// ============================================================================

interface OptimizedCarsPageProps {
  userId: string;
}

export const OptimizedCarsPage: React.FC<OptimizedCarsPageProps> = ({ userId }) => {
  const [cars, setCars] = useState<any[]>([]);
  const [filters, setFilters] = useState({ make: '', minPrice: 0, maxPrice: 100000 });
  const [sortBy, setSortBy] = useState<'price' | 'year' | 'mileage'>('price');

  // 1️⃣ Fetch with caching
  React.useEffect(() => {
    const fetchCars = async () => {
      const data = await firebaseCache.getOrFetch(
        cacheKeys.userListings(userId),
        async () => {
          const snapshot = await getDocs(
            query(collection(db, 'cars'), where('sellerId', '==', userId))
          );
          return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        }
      );
      setCars(data);
    };
    fetchCars();
  }, [userId]);

  // 2️⃣ Filter with useMemo
  const filteredCars = useMemo(() => {
    return cars.filter(car => {
      if (filters.make && car.make !== filters.make) return false;
      if (car.price < filters.minPrice || car.price > filters.maxPrice) return false;
      return true;
    });
  }, [cars, filters]);

  // 3️⃣ Sort with useMemo
  const sortedCars = useMemo(() => {
    const sorted = [...filteredCars];
    sorted.sort((a, b) => {
      if (sortBy === 'price') return a.price - b.price;
      if (sortBy === 'year') return b.year - a.year;
      if (sortBy === 'mileage') return a.mileage - b.mileage;
      return 0;
    });
    return sorted;
  }, [filteredCars, sortBy]);

  // 4️⃣ useCallback for event handlers
  const handleFavorite = useCallback((id: string) => {
    // ... favorite logic
    firebaseCache.invalidate(cacheKeys.userListings(userId));
  }, [userId]);

  // 5️⃣ Render with React.memo components
  return (
    <div>
      <h2>Optimized Cars Page</h2>
      
      <div>
        <input 
          placeholder="Make" 
          onChange={e => setFilters({ ...filters, make: e.target.value })}
        />
        <select onChange={e => setSortBy(e.target.value as any)}>
          <option value="price">Price</option>
          <option value="year">Year</option>
          <option value="mileage">Mileage</option>
        </select>
      </div>

      <div>
        {sortedCars.map(car => (
          <CarCard 
            key={car.id}
            car={car}
            onFavorite={handleFavorite}
            onView={(id) => logger.info('View', id)}
          />
        ))}
      </div>
    </div>
  );
};

export default {
  ImageExample,
  FirebaseCacheExample,
  CarListExample,
  FilterExample,
  OptimizedCarsPage
};

