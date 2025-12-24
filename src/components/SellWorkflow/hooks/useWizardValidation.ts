
import { useMemo } from 'react';
import { UnifiedWorkflowData } from '../../../services/unified-workflow-persistence.service';

/**
 * Validation hook for the Sell Vehicle Wizard.
 * Centralizes all validation logic per step.
 */
export const useWizardValidation = (currentStep: number, formData: Partial<UnifiedWorkflowData>) => {

    const validationResult = useMemo(() => {
        switch (currentStep) {
            case 1: // Vehicle Selection (Assuming 1-based index to match UI usage, or we align with data 1-5??)
                // Wait, previous file used 0-based index for switch cases (0..5).
                // useWizardState uses 1-based default (useState(1)).
                // UnifiedWorkflowData interface comments say "Step 1: Vehicle Type".
                // Let's standardise on 1-BASED index for the hook to match useWizardState.

                // Step 1: Vehicle Type
                return {
                    isValid: !!formData.vehicleType,
                    error: !formData.vehicleType ? 'Please select a vehicle type' : null
                };

            case 2: // Vehicle Data
                // Needs make, model, year at minimum
                const hasBasicData = !!(formData.make && formData.model && formData.year);
                // Maybe check generation/variant if strictly required? For now match existing logic.
                return {
                    isValid: hasBasicData,
                    error: !hasBasicData ? 'Please fill in Make, Model and Year' : null
                };

            case 3: // Equipment / Extras
                // Usually optional, but maybe require at least one safety feature?
                // Existing code says "return true; // Optional"
                return { isValid: true, error: null };

            case 4: // Images
                // Existing code says "return true // Optional - images are saved in IndexedDB"
                // But usually we want at least 1 image for a valid listing?
                // Let's enforce 1 image if we can detect it, otherwise optional for draft.
                // For navigation 'Next', usually we allow proceeding without images, but preventing 'Publish'.
                // Let's keep it lenient for navigation.
                return { isValid: true, error: null };

            case 5: // Pricing
                return {
                    isValid: !!formData.price,
                    error: !formData.price ? 'Please enter a price' : null
                };

            case 6: // Description (Optional)
                // Description is optional - user can proceed with or without it
                return { isValid: true, error: null };

            case 7: // Contact
                const hasContact = !!(
                    formData.sellerName &&
                    formData.sellerEmail &&
                    formData.sellerPhone &&
                    formData.region && // Location data
                    formData.city
                );
                return {
                    isValid: hasContact,
                    error: !hasContact ? 'Please complete all contact and location fields' : null
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

        if (!formData.vehicleType) errors.push('Vehicle type is missing');
        if (!formData.make) errors.push('Make is missing');
        if (!formData.model) errors.push('Model is missing');
        if (!formData.year) errors.push('Year is missing');
        if (!formData.price) errors.push('Price is missing');
        if (!formData.sellerPhone) errors.push('Phone number is missing');
        if (!formData.city) errors.push('City is missing');

        // TODO: Add image check if we can access image count
        // if ((formData.imagesCount || 0) < 3) errors.push('At least 3 images are recommended');

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
