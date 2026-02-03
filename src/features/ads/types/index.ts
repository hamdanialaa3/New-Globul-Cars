export type AdType = 'google_adsense' | 'google_gam' | 'image' | 'html_js';
export type DeviceType = 'desktop' | 'mobile' | 'both';

export interface AdContext {
    page?: string;
    brand?: string;
    model?: string;
    country?: string;
    device?: DeviceType;
    category?: string;
}

export interface AdCampaign {
    id?: string;
    name: string;
    type: AdType;
    isActive: boolean;
    placementIds: string[]; // e.g., ['home_top', 'listing_sidebar']

    // Content
    imageUrl?: string;
    destinationUrl?: string; // For image ads
    scriptCode?: string; // For HTML/JS or Google tags

    // Targeting
    targetCountries?: string[]; // ISO codes, e.g., ['BG', 'RO']
    targetDevices: DeviceType;
    targetBrands?: string[]; // e.g., ['BMW', 'Mercedes']
    targetModels?: string[]; // e.g., ['X5', 'E-Class']
    targetCategories?: string[]; // e.g., ['Tires', 'Oil']

    startDate: string; // ISO Date
    endDate?: string; // ISO Date
    weight: number; // 0-100

    // Stats (simplified for demo)
    stats?: {
        impressions: number;
        clicks: number;
    };

    createdAt?: any;
    updatedAt?: any;
}

export interface AdUnit {
    id: string;
    name: string;
    description?: string;
    width: number;
    height: number;
    supportedTypes: AdType[];
}

export interface AdImpression {
    campaignId: string;
    placementId: string;
    timestamp: any;
}
