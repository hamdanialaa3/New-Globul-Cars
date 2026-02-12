/**
 * Platform-wide settings for site behavior, features, and limits.
 * Managed via SuperAdmin dashboard.
 */

export interface SiteSettings {
  // ─── Maintenance & Status ───
  maintenanceMode: boolean;
  maintenanceMessage: string;
  allowAdminAccessDuringMaintenance: boolean;

  // ─── Registration & Access ───
  registrationEnabled: boolean;
  requireEmailVerification: boolean;
  requirePhoneVerification: boolean;

  // ─── Features Toggle ───
  features: {
    messaging: boolean;
    reviews: boolean;
    visualSearch: boolean;
    aiAnalysis: boolean;
    priceEstimator: boolean;
    smartRecommendations: boolean;
    socialSharing: boolean;
    favorites: boolean;
    comparisons: boolean;
    priceAlerts: boolean;
  };

  // ─── Upload Limits ───
  uploadLimits: {
    maxImagesPerListing: number;
    maxImageSizeMB: number;
    maxVideoDurationSeconds: number;
    allowedImageFormats: string[];
  };

  // ─── Listing Limits ───
  listingLimits: {
    freeAdsPerUser: number;
    maxActiveAdsPerUser: number;
    adDurationDays: number;
    requireAdminApproval: boolean;
  };

  // ─── Pricing & Fees ───
  pricing: {
    premiumAdPrice: number;
    featuredAdPrice: number;
    topAdPrice: number;
    platformFeePercentage: number;
    currency: string;
    subscriptionMode: 'free' | 'paid';
  };

  // ─── SEO & Meta ───
  seo: {
    siteName: string;
    siteDescription: string;
    keywords: string[];
    ogImage: string;
    twitterHandle: string;
  };

  // ─── Contact & Support ───
  contact: {
    supportEmail: string;
    supportPhone: string;
    whatsappNumber: string;
    facebookUrl: string;
    instagramUrl: string;
  };

  // ─── Analytics ───
  analytics: {
    googleAnalyticsId: string;
    facebookPixelId: string;
    enableTracking: boolean;
  };

  // ─── Metadata ───
  updatedAt: string;
  updatedBy: string;
}

export interface ThemeSettings {
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    success: string;
    warning: string;
    error: string;
  };
  logo: {
    lightMode: string;
    darkMode: string;
  };
  favicon: string;
  updatedAt: string;
  updatedBy: string;
}

export interface FeaturedContent {
  featuredCars: string[]; // Array of car IDs
  featuredDealers: string[]; // Array of dealer IDs
  featuredBrands: string[]; // Array of brand names
  homepageBanners: Array<{
    id: string;
    image: string;
    link: string;
    title: string;
    active: boolean;
    order: number;
  }>;
  updatedAt: string;
  updatedBy: string;
}
