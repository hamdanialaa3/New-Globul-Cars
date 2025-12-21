/**
 * Workflow Data
 * بيانات الـ workflow
 *
 * This module contains all constants and configuration data for the workflow system.
 * يحتوي هذا الوحدة على جميع الثوابت وبيانات الإعداد لنظام الـ workflow.
 */

// Timer configuration
// إعدادات المؤقت
export const TIMER_DURATION = 20 * 60 * 1000; // 1200000ms = 20 minutes - 20 دقيقة (كافية لإكمال كل الخطوات بدون ضغط)
export const TIMER_UPDATE_INTERVAL = 1000; // Update every second - تحديث كل ثانية

// Storage configuration
// إعدادات التخزين
export const STORAGE_KEY = 'unified-workflow-data';
export const MAX_STORAGE_SIZE = 5 * 1024 * 1024; // 5MB conservative estimate - تقدير متحفظ 5 ميجابايت

// Workflow steps mapping
// خريطة خطوات الـ workflow
export const WORKFLOW_STEPS = {
  VEHICLE_TYPE: 1,
  VEHICLE_DETAILS: 2,
  EQUIPMENT: 3,
  IMAGES: 4,
  PRICING: 5,
  CONTACT: 6,
  PREVIEW: 7
} as const;

export const WORKFLOW_STEP_NAMES = {
  [WORKFLOW_STEPS.VEHICLE_TYPE]: 'vehicle-data',
  [WORKFLOW_STEPS.VEHICLE_DETAILS]: 'vehicle-details',
  [WORKFLOW_STEPS.EQUIPMENT]: 'equipment',
  [WORKFLOW_STEPS.IMAGES]: 'images',
  [WORKFLOW_STEPS.PRICING]: 'pricing',
  [WORKFLOW_STEPS.CONTACT]: 'contact',
  [WORKFLOW_STEPS.PREVIEW]: 'preview'
} as const;

// Reverse mapping for legacy compatibility
// الخريطة العكسية للتوافق الخلفي
export const LEGACY_STEP_MAPPING: Record<string, number> = {
  'vehicle-data': WORKFLOW_STEPS.VEHICLE_TYPE,
  'vehicle-details': WORKFLOW_STEPS.VEHICLE_DETAILS,
  'equipment': WORKFLOW_STEPS.EQUIPMENT,
  'images': WORKFLOW_STEPS.IMAGES,
  'pricing': WORKFLOW_STEPS.PRICING,
  'contact': WORKFLOW_STEPS.CONTACT,
  'preview': WORKFLOW_STEPS.PREVIEW
};

export const REVERSE_STEP_MAPPING: Record<number, string> = {
  [WORKFLOW_STEPS.VEHICLE_TYPE]: 'vehicle-data',
  [WORKFLOW_STEPS.VEHICLE_DETAILS]: 'vehicle-details',
  [WORKFLOW_STEPS.EQUIPMENT]: 'equipment',
  [WORKFLOW_STEPS.IMAGES]: 'images',
  [WORKFLOW_STEPS.PRICING]: 'pricing',
  [WORKFLOW_STEPS.CONTACT]: 'contact',
  [WORKFLOW_STEPS.PREVIEW]: 'preview'
};

// Debounce configuration
// إعدادات التحكم في التكرار
export const SAVE_DEBOUNCE_MS = 100; // Minimum time between saves - الحد الأدنى للوقت بين الحفظ

// Validation messages
// رسائل التحقق
export const VALIDATION_MESSAGES = {
  CRITICAL: {
    MAKE: 'Make (Марка)',
    MODEL: 'Model (Модел)',
    YEAR: 'Year (Година)',
    IMAGES: 'Images (Снимки) - At least 1 required'
  },
  RECOMMENDED: {
    MILEAGE: 'Mileage (Пробег)',
    PRICE: 'Price (Цена)',
    FUEL_TYPE: 'Fuel Type (Гориво)',
    TRANSMISSION: 'Transmission (Скоростна кутия)',
    PHONE: 'Phone (Телефон)',
    EMAIL: 'Email (Имейл)',
    REGION: 'Region (Област)'
  }
} as const;

// Vehicle types
// أنواع المركبات
export const VEHICLE_TYPES = [
  'car',
  'suv',
  'van',
  'motorcycle',
  'truck',
  'bus'
] as const;

// Fuel types
// أنواع الوقود
export const FUEL_TYPES = [
  'petrol',
  'diesel',
  'electric',
  'hybrid',
  'lpg',
  'cng',
  'other'
] as const;

// Transmission types
// أنواع ناقل الحركة
export const TRANSMISSION_TYPES = [
  'manual',
  'automatic',
  'semi-automatic'
] as const;

// Color options
// خيارات الألوان
export const COLOR_OPTIONS = [
  'white',
  'black',
  'silver',
  'gray',
  'blue',
  'red',
  'green',
  'brown',
  'yellow',
  'orange',
  'purple',
  'other'
] as const;

// Equipment categories
// فئات المعدات
export const EQUIPMENT_CATEGORIES = {
  SAFETY: 'safetyEquipment',
  COMFORT: 'comfortEquipment',
  INFOTAINMENT: 'infotainmentEquipment',
  EXTRAS: 'extrasEquipment'
} as const;

// Currency options
// خيارات العملة
export const CURRENCY_OPTIONS = [
  'EUR',
  'BGN'
] as const;

// Price types
// أنواع الأسعار
export const PRICE_TYPES = [
  'fixed',
  'negotiable',
  'contact'
] as const;

// Seller types
// أنواع البائعين
export const SELLER_TYPES = [
  'private',
  'dealer',
  'company'
] as const;