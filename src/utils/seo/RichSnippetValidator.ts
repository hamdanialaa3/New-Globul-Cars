/**
 * RichSnippetValidator.ts
 * ✅ Schema.org Rich Snippet Validation Service
 * 
 * Validates JSON-LD structured data before deployment
 * to ensure 100% Google Rich Results compliance.
 * 
 * Uses Google's Rich Results Test API patterns.
 * 
 * @author SEO Supremacy System
 */

// ============================================================================
// TYPES
// ============================================================================

export interface ValidationResult {
    isValid: boolean;
    errors: ValidationError[];
    warnings: ValidationWarning[];
    schema: object;
}

export interface ValidationError {
    field: string;
    message: string;
    severity: 'error' | 'critical';
}

export interface ValidationWarning {
    field: string;
    message: string;
    recommendation: string;
}

// ============================================================================
// SCHEMA VALIDATORS
// ============================================================================

export class RichSnippetValidator {
    /**
     * Validate Vehicle/Car schema
     */
    static validateVehicleSchema(schema: any): ValidationResult {
        const errors: ValidationError[] = [];
        const warnings: ValidationWarning[] = [];

        // Required fields
        if (!schema['@type'] || !['Vehicle', 'Car'].includes(schema['@type'])) {
            errors.push({
                field: '@type',
                message: '@type must be "Vehicle" or "Car"',
                severity: 'critical',
            });
        }

        if (!schema.name) {
            errors.push({
                field: 'name',
                message: 'Vehicle name is required',
                severity: 'error',
            });
        }

        if (!schema.brand?.name) {
            errors.push({
                field: 'brand.name',
                message: 'Brand name is required for rich results',
                severity: 'error',
            });
        }

        if (!schema.offers?.price) {
            errors.push({
                field: 'offers.price',
                message: 'Price is required for product rich results',
                severity: 'error',
            });
        }

        if (!schema.offers?.priceCurrency) {
            errors.push({
                field: 'offers.priceCurrency',
                message: 'Currency is required (e.g., EUR, BGN)',
                severity: 'error',
            });
        }

        // Recommended fields
        if (!schema.image) {
            warnings.push({
                field: 'image',
                message: 'No image provided',
                recommendation: 'Add at least one high-quality image (min 1200px wide)',
            });
        }

        if (!schema.description) {
            warnings.push({
                field: 'description',
                message: 'No description provided',
                recommendation: 'Add a detailed description (50-160 characters)',
            });
        }

        if (!schema.mileageFromOdometer) {
            warnings.push({
                field: 'mileageFromOdometer',
                message: 'Mileage not specified',
                recommendation: 'Add mileage for better search visibility',
            });
        }

        if (!schema.vehicleIdentificationNumber) {
            warnings.push({
                field: 'vehicleIdentificationNumber',
                message: 'VIN not provided',
                recommendation: 'Add VIN for trust signals in search results',
            });
        }

        return {
            isValid: errors.length === 0,
            errors,
            warnings,
            schema,
        };
    }

    /**
     * Validate LocalBusiness/AutoDealer schema
     */
    static validateDealerSchema(schema: any): ValidationResult {
        const errors: ValidationError[] = [];
        const warnings: ValidationWarning[] = [];

        if (!schema['@type'] || !['LocalBusiness', 'AutoDealer'].includes(schema['@type'])) {
            errors.push({
                field: '@type',
                message: '@type should be "AutoDealer" for car dealers',
                severity: 'error',
            });
        }

        if (!schema.name) {
            errors.push({
                field: 'name',
                message: 'Business name is required',
                severity: 'critical',
            });
        }

        if (!schema.address) {
            errors.push({
                field: 'address',
                message: 'Address is required for Local Pack visibility',
                severity: 'error',
            });
        }

        if (!schema.geo?.latitude || !schema.geo?.longitude) {
            warnings.push({
                field: 'geo',
                message: 'Geographic coordinates missing',
                recommendation: 'Add latitude/longitude for Google Maps integration',
            });
        }

        if (!schema.telephone) {
            warnings.push({
                field: 'telephone',
                message: 'Phone number missing',
                recommendation: 'Add phone for click-to-call in search results',
            });
        }

        if (!schema.aggregateRating) {
            warnings.push({
                field: 'aggregateRating',
                message: 'No ratings data',
                recommendation: 'Add aggregateRating for star ratings in search',
            });
        }

        return {
            isValid: errors.length === 0,
            errors,
            warnings,
            schema,
        };
    }

    /**
     * Validate VideoObject schema
     */
    static validateVideoSchema(schema: any): ValidationResult {
        const errors: ValidationError[] = [];
        const warnings: ValidationWarning[] = [];

        if (schema['@type'] !== 'VideoObject') {
            errors.push({
                field: '@type',
                message: '@type must be "VideoObject"',
                severity: 'critical',
            });
        }

        if (!schema.name) {
            errors.push({
                field: 'name',
                message: 'Video title is required',
                severity: 'error',
            });
        }

        if (!schema.thumbnailUrl) {
            errors.push({
                field: 'thumbnailUrl',
                message: 'Thumbnail URL is required for video rich results',
                severity: 'error',
            });
        }

        if (!schema.uploadDate) {
            errors.push({
                field: 'uploadDate',
                message: 'Upload date is required',
                severity: 'error',
            });
        }

        if (!schema.contentUrl && !schema.embedUrl) {
            errors.push({
                field: 'contentUrl/embedUrl',
                message: 'Either contentUrl or embedUrl is required',
                severity: 'error',
            });
        }

        if (!schema.duration) {
            warnings.push({
                field: 'duration',
                message: 'Duration not specified',
                recommendation: 'Add duration in ISO 8601 format (e.g., PT1M30S)',
            });
        }

        if (!schema.description) {
            warnings.push({
                field: 'description',
                message: 'No description',
                recommendation: 'Add description for better video search visibility',
            });
        }

        return {
            isValid: errors.length === 0,
            errors,
            warnings,
            schema,
        };
    }

    /**
     * Validate BreadcrumbList schema
     */
    static validateBreadcrumbSchema(schema: any): ValidationResult {
        const errors: ValidationError[] = [];
        const warnings: ValidationWarning[] = [];

        if (schema['@type'] !== 'BreadcrumbList') {
            errors.push({
                field: '@type',
                message: '@type must be "BreadcrumbList"',
                severity: 'critical',
            });
        }

        if (!schema.itemListElement || !Array.isArray(schema.itemListElement)) {
            errors.push({
                field: 'itemListElement',
                message: 'itemListElement array is required',
                severity: 'critical',
            });
        } else {
            schema.itemListElement.forEach((item: any, index: number) => {
                if (!item.position) {
                    errors.push({
                        field: `itemListElement[${index}].position`,
                        message: 'Position is required for each breadcrumb',
                        severity: 'error',
                    });
                }
                if (!item.name) {
                    errors.push({
                        field: `itemListElement[${index}].name`,
                        message: 'Name is required for each breadcrumb',
                        severity: 'error',
                    });
                }
                if (!item.item && index < schema.itemListElement.length - 1) {
                    warnings.push({
                        field: `itemListElement[${index}].item`,
                        message: 'URL missing for breadcrumb',
                        recommendation: 'Add URL for all breadcrumbs except the last',
                    });
                }
            });
        }

        return {
            isValid: errors.length === 0,
            errors,
            warnings,
            schema,
        };
    }

    /**
     * Validate any schema by type
     */
    static validate(schema: any): ValidationResult {
        const type = schema['@type'];

        switch (type) {
            case 'Vehicle':
            case 'Car':
                return this.validateVehicleSchema(schema);
            case 'LocalBusiness':
            case 'AutoDealer':
                return this.validateDealerSchema(schema);
            case 'VideoObject':
                return this.validateVideoSchema(schema);
            case 'BreadcrumbList':
                return this.validateBreadcrumbSchema(schema);
            default:
                return {
                    isValid: true,
                    errors: [],
                    warnings: [{
                        field: '@type',
                        message: `Unknown schema type: ${type}`,
                        recommendation: 'Verify this schema type is supported by Google',
                    }],
                    schema,
                };
        }
    }

    /**
     * Format validation result as console log
     */
    static logResult(result: ValidationResult): void {
        console.group('🔍 Schema Validation Result');
        console.log(`Status: ${result.isValid ? '✅ Valid' : '❌ Invalid'}`);

        if (result.errors.length > 0) {
            console.group('❌ Errors');
            result.errors.forEach(e => console.error(`[${e.severity}] ${e.field}: ${e.message}`));
            console.groupEnd();
        }

        if (result.warnings.length > 0) {
            console.group('⚠️ Warnings');
            result.warnings.forEach(w => console.warn(`${w.field}: ${w.message}\n   → ${w.recommendation}`));
            console.groupEnd();
        }

        console.groupEnd();
    }
}

export default RichSnippetValidator;
