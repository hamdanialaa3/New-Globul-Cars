// src/utils/profile-completion.ts
// Profile Completion Calculator - Calculates profile completion percentage
// Phase -1: Updated to use canonical types

// ✅ NEW: Import from canonical types
import type { BulgarianUser, ProfileType } from '../types/user/bulgarian-user.types';

/**
 * Calculates profile completion percentage based on profile type
 * @param user - BulgarianUser object
 * @param profileType - 'private' | 'dealer' | 'company'
 * @returns number (0-100)
 */
export function calculateProfileCompletion(
  user: BulgarianUser | null,
  profileType: ProfileType
): number {
  if (!user) return 0;

  let score = 0;

  // PRIVATE PERSON CALCULATION (7 fields = 100%)
  if (profileType === 'private') {
    if (user.verification?.email) score += 20;  // Email verified: 20%
    if (user.verification?.phone || user.phoneNumber) score += 20;     // Phone verified: 20%
    if (user.photoURL) score += 15;                                              // Profile photo: 15%
    if (user.displayName || (user.firstName && user.lastName)) score += 10;     // Display name: 10%
    if (user.phoneNumber) score += 10;                                           // Phone number: 10%
    if (user.location?.city) score += 15;                        // Address: 15%
    if (user.bio && user.bio.length >= 50) score += 10;                          // Bio (min 50 chars): 10%
    
    return Math.min(100, score);
  }

  // DEALER CALCULATION (9 fields = 100%)
  if (profileType === 'dealer') {
    if (user.verification?.email) score += 15;  // Email verified: 15%
    if (user.verification?.phone || user.phoneNumber) score += 15;     // Phone verified: 15%
    // Business name from dealerSnapshot
    if ('dealerSnapshot' in user && user.dealerSnapshot?.nameBG) score += 10;    // Business name: 10%
    if (user.verification?.business) score += 15;      // EIK/BULSTAT verified: 15%
    // Business address from dealerSnapshot or location
    if (('dealerSnapshot' in user && user.dealerSnapshot?.address) || user.location?.city) score += 10; // Business address: 10%
    if (user.photoURL) score += 10;                                              // Profile logo/photo: 10%
    // Working hours not in canonical types - skip
    score += 5;                                                                   // Working hours: 5% (placeholder)
    // Business description from about field
    if (user.about && user.about.length >= 100) score += 10;                     // Services offered: 10%
    if (user.planTier !== 'free') score += 10;                                   // Payment method setup: 10%
    
    return Math.min(100, score);
  }

  // COMPANY CALCULATION (10 fields = 100%)
  if (profileType === 'company') {
    if (user.verification?.email) score += 10;  // Email verified: 10%
    if (user.verification?.phone || user.phoneNumber) score += 10;     // Phone verified: 10%
    // Company name from companySnapshot
    if ('companySnapshot' in user && user.companySnapshot?.nameBG) score += 10;  // Company name: 10%
    if (user.verification?.business) score += 15;      // EIK/BULSTAT verified: 15%
    // VAT number from companySnapshot
    if ('companySnapshot' in user && user.companySnapshot?.vatNumber) score += 10; // VAT number: 10%
    if (user.photoURL) score += 10;                                              // Company logo: 10%
    // Headquarters address from companySnapshot or location
    if (('companySnapshot' in user && user.companySnapshot?.address) || user.location?.city) score += 10; // Headquarters address: 10%
    // Phone in companySnapshot, email in user
    if (('companySnapshot' in user && user.companySnapshot?.phone) && user.email) score += 10; // Authorized person: 10%
    if (user.planTier !== 'free') score += 10;                                   // Payment & billing: 10%
    // Team setup check
    if (user.profileType === 'company' && 'teamMembers' in user && user.teamMembers && user.teamMembers.length > 0) score += 5; // Team setup: 5%
    
    return Math.min(100, score);
  }

  return 0;
}

/**
 * Get progress text color based on completion percentage
 * @param progress - number (0-100)
 * @returns color string
 */
export function getProgressColor(progress: number): string {
  if (progress < 50) return '#dc2626';   // red - ناقص
  if (progress < 80) return '#f59e0b';   // amber - جيد
  if (progress < 100) return '#3b82f6';  // blue - ممتاز
  return '#16a34a';                      // green - مكتمل!
}

/**
 * Get profile completion status message
 * @param progress - number (0-100)
 * @param language - 'bg' | 'en'
 * @returns status message
 */
export function getProgressMessage(progress: number, language: 'bg' | 'en'): string {
  if (progress === 100) {
    return language === 'bg' ? 'Всички функции отключени' : 'All features unlocked';
  }
  
  return language === 'bg' 
    ? `Профилът е завършен на ${progress}%` 
    : `Profile ${progress}% complete`;
}

/**
 * Get missing fields for profile completion
 * @param user - BulgarianUser object
 * @param profileType - 'private' | 'dealer' | 'company'
 * @returns array of missing field names
 */
export function getMissingFields(
  user: BulgarianUser | null,
  profileType: ProfileType
): string[] {
  if (!user) return [];

  const missing: string[] = [];

  if (profileType === 'private') {
    if (!user.verification?.email) missing.push('Email verification');
    if (!user.verification?.phone && !user.phoneNumber) missing.push('Phone verification');
    if (!user.photoURL) missing.push('Profile photo');
    if (!user.displayName && (!user.firstName || !user.lastName)) missing.push('Display name');
    if (!user.phoneNumber) missing.push('Phone number');
    if (!user.location?.city) missing.push('Address');
    if (!user.bio || user.bio.length < 50) missing.push('Bio (min 50 characters)');
  }

  if (profileType === 'dealer') {
    if (!user.verification?.email) missing.push('Email verification');
    if (!user.verification?.phone && !user.phoneNumber) missing.push('Phone verification');
    if (!('dealerSnapshot' in user) || !user.dealerSnapshot?.nameBG) missing.push('Business name');
    if (!user.verification?.business) missing.push('EIK/BULSTAT verification');
    if ((!('dealerSnapshot' in user) || !user.dealerSnapshot?.address) && !user.location?.city) missing.push('Business address');
    if (!user.photoURL) missing.push('Business logo');
    // Working hours not in canonical types - skip check
    if (!user.about || user.about.length < 100) missing.push('Services description');
    if (user.planTier === 'free') missing.push('Payment method');
  }

  if (profileType === 'company') {
    if (!user.verification?.email) missing.push('Email verification');
    if (!user.verification?.phone && !user.phoneNumber) missing.push('Phone verification');
    if (!('companySnapshot' in user) || !user.companySnapshot?.nameBG) missing.push('Company name');
    if (!user.verification?.business) missing.push('EIK/BULSTAT verification');
    if (!('companySnapshot' in user) || !user.companySnapshot?.vatNumber) missing.push('VAT number');
    if (!user.photoURL) missing.push('Company logo');
    if ((!('companySnapshot' in user) || !user.companySnapshot?.address) && !user.location?.city) missing.push('Headquarters address');
    if (!('companySnapshot' in user) || !user.companySnapshot?.phone || !user.email) missing.push('Authorized person details');
    if (user.planTier === 'free') missing.push('Payment & billing');
    // Team setup check
  }

  return missing;
}

