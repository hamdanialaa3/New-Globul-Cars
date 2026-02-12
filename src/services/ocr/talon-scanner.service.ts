// src/services/ocr/talon-scanner.service.ts
// Talon Scanner Service - خدمة مسح بطاقة التسجيل البلغارية
// الهدف: استخراج بيانات السيارة من بطاقة التسجيل (Талон) باستخدام OCR
// الموقع: بلغاريا

import { getFunctions, httpsCallable } from 'firebase/functions';
import { serviceLogger } from '../logger-service';
import { TalonData, OCRScanResult } from '../../types/talon.types';

// ==================== SERVICE CLASS ====================

/**
 * Talon Scanner Service
 * خدمة مسح وتحليل بطاقة التسجيل البلغارية
 */
export class TalonScannerService {
  private static instance: TalonScannerService;

  private constructor() {}

  public static getInstance(): TalonScannerService {
    if (!TalonScannerService.instance) {
      TalonScannerService.instance = new TalonScannerService();
    }
    return TalonScannerService.instance;
  }

  // ==================== PUBLIC METHODS ====================

  /**
   * Scan Bulgarian Registration Card (Talon)
   * مسح بطاقة التسجيل البلغارية
   */
  async scanRegistrationCard(imageFile: File): Promise<OCRScanResult> {
    try {
      // 1. Upload image to Cloud Storage (via Cloud Function)
      const functions = getFunctions();
      const analyzeTalonImage = httpsCallable(functions, 'analyzeTalonImage');
      
      // Convert File to Base64 or upload to Storage first
      const base64Image = await this.fileToBase64(imageFile);
      
      // 2. Call Cloud Function for OCR analysis
      const result = await analyzeTalonImage({
        image: base64Image,
        imageType: imageFile.type
      }) as { data: { text: string; confidence: number } };
      
      // 3. Parse the extracted text for Bulgarian Talon fields
      const parsedData = this.parseTalonText(result.data.text);
      
      // 4. Calculate confidence
      const confidence = this.calculateConfidence(parsedData, result.data.confidence);
      
      // 5. Identify fields found
      const fieldsFound = this.getFieldsFound(parsedData);
      
      return {
        data: parsedData,
        confidence,
        rawText: result.data.text,
        fieldsFound
      };
    } catch (error) {
      serviceLogger.error('Error scanning registration card', error as Error);
      
      // Fallback: Return empty data with error
      return {
        data: this.getEmptyTalonData(),
        confidence: 0,
        rawText: '',
        fieldsFound: [],
        errors: [error instanceof Error ? (error as Error).message : 'Unknown error']
      };
    }
  }

  /**
   * Parse Talon text to extract structured data
   * تحليل نص التالون لاستخراج البيانات المنظمة
   */
  parseTalonText(text: string): TalonData {
    const data: TalonData = this.getEmptyTalonData();
    
    // Extract VIN (Field E) - Usually 17 characters
    const vinMatch = text.match(/\b([A-HJ-NPR-Z0-9]{17})\b/);
    if (vinMatch) {
      data.vin = vinMatch[1];
    }
    
    // Extract Registration Number (Field A) - Format: XX XXXX XX or similar
    const regNumberMatch = text.match(/\b([A-Z]{1,2}\s?\d{4}[A-Z]{0,2})\b/);
    if (regNumberMatch) {
      data.regNumber = regNumberMatch[1].replace(/\s+/g, '');
    }
    
    // Extract First Registration Date (Field B) - Format: DD.MM.YYYY
    const dateMatch = text.match(/\b(\d{2}\.\d{2}\.\d{4})\b/);
    if (dateMatch) {
      data.firstRegDate = dateMatch[1];
      // Try to extract year
      const yearMatch = dateMatch[1].match(/\d{4}/);
      if (yearMatch) {
        data.year = parseInt(yearMatch[0], 10);
      }
    }
    
    // Extract Power (Field P.2) - Usually in KW
    const powerMatch = text.match(/(?:P\.2|мощност|power)[:\s]*(\d+)\s*(?:кW|kW|KW)/i);
    if (powerMatch) {
      data.powerKw = parseInt(powerMatch[1], 10);
    } else {
      // Alternative pattern
      const powerAltMatch = text.match(/(\d+)\s*(?:кW|kW|KW)/i);
      if (powerAltMatch) {
        data.powerKw = parseInt(powerAltMatch[1], 10);
      }
    }
    
    // Extract Engine Code (Field P.5) - Usually alphanumeric
    const engineCodeMatch = text.match(/(?:P\.5|двигател|engine)[:\s]*([A-Z0-9]{6,12})/i);
    if (engineCodeMatch) {
      data.engineCode = engineCodeMatch[1];
    }
    
    // Extract Mass (Field G) - Usually in kg
    const massMatch = text.match(/(?:G|маса|mass)[:\s]*(\d+)\s*(?:кг|kg|KG)/i);
    if (massMatch) {
      data.mass = parseInt(massMatch[1], 10);
    }
    
    // Try to extract Make and Model from common patterns
    const makeModelMatch = text.match(/\b([A-Z]{2,15})\s+([A-Z0-9]{2,15})\b/);
    if (makeModelMatch) {
      // This is a simple heuristic - can be improved
      const commonMakes = ['BMW', 'AUDI', 'MERCEDES', 'VW', 'VOLKSWAGEN', 'OPEL', 'FORD', 'TOYOTA', 'RENAULT'];
      const firstWord = makeModelMatch[1];
      if (commonMakes.includes(firstWord)) {
        data.make = firstWord;
        data.model = makeModelMatch[2];
      }
    }
    
    return data;
  }

  /**
   * Validate extracted Talon data
   * التحقق من صحة البيانات المستخرجة
   */
  validateTalonData(data: TalonData): { valid: boolean; errors: string[] } {
    const errors: string[] = [];
    
    if (!data.vin || data.vin.length !== 17) {
      errors.push('Invalid or missing VIN number');
    }
    
    if (!data.regNumber || data.regNumber.length < 6) {
      errors.push('Invalid or missing registration number');
    }
    
    if (!data.firstRegDate) {
      errors.push('Missing first registration date');
    }
    
    if (!data.powerKw || data.powerKw < 30 || data.powerKw > 1000) {
      errors.push('Invalid power value');
    }
    
    return {
      valid: errors.length === 0,
      errors
    };
  }

  // ==================== PRIVATE METHODS ====================

  /**
   * Convert File to Base64
   */
  private fileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        // Remove data:image/...;base64, prefix
        const base64 = result.split(',')[1];
        resolve(base64);
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  /**
   * Get empty Talon data structure
   */
  private getEmptyTalonData(): TalonData {
    return {
      vin: '',
      regNumber: '',
      firstRegDate: '',
      powerKw: 0,
      engineCode: '',
      mass: 0
    };
  }

  /**
   * Calculate confidence score
   */
  private calculateConfidence(data: TalonData, ocrConfidence: number): number {
    let score = ocrConfidence * 0.5; // Base score from OCR
    
    // Add points for each field found
    if (data.vin) score += 15;
    if (data.regNumber) score += 10;
    if (data.firstRegDate) score += 10;
    if (data.powerKw > 0) score += 10;
    if (data.engineCode) score += 5;
    if (data.mass > 0) score += 5;
    if (data.make) score += 3;
    if (data.year) score += 2;
    
    return Math.min(100, Math.round(score));
  }

  /**
   * Get list of fields found
   */
  private getFieldsFound(data: TalonData): string[] {
    const fields: string[] = [];
    
    if (data.vin) fields.push('VIN');
    if (data.regNumber) fields.push('Registration Number');
    if (data.firstRegDate) fields.push('First Registration Date');
    if (data.powerKw > 0) fields.push('Power (kW)');
    if (data.engineCode) fields.push('Engine Code');
    if (data.mass > 0) fields.push('Mass');
    if (data.make) fields.push('Make');
    if (data.model) fields.push('Model');
    if (data.year) fields.push('Year');
    
    return fields;
  }
}

// Export singleton instance
export const talonScannerService = TalonScannerService.getInstance();

