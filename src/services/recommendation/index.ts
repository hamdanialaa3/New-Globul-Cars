/**
 * 📦 Recommendation Module Index
 * Exports all recommendation services and types
 * 
 * @version 2.0.0 - Now with external intent detection
 */

// Types
export * from './types';

// Core Services
export { behaviorService } from './behavior.service';
export { calculateScore, scoreAndRankCars, DEFAULT_CONFIG } from './scoring.service';
export { generatePrimaryReason, generateAdditionalReasons, getReasonText } from './reasons.service';
export { diversifyRecommendations } from './diversify.service';
export { cacheService } from './cache.service';

// External Intent Services (NEW in v2.0)
export { 
  externalIntentService, 
  type ExternalIntent, 
  type ExternalIntentPreferences 
} from './external-intent.service';

export { 
  crossPlatformTracker, 
  type CrossPlatformUser, 
  type CarInteractionEvent 
} from './cross-platform.service';

export { 
  intentAggregator, 
  type UnifiedIntent, 
  type BrandPreference 
} from './intent-aggregator.service';

// Main service
export {
  getRecommendations,
  refreshRecommendations,
  trackCarView,
  trackSearch,
  trackInteraction
} from './recommendation.service';

// Default export
export { default } from './recommendation.service';
