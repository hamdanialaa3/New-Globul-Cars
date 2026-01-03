/**
 * Query Builder Service
 * Builds Firestore queries for dynamic car showcase pages
 * Handles OR logic workaround by merging multiple queries
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
  Query
} from 'firebase/firestore';
import { db } from '../firebase/firebase-config';
import { PageType, ShowcaseQuery, ShowcaseConfig } from '../types/showcase.types';
import { CarListing } from '../types/CarListing';
import { logger } from './logger-service';

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
    }
  };

  return configs[pageType];
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
    const collectionNames = getCollectionNames();

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

    // Sort and limit combined results
    const sortedCars = sortCars(allCars, config.defaultSort);
    return sortedCars.slice(0, limitCount);

  } catch (error) {
    logger.error('Error fetching cars for page type', error, { pageType, dynamicParam });
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

      // Query 1: doors = 2
      const query1 = query(
        collectionRef,
        where('numberOfDoors', '==', 2),
        orderBy('power', 'desc'),
        limit(limitCount)
      );

      // Query 2: power >= 270
      const query2 = query(
        collectionRef,
        where('power', '>=', 270),
        orderBy('power', 'desc'),
        limit(limitCount)
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

    // Convert to array and sort by power (descending)
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
