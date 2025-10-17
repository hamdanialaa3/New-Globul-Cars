// Unified Car Data Service
// خدمة بيانات السيارات الموحدة - مصدر واحد للماركات والموديلات

export interface BrandOption {
  value: string;
  label: string;
}

export interface ModelOption {
  value: string;
  label: string;
  brand: string;
}

export interface FuelTypeOption {
  value: string;
  labelBg: string;
  labelEn: string;
}

export class UnifiedCarDataService {
  /**
   * Get all car brands/makes
   * جلب جميع ماركات السيارات
   */
  static getAllMakes(): BrandOption[] {
    const brands = [
      'Audi', 'BMW', 'Mercedes-Benz', 'Volkswagen', 'Toyota', 'Honda',
      'Ford', 'Opel', 'Renault', 'Peugeot', 'Citroën', 'Fiat', 'Seat',
      'Škoda', 'Dacia', 'Suzuki', 'Mazda', 'Mitsubishi', 'Volvo', 'Lexus',
      'Nissan', 'Hyundai', 'Kia', 'Jeep', 'Land Rover', 'Porsche'
    ];
    
    return brands.map((brand: string) => ({
      value: brand,
      label: brand
    })).sort((a: BrandOption, b: BrandOption) => a.label.localeCompare(b.label));
  }

  /**
   * Get models for a specific make
   * جلب الموديلات لماركة معينة
   */
  static getModelsForMake(make: string): ModelOption[] {
    // This would normally fetch from carData
    // For now, return empty array - will be populated dynamically
    return [];
  }

  /**
   * Get variants for a model
   * جلب المتغيرات للموديل
   */
  static getVariantsForModel(make: string, model: string): string[] {
    // This would normally fetch from carData
    // For now, return empty array - will be populated dynamically
    return [];
  }

  /**
   * Get fuel types
   * جلب أنواع الوقود
   */
  static getFuelTypes(language: 'bg' | 'en' = 'bg'): FuelTypeOption[] {
    const fuelTypes = [
      { value: 'petrol', labelBg: 'Бензин', labelEn: 'Petrol' },
      { value: 'diesel', labelBg: 'Дизел', labelEn: 'Diesel' },
      { value: 'electric', labelBg: 'Електрически', labelEn: 'Electric' },
      { value: 'hybrid', labelBg: 'Хибрид', labelEn: 'Hybrid' },
      { value: 'lpg', labelBg: 'ГАЗ/ГНП', labelEn: 'LPG' },
      { value: 'cng', labelBg: 'Метан', labelEn: 'CNG' }
    ];
    
    return fuelTypes.map((fuel: any) => ({
      value: fuel.value,
      labelBg: fuel.labelBg,
      labelEn: fuel.labelEn
    }));
  }

  /**
   * Get transmission types
   */
  static getTransmissionTypes(language: 'bg' | 'en' = 'bg') {
    const transmissionTypes = [
      { value: 'manual', labelBg: 'Ръчна', labelEn: 'Manual' },
      { value: 'automatic', labelBg: 'Автоматична', labelEn: 'Automatic' },
      { value: 'semi-automatic', labelBg: 'Полуавтоматична', labelEn: 'Semi-Automatic' }
    ];
    
    return transmissionTypes.map((trans: any) => ({
      value: trans.value,
      label: language === 'bg' ? trans.labelBg : trans.labelEn
    }));
  }

  /**
   * Get colors
   */
  static getColors(language: 'bg' | 'en' = 'bg') {
    const colors = [
      { value: 'black', labelBg: 'Черен', labelEn: 'Black', hex: '#000000' },
      { value: 'white', labelBg: 'Бял', labelEn: 'White', hex: '#FFFFFF' },
      { value: 'silver', labelBg: 'Сребърен', labelEn: 'Silver', hex: '#C0C0C0' },
      { value: 'gray', labelBg: 'Сив', labelEn: 'Gray', hex: '#808080' },
      { value: 'red', labelBg: 'Червен', labelEn: 'Red', hex: '#FF0000' },
      { value: 'blue', labelBg: 'Син', labelEn: 'Blue', hex: '#0000FF' }
    ];
    
    return colors.map((color: any) => ({
      value: color.value,
      label: language === 'bg' ? color.labelBg : color.labelEn,
      hex: color.hex
    }));
  }

  /**
   * Validate make
   */
  static isValidMake(make: string): boolean {
    const makes = this.getAllMakes();
    return makes.some(m => m.value === make);
  }

  /**
   * Validate model for make
   */
  static isValidModel(make: string, model: string): boolean {
    // Will be implemented with actual data
    return model.length > 0;
  }

  /**
   * Get popular makes (top 15)
   */
  static getPopularMakes(): BrandOption[] {
    const popular = [
      'BMW', 'Mercedes-Benz', 'Audi', 'Volkswagen', 'Toyota',
      'Honda', 'Ford', 'Opel', 'Renault', 'Peugeot',
      'Škoda', 'Hyundai', 'Kia', 'Nissan', 'Mazda'
    ];
    
    return popular.map(brand => ({
      value: brand,
      label: brand
    }));
  }
}

export default UnifiedCarDataService;

