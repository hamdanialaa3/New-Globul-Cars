// src/utils/numeric-url-helpers.ts
// 🔢 Helper utilities for building numeric ID-based URLs
// Inspired by mobile.de & AutoScout24 URL structure

/**
 * Build profile URL from numeric ID
 * 
 * 🔒 STRICT PROFILE ACCESS RULES:
 * - /profile/{numericId} → ONLY for own profile
 * - /profile/view/{numericId} → For other users' profiles
 * 
 * @param numericId - User's numeric ID (e.g., 1, 2, 100)
 * @param currentUserNumericId - Current logged-in user's numeric ID (optional)
 * @returns Profile URL following strict access rules
 * 
 * Examples:
 * - buildProfileUrl(90, 90) → "/profile/90" (own profile)
 * - buildProfileUrl(80, 90) → "/profile/view/80" (other user's profile)
 * - buildProfileUrl(1) → "/profile/view/1" (no current user, default to view)
 */
export function buildProfileUrl(
  numericId: number | null | undefined,
  currentUserNumericId?: number | null
): string {
  if (!numericId || numericId <= 0) {
    return '/profile';
  }
  
  // 🔒 Check if this is own profile
  const isOwnProfile = currentUserNumericId !== undefined && 
                       currentUserNumericId !== null && 
                       numericId === currentUserNumericId;
  
  if (isOwnProfile) {
    // 🔒 OWN PROFILE: /profile/{numericId}
    return `/profile/${numericId}`;
  } else {
    // 🔒 OTHER USER'S PROFILE: /profile/view/{numericId}
    return `/profile/view/${numericId}`;
  }
}

/**
 * Build car URL from seller and car numeric IDs
 * 
 * @param sellerNumericId - Seller's numeric ID
 * @param carNumericId - Car's numeric ID (per seller)
 * @returns Car URL (e.g., "/car/1/2") - CONSTITUTION COMPLIANT
 * 
 * Examples:
 * - buildCarUrl(1, 1) → "/car/1/1" (User 1's Car #1)
 * - buildCarUrl(1, 2) → "/car/1/2" (User 1's Car #2)
 * - buildCarUrl(2, 1) → "/car/2/1" (User 2's Car #1)
 * - buildCarUrl(100, 5) → "/car/100/5" (User 100's Car #5)
 */
export function buildCarUrl(
  sellerNumericId: number | null | undefined,
  carNumericId: number | null | undefined
): string {
  if (!sellerNumericId || sellerNumericId <= 0) {
    return '/cars';
  }
  
  if (!carNumericId || carNumericId <= 0) {
    return buildProfileUrl(sellerNumericId);
  }
  
  return `/car/${sellerNumericId}/${carNumericId}`;
}

/**
 * Build car edit URL
 * 
 * @param sellerNumericId - Seller's numeric ID
 * @param carNumericId - Car's numeric ID
 * @returns Car edit URL (e.g., "/car/1/2/edit") - CONSTITUTION COMPLIANT
 */
export function buildCarEditUrl(
  sellerNumericId: number | null | undefined,
  carNumericId: number | null | undefined
): string {
  const carUrl = buildCarUrl(sellerNumericId, carNumericId);
  
  if (carUrl === '/cars' || carUrl.match(/^\/profile\/\d+$/)) {
    return carUrl;
  }
  
  return `${carUrl}/edit`;
}

/**
 * Build profile tab URL
 * 
 * 🔒 STRICT PROFILE ACCESS RULES:
 * - Own profile tabs: /profile/{numericId}/{tab}
 * - Other user's tabs: /profile/view/{numericId}/{tab}
 * 
 * @param numericId - User's numeric ID
 * @param tab - Tab name (my-ads, campaigns, analytics, settings, consultations)
 * @param currentUserNumericId - Current logged-in user's numeric ID (optional)
 * @returns Profile tab URL following strict access rules
 */
export function buildProfileTabUrl(
  numericId: number | null | undefined,
  tab: 'my-ads' | 'campaigns' | 'analytics' | 'settings' | 'consultations',
  currentUserNumericId?: number | null
): string {
  const profileUrl = buildProfileUrl(numericId, currentUserNumericId);
  
  if (profileUrl === '/profile') {
    return profileUrl;
  }
  
  return `${profileUrl}/${tab}`;
}

/**
 * Parse numeric IDs from URL pathname
 * 
 * @param pathname - URL pathname (e.g., "/profile/1/2")
 * @returns Parsed IDs or null
 * 
 * Examples:
 * - parseNumericUrlIds("/profile/1") → { profileId: 1, carId: null }
 * - parseNumericUrlIds("/profile/1/2") → { profileId: 1, carId: 2 }
 * - parseNumericUrlIds("/profile/abc") → null (invalid)
 */
export function parseNumericUrlIds(pathname: string): {
  profileId: number;
  carId: number | null;
} | null {
  // Match /profile/{numericId} or /profile/{numericId}/{carNumericId}
  const match = pathname.match(/^\/profile\/(\d+)(?:\/(\d+))?/);
  
  if (!match) {
    return null;
  }
  
  const profileId = parseInt(match[1], 10);
  const carId = match[2] ? parseInt(match[2], 10) : null;
  
  if (isNaN(profileId)) {
    return null;
  }
  
  return { profileId, carId };
}

/**
 * Check if URL is a numeric profile URL
 * 
 * @param pathname - URL pathname
 * @returns true if URL is /profile/{numericId}
 */
export function isNumericProfileUrl(pathname: string): boolean {
  return /^\/profile\/\d+$/.test(pathname);
}

/**
 * Check if URL is a numeric car URL
 * 
 * @param pathname - URL pathname
 * @returns true if URL is /profile/{numericId}/{carNumericId}
 */
export function isNumericCarUrl(pathname: string): boolean {
  return /^\/profile\/\d+\/\d+$/.test(pathname);
}

/**
 * Generate SEO-friendly meta title for profile
 * 
 * @param displayName - User's display name
 * @param numericId - User's numeric ID
 * @returns Meta title
 * 
 * Example:
 * - buildProfileMetaTitle("Hamid", 1) → "Hamid - Profile #1 | Globul Cars"
 */
export function buildProfileMetaTitle(
  displayName: string,
  numericId: number
): string {
  return `${displayName} - Profile #${numericId} | Globul Cars`;
}

/**
 * Generate SEO-friendly meta title for car
 * 
 * @param carTitle - Car title (e.g., "2020 BMW 320d")
 * @param sellerNumericId - Seller's numeric ID
 * @param carNumericId - Car's numeric ID
 * @returns Meta title
 * 
 * Example:
 * - buildCarMetaTitle("2020 BMW 320d", 1, 2) → "2020 BMW 320d | Seller #1 | Globul Cars"
 */
export function buildCarMetaTitle(
  carTitle: string,
  sellerNumericId: number,
  carNumericId: number
): string {
  return `${carTitle} | Seller #${sellerNumericId} | Globul Cars`;
}
