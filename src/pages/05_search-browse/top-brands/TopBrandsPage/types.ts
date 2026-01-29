// Top Brands Page Types
// Brand statistics and category interfaces

export interface BrandWithStats {
  id: string;
  name: string;
  logo: string;
  totalSeries: number;
  totalCars: number;
  featured?: boolean;
  reason?: 'popular' | 'electric' | 'commercial';
  description?: string;
}

export interface BrandCategory {
  key: string;
  titleBg: string;
  titleEn: string;
  descriptionBg: string;
  descriptionEn: string;
  icon: string;
  brands: BrandWithStats[];
}

