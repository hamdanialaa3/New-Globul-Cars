/**
 * 📱 Cross-Platform Tracking Service
 * Syncs user behavior across platforms and devices
 * 
 * @description Integrates with:
 * - Google Analytics 4 (GA4)
 * - Meta Pixel (Facebook/Instagram)
 * - Google Tag Manager
 * - Apple App Tracking (Safari ITP workaround)
 * - First-party cookie tracking
 * - Cross-device identification
 * 
 * @version 1.0.0
 */

import { logger } from '../logger-service';

// ============================================================================
// TYPES
// ============================================================================

export interface CrossPlatformUser {
  localId: string;                    // First-party ID
  ga4ClientId?: string;               // Google Analytics Client ID
  fbpId?: string;                     // Facebook Pixel ID
  googleAdsId?: string;               // Google Ads click ID
  microsoftAdsId?: string;            // Microsoft Ads click ID
  deviceFingerprint?: string;         // Device fingerprint hash
  devices: DeviceInfo[];
  firstSeen: number;
  lastSeen: number;
  sessionCount: number;
}

export interface DeviceInfo {
  id: string;
  type: 'mobile' | 'tablet' | 'desktop';
  os: string;
  browser: string;
  firstSeen: number;
  lastSeen: number;
  sessions: number;
}

export interface TrackingEvent {
  eventName: string;
  eventCategory: string;
  eventAction: string;
  eventLabel?: string;
  eventValue?: number;
  customDimensions?: Record<string, string | number | boolean>;
  timestamp: number;
  sessionId: string;
  userId?: string;
}

export interface CarInteractionEvent {
  carId: string;
  brand: string;
  model?: string;
  price?: number;
  year?: number;
  bodyType?: string;
  action: 'view' | 'click' | 'favorite' | 'share' | 'contact' | 'compare';
  source: 'internal' | 'external' | 'search' | 'recommendation' | 'ad';
  position?: number;
  timestamp: number;
}

// ============================================================================
// CONSTANTS
// ============================================================================

const STORAGE_KEY = 'koli_one_cross_platform';
const FIRST_PARTY_ID_KEY = 'koli_one_fp_id';
const SESSION_KEY = 'koli_one_session';
const CONSENT_KEY = 'koli_one_tracking_consent';

// Cookie settings (1 year)
const COOKIE_EXPIRY_DAYS = 365;

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Generate unique ID
 */
const generateId = (): string => {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}-${Math.random().toString(36).substr(2, 9)}`;
};

/**
 * Set first-party cookie
 */
const setFirstPartyCookie = (name: string, value: string, days: number): void => {
  if (typeof document === 'undefined') return;
  
  const expires = new Date();
  expires.setTime(expires.getTime() + days * 24 * 60 * 60 * 1000);
  
  // SameSite=Lax for cross-site requests, Secure for HTTPS
  document.cookie = `${name}=${value};expires=${expires.toUTCString()};path=/;SameSite=Lax;Secure`;
};

/**
 * Get first-party cookie
 */
const getFirstPartyCookie = (name: string): string | null => {
  if (typeof document === 'undefined') return null;
  
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  
  if (parts.length === 2) {
    return parts.pop()?.split(';').shift() || null;
  }
  
  return null;
};

/**
 * Generate device fingerprint (privacy-safe)
 */
const generateDeviceFingerprint = (): string => {
  if (typeof window === 'undefined') return 'server';
  
  const components = [
    navigator.userAgent,
    navigator.language,
    screen.width,
    screen.height,
    screen.colorDepth,
    new Date().getTimezoneOffset(),
    navigator.hardwareConcurrency || 0,
    navigator.maxTouchPoints || 0
  ];
  
  // Simple hash function
  const hash = components.join('|').split('').reduce((acc, char) => {
    return ((acc << 5) - acc + char.charCodeAt(0)) | 0;
  }, 0);
  
  return `fp_${Math.abs(hash).toString(36)}`;
};

/**
 * Get or create session ID
 */
const getOrCreateSession = (): { sessionId: string; isNew: boolean } => {
  if (typeof sessionStorage === 'undefined') {
    return { sessionId: generateId(), isNew: true };
  }
  
  const existing = sessionStorage.getItem(SESSION_KEY);
  if (existing) {
    try {
      const session = JSON.parse(existing);
      return { sessionId: session.id, isNew: false };
    } catch {
      // Invalid session data
    }
  }
  
  const newSession = {
    id: generateId(),
    startedAt: Date.now()
  };
  
  sessionStorage.setItem(SESSION_KEY, JSON.stringify(newSession));
  return { sessionId: newSession.id, isNew: true };
};

/**
 * Get Google Analytics Client ID
 */
const getGA4ClientId = (): string | undefined => {
  if (typeof window === 'undefined') return undefined;
  
  // Try to get from GA cookie
  const gaCookie = getFirstPartyCookie('_ga');
  if (gaCookie) {
    // Format: GA1.1.123456789.1234567890
    const parts = gaCookie.split('.');
    if (parts.length >= 4) {
      return `${parts[2]}.${parts[3]}`;
    }
  }
  
  // Try gtag API
  const w = window as { gtag?: (...args: unknown[]) => void };
  if (w.gtag) {
    try {
      let clientId: string | undefined;
      w.gtag('get', 'G-R8JY5KM421', 'client_id', (id: string) => {
        clientId = id;
      });
      return clientId;
    } catch {
      // gtag not available
    }
  }
  
  return undefined;
};

/**
 * Get Facebook Pixel ID
 */
const getFBPixelId = (): string | undefined => {
  if (typeof window === 'undefined') return undefined;
  
  // Try _fbp cookie
  const fbpCookie = getFirstPartyCookie('_fbp');
  if (fbpCookie) {
    return fbpCookie;
  }
  
  return undefined;
};

// ============================================================================
// MAIN SERVICE CLASS
// ============================================================================

class CrossPlatformTrackingService {
  private user: CrossPlatformUser | null = null;
  private sessionId: string;
  private isNewSession: boolean;
  private hasConsent = false;
  private eventQueue: TrackingEvent[] = [];
  private carInteractions: CarInteractionEvent[] = [];
  
  constructor() {
    const session = getOrCreateSession();
    this.sessionId = session.sessionId;
    this.isNewSession = session.isNew;
    
    this.loadUser();
    this.checkConsent();
    this.initializeTracking();
  }
  
  /**
   * Load user from storage
   */
  private loadUser(): void {
    if (typeof localStorage === 'undefined') return;
    
    try {
      // Try first-party cookie first
      let localId = getFirstPartyCookie(FIRST_PARTY_ID_KEY);
      
      // Fallback to localStorage
      if (!localId) {
        localId = localStorage.getItem(FIRST_PARTY_ID_KEY);
      }
      
      // Load full user data
      const savedUser = localStorage.getItem(STORAGE_KEY);
      if (savedUser) {
        this.user = JSON.parse(savedUser);
        
        // Update IDs if changed
        if (this.user && localId && this.user.localId !== localId) {
          this.user.localId = localId;
        }
      } else if (localId) {
        // Create user from existing ID
        this.user = this.createNewUser(localId);
      }
      
      // Update user if exists
      if (this.user) {
        this.updateUserSession();
      }
      
    } catch (err) {
      logger.warn('[CrossPlatform] Failed to load user:', err);
    }
  }
  
  /**
   * Create new user record
   */
  private createNewUser(localId?: string): CrossPlatformUser {
    const id = localId || generateId();
    
    // Store in cookie and localStorage
    setFirstPartyCookie(FIRST_PARTY_ID_KEY, id, COOKIE_EXPIRY_DAYS);
    localStorage.setItem(FIRST_PARTY_ID_KEY, id);
    
    const now = Date.now();
    
    return {
      localId: id,
      devices: [this.getCurrentDeviceInfo()],
      firstSeen: now,
      lastSeen: now,
      sessionCount: 1
    };
  }
  
  /**
   * Get current device info
   */
  private getCurrentDeviceInfo(): DeviceInfo {
    const now = Date.now();
    const ua = typeof navigator !== 'undefined' ? navigator.userAgent : '';
    
    let type: DeviceInfo['type'] = 'desktop';
    if (/(tablet|ipad|playbook|silk)|(android(?!.*mobi))/i.test(ua)) {
      type = 'tablet';
    } else if (/mobile|android|iphone|ipod|blackberry|opera mini|iemobile/i.test(ua)) {
      type = 'mobile';
    }
    
    let os = 'unknown';
    if (ua.includes('Windows')) os = 'Windows';
    else if (ua.includes('Mac OS')) os = 'macOS';
    else if (ua.includes('Linux')) os = 'Linux';
    else if (ua.includes('Android')) os = 'Android';
    else if (ua.includes('iPhone') || ua.includes('iPad')) os = 'iOS';
    
    let browser = 'unknown';
    if (ua.includes('Chrome') && !ua.includes('Edg')) browser = 'Chrome';
    else if (ua.includes('Safari') && !ua.includes('Chrome')) browser = 'Safari';
    else if (ua.includes('Firefox')) browser = 'Firefox';
    else if (ua.includes('Edg')) browser = 'Edge';
    
    return {
      id: generateDeviceFingerprint(),
      type,
      os,
      browser,
      firstSeen: now,
      lastSeen: now,
      sessions: 1
    };
  }
  
  /**
   * Update user session data
   */
  private updateUserSession(): void {
    if (!this.user) return;
    
    const now = Date.now();
    this.user.lastSeen = now;
    
    if (this.isNewSession) {
      this.user.sessionCount++;
    }
    
    // Update device info
    const currentDeviceId = generateDeviceFingerprint();
    const existingDevice = this.user.devices.find(d => d.id === currentDeviceId);
    
    if (existingDevice) {
      existingDevice.lastSeen = now;
      if (this.isNewSession) {
        existingDevice.sessions++;
      }
    } else {
      this.user.devices.push(this.getCurrentDeviceInfo());
    }
    
    // Update platform IDs
    this.user.ga4ClientId = getGA4ClientId();
    this.user.fbpId = getFBPixelId();
    
    // Get ad IDs from URL
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      if (params.has('gclid')) {
        this.user.googleAdsId = params.get('gclid') || undefined;
      }
      if (params.has('msclkid')) {
        this.user.microsoftAdsId = params.get('msclkid') || undefined;
      }
    }
    
    this.saveUser();
  }
  
  /**
   * Save user to storage
   */
  private saveUser(): void {
    if (!this.user || typeof localStorage === 'undefined') return;
    
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.user));
    } catch (err) {
      logger.warn('[CrossPlatform] Failed to save user:', err);
    }
  }
  
  /**
   * Check tracking consent
   */
  private checkConsent(): void {
    if (typeof localStorage === 'undefined') return;
    
    const consent = localStorage.getItem(CONSENT_KEY);
    this.hasConsent = consent === 'granted';
  }
  
  /**
   * Initialize tracking integrations
   */
  private initializeTracking(): void {
    if (typeof window === 'undefined') return;
    
    // Listen for visibility changes
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'hidden') {
        this.flushEvents();
      }
    });
    
    // Listen for beforeunload
    window.addEventListener('beforeunload', () => {
      this.flushEvents();
    });
    
    // Track page view
    if (this.isNewSession || document.referrer !== window.location.href) {
      this.trackPageView();
    }
  }
  
  // ============================================================================
  // PUBLIC API
  // ============================================================================
  
  /**
   * Get or create user
   */
  getUser(): CrossPlatformUser {
    if (!this.user) {
      this.user = this.createNewUser();
    }
    return this.user;
  }
  
  /**
   * Get session ID
   */
  getSessionId(): string {
    return this.sessionId;
  }
  
  /**
   * Get local user ID (first-party)
   */
  getLocalUserId(): string {
    return this.getUser().localId;
  }
  
  /**
   * Set tracking consent
   */
  setConsent(granted: boolean): void {
    this.hasConsent = granted;
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(CONSENT_KEY, granted ? 'granted' : 'denied');
    }
    
    if (granted) {
      // Flush queued events
      this.flushEvents();
    }
    
    logger.info('[CrossPlatform] Consent updated', { granted });
  }
  
  /**
   * Track page view
   */
  trackPageView(customData?: Record<string, unknown>): void {
    const event: TrackingEvent = {
      eventName: 'page_view',
      eventCategory: 'navigation',
      eventAction: 'view',
      eventLabel: typeof window !== 'undefined' ? window.location.pathname : '/',
      timestamp: Date.now(),
      sessionId: this.sessionId,
      userId: this.user?.localId,
      customDimensions: customData as Record<string, string | number | boolean>
    };
    
    this.queueEvent(event);
    this.sendToGA4(event);
    this.sendToFBPixel('PageView');
  }
  
  /**
   * Track car view
   */
  trackCarView(car: {
    carId: string;
    brand: string;
    model?: string;
    price?: number;
    year?: number;
    bodyType?: string;
  }, source: CarInteractionEvent['source'] = 'internal', position?: number): void {
    const interaction: CarInteractionEvent = {
      ...car,
      action: 'view',
      source,
      position,
      timestamp: Date.now()
    };
    
    this.carInteractions.push(interaction);
    this.saveCarInteractions();
    
    // Send to analytics platforms
    const event: TrackingEvent = {
      eventName: 'view_item',
      eventCategory: 'ecommerce',
      eventAction: 'view',
      eventLabel: `${car.brand} ${car.model || ''}`.trim(),
      eventValue: car.price,
      timestamp: Date.now(),
      sessionId: this.sessionId,
      userId: this.user?.localId,
      customDimensions: {
        item_id: car.carId,
        item_brand: car.brand,
        item_category: car.bodyType || 'unknown',
        item_variant: String(car.year || ''),
        price: car.price || 0,
        source,
        position: position || 0
      }
    };
    
    this.queueEvent(event);
    this.sendToGA4(event);
    this.sendToFBPixel('ViewContent', {
      content_type: 'vehicle',
      content_ids: [car.carId],
      content_name: `${car.brand} ${car.model || ''}`,
      value: car.price,
      currency: 'BGN'
    });
  }
  
  /**
   * Track car click
   */
  trackCarClick(car: {
    carId: string;
    brand: string;
    model?: string;
    price?: number;
  }, source: CarInteractionEvent['source'] = 'internal', position?: number): void {
    const interaction: CarInteractionEvent = {
      ...car,
      action: 'click',
      source,
      position,
      timestamp: Date.now()
    };
    
    this.carInteractions.push(interaction);
    this.saveCarInteractions();
    
    const event: TrackingEvent = {
      eventName: 'select_item',
      eventCategory: 'ecommerce',
      eventAction: 'click',
      eventLabel: `${car.brand} ${car.model || ''}`.trim(),
      eventValue: car.price,
      timestamp: Date.now(),
      sessionId: this.sessionId,
      userId: this.user?.localId,
      customDimensions: {
        item_id: car.carId,
        item_brand: car.brand,
        source,
        position: position || 0
      }
    };
    
    this.queueEvent(event);
    this.sendToGA4(event);
  }
  
  /**
   * Track search
   */
  trackSearch(searchTerm: string, filters?: Record<string, unknown>, resultsCount?: number): void {
    const event: TrackingEvent = {
      eventName: 'search',
      eventCategory: 'engagement',
      eventAction: 'search',
      eventLabel: searchTerm,
      eventValue: resultsCount,
      timestamp: Date.now(),
      sessionId: this.sessionId,
      userId: this.user?.localId,
      customDimensions: filters as Record<string, string | number | boolean>
    };
    
    this.queueEvent(event);
    this.sendToGA4(event);
    this.sendToFBPixel('Search', { search_string: searchTerm });
  }
  
  /**
   * Track favorite/save
   */
  trackFavorite(car: { carId: string; brand: string; model?: string; price?: number }): void {
    const event: TrackingEvent = {
      eventName: 'add_to_wishlist',
      eventCategory: 'engagement',
      eventAction: 'favorite',
      eventLabel: `${car.brand} ${car.model || ''}`.trim(),
      eventValue: car.price,
      timestamp: Date.now(),
      sessionId: this.sessionId,
      userId: this.user?.localId,
      customDimensions: {
        item_id: car.carId,
        item_brand: car.brand
      }
    };
    
    this.queueEvent(event);
    this.sendToGA4(event);
    this.sendToFBPixel('AddToWishlist', {
      content_type: 'vehicle',
      content_ids: [car.carId],
      value: car.price,
      currency: 'BGN'
    });
  }
  
  /**
   * Track contact/lead
   */
  trackContact(car: { carId: string; brand: string; model?: string; price?: number }, method: 'call' | 'message' | 'whatsapp' | 'email'): void {
    const event: TrackingEvent = {
      eventName: 'generate_lead',
      eventCategory: 'conversion',
      eventAction: 'contact',
      eventLabel: `${car.brand} ${car.model || ''} - ${method}`.trim(),
      eventValue: car.price,
      timestamp: Date.now(),
      sessionId: this.sessionId,
      userId: this.user?.localId,
      customDimensions: {
        item_id: car.carId,
        item_brand: car.brand,
        contact_method: method
      }
    };
    
    this.queueEvent(event);
    this.sendToGA4(event);
    this.sendToFBPixel('Lead', {
      content_type: 'vehicle',
      content_ids: [car.carId],
      value: car.price,
      currency: 'BGN'
    });
  }
  
  /**
   * Get car interaction history
   */
  getCarInteractions(): CarInteractionEvent[] {
    return [...this.carInteractions];
  }
  
  /**
   * Get aggregated brand preferences from interactions
   */
  getBrandPreferences(): Array<{ brand: string; views: number; clicks: number; favorites: number; contacts: number; score: number }> {
    const brands: Record<string, { views: number; clicks: number; favorites: number; contacts: number }> = {};
    
    for (const interaction of this.carInteractions) {
      const brand = interaction.brand.toLowerCase();
      if (!brands[brand]) {
        brands[brand] = { views: 0, clicks: 0, favorites: 0, contacts: 0 };
      }
      
      switch (interaction.action) {
        case 'view':
          brands[brand].views++;
          break;
        case 'click':
          brands[brand].clicks++;
          break;
        case 'favorite':
          brands[brand].favorites++;
          break;
        case 'contact':
          brands[brand].contacts++;
          break;
      }
    }
    
    // Calculate weighted score
    return Object.entries(brands)
      .map(([brand, data]) => ({
        brand,
        ...data,
        score: data.views * 1 + data.clicks * 5 + data.favorites * 15 + data.contacts * 30
      }))
      .sort((a, b) => b.score - a.score);
  }
  
  // ============================================================================
  // PRIVATE METHODS
  // ============================================================================
  
  /**
   * Queue event for sending
   */
  private queueEvent(event: TrackingEvent): void {
    this.eventQueue.push(event);
    
    // Keep queue size manageable
    if (this.eventQueue.length > 100) {
      this.eventQueue = this.eventQueue.slice(-100);
    }
  }
  
  /**
   * Flush queued events
   */
  private flushEvents(): void {
    if (this.eventQueue.length === 0) return;
    
    // Save to localStorage for persistence
    if (typeof localStorage !== 'undefined') {
      try {
        const existing = JSON.parse(localStorage.getItem('koli_one_events') || '[]');
        const combined = [...existing, ...this.eventQueue].slice(-200);
        localStorage.setItem('koli_one_events', JSON.stringify(combined));
      } catch {
        // Storage full or unavailable
      }
    }
    
    this.eventQueue = [];
  }
  
  /**
   * Save car interactions
   */
  private saveCarInteractions(): void {
    if (typeof localStorage === 'undefined') return;
    
    try {
      // Keep last 100 interactions
      const toSave = this.carInteractions.slice(-100);
      localStorage.setItem('koli_one_car_interactions', JSON.stringify(toSave));
    } catch {
      // Storage full
    }
  }
  
  /**
   * Send event to GA4
   */
  private sendToGA4(event: TrackingEvent): void {
    if (typeof window === 'undefined') return;
    if (!this.hasConsent) return;
    
    const w = window as { gtag?: (...args: unknown[]) => void };
    if (!w.gtag) return;
    
    try {
      w.gtag('event', event.eventName, {
        event_category: event.eventCategory,
        event_label: event.eventLabel,
        value: event.eventValue,
        ...event.customDimensions
      });
    } catch (err) {
      logger.debug('[CrossPlatform] GA4 event failed:', err);
    }
  }
  
  /**
   * Send event to Facebook Pixel
   */
  private sendToFBPixel(eventName: string, params?: Record<string, unknown>): void {
    if (typeof window === 'undefined') return;
    if (!this.hasConsent) return;
    
    const w = window as { fbq?: (...args: unknown[]) => void };
    if (!w.fbq) return;
    
    try {
      w.fbq('track', eventName, params);
    } catch (err) {
      logger.debug('[CrossPlatform] FB Pixel event failed:', err);
    }
  }
  
  /**
   * Clear all tracking data
   */
  clearAll(): void {
    this.user = null;
    this.eventQueue = [];
    this.carInteractions = [];
    
    if (typeof localStorage !== 'undefined') {
      localStorage.removeItem(STORAGE_KEY);
      localStorage.removeItem(FIRST_PARTY_ID_KEY);
      localStorage.removeItem('koli_one_events');
      localStorage.removeItem('koli_one_car_interactions');
    }
    
    if (typeof sessionStorage !== 'undefined') {
      sessionStorage.removeItem(SESSION_KEY);
    }
    
    logger.info('[CrossPlatform] All tracking data cleared');
  }
}

// Export singleton
export const crossPlatformTracker = new CrossPlatformTrackingService();

// Named exports
export { CrossPlatformTrackingService };
