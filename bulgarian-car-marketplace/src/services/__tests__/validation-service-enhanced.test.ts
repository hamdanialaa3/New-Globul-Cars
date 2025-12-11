// Tests for validation-service-enhanced.ts
import validationService from '../validation-service-enhanced';

describe('ValidationService', () => {
  describe('validateField', () => {
    it('should validate required fields', () => {
      const error = validationService.validateField('email', '', { required: true }, 'bg');
      expect(error).toBe('Това поле е задължително');
    });

    it('should pass required validation with valid value', () => {
      const error = validationService.validateField('email', 'test@test.com', { required: true }, 'bg');
      expect(error).toBeNull();
    });

    it('should validate email format', () => {
      const error = validationService.validateField('email', 'invalid-email', { email: true }, 'bg');
      expect(error).toBe('Невалиден имейл адрес');
    });

    it('should pass email validation with valid email', () => {
      const error = validationService.validateField('email', 'test@example.com', { email: true }, 'bg');
      expect(error).toBeNull();
    });

    it('should validate Bulgarian phone numbers', () => {
      // Invalid phone
      let error = validationService.validateField('phone', '123', { phone: true }, 'bg');
      expect(error).toContain('Невалиден телефонен номер');

      // Valid international format
      error = validationService.validateField('phone', '+359888123456', { phone: true }, 'bg');
      expect(error).toBeNull();

      // Valid local format
      error = validationService.validateField('phone', '0888123456', { phone: true }, 'bg');
      expect(error).toBeNull();
    });

    it('should validate year range', () => {
      // Too old
      let error = validationService.validateField('year', 1899, { year: true }, 'bg');
      expect(error).toContain('Невалидна година');

      // Too new
      const futureYear = new Date().getFullYear() + 2;
      error = validationService.validateField('year', futureYear, { year: true }, 'bg');
      expect(error).toContain('Невалидна година');

      // Valid current year
      const currentYear = new Date().getFullYear();
      error = validationService.validateField('year', currentYear, { year: true }, 'bg');
      expect(error).toBeNull();
    });

    it('should validate mileage range', () => {
      // Negative mileage
      let error = validationService.validateField('mileage', -100, { mileage: true }, 'bg');
      expect(error).toContain('Невалиден пробег');

      // Too high
      error = validationService.validateField('mileage', 1500000, { mileage: true }, 'bg');
      expect(error).toContain('Невалиден пробег');

      // Valid mileage
      error = validationService.validateField('mileage', 50000, { mileage: true }, 'bg');
      expect(error).toBeNull();
    });

    it('should validate price range', () => {
      // Negative price
      let error = validationService.validateField('price', -1000, { price: true }, 'bg');
      expect(error).toContain('Невалидна цена');

      // Too high
      error = validationService.validateField('price', 15000000, { price: true }, 'bg');
      expect(error).toContain('Невалидна цена');

      // Valid price
      error = validationService.validateField('price', 25000, { price: true }, 'bg');
      expect(error).toBeNull();
    });

    it('should validate VIN format', () => {
      // Too short
      let error = validationService.validateField('vin', 'ABC123', { vin: true }, 'bg');
      expect(error).toContain('Невалиден VIN номер');

      // Invalid characters (I, O, Q not allowed)
      error = validationService.validateField('vin', 'WBAAA1234IOQABCDE', { vin: true }, 'bg');
      expect(error).toContain('Невалиден VIN номер');

      // Valid VIN
      error = validationService.validateField('vin', 'WBADT43452G612345', { vin: true }, 'bg');
      expect(error).toBeNull();
    });

    it('should validate minLength', () => {
      const error = validationService.validateField('name', 'A', { minLength: 2 }, 'bg');
      expect(error).toContain('Минимална дължина: 2');
    });

    it('should validate maxLength', () => {
      const error = validationService.validateField('name', 'A'.repeat(101), { maxLength: 100 }, 'bg');
      expect(error).toContain('Максимална дължина: 100');
    });

    it('should validate min number', () => {
      const error = validationService.validateField('age', 5, { min: 18 }, 'bg');
      expect(error).toContain('Минимална стойност: 18');
    });

    it('should validate max number', () => {
      const error = validationService.validateField('age', 150, { max: 120 }, 'bg');
      expect(error).toContain('Максимална стойност: 120');
    });

    it('should support English language', () => {
      const error = validationService.validateField('email', '', { required: true }, 'en');
      expect(error).toBe('This field is required');
    });
  });

  describe('validateForm', () => {
    it('should validate multiple fields', () => {
      const data = {
        email: 'invalid',
        phone: '123',
        year: 1899,
      };

      const rules = {
        email: { email: true },
        phone: { phone: true },
        year: { year: true },
      };

      const result = validationService.validateForm(data, rules, 'bg');
      
      expect(result.isValid).toBe(false);
      expect(result.errors.length).toBe(3);
    });

    it('should pass validation for valid data', () => {
      const data = {
        email: 'test@example.com',
        phone: '+359888123456',
        year: 2020,
      };

      const rules = {
        email: { email: true },
        phone: { phone: true },
        year: { year: true },
      };

      const result = validationService.validateForm(data, rules, 'bg');
      
      expect(result.isValid).toBe(true);
      expect(result.errors.length).toBe(0);
    });
  });

  describe('validateVehicleData', () => {
    it('should validate complete vehicle data', () => {
      const validData = {
        make: 'BMW',
        model: '320i',
        year: 2020,
        mileage: 50000,
        fuelType: 'Petrol',
        transmission: 'Automatic',
        bodyType: 'Sedan',
        color: 'Black',
        engineSize: 2000,
        power: 150,
      };

      const result = validationService.validateVehicleData(validData, 'bg');
      expect(result.isValid).toBe(true);
    });

    it('should fail validation for incomplete vehicle data', () => {
      const invalidData = {
        make: 'BMW',
        // Missing required fields
      };

      const result = validationService.validateVehicleData(invalidData, 'bg');
      expect(result.isValid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });
  });

  describe('validatePricing', () => {
    it('should validate pricing data', () => {
      const validData = {
        price: 25000,
        currency: 'BGN',
      };

      const result = validationService.validatePricing(validData, 'bg');
      expect(result.isValid).toBe(true);
    });
  });

  describe('validateContact', () => {
    it('should validate contact data', () => {
      const validData = {
        name: 'Ivan Petrov',
        email: 'ivan@example.com',
        phone: '+359888123456',
      };

      const result = validationService.validateContact(validData, 'bg');
      expect(result.isValid).toBe(true);
    });

    it('should fail for invalid contact data', () => {
      const invalidData = {
        name: 'I', // Too short
        email: 'invalid-email',
        phone: '123',
      };

      const result = validationService.validateContact(invalidData, 'bg');
      expect(result.isValid).toBe(false);
      expect(result.errors.length).toBe(3);
    });
  });
});
