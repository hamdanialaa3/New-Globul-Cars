// Search page types

export interface SearchFilters {
    make: string;
    model: string;
    priceMin: string;
    priceMax: string;
    yearFrom: string;
    yearTo: string;
    mileageMax: string;
    fuelType: string;
    transmission: string;
    bodyType: string;
    condition: string;
    color: string;
    locationRadius: string;
    features: string[];
    sellerType: string;
    sortBy: string;
}

export interface CarResult {
    id: string;
    title: string;
    subtitle: string;
    price: number;
    priceFormatted: string;
    monthlyPrice?: string;
    year: number;
    mileage: number;
    mileageFormatted: string;
    fuelType: string;
    transmission: string;
    horsepower: number;
    bodyType: string;
    color: string;
    location: string;
    dealerName?: string;
    imageUrl: string;
    images: string[];
    badges: string[];
    condition: string;
    isNew: boolean;
    isTopOffer: boolean;
    isFavorited: boolean;
    createdAt: string;
    consumption?: string;
    co2?: string;
    sellerNumericId?: number;
    carNumericId?: number;
}

export interface PaginationState {
    currentPage: number;
    totalPages: number;
    totalResults: number;
    resultsPerPage: number;
}

export type ViewMode = 'list' | 'grid';

export type SortOption =
    | 'relevance'
    | 'price_asc'
    | 'price_desc'
    | 'newest'
    | 'year_desc'
    | 'year_asc'
    | 'mileage_asc'
    | 'mileage_desc';

export interface FilterGroup {
    id: string;
    label: string;
    isExpanded: boolean;
}
