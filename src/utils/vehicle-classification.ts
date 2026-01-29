/**
 * Vehicle Classification Utility
 * نظام التصنيف الذكي للسيارات
 * 
 * Rules / القواعد:
 * 1. Family Cars (سيارات عائلية): 7+ seats
 * 2. Sport Cars (سيارات رياضية): 2-3 doors OR power > 270 HP
 */

export interface VehicleSpecs {
  doors?: string;
  seats?: string;
  power?: string | number;
}

export type VehicleCategory = 'family' | 'sport' | 'standard';

/**
 * Classify vehicle as Family, Sport, or Standard
 * تصنيف السيارة إلى عائلية، رياضية، أو عادية
 */
export const classifyVehicle = (specs: VehicleSpecs): VehicleCategory => {
  const { doors, seats, power } = specs;

  // Rule 1: Family Cars - 7+ seats
  // القاعدة 1: سيارات عائلية - 7 ركاب أو أكثر
  if (seats) {
    const seatsNum = parseInt(seats, 10);
    if (!isNaN(seatsNum) && seatsNum >= 7) {
      return 'family';
    }
    // Special case for "9+" option
    if (seats === '9+') {
      return 'family';
    }
  }

  // Rule 2: Sport Cars - 2 or 3 doors
  // القاعدة 2: سيارات رياضية - 2 أو 3 أبواب
  if (doors) {
    if (doors === '2/3') {
      return 'sport';
    }
    const doorsNum = parseInt(doors, 10);
    if (!isNaN(doorsNum) && (doorsNum === 2 || doorsNum === 3)) {
      return 'sport';
    }
  }

  // Rule 3: Sport Cars - Power > 270 HP
  // القاعدة 3: سيارات رياضية - محرك أكثر من 270 حصان
  if (power) {
    const powerNum = typeof power === 'number' ? power : parseInt(power, 10);
    if (!isNaN(powerNum) && powerNum > 270) {
      return 'sport';
    }
  }

  // Default: Standard vehicle
  return 'standard';
};

/**
 * Check if vehicle is Family category
 * التحقق من كون السيارة عائلية
 */
export const isFamilyVehicle = (specs: VehicleSpecs): boolean => {
  return classifyVehicle(specs) === 'family';
};

/**
 * Check if vehicle is Sport category
 * التحقق من كون السيارة رياضية
 */
export const isSportVehicle = (specs: VehicleSpecs): boolean => {
  return classifyVehicle(specs) === 'sport';
};

/**
 * Get category label in specified language
 * الحصول على اسم الفئة باللغة المحددة
 */
export const getCategoryLabel = (
  category: VehicleCategory,
  language: 'bg' | 'en' = 'bg'
): string => {
  const labels = {
    family: {
      bg: 'Семейна кола',
      en: 'Family Car'
    },
    sport: {
      bg: 'Спортна кола',
      en: 'Sport Car'
    },
    standard: {
      bg: 'Стандартна кола',
      en: 'Standard Car'
    }
  };

  return labels[category][language];
};

/**
 * Get category icon/emoji
 * الحصول على أيقونة الفئة
 */
export const getCategoryIcon = (category: VehicleCategory): string => {
  const icons = {
    family: '👨‍👩‍👧‍👦',
    sport: '🏎️',
    standard: '🚗'
  };

  return icons[category];
};

/**
 * Get category color for styling
 * الحصول على لون الفئة للتنسيق
 */
export const getCategoryColor = (category: VehicleCategory): string => {
  const colors = {
    family: '#22c55e', // Green
    sport: '#ef4444',  // Red
    standard: '#3b82f6' // Blue
  };

  return colors[category];
};

/**
 * Filter vehicles by category
 * فلترة السيارات حسب الفئة
 */
export const filterByCategory = <T extends VehicleSpecs>(
  vehicles: T[],
  category: VehicleCategory
): T[] => {
  return vehicles.filter(vehicle => classifyVehicle(vehicle) === category);
};

/**
 * Get classification reason (for debugging/display)
 * الحصول على سبب التصنيف (للتشخيص/العرض)
 */
export const getClassificationReason = (
  specs: VehicleSpecs,
  language: 'bg' | 'en' = 'bg'
): string => {
  const category = classifyVehicle(specs);

  if (category === 'family') {
    const seats = specs.seats || '';
    return language === 'bg' 
      ? `Семейна кола: ${seats} места`
      : `Family Car: ${seats} seats`;
  }

  if (category === 'sport') {
    // Check which rule triggered
    if (specs.doors === '2/3' || parseInt(specs.doors || '0', 10) <= 3) {
      return language === 'bg'
        ? `Спортна кола: ${specs.doors} врати`
        : `Sport Car: ${specs.doors} doors`;
    }
    if (specs.power && parseInt(String(specs.power), 10) > 270) {
      return language === 'bg'
        ? `Спортна кола: ${specs.power} к.с.`
        : `Sport Car: ${specs.power} HP`;
    }
  }

  return language === 'bg' ? 'Стандартна кола' : 'Standard Car';
};
