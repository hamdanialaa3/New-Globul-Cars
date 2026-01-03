
import { useMemo } from 'react';
import { UnifiedWorkflowData } from '../../../services/unified-workflow-persistence.service';

// Utility function to detect language from browser or context
const getLanguage = (): 'bg' | 'en' => {
  // Try to get from localStorage first (set by LanguageContext)
  const saved = localStorage.getItem('language');
  if (saved === 'bg' || saved === 'en') return saved;
  
  // Default to Bulgarian
  return 'bg';
};

/**
 * Validation hook for the Sell Vehicle Wizard.
 * Centralizes all validation logic per step.
 */
export const useWizardValidation = (currentStep: number, formData: Partial<UnifiedWorkflowData>) => {
    const lang = getLanguage();

    const validationResult = useMemo(() => {
        switch (currentStep) {
            case 1: // Vehicle Selection
                return {
                    isValid: !!formData.vehicleType,
                    error: !formData.vehicleType 
                        ? (lang === 'bg' ? 'Моля изберете тип на превозното средство' : 'Please select a vehicle type to continue')
                        : null
                };

            case 2: // Vehicle Data
                const hasBasicData = !!(formData.make && formData.model && formData.year);
                let error2 = null;
                if (!hasBasicData) {
                    const missing = [];
                    if (!formData.make) missing.push(lang === 'bg' ? 'Марка' : 'Make');
                    if (!formData.model) missing.push(lang === 'bg' ? 'Модел' : 'Model');
                    if (!formData.year) missing.push(lang === 'bg' ? 'Година' : 'Year');
                    error2 = lang === 'bg' 
                        ? `Моля попълнете: ${missing.join(', ')}` 
                        : `Please fill in: ${missing.join(', ')}`;
                }
                return {
                    isValid: hasBasicData,
                    error: error2
                };

            case 3: // Equipment / Extras
                return { isValid: true, error: null };

            case 4: // Images
                return { isValid: true, error: null };

            case 5: // Pricing
                return {
                    isValid: !!formData.price && formData.price > 0,
                    error: !formData.price 
                        ? (lang === 'bg' ? 'Моля въведете цена' : 'Please enter a price')
                        : formData.price <= 0 
                            ? (lang === 'bg' ? 'Цената трябва да бъде по-голяма от 0' : 'Price must be greater than 0')
                            : null
                };

            case 6: // Description (Optional)
                return { isValid: true, error: null };

            case 7: // Contact
                const missing7 = [];
                if (!formData.sellerName) missing7.push(lang === 'bg' ? 'Име' : 'Name');
                if (!formData.sellerEmail) missing7.push(lang === 'bg' ? 'Имейл' : 'Email');
                if (!formData.sellerPhone) missing7.push(lang === 'bg' ? 'Телефон' : 'Phone');
                if (!formData.region) missing7.push(lang === 'bg' ? 'Регион' : 'Region');
                if (!formData.city) missing7.push(lang === 'bg' ? 'Град' : 'City');
                
                const hasContact = missing7.length === 0;
                return {
                    isValid: hasContact,
                    error: !hasContact 
                        ? (lang === 'bg' 
                            ? `Моля попълнете: ${missing7.join(', ')}` 
                            : `Please fill in: ${missing7.join(', ')}`)
                        : null
                };

            default:
                return { isValid: true, error: null };
        }
    }, [currentStep, formData]);

    /**
     * Final Validation before Publish
     * Stricter checks than step navigation
     */
    const validateForPublish = (): { valid: boolean; errors: string[] } => {
        const errors: string[] = [];
        const lang = getLanguage();

        // Step 1: Vehicle Type
        if (!formData.vehicleType) errors.push(
            lang === 'bg' ? 'Стъпка 1: Типът превозно средство е задължителен' : 'Step 1: Vehicle type is required'
        );
        
        // Step 2: Vehicle Data
        if (!formData.make) errors.push(
            lang === 'bg' ? 'Стъпка 2: Марката е задължителна' : 'Step 2: Make is required'
        );
        if (!formData.model) errors.push(
            lang === 'bg' ? 'Стъпка 2: Моделът е задължителен' : 'Step 2: Model is required'
        );
        if (!formData.year) errors.push(
            lang === 'bg' ? 'Стъпка 2: Годината е задължителна' : 'Step 2: Year is required'
        );
        
        // Step 5: Pricing
        if (!formData.price) errors.push(
            lang === 'bg' ? 'Стъпка 5: Цената е задължителна' : 'Step 5: Price is required'
        );
        
        // Step 7: Contact & Location
        if (!formData.sellerPhone) errors.push(
            lang === 'bg' ? 'Стъпка 7: Телефонът е задължителен' : 'Step 7: Phone number is required'
        );
        if (!formData.city) errors.push(
            lang === 'bg' ? 'Стъпка 7: Градът е задължителен' : 'Step 7: City is required'
        );
        if (!formData.region) errors.push(
            lang === 'bg' ? 'Стъпка 7: Регионът е задължителен' : 'Step 7: Region is required'
        );
        if (!formData.sellerName) errors.push(
            lang === 'bg' ? 'Стъпка 7: Името е задължително' : 'Step 7: Seller name is required'
        );
        if (!formData.sellerEmail) errors.push(
            lang === 'bg' ? 'Стъпка 7: Имейлът е задължителен' : 'Step 7: Email is required'
        );

        // Log validation errors for debugging
        if (errors.length > 0) {
            console.warn('⚠️ Validation failed before publish:', {
                errorCount: errors.length,
                errors,
                formDataKeys: Object.keys(formData)
            });
        }

        return {
            valid: errors.length === 0,
            errors
        };
    };

    return {
        canProceed: validationResult.isValid,
        stepError: validationResult.error,
        validateForPublish
    };
};
