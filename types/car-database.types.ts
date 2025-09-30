/**
 * أنواع بيانات قاعدة السيارات المستوحاة من mobile.de
 * Car Database Types Inspired by mobile.de
 */

export interface CarBrand {
  id: string;
  name: string;
  nameAr: string;
  country: string;
  countryAr: string;
  seriesCount: number;
  logo: string;
  category: BrandCategory;
  popular: boolean;
  series: CarSeries[];
}

export interface CarSeries {
  name: string;
  nameAr: string;
  type: string;
  bodyTypes: BodyType[];
}

export type BrandCategory = 
  | 'luxury'           // فاخرة
  | 'mainstream'       // عادية
  | 'performance'      // رياضية
  | 'electric-performance'  // رياضية كهربائية
  | 'budget';          // اقتصادية

export type BodyType = 
  | 'Sedan'           // سيدان
  | 'SUV'             // دفع رباعي
  | 'Hatchback'       // هاتشباك
  | 'Station Wagon'   // ستيشن واغن
  | 'Estate'          // استيت
  | 'Touring'         // تورينغ
  | 'Coupe'           // كوبيه
  | 'Convertible'     // كابريوليه
  | 'Cabriolet'       // كابريوليه
  | 'Van'             // فان
  | 'Pickup'          // بيك أب
  | 'Roadster'        // رودستر
  | 'Gran Coupe'      // جران كوبيه
  | 'Gran Turismo'    // جران توريزمو
  | 'Sportback'       // سبورت باك
  | 'Fastback'        // فاست باك
  | 'MPV'             // إم بي في
  | 'SUV Coupe';      // SUV كوبيه

export interface BodyTypeInfo {
  id: string;
  name: string;
  nameAr: string;
  description: string;
  descriptionAr: string;
}

export type FuelType = 
  | 'petrol'           // بنزين
  | 'diesel'           // ديزل
  | 'electric'         // كهربائي
  | 'hybrid'           // هجين
  | 'plug-in-hybrid'   // هجين قابل للشحن
  | 'cng'              // غاز طبيعي
  | 'lpg';             // غاز بترول مسال

export interface FuelTypeInfo {
  id: FuelType;
  name: string;
  nameAr: string;
}

export type TransmissionType = 
  | 'manual'           // يدوي
  | 'automatic'        // أوتوماتيك
  | 'semi-automatic'   // نصف أوتوماتيك
  | 'cvt';             // سي في تي

export interface TransmissionInfo {
  id: TransmissionType;
  name: string;
  nameAr: string;
}

export interface CategoryInfo {
  id: BrandCategory;
  name: string;
  nameAr: string;
}

/**
 * فلاتر البحث المتقدم
 * Advanced Search Filters
 */
export interface CarSearchFilters {
  // العلامة التجارية
  brand?: string[];
  
  // السلسلة / الموديل
  series?: string[];
  
  // نوع الهيكل
  bodyType?: BodyType[];
  
  // نوع الوقود
  fuelType?: FuelType[];
  
  // ناقل الحركة
  transmission?: TransmissionType[];
  
  // السعر
  priceMin?: number;
  priceMax?: number;
  
  // السنة
  yearMin?: number;
  yearMax?: number;
  
  // المسافة المقطوعة (كم)
  mileageMin?: number;
  mileageMax?: number;
  
  // قوة المحرك (حصان)
  horsepowerMin?: number;
  horsepowerMax?: number;
  
  // حالة السيارة
  condition?: CarCondition[];
  
  // اللون الخارجي
  exteriorColor?: string[];
  
  // اللون الداخلي
  interiorColor?: string[];
  
  // عدد الأبواب
  doors?: number[];
  
  // عدد المقاعد
  seats?: number[];
  
  // الموقع
  location?: string;
  
  // نطاق البحث (كم)
  searchRadius?: number;
}

export type CarCondition = 
  | 'new'              // جديدة
  | 'used'             // مستعملة
  | 'certified'        // معتمدة
  | 'damaged';         // تالفة

/**
 * بيانات إعلان السيارة الكامل
 * Full Car Listing Data
 */
export interface CarListing {
  id: string;
  
  // معلومات العلامة والموديل
  brand: string;
  brandAr: string;
  series: string;
  seriesAr: string;
  model?: string;
  generation?: string;
  
  // المواصفات الأساسية
  year: number;
  bodyType: BodyType;
  fuelType: FuelType;
  transmission: TransmissionType;
  
  // المحرك والأداء
  engineSize?: number;        // سي سي
  horsepower?: number;        // حصان
  torque?: number;            // نيوتن متر
  cylinders?: number;         // عدد الأسطوانات
  acceleration?: number;      // 0-100 كم/س
  topSpeed?: number;          // السرعة القصوى
  
  // الاستهلاك والبيئة
  fuelConsumption?: number;   // لتر/100كم
  co2Emissions?: number;      // جرام/كم
  emissionClass?: string;     // فئة الانبعاثات
  electricRange?: number;     // المدى الكهربائي (كم)
  batteryCapacity?: number;   // سعة البطارية (كيلووات ساعة)
  
  // الحالة والاستخدام
  condition: CarCondition;
  mileage: number;            // كيلومتر
  firstRegistration?: Date;
  owners?: number;            // عدد المالكين
  
  // السعر
  price: number;
  currency: string;
  vat?: boolean;              // شامل الضريبة
  negotiable?: boolean;       // قابل للتفاوض
  
  // الألوان والتجهيزات
  exteriorColor: string;
  exteriorColorAr?: string;
  interiorColor: string;
  interiorColorAr?: string;
  metallic?: boolean;
  
  // المقاعد والأبواب
  doors: number;
  seats: number;
  
  // المميزات
  features?: CarFeature[];
  
  // الصور
  images: string[];
  thumbnailImage?: string;
  
  // الموقع
  location: {
    city: string;
    cityAr?: string;
    state?: string;
    country: string;
    zipCode?: string;
    coordinates?: {
      lat: number;
      lng: number;
    };
  };
  
  // البائع
  seller: {
    type: 'dealer' | 'private';
    name: string;
    rating?: number;
    verified?: boolean;
    phone?: string;
    email?: string;
  };
  
  // بيانات إضافية
  vin?: string;               // رقم الشاصي
  description?: string;
  descriptionAr?: string;
  warrantyMonths?: number;    // الضمان بالأشهر
  serviceHistory?: boolean;   // سجل الصيانة
  accidentFree?: boolean;     // خالية من الحوادث
  
  // بيانات النظام
  createdAt: Date;
  updatedAt: Date;
  views?: number;
  saved?: number;
}

/**
 * المميزات الممكنة
 * Possible Car Features
 */
export type CarFeature =
  // الأمان
  | 'abs'                     // نظام مانع انغلاق المكابح
  | 'airbags'                 // وسائد هوائية
  | 'esp'                     // نظام الثبات الإلكتروني
  | 'parking-sensors'         // حساسات الركن
  | 'parking-camera'          // كاميرا الركن
  | '360-camera'              // كاميرا 360 درجة
  | 'blind-spot-monitor'      // مراقبة النقطة العمياء
  | 'lane-assist'             // مساعد الحفاظ على المسار
  | 'adaptive-cruise'         // تثبيت السرعة التكيفي
  | 'collision-warning'       // تحذير الاصطدام
  | 'emergency-brake'         // فرملة طوارئ تلقائية
  
  // الراحة
  | 'climate-control'         // تحكم مناخي
  | 'dual-zone-climate'       // مناخ ثنائي المنطقة
  | 'heated-seats'            // مقاعد مدفأة
  | 'ventilated-seats'        // مقاعد مهواة
  | 'electric-seats'          // مقاعد كهربائية
  | 'memory-seats'            // مقاعد بذاكرة
  | 'leather-seats'           // مقاعد جلد
  | 'panoramic-roof'          // سقف بانورامي
  | 'sunroof'                 // فتحة سقف
  | 'keyless-entry'           // دخول بدون مفتاح
  | 'start-stop'              // بدء/إيقاف تلقائي
  | 'ambient-lighting'        // إضاءة محيطية
  
  // الترفيه والتقنية
  | 'navigation'              // نظام ملاحة
  | 'touchscreen'             // شاشة لمس
  | 'apple-carplay'           // أبل كاربلاي
  | 'android-auto'            // أندرويد أوتو
  | 'bluetooth'               // بلوتوث
  | 'usb'                     // يو إس بي
  | 'wireless-charging'       // شحن لاسلكي
  | 'premium-sound'           // نظام صوت متميز
  | 'head-up-display'         // عرض على الزجاج الأمامي
  | 'digital-cockpit'         // قمرة قيادة رقمية
  
  // الإضاءة
  | 'led-headlights'          // مصابيح LED أمامية
  | 'matrix-led'              // LED ماتريكس
  | 'laser-lights'            // مصابيح ليزر
  | 'fog-lights'              // مصابيح ضباب
  
  // الأداء
  | 'sport-mode'              // وضع رياضي
  | 'air-suspension'          // تعليق هوائي
  | 'adaptive-suspension'     // تعليق تكيفي
  | 'awd'                     // دفع رباعي
  | '4wd'                     // دفع رباعي
  
  // أخرى
  | 'tow-hitch'               // خطاف جر
  | 'roof-rails'              // قضبان سقف
  | 'spare-wheel';            // عجلة احتياطية

/**
 * الدول المتاحة
 * Available Countries
 */
export const COUNTRIES = {
  GERMANY: { code: 'DE', name: 'Germany', nameAr: 'ألمانيا' },
  AUSTRIA: { code: 'AT', name: 'Austria', nameAr: 'النمسا' },
  SWITZERLAND: { code: 'CH', name: 'Switzerland', nameAr: 'سويسرا' },
  FRANCE: { code: 'FR', name: 'France', nameAr: 'فرنسا' },
  ITALY: { code: 'IT', name: 'Italy', nameAr: 'إيطاليا' },
  SPAIN: { code: 'ES', name: 'Spain', nameAr: 'إسبانيا' },
  NETHERLANDS: { code: 'NL', name: 'Netherlands', nameAr: 'هولندا' },
  BELGIUM: { code: 'BE', name: 'Belgium', nameAr: 'بلجيكا' },
  POLAND: { code: 'PL', name: 'Poland', nameAr: 'بولندا' },
  CZECH_REPUBLIC: { code: 'CZ', name: 'Czech Republic', nameAr: 'التشيك' },
  SWEDEN: { code: 'SE', name: 'Sweden', nameAr: 'السويد' },
  JAPAN: { code: 'JP', name: 'Japan', nameAr: 'اليابان' },
} as const;

/**
 * الألوان الشائعة
 * Common Colors
 */
export const COLORS = {
  BLACK: { name: 'Black', nameAr: 'أسود', hex: '#000000' },
  WHITE: { name: 'White', nameAr: 'أبيض', hex: '#FFFFFF' },
  SILVER: { name: 'Silver', nameAr: 'فضي', hex: '#C0C0C0' },
  GREY: { name: 'Grey', nameAr: 'رمادي', hex: '#808080' },
  RED: { name: 'Red', nameAr: 'أحمر', hex: '#FF0000' },
  BLUE: { name: 'Blue', nameAr: 'أزرق', hex: '#0000FF' },
  GREEN: { name: 'Green', nameAr: 'أخضر', hex: '#008000' },
  YELLOW: { name: 'Yellow', nameAr: 'أصفر', hex: '#FFFF00' },
  ORANGE: { name: 'Orange', nameAr: 'برتقالي', hex: '#FFA500' },
  BROWN: { name: 'Brown', nameAr: 'بني', hex: '#A52A2A' },
  BEIGE: { name: 'Beige', nameAr: 'بيج', hex: '#F5F5DC' },
  GOLD: { name: 'Gold', nameAr: 'ذهبي', hex: '#FFD700' },
} as const;

/**
 * مساعد الفلاتر - دوال مساعدة للبحث
 * Filter Helpers
 */
export class CarFilterHelper {
  /**
   * فلترة السيارات حسب المعايير
   */
  static filterCars(
    listings: CarListing[],
    filters: CarSearchFilters
  ): CarListing[] {
    return listings.filter(car => {
      // فلتر العلامة التجارية
      if (filters.brand && filters.brand.length > 0) {
        if (!filters.brand.includes(car.brand)) return false;
      }
      
      // فلتر نوع الهيكل
      if (filters.bodyType && filters.bodyType.length > 0) {
        if (!filters.bodyType.includes(car.bodyType)) return false;
      }
      
      // فلتر نوع الوقود
      if (filters.fuelType && filters.fuelType.length > 0) {
        if (!filters.fuelType.includes(car.fuelType)) return false;
      }
      
      // فلتر السعر
      if (filters.priceMin && car.price < filters.priceMin) return false;
      if (filters.priceMax && car.price > filters.priceMax) return false;
      
      // فلتر السنة
      if (filters.yearMin && car.year < filters.yearMin) return false;
      if (filters.yearMax && car.year > filters.yearMax) return false;
      
      // فلتر المسافة
      if (filters.mileageMin && car.mileage < filters.mileageMin) return false;
      if (filters.mileageMax && car.mileage > filters.mileageMax) return false;
      
      return true;
    });
  }
  
  /**
   * ترتيب النتائج
   */
  static sortCars(
    listings: CarListing[],
    sortBy: 'price-asc' | 'price-desc' | 'year-asc' | 'year-desc' | 'mileage-asc' | 'mileage-desc'
  ): CarListing[] {
    const sorted = [...listings];
    
    switch (sortBy) {
      case 'price-asc':
        return sorted.sort((a, b) => a.price - b.price);
      case 'price-desc':
        return sorted.sort((a, b) => b.price - a.price);
      case 'year-asc':
        return sorted.sort((a, b) => a.year - b.year);
      case 'year-desc':
        return sorted.sort((a, b) => b.year - a.year);
      case 'mileage-asc':
        return sorted.sort((a, b) => a.mileage - b.mileage);
      case 'mileage-desc':
        return sorted.sort((a, b) => b.mileage - a.mileage);
      default:
        return sorted;
    }
  }
}

export default CarFilterHelper;
