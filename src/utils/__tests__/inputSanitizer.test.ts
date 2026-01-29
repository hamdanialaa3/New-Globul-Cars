// inputSanitizer.test.ts
// Unit Tests for Input Sanitization Utilities
// Coverage Target: 100%

import { describe, it, expect } from '@jest/globals';
import {
  sanitizeCarMakeModel,
  sanitizeEmail,
  sanitizePhoneNumber,
  sanitizeURL,
  sanitizeFilename,
  escapeHTML,
  validateBulgarianEIK,
} from '../../inputSanitizer';

describe('Input Sanitizer Utilities', () => {
  describe('sanitizeCarMakeModel', () => {
    it('should allow valid car makes and models', () => {
      expect(sanitizeCarMakeModel('BMW')).toBe('BMW');
      expect(sanitizeCarMakeModel('Mercedes-Benz')).toBe('Mercedes-Benz');
      expect(sanitizeCarMakeModel('Alfa Romeo')).toBe('Alfa Romeo');
    });

    it('should remove special characters', () => {
      expect(sanitizeCarMakeModel('BMW<script>')).toBe('BMWscript');
      expect(sanitizeCarMakeModel('Mercedes"OR 1=1')).toBe('MercedesOR 11');
    });

    it('should trim whitespace', () => {
      expect(sanitizeCarMakeModel('  BMW  ')).toBe('BMW');
      expect(sanitizeCarMakeModel('Toyota   ')).toBe('Toyota');
    });

    it('should handle empty input', () => {
      expect(sanitizeCarMakeModel('')).toBe('');
      expect(sanitizeCarMakeModel('   ')).toBe('');
    });

    it('should prevent XSS attacks', () => {
      expect(sanitizeCarMakeModel('<img src=x onerror=alert(1)>')).not.toContain('<');
      expect(sanitizeCarMakeModel('javascript:alert(1)')).not.toContain('javascript:');
    });

    it('should handle Cyrillic characters (Bulgarian)', () => {
      expect(sanitizeCarMakeModel('БМВ')).toBeTruthy();
      expect(sanitizeCarMakeModel('Мерцедес')).toBeTruthy();
    });
  });

  describe('sanitizeEmail', () => {
    it('should allow valid email addresses', () => {
      expect(sanitizeEmail('test@example.com')).toBe('test@example.com');
      expect(sanitizeEmail('user.name+tag@domain.co.uk')).toBe('user.name+tag@domain.co.uk');
    });

    it('should convert to lowercase', () => {
      expect(sanitizeEmail('User@Example.COM')).toBe('user@example.com');
    });

    it('should trim whitespace', () => {
      expect(sanitizeEmail('  test@example.com  ')).toBe('test@example.com');
    });

    it('should reject invalid emails', () => {
      expect(sanitizeEmail('not-an-email')).toBe('');
      expect(sanitizeEmail('missing@domain')).toBe('');
      expect(sanitizeEmail('@example.com')).toBe('');
    });

    it('should prevent XSS in email', () => {
      expect(sanitizeEmail('<script>@example.com')).toBe('');
      expect(sanitizeEmail('test@<script>.com')).toBe('');
    });
  });

  describe('sanitizePhoneNumber', () => {
    it('should allow valid Bulgarian phone numbers', () => {
      expect(sanitizePhoneNumber('+359888123456')).toBe('+359888123456');
      expect(sanitizePhoneNumber('0888123456')).toBe('0888123456');
    });

    it('should remove non-numeric characters except +', () => {
      expect(sanitizePhoneNumber('+359 888 123 456')).toBe('+359888123456');
      expect(sanitizePhoneNumber('(088) 812-3456')).toBe('0888123456');
    });

    it('should reject invalid phone numbers', () => {
      expect(sanitizePhoneNumber('123')).toBe('');
      expect(sanitizePhoneNumber('abcd')).toBe('');
    });

    it('should handle empty input', () => {
      expect(sanitizePhoneNumber('')).toBe('');
      expect(sanitizePhoneNumber('   ')).toBe('');
    });
  });

  describe('sanitizeURL', () => {
    it('should allow valid URLs', () => {
      expect(sanitizeURL('https://example.com')).toBe('https://example.com');
      expect(sanitizeURL('http://test.bg/path?query=1')).toBe('http://test.bg/path?query=1');
    });

    it('should reject javascript: and data: URLs', () => {
      expect(sanitizeURL('javascript:alert(1)')).toBe('');
      expect(sanitizeURL('data:text/html,<script>alert(1)</script>')).toBe('');
    });

    it('should reject invalid URLs', () => {
      expect(sanitizeURL('not-a-url')).toBe('');
      expect(sanitizeURL('ftp://unsafe.com')).toBe('');
    });

    it('should trim whitespace', () => {
      expect(sanitizeURL('  https://example.com  ')).toBe('https://example.com');
    });
  });

  describe('sanitizeFilename', () => {
    it('should allow valid filenames', () => {
      expect(sanitizeFilename('photo.jpg')).toBe('photo.jpg');
      expect(sanitizeFilename('car-image-2023.png')).toBe('car-image-2023.png');
    });

    it('should remove path traversal attempts', () => {
      expect(sanitizeFilename('../../../etc/passwd')).not.toContain('..');
      expect(sanitizeFilename('../../file.txt')).not.toContain('..');
    });

    it('should remove dangerous characters', () => {
      expect(sanitizeFilename('file<script>.jpg')).not.toContain('<');
      expect(sanitizeFilename('photo|rm -rf.png')).not.toContain('|');
    });

    it('should handle Cyrillic filenames', () => {
      expect(sanitizeFilename('снимка.jpg')).toBeTruthy();
      expect(sanitizeFilename('кола-2023.png')).toBeTruthy();
    });
  });

  describe('escapeHTML', () => {
    it('should escape HTML special characters', () => {
      expect(escapeHTML('<script>alert(1)</script>')).not.toContain('<script>');
      expect(escapeHTML('a & b')).toBe('a &amp; b');
      expect(escapeHTML('"quoted"')).toContain('&quot;');
    });

    it('should handle empty input', () => {
      expect(escapeHTML('')).toBe('');
    });

    it('should escape all dangerous characters', () => {
      const dangerous = '<>"\'&';
      const escaped = escapeHTML(dangerous);
      expect(escaped).not.toContain('<');
      expect(escaped).not.toContain('>');
      expect(escaped).toContain('&');
    });
  });

  describe('validateBulgarianEIK', () => {
    it('should validate correct 9-digit EIK', () => {
      expect(validateBulgarianEIK('123456789')).toBe(true);
    });

    it('should validate correct 13-digit EIK', () => {
      expect(validateBulgarianEIK('1234567890123')).toBe(true);
    });

    it('should reject invalid length', () => {
      expect(validateBulgarianEIK('12345')).toBe(false);
      expect(validateBulgarianEIK('12345678901234')).toBe(false);
    });

    it('should reject non-numeric EIK', () => {
      expect(validateBulgarianEIK('12345ABCD')).toBe(false);
      expect(validateBulgarianEIK('abc123456')).toBe(false);
    });

    it('should handle empty input', () => {
      expect(validateBulgarianEIK('')).toBe(false);
      expect(validateBulgarianEIK('   ')).toBe(false);
    });

    it('should trim whitespace before validation', () => {
      expect(validateBulgarianEIK('  123456789  ')).toBe(true);
    });
  });

  describe('XSS Prevention', () => {
    it('should prevent stored XSS', () => {
      const malicious = '<img src=x onerror=alert(document.cookie)>';
      const sanitized = sanitizeCarMakeModel(malicious);
      expect(sanitized).not.toContain('<img');
      expect(sanitized).not.toContain('onerror');
    });

    it('should prevent reflected XSS', () => {
      const malicious = '"><script>alert(1)</script>';
      const sanitized = escapeHTML(malicious);
      expect(sanitized).not.toContain('<script>');
    });

    it('should prevent DOM-based XSS', () => {
      const malicious = 'javascript:alert(document.domain)';
      const sanitized = sanitizeURL(malicious);
      expect(sanitized).toBe('');
    });
  });

  describe('SQL Injection Prevention', () => {
    it('should prevent SQL injection attempts', () => {
      const malicious = "'; DROP TABLE cars; --";
      const sanitized = sanitizeCarMakeModel(malicious);
      expect(sanitized).not.toContain('DROP TABLE');
      expect(sanitized).not.toContain('--');
    });

    it('should prevent UNION attacks', () => {
      const malicious = "BMW' UNION SELECT password FROM users--";
      const sanitized = sanitizeCarMakeModel(malicious);
      expect(sanitized).not.toContain('UNION');
      expect(sanitized).not.toContain('SELECT');
    });
  });
});
