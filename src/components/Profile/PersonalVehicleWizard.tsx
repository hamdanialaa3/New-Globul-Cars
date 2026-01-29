// Personal Vehicle Wizard Component
// معالج خطوات إضافة المركبة الشخصية - 5 خطوات

import React, { useState, useCallback, useMemo } from 'react';
import styled, { keyframes } from 'styled-components';
import { Check, ArrowLeft, ArrowRight } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';
import { PersonalVehicle, PersonalVehicleFormData } from '../../types/personal-vehicle.types';
import BrandModelMarkdownDropdown from '../BrandModelMarkdownDropdown/BrandModelMarkdownDropdown';
import ColorPickerGrid from './ColorPickerGrid';
import PersonalVehicleForm from './PersonalVehicleForm';

interface PersonalVehicleWizardProps {
  userId: string;
  onComplete: (vehicle: PersonalVehicle) => void;
  onCancel: () => void;
}

const TOTAL_STEPS = 5;

// Animations
const slideInRight = keyframes`
  from {
    opacity: 0;
    transform: translateX(30px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
`;

const slideInLeft = keyframes`
  from {
    opacity: 0;
    transform: translateX(-30px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
`;

const checkmarkPop = keyframes`
  0% {
    transform: scale(0);
  }
  50% {
    transform: scale(1.2);
  }
  100% {
    transform: scale(1);
  }
`;

// Styled Components
const WizardContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2rem;
  min-height: 500px;
`;

const ProgressBar = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem 0;
  position: relative;
  
  &::before {
    content: '';
    position: absolute;
    top: 50%;
    left: 0;
    right: 0;
    height: 2px;
    background: var(--border);
    z-index: 0;
  }
`;

const ProgressLine = styled.div<{ $progress: number }>`
  position: absolute;
  top: 50%;
  left: 0;
  height: 2px;
  background: var(--accent-primary);
  width: ${props => props.$progress}%;
  transition: width 0.5s cubic-bezier(0.4, 0, 0.2, 1);
  z-index: 1;
`;

const ProgressStep = styled.div<{ $active: boolean; $completed: boolean }>`
  position: relative;
  z-index: 2;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: ${props => {
    if (props.$completed) return 'var(--accent-primary)';
    if (props.$active) return 'var(--accent-primary)';
    return 'var(--bg-card)';
  }};
  border: 3px solid ${props => {
    if (props.$completed || props.$active) return 'var(--accent-primary)';
    return 'var(--border)';
  }};
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${props => (props.$completed || props.$active) ? 'white' : 'var(--text-secondary)'};
  font-weight: 600;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  transform: ${props => props.$active ? 'scale(1.1)' : 'scale(1)'};
  box-shadow: ${props => props.$active 
    ? '0 0 0 3px rgba(59, 130, 246, 0.15)' 
    : 'none'};
  
  svg {
    animation: ${checkmarkPop} 0.4s cubic-bezier(0.68, -0.55, 0.265, 1.55);
  }
`;

const StepContent = styled.div<{ $direction: 'forward' | 'backward' }>`
  animation: ${props => props.$direction === 'forward' ? slideInRight : slideInLeft} 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94);
  min-height: 400px;
`;

const StepTitle = styled.h3`
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--text-primary);
  margin: 0 0 1rem 0;
  text-align: center;
`;

const NavigationButtons = styled.div`
  display: flex;
  justify-content: space-between;
  gap: 1rem;
  padding-top: 2rem;
  border-top: 1px solid var(--border);
`;

const Button = styled.button<{ $variant?: 'primary' | 'secondary' }>`
  padding: 0.875rem 1.75rem;
  border-radius: 12px;
  font-weight: 600;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  display: flex;
  align-items: center;
  gap: 0.5rem;
  border: none;
  
  ${props => props.$variant === 'primary' ? `
    background: var(--accent-primary);
    color: white;
    
    &:hover:not(:disabled) {
      background: var(--accent-hover);
      transform: translateY(-2px);
      box-shadow: 0 8px 24px rgba(59, 130, 246, 0.4);
    }
  ` : `
    background: var(--bg-card);
    color: var(--text-primary);
    border: 2px solid var(--border);
    
    &:hover:not(:disabled) {
      border-color: var(--accent-primary);
      background: var(--bg-hover);
    }
  `}
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
  
  &:active:not(:disabled) {
    transform: translateY(0);
  }
`;

const defaultFormData: PersonalVehicleFormData = {
  make: '',
  model: '',
  variant: '',
  registrationMonth: '',
  registrationYear: '',
  doors: '',
  fuelType: '',
  transmission: '',
  power: '',
  color: '',
  isMetallic: false,
  currentMileage: '',
  postalCode: '',
  isSoleUser: null,
};

export const PersonalVehicleWizard: React.FC<PersonalVehicleWizardProps> = ({
  userId,
  onComplete,
  onCancel,
}) => {
  const { language } = useLanguage();
  const [currentStep, setCurrentStep] = useState(0);
  const [direction, setDirection] = useState<'forward' | 'backward'>('forward');
  const [formData, setFormData] = useState<PersonalVehicleFormData>(defaultFormData);

  const updateFormData = useCallback((updates: Partial<PersonalVehicleFormData>) => {
    setFormData(prev => ({ ...prev, ...updates }));
  }, []);

  const canProceed = useMemo(() => {
    switch (currentStep) {
      case 0: // Brand & Model
        return !!(formData.make && formData.model);
      case 1: // Basic Details
        return !!(
          formData.registrationMonth &&
          formData.registrationYear &&
          formData.doors &&
          formData.fuelType &&
          formData.transmission &&
          formData.power
        );
      case 2: // Color
        return !!formData.color;
      case 3: // Purchase & Usage
        return !!(
          formData.currentMileage &&
          formData.postalCode &&
          formData.isSoleUser !== null
        );
      case 4: // Review
        return true;
      default:
        return false;
    }
  }, [currentStep, formData]);

  const handleNext = useCallback(() => {
    if (canProceed && currentStep < TOTAL_STEPS - 1) {
      setDirection('forward');
      setCurrentStep(prev => prev + 1);
    }
  }, [canProceed, currentStep]);

  const handleBack = useCallback(() => {
    if (currentStep > 0) {
      setDirection('backward');
      setCurrentStep(prev => prev - 1);
    }
  }, [currentStep]);

  const handleComplete = useCallback(() => {
    // Convert formData to PersonalVehicle
    const vehicle: PersonalVehicle = {
      id: '', // Will be generated by service
      userId,
      make: formData.make,
      model: formData.model,
      variant: formData.variant,
      firstRegistration: {
        month: parseInt(formData.registrationMonth),
        year: parseInt(formData.registrationYear),
      },
      doors: formData.doors as '2/3' | '4/5' | '6/7',
      fuelType: formData.fuelType as 'petrol' | 'diesel' | 'electric' | 'hybrid' | 'lpg',
      transmission: formData.transmission as 'manual' | 'automatic',
      power: {
        hp: parseInt(formData.power) || 0,
        kw: Math.round((parseInt(formData.power) || 0) * 0.7355),
      },
      exteriorColor: {
        name: formData.color,
        isMetallic: formData.isMetallic,
      },
      currentMileage: parseInt(formData.currentMileage) || 0,
      isSoleUser: formData.isSoleUser || false,
      postalCode: formData.postalCode,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    };

    if (formData.purchaseMonth && formData.purchaseYear) {
      vehicle.purchaseDate = {
        month: parseInt(formData.purchaseMonth),
        year: parseInt(formData.purchaseYear),
      };
    }

    if (formData.purchaseMileage) {
      vehicle.purchaseMileage = parseInt(formData.purchaseMileage);
    }

    if (formData.annualMileage) {
      vehicle.annualMileage = parseInt(formData.annualMileage);
    }

    if (formData.inspectionMonth && formData.inspectionYear) {
      vehicle.inspectionValidUntil = {
        month: parseInt(formData.inspectionMonth),
        year: parseInt(formData.inspectionYear),
      };
    }

    onComplete(vehicle);
  }, [formData, userId, onComplete]);

  const stepTitles = [
    language === 'bg' ? 'Марка и модел' : 'Brand & Model',
    language === 'bg' ? 'Основни детайли' : 'Basic Details',
    language === 'bg' ? 'Външен цвят' : 'Exterior Color',
    language === 'bg' ? 'Покупка и използване' : 'Purchase & Usage',
    language === 'bg' ? 'Преглед' : 'Review',
  ];

  const progress = ((currentStep + 1) / TOTAL_STEPS) * 100;

  return (
    <WizardContainer>
      <ProgressBar>
        <ProgressLine $progress={progress} />
        {Array.from({ length: TOTAL_STEPS }, (_, index) => (
          <ProgressStep
            key={index}
            $active={currentStep === index}
            $completed={currentStep > index}
          >
            {currentStep > index ? <Check size={20} /> : index + 1}
          </ProgressStep>
        ))}
      </ProgressBar>

      <StepContent $direction={direction}>
        <StepTitle>{stepTitles[currentStep]}</StepTitle>

        {currentStep === 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <BrandModelMarkdownDropdown
              brand={formData.make}
              model={formData.model}
              onBrandChange={(make) => updateFormData({ make, model: '' })}
              onModelChange={(model) => updateFormData({ model })}
            />
          </div>
        )}

        {currentStep === 1 && (
          <PersonalVehicleForm
            step="basic"
            formData={formData}
            onUpdate={updateFormData}
          />
        )}

        {currentStep === 2 && (
          <ColorPickerGrid
            selectedColor={formData.color}
            isMetallic={formData.isMetallic}
            onColorChange={(color) => updateFormData({ color })}
            onMetallicToggle={(isMetallic) => updateFormData({ isMetallic })}
          />
        )}

        {currentStep === 3 && (
          <PersonalVehicleForm
            step="usage"
            formData={formData}
            onUpdate={updateFormData}
          />
        )}

        {currentStep === 4 && (
          <PersonalVehicleForm
            step="review"
            formData={formData}
            onUpdate={updateFormData}
          />
        )}
      </StepContent>

      <NavigationButtons>
        <div>
          {currentStep > 0 && (
            <Button $variant="secondary" onClick={handleBack}>
              <ArrowLeft size={18} />
              {language === 'bg' ? 'Назад' : 'Back'}
            </Button>
          )}
        </div>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <Button $variant="secondary" onClick={onCancel}>
            {language === 'bg' ? 'Отказ' : 'Cancel'}
          </Button>
          {currentStep < TOTAL_STEPS - 1 ? (
            <Button $variant="primary" onClick={handleNext} disabled={!canProceed}>
              {language === 'bg' ? 'Напред' : 'Next'}
              <ArrowRight size={18} />
            </Button>
          ) : (
            <Button $variant="primary" onClick={handleComplete} disabled={!canProceed}>
              {language === 'bg' ? 'Запази' : 'Save'}
              <Check size={18} />
            </Button>
          )}
        </div>
      </NavigationButtons>
    </WizardContainer>
  );
};

export default PersonalVehicleWizard;
