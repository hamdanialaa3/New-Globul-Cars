// Location Helper Service Tests
import LocationHelperService from '../location-helper-service';

describe('LocationHelperService', () => {
  describe('unifyLocation', () => {
    it('should unify location from city ID', () => {
      const result = LocationHelperService.unifyLocation({
        city: 'sofia-city'
      });
      
      expect(result).not.toBeNull();
      expect(result?.cityId).toBe('sofia-city');
      expect(result?.cityNameBg).toBeTruthy();
      expect(result?.coordinates).toBeTruthy();
    });

    it('should unify location from Bulgarian name', () => {
      const result = LocationHelperService.unifyLocation({
        city: 'София'
      });
      
      expect(result).not.toBeNull();
      expect(result?.cityNameBg).toBe('София');
      expect(result?.coordinates).toBeTruthy();
    });

    it('should unify location from English name', () => {
      const result = LocationHelperService.unifyLocation({
        city: 'Sofia'
      });
      
      expect(result).not.toBeNull();
      expect(result?.cityNameEn).toBe('Sofia');
    });

    it('should return null for invalid city', () => {
      const result = LocationHelperService.unifyLocation({
        city: 'InvalidCity12345'
      });
      
      expect(result).toBeNull();
    });

    it('should preserve postal code and address', () => {
      const result = LocationHelperService.unifyLocation({
        city: 'sofia-city',
        postalCode: '1000',
        address: 'ul. Vitosha 100'
      });
      
      expect(result?.postalCode).toBe('1000');
      expect(result?.address).toBe('ul. Vitosha 100');
    });
  });

  describe('getCityName', () => {
    it('should return Bulgarian name by default', () => {
      const location = LocationHelperService.unifyLocation({ city: 'sofia-city' });
      if (location) {
        const name = LocationHelperService.getCityName(location, 'bg');
        expect(name).toBe('София');
      }
    });

    it('should return English name when requested', () => {
      const location = LocationHelperService.unifyLocation({ city: 'sofia-city' });
      if (location) {
        const name = LocationHelperService.getCityName(location, 'en');
        expect(name).toBe('Sofia');
      }
    });
  });

  describe('isInCity', () => {
    it('should correctly identify if car is in city', () => {
      const location = LocationHelperService.unifyLocation({ city: 'sofia-city' });
      if (location) {
        expect(LocationHelperService.isInCity(location, 'sofia-city')).toBe(true);
        expect(LocationHelperService.isInCity(location, 'plovdiv-city')).toBe(false);
      }
    });
  });

  describe('calculateDistance', () => {
    it('should calculate distance between two coordinates', () => {
      const sofia = { lat: 42.6977, lng: 23.3219 };
      const plovdiv = { lat: 42.1354, lng: 24.7453 };
      
      const distance = LocationHelperService.calculateDistance(sofia, plovdiv);
      
      // Distance should be approximately 130-140 km
      expect(distance).toBeGreaterThan(100);
      expect(distance).toBeLessThan(200);
    });

    it('should return 0 for same coordinates', () => {
      const coord = { lat: 42.6977, lng: 23.3219 };
      const distance = LocationHelperService.calculateDistance(coord, coord);
      
      expect(distance).toBe(0);
    });
  });

  describe('validateLocation', () => {
    it('should validate complete location', () => {
      const location = LocationHelperService.unifyLocation({ city: 'sofia-city' });
      if (location) {
        const validation = LocationHelperService.validateLocation(location);
        expect(validation.valid).toBe(true);
        expect(validation.errors).toHaveLength(0);
      }
    });

    it('should return errors for incomplete location', () => {
      const validation = LocationHelperService.validateLocation({});
      expect(validation.valid).toBe(false);
      expect(validation.errors.length).toBeGreaterThan(0);
    });
  });
});

