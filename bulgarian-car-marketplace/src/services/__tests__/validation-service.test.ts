// src/services/__tests__/validation-service.test.ts
// Unit Tests for Validation Service

import { ValidationService, validator } from '../validation-service';

describe('ValidationService', () => {
  describe('validateField', () => {
    it('should validate required fields', () => {
      const error = validator.validateField('email', '', { required: true }, 'bg');
      expect(error).toBe('Това поле е задължително');
    });

    it('should validate min length', () => {
      const error = validator.validateField('name', 'ab', { minLength: 3 }, 'bg');
      expect(error).toContain('Минимум 3 символа');
    });

    it('should validate max length', () => {
      const error = validator.validateField('name', 'a'.repeat(101), { maxLength: 100 }, 'bg');
      expect(error).toContain('Максимум 100 символа');
    });

    it('should validate pattern', () => {
      const error = validator.validateField('email', 'invalid-email', { 
        pattern: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/ 
      }, 'bg');
      expect(error).toBe('Невалиден формат');
    });

    it('should pass valid input', () => {
      const error = validator.validateField('email', 'test@example.com', {
        required: true,
        pattern: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/
      }, 'bg');
      expect(error).toBeNull();
    });
  });

  describe('validateUserRegistration', () => {
    it('should validate valid registration data', () => {
      const data = {
        email: 'test@example.com',
        password: 'Test123!@#',
        confirmPassword: 'Test123!@#',
        firstName: 'John',
        lastName: 'Doe',
        preferredLanguage: 'bg' as const
      };

      const result = validator.validateUserRegistration(data, 'bg');
      expect(result.isValid).toBe(true);
      expect(Object.keys(result.errors)).toHaveLength(0);
    });

    it('should reject invalid email', () => {
      const data = {
        email: 'invalid-email',
        password: 'Test123!@#',
        confirmPassword: 'Test123!@#',
        firstName: 'John',
        lastName: 'Doe',
        preferredLanguage: 'bg' as const
      };

      const result = validator.validateUserRegistration(data, 'bg');
      expect(result.isValid).toBe(false);
      expect(result.errors.email).toBeDefined();
    });

    it('should reject mismatched passwords', () => {
      const data = {
        email: 'test@example.com',
        password: 'Test123!@#',
        confirmPassword: 'Different123!@#',
        firstName: 'John',
        lastName: 'Doe',
        preferredLanguage: 'bg' as const
      };

      const result = validator.validateUserRegistration(data, 'bg');
      expect(result.isValid).toBe(false);
      expect(result.errors.confirmPassword).toContain('не съвпадат');
    });
  });

  describe('sanitizeInput', () => {
    it('should remove HTML tags', () => {
      const sanitized = validator.sanitizeInput('<script>alert("xss")</script>');
      expect(sanitized).not.toContain('<');
      expect(sanitized).not.toContain('>');
    });

    it('should remove javascript: protocol', () => {
      const sanitized = validator.sanitizeInput('javascript:alert("xss")');
      expect(sanitized).not.toContain('javascript:');
    });

    it('should remove event handlers', () => {
      const sanitized = validator.sanitizeInput('onclick=alert("xss")');
      expect(sanitized).not.toContain('onclick=');
    });
  });

  describe('validateSearchQuery', () => {
    it('should validate valid search query', () => {
      const result = validator.validateSearchQuery('BMW 320d', 'bg');
      expect(result.isValid).toBe(true);
      expect(result.sanitizedQuery).toBe('BMW 320d');
    });

    it('should reject too short query', () => {
      const result = validator.validateSearchQuery('a', 'bg');
      expect(result.isValid).toBe(false);
      expect(result.error).toContain('поне 2 символа');
    });

    it('should reject too long query', () => {
      const result = validator.validateSearchQuery('a'.repeat(101), 'bg');
      expect(result.isValid).toBe(false);
      expect(result.error).toContain('100 символа');
    });
  });
});
