import type {
  SiteSettings,
  ThemeSettings,
  FeaturedContent,
  HomepageHeroContent,
} from './site-settings-types';

// ─── Firestore Paths ───
export const SITE_SETTINGS_PATH = {
  collection: 'app_settings',
  siteSettings: 'site_settings',
  themeSettings: 'theme_settings',
  featuredContent: 'featured_content',
};

// ─── Default Site Settings ───
export const DEFAULT_SITE_SETTINGS: SiteSettings = {
  // Maintenance & Status
  maintenanceMode: false,
  maintenanceMessage:
    'We apologize, the site is currently under maintenance. We will be back soon.',
  allowAdminAccessDuringMaintenance: true,

  // Registration & Access
  registrationEnabled: true,
  requireEmailVerification: false,
  requirePhoneVerification: true,

  // Features Toggle
  features: {
    messaging: true,
    reviews: true,
    visualSearch: true,
    aiAnalysis: true,
    priceEstimator: true,
    smartRecommendations: true,
    socialSharing: true,
    favorites: true,
    comparisons: true,
    priceAlerts: true,
    userSearch: true,
  },

  // Upload Limits
  uploadLimits: {
    maxImagesPerListing: 20,
    maxImageSizeMB: 5,
    maxVideoDurationSeconds: 60,
    allowedImageFormats: ['jpg', 'jpeg', 'png', 'webp'],
  },

  // Listing Limits
  listingLimits: {
    freeAdsPerUser: 3,
    maxActiveAdsPerUser: 10,
    adDurationDays: 30,
    requireAdminApproval: false,
  },

  // Pricing & Fees
  pricing: {
    premiumAdPrice: 50,
    featuredAdPrice: 100,
    topAdPrice: 150,
    platformFeePercentage: 2.5,
    currency: 'BGN',
    subscriptionMode: 'paid',
  },

  // SEO & Meta
  seo: {
    siteName: 'Koli One',
    siteDescription: 'The leading car marketplace in Bulgaria',
    keywords: ['cars', 'buy cars', 'sell cars', 'used cars', 'car dealerships'],
    ogImage: '/assets/og-image.jpg',
    twitterHandle: '@KoliOne',
  },

  // Contact & Support
  contact: {
    supportEmail: 'support@kolione.com',
    supportPhone: '+359 00 000 0000',
    whatsappNumber: '+359000000000',
    facebookUrl: 'https://facebook.com/kolione',
    instagramUrl: 'https://instagram.com/kolione',
  },

  // Analytics
  analytics: {
    googleAnalyticsId: '',
    facebookPixelId: '',
    enableTracking: true,
  },

  // Metadata
  updatedAt: new Date().toISOString(),
  updatedBy: 'system',
};

// ─── Default Theme Settings ───
export const DEFAULT_THEME_SETTINGS: ThemeSettings = {
  colors: {
    primary: '#8B5CF6',
    secondary: '#0f1419',
    accent: '#fbbf24',
    success: '#10b981',
    warning: '#f59e0b',
    error: '#ef4444',
  },
  logo: {
    lightMode: '/logo-light.svg',
    darkMode: '/logo-dark.svg',
  },
  favicon: '/favicon.ico',
  updatedAt: new Date().toISOString(),
  updatedBy: 'system',
};

export const DEFAULT_HOMEPAGE_HERO: HomepageHeroContent = {
  ariaLabelBg: 'Главен раздел',
  ariaLabelEn: 'Hero section',
  titleBg: 'Най-умният начин да купиш или продадеш кола в България',
  titleEn: 'The Smartest Way to Buy or Sell a Car in Bulgaria',
  subtitleBg:
    'AI анализ, реални цени, верифицирани продавачи — всичко на едно място.',
  subtitleEn: 'AI analysis, real prices, verified sellers — all in one place.',
  trustItems: [
    {
      id: 'hero-trust-ai',
      icon: 'brain',
      labelBg: 'AI анализ',
      labelEn: 'AI Analysis',
    },
    {
      id: 'hero-trust-valuation',
      icon: 'search',
      labelBg: 'Безплатна оценка',
      labelEn: 'Free Valuation',
    },
    {
      id: 'hero-trust-shield',
      icon: 'shield',
      labelBg: 'TrustShield',
      labelEn: 'TrustShield',
    },
    {
      id: 'hero-trust-platform',
      icon: 'smartphone',
      labelBg: 'Една платформа',
      labelEn: 'One Platform',
    },
  ],
};

// ─── Default Featured Content ───
export const DEFAULT_FEATURED_CONTENT: FeaturedContent = {
  featuredCars: [],
  featuredDealers: [],
  featuredBrands: ['Toyota', 'Hyundai', 'Nissan', 'Honda', 'Ford'],
  homepageHero: DEFAULT_HOMEPAGE_HERO,
  homepageBanners: [
    {
      id: 'banner-1',
      image: '/banners/default-1.jpg',
      link: '/browse',
      title: 'Browse the latest cars',
      active: true,
      order: 1,
    },
  ],
  updatedAt: new Date().toISOString(),
  updatedBy: 'system',
};
