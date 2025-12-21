// src/config/users-directory.config.ts
// Users Directory Configuration
// Centralized constants for users directory page

export const USERS_DIRECTORY_CONFIG = {
  // Pagination
  PAGINATION: {
    USERS_PER_PAGE: 30,
    MAX_ONLINE_USERS: 20,
    INITIAL_LOAD: 30,
  },
  
  // Limits
  LIMITS: {
    MAX_FOLLOWING: 1000,
    MAX_SEARCH_LENGTH: 100,
    MIN_SEARCH_LENGTH: 2,
  },
  
  // Debounce/Throttle
  TIMING: {
    SEARCH_DEBOUNCE: 300,
    FOLLOW_THROTTLE: 1000,
    CACHE_TTL: 5 * 60 * 1000, // 5 minutes
  },
  
  // Filters
  FILTERS: {
    PROFILE_TYPES: ['all', 'private', 'dealer', 'company'] as const,
    SORT_OPTIONS: ['name', 'newest', 'trust', 'listings'] as const,
  },
} as const;

export type ProfileTypeFilter = typeof USERS_DIRECTORY_CONFIG.FILTERS.PROFILE_TYPES[number];
export type SortOption = typeof USERS_DIRECTORY_CONFIG.FILTERS.SORT_OPTIONS[number];
