/**
 * homeStrips.ts – Real Firestore + localStorage data for homepage strips
 * يجلب بيانات حقيقية 100% من Firestore وسجل التصفح المحلي
 *
 * - Recently Viewed: localStorage browsing history (real cars the user looked at)
 * - Top Deals: Featured cars + newest cars from Firestore
 */

import { CarSummary, FuelType } from '../../types/car';
import { getBrowsingHistory } from '../../pages/01_main-pages/home/HomePage/browsingHistory';
import { getFeaturedCars, getNewCarsLast24Hours } from '../../services/car/unified-car-queries';
import { UnifiedCar } from '../../services/car/unified-car-types';
import { getCarDisplayImage } from '../../utils/getCarDisplayImage';

// ============================================================================
// MAPPER: UnifiedCar → CarSummary
// ============================================================================

function mapFuelType(raw?: string): FuelType {
  if (!raw) return 'other';
  const lower = raw.toLowerCase();
  if (lower.includes('petrol') || lower.includes('gasoline') || lower.includes('бензин')) return 'petrol';
  if (lower.includes('diesel') || lower.includes('дизел')) return 'diesel';
  if (lower.includes('electric') || lower.includes('електр')) return 'electric';
  if (lower.includes('hybrid') || lower.includes('хибрид')) return 'hybrid';
  if (lower.includes('lpg') || lower.includes('газ')) return 'lpg';
  return 'other';
}

function mapTransmission(raw?: string): 'automatic' | 'manual' {
  if (!raw) return 'manual';
  const lower = raw.toLowerCase();
  if (lower.includes('auto') || lower.includes('автомат')) return 'automatic';
  return 'manual';
}

function unifiedCarToSummary(car: UnifiedCar): CarSummary {
  const title = [car.make, car.model].filter(Boolean).join(' ') || 'Car';
  const imageUrl = getCarDisplayImage(car);

  // Resolve location from various possible fields
  const locationCity =
    (car as any).city ||
    (car as any).location ||
    (car as any).region ||
    '';
  const locationPostalCode = (car as any).postalCode || (car as any).zipCode || undefined;

  // Resolve currency
  const rawCurrency = ((car as any).currency || 'EUR').toUpperCase();
  const priceCurrency: 'EUR' | 'BGN' = rawCurrency === 'BGN' ? 'BGN' : 'EUR';

  return {
    id: car.id,
    slug: car.id,
    title,
    priceTotal: car.price || 0,
    priceCurrency,
    isLeasing: false,
    fuelType: mapFuelType(car.fuelType),
    horsepower: car.power || 0,
    transmission: mapTransmission(car.transmission),
    mileageKm: car.mileage,
    locationCity,
    locationPostalCode,
    imageUrl,
    firstRegistration: car.year ? String(car.year) : undefined,
    priceBadge: null,
    sellerNumericId: car.sellerNumericId,
    carNumericId: car.carNumericId,
  };
}

// ============================================================================
// RECENTLY VIEWED — from localStorage browsing history (100% real)
// ============================================================================

export async function getRecentlyViewedCars(_guestId?: string | null): Promise<CarSummary[]> {
  try {
    const history = getBrowsingHistory();
    if (!history || history.length === 0) return [];

    return history
      .slice(0, 8)
      .map((item) => unifiedCarToSummary(item.listing))
      .filter((car) => car.imageUrl && car.title !== 'Car');
  } catch {
    return [];
  }
}

// ============================================================================
// TOP DEALS — real featured + newest cars from Firestore
// ============================================================================

export async function getTopDealsForUser(_guestId?: string | null): Promise<CarSummary[]> {
  try {
    // Try featured cars first, then fill with newest listings
    const [featured, newest] = await Promise.all([
      getFeaturedCars(8).catch(() => [] as UnifiedCar[]),
      getNewCarsLast24Hours(12).catch(() => [] as UnifiedCar[]),
    ]);

    // Merge: Featured first, then newest (no duplicates)
    const seenIds = new Set<string>();
    const merged: UnifiedCar[] = [];

    for (const car of [...featured, ...newest]) {
      if (!seenIds.has(car.id) && car.price > 0) {
        seenIds.add(car.id);
        merged.push(car);
      }
    }

    return merged
      .slice(0, 8)
      .map(unifiedCarToSummary)
      .filter((car) => car.imageUrl && car.title !== 'Car');
  } catch {
    return [];
  }
}
