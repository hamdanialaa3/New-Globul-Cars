/**
 * 🌐 External Intent Detection Service
 * Captures user intent from external sources
 * 
 * @description Detects user preferences from:
 * - Google/Bing/Yandex search queries (referrer parsing)
 * - UTM campaign parameters
 * - Deep links with car/brand parameters
 * - Social media referrals (Facebook, Instagram, TikTok)
 * - Google Ads / Meta Ads click data
 * - Email campaign links
 * - Affiliate tracking parameters
 * 
 * @version 1.0.0
 */

import { logger } from '../logger-service';

// ============================================================================
// TYPES
// ============================================================================

export interface ExternalIntent {
  source: 'google' | 'bing' | 'yandex' | 'facebook' | 'instagram' | 'tiktok' | 'twitter' | 'email' | 'direct' | 'affiliate' | 'unknown';
  medium: 'organic' | 'cpc' | 'social' | 'email' | 'referral' | 'affiliate' | 'direct' | 'unknown';
  campaign?: string;
  searchQuery?: string;
  keywords: string[];
  brands: string[];
  models: string[];
  bodyTypes: string[];
  priceRange?: { min?: number; max?: number };
  yearRange?: { min?: number; max?: number };
  fuel?: string;
  gearbox?: string;
  referrerUrl?: string;
  landingPage: string;
  timestamp: number;
  sessionId: string;
  deviceType: 'mobile' | 'tablet' | 'desktop';
  browser: string;
  os: string;
}

export interface AdClickData {
  platform: 'google_ads' | 'meta_ads' | 'tiktok_ads' | 'microsoft_ads' | 'unknown';
  campaignId?: string;
  adGroupId?: string;
  adId?: string;
  keyword?: string;
  matchType?: 'exact' | 'phrase' | 'broad';
  targetBrand?: string;
  targetModel?: string;
  targetBodyType?: string;
  clickCost?: number;
  timestamp: number;
}

// ============================================================================
// CONSTANTS
// ============================================================================

// Known car brands for extraction
const CAR_BRANDS = [
  'bmw', 'mercedes', 'audi', 'volkswagen', 'vw', 'toyota', 'honda', 'mazda',
  'nissan', 'hyundai', 'kia', 'ford', 'opel', 'peugeot', 'renault', 'citroen',
  'skoda', 'seat', 'volvo', 'porsche', 'lexus', 'infiniti', 'land rover',
  'range rover', 'jaguar', 'mini', 'fiat', 'alfa romeo', 'jeep', 'dodge',
  'chevrolet', 'subaru', 'mitsubishi', 'suzuki', 'dacia', 'tesla', 'smart'
];

// Body types in Bulgarian and English
const BODY_TYPES = {
  'sedan': ['sedan', 'седан', 'limousine', 'лимузина'],
  'suv': ['suv', 'джип', 'jeep', '4x4', 'crossover', 'кросоувър'],
  'hatchback': ['hatchback', 'хечбек', 'хатчбек'],
  'wagon': ['wagon', 'комби', 'combi', 'estate', 'touring'],
  'coupe': ['coupe', 'купе', 'coupé'],
  'cabrio': ['cabrio', 'cabriolet', 'кабриолет', 'convertible', 'roadster'],
  'van': ['van', 'ван', 'mpv', 'минибус', 'minivan'],
  'pickup': ['pickup', 'пикап', 'truck']
};

// Fuel types
const FUEL_TYPES = {
  'petrol': ['petrol', 'бензин', 'benzin', 'gasoline', 'gas'],
  'diesel': ['diesel', 'дизел', 'dizel'],
  'hybrid': ['hybrid', 'хибрид', 'hibrid'],
  'electric': ['electric', 'електрически', 'elektro', 'ev', 'bev'],
  'plugin': ['plug-in', 'plugin', 'phev', 'плъгин'],
  'lpg': ['lpg', 'газ', 'gaz', 'метан', 'cng']
};

// Gearbox types
const GEARBOX_TYPES = {
  'automatic': ['automatic', 'автоматик', 'автоматична', 'auto', 'авто'],
  'manual': ['manual', 'ръчна', 'ръчни', 'скорости', 'mechanic']
};

// Search engine patterns
const SEARCH_ENGINE_PATTERNS = {
  google: /google\.(com|bg|de|co\.uk|fr|es|it|nl|pl|ru)/i,
  bing: /bing\.com/i,
  yandex: /yandex\.(com|ru|bg)/i,
  duckduckgo: /duckduckgo\.com/i,
  yahoo: /yahoo\.com/i
};

// Social media patterns
const SOCIAL_PATTERNS = {
  facebook: /facebook\.com|fb\.com|fbclid/i,
  instagram: /instagram\.com|ig\./i,
  tiktok: /tiktok\.com|tiktok/i,
  twitter: /twitter\.com|t\.co|x\.com/i,
  linkedin: /linkedin\.com/i,
  pinterest: /pinterest\.com/i
};

// Storage keys
const STORAGE_KEY = 'koli_one_external_intent';
const SESSION_KEY = 'koli_one_external_session';

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Generate unique session ID
 */
const generateSessionId = (): string => {
  return `ext_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

/**
 * Get or create session ID
 */
const getSessionId = (): string => {
  if (typeof window === 'undefined') return generateSessionId();
  
  let sessionId = sessionStorage.getItem(SESSION_KEY);
  if (!sessionId) {
    sessionId = generateSessionId();
    sessionStorage.setItem(SESSION_KEY, sessionId);
  }
  return sessionId;
};

/**
 * Detect device type
 */
const detectDeviceType = (): 'mobile' | 'tablet' | 'desktop' => {
  if (typeof window === 'undefined') return 'desktop';
  
  const ua = navigator.userAgent.toLowerCase();
  
  if (/(tablet|ipad|playbook|silk)|(android(?!.*mobi))/i.test(ua)) {
    return 'tablet';
  }
  if (/mobile|android|iphone|ipod|blackberry|opera mini|iemobile/i.test(ua)) {
    return 'mobile';
  }
  return 'desktop';
};

/**
 * Detect browser
 */
const detectBrowser = (): string => {
  if (typeof window === 'undefined') return 'unknown';
  
  const ua = navigator.userAgent;
  
  if (ua.includes('Chrome') && !ua.includes('Edg')) return 'Chrome';
  if (ua.includes('Safari') && !ua.includes('Chrome')) return 'Safari';
  if (ua.includes('Firefox')) return 'Firefox';
  if (ua.includes('Edg')) return 'Edge';
  if (ua.includes('Opera') || ua.includes('OPR')) return 'Opera';
  if (ua.includes('MSIE') || ua.includes('Trident')) return 'IE';
  
  return 'unknown';
};

/**
 * Detect OS
 */
const detectOS = (): string => {
  if (typeof window === 'undefined') return 'unknown';
  
  const ua = navigator.userAgent;
  
  if (ua.includes('Windows')) return 'Windows';
  if (ua.includes('Mac OS')) return 'macOS';
  if (ua.includes('Linux')) return 'Linux';
  if (ua.includes('Android')) return 'Android';
  if (ua.includes('iPhone') || ua.includes('iPad')) return 'iOS';
  
  return 'unknown';
};

/**
 * Extract brands from text
 */
const extractBrands = (text: string): string[] => {
  const normalizedText = text.toLowerCase();
  const brands: string[] = [];
  
  for (const brand of CAR_BRANDS) {
    if (normalizedText.includes(brand)) {
      brands.push(brand);
    }
  }
  
  return [...new Set(brands)];
};

/**
 * Extract body types from text
 */
const extractBodyTypes = (text: string): string[] => {
  const normalizedText = text.toLowerCase();
  const bodyTypes: string[] = [];
  
  for (const [normalized, variants] of Object.entries(BODY_TYPES)) {
    for (const variant of variants) {
      if (normalizedText.includes(variant)) {
        bodyTypes.push(normalized);
        break;
      }
    }
  }
  
  return [...new Set(bodyTypes)];
};

/**
 * Extract fuel type from text
 */
const extractFuelType = (text: string): string | undefined => {
  const normalizedText = text.toLowerCase();
  
  for (const [normalized, variants] of Object.entries(FUEL_TYPES)) {
    for (const variant of variants) {
      if (normalizedText.includes(variant)) {
        return normalized;
      }
    }
  }
  
  return undefined;
};

/**
 * Extract gearbox type from text
 */
const extractGearboxType = (text: string): string | undefined => {
  const normalizedText = text.toLowerCase();
  
  for (const [normalized, variants] of Object.entries(GEARBOX_TYPES)) {
    for (const variant of variants) {
      if (normalizedText.includes(variant)) {
        return normalized;
      }
    }
  }
  
  return undefined;
};

/**
 * Extract price range from text
 */
const extractPriceRange = (text: string): { min?: number; max?: number } | undefined => {
  const pricePattern = /(\d{1,3}[\s.,]?\d{3})\s*(лв|bgn|евро|euro|€|\$|лева)?/gi;
  const prices: number[] = [];
  
  let match;
  while ((match = pricePattern.exec(text)) !== null) {
    const price = parseInt(match[1].replace(/[\s.,]/g, ''), 10);
    if (price >= 1000 && price <= 500000) {
      prices.push(price);
    }
  }
  
  if (prices.length === 0) return undefined;
  
  prices.sort((a, b) => a - b);
  
  if (prices.length === 1) {
    return { max: prices[0] };
  }
  
  return { min: prices[0], max: prices[prices.length - 1] };
};

/**
 * Extract year range from text
 */
const extractYearRange = (text: string): { min?: number; max?: number } | undefined => {
  const yearPattern = /\b(19[89]\d|20[0-2]\d)\b/g;
  const years: number[] = [];
  
  let match;
  while ((match = yearPattern.exec(text)) !== null) {
    years.push(parseInt(match[1], 10));
  }
  
  if (years.length === 0) return undefined;
  
  years.sort((a, b) => a - b);
  
  return { min: years[0], max: years[years.length - 1] };
};

/**
 * Extract model names (common patterns)
 */
const extractModels = (text: string, brands: string[]): string[] => {
  const models: string[] = [];
  const normalizedText = text.toLowerCase();
  
  // BMW models
  if (brands.includes('bmw')) {
    const bmwModels = ['m3', 'm5', 'x1', 'x3', 'x5', 'x6', 'x7', '1 series', '3 series', '5 series', '7 series'];
    bmwModels.forEach(m => { if (normalizedText.includes(m)) models.push(m); });
  }
  
  // Mercedes models
  if (brands.includes('mercedes')) {
    const mercedesModels = ['c-class', 'e-class', 's-class', 'a-class', 'glc', 'gle', 'gls', 'amg'];
    mercedesModels.forEach(m => { if (normalizedText.includes(m)) models.push(m); });
  }
  
  // Audi models
  if (brands.includes('audi')) {
    const audiModels = ['a3', 'a4', 'a6', 'a8', 'q3', 'q5', 'q7', 'q8', 'rs', 'e-tron'];
    audiModels.forEach(m => { if (normalizedText.includes(m)) models.push(m); });
  }
  
  // VW models
  if (brands.includes('volkswagen') || brands.includes('vw')) {
    const vwModels = ['golf', 'passat', 'tiguan', 'touareg', 'polo', 'arteon', 'id.3', 'id.4'];
    vwModels.forEach(m => { if (normalizedText.includes(m)) models.push(m); });
  }
  
  // Toyota models
  if (brands.includes('toyota')) {
    const toyotaModels = ['corolla', 'camry', 'rav4', 'yaris', 'land cruiser', 'prius', 'chr', 'c-hr'];
    toyotaModels.forEach(m => { if (normalizedText.includes(m)) models.push(m); });
  }
  
  return [...new Set(models)];
};

/**
 * Parse Google search query from referrer
 */
const parseGoogleSearchQuery = (url: string): string | undefined => {
  try {
    const urlObj = new URL(url);
    return urlObj.searchParams.get('q') || undefined;
  } catch {
    return undefined;
  }
};

/**
 * Detect source from referrer
 */
const detectSource = (referrer: string): ExternalIntent['source'] => {
  if (!referrer) return 'direct';
  
  for (const [source, pattern] of Object.entries(SEARCH_ENGINE_PATTERNS)) {
    if (pattern.test(referrer)) {
      return source as ExternalIntent['source'];
    }
  }
  
  for (const [source, pattern] of Object.entries(SOCIAL_PATTERNS)) {
    if (pattern.test(referrer)) {
      return source as ExternalIntent['source'];
    }
  }
  
  return 'unknown';
};

/**
 * Detect medium from URL parameters and referrer
 */
const detectMedium = (params: URLSearchParams, referrer: string): ExternalIntent['medium'] => {
  const utmMedium = params.get('utm_medium');
  if (utmMedium) {
    const medium = utmMedium.toLowerCase();
    if (medium === 'cpc' || medium === 'ppc' || medium === 'paid') return 'cpc';
    if (medium === 'social') return 'social';
    if (medium === 'email') return 'email';
    if (medium === 'affiliate') return 'affiliate';
    if (medium === 'referral') return 'referral';
    return 'unknown';
  }
  
  // Google Ads click
  if (params.has('gclid') || params.has('gad_source')) return 'cpc';
  
  // Facebook Ads click
  if (params.has('fbclid') && params.has('utm_source')) return 'cpc';
  
  // Check referrer
  if (!referrer) return 'direct';
  
  for (const pattern of Object.values(SEARCH_ENGINE_PATTERNS)) {
    if (pattern.test(referrer)) return 'organic';
  }
  
  for (const pattern of Object.values(SOCIAL_PATTERNS)) {
    if (pattern.test(referrer)) return 'social';
  }
  
  return 'referral';
};

// ============================================================================
// MAIN SERVICE CLASS
// ============================================================================

class ExternalIntentService {
  private currentIntent: ExternalIntent | null = null;
  private intentHistory: ExternalIntent[] = [];
  private adClicks: AdClickData[] = [];
  
  constructor() {
    this.loadFromStorage();
    this.captureInitialIntent();
  }
  
  /**
   * Load saved intent data from storage
   */
  private loadFromStorage(): void {
    if (typeof window === 'undefined') return;
    
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const data = JSON.parse(saved);
        this.intentHistory = data.history || [];
        this.adClicks = data.adClicks || [];
        
        // Clean old entries (older than 30 days)
        const thirtyDaysAgo = Date.now() - 30 * 24 * 60 * 60 * 1000;
        this.intentHistory = this.intentHistory.filter(i => i.timestamp > thirtyDaysAgo);
        this.adClicks = this.adClicks.filter(c => c.timestamp > thirtyDaysAgo);
      }
    } catch (err) {
      logger.warn('[ExternalIntent] Failed to load from storage:', err);
    }
  }
  
  /**
   * Save intent data to storage
   */
  private saveToStorage(): void {
    if (typeof window === 'undefined') return;
    
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({
        history: this.intentHistory.slice(-50), // Keep last 50
        adClicks: this.adClicks.slice(-20) // Keep last 20
      }));
    } catch (err) {
      logger.warn('[ExternalIntent] Failed to save to storage:', err);
    }
  }
  
  /**
   * Capture intent from current page load
   */
  private captureInitialIntent(): void {
    if (typeof window === 'undefined') return;
    
    try {
      const url = new URL(window.location.href);
      const params = url.searchParams;
      const referrer = document.referrer;
      
      // Extract all signals
      const searchQuery = this.extractSearchQuery(params, referrer);
      const allText = [
        searchQuery || '',
        params.get('utm_term') || '',
        params.get('keyword') || '',
        params.get('q') || '',
        params.get('brand') || '',
        params.get('model') || '',
        url.pathname
      ].join(' ');
      
      const brands = extractBrands(allText);
      const bodyTypes = extractBodyTypes(allText);
      const models = extractModels(allText, brands);
      const keywords = this.extractKeywords(allText);
      
      const intent: ExternalIntent = {
        source: detectSource(referrer),
        medium: detectMedium(params, referrer),
        campaign: params.get('utm_campaign') || undefined,
        searchQuery,
        keywords,
        brands,
        models,
        bodyTypes,
        priceRange: extractPriceRange(allText),
        yearRange: extractYearRange(allText),
        fuel: extractFuelType(allText),
        gearbox: extractGearboxType(allText),
        referrerUrl: referrer || undefined,
        landingPage: window.location.pathname,
        timestamp: Date.now(),
        sessionId: getSessionId(),
        deviceType: detectDeviceType(),
        browser: detectBrowser(),
        os: detectOS()
      };
      
      this.currentIntent = intent;
      
      // Only save if meaningful data was captured
      if (brands.length > 0 || bodyTypes.length > 0 || searchQuery || keywords.length > 0) {
        this.intentHistory.push(intent);
        this.saveToStorage();
        
        logger.info('[ExternalIntent] Captured external intent', {
          source: intent.source,
          medium: intent.medium,
          brands: intent.brands,
          keywords: intent.keywords.slice(0, 5)
        });
      }
      
      // Track ad click if applicable
      this.trackAdClick(params);
      
    } catch (err) {
      logger.error('[ExternalIntent] Failed to capture initial intent:', err);
    }
  }
  
  /**
   * Extract search query from various sources
   */
  private extractSearchQuery(params: URLSearchParams, referrer: string): string | undefined {
    // Direct query parameter
    const q = params.get('q') || params.get('query') || params.get('search');
    if (q) return q;
    
    // UTM term (often contains keyword)
    const utmTerm = params.get('utm_term');
    if (utmTerm) return utmTerm;
    
    // Google Ads keyword
    const keyword = params.get('keyword');
    if (keyword) return keyword;
    
    // Parse from Google referrer
    if (referrer && SEARCH_ENGINE_PATTERNS.google.test(referrer)) {
      return parseGoogleSearchQuery(referrer);
    }
    
    return undefined;
  }
  
  /**
   * Extract keywords from text
   */
  private extractKeywords(text: string): string[] {
    const keywords: string[] = [];
    const normalized = text.toLowerCase();
    
    // Add brands
    keywords.push(...extractBrands(normalized));
    
    // Add body types
    keywords.push(...extractBodyTypes(normalized));
    
    // Add fuel types
    const fuel = extractFuelType(normalized);
    if (fuel) keywords.push(fuel);
    
    // Add gearbox
    const gearbox = extractGearboxType(normalized);
    if (gearbox) keywords.push(gearbox);
    
    // Add common car-related words
    const carWords = [
      'кола', 'автомобил', 'car', 'auto', 'коли', 'cars',
      'употребявани', 'втора ръка', 'used', 'second hand',
      'нови', 'new', 'евтини', 'cheap', 'affordable',
      'продажба', 'sale', 'купувам', 'buy', 'продавам', 'sell'
    ];
    
    carWords.forEach(word => {
      if (normalized.includes(word)) {
        keywords.push(word);
      }
    });
    
    return [...new Set(keywords)];
  }
  
  /**
   * Track ad click data
   */
  private trackAdClick(params: URLSearchParams): void {
    // Google Ads
    if (params.has('gclid')) {
      this.adClicks.push({
        platform: 'google_ads',
        campaignId: params.get('campaignid') || undefined,
        adGroupId: params.get('adgroupid') || undefined,
        adId: params.get('creative') || undefined,
        keyword: params.get('keyword') || undefined,
        matchType: params.get('matchtype') as AdClickData['matchType'] || undefined,
        targetBrand: extractBrands(params.get('keyword') || '')[0],
        timestamp: Date.now()
      });
      this.saveToStorage();
    }
    
    // Meta Ads (Facebook/Instagram)
    if (params.has('fbclid')) {
      this.adClicks.push({
        platform: 'meta_ads',
        campaignId: params.get('campaign_id') || undefined,
        adId: params.get('ad_id') || undefined,
        timestamp: Date.now()
      });
      this.saveToStorage();
    }
    
    // Microsoft/Bing Ads
    if (params.has('msclkid')) {
      this.adClicks.push({
        platform: 'microsoft_ads',
        keyword: params.get('keyword') || undefined,
        timestamp: Date.now()
      });
      this.saveToStorage();
    }
  }
  
  // ============================================================================
  // PUBLIC API
  // ============================================================================
  
  /**
   * Get current session's external intent
   */
  getCurrentIntent(): ExternalIntent | null {
    return this.currentIntent;
  }
  
  /**
   * Get all intent history
   */
  getIntentHistory(): ExternalIntent[] {
    return [...this.intentHistory];
  }
  
  /**
   * Get ad click history
   */
  getAdClicks(): AdClickData[] {
    return [...this.adClicks];
  }
  
  /**
   * Get aggregated preferences from all external signals
   */
  getAggregatedPreferences(): {
    brands: Array<{ brand: string; frequency: number; recency: number }>;
    bodyTypes: Array<{ bodyType: string; frequency: number }>;
    keywords: Array<{ keyword: string; frequency: number }>;
    priceRange?: { min?: number; max?: number };
    yearRange?: { min?: number; max?: number };
    preferredFuel?: string;
    preferredGearbox?: string;
  } {
    const brandCounts: Record<string, { count: number; lastSeen: number }> = {};
    const bodyTypeCounts: Record<string, number> = {};
    const keywordCounts: Record<string, number> = {};
    const prices: number[] = [];
    const years: number[] = [];
    const fuels: string[] = [];
    const gearboxes: string[] = [];
    
    // Aggregate from intent history
    for (const intent of this.intentHistory) {
      // Brands
      for (const brand of intent.brands) {
        if (!brandCounts[brand]) {
          brandCounts[brand] = { count: 0, lastSeen: 0 };
        }
        brandCounts[brand].count++;
        brandCounts[brand].lastSeen = Math.max(brandCounts[brand].lastSeen, intent.timestamp);
      }
      
      // Body types
      for (const bodyType of intent.bodyTypes) {
        bodyTypeCounts[bodyType] = (bodyTypeCounts[bodyType] || 0) + 1;
      }
      
      // Keywords
      for (const keyword of intent.keywords) {
        keywordCounts[keyword] = (keywordCounts[keyword] || 0) + 1;
      }
      
      // Price
      if (intent.priceRange?.min) prices.push(intent.priceRange.min);
      if (intent.priceRange?.max) prices.push(intent.priceRange.max);
      
      // Year
      if (intent.yearRange?.min) years.push(intent.yearRange.min);
      if (intent.yearRange?.max) years.push(intent.yearRange.max);
      
      // Fuel
      if (intent.fuel) fuels.push(intent.fuel);
      
      // Gearbox
      if (intent.gearbox) gearboxes.push(intent.gearbox);
    }
    
    // Aggregate from ad clicks
    for (const click of this.adClicks) {
      if (click.targetBrand) {
        if (!brandCounts[click.targetBrand]) {
          brandCounts[click.targetBrand] = { count: 0, lastSeen: 0 };
        }
        brandCounts[click.targetBrand].count += 2; // Ad clicks weighted higher
        brandCounts[click.targetBrand].lastSeen = Math.max(
          brandCounts[click.targetBrand].lastSeen, 
          click.timestamp
        );
      }
    }
    
    // Calculate recency scores (0-100, recent = higher)
    const now = Date.now();
    const dayMs = 24 * 60 * 60 * 1000;
    
    const brands = Object.entries(brandCounts)
      .map(([brand, data]) => ({
        brand,
        frequency: data.count,
        recency: Math.max(0, 100 - Math.floor((now - data.lastSeen) / dayMs))
      }))
      .sort((a, b) => (b.frequency * b.recency) - (a.frequency * a.recency));
    
    const bodyTypes = Object.entries(bodyTypeCounts)
      .map(([bodyType, count]) => ({ bodyType, frequency: count }))
      .sort((a, b) => b.frequency - a.frequency);
    
    const keywords = Object.entries(keywordCounts)
      .map(([keyword, count]) => ({ keyword, frequency: count }))
      .sort((a, b) => b.frequency - a.frequency);
    
    // Calculate price/year ranges
    let priceRange: { min?: number; max?: number } | undefined;
    if (prices.length > 0) {
      prices.sort((a, b) => a - b);
      priceRange = {
        min: prices[0],
        max: prices[prices.length - 1]
      };
    }
    
    let yearRange: { min?: number; max?: number } | undefined;
    if (years.length > 0) {
      years.sort((a, b) => a - b);
      yearRange = {
        min: years[0],
        max: years[years.length - 1]
      };
    }
    
    // Most common fuel/gearbox
    const preferredFuel = this.getMostCommon(fuels);
    const preferredGearbox = this.getMostCommon(gearboxes);
    
    return {
      brands,
      bodyTypes,
      keywords,
      priceRange,
      yearRange,
      preferredFuel,
      preferredGearbox
    };
  }
  
  /**
   * Get most common item from array
   */
  private getMostCommon(arr: string[]): string | undefined {
    if (arr.length === 0) return undefined;
    
    const counts: Record<string, number> = {};
    for (const item of arr) {
      counts[item] = (counts[item] || 0) + 1;
    }
    
    return Object.entries(counts)
      .sort((a, b) => b[1] - a[1])[0]?.[0];
  }
  
  /**
   * Manually track external link click (for outbound tracking)
   */
  trackOutboundClick(url: string, context?: { brand?: string; model?: string; carId?: string }): void {
    logger.info('[ExternalIntent] Outbound click tracked', { url, context });
    
    // This data could be sent to analytics
    if (context?.brand) {
      const intent = this.currentIntent;
      if (intent) {
        if (!intent.brands.includes(context.brand.toLowerCase())) {
          intent.brands.push(context.brand.toLowerCase());
        }
      }
    }
  }
  
  /**
   * Track deep link entry
   */
  trackDeepLink(params: Record<string, string>): void {
    const allText = Object.values(params).join(' ');
    const brands = extractBrands(allText);
    const bodyTypes = extractBodyTypes(allText);
    
    if (brands.length > 0 || bodyTypes.length > 0) {
      const deepLinkIntent: ExternalIntent = {
        source: 'direct',
        medium: 'referral',
        keywords: [...brands, ...bodyTypes],
        brands,
        models: extractModels(allText, brands),
        bodyTypes,
        priceRange: extractPriceRange(allText),
        yearRange: extractYearRange(allText),
        fuel: extractFuelType(allText),
        gearbox: extractGearboxType(allText),
        landingPage: typeof window !== 'undefined' ? window.location.pathname : '/',
        timestamp: Date.now(),
        sessionId: getSessionId(),
        deviceType: detectDeviceType(),
        browser: detectBrowser(),
        os: detectOS()
      };
      
      this.intentHistory.push(deepLinkIntent);
      this.saveToStorage();
      
      logger.info('[ExternalIntent] Deep link tracked', { brands, bodyTypes });
    }
  }
  
  /**
   * Clear all external intent data
   */
  clearAll(): void {
    this.currentIntent = null;
    this.intentHistory = [];
    this.adClicks = [];
    
    if (typeof window !== 'undefined') {
      localStorage.removeItem(STORAGE_KEY);
      sessionStorage.removeItem(SESSION_KEY);
    }
    
    logger.info('[ExternalIntent] All data cleared');
  }
}

// Export singleton
export const externalIntentService = new ExternalIntentService();

// Named exports
export { ExternalIntentService };
