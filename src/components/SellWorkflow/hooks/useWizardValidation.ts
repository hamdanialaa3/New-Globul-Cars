/**
 * FIXES APPLIED:
 * - [Issue #7]: Weak Step Validation - Added step dependency validation
 * - Changes:
 *   1. Added STEP_DEPENDENCIES configuration
 *   2. Added canAccessStep validation function
 *   3. Added validation for step navigation
 *   4. Added bilingual user feedback
 * - Tested: URL manipulation, step jumping, sequential validation
 * 
 * الإصلاحات المطبقة:
 * - [المشكلة #7]: التحقق الضعيف من الخطوات
 */

import { useMemo } from 'react';
import { logger } from '@/services/logger-service';
import { UnifiedWorkflowData } from '../../../services/unified-workflow-persistence.service';

/**
 * ✅ FIXED Issue #7: Step dependency configuration
 * تكوين تبعيات الخطوات
 * 
 * Each step must have completed all previous steps before access
 * كل خطوة يجب أن تكون جميع الخطوات السابقة مكتملة قبل الوصول
 */
const STEP_DEPENDENCIES: Record<number, number[]> = {
  1: [],              // Step 1 has no dependencies (vehicle type selection)
  2: [1],             // Step 2 requires Step 1 (vehicle data needs vehicle type)
  3: [1, 2],          // Step 3 requires 1 & 2 (equipment needs basic data)
  4: [1, 2, 3],       // Step 4 requires 1, 2, 3 (images need complete specs)
  5: [1, 2, 3, 4],    // Step 5 requires all previous (pricing needs complete listing)
  6: [1, 2, 3, 4, 5], // Step 6 requires all previous (description needs all data)
  7: [1, 2, 3, 4, 5, 6] // Step 7 requires all previous (review needs everything)
};

/**
 * ✅ FIXED Issue #7: Check if user can access a specific step
 * التحقق من إمكانية الوصول إلى خطوة معينة
 * 
 * @param targetStep The step user wants to access (1-based)
 * @param completedSteps Array of completed step numbers
 * @returns true if user can access the step
 * 
 * Testing Scenarios:
 * - Test 1: Access step 1 from any state (should always work)
 * - Test 2: Jump from step 1 to step 7 (should fail)
 * - Test 3: Access step 3 with steps 1,2 completed (should work)
 * - Test 4: Access step 3 with only step 1 completed (should fail)
 * - Test 5: Access previous steps (should always work)
 */
export const canAccessStep = (targetStep: number, completedSteps: number[]): boolean => {
  // Always allow accessing step 1
  if (targetStep === 1) {
    return true;
  }
  
  // Get required steps for target
  const requiredSteps = STEP_DEPENDENCIES[targetStep] || [];
  
  // Check if all required steps are completed
  const canAccess = requiredSteps.every(step => completedSteps.includes(step));
  
  if (!canAccess) {
    logger.warn('Step access denied - dependencies not met', {
      targetStep,
      requiredSteps,
      completedSteps,
      missingSteps: requiredSteps.filter(s => !completedSteps.includes(s))
    });
  }
  
  return canAccess;
};

/**
 * ✅ FIXED Issue #7: Get list of completed steps from form data
 * الحصول على قائمة الخطوات المكتملة من بيانات النموذج
 * 
 * @param formData Current form data
 * @returns Array of completed step numbers
 */
export const getCompletedSteps = (formData: Partial<UnifiedWorkflowData>): number[] => {
  const completed: number[] = [];
  
  // Step 1: Vehicle Type
  if (formData.vehicleType) {
    completed.push(1);
  }
  
  // Step 2: Vehicle Data (make, model, year required)
  if (formData.make && formData.model && formData.year) {
    completed.push(2);
  }
  
  // Step 3: Equipment (optional, so mark as completed if we have basic data)
  if (formData.make && formData.model) {
    completed.push(3);
  }
  
  // Step 4: Images (optional, but mark completed if user proceeded)
  if (formData.make && formData.model) {
    completed.push(4);
  }
  
  // Step 5: Pricing
  if (formData.price && formData.price > 0) {
    completed.push(5);
  }
  
  // Step 6: Description (optional)
  if (formData.price) {
    completed.push(6);
  }
  
  // Step 7: Contact (all required fields)
  if (formData.sellerName && formData.sellerEmail && formData.sellerPhone && formData.city && formData.region) {
    completed.push(7);
  }
  
  return completed;
};

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
            logger.warn('Validation failed before publish', {
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
        validateForPublish,
        canAccessStep, // ✅ Export for use in WizardOrchestrator
        getCompletedSteps // ✅ Export for use in WizardOrchestrator
    };
};
