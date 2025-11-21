// src/utils/validation.ts
// Validation Utilities - أدوات التحقق من الصحة
// الموقع: بلغاريا | اللغات: BG/EN | العملة: EUR

// ==================== VALIDATION FUNCTIONS ====================

/**
 * Validate Bulgarian phone number (+359 format)
 */
export const validateBulgarianPhone = (phone: string): { valid: boolean; message?: string } => {
  if (!phone || !phone.trim()) {
    return { valid: true }; // Optional field
  }

  const cleanPhone = phone.replace(/\s/g, '');
  
  if (!cleanPhone.startsWith('+359')) {
    return {
      valid: false,
      message: 'Phone must start with +359 / Телефонът трябва да започва с +359'
    };
  }

  if (cleanPhone.length !== 13) { // +359 + 9 digits
    return {
      valid: false,
      message: 'Invalid phone format / Невалиден формат на телефон'
    };
  }

  return { valid: true };
};

/**
 * Validate email format
 */
export const validateEmail = (email: string): { valid: boolean; message?: string } => {
  if (!email || !email.trim()) {
    return { valid: false, message: 'Email is required / Имейлът е задължителен' };
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  
  if (!emailRegex.test(email)) {
    return {
      valid: false,
      message: 'Invalid email format / Невалиден формат на имейл'
    };
  }

  return { valid: true };
};

/**
 * Validate BULSTAT number (9-13 digits)
 */
export const validateBULSTAT = (bulstat: string): { valid: boolean; message?: string } => {
  if (!bulstat || !bulstat.trim()) {
    return { valid: true }; // Optional field
  }

  const cleanBulstat = bulstat.replace(/\s/g, '');
  
  if (!/^\d{9,13}$/.test(cleanBulstat)) {
    return {
      valid: false,
      message: 'BULSTAT must be 9-13 digits / БУЛСТАТ трябва да бъде 9-13 цифри'
    };
  }

  return { valid: true };
};

/**
 * Validate VAT number (BG + 9 digits)
 */
export const validateVAT = (vat: string): { valid: boolean; message?: string } => {
  if (!vat || !vat.trim()) {
    return { valid: true }; // Optional field
  }

  const vatRegex = /^BG\d{9,10}$/;
  
  if (!vatRegex.test(vat.replace(/\s/g, ''))) {
    return {
      valid: false,
      message: 'VAT must be BG + 9-10 digits / ДДС номер: BG + 9-10 цифри'
    };
  }

  return { valid: true };
};

/**
 * Validate website URL
 */
export const validateWebsite = (url: string): { valid: boolean; message?: string } => {
  if (!url || !url.trim()) {
    return { valid: true }; // Optional field
  }

  try {
    const urlObj = new URL(url);
    if (!urlObj.protocol.startsWith('http')) {
      return {
        valid: false,
        message: 'URL must start with http:// or https://'
      };
    }
    return { valid: true };
  } catch {
  return {
      valid: false,
      message: 'Invalid URL format / Невалиден URL формат'
    };
  }
};

/**
 * Validate Bulgarian postal code (4 digits)
 */
export const validatePostalCode = (code: string): { valid: boolean; message?: string } => {
  if (!code || !code.trim()) {
    return { valid: true }; // Optional field
  }

  if (!/^\d{4}$/.test(code)) {
    return {
      valid: false,
      message: 'Postal code must be 4 digits / Пощенският код трябва да е 4 цифри'
    };
  }

  return { valid: true };
};

/**
 * Validate date of birth (must be 18+)
 */
export const validateDateOfBirth = (dateStr: string): { valid: boolean; message?: string } => {
  if (!dateStr || !dateStr.trim()) {
    return { valid: true }; // Optional field
  }

  // Parse DD.MM.YYYY or DD/MM/YYYY format
  const parts = dateStr.split(/[./-]/);
  if (parts.length !== 3) {
    return {
      valid: false,
      message: 'Use format DD.MM.YYYY / Използвайте формат ДД.ММ.ГГГГ'
    };
  }

  const day = parseInt(parts[0]);
  const month = parseInt(parts[1]) - 1;
  const year = parseInt(parts[2]);

  const birthDate = new Date(year, month, day);
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }

  if (age < 18) {
    return {
      valid: false,
      message: 'You must be 18+ / Трябва да сте 18+'
    };
  }

  if (year < 1900 || year > today.getFullYear()) {
    return {
      valid: false,
      message: 'Invalid year / Невалидна година'
    };
  }

  return { valid: true };
};

/**
 * Validate business name (minimum 2 characters)
 */
export const validateBusinessName = (name: string): { valid: boolean; message?: string } => {
  if (!name || !name.trim()) {
    return {
      valid: false,
      message: 'Business name is required / Името на фирмата е задължително'
    };
  }

  if (name.trim().length < 2) {
    return {
      valid: false,
      message: 'Business name too short / Името на фирмата е твърде кратко'
    };
  }

  return { valid: true };
};

/**
 * Validate name (minimum 2 characters, only letters)
 */
export const validateName = (name: string, fieldName: string): { valid: boolean; message?: string } => {
  if (!name || !name.trim()) {
    return {
      valid: false,
      message: `${fieldName} is required / ${fieldName} е задължително`
    };
  }

  if (name.trim().length < 2) {
    return {
      valid: false,
      message: `${fieldName} too short / ${fieldName} е твърде кратко`
    };
  }

  // Allow Cyrillic and Latin letters, spaces, hyphens
  if (!/^[А-Яа-яA-Za-z\s-]+$/.test(name)) {
    return {
      valid: false,
      message: `${fieldName} must contain only letters / ${fieldName} само букви`
    };
  }

  return { valid: true };
};

/**
 * Validate all profile data
 */
export interface ValidationResult {
  valid: boolean;
  errors: { [key: string]: string };
}

export const validateProfileData = (
  formData: any,
  accountType: 'individual' | 'business'
): ValidationResult => {
  const errors: { [key: string]: string } = {};

  // Common validations
  if (formData.phoneNumber) {
    const phoneValidation = validateBulgarianPhone(formData.phoneNumber);
    if (!phoneValidation.valid) {
      errors.phoneNumber = phoneValidation.message!;
    }
  }

  if (formData.postalCode) {
    const postalValidation = validatePostalCode(formData.postalCode);
    if (!postalValidation.valid) {
      errors.postalCode = postalValidation.message!;
    }
  }

  if (formData.dateOfBirth) {
    const dobValidation = validateDateOfBirth(formData.dateOfBirth);
    if (!dobValidation.valid) {
      errors.dateOfBirth = dobValidation.message!;
    }
  }

  // Individual account validations
  if (accountType === 'individual') {
    const firstNameValidation = validateName(formData.firstName, 'First Name / Име');
    if (!firstNameValidation.valid) {
      errors.firstName = firstNameValidation.message!;
    }

    const lastNameValidation = validateName(formData.lastName, 'Last Name / Фамилия');
    if (!lastNameValidation.valid) {
      errors.lastName = lastNameValidation.message!;
    }
  }

  // Business account validations
  if (accountType === 'business') {
    const businessNameValidation = validateBusinessName(formData.businessName);
    if (!businessNameValidation.valid) {
      errors.businessName = businessNameValidation.message!;
    }

    if (formData.bulstat) {
      const bulstatValidation = validateBULSTAT(formData.bulstat);
      if (!bulstatValidation.valid) {
        errors.bulstat = bulstatValidation.message!;
      }
    }

    if (formData.vatNumber) {
      const vatValidation = validateVAT(formData.vatNumber);
      if (!vatValidation.valid) {
        errors.vatNumber = vatValidation.message!;
      }
    }

    if (formData.website) {
      const websiteValidation = validateWebsite(formData.website);
      if (!websiteValidation.valid) {
        errors.website = websiteValidation.message!;
      }
    }

    if (formData.businessPhone) {
      const phoneValidation = validateBulgarianPhone(formData.businessPhone);
      if (!phoneValidation.valid) {
        errors.businessPhone = phoneValidation.message!;
      }
    }

    if (formData.businessPostalCode) {
      const postalValidation = validatePostalCode(formData.businessPostalCode);
      if (!postalValidation.valid) {
        errors.businessPostalCode = postalValidation.message!;
      }
    }
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors
  };
};
