// Algolia Client Configuration
// Enhanced service for Bulgarian Car Marketplace

import algoliasearch from 'algoliasearch/lite';
import { SearchClient } from 'algoliasearch/lite';

// Use default values if env variables are not set
const APP_ID = (typeof import.meta !== 'undefined' && import.meta.env?.VITE_ALGOLIA_APP_ID) || 'RTGDK12KTJ';
const SEARCH_KEY = (typeof import.meta !== 'undefined' && import.meta.env?.VITE_ALGOLIA_SEARCH_KEY) || '01d60b828b7263114c11762ff5b7df9b';

// Initialize Algolia client
export const algoliaClient: SearchClient = algoliasearch(APP_ID, SEARCH_KEY);

// Index names
export const INDICES = {
  CARS: 'cars',
  USERS: 'users',
  DEALERSHIPS: 'dealerships',
  // Replica indices for sorting
  CARS_PRICE_ASC: 'cars_price_asc',
  CARS_PRICE_DESC: 'cars_price_desc',
  CARS_YEAR_DESC: 'cars_year_desc',
  CARS_MILEAGE_ASC: 'cars_mileage_asc'
} as const;

// Initialize indices
export const carsIndex = algoliaClient.initIndex(INDICES.CARS);
export const usersIndex = algoliaClient.initIndex(INDICES.USERS);
export const dealershipsIndex = algoliaClient.initIndex(INDICES.DEALERSHIPS);

// Search configuration
export const searchConfig = {
  hitsPerPage: 20,
  attributesToRetrieve: [
    'objectID',
    'make',
    'model',
    'year',
    'price',
    'mileage',
    'fuel',
    'transmission',
    'bodyType',
    'color',
    'images',
    'location',
    'condition',
    'ownerId',
    'ownerName',
    'ownerType',
    'createdAt',
    'status'
  ],
  attributesToHighlight: ['make', 'model', 'bodyType'],
  highlightPreTag: '<mark>',
  highlightPostTag: '</mark>',
  attributesForFaceting: [
    'filterOnly(make)',
    'filterOnly(model)',
    'filterOnly(year)',
    'filterOnly(fuel)',
    'filterOnly(transmission)',
    'filterOnly(bodyType)',
    'filterOnly(color)',
    'filterOnly(condition)',
    'filterOnly(location.city)',
    'filterOnly(location.region)',
    'searchable(make)',
    'searchable(model)'
  ],
  numericAttributesForFiltering: [
    'price',
    'year',
    'mileage',
    'power',
    'engineSize'
  ]
};

export default algoliaClient;

