import type { SiteSettings, ThemeSettings, FeaturedContent } from './site-settings-types';

// ─── Firestore Paths ───
export const SITE_SETTINGS_PATH = {
  collection: 'app_settings',
  siteSettings: 'site_settings',
  themeSettings: 'theme_settings',
  featuredContent: 'featured_content'
};

// ─── Default Site Settings ───
export const DEFAULT_SITE_SETTINGS: SiteSettings = {
  // Maintenance & Status
  maintenanceMode: false,
  maintenanceMessage: 'نعتذر، الموقع تحت الصيانة حالياً. سنعود قريباً.',
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
    priceAlerts: true
  },

  // Upload Limits
  uploadLimits: {
    maxImagesPerListing: 20,
    maxImageSizeMB: 5,
    maxVideoDurationSeconds: 60,
    allowedImageFormats: ['jpg', 'jpeg', 'png', 'webp']
  },

  // Listing Limits
  listingLimits: {
    freeAdsPerUser: 3,
    maxActiveAdsPerUser: 10,
    adDurationDays: 30,
    requireAdminApproval: false
  },

  // Pricing & Fees
  pricing: {
    premiumAdPrice: 50,
    featuredAdPrice: 100,
    topAdPrice: 150,
    platformFeePercentage: 2.5,
    currency: 'SAR',
    subscriptionMode: 'paid'
  },

  // SEO & Meta
  seo: {
    siteName: 'Koli One - كل ون',
    siteDescription: 'منصة بيع وشراء السيارات الأولى في المملكة',
    keywords: ['سيارات', 'بيع سيارات', 'شراء سيارات', 'سيارات مستعملة', 'معارض سيارات'],
    ogImage: '/assets/og-image.jpg',
    twitterHandle: '@KoliOne'
  },

  // Contact & Support
  contact: {
    supportEmail: 'support@kolione.com',
    supportPhone: '+966 50 000 0000',
    whatsappNumber: '+966500000000',
    facebookUrl: 'https://facebook.com/kolione',
    instagramUrl: 'https://instagram.com/kolione'
  },

  // Analytics
  analytics: {
    googleAnalyticsId: '',
    facebookPixelId: '',
    enableTracking: true
  },

  // Metadata
  updatedAt: new Date().toISOString(),
  updatedBy: 'system'
};

// ─── Default Theme Settings ───
export const DEFAULT_THEME_SETTINGS: ThemeSettings = {
  colors: {
    primary: '#ff8c61',
    secondary: '#0f1419',
    accent: '#fbbf24',
    success: '#10b981',
    warning: '#f59e0b',
    error: '#ef4444'
  },
  logo: {
    lightMode: '/logo-light.svg',
    darkMode: '/logo-dark.svg'
  },
  favicon: '/favicon.ico',
  updatedAt: new Date().toISOString(),
  updatedBy: 'system'
};

// ─── Default Featured Content ───
export const DEFAULT_FEATURED_CONTENT: FeaturedContent = {
  featuredCars: [],
  featuredDealers: [],
  featuredBrands: ['Toyota', 'Hyundai', 'Nissan', 'Honda', 'Ford'],
  homepageBanners: [
    {
      id: 'banner-1',
      image: '/banners/default-1.jpg',
      link: '/browse',
      title: 'تصفح أحدث السيارات',
      active: true,
      order: 1
    }
  ],
  updatedAt: new Date().toISOString(),
  updatedBy: 'system'
};
