export interface ScrapedCarData {
  // Core Data
  externalId: string; // ID from the source site
  sourceUrl: string;
  
  // Basic Info
  make: string;
  model: string;
  year: number;
  price: number;
  currency: string;
  
  // Specs
  mileage: number;
  fuelType: string;
  transmission: string;
  power?: number;
  engineSize?: number;
  
  // Visuals
  images: string[]; // URLs
  
  // Location
  location: string;
  region?: string;
  
  // Seller
  sellerPhone?: string;
  sellerName?: string;
  
  // Description
  description?: string;
  
  // Extras/Features
  features?: string[];
  
  // Metadata
  scrapedAt: string;
}

export interface ScraperConfig {
  baseUrl: string;
  maxPages?: number;
  delayBetweenRequests?: number;
  headless?: boolean;
}

export interface ScraperStats {
  totalScraped: number;
  totalSkipped: number;
  totalErrors: number;
  startTime: number;
  endTime?: number;
}
