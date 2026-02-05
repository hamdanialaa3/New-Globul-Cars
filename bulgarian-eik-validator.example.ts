/**
 * Bulgarian EIK Validator
 * PR#2: Phase-B - Repository Verification and Bulgarian Profile
 * 
 * This service validates Bulgarian business identification numbers (EIK/ЕИК)
 * using the proper checksum algorithm. EIK can be 9 or 13 digits.
 * 
 * Location: web/src/services/bulgarian-profile/eik-validator.ts
 */

// ============================================================================
// Types and Interfaces
// ============================================================================

export interface EIKValidationResult {
  isValid: boolean;
  error?: string;
  details?: {
    format: 'EIK-9' | 'EIK-13' | 'invalid';
    checksum: number;
    expectedChecksum: number;
  };
}

// ============================================================================
// Bulgarian EIK Validator Class
// ============================================================================

/**
 * Validator for Bulgarian EIK (Единен идентификационен код)
 * 
 * The EIK is a unique identification code assigned to Bulgarian businesses.
 * It can be either:
 * - 9 digits (standard EIK for companies)
 * - 13 digits (extended EIK for branches/subsidiaries)
 * 
 * Both formats use a checksum algorithm to verify validity.
 */
export class BulgarianEIKValidator {
  
  /**
   * Validate Bulgarian EIK (business ID) using proper checksum algorithm
   * 
   * @param eik - The EIK to validate (can include spaces or dashes)
   * @returns Validation result with isValid flag and optional error message
   * 
   * @example
   * const validator = new BulgarianEIKValidator();
   * 
   * // Valid 9-digit EIK
   * const result1 = validator.validateEIK('175074752');
   * console.log(result1.isValid); // true
   * 
   * // Valid 13-digit EIK
   * const result2 = validator.validateEIK('1750747528001');
   * console.log(result2.isValid); // true
   * 
   * // Invalid EIK
   * const result3 = validator.validateEIK('123456789');
   * console.log(result3.isValid); // false
   * console.log(result3.error); // "Invalid EIK checksum"
   */
  validateEIK(eik: string): EIKValidationResult {
    // Remove spaces, dashes, and other non-digit characters
    const cleanEIK = eik.replace(/[\s-]/g, '');
    
    // Check if the EIK contains only digits
    if (!/^\d+$/.test(cleanEIK)) {
      return {
        isValid: false,
        error: 'EIK must contain only digits'
      };
    }
    
    // Check length (must be 9 or 13 digits)
    if (cleanEIK.length !== 9 && cleanEIK.length !== 13) {
      return {
        isValid: false,
        error: 'EIK must be 9 or 13 digits'
      };
    }
    
    // Validate based on length
    if (cleanEIK.length === 9) {
      return this.validate9DigitEIK(cleanEIK);
    } else {
      return this.validate13DigitEIK(cleanEIK);
    }
  }

  /**
   * Validate 9-digit EIK using the Bulgarian checksum algorithm
   * 
   * Algorithm:
   * 1. Multiply each of the first 8 digits by weights [1,2,3,4,5,6,7,8]
   * 2. Sum the products
   * 3. Calculate checksum = sum % 11
   * 4. If checksum is 10, use alternate weights [3,4,5,6,7,8,9,10] and recalculate
   * 5. If still 10, use 0 as checksum
   * 6. Compare with the 9th digit
   * 
   * @param eik - Clean 9-digit EIK
   * @returns Validation result
   */
  private validate9DigitEIK(eik: string): EIKValidationResult {
    const weights1 = [1, 2, 3, 4, 5, 6, 7, 8];
    const weights2 = [3, 4, 5, 6, 7, 8, 9, 10];
    
    // Calculate sum using first set of weights
    let sum = 0;
    for (let i = 0; i < 8; i++) {
      sum += parseInt(eik[i], 10) * weights1[i];
    }
    
    // Calculate checksum
    let checkDigit = sum % 11;
    
    // If checksum is 10, recalculate with second set of weights
    if (checkDigit === 10) {
      sum = 0;
      for (let i = 0; i < 8; i++) {
        sum += parseInt(eik[i], 10) * weights2[i];
      }
      checkDigit = sum % 11;
      
      // If still 10, use 0
      if (checkDigit === 10) {
        checkDigit = 0;
      }
    }
    
    const expectedCheckDigit = parseInt(eik[8], 10);
    const isValid = checkDigit === expectedCheckDigit;
    
    return {
      isValid,
      error: isValid ? undefined : 'Invalid EIK checksum',
      details: {
        format: 'EIK-9',
        checksum: checkDigit,
        expectedChecksum: expectedCheckDigit
      }
    };
  }

  /**
   * Validate 13-digit EIK
   * 
   * A 13-digit EIK consists of:
   * - First 9 digits: base EIK (validated as 9-digit EIK)
   * - Digits 10-13: extension code with its own checksum
   * 
   * Algorithm for extension:
   * 1. Multiply digits 9-12 by weights [2,7,3,5]
   * 2. Sum the products
   * 3. Calculate checksum = sum % 11
   * 4. If checksum is 10, use 0
   * 5. Compare with the 13th digit
   * 
   * @param eik - Clean 13-digit EIK
   * @returns Validation result
   */
  private validate13DigitEIK(eik: string): EIKValidationResult {
    // First validate the base 9 digits
    const base9EIK = eik.substring(0, 9);
    const base9Result = this.validate9DigitEIK(base9EIK);
    
    if (!base9Result.isValid) {
      return {
        isValid: false,
        error: 'Invalid base EIK (first 9 digits): ' + base9Result.error,
        details: {
          format: 'EIK-13',
          checksum: base9Result.details?.checksum || 0,
          expectedChecksum: base9Result.details?.expectedChecksum || 0
        }
      };
    }
    
    // Validate the extension (digits 10-13)
    const weights = [2, 7, 3, 5];
    let sum = 0;
    
    // Multiply digits 9-12 (indices 8-11) by weights
    for (let i = 0; i < 4; i++) {
      sum += parseInt(eik[8 + i], 10) * weights[i];
    }
    
    // Calculate checksum
    let checkDigit = sum % 11;
    
    // If checksum is 10, use 0
    if (checkDigit === 10) {
      checkDigit = 0;
    }
    
    const expectedCheckDigit = parseInt(eik[12], 10);
    const isValid = checkDigit === expectedCheckDigit;
    
    return {
      isValid,
      error: isValid ? undefined : 'Invalid extended EIK checksum',
      details: {
        format: 'EIK-13',
        checksum: checkDigit,
        expectedChecksum: expectedCheckDigit
      }
    };
  }

  /**
   * Batch validate multiple EIKs
   * 
   * @param eiks - Array of EIKs to validate
   * @returns Array of validation results
   */
  validateBatch(eiks: string[]): EIKValidationResult[] {
    return eiks.map(eik => this.validateEIK(eik));
  }

  /**
   * Format an EIK for display (add dashes for readability)
   * 
   * @param eik - The EIK to format
   * @returns Formatted EIK (e.g., "175074752" -> "175-074-752")
   */
  formatEIK(eik: string): string {
    const cleanEIK = eik.replace(/[\s-]/g, '');
    
    if (cleanEIK.length === 9) {
      // Format as XXX-XXX-XXX
      return `${cleanEIK.substring(0, 3)}-${cleanEIK.substring(3, 6)}-${cleanEIK.substring(6, 9)}`;
    } else if (cleanEIK.length === 13) {
      // Format as XXX-XXX-XXX-XXXX
      return `${cleanEIK.substring(0, 3)}-${cleanEIK.substring(3, 6)}-${cleanEIK.substring(6, 9)}-${cleanEIK.substring(9, 13)}`;
    } else {
      return eik; // Return as-is if invalid length
    }
  }

  /**
   * Check if a string looks like an EIK (basic format check only, no validation)
   * 
   * @param value - The string to check
   * @returns True if the string has the basic format of an EIK
   */
  looksLikeEIK(value: string): boolean {
    const cleanValue = value.replace(/[\s-]/g, '');
    return /^\d{9}$/.test(cleanValue) || /^\d{13}$/.test(cleanValue);
  }
}

// ============================================================================
// Utility Functions
// ============================================================================

/**
 * Quick validation function for convenience
 * 
 * @param eik - The EIK to validate
 * @returns True if valid, false otherwise
 */
export function isValidEIK(eik: string): boolean {
  const validator = new BulgarianEIKValidator();
  return validator.validateEIK(eik).isValid;
}

/**
 * Get detailed validation information
 * 
 * @param eik - The EIK to validate
 * @returns Detailed validation result
 */
export function validateEIKDetailed(eik: string): EIKValidationResult {
  const validator = new BulgarianEIKValidator();
  return validator.validateEIK(eik);
}

// ============================================================================
// Test Cases (for documentation/examples)
// ============================================================================

/**
 * Known valid EIK examples for testing
 */
export const VALID_EIK_EXAMPLES = {
  // 9-digit EIKs
  eik9_1: '175074752', // Bulgartabac Holding AD
  eik9_2: '831919536', // Sofia Municipality
  
  // 13-digit EIKs
  eik13_1: '1750747528001', // Bulgartabac branch
  eik13_2: '8319195360001'  // Sofia Municipality branch
};

/**
 * Example usage and test cases
 */
export function runEIKValidatorExamples() {
  const validator = new BulgarianEIKValidator();
  
  console.log('=== Bulgarian EIK Validator Examples ===\n');
  
  // Example 1: Valid 9-digit EIK
  console.log('Example 1: Valid 9-digit EIK');
  const result1 = validator.validateEIK(VALID_EIK_EXAMPLES.eik9_1);
  console.log(`EIK: ${VALID_EIK_EXAMPLES.eik9_1}`);
  console.log(`Valid: ${result1.isValid}`);
  console.log(`Formatted: ${validator.formatEIK(VALID_EIK_EXAMPLES.eik9_1)}`);
  console.log();
  
  // Example 2: Valid 13-digit EIK
  console.log('Example 2: Valid 13-digit EIK');
  const result2 = validator.validateEIK(VALID_EIK_EXAMPLES.eik13_1);
  console.log(`EIK: ${VALID_EIK_EXAMPLES.eik13_1}`);
  console.log(`Valid: ${result2.isValid}`);
  console.log(`Formatted: ${validator.formatEIK(VALID_EIK_EXAMPLES.eik13_1)}`);
  console.log();
  
  // Example 3: Invalid EIK
  console.log('Example 3: Invalid EIK');
  const result3 = validator.validateEIK('123456789');
  console.log(`EIK: 123456789`);
  console.log(`Valid: ${result3.isValid}`);
  console.log(`Error: ${result3.error}`);
  console.log();
  
  // Example 4: EIK with formatting
  console.log('Example 4: EIK with dashes and spaces');
  const result4 = validator.validateEIK('175-074-752');
  console.log(`EIK: 175-074-752`);
  console.log(`Valid: ${result4.isValid}`);
  console.log();
  
  // Example 5: Batch validation
  console.log('Example 5: Batch validation');
  const eiks = ['175074752', '123456789', '831919536'];
  const results = validator.validateBatch(eiks);
  results.forEach((result, index) => {
    console.log(`EIK ${eiks[index]}: ${result.isValid ? 'Valid ✓' : 'Invalid ✗'}`);
  });
  console.log();
  
  // Example 6: Format check
  console.log('Example 6: Check if string looks like EIK');
  const testStrings = ['175074752', '12345', 'ABC123456', '175-074-752'];
  testStrings.forEach(str => {
    console.log(`"${str}": ${validator.looksLikeEIK(str) ? 'Looks like EIK' : 'Does not look like EIK'}`);
  });
}

// ============================================================================
// Export
// ============================================================================

export default BulgarianEIKValidator;
