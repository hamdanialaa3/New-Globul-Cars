/**
 * SEO Location & Brand Data for Bulgarian Cities
 * Used for generating static SEO pages: /bmw-sofia, /audi-plovdiv, etc.
 */

export interface City {
  id: string;
  name: string;
  nameBg: string;
  population: number;
  region: string;
}

export interface Brand {
  id: string;
  name: string;
  nameBg: string;
  popular: boolean;
}

/**
 * Top Bulgarian Cities for Car Listings
 * София, Пловдив, Варна, Бургас, Русе, Стара Загора
 */
export const BULGARIAN_CITIES: City[] = [
  {
    id: 'sofia',
    name: 'Sofia',
    nameBg: 'София',
    population: 1236000,
    region: 'Sofia City'
  },
  {
    id: 'plovdiv',
    name: 'Plovdiv',
    nameBg: 'Пловдив',
    population: 346893,
    region: 'Plovdiv'
  },
  {
    id: 'varna',
    name: 'Varna',
    nameBg: 'Варна',
    population: 334870,
    region: 'Varna'
  },
  {
    id: 'burgas',
    name: 'Burgas',
    nameBg: 'Бургас',
    population: 202766,
    region: 'Burgas'
  },
  {
    id: 'ruse',
    name: 'Ruse',
    nameBg: 'Русе',
    population: 144936,
    region: 'Ruse'
  },
  {
    id: 'stara-zagora',
    name: 'Stara Zagora',
    nameBg: 'Стара Загора',
    population: 138272,
    region: 'Stara Zagora'
  },
  {
    id: 'pleven',
    name: 'Pleven',
    nameBg: 'Плевен',
    population: 99628,
    region: 'Pleven'
  },
  {
    id: 'sliven',
    name: 'Sliven',
    nameBg: 'Сливен',
    population: 87322,
    region: 'Sliven'
  }
];

/**
 * Popular Car Brands in Bulgaria
 * Most searched: BMW, Mercedes, Audi, VW, Toyota, Opel, Ford
 */
export const POPULAR_BRANDS: Brand[] = [
  { id: 'bmw', name: 'BMW', nameBg: 'БМВ', popular: true },
  { id: 'mercedes-benz', name: 'Mercedes-Benz', nameBg: 'Мерцедес-Бенц', popular: true },
  { id: 'audi', name: 'Audi', nameBg: 'Ауди', popular: true },
  { id: 'volkswagen', name: 'Volkswagen', nameBg: 'Фолксваген', popular: true },
  { id: 'toyota', name: 'Toyota', nameBg: 'Тойота', popular: true },
  { id: 'opel', name: 'Opel', nameBg: 'Опел', popular: true },
  { id: 'ford', name: 'Ford', nameBg: 'Форд', popular: true },
  { id: 'renault', name: 'Renault', nameBg: 'Рено', popular: true },
  { id: 'peugeot', name: 'Peugeot', nameBg: 'Пежо', popular: false },
  { id: 'citroen', name: 'Citroën', nameBg: 'Ситроен', popular: false },
  { id: 'skoda', name: 'Škoda', nameBg: 'Шкода', popular: true },
  { id: 'hyundai', name: 'Hyundai', nameBg: 'Хюндай', popular: false },
  { id: 'mazda', name: 'Mazda', nameBg: 'Мазда', popular: false },
  { id: 'volvo', name: 'Volvo', nameBg: 'Волво', popular: false }
];

/**
 * Generate all SEO route combinations
 * Returns: ['bmw-sofia', 'audi-plovdiv', ...]
 */
export function generateSEORoutes(): string[] {
  const routes: string[] = [];
  
  // Generate brand-city combinations (popular brands only)
  const popularBrands = POPULAR_BRANDS.filter(b => b.popular);
  
  for (const brand of popularBrands) {
    for (const city of BULGARIAN_CITIES) {
      routes.push(`${brand.id}-${city.id}`);
    }
  }
  
  return routes;
}

/**
 * Get SEO page metadata
 */
export function getSEOMetadata(brandId: string, cityId: string) {
  const brand = POPULAR_BRANDS.find(b => b.id === brandId);
  const city = BULGARIAN_CITIES.find(c => c.id === cityId);
  
  if (!brand || !city) {
    return null;
  }
  
  return {
    brand,
    city,
    title: `Използвани ${brand.nameBg} ${city.nameBg} | Koli One`,
    description: `Намерете най-добрите оферти за използвани ${brand.nameBg} автомобили в ${city.nameBg}. Проверени обяви, реални снимки, лесна комуникация.`,
    keywords: [
      `${brand.nameBg} ${city.nameBg}`,
      `използвани ${brand.name} ${city.name}`,
      `${brand.name} на изплащане`,
      `${brand.name} цени`,
      `автомобили ${city.nameBg}`
    ],
    url: `/${brandId}-${cityId}`,
    canonical: `https://kolione.bg/${brandId}-${cityId}`
  };
}
