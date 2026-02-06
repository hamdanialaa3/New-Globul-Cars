// getCarDisplayImage.ts - Unified car image resolution utility
// Single source of truth for resolving the display image of a car

const PLACEHOLDER = '/images/placeholder.png';

interface CarImageSource {
  images?: string[];
  featuredImageIndex?: number;
  mainImage?: string;
  imageUrl?: string;
  image?: string;
  photoURL?: string;
}

/**
 * Resolve the best display image for a car object.
 * Priority: featuredImageIndex -> mainImage -> first image -> placeholder
 */
export function getCarDisplayImage(car: CarImageSource | null | undefined): string {
  if (!car) return PLACEHOLDER;

  // 1. Use featuredImageIndex if images array exists
  if (Array.isArray(car.images) && car.images.length > 0) {
    const idx = typeof car.featuredImageIndex === 'number' ? car.featuredImageIndex : 0;
    const safeIdx = Math.min(idx, car.images.length - 1);
    const url = car.images[safeIdx];
    if (typeof url === 'string' && url.length > 0 && !url.startsWith('blob:')) {
      return url;
    }
    // Fallback to first valid image in array
    const firstValid = car.images.find(
      (u) => typeof u === 'string' && u.length > 0 && !u.startsWith('blob:')
    );
    if (firstValid) return firstValid;
  }

  // 2. Fallback to mainImage field
  if (typeof car.mainImage === 'string' && car.mainImage.length > 0) {
    return car.mainImage;
  }

  // 3. Fallback to imageUrl field
  if (typeof car.imageUrl === 'string' && car.imageUrl.length > 0) {
    return car.imageUrl;
  }

  // 4. Fallback to image field
  if (typeof car.image === 'string' && car.image.length > 0) {
    return car.image;
  }

  // 5. Fallback to photoURL field
  if (typeof car.photoURL === 'string' && car.photoURL.length > 0) {
    return car.photoURL;
  }

  return PLACEHOLDER;
}

/** Placeholder path constant for use in onError handlers */
export const CAR_PLACEHOLDER = PLACEHOLDER;
