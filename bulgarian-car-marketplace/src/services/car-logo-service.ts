// Car Logo Service
// خدمة شعارات السيارات

/**
 * Get the logo URL for a car brand
 * @param brandName - The name of the car brand (e.g., "Toyota", "BMW", "Mercedes-Benz")
 * @returns The URL to the brand logo image
 */
export const getCarLogoUrl = (brandName: string): string => {
  if (!brandName) {
    return '/car-logos/mein_logo_rest.png'; // Default logo
  }

  // Normalize brand name: capitalize first letter, handle special cases
  const normalizedBrand = normalizeBrandName(brandName);
  
  // Try to get the logo
  const logoPath = `/car-logos/${normalizedBrand}.png`;
  
  return logoPath;
};

/**
 * Normalize brand name to match logo file names
 * @param brandName - Raw brand name from user input
 * @returns Normalized brand name matching logo files
 */
export const normalizeBrandName = (brandName: string): string => {
  if (!brandName) return '';

  // Handle special cases
  const specialCases: Record<string, string> = {
    'mercedes': 'Mercedes-Benz',
    'mercedes-benz': 'Mercedes-Benz',
    'mercedesbenz': 'Mercedes-Benz',
    'alfa romeo': 'Alfa Romeo',
    'alfaromeo': 'Alfa Romeo',
    'aston martin': 'Aston Martin',
    'astonmartin': 'Aston Martin',
    'land rover': 'Land Rover',
    'landrover': 'Land Rover',
    'rolls royce': 'Rolls-Royce',
    'rollsroyce': 'Rolls-Royce',
    'rolls-royce': 'Rolls-Royce',
    'faraday future': 'Faraday Future',
    'faradayfuture': 'Faraday Future',
    'citroen': 'Citroën',
    'citroën': 'Citroën',
    'ds': 'DS',
  };

  const lowerBrand = brandName.toLowerCase().trim();
  
  // Check special cases first
  if (specialCases[lowerBrand]) {
    return specialCases[lowerBrand];
  }

  // Capitalize first letter of each word
  return brandName
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
};

/**
 * Check if a logo exists for a brand
 * @param brandName - The name of the car brand
 * @returns Promise<boolean> - true if logo exists
 */
export const checkLogoExists = async (brandName: string): Promise<boolean> => {
  try {
    const logoUrl = getCarLogoUrl(brandName);
    const response = await fetch(logoUrl, { method: 'HEAD' });
    return response.ok;
  } catch {
    return false;
  }
};

/**
 * Get logo with fallback
 * @param brandName - The name of the car brand
 * @returns Promise<string> - Logo URL or default logo
 */
export const getCarLogoWithFallback = async (brandName: string): Promise<string> => {
  const logoUrl = getCarLogoUrl(brandName);
  const exists = await checkLogoExists(brandName);
  
  if (exists) {
    return logoUrl;
  }
  
  return '/car-logos/mein_logo_rest.png'; // Default fallback
};

/**
 * Preload a logo image
 * @param brandName - The name of the car brand
 * @returns Promise<void>
 */
export const preloadCarLogo = (brandName: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve();
    img.onerror = () => reject();
    img.src = getCarLogoUrl(brandName);
  });
};

export default {
  getCarLogoUrl,
  normalizeBrandName,
  checkLogoExists,
  getCarLogoWithFallback,
  preloadCarLogo
};

