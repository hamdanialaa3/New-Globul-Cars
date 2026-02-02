/**
 * Query Builder Service
 * Builds Firestore queries for dynamic car showcase pages
 * Handles OR logic workaround by merging multiple queries
 * ✅ FIXED: Now supports cursor-based pagination
 */

import {
  collection,
  query,
  where,
  orderBy,
  limit,
  getDocs,
  QueryConstraint,
  DocumentData,
  Query,
  startAfter,
  DocumentSnapshot
} from 'firebase/firestore';
import { db } from '../firebase/firebase-config';
import { PageType, ShowcaseQuery, ShowcaseConfig } from '../types/showcase.types';
import { CarListing } from '../types/CarListing';
import { logger } from './logger-service';

// ✅ NEW: Pagination result type
export interface PaginatedResult<T> {
  items: T[];
  lastDoc: DocumentSnapshot | null;
  hasMore: boolean;
  totalFetched: number;
}

/**
 * Get showcase configuration for page type
 */
export function getShowcaseConfig(pageType: PageType, dynamicParam?: string): ShowcaseConfig {
  const configs: Record<PageType, ShowcaseConfig> = {
    all: {
      pageType: 'all',
      title: 'Всички автомобили',
      subtitle: 'Разгледайте всички налични обяви',
      defaultSort: 'year-desc',
      metaTitle: 'All Cars for Sale in Bulgaria | Globul Cars',
      metaDescription: 'Browse thousands of cars for sale in Bulgaria. Competitive prices and guaranteed quality.',
      metaKeywords: 'cars for sale, Bulgaria, used cars, new cars'
    },
    family: {
      pageType: 'family',
      title: 'Семейни автомобили',
      subtitle: 'Просторни автомобили с 7+ места - идеални за големи семейства',
      defaultSort: 'seats-desc',
      metaTitle: 'Family Cars 7 Seats for Sale in Bulgaria | Globul Cars',
      metaDescription: 'Browse the best spacious family cars with 7 or more seats. Perfect for large families and long trips.',
      metaKeywords: 'family cars, 7 seats, spacious cars, minivan, large SUV'
    },
    // ✅ NEW: Electric cars filter - fuel_type = electric
    electric: {
      pageType: 'electric' as PageType,
      title: 'Електрически автомобили',
      subtitle: '100% електрическо задвижване - нулеви емисии',
      defaultSort: 'year-desc',
      metaTitle: 'Electric Cars for Sale in Bulgaria | Globul Cars',
      metaDescription: 'Browse electric vehicles with zero emissions. Tesla, BMW i, Nissan Leaf and more.',
      metaKeywords: 'electric cars, EV, Tesla, zero emissions, електрически коли'
    },
    // ✅ NEW: Hybrid cars filter
    hybrid: {
      pageType: 'hybrid' as PageType,
      title: 'Хибридни автомобили',
      subtitle: 'Комбинация от бензин и електричество',
      defaultSort: 'year-desc',
      metaTitle: 'Hybrid Cars for Sale in Bulgaria | Globul Cars',
      metaDescription: 'Browse hybrid vehicles for lower fuel costs. Plug-in and self-charging hybrids.',
      metaKeywords: 'hybrid cars, PHEV, plug-in hybrid, хибридни коли'
    },
    // ✅ NEW: Low mileage (like new) - mileage <= 3515 km
    lowMileage: {
      pageType: 'lowMileage' as PageType,
      title: 'Като нови (нисък пробег)',
      subtitle: 'Автомобили с под 3,515 км пробег',
      defaultSort: 'mileage-asc',
      metaTitle: 'Low Mileage Cars for Sale | Globul Cars',
      metaDescription: 'Cars in like-new condition with under 3,515 km mileage.',
      metaKeywords: 'low mileage, like new, minimal use, нисък пробег'
    },
    // ✅ NEW: Newly added - sorted by created_at DESC
    newlyAdded: {
      pageType: 'newlyAdded' as PageType,
      title: 'Ново добавени обяви',
      subtitle: 'Последните обяви първи',
      defaultSort: 'created-desc',
      metaTitle: 'Newly Added Cars for Sale | Globul Cars',
      metaDescription: 'Latest car listings updated every day. Be the first to see new offers.',
      metaKeywords: 'new listings, latest cars, recent ads, нови обяви'
    },
    // ✅ NEW: Budget cars - price < 5000
    budget: {
      pageType: 'budget' as PageType,
      title: 'Бюджетни автомобили',
      subtitle: 'Под 5,000 EUR',
      defaultSort: 'price-asc',
      metaTitle: 'Budget Cars Under 5000 EUR | Globul Cars',
      metaDescription: 'Affordable cars priced under 5,000 euros. Great value for money.',
      metaKeywords: 'cheap cars, budget, under 5000, евтини коли'
    },
    // ✅ NEW: Verified dealers
    verifiedDealer: {
      pageType: 'verifiedDealer' as PageType,
      title: 'Проверени дилъри',
      subtitle: 'Гарантирано качество от сертифицирани автокъщи',
      defaultSort: 'year-desc',
      metaTitle: 'Verified Car Dealers in Bulgaria | Globul Cars',
      metaDescription: 'Buy from verified and certified car dealers. Guaranteed quality.',
      metaKeywords: 'verified dealers, certified, trusted, проверени дилъри'
    },
    womens: {
      pageType: 'womens' as PageType,
      title: 'Дамски автомобили',
      subtitle: 'Красиви автомобили в розово и червено - за дамите',
      defaultSort: 'year-desc',
      metaTitle: "Women's Cars Pink & Red - Koli.one",
      metaDescription: 'Beautiful cars in pink and red colors. Stylish vehicles perfect for women.',
      metaKeywords: "women's cars, pink cars, red cars, дамски коли"
    },
    sport: {
      pageType: 'sport',
      title: 'Спортни автомобили',
      subtitle: 'Автомобили с мощни двигатели 270+ к.с. и купе дизайн',
      defaultSort: 'power-desc',
      metaTitle: 'Powerful Sport Cars for Sale - 270+ HP | Globul Cars',
      metaDescription: 'Discover sport cars with powerful engines and coupe design. Speed and exceptional performance at competitive prices.',
      metaKeywords: 'sport cars, coupe, powerful engine, speed, high performance'
    },
    vip: {
      pageType: 'vip',
      title: 'VIP луксозни автомобили',
      subtitle: 'Луксозни автомобили на цена от 35,000 евро и повече',
      defaultSort: 'price-desc',
      metaTitle: 'VIP Luxury Cars for Sale in Bulgaria | Globul Cars',
      metaDescription: 'Browse the finest luxury cars from Mercedes, BMW, Audi and more. Exceptional luxury and quality.',
      metaKeywords: 'luxury cars, VIP, Mercedes, BMW, Audi, premium cars'
    },
    classic: {
      pageType: 'classic',
      title: 'Класически автомобили',
      subtitle: 'Отличителни класически автомобили от деветдесетте и по-рано',
      defaultSort: 'year-asc',
      metaTitle: 'Classic Vintage Cars for Sale | Globul Cars',
      metaDescription: 'Discover rare and distinctive classic cars from the eighties and nineties. Historical pieces for enthusiasts and collectors.',
      metaKeywords: 'classic cars, vintage cars, old cars, rare cars'
    },
    city: {
      pageType: 'city',
      title: `Автомобили в ${dynamicParam || 'града'}`,
      subtitle: `Разгледайте всички налични автомобили в ${dynamicParam || 'този град'}`,
      defaultSort: 'price-asc',
      metaTitle: `Cars for Sale in ${dynamicParam} | Globul Cars`,
      metaDescription: `Browse all cars for sale in ${dynamicParam}, Bulgaria. Suitable prices and guaranteed quality.`,
      metaKeywords: `cars ${dynamicParam}, cars for sale ${dynamicParam}, Bulgaria`
    },
    brand: {
      pageType: 'brand',
      title: `Автомобили ${dynamicParam || 'марка'}`,
      subtitle: `Всички автомобили ${dynamicParam || 'тази марка'} на разположение за продажба`,
      defaultSort: 'year-desc',
      metaTitle: `${dynamicParam} Cars for Sale in Bulgaria | Globul Cars`,
      metaDescription: `Browse all ${dynamicParam} cars for sale. Various models and competitive prices.`,
      metaKeywords: `${dynamicParam}, ${dynamicParam} cars, ${dynamicParam} for sale`
    },
    new: {
      pageType: 'new',
      title: 'Нови автомобили',
      subtitle: 'Модерни автомобили от 2023 г. и нагоре',
      defaultSort: 'year-desc',
      metaTitle: 'New Cars for Sale in Bulgaria | Globul Cars',
      metaDescription: 'Browse the latest new and nearly new cars. 2023 and later models at suitable prices.',
      metaKeywords: 'new cars, modern models, 2023, 2024, recent cars'
    },
    used: {
      pageType: 'used',
      title: 'Употребявани автомобили',
      subtitle: 'Употребявани автомобили в добро състояние и на подходящи цени',
      defaultSort: 'price-asc',
      metaTitle: 'Used Cars for Sale in Bulgaria | Globul Cars',
      metaDescription: 'Browse thousands of used cars in excellent condition. Comprehensive inspection and quality guarantee.',
      metaKeywords: 'used cars, second hand cars, pre-owned cars'
    },
    economy: {
      pageType: 'economy',
      title: 'Икономични автомобили',
      subtitle: 'Автомобили с нисък разход на гориво',
      defaultSort: 'price-asc',
      metaTitle: 'Economy Cars - Low Fuel Consumption | Globul Cars',
      metaDescription: 'Browse economical cars with low fuel consumption. Save on operating costs.',
      metaKeywords: 'economy cars, low consumption, fuel saving'
    },
    // ✅ NEW: Body type filters
    suv: {
      pageType: 'suv' as PageType,
      title: 'SUV & Джипове',
      subtitle: 'Високопроходими автомобили за всякакви условия',
      defaultSort: 'year-desc',
      metaTitle: 'SUV and Jeeps for Sale in Bulgaria | Globul Cars',
      metaDescription: 'Browse SUV and Jeep vehicles. Off-road capable cars for city and adventure.',
      metaKeywords: 'SUV, jeep, 4x4, off-road, джипове'
    },
    sedan: {
      pageType: 'sedan' as PageType,
      title: 'Седани',
      subtitle: 'Класически 4-вратни автомобили',
      defaultSort: 'year-desc',
      metaTitle: 'Sedans for Sale in Bulgaria | Globul Cars',
      metaDescription: 'Browse classic sedan cars. Elegant and comfortable 4-door vehicles.',
      metaKeywords: 'sedan, saloon, 4-door, седан'
    },
    hatchback: {
      pageType: 'hatchback' as PageType,
      title: 'Хечбеци',
      subtitle: 'Компактни и практични автомобили',
      defaultSort: 'year-desc',
      metaTitle: 'Hatchbacks for Sale in Bulgaria | Globul Cars',
      metaDescription: 'Browse compact hatchback cars. Practical city vehicles.',
      metaKeywords: 'hatchback, compact, city car, хечбек'
    },
    // ✅ NEW: Fuel type filters
    diesel: {
      pageType: 'diesel' as PageType,
      title: 'Дизелови автомобили',
      subtitle: 'Икономични дизелови двигатели',
      defaultSort: 'year-desc',
      metaTitle: 'Diesel Cars for Sale in Bulgaria | Globul Cars',
      metaDescription: 'Browse fuel-efficient diesel cars. Lower consumption for long trips.',
      metaKeywords: 'diesel, fuel efficient, дизел, дизелови'
    },
    petrol: {
      pageType: 'petrol' as PageType,
      title: 'Бензинови автомобили',
      subtitle: 'Класически бензинови двигатели',
      defaultSort: 'year-desc',
      metaTitle: 'Petrol Cars for Sale in Bulgaria | Globul Cars',
      metaDescription: 'Browse petrol and gasoline cars. Various power options available.',
      metaKeywords: 'petrol, gasoline, бензин, бензинови'
    }
  };

  return configs[pageType] || configs.all;
}

/**
 * Build Firestore query constraints for page type
 */
export function buildQueryConstraints(
  pageType: PageType,
  dynamicParam?: string
): QueryConstraint[] {
  const constraints: QueryConstraint[] = [];

  switch (pageType) {
    case 'family':
      constraints.push(where('numberOfSeats', '>=', 7));
      break;

    case 'sport':
      // Note: Sport requires OR logic (doors = 2 OR power >= 270)
      // This will be handled by merging two queries in fetchSportCars()
      break;

    // ✅ NEW: Electric cars - fuel_type = electric
    case 'electric':
      constraints.push(where('fuelType', '==', 'electric'));
      break;

    // ✅ NEW: Hybrid cars - fuel_type = hybrid
    case 'hybrid':
      constraints.push(where('fuelType', '==', 'hybrid'));
      break;

    // ✅ NEW: Low mileage (like new) - mileage <= 3515 km
    case 'lowMileage':
      constraints.push(where('mileage', '<=', 3515));
      break;

    // ✅ NEW: Newly added - will be sorted by createdAt DESC
    case 'newlyAdded':
      // No filter, just sorting handled separately
      break;

    // ✅ NEW: Budget cars - price < 5000
    case 'budget':
      constraints.push(where('price', '<', 5000));
      break;

    // ✅ NEW: Verified dealers
    case 'verifiedDealer':
      constraints.push(where('dealerVerified', '==', true));
      constraints.push(where('sellerType', '==', 'dealer'));
      break;

    // ✅ NEW: Women's cars (pink and red colors)
    case 'womens':
      // Note: Color filtering is done client-side to avoid composite index requirement
      // Firestore 'in' operator with ordering requires a composite index
      break;

    case 'vip':
      constraints.push(where('price', '>=', 35000));
      break;

    case 'classic':
      constraints.push(where('year', '<', 1995));
      break;

    case 'city':
      if (dynamicParam) {
        constraints.push(where('city', '==', dynamicParam));
      }
      break;

    case 'brand':
      if (dynamicParam) {
        constraints.push(where('make', '==', dynamicParam));
      }
      break;

    case 'new':
      constraints.push(where('year', '>=', 2023));
      break;

    case 'used':
      constraints.push(where('year', '<', 2023));
      break;

    case 'economy':
      // Low fuel consumption (< 6L/100km)
      constraints.push(where('fuelConsumption', '<', 6));
      break;

    // ✅ NEW: Body type filters
    case 'suv':
      constraints.push(where('bodyType', '==', 'suv'));
      break;

    case 'sedan':
      constraints.push(where('bodyType', '==', 'sedan'));
      break;

    case 'hatchback':
      constraints.push(where('bodyType', '==', 'hatchback'));
      break;

    // ✅ NEW: Additional fuel type filters
    case 'diesel':
      constraints.push(where('fuelType', '==', 'diesel'));
      break;

    case 'petrol':
      constraints.push(where('fuelType', '==', 'petrol'));
      break;

    case 'all':
    default:
      // No filters for "all"
      break;
  }

  return constraints;
}

/**
 * Get collection names to query (multi-collection pattern)
 */
export function getCollectionNames(): string[] {
  return ['passenger_cars', 'suvs', 'vans', 'motorcycles', 'trucks', 'buses'];
}

/**
 * Fetch cars for a specific page type
 * Handles OR logic for sport cars by merging two queries
 */
export async function fetchCarsForPageType(
  pageType: PageType,
  dynamicParam?: string,
  limitCount: number = 50
): Promise<CarListing[]> {
  try {
    // Special handling for sport cars (OR logic)
    if (pageType === 'sport') {
      return await fetchSportCars(limitCount);
    }

    // Standard query for other page types
    const constraints = buildQueryConstraints(pageType, dynamicParam);
    const config = getShowcaseConfig(pageType, dynamicParam);
    // Include legacy collections for backward compatibility
    const legacyCollections = ['cars', 'listings'];
    const collectionNames = [...getCollectionNames(), ...legacyCollections];

    const allCars: CarListing[] = [];

    // Query each collection
    for (const collectionName of collectionNames) {
      const collectionRef = collection(db, collectionName);
      
      // Build query
      const queryConstraints: QueryConstraint[] = [...constraints];
      
      // Add sorting
      if (config.defaultSort === 'price-asc') {
        queryConstraints.push(orderBy('price', 'asc'));
      } else if (config.defaultSort === 'price-desc') {
        queryConstraints.push(orderBy('price', 'desc'));
      } else if (config.defaultSort === 'year-desc') {
        queryConstraints.push(orderBy('year', 'desc'));
      } else if (config.defaultSort === 'year-asc') {
        queryConstraints.push(orderBy('year', 'asc'));
      } else if (config.defaultSort === 'power-desc') {
        queryConstraints.push(orderBy('power', 'desc'));
      } else if (config.defaultSort === 'seats-desc') {
        queryConstraints.push(orderBy('numberOfSeats', 'desc'));
      }

      queryConstraints.push(limit(limitCount));

      const q = query(collectionRef, ...queryConstraints);
      const snapshot = await getDocs(q);

      snapshot.docs.forEach(doc => {
        allCars.push({ id: doc.id, ...doc.data() } as CarListing);
      });
    }

    // Apply client-side filters for specific page types
    let filteredCars = allCars;
    if (pageType === 'womens') {
      // Filter by feminine color variants (case-insensitive, substring match) in color, exteriorColor, or colorOther
      const feminineColors = [
        'red', 'pink', 'rose', 'magenta', 'cherry', 'fuchsia', 'coral', 'ruby', 'blush', 'wine', 'burgundy', 'raspberry', 'hot pink', 'salmon', 'flamingo', 'carmine', 'crimson', 'maroon', 'mulberry', 'peach', 'melon', 'bubblegum', 'cerise', 'azalea', 'candy', 'rouge', 'poppy', 'sangria', 'strawberry', 'currant', 'garnet', 'berry', 'lipstick', 'plum', 'orchid', 'lavender', 'amaranth', 'watermelon', 'shocking pink', 'rosewood', 'mauve', 'pastel pink', 'pastel red'
      ];
      filteredCars = allCars.filter(car => {
        const colorFields = [car.color, car.exteriorColor, car.colorOther].map(v => (v || '').toLowerCase());
        return feminineColors.some(femColor => colorFields.some(field => field.includes(femColor)));
      });
    }

    // For legacy cars, treat missing status/isActive as active by default
    filteredCars = filteredCars.filter(car => {
      const isActive = car.isActive !== false;
      const status = (car as any).status;
      const isPublished = status === 'published' || status === 'active' || status === undefined;
      const isSold = car.isSold === true;
      // Exclude sold cars
      return (isActive || isPublished) && !isSold;
    });
    // Sort and limit combined results
    const sortedCars = sortCars(filteredCars, config.defaultSort);
    return sortedCars.slice(0, limitCount);

  } catch (error) {
    logger.error('Error fetching cars for page type', error, { pageType, dynamicParam });
    throw error;
  }
}

/**
 * ✅ NEW: Fetch cars with cursor-based pagination
 * Returns paginated results with cursor for next page
 */
export async function fetchCarsForPageTypePaginated(
  pageType: PageType,
  dynamicParam?: string,
  pageSize: number = 20,
  lastDocument?: DocumentSnapshot | null
): Promise<PaginatedResult<CarListing>> {
  try {
    // Special handling for sport cars - no pagination for OR queries
    if (pageType === 'sport') {
      const cars = await fetchSportCars(pageSize);
      return {
        items: cars,
        lastDoc: null,
        hasMore: false,
        totalFetched: cars.length
      };
    }

    const constraints = buildQueryConstraints(pageType, dynamicParam);
    const config = getShowcaseConfig(pageType, dynamicParam);
    // Use primary collection for paginated queries
    const primaryCollection = 'passenger_cars';
    const collectionRef = collection(db, primaryCollection);
    
    // Build query constraints
    const queryConstraints: QueryConstraint[] = [...constraints];
    
    // Add sorting - must be consistent for pagination
    if (config.defaultSort === 'price-asc') {
      queryConstraints.push(orderBy('price', 'asc'));
    } else if (config.defaultSort === 'price-desc') {
      queryConstraints.push(orderBy('price', 'desc'));
    } else if (config.defaultSort === 'year-desc') {
      queryConstraints.push(orderBy('year', 'desc'));
    } else if (config.defaultSort === 'year-asc') {
      queryConstraints.push(orderBy('year', 'asc'));
    } else if (config.defaultSort === 'power-desc') {
      queryConstraints.push(orderBy('power', 'desc'));
    } else if (config.defaultSort === 'seats-desc') {
      queryConstraints.push(orderBy('numberOfSeats', 'desc'));
    } else {
      // Default sort by createdAt
      queryConstraints.push(orderBy('createdAt', 'desc'));
    }

    // Add cursor if provided
    if (lastDocument) {
      queryConstraints.push(startAfter(lastDocument));
    }

    // Fetch one extra to check if there are more
    queryConstraints.push(limit(pageSize + 1));

    const q = query(collectionRef, ...queryConstraints);
    const snapshot = await getDocs(q);

    const cars: CarListing[] = [];
    snapshot.docs.forEach(doc => {
      cars.push({ id: doc.id, ...doc.data() } as CarListing);
    });

    // Filter for active, non-sold cars
    const filteredCars = cars.filter(car => {
      const isActive = car.isActive !== false;
      const status = (car as any).status;
      const isPublished = status === 'published' || status === 'active' || status === undefined;
      const isSold = car.isSold === true;
      return (isActive || isPublished) && !isSold;
    });

    // Check if there are more results
    const hasMore = filteredCars.length > pageSize;
    const pageItems = hasMore ? filteredCars.slice(0, pageSize) : filteredCars;
    
    // Get last document for next page cursor
    const lastDoc = snapshot.docs.length > 0 
      ? snapshot.docs[Math.min(snapshot.docs.length - 1, pageSize - 1)]
      : null;

    logger.info('Paginated cars fetched', {
      pageType,
      dynamicParam,
      itemCount: pageItems.length,
      hasMore
    });

    return {
      items: pageItems,
      lastDoc,
      hasMore,
      totalFetched: pageItems.length
    };

  } catch (error) {
    logger.error('Error fetching paginated cars', error, { pageType, dynamicParam });
    throw error;
  }
}

/**
 * Special handler for sport cars (OR logic workaround)
 * Fetches cars with doors = 2 OR power >= 270
 */
async function fetchSportCars(limitCount: number = 50): Promise<CarListing[]> {
  try {
    const collectionNames = getCollectionNames();
    const allSportCars = new Map<string, CarListing>();

    for (const collectionName of collectionNames) {
      const collectionRef = collection(db, collectionName);

      // Query 1: doors = 2 (no orderBy to avoid index requirement)
      const query1 = query(
        collectionRef,
        where('numberOfDoors', '==', 2),
        limit(limitCount * 2) // Fetch extra to account for filtering
      );

      // Query 2: power >= 270 (no orderBy to avoid index requirement)
      const query2 = query(
        collectionRef,
        where('power', '>=', 270),
        limit(limitCount * 2) // Fetch extra to account for filtering
      );

      // Execute both queries in parallel
      const [snapshot1, snapshot2] = await Promise.all([
        getDocs(query1),
        getDocs(query2)
      ]);

      // Merge results (Map automatically deduplicates by ID)
      snapshot1.docs.forEach(doc => {
        allSportCars.set(doc.id, { id: doc.id, ...doc.data() } as CarListing);
      });

      snapshot2.docs.forEach(doc => {
        allSportCars.set(doc.id, { id: doc.id, ...doc.data() } as CarListing);
      });
    }

    // Convert to array and sort by power (descending) - CLIENT SIDE
    const sportCarsArray = Array.from(allSportCars.values());
    return sportCarsArray
      .sort((a, b) => (b.power || 0) - (a.power || 0))
      .slice(0, limitCount);

  } catch (error) {
    logger.error('Error fetching sport cars', error);
    throw error;
  }
}

/**
 * Sort cars based on sort option
 */
function sortCars(
  cars: CarListing[],
  sortOption: ShowcaseConfig['defaultSort']
): CarListing[] {
  const sorted = [...cars];

  switch (sortOption) {
    case 'price-asc':
      return sorted.sort((a, b) => (a.price || 0) - (b.price || 0));
    case 'price-desc':
      return sorted.sort((a, b) => (b.price || 0) - (a.price || 0));
    case 'year-desc':
      return sorted.sort((a, b) => (b.year || 0) - (a.year || 0));
    case 'year-asc':
      return sorted.sort((a, b) => (a.year || 0) - (b.year || 0));
    case 'power-desc':
      return sorted.sort((a, b) => (b.power || 0) - (a.power || 0));
    case 'seats-desc':
      return sorted.sort((a, b) => (b.numberOfSeats || 0) - (a.numberOfSeats || 0));
    default:
      return sorted;
  }
}

/**
 * Count total cars for a page type (for showing "X results")
 */
export async function countCarsForPageType(
  pageType: PageType,
  dynamicParam?: string
): Promise<number> {
  try {
    const cars = await fetchCarsForPageType(pageType, dynamicParam, 1000); // Get up to 1000 for counting
    return cars.length;
  } catch (error) {
    logger.error('Error counting cars', error, { pageType });
    return 0;
  }
}
