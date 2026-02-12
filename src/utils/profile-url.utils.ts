// src/utils/profile-url.utils.ts
// 🔒 Profile URL Generator - Constitution Compliant
// Ensures strict separation between own profile and viewing others' profiles

import { logger } from '@/services/logger-service';

/**
 * 🔒 CRITICAL: Generate correct profile URL based on ownership
 * 
 * Constitution Rules:
 * - /profile/{numericId} → ONLY for own profile
 * - /profile/view/{numericId} → For viewing other users' profiles
 * 
 * @param targetNumericId - The numeric ID of the profile to visit
 * @param currentUserNumericId - The numeric ID of the currently logged-in user (optional)
 * @param tab - Optional tab name (e.g., 'my-ads', 'favorites', 'settings')
 * @returns Correct profile URL path
 */
export const getProfileUrl = (
  targetNumericId: number | string,
  currentUserNumericId?: number | string | null,
  tab?: string
): string => {
  // Convert to numbers for accurate comparison
  const targetId = Number(targetNumericId);
  const currentId = currentUserNumericId ? Number(currentUserNumericId) : null;

  // Validate numeric IDs
  if (isNaN(targetId)) {
    logger.error('Invalid target numeric ID', { targetNumericId });
    return '/profile'; // Fallback to base profile (will auto-redirect)
  }

  // Determine if this is own profile
  const isOwnProfile = currentId !== null && !isNaN(currentId) && currentId === targetId;

  // Build base path
  let basePath: string;
  
  if (isOwnProfile) {
    // 🔒 OWN PROFILE: /profile/{numericId}
    basePath = `/profile/${targetId}`;
    logger.debug('Generated own profile URL', { targetId, basePath });
  } else {
    // 🔒 OTHER USER'S PROFILE: /profile/view/{numericId}
    basePath = `/profile/view/${targetId}`;
    logger.debug('Generated public profile URL', { targetId, currentId, basePath });
  }

  // Add tab if provided
  if (tab) {
    return `${basePath}/${tab}`;
  }

  return basePath;
};

/**
 * 🔒 Generate own profile URL (always /profile/{numericId})
 * Use this when you know for sure it's the current user's profile
 * 
 * @param numericId - The numeric ID of the current user
 * @param tab - Optional tab name
 * @returns Own profile URL path
 */
export const getOwnProfileUrl = (
  numericId: number | string,
  tab?: string
): string => {
  const id = Number(numericId);
  
  if (isNaN(id)) {
    logger.error('Invalid numeric ID for own profile', { numericId });
    return '/profile';
  }

  const basePath = `/profile/${id}`;
  return tab ? `${basePath}/${tab}` : basePath;
};

/**
 * 🔒 Generate public profile view URL (always /profile/view/{numericId})
 * Use this when you want to view another user's profile
 * 
 * @param numericId - The numeric ID of the user to view
 * @param tab - Optional tab name
 * @returns Public profile view URL path
 */
export const getPublicProfileUrl = (
  numericId: number | string,
  tab?: string
): string => {
  const id = Number(numericId);
  
  if (isNaN(id)) {
    logger.error('Invalid numeric ID for public profile', { numericId });
    return '/profile';
  }

  const basePath = `/profile/view/${id}`;
  return tab ? `${basePath}/${tab}` : basePath;
};

/**
 * Check if a profile URL is for own profile
 * 
 * @param url - The profile URL to check
 * @param currentUserNumericId - The numeric ID of the current user
 * @returns true if the URL is for own profile
 */
export const isOwnProfileUrl = (
  url: string,
  currentUserNumericId: number | string | null | undefined
): boolean => {
  if (!currentUserNumericId) return false;

  const currentId = Number(currentUserNumericId);
  if (isNaN(currentId)) return false;

  // Extract numeric ID from URL
  const match = url.match(/^\/profile\/(\d+)/);
  if (!match) return false;

  const urlId = Number(match[1]);
  return urlId === currentId;
};

/**
 * Extract numeric ID from profile URL
 * 
 * @param url - The profile URL
 * @returns Numeric ID or null
 */
export const extractProfileNumericId = (url: string): number | null => {
  // Try /profile/{numericId}
  let match = url.match(/^\/profile\/(\d+)/);
  if (match) {
    return Number(match[1]);
  }

  // Try /profile/view/{numericId}
  match = url.match(/^\/profile\/view\/(\d+)/);
  if (match) {
    return Number(match[1]);
  }

  return null;
};

/**
 * 🔒 CONSTITUTION VALIDATOR: Check if profile URL follows the rules
 * 
 * @param url - The profile URL to validate
 * @param currentUserNumericId - The numeric ID of the current user
 * @returns Object with validation result and suggested correction
 */
export const validateProfileUrl = (
  url: string,
  currentUserNumericId?: number | string | null
): {
  isValid: boolean;
  error?: string;
  suggestedUrl?: string;
} => {
  const numericId = extractProfileNumericId(url);
  
  if (!numericId) {
    return {
      isValid: false,
      error: 'Invalid profile URL format'
    };
  }

  // Check if URL is /profile/{id} (private format)
  if (url.match(/^\/profile\/\d+/)) {
    // Private format - must be own profile
    if (currentUserNumericId) {
      const currentId = Number(currentUserNumericId);
      if (!isNaN(currentId) && currentId !== numericId) {
        return {
          isValid: false,
          error: 'Cannot access another user\'s profile with private URL format',
          suggestedUrl: `/profile/view/${numericId}`
        };
      }
    }
  }

  return { isValid: true };
};

export default {
  getProfileUrl,
  getOwnProfileUrl,
  getPublicProfileUrl,
  isOwnProfileUrl,
  extractProfileNumericId,
  validateProfileUrl
};
