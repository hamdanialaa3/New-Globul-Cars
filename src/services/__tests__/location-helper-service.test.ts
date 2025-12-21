// Location Helper Service Tests
import LocationHelperService from '../location-helper-service';

describe('LocationHelperService', () => {
  describe('unifyLocation', () => {
    it('should unify location from city ID', () => {
      const result = LocationHelperService.unifyLocation({
        city: 'sofia-grad' // Correct ID from BULGARIAN_CITIES
      });
      
  expect(result).not.toBeNull();
  const cityId = (result as any)?.cityId ?? (result as any)?.locationData?.cityId;
  const cityNameBg = (result as any)?.cityNameBg ?? (result as any)?.cityName?.bg;
  const coordinates = (result as any)?.coordinates ?? (result as any)?.locationData?.coordinates;
  expect(cityId).toBe('sofia-grad');
  expect(!!cityNameBg).toBeTruthy();
  expect(!!coordinates).toBeTruthy();
    });

    it('should unify location from Bulgarian name', () => {
      const result = LocationHelperService.unifyLocation({
        city: 'София - град' // Bulgarian name from BULGARIAN_CITIES
      });
      
  expect(result).not.toBeNull();
  const cityNameBg = (result as any)?.cityNameBg ?? (result as any)?.cityName?.bg;
  const coordinates = (result as any)?.coordinates ?? (result as any)?.locationData?.coordinates;
  expect(cityNameBg).toBe('София - град');
  expect(!!coordinates).toBeTruthy();
    });

    it('should unify location from English name', () => {
      const result = LocationHelperService.unifyLocation({
        city: 'Sofia - City' // English name from BULGARIAN_CITIES
      });
      
  expect(result).not.toBeNull();
  const cityNameEn = (result as any)?.cityNameEn ?? (result as any)?.cityName?.en;
  expect(cityNameEn).toBe('Sofia - City');
    });

    it('should create custom entry for city not in main list', () => {
      const result = LocationHelperService.unifyLocation({
        city: 'InvalidCity12345'
      });
      
      // Service creates custom entry instead of returning null
      expect(result).not.toBeNull();
      expect(result?.cityId).toBe('invalidcity12345');
      expect(result?.cityNameBg).toBe('InvalidCity12345');
    });

    it('should preserve postal code and address', () => {
      const result = LocationHelperService.unifyLocation({
        city: 'sofia-grad', // Correct ID
        postalCode: '1000',
        address: 'ul. Vitosha 100'
      });
      
      expect(result?.postalCode).toBe('1000');
      expect(result?.address).toBe('ul. Vitosha 100');
    });
  });

  describe('getCityName', () => {
    it('should return Bulgarian name by default', () => {
      const location = LocationHelperService.unifyLocation({ city: 'sofia-grad' }); // Correct ID
      expect(location).toBeTruthy();
      // getCityName returns cityNameBg from unified location
      const name = LocationHelperService.getCityName(location as any, 'bg');
      expect(name).toBe('София - град'); // Bulgarian name from BULGARIAN_CITIES
    });

    it('should return English name when requested', () => {
      const location = LocationHelperService.unifyLocation({ city: 'sofia-grad' }); // Correct ID
      expect(location).toBeTruthy();
      // getCityName returns cityNameEn from unified location
      const name = LocationHelperService.getCityName(location as any, 'en');
      expect(name).toBe('Sofia - City'); // English name from BULGARIAN_CITIES
    });
  });

  describe('isInCity', () => {
    it('should correctly identify if car is in city', () => {
      const location = LocationHelperService.unifyLocation({ city: 'sofia-grad' }); // Correct ID
      expect(location).toBeTruthy();
      expect(LocationHelperService.isInCity(location as any, 'sofia-grad')).toBe(true);
      expect(LocationHelperService.isInCity(location as any, 'plovdiv')).toBe(false);
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
      const location = LocationHelperService.unifyLocation({ city: 'sofia-grad' }); // Correct ID
      expect(location).toBeTruthy();
      const validation = LocationHelperService.validateLocation(location as any);
      expect(validation.valid).toBe(true);
      expect(validation.errors).toHaveLength(0);
    });

    it('should return errors for incomplete location', () => {
      const validation = LocationHelperService.validateLocation({});
      expect(validation.valid).toBe(false);
      expect(validation.errors.length).toBeGreaterThan(0);
    });
  });
});

