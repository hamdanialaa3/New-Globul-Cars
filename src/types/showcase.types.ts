/**
 * Types for Dynamic Car Showcase Pages
 * Supports container pages with smart filtering
 */

export type PageType = 
  | 'all'         // All cars without filters
  | 'family'      // 7+ seats
  | 'sport'       // 2 doors OR 270+ HP
  | 'vip'         // 35,000+ EUR
  | 'classic'     // year < 1995
  | 'city'        // Filter by city (dynamic param)
  | 'brand'       // Filter by brand (dynamic param)
  | 'new'         // Recent years
  | 'used'        // Older years
  | 'economy';    // Low fuel consumption

export interface ShowcaseConfig {
  pageType: PageType;
  title: string;
  subtitle: string;
  defaultSort: 'price-asc' | 'price-desc' | 'year-desc' | 'year-asc' | 'power-desc' | 'seats-desc' | 'relevance';
  metaTitle: string;
  metaDescription: string;
  metaKeywords: string;
}

export interface FilterConfig {
  key: string;
  label: string;
  type: 'range' | 'select' | 'multi-select' | 'boolean';
  options?: { value: string | number; label: string }[];
  min?: number;
  max?: number;
  step?: number;
  defaultValue?: any;
}

export interface QueryConstraint {
  field: string;
  operator: '==' | '!=' | '>' | '<' | '>=' | '<=' | 'in' | 'array-contains';
  value: any;
}

export interface ShowcaseQuery {
  constraints: QueryConstraint[];
  orderBy?: { field: string; direction: 'asc' | 'desc' }[];
  limit?: number;
}

/**
 * Category badge for car details page
 * Shows which container pages this car belongs to
 */
export interface CategoryBadge {
  name: string;
  link: string;
  icon: string;
  reason: string; // Why this car belongs to this category
}
