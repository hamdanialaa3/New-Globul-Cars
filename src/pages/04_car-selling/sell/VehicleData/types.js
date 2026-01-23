// Vehicle Data Types
// أنواع بيانات السيارة
export const FUEL_TYPES = [
    'Бензин (Petrol)', 'Дизел (Diesel)', 'Електрически (Electric)', 'Хибрид (Hybrid)', 'Газ/Бензин (LPG)', 'Метан (CNG)', 'Водород (Hydrogen)'
];
export const TRANSMISSION_TYPES = [
    'Ръчна (Manual)', 'Автоматична (Automatic)', 'Полуавтоматична (Semi-auto)'
];
export const DRIVE_TYPES = [
    'Преден (FWD)', // Front-Wheel Drive - دفع أمامي
    'Заден (RWD)', // Rear-Wheel Drive - دفع خلفي  
    'Четириколесен (AWD)', // All-Wheel Drive - دفع رباعي دائم
    '4x4 (4WD)', // Four-Wheel Drive - دفع رباعي قابل للتبديل
    'Друг (Other)' // Other - آخر
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
