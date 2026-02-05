/**
 * Ad Publishing JSON Schema Validator
 * Enforces strict structure on AI generated vehicle descriptions.
 * 
 * إصلاح جذري: التحقق الحقيقي من المخرجات بدل placeholder
 */

import { 
  AdGenerationOutput, 
  AD_GENERATION_JSON_SCHEMA,
  SchemaValidationError 
} from '../schemas/ad-generation.schema';
import { logger } from '../../logger-service';

/**
 * Validate a value against JSON Schema rules
 */
function validateValue(
  value: unknown, 
  schema: Record<string, any>, 
  path: string
): SchemaValidationError[] {
  const errors: SchemaValidationError[] = [];

  // Type check
  if (schema.type) {
    const actualType = Array.isArray(value) ? 'array' : typeof value;
    if (schema.type === 'integer') {
      if (typeof value !== 'number' || !Number.isInteger(value)) {
        errors.push({ path, message: `Expected integer, got ${actualType}`, value });
      }
    } else if (actualType !== schema.type) {
      errors.push({ path, message: `Expected ${schema.type}, got ${actualType}`, value });
    }
  }

  // String validations
  if (typeof value === 'string') {
    if (schema.minLength && value.length < schema.minLength) {
      errors.push({ path, message: `String too short (min ${schema.minLength})`, value: value.length });
    }
    if (schema.maxLength && value.length > schema.maxLength) {
      errors.push({ path, message: `String too long (max ${schema.maxLength})`, value: value.length });
    }
    if (schema.pattern && !new RegExp(schema.pattern).test(value)) {
      errors.push({ path, message: `String doesn't match pattern: ${schema.pattern}`, value });
    }
    if (schema.enum && !schema.enum.includes(value)) {
      errors.push({ path, message: `Value must be one of: ${schema.enum.join(', ')}`, value });
    }
  }

  // Number validations
  if (typeof value === 'number') {
    if (schema.minimum !== undefined && value < schema.minimum) {
      errors.push({ path, message: `Value below minimum (${schema.minimum})`, value });
    }
    if (schema.maximum !== undefined && value > schema.maximum) {
      errors.push({ path, message: `Value above maximum (${schema.maximum})`, value });
    }
  }

  // Array validations
  if (Array.isArray(value)) {
    if (schema.minItems && value.length < schema.minItems) {
      errors.push({ path, message: `Array too short (min ${schema.minItems} items)`, value: value.length });
    }
    if (schema.maxItems && value.length > schema.maxItems) {
      errors.push({ path, message: `Array too long (max ${schema.maxItems} items)`, value: value.length });
    }
    if (schema.items) {
      value.forEach((item, index) => {
        errors.push(...validateValue(item, schema.items, `${path}[${index}]`));
      });
    }
  }

  // Object validations
  if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
    const obj = value as Record<string, unknown>;
    
    // Required properties
    if (schema.required) {
      for (const reqProp of schema.required) {
        if (!(reqProp in obj)) {
          errors.push({ path: `${path}.${reqProp}`, message: 'Required property missing' });
        }
      }
    }
    
    // Additional properties check
    if (schema.additionalProperties === false && schema.properties) {
      const allowedProps = Object.keys(schema.properties);
      for (const prop of Object.keys(obj)) {
        if (!allowedProps.includes(prop)) {
          errors.push({ path: `${path}.${prop}`, message: 'Unknown property not allowed' });
        }
      }
    }
    
    // Validate each property
    if (schema.properties) {
      for (const [propName, propSchema] of Object.entries(schema.properties)) {
        if (propName in obj) {
          errors.push(...validateValue(obj[propName], propSchema as Record<string, any>, `${path}.${propName}`));
        }
      }
    }
  }

  return errors;
}

/**
 * Main validation function
 * @returns Object with valid flag and detailed errors
 */
export function validateAdOutput(output: unknown): { 
  valid: boolean; 
  errors: SchemaValidationError[];
  sanitized?: AdGenerationOutput;
} {
  const startTime = Date.now();
  
  // Quick null/undefined check
  if (output === null || output === undefined) {
    return { 
      valid: false, 
      errors: [{ path: 'root', message: 'Output is null or undefined' }] 
    };
  }

  // Try to parse if string
  let parsed = output;
  if (typeof output === 'string') {
    try {
      parsed = JSON.parse(output);
    } catch {
      return { 
        valid: false, 
        errors: [{ path: 'root', message: 'Invalid JSON string' }] 
      };
    }
  }

  // Validate against schema
  const errors = validateValue(parsed, AD_GENERATION_JSON_SCHEMA, 'root');
  
  const processingTime = Date.now() - startTime;
  
  // Log validation result
  logger.info('Schema validation completed', {
    valid: errors.length === 0,
    errorCount: errors.length,
    processingTimeMs: processingTime
  });

  if (errors.length > 0) {
    logger.warn('Schema validation failed', { 
      errors: errors.slice(0, 5), // Log first 5 errors
      totalErrors: errors.length 
    });
    return { valid: false, errors };
  }

  return { 
    valid: true, 
    errors: [],
    sanitized: parsed as AdGenerationOutput
  };
}

/**
 * Quick validation - returns boolean only
 */
export function isValidAdOutput(output: unknown): output is AdGenerationOutput {
  return validateAdOutput(output).valid;
}

/**
 * Validate with auto-fix attempts for common issues
 */
export function validateAndFix(output: unknown): {
  valid: boolean;
  errors: SchemaValidationError[];
  fixed: boolean;
  result?: AdGenerationOutput;
} {
  // First try direct validation
  const initial = validateAdOutput(output);
  if (initial.valid) {
    return { valid: true, errors: [], fixed: false, result: initial.sanitized };
  }

  // Try auto-fixing common issues
  if (typeof output === 'object' && output !== null) {
    const obj = output as Record<string, any>;
    let modified = { ...obj };
    let fixed = false;

    // Fix: Add missing requestId
    if (!modified.requestId) {
      modified.requestId = `auto_${Date.now()}`;
      fixed = true;
    }

    // Fix: Add missing generatedAt
    if (!modified.generatedAt) {
      modified.generatedAt = new Date().toISOString();
      fixed = true;
    }

    // Fix: Ensure meta has retryCount
    if (modified.meta && modified.meta.retryCount === undefined) {
      modified.meta = { ...modified.meta, retryCount: 0 };
      fixed = true;
    }

    // Fix: Truncate strings that are too long
    if (modified.content?.title && modified.content.title.length > 80) {
      modified.content = { 
        ...modified.content, 
        title: modified.content.title.substring(0, 77) + '...' 
      };
      fixed = true;
    }

    if (modified.content?.shortDescription && modified.content.shortDescription.length > 160) {
      modified.content = { 
        ...modified.content, 
        shortDescription: modified.content.shortDescription.substring(0, 157) + '...' 
      };
      fixed = true;
    }

    // Re-validate after fixes
    if (fixed) {
      const afterFix = validateAdOutput(modified);
      if (afterFix.valid) {
        logger.info('Schema validation passed after auto-fix');
        return { valid: true, errors: [], fixed: true, result: afterFix.sanitized };
      }
      return { valid: false, errors: afterFix.errors, fixed: true };
    }
  }

  return { valid: false, errors: initial.errors, fixed: false };
}

// Re-export schema for external use
export { AD_GENERATION_JSON_SCHEMA as AD_JSON_SCHEMA };
export type { AdGenerationOutput as AdGenerationResult };

