// Unified Cities Service
// خدمة المدن الموحدة - مصدر واحد للحقيقة

import { BULGARIAN_CITIES } from '@/constants/bulgarianCities';

export interface CityOption {
  value: string;
  labelBg: string;
  labelEn: string;
  coordinates: { lat: number; lng: number };
}

export class UnifiedCitiesService {
  /**
   * Get all cities for dropdown/select components
   * جلب جميع المدن للقوائم المنسدلة
   */
  static getCitiesForSelect(language: 'bg' | 'en' = 'bg'): CityOption[] {
    return BULGARIAN_CITIES.map(city => ({
      value: city.id,
      labelBg: city.nameBg,
      labelEn: city.nameEn,
      coordinates: city.coordinates
    })).sort((a, b) => {
      const labelA = language === 'bg' ? a.labelBg : a.labelEn;
      const labelB = language === 'bg' ? b.labelBg : b.labelEn;
      return labelA.localeCompare(labelB);
    });
  }

  /**
   * Get city label by ID
   */
  static getCityLabel(cityId: string, language: 'bg' | 'en' = 'bg'): string {
    const city = BULGARIAN_CITIES.find(c => c.id === cityId);
    if (!city) return cityId;
    return language === 'bg' ? city.nameBg : city.nameEn;
  }

  /**
   * Get city by ID
   */
  static getCityById(cityId: string) {
    return BULGARIAN_CITIES.find(c => c.id === cityId);
  }

  /**
   * Validate city ID
   */
  static isValidCityId(cityId: string): boolean {
    return BULGARIAN_CITIES.some(c => c.id === cityId);
  }

  /**
   * Get major cities (population > 100,000)
   */
  static getMajorCities(language: 'bg' | 'en' = 'bg'): CityOption[] {
    return BULGARIAN_CITIES
      .filter(city => (city.population || 0) > 100000)
      .map(city => ({
        value: city.id,
        labelBg: city.nameBg,
        labelEn: city.nameEn,
        coordinates: city.coordinates
      }))
      .sort((a, b) => {
        const labelA = language === 'bg' ? a.labelBg : a.labelEn;
        const labelB = language === 'bg' ? b.labelBg : b.labelEn;
        return labelA.localeCompare(labelB);
      });
  }
}

export default UnifiedCitiesService;

