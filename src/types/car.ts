
export type FuelType = 'petrol' | 'diesel' | 'electric' | 'hybrid' | 'lpg' | 'other';

export interface CarSummary {
    id: string;
    slug: string; // for SEO URLs
    title: string; // e.g. "Mercedes-Benz S 500"
    priceTotal?: number; // full price in EUR
    priceMonthly?: number; // leasing monthly price
    priceCurrency: 'EUR' | 'BGN';
    isLeasing: boolean;
    leasingTermMonths?: number;
    leasingKmPerYear?: number;
    firstRegistration?: string; // "2016-05" or "05/2016"
    fuelType: FuelType;
    horsepower: number;
    transmission: 'automatic' | 'manual';
    mileageKm?: number;
    consumptionCombined?: string; // "6.8 l/100km"
    co2Combined?: string; // "153 g CO₂/km"
    locationCity: string;
    locationPostalCode?: string;
    imageUrl: string;
    priceBadge?: 'good' | 'very_good' | 'fair' | null;
    // Numeric IDs for constitution-compliant URLs
    sellerNumericId?: number;
    carNumericId?: number;
}
