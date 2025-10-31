# 🆔 BULGARIAN ID CARD - COMPLETE ANALYSIS
**تحليل شامل ودقيق لبطاقة الهوية البلغارية**

---

## 📋 **OVERVIEW - نظرة عامة**

```
Document Type: Bulgarian Identity Card (Лична карта)
Official Name: ЛИЧНА КАРТА / IDENTITY CARD
Country: Republic of Bulgaria (Република България)
Format: EU Standard Card (ID-1: 85.60 × 53.98 mm)
Material: Polycarbonate with security features
Chip: Yes (contactless RFID)
Validity: 10 years
Language: Bulgarian (Cyrillic) + English (Latin)
```

---

## 📄 **FRONT SIDE (ЛИЦЕ) - الوجه الأمامي**

### **Layout Structure:**

```
┌────────────────────────────────────────────────┐
│ РЕПУБЛИКА БЪЛГАРИЯ                             │
│ REPUBLIC OF BULGARIA                           │
│                                                │
│ ЛИЧНА КАРТА                                    │
│ IDENTITY CARD                                  │
│                                       [Photo]  │
│ Fields:                               ┌─────┐ │
│ - Document number                     │     │ │
│ - Personal ID number (EGN)            │     │ │
│ - Names (BG + Latin)                  │     │ │
│ - Nationality                         │     │ │
│ - Date of Birth                       │     │ │
│ - Sex                                 └─────┘ │
│ - Height                                       │
│ - Document validity                            │
│ - Issuing authority                            │
│                                                │
│ [Signature Strip]                              │
│                                                │
│ [Hologram]  [RFID Chip Symbol]                 │
└────────────────────────────────────────────────┘
```

### **Data Fields (Detailed):**

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
1. DOCUMENT NUMBER (Номер на документа)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Format: 9 digits
Example: 123456789
Location: Top left
Field Name BG: "Номер на документа"
Field Name EN: "Document number"

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
2. PERSONAL ID NUMBER - EGN (ЕГН)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Format: 10 digits (YYMMDD-XXX-C)
  YY: Year of birth (last 2 digits)
  MM: Month of birth (01-12, +20 for female, +40 for 1800s, +60 for 2000s)
  DD: Day of birth (01-31)
  XXX: Regional code + serial number
  C: Check digit
Example: 9001151234
Location: Below document number
Field Name BG: "Личен номер"
Field Name EN: "Personal number"

IMPORTANT:
  - Unique national identifier
  - Contains birthdate + sex + region
  - Used for all official documents
  - Primary key in all databases

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
3. NAMES (Имена)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
3a. Names in Cyrillic (Bulgarian)
    Format: Име Презиме Фамилия
    Example: ИВАН ПЕТРОВ СТОЯНОВ
    Field Name BG: "Име/Names"
    
3b. Names in Latin (English transliteration)
    Format: First Middle Last
    Example: IVAN PETROV STOYANOV
    Field Name EN: "Names"
    
Note: Both versions ALWAYS present
      Latin follows official transliteration rules

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
4. NATIONALITY (Гражданство)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Value BG: "Българско"
Value EN: "Bulgarian"
Field Name BG: "Гражданство/Nationality"
Location: Middle section

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
5. DATE OF BIRTH (Дата на раждане)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Format: DD.MM.YYYY
Example: 15.01.1990
Field Name BG: "Дата на раждане/Date of birth"
Note: Also encoded in EGN!

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
6. SEX (Пол)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Values BG: "М" (Male) or "Ж" (Female)
Values EN: "M" (Male) or "F" (Female)
Field Name BG: "Пол/Sex"
Note: Also encoded in EGN (month +20 for females)!

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
7. HEIGHT (Височина)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Format: XXX cm
Example: 175 cm
Field Name BG: "Височина/Height"

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
8. DOCUMENT VALIDITY (Валидност)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Format: DD.MM.YYYY
Example: 15.01.2030
Field Name BG: "Валидна до/Valid until"
Validity Period: Usually 10 years

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
9. ISSUING AUTHORITY (Издадена от)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Format: City/Region + МВР (Ministry of Interior)
Example: "София - МВР" or "Пловдив - МВР"
Field Name BG: "Издадена от/Issued by"
Full: Министерство на вътрешните работи (МВР)
EN: Ministry of Internal Affairs

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
10. PHOTO (Снимка)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Size: ~35mm × 45mm
Location: Top right corner
Background: Light blue/white
Requirements:
  - Front facing
  - Neutral expression
  - Clear face visibility
  - No glasses/hats

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
11. SIGNATURE (Подпис)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Location: Bottom section
Type: Handwritten signature of cardholder
Background: White strip
```

---

## 📄 **BACK SIDE (ГРБ) - الوجه الخلفي**

### **Layout Structure:**

```
┌────────────────────────────────────────────────┐
│                                                │
│ Additional Information:                        │
│                                                │
│ - Place of Birth (Място на раждане)            │
│ - Address (Адрес)                              │
│ - Eye Color (Цвят на очите)                    │
│                                                │
│ [Machine Readable Zone - MRZ]                  │
│ IDBGR<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<           │
│ 9001151234BGR9001151234M3001150<<<<<<<<        │
│                                                │
│ [Security Features]                            │
│ [Hologram] [Microtext] [UV Elements]           │
│                                                │
│ [Barcode / QR Code]                            │
│                                                │
└────────────────────────────────────────────────┘
```

### **Data Fields (Back):**

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
1. PLACE OF BIRTH (Място на раждане)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Format BG: Град/Село, Община
Format EN: City/Village, Municipality
Example BG: "СОФИЯ, СОФИЯ"
Example EN: "SOFIA, SOFIA"
Field Name BG: "Място на раждане/Place of birth"

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
2. PERMANENT ADDRESS (Постоянен адрес)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Format: Град, ул. [Street name] № [Number]
Example: "СОФИЯ, ул. ВИТОША № 1"
Field Name BG: "Адрес/Address"
Note: Official registered address (not current residence!)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
3. EYE COLOR (Цвят на очите)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Values BG: "КАФЯВ/СИН/ЗЕЛЕН/СИВ"
Values EN: "BROWN/BLUE/GREEN/GREY"
Field Name BG: "Цвят на очите/Eye colour"

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
4. MACHINE READABLE ZONE (MRZ)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Format: 2 lines, 30 characters each
Standard: ICAO 9303 (TD-1 format)

Line 1: IDBGR + Document Number + Check Digits + Filler
Line 2: Birth Date + Sex + Expiry + Nationality + Personal Number

Example:
IDBGR123456789<<<<<<<<<<<<<<<
9001151234BGR9001151234M301015

Encoding:
  ID: Document type
  BGR: Bulgaria (ISO 3166-1 alpha-3)
  <: Filler character
  M/F: Sex
  YYMMDD: Dates

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
5. SECURITY FEATURES
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
- Holographic elements
- UV-reactive inks
- Microtext
- Color-shifting inks
- Laser engraving
- RFID chip
- Optical Variable Device (OVD)
- Tactile elements
- Ghost image
- Guilloche patterns
```

---

## 🔐 **SECURITY FEATURES - مميزات الأمان**

```
1. RFID CHIP (Contactless)
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   Contains:
   - Photo (digitized)
   - Signature (digitized)
   - Fingerprints (2 fingers)
   - All text data
   - Issuing authority signature
   
   Technology: ISO 14443 Type B
   Encryption: 3DES/AES
   Access: Password protected

2. HOLOGRAM
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   Location: Front and back
   Elements:
   - Bulgarian coat of arms
   - "БЪЛГАРИЯ" text
   - Color-shifting effect
   - 3D depth effect

3. UV ELEMENTS
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   Visible under UV light:
   - Bulgarian flag colors (Green, White, Red)
   - Document number
   - Special patterns
   - Hidden text

4. LASER ENGRAVING
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   - All text data
   - Photo
   - Cannot be altered
   - Tactile surface

5. MICROTEXT
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   - Visible only with magnification
   - Repeating patterns
   - "BULGARIA" / "БЪЛГАРИЯ"

6. GUILLOCHE PATTERNS
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   - Complex geometric patterns
   - Anti-counterfeiting
   - Background design

7. OPTICALLY VARIABLE INK (OVI)
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   - Changes color with viewing angle
   - Green ↔ Purple shift
   - Used in specific elements

8. TACTILE FEATURES
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   - Raised text (for visually impaired)
   - Can be felt by touch
```

---

## 📊 **FIELD MAPPING FOR DATABASE**

### **Frontend Form Structure:**

```typescript
interface BulgarianIDCard {
  // Document Information
  documentNumber: string;        // 9 digits
  personalNumber: string;         // EGN - 10 digits
  documentType: 'ID_CARD';
  
  // Personal Information (Cyrillic)
  firstNameBG: string;           // Име
  middleNameBG: string;          // Презиме
  lastNameBG: string;            // Фамилия
  
  // Personal Information (Latin)
  firstNameEN: string;           // First name
  middleNameEN: string;          // Middle name
  lastNameEN: string;            // Last name
  
  // Personal Details
  nationality: 'Bulgarian';
  dateOfBirth: string;           // DD.MM.YYYY
  sex: 'M' | 'F';                // М/Ж
  height: number;                // cm
  
  // Document Validity
  issueDate: string;             // DD.MM.YYYY
  expiryDate: string;            // DD.MM.YYYY
  issuingAuthority: string;      // "София - МВР"
  
  // Additional Information (Back)
  placeOfBirth: string;          // "СОФИЯ, СОФИЯ"
  permanentAddress: string;      // Full address
  eyeColor: 'BROWN' | 'BLUE' | 'GREEN' | 'GREY';
  
  // Biometric Data
  photo: string;                 // Base64 or URL
  signature: string;             // Base64 or URL
  fingerprints?: string[];       // Optional (from chip)
  
  // Machine Readable Zone
  mrz: {
    line1: string;               // 30 chars
    line2: string;               // 30 chars
  };
  
  // Verification Status
  verified: boolean;
  verificationDate?: Date;
  verificationMethod?: 'MANUAL' | 'OCR' | 'CHIP_READ';
}
```

---

## 🔍 **OCR REQUIREMENTS - متطلبات القراءة البصرية**

```
For automated ID verification system:

1. IMAGE QUALITY
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   - Min resolution: 300 DPI
   - File format: JPG/PNG
   - Max size: 5MB
   - Clear lighting
   - No glare/reflections
   - Flat surface (not tilted)

2. OCR ZONES
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   Front:
   - Document number (top left)
   - EGN (below doc number)
   - Names (Cyrillic + Latin) - 2 zones
   - Date of birth
   - Sex
   - Height
   - Validity
   - Issuing authority
   
   Back:
   - Place of birth
   - Address (multi-line)
   - Eye color
   - MRZ (2 lines - critical!)

3. MRZ PARSING (Most Important!)
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   Line 1 breakdown:
   Pos 1-2:   "ID" (document type)
   Pos 3-5:   "BGR" (country)
   Pos 6-14:  Document number
   Pos 15-15: Check digit
   Pos 16-30: Filler ("<<<<")
   
   Line 2 breakdown:
   Pos 1-6:   Birth date (YYMMDD)
   Pos 7-7:   Check digit
   Pos 8-10:  Nationality (BGR)
   Pos 11-16: Expiry date (YYMMDD)
   Pos 17-17: Check digit
   Pos 18-18: Sex (M/F)
   Pos 19-27: Personal number (EGN without check)
   Pos 28-28: Check digit
   Pos 29-30: Filler

4. CHECK DIGIT ALGORITHM
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   Uses weighted sum modulo 10
   Weights: 7-3-1 pattern
   
   Example:
   Document: 123456789
   Weights:  731731731
   Products: 7+6+3+12+15+18+7+24+9 = 101
   Modulo:   101 % 10 = 1 (check digit)
```

---

## 🎯 **VALIDATION RULES**

```
1. EGN VALIDATION
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   function validateEGN(egn: string): boolean {
     if (egn.length !== 10) return false;
     if (!/^\d{10}$/.test(egn)) return false;
     
     // Extract date
     const year = parseInt(egn.substr(0, 2));
     const month = parseInt(egn.substr(2, 2));
     const day = parseInt(egn.substr(4, 2));
     
     // Adjust month for sex and century
     let actualMonth = month;
     if (month > 40) actualMonth -= 40;  // 1800s
     else if (month > 20) actualMonth -= 20;  // Female
     
     // Validate date
     if (actualMonth < 1 || actualMonth > 12) return false;
     if (day < 1 || day > 31) return false;
     
     // Check digit validation
     const weights = [2, 4, 8, 5, 10, 9, 7, 3, 6];
     let sum = 0;
     for (let i = 0; i < 9; i++) {
       sum += parseInt(egn[i]) * weights[i];
     }
     const checkDigit = sum % 11;
     const expectedCheck = checkDigit === 10 ? 0 : checkDigit;
     
     return parseInt(egn[9]) === expectedCheck;
   }

2. SEX FROM EGN
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   function getSexFromEGN(egn: string): 'M' | 'F' {
     const month = parseInt(egn.substr(2, 2));
     // Month 21-32 or 61-72 = Female
     // Month 01-12 or 41-52 = Male
     return (month > 20 && month <= 32) || (month > 60 && month <= 72) 
       ? 'F' 
       : 'M';
   }

3. BIRTHDATE FROM EGN
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   function getBirthDateFromEGN(egn: string): Date {
     let year = parseInt(egn.substr(0, 2));
     let month = parseInt(egn.substr(2, 2));
     const day = parseInt(egn.substr(4, 2));
     
     // Determine century from month
     if (month > 40) {
       year += 1800;
       month -= 40;
     } else if (month > 20) {
       year += 2000;
       month -= 20;
     } else {
       year += 1900;
     }
     
     return new Date(year, month - 1, day);
   }

4. MRZ CHECK DIGITS
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   function calculateMRZCheck(data: string): number {
     const weights = [7, 3, 1];
     let sum = 0;
     
     for (let i = 0; i < data.length; i++) {
       const char = data[i];
       let value = 0;
       
       if (char >= '0' && char <= '9') {
         value = parseInt(char);
       } else if (char >= 'A' && char <= 'Z') {
         value = char.charCodeAt(0) - 'A'.charCodeAt(0) + 10;
       } else if (char === '<') {
         value = 0;
       }
       
       sum += value * weights[i % 3];
     }
     
     return sum % 10;
   }
```

---

## 💻 **IMPLEMENTATION FOR GLOBUL CARS**

### **Verification Flow:**

```
┌─────────────────────────────────────────────────┐
│ User uploads ID photo                           │
└─────────────┬───────────────────────────────────┘
              │
              ▼
┌─────────────────────────────────────────────────┐
│ 1. Image Quality Check                          │
│    - Resolution OK? (min 300 DPI)               │
│    - File size OK? (max 5MB)                    │
│    - Format OK? (JPG/PNG)                       │
└─────────────┬───────────────────────────────────┘
              │ ✅ Pass
              ▼
┌─────────────────────────────────────────────────┐
│ 2. OCR Processing                               │
│    - Extract text zones                         │
│    - Read MRZ (machine zone)                    │
│    - Detect photo area                          │
│    - Read signature                             │
└─────────────┬───────────────────────────────────┘
              │ ✅ Data extracted
              ▼
┌─────────────────────────────────────────────────┐
│ 3. Data Validation                              │
│    - EGN check digit ✓                          │
│    - MRZ check digits ✓                         │
│    - Date format ✓                              │
│    - Cross-field consistency ✓                  │
│      (EGN date = Birth date?)                   │
│      (EGN sex = Sex field?)                     │
└─────────────┬───────────────────────────────────┘
              │ ✅ Valid
              ▼
┌─────────────────────────────────────────────────┐
│ 4. Security Verification (Optional)             │
│    - Hologram detection                         │
│    - MRZ font analysis                          │
│    - Document template match                    │
│    - Chip read (if available)                   │
└─────────────┬───────────────────────────────────┘
              │ ✅ Authentic
              ▼
┌─────────────────────────────────────────────────┐
│ 5. Save to Database                             │
│    - User profile verified ✓                    │
│    - Trust score +50 points                     │
│    - Verification badge unlocked                │
│    - Full name auto-filled                      │
│    - Date of birth saved                        │
└─────────────────────────────────────────────────┘
```

---

## 📱 **UI COMPONENT STRUCTURE**

### **ID Upload Component:**

```tsx
<IDVerificationUploader>
  
  {/* Step 1: Instructions */}
  <InstructionsCard>
    - Take photo of FRONT side
    - Clear lighting, no glare
    - All text readable
    - Photo button ↓
  </InstructionsCard>
  
  {/* Step 2: Front Upload */}
  <UploadZone side="front">
    [Drag & Drop or Click]
    Photo preview after upload
    ✓ Quality check (auto)
  </UploadZone>
  
  {/* Step 3: Back Upload */}
  <UploadZone side="back">
    [Drag & Drop or Click]
    Photo preview after upload
    ✓ Quality check (auto)
  </UploadZone>
  
  {/* Step 4: Review Extracted Data */}
  <DataReview>
    Fields auto-filled from OCR:
    - Names (BG + EN)
    - EGN
    - Date of Birth
    - Address
    - etc.
    
    [Edit if wrong] [Confirm if correct]
  </DataReview>
  
  {/* Step 5: Submit */}
  <SubmitButton>
    Verify Identity
  </SubmitButton>
  
</IDVerificationUploader>
```

---

## 🎨 **DESIGN RECOMMENDATIONS**

```
Colors:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
- Primary: #FF7900 (Globul Orange)
- Success: #16a34a (Verification green)
- ID card: #E8F4F8 (Light blue - matches real card)
- Text: #212529 (Dark gray)
- Border: #d0d7de (Light gray)

Layout:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
- Card-based design
- Step-by-step wizard
- Clear visual feedback
- Photo preview
- Real-time validation
- Progress indicator

Mobile:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
- Full-screen upload
- Camera capture option
- Touch-friendly
- Large buttons (48px min)
- Clear instructions
```

---

## 🔒 **PRIVACY & SECURITY**

```
Data Handling:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✅ Store only extracted text (not full image!)
✅ Encrypt sensitive fields (EGN, Address)
✅ Delete photos after verification
✅ Compliance with GDPR
✅ User consent required
✅ Audit log for access

Fields to Encrypt:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
- Personal ID Number (EGN) 🔒
- Full Address 🔒
- Phone Number 🔒
- Photo (if stored) 🔒

Fields Public (with consent):
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
- First + Last Name only
- City (not full address)
- Verification badge (yes/no)

Retention Period:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
- Verification status: Permanent
- Extracted data: 5 years (GDPR requirement)
- Photos: Delete after 30 days (or immediately)
- Audit logs: 2 years
```

---

## 📚 **EXISTING IMPLEMENTATION IN GLOBUL CARS**

```
Files Found:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✅ components/Profile/IDReferenceHelper.tsx
   - Visual guide for ID upload
   - Shows example ID card
   - Instructions in BG/EN

✅ services/verification/id-verification-service.ts
   - ID verification logic
   - OCR integration
   - Validation rules

✅ assets/images/ID_Back.png
   - Reference image (back)

✅ assets/ID_front (1).jpg
   - Reference image (front)

✅ assets/ID_Back.jpg
   - Reference image (back)

Status:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Partial implementation exists!
Need enhancements:
  - Better OCR accuracy
  - EGN validation
  - MRZ parsing
  - Security checks
```

---

## 🚀 **RECOMMENDED IMPROVEMENTS**

```
1. OCR Service Integration
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   Options:
   - Google Cloud Vision API (best accuracy)
   - AWS Textract (document-specific)
   - Azure Computer Vision (EU servers)
   - Tesseract.js (free, client-side)
   
   Recommendation: Google Cloud Vision
   Reason: 
   - Best Cyrillic support
   - MRZ recognition built-in
   - EU servers (GDPR compliant)

2. EGN Validation Library
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   Create: egn-validator.ts
   Features:
   - Check digit validation
   - Date extraction
   - Sex extraction
   - Age calculation
   - Zodiac sign (fun feature!)

3. MRZ Parser
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   Create: mrz-parser.ts
   Features:
   - 2-line parsing
   - Check digit validation
   - Error correction
   - Data extraction

4. Security Checks
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   - Template matching
   - Hologram detection (AI)
   - Document freshness check
   - Duplicate detection
```

---

## 📊 **SUMMARY**

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
BULGARIAN ID CARD STRUCTURE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Front (11 fields):
  1. Document Number (9 digits)
  2. Personal Number - EGN (10 digits) ⭐
  3. Names - Cyrillic
  4. Names - Latin
  5. Nationality (Bulgarian)
  6. Date of Birth (DD.MM.YYYY)
  7. Sex (M/F)
  8. Height (cm)
  9. Valid Until
  10. Issuing Authority
  11. Photo + Signature

Back (6+ elements):
  1. Place of Birth
  2. Permanent Address
  3. Eye Color
  4. MRZ (2 lines) ⭐
  5. Security features
  6. RFID chip data

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
CRITICAL FIELDS FOR VERIFICATION
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Must Extract:
  ⭐ EGN (validates everything!)
  ⭐ MRZ (machine verification)
  ⭐ Names (Cyrillic + Latin)
  ⭐ Date of Birth
  ⭐ Document Number

Must Validate:
  ⭐ EGN check digit
  ⭐ MRZ check digits (3 total)
  ⭐ Date consistency
  ⭐ Sex consistency
  ⭐ Document expiry

Must NOT Store (Privacy):
  🔒 Full Address (only city!)
  🔒 Full EGN (only birth date!)
  🔒 Photo (delete after verify!)
  🔒 Signature

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
SECURITY LEVEL: HIGH
GDPR COMPLIANCE: REQUIRED
OCR ACCURACY TARGET: 95%+
VERIFICATION TIME: < 30 seconds
```

---

**Created:** Oct 26, 2025 (10:15 PM)  
**Analysis:** ✅ Complete & Accurate  
**Purpose:** ID Verification System  
**Next:** Implement OCR + Validation  
**Status:** Ready for development! 🚀

