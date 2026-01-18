/**
 * Profile Completion Utility (FIXED VERSION - Jan 18, 2026)
 * Phase 5.1.2: Profile Completion Calculation
 * 
 * ✅ FIXED: Uses only properties that actually exist in BaseProfile
 * ❌ REMOVED: emailVerified, businessName, bulstat, vatNumber, etc. (don't exist on BulgarianUser)
 * ✅ USES: verification.email, verification.phone, verification.business, dealerSnapshot, companySnapshot, planTier
 */

import type { BulgarianUser, ProfileType } from '../types/user/bulgarian-user.types';

/**
 * Calculates profile completion percentage based on profile type
 * @param user - BulgarianUser object (uses actual BaseProfile fields only)
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
    if (user.location?.city) score += 15;                                        // Address: 15%
    if (user.bio && user.bio.length >= 50) score += 10;                          // Bio (min 50 chars): 10%
    
    return Math.min(100, score);
  }

  // DEALER CALCULATION (simplified based on actual BaseProfile fields)
  if (profileType === 'dealer') {
    if (user.verification?.email) score += 15;                     // Email verified: 15%
    if (user.verification?.phone || user.phoneNumber) score += 15; // Phone verified: 15%
    if (user.dealerSnapshot?.nameBG) score += 15;                  // Business name: 15%
    if (user.verification?.business) score += 20;                  // Business verified: 20%
    if (user.location?.city) score += 10;                          // Business address: 10%
    if (user.photoURL) score += 10;                                 // Profile logo/photo: 10%
    if (user.dealerSnapshot?.address) score += 5;                  // Full address: 5%
    if (user.planTier !== 'free') score += 10;                     // Payment method setup: 10%
    
    return Math.min(100, score);
  }

  // COMPANY CALCULATION (simplified based on actual BaseProfile fields)
  if (profileType === 'company') {
    if (user.verification?.email) score += 15;                       // Email verified: 15%
    if (user.verification?.phone || user.phoneNumber) score += 15;   // Phone verified: 15%
    if (user.companySnapshot?.nameBG) score += 15;                   // Company name: 15%
    if (user.verification?.business) score += 20;                    // EIK/BULSTAT verified: 20%
    if (user.photoURL) score += 10;                                   // Company logo: 10%
    if (user.location?.city) score += 10;                             // Headquarters address: 10%
    if (user.companySnapshot?.email && user.companySnapshot?.phone) score += 10; // Authorized person: 10%
    if (user.planTier !== 'free') score += 5;                        // Payment setup: 5%
    
    return Math.min(100, score);
  }

  return 0;
}

/**
 * Get progress color based on completion percentage
 * @param progress - completion percentage (0-100)
 * @returns color name
 */
export function getProgressColor(progress: number): 'red' | 'orange' | 'yellow' | 'green' {
  if (progress < 25) return 'red';
  if (progress < 50) return 'orange';
  if (progress < 75) return 'yellow';
  return 'green';
}

/**
 * Get progress message based on completion percentage
 * @param progress - completion percentage (0-100)
 * @param language - 'bg' | 'en'
 * @returns message string
 */
export function getProgressMessage(progress: number, language: 'bg' | 'en'): string {
  if (progress < 25) {
    return language === 'bg' ? 'Започнете да попълвате профила си' : 'Start filling your profile';
  }
  if (progress < 50) {
    return language === 'bg' ? 'Добър старт! Продължете' : 'Good start! Continue';
  }
  if (progress < 75) {
    return language === 'bg' ? 'Почти готово!' : 'Almost there!';
  }
  if (progress < 100) {
    return language === 'bg' ? 'Отлична работа!' : 'Excellent work!';
  }
  return language === 'bg' ? 'Профилът е завършен' : 'Profile is complete';
}

/**
 * Get missing fields for profile completion
 * @param user - BulgarianUser object (uses actual BaseProfile fields only)
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
    if (!user.dealerSnapshot?.nameBG) missing.push('Business name');
    if (!user.verification?.business) missing.push('EIK/BULSTAT verification');
    if (!user.location?.city) missing.push('Business address');
    if (!user.photoURL) missing.push('Business logo');
    if (user.planTier === 'free') missing.push('Payment method');
  }

  if (profileType === 'company') {
    if (!user.verification?.email) missing.push('Email verification');
    if (!user.verification?.phone && !user.phoneNumber) missing.push('Phone verification');
    if (!user.companySnapshot?.nameBG) missing.push('Company name');
    if (!user.verification?.business) missing.push('EIK/BULSTAT verification');
    if (!user.photoURL) missing.push('Company logo');
    if (!user.location?.city) missing.push('Headquarters address');
    if (!user.companySnapshot?.email || !user.companySnapshot?.phone) missing.push('Authorized person details');
    if (user.planTier === 'free') missing.push('Payment & billing');
  }

  return missing;
}
