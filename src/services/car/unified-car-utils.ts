// Unified Car Utils - Helper Methods and Utilities
// مساعدات السيارات الموحدة - طرق مساعدة وأدوات

import { homePageCache, CACHE_KEYS } from '../homepage-cache.service';

/**
 * Invalidate all car-related cache
 */
export function invalidateCarCache(): void {
  homePageCache.invalidate(CACHE_KEYS.FEATURED_CARS(4));
  homePageCache.invalidate(CACHE_KEYS.FEATURED_CARS(8));
  homePageCache.invalidate(CACHE_KEYS.FEATURED_CARS(10));
}
