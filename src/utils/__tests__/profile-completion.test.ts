/**
 * Profile Completion Utility Tests
 * Phase 5.1.3: Unit Tests for Profile Utils
 * 
 * Test Coverage Target: > 90%
 */

import { describe, it, expect } from '@jest/globals';
import { calculateProfileCompletion, getProgressColor, getProgressMessage } from '../profile-completion';
import type { BulgarianUser } from '../../types/user/bulgarian-user.types';

describe('calculateProfileCompletion', () => {
  it('should return 0 for null user', () => {
    const result = calculateProfileCompletion(null, 'private');
    expect(result).toBe(0);
  });

  it('should calculate private profile completion correctly', () => {
    const user: Partial<BulgarianUser> = {
      emailVerified: true,
      phoneNumber: '+359888123456',
      photoURL: 'https://example.com/photo.jpg',
      displayName: 'Test User',
      location: { city: 'Sofia', region: 'Sofia', country: 'Bulgaria' },
      bio: 'This is a test bio with more than 50 characters to meet the requirement'
    };

    const result = calculateProfileCompletion(user as BulgarianUser, 'private');
    expect(result).toBeGreaterThan(0);
    expect(result).toBeLessThanOrEqual(100);
  });

  it('should calculate dealer profile completion correctly', () => {
    const user: Partial<BulgarianUser> = {
      emailVerified: true,
      phoneNumber: '+359888123456',
      photoURL: 'https://example.com/logo.jpg',
      displayName: 'Test Dealer',
      location: { city: 'Sofia', region: 'Sofia', country: 'Bulgaria' }
    };

    const result = calculateProfileCompletion(user as BulgarianUser, 'dealer');
    expect(result).toBeGreaterThan(0);
    expect(result).toBeLessThanOrEqual(100);
  });

  it('should calculate company profile completion correctly', () => {
    const user: Partial<BulgarianUser> = {
      emailVerified: true,
      phoneNumber: '+359888123456',
      photoURL: 'https://example.com/logo.jpg',
      displayName: 'Test Company',
      location: { city: 'Sofia', region: 'Sofia', country: 'Bulgaria' },
      profileType: 'company'
    };

    const result = calculateProfileCompletion(user as BulgarianUser, 'company');
    expect(result).toBeGreaterThan(0);
    expect(result).toBeLessThanOrEqual(100);
  });
});

describe('getProgressColor', () => {
  it('should return red for progress < 50', () => {
    expect(getProgressColor(30)).toBe('#dc2626');
  });

  it('should return amber for progress 50-80', () => {
    expect(getProgressColor(65)).toBe('#f59e0b');
  });

  it('should return blue for progress 80-100', () => {
    expect(getProgressColor(85)).toBe('#3b82f6');
  });

  it('should return green for progress 100', () => {
    expect(getProgressColor(100)).toBe('#16a34a');
  });
});

describe('getProgressMessage', () => {
  it('should return completion message for 100%', () => {
    const bg = getProgressMessage(100, 'bg');
    const en = getProgressMessage(100, 'en');
    
    expect(bg).toContain('Всички функции');
    expect(en).toContain('All features');
  });

  it('should return progress message for < 100%', () => {
    const bg = getProgressMessage(75, 'bg');
    const en = getProgressMessage(75, 'en');
    
    expect(bg).toContain('75%');
    expect(en).toContain('75%');
  });
});

