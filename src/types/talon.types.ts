// src/types/talon.types.ts
// Bulgarian Registration Card (Talon) Types
// أنواع بطاقة التسجيل البلغارية

export interface TalonData {
  /** VIN Number - Field (E) */
  vin: string;
  
  /** Registration Number - Field (A) */
  regNumber: string;
  
  /** First Registration Date - Field (B) */
  firstRegDate: string;
  
  /** Power in KW - Field (P.2) */
  powerKw: number;
  
  /** Engine Code - Field (P.5) */
  engineCode: string;
  
  /** Mass - Field (G) */
  mass: number;
  
  /** Make/Brand */
  make?: string;
  
  /** Model */
  model?: string;
  
  /** Year */
  year?: number;
  
  /** Fuel Type */
  fuelType?: string;
  
  /** Color */
  color?: string;
}

export interface OCRScanResult {
  /** البيانات المستخرجة */
  data: TalonData;
  
  /** مستوى الثقة في الاستخراج (0-100) */
  confidence: number;
  
  /** النص الخام المستخرج */
  rawText: string;
  
  /** الحقول التي تم العثور عليها */
  fieldsFound: string[];
  
  /** الأخطاء إن وجدت */
  errors?: string[];
}

