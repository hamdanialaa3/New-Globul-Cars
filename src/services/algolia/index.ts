// Algolia Services Index
// Export all Algolia-related services

export { 
  algoliaClient, 
  carsIndex, 
  usersIndex, 
  dealershipsIndex,
  INDICES,
  searchConfig 
} from './algolia-client';

export { default as algoliaSearchService } from '../algoliaSearchService';

