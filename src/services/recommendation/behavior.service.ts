/**
 * 📊 Behavior Tracking Service
 * Служба за проследяване на поведението
 * 
 * @description Tracks user behavior for personalized recommendations
 * @features
 * - Search event logging
 * - View event logging
 * - Interaction tracking (favorites, contacts)
 * - Brand affinity computation
 * - Session vs User behavior
 * 
 * @performance
 * - Non-blocking async operations
 * - Local storage for session data
 * - Firestore for persistent user data
 * - Debounced writes
 */

import { logger } from '../logger-service';

import { 
  UserBehavior, 
  SessionBehavior, 
  SearchEvent, 
  ViewEvent, 
  InteractionEvent,
  BrandAffinity 
} from './types';

// ============================================================================
// CONSTANTS
// ============================================================================

const SESSION_STORAGE_KEY = 'koli_one_session_behavior';
const LOCAL_STORAGE_KEY = 'koli_one_user_behavior';
const MAX_SEARCHES = 20;
const MAX_VIEWS = 50;
const MAX_INTERACTIONS = 100;

// Brand affinity weights
const AFFINITY_WEIGHTS = {
  view: 5,
  view_repeated: 15,      // Same brand viewed 3+ times
  search: 10,
  favorite: 25,
  favorite_repeated: 40,  // 2+ favorites from same brand
  contact: 40,
  contact_repeated: 60    // 2+ contacts from same brand
};

// Time window for repeated actions (24 hours)
const REPEATED_ACTION_WINDOW = 24 * 60 * 60 * 1000;

// ============================================================================
// SESSION ID GENERATION
// ============================================================================

const generateSessionId = (): string => {
  return `session_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
};

const getOrCreateSessionId = (): string => {
  let sessionId = sessionStorage.getItem('koli_one_session_id');
  if (!sessionId) {
    sessionId = generateSessionId();
    sessionStorage.setItem('koli_one_session_id', sessionId);
  }
  return sessionId;
};

// ============================================================================
// LOCAL STORAGE HELPERS
// ============================================================================

const getSessionBehavior = (): SessionBehavior => {
  try {
    const data = sessionStorage.getItem(SESSION_STORAGE_KEY);
    if (data) {
      return JSON.parse(data);
    }
  } catch (err) {
    logger.error('[BehaviorService] Failed to parse session behavior:', err);
  }
  
  // Initialize new session behavior
  return {
    sessionId: getOrCreateSessionId(),
    filtersUsed: [],
    viewedCars: [],
    referrer: document.referrer || undefined,
    startTime: Date.now(),
    lastActivity: Date.now()
  };
};

const saveSessionBehavior = (behavior: SessionBehavior): void => {
  try {
    behavior.lastActivity = Date.now();
    sessionStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(behavior));
  } catch (err) {
    logger.error('[BehaviorService] Failed to save session behavior:', err);
  }
};

const getUserBehavior = (): UserBehavior | null => {
  try {
    const data = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (data) {
      return JSON.parse(data);
    }
  } catch (err) {
    logger.error('[BehaviorService] Failed to parse user behavior:', err);
  }
  return null;
};

const saveUserBehavior = (behavior: UserBehavior): void => {
  try {
    behavior.lastActive = Date.now();
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(behavior));
  } catch (err) {
    logger.error('[BehaviorService] Failed to save user behavior:', err);
  }
};

// ============================================================================
// BRAND AFFINITY COMPUTATION
// ============================================================================

const computeBrandAffinity = (behavior: UserBehavior | SessionBehavior): BrandAffinity[] => {
  const brandScores: Record<string, BrandAffinity> = {};
  const now = Date.now();
  
  // Helper to add score
  const addScore = (brand: string, type: string, weight: number) => {
    if (!brand) return;
    
    const normalizedBrand = brand.toLowerCase().trim();
    if (!brandScores[normalizedBrand]) {
      brandScores[normalizedBrand] = {
        brand: normalizedBrand,
        score: 0,
        signals: [],
        lastUpdated: now
      };
    }
    
    const signalType = type as 'view' | 'favorite' | 'contact' | 'search';
    const existing = brandScores[normalizedBrand].signals.find(s => s.type === signalType);
    if (existing) {
      existing.count++;
      existing.weight = weight;
    } else {
      brandScores[normalizedBrand].signals.push({
        type: signalType,
        count: 1,
        weight
      });
    }
    
    brandScores[normalizedBrand].score += weight;
    brandScores[normalizedBrand].lastUpdated = now;
  };
  
  // Process views
  const views = 'views' in behavior ? behavior.views : behavior.viewedCars;
  const recentViews = views.filter(v => now - v.timestamp < REPEATED_ACTION_WINDOW);
  
  // Count views per brand
  const viewCounts: Record<string, number> = {};
  recentViews.forEach(view => {
    if (view.brand) {
      const brand = view.brand.toLowerCase();
      viewCounts[brand] = (viewCounts[brand] || 0) + 1;
    }
  });
  
  // Add view scores
  Object.entries(viewCounts).forEach(([brand, count]) => {
    if (count >= 3) {
      addScore(brand, 'view', AFFINITY_WEIGHTS.view_repeated);
    } else {
      for (let i = 0; i < count; i++) {
        addScore(brand, 'view', AFFINITY_WEIGHTS.view);
      }
    }
  });
  
  // Process searches (only for UserBehavior)
  if ('searches' in behavior) {
    behavior.searches.forEach(search => {
      if (search.brand) {
        addScore(search.brand, 'search', AFFINITY_WEIGHTS.search);
      }
    });
  }
  
  // Process favorites (only for UserBehavior)
  if ('favorites' in behavior && 'views' in behavior) {
    // Get brands from favorite car IDs using views
    const favoriteBrands: Record<string, number> = {};
    behavior.favorites.forEach(carId => {
      const view = behavior.views.find(v => v.carId === carId);
      if (view?.brand) {
        const brand = view.brand.toLowerCase();
        favoriteBrands[brand] = (favoriteBrands[brand] || 0) + 1;
      }
    });
    
    Object.entries(favoriteBrands).forEach(([brand, count]) => {
      if (count >= 2) {
        addScore(brand, 'favorite', AFFINITY_WEIGHTS.favorite_repeated);
      } else {
        addScore(brand, 'favorite', AFFINITY_WEIGHTS.favorite);
      }
    });
  }
  
  // Process interactions (only for UserBehavior)
  if ('interactions' in behavior && 'views' in behavior) {
    const contactBrands: Record<string, number> = {};
    
    behavior.interactions
      .filter(i => i.type === 'contact')
      .forEach(interaction => {
        const view = behavior.views.find(v => v.carId === interaction.carId);
        if (view?.brand) {
          const brand = view.brand.toLowerCase();
          contactBrands[brand] = (contactBrands[brand] || 0) + 1;
        }
      });
    
    Object.entries(contactBrands).forEach(([brand, count]) => {
      if (count >= 2) {
        addScore(brand, 'contact', AFFINITY_WEIGHTS.contact_repeated);
      } else {
        addScore(brand, 'contact', AFFINITY_WEIGHTS.contact);
      }
    });
  }
  
  // Convert to array and sort by score
  const affinities = Object.values(brandScores)
    .sort((a, b) => b.score - a.score)
    .slice(0, 10); // Keep top 10 brands
  
  // Cap scores at 100
  affinities.forEach(a => {
    a.score = Math.min(a.score, 100);
  });
  
  return affinities;
};

// ============================================================================
// PREFERENCE EXTRACTION
// ============================================================================

const extractPreferences = (behavior: UserBehavior): UserBehavior['preferences'] => {
  const preferences: UserBehavior['preferences'] = {
    preferredBrands: [],
    priceRange: null,
    yearRange: null,
    fuelTypes: [],
    bodyTypes: [],
    gearboxTypes: []
  };
  
  // Extract from searches
  const brands: Record<string, number> = {};
  const fuels: Record<string, number> = {};
  const bodyTypes: Record<string, number> = {};
  const gearboxes: Record<string, number> = {};
  const prices: number[] = [];
  const years: number[] = [];
  
  behavior.searches.forEach(search => {
    if (search.brand) brands[search.brand] = (brands[search.brand] || 0) + 1;
    if (search.fuel) fuels[search.fuel] = (fuels[search.fuel] || 0) + 1;
    if (search.bodyType) bodyTypes[search.bodyType] = (bodyTypes[search.bodyType] || 0) + 1;
    if (search.gearbox) gearboxes[search.gearbox] = (gearboxes[search.gearbox] || 0) + 1;
    if (search.priceMin) prices.push(search.priceMin);
    if (search.priceMax) prices.push(search.priceMax);
    if (search.yearMin) years.push(search.yearMin);
    if (search.yearMax) years.push(search.yearMax);
  });
  
  // Extract from views
  behavior.views.forEach(view => {
    if (view.brand) brands[view.brand] = (brands[view.brand] || 0) + 2; // Views weight more
    if (view.fuel) fuels[view.fuel] = (fuels[view.fuel] || 0) + 2;
    if (view.bodyType) bodyTypes[view.bodyType] = (bodyTypes[view.bodyType] || 0) + 2;
    if (view.price) prices.push(view.price);
  });
  
  // Top brands (sorted by count)
  preferences.preferredBrands = Object.entries(brands)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([brand]) => brand);
  
  // Top fuel types
  preferences.fuelTypes = Object.entries(fuels)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([fuel]) => fuel);
  
  // Top body types
  preferences.bodyTypes = Object.entries(bodyTypes)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([bodyType]) => bodyType);
  
  // Top gearboxes
  preferences.gearboxTypes = Object.entries(gearboxes)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 2)
    .map(([gearbox]) => gearbox);
  
  // Price range (use percentiles)
  if (prices.length > 0) {
    prices.sort((a, b) => a - b);
    preferences.priceRange = {
      min: prices[Math.floor(prices.length * 0.1)] || prices[0],
      max: prices[Math.floor(prices.length * 0.9)] || prices[prices.length - 1]
    };
  }
  
  // Year range
  if (years.length > 0) {
    years.sort((a, b) => a - b);
    preferences.yearRange = {
      min: years[0],
      max: years[years.length - 1]
    };
  }
  
  return preferences;
};

// ============================================================================
// BEHAVIOR SERVICE CLASS
// ============================================================================

class BehaviorService {
  private sessionBehavior: SessionBehavior;
  private userBehavior: UserBehavior | null = null;
  private userId: string | null = null;
  private writeDebounceTimer: NodeJS.Timeout | null = null;
  
  constructor() {
    this.sessionBehavior = getSessionBehavior();
    this.userBehavior = getUserBehavior();
    
    logger.info('[BehaviorService] Initialized', {
      sessionId: this.sessionBehavior.sessionId,
      hasUserBehavior: !!this.userBehavior
    });
  }
  
  /**
   * Set user ID (call after login)
   */
  setUserId(userId: string): void {
    this.userId = userId;
    
    // Initialize or load user behavior
    if (!this.userBehavior || this.userBehavior.userId !== userId) {
      this.userBehavior = {
        userId,
        sessionId: this.sessionBehavior.sessionId,
        searches: [],
        views: [],
        favorites: [],
        interactions: [],
        brandAffinity: [],
        preferences: {
          preferredBrands: [],
          priceRange: null,
          yearRange: null,
          fuelTypes: [],
          bodyTypes: [],
          gearboxTypes: []
        },
        preferredLanguage: 'bg',
        firstSeen: Date.now(),
        lastActive: Date.now(),
        sessionCount: 1
      };
      
      // Merge session behavior into user behavior
      this.mergeSessionToUser();
    }
    
    this.userBehavior.sessionCount++;
    this.saveDebounced();
    
    logger.info('[BehaviorService] User ID set', { userId });
  }
  
  /**
   * Merge session behavior into user behavior
   */
  private mergeSessionToUser(): void {
    if (!this.userBehavior) return;
    
    const userBehavior = this.userBehavior;
    
    // Merge views
    this.sessionBehavior.viewedCars.forEach(view => {
      if (!userBehavior.views.some(v => v.carId === view.carId && v.timestamp === view.timestamp)) {
        userBehavior.views.push(view);
      }
    });
    
    // Merge searches
    this.sessionBehavior.filtersUsed.forEach(search => {
      if (!userBehavior.searches.some(s => s.timestamp === search.timestamp)) {
        userBehavior.searches.push(search);
      }
    });
    
    // Trim to max limits
    this.userBehavior.views = this.userBehavior.views.slice(-MAX_VIEWS);
    this.userBehavior.searches = this.userBehavior.searches.slice(-MAX_SEARCHES);
  }
  
  /**
   * Track search event
   */
  trackSearch(search: Omit<SearchEvent, 'timestamp'>): void {
    const event: SearchEvent = {
      ...search,
      timestamp: Date.now()
    };
    
    // Add to session
    this.sessionBehavior.filtersUsed.push(event);
    this.sessionBehavior.filtersUsed = this.sessionBehavior.filtersUsed.slice(-MAX_SEARCHES);
    
    // Add to user if logged in
    if (this.userBehavior) {
      this.userBehavior.searches.push(event);
      this.userBehavior.searches = this.userBehavior.searches.slice(-MAX_SEARCHES);
    }
    
    this.saveDebounced();
    
    logger.debug('[BehaviorService] Search tracked', { brand: search.brand });
  }
  
  /**
   * Track view event
   */
  trackView(view: Omit<ViewEvent, 'timestamp'>): void {
    const event: ViewEvent = {
      ...view,
      timestamp: Date.now()
    };
    
    // Add to session
    this.sessionBehavior.viewedCars.push(event);
    this.sessionBehavior.viewedCars = this.sessionBehavior.viewedCars.slice(-MAX_VIEWS);
    
    // Add to user if logged in
    if (this.userBehavior) {
      this.userBehavior.views.push(event);
      this.userBehavior.views = this.userBehavior.views.slice(-MAX_VIEWS);
    }
    
    this.saveDebounced();
    
    logger.debug('[BehaviorService] View tracked', { carId: view.carId, brand: view.brand });
  }
  
  /**
   * Track interaction event
   */
  trackInteraction(carId: string, type: InteractionEvent['type']): void {
    const event: InteractionEvent = {
      carId,
      type,
      timestamp: Date.now()
    };
    
    if (this.userBehavior) {
      this.userBehavior.interactions.push(event);
      this.userBehavior.interactions = this.userBehavior.interactions.slice(-MAX_INTERACTIONS);
      
      // Track favorites separately
      if (type === 'favorite' && !this.userBehavior.favorites.includes(carId)) {
        this.userBehavior.favorites.push(carId);
      }
    }
    
    this.saveDebounced();
    
    logger.debug('[BehaviorService] Interaction tracked', { carId, type });
  }
  
  /**
   * Remove from favorites
   */
  removeFavorite(carId: string): void {
    if (this.userBehavior) {
      this.userBehavior.favorites = this.userBehavior.favorites.filter(id => id !== carId);
      this.saveDebounced();
    }
  }
  
  /**
   * Get current behavior (session or user)
   */
  getBehavior(): UserBehavior | SessionBehavior {
    if (this.userBehavior) {
      // Recompute affinities and preferences
      this.userBehavior.brandAffinity = computeBrandAffinity(this.userBehavior);
      this.userBehavior.preferences = extractPreferences(this.userBehavior);
      return this.userBehavior;
    }
    return this.sessionBehavior;
  }
  
  /**
   * Get brand affinities
   */
  getBrandAffinities(): BrandAffinity[] {
    const behavior = this.getBehavior();
    return computeBrandAffinity(behavior);
  }
  
  /**
   * Get session ID
   */
  getSessionId(): string {
    return this.sessionBehavior.sessionId;
  }
  
  /**
   * Check if user is logged in
   */
  isLoggedIn(): boolean {
    return !!this.userId && !!this.userBehavior;
  }
  
  /**
   * Debounced save to storage
   */
  private saveDebounced(): void {
    if (this.writeDebounceTimer) {
      clearTimeout(this.writeDebounceTimer);
    }
    
    this.writeDebounceTimer = setTimeout(() => {
      saveSessionBehavior(this.sessionBehavior);
      if (this.userBehavior) {
        saveUserBehavior(this.userBehavior);
      }
    }, 500);
  }
  
  /**
   * Force save (call before page unload)
   */
  forceSave(): void {
    if (this.writeDebounceTimer) {
      clearTimeout(this.writeDebounceTimer);
    }
    saveSessionBehavior(this.sessionBehavior);
    if (this.userBehavior) {
      saveUserBehavior(this.userBehavior);
    }
  }
  
  /**
   * Clear all behavior data
   */
  clearAll(): void {
    sessionStorage.removeItem(SESSION_STORAGE_KEY);
    sessionStorage.removeItem('koli_one_session_id');
    localStorage.removeItem(LOCAL_STORAGE_KEY);
    
    this.sessionBehavior = getSessionBehavior();
    this.userBehavior = null;
    this.userId = null;
    
    logger.info('[BehaviorService] All behavior data cleared');
  }
}

// ============================================================================
// SINGLETON EXPORT
// ============================================================================

export const behaviorService = new BehaviorService();

// Save on page unload
if (typeof window !== 'undefined') {
  window.addEventListener('beforeunload', () => {
    behaviorService.forceSave();
  });
}

export default behaviorService;
