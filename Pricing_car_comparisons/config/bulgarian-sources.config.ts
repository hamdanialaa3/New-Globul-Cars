/**
 * قائمة المواقع البلغارية لسوق السيارات
 * Bulgarian Car Market Sources Configuration
 */

import { MarketSource } from '../types/pricing.types';

export const BULGARIAN_CAR_MARKET_SOURCES: MarketSource[] = [
  {
    name: 'mobile.bg',
    url: 'https://www.mobile.bg',
    enabled: true,
    successRate: 95,
  },
  {
    name: 'cars.bg',
    url: 'https://www.cars.bg',
    enabled: true,
    successRate: 90,
  },
  {
    name: 'auto.bg',
    url: 'https://www.auto.bg',
    enabled: true,
    successRate: 85,
  },
  {
    name: 'olx.bg',
    url: 'https://www.olx.bg/avtomobili',
    enabled: true,
    successRate: 80,
  },
  {
    name: 'bazos.bg',
    url: 'https://bazos.bg/avtomobili',
    enabled: true,
    successRate: 75,
  },
  {
    name: 'carzone.bg',
    url: 'https://www.carzone.bg',
    enabled: true,
    successRate: 70,
  },
];

/**
 * Selectors للـ Web Scraping (يمكن تحديثها حسب تغيير المواقع)
 */
export const SCRAPING_SELECTORS = {
  'mobile.bg': {
    price: '.price',
    title: '.title',
    mileage: '.mileage',
    year: '.year',
    link: 'a',
  },
  'cars.bg': {
    price: '.car-price',
    title: '.car-title',
    mileage: '.car-mileage',
    year: '.car-year',
    link: 'a.car-link',
  },
  'auto.bg': {
    price: '.price-value',
    title: '.listing-title',
    mileage: '.odometer',
    year: '.year-value',
    link: 'a.listing-link',
  },
  'olx.bg': {
    price: '.price',
    title: '.title',
    mileage: '.details',
    year: '.details',
    link: 'a.link',
  },
  'bazos.bg': {
    price: '.cena',
    title: '.nadpis',
    mileage: '.popis',
    year: '.popis',
    link: 'a',
  },
};

/**
 * Search URL Patterns
 */
export const SEARCH_URL_PATTERNS = {
  'mobile.bg': (brand: string, model: string, year: number) =>
    `https://www.mobile.bg/pcgi/mobile.cgi?act=3&slink=${encodeURIComponent(brand)}&f1=${year}`,
  'cars.bg': (brand: string, model: string, year: number) =>
    `https://www.cars.bg/search.php?brand=${encodeURIComponent(brand)}&model=${encodeURIComponent(model)}&year=${year}`,
  'auto.bg': (brand: string, model: string, year: number) =>
    `https://www.auto.bg/search?make=${encodeURIComponent(brand)}&model=${encodeURIComponent(model)}&year=${year}`,
};

/**
 * Rate Limiting Configuration
 */
export const RATE_LIMITS = {
  requestsPerHour: 10,
  requestsPerDay: 50,
  scrapingDelay: 2000, // milliseconds between requests
};

/**
 * Cache Configuration
 */
export const CACHE_CONFIG = {
  ttl: 24 * 60 * 60 * 1000, // 24 hours in milliseconds
  maxEntries: 1000,
};
