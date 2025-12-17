/**
 * Numeric System Integration Tests
 * 🔢 Complete test suite for numeric ID system
 * 
 * Run with: npm test -- numeric-system.test.ts
 * 
 * @file numeric-system.test.ts
 * @since 2025-12-16
 */

import {
  formatCarUrl,
  formatMessageUrl,
  formatProfileUrl,
  parseCarUrl,
  parseMessageUrl,
  parseProfileUrl
} from '@/services/numeric-system-validation.service';

describe('🔢 Numeric System - URL Formatting', () => {
  // ==================== FORMAT CAR URL ====================
  describe('formatCarUrl()', () => {
    test('should format valid car URLs', () => {
      expect(formatCarUrl(1, 1)).toBe('/car/1/1');
      expect(formatCarUrl(1, 2)).toBe('/car/1/2');
      expect(formatCarUrl(2, 1)).toBe('/car/2/1');
      expect(formatCarUrl(99, 999)).toBe('/car/99/999');
    });

    test('should reject negative IDs', () => {
      expect(() => formatCarUrl(-1, 1)).toThrow();
      expect(() => formatCarUrl(1, -1)).toThrow();
      expect(() => formatCarUrl(-1, -1)).toThrow();
    });

    test('should reject zero IDs', () => {
      expect(() => formatCarUrl(0, 1)).toThrow();
      expect(() => formatCarUrl(1, 0)).toThrow();
      expect(() => formatCarUrl(0, 0)).toThrow();
    });

    test('should reject non-integer IDs', () => {
      expect(() => formatCarUrl(1.5, 1)).toThrow();
      expect(() => formatCarUrl(1, 1.5)).toThrow();
      expect(() => formatCarUrl('1' as any, 1)).toThrow();
    });
  });

  // ==================== FORMAT MESSAGE URL ====================
  describe('formatMessageUrl()', () => {
    test('should format valid message URLs', () => {
      expect(formatMessageUrl(1, 2)).toBe('/messages/1/2');
      expect(formatMessageUrl(2, 1)).toBe('/messages/2/1');
      expect(formatMessageUrl(1, 1)).toBe('/messages/1/1');
      expect(formatMessageUrl(99, 123)).toBe('/messages/99/123');
    });

    test('should reject negative IDs', () => {
      expect(() => formatMessageUrl(-1, 2)).toThrow();
      expect(() => formatMessageUrl(1, -2)).toThrow();
    });

    test('should reject zero IDs', () => {
      expect(() => formatMessageUrl(0, 2)).toThrow();
      expect(() => formatMessageUrl(1, 0)).toThrow();
    });

    test('should reject non-integer IDs', () => {
      expect(() => formatMessageUrl(1.5, 2)).toThrow();
      expect(() => formatMessageUrl(1, 2.5)).toThrow();
    });
  });

  // ==================== FORMAT PROFILE URL ====================
  describe('formatProfileUrl()', () => {
    test('should format valid profile URLs', () => {
      expect(formatProfileUrl(1)).toBe('/profile/1');
      expect(formatProfileUrl(2)).toBe('/profile/2');
      expect(formatProfileUrl(999)).toBe('/profile/999');
    });

    test('should reject negative IDs', () => {
      expect(() => formatProfileUrl(-1)).toThrow();
      expect(() => formatProfileUrl(-999)).toThrow();
    });

    test('should reject zero IDs', () => {
      expect(() => formatProfileUrl(0)).toThrow();
    });

    test('should reject non-integer IDs', () => {
      expect(() => formatProfileUrl(1.5)).toThrow();
      expect(() => formatProfileUrl('1' as any)).toThrow();
    });
  });
});

describe('🔢 Numeric System - URL Parsing', () => {
  // ==================== PARSE CAR URL ====================
  describe('parseCarUrl()', () => {
    test('should parse valid car URLs', () => {
      expect(parseCarUrl('/car/1/1')).toEqual({ userNumericId: 1, carNumericId: 1 });
      expect(parseCarUrl('/car/1/2')).toEqual({ userNumericId: 1, carNumericId: 2 });
      expect(parseCarUrl('/car/2/1')).toEqual({ userNumericId: 2, carNumericId: 1 });
      expect(parseCarUrl('/car/99/999')).toEqual({ userNumericId: 99, carNumericId: 999 });
    });

    test('should reject invalid car URLs', () => {
      expect(parseCarUrl('/car/1')).toBeNull();
      expect(parseCarUrl('/car/1/1/1')).toBeNull();
      expect(parseCarUrl('/car/abc/1')).toBeNull();
      expect(parseCarUrl('/car/1/abc')).toBeNull();
      expect(parseCarUrl('/profile/1')).toBeNull();
      expect(parseCarUrl('/messages/1/1')).toBeNull();
      expect(parseCarUrl('')).toBeNull();
      expect(parseCarUrl('/car')).toBeNull();
    });

    test('should reject negative or zero IDs', () => {
      expect(parseCarUrl('/car/-1/1')).toBeNull();
      expect(parseCarUrl('/car/1/-1')).toBeNull();
      expect(parseCarUrl('/car/0/1')).toBeNull();
      expect(parseCarUrl('/car/1/0')).toBeNull();
    });

    test('should reject float IDs', () => {
      expect(parseCarUrl('/car/1.5/1')).toBeNull();
      expect(parseCarUrl('/car/1/1.5')).toBeNull();
    });
  });

  // ==================== PARSE MESSAGE URL ====================
  describe('parseMessageUrl()', () => {
    test('should parse valid message URLs', () => {
      expect(parseMessageUrl('/messages/1/2')).toEqual({
        senderNumericId: 1,
        recipientNumericId: 2
      });
      expect(parseMessageUrl('/messages/2/1')).toEqual({
        senderNumericId: 2,
        recipientNumericId: 1
      });
      expect(parseMessageUrl('/messages/99/123')).toEqual({
        senderNumericId: 99,
        recipientNumericId: 123
      });
    });

    test('should reject invalid message URLs', () => {
      expect(parseMessageUrl('/messages/1')).toBeNull();
      expect(parseMessageUrl('/messages/1/2/3')).toBeNull();
      expect(parseMessageUrl('/messages/abc/1')).toBeNull();
      expect(parseMessageUrl('/messages/1/abc')).toBeNull();
      expect(parseMessageUrl('/car/1/1')).toBeNull();
      expect(parseMessageUrl('/profile/1')).toBeNull();
      expect(parseMessageUrl('')).toBeNull();
    });

    test('should reject negative or zero IDs', () => {
      expect(parseMessageUrl('/messages/-1/2')).toBeNull();
      expect(parseMessageUrl('/messages/1/-2')).toBeNull();
      expect(parseMessageUrl('/messages/0/2')).toBeNull();
      expect(parseMessageUrl('/messages/1/0')).toBeNull();
    });
  });

  // ==================== PARSE PROFILE URL ====================
  describe('parseProfileUrl()', () => {
    test('should parse valid profile URLs', () => {
      expect(parseProfileUrl('/profile/1')).toBe(1);
      expect(parseProfileUrl('/profile/2')).toBe(2);
      expect(parseProfileUrl('/profile/999')).toBe(999);
    });

    test('should reject invalid profile URLs', () => {
      expect(parseProfileUrl('/profile')).toBeNull();
      expect(parseProfileUrl('/profile/1/1')).toBeNull();
      expect(parseProfileUrl('/profile/abc')).toBeNull();
      expect(parseProfileUrl('/car/1/1')).toBeNull();
      expect(parseProfileUrl('/messages/1/1')).toBeNull();
      expect(parseProfileUrl('')).toBeNull();
    });

    test('should reject negative or zero IDs', () => {
      expect(parseProfileUrl('/profile/-1')).toBeNull();
      expect(parseProfileUrl('/profile/0')).toBeNull();
    });

    test('should reject float IDs', () => {
      expect(parseProfileUrl('/profile/1.5')).toBeNull();
    });
  });
});

describe('🔢 Numeric System - URL Round-Trip', () => {
  test('Car URL: format → parse → format should be identical', () => {
    const userNumId = 1;
    const carNumId = 1;

    const formatted = formatCarUrl(userNumId, carNumId);
    const parsed = parseCarUrl(formatted);
    const reformatted = formatCarUrl(parsed!.userNumericId, parsed!.carNumericId);

    expect(reformatted).toBe(formatted);
  });

  test('Message URL: format → parse → format should be identical', () => {
    const senderId = 1;
    const recipientId = 2;

    const formatted = formatMessageUrl(senderId, recipientId);
    const parsed = parseMessageUrl(formatted);
    const reformatted = formatMessageUrl(parsed!.senderNumericId, parsed!.recipientNumericId);

    expect(reformatted).toBe(formatted);
  });

  test('Profile URL: format → parse → format should be identical', () => {
    const numId = 42;

    const formatted = formatProfileUrl(numId);
    const parsed = parseProfileUrl(formatted);
    const reformatted = formatProfileUrl(parsed!);

    expect(reformatted).toBe(formatted);
  });
});

describe('🔢 Numeric System - Edge Cases', () => {
  test('Large numeric IDs should work', () => {
    expect(formatCarUrl(999999, 999999)).toBe('/car/999999/999999');
    expect(parseCarUrl('/car/999999/999999')).toEqual({
      userNumericId: 999999,
      carNumericId: 999999
    });
  });

  test('Single digit IDs should work', () => {
    expect(formatCarUrl(1, 1)).toBe('/car/1/1');
    expect(parseCarUrl('/car/1/1')).toEqual({ userNumericId: 1, carNumericId: 1 });
  });

  test('Mixed digit counts should work', () => {
    expect(formatCarUrl(1, 123)).toBe('/car/1/123');
    expect(formatCarUrl(999, 1)).toBe('/car/999/1');
    expect(parseCarUrl('/car/1/123')).toEqual({ userNumericId: 1, carNumericId: 123 });
    expect(parseCarUrl('/car/999/1')).toEqual({ userNumericId: 999, carNumericId: 1 });
  });
});

describe('🔢 Numeric System - Data Validation Scenarios', () => {
  test('User 1 creates 3 cars: /car/1/1, /car/1/2, /car/1/3', () => {
    const car1 = formatCarUrl(1, 1);
    const car2 = formatCarUrl(1, 2);
    const car3 = formatCarUrl(1, 3);

    expect(car1).toBe('/car/1/1');
    expect(car2).toBe('/car/1/2');
    expect(car3).toBe('/car/1/3');

    // Each should parse correctly
    expect(parseCarUrl(car1)?.carNumericId).toBe(1);
    expect(parseCarUrl(car2)?.carNumericId).toBe(2);
    expect(parseCarUrl(car3)?.carNumericId).toBe(3);
  });

  test('User 2 creates cars independently: /car/2/1, /car/2/2', () => {
    const car1 = formatCarUrl(2, 1);
    const car2 = formatCarUrl(2, 2);

    expect(car1).toBe('/car/2/1');
    expect(car2).toBe('/car/2/2');

    // Different user, same car sequences
    expect(parseCarUrl(car1)?.userNumericId).toBe(2);
    expect(parseCarUrl(car2)?.userNumericId).toBe(2);
  });

  test('Messaging between users 1 and 2', () => {
    const msg1to2 = formatMessageUrl(1, 2);
    const msg2to1 = formatMessageUrl(2, 1);

    expect(msg1to2).toBe('/messages/1/2');
    expect(msg2to1).toBe('/messages/2/1');

    // Bidirectional messaging URLs are different
    expect(msg1to2).not.toBe(msg2to1);

    // But they reference the same users
    expect(parseMessageUrl(msg1to2)?.recipientNumericId).toBe(
      parseMessageUrl(msg2to1)?.senderNumericId
    );
  });

  test('Profile URLs for users 1 and 2', () => {
    const profile1 = formatProfileUrl(1);
    const profile2 = formatProfileUrl(2);

    expect(profile1).toBe('/profile/1');
    expect(profile2).toBe('/profile/2');

    // Each should parse to correct numeric ID
    expect(parseProfileUrl(profile1)).toBe(1);
    expect(parseProfileUrl(profile2)).toBe(2);
  });
});
