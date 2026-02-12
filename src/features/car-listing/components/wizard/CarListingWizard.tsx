// Car Listing Wizard - Parent Component with Code Splitting & Framer Motion
// معالج إضافة السيارة - المكون الرئيسي مع التقسيم والحركة
import React, { Suspense, lazy, useEffect } from 'react';
import { AnimatePresence } from 'framer-motion';
import styled from 'styled-components';
import { useLanguage } from '@/contexts/LanguageContext';
import { useCarListingStore } from '../../stores/car-listing-store';
import { WizardProgress } from './WizardProgress';
import { WizardNavigation } from './WizardNavigation';
import { StepTransition } from './StepTransition';
import { WizardLoadingFallback } from './WizardLoadingFallback';
import { toast } from 'react-toastify';
import { logger } from '@/services/logger-service';

// Lazy load step components for code splitting
const Step1VehicleType = lazy(() => import('../steps/Step1VehicleType').then(m => ({ default: m.Step1VehicleType })));
const Step2VehicleData = lazy(() => import('../steps/Step2VehicleData').then(m => ({ default: m.Step2VehicleData })));
const Step3Equipment = lazy(() => import('../steps/Step3Equipment').then(m => ({ default: m.Step3Equipment })));
const Step4Images = lazy(() => import('../steps/Step4Images').then(m => ({ default: m.Step4Images })));
const Step5Pricing = lazy(() => import('../steps/Step5Pricing').then(m => ({ default: m.Step5Pricing })));
const Step6Contact = lazy(() => import('../steps/Step6Contact').then(m => ({ default: m.Step6Contact })));

const TOTAL_STEPS = 6;

const WizardContainer = styled.div`
  display: flex;
  flex-direction: column;
  min-height: 100%;
  background: var(--bg-primary);
`;

const WizardContent = styled.div`
  flex: 1;
  padding: 2rem;
  max-width: 1200px;
  margin: 0 auto;
  width: 100%;
  
  @media (max-width: 768px) {
    padding: 1rem;
  }
`;

const StepContent = styled.div`
  position: relative;
  min-height: 400px;
  padding: 2rem 0;
`;

const ResetButton = styled.button`
  position: absolute;
  top: 1rem;
  right: 1rem;
  padding: 0.5rem 1rem;
  background: var(--bg-card);
  border: 2px solid var(--border);
  border-radius: 8px;
  color: var(--text-secondary);
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    border-color: var(--error);
    color: var(--error);
    background: rgba(239, 68, 68, 0.05);
  }
`;

interface CarListingWizardProps {
  initialStep?: number;
  initialVehicleType?: string;
  onComplete?: () => void;
  onCancel?: () => void;
}

export const CarListingWizard: React.FC<CarListingWizardProps> = ({
  initialStep = 0,
  initialVehicleType,
  onComplete,
  onCancel,
}) => {
  const { language } = useLanguage();
  const {
    currentStep,
    totalSteps,
    direction,
    setCurrentStep,
    goToNextStep,
    goToPreviousStep,
    validateStep,
    submitListing,
    reset,
    isSubmitting,
  } = useCarListingStore();

  // Initialize step from prop
  useEffect(() => {
    if (initialStep >= 0 && initialStep < TOTAL_STEPS) {
      setCurrentStep(initialStep);
    }
  }, [initialStep, setCurrentStep]);

  // Initialize vehicle type if provided
  useEffect(() => {
    if (initialVehicleType) {
      // This will be handled by Step1 component
    }
  }, [initialVehicleType]);

  // Step components mapping
  const stepComponents = [
    Step1VehicleType,
    Step2VehicleData,
    Step3Equipment,
    Step4Images,
    Step5Pricing,
    Step6Contact,
  ];

  const handleNext = async () => {
    // Validate current step
    const isValid = await validateStep(currentStep);
    
    if (!isValid) {
      const errorMessage = language === 'bg'
        ? 'Моля попълнете всички задължителни полета'
        : 'Please fill all required fields';
      toast.error(errorMessage);
      return;
    }

    if (currentStep < TOTAL_STEPS - 1) {
      goToNextStep();
    } else {
      // Last step - submit
      await handleSubmit();
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      goToPreviousStep();
    }
  };

  const handleSubmit = async () => {
    try {
      await submitListing();
      
      const successMessage = language === 'bg'
        ? 'Обявата е публикувана успешно!'
        : 'Listing published successfully!';
      toast.success(successMessage);
      
      if (onComplete) {
        onComplete();
      }
    } catch (error) {
      logger.error('Failed to submit listing', error as Error);
      const errorMessage = language === 'bg'
        ? 'Грешка при публикуване на обявата'
        : 'Error publishing listing';
      toast.error(errorMessage);
    }
  };

  const handleReset = () => {
    const confirmMessage = language === 'bg'
      ? 'Сигурни ли сте, че искате да изтриете всички данни?'
      : 'Are you sure you want to clear all data?';
    
    if (window.confirm(confirmMessage)) {
      reset();
      setCurrentStep(0);
      toast.info(language === 'bg' ? 'Данните са изчистени' : 'Data cleared');
    }
  };

  const canGoNext = currentStep < TOTAL_STEPS - 1;
  const canGoBack = currentStep > 0;
  const isLastStep = currentStep === TOTAL_STEPS - 1;

  const CurrentStepComponent = stepComponents[currentStep];

  return (
    <WizardContainer>
      <WizardContent>
        {/* Progress Bar */}
        <WizardProgress
          currentStep={currentStep}
          totalSteps={TOTAL_STEPS}
        />

        {/* Step Content with Animation */}
        <StepContent>
          <ResetButton onClick={handleReset}>
            {language === 'bg' ? 'Изчисти' : 'Reset'}
          </ResetButton>

          <AnimatePresence mode="wait" initial={false}>
            <Suspense fallback={<WizardLoadingFallback />}>
              <StepTransition direction={direction}>
                <CurrentStepComponent />
              </StepTransition>
            </Suspense>
          </AnimatePresence>
        </StepContent>

        {/* Navigation */}
        <WizardNavigation
          onNext={handleNext}
          onBack={handleBack}
          onCancel={onCancel}
          canGoNext={canGoNext}
          canGoBack={canGoBack}
          isSubmitting={isSubmitting}
          isLastStep={isLastStep}
        />
      </WizardContent>
    </WizardContainer>
  );
};

export default CarListingWizard;

