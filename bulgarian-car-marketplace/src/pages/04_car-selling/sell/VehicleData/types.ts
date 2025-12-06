// Vehicle Data Types
// أنواع بيانات السيارة

export interface VehicleFormData {
  // Required Fields - الحقول الإلزامية
  make: string;        // الماركة
  /** Original user input for make before canonical normalization.
   *  يحفظ الإدخال الأصلي قبل تحويله إلى الشكل القياسي
   */
  makeRaw?: string;
  year: string;        // السنة
  
  // Optional Fields - الحقول الاختيارية
  model: string;       // الموديل
  variant: string;     // الفئة (مثل: S3, RS3, Sportback)
  fuelType: string;    // نوع الوقود
  mileage: string;     // المسافة المقطوعة
  firstRegistration: string; // أول تسجيل
  power: string;       // القوة
  transmission: string; // ناقل الحركة
  doors: string;       // عدد الأبواب
  seats: string;       // عدد المقاعد
  color: string;       // اللون
  previousOwners: string; // المالكون السابقون
  
  // Purchase Information - معلومات الشراء
  // purchaseMonth removed
  // purchaseYear removed
  // purchaseMileage removed
  // annualMileage removed
  // isSoleUser removed
  
  // Exterior Details - تفاصيل خارجية
  exteriorColor: string;   // لون الهيكل الخارجي
  // trimLevel removed
  
  // Location fields (updated to Bulgaria-specific structure)
  saleProvince: string; // Област (Province)
  saleCity: string;     // Град (City)
  salePostalCode: string; // Пощенски код (Postal Code)
  
  // Deprecated fields (kept for backward compatibility, will be removed)
  /** @deprecated Use saleProvince instead */
  saleCountry?: string;
  /** @deprecated Use saleCity + saleProvince instead */
  saleLocation?: string;
  
  saleType: 'private' | 'commercial' | '';
  saleTimeline: 'unknown' | 'soon' | 'months' | '';
  roadworthy: boolean | null;
  
  // Boolean Options - خيارات نعم/لا
  hasAccidentHistory: boolean; // تاريخ حوادث
  hasServiceHistory: boolean;  // تاريخ صيانة
  // Free-text 'Other' fields
  makeOther?: string;
  modelOther?: string;
  // Keep no 'other' for firstRegistration as months/years are fixed calendar values.
  fuelTypeOther?: string;
  colorOther?: string;
  exteriorColorOther?: string;
  // trimLevelOther removed
}

export const FUEL_TYPES = [
  'Petrol', 'Diesel', 'Electric', 'Hybrid', 'LPG', 'CNG', 'Hydrogen'
];

export const TRANSMISSION_TYPES = [
  'Manual', 'Automatic', 'Semi-automatic'
];

export const COLORS = [
  'Black', 'White', 'Silver', 'Gray', 'Red', 'Blue', 
  'Green', 'Yellow', 'Orange', 'Brown', 'Beige', 'Other'
];

export const DOOR_OPTIONS = ['2', '3', '4', '5', '6+'];
export const SEAT_OPTIONS = ['2', '4', '5', '6', '7', '8+'];
export const OWNER_OPTIONS = ['1', '2', '3', '4', '5+'];

// Annual Mileage Options - خيارات المسافة السنوية
export const ANNUAL_MILEAGE_OPTIONS = [
  '5000', '10000', '15000', '20000', '25000', '30000', '40000', '50000+'
];

// Common exterior colors - الألوان الخارجية الشائعة
export const EXTERIOR_COLORS = [
  'Black', 'White', 'Silver', 'Gray', 'Metallic Gray', 
  'Dark Gray', 'Red', 'Blue', 'Dark Blue', 'Green',
  'Yellow', 'Orange', 'Brown', 'Beige', 'Gold', 'Other'
];

