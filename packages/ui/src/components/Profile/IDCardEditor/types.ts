// ID Card Editor Types
// Location: Bulgaria | Languages: BG/EN | Currency: EUR

export interface IDCardData {
  // Document Information
  documentNumber: string;
  personalNumber: string;  // EGN
  
  // Personal Information (Cyrillic)
  firstNameBG: string;
  middleNameBG: string;
  lastNameBG: string;
  
  // Personal Information (Latin)
  firstNameEN: string;
  middleNameEN: string;
  lastNameEN: string;
  
  // Personal Details
  nationality: string;
  dateOfBirth: string;  // DD.MM.YYYY
  sex: 'M' | 'F' | '';
  height: number | '';
  
  // Document Validity
  issueDate: string;     // DD.MM.YYYY
  expiryDate: string;    // DD.MM.YYYY
  issuingAuthority: string;
  
  // Additional Information (Back)
  placeOfBirth: string;
  addressOblast: string;
  addressMunicipality: string;
  addressStreet: string;
  eyeColor: 'BROWN' | 'BLUE' | 'GREEN' | 'GREY' | '';
  
  // Biometric
  photo?: string;        // Base64 or URL
  signature?: string;    // Base64 or URL
}

export interface FieldDefinition {
  id: keyof IDCardData;
  label: string;
  labelEN: string;
  example: string;
  position: {
    x: number;      // pixels from left
    y: number;      // pixels from top
    width: number;  // pixels
    height: number; // pixels
  };
  inputType: 'text' | 'number' | 'select' | 'date-bulgarian' | 'image-upload' | 'signature-pad';
  required?: boolean;
  maxLength?: number;
  pattern?: RegExp;
  options?: { value: string; label: string }[];
  autoFillFrom?: string;
  validate?: string;
  min?: number;
  max?: number;
  suffix?: string;
  readOnly?: boolean;
}

export interface ValidationResult {
  valid: boolean;
  errors: string[];
  warnings?: string[];
}

