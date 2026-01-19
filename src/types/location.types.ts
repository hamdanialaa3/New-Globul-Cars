/**
 * Location Data Types
 * 
 * 🍎 مثل: صندوق التفاح بـ label يقول:
 *    "ده من القاهرة، منطقة الجيزة، وفيها 5 تفاح"
 * 
 * كل فاكهة (data) محتاجة تعرّف: من فين، أي منطقة، إحداثيات
 */

export interface LocationData {
  /** اسم المدينة: القاهرة، الإسكندرية، الجيزة */
  cityName?: string;
  
  /** اسم المنطقة: عباسية، مصر الجديدة، طنطا */
  regionName?: string;
  
  /** اسم المحافظة أو الإقليم */
  district?: string;
  
  /** الدولة - دائمًا "Bulgaria" في حالتنا */
  country?: string;
  
  /** خط العرض (latitude) */
  latitude?: number;
  
  /** خط الطول (longitude) */
  longitude?: number;
  
  /** رمز البريد postal code */
  postalCode?: string;
  
  /** العنوان الكامل */
  address?: string;

  /** معرّف المنطقة في النظام */
  areaId?: string;
}

/**
 * في الخريطة: صندوق البيانات اللي يظهر عند الضغط
 */
export interface TooltipLocationData extends LocationData {
  /** معرّف المنطقة في Google Maps */
  mapId?: string;
  
  /** عدد المنتجات في المنطقة */
  itemCount?: number;
  
  /** المسافة من النقطة الحالية */
  distance?: number;
}

/**
 * في البحث والفلترة: اختيار المناطق
 */
export interface SearchLocationFilters {
  /** تصفية بـ city */
  cities?: string[];
  
  /** تصفية بـ region */
  regions?: string[];
  
  /** تصفية بـ district */
  districts?: string[];
  
  /** تصفية جغرافية (دائرة حول نقطة) */
  geographicRadius?: {
    centerLat: number;
    centerLng: number;
    radiusKm: number;
  };
}

/**
 * في إدارة المستخدمين: تفضيلات المكان
 */
export interface UserLocationPreferences extends LocationData {
  /** المكان المفضل للعرض/البيع */
  isPrimary?: boolean;
  
  /** متى تم تحديثه */
  updatedAt?: Date;
  
  /** هل المستخدم نشيط في هذه المنطقة */
  isActive?: boolean;
}

/**
 * في العروض والطلبات: موقع التسليم
 */
export interface DeliveryLocation extends LocationData {
  /** ملاحظات بخصوص الموقع */
  notes?: string;
  
  /** اسم الشخص المستقبل */
  recipientName?: string;
  
  /** رقم الهاتف */
  phoneNumber?: string;
  
  /** نطاق التسليم المتاح (بالدقائق) */
  deliveryTimeMinutes?: number;
}

/**
 * نوع موحد لكل مكان في النظام
 */
export type AnyLocationData = 
  | LocationData 
  | TooltipLocationData 
  | SearchLocationFilters 
  | UserLocationPreferences 
  | DeliveryLocation;
