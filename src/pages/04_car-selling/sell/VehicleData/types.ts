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
  condition?: string;  // الحالة (New/Used/Parts)
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
  // Body Type - نوع الهيكل
  bodyType: string; // Sedan, SUV, Hatchback, Coupe, Wagon, Convertible, Pickup, Minivan, other
  bodyTypeOther?: string; // Custom body type when "other" is selected
  // Free-text 'Other' fields
  makeOther?: string;
  modelOther?: string;
  variantOther?: string; // Custom variant when "__other__" is selected
  // Keep no 'other' for firstRegistration as months/years are fixed calendar values.
  fuelTypeOther?: string;
  colorOther?: string;
  exteriorColorOther?: string;
  // trimLevelOther removed
}

export const FUEL_TYPES = [
  'Бензин (Petrol)', 'Дизел (Diesel)', 'Електрически (Electric)', 'Хибрид (Hybrid)', 'Газ/Бензин (LPG)', 'Метан (CNG)', 'Водород (Hydrogen)'
];

export const TRANSMISSION_TYPES = [
  'Ръчна (Manual)', 'Автоматична (Automatic)', 'Полуавтоматична (Semi-auto)'
];

export const COLORS = [
  'Черен (Black)', 'Бял (White)', 'Сребрист (Silver)', 'Сив (Gray)', 'Червен (Red)', 'Син (Blue)',
  'Зелен (Green)', 'Жълт (Yellow)', 'Оранжев (Orange)', 'Кафяв (Brown)', 'Бежов (Beige)', 'Друг (Other)'
];

export const DOOR_OPTIONS = ['2/3', '4/5', '6+']; // Popular shorthand
export const SEAT_OPTIONS = ['1', '2', '3', '4', '5', '6', '7', '8', '9+'];
export const OWNER_OPTIONS = ['1', '2', '3', '4+'];

// Body Type Options - خيارات نوع الهيكل
export const BODY_TYPES = [
  { value: 'sedan', labelBg: 'Седан', labelEn: 'Sedan' },
  { value: 'suv', labelBg: 'Джип', labelEn: 'SUV' }, // "Jeep" is generic for SUV in BG
  { value: 'hatchback', labelBg: 'Хечбек', labelEn: 'Hatchback' },
  { value: 'wagon', labelBg: 'Комби', labelEn: 'Wagon' },
  { value: 'coupe', labelBg: 'Купе', labelEn: 'Coupe' },
  { value: 'convertible', labelBg: 'Кабрио', labelEn: 'Convertible' },
  { value: 'pickup', labelBg: 'Пикап', labelEn: 'Pickup' },
  { value: 'minivan', labelBg: 'Ван / Миниван', labelEn: 'Minivan' },
  { value: 'other', labelBg: 'Друг', labelEn: 'Other' }
];

// Annual Mileage Options - خيارات المسافة السنوية
export const ANNUAL_MILEAGE_OPTIONS = [
  '5000', '10000', '15000', '20000', '25000', '30000', '40000', '50000+'
];

// Common exterior colors - Pеална палитра от цветове
export const EXTERIOR_COLORS = [
  'Черен (Black)', 'Бял (White)', 'Сребрист (Silver)', 'Сив (Gray)', 'Графит (Graphite)', 'Матов (Matte)', 'Перлен (Pearl)',
  'Червен (Red)', 'Вишнев (Dark Red)', 'Бордо (Burgundy)',
  'Син (Blue)', 'Тъмно син (Dark Blue)', 'Светло син (Sky Blue)',
  'Зелен (Green)', 'Тъмно зелен (Dark Green)',
  'Жълт (Yellow)', 'Златист (Gold)',
  'Оранжев (Orange)',
  'Кафяв (Brown)', 'Бежов (Beige)', 'Шампанско (Champagne)',
  'Лилав (Purple)',
  'Розов (Pink)',
  'Бронзов (Bronze)',
  'Друг (Other)'
];

