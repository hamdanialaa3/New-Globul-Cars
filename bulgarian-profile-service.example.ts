/**
 * Bulgarian Profile Service
 * PR#2: Phase-B - Repository Verification and Bulgarian Profile
 * 
 * Enhanced Bulgarian profile service with improved validation, error handling,
 * and safety guards for profile operations.
 * 
 * Location: web/src/services/bulgarian-profile/bulgarian-profile.service.ts
 */

import { Timestamp } from 'firebase/firestore';
import { BulgarianEIKValidator, EIKValidationResult } from './eik-validator';

// ============================================================================
// Types and Interfaces
// ============================================================================

export interface BulgarianAddress {
  street: string;
  city: string;
  region: string;
  postalCode: string;
  country: 'Bulgaria';
}

export interface BulgarianProfile {
  id: string;
  eik: string; // Business ID (9 or 13 digits)
  companyName: string;
  address: BulgarianAddress;
  contactPerson: string;
  phone: string;
  email: string;
  verificationStatus: 'pending' | 'verified' | 'rejected';
  trustScore: number; // 0-100
  createdAt: Timestamp;
  updatedAt: Timestamp;
  version: number; // For optimistic locking
  metadata?: Record<string, any>;
}

export enum BulgarianProfileError {
  INVALID_EIK = 'INVALID_EIK',
  PROFILE_NOT_FOUND = 'PROFILE_NOT_FOUND',
  INSUFFICIENT_PERMISSIONS = 'INSUFFICIENT_PERMISSIONS',
  VALIDATION_FAILED = 'VALIDATION_FAILED',
  UPDATE_CONFLICT = 'UPDATE_CONFLICT',
  NETWORK_ERROR = 'NETWORK_ERROR',
  RATE_LIMIT_EXCEEDED = 'RATE_LIMIT_EXCEEDED',
  CACHE_ERROR = 'CACHE_ERROR'
}

export class BulgarianProfileException extends Error {
  constructor(
    public code: BulgarianProfileError,
    public message: string,
    public details?: any
  ) {
    super(message);
    this.name = 'BulgarianProfileException';
  }
}

interface CachedProfile {
  data: BulgarianProfile;
  timestamp: number;
}

// ============================================================================
// Profile Cache Class
// ============================================================================

class BulgarianProfileCache {
  private cache: Map<string, CachedProfile>;
  private readonly TTL = 5 * 60 * 1000; // 5 minutes
  
  constructor() {
    this.cache = new Map();
  }

  async getProfile(profileId: string): Promise<BulgarianProfile | null> {
    // Check cache first
    const cached = this.cache.get(profileId);
    if (cached && !this.isExpired(cached)) {
      console.log(`Cache hit for profile ${profileId}`);
      return cached.data;
    }
    
    console.log(`Cache miss for profile ${profileId}`);
    // Cache miss or expired - caller should fetch from database
    return null;
  }
  
  setProfile(profileId: string, profile: BulgarianProfile): void {
    this.cache.set(profileId, {
      data: profile,
      timestamp: Date.now()
    });
    console.log(`Cached profile ${profileId}`);
  }
  
  invalidate(profileId: string): void {
    this.cache.delete(profileId);
    console.log(`Invalidated cache for profile ${profileId}`);
  }
  
  invalidateAll(): void {
    this.cache.clear();
    console.log('Invalidated all cached profiles');
  }
  
  private isExpired(cached: CachedProfile): boolean {
    return Date.now() - cached.timestamp > this.TTL;
  }
  
  getStats(): { size: number; ttl: number } {
    return {
      size: this.cache.size,
      ttl: this.TTL
    };
  }
}

// ============================================================================
// Rate Limiter Class
// ============================================================================

class BulgarianProfileRateLimiter {
  private requests: Map<string, number[]>;
  private readonly MAX_REQUESTS = 10;
  private readonly WINDOW_MS = 60 * 1000; // 1 minute
  
  constructor() {
    this.requests = new Map();
  }

  async checkRateLimit(userId: string): Promise<boolean> {
    const now = Date.now();
    const userRequests = this.requests.get(userId) || [];
    
    // Remove old requests outside the window
    const recentRequests = userRequests.filter(
      time => now - time < this.WINDOW_MS
    );
    
    if (recentRequests.length >= this.MAX_REQUESTS) {
      console.warn(`Rate limit exceeded for user ${userId}`);
      return false;
    }
    
    recentRequests.push(now);
    this.requests.set(userId, recentRequests);
    
    return true;
  }
  
  getRemainingRequests(userId: string): number {
    const now = Date.now();
    const userRequests = this.requests.get(userId) || [];
    const recentRequests = userRequests.filter(
      time => now - time < this.WINDOW_MS
    );
    return Math.max(0, this.MAX_REQUESTS - recentRequests.length);
  }
  
  reset(userId: string): void {
    this.requests.delete(userId);
  }
}

// ============================================================================
// Retry Utility
// ============================================================================

interface RetryOptions {
  maxRetries: number;
  backoff: 'linear' | 'exponential';
  initialDelay?: number;
}

async function retryOperation<T>(
  operation: () => Promise<T>,
  options: RetryOptions
): Promise<T> {
  const { maxRetries, backoff, initialDelay = 100 } = options;
  let lastError: Error | null = null;
  
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error as Error;
      
      if (attempt < maxRetries) {
        const delay = backoff === 'exponential'
          ? initialDelay * Math.pow(2, attempt)
          : initialDelay * (attempt + 1);
        
        console.log(`Retry attempt ${attempt + 1}/${maxRetries} after ${delay}ms`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }
  
  throw lastError || new Error('Operation failed after retries');
}

// ============================================================================
// Bulgarian Profile Service Class
// ============================================================================

export class BulgarianProfileService {
  private eikValidator: BulgarianEIKValidator;
  private cache: BulgarianProfileCache;
  private rateLimiter: BulgarianProfileRateLimiter;
  
  constructor() {
    this.eikValidator = new BulgarianEIKValidator();
    this.cache = new BulgarianProfileCache();
    this.rateLimiter = new BulgarianProfileRateLimiter();
  }

  /**
   * Get a Bulgarian profile with caching and safety guards
   * 
   * @param profileId - The profile ID
   * @param userId - The requesting user ID
   * @returns The profile or null if not found
   * @throws BulgarianProfileException on errors
   */
  async getProfile(
    profileId: string,
    userId: string
  ): Promise<BulgarianProfile | null> {
    try {
      // Check rate limit
      const rateLimitOk = await this.rateLimiter.checkRateLimit(userId);
      if (!rateLimitOk) {
        throw new BulgarianProfileException(
          BulgarianProfileError.RATE_LIMIT_EXCEEDED,
          'Rate limit exceeded. Please try again later.',
          { userId, remainingRequests: 0 }
        );
      }
      
      // Try cache first
      const cachedProfile = await this.cache.getProfile(profileId);
      if (cachedProfile) {
        return cachedProfile;
      }
      
      // Fetch from database with retry
      const profile = await retryOperation(
        () => this.fetchProfileFromDatabase(profileId),
        { maxRetries: 3, backoff: 'exponential' }
      );
      
      if (profile) {
        // Cache the result
        this.cache.setProfile(profileId, profile);
      }
      
      return profile;
      
    } catch (error) {
      if (error instanceof BulgarianProfileException) {
        throw error;
      }
      
      throw new BulgarianProfileException(
        BulgarianProfileError.NETWORK_ERROR,
        'Failed to fetch profile',
        { originalError: error, profileId }
      );
    }
  }

  /**
   * Create a new Bulgarian profile with validation
   * 
   * @param profileData - The profile data
   * @param userId - The creating user ID
   * @returns The created profile
   * @throws BulgarianProfileException on validation or creation errors
   */
  async createProfile(
    profileData: Omit<BulgarianProfile, 'id' | 'createdAt' | 'updatedAt' | 'version'>,
    userId: string
  ): Promise<BulgarianProfile> {
    try {
      // Check rate limit
      const rateLimitOk = await this.rateLimiter.checkRateLimit(userId);
      if (!rateLimitOk) {
        throw new BulgarianProfileException(
          BulgarianProfileError.RATE_LIMIT_EXCEEDED,
          'Rate limit exceeded. Please try again later.',
          { userId }
        );
      }
      
      // Validate profile data
      this.validateProfileData(profileData);
      
      // Validate EIK
      const eikResult = this.eikValidator.validateEIK(profileData.eik);
      if (!eikResult.isValid) {
        throw new BulgarianProfileException(
          BulgarianProfileError.INVALID_EIK,
          eikResult.error || 'Invalid EIK',
          { eik: profileData.eik, details: eikResult.details }
        );
      }
      
      // Create profile with retry
      const profile = await retryOperation(
        () => this.createProfileInDatabase(profileData, userId),
        { maxRetries: 3, backoff: 'exponential' }
      );
      
      // Cache the new profile
      this.cache.setProfile(profile.id, profile);
      
      return profile;
      
    } catch (error) {
      if (error instanceof BulgarianProfileException) {
        throw error;
      }
      
      throw new BulgarianProfileException(
        BulgarianProfileError.NETWORK_ERROR,
        'Failed to create profile',
        { originalError: error }
      );
    }
  }

  /**
   * Update a Bulgarian profile with optimistic locking
   * 
   * @param profileId - The profile ID
   * @param updates - The updates to apply
   * @param userId - The updating user ID
   * @returns The updated profile
   * @throws BulgarianProfileException on validation or update errors
   */
  async updateProfile(
    profileId: string,
    updates: Partial<BulgarianProfile>,
    userId: string
  ): Promise<BulgarianProfile> {
    try {
      // Check rate limit
      const rateLimitOk = await this.rateLimiter.checkRateLimit(userId);
      if (!rateLimitOk) {
        throw new BulgarianProfileException(
          BulgarianProfileError.RATE_LIMIT_EXCEEDED,
          'Rate limit exceeded. Please try again later.',
          { userId }
        );
      }
      
      // Validate EIK if provided
      if (updates.eik) {
        const eikResult = this.eikValidator.validateEIK(updates.eik);
        if (!eikResult.isValid) {
          throw new BulgarianProfileException(
            BulgarianProfileError.INVALID_EIK,
            eikResult.error || 'Invalid EIK',
            { eik: updates.eik, details: eikResult.details }
          );
        }
      }
      
      // Get current profile
      const currentProfile = await this.getProfile(profileId, userId);
      if (!currentProfile) {
        throw new BulgarianProfileException(
          BulgarianProfileError.PROFILE_NOT_FOUND,
          'Profile not found',
          { profileId }
        );
      }
      
      // Update with optimistic locking and retry
      const updatedProfile = await this.updateWithOptimisticLocking(
        profileId,
        updates,
        currentProfile.version
      );
      
      // Invalidate cache
      this.cache.invalidate(profileId);
      
      // Cache the updated profile
      this.cache.setProfile(profileId, updatedProfile);
      
      return updatedProfile;
      
    } catch (error) {
      if (error instanceof BulgarianProfileException) {
        throw error;
      }
      
      throw new BulgarianProfileException(
        BulgarianProfileError.NETWORK_ERROR,
        'Failed to update profile',
        { originalError: error, profileId }
      );
    }
  }

  /**
   * Delete a Bulgarian profile
   * 
   * @param profileId - The profile ID
   * @param userId - The deleting user ID
   * @throws BulgarianProfileException on errors
   */
  async deleteProfile(profileId: string, userId: string): Promise<void> {
    try {
      // Check rate limit
      const rateLimitOk = await this.rateLimiter.checkRateLimit(userId);
      if (!rateLimitOk) {
        throw new BulgarianProfileException(
          BulgarianProfileError.RATE_LIMIT_EXCEEDED,
          'Rate limit exceeded. Please try again later.',
          { userId }
        );
      }
      
      // Verify profile exists
      const profile = await this.getProfile(profileId, userId);
      if (!profile) {
        throw new BulgarianProfileException(
          BulgarianProfileError.PROFILE_NOT_FOUND,
          'Profile not found',
          { profileId }
        );
      }
      
      // Delete with retry
      await retryOperation(
        () => this.deleteProfileFromDatabase(profileId),
        { maxRetries: 3, backoff: 'exponential' }
      );
      
      // Invalidate cache
      this.cache.invalidate(profileId);
      
    } catch (error) {
      if (error instanceof BulgarianProfileException) {
        throw error;
      }
      
      throw new BulgarianProfileException(
        BulgarianProfileError.NETWORK_ERROR,
        'Failed to delete profile',
        { originalError: error, profileId }
      );
    }
  }

  // ============================================================================
  // Validation Methods
  // ============================================================================

  private validateProfileData(
    profileData: Partial<BulgarianProfile>
  ): void {
    const errors: string[] = [];
    
    // Validate company name
    if (!profileData.companyName || profileData.companyName.trim().length === 0) {
      errors.push('Company name is required');
    }
    
    // Validate email
    if (!profileData.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(profileData.email)) {
      errors.push('Valid email is required');
    }
    
    // Validate phone
    if (!profileData.phone || profileData.phone.trim().length === 0) {
      errors.push('Phone number is required');
    }
    
    // Validate trust score if provided
    if (profileData.trustScore !== undefined) {
      if (profileData.trustScore < 0 || profileData.trustScore > 100) {
        errors.push('Trust score must be between 0 and 100');
      }
    }
    
    if (errors.length > 0) {
      throw new BulgarianProfileException(
        BulgarianProfileError.VALIDATION_FAILED,
        'Profile validation failed',
        { errors }
      );
    }
  }

  // ============================================================================
  // Database Operations (Placeholders)
  // ============================================================================

  private async fetchProfileFromDatabase(
    profileId: string
  ): Promise<BulgarianProfile | null> {
    // TODO: Implement Firestore query
    // const db = getFirestore();
    // const docRef = doc(db, 'bulgarianProfiles', profileId);
    // const docSnap = await getDoc(docRef);
    // return docSnap.exists() ? docSnap.data() as BulgarianProfile : null;
    
    console.log(`Fetching profile ${profileId} from database`);
    return null; // Placeholder
  }

  private async createProfileInDatabase(
    profileData: Partial<BulgarianProfile>,
    userId: string
  ): Promise<BulgarianProfile> {
    // TODO: Implement Firestore creation
    console.log(`Creating profile in database for user ${userId}`);
    
    // Placeholder
    return {
      ...profileData,
      id: 'new-profile-id',
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
      version: 1
    } as BulgarianProfile;
  }

  private async updateWithOptimisticLocking(
    profileId: string,
    updates: Partial<BulgarianProfile>,
    expectedVersion: number
  ): Promise<BulgarianProfile> {
    const maxRetries = 3;
    let retries = 0;
    
    while (retries < maxRetries) {
      try {
        // TODO: Implement Firestore update with version check
        console.log(
          `Updating profile ${profileId} with version ${expectedVersion}`
        );
        
        // Placeholder
        return {
          ...updates,
          id: profileId,
          version: expectedVersion + 1,
          updatedAt: Timestamp.now()
        } as BulgarianProfile;
        
      } catch (error) {
        if ((error as any).code === 'version-mismatch') {
          retries++;
          await new Promise(resolve => 
            setTimeout(resolve, 100 * Math.pow(2, retries))
          );
          continue;
        }
        throw error;
      }
    }
    
    throw new BulgarianProfileException(
      BulgarianProfileError.UPDATE_CONFLICT,
      'Failed to update profile after maximum retries',
      { profileId, expectedVersion }
    );
  }

  private async deleteProfileFromDatabase(profileId: string): Promise<void> {
    // TODO: Implement Firestore deletion
    console.log(`Deleting profile ${profileId} from database`);
  }
  
  // ============================================================================
  // Utility Methods
  // ============================================================================

  getCacheStats(): { size: number; ttl: number } {
    return this.cache.getStats();
  }
  
  getRemainingRequests(userId: string): number {
    return this.rateLimiter.getRemainingRequests(userId);
  }
  
  clearCache(): void {
    this.cache.invalidateAll();
  }
}

// ============================================================================
// Export
// ============================================================================

export default BulgarianProfileService;
