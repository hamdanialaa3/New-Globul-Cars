/**
 * Homepage Filter Service
 * خدمة فلاتر الصفحة الرئيسية
 * 
 * Implements smart filter logic for all 15 homepage sections
 * Based on: seats, engine_hp, mileage, fuel_type, created_at, price, etc.
 * 
 * @author Koli.one Team
 * @version 1.0.0
 * @date January 30, 2026
 */

import {
  collection,
  query,
  where,
  orderBy,
  limit,
  getDocs,
  QueryConstraint
} from 'firebase/firestore';

import { db } from '../../firebase/firebase-config';
import { CarListing } from '../../types/CarListing';
import { logger } from '../logger-service';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

/**
 * Filter categories for homepage sections
 */
export type FilterCategory =
  | 'family'           // 7+ seats
  | 'sports'           // 2 seats + 240+ HP
  | 'womens'           // pink & red colors
  | 'electric'         // fuel_type = electric
  | 'hybrid'           // fuel_type = hybrid
  | 'newly_added'      // sorted by created_at DESC
  | 'low_mileage_new'  // mileage <= 3515 km
  | 'budget'           // price < 5000 EUR
  | 'premium'          // price >= 35000 EUR
  | 'verified_dealer'  // dealer_verified = true
  | 'featured'         // is_featured = true
  | 'suv'              // body_type = SUV
  | 'sedan'            // body_type = Sedan
  | 'hatchback'        // body_type = Hatchback
  | 'van'              // body_type = Van/Minivan
  | 'truck'            // body_type = Truck
  | 'motorcycle'       // vehicle_type = motorcycle
  | 'classic'          // year < 1995
  | 'new_model'        // year >= 2023
  | 'diesel'           // fuel_type = diesel
  | 'petrol'           // fuel_type = petrol
  | 'all';             // no filter

/**
 * Filter configuration
 */
export interface FilterConfig {
  category: FilterCategory;
  title: { bg: string; en: string };
  subtitle: { bg: string; en: string };
  icon?: string;
  queryParams: Record<string, string | number | boolean>;
  seoMeta: {
    title: { bg: string; en: string };
    description: { bg: string; en: string };
    keywords: string[];
  };
}

/**
 * Auto-classification result
 */
export interface CarClassification {
  carId: string;
  tags: FilterCategory[];
  autoClassified: boolean;
  classifiedAt: Date;
}

// ============================================================================
// FILTER CONFIGURATIONS
// ============================================================================

export const FILTER_CONFIGS: Record<FilterCategory, FilterConfig> = {
  family: {
    category: 'family',
    title: { bg: 'Семейни автомобили', en: 'Family Cars' },
    subtitle: { bg: '7+ места за цялото семейство', en: '7+ seats for the whole family' },
    icon: '👨‍👩‍👧‍👦',
    queryParams: { seats_min: 7 },
    seoMeta: {
      title: { bg: 'Семейни коли с 7 места | Koli.one', en: 'Family Cars 7 Seats | Koli.one' },
      description: { 
        bg: 'Намерете перфектния семеен автомобил с 7+ места. Широк избор от миниванове и SUV.',
        en: 'Find the perfect family car with 7+ seats. Wide selection of minivans and SUVs.'
      },
      keywords: ['family cars', '7 seater', 'minivan', 'large SUV', 'семейни коли']
    }
  },
  sports: {
    category: 'sports',
    title: { bg: 'Спортни автомобили', en: 'Sports Cars' },
    subtitle: { bg: '2 места + 240+ к.с.', en: '2 seats + 240+ HP' },
    icon: '🏎️',
    queryParams: { seats_max: 2, engine_hp_min: 241 },
    seoMeta: {
      title: { bg: 'Спортни коли 240+ к.с. | Koli.one', en: 'Sports Cars 240+ HP | Koli.one' },
      description: { 
        bg: 'Открийте мощни спортни автомобили с 240+ конски сили и 2 места.',
        en: 'Discover powerful sports cars with 240+ horsepower and 2 seats.'
      },
      keywords: ['sports cars', 'coupe', 'high performance', '240 HP', 'спортни коли']
    }
  },
  womens: {
    category: 'womens',
    title: { bg: 'Дамски автомобили', en: "Women's Cars" },
    subtitle: { bg: 'Розово и червено боядисване', en: 'Pink and Red Colors' },
    icon: '💕',
    queryParams: { color: 'pink,red' },
    seoMeta: {
      title: { bg: 'Дамски коли розово и червено | Koli.one', en: "Women's Cars Pink & Red | Koli.one" },
      description: { 
        bg: 'Красиви автомобили в розово и червено. Перфектни за дамите.',
        en: 'Beautiful cars in pink and red colors. Perfect for women.'
      },
      keywords: ["women's cars", 'pink cars', 'red cars', 'дамски коли', 'розово']
    }
  },
  electric: {
    category: 'electric',
    title: { bg: 'Електрически автомобили', en: 'Electric Cars' },
    subtitle: { bg: '100% електрическо задвижване', en: '100% electric drive' },
    icon: '⚡',
    queryParams: { fuel: 'electric' },
    seoMeta: {
      title: { bg: 'Електрически коли | Koli.one', en: 'Electric Cars | Koli.one' },
      description: { 
        bg: 'Електрически автомобили с нулеви емисии. Tesla, BMW i, Nissan Leaf и други.',
        en: 'Electric cars with zero emissions. Tesla, BMW i, Nissan Leaf and more.'
      },
      keywords: ['electric cars', 'EV', 'Tesla', 'zero emissions', 'електрически коли']
    }
  },
  hybrid: {
    category: 'hybrid',
    title: { bg: 'Хибридни автомобили', en: 'Hybrid Cars' },
    subtitle: { bg: 'Комбинация от бензин и електричество', en: 'Combination of petrol and electricity' },
    icon: '🔋',
    queryParams: { fuel: 'hybrid' },
    seoMeta: {
      title: { bg: 'Хибридни коли | Koli.one', en: 'Hybrid Cars | Koli.one' },
      description: { 
        bg: 'Хибридни автомобили за по-ниски разходи за гориво.',
        en: 'Hybrid cars for lower fuel costs.'
      },
      keywords: ['hybrid cars', 'plug-in hybrid', 'PHEV', 'хибридни коли']
    }
  },
  newly_added: {
    category: 'newly_added',
    title: { bg: 'Ново добавени', en: 'Newly Added' },
    subtitle: { bg: 'Последните обяви първи', en: 'Latest listings first' },
    icon: '🆕',
    queryParams: { sort: 'created_desc' },
    seoMeta: {
      title: { bg: 'Нови обяви за коли | Koli.one', en: 'New Car Listings | Koli.one' },
      description: { 
        bg: 'Най-новите обяви за автомобили. Актуализирани всеки ден.',
        en: 'Latest car listings. Updated every day.'
      },
      keywords: ['new listings', 'latest cars', 'recent ads', 'нови обяви']
    }
  },
  low_mileage_new: {
    category: 'low_mileage_new',
    title: { bg: 'Като нови (ниски км)', en: 'Like New (Low Mileage)' },
    subtitle: { bg: 'Под 3,515 км пробег', en: 'Under 3,515 km mileage' },
    icon: '✨',
    queryParams: { mileage_max: 3515 },
    seoMeta: {
      title: { bg: 'Коли с нисък пробег | Koli.one', en: 'Low Mileage Cars | Koli.one' },
      description: { 
        bg: 'Автомобили в ново състояние с под 3,515 км пробег.',
        en: 'Cars in new condition with under 3,515 km mileage.'
      },
      keywords: ['low mileage', 'like new', 'minimal use', 'нисък пробег']
    }
  },
  budget: {
    category: 'budget',
    title: { bg: 'Бюджетни коли', en: 'Budget Cars' },
    subtitle: { bg: 'Под 5,000 EUR', en: 'Under 5,000 EUR' },
    icon: '💰',
    queryParams: { price_max: 5000 },
    seoMeta: {
      title: { bg: 'Евтини коли под 5000 EUR | Koli.one', en: 'Cheap Cars Under 5000 EUR | Koli.one' },
      description: { 
        bg: 'Достъпни автомобили на цена под 5,000 евро.',
        en: 'Affordable cars priced under 5,000 euros.'
      },
      keywords: ['cheap cars', 'budget cars', 'under 5000', 'евтини коли']
    }
  },
  premium: {
    category: 'premium',
    title: { bg: 'Премиум & Луксозни', en: 'Premium & Luxury' },
    subtitle: { bg: 'Над 35,000 EUR', en: 'Over 35,000 EUR' },
    icon: '👑',
    queryParams: { price_min: 35000 },
    seoMeta: {
      title: { bg: 'Луксозни коли | Koli.one', en: 'Luxury Cars | Koli.one' },
      description: { 
        bg: 'Премиум и луксозни автомобили от Mercedes, BMW, Audi.',
        en: 'Premium and luxury cars from Mercedes, BMW, Audi.'
      },
      keywords: ['luxury cars', 'premium', 'Mercedes', 'BMW', 'Audi', 'луксозни коли']
    }
  },
  verified_dealer: {
    category: 'verified_dealer',
    title: { bg: 'Проверени дилъри', en: 'Verified Dealers' },
    subtitle: { bg: 'Гарантирано качество', en: 'Guaranteed quality' },
    icon: '✅',
    queryParams: { dealer_verified: true, seller_type: 'dealer' },
    seoMeta: {
      title: { bg: 'Проверени автокъщи | Koli.one', en: 'Verified Car Dealers | Koli.one' },
      description: { 
        bg: 'Купувайте от проверени и сертифицирани автокъщи.',
        en: 'Buy from verified and certified car dealers.'
      },
      keywords: ['verified dealers', 'certified', 'trusted', 'проверени дилъри']
    }
  },
  featured: {
    category: 'featured',
    title: { bg: 'Препоръчани', en: 'Featured' },
    subtitle: { bg: 'Избрани от редактори', en: 'Editor picks' },
    icon: '⭐',
    queryParams: { is_featured: true },
    seoMeta: {
      title: { bg: 'Препоръчани коли | Koli.one', en: 'Featured Cars | Koli.one' },
      description: { 
        bg: 'Препоръчани автомобили избрани от нашия екип.',
        en: 'Featured cars selected by our team.'
      },
      keywords: ['featured', 'recommended', 'top picks', 'препоръчани']
    }
  },
  suv: {
    category: 'suv',
    title: { bg: 'SUV & Джипове', en: 'SUV & Jeeps' },
    subtitle: { bg: 'Високопроходими автомобили', en: 'Off-road vehicles' },
    icon: '🚙',
    queryParams: { body_type: 'suv' },
    seoMeta: {
      title: { bg: 'SUV и Джипове | Koli.one', en: 'SUV and Jeeps | Koli.one' },
      description: { 
        bg: 'SUV и джипове за градски и извънградски условия.',
        en: 'SUV and jeeps for urban and off-road conditions.'
      },
      keywords: ['SUV', 'jeep', 'off-road', '4x4', 'джипове']
    }
  },
  sedan: {
    category: 'sedan',
    title: { bg: 'Седани', en: 'Sedans' },
    subtitle: { bg: 'Класически 4-вратни автомобили', en: 'Classic 4-door cars' },
    icon: '🚗',
    queryParams: { body_type: 'sedan' },
    seoMeta: {
      title: { bg: 'Седани | Koli.one', en: 'Sedans | Koli.one' },
      description: { 
        bg: 'Седани - класически и елегантни автомобили.',
        en: 'Sedans - classic and elegant cars.'
      },
      keywords: ['sedan', 'saloon', '4-door', 'седан']
    }
  },
  hatchback: {
    category: 'hatchback',
    title: { bg: 'Хечбеци', en: 'Hatchbacks' },
    subtitle: { bg: 'Компактни и практични', en: 'Compact and practical' },
    icon: '🚘',
    queryParams: { body_type: 'hatchback' },
    seoMeta: {
      title: { bg: 'Хечбеци | Koli.one', en: 'Hatchbacks | Koli.one' },
      description: { 
        bg: 'Хечбеци - компактни автомобили за града.',
        en: 'Hatchbacks - compact city cars.'
      },
      keywords: ['hatchback', 'compact', 'city car', 'хечбек']
    }
  },
  van: {
    category: 'van',
    title: { bg: 'Ванове & Миниванове', en: 'Vans & Minivans' },
    subtitle: { bg: 'Просторни за семейство или бизнес', en: 'Spacious for family or business' },
    icon: '🚐',
    queryParams: { body_type: 'van' },
    seoMeta: {
      title: { bg: 'Ванове и Миниванове | Koli.one', en: 'Vans and Minivans | Koli.one' },
      description: { 
        bg: 'Ванове и миниванове за големи семейства.',
        en: 'Vans and minivans for large families.'
      },
      keywords: ['van', 'minivan', 'MPV', 'ван', 'минибус']
    }
  },
  truck: {
    category: 'truck',
    title: { bg: 'Камиони', en: 'Trucks' },
    subtitle: { bg: 'Товарни автомобили', en: 'Commercial vehicles' },
    icon: '🚚',
    queryParams: { vehicle_type: 'truck' },
    seoMeta: {
      title: { bg: 'Камиони | Koli.one', en: 'Trucks | Koli.one' },
      description: { 
        bg: 'Камиони и товарни автомобили.',
        en: 'Trucks and commercial vehicles.'
      },
      keywords: ['truck', 'lorry', 'commercial', 'камион']
    }
  },
  motorcycle: {
    category: 'motorcycle',
    title: { bg: 'Мотоциклети', en: 'Motorcycles' },
    subtitle: { bg: 'Двуколесни превозни средства', en: 'Two-wheeled vehicles' },
    icon: '🏍️',
    queryParams: { vehicle_type: 'motorcycle' },
    seoMeta: {
      title: { bg: 'Мотоциклети | Koli.one', en: 'Motorcycles | Koli.one' },
      description: { 
        bg: 'Мотоциклети и скутери за продажба.',
        en: 'Motorcycles and scooters for sale.'
      },
      keywords: ['motorcycle', 'motorbike', 'scooter', 'мотор', 'мотоциклет']
    }
  },
  classic: {
    category: 'classic',
    title: { bg: 'Класически коли', en: 'Classic Cars' },
    subtitle: { bg: 'Преди 1995 г.', en: 'Before 1995' },
    icon: '🕰️',
    queryParams: { year_max: 1994 },
    seoMeta: {
      title: { bg: 'Класически коли | Koli.one', en: 'Classic Cars | Koli.one' },
      description: { 
        bg: 'Класически и ретро автомобили от преди 1995 г.',
        en: 'Classic and vintage cars from before 1995.'
      },
      keywords: ['classic', 'vintage', 'retro', 'oldtimer', 'класически']
    }
  },
  new_model: {
    category: 'new_model',
    title: { bg: 'Нови модели', en: 'New Models' },
    subtitle: { bg: '2023 г. и по-нови', en: '2023 and newer' },
    icon: '🌟',
    queryParams: { year_min: 2023 },
    seoMeta: {
      title: { bg: 'Нови модели коли | Koli.one', en: 'New Car Models | Koli.one' },
      description: { 
        bg: 'Най-новите модели автомобили от 2023 г. нагоре.',
        en: 'Latest car models from 2023 onwards.'
      },
      keywords: ['new models', '2023', '2024', '2025', 'нови модели']
    }
  },
  diesel: {
    category: 'diesel',
    title: { bg: 'Дизелови коли', en: 'Diesel Cars' },
    subtitle: { bg: 'Икономични на гориво', en: 'Fuel efficient' },
    icon: '⛽',
    queryParams: { fuel: 'diesel' },
    seoMeta: {
      title: { bg: 'Дизелови коли | Koli.one', en: 'Diesel Cars | Koli.one' },
      description: { 
        bg: 'Дизелови автомобили с нисък разход на гориво.',
        en: 'Diesel cars with low fuel consumption.'
      },
      keywords: ['diesel', 'fuel efficient', 'дизел', 'дизелови']
    }
  },
  petrol: {
    category: 'petrol',
    title: { bg: 'Бензинови коли', en: 'Petrol Cars' },
    subtitle: { bg: 'Класически бензинови двигатели', en: 'Classic petrol engines' },
    icon: '🔥',
    queryParams: { fuel: 'petrol' },
    seoMeta: {
      title: { bg: 'Бензинови коли | Koli.one', en: 'Petrol Cars | Koli.one' },
      description: { 
        bg: 'Бензинови автомобили с различни мощности.',
        en: 'Petrol cars with various power options.'
      },
      keywords: ['petrol', 'gasoline', 'бензин', 'бензинови']
    }
  },
  all: {
    category: 'all',
    title: { bg: 'Всички автомобили', en: 'All Cars' },
    subtitle: { bg: 'Пълен каталог', en: 'Full catalog' },
    icon: '🚘',
    queryParams: {},
    seoMeta: {
      title: { bg: 'Всички коли | Koli.one', en: 'All Cars | Koli.one' },
      description: { 
        bg: 'Разгледайте всички автомобили в България.',
        en: 'Browse all cars in Bulgaria.'
      },
      keywords: ['all cars', 'car listings', 'Bulgaria', 'всички коли']
    }
  }
};

// ============================================================================
// FILTER SERVICE CLASS
// ============================================================================

class HomepageFilterService {
  private readonly collections = ['passenger_cars', 'suvs', 'vans', 'motorcycles', 'trucks', 'buses'];

  /**
   * Get filter configuration by category
   */
  getFilterConfig(category: FilterCategory): FilterConfig {
    return FILTER_CONFIGS[category];
  }

  /**
   * Get all filter configurations
   */
  getAllFilterConfigs(): FilterConfig[] {
    return Object.values(FILTER_CONFIGS);
  }

  /**
   * Build Firestore query constraints from filter category
   */
  buildQueryConstraints(category: FilterCategory): QueryConstraint[] {
    const constraints: QueryConstraint[] = [];
    const config = FILTER_CONFIGS[category];
    const params = config.queryParams;

    // Handle each parameter type
    if (params.seats_min) {
      constraints.push(where('numberOfSeats', '>=', params.seats_min));
    }
    if (params.seats_max) {
      constraints.push(where('numberOfSeats', '<=', params.seats_max));
    }
    if (params.engine_hp_min) {
      constraints.push(where('power', '>=', params.engine_hp_min));
    }
    if (params.fuel) {
      constraints.push(where('fuelType', '==', params.fuel));
    }
    if (params.mileage_max) {
      constraints.push(where('mileage', '<=', params.mileage_max));
    }
    if (params.price_min) {
      constraints.push(where('price', '>=', params.price_min));
    }
    if (params.price_max) {
      constraints.push(where('price', '<=', params.price_max));
    }
    if (params.body_type) {
      constraints.push(where('bodyType', '==', params.body_type));
    }
    if (params.year_min) {
      constraints.push(where('year', '>=', params.year_min));
    }
    if (params.year_max) {
      constraints.push(where('year', '<=', params.year_max));
    }
    if (params.dealer_verified) {
      constraints.push(where('dealerVerified', '==', true));
    }
    if (params.seller_type) {
      constraints.push(where('sellerType', '==', params.seller_type));
    }
    if (params.is_featured) {
      constraints.push(where('isFeatured', '==', true));
    }
    if (params.vehicle_type) {
      constraints.push(where('vehicleType', '==', params.vehicle_type));
    }
    // Handle color parameter - for women's cars (pink, red)
    // Note: Color filtering is handled in queryBuilder.service.ts with 'in' operator
    if (params.color && typeof params.color === 'string') {
      // Color filtering will be applied in the corresponding service
    }

    return constraints;
  }

  /**
   * Get sort order from category
   */
  getSortOrder(category: FilterCategory): { field: string; direction: 'asc' | 'desc' } {
    const sortMap: Record<FilterCategory, { field: string; direction: 'asc' | 'desc' }> = {
      family: { field: 'numberOfSeats', direction: 'desc' },
      sports: { field: 'power', direction: 'desc' },
      womens: { field: 'createdAt', direction: 'desc' },
      electric: { field: 'createdAt', direction: 'desc' },
      hybrid: { field: 'createdAt', direction: 'desc' },
      newly_added: { field: 'createdAt', direction: 'desc' },
      low_mileage_new: { field: 'mileage', direction: 'asc' },
      budget: { field: 'price', direction: 'asc' },
      premium: { field: 'price', direction: 'desc' },
      verified_dealer: { field: 'createdAt', direction: 'desc' },
      featured: { field: 'createdAt', direction: 'desc' },
      suv: { field: 'createdAt', direction: 'desc' },
      sedan: { field: 'createdAt', direction: 'desc' },
      hatchback: { field: 'createdAt', direction: 'desc' },
      van: { field: 'createdAt', direction: 'desc' },
      truck: { field: 'createdAt', direction: 'desc' },
      motorcycle: { field: 'createdAt', direction: 'desc' },
      classic: { field: 'year', direction: 'asc' },
      new_model: { field: 'year', direction: 'desc' },
      diesel: { field: 'createdAt', direction: 'desc' },
      petrol: { field: 'createdAt', direction: 'desc' },
      all: { field: 'createdAt', direction: 'desc' }
    };

    return sortMap[category] || { field: 'createdAt', direction: 'desc' };
  }

  /**
   * Fetch cars by filter category
   */
  async fetchCarsByCategory(
    category: FilterCategory,
    limitCount = 20
  ): Promise<CarListing[]> {
    try {
      logger.info('Fetching cars by category', { category, limitCount });

      // Special handling for sports cars (OR logic: 2 seats OR 240+ HP)
      if (category === 'sports') {
        return this.fetchSportsCars(limitCount);
      }

      const constraints = this.buildQueryConstraints(category);
      const sortOrder = this.getSortOrder(category);
      const allCars: CarListing[] = [];

      for (const collectionName of this.collections) {
        const collectionRef = collection(db, collectionName);
        const queryConstraints: QueryConstraint[] = [
          ...constraints,
          orderBy(sortOrder.field, sortOrder.direction),
          limit(limitCount)
        ];

        const q = query(collectionRef, ...queryConstraints);
        const snapshot = await getDocs(q);

        snapshot.docs.forEach(doc => {
          allCars.push({ id: doc.id, ...doc.data() } as CarListing);
        });
      }

      // Sort combined results
      const sortedCars = this.sortCars(allCars, sortOrder);
      return sortedCars.slice(0, limitCount);

    } catch (error) {
      logger.error('Error fetching cars by category', error as Error, { category });
      throw error;
    }
  }

  /**
   * Special handler for sports cars (OR logic)
   * Sports = (2 seats) OR (240+ HP)
   */
  private async fetchSportsCars(limitCount = 20): Promise<CarListing[]> {
    try {
      const allSportsCars = new Map<string, CarListing>();

      for (const collectionName of this.collections) {
        const collectionRef = collection(db, collectionName);

        // Query 1: 2 seats
        const query1 = query(
          collectionRef,
          where('numberOfSeats', '==', 2),
          orderBy('power', 'desc'),
          limit(limitCount)
        );

        // Query 2: 240+ HP
        const query2 = query(
          collectionRef,
          where('power', '>=', 240),
          orderBy('power', 'desc'),
          limit(limitCount)
        );

        const [snapshot1, snapshot2] = await Promise.all([
          getDocs(query1),
          getDocs(query2)
        ]);

        // Merge results (Map deduplicates by ID)
        snapshot1.docs.forEach(doc => {
          allSportsCars.set(doc.id, { id: doc.id, ...doc.data() } as CarListing);
        });
        snapshot2.docs.forEach(doc => {
          allSportsCars.set(doc.id, { id: doc.id, ...doc.data() } as CarListing);
        });
      }

      // Sort by power descending
      const sportsCarsArray = Array.from(allSportsCars.values());
      return sportsCarsArray
        .sort((a, b) => (b.power || 0) - (a.power || 0))
        .slice(0, limitCount);

    } catch (error) {
      logger.error('Error fetching sports cars', error as Error);
      throw error;
    }
  }

  /**
   * Sort cars based on sort order
   */
  private sortCars(
    cars: CarListing[],
    sortOrder: { field: string; direction: 'asc' | 'desc' }
  ): CarListing[] {
    const sorted = [...cars];
    const { field, direction } = sortOrder;

    return sorted.sort((a, b) => {
      const aVal = (a as unknown as Record<string, unknown>)[field] as number || 0;
      const bVal = (b as unknown as Record<string, unknown>)[field] as number || 0;
      return direction === 'asc' ? aVal - bVal : bVal - aVal;
    });
  }

  /**
   * Auto-classify a car based on its properties
   * Called when a car is created/updated
   */
  classifyCar(car: CarListing): FilterCategory[] {
    const tags: FilterCategory[] = [];

    // Family: 7+ seats
    if ((car.numberOfSeats || 0) >= 7) {
      tags.push('family');
    }

    // Sports: 2 seats AND 240+ HP
    if ((car.numberOfSeats || 0) === 2 && (car.power || 0) >= 240) {
      tags.push('sports');
    }

    // Electric
    if (car.fuelType === 'electric') {
      tags.push('electric');
    }

    // Hybrid
    if (car.fuelType === 'hybrid') {
      tags.push('hybrid');
    }

    // Low mileage new (under 3515 km)
    if ((car.mileage || 0) <= 3515) {
      tags.push('low_mileage_new');
    }

    // Budget (under 5000 EUR)
    if ((car.price || 0) < 5000) {
      tags.push('budget');
    }

    // Premium (over 35000 EUR)
    if ((car.price || 0) >= 35000) {
      tags.push('premium');
    }

    // Classic (before 1995)
    if ((car.year || 0) < 1995) {
      tags.push('classic');
    }

    // New model (2023+)
    if ((car.year || 0) >= 2023) {
      tags.push('new_model');
    }

    // Body type classifications
    const bodyType = ((car as unknown as Record<string, unknown>).bodyType as string)?.toLowerCase();
    if (bodyType === 'suv' || bodyType === 'jeep') {
      tags.push('suv');
    }
    if (bodyType === 'sedan' || bodyType === 'saloon') {
      tags.push('sedan');
    }
    if (bodyType === 'hatchback') {
      tags.push('hatchback');
    }
    if (bodyType === 'van' || bodyType === 'minivan' || bodyType === 'mpv') {
      tags.push('van');
    }

    // Fuel type classifications
    if (car.fuelType === 'diesel') {
      tags.push('diesel');
    }
    if (car.fuelType === 'petrol' || car.fuelType === 'gasoline') {
      tags.push('petrol');
    }

    // Verified dealer
    if ((car as unknown as Record<string, unknown>).dealerVerified) {
      tags.push('verified_dealer');
    }

    // Featured
    if (car.isFeatured) {
      tags.push('featured');
    }

    return tags;
  }

  /**
   * Build URL query string from filter category
   */
  buildUrlQueryString(category: FilterCategory): string {
    const config = FILTER_CONFIGS[category];
    const params = new URLSearchParams();

    Object.entries(config.queryParams).forEach(([key, value]) => {
      params.set(key, String(value));
    });

    return params.toString();
  }

  /**
   * Parse URL query string to determine filter category
   */
  parseUrlToCategory(queryString: string): FilterCategory {
    const params = new URLSearchParams(queryString);
    
    // Check each category for match
    for (const [category, config] of Object.entries(FILTER_CONFIGS)) {
      const configParams = config.queryParams;
      let matches = true;

      for (const [key, value] of Object.entries(configParams)) {
        if (params.get(key) !== String(value)) {
          matches = false;
          break;
        }
      }

      if (matches && Object.keys(configParams).length > 0) {
        return category as FilterCategory;
      }
    }

    return 'all';
  }

  /**
   * Count cars by category
   */
  async countCarsByCategory(category: FilterCategory): Promise<number> {
    try {
      const cars = await this.fetchCarsByCategory(category, 1000);
      return cars.length;
    } catch (error) {
      logger.error('Error counting cars by category', error as Error, { category });
      return 0;
    }
  }

  /**
   * Get section data for homepage
   */
  async getHomepageSectionData(
    sectionId: number,
    limitCount = 10
  ): Promise<{ category: FilterCategory; cars: CarListing[]; config: FilterConfig }> {
    // Map section IDs to categories
    const sectionCategoryMap: Record<number, FilterCategory> = {
      1: 'featured',        // Hero/Featured
      2: 'newly_added',     // Latest Listings
      3: 'family',          // Family Cars
      4: 'sports',          // Sports Cars
      5: 'electric',        // Electric Cars
      6: 'low_mileage_new', // Like New
      7: 'budget',          // Budget Cars
      8: 'premium',         // Premium/Luxury
      9: 'suv',             // SUV Section
      10: 'sedan',          // Sedan Section
      11: 'verified_dealer', // Verified Dealers
      12: 'classic',        // Classic Cars
      13: 'new_model',      // New Models
      14: 'diesel',         // Diesel Cars
      15: 'all'             // All Cars
    };

    const category = sectionCategoryMap[sectionId] || 'all';
    const config = this.getFilterConfig(category);
    const cars = await this.fetchCarsByCategory(category, limitCount);

    return { category, cars, config };
  }
}

// ============================================================================
// SINGLETON EXPORT
// ============================================================================

export const homepageFilterService = new HomepageFilterService();
export default homepageFilterService;
