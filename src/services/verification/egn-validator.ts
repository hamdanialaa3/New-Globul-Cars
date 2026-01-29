// EGN Validator Service - Bulgarian Personal Number Validation
// Location: Bulgaria | Languages: BG/EN | Currency: EUR

/**
 * EGN (ЕГН) = Единен граждански номер = Unified Civil Number
 * 
 * Format: YYMMDDXXXC (10 digits)
 * - YY: Year of birth (last 2 digits)
 * - MM: Month of birth (with encoding for sex and century)
 * - DD: Day of birth (01-31)
 * - XXX: Regional code + serial number
 * - C: Check digit
 * 
 * Month Encoding:
 * - 01-12: Male, born 1900-1999
 * - 21-32: Female, born 1900-1999
 * - 41-52: Male, born 1800-1899
 * - 61-72: Female, born 1800-1899
 * - (No prefix for 2000+, but 21-32 for female still applies)
 */

export interface EGNData {
  valid: boolean;
  birthDate?: Date;
  sex?: 'M' | 'F';
  age?: number;
  region?: string;
  errors?: string[];
}

export class EGNValidator {
  
  /**
   * Validate EGN check digit
   */
  static validateEGN(egn: string): boolean {
    // Check format
    if (!egn || egn.length !== 10) return false;
    if (!/^\d{10}$/.test(egn)) return false;
    
    // Extract components
    let year = parseInt(egn.substr(0, 2));
    let month = parseInt(egn.substr(2, 2));
    const day = parseInt(egn.substr(4, 2));
    
    // Determine actual month and validate
    let actualMonth = month;
    if (month > 40) {
      actualMonth = month - 40;  // 1800s
    } else if (month > 20) {
      actualMonth = month - 20;  // Female or 2000s
    }
    
    // Validate date components
    if (actualMonth < 1 || actualMonth > 12) return false;
    if (day < 1 || day > 31) return false;
    
    // Calculate check digit
    const weights = [2, 4, 8, 5, 10, 9, 7, 3, 6];
    let sum = 0;
    
    for (let i = 0; i < 9; i++) {
      sum += parseInt(egn[i]) * weights[i];
    }
    
    const remainder = sum % 11;
    const expectedCheckDigit = remainder === 10 ? 0 : remainder;
    const actualCheckDigit = parseInt(egn[9]);
    
    return actualCheckDigit === expectedCheckDigit;
  }
  
  /**
   * Extract sex from EGN
   */
  static getSexFromEGN(egn: string): 'M' | 'F' | null {
    if (!egn || egn.length !== 10) return null;
    
    const month = parseInt(egn.substr(2, 2));
    
    // Month 21-32 or 61-72 = Female
    // Month 01-12 or 41-52 = Male
    if ((month > 20 && month <= 32) || (month > 60 && month <= 72)) {
      return 'F';
    } else if ((month >= 1 && month <= 12) || (month > 40 && month <= 52)) {
      return 'M';
    }
    
    return null;
  }
  
  /**
   * Extract birth date from EGN
   */
  static getBirthDateFromEGN(egn: string): Date | null {
    if (!egn || egn.length !== 10) return null;
    
    let year = parseInt(egn.substr(0, 2));
    let month = parseInt(egn.substr(2, 2));
    const day = parseInt(egn.substr(4, 2));
    
    // Determine century from month
    if (month > 60) {
      // 2000s female
      year += 2000;
      month -= 60;
    } else if (month > 40) {
      // 1800s male
      year += 1800;
      month -= 40;
    } else if (month > 20) {
      // Either 1900s female or 2000s female
      // Use current year to determine
      const currentYear = new Date().getFullYear();
      const century1900 = 1900 + year;
      const century2000 = 2000 + year;
      
      // If 2000s year would be in the future, use 1900s
      year = century2000 > currentYear ? century1900 : century2000;
      month -= 20;
    } else {
      // 1900s male
      year += 1900;
    }
    
    // Validate date
    try {
      const date = new Date(year, month - 1, day);
      if (isNaN(date.getTime())) return null;
      
      // Check if date components match
      if (date.getFullYear() !== year || 
          date.getMonth() !== month - 1 || 
          date.getDate() !== day) {
        return null;
      }
      
      return date;
    } catch {
      return null;
    }
  }
  
  /**
   * Calculate age from EGN
   */
  static getAgeFromEGN(egn: string): number | null {
    const birthDate = this.getBirthDateFromEGN(egn);
    if (!birthDate) return null;
    
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    
    return age;
  }
  
  /**
   * Get region code from EGN (positions 7-9)
   */
  static getRegionFromEGN(egn: string): string | null {
    if (!egn || egn.length !== 10) return null;
    
    const regionCode = parseInt(egn.substr(6, 3));
    
    // Rough region mapping (simplified)
    if (regionCode >= 0 && regionCode <= 43) return 'Благоевград';
    if (regionCode >= 44 && regionCode <= 93) return 'Бургас';
    if (regionCode >= 94 && regionCode <= 139) return 'Варна';
    if (regionCode >= 140 && regionCode <= 169) return 'Велико Търново';
    if (regionCode >= 170 && regionCode <= 183) return 'Видин';
    if (regionCode >= 184 && regionCode <= 217) return 'Враца';
    if (regionCode >= 218 && regionCode <= 233) return 'Габрово';
    if (regionCode >= 234 && regionCode <= 281) return 'Кърджали';
    if (regionCode >= 282 && regionCode <= 301) return 'Кюстендил';
    if (regionCode >= 302 && regionCode <= 319) return 'Ловеч';
    if (regionCode >= 320 && regionCode <= 341) return 'Монтана';
    if (regionCode >= 342 && regionCode <= 377) return 'Пазарджик';
    if (regionCode >= 378 && regionCode <= 395) return 'Перник';
    if (regionCode >= 396 && regionCode <= 435) return 'Плевен';
    if (regionCode >= 436 && regionCode <= 501) return 'Пловдив';
    if (regionCode >= 502 && regionCode <= 527) return 'Разград';
    if (regionCode >= 528 && regionCode <= 555) return 'Русе';
    if (regionCode >= 556 && regionCode <= 575) return 'Силистра';
    if (regionCode >= 576 && regionCode <= 601) return 'Сливен';
    if (regionCode >= 602 && regionCode <= 623) return 'Смолян';
    if (regionCode >= 624 && regionCode <= 721) return 'София (област)';
    if (regionCode >= 722 && regionCode <= 751) return 'София (град)';
    if (regionCode >= 752 && regionCode <= 789) return 'Стара Загора';
    if (regionCode >= 790 && regionCode <= 821) return 'Търговище';
    if (regionCode >= 822 && regionCode <= 843) return 'Хасково';
    if (regionCode >= 844 && regionCode <= 871) return 'Шумен';
    if (regionCode >= 872 && regionCode <= 903) return 'Ямбол';
    
    return 'Unknown';
  }
  
  /**
   * Complete EGN analysis with all extracted data
   */
  static analyzeEGN(egn: string): EGNData {
    const errors: string[] = [];
    
    // Validate format
    if (!egn) {
      return { valid: false, errors: ['EGN is required'] };
    }
    
    if (egn.length !== 10) {
      return { valid: false, errors: ['EGN must be exactly 10 digits'] };
    }
    
    if (!/^\d{10}$/.test(egn)) {
      return { valid: false, errors: ['EGN must contain only digits'] };
    }
    
    // Validate check digit
    if (!this.validateEGN(egn)) {
      return { valid: false, errors: ['Invalid EGN check digit'] };
    }
    
    // Extract data
    const birthDate = this.getBirthDateFromEGN(egn);
    const sex = this.getSexFromEGN(egn);
    const age = this.getAgeFromEGN(egn);
    const region = this.getRegionFromEGN(egn);
    
    if (!birthDate) {
      errors.push('Could not extract valid birth date from EGN');
    }
    
    if (!sex) {
      errors.push('Could not determine sex from EGN');
    }
    
    if (errors.length > 0) {
      return { valid: false, errors };
    }
    
    return {
      valid: true,
      birthDate: birthDate!,
      sex: sex!,
      age: age!,
      region: region!
    };
  }
  
  /**
   * Format Bulgarian date (DD.MM.YYYY)
   */
  static formatBulgarianDate(date: Date): string {
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}.${month}.${year}`;
  }
  
  /**
   * Parse Bulgarian date (DD.MM.YYYY)
   */
  static parseBulgarianDate(dateStr: string): Date | null {
    if (!dateStr) return null;
    
    const parts = dateStr.split('.');
    if (parts.length !== 3) return null;
    
    const day = parseInt(parts[0]);
    const month = parseInt(parts[1]);
    const year = parseInt(parts[2]);
    
    if (isNaN(day) || isNaN(month) || isNaN(year)) return null;
    if (day < 1 || day > 31) return null;
    if (month < 1 || month > 12) return null;
    if (year < 1900 || year > 2100) return null;
    
    return new Date(year, month - 1, day);
  }
}

export default EGNValidator;

