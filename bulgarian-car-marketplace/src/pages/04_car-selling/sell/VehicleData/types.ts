// Vehicle Data Types
// أنواع بيانات السيارة

export interface VehicleFormData {
  // Required Fields - الحقول الإلزامية
  make: string;        // الماركة
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
  
  // Boolean Options - خيارات نعم/لا
  hasAccidentHistory: boolean; // تاريخ حوادث
  hasServiceHistory: boolean;  // تاريخ صيانة
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

